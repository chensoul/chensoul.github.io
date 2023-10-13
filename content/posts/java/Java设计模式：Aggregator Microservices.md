---
title: "Java设计模式：Aggregator Microservices"
date: 2023-06-26T07:00:00+08:00
slug: java-design-patterns-aggregator-microservices
categories: ["Java"]
tags: [java]
draft: false
---

本文主要介绍 Aggregator Microservices 模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

> [Java Design Patterns](https://java-design-patterns.com/) 提供了各种 Java 设计模式的介绍、示例代码和用例说明。该网站旨在帮助 Java 开发人员了解和应用各种常见的设计模式，以提高代码的可读性、可维护性和可扩展性。
>
> Java Design Patterns 网站提供了多种设计模式分类方式，包括创建型模式（Creational Patterns）、结构型模式（Structural Patterns）和行为型模式（Behavioral Patterns），以及其他一些常见的模式。
>
> 对于每个设计模式，该网站提供了详细的介绍、示例代码和用例说明，并且提供了一些常见的使用场景和注意事项。开发人员可以根据自己的需求选择适合自己的设计模式，并且可以参考示例代码和用例说明来理解和应用该模式。
>
> 此外，Java Design Patterns 网站还提供了一些其他资源，如设计模式的 UML 图、设计模式的优缺点、设计模式的比较等。这些资源可以帮助开发人员更好地理解和应用设计模式。
>
> 中文网站：[https://java-design-patterns.com/zh/](https://java-design-patterns.com/zh/)
>
> Github 上源码仓库（非官方）：[https://github.com/iluwatar/java-design-patterns](https://github.com/iluwatar/java-design-patterns)

## 意图

用户对聚合器服务进行一次调用，然后聚合器将调用每个相关的微服务。

> Aggregator Microservices 是一种微服务架构模式，用于解决大型分布式系统中的数据聚合问题。该模式通常用于有多个数据源的场景，例如电子商务网站中的产品列表页面，其中需要从多个服务中获取产品信息并组合在一起显示。
>
> Aggregator Microservices 模式包括一个聚合器服务和多个后端服务。聚合器服务负责从多个后端服务中收集数据，并将数据组合成一个聚合的响应。后端服务则负责提供特定的数据源，例如产品信息、库存信息、价格信息等。

## 解释

真实世界例子

> 我们的网络市场需要有关产品及其当前库存的信息。 它调用聚合服务，聚合服务依次调用产品信息微服务和产品库存微服务，返回组合信息。

通俗地说

> 聚合器微服务从各种微服务中收集数据，并返回一个聚合数据以进行处理。

Stack Overflow 上说

> 聚合器微服务调用多个服务以实现应用程序所需的功能。

**程序示例**

让我们从数据模型开始。 这是我们的`产品`。

```java
public class Product {
  private String title;
  private int productInventories;
  // getters and setters ->
  ...
}
```

接下来，我们将介绍我们的聚合器微服务。 它包含用于调用相应微服务的客户端`ProductInformationClient`和` ProductInventoryClient`。

```java
@RestController
public class Aggregator {

  @Resource
  private ProductInformationClient informationClient;

  @Resource
  private ProductInventoryClient inventoryClient;

  @RequestMapping(path = "/product", method = RequestMethod.GET)
  public Product getProduct() {

    var product = new Product();
    var productTitle = informationClient.getProductTitle();
    var productInventory = inventoryClient.getProductInventories();

    //Fallback to error message
    product.setTitle(requireNonNullElse(productTitle, "Error: Fetching Product Title Failed"));

    //Fallback to default error inventory
    product.setProductInventories(requireNonNullElse(productInventory, -1));

    return product;
  }
}
```

这是产品信息微服务的精华实现。 库存微服务类似，它只返回库存计数。

```java
@RestController
public class InformationController {
  @RequestMapping(value = "/information", method = RequestMethod.GET)
  public String getProductTitle() {
    return "The Product Title.";
  }
}
```

现在调用我们的聚合器 REST API 会返回产品信息。

```bash
curl http://localhost:50004/product
{"title":"The Product Title.","productInventories":5}
```

## 特点

以下是该模式的一些关键特点：

- 多个后端服务：Aggregator Microservices 模式通常涉及多个后端服务，每个后端服务负责提供特定类型的数据。
- 数据聚合：聚合器服务负责从多个后端服务中收集数据，并将数据组合成一个聚合的响应。
- 透明的组合：聚合器服务应该尽可能透明地组合数据，使其对调用方看起来像是一个单一的数据源。
- 异步通信：由于后端服务可能位于不同的网络位置，聚合器服务通常使用异步通信来收集数据。

Aggregator Microservices 模式可以带来许多好处，例如：

- 可伸缩性：由于聚合器服务可以并行地从多个后端服务中收集数据，因此该模式可以通过增加后端服务来实现可伸缩性。
- 低耦合性：后端服务和聚合器服务之间的低耦合性使得系统更加灵活，可以更轻松地添加、修改或删除后端服务。
- 可定制性：聚合器服务可以根据需要自定义数据聚合的逻辑，以满足特定的业务需求。

## 类图

![alt text](https://java-design-patterns.com/assets/aggregator-service-4c5a6036.png)

## 适用性

Aggregator Microservices 模式可以应用于各种不同的场景，以下是一些常见的应用：

1. 电子商务平台：在电子商务平台中，通常需要从多个供应商那里获取产品信息和价格，并将其聚合到一个统一的产品列表中。Aggregator Microservices 可以用来处理这些数据源，并将数据聚合到一个共同的产品列表中。
2. 新闻聚合平台：在新闻聚合平台中，需要从不同的新闻来源获取新闻内容，并将其聚合到一个统一的新闻列表中。Aggregator Microservices 可以用来处理这些新闻来源，并将新闻内容聚合到一个共同的新闻列表中。
3. 金融数据分析：在金融数据分析中，需要从多个数据源中获取数据，例如股票市场数据、货币汇率数据、经济指标数据等，并将数据聚合到一个统一的数据分析工具中。Aggregator Microservices 可以用来处理这些数据源，并将数据聚合到一个共同的数据分析工具中。
4. 物联网平台：在物联网平台中，需要从多个传感器获取数据，并将其聚合到一个统一的数据中心中。Aggregator Microservices 可以用来处理这些传感器数据源，并将数据聚合到一个共同的数据中心中。

Aggregator Microservices 可以使用多种实现方式来实现数据聚合，以下是一些常见的实现方式：

1. 同步阻塞方式：在这种方式下，聚合器服务按照顺序从多个后端服务中收集数据，每次收集完一个服务的数据后再收集下一个服务的数据，直到所有数据都被收集完毕。这种方式的缺点是效率较低，因为所有操作都是同步阻塞的。
2. 异步非阻塞方式：在这种方式下，聚合器服务使用异步非阻塞的方式从多个后端服务中收集数据，这可以提高效率和性能。例如，聚合器服务可以使用 Java 8 的 CompletableFuture 和流式 API 来实现异步通信并行收集数据。
3. 数据库方式：在这种方式下，每个后端服务负责将数据写入数据库中，聚合器服务再从数据库中读取数据并进行聚合。这种方式的优点是可以使用数据库的高效查询语句来聚合数据，但缺点是需要额外的数据库管理开销。
4. 消息队列方式：在这种方式下，每个后端服务将数据发送到一个共享的消息队列中，聚合器服务再从队列中获取数据并进行聚合。这种方式的优点是可以实现异步通信，并且可以使用消息队列的高效消息传递机制来实现数据聚合，但缺点是需要额外的消息队列管理开销。
5. 边缘计算方式：在这种方式下，聚合器服务可以在边缘设备中运行，直接从多个传感器或设备中收集数据并进行聚合。这种方式的优点是可以减少数据传输和存储的开销，但缺点是需要处理边缘设备的硬件和软件限制。

当使用消息队列方式来实现 Aggregator Microservices 时，可以应用于以下一些实际的场景：

1. 日志聚合：在一个分布式系统中，可能会生成大量的日志数据，如果将所有的日志数据发送到中心服务器上进行聚合，这会导致中心服务器的压力非常大。使用消息队列方式，可以将日志数据发送到消息队列中，再由聚合器服务从消息队列中获取数据来进行聚合，这样可以降低中心服务器的压力，提高系统的可伸缩性和性能。

2. 电商平台订单处理：在一个电商平台中，订单数据可能会分散在多个订单系统中，使用消息队列方式，可以将订单数据发送到消息队列中，再由聚合器服务从消息队列中获取数据来进行聚合，这样可以实现订单数据的统一处理，提高系统的可靠性和可维护性。

3. 物联网数据聚合：在一个物联网系统中，可能需要从多个传感器中获取数据，并将数据聚合到一个共同的数据中心中。使用消息队列方式，可以将传感器数据发送到消息队列中，再由聚合器服务从消息队列中获取数据来进行聚合，这样可以提高系统的可伸缩性和性能，并且缓解边缘设备的负载压力。

4. 实时数据处理：在一个实时数据处理系统中，可能需要从多个数据源中获取数据，并将数据聚合到一个共同的数据处理中心中。使用消息队列方式，可以将实时数据发送到消息队列中，再由聚合器服务从消息队列中获取数据来进行聚合，这样可以实现实时数据的快速处理和分析。

一个异步聚合服务示例：

```java
// 聚合器服务类
public class AggregatorService {

    // 后端服务列表
    private List<BackendService> backendServices;

    public AggregatorService(List<BackendService> backendServices) {
        this.backendServices = backendServices;
    }

    // 聚合数据的方法
    public List<Product> getProducts() {
        List<Product> products = new ArrayList<>();

        // 并行收集数据
        List<CompletableFuture<List<Product>>> futures = backendServices.stream()
                .map(backendService -> CompletableFuture.supplyAsync(() -> backendService.getProducts()))
                .collect(Collectors.toList());

        // 等待所有异步操作完成并聚合数据
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[futures.size()]))
                .join();

        futures.stream()
                .map(CompletableFuture::join)
                .forEach(products::addAll);

        return products;
    }
}

// 后端服务接口
public interface BackendService {

    List<Product> getProducts();
}

// 后端服务实现类1
public class BackendServiceA implements BackendService {

    @Override
    public List<Product> getProducts() {
        // 从数据库获取产品信息
        List<Product> products = new ArrayList<>();
        products.add(new Product("Product A1", 10.0));
        products.add(new Product("Product A2", 20.0));
        products.add(new Product("Product A3", 30.0));
        return products;
    }
}

// 后端服务实现类2
public class BackendServiceB implements BackendService {

    @Override
    public List<Product> getProducts() {
        // 从API获取产品信息
        List<Product> products = new ArrayList<>();
        products.add(new Product("Product B1", 15.0));
        products.add(new Product("Product B2", 25.0));
        return products;
    }
}

// 产品类
public class Product {

    private String name;
    private double price;

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    // 省略 getter 和 setter 方法
}
```

在上述示例代码中，我们定义了一个聚合器服务类 `AggregatorService`，它包含了多个后端服务接口 `BackendService` 的实现类 `BackendServiceA` 和 `BackendServiceB`。聚合器服务类的 `getProducts()` 方法负责从多个后端服务中收集产品数据，并将数据组合成一个聚合的响应。在收集数据时，我们使用了 Java 8 的 `CompletableFuture` 和流式 API 来实现异步通信并行收集数据。最后，我们定义了一个简单的产品类 `Product`，用于封装产品信息。

Aggregator Microservices 模式已经得到了广泛的应用和支持，以下是一些常见的开源框架和工具，它们提供了 Aggregator Microservices 模式的实现：

1. Apache Camel：是一个基于 Java 的开源框架，用于快速实现各种企业集成模式（EIP），包括聚合器模式。Apache Camel 提供了多种聚合器组件，例如 Aggregator、Splitter、Resequencer 等，可以灵活地聚合和处理数据。

2. Spring Integration：是 Spring 生态系统中的一个集成框架，也支持 Aggregator Microservices 模式。Spring Integration 提供了多种聚合器组件，例如 Aggregator、Barrier、ReleaseStrategy 等，可以用来聚合和处理消息。

3. Apache Kafka：是一个分布式流处理平台，用于处理高吞吐量的实时数据流，也支持 Aggregator Microservices 模式。Apache Kafka 提供了消息队列和流处理功能，可以用来聚合和处理数据流。

4. RabbitMQ：是一个开源的消息队列系统，支持多种消息协议和消息模式，也支持 Aggregator Microservices 模式。RabbitMQ 提供了多种消息协议和消息模式，可以用来聚合和处理消息。

5. Apache Spark：是一个分布式计算框架，用于处理大规模数据集，也支持 Aggregator Microservices 模式。Apache Spark 提供了多种数据处理和聚合功能，可以用来聚合和处理大规模数据集。

## 参考文章

- [Microservice Design Patterns](http://web.archive.org/web/20190705163602/http://blog.arungupta.me/microservice-design-patterns/)
- [Microservices Patterns: With examples in Java](https://www.amazon.com/gp/product/1617294543/ref=as_li_qf_asin_il_tl?ie=UTF8&tag=javadesignpat-20&creative=9325&linkCode=as2&creativeASIN=1617294543&linkId=8b4e570267bc5fb8b8189917b461dc60)
- [Architectural Patterns: Uncover essential patterns in the most indispensable realm of enterprise architecture](https://www.amazon.com/gp/product/B077T7V8RC/ref=as_li_qf_asin_il_tl?ie=UTF8&tag=javadesignpat-20&creative=9325&linkCode=as2&creativeASIN=B077T7V8RC&linkId=c34d204bfe1b277914b420189f09c1a4)
