---
title: "Java 生成式 AI 入门：LangChain4j 与 OpenAI 实战指南"
date: 2026-02-06
slug: getting-started-with-langchain4j
categories: ["ai"]
tags: ['langchain4j', 'ai', 'openai']
---

生成式 AI 正在重塑应用开发的方式。虽然 Python 在该领域占据主导地位，但 Java 开发者并未被遗忘。**LangChain4j** 应运而生——这是一个功能强大的库，旨在简化大语言模型（LLMs）与 Java 应用的集成。

本文将带你探索如何分别使用原生 Java 和 LangChain4j 与 OpenAI（及其兼容模型）进行交互，并展示 LangChain4j 为何是 Java 开发者的不二之选。

<!--more-->

## 源代码

您可以在 [GitHub 仓库](https://github.com/chensoul/langchain4j-samples/tree/main/01-quick-start) 中找到本文的示例代码。

## 前置条件

- Java 17+
- Maven 3.9+

## OpenAI Chat API 简介

首先，我们需要在 OpenAI 创建一个帐户并获取 API 密钥。

- 前往 [OpenAI 平台](https://platform.openai.com/) 并创建一个帐户。
- 在控制面板中，点击左侧导航菜单中的“API 密钥” ，创建一个新的 API 密钥。

获取 API 密钥后，即可使用它与 OpenAI API 进行交互。您可以在[此处](https://platform.openai.com/docs/api-reference/)找到 OpenAI API 参考文档。

让我们看看如何使用 OpenAI 的 Chat API 端点向其提出问题。

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "Who are you"
      }
    ]
  }'
```

你会收到类似如下的 JSON 响应：

```json
{
  "id": "chatcmpl-8tvrQyjw3s28IREvkFl6kIhTxIUGZ",
  "object": "chat.completion",
  "created": 1708341148,
  "model": "gpt-3.5-turbo-0125",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I am an AI assistant created by OpenAI..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 10,
    "total_tokens": 20
  }
}
```

这个简单的 API 调用就是我们接下来要用 Java 实现的核心功能。

## "硬"模式：使用原生 Java

在领略 LangChain4j 的便捷之前，我们先看看使用标准 Java 库（`java.net.http.HttpClient` 和 `Jackson`）调用 `OpenAI Chat Completion API` 需要做哪些工作。

现在，让我们看看如何使用 Java 内置的HttpClient与 OpenAI 进行交互。

我们将使用 Jackson JSON 库来序列化/反序列化请求和响应。

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>
```

首先，我们将创建 Java Record 类来表示请求和响应 JSON 有效负载。

```java
record Message(String role, String content) {}

record ChatRequest( String model, List<Message> messages, double temperature) {}

@JsonIgnoreProperties(ignoreUnknown = true)
record ChatUsage(
        @JsonProperty("prompt_tokens")
        int promptTokens,
        @JsonProperty("completion_tokens")
        int completionTokens,
        @JsonProperty("total_tokens")
        int totalTokens
) {}

@JsonIgnoreProperties(ignoreUnknown = true)
record ChatResponseChoice(
        int index,
        Message message,
        @JsonProperty("finish_reason")
        String finishReason
) {}

@JsonIgnoreProperties(ignoreUnknown = true)
record ChatResponse(
        String id, String object, long created,
        String model, ChatUsage usage,
        List<ChatResponseChoice> choices
) {}
```

我们创建了 Java 记录来表示请求和响应，其中只包含我们感兴趣的字段。

接下来，我们使用 Java 的 HttpClient 与 OpenAI 进行交互。

```java
public class ChatDemo {
    public static void main(String[] args) throws Exception {
        // 1. 手动构建请求体
        Message message = new Message("user", "Who are you");
        ChatRequest chatRequest = new ChatRequest(MODEL, List.of(message), TEMPERATURE);
        String requestPayload = mapper.writeValueAsString(chatRequest);

        // 2. 构建 HTTP 请求
        HttpRequest request = HttpRequest.newBuilder()
```
