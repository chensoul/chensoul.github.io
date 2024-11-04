---
title: "Java设计模式：Circuit Breaker"
date: 2023-10-26
type: post
slug: java-design-patterns-circuit-breaker
categories: ["Java"]
tags: [java]
---

本文主要介绍 [Circuit Breaker](https://java-design-patterns.com/zh/patterns/circuit-breaker/) 断路器模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

## 介绍

断路器模式（Circuit Breaker Pattern）是一种在分布式系统中处理故障和提高系统可靠性的设计模式。它的主要目标是防止故障的传递，并在故障发生时提供优雅的故障处理机制。

在一个分布式系统中，不可避免地会出现许多外部依赖，如数据库、网络服务等。这些外部依赖可能会发生故障、延迟或不可用的情况。如果没有适当的措施，这些故障可能会导致整个系统的性能下降，甚至系统崩溃。

断路器模式通过在应用程序和外部依赖之间引入一个断路器接口来解决这个问题。断路器接口充当一个中间层，监视对外部依赖的调用。当外部依赖发生故障时，断路器可以迅速地中断对外部依赖的调用，避免资源的浪费和故障的传递。

除了断路器接口之外，断路器模式还涉及以下几个重要的知识点：

1. **故障阈值（Failure Threshold）**：断路器模式通过设置故障阈值来判断服务的健康状态。当服务的失败次数达到或超过故障阈值时，断路器会打开，阻止对服务的进一步调用。
2. **回退响应（Fallback Response）**：当断路器打开时，可以为调用方提供回退响应。回退响应是一个预定义的响应，用于代替无法正常调用的服务的响应。回退响应可以是事先定义好的静态响应，或者是通过调用备用服务来获取的响应。
3. **断路器状态（Circuit Breaker State）**：断路器可以处于不同的状态，如关闭（Closed）、打开（Open）和半开（Half-Open）。初始状态通常是关闭状态，表示服务正常可用。当服务的失败次数达到故障阈值时，断路器会打开，阻止对服务的进一步调用。在一定时间后，断路器会进入半开状态，允许发起一次测试调用。如果测试调用成功，断路器将重新关闭；如果测试调用仍然失败，断路器将重新打开。
4. **断路器的自动恢复（Automatic Recovery）**：断路器模式通常具有自动恢复功能。在断路器打开的状态下，一段时间过去后，断路器会尝试重新关闭，以允许对服务的正常调用。自动恢复可以防止长时间的服务中断，提供给服务一个机会来恢复正常运行。
5. **健康检查（Health Check）**：断路器模式可以通过定期的健康检查来监控服务的状态。健康检查可以是定期发送心跳请求或执行一些特定的健康检查操作。通过健康检查，可以及时发现服务的故障或不可用状态，并相应地打开断路器。

## 示例

首先，您需要创建一个监控服务类，它将使用断路器来包装远程服务的调用。以下是一个示例监控服务类的代码：

```java
public class MonitoringService {
  private final CircuitBreaker delayedService;
  private final CircuitBreaker quickService;

  public MonitoringService(CircuitBreaker delayedService, CircuitBreaker quickService) {
    this.delayedService = delayedService;
    this.quickService = quickService;
  }

  public String localResourceResponse() {
    return "Local Service is working";
  }

  public String delayedServiceResponse() {
    try {
      return this.delayedService.attemptRequest();
    } catch (RemoteServiceException e) {
      return e.getMessage();
    }
  }

  public String quickServiceResponse() {
    try {
      return this.quickService.attemptRequest();
    } catch (RemoteServiceException e) {
      return e.getMessage();
    }
  }
}
```

在上述代码中，`MonitoringService` 类接受两个断路器对象作为参数，分别用于包装延迟服务和快速服务的远程调用。它还包含一个用于获取本地资源的方法。

接下来，您需要创建一个默认的断路器实现类，实现 `CircuitBreaker` 接口，并根据需要自定义逻辑。

```java
public interface CircuitBreaker {
    void recordSuccess();
    void recordFailure(String response);
    void evaluateState();
}
```

CircuitBreaker接口定义了三个方法：

1. `recordSuccess()`: 当依赖的服务调用成功时调用该方法，用于记录成功的事件。
2. `recordFailure(String response)`: 当依赖的服务调用失败时调用该方法，用于记录失败的事件。方法接受一个响应字符串作为参数。
3. `evaluateState()`: 该方法用于评估当前断路器的状态。根据预定义的条件，如故障阈值、故障计数和最后故障时间等，判断是否需要改变断路器的状态。

以下是一个示例的默认断路器实现类的代码：

```java
public class DefaultCircuitBreaker implements CircuitBreaker {
  private final long timeout;
  private final long retryTimePeriod;
  private final RemoteService service;
  private long lastFailureTime;
  private String lastFailureResponse;
  private int failureCount;
  private final int failureThreshold;
  private State state;
  private final long futureTime = 1000 * 1000 * 1000 * 1000;

  public DefaultCircuitBreaker(RemoteService serviceToCall, long timeout, int failureThreshold,
                              long retryTimePeriod) {
      this.service = serviceToCall;
      this.state = State.CLOSED;
      this.failureThreshold = failureThreshold;
      this.timeout = timeout;
      this.retryTimePeriod = retryTimePeriod;
      this.lastFailureTime = System.nanoTime() + futureTime;
      this.failureCount = 0;
  }

  @Override
  public void recordSuccess() {
      this.failureCount = 0;
      this.lastFailureTime = System.nanoTime() + futureTime;
      this.state = State.CLOSED;
  }

  @Override
  public void recordFailure(String response) {
      failureCount = failureCount + 1;
      this.lastFailureTime = System.nanoTime();
      this.lastFailureResponse = response;
  }

  protected void evaluateState() {
      if (failureCount >= failureThreshold) {
          if ((System.nanoTime() - lastFailureTime) > retryTimePeriod) {
              state = State.HALF_OPEN;
          } else {
              state = State.OPEN;
          }
      } else {
          state = State.CLOSED;
      }
  }

  @Override
  public String getState() {
      evaluateState();
      return state.name();
  }

  @Override
  public void setState(State state) {
      this.state = state;
      switch (state) {
          case OPEN:
              this.failureCount = failureThreshold;
              break;
          case HALF_OPEN:
              this.failureCount = 0;
              break;
          case CLOSED:
              this.failureCount = 0;
              this.lastFailureTime = System.nanoTime() + futureTime;
              break;
      }
  }

  @Override
  public String attemptRequest() throws RemoteServiceException {
      if (state == State.OPEN) {
          return lastFailureResponse;
      }

      try {
          // Simulate the remote service call
          return service.call();
      } catch (RemoteServiceException e) {
          recordFailure(e.getMessage());
          throw e;
      }
  }
}
```

上述代码中的 `DefaultCircuitBreaker` 类是一个默认的断路器实现类。它包含了记录成功和失败的方法，评估当前状态的方法，获取当前状态的方法，以及尝试发起请求的方法。根据状态，它可以控制是否允许请求通过或返回上一次的失败响应。

最后，您可以使用以下代码示例来演示如何使用断路器：

```java
@Slf4j
public class App {

  private static final Logger LOGGER = LoggerFactory.getLogger(App.class);

  /**
   * Program entry point.
   *
   * @param args command line args
   */
  public static void main(String[] args) {

    var serverStartTime = System.nanoTime();

    var delayedService = new DelayedRemoteService(serverStartTime, 5);
    var delayedServiceCircuitBreaker = new DefaultCircuitBreaker(delayedService, 3000, 2,
        2000 * 1000 * 1000);

    var quickService = new QuickRemoteService();
    var quickServiceCircuitBreaker = new DefaultCircuitBreaker(quickService, 3000, 2,
        2000 * 1000 * 1000);

    // 创建一个可以进行本地和远程调用的监控服务对象
    var monitoringService = new MonitoringService(delayedServiceCircuitBreaker,
        quickServiceCircuitBreaker);

    // 获取本地资源
    LOGGER.info(monitoringService.localResourceResponse());

    // 从延迟服务中获取响应 2 次，以满足失败阈值
    LOGGER.info(monitoringService.delayedServiceResponse());
    LOGGER.info(monitoringService.delayedServiceResponse());

    // 在超过故障阈值限制后获取延迟服务断路器的当前状态
    // 现在是打开状态
    LOGGER.info(delayedServiceCircuitBreaker.getState());

     // 同时，延迟服务宕机，从健康快速服务获取响应
    LOGGER.info(monitoringService.quickServiceResponse());
    LOGGER.info(quickServiceCircuitBreaker.getState());

    // 等待延迟的服务响应
    try {
      LOGGER.info("Waiting for delayed service to become responsive");
      Thread.sleep(5000);
    } catch (InterruptedException e) {
      e.printStackTrace();
    }
    // 检查延时断路器的状态，应该是HALF_OPEN
    LOGGER.info(delayedServiceCircuitBreaker.getState());

    // 从延迟服务中获取响应，现在应该是健康的
    LOGGER.info(monitoringService.delayedServiceResponse());
    // 获取成功响应后，它的状态应该是关闭。
    LOGGER.info(delayedServiceCircuitBreaker.getState());
  }
}
```

## 类图

![alt text](https://java-design-patterns.com/assets/circuit-breaker.urm-153d25ce.png)

## 适用场景

断路器模式在分布式系统和微服务架构中有许多常见的应用场景。以下是一些常见的应用场景：

1. **外部依赖调用**：在使用外部服务或资源时，例如数据库、网络服务、API调用等，断路器模式可以用来处理外部依赖的故障。它可以防止故障的传递，减少对故障依赖的调用，并提供故障处理机制。
2. **限流和熔断**：断路器模式可以用于实现限流和熔断机制，以保护系统免受外部依赖的过载或故障。它可以监控请求的频率和响应时间，并在达到阈值时阻止对外部依赖的调用，以避免系统崩溃。
3. **降级和容错**：在面对外部依赖故障时，断路器模式可以提供降级和容错机制。它可以切换到备用逻辑或服务，以提供基本的功能或默认值，保持系统的部分可用性。
4. **重试和恢复**：断路器模式可以用于实现故障重试和恢复机制。当外部依赖发生故障时，断路器可以尝试重新连接或重新调用依赖，以尽快恢复正常操作。
5. **监控和报告**：断路器模式通常与监控和报告机制结合使用，以提供对系统状态和故障的可视化和警报。它可以记录故障信息、请求统计、错误率等指标，帮助开发人员和运维团队监控系统健康状况。

总之，断路器模式适用于任何可能遇到外部依赖故障的场景。它可以提供故障隔离、弹性和自愈能力，提高系统的可用性、可靠性和性能。

## FAQ

### 再提供一个使用断路器模式的例子？

当涉及到使用断路器模式的例子时，一个常见的应用场景是在微服务架构中保护对其他服务的调用。以下是一个简单的示例：

假设我们有一个电子商务应用程序，它包含订单服务和库存服务。订单服务负责处理用户的订单，而库存服务则负责管理产品的库存信息。为了保护订单服务对库存服务的调用，我们可以使用断路器模式。

```java
public class OrderService {
    private CircuitBreaker circuitBreaker;
    private InventoryService inventoryService;
    
    public OrderService() {
        // 初始化断路器
        circuitBreaker = new CircuitBreaker();
        // 初始化库存服务
        inventoryService = new InventoryService();
    }
    
    public void placeOrder(Order order) {
        try {
            // 检查断路器状态
            if (circuitBreaker.isClosed()) {
                // 调用库存服务检查库存
                boolean hasStock = inventoryService.checkStock(order.getProduct());
                
                if (hasStock) {
                    // 执行订单处理逻辑
                    // ...
                    // 订单处理成功，记录成功事件
                    circuitBreaker.recordSuccess();
                } else {
                    // 库存不足，记录失败事件
                    circuitBreaker.recordFailure("Insufficient stock");
                    throw new RuntimeException("Insufficient stock");
                }
            } else {
                // 断路器打开，执行回退逻辑
                throw new RuntimeException("Order service is currently unavailable. Please try again later.");
            }
        } catch (Exception e) {
            // 处理异常情况，记录失败事件
            circuitBreaker.recordFailure(e.getMessage());
            throw e;
        }
    }
}
```

在上述例子中，`OrderService`类是订单服务的实现。它通过使用`CircuitBreaker`类来保护对库存服务的调用。在`placeOrder()`方法中，首先检查断路器的状态。如果断路器处于关闭状态（即可用状态），则调用库存服务的`checkStock()`方法来检查产品的库存情况。如果库存足够，订单处理成功，并记录成功事件；如果库存不足，订单处理失败，并记录失败事件。

如果断路器处于打开状态，说明库存服务不可用，此时将执行回退逻辑，抛出异常或提供相应的回退响应。无论是执行回退逻辑还是处理异常情况，都需要记录失败事件。

通过使用断路器模式，我们可以保护订单服务免受库存服务故障的影响。断路器会监控库存服务的健康状态，并在故障发生时打开断路器，阻止对库存服务的进一步调用。这样，即使库存服务不可用，订单服务仍然能够提供恰当的响应，并避免因连锁故障而导致整个系统崩溃。

### 如何优化断路器模式的代码？

当编写断路器模式的代码时，可以进行一些优化和改进。以下是一些可能的优化方法：

1. **使用现有的库或框架**：断路器模式是一个常见的设计模式，许多流行的Java库和框架已经提供了断路器实现，例如 Netflix的Hystrix、Resilience4j等。使用这些库可以减少您自己编写和维护断路器代码的工作量，并且它们通常具有更多的功能和配置选项。
2. **超时设置**：在断路器模式中，设置适当的超时时间非常重要。您可以使用Java的`Future`、`CompletableFuture`或第三方库来实现调用的超时控制。确保在超过超时时间后，取消或中断正在进行的请求，并记录为失败。
3. **错误计数器和重置策略**：根据失败计数器和重置策略，您可以更准确地确定何时打开、关闭或半开断路器。考虑使用滑动窗口或滑动时间窗口来计算错误计数，并根据预定义的规则进行状态转换。
4. **熔断指标和监控**：在大型应用程序中，了解断路器的使用情况和性能指标非常重要。您可以使用指标收集库（例如Micrometer）和监控系统（例如Prometheus、Grafana）来收集和可视化断路器的指标数据，以便进行监控和故障排除。
5. **异步支持**：如果您的应用程序需要进行大量的并发请求，考虑使用异步编程模型（例如Java的`CompletableFuture`、响应式编程库等）。这样可以更好地利用资源，并提高应用程序的吞吐量和性能。

### 你能推荐一些常用的断路器模式的Java库吗？

当涉及到断路器模式的Java库时，以下是一些常用的选择：

1. **Netflix Hystrix**：Hystrix是一个广泛使用的断路器库，为分布式系统提供故障容错和弹性功能。它具有自适应的断路器逻辑、请求超时、线程池隔离、回退逻辑等功能。然而，请注意，Netflix宣布停止Hystrix的维护和开发，推荐使用Resilience4j或其他替代库。
2. **Resilience4j**：Resilience4j是一个轻量级的断路器和弹性库，专为Java 8+应用程序设计。它提供了断路器、限流、重试、超时等功能，并与Java函数式编程风格很好地配合。Resilience4j还与Spring Boot集成得很好，可以轻松地在Spring应用程序中使用。
3. **Sentinel**：Sentinel是阿里巴巴开源的一款弹性流控框架，它提供了断路器、流量控制、熔断降级等功能。Sentinel支持针对流量实时监控和规则配置，可以帮助您保护应用程序免受异常流量和故障的影响。
4. **Akka Circuit Breaker**：Akka是一个用于构建高并发和分布式应用程序的工具包，其中包含了一个名为Circuit Breaker的模块。Akka的Circuit Breaker模块提供了断路器功能，并与Akka的Actor模型和消息传递机制集成得很好。
5. [Spring Cloud Circuit Breaker](https://spring.io/projects/spring-cloud-circuitbreaker)：Spring Cloud Circuit Breaker是Spring Cloud生态系统的一部分，它提供了与多个断路器实现（如Hystrix、Resilience4j、Sentinel等）的集成。因此，您可以根据需要选择合适的断路器实现，并在Spring应用程序中使用它们。

### Spring Cloud Circuit Breaker如何实现断路器模式？

Spring Cloud Circuit Breaker是Spring Cloud提供的一个模块，用于实现断路器模式。它基于抽象的`CircuitBreaker`接口，并提供了与不同断路器实现的集成。

Spring Cloud Circuit Breaker通过与各种断路器实现（如Netflix Hystrix、Resilience4j、Sentinel等）的整合，为开发人员提供了一致的编程模型和API，以便在微服务架构中实现断路器模式。

以下是使用Spring Cloud Circuit Breaker实现断路器模式的一般步骤：

1. 添加依赖：在项目的构建文件中，添加Spring Cloud Circuit Breaker相应的依赖，例如使用Netflix Hystrix：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-hystrix</artifactId>
</dependency>
```

2) 创建断路器方法：在需要保护的方法上，使用`@CircuitBreaker`注解标记该方法，指定断路器的名称。例如：

```java
import org.springframework.cloud.circuitbreaker.annotation.CircuitBreaker;

@CircuitBreaker(name = "myCircuitBreaker")
public String performRemoteCall() {
    // 远程服务调用逻辑
    // ...
}
```

3) 配置断路器属性：可以通过配置文件（如`application.properties`或`application.yml`）来设置断路器的属性，如超时时间、故障阈值等。例如：

```yaml
spring:
  cloud:
    circuitbreaker:
      enabled: true
      default-config:
        timeout: 1000
        circuit-breaker:
          request-volume-threshold: 10
          failure-ratio: 0.5
          wait-duration-in-open-state: 5000
```

4) 处理回退逻辑：可以通过在方法上定义一个备用方法（fallback method）来指定在断路器打开时执行的回退逻辑。可以使用`@Fallback`注解标记该备用方法。例如：

```java
import org.springframework.cloud.circuitbreaker.annotation.Fallback;

@Fallback(fallbackMethod = "fallbackMethod")
public String performRemoteCall() {
    // 远程服务调用逻辑
    // ...
}

public String fallbackMethod(Exception e) {
    // 回退逻辑
    // ...
}
```

通过上述步骤，Spring Cloud Circuit Breaker会根据断路器的配置和状态来保护被`@CircuitBreaker`注解标记的方法。当方法调用发生故障或超过阈值时，断路器将打开，并执行备用方法。备用方法可以提供一个预定义的响应或执行一些回退逻辑，以确保系统的稳定性。

需要注意的是，具体的配置和用法可能因使用的断路器实现（如Hystrix、Resilience4j等）而有所差异。因此，建议参考Spring Cloud Circuit Breaker的官方文档和相关示例，以了解更多关于特定断路器实现的详细信息和用法。

### Spring Cloud Circuit Breaker和常规的断路器实现的区别？

Spring Cloud Circuit Breaker 是基于 Spring Cloud 的断路器模块，提供了对断路器模式的支持。它与常规的断路器实现（如 Hystrix、Resilience4j 等）相比，有以下几个区别：

1. 统一的抽象接口：Spring Cloud Circuit Breaker 提供了一个统一的抽象接口，即 `CircuitBreaker` 接口，用于定义断路器的行为和状态。这个接口使得可以在不同的断路器实现之间进行切换和替换，而不需要更改应用程序的代码。

   > 以下是 `CircuitBreaker` 接口的定义：
   >
   > ```java
   > public interface CircuitBreaker {
   > 
   >     String getId();
   > 
   >     <T> T run(Supplier<T> toRun);
   > 
   >     <T> T runCallable(Callable<T> toRun) throws Exception;
   > 
   >     void reset();
   > 
   >     CircuitBreaker.State getState();
   > 
   >     default boolean isOpen() {
   >         return getState() == CircuitBreaker.State.OPEN;
   >     }
   > 
   >     default boolean isClosed() {
   >         return getState() == CircuitBreaker.State.CLOSED;
   >     }
   > 
   >     default boolean isHalfOpen() {
   >         return getState() == CircuitBreaker.State.HALF_OPEN;
   >     }
   > 
   >     enum State {
   >         CLOSED, OPEN, HALF_OPEN
   >     }
   > }
   > ```
   >
   > `CircuitBreaker` 接口定义了以下方法：
   >
   > - `getId()`：获取断路器的唯一标识符。
   > - `run(Supplier<T> toRun)`：运行一个带有返回值的操作（通过 `Supplier` 提供），并返回操作的结果。如果断路器处于打开状态，将会触发断路器打开的逻辑。
   > - `runCallable(Callable<T> toRun)`：运行一个带有返回值的操作（通过 `Callable` 提供），并返回操作的结果。与 `run(Supplier<T> toRun)` 类似，如果断路器处于打开状态，将会触发断路器打开的逻辑。
   > - `reset()`：重置断路器的状态。将断路器状态重置为关闭状态。
   > - `getState()`：获取断路器的当前状态，返回一个 `CircuitBreaker.State` 枚举值，表示关闭状态、打开状态或半开状态。
   > - `isOpen()`、`isClosed()`、`isHalfOpen()`：这些方法是对状态的便捷判断方法，用于判断断路器当前的状态。

2. 多个断路器实现的支持：Spring Cloud Circuit Breaker 支持多个断路器实现，如 Hystrix、Resilience4j、Sentinel 等。这样，开发人员可以根据实际需求和偏好选择适合的断路器实现。

3. 与 Spring Cloud 整合：Spring Cloud Circuit Breaker 与 Spring Cloud 生态系统无缝集成，可以与其他 Spring Cloud 组件（如服务注册与发现、负载均衡等）一起使用。它可以通过注解或编程方式与 Spring Boot 应用程序集成，简化了断路器的配置和使用。

4. 可插拔的实现：Spring Cloud Circuit Breaker 的设计允许开发人员进行自定义的断路器实现。通过实现 `CircuitBreakerFactory` 接口，可以创建自定义的断路器实例，并将其集成到 Spring Cloud Circuit Breaker 中。

总的来说，Spring Cloud Circuit Breaker 提供了一种更灵活、可扩展和与 Spring Cloud 集成的方式来实现断路器模式。它使得开发人员可以选择适合自己项目需求的断路器实现，并能够与其他 Spring Cloud 组件无缝协作。

## 参考资料

- [Understanding Circuit Breaker Patter](https://itnext.io/understand-circuitbreaker-design-pattern-with-simple-practical-example-92a752615b42)
- [Martin Fowler on Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Fault tolerance in a high volume, distributed system](https://medium.com/netflix-techblog/fault-tolerance-in-a-high-volume-distributed-system-91ab4faae74a)
- [Circuit Breaker pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)
