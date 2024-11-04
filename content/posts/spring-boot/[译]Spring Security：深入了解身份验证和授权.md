---
title: "[译]Spring Security：深入了解身份验证和授权"
date: 2023-08-16
type: post
slug: spring-security-authentication-and-authorization
categories: ["spring-boot"]
tags: [spring-security]
---

您可以使用本指南来了解 Spring Security 是什么以及其核心功能（如身份验证、授权或常见漏洞保护）如何工作。此外，还有全面的常见问题解答。

（编者注：大约 6500 字，您可能不想尝试在移动设备上阅读本文。将其添加为书签，稍后再回来。）

## 介绍

迟早每个人都需要为其项目添加安全性，在 Spring 生态系统中，您可以借助 Spring Security 库来实现这一点。

因此，您继续将 Spring Security 添加到您的 Spring Boot（或普通 Spring）项目中，然后突然……​

- ...您有自动生成的登录页面。
- ...您无法再执行 POST 请求。
- ...​ 您的整个应用程序处于锁定状态，并提示您输入用户名和密码。

在经历了随后的精神崩溃之后，您可能会对这一切是如何运作的感兴趣。

### 什么是 Spring Security 以及它是如何工作的？

简短的回答：
从本质上讲，Spring Security 实际上只是一堆 servlet 过滤器，可帮助您向 Web 应用程序添加身份验证和授权。
它还与 Spring Web MVC（或 Spring Boot）等框架以及 OAuth2 或 SAML 等标准很好地集成。它会自动生成登录/注销页面并防止 CSRF 等常见漏洞。
现在，这并没有什么帮助，不是吗？
幸运的是，还有一个很长的答案：本文的其余部分。

## 网络应用程序安全：101

在成为 Spring Security 大师之前，您需要了解三个重要概念：

1. Authentication 验证
2. Authorization 授权
3. Servlet Filters 过滤器

建议：不要跳过本节，因为它是 Spring Security 所做的一切的基础。另外，我会让它尽可能有趣。

### 1. 认证

首先，如果您正在运行典型的（Web）应用程序，您需要用户进行身份验证。这意味着您的应用程序需要验证用户是否是他所声称的人，通常通过用户名和密码检查来完成。

用户：“我是美国总统。我的 `*username*` 是：potus！”
您的网络应用程序：“当然可以，那么您的 `*password*` 是什么，总统先生？”
用户：“我的密码是：th3don4ld”。
您的网络应用程序：“正确。欢迎，先生！”

### 2、授权

在更简单的应用程序中，身份验证可能就足够了：用户经过身份验证后，她就可以访问应用程序的每个部分。

但大多数应用程序都有权限（或角色）的概念。想象一下：可以访问您的网上商店面向公众的前端的客户，以及可以访问单独管理区域的管理员。

两种类型的用户都需要登录，但身份验证这一事实并不能说明他们可以在系统中执行哪些操作。因此，您还需要检查经过身份验证的用户的权限，即您需要授权该用户。

用户：“让我玩那个核足球......”。
您的网络应用程序：“等一下，我需要先检查您的 `*permissions*` ……是的，总统先生，您拥有正确的许可级别。尽情享受吧。”
用户：“那个红色按钮又是什么……​？”

### 3.Servlet 过滤器

最后但并非最不重要的一点是，让我们看一下 Servlet 过滤器。它们与身份验证和授权有什么关系？ （如果您对 Java Servlet 或 Filter 完全陌生，我建议您阅读旧的但仍然非常有效的 Head First Servlets 书。）

#### 为什么使用 Servlet 过滤器？

