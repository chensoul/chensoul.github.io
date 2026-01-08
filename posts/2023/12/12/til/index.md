---
categories: [learning]
date: 2023-12-12 00:00:00 +0000 UTC
lastmod: 2023-12-12 00:00:00 +0000 UTC
publishdate: 2023-12-12 00:00:00 +0000 UTC
slug: til
tags: [rmi java]
title: 2023-12-12｜RMI、Java漏洞安全、Semgrep漏洞检测
---

Today I Learned. 今天我学了：RMI、Java漏洞安全、Semgrep漏洞检测。

## RMI

### 介绍

RMI（Remote Method Invocation）是Java语言提供的一种远程调用机制，用于在分布式系统中实现对象之间的远程通信。

通过Java RMI，开发人员可以像调用本地方法一样调用远程对象的方法。RMI隐藏了底层网络通信的复杂性，使得远程方法调用过程对于开发人员来说更加简单和透明。

### 发展历史

RMI（Remote Method Invocation）是Java语言提供的一种远程调用机制，它的发展历史可以追溯到上个世纪90年代。

以下是RMI的主要发展历程：

1. 初期版本（Java 1.1）：RMI最早出现在Java 1.1版本中，它提供了基本的远程调用功能，允许开发人员在分布式系统中使用Java对象进行远程方法调用。这个版本的RMI还比较简单，功能相对有限。
2. RMI-IIOP（Java 1.2）：随着Java 1.2版本的发布，Sun Microsystems（现在的Oracle）引入了RMI-IIOP（RMI over IIOP）的概念，将RMI与CORBA（Common Object Request Broker Architecture）进行了整合。RMI-IIOP使用IIOP（Internet Inter-ORB Protocol）作为底层的通信协议，使得Java对象能够与其他编程语言的对象进行交互。
3. JDK 1.3和1.4的改进：在JDK 1.3和1.4版本中，RMI得到了进一步改进和增强。其中包括对Java序列化机制的改进，提供了更好的兼容性和性能。此外，还引入了Java Activation Framework（JAF），用于处理传输的数据类型。
4. Java 5的增强：Java 5引入了一些重要的增强功能，如注解（Annotations）和泛型（Generics）。这些功能使得RMI的使用更加便捷和灵活。
5. Java 8和后续版本：在Java 8及其后续版本中，RMI并没有进行大规模的改动。然而，随着Java平台的不断发展和改进，RMI仍然是Java分布式系统中常用的远程调用机制之一。

### 架构

![img](../../../images/rmi-architecture-01.webp)

RMI架构包括以下几个核心组件：

1. 远程接口（Remote Interface）：远程接口定义了远程对象的方法列表，客户端可以通过该接口调用远程对象的方法。远程接口必须继承`java.rmi.Remote`接口，并声明可以被远程调用的方法。
2. 远程对象（Remote Object）：远程对象是实现了远程接口的Java对象。这些对象的方法可以通过RMI进行远程调用。远程对象必须继承`java.rmi.server.UnicastRemoteObject`类，并实现对应的远程接口。
3. 远程注册表（Remote Registry）：远程注册表是一个中央注册表，用于存储远程对象的引用。客户端可以查询远程注册表以获取远程对象的引用，并通过引用调用远程对象的方法。远程注册表使用RMI注册表服务（`rmiregistry`）来实现。
4. Stub（存根）和Skeleton（骨架）：Stub和Skeleton是RMI的关键组件，用于在客户端和服务器之间进行通信。Stub是客户端的代理，它负责将客户端的方法调用转发到远程对象。Skeleton是服务器端的代理，它负责接收客户端的方法调用并将其转发给实际的远程对象。
5. RMI协议（RMI Protocol）：RMI协议定义了客户端和服务器之间的通信协议，包括请求、响应、参数传递和序列化等细节。RMI协议使用Java序列化来对对象进行编码和解码，以实现对象在网络上的传输。

![img](../../../images/rmi-architecture-02.webp)

RMI架构的基本工作流程如下：

1. 服务器端将远程对象注册到远程注册表中。
2. 客户端从远程注册表中获取远程对象的引用。
3. 客户端通过引用调用远程对象的方法。
4. 客户端的方法调用被转发到服务器端的远程对象。
5. 服务器端的远程对象执行相应的方法，并将结果返回给客户端。
6. 客户端接收到方法的返回值。

> 在JDK 1.2版本（1998）之后，骨架skeleton不再被需要, 由Java的UnicastServerRef#dispatch替代；在JDK 5 （大家常说的1.5）之后，不再需要手动利用rmic命令生成静态Stub，而是会由Java自动地动态生成。这个动态生成也是我们后面JNDI注入的关键。

