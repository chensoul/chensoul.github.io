---
title: "[译]Spring Security - OAuth2"
date: 2023-08-16 08:00:00+08:00
slug: spring-security-with-oauth2
categories: [ "translation" ]
tags: ['spring-boot', 'security','oauth2']
---

## OAuth 2.0 基础知识

![OAuth 2.0 Fundamentals](oauth_2_fundamentals.webp)

OAuth 2.0 由 IETF OAuth 工作组开发并于 2012 年 10 月发布。它作为一种开放授权协议，使第三方应用程序能够代表资源所有者对 HTTP 服务进行有限访问。它可以在不泄露用户身份或长期凭证的情况下做到这一点。第三方应用程序本身也可以代表其使用它。

OAuth 的工作原理包括将用户身份验证委托给托管用户帐户的服务，并授权第三方应用程序访问用户的帐户。

让我们考虑一个例子。假设我们要登录网站“clientsite.com”。我们可以通过 Facebook、Github、Google 或 Microsoft 登录。我们选择上面给出的选项中的任何选项，然后我们将被重定向到相应的网站进行登录。如果登录成功，系统会询问我们是否要授予 clientsite.com 访问其请求的特定数据的权限。

我们选择所需的选项，然后使用授权代码或错误代码重定向到 clientsite.com，登录是否成功取决于我们在第三方资源中的操作。这就是 OAuth 2 的基本工作原理。

OAuth 系统涉及五个关键角色。让我们把它们列出来 -

- **User / Resource Owner** − 用户/资源所有者- 最终用户，负责身份验证并同意与客户端共享资源。
- **User-Agent** − 用户代理- 用户使用的浏览器。
- **Client** − 客户端 - 请求访问令牌的应用程序。
- **Authorization Server** − 授权服务器- 用于验证用户/客户端的服务器。它颁发访问令牌并在其整个生命周期内对其进行跟踪。
- **Resource Server** − 资源服务器- 提供对所请求资源的访问的 API。它验证访问令牌并提供授权。

### 入门

我们将使用 Spring Security 和 OAuth 2.0 开发一个 Spring Boot 应用程序来说明上述内容。我们现在将开发一个带有内存数据库的基本应用程序来存储用户凭据。该应用程序将使我们轻松了解 OAuth 2.0 与 Spring Security 的工作原理。

让我们使用 Spring 初始化程序在 Java 8 中创建一个 Maven 项目。让我们从 start.spring.io 开始。我们生成一个具有以下依赖项的应用程序 -

- Spring Web
- Spring Security
- Cloud OAuth2
- Spring Boot Devtools

![Start Spring](start_spring.webp)
![Project Metadata](project_metadata.webp)

通过上面的配置，我们点击 Generate 按钮生成一个项目。该项目将以 zip 文件形式下载。我们将 zip 解压到一个文件夹中。然后我们可以在我们选择的 IDE 中打开该项目。我在这里使用 Spring Tools Suite，因为它针对 Spring 应用程序进行了优化。我们也可以根据需要使用 Eclipse 或 IntelliJ Idea。

因此，我们在 STS 中打开项目，让依赖项被下载。然后我们可以在包资源管理器窗口中看到项目结构。它应该类似于下面的屏幕截图。

![Project in STS](project_in_sts.webp)

如果我们打开 pom.xml 文件，我们可以查看与项目相关的依赖项和其他详细信息。它应该看起来像这样。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
   https://maven.apache.org/xsd/maven-4.0.0.xsd">
   <modelVersion>4.0.0</modelVersion>
   <parent>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-parent</artifactId>
      <version>2.3.1.RELEASE</version>
      <relativePath/> <!-- lookup parent from repository -->
   </parent>
   <groupId>com.tutorial</groupId>
   <artifactId>spring.security.oauth2</artifactId>
   <version>0.0.1-SNAPSHOT</version>
   <name>spring.security.oauth2</name>
   <description>Demo project for Spring Boot</description>
   <properties>
      <java.version>1.8</java.version>
      <spring-cloud.version>Hoxton.SR6</spring-cloud.version>
   </properties>
   <dependencies>
      <dependency>
         <groupId>org.springframework.boot<groupId>
         <artifactId>spring-boot-starter-security</artifactId>
      </dependency>
      <dependency>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-starter-web</artifactId>
      </dependency>
      <dependency>
         <groupId>org.springframework.cloud</groupId>
         <artifactId>spring-cloud-starter-oauth2</artifactId>
      </dependency>
      <dependency>
         <groupId>org.springframework.boot<groupId>
         <artifactId>spring-boot-devtools</artifactId>
         <scope>runtime</scope>
         <optional>true</optional>
      </dependency>
      <dependency>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-starter-test</artifactId>
         <scope>test</scope> <exclusions>    <exclusion>
            <groupId>org.junit.vintage</groupId>
            <artifactId>junit-vintage-engine</artifactId>
            </exclusion>
         </exclusions>
      <dependency>
      <dependency>
         <groupId>org.springframework.security</groupId>
         <artifactId>spring-security-test</artifactId>
         <scope>test</scope>
      </dependency>
   </dependencies>
      <dependencyManagement>
   <dependencies>
      <dependency>
         <groupId>org.springframework.cloud</groupId>
         <artifactId>spring-cloud-dependencies</artifactId>
         <version>${spring-cloud.version}</version>
         <type>pom</type>
         <scope>import</scope>
      </dependency>
   </dependencies>
   </dependencyManagement><build>
   <plugins>
      <plugin>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
   </plugins>
   </build>
