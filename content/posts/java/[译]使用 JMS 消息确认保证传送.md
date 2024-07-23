---
title: "[译]使用 JMS 消息确认保证传送"
date: 2024-07-23T16:55:00+08:00
slug: guaranteed-delivery-using-jms-message-acknowledgement
draft: false
categories: ["Java"]
tags: [ jms]
---

JMS 通过 JMS 消息确认（确认模式）确保消息传递的可靠性。如果会话已进行事务处理，则该`commit()`方法会自动处理消息确认。否则，该方法将处理恢复`rollback()`。在本文中，我们将假设会话未进行事务处理。这是一个高级主题，请确保您对 JMS 有基本的了解。如果您是 JMS 新手，可以参考使用 JMS[发送和接收消息。](https://jstobigdata.com/jms/send-and-receive-message-in-jms/)

`JMS Client`会话未进行事务处理时使用消息确认。消息确认是在（JMS 生产者和 JMS 消费者）和之间建立的协议`JMS Server`。

JMS 提供三种确认选项，并且恢复是手动处理的。

1. **AUTO_ACKNOWLEDGE** – JMS 会话自动确认客户端已收到消息。不会发送重复消息。
2. **CLIENT_ACKNOWLEDGE** – JMS 客户端必须通过调用消息的`acknowledge()`方法来确认。
3. **DUPS_OK_ACKNOWLEDGE** – JMS 服务器可以放心地向 JMSConsumer 发送重复消息。客户端应用程序应该能够在此模式下处理重复消息。

## 1. JMS **AUTO_ACKNOWLEDGE**消息传递的实际操作

这是创建`Session`或时设置的默认确认模式`JMSContext`。您可以手动指定`AUTO_ACKNOWLEDGE`模式，如下所示。

```
JMSContext jmsContext = connectionFactory.createContext(JMSContext.AUTO_ACKNOWLEDGE);
```

在此模式下，当客户端成功从接收调用返回或其调用来处理消息的消息侦听器成功返回时，JMS 会话会自动确认客户端已收到消息。以下代码显示了此模式的用法。链接至[GitHub 代码库](https://github.com/jstobigdata/jms-parent-app/blob/master/jms-glassfish5/src/main/java/lab06/message/acknowledgement/AutoAcknowledgeExample.java)。

```Java
package lab06.message.acknowledgement;

import labxx.common.settings.CommonSettings;
import javax.jms.*;

public class AutoAcknowledgeExample {
  public static void main(String[] args) {
    ConnectionFactory connectionFactory = CommonSettings.getConnectionFactory();
    Queue queue = CommonSettings.getDefaultQueue();

    Thread messageproducer = new Thread() {
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext(JMSContext.AUTO_ACKNOWLEDGE)) {
          JMSProducer producer = jmsContext.createProducer();
          //Send the message
          Message message = jmsContext.createTextMessage("This is an AUTO_ACKNOWLEDGEMENT message");
          producer.send(queue, message);
        }
      }
    };

    Thread messageConsumer = new Thread() {
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext(JMSContext.AUTO_ACKNOWLEDGE)) {
          JMSConsumer consumer = jmsContext.createConsumer(queue);
          TextMessage msg = (TextMessage) consumer.receive();
          System.out.println("Received message: " + msg.getText());
        } catch (JMSException e) {
          e.printStackTrace();
        }
      }
    };
    messageConsumer.start();
    messageproducer.start();
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
Received message: This is an AUTO_ACKNOWLEDGEMENT message
```

## 2. JMS **CLIENT_ACKNOWLEDGE**消息传递的实际操作

当您将会话模式设置为 时`CLIENT_ACKNOWLEDGE`，客户端会通过调用其确认方法来确认消息。确认已使用的消息会自动确认已收到其会话已传送的所有消息。

下面的例子演示了上面讨论的相同要点。链接至[GitHub 代码库](https://github.com/jstobigdata/jms-parent-app/blob/master/jms-glassfish5/src/main/java/lab06/message/acknowledgement/ClientAcknowledgeExample.java)。

```Java
package lab06.message.acknowledgement;

import labxx.common.settings.CommonSettings;
import javax.jms.*;

public class ClientAcknowledgeExample {
  public static void main(String[] args) throws InterruptedException {
    ConnectionFactory connectionFactory = CommonSettings.getConnectionFactory();
    Queue queue = CommonSettings.getDefaultQueue();

    Thread messageproducer = new Thread() {
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext(JMSContext.CLIENT_ACKNOWLEDGE)) {
          JMSProducer producer = jmsContext.createProducer();
          //Send the message
          Message message = jmsContext.createTextMessage("This is a CLIENT_ACKNOWLEDGE message");
          producer.send(queue, message);
          message.acknowledge(); //This is Optional
        }catch (JMSException e) {
          e.printStackTrace();
        }
      }
    };

    Thread messageConsumer1 = new Thread() {
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext(JMSContext.CLIENT_ACKNOWLEDGE)) {
          JMSConsumer consumer = jmsContext.createConsumer(queue);
          TextMessage msg = (TextMessage) consumer.receive(3000);
          System.out.println("Received message: " + msg.getText());
        } catch (JMSException e) {
          e.printStackTrace();
        }
      }
    };
    Thread messageConsumer2 = new Thread(messageConsumer1);
    
    Thread messageConsumer3 = new Thread() {
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext(JMSContext.CLIENT_ACKNOWLEDGE)) {
          JMSConsumer consumer = jmsContext.createConsumer(queue);
          TextMessage msg = (TextMessage) consumer.receive();
          System.out.println("Received message: " + msg.getText());
          Thread.sleep(500);
          msg.acknowledge(); //Important
        } catch (JMSException | InterruptedException e) {
          e.printStackTrace();
        }
      }
    };

    messageproducer.start();
    messageConsumer1.start();
    messageConsumer3.start();
    Thread.sleep(1000);
    messageConsumer2.start();
  }
}
```

**输出**

```
Received message: This is a CLIENT_ACKNOWLEDGE message
Received message: This is a CLIENT_ACKNOWLEDGE message
Exception in thread "Thread-10" java.lang.NullPointerException
	at lab06.message.acknowledgement.ClientAcknowledgeExample$2.run(ClientAcknowledgeExample.java:33)
	at java.lang.Thread.run(Thread.java:748)
```

从上面的输出中可以看出，对于消息生产者来说，不需要确认消息。但作为一种良好做法，您应该始终确认（第 19 行）。

另一方面，`messageConsumer1`接收消息但不确认，因此不会从 JMS 服务器中删除该消息。因此，`messageConsumer3`能够接收相同的消息，但这次它确认了该消息，因此会从 JMS 服务器中删除该消息。因此，`messageConsumer2`不会收到该消息，并且会`NullPointerException`在发生超时时抛出。

## 3. JMS **DUPS_OK_ACKNOWLEDGE**消息传递的实际操作

在此模式下，JMS 服务器被告知要向消费者多次传递消息。这样做的好处是，服务器无需处理重复的消息传递。客户端应用程序需要能够容忍或足够智能地处理重复的消息。

> **注意**：这并不能保证出色的性能，请仅在经过适当测试并谨慎的情况下使用此模式。否则请坚持使用此**`AUTO_ACKNOWLEDGE`**模式。

这是[GitHub 代码库](https://github.com/jstobigdata/jms-parent-app/blob/master/jms-glassfish5/src/main/java/lab06/message/acknowledgement/DupsOkAcknowledgeExample.java)的链接。

```Java
package lab06.message.acknowledgement;

import labxx.common.settings.CommonSettings;
import javax.jms.*;

public class DupsOkAcknowledgeExample {
  public static void main(String[] args) {
    ConnectionFactory connectionFactory = CommonSettings.getConnectionFactory();
    Queue queue = CommonSettings.getDefaultQueue();

    Thread messageproducer = new Thread() {
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext()) {
          JMSProducer producer = jmsContext.createProducer();
          //Send the message
          Message message = jmsContext.createTextMessage("This is an DUPS_OK_ACKNOWLEDGE message");
          producer.send(queue, message);
        }
      }
    };

    Thread messageConsumer = new Thread() {
      public void run() {
        try (JMSContext jmsContext = connectionFactory.createContext(JMSContext.DUPS_OK_ACKNOWLEDGE)) {
          JMSConsumer consumer = jmsContext.createConsumer(queue);
          TextMessage msg = (TextMessage) consumer.receive();
          System.out.println("Received message: " + msg.getText());
        } catch (JMSException e) {
          e.printStackTrace();
        }
      }
    };

    messageConsumer.start();
    messageproducer.start();
  }
}
```

**输出**

```
Received message: This is an DUPS_OK_ACKNOWLEDGE message
```

在上面的代码示例中，第 14 行未指定确认模式，因此消费者使用的是 **AUTO_ACKNOWLEDGE** 模式。生产者和订阅者可以使用不同的确认模式。

实际上，您很可能会坚持使用 **AUTO_ACKNOWLEDGE** 模式。但是，深入了解其他模式也总是好的。这都是 JMS 消息确认的一部分，使用它来确保有保证的消息传递。
