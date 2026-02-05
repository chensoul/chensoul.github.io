---
title: "Spring AI RAG 与向量存储"
date: "2026-02-01"
slug: spring-ai-rag-vector-store
categories: ["ai"]
tags: ['spring-ai', 'rag', 'redis']
---

Spring 官方文档在《[Retrieval Augmented Generation](https://docs.spring.io/spring-ai/reference/api/retrieval-augmented-generation.html)》中，把 RAG 拆成三步：**摄取（Ingestion）→ 检索（Retrieval）→ 生成（Generation）**。本文是这套流程的完整落地版本：用 Markdown 文档喂入 Redis 向量库，依靠 `QuestionAnswerAdvisor` 在每次提问前检索上下文，再交给本地部署的 Ollama 生成答案。本文重新梳理模块结构、关键实现与运行方式，方便你快速对齐代码与文档。

<!--more-->

> **示例代码库**  
> 
> 您可以在 [GitHub 仓库](https://github.com/chensoul/spring-ai-samples/tree/main/08-rag-vector-store) 中找到本文的示例代码。


## 架构一览

```
┌──────────────┐     ┌────────────┐     ┌─────────────┐     ┌────────────────────┐
│ Markdown 文档 │ --> │ 文档读取/切分│ --> │Embedding API│ --> │ Redis VectorStore  │
└──────────────┘     └────────────┘     └─────────────┘     └────────────────────┘
                                                           ↑
                                  ChatClient + QuestionAnswerAdvisor ←───────────┘
```

- **摄取**：`AiConfig` 在应用启动时读取 `src/main/resources/data/*.md`，切分片段并写入 VectorStore。
- **检索**：`QuestionAnswerAdvisor` 基于用户问题生成查询向量，调用 `vectorStore.similaritySearch()` 取回最相关的 Document。
- **生成**：检索结果作为上下文拼接进 Prompt，Ollama 结合 `MessageChatMemoryAdvisor` 输出有记忆的回答。

模块结构要点：

- **AiConfig**：文档摄取与切分，写入 VectorStore。
- **ChatController**：面向最终问答的 RAG 入口。
- **EmbeddingSearchController**：向量检索、重排序、查询增强与评估接口集合。

## 文档摄取：Markdown + 分片

`AiConfig` 是摄取链路的核心实现。这里先介绍 SimpleVectorStore 的手动方式，再回到本项目实际使用的自动装配方式。

### 方式一：SimpleVectorStore（手动 Bean）

如果只做最小化验证，可以先显式创建 `SimpleVectorStore`：

```java
@Bean
VectorStore vectorStore(EmbeddingModel embeddingModel) {
    return SimpleVectorStore.builder(embeddingModel).build();
}
```

这样做的好处是路径清晰、依赖少，适合本地验证检索流程；缺点是无法利用 Redis 之类的持久化向量库能力。

### 方式二：自动装配 VectorStore（本项目使用）

本模块引入 `spring-ai-starter-vector-store-redis`，由 Spring Boot 自动注入 `VectorStore`。`AiConfig` 只负责把文档切分并写入：

```java
@Configuration
public class AiConfig {
    @Value("classpath:/data/about.md")
    private Resource aboutFile;

    @Value("classpath:/data/career.md")
    private Resource careerLessonsFile;

    @Bean
    ApplicationRunner applicationRunner(VectorStore vectorStore) {
        return args -> {
            loadDocument(vectorStore, aboutFile);
            loadDocument(vectorStore, careerLessonsFile);
        };
    }

    private void loadDocument(VectorStore vectorStore, Resource resource) {
        DocumentReader reader = new MarkdownDocumentReader(
                resource, MarkdownDocumentReaderConfig.defaultConfig());
        List<Document> docs = reader.get();
        TextSplitter splitter = new TokenTextSplitter();
        vectorStore.accept(splitter.apply(docs));
    }
}
```

- **MarkdownDocumentReader**：省去自己解析粗体/列表等格式的麻烦，直接输出结构化 `Document`。
- **TokenTextSplitter**：按 token 总量控制片段大小，防止一次查询把整篇文章塞给模型。
- **VectorStore.accept**：会调 Embedder（下节）为每个 chunk 生成向量并写入 Redis。

示例数据来自两个文档：

- `about.md`：开发者履历、技术栈。
- `career.md`：15 年职业生涯心得，列出 30+ 条经验。

这种方式与 Spring 文档中的 “company knowledge base” 一致：由应用负责摄取，不需要预先离线嵌入。

## 嵌入模型：本地 Ollama

本模块使用本地 Ollama，同时提供聊天与嵌入模型配置：

```properties
spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.options.model=qwen3:8b
spring.ai.ollama.embedding.options.model=nomic-embed-text:v1.5
```

本地启动前需要拉取对应模型，使用 Ollama 不需要配置 API Key：

```bash
ollama pull qwen3:8b
ollama pull nomic-embed-text:v1.5
```

如果你希望使用阿里的大模型作为可选方案，可以替换为通义千问等模型的接入方式并调整配置项，但本模块默认使用 Ollama。

application-qwen.properties 示例（通义千问 DashScope OpenAI 兼容接口），包含聊天与嵌入配置:

```properties
## 通义千问（阿里云 DashScope OpenAI 兼容）##
## 获取 API Key: https://dashscope.console.aliyun.com/
spring.ai.openai.base-url=https://dashscope.aliyuncs.com/compatible-mode/v1
spring.ai.openai.api-key=${DASHSCOPE_API_KEY}

spring.ai.openai.chat.completions-path=/chat/completions
spring.ai.openai.chat.options.model=qwen-turbo
spring.ai.openai.chat.options.temperature=0.6

spring.ai.openai.embedding.options.model=text-embedding-v2
```

此外，`EmbeddingSearchController` 提供 `/api/embedding` 与 `/api/embedding/similarity`，便于观察向量结果与相似度计算。

## Redis VectorStore 与 QuestionAnswerAdvisor

Spring 文档推荐在生成阶段加入 `QuestionAnswerAdvisor`——它会自动：

1. 从当前 `Prompt` 中提取问题；
2. 查询 VectorStore（本例使用 `spring-ai-starter-vector-store-redis`）；
3. 把检索到的 Document 作为上下文插入最终 Prompt。

`ChatController` 构造函数正是这么配置的：

```java
this.chatClient = builder
        .defaultAdvisors(
                MessageChatMemoryAdvisor.builder(chatMemory).build(),
                QuestionAnswerAdvisor.builder(vectorStore).build(),
                new SimpleLoggerAdvisor()
        )
        .build();
```

因此前端只需调用 `/api/chat`，Advisor 就会在幕后完成：

- 多轮记忆（`ChatMemory.CONVERSATION_ID` 来自 Cookie `X-CONV-ID`）；
- 基于向量检索的上下文增强；
- 最终把 Markdown 回复交给 `MarkdownHelper` 生成 HTML。

如果你想验证检索结果，可以使用 `/api/search` 或更细粒度的检索接口：

```bash
curl "http://localhost:8080/api/search?query=微服务"
```

这些接口会直接返回 Redis 中最相近的原文片段，便于调试分词、嵌入与重排序效果。

## RetrievalAugmentationAdvisor 说明

如果你希望把 RAG 流程拆成可组合的管线，`RetrievalAugmentationAdvisor` 是更灵活的选择。它把流程拆为多个可插拔阶段：查询变换、查询扩展、检索、后处理、文档合并与查询增强。本模块的 `ChatController` 中使用它构建了不同级别的 RAG 体验：

- `/api/chat-rag`：最小链路，只做向量检索后直接拼接上下文。
- `/api/chat-advanced`：在检索后加入 `DocumentPostProcessor` 进行重排序。
- `/api/chat-rag-modular`：完整管线，包含查询改写/压缩/翻译、查询扩展、检索、后处理、文档合并与上下文增强。

这种方式适合逐步加复杂度：从最小可用的检索开始，逐步叠加 Query Transformer、Document Joiner、PostProcessor 等组件，方便验证每一步对质量的影响。

## 检索与评估接口说明

为便于验证检索流程，`EmbeddingSearchController` 提供了多组接口：

- **向量与相似度**：`/api/embedding`、`/api/embedding/similarity`。
- **基础检索**：`/api/search`，支持阈值、分页、来源过滤与高亮。
- **元数据过滤**：`/api/search/filter`，支持 source/sources、idPrefix 与任意 metadata 键值。
- **多路检索**：`/api/search/multi`，按来源拆分后再合并。
- **两阶段检索**：`/api/search/two-stage`，查询扩展 → 检索 → 合并 → 重排序。
- **重排序**：`/api/search/rerank`、`/api/search/rerank/explain`，返回融合分数与 BM25 组成项。
- **上下文增强**：`/api/augment/context`，基于检索结果增强 query。
- **查询变换**：`/api/query/translate`、`/api/query/rewrite`、`/api/query/compress`、`/api/query/expand`。

这些接口大部分直接返回原文片段与分数，便于观察排序变化与过滤效果。

## 运行步骤

1. **启动 Redis**  
   模块目录已提供 Compose 文件：
   ```bash
   cd 08-rag-vector-store
   docker compose up -d    # redis/redis-stack:7.2.0-v18
   ```
   Spring Boot 会自动发现 `org.springframework.boot.service-connection=redis` 标签并注入连接信息。

2. **运行应用**  
   ```bash
   ../mvnw spring-boot:run
   ```

3. **体验 RAG**  
   - 打开 `http://localhost:8080/` 。
   - 问：“请总结一下作者的职业经历？” 可以看到回答里引用了 `about.md` 的具体条目。
   - 再问：“他在职业生涯中学到的最重要的教训是什么？” 模型会引用 `career.md` 的编号列表继续回答。

4. **可选 API**  
   - `/api/embedding`、`/api/embedding/similarity`：观察向量与相似度。
   - `/api/search`、`/api/search/filter`、`/api/search/multi`：基础检索与过滤。
   - `/api/search/two-stage`、`/api/search/rerank`：扩展检索与重排序。
   - `/api/search/rerank/explain`：BM25 解释与分数分解。
   - `/api/augment/context`：上下文增强 query。
   - `/api/query/translate`、`/api/query/rewrite`、`/api/query/compress`、`/api/query/expand`：查询变换链路。

## 小结

- **摄取（Ingestion）**：`DocumentReader + TextSplitter + VectorStore.accept` 自动将外部知识转成向量。
- **检索（Retrieval）**：Redis VectorStore + `QuestionAnswerAdvisor` 完成语义检索，并开放多种检索示例接口方便验证。
- **生成（Generation）**：检索上下文注入 Prompt，`MessageChatMemoryAdvisor` 维持会话上下文，最终由 Ollama 输出答案。
- **可扩展性**：换模型、换存储都很容易——只需调整 Spring AI 的 starter 与配置即可。

如果你正在跟着 Spring 官方指南实现自己的 RAG Demo，这个模块提供了最小但完整的端到端范例。搬回你的项目，再换成真实文档，就能快速搭建企业知识库问答机器人。

