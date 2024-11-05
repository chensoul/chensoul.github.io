---
title: "[译]OAuth2 with Spring 第1部分：了解基本概念"
date: 2024-06-05
type: post
slug: oauth2-with-spring-part-1-knowing-the-basic-concepts
categories: ["spring-boot"]
tags: [ oauth2,java]
---

原文地址：<https://mainul35.medium.com/oauth2-with-spring-part-1-knowing-the-basic-concepts-5c4aa17884a>



在本系列**关于 Spring 的 OAuth2**的文章中，我将尝试介绍和解释与 OAuth2 相关的每一个问题以及如何在 Spring 框架中实现这些问题。请记住，OAuth2 完全是一个概念性的东西，在不同的框架中，它有自己的实现。此外，许多应用程序开发人员开发自己的 OAuth2 实现，而不使用 Spring 框架提供的 OAuth2 框架支持。因此，我将就这个主题撰写一系列文章。

## 什么是 OAuth2 以及为什么？

根据[Octa](https://developer.okta.com/blog/2017/06/21/what-the-heck-is-oauth)的说法，OAuth2 是一种用于身份验证和授权的开放标准。它实际上不是一种服务，但它通过 TLS 提供基于令牌的安全性来保护服务。它使用令牌而不是凭据来授权设备、服务器、API 和应用程序。

OAuth2 的主要目的是让用户能够从单个点或提供商访问多个应用程序，这些应用程序可以使用相同的身份验证和授权信息。这意味着，并不总是需要使用用户 ID 和密码登录。相反，用户将被重定向到拥有用户身份的授权服务器，用户只需单击一下即可允许其他应用程序使用其身份验证信息。一旦获得授权，用户就可以使用来自授权服务器的相同 ID。

## OAuth2 参与者和授权类型

**a) 参与者**

对于 OAuth2 架构，有 4 个参与者 -

- **资源所有者——在授权服务器**中拥有自己的授权信息（通常是用户名、密码、角色等）的用户
- **客户端**——客户端可以被视为**资源所有者**能够请求**资源服务器中受保护资源的应用程序**
- **授权服务器——位于客户端**和**资源所有者**中间，检查身份验证和授权的服务器
- **资源服务器——包含资源** **所有者**想要访问的资源。

**b) 授权类型**

OAuth2 有几种授权类型来请求访问令牌。授权类型的唯一目的是生成访问令牌。授权类型包括：

- **授权码**— 为了接收访问令牌，授权客户端向授权服务器发送请求以及先前从授权服务器收到的授权码。本系列的[第 3 部分](https://medium.com/@mainul35/oauth2-with-spring-part-3-authorizing-oidc-client-with-via-authorization-code-grant-from-spring-67769f9dd68a)专门介绍此授权码授予。
- **PKCE —**代码交换证明密钥 (PKCE) 是授权代码授予的扩展版本，旨在支持单页应用程序或移动应用程序，以防止 CSRF 或授权代码注入攻击。PKCE
  最初旨在保护移动应用程序中的授权代码流，但其防止授权代码注入的能力使其适用于每种类型的 OAuth 客户端，甚至是使用客户端身份验证的 Web 应用程序。本系列的[第 5 部分](https://medium.com/@mainul35/oauth2-with-spring-part-5-securing-your-spring-boot-application-with-pkce-for-enhanced-security-d8025cd08769)描述了此流程的代码示例。
- **客户端凭证**— 在此流程中，客户端应用程序使用 client_id 和 client_secret 进行请求，授权类型为 client_credential。这通常发生在使用服务的第三方应用程序中。本系列的[第 2 部分](https://mainul35.medium.com/oauth2-with-spring-part-2-getting-started-with-authorization-server-13804910cb2a)专门介绍此客户端凭证。
- **刷新令牌授权**— 此授权类型由客户端使用。当访问令牌过期时，存储在客户端内存中的刷新令牌将以授权类型 refresh_token 发送到授权服务器。服务器将返回一个新的 access_token。我们不会专门写一篇文章，因为它主要由应用程序内部处理。

## 了解接收访问令牌的工作流程

![img](/images/oauth2-with-spring-part-1-01.webp)

OAuth 工作流

- 为了请求资源服务器中的某些资源，资源所有者需要访问令牌
- **资源所有者**打开一个应用程序（可能是**授权服务器**的**客户端**，在上图中**为 BusinessClient**）来请求**资源服务器**中的一些安全资源。
- 当**资源所有者**请求没有任何令牌的资源时，他/她可以选择**授权服务器**。
- 选择后，**客户端**将被重定向到**授权服务器**。**授权服务器**要求输入用户名和密码（以及**grant_type**）。
- **资源所有者**提供所需信息并提交。如果信息真实，**授权服务器**将访问令牌（以及其他信息，可选）发送给客户**端**。
- 客户端保存**令牌**并在内部创建对资源的请求，这是**资源所有者**在没有令牌时提出的。
- 收到令牌后，资源服务器将其发送到**授权服务器**以验证令牌。
- 如果**授权服务器向**资源服务器**提供了肯定的响应，资源服务器将响应**资源所有者请求的信息。

这就是整个过程的工作原理。在我的[下一篇文章](/posts/2024/06/05/oauth2-with-spring-part-2-getting-started-with-authorization-server/)中，我将深入研究代码并演示使用内存客户端的 OAuth2 实现。

## 参考：

1. OAuth2 授权类型 — https://oauth.net/2/grant-types/
2. OAuth2 角色 - http://websystique.com/spring-security/secure-spring-rest-api-using-oauth2/
