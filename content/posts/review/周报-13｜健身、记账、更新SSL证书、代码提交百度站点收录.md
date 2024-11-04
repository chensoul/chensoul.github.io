---
title: "周报-13｜健身、记账、更新SSL证书、代码提交百度站点收录"
date: 2023-04-04
type: post
slug: weekly_review_13
categories: [Review]
tags: [review]
---

## 前言

![weekly-review-13-01](/images/weekly-review-13-01.webp)

本篇是对 `2023-03-27` 到 `2023-04-02` 这周生活的记录与思考。首发在我的个人 [博客](https://blog.chensoul.cc/)，你可以移步了解更多或者给我留言。

本周是三月的最后一周，想到这，就想对随便对三月份做个总结。总结的方面，大概包括工作、生活、学习、健身、财务、娱乐几个方面。万事开头难，不知道能者多少，但是，相信不管写多少，都是有意义的。

先来说说最近一周做了什么。查看一下 gitlab 上标签提交记录，这周发布了一个版本，其余时间是进行测试，为下周发布做准备。在工作之余，开始学习《Effective Java 3》，并用 chatgpt 作为辅助工作，加深对技术的理解。另外，有了想学习 React、Rust、Go、Pyhon 的想法。想学的东西有点多，只能一步步来。争取每天利用下班之后的一个小时进行碎片化的学习，并且做好相关笔记，如有可能发布在这个博客上面。加油！

这周完成了每天一万步的计划，其中周末走了 3 万多步，并且还开始了跑步。

## 关于健身

完成了每天一万步的计划，并且共跑步 8 次，一共 26 公里，最高平均配速 7 分钟，还跳绳一次（550 下）。

<img src="/image/weekly-review-13-03.webp" alt="weekly-review-13-03" style="width:50%;" />

跑步的目的不是快，而是乐此不疲。每天跑步 5 公里，每次消耗 300 卡路里的热量，大概需要 10 周才能瘦 10 斤。

<img src="/image/weekly-review-13-02.webp" alt="weekly-review-13-02" style="width:50%;" />

光靠走路和跑步，想在 4 月完成瘦 10 斤的目标，应该是不可能的，打算辅助间歇性断食，看下效果。

> 跑步是一种有氧运动，可以促进身体代谢，消耗体内的脂肪和热量，达到减肥的效果。但是减肥的效果受到很多因素的影响，如个人的体重、身高、年龄、性别、饮食习惯、跑步强度、频率和时长等。
>
> 通常来说，减肥的基本原理是消耗更多的热量，从而达到体重减轻的效果。每天跑步 5 公里的运动量相对较小，一般在一个小时左右可以完成。如果每天坚持跑步，同时注意饮食控制，增加其他有氧运动和合理的休息，可能会在几个月内看到一定的减肥效果。
>
> 根据一般的减肥经验，每消耗 3500 卡路里的热量就可以减少一斤体重。假设每次跑步消耗 300 卡路里的热量，那么每天跑步 5 公里约消耗 300 ~ 400 卡路里的热量。如果每天坚持跑步，并且保持每天消耗 300 ~ 400 卡路里的热量，那么大约需要 10 周时间才能减少 10 斤体重。

## 关于记账

上周开始，在寻找一个记账的 APP，想开始记录每天的收入与支出。当然，更多的应该是支出了。现在，大环境不行，公司裁员不停，必须要开源节流，手上储备足够的现金。

找来找去，发现微信里没有有个『微信记账本』小程序就可以在微信里自动记账，也支持手动记账。于是，这周试了一下这个小程序，并有意的控制自己每天的输出。因为每天都有带饭，这样中饭就不用花钱了；早餐呢，是泡之前买的黑芝麻糊喝，省去了早餐费用。结果是，这周的支出只有 4.5 元。一次是早上买了一本豆浆，一次是早上跑步怕迟到就骑了一次动感单车。

<img src="/image/weekly-review-13-05.webp" alt="weekly-review-13-05" style="width:50%;" />

正好三月结束了，查看了一下三月的支出报表。总的来说，三月支出的有点多，超乎了我的想象。如果每个月都是支出这么多，那以后的零花钱就不够用了。还是要勒紧裤腰带过日子啊。

<img src="/image/weekly-review-13-04.webp" alt="weekly-review-13-04" style="width:50%;" />

## 更新 SSL 证书

安装 acme.sh

```bash
curl https://get.acme.sh | sh -s email=chensoul.eth@gmail.com
```

**我的域名托管在 cloudflare**，故需要获取 [cloudflare API key](https://dash.cloudflare.com/profile/api-tokens)，在 `API 令牌` 页面，点击查看 `Global API Key`。

![weekly-review-13-06](/images/weekly-review-13-06.webp)

保存 `CF_Key` 和 `CF_Email`：

```bash
export CF_Key="cloudflare 中查看你的 key"
export CF_Email="chensoul.eth@gmail.com"
```

生成证书，并重启 nginx：

```bash
acme.sh --issue -d "chensoul.cc" -d "*.chensoul.cc" --dns dns_cf \
--cert-file      /usr/local/nginx/ssl/chensoul.cc.cer  \
--key-file       /usr/local/nginx/ssl/chensoul.cc.key  \
--fullchain-file /usr/local/nginx/ssl/fullchain.cer \
--reloadcmd "nginx -s reload"
```

移除域名证书自动更新

```bash
acme.sh --remove -d chensoul.cc -d "*.chensoul.cc"
```

## 百度站点收录

参考 [向百度主动推送网站链接](https://ifttl.com/push-urls-to-baidu/) 使用脚本定时推送网站链接到百度站点。对 `push_to_baidu.sh` 脚本的 parse 方法做了如下修改，以解决 `xmllint 解析带有命名空间的 xml 文件报错` 的问题。

```bash
function parse {
    local file=$1
    echo $file
    $XMLLINT --format --xpath "//*[local-name()='loc' and namespace-uri()='http://www.sitemaps.org/schemas/sitemap/0.9']/text()" "$file" | sed -e 's/https/\nhttps/g' > "$URL_TEMP"
    echo $URL_TEMP
}
```

## 工作

### Effective Java 3 笔记

请参考 [《Effective Java 3》笔记：使用构造器代替构造函数](/posts/2023/04/03/builder-instead-of-constructors/)

### Rust

因为对 [Tauri](https://tauri.app/) 这个 GUI 框架挺感兴趣，所以我开始学习 Rust 了，目前在参考 https://rustwiki.org/ 上的 [通过例子学 Rust](https://rustwiki.org/zh-CN/rust-by-example/) 和 [Rust 程序设计语言](https://rustwiki.org/zh-CN/book/) 学习 Rust。

## 好物分享

虽然大部分有意思的内容会分享在 『[ChenSoul Share](https://t.me/chensouls)』Telegram 频道，不过还是挑选一部分在这里列举一下，感觉更像一个 newsletter 了。

### 一些文章

- [Go wasm 使用：Go 代码编译成 WebAssembly 及调用](https://www.lijiaocn.com/%E7%BC%96%E7%A8%8B/2023/03/28/go-wasm-usage.html)
- [失业三个月，我都干了啥？](https://ourai.ws/posts/what-i-have-done-in-2023-q1/)
- [介绍一下 gitea 的 action](https://www.bboy.app/2023/04/04/%E4%BB%8B%E7%BB%8D%E4%B8%80%E4%B8%8Bgitea%E7%9A%84action/)

- [作为绝对初学者学习 Web 开发](https://blog.p2hp.com/archives/10711)

### 一些工具

- 数据统计分析：[https://usefathom.com](https://usefathom.com/)
- Cloudflare 图床：[Cloudflare Images](https://www.cloudflare.com/zh-cn/products/cloudflare-images/)
- Java 单元测试插件：[Squaretest for IntelliJ IDEA](https://squaretest.com/)

- 基于标记的科学排版系统：[Typst](https://typst.app/)。可以协同工作，且界面更友好。旨在成为 LaTeX、Word 和 Google Docs 等的替代品。

- 数据可视化资源库：[https://vis.zone/lib/](https://vis.zone/lib/)。网站提供非常全面的可视化图表类型供参考，还收集了很多实现可视化的代码、工具、课程、书籍。

- 一个免费的 chatgpt 在线 web：https://chatbot.theb.ai/#/chat/1002

### 一些视频

以下是最近在看的电视、动画片

-《飚速宅男》第五季。一群高中生骑自行车的热血故事。

-《潘多拉伪造的乐园》。此剧讲述了一名拥有令人称羡生活的女子在恢复过往的记忆后，为保护自己和家人对随意操纵自己命运的人展开报复的故事

以上。
