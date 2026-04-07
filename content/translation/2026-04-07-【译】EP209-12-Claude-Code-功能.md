---
title: "【译】EP209: 每个工程师都应知道的 12 个 Claude Code 功能"
date: 2026-04-07 11:53:00+08:00
draft: true
slug: "ep209-12-claude-code-features-every"
categories: [ "translation" ]
tags: [ "Claude Code", "AI", "developer-tools" ]
description: "ByteByteGo EP209 介绍了 Claude Code 的 12 个核心功能，以及 Agentic RAG、REST API 和负载均衡器的关键概念。"
canonicalURL: "https://blog.bytebytego.com/p/ep209-12-claude-code-features-every"
---

> 本文为学习目的的个人翻译，译文及后文「译者总结」仅供参考。
>
> 原文链接：[EP209: 12 Claude Code Features Every Engineer Should Know](https://blog.bytebytego.com/p/ep209-12-claude-code-features-every)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。

<!--more-->

本周的系统设计复习：

- 12 个 Claude Code 功能，每个工程师都应该知道
- Agentic RAG 如何工作？
- REST API 如何工作？
- 7 个关键负载均衡器用例
- 我们关于行为面试的新书已在亚马逊上架！

## 12 个 Claude Code 功能，每个工程师都应该知道

![12 个 Claude Code 功能](01.webp)

- **CLAUDE.md**：项目记忆文件，用于定义自定义规则和约定。Claude 在每次会话开始时读取。
- **Permissions（权限）**：控制 Claude 可以/不可以使用的工具。
- **Plan Mode（计划模式）**：Claude 在行动之前先计划。你可以在任何代码更改之前审查它们。
- **Checkpoints（检查点）**：项目的自动快照，如果出现问题可以回滚。
- **Skills（技能）**：可复用的指令文件，Claude 自动遵循。
- **Hooks（钩子）**：在生命周期事件（如 PreToolUse 或 PostToolUse）上运行自定义 Shell 脚本。
- **MCP**：将 Claude 连接到任何外部工具，如数据库和第三方服务。
- **Plugins（插件）**：使用包含技能、MCP 和钩子的第三方集成扩展 Claude。
- **Context（上下文）**：为 Claude 提供所需内容，并使用 `/context` 管理当前上下文窗口。
- **Slash Commands（斜杠命令）**：为你经常运行的任务创建快捷方式。输入 `/` 并从保存的命令中选择。
- **Compaction（压缩）**：压缩长对话以节省 tokens。
- **Subagents（子代理）**：为复杂任务生成并行代理。拆分大型多步骤工作流并同时运行它们。

轮到你：你最常使用哪个 Claude Code 功能？你希望列表上有哪些功能？

## Agentic RAG 如何工作？

![Agentic RAG 如何工作](02.webp)

传统的 RAG 具有简单的检索、有限的适应性，并依赖于静态知识，使其对动态和实时信息不太灵活。

Agentic RAG 通过引入可以做出决策、选择工具甚至优化查询以获得更准确和灵活响应的 AI 代理来改进这一点。以下是 Agentic RAG 在高层面上的工作原理：

- 用户查询被定向到 AI 代理进行处理。
- 代理使用短期和长期记忆来跟踪查询上下文。它还制定检索策略并为工作选择合适的工具。
- 数据获取过程可以使用矢量搜索、多个代理和 MCP 服务器等工具从知识库中收集相关数据。
- 然后代理将检索到的数据与查询和系统提示相结合。它将此数据传递给 LLM。
- LLM 处理优化的输入以回答用户的查询。

## REST API 如何工作？

![REST API 如何工作](03.webp)

它的原则、方法、约束和最佳实践是什么？我希望下面的图表能给你一个快速概述。

![REST API 架构图](04.webp)

## 7 个关键负载均衡器用例

![7 个关键负载均衡器用例](05.webp)

- **Traffic Distribution（流量分发）**：负载均衡器帮助在多个服务器实例之间均匀分发流量。
- **SSL Termination（SSL 终止）**：负载均衡器可以卸载后端服务器的 SSL 终止责任，从而减少它们的工作负载。
- **Session Persistence（会话持久性）**：负载均衡器确保来自用户的所有请求都命中同一个实例，以保持会话持久性。
- **High Availability（高可用性）**：通过将流量从故障或不健康的服务器重新路由到健康的服务器来提高系统的可用性。
- **Scalability（可扩展性）**：当添加额外实例到服务器池以处理增加的流量时，负载均衡器促进水平扩展。
- **DDoS Mitigation（DDoS 缓解）**：负载均衡器可以通过速率限制请求或将它们分发到更广泛的表面来帮助减轻 DDoS 攻击的影响。
- **Health Monitoring（健康监控）**：负载均衡器还监控服务器实例的健康状况和性能，并从池中移除故障或不健康的服务器。

轮到你：你会在列表中添加哪些其他负载均衡器用例？

## 我们关于行为面试的新书已在亚马逊上架！

![行为面试新书](06.webp)

这本书由 [Steve Huynh](https://www.linkedin.com/in/a-life-engineered/) 撰写，由 ByteByteGo 出版。Steve 是亚马逊前首席工程师。他将复杂的面试动态分解为清晰、可操作建议的能力使这本书成为可能。尽管如此，我们花了两年时间才准备好。

内容包括：

- 130+ 面试问题，从最常见的问题到让候选人措手不及的问题
- 72 个示例故事，展示从入门级到首席工程师的强力答案是什么样的
- 清晰指导面试官寻找什么，包括关键信号和危险信号
- High-Signal Storytelling，一个为任何行为面试构建故事库的框架
- 实用的准备计划和面试当天的技巧，用于跟进和意外问题

[在亚马逊上订购你的副本](https://geni.us/Yiwg6)

## 译者总结

### 一句话核心
ByteByteGo 第 209 期介绍了 Claude Code 的 12 个核心功能，以及 Agentic RAG、REST API、负载均衡器和行为面试新书的内容。

### 要点回顾
- **12 个 Claude Code 功能**：CLAUDE.md、权限、计划模式、检查点、技能、钩子、MCP、插件、上下文、斜杠命令、压缩、子代理
- **Agentic RAG**：引入 AI 代理进行决策、工具选择和查询优化
- **负载均衡器 7 用例**：流量分发、SSL 终止、会话持久性、高可用性、可扩展性、DDoS 缓解、健康监控

### 边界与易误读
- 这是 ByteByteGo 新闻通讯摘要，非深度教程
- 部分内容（如 REST API、负载均衡器）仅有图示，无详细文字说明

### 术语与延伸
- **CLAUDE.md**：Anthropic 推出的项目级配置文件，类似 `.gitignore`
- **MCP**：Model Context Protocol，用于连接外部工具的标准协议
- **Agentic RAG**：结合 AI 代理的检索增强生成，支持动态决策和工具调用
