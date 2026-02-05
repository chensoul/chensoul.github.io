---
title: "Spring AI 和 Open AI 入门指南"
date: 2025-09-18
slug: spring-ai
categories: ["ai"]
tags: ['spring-ai']
---

本文将探讨以下内容：

- Spring AI 简介。
- 使用 Spring AI 与 OpenAI 进行交互。

<!--more-->

> **示例代码库**
>
> 您可以在 [GitHub 仓库](https://github.com/chensoul/spring-ai-samples/tree/main/01-chat-openai) 中找到本文的示例代码。

## OpenAI 和 SpringAI 简介

ChatGPT 由 OpenAI 发布，一经推出便风靡全球。它是首个能够根据提示生成类似人类回答的语言模型。此后，OpenAI 又发布了其他几个模型，包括 DALL-E，它可以根据文本提示生成图像。

[Spring AI](https://spring.io/projects/spring-ai)是一个 Java 库，它提供了一个简单易用的接口来与 LLM 模型进行交互。Spring AI 提供更高级别的抽象，用于与各种 LLM 进行交互，例如 **OpenAI**、**Azure OpenAI**、**Hugging Face**、**Google Vertex**、**Ollama**、**Amazon Bedrock**等。

在本文中，我们将探讨如何使用 Spring AI 与 Open AI 进行交互。

首先，我们需要在 OpenAI 创建一个帐户并获取 API 密钥。

- 前往[OpenAI 平台](https://platform.openai.com/)并创建一个帐户。
- 在控制面板中，点击左侧导航菜单中的**“API 密钥” ，创建一个新的 API 密钥。**

获取 API 密钥后，将该`OPENAI_API_KEY`API 密钥设置到环境变量中。

```bash
export OPENAI_API_KEY=<your-api-key>
```

## 创建 Spring AI 项目

让我们使用 Spring Initializr 创建一个新的 Spring Boot Maven 项目。

- 前往 [Spring Initializr](https://start.spring.io/)
- 选择 **Web** 和 **OpenAI** starters

## 使用 ChatClient 与 OpenAI 进行交互

Spring AI 提供**ChatClient**抽象，用于与不同类型的 LLM 进行交互，而无需与实际的 LLM 模型耦合。

例如，我们可以使用**ChatClient**与 OpenAI 进行交互，如下所示：

```java
@RestController
@RequestMapping("/")
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

上述代码中没有与 OpenAI 耦合。

我们可以通过在**application.properties**文件中提供 API 密钥和其他参数来配置**ChatClient**以使用 OpenAI 。

```properties
spring.application.name=01-chat-openai

#spring.ai.openai.base-url=https://api.openai.com
spring.ai.openai.api-key=${OPENAI_API_KEY}
spring.ai.openai.chat.options.model=gpt-5
# From 0 to 1.
# higher number -> more creative and random
# lower number -> more deterministic
# gpt-5 supports temperature=1 only
spring.ai.openai.chat.options.temperature=1

logging.level.org.springframework.ai.chat.client.advisor=DEBUG
```

现在我们可以运行应用程序并测试聊天 API 了。

```bash
curl -s -X POST http://localhost:8080/api/chat -H "Content-Type: application/json" -d '{"prompt":"What is Spring Boot?"}'

{"content":"**Spring Boot** is an open-source Java-based framework that simplifies the creation of **standalone, production-grade Spring applications** with minimal configuration. It's built on top of the Spring Framework but removes much of its complexity."}%
```

## 使用 OpenAI 兼容模型

许多 AI 服务商提供了与 OpenAI API 兼容的接口。Spring AI 的 `spring-ai-starter-model-openai` 通过配置 **base-url**、**api-key** 以及可选的 **chat.completions-path** 和 **model**，即可无缝切换到这些兼容服务，无需修改任何 Java 代码。

本示例中通过 **Spring Profile** 预置了多套配置，启动时指定 profile 即可切换模型：

| Profile        | 服务商           | 环境变量           | 说明                         |
|----------------|------------------|--------------------|------------------------------|
| （默认）       | OpenAI           | `OPENAI_API_KEY`   | 官方 OpenAI                  |
| `deepseek`     | DeepSeek         | `DEEPSEEK_API_KEY` | DeepSeek 推理/对话模型       |
| `openrouter`   | OpenRouter       | `OPENROUTER_API_KEY` | 聚合多种开源/商业模型       |
| `groq`         | Groq             | `GROQ_API_KEY`     | 高速推理，如 Llama           |
| `gemini`       | Google Gemini    | `GEMINI_API_KEY`   | Gemini 的 OpenAI 兼容端点    |
| `dmr`          | Docker Model Runner | 无               | 本地 DMR 引擎（如 SmolLM）   |

**示例：使用 DeepSeek**

1. 在 [DeepSeek 开放平台](https://platform.deepseek.com/) 获取 API Key，并设置环境变量：

```bash
export DEEPSEEK_API_KEY=<your-deepseek-api-key>
```

2. 使用 `deepseek` profile 启动应用：

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=deepseek
```

3. 调用方式与默认 OpenAI 完全一致：

```bash
curl -s -X POST http://localhost:8080/api/chat -H "Content-Type: application/json" -d '{"prompt":"What is Spring Boot?"}'
```

**配置示例（DeepSeek）**

只需在 `application-deepseek.properties` 中指定兼容的 base-url 和 model，其余与 OpenAI 配置方式相同：

```properties
## DeepSeek ##
spring.ai.openai.base-url=https://api.deepseek.com
spring.ai.openai.api-key=${DEEPSEEK_API_KEY}
spring.ai.openai.chat.options.model=deepseek-reasoner
```

**路径与模型可调**

若某服务的聊天完成接口路径不是默认的 `/v1/chat/completions`，可通过 `spring.ai.openai.chat.completions-path` 覆盖。例如 Groq 与 Gemini 的配置：

```properties
# Groq
spring.ai.openai.base-url=https://api.groq.com
spring.ai.openai.chat.completions-path=/openai/v1/chat/completions
spring.ai.openai.api-key=${GROQ_API_KEY}
spring.ai.openai.chat.options.model=llama-3.3-70b-versatile

# Google Gemini OpenAI 兼容模式
spring.ai.openai.base-url=https://generativelanguage.googleapis.com
spring.ai.openai.chat.completions-path=/v1beta/openai/chat/completions
spring.ai.openai.api-key=${GEMINI_API_KEY}
spring.ai.openai.chat.options.model=gemini-2.0-flash
```

这样，同一套 ChatController 与 ChatClient 代码即可在不同 OpenAI 兼容模型之间切换，只需更换 profile 和对应的环境变量。

## 总结

Spring AI 为 Java 开发者提供了一个强大、灵活且易于集成的 AI 解决方案。它让您能够在熟悉的 Spring 生态系统中快速构建现代化的 AI 驱动应用程序，特别适合实现"基于文档的问答"和"与文档对话"等常见用例。



