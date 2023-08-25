---
title: "[译]如何在Spring中执行@Async"
date: 2023-08-25T07:00:00+08:00
slug: spring-async
categories: ["Notes"]
tags: [java,spring,async]
---

## **1. 概述**

在本教程中，我们将探讨 Spring 中的异步执行支持和 `@Async` 注解。

简单地说，用 `@Async` 注解 bean 的方法将使其在单独的线程中执行。换句话说，调用者不会等待被调用方法的完成。

Spring 的一个有趣的方面是，框架中的事件支持还 [支持异步处理](https://www.baeldung.com/spring-events)（如果需要）。

## 2.启用异步支持

让我们首先通过 Java 注解启用异步处理。


我们将通过将 `@EnableAsync` 添加到配置类来完成此操作：

```java
@Configuration
@EnableAsync
public class SpringAsyncConfig { ... }
```


启用注解就足够了。但也有一些简单的配置选项：

- **annotation** 默认情况下，`@EnableAsync` 检测 Spring 的 `@Async` 注解和 EJB 3.1 `javax.ejb.Asynchronous`。我们也可以使用此选项来检测其他用户定义的注解类型。
- **mode ** 指示应使用的建议类型 - 基于 `JDK` 代理或 `AspectJ` 编织。
- ***proxyTargetClass*** 指示应使用的代理类型 — `CGLIB` 或 `JDK`。仅当模式设置为 `AdviceMode.PROXY` 时，此属性才有效。
- ***order*** 设置应用 `AsyncAnnotationBeanPostProcessor` 的顺序。默认情况下，它最后运行，以便它可以考虑所有现有代理。


我们还可以使用任务命名空间通过 XML 配置启用异步处理：

```xml
<task:executor id="myexecutor" pool-size="5"  />
<task:annotation-driven executor="myexecutor"/>Copy
```

## 3.@Async注解


首先，让我们回顾一下规则。 `@Async` 有两个限制：

- 它必须仅应用于公共方法。
- 自调用（从同一个类中调用异步方法）将不起作用。


原因很简单：该方法需要公开，以便可以被代理。并且自调用不起作用，因为它绕过代理并直接调用底层方法。

### 3.1.返回类型为 void 的方法


这是配置具有 void 返回类型的方法以异步运行的简单方法：

```java
@Async
public void asyncMethodWithVoidReturnType() {
    System.out.println("Execute method asynchronously. " 
      + Thread.currentThread().getName());
}
```

### 3.2.具有返回类型的方法


我们还可以通过将实际返回包装在 `Future` 中来将 `@Async` 应用于具有返回类型的方法：

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


Spring还提供了一个实现`Future`的`AsyncResult`类。我们可以用它来跟踪异步方法执行的结果。


现在让我们调用上述方法并使用 `Future` 对象检索异步过程的结果。

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

## 4. Executor


默认情况下，Spring 使用 `SimpleAsyncTaskExecutor` 来实际异步运行这些方法。但我们可以在两个级别覆盖默认值：应用程序级别或单个方法级别。

### 4.1.在方法级别重写Executor

我们需要在配置类中声明所需的执行器：

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


然后我们应该在 `@Async` 中提供执行程序名称作为属性：

```java
@Async("threadPoolTaskExecutor")
public void asyncMethodWithConfiguredExecutor() {
    System.out.println("Execute method with configured executor - "
      + Thread.currentThread().getName());
}
```

### 4.2.在应用程序级别覆盖Executor


配置类应实现 `AsyncConfigurer` 接口。因此，它必须实现 `getAsyncExecutor()` 方法。在这里，我们将返回整个应用程序的执行器。现在，它成为运行用 `@Async` 注解的方法的默认执行器：

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


当方法返回类型是 `Future` 时，异常处理很容易。 `Future.get()` 方法将抛出异常。


但如果返回类型为 void，异常将不会传播到调用线程。因此，我们需要添加额外的配置来处理异常。


我们将通过实现 `AsyncUncaughtExceptionHandler` 接口来创建自定义异步异常处理程序。当存在任何未捕获的异步异常时，将调用 `handleUncaughtException()` 方法：

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


在上一节中，我们了解了配置类实现的 `AsyncConfigurer` 接口。作为其中的一部分，我们还需要重写 `getAsyncUncaughtExceptionHandler() ` 方法以返回我们的自定义异步异常处理程序：

```java
@Override
public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
    return new CustomAsyncExceptionHandler();
}
```

## 6. 结论


在本文中，我们研究了使用 Spring 运行异步代码。


我们从非常基本的配置和注解开始，以使其正常工作。但我们也研究了更高级的配置，例如提供我们自己的执行器或异常处理策略。


与往常一样，本文中提供的完整代码可以在 [GitHub](https://github.com/eugenp/tutorials/tree/master/spring-scheduling) 上找到。



原文链接：[https://www.baeldung.com/spring-async](https://www.baeldung.com/spring-async)
