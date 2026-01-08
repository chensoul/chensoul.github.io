---
title: "[译]Spring Boot项目如何实现JWT认证？"
date: 2023-08-18
slug: how-to-implement-jwt-authentication-in-spring-boot-project
categories: ["spring-boot"]
tags: ['spring-boot', 'security']
---

![How to implement JWT Authentication in Spring Boot Project?](../../../images/JWT_With_SpringBoot-1.webp)

没有人可以否认这样一个事实：安全性是生产就绪应用程序的一项重要功能。尽管我们可以[使用内存身份验证](https://javatechonline.com/how-to-implement-security-in-spring-boot-project/)、[JDBC 身份验证](https://javatechonline.com/how-to-implement-security-in-spring-boot-project/)或通过 [UserDetailsS](https://javatechonline.com/how-to-implement-security-in-spring-boot-using-userdetailsservice/)​​ervice 来保护一个 Web 应用程序的安全。但是，当一个应用程序在内部使用其他应用程序的服务时，使用 Web 服务概念实现安全性就变得很重要。在这种情况下，我们使用具有特定有效期的令牌来保护我们的应用程序。此外，我们将学习“如何在 Spring Boot 项目中实现 JWT 身份验证？”以整体了解 JWT（JSON Web Token）身份验证背后的概念。

由于 JWT 代表“JSON Web Token”，很明显，该令牌仅以 JSON 形式保存数据。

此外，与上述身份验证技术不同，JWT 属于无状态身份验证。简而言之，它没有数据。通常，这种类型的身份验证用于 Web 服务、服务器的水平扩展，甚至在某种程度上用于 OAuth 技术。为了说明该网络服务，让我们可视化从亚马逊预订订单的过程。在这里，用户与 Amazon 应用程序交互，而 Amazon 应用程序在内部通过 Web 服务调用与支付网关应用程序交互。

现在让我们开始讨论我们的主题“如何在 Spring Boot 项目中实现 JWT 身份验证？”以及相关点。

## 您对整篇文章有何期望？

读完本文后，您将能够回答：

1. 什么是安全上下文中的无状态和有状态身份验证？
2. 无状态认证和有状态认证有什么区别？

3) 那么什么是 Token，什么是 JWT(JSON Web Token)？
4) 使用 JWT 认证有什么好处？
5) JWT 内部如何运作？
6) 我们在什么情况下使用 JWT 身份验证？

7) 此外，JWT 身份验证和状态身份验证之间有什么区别？
8) 此外，如何生成 JWT 编码令牌以及如何将其解码回来？
9) 如何在 Spring Boot 项目中逐步实现 JWT 认证？
10) 在 Spring Boot 3.0 中，如何在不使用 WebSecurityConfigurerAdapter 的情况下编写安全配置类？
11) 最后，如何测试启用 JWT 安全的应用程序？

## 什么是无状态和有状态身份验证？

通常有两种类型的认证技术。两者都发生在客户端服务器概念中，服务器仅在身份验证后才向客户端提供服务。这里的客户端可以是浏览器，也可以是另一个服务器。

### 状态认证

在这种类型的身份验证中，客户端和服务器之间涉及会话管理。当客户端向服务器请求服务时，它首先登录到服务器。然后服务器创建一个会话并以键值对的形式存储该信息。这个会话是服务器端的一种内存。我们也称其为 HttpSession，因为 Http 协议管理它。

此外，为了响应客户端请求，服务器以 Cookie 的形式向客户端提供带有响应的会话 id。该 cookie 存储在客户端浏览器中。当同一个客户端第二次发出请求时，请求头中也会带有 cookie。因此，服务器会检查请求标头，如果在 cookie 中发现相同的 SID（会话 ID），则假定该请求来自同一客户端。通过这种方式，会话管理就发生了。

当客户端从服务器注销时，会话会相应地被销毁。结果，服务器相应地从内存中删除会话信息（键值）。同样重要的是，对于每个新客户端，服务器都会创建一个新会话（内存）。

### 无状态身份验证

