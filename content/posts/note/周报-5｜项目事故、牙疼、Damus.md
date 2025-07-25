---
title: "周报-5｜项目事故、牙疼、Damus"
date: 2023-02-07
slug: weekly_review_5
categories: [Review]
tags: [review]
---

## 前言

本篇是对 `2023-01-30` 到 `2023-02-05` 这周生活的记录与思考。首发在我的个人 [博客](https://blog.chensoul.cc/)，你可以移步了解更多或者给我留言。

这周是过年后的第一个工作周，被国家安排了连上七天班，算是体会了一次 “过年七天乐，上班七天累” 的过山车。七天的工作主要是测试并发布项目，每天忙的焦头乱额，生怕项目出了问题。有句话说，怕什么来什么。没想到周六还是报出了一个故障，还在睡觉中的我被一个电话吵醒，接着忙着找问题和解决方法，一天的时间就都花在这上面。万幸的是事故影响不大，发布了一个小版本进行修复。事故原因，还是值得警惕。

## 工作总结

### 项目事故

这周主要是自定义拦截器和 ErrorCoder 来记录 feign 请求的调用次数，包括调用成功的和失败的。另外，如果调用失败，设置了重试两次。这里重试的前提是 http 请求出现 4xx 或者 5xx 状态码错误，如果是状态码为 200 但返回了自定义业务异常，是不会触发重试机制的。这一点没有注意到，而发布前，我想当然的把一个接口的手动重试代码删掉了，导致调用该接口出现业务异常之后没有进行重试，影响了业务方的使用。

出现该问题的原因，一是没想出重试的前提条件，没有写代码注释；二是没有写单元测试；三是没有交叉代码审核。此外，还有一点，越是项目发布关键时期，越要注意休息，保持大脑足够清晰和敏捷。

### AOP 日志记录

参考 【[每天进步一点点（二）-哔哩哔哩](https://b23.tv/2HCODuM)】 在项目里添加代码对 controller 方法请求参数、返回结果、执行时间的记录。视频中讲的很清楚，这里就不贴代码了。

![spring-aop-customizable-trace-interceptor](../../../static/images/spring-aop-customizable-trace-interceptor.webp)

- 该方法，可以对 controller 的所有方法（不管是 get 还是 post 或其他方法），都记录日志。如果想排除 get 方法（一个项目里查询比修改请求大很多），需要添加代码进行过滤。

- 另外，打印请求参数时，实际是记录的请求参数的 toString 方法，如果请求参数里有些对象没有定义 toString 方法，则记录的是对象的引用地址。再者，如果对象里有些敏感字段不想输出到日志里，则需要重写 toString 方法。一个可选的方法是，改为打印请求参数的 json 序列化值，这样做又会带来序列化开销。
- 如果 controller 层代码被代理了多次，则请求参数和返回结果会打印多次。

## 生活

### 牙疼

一个月黑风高的晚上，加班回来的程序员偷偷喝了三杯牛奶，结果第二天牙齿开始疼了，特别是吃到冷热酸甜的东西，都会短暂的巨疼。去牙科诊所看了，医生说要做根管治疗，费用 800，可以报销 420，做完以后，牙套价格另算，有一千到几千的价格不等。刚不久还刷到视频说，有两个省要规范治疗牙齿费用。

忍着疼痛上了一周班，结果不仅牙痛，吃饭没胃口，还影响了上班，真是得不偿失。

周六晚上，在牙齿疼痛的地方，插了一点老爸给我的药水。睡觉时，先是畏冷，再就是牙疼的地方发炎，肚子发烧，烧到了不知道多少度，反正我是没有拿温度计去测量。烧的我大脑都是糊的，一晚上没睡好，中途还醒了几次。好在第二天，就好了一些，吃东西也没那么疼了。看来，专家顺发烧是体内细菌在和病毒做斗争，应该是对的啰。

经历了这一晚上，感觉像是体验了一次阳的过程。之前新冠阳了，我是轻症状，没有发烧。这次牙疼发烧，算是把之前新冠没有吃过的苦找补回来，人生也算是多了一种体验。

### 娱乐

-《狂飙》。最近很火，也刚好完结了。我没有去看，没有时间去追，就看了前面几集。

-《粉红理论》。老婆在追的一部泰剧，她是在微博看些别人剪辑的几分钟的片段。叫我也去微博看看，我说我不用微博，我翻墙去找网站观看。老婆眼睛一亮，说那不是可以看到无删减版本，那个兴奋劲哟！很快，我找到了[网站](https://www.dandanzan.com/dianshiju/112399.html)，发现已经上线了 11 集，而且每集都有 60 多分钟长（老婆看的都是阉割版～ 😯）。

## 学习

最近 Damus 很火，我也去注册了一个账号，为此还重新下载了狐狸 🦊 钱包。随即，干脆也注册了 Mastodon 账号和 Crossbell 账号。

![damus-profile](../../../static/images/damus-profile.webp)

- 我的 Damus 账号 npub1dav96pmjv58n60eqz7ctmhvsd7t2yljvzevf6uckmchz6zamx2wq0k7dm5

- 我的 Mastodon 账号 @chensoul@mas.to

- 我的 crossbell 账号 chensoul@crossbell

![xsync-profile](../../../static/images/xsync-profile.webp)

## 好物分享

- **[Mac 删除原生英文 ABC](https://ssnhd.com/2022/01/01/mac-inputdel/)**

以上。
