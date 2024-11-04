---
title: "Java设计模式：API Gateway "
date: 2023-08-13
type: post
slug: java-design-patterns-api-gateway
categories: ["Java"]
tags: [java]
---

本文主要介绍 API Gateway 模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

## 目的

API 网关设计模式旨在将所有对微服务的调用聚合到一起。客户端通过调用 API 网关来实现对多个微服务的访问，而不是直接调用每个微服务。这种模式的目的是解决以下问题：

1. 减少客户端的网络请求：如果客户端直接调用每个微服务，会导致额外的网络请求，增加加载时间。通过使用 API 网关，客户端只需要进行一次调用，而不是多次调用。
2. 解耦客户端和微服务：如果客户端直接与每个微服务进行通信，客户端与微服务之间的耦合度很高。当微服务的实现发生变化或位置发生变化时，需要更新所有客户端。使用 API 网关可以将客户端与具体的微服务解耦，客户端只需要与 API 网关通信。
3. 提供集中化的功能和服务：API 网关可以实现一些通用的功能和服务，例如限流、认证、授权、安全性等。这样可以避免每个微服务都实现这些功能，减少重复代码。

## 解释

在实际应用中，API 网关通常包括一个转换引擎，用于实时地编排和修改请求和响应。它还可以提供收集分析数据和提供缓存等功能。另外，API 网关还可以支持身份验证、授权、安全性、审计和法规遵从性等功能。

假设你正在开发一个电子商务平台，其中包含多个微服务，如用户服务、产品服务、图片服务、订单服务和支付服务等。每个微服务都有自己的 API 和数据库。

在这种情况下，你可以引入一个 API 网关来处理对这些微服务的访问。API 网关作为一个入口点，接收来自客户端的请求，并将请求转发到适当的微服务。

例如，当一个客户端需要获取某个产品的详细信息时，他们可以发送一个 HTTP 请求到 API 网关的特定端点。API 网关会验证请求并将其转发到产品服务。产品服务将查询数据库获取产品信息，并将响应返回给 API 网关。然后，API 网关将产品信息返回给客户端。

API 网关可以实现以下功能：

1. 认证和授权：API 网关可以验证客户端的身份和权限，确保只有经过授权的用户能够访问特定的微服务。
2. 请求转发和路由：API 网关根据请求的路径和参数将请求转发到适当的微服务。它可以执行负载均衡和路由策略，确保请求被正确地分发到相应的微服务实例。
3. 响应聚合：如果一个请求需要从多个微服务获取数据，API 网关可以将这些请求发送给相应的微服务，并将它们的响应聚合到一个响应中返回给客户端。
4. 缓存和性能优化：API 网关可以缓存常用的请求和响应，以提高性能并减轻后端微服务的负载。
5. 安全性和监控：API 网关可以实施安全策略，例如防止恶意请求和 DDoS 攻击。它还可以监控请求和响应，收集应用程序的指标和日志数据。

**程序示例**

此实现展示了电子商务站点的 API 网关模式。` ApiGateway`分别使用` ImageClientImpl`和` PriceClientImpl`来调用 Image 和 Price 微服务。 在桌面设备上查看该网站的客户可以看到价格信息和产品图片，因此` ApiGateway`会调用这两种微服务并在`DesktopProduct`模型中汇总数据。 但是，移动用户只能看到价格信息。 他们看不到产品图片。 对于移动用户，`ApiGateway`仅检索价格信息，并将其用于填充`MobileProduct`模型。

这个是图像微服务的实现。

```java
public interface ImageClient {
  String getImagePath();
}

public class ImageClientImpl implements ImageClient {
  @Override
  public String getImagePath() {
    var httpClient = HttpClient.newHttpClient();
    var httpGet = HttpRequest.newBuilder()
        .GET()
        .uri(URI.create("http://localhost:50005/image-path"))
        .build();

    try {
      var httpResponse = httpClient.send(httpGet, BodyHandlers.ofString());
      return httpResponse.body();
    } catch (IOException | InterruptedException e) {
      e.printStackTrace();
    }

    return null;
  }
}
```

这里是价格服务的实现。