回想一下我的[另一篇文章](https://www.marcobehler.com/guides/spring-framework)，我们发现基本上任何 Spring Web 应用程序都只是一个 servlet：Spring 的旧式 [DispatcherServlet](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-servlet)，它将传入的 HTTP 请求（例如来自浏览器）重定向到 @Controllers 或 @RestControllers。
问题是：DispatcherServlet 中没有硬编码安全性，而且您也很可能不想在 @Controllers 中摸索原始 HTTP Basic Auth 标头。最佳情况下，身份验证和授权应该在请求到达 @Controller 之前完成。
幸运的是，在 Java Web 世界中有一种方法可以做到这一点：您可以将过滤器放在 servlet 前面，这意味着您可以考虑编写一个 SecurityFilter 并在 Tomcat（servlet 容器/应用程序服务器）中配置它来过滤每个传入的内容 HTTP 请求在到达您的 servlet 之前。

[![servletfilter 1a](https://www.marcobehler.com/images/servletfilter-1a.png)](https://www.marcobehler.com/images/servletfilter-1a.png)

#### 一个原生的安全过滤器

SecurityFilter 大约有 4 个任务，简单且过于简化的实现可能如下所示：

```java
import javax.servlet.*;
import javax.servlet.http.HttpFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class SecurityServletFilter extends HttpFilter {

    @Override
    protected void doFilter(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws IOException, ServletException {

        UsernamePasswordToken token = extractUsernameAndPasswordFrom(request);  // (1)

        if (notAuthenticated(token)) {  // (2)
            // either no or wrong username/password
            // unfortunately the HTTP status code is called "unauthorized", instead of "unauthenticated"
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // HTTP 401.
            return;
        }

        if (notAuthorized(token, request)) { // (3)
            // you are logged in, but don't have the proper rights
            response.setStatus(HttpServletResponse.SC_FORBIDDEN); // HTTP 403
            return;
        }

        // allow the HttpRequest to go to Spring's DispatcherServlet
        // and @RestControllers/@Controllers.
        chain.doFilter(request, response); // (4)
    }

    private UsernamePasswordToken extractUsernameAndPasswordFrom(HttpServletRequest request) {
        // Either try and read in a Basic Auth HTTP Header, which comes in the form of user:password
        // Or try and find form login request parameters or POST bodies, i.e. "username=me" & "password="myPass"
        return checkVariousLoginOptions(request);
    }


    private boolean notAuthenticated(UsernamePasswordToken token) {
        // compare the token with what you have in your database...or in-memory...or in LDAP...
        return false;
    }

    private boolean notAuthorized(UsernamePasswordToken token, HttpServletRequest request) {
       // check if currently authenticated user has the permission/role to access this request's /URI
       // e.g. /admin needs a ROLE_ADMIN , /callcenter needs ROLE_CALLCENTER, etc.
       return false;
    }
}
```

1.  首先，过滤器需要从请求中提取用户名/密码。它可以通过基本身份验证 HTTP 标头、表单字段或 cookie 等实现。
2.  然后，过滤器需要根据某些内容（例如数据库）验证用户名/密码组合。
3.  成功验证后，过滤器需要检查用户是否有权访问所请求的 URI。
4.  如果请求通过了所有这些检查，那么过滤器可以让请求传递到您的 DispatcherServlet，即您的 @Controller。

#### 过滤器链

现实检查：虽然上述代码可以编译，但它迟早会导致一个怪物过滤器，其中包含大量用于各种身份验证和授权机制的代码。

然而，在现实世界中，您可以将这个过滤器拆分为多个过滤器，然后将它们链接在一起。

例如，传入的 HTTP 请求将...​

1. 首先，通过 LoginMethodFilter...​
2. 然后，通过 AuthenticationFilter...​
3. 然后，通过授权过滤器...​
4. 最后，点击您的 servlet。

这个概念称为 FilterChain，上面过滤器中的最后一个方法调用实际上委托给了该链：

```java
chain.doFilter(request, response);
```

使用这样的过滤器（链），您基本上可以处理应用程序中存在的每个身份验证或授权问题，而无需更改实际的应用程序实现（想想：您的@RestControllers / @Controllers）。

有了这些知识，让我们看看 Spring Security 如何利用这种过滤魔法。

## FilterChain 和安全配置 DSL

我们将从 Spring Security 的 FilterChain 开始，以与上一章相反的方向开始介绍 Spring Security。

### Spring 的 DefaultSecurityFilterChain

假设您正确设置了 Spring Security，然后启动您的 Web 应用程序。您将看到以下日志消息：

```bash
2020-02-25 10:24:27.875  INFO 11116 --- [           main] o.s.s.web.DefaultSecurityFilterChain     : Creating filter chain: any request, [org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter@46320c9a, org.springframework.security.web.context.SecurityContextPersistenceFilter@4d98e41b, org.springframework.security.web.header.HeaderWriterFilter@52bd9a27, org.springframework.security.web.csrf.CsrfFilter@51c65a43, org.springframework.security.web.authentication.logout.LogoutFilter@124d26ba, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter@61e86192, org.springframework.security.web.authentication.ui.DefaultLoginPageGeneratingFilter@10980560, org.springframework.security.web.authentication.ui.DefaultLogoutPageGeneratingFilter@32256e68, org.springframework.security.web.authentication.www.BasicAuthenticationFilter@52d0f583, org.springframework.security.web.savedrequest.RequestCacheAwareFilter@5696c927, org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter@5f025000, org.springframework.security.web.authentication.AnonymousAuthenticationFilter@5e7abaf7, org.springframework.security.web.session.SessionManagementFilter@681c0ae6, org.springframework.security.web.access.ExceptionTranslationFilter@15639d09, org.springframework.security.web.access.intercept.FilterSecurityInterceptor@4f7be6c8]|
```

如果将这一行展开到列表中，看起来 Spring Security 不仅仅安装一个过滤器，而是安装由 15 个（！）不同过滤器组成的整个过滤器链。

因此，当 HTTPRequest 传入时，它将通过所有这 15 个过滤器，然后您的请求最终到达 @RestControllers。顺序也很重要，从列表的顶部开始一直到底部。

[![filterchain 1a](https://www.marcobehler.com/images/filterchain-1a.png)](https://www.marcobehler.com/images/filterchain-1a.png)

### 分析 Spring 的 FilterChain

详细查看该链中的每个过滤器就太过分了，但这里是对其中一些过滤器的解释。请随意查看 Spring Security 的源代码以了解其他过滤器。

- **BasicAuthenticationFilter**: 尝试在请求中查找基本身份验证 HTTP 标头，如果找到，则尝试使用标头的用户名和密码对用户进行身份验证。
- **UsernamePasswordAuthenticationFilter**: T 尝试查找用户名/密码请求参数/POST 正文，如果找到，则尝试使用这些值对用户进行身份验证。
- **DefaultLoginPageGeneratingFilter**: 如果您没有明确禁用该功能，则为您生成登录页面。这个过滤器就是您在启用 Spring Security 时获得默认登录页面的原因。
- **DefaultLogoutPageGeneratingFilter**: 如果您没有明确禁用该功能，则为您生成一个注销页面。
- **FilterSecurityInterceptor**: 是否经过您的授权。

因此，通过这两个过滤器，Spring Security 为您提供了一个登录/注销页面，以及使用基本身份验证或表单登录进行登录的能力，以及一些额外的好东西，例如 CsrfFilter，我们将有一个稍后再看。

中场休息：这些过滤器大部分是 Spring Security。不多也不少。他们做所有的工作。剩下的就是配置它们的工作方式，即要保护哪些 URL、要忽略哪些 URL 以及使用哪些数据库表进行身份验证。

因此，接下来我们需要看看如何配置 Spring Security。

### 如何配置 Spring Security：WebSecurityConfigurerAdapter

使用最新的 Spring Security 和/或 Spring Boot 版本，配置 Spring Security 的方法是使用一个类：

1. 使用@EnableWebSecurity 进行注释。
2. 扩展 WebSecurityConfigurer，它基本上为您提供配置 DSL/方法。使用这些方法，您可以指定应用程序中要保护的 URI 或要启用/禁用的漏洞利用保护。

典型的 WebSecurityConfigurerAdapter 如下所示：

```java
@Configuration
@EnableWebSecurity // (1)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter { // (1)

  @Override
  protected void configure(HttpSecurity http) throws Exception {  // (2)
      http
        .authorizeRequests()
          .antMatchers("/", "/home").permitAll() // (3)
          .anyRequest().authenticated() // (4)
          .and()
       .formLogin() // (5)
         .loginPage("/login") // (5)
         .permitAll()
         .and()
      .logout() // (6)
        .permitAll()
        .and()
      .httpBasic(); // (7)
  }
}
```

1. 带有 @EnableWebSecurity 注释的普通 Spring @Configuration，从 WebSecurityConfigurerAdapter 扩展。
2. 通过重写适配器的 configure(HttpSecurity)方法，您将获得一个漂亮的小 DSL，您可以用它来配置您的 FilterChain。
3. 所有发送至 `*/*` 和 `*/home*` 的请求均被允许（允许） - 用户无需进行身份验证。您正在使用 antMatcher，这意味着您还可以在字符串中使用通配符（\*、\*\*、?）。
4. 任何其他请求都需要首先对用户进行身份验证，即用户需要登录。
5. 您允许使用自定义登录页面（ `*/login*` ，即不是 Spring Security 自动生成的）进行表单登录（表单中的用户名/密码）。任何人都应该能够访问登录页面，而不必先登录（permitAll；否则我们就会遇到第 22 条军规！）。
6. 注销页面也是如此
7. 最重要的是，您还允许基本身份验证，即发送 HTTP 基本身份验证标头进行身份验证。

#### 如何使用 Spring Security 的配置 DSL

习惯该 DSL 需要一些时间，但您可以在常见问题解答部分找到更多示例：[AntMatchers：常见示例](https://www.marcobehler.com/guides/spring-security#security-examples)。

现在重要的是，您可以在这个 `*configure*` 方法中指定：

1.  要保护哪些 URL (authenticated()) 以及允许哪些 URL (permitAll())。
2.  允许哪些身份验证方法（formLogin()、httpBasic()）以及它们的配置方式。
3.  简而言之：您的应用程序的完整安全配置。

注意：您不需要立即覆盖适配器的配置方法，因为它带有一个非常合理的实现 - 默认情况下。它看起来是这样的：

```java
public abstract class WebSecurityConfigurerAdapter implements
		WebSecurityConfigurer<WebSecurity> {

    protected void configure(HttpSecurity http) throws Exception {
            http
                .authorizeRequests()
                    .anyRequest().authenticated()  // (1)
                    .and()
                .formLogin().and()   // (2)
                .httpBasic();  // (3)
        }
}
```

1. 要访问应用程序上的任何 URI ( `*anyRequest()*` )，您需要进行身份验证 (authenticated())。
2. 启用默认设置的表单登录 ( `*formLogin()*` )。
3. HTTP 基本身份验证 ( `*httpBasic()*` ) 也是如此。

此默认配置就是您的应用程序在添加 Spring Security 后立即处于锁定状态的原因。很简单，不是吗？

#### 总结：WebSecurityConfigurerAdapter 的 DSL 配置

我们了解到 Spring Security 由几个使用 WebSecurityConfigurerAdapter @Configuration 类配置的过滤器组成。

但缺少一个关键的部分。我们以 Spring 的 BasicAuthFilter 为例。它可以从 HTTP Basic Auth 标头中提取用户名/密码，但它根据什么来验证这些凭据呢？

这自然引出了我们的问题：身份验证如何与 Spring Security 一起工作。

## 使用 Spring Security 进行身份验证

当涉及到身份验证和 Spring Security 时，您大致会遇到三种情况：

1. 默认值：您可以访问用户的（散列）密码，因为您将他的详细信息（用户名、密码）保存在例如一个数据库表。
2. 不太常见：您无法访问用户的（散列）密码。如果您的用户和密码存储在其他地方（例如提供 REST 身份验证服务的第三方身份管理产品），就会出现这种情况。想想：Atlassian Crowd。
3. 也很受欢迎：您想使用 OAuth2 或“使用 Google/Twitter/等登录”。 (OpenID)，可能与 JWT 结合使用。那么以下内容都不适用，您应该直接进入 OAuth2 章节。

注意：根据您的场景，您需要指定不同的 @Bean 才能使 Spring Security 正常工作，否则您最终会得到非常混乱的异常（例如，如果您忘记指定 PasswordEncoder，则会出现 NullPointerException）。记住这一点。

让我们看一下最重要的两个场景。

### 1. UserDetailsService：获取用户密码

假设您有一个存储用户的数据库表。它有几列，但最重要的是它有一个用户名和密码列，您可以在其中存储用户的散列（！）密码。

```sql
create table users (id int auto_increment primary key, username varchar(255), password varchar(255));
```

在这种情况下，Spring Security 需要您定义两个 bean 来启动并运行身份验证。

1. 用户详细信息服务。
2. 密码编码器。

指定 UserDetailsS​​ervice 就这么简单：

```java
@Bean
public UserDetailsService userDetailsService() {
    return new MyDatabaseUserDetailsService(); // (1)
}
```

1.  MyDatabaseUserDetailsS​​ervice 实现了 UserDetailsS​​ervice，这是一个非常简单的接口，它由一个返回 UserDetails 对象的方法组成：

```java
public class MyDatabaseUserDetailsService implements UserDetailsService {

	UserDetails loadUserByUsername(String username) throws UsernameNotFoundException { // (1)
         // 1. Load the user from the users table by username. If not found, throw UsernameNotFoundException.
         // 2. Convert/wrap the user to a UserDetails object and return it.
        return someUserDetails;
    }
}

public interface UserDetails extends Serializable { // (2)

    String getUsername();

    String getPassword();

    // <3> more methods:
    // isAccountNonExpired,isAccountNonLocked,
    // isCredentialsNonExpired,isEnabled
}
```

1. UserDetailsS​​ervice 通过用户的用户名加载 UserDetails。请注意，该方法仅采用一个参数：用户名（而不是密码）。
2. UserDetails 接口具有获取（散列！）密码的方法和获取用户名的方法。
3. UserDetails 有更多方法，例如帐户处于活动状态还是被阻止、凭据是否已过期或用户拥有什么权限 - 但我们不会在这里介绍它们。

因此，您可以像我们上面那样自己实现这些接口，也可以使用 Spring Security 提供的现有接口。

#### 现成的实施

简单说明一下：您始终可以自己实现 UserDetailsS​​ervice 和 UserDetails 接口。

但是，您还会发现 Spring Security 提供的现成实现，您可以使用/配置/扩展/覆盖。

1. **JdbcUserDetailsManager**, 这是一个基于 JDBC（数据库）的 UserDetailsS​​ervice。您可以配置它以匹配您的用户表/列结构。
2. **InMemoryUserDetailsManager**, 它将所有用户详细信息保留在内存中，非常适合测试。
3. **org.springframework.security.core.userdetail.User**, 这是您可以使用的合理的默认 UserDetails 实现。这意味着实体/数据库表和此用户类之间可能存在映射/复制。或者，您可以简单地让您的实体实现 UserDetails 接口。

#### 完整的用户详细信息工作流程：HTTP 基本身份验证

现在回想一下您的 HTTP 基本身份验证，这意味着您正在使用 Spring Security 和基本身份验证来保护您的应用程序。当您指定 UserDetailsS​​ervice 并尝试登录时会发生以下情况：

1.  从过滤器中的 HTTP Basic Auth 标头中提取用户名/密码组合。您无需为此做任何事情，它会在幕后发生。
2.  调用 MyDatabaseUserDetailsS​​ervice 从数据库加载相应的用户，包装为 UserDetails 对象，该对象公开用户的哈希密码。
3.  从 HTTP Basic Auth 标头中获取提取的密码，自动对其进行哈希处理，并将其与 UserDetails 对象中的哈希密码进行比较。如果两者匹配，则用户身份验证成功。

这里的所有都是它的。但是等一下，Spring Security 如何对来自客户端的密码进行哈希处理（步骤 3）？用什么算法？

#### 密码编码器

Spring Security 无法神奇地猜测您首选的密码哈希算法。这就是为什么你需要指定另一个@Bean，一个 PasswordEncoder。例如，如果您想对所有密码使用 BCrypt 密码哈希函数（Spring Security 的默认值），则可以在 SecurityConfig 中指定此 @Bean。

```java
@Bean
public BCryptPasswordEncoder bCryptPasswordEncoder() {
    return new BCryptPasswordEncoder();
}
```

如果您有多种密码哈希算法，因为您有一些旧用户的密码是使用 MD5 存储的（不要这样做），而较新的用户则使用 Bcrypt 甚至是 SHA-256 等第三种算法，该怎么办？然后您将使用以下编码器：

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
}
```

这个委托编码器如何工作？它将查看 UserDetail 的哈希密码（来自例如您的数据库表），该密码现在必须以 `*{prefix}*` 开头。那个前缀，就是你的哈希方法！您的数据库表将如下所示：

| username 用户名                     | password 密码                                                                                                                                     |     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| [john@doe.com](mailto:john@doe.com) | {bcrypt}$2y$12$6t86Rpr3llMANhCUt26oUen2WhvXr/A89Xo9zJion8W7gWgZ/zA0C {bcrypt}$2y$12$6t86Rpr3llMANhCUt26oUen2WhvXr/A89Xo9zJion8W7gWgZ/zA0C         |     |
| [my@user.com](mailto:my@user.com)   | {sha256}5ffa39f5757a0dad5dfada519d02c6b71b61ab1df51b4ed1f3beed6abe0ff5f6 {sha256}5ffa39f5757a0dad5dfada519d02c6b71b61ab1df51b4ed1f3beed6abe0ff5f6 |     |

Spring Security 将：

1. 读入这些密码并去掉前缀（ {bcrypt} 或 {sha256} ）。
2. 根据前缀值，使用正确的密码编码器（即 BCryptEncoder 或 SHA256Encoder）
3. 使用该密码编码器对传入的原始密码进行哈希处理，并将其与存储的密码进行比较。

这就是密码编码器的全部内容。

#### 摘要：获取用户密码

本节的要点是：如果您使用 Spring Security 并有权访问用户的密码，那么：

1. 指定 UserDetailsS​​ervice。要么是自定义实现，要么使用并配置 Spring Security 提供的实现。
2. 指定密码编码器。
   简而言之，这就是 Spring Security 身份验证。

### 2. AuthenticationProvider：无权访问用户的密码

现在，假设您正在使用 Atlassian Crowd 进行集中身份管理。这意味着您所有应用程序的所有用户和密码都存储在 Atlassian Crowd 中，而不再存储在数据库表中。

这有两个含义：

1.  您的应用程序中不再有用户密码，因为您不能要求 Crowd 只提供这些密码。
2.  但是，您确实有一个 REST API，您可以使用您的用户名和密码登录。 （对 `*/rest/usermanagement/1/authentication*` REST 端点的 POST 请求）。

如果是这种情况，您不能再使用 UserDetailsS​​ervice，而是需要实现并提供 AuthenticationProvider @Bean。

```java
    @Bean
    public AuthenticationProvider authenticationProvider() {
        return new AtlassianCrowdAuthenticationProvider();
    }
```

AuthenticationProvider 主要包含一种方法，简单的实现可能如下所示：

```java
public class AtlassianCrowdAuthenticationProvider implements AuthenticationProvider {

        Authentication authenticate(Authentication authentication)  // (1)
                throws AuthenticationException {
            String username = authentication.getPrincipal().toString(); // (1)
            String password = authentication.getCredentials().toString(); // (1)

            User user = callAtlassianCrowdRestService(username, password); // (2)
            if (user == null) {                                     // (3)
                throw new AuthenticationException("could not login");
            }
            return new UserNamePasswordAuthenticationToken(user.getUsername(), user.getPassword(), user.getAuthorities()); // (4)
        }
	    // other method ignored
}
```

1. 与只能访问用户名的 UserDetails load() 方法相比，您现在可以访问完整的身份验证尝试，通常包含用户名和密码。
2. 您可以执行任何您想要验证用户身份的操作，例如调用 REST 服务。
3. 如果身份验证失败，则需要抛出异常。
4. 如果认证成功，需要返回一个完全初始化的 UsernamePasswordAuthenticationToken。它是 Authentication 接口的实现，需要将 authentiated 字段设置为 true（上面使用的构造函数会自动设置）。我们将在下一章介绍权威。

#### 完整的 AuthenticationProvider 工作流程：HTTP 基本身份验证

现在回想一下您的 HTTP 基本身份验证，这意味着您正在使用 Spring Security 和基本身份验证来保护您的应用程序。当您指定 AuthenticationProvider 并尝试登录时会发生以下情况：

1. 从过滤器中的 HTTP Basic Auth 标头中提取用户名/密码组合。您无需为此做任何事情，它会在幕后发生。
2. 使用该用户名和密码调用您的 AuthenticationProvider（例如 AtlassianCrowdAuthenticationProvider），以便您自己进行身份验证（例如 REST 调用）。

没有密码散列或类似的事情发生，因为您本质上是委托第三方进行实际的用户名/密码检查。简而言之，这就是 AuthenticationProvider 身份验证！

#### 摘要：身份验证提供者

本节的要点是：如果您使用 Spring Security 并且无权访问用户的密码，则实现并提供 AuthenticationProvider @Bean。

## Spring Security 授权

到目前为止，我们只讨论了身份验证，例如用户名和密码检查。

现在让我们看一下 Spring Security 中的权限，或者更确切地说是角色和权限。

### 什么是授权？

以典型的电子商务网上商店为例。它可能由以下几部分组成：

- 网上商店本身。我们假设它的 URL 是 `*www.youramazinshop.com*` 。
- 也许是呼叫中心代理的区域，他们可以登录并查看客户最近购买了什么或他们的包裹在哪里。它的 URL 可以是 `*www.youramazinshop.com/callcenter*` 。
- 一个单独的管理区域，管理员可以在其中登录和管理呼叫中心代理或网上商店的其他技术方面（如主题、性能等）。它的 URL 可以是 `*www.youramazinshop.com/admin*` 。

这具有以下含义，因为仅仅对用户进行身份验证已经不够了：

- 客户显然不应该能够访问呼叫中心或管理区域。他只被允许在网站上购物。
- 呼叫中心代理不应该能够访问管理区域。
- 而管理员可以访问网上商店、呼叫中心区域和管理区域。

简而言之，您希望根据不同的用户的权限或角色来允许不同的访问权限。

### 什么是权限？什么是角色？

简单的：

- 权限（最简单的形式）只是一个字符串，它可以是任何类似的内容：user、ADMIN、ROLE_ADMIN 或 53cr37_r0l3。
- 角色是具有 `*ROLE_*` 前缀的权限。因此，名为 `*ADMIN*` 的角色与名为 `*ROLE_ADMIN*` 的权限相同。

角色和权限之间的区别纯粹是概念性的，这常常让 Spring Security 的新手感到困惑。

### 为什么角色和权限之间有区别？

老实说，我已经阅读了 Spring Security 文档以及关于这个问题的几个相关 StackOverflow 线程，但我无法给你一个明确的、好的答案。

### 什么是授予权限？什么是 SimpleGrantedAuthorities？

当然，Spring Security 不会让你只使用字符串就可以逃脱惩罚。有一个 Java 类代表您的权限 String，一个流行的类是 SimpleGrantedAuthority。

```java
public final class SimpleGrantedAuthority implements GrantedAuthority {

	private final String role;

    @Override
	public String getAuthority() {
		return role;
	}
}
```

（注意：还有其他权限类，可以让您在字符串旁边存储其他对象（例如主体），我不会在这里介绍它们。现在，我们将仅使用 SimpleGrantedAuthority。）

### 1. UserDetailsService：在哪里存储和获取权限？

假设您将用户存储在自己的应用程序中（想想：UserDetailsS​​ervice），您将有一个 Users 表。

现在，您只需向其中添加一个名为“authorities”的列即可。对于本文，我在这里选择了一个简单的字符串列，尽管它可以包含多个以逗号分隔的值。或者，我也可以有一个完全独立的表 AUTHORITIES，但对于本文的范围来说，这样做就可以了。

注意：请参阅什么是权限？什么是角色？：您将权限（即字符串）保存到数据库中。碰巧这些权限以 ROLE\_ 前缀开头，因此，就 Spring Security 而言，这些权限也是角色。

| username 用户名                               | password 密码         | authorities 当局                |     |
| --------------------------------------------- | --------------------- | ------------------------------- | --- |
| [john@doe.com](mailto:john@doe.com)           | {bcrypt}… {bcrypt}... | ROLE*ADMIN ROLE*管理员          |     |
| [my@callcenter.com](mailto:my@callcenter.com) | {sha256}… {sha256}…   | ROLE_CALLCENTER ROLE_CALLCENTER |     |

剩下要做的唯一一件事就是调整您的 UserDetailsS​​ervice 以在该权限列中读取。

```java
public class MyDatabaseUserDetailsService implements UserDetailsService {

  UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
     User user = userDao.findByUsername(username);
     List<SimpleGrantedAuthority> grantedAuthorities = user.getAuthorities().map(authority -> new SimpleGrantedAuthority(authority)).collect(Collectors.toList()); // (1)
     return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(), grantedAuthorities); // (2)
  }

}
```

1.  您只需将数据库列中的任何内容映射到 SimpleGrantedAuthorities 列表即可。完毕。
2.  同样，我们在这里使用 Spring Security 的 UserDetails 基本实现。您还可以在此处使用自己的类实现 UserDetails，甚至可能不需要映射。

### 2. AuthenticationManager：在哪里存储和获取权限？

当用户来自第三方应用程序（例如 Atlassian Cloud）时，您需要找出他们使用什么概念来支持当局。 Atlassian Crowd 有“角色”的概念，但不赞成使用“组”。

因此，根据您使用的实际产品，您需要将其映射到 AuthenticationProvider 中的 Spring Security 权限。

```java
public class AtlassianCrowdAuthenticationProvider implements AuthenticationProvider {

    Authentication authenticate(Authentication authentication)
            throws AuthenticationException {
        String username = authentication.getPrincipal().toString();
        String password = authentication.getCredentials().toString();

        atlassian.crowd.User user = callAtlassianCrowdRestService(username, password); // (1)
        if (user == null) {
            throw new AuthenticationException("could not login");
        }
        return new UserNamePasswordAuthenticationToken(user.getUsername(), user.getPassword(), mapToAuthorities(user.getGroups())); // (2)
    }
	    // other method ignored
}
```

1.  注意：这不是实际的 Atlassian Crowd 代码，但达到了其目的。您针对 REST 服务进行身份验证并获取 JSON User 对象，然后该对象将转换为 atlassian.crowd.User 对象。
2.  该用户可以是一个或多个组的成员，此处假定这些组只是字符串。然后，您可以简单地将这些组映射到 Spring 的“SimpleGrantedAuthority”。

### 重新审视 WebSecurityConfigurerAdapter

到目前为止，我们讨论了很多有关在 Spring Security 中存储和检索经过身份验证的用户的权限的内容。但是如何使用 Spring Security 的 DSL 保护具有不同权限的 URL？简单的：

```java
@Configuration
@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

	@Override
	protected void configure(HttpSecurity http) throws Exception {
        http
          .authorizeRequests()
            .antMatchers("/admin").hasAuthority("ROLE_ADMIN") // (1)
            .antMatchers("/callcenter").hasAnyAuthority("ROLE_ADMIN", "ROLE_CALLCENTER") // (2)
            .anyRequest().authenticated() // (3)
            .and()
         .formLogin()
           .and()
         .httpBasic();
	}
}
```

1. 要访问 `*/admin*` 区域，您（即用户）需要经过身份验证并拥有权限（一个简单的字符串）ROLE_ADMIN。
2. 要访问 `*/callcenter*` 区域，您需要经过身份验证并拥有权限 ROLE_ADMIN 或 ROLE_CALLCENTER。
3. 对于任何其他请求，您不需要特定角色，但仍需要进行身份验证。

请注意，上面的代码 (1,2) 等效于以下内容：

```java
  http
    .authorizeRequests()
      .antMatchers("/admin").hasRole("ADMIN") // (1)
      .antMatchers("/callcenter").hasAnyRole("ADMIN", "CALLCENTER") // (2)
```

1.  现在，您不再调用“hasAuthority”，而是调用“hasRole”。注意：Spring Security 将在经过身份验证的用户上查找名为 `*ROLE_ADMIN*` 的权限。
2.  现在，您不再调用“hasAnyAuthority”，而是调用“hasAnyRole”。注意：Spring Security 将在经过身份验证的用户上查找名为 `*ROLE_ADMIN*` 或 `*ROLE_CALLCENTER*` 的权限。

### hasAccess 和 SpEL

最后但并非最不重要的一点是，配置授权的最强大方法是使用访问方法。它允许您指定几乎任何有效的 SpEL 表达式。

```java
  http
    .authorizeRequests()
      .antMatchers("/admin").access("hasRole('admin') and hasIpAddress('192.168.1.0/24') and @myCustomBean.checkAccess(authentication,request)") // (1)
```

1. 您正在检查用户是否具有 ROLE_ADMIN、特定的 IP 地址以及自定义 bean 检查。

要全面了解 Spring 基于表达式的访问控制的功能，请查看[官方文档](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#el-access)。

## 常见漏洞保护

Spring Security 可以帮助您防范多种常见攻击。它从计时攻击开始（即 Spring Security 始终会在登录时对提供的密码进行哈希处理，即使用户不存在），最终提供针对缓存控制攻击、内容嗅探、点击劫持、跨站点脚本等的保护。

在本指南的范围内不可能详细介绍每种攻击。因此，我们只会关注一种最让大多数 Spring Security 新手望而却步的保护措施：跨站点请求伪造。

### 跨站请求伪造：CSRF

如果您对 CSRF 完全陌生，您可能需要观看此 YouTube 视频来快速了解它。然而，快速的结论是，默认情况下 Spring Security 使用有效的 CSRF 令牌保护任何传入的 POST（或 PUT/DELETE/PATCH）请求。

这意味着什么？

#### CSRF 和服务器端渲染的 HTML

想象一下银行转账表单或任何表单（如登录表单），这些表单是由 @Controller 借助 Thymeleaf 或 Freemarker 等模板技术呈现的。

```html
<form action="/transfer" method="post">
  <!-- 1 -->
  <input type="text" name="amount" />
  <input type="text" name="routingNumber" />
  <input type="text" name="account" />
  <input type="submit" value="Transfer" />
</form>
```

启用 Spring Security 后，您将无法再提交该表单。因为 Spring Security 的 CSRFFilter 正在任何 POST (PUT/DELETE) 请求上寻找额外的隐藏参数：所谓的 CSRF 令牌。

默认情况下，它会为每个 HTTP 会话生成这样的令牌并将其存储在那里。您需要确保将其注入到您的任何 HTML 表单中。

#### CSRF 令牌和 Thymeleaf

由于 Thymeleaf 与 Spring Security 具有良好的集成（当与 Spring Boot 一起使用时），您只需将以下代码片段添加到任何表单中，您就可以将令牌从会话中自动注入到您的表单中。更好的是，如果您在表单中使用“th:action”，Thymeleaf 会自动为您注入该隐藏字段，而无需手动执行。

```html
<form action="/transfer" method="post">
  <!-- 1 -->
  <input type="text" name="amount" />
  <input type="text" name="routingNumber" />
  <input type="text" name="account" />
  <input type="submit" value="Transfer" />
  <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />
</form>

<!-- OR -->

<form th:action="/transfer" method="post">
  <!-- 2 -->
  <input type="text" name="amount" />
  <input type="text" name="routingNumber" />
  <input type="text" name="account" />
  <input type="submit" value="Transfer" />
</form>
```

1. 在这里，我们手动添加 CSRF 参数。
2. 在这里，我们使用 Thymeleaf 的表单支持。

注意：有关 Thymeleaf 的 CSRF 支持的更多信息，请参阅[官方文档](https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html)。

#### CSRF 和其他模板库

我无法涵盖本节中的所有模板库，但作为最后的手段，您始终可以将 CSRFToken 注入到任何 @Controller 方法中，然后将其简单地添加到模型中以在视图中呈现它或直接作为 HttpServletRequest 请求属性访问它。

```java
@Controller
public class MyController {
    @GetMaping("/login")
    public String login(Model model, CsrfToken token) {
        // the token will be injected automatically
        return "/templates/login";
    }
}
```

#### CSRF 和 React 或 Angular

对于 Javascript 应用程序来说，情况有些不同，例如 React 或 Angular 单页应用程序。您需要执行以下操作：

1. 配置 Spring Security 以使用 CookieCsrfTokenRepository，它将把 CSRFToken 放入 cookie“XSRF-TOKEN”（并将其发送到浏览器）。
2. 让您的 Javascript 应用程序采用该 cookie 值，并将其作为“X-XSRF-TOKEN”标头与每个 POST(/PUT/PATCH/DELETE) 请求一起发送。

有关完整的复制粘贴 React 示例，请查看这篇精彩的博客文章：https://developer.okta.com/blog/2018/07/19/simple-crud-react-and-spring-boot。

#### 禁用 CSRF

如果您仅提供无状态 REST API，其中 CSRF 保护没有任何意义，您将完全禁用 CSRF 保护。您将这样做：

```java
@EnableWebSecurity
@Configuration
public class WebSecurityConfig extends
   WebSecurityConfigurerAdapter {

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
      .csrf().disable();
  }
}
```

## OAuth2

Spring Security 的 OAuth2 集成是一个复杂的主题，另外 7,000 字就足够了，这不属于本文的范围。

## Spring 集成

### Spring Security & Spring Framework

在本文的大部分内容中，您仅在应用程序的 Web 层上指定了安全配置。您使用 antMatcher 或 regexMatchers 以及 WebSecurityConfigurerAdapter 的 DSL 来保护某些 URL。这是一种完美且标准的安全方法。

除了保护您的网络层之外，还有“纵深防御”的想法。这意味着除了保护 URL 之外，您可能还想保护业务逻辑本身。想想：你的@Controllers、@Components、@Services 甚至@Repositories。简而言之，就是您的 Spring beans。

### 方法安全性

该方法称为 `*method security*` 并通过注释工作，您基本上可以将这些注释放在 Spring bean 的任何公共方法上。您还需要通过在 ApplicationContextConfiguration 上放置 @EnableGlobalMethodSecurity 注释来显式启用方法安全性。

```java
@Configuration
@EnableGlobalMethodSecurity(
  prePostEnabled = true, // (1)
  securedEnabled = true, // (2)
  jsr250Enabled = true) // (3)
public class YourSecurityConfig extends WebSecurityConfigurerAdapter{
}
```

1. prePostEnabled 属性启用对 Spring 的 `*@PreAuthorize*` 和 `*@PostAuthorize*` 注释的支持。支持意味着，除非您将标志设置为 true，否则 Spring 将忽略此注释。
2. secureEnabled 属性启用对 `*@Secured*` 注释的支持。支持意味着，除非您将标志设置为 true，否则 Spring 将忽略此注释。
3. jsr250Enabled 属性启用对 `*@RolesAllowed*` 注释的支持。支持意味着，除非您将标志设置为 true，否则 Spring 将忽略此注释。

### @PreAuthorize、@Secured 和 @RolesAllowed 之间有什么区别？

@Secured 和 @RolesAllowed 基本上是相同的，尽管 @Secured 是 Spring 特定的注释，带有 spring-security-core 依赖项，而 @RolesAllowed 是一个标准化注释，存在于 javax.annotation-api 依赖项中。两个注释都采用权限/角色字符串作为值。

@PreAuthorize/@PostAuthorize 也是（较新的）Spring 特定注释，并且比上述注释更强大，因为它们不仅可以包含权限/角色，还可以包含任何有效的 SpEL 表达式。

最后，如果您尝试使用权限/角色不足访问受保护的方法，所有这些注释都会引发 `*AccessDeniedException*` 。

那么，让我们最终看看这些注释的实际效果。

```java
@Service
public class SomeService {

    @Secured("ROLE_CALLCENTER") // (1)
    // == @RolesAllowed("ADMIN")
    public BankAccountInfo get(...) {

    }

    @PreAuthorize("isAnonymous()") // (2)
    // @PreAuthorize("#contact.name == principal.name")
    // @PreAuthorize("ROLE_ADMIN")
    public void trackVisit(Long id);

    }
}
```

1.  如前所述，@Secured 将权限/角色作为参数。 @RolesAllowed，同样。注意：请记住 `*@RolesAllowed("ADMIN")*` 将检查授予的权限 `*ROLE_ADMIN*` 。
2.  如前所述，@PreAuthorize 接受权限，但也接受任何有效的 SpEL 表达式。有关常见内置安全表达式（如上面的 `*isAnonymous()*` ）的列表，而不是编写您自己的 SpEL 表达式，请查看官方文档。

### 我应该使用哪个注释？

这主要是同质性问题，而不是将自己过多地束缚于 Spring 特定的 API（这是一个经常提出的论点）。

如果使用 @Secured，请坚持下去，不要在 28% 的其他 bean 中使用 @RolesAllowed 注释来努力标准化，但永远不会完全实现。

首先，您始终可以使用 @Secured 并在需要时立即切换到 @PreAuthorize。

### Spring Security 和 Spring Web MVC

至于与 Spring WebMVC 的集成，Spring Security 允许您执行以下操作：

1.  除了 antMatchers 和 regexMatchers 之外，您还可以使用 mvcMatchers。不同之处在于，虽然 antMatchers 和 regexMatchers 基本上使用通配符匹配 URI 字符串，但 mvcMatchers 的行为与 @RequestMappings 完全相同。
2.  将当前经过身份验证的主体注入到 @Controller/@RestController 方法中。
3.  将当前会话 CSRFToken 注入到 @Controller/@RestController 方法中。
4.  正确处理异步请求处理的安全性。

```java
@Controller
public class MyController {

