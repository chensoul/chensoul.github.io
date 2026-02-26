---
title: "[译]OAuth2 with Spring 第2部分：授权服务器入门"
date: 2024-06-05 08:00:00+08:00
slug: oauth2-with-spring-part-2-getting-started-with-authorization-server
categories: [ "translation" ]
tags: ['spring-boot','oauth2']
---

原文地址：[https://mainul35.medium.com/oauth2-with-spring-part-2-getting-started-with-authorization-server-13804910cb2a](https://mainul35.medium.com/oauth2-with-spring-part-2-getting-started-with-authorization-server-13804910cb2a)



Spring 团队最近发布了他们的授权服务器。OAuth2 一直是一个热门话题，而构建或理解授权服务器一直是一个谜。在本系列的[第 1 部分](/posts/2024/06/05/oauth2-with-spring-part-1-knowing-the-basic-concepts/)中，我描述了几乎所有您需要了解的有关 OAuth2 的概念性内容。在本系列的这篇文章中，我将尝试演示如何构建具有**client_credential**授权类型的授权服务器。我将从使用配置属性进行自动配置开始解释它们，并通过编写 Java 代码自定义配置。让我们开始吧。

# 设置授权服务器

让我们转到[Spring Initializr](https://start.spring.io/)并生成项目。

![img](/images/oauth2-with-spring-part-2-01.webp)

为了创建授权服务器，我们需要 Oauth2 授权服务器依赖。

```xml
<dependency>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-starter-oauth2-authorization-server</artifactId>
</dependency>
```

生成项目并导入到您最喜欢的 IDE。

现在让我们在application.yml中添加我们想要的配置。

在[第 1 部分](/posts/2024/06/05/oauth2-with-spring-part-1-knowing-the-basic-concepts/)中，我们了解到我们需要一个客户端来从授权服务器获取令牌。因此，我们需要授权服务器有一些客户端信息。在 application.yml 中，我将放置获取令牌和其他授权信息所需的最少客户端信息。

```yml
spring:
  security:
    oauth2:
      authorization-server:
        client:
          client-1:
            registration:
              client-id: client
              client-secret: "{noop}secret"
              client-authentication-methods: client_secret_basic
              authorization-grant-types: client_credentials
```

根据上面的配置属性，我们注册了一个客户端**client-1**。

对于**client-1**，我们定义了 4 个属性：

- clientId
- client-secret
- client-authentication-methods：本例中为基本身份验证 client_secret_basic
- authorization-grant-types：用于请求新令牌的授予类型。在本例中为 client_credentials

现在，我们必须启动授权服务器应用程序。



![img](/images/oauth2-with-spring-part-2-02.webp)

接下来，在 postman 中，我们向*/oauth2/token*端点发出 POST 请求以获取令牌。为什么是*/oauth2/token*端点？

![img](/images/oauth2-with-spring-part-2-03.webp)



![img](/images/oauth2-with-spring-part-2-04.webp)

我们可以看到，一旦我们提交请求，我们就会收到详细的令牌信息。

瞧，我们最小的授权服务器现在已经启动并运行了。

该项目的链接可以[在这里](https://github.com/mainul35/authorization-server-demo/tree/authorization-server-demo/getting-refresh-token)找到。

## 问题

**1. 我们在哪里找到默认令牌端点？**

答：在 OAuth2 的 RFC 中，它提到默认令牌端点应该是*/token*。但是，很难找到 Spring Boot 授权服务器的默认令牌端点。我不得不浏览源代码。在类**OAuth2TokenEndpointFilter**中，提到了默认令牌端点。

感谢您的耐心阅读。在[下一篇文章](/posts/2024/06/05/oauth2-with-spring-part-3-authorizing-oidc-client-with-via-authorization-code-grant-from-spring/)中，我们将尝试创建一个资源服务器，使用authorization_code授权获取令牌以访问一些私人数据。
