---
title: "【译】Spring Security 和 JWT 入门"
date: 2024-06-19 08:00:00+08:00
draft: false
slug: "spring-security-jwt-guard"
categories: [ "translation" ]
tags: [ "spring-boot", "security", "jwt" ]
description: "本文介绍 JWT 的基本结构、常见使用场景与局限，并通过一个 Spring Boot 示例说明如何在 Spring Security 中实现基于 JWT 的认证、异常处理、Swagger 配置与测试。"
canonicalURL: "https://reflectoring.io/spring-security-jwt/"
---

[Spring Security](https://docs.spring.io/spring-security/reference/index.html) 为 Java 应用程序提供了一套全面的安全功能，涵盖身份验证、授权、会话管理，以及针对 [CSRF（Cross-Site Request Forgery）](https://reflectoring.io/spring-csrf/) 等常见安全威胁的防护。

Spring Security 框架具有高度可定制性，允许开发人员根据应用程序需求来安排安全配置。它提供了一个灵活架构，支持多种认证机制，例如 Basic Authentication、JWT 和 OAuth。

Spring Security 开箱即提供 Basic Authentication。要了解其工作方式，可以参考[这篇文章](https://reflectoring.io/spring-security/)。在本文中，我们将深入看看 JWT 的工作原理，以及如何在 Spring Security 中配置它。

## 示例代码

本文附带了一个可运行的代码示例，见 [GitHub](https://github.com/thombergs/code-examples/tree/master/spring-security-jwt/getting-started)。

## 什么是 JWT

JWT（JSON Web Token）是一种在双方之间安全传递 JSON 消息的方式。它是 [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519) 中定义的标准。

JWT token 中包含的信息之所以可以被验证并被信任，是因为它经过了数字签名。JWT 可以使用密钥（基于 HMAC 算法）签名，也可以使用 RSA 或 ECDSA 的公钥/私钥对进行签名。

在本文中，我们会使用密钥来创建 JWT token，并用它保护我们的 REST 端点。

## JWT 结构

在这一节中，我们先看一个 JWT 的示例结构。

一个 JSON Web Token 由三部分组成：

- Header
- Payload
- Signature

### JWT Header

Header 由两部分组成：token 的类型（也就是 JWT），以及所使用的签名算法，例如 HMAC SHA 256 或 RSA。

示例 JSON Header：

```json
{
 "alg": "HS256",
 "typ": "JWT"
}
```

这个 JSON 随后会被做 Base64 编码，从而形成 JWT token 的第一部分。

### JWT Payload

Payload 是包含实际数据的主体。这里的数据可以是用户数据，也可以是任何需要被安全传输的信息。

这些数据也被称为 claims。claims 有三种类型：registered、public 和 private。

#### Registered Claims

它们是一组预定义的三字符 claims，定义在 [RFC7519](https://datatracker.ietf.org/doc/html/rfc7519#section-4.1) 中。

其中一些常见的 claim 包括 `iss`（Issuer Claim）、`sub`（Subject Claim）、`aud`（Audience Claim）、`exp`（Expiration Time Claim）、`iat`（Issued At Time）和 `nbf`（Not Before）。

下面分别看看它们：

- `iss`：用于指定 JWT 的颁发者。它用来标识签发 token 的实体，例如认证服务器或身份提供者。
- `sub`：用于标识 JWT 的主题，也就是这个 token 是为哪个用户或实体签发的。
- `aud`：用于指定 JWT 的目标受众。通常用来限制 token 只可用于某些服务或应用。
- `exp`：用于指定 JWT 的过期时间。一旦超过这个时间，token 就不再被视为有效。它以 Unix Epoch 以来的秒数表示。
- `iat`：JWT 被签发的时间。它可以用来判断 JWT 的年龄。同样以 Unix Epoch 以来的秒数表示。
- `nbf`：标识 JWT 在这个时间之前不能被接受处理。

完整的 registered claims 列表可以[在这里查看](https://www.iana.org/assignments/jwt/jwt.xhtml#claims)。后面的章节里，我们会看几个实际使用它们的例子。

#### Public Claims

和拥有预定义含义的 registered claims 不同，public claims 可以根据应用需求进行定制。

大多数 public claims 会落在以下几类中：

- **用户/客户端数据**：包括用户名、clientId、邮箱、地址、角色、权限、scope、privilege，以及任何用于认证或授权的用户/客户端相关信息。
- **应用数据**：包括会话详情、用户偏好（例如语言偏好）、应用设置，或任何应用特定数据。
- **安全信息**：包括其他安全相关信息，例如密钥、证书、token 等。

#### Private Claims

Private claims 是特定组织内部使用的自定义 claims。它们不属于官方 JWT 规范中的标准定义，而是由参与 JWT 交换的各方自行约定。

#### JWT Claims 的推荐最佳实践

- 尽可能使用 JWT 规范中定义的标准 claims。它们被广泛认可，而且含义明确。
- 为了获得更好的可维护性，JWT payload 应该只保留最少必要的 claims，并尽量限制 token 大小。
- Public claims 应该有清晰且具描述性的名称。
- 遵循一致的命名约定，以保持一致性和可读性。
- 避免包含 PII 信息，以降低数据暴露风险。
- 确保 JWT 使用 `alg` registered claim 下[推荐的算法](https://www.iana.org/assignments/jose/jose.xhtml#web-signature-encryption-algorithms)进行加密或签名。`alg` 为 `none` 表示 JWT 未签名，不推荐使用。

### JWT Signature

要创建 Signature，我们需要对 Header 编码、对 Payload 编码，并使用 Header 中指定的算法配合一个密钥对这些内容进行签名。

生成的 token 会由三个 Base64 URL 字符串组成，它们之间以点号分隔。

Signature 的目的，是验证消息在传输过程中没有被篡改。

由于它还会使用密钥进行签名，因此它也能验证 JWT 的发送方确实就是其所宣称的那个实体。

## JWT 的常见使用场景

JWT 非常灵活，可以用于多种场景，例如：

- **Single Sign-On**：JWT 可以通过在多个服务或应用之间共享用户认证结果，来支持单点登录。用户登录一个应用后，会拿到一个 JWT，这个 token 可以用于登录其他有权限访问的服务，而无需为每个服务分别输入和维护一套独立凭据。
- **API 认证**：JWT 常用于 API 的认证与授权。客户端会把 JWT token 放在 API 请求的 `Authorization` Header 中，服务端解析 JWT 后，再决定授予或拒绝访问。
- **无状态会话**：JWT 有助于提供无状态会话管理，因为会话信息就存储在 token 自身之中。
- **信息交换**：由于 JWT 既安全又可靠，它不仅可以传递用户信息，也可以传递任何需要在双方之间安全交换的信息。
- **微服务**：在微服务体系中，JWT 是最常见的 API 通信手段之一。因为一个微服务可以独立验证 token，而无需依赖外部认证服务器，这让系统更容易扩展。

## 使用 JWT 的注意事项

现在我们已经了解了 JWT 带来的好处，接下来看看它的代价。这里的目的，是帮助开发者权衡手头的方案，并对是否在应用中采用基于 token 的架构做出更有依据的判断。

- 在 JWT 替代 session 的场景中，如果我们最终使用了很大的 payload，JWT token 就会膨胀。再加上加密签名带来的额外开销，整体性能成本可能变得过高。对于仅仅存储简单用户会话的场景来说，这样做可能会显得过度设计。
- JWT 会在一定时间后过期，过期之后 token 就需要刷新，并重新生成新的 token。从安全角度看，这很好，但过期时间需要被仔细设计。比如，把过期时间设置为 24 小时，就是一个不太好的设计决策。

在看完这些关注点之后，我们就更有能力判断何时应该使用 JWT，何时不该使用。

下一节，我们会在 Java 中创建一个简单的 JWT token。

## 在 Java 中创建 JWT Token

[JJWT](https://github.com/jwtk/jjwt) 是 Java 和 Android 中最常用来创建 JWT token 的库之一。

我们先把它的依赖加入应用中。

### 配置 JWT 依赖

Maven 依赖：

```xml
<dependency>
 <groupId>io.jsonwebtoken</groupId>
 <artifactId>jjwt-api</artifactId>
 <version>0.11.1</version>
</dependency>
<dependency>
 <groupId>io.jsonwebtoken</groupId>
 <artifactId>jjwt-impl</artifactId>
 <version>0.11.1</version>
 <scope>runtime</scope>
</dependency>
<dependency>
 <groupId>io.jsonwebtoken</groupId>
 <artifactId>jjwt-jackson</artifactId>
 <version>0.11.1</version>
 <scope>runtime</scope>
</dependency>
```

Gradle 依赖：

```groovy
compile 'io.jsonwebtoken:jjwt-api:0.11.1'
runtime 'io.jsonwebtoken:jjwt-impl:0.11.1'
runtime 'io.jsonwebtoken:jjwt-jackson:0.11.1'
```

本文中的 Java 应用是基于 Maven 的，因此我们会把上面的 Maven 依赖加入 `pom.xml`。

### 创建 JWT Token

我们会使用 `io.jsonwebtoken` 包中的 `Jwts` 类。我们可以指定 claims（包括 registered 和 public claims）以及其他 JWT 属性，并像下面这样创建一个 token：

```java
public static String createJwt() {
 return Jwts.builder()
 .claim("id", "abc123")
 .claim("role", "admin")
 /*.addClaims(Map.of("id", "abc123",
 "role", "admin"))*/
 .setIssuer("TestApplication")
 .setIssuedAt(java.util.Date.from(Instant.now()))
 .setExpiration(Date.from(Instant.now().plus(10, ChronoUnit.MINUTES)))
 .compact();
 }
```

这个方法会创建一个如下所示的 JWT token：

```text
eyJhbGciOiJub25lIn0.eyJpZCI6ImFiYzEyMyIsInJvbGUiOiJhZG1pbiIsImlzcyI6IlR
lc3RBcHBsaWNhdGlvbiIsImlhdCI6MTcxMTY2MTA1MiwiZXhwIjoxNzExNjYxNjUyfQ.
```

接下来看看这里用到的 builder 方法：

- `claim`：允许我们指定任意数量的自定义键值 claims。作为替代，也可以用 `addClaims` 一次性传入一个 claims map。
- `setIssuer`：对应 registered claim `iss`。
- `setIssuedAt`：对应 registered claim `iat`。这个方法接收 `java.util.Date` 参数。这里我们把它设置为当前时刻。
- `setExpiration`：对应 registered claim `exp`。这个方法同样接收 `java.util.Date` 参数。这里我们把它设置为当前时刻 10 分钟之后。

我们可以用在线 [JWT Decoder](https://jwt.is/) 来解码这个 JWT：

如果仔细看 Header，会发现 `alg:none`。这是因为我们还没有指定要使用的算法。

正如前面提到的，推荐使用某种算法来生成签名。

所以，下面我们在方法中使用 HMAC SHA256 算法：

```java
public static String createJwt() {
 // Recommended to be stored in Secret
 String secret = "5JzoMbk6E5qIqHSuBTgeQCARtUsxAkBiHwdjXOSW8kWdXzYmP3X51C0";
 Key hmacKey = new SecretKeySpec(Base64.getDecoder().decode(secret),
 SignatureAlgorithm.HS256.getJcaName());
 return Jwts.builder()
 .claim("id", "abc123")
 .claim("role", "admin")
 .setIssuer("TestApplication")
 .setIssuedAt(java.util.Date.from(Instant.now()))
 .setExpiration(Date.from(Instant.now().plus(10, ChronoUnit.MINUTES)))
 .signWith(hmacKey)
 .compact();
 }
```

生成出来的 token 看起来会像这样：

```text
eyJthbGciOiJIUzI1NiJ9.eyJpZCI6ImFiYzEyMyIsInJvbGUiOiJhZG1pbiIsImlz
cyI6IlRlc3RBcHBsaWNhdGlvbiIsImlhdCI6MTcxMjMyODQzMSwiZXhwIjoxNzEyMzI5MDMxfQ.
pj9AvbLtwITqBYazDnaTibCLecM-cQ5RAYw2YYtkyeA
```

对这个 JWT 解码后，我们就能看到对应内容。

### 解析 JWT Token

现在我们已经创建了 JWT，接下来看看如何解析 token 来提取 claims。

前提是，我们必须知道最初用来创建 JWT 的 secret key。

下面的代码可以实现这一点：

```java
public static Jws<Claims> parseJwt(String jwtString) {
 // Recommended to be stored in Secret
 String secret = "5JzoMbk6E5qIqHSuBTgeQCARtUsxAkBiHwdjXOSW8kWdXzYmP3X51C0";
 Key hmacKey = new SecretKeySpec(Base64.getDecoder().decode(secret),
 SignatureAlgorithm.HS256.getJcaName());

 Jws<Claims> jwt = Jwts.parserBuilder()
 .setSigningKey(hmacKey)
 .build()
 .parseClaimsJws(jwtString);

 return jwt;
 }
```

这里，`parseJwt` 方法接收一个字符串形式的 JWT token。利用与创建 token 时相同的 secret key，就可以解析 token 并取回 claims。

下面这个测试可以验证这一点：

```java
@Test
 public void testParseJwtClaims() {
 String jwtToken = JWTCreator.createJwt();
 assertNotNull(jwtToken);
 Jws<Claims> claims = JWTCreator.parseJwt(jwtToken);
 assertNotNull(claims);
 Assertions.assertAll(
 () -> assertNotNull(claims.getSignature()),
 () -> assertNotNull(claims.getHeader()),
 () -> assertNotNull(claims.getBody()),
 () -> assertEquals(claims.getHeader().getAlgorithm(), "HS256"),
 () -> assertEquals(claims.getBody().get("id"), "abc123"),
 () -> assertEquals(claims.getBody().get("role"), "admin"),
 () -> assertEquals(claims.getBody().getIssuer(), "TestApplication")
 );
 }
```

关于可用解析方法的完整列表，可以参考[文档](https://javadoc.io/doc/io.jsonwebtoken/jjwt-api/0.11.2/io/jsonwebtoken/JwtParser.html)。

### 比较 Spring Security 中的 Basic Authentication 与 JWT

在进入 Spring Boot 示例中的 JWT 实现之前，我们先看几个 Basic Authentication 与 JWT 的对比点。

| 比较维度 | Basic Authentication | JWT |
| --- | --- | --- |
| `Authorization` Header | 示例：`Authorization: Basic xxx` | 示例：`Authorization: Bearer xxx` |
| 有效性与过期时间 | Basic Authentication 的凭据配置一次后，需要在每个请求中重复传递，而且永不过期。 | JWT 可以通过 registered claim `exp` 设置有效期，过期后会抛出 `io.jsonwebtoken.ExpiredJwtException`。从安全角度看，这让 JWT 更安全，因为 token 的有效窗口更短。用户需要重新发送请求以生成新 token。 |
| 数据内容 | Basic Authentication 仅用于处理凭据（通常是用户名和密码）。 | JWT 可以携带额外信息，例如 id、roles 等。一旦签名校验通过，服务端就可以信任客户端带来的这些数据，从而避免额外查询。 |

## 在 Spring Boot 应用中实现 JWT

现在我们已经更好地理解了 JWT，接下来在一个简单的 Spring Boot 应用中实现它。

先在 `pom.xml` 中加入以下依赖：

```xml
<dependency>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-starter-web</artifactId>
 </dependency>
 <dependency>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-starter-security</artifactId>
 </dependency>
 <dependency>
 <groupId>io.jsonwebtoken</groupId>
 <artifactId>jjwt-api</artifactId>
 <version>0.11.1</version>
 </dependency>
 <dependency>
 <groupId>io.jsonwebtoken</groupId>
 <artifactId>jjwt-impl</artifactId>
 <version>0.11.1</version>
 <scope>runtime</scope>
 </dependency>
 <dependency>
 <groupId>io.jsonwebtoken</groupId>
 <artifactId>jjwt-jackson</artifactId>
 <version>0.11.1</version>
 <scope>runtime</scope>
 </dependency>
```

这里我们构建了一个简单的 Spring Boot Library 应用，并使用内存 H2 数据库存储数据。

该应用被配置为运行在端口 `8083`。启动方式如下：

```bash
mvnw clean verify spring-boot:run (for Windows)
./mvnw clean verify spring-boot:run (for Linux)
```

### 用 JWT 拦截 Spring Security 过滤器链

这个应用有一个 REST 端点 `/library/books/all`，用于获取数据库中存储的所有图书。如果我们通过 Postman 发送这个 GET 请求，会得到一个 `401 UnAuthorized` 错误。

这是因为，我们在 `pom.xml` 中加入的 `spring-boot-starter-security` 依赖，会自动为创建出来的所有端点引入 Basic Authentication。

由于我们没有在 Postman 中指定任何凭据，所以会收到 `UnAuthorized` 错误。

而本文的目标，是用基于 JWT 的认证替换掉 Basic Authentication。

我们知道，Spring 通过触发一条过滤器链，为每个请求处理认证和授权，从而为端点提供安全能力。`UsernamePasswordAuthenticationFilter` 负责验证每个请求的凭据。

为了覆盖这个过滤器，我们创建一个新的过滤器 `JwtFilter`。这个过滤器继承 `OncePerRequestFilter`，因为我们希望它对每个请求只执行一次：

```java
@Component
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

 private final AuthUserDetailsService userDetailsService;

 private final JwtHelper jwtHelper;

 public JwtFilter(AuthUserDetailsService userDetailsService, JwtHelper jwtHelper) {
 this.userDetailsService = userDetailsService;
 this.jwtHelper = jwtHelper;
 }

 @Override
 protected void doFilterInternal(HttpServletRequest request,
 HttpServletResponse response,
 FilterChain filterChain)
 throws ServletException, IOException {
 log.info("Inside JWT filter");
 // Code to validate the Authorization header
 }
}
```

`JwtHelper` 类负责创建和校验 token。先来看它如何创建 token：

```java
public String createToken(Map<String, Object> claims, String subject) {
 Date expiryDate =
 Date.from(Instant.ofEpochMilli(System.currentTimeMillis() +
 jwtProperties.getValidity()));
 Key hmacKey = new SecretKeySpec(Base64.getDecoder()
 .decode(jwtProperties.getSecretKey()),
 SignatureAlgorithm.HS256.getJcaName());
 return Jwts.builder()
 .setClaims(claims)
 .setSubject(subject)
 .setIssuedAt(new Date(System.currentTimeMillis()))
 .setExpiration(expiryDate)
 .signWith(hmacKey)
 .compact();
}
```

下面这些参数负责创建 token：

- `claims` 指的是一个空 map。在这个示例中，没有定义用户特有的 claims。
- `subject` 指的是用户在创建 token 的 API 调用中传入的用户名。
- `expiryDate` 指的是在当前时间基础上增加若干毫秒后的日期，其中这个毫秒值定义在 `jwt.validity` 属性中。
- `hmacKey` 指的是用于给 JWT 请求签名的 `java.security.Key` 对象。在这个示例中，使用的 secret 定义在 `jwt.secretKey` 属性中，算法是 `HS256`。

这个方法会返回一个字符串形式的 token，它需要在每次请求中放进 `Authorization` Header 里。

现在 token 已经创建好了，再看看 `JwtFilter` 类中的 `doFilterInternal` 方法，以及这个过滤器类的职责：

```java
@Override
protected void doFilterInternal(
 HttpServletRequest request,
 HttpServletResponse response,
 FilterChain filterChain
) throws ServletException, IOException {

 final String authorizationHeader = request.getHeader(AUTHORIZATION);
 String jwt = null;
 String username = null;
 if (Objects.nonNull(authorizationHeader) &&
 authorizationHeader.startsWith("Bearer ")) {
 jwt = authorizationHeader.substring(7);
 username = jwtHelper.extractUsername(jwt);
 }

 if (Objects.nonNull(username) &&
 SecurityContextHolder.getContext().getAuthentication() == null) {
 UserDetails userDetails =
 this.userDetailsService.loadUserByUsername(username);
 boolean isTokenValidated =
 jwtHelper.validateToken(jwt, userDetails);
 if (isTokenValidated) {
 UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
 new UsernamePasswordAuthenticationToken(
 userDetails, null, userDetails.getAuthorities());
 usernamePasswordAuthenticationToken.setDetails(
 new WebAuthenticationDetailsSource().buildDetails(request));
 SecurityContextHolder.getContext().setAuthentication(
 usernamePasswordAuthenticationToken);
 }
 }

 filterChain.doFilter(request, response);
}
```

步骤 1：读取 `Authorization` Header，并提取出 JWT 字符串。

步骤 2：解析 JWT 字符串，提取出用户名。这里我们使用 `io.jsonwebtoken` 库中的 `Jwts.parseBuilder()`。`jwtHelper.extractUsername()` 如下：

```java
public String extractUsername(String bearerToken) {
 return extractClaimBody(bearerToken, Claims::getSubject);
 }
public <T> T extractClaimBody(String bearerToken,
 Function<Claims, T> claimsResolver) {
 Jws<Claims> jwsClaims = extractClaims(bearerToken);
 return claimsResolver.apply(jwsClaims.getBody());
 }
private Jws<Claims> extractClaims(String bearerToken) {
 return Jwts.parserBuilder().setSigningKey(jwtProperties.getSecretKey())
 .build().parseClaimsJws(bearerToken);
 }
```

步骤 3：提取出用户名之后，我们会用 `SecurityContextHolder.getContext().getAuthentication()` 检查当前是否已经存在有效的 `Authentication` 对象，也就是是否已有已登录用户。如果没有，就通过 Spring Security 的 `UserDetailsService` 加载 `UserDetails` 对象。

在这个示例中，我们创建了 `AuthUserDetailsService` 类来返回 `UserDetails` 对象：

```java
public class AuthUserDetailsService implements UserDetailsService {

 private final UserProperties userProperties;

 @Autowired
 public AuthUserDetailsService(UserProperties userProperties) {
 this.userProperties = userProperties;
 }

 @Override
 public UserDetails loadUserByUsername(String username)
 throws UsernameNotFoundException {

 if (StringUtils.isEmpty(username) ||
 !username.equals(userProperties.getName())) {
 throw new UsernameNotFoundException(
 String.format("User not found, or unauthorized %s", username));
 }

 return new User(userProperties.getName(),
 userProperties.getPassword(), new ArrayList<>());
 }
}
```

这里的用户名和密码通过 `application.yml` 中的 `spring.security.user` 属性加载：

```yaml
spring:
 security:
 user:
 name: libUser
 password: libPassword
```

步骤 4：接着，`JwtFilter` 会调用 `jwtHelper.validateToken()`，校验提取出来的用户名，并确认 JWT 没有过期。

```java
public boolean validateToken(String token, UserDetails userDetails) {
 final String userName = extractUsername(token);
 return userName.equals(userDetails.getUsername()) && !isTokenExpired(token);
 }
private Boolean isTokenExpired(String bearerToken) {
 return extractExpiry(bearerToken).before(new Date());
 }
public Date extractExpiry(String bearerToken) {
 return extractClaimBody(bearerToken, Claims::getExpiration);
 }
```

步骤 5：一旦 token 校验通过，我们就创建一个 `Authentication` 对象。这里创建的是 `UsernamePasswordAuthenticationToken` 对象（它是 `Authentication` 接口的一个实现），并把它设置到 `SecurityContextHolder.getContext().setAuthentication(...)` 中。这表示用户现在已经通过认证。

步骤 6：最后，我们调用 `filterChain.doFilter(request, response)`，让过滤器链中的下一个过滤器继续执行。

这样，我们就成功创建了一个用于校验 token 的过滤器类。异常处理会在后面的章节再看。

### JWT Token 创建端点

这一节中，我们创建一个 Controller 类，为应用提供一个创建 JWT token 字符串的端点。之后，我们就可以把这个 token 放进 `Authorization` Header，去调用我们的 Library 应用。

先创建 `TokenController` 类：

```java
@RestController
public class TokenController {

 private final TokenService tokenService;

 public TokenController(TokenService tokenService) {
 this.tokenService = tokenService;
 }

 @PostMapping("/token/create")
 public TokenResponse createToken(@RequestBody TokenRequest tokenRequest) {
 return tokenService.generateToken(tokenRequest);
 }
}
```

请求体 `TokenRequest` 类接收用户名和密码：

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenRequest {
 private String username;
 private String password;
}
```

`TokenService` 负责校验请求体中的凭据，并调用前面提到的 `jwtHelper.createToken()`。

为了认证这些凭据，我们需要实现一个 `AuthenticationManager`。接下来创建一个 `SecurityConfiguration` 类，用来定义所有与 Spring Security 相关的配置。

```java
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

 private final JwtFilter jwtFilter;

 private final AuthUserDetailsService authUserDetailsService;

 private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

 @Autowired
 public SecurityConfiguration(JwtFilter jwtFilter,
 AuthUserDetailsService authUserDetailsService,
 JwtAuthenticationEntryPoint
 jwtAuthenticationEntryPoint) {

 this.jwtFilter = jwtFilter;
 this.authUserDetailsService = authUserDetailsService;
 this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
 }

 @Bean
 public DaoAuthenticationProvider authenticationProvider() {
 final DaoAuthenticationProvider daoAuthenticationProvider =
 new DaoAuthenticationProvider();
 daoAuthenticationProvider.setUserDetailsService(authUserDetailsService);
 daoAuthenticationProvider.setPasswordEncoder(
 PlainTextPasswordEncoder.getInstance());
 return daoAuthenticationProvider;
 }

 @Bean
 public AuthenticationManager authenticationManager(HttpSecurity httpSecurity)
 throws Exception {
 return httpSecurity.getSharedObject(AuthenticationManagerBuilder.class)
 .authenticationProvider(authenticationProvider())
 .build();
 }
}
```

这个 `AuthenticationManager` 使用的是 `AuthUserDetailsService`，后者依赖于 `spring.security.user` 这组属性。

现在 `AuthenticationManager` 已经就位，再看看 `TokenService` 的定义：

```java
@Service
public class TokenService {

 private final AuthenticationManager authenticationManager;

 private final AuthUserDetailsService userDetailsService;

 private final JwtHelper jwtHelper;

 public TokenService(AuthenticationManager authenticationManager,
 AuthUserDetailsService userDetailsService,
 JwtHelper jwtHelper) {
 this.authenticationManager = authenticationManager;
 this.userDetailsService = userDetailsService;
 this.jwtHelper = jwtHelper;
 }

 public TokenResponse generateToken(TokenRequest tokenRequest) {
 this.authenticationManager.authenticate(
 new UsernamePasswordAuthenticationToken(
 tokenRequest.getUsername(), tokenRequest.getPassword()));
 final UserDetails userDetails =
 userDetailsService.loadUserByUsername(tokenRequest.getUsername());
 String token = jwtHelper.createToken(
 Collections.emptyMap(), userDetails.getUsername());
 return TokenResponse.builder()
 .token(token)
 .build();
 }
}
```

`TokenResponse` 则是包含 token 字符串的响应对象：

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenResponse {

 private String token;

}
```

API 创建完成后，我们启动应用，并尝试通过 Postman 调用这个端点。

此时会看到一个 `401 Unauthorized` 错误。

原因和前面一样：Spring Security 默认会保护所有端点。我们需要一种方式，只把 token 端点排除在安全保护之外。

另外，从启动日志也能看到，尽管我们定义了 `JwtFilter`，并且预期它能覆盖 `UsernamePasswordAuthenticationFilter`，但实际上并没有看到这个过滤器被连进安全链：

```text
2024-05-22 15:41:09.441 INFO 20432 --- [ main]
o.s.s.web.DefaultSecurityFilterChain :
Will secure any request with
 [org.springframework.security.web.session.DisableEncodeUrlFilter@14d36bb2,
org.springframework.security.web.context.request.async.
 WebAsyncManagerIntegrationFilter@432448,
org.springframework.security.web.context.SecurityContextPersistenceFilter@54d46c8,
org.springframework.security.web.header.HeaderWriterFilter@c7cf8c4,
org.springframework.security.web.csrf.CsrfFilter@17fb5184,
org.springframework.security.web.authentication.logout.LogoutFilter@42fa5cb,
org.springframework.security.web.authentication.
 UsernamePasswordAuthenticationFilter@70d7a49b,
org.springframework.security.web.authentication.ui.
 DefaultLoginPageGeneratingFilter@67cd84f9,
org.springframework.security.web.authentication.ui.
 DefaultLogoutPageGeneratingFilter@4452e13c,
org.springframework.security.web.authentication.www.
 BasicAuthenticationFilter@788d9139,
org.springframework.security.web.savedrequest.RequestCacheAwareFilter@5c34b0f2,
org.springframework.security.web.servletapi.
 SecurityContextHolderAwareRequestFilter@7dfec0bc,
org.springframework.security.web.authentication.
 AnonymousAuthenticationFilter@4d964c9e,
org.springframework.security.web.session.SessionManagementFilter@731fae,
org.springframework.security.web.access.ExceptionTranslationFilter@66d61298,
org.springframework.security.web.access.intercept.FilterSecurityInterceptor@55c20a91]
```

为了把 `JwtFilter` 连进过滤器链，同时把 token 端点排除在安全保护之外，我们在 `SecurityConfiguration` 中创建一个 `SecurityFilterChain` Bean：

```java
@Bean
 public SecurityFilterChain configure (HttpSecurity http) throws Exception {
 return http.csrf().disable()
 .authorizeRequests()
 .antMatchers("/token/*").permitAll()
 .anyRequest().authenticated().and()
 .sessionManagement(session ->
 session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
 .addFilterBefore(jwtFilter,
 UsernamePasswordAuthenticationFilter.class)
 .exceptionHandling(exception ->
 exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
 .build();
 }
```

这里我们关心的点包括：

- `antMatchers("/token/*").permitAll()`：允许匹配 `/token/*` 的 API 端点访问，并将它们排除在安全校验之外。
- `anyRequest().authenticated()`：Spring Security 会继续保护其他所有 API 请求。
- `addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)`：把 `JwtFilter` 接到过滤器链中，并放在 `UsernamePasswordAuthenticationFilter` 前面。
- `exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint)`：发生认证异常时，调用 `JwtAuthenticationEntryPoint`。在这里，我们创建了一个实现 `org.springframework.security.web.AuthenticationEntryPoint` 的 `JwtAuthenticationEntryPoint` 类，用于更优雅地处理未授权错误。关于异常处理，后面会详细看。

做完这些改动之后，重启应用，再看日志：

```text
2024-05-22 16:13:07.803 INFO 16188 --- [ main]
o.s.s.web.DefaultSecurityFilterChain : Will secure any request with
[org.springframework.security.web.session.DisableEncodeUrlFilter@73e25780,
org.springframework.security.web.context.request.async.
 WebAsyncManagerIntegrationFilter@1f4cb17b,
org.springframework.security.web.context.SecurityContextPersistenceFilter@b548f51,
org.springframework.security.web.header.HeaderWriterFilter@4f9980e1,
org.springframework.security.web.authentication.logout.LogoutFilter@6b92a0d1,
com.reflectoring.security.filter.JwtFilter@5961e92d,
org.springframework.security.web.savedrequest.RequestCacheAwareFilter@56976b8b,
org.springframework.security.web.servletapi.
 SecurityContextHolderAwareRequestFilter@74844216,
org.springframework.security.web.authentication.
 AnonymousAuthenticationFilter@280099a0,
org.springframework.security.web.session.SessionManagementFilter@144dc2f7,
org.springframework.security.web.access.ExceptionTranslationFilter@7a0f43dc,
org.springframework.security.web.access.intercept.
 FilterSecurityInterceptor@735167e1]
```

现在能看到 `JwtFilter` 已经被接入过滤器链，这表明 Basic Authentication 已经被基于 token 的认证取代。

接着，我们再次调用 `/token/create` 端点，就可以成功返回生成好的 token。

### 保护 Library 应用端点

现在我们已经能够成功创建 token，接下来要把这个 token 传给我们的 Library 应用，以便成功调用 `/library/books/all`。

把生成出来的 token 放进 `Authorization` Header，并将其类型设置为 Bearer Token，然后再次发起请求。

这时会看到一个 `200 OK` 响应。

### 用 JWT 做异常处理

这一节中，我们看看 `io.jsonwebtoken` 包里一些常见异常：

- [`ExpiredJwtException`](https://javadoc.io/doc/io.jsonwebtoken/jjwt/0.9.1/io/jsonwebtoken/ExpiredJwtException.html)：JWT token 中包含过期时间。如果在解析 token 时发现它已经过期，就会抛出这个异常。
- [`UnsupportedJwtException`](https://javadoc.io/doc/io.jsonwebtoken/jjwt/0.9.1/io/jsonwebtoken/UnsupportedJwtException.html)：当收到的 JWT 格式不是预期格式时会抛出这个异常。最常见的场景是：我们试图用 `Jwts.parserBuilder().setSigningKey(jwtProperties.getSecretKey()).build().parseClaimsJwt(...)` 去解析一个带签名的 JWT，而不是使用 `parseClaimsJws(...)`。
- [`MalformedJwtException`](https://javadoc.io/doc/io.jsonwebtoken/jjwt/0.9.1/io/jsonwebtoken/MalformedJwtException.html)：表示这个 JWT 构造不正确。
- [`IncorrectClaimException`](https://javadoc.io/doc/io.jsonwebtoken/jjwt-api/latest/io/jsonwebtoken/IncorrectClaimException.html)：表示某个必需 claim 的值不符合预期，因此 JWT 无效。
- [`MissingClaimException`](https://javadoc.io/doc/io.jsonwebtoken/jjwt-api/latest/io/jsonwebtoken/MissingClaimException.html)：表示 JWT 缺少某个必需 claim，因此无效。

通常来说，优雅地处理认证相关异常，是一种良好实践。

在 Basic Authentication 场景里，Spring Security 默认会把 `BasicAuthenticationEntryPoint` 加进安全过滤器链，从而把认证相关错误包装成 `401 Unauthorized`。

类似地，在我们的示例中，我们显式创建了一个 `JwtAuthenticationEntryPoint`，用来处理可能的认证错误，例如 Spring Security 的 `BadCredentialsException`，或者 JJWT 的 `MalformedJwtException`：

```java
@Component
@Slf4j
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {
 @Override
 public void commence(HttpServletRequest request,
 HttpServletResponse response,
 AuthenticationException authException)
 throws IOException, ServletException {
 Exception exception = (Exception) request.getAttribute("exception");
 response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
 response.setContentType(APPLICATION_JSON_VALUE);
 log.error("Authentication Exception: {} ", exception, exception);
 Map<String, Object> data = new HashMap<>();
 data.put("message", exception != null ?
 exception.getMessage() : authException.getCause().toString());
 OutputStream out = response.getOutputStream();
 ObjectMapper mapper = new ObjectMapper();
 mapper.writeValue(out, data);
 out.flush();
 }
}
```

在 `JwtFilter` 中，我们把异常消息放进 `HttpServletRequest` 的 `exception` 属性里。这样就可以通过 `request.getAttribute("exception")` 取出它，并写到输出流中。

```java
public class JwtFilter extends OncePerRequestFilter {
 @Override
 protected void doFilterInternal(HttpServletRequest request,
 HttpServletResponse response,
 FilterChain filterChain)
 throws ServletException, IOException {
 try {
 //validate token here
 } catch (ExpiredJwtException jwtException) {
 request.setAttribute("exception", jwtException);
 } catch (BadCredentialsException |
 UnsupportedJwtException |
 MalformedJwtException e) {
 log.error("Filter exception: {}", e.getMessage());
 request.setAttribute("exception", e);
 }
 filterChain.doFilter(request, response);
 }
}
```

有了这些修改之后，带着 `401 Unauthorized` 的响应中也能看到异常信息了。

不过，这里有个重要点要注意：`JwtFilter` 只会对那些已经被 Spring Security 过滤器链保护的端点生效。在我们的示例里，就是 `/library/books/all`。

而因为我们已经把 `/token/create` 这个 token 端点排除在 Spring Security 保护之外，所以 `JwtAuthenticationEntryPoint` 中的异常处理并不会应用到它。在这种情况下，就要使用 Spring 的全局异常处理器来兜底。

```java
@ControllerAdvice
public class GlobalExceptionHandler {
 @ExceptionHandler({BadCredentialsException.class})
 public ResponseEntity<Object> handleBadCredentialsException(BadCredentialsException exception) {
 return ResponseEntity
 .status(HttpStatus.UNAUTHORIZED)
 .body(exception.getMessage());
 }
}
```

这样一来，由错误凭据引起的异常也会被统一处理成 `401 Unauthorized`。

## Swagger 文档

这一节中，我们看看如何为 JWT 配置 Open API。

先加入以下 Maven 依赖：

```xml
<dependency>
 <groupId>org.springdoc</groupId>
 <artifactId>springdoc-openapi-ui</artifactId>
 <version>1.7.0</version>
</dependency>
```

然后加入下面这些配置：

```java
@OpenAPIDefinition(
 info = @Info(
 title = "Library application",
 description = "Get all library books",
 version = "1.0.0",
 license = @License(
 name = "Apache 2.0",
 url = "http://www.apache.org/licenses/LICENSE-2.0"
 )),
 security = {
 @SecurityRequirement(
 name = "bearerAuth"
 )
 }
 )
@SecurityScheme(
 name = "bearerAuth",
 description = "JWT Authorization",
 scheme = "bearer",
 type = SecuritySchemeType.HTTP,
 bearerFormat = "JWT",
 in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
```

这里，安全方案通过一个或多个 `@SecurityScheme` 来描述。文中这里使用的 `SecuritySchemeType.HTTP` 同时适用于 Basic Authentication 和 JWT。

其他属性，比如 `scheme` 和 `bearerFormat`，则依赖于这个 `type` 的设置。

定义完安全方案后，我们可以把它应用到整个应用，或者应用到某些具体操作上，也就是在根级别或操作级别添加 `security` 配置。

在本文示例中，所有 API 操作都使用 Bearer Token 认证方案。

关于如何配置多个安全方案，以及如何把不同方案应用到不同 API 层面，可以参考其[官方文档](https://swagger.io/docs/specification/authentication/)。

接下来，我们给 controller 类加上一些基本的 Swagger 注解，以为 API 操作补充说明：

```java
@RestController
@Tag(name = "Library Controller", description = "Get library books")
public class BookController {
}

@RestController
@Tag(name = "Create Token", description = "Create Token")
public class TokenController {
}
```

我们还会通过下面这个属性，覆盖 Springdoc 的 Swagger-UI 加载地址：

```yaml
springdoc:
 swagger-ui:
 path: /swagger-ui
```

这样一来，Swagger UI 就可以通过 `http://localhost:8083/swagger-ui/index.html` 访问。

启动应用并打开这个地址后，尝试调用端点，会发现仍然有问题。

这是因为应用中的所有端点默认都受到了保护。我们需要显式把 Swagger 相关端点排除出去。

可以通过在 `SecurityConfiguration` 中增加一个 `WebSecurityCustomizer` Bean，并排除这些 Swagger 端点来做到这一点：

```java
@Bean
 public WebSecurityCustomizer webSecurityCustomizer() {
 return web -> web.ignoring().antMatchers(
 ArrayUtils.addAll(buildExemptedRoutes()));
 }

 private String[] buildExemptedRoutes() {
 return new String[] {"/swagger-ui/**","/v3/api-docs/**"};
 }
```

加上这些配置后，重新运行应用，Swagger 页面就可以正常加载了。

由于这里只有一个安全方案，我们把 JWT token 填进 Swagger 页面顶部的 `Authorize` 按钮即可。

设置好 Bearer Token 之后，再调用 `/library/books/all`，就可以得到正确响应。

至此，Swagger 端点的配置也完成了。

## 添加 Spring Security 测试

在这个示例里，我们需要编写测试，分别验证 token 端点和 Library 应用端点。

先为测试准备一些必要属性，并使用内存数据库来承载真实数据。

测试环境下的 `application.yml`：

```yaml
spring:
 security:
 user:
 name: libUser
 password: libPassword
 datasource:
 driver-class-name: org.hsqldb.jdbc.JDBCDriver
 url: jdbc:hsqldb:mem:testdb;DB_CLOSE_DELAY=-1
 username: sa
 password:

jwt:
 secretKey: 5JzoMbk6E5qIqHSuBTgeQCARtUsxAkBiHwdjXOSW8kWdXzYmP3X51C0
 validity: 600000
```

接下来，先编写测试来验证 token 端点：

```java
@SpringBootTest
@AutoConfigureMockMvc
public class TokenControllerTest {
 @Autowired
 private MockMvc mvc;

 @Test
 public void shouldNotAllowAccessToUnauthenticatedUsers() throws Exception {
 TokenRequest request = TokenRequest.builder()
 .username("testUser")
 .password("testPassword")
 .build();
 mvc.perform(MockMvcRequestBuilders.post("/token/create")
 .contentType(MediaType.APPLICATION_JSON)
 .content(new ObjectMapper().writeValueAsString(request)))
 .andExpect(status().isUnauthorized());
 }

 @Test
 public void shouldGenerateAuthToken() throws Exception {
 TokenRequest request = TokenRequest.builder()
 .username("libUser")
 .password("libPassword")
 .build();
 mvc.perform(MockMvcRequestBuilders.post("/token/create")
 .contentType(MediaType.APPLICATION_JSON)
 .content(new ObjectMapper().writeValueAsString(request)))
 .andExpect(status().isOk());
 }
}
```

这里我们使用 `MockMvc` 来验证 `TokenController` 在正向和反向场景下是否符合预期。

类似地，`BookControllerTest` 会是这样：

```java
@SpringBootTest
@AutoConfigureMockMvc
@SqlGroup({
 @Sql(value = "classpath:init/first.sql",
 executionPhase = BEFORE_TEST_METHOD),
 @Sql(value = "classpath:init/second.sql",
 executionPhase = BEFORE_TEST_METHOD)
})

public class BookControllerTest {

 @Autowired
 private MockMvc mockMvc;

 @Test
 void failsAsBearerTokenNotSet() throws Exception {
 mockMvc.perform(get("/library/books/all"))
 .andDo(print())
 .andExpect(status().isUnauthorized());
 }

 @Test
 void testWithValidBearerToken() throws Exception {
 TokenRequest request = TokenRequest.builder()
 .username("libUser")
 .password("libPassword")
 .build();
 MvcResult mvcResult = mockMvc.perform(
 MockMvcRequestBuilders.post("/token/create")
 .contentType(MediaType.APPLICATION_JSON)
 .content(new ObjectMapper().writeValueAsString(request)))
 .andExpect(status().isOk()).andReturn();
 String resultStr = mvcResult.getResponse().getContentAsString();
 TokenResponse token = new ObjectMapper().readValue(
 resultStr, TokenResponse.class);
 mockMvc.perform(get("/library/books/all")
 .header("Authorization", "Bearer " + token.getToken()))
 .andDo(print())
 .andExpect(status().isOk())
 .andExpect(jsonPath("$", hasSize(5)));
 }

 @Test
 void testWithInvalidBearerToken() throws Exception {
 mockMvc.perform(get("/library/books/all")
 .header("Authorization", "Bearer 123"))
 .andDo(print())
 .andExpect(status().isUnauthorized());
 }

}
```

为了测试应用端点，我们会使用 Spring 的 `MockMvc`，并通过 `@SqlGroup` 和 `@Sql` 注解，用样例 SQL 脚本把数据加载到内存数据库中。这些脚本会放在 `/resources/init` 目录下。

为了验证 `testWithValidBearerToken()` 这个测试能够顺利通过，我们会先用 `MockMvc` 调用 `/token/create` 端点，从响应中提取 token，再把这个 token 放到下一次访问 `/library/books/all` 的 `Authorization` Header 中。

## 结论

总的来说，从安全性角度看，JWT 认证比 Spring 的 Basic Authentication 更进一步。

它已经成为最常见的认证与授权方式之一。

在本文中，我们介绍了 JWT 的一些最佳实践、使用 JWT 的优势，并演示了如何在一个简单的 Spring Boot 应用中配置基于 JWT 的安全机制。

> 本文为学习目的的个人翻译，译文仅供参考。
>
> 原文链接：[Getting Started with Spring Security and JWT](https://reflectoring.io/spring-security-jwt/)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