    @RequestMapping("/messages/inbox")
    public ModelAndView findMessagesForUser(@AuthenticationPrincipal CustomUser customUser, CsrfToken token) {  // (1) (2)

    // .. find messages for this user and return them ...
    }
}
```

1. 如果用户经过身份验证，@AuthenticationPrincipal 将注入主体；如果没有用户经过身份验证，则 @AuthenticationPrincipal 将注入 null。该主体是来自 UserDetailsS​​ervice/AuthenticationManager 的对象！
2. 或者您可以将当前会话 CSRFToken 注入每个方法中。

如果您不使用 @AuthenticationPrincipal 注释，则必须通过 SecurityContextHolder 自行获取主体。这是一种在遗留 Spring Security 应用程序中常见的技术。

```java
@Controller
public class MyController {

    @RequestMapping("/messages/inbox")
    public ModelAndView findMessagesForUser(CsrfToken token) {
         SecurityContext context = SecurityContextHolder.getContext();
         Authentication authentication = context.getAuthentication();

         if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
             CustomUser customUser = (CustomUser) authentication.getPrincipal();
             // .. find messages for this user and return them ...
         }

         // todo
    }
}
```

### Spring Security & Spring Boot

每当您将 spring-boot-starter-security 依赖项添加到 Spring Boot 项目时，Spring Boot 实际上只会为您预先配置 Spring Security。

除此之外，所有安全配置都是通过简单的 Spring Security 概念（例如：WebSecurityConfigurerAdapter、身份验证和授权规则）完成的，这些概念本身与 Spring Boot 无关。

因此，您在本指南中阅读的所有内容都一一适用于将 Spring Security 与 Spring Boot 结合使用。如果您不了解简单的安全性，就不要指望正确理解这两种技术如何协同工作。

### Spring Security & Thymeleaf

Spring Security 与 Thymeleaf 集成良好。它提供了一种特殊的 Spring Security Thymeleaf 方言，允许您将安全表达式直接放入 Thymeleaf HTML 模板中。

```html
<div sec:authorize="isAuthenticated()">
  This content is only shown to authenticated users.
