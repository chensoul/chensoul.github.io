---
title: "【译】Spring Events"
date: 2014-11-10 21:59:00+08:00
draft: false
slug: spring-events
categories: ["translation"]
tags: ["spring-boot"]
description: "Spring 中的事件机制：自定义事件、异步处理、@EventListener 注解、泛型支持和事务绑定事件。"
canonicalURL: "https://www.baeldung.com/spring-events"
---

## 1. 概述

本教程将讨论**如何在 Spring 中使用事件**。

事件是框架中最容易被忽视的功能之一，尽管它们也是最实用的功能之一。与 Spring 中的许多其他功能一样，事件发布是由 `ApplicationContext` 提供的功能之一。

有几条简单的指导原则需要遵循：

*   如果在 Spring Framework 4.2 之前的版本中使用，事件类应该继承 `ApplicationEvent`。[从 4.2 版本开始](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/ApplicationEventPublisher.html#publishEvent-java.lang.Object-)，事件类不再需要继承 `ApplicationEvent` 类。
*   发布者应该注入一个 `ApplicationEventPublisher` 对象。
*   监听器应该实现 `ApplicationListener` 接口。

## 2. 自定义事件

Spring 允许我们创建和发布自定义事件，默认情况下**这些事件是同步的**。这有一些优点，例如监听器能够参与到发布者的事务上下文中。

### 2.1. 一个简单的应用事件

让我们**创建一个简单的事件类**——只是一个占位符来存储事件数据。

在本例中，事件类包含一个 String 消息：

```java
public class CustomSpringEvent extends ApplicationEvent {
    private String message;

    public CustomSpringEvent(Object source, String message) {
        super(source);
        this.message = message;
    }
    public String getMessage() {
        return message;
    }
}
```

### 2.2. 发布者

现在让我们**创建该事件的发布者**。发布者构建事件对象并将其发布给任何监听者。

要发布事件，发布者可以简单地注入 `ApplicationEventPublisher` 并使用 `publishEvent()` API：

```java
@Component
public class CustomSpringEventPublisher {
    @Autowired
    private ApplicationEventPublisher applicationEventPublisher;

    public void publishCustomEvent(final String message) {
        System.out.println("Publishing custom event. ");
        CustomSpringEvent customSpringEvent = new CustomSpringEvent(this, message);
        applicationEventPublisher.publishEvent(customSpringEvent);
    }
}
```

或者，发布者类可以实现 `ApplicationEventPublisherAware` 接口，这也会在应用程序启动时注入事件发布者。通常，直接使用 `@Autowire` 注入发布者更简单。

从 Spring Framework 4.2 开始，`ApplicationEventPublisher` 接口为 [`publishEvent(Object event)`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/ApplicationEventPublisher.html#publishEvent-java.lang.Object-) 方法提供了一个新的重载，可以接受任何对象作为事件。**因此，Spring 事件不再需要继承 `ApplicationEvent` 类。**

### 2.3. 监听器

最后，让我们创建监听器。

监听器的唯一要求是成为一个 bean 并实现 `ApplicationListener` 接口：

```java
@Component
public class CustomSpringEventListener implements ApplicationListener<CustomSpringEvent> {
    @Override
    public void onApplicationEvent(CustomSpringEvent event) {
        System.out.println("Received spring custom event - " + event.getMessage());
    }
}
```

注意我们的自定义监听器是如何用自定义事件的泛型类型参数化的，这使得 `onApplicationEvent()` 方法是类型安全的。这也避免了检查对象是否是特定事件类的实例并进行强制转换。

正如已经讨论过的（默认情况下**Spring 事件是同步的**），`publishCustomEvent()` 方法会阻塞直到所有监听器完成事件处理。

## 3. 创建异步事件

在某些情况下，同步发布事件并不是我们真正想要的——**我们可能需要异步处理事件。**

### 3.1. 使用 `ApplicationEventMulticaster`

我们可以通过创建一个带有执行器的 `ApplicationEventMulticaster` bean 来在配置中开启异步事件处理。

出于我们的目的，`SimpleAsyncTaskExecutor` 可以很好地工作：

```java
@Configuration
public class AsynchronousSpringEventsConfig {
    @Bean(name = "applicationEventMulticaster")
    public ApplicationEventMulticaster simpleApplicationEventMulticaster() {
        SimpleApplicationEventMulticaster eventMulticaster =
          new SimpleApplicationEventMulticaster();
        
        eventMulticaster.setTaskExecutor(new SimpleAsyncTaskExecutor());
        return eventMulticaster;
    }
}
```

事件、发布者和监听器的实现与之前相同，但现在**监听器将在单独的线程中异步处理事件**。

然而，有些时候我们无法使用 multicaster，或者更愿意让某些事件异步运行而不是其他事件。

### 3.2. 使用 `@Async`

为此，我们可以添加 Spring 的 `@Async` 注解来识别和标注应该异步处理事件的单个监听器：

```java
@EventListener
@Async
public void handleAsyncEvent(CustomSpringEvent event) {
    System.out.println("Handle event asynchronously: " + event.getMessage());
}
```

这会在单独的线程中处理事件。此外，我们可以使用 `@Async` 注解的 `value` 属性来指示应该使用除默认值之外的执行器，例如：

```java
@Async("nonDefaultExecutor")
void handleAsyncEvent(CustomSpringEvent event) {
    // 由 "nonDefaultExecutor" 异步运行
}
```

要启用对 `@Async` 注解的支持，我们可以在 `@Configuration` 或 `@SpringBootApplication` 类上添加 [`@EnableAsync`](https://www.baeldung.com/spring-async)：

```java
@Configuration
@EnableAsync
public class AppConfig {
}
```

`@EnableAsync` 注解开启了 Spring 在后台线程池中运行 `@Async` 方法的能力。它还自定义了使用的 `Executor`。Spring 会搜索关联的线程池定义。它会查找：

*   上下文中的唯一 `TaskExecutor` bean，或
*   名为 `"taskExecutor"` 的 `Executor` bean

如果都找不到，将使用 `SimpleAsyncTaskExecutor` 来异步调用事件监听器。

## 4. 现有的框架事件

Spring 本身会发布各种各样的事件。例如，`ApplicationContext` 会触发各种框架事件：`ContextRefreshedEvent`、`ContextStartedEvent`、`RequestHandledEvent` 等。

这些事件为应用程序开发人员提供了一个选项，可以钩入应用程序和上下文的生命周期，并在需要的地方添加自己的自定义逻辑。

这是一个监听器监听上下文刷新的快速示例：

```java
public class ContextRefreshedListener 
  implements ApplicationListener<ContextRefreshedEvent> {
    @Override
    public void onApplicationEvent(ContextRefreshedEvent cse) {
        System.out.println("Handling context re-freshed event. ");
    }
}
```

要了解更多关于现有框架事件的信息，请查看[我们的下一篇教程](https://www.baeldung.com/spring-context-events)。

## 5. 注解驱动的事件监听器

从 Spring 4.2 开始，事件监听器不需要是实现 `ApplicationListener` 接口的 bean——它可以通过 `@EventListener` 注解注册在托管 bean 的任何 `public` 方法上：

```java
@Component
public class AnnotationDrivenEventListener {
    @EventListener
    public void handleContextStart(ContextStartedEvent cse) {
        System.out.println("Handling context started event.");
    }
}
```

如前所述，方法签名声明了它消费的事件类型。

默认情况下，监听器是同步调用的。然而，我们可以通过添加 `@Async` 注解轻松地使其异步。我们只需要记住在应用程序中[`启用 Async 支持`](https://www.baeldung.com/spring-async#enable-async-support)。

## 6. 泛型支持

也可以在事件类型中使用泛型信息来分发事件。

### 6.1. 一个泛型应用事件

**让我们创建一个泛型事件类型。**

在我们的示例中，事件类包含任何内容和一个 `success` 状态指示器：

```java
public class GenericSpringEvent<T> {
    private T what;
    protected boolean success;

    public GenericSpringEvent(T what, boolean success) {
        this.what = what;
        this.success = success;
    }
    // ... 标准 getters
}
```

注意 `GenericSpringEvent` 和 `CustomSpringEvent` 之间的区别。我们现在有了发布任何任意事件的灵活性，不再需要继承 `ApplicationEvent`。

### 6.2. 一个监听器

现在让我们**创建该事件的监听器**。

我们可以像以前一样通过实现 `ApplicationListener` 接口来定义监听器：

```java
@Component
public class GenericSpringEventListener 
  implements ApplicationListener<GenericSpringEvent<String>> {
    @Override
    public void onApplicationEvent(@NonNull GenericSpringEvent<String> event) {
        System.out.println("Received spring generic event - " + event.getWhat());
    }
}
```

但这个定义不幸地要求我们让 `GenericSpringEvent` 继承 `ApplicationEvent` 类。所以在本教程中，让我们使用前面讨论过的注解驱动事件监听器。

也可以通过在 `@EventListener` 注解上定义一个布尔 SpEL 表达式来**使事件监听器有条件地执行**。

在这种情况下，事件处理器将只为成功的 `String` 类型 `GenericSpringEvent` 调用：

```java
@Component
public class AnnotationDrivenEventListener {
    @EventListener(condition = "#event.success")
    public void handleSuccessful(GenericSpringEvent<String> event) {
        System.out.println("Handling generic event (conditional).");
    }
}
```

[Spring Expression Language (SpEL)](https://www.baeldung.com/spring-expression-language) 是一个强大的表达式语言，在另一个教程中有详细介绍。

### 6.3. 一个发布者

事件发布者与上面描述的类似。但是由于类型擦除，我们需要发布一个解析泛型参数的事件，例如 `class GenericStringSpringEvent extends GenericSpringEvent<String>`。

另外，**还有一种发布事件的替代方法**。如果我们从用 `@EventListener` 注解的方法返回一个非空值作为结果，Spring Framework 会将该结果作为新事件发送给我们。此外，我们可以通过在事件处理的结果中以集合形式返回多个新事件来发布它们。

## 7. 事务绑定事件

本节是关于使用 `@TransactionalEventListener` 注解的。要了解更多关于事务管理的信息，请查看[使用 Spring 和 JPA 的事务配置](https://www.baeldung.com/transaction-configuration-with-jpa-and-spring)。

从 Spring 4.2 开始，框架提供了一个新的 `@TransactionalEventListener` 注解，这是 `@EventListener` 的扩展，允许将事件的监听器绑定到事务的一个阶段。

可以绑定到四个事务阶段之一：

*   `AFTER_COMMIT`（默认）——用于在事务**成功完成**时触发事件
*   `AFTER_ROLLBACK`——如果事务**回滚**
*   `AFTER_COMPLETION`——如果事务**完成**（`AFTER_COMMIT` 和 `AFTER_ROLLBACK` 的别名）
*   `BEFORE_COMMIT`——用于在事务**提交之前**触发事件

默认情况下，只有当 `CustomSpringEvent` 在现已完成的事务中发布时，才会调用此监听器：

```java
@TransactionalEventListener
public void handleCustom(CustomSpringEvent event) {
    System.out.println("Handling event only when a transaction successfully completes.");
}
```

重要的是要理解，**与普通的 `@EventListener` 方法不同，`@TransactionalEventListener` 不会通过 `ApplicationEventMulticaster` 分发事件处理。** 相反，`@TransactionalEventListener` 通过 [`TransactionSynchronizationManager#registerSynchronization`](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/transaction/support/TransactionSynchronizationManager.html#registerSynchronization(org.springframework.transaction.support.TransactionSynchronization)) 注册一个事务同步回调，允许在指定的事务阶段处理事件。

因此，**默认情况下，`@TransactionalEventListener` 方法在与发布事件相同的线程中执行**，无论在 multicaster 中应用了哪个 `TaskExecutor`，因为 multicaster 根本没有被使用。

这引出了一个常见的问题：我们如何让 `@TransactionalEventListener` 异步处理事件？

答案是使用 `@Async` 注解，例如：

```java
@Async
@TransactionalEventListener
void handleCustom(CustomSpringEvent event) { 
    System.out.println("Handling event only when a transaction successfully completes.");
}
```

在上面的示例中，我们结合了 `@Async` 和 `@TransactionalEventListener` 注解。这样，**当原始事务成功完成时，`handleCustom()` 方法将在单独的线程中异步运行**。

虽然这是一种方便地异步处理事务事件的方式，但重要的是要谨慎使用它。**Spring 将事务绑定到当前线程**。当监听器在单独的线程中运行时（由于 `@Async`），它无法访问原始事务上下文。这意味着**如果我们的事件处理器依赖于原始事务的上下文**，例如延迟加载的实体、共享的数据库状态或事务回滚逻辑，**我们不应该使用 `@Async + @TransactionalEventListener`**。

当然，当我们使用 `@Async` 时，让我们记住添加 `@EnableAsync` 支持。

## 8. 总结

在这篇简短的文章中，我们介绍了**处理 Spring 事件**的基础知识，包括创建一个简单的自定义事件，发布它然后在监听器中处理它。我们还简要了解了如何在配置中启用事件的异步处理。

然后我们了解了 Spring 4.2 中引入的改进，例如注解驱动的监听器、更好的泛型支持以及绑定到事务阶段的事件。

> 本文为学习目的的个人翻译，译文仅供参考。
>
> 原文链接：[Spring Events](https://www.baeldung.com/spring-events)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
