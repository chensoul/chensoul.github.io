---
title: "【译】在 Spring 中实现 OAuth2：第 1 部分"
date: 2018-01-27 00:00:00+08:00
draft: false
slug: using-oauth2-in-spring
categories: [ "translation" ]
tags: [ "spring-boot", "oauth2" ]
description: "在 Spring Boot 中搭建 OAuth2：授权服务器与资源服务器、常见授权类型与令牌刷新，附 curl 示例。"
canonicalURL: "http://www.zakariaamine.com/2018-01-27/using-oauth2-in-spring/"
---

**OAuth 2** 是一套开放标准，用来为 **REST API** 等资源提供**受控访问**。其核心思路是：客户端用**令牌（token）**完成身份校验与授权，而不必在每次请求里重复提交用户名/密码等凭据。

本文侧重**落地实现**；理论背景可阅读 [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749) 或[维基百科](https://en.wikipedia.org/wiki/OAuth)自行补充。下文将说明如何在 **Spring** 中接入 OAuth2、演示几种常见 **grant type（授权许可类型）**，并先厘清几个必备概念。

## 访问令牌与刷新令牌

认证成功后，通常会拿到 **access token（访问令牌）** 与 **refresh token（刷新令牌）**。访问令牌**有效期有限**（常见如 1 小时；示例里为更短以便演示）；过期后需用刷新令牌向授权服务器换取**新的**访问令牌（以及可能轮换的刷新令牌）。**刷新令牌**往往在**使用后即失效**或受策略限制，需查阅具体实现。

## 资源服务器与授权服务器

OAuth 引入 **authorization server（授权服务器）**：负责签发访问/刷新令牌，并在需要时校验令牌是否有效。**resource server（资源服务器）**则是对外暴露、被各类客户端（浏览器、移动端、其它后端服务等）访问的 **REST API** 本体。两者在物理上可以**合一**，也可以**分离**部署。

## 授权类型（grant types）

实践中常见几类：**client credentials**、**password**、**authorization code**、**implicit** 等；每种有固定流程与适用场景。本文不展开协议细节，只演示在 Spring 中的配置与调用；各 grant 的语义仍以 [RFC 6749 第 1.3 节起](https://tools.ietf.org/html/rfc6749#page-8)为准。

## 实现

示例使用 **Spring Boot** 的自动配置与起步依赖，把精力放在安全与 OAuth 配置上。

### 资源服务器

下面是一个资源服务器上的控制器，暴露若干待保护的端点：

```java
@RestController("/")
public class ResourceController {

    @GetMapping("/hello")
    public String hello(){
        return "hello";
    }

    @GetMapping("/foo")
    public String foo(){
        return "foo";
    }

    @GetMapping("/bar")
    public String bar(){
        return "bar";
    }

    @GetMapping("/test")
    public String test(){
        return "test";
    }
}
```

为此需要声明基于 **`ResourceServerConfigurerAdapter`** 的配置，并加上 **`@EnableResourceServer`**：

```java
@Configuration
@EnableResourceServer
public class ResourceSecurityConfiguration extends ResourceServerConfigurerAdapter {

    @Override
    public void configure(ResourceServerSecurityConfigurer resources)
            throws Exception {
        resources.resourceId("resource");
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests()
          .antMatchers("/foo", "/bar", "/hello", "/test").authenticated().
          and().csrf().disable();
    }

    @Bean
    public RemoteTokenServices LocalTokenService() {
        final RemoteTokenServices tokenService = new RemoteTokenServices();
        tokenService.setCheckTokenEndpointUrl("http://localhost:8081/oauth/check_token");
        tokenService.setClientId("my-client");
        tokenService.setClientSecret("mysecret");
        return tokenService;
    }
}
```

含义概览：要求对上述路径走认证（也可用 `"/*"` 或 `.anyRequest()` 一刀切）；注册 **`RemoteTokenServices`**，指向授权服务器的 **`/oauth/check_token`**，并配置用于自省（introspect）的客户端 **id/secret**；**`resourceId`** 用于在**多资源服务器**场景下与授权服务器侧配置对齐。

### 授权服务器

授权服务器示例使用**内存客户端**（`inMemory`）；生产环境可改为 JDBC 等持久化存储。

```java
@Configuration
@EnableAuthorizationServer
public class AuthorizationSecurityConfig extends AuthorizationServerConfigurerAdapter {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public void configure(AuthorizationServerEndpointsConfigurer endpoints)
            throws Exception {
        endpoints.authenticationManager(authenticationManager);
    }

    @Override
    public void configure(ClientDetailsServiceConfigurer clients) throws Exception {
        clients.inMemory().withClient("my-trusted-client")
                .authorizedGrantTypes("password","refresh_token", 
                  "implicit", "client_credentials", "authorization_code")
                .authorities("ROLE_CLIENT", "ROLE_TRUSTED_CLIENT")
                .scopes("read", "write", "trust")
                .accessTokenValiditySeconds(60)
                .redirectUris("http://localhost:8081/test.html")
                .resourceIds("resource")
                .secret("mysecret");
    }

    @Override
    public void configure(AuthorizationServerSecurityConfigurer oauthServer)
            throws Exception {
          oauthServer.tokenKeyAccess("permitAll()")
                .checkTokenAccess("permitAll()");
    }
}
```

除注册客户端 id、密钥、**scope（下一篇详述）**、与令牌绑定的 **authorities**、令牌有效期、**resourceIds** 外，还放行了 Spring Boot 默认映射的 **`/oauth/check_token`** 与 **`/oauth/token`** 相关端点访问策略，便于本地演示。

## 动手示例

假设**授权服务器**监听 **8081**，**资源服务器**监听 **8989**。下文用 **`curl`** 演示；真实客户端可以是任意应用。

先直接访问受保护资源：

```bash
curl localhost:8989/foo
```

```json
{
  "error": "unauthorized",
  "error_description": "Full authentication is required to access this resource"
}
```

接着获取令牌再访问。

### client_credentials

```bash
curl -X POST --user my-trusted-client:mysecret localhost:8081/oauth/token -d 'grant_type=client_credentials&client_id=my-trusted-client' -H "Accept: application/json"
```

响应示例：

```json
{
  "access_token": "3670fea1-eab3-4981-b80a-e5c57203b20e",
  "token_type": "bearer",
  "expires_in": 51,
  "scope": "read write trust"
}
```

携带令牌访问（示例 token 请替换为你实际返回的）：

```bash
curl -v localhost:8989/foo -H "Authorization: Bearer 6bb86f18-e69e-4c2b-8fbf-85d7d5b800a4"

foo
```

**client_credentials** 流程**不提供**刷新令牌。

### password

流程与 **client_credentials** 类似，但额外提交**资源拥有者**的用户名与密码，因此需在应用里配置用户（见 WebSecurity）。示例安全配置：

```java
@Configuration
@EnableWebSecurity
public class WebSecurity extends WebSecurityConfigurerAdapter {

 @Override
 protected void configure(AuthenticationManagerBuilder auth) throws Exception {
  auth.inMemoryAuthentication()
      .withUser("gwidgets").password("gwidgets").authorities("CLIENT");
 }

 @Override
 protected void configure(HttpSecurity http) throws Exception {
   http.authorizeRequests()
       .anyRequest().authenticated()
       .and().formLogin().defaultSuccessUrl("/test.html")
       .and().csrf().disable();
 }
}
```

获取令牌：

```bash
curl -X POST --user my-trusted-client:mysecret localhost:8081/oauth/token \
 -d 'grant_type=password&username=gwidgets&password=gwidgets' \
 -H "Accept: application/json"
```

```json
{
  "access_token": "3670fea1-eab3-4981-b80a-e5c57203b20e",
  "token_type": "bearer",
  "expires_in": 51,
  "scope": "read write trust"
}
```

**password** 许可在常见配置下同样**不颁发**刷新令牌（是否启用以你的授权服务器策略为准）。

### implicit

**implicit** 适合带前端路由的单页应用等场景，往往依赖浏览器会话与登录态。可在授权服务器上放一个简单的测试页（也可部署在别处）：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Title</title>
  </head>
  <body>
    <p>we are here</p>
  </body>
</html>
```

在浏览器中打开授权端点（注意与客户端注册的 **redirect_uri** 一致）：

<http://localhost:8081/oauth/authorize?response_type=token&client_id=my-trusted-client&redirect-uri=http://localhost:8081/test.html>

![Login redirect](01.webp)

登录后进入 OAuth **同意/授权**页（Spring 默认 UI，可自定义）：

![OAuth approval](02.webp)

用户同意后，浏览器重定向回 **redirect_uri**，此时 **access token** 出现在 **URL fragment（# 之后）**：

![Implicit grant](03.webp)

### authorization_code

与 **implicit** 类似，先把 `response_type` 换成 **`code`**，例如：

[http://localhost:8081/oauth/authorize?response_type=code&client_id=my-trusted-client&redirect-uri=http://localhost:8081/test.html](http://localhost:8081/oauth/authorize?response_type=code&client_id=my-trusted-client&redirect-uri=http://localhost:8081/test.html)

登录并同意后，回调 URL 会带上 **`code`** 查询参数，例如：

[http://localhost:8081/test.html?code=bD0mVb](http://localhost:8081/test.html?code=bD0mVb)

再用 **code** 换令牌（演示用 curl；页面里用 JavaScript 亦可）：

```bash
curl -X POST --user my-trusted-client:mysecret localhost:8081/oauth/token \
-d 'grant_type=authorization_code&code=bD0mVb&redirect_uri=http://localhost:8081/test.html'\
-H "Accept: application/json"
```

```json
{
  "access_token": "0abe701b-0f5a-4d25-81df-f2c4db2af555",
  "token_type": "bearer",
  "refresh_token": "cf6aa9db-3757-465e-af68-b7d59d1f0b77",
  "expires_in": 59,
  "scope": "trust read write"
}
```

### refresh_token

在上述示例中，**authorization_code** 流程会返回 **refresh_token**。访问令牌约 **60 秒**后过期，再用旧 token 访问会得到类似：

```json
{
  "error": "invalid_token",
  "error_description": "0abe701b-0f5a-4d25-81df-f2c4db2af555"
}
```

此时用刷新令牌换新对：

```bash
curl -X POST --user my-trusted-client:mysecret localhost:8081/oauth/token -d 'client_id=my-trusted-client&grant_type=refresh_token&refresh_token=cf6aa9db-3757-465e-af68-b7d59d1f0b77' -H "Accept: application/json"
```

```json
{
  "access_token": "2f9a6609-fc64-4b1e-93a3-8232827da881",
  "token_type": "bearer",
  "refresh_token": "cf6aa9db-3757-465e-af68-b7d59d1f0b77",
  "expires_in": 59,
  "scope": "trust read write"
}
```

可如此反复续期。

## 小结

Spring Security OAuth（及配套自动配置）提供了开箱即用的 **`/oauth/token`**、**`/oauth/check_token`** 等端点，能快速搭起演示环境；对不熟悉 Spring 的读者，背后仍有较多魔法。希望本文能帮你建立整体图景。**下一篇**将讨论如何用 **scope** 细粒度保护端点。

完整示例代码见：[zak905/oauth2-example](https://github.com/zak905/oauth2-example)。

> 本文为学习目的的个人翻译，译文仅供参考。
>
> 原文链接：[Using OAuth2 in Spring, Part 1](http://www.zakariaamine.com/2018-01-27/using-oauth2-in-spring/)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
