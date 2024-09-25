---
title: "[译]WebSocket API和协议说明"
date: 2024-05-07
slug: the-websocket-api-and-protocol-explained
categories: ["Java"]
tags: [ websocket]
---



原文地址：[https://ably.com/topic/websockets](https://ably.com/topic/websockets)



WebSocket 标志着 Web 开发的转折点。 WebSocket 技术旨在以事件为驱动，并针对低延迟进行了优化，已成为许多寻求构建交互式实时数字体验以提供令人愉悦的用户体验的组织和开发人员的首选。本文探讨了与 WebSocket 相关的关键主题：

- [WebSocket 协议和 API 解释](https://ably.com/topic/websockets#web-sockets-the-web-socket-protocol-and-api-explained)

- [WebSockets 是如何工作的？](https://ably.com/topic/websockets#how-do-web-sockets-work)
- [WebSockets的优缺点是什么？](https://ably.com/topic/websockets#what-are-the-pros-and-cons-of-web-sockets)
- [WebSockets 是否可扩展？](https://ably.com/topic/websockets#are-web-sockets-scalable)
- [WebSocket 的用途是什么？](https://ably.com/topic/websockets#what-are-web-sockets-used-for)
- [WebSockets 的最佳替代品是什么？](https://ably.com/topic/websockets#what-are-the-best-alternatives-to-web-sockets)
- [如何开始使用 WebSockets 构建实时体验](https://ably.com/topic/websockets#how-to-start-building-realtime-experiences-with-web-sockets)
- [WebSocket 常见问题解答](https://ably.com/topic/websockets#web-sockets-fa-qs)

## WebSocket：协议和 API 解释

WebSocket 是一种实时技术，可通过持久的单套接字连接在客户端和服务器之间实现双向全双工通信。只要需要，WebSocket 连接就会保持活动状态（理论上，它可以永远持续下去），允许服务器和客户端随意发送数据，开销最小。

WebSocket 技术由两个核心构建块组成：

- WebSocket 协议。
- WebSocket API。

### WebSocket的历史是什么？

第一个实时 Web 应用程序开始出现在 2000 年代，试图提供响应迅速、动态和交互式的最终用户体验。然而，在那个时候，实时网络很难实现，而且比我们现在习惯的要慢;它是通过入侵现有的基于HTTP的技术（AJAX和Comet）来实现的，这些技术不是为实时应用程序设计和优化的。很明显，需要一个更好的替代方案。

在 2008 年，开发人员 Michael Carter 和 Ian Hickson 特别敏锐地感受到了在实现任何类似实时的东西时使用 AJAX 和 Comet 的痛苦和局限性。通过在 [IRC](https://krijnhoetmer.nl/irc-logs/whatwg/20080618#l-1145) 和 [W3C 邮件列表](https://lists.w3.org/Archives/Public/public-whatwg-archive/2008Jun/0165.html)上的合作，他们提出了一个计划，为网络上的现代、真正的实时通信引入一个新标准。[因此，“WebSocket”这个名字被创造出来](https://lists.w3.org/Archives/Public/public-whatwg-archive/2008Jun/0186.html)。

### 什么是 WebSocket 协议？

WebSocket 协议支持 Web 客户端和 Web 服务器之间通过基础 TCP 连接进行持续的全双工双向通信。该协议旨在允许客户端和服务器实时通信，从而在 Web 应用程序中实现高效且响应迅速的数据传输。

2011 年 12 月，互联网工程任务组 （IETF） 通过 [RFC 6455](https://www.rfc-editor.org/rfc/rfc6455) 对 WebSocket 协议进行了标准化。互联网号码分配机构 （IANA） 与 IETF 协调维护 [WebSocket 协议注册管理机构](https://www.iana.org/assignments/websocket/websocket.xml)，该注册管理机构定义了协议使用的许多代码和参数标识符。

### 什么是 WebSocket API？

WebSocket API 包含在 [HTML Living Standard](https://websockets.spec.whatwg.org/) 中，是一个编程接口，用于创建 WebSocket 连接并管理 Web 应用程序中客户端和服务器之间的数据交换。它为开发人员提供了一种简单且标准化的方法，可以在其应用程序中使用 WebSocket 协议。

如今，几乎所有现代浏览器都支持 WebSocket API。此外，还有许多框架和库（包括开源和商业解决方案）实现了 WebSocket API。

## WebSocket 的用途是什么？

WebSocket 提供低延迟通信功能，适用于各种类型的实时用例。例如，可以使用 WebSockets 执行以下操作：

- 强大的实时聊天体验。
- 广播实时事件数据，例如实时比分和流量更新。
- 促进共享项目和白板上的多人协作。
- 发送通知和警报。
- 让您的后端和前端保持实时同步。
- 为城市交通和送餐应用添加实时位置跟踪功能。

![img](https://images.ctfassets.net/ee3ypdtck0rk/30CmmlvUQmZHRFWJgxAeGz/a19870284a9d52b816c14780d75f30c1/websocket-main-use-cases.png?w=3052&h=1426&q=50&fm=png)

## WebSockets 是如何工作的？

概括地说，使用 WebSockets 涉及三个主要步骤：

- 打开 WebSocket 连接。建立 WebSocket 连接的过程称为开始握手，由客户端和服务器之间的 HTTP 请求/响应交换组成。有关详细信息，请参阅[如何建立 WebSocket 连接](https://ably.com/topic/how-do-websockets-work#how-to-establish-a-web-socket-connection)。
- 通过WebSocket进行数据传输。成功打开握手后，客户端和服务器可以通过持久 WebSocket 连接交换消息（帧）。WebSocket 消息可能包含字符串（纯文本）或二进制数据。[详细了解通过 WebSocket 传输数据](https://ably.com/topic/how-do-websockets-work#how-to-transmit-data-over-web-sockets)。
- 关闭 WebSocket 连接。一旦持久的 WebSocket 连接达到其目的，它就可以终止;客户端和服务器都可以通过发送关闭消息来启动关闭握手。[阅读有关关闭 WebSocket 连接的详细信息](https://ably.com/topic/how-do-websockets-work#how-to-close-web-socket-connections)。

![img](https://images.ctfassets.net/ee3ypdtck0rk/0mExYcxsnzccWxnktAKjc/33a49e1e736a2f906216d630b84fb641/websockets.png?w=1840&h=745&q=50&fm=png)

### 如何建立 WebSocket 连接

#### 在 WebSocket 协议级别建立连接

根据 [WebSocket 协议规范](https://www.rfc-editor.org/rfc/rfc6455)，建立 WebSocket 连接的过程称为打开握手，由客户端和服务器之间的 HTTP/1.1 请求/响应交换组成。客户端始终发起握手;它向服务器发送请求 `GET` ，指示它想要将连接从 HTTP 协议升级到 WebSocket。

下面是客户端发出的启动开场握手 `GET` 的请求的基本示例：

```HTML
GET wss://example.com:8181/ HTTP/1.1
Host: localhost: 8181
Connection: Upgrade
Upgrade: websocket
Sec-WebSocket-Version: 13
Sec-WebSocket-Key: zy6Dy9mSAIM7GJZNf9rI1A==
```

服务器必须返回响应 `HTTP 101 Switching Protocols` 代码才能成功建立 WebSocket 连接：

```HTML
HTTP/1.1 101 Switching Protocols
Connection: Upgrade
Sec-WebSocket-Accept: EDJa7WCAQQzMCYNJM42Syuo9SqQ=
Upgrade: websocket
```

**打开握手标头**

下表描述了客户端和服务器在打开握手期间使用的标头 - 包括必需的标头（在上面的代码片段中进行了说明）和可选标头。

| **Header**                 | **Required** | **Description**                                              |
| :------------------------- | :----------- | :----------------------------------------------------------- |
| `Host`                     | Yes          | 主机名，以及请求发送到的服务器的端口号（可选）。             |
| `Connection`               | Yes          | 指示客户端希望协商更改连接的使用方式。值必须为 `Upgrade` 。Also returned by the server. 也由服务器返回。 |
| `Sec-WebSocket-Version`    | Yes          | 唯一接受的值是 13。在此标头中传递的任何其他版本都是无效的。  |
| `Sec-WebSocket-Key`        | Yes          | 客户端发送的 base64 编码的一次性随机值（随机数）。由大多数 WebSocket 库或使用浏览器中提供的 WebSocket 类自动为您处理。 |
| `Sec-WebSocket-Accept`     | Yes          | 服务器返回的 base64 编码的 SHA-1 哈希值，作为对 `Sec-WebSocket-Key` 的直接响应。Indicates that the server is willing to initiate the WebSocket connection.  指示服务器愿意启动 WebSocket 连接。 |
| `Sec-WebSocket-Protocol`   | No           | 可选标头字段，包含一个值列表，这些值指示客户端要发言的子协议，按首选项排序。服务器需要在响应中将此字段与选定的子协议值之一（列表中支持的第一个值）一起包含。 |
| `Sec-WebSocket-Extensions` | No           | 可选标头字段，最初从客户端发送到服务器，然后从服务器发送到客户端。它帮助客户端和服务器就一组协议级扩展达成一致，以便在连接期间使用。 |
| `Origin`                   | No           | 所有浏览器客户端发送的标头字段（对于非浏览器客户端是可选的）。用于防止在 Web 浏览器中使用 WebSocket API 的脚本未经授权跨域使用 WebSocket 服务器。如果 `Origin` 指示的连接对服务器不可接受，则连接将被拒绝。 |

**Sec-WebSocket-Key 和 Sec-WebSocket-Accept**

值得一提的是，有关 WebSocket 握手期间使用的两个必需标头的更多详细信息： `Sec-WebSocket-Key` 和 `Sec-WebSocket-Accept` .总之，这些标头对于保证服务器和客户端都能够通过 WebSocket 进行通信至关重要。

首先，我们有 `Sec-WebSocket-Key` ，它由客户端传递给服务器，并包含一个 16 字节、base64 编码的一次性随机值（nonce）。其目的是帮助确保服务器不接受来自非 WebSocket 客户端（例如 HTTP 客户端）的连接，这些客户端被滥用（或配置错误）以将数据发送到毫无戒心的 WebSocket 服务器。下面是一个示例 `Sec-WebSocket-Key` ：

```HTML
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
```

与 直接相关的是 `Sec-WebSocket-Key` ，服务器响应包括一个 `Sec-WebSocket-Accept` 标头。此标头包含通过连接客户端发送的 `Sec-WebSocket-Key` 随机数和静态值 （UUID） `258EAFA5-E914-47DA-95CA-C5AB0DC85B11` 生成的 base64 编码的 SHA-1 哈希值。

根据上面提供的 `Sec-WebSocket-Key` 示例，下面是服务器返回的 `Sec-WebSocket-Accept` 标头：

```HTML
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

#### 在 WebSocket API 级别建立连接

浏览器（以及大多数 WebSocket 库）中的 WebSocket API 会自动为您处理开场握手。您所要做的就是实例化 `WebSocket` 对象，该对象将自动尝试打开与服务器的连接：

```Javascript
const socket = new WebSocket('wss://example.org');
```

建立 WebSocket 连接时会引发 `open` 事件。它表示客户端和服务器之间的打开握手成功，现在可以使用 WebSocket 连接来发送和接收数据。下面是一个示例（请注意， `open` 该事件是通过 `onopen` 属性处理的）：

```Javascript
// Create WebSocket connection
const socket = new WebSocket('wss://example.org');


// Connection opened
socket.onopen = function(e) {
   console.log('Connection open!');
};
```

### 如何通过 WebSocket 传输数据

#### 数据传输：协议级注意事项

成功打开握手后，客户端和服务器可以使用 WebSocket 连接在全双工模式下交换消息。WebSocket 消息由一个或多个帧组成。

WebSocket 帧采用二进制语法，包含多条信息，如下图所示：

![img](https://images.ctfassets.net/ee3ypdtck0rk/44PwSzhrnGThrl5LELmaSm/c3b094ea2afb31cda251f81c15b4dc29/6.wss-ebook-websocket-frame_2x.png?w=1840&h=706&q=50&fm=png)

**FIN钻头和碎片**

在许多情况下，需要将 WebSocket 消息分段为多个帧（或至少是可取的）。例如，碎片化通常用于提高性能。如果没有碎片，终结点在发送消息之前必须缓冲整个消息。通过分段，端点可以选择一个大小合理的缓冲区，当缓冲区已满时，将后续帧作为延续发送。然后，接收端点组装帧以重新创建 WebSocket 消息。

以下是单帧消息的样子：

```HTML
0x81 0x05 0x48 0x65 0x6c 0x6c 0x6f (contains "Hello")
```

相比之下，对于碎片化，相同的消息将如下所示：

```HTML
0x01 0x03 0x48 0x65 0x6c (contains "Hel")
0x80 0x02 0x6c 0x6f (contains "lo")
```

**RSV 1-3**

`RSV1` 、 `RSV2` 和 `RSV3` 是保留位。它们必须为 0，除非在开始握手期间协商了定义非零值的扩展。

**Opcodes**

每个帧都有一个操作码，用于确定如何解释该帧的有效载荷数据。当前使用的标准操作码由 RFC 6455 定义，并由互联网号码分配机构 （IANA） 维护。

| **Opcode** | **Description**                                              |
| :--------- | :----------------------------------------------------------- |
| `0`        | 延续框架;继续上一帧的有效载荷。                              |
| `1`        | 指示文本框架（UTF-8 文本数据）。                             |
| `2`        | 指示二进制帧。                                               |
| `3-7`      | 为自定义数据框保留。                                         |
| `8`        | 连接闭合框架;导致连接终止。                                  |
| `9`        | ping 帧。用作确保连接仍处于活动状态的心跳机制。接收器必须以乒乓球框架进行响应。 |
| `10`       | pong 帧。用作确保连接仍处于活动状态的心跳机制。在收到 ping 帧后作为响应发送。 |
| `11-15`    | 保留用于自定义控制帧。                                       |

**Masking**

客户端发送到服务器的每个 WebSocket 帧都需要借助随机 `masking-key` （32 位值）进行屏蔽。此键包含在帧中，用于混淆有效负载数据。但是，当数据以相反的方式流动时，服务器不得屏蔽它发送到客户端的任何帧。

在服务器端，在进一步处理之前，必须取消屏蔽从客户端接收的帧。下面是一个示例，说明如何做到这一点：

```Javascript
var unmask = function(mask, buffer) {
   var payload = new Buffer(buffer.length);
   for (var i=0; i<buffer.length; i++) {
       payload[i] = mask[i % 4] ^ buffer[i];
   }
   return payload;
}
```

**有效载荷长度和有效载荷数据**WebSocket 协议使用可变字节数对有效负载数据的长度进行编码：

- 对于 <126 字节的有效负载，长度将打包到前两个帧标头字节中。
- 对于 126 字节的有效负载，使用两个额外的标头字节来指示长度。
- 如果有效负载为 127 字节，则使用另外 8 个标头字节来指示其长度。
  WebSocket 协议支持两种类型的有效负载数据：文本（UTF-8 Unicode 文本）和二进制。

#### 使用 WebSocket API 进行数据传输

WebSocket 编程遵循异步、事件驱动的编程模型。只要 WebSocket 连接处于打开状态，客户端和服务器就只需侦听事件，即可处理传入数据和连接状态更改（无需轮询）。

当通过 WebSocket 接收数据时，将触发该 `message` 事件。消息可能包含字符串（纯文本）或二进制数据，如何处理和可视化这些数据取决于您。

下面是如何处理 `message` 事件的示例（使用属性 `onmessage` ）：

```Javascript
socket.onmessage = function(msg) {
   if(msg.data instanceof ArrayBuffer) {
      processArrayBuffer(msg.data);
   } else {
      processText(msg.data);
   }
 }
```

要通过 WebSocket API 发送消息，您必须使用该 `send()` 方法，如下所示：

```Javascript
socket.onopen = function(e) {
   socket.send(JSON.stringify({'msg': 'payload'}));
}
```

上面的示例代码演示如何发送文本（字符串）消息。但是，除了字符串之外，您还可以发送二进制数据（ `Blob` 或 `ArrayBuffer` ）：

```Javascript
var buffer = new ArrayBuffer(128);
socket.send(buffer);


var intview = new Uint32Array(buffer);
socket.send(intview);


var blob = new Blob([buffer]);
socket.send(blob);
```

### 如何关闭 WebSocket 连接

#### 在协议级别关闭 WebSocket 连接

关闭 WebSocket 连接的过程称为关闭握手。您可以通过发送操作码为 的 `close` `8` 帧来启动它。除了操作码之外，关闭帧还可能包含指示关闭原因的正文。此正文由状态代码（整数）和 UTF-8 编码字符串（原因）组成。

在结束握手期间可以使用的标准状态代码由 RFC 6455 定义，并在下表中列出：

| **Status code | **Name**                  | **Description**                                              |
| :------------ | :------------------------ | :----------------------------------------------------------- |
| `0-999`       | N/A                       | 低于 1000 的代码无效，不能使用。                             |
| `1000`        | 正常闭合                  | 指示正常闭包，表示已实现建立 WebSocket 连接的目的。          |
| `1001`        | 离开                      | 应在关闭连接时使用，并且不会尝试后续连接（例如，服务器关闭或浏览器离开页面）。 |
| `1002`        | 协议错误                  | 由于协议错误，终结点正在终止连接。                           |
| `1003`        | 不支持的数据              | 连接被终止，因为端点接收到它无法处理的数据类型（例如，接收二进制数据的纯文本端点）。 |
| `1004`        | Reserved                  | Reserved. A meaning might be defined in the future.  保留。将来可能会定义一个含义。 |
| `1005`        | 未收到状态                | 应用和 WebSocket API 用于指示未收到状态代码，尽管预期会收到状态代码。 |
| `1006`        | 异常闭合                  | 由应用和 WebSocket API 用于指示连接异常关闭（例如，未发送或接收 `close` 帧）。 |
| `1007`        | 无效的负载数据            | 终结点正在终止连接，因为它收到包含不一致数据的消息（例如，文本消息中的非 UTF-8 数据）。 |
| `1008`        | Policy violation 违反政策 | 终结点正在终止连接，因为它收到了违反其策略的消息。这是一个通用状态代码;当其他状态代码不合适时，或者需要隐藏有关策略的特定详细信息时，应使用它。 |
| `1009`        | 消息太大                  | . 由于接收到的数据帧太大而无法处理，端点正在终止连接。       |
| `1010`        | 强制延期                  | T客户端正在终止连接，因为服务器在打开握手期间未能协商扩展。  |
| `1011`        | 内部错误                  | 服务器正在终止连接，因为它遇到了意外情况，导致它无法满足请求。 |
| `1012`        | 服务重启                  | 服务器正在终止连接，因为它正在重新启动。                     |
| `1013`        | 请稍后再试                | 服务器由于临时情况（例如，它过载）而终止连接。               |
| `1014`        | Bad gateway 网关错误      | 服务器充当网关或代理，并收到来自上游服务器的无效响应。类似于 `502 Bad Gateway` HTTP 状态代码。 |
| `1015`        | TLS handshake TLS 握手    | 保留。指示由于无法执行 TLS 握手（例如，无法验证服务器证书）而关闭连接。 |
| `1016-1999`   | N/A                       | 保留供 WebSocket 标准将来使用。                              |
| `2000-2999`   | N/A                       | 保留供 WebSocket 扩展将来使用。                              |
|               |                           |                                                              |

客户端和 Web 服务器都可以启动关闭握手。收到 `close` 帧后，端点（客户端或服务器）必须发送帧 `close` 作为响应（回显接收到的状态代码）。终结点发送和接收 `close` 帧后，结束握手完成，WebSocket 连接被视为已关闭。

#### 使用 WebSocket API 关闭 WebSocket 连接

该 `close()` 方法用于关闭 WebSocket 连接。调用此方法后，无法通过 WebSocket 连接发送或接收更多数据。

下面是调用 `close()` 该方法的最基本示例：

```Javascript
socket.close();
```

（可选）您可以使用 close（） 方法传递两个参数：

- 一个数值，指示说明关闭连接原因的状态代码。有关详细信息，请参阅本文上一节中的状态代码表。
- 一个人类可读的字符串，解释连接关闭的原因。

下面是使用两个可选参数调用 `close()` 方法的示例：

```Javascript
socket.close(1003, "Unsupported data type!");
当 WebSocket 连接关闭时，将触发一个 `close` 事件。以下是侦听 `close` 事件的方式：
```

```Javascript
socket.onclose = function(e) {
   console.log("Connection closed", e);
};
```

## WebSockets的优缺点是什么？

WebSocket 的优点是它们支持客户端和服务器之间的实时通信，而无需频繁的 HTTP 请求/响应。这带来了一些好处，例如减少延迟，以及提高 Web 应用程序的性能和响应能力。

由于其持久性和双向性，WebSocket 协议在构建需要频繁数据交换的实时应用程序时比 HTTP 更灵活。WebSocket 也更有效率，因为它们允许传输数据而无需重复的 HTTP 标头和握手。这可以减少带宽使用和服务器负载。

虽然 WebSocket 有很多优点，但它们也有一些缺点。以下是主要的：

- WebSocket 未针对流式音频和视频数据进行优化。
- 当连接终止时，WebSocket 不会自动恢复。
- 某些环境（例如具有代理服务器的企业网络）将阻止 WebSocket 连接。
- WebSocket 是有状态的，这使得它们很难在大型系统中使用。

## WebSockets 的最佳替代品是什么？

WebSocket 是实时或近乎实时发送和使用数据的关键（或至少是可取的）用例的绝佳选择。然而，很少有放之四海而皆准的协议——不同的协议比其他协议更好地服务于不同的目的。WebSockets 的实时替代方案包括：

- [Server-Sent Events](https://ably.com/topic/server-sent-events)
- [HTTP 长轮询](https://ably.com/topic/long-polling)
- [MQTT ](https://ably.com/topic/mqtt)
- [WebRTC](https://ably.com/blog/what-is-webrtc)
- [WebTransport](https://ably.com/blog/can-webtransport-replace-websockets)

## 如何开始使用 WebSockets 构建实时体验

WebSockets 的入门非常简单。WebSocket API 使用起来很简单，每种编程语言都有许多可用的 WebSocket 库和框架。它们中的大多数都建立在原始 WebSocket 协议之上，同时提供了额外的功能，从而使开发人员更容易、更方便地在他们的应用程序中实现 WebSocket 并构建基于 WebSocket 的功能。

如果您刚刚开始使用 WebSockets，并且希望构建第一个由 WebSockets 提供支持的实时应用程序，请查看此分步教程。它教您如何使用两个简单的开源 WebSocket 库开发交互式光标位置共享演示。这种项目需要客户端和服务器之间的双向即时通信，而 WebSocket 技术正是在这种用例中大放异彩的。

另一方面，交付由开源 WebSocket 库提供支持的生产就绪实时功能并不像构建一个简单的演示应用程序那样容易。这是一条充满障碍和工程复杂性的道路。例如，请参阅扩展 Socket.IO 所涉及的许多工程挑战，这是目前最流行的开源 WebSocket 库之一。

如果您想避免在内部扩展和维护 WebSocket 基础架构的挑战和成本，您可以将这种复杂性卸载到托管的第三方 PaaS（如 Ably）上。

### Ably，WebSocket平台在任何规模下都能可靠地工作

Ably 是一家实时体验基础设施提供商。我们的 API 和 SDK 可帮助开发人员构建和交付实时体验，而无需担心维护和扩展杂乱无章的 WebSocket 基础设施。

Ably 的主要特性和功能：

- 通过无服务器 WebSocket 进行发布/订阅消息传递，具有丰富的功能，例如消息增量压缩、具有连续性的自动重新连接、用户状态、消息历史记录和消息交互。
- 由数据中心和边缘加速接入点组成的全球分布式网络。
- 保证消息排序和传递。
- 全局容错和 99.999% 的正常运行时间 SLA。
- < 65 毫秒的往返延迟 （P99）。
- 动态弹性，因此我们可以快速扩展以处理任何需求（数十亿条 WebSocket 消息发送到数百万个发布/订阅频道和 WebSocket 连接）。

## WebSocket 常见问题解答

### 什么是 WebSocket 连接？

您可以将 WebSocket 连接视为 Web 客户端和 Web 服务器之间的长期双向全双工通信通道。请注意，WebSocket 连接在 TCP 之上工作。

### WebSockets 是否可扩展？

是的，WebSocket 是可扩展的。Slack、Netflix 和 Uber 等公司使用 WebSockets 为其应用程序中的实时功能提供支持，为数百万最终用户提供支持。例如，[Slack 使用 WebSockets 在聊天用户之间进行即时消息传递](https://slack.engineering/migrating-millions-of-concurrent-websockets-to-envoy/)。


然而，扩展 WebSocket 并非易事，涉及大量工程决策和技术权衡。其中：

- 您应该使用垂直缩放还是水平缩放？
- 您如何处理不可预测的负载？
- 如何大规模管理 WebSocket 连接？
- 总体上使用了多少带宽，它如何影响您的预算？
- 您是否必须处理流量高峰，如果是这样，对服务器层的性能有什么影响？
- 如果需要，您将如何自动添加额外的服务器容量？
- 如何确保大规模的数据完整性（保证消息排序和传递）？

### WebSocket 安全吗？

如果 WebSocket 采用适当的安全措施来实施，它们是安全的。安全 WebSocket 连接使用“wss://”URI。这表示连接是使用 SSL/TLS 加密的，这确保了 WebSocket 客户端和 WebSocket 服务器之间传输的数据是加密的，不会被第三方拦截或篡改。

此外，WebSocket 连接可能受到与 HTTP 连接相同的安全策略的约束，例如跨域资源共享 （CORS） 限制，可防止跨不同域对资源进行未经授权的访问。

请注意，WebSocket 协议没有规定服务器对客户端进行身份验证的任何特定方式。例如，您可以在开始握手期间使用 Cookie 标头处理身份验证。另一种选择是使用 JSON Web 令牌等技术在应用程序级别管理身份验证（和授权）。

### WebSockets 比 HTTP 快吗？

在需要频繁数据交换的实时应用程序的上下文中，WebSocket 比 HTTP 更快。

与 WebSocket 连接相比，HTTP 连接具有额外的开销（例如标头和其他元数据），这可能会增加延迟并降低性能，而 WebSocket 连接专为持久、低延迟、双向通信而设计。使用 WebSockets，不需要多个 HTTP 请求和响应。这可以加快通信速度并降低延迟。

### WebSocket 是同步的还是异步的？

WebSocket 在设计上是异步的，这意味着可以随时发送和接收数据，而无需阻塞或等待响应。但是，需要注意的是，虽然 WebSocket 本身是异步的，但用于处理 WebSocket 事件和消息的代码可能是同步的，也可能是异步的，具体取决于它的编写方式。

### WebSocket 贵吗？

WebSocket 连接本身并不昂贵，因为它被设计为轻量级和高效，开销最小。话虽如此，在内部构建和管理一个可扩展且可靠的 WebSocket 系统既昂贵又耗时，并且需要大量的工程工作：

- 10.2 人月是在内部构建基本 WebSocket 基础设施的平均时间，可扩展性有限。
- 所有自建的 WebSocket 解决方案中有一半每年需要 $100K-$200K 的维护。

### 哪些浏览器支持 WebSockets？

大多数现代 Web 浏览器都支持 WebSocket，包括：

- Google Chrome（版本 4 及更高版本）。
- Mozilla Firefox（版本 4 及更高版本）。
- Safari（版本 5 及更高版本）。
- Microsoft Edge（版本 12 及更高版本）。
- Opera（版本 10.70 及更高版本）。
- Internet Explorer（版本 10 及更高版本）。
- Microsoft Edge（版本 12 及更高版本）。
  请注意，这些浏览器的旧版本要么不支持 WebSocket，要么支持有限。在撰写本文时（2023 年 4 月 25 日），Opera Mini 是唯一不支持 WebSocket 的现代浏览器。

### WebSocket 可以保持打开状态多长时间？

通常，只要客户端和服务器保持连接并且网络稳定，WebSocket 连接就可以无限期保持打开状态。

### WebSocket 是有状态的还是无状态的？

与 HTTP 不同，WebSocket 连接是持久且有状态的。这使得 WebSocket 难以在由多个 WebSocket 服务器组成的大型系统中使用（您需要在服务器之间共享连接状态）。
