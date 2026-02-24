---
title: "使用Docker Model Runner和Spring AI运行AI模型"
description: "学习如何使用Docker Model Runner和Spring AI构建本地AI应用，实现RAG功能、向量搜索和模型本地化部署。包含完整代码示例和最佳实践。"
date: 2025-10-09
slug: docker-model-runner-spring-ai-local-ai-application
categories: ["ai"]
tags: ['spring-ai', 'docker-model-runner', 'rag', 'pgvector', 'gemma']
---

你是否担心将敏感数据发送到云端AI服务？是否希望完全掌控AI模型的使用，而不受API限制和费用困扰？今天我们来探索一个全新的解决方案——**使用Docker Model Runner和Spring AI在本地环境中运行AI模型**。

<!--more-->

通过**Docker Model Runner**和**Spring AI框架**的结合，我们可以构建一个既安全又高效的**本地AI应用平台**。这种方式不仅保护了数据隐私，还让我们能够深入了解**AI模型的工作原理**，实现真正的**企业级AI应用开发**。

> **核心价值**: 本文详细介绍如何使用Docker Model Runner部署本地AI模型，结合Spring AI框架实现RAG（检索增强生成）功能，构建完整的向量搜索和AI聊天系统。

## 📦 项目源码

完整的项目源码已上传到GitHub仓库，包含所有配置文件和示例代码：**GitHub仓库** [https://github.com/chensoul/docker-ai-app](https://github.com/chensoul/docker-ai-app)

## 🤔 为什么选择Docker Model Runner？

Docker Model Runner是Docker官方推出的AI模型管理工具，相比传统的本地AI方案有以下优势：

1. **⚡ 零配置** - 无需复杂的容器管理，直接集成到Docker Desktop
2. **🔌 OpenAI兼容** - 使用标准的OpenAI API格式，易于集成
3. **💾 资源优化** - 模型按需加载，自动管理内存使用
4. **🔒 安全可靠** - 数据完全在本地处理，不会离开你的设备
5. **💰 成本可控** - 一次部署，长期使用，无需按调用次数付费

## 🏗️ 技术架构

我们的**本地AI应用解决方案**基于以下技术栈：

- **🐳 Docker Model Runner**: 运行AI模型，提供OpenAI兼容API
- **🌱 Spring AI 1.1.0**: 提供统一的AI应用开发框架
- **🐘 PostgreSQL 16 + pgvector 0.8.1**: 存储向量数据，支持RAG功能
- **🤖 ai/gemma3**: 文本生成模型（基于Gemma架构）
- **🔍 ai/embeddinggemma**: 768维向量嵌入模型（基于Gemma架构）
- **🌐 REST API**: 提供标准化的接口服务
- **📊 HNSW索引**: 高效的向量相似性搜索算法

### 核心技术特点

- **本地化部署**: 所有AI模型在本地Docker容器中运行
- **向量数据库**: 使用pgvector扩展实现高效向量存储和搜索
- **RAG架构**: 检索增强生成，提升AI回答准确性
- **微服务架构**: 基于Spring Boot的模块化设计

### 架构设计原理

本方案采用 **RAG（检索增强生成）** 架构，结合了以下核心技术：

1. **向量化存储**: 使用pgvector扩展在PostgreSQL中存储文档的向量表示
2. **语义搜索**: 通过HNSW索引实现高效的向量相似性搜索
3. **上下文增强**: 检索相关文档作为上下文，提升AI回答的准确性
4. **模型本地化**: 使用Docker Model Runner在本地运行AI模型，确保数据安全

## 🛠️ 环境准备

### 系统要求

在开始之前，请确保你的系统满足以下要求：

- **🐳 Docker Desktop**: 4.40+ (macOS) 或 4.41+ (Windows)
- **☕ Java**: JDK 17
- **📦 Maven**: 3.9+
- **💾 内存**: 至少16GB（推荐32GB）

> 💡 **提示**: 内存要求较高是因为AI模型需要大量内存来运行。如果内存不足，可以考虑使用更小的模型。

### 启用Docker Model Runner

按照以下步骤启用Docker Model Runner：

1. **打开Docker Desktop**
2. **进入设置** → Settings → AI
3. **启用功能** → 勾选 "Docker Model Runner"
4. **启用TCP支持** → 勾选 "Enable host-side TCP support" (默认端口12434)
5. **应用设置** → 点击 "Apply & Restart" 重启Docker Desktop

> ⚠️ **注意**: 重启后需要等待Docker Desktop完全启动才能继续下一步。

## 💻 Spring AI应用开发

### 1. 项目初始化

使用Spring Initializr创建项目，添加以下依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-openai</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-vector-store-pgvector</artifactId>
</dependency>
```

### 2. 应用配置

在`application.yml`中配置Docker Model Runner：

> 📝 **配置说明**: 以下配置包含了聊天模型、嵌入模型、向量存储和数据库连接等关键设置。特别注意`distance-type: EUCLIDEAN_DISTANCE`配置，这是解决Spring AI 1.1.0与pgvector 0.8.1兼容性的关键。

```yaml
# Spring AI + Docker Model Runner 配置
# 本地AI应用开发配置示例
spring:
  application:
    name: docker-ai-app
  
  # PostgreSQL + pgvector 数据库配置
  datasource:
    url: jdbc:postgresql://localhost:5432/ai_app
    username: ai_user
    password: ai_password
    driver-class-name: org.postgresql.Driver
  
  # Spring AI 配置 - 本地AI模型集成
  ai:
    openai:
      api-key: "_"  # 占位符，Docker Model Runner不需要真实API密钥
      chat:
        base-url: http://localhost:12434/engines/llama.cpp
        options:
          model: ai/gemma3  # Gemma3 文本生成模型
          temperature: 0.7
          top-p: 0.9
          max-tokens: 2048
      embedding:
        base-url: http://localhost:12434/engines/llama.cpp
        options:
          model: ai/embeddinggemma  # Gemma 嵌入模型
          dimensions: 768
    http:
      client:
        connection-timeout: 30s
        read-timeout: 60s
    # pgvector 向量存储配置
    vectorstore:
      pgvector:
        index-type: HNSW  # 高效向量搜索索引
        distance-type: EUCLIDEAN_DISTANCE  # 欧几里得距离计算
        dimensions: 768  # 匹配 ai/embeddinggemma 的维度
        initialize-schema: true
        remove-existing-vector-store-table: false

# 日志配置 - AI应用调试
logging:
  level:
    org.springframework.ai: INFO
    cc.chensoul.ai: DEBUG
  file:
    name: logs/ai-app.log
```

### 3. 核心服务实现

创建AI聊天服务，实现RAG（检索增强生成）功能：

> 💡 **核心功能**: 这个服务类集成了向量搜索和AI聊天，实现了RAG（检索增强生成）模式。通过向量相似性搜索检索相关文档，将其作为上下文提供给AI模型，从而生成更准确、更有依据的回答。

```java
@Service
public class AIChatService {
    
    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    
    public AIChatService(ChatClient.Builder chatClientBuilder, 
                        VectorStore vectorStore) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
    }
    
    public String chat(String userMessage) {
        // 构建上下文
        String context = buildContext(userMessage);
        
        // 发送到AI模型
        return chatClient.prompt()
                .user(context + "\n\n用户问题: " + userMessage)
                .call()
                .content();
    }
    
    private String buildContext(String message) {
        // 从向量数据库检索相关文档
        List<Document> docs = vectorStore.similaritySearch(
            SearchRequest.builder().query(message).topK(3).build()
        );
        
        return docs.stream()
                .map(Document::getFormattedContent)
                .collect(Collectors.joining("\n"));
    }
    
    public void addDocument(String content) {
        // 将文档添加到向量数据库
        Document document = new Document(content);
        vectorStore.add(List.of(document));
    }
    
    public Flux<String> streamChat(String message) {
        // 构建上下文
        String context = buildContext(message);
        
        // 发送到AI模型并返回流式响应
        return chatClient.prompt()
                .user(context + "\n\n用户问题: " + message)
                .stream()
                .content();
    }
}
```

### 4. REST API控制器

创建REST API接口，提供聊天、流式响应和文档管理功能：

> 🌐 **API设计**: 提供标准的REST接口，支持JSON格式的请求和响应，以及Server-Sent Events流式输出。

```java
@RestController
@RequestMapping("/api/chat")
public class ChatController {
    
