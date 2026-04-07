---
title: "【译】Spring Events"
date: 2014-11-10 21:59:00+08:00
draft: true
slug: spring-events
categories: [ "translation" ]
tags: [ "spring", "events" ]
description: "在 Spring 中发布与监听应用事件：自定义事件、异步多路广播、@EventListener、泛型条件监听与 @TransactionalEventListener。"
canonicalURL: "https://www.baeldung.com/spring-events"
---

## 1. 概述

本教程介绍如何在 Spring 中使用**应用事件（application events）**。

事件是框架里最容易被忽视、却又非常实用的能力之一。与 Spring 的许多其它能力一样，**事件发布**由 `ApplicationContext` 提供。

可以遵循几条简单约定：

- 若使用 **Spring Framework 4.2 之前**的版本，事件类应继承 `ApplicationEvent`；自 **4.2** 起，事件类**不再必须**继承 `ApplicationEvent`。
- **发布方**应注入 `ApplicationEventPublisher`。
- **监听器**应实现 `ApplicationListener` 接口。

## 2. 自定义事件

Spring 允许创建并发布**默认同步**的自定义事件。这样做的好处之一，是监听器可以参与到**发布方所在的事务**上下文中。

### 2.1. 一个简单的应用事件

先定义一个极简的事件类，仅作为承载数据的占位类型。

下面的示例中，事件里保存一条字符串消息：

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

接下来实现该事件的发布者：构造事件对象，并向所有监听者广播。

发布者只需注入 `ApplicationEventPublisher`，调用 `publishEvent()` 即可：

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

另一种做法是让发布者类实现 `ApplicationEventPublisherAware`，由容器在启动时注入发布器；实践中直接用 `@Autowired` 注入通常更简单。

自 **Spring Framework 4.2** 起，`ApplicationEventPublisher` 为 `publishEvent(Object event)` 增加了可接受**任意对象**作为事件的重载，因此事件**不必**再继承 `ApplicationEvent`。

### 2.3. 监听器

最后编写监听器。

监听器只需是一个 **bean**，并实现 `ApplicationListener`：

```java
@Component
public class CustomSpringEventListener implements ApplicationListener<CustomSpringEvent> {
    @Override
    public void onApplicationEvent(CustomSpringEvent event) {
        System.out.println("Received spring custom event - " + event.getMessage());
    }
}
```

自定义监听器通过**泛型参数**指定事件类型，使 `onApplicationEvent` **类型安全**，也省去了手动 `instanceof` 与强制转换。

另外，如前所述（Spring 事件默认**同步**），若发布路径上会调用 `doStuffAndPublishAnEvent()` 之类方法，它会**阻塞**，直到所有监听器处理完毕。

## 3. 异步事件

有时我们并不希望同步发布——而需要**异步**处理事件。

可在配置里声明带 **TaskExecutor** 的 `ApplicationEventMulticaster` bean 来开启异步派发。

示例中使用 `SimpleAsyncTaskExecutor`：

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

事件类、发布者与监听器的写法可与前文相同，但监听器会在**独立线程**中异步执行。

## 4. Spring 内置事件

Spring 自身也会发布多种框架级事件。例如 `ApplicationContext` 会触发 `ContextRefreshedEvent`、`ContextStartedEvent`、`RequestHandledEvent` 等。

应用开发者可以监听这些钩子，在应用或上下文生命周期的合适时机插入自定义逻辑。

下面是一个监听**上下文刷新**的示例：

```java
public class ContextRefreshedListener
  implements ApplicationListener<ContextRefreshedEvent> {
    @Override
    public void onApplicationEvent(ContextRefreshedEvent cse) {
        System.out.println("Handling context re-freshed event. ");
    }
}
```

## 5. 基于注解的事件监听器

自 **Spring 4.2** 起，监听器**不必**再写成实现 `ApplicationListener` 的 bean；可在任意托管 bean 的**公共方法**上使用 `@EventListener` 注册：

```java
@Component
public class AnnotationDrivenEventListener {
    @EventListener
    public void handleContextStart(ContextStartedEvent cse) {
        System.out.println("Handling context started event.");
    }
}
```

方法签名即声明所消费的事件类型，与前面写法一致。

默认情况下，这类监听仍是**同步**调用的；若在方法上再加 `@Async`，即可异步执行——前提是已在应用中开启异步支持（例如 `@EnableAsync`）。

