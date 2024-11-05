---
title: "JMS速成课程"
date: 2024-08-07
type: post
slug: a-crash-course-on-jms
draft: true
categories: ["Java"]
tags: [ jms]
---

## JMS 介绍

### 什么是消息传递？

消息传递是一种通信机制，允许不同的应用程序或系统组件之间通过发送和接收消息来进行数据交换。消息通常是其他应用程序或服务使用的**异步请求、响应、报告或事件**。

这种机制在分布式系统中尤其重要，因为它允许组件在没有直接连接或了解彼此内部实现细节的情况下进行交互。

以下是消息传递的一些关键特点：

1. **解耦**：消息发送者（生产者）和接收者（消费者）不需要同时在线或直接连接。它们通过消息队列或消息代理进行通信，从而实现了生产者和消费者之间的解耦。
2. **异步通信**：消息传递通常是异步的，这意味着发送者发送消息后可以继续执行其他任务，而不需要等待接收者的响应。
3. **可靠性**：许多消息传递系统提供了消息的持久化存储和传递保证，确保即使在系统故障的情况下，消息也不会丢失。
4. **灵活性**：消息可以包含不同类型的数据，如文本、二进制数据或序列化的对象。
5. **可扩展性**：消息传递系统可以处理大量消息和多个生产者和消费者，支持系统的水平扩展。
6. **多种通信模式**：支持点对点（一对一）和发布/订阅（一对多或多对多）通信模式。
7. **事务性**：在需要的情况下，消息传递可以支持事务性操作，确保消息的发送和接收是原子性的。
8. **过滤和路由**：消息传递系统可以基于特定的规则或条件对消息进行过滤和路由，以确保消息被正确地分发到目标接收者。
9. **安全性**：消息传递系统通常提供安全机制，如消息加密、认证和授权，以保护消息的完整性和隐私。

消息传递在许多领域都有应用，包括企业应用集成、金融服务、物联网（IoT）、在线游戏、实时数据流处理等。常见的消息传递技术包括 JMS（Java Message Service）、AMQP（Advanced Message Queuing Protocol）、MQTT（Message Queuing Telemetry Transport）等。

### 使用消息中间件的优点

使用消息中间件（Message-Oriented Middleware, MOM）具有以下优点：

1. **解耦**：消息中间件允许应用程序组件之间通过消息进行通信，而不需要直接调用对方的接口。这降低了系统组件之间的耦合度，使得它们可以独立开发和部署。
2. **异步通信**：消息传递通常是异步的，发送者发送消息后不需要等待接收者的响应即可继续执行其他任务，这有助于提高系统的整体性能和响应能力。
3. **可扩展性**：消息中间件支持分布式部署，可以轻松地在多个节点或服务器上扩展消息处理能力，以应对日益增长的消息量和用户请求。
4. **可靠性**：许多消息中间件提供了消息持久化功能，确保在系统故障时消息不会丢失。此外，它们还提供了消息确认机制，确保消息被正确处理。
5. **灵活性和多样性**：消息中间件支持多种消息模式，如点对点和发布/订阅，以及多种消息传递协议，如AMQP、MQTT等，适应不同的业务场景和通信需求。
6. **负载均衡**：在分布式系统中，消息中间件可以将消息分发到多个消费者，实现负载均衡，避免单个节点过载。
7. **高可用性**：通过集群和冗余机制，消息中间件可以提高系统的可用性，确保消息服务在部分节点失败时仍可继续运行。
8. **跨平台和语言无关性**：消息中间件通常支持多种编程语言和平台，允许使用不同技术栈的系统之间进行通信。
9. **简化系统设计**：使用消息中间件可以简化系统设计，因为开发者不需要关心底层的通信细节，只需关注消息的发送和接收逻辑。
10. **增强安全性**：消息中间件提供了安全机制，如认证、授权、数据加密和SSL/TLS传输，保护消息在传输过程中的安全。
11. **易于监控和维护**：许多消息中间件提供了管理界面和监控工具，使得系统管理员可以方便地监控系统状态、跟踪消息流动和进行维护。
12. **支持多种业务场景**：无论是简单的任务队列、复杂的事件驱动架构，还是大规模的分布式系统，消息中间件都能够提供支持。

### 什么是 JMS

JMS（Java Message Service）是一个Java平台中的消息服务API，它允许应用程序组件基于消息进行通信，而无需直接的网络编程。JMS提供了一种方式，使得分布式系统中的应用程序能够发送和接收消息，这些消息可以是文本、数据或对象。

JMS定义了几种消息类型，包括：

1. **点对点消息**：发送者发送消息到一个队列（Queue），接收者从队列中取出消息。这种方式下，消息只会被一个消费者接收。
2. **发布/订阅消息**：消息被发送到一个主题（Topic），多个订阅者可以订阅这个主题，当消息发布时，所有订阅者都会接收到消息。

JMS还定义了几种消息传递模式：

- **同步消息**：发送者发送消息后，会等待消息被成功接收或失败的响应。
- **异步消息**：发送者发送消息后，不会等待响应，消息的接收由另一个线程处理。

JMS广泛应用于企业应用集成（EAI）、B2B通信、消息代理和消息导向中间件（MOM）等场景。它支持多种消息传递协议，如AMQP、MQTT等，并且与J2EE（Java 2 Enterprise Edition）紧密集成，支持事务处理和安全性。

### JMS 发展历史

JMS (Java Message Service) 的发展历史可以分为以下几个主要阶段:

1. **初期阶段 (1998-2001)**：
   - 1998 年，Sun Microsystems 发布了 JMS 1.0 版本,作为 J2EE 1.2 规范的一部分。
   - JMS 1.0 定义了两种消息传递模型：点对点和发布-订阅。
   - 主要的 JMS 实现包括 IBM WebSphere MQ、TIBCO Enterprise Message Service 和 SonicMQ。
2. **稳定发展阶段 (2002-2005)**：
   - 2002 年，JMS 1.1 版本发布，进一步完善了标准，增加了对 XA 事务的支持。
   - 这一阶段 JMS 技术得到了广泛应用，成为企业级 Java 应用程序中重要的消息传递机制。
   - 主要实现包括 Apache ActiveMQ、RabbitMQ 和 Oracle AQ。
3. **云计算时代 (2006-2015)**：
   - 随着云计算的兴起，JMS 逐渐面临新的挑战，如扩展性、弹性和容器化等需求。
   - 一些新的消息传递技术如 Apache Kafka、AMQP 和 MQTT 开始出现，提供了更好的云原生支持。
   - JMS 实现也开始向云计算环境迁移，如 Amazon SQS、Google Cloud Pub/Sub 等。
