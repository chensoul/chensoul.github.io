---
title: "[译]完整的 JMS 2.0 教程"
date: 2024-07-23T18:00:00+08:00
slug: a-complete-jms-2-0-tutorial
draft: false
categories: ["Java"]
tags: [ jms]
---

JMS 代表 Java 消息服务，它是 Java 中访问消息中间件服务器的标准。消息传递是在各种应用程序或服务之间交换业务数据的过程。这是**一个完整的 JMS 2.0 教程，** 其中包含大量代码示例。完整的代码示例可在 GitHub 上找到，请下载并运行示例。本教程使用 Glassfish 开源服务器作为 JMS 提供程序的示例。

您可以使用 ActiveMQ 或 ActiveMQ Artemes 作为 JMS 提供程序，JMS API 保持不变，只有使用相应 JMS 提供程序的 maven 依赖项会发生变化。以下是本教程中涵盖的主题。

[代码示例](https://github.com/jstobigdata/jms-parent-app)

- [JMS 简介 – Java 消息服务](/posts/2024/07/23/jms-introduction-java-message-service/)
- [为 JMS 安装和设置 Glassfish](/posts/2024/07/23/install-and-setup-glassfish-for-jms/)
- [在 JMS 中发送和接收消息](/posts/2024/07/23/send-and-receive-message-in-jms/)
- [JMS 消息模型](/posts/2024/07/23/jms-message-model/)
- [JMS 确定消息优先级](/posts/2024/07/23/jms-prioritize-messages/)
- [JMS 点对点消息传递的实际应用](/posts/2024/07/23/jms-point-to-point-messaging-in-action/)
- [JMS 发布-订阅消息模型](/posts/2024/07/23/jms-pub-sub-messaging-model/)
- [JMS 消息选择器在过滤消息中的应用](/posts/2024/07/23/jms-message-selectors-in-action-to-filter-messages/)
- [使用 JMS 消息确认保证传送](/posts/2024/07/23/guaranteed-delivery-using-jms-message-acknowledgement/)
- [JMS 事务的实际应用](/posts/2024/07/23/jms-transactions-in-action/)

## 参考

1. [Apache ActiveMQ Artemis 用户手册](https://activemq.apache.org/components/artemis/documentation/latest/)
2. [管理和排除 Glassfish JMS 故障](https://docs.oracle.com/cd/E19798-01/821-1751/abljw/index.html)
3. [JMS 2.0 中的新增功能](https://www.oracle.com/technical-resources/articles/java/jms20.html)
