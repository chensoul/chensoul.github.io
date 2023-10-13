---
title: "[译]Spring Boot3和Spring6中的新特性"
date: 2023-10-13T07:00:00+08:00
slug: new-features-in-spring-boot-3-and-spring-6
categories: ["Java"]
tags: [java, "spring boot", "spring"]
---

Spring Boot 3.0 于 2022 年 11 月正式发布，包含一些新功能和改进。这是继大约 4.5 年前发布 Spring Boot 2.0 后 Spring Boot 的第一个主要版本。它也是第一个支持 Spring Framework 6.0 的 Spring Boot GA 版本。作为开发人员，我们需要了解这些更新，才能顺利使用 Spring Boot。毫无疑问，新版本中最大的转变之一是放弃了对旧版本 Java 的支持。

在本文中，我们将讨论“Spring Boot 3 和 Spring 6 中的新功能”。

## Spring 3.0 版本有哪些主要亮点？

Spring 3.0 版本的亮点包括：

- Java 17 基线
- 支持 Jakarta EE 10 和 EE 9 基线
- 支持使用 GraalVM 生成本机映像，取代实验性 Spring Native 项目
- 通过测微计和测微计追踪提高了可观测性

## 谁可以真正使用 Spring Boot 3？

如前所述，Spring Boot 3.0 最大的转变是忽略了对旧版本 Java 的支持。是的，我们至少需要 Java 17 才能使用 Spring Boot 3.0。因此，在使用 Spring Boot 3.0 之前必须具备 JDK 17 环境。

## Spring Boot 3 和 Spring 6 有哪些新功能？

这里需要注意的重要一点是 Spring Boot 3.0 构建于 Spring Framework 6 之上并需要 Spring Framework 6。因此，如果您的 pom.xml 指向 Spring Boot 版本 3.0.0，它将自动下载 Spring Framework 6 所需的依赖项。因此，默认情况下，您在使用 Spring Boot 3.0 时将使用 Spring Framework 6。请访问单独的文章了解 Spring Framework 6.0 中的新功能。这里只讨论 Spring Boot 3 中的新功能。

### Java 17 基线和 Java 19 支持

我们需要 Java 17 作为最低版本才能与 Spring 3.0 配合使用。如果您当前使用的是 Java 8、Java 11 或 Java 14 等较低版本，则需要先将 JDK 升级到 JDK 17，然后再开始使用 Spring Boot 3.0 开发应用程序。目前 Java 的最新版本是 JDK 19。不过，Spring Boot 3.0 也运行良好，并且已经在 JDK 19 上进行了测试。

