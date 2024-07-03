---
title: "周报-15｜Umami升级到2.0、汉街蜡像馆、使用Strava跑步"
date: 2023-04-18 17:00:00+08:00
draft: false
slug: weekly_review_15
categories: [Review]
tags: [review, java, rust, python]
---

## 前言

![weekly-review-15-01](https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-01.png)

_题图：楚河汉街蜡像馆_

本篇是对 `2023-04-10` 到 `2023-04-16` 这周生活的记录与思考。首发在我的个人 [博客](https://blog.chensoul.cc/)，你可以移步了解更多或者给我留言。

这周的工作不算忙碌，继续学习《Effective Java 3》这本书，并花了一些时间学习 Rust、Python 的基础语法。

这个月已经过了一半，减肥也进行了两周，体重从 72 公斤减到了现在的 68.4 公斤。在之前每天走路 1 万步的基础上，打算开始每天跑步，比记录跑步数据。

这周总计支出 916 元，明细如下：

- 4 月 12 日：329 元，开通 ETC 预存 300 元
- 4 月 15 日：116 元，周末买菜做饭
- 4 月 16 日：471 元，老婆过生，吃饭和看电影

四月累计支出共 2025 元，其中餐饮和购物占了一半。

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-05.jpeg" alt="weekly-review-15-05" style="width:50%;" />

## 健身

这周每天走路步数如下，其中有一天因为加班而没有完成一万步的目标。

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-06.png" alt="weekly-review-15-06" style="width:50%;" />

受 [@Conge](https://conge.livingwithfcs.org/) 博客影响，开始记录每天的跑步数据。首先是注册了 strava 账号，然后参考 [running_page](https://github.com/yihong0618/running_page) 部署了一个我的跑步主页 [run.chensoul.cc](https://run.chensoul.cc/)。

![weekly-review-15-02](https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-02.png)

因为我之前是使用悦跑圈 APP 记录跑步，所以又参考[这篇文章](https://github.com/yihong0618/running_page/blob/master/README-CN.md#joyrun%E6%82%A6%E8%B7%91%E5%9C%88)导出 gpx 数据，然后[同步](https://github.com/yihong0618/running_page/blob/master/README-CN.md#gpx_to_strava)到 Strava。最后，可以把悦跑圈 APP 卸载了。

![weekly-review-15-03](https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-03.png)

上周跑步数据如下，总计 28.64 公里，比上周的 19.05 公里多了 9.6 公里。

![weekly-review-15-04](https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-04.png)

上面搞定了之后，就可以使用 Strava 来跑步了。为了增加社交乐趣性，我在 n8n 里面创建了一个 workflow，将 Strava 活动发送到我的『[ChenSoul Share](https://t.me/chensouls)』Telegram 频道，效果如下。

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-07.png" alt="weekly-review-15-07" style="width:50%;" />

## Umami 升级到 2.0

1、首先备份数据库

2、升级数据库

```bash
git clone https://github.com/umami-software/migrate-v1-v2.git
cd migrate-v1-v2
yarn install
yarn build
```

创建 .env 文件：

```properties
#修改为你的数据库地址
DATABASE_URL=postgresql://umami:xxxxx@postgres.chensoul.cc:5432/umami
```

运行：

```bash
yarn start
```

3、重新部署静态页面

日志提示报错：

![weekly-review-15-16](https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-16.png)

解决办法是修改 scripts/check-db.js：

![weekly-review-15-17](https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-17.png)

4、修改跟踪脚本，把站点中所有追踪脚本名字`umami.js`改为`script.js`。

5、最后查看实时仪表盘。我的 umami 实时 [访问地址](https://umami.chensoul.cc/realtime/f110cfa0-b737-4690-a032-2b9073a57fc3)

## 工作

### Effective Java 3 笔记

请参考《[Effective Java 3 笔记：依赖注入优于硬编码资源](/posts/2023/04/17/prefer-dependency-injection-to-hardwiring-resources)》。

## 汉街蜡像馆

周末趁武汉旅游大年卡还没过期，跑到楚河汉街蜡像馆去溜达了一圈。因为有年卡，省去了 150 元的门票。

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-08.png" alt="weekly-review-15-08" style="width:67%;" />

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-09.png" alt="weekly-review-15-09" style="width:67%;" />

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-10.png" alt="weekly-review-15-10" style="width:67%;" />

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-11.png" alt="weekly-review-15-11" style="width:67%;" />

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-12.png" alt="weekly-review-15-12" style="width:67%;" />

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-13.png" alt="weekly-review-15-13" style="width:67%;" />

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-14.png" alt="weekly-review-15-14" style="width:67%;" />

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-15-15.png" alt="weekly-review-15-15" style="width:67%;" />

## 好物分享

虽然大部分有意思的内容会分享在 『[ChenSoul Share](https://t.me/chensouls)』Telegram 频道，不过还是挑选一部分在这里列举一下，感觉更像一个 newsletter 了。

### 一些文章

1、[Java 编程教程](https://www3.ntu.edu.sg/home/ehchua/programming/index.html)

![img](https://cdn.beekka.com/blogimg/asset/202301/bg2023011504.webp)

这个网站是新加坡南洋理工大学的一位老师的教案（英文），主要内容为新生的 Java 编程

2、[offsec.tools](https://offsec.tools/)

![img](https://cdn.beekka.com/blogimg/asset/202301/bg2023012101.webp)

这个网站收集各种安全相关的软件工具，目前共有 600 多个。

3、[我的习惯养成计划：五分钟规则+打卡](https://juemuren4449.com/archives/habit-formation-plan)

4、[我编程 20 年的指导原则](https://www.jitao.tech/posts/my-guiding-principles-after-20-years-of-programming/)

5、[用 zmv 批量重命名文件](https://lenciel.com/2022/10/renaming-with-zmv/)

### 一些工具

- [WebPerformance Report](https://webperformancereport.com/) 这个网站可以用邮箱订阅你的网站性能的个性化报告。它会监控指定网站的性能，每周会发送一封报告邮件给你。