</project>
```

现在，在我们应用程序的基础包（即 com.tutorial.spring.security.oauth2）中，添加一个名为 config 的新包，我们将在其中添加配置类。

让我们创建第一个配置类 UserConfig，它扩展了 Spring Security 的 WebSecurityConfigurerAdapter 类来管理客户端应用程序的用户。我们给这个类加上@Configuration 注解，告诉 Spring 它是一个配置类。

```java
package com.tutorial.spring.security.oauth2.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;

@Configuration
public class UserConfig extends WebSecurityConfigurerAdapter {
   @Bean
   public UserDetailsService userDetailsService() {
      UserDetailsManager userDetailsManager = new InMemoryUserDetailsManager();
      UserDetails user = User.withUsername("john")
         .password("12345") .authorities("read")
      .build(); userDetailsManager.createUser(user); return userDetailsManager;
   }
   @Bean
   public PasswordEncoder passwordEncoder() {
      return NoOpPasswordEncoder.getInstance();
   }
   @Override
   @Bean
   public AuthenticationManager authenticationManagerBean() throws Exception {
      return super.authenticationManagerBean();
   }
}
```

然后，我们添加 UserDetailsService 的 bean 来检索用户详细信息以进行身份  验证和授权。为了将其放入 Spring 上下文中，我们用 @Bean 对其进行注释。为了使本教程简单易懂，我们使用 InMemoryUserDetailsManager 实例。对于实际应用程序，我们可以使用其他实现，例如 JdbcUserDetailsManager 来连接到数据库等。为了能够在此示例中轻松创建用户，我们使用 UserDetailsManager 接口，该接口扩展了 UserDetailsService 并具有 createUser()、updateUser() 等方法。然后，我们使用构建器类创建一个用户。我们现在给他一个用户名、密码和“读取”权限。然后，使用 createUser() 方法添加新创建的用户并返回 UserDetailsManager 实例，从而将其放入 Spring 上下文中。

为了能够使用我们定义的 UserDetailsService，有必要在 Spring 上下文中提供一个 PasswordEncoder bean。再次强调，为了简单起见，我们现在使用 NoOpPasswordEncoder。 NoOpPasswordEncoder 不应该用于实际生产应用程序，因为它不安全。 NoOpPasswordEncoder 不会对密码进行编码，仅适用于开发或测试场景或概念证明。

我们应该始终使用 Spring Security 提供的其他高度安全的选项，其中最流行的是 BCryptPasswordEncoder，我们将在后面的系列教程中使用它。为了将其放入 Spring 上下文中，我们使用 @Bean 注释该方法。

然后，我们重写 WebSecurityConfigurerAdapter 的 AuthenticationManager bean 方法，该方法返回 authenticationManagerBean 以将身份验证管理器放入 Spring 上下文中。

现在，为了添加客户端配置，我们添加一个名为 AuthorizationServerConfig 的新配置类，它扩展了 Spring Security 的 AuthorizationServerConfigurerAdapter 类。 AuthorizationServerConfigurerAdapter 类用于使用 spring security oauth2 模块配置授权服务器。我们也用@Configuration 注释这个类。要将授权服务器功能添加到此类中，我们需要添加 @EnableAuthorizationServer 注释，以便应用程序可以充当授权服务器。

```java
package com.tutorial.spring.security.oauth2.config;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;