当客户端向服务器发送服务请求时，它首先登录到服务器。因此，服务器生成一个令牌（编码格式的数据）并将响应发送到客户端。在发出第二个请求时，客户端将相同的令牌与请求一起发送到服务器。现在，服务器从请求中读取令牌并验证令牌。事实上，从第一个请求开始，服务器就检查客户端的有效登录（凭据）。

如果它是有效的登录，那么服务器只会创建一个令牌。

此外，在第二个请求时，它会验证令牌。如果令牌有效，则发送请求的响应，否则要求客户端再次登录。但每个 Token 都会有一个有效时间段，比如 30 分钟、1 小时等。根据业务需求，Token 的有效期可以配置。

对于 Token 来说，没有注销的概念。相反，客户端可以发出请求并获取响应，直到令牌过期。

## 什么是令牌、JWT 身份验证是什么以及使用它的好处是什么？

简单来说，Token 就是一种编码格式的数据。它可以使用密钥（一种密码）生成。 JWT 是“JSON Web Token”的缩写，它是生成令牌的标准机制。它定义了一种紧凑且独立的方式，以 JSON 对象的形式在各 ​​ 方（多个服务器）之间安全地传输信息。 JWT 由三部分组成：标头、有效负载和签名。每个部分都用逗号分隔。它是一个开源 API。

JWT 概念不仅存在于 Java 中，也存在于其他语言中。

- ader : 包含 JWT 特定信息
- Payload : 有效负载，包含声明（客户 ID、客户名称、发行人名称、受众名称、发行日期、到期日期等...）
- Signature: 签名，标头和有效负载的 Base64 编码形式。另外，用密钥签名

以下是格式示例：

```
aaaaaaaaaaa.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.cccccccccccccccccccccccccccccccccc
```

编码后的 JWT 例子 :

```
eyJhbGciOiJIUzUxMiJ9
.eyJqdGkiOiIzNDMyIiwic3ViIjoiZHMyNTI1IiwiaXNzIjoiQUJDX0x0ZCIsImF1ZCI6IlhZWl9MdGQiLCJpYXQiOjE2MDc0NDI1NzQsImV4cCI6MTYwNzQ0NjE3NH0
.3fIcXIvL9Uz0WtZgaXC95Wj8Hn7ONWKkaaspRwCT6v5Q8QSxZx7hiDQY3klYUMkfe5t2ioasYzEulM_OGc_GEw
```

## JWT 身份验证如何工作？

当客户端向服务器请求服务时，它首先登录到服务器。因此，服务器生成一个令牌（编码格式的数据）并将其与响应一起发送给客户端。在发出第二个请求时，客户端将令牌与请求一起发送到服务器。现在服务器从请求中读取令牌并验证令牌。在验证客户端随请求发送的令牌时，服务器再次需要该密钥来对其进行解码。

此外，为了验证令牌服务器始终需要密钥。即使在成功登录后，服务器也仅在第一次使用密钥生成令牌。总之，服务器在生成令牌时甚至在验证令牌时也需要密钥。

与状态身份验证不同，这里服务器仅在服务器端维护令牌。如上所述，在状态认证中，浏览器（客户端）以 cookie 的形式存储会话 ID。

假设我们通过 JWT 应用程序预订订单。整体至少需要三名参与者才能完成预订。用户、亚马逊应用程序和支付网关应用程序。这里支付网关应用程序验证亚马逊应用程序而不是客户端。发生这种情况是由于令牌身份验证技术。此外，一旦付款完成，亚马逊应用程序将不再使用支付网关的服务。因此，在这种情况下令牌身份验证是更好的选择。有关智威汤逊的更多内部详细信息，请访问智威汤逊网站。

## 如何生成 JWT 编码令牌并再次解码（阅读声明）？

这里的声明是通过提供两个输入来读取或解析 JWT 详细信息的过程：令牌和密钥

为了实现“如何生成和读取声明”的 POC（概念验证），我们应该考虑为 JWT 找到一个 JAVA API。毫无疑问，我们已经有了 jjwt.jar 来使它成为可能。现在让我们创建一个 POC 来逐步实现我们的功能。

