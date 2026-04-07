---
title: "【译】JMS 2.0 中的新增功能（第二部分）- 新的消息传送功能"
date: 2024-07-24 08:00:00+08:00
slug: "jms20-2"
categories: [ "translation" ]
tags: [ "jms" ]
description: "本文介绍 JMS 2.0 在消息传递方面的五项重要新特性，包括共享订阅、延迟投递、异步发送、JMSXDeliveryCount，以及 MDB 标准化配置属性。"
canonicalURL: "https://www.oracle.com/technical-resources/articles/java/jms2messaging.html"
---

> 本文为学习目的的个人翻译，译文及后文「译者总结」仅供参考。
>
> 原文链接：[What's New in JMS 2.0, Part Two—New Messaging Features](https://www.oracle.com/technical-resources/articles/java/jms2messaging.html)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。

*作者：Nigel Deakin*  
*发布于 2013 年 5 月*

了解如何利用 JMS 2.0 中新的消息传递特性。

本文是两部分系列文章中的第二部分，介绍了 Java Message Service（JMS）2.0 中引入的一些新的消息传递特性。本文假定读者已经对 JMS 1.1 有基本了解。

在[第一部分](/technical-resources/articles/java/jms20.html)中，我们看过了 JMS 2.0 引入的易用性改进。这里，我们来看其中一些重要的消息传递新特性。

JMS 2.0 于 2013 年 4 月发布，这是自 2002 年 1.1 版发布以来，JMS 规范的第一次更新。一个长期没有变化的 API，乍看之下似乎已经变得陈旧且少人使用。然而，如果以不同实现的数量来衡量一个 API 标准是否成功，那么 JMS 其实是最成功的 API 之一。

在 JMS 2.0 中，重点一方面是补上近年来其他企业级 Java 技术在易用性方面的改进，另一方面也借机引入了一批新的消息传递功能。

JMS 2.0 是 Java EE 7 平台的一部分，可用于 Java EE Web 或 EJB 应用程序中。它也可以单独运行在 Java SE 环境中。正如下文会解释的那样，有些功能只在独立环境中可用，而另一些功能则只在 Java EE Web 或 EJB 应用程序中可用。

下面我们讨论 JMS 2.0 中五项重要的新消息传递特性。

#### 允许多个消费者使用同一个主题订阅

在 JMS 1.1 中，一个主题上的某个订阅在同一时刻不允许有多个消费者。这意味着，处理同一个主题订阅上消息的工作无法在多个线程、多个连接或多个 Java Virtual Machine（JVM）之间共享，因此应用程序的可扩展性会受到限制。JMS 2.0 通过引入一种新的主题订阅类型——共享订阅（shared subscription）——移除了这个限制。

先回顾一下 JMS 1.1 中主题订阅的工作方式。在清单 1 中，`Session` 上的 `createConsumer` 方法被用来在指定主题上创建一个非持久订阅（稍后我们会讨论持久订阅）：

```java
private void createUnsharedConsumer(ConnectionFactory connectionFactory, Topic topic)
 throws JMSException {
 Connection connection = connectionFactory.createConnection();
 Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
 MessageConsumer messageConsumer = session.createConsumer(topic);
 connection.start();
 Message message = messageConsumer.receive(10000);
 while (message != null) {
 System.out.println("Message received: " + ((TextMessage) message).getText());
 message = messageConsumer.receive(10000);
 }
 connection.close();
}
```

清单 1

在清单 1 中，这个消费者会接收到发送到该主题的每一条消息的一个副本。但如果应用程序处理每条消息都需要较长时间，该怎么办？如果我们希望通过两个 JVM 分担这项工作，让一个 JVM 处理其中一部分消息，另一个 JVM 处理其余消息，又该怎么办？

在 JMS 1.1 中，在普通 Java SE 应用里没有办法做到这一点。（在 Java EE 中，你可以通过一组 message-driven beans [MDBs] 来实现。）如果你在另一个 JVM 中（或者同一个 JVM 的另一个线程中）再次调用 `createConsumer` 创建第二个消费者，那么每个消费者都会使用一个独立订阅，因此它们都会收到发送到主题上的每一条消息的副本。这并不是我们想要的结果。如果把“订阅”理解为一个逻辑实体，它会接收发送到该主题上的每一条消息的副本，那么我们真正想要的是两个消费者共用同一个订阅。

JMS 2.0 提供了解决办法。你可以通过一个新方法 `createSharedConsumer` 创建“共享的”非持久订阅。这个方法在 `Session`（供使用经典 API 的应用程序使用）和 `JMSContext`（供使用简化 API 的应用程序使用）上都可用。由于两个 JVM 需要能够识别自己共享的是哪一个订阅，所以它们必须提供一个名称来标识该共享订阅，如清单 2 所示。

```java
private void createSharedConsumer(ConnectionFactory connectionFactory, Topic topic) throws JMSException {
 Connection connection = connectionFactory.createConnection();
 Session session = connection.createSession(false, Session.AUTO_ACKNOWLEDGE);
 MessageConsumer messageConsumer = session.createSharedConsumer(topic,"mySubscription");
 connection.start();
 Message message = messageConsumer.receive(10000);
 while (message != null) {
 System.out.println("Message received: " + ((TextMessage) message).getText());
 message = messageConsumer.receive(10000);
 }
 connection.close();
}
```

清单 2

如果你把清单 2 中的代码分别运行在两个独立 JVM 中，那么每一条发送到主题上的消息，只会被交付给这两个消费者中的其中一个。这样，它们就可以共享处理订阅消息的工作。

同样的能力也适用于使用持久订阅的应用程序。在 JMS 1.1 中，持久订阅通过 `Session` 上的 `createDurableSubscriber` 方法创建：

```java
MessageConsumer messageConsumer = session.createDurableSubscription(topic,"myDurableSub");
```

这会在指定主题上创建一个名为 `myDurableSub` 的持久订阅。但和前面一样，你仍然没有办法在两个 JVM 之间，或者同一个 JVM 的两个线程之间，分担处理这个持久订阅消息的工作。取决于你具体怎么尝试，结果要么是抛出 `JMSException`，要么是得到两个不同的订阅。

JMS 2.0 再次为这个问题提供了解法。你现在可以使用新的 `createSharedDurableConsumer` 方法来创建“共享的”持久订阅。这个方法同样在 `Session` 和 `JMSContext` 上都可用。

```java
MessageConsumer messageConsumer = session.createSharedDurableConsumer(topic,"myDurableSub");
```

总结一下：JMS 1.1 只定义了两种主题订阅，而 JMS 2.0 则定义了四种。它们都可以通过经典 API 或简化 API 创建：

- **非共享的非持久订阅**：JMS 1.1 和 JMS 2.0 都支持，使用 `createConsumer` 创建。它们只能有一个消费者。是否设置 client identifier 是可选的。
- **非共享的持久订阅**：JMS 1.1 和 JMS 2.0 都支持，使用 `createDurableSubscriber` 或（仅在 JMS 2.0 中）`createDurableConsumer` 创建。它们只能有一个消费者。必须设置 client identifier，并且订阅由“订阅名 + client identifier”的组合标识。
- **共享的非持久订阅**：仅在 JMS 2.0 中可用，使用 `createSharedConsumer` 创建。它们可以拥有任意数量的消费者。是否设置 client identifier 是可选的。订阅由“订阅名 + client identifier（如果设置了）”的组合标识。
- **共享的持久订阅**：仅在 JMS 2.0 中可用，使用 `createSharedDurableConsumer` 创建。它们可以拥有任意数量的消费者。是否设置 client identifier 是可选的。订阅由“订阅名 + client identifier（如果设置了）”的组合标识。

#### Delivery Delay

现在，你可以为一条消息指定投递延迟（delivery delay）。JMS provider 在指定的延迟时间过去之前，不会投递这条消息。

如果你使用经典 API，那么在发送消息之前，需要在 `MessageProducer` 上调用 `setDeliveryDelay`（单位是毫秒），如清单 3 所示。

```java
private void sendWithDeliveryDelayClassic(ConnectionFactory connectionFactory,Queue queue)
 throws JMSException {

 // send a message with a delivery delay of 20 seconds
 try (Connection connection = connectionFactory.createConnection();){
 Session session = con.createSession();
 MessageProducer messageProducer = session.createProducer(queue);
 messageProducer.setDeliveryDelay(20000);
 TextMessage textMessage = session.createTextMessage("Hello world");
 messageProducer.send(textMessage);
 }
}
```

清单 3

如果你使用简化 API，那么在发送消息之前，需要在 `JMSProducer` 上调用 `setDeliveryDelay`。这个方法会返回 `JMSProducer` 对象，因此你可以在同一行中完成创建 `JMSProducer`、设置延迟和发送消息，如清单 4 所示。

```java
private void sendWithDeliveryDelaySimplified(ConnectionFactory connectionFactory,Queue queue)
 throws JMSException {

 // send a message with a delivery delay of 20 seconds
 try (JMSContext context = connectionFactory.createContext();){
 context.createProducer().setDeliveryDelay(20000).send(queue,"Hello world");
 }
}
```

清单 4

#### 异步发送消息

JMS 2.0 的另一个新特性，是支持异步发送消息。

这个特性适用于运行在 Java SE 或 Java EE application client container 中的应用程序；它不适用于运行在 Java EE Web 或 EJB container 中的应用程序。

通常情况下，当发送一条持久化消息时，`send` 方法只有在 JMS 客户端把消息发送给服务器，并从服务器收到回复、确认消息已被安全接收并持久化之后，才会返回。我们把这叫作同步发送（synchronous send）。

JMS 2.0 引入了执行异步发送的能力。当异步发送消息时，`send` 方法会把消息发送给服务器，然后立即把控制权返回给应用程序，而不需要等待服务器回复。应用程序不再因为 JMS 客户端等待服务器回复而被无谓阻塞，而可以去做其他有价值的事情，例如继续发送下一条消息，或者执行某些处理逻辑。

当服务器返回回复，表示消息已被服务器接收并持久化之后，JMS provider 会通过调用应用程序指定的 `CompletionListener` 对象上的回调方法 `onCompletion` 来通知应用程序。

在应用程序中，异步发送通常有两种主要用途：

- 让应用程序在原本需要等待服务器回复的时间里去做其他事情（例如更新界面或写数据库）
- 允许应用程序连续发送大量消息，而不必在每发送一条后都等待服务器回复

清单 5 展示了如何使用经典 API 实现第一种场景：

```java
private void asyncSendClassic(ConnectionFactory connectionFactory,Queue queue)
 throws Exception {

 // send a message asynchronously
 try (Connection connection = connectionFactory.createConnection();){
 Session session = connection.createSession();
 MessageProducer messageProducer = session.createProducer(queue);
 TextMessage textMessage = session.createTextMessage("Hello world");
 CountDownLatch latch = new CountDownLatch(1);
 MyCompletionListener myCompletionListener = new MyCompletionListener(latch);
 messageProducer.send(textMessage,new MyCompletionListener(latch));
 System.out.println("Message sent, now waiting for reply");

 // at this point we can do something else before waiting for the reply
 // this is not shown here

 // now wait for the reply from the server
 latch.await();

 if (myCompletionListener.getException()==null){
 System.out.println("Reply received from server");
 } else {
 throw myCompletionListener.getException();
 }
 }
}
```

清单 5

清单 5 中使用的 `MyCompletionListener` 是应用程序自己提供的一个单独类，它实现了 `javax.jms.CompletionListener` 接口，如清单 6 所示：

```java
class MyCompletionListener implements CompletionListener {

 CountDownLatch latch;
 Exception exception;

 public MyCompletionListener(CountDownLatch latch) {
 this.latch=latch;
 }

 @Override
 public void onCompletion(Message message) {
 latch.countDown();
 }

 @Override
 public void onException(Message message, Exception exception) {
 latch.countDown();
 this.exception=exception;
 }

 public Exception getException(){
 return exception;
 }
}
```

清单 6

在清单 6 中，我们使用了 `MessageProducer` 上的一个新方法来发送消息，而无需等待服务器回复：`send(Message message, CompletionListener listener)`。通过这种方式发送消息时，应用程序可以在服务器处理消息期间去做其他事情。等应用程序准备继续执行时，它会使用 `java.util.concurrent.CountDownLatch` 来等待服务器回复。服务器回复到达后，应用程序就可以继续执行，同时它对“消息已成功发送”的确信程度，和同步发送之后获得的是一样的。

如果你使用的是 JMS 2.0 的简化 API，那么异步发送会稍微更简单一些，如清单 7 所示：

```java
private void asyncSendSimplified(ConnectionFactory connectionFactory,Queue queue)
 throws Exception {

 // send a message asynchronously
 try (JMSContext context = connectionFactory.createContext();){
 CountDownLatch latch = new CountDownLatch(1);
 MyCompletionListener myCompletionListener = new MyCompletionListener(latch);
 context.createProducer().setAsync(myCompletionListener).send(queue,"Hello world");
 System.out.println("Message sent, now waiting for reply");

 // at this point we can do something else before waiting for the reply
 // this is not shown here

 latch.await();
 if (myCompletionListener.getException()==null){
 System.out.println("Reply received from server");
 } else {
 throw myCompletionListener.getException();
 }
 }
 }
```

清单 7

这里是在 `send(Message message)` 之前，先对 `JMSProducer` 调用了 `setAsync(CompletionListener listener)`。由于 `JMSProducer` 支持方法链式调用，因此这两个动作可以放在同一行完成。

#### JMSXDeliveryCount

JMS 2.0 允许接收消息的应用程序判断一条消息已经被重新投递了多少次。这个信息可以通过消息属性 `JMSXDeliveryCount` 获取：

```java
int deliveryCount = message.getIntProperty("JMSXDeliveryCount");
```

`JMSXDeliveryCount` 并不是一个新属性；它在 JMS 1.1 中就已经定义了。不过在 JMS 1.1 中，JMS provider 是否真正设置这个属性是可选的，这意味着依赖它的应用代码并不具备可移植性。而在 JMS 2.0 中，JMS provider 必须设置这个属性，因此应用程序现在可以可移植地使用它了。

那么，应用程序为什么会想知道一条消息被重新投递了多少次呢？

如果一条消息被重新投递，这意味着之前某次投递因为某种原因失败了。如果一条消息被反复重新投递，那么原因很可能是接收方应用程序存在问题。也许应用程序可以成功接收到消息，但却无法处理它，因此抛出了异常，或者回滚了事务。如果一条消息长期无法被处理，例如它本身在某种意义上就是一条“坏消息”，那么同一条消息会被反复投递，浪费资源，并阻塞后续“好消息”的处理。

`JMSXDeliveryCount` 属性允许消费端应用程序识别出一条消息已经被多次重新投递，因此它很可能在某种意义上是一条“坏消息”。应用程序可以据此执行某些特殊动作，而不只是再次触发重新投递，例如消费掉这条消息并将其转发到一个单独的“坏消息”队列，由管理员后续处理。

有些 JMS provider 已经提供了非标准方式，用来检测那些被反复重新投递的消息，并把它们转发到死信队列。JMS 2.0 并没有标准化这类消息应该如何被处理，但 `JMSXDeliveryCount` 属性使得应用程序能够以一种可移植的方式，自行实现“坏消息”处理逻辑。

清单 8 展示了一个 `MessageListener`，它会抛出 `RuntimeException` 来模拟处理“坏消息”时的错误。这个 `MessageListener` 使用 `JMSXDeliveryCount` 属性来检测一条消息是否已经被重新投递了 10 次，并据此采取不同动作。

```java
class MyMessageListener implements MessageListener {

 @Override
 public void onMessage(Message message) {
 try {
 int deliveryCount = message.getIntProperty("JMSXDeliveryCount");
 if (deliveryCount<10){
 // now throw a RuntimeException
 // to simulate a problem processing the message
 // the message will then be redelivered
 throw new RuntimeException("Exception thrown to simulate a bad message");
 } else {
 // message has been redelivered ten times,
 // let's do something to prevent endless redeliveries
 // such as sending it to dead message queue
 // details omitted
 }
 } catch (JMSException e) {
 throw new RuntimeException(e);
 }
 }
}
```

清单 8

#### MDB 配置属性

一个需要异步接收消息的 Java EE 应用程序，会通过 MDB 来实现这一点，而 MDB 需要通过若干配置属性进行配置。

早期 Java EE 版本对 MDB 的配置方式定义得相当模糊。在 EJB 3.1 中，唯一被定义的配置属性只有：

- `acknowledgeMode`（仅用于 bean-managed 事务，可设置为 `Auto-acknowledge` 或 `Dups-ok-acknowledge`）
- `messageSelector`
- `destinationType`（可设置为 `javax.jms.Queue` 或 `javax.jms.Topic`）
- `subscriptionDurability`（仅用于 topic，可设置为 `Durable` 或 `NonDurable`）

然而，EJB 3.1 并没有定义应用程序应该如何指定 MDB 要从哪个 queue 或 topic 接收消息。这一点被留给了应用服务器或资源适配器自行定义一种非标准方式来完成。

EJB 3.1 也没有定义：当消息来自某个 topic 且 `subscriptionDurability` 被设置为 `Durable` 时，订阅名和 client identifier 应该如何指定。同时，EJB 3.1 也没有标准方式来指定 MDB 连接 JMS 服务器时使用的 connection factory。

这些多少有些令人意外的限制，在最新版本的 Java EE 中都已经得到解决。EJB 3.2（Java EE 7 的一部分）新增定义了以下配置属性：

- `destinationLookup`：一个在管理侧定义好的 `Queue` 或 `Topic` 对象的 JNDI 名称，表示 MDB 将从中接收消息的目标。
- `connectionFactoryLookup`：一个在管理侧定义好的 `ConnectionFactory` 对象的 JNDI 名称，MDB 会使用它连接到 JMS provider。
- `clientId`：MDB 连接 JMS provider 时使用的 client identifier。
- `subscriptionName`：当 `subscriptionDurability` 设置为 `Durable` 时使用的持久订阅名称。

多数应用服务器本来就支持 `clientId` 和 `subscriptionName`，因此把它们纳入标准，本质上只是把既有实践正式化。

当然，一直以来都可以配置 JMS MDB 使用哪个 queue 或 topic，而且很多（虽然不是全部）应用服务器也提供了指定 connection factory 的方式。只是这些配置方法在当时都属于非标准实现，并且在不同应用服务器之间不一样。应用服务器仍然可以继续支持这些非标准机制。不过现在你可以更有把握地认为，使用 `destinationLookup` 和 `connectionFactoryLookup` 的应用程序能够在多个应用服务器之间正常工作。

清单 9 展示了一个 JMS MDB，它从某个 topic 上的持久订阅中消费消息，并使用了这些新的标准属性：

```java
@MessageDriven(activationConfig = {
 @ActivationConfigProperty(
 propertyName = "connectionFactoryLookup", propertyValue = "jms/MyConnectionFactory"),
 @ActivationConfigProperty(
 propertyName = "destinationLookup", propertyValue = "jmq/PriceFeed"),
 @ActivationConfigProperty(
 propertyName = "destinationType ", propertyValue = "javax.jms.Topic "),
 @ActivationConfigProperty(
 propertyName = "subscriptionDurability ", propertyValue = "Durable"),
 @ActivationConfigProperty(
 propertyName = "subscriptionName", propertyValue = "MySub"),
 @ActivationConfigProperty(
 propertyName = "clientId", propertyValue = "MyClientId") })

public class MyMDB implements MessageListener {
 public void onMessage(Message message) {
 ...
```

清单 9

#### 结论

上面描述的这五项特性，都会让 Java 开发者进行消息处理时变得更轻松。再结合第一部分中讨论的那些易用性改进，它们一起构成了 JMS 2.0 的一次重要跃进——这也使它有望继续作为 Java 生态中最成功的 API 之一而保持活力。

#### 另请参阅

- [What's New in JMS 2.0, Part One—Ease of Use](/technical-resources/articles/java/jms20.html)
- [JSR 343](http://jcp.org/en/jsr/detail?id=343)
- [GlassFish](https://glassfish.java.net/)
- [Open Message Queue 5.0](https://mq.java.net/)

#### 关于作者

Nigel Deakin 是 Oracle 的 Principal Member of Technical Staff，也是 JSR 343（Java Message Service 2.0）的 Specification Lead。除了负责推动 JMS 规范下一版本的发展外，他还是 Oracle JMS 开发团队的一员，参与 Open Message Queue 和 GlassFish application server 的开发。他近年曾在美国旧金山的 JavaOne 以及比利时安特卫普的 Devoxx 上发表演讲，目前常驻英国剑桥。

#### 加入讨论

欢迎通过 [Facebook](https://www.facebook.com/ilovejava)、[Twitter](https://twitter.com/#!/java) 和 [Oracle Java Blog](https://blogs.oracle.com/java/) 加入 Java 社区的讨论。

## 译者总结

这篇文章是 JMS 2.0 系列的第二部分，重点不是再讲 API 易用性，而是集中介绍消息传递层面的五项新增能力：共享订阅、延迟投递、异步发送、`JMSXDeliveryCount` 以及 MDB 配置属性标准化。

原文有一条很清晰的主线：这些新特性要么直接提高了系统的可扩展性，例如共享订阅；要么提升了发送和接收过程中的控制能力，例如 delivery delay、异步发送和重复投递次数可见性；要么改善了 Java EE 中 JMS 配置的可移植性，例如 MDB 的标准化属性。

其中，`JMSXDeliveryCount` 和 MDB 配置属性这两节比较容易被忽略，但它们都与“可移植性”密切相关。前者让应用能够以标准方式判断消息是否被反复重投，后者则减少了不同应用服务器在配置方式上的差异。

如果把这篇和第一部分一起看，会更容易理解 JMS 2.0 的整体改进方向：第一部分偏向简化写法，第二部分则偏向增强消息处理能力和运行时配置能力。