</div>
<div sec:authorize="hasRole('ROLE_ADMIN')">
  This content is only shown to administrators.
</div>
<div sec:authorize="hasRole('ROLE_USER')">
  This content is only shown to users.
</div>
```

有关这两种技术如何协同工作的完整且更详细的概述，请查看官方文档。

## FAQ

### Spring Security 的最新版本是什么？

截至 2022 年 5 月，即为 5.7.1.RELEASE。

请注意，如果您使用 Spring Boot 定义的 Spring Security 依赖项，您可能使用的是稍旧的 Spring Security 版本，例如 5.2.1。

### 较旧的 Spring Security 版本是否与最新版本兼容？

Spring Security 最近经历了一些重大变化。因此，您需要找到目标版本的迁移指南并完成它们：

- Spring Security 3.x 到 4.x → https://docs.spring.io/spring-security/site/migrate/current/3-to-4/html5/migrate-3-to-4-jc.html
- Spring Security 4.x 到 5.x(< 5.3) → https://docs.spring.io/spring-security/site/docs/5.0.15.RELEASE/reference/htmlsingle/#new （不是迁移指南，但有什么新鲜事）
- Spring Security 5.x 到 5.3 → https://docs.spring.io/spring-security/site/docs/5.3.1.RELEASE/reference/html5/#new （不是迁移指南，而是新功能）
- Spring Security 最新版本 → https://docs.spring.io/spring-security/reference/whats-new.html（不是迁移指南，而是新功能）

### 我需要添加哪些依赖项才能使 Spring Security 正常工作？

#### Plain Spring Project

如果您使用的是普通 Spring 项目（不是 Spring Boot），则需要将以下两个 Maven/Gradle 依赖项添加到您的项目中：

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-web</artifactId>
    <version>5.7.1.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-config</artifactId>
    <version>5.7.1.RELEASE</version>
</dependency>
```