    @Autowired
    private AIChatService chatService;
    
    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        try {
            String response = chatService.chat(request.getMessage());
            return ResponseEntity.ok(new ChatResponse(response));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ChatResponse("AI服务暂时不可用: " + e.getMessage()));
        }
    }
    
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamChat(@RequestParam String message) {
        try {
            return chatService.streamChat(message)
                    .map(content -> ServerSentEvent.builder(content).build())
                    .onErrorResume(throwable -> {
                        return Flux.just(ServerSentEvent.builder("AI服务暂时不可用: " + throwable.getMessage()).build());
                    });
        } catch (Exception e) {
            return Flux.just(ServerSentEvent.builder("AI服务暂时不可用: " + e.getMessage()).build());
        }
    }
    
    @PostMapping("/document")
    public ResponseEntity<DocumentResponse> addDocument(@RequestBody DocumentRequest request) {
        try {
            chatService.addDocument(request.getContent());
            return ResponseEntity.ok(new DocumentResponse("文档添加成功"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new DocumentResponse("文档添加失败: " + e.getMessage()));
        }
    }
}
```

## 🚀 部署与运行

### 🐳 Docker配置

创建 `docker-compose.yml` 文件配置PostgreSQL数据库：

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=ai_app
      - POSTGRES_USER=ai_user
      - POSTGRES_PASSWORD=ai_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 一键启动所有服务

```bash
# 启动所有服务（PostgreSQL + Docker Model Runner + AI模型）
./start.sh
```

## 🧪 测试验证

完成开发后，让我们测试各个功能模块：

### 💬 基础聊天功能

测试基本的AI聊天功能：

```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "请用中文介绍一下Spring AI框架"}'
```

### 🌊 流式响应

测试实时流式输出功能：

```bash
# 注意：URL中的中文字符需要进行编码
curl -X GET "http://localhost:8080/api/chat/stream?message=Hello%20AI"
```

### 📚 文档管理

测试RAG功能，包括文档添加和基于文档的聊天：

```bash
# 添加文档
curl -X POST http://localhost:8080/api/chat/document \
  -H "Content-Type: application/json" \
  -d '{"content": "Spring AI提供了统一的API来访问各种AI模型"}'

