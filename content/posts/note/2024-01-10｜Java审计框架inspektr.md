---
title: "2024-01-10｜ Java审计框架inspektr"
date: 2024-01-10
type: post
slug: til
categories: ["Review"]
tags: [review]
---

今天做了什么：

1、Java Lambda 增强 https://github.com/jOOQ/jOOL 和 https://github.com/vavr-io/vavr ，jOOL 在 jdk8 下存在编译错误，计划，整合这两个项目，创建一个新的项目，只引入自己需要的一些类。



2、[https://www.pac4j.org/](https://www.pac4j.org/) 一个安全框架



3、[https://github.com/apereo/inspektr](https://github.com/apereo/inspektr) 一个轻量级的 Java 审计框架。这个是在看 CAS 源码的过程中，发现的。

在 CAS 的源码中，有一些比较不错的代码，引入到自己的项目中，另外，打算仿照这个 inspektr 框架，重写公司微服务项目中的日志记录模块。



4、分享一个安全相关的 wiki 网站：[https://wukong-doc.redhtc.com/security](https://wukong-doc.redhtc.com/security)



总结：

待办事项：

- 重写微服务日志记录模块
- 写一个 Lambda 类库
- 重构公司微服务框架
- 继续重构 foodie-cloud
  - 支持单点登录
  - 支持全文检索
  - 集成 Spring Security OAuth2
