---
title: "[译]SPRING BOOT JWT - 如何使用 SPRING SECURITY 和 JSON WEB 令牌保护您的 REST API"
date: 2023-09-19T14:00:00+08:00
slug: spring-security-jwt
categories: ["Java"]
tags: [java, spring, "spring boot", "spring security", oauth2]
---

如果您快速搜索如何使用 JSON Web Tokens 在 Spring Boot 中保护 REST API，您会发现很多相同的结果。这些结果包含一种方法，该方法涉及编写自定义过滤器链并引入第三方库来编码和解码 JWT。

在看完这些令人费解且令人困惑的教程后，我说必须有一种更简单的方法来做到这一点。我做了任何直接接触 Spring Security 团队的人都会做的事情，我向他们寻求帮助。他们告诉我，Spring Security 确实使用 oAuth2 资源服务器内置了对 JWT 的支持。

在本教程中，您将学习如何使用 JSON Web Tokens (JWT) 和 Spring Security 来保护您的 API。我并不是说这种方法无论如何都很容易，但对我来说，它比其他选择更有意义。

[Github 存储库](https://github.com/danvega/jwt)

## 应用架构

在我们开始编写一些代码之前，我想确保我们对于我们正在构建的内容都达成共识。在下面的示例中，您有一个客户端应用程序，它可以是一个简单的命令行应用程序、一个用 Angular 或 Vue 等编写的完整前端应用程序，或者系统中的其他一些服务。

该客户端应用程序将调用使用 Spring Boot 编写的服务器应用程序，该应用程序通过 REST API 公开数据。在下面的示例中，它是一个整体，但如果您有分布式架构，则同样适用。当前有 3 个 REST 控制器公开资源产品、订单和客户。

您要做的是保护所有资源，以便当客户端调用 REST API 时，客户端将收到 401（未经授权），这意味着客户端请求尚未完成，因为它缺少所请求资源的有效身份验证凭据。

![Application Architecture: 401 Unauthorized](https://www.danvega.dev/assets/static/app-arch-401.f374804.0962d1509d07acba537f6129298c4fa5.png)

### JSON 网络令牌 (JWT)

JSON Web 令牌是一种开放方法，用于在两方之间安全地表示声明。 JWT 是一组声明（JSON 属性-值对），它们共同构成一个 JSON 对象。它由三部分组成：

- Header: 由两个属性组成：{ "alg": "HS256", "typ": "JWT" }。 alg 是用于加密 JWT 的算法。
- Payload: 这是存储要发送的数据的地方；该数据存储为 JSON 属性-值对。
- Signature: 这是通过加密创建的，使用标头中指定的算法：（i）base64Url 编码的标头，（ii）base64Url 编码的有效负载，以及（iii）秘密（或私钥）：

```
HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret|privateKey)
```

最终的 JWT 由三部分组成。每个都是 base64Url 编码的，并且与下一个之间用点分隔。有关更多详细信息，请参阅 openid.net 和 jwt.io 网站。

您将引入一个新的身份验证控制器，客户端可以使用其身份验证凭据（用户名 + 密码）向该控制器发出请求，并且当成功通过身份验证时，服务将返回 JWT。

![Application Architecture: JSON Web Token (JWT)](https://www.danvega.dev/assets/static/app-arch-jwt.f374804.0d833a85e47f7d3f2d2662ffc1e13ede.png)

然后，客户端将存储 JWT，并且每个后续请求将通过 Authorization 标头传递它。当服务器应用程序收到带有 JWT 的请求时，它将验证它是否是有效令牌，如果是，则允许请求继续。

![Application Architecture: Request with JSON Web Token (JWT)](https://www.danvega.dev/assets/static/app-arch-with-jwt-200.f6e5db1.507593f0d844675167707e10fc94cf72.png)

## 入门

首先，您将前往 start.spring.io 并创建一个新项目。填写项目的元数据并添加以下依赖项：

- Spring Web
- oAuth2 Resource Server oAuth2
- Spring Configuration Processor

![Spring Initiliazr](https://www.danvega.dev/assets/static/start-spring-io.42db587.ed9464eb8a6d436a6fcb7502aaeaa00c.png)

这将在您的 `pom.xml` 中生成以下依赖项

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-configuration-processor</artifactId>
    <optional>true</optional>
</dependency>
```

我知道你在想什么，Spring Security 怎么样？如果您深入研究 `spring-boot-starter-oauth2-resource-server` ，您会发现它包含 Spring Security Starter，其中包含您需要的一切。

## REST API

您需要做的第一件事是创建一个您想要保护的 REST API。出于演示目的并保持简单，使用返回字符串的单个方法在 `controller` 包中创建 `HomeController` 。请求映射处理程序方法可以接受一系列参数，其中之一是 `java.security.Principal` 。这将允许您打印出当前经过身份验证的用户的用户名。

Spring Security 采用默认安全的安全方法。这意味着，如果您启动应用程序并尝试访问 http://localhost:8080，您将被重定向到登录页面。如果您想登录，可以输入用户名 `user` ，密码将生成并应在控制台输出中列出。

```java
@RestController
public class HomeController {

	@GetMapping
    public String home(Principal principal) {
        return "Hello, " + principal.getName();
    }

}
```

![Spring Security Login](https://www.danvega.dev/assets/static/please-sign-in.42db587.ffed1af8b1a6885620ffbe7f761b1441.png)

## SPRING 安全配置

默认的安全配置足以让您启动并运行，但您需要提供自己的安全配置来满足应用程序的需求。过去，您可以扩展 `WebSecurityConfigurerAdapter` ，但这在 Spring Security 5.7.x 中已被弃用。如果您有兴趣了解有关此更改的更多信息，可以查看[本教程](https://youtu.be/s4X4SJv2RrU)。

首先，在 `config` 包中创建一个名为 `SecurityConfig` 的新类。该类将具有以下配置：

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable()) // (1)
                .authorizeRequests( auth -> auth
                        .anyRequest().authenticated() // (2)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // (3)
                .httpBasic(Customizer.withDefaults()) // (4)
                .build();
    }

}
```

1. 禁用跨站点请求伪造 (CSRF)
2. 应针对应用程序中的任何请求对用户进行身份验证。
3. Spring Security 永远不会创建 HttpSession，也永远不会使用它来获取安全上下文。
4. Spring Security 的 HTTP 基本身份验证支持默认启用。但是，一旦提供任何基于 servlet 的配置，就必须显式提供 HTTP Basic。

⚠️ 警告：在启用会话管理的同时，切勿禁用 CSRF 保护！这样做会使您面临跨站点请求伪造攻击。

现在您已经有了自定义安全配置，您需要一个不是 Spring Boot 提供的默认用户的用户。以下配置将使用 `NoOpPasswordEncoder` 创建内存中用户。这是一个密码编码器，不执行任何操作，对于测试很有用，但不应在生产中使用。

```java
@Bean
public InMemoryUserDetailsManager users() {
    return new InMemoryUserDetailsManager(
            User.withUsername("dvega")
                    .password("{noop}password")
                    .authorities("read")
                    .build()
    );
}
```

配置新用户后，您应该能够重新启动应用程序并访问 http://localhost:8080。您将看到一个对话框，要求输入用户名和密码，如果一切正常，您应该能够使用 `dvega` + `password` 登录。

![Spring Security HTTP Basic](https://www.danvega.dev/assets/static/http-basic-auth.42db587.59885479c41b23db4fa6810d75cfaa42.png)

## OAUTH 2.0 资源服务器

如果您看过我之前的教程，那么您到目前为止所做的一切应该很熟悉，但我知道这不是您来这里的目的。 Spring Security 支持使用两种形式的 OAuth 2.0 不记名令牌保护端点：

- JWT
- Opaque Tokens

在应用程序将其权限管理委托给[授权服务器](https://tools.ietf.org/html/rfc6749)（例如，Okta 或 [Spring 授权服务器](https://spring.io/projects/spring-authorization-server)）的情况下，这非常方便。资源服务器可以咨询该授权服务器来授权请求 ​​。

在本教程中，您将使用自签名 JWT，这将无需引入授权服务器。虽然这适用于本示例，但您的应用程序要求可能有所不同，因此什么时候不再接受使用自签名 JWT？我也向 Spring Security 团队提出了这个问题，并得到了一些非常好的答案。

> 当您达到无法接受自签名 JWT 的权衡时。一个例子可能是您想要引入刷新令牌的时刻。

> 我想补充一点，当您拥有多个服务或者您希望能够强化安全性时，不同的授权服务器更有意义（隔离像身份验证这样重要的东西可以提供价值，因为攻击面减少了）

我们可能会花很多时间讨论授权和资源服务器。为了让本教程围绕这个主题，我将给您留下一些非常好的资源，我建议您在有时间时阅读它们。

- [OAuth2 Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/index.html)
- [OAuth2 Resource Server JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
- [Spring Authorization Server](https://spring.io/projects/spring-authorization-server)

### OAUTH 2 资源服务器配置

现在您已经知道什么是资源服务器以及它的用途，您需要配置一个。您可以通过设置 `.oauth2ResourceServer()` 在安全配置中执行此操作。这可以是自定义资源服务器配置器，或者您可以使用 Spring 提供的 `OAuth2ResourceServerConfigurer` 类。

`OAuth2ResourceServerConfigurer` 是 OAuth 2.0 资源服务器支持的 `AbstractHttpConfigurer` 。默认情况下，这会连接一个 `BearerTokenAuthenticationFilter` ，它可用于解析对承载令牌的请求并进行身份验证尝试。

该配置类有以下可用选项：

- `accessDeniedHandler` - 自定义处理拒绝访问错误的方式。
- `authenticationEntryPoint` - 自定义如何处理身份验证失败。
- `bearerTokenResolver` - 自定义如何从请求中解析承载令牌。
- `jwt`(Customizer) - 启用 Jwt 编码的不记名令牌支持。
- `opaqueToken`(Customizer) -启用不透明的不记名令牌支持。

您将使用 JWT，因此配置选项可以使用方法引用，并且看起来像 `OAuth2ResourceServerConfigurer::jwt`

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
            .csrf(csrf -> csrf.disable())
            .authorizeRequests( auth -> auth
                    .anyRequest().authenticated()
            )
            .oauth2ResourceServer(OAuth2ResourceServerConfigurer::jwt)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .httpBasic(withDefaults())
            .build();
}
```

当您使用 JWT 定制器时，您需要提供以下其中一项：

- 通过 `OAuth2ResourceServerConfigurer.JwtConfigurer.jwkSetUri` 提供 Jwk Set Uri
- 通过 `OAuth2ResourceServerConfigurer.JwtConfigurer.decoder` 提供 JwtDecoder 实例
- 公开 JwtDecoder bean。

如果您尝试运行该应用程序而不提供上述选项之一，您将收到以下错误：

```
Description:

Parameter 0 of method setFilterChains in
org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration
required a bean of type 'org.springframework.security.oauth2.jwt.JwtDecoder' that could not be found.

Action:

Consider defining a bean of type 'org.springframework.security.oauth2.jwt.JwtDecoder'
in your configuration.
```

### 签署 JSON 网络令牌

下一步是创建一个新的 `JwtDecoder` bean，但我认为我们需要讨论一下我们将在这里做什么。正如您之前了解到的，JWT 由 3 个部分组成：标头、有效负载和签名。签名是通过加密标头+有效负载和秘密（或私钥）来创建的。

JWT 可以使用对称密钥（共享密钥）或非对称密钥（私有-公共对的私有密钥）进行加密。

- 对称密钥：相同的密钥用于加密（创建 JWT 时）和解密（MobileTogether Server 使用该密钥来验证 JWT）。对称密钥（也称为共享密钥）作为设置存储在 MobileTogether Server 中。有关使用对称密钥的详细信息，请参阅对称密钥：共享密钥。
- 非对称密钥：加密（私钥）和解密（公钥）使用不同的密钥。公钥作为设置存储在 MobileTogether 服务器中，以便可以验证 JWT。有关对 JWT 使用非对称加密的信息，请参阅非对称密钥：公钥。

每种方法都有优点/缺点，但通常建议您使用非对称密钥，因此这就是您在此处采用的方法。

### 公钥和私钥

您将创建一个公钥/私钥对。您可以通过代码来完成此操作，但我认为如果您在这里手动执行此操作可能会更有意义。我将在 `/src/main/rescurces/certs` 下的新文件夹中创建它们。我将使用默认安装在 macOS 上的 OpenSSL，但您应该能够在您使用的任何操作系统上安装它。

通常情况下，您可以运行前两个命令。第三条命令的原因是私钥需要采用 PEM 编码的 PKCS#8 格式。切换到该 certs 目录并分别运行以下每个命令。

```bash
# create rsa key pair
openssl genrsa -out keypair.pem 2048

# extract public key
openssl rsa -in keypair.pem -pubout -out public.pem

# create private key in PKCS#8 format
openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in keypair.pem -out private.pem
```

如果一切运行没有错误并且您同时拥有公钥和私钥，则可以删除 `keypair.pem`

### JWTDECODER

公钥和私钥就位后，您可以将注意力集中到定义 `JwtDecoder` bean 上。首先，在 `config` 包中创建一个名为 `RsaKeyProperties` 的新记录类，这将用于外部化公钥和私钥。

```java
@ConfigurationProperties(prefix = "rsa")
public record RsaKeyProperties(RSAPublicKey publicKey, RSAPrivateKey privateKey) {

}
```

如果您运行构建并打开 `application.properties` ，您应该获得私钥和公钥配置的 IntelliSense。添加以下配置，以便您的应用程序可以找到您的密钥。

```bash
rsa.private-key=classpath:certs/private.pem
rsa.public-key=classpath:certs/public.pem
```

接下来，您需要在主类上启用配置属性：

```java
@SpringBootApplication
@EnableConfigurationProperties(RsaKeyProperties.class)
public class JwtDemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(JwtDemoApplication.class, args);
	}

}
```

回到 `SecurityConfig` ，您可以获取自动装配的实例：

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final RsaKeyProperties rsaKeys;

    public SecurityConfig(RsaKeyProperties rsaKeys) {
        this.rsaKeys = rsaKeys;
    }
```

现在您可以使用公钥创建 `JwtDecoder` 。这是您通常需要引入第三方库的事情，但您不需要这样做。资源服务器为您带来的依赖项之一是 ``spring-security-oauth2-jose`，它包含一个名为 Nimbus Jose JWT 的库。您可以使用刚刚创建的公钥返回 Nimbus JWT 解码器。

```java
@Bean
JwtDecoder jwtDecoder() {
    return NimbusJwtDecoder.withPublicKey(rsaKeys.publicKey()).build();
}
```

此时，您应该能够运行该应用程序而不会出现任何错误。

## 身份验证控制器和令牌服务

您已准备好密钥并定义了解码器，这是一种破译 JWT 的方法。如果您还记得之前的架构图，用户将需要使用用户名和密码登录。如果他们通过身份验证，您将生成一个新的 JSON Web 令牌并将其在响应中发回。

![Application Architecture: JSON Web Token (JWT)](https://www.danvega.dev/assets/static/app-arch-jwt.f374804.0d833a85e47f7d3f2d2662ffc1e13ede.png)

为此，您首先需要创建一个 `JwtEncoder` 类型的 bean，并且可以在 `SecurityConfig` 中执行此操作。编码器将用于将我们之前了解的签名编码为令牌，并使用我们的私钥对其进行签名。

```java
@Bean
JwtEncoder jwtEncoder() {
    JWK jwk = new RSAKey.Builder(rsaKeys.publicKey()).privateKey(rsaKeys.privateKey()).build();
    JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));
    return new NimbusJwtEncoder(jwks);
}
```

您可以直接在身份验证控制器中使用编码器，但我觉得您应该将其提取到服务层。在名为 `service` 的新包中创建一个名为 `TokenService` 的新类，该类将使用新的 `JwtEncoder` 生成令牌。在以下示例中，令牌将在 1 小时后过期，但您可以调整它以满足您的需要。

```java
@Service
public class TokenService {

    private final JwtEncoder encoder;

    public TokenService(JwtEncoder encoder) {
        this.encoder = encoder;
    }

    public String generateToken(Authentication authentication) {
        Instant now = Instant.now();
        String scope = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(" "));
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("self")
                .issuedAt(now)
                .expiresAt(now.plus(1, ChronoUnit.HOURS))
                .subject(authentication.getName())
                .claim("scope", scope)
                .build();
        return this.encoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

}
```

接下来在 `controller` 包中创建一个名为 `AuthController` 的新控制器。这将包含一个 POST 方法，该方法将使用新的令牌服务为经过身份验证的用户生成令牌。正如您所看到的，有一些用于调试目的的日志记录，以便在开发中您将看到用户请求 JWT 和创建的令牌。

```java
@RestController
public class AuthController {

    private static final Logger LOG = LoggerFactory.getLogger(AuthController.class);

    private final TokenService tokenService;

    public AuthController(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @PostMapping("/token")
    public String token(Authentication authentication) {
        LOG.debug("Token requested for user: '{}'", authentication.getName());
        String token = tokenService.generateToken(authentication);
        LOG.debug("Token granted: {}", token);
        return token;
    }

}
```

如果一切都正确完成，您应该能够毫无错误地启动您的应用程序。

## SPRING 安全测试

这样，您应该使用 JWT 保护您的根路径。现在您只需要测试一下即可。

### 手动测试

您可以通过多种方法手动测试这一点，但在本教程中，我将向您展示 2.

**Postman**

测试这一点的一个简单方法是使用 Postman 等工具。如果您向令牌端点创建新的 POST 请求，您可以从“授权”选项卡中选择“基本身份验证”并输入您的凭据。如果一切正常，您将在响应中返回生成的 JWT。

![Postman Basic Auth](https://www.danvega.dev/assets/static/postman-basic-auth.42db587.e23a2ab227f6b4c42ea5a7dda30c2096.png)

复制 JWT 并为 http://localhost:8080 创建新的 GET 请求。转到“授权”选项卡并选择“承载令牌”并粘贴生成的令牌。如果您发送请求，您应该取回从 `HomeController` 中的 home 方法返回的字符串。

![Postman with JWT Response](https://www.danvega.dev/assets/static/postman-with-jwt-response.42db587.b0c6661e760ad4f110496be102413c38.png)

**命令行**

我非常喜欢命令行和 [httpie](https://httpie.io/) 工具。它简化了在终端中测试 API 的命令的编写。您可以使用以下命令使用您的凭据向令牌端点发送请求：

```bash
http POST :8080/token --auth dvega:password -v
```

`-v` 参数将打印请求和响应

![Httpie with Authorization](https://www.danvega.dev/assets/static/httpie-auth.42db587.6370b61c99685b116d4b436f5339d2f3.png)

响应将包含生成的 JWT 令牌。如果您在没有授权标头或没有正确令牌的情况下向根路径发出请求，您将收到 401（拒绝）响应。但是，如果您以正确的格式包含 Authorization 标头，您将获得从 `HomeController` 中的 home 方法返回的字符串。

```bash
http :8080 'Authorization: Bearer JWT_TOKEN_HERE'
```

![Httpie Response Success](https://www.danvega.dev/assets/static/httpie-success.42db587.ed172ae5e4c8e03c2cc236c582715f45.png)

### 自动化测试

手动测试很棒，因为您可以看到一切都按预期运行。但是，您将需要一些适当的自动化测试，以便在进行更改时您可以确信没有任何内容破坏现有功能。我不会对此进行过多讨论，但我想为您提供一个简单的示例来说明如何编写此类测试。

当您引入资源服务器时，有一个依赖项没有引入，那就是 `spring-security-test` 。在编写任何与安全相关的测试之前，您需要将其添加到您的 `pom.xml` 中。

```xml
<dependency>
	<groupId>org.springframework.security</groupId>
	<artifactId>spring-security-test</artifactId>
</dependency>
```

当您编写仅关注 Web 层配置的切片测试时，服务类将不会添加到应用程序上下文中。为了使一切正常工作，您需要手动导入 `SercurityConfig` 和 `TokenService` 类。这些测试应该是不言自明的，但如果您希望我进行这些测试，请联系我并告诉我。

```java
@WebMvcTest({HomeController.class, AuthController.class})
@Import({SecurityConfig.class, TokenService.class})
class HomeControllerTest {

    @Autowired
    MockMvc mvc;

    @Test
    void rootWhenUnauthenticatedThen401() throws Exception {
        this.mvc.perform(get("/"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rootWhenAuthenticatedThenSaysHelloUser() throws Exception {
        MvcResult result = this.mvc.perform(post("/token")
                        .with(httpBasic("dvega", "password")))
                .andExpect(status().isOk())
                .andReturn();

        String token = result.getResponse().getContentAsString();

        this.mvc.perform(get("/")
                        .header("Authorization", "Bearer " + token))
                .andExpect(content().string("Hello, dvega"));
    }

    @Test
    @WithMockUser
    public void rootWithMockUserStatusIsOK() throws Exception {
        this.mvc.perform(get("/")).andExpect(status().isOk());
    }

}
```

## 结论

当我开始创建本教程时，我的全部目标是让您知道有一种更简单的方法可以使用 JWT 来保护您的 API。我希望现在您知道 Spring Security 使用 oAuth2 资源服务器内置了对 JSON Web 令牌的支持，您可以在下一个项目中使用它。这只是如何在 Spring Boot 应用程序中使用 JWT 的起跑线，绝不是终点线。如果您对具体配置有疑问，请[与我联系](https://twitter.com/therealdanvega)。

我感到非常幸运，能够在 VMware 这样的公司工作，并且能够接触到一些非常聪明的人。当您与一群总是愿意分享知识和提供帮助的优秀人士一起工作时，这种访问就意味着更重要。我要特别感谢以下帮助我将这些内容整合在一起的人：

- Steve Riesenberg
- Rob Winch
- Josh Cummings
- Toshiaki Maki