### 步骤#1：在 Eclipse 或 STS 中创建一个简单的 Maven 项目。

打开 Eclipse 并选择 File>New>Other，然后搜索“Maven Project”。然后单击“下一步”，选择“创建一个简单项目”复选框。现在点击“下一步”。输入“Group Id”和“Artifact id”作为您的项目详细信息。最后点击“完成”。

### 步骤#2：在 pom.xml 中包含 jjwt 依赖项。

包含“jjwt”依赖项，如下所示。此外，如果您使用 JDK8 或更高版本，您还需要包含“jaxb”依赖项。

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>

<dependency>
    <groupId>javax.xml.bind</groupId>
    <artifactId>jaxb-api</artifactId>
    <version>2.3.0</version>
</dependency>
```

### 步骤#3：创建类并实现功能

因此，我们将创建两个类：JWTUtil.java 和 JWT_Test.java

在 JWTUtil.java 中，我们将具有可以作为实用程序类工作的实现逻辑。此外，我们将相应地从 JWT_Test.java 测试我们的 POC。

JWTUtil.java

```java
ackage com.dev.spring.security.jwt;

import java.util.Base64;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

public class JWTUtil {

	// code to generate Token
	public static String generateToken(String subject, String secret_key) {

		return Jwts.builder()
				.setId("tk9931")
				.setSubject(subject)
				.setIssuer("ABC_Ltd")
				.setAudience("XYZ_Ltd")
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + TimeUnit.HOURS.toMillis(1)))
				.signWith(SignatureAlgorithm.HS512, Base64.getEncoder().encode(secret_key.getBytes()))
				.compact();
	}

	//code to get Claims
	public static Claims getClaims(String token, String secret_key) {

		return Jwts.parser()
				.setSigningKey(Base64.getEncoder().encode(secret_key.getBytes()))
				.parseClaimsJws(token)
				.getBody();
	}


}

```

JWT_Test.java

```java
package com.dev.spring.security.jwt;

import java.util.Base64;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

public class JWT_Test {

    private static String secret_key = "J@!gt*K";

	public static void main(String[] args) {

		// code to test generated Token
		String token= JWTUtil.generateToken("Token1", secret_key);
		System.out.println("------------------------TOKEN----------------------------------------------------");
		System.out.println(token);
		System.out.println();
		System.out.println("------------------------CLAIMS----------------------------------------------------");

		//code to test parsed token : Claims

		Claims claims= Jwts.parser()
				.setSigningKey(Base64.getEncoder().encode(secret_key.getBytes()))
				.parseClaimsJws(token)
				.getBody();

		System.out.println("Token ID: "+claims.getId());
		System.out.println("Token Subject: "+claims.getSubject());
		System.out.println("Token Issuer: "+claims.getIssuer());
		System.out.println("Token Issue Date: "+claims.getIssuedAt());
		System.out.println("Token Expiration Date: "+claims.getExpiration());
		System.out.println("Token Audience: "+claims.getAudience());
	}
}
```

### 输出

以下是我们的 POC 的输出。

```css
------------------------TOKEN----------------------------------------------------
eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiJ0azk5MzEiLCJzdWIiOiJUb2tlbjEiLCJpc3MiOiJBQkNfTHRkIiwiYXVkIjoiWFlaX0x0ZCIsImlhdCI6MTYwNzUwNjY0OCwiZXhwIjoxNjA3NTEwMjQ4fQ.lFA0_Jvnt0o69CnotXbTIyYANpWjjeTGxvv6avVihlCqKnuw1bXADp_y3s-NMdohcD2Sq0Cft16wLo7rwvTHpQ

