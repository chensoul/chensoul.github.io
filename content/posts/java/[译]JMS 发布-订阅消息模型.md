---
title: "[译]JMS 发布-订阅消息模型"
date: 2024-07-23T16:40:00+08:00
slug: jms-pub-sub-messaging-model
draft: false
categories: ["Java"]
tags: [ jms]
---

在本文中，您将了解 JMS 发布-订阅 (publish-subscribe) 消息传递模型。正如您在[JMS 简介文章](https://jstobigdata.com/jms/jms-introduction-java-message-service/)中所读到的，在发布/订阅模型中，客户端通过称为主题的中介将消息发送给多个接收者。发送者通常称为发布者，接收者称为订阅者。

## JMS 发布/订阅消息传递示例

下面是一个简单的代码示例，演示了发布/订阅消息模型的工作原理。我创建了 2 个主线程，`publisher`和`subscriber1`。将订阅者 1 克隆到`subscriber2`。所以基本上我有一个消息发布者和 2 个消息订阅者。链接至[GitHub](https://github.com/jstobigdata/jms-parent-app/blob/master/jms-glassfish5/src/main/java/lab03/message/pubsub/SimplePubSubExample.java) 。

```Java
package lab03.message.pubsub;

import labxx.common.settings.CommonSettings;
import javax.jms.*;

public class SimplePubSubExample {
  private static ConnectionFactory connectionFactory = null;
  private static Topic defaultTopic = null;
  static {
    connectionFactory = CommonSettings.getConnectionFactory();
    defaultTopic = CommonSettings.getDefautTopic();
  }

  public static void main(String[] args) {
    Thread publisher = new Thread(){
      @Override
      public void run(){
        try(JMSContext jmsContext = connectionFactory.createContext()) {
          Thread.sleep(1000);
          JMSProducer producer = jmsContext.createProducer();
          TextMessage message = jmsContext.createTextMessage("World needs to worry about the Climate changes");
          producer.send(defaultTopic, message);
        } catch (InterruptedException ex){
          ex.printStackTrace();
        }
      }
    };
  
    Thread subscriber1 = new Thread(){
      @Override
      public void run(){
        try(JMSContext jmsContext = connectionFactory.createContext()) {
          JMSConsumer consumer = jmsContext.createConsumer(defaultTopic);
          System.out.println("Message received: " + consumer.receive().getBody(String.class));
        } catch (JMSException e){
          e.printStackTrace();
        }
      }
    };
  
    Thread subscriber2 = new Thread(subscriber1);
    publisher.start();
    subscriber1.start();
    subscriber2.start();
  }
}
```



```Java
package labxx.common.settings;

import javax.jms.ConnectionFactory;
import javax.jms.Queue;
import javax.jms.Topic;
import javax.naming.InitialContext;
import javax.naming.NamingException;

public class CommonSettings {
  private static ConnectionFactory CONNECTION_FACTORY = null;
  private static Queue PTP_QUEUE = null;
  private static Topic PUB_SUB_TOPIC = null;
  private static Queue DEFAULT_REPLY_QUEUE = null;

  static {
    try {
      InitialContext initialContext = new InitialContext();
      CONNECTION_FACTORY = (ConnectionFactory) initialContext.lookup("jms/__defaultConnectionFactory");
      PTP_QUEUE = (Queue) initialContext.lookup("jms/PTPQueue");
      DEFAULT_REPLY_QUEUE = (Queue) initialContext.lookup("jms/ReplyQueue");
      PUB_SUB_TOPIC = (Topic) initialContext.lookup("jms/PubSubTopic");
    } catch (NamingException e) {
      e.printStackTrace();
    }
  }

  public static ConnectionFactory getConnectionFactory() {
    return CONNECTION_FACTORY;
  }
  public static Queue getDefaultQueue() {
    return PTP_QUEUE;
  }
  public static Queue getDefaultReplyQueue() {
    return DEFAULT_REPLY_QUEUE;
  }
  public static Topic getDefautTopic() {
    return PUB_SUB_TOPIC;
  }
}
```

**输出**

```
Message received: World needs to worry about the Climate changes
Message received: World needs to worry about the Climate changes
```

> **注意**： 所有发布/订阅系统通常都存在一定延迟，您编写的代码应该将延迟考虑在内。

## 普通消息订阅者的问题

普通消息订阅者（如上例中使用的订阅者）的问题在于，它不耐用。也就是说，如果消费者因某种原因宕机（关闭），则在恢复后它将无法接收先前的消息`Topic`。

让我们看看下面的代码，发布者发送了 7 条消息，而消费者只收到一条消息。一旦消费者关闭并重新创建，它就不会从主题中获取消息。链接至**[GitHub](https://github.com/jstobigdata/jms-parent-app/blob/master/jms-glassfish5/src/main/java/lab03/message/pubsub/NormalConsumerProblem.java)**。

```java
package lab03.message.pubsub;

import labxx.common.settings.CommonSettings;
import javax.jms.*;

public class NormalConsumerProblem {
  private static ConnectionFactory connectionFactory = null;
  private static Topic defaultTopic = null;

  static {
    connectionFactory = CommonSettings.getConnectionFactory();
    defaultTopic = CommonSettings.getDefautTopic();
  }

  public static void main(String[] args) {
    Thread publisher = new Thread() {
      @Override
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext()) {
          JMSProducer producer = jmsContext.createProducer();
          Thread.sleep(1000);
          for (int i = 1; i < 7; i++) {
            producer.send(defaultTopic, "Update " + i);
          }
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    };
  
    //Normal Consumer
    Thread consumer = new Thread() {
      @Override
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext()) {
          JMSConsumer consumer = jmsContext.createConsumer(defaultTopic);
          System.out.println(consumer.receive().getBody(String.class));
          Thread.sleep(2000);
          consumer.close();
          consumer = jmsContext.createConsumer(defaultTopic);
          for (int i = 1; i < 6; i++) {
            System.out.println(consumer.receive().getBody(String.class));
          }
        } catch (JMSException | InterruptedException e) {
          e.printStackTrace();
        }
      }
    };
    publisher.start();
    consumer.start();
  }
}
```

**输出**

```
Update 1
```

在实际场景中，您需要一种更可靠的方式来订阅主题。JMS 可以`DurableConsumer`解决这个问题。

## JMS 发布-订阅中的 DurableConsumer 示例

- 当必须接收某个主题的所有消息时，`DurableConsumer`应使用持久订阅者（）。
- JMS 确保在持久订阅者处于非活动状态时发布的消息由 JMS 保留，并在订阅者随后变为活动状态时进行传送。
- 当消费者在不活动时可以承受错过消息的后果时，将使用非持久订阅者。

下面的代码演示了 的用法`DurableConsumer`。与前面的示例不同，此处的消费者从 接收所有消息`topic`。链接至[GitHub](https://github.com/jstobigdata/jms-parent-app/blob/master/jms-glassfish5/src/main/java/lab03/message/pubsub/DurableConsumerExample.java)。

```java
package lab03.message.pubsub;

import labxx.common.settings.CommonSettings;
import javax.jms.*;

public class DurableConsumerExample {
  private static ConnectionFactory connectionFactory = null;
  private static Topic defaultTopic = null;

  static {
    connectionFactory = CommonSettings.getConnectionFactory();
    defaultTopic = CommonSettings.getDefautTopic();
  }

  public static void main(String[] args) {
    Thread publisher = new Thread() {
      @Override
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext()) {
          JMSProducer producer = jmsContext.createProducer();
          Thread.sleep(1000);
          for (int i = 1; i < 7; i++) {
            producer.send(defaultTopic, "Update " + i);
          }
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    };
  
    //Durable Consumer
    Thread durableConsumer = new Thread() {
      @Override
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext()) {
          jmsContext.setClientID("exampleApp");//important
          JMSConsumer consumer = jmsContext.createDurableConsumer(defaultTopic, "logConsumer");
          System.out.println(consumer.receive().getBody(String.class));
          Thread.sleep(2000);
          consumer.close();
          consumer = jmsContext.createDurableConsumer(defaultTopic, "logConsumer");
          for (int i = 1; i < 6; i++) {
            System.out.println(consumer.receive().getBody(String.class));
          }
        } catch (JMSException | InterruptedException e) {
          e.printStackTrace();
        }
      }
    };

    publisher.start();
    durableConsumer.start();
  }
}
```

**输出**

```
Update 1
Update 2
Update 3
Update 4
Update 5
Update 6
```

> **注意**： 设置 ClientID 很重要，这通常是订阅客户端应用程序的名称。另外，请记住设置名称，`durableConsumer`如第 38 行和第 42 行所示。

## SharedConsumer 进行负载平衡

在 JMS 2.0 中，多个订阅者可以监听一个主题，并且可以分配消息消费任务。有时，您可能需要对来自一个主题的多条消息进行负载平衡。这时您可以使用它来`SharedConsumer`分配消息消费负载。

下面的示例显示了创建`sharedConsumer`，请记住分配与第 37 行、第 38 行所示的相同的订阅者名称。代码链接至 [ GitHub](https://github.com/jstobigdata/jms-parent-app/blob/master/jms-glassfish5/src/main/java/lab03/message/pubsub/SharedConsumerExample.java)。

```Java
package lab03.message.pubsub;

import labxx.common.settings.CommonSettings;
import javax.jms.*;

public class SharedConsumerExample {
  private static ConnectionFactory connectionFactory = null;
  private static Topic defaultTopic = null;

  static {
    connectionFactory = CommonSettings.getConnectionFactory();
    defaultTopic = CommonSettings.getDefautTopic();
  }

  public static void main(String[] args) {
    Thread publisher = new Thread() {
      @Override
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext()) {
          JMSProducer producer = jmsContext.createProducer();
          Thread.sleep(1000);
          for (int i = 1; i < 7; i++) {
            producer.send(defaultTopic, "Update " + i);
          }
        } catch (InterruptedException e) {
          e.printStackTrace();
        }
      }
    };
   
    //Shared Consumer
    Thread sharedConsumer = new Thread() {
      @Override
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext()) {
          JMSConsumer sharedConsumer1 = jmsContext.createSharedConsumer(defaultTopic, "sharedSubscriber");
          JMSConsumer sharedConsumer2 = jmsContext.createSharedConsumer(defaultTopic, "sharedSubscriber");
          for (int i = 0; i < 3; i++) {
            System.out.println("Shared Consumer1: " + sharedConsumer1.receive().getBody(String.class));
            System.out.println("Shared Consumer2: " + sharedConsumer2.receive().getBody(String.class));
          }
          Thread.sleep(3000);
          sharedConsumer1.close();
          sharedConsumer2.close();
        } catch (JMSException | InterruptedException e) {
          e.printStackTrace();
        }
      }
    };

    publisher.start();
    sharedConsumer.start();
  }
}
```

**输出**

```
Shared Consumer1: Update 1
Shared Consumer2: Update 2
Shared Consumer1: Update 3
Shared Consumer2: Update 4
Shared Consumer1: Update 5
Shared Consumer2: Update 6
```

此外，您还可以使用 ，`SharedDurableConsumer`它能为您提供`DurableConsumer`和 的综合能力`SharedConsumer`。

## 异步消息订阅

我在 [JMS 点对点消息传递](https://jstobigdata.com/jms/jms-point-to-point-messaging-in-action/#asynchronous_message_listeners_in_jms) 文章中讨论了异步订阅。您可以使用相同的侦听器模式异步订阅主题。以下代码显示了异步消息订阅的一个简单示例。代码链接至[GitHub](https://github.com/jstobigdata/jms-parent-app/blob/master/jms-glassfish5/src/main/java/lab03/message/pubsub/AsyncPubSubExample.java)。

```java
package lab03.message.pubsub;

import labxx.common.settings.CommonSettings;
import javax.jms.*;

public class AsyncPubSubExample {
  private static ConnectionFactory connectionFactory = null;
  private static Topic defaultTopic = null;

  static {
    connectionFactory = CommonSettings.getConnectionFactory();
    defaultTopic = CommonSettings.getDefautTopic();
  }

  public static void main(String[] args) throws InterruptedException {
    try (JMSContext jmsContext = connectionFactory.createContext()) {
      JMSProducer producer = jmsContext.createProducer();
      JMSConsumer consumer = jmsContext.createConsumer(defaultTopic);
      consumer.setMessageListener(msg -> {
        try {
          System.out.println(msg.getBody(String.class));
        } catch (JMSException e) {
          e.printStackTrace();
        }
      });
      for (int i = 1; i < 7; i++) {
        producer.send(defaultTopic, "Message " + i);
      }
      Thread.sleep(1000);
      consumer.close();
    }
  }
}
```

**输出**

```
Message 1
Message 2
Message 3
Message 4
Message 5
Message 6
```

这些都是 JMS 发布-订阅消息模型的一部分，您已经清楚地了解了jms 发布/订阅中**主题**的使用。您了解了不同的消费者，例如 `SharedConsumer`、`SharedDurableConsumer`、`DurableConsumer`以及异步消息处理。请在下面的评论中分享您的想法。



原文链接：[JMS pub-sub messaging model](https://jstobigdata.com/jms/jms-pub-sub-messaging-model/)