您还需要在 web.xml 或 Java 配置中配置 SecurityFilterChain。请参阅[此处](https://docs.spring.io/spring-security/site/docs/current/reference/html5/#ns-web-xml)如何操作。

#### Spring Boot Project

如果您正在使用 Spring Boot 项目，则需要将以下 Maven/Gradle 依赖项添加到您的项目中：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

其他所有内容都会自动为您配置，您可以立即开始编写 WebSecurityConfigurerAdapter。

### 如何以编程方式访问 Spring Security 中当前经过身份验证的用户？

正如本文中提到的，Spring Security 将当前经过身份验证的用户（或者更确切地说是 SecurityContext）存储在 SecurityContextHolder 内的线程局部变量中。您可以像这样访问它：

```java
SecurityContext context = SecurityContextHolder.getContext();
Authentication authentication = context.getAuthentication();
String username = authentication.getName();
Object principal = authentication.getPrincipal();
Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
```

请注意，如果您未登录，Spring Security 默认情况下会在 SecurityContextHolder 上设置 `*AnonymousAuthenticationToken*` 作为身份验证。这会导致一些混乱，因为人们自然会期望那里有一个 null 值。

### AntMatchers：常见示例

一个无意义的示例显示了最有用的 antMatchers （和 regexMatcher/mvcMatcher）可能性：

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http
      .authorizeRequests()
      .antMatchers("/api/user/**", "/api/ticket/**", "/index").hasAuthority("ROLE_USER")
      .antMatchers(HttpMethod.POST, "/forms/**").hasAnyRole("ADMIN", "CALLCENTER")
      .antMatchers("/user/**").access("@webSecurity.check(authentication,request)");
}
```

### 如何在 Spring Security 中使用自定义登录页面？

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
  http
      .authorizeRequests()
          .anyRequest().authenticated()
          .and()
      .formLogin()
          .loginPage("/login") // (1)
          .permitAll();
}
```

