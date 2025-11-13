---
categories: [learning]
date: 2024-11-13 00:00:00 +0000 UTC
lastmod: 2024-11-13 00:00:00 +0000 UTC
publishdate: 2024-11-13 00:00:00 +0000 UTC
slug: til
tags: [diary]
title: 2024-11-13｜今天我做了什么
---

## Spring 周报

[This Week in Spring - November 12th, 2024](https://spring.io/blog/2024/11/12/this-week-in-spring-november-12th-2024)

- [Spring Cloud 2024.0.0-RC1 (aka Moorgate) has been released](https://spring.io/blog/2024/11/08/spring-cloud-2024-0-0-rc1-aka-moorgate-has-been-released)
- [integrate Langchain4J with Spring is pretty amazing](https://javaetmoi.com/2024/11/integrer-un-chatbot-dans-une-webapp-java-avec-langchain4j/)：SpringBoot 集成 Langchain4J
- [fake OAuth 2 single sign on in a Spring application](https://blogs.vmware.com/tanzu/faking-oauth2-single-sign-on-in-spring-3-ways/)
  - 使用 MockMvc
  - 使用 WireMock

- [get started with `pgvector`, the module for vector stores in PostgreSQL](https://www.youtube.com/watch?v=psxR23HOGbI)
- [Spring AI has natiuve support for Kotlin! Nice!](https://github.com/spring-projects/spring-ai/pull/1666)：Spring AI Native 支持 Kotlin
- [JEP 483, landing in Java 24, introduces AOT class loading and linking](https://openjdk.org/jeps/483)
- [synchronize virtual threads without pinning](https://openjdk.org/jeps/491)： Java 24 新特性



## 本地 Authorization Server

Tanzu 开发了一个本地的 Spring Authorization Server，相关介绍参考下面两篇文章。

- [Unlocking Security: A Deep Dive into the Local Authorization Server](https://blogs.vmware.com/tanzu/unlocking-security-a-deep-dive-into-the-local-authorization-server/)
- [Using Tanzu Local Authorization Server in Tests](https://techdocs.broadcom.com/us/en/vmware-tanzu/spring/tanzu-spring/commercial/spring-tanzu/local-auth-server-testing-local-auth-server.html)

可以从 [这里](https://packages.broadcom.com/artifactory/spring-enterprise/com/vmware/tanzu/spring/tanzu-local-authorization-server/) 下载（需要登录）最新版本的 jar。下载成功之后，运行：

```bash
java -jar tanzu-local-authorization-server-<VERSION>.jar
```

用户名和密码在控制台：

```bash
🧑 You can log in with the following users:
---
username: user
password: password
```

该应用是一个 Spring Boot 项目，默认配置如下：

```yaml
security:
    oauth2:
      client:
        registration:
          tanzu-local-authorization-server:
            client-id: default-client-id
            client-secret: default-client-secret
            client-name: Tanzu Local Authorization Server
            scope:
              - openid
              - email
              - profile
        provider:
          tanzu-local-authorization-server:
            issuer-uri: http://localhost:9000
```

更详细的说明，可以参考上面的链接。示例源代码地址：https://github.com/Kehrlann/tlas-client-demo 。



类似的，可以作为本地的 Authorization Server 的还有：

- [Dex](https://dexidp.io/)，[使用示例](https://github.com/Kehrlann/spring-security-architecture-workshop/blob/main/dex.yml)
- [keycloak](https://www.keycloak.org/)，微服务 [使用示例](https://github.com/sivaprasadreddy/spring-boot-microservices-course/blob/main/deployment/docker-compose/infra.yml)
- [Auth0](https://auth0.com/)
- [Gluu](https://gluu.org/)
- [Okta](https://developer.okta.com/)
- [Ory](https://www.ory.sh/)

## Spring Boot 发送邮件

- 使用 Mailpit [Using Mailpit with Spring Boot](https://dimitri.codes/spring-boot-mailpit/)
- 使用 Mailhog [Using MailHog via Docker for testing email](https://akrabat.com/using-mailhog-via-docker-for-testing-email/)

- 使用 [Maildev](https://github.com/maildev/maildev)


