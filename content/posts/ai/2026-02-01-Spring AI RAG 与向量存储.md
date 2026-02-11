---
title: "Spring AI RAG 与向量存储"
date: "2026-02-01"
slug: spring-ai-rag-vector-store
categories: ["ai"]
tags: ['spring-ai', 'rag', 'redis']
---

本文将教你如何创建一个使用 RAG（检索增强生成）和向量存储以及 Spring AI 的 Spring Boot 应用程序。

<!--more-->

## 源代码

如果您想自己尝试，可以查看我的源代码。为此，您必须克隆我的示例   [GitHub 仓库](https://github.com/chensoul/spring-ai-chat-rag-samples)。然后，您只需按照我的说明操作即可。

## 使用 Spring AI 实现 RAG 的动机

由于 OpenAI 模型是在静态数据集上训练的，因此它无法直接访问在线服务或 API。我们可以将这些数据存储在本地数据库中，并将其集成到示例 Spring Boot AI 应用程序中。我们将使用向量存储而不是典型的关系型数据库。在向量数据库中，查询的工作方式与传统关系型数据库不同。它不是查找完全匹配项，而是执行相似性搜索。它会检索与给定输入向量最相似的向量。

将所有必需数据加载到向量数据库后，我们需要将其与 AI 模型集成。Spring AI 基于`Advisors`API 提供了一个便捷的集成机制。在之前的示例中，我们已经使用了一些内置的智能助手，例如打印详细的 AI 通信日志或启用聊天记录记忆。这次，它们将帮助我们为应用程序实现检索增强生成 (RAG) 技术。借助这项技术，Spring Boot 应用程序会在向 AI 模型发送请求之前，检索与用户查询最匹配的相似文档。这些文档为查询提供上下文，并与用户的问题一起发送给 AI 模型。

## 使用 Spring AI 的 Vector Store

### 配置 Redis 向量数据库

在本节中，我们将准备一个向量存储，将其与我们的 Spring Boot 应用程序集成，并加载一些数据。Spring AI 支持多种向量数据库。它提供了一个`VectorStore`接口，允许我们的 Spring Boot 应用程序直接与向量存储进行交互。完整的受支持数据库列表可以在 Spring AI 文档中找到（链接[在此）](https://docs.spring.io/spring-ai/reference/1.0/api/vectordbs.html)。

本文使用 Redis 向量数据库进行测试，您可以使用`docker-compose.yaml`仓库根目录中的文件，通过`docker compose up`命令运行该数据库。

```yaml
services:
  redis:
    image: 'redis/redis-stack:7.2.0-v18'
    labels:
      - "org.springframework.boot.service-connection=redis"
    ports:
      - '6379:6379'
```

### 使用 Spring AI 将 Spring Boot 应用与 Redis 集成

我们的 Spring Boot 应用程序必须包含`spring-ai-starter-vector-store-redis`必要的依赖项，才能与 Redis 向量存储顺利集成。

```xml
<dependency>
  <groupId>org.springframework.ai</groupId>
  <artifactId>spring-ai-starter-vector-store-redis</artifactId>
</dependency>
```

然后，我们可以在 Spring Boot 文件中提供 Redis 数据库的连接设置和凭据`application.properties`。Redis 数据库的连接设置使用的都是默认配置，故可以不用在配置文件中设置，Spring Boot 会读取默认配置进行自动装配。

```properties
spring.ai.vectorstore.redis.initialize-schema=true
```

完成所有必要的配置设置后，我们就可以`VectorStore`在应用程序的 REST 控制器中注入并使用该 bean。

```java
@RestController
@RequestMapping("/api/chat")
class ChatController {
    private final VectorStore vectorStore;
		//....
}
```

### 加载文档到 VectorStore

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

`AiConfig` 只负责把文档切分并写入：

```java
@Configuration
public class AiConfig {
    private static final Logger log = LoggerFactory.getLogger(AiConfig.class);

    @Value("classpath:/data/about.md")
    private Resource aboutFile;

    @Value("classpath:/data/career.pdf")
    private Resource careerLessonsFile;

    @Bean
    ApplicationRunner applicationRunner(VectorStore vectorStore) {
        return args -> {
            loadDocument(vectorStore, aboutFile);
            loadDocument(vectorStore, careerLessonsFile);
        };
    }

    private void loadDocument(VectorStore vectorStore, Resource resource) {
        log.info("Loading document {} into vector store", resource.getFilename());

        DocumentReader documentReader = null;
        if (resource.getFilename().endsWith(".md")) {
            documentReader = new MarkdownDocumentReader(resource, MarkdownDocumentReaderConfig.defaultConfig());
        } else if (resource.getFilename().endsWith(".pdf")) {
            documentReader = new PagePdfDocumentReader(resource);
        }

        List<Document> documents = documentReader.get();
        TextSplitter textSplitter = new TokenTextSplitter();
        List<Document> splitDocuments = textSplitter.apply(documents);
        String src = FilenameUtils.getBaseName(resource.getFilename());
        List<Document> enriched = java.util.stream.IntStream.range(0, splitDocuments.size())
                .mapToObj(i -> {
                    Document d = splitDocuments.get(i);
                    Map<String, Object> meta = new HashMap<>();
                    if (d.getMetadata() != null) {
                        meta.putAll(d.getMetadata());
                    }
                    meta.put("source", src);
                    meta.put("id", src + "-" + i);
                    return new Document(d.getText(), meta);
                })
                .collect(Collectors.toList());
        vectorStore.accept(enriched);
        log.info("Document {} loaded into vector store", resource.getFilename());
    }
}
```

- **MarkdownDocumentReader**：读取 Markdown 文件。
- **PagePdfDocumentReader**：读取 PDF 文件。
- **TokenTextSplitter**：按 token 总量控制片段大小，防止一次查询把整篇文章塞给模型。
- **VectorStore.accept**：会调 Embedder（下节）为每个 chunk 生成向量并写入 Redis。

## 使用 Spring AI 实现 RAG

### 使用 QuestionAnswerAdvisor

要执行 RAG，我们必须 向  `QuestionAnswerAdvisor` bean提供一个 vectorStore 实例 。

```java
		this.chatClient = builderProvider.getObject()
        .defaultAdvisors(
                MessageChatMemoryAdvisor.builder(chatMemory).build(),
                QuestionAnswerAdvisor.builder(vectorStore).build(),
                new SimpleLoggerAdvisor()
        )
        .build();
```

ChatController 构造器注入 `ObjectProvider<ChatClient.Builder>`、ChatMemory、VectorStore

> **注意：**
>
> 在同一个 Bean 中创建多个 `ChatClient` 时，必须注入 `ObjectProvider<ChatClient.Builder>` 并通过 `getObject()` 获取独立的 `Builder` 实例，否则会导致 `Advisor` 污染和循环引用（`StackOverflowError`）

因此前端只需调用 `/api/chat`，Advisor 就会在幕后完成：

- 多轮记忆（`ChatMemory.CONVERSATION_ID` 来自 Cookie `X-CONV-ID`）；
- 基于向量检索的上下文增强；
- 最终把 Markdown 回复交给 `MarkdownHelper` 生成 HTML。

如果你想验证检索结果，可以使用 `/api/rag/search` 或更细粒度的检索接口：

```bash
curl "http://localhost:8080/api/rag/search?query=Microservices"
```

这些接口会直接返回 Redis 中最相近的原文片段，便于调试分词、嵌入与重排序效果。

### 使用 RetrievalAugmentationAdvisor

除了`QuestionAnswerAdvisor`类之外，我们还可以使用实验性的组件`RetrievalAugmentationAdvisor`。它基于模块化架构，为最常见的 RAG 流程提供了开箱即用的实现。`RetrievalAugmentationAdvisor` 把流程拆为多个可插拔阶段：查询变换、查询扩展、检索、后处理、文档合并与查询增强。本模块的 `ChatController` 中使用它构建了不同用途的 ChatClient。

`ragChatClient` 的 `RetrievalAugmentationAdvisor` 配置了默认配的 `VectorStoreDocumentRetriever`

```java
this.ragChatClient = builderProvider.getObject()
    .defaultAdvisors(
            MessageChatMemoryAdvisor.builder(chatMemory).build(),
            RetrievalAugmentationAdvisor.builder()
                 .documentRetriever(
                   	VectorStoreDocumentRetriever.builder().vectorStore(vectorStore).build()
                 ).build(),
            new SimpleLoggerAdvisor()
    )
    .build();
```

`advancedRagChatClient` 的 `RetrievalAugmentationAdvisor` 配置了自定义参数的 `VectorStoreDocumentRetriever`，并且配置了一个文档后缀处理器进行重排序。

```java
DocumentPostProcessor keywordReranker = keywordReranker();

this.advancedRagChatClient = builderProvider.getObject()
      .defaultAdvisors(
              MessageChatMemoryAdvisor.builder(chatMemory).build(),
              RetrievalAugmentationAdvisor.builder()
                      .documentRetriever(VectorStoreDocumentRetriever.builder()
                              .vectorStore(vectorStore)
                              .topK(20)
                              .similarityThreshold(0.5)
                              .build())
                      .documentPostProcessors(java.util.List.of(keywordReranker))
                      .build(),
              new SimpleLoggerAdvisor()
      )
      .build();
```

`modularRagChatClient` 的 `RetrievalAugmentationAdvisor` 配置查询改写/压缩/翻译、查询扩展、检索、后处理、文档合并与上下文增强。

```java
this.modularRagChatClient = builderProvider.getObject()
  .defaultAdvisors(
          MessageChatMemoryAdvisor.builder(chatMemory).build(),
          RetrievalAugmentationAdvisor.builder()
                  .queryTransformers(java.util.List.of(
                          RewriteQueryTransformer.builder().chatClientBuilder(builder).build(),
                          CompressionQueryTransformer.builder().chatClientBuilder(builder).build(),               											TranslationQueryTransformer.builder()
                    					.chatClientBuilder(builder).targetLanguage("english").build()
                  ))
               	.queryExpander(MultiQueryExpander.builder()
                               .chatClientBuilder(builder).numberOfQueries(3).build())
                  .documentRetriever(VectorStoreDocumentRetriever.builder()
                          .vectorStore(vectorStore)
                          .similarityThreshold(0.4)
                          .topK(10)
                          .build())
                  .documentPostProcessors(java.util.List.of(
                          bm25Reranker(8),
                          truncateDoc(600)
                  ))
                  .documentJoiner(new ConcatenationDocumentJoiner())
                  .queryAugmenter(ContextualQueryAugmenter.builder().allowEmptyContext(true).build())
                  .build(),
          new SimpleLoggerAdvisor()
  )
  .build();
```

为便于验证检索流程，`RagController` 提供了多组接口：

- **向量与相似度**：`/api/rag/embedding`、`/api/rag/embedding/similarity`。
- **基础检索**：`/api/rag/search`，支持阈值、分页、来源过滤与高亮。
- **元数据过滤**：`/api/rag/search/filter`，支持 source/sources、idPrefix 与任意 metadata 键值。
- **多路检索**：`/api/rag/search/multi`，按来源拆分后再合并。
- **两阶段检索**：`/api/rag/search/two-stage`，查询扩展 → 检索 → 合并 → 重排序。
- **重排序**：`/api/rag/search/rerank`、`/api/rag/search/rerank/explain`，返回融合分数与 BM25 组成项。
- **上下文增强**：`/api/rag/augment/context`，基于检索结果增强 query。
- **查询变换**：`/api/rag/query/translate`、`/api/rag/query/rewrite`、`/api/rag/query/compress`、`/api/rag/query/expand`。

这些接口大部分直接返回原文片段与分数，便于观察排序变化与过滤效果。

## 运行及测试

1. **启动 Redis**  
   在仓库根目录启动 Redis 服务：

   ```bash
   docker compose up
   ```

2. **运行应用**

   ```bash
   mvn spring-boot:run
   ```
   
3. **体验 RAG**

    - 打开 `http://localhost:8080/` 。
    - 问：“Summarize the author’s career experience.” 可以看到回答里引用了 `about.md` 的具体条目。
    - 再问：“What is the most important lesson from the career notes?” 模型会引用 `career.md` 的编号列表继续回答。

4. 测试脚本


```bash
## 聊天 + 向量搜索
curl -s -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Summarize the author’s career experience."}'
  
# 生成文本向量
curl -s "http://localhost:8080/api/rag/embedding?message=vector%20test"

# 计算文本相似度
curl -s "http://localhost:8080/api/rag/embedding/similarity?text1=vector&text2=embedding"

# 基础向量检索
curl -s "http://localhost:8080/api/rag/search?query=career"

# 启用高亮的向量检索
curl -s "http://localhost:8080/api/rag/search?query=career&highlight=true"

# 按单一来源过滤
curl -s "http://localhost:8080/api/rag/search/filter?query=career&source=about"

# 多来源与 ID 前缀过滤
curl -s "http://localhost:8080/api/rag/search/filter?query=career&sources=about,career&idPrefix=about-"

# 多路检索合并
curl -s "http://localhost:8080/api/rag/search/multi?query=career"

# 两阶段检索与重排序
curl -s "http://localhost:8080/api/rag/search/two-stage?query=career"

# 融合重排序
curl -s "http://localhost:8080/api/rag/search/rerank?query=career"

# 重排序解释
curl -s "http://localhost:8080/api/rag/search/rerank/explain?query=career"

# 上下文增强
curl -s "http://localhost:8080/api/rag/augment/context?query=career"

# 查询翻译
curl -s "http://localhost:8080/api/rag/query/translate?query=Summarize%20the%20career%20notes&target=english"

# 查询改写
curl -s "http://localhost:8080/api/rag/query/rewrite?query=career%20notes"

# 查询压缩
curl -s "http://localhost:8080/api/rag/query/compress?query=career%20notes&history=We%20just%20discussed%20the%20author%27s%20background"

# 查询扩展
curl -s "http://localhost:8080/api/rag/query/expand?query=career%20notes&n=3"
```

## 小结

本文介绍了如何使用 Spring AI 实现一项名为检索增强生成的重要 AI 技术。Spring AI 通过内置向量存储支持和 `Advisor `API 提供的便捷数据集成，简化了 RAG 的使用。
