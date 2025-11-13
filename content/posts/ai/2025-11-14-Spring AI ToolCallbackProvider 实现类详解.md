---
title: "Spring AI ToolCallbackProvider 实现类详解"
date: "2025-11-13"
slug: spring-ai-ToolCallbackProvider
description: "深入解析 Spring AI ToolCallbackProvider 接口及其实现类：MethodToolCallbackProvider、SyncMcpToolCallbackProvider、AsyncMcpToolCallbackProvider、StaticToolCallbackProvider。学习工具调用的最佳实践、使用场景对比和配置示例。"
keywords: ["Spring AI", "ToolCallbackProvider", "工具调用", "MCP协议", "MethodToolCallbackProvider", "AsyncMcpToolCallbackProvider", "Spring Boot AI", "Function Calling", "AI工具集成", "Spring AI工具"]
categories: ["ai"]
tags: ['spring-ai', 'tool-calling', 'mcp', 'spring-boot', 'function-calling', 'tool-provider']
author: "ChenSoul"
---

`ToolCallbackProvider` 是 Spring AI 中用于提供工具回调的接口。本文将详细介绍其主要实现类及其使用场景。

> **版本说明**：本文基于 Spring AI 1.1.0 版本编写，代码示例和 API 说明均基于此版本。随着框架的不断发展，部分 API 可能会有变化，建议参考 [Spring AI 官方文档](https://docs.spring.io/spring-ai/reference/)获取最新信息。

## 接口定义

```java
public interface ToolCallbackProvider {
    ToolCallback[] getToolCallbacks();
}
```

## 主要实现类

### 1. MethodToolCallbackProvider

**用途**：包装本地带有 `@Tool` 注解的方法，将其转换为工具回调。

**包路径**：`org.springframework.ai.tool.method.MethodToolCallbackProvider`

**使用场景**：

- 本地工具（同一应用内）
- 使用 `@Tool` 注解的方法
- 需要将 Spring Bean 的方法暴露为工具

**示例代码**：

```java
@Service
class WeatherService {
    @Tool(description = "Get weather for a location")
    String getWeather(@ToolParam(description = "City name") String city) {
        return "Sunny, 25°C in " + city;
    }
    
    @Tool(description = "Get forecast")
    String getForecast(@ToolParam String city, @ToolParam int days) {
        return "Forecast for " + city + " for " + days + " days";
    }
}

// 配置 Bean
@Bean
MethodToolCallbackProvider weatherTools(WeatherService weatherService) {
    return MethodToolCallbackProvider
        .builder()
        .toolObjects(weatherService)  // 传入带有 @Tool 注解的对象
        .build();
}

// 使用
ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultToolCallbacks(weatherTools)
    .build();
```

**特点**：

- ✅ 自动扫描 `@Tool` 注解的方法
- ✅ 支持多个工具对象
- ✅ 自动处理参数类型转换
- ✅ 与 Spring Bean 集成良好

**Builder 方法**：

```java
MethodToolCallbackProvider.builder()
    .toolObjects(object1, object2, ...)  // 添加工具对象
    .build();
```

---

### 2. SyncMcpToolCallbackProvider

**用途**：通过 MCP（Model Context Protocol）协议调用远程工具。

**包路径**：`org.springframework.ai.mcp.SyncMcpToolCallbackProvider`

**使用场景**：

- 远程工具（微服务架构）
- MCP 服务器提供的工具
- 需要跨服务调用工具

**示例代码**：

```java
// 1. 创建 MCP 客户端
@Bean
McpSyncClient schedulerMcp() {
    var mcp = McpClient
        .sync(HttpClientSseClientTransport.builder("http://localhost:8081/").build())
        .build();
    mcp.initialize();
    return mcp;
}

// 2. 创建 SyncMcpToolCallbackProvider
@Bean
SyncMcpToolCallbackProvider mcpToolProvider(McpSyncClient schedulerMcp) {
    return SyncMcpToolCallbackProvider
        .builder()
        .mcpClients(schedulerMcp)  // 传入 MCP 客户端
        .build();
}

// 3. 使用
ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultToolCallbacks(mcpToolProvider)
    .build();
```

**特点**：

- ✅ 支持多个 MCP 客户端
- ✅ 自动发现远程工具
- ✅ 通过 HTTP SSE 通信
- ✅ 支持微服务架构

**Builder 方法**：

```java
SyncMcpToolCallbackProvider.builder()
    .mcpClients(client1, client2, ...)  // 添加 MCP 客户端
    .build();
```

**完整示例**：参考 [spring-ai-dog-adoption-showcase](https://github.com/chensoul/spring-ai-dog-adoption-showcase)

---

### 3. AsyncMcpToolCallbackProvider

**用途**：异步版本的 MCP 工具回调提供者，用于异步调用远程 MCP 工具。

**包路径**：`org.springframework.ai.mcp.AsyncMcpToolCallbackProvider`

**使用场景**：

- 需要异步调用远程 MCP 工具
- 高并发场景
- 非阻塞式工具调用
- 响应式编程（Reactive）

**示例代码**：

```java
// 1. 创建异步 MCP 客户端
@Bean
McpAsyncClient asyncSchedulerMcp() {
    var mcp = McpClient
        .async(HttpClientSseClientTransport.builder("http://localhost:8081/").build())
        .build();
    mcp.initialize();
    return mcp;
}

// 2. 创建 AsyncMcpToolCallbackProvider
@Bean
AsyncMcpToolCallbackProvider asyncMcpToolProvider(McpAsyncClient asyncSchedulerMcp) {
    return AsyncMcpToolCallbackProvider
        .builder()
        .mcpClients(asyncSchedulerMcp)  // 传入异步 MCP 客户端
        .build();
}

// 3. 使用
ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultToolCallbacks(asyncMcpToolProvider)
    .build();
```

**特点**：

- ✅ 异步非阻塞调用
- ✅ 支持响应式编程
- ✅ 适合高并发场景
- ✅ 支持多个异步 MCP 客户端

**Builder 方法**：

```java
AsyncMcpToolCallbackProvider.builder()
    .mcpClients(asyncClient1, asyncClient2, ...)  // 添加异步 MCP 客户端
    .build();
```

**与 SyncMcpToolCallbackProvider 的区别**：

| 特性 | SyncMcpToolCallbackProvider | AsyncMcpToolCallbackProvider |
|------|----------------------------|------------------------------|
| **调用方式** | 同步阻塞 | 异步非阻塞 |
| **客户端类型** | `McpSyncClient` | `McpAsyncClient` |
| **性能** | 适合低并发 | 适合高并发 |
| **响应式** | 不支持 | 支持 |

---

### 4. StaticToolCallbackProvider

**用途**：直接接受预定义的 `ToolCallback` 实例，提供静态工具集合。

**包路径**：`org.springframework.ai.tool.StaticToolCallbackProvider`

**使用场景**：

- 工具集合固定且已知
- 手动创建工具回调
- 不需要动态发现工具
- 简单的工具集合

**示例代码**：

```java
// 1. 手动创建工具回调
ToolCallback weatherTool = ToolCallback.builder()
    .toolDefinition(ToolDefinition.builder()
        .name("get-weather")
        .description("Get weather for a location")
        .parameters(Map.of(
            "type", "object",
            "properties", Map.of(
                "city", Map.of("type", "string", "description", "City name")
            ),
            "required", List.of("city")
        ))
        .build())
    .toolMethod(params -> {
        String city = (String) params.get("city");
        return "Sunny, 25°C in " + city;
    })
    .build();

ToolCallback calculatorTool = ToolCallback.builder()
    .toolDefinition(ToolDefinition.builder()
        .name("calculate")
        .description("Perform calculation")
        .build())
    .toolMethod(params -> {
        double a = ((Number) params.get("a")).doubleValue();
        double b = ((Number) params.get("b")).doubleValue();
        String op = (String) params.get("operation");
        return switch (op) {
            case "add" -> String.valueOf(a + b);
            case "subtract" -> String.valueOf(a - b);
            case "multiply" -> String.valueOf(a * b);
            case "divide" -> String.valueOf(a / b);
            default -> "Unknown operation";
        };
    })
    .build();

// 2. 创建 StaticToolCallbackProvider
@Bean
StaticToolCallbackProvider staticToolProvider() {
    return new StaticToolCallbackProvider(weatherTool, calculatorTool);
}

// 3. 使用
ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultToolCallbacks(staticToolProvider)
    .build();
```

**特点**：

- ✅ 完全控制工具定义
- ✅ 适合简单场景
- ✅ 无需注解扫描
- ✅ 性能开销小

**构造函数**：

```java
// 接受可变参数
new StaticToolCallbackProvider(toolCallback1, toolCallback2, ...)

// 接受集合
new StaticToolCallbackProvider(List.of(toolCallback1, toolCallback2))
```

**使用场景示例**：

```java
// 简单的工具集合
@Component
public class SimpleTools {
    
    @Bean
    StaticToolCallbackProvider simpleTools() {
        return new StaticToolCallbackProvider(
            createTimeTool(),
            createEchoTool()
        );
    }
    
    private ToolCallback createTimeTool() {
        return ToolCallback.builder()
            .toolDefinition(ToolDefinition.builder()
                .name("get-current-time")
                .description("Get current time")
                .build())
            .toolMethod(params -> Instant.now().toString())
            .build();
    }
    
    private ToolCallback createEchoTool() {
        return ToolCallback.builder()
            .toolDefinition(ToolDefinition.builder()
                .name("echo")
                .description("Echo the input")
                .parameters(Map.of(
                    "type", "object",
                    "properties", Map.of(
                        "message", Map.of("type", "string")
                    )
                ))
                .build())
            .toolMethod(params -> (String) params.get("message"))
            .build();
    }
}
```

---

### 5. 自定义 ToolCallbackProvider

如果需要自定义工具提供逻辑，可以实现 `ToolCallbackProvider` 接口：

**示例**：

```java
@Component
public class CustomToolCallbackProvider implements ToolCallbackProvider {
    
    private final List<ToolCallback> toolCallbacks;
    
    public CustomToolCallbackProvider() {
        // 创建自定义工具回调
        this.toolCallbacks = List.of(
            ToolCallback.builder()
                .toolDefinition(ToolDefinition.builder()
                    .name("custom-tool")
                    .description("A custom tool")
                    .build())
                .toolMethod(this::customMethod)
                .build()
        );
    }
    
    @Override
    public ToolCallback[] getToolCallbacks() {
        return toolCallbacks.toArray(new ToolCallback[0]);
    }
    
    private String customMethod(Map<String, Object> params) {
        // 工具实现逻辑
        return "Custom tool result";
    }
}
```

---

## 对比总结

| 特性 | MethodToolCallbackProvider | SyncMcpToolCallbackProvider | AsyncMcpToolCallbackProvider | StaticToolCallbackProvider | 自定义实现 |
|------|---------------------------|----------------------------|------------------------------|---------------------------|----------|
| **使用场景** | 本地工具 | 远程工具（MCP同步） | 远程工具（MCP异步） | 静态工具集合 | 特殊需求 |
| **工具来源** | `@Tool` 注解方法 | MCP 服务器 | MCP 服务器 | 手动创建 | 自定义 |
| **通信方式** | 本地调用 | HTTP SSE（同步） | HTTP SSE（异步） | 本地调用 | 自定义 |
| **调用方式** | 同步 | 同步阻塞 | 异步非阻塞 | 同步 | 自定义 |
| **配置复杂度** | 低 | 中 | 中 | 低 | 高 |
| **适用架构** | 单体应用 | 微服务 | 微服务（高并发） | 单体应用 | 任意 |
| **性能** | 高 | 中 | 高（并发） | 高 | 取决于实现 |

---

## 组合使用

可以同时使用多个 `ToolCallbackProvider`：

```java
ChatClient chatClient = ChatClient.builder(chatModel)
    .defaultToolCallbacks(
        // 静态工具
        new StaticToolCallbackProvider(timeTool, echoTool),
        // 本地工具（@Tool 注解）
        MethodToolCallbackProvider.builder()
            .toolObjects(localWeatherService)
            .build(),
        // MCP 同步远程工具
        SyncMcpToolCallbackProvider.builder()
            .mcpClients(schedulerMcp, weatherMcp)
            .build(),
        // MCP 异步远程工具（可选）
        AsyncMcpToolCallbackProvider.builder()
            .mcpClients(asyncMcpClient)
            .build()
    )
    .build();
```

---

## 最佳实践

1. **本地工具优先使用 `MethodToolCallbackProvider`**
   - 简单直接
   - 性能更好（无网络开销）
   - 类型安全
   - 自动扫描 `@Tool` 注解

2. **简单静态工具使用 `StaticToolCallbackProvider`**
   - 适合工具数量少且固定
   - 完全控制工具定义
   - 无需注解扫描

3. **远程工具选择**
   - **低并发场景**：使用 `SyncMcpToolCallbackProvider`
     - 简单直接
     - 同步调用，易于调试
   - **高并发场景**：使用 `AsyncMcpToolCallbackProvider`
     - 异步非阻塞
     - 更好的并发性能
     - 支持响应式编程

4. **工具命名规范**
   - 使用清晰的工具名称
   - 提供详细的工具描述
   - 参数描述要准确

5. **错误处理**
   - 工具方法应该处理异常
   - 返回有意义的错误信息
   - 记录工具调用日志

6. **性能考虑**
   - 本地工具 > 静态工具 > MCP 同步工具 > MCP 异步工具（按性能排序）
   - 根据实际场景选择合适的实现
   - 高并发场景优先考虑异步实现

## 选择指南

### 何时使用 MethodToolCallbackProvider？

- ✅ 工具定义在 Spring Bean 中
- ✅ 使用 `@Tool` 注解
- ✅ 需要自动发现工具
- ✅ 本地工具调用

### 何时使用 StaticToolCallbackProvider？

- ✅ 工具数量少且固定
- ✅ 不需要动态发现
- ✅ 简单的工具集合
- ✅ 完全控制工具定义

### 何时使用 SyncMcpToolCallbackProvider？

- ✅ 远程 MCP 工具
- ✅ 低到中等并发
- ✅ 同步调用即可满足需求
- ✅ 微服务架构

### 何时使用 AsyncMcpToolCallbackProvider？

- ✅ 远程 MCP 工具
- ✅ 高并发场景
- ✅ 需要非阻塞调用
- ✅ 响应式编程需求

---

## 相关资源

- [Spring AI 工具调用文档](https://docs.spring.io/spring-ai/reference/api/tools.html)
- [MCP 协议规范](https://modelcontextprotocol.io/)
- [Spring AI MCP 示例](https://github.com/spring-projects/spring-ai-examples/tree/main/model-context-protocol)