------------------------CLAIMS----------------------------------------------------
Token ID: tk9931
Token Subject: Token1
Token Issuer: ABC_Ltd
Token Issue Date: Wed Dec 09 15:07:28 IST 2020
Token Expiration Date: Wed Dec 09 16:07:28 IST 2020
Token Audience: XYZ_Ltd
```

## 如何在 Spring Boot 项目中实现 JWT 认证？

为了说明 JWT 身份验证的实现，我们肯定需要一个 Web 服务调用。为此，我们将使用 REST Web 服务将一些用户注册到数据库中。为了实现这一点，我们将使用 POSTMAN 软件，因为在这种情况下我们不会有注册表。然后我们将 JWT 安全功能应用到我们的代码中。最后，我们将通过测试验证我们纳入的安全功能。让我们开始相应地实施它。

### 您需要什么软件/技术？

- STS (Spring Tool Suite) : Version-> 4.7.1.RELEASE
- Dependent Starters : Spring Security, Spring Web, Lombok, Spring Data JPA, MySQL Driver, Spring Boot DevTools
- MySQL Database : Version ->8.0.19 MySQL Community Server
- JDK8 or later versions (Extremely tested on JDK8, JDK11 and JDK14)

### 步骤#1：在 STS(Spring Tool Suite) 中创建 Spring Boot Starter 项目

创建入门项目时，选择“Spring Security”、“Spring Web”、“Spring Data JPA”、“MySQL Driver”、“Lombok”和“Spring Boot DevTools”作为入门项目依赖项。另外，如上所述，在 pom.xml 中添加“jaxb”依赖项。即使您不知道如何创建 Spring Boot Starter 项目，也请访问内部链接。另外，如果您想了解有关 Lombok 的更多信息，请访问 Lombok 上的内部链接。

### 步骤#2A：创建实体类 User.java （适用于低于 Spring Boot 3.0 的版本）

User.java

```java
package com.dev.spring.security.jwt.entity;

import java.util.Set;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name="users")
public class User {

	@Id
	@GeneratedValue
	@Column(name="user_id")
	private Integer id;

	@Column(name="user_name")
	private String username;

	@Column(name="user_passwd")
	private String password;

	@Column(name="user_email")
	private String email;

	@ElementCollection(fetch= FetchType.EAGER)
	@CollectionTable(
			name="roles",
			joinColumns = @JoinColumn(name="user_id")
			)
	@Column(name="user_role")
	private Set<String> roles;
}
```

### 步骤#2B：创建实体类 User.java（适用于 Spring Boot 3.0 及更高版本）

在 import 语句中，使用“jakarta”代替“javax”。例如：使用“jakarta.persistence.Entity;”代替“javax.persistence.Entity;”。

User.java

```java
package com.dev.spring.security.jwt.entity;

import java.util.Set;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import lombok.Data;

@Data
@Entity
@Table(name="users")
public class User {

	@Id
	@GeneratedValue
	@Column(name="user_id")
	private Integer id;

	@Column(name="user_name")
	private String username;

	@Column(name="user_passwd")
	private String password;

	@Column(name="user_email")
	private String email;

	@ElementCollection(fetch= FetchType.EAGER)
	@CollectionTable(
			name="roles",
			joinColumns = @JoinColumn(name="user_id")
			)
	@Column(name="user_role")
	private Set<String> roles;
}
```

### 步骤#3：更新 application.properties

```properties
#application.properties

#-------------------- Server Properties ---------------
server.port=8080

#--------------------- DB Connection Properties ------------------
#AutoLoading of driver class since JDBC 4
#spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/testJWTSecurity
spring.datasource.username=root
spring.datasource.password=devs

#--------------------JPA Properties-----------------
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
#spring.jpa.database-platform=org.hibernet.dialect.MySQL8Dialect

#------------------Security Specific Properties-------
app.secret.key=J@!gt*K
```

### 步骤#4：创建接口 UserRepository.java

UserRepository.java

```java
package com.dev.spring.security.jwt.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.spring.security.jwt.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {

	Optional<User> findByUsername(String username);
}
```

### 步骤#5：创建 AppConfig.java

AppConfig.java

```java
package com.dev.spring.security.jwt.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AppConfig {

	@Bean
	public BCryptPasswordEncoder encodePassword() {
		return new BCryptPasswordEncoder();
	}
}
```

### 步骤#6：创建用户服务接口及其实现类

IUserService.java

```java
package com.dev.spring.security.jwt.service;

import java.util.Optional;

