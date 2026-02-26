---
title: "[译]Spring Events"
date: 2023-08-25 08:00:00+08:00
slug: spring-events
categories: [ "translation" ]
tags: ['spring-boot']
---

## 1. 概述

在本教程中，我们将讨论如何在 Spring 中使用事件。

事件是框架中最容易被忽视的功能之一，但也是最有用的功能之一。与 Spring 中的许多其他功能一样，事件发布是 `ApplicationContext` 提供的功能之一。

有一些简单的准则需要遵循：

- 如果我们使用 Spring Framework 4.2 之前的版本，事件类应该扩展 `ApplicationEvent`。从 4.2 版本开始，事件类不再需要扩展 ApplicationEvent 类。
- 发布者应该注入一个 `ApplicationEventPublisher` 对象。
- 监听器应该实现 `ApplicationListener` 接口。

## 2. 自定义事件

Spring 允许我们创建和发布默认情况下同步的自定义事件。这有一些优点，例如侦听器能够参与发布者的事务上下文。

### 2.1.一个简单的应用程序事件

让我们创建一个简单的事件类——只是一个存储事件数据的占位符。

在本例中，事件类保存一条字符串消息：

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

### 2.2.发布者

现在让我们创建该事件的发布者。发布者构造事件对象并将其发布给正在侦听的任何人。

要发布事件，发布者只需注入 `ApplicationEventPublisher` 并使用 `publishEvent() `API：

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

或者，发布者类可以实现 `ApplicationEventPublisherAware` 接口，这也将在应用程序启动时注入事件发布者。通常，使用 `@Autowire` 注入发布者会更简单。

从 Spring Framework 4.2 开始，`ApplicationEventPublisher` 接口为`publishEvent(Object event) `方法提供了新的重载，该方法接受任何对象作为事件。因此，Spring 事件不再需要扩展`ApplicationEvent` 类。

### 2.3.监听者

最后，让我们创建监听器。

监听器的唯一要求是是一个 bean 并实现 `ApplicationListener` 接口：

```java
@Component
public class CustomSpringEventListener implements ApplicationListener<CustomSpringEvent> {
    @Override
    public void onApplicationEvent(CustomSpringEvent event) {
        System.out.println("Received spring custom event - " + event.getMessage());
    }
}
```

请注意我们的自定义侦听器如何使用自定义事件的通用类型进行参数化，这使得 `onApplicationEvent() `方法类型安全。这也避免了必须检查对象是否是特定事件类的实例并转换它。

而且，正如已经讨论过的（默认情况下 Spring 事件是同步的）， `doStuffAndPublishAnEvent()` 方法会阻塞，直到所有侦听器完成对事件的处理。

## 3. 创建异步事件

在某些情况下，同步发布事件并不是我们真正想要的——我们可能需要异步处理事件。

我们可以通过创建带有执行器的 `ApplicationEventMulticaster` bean 在配置中打开它。

出于我们的目的，`SimpleAsyncTaskExecutor` 效果很好：

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

事件、发布者和侦听器实现与以前相同，但现在侦听器将在单独的线程中异步处理事件。

## 4.现有框架事件

Spring 本身发布了各种开箱即用的事件。例如，`ApplicationContext` 将触发各种框架事件：`ContextRefreshedEvent`、`ContextStartedEvent`、`RequestHandledEvent` 等。

这些事件为应用程序开发人员提供了一个选项，可以挂钩应用程序和上下文的生命周期，并在需要时添加自己的自定义逻辑。

下面是侦听器侦听上下文刷新的简单示例：

```java
public class ContextRefreshedListener
  implements ApplicationListener<ContextRefreshedEvent> {
    @Override
    public void onApplicationEvent(ContextRefreshedEvent cse) {
        System.out.println("Handling context re-freshed event. ");
    }
}
```

## 5. 注解驱动的事件监听器

从 Spring 4.2 开始，事件侦听器不需要是实现 `ApplicationListener` 接口的 bean — 它可以通过 `@EventListener` 注释在托管 bean 的任何公共方法上注册：

```java
@Component
public class AnnotationDrivenEventListener {
    @EventListener
    public void handleContextStart(ContextStartedEvent cse) {
        System.out.println("Handling context started event.");
    }
}
```

