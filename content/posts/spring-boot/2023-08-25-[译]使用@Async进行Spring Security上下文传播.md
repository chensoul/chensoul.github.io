---
title: "[译]使用@Async进行Spring Security上下文传播"
date: 2023-08-25
type: post
slug: spring-security-async-principal-propagation
categories: ["spring-boot"]
tags: [spring-security]
---

## 1. 简介

在本教程中，我们将重点关注使用 `@Async` 传播 Spring Security 主体
默认情况下，Spring Security 身份验证绑定到 `ThreadLocal` - 因此，当执行流在带有 `@Async` 的新线程中运行时，它不会是经过身份验证的上下文。

这并不理想——让我们解决它。

## 2.Maven 依赖

为了在 Spring Security 中使用异步集成，我们需要在 pom.xml 的依赖项中包含以下部分：

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-config</artifactId>
    <version>5.7.3</version>
</dependency>
```

可以在[此处](https://search.maven.org/classic/#search|ga|1|g%3A%22org.springframework.security%22)找到最新版本的 Spring Security 依赖项。

## 3.使用@Async 进行 Spring Security 传播

我们先写一个简单的例子：

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

我们想要检查 Spring `SecurityContext` 是否传播到新线程。首先，我们在异步调用之前记录上下文，接下来我们运行异步方法，最后再次记录上下文。` asyncCall()` 方法具有以下实现：

```java
@Async
@Override
public void asyncCall() {
    log.info("Inside the @Async logic: "
      + SecurityContextHolder.getContext().getAuthentication().getPrincipal());
}
```

正如我们所看到的，只有一行代码将输出异步方法的新线程内的上下文。

## 4. 默认配置

默认情况下，`@Async` 方法内的安全上下文将具有空值。

特别是，如果我们运行异步逻辑，我们将能够在主程序中记录 `Authentication` 对象，但是当我们将其记录在 `@Async` 中时，它将为 null。这是日志输出的示例：

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

因此，正如您所看到的，在执行程序线程内，我们的调用失败并出现 NPE，正如预期的那样——因为主体在那里不可用。

## 5. 异步安全上下文配置

如果我们想要访问异步线程内部的主体，就像我们可以在外部访问它一样，我们需要创建 `DelegatingSecurityContextAsyncTaskExecutor` bean：

```java
@Bean
public DelegatingSecurityContextAsyncTaskExecutor taskExecutor(ThreadPoolTaskExecutor delegate) {
    return new DelegatingSecurityContextAsyncTaskExecutor(delegate);
}
```

通过这样做，Spring 将在每个 `@Async` 调用中使用当前的 `SecurityContext`。

现在，让我们再次运行该应用程序并查看日志信息以确保情况确实如此：

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

正如我们所期望的，我们在异步执行器线程中看到了相同的原理。

## 6. 使用案例

有一些有趣的用例，我们可能希望确保 `SecurityContext` 像这样传播：

- 我们想要发出多个可以并行运行并且可能需要大量时间来执行的外部请求
- 我们需要在本地进行一些重要的处理，并且我们的外部请求可以与该处理并行执行
- 其他代表即发即忘场景，例如发送电子邮件

## 7.结论

在本快速教程中，我们介绍了 Spring 对使用传播的 `SecurityContext` 发送异步请求的支持。从编程模型的角度来看，新功能看似简单。

请注意，如果先前以同步方式将多个方法调用链接在一起，则转换为异步方法可能需要同步结果。

此 [示例](https://github.com/eugenp/tutorials/tree/master/spring-security-modules/spring-security-web-rest) 也可作为 Github 上的 Maven 项目提供。

原文链接：[https://www.baeldung.com/spring-security-async-principal-propagation](https://www.baeldung.com/spring-security-async-principal-propagation)