1. 您的自定义登录页面的 URL。一旦指定此选项，自动生成的登录页面就会消失。

### 如何使用 Spring Security 进行编程登录？

```java
UserDetails principal = userDetailsService.loadUserByUsername(username);
Authentication authentication = new UsernamePasswordAuthenticationToken(principal, principal.getPassword(), principal.getAuthorities());
SecurityContext context = SecurityContextHolder.createEmptyContext();
context.setAuthentication(authentication);
```

### 如何仅针对某些路径禁用 CSRF？

```java
@Override
    protected void configure(HttpSecurity http) throws Exception {
      http
       .csrf().ignoringAntMatchers("/api/**");
    }
```

## Fin

如果您已经读到这里，您现在应该对 Spring Security 生态系统的复杂性有了很好的了解，即使没有 OAuth2。总结一下：

1.  如果您对 Spring Security 的 FilterChain 如何工作以及它的默认漏洞保护有什么基本了解（想想：CSRF），这会很有帮助。
2.  确保了解身份验证和授权之间的区别。还有您需要为特定身份验证工作流程指定哪些 @Beans。
3.  确保您了解 Spring Security 的 WebSecurityConfigurerAdapter 的 DSL 以及基于注释的方法安全性。
4.  最后但并非最不重要的一点是，它有助于仔细检查 Spring Security 与其他框架和库（如 Spring MVC 或 Thymeleaf）的集成。

今天就够了，因为这真是一段旅程，不是吗？谢谢阅读！

## 致谢

向 Patricio "Pato" Moschcovich 致以深深的谢意，他不仅对本文进行了校对，还提供了宝贵的反馈！

原文链接：[https://www.marcobehler.com/guides/spring-security](https://www.marcobehler.com/guides/spring-security)