import com.dev.spring.security.jwt.entity.User;

public interface IUserService {

	Integer saveUser(User user);

	Optional<User> findByUsername(String username);
}
```

UserServiceImpl.java

```java
package com.dev.spring.security.jwt.service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.dev.spring.security.jwt.entity.User;
import com.dev.spring.security.jwt.repo.UserRepository;

@Service
public class UserServiceImpl implements IUserService, UserDetailsService {

	@Autowired
	private UserRepository userRepo;

	@Autowired
	private BCryptPasswordEncoder bCryptEncoder;

	@Override
	public Integer saveUser(User user) {

		//Encode password before saving to DB
		user.setPassword(bCryptEncoder.encode(user.getPassword()));
		return userRepo.save(user).getId();
	}

	//find user by username
	@Override
	public Optional<User> findByUsername(String username) {
		return userRepo.findByUsername(username);
	}

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		Optional<User> opt = userRepo.findByUsername(username);

		org.springframework.security.core.userdetails.User springUser=null;

		if(opt.isEmpty()) {
			throw new UsernameNotFoundException("User with username: " +username +" not found");
		}else {
			User user =opt.get();	/retrieving user from DB
			Set<String> roles = user.getRoles();
			Set<GrantedAuthority> ga = new HashSet<>();
			for(String role:roles) {
				ga.add(new SimpleGrantedAuthority(role));
			}

			springUser = new org.springframework.security.core.userdetails.User(
							username,
							user.getPassword(),
							ga );
		}

		return springUser;
	}

}
```

### 步骤#7：创建 JWTUtil.java

JWTUtil.java

```java
package com.dev.spring.security.jwt.util;

import java.util.Base64;
import java.util.Date;
import java.util.Random;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class JWTUtil {

	@Value("${app.secret.key}")
	private String secret_key;

	// code to generate Token
	public String generateToken(String subject) {
		String tokenId= String.valueOf(new Random().nextInt(10000));
		return Jwts.builder()
				.setId(tokenId)
				.setSubject(subject)
				.setIssuer("ABC_Ltd")
				.setAudience("XYZ_Ltd")
				.setIssuedAt(new Date(System.currentTimeMillis()))
				.setExpiration(new Date(System.currentTimeMillis() + TimeUnit.HOURS.toMillis(1)))
				.signWith(SignatureAlgorithm.HS512, Base64.getEncoder().encode(secret_key.getBytes()))
				.compact();
	}

	// code to get Claims
	public Claims getClaims(String token) {

		return Jwts.parser()
				.setSigningKey(Base64.getEncoder().encode(secret_key.getBytes()))
				.parseClaimsJws(token)
				.getBody();
	}

	// code to check if token is valid
	public boolean isValidToken(String token) {
		return getClaims(token).getExpiration().after(new Date(System.currentTimeMillis()));
	}

	// code to check if token is valid as per username
	public boolean isValidToken(String token,String username) {
		String tokenUserName=getSubject(token);
		return (username.equals(tokenUserName) && !isTokenExpired(token));
	}

	// code to check if token is expired
	public boolean isTokenExpired(String token) {
		return getExpirationDate(token).before(new Date(System.currentTimeMillis()));
	}

	//code to get expiration date
	public Date getExpirationDate(String token) {
		return getClaims(token).getExpiration();
	}

	//code to get expiration date
	public String getSubject(String token) {
		return getClaims(token).getSubject();
	}
}
```

### 步骤#7：创建 UserRequest 和 UserResponse 模型

UserRequest.java

```java
package com.dev.spring.security.jwt.entity;

import lombok.Data;

@Data
public class UserRequest {

	private String username;
	private String password;
}
```

UserResponse.java

```java
package com.dev.spring.security.jwt.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

	private String token;
	private String message;
}
```

### 步骤#8：创建 UserRestController.java

UserRestController.java

```java
package com.dev.spring.security.jwt.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import com.dev.spring.security.jwt.entity.User;
import com.dev.spring.security.jwt.entity.UserRequest;
import com.dev.spring.security.jwt.entity.UserResponse;
import com.dev.spring.security.jwt.service.IUserService;
import com.dev.spring.security.jwt.util.JWTUtil;

