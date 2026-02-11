---
title: "Java 生成式 AI 入门：LangChain4j 与 OpenAI 实战指南"
date: "2026-02-06"
slug: getting-started-with-langchain4j
categories: ["ai"]
tags: ['langchain4j', 'ai', 'openai']
---

生成式 AI 正在重塑应用开发的方式。虽然 Python 在该领域占据主导地位，但 Java 开发者并未被遗忘。**LangChain4j** 应运而生——这是一个功能强大的库，旨在简化大语言模型（LLMs）与 Java 应用的集成。

本文将带你探索如何分别使用原生 Java 和 LangChain4j 与 OpenAI（及其兼容模型）进行交互，并展示 LangChain4j 为何是 Java 开发者的不二之选。

<!--more-->

> 示例代码库
>
> 您可以在 [GitHub 仓库](https://github.com/chensoul/langchain4j-samples/tree/main/01-quick-start) 中找到本文的示例代码。

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
                .uri(URI.create(CHAT_URL))
                .header("Authorization", "Bearer %s".formatted(OPENAI_API_KEY))
                // ... 其他 Header
                .POST(HttpRequest.BodyPublishers.ofString(requestPayload))
                .build();

        // 3. 发送请求并解析响应
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        ChatResponse chatResponse = mapper.readValue(response.body(), ChatResponse.class);
        
        System.out.println(chatResponse.choices().getFirst().message().content());
    }
}
```

我们创建了一个 `ChatRequest` 实例，并使用 Jackson 将其序列化为 JSON 字符串。然后，我们创建了一个 `HttpRequest` 实例，并使用 Java 的 `HttpClient` 发送了该请求。最后，我们使用 Jackson 将响应 JSON 反序列化为 `ChatResponse`。

这里有几点需要注意：

- 我们从环境变量 `OPENAI_API_KEY` 获取 OpenAI API 密钥。
- 我们使用的是 `gp-3.5-turbo` 模型，您可以在这里查看 OpenAI 中所有可用的模型。
- 我们使用的温度值为 0.7，它控制着响应的随机性。较低的温度会产生更确定性的响应，而较高的温度会产生更随机的响应。

这里需要注意的一点是响应中的 `usage` 字段，它可以让您了解请求和响应使用了多少个令牌。

```json
{
  "..":"..",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 10,
    "total_tokens": 20
  }
}
```

您的 OpenAI API 使用量是根据使用的令牌数量来计量的。您可以访问 [什么是令牌以及如何计算令牌？](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them) 了解更多关于令牌的信息。

我们已经了解了如何使用 Java 的HttpClient与 OpenAI 进行交互。然而，这种方法比较底层，使用起来也不太方便。下一节我们将学习如何使用LangChain4j与 OpenAI 进行交互。

## "易"模式：使用 LangChain4j

LangChain4j 屏蔽了底层的 HTTP 和 JSON 处理细节，提供了一套简洁、流畅的 Java API。

### 1. 引入依赖

首先，在 `pom.xml` 中添加必要的依赖。

```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai</artifactId>
</dependency>
```

### 2. 基本用法 (编程式)

下面是使用 LangChain4j 实现相同功能的代码。请注意它是多么简洁。

```java
// 创建模型实例
ChatModel model = OpenAiChatModel.builder()
        .apiKey(System.getenv("OPENAI_API_KEY"))
        .modelName("gpt-3.5-turbo")
        .build();

// 直接调用 chat() 方法！
String answer = model.chat("Who are you");
System.out.println(answer);
```

ChatModel 有一个简单的 `chat` 方法，它接受 `String` 作为输入并返回 `String` 作为输出。

以下是其他聊天 API 方法：

```java
		ChatResponse chat(ChatMessage... messages);
    ChatResponse chat(List<ChatMessage> messages);
```

这些版本的 `chat` 方法接受一个或多个 `ChatMessage` 作为输入。 `ChatMessage` 是表示聊天消息的基本接口。

如果您希望自定义请求（例如，指定温度、工具或 JSON 模式等）， 您可以使用 `chat(ChatRequest)` 方法：

```java
    ChatResponse chat(ChatRequest chatRequest);
```

ChatMessage 目前有四种类型的聊天消息，每种对应消息的一个"来源"：

- `UserMessage`：这是来自用户的消息。 
- `AiMessage`：这是由 AI 生成的消息，通常是对 `UserMessage` 的回应。
- `ToolExecutionResultMessage`：这是 `ToolExecutionRequest` 的结果。
- `SystemMessage`：这是来自系统的消息。 通常，您作为开发人员应该定义此消息的内容。 通常，您会在这里写入关于 LLM 角色是什么、它应该如何行为、以什么风格回答等指令。 LLM 被训练为比其他类型的消息更加关注 `SystemMessage`， 所以要小心，最好不要让最终用户自由定义或在 `SystemMessage` 中注入一些输入。 通常，它位于对话的开始。
- `CustomMessage`：这是一个可以包含任意属性的自定义消息。这种消息类型只能由 支持它的 `ChatLanguageModel` 实现使用（目前只有 Ollama）。

你还可以通过修改 `baseUrl` 轻松切换到其他 OpenAI 兼容的模型提供商（例如阿里云的通义千问）：

```java
model = OpenAiChatModel.builder()
        .baseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1")
        .apiKey(System.getenv("DASHSCOPE_API_KEY"))
        .modelName("qwen-turbo")
        .build();
