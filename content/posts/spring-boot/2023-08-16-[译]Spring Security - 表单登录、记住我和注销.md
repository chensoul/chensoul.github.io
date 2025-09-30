---
title: "[译]Spring Security - 表单登录、记住我和注销"
date: 2023-08-16
slug: spring-security-form-login-remember-me-and-logout
categories: ["spring-boot"]
tags: ['java', 'javascript', 'backend', 'security']
---

## 内容

- 简介和概述
- 入门（实用指南）

## 简介和概述

Spring Security 附带了大量内置功能和工具，为我们提供方便。在这个例子中，我们将讨论其中三个有趣且有用的功能 -

- 表单登录
- 记住账号
- 登出

### 表单登录

基于表单的登录是 Spring Security 提供支持的一种用户名/密码身份验证形式。这是通过 Html 表单提供的。

每当用户请求受保护的资源时，Spring Security 都会检查请求的身份验证。如果请求未经过身份验证/授权，用户将被重定向到登录页面。登录页面必须由应用程序以某种方式呈现。 Spring Security 默认提供该登录表单。

此外，如果需要，任何其他配置都必须明确提供，如下所示 -

```java
protected void configure(HttpSecurity http) throws Exception {
http
   // ...
   .formLogin(
      form -> form.loginPage("/login")
      .permitAll()
   );
}
```

此代码要求模板文件夹中存在一个 login.html 文件，该文件将在点击 /login 时返回。该 HTML 文件应包含一个登录表单。此外，该请求应该是对 /login 的 post 请求。参数名称应分别为用户名和密码的“username”和“password”。除此之外，表单中还需要包含 CSRF 令牌。

一旦我们完成了代码练习，上面的代码片段就会更加清晰。

### 记住账号

这种类型的身份验证需要将记住我的 cookie 发送到浏览器。该 cookie 存储用户信息/身份验证主体，并存储在浏览器中。因此，网站可以在下次会话启动时记住用户的身份。 Spring Security 已为此操作准备了必要的实现。

一种使用散列来保护基于 cookie 的令牌的安全性，而另一种使用数据库或其他持久存储机制来存储生成的令牌。

### 登出

默认 URL /logout 通过以下方式注销用户：

- 使 HTTP 会话失效
- 清除配置的所有 RememberMe 身份验证
- 清除 SecurityContextHolder
- 重定向到/login?logout

**WebSecurityConfigurerAdapter** 自动将注销功能应用于 Spring Boot 应用程序。

**Getting Started (Practical Guide)** 像往常一样，我们首先访问 start.spring.io。这里我们选择一个 maven 项目。我们将项目命名为“formlogin”并选择所需的 Java 版本。我在此示例中选择 Java 8。我们还继续添加以下依赖项 -

