---
title: "【译】Kubernetes 速成课程"
date: 2026-04-02 09:50:00+08:00
draft: true
slug: "a-crash-course-in-kubernetes"
categories: [ "translation" ]
tags: [ "kubernetes", "k8s", "orchestration" ]
description: "这篇文章介绍了 Kubernetes 的核心概念、集群组件、何时以及为什么 Kubernetes 对应用有用，以及采用 Kubernetes 前需要考虑的权衡。"
canonicalURL: "https://blog.bytebytego.com/p/a-crash-course-in-kubernetes"
---

> 本文为学习目的的个人翻译，译文及后文「译者总结」仅供参考。
>
> 原文链接：[A Crash Course in Kubernetes](https://blog.bytebytego.com/p/a-crash-course-in-kubernetes)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。

在当今由许多微服务和组件组成的复杂、Web 规模应用后端世界，运行在服务器和容器集群上，管理和协调所有这些部分非常具有挑战性。

这就是 Kubernetes 发挥作用的地方。Kubernetes（也称为"k8s"）是开源容器编排平台，自动化容器化应用的部署、扩展和管理。

使用 Kubernetes，你不必担心手动放置容器或重启失败的容器。你只需描述期望的应用架构，Kubernetes 就会实现它并保持其运行。

在这个两部分系列中，我们将深入探讨 Kubernetes 并涵盖：

- 关键概念如 Pod、控制器和服务
- 构成 Kubernetes 集群的组件
- 何时以及为什么 Kubernetes 对你的应用有用
- 采用 Kubernetes 前要考虑的权衡

我们将揭开 Kubernetes 的神秘面纱，让你拥有判断 Kubernetes 是否以及何时适合你的应用所需的一切知识。结束时，你将清楚了解 Kubernetes 是什么、它如何工作以及如何付诸实践。

无论你是开发者、运维工程师还是技术领导者，你都将在这篇 Kubernetes 深度解析中找到宝贵见解。让我们开始吧！

## Kubernetes 历史

Kubernetes 可以追溯到 Google 的内部容器编排系统 Borg，它管理 Google 内数千应用的部署。容器是一种将应用打包并隔离到标准化单元中的方法，可以轻松在不同环境间移动。与传统虚拟化整个操作系统的虚拟机（VM）不同，容器只虚拟化应用层，使它们更轻量、可移植和高效。

2014 年，Google 基于从 Borg 获得的经验开源了一个容器编排系统。这就是 Kubernetes。Kubernetes 提供容器化应用的自动化部署、扩展和管理。通过利用容器而非虚拟机，Kubernetes 提供好处如提高资源效率、更快应用部署，以及在本地和云环境间的可移植性。

### 为什么也叫 k8s？

这是一种有点极客式的长词缩写方式。k8s 中的数字 8 指的是单词"Kubernetes"中第一个字母"k"和最后一个字母"s"之间的 8 个字母。

## Kubernetes 架构

在其核心，Kubernetes 遵循客户端 - 服务器架构。Kubernetes 集群中有两个核心部分 - **控制平面**和**工作节点**。

### 控制平面

控制平面负责管理集群的状态。在生产环境中，控制平面通常运行在多个节点上，这些节点跨越多个数据中心区域。

换句话说，控制平面管理工作节点及其上运行的容器。

容器化应用运行在 **Pod** 中。Pod 是 Kubernetes 中最小的可部署单元。Pod 托管一个或多个容器，并为这些容器提供共享存储和网络。Pod 由 Kubernetes 控制平面创建和管理。它们是 Kubernetes 应用的基本构建块。

### 控制平面组件

控制平面是 Kubernetes 的大脑。它由各种组件组成，一起对集群做出全局决策。控制平面组件在多个可用区的服务器上运行以提供高可用性。

关键组件包括：

1. **Kubernetes API 服务器**
2. **Etcd**
3. **Kubernetes 调度器**
4. **Kubernetes 控制器管理器**

## 译者总结

这篇文章涵盖了 Kubernetes 的核心概念：

**Kubernetes 定义**：
- 开源容器编排平台
- 自动化部署、扩展和管理容器化应用
- 也称为 k8s（k 和 s 之间有 8 个字母）

**历史**：
- 源自 Google 内部系统 Borg
- 2014 年开源
- 基于容器而非 VM

**架构**：
| 组件 | 职责 |
|------|------|
| 控制平面 | 管理集群状态（大脑） |
| 工作节点 | 运行容器 |
| Pod | 最小可部署单元，托管容器 |

**控制平面 4 大组件**：
1. Kubernetes API 服务器
2. Etcd（键值存储）
3. Kubernetes 调度器
4. Kubernetes 控制器管理器

**关键洞察**：
- Kubernetes 解决微服务管理挑战
- Pod 是最小部署单元
- 控制平面跨可用区运行保证高可用
- 容器比 VM 更轻量、便携、高效

理解这些概念对理解容器编排至关重要。
