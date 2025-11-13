---
title: "使用 Spring AI 构建狗狗领养助手系统：RAG、工具调用与对话记忆实战"
date: "2025-11-13T16:05:46+08:00"
slug: spring-ai-dog-adoption-showcase
description: "实战教程：使用 Spring AI 构建智能狗狗领养助手系统。学习 RAG 检索增强生成、MCP 工具调用、对话记忆管理等核心技术。包含完整的微服务架构、pgvector 向量数据库集成和 Spring Boot 3 配置示例。"
keywords: ["Spring AI", "RAG检索增强生成", "MCP协议", "对话记忆", "pgvector向量数据库", "Spring Boot AI", "微服务架构", "工具调用", "向量检索", "AI助手开发"]
categories: ["ai"]
tags: ['spring-ai', 'rag', 'mcp', 'pgvector', 'spring-boot',  'chat-memory', 'tool-calling']
---

随着大语言模型（LLM）技术的快速发展，如何将 AI 能力无缝集成到企业应用中成为了开发者关注的焦点。Spring AI 作为 Spring 生态系统中新兴的 AI 框架，为 Java 开发者提供了构建 AI 应用的完整解决方案。

本文将深入探讨如何使用 Spring AI 构建一个完整的智能对话助手系统，涵盖 RAG（检索增强生成）、工具调用、对话记忆等核心功能。通过一个实际的狗狗领养助手项目，我们将学习如何将这些技术应用到真实场景中。

