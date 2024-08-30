---
title: "[译]JMS 2.0 的十个好处意味着可以减少代码编写量"
date: 2024-07-24
slug: jms20-means-less-code
categories: ["Java"]
tags: [ jms]
---

原文链接：[Ten ways in which JMS 2.0 means writing less code](https://javaee.github.io/jms-spec/pages/JMS20MeansLessCode)

这里有十个简单的例子，说明 JMS 2.0 比 JMS 1.1 需要更少的代码。

## 单一 JMSContext 而不是单独的 Connection 和 Session 对象

JMS 2.0 简化 API 引入了一个新对象， `JMSContext` 它提供了与 JMS 1.1 API 中的分隔 `Connection` 对象 `Session` 相同的功能：

**JMS 1.1**

```java
Connection connection = connectionFactory.createConnection();
Session session = connection.createSession(false,Session.AUTO_ACKNOWLEDGE);
```

**JMS 2.0**

```java
JMSContext context = connectionFactory.createContext(JMSContext.SESSION_TRANSACTED);
```

## 使用 try-with-resources 块意味着不需要调用 close

使用后未能关闭`Connection`可能会导致您的应用程序耗尽资源。

**JMS 1.1**

在 JMS 1.1 中，确保使用后关闭连接的最佳方法是调用`close()`一个`finally`块：

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

这太冗长了。更糟糕的是，如果您在块主体中遇到异常`try`，然后在中遇到异常`close()`，则第一个异常将会丢失，即使第一个异常可能是失败的根本原因。

**JMS 2.0**

在 JMS 2.0 中，`Connection`对象实现了`java.lang.AutoCloseable`接口。这意味着，如果您`Connection` 在 try-with-resources 块中创建对象，则该`close`方法将在该块的末尾自动调用。

```java
try (Connection connection = connectionFactory.createConnection();){
  ... etc ...
} catch (JMSException ex) {
  ex.printStackTrace();
}
```

这需要更少的代码。此外，它还可以更好地处理异常：如果您在 try 块主体中遇到异常，随后在 中遇到异常`close()`，则第一个异常将很好地嵌套在第一个异常中，因此您可以轻松识别根本原因。

创建时可以使用相同的语法`JMSContext`。

## 在 Java SE 中创建会话时无需传递两个参数

你只需要一个：

**JMS 1.1**

```java
Session session = connection.createSession(true,Session.SESSION_TRANSACTED);
```

**JMS 2.0**

```java
Session session = connection.createSession(Session.SESSION_TRANSACTED);
```

有类似的方法可以创建`JMSContext`

## 在 Java EE 事务中创建会话时无需传递任何参数

如果您在 Java EE 事务中创建`Session`，则将忽略的参数`createSession`。EJB 3.1 规范中是这么说的。

**JMS 1.1**

但是 JMS 1.1 仍然要求您传递两个参数，即使它们会被忽略。

```java
// both parameters will be ignored; transactional behaviour is determined by the container
Session session = connection.createSession(false,Session.CLIENT_ACKNOWLEDGE);
```

**JMS 2.0**

JMS 2.0 提供了一种没有参数的方法：

```java
// transactional behaviour is determined by the container
Session session = connection.createSession();
```

## 新的 JMSProducer 对象支持方法链

新`JMSProducer`对象允许使用方法链在一行代码中指定消息头、消息属性和传递选项

**JMS 1.1**

```java
MessageProducer messageProducer = session.createProducer(demoQueue);
messageProducer.setPriority(1);
TextMessage textMessage = session.createTextMessage(body);
textMessage.setStringProperty("foo", "bar");
messageProducer.send(textMessage);
```

**JMS 2.0**

```java
TextMessage textMessage = context.createTextMessage(body); context.createProducer().setPriority(1).setProperty("foo", "bar").send(demoQueue, textMessage);
```

## 无需将 JMSProducer 保存在变量中；只需即时实例化即可

新`JMSProducer`对象是轻量级对象，因此无需将其保存在变量中；只需在需要时动态实例化一个即可

**JMS 1.1**

`MessageProducer`很贵所以需要重复使用。

```java
MessageProducer messageProducer = session.createProducer(demoQueue);
messageProducer.send(message1);
messageProducer.send(message2);
```

**JMS 2.0**

`JMSProducer`成本低廉，无需保存在变量中

```java
context.createProducer().send(demoQueue,message1);
context.createProducer().send(demoQueue,message2);
```

## 在 Java EE 中，注入 JMSContext 意味着您不需要创建或关闭它

**JMS 1.1**

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

**JMS 2.0**

```java
try {
  context.createProducer().send(inboundQueue, body);
} catch (JMSRuntimeException ex){
  ex.printStackTrace();
}
```

## 发送时不需要实例化Message对象

**JMS 1.1**

需要创建适当类型的消息对象，然后设置其正文：

```java
MessageProducer messageProducer = session.createProducer(demoQueue);
TextMessage textMessage = session.createTextMessage("Hello world");
messageProducer.send(textMessage);
```

**JMS 2.0**

在 JMS 2.0 中，只需将消息正文传递到`send`方法中：

```java
context.createProducer().send(demoQueue,"Hello world");
```

请注意，即使您想要设置消息属性，您也可以这样做，因为这些属性可以在 上设置`JMSProducer`。

## 同步接收，可直接接收消息载荷

**JMS 1.1**

当同步接收时，您会得到一个`Message`对象，并且需要将其转换为适当的子类型，然后才能提取其主体：

```java
MessageConsumer messageConsumer = session.createConsumer(demoQueue);
TextMessage textMessage = (TextMessage) messageConsumer.receive(1000);
if (textMessage==null){
  return "Received null";
} else {
  return "Received "+textMessage.getText();
}
```

**JMS 2.0**

JMS 2.0 允许您直接接收消息正文。

```java
JMSConsumer consumer = context.createConsumer(demoQueue);
return "Received " + consumer.receiveBody(String.class, 1000);
```

请注意缺少强制类型转换，或者特殊的空处理。

## 异步接收：提取消息正文之前无需进行强制转换。

**JMS 1.1**

异步接收消息时，传递给方法的消息`onMessage`是`javax.jms.Message`您需要将其转换为预期的子类型，然后才能提取正文。如果消息是 ，`ObjectMessage`这会为您提供一个`Serializable`正文，您必须再次将其转换为预期的正文类型。

```java
public void onMessage(Message m){
  MyObject myObj = (MyObject)((ObjectMessage)m).getObject();
    ...
```

**JMS 2.0**

一种新方法`getBody`允许您从中提取正文，而`Message`无需先将其转换为适当的子类型。这对于 ObjectMessages 特别方便，因为它避免了双重转换来提取对象有效负载

```
public void onMessage(Message m){
  MyObject myObj = m.getBody(MyObject.class);
    ...
```

## 相关页面

- [JMS 2.0 最终版本](https://javaee.github.io/jms-spec/pages/JMS20FinalRelease)
