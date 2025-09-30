---
title: "Spring AI ChatClient API 介绍"
date: 2025-09-19
slug: spring-ai-chat-client-api
categories: ["ai"]
tags: ['spring-ai', 'java', 'tutorial', 'api']
---

`ChatClient` 是 Spring AI 提供的核心 API，它是一个流畅的接口，旨在简化 Java 应用程序与 AI 模型的交互。ChatClient 支持同步和流式编程模型，提供了构建提示（Prompt）和处理 AI 响应的便捷方式。

<!--more-->

## 核心概念

### 1. 提示（Prompt）结构
- **用户消息**：用户直接输入的内容
- **系统消息**：系统生成的指令，用于指导对话
- **占位符**：运行时基于用户输入进行替换的变量
- **提示选项**：如 AI 模型名称、温度设置等

### 2. 消息类型
- **UserMessage**：用户输入的消息
- **SystemMessage**：系统级别的指令
- **AssistantMessage**：AI 助手的回复

## 创建 ChatClient

### 1. 使用自动配置的 ChatClient.Builder

```java
@RestController
class MyController {

    private final ChatClient chatClient;

    public MyController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @GetMapping("/ai")
    String generation(String userInput) {
        return this.chatClient.prompt()
            .user(userInput)
            .call()
            .content();
    }
}
```

### 2. 多模型配置

#### 禁用默认自动配置
```properties
# 禁用默认的 ChatClient.Builder 自动配置
spring.ai.chat.client.enabled=false
```

#### 单一模型类型的多个 ChatClient
```java
// 程序化创建 ChatClient 实例
ChatModel myChatModel = ... // 已由 Spring Boot 自动配置
ChatClient chatClient = ChatClient.create(myChatModel);

// 或使用 Builder 获得更多控制
ChatClient.Builder builder = ChatClient.builder(myChatModel);
ChatClient customChatClient = builder
    .defaultSystemPrompt("You are a helpful assistant.")
    .build();
```

#### 不同模型类型的 ChatClients
```java
@Configuration
public class ChatClientConfig {

    @Bean
    public ChatClient openAiChatClient(OpenAiChatModel chatModel) {
        return ChatClient.create(chatModel);
    }

    @Bean
    public ChatClient anthropicChatClient(AnthropicChatModel chatModel) {
        return ChatClient.create(chatModel);
    }
}
```

#### 使用 @Qualifier 注入特定模型
```java
@Configuration
public class ChatClientExample {

    @Bean
    CommandLineRunner cli(
            @Qualifier("openAiChatClient") ChatClient openAiChatClient,
            @Qualifier("anthropicChatClient") ChatClient anthropicChatClient) {

        return args -> {
            var scanner = new Scanner(System.in);
            ChatClient chat;

            // 模型选择
            System.out.println("\nSelect your AI model:");
            System.out.println("1. OpenAI");
            System.out.println("2. Anthropic");
            System.out.print("Enter your choice (1 or 2): ");

            String choice = scanner.nextLine().trim();

            if (choice.equals("1")) {
                chat = openAiChatClient;
                System.out.println("Using OpenAI model");
            } else {
                chat = anthropicChatClient;
                System.out.println("Using Anthropic model");
            }

            // 使用选定的模型
            String response = chat.prompt()
                .user("Tell me a joke")
                .call()
                .content();
            
            System.out.println("Response: " + response);
        };
    }
}
```

## 基础使用

### 1. 简单聊天示例

```java
@RestController
@RequestMapping("/api/chat")
public class ChatController {
    
    private final ChatClient chatClient;
    
    public ChatController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }
    
    @PostMapping("/simple")
    public String simpleChat(@RequestBody String message) {
        return chatClient.prompt(message).call().content();
    }
}
```

### 2. 使用用户和系统消息

```java
@PostMapping("/advanced")
public String advancedChat(@RequestBody ChatRequest request) {
    return chatClient.prompt()
        .system("你是一个专业的编程助手，请用简洁明了的方式回答问题。")
        .user(request.getMessage())
        .call()
        .content();
}
```

## 高级功能

### 1. 提示模板与占位符

```java
@PostMapping("/template")
public String templateChat(@RequestBody TemplateRequest request) {
    return chatClient.prompt()
        .user(u -> u
            .text("请为 {language} 语言编写一个 {function} 函数，要求：{requirements}")
            .param("language", request.getLanguage())
            .param("function", request.getFunction())
            .param("requirements", request.getRequirements())
        )
        .call()
        .content();
}
```