## 6. 泛型事件

还可以利用事件类型上的**泛型信息**来分发事件。

### 6.1. 泛型应用事件

先定义一个泛型事件类。

下例中，事件携带任意类型的载荷 `what`，以及一个表示是否成功的布尔字段：

```java
public class GenericSpringEvent<T> {
    private T what;
    protected boolean success;

    public GenericSpringEvent(T what, boolean success) {
        this.what = what;
        this.success = success;
    }

    public T getWhat() {
        return what;
    }

    public boolean isSuccess() {
        return success;
    }
}
```

注意它与前面的 `CustomSpringEvent` 不同：我们可以更灵活地发布**任意 POJO 事件**，**无需**再继承 `ApplicationEvent`。

### 6.2. 监听器

为上述事件编写监听器。

一种写法仍是实现 `ApplicationListener`：

```java
import org.springframework.lang.NonNull;

@Component
public class GenericSpringEventListener
  implements ApplicationListener<GenericSpringEvent<String>> {
    @Override
    public void onApplicationEvent(@NonNull GenericSpringEvent<String> event) {
        System.out.println("Received spring generic event - " + event.getWhat());
    }
}
```

但在泛型事件场景下，若还要配合 **SpEL 条件**、或避免类型擦除带来的琐碎样板，实践中更常采用下一小节的 **`@EventListener`** 写法。

也可以借助 `@EventListener` 上的布尔 **SpEL** 表达式，写出**带条件**的监听器。

例如，仅当 `GenericSpringEvent<String>` 的 `success` 为真时才处理：

```java
@Component
public class AnnotationDrivenEventListener {
    @EventListener(condition = "#event.success")
    public void handleSuccessful(GenericSpringEvent<String> event) {
        System.out.println("Handling generic event (conditional).");
    }
}
```

**Spring 表达式语言（SpEL）**能力很强，独立教程中有更细讲解。

### 6.3. 发布者

发布方式与前面类似。由于**类型擦除**，若要对泛型参数做区分，有时需要发布**具体的子类**事件，例如 `class GenericStringSpringEvent extends GenericSpringEvent<String>`，以便框架正确解析泛型。

另外：若 `@EventListener` 方法返回**非空**值，Spring 会把该返回值当作**新事件**再次发布；若返回集合，也可一次性发布多个后续事件。

## 7. 与事务绑定的事件

本节介绍 `@TransactionalEventListener`。更多事务与 JPA 配置见 [Transactions With Spring and JPA](https://www.baeldung.com/transaction-configuration-with-jpa-and-spring)。

自 **Spring 4.2** 起，框架提供 `@TransactionalEventListener`。它在 `@EventListener` 基础上，允许把监听逻辑绑定到事务的特定阶段。

可绑定阶段包括：

- **`AFTER_COMMIT`（默认）**：事务**成功提交**之后触发。
- **`AFTER_ROLLBACK`**：事务已**回滚**。
- **`AFTER_COMPLETION`**：事务已**结束**（无论提交或回滚，相当于 `AFTER_COMMIT` 与 `AFTER_ROLLBACK` 的并集）。
- **`BEFORE_COMMIT`**：在事务**提交前**触发。

简单示例：

```java
@TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
public void handleCustom(CustomSpringEvent event) {
    System.out.println("Handling event inside a transaction BEFORE COMMIT.");
}
```

仅当**事件发布方运行在即将提交的事务中**时，该监听器才会被调用。

若当前**没有活动事务**，默认**不会**派发事件；除非将 **`fallbackExecution`** 设为 `true`，在无事务时仍执行监听逻辑。

## 8. 小结

本文梳理了 Spring 中的事件机制：如何定义自定义事件、发布并在监听器中处理；如何配置**异步** `ApplicationEventMulticaster`；以及 **Spring 4.2** 引入的 `@EventListener`、更好的**泛型**支持，和与**事务阶段**绑定的 `@TransactionalEventListener`。

示例工程见 [GitHub（spring-core-2）](https://github.com/eugenp/tutorials/tree/master/spring-core-2)，基于 Maven，可直接导入运行。

> 本文为学习目的的个人翻译，译文仅供参考。
>
> 原文链接：[Spring Events](https://www.baeldung.com/spring-events)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