4. **JMS 2.0 时代 (2013-现在)**：
   - 2013 年，JMS 2.0 版本发布，对 JMS 标准进行了重大升级。
   - JMS 2.0 主要包括以下新特性：简化 API、增强的消息类型、流式 API、异步回调、XA 事务增强、资源自动关闭等。
   - JMS 2.0 的目标是简化开发、提高效率，以更好地适应现代 Java 应用程序的需求。
5. **现代化阶段 (2016-现在)**：
   - 为了适应云原生环境，JMS 实现也在向微服务架构和容器化等方向发展。

### JMS 标准的局限性

JMS（Java Message Service）作为Java EE平台的一部分，提供了一个消息服务的标准API，但它也有一些局限性：

1. **平台依赖性**：JMS是Java平台特定的，这意味着它不是语言无关的。这限制了使用JMS与其他非Java系统进行互操作的能力。
2. **供应商依赖性**：JMS 是一个标准，但是具体的实现是由不同的消息中间件供应商提供的，如 ActiveMQ、RabbitMQ、Apache Kafka 等。这意味着应用程序无法在不同的 JMS 实现之间轻松迁移，因为每个实现都有自己的特定特性和 API。
3. **缺乏互操作性**：不同 JMS 供应商的实现之间存在一定的差异，这限制了跨供应商的消息交换。虽然 JMS 定义了一个 API 标准，但并没有定义一个标准的消息格式,这使得不同 JMS 实现之间的消息交换变得困难。
4. **功能有限**：JMS 标准主要关注于异步消息传递,而对于更复杂的消息处理场景，如消息转换、消息路由等,支持并不完善。开发人员需要依赖特定供应商的扩展功能来满足这些需求。
5. **性能问题**：由于 JMS 标准的设计目标是可靠性和易用性，而非高性能,因此在某些高并发、高吞吐量的场景下，JMS 可能无法满足性能要求。
6. **缺乏云原生支持**：随着云计算的兴起，JMS 标准并没有很好地适应云原生环境，如扩展性、弹性、容器化等方面的需求。这使得 JMS 在云环境中的应用受到限制。

## 为 JMS 安装和配置 ActiveMQ

### 安装 ActiveMQ 

在安装 ActiveMQ 之前，需要知道 ActiveMQ 各个版本的区别。

下面表格是来自官方的版本对比：

| Series | Broker JMS API Support      | Client JMS API Client       | Java Version | Spring Version | Logging Support              | Web Support            | Status       | Last    | Next   | ETA    |
| ------ | --------------------------- | --------------------------- | ------------ | -------------- | ---------------------------- | ---------------------- | ------------ | ------- | ------ | ------ |
| 6.2.x  | Jakarta JMS 2/3.1 (partial) | Jakarta JMS 2/3.1           | 17+          | 6.1.5          | Log4j 2.23.1/Slf4j 2.0.12    | Jetty 11.0.20          | In dev       |         |        | Jul 24 |
| 6.1.x  | Jakarta JMS 2/3.1 (partial) | Jakarta JMS 2/3.1           | 17+          | 6.1.5          | Log4j 2.23.1/Slf4j 2.0.12    | Jetty 11.0.20          | **Stable**   | 6.1.2   | 6.1.3  | Jun 24 |
| 6.0.x  | Jakarta JMS 2/3.1 (partial) | Jakarta JMS 2/3.1           | 17+          | 6.0.17         | Log4j 2.22.0/Slf4j 2.0.9     | Jetty 11.0.18          | *Not Active* | 6.0.1   |        |        |
| 5.18.x | Javax JMS 1.1               | Javax JMS 1.1/Jakarta JMS 2 | 11+          | 5.3.37         | Log4j 2.23.1/Slf4j 2.0.13    | Jetty 9.4.55.v20240627 | **Stable**   | 5.18.5  | 5.18.6 | Oct 24 |
| 5.17.x | Javax JMS 1.1               | Javax JMS 1.1               | 11+          | 5.3.30         | Log4j 2.20.0/Slf4j 1.7.36    | Jetty 9.4.53.v20231009 | *Not Active* | 5.17.6  |        |        |
| 5.16.x | Javax JMS 1.1               | Javax JMS 1.1               | 1.8          | 4.3.30.RELEASE | Reload4j 1.2.24/Slf4j 1.7.26 | Jetty 9.4.50.v20221201 | *Not Active* | 5.16.7  |        |        |
| 5.15.x | Javax JMS 1.1               | Javax JMS 1.1               | 1.8          | 4.3.30.RELEASE | Log4j 1.2.17/Slf4j 1.7.32    | Jetty 9.4.39.v20210325 | *Not Active* | 5.15.16 |        |        |
| 5.14.x | Javax JMS 1.1               | Javax JMS 1.1               | 1.7          | 4.1.9.RELEASE  | Log4j 1.2.17/Slf4j 1.7.13    | Jetty 9.2.13.v20150730 | *Not Active* | 5.14.5  |        |        |
| 5.13.x | Javax JMS 1.1               | Javax JMS 1.1               | 1.7          | 4.1.9.RELEASE  | Log4j 1.2.17/Slf4j 1.7.13    | Jetty 9.2.13.v20150730 | *Not Active* | 5.13.5  |        |        |
| 5.12.x | Javax JMS 1.1               | Javax JMS 1.1               | 1.7          | 3.2.16.RELEASE | Log4j 1.2.17/Slf4j 1.7.10    | Jetty 9.2.6.v20141205  | *Not Active* | 5.12.3  |        |        |
| 5.11.x | Javax JMS 1.1               | Javax JMS 1.1               | 1.7          | 3.2.16.RELEASE | Log4j 1.2.17/Slf4j 1.7.10    | Jetty 9.2.6.v20141205  | *Not Active* | 5.11.4  |        |        |
| 5.10.x | Javax JMS 1.1               | Javax JMS 1.1               | 1.6          | 3.2.8.RELEASE  | Log4j 1.2.17/Slf4j 1.7.5     | Jetty 7.6.9.v20130131  | *Not Active* | 5.10.2  |        |        |

清楚了不同版本之间的区别之后，可以参考 《[ActiveMQ安装和使用](/posts/2024/07/05/install-activemq/)》这篇文章来安装 ActiveMQ。我这里使用 docker-compose 来快速安装 ActiveMQ：

