---
title: "[译]Java和WebSockets：构建可靠的实时应用程序"
date: 2024-05-07
type: post
slug: websockets-java
categories: ["Java"]
tags: [ websocket]
---

原文：[https://ably.com/topic/websockets-java](https://ably.com/topic/websockets-java)



在全球范围内，人们对实时传输数据的需求不断增长，[WebSocket](https://ably.com/topic/websockets)可能是此类用例中最流行的传输协议。在 WebSocket 出现之前，“实时”网络已经存在，但它很难实现，通常速度较慢，并且是通过破解现有的网络技术来实现的，而这些技术并不是为实时应用程序设计的。 WebSocket 协议为真正的实时网络铺平了道路。

Java是一种流行的编程语言和计算语言。它是 Android 智能手机应用程序的核心编程语言之一，是构建实时系统的可靠选择。 WebSockets 成为 Java 标准版 SDK 的一部分已经有一段时间了。WebSocket 协议最初是在 2013 年作为[JSR 356](https://www.oracle.com/technical-resources/articles/java/jsr356.html)的一部分提出的，目前已作为[javax.websocket](https://docs.oracle.com/javaee/7/api/index.html?javax/websocket/package-summary.html)包的一部分包含在 Java SDK 中。

由于对实时数据的需求正在稳步增长，并且 Java 已成为一种成熟且广泛使用的语言/平台，因此我认为值得考虑为**Java 客户端**应用程序实现[可靠的](https://ably.com/four-pillars-of-dependability) WebSocket 解决方案所面临的众多挑战。

## 现状——简要概述

基本或原始的 WebSocket 实现很少能够满足为未知（但可能非常多）数量的用户提供服务的实时应用程序的需求。大多数时候，您需要考虑扩展 Java 客户端 WebSocket 实现的功能。 

为此，您可以使用[nv-websocket-client](https://github.com/TakahikoKawasaki/nv-websocket-client)等开源库，其中包含一些附加功能，例如代理支持。这是使用 nv-websocket-client 创建 WebSocket 实例的方法：

```Java
/ Create a WebSocket. The scheme part can be one of the following:
/ 'ws', 'wss', 'http' and 'https' (case-insensitive). The user info
/ part, if any, is interpreted as expected. If a raw socket failed
/ to be created, an IOException is thrown.
WebSocket ws = new WebSocketFactory().createSocket("ws://localhost/endpoint");
```

创建 WebSocket 实例后，下一步是注册侦听器以接收 WebSocket 事件：

```Java
/ Register a listener to receive WebSocket events.
ws.addListener(new WebSocketAdapter() {
    @Override
    public void onTextMessage(WebSocket websocket, String message) throws Exception {
        / Received a text message.
        ......
    }
});
```

最后，这是连接到服务器并监视连接事件的方式：

```Java
try
{
    / Connect to the server and perform an opening handshake.
    / This method blocks until the opening handshake is finished.
    ws.connect();
}
catch (OpeningHandshakeException e)
{
    / A violation against the WebSocket protocol was detected
    / during the opening handshake.
}
catch (HostnameUnverifiedException e)
{
    / The certificate of the peer does not match the expected hostname.
}
catch (WebSocketException e)
{
    / Failed to establish a WebSocket connection.
}
```

然而，虽然像 nv-websocket-client 这样的库确实提供了一些好处，但它们本质上只是 WebSocket 客户端的包装器；它们不提供任何功能。

为了充分利用 WebSocket，通常会使用构建在 WebSocket 之上的协议，该协议可实现更丰富的功能，例如 pub/sub。您可以选择开发自己的基于 WebSocket 的协议，专门根据您的需求定制。然而，这是一项非常复杂且耗时的工作。大多数时候，您最好使用已建立的基于 WebSocket 的解决方案，该解决方案已做好处理整套工程复杂性的准备。 

在[Ably](https://www.ably.com/)，我们有一个在 WebSocket 之上使用的 pub/sub 协议。它允许您使用一组更高级别的功能通过 WebSocket 进行通信。为了证明它是多么简单，下面是如何将数据发布到 Ably 的示例：

```Java
AblyRealtime ably = new AblyRealtime("ABLY_API_KEY");
Channel channel = ably.channels.get("test");

/* Publish a message to the test channel */
channel.publish("greeting", "hello");
```

以下是客户端连接到 Ably 来使用数据的方式：

```Java
AblyRealtime ably = new AblyRealtime("ABLY_API_KEY");
Channel channel = ably.channels.get("test");

/* Subscribe to messages on channel */

MessageListener listener;
listener = new MessageListener() {
  @Override
  public void onMessage(Message message) {
    System.out.print(message.data);
  }};
};
channel.subscribe("greeting", listener);
```

从上面的代码片段中可以看出，虽然通信是通过 WebSocket 完成的，但底层的 WebSocket 协议对开发人员来说是“隐藏”的。

您可以决定使用任何支持 Java 的基于 WebSocket 的协议。不过，无论您如何选择，您都需要考虑在 WebSocket 方面将面临的所有挑战。 



## WebSockets 和 Java：您需要考虑的事项

在开始之前，我必须强调，本文仅关注为**Java 应用程序构建可靠的基于 WebSocket 的解决方案所面临的客户端挑战**。我假设您已经决定要在服务器端使用什么解决方案。如果还没有，您可以使用[Socket.IO](https://www.ably.com/concepts/socketio)等开源库，或 Ably 等基于云的解决方案。

还值得一提的是，我写这篇文章的基础是 Ably 团队所拥有的关于通过 WebSocket 进行实时通信的挑战的广泛集体知识。

我现在将深入探讨您需要考虑的关键问题，例如身份验证、网络兼容性或处理连续性重新连接。如果您要构建一个可靠的系统，您的客户端 WebSocket 实现必须能够有效地处理所有这些复杂性。



### 您真的需要 WebSocket 吗？

WebSocket 是最流行和可移植的实时协议。它通过单个 TCP 连接提供全双工通信。 WebSocket 对于许多用例来说都是一个不错的选择，例如金融行情、聊天解决方案或基于位置的应用程序等等。但这并不是唯一可用的选择。在加入 WebSocket 潮流之前，您应该查看现有的替代方案，以确保它们不是更适合您的用例。

例如，还支持双向通信的[MQTT](https://www.ably.com/topic/mqtt)是电池寿命有限的物联网设备以及带宽昂贵或低、稳定性不可预测或延迟高的网络的首选协议。另一个例子是[SSE](https://www.ably.com/topic/server-sent-events)，从实现和使用的角度来看，这是一种轻量级协议。对于大多数单向通信就足够的基于浏览器的场景（例如用户订阅基本新闻源）来说，它是一个更好的替代方案。 

WebSocket、MQTT 和 SSE 都是基于 TCP 的协议。 TCP 被设计为可靠的传输层协议，提供消息传递和排序保证。这对于许多实时用例来说非常有用。但对于其他用例，轻量级、更快的协议是更好的选择。例如，如果您的目的是传输视频数据，那么最好使用 UDP 作为传输层协议。

即使 WebSocket 是满足您需求的不错选择，但根据架构的复杂性以及您想要通过系统实现的目标，您可能希望能够灵活地使用多个协议，每个协议对应一个特定的用例。 

### 验证

一般来说，最好只允许经过身份验证的用户使用 WebSocket 连接。但是，原始 WebSocket 请求没有标头，因此您无法像使用 HTTP 请求那样提供身份验证。这就是为什么您需要使用其他组件或服务进行身份验证。 

客户端 WebSocket 库可能是一种选择，但在选择时要小心，因为并非所有库都提供身份验证机制（或者即使提供，也可能非常有限）。或者，您可以构建自己的身份验证服务。不过，大多数时候，您最好使用成熟的、功能丰富的解决方案，例如实时消息传递平台，它不仅可以处理身份验证，还可以处理与通过 WebSocket 传输数据流相关的一整套工程复杂性。

现在让我们看看可以通过 WebSocket 使用的最常见的身份验证机制。第一个是**基本身份验证**，是最简单的可用选项（也是最不安全的选项），它涉及 API 密钥的使用。凭据通常作为 URL 中的查询参数传递，如下所示：

```
wss://realtime.ably.com/?key=MY_API_KEY&format=json&heartbeats=true&v=1.1&lib=js-web-1.2.1
```

从安全角度来看，建议仅使用服务器端的基本身份验证，因为将 API 密钥暴露给多个客户端是非常不安全的。理论上，如果您在客户端使用在给定时间后过期的临时 API 密钥，则可以将它们被泄露的风险降至最低。然而，实际上，一旦密钥过期，包含临时 API 密钥的 URL 就会被破坏。此外，请求日志记录服务将捕获服务器日志中的 API 密钥。因此，每次刷新 API 密钥时，您都必须打开一个新的 WebSocket 连接。这不是一种可扩展的方法。

**基于令牌的身份验证**是另一种广泛使用的身份验证机制。最流行的基于令牌的身份验证方法之一称为[JSON Web 令牌](https://tools.ietf.org/html/rfc7519)(JWT)。它是一种开放且灵活的格式，已成为行业标准。在基本层面上，JWT 的工作原理如下图所示：



![img](../../../static/images/jwt-diagram-v1.1_2x.webp)

1. 客户端向授权服务器发送授权请求。
2. 授权服务器向客户端返回访问令牌。
3. 客户端使用访问令牌访问受保护的资源。

JWT 是推荐的客户端策略，因为它提供比基本身份验证更细粒度的访问控制，并限制凭据暴露或泄露的风险。此外，除了 JWT 在设计上是短暂的之外，它们还可以被撤销。 

虽然 JWT 显然比基本身份验证更可靠、更安全，但如果您决定开发自己的基于 JWT 的身份验证解决方案，则它们会带来一些工程挑战，您必须应对这些挑战：

- 您如何处理令牌特权和权限？
- 如何设置TTL（生存时间）？
- 如何更新令牌？
- 代币如何发送？如果是通过 URL，您需要一种机制，允许您在令牌过期时更新令牌，而无需启动新的 WebSocket 连接。

### 网络兼容性和后备传输

尽管有广泛的平台支持，但 WebSocket 仍面临一些网络问题。主要的就是代理遍历。例如，某些服务器和公司防火墙会阻止 WebSocket 连接。

端口 80 和 443 是 Web 访问的标准端口，它们支持 WebSocket。请注意，端口 80 用于不安全的连接。考虑到这一点，建议尽可能使用 WebSocket 端口 443，因为它是安全的，并且可以防止代理检查连接。如果您必须（或希望）在不同端口上运行 WebSocket，通常需要进行网络配置。 

也就是说，如果您无法使用端口 443，并且您预见客户端会从公司防火墙内部或其他棘手的来源进行连接，则您可能需要支持后备传输，例如 XHR 流、XHR 轮询或 JSONP 轮询。这就是为什么您需要使用支持回退的基于 WebSocket 的客户端解决方案。该解决方案可以采取多种形式；您可以选择专门设计用于提供大量后备功能的开源库，例如[SockJS](https://github.com/sockjs/sockjs-client#supported-transports-by-name)。 

或者，您*可以构建自己的复杂后备功能，但实际上必须*这样做的场景非常罕见。开发定制解决方案是一个复杂的过程，需要花费大量的时间和精力。在大多数情况下，为了将工程复杂性降至最低，您最好使用提供后备选项的现有基于 WebSocket 的解决方案。

### 设备电源管理和心跳

就其本质而言，WebSocket 连接是持久的。这也意味着只要它处于活动状态，就会消耗电池寿命。随着 WebSocket 获得各种开发平台和编程语言（包括 Java）的支持，设备电源管理成为必须考虑的问题。不幸的是，许多 Java WebSocket 库都没有处理它。

有多种方法可以实现电池管理和心跳。 WebSocket 协议本身支持称为 Ping 和 Pong 的[控制帧](https://tools.ietf.org/html/rfc6455#section-5.5)。这是一种应用程序级别的心跳机制，可让您检测 WebSocket 连接是否处于活动状态。通常，服务器端发送 Ping 帧，客户端收到后将 Pong 帧发送回服务器。

理论上，您还可以使用协议级心跳 - TCP keepalive。然而，这是一个不太理想的选择，因为 TCP keepalive 不会通过网络代理。换句话说，使用 TCP keepalive，您无法始终验证端到端连接。 

请注意，您发送的心跳越多，电池耗尽的速度就越快。这可能会带来很大的问题，尤其是在涉及移动设备时。在这些情况下，为了延长电池寿命，您可能希望尽可能使用操作系统本机推送通知。使用这种方法，无需保持 WebSocket 连接处于活动状态，因为只要您发送推送通知，服务器就可以唤醒应用程序的非活动实例。 

虽然推送通知是唤醒应用程序的绝佳选择，但它们并不能替代 WebSocket 或流协议层，因为它们不提供服务质量保证。推送通知通常是短暂的，具有可变的延迟，并且没有顺序。此外，在任何给定时刻，通常可以排队等待传送的推送通知数量有限。

在决定是否使用心跳、推送通知或同时使用两者之前，您必须仔细分析您的系统要求和用例。例如，如果您正在开发聊天解决方案或多人游戏，您希望频繁发送心跳，即使这意味着电池寿命会更快耗尽。另一方面，如果您正在开发在线商店并且希望偶尔通知客户有关新产品的信息，您可能需要使用推送通知来实现此特定目的。推送通知将更好地延长电池寿命，即使这意味着您的连接状态检测不会那么准确。

### 连续性地处理重新连接

设备经常经历不断变化的网络状况。设备可能会从移动数据网络切换到 Wi-Fi 网络、穿过隧道，或者可能会遇到间歇性网络问题。像这样的突然断开连接场景需要重新建立 WebSocket 连接。

对于某些实时用例，在中断后准确地从中断位置恢复流至关重要。想想实时聊天等功能，在断开连接期间丢失消息会导致混乱和沮丧。您需要确保您的客户端 WebSocket 实现能够处理重新连接的复杂性。实现还应该提供恢复流的方法并提供一次性传送保证。

如果在短暂断开连接后准确地恢复流对于您的用例很重要，那么您需要实现**历史/持久数据**。详细介绍超出了本文的范围（有关更多信息，请参阅此[博客文章](https://www.ably.com/blog/implementing-stream-continuity-distributed-realtime-system/)），但您需要考虑以下一些事项：

- **在前端内存中缓存消息。**您存储了多少条消息以及存储多长时间？
- **将数据移至持久存储。**您需要将数据移动到磁盘吗？如果是这样，您会保存多长时间？你把它存放在哪里？客户端重新连接后将如何访问这些数据？
- **恢复流。**当客户端重新连接时，您如何知道要恢复哪个流以及确切地从哪里恢复它？您是否需要使用连接 ID 来确定连接中断的位置？谁需要跟踪断开的连接 - 客户端还是服务器？
- **退避机制**。您的增量退避策略是什么？在有大量客户端不断尝试（但失败）重新建立连接的情况下，如何防止服务器过载？

您甚至可能会考虑 WebSockets 是否是您真正需要的。如果您的用例不需要双向消息传递，而是仅订阅，那么像[SSE](https://ably.com/topic/server-sent-events)这样带有流恢复功能的协议可能是更好的选择。 

## 最后的想法

希望本文能够向您展示，如果您希望在 Java 中实现可靠的 WebSocket 客户端，您将面临许多挑战。即使对于基本用例，原始 WebSocket 也远远不够。如果您想可靠地扩展系统并为最终用户提供最佳体验，您很可能必须使用功能丰富的 WebSocket 解决方案。

在 Ably，我们主要使用我们自己的基于 WebSocket 的协议来实时提供同步数字体验，该协议在性能、可移植性和可靠性之间提供了适当的平衡。我们的全球分布式且完全托管的平台可以轻松有效地设计、快速交付和无缝扩展直接交付给最终用户的关键实时功能。 

如果您希望使用 WebSockets 和 Java 构建值得信赖的 Web 应用程序，那么使用 Ably，您可以在几分钟内启动并运行。[尝试一下我们的 API](https://ably.com/signup)。

**进一步阅读**

多年来，我们撰写了大量有关实时事件驱动系统和 WebSocket 等主题的文章。以下是一些有用的资源供您探索：

- [The WebSocket Handbook: learn about the technology behind the realtime web](https://ably.com/resources/ebooks/websocket-handbook)
- [WebSockets — A Conceptual Deep-Dive](https://www.ably.com/topic/websockets)
- [Ably blog](https://www.ably.com/blog)
- [Ably resources & datasheets](https://www.ably.com/resources/datasheets)
- [Ably's 25+ client library SDKs](https://www.ably.com/download)
