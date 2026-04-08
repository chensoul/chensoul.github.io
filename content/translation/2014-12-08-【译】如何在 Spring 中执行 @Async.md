---
title: "【译】如何在 Spring 中执行 @Async"
date: 2014-12-08 00:00:00+08:00
draft: false
slug: spring-async
categories: ["translation"]
tags: ["spring-boot", "concurrency"]
description: "在 Spring 中使用@Async 注解实现异步方法执行：配置、返回值处理、线程池和异常处理。"
canonicalURL: "https://www.baeldung.com/spring-async"
---

## 1. 概述

在本教程中，我们将探索 **Spring 中的异步执行支持**和 `@Async` 注解，利用现代 Java 和 Spring 7 实践。

简单来说，**用 `@Async` 注解标注 bean 的方法将在单独的线程中执行它**。换句话说，**调用者不会等待被调用方法完成**，使应用程序更具响应性和效率。

Spring 的一个有趣方面是，框架中的事件支持[**也有异步处理支持**](https://www.baeldung.com/spring-events)（如果需要）。

## 2. 启用异步支持

让我们从**使用 Java 配置启用异步处理**开始。

我们将通过在配置类上添加 `@EnableAsync` 来实现：

```java
@Configuration
@EnableAsync
public class SpringAsyncConfig { ... }
```

虽然 `@EnableAsync` 注解已经足够，但也有一些简单的配置选项：

*   **`annotation`** – 用于检测除 Spring 的 `@Async` 之外的其他用户定义的异步执行注解类型。
*   **`mode`** – 指示要使用的建议类型（基于 JDK 代理或 AspectJ 织入）。
*   **`proxyTargetClass`** – 指示要使用的代理类型（CGLIB 或 JDK）。这仅在 `mode` 设置为 `AdviceMode.PROXY` 时有效。
*   **`order`** – 设置 `AsyncAnnotationBeanPostProcessor` 应用的顺序。默认情况下，它最后运行，以便可以考虑所有现有代理。

请注意，在现代 Spring Boot 4 应用程序中，通常避免使用 XML 配置来启用异步支持，而 favor Java 配置。

## 3. `@Async` 注解

首先，让我们回顾一下 `@Async` 的两个主要限制：

*   它只能应用于 `public` 方法。
*   **自调用**——从同一类内部调用异步方法——不会工作，因为它会绕过拦截调用以异步执行的 Spring 代理。

原因很简单。方法需要是 `public` 才能被代理。**自调用不起作用是因为它绕过了代理并直接调用底层方法。**

### 3.1. `void` 返回类型的方法

这是配置不需要返回值的方法异步运行的简单方式：

```java
@Async
public void asyncMethodWithVoidReturnType() {
    System.out.println("Execute method asynchronously. " 
      + Thread.currentThread().getName());
}
```

由于这是 `void`，我们通常断言调用线程立即继续，但对于简单的集成测试，调用它就足够了：

```java
@Autowired
private AsyncComponent asyncAnnotationExample; 

@Test
public void testAsyncAnnotationForMethodsWithVoidReturnType() {
    asyncAnnotationExample.asyncMethodWithVoidReturnType();
}
```

### 3.2. 有返回类型的方法：使用 `CompletableFuture`

对于有返回类型的方法，Spring 7 和 Spring Boot 4 **强烈推荐使用 [`CompletableFuture`](https://www.baeldung.com/java-completablefuture-runasync-supplyasync)**。此外，较旧的 `AsyncResult` 现在已弃用。

通过返回 `CompletableFuture`，我们获得了强大的组合和链式能力，使异步操作更易于管理：

```java
@Async
public CompletableFuture<String> asyncMethodWithReturnType() {
    System.out.println("Execute method asynchronously - " 
      + Thread.currentThread().getName());
    try {
        Thread.sleep(5000);
        return CompletableFuture.completedFuture("hello world !!!!");
    } catch (InterruptedException e) {
        return CompletableFuture.failedFuture(e);
    }
}
```

现在，让我们调用该方法并使用 `CompletableFuture` 对象检索结果：

```java
@Autowired 
private SimpleAsyncService simpleAsyncService;

@Test
public void testAsyncAnnotationForMethodsWithReturnType()
  throws InterruptedException, ExecutionException {
 
    CompletableFuture<String> future = simpleAsyncService.asyncMethodWithReturnType();
    System.out.println("Invoking an asynchronous method. " 
      + Thread.currentThread().getName());
    
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

### 3.3. 合并两个 `@Async` 服务的响应

此示例演示了**如何使用 `CompletableFuture` 方法合并来自两个独立异步服务调用的结果**。让我们定义两个服务类 `FirstAsyncService` 和 `SecondAsyncService`，带有 `@Async` 注解的方法：

```java
@Async
public CompletableFuture<String> asyncGetData() throws InterruptedException {
    Thread.sleep(4000);
    return CompletableFuture.completedFuture(
        super.getClass().getSimpleName() + " response !!! "
    );
}
```

我们现在实现将用于合并两个 `@Async` 服务的 `CompletableFuture` 响应的主服务：

```java
@Service
public class AsyncService {

    @Autowired
    private FirstAsyncService firstService;
    @Autowired
    private SecondAsyncService secondService;

    public CompletableFuture<String> asyncMergeServicesResponse() throws InterruptedException {
        CompletableFuture<String> firstServiceResponse = firstService.asyncGetData();
        CompletableFuture<String> secondServiceResponse = secondService.asyncGetData();

        return firstServiceResponse.thenCompose(
          firstServiceValue -> secondServiceResponse.thenApply(
            secondServiceValue -> firstServiceValue + secondServiceValue));
    }
}
```

让我们调用上述服务并使用 `CompletableFuture` 对象检索异步服务的结果：

```java
@Autowired
private AsyncService asyncServiceExample;

@Test
public void testAsyncAnnotationForMergedServicesResponse()
  throws InterruptedException, ExecutionException {
    CompletableFuture<String> completableFuture = asyncServiceExample
        .asyncMergeServicesResponse();

    System.out.println("Invoking asynchronous methods. " + Thread.currentThread().getName());

    while (true) {
        if (completableFuture.isDone()) {
            System.out.println("Result from asynchronous process - " + completableFuture.get());
            break;
        }
        System.out.println("Continue doing something else. ");
        Thread.sleep(1000);
    }
}
```

让我们查看集成测试类 `AsyncServiceUnitTest` 的输出，了解合并服务响应：

```
Invoking asynchronous methods. main
Continue doing something else.
Continue doing something else.
Continue doing something else.
Continue doing something else.
Result from asynchronous process - FirstAsyncService response !!! SecondAsyncService response !!!
```

## 4. 执行器

默认情况下，Spring 使用 `SimpleAsyncTaskExecutor` 来实际异步运行这些方法。这对于开发来说没问题；然而，**对于生产环境，我们应该配置适当的 [线程池](https://www.baeldung.com/java-threadpooltaskexecutor-core-vs-max-poolsize)**，如 `ThreadPoolTaskExecutor`，来管理资源消耗。

我们可以在两个级别覆盖默认值：应用程序级别或单个方法级别。

### 4.1. 在方法级别覆盖执行器

我们需要在配置类中将所需的执行器声明为 Spring bean：

```java
@Configuration
@EnableAsync
public class SpringAsyncConfig {
    
    @Bean(name = "threadPoolTaskExecutor")
    public Executor threadPoolTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("CustomPool-");
        executor.initialize();
        return executor;
    }
}
```

然后，我们需要将执行器名称作为 `@Async` 注解的属性提供：

```java
@Async("threadPoolTaskExecutor")
public void asyncMethodWithConfiguredExecutor() {
    System.out.println("Execute method with configured executor - "
      + Thread.currentThread().getName());
}
```

### 4.2. 在应用程序级别覆盖执行器

为此，配置类应该实现 `AsyncConfigurer` 接口。因此，这迫使它实现 `getAsyncExecutor()` 方法，该方法将为应用程序中所有标注了 `@Async` 的方法返回默认执行器（除非在方法级别覆盖）：

```java
@Configuration
@EnableAsync
public class SpringAsyncConfig implements AsyncConfigurer {
   
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.initialize();
        return executor;
    }
    
    // ...
}
```

## 5. 异常处理

当方法返回 `CompletableFuture` 时，异常处理很简单。异步方法内部抛出的异常将导致 `CompletableFuture` 异常完成，任何后续的 `then…` 阶段将处理它，或者调用 `future.get()` 将抛出包装的异常（`ExecutionException`）。

然而，**如果方法返回类型是 `void`，异常不会传播回调用线程**。对于这种情况，**我们必须注册自定义处理器**。

让我们通过实现 `AsyncUncaughtExceptionHandler` 创建自定义异步异常处理器：

```java
public class CustomAsyncExceptionHandler
  implements AsyncUncaughtExceptionHandler {

    @Override
    public void handleUncaughtException(Throwable throwable, Method method, Object... obj) {
        System.err.println("Async Exception Detected!");
        System.err.println("Exception message - " + throwable.getMessage());
        System.err.println("Method name - " + method.getName());
        for (Object param : obj) {
            System.err.println("Parameter value - " + param);
        }
    }
}
```

最后，让我们通过在 `AsyncConfigurer` 实现中覆盖 `getAsyncUncaughtExceptionHandler()` 方法来注册此处理器：

```java
@Configuration
@EnableAsync
public class SpringAsyncConfig implements AsyncConfigurer {
    // ... getAsyncExecutor() implementation ...

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new CustomAsyncExceptionHandler();
    }
}
```

让我们查看集成测试类 `AsyncAnnotationExampleIntegrationTest` 的输出：

```
Invoking an asynchronous method. main
Continue doing something else.
Execute method asynchronously - DefaultAsync-1
Continue doing something else.
Continue doing something else.
Continue doing something else.
Continue doing something else.
Result from asynchronous process - hello world !!!!
Execute method with configured executor - CustomPool-1
Execute method asynchronously. DefaultAsync-2
Async Exception Detected!
Exception message - Throw message from asynchronous method.
Method name - asyncMethodWithExceptions
```

## 6. 总结

在本文中，我们了解了**在 Spring 7 和 Spring Boot 4 中运行异步代码**。

我们采用了现代方法，对返回类型使用 `CompletableFuture`，并了解了使用 `@EnableAsync` 和 `AsyncConfigurer` 的核心配置，以及自定义执行器和异常处理策略。

> 本文为学习目的的个人翻译，译文仅供参考。
>
> 原文链接：[How To Do @Async in Spring](https://www.baeldung.com/spring-async)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
