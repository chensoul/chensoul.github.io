---
title: "【译】EP61：Slack 消息的旅程"
date: 2026-04-01 06:36:00+08:00
draft: true
slug: "ep61-the-journey-of-a-slack-message"
categories: [ "translation" ]
tags: [ "slack", "messaging", "graphql" ]
description: "这篇文章介绍了 Slack 消息传递架构、GraphQL 在 LinkedIn 的实际应用，以及不同云服务的对比。"
canonicalURL: "https://blog.bytebytego.com/p/ep61-the-journey-of-a-slack-message"
---

> 本文为学习目的的个人翻译，译文及后文「译者总结」仅供参考。
>
> 原文链接：[EP61: The journey of a Slack message](https://blog.bytebytego.com/p/ep61-the-journey-of-a-slack-message)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。

在这篇文章中，我们将讨论以下话题：
- Amazon Prime Video 放弃 AWS 无服务器
- Slack 消息的旅程
- GraphQL 在现实世界如何工作
- 不同云服务

## Slack 消息传递架构

在最近的技术文章中，Slack 解释了其实时消息框架如何工作。这是我的简短总结：

### 架构组件

- **Channel Server (CS)**：因为有太多频道，使用一致性哈希将数百万频道分配到许多频道服务器
- **消息传递**：Slack 消息通过 WebApp 和 Admin Server 传递到正确的 Channel Server
- **推送消息**：通过 Gate Server 和 Envoy（代理），Channel Server 将消息推送给消息接收者
- **WebSocket**：消息接收者使用 WebSocket，这是一种双向消息机制，因此能够实时接收更新

### Slack 消息经过的五个重要服务器

1. **WebApp**：定义 Slack 客户端可以使用的 API
2. **Admin Server (AS)**：使用频道 ID 找到正确的 Channel Server
3. **Channel Server (CS)**：维护消息频道的历史
4. **Gateway Server (GS)**：部署在每个地理区域。维护 WebSocket 频道订阅
5. **Envoy**：云原生应用的服务代理

**问题**：Channel Servers 可能宕机。由于他们使用一致性哈希，他们可能如何恢复？

## GraphQL 在 LinkedIn 的实际应用

下图显示了 LinkedIn 如何采用 GraphQL。

### 采用 GraphQL 后的整体工作流有 3 部分

**第 1 部分 - 编辑和测试查询**
- 步骤 1-2：客户端开发人员开发查询并与后端服务测试

**第 2 部分 - 注册查询**
- 步骤 3-4：客户端开发人员提交查询并将查询发布到查询注册表

**第 3 部分 - 在生产中使用**
- 步骤 5：查询与客户端代码一起发布
- 步骤 6-7：路由元数据包含在每个注册的查询中。元数据用于流量路由层将传入请求路由到正确的服务集群
- 步骤 8：注册的查询在服务运行时缓存
- 步骤 9：示例查询首先去身份服务检索成员，然后去组织服务检索公司信息

### LinkedIn 不部署 GraphQL 网关的两个原因

1. 防止额外的网络跳转
2. 避免单点故障

**问题**：你的项目中如何管理 GraphQL 查询？

## 不同云服务对比

下图比较了不同云服务提供商的核心服务。

## 译者总结

这篇文章涵盖了消息系统和 GraphQL 话题：

**Slack 消息五服务器架构**：
| 服务器 | 职责 |
|--------|------|
| WebApp | 定义客户端 API |
| Admin Server | 频道路由 |
| Channel Server | 维护频道历史 |
| Gateway Server | WebSocket 订阅 |
| Envoy | 服务代理 |

**关键技术**：
- 一致性哈希：分配数百万频道
- WebSocket：双向实时通信
- 区域部署：全球可用性

**LinkedIn GraphQL 工作流**：
1. 编辑测试查询
2. 注册查询到注册表
3. 生产使用（带路由元数据）

**为什么不用 GraphQL 网关**：
- 防止额外网络跳转
- 避免单点故障

**设计洞察**：
- 一致性哈希需要处理节点故障恢复
- GraphQL 可以直接路由到服务
- 缓存注册查询提高性能

理解这些实时消息和 GraphQL 架构对设计大规模系统至关重要。
