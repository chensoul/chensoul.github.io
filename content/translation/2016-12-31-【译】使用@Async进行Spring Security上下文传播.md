---
title: "【译】使用@Async进行Spring Security上下文传播"
date: 2016-12-31 08:16:00+08:00
draft: true
slug: spring-security-async-principal-propagation
categories: [ "translation" ]
tags: [ "spring-security", "async" ]
description: "在 @Async 线程中传播 Spring Security 的 Authentication：为何默认丢失，以及如何用 DelegatingSecurityContextAsyncTaskExecutor 恢复上下文。"
---

## 1. 简介

本教程关注：在使用 **`@Async`** 时，如何把 **Spring Security** 的认证信息（**principal**）一并带到异步线程里。

默认情况下，认证信息存放在 **`ThreadLocal`** 中；当执行流进入 **`@Async`** 新开出的线程时，那里**并没有**已认证的 **`SecurityContext`**。

这显然不理想——下面给出解决办法。

## 2. Maven 依赖

若要在 Spring Security 中配合异步使用，请在 `pom.xml` 中加入 **`spring-security-config`**（版本需与项目其余 Spring Security 组件一致），例如：

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-config</artifactId>
    <version>5.7.3</version>
</dependency>
```

可在 [Maven Central](https://search.maven.org/classic/#search|ga|1|g%3A%22org.springframework.security%22) 查询与你环境匹配的版本。

## 3. 在 `@Async` 中传播 Security 上下文

先看一个最小示例。控制器方法：

```java
@RequestMapping(method = RequestMethod.GET, value = "/async")
@ResponseBody
public Object standardProcessing() throws Exception {
    log.info("Outside the @Async logic - before the async call: "
      + SecurityContextHolder.getContext().getAuthentication().getPrincipal());

    asyncService.asyncCall();

    log.info("Inside the @Async logic - after the async call: "
      + SecurityContextHolder.getContext().getAuthentication().getPrincipal());

    return SecurityContextHolder.getContext().getAuthentication().getPrincipal();
}
```

我们希望在异步调用**前后**都能看到 **`SecurityContext`** 是否一致。异步方法实现如下：

```java
@Async
@Override
public void asyncCall() {
    log.info("Inside the @Async logic: "
      + SecurityContextHolder.getContext().getAuthentication().getPrincipal());
}
```

异步线程里只有这一行日志，用来观察 **`Authentication`**。

## 4. 默认行为

在默认配置下，**`@Async` 方法内部**拿到的安全上下文往往是**空**的。

也就是说：在**发起调用的线程**上还能打印出 **`Authentication`**；一旦进入 **`@Async`** 方法，**`Authentication`** 可能为 **`null`**。典型日志类似：

```plaintext
web - 2016-12-30 22:41:58,916 [http-nio-8081-exec-3] INFO
  o.baeldung.web.service.AsyncService -
  Outside the @Async logic - before the async call:
  org.springframework.security.core.userdetails.User@76507e51:
  Username: temporary; ...

web - 2016-12-30 22:41:58,921 [http-nio-8081-exec-3] INFO
  o.baeldung.web.service.AsyncService -
  Inside the @Async logic - after the async call:
  org.springframework.security.core.userdetails.User@76507e51:
  Username: temporary; ...

  web - 2016-12-30 22:41:58,926 [SimpleAsyncTaskExecutor-1] ERROR
  o.s.a.i.SimpleAsyncUncaughtExceptionHandler -
  Unexpected error occurred invoking async method
  'public void com.baeldung.web.service.AsyncServiceImpl.asyncCall()'.
  java.lang.NullPointerException: null
```

可见在 **SimpleAsyncTaskExecutor** 线程里，因 **`Authentication`** 为空而触发 **NPE**——这与「异步线程里没有当前用户上下文」的预期一致。

## 5. 配置：委托型异步执行器

若希望异步线程里也能访问与调用线程**相同**的 **`SecurityContext`**，需要注册 **`DelegatingSecurityContextAsyncTaskExecutor`**，把 **`SecurityContext`** 委托给异步 **Executor**：

```java
@Bean
public DelegatingSecurityContextAsyncTaskExecutor taskExecutor(ThreadPoolTaskExecutor delegate) {
    return new DelegatingSecurityContextAsyncTaskExecutor(delegate);
}
```

这样 Spring 会在每次 **`@Async` 调用**时复制当前的 **`SecurityContext`**。

启用后再观察日志，异步线程中应能打印出与 Web 线程一致的 **`User`**：

```plaintext
web - 2016-12-30 22:45:18,013 [http-nio-8081-exec-3] INFO
  o.baeldung.web.service.AsyncService -
  Outside the @Async logic - before the async call:
  org.springframework.security.core.userdetails.User@76507e51:
  Username: temporary; ...

web - 2016-12-30 22:45:18,018 [http-nio-8081-exec-3] INFO
  o.baeldung.web.service.AsyncService -
  Inside the @Async logic - after the async call:
  org.springframework.security.core.userdetails.User@76507e51:
  Username: temporary; ...

web - 2016-12-30 22:45:18,019 [SimpleAsyncTaskExecutor-1] INFO
  o.baeldung.web.service.AsyncService -
  Inside the @Async logic:
  org.springframework.security.core.userdetails.User@76507e51:
  Username: temporary; ...
```

## 6. 典型场景

下列情况常会需要显式传播 **`SecurityContext`**：

- 并行发起多个可能较慢的外部请求；
- 本地计算与外部请求希望**并行**推进；
- 「发后即忘」类任务（例如发邮件），但仍需在异步逻辑中知道**当前用户**。

## 7. 小结

本文说明 Spring Security 如何支持在 **`@Async`** 调用中携带 **`SecurityContext`**；从 API 上看只是多配一个 **`DelegatingSecurityContextAsyncTaskExecutor`**，十分轻量。

请注意：若原先多个方法是**同步串联**、且依赖彼此的返回值，改成异步后往往要重新设计**结果汇总**方式。

示例工程见 [GitHub（spring-security-web-rest 模块）](https://github.com/eugenp/tutorials/tree/master/spring-security-modules/spring-security-web-rest)。

> 本文为学习目的的个人翻译，译文仅供参考。
>
> 原文链接：[Spring Security with Async Principal Propagation](https://www.baeldung.com/spring-security-async-principal-propagation)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
