---
title: "2023-12-21｜Spring Security对OAuth2的支持及实现方式"
date: 2023-12-21
slug: til
categories: [ "Review" ]
tags: [ "spring-security",oauth2 ]
---

Today I Learned. 今天分享内容：Spring Security 对 OAuth2 的支持

Spring Security 提供了对 OAuth 的支持，并且有几个相关的项目可以用于实现 OAuth 功能。以下是一些常见的 Spring Security OAuth
项目及其相关信息：

1. Spring Security
   OAuth（[https://github.com/spring-attic/spring-security-oauth](https://github.com/spring-attic/spring-security-oauth)
   ）：官方提供的 Spring Security OAuth 项目，为 Spring 应用程序提供了 OAuth 1.0 和 OAuth 2.0 的支持。该项目在 Spring
   Security 5.x 版本后已不再维护，建议使用后续提到的 Spring Authorization Server。
2. Spring Security 5（[https://github.com/spring-attic/spring-security](https://github.com/spring-attic/spring-security)
   ）：Spring Security 5.x 版本开始将 OAuth 2.0 客户端支持集成到核心库中，使得在 Spring Security 中实现 OAuth 2.0
   认证变得更加简单。你可以使用 Spring Security 5.x 以及后续版本来实现 OAuth 2.0 客户端功能。
3. Spring Security OAuth2
   Boot（[https://github.com/spring-attic/spring-security-oauth2-boot](https://github.com/spring-attic/spring-security-oauth2-boot)
   ），该项目是 `spring-attic` 组织维护的，提供了 Spring Boot 2 和旧版 Spring Security OAuth
   的自动配置。该项目已经停止了活跃的开发和更新，最新的提交日期是 2022 年 5 月 20 日。
4. Spring Authorization Server（https:[]()/github.com/spring-projects/spring-authorization-server）：官方提供的用于构建
   OAuth 2.0 授权服务器的实验性项目。它是 Spring Security 5.3 之后推出的替代方案，旨在提供更简化和灵活的 OAuth 2.0
   授权服务器功能。

> Authorization Server
>
> - 目前，Spring Security 不支持实现 OAuth 2.0 授权服务器。
> - 但是，此功能可从 [Spring Security OAuth](https://spring.io/projects/spring-security-oauth) 项目中获得，该项目最终将被
    Spring Security 完全取代。
> - 在此之前，您可以使用该 `spring-security-oauth2-autoconfigure` 模块轻松设置 OAuth 2.0
    授权服务器；有关说明，请参阅其 [文档](https://docs.spring.io/spring-security-oauth2-boot/)。

|        | Spring OAuth 2.0                                                               | Spring Security OAuth Boot                                                                 | Spring Cloud Security                                                          | Spring OAuth 2.1                                                                              |
|--------|--------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| 仓库地址   | [spring-security-oauth](https://github.com/spring-attic/spring-security-oauth) | [spring-security-oauth2-boot](https://github.com/spring-attic/spring-security-oauth2-boot) | [spring-cloud-security](https://github.com/spring-attic/spring-cloud-security) | [spring-authorization-server](https://github.com/spring-projects/spring-authorization-server) |
| 是否更新   | 2022年6月1日归档                                                                    | 2022年5月31日归档                                                                               | 2022年4月4日归档                                                                    |                                                                                               |
| 最新版本   | 2.5.2.RELEASE                                                                  | 2.6.8                                                                                      | 2.2.5                                                                          | 1.2.1                                                                                         |
| 授权方式   | 授权码 客户凭证                                                                       |                                                                                            |                                                                                | 授权码 客户端凭据 隐式 密码 设备授权                                                                          |
| JDK 8  | 支持，接口已全面废弃                                                                     |                                                                                            |                                                                                | 1.0 之前的版本支持（0.3.0 仅支持 JDK 11）                                                                 |
| JDK 11 | 支持，接口已全面废弃                                                                     |                                                                                            |                                                                                | 1.0 之前的版本支持                                                                                   |
| JDK 17 | 不支持                                                                            |                                                                                            |                                                                                | 1.0 之后的版本支持                                                                                   |

参考 [https://github.com/spring-projects/spring-security/wiki/OAuth-2.0-Features-Matrix](https://github.com/spring-projects/spring-security/wiki/OAuth-2.0-Features-Matrix)

1、***Spring Security 中 OAuth 2.0 支持的未来是什么？***

Spring Security 5.0 引入了对 OAuth 2.0 授权框架和 OpenID Connect 1.0 的新客户端支持。Spring Security 5.1
引入了新的资源服务器支持以及对不同授权类型的额外客户端支持。Spring Security 5.2延续了这一模式，为资源服务器和客户端提供了更多支持。

2、***Spring Security OAuth 2.3+ 中是否实现了新功能？***

我们将提供错误/安全修复并考虑添加较小的增强功能。我们未来的计划是将 Spring Security OAuth 中当前的所有功能构建到 Spring
Security 5.x 中。在 Spring Security 达到与 Spring Security OAuth 同等的功能后，我们将继续支持错误和安全修复至少一年。

3、***Spring Boot 2.0 是否提供对 Spring Security OAuth 的支持？***

Spring Boot 2.0 已放弃对 Spring Security OAuth 的支持。但是，它在 Spring Security 5 中提供了对 OAuth 2.0 Login、OAuth 2.0
Client 和 OAuth 2.0 Resource Server 的支持。

4、***有没有办法在 Spring Boot 2.0 中集成 Spring Security OAuth？***

Spring [Security OAuth Boot 2 Autoconfig](https://github.com/spring-projects/spring-security-oauth2-boot)项目是 Spring
Boot 1.5.x 中包含的 Spring Security OAuth 自动配置的端口。如果您想在 Spring Boot 2.0 中使用 Spring Security
OAuth，则必须在项目中显式包含以下依赖项：

- **组ID:** `org.springframework.security.oauth.boot`
- **工件ID：** `spring-security-oauth2-autoconfigure`

---
我创建了一个项目 [spring-security-oauth2-legacy](https://github.com/chensoul/spring-security-oauth2-legacy)，使用 Spring
Security OAuth2 Boot 来自动装配资源服务器。目前，还在测试中。

如果想基于 [spring-authorization-server](https://github.com/spring-projects/spring-authorization-server)
创建认证服务器和资源服务器，可以参考 github
上这个仓库：[xuxiaowei-cloud](https://github.com/xuxiaowei-cloud/xuxiaowei-cloud)。

其 main 分支基于 JDK 8/11、Spring Boot 2.7.x、OAuth 2.1、Vite 4、Vue 3、Element Plus
的微服务。支持支付宝、钉钉、码云、QQ、微信、企业微信、微博等第三方登录。包含基于 GitLab Runner 的 kubernetes（k8s）、Docker、Shell 等
CI/CD 流水线进行自动构建、制作 Docker 镜像、发布。永久免费开源。

其[archive/OAuth2.0](https://github.com/xuxiaowei-cloud/xuxiaowei-cloud/blob/archive/OAuth2.0/)
分支是基于 [spring-security-oauth2-boot](https://github.com/spring-attic/spring-security-oauth2-boot) 实现的，可以参考代码。