@Controller
@RequestMapping("/user")
public class UserRestController {

	@Autowired
	private IUserService userService;
	@Autowired
	private JWTUtil util;
	@Autowired
	private AuthenticationManager authenticationManager;

	@PostMapping("/saveUser")
	public ResponseEntity<String> saveUser(@RequestBody User user) {

		Integer id = userService.saveUser(user);
		String message= "User with id '"+id+"' saved succssfully!";
		//return new ResponseEntity<String>(message, HttpStatus.OK);
		return ResponseEntity.ok(message);
	}

	@PostMapping("/loginUser")
	public ResponseEntity<UserResponse> login(@RequestBody UserRequest request){

		//Validate username/password with DB(required in case of Stateless Authentication)
		authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
				request.getUsername(), request.getPassword()));
		String token =util.generateToken(request.getUsername());
		return ResponseEntity.ok(new UserResponse(token,"Token generated successfully!"));
	}

	@PostMapping("/getData")
	public ResponseEntity<String> testAfterLogin(Principal p){
		return ResponseEntity.ok("You are accessing data after a valid Login. You are :" +p.getName());
	}
}
```

### 步骤＃9：创建 SecurityFilter.java

SecurityFilter.java

```java
package com.dev.spring.security.jwt.filter;

import java.io.IOException;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.dev.spring.security.jwt.util.JWTUtil;

@Component
public class SecurityFilter extends OncePerRequestFilter {

	@Autowired
	private JWTUtil util;
	@Autowired
	private UserDetailsService userDetailsService;

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {

		// Reading Token from Authorization Header
		String token= request.getHeader("Authorization");
		if(token !=null) {
			String username= util.getSubject(token);
			//if username is not null & Context Authentication must be null
			if(username !=null && SecurityContextHolder.getContext().getAuthentication()==null) {
				UserDetails user= userDetailsService.loadUserByUsername(username);
				boolean isValid=util.isValidToken(token, user.getUsername());
				if(isValid) {
					UsernamePasswordAuthenticationToken authToken=
							new UsernamePasswordAuthenticationToken(username, user.getPassword(), user.getAuthorities());
					authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
					SecurityContextHolder.getContext().setAuthentication(authToken);

				}
			}
		}
		filterChain.doFilter(request, response);
	}

}
```

### 步骤#10：创建 UnAuthorizedUserAuthenticationEntryPoint.java

UnAuthorizedUserAuthenticationEntryPoint.java

```java
package com.dev.spring.security.jwt.config;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class UnAuthorizedUserAuthenticationEntryPoint implements AuthenticationEntryPoint {

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException, ServletException {

		response.sendError(HttpServletResponse.SC_UNAUTHORIZED,"UnAuthorized User");
	}

}
```

### 步骤#11A：创建 SecurityConfig.java（适用于低于 Spring Security 5.7 的版本）

SecurityConfig.java

```java
package com.dev.spring.security.jwt.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.dev.spring.security.jwt.filter.SecurityFilter;