### 2. 流式处理

```java
@PostMapping(value = "/stream", produces = MediaType.TEXT_PLAIN_VALUE)
public ResponseEntity<StreamingResponseBody> streamChat(@RequestBody String message) {
    return ResponseEntity.ok()
        .contentType(MediaType.TEXT_PLAIN)
        .body(outputStream -> {
            chatClient.prompt()
                .user(message)
                .stream()
                .content()
                .forEach(content -> {
                    try {
                        outputStream.write(content.getBytes());
                        outputStream.flush();
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
        });
}
```

### 3. 结构化输出

```java
// 定义输出结构
public class CodeResponse {
    private String language;
    private String code;
    private String explanation;
    
    // getters and setters
}

@PostMapping("/structured")
public CodeResponse structuredChat(@RequestBody String request) {
    return chatClient.prompt()
        .user("请为以下需求生成代码：" + request)
        .call()
        .entity(CodeResponse.class);
}
```

### 4. 多轮对话

```java
@Service
public class ConversationService {
    
    private final ChatClient chatClient;
    private final List<ChatMessage> conversationHistory = new ArrayList<>();
    
    public ConversationService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }
    
    public String continueConversation(String userMessage) {
        // 添加用户消息到历史
        conversationHistory.add(new UserMessage(userMessage));
        
        // 构建包含历史的提示
        String response = chatClient.prompt()
            .system("你是一个友好的助手，请基于对话历史回答问题。")
            .messages(conversationHistory)
            .call()
            .content();
        
        // 添加助手回复到历史
        conversationHistory.add(new AssistantMessage(response));
        
        return response;
    }
}
```

## Advisors API

Advisors API 提供了一种灵活而强大的方式来拦截、修改和增强 Spring 应用程序中的 AI 驱动交互。

### 1. Advisor 配置接口

```java
interface AdvisorSpec {
    AdvisorSpec param(String k, Object v);
    AdvisorSpec params(Map<String, Object> p);
    AdvisorSpec advisors(Advisor... advisors);
    AdvisorSpec advisors(List<Advisor> advisors);
}
```

### 2. 使用 Advisors

```java
ChatClient.builder(chatModel)
    .build()
    .prompt()
    .advisors(
        MessageChatMemoryAdvisor.builder(chatMemory).build(),
        QuestionAnswerAdvisor.builder(vectorStore).build()
    )
    .user(userText)
    .call()
    .content();
```

### 3. 日志 Advisor

```java
ChatResponse response = ChatClient.create(chatModel).prompt()
        .advisors(new SimpleLoggerAdvisor())
        .user("Tell me a joke?")
        .call()
        .chatResponse();
```

**启用日志**：
```properties
logging.level.org.springframework.ai.chat.client.advisor=DEBUG
```

**自定义日志格式**：
```java
SimpleLoggerAdvisor customLogger = new SimpleLoggerAdvisor(
    request -> "Custom request: " + request.prompt().getUserMessage(),
    response -> "Custom response: " + response.getResult(),
    0
);
```

## Chat Memory

### 1. MessageWindowChatMemory

```java
@Configuration
public class ChatMemoryConfig {
    
    @Bean
    public ChatMemory chatMemory() {
        return new MessageWindowChatMemory(20); // 最多保留 20 条消息
    }
}
```

### 2. 使用 Chat Memory

```java
@Service
public class ConversationService {
    
    private final ChatClient chatClient;
    private final ChatMemory chatMemory;
    
    public ConversationService(ChatClient.Builder builder, ChatMemory chatMemory) {
        this.chatClient = builder.build();
        this.chatMemory = chatMemory;
    }
    
    public String continueConversation(String userMessage) {
        // 添加用户消息到记忆
        chatMemory.add(new UserMessage(userMessage));
        
        // 使用记忆进行对话
        String response = chatClient.prompt()
            .advisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
            .user(userMessage)
            .call()
            .content();
        
        // 添加助手回复到记忆
        chatMemory.add(new AssistantMessage(response));
        
        return response;
    }
}
```

## 错误处理

### 1. 基础错误处理

```java
@PostMapping("/safe-chat")
public ResponseEntity<String> safeChat(@RequestBody String message) {
    try {
        String response = chatClient.prompt(message).call().content();
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        log.error("AI 服务调用失败", e);
        return ResponseEntity.status(500)
            .body("AI 服务暂时不可用，请稍后重试");
    }
}
```

### 2. 重试机制

