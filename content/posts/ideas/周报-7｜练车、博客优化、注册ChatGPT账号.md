---
title: "周报-7｜练车、博客优化、注册ChatGPT账号"
date: 2023-02-21 00:00:00+08:00
draft: false
slug: weekly_review_7
categories: [Ideas]
tags: [review,hugo,cloudflare,n8n,chatgpt,memos,rss,github]
authors:
- chensoul   

---

## 前言

本篇是对 `2023-02-13` 到 `2023-02-19` 这周生活的记录与思考。首发在我的个人 [博客](https://blog.chensoul.com/)，你可以移步了解更多或者给我留言。

## 练车

这周末开始练车，周六是第一次开自己的车，简单试驾了一样；周日则开了一百多公里，具体行程是从阳逻到新洲，从新洲单汉口，从汉口到光谷，从光谷回汉口。

这途中走了江北快速公路、二环、二七长江大桥、东湖隧道，从白天开到晚上夜行，经历过堵车，路上看到车祸后的事故现场。

一天下来，总共开车有五个多小时，感觉开车好累。作为新手，开车的过程中要全神贯注，铭记开车最重要的是慢这一原则，速度不敢过快。

![weekly-review-06](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-07-06.webp)

回顾这一天的练车过程，发现自己存在以下问题：

- 对汽车不熟悉，不清楚车内每个按钮有什么作用。

- 不敢开的太快，油门踩到六十公里之后，就下意识地松油门。整个行驶过程中，平均车速大概在二十多公里每小时。

- 对交规不熟悉，第一次用高德地图，不知道什么时候改该变道、什么时候该走中间道路。要变道时候，不够果敢，打了灯光之后，没有快速变道，甚至还降速，等后面车子，而后面车子也在等我。

- 对车距不敏感。行驶过程中，和左右车辆相隔距离多近，没有一个直观的感受。观察后视镜，后面车距多远，有时候也判断不准，导致自己变道犹豫不决，险些擦碰。

- 变道、转弯，有时候忘记打灯。转弯时候，方向盘动得太早，没有等车过斑马线再打方向盘。左转弯时候，没有转大弯，导致车子有一次擦到了左边的石墩子，幸好不是很严重。

- 倒车和侧方停车不够熟练。
- 对上班路线不熟悉，不知道怎么进入公司楼下停车场。

基于以上表现，接下来一周还是坐地铁上班。目前来说还是更喜欢坐地铁上班，可以看视频听音频，可以查看 RSS   订阅文章，可以写周报，可以闭目养神。

![weekly-review-07](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-07-07.png)

老婆给我买的实习期贴牌到了，后面司机看到这么可爱的牌子，估计以为是个妹子在开车吧，应该会喇叭下留情了吧😄。

接下来的周末，还要继续练车，和车子培养感情，从内到外熟悉车子，熟悉上班路线和交通规则，提高行驶速度。加油💪🏻！


## 博客优化

这周重新对博客进行了优化，主要包括以下几个方面：

### 1、优化页面加载速度

每次打开博客首页，感觉页面加载有点慢，故想加快博客打开速度，第一个想到的是减少博客加载资源的次数，也就是去掉一些飞必须的 css 和 javascript 引用；其次，是对 css 进行压缩。

- 去掉对 font-awesome css 的引用。这个对博客来说可有可无，所以直接去掉。
- 去掉对 jquery、bootstrap js 的引用。同样也不是必须的，自定义的 javascript 直接使用原生的操作就行。
- 移除未使用的 css。想参考这篇文章 [CleanCSS - 移除未使用的 CSS 代码](https://dujun.io/cleancss-remove-unused-css.html)，对 css 进行瘦身，无奈文章中的服务器出现故障，无法访问服务。故，暂时搁浅。

### 2、修改网站字体

参考这篇文章 [字体漫谈-网站字体最佳实践](https://www.albertaz.com/blog/web-font-best-practice) 引入 open-sans 字体：

```html
<link rel="preload" as="font" type="font/woff2" href="/css/font/open-sans.css" >
<link rel="stylesheet"  type="text/css" href="/css/font/open-sans.css"  media="print" onload="this.media='all'" />
```

并修改网站 font-family 如下：

```css
body {
    font-family: Open Sans,system-ui,-apple-system,Arial,sans-serif;
    word-break: break-word;
}
```

### 3、修改关于页面内容 

参考这篇文章 [GitHub Profile README Generator](https://rahuldkjain.github.io/gh-profile-readme-generator/)，对 GitHub [首页](https://github.com/chensoul/chensoul) 进行改造，并通过 GitHub Action 同步到博客的 [关于](https://blog.chensoul.com/about/) 页面。

### 4、dns 解析迁移到 cloudflare

将 dns 解析从 AWS 迁移到 cloudflare，并开启 CDN 缓存。

### 5、博客测速

以上优化完成之后，在 [PageSpeed Insights](https://pagespeed.web.dev/) 网站上对博客首页加载速度进行了测速。移动端测试结果为 93 分，如下图：

![weekly-review-07-01](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-07-01.png)

影响评分的原因在于：

- First Contentful Paint (3G) 
- 加载的 [bootstrap.min.css](https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css) 文件过大，包括了一些未使用的 CSS


桌面端测试结果评分为 99 分：

![weekly-review-07-02](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-07-02.png)


另外，试了一下使用 chatgpt 来给出网站优化建议，回答如下：



## n8n 调整

新增了 3 个 workflow：

- 定时获取 [BTC 价格](https://www.bitstamp.net/api/v2/ticker/btcusd)，并发送到 [我的电报群组](https://t.me/chensoul_share)

- 定时获取 spotify 喜欢列表，并发送到电报和 memos

- 每天早上 7 点，发送天气预报给微信

![weekly-review-07-03](../../../../../../Pictures/weekly-review-07-03.png)


修改了以下 workflow：

- 将豆瓣最近动态同步到电报群组以及 [memos](https://memos.chensoul.com/)
- 将 GitHub 最近动态同步到电报群组以及  [memos](https://memos.chensoul.com/)
- 将 [博客 RSS](https://blog.chensoul.com/index.xml) 同步到电报群组以及  [memos](https://memos.chensoul.com/)

此外，在苹果手机上添加了两个捷径：

- [捷径一](https://sharecuts.cn/shortcut/12640)：调用 memos API 创建 memos
- [捷径二](https://www.icloud.com/shortcuts/d990253f43e148469af5e85c296961cf)：对网站通过 RSSBud 获取 RSS 订阅地址并发送到电报的 flowerrss 机器人进行订阅  


## ChatGPT 注册账号

参考 [注册ChatGPT详细指南](https://sms-activate.org/cn/info/ChatGPT) 注册账号，我在 sms-activate 网站是购买的巴西的手机号来接验证码。


解决地区受限问题：在浏览器地址栏里输入 `javascript:`，然后粘贴下面代码：

```javascript
window.localStorage.removeItem(Object.keys(window.localStorage).find(i=>i.startsWith('@@auth0spajs')))
```

> 如果还是无效，则清理浏览器 cookie 和 session，再刷新页面。


账号创建成功之后，创建了几个 chat：

- 『文案小助手』：在今后的会话里，你都将扮演我的文案纠错润色助理，并综合给出优化后的版本。
- 『专业后端开发老师』：在今后的对话里，你是一个专业的后端语言开发者老师，会回答我所有关于后端开发相关的问题，尤其是 Java、Pyhon、Go 语言，同时也包括 Shell 脚本、Makefile、Docker、K8S 等运维部署相关的疑问，每次都会给出代码示例，不需要我再额外提醒。
- 『专业前端开发老师』：在今后的对话里，你是一个专业的前端开发者老师，会回答我所有关于前端语言开发相关的问题，尤其是 TypeScript、React、Vuejs、CSS、Html 和 Nextjs，每次都会给出代码示例，不需要我再额外提醒。
- 『个人搜索引擎』：在今后的会话里，请你扮演我的专业搜索引擎，为我搜索查阅相关问题的答案和信息，每个问题尽量给出链接和出处，不需要我额外再说明。

点击 [链接](https://platform.openai.com/account/api-keys)，可以创建应用。给飞书用户准备的 ChatGPT 机器人，参看 [ChatGPT-Feishu](https://github.com/bestony/ChatGPT-Feishu) 。


# 💻 好物分享

### 一些文章

- 技术类：

  - [我的个人 IT 基础设施（英文）](https://writings.stephenwolfram.com/2019/02/seeking-the-productive-life-some-details-of-my-personal-infrastructure/)

  - [打造我的家庭办公环境（英文）](https://arun.is/blog/desk-setup/)

  - [科技爱好者周刊（第 191 期）：一个程序员的财务独立之路](https://www.ruanyifeng.com/blog/2022/01/weekly-issue-191.html)

  - [入行 14 年，我还是觉得编程很难](https://www.zlovezl.cn/articles/programming-is-still-hard-after-14-years/)
  - [设计服务端软件配置的 4 条建议](https://www.piglei.com/articles/how-to-design-config-file-for-software/)

- 非技术类：

  - [除了健康，都是小事](https://tingtalk.me/health/)

  - [驾考指南](https://tingtalk.me/driving-test/)


### 一些工具

#### 1、[亲戚关系计算器](https://passer-by.com/relationship/vue/#/)


#### 2、[ImageOptim](https://imageoptim.com/mac) 

开源图片压缩软件：一款 Mac 小工具，可以方便的进行图片压缩，支持多格式、批量处理。值得注意的是，它压缩之后的图片会覆盖之前的图片。使用了这个工具之后，我就把  TinyPNG4Mac 卸载了。


#### 3、[沉浸式双语网页翻译扩展 – immersive-translate](https://immersive-translate.owenyoung.com/) 

强烈推荐这个网页翻译插件，和其他插件翻译整个页面相比，这个插件的优势是可以同时显示双语，中英文对照非常棒，是一个 [开源](https://github.com/immersive-translate/immersive-translate) 的项目，完全免费使用。也支持 PDF，配合任何 [epub 在线阅读网站](https://epub-reader.online/)对照翻译阅读书也非常方便。也支持了Deepl，腾讯翻译等等的翻译服务。开发者 [@OwenYoungZh](https://twitter.com/OwenYoungZh)

#### 4、[Input Source Pro](https://inputsource.pro/zh-CN)

Input Source Pro 可以根据应用或是网站自动切换输入法，并且在切换窗口的时候还会贴心的提示当前的输入法是什么，比如设置 VSCode、iTerm、Xcode 默认为英文输入法，而笔记软件和企业微信默认为中文输入法，切换软件时再也不需要按 shift 键了！


以上。
