---
title: "[译]Spring Boot授权服务器 - 使用 Java 的资源服务器和客户端凭证示例"
date: 2023-07-26
slug: spring-boot-authorization-server
categories: ["Java"]
tags: [java, spring, "spring boot", "spring security"]
---

# 概述

在本文中，我们将创建一个授权服务器，为任何客户端生成 access_token。这称为 OAuth2 的 `client_credentials` 流程。它主要用于服务间通信。

我们将使用 spring boot oauth2 授权服务器依赖项来创建身份验证服务器。我们还将创建一个资源服务器和客户端来对其进行端到端测试。

![img](https://miro.medium.com/v2/resize:fit:1400/1*8-okMlYgO09HrFbdEpWm6w.png)

# Spring 授权服务器

我们首先创建授权服务器。

## **依赖项：**

让我们将以下依赖项添加到我们的项目中。

```
implementation 'org.springframework.security:spring-security-oauth2-authorization-server:1.0.0'
implementation 'org.springframework.boot:spring-boot-starter-security'
implementation 'org.springframework.boot:spring-boot-starter-web'
testImplementation 'org.springframework.boot:spring-boot-starter-test'
testImplementation 'org.springframework.security:spring-security-test'
```

我们正在使用 spring oauth2 依赖项的最新（当时）稳定版本。

## **Java 实现：**

让我们创建一个名为 AuthorizationServerConfig 的配置类，并向该类添加 @Configuration 注解。现在让我们创建以下 bean 来完成配置：

- **SecurityFilterChain**

```java
@Bean
@Order(Ordered.HIGHEST_PRECEDENCE)
public SecurityFilterChain authServerSecurityFilterChain(HttpSecurity http) throws Exception {
    OAuth2AuthorizationServerConfiguration.applyDefaultSecurity(http);
    return http.build();
}
```

我们将把 bean 的顺序设置为最高，因为我们想首先执行它。

- **RegisteredClientRepository**

```java
@Bean
public RegisteredClientRepository registeredClientRepository() {
    RegisteredClient registeredClient = RegisteredClient.withId(UUID.randomUUID().toString())
      .clientId("oauth-client")
      .clientSecret("{noop}oauth-secret")
      .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
      .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
      .scope(OidcScopes.OPENID)
      .scope("articles.read")
      .build();
    return new InMemoryRegisteredClientRepository(registeredClient);
}
```

现在让我们使用内存存储库对内容进行硬编码。我们可以根据我们的需要更新这些。

- **JwtDecoder**

```java
@Bean
public JwtDecoder jwtDecoder(JWKSource<SecurityContext> jwkSource) {
    return OAuth2AuthorizationServerConfiguration.jwtDecoder(jwkSource);
}
```

我们将使用它来解码令牌以进行验证。

- **JWKSource<SecurityContext>**

```java
@Bean
public JWKSource<SecurityContext> jwkSource() throws NoSuchAlgorithmException {
    RSAKey rsaKey = generateRsa();
    JWKSet jwkSet = new JWKSet(rsaKey);
    return (jwkSelector, securityContext) -> jwkSelector.select(jwkSet);
}

private static RSAKey generateRsa() throws NoSuchAlgorithmException {
    KeyPair keyPair = generateRsaKey();
    RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
    RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
    return new RSAKey.Builder(publicKey)
      .privateKey(privateKey)
      .keyID(UUID.randomUUID().toString())
      .build();
}

private static KeyPair generateRsaKey() throws NoSuchAlgorithmException {
    KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
    keyPairGenerator.initialize(2048);
    return keyPairGenerator.generateKeyPair();
}
```

我们在解码器 bean 中使用这个源，所以我们需要定义它。我们使用 RSA 2048 密钥对，我们也可以在需要时更改它。

- **AuthorizationServerSettings**

```java
@Bean
public AuthorizationServerSettings authorizationServerSettings() {
    return AuthorizationServerSettings.builder().build();
}
```

现在我们已经配置了一切，让我们尝试运行应用程序并获取令牌：

```bash
curl -X POST 'http://localhost:9090/oauth2/token?grant_type=client_credentials' \
  --header 'Authorization: Basic b2F1dGgtY2xpZW50Om9hdXRoLXNlY3JldA=='
```

注意：根据您的配置更新端口号。

它应该给出如下响应：

```json
{
  "access_token": "eyJraWQiOiJiYWM0ZmMxYS02MGJiLTQ0ZTAtODU4MC1iNzcwYWU2MjkwZWEiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJvYXV0aC1jbGllbnQiLCJhdWQiOiJvYXV0aC1jbGllbnQiLCJuYmYiOjE2NzQ5ODYzNjcsImlzcyI6Imh0dHA6Ly9sb2NhbGhvc3Q6OTA5MCIsImV4cCI6MTY3NDk4NjY2NywiaWF0IjoxNjc0OTg2MzY3fQ.DxiIbV7jdRnW15WnnqcjFCLyfXmrU_trl1M3nxej_nIWK60Jx9Vm4HzpxBJugemhrMg-qizQ03TTNswfL9AgTIsLeh_D8TDjcQJy6XFWgElxfUYqUFeZmlXPmQKFmmPyIChlSAFbX1L8QvcgFE1c8GHC900RiKVgGLhT5MOZx5l1WBCbNQ_Rv2u9utcz7EqYTb0y_PjD4EC8UaGdGGlqvEAnKvRVIhxRqFarqh-OW4oUfwfwu1xQIvyWphSDegcOjIERFkhVcQeKO-a3zZS9sfJ03ppZhzAsa5O-qswtbzThO9SWQg7JUgyo7qd-zHIRhwPtEWxDGaBt2QGo7jjopw",
  "token_type": "Bearer",
  "expires_in": 299
}
```

# Spring 资源服务器

现在让我们创建一个受此身份验证服务器保护的 API 端点，其范围为我们在令牌创建中使用的 articles.read。

## 依赖项：

让我们将以下依赖项添加到我们的项目中：

```
implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'
implementation 'org.springframework.boot:spring-boot-starter-security'
implementation 'org.springframework.boot:spring-boot-starter-web'
testImplementation 'org.springframework.boot:spring-boot-starter-test'
testImplementation 'org.springframework.security:spring-security-test'
```

## Java 实现：

让我们首先创建一个简单的 rest 控制器，然后创建一个配置，以在正确的范围内保护该 API。之后，我们将在 application.yml 文件中配置身份验证服务器设置。

- **API 控制器**

```java
@RestController
public class ArticlesController {

    @GetMapping("/articles")
    public String[] getArticles() {
        return new String[] { "Article 1", "Article 2", "Article 3" };
    }
}
```

我们创建了一个简单的 GET API 端点 /articles，它将返回文章列表。

- **ResourceServerConfig**

```java
@EnableWebSecurity
public class ResourceServerConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
          .authorizeRequests()
          .requestMatchers("/articles/**")
          .access("hasAuthority('SCOPE_articles.read')")
          .and()
          .oauth2ResourceServer()
          .jwt();
        return http.build();
    }
}
```

我们将创建一个配置类并使用@EnableWebSecurity 对其进行注释。我们将创建一个 SecurityFilterChain 的 bean，在其中定义 API 和所需的范围。

- **application.yml**

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: http://localhost:9090
```

我们在这里定义 oauth2 配置，注意将 issuer-url 的端口更新为正确的端口。

现在一切都已配置完毕，让我们启动该服务并向 API 发出带有或不带有令牌的请求。您应该得到一个没有令牌或带有无效令牌的 401 响应，并且您应该得到带有有效令牌的正确响应。

# 客户端服务器

我们现在将创建一个简单的 Spring Boot 项目，它将使用资源服务器创建的 API。我们将在此处配置身份验证服务器详细信息，以便它在发出 API 请求之前自动获取令牌。

## 依赖项：

```
implementation 'org.springframework.boot:spring-boot-starter-oauth2-client'
implementation 'org.springframework.boot:spring-boot-starter-web'
implementation 'org.springframework:spring-webflux'
testImplementation 'org.springframework.boot:spring-boot-starter-test'
testImplementation 'org.springframework.security:spring-security-test'
```

## Java 实现：

我们首先创建配置类，然后创建一个测试 API 来向资源服务器发出请求。之后，我们将在 application.yml 文件中定义令牌配置。

- **SecurityConfig **

```java
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.oauth2Client().and().build();
    }

    @Bean
    WebClient webClient(OAuth2AuthorizedClientManager authorizedClientManager) {
        ServletOAuth2AuthorizedClientExchangeFilterFunction oauth2Client = new ServletOAuth2AuthorizedClientExchangeFilterFunction(authorizedClientManager);
        return WebClient.builder()
          .apply(oauth2Client.oauth2Configuration())
          .build();
    }

    @Bean
    OAuth2AuthorizedClientManager authorizedClientManager(ClientRegistrationRepository clientRegistrationRepository,
      OAuth2AuthorizedClientService oAuth2AuthorizedClientService,
      OAuth2AccessTokenResponseClient<OAuth2ClientCredentialsGrantRequest> tokenResponseClient) {
        OAuth2AuthorizedClientProvider authorizedClientProvider = OAuth2AuthorizedClientProviderBuilder.builder()
          .clientCredentials(r -> r.accessTokenResponseClient(tokenResponseClient)).clientCredentials().build();
        var authorizedClientManager = new AuthorizedClientServiceOAuth2AuthorizedClientManager(
          clientRegistrationRepository, oAuth2AuthorizedClientService);
        authorizedClientManager.setAuthorizedClientProvider(authorizedClientProvider);
        return authorizedClientManager;
    }

    @Bean
    OAuth2AccessTokenResponseClient<OAuth2ClientCredentialsGrantRequest> tokenResponseClient() {
        return new DefaultClientCredentialsTokenResponseClient();
    }
}
```

- **application.yml**

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          articles-client:
            client-id: oauth-client
            client-secret: oauth-secret
            authorization-grant-type: client_credentials
            scope: articles.read
            client-name: spring-client
        provider:
          articles-client:
            token-uri: http://localhost:9090/oauth2/token
```