```java
@Service
public class ResilientChatService {
    
    private final ChatClient chatClient;
    private final RetryTemplate retryTemplate;
    
    public ResilientChatService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
        this.retryTemplate = RetryTemplate.builder()
            .maxAttempts(3)
            .exponentialBackoff(1000, 2, 10000)
            .retryOn(Exception.class)
            .build();
    }
    
    public String chatWithRetry(String message) {
        return retryTemplate.execute(context -> {
            return chatClient.prompt(message).call().content();
        });
    }
}
```

## 实际应用示例

### 1. 智能客服系统

```java
@RestController
@RequestMapping("/api/support")
public class SupportController {
    
    private final ChatClient chatClient;
    
    @PostMapping("/chat")
    public SupportResponse handleSupportRequest(@RequestBody SupportRequest request) {
        String response = chatClient.prompt()
            .system("你是一个专业的客服助手，请根据用户问题提供帮助。")
            .user("用户问题：" + request.getQuestion() + 
                  "\n用户类型：" + request.getUserType() + 
                  "\n问题分类：" + request.getCategory())
            .call()
            .content();
        
        return new SupportResponse(response, "ai", System.currentTimeMillis());
    }
}
```

### 2. 代码生成助手

```java
@Service
public class CodeGenerationService {
    
    private final ChatClient chatClient;
    
    public CodeSuggestion generateCode(String requirement, String language) {
        String prompt = String.format(
            "请为以下需求生成 %s 代码：\n%s\n\n要求：\n1. 代码要简洁高效\n2. 添加必要的注释\n3. 遵循最佳实践",
            language, requirement
        );
        
        String code = chatClient.prompt()
            .system("你是一个专业的编程助手，擅长生成高质量的代码。")
            .user(prompt)
            .call()
            .content();
        
        return new CodeSuggestion(code, language, requirement);
    }
}
```

### 3. 检索增强生成（RAG）

```java
@Service
public class RAGService {
    
    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    
    public String answerQuestion(String question) {
        return chatClient.prompt()
            .advisors(QuestionAnswerAdvisor.builder(vectorStore).build())
            .user(question)
            .call()
            .content();
    }
}
```

## 配置选项

### application.yml 配置

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        options:
          model: gpt-4
          temperature: 0.7
          max-tokens: 2000
          top-p: 0.9
          frequency-penalty: 0.0
          presence-penalty: 0.0
          stop: ["Human:", "AI:"]
    chat:
      client:
        enabled: true  # 启用 ChatClient 自动配置
```

### application.properties 配置

```properties
# OpenAI 配置
spring.ai.openai.api-key=${OPENAI_API_KEY:your-api-key-here}
spring.ai.openai.chat.options.model=gpt-4
spring.ai.openai.chat.options.temperature=0.7
spring.ai.openai.chat.options.max-tokens=2000

# ChatClient 配置
spring.ai.chat.client.enabled=true
```

## 实现注意事项

### 1. 命令式和响应式编程模型
- **HTTP 客户端配置**：RestClient 和 WebClient 都必须配置
- **流式处理**：仅通过响应式堆栈支持
- **非流式处理**：仅通过 Servlet 堆栈支持
- **工具调用**：是命令式的，导致阻塞工作流

### 2. 重要配置
```properties
# 由于 Spring Boot 3.4 的 bug，必须设置此属性
spring.http.client.factory=jdk
```

### 3. 性能优化

#### 异步处理
```java
@Service
public class AsyncChatService {
    
    private final ChatClient chatClient;
    private final AsyncTaskExecutor taskExecutor;
    
    public CompletableFuture<String> asyncChat(String message) {
        return CompletableFuture.supplyAsync(() -> {
            return chatClient.prompt(message).call().content();
        }, taskExecutor);
    }
}
```

#### 缓存机制
```java
@Service
public class CachedChatService {
    
    private final ChatClient chatClient;
    private final CacheManager cacheManager;
    
    @Cacheable(value = "chat-responses", key = "#message")
    public String cachedChat(String message) {
        return chatClient.prompt(message).call().content();
    }
}
```

## 总结

Spring AI 的 ChatClient API 提供了强大而灵活的接口来与 AI 模型交互。通过其流畅的 API 设计，开发者可以轻松实现：

- 简单的聊天功能
- 复杂的多轮对话
- 流式响应处理
- 结构化输出
- 多模型支持
- 检索增强生成（RAG）
- 对话记忆管理
- 自定义 Advisor 链
- 错误处理和重试机制

这使得 ChatClient 成为构建现代 AI 驱动应用程序的理想选择。
