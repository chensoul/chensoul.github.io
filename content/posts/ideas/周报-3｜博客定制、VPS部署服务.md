---
title: "周报-3｜博客定制、VPS部署服务"
date: 2023-01-25 09:47:03+08:00
draft: false
slug: weekly_review_3
categories: [Ideas]
tags: [review,hugo,github,cusdis,umami,kuma,cloudflare]
---

## 前言

本篇是对 `2023-01-16` 到 `2023-01-22` 这周生活的记录与思考。首发在我的个人 [博客](https://blog.chensoul.com/)，你可以移步了解更多或者给我留言。

这是过年前的最后一周，上了三天班，请了两天假回去准备年货、去亲戚家吃年饭。趁放假之前，继续对博客做了一些定制，也在我的 VPS 上通过 Docker 部署了一些服务。

## 定制博客

基于 [pseudoyu](https://www.pseudoyu.com/) 的博客和主题定制博客，发现并修复了bug，还做了一些改进，并在他的 github 提交 [issue](https://github.com/pseudoyu/pseudoyu/issues/2) 和 merge request。

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/github-issue-build-aboutme-py.png" alt="github-issue-build-aboutme-py" style="width: 80%"/>

接着在他博客主页留言，几个来回下来，收获不少。一是解决了我提出的问题，二是给我分享了一个搬瓦工的 the plan 优惠码。这时候去看了下我原来的 vps 刚好还有一天要到期，就立即花了92 美元（原价是 99 美元）购买了一台 2G 内存托管在香港的服务器。

![vps-main-controlls](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/vps-main-controlls.png)

缘分就是这么奇妙，如果我不主动和这个博主联系，就不会知道搬瓦工还有这个优惠，就不会帮助我解决了博客定制过程中遇到的疑惑。

> 当你想要什的时候，先给出去，你就会收获更。有舍才有得。

## 博客个人介绍

我的博客源文件托管在 [gihub](https://github.com/chensoul/chensoul.github.io)，在这个仓库可以看到我的一些个人介绍，当然，我的博客也有个人介绍（在[关于](https://blog.chensoul.com/about/)页面），如果你仔细观察，可以发现他们基本上是一样的，这个是怎么实现的呢？

<img src="http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/chensoul-github-io-readme.png" alt="chensoul-github-io-readme" style="width: 80%"/>

首先，github 里面可以创建一个以 github 账号为名称的仓库，然后编辑好 README.md 文件，README.md 文件内容就会渲染成 html 显示到个人 github 主页。例如，我的 github 主页是 https://github.com/chensoul，我的个人仓库地址为 https://github.com/chensoul/chensoul，这个仓库是通过 github actions 来构建 README.md，构建文件查看仓库的 workflows 文件，主要有两个文件：

- build.yml：周期性的调用 [build_readme.py](https://github.com/chensoul/chensoul/blob/main/build_readme.py) 来生成 README.md 文件（包括：获取最近 5 篇博客文章、或者 豆瓣上最近 5 个电影书籍动态、获取 github 上发布的项目、显示 wakatime 报表）
- waketime.yml：生成 wakatime-charts

当 README.md 生成之后，只需要将该文件内容同步到博客的 about.md 文件即可。怎么实现呢？参考博客源文件里的 [build_about.py](https://github.com/chensoul/chensoul.github.io/blob/main/build_about.py)。这样就可以实现一个自我介绍同步到多个平台（除了博客，还可以通过 api 接口同步到语雀等其他平台）。

## vps 上服务部署

购买了新的 VPS 之后，就将原来的 VPS 导出镜像，然后导入到新的 VPS，最后再安装了以下服务：

- [flowerss-bot](https://github.com/indes/flowerss-bot)：一个支持应用内阅读的 Telegram RSS Bot。
- [n8n](https://n8n.io/)：一款开源的自动工作流服务，类似 IFTTT、Zapier，可以互联互通包括 GitHub、Dropbox、Google、NextCLoud、RSS、Slack、Telegram 在内的几十款在线服务。
- memos：一个开源且免费的自托管知识库
- cusdis：一个界面清爽、注重隐私的轻量级 (~5kb gzip) 评论系统，可以很方便地与 React、Vue 或其他博客系统结合，并且还提供了一个后台来管理所有的评论
- umami：一个简单易用、自托管的开源网站访问流量*统计*分析工具
- pgsql
- uptime-kuma：一个开源免费的监控工具
- rsshub：一个开源、简单易用、易于扩展的RSS 生成器，可以给任何奇奇怪怪的内容生成RSS 订阅源

![vps-docker-service](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/vps-docker-service.png)

通过 Docker 部署这些服务非常简单，主要是需要注意的一点是：将这些服务部署到同一个网路，这样各个服务之间可以互相通信。比如：很多服务都需要依赖数据库 postgresql，可以使用 docker-compose 来编排服务。安装部署过程参考：[我的VPS服务部署记录](/posts/2023/01/25/notes-about-deploy-services-in-vps/)

以上。