@EnableWebSecurity
@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {

	@Autowired
	private UserDetailsService userDetailsService;

	@Autowired
	private BCryptPasswordEncoder bCryptEncoder;

	@Autowired
	private UnAuthorizedUserAuthenticationEntryPoint authenticationEntryPoint;

	@Autowired
	private SecurityFilter secFilter;

	//Required in case of Stateless Authentication
	@Override @Bean
	protected AuthenticationManager authenticationManager() throws Exception {
		return super.authenticationManager();
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {

		auth.userDetailsService(userDetailsService)
		    .passwordEncoder(bCryptEncoder);
	}

	@Override
	protected void configure(HttpSecurity http) throws Exception {

		http
			.csrf().disable()    /Disabling CSRF as not using form based login
			.authorizeRequests()
			.antMatchers("/user/saveUser","/user/loginUser").permitAll()
			.anyRequest().authenticated()
			.and()
			.exceptionHandling()
			.authenticationEntryPoint(authenticationEntryPoint)
			.and()
			.sessionManagement()
			.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			//To Verify user from second request onwards............
			.and()
			.addFilterBefore(secFilter, UsernamePasswordAuthenticationFilter.class)
			;
	}
}
```

### 步骤#11B：创建 SecurityConfig.java（适用于高于 Spring Security 5.7 且低于 Spring Security 6.0 的版本）

由于根据 Spring 官网发布的公告，WebSecurityConfigurerAdapter 已从 Spring Security 5.7.0-M2 中弃用，因此，2022 年 2 月 21 日，我们将不使用 WebSecurityConfigurerAdapter 来编写 SecurityConfig 类，如下所示：

SecurityConfig.java

```java
package com.dev.spring.security.jwt.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.dev.spring.security.jwt.filter.SecurityFilter;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

	@Autowired
	private UserDetailsService userDetailsService;

	@Autowired
	private BCryptPasswordEncoder bCryptEncoder;

	@Autowired
	private UnAuthorizedUserAuthenticationEntryPoint authenticationEntryPoint;

	@Autowired
	private SecurityFilter secFilter;

	//Required in case of Stateless Authentication
	@Override
	@Bean
	protected AuthenticationManager authenticationManager() throws Exception {
		return super.authenticationManager();
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {

		auth.userDetailsService(userDetailsService)
		    .passwordEncoder(bCryptEncoder);
	}

	@Override
	protected SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

		http
			// .csrf().disable()    /Disabling CSRF as not using form based login
			.authorizeRequests()
			.antMatchers("/user/saveUser","/user/loginUser").permitAll()
			.anyRequest().authenticated()
			.and()
			.exceptionHandling()
			.authenticationEntryPoint(authenticationEntryPoint)
			.and()
			.sessionManagement()
			.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			//To Verify user from second request onwards............
			.and()
			.addFilterBefore(secFilter, UsernamePasswordAuthenticationFilter.class)

			.and()
		    .authenticationProvider(authenticationProvider());

		return http.build();

	}

	@Bean
	public AuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
		authenticationProvider.setUserDetailsService(userDetailsService);
		authenticationProvider.setPasswordEncoder(bCryptEncoder);
		return authenticationProvider;
	}
}
```

### 步骤＃11C：创建 SecurityConfig.java（对于 Spring Security 6.0 及更高版本：Spring Boot 3.0）

从 Spring Security 6.0（2022 年 11 月发布）开始，WebSecurityConfigurerAdapter 已从 Spring Security API 中完全删除。它还影响了 2022 年 11 月新发布的 Spring Boot 3.0。因此，如果您使用 Spring Framework 6.0+ 或 Spring Boot 3.0+，无论哪种情况，SecurityConfig.java 的实现应如下所示。此外，您还可以检查 Spring Framework 6.0 中与 Spring Security 相关的更改。

SecurityConfig.java

```java
package com.dev.spring.security.jwt.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.dev.spring.security.jwt.filter.SecurityFilter;

@EnableWebSecurity
@Configuration
public class SecurityConfig {

	@Autowired
	private UserDetailsService userDetailsService;

	@Autowired
	private BCryptPasswordEncoder bCryptEncoder;

	@Autowired
	private UnAuthorizedUserAuthenticationEntryPoint authenticationEntryPoint;

	@Autowired
	private SecurityFilter secFilter;

	//Required in case of Stateless Authentication
	@Override
	@Bean
	protected AuthenticationManager authenticationManager() throws Exception {
		return super.authenticationManager();
	}

	@Override
	protected void configure(AuthenticationManagerBuilder auth) throws Exception {

		auth.userDetailsService(userDetailsService)
		    .passwordEncoder(bCryptEncoder);
	}

	@Override
	protected SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

		http
			// .csrf().disable()    /Disabling CSRF as not using form based login
			.authorizeHttpRequests()
			.requestMatchers("/user/saveUser","/user/loginUser").permitAll()
			.anyRequest().authenticated()
			.and()
			.exceptionHandling()
			.authenticationEntryPoint(authenticationEntryPoint)
			.and()
			.sessionManagement()
			.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			/To Verify user from second request onwards............
			.and()
			.addFilterBefore(secFilter, UsernamePasswordAuthenticationFilter.class)

