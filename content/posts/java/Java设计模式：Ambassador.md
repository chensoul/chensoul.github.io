---
title: "Java设计模式：Ambassador"
date: 2023-07-06
slug: java-design-patterns-ambassador
categories: ["Java"]
tags: [java, spring, aop]
---

本文主要介绍 Ambassador 模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

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

## 目的

在客户端上提供帮助程序服务实例，并从共享资源上转移常用功能。

> Ambassador 设计模式的主要目的是将客户端应用程序与远程服务器之间的通信细节隔离开来，从而使客户端应用程序可以专注于自己的业务逻辑，而不必关注网络通信细节和错误处理。
>
> 在传统的客户端应用程序中，通常需要处理大量的网络通信细节和错误处理，这会使代码变得复杂且难以维护。而使用 Ambassador 设计模式可以将这些细节和处理逻辑集中在一个单独的类中，从而使客户端应用程序的代码更加简洁、易于维护和扩展。
>
> 此外，使用 Ambassador 设计模式还可以提高客户端应用程序与远程服务器之间的通信安全性和可靠性。例如，Ambassador 类可以负责统一处理所有的网络通信，从而可以更轻松地实现安全性和可靠性控制。

## 解释

假设有一个旧版的远程服务，该服务提供了许多客户端访问的功能，但由于用户的大量请求，导致连接问题变得普遍。此外，新的请求频率规则需要同时实现延迟检测和客户端日志功能。为了解决这些问题，可以使用 Ambassador 设计模式。