### RMI漏洞

RMI（Remote Method Invocation）在过去的一段时间中曾发现一些安全漏洞，这些漏洞可能会导致安全风险。以下是一些常见的RMI漏洞：

1. 反序列化漏洞：RMI使用Java序列化机制来在网络上传输对象。然而，如果不正确地处理反序列化过程，攻击者可能通过构造恶意序列化数据来执行远程代码。这种漏洞被广泛称为"Java反序列化漏洞"或"Java反序列化攻击"，并且不仅仅影响RMI，还可能影响其他使用Java序列化的技术。
2. 未授权访问漏洞：RMI服务默认情况下可能没有进行适当的身份验证和授权检查。这可能导致攻击者能够未经授权地访问远程对象和调用方法，从而造成安全风险。
3. 注册表绕过漏洞：RMI使用注册表（Registry）来存储远程对象的引用。攻击者可能通过绕过注册表或篡改注册表中的引用，来执行恶意操作或替换原始对象。
4. 未加密的通信漏洞：如果RMI的通信过程没有适当地加密和保护，攻击者可能能够窃听、篡改或重放网络通信，从而获取敏感信息或执行中间人攻击。

为了缓解这些漏洞的风险，建议采取以下安全措施：

- 及时更新和升级使用的Java运行时环境，以获取最新的安全修复程序。JDK 8u121引入了对RMI漏洞的修复。
- 在反序列化过程中谨慎处理输入数据，避免接受未受信任的序列化数据。
- 实施适当的身份验证和授权机制，确保只有经过授权的用户可以访问和调用远程对象。
- 使用安全协议（如SSL/TLS）对RMI通信进行加密和保护。
- 配置和限制RMI的网络访问，仅允许受信任的主机和端口进行通信。
- 对RMI注册表进行安全配置，限制对注册表的访问权限。

### RMI用到的技术

1. Java序列化（Serialization）：RMI使用Java序列化来实现对象在网络上的传输。Java序列化机制允许将Java对象转换为字节流表示，以便在网络上进行传输。RMI使用Java序列化将方法调用和参数编码为字节流，并在客户端和服务器之间进行传输。
2. Java网络通信（Network Communication）：RMI使用Java的网络通信机制来在客户端和服务器之间进行远程调用的传输。RMI支持多种底层传输协议，如JRMP（Java Remote Method Protocol）和IIOP（Internet Inter-ORB Protocol）。这些协议负责将编码的方法调用和参数传输到远程对象，并将结果返回给客户端。
3. 代理。Stub和Skeleton是RMI中的代理组件。Stub是客户端的代理，Skeleton是服务器端的代理。Stub负责将客户端的方法调用转发到远程对象，而Skeleton接收客户端的方法调用并将其转发给实际的远程对象。Stub和Skeleton处理了网络通信、参数编组和解组等细节，使得远程调用过程对开发人员透明。

## Java漏洞

### 文章

