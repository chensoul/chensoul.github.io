---
title: "[译]使用 Spring Boot 构建 RESTful API：集成 DDD 和六边形架构"
date: 2024-05-30
slug: building-a-restful-api-with-spring-boot-integrating-ddd-and-hexagonal-architecture
categories: ["Java"]
tags: [ spring-boot,java,ddd]
---

原文链接：[Building a RESTful API with Spring Boot: Integrating DDD and Hexagonal Architecture](https://medium.com/@juannegrin/building-a-restful-api-with-spring-boot-integrating-ddd-and-hexagonal-architecture-df50fe24a1ff)

# 介绍

在快节奏的软件开发世界中，API 扮演着至关重要的角色，可以有效地促进不同系统之间的交互和数据交换。API 创建最突出的技术之一是 Spring Boot，它是一种强大的工具，可以简化 Java 应用程序的开发，使开发人员可以专注于业务逻辑而不是环境设置。

在本文中，我们将探讨如何使用 Spring Boot 设计和构建 RESTful API，但我们将超越单纯的开发。我们将集成领域驱动设计 (DDD) 和六边形架构等高级概念，这些概念对于创建强大、可扩展且易于维护的应用程序至关重要。这些方法不仅可以改善代码结构和关注点分离，还可以促进技术团队和利益相关者之间的协作，使软件设计与业务需求保持一致。

在本文中，我们将把这些复杂的概念分解为简单的解释和实际示例，确保即使是初学者也可以遵循这些高级实践并将其应用到自己的项目中。无论您是希望增强应用程序架构的经验丰富的开发人员，还是 Spring Boot 世界的新手，您都可以在本文中找到适合您的开发需求的宝贵经验和技巧。

让我们深入了解构建 API 的迷人过程，该 API 不仅运行良好，而且从概念到实现都设计精良。

# 第 0 节：什么是 REST API？

## 什么是 API？

API（应用程序编程接口）是一组规则和规范，允许不同的应用程序或软件组件相互交互。它充当中介，使开发人员能够访问软件服务中的特定功能或数据，而无需了解该软件的内部细节。

## REST API 的起源

REST（表述性状态转移）架构由 Roy Fielding 于 2000 年在其博士论文中定义。REST 是一套原则，概述了应如何设计客户端和服务器之间的交互。它的创建是出于对标准的需求，该标准可以提高互联网通信的可扩展性，从而提供比当时可用的接口（例如被认为过于复杂和僵化的 SOAP）更简单、更高效的接口。

## REST 旨在解决什么问题？

REST 的出现是为了应对现有架构的复杂性，这些复杂性使 Web 应用程序的开发和可扩展性变得复杂。通过采用无状态模型并使用标准 HTTP 方法（GET、POST、PUT、DELETE），REST 简化了客户端与服务器交互的实现。这种简单性使开发人员能够创建更高效、更易于维护的 Web 和移动应用程序。

**REST**基于六个基本原则：

1. **统一接口：**确保客户端和服务器之间的接口一致、标准化。
2. **无状态：**每个客户端对服务器的请求都必须包含理解和完成请求所需的所有信息。
3. **可缓存：**响应必须隐式或显式地定义它们是否可缓存。
4. **分层系统：**客户端不需要知道它是直接与终端服务器通信还是与中介通信。
5. **客户端-服务器：**用户界面（客户端）和数据存储（服务器）之间的职责分离，通过简化服务器组件增强了用户界面跨多个平台的可移植性和可扩展性。
6. **按需代码（可选）：**服务器可以通过发送可执行代码来扩展或定制客户端的功能。

结合这些原则不仅解决了可扩展性和维护问题，而且还促进了更为健壮、交互和高效的 Web 应用程序的创建。

现在，如果你已经读到这里，你可能会想，“HTTP 到底是什么？”好吧，让我们开始吧。

## HTTP 简介

HTTP（超文本传输协议）是互联网工程任务组（IETF）定义的网络交互中使用的底层协议。它是浏览器（客户端）和网络服务器之间传输数据的手段。该协议基于请求-响应模型，对于 RESTful 通信至关重要，因为它的方法促进了 REST API 中基本的 CRUD（创建、读取、更新、删除）操作。

## HTTP 方法及其使用时机

HTTP 方法定义您想要对已识别的资源执行的操作。以下是 REST API 中最常用的方法：

- **GET：**用于从服务器检索信息。它不应修改资源的状态，因此非常适合无副作用的读取操作。示例：获取用户列表或特定用户的详细信息。
- **POST：**用于创建新资源。当请求结果导致服务器状态改变或产生副作用时，此方法非常有用。例如：添加新用户。
- **PUT：**用于更新/替换现有资源。在请求中发送完整实体很重要。示例：更新现有用户的姓名和年龄。
- **DELETE：**用于删除资源。例如：删除用户。
- **PATCH：**与 PUT 不同，PATCH 用于对资源进行部分更新。例如：仅更新用户的名称而不触及其他字段。

## HTTP 方法的最佳实践

在设计 RESTful API 时，遵循一些最佳实践以确保 API 易于理解和使用至关重要：

- **正确使用方法：**确保每个 HTTP 方法都按照其指定用途使用。这不仅有助于提高代码的清晰度和可维护性，还可以让其他人更容易理解和正确使用您的 API。
- **幂等性：** GET、PUT、DELETE 是幂等的，即多次发出相同的请求将产生相同的结果，并且在第一次请求之后不会产生其他影响。POST 和 PATCH 不是幂等的。
- **安全性：**确保实施适当的安全措施，尤其是修改资源的方法，例如 POST、PUT 和 DELETE。这包括身份验证、授权和输入验证，以防止 SQL 注入等攻击。
- **适当的 HTTP 响应：**使用适当的 HTTP 状态代码来响应请求。例如，对于成功的 GET 响应，返回 200 OK；对于导致资源创建的 POST，返回 201 Created；对于成功的 DELETE，返回 204 No Content。

这些实践不仅提高了 API 的功能和安全性，而且还方便其他开发人员集成和使用，确保更好的协作和长期维护。

## 附录：最常见的 HTTP 响应代码

由于我们已经提到了使用适当的 HTTP 响应代码作为最佳实践的重要性，因此这里列出了最常见的代码。此列表大致介绍了此协议可以处理的响应，尽管还有许多其他代码。

信息响应代码 (100–199)

- **100 Continue：**表示请求的初始部分已经收到，客户端应该继续发送请求的其余部分。

成功响应代码（200–299）

- **200 OK：**请求成功。这是表示成功的最常用代码。
- **201 已创建：**请求已完成，因此，新资源已创建。
- **204 No Content：**请求已成功完成，但是没有可显示的内容。

重定向响应代码（300–399）

- **301 Moved Permanently：**请求的 URL 资源已永久更改。新的 URL 在响应中指定。
- **302 Found：**表示请求的资源暂时在不同的URL下。

客户端错误响应代码（400–499）

- **400 错误请求：**由于客户端语法错误，服务器无法理解或处理该请求。
- **401 Unauthorized：**表示请求需要身份验证，而客户端尚未进行身份验证。
- **403 禁止：**服务器理解请求，但拒绝授权。
- **404 未找到：**服务器找不到请求的资源。
- **405 方法不允许：**请求中使用的方法不适用于指定的资源。

服务器错误响应代码（500–599）

- **500 内部服务器错误：**服务器遇到不知道如何处理的情况。
- **502 错误网关：**服务器在充当网关或代理时从上游服务器收到了无效响应。
- **503 服务不可用：**服务器尚未准备好处理请求，通常是由于维护或超载。

此 HTTP 响应代码选择涵盖了开发人员在实施 RESTful API 时可能遇到的最常见情况。在响应中使用正确的代码不仅是为了遵守协议，而且还有助于客户端和与您的 API 交互的其他服务正确解释情况。

# 第 1 节：Spring Boot 基础知识

## 什么是 Spring Boot？

Spring Boot 是庞大的 Spring 生态系统中的一个项目，它简化了配置和部署新 Spring 应用程序的过程。它的主要目标是最大限度地缩短配置时间，使开发人员能够快速启动原型和可用于生产的应用程序。使用 Spring Boot，可以自动完成应用程序设置中涉及的许多重复性任务，例如依赖项管理和 Tomcat 或 Jetty 等嵌入式服务器的配置。

使用 Spring Boot 创建 RESTful API 的主要原因是它能够高效处理 HTTP 请求、与 Spring MVC 等 Java 技术集成，并且通过 Spring Data 提供强大的数据支持。此外，Spring Boot 还提供广泛的自动配置功能、大量简化依赖项管理的“启动器”，以及以最少的努力自定义和扩展应用程序的几乎任何方面的能力。

Spring Boot 项目的初始设置借助 Spring Initializr 等工具，创建 Spring Boot 项目非常简单，它提供了一个 Web 界面来自定义和下载基础项目。以下是设置项目的步骤：

1. **访问**[**Spring Initializr**](https://start.spring.io/)**：**一个在线工具，可让您配置项目依赖项、Java 版本、构建系统（如 Maven 或 Gradle）和其他参数。
2. **选择必要的依赖项：**对于 REST API，选择“Spring Web”。
3. **生成并下载您的项目：**配置完成后，您可以下载项目并在您最喜欢的 IDE 中打开它。

*注意*：*Spring Web 允许您使用 Spring MVC 构建 Web 应用程序，包括 RESTful 应用程序。它使用 Apache Tomcat 作为默认嵌入式容器。此功能对于开发高性能且易于扩展的 Web 服务至关重要，可与 Spring 生态系统顺畅高效地集成。*

*请记住，您必须事先安装 Maven 或 Gradle 才能下载项目依赖项。我使用 IntelliJ 作为 IDE，它自带 Maven，允许您将此部分委托给应用程序本身。*

创建一个简单的“Hello World”作为 REST API 要开始使用 Spring Boot 并熟悉其功能，我们可以创建一个简单的“Hello World”端点。方法如下：

1. **创建一个名为“controllers”的新包（文件夹）：**一旦我们的项目打开并且所有依赖项都下载完毕，我们将创建这个新包。

2. **在控制器包中创建一个新类：**此文件将处理 HTTP 请求。

3. **添加以下 Java 代码：**

   ```java
   package com.example.demo.controller;
   
   import org.springframework.web.bind.annotation.GetMapping;
   import org.springframework.web.bind.annotation.RestController;
   
   @RestController
   public class HelloWorldController {
   
       @GetMapping("/hello")
       public String sayHello() {
           return "Hello World";
       }
   }
   ```

4. **运行应用程序：**`mvn spring-boot:run`您可以从 IDE 执行此操作，或者如果您使用的是 Maven，则可以使用命令。从浏览器或 Postman 等 HTTP 客户端访问[http://localhost:8080/h](http://localhost:8080/hola) ello，您应该会看到“Hello World”消息。

这个基本练习不仅展示了使用 Spring Boot 创建端点的简易性，而且还为我们接下来的部分奠定了基础，在这些部分中我们将整合 DDD 和六边形架构。

如您所见，使用 Spring Boot 确实有效，它本质上提供了一个框架，该框架提供了工具和指南，可让您以迄今为止所需的最少手动配置高效地执行任务。当您想更多地关注业务开发而不是底层基础架构时，这种方法特别有用。

接下来，我们将进一步探讨上面代码中使用的注释，详细说明它们的用途以及它们如何促进应用程序的创建：

## Spring Boot 注解

### @RestController

注释`@RestController`是 Spring Boot 中创建 Web 服务的基础。此注释是 的特化`@Controller`，用于将类标记为控制器，其中每个方法都返回域对象而不是视图。它表示该类将处理对 REST API 的请求。使用`@RestController`，Spring 会根据配置自动将方法返回格式化为 JSON 或 XML。

### @GetMapping

该`@GetMapping`注解专门处理 GET 类型的 HTTP 请求。它用于将 HTTP GET 请求映射到控制器中的特定方法。它充当 的简写`@RequestMapping(method = RequestMethod.GET)`，使代码更具可读性和清晰度，尤其是在单个控制器中定义多个访问点时。

## Spring Boot 注解的优点

`@RestController`类似这样的注解`@GetMapping`大大简化了 RESTful API 的开发：

- **减少样板配置：**它们最大限度地减少了对 XML 或其他配置的需求，从而允许更清晰、更易于理解的代码。
- **声明式开发：**它们支持更具声明性的编程风格，其中服务器行为在类和方法中声明而不是明确配置。
- **易于维护和可读性：**它们使代码更易于维护和阅读，这对于团队合作和项目可扩展性至关重要。

结合这些注释不仅可以提高生产力，而且还能确保应用程序的健壮性、可扩展性且易于与其他技术和服务集成。

## Spring Boot 中常用注解

### @SpringBootApplication

此注释在任何 Spring Boot 应用程序中都必不可少，因为它充当了对三个基本注释进行分组的便捷声明：

- `@Configuration`：指定一个类作为应用程序上下文的 bean 定义的来源。
- `@EnableAutoConfiguration`：指示 Spring Boot 根据添加的项目依赖项开始自动配置框架。
- `@ComponentScan`：允许Spring扫描被注解的类及其子包所在的包，以自动注册Spring组件。

### @Autowired

用于自动依赖注入，该注解可以放在字段，构造函数或者特定方法上，让Spring无需手动配置就能提供必要的bean。

### @Service

将类标记为服务，这对于实现业务逻辑非常理想。虽然此注释本身不会改变行为，但它会告知 Spring 该类在业务层中扮演着特殊角色，从而便于在自动扫描期间检测到它。

### @Repository

表示某个类管理数据库访问，充当存储库。除了封装数据访问逻辑之外，Spring 还使用此批注将特定的持久性异常转换为其自己的通用、未经检查的数据访问异常层次结构。

### @RequestMapping

请求映射的通用注释，可用于配置 URL 到特定控制器方法的路由。它非常灵活，允许指定 HTTP 方法、路径、请求参数等。

### @PathVariable

此注解用于控制器方法映射，将 URL 的一段绑定到控制器方法参数。它对于直接从路径捕获动态值非常有用。

### @RequestParam

此批注用于将 HTTP 请求参数与控制器方法中的变量关联起来。它有助于处理 GET 或 POST 请求中的查询或表单参数。

### @EnableAutoConfiguration

虽然是 的一部分`@SpringBootApplication`，但单独提及以突出其目的还是很有用的：根据类路径上可用的库自动配置 Spring Boot。此注释大大减少了手动配置的需要。

## 附录：Spring Boot中常用配置

Spring Boot 简化了启动和运行应用程序所需的许多配置，但了解如何通过配置文件（如`application.properties`或）自定义基本方面`application.yml`至关重要。这些文件允许开发人员调整和定义控制应用程序行为的特定属性，例如：

- **服务器配置：**定义默认端口、会话设置和其他服务器参数。
- **数据库参数：**配置数据库连接属性，例如 URL、用户名和密码，以及连接池大小等方面。
- **日志记录级别：**调整应用程序的日志记录详细级别，这对于开发和生产期间的监控和调试至关重要。

掌握这些配置文件的使用不仅可以对应用程序进行精细的控制，而且还可以显著影响其性能和安全性。

## 其他资源和文档

对于那些希望深入了解 Spring Boot 各个方面（从高级配置到特定功能的实现）的人来说，官方文档是最全面、最新的资源。Spring Boot 文档提供指南、教程以及所有可能的功能和配置的完整参考。

[Spring Boot 官方文档](https://spring.io/projects/spring-boot#learn)

除了官方文档外，还有许多其他资源，例如在线课程、视频教程和讨论论坛，Spring Boot 社区非常活跃并愿意提供帮助。这些资源对于解决特定问题或通过实际示例和案例研究进行学习特别有用。

# 第 2 节：DDD（领域驱动设计）简介

## DDD 的解释及其与软件构建的相关性

领域驱动设计 (DDD) 是一种软件开发方法，侧重于软件试图建模的业务领域的复杂性。Eric Evans 在他的著作《领域驱动设计：解决软件核心的复杂性》中推广了这一方法。DDD 主张创建一个语言丰富且结构良好的领域模型，该模型将成为系统的核心以及所有设计和实施决策的基础。

DDD 在软件构建中的相关性在于它专注于领域和业务逻辑。这种方法促进了技术开发人员和非技术领域专家（如经理和最终用户）之间的沟通，有助于确保开发的软件忠实地反映业务的需求和复杂性。此外，DDD 有助于创建更灵活、更可扩展的系统，这些系统能够随着业务需求的变化而发展。

## DDD 的主要组件

DDD 围绕几个关键构建块构建，这些构建块有助于以清晰、实用的方式组织和封装业务逻辑：

- **实体：**这些对象即使其属性发生变化，也会随时间推移而具有连续身份。实体具有不变的唯一标识符 (ID)，因此可以在不同状态下和随时间推移持续跟踪。
- **值对象 (VO)：**这些对象不具备身份，仅通过其属性进行描述。值对象是不可变的，这意味着一旦创建，其状态就无法改变。
- **聚合：**聚合是一组域对象（实体和值对象），在数据处理时可将其视为一个单元。每个聚合都有一个根和一个明确的边界，在该边界内强制执行一致性。
- **存储库：**它们提供检索实体和聚合的方法，并从业务领域抽象出数据库访问逻辑。存储库充当实体和聚合的某种工厂，但也处理持久性。

## 简单领域建模的实例

为了说明如何在实践中应用 DDD，请考虑一个书店管理系统：

**实体：**书籍

- **属性：**书籍 ID、标题、作者、价格。
- **行为：**更新价格，更改描述。

**值对象：**作者

- **属性：**姓名、国籍。
- **不可变：**意味着如果作者的信息需要更新，则会创建该对象的新实例。

**聚合：图书目录**

- **聚合根：**目录，包含多本书。
- **边界：**目录内的操作不会直接影响系统的其他部分，例如订单或客户。

**存储库：书籍存储库**

- **方法：**将书籍添加到目录、删除书籍、按类型或作者等各种标准搜索书籍。

该模型不仅清晰地组织了信息的结构和访问方式，而且还确保了系统的健壮性、可扩展性，并能够处理操作和业务规则的变化。

# 第 3 节：DDD 中的实施策略

在软件项目中实施领域驱动设计 (DDD) 需要深入了解业务需求，并制定清晰的策略来有效地对领域进行建模。这里我们详细介绍了 DDD 实施在实际应用中至关重要的两个关键方面：集成和有界上下文，以及事件源和 CQRS 的使用。

## 集成和有界上下文

DDD 的基石之一是有界上下文的概念。此概念指的是领域模型中应用特定规则和业务逻辑的功能的明确界定。在大型系统中，不同的有界上下文可以共存，每个上下文都有自己的领域模型，并且仅在该上下文中有效。

上下文之间的映射：在复杂的系统中，不同的团队负责系统的不同部分，因此在有界上下文之间建立清晰的映射至关重要。这是通过定义模型如何交互和通信的集成模式来实现的。一些常见的模式包括：

- **防腐层 (ACL)：**用于防止外部上下文的变化直接影响内部上下文的模式。它充当在两个域模型之间进行转换的适配器。
- **客户端/服务器：**其中一个上下文是客户端，向另一个充当服务器的上下文发出请求。
- **事件发布：**一个上下文中的变化通过事件进行传达，其他上下文可以处理而无需直接耦合。

## 事件源和 CQRS

事件溯源是一种将应用程序状态的变化存储为事件序列的技术。系统不仅仅存储实体的最终状态，还保存已更改该实体状态的事件的不可变记录。这不仅有助于审计和跟踪变化的历史，还允许随时重建实体的过去状态。

**命令查询责任分离 (CQRS)**是 DDD 中的另一个重要模式，它提出将命令处理（写入）逻辑与查询（读取）逻辑分开。这允许对两个方面进行独立优化，从而提高性能和可扩展性。CQRS 与事件源配合良好，因为可以从事件构建查询，从而允许：

- **水平可扩展性：**读写操作可以独立扩展。
- **最终一致性：**尽管读取视图可能不会立即反映状态的变化（这在分布式系统中很常见），但它们最终会同步。

在 DDD 环境中，事件源和 CQRS 的结合可以解决许多与数据一致性和可扩展性相关的常见问题，尤其是在复杂的分布式系统中。

## DDD 中的模式和原则

领域驱动设计不仅建立在强大的领域模型和可靠的架构之上，还建立在特定设计模式的实现之上，这些模式有助于处理复杂性并促进更清晰、更易于维护的代码。这里我们详细介绍了 DDD 中常用的三种关键模式：

**工厂**

工厂模式在 DDD 中用于封装创建实体和值对象的逻辑，确保这些对象处于一致且有效的状态。当对象创建涉及复杂逻辑或初始化多个属性（这些属性必须满足某些业务规则才能使用）时，该模式特别有用。

例子：

- 想象一个实体`Account`可以有多种类型，例如`CheckingAccount`或`SavingsAccount`。`AccountFactory`可以根据提供的参数创建适当的 实例`Account`，确保根据帐户类型正确实施初始设置，例如分配帐号和配置利率。

**存储库**

存储库模式充当域和数据映射层之间的中介，提供一种抽象，允许将实体集合当作内存中的集合来处理。它支持搜索、插入和删除实体等操作，而无需公开持久性实现的细节。

例子：

- `UserRepository`可能会抽象出添加、删除、更新或搜索用户所需的数据库操作。例如，它可以有`saveUser(User user)`、`deleteUserById(String id)`或等方法`findUsersByName(String name)`，每个方法都封装了操作数据库中的用户数据所需的 SQL 查询或 API 调用。

**策略**

策略模式用于定义一系列可互换的算法，这些算法可以根据业务需求在运行时进行选择和更改。它允许应用程序在不同条件下动态地适应和应用不同的行为。

例子：

考虑一个物流系统，该系统可以根据货物的地区和紧急程度使用不同的运费计算策略。您可以有一个`ShippingCalculationStrategy`具有多种实现的界面，例如`StandardShipping`，`ExpressShipping`和`InternationalShipping`。系统可以根据客户选择的目的地和送货速度动态更改运费计算策略。

这些实现策略和模式对于使 DDD 有效管理领域复杂性以及提高软件的可维护性和可扩展性至关重要。

# 第 4 节：六边形架构

## 什么是六边形架构？

六边形架构，也称为“端口和适配器模式”，由 Alistair Cockburn 提出。它是一种架构模式，旨在促进应用程序的业务逻辑与它与外部世界交互的细节之间的分离。其核心思想是应用程序围绕核心域构建，以业务逻辑为核心，并通过端口和适配器与外界通信。这使应用程序可以独立于外部服务（例如数据库、文件系统、Web 界面等），从而便于集成和交换这些服务而不影响业务逻辑。

## 在 Spring Boot 项目中使用六边形架构的优势

使用 Spring Boot 在项目中实现六边形架构有几个显著的优点：

- **组件解耦：**业务逻辑和外围基础设施之间的严格分离允许修改或替换组件而不会影响业务核心。
- **易于测试：**通过将业务逻辑与外部接口分离，可以轻松模拟端口和适配器，从而简化自动化测试（尤其是单元测试）的创建。
- **集成灵活性：**可以轻松与不同类型的数据库技术、队列系统或 Web 服务集成，因为可以修改或替换适配器而无需更改业务逻辑。
- **可扩展性和维护性：**通过允许系统的不同部分独立发展来增强系统的可扩展性。此外，由于职责明确划分，维护变得更加易于管理。

## 六边形建筑结构图

为了更好地形象化地展示六边形架构的工作原理，请考虑一个说明其主要组件排列的基本图表：

![img](https://miro.medium.com/v2/resize:fit:1400/1*L8_40RsZJvYSl8sILtUcsQ.png)

在此图中：

- **核心（或域）**包含所有独立于外部接口的业务逻辑和业务规则。
- **端口**表示业务逻辑与外部世界通信的接口。在 Spring Boot 中，这些接口可以是 REST 服务接口、数据库接口等。
- **适配器**是将端口连接到特定技术（如 SQL 数据库、REST 服务或电子邮件客户端）的具体实现。

## Spring Boot 中的六边形架构

Spring Boot 中的六边形架构特别强大，因为 Spring 可以轻松处理依赖项注入，从而可以灵活且可控地配置和管理特定适配器。这种结构不仅强化了控制反转原则，而且还使软件设计与稳健且可持续的开发实践保持一致。

这种架构有助于设计能够适应技术环境变化的系统，从而能够更敏捷地响应不断变化的业务需求。它特别适合业务规则需要明确划分且测试、可维护性和灵活性至关重要的复杂应用程序。

# 第 5 节：Spring Boot 中 DDD 与六边形架构的集成

Spring Boot 中领域驱动设计 (DDD) 与六边形架构的集成为构建复杂且可扩展的系统提供了强大的结构。您提出的目录结构与这两种方法的原则非常吻合，促进了清晰和模块化的设计。接下来，我将扩展如何在此结构中组织代码的描述，并详细说明每个文件夹的用途。

## 目录结构和目的

重要的是要理解，这是一个旨在充分说明我们正在讨论的内容的示例，但它不是绝对的真理；这种设计可能因互联网上开发人员的文章、想法和意见而异。

```
project-root/
├── application/
│   ├── ports/
│   │   ├── inbound/
│   │   │   └── // Contains interfaces that define the entry points to the application. These ports are used by external agents interacting with the application, such as user interfaces or REST API requests.
│   │   └── outbound/
│   │       └── // Defines interfaces for external services that the application needs to consume, such as databases or external REST services. These ports help decouple the business logic from the implementation details of accessing external resources.
│   └── services/
│       └── // Implements the application logic coordinating activities between the ports and the domain. Application services play a crucial role in orchestrating domain operations, executing business logic, and acting as a bridge between the domain and infrastructure adapters.
├── domain/
│   ├── exceptions/
│   │   └── // Defines specific domain exceptions that can be thrown by the business logic.
│   ├── entities/
│   │   └── // Contains the domain entities that encapsulate critical business logic and data.
│   └── other domain folders/
│       └── // May include value objects, aggregates, domain events, etc., which are fundamental to the business logic and domain rules.
└── infrastructure/
    ├── adapters/
    │   ├── inbound/
    │   │   ├── rest/
    │   │   │   └── // Implements adapters for web interfaces, handling incoming HTTP requests and transforming them into calls to the appropriate inbound ports.
    │   │   ├── tasks/
    │   │   │   └── // For scheduled tasks that perform periodic operations within the application.
    │   │   └── events/
    │   │       └── // Manages the capture and processing of system events or integration events with other systems.
    │   └── outbound/
    │       ├── persistence/
    │       │   └── // Implements data persistence, for example, using JPA to interact with databases, encapsulating all data access logic.
    │       └── rest/
    │           └── // Contains the adapters needed to make calls to external APIs, encapsulating the logic of how to interact with other web services.
    └── configuration/
        └── // Specific configurations of the framework and infrastructure, such as security settings, Spring beans configuration, etc.
```



## 实现示例

想象一下，我们正在构建一个应用程序来管理在线商店的订单：

**端口**

- 入站（`OrderController`）：定义如何通过 REST API 接受订单。
- 出站（`OrderRepository`）：定义订单如何在数据库中保存。
- 服务（`OrderService`）：协调订单的接收、根据业务规则的验证以及最终通过的持久保存`OrderRepository`。

**适配器**

- 入站（`RestAdapter`对于`OrderController`）：接收 API 请求、验证它们，然后将它们重定向到`OrderService`。
- 出站（`JPAAdapter`对于 `OrderRepository`）：`OrderRepository`使用JPA实现接口，管理数据库中订单的持久化。

## 域逻辑与外部基础结构/API 之间的连接

使用这种结构， `domain`中的领域逻辑仍然完全专注于业务规则和领域操作，与基础结构或外部接口的任何细节完全隔离。`infrastructure` 中的  `adapters`  负责在来自外部世界的请求和域操作之间进行转换，维护域核心的完整性和内聚力。

这种工作组织方式不仅能有效地保持良好的封装和关注点分离，而且有利于系统的可扩展性和维护性。

# 第 6 节：实现设计模式

在软件开发中，特别是在使用领域驱动设计 (DDD) 和六边形架构的环境中，设计模式起着至关重要的作用。这些模式不仅有助于实现复杂的解决方案，而且还能提高代码的质量和可维护性。在这里，我们探讨了一些常见的模式、它们在 Spring Boot 中的实现，以及将这些模式与 DDD 和六边形架构相结合的好处。

## DDD 和六边形架构中的常见设计模式

- **工厂：**用于封装对象创建，确保它们在有效状态下被创建。
- **存储库：**抽象语义丰富的接口背后的数据访问操作的复杂性。
- **策略：**允许在运行时改变软件行为。
- **适配器：**在六边形架构中，转换数据输入和输出，将业务逻辑与基础设施细节分离。
- **外观：**简化大型系统中的复杂界面。
- **观察者：**用于实现领域事件，使得系统的不同部分可以不耦合地对变化做出反应。

## Spring Boot 实现示例

**工厂：**例如，用于创建帐户对象的工厂（可能有不同类型，如 CheckingAccount 和 SavingsAccount）可以使用静态方法或 Spring 服务来实现，并为帐户创建注入必要的依赖项。

```java
@Service
public class AccountFactory {

    public Account createAccount(String type) {
        if ("current".equals(type)) {
            return new CheckingAccount();
        } else if ("savings".equals(type)) {
            return new SavingsAccount();
        } else {
            throw new IllegalArgumentException("Unknown account type");
        }
    }
}
```

**存储库：**在 Spring Boot 中，可以使用 Spring Data JPA 轻松实现存储库。通过定义扩展 JpaRepository 的接口，Spring 将在运行时自动生成实现。

```java
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByClientId(Long clientId);
}
```

**适配器：** Spring Boot 中的适配器可以作为控制器实现，以将 HTTP 调用适配到业务逻辑。

```java
@RestController
public class AccountController {
    private final AccountService accountService;
    
    @Autowired
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/accounts/{clientId}")
    public List<Account> listClientAccounts(@PathVariable Long clientId) {
        return accountService.getAccountsByClient(clientId);
    }
}
```

您可以在[Refactoring Guru](https://refactoring.guru/design-patterns)上了解有关设计模式的更多信息，强烈建议您先了解一下模式以及如何根据编程语言实现它们。我鼓励您查看一下。

## 将设计模式与 DDD 和六边形架构相结合的好处

使用 Spring Boot、DDD 和六边形架构在项目中实现这些设计模式可确保架构不仅健壮，而且能够适应变化并易于随着时间的推移进行维护。

- **一致性和清晰度：**使用设计模式有助于标准化常见问题的解决方案，从而提高代码一致性并简化新开发人员的理解。
- **代码重用：**设计模式促进代码重用，从而减少重复和潜在错误。
- **解耦：** Repository 和 Adapter 等模式有助于将业务逻辑与基础设施和数据访问问题解耦，从而提高可维护性和可扩展性。
- **灵活性和可扩展性：**使用设计模式可以使系统更加灵活且更易于扩展，因为系统某一部分的变化对其他部分的影响被最小化。

# 第 7 节：构建和测试 API

## 向 API 添加功能的分步指南

使用 Spring Boot 构建强大且可扩展的 API 涉及几个战略步骤。以下是向 API 添加功能的详细分步过程：

- **需求定义和领域建模：**首先明确了解业务需求，然后使用 DDD 原则对领域进行建模。这包括定义明确表示业务的实体、值对象和聚合。
- **设置 Spring Boot 项目：**使用 Spring Initializr 创建一个新的 Spring Boot 项目。选择必要的依赖项，例如 Spring Web、Spring Data JPA 以及与您的项目相关的任何其他依赖项。
- **实现业务逻辑：**在领域核心中开发业务逻辑，确保领域实体和服务得到良好的封装并且不受基础架构逻辑的影响。
- **数据库集成：**使用 Spring Data JPA 配置存储库来管理域实体的持久性。
- **创建 API 适配器：**在基础架构层实现适配器，以通过 REST API 公开业务逻辑。使用`@RestController`和等注释`@RequestMapping`将 HTTP 请求映射到相应的方法。
- **验证和错误处理：**确保 API 正确处理输入验证并以充分告知 API 客户端有关无效输入或操作失败等问题的方式管理错误。

## 测试 API 的方法

测试 API 对于确保其按预期运行至关重要。使用 Postman 和 Swagger 等工具进行全面测试：

- **Postman：**允许您向 API 发送 HTTP 请求并查看响应。您可以创建代表不同用例和错误场景的请求集合，以确保您的 API 能够适当地处理所有情况。
- **Swagger（现称为 OpenAPI）：**集成 Swagger 以自动生成 API 的交互式文档。这不仅方便测试，还可以作为 API 使用者的实时文档。Swagger UI 允许用户直接从浏览器与 API 交互。

# 结论

在本文中，我们探讨了如何使用 Spring Boot、领域驱动设计 (DDD) 和六边形架构来改变 RESTful API 的开发，使其更加健壮、可扩展和可维护。我们已经了解了如何使用现代工具组织代码、实现业务逻辑和测试 API。

特别是 DDD 与六边形架构的结合，为处理大型应用程序中的复杂性提供了强大的结构，确保业务逻辑保持纯粹并与外部技术和基础设施分离。

我邀请您尝试这些方法，并发现它们如何改善 API 的设计和维护。深入研究这些概念可以为您的未来项目提供新的、有价值的视角，鼓励创建不仅满足功能要求而且灵活且易于发展的软件。

探索、学习，当您在软件开发项目中采用这些方法时，不要犹豫地分享您的经验和学习成果
