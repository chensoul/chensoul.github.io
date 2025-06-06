---
title: "2024-01-02｜雪崩问题、Spring Cloud微服务集成 Sentinel"
date: 2024-01-02
type: post
slug: til
categories: ["Review"]
tags: ["spring-cloud"]
---

今天做了什么：

- 雪崩问题
- Spring Cloud微服务集成 Sentinel
- 扩展 Sentinel 集成 OpenFeign，实现自动降级



## 雪崩问题

1、什么是雪崩问题？

雪崩问题（Avalanche Effect）是指在分布式系统中，当一个节点或服务出现故障或不可用时，其影响会扩散到其他节点或服务，导致级联故障的现象。这种现象类似于雪崩，一旦开始，会不断放大和蔓延，最终导致整个系统崩溃。

雪崩问题的主要原因是系统中的节点或服务之间存在过度依赖、高度耦合，以及缺乏容错机制。当一个节点或服务出现故障时，由于其他节点或服务无法及时处理或适应，故障会不断传播，最终导致整个系统的崩溃。



2、如何解决雪崩问题？

- 超时处理：在请求其他节点或服务时，设置适当的超时时间。如果在规定的时间内未收到响应，可以认为请求失败，并进行相应的处理，如返回默认值或错误信息。超时处理可以防止因等待过长的响应时间导致的请求堆积和资源浪费。
- 线程隔离：通过将不同的请求在不同的线程中执行，可以避免因某个请求的执行时间过长而影响其他请求的处理。线程隔离可以通过线程池或独立的线程来实现。每个请求都在独立的线程中执行，发生故障或异常时只会影响当前请求，而不会影响整个系统的稳定性。
- 降级熔断：当系统压力过大或出现故障时，可以通过降级熔断机制暂时关闭或减少对某些功能或服务的请求，以保护核心功能的稳定性。例如，当请求某个服务的失败率超过阈值时，可以自动触发熔断机制，暂时停止对该服务的请求，并返回一个默认值或错误信息。
- 流量控制：通过实施流量控制策略，限制对系统的并发请求数量。可以使用令牌桶算法或漏桶算法等进行流量控制。这可以避免过多的请求集中在某个节点或服务上，导致其负载过重，进而引发雪崩效应。
- 负载均衡：使用负载均衡器将请求分发到多个节点或服务上，以均衡系统的负载。负载均衡可以基于不同的算法，如轮询、随机、加权轮询等。通过负载均衡，可以避免单一节点或服务承受过大的压力，从而减少故障和雪崩的风险。

这些方法可以单独或组合使用，具体的选择和实施取决于系统的需求和架构。此外，还需要定期进行系统性能评估和压力测试，以便及时发现和解决潜在的雪崩问题，并不断优化系统的可靠性和稳定性。



## Spring Cloud 微服务集成 Sentinel

添加 maven 依赖：

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-sentinel</artifactId>
</dependency>
```

添加配置文件：

```properties
spring.cloud.sentinel.transport.dashboard=localhost:8080
```

配置文件打开 Sentinel 对 Feign 的支持：`feign.sentinel.enabled=true`

加入 `spring-cloud-starter-openfeign` 依赖使 Sentinel starter 中的自动化配置类生效：

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

配置 RestTemplate 支持 sentinel：

```java
@Bean
@SentinelRestTemplate(
    blockHandler = "handleBlock",
    fallback = "handleFallback",
    fallbackClass = SentinelFallbackBlockHandler.class,
    blockHandlerClass = SentinelFallbackBlockHandler.class)
public RestTemplate restTemplate() {
    return new RestTemplate();
}
```

SentinelFallbackBlockHandler 类：

```java
public class SentinelFallbackBlockHandler {
    public static ClientHttpResponse handleBlock(HttpRequest request, byte[] body, ClientHttpRequestExecution execution, BlockException exception) {
        return new SentinelClientHttpResponse();
    }

    public static ClientHttpResponse handleFallback(HttpRequest request, byte[] body, ClientHttpRequestExecution execution, BlockException ex) {
        return new SentinelClientHttpResponse();
    }
}
```



## 扩展 Sentinel 集成 OpenFeign，实现自动降级

1、扩展 BlockExceptionHandler，实现 JSON 输出

```java
@Slf4j
@RequiredArgsConstructor
public class JsonBlockExceptionHandler implements BlockExceptionHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, BlockException e) throws Exception {
        log.error("Sentinel fallback , resource is {}", e.getRule().getResource(), e);

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.getWriter().print(objectMapper.writeValueAsString(Result.error(ResultCode.TOO_MANY_REQUESTS)));
    }
}
```

2、重写 SentinelInvocationHandler，实现自动降级处理

```java
@Slf4j
public class AutoFallbackSentinelInvocationHandler implements InvocationHandler {
    public static final String EQUALS = "equals";
    public static final String HASH_CODE = "hashCode";
    public static final String TO_STRING = "toString";
    private final Target<?> target;
    private final Map<Method, InvocationHandlerFactory.MethodHandler> dispatch;
    private FallbackFactory<?> fallbackFactory;
    private Map<Method, Method> fallbackMethodMap;

