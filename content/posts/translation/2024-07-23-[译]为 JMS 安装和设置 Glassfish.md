---
title: "[译]为 JMS 安装和设置 Glassfish"
date: 2024-07-23 08:00:00+08:00
slug: install-and-setup-glassfish-for-jms
categories: [ "translation" ]
tags: ['jms']
---

在本文中，我们将为 JMS 2.0 设置 Glassfish，创建一个 Java 项目并添加必要的依赖项。

## 先决条件

请确保您的系统上安装了以下工具。

- 已安装JDK 8。尚未使用任何更高版本的 Java 进行测试。
- Eclipse、STS 或 IntelliJ IDEA。

## Glassfish 安装和设置步骤

### 步骤 1，下载 Glassfish 并解压缩

您需要从 [**Glassfish GitHub repo**](https://javaee.github.io/glassfish/download)下载开源 Glassfish 版本，然后将其解压缩到我们将运行服务器的文件夹中。我使用的是带有 JDK 8 的 GlassFish 5.0。

![Glassfish 5.0 GitHub 存储库](Download-Glassfish-min-1024x508.webp)

### 步骤2，启动服务器

`cd glassfish5\glassfish\bin\`从终端导航到解压的文件夹内以启动服务器。

`sh startserv`如果您使用的是 Mac 或 Linux，请从终端运行。或者，`startserv.bat`如果您使用的是 Windows，请运行。让服务器有时间进行引导。

![Glassfish5 目录结构](start-server-glassfish-min-1024x490.webp)

### 步骤 3，打开管理控制台

完成上述步骤后，接下来访问管理控制台[http://localhost:4848](http://localhost:4848/)。

现在，查看“ *JMS 资源/连接工厂*”，您可以看到 Glassfish 为您创建的默认 JMS 工厂。我们将`jms/__defaultConnectionFactory`在整个课程中使用它。

![JMS JNDI 名称](JMS-connection-pool-min-1024x506.webp)

### 步骤 4，创建 JMS 目标资源

默认情况下，Glassfish 管理控制台上不会列出任何目标资源。请记住，您需要先创建这些资源，然后编写代码以通过这些资源发送或接收消息。

![img](JMS-resources-min-1-1024x491.webp)

点击**新建**按钮添加新的目标资源，我们将创建 2 个**Queue**和一个**Topic**供示例工作，如下所示。

- 创建队列 1，其 JNDI 名称为`jms/PTPQueue`，目标名称为`PTPQueue`。

![img](Glassfish-PTP-Queue-min-1024x517.webp)

- 创建队列2，其JNDI名称为`jms/ReplyQueue`，目标名称为`ReplyQueue`。

![img](Glassfish-reply-Queue-min-1024x474.webp)

- 然后，创建 pub-sub 主题，其 JNDI 名称为`jms/PubSubTopic`，目标名称为`PubSubTopic`。

![img](Glassfish-PubSub-Topic-min-1024x468.webp)

> 理想情况下，目标资源和 ConnectionFactory 由**服务器管理员**创建。作为开发人员，您无需在现实世界中创建它们。但出于开发或测试目的，您需要在本地计算机上创建它们。

无论您使用哪个 JMS 提供程序，它们始终需要提供 ConnectionFactory 和 Destination 。这意味着在我们编写 Java 代码之前，需要在 JMS 提供程序中配置它们。您将在本教程的后半部分详细了解它们。有一些例外，例如 ActiveMQ，允许在运行时创建Destination。

一旦创建目标资源，JMS 目标资源将如下面的屏幕截图所示。

![img](Glassfish-JMS-destinaions-min-1024x375.webp)

## 配置 IDE 的步骤

​                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    所有代码示例均可在 GitHub 上下载。或者，您可以按照以下步骤创建一个具有下面列出的依赖项的 Maven 项目。

### 步骤 1，创建一个 Maven 项目

- 在你的 IDE（Eclipse、STS 或 IntelliJ）中创建一个 maven 项目`<packaging>jar</packaging>`
- 打开`pom.xml`并设置正确的 Java 版本。我在这个项目中使用 JDK 8。

```xml
    <properties>
        <maven.compiler.target>1.8</maven.compiler.target>
        <maven.compiler.source>1.8</maven.compiler.source>
        <java.version>1.8</java.version>
    </properties>
```

### 步骤 2，在 pom.xml 中添加 JMS 依赖项

- 添加与 Glassfish 服务器通信所需的依赖项。基本上，您需要添加 3 个依赖项`gf-client`，`imqjmsra`和`javax.jms-api`。还将添加`junit-jupitor-api`用于运行`@Test`代码的依赖项。       

```xml
<dependencies>
    <dependency>
        <groupId>org.glassfish.main.appclient</groupId>
        <artifactId>gf-client</artifactId>
        <version>5.0</version>
    </dependency>
    <dependency>
        <groupId>org.glassfish.mq</groupId>
        <artifactId>imqjmsra</artifactId>
        <version>5.1</version>
    </dependency>
    <dependency>
        <groupId>javax.jms</groupId>
        <artifactId>javax.jms-api</artifactId>
        <version>2.0.1</version>
    </dependency>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter-api</artifactId>
        <version>5.2.0</version>
    </dependency>
</dependencies>
```

### 步骤 3，创建 jndi.properties 文件

- 创建一个用于 JNDI 查找的文件`src\main\resources\jndi.properties`
- 在此文件中添加 JMS 相关配置如下图

```properties
java.naming.factory.initial=com.sun.enterprise.naming.SerialInitContextFactory
java.naming.factory.url.pkgs=com.sun.enterprise.naming
java.naming.factory.state=com.sun.corba.ee.impl.presentation.rmi.JNDIStateFactoryImpl
```

您还可以从 GitHub 存储库下载整个工作[代码示例](https://github.com/jstobigdata/jms-parent-app)。

完成 Glassfish for JMS 的设置后，请继续阅读下一篇文章，了解如何[在 JMS 中发送和接收消息](https://jstobigdata.com/jms/send-and-receive-message-in-jms/)。



原文链接：[Install and Setup Glassfish for JMS](https://jstobigdata.com/jms/install-and-setup-glassfish-for-jms/)