[微软文档](https://learn.microsoft.com/en-us/azure/architecture/patterns/ambassador) 做了如下阐述

> 可以将大使服务视为与客户端位于同一位置的进程外代理。 此模式对于以语言不可知的方式减轻常见的客户端连接任务（例如监视，日志记录，路由，安全性（如 TLS）和弹性模式）的工作很有用。 它通常与旧版应用程序或其他难以修改的应用程序一起使用，以扩展其网络功能。 它还可以使专业团队实现这些功能。

在该模式中，可以创建一个 Ambassador 类来充当客户端应用程序和远程服务之间的代理。Ambassador 类负责处理所有的网络通信细节和错误处理，并实现新的请求频率规则，包括延迟检测和客户端日志功能。

具体来说，Ambassador 类可以实现以下功能：

1. 延迟检测：在请求到达远程服务之前，Ambassador 类可以检测请求的时间戳，并计算出请求的延迟时间。如果请求的延迟时间超过了预设的阈值，Ambassador 类可以将请求拒绝。
2. 客户端日志功能：Ambassador 类可以记录请求的时间戳、请求的内容和响应的内容，并将这些信息保存到客户端的日志文件中。这样可以帮助客户端应用程序进行调试和故障排除。
3. 连接问题处理：Ambassador 类可以监控远程服务的连接状态，并在连接出现问题时进行自动重试。同时，Ambassador 类还可以实现一些优化策略，例如使用连接池等，以提高连接的可靠性和性能。

**程序示例**

有了上面的介绍我们将在这个例子中模仿功能。我们有一个用远程服务实现的接口，同时也是大使服务。

```java
interface RemoteServiceInterface {
    long doRemoteFunction(int value) throws Exception;
}
```

表示为单例的远程服务。

```java
public class RemoteService implements RemoteServiceInterface {

    private static final Logger LOGGER = LoggerFactory.getLogger(RemoteService.class);
    private static RemoteService service = null;

    static synchronized RemoteService getRemoteService() {
        if (service == null) {
            service = new RemoteService();
        }
        return service;
    }

    private RemoteService() {}

    @Override
    public long doRemoteFunction(int value) {
        long waitTime = (long) Math.floor(Math.random() * 1000);

        try {
            sleep(waitTime);
        } catch (InterruptedException e) {
            LOGGER.error("Thread sleep interrupted", e);
        }

        return waitTime >= 200 ? value * 10 : -1;
    }
}
```

服务大使添加了像日志和延迟检测的额外功能

```java
public class ServiceAmbassador implements RemoteServiceInterface {

  private static final Logger LOGGER = LoggerFactory.getLogger(ServiceAmbassador.class);
  private static final int RETRIES = 3;
  private static final int DELAY_MS = 3000;

  ServiceAmbassador() {
  }

  @Override
  public long doRemoteFunction(int value) {
    return safeCall(value);
  }

  private long checkLatency(int value) {
    Long startTime = System.currentTimeMillis();
    long result = RemoteService.getRemoteService().doRemoteFunction(value);
    Long timeTaken = System.currentTimeMillis() - startTime;

    LOGGER.info("Time taken (ms): " + timeTaken);
    return result;
  }

  private long safeCall(int value) {
    int retries = 0;
    long result = (long) FAILURE;

    for (int i = 0; i < RETRIES; i++) {
      if (retries >= RETRIES) {
        return FAILURE;
      }

      if ((result = checkLatency(value)) == FAILURE) {
        LOGGER.info("Failed to reach remote: (" + (i + 1) + ")");
        retries++;
        try {
          sleep(DELAY_MS);
        } catch (InterruptedException e) {
          LOGGER.error("Thread sleep state interrupted", e);
        }
      } else {
        break;
      }
    }
    return result;
  }
}
```

客户端具有用于与远程服务进行交互的本地服务大使：

```java
public class Client {

  private static final Logger LOGGER = LoggerFactory.getLogger(Client.class);
  private final ServiceAmbassador serviceAmbassador = new ServiceAmbassador();

  long useService(int value) {
    long result = serviceAmbassador.doRemoteFunction(value);
    LOGGER.info("Service result: " + result);
    return result;
  }
}
```

这是两个使用该服务的客户端。

```java
public class App {
  public static void main(String[] args) {
    Client host1 = new Client();
    Client host2 = new Client();
    host1.useService(12);
    host2.useService(73);
  }
}
```

Here's the output for running the example:

```java
Time taken (ms): 111
Service result: 120
Time taken (ms): 931
Failed to reach remote: (1)
Time taken (ms): 665
Failed to reach remote: (2)
Time taken (ms): 538
Failed to reach remote: (3)
Service result: -1
```

## 类图

![alt text](https://java-design-patterns.com/assets/ambassador.urm-75077e88.png)

## 适用场景

Ambassador 设计模式适用于以下场景：

1. 当客户端应用程序需要与远程服务器进行通信，并且需要处理与网络通信相关的所有细节时。
2. 当客户端应用程序需要隔离与远程服务器的通信细节时，以便更好地专注于自己的业务逻辑。
3. 当客户端应用程序需要处理与远程服务器的通信错误时。
4. 当客户端应用程序需要实现新的请求频率规则，例如延迟检测和客户端日志功能等。
5. 当客户端应用程序需要在不更改旧版远程服务代码的情况下，对远程服务进行定制化扩展时。

## 典型用例

Ambassador 设计模式可以用于许多场景，以下是其中的一些典型用例：

### 限流和熔断保护

在分布式系统中，服务之间的调用是通过网络进行的，网络延迟、故障和不可用性是常见的问题。当一个服务被频繁调用时，可能会导致其过载或崩溃，从而影响整个系统的稳定性和可用性。使用 Ambassador 设计模式可以实现对服务的请求流量和执行频率进行限制，同时也可以实现熔断保护，当一个服务出现故障或不可用时，自动切换到备用服务。

#### 限流

当使用 Ambassador 设计模式时，可以在 Ambassador 类中实现新的请求频率规则。以下是一个简单的例子，说明如何使用 Ambassador 设计模式来实现请求频率规则：

假设有一个客户端应用程序需要向远程服务器发送请求，并且需要实现以下请求频率规则：每个客户端在 10 秒钟内只能发送 10 个请求。如果客户端发送的请求超过了这个限制，服务器将返回 429 Too Many Requests 错误。

为了实现这个规则，可以创建一个 Ambassador 类来充当客户端应用程序和远程服务器之间的代理。在 Ambassador 类中，可以使用计数器和定时器来实现请求频率控制逻辑。

具体来说，Ambassador 类可以实现以下功能：

1. 定义计数器和定时器：在 Ambassador 类的构造函数中，可以定义一个计数器和一个定时器。计数器用于记录客户端发送的请求次数，定时器用于在每个 10 秒钟后重置计数器的值。
2. 处理请求：在 Ambassador 类的处理请求方法中，可以首先检查计数器的值是否超过了限制。如果超过了限制，则返回 429 Too Many Requests 错误；否则，将请求发送到远程服务器，并将计数器的值增加 1。
3. 处理定时器：在 Ambassador 类中，可以使用定时器来定期重置计数器的值。当定时器触发时，将计数器的值设置为 0。

以下是一个基于 Java 8 的 Ambassador 设计模式的示例代码，使用了 Java 8 中的 HttpClient 类来发送 HTTP 请求：

```java
import java.time.Instant;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.LongAdder;

public class Ambassador {
    private final LongAdder counter = new LongAdder();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private Instant lastResetTime = Instant.now();

    public String handleRequest(String url) {
        // 检查计数器是否超过了限制
        if (counter.incrementAndGet() > 10) {
            // 返回“Too Many Requests”错误
            counter.decrementAndGet();
            return "429 Too Many Requests";
        } else {
            // 发送请求到远程服务器
            String response = sendRequest(url);

            // 检查是否需要重置计数器
            Instant currentTime = Instant.now();
            if (currentTime.getEpochSecond() - lastResetTime.getEpochSecond() >= 10) {
                counter.reset();
                lastResetTime = currentTime;
            }

            // 返回响应结果
            return response;
        }
    }

    private String sendRequest(String url) {
        // 发送 HTTP GET 请求并返回响应结果
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();
        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (IOException | InterruptedException e) {
            // 处理请求异常
            return "500 Internal Server Error";
        }
    }

    public Ambassador() {
        // 定时重置计数器
        scheduler.scheduleAtFixedRate(() -> {
            counter.reset();
            lastResetTime = Instant.now();
        }, 10, 10, TimeUnit.SECONDS);
    }

    public void shutdown() {
        // 关闭定时器
        scheduler.shutdown();
    }
}
```

在上述代码中，Ambassador 类使用了 LongAdder 类型的计数器和 ScheduledExecutorService 类型的定时器，并实现了处理请求的方法 handleRequest。当客户端调用 handleRequest 方法时，Ambassador 类会检查计数器的值是否超过了限制。如果超过了限制，则返回 429 Too Many Requests 错误；否则，将请求发送到远程服务器，并将计数器的值增加 1。同时，Ambassador 类还会使用 ScheduledExecutorService 来定期重置计数器的值。

#### 熔断

Ambassador 设计模式可以使用熔断模式来保护服务免受故障或不可用性的影响。熔断模式是一种防止故障扩散的机制，当服务出现故障或不可用时，熔断器会自动切换到备用服务，并在一段时间内停止发送请求。如果备用服务也出现故障或不可用，熔断器会重新启动并继续发送请求。以下是一个使用 Ambassador 设计模式实现熔断的示例代码：

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Ambassador {

    private final AtomicInteger failureCount = new AtomicInteger(0);
    private final AtomicBoolean circuitBreaker = new AtomicBoolean(false);
    private final Service primaryService;
    private final Service backupService;
    private final int failureThreshold;
    private final int timeout;
    private final ExecutorService executor;
    private final Logger logger;

    public Ambassador(Service primaryService, Service backupService, int failureThreshold, int timeout, int maxConcurrentRequests) {
        this.primaryService = primaryService;
        this.backupService = backupService;
        this.failureThreshold = failureThreshold;
        this.timeout = timeout;
        this.executor = Executors.newFixedThreadPool(maxConcurrentRequests);
        this.logger = Logger.getLogger(Ambassador.class.getName());
    }

    public String handleRequest(String request) throws TimeoutException {
        // 检查熔断器状态
        if (circuitBreaker.get()) {
            // 返回备用服务的响应
            return backupService.process(request);
        } else {
            try {
                // 创建 Callable 对象，并设置超时时间
                Callable<String> task = () -> primaryService.process(request);
                Future<String> future = executor.submit(task);
                String response = future.get(timeout, TimeUnit.MILLISECONDS);
                // 重置故障计数器
                failureCount.set(0);
                return response;
            } catch (InterruptedException | ExecutionException e) {
                // 处理请求异常
                // 增加故障计数器
                failureCount.incrementAndGet();
                // 检查故障计数器是否超过阈值
                if (failureCount.get() >= failureThreshold) {
                    // 启动熔断器
                    circuitBreaker.set(true);
                    logger.log(Level.WARNING, "Circuit breaker is tripped, switching to backup service");
                }
                // 返回备用服务的响应
                return backupService.process(request);
            } catch (TimeoutException e) {
                // 处理请求超时异常
                throw new TimeoutException("Request timed out");
            } finally {
                // 检查熔断器状态
                if (circuitBreaker.get()) {
                    // 创建定时任务，定时重置熔断器状态
                    ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
                    scheduler.schedule(() -> {
                        // 重置故障计数器和熔断器状态
                        failureCount.set(0);
                        circuitBreaker.set(false);
                        logger.log(Level.INFO, "Circuit breaker is reset, switching back to primary service");
                        // 关闭定时任务调度器
                        scheduler.shutdown();
                    }, timeout, TimeUnit.MILLISECONDS);
                }
            }
        }
    }
}
```

需要注意的是，在实际应用中，我们需要根据业务需求和系统负载来设置故障计数器的阈值和熔断器的停止时间。如果故障计数器的值超过了阈值，熔断器会启动，并在一定时间内停止发送请求。在熔断器停止期间，Ambassador 类会将所有请求转发到备用服务。当熔断器停止时间到达后，Ambassador 类会重新启动熔断器，并将请求转发到主服务进行处理。同时，我们还需要考虑并发请求的数量和请求的响应时间，以便更好地保证系统的稳定性和性能。

### 安全过滤器

在 Web 应用程序中，安全过滤器通常用于检查输入数据的合法性和防止攻击，如 SQL 注入、跨站脚本攻击等。使用 Ambassador 设计模式可以将安全过滤器部署在应用程序的前端，检查所有的输入数据，防止攻击和恶意行为。

下面是一个简单的示例，演示如何使用 Ambassador 设计模式来实现安全过滤器：

```java
import java.util.regex.Pattern;

public class SecurityFilter implements Service {

    private final Service service;

    public SecurityFilter(Service service) {
        this.service = service;
    }

    @Override
    public String process(String request) {
        // 检查输入数据，防止攻击和恶意行为
        if (!isValid(request)) {
            throw new IllegalArgumentException("Invalid request");
        }
        // 调用服务处理请求
        return service.process(request);
    }

    private boolean isValid(String request) {
        // 检查输入数据是否包含恶意代码
        Pattern pattern = Pattern.compile("<script>(.*?)</script>", Pattern.CASE_INSENSITIVE);
        return !pattern.matcher(request).find();
    }
}
```

在上述代码中，我们创建了一个 SecurityFilter 类，实现了 Service 接口，并在构造函数中传入了一个服务对象。在 process 方法中，我们首先检查输入数据，防止攻击和恶意行为，然后调用服务处理请求。

在 isValid 方法中，我们使用正则表达式检查输入数据是否包含恶意代码。在这个例子中，我们检查输入数据中是否包含 `<script>` 和 `</script>` 标签，如果包含则认为是恶意代码。

在实际应用中，我们可以根据具体的业务需求和安全策略，设计更加复杂和完善的安全过滤器。同时，我们还可以使用其他的设计模式和技术，如拦截器、过滤器链、黑白名单、加密算法等，来提高应用程序的安全性和可靠性。

以下是更进一步优化后的 SecurityFilter 类示例代码，其中使用了过滤器链和黑白名单来实现更加灵活和可配置的安全过滤器，同时增加了日志记录和异常处理，以便更好地监控和调试系统：

```java
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SecurityFilter implements Service {

    private final Service service;
    private final List<Filter> filters;
    private final List<String> whiteList;
    private final List<String> blackList;
    private final Logger logger = Logger.getLogger(SecurityFilter.class.getName());

    public SecurityFilter(Service service) {
        this.service = service;
        this.filters = new ArrayList<>();
        this.whiteList = new ArrayList<>();
        this.blackList = new ArrayList<>();
    }

    public void addFilter(Filter filter) {
        filters.add(filter);
    }

    public void addWhiteList(String pattern) {
        whiteList.add(pattern);
    }

    public void addBlackList(String pattern) {
        blackList.add(pattern);
    }

    @Override
    public String process(String request) {
        // 检查白名单
        if (!isAllowed(request, whiteList)) {
            logger.log(Level.WARNING, "Request not allowed: " + request);
            throw new IllegalArgumentException("Request not allowed");
        }
        // 检查黑名单
        if (isBlocked(request, blackList)) {
            logger.log(Level.WARNING, "Request blocked: " + request);
            throw new IllegalArgumentException("Request blocked");
        }
        // 执行过滤器链
        for (Filter filter : filters) {
            request = filter.doFilter(request);
        }
        // 调用服务处理请求
        return service.process(request);
    }

    private boolean isAllowed(String request, List<String> patterns) {
        // 检查请求是否在白名单中
        return patterns.stream().anyMatch(pattern -> Pattern.matches(pattern, request));
    }

    private boolean isBlocked(String request, List<String> patterns) {
        // 检查请求是否在黑名单中
        return patterns.stream().anyMatch(pattern -> Pattern.matches(pattern, request));
    }

    public interface Filter {
        String doFilter(String request);
    }
}
```

### 负载均衡

在分布式系统中，负载均衡通常用于将请求分发到多个服务器上，以实现高可用性和容错性。使用 Ambassador 设计模式可以实现负载均衡，将请求分发到多个服务实例上，从而提高系统的可用性和性能。

下面是一个简单的示例，演示如何使用 Ambassador 设计模式来实现负载均衡：

```java
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

public class LoadBalancer implements Service {

    private final List<Service> services;
    private final LoadBalancingStrategy strategy;

    public LoadBalancer(List<Service> services, LoadBalancingStrategy strategy) {
        this.services = services;
        this.strategy = strategy;
    }

    @Override
    public String process(String request) {
        // 根据负载均衡策略选择服务实例
        Service service = strategy.select(services);
        // 调用选择的服务处理请求
        return service.process(request);
    }

    public interface LoadBalancingStrategy {
        Service select(List<Service> services);
    }

    public static class RandomStrategy implements LoadBalancingStrategy {
        @Override
        public Service select(List<Service> services) {
            // 随机选择一个服务实例
            int index = ThreadLocalRandom.current().nextInt(services.size());
            return services.get(index);
        }
    }

    public static class RoundRobinStrategy implements LoadBalancingStrategy {
        private int index = 0;

        @Override
        public Service select(List<Service> services) {
            // 轮询选择服务实例
            Service service = services.get(index);
            index = (index + 1) % services.size();
            return service;
        }
    }
}
```

在上述代码中，我们创建了一个 LoadBalancer 类，实现了 Service 接口，并在构造函数中传入了一个服务列表和一个负载均衡策略。在 process 方法中，我们根据负载均衡策略选择一个服务实例，然后调用选择的服务处理请求。

在 LoadBalancingStrategy 接口中，我们定义了一个 select 方法，用于选择服务实例。在 RandomStrategy 类中，我们使用 ThreadLocalRandom 来随机选择一个服务实例。在 RoundRobinStrategy 类中，我们使用轮询算法来选择服务实例。

在实际应用中，我们可以根据具体的业务需求和性能指标，选择合适的负载均衡策略和算法，如加权轮询、最少连接数、哈希算法等，来实现更加高效和灵活的负载均衡。同时，我们还可以使用其他的设计模式和技术，如缓存、异步处理、分布式锁等，来进一步提高系统的可用性和性能。需要注意的是，在设计负载均衡器时，我们需要根据实际情况和负载均衡算法的特点，合理地分配服务实例和请求，避免出现负载不均衡或性能瓶颈的问题。

以下是经过优化后的负载均衡器的代码：

```java
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;

public class LoadBalancer {
    private final List<Service> services;
    private final LoadBalancingStrategy strategy;
    private final ConcurrentHashMap<Service, Integer> weights = new ConcurrentHashMap<>();

    public LoadBalancer(List<Service> services, LoadBalancingStrategy strategy) {
        this.services = new ArrayList<>(services);
        this.strategy = strategy;
        for (Service service : services) {
            weights.put(service, 1);
        }
    }

    public Service getService() {
        return strategy.select(services, weights);
    }

    public void setWeight(Service service, int weight) {
        weights.put(service, weight);
    }

    public static LoadBalancer create(List<Service> services, LoadBalancingStrategy strategy) {
        return new LoadBalancer(services, strategy);
    }

    public static LoadBalancer createWithRoundRobin(List<Service> services) {
        return new LoadBalancer(services, LoadBalancingStrategy.ROUND_ROBIN);
    }

    public static LoadBalancer createWithRandom(List<Service> services) {
        return new LoadBalancer(services, LoadBalancingStrategy.RANDOM);
    }

    public enum LoadBalancingStrategy {
        RANDOM(services -> services.get(ThreadLocalRandom.current().nextInt(services.size()))),
        ROUND_ROBIN(services -> {
            AtomicInteger index = new AtomicInteger(0);
            return services.get(index.getAndIncrement() % services.size());
        });

        private final Function<List<Service>, Service> selector;

        LoadBalancingStrategy(Function<List<Service>, Service> selector) {
            this.selector = selector;
        }

        public Service select(List<Service> services, ConcurrentHashMap<Service, Integer> weights) {
            if (services == null || services.isEmpty()) {
                throw new IllegalArgumentException("Services cannot be empty");
            }
            if (services.size() == 1) {
                return services.get(0);
            }
            List<Service> candidates = new ArrayList<>(services.size() * 100);
            for (Service service : services) {
                int weight = weights.getOrDefault(service, 1);
                for (int i = 0; i < weight; i++) {
                    candidates.add(service);
                }
            }
            return selector.apply(candidates);
        }
    }
}
```

在上述代码中，我们进行了以下优化：

1. 使用了 ConcurrentHashMap 来代替 HashMap，确保在并发环境下的线程安全性。
2. 使用了枚举类型来代替字符串常量，提高代码的可读性和安全性。
3. 使用了 Lambda 表达式和方法引用来简化负载均衡策略的实现。
4. 使用了静态工厂方法来创建负载均衡器对象，提高代码的可读性和灵活性。
5. 重构了 select 方法，将其实现逻辑从 LoadBalancer 类中抽离出来，并优化了权重的处理逻辑。

### 缓存

缓存可以提高应用程序的性能和响应速度，减少对数据库等后端资源的访问。使用 Ambassador 设计模式可以将缓存部署在应用程序的前端，将请求转发给缓存服务器进行处理，减少对后端资源的访问，提高系统的性能和响应速度。

以下是一个使用 Java 实现的简单示例，演示了如何使用 Ambassador 设计模式将请求转发给缓存服务器：

假设我们有一个简单的电子商务应用程序，用户可以浏览商品、下单、支付等操作。为了提高系统的性能和响应速度，我们可以在应用程序的前端部署一个缓存服务器，并使用 Ambassador 设计模式将请求转发给缓存服务器进行处理。在这个应用程序中，我们假设有一个名为 `ProductService` 的服务，用于获取商品信息。我们可以在应用程序的前端部署一个缓存服务器，并使用 Ambassador 设计模式将请求转发给缓存服务器。

首先，我们需要定义一个 `ProductService` 接口，用于获取商品信息：

```java
public interface ProductService {
    Product getProductById(String id);
}
```

接下来，我们定义一个 `ProductServiceImpl` 类，实现 `ProductService` 接口，并用于从后端数据库获取商品信息：

```java
public class ProductServiceImpl implements ProductService {
    @Override
    public Product getProductById(String id) {
        // 从后端数据库获取商品信息
        return new Product(id, "Product " + id);
    }
}
```

然后，我们定义一个 `ProductCache` 类，用于缓存商品信息：

```java
public class ProductCache {
    private final Map<String, Product> cache = new HashMap<>();

    public Product getProductById(String id) {
        return cache.get(id);
    }

    public void putProduct(Product product) {
        cache.put(product.getId(), product);
    }
}
```

接下来，我们定义一个 `ProductCacheService` 类，实现 `ProductService` 接口，并用于从缓存服务器获取商品信息。如果缓存服务器中没有所需的数据，那么就将请求转发给后端服务进行处理，并将处理结果缓存起来：

```java
public class ProductCacheService implements ProductService {
    private final ProductService backendService;
    private final ProductCache cache;

    public ProductCacheService(ProductService backendService, ProductCache cache) {
        this.backendService = backendService;
        this.cache = cache;
    }

    @Override
    public Product getProductById(String id) {
        Product product = cache.getProductById(id);
        if (product == null) {
            // 缓存服务器中没有所需的数据，将请求转发给后端服务进行处理
            product = backendService.getProductById(id);
            // 将处理结果缓存起来，以便后续的请求可以直接从缓存服务器获取数据
            cache.putProduct(product);
        }
        return product;
    }
}
```

最后，我们定义一个 `ProductServiceAmbassador` 类，用于接收来自应用程序的请求，并根据一定的规则将请求转发给缓存服务器或后端服务。

```java
public class ProductServiceAmbassador implements ProductService {
    private final ProductService cacheService;
    private final ProductService backendService;
    private final Map<String, Long> cachedIds = new ConcurrentHashMap<>();
    private final long cacheExpireTime = 60 * 1000L; // 缓存过期时间为 60 秒

    @Autowired
    public ProductServiceAmbassador(ProductService cacheService,
                                    ProductService backendService) {
        this.cacheService = cacheService;
        this.backendService = backendService;
    }

    @Override
    public Product getProductById(String id) {
        Long cachedTime = cachedIds.get(id);
        // 如果商品 ID 在缓存中存在，并且缓存未过期，那么就直接返回缓存中的商品信息
        if (cachedTime != null && System.currentTimeMillis() - cachedTime < cacheExpireTime) {
            return cacheService.getProductById(id);
        }
        // 如果商品 ID 在缓存中不存在，或者缓存已过期，那么就将请求转发给后端服务进行处理，并将处理结果缓存起来
        Product product = backendService.getProductById(id);
        cacheService.putProduct(product);
        cachedIds.put(id, System.currentTimeMillis());
        return product;
    }
}
```

### 服务发现和路由

在分布式系统中，服务发现和路由通常用于将请求路由到正确的服务实例上，以实现高可用性和容错性。使用 Ambassador 设计模式可以实现服务发现和路由，将请求路由到正确的服务实例上，从而提高系统的可用性和性能。

以下是一个使用 Ambassador 设计模式实现服务发现和路由的 Java 示例代码：

```java
public interface ProductService {
    Product getProductById(String id);
}

public class Product {
    private String id;
    private String name;

    public Product(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

public interface ProductDiscoveryClient {
    List<String> getInstances();
}

public class ProductDiscoveryClientImpl implements ProductDiscoveryClient {
    @Override
    public List<String> getInstances() {
        // 假装从服务注册中心获取服务实例列表
        return Arrays.asList("http://localhost:8080", "http://localhost:8081", "http://localhost:8082");
    }
}

public interface ProductRoutingStrategy {
    String getRoute(String productId, List<String> instances);
}

public class ProductRoutingStrategyImpl implements ProductRoutingStrategy {
    @Override
    public String getRoute(String productId, List<String> instances) {
        // 假装使用负载均衡算法选择一个服务实例
        int index = new Random().nextInt(instances.size());
        return instances.get(index) + "/product/" + productId;
    }
}

public class ProductServiceAmbassador implements ProductService {
    private final ProductDiscoveryClient discoveryClient;
    private final ProductRoutingStrategy routingStrategy;
    private final RestTemplate restTemplate;

    public ProductServiceAmbassador(ProductDiscoveryClient discoveryClient, ProductRoutingStrategy routingStrategy) {
        this.discoveryClient = discoveryClient;
        this.routingStrategy = routingStrategy;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public Product getProductById(String id) {
        List<String> instances = discoveryClient.getInstances();
        String route = routingStrategy.getRoute(id, instances);
        ResponseEntity<Product> response = restTemplate.getForEntity(route, Product.class);
        return response.getBody();
    }
}
```

在这个示例中，我们定义了一个 `ProductService` 接口和一个 `Product` 类，用于表示商品服务和商品信息。然后，我们定义了一个 `ProductDiscoveryClient` 接口和一个 `ProductDiscoveryClientImpl` 类，用于获取服务实例列表。在 `ProductDiscoveryClientImpl` 类中，我们假装从服务注册中心获取服务实例列表，这里我们将服务实例列表硬编码为三个本地的 HTTP 地址。

接下来，我们定义了一个 `ProductRoutingStrategy` 接口和一个 `ProductRoutingStrategyImpl` 类，用于选择服务实例。在 `ProductRoutingStrategyImpl` 类中，我们使用了随机负载均衡算法来选择一个服务实例，并将商品 ID 和服务实例的 URL 拼接在一起，形成最终的路由信息。

在最后，我们定义了一个 `ProductServiceAmbassador` 类，用于实现商品服务的代理。在 `ProductServiceAmbassador` 类中，我们使用了依赖注入（DI）的方式来注入 `ProductDiscoveryClient` 和 `ProductRoutingStrategy` 的实现类。在 `getProductById` 方法中，我们首先通过 `ProductDiscoveryClient` 获取服务实例列表，然后使用 `ProductRoutingStrategy` 选择一个服务实例，并将商品 ID 和服务实例的 URL 拼接在一起，形成最终的路由信息。最后，我们使用 `RestTemplate` 发送 HTTP GET 请求，并将响应的 JSON 数据转换为 `Product` 对象返回。

使用 Ambassador 设计模式可以实现服务发现和路由，从而提高系统的可用性和性能，使得服务消费者无需关心服务实例的具体位置和负载均衡算法，只需要通过代理对象来访问服务即可。

### 日志记录和监控

在分布式系统中，日志记录和监控通常用于跟踪服务的运行状态和性能指标，以便进行故障排除和性能优化。使用 Ambassador 设计模式可以将日志记录和监控部署在应用程序的前端，监控服务的运行状态和性能指标，从而实现故障排除和性能优化。

以下是一个使用 Ambassador 设计模式实现日志记录和监控的 Java 示例代码：

```java
public interface ProductService {
    Product getProductById(String id);
}

public class Product {
    private String id;
    private String name;

    public Product(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

public interface ProductLogger {
    void logRequest(String id);
    void logResponse(String id, Product product);
}

public class ProductLoggerImpl implements ProductLogger {
    private final Logger logger = LoggerFactory.getLogger(ProductLoggerImpl.class);

    @Override
    public void logRequest(String id) {
        logger.info("Requesting product with ID: {}", id);
    }

    @Override
    public void logResponse(String id, Product product) {
        logger.info("Received product with ID: {}, Name: {}", id, product.getName());
    }
}

public interface ProductMonitor {
    void recordLatency(String id, long latency);
    void incrementCounter(String id);
}

public class ProductMonitorImpl implements ProductMonitor {
    private final StatsDClient statsd;

    public ProductMonitorImpl(String host, int port) {
        this.statsd = new NonBlockingStatsDClient("product-service", host, port);
    }

    @Override
    public void recordLatency(String id, long latency) {
        statsd.recordExecutionTime("product.latency", latency, "id:" + id);
    }

    @Override
    public void incrementCounter(String id) {
        statsd.increment("product.counter", "id:" + id);
    }
}

public class ProductServiceAmbassador implements ProductService {
    private final ProductService productService;
    private final ProductLogger logger;
    private final ProductMonitor monitor;

    public ProductServiceAmbassador(ProductService productService, ProductLogger logger, ProductMonitor monitor) {
        this.productService = productService;
        this.logger = logger;
        this.monitor = monitor;
    }

    @Override
    public Product getProductById(String id) {
        logger.logRequest(id);
        long startTime = System.currentTimeMillis();
        Product product = productService.getProductById(id);
        long endTime = System.currentTimeMillis();
        logger.logResponse(id, product);
        long latency = endTime - startTime;
        monitor.recordLatency(id, latency);
        monitor.incrementCounter(id);
        return product;
    }
}
```

在这个示例中，我们定义了一个 `ProductService` 接口和一个 `Product` 类，用于表示商品服务和商品信息。然后，我们定义了一个 `ProductLogger` 接口和一个 `ProductLoggerImpl` 类，用于记录请求和响应的日志信息。在 `ProductLoggerImpl` 类中，我们使用了 `SLF4J` 日志框架来记录日志信息。

接下来，我们定义了一个 `ProductMonitor` 接口和一个 `ProductMonitorImpl` 类，用于记录运行状态和性能指标。在 `ProductMonitorImpl` 类中，我们使用了 `StatsD` 客户端来记录运行状态和性能指标，例如请求的延迟和调用次数等。在 `ProductMonitorImpl` 的构造函数中，我们可以指定 `StatsD` 客户端的主机和端口。

最后，我们定义了一个 `ProductServiceAmbassador` 类，用于实现商品服务的代理。在 `ProductServiceAmbassador` 类中，我们通过依赖注入（DI）的方式将 `ProductService`、`ProductLogger` 和 `ProductMonitor` 的实现类注入到构造函数中。在 `getProductById` 方法中，我们首先调用 `ProductLogger` 的 `logRequest` 方法来记录请求的日志信息。然后，我们使用 `System.currentTimeMillis()` 来记录请求的开始时间，然后调用 `ProductService` 的 `getProductById` 方法来获取商品信息。接下来，我们使用 `System.currentTimeMillis()` 来记录请求的结束时间，并调用 `ProductLogger` 的 `logResponse` 方法来记录响应的日志信息。最后，我们计算请求的延迟，并调用 `ProductMonitor` 的 `recordLatency` 方法来记录请求的延迟，调用 `ProductMonitor` 的 `incrementCounter` 方法来记录调用次数。

使用 Ambassador 设计模式可以将日志记录和监控部署在应用程序的前端，从而监控服务的运行状态和性能指标，并提供实时的故障排除和性能优化。由于日志记录和监控是与业务逻辑解耦的，因此我们可以随时在运行时添加、删除或更改日志记录和监控的实现，而不影响应用程序的正常运行。

## 已知使用

Ambassador 设计模式通常用于分布式系统中，用于解决服务间的通信问题和负载均衡问题。许多开源框架和工具都使用了 Ambassador 模式来实现服务代理和增强等功能。以下是一些常见的使用了 Ambassador 模式的开源框架和工具：

1. Istio：Istio 是一个流行的服务网格框架，它使用了 Ambassador 模式来实现服务代理和增强等功能，例如流量管理、安全认证、监控和日志等。
2. Envoy：Envoy 是一个高性能的代理服务器，它使用了 Ambassador 模式来实现负载均衡、流量转发和服务代理等功能。
3. Linkerd：Linkerd 是另一个流行的服务网格框架，它使用了 Ambassador 模式来实现服务代理和增强等功能，例如负载均衡、故障恢复和流量管理等。
4. Open Service Mesh：Open Service Mesh 是一个开源的服务网格框架，它使用了 Ambassador 模式来实现服务代理和增强等功能，例如流量管理、安全认证和监控等。
5. Consul：Consul 是一个流行的服务发现和配置工具，它使用了 Ambassador 模式来实现服务代理和增强等功能，例如负载均衡、健康检查和故障恢复等。
6. Kubernetes：Kubernetes 是一个流行的容器编排平台，它使用了 Ambassador 模式来实现服务代理和增强等功能，例如服务发现、负载均衡和流量管理等。
7. Nginx：Nginx 是一个高性能的 Web 服务器和反向代理服务器，它使用了 Ambassador 模式来实现负载均衡、流量转发和服务代理等功能。
8. Kong：Kong 是一个开源的 API 网关，它使用了 Ambassador 模式来实现流量管理、安全认证和监控等功能。
9. Traefik：Traefik 是一个流行的反向代理和负载均衡器，它使用了 Ambassador 模式来实现服务代理和增强等功能，例如动态配置、自动发现和流量转发等。

当然，Java 生态系统中也有许多开源框架和工具使用了 Ambassador 模式。以下是其中的一些：

1. Spring Cloud Netflix：Spring Cloud Netflix 是一个流行的微服务框架，它使用了 Netflix OSS 中的 Ribbon 和 Zuul 组件来实现服务代理和增强等功能，例如负载均衡、服务发现和路由等。
2. Spring Cloud Gateway：Spring Cloud Gateway 是 Spring Cloud 生态系统中的一个新型 API 网关，它使用了 Reactor Netty 和 Spring WebFlux 等技术来实现服务代理和增强等功能，例如负载均衡、路由和限流等。
3. Netflix OSS：Netflix OSS 是 Netflix 开源的一组分布式系统工具，其中包括了许多使用了 Ambassador 模式的组件，例如 Ribbon、Hystrix、Zuul 和 Eureka 等。
4. Micronaut：Micronaut 是一个轻量级的 Java 框架，它使用了 Netty 和 Reactive Streams 等技术来实现服务代理和增强等功能，例如负载均衡、服务发现和路由等。
5. Vert.x：Vert.x 是一个高性能的异步编程框架，它使用了 Netty 和 Reactive Streams 等技术来实现服务代理和增强等功能，例如负载均衡、路由和限流等。

### Spring Cloud Gateway

Spring Cloud Gateway 是 Spring Cloud 生态系统中的一个新型 API 网关，它使用了 Reactor Netty 和 Spring WebFlux 等技术来实现服务代理和增强等功能。它的设计理念就是基于 Ambassador 模式来构建的，它将每个后端服务都看作一个独立的实体，通过一个中央入口点来统一管理和控制。

下面通过代码来说明 Spring Cloud Gateway 如何使用 Ambassador 模式。假设我们有两个后端服务，一个是 user-service，一个是 order-service，我们希望通过 Spring Cloud Gateway 来实现负载均衡和路由的功能。

首先，我们需要添加 Spring Cloud Gateway 依赖，可以在 Maven 中添加以下依赖：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
```

然后，我们需要在配置文件中配置 Spring Cloud Gateway，例如 application.yml 文件：

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/users/**
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/orders/**
```

这段配置代码的意思是，我们定义了两个路由规则，一个是对于 /users/** 的请求，将会被路由到 user-service 服务上，另一个是对于 /orders/** 的请求，将会被路由到 order-service 服务上。其中，uri 前缀的 lb:// 表示使用负载均衡的方式来路由请求，这里我们使用了 Spring Cloud LoadBalancer 组件来实现负载均衡的功能。

最后，我们需要在启动类上添加 @EnableGateway 注解，来启用 Spring Cloud Gateway：

```java
@SpringBootApplication
@EnableDiscoveryClient
@EnableGateway
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

这样，我们就完成了 Spring Cloud Gateway 的配置和启用。通过以上的配置和代码，我们实现了 Ambassador 模式的基本功能，即通过一个中央入口点来统一管理和控制后端服务。同时，由于 Spring Cloud Gateway 基于 Reactor Netty 和 Spring WebFlux 等技术实现，它也具有非常高的性能和可扩展性。

Spring Cloud Gateway 源码中的实现方式，主要是基于 Reactor Netty 和 Spring WebFlux 框架来实现的。它的核心组件是 GatewayFilter 和 RouteLocator，其中 GatewayFilter 用于实现各种过滤器，例如请求转发、重定向、限流和认证等，而 RouteLocator 用于实现动态路由和负载均衡等功能。

具体来说，Spring Cloud Gateway 的工作原理如下：

1. Spring Cloud Gateway 接收客户端的请求，然后根据配置文件中的路由规则，选择一个合适的路由器进行处理。
2. 路由器会根据请求的 URL 和配置文件中的路由规则，选择一个或多个过滤器对请求进行处理。过滤器可以选择性地修改请求和响应，或者中断请求并返回响应。
3. 过滤器将处理后的请求发送到后端服务，然后将响应返回给客户端。
4. 在处理请求和响应的过程中，Spring Cloud Gateway 支持多种协议和格式，例如 HTTP、WebSocket、JSON 和 XML 等。

在 Spring Cloud Gateway 的源码中，它的核心组件是 GatewayFilter 和 RouteLocator。其中，GatewayFilter 是一个过滤器接口，它定义了一个过滤器的基本方法链，开发者可以通过实现 GatewayFilter 接口来实现自定义的过滤器。而 RouteLocator 则是一个路由规则接口，它定义了一个动态路由表，开发者可以通过实现 RouteLocator 接口来实现自定义的路由规则，例如基于服务发现的路由规则。

> Spring Cloud Gateway 支持 WebSocket 协议。WebSocket 是一种在单个 TCP 连接上进行全双工通信的协议，它允许客户端和服务器之间进行实时交互和通信。Spring Cloud Gateway 通过支持 WebSocket 协议，可以实现实时通信、推送和广播等功能。
>
> 要在 Spring Cloud Gateway 中支持 WebSocket 协议，需要进行以下步骤：
>
> 1. 引入 Spring Cloud Gateway WebSocket 依赖，可以在 Maven 中添加以下依赖：
>
>    ```xml
>    <dependency>
>        <groupId>org.springframework.cloud</groupId>
>        <artifactId>spring-cloud-starter-gateway-websocket</artifactId>
>    </dependency>
>    ```
>
> 2. 配置 Spring Cloud Gateway，需要在 application.yml 或 application.properties 文件中添加以下配置：
>
> ```yaml
> spring:
>   cloud:
>     gateway:
>       websockets:
>         enabled: true
> ```
>
>       这段配置代码的意思是，启用 Spring Cloud Gateway 的 WebSocket 支持。
>
> 3. 配置 WebSocket 路由，需要在 application.yml 或 application.properties 文件中添加以下配置：
>
>    ```yaml
>    spring:
>      cloud:
>        gateway:
>          routes:
>            - id: ws-route
>              uri: ws://localhost:8080
>              predicates:
>                - Path=/ws/**
>    ```
>
>    这段配置代码的意思是，将 /ws/\*\* 的请求路由到 uri 为 ws://localhost:8080 的 WebSocket 服务上。
>
> 4. 实现 WebSocket 处理器，需要编写一个实现 WebSocketHandler 接口的处理器，例如：
>
>    ```java
>    @Component
>    public class EchoWebSocketHandler implements WebSocketHandler {
>
>        @Override
>           public Mono<Void> handle(WebSocketSession session) {
>            // 处理 WebSocketSession
>            return session.send(session.receive().map(msg -> session.textMessage("Echo: " + msg.getPayloadAsText())));
>        }
>    }
>    ```
>
>    这段代码的意思是，实现一个处理器，用来处理 WebSocketSession。在此示例中，处理器会将接收到的消息进行回显，并返回给客户端。
>
> 5. 配置 WebSocket 处理器，需要在 application.yml 或 application.properties 文件中添加以下配置：
>
>    ```yaml
>    spring:
>      cloud:
>        gateway:
>          routes:
>            - id: ws-route
>              uri: ws://localhost:8080
>              predicates:
>                - Path=/ws/**
>              filters:
>                - name: WebSocket
>                  args:
>                    handler: echoWebSocketHandler
>                    subprotocols: subprotocol1, subprotocol2
>    ```
>
>    这段配置代码的意思是，将 WebSocket 处理器 echoWebSocketHandler 绑定到 WebSocket 路由上，并指定了子协议 subprotocol1 和 subprotocol2。
>
> 这样，我们就完成了在 Spring Cloud Gateway 中支持 WebSocket 协议的配置和代码实现。通过以上的配置和代码，我们可以在 Spring Cloud Gateway 上实现 WebSocket 的功能，例如实时通信、推送和广播等。

## 相关模式

- [Proxy](https://java-design-patterns.com/patterns/proxy/)

## 其他

### Ambassador 和 AOP

Ambassador 设计模式和 AOP（面向切面编程）都是用于实现横切关注点的设计模式。它们都可以在不修改现有代码的情况下，往程序中添加一些额外的行为，例如日志记录、性能监控、安全验证等。

Ambassador 设计模式是一种结构型设计模式，它通过代理对象来隐藏底层服务的实现细节，并提供一些额外的功能，例如服务发现、负载均衡、日志记录和监控等。在 Ambassador 设计模式中，代理对象和原始对象都实现了同一个接口，代理对象负责将调用转发到原始对象，并在调用前后执行一些额外的逻辑。

AOP 也是一种结构型设计模式，它通过将横切关注点从业务逻辑中分离出来，实现了一种基于切面的模块化设计。在 AOP 中，横切关注点被封装成切面，并通过切点和通知来定义切面的行为。在程序运行期间，AOP 框架会动态地将切面织入到目标对象的方法调用中，从而实现切面的功能。

虽然 Ambassador 设计模式和 AOP 都可以实现横切关注点，但它们的应用场景和目的略有不同。Ambassador 设计模式通常用于实现与底层服务相关的功能，例如服务发现、负载均衡、日志记录和监控等。而 AOP 则更加通用，可以用于实现任何与业务逻辑无关的功能，例如事务管理、安全验证、性能监控等。此外，AOP 还可以通过切面的织入顺序来实现一些复杂的功能，例如事务嵌套和并发控制等。

在实践中，Ambassador 设计模式和 AOP 可以结合使用，从而实现更加灵活和可扩展的应用程序设计。例如，在使用 Ambassador 设计模式实现服务调用时，我们可以使用 AOP 来记录请求和响应的日志信息，或者实现安全验证和性能监控等功能。在这种情况下，Ambassador 设计模式和 AOP 通常是相互补充的，可以在不同的层次上实现横切关注点的功能。

### Ambassador 和代理

Ambassador 设计模式和代理模式都是结构型设计模式，它们都使用代理对象来隐藏真实对象的实现细节，并提供一些额外的功能。然而，它们的目的和实现方式略有不同。

代理模式是一种结构型设计模式，它通过代理对象来控制对真实对象的访问。在代理模式中，代理对象和真实对象实现相同的接口，代理对象负责将方法调用传递给真实对象，并在此基础上添加一些额外的逻辑，例如权限控制、缓存、远程访问等。代理模式可以在不修改现有代码的情况下，为真实对象提供额外的功能和保护。

Ambassador 设计模式也是一种结构型设计模式，它通过代理对象来隐藏底层服务的实现细节，并提供一些额外的功能，例如服务发现、负载均衡、日志记录和监控等。在 Ambassador 设计模式中，代理对象和底层服务实现相同的接口，代理对象负责将调用转发到底层服务，并在此基础上添加一些额外的逻辑。Ambassador 设计模式通常用于实现与底层服务相关的功能。

Ambassador 设计模式和代理模式在某些方面确实非常相似，它们都使用代理对象来隐藏真实对象的实现细节，并提供一些额外的功能。然而，它们的目的和应用场景略有不同，这也是它们的区别所在。

代理模式通常用于控制对真实对象的访问，例如权限控制、缓存、远程访问等。它的重点在于实现对真实对象的保护和控制。代理模式的应用场景非常广泛，可以用于任何需要对真实对象进行访问控制和保护的场景。

Ambassador 设计模式则更加专注于底层服务的代理和增强，例如服务发现、负载均衡、日志记录和监控等。它通常用于分布式系统中，用于解决服务间的通信问题和负载均衡问题。Ambassador 设计模式的重点在于为底层服务提供代理和增强功能，以便更好地管理和控制底层服务。

虽然 Ambassador 设计模式和代理模式在某些方面非常相似，但它们在实际应用中通常被用于不同的场景和目的。在实践中，我们可以根据具体的需求和应用场景来选择使用哪种模式，或者将它们结合起来使用，以实现更加灵活和可扩展的应用程序设计。

## 参考文章

1. [Ambassador Pattern](https://docs.microsoft.com/en-us/azure/architecture/patterns/ambassador): 该文章介绍了 Ambassador 模式的概念和应用场景，并提供了一些实际案例供参考。
2. [Design Patterns for Microservices: Ambassador, Anti-Corruption Layer, and Backends for Frontends](https://dzone.com/articles/design-patterns-for-microservices-ambassador-anti) : 这篇文章介绍了在微服务架构中使用的两种设计模式：Ambassador 模式和 Anti-corruption Layer 模式。。
3. [The Ambassador pattern and Istio](https://itnext.io/ambassador-and-istio-edge-proxy-and-service-mesh-814aac9f23df): 这篇文章介绍了如何使用 Istio 和 Ambassador 模式来实现微服务的边缘代理和服务网格。
4. [Kubernetes — Learn Ambassador Container Pattern](https://medium.com/bb-tutorials-and-thoughts/kubernetes-learn-ambassador-container-pattern-bc2e1331bd3a) 介绍了如何在 Kubernetes 中使用 Ambassador 模式来解决微服务通信的问题。
5. [Ambassador vs API Gateway](https://blog.getambassador.io/api-gateway-vs-service-mesh-104c01fa4784): 该文章对比了 Ambassador 模式和传统的 API 网关的优缺点，分析了它们在不同场景下的应用和适用性。
