---
title: "[译]在 Spring 中实现 OAuth2：使用范围（第 2 部分）"
date: 2023-07-26
slug: using-oauth2-in-spring-scopes
categories: ["Java"]
tags: [java, spring, "spring boot", "spring security", oauth2]
---

我们在[上一篇文章](/posts/2023/07/26/using-oauth2-in-spring/)中了解了基本的 OAuth2 概念以及如何在 Spring 中实现和执行不同的授权。在这篇文章中，我们将介绍 OAuth2 的另一个重要概念：范围。

## OAuth 范围

保护对应用程序的访问通常分两个步骤进行：身份验证和授权。要理解这两个概念，假设您在绝密政府大楼工作。在开始之前，你会得到一张卡片，可以让你进入建筑物。 OAuth 令牌可以看作是允许您访问的卡片。

一旦你进去，你决定去三楼见你的一位同事，在尝试使用你的卡打开三楼的门后，你听到一声嘟嘟声，告诉你你没有被授权。在 OAuth 中，范围是一种定义令牌可以访问哪些资源以及不能访问哪些资源的方法。范围允许访问控制，并且可以被视为相当于传统身份验证中的用户角色。

## 实现

为了演示范围，我们将使用第 1 部分中的[示例](https://github.com/zak905/oauth2-example)。

在[资源服务器](https://github.com/zak905/oauth2-example/blob/master/resource-server/src/main/java/com/gwidgets/examples/resourceserver/ResourceController.java)的控制器中，我们有以下端点：

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

第一步是使用所需的范围配置[授权服务器](https://github.com/zak905/oauth2-example/blob/master/authorization-server/src/main/java/com/gwidgets/examples/authorizationserver/AuthorizationSecurityConfig.java#L34)：

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

要在资源服务器中启用范围检查，我们有两个选项：使用安全配置或使用方法安全性。

- 使用安全配置：

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

- 使用方法安全性：

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

另外，我们需要将 `@EnableGlobalMethodSecurity(prePostEnabled = true)` 添加到 Spring 可以获取的任何类（ `@Configuration` 、 `@Service` 等）。在我们的示例中，我们已将其添加到 [ResourceSecurityConfiguration](https://github.com/zak905/oauth2-example/blob/master/resource-server/src/main/java/com/gwidgets/examples/resourceserver/ResourceSecurityConfiguration.java#L18) 类中。 `prePostEnabled = true` 告诉 Spring 启用前注解和后注解，例如 `@PreAuthorize` 、 `@PostFilter` 等......

对于那些想了解 `#oauth2.hasScope('trust')` 这样的表达式的人来说，它们是使用 [Spring 表达式语言](https://docs.spring.io/spring/docs/4.3.12.RELEASE/spring-framework-reference/html/expressions.html)（SpEL）构建的。

## 行动范围

默认情况下，如果令牌请求中不存在范围，Spring 会假定令牌具有所有配置的范围。让我们首先请求一个具有 `read` 范围的令牌：

```bash
curl -X POST --user my-trusted-client:mysecret localhost:8081/oauth/token -d 'grant_type=client_credentials&client_id=my-trusted-client&scope=read' -H "Accept: application/json"
```

回复：

```json
{
  "access_token": "acadbb31-f126-411d-ae5b-6a278cee2ed6",
  "token_type": "bearer",
  "expires_in": 60,
  "scope": "read"
}
```

现在，我们可以使用令牌来访问具有 `read` 范围访问权限的端点：

```bash
 curl -XGET localhost:8989/hello -H "Authorization: Bearer acadbb31-f126-411d-ae5b-6a278cee2ed6"

 hello

curl -XGET localhost:8989/foo -H "Authorization: Bearer acadbb31-f126-411d-ae5b-6a278cee2ed6"

 foo
```

现在，让我们尝试在仅接受 `write` 范围的端点上使用此令牌：

```bash
curl -XPOST localhost:8989/bar -H "Authorization: Bearer acadbb31-f126-411d-ae5b-6a278cee2ed6"
```

回复：

```json
{
  "error": "access_denied",
  "error_description": "Access is denied"
}
```

由于令牌不具有所需的范围，因此访问被拒绝。让我们尝试获取一个具有 `write` 范围的新令牌，然后重试：

```bash
curl -X POST --user my-trusted-client:mysecret localhost:8081/oauth/token -d 'grant_type=client_credentials&client_id=my-trusted-client&scope=write' -H "Accept: application/json"
```

回复：

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

## 总结

范围是 OAuth 的一个重要方面，因为令牌不携带有关其用户或请求者的信息。范围允许限制对资源的访问，以实现更好的访问控制和安全性。在下一篇文章中，我们将了解如何将 Google 和 Facebook 等外部 OAuth 提供商集成到流程中。

原文链接：[http://www.zakariaamine.com/2018-03-01/using-oauth2-in-spring-scopes/](http://www.zakariaamine.com/2018-03-01/using-oauth2-in-spring-scopes/)
