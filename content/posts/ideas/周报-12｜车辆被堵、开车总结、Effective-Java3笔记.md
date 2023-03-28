---
title: "周报-12｜车辆被堵、开车总结、Effective Java3笔记"
date: 2023-03-28 09:00:00
draft: false
slug: weekly_review_12
categories: [Ideas]
tags: [review,java,go]
authors:
- chensoul 
---

## 前言

![weekly-review-12-01](https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-12-01.jpeg)



本篇是对 `2023-03-20` 到 `2023-03-26` 这周生活的记录与思考。首发在我的个人 [博客](https://blog.chensoul.com/)，你可以移步了解更多或者给我留言。



上周去同济医院检查鼾症，检查结果是轻度症状，医生建议多运动减肥。这周每天走路 1 万步的目标已达成。

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-12-02.png" alt="weekly-review-12-02" style="width:50%;" />



工作上发布了一个版本，另外两个迭代正在进行中，预计这周再发布一个版本。从飞书通讯录看到又有三个非技术类同事被裁，这周周会，部门领导说最近又有一个做商务的同事被优化了。



上周有一天早上，车子停在小区里面，被两个车子挡住了前后道路，联系不上车主，只好坐地铁上班。话说，自从开车上班之后，使用手机的频率明显降低了很多。



上周末阳光正好，于是回家去给已故的亲人扫墓。周六回老家，周日回老婆家。逝者已逝，活着的人要善待自己，好好吃饭，好好睡觉，好好工作，好好运动。

<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-12-03.jpeg" alt="weekly-review-12-03" style="width:50%;" />

## 工作

### Effective Java 3 笔记

#### 1、考虑以静态工厂方法代替构造函数

使用公共静态工厂方法返回一个类的实例。例如：

```java
public static Boolean valueOf(boolean b) {
	return b ? Boolean.TRUE : Boolean.FALSE;
}
```

**静态工厂方法与构造函数相比，有以下优点：**

- **静态工厂方法有确切名称**。例如，BigInteger 类提供了一个返回素数的静态工厂方法 `BigInteger.probablePrime` 。

- **静态工厂方法不需要在每次调用时创建新对象**。这种技术类似于享元模式。如果经常请求相同的对象，特别是在创建对象的代价很高时，它可以极大地提高性能。

- **可以通过静态工厂方法获取返回类型的任何子类的对象**。例如，Java 的 Collections 框架有 45 个接口实用工具实现，提供了不可修改的集合、同步集合等。几乎所有这些实现都是通过一个非实例化类（`java.util.Collections`）中的静态工厂方法导出的。返回对象的类都是私有的子类。

- **静态工厂方法返回的对象的可以随传入参数的不同而变化。**例如：EnumSet 类没有公共构造函数，只有静态工厂方法。它的 noneOf 方法返回的对象取决于底层 enum 类型的长度。如果长度小于 64，则发回一个  long 类型的 RegularEnumSet；否则返回一个 `long[]` 类型的 JumboEnumSet。

- **静态工厂方法返回对象的类可以不存在。**这是服务提供者框架的基础。

  > 服务提供者框架中有三个基本组件：服务接口，代表要实现的服务；提供者注册 API，提供者使用它来注册实现，以及服务访问 API，客户端使用它来获取服务的实例。服务访问 API 允许客户端指定选择实现的标准。在没有这些条件的情况下，API 返回一个默认实现的实例，或者允许客户端循环使用所有可用的实现。服务访问 API 是灵活的静态工厂，它构成了服务提供者框架的基础。
  >
  > 服务提供者框架的第四个可选组件是服务提供者接口，它描述了产生服务接口实例的工厂对象。在没有服务提供者接口的情况下，必须以反射的方式实例化实现。
  >
  > 在 JDBC 中，`Connection` 扮演服务接口的角色。`DriverManager.registerDriver` 是提供者注册的 API，`DriverManager.getConnection` 是服务访问 API，`Driver` 是服务提供者接口。
  >
  > 服务提供者框架模式有许多变体。例如，服务访问 API 可以向客户端返回比提供者提供的更丰富的服务接口，这是桥接模式。依赖注入框架可以看作是强大的服务提供者。由于是 Java 6，该平台包括一个通用服务提供者框架 `Java.util.ServiceLoader`，所以你不需要，通常也不应该自己写。JDBC 不使用 ServiceLoader，因为前者比后者要早。



**仅提供静态工厂方法的主要局限**：

- **没有公共或受保护构造函数的类不能被子类化。** 例如，不可能在集合框架中子类化任何方便的实现类。

  > 它鼓励程序员使用组合而不是继承，并且对于不可变的类型是必需的。

- **程序员很难找到它们**。



一些静态工厂方法的常用名称：

- from，一种型转换方法，该方法接受单个参数并返回该类型的相应实例，例如：

  ```java
  Date d = Date.from(instant);
  ```

- of，一个聚合方法，它接受多个参数并返回一个包含这些参数的实例，例如：

  ```java
  Set<Rank> faceCards = EnumSet.of(JACK, QUEEN, KING);
  ```

- valueOf，一种替代 from 和 of 但更冗长的方法，例如：

  ```java
  BigInteger prime = BigInteger.valueOf(Integer.MAX_VALUE);
  ```

- instance 或 getInstance，返回一个实例，该实例由其参数（如果有的话）描述，但不具有相同的值，例如：

  ```java
  StackWalker luke = StackWalker.getInstance(options);
  ```

- create 或 newInstance，与 instance 或 getInstance 类似，只是该方法保证每个调用都返回一个新实例，例如：

  ```java
  Object newArray = Array.newInstance(classObject, arrayLen);
  ```

- getType，类似于 getInstance，但如果工厂方法位于不同的类中，则使用此方法。其类型是工厂方法返回的对象类型，例如：

  ```java
  FileStore fs = Files.getFileStore(path);
  
  Runtime runtime = Runtime.getRuntime();
  ```

- newType，与 newInstance 类似，但是如果工厂方法在不同的类中使用。类型是工厂方法返回的对象类型，例如：

  ```java
  BufferedReader br = Files.newBufferedReader(path);
  ```

- type，一个用来替代 getType 和 newType 的比较简单的方式，例如：

  ```java
  List<Complaint> litany = Collections.list(legacyLitany);
  ```

  

### Machine-Learning-With-Go

B站视频：[「课程」使用Go做机器学习](https://www.bilibili.com/video/BV1iW411w7ev)

源代码：[Machine-Learning-With-Go](https://github.com/PacktPublishing/Machine-Learning-With-Go)



## 生活

### 车辆被堵

早上准备开车上班，发现车子前后道路都被车辆占道了。前面车辆占道，昨天晚上下班回来就发现了，也确认了这个车辆没有留挪车电话。当时就隐隐担忧今天早上会被挡住前后道路。没有想到，真的被挡了。后面的车辆留了挪车电话。六点半开始，我就给后面车的车主打电话发短信，对方一直没接电话，估计手机调静音还在睡觉吧。没有想到的是，截止到现在时间八点，他还没有给我回电话，这哥们睡得那是真香啊。



在道路被占用之后，我做了什么？除了给留了号码的那个车主打电话之外，我还想到交管 12123 APP 上面有一个一键挪车功能。于是，试了一下这个功能。原以为这个功能可以电话通知到对方挪车。实际情况却只是提交了一个工单而已，真是一个鸡肋的功能。用户使用这个功能，是希望及时联系到车主过来挪车，而不是提交一个工单之后，傻傻的等待。另外，这个功能也不能叫一键挪车，因为点击了这个功能之后，还要输入车牌号、上传照片。更好的体验应该是只用上传占用道路的车辆照片，由系统识别出车牌号，然后后台找到车主的手机号，生成一个临时号码并调用手机的拨号功能。



<img src="https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-12-04.jpeg" alt="weekly-review-12-04" style="width:50%;" />



在道路被占用之后，我的心态是怎样的？刚开始想生气愤怒，后来想了想，事已至此，没有必要生气，生气只能影响自己一天的心情和好运。并尝试把这种对自己不利的一面转化为对自己有利的一面。原想六点半开车上班，道路被占之后，就可以体验一下七点多甚至八点多开车上班需要多长时间以及是否堵车。

如果是我把道路占用了，我该怎么做呢？首先，是车上留一个手机号码；其次，是第二天早上保证手机不关机并且没有静音。

如何避免再次出现这样的情况呢？一是通过电话或者便条的形式提醒车主要在车上留一个挪车电话并保证电话畅通，二是反馈给物业让物业来提醒小区里的车主不要随意占用车道。



### 开车总结

学到了新知识：

- 学会了如何调节前灯的高度。数字越大，灯光照射的越近。



开车需要改进的地方：

- 1、今天在菜场点火的时候，错把油门当刹车
- 2、准备加速超过左边货车的时候，货车打了右前灯，下意识地把方向盘向右打了一点
- 3、遇到红绿灯变黄灯时，刹车太急。想冲过去，但犹豫了。这样做太危险，不能存在侥幸心理。下次遇到这种情况，宁可提前刹车，等红灯过了，再向前行驶。



## 好物分享

虽然大部分有意思的内容会分享在 『[ChenSoul Share](https://t.me/chensoul_share)』Telegram 频道，不过还是挑选一部分在这里列举一下，感觉更像一个 newsletter 了。

### 一些文章

- [做了 6 年程序员，我学到的 10 条经验](https://lutaonan.com/blog/things-i-learnt-after-6-years-as-software-engineer/)

- [JetBrains 常用插件](https://mritd.com/2021/06/06/jetbrains-plugins/)
- [v2ray + warp-go 非全局使用Cloudflare WARP解锁New Bing等服务](https://blog.skyju.cc/post/v2ray-warp-go-unlock-new-bing/)
- [如何创建属于自己的私人资料库与私人搜索引擎 _](https://blog.17lai.site/posts/8f152670/)
- [如何高效地协作开发：一些 Google 的实践](https://1byte.io/google-large-scale-dev/)
- [Java高性能缓存库Caffeine](https://jasonkayzk.github.io/2023/03/28/Java%E9%AB%98%E6%80%A7%E8%83%BD%E7%BC%93%E5%AD%98%E5%BA%93Caffeine/)

### 一些工具

- [优设导航官网](https://hao.uisdc.com/)：设计导航2013年上线至今，是优设网旗下最专业好用的设计师导航网站！设计导航为设计师提供UI设计、设计教程、素材下载、高清图库、配色方案、App设计、网页设计等设计网站导航指引。设计导航每周更新，设计风向标就看优设网！

- [Zeabur 属于国人的免费托管平台](https://dusays.com/567/)

- [Neovim 使用体验](https://luyuhuang.tech/2023/03/21/nvim.html)
- [Github Copilot免费平替 - Codeium](https://www.domon.cn/github-copilotmian-fei-ping-ti-codeium/)
- [Chat with documents](https://chatdoc.com/)
- [Codeium](https://codeium.com/)：一款免费的类 Github Copilot 的 AI 代码辅助产品，可以便捷的和 AI 进行结对编程。初步使用下来和主流的 IDE 的集成很好，感兴趣的朋友可以先到[浏览器里在线尝试一番](https://codeium.com/playground)。

![codeium](https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/weekly-review-12-05.jpeg)



### 一些视频

- 飚速宅男第五季
- 魔女



以上。