# 基于文档的聊天
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "请根据上下文介绍Spring AI"}'
```

### 健康检查

```bash
# 检查应用健康状态
curl http://localhost:8080/actuator/health

# 检查AI服务状态
curl http://localhost:8080/actuator/health/ai
```

## 📁 项目结构

完整的项目目录结构如下：

```
docker-ai-app/
├── src/main/java/cc/chensoul/ai/
│   ├── Application.java              # 主应用类
│   ├── AIChatService.java           # AI聊天服务
│   ├── ChatController.java          # REST控制器
│   └── dto/                         # 数据传输对象
│       ├── ChatRequest.java
│       ├── ChatResponse.java
│       ├── DocumentRequest.java
│       └── DocumentResponse.java
├── src/main/resources/
│   └── application.yml              # 应用配置
├── start.sh                         # 一键启动脚本（包含所有服务）
├── test.sh                          # 测试脚本
├── docker-compose.yml               # PostgreSQL服务配置
├── Dockerfile                       # 应用容器化配置（JDK 17）
└── pom.xml                          # Maven配置（JDK 17）
```

## ⚡ 高级功能

### 对话记忆管理

为多轮对话添加上下文记忆：

```java
@Component
public class ConversationMemory {
    
    private final Map<String, List<Message>> conversations = new ConcurrentHashMap<>();
    
    public void addMessage(String sessionId, Message message) {
        conversations.computeIfAbsent(sessionId, k -> new ArrayList<>())
                    .add(message);
    }
    
