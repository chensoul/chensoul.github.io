---
title: "周报-10｜通过Cloudflare Tunnel访问服务、Vercel部署Cusdis和Umami"
date: 2023-03-13 11:00:00+08:00
draft: false
slug: weekly_review_10
categories: [Review]
tags: [review, chatgpt, vps, cusdis, umami, cloudflare, vercel, railway]
---

## 前言

![weekly-review-10-00](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-10-00.jpeg)

本篇是对 `2023-03-06` 到 `2023-03-12` 这周生活的记录与思考。首发在我的个人 [博客](https://blog.chensoul.com/)，你可以移步了解更多或者给我留言。

这周发现 VPS 上 [某些使用 docker 部署的服务](https://blog.chensoul.com/posts/2023/01/25/notes-about-deploy-services-in-vps/)（cusdis、umami、uptime、n8n、rsshub、memos）国内用户无法访问了，于是就折腾了一下使用 Cloudflare Tunnel 来代理这些服务。配置成功之后，又发现本地如果开启 VPN，Cloudflare Tunnel 代理的域名还是无法访问，于是放弃了使用 Cloudflare Tunnel，改为将这些国内无法访问的服务部署到免费的 VPS 服务器上，比如：Railway、Vercel。

这周工作忙完之后，就开始着手通知系统的重构改造服务，想着 chatgpt 这么火，于是就试试让它来写代码。在不断地修改需求的情况下，chatgpt 写出来的代码稍加调整逐渐可以使用了。

周六从汉口开车去白沙洲湖北财税职业学院，全程 20 公里，回来的时候不小心把路边的面包车擦碰了一下。于是一脸懵的经历了一次保险定损维修。

![weekly-review-10-07](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-10-07.jpeg)

周六开始使用 格志 APP 写日志，选择它来记录日志的原因是它支持批量导出 mardkown、pdf、图片等。唯一有个小遗憾的是，这个应用没有图床，导出的 markdown 文件里面图片的链接不是 http 协议。

<img src="http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-10-08.png" alt="weekly-review-10-08" style="width:67%;" />

周日去新荣龙湖天耀天街售房部看了一下房子。107 平三室两厅两卫，单价 2 万 5 带精装修，公积金贷款 90 万，商业贷款 30 年，每个月房贷 6000。目前来说，买不起这里的房子，但是，作为一个买房目标还是可以的，加油！

## 开车总结

最近刷视频，总结的一些开车经验如下：

- 提前预判，前面车子刹车，不管是正前方，还是左右前方，这时候也要刹车

- 前面有大货车，不要从右边超车

- 会车时，看路宽

- 不要连续变道，变道时既要看后视镜，又要看窗边

- 红灯路口右转时，要看地面或者路边是否有禁止右转标识

## 通过 Cloudflare Tunnel 访问服务

以下内容参考 [初探 Cloudflare 零信任 - 通过 Cloudflare Tunnel 访问服务](https://dejavu.moe/posts/cloudflare-tunnel-access-uptime/)。

### 1、创建 Cloudflare Tunnel

登录 [Cloudflare Zero Trust](https://one.dash.cloudflare.com/) 控制台，选择左侧导航栏的 Access 菜单，进入 Tunnels 配置，点击 Create a tunnel 创建一个 Tunnel，输入 Tunnel 隧道名称

![weekly-review-10-01](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-10-01.png)

选择服务器的操作系统和平台架构：

![weekly-review-10-02](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-10-02.webp)

可以看到安装命令：

![weekly-review-10-03](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-10-03.png)

复制左边命令粘贴到 SSH 会话里安装 Cloudflared（注意保护 Refresh Token 不要泄漏）

```bash
brew install cloudflare/cloudflare/cloudflared &&

sudo cloudflared service install eyJhIjoiMmUxOTgwYTBlZjQzZjU3YjkyMGVhMjhjZGY5ZDM4ZDEiLCJ0IjoiYzU1ZTU3MmUtMTEyMS00OWJkLTgzMTgtNjc3NDIyYWMwMjU0IiwicyI6Ik1qZGtZakkyTldFdE5XVTRNUzAwTXpWaExXRXlNRFl0T0RobE5EbGpObVZpWmpJMSJ9
```

### 2、删除 Cloudflare DNS 的 A 记录解析

我的域名托管在 Cloudflare 上，所以需要将原来的域名解析记录删除，主要涉及以下两个需要被国内用户访问的域名（其余域名是我个人使用，所以只需要我开启 VPN 访问即可。）：

- cusdis.chensoul.com
- umami.chensoul.com

### 3、在 Cloudflare Tunnel 添加 hostname

![weekly-review-10-04](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-10-04.png)

如果需要对 ssh 服务开启代理，请参考：[Connect with SSH through Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/use_cases/ssh/)。

![weekly-review-10-05](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-10-05.png)

关键步骤是：

- 为 ssh 通道创建 Hostname

- 在本地安装 [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)

- 配置 ~/.ssh/config，添加下面配置（注意：我使用 Homebrew 安装的 cloudflared）：

  ```bash
  Host ssh.chensoul.com
  ProxyCommand /opt/homebrew/bin/cloudflared access ssh --hostname %h
  ```

- 通过 ssh 访问 ssh.chensoul.com：

  ```bash
  ssh root@ssh.chensoul.com
  ```

### 4、在 vps 上启用防火墙，停止 nginx 服务

将 vps 上 nginx 配置的反向代理删除，并可以禁用这些服务暴露的端口。

### 5、测试

经过测试，~~又发现本地如果开启 VPN，Cloudflare Tunnel 代理的域名还是无法访问~~，于是放弃了使用 Cloudflare Tunnel，改为将这些国内无法访问的服务部署到免费的 VPS 服务器上，比如：Railway、Vercel。

## Vercel 部署 Cusdis、umami

参考 [轻量级开源免费博客评论系统解决方案（Cusdis + Railway）](https://www.pseudoyu.com/zh/2022/05/24/free_and_lightweight_blog_comment_system_using_cusdis_and_railway/) 在 Railway 上部署 cusdis，数据库还是可以使用 vps 上部署的 postgresql，只需要配置一个 jdbc 链接即可：

- postgresql://cusdis:xxxxxx@postgres.chensoul.com:5432/cusdis

部署完之后，发现存在跨域问题，故全部改为使用 Vercel 来部署。

参考 [Cusdis 官方文档](https://cusdis.com/doc#/self-host/vercel) 来部署 Cusdis，对于 Cusdis 存在跨域问题，参考 [Sometimes form shows on page, sometimes not - CORS issue #135](https://github.com/djyde/cusdis/issues/135)，修改你的 github 的 cusdis 仓库中的 next.config.js 文件：

```javascript
async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ]
  },
```

参考 [Umami 官方文档](https://umami.is/docs/running-on-vercel) 来部署 Umami，umami 的 postgresql jdbc 链接还是使用 vps 上面部署的 postgresql

- postgresql://umami:xxxxxxpostgres.chensoul.com:5432/umami

## Chatgpt 写代码

在 https://poe.com/chatgpt 里面输入下面文字：

> 请用 java 实现一个通知系统，给出完整的代码，需求如下：
>
> 1、通知事件，指业务平台触发的事件，通知事件有名称，描述，编码。通知事件可以定义多个属性。属性有名称、描述、编码，类型。类型有整形、字符串、日期、时间、浮点数、列表几种。
>
> 2、通知规则。通知规则有名称、生效时间（一直生效，或者指定时间段生效），通知事件（从创建好的事件选择一个）、描述。通知规则可以创建多个规则项。每个规则项要选择事件下面的某一个属性，并且可以对该事件属性选择一个操作符（大于、小于、等于、在两个指之间）和设置对应的值。如果是大于、小于、等于，则只用选择一个值。如果是在两个指之间，则需要选择两个值。多个执行条件在规则执行时，是按与执行。规则可以指定多个通知用户（姓名、手机号）。
>
> 3、通知策略。一个规则可以定义多个通知策略。通知策略有通知模版、通知渠道。每个通知模版有标题、描述以及模版内容（模板内容支持变量替换）。
>
> 4、通知渠道有类型、配置属性，可以发送消息，支持的通知渠道有飞书、邮件。
>
> 5、通知规则测试。给定一个事件码和事实数据，系统查询出该事件码关联的多个规则。每个规则通过 easy-rule 4.1.0 框架去执行。每个规则项执行前，需要校验事实数据里的值的类型和事件属性定义的类型是否一致。多个规则项的执行结果求交集。当最后结果为 true 时，将通知策略中的模板内容进行变量替换，然后通过渠道发送消息给这些人。
>
> 注意：相同的消息内容，在一分钟内，只通过一个渠道给某一个用户发送一次，不要重复发送。

chatgpt 回答如下：

<img src="http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-10-06.png" alt="weekly-review-10-06" style="width:67%;" />

**总结：**

让 chatgpt 写代码相对来说，还是很方便的，可以提供一些编程示例或者开阔编程思路，但是也有一些缺陷：

- chatgpt 写的代码不一定准确，或者说没有考虑一些异常情况。需要不断地和 chatgpt 聊天，描述清楚需求，让 chatgpt 来修正代码，这样交互式聊天，相对来说会有点耗时。
- 提供的 url 链接可能 404。

## 好物分享

虽然大部分有意思的内容会分享在 『[ChenSoul Share](https://t.me/chensoul_share)』Telegram 频道，不过还是挑选一部分在这里列举一下，感觉更像一个 newsletter 了。

### 一些文章

- [Java 近期新闻：Gradle 8.0、Maven、Payara 平台、Piranha、Spring Framework、MyFaces 和 Piranha](https://www.infoq.cn/article/txS9hHTfxasv2uHBATgL)

- [RackNerd VPS 推荐](https://blognas.hwb0307.com/ad)

### 一些工具

#### [Zed](https://zed.dev/)

Atom 作者新开发的编辑器 Zed 速度确实非常快，基本的功能也都支持，现在还在内测阶段，暂时不支持安装 extension。

#### [图片转 webp](https://developers.google.com/speed/webp/docs/cwebp?hl=zh-cn)

mac 上安装：

```bash
brew install webp
```

使用示例：

```bash
cwebp -q 50 -lossless picture.png -o picture_lossless.webp
cwebp -q 70 picture_with_alpha.png -o picture_with_alpha.webp
cwebp -sns 70 -f 50 -size 60000 picture.png -o picture.webp
```

### 一些影视

- [冰海陷落](https://movie.douban.com/subject/6538807/)，推荐指数：☆☆☆☆。疯狂的芭堤雅将军杜罗夫（米哈伊尔・戈尔沃伊 Mikhail Gorevoy 饰）预谋发动第三次世界大战，他制造了一场巨大的水域爆炸，致使附近的美军潜艇队遇袭。美国海军派出了海底经验丰富但名声寥寥的乔・格拉斯潜水艇船长（杰拉德・巴特勒 Gerard Butler 饰）率领潜艇队前去调查。

- [黑暗荣耀第二季](https://movie.douban.com/subject/36193784/)，推荐指数：☆☆☆☆。

以上。