@Configuration @EnableAuthorizationServer
public class AuthorizationServerConfig extends AuthorizationServerConfigurerAdapter {
   @Autowired private AuthenticationManager authenticationManager;
   @Override
   public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
      clients.inMemory() .withClient("oauthclient1") .secret("oauthsecret1") .scopes("read") .authorizedGrantTypes("password") }
   @Override
   public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
      endpoints.authenticationManager(authenticationManager);
   }
}
```

为了检查 oauth 令牌，Spring Security oauth 公开两个端点 - /oauth/check_token 和 /oauth/token_key。默认情况下，这些端点在 denyAll() 后面受到保护。 tokenKeyAccess() 和 checkTokenAccess() 方法打开这些端点以供使用。

我们将在 UserConfig 类中配置的 AuthenticationManager bean 自动装配为此处的依赖项，稍后我们将使用它。

然后，我们重写 AuthorizationServerConfigurerAdapter 的两个 configure() 方法，以提供客户端详细信息服务的内存中实现。第一种方法使用 ClientDetailsServiceConfigurer 作为参数，顾名思义，允许我们为授权服务器配置客户端。这些客户端代表能够使用该授权服务器功能的应用程序。由于这是学习 OAuth2 实现的基本应用程序，因此我们现在将保持简单并使用具有以下属性的内存中实现 -

- **clientId** − 客户端的 ID。必需的。
- **secret** − 客户端密码，受信任的客户端所需
- **scope** − 范围 - 客户端的限制范围，换句话说，客户端权限。如果留空或未定义，则客户端不受任何范围的限制。
- **authorizedGrantTypes** − 客户端被授权使用的授权类型。 grant type 表示客户端从授权服务器获取 token 的方式。我们将使用“密码”授予类型，因为它是最简单的。稍后，我们将针对另一个用例使用另一种授权类型。

在“密码”授权授予类型中，用户需要向我们的客户端应用程序提供他/她的用户名、密码和范围，然后客户端应用程序使用这些凭据以及我们想要从中获取令牌的授权服务器的凭据。

我们重写的另一个 configure()方法使用 AuthorizationServerEndpointsConfigurer 作为参数，用于将 AuthenticationManager 附加到授权服务器配置。

通过这些基本配置，我们的授权服务器就可以使用了。让我们继续启动并使用它。我们将使用 Postman (h ttps://www.postman.com/downloads/) 来提出我们的请求。

使用 STS 时，我们可以启动应用程序并开始在控制台中查看日志。当应用程序启动时，我们可以在控制台中找到应用程序公开的 oauth2 端点。在这些端点中，我们现在将使用以下令牌 -

**/oauth/token – 用于获取令牌。**

![Obtaining the Token](obtaining_the_token.webp)

如果我们检查这里的邮递员快照，我们可以注意到一些事情。让我们在下面列出它们。

- URL - 我们的 Spring Boot 应用程序在本地计算机的端口 8080 上运行，因此请求指向 http://localhost:8080。接下来的部分是 /oauth/token，我们知道它是 OAuth 公开的用于生成令牌的端点。
- 查询参数 - 由于这是“密码”授权授予类型，因此用户需要向我们的客户端应用程序提供他/她的用户名、密码和范围，然后客户端应用程序使用这些凭据及其凭据发送给我们想要令牌的授权服务器从。
- 客户端授权- Oauth 系统要求客户端获得授权才能提供令牌。因此，在授权标头下，我们提供客户端身份验证信息，即我们在应用程序中配置的用户名和密码。

让我们仔细看看查询参数和授权标头 -

![Authorization Header](authorization_header.webp)

查询参数

![Client Credentials](client_credentials.webp)

客户凭证

如果一切正确，我们将能够在响应中看到生成的令牌以及 200 ok 状态。

![Response](response.webp)

响应

我们可以通过输入错误的凭据或不输入凭据来测试我们的服务器，我们将收到一个错误，表明请求未经授权或凭据错误。

![OAuth Authorization Server](oauth_authorization_server.webp)

这是我们的基本 oauth 授权服务器，它使用密码授予类型来生成并提供密码。

接下来，让我们实现一个更安全、更常见的 oauth2 身份验证应用，即使用授权码授予类型。为此，我们将更新当前的应用程序。

授权授予类型与密码授予类型不同，因为用户不必与客户端应用程序共享其凭据。他仅与授权服务器共享它们，作为回报，授权代码被发送到客户端，用于对客户端进行身份验证。它比密码授予类型更安全，因为用户凭据不与客户端应用程序共享，因此用户的信息保持安全。

除非得到用户的批准，客户端应用程序无法访问任何重要的用户信息。

通过几个简单的步骤，我们可以在应用程序中设置一个具有授权授予类型的基本 oauth 服务器。让我们看看如何。

```java
package com.tutorial.spring.security.oauth2.config;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.oauth2.config.annotation.configurers.ClientDetailsServiceConfigurer;
import org.springframework.security.oauth2.config.annotation.web.configuration.AuthorizationServerConfigurerAdapter;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableAuthorizationServer;
import org.springframework.security.oauth2.config.annotation.web.configurers.AuthorizationServerEndpointsConfigurer;
@Configuration
@EnableAuthorizationServer
public class AuthorizationServerConfig extends AuthorizationServerConfigurerAdapter {
   @Autowired private AuthenticationManager authenticationManager;
   @Override
   public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
      clients.inMemory()
      .withClient("oauthclient1")
      .secret("oauthsecret1")
      .scopes("read") .authorizedGrantTypes("password")
      .and() .withClient("oauthclient2") .secret("oauthsecret2")
      .scopes("read") .authorizedGrantTypes("authorization_code")
      .redirectUris("http://locahost:9090");
   }
   @Override public void configure(AuthorizationServerEndpointsConfigurer endpoints) throws Exception {
      endpoints.authenticationManager(authenticationManager);
   }
}
```

让我们为此操作添加第二个客户端 oauthclient2，并使用新的密钥和读取范围。在这里，我们已将此客户端的授权类型更改为授权代码。我们还添加了重定向 URI，以便授权服务器可以回调客户端。因此，基本上重定向 URI 就是客户端的 URI。

现在，我们必须在用户和授权服务器之间建立连接。我们必须为授权服务器设置一个接口，用户可以在其中提供凭据。我们使用 Spring Security 的 formLogin() 实现来实现该功能，同时保持简单。我们还确保所有请求都经过身份验证。

```java
package com.tutorial.spring.security.oauth2.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;

