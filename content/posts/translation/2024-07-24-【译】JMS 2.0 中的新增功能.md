---
title: "【译】JMS 2.0 中的新增功能"
date: 2024-07-24 08:00:00+08:00
slug: "what-is-new-in-jms-2-0"
categories: [ "translation" ]
tags: [ "jms" ]
description: "本文概览了 JMS 2.0 相比 JMS 1.1 的主要变化，包括易用性改进以及共享订阅、延迟投递、异步发送、JMSXDeliveryCount 和 MDB 配置属性等五项新特性。"
canonicalURL: "https://hasithah.medium.com/what-is-new-in-jms-2-0-821266fc1bf0"
---

> 本文为学习目的的个人翻译，译文及后文「译者总结」仅供参考。
>
> 原文链接：[What is new in JMS 2.0](https://hasithah.medium.com/what-is-new-in-jms-2-0-821266fc1bf0)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。

在软件集成领域，从一个软件组件与另一个软件组件进行通信，是一个基本要求。虽然已经出现了很多能够实现这一能力的技术，但 Java 编程语言提供了一套 API，用于促进用 Java 编写的组件之间进行消息传递。这套 API 的具体实现，则由不同供应商（JMS Providers）通过 broker 软件来提供。

这套 API 就叫作 Java Message Service（JMS）。

JMS 规范的上一次更新是在 2002 年，也就是 JMS 1.1 版本发布的时候。此后多年，这套 API 已在全球大量软件组件中被使用，证明了它对开发者是友好的。JMS 的下一个版本（JMS 2.0）在数年之后，于 2013 年 4 月发布。

**JMS 2.0 只能与 Java SE 7 及以上版本一起使用。** 下面我们来看一看 JMS 2.0 中有哪些新变化。

## 易用性方面的语言特性

从语言使用角度看，这次 API 最大的变化，是减少了开发者需要编写的代码量。下面我们把 JMS 2.0 和 1.1 放在一起比较，看看它到底带来了哪些变化。

### Connection 和 Session 对象被合并进单个 JMSContext

你不再需要分别创建 connection 和 session 对象了。现在可以创建一个 `JMSContext`，并直接用它来创建消息生产者。

### 不再需要调用 `connection.close()`

而且，你也不再需要在代码里显式调用 `close`。`JMSContext` 实现了 Java SE 7 的 `java.lang.AutoCloseable` 接口。这意味着，如果我们在 try-with-resources 代码块中创建 `JMSContext`（这同样是 Java SE 7 的新特性），那么 `close` 方法会在代码块结束时自动调用，无需显式写入代码中。

上面的例子已经展示了这一点。

### 创建 session 时不再需要传入两个参数

在 JMS 1.1 中，还需要额外传一个参数，来指定 session 是否为事务型。在 JMS 2.0 中，只需要传 `Session.SESSION_TRANSACTED` 即可。

如果我们想指定其他 session 模式（本地事务、`CLIENT_ACKNOWLEDGE` 或 `DUPS_OK_ACKNOWLEDGE`），也只需要传一个参数，而不是两个。如果你希望 session 使用 `Session.AUTO_ACKNOWLEDGE`，那么甚至不需要传任何参数，因为这已经是默认值。

### 支持方法链式调用

这会显著减少需要编写的代码量。下面的示例会展示这一点。

### 在 Java EE 中，注入 JMSContext 意味着你不需要创建或关闭它

### 发送时不再需要实例化 Message 对象

要注意的是，即便你还想设置消息属性，也同样可以这么做，因为这些属性可以设置在 `JMSProducer` 上。

### 可直接接收消息体

同步接收消息时，你拿到的是一个 `Message` 对象，在提取消息体之前，需要先把它转换成合适的子类型。

### 提取消息体前不再需要类型转换

异步接收消息时，传给 `onMessage` 方法的参数是一个 `javax.jms.Message`。在提取消息体之前，你需要先把它转换成预期的子类型。如果消息是 `ObjectMessage`，那么你拿到的消息体还是一个 `Serializable`，接着还得再做一次类型转换，把它转成真正需要的对象类型。现在，新增的 `getBody` 方法允许你直接从 `Message` 中提取消息体，而不需要先转换成相应子类型。

## 五项新特性

JMS 2.0 还引入了若干新的消息传递特性。

### 1. 允许多个消费者使用同一个主题订阅

JMS 1.1 有一个限制：对于某个 topic，使用同一个 subscription ID 的订阅只能有一个 subscriber。这使得我们无法把负载分摊到多个 JVM 或机器上，因为你不能再创建另一个拥有相同 ID 的订阅。

JMS 2.0 提供了解决办法。你可以通过新方法 `createSharedConsumer` 来创建一个“共享的”非持久订阅。这个方法在 `Session`（供使用 classic API 的应用程序使用）和 `JMSContext`（供使用 simplified API 的应用程序使用）上都可用。由于两个 JVM 需要识别自己共享的是哪一个订阅，因此它们需要提供一个名称来标识这个共享订阅，如下所示。

如果你把上述代码分别运行在两个不同 JVM 中，那么每条发送到该 topic 的消息，只会被交付给两个消费者中的其中一个。这样，它们就可以共同分担处理订阅消息的工作。

### 2. 延迟投递

现在，你可以为消息设置一个投递延迟。在指定的延迟时间过去之前，JMS provider 不会投递这条消息。

### 3. 异步发送消息

这个特性适用于运行在 Java SE 或 Java EE application client container 中的应用程序；它不适用于运行在 Java EE Web 或 EJB container 中的应用程序。

通常情况下，当发送一条持久化消息时，`send` 方法只有在 JMS 客户端把消息发送到服务器，并收到服务器返回的确认回复（表示该消息已经被安全接收并持久化）之后，才会返回。这种方式称为同步发送。

JMS 2.0 引入了异步发送能力。当一条消息被异步发送时，`send` 方法会把消息发送到服务器，然后立即把控制权交还给应用程序，而不需要等待服务器回复。

当服务器返回回复，表明消息已被服务器接收并持久化后，JMS provider 会通过调用应用程序指定的 `CompletionListener` 对象上的回调方法 `onCompletion` 来通知应用程序。

这个能力的一个重要用途，是允许应用程序连续发送大量消息，而不需要在每发送一条消息之后，都等待服务器返回回复。

### 4. JMSXDeliveryCount

JMS 2.0 允许接收消息的应用程序判断一条消息已经被重新投递了多少次。这个信息可以通过消息属性 `JMSXDeliveryCount` 获取：

```java
int deliveryCount = message.getIntProperty("JMSXDeliveryCount");
```

`JMSXDeliveryCount` 属性使消费端应用能够识别出一条消息是否已经被反复重新投递，因此它在某种意义上可能是一条“坏消息”。应用程序可以利用这个信息执行某种特殊动作，而不只是继续触发下一次重投，例如直接消费它，并把它发送到一个单独的“坏消息”队列中，供管理员后续处理。

### 5. MDB 配置属性

一个需要异步接收消息的 Java EE 应用程序，会通过 MDB 来实现，而 MDB 需要通过一组配置属性来完成配置。

- `destinationLookup`：一个通过管理工具定义好的 `Queue` 或 `Topic` 对象的 JNDI 名称，表示 MDB 将从该队列或主题接收消息。
- `connectionFactoryLookup`：一个通过管理工具定义好的 `ConnectionFactory` 对象的 JNDI 名称，MDB 将通过它连接到 JMS provider。
- `clientId`：MDB 连接到 JMS provider 时使用的 client identifier。`subscriptionName`：当 `subscriptionDurability` 设置为 `Durable` 时所使用的持久订阅名称。

## WSO2 的中间件支持

如今，WSO2 的 [Enterprise Integrator](https://wso2.com/integration/) 已经开箱即支持 JMS 2.0。这个产品使你能够在向第三方 broker 上定义的 queue 或 topic 发送、接收消息时，使用上面提到的这些新特性，前提是该 broker 本身支持 JMS 2.0。

## 译者总结

这篇文章是一篇概览式短文，重点不是逐项展开 JMS 2.0 规范，而是快速盘点 JMS 2.0 相比 JMS 1.1 在“写起来更省事”和“消息能力更完整”这两方面的变化。

文章结构也很清楚：前半部分先概括易用性改进，例如 `JMSContext`、自动关闭、方法链、直接接收消息体等；后半部分再列出五项新的消息传递特性，例如共享订阅、延迟投递、异步发送和 `JMSXDeliveryCount`。

如果把这篇与前面两篇更详细的 JMS 2.0 译文放在一起看，会发现它更像是一个总览版本：不追求面面俱到，而是帮助读者先建立对 JMS 2.0 改进方向的整体认识。
