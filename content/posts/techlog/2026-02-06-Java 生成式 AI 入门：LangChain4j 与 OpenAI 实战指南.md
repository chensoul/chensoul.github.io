---
title: "Java 生成式 AI 入门：LangChain4j 与 OpenAI 实战指南"
date: 2026-02-06 08:00:00+08:00
slug: getting-started-with-langchain4j
categories: [ "techlog" ]
tags: ['langchain4j', 'ai', 'openai']
image: /thumbnails/langchain4j.svg
---

生成式 AI 正在重塑应用开发的方式。虽然 Python 在该领域占据主导地位，但 Java 开发者并未被遗忘。**LangChain4j** 应运而生——这是一个功能强大的库，旨在简化大语言模型（LLMs）与 Java 应用的集成。

本文将带你探索如何分别使用原生 Java 和 LangChain4j 与 OpenAI（及其兼容模型）进行交互，并展示 LangChain4j 为何是 Java 开发者的不二之选。

<!--more-->

## 源代码

您可以在 [GitHub 仓库](https://github.com/chensoul/langchain4j-samples/tree/main/01-chat-openai) 中找到本文的示例代码。

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

## 使用原生 Java

在领略 LangChain4j 的便捷之前，我们先看看使用标准 Java 库（`java.net.http.HttpClient` 和 `Jackson`）调用 `OpenAI Chat Completion API` 需要做哪些工作。

现在，让我们看看如何使用 Java 内置的HttpClient与 OpenAI 进行交互。

我们将使用 Jackson JSON 库来序列化/反序列化请求和响应。

```xml title="pom.xml"
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

```java title="PlainChatDemo.java"
public class PlainChatDemo {
    public static final String OPENAI_API_KEY = System.getenv("OPENAI_API_KEY");
    public static final String CHAT_URL = "https://api.openai.com/v1/chat/completions";
    public static final String MODEL = "gpt-3.5-turbo";
    public static final double TEMPERATURE = 0.7;

    static HttpClient client = HttpClient.newHttpClient();
    static ObjectMapper mapper = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        Message message = new Message("user", "Who are you");
        ChatRequest chatRequest = new ChatRequest(MODEL, List.of(message), TEMPERATURE);
        String requestPayload = mapper.writeValueAsString(chatRequest);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(CHAT_URL))
                .header("Authorization", "Bearer %s".formatted(OPENAI_API_KEY))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestPayload))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        String body = response.body();
        ChatResponse chatResponse = mapper.readValue(body, ChatResponse.class);
        System.out.println(chatResponse.choices().getFirst().message().content());
    }
}
```

设置环境变量：

```bash
OPENAI_API_KEY=XXXXX
```

然后启动 PlainChatDemo，可以看到输出结果

### 使用 LangChain4j

```java title="LangChainChatDemo.java"
public class LangChainChatDemo {

    public static void main(String[] args) {
				ChatModel model = OpenAiChatModel.builder().apiKey(System.getenv("OPENAI_API_KEY")).build();
				
      	String answer = model.chat("Who are you");
        System.out.println(answer);
    }
}
```

设置环境变量：

```bash
DASHSCOPE_API_KEY=XXXXX
```

然后启动 LangChainChatDemo，可以看到输出结果：

```txt
I am Qwen, a large-scale language model developed by Alibaba Group. I can answer questions, create text, write code, and perform many other tasks. How can I assist you today?
```

上面代码使用的是 OpenAI 的接口进行测，我们也可以使用其他模型提供商的接口和模型，比如下面代码使用的是阿里千问的模型：

```java title="LangChainChatDemo.java"
public class LangChainChatDemo {

    public static void main(String[] args) {
//        ChatModel model = OpenAiChatModel.builder()
//                .apiKey(System.getenv("OPENAI_API_KEY"))
//                .build();

        ChatModel model = OpenAiChatModel.builder()
                .baseUrl("https://dashscope.aliyuncs.com/compatible-mode/v1")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .modelName("qwen-turbo")
                .build();

        String answer = model.chat("Who are you");
        System.out.println(answer);
    }
}
```

OpenAiChatModel 还支持更多参数设置：

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

TestChatModelListener 

```java 
@Slf4j
public static class TestChatModelListener implements ChatModelListener {
    @Override
    public void onRequest(ChatModelRequestContext requestContext) {
        requestContext.attributes().put("test", "test");
        log.info("请求参数:{}", requestContext.attributes());
    }

    @Override
    public void onResponse(ChatModelResponseContext responseContext) {
        Object object = responseContext.attributes().get("test");

        log.info("返回结果:{}", object);
    }

    @Override
    public void onError(ChatModelErrorContext errorContext) {
        log.error("请求异常:{}", errorContext);
    }
}
```

以上是使用聊天模型，如果想使用图像模型，则代码如下：

```java title="LangChainImageDemo.java"
public class LangChainImageDemo {

    public static void main(String[] args) {
        ImageModel model = OpenAiImageModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName(DALL_E_3)
                .build();

        Response<Image> response = model.generate(
                "Swiss software developers with cheese fondue, a parrot and a cup of coffee");

        System.out.println(response.content().url());
    }
}
```

同样，你也可以使用阿里千问的图像模型，但是首先必须添加依赖：

```xml title="pom.xml"
<dependency>
  <groupId>dev.langchain4j</groupId>
  <artifactId>langchain4j-community-dashscope</artifactId>
</dependency>
```

然后，修改 LangChainImageDemo 如下：

```java title="LangChainImageDemo.java"
public class LangChainImageDemo {

    public static void main(String[] args) {
//        ImageModel model = OpenAiImageModel.builder()
//                .apiKey(System.getenv("OPENAI_API_KEY"))
//                .modelName(DALL_E_3)
//                .build();

        ImageModel model = WanxImageModel.builder()
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .modelName("qwen-image")
                .build();

        Response<Image> response = model.generate(
                "Swiss software developers with cheese fondue, a parrot and a cup of coffee");

        System.out.println(response.content().url());
    }
}
```

## 使用 Spring Boot

首先，需要添加依赖：

```xml title="pom.xml"
<dependency>
    <groupId>dev.langchain4j</groupId>
    <artifactId>langchain4j-open-ai-spring-boot-starter</artifactId>
</dependency>
```

然后，添加配置：

```yaml title="application.yaml"
langchain4j:
  open-ai:
    chat-model:
      api-key: ${DASHSCOPE_API_KEY}
      model-name: qwen-turbo
      base-url: https://dashscope.aliyuncs.com/compatible-mode/v1
```

ChatOpenAIApplication：

```java title="ChatOpenAIApplication.java"
@SpringBootApplication
public class ChatOpenAIApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatOpenAIApplication.class, args);
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