    AutoFallbackSentinelInvocationHandler(Target<?> target, Map<Method, InvocationHandlerFactory.MethodHandler> dispatch,
                                          FallbackFactory<?> fallbackFactory) {
        this.target = checkNotNull(target, "target");
        this.dispatch = checkNotNull(dispatch, "dispatch");
        this.fallbackFactory = fallbackFactory;
        this.fallbackMethodMap = toFallbackMethod(dispatch);
    }

    AutoFallbackSentinelInvocationHandler(Target<?> target, Map<Method, InvocationHandlerFactory.MethodHandler> dispatch) {
        this.target = checkNotNull(target, "target");
        this.dispatch = checkNotNull(dispatch, "dispatch");
    }

    @Override
    public Object invoke(final Object proxy, final Method method, final Object[] args) throws Throwable {
        if (EQUALS.equals(method.getName())) {
            try {
                Object otherHandler = args.length > 0 && args[0] != null ? Proxy.getInvocationHandler(args[0]) : null;
                return equals(otherHandler);
            } catch (IllegalArgumentException e) {
                return false;
            }
        } else if (HASH_CODE.equals(method.getName())) {
            return hashCode();
        } else if (TO_STRING.equals(method.getName())) {
            return toString();
        }

        Object result;
        InvocationHandlerFactory.MethodHandler methodHandler = this.dispatch.get(method);
        / only handle by HardCodedTarget
        if (target instanceof Target.HardCodedTarget) {
            Target.HardCodedTarget<?> hardCodedTarget = (Target.HardCodedTarget) target;
            MethodMetadata methodMetadata = SentinelContractHolder.METADATA_MAP
                .get(hardCodedTarget.type().getName() + Feign.configKey(hardCodedTarget.type(), method));
            / resource default is HttpMethod:protocol:/url
            if (methodMetadata == null) {
                result = methodHandler.invoke(args);
            } else {
                String resourceName = methodMetadata.template().method().toUpperCase() + ':' + hardCodedTarget.url()
                    + methodMetadata.template().path();
                Entry entry = null;
                try {
                    ContextUtil.enter(resourceName);
                    entry = SphU.entry(resourceName, EntryType.OUT, 1, args);
                    result = methodHandler.invoke(args);
                } catch (Throwable ex) {
                    / fallback handle
                    if (!BlockException.isBlockException(ex)) {
                        Tracer.trace(ex);
                    }
                    if (fallbackFactory != null) {
                        try {
                            return fallbackMethodMap.get(method).invoke(fallbackFactory.create(ex), args);
                        } catch (IllegalAccessException e) {
                            / shouldn't happen as method is public due to being an
                            / interface
                            throw new AssertionError(e);
                        } catch (InvocationTargetException e) {
                            throw new AssertionError(e.getCause());
                        }
                    } else {
                        / 若是Result类型 并且不包含@FeignRetry 执行自动降级返回
                        FeignRetry feignRetry = AnnotationUtils.findAnnotation(method, FeignRetry.class);
                        if (Result.class == method.getReturnType() && Objects.isNull(feignRetry)) {
                            log.error("服务调用异常", ex);
                            return Result.error(ResultCode.INNER_SERVICE_ERROR, ex.getMessage());
                        } else {
                            throw ex;
                        }
                    }
                } finally {
                    if (entry != null) {
                        entry.exit(1, args);
                    }
                    ContextUtil.exit();
                }
            }
        } else {
            / other target type using default strategy
            result = methodHandler.invoke(args);
        }

        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof SentinelInvocationHandler) {
            AutoFallbackSentinelInvocationHandler other = (AutoFallbackSentinelInvocationHandler) obj;
            return target.equals(other.target);
        }
        return false;
    }

    @Override
    public int hashCode() {
        return target.hashCode();
    }

    @Override
    public String toString() {
        return target.toString();
    }

    static Map<Method, Method> toFallbackMethod(Map<Method, InvocationHandlerFactory.MethodHandler> dispatch) {
        Map<Method, Method> result = new LinkedHashMap<>();
        for (Method method : dispatch.keySet()) {
            method.setAccessible(true);
            result.put(method, method);
        }
        return result;
    }
}
```



3、重写 SentinelFeign，支持自动降级注入

```java
public final class AutoFallbackSentinelFeign {
    private AutoFallbackSentinelFeign() {
    }

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder extends Feign.Builder implements ApplicationContextAware {
        private Contract contract = new Contract.Default();
        private ApplicationContext applicationContext;
        private FeignContext feignContext;

        @Override
        public Feign.Builder invocationHandlerFactory(InvocationHandlerFactory invocationHandlerFactory) {
            throw new UnsupportedOperationException();
        }

        @Override
        public Builder contract(Contract contract) {
            this.contract = contract;
            return this;
        }

        @Override
        public Feign build() {
            super.invocationHandlerFactory(new InvocationHandlerFactory() {
                @Override
                public InvocationHandler create(Target target, Map<Method, MethodHandler> dispatch) {
                    / 查找 FeignClient 上的 降级策略
                    FeignClient feignClient = AnnotationUtils.findAnnotation(target.type(), FeignClient.class);
                    Class<?> fallback = feignClient.fallback();
                    Class<?> fallbackFactory = feignClient.fallbackFactory();

                    String beanName = feignClient.contextId();
                    if (!StringUtils.hasText(beanName)) {
                        beanName = feignClient.name();
                    }

                    Object fallbackInstance;
                    FallbackFactory<?> fallbackFactoryInstance;
                    if (void.class != fallback) {
                        fallbackInstance = getFromContext(beanName, "fallback", fallback, target.type());
                        return new AutoFallbackSentinelInvocationHandler(target, dispatch,
                            new FallbackFactory.Default(fallbackInstance));
                    }

                    if (void.class != fallbackFactory) {
                        /针对 hystrix fallbackFactory 特殊处理
                        try {
                            fallbackFactoryInstance = (FallbackFactory<?>) getFromContext(beanName, "fallbackFactory",
                                fallbackFactory, FallbackFactory.class);
                        } catch (Exception e) {
                            return new AutoFallbackSentinelInvocationHandler(target, dispatch);
                        }
                        return new AutoFallbackSentinelInvocationHandler(target, dispatch, fallbackFactoryInstance);
                    }
                    return new AutoFallbackSentinelInvocationHandler(target, dispatch);
                }

                private Object getFromContext(String name, String type, Class<?> fallbackType, Class<?> targetType) {
                    Object fallbackInstance = feignContext.getInstance(name, fallbackType);
                    if (fallbackInstance == null) {
                        throw new IllegalStateException(String
                            .format("No %s instance of type %s found for loadbalance client %s", type, fallbackType, name));
                    }

                    if (!targetType.isAssignableFrom(fallbackType)) {
                        throw new IllegalStateException(String.format(
                            "Incompatible %s instance. Fallback/fallbackFactory of type %s is not assignable to %s for loadbalance client %s",
                            type, fallbackType, targetType, name));
                    }
                    return fallbackInstance;
                }
            });

            super.contract(new SentinelContractHolder(contract));
            return super.build();
        }

        private Object getFieldValue(Object instance, String fieldName) {
            Field field = ReflectionUtils.findField(instance.getClass(), fieldName);
            field.setAccessible(true);
            try {
                return field.get(instance);
            } catch (IllegalAccessException e) {
                / ignore
            }
            return null;
        }

        @Override
        public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
            this.applicationContext = applicationContext;
            feignContext = this.applicationContext.getBean(FeignContext.class);
        }
    }
}
```

最后，再进行自动装配：

```java
@AutoConfiguration
@AutoConfigureBefore(SentinelFeignAutoConfiguration.class)
@ConditionalOnProperty(name = "feign.sentinel.enabled", havingValue = "true")
public class SentinelFeignConfiguration {
    @Bean
    @Scope("prototype")
    @ConditionalOnMissingBean
    public Feign.Builder autoFallbackSentinelFeignBuilder() {
        return AutoFallbackSentinelFeign.builder();
    }

    @Bean
    @ConditionalOnMissingBean
    public BlockExceptionHandler blockExceptionHandler(ObjectMapper objectMapper) {
        return new JsonBlockExceptionHandler(objectMapper);
    }

    @Bean
    @ConditionalOnMissingBean
    public RequestOriginParser requestOriginParser() {
        return new AllowHeaderRequestOriginParser();
    }
}
```

