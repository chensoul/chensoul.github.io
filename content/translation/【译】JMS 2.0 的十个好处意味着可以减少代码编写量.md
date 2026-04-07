---
title: "【译】JMS 2.0 的十个好处意味着可以减少代码编写量"
date: 2024-07-24 08:00:00+08:00
draft: false
slug: "jms20-means-less-code"
categories: [ "translation" ]
tags: [ "jms" ]
description: "本文通过十个简洁例子说明 JMS 2.0 如何比 JMS 1.1 需要更少的样板代码，包括 JMSContext、try-with-resources、JMSProducer、消息发送接收和异步处理等方面的变化。"
canonicalURL: "https://javaee.github.io/jms-spec/pages/JMS20MeansLessCode"
---

> 本文为学习目的的个人翻译，译文及后文「译者总结」仅供参考。
>
> 原文链接：[Ten ways in which JMS 2.0 means writing less code](https://javaee.github.io/jms-spec/pages/JMS20MeansLessCode)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。

这里有十个简单例子，用来说明 JMS 2.0 相比 JMS 1.1 如何需要更少的代码。

## 目录

- [使用单个 JMSContext，而不是分别使用 Connection 和 Session 对象](#使用单个-jmscontext而不是分别使用-connection-和-session-对象)
- [使用 try-with-resources 块意味着不再需要调用 close](#使用-try-with-resources-块意味着不再需要调用-close)
- [在 Java SE 中创建 session 时，不再需要传两个参数](#在-java-se-中创建-session-时不再需要传两个参数)
- [在 Java EE 事务中创建 session 时，不再需要传任何参数](#在-java-ee-事务中创建-session-时不再需要传任何参数)
- [新的 JMSProducer 对象支持方法链式调用](#新的-jmsproducer-对象支持方法链式调用)
- [不再需要把 JMSProducer 保存到变量中；按需即时创建即可](#不再需要把-jmsproducer-保存到变量中按需即时创建即可)
- [在 Java EE 中，注入 JMSContext 意味着你不必创建或关闭它](#在-java-ee-中注入-jmscontext-意味着你不必创建或关闭它)
- [发送消息时，不再需要先实例化 Message 对象](#发送消息时不再需要先实例化-message-对象)
- [同步接收时，可以直接接收消息体](#同步接收时可以直接接收消息体)
- [异步接收时，提取消息体之前不再需要类型转换](#异步接收时提取消息体之前不再需要类型转换)
- [相关页面](#相关页面)

## 使用单个 JMSContext，而不是分别使用 Connection 和 Session 对象

JMS 2.0 的简化 API 引入了一个新对象 `JMSContext`，它提供了与 JMS 1.1 API 中分开的 `Connection` 和 `Session` 对象相同的功能：

JMS 1.1

```java
Connection connection = connectionFactory.createConnection();
Session session = connection.createSession(false,Session.AUTO_ACKNOWLEDGE);
```

JMS 2.0

```java
JMSContext context = connectionFactory.createContext(JMSContext.SESSION_TRANSACTED);
```

## 使用 try-with-resources 块意味着不再需要调用 close

使用完 `Connection` 之后如果不关闭它，可能会导致应用程序耗尽资源。

JMS 1.1

在 JMS 1.1 中，确保连接在使用后被关闭的最佳方式，是在 `finally` 块中调用 `close()`：

```java
try {
 Connection connection = connectionFactory.createConnection();
 try {
 Session session = connection.createSession(false,Session.AUTO_ACKNOWLEDGE);
 ... etc ...
 } finally {
 connection.close();
 }
} catch (JMSException ex) {
 ex.printStackTrace();
}
```

这种写法相当冗长。更糟的是，如果 `try` 块主体中先抛出一个异常，随后在 `close()` 中又抛出另一个异常，那么前一个异常就会丢失，即便它才更可能是真正的根因。

JMS 2.0

在 JMS 2.0 中，`Connection` 对象实现了 `java.lang.AutoCloseable` 接口。这意味着，如果你在 try-with-resources 块中创建 `Connection` 对象，那么在代码块结束时，`close` 方法会被自动调用。

```java
try (Connection connection = connectionFactory.createConnection();){
 ... etc ...
} catch (JMSException ex) {
 ex.printStackTrace();
}
```

这样所需代码更少。此外，它也改善了异常处理：如果 `try` 块主体中发生异常，随后 `close()` 中又发生异常，那么第一个异常会被很好地嵌套在后一个异常中，因此你可以更容易识别根因。

创建 `JMSContext` 时，也可以使用同样的语法。

## 在 Java SE 中创建 session 时，不再需要传两个参数

……只需要一个参数即可：

JMS 1.1

```java
Session session = connection.createSession(true,Session.SESSION_TRANSACTED);
```

JMS 2.0

```java
Session session = connection.createSession(Session.SESSION_TRANSACTED);
```

创建 `JMSContext` 也有类似的方法。

## 在 Java EE 事务中创建 session 时，不再需要传任何参数

如果你在 Java EE 事务中创建 `Session`，那么传给 `createSession` 的参数实际上会被忽略。

EJB 3.1 规范里就是这么规定的。

JMS 1.1

但即便这样，JMS 1.1 仍然要求你传两个参数，即使它们最终都会被忽略。

```java
// both parameters will be ignored; transactional behaviour is determined by the container
Session session = connection.createSession(false,Session.CLIENT_ACKNOWLEDGE);
```

JMS 2.0

JMS 2.0 提供了一个无参方法：

```java
// transactional behaviour is determined by the container
Session session = connection.createSession();
```

## 新的 JMSProducer 对象支持方法链式调用

新的 `JMSProducer` 对象允许你通过方法链在一行代码里同时设置消息头、消息属性和投递选项。

JMS 1.1

```java
MessageProducer messageProducer = session.createProducer(demoQueue);
messageProducer.setPriority(1);
TextMessage textMessage = session.createTextMessage(body);
textMessage.setStringProperty("foo", "bar");
messageProducer.send(textMessage);
```

JMS 2.0

```java
TextMessage textMessage = context.createTextMessage(body);
context.createProducer().setPriority(1).setProperty(“foo”, “bar”).send(demoQueue, textMessage);
```

## 不再需要把 JMSProducer 保存到变量中；按需即时创建即可

新的 `JMSProducer` 是一个轻量级对象，因此不需要把它保存在变量里；需要时即时创建即可。

JMS 1.1

`MessageProducer` 开销较高，因此需要重用：

```java
MessageProducer messageProducer = session.createProducer(demoQueue);
messageProducer.send(message1);
messageProducer.send(message2);
```

JMS 2.0

`JMSProducer` 代价较低，因此无需保存在变量中：

```java
context.createProducer().send(demoQueue,message1);
context.createProducer().send(demoQueue,message2);
```

## 在 Java EE 中，注入 JMSContext 意味着你不必创建或关闭它

JMS 1.1

```java
try {
 Connection connection = connectionFactory.createConnection();
 try {
 Session session = connection.createSession(false,Session.AUTO_ACKNOWLEDGE);
 MessageProducer messageProducer = session.createProducer(demoQueue);
 TextMessage textMessage = session.createTextMessage(body);
 messageProducer.send(textMessage);
 } finally {
 connection.close();
 }
} catch (JMSException ex) {
 ex.printStackTrace();
}
```

JMS 2.0

```java
try {
 context.createProducer().send(inboundQueue, body);
} catch (JMSRuntimeException ex){
 ex.printStackTrace();
}
```

## 发送消息时，不再需要先实例化 Message 对象

JMS 1.1

需要先创建一个合适类型的消息对象，然后再设置它的消息体：

```java
MessageProducer messageProducer = session.createProducer(demoQueue);
TextMessage textMessage = session.createTextMessage("Hello world");
messageProducer.send(textMessage);
```

JMS 2.0

在 JMS 2.0 中，可以直接把消息体传给 `send` 方法：

```java
context.createProducer().send(demoQueue,"Hello world");
```

要注意的是，即便你还需要设置消息属性，也仍然可以这样做，因为这些属性可以设置在 `JMSProducer` 上。

## 同步接收时，可以直接接收消息体

JMS 1.1

同步接收时，你拿到的是一个 `Message` 对象，因此在提取消息体之前，需要把它强制转换成合适的子类型：

```java
MessageConsumer messageConsumer = session.createConsumer(demoQueue);
TextMessage textMessage = (TextMessage) messageConsumer.receive(1000);
if (textMessage==null){
 return "Received null";
} else {
 return "Received "+textMessage.getText();
}
```

JMS 2.0

JMS 2.0 允许你直接接收消息体：

```java
JMSConsumer consumer = context.createConsumer(demoQueue);
return "Received " + consumer.receiveBody(String.class, 1000);
```

注意这里不再需要类型转换，也不再需要专门处理 `null`。

## 异步接收时，提取消息体之前不再需要类型转换

JMS 1.1

异步接收消息时，传给 `onMessage` 方法的是一个 `javax.jms.Message`。在提取消息体之前，你需要先把它转换成预期的子类型。如果消息本身是一个 `ObjectMessage`，那么你得到的还是一个 `Serializable` 类型的消息体，于是为了获得最终对象，还需要再做一次类型转换。

```java
public void onMessage(Message m){
 MyObject myObj = (MyObject)((ObjectMessage)m).getObject();
 ...
```

JMS 2.0

新增的 `getBody` 方法允许你直接从 `Message` 中提取消息体，而不需要先把它转成合适的子类型。这对 `ObjectMessage` 尤其方便，因为它避免了为了提取对象负载而进行两次类型转换。

```java
public void onMessage(Message m){
 MyObject myObj = m.getBody(MyObject.class);
 ...
```

## 相关页面

- [JMS 2.0 Final Release](JMS20FinalRelease) page

## 译者总结

这篇文章的结构非常直接：作者没有展开讨论 JMS 2.0 的完整设计背景，而是连续列出十个具体场景，对比 JMS 1.1 和 JMS 2.0 在代码层面的差异。阅读时，重点应放在这些场景性的 API 改进上，而不是把它当作一篇系统化入门教程。

原文的核心信息是，JMS 2.0 并不是只在语法上做了小修小补，而是围绕 `JMSContext`、`JMSProducer`、消息发送/接收方式，以及资源管理等常见操作，系统性地减少了样板代码。

其中最值得注意的几类变化包括：资源关闭可以借助 try-with-resources 自动完成，消息发送和接收都更直接，方法链与轻量对象减少了中间变量，而 `getBody()` 这样的新方法则降低了类型转换负担。

这篇文章并不强调迁移成本、兼容性或架构层面的变化，它更像是一篇面向日常编码体验的 API 对比清单，用来回答“为什么 JMS 2.0 写起来更省事”这个问题。