- Spring Web
- Spring Security
- [Thymeleaf](https://www.thymeleaf.org/)
- Spring Boot DevTools

![Spring Initializr](https://www.tutorialspoint.com/spring_security/images/spring_initializr.jpg)

Thymeleaf 是 Java 的模板引擎。它允许我们快速开发静态或动态网页以在浏览器中呈现。它具有极强的可扩展性，允许我们详细定义和自定义模板的处理。除此之外，我们还可以通过点击此链接了解有关 Thymeleaf 的更多信息。

让我们继续生成项目并下载它。然后，我们将其解压到我们选择的文件夹中，并使用任何 IDE 将其打开。我将使用 Spring Tools Suite 4。它可以从 https://spring.io/tools 网站免费下载，并且针对 Spring 应用程序进行了优化。

让我们看一下 pom.xml 文件。它应该看起来与此类似 -

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
   <modelVersion>4.0.0</modelVersion>
   <parent>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-parent</artifactId>
      <version>2.3.1.RELEASE</version>
      <relativePath />
      <!-- lookup parent from repository -->
   </parent>
   <groupId>            com.spring.security</groupId>
   <artifactId>formlogin</artifactId>
   <version>0.0.1-SNAPSHOT</version>
   <name>formlogin</name>
   <description>Demo project for Spring Boot</description>

   <properties>
      <java.version>1.8</java.version>
   </properties>

   <dependencies>
      <dependency>
         <groupId>org.springframework.boot</groupId>
         <artifactId>spring-boot-starter-security</artifactId>
      </dependency>
   <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-web</artifactId>
   </dependency>
   <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-thymeleaf</artifactId>
   </dependency>
   <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-devtools</artifactId>
   </dependency>
   <dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-starter-test</artifactId>
   <scope>test</scope>
   <exclusions>
      <exclusion>
         <groupId>org.junit.vintage</groupId>
         <artifactId>junit-vintage-engine</artifactId>
      </exclusion>
   </exclusions>
   </dependency>
   <dependency>
      <groupId>org.springframework.security</groupId>
      <artifactId>spring-security-test</artifactId>
      <scope>test</scope>
   </dependency>
   </dependencies>

   <build>
      <plugins>
         <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
         </plugin>
      </plugins>
   </build>
</project>
```

让我们在默认包下的文件夹 /src/main/java 中创建一个包。我们将其命名为 config，因为我们会将所有配置类放置在这里。因此，名称应该类似于 - com.tutorial.spring.security.formlogin.config。

### 配置类

```java
package com.tutorial.spring.security.formlogin.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager; import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import com.spring.security.formlogin.AuthFilter;

@Configuration
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

   @Bean
   protected UserDetailsService userDetailsService() {
   UserDetailsManager userDetailsManager = new InMemoryUserDetailsManager();
   UserDetails user = User.withUsername("abby")
   .password(passwordEncoder().encode("12345"))
      .authorities("read") .build();
      userDetailsManager.createUser(user);
      return userDetailsManager;

   }
   @Bean
   public PasswordEncoder passwordEncoder() {
      return new BCryptPasswordEncoder(); };
      @Override
      protected void configure(HttpSecurity http) throws Exception {
      http.csrf().disable() .authorizeRequests().anyRequest()
      .authenticated() .and()
      .formLogin()
      .and()
      .rememberMe()
      .and() .logout() .logoutUrl("/logout")
      .logoutSuccessUrl("/login") .deleteCookies("remember-me");
   }
}
```

### 代码分解

在我们的配置包中，我们创建了 WebSecurityConfig 类。该类扩展了 Spring Security 的 WebSecurityConfigurerAdapter。我们将使用此类进行安全配置，因此让我们用 @Configuration 注释来注释它。因此，Spring Security 知道将此类视为配置类。正如我们所看到的，Spring 使应用程序的配置变得非常容易。

让我们看一下我们的配置类。

- 首先，我们将使用 userDetailsS​​ervice() 方法创建 UserDetailsS​​ervice 类的 bean。我们将使用此 bean 来管理此应用程序的用户。在这里，为了简单起见，我们将使用 InMemoryUserDetailsManager 实例来创建用户。该用户以及我们给定的用户名和密码将包含一个简单的“读取”权限。
- 现在，让我们看看我们的密码编码器。在本例中，我们将使用 BCryptPasswordEncoder 实例。因此，在创建用户时，我们使用 passwordEncoder 对我们的明文密码进行编码，如下所示

```java
.password(passwordEncoder().encode("12345"))
```

- 完成上述步骤后，我们继续进行下一个配置。这里，我们重写 WebSecurityConfigurerAdapter 类的 configure 方法。该方法将 HttpSecurity 作为参数。我们将对其进行配置以使用我们的表单登录和注销以及记住我功能。

### HTTP 安全配置

我们可以观察到所有这些功能在 Spring Security 中都可用。让我们详细研究以下部分 -

```java
http.csrf().disable()
   .authorizeRequests().anyRequest().authenticated()
   .and()
   .formLogin()
   .and()
   .rememberMe()
   .and()
   .logout()
   .logoutUrl("/logout") .logoutSuccessUrl("/login") .deleteCookies("remember-me");
```

这里有几点需要注意 -

- 我们已经禁用了 csrf 或跨站点请求伪造保护，因为这是一个仅用于演示目的的简单应用程序，所以我们现在可以安全地禁用它。

- 然后我们添加需要对所有请求进行身份验证的配置。正如我们稍后将看到的，为了简单起见，我们将为此应用程序的索引页使用一个“/”端点。

- 之后，我们将使用上面提到的 Spring Security 的 formLogin() 功能。这会生成一个简单的登录页面。

- 然后，我们使用 Spring Security 的 RememberMe() 功能。这将执行两件事。

- - 首先，它会在我们使用 formLogin() 生成的默认登录表单中添加一个“记住我”复选框。
  - 其次，勾选复选框会生成记住我的 cookie。 cookie 存储用户的身份，浏览器存储它。 Spring Security 在将来的会话中检测 cookie 以自动登录。因此，用户无需再次登录即可再次访问该应用程序。

- 最后，我们有 logout() 功能。为此，Spring security 也提供了默认功能。它在这里执行两个重要的功能 -

- - 使 Http 会话无效，并取消绑定到会话的对象。
  - 它会清除“记住我”cookie。
  - 从 Spring 的安全上下文中删除身份验证。

- 我们还提供了一个 logoutSuccessUrl()，以便应用程序在注销后返回到登录页面。这样就完成了我们的应用程序配置。

### 受保护的内容（可选）

我们现在将创建一个虚拟索引页面，供用户登录时查看。它还将包含一个注销按钮。

在我们的/src/main/resources/templates 中，我们添加一个 index.html 文件。然后向其中添加一些 Html 内容。

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <!-- Bootstrap CSS -->
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css"
      integrity="sha384-9aIt2nRpC12Uk9gS9baDl411NQApFmC26EwAOH8WgZl5MYYxFfc+NcPb1dKGj7Sk"
      crossorigin="anonymous"
    />
    <title>Hello, world!</title>
  </head>
  <body>
    <h1>Hello, world!</h1>
    <a href="logout">logout</a>
    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script
      src="https://code.jquery.com/jquery-3.5.1.slim.min.js"
      integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj"
      crossorigin="anonymous"
    ></script>
    <script
      src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"
      integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo"
      crossorigin="anonymous"
    ></script>
    <script
      src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js"
      integrity="sha384-OgVRvuATP1z7JjHLkuOU7Xw704+h835Lr+6QL9UvYjZE3Ipu6Tp75j7Bh/kR0JKI"
      crossorigin="anonymous"
    ></script>
  </body>
</html>
```

此内容来自 Bootstrap 4 入门模板。

我们还添加

```html
<a href="logout">logout</a>
```

到我们的文件，以便用户可以使用此链接注销应用程序。

### 资源控制器

我们已经创建了受保护的资源，现在添加控制器来服务该资源。

```java
package com.tutorial.spring.security.formlogin.controllers;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
@Controller public class AuthController {
   @GetMapping("/") public String home() { return "index"; }
}
```

正如我们所看到的，这是一个非常简单的控制器。它只有一个 get 端点，在启动我们的应用程序时为我们的 index.html 文件提供服务。

### 运行应用程序

让我们将应用程序作为 Spring Boot 应用程序运行。当应用程序启动时，我们可以在浏览器上访问 http://localhost:8080。它应该要求我们提供用户名和密码。此外，我们还可以看到“记住我”复选框。

![Sign In](https://www.tutorialspoint.com/spring_security/images/sign_in.jpg)

### 登录页面

现在，如果我们提供在 WebSecurity 配置文件中配置的用户信息，我们将能够登录。此外，如果我们勾选“记住我”复选框，我们将能够在我们的 WebSecurity 配置文件中看到“记住我”cookie 浏览器的开发者工具部分。

![Console Application](https://www.tutorialspoint.com/spring_security/images/console_application.jpg)![Console Network](https://www.tutorialspoint.com/spring_security/images/console_network.jpg)

正如我们所看到的，cookie 是与我们的登录请求一起发送的。

此外，网页中还包含一个用于注销的链接。单击该链接后，我们将退出我们的应用程序并返回到我们的登录页面。

原文链接：[https://www.tutorialspoint.com/spring_security/spring_security_form_login_remember_me_and_logout.htm](https://www.tutorialspoint.com/spring_security/spring_security_form_login_remember_me_and_logout.htm)