			.and()
		    .authenticationProvider(authenticationProvider());

		return http.build();

	}

	@Bean
	public AuthenticationProvider authenticationProvider() {
		DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
		authenticationProvider.setUserDetailsService(userDetailsService);
		authenticationProvider.setPasswordEncoder(bCryptEncoder);
		return authenticationProvider;
	}
}
```

Finally, your project structure should look like below screenshot.
最后，您的项目结构应如下图所示。

![img](../../../images/JWT4-1.webp)

## 如何测试启用 JWT 安全的应用程序？

虽然“测试”这个词对开发人员来说看起来很容易，但它同样重要，因为它提供了我们整体实施的结果。因此，请按照以下步骤操作：

### 1) 使用 Postman 通过 REST 调用注册用户

在 Postman 中输入 URL http://localhost:8080/user/saveUser，选择 POST 方法，然后分别选择 Body>Raw>JSON。现在粘贴下面的 JSON 数据，然后单击“发送”按钮。

```json
{
“username”: “ds2525”,
“password”: “donotforgetme”,
“email”: “ds2525@gmail.com”,
“roles”: [“Admin”,”Manager”]
}
```

您应该得到以下回复：

```bash
User with id ‘1’ saved succssfully!
```

### 2）以用户身份登录生成令牌

在 Postman 中输入 URL http://localhost:8080/user/loginUser，选择 POST 方法，然后分别选择 Body>Raw>JSON。现在粘贴下面的 JSON 数据，然后单击“发送”按钮。

```json
{
“username”: “ds2525”, “用户名”：“ds2525”，
“password”: “donotforgetme”,
“密码”：“不要忘记我”，
}
```

您应该得到以下回复：

```css
 {
  "token":"eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI0MzI5Iiwic3ViIjoiZHMyNDI0IiwiaXNzIjoiQUJDX0x0ZCIsImF1ZCI6IlhZWl9MdGQiLCJpYXQiOjE2MDc0MzA5OTIsImV4cCI6MTYwNzQzNDU5Mn0.hIET_EjL6dqgdUMX-dH9a7msPHSO5-GlLFfSotXWWvvxO69hVOLjkiUGYKBZDyux0QRA_bb75Mpp34EOXLHYiw","message": "Token generated successfully!";
}
```

如果输入了错误的用户名/密码，则输出将如下所示：

```css
{
"timestamp": "2020-12-08T12:38:25.778+00:00",
"status": 401,
"error": "Unauthorized",
"trace": "org.springframework.security.authentication.BadCredentialsException: Bad credentials\r\n\tat org.....................................
"message": "UnAuthorized User",
"path": "/user/loginUser"
}
```

### 3）在 token 有效期内访问数据/资源

在 Postman URL 栏中输入 URL http://localhost:8080/user/getData，选择 POST 方法，然后选择 Headers。在标题下选择密钥作为“授权”。现在将令牌粘贴为授权值，如下面的屏幕截图所示。然后单击“发送”按钮。

![How To Implement JWT Authentication In Spring Boot Project?](../../../images/JWT1-3.webp)

作为成功的响应，您应该得到以下输出：

```
You are accessing data after a valid Login. You are :ds2525
```

## 概括

在完成“如何在 Spring Boot 项目中实现 JWT 身份验证？”的所有理论和示例部分之后，最后，我们能够在 Spring Boot 项目中实现 JWT 身份验证安全性。当然，在这篇文章中我们已经彻底了解了 JWT 认证特性。同样，我们希望您进一步扩展此示例并在您的项目中相应地实现它。另外，如果将来有任何变化，我们将相应地更新文章。

另外，欢迎在评论区提出你的意见。

原文链接：[https://javatechonline.com/how-to-implement-jwt-authentication-in-spring-boot-project/](https://javatechonline.com/how-to-implement-jwt-authentication-in-spring-boot-project/)