## 源代码
如果您想亲自尝试，可以随时查看我的源代码。为此，您必须克隆我的示例 [GitHub 仓库](https://github.com/chensoul/spring-ai-dog-adoption-showcase)。然后，您只需按照我的说明进行操作即可。

## 什么是 Spring AI？

Spring AI 是 Spring 官方推出的 AI 应用开发框架，它提供了：

- **统一的 AI 模型抽象**：支持 OpenAI、Azure OpenAI、通义千问等多种模型
- **RAG 支持**：内置向量存储和检索增强生成能力
- **工具调用**：支持 Function Calling 和 MCP 协议
- **对话管理**：提供对话记忆和上下文管理
- **Spring 集成**：与 Spring Boot 无缝集成，遵循 Spring 的设计理念

## 项目概述

我们构建的是一个名为 "Pooch Palace" 的狗狗领养助手系统，该系统包含两个微服务：

1. **Assistant（助手服务）**：AI 驱动的对话助手，帮助用户查询和领养狗狗
2. **Scheduler（调度服务）**：独立的 MCP 服务器，提供预约调度功能

### 核心功能

- 🤖 **智能问答**：基于 RAG 的语义搜索，准确匹配用户需求
- 💬 **对话记忆**：多用户、多会话的上下文管理
- 🔧 **工具调用**：AI 自动调用远程服务完成预约操作
- 🔍 **向量检索**：使用 pgvector 实现高效的语义搜索

## 技术栈

### 后端框架

- **Spring Boot 3.5.7**：现代化的 Java 应用框架
- **Spring AI 1.1.0**：AI 应用开发框架
- **Java 25**：最新的 Java 版本（支持虚拟线程）

### 数据库

- **PostgreSQL 16**：关系型数据库
- **pgvector**：PostgreSQL 的向量扩展，用于存储和检索高维向量

### AI 模型

- **通义千问**：阿里云的大语言模型（兼容 OpenAI API）
  - Chat 模型：`qwen-plus`
  - Embedding 模型：`text-embedding-v3`

### 通信协议

- **MCP（Model Context Protocol）**：用于微服务间的工具调用

## 核心功能实现

### 1. RAG（检索增强生成）实现

RAG 是当前最流行的 AI 应用模式之一，它通过向量检索来增强 LLM 的生成能力，使其能够基于特定知识库回答问题。

#### 数据向量化

首先，我们需要将狗狗信息转换为向量并存储：

```java
@Controller
class AssistantController {
    
    AssistantController(DogRepository repository, VectorStore vectorStore) {
        // 启动时将狗狗信息向量化
        repository.findAll().forEach(dog -> {
            var dogument = new Document(
                "id: %s, name: %s, description: %s"
                    .formatted(dog.id(), dog.name(), dog.description())
            );
            vectorStore.add(List.of(dogument));
        });
    }
}
```

#### 向量存储配置

使用 pgvector 存储向量数据：

```properties
# 向量存储配置
spring.ai.vectorstore.pgvector.dimensions=1024
spring.ai.vectorstore.pgvector.initialize-schema=true

# Embedding 模型配置
spring.ai.openai.embedding.options.model=text-embedding-v3
spring.ai.model.embedding=openai
```

#### RAG 查询流程

当用户提问时，系统会：

1. **向量化用户问题**：使用 embedding 模型将问题转换为向量
2. **语义检索**：在向量数据库中查找最相关的文档
3. **增强生成**：将检索到的文档作为上下文，让 LLM 生成回答

```java
@Bean
QuestionAnswerAdvisor questionAnswerAdvisor(VectorStore vectorStore) {
    return new QuestionAnswerAdvisor(vectorStore);
}
```

### 2. 对话记忆实现

对话记忆让 AI 助手能够记住之前的对话内容，实现多轮对话。

#### 配置对话记忆

```java
@Bean
PromptChatMemoryAdvisor promptChatMemoryAdvisor(DataSource dataSource) {
    var jdbc = JdbcChatMemoryRepository
        .builder()
        .dataSource(dataSource)
        .build();
    var mwa = MessageWindowChatMemory
        .builder()
        .chatMemoryRepository(jdbc)
        .build();
    return PromptChatMemoryAdvisor.builder(mwa).build();
}
```

#### 按用户隔离对话

```java
@GetMapping("/{user}/ask")
String ask(@PathVariable String user, @RequestParam String question) {
    return this.ai
        .prompt(question)
        .advisors(p -> p.param(ChatMemory.CONVERSATION_ID, user))
        .call()
        .content();
}
```

每个用户都有独立的对话历史，通过 `CONVERSATION_ID` 进行隔离。

### 3. MCP 工具调用实现

MCP（Model Context Protocol）允许 AI 应用调用外部服务提供的工具。

#### 定义 MCP 工具

在 `scheduler` 服务中定义工具：

```java
@Service
class DogAdoptionScheduler {
    
    @Tool(description = "schedule an appointment to pick up or adopt a dog")
    String schedule(
        @ToolParam(description = "the id of the dog") int dogId,
        @ToolParam(description = "the name of the dog") String dogName
    ) {
        var appointmentTime = Instant
            .now()
            .plus(3, ChronoUnit.DAYS)
            .toString();
        return appointmentTime;
    }
}
```

#### 连接 MCP 服务器

在 `assistant` 服务中连接 MCP 服务器：

```java
@Bean
McpSyncClient schedulerMcp() {
    var mcp = McpClient
        .sync(HttpClientSseClientTransport.builder("http://localhost:8081/").build())
        .build();
    mcp.initialize();
    return mcp;
}
```

#### 注册工具回调

```java
this.ai = ai
    .defaultAdvisors(promptChatMemoryAdvisor, questionAnswerAdvisor)
    .defaultToolCallbacks(new SyncMcpToolCallbackProvider(schedulerMcp))
    .defaultSystem(system)
    .build();
```

当用户说"我想预约领养 Buddy"时，AI 会自动识别并调用 `schedule` 工具。

## 完整的数据流

### 启动流程

```text
1. Assistant 启动
   ├─ 初始化数据库表（dog）
   ├─ 插入示例数据（5条狗狗记录）
   ├─ 将狗狗信息向量化并存入 pgvector
   ├─ 连接 Scheduler MCP 服务器（http://localhost:8081）
   └─ 配置 ChatClient（Advisors + Tools）

2. Scheduler 启动
   ├─ 启动 MCP 服务器（端口 8081）
   └─ 暴露 schedule 工具
```

### 用户请求流程

```text
用户请求: GET /alice/ask?question="我想领养一只金毛"

1. AssistantController 接收请求
   ├─ 提取用户ID: "alice"
   └─ 提取问题: "我想领养一只金毛"

2. ChatClient 处理
   ├─ QuestionAnswerAdvisor: 从向量库检索相关狗狗信息
   │  └─ 找到: Buddy (Golden Retriever, San Francisco)
   │
   ├─ PromptChatMemoryAdvisor: 加载用户 "alice" 的对话历史
   │
   └─ AI 生成回复: "我找到一只金毛寻回犬 Buddy，位于旧金山..."

3. 如果用户说"我想预约领养 Buddy"
   ├─ AI 识别需要调用 schedule 工具
   ├─ SyncMcpToolCallbackProvider 转发请求
   ├─ MCP Client → HTTP → Scheduler 服务
   ├─ Scheduler.schedule(1, "Buddy") 执行
   ├─ 返回: "2025-11-16T10:00:00Z" (3天后)
   └─ AI 整合结果: "已为您预约在 2025-11-16 领养 Buddy"
```

## 快速开始

### 1. 环境准备

- JDK 25（或 Java 17+）
- Maven 3.6+
- PostgreSQL 16+（带 pgvector 扩展）
- Docker（可选）

### 2. 启动数据库

```bash
cd assistant
docker-compose up -d
```

### 3. 配置 API Key

```bash
export OPENAI_API_KEY=your-dashscope-api-key
```

### 4. 启动服务

```bash
# 启动 Scheduler 服务
cd scheduler
./mvnw spring-boot:run

# 启动 Assistant 服务
cd assistant
./mvnw spring-boot:run
```

### 5. 测试 API

```bash
# 查询可领养的狗狗
curl "http://localhost:8080/alice/ask?question=我想领养一只金毛"

# 预约领养
curl "http://localhost:8080/alice/ask?question=我想预约领养Buddy"
```

## 配置详解

### Assistant 应用配置

```properties
# AI 模型配置（通义千问）
spring.ai.openai.base-url=https://dashscope.aliyuncs.com/compatible-mode
spring.ai.openai.api-key=${OPENAI_API_KEY:your-dashscope-api-key}
spring.ai.openai.chat.options.model=qwen-plus
spring.ai.openai.chat.enabled=true

# Embedding 模型配置
spring.ai.openai.embedding.options.model=text-embedding-v3
spring.ai.model.embedding=openai

# 向量存储配置
spring.ai.vectorstore.pgvector.dimensions=1024
spring.ai.vectorstore.pgvector.initialize-schema=true

# 对话记忆配置
spring.ai.chat.memory.repository.jdbc.initialize-schema=always

# 数据库配置
spring.datasource.url=jdbc:postgresql://localhost/mydatabase
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### 使用其他 AI 模型

Spring AI 支持多种 AI 模型，只需修改配置：

```properties
# OpenAI 官方
spring.ai.openai.base-url=https://api.openai.com/v1
spring.ai.openai.chat.options.model=gpt-4o-mini
spring.ai.openai.embedding.options.model=text-embedding-3-small
spring.ai.vectorstore.pgvector.dimensions=1536

# Azure OpenAI
spring.ai.openai.base-url=https://your-resource.openai.azure.com
spring.ai.openai.api-key=${AZURE_OPENAI_API_KEY}
```

## 最佳实践

### 1. 向量维度选择

不同模型的 embedding 维度不同：

- 通义千问 `text-embedding-v3`：1024
- OpenAI `text-embedding-3-small`：1536
- OpenAI `text-embedding-3-large`：3072

确保 `spring.ai.vectorstore.pgvector.dimensions` 配置与模型匹配。

### 2. 对话记忆管理

- 使用 `CONVERSATION_ID` 隔离不同用户的对话
- 定期清理过期的对话记录
- 考虑使用 Redis 等缓存提升性能

### 3. MCP 工具设计

- 工具描述要清晰明确，帮助 AI 正确理解工具用途
- 参数描述要详细，确保 AI 能正确调用
- 工具应该幂等，避免重复调用产生副作用

### 4. 错误处理

```java
try {
    return this.ai.prompt(question).call().content();
} catch (Exception e) {
    // 记录错误日志
    logger.error("AI 调用失败", e);
    return "抱歉，我遇到了一些问题，请稍后再试。";
}
```

## 性能优化

### 1. 虚拟线程

Java 21+ 支持虚拟线程，可以大幅提升并发性能：

```properties
spring.threads.virtual.enabled=true
```

### 2. 向量检索优化

- 使用索引加速向量检索
- 限制检索结果数量
- 考虑使用缓存减少重复检索

### 3. 批量处理

对于大量数据的向量化，使用批量处理：

```java
List<Document> documents = dogs.stream()
    .map(dog -> new Document(...))
    .toList();
vectorStore.add(documents); // 批量添加
```

## 常见问题

### Q1: 如何更换 AI 模型？

修改 `application.properties` 中的模型配置，并确保 API Key 正确。

### Q2: 向量维度不匹配怎么办？

检查 embedding 模型的输出维度，修改 `spring.ai.vectorstore.pgvector.dimensions` 配置。

### Q3: Scheduler 服务无法连接？

确保：

1. Scheduler 服务已启动（端口 8081）
2. 网络连接正常
3. MCP 客户端配置正确

### Q4: 数据库连接失败？

检查：

1. PostgreSQL 是否运行
2. 数据库名称、用户名、密码是否正确
3. pgvector 扩展是否已安装

## 项目亮点

- ✅ **微服务架构**：Assistant 和 Scheduler 解耦，易于扩展
- ✅ **RAG 增强**：向量检索提升回答准确性
- ✅ **工具集成**：AI 可自动调用外部服务
- ✅ **对话记忆**：多用户、多会话支持
- ✅ **可扩展性**：通过 MCP 协议轻松添加新工具
- ✅ **生产就绪**：包含监控、健康检查等特性

## 总结

通过这个项目，我们学习了如何使用 Spring AI 构建一个完整的智能对话助手系统。主要收获包括：

1. **RAG 实现**：通过向量数据库实现语义检索和增强生成
2. **对话记忆**：实现多用户、多会话的上下文管理
3. **工具调用**：通过 MCP 协议实现微服务间的工具调用
4. **Spring 集成**：充分利用 Spring 生态系统的优势

Spring AI 为 Java 开发者提供了一个强大而灵活的 AI 应用开发框架，让构建 AI 应用变得简单高效。无论是构建客服机器人、知识问答系统，还是智能助手，Spring AI 都能提供完整的解决方案。

## 相关文章

- [Spring AI 介绍](/posts/2025/09/18/spring-ai/) - 了解 Spring AI 框架基础
- [Spring AI ChatClient API 介绍](/posts/2025/09/19/spring-ai-chat-client-api/) - 深入学习 ChatClient API
- [基于 Spring AI 构建智能餐厅推荐系统：RAG 技术实战](/posts/2025/09/26/spring-ai-restaurant-showcase-rag/) - RAG 技术实战案例

## 参考资源

- [项目源码](https://github.com/chensoul/spring-ai-dog-adoption-showcase)
- [Spring AI 官方文档](https://docs.spring.io/spring-ai/reference/)
- [MCP 协议规范](https://modelcontextprotocol.io/)
- [pgvector 文档](https://github.com/pgvector/pgvector)
- [通义千问文档](https://help.aliyun.com/zh/model-studio/)
