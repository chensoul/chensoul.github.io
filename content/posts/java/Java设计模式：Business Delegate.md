---
title: "Java设计模式：Business Delegate"
date: 2023-09-05
slug: java-design-patterns-business-delegate
categories: ["Java"]
tags: [java]
---

本文主要介绍 [Business Delegate](https://java-design-patterns.com/zh/patterns/business-delegate/) 业务委托模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

## 介绍

业务委托模式（Business Delegate Pattern）在表示层和业务层之间引入了一个抽象层，旨在实现这两个层之间的松散耦合，并封装了有关如何定位、连接和交互业务对象的逻辑。

在该模式中，业务委托（Business Delegate）充当一个中间人角色，负责将表示层的调用委托给业务对象。它隐藏了具体业务对象的实现细节，包括底层服务的查找和可访问性，以提供简化的接口供表示层使用。

业务委托模式用于解耦表示层和业务层。它基本上用于减少表示层代码中业务层代码的通信或远程查找功能。在业务层，我们有以下实体。

- **Client** - 表示层代码可以是 JSP、Servlet 或 UI java 代码。
- **Business Delegate** -业务委托 - 客户端实体提供对业务服务方法的访问的单个入口点类。
- **LookUp Service** - 查找服务对象负责获取相关业务实现并提供对业务委托对象的业务对象访问。
- **Business Service** - 业务服务接口。具体类实现该业务服务以提供实际的业务实现逻辑。

以下是一个示例的程序代码，演示了业务委托模式的实现：

```java
public interface VideoStreamingService {
  void doProcessing();
}

@Slf4j
public class NetflixService implements VideoStreamingService {
  @Override
  public void doProcessing() {
    LOGGER.info("NetflixService is now processing");
  }
}

@Slf4j
public class YouTubeService implements VideoStreamingService {
  @Override
  public void doProcessing() {
    LOGGER.info("YouTubeService is now processing");
  }
}

@Setter
public class BusinessLookup {
  private NetflixService netflixService;
  private YouTubeService youTubeService;

  public VideoStreamingService getBusinessService(String movie) {
    if (movie.toLowerCase(Locale.ROOT).contains("die hard")) {
      return netflixService;
    } else {
      return youTubeService;
    }
  }
}

@Setter
public class BusinessDelegate {
  private BusinessLookup lookupService;

  public void playbackMovie(String movie) {
    VideoStreamingService videoStreamingService = lookupService.getBusinessService(movie);
    videoStreamingService.doProcessing();
  }
}

public class MobileClient {
  private final BusinessDelegate businessDelegate;

  public MobileClient(BusinessDelegate businessDelegate) {
    this.businessDelegate = businessDelegate;
  }

  public void playbackMovie(String movie) {
    businessDelegate.playbackMovie(movie);
  }
}

public static void main(String[] args) {
  // 准备对象
  var businessDelegate = new BusinessDelegate();
  var businessLookup = new BusinessLookup();
  businessLookup.setNetflixService(new NetflixService());
  businessLookup.setYouTubeService(new YouTubeService());
  businessDelegate.setLookupService(businessLookup);

  // 创建客户端并使用业务委托
  var client = new MobileClient(businessDelegate);
  client.playbackMovie("Die Hard 2");
  client.playbackMovie("Maradona: The Greatest Ever");
}
```

上述示例中，`VideoStreamingService`是一个抽象接口，由具体的实现类`NetflixService`和`YouTubeService`实现。`BusinessLookup`负责根据电影名称选择合适的视频流服务。`BusinessDelegate`则使用`BusinessLookup`来将电影播放请求路由到适当的视频流服务。`MobileClient`作为移动客户端使用业务委托来调用业务层。

类图：

![alt text](https://java-design-patterns.com/assets/business-delegate.urm-c770e4ad.png)

## 适用场景

业务委托模式适用于以下场景：

1. 松散耦合：当需要在表示层和业务层之间实现松散耦合时，可以使用业务委托模式。该模式通过引入一个抽象层，将表示层与具体的业务对象解耦，使它们可以独立演化和修改。
2. 多个业务服务的调用编排：当需要对多个业务服务进行编排和协调时，业务委托模式可以提供一个统一的接口供表示层调用。委托对象负责决定如何分配请求给不同的业务服务，并处理可能的错误和异常情况。
3. 封装查找服务和服务调用：业务委托模式可以封装底层服务的查找和调用过程。通过将这些实现细节隐藏在委托对象中，表示层可以更专注于业务逻辑的处理，而不需要关注底层服务的具体实现和访问方式。

虽然业务委托模式没有在所有开源框架中以明确的形式出现，但它的核心思想可以在许多框架和应用程序中找到。

在开源框架中，你可能会看到以下方式来使用业务委托模式：

1. 服务代理：许多开源框架使用代理模式来封装底层服务，并为客户端提供一个统一的接口。这个代理对象可以被视为业务委托对象，它负责处理底层服务的调用和错误处理，同时隐藏了底层服务的具体实现细节。客户端只需要与代理对象进行交互，而不需要直接与底层服务进行通信。
2. 依赖注入（DI）：开源框架通常支持依赖注入，它可以用于将业务委托对象注入到其他组件中。通过依赖注入，你可以将具体的业务委托对象与客户端代码解耦，使其更易于测试、扩展和维护。框架通常提供了相应的注入机制，如构造函数注入、属性注入或使用注解进行注入。
3. 中间件和消息代理：某些开源框架专注于中间件或消息代理，用于处理不同服务之间的通信。这些框架可能提供一种机制，允许你定义业务委托对象，并通过中间件或消息代理将请求路由到相应的服务。这种方式可以帮助实现业务逻辑的解耦和灵活性。

需要明确的是，业务委托模式并不是所有开源框架中的显式设计模式。然而，许多框架和库借鉴了业务委托模式的思想，以提供更好的模块化、可测试性和可维护性。在使用开源框架时，你可以查看框架的文档和示例，以了解是否有类似于业务委托模式的概念或最佳实践可供参考。
