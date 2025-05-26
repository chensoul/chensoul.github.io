---
title: "[译]如何通过 WebSocket 将 Kafka 消息流式传输到面向互联网的客户端"
date: 2024-05-07
type: post
slug: websockets-kafka
categories: ["Java"]
tags: [ websocket,kafka,java]
---

原文链接：[https://ably.com/topic/websockets-kafka](https://ably.com/topic/websockets-kafka)



Apache Kafka 是目前最强大的异步消息传递技术之一。 Kafka 由 Jay Kreps、Jun Rao 和 Neha Narkhede 等团队于 2010 年在 LinkedIn 设计，并于 2011 年初开源。如今，该工具被众多公司（包括科技巨头，例如 Slack、Airbnb 或 Netflix 使用）为其实时数据流管道提供支持。 

由于 Kafka 如此受欢迎，我很好奇是否可以使用它**通过互联网和 WebSockets 将实时数据直接流式传输给最终用户**。毕竟，Kafka 具有一系列特征，似乎使其成为一个值得注意的选择，例如：

- 高通量
- 低延迟
- 高并发
- 容错能力
- 持久性（持久性）



## 用于将 Kafka 消息流式传输到面向互联网的客户端的现有解决方案

我开始研究实时开发社区对这个用例的看法。我很快发现 Kafka 最初设计用于安全网络内进行机器对机器通信。这让我想到，如果您想通过 WebSocket 将数据从 Kafka 流式传输到面向互联网的用户，您可能需要使用某种中间件。

我继续研究，希望找到一些可以充当中间件的开源解决方案。我发现了其中的几个，理论上可以用作 Kafka 和通过互联网连接数据流的客户端之间的中介：

- [transfers_websockets_service](https://github.com/VictorGil/transfers_websockets_service)
- [kafka-websocket](https://github.com/b/kafka-websocket)
- [kafka-proxy-ws](https://github.com/microsoft/kafka-proxy-ws)

不幸的是，上面列出的所有解决方案都只是概念证明，仅此而已。它们的功能集有限，并且尚未做好生产准备（尤其是大规模生产）。

然后我研究了成熟的科技公司如何解决这个 Kafka 用例；看来他们确实在使用某种中间件。例如，Trello 开发了[WebSocket 协议的简化版本](https://tech.trello.com/why-we-chose-kafka/#interlude-2-the-trello-websocket-protocol)，仅支持订阅和取消订阅命令。 Slack 提供了另一个例子。该公司构建了一个名为[Flannel](https://slack.engineering/flannel-an-application-level-edge-cache-to-make-slack-scale-b8a6400e2f6b)的代理，它本质上是部署到边缘存在点的应用程序级缓存服务。

当然，像 Trello 或 Slack 这样的公司有能力投资所需的资源来构建此类解决方案。然而，开发自己的中间件并不总是一个可行的选择——这是一项非常复杂的任务，需要大量的资源和时间。另一种选择（最方便、最常见的一种）是使用已建立的第三方解决方案。

正如我们所看到的，普遍的共识似乎是 Kafka 本身不适合通过互联网进行最后一英里交付；您需要将它与另一个组件结合使用：**面向互联网的实时消息传递服务**。

在 Ably，我们的许多客户都通过我们[面向互联网的 pub/sub 实时消息服务](https://ably.com/pub-sub-messaging)[传输 Kafka](https://ably.com/solutions/extend-kafka-to-the-edge)消息。为了演示它是多么简单，下面是如何从 Kafka 消费数据并将其发布到 Ably 的示例： 

```Javascript
const kafka = require('kafka-node');
const Ably = require('ably');

const ably = new Ably.Realtime({{ABLY_API_KEY}});
const ablyChannel = ably.channels.get('kafka-example');

const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: {{KAFKA_SERVER_URL}} });
const consumer = new Consumer(
       client,
       [
           { topic: {{KAFKA_TOPIC}}, partition: 0 }
       ]
   );

consumer.on('message', function (message) {
   ablyChannel.publish('kafka-event', message.value);
});
```

以下是客户端连接到 Ably 来使用数据的方式：

```Javascript
const Ably = require('ably');
const ably = new Ably.Realtime({{ABLY_KEY}});
const channel = ably.channels.get('kafka-example');

channel.subscribe(function(message) {
  console.log('kafka message data: ', message.data);
});
```

您可以决定在 Kafka 和客户端设备之间使用任何面向互联网的实时消息传递服务。但是，无论您如何选择，您都需要考虑该消息传递服务层必须能够应对的所有挑战。

## 使用 Kafka 和消息中间件：工程和运营挑战

在开始之前，我必须强调本文介绍的设计模式涉及**在 Kafka 和面向 Internet 的用户之间使用基于 WebSocket 的实时消息传递中间件**。 

还值得一提的是，我写这篇文章的基础是 Ably 团队拥有的关于大规模实时数据流挑战的广泛集体知识。

我现在将深入探讨您需要考虑的关键问题，例如消息扇出、服务可用性、安全性、架构或管理背压。如果您要构建一个可扩展且可靠的系统，您选择在 Kafka 和最终用户之间使用的面向互联网的消息传递服务必须能够有效处理所有这些复杂性。 



### 消息路由

您必须考虑的关键事项之一是如何确保客户端设备仅接收相关消息。大多数时候，客户端和 Kafka 主题之间的 1:1 映射是不可扩展的，因此您将拥有跨多个设备共享的主题。 

例如，假设我们有一家信用卡公司想要向其客户传输大量交易信息。该公司使用一个被分割（分片）为多个分区的主题来增加消息的总吞吐量。在这种情况下，Kafka 提供排序保证——事务按分区排序。

然而，当客户端设备通过浏览器连接以接收交易信息时，它只希望并且应该只被允许接收与该用户/设备相关的交易。但是客户端不知道它需要从哪个分区接收信息，并且 Kafka 没有可以帮助解决此问题的机制。

为了解决这个问题，您需要在 Kafka 层和最终用户之间使用面向互联网的实时消息传递服务，如下所示。 

![img](/images/kafka-messge-routing_2x.webp)

使用该模型的好处：

- 将消息从 Kafka 灵活路由到面向互联网的主题。
- 确保通过 Internet 连接的客户端仅订阅相关主题。 
- 增强安全性，因为客户端无法访问部署 Kafka 集群的安全网络；数据从Kafka推送到面向互联网的实时消息服务；客户端设备与后者交互，而不是直接从 Kafka 提取数据。



### 系统安全

Kafka 不用于最后一英里交付的主要原因之一与安全性和可用性有关。简而言之，您不希望您的数据处理组件可以直接通过 Internet 访问。

为了保护数据的完整性和系统的可用性，您需要一个面向互联网的实时消息传递服务，该服务可以充当 Kafka 与其流式传输消息的客户端设备之间的安全屏障。由于此消息传递服务暴露于 Internet，因此它应该位于网络的安全范围之外。 

您应该考虑将数据推送到面向互联网的实时消息传递服务，而不是让该服务从 Kafka 层提取数据。这样，即使消息服务遭到破坏，Kafka 中的数据仍然是安全的。面向互联网的实时消息服务还有助于确保您不会错误地允许客户端设备连接到您的 Kafka 部署或订阅它们不应访问的主题。

您希望面向 Internet 的实时消息传递服务具备适当的机制，使其能够处理系统滥用，例如拒绝服务 (DoS) 攻击，甚至是无意的攻击，其破坏性与恶意攻击一样。 

现在让我们看看 Ably 团队必须处理的 DoS 攻击的真实情况。尽管它不是恶意的，但它仍然是 DoS 攻击。我们的一位客户遇到了一个问题，网络故障导致数万个连接同时断开。由于代码中的错误，每当连接失败时，系统都会立即尝试重新建立 WebSocket 连接，而不管网络状况如何。这反过来又导致每隔几秒就会有数千次客户端连接尝试，直到客户端能够重新连接到面向互联网的实时消息传递服务为止。由于 Ably 是中间的消息服务，它吸收了连接的峰值，而底层 Kafka 层完全不受影响。

### 数据转换

通常，您在流式传输管道中内部使用的数据不适合最终用户。根据您的使用案例，这可能会给您的客户带来性能或带宽相关的问题，因为您最终可能会通过每条消息向他们传输额外和冗余的信息。 

我将用一个例子来更好地说明我的意思。在 Ably，我们使客户能够连接到各种数据流。其中一个流称为[CTtransit GTFS-realtime](https://www.ably.com/hub/cttransit/gtfsr)（请注意，CTtransit 是康涅狄格州交通部的一项巴士服务）。这是一个使用公开可用总线数据的免费流。 

现在假设您想要直接连接到 CTtransit GTFS-realtime，将数据流式传输到向最终用户提供实时公交车更新（例如车辆位置或路线变更）的应用程序。每次有更新时（即使仅针对一辆公交车），CTtransit 发送的消息可能如下所示：

```JSON
[
   {
      "id":"1430",
      "vehicle":{
         "trip":{
            "tripId":"1278992",
            "startDate":"20200612",
            "routeId":"11417"
         },
         "position":{
            "latitude":41.75381851196289,
            "longitude":-72.6827621459961
         },
         "timestamp":"1591959482",
         "vehicle":{
            "id":"2430",
            "label":"1430"
         }
      }
   },
   {
      "id":"1431",
      "vehicle":{
         "trip":{
            "tripId":"1278402",
            "startDate":"20200612",
            "routeId":"11413"
         },
         "position":{
            "latitude":41.69612121582031,
            "longitude":-72.75396728515625
         },
         "timestamp":"1591960295",
         "vehicle":{
            "id":"2431",
            "label":"1431"
         }
      }
   },
   // Payload contains information for an additional 150+ buses
   }
]
```

正如您所看到的，有效负载巨大并且覆盖了多条总线。然而，大多数时候，最终用户只对接收其中一辆总线的更新感兴趣。因此，针对他们的相关消息如下所示：

```JSON
{
   "id":"1430",
   "vehicle":{
      "trip":{
         "tripId":"1278992",
         "startDate":"20200612",
         "routeId":"11417"
      },
      "position":{
         "latitude":41.75381851196289,
         "longitude":-72.6827621459961
      },
      "timestamp":"1591959482",
      "vehicle":{
         "id":"2430",
         "label":"1430"
      }
   }
}
```

让我们更进一步——客户端可能希望只接收车辆的新纬度和经度值，因此上面的有效负载在发送到客户端设备之前将转换为以下内容：

```JSON
{
   "id":"1430",
   "lat":41.75381851196289,
   "long":-72.6827621459961
}
```

此示例的目的是证明，如果您希望为最终用户创建最佳且低延迟的体验，则需要制定一个围绕数据转换的策略，以便您可以将其分解（分片）为更小、更快的数据，以及更相关的子流，更适合最后一英里交付。 

除了数据转换之外，如果它与您的用例相关，您可以考虑使用消息增量压缩，这是一种机制，使您能够发送仅包含当前消息与您之前发送的消息之间的差异（增量）的有效负载。发送。尺寸的减小降低了带宽成本，改善了最终用户的延迟，并实现了更大的消息吞吐量。 

查看[Ably 实时增量比较演示，](https://jsbin.ably.io/izopuj/1?__hstc=12655464.aa487a112dcd2cf0613536e7b79efed7.1715042759949.1715042759949.1715045159596.2&__hssc=12655464.68.1715045159596&__hsfp=622761564)看看这在消息大小方面有多大差异。请注意，该演示使用的是美国 CTtransit 数据源，因此，如果您碰巧在没有公交车运行的时间（美国东部时间午夜至早上 6 点或欧洲的清晨）查看该演示，您将看不到任何数据。

您已经看到从低延迟角度转换数据和使用增量压缩是多么重要 - 有效负载可以缩小数十倍。 Kafka 提供了一些将数据流拆分为更小的子流的功能，它还允许您压缩消息以实现更高效的存储和更快的交付。但是，不要忘记，从整体上看，Kafka 并不是为通过互联网进行最后一英里交付而设计的。您最好将数据转换和增量压缩的操作复杂性转移给位于 Kafka 和客户之间的面向互联网的实时消息传递服务。 

### 传输协议互操作性

可用于流传输管道的传输协议的情况非常多样化。您的系统很可能需要支持多种协议：除了主要协议之外，您还需要有后备选项，例如 XHR 流、XHR 轮询或 JSONP 轮询。让我们快速浏览一下一些最流行的协议：

- [WebSocket](https://www.ably.com/topic/websockets)。通过单个 TCP 连接提供全双工通信通道。比半双工替代方案（例如 HTTP 轮询）低得多的开销。金融行情、基于位置的应用程序和聊天解决方案的绝佳选择。最可移植的实时协议，具有广泛的支持。
- [MQTT](https://www.ably.com/topic/mqtt)。用于在 CPU 功率和/或电池寿命有限的设备之间以及具有昂贵/低带宽、不可预测的稳定性或高延迟的网络之间传输数据的首选协议。非常适合物联网。
- [SSE](https://www.ably.com/topic/server-sent-events)。 用于事件驱动数据流的开放、轻量级、仅订阅协议。非常适合订阅数据源，例如实时体育更新。

除了上面列出的原始协议之外，您还可以添加应用程序级协议。例如，对于 WebSockets，您可以选择使用[Socket.IO](https://socket.io/)或[SockJS](https://github.com/sockjs/sockjs-protocol)等解决方案。当然，您也*可以构建自己的自定义协议，但实际上**必须*这样做的场景非常罕见。设计定制协议是一个复杂的过程，需要花费大量的时间和精力。在大多数情况下，您最好使用现有且完善的解决方案。

[Kafka 基于 TCP 的二进制协议](https://kafka.apache.org/protocol)不适合通过 Internet 进行通信，并且不受浏览器支持。此外，Kafka 不提供对其他协议的原生支持。因此，您需要使用面向互联网的实时消息传递服务，该服务可以从 Kafka 获取数据，对其进行转换，然后通过您所需的协议将其推送给订阅者。

### 消息扇出

无论您使用哪种技术堆栈来构建数据流管道，您都必须考虑的一件事是如何管理消息扇出（更具体地说，发布一条被大量用户接收的消息，一对多关系）。规模设计要求您应该使用这样的模型：发布者将数据推送到任意数量的用户可以订阅的组件。最明显的选择是[发布/订阅模式](https://www.ably.com/topic/pub-sub)。 

当您考虑高扇出时，您应该考虑系统的弹性，包括可以连接到它的客户端设备的数量，以及它可以维持的主题数量。这往往是出现问题的地方。 Kafka 主要设计用于网络内部的机器对机器通信，它将数据流式传输给少量订阅者。因此，它没有针对通过 Internet 将消息扇出到大量客户端进行优化。

然而，如果中间有一个面向互联网的实时消息服务，情况就完全不同了。您可以使用消息传递服务层将消息的扇出卸载到客户端。如果该层有能力传递扇出消息，那么它可以以非常低的延迟传递它们，而无需向 Kafka 集群添加容量。

### 服务器弹性

您需要考虑 Kafka 层的弹性。当您将无弹性的流媒体服务器暴露在互联网上时，可能会出现破坏系统的复杂情况，互联网是不稳定且不可预测的流量来源。

您的 Kafka 层需要有能力随时处理互联网流量。例如，如果您正在开发一款多人游戏，并且数以万计的并发用户的操作触发了使用量峰值，那么增加的负载可能会传播到您的 Kafka 集群，该集群需要有资源来处理它。

确实，大多数流媒体服务器都是有弹性的，但不是动态弹性的。这并不理想，因为您无法快速提高 Kafka 服务器容量（几分钟而不是几小时）。您可以做的是提前计划和配置容量，并希望它足以应对流量高峰。但不能保证您的 Kafka 层不会过载。

面向互联网的实时消息服务通常能够更好地提供动态弹性。它们本身并非没有挑战，但您可以将弹性问题转移给消息服务，从而在互联网流量激增时保护您的 Kafka 集群。

让我们看一个现实生活中的例子。不久前，Ably 有幸[帮助澳大利亚网球协会](https://www.ably.com/case-studies/tennis-australia)向浏览澳大利亚网球公开赛网站的球迷传输实时比分更新。我们最初对系统进行了每分钟 100 万个连接的负载测试。一旦投入生产，我们发现连接每 15 秒左右就会发生一次混乱。因此，我们实际上每分钟必须处理 400 万个新连接，这是一个完全不同的问题。如果澳大利亚网球协会没有在中间使用 Ably 作为面向互联网的弹性实时消息服务，那么他们的底层服务器层（Kafka 或其他）将会受到不利影响。完全吸收了负载，而澳大利亚网球协会必须做的工作量保持不变——他们只需要在一场集会结束时发布一条消息。

您必须考虑的另一件事是如何处理连接重新建立。当客户端重新连接时，数据流必须从中断处恢复。但是哪个组件负责跟踪这一点呢？是面向互联网的实时消息服务、Kafka 还是客户端？答案没有正确或错误之分——这三个人中的任何一个都可以被分配这个责任。但是，您需要仔细分析您的需求，并考虑如果每个流都需要存储数据，则您将需要根据连接数按比例扩展存储。 

### 全球分布式架构

为了获得低延迟的数据流系统，您使用的面向互联网的实时消息服务必须与您的 Kafka 部署位于同一区域。但这还不够。您发送消息的客户端设备也应该位于同一区域。例如，您不希望通过部署在世界其他地区的系统将数据从澳大利亚流式传输到澳大利亚的最终用户。 

如果您希望在发送者和接收者位于世界不同地区时提供从源到最终用户的低延迟，则需要考虑全球分布式架构。边缘交付使您能够将消息的计算处理靠近客户端。

拥有全球分布式的面向互联网的实时消息传递层的另一个好处是，如果您的 Kafka 服务器由于重新启动或不兼容的升级而发生故障，实时消息传递服务将保持连接处于活动状态，因此一旦 Kafka 层恢复正常，它们就可以快速恢复。再次运行。换句话说，孤立的 Kafka 故障不会对订阅数据流的所有客户端产生直接影响。这是分布式系统的主要优点之一——组件独立发生故障并且不会导致级联故障。

另一方面，如果不使用面向互联网的实时边缘消息传递层，Kafka 故障将更难以管理。这将导致所有连接终止。发生这种情况时，客户端将尝试立即重新连接，这会给系统中任何其他现有的 Kafka 节点增加更多负载。节点可能会过载，从而导致级联故障。

让我们看一下您可以使用的一些常见的全球分布式架构模型。在第一个模型中，Kafka 部署在安全网络内，并将数据推送到面向互联网的实时消息服务。消息传递服务位于安全网络的边缘，暴露在互联网上。 



![img](/images/kafka-architecture-1-simple-model_2x.webp)

您可以采用的辅助模型涉及一个面向互联网的实时消息传递服务和两个 Kafka 实例（主实例和备份/后备实例）。由于消息传递服务是解耦的，因此它不知道（也不关心）两个 Kafka 实例中的哪一个正在为其提供数据。该模型是一种故障转移设计，为您的 Kafka 设置增加了一层可靠性：如果其中一个 Kafka 实例发生故障，第二个实例将取代它。 



![img](/images/kafka-architecture-2-failover-model_2x.webp)

第三种模式非常受 Ably 客户欢迎，是主动-主动方法。它需要两个Kafka集群同时独立运行，以分担负载。两个集群均以 50% 的容量运行，并使用相同的面向 Internet 的实时消息传递服务。此模型在需要将消息流式传输到大量客户端设备的情况下特别有用。如果其中一个 Kafka 集群发生故障，另一个集群可以承担 50% 的负载，以保持系统运行。



![img](/images/kafka-architecture-3-active-model_2x.webp)



### 管理背压

当通过互联网将数据流式传输到客户端设备时，背压是您必须处理的关键问题之一。例如，假设您每秒传输 25 条消息，但客户端每秒只能处理 10 条消息。您如何处理客户端无法消费的每秒 15 条剩余消息？

由于 Kafka 是为机器对机器通信而设计的，因此它没有为您提供良好的机制来管理互联网上的背压。但是，如果您在 Kafka 和客户端之间使用面向互联网的实时消息传递服务，您可能能够更好地处理这个问题。

即使中间有消息传递服务，您仍然需要决定什么对您的流传输管道更重要：低延迟还是数据完整性？它们并不相互排斥，但选择其中之一会在一定程度上影响另一个。

例如，假设您有一个供经纪人和交易者使用的交易应用程序。在我们的第一个用例中，最终用户有兴趣尽快接收货币更新。在这种情况下，低延迟应该是您的重点，而数据完整性则不太重要。

为了实现低延迟，您可以使用背压控制，它监视在用于将数据流式传输到客户端设备的套接字上建立的缓冲区。这种数据包级机制可确保缓冲区的增长不会超出下游连接可以承受的范围。您还可以进行合并，这实际上允许您将多条消息聚合为一条消息。通过这种方式，您可以控制下游消息速率。此外，合并可以在不可靠的网络条件下成功使用，以确保重新连接时最新状态是最近消息的聚合。

如果您希望在应用程序级别处理背压，则可以依赖来自订阅数据流的客户端的 ACK。通过这种方法，您的系统将推迟发送额外批次的消息，直到收到确认代码。 

现在让我们回到我们的交易应用程序。在我们的第二个用例中，最终用户有兴趣查看他们的交易历史记录。在这种情况下，数据完整性胜过延迟，因为用户需要查看*完整的*交易记录。为了管理背压，您可以求助于我们已经提到过的 ACK。 

为了确保完整性，您可能需要考虑如何处理一次性交付。例如，您可能希望通过持久连接使用幂等发布。简而言之，幂等发布意味着发布的消息仅处理一次，即使客户端或连接故障导致重新尝试发布也是如此。那么它在实践中是如何运作的呢？那么，如果客户端设备发出购买股票的请求，并且请求成功，但客户端超时，则客户端可以再次尝试相同的请求。幂等性可以防止客户端被收取两次费用。 

## 结论：您应该使用 Kafka 通过互联网将数据直接流式传输到客户端设备吗？

Kafka 是一个出色的工具，它的设计初衷就是实现机器对机器通信。您可以而且应该将其用作数据流管道的组件。但它并不意味着通过互联网将数据直接流式传输到客户端设备，面向互联网的中间实时消息传递解决方案的设计和优化正是为了承担这一责任。

希望本文能够帮助您在构建使用 Kafka 和支持 WebSockets 的面向互联网的实时消息传递服务的流式传输管道时，重点关注需要考虑的正确事项。如果您计划自己开发此类服务，或者您希望使用现有技术，这并不重要——您将面临的可扩展性和运营挑战是相同的。

但我们不要就此止步。如果您想更多地讨论此主题，或者想了解有关 Ably 的更多信息以及我们如何帮助您完成 Kafka 和 WebSockets 之旅，[请联系我们](https://www.ably.com/contact)或 [注册一个免费帐户](https://www.ably.com/signup)。

多年来，我们撰写了大量有关实时消息传递和构建有效数据流管道的文章。以下是一些有用的链接，供进一步探索：

- [Extend Kafka to end-users at the edge with Ably](https://ably.com/solutions/extend-kafka-to-the-edge)
- [Confluent Blog: Building a Dependable Real-Time Betting App with Confluent Cloud and Ably](https://www.confluent.io/blog/real-time-betting-platform-with-confluent-cloud-and-ably/)
- [The WebSocket Handbook: learn about the technology behind the realtime web](https://ably.com/resources/ebooks/websocket-handbook)
- [Ably Kafka Connector: extend Kafka to the edge reliably and safely](https://ably.com/blog/ably-kafka-connector-extend-kafka-to-the-edge)
- [Building a realtime ticket booking solution with Kafka, FastAPI, and Ably](https://ably.com/blog/realtime-ticket-booking-solution-kafka-fastapi-ably#building-the-realtime-ticket-booking-solution)
- [WebSockets — A Conceptual Deep-Dive](https://www.ably.com/topic/websockets)
- [Dependable realtime banking with Kafka and Ably](https://ably.com/blog/dependable-realtime-banking-with-kafka-and-ably)
- [Ably blog](https://www.ably.com/blog)
- [Ably resources & datasheets](https://www.ably.com/resources/datasheets)
