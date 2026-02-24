---
title: "周报-18｜导出豆瓣数据、Effective Java 3第二章总结"
date: 2023-05-10
slug: weekly_review_18
categories: [learning]
tags: ['weekly-report']
---

## 前言

本篇是对 `2023-05-01` 到 `2023-05-07` 这周生活的记录与思考。首发在我的个人 [博客](https://blog.chensoul.cc/)，你可以移步了解更多或者给我留言。

继上周实现导出苹果接口数据之后，这周又实现了自动导出豆瓣数据。此外，还萌生了导出每天阅读的数据的想法。奈何现在阅读 app 都需要收费，只能暂且搁置这个想法。

最近在学习 Python，于是将学习中做的笔记发布到了博客，这周发布了两篇文章，希望通过输出来倒逼输入，以此来快速掌握 python 编程并能开发一些项目。另外，计划在学完之后，继续学习 Rust 和 Go，甚至开始学习前端开发。

最近又一次更换了博客主题，主要出发点是想找一个简洁的主题，减少不必要的信息干扰，也不想花时间在修改主题上面。减少了菜单链接。

![weekly-review-18-01](/images/weekly-review-18-01.webp)

## 导出豆瓣数据

最近阅读了一篇文章 [很认真的在考虑不再使用豆瓣这件事](https://conge.livingwithfcs.org/2023/05/05/leaving-douban/) ，于是使用[ lizheming/doumark-action](https://github.com/lizheming/doumark-action) 导出豆瓣数据。

在我的 github 主页 https://github.com/chensoul/chensoul 创建一个 workflow [douban.yml](https://github.com/chensoul/chensoul/blob/main/.github/workflows/douban.yml) ，每隔一个小时同步一次豆瓣数据（读书、电影、音乐）到 [csv 文件](https://github.com/chensoul/chensoul/tree/main/data)。拿到这些文件之后，就可以通过 html + css 渲染出来，类似这个页面 [书影音](https://conge.livingwithfcs.org/books/)。等豆瓣数据增多之后，再考虑实现这个。

除此之外，之前还实现了通过 n8n 实时同步豆瓣数据到 memos 和 telegram：

![weekly-review-18-05](/images/weekly-review-18-05.webp)

通过 [python 脚本 ](https://github.com/chensoul/chensoul/blob/main/build_readme.py)获取最近 10 条记录，显示到 [我的 github 主页](https://github.com/chensoul)。

![weekly-review-18-06](/images/weekly-review-18-06.webp)

## 理财

这周总计支出 816 元，明细如下：

- 5 月 1 日：55 元
- 5 月 2 日：79 元
- 5 月 3 日：370 元，其中 270 元加油
- 5 月 4 日：136 元，其中捐款 50 元
- 5 月 5 日：12 元
- 5 月 6 日：100 元，手机话费充值
- 5 月 7 日：64 元

最近一直想统计一下工作和生活中的固定支出费用，于是今天花了点时间做了统计。没想到每年工作和生活中固定支出费用竟然达到了 1529+6180=7709 元。其中大块头是手机话费和停车位费用，手机话费是因为办理一个电信套餐送宽带和一部手机；停车位费用是因为今年买了车。

年费，总计：1529 元

- Typora：89 元
- 百度硬盘：178 元，2024-01-28 到期
- 快连 VPN：374 元，2024-01-16 到期
- 搬瓦工 VPS：640 元，2024-01-14 到期
- 1Password：248 元，2023-08-17 到期

月费，总计：515\*12=6180 元

- 手机话费：189 元

- 停车位：320 元

- iCloud：6 元

## 健身

本周 [跑步](https://run.chensoul.cc/) 记录如下，总计跑步 34.37 公里，其中周六第一次跑了 12 公里，比之前有所进步。遗憾的是，有两天没有跑步，导致连续跑步天数有中断。

![weekly-review-18-04](/images/weekly-review-18-04.webp)

从 3 月份开始跑步到 5 月，目前总共跑步距离达到了 230 公里。

![](/images/weekly-review-18-03.webp)

## 工作

### Effective Java 3 笔记

本周写了两篇《Effective Java 3》的学习笔记，分别是：

- [《Effective Java 3》笔记 8：避免使用终结器和清除器](/posts/2023/05/08/avoid-finalizers-and-cleaners/)
- [《Effective Java 3》笔记 9：使用 try-with-resources 优于 try-finally](/posts/2023/05/08/prefer-try-with-resources-to-try-finally/)

![weekly-review-18-02](/images/weekly-review-18-02.webp)

至此，《Effective Java 3》第二章学习完了，现在总结如下：

1、静态工厂方法代替构造函数

静态工厂方法是一种创建对象的方式，它们与构造器不同，具有明确的名称，并且可以返回任意类型的对象。静态工厂方法的优点包括：

- 名称可以描述对象的含义，使得代码更加清晰易读；

- 静态工厂方法可以控制创建对象的方式，提高灵活性；

- 静态工厂方法可以缓存已创建的对象，避免创建重复对象，提高性能；

- 静态工厂方法可以返回任意类型的对象，而不仅仅是该类或者其子类的实例。

2、使用构造器代替构造方法

当一个类需要多个参数时，可以使用构建器，将参数逐个设置，最后调用 build 方法构建对象。构建器的优点包括：

- 可以避免长参数列表，使得代码更加清晰易读；

- 构建器可以强制要求必需的参数，提高代码的安全性；

- 构建器可以返回不可变对象，提高代码的线程安全性。

3、使用私有构造函数或枚举类型创建单例

通过私有构造器或者枚举类型来实现 Singleton，它们的优点包括：

- 可以确保只有一个实例存在，提高代码的安全性；

- 可以缩小类的可访问性，提高代码的封装性；

- 可以让代码更加自然，避免使用静态方法和静态变量的限制。

4、用私有构造函数使类不可实例化

使用私有构造函数强制实现不可实例化的主要原因是防止类被意外地实例化，以使代码更加健壮和可靠。在某些情况下，我们只需要使用类中的静态方法和静态字段，而不需要创建该类的实例。

5、依赖注入优于硬编码资源

使用依赖注入比硬编码资源的优点：

1. 可测试性：使用依赖注入，很容易创建和注入模拟对象进行测试。这样，我们可以将正在测试的组件隔离开来，并专注于测试其行为，而不必担心其依赖项的行为。
2. 灵活性：使用依赖注入，我们可以轻松地用不同实现替换依赖项。这在需要更改组件的行为而不更改其代码时非常有用。
3. 解耦：依赖注入有助于将组件与其依赖项解耦，使代码更加模块化并易于维护。
4. 关注点分离：依赖注入将依赖项的创建和管理与组件本身分离，允许更清晰地分离关注点。

6、避免创建不必要的对象

7、排除过时的对象引用

在代码中及时清理不再使用的对象引用，以避免内存泄漏和性能问题。当一个对象不再需要时，应该尽快将其引用设置为 null，这样 JVM 可以及时回收它所占用的内存。

8、避免使用终结器和清除器

终结方法和清除方法是一种释放资源的方式，但是它们并不可靠，不应该依赖于它们来释放资源。应该使用 try-with-resources 结构或者显式的调用 close 方法来释放资源。

9、使用 try-with-resources 优于 try-finally

`try-with-resources` 语句是 Java 7 中引入的一种新语法，主要目的是为了简化资源管理的代码，并确保资源被正确地关闭，避免了资源泄漏和异常处理的问题。

### Python

- [Python 安装、构建、发布、下载和运行](/posts/2023/05/09/python-install-build-publish-run/)
- [Python 包和环境管理](/posts/2023/05/09/python-package-and-env-management/)

## 本周分享

大部分有意思的内容会分享在 『[ChenSoul Share](https://t.me/ichensoul)』Telegram 频道或者我的 [memos](https://memos.chensoul.cc/) 中。我写了一个 python 脚本从 memos 读取最近一周的 memos 记录。

- **2023-05-06** git flow 模型的提出：[查看链接](https://nvie.com/posts/a-successful-git-branching-model/) gitflow-avh 是一个增强工具：[查看链接](https://github.com/petervanderdoes/gitflow-avh) `#git` `#tool` `#memos`
- **2023-05-06** 又有哪家阅读管理网站可取代豆瓣读书 [查看链接](https://glennwoo.com/2022/07/29/about-reading-tracker-websites/) `#douban` `#memos`
- **2023-05-05** 分享一些阅人经验： 1. 嘴巴太快的人，往往没什么城府。嘴巴太甜的人，不可以深交。 2. 话少的人往往是两个极端，要么真的简单，要么深不可测。 3. 性格写在脸上的人，人品不会太差。能够控制情绪的人，往往不是一般人。 4. 开口就说“我有一个朋友怎样怎样”的人，往往单纯没啥真本事。 5. 不喜欢麻烦别人的人，通常也不喜欢被别人麻烦。一个不懂拒绝的人，也是一个不懂应酬的人。 6. 如果一个人可以做到潇洒而不合群，这人多半是个老江湖。如果一个人因不合群特别不自在，这人多半是社会小白。 7. 看地位高的大佬推荐什么人、用什么人，那这个大佬就是什么样的人。 8. 越是做事小心翼翼的人，越容易得罪人。反而霸气点的人，往往都会有三分薄面。 9. 善于巴结讨好别人的人，最好不要与之深交，否则必受其累。 10. 看起来一本正经、不苟言笑、斯斯文文的人，往往都比较闷骚。 11. 能在一定位置上的人，无论你多么讨厌他，一定有他某些过人之处。 12. 能够在一段感情失败后，很快走出来的人，要么没有真心付出，要么理性得可怕。 13. 想知道一个人品行如何，可以观察一下他培养出来的孩子。 14. 高度自律的人，往往对别人的要求也很高。 15. 年少得志，太容易获得成功的人，往往容易栽跟头。如果能扛过去并吸取教训，将来的成就会更大，否则容易掉入深渊。 16. 面对恭维或羞辱都不动声色的人，肯定是城府极深的狠角色。这种人千万别乱得罪，否则受到的反击会很突然很猛烈，下场会很惨。 `#摘录` `#memos`
- **2023-05-05** WoodpeckerCI 是一个由社区维护的 DroneCI 分支，使用 Apache License 2.0 许可证发布。社区版进一步扩展了 pipeline 的功能特性、支持对文件路径设置 pipeline 执行条件，并且可以与 Gitea 实现紧密集成。不同的是，DroneCI 的配置文件是 .drone.yml，WoodpeckerCI 重命名为了 .woodpecker.yml。好在 WoodpeckerCI 也兼容 DroneCI 的配置文件，迁移起来并不会太麻烦。 [查看链接](https://github.com/woodpecker-ci/woodpecker) `#memos` `#tool`
- **2023-05-04** git-flow[实战系列] [查看链接](https://blog.p2hp.com/archives/10929) `#memos` `#git` `#tool`
- **2023-05-04** 在 Node.js 生态系统中查找积极维护和流行的库 [查看链接](https://nodejstoolbox.com/) `#web` `#nodejs` `#memos`
- **2023-05-04** 可以用来取代 UUID, 效率更高, 支持自定义字符集 [查看链接](https://github.com/ai/nanoid) `#memos` `#tool`
- **2023-05-04** unDraw: 一个可以免费使用的插图库, 优势: 可免费商用/支持直接改色 [查看链接](https://undraw.co/illustrations) `#memos` `#tool`
- **2023-05-04** 临时文件上传服务 文件传输工具，上传的文件只保留 48 小时，过期自动删除 [查看链接](https://sendfiles.online/) Pixeldrain 免费文件分享，免费每个文件最大 20 GB per file，无广告。 [查看链接](https://pixeldrain.com/) TEMPORARY FILE HOSTING All uploaded files are automatically deleted after 60 minutes. [查看链接](https://tmpfiles.org/) Super simple file sharing! Upload as many files as you like up to 2 GB and get a link to share.（一次下载后，链接即过期） [查看链接](https://www.file.io/) Upload And Share (MP4, WEBM) Temporary Videos [查看链接](https://tempclip.com/) `#memos` `#tool`
- **2023-05-04** 适合编程时听的音乐 [查看链接](https://coderadio.freecodecamp.org/) [查看链接](https://www.programmersmusic.com/) `#memos` `#music`

以上。
