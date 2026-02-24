---
title: "周报-3｜博客定制、VPS部署服务"
date: 2023-01-25
slug: weekly_review_3
categories: [learning]
tags: ['weekly-report','vps']
---

## 前言

本篇是对 `2023-01-16` 到 `2023-01-22` 这周生活的记录与思考。首发在我的个人 [博客](https://blog.chensoul.cc/)，你可以移步了解更多或者给我留言。

这是过年前的最后一周，上了三天班，请了两天假回去准备年货、去亲戚家吃年饭。趁放假之前，继续对博客做了一些定制，也在我的 VPS 上通过 Docker 部署了一些服务。

## 定制博客

基于 [pseudoyu](https://www.pseudoyu.com/) 的博客和主题定制博客，发现并修复了 bug，还做了一些改进，并在他的 github 提交 [issue](https://github.com/pseudoyu/pseudoyu/issues/2) 和 merge request。

![](/images/github-issue-build-aboutme-py.webp)

接着在他博客主页留言，几个来回下来，收获不少。一是解决了我提出的问题，二是给我分享了一个搬瓦工的 the plan 优惠码。这时候去看了下我原来的 vps 刚好还有一天要到期，就立即花了 92 美元（原价是 99 美元）购买了一台 2G 内存托管在香港的服务器。

![vps-main-controlls](/images/vps-main-controlls.webp)

缘分就是这么奇妙，如果我不主动和这个博主联系，就不会知道搬瓦工还有这个优惠，就不会帮助我解决了博客定制过程中遇到的疑惑。

> 当你想要什的时候，先给出去，你就会收获更。有舍才有得。

## 博客个人介绍

我的博客源文件托管在 [gihub](https://github.com/chensoul/chensoul.github.io)，在这个仓库可以看到我的一些个人介绍。

## vps 上服务部署

购买了新的 VPS 之后，就将原来的 VPS 导出镜像，然后导入到新的 VPS，最后再安装了以下服务：

- [flowerss-bot](https://github.com/indes/flowerss-bot)：一个支持应用内阅读的 Telegram RSS Bot。
- [n8n](https://n8n.io/)：一款开源的自动工作流服务，类似 IFTTT、Zapier，可以互联互通包括 GitHub、Dropbox、Google、NextCLoud、RSS、Slack、Telegram 在内的几十款在线服务。
- memos：一个开源且免费的自托管知识库
- cusdis：一个界面清爽、注重隐私的轻量级 (~5kb gzip) 评论系统，可以很方便地与 React、Vue 或其他博客系统结合，并且还提供了一个后台来管理所有的评论
- umami：一个简单易用、自托管的开源网站访问流量*统计*分析工具
- pgsql
- uptime-kuma：一个开源免费的监控工具
- rsshub：一个开源、简单易用、易于扩展的 RSS 生成器，可以给任何奇奇怪怪的内容生成 RSS 订阅源

![vps-docker-service](/images/vps-docker-service.webp)

通过 Docker 部署这些服务非常简单，主要是需要注意的一点是：将这些服务部署到同一个网路，这样各个服务之间可以互相通信。比如：很多服务都需要依赖数据库 postgresql，可以使用 docker-compose 来编排服务。安装部署过程参考：[我的 VPS 服务部署记录](/posts/2023/01/25/notes-about-deploy-services-in-vps/)

以上。