```yaml
services:
  activemq:
    image: apache/activemq-classic:5.18.4
    environment:
      - "TZ=Asia/Shanghai"
    volumes:
      - activemq_data:/opt/apache-activemq/data
    ports:
      - "61616:61616"
      - "8161:8161"

volumes:
  activemq_data:
```

我选择的 ActiveMQ 版本是 5.18.4，其要求 **Java** 版本必须在 11 以上。

### 配置 IDE

有代码示例均可在 [GitHub](https://github.com/chensoul/jms-parent-app) 上下载。或者，您可以按照以下步骤创建一个具有下面列出的依赖项的 Maven 项目。

#### 创建一个 Maven 项目

在你的 IDE（Eclipse、STS 或 IntelliJ）中创建一个 maven 项目。

打开`pom.xml`并设置正确的 Java 版本。因为安装的  ActiveMQ 版本是 5.18.4，所以我在这个项目中使用 JDK 21。

```xml
<properties>
    <maven.compiler.target>21</maven.compiler.target>
    <maven.compiler.source>21</maven.compiler.source>
    <java.version>21</java.version>
</properties>
```

#### 在 pom.xml 中添加 JMS 依赖项

添加 activemq-client 依赖，版本为 5.18.4；添加`junit-jupitor-api`用于运行单元测试。

```xml
  <dependencies>
      <dependency>
          <groupId>org.apache.activemq</groupId>
          <artifactId>activemq-client</artifactId>
          <version>5.18.4</version>
      </dependency>
      <dependency>
          <groupId>org.junit.jupiter</groupId>
          <artifactId>junit-jupiter-api</artifactId>
          <version>5.2.0</version>
      </dependency>
  </dependencies>
```

#### 创建 jndi.properties 文件

创建一个用于 JNDI 查找的文件`src\main\resources\jndi.properties`，在此文件中添加 JMS 相关配置：

```properties
# https://activemq.apache.org/components/classic/documentation/jndi-support
java.naming.factory.initial=org.apache.activemq.jndi.ActiveMQInitialContextFactory
java.naming.provider.url=tcp://127.0.0.1:61616
connectionFactoryNames=jms/__defaultConnectionFactory
queue.jms/PTPQueue=PTPQueue
queue.jms/ReplyQueue=ReplyQueue
topic.jms/PubSubTopic=PubSubTopic
```

您还可以从 GitHub 下载整个[代码示例](https://github.com/chensoul/jms-parent-app)。

## JMS 规范

JMS（Java Message Service）是Java平台上的一种技术规范，它定义了一套标准的API，允许Java应用程序创建、发送、接收和读取消息。[JMS规范](https://javaee.github.io/jms-spec/) 的主要目的是简化企业应用的开发，通过提供与具体平台无关的API，使得应用程序能够进行异步通信，实现分布式系统中的松耦合、可靠和异步的消息传递。

JMS 相关链接：

- [Java Message Service Specification](https://javaee.github.io/jms-spec/)

- [API 和规范源码仓库](https://github.com/javaee/jms-spec)

- [JMS 实现 Open MQ](https://javaee.github.io/openmq/)
- [JMS 1.1 规范下载](https://download.oracle.com/otndocs/jcp/7195-jms-1.1-fr-spec-oth-JSpec/)
- [JMS 2.0 规范下载](https://download.oracle.com/otndocs/jcp/jms-2_0_rev_a-mrel-eval-spec/index.html)
- [JMS 2.1 规范下载](https://download.oracle.com/otndocs/jcp/jms-2_1-edr-spec/index.html)



### JMS 1.1 规范

#### 引言

JMS为Java程序提供了一种通用的方式来创建、发送、接收和读取企业消息系统的消息。

JMS是一组接口和相关语义，定义了JMS客户端如何访问企业消息产品的设施。

JMS定义了一组通用的企业消息概念和设施。

- JMS提供者：JMS提供者是实现JMS的实体，用于消息产品。理想情况下，JMS提供者将用100%纯Java编写。JMS的一个重要目标是最小化实现提供者所需的工作量。
- JMS消息：JMS定义了一组消息接口。客户端使用其JMS提供者提供的消息实现。JMS的一个主要目标是客户端拥有一个一致的API，用于创建和使用消息，该API独立于JMS提供者。
- JMS域
  - 点对点（PTP）产品围绕消息队列的概念构建。每条消息都被发送到一个特定的队列；客户端从队列中提取消息。
  - 发布和订阅（Pub/Sub）客户端将消息地址发送到内容层次结构中的某个节点。发布者和订阅者通常是匿名的，可以动态地发布或订阅内容层次结构。系统负责将来自节点的多个发布者的消息分发到其多个订阅者。
- 可移植性：主要的可移植性目标是新的、仅JMS的应用程序可以在同一个消息域内的产品之间移植。



JMS不涉及以下功能：

- 负载均衡/容错 - 许多产品提供支持多个合作客户端实现关键服务。JMS API没有指定这些客户端如何合作以表现为一个统一的服务。
- 错误/咨询通知 - 大多数消息产品定义了系统消息，这些消息为客户端提供问题或系统事件的异步通知。JMS不尝试标准化这些消息。通过遵循JMS定义的指南，客户端可以避免使用这些消息，从而防止其使用引入的可移植性问题。
- 管理 - JMS没有定义管理消息产品的API。
- 安全性 - JMS没有指定用于控制消息隐私和完整性的API。它也没有指定如何将数字签名或密钥分发给客户端。安全性被认为是JMS提供者特定的功能，由管理员配置，而不是通过JMS API由客户端控制。
- 协议 - JMS没有为消息定义协议。
- 消息类型仓库 - JMS没有定义用于存储消息类型定义的仓库，也没有定义创建消息类型定义的语言。

#### 架构

1、JMS应用程序

JMS应用程序由以下部分组成：

- **JMS客户端** (JMS Clients)：这些是发送和接收消息的Java语言程序。
- **非JMS客户端** (Non-JMS Clients)：这些客户端使用消息系统的原生客户端API，而不是JMS。如果应用程序在JMS可用之前就已经存在，那么它很可能同时包含JMS和非JMS客户端。
- **消息** (Messages)：每个应用程序定义了一组用于客户端之间通信的消息。
- **JMS提供者** (JMS Provider)：这是一个实现JMS的消息系统，除了JMS之外，还提供其他管理和控制功能。
- **管理对象** (Administered Objects)：由管理员为客户端使用而预配置的JMS对象。



2、管理

管理员将管理对象放置在JNDI命名空间中。JMS客户端通常在其文档中注明它需要的JMS管理对象以及如何向其提供这些对象的JNDI名称。

有两种类型的JMS管理对象：

- **连接工厂** (ConnectionFactory)：客户端使用此对象与提供者创建连接。
- **目的地** (Destination)：客户端使用此对象指定发送消息的目的地和接收消息的来源。



3、JMS 接口

| **JMS Common Interfaces** | **PTP-specific Interfaces** | **Pub/Sub-specific interfaces** |
| ------------------------- | --------------------------- | ------------------------------- |
| ConnectionFactory         | QueueConnectionFactory      | TopicConnectionFactory          |
| Connection                | QueueConnection             | TopicConnection                 |
| Destination  | Queue                       | Topic                           |
| Session                   | QueueSession                | TopicSession                    |
| MessageProducer           | QueueSender                 | TopicPublisher                  |
| MessageConsumer           | QueueReceiver, QueueBrowser | TopicSubscriber                 |



4、开发 JMS 应用

一个典型的JMS客户端执行以下JMS设置程序：

- 使用JNDI查找ConnectionFactory对象。
- 使用JNDI查找一个或多个Destination对象。
- 使用ConnectionFactory创建一个JMS连接，禁止消息传递。
- 使用连接创建一个或多个JMS会话。
- 使用会话和目的地创建所需的MessageProducers和MessageConsumers。
- 告诉连接开始传递消息。



5、安全性

JMS不提供控制或配置消息完整性或消息隐私的功能。预计许多JMS提供者将提供这些功能。同样预计，这些服务的配置将由提供者特定的管理工具处理。客户端将作为它们使用的管理对象的一部分获得适当的安全配置。



6、多线程

JMS本可以要求其所有对象都支持并发使用。由于支持并发访问通常会增加一些开销和复杂性，JMS设计限制了对那些自然会被多线程客户端共享的对象的并发访问要求。其余的对象被设计为一次只能被一个逻辑线程控制访问。

限制对会话的并发访问有两个原因。首先，会话是支持事务的JMS实体。实现多线程事务非常困难。其次，会话支持异步消息消费。

| **JMS Object**    | **Supports Concurrent Use** |
| ----------------- | --------------------------- |
|Destination       | YES                         |
|ConnectionFactory | YES                         |
|Connection        | YES                         |
|Session           | NO                          |
|MessageProducer   | NO                          |
|MessageConsumer   | NO                          |

#### JMS 消息模型

1、JMS消息

JMS消息由以下部分组成：

- **消息头** (Header)：所有消息都支持相同的一组消息头字段。这些字段包含用于识别和路由消息的值。
- **属性**(Properties)：除了标准消息头字段，消息还提供了一个内置的机制，用于向消息添加可选的头字段。
  - 应用程序特定的属性：提供一种机制，用于向消息添加应用程序特定的头字段。
  - 标准属性：JMS定义了一些标准属性，实际上是可选的头字段。
  - 提供者特定的属性：集成JMS客户端与JMS提供者原生客户端可能需要使用提供者特定的属性。JMS为此定义了命名约定。
- **消息体** (Body)：JMS定义了几种消息体类型，涵盖了目前使用的大多数消息风格。



2、消息头字段

消息头字段：消息的完整头部被传输到接收消息的所有JMS客户端。

- **JMSDestination**：消息被发送到的目的地。
- **JMSDeliveryMode**：发送消息时指定的传输模式。
- **JMSMessageID**：唯一标识每条消息的值。
- **JMSTimestamp**：消息被交给提供者发送的时间。
- **JMSCorrelationID**：用于将一个消息与另一个消息链接的字段。
- **JMSReplyTo**：指定消息回复应该发送到的目的地。
- **JMSRedelivered**：指示消息是否已经被重新传递的字段。
- **JMSType**：消息类型标识符。
- **JMSExpiration**：消息的过期时间。
- **JMSPriority**：消息的优先级。0-9，从低到高。

对消息头信息如何被设置的总结：

| Header Fields    | Set By      |
| ---------------- | ----------- |
| JMSDestination   | Send Method |
| JMSDeliveryMode  | Send Method |
| JMSExpiration    | Send Method |
| JMSPriority      | Send Method |
| JMSMessageID     | Send Method |
| JMSTimestamp     | Send Method |
| JMSCorrelationID | Client      |
| JMSReplyTo       | Client      |
| JMSType          | Client      |
| JMSRedelivered   | Provider    |

3、消息属性

消息属性：

- **属性名称** (Property Names)：属性名称必须遵守消息选择器标识符的规则。
- **属性值** (Property Values)：属性值可以是布尔值、字节、短整型、整型、长整型、浮点型、双精度浮点型和字符串。
- **使用属性** (Using Properties)：属性值在发送消息之前设置。当客户端接收到消息时，其属性处于只读模式。



4、消息确认

所有JMS消息都支持确认方法，用于客户端明确指定JMS消费者的消息需要显式确认的情况。



5、消息接口

Message接口是所有JMS消息的根接口。它定义了所有消息的JMS消息头字段、属性机制和用于所有消息的确认方法。

### JMS 2.0 规范

### JMS 源码分析

#### ConnectionFactory

ConnectionFactory 是 Jakarta Messaging 管理对象，封装了一组由管理员定义的连接配置参数，支持**并发使用**。客户端使用它来与 Jakarta Messaging 提供程序建立连接。

ConnectionFactory 管理对象并不明确依赖于 Java 命名和目录接口 (JNDI) API，但 Jakarta Messaging API 建立了一种约定，即 Jakarta Messaging 客户端通过在 JNDI 命名空间中查找管理对象来找到它们。

Jakarta Messaging 提供程序对受管理对象的实现应同时为javax. jndi. Referenceable和java. io. Serializable ，以便它们可以存储在所有 JNDI 命名上下文中。此外，建议这些实现遵循 JavaBeans TM设计模式。

此策略有以下几个好处：

- 它向 Jakarta Messaging 客户端隐藏了提供商特定的详细信息。
- 它将管理信息抽象为 Java 编程语言中的对象（“Java 对象”），这些对象可以通过通用管理控制台轻松地进行组织和管理。
- 由于所有流行的命名服务都会有 JNDI 提供程序，这意味着 Jakarta Messaging 提供程序可以提供一种可在任何地方运行的管理对象的实现。

受管理对象不应保留任何远程资源。其查找不应使用 JNDI API 本身使用的远程资源以外的资源。

客户端应将受管理对象视为本地 Java 对象。查找它们不应产生任何隐藏的副作用或使用大量本地资源

```java
//@since JMS 1.0
public interface ConnectionFactory {
		//@since JMS 1.1
    Connection createConnection() throws JMSException;

   	//@since JMS 1.1
    Connection createConnection(String userName, String password) throws JMSException;

 		//@since JMS 2.0
    JMSContext createContext();

   	//@since JMS 2.0
    JMSContext createContext(String userName, String password);

		//@since JMS 2.0
    JMSContext createContext(String userName, String password, int sessionMode);

  	//@since JMS 2.0
    JMSContext createContext(int sessionMode);

}

public interface QueueConnectionFactory extends ConnectionFactory {
    QueueConnection createQueueConnection() throws JMSException;
    QueueConnection createQueueConnection(String userName, String password) throws JMSException;
}

public interface TopicConnectionFactory extends ConnectionFactory {
    TopicConnection createTopicConnection() throws JMSException;
    TopicConnection createTopicConnection(String userName, String password) throws JMSException;
}

public interface XAConnectionFactory {
    XAConnection createXAConnection() throws JMSException;

    XAConnection createXAConnection(String userName, String password) throws JMSException;

  	//@since JMS 2.0
    XAJMSContext createXAContext();

  	//@since JMS 2.0
    XAJMSContext createXAContext(String userName, String password);
}

public interface XAQueueConnectionFactory extends XAConnectionFactory, QueueConnectionFactory {
    XAQueueConnection createXAQueueConnection() throws JMSException;

    XAQueueConnection createXAQueueConnection(String userName, String password) throws JMSException;
}

public interface XATopicConnectionFactory extends XAConnectionFactory, TopicConnectionFactory {
    XATopicConnection createXATopicConnection() throws JMSException;

    XATopicConnection createXATopicConnection(String userName, String password) throws JMSException;
}
```

方法：

- `createConnection()`：
  - 该方法用于创建一个新的 `Connection` 对象，该连接使用默认的用户名和密码进行身份验证。
  - 如果创建连接时出现任何异常,该方法会抛出 `JMSException`。
- `createConnection(String userName, String password)`:
  - 该方法也用于创建一个新的 `Connection` 对象，但需要指定用户名和密码进行身份验证。
  - 如果创建连接时出现任何异常，该方法也会抛出 `JMSException`。
- `createContext()`：
  - `JMSContext` 对象封装了 `Connection`、`Session` 和 `MessageProducer`/`MessageConsumer` 的创建和管理，提供了一个更简单的 API。
- `createContext(String userName, String password)`:
  - 该方法用于创建一个带有指定用户名和密码的 `JMSContext` 对象。
- `createContext(String userName, String password, int sessionMode)`:
  - 该方法用于创建一个带有指定用户名、密码和会话模式的 `JMSContext` 对象。
  - 会话模式可以是 `Session.AUTO_ACKNOWLEDGE`、`Session.CLIENT_ACKNOWLEDGE` 等。

ConnectionFactory 在 1.1 提供了 createConnection 方法将 Connection对象，该方法抛出 JMSException 受检异常；在 2.0 提供了 createContext 方法创建 JMSContext 对象 ，该方法抛出 JMSRuntimeException 运行时异常。

与 JMS 1.0 相比，JMS 2.0 引入了 `JMSContext` 接口，它提供了一个更简单和集成的 API，使得应用程序可以更方便地管理连接、会话和消息生产/消费。

#### Connection

```java
public interface Connection extends AutoCloseable {

    //@since JMS 1.1
    Session createSession(boolean transacted, int acknowledgeMode) throws JMSException;

    //@since JMS 2.0
    Session createSession(int sessionMode) throws JMSException;

    //@since JMS 2.0
    Session createSession() throws JMSException;

    String getClientID() throws JMSException;
    void setClientID(String clientID) throws JMSException;
   
    ConnectionMetaData getMetaData() throws JMSException;

    ExceptionListener getExceptionListener() throws JMSException;
    void setExceptionListener(ExceptionListener listener) throws JMSException;

    void start() throws JMSException;
    void stop() throws JMSException;

    @Override
    void close() throws JMSException;

  	//@since JMS 1.1
    ConnectionConsumer createConnectionConsumer(Destination destination, String messageSelector, ServerSessionPool sessionPool, int maxMessages) throws JMSException;

    //@since JMS 2.0
    ConnectionConsumer createSharedConnectionConsumer(Topic topic, String subscriptionName, String messageSelector, ServerSessionPool sessionPool, int maxMessages) throws JMSException;

    //@since JMS 1.1
    ConnectionConsumer createDurableConnectionConsumer(Topic topic, String subscriptionName, String messageSelector, ServerSessionPool sessionPool, int maxMessages) throws JMSException;

    //@since JMS 2.0
    ConnectionConsumer createSharedDurableConnectionConsumer(Topic topic, String subscriptionName, String messageSelector, ServerSessionPool sessionPool, int maxMessages) throws JMSException;
}

public interface TopicConnection extends Connection {
    TopicSession createTopicSession(boolean transacted, int acknowledgeMode) throws JMSException;

    ConnectionConsumer createConnectionConsumer(Topic topic, String messageSelector, ServerSessionPool sessionPool, int maxMessages) throws JMSException;

    @Override
    ConnectionConsumer createDurableConnectionConsumer(Topic topic, String subscriptionName, String messageSelector, ServerSessionPool sessionPool,
            int maxMessages) throws JMSException;
}

public interface QueueConnection extends Connection {
    QueueSession createQueueSession(boolean transacted, int acknowledgeMode) throws JMSException;

    ConnectionConsumer createConnectionConsumer(Queue queue, String messageSelector, ServerSessionPool sessionPool, int maxMessages) throws JMSException;
}


public interface XAConnection extends Connection {
    XASession createXASession() throws JMSException;

    @Override
    Session createSession(boolean transacted, int acknowledgeMode) throws JMSException;
}

public interface XAQueueConnection extends XAConnection, QueueConnection {
    XAQueueSession createXAQueueSession() throws JMSException;

    @Override
    QueueSession createQueueSession(boolean transacted, int acknowledgeMode) throws JMSException;
}

public interface XATopicConnection extends XAConnection, TopicConnection {
    XATopicSession createXATopicSession() throws JMSException;
  
    @Override
    TopicSession createTopicSession(boolean transacted, int acknowledgeMode) throws JMSException;
}

```

#### Session

Session 接口用于创建和管理 JMS 应用程序中的消息生产和消费。

```java
public interface Session extends AutoCloseable {
    int AUTO_ACKNOWLEDGE = 1;
    int CLIENT_ACKNOWLEDGE = 2;
    int DUPS_OK_ACKNOWLEDGE = 3;
    int SESSION_TRANSACTED = 0;

    BytesMessage createBytesMessage() throws JMSException;
    MapMessage createMapMessage() throws JMSException;
    Message createMessage() throws JMSException;
    ObjectMessage createObjectMessage() throws JMSException;
    ObjectMessage createObjectMessage(Serializable object) throws JMSException;
    StreamMessage createStreamMessage() throws JMSException;
    TextMessage createTextMessage() throws JMSException;
    TextMessage createTextMessage(String text) throws JMSException;

    void commit() throws JMSException;
    void rollback() throws JMSException;
    void recover() throws JMSException;
  
  	void run();
    void unsubscribe(String name) throws JMSException;

    void close() throws JMSException;
    void acknowledge() throws JMSException;

    boolean getTransacted() throws JMSException;
    int getAcknowledgeMode() throws JMSException;

    Destination createQueue(String queueName) throws JMSException;
    Destination createTopic(String topicName) throws JMSException;

    MessageProducer createProducer(Destination destination) throws JMSException;
    MessageConsumer createConsumer(Destination destination) throws JMSException;
    MessageConsumer createConsumer(Destination destination, String messageSelector) throws JMSException;
  
  	MessageConsumer createDurableConsumer(Topic topic, String name) throws JMSException;
  	MessageConsumer createDurableConsumer(Topic topic, String name, String messageSelector, boolean noLocal) throws JMSException;
  
    TopicSubscriber createDurableSubscriber(Topic topic, String name) throws JMSException;
    TopicSubscriber createDurableSubscriber(Topic topic, String name, String messageSelector, boolean noLocal) throws JMSException;
  
  	// JMS 2.0
    MessageConsumer createSharedConsumer(Topic topic, String sharedSubscriptionName) throws JMSException;
  	// JMS 2.0
  	MessageConsumer createSharedConsumer(Topic topic, String sharedSubscriptionName, String messageSelector) throws JMSException;  
  	// JMS 2.0
    MessageConsumer createSharedDurableConsumer(Topic topic, String name) throws JMSException;
    // JMS 2.0
    MessageConsumer createSharedDurableConsumer(Topic topic, String name, String messageSelector) throws JMSException;
    QueueBrowser createBrowser(Queue queue) throws JMSException;
    QueueBrowser createBrowser(Queue queue, String messageSelector) throws JMSException;
    TemporaryQueue createTemporaryQueue() throws JMSException;
    TemporaryTopic createTemporaryTopic() throws JMSException;
}

public interface QueueSession extends Session {
    @Override
    Queue createQueue(String queueName) throws JMSException;

    QueueReceiver createReceiver(Queue queue) throws JMSException;
    QueueReceiver createReceiver(Queue queue, String messageSelector) throws JMSException;

    QueueSender createSender(Queue queue) throws JMSException;

    @Override
    QueueBrowser createBrowser(Queue queue) throws JMSException;
    @Override
    QueueBrowser createBrowser(Queue queue, String messageSelector) throws JMSException;

    @Override
    TemporaryQueue createTemporaryQueue() throws JMSException;
}

public interface TopicSession extends Session {
    @Override
    Topic createTopic(String topicName) throws JMSException;

    TopicSubscriber createSubscriber(Topic topic) throws JMSException;

    TopicSubscriber createSubscriber(Topic topic, String messageSelector, boolean noLocal) throws JMSException;

    @Override
    TopicSubscriber createDurableSubscriber(Topic topic, String name) throws JMSException;

    @Override
    TopicSubscriber createDurableSubscriber(Topic topic, String name, String messageSelector, boolean noLocal) throws JMSException;

    TopicPublisher createPublisher(Topic topic) throws JMSException;

    @Override
    TemporaryTopic createTemporaryTopic() throws JMSException;

    @Override
    void unsubscribe(String name) throws JMSException;
}

public interface XASession extends Session {
    Session getSession() throws JMSException;

    XAResource getXAResource();

    @Override
    boolean getTransacted() throws JMSException;

    @Override
    void commit() throws JMSException;

    @Override
    void rollback() throws JMSException;
}

public interface XAQueueSession extends XASession {
    QueueSession getQueueSession() throws JMSException;
}

public interface XATopicSession extends XASession {
    TopicSession getTopicSession() throws JMSException;
}
```

#### Destination

```java
public interface Destination {
}

public interface Queue extends Destination {
    String getQueueName() throws JMSException;

    @Override
    String toString();
}

public interface Topic extends Destination {
    String getTopicName() throws JMSException;

    @Override
    String toString();
}

public interface TemporaryQueue extends Queue {
    void delete() throws JMSException;
}

public interface TemporaryTopic extends Topic {
    void delete() throws JMSException;
}
```

#### Message

```java
public interface Message {
    int DEFAULT_DELIVERY_MODE = DeliveryMode.PERSISTENT;
    int DEFAULT_PRIORITY = 4;
    long DEFAULT_TIME_TO_LIVE = 0;

    // @since JMS 2.0
    long DEFAULT_DELIVERY_DELAY = 0;

    String getJMSMessageID() throws JMSException;
    void setJMSMessageID(String id) throws JMSException;

    long getJMSTimestamp() throws JMSException;
    void setJMSTimestamp(long timestamp) throws JMSException;

    byte[] getJMSCorrelationIDAsBytes() throws JMSException;
    void setJMSCorrelationIDAsBytes(byte[] correlationID) throws JMSException;

    void setJMSCorrelationID(String correlationID) throws JMSException;
    String getJMSCorrelationID() throws JMSException;

    Destination getJMSReplyTo() throws JMSException;
    void setJMSReplyTo(Destination replyTo) throws JMSException;

    Destination getJMSDestination() throws JMSException;
    void setJMSDestination(Destination destination) throws JMSException;

    int getJMSDeliveryMode() throws JMSException;
    void setJMSDeliveryMode(int deliveryMode) throws JMSException;

    boolean getJMSRedelivered() throws JMSException;
    void setJMSRedelivered(boolean redelivered) throws JMSException;

    String getJMSType() throws JMSException;
    void setJMSType(String type) throws JMSException;

    long getJMSExpiration() throws JMSException;
    void setJMSExpiration(long expiration) throws JMSException;
  
		// @since JMS 2.0
    long getJMSDeliveryTime() throws JMSException;

    // @since JMS 2.0
    void setJMSDeliveryTime(long deliveryTime) throws JMSException;

    int getJMSPriority() throws JMSException;
    void setJMSPriority(int priority) throws JMSException;

    void clearProperties() throws JMSException;
    boolean propertyExists(String name) throws JMSException;

    boolean getBooleanProperty(String name) throws JMSException;
    byte getByteProperty(String name) throws JMSException;
    short getShortProperty(String name) throws JMSException;
    int getIntProperty(String name) throws JMSException;
    long getLongProperty(String name) throws JMSException;
    float getFloatProperty(String name) throws JMSException;
    double getDoubleProperty(String name) throws JMSException;
    String getStringProperty(String name) throws JMSException;
    Object getObjectProperty(String name) throws JMSException;

    Enumeration getPropertyNames() throws JMSException;

    void setBooleanProperty(String name, boolean value) throws JMSException;
    void setByteProperty(String name, byte value) throws JMSException;
    void setShortProperty(String name, short value) throws JMSException;
    void setIntProperty(String name, int value) throws JMSException;
    void setLongProperty(String name, long value) throws JMSException;
    void setFloatProperty(String name, float value) throws JMSException;
    void setDoubleProperty(String name, double value) throws JMSException;
    void setStringProperty(String name, String value) throws JMSException;
    void setObjectProperty(String name, Object value) throws JMSException;

    void acknowledge() throws JMSException;
    void clearBody() throws JMSException;
    <T> T getBody(Class<T> c) throws JMSException;
    boolean isBodyAssignableTo(Class c) throws JMSException;
}

public interface ObjectMessage extends Message {
    void setObject(Serializable object) throws JMSException;
    Serializable getObject() throws JMSException;
}


public interface TextMessage extends Message {
    void setText(String string) throws JMSException;
    String getText() throws JMSException;
}

public interface BlobMessage extends Message {
    InputStream getInputStream() throws IOException, JMSException;
    URL getURL() throws MalformedURLException, JMSException;

    String getMimeType();
    void setMimeType(String mimeType);

    String getName();
    void setName(String name);
}

public interface BytesMessage extends Message {
    long getBodyLength() throws JMSException;

    boolean readBoolean() throws JMSException;
    byte readByte() throws JMSException;
    int readUnsignedByte() throws JMSException;
    short readShort() throws JMSException;
    int readUnsignedShort() throws JMSException;
    char readChar() throws JMSException;
    int readInt() throws JMSException;
    long readLong() throws JMSException;
    float readFloat() throws JMSException;
    double readDouble() throws JMSException;
    String readUTF() throws JMSException;
    int readBytes(byte[] value) throws JMSException;
    int readBytes(byte[] value, int length) throws JMSException;

    void writeBoolean(boolean value) throws JMSException;
    void writeByte(byte value) throws JMSException;
    void writeShort(short value) throws JMSException;
    void writeChar(char value) throws JMSException;
    void writeInt(int value) throws JMSException;
    void writeLong(long value) throws JMSException;
    void writeFloat(float value) throws JMSException;
    void writeDouble(double value) throws JMSException;
    void writeUTF(String value) throws JMSException;
    void writeBytes(byte[] value) throws JMSException;
    void writeBytes(byte[] value, int offset, int length) throws JMSException;
    void writeObject(Object value) throws JMSException;
    void reset() throws JMSException;
}

public interface StreamMessage extends Message {
    boolean readBoolean() throws JMSException;
    byte readByte() throws JMSException;
    short readShort() throws JMSException;
    char readChar() throws JMSException;
    int readInt() throws JMSException;
    long readLong() throws JMSException;
    float readFloat() throws JMSException;
    double readDouble() throws JMSException;
    String readString() throws JMSException;
    int readBytes(byte[] value) throws JMSException;
    Object readObject() throws JMSException;

    void writeBoolean(boolean value) throws JMSException;
    void writeByte(byte value) throws JMSException;
    void writeShort(short value) throws JMSException;
    void writeChar(char value) throws JMSException;
    void writeInt(int value) throws JMSException;
    void writeLong(long value) throws JMSException;
    void writeFloat(float value) throws JMSException;
    void writeDouble(double value) throws JMSException;
    void writeString(String value) throws JMSException;
    void writeBytes(byte[] value) throws JMSException;
    void writeBytes(byte[] value, int offset, int length) throws JMSException;
    void writeObject(Object value) throws JMSException;

    void reset() throws JMSException;
}
```



#### MessageProducer

```java
public interface MessageProducer extends AutoCloseable {
    void setDisableMessageID(boolean value) throws JMSException;
    boolean getDisableMessageID() throws JMSException;

    void setDisableMessageTimestamp(boolean value) throws JMSException;
    boolean getDisableMessageTimestamp() throws JMSException;

    void setDeliveryMode(int deliveryMode) throws JMSException;
    int getDeliveryMode() throws JMSException;

    void setPriority(int defaultPriority) throws JMSException;
    int getPriority() throws JMSException;

    void setTimeToLive(long timeToLive) throws JMSException;
    long getTimeToLive() throws JMSException;

    // JMS 2.0
    void setDeliveryDelay(long deliveryDelay) throws JMSException;
    // JMS 2.0
    long getDeliveryDelay() throws JMSException;

    Destination getDestination() throws JMSException;

    @Override
    void close() throws JMSException;

    void send(Message message) throws JMSException;
    void send(Message message, int deliveryMode, int priority, long timeToLive) throws JMSException;
    void send(Destination destination, Message message) throws JMSException;
    void send(Destination destination, Message message, int deliveryMode, int priority, long timeToLive) throws JMSException;

  	// JMS 2.0
    void send(Message message, CompletionListener completionListener) throws JMSException;

  	// JMS 2.0
    void send(Message message, int deliveryMode, int priority, long timeToLive, CompletionListener completionListener) throws JMSException;
		
    // JMS 2.0
    void send(Destination destination, Message message, CompletionListener completionListener) throws JMSException;

  	// JMS 2.0
    void send(Destination destination, Message message, int deliveryMode, int priority, long timeToLive, CompletionListener completionListener)
            throws JMSException;
}

public interface QueueSender extends MessageProducer {
    Queue getQueue() throws JMSException;

    @Override
    void send(Message message) throws JMSException;
    @Override
    void send(Message message, int deliveryMode, int priority, long timeToLive) throws JMSException;
    void send(Queue queue, Message message) throws JMSException;
    void send(Queue queue, Message message, int deliveryMode, int priority, long timeToLive) throws JMSException;
}

public interface TopicPublisher extends MessageProducer {
    Topic getTopic() throws JMSException;

    void publish(Message message) throws JMSException;
    void publish(Message message, int deliveryMode, int priority, long timeToLive) throws JMSException;
    void publish(Topic topic, Message message) throws JMSException;
    void publish(Topic topic, Message message, int deliveryMode, int priority, long timeToLive) throws JMSException;
}
```



#### MessageConsumer

```java
public interface MessageConsumer extends AutoCloseable {
    String getMessageSelector() throws JMSException;

    MessageListener getMessageListener() throws JMSException;
    void setMessageListener(MessageListener listener) throws JMSException;

    Message receive() throws JMSException;
    Message receive(long timeout) throws JMSException;
    Message receiveNoWait() throws JMSException;

    @Override
    void close() throws JMSException;
}

public interface QueueReceiver extends MessageConsumer {
    Queue getQueue() throws JMSException;
}

public interface TopicSubscriber extends MessageConsumer {
    Topic getTopic() throws JMSException;

    boolean getNoLocal() throws JMSException;
}
```

#### QueueBrowser

```java
public interface QueueBrowser extends AutoCloseable {
    Queue getQueue() throws JMSException;

    String getMessageSelector() throws JMSException;

    Enumeration getEnumeration() throws JMSException;

    @Override
    void close() throws JMSException;
}

```



#### Listener

```java
public interface MessageListener {
    void onMessage(Message message);
}

public interface CompletionListener {
    void onCompletion(Message message);

    void onException(Message message, Exception exception);
}

public interface ExceptionListener {
    void onException(JMSException exception);
}
```

#### JMSContext

```java
public interface JMSContext extends AutoCloseable {
  	int AUTO_ACKNOWLEDGE = Session.AUTO_ACKNOWLEDGE;
    int CLIENT_ACKNOWLEDGE = Session.CLIENT_ACKNOWLEDGE;
    int DUPS_OK_ACKNOWLEDGE = Session.DUPS_OK_ACKNOWLEDGE;
    int SESSION_TRANSACTED = Session.SESSION_TRANSACTED;
  
    String getClientID();
    void setClientID(String clientID);

    ConnectionMetaData getMetaData();

    ExceptionListener getExceptionListener();
    void setExceptionListener(ExceptionListener listener);

    void start();
    void stop();
    void setAutoStart(boolean autoStart);
    boolean getAutoStart();

    @Override
    void close();

    BytesMessage createBytesMessage();
    MapMessage createMapMessage();
    Message createMessage();
    ObjectMessage createObjectMessage();
    ObjectMessage createObjectMessage(Serializable object);
    StreamMessage createStreamMessage();
    TextMessage createTextMessage();
    TextMessage createTextMessage(String text);

    boolean getTransacted();
    int getSessionMode();

    void commit();
    void rollback();
    void recover();

  	JMSContext createContext(int sessionMode);
    JMSProducer createProducer();
    JMSConsumer createConsumer(Destination destination);
    JMSConsumer createConsumer(Destination destination, String messageSelector);
    JMSConsumer createConsumer(Destination destination, String messageSelector, boolean noLocal);

    Queue createQueue(String queueName);
    Topic createTopic(String topicName);

    JMSConsumer createDurableConsumer(Topic topic, String name);
    JMSConsumer createDurableConsumer(Topic topic, String name, String messageSelector, boolean noLocal);
    JMSConsumer createSharedDurableConsumer(Topic topic, String name);
    JMSConsumer createSharedDurableConsumer(Topic topic, String name, String messageSelector);
    JMSConsumer createSharedConsumer(Topic topic, String sharedSubscriptionName);
    JMSConsumer createSharedConsumer(Topic topic, String sharedSubscriptionName, java.lang.String messageSelector);

    QueueBrowser createBrowser(Queue queue);
    QueueBrowser createBrowser(Queue queue, String messageSelector);

    TemporaryQueue createTemporaryQueue();
    TemporaryTopic createTemporaryTopic();

    void unsubscribe(String name);
    void acknowledge();
}
```

#### JMSProducer

```java
public interface JMSProducer {
    JMSProducer send(Destination destination, Message message);
    JMSProducer send(Destination destination, String body);
    JMSProducer send(Destination destination, Map<String, Object> body);
    JMSProducer send(Destination destination, byte[] body);
    JMSProducer send(Destination destination, Serializable body);

    JMSProducer setDisableMessageID(boolean value);
    boolean getDisableMessageID();

    JMSProducer setDisableMessageTimestamp(boolean value);
    boolean getDisableMessageTimestamp();

    JMSProducer setDeliveryMode(int deliveryMode);
    int getDeliveryMode();

    JMSProducer setPriority(int priority);
    int getPriority();

    JMSProducer setTimeToLive(long timeToLive);
    long getTimeToLive();

    JMSProducer setDeliveryDelay(long deliveryDelay);
    long getDeliveryDelay();

    JMSProducer setAsync(CompletionListener completionListener);
    CompletionListener getAsync();

    JMSProducer setProperty(String name, boolean value);
    JMSProducer setProperty(String name, byte value);
    JMSProducer setProperty(String name, short value);
    JMSProducer setProperty(String name, int value);
    JMSProducer setProperty(String name, long value);
    JMSProducer setProperty(String name, float value);
    JMSProducer setProperty(String name, double value);
    JMSProducer setProperty(String name, String value);
    JMSProducer setProperty(String name, Object value);

    JMSProducer clearProperties();
    boolean propertyExists(String name);

    boolean getBooleanProperty(String name);
    byte getByteProperty(String name);
    short getShortProperty(String name);
    int getIntProperty(String name);
    long getLongProperty(String name);
    float getFloatProperty(String name);
    double getDoubleProperty(String name);
    String getStringProperty(String name);
    Object getObjectProperty(String name);
    Set<String> getPropertyNames();

    JMSProducer setJMSCorrelationIDAsBytes(byte[] correlationID);
    byte[] getJMSCorrelationIDAsBytes();

    JMSProducer setJMSCorrelationID(String correlationID);
    String getJMSCorrelationID();

    JMSProducer setJMSType(String type);
    String getJMSType();

    JMSProducer setJMSReplyTo(Destination replyTo);
    Destination getJMSReplyTo();
}
```

#### JMSConsumer

```java
public interface JMSConsumer extends AutoCloseable {
    String getMessageSelector();

    MessageListener getMessageListener() throws JMSRuntimeException;
    void setMessageListener(MessageListener listener) throws JMSRuntimeException;

    Message receive();
    Message receive(long timeout);
    Message receiveNoWait();

    @Override
    void close();

    <T> T receiveBody(Class<T> c);
    <T> T receiveBody(Class<T> c, long timeout);
    <T> T receiveBodyNoWait(Class<T> c);

}
```