```

OpenAiChatModel 支持设置更多的参数：

```java
ChatModel model = OpenAiChatModel.builder()
        .baseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1")
        .apiKey(System.getenv("DASHSCOPE_API_KEY"))
        .modelName("qwen-turbo")
        .temperature(0.3)
        .maxRetries(1)
        .timeout(Duration.ofSeconds(60))
        .listeners(List.of(new TestChatModelListener()))
        .logRequests(true)
        .logResponses(true)
        .build();
```



### 3. Spring Boot 集成

如果你在使用 Spring Boot，集成会变得更加简单。LangChain4j 提供了 Starter 来自动配置 `ChatModel` Bean。

添加依赖：

```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai-spring-boot-starter</artifactId>
</dependency>
```

**配置文件 application.yaml:**

```yaml
langchain4j:
  open-ai:
    chat-model:
      api-key: ${DASHSCOPE_API_KEY} 
      model-name: qwen-turbo
      base-url: https://dashscope.aliyuncs.com/compatible-mode/v1
```

只需注入 `ChatModel` 即可直接使用。

```java
@SpringBootApplication
public class QuickStartApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuickStartApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(ChatModel chatModel) {
        return args -> {
            String answer = chatModel.chat("Who are you");
            System.out.println(answer);
        };
    }
}
```

### 4. 运行项目

1.  **设置 API Key 环境变量**：
    
    ```bash
    export DASHSCOPE_API_KEY="sk-..." 
    # 或者
    export OPENAI_API_KEY="sk-..."
    ```
2.  **运行 Spring Boot 应用**：
    ```bash
    mvn spring-boot:run
    ```

## 进阶

### 1. 使用 Testcontainers 与 Ollama

在开发和测试阶段，调用付费的外部 API（如 OpenAI）可能会带来成本和网络延迟问题。**Ollama** 允许你在本地运行大语言模型，而 **Testcontainers** 则可以帮助你在测试中轻松管理 Docker 容器。

LangChain4j 完美支持这两者，让你能够构建完全本地化、自包含的集成测试环境。

> **注意**：使用 Testcontainers 需要你的机器上已安装并运行 Docker 环境。
>
> 如果你使用的是 **OrbStack**，可能会遇到 `Could not find unix domain socket` 错误。这是因为 Testcontainers 默认查找 `/var/run/docker.sock`，而该文件可能不存在或链接错误。解决方法是在用户主目录下的 `.testcontainers.properties` 文件中添加以下配置：
> `docker.host=unix://~/.orbstack/run/docker.sock`

[Ollama](https://ollama.com/) 是一个开源项目，允许你在本地运行 Llama 2、Mistral 等大语言模型。

通常，你需要手动下载并安装 Ollama，然后通过命令行启动模型（如 `ollama run llama2`）。但在自动化测试中，要求每台机器都预先安装 Ollama 是不现实的。

这正是 **Testcontainers** 大显身手的地方。它可以自动启动一个包含 Ollama 和特定模型的 Docker 容器，测试结束后自动销毁，确保环境的纯净和一致性。

让我们看看如何结合 LangChain4j、Testcontainers 和 Ollama 构建测试。

#### 1. 添加依赖

除了 LangChain4j 的核心库，我们还需要添加 Testcontainers 的 Ollama 模块以及 LangChain4j 的 Ollama 集成。

```xml
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-ollama</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>ollama</artifactId>
    <scope>test</scope>
</dependency>
```

#### 2. 编写测试用例

下面是一个使用 `JUnit 5` 和 `Testcontainers` 启动 `Ollama` 容器，并使用 LangChain4j与之交互的完整示例。

为了演示方便，我们使用 `langchain4j/ollama-tinyllama:latest` 镜像，它预装了 `tinyllama` 模型，启动速度非常快。

```java
public class OllamaTest {

    @Test
    void test() {
        // 启动一个预装了 tinyllama 模型的 Ollama 容器
        try (OllamaContainer ollama = new OllamaContainer(DockerImageName.parse("langchain4j/ollama-tinyllama:latest")
                .asCompatibleSubstituteFor("ollama/ollama"))) {
            ollama.start();

            // 构建 OllamaChatModel
            ChatModel model = OllamaChatModel.builder()
                    .baseUrl(ollama.getEndpoint())
                    .modelName("tinyllama")
                    .build();

            // 发起对话
            String answer = model.chat("Who are you");
            System.out.println(answer);
        }
    }
}
```

通过这种方式，你可以确保你的 AI 应用逻辑在没有互联网连接或 API 密钥的情况下也能被正确测试。

## 总结

LangChain4j 架起了 Java 与生成式 AI 世界的桥梁。它消除了繁琐的样板代码，支持多种 LLM 提供商（OpenAI, Google Vertex, HuggingFace 等），并能与 Spring 生态系统无缝集成。

如果你是一名希望构建 AI 应用的 Java 开发者，LangChain4j 绝对是你工具箱中不可或缺的利器。