您还可以阅读：[Java 17 特性](https://javatechonline.com/java-17-features/)。

### 第三方库升级

1. 由于 Java EE 已更改为 Jakarta EE，Spring Boot 3.0 也将所有依赖项的 API 从 Java EE 迁移到 Jakarta EE API。因此，以“javax”开头的包名称需要相应地更改为“jakarta”。

例如，一些常用的包将被更改如下：

```
javax.persistence.*   -> jakarta.persistence.*

javax.validation.*    -> jakarta.validation.*

javax.servlet.*       -> jakarta.servlet.*

javax.annotation.*    -> jakarta.annotation.*

javax.transaction.*   -> jakarta.transaction.*
```

注意：请注意，javax.sql._ 和 javax.crypto._ 等包不会更改为“jakarta.\*”，因为它们是 Java 17 JDK 的一部分，而不是 Java EE 的一部分。只有属于 Java EE 的那些包才会更改为 Jakarta EE。

只要有可能，我们都会选择 Jakarta EE 10 兼容的依赖项，包括：

- ```
  Jakarta Activation 2.1
  ```

- ```
  Jakarta JMS 3.1
  ```

- ```
  Jakarta JSON 2.1
  ```

- ```
  Jakarta JSON Bind 3.0
  ```

- ```
  Jakarta Mail 2.1
  ```

- ```
  Jakarta Persistence 3.1
  ```

- ```
  Jakarta Servlet 6.0
  ```

- ```
  Jakarta Servlet JSP JSTL 3.0
  ```

- ```
  Jakarta Transaction 2.0
  ```

- ```
  Jakarta Validation 3.0
  ```

- ```
  Jakarta WebSocket 2.1
  ```

- ```
  Jakarta WS RS 3.1
  ```

- ```
  Jakarta XML SOAP 3.0
  ```

- ```
  Jakarta XML WS 4.0
  ```

2. 随着 Spring 框架升级到版本 6，其他 Spring 项目也在这个版本中升级，它们是：

- ```
  Spring AMQP 3.0.
  ```

- ```
  Spring Batch 5.0.
  ```

- ```
  Spring Data 2022.0.
  ```

- ```
  Spring GraphQL 1.1.
  ```

- ```
  Spring HATEOAS 2.0.
  ```

- ```
  Spring Integration 6.0.
  ```

- ```
  Spring Kafka 3.0.
  ```

- ```
  Spring LDAP 3.0.
  ```

- ```
  Spring REST Docs 3.0.
  ```

- ```
  Spring Retry 2.0.
  ```

- ```
  Spring Security 6.0 (see also what’s new).
  ```

- ```
  Spring Session 3.0
  ```

- ```
  Spring WS 4.0.
  ```

3. 第三方 jar 的最新稳定版本也会尽可能升级。一些常用的依赖项升级包括：

- ```
  Couchbase Client 3.4
  ```

- ```
  Ehcache 3.10
  ```

- ```
  Elasticsearch Client 8.5
  ```

- ```
  Flyway 9
  ```

- ```
  Groovy 4.0
  ```

- ```
  Hibernate 6.1
  ```

- ```
  Hibernate Validator 8.0
  ```

- ```
  Jackson 2.14
  ```

- ```
  Jersey 3.1
  ```

- ```
  Jetty 11
  ```

- ```
  jOOQ 3.16
  ```

- ```
  Kotlin 1.7.20
  ```

- ```
  Liquibase 4.13
  ```

- ```
  Lettuce 6.2
  ```

- ```
  Log4j 2.18
  ```

- ```
  Logback 1.4
  ```

- ```
  Micrometer 1.10
  ```

- ```
  Micrometer Tracing 1.0
  ```

- ```
  Neo4j Java Driver 5.2
  ```

- ```
  Netty 4.1.77.Final
  ```

- ```
  OkHttp 4.10
  ```

- ```
  R2DBC 1.0
  ```

- ```
  Reactor 2022.0
  ```

- ```
  SLF4J 2.0
  ```

- ```
  SnakeYAML 1.32
  ```

- ```
  Tomcat 10
  ```

- ```
  Thymeleaf 3.1.0.M2
  ```

- ```
  Undertow 2.2.20.Final
  ```

### GraalVM 本机映像支持

GraalVM Native Images 提供了一种部署和运行 Java 应用程序的新方法。与 Java 虚拟机相比，本机映像可以以更小的内存占用和更快的启动时间运行。

GraalVM 是一种高性能 JDK，旨在加快用 Java 和其他 JVM 语言编写的应用程序的执行速度，同时还为 JavaScript、Python 和许多其他流行语言提供运行时。 GraalVM 提供了两种运行 Java 应用程序的方法：在带有 Graal 即时 (JIT) 编译器的 HotSpot JVM 上或作为提前 (AOT) 编译的本机可执行文件。

GraalVM 本机映像是独立的可执行文件，可以通过提前处理已编译的 Java 应用程序来生成。原生映像通常比 JVM 映像具有更小的内存占用并且启动速度更快。它们非常适合使用容器映像部署的应用程序。 GraalVM Native Image 是一个完整的、特定于平台的可执行文件。我们不需要提供 Java 虚拟机来运行本机映像。

如果您想了解更多信息并尝试使用 GraalVM，您可以继续阅读有关“[GraalVM Native Image Support](https://docs.spring.io/spring-boot/docs/3.0.0/reference/html/native-image.html#native-image)”的官方文档。

### 通过测微计和测微计追踪提高可观测性

可观察性是从外部观察正在运行的系统的内部状态的能力。换句话说，“通过检查系统的输出，您可以在多大程度上了解系统的内部结构”。它由日志记录、指标和跟踪三大支柱组成。对于指标和跟踪，Spring Boot 使用 Micrometer Observation。要创建您自己的观察（这将产生指标和跟踪），您可以注入 ObservationRegistry。

1. Spring Boot 3.0 支持 Micrometer 1.10 中引入的新观察 API。新的 ObservationRegistry 界面可用于创建观察结果，为指标和跟踪提供单一 API。 Spring Boot 现在会自动为您配置 ObservationRegistry 实例。下面的代码片段演示了 ObervationRegistry 的概念。

```java
@Component
public class MyCustomObservation {

   private final ObservationRegistry observationRegistry;

   public MyCustomObservation(ObservationRegistry observationRegistry) {
      this.observationRegistry = observationRegistry;
   }

   public void doSomething() {
      Observation.createNotStarted("doSomething", this.observationRegistry)
                 .lowCardinalityKeyValue("locale", "en-US")
                 .highCardinalityKeyValue("userId", "42")
                 .observe(() -> {
                       // Execute business logic here
                 });
   }
}
```

2. Spring Boot 现在会自动为您配置 Micrometer Tracing。这包括对 Brave、OpenTelemetry、Zipkin 和 Wavefront 的支持。 Spring Cloud Sleuth 在新版本中被 Micrometer Tracing Framework 取代。

## 使用 Spring Boot 3.0 的 Spring Security UserDetailsService 示例

此外，我们还有一篇单独的文章作为 [Spring Security UserDetailsS​​ervice 使用 Spring Boot 3](https://javatechonline.com/spring-security-userdetailsservice-using-spring-boot-3/) 的示例，该文章完全使用 Spring Boot 3.0 并遵循 Spring 官方文档提供的分步指南进行开发。此外，您可以阅读《[Spring Boot 3.0 迁移指南](https://javatechonline.com/how-to-migrate-spring-boot-2-to-spring-boot-3/)》来彻底了解迁移过程。

这是目前的功能列表。显然，还有更多。我们将不时更新文章。

有关 Spring Boot 的其他教程，您可以访问 [Spring Boot 教程](https://javatechonline.com/spring-boot-tutorial/)页面。

## Spring Boot 3 和 Spring 6 版本如何互连？

如上所述，Spring Boot 3.0 构建在 Spring Framework 6.0 之上。两者的发布之间有一周的间隔。 Spring Framework 6.0.0 比 Spring Boot 3.0 发布早一周发布。换句话说，Spring Framework 6.0.0 是 Spring Boot 3.0 的基础。此外，如果您的 pom.xml 指向 Spring Boot 版本 3.0.0，它将自动下载 Spring Framework 6 所需的依赖项。因此，默认情况下，您在使用 Spring Boot 3.0 时将使用 Spring Framework 6。

虽然提前（AOT）和 GraalVM 是 Spring Framework 6.0 的新功能，但如果没有完整的 Spring Boot 堆栈，它们就没有用。它们在基于 Spring 的独立应用程序中还不够好。

下一个版本 Spring Framework 6.1 GA 将于明年即 2023 年 11 月发布。另一方面，到 2023 年 11 月，Spring Boot 将有两个版本，即 Spring Boot 3.0 和 3.1。这意味着 Spring Framework 将有每年发布一个版本，而 Spring boot 每年发布两个版本，并支持最新的 JDK 版本。按照 JDK 的常规发布，JDK 21(LTS) 将于 2023 年 9 月发布，即 Spring Framework 6.1 GA 发布之前。

## FAQ

### Spring Boot 3 可以与 Java 11 一起使用吗？

一点也不。 Spring Boot 3.0.0 需要 JDK 17 作为最低版本才能使用。 Spring Boot 3.0 发布文档中明确提到了这一点。如果您想使用低于 Java 17 的 Java 版本，则必须使用 Spring Boot 2.0。

### Spring Boot 3 支持 Java 8 吗？

根本不需要。为了使用 Spring Boot 3，您的系统中必须至少安装 Java 17。不仅安装了，您的代码还必须使用 JDK 17 进行编译。使用 JDK 17 或更高版本编译的代码将仅被 Spring Boot 3 接受。

原文链接：[https://javatechonline.com/new-features-in-spring-boot-3-and-spring-6/](https://javatechonline.com/new-features-in-spring-boot-3-and-spring-6/)
