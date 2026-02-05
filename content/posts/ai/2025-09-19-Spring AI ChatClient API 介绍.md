---
title: "Spring AI ChatClient API 介绍"
date: 2025-09-19
slug: spring-ai-chat-client-api
categories: ["ai"]
tags: ['spring-ai']

---

ChatClient 是 Spring AI 提供的核心 API，提供流畅的调用方式，用于与各类大模型交互。本文结合 [01-chat-openai](https://github.com/chensoul/spring-ai-samples/tree/main/01-chat-openai) 示例，介绍 ChatClient 的创建方式、调用链与常用配置。

<!--more-->

> **示例代码库**
>
> 您可以在 [GitHub 仓库](https://github.com/chensoul/spring-ai-samples/tree/main/01-chat-openai) 中找到本文的示例代码。

## 核心概念

- **ChatClient**：与模型交互的入口，通过 `prompt()` 构建请求、`call()` 或 `stream()` 执行。
- **Prompt**：一次请求的完整内容，可包含系统消息、用户消息、占位符等。
- **Advisor**：在请求/响应链上的拦截与增强（如日志、记忆、RAG），本示例使用 `SimpleLoggerAdvisor`。

## 使用 ChatClient.Builder 创建 ChatClient

本示例通过 Spring Boot 自动配置的 `ChatClient.Builder` 创建 ChatClient，并在构建时注册默认 Advisor：

```java
@RestController
class ChatController {
    private final ChatClient chatClient;

    ChatController(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultAdvisors(new SimpleLoggerAdvisor())
                .build();
    }

    @PostMapping("/api/chat")
    Output chat(@RequestBody @Valid Input input) {
        String response = chatClient.prompt(input.prompt()).call().content();
        return new Output(response);
    }

    record Input(@NotBlank String prompt) {}
    record Output(String content) {}
}
```

要点：

- 注入 `ChatClient.Builder`，调用 `build()` 得到 `ChatClient`。
- `defaultAdvisors(new SimpleLoggerAdvisor())` 为每次调用统一加上请求/响应日志。
- 无需在代码中写死模型或 API 地址，均由配置文件与 profile 决定。

## 调用链：prompt → call → content

一次同步调用的典型写法：

```java
String response = chatClient.prompt(input.prompt()).call().content();
```

- **prompt(...)**：传入用户输入（或更复杂的 `PromptSpec`，如 `.user(...).system(...)`）。
- **call()**：同步执行，返回 `ChatResponse`。
- **content()**：从 `ChatResponse` 中取出助手回复的文本。

若需要完整响应（元数据、用法等），可保留 `ChatResponse`：

```java
ChatResponse chatResponse = chatClient.prompt(input.prompt()).call().chatResponse();
String text = chatResponse.getResult().getOutput().getContent();
// 还可访问 chatResponse.getMetadata() 等
```

## SimpleLoggerAdvisor 与日志

`SimpleLoggerAdvisor` 会在 DEBUG 级别打印请求与响应，便于调试。启用方式：

```properties
logging.level.org.springframework.ai.chat.client.advisor=DEBUG
```

本示例在 `application.properties` 中已配置上述日志级别，使用默认或任意 OpenAI 兼容 profile 启动即可在控制台看到每次调用的 prompt 与模型回复。

## 配置选项

与本示例相关的配置集中在 `application.properties`（或各 profile 的 `application-*.properties`）：

```properties
# 可选：兼容模型时修改 base-url
# spring.ai.openai.base-url=https://api.openai.com

spring.ai.openai.api-key=${OPENAI_API_KEY}
spring.ai.openai.chat.options.model=gpt-5
spring.ai.openai.chat.options.temperature=1
```

常用项说明：

| 配置项 | 说明 |
|--------|------|
| `spring.ai.openai.base-url` | 兼容接口时改为对应服务地址 |
| `spring.ai.openai.api-key` | 对应服务的 API Key 环境变量 |
| `spring.ai.openai.chat.options.model` | 模型名称 |
| `spring.ai.openai.chat.options.temperature` | 采样随机度，0～1 |
| `spring.ai.openai.chat.completions-path` | 非默认路径时指定聊天完成接口路径（见 1.md 中 Groq/Gemini 示例） |

## 测试接口

应用启动后，可用 curl 验证：

```bash
curl -s -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is Spring Boot?"}'
```

返回为 JSON：`{"content":"..."}`。

## 进阶能力（其他示例）

本模块仅演示「单轮、同步、无记忆」的聊天。以下能力在仓库其他示例中实现：

- **提示模板与占位符**：见 04-prompt-templates
- **结构化输出**：见 05-structured-output
- **对话记忆（Chat Memory）**：见 06-chat-memory
- **RAG（检索增强）**：见 07-rag-vector-store
- **工具调用（Function Calling）**：见 08-tool-calling

如需多模型并存（如同时配置 OpenAI 与 Anthropic），可关闭默认 ChatClient 自动配置后自行定义多个 `ChatModel` / `ChatClient` Bean，并通过 `@Qualifier` 注入。

## 总结

- ChatClient 通过 **ChatClient.Builder** 创建，本示例使用 `defaultAdvisors(SimpleLoggerAdvisor)` 统一打日志。
- 同步调用链为 **prompt(...) → call() → content()**，与具体模型解耦。
- 模型与端点通过 **application.properties** 和 **Spring Profile** 配置，便于切换 OpenAI 及各类兼容模型（见 1.md）。
- 流式、多轮、RAG、工具调用等可在本仓库对应示例中继续学习。