    public List<Message> getHistory(String sessionId) {
        return conversations.getOrDefault(sessionId, Collections.emptyList());
    }
}
```

## 🔧 故障排除

### 常见问题

1. **Docker Model Runner不可用**
   ```bash
   # 创建符号链接
   ln -s /Applications/Docker.app/Contents/Resources/cli-plugins/docker-model ~/.docker/cli-plugins/docker-model
   ```

2. **pgvector SQL语法错误**
   ```
   PreparedStatementCallback; bad SQL grammar [SELECT *, embedding <=> ? AS distance FROM public.vector_store WHERE embedding <=> ? < ? ORDER BY distance LIMIT ? ]
   ```
   **解决方案**: 使用 `EUCLIDEAN_DISTANCE` 替代 `COSINE_DISTANCE`
   ```yaml
   spring:
     ai:
       vectorstore:
         pgvector:
           distance-type: EUCLIDEAN_DISTANCE
   ```

3. **内存不足**
   - 增加Docker内存限制
   - 使用更小的模型

4. **连接失败**
   - 检查Docker Desktop是否运行
   - 确认端口12434是否可用

### 性能优化建议

1. **向量搜索优化**
   - 使用HNSW索引提升搜索性能
   - 合理设置向量维度匹配模型输出
   - 定期维护索引以保持最佳性能

2. **模型参数调优**
   - **temperature**: 控制回答的创造性（0.1-1.0）
   - **top-p**: 控制词汇选择的多样性（0.1-1.0）
   - **max-tokens**: 限制响应长度，控制成本
   - **top-k**: 限制候选词汇数量，提升一致性

3. **数据库连接池优化**
   - **maximum-pool-size**: 设置最大连接数（建议10-20）
   - **minimum-idle**: 保持最小空闲连接（建议5-10）
   - **connection-timeout**: 连接超时时间（建议30秒）
   - **idle-timeout**: 空闲连接超时时间（建议10分钟）

### 安全性和最佳实践

1. **数据安全**
   - 所有数据在本地处理，不会发送到外部服务
   - 使用PostgreSQL的行级安全策略保护敏感数据
   - 定期备份向量数据库

2. **模型安全**
   - 使用官方认证的模型镜像
   - 定期更新模型版本
   - 监控模型推理性能

3. **网络安全**
   - 限制API访问权限
   - 使用HTTPS加密传输
   - 实施请求频率限制

4. **运维最佳实践**
   - 监控系统资源使用情况
   - 设置日志轮转和清理策略
   - 建立灾难恢复计划

## ❓ 常见问题解答

### Q: Docker Model Runner与传统的AI模型部署有什么区别？

**A**: Docker Model Runner是Docker官方推出的AI模型管理工具，相比传统方案有以下优势：
- **零配置部署**: 无需复杂的容器编排
- **OpenAI兼容**: 使用标准API格式，易于集成
- **资源优化**: 自动管理内存和GPU资源
- **安全可靠**: 数据完全在本地处理

### Q: Spring AI框架适合哪些应用场景？

**A**: Spring AI特别适合以下场景：
- **企业级AI应用**: 需要与现有Spring生态系统集成
- **RAG系统开发**: 检索增强生成应用
- **多模型支持**: 需要支持多种AI模型和向量存储
- **微服务架构**: 基于Spring Boot的模块化设计

### Q: pgvector与Elasticsearch向量搜索有什么区别？

**A**: 主要区别如下：
- **pgvector**: 基于PostgreSQL，ACID事务支持，SQL查询能力
- **Elasticsearch**: 全文搜索能力强，分布式架构，实时分析
- **选择建议**: 如果已有PostgreSQL基础设施，pgvector更简单；如果需要复杂搜索，Elasticsearch更强大

### Q: 如何优化AI应用的性能？

**A**: 性能优化建议：
1. **模型选择**: 根据需求选择合适的模型大小
2. **向量索引**: 使用HNSW索引提升搜索速度
3. **缓存策略**: 实现结果缓存减少重复计算
4. **资源监控**: 监控CPU、内存和GPU使用情况

## 🎉 总结

通过Docker Model Runner和Spring AI构建本地AI应用，我们实现了：

### 技术成果

1. **完整的RAG系统**: 实现了文档向量化、语义搜索和上下文增强的完整流程
2. **本地化部署**: 所有AI模型和数据都在本地运行，确保数据安全
3. **生产级架构**: 使用Spring Boot、PostgreSQL和Docker构建的企业级应用
4. **可扩展设计**: 支持多种AI模型和向量存储后端

### 技术价值

- **🔒 完全的数据控制** - 敏感数据始终在本地处理，保护隐私安全
- **💰 成本效益** - 一次部署，长期使用，无API费用
- **⚙️ 高度可定制** - 可以根据需求调整模型和配置
- **📚 学习价值** - 深入理解AI技术的工作原理
- **⚡ 零配置** - 无需API密钥或复杂设置

---

## 📚 相关资源

### 官方文档
- [Docker Model Runner官方文档](https://docs.docker.com/ai/model-runner/)
- [Spring AI官方文档](https://docs.spring.io/spring-ai/reference/)
- [Docker官方文档](https://docs.docker.com/)
- [PostgreSQL pgvector扩展](https://github.com/pgvector/pgvector)

### 模型资源
- [Hugging Face模型库](https://huggingface.co/models)
- [Gemma模型介绍](https://huggingface.co/google/gemma-7b)
- [OpenAI API文档](https://platform.openai.com/docs)

### 社区资源
- [Spring AI GitHub仓库](https://github.com/spring-projects/spring-ai)
- [Docker AI社区](https://forums.docker.com/c/ai/)
- [PostgreSQL中文社区](https://www.postgresql.org/about/newsarchive/)