---
title: "【译】如何在Spring中执行@Async"
date: 2014-12-08 00:37:00+08:00
draft: true
slug: spring-async
categories: [ "translation" ]
tags: [ "spring", "async" ]
description: "Spring 中启用 @EnableAsync、使用 @Async 与自定义 Executor，以及异步 void 方法的异常处理。"
---

## 1. 概述

本教程介绍 Spring 对**异步执行**的支持，以及 **`@Async`** 注解的用法。

概括地说：给 bean 的方法加上 `@Async` 后，该方法会在**独立线程**中执行；**调用方不会阻塞**等待被调方法结束。

顺便一提：Spring 的**事件**机制也可以按需要做**异步**处理，参见 [Spring Events](https://www.baeldung.com/spring-events)。

## 2. 启用异步支持

先用 **Java 配置**打开异步：在配置类上添加 `@EnableAsync`：

```java
@Configuration
@EnableAsync
public class SpringAsyncConfig { ... }
```

仅加 `@EnableAsync` 往往即可；该注解还支持若干属性：

- **`annotation`**：默认会识别 Spring 的 `@Async` 以及 EJB 3.1 的 `javax.ejb.Asynchronous`；也可用来指定其它自定义注解类型。
- **`mode`**：通知（advice）的实现方式——基于 **JDK 动态代理**，或 **AspectJ 织入（weaving）**。
- **`proxyTargetClass`**：使用 **CGLIB** 还是 **JDK** 代理；仅在 `mode` 为 `AdviceMode.PROXY` 时生效。
- **`order`**：`AsyncAnnotationBeanPostProcessor` 的排序；默认靠后，以便兼顾已有代理。

也可用 **XML 任务命名空间**启用异步，例如：

```xml
<task:executor id="myexecutor" pool-size="5"  />
<task:annotation-driven executor="myexecutor"/>
```

## 3. `@Async` 注解

先记住两条限制：

- 只能标注在 **public** 方法上。
- **同类自调用**（绕过代理直接调）**不会**异步——因为 `@Async` 依赖代理生效。

### 3.1. 返回 `void` 的方法

将返回类型为 `void` 的方法声明为异步的最简形式：

```java
@Async
public void asyncMethodWithVoidReturnType() {
    System.out.println("Execute method asynchronously. "
      + Thread.currentThread().getName());
}
```

### 3.2. 带返回值的方法

若方法有返回值，可将结果包装在 **`Future`** 中，由 **`@Async`** 方法返回：

```java
@Async
public Future<String> asyncMethodWithReturnType() {
    System.out.println("Execute method asynchronously - "
      + Thread.currentThread().getName());
    try {
        Thread.sleep(5000);
        return new AsyncResult<String>("hello world !!!!");
    } catch (InterruptedException e) {
        //
    }

    return null;
}
```

Spring 提供 **`AsyncResult`** 作为 `Future` 的一种简单实现，便于传递异步执行结果。

下面演示如何调用上述方法并通过 `Future` 取回结果：

```java
public void testAsyncAnnotationForMethodsWithReturnType()
  throws InterruptedException, ExecutionException {
    System.out.println("Invoking an asynchronous method. "
      + Thread.currentThread().getName());
    Future<String> future = asyncAnnotationExample.asyncMethodWithReturnType();

    while (true) {
        if (future.isDone()) {
            System.out.println("Result from asynchronous process - " + future.get());
            break;
        }
        System.out.println("Continue doing something else. ");
        Thread.sleep(1000);
    }
}
```

## 4. `Executor`

默认情况下，Spring 使用 **`SimpleAsyncTaskExecutor`** 执行 `@Async` 方法。你可以在**方法级**或**应用级**覆盖默认 **Executor**。

### 4.1. 方法级指定 Executor

先在配置类里声明要用的 **Executor** bean：

```java
@Configuration
@EnableAsync
public class SpringAsyncConfig {

    @Bean(name = "threadPoolTaskExecutor")
    public Executor threadPoolTaskExecutor() {
        return new ThreadPoolTaskExecutor();
    }
}
```

再在 `@Async` 上写出 **bean 名称**：

```java
@Async("threadPoolTaskExecutor")
public void asyncMethodWithConfiguredExecutor() {
    System.out.println("Execute method with configured executor - "
      + Thread.currentThread().getName());
}
```

### 4.2. 应用级默认 Executor

让配置类实现 **`AsyncConfigurer`**，并实现 **`getAsyncExecutor()`**，返回的 **Executor** 即作为全局默认，用于所有带 `@Async` 的方法：

```java
@Configuration
@EnableAsync
public class SpringAsyncConfig implements AsyncConfigurer {
   @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
        threadPoolTaskExecutor.initialize();
        return threadPoolTaskExecutor;
    }
}
```

## 5. 异常处理

当返回类型是 **`Future`** 时，异常会在 **`Future.get()`** 时抛出，较易处理。

若返回 **`void`**，异常**不会**冒泡回调用线程，需要额外配置。

实现 **`AsyncUncaughtExceptionHandler`**，在异步方法出现**未捕获异常**时回调 **`handleUncaughtException`**：

```java
public class CustomAsyncExceptionHandler
  implements AsyncUncaughtExceptionHandler {

    @Override
    public void handleUncaughtException(
      Throwable throwable, Method method, Object... obj) {

        System.out.println("Exception message - " + throwable.getMessage());
        System.out.println("Method name - " + method.getName());
        for (Object param : obj) {
            System.out.println("Parameter value - " + param);
        }
    }

}
```

若配置类已实现 **`AsyncConfigurer`**，还需 **`getAsyncUncaughtExceptionHandler()`** 返回上述处理器：

```java
@Override
public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
    return new CustomAsyncExceptionHandler();
}
```

## 6. 小结

本文演示了如何用 Spring 运行异步代码：从 **`@EnableAsync` / `@Async`** 的基础配置，到自定义 **Executor** 与 **`void` 异步方法的异常处理**。

完整示例见 [GitHub（spring-scheduling）](https://github.com/eugenp/tutorials/tree/master/spring-scheduling)。

> 本文为学习目的的个人翻译，译文仅供参考。
>
> 原文链接：[How to Run an Async Task With Spring](https://www.baeldung.com/spring-async)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