- 客户端 API（向资源服务器发出请求）

```java
@RestController
public class ArticlesController {

    @Autowired
    private WebClient webClient;

    @GetMapping(value = "/test")
    public String[] test() {
        return this.webClient
          .get()
          .uri("http://127.0.0.1:9091/articles")
          .attributes(clientRegistrationId("articles-client"))
          .retrieve()
          .bodyToMono(String[].class)
          .block();
    }
}
```

我们可以在这里看到，当我们调用 /test API 时，它会从我们的身份验证服务器获取令牌，然后向我们的资源服务器 /articles 端点发出请求并返回响应。

让我们运行所有三个服务器并向客户端服务器发出请求，它应该返回正确的响应。请注意更新所有位置的端口号。在示例中，我使用了以下端口：

- 9090: auth-server 9090：认证服务器
- 9091: resource-server 9091：资源服务器
- 9092: client-server 9092：客户端-服务器

# 结论

在本文中，我们学习了如何使用 Spring Boot 创建授权服务器以及如何在资源服务器和客户端服务器中配置它。

您可以在此 GitHub 存储库中找到此[示例的代码](https://github.com/kumarprabhashanand/spring-authorization-server)。

原文链接：[https://blog.devgenius.io/spring-boot-authorization-server-825230ae0ed2](https://blog.devgenius.io/spring-boot-authorization-server-825230ae0ed2)
