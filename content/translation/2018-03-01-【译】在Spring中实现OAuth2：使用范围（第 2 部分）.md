---
title: "【译】在 Spring 中实现 OAuth2：使用范围（第 2 部分）"
date: 2018-03-01 00:00:00+08:00
draft: false
slug: using-oauth2-in-spring-scopes
categories: [ "translation" ]
tags: [ "spring-boot", "oauth2" ]
description: "OAuth2 的 scope：在 Spring OAuth 中为资源端点划分读写等权限，并配置客户端可申请的 scope。"
canonicalURL: "http://www.zakariaamine.com/2018-03-01/using-oauth2-in-spring-scopes/"
---

在[上一篇：在 Spring 中实现 OAuth2（第 1 部分）](/translation/using-oauth2-in-spring/)中，我们已了解 OAuth2 的基本概念，以及如何在 Spring 中配置多种授权许可类型。本篇聚焦 OAuth2 的另一个核心概念：**scope（范围）**。

## 为何需要 scope

保护应用访问通常分两步：**认证（authentication）**与**授权（authorization）**。可以类比：你拿到一张能刷开大楼闸机的工牌——这相当于 **OAuth 令牌**；但能否进入某一楼层，还取决于**权限策略**。

OAuth 里的 **scope** 就是用来描述「这张令牌**允许操作哪些资源**、**不允许哪些**」；它提供比「有令牌 / 没令牌」更细的一层访问控制，作用上接近传统系统里的**角色**，但粒度由资源所有者与授权服务器约定。

## 实现

示例仍基于第 1 部分的仓库：[zak905/oauth2-example](https://github.com/zak905/oauth2-example)。

资源服务器中的 [ResourceController](https://github.com/zak905/oauth2-example/blob/master/resource-server/src/main/java/com/gwidgets/examples/resourceserver/ResourceController.java) 如下（为演示 HTTP 动词与 scope 的映射，部分路由改为 POST/DELETE）：

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

    @PostMapping("/bar")
    public String bar(){
        return "bar";
    }

    @DeleteMapping("/test")
    public String test(){
        return "test";
    }
}
```

先在 [授权服务器配置](https://github.com/zak905/oauth2-example/blob/master/authorization-server/src/main/java/com/gwidgets/examples/authorizationserver/AuthorizationSecurityConfig.java#L34)里声明客户端可用的 **scopes**（与第 1 部分一致）：

```java
 clients.inMemory().withClient("my-trusted-client")
                .authorizedGrantTypes("password",
                        "refresh_token", "implicit", "client_credentials", "authorization_code")
                .authorities("CLIENT")
                .scopes("read", "write", "trust")
                .accessTokenValiditySeconds(60)
                .redirectUris("http://localhost:8081/test.html")
                .resourceIds("resource")
                .secret("mysecret");

```

在资源服务器侧校验 scope，有两种常见做法：**URL 级安全配置**，或 **方法级安全注解**。

### 方式一：在 `HttpSecurity` 中写 SpEL

```java
 @Override
 public void configure(HttpSecurity http) throws Exception {
  http
   .authorizeRequests()
    .antMatchers(HttpMethod.GET,"/hello").access("#oauth2.hasScope('read')")
    .antMatchers(HttpMethod.GET,"/foo").access("#oauth2.hasScope('read')")
    .antMatchers(HttpMethod.POST,"/bar").access("#oauth2.hasScope('write')")
    .antMatchers(HttpMethod.DELETE,"/test").access("#oauth2.hasScope('trust')")
   .anyRequest().authenticated().
    and().csrf().disable();
 }

```

### 方式二：`@PreAuthorize` 等方法级注解

```java
    @PreAuthorize("#oauth2.hasScope('read')")
    @GetMapping("/hello")
    public String hello(){
        return "hello";
    }

    @PreAuthorize("#oauth2.hasScope('read')")
    @GetMapping("/foo")
    public String foo(){
        return "foo";
    }

    @PreAuthorize("#oauth2.hasScope('write')")
    @PostMapping("/bar")
    public String bar(){
        return "bar";
    }

    @PreAuthorize("#oauth2.hasScope('trust')")
    @DeleteMapping("/test")
    public String test(){
        return "test";
    }
```

若使用第二种方式，需在某一配置类上启用 **`@EnableGlobalMethodSecurity(prePostEnabled = true)`**（示例见 [ResourceSecurityConfiguration](https://github.com/zak905/oauth2-example/blob/master/resource-server/src/main/java/com/gwidgets/examples/resourceserver/ResourceSecurityConfiguration.java#L18)）。**`prePostEnabled = true`** 会启用 **`@PreAuthorize` / `@PostAuthorize`** 等前置/后置方法安全。

`#oauth2.hasScope('trust')` 一类表达式基于 **Spring 表达式语言（SpEL）**，详见 [Spring Framework 文档](https://docs.spring.io/spring/docs/4.3.12.RELEASE/spring-framework-reference/html/expressions.html)。

## 按 scope 申请令牌

若请求令牌时**未显式指定 scope**，Spring 默认认为令牌拥有**客户端配置中的全部 scopes**。先只申请 **`read`**：

```bash
curl -X POST --user my-trusted-client:mysecret localhost:8081/oauth/token -d 'grant_type=client_credentials&client_id=my-trusted-client&scope=read' -H "Accept: application/json"
```

```json
{
  "access_token": "acadbb31-f126-411d-ae5b-6a278cee2ed6",
  "token_type": "bearer",
  "expires_in": 60,
  "scope": "read"
}
```

用该令牌访问需要 **`read` scope** 的端点应成功：

```bash
 curl -XGET localhost:8989/hello -H "Authorization: Bearer acadbb31-f126-411d-ae5b-6a278cee2ed6"

 hello

curl -XGET localhost:8989/foo -H "Authorization: Bearer acadbb31-f126-411d-ae5b-6a278cee2ed6"

 foo
```

若拿 **`read` 令牌**去调用需要 **`write`** 的接口，会被拒绝：

```bash
curl -XPOST localhost:8989/bar -H "Authorization: Bearer acadbb31-f126-411d-ae5b-6a278cee2ed6"
```

```json
{
  "error": "access_denied",
  "error_description": "Access is denied"
}
```

换发只含 **`write`** 的令牌再试：

```bash
curl -X POST --user my-trusted-client:mysecret localhost:8081/oauth/token -d 'grant_type=client_credentials&client_id=my-trusted-client&scope=write' -H "Accept: application/json"
```

```json
{
  "access_token": "bf0fa83a-23bd-4633-ac6c-a06f40d53e5f",
  "token_type": "bearer",
  "expires_in": 3599,
  "scope": "write"
}
```

```bash
curl -XPOST localhost:8989/bar -H "Authorization: Bearer bf0fa83a-23bd-4633-ac6c-a06f40d53e5f"

bar
```

## 小结

**scope** 很重要：访问令牌本身往往**不携带**终端用户画像的完整信息，**scope** 负责在资源侧做**最小权限**约束。后续还可把 Google、Facebook 等**外部授权服务器**接入同一流程（作者原计划的下文主题）。

> 本文为学习目的的个人翻译，译文仅供参考。
>
> 原文链接：[Using OAuth2 in Spring, Scopes, Part 2](http://www.zakariaamine.com/2018-03-01/using-oauth2-in-spring-scopes/)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