和以前一样，方法签名声明它消耗的事件类型。

默认情况下，监听器是同步调用的。但是，我们可以通过添加 @Async 注解轻松使其异步。我们只需要记住在应用程序中启用异步支持即可。

## 6. 泛型支持

还可以使用事件类型中的泛型信息来调度事件。

### 6.1.通用应用程序事件

让我们创建一个通用事件类型。

在我们的示例中，事件类包含任何内容和成功状态指示器：

```java
public class GenericSpringEvent<T> {
    private T what;
    protected boolean success;

    public GenericSpringEvent(T what, boolean success) {
        this.what = what;
        this.success = success;
    }
    / ... standard getters
}
```

请注意 `GenericSpringEvent` 和 `CustomSpringEvent` 之间的区别。我们现在可以灵活地发布任何任意事件，并且不再需要从 `ApplicationEvent` 进行扩展。

### 6.2.监听者

现在让我们创建该事件的侦听器。

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

但不幸的是这个定义要求我们从 `ApplicationEvent` 类继承 `GenericSpringEvent`。因此，在本教程中，我们将使用前面讨论的注释驱动事件侦听器。

还可以通过在 `@EventListener` 注释上定义布尔 SpEL 表达式来使事件侦听器成为有条件的。

在这种情况下，只有成功的 String `GenericSpringEvent` 才会调用事件处理程序：

```java
@Component
public class AnnotationDrivenEventListener {
    @EventListener(condition = "#event.success")
    public void handleSuccessful(GenericSpringEvent<String> event) {
        System.out.println("Handling generic event (conditional).");
    }
}
```

Spring 表达式语言 (SpEL) 是一种功能强大的表达式语言，在另一个教程中详细介绍了它。

### 6.3.发布者

事件发布者与上面描述的类似。但由于类型擦除，我们需要发布一个事件来解析我们要过滤的泛型参数，例如，`class GenericStringSpringEvent extends GenericSpringEvent`。

此外，还有另一种发布事件的方式。如果我们从使用 `@EventListener` 注释的方法返回一个非空值作为结果，Spring Framework 会将该结果作为新事件发送给我们。此外，我们可以通过将多个新事件作为事件处理的结果返回到集合中来发布它们。

## 7. 交易绑定事件

本节介绍如何使用 `@TransactionalEventListener` 注释。要了解有关事务管理的更多信息，请查看 [Transactions With Spring and JPA](https://www.baeldung.com/transaction-configuration-with-jpa-and-spring)。

从 Spring 4.2 开始，框架提供了一个新的 `@TransactionalEventListener` 注解，它是`@EventListener` 的扩展，允许将事件的监听器绑定到事务的某个阶段。

可以对以下交易阶段进行绑定：

- _`AFTER_COMMIT`_（默认）用于在事务成功完成时触发该事件。
- _`AFTER_ROLLBACK`_ – 如果事务已回滚
- _`AFTER_COMPLETION`_ – 如果事务已完成（`AFTER_COMMIT` 和 `AFTER_ROLLBACK` 的别名）
- _`BEFORE_COMMIT`_ – 用于在事务提交之前触发该事件。

这是事务事件侦听器的一个简单示例：

```java
@TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
public void handleCustom(CustomSpringEvent event) {
    System.out.println("Handling event inside a transaction BEFORE COMMIT.");
}
```

仅当事件生成器正在运行且即将提交的事务中时，才会调用此侦听器。

如果没有事务正在运行，则根本不会发送事件，除非我们通过将 `FallbackExecution` 属性设置为 true 来覆盖它。

## 8. 结论

在这篇简短的文章中，我们回顾了在 Spring 中处理事件的基础知识，包括创建一个简单的自定义事件、发布它，然后在侦听器中处理它。

我们还简要了解了如何在配置中启用事件的异步处理。

然后我们了解了 Spring 4.2 中引入的改进，例如注释驱动的侦听器、更好的泛型支持以及绑定到事务阶段的事件。

与往常一样，本文中提供的代码可以在 [GitHub](https://github.com/eugenp/tutorials/tree/master/spring-core-2) 上获取。这是一个基于 Maven 的项目，因此应该很容易导入并按原样运行。

原文链接：[https://www.baeldung.com/spring-events](https://www.baeldung.com/spring-events)