```java
public interface PriceClient {
  String getPrice();
}

public class PriceClientImpl implements PriceClient {

  @Override
  public String getPrice() {
    var httpClient = HttpClient.newHttpClient();
    var httpGet = HttpRequest.newBuilder()
        .GET()
        .uri(URI.create("http://localhost:50006/price"))
        .build();

    try {
      var httpResponse = httpClient.send(httpGet, BodyHandlers.ofString());
      return httpResponse.body();
    } catch (IOException | InterruptedException e) {
      e.printStackTrace();
    }

    return null;
  }
}
```

在这里，我们可以看到 API 网关如何将请求映射到微服务。

```java
public class ApiGateway {

  @Resource
  private ImageClient imageClient;

  @Resource
  private PriceClient priceClient;

  @RequestMapping(path = "/desktop", method = RequestMethod.GET)
  public DesktopProduct getProductDesktop() {
    var desktopProduct = new DesktopProduct();
    desktopProduct.setImagePath(imageClient.getImagePath());
    desktopProduct.setPrice(priceClient.getPrice());
    return desktopProduct;
  }

  @RequestMapping(path = "/mobile", method = RequestMethod.GET)
  public MobileProduct getProductMobile() {
    var mobileProduct = new MobileProduct();
    mobileProduct.setPrice(priceClient.getPrice());
    return mobileProduct;
  }
}
```

## 类图

![alt text](https://java-design-patterns.com/assets/api-gateway-fe73287d.png)

## 适用性

- API 网关模式适用于以下情况：

  1. 微服务架构：当你的应用程序采用微服务架构时，每个微服务负责特定的业务功能。API 网关可以作为微服务架构的入口点，聚合和管理所有微服务的访问。
  2. 多渠道访问：如果你的应用程序需要支持多个客户端渠道（如 Web、移动应用、第三方集成等），API 网关可以提供统一的接入点，处理不同渠道的请求，并将其转发到相应的微服务。
  3. 安全性和认证：当你需要对客户端进行身份验证和授权，并确保只有合法用户能够访问你的微服务时，API 网关可以实施安全性策略，集中管理认证和授权。
  4. 请求聚合和转换：如果客户端需要从多个微服务获取数据，并希望将这些数据聚合为单个响应，API 网关可以处理这种请求聚合，并在需要时转换请求和响应的格式。
  5. 性能优化和缓存：API 网关可以实现请求的缓存机制，减少对后端微服务的重复请求，提高性能和响应时间。
  6. 监控和日志记录：通过集中管理请求和响应的流量，API 网关可以收集应用程序的指标和日志数据，用于监控和故障排除。

  总的来说，API 网关模式适用于需要对微服务架构进行统一管理、安全性控制、请求聚合、性能优化和监控的场景。它提供了一个中心化的入口点，简化了客户端与微服务之间的通信，并提供了额外的功能和服务。

## 参考

- "API Gateway" - Martin Fowler: [https://martinfowler.com/articles/microservices.html#APIGateway](https://martinfowler.com/articles/microservices.html#APIGateway)

- "API Gateway" - AWS Well-Architected Framework: [https://wa.aws.amazon.com/wat.pillar.apigateway.en.html](https://wa.aws.amazon.com/wat.pillar.apigateway.en.html)

- "Introduction to API Gateways" - NGINX: [https://www.nginx.com/api-gateway/](https://www.nginx.com/api-gateway/)

- [microservices.io - API Gateway](http://microservices.io/patterns/apigateway.html)
- [NGINX - Building Microservices: Using an API Gateway](https://www.nginx.com/blog/building-microservices-using-an-api-gateway/)
- [Microservices Patterns: With examples in Java](https://www.amazon.com/gp/product/1617294543/ref=as_li_qf_asin_il_tl?ie=UTF8&tag=javadesignpat-20&creative=9325&linkCode=as2&creativeASIN=1617294543&linkId=ac7b6a57f866ac006a309d9086e8cfbd)
- [Building Microservices: Designing Fine-Grained Systems](https://www.amazon.com/gp/product/1491950358/ref=as_li_qf_asin_il_tl?ie=UTF8&tag=javadesignpat-20&creative=9325&linkCode=as2&creativeASIN=1491950358&linkId=4c95ca9831e05e3f0dadb08841d77bf1)