- [关于Java中RMI的个人拙见](https://chenlvtang.top/2021/07/09/%E5%85%B3%E4%BA%8EJava%E4%B8%ADRMI%E7%9A%84%E4%B8%AA%E4%BA%BA%E6%8B%99%E8%A7%81/)

- [Java JNDI其它注入点分析](http://nekopunch.cn/?p=1470) 
- [Java JNDI注入源码分析](http://nekopunch.cn/?p=1417) 
- [Java RMI反序列化&JNDI注入](http://nekopunch.cn/?p=769) 
- [JNDI 注入漏洞的前世今生](https://evilpan.com/2021/12/13/jndi-injection/)
- [攻击Java中的JNDI、RMI、LDAP\(一\)](https://y4er.com/posts/attack-java-jndi-rmi-ldap-1) 
- [攻击Java中的JNDI、RMI、LDAP\(二\)](https://y4er.com/posts/attack-java-jndi-rmi-ldap-2) 
- [攻击Java中的JNDI、RMI、LDAP\(三\)](https://y4er.com/posts/attack-java-jndi-rmi-ldap-3) 
- [攻击Java Web应用-[Java Web安全]](https://javasec.org/)

### 视频

- [B站最全的Java安全学习路线](https://www.bilibili.com/video/BV1Sv4y1i7jf/)
- [Java反序列化RMI专题-没有人比我更懂RMI](https://www.bilibili.com/video/BV1L3411a7ax/)

### 博客

- https://paper.seebug.org/

- https://su18.org/
- https://www.03sec.com/
- https://y4er.com/
- https://evilpan.com/
- http://nekopunch.cn/
- https://4ra1n.github.io/
- https://chenlvtang.top/
- https://www.yulegeyu.com/

### 社区

- https://xz.aliyun.com/
- https://web.sqlsec.com/

## Semgrep

semgrep 是一款由Facebook开源的白盒代码扫描工具，项目地址：https://github.com/returntocorp/semgrep，其规则编写简单，易用，扫描速度快。相较于CodeQL 而言，入门门槛较低，编写规则简单，且非常方便地接入到CI流程中。

### 安装步骤

方式一、mac机器上可使用 homebrew 安装：

```bash
brew install semgrep
```

方式二、Ubuntu / Windows via WSL / Linux / macOS 也可以使用pip进行安装：

```bash
python3 -m pip install semgrep
```

方式三、Docker部署:

```bash
docker pull returntocorp/semgrep:latest
```

semgrep 有 Pro 版本与社区版本两个版本，使用下面命令可以登陆 Pro 版本：

```bash
semgrep login
```

根据输出访问对应的链接进行登陆。

终端获得 token 之后，就可以安装 pro 引擎了。

```bash
semgrep install-semgrep-pro
```

安装完后可以使用 `--pro` 参数调用 pro 引擎。

```bash
semgrep --pro --config "p/default"
```

### 使用

```bash
git clone https://github.com/WebGoat/WebGoat
semgrep -c p/sql-injection WebGoat -o WebGoat.json --json
```

说明：

- `-o`：输出扫描结果到文件
- `--json`：指定输出 json 格式文件。可以输出json格式/xml/sarif 等格式

- `--config`：配置扫描规则文件 官方也提供了一些规则文件，在 https://semgrep.dev/r 里可以查看各种分类的规则集。

输出结果如下：

```bash

┌─────────────┐
│ Scan Status │
└─────────────┘
  Scanning 1048 files (only git-tracked) with 103 Code rules:

  CODE RULES

  Language   Rules   Files          Origin      Rules
 ──────────────────────────        ───────────────────
  java          16     279          Pro rules      55
  js            10      82          Community      48


  SUPPLY CHAIN RULES

  💎 Run `semgrep ci` to find dependency
     vulnerabilities and advanced cross-file findings.


  PROGRESS

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:03


┌──────────────┐
│ Scan Summary │
└──────────────┘
Some files were skipped or only partially analyzed.
  Scan was limited to files tracked by git.
  Scan skipped: 87 files matching .semgrepignore patterns
  For a full list of skipped files, run semgrep with the --verbose flag.

Ran 26 rules on 361 files: 13 findings.
➜  IdeaProjects semgrep install-semgrep-pro

Semgrep Pro Engine will be installed in /opt/homebrew/Cellar/semgrep/1.52.0/libexec/lib/python3.11/site-packages/semgrep/bin/semgrep-core-proprietary
Downloading... ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 159.6/159.6 MB 7.6 MB/s 0:00:00

Successfully installed Semgrep Pro Engine (version 3e84760)!
```

### 注意隐私策略

根据官方的隐私策略 [Semgrep Privacy Policy - Semgrep](https://semgrep.dev/docs/metrics/) 的相关描述。

```bash
$ semgrep --config=myrule.yaml  # → no metrics (loading rules from local file)
$ semgrep --config=p/python     # → metrics enabled (fetching Registry)
$ semgrep login && semgrep ci   # → metrics enabled (logged in to semgrep.dev)
```

1. 当仅使用本地配置文件或命令行搜索模式运行时，官方不会收集相关信息。
2. 当使用 Registry 中的规则时，官方会收集所需数据以帮助维护人员完善规则。
3. 当使用云平台时，官方也会收集这些数据，并且将结果存放在云平台中。

收集数据的具体内容可见：[Data collected as metrics](https://semgrep.dev/docs/metrics/#data-collected-as-metrics)

用户也可以通过指定 `--metrics` 选项来控制数据的发送。

```bash
--metrics auto：（默认）每当从 Semgrep 注册表中提取规则时都会发送
--metrics on：每次 Semgrep 运行时都会发送
--metrics off：永远不会发送
```

如果有隐私考虑的话，建议离线使用规则库，并添加 `--metrics off` 参数。

### 参考

- [轻量级代码审计工具: Semgrep](https://xz.aliyun.com/t/12696)
- [https://github.com/chenlvtang/CodeReview-Java](https://github.com/chenlvtang/CodeReview-Java) 使用 Semgrep 规则检测开源 CMS 系统的漏洞



-- EOF