@SuppressWarnings("deprecation") @Configuration
public class UserConfig extends WebSecurityConfigurerAdapter {
   @Bean
   public UserDetailsService userDetailsService() {
      UserDetailsManager userDetailsManager = new InMemoryUserDetailsManager();
         UserDetails user = User.withUsername("john")
      .password("12345") .authorities("read") .build();
      userDetailsManager.createUser(user); return userDetailsManager;
   }
   @Bean public PasswordEncoder passwordEncoder() {
      return NoOpPasswordEncoder.getInstance();
    }
   @Override
   @Bean
   public AuthenticationManager authenticationManagerBean() throws Exception {
      return super.authenticationManagerBean();
   }
   @Override protected void configure(HttpSecurity http) throws Exception {
      http.formLogin(); http.authorizeRequests().anyRequest().authenticated();
   }
}
```

这就完成了我们对授权授予类型的设置。现在测试我们的设置并启动我们的应用程序。我们在 http://localhost:8080/oauth/authorize?response_type=code&client_id=oauthclient2&scope=read 启动浏览器。我们将重定向到 Spring Security 的默认表单登录页面。

![OAuth Authorization Server Signin](oauth_authorization_server_signin.webp)

这里，响应类型代码意味着授权服务器将返回一个访问代码，客户端将使用该访问代码进行登录。当我们使用用户凭据时，我们将被询问是否要授予客户端请求的权限，在类似的屏幕如下所示。

![OAuth Approval](oauth_approval.webp)

如果我们批准并单击“授权”，我们将看到我们被重定向到给定的重定向 URL 以及访问代码。在我们的例子中，我们被重定向到 http://locahost:9090/?code=7Hibnw，正如我们在应用程序中指定的那样。我们现在可以使用该代码作为 Postman 中的客户端来登录授权服务器。

![Postman Authorization](postman_authorization.webp)

正如我们在这里所看到的，我们在 URL 中使用了从授权服务器收到的代码，并且 grant_type 作为授权代码，范围作为读取。我们充当客户端并提供应用程序中配置的客户端凭据。当我们发出这个请求时，我们会得到我们可以进一步使用的 access_token。

我们已经了解了如何使用 OAuth 2.0 配置 Spring Security。该应用程序非常简单且易于理解，可以帮助我们相当轻松地理解该过程。我们使用了两种授权授予类型，并了解了如何使用它们来获取客户端应用程序的访问令牌。

原文链接：[https://www.tutorialspoint.com/spring_security/spring_security_with_oauth2.htm](https://www.tutorialspoint.com/spring_security/spring_security_with_oauth2.htm)
