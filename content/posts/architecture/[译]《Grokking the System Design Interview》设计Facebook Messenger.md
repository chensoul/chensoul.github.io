---
title: "[译]《Grokking the System Design Interview》设计Facebook Messenger"
date: 2023-11-24
type: post
slug: designing-facebook-messenger
categories: ["Architecture"]
tags: ["architecture"]

---

这是一篇双语翻译的文章，原文出自 [grok_system_design_interview.pdf](https://github.com/sharanyaa/grok_sdi_educative/blob/master/grok_system_design_interview.pdf) 的一篇文章《Designing Facebook Messenger》设计 Facebook Messenger。

---

Let’s design an instant messaging service like Facebook Messenger where users can send text messages to each other through web and mobile interfaces.
让我们设计一个像 Facebook Messenger 这样的即时消息服务，用户可以通过网络和移动界面互相发送短信。

## 1. What is Facebook Messenger? 

>1.什么是 Facebook Messenger？

Facebook Messenger is a software application which provides text-based instant messaging services to its users. Messenger users can chat with their Facebook friends both from cell-phones and Facebook’s website.

> Facebook Messenger 是一款为其用户提供基于文本的即时消息服务的软件应用程序。 Messenger 用户可以通过手机和 Facebook 网站与 Facebook 好友聊天。

## 2. Requirements and Goals of the System 

>2. 系统的要求和目标

Our Messenger should meet the following requirements:

> 我们的 Messenger 应满足以下要求：

**Functional Requirements:**

> **功能要求：**

1. Messenger should support one-on-one conversations between users. 

   > Messenger 应支持用户之间的一对一对话。 

2. Messenger should keep track of the online/offline statuses of its users. 

   > Messenger 应跟踪用户的在线/离线状态。

3. Messenger should support persistent storage of chat history.

   > Messenger应该支持聊天记录的持久存储。

**Non-functional Requirements:**

> **非功能性要求：**

1. Users should have real-time chat experience with minimum latency.

   > 用户应该获得延迟最小的实时聊天体验。

2. Our system should be highly consistent; users should be able to see the same chat history on all their devices.

   > 我们的系统应该高度一致；用户应该能够在所有内容上看到相同的聊天记录他们的设备。

3. Messenger’s high availability is desirable; we can tolerate lower availability in the interest of consistency. 

   > Messenger 的高可用性是可取的；为了以下目的，我们可以容忍较低的可用性一致性。

**Extended Requirements:**

> **扩展要求：**

- Group Chats: Messenger should support multiple people talking to each other in a group.

  > 群组聊天：Messenger 应支持多人在群组中相互交谈。

- Push notifications: Messenger should be able to notify users of new messages when they are offline.

  > 推送通知：Messenger 应该能够在用户有新消息时通知他们离线。

## 3. Capacity Estimation and Constraints 

> 3. 容量估计和约束

Let’s assume that we have 500 million daily active users and on average each user sends 40 messages daily; this gives us 20 billion messages per day.

> 假设我们有 5 亿日活跃用户，平均每个用户每天发送 40 条消息；这每天给我们带来 200 亿条消息。

**Storage Estimation:** Let’s assume that on average a message is 100 bytes, so to store all the messages for one day we would need 2TB of storage.

> 存储估算：假设一条消息平均为 100 字节，因此要存储一天的所有消息，我们需要 2TB 的存储空间。

20 billion messages * 100 bytes => 2 TB/day

> 200 亿条消息 * 100 字节 => 2 TB/天

To store five years of chat history, we would need 3.6 petabytes of storage.

> 要存储五年的聊天历史记录，我们需要 3.6 PB 的存储空间。

2 TB * 365 days * 5 years ~= 3.6 PB

Other than the chat messages, we would also need to store users’ information, messages’ metadata (ID, Timestamp, etc.). Not to mention, the above calculation doesn’t take data compression and replication in consideration.

> 除了聊天消息之外，我们还需要存储用户信息、消息元数据（ID、时间戳等）。更不用说，上述计算没有考虑数据压缩和复制。

**Bandwidth Estimation:** If our service is getting 2TB of data every day, this will give us 25MB of incoming data for each second.

> 带宽估计：如果我们的服务每天获取 2TB 的数据，那么每秒将为我们提供 25MB 的传入数据。

2 TB / 86400 sec ~= 25 MB/s

Since each incoming message needs to go out to another user, we will need the same amount of bandwidth 25MB/s for both upload and download.

> 由于每条传入消息都需要发送给另一个用户，因此我们需要相同的带宽 25MB/s 来进行上传和下载。

**High level estimates:**

> **高水平估计：**

Total messages 20 billion per day Storage for each day 2TB Storage for 5 years 3.6PB Incomming data 25MB/s Outgoing data 25MB/s

> 消息总数 每天 200 亿条 每天存储 2TB 存储 5 年 3.6PB 传入数据 25MB/s 传出数据 25MB/s

## 4. High Level Design 

>4. 高层设计

At a high-level, we will need a chat server that will be the central piece, orchestrating all the communications between users. When a user wants to send a message to another user, they will connect to the chat server and send the message to the server; the server then passes that message to the other user and also stores it in the database.

> 在高层，我们需要一个聊天服务器作为核心部分，协调用户之间的所有通信。当一个用户想要向另一个用户发送消息时，他们会连接到聊天服务器并将消息发送到服务器；然后，服务器将该消息传递给其他用户并将其存储在数据库中。

The detailed workflow would look like this:

> 详细的工作流程如下所示：

1. User-A sends a message to User-B through the chat server.

   > 用户 A 通过聊天服务器向用户 B 发送消息。

2. The server receives the message and sends an acknowledgment to User-A.

   > 服务器接收消息并向用户 A 发送确认。

3. The server stores the message in its database and sends the message to User-B. 

   > 服务器将消息存储在其数据库中并将消息发送给用户 

4. User-B receives the message and sends the acknowledgment to the server.

   > 用户B 接收消息并向服务器发送确认。

5. The server notifies User-A that the message has been delivered successfully to User-B.

   > 服务器通知用户 A 消息已成功传递给用户 B。

## 5. Detailed Component Design 

>5. 详细组件设计

Let’s try to build a simple solution first where everything runs on one server. At the high level our system needs to handle the following use cases:

> 让我们首先尝试构建一个简单的解决方案，其中所有内容都在一台服务器上运行。在高层，我们的系统需要处理以下用例：

1. Receive incoming messages and deliver outgoing messages.

   > 接收传入消息并传递传出消息。

2. Store and retrieve messages from the database.

   > 在数据库中存储和检索消息。

3. Keep a record of which user is online or has gone offline, and notify all the relevant users about these status changes. 

   > 记录哪些用户在线或离线，并通知所有相关用户这些状态变化。

Let’s talk about these scenarios one by one:

> 我们来一一谈谈这些场景：

**a. Messages Handling**

> **a.消息处理**

**How would we efficiently send/receive messages?** To send messages, a user needs to connect to the server and post messages for the other users. To get a message from the server, the user has two options:

> 我们如何有效地发送/接收消息？要发送消息，用户需要连接到服务器并为其他用户发布消息。要从服务器获取消息，用户有两种选择：

1. **Pull model:** Users can periodically ask the server if there are any new messages for them.

   > Pull模型：用户可以定期向服务器询问是否有新消息。

2. **Push model:** Users can keep a connection open with the server and can depend upon the server to notify them whenever there are new messages.

   > 推送模型：用户可以与服务器保持开放的连接，并且可以依赖服务器每当有新消息时通知他们。

If we go with our first approach, then the server needs to keep track of messages that are still waiting to be delivered, and as soon as the receiving user connects to the server to ask for any new message, the server can return all the pending messages. To minimize latency for the user, they have to check the server quite frequently, and most of the time they will be getting an empty response if there are no pending message. This will waste a lot of resources and does not look like an efficient solution.

> 如果我们采用第一种方法，那么服务器需要跟踪仍在等待传递的消息，并且一旦接收用户连接到服务器以请求任何新消息，服务器就可以返回所有待处理的消息消息。为了最大限度地减少用户的延迟，他们必须经常检查服务器，并且大多数时候，如果没有待处理的消息，他们将得到空响应。这会浪费大量资源，而且看起来并不是一个有效的解决方案。

If we go with our second approach, where all the active users keep a connection open with the server, then as soon as the server receives a message it can immediately pass the message to the intended user. This way, the server does not need to keep track of the pending messages, and we will have minimum latency, as the messages are delivered instantly on the opened connection.

> 如果我们采用第二种方法，即所有活动用户与服务器保持打开的连接，那么一旦服务器收到消息，它就可以立即将消息传递给目标用户。这样，服务器不需要跟踪待处理的消息，并且我们将具有最小的延迟，因为消息是在打开的连接上立即传递的。

**How will clients maintain an open connection with the server?** We can use HTTP Long Polling or WebSockets. In long polling, clients can request information from the server with the expectation that the server may not respond immediately. If the server has no new data for the client when the poll is received, instead of sending an empty response, the server holds the request open and waits for

> 客户端如何与服务器保持开放连接？我们可以使用 HTTP 长轮询或 WebSockets。在长轮询中，客户端可以向服务器请求信息，但期望服务器可能不会立即响应。如果服务器在收到轮询时没有为客户端提供新数据，则服务器不会发送空响应，而是保持请求打开并等待

response information to become available. Once it does have new information, the server immediately sends the response to the client, completing the open request. Upon receipt of the server response, the client can immediately issue another server request for future updates. This gives a lot of improvements in latencies, throughputs, and performance. The long polling request can timeout or can receive a disconnect from the server, in that case, the client has to open a new request.

> 响应信息变得可用。一旦有新信息，服务器立即将响应发送给客户端，完成打开请求。收到服务器响应后，客户端可以立即发出另一个服务器请求以进行将来的更新。这在延迟、吞吐量和性能方面带来了很大的改进。长轮询请求可能会超时或可能会收到与服务器的断开连接，在这种情况下，客户端必须打开新的请求。

**How can the server keep track of all the opened connection to redirect messages to the users efficiently?** The server can maintain a hash table, where “key” would be the UserID and “value” would be the connection object. So whenever the server receives a message for a user, it looks up that user in the hash table to find the connection object and sends the message on the open request.

> 服务器如何跟踪所有打开的连接以有效地将消息重定向到用户？服务器可以维护一个哈希表，其中“key”是用户ID，“value”是连接对象。因此，每当服务器收到用户的消息时，它都会在哈希表中查找该用户以找到连接对象，并根据打开的请求发送消息。

**What will happen when the server receives a message for a user who has gone offline?** If the receiver has disconnected, the server can notify the sender about the delivery failure. If it is a temporary disconnect, e.g., the receiver’s long-poll request just timed out, then we should expect a reconnect from the user. In that case, we can ask the sender to retry sending the message. This retry could be embedded in the client’s logic so that users don’t have to retype the message. The server can also store the message for a while and retry sending it once the receiver reconnects.

> 当服务器收到用户下线的消息时会发生什么？如果接收方已断开连接，服务器可以通知发送方传送失败。如果是临时断开连接，例如接收者的长轮询请求刚刚超时，那么我们应该期望用户重新连接。在这种情况下，我们可以要求发件人重试发送消息。这种重试可以嵌入到客户端的逻辑中，这样用户就不必重新输入消息。服务器还可以将消息存储一段时间，并在接收者重新连接后重试发送。

**How many chat servers we need?** Let’s plan for 500 million connections at any time. Assuming a modern server can handle 50K concurrent connections at any time, we would need 10K such servers.

> 我们需要多少个聊天服务器？随时规划5亿连接。假设现代服务器可以随时处理 50K 并发连接，我们将需要 10K 这样的服务器。

**How do we know which server holds the connection to which user?** We can introduce a software load balancer in front of our chat servers; that can map each UserID to a server to redirect the request.

> 我们如何知道哪个服务器拥有与哪个用户的连接？我们可以在聊天服务器前面引入一个软件负载均衡器；它可以将每个 UserID 映射到服务器以重定向请求。

**How should the server process a ‘deliver message’ request?** The server needs to do the following things upon receiving a new message: 1) Store the message in the database 2) Send the message to the receiver and 3) Send an acknowledgment to the sender.

> 服务器应该如何处理“传递消息”请求？服务器在收到新消息后需要执行以下操作： 1) 将消息存储在数据库中 2) 将消息发送给接收者 3) 向发送者发送确认。

The chat server will first find the server that holds the connection for the receiver and pass the message to that server to send it to the receiver. The chat server can then send the acknowledgment to the sender; we don’t need to wait for storing the message in the database (this can happen in the background). Storing the message is discussed in the next section.

> 聊天服务器将首先找到为接收者保留连接的服务器，并将消息传递给该服务器以将其发送给接收者。然后聊天服务器可以将确认发送给发送者；我们不需要等待将消息存储在数据库中（这可以在后台发生）。下一节将讨论存储消息。

**How does the messenger maintain the sequencing of the messages?** We can store a timestamp with each message, which is the time the message is received by the server. This will still not ensure correct ordering of messages for clients. The scenario where the server timestamp cannot determine the exact order of messages would look like this:

> 消息传递者如何保持消息的顺序？我们可以为每条消息存储一个时间戳，这是服务器接收消息的时间。这仍然不能确保客户端消息的正确排序。服务器时间戳无法确定消息的确切顺序的情况如下所示：

1. User-1 sends a message M1 to the server for User-2.

   > User-1 向 User-2 的服务器发送消息 M1。

2. The server receives M1 at T1.

   > 服务器在 T1 接收 M1。

3. Meanwhile, User-2 sends a message M2 to the server for User-1. 

   > 同时，User-2向User-1的服务器发送消息M2。

4. The server receives the message M2 at T2, such that T2 > T1.

   > 服务器在T2接收消息M2，使得T2>T1。

5. The server sends message M1 to User-2 and M2 to User-1.

   > 服务器将消息 M1 发送到 User-2，将 M2 发送到 User-1。

So User-1 will see M1 first and then M2, whereas User-2 will see M2 first and then M1.

> 因此，用户 1 将首先看到 M1，然后是 M2，而用户 2 将首先看到 M2，然后是 M1。

To resolve this, we need to keep a sequence number with every message for each client. This sequence number will determine the exact ordering of messages for EACH user. With this solution both clients will see a different view of the message sequence, but this view will be consistent for them on all devices.

> 为了解决这个问题，我们需要为每个客户端的每条消息保留一个序列号。该序列号将确定每个用户的消息的确切顺序。通过此解决方案，两个客户端都将看到消息序列的不同视图，但此视图在所有设备上都将保持一致。

**b. Storing and retrieving the messages from the database**

> b.从数据库中存储和检索消息**

Whenever the chat server receives a new message, it needs to store it in the database. To do so, we have two options:

> 每当聊天服务器收到新消息时，都需要将其存储在数据库中。为此，我们有两个选择：

1. Start a separate thread, which will work with the database to store the message. 2. Send an asynchronous request to the database to store the message.

   > 启动一个单独的线程，该线程将与数据库一起存储消息。 2. 向数据库发送异步请求来存储消息。

We have to keep certain things in mind while designing our database:

> 在设计数据库时，我们必须记住以下几点：

1. How to efficiently work with the database connection pool.

   > 如何高效地使用数据库连接池。

2. How to retry failed requests.

   > 如何重试失败的请求。

3. Where to log those requests that failed even after some retries.

   > 在哪里记录那些重试后仍失败的请求。

4. How to retry these logged requests (that failed after the retry) when all the issues have resolved.

   > 当所有问题都解决后，如何重试这些记录的请求（重试后失败）。

**Which storage system we should use?** We need to have a database that can support a very high rate of small updates and also fetch a range of records quickly. This is required because we have a huge number of small messages that need to be inserted in the database and, while querying, a user is mostly interested in sequentially accessing the messages.

> 我们应该使用哪种存储系统？我们需要一个能够支持非常高的小更新率并且能够快速获取一系列记录的数据库。这是必需的，因为我们有大量的小消息需要插入到数据库中，并且在查询时，用户最感兴趣的是顺序访问这些消息。

We cannot use RDBMS like MySQL or NoSQL like MongoDB because we cannot afford to read/write a row from the database every time a user receives/sends a message. This will not only make the basic operations of our service run with high latency, but also create a huge load on databases.

> 我们无法使用 MySQL 等 RDBMS 或 MongoDB 等 NoSQL，因为我们无法在用户每次接收/发送消息时从数据库中读取/写入一行。这不仅会使我们服务的基本操作以高延迟运行，还会对数据库造成巨大的负载。

Both of our requirements can be easily met with a wide-column database solution like HBase. HBase is a column-oriented key-value NoSQL database that can store multiple values against one key into multiple columns. HBase is modeled after Google’s BigTable and runs on top of Hadoop Distributed File System (HDFS). HBase groups data together to store new data in a memory buffer and, once the buffer is full, it dumps the data to the disk. This way of storage not only helps storing a lot of small data quickly, but also fetching rows by the key or scanning ranges of rows. HBase is also an efficient database to store variably sized data, which is also required by our service.

> 像 HBase 这样的宽列数据库解决方案就可以轻松满足我们的这两个要求。 HBase 是一种面向列的键值 NoSQL 数据库，可以将一个键的多个值存储到多个列中。 HBase 仿照 Google 的 BigTable 建模，并在 Hadoop 分布式文件系统 (HDFS) 之上运行。 HBase 将数据分组在一起，将新数据存储在内存缓冲区中，一旦缓冲区已满，它将数据转储到磁盘。这种存储方式不仅有助于快速存储大量小数据，而且还可以通过键或扫描行范围来获取行。 HBase也是一个高效的数据库，可以存储不同大小的数据，这也是我们的服务所需要的。

**How should clients efficiently fetch data from the server?** Clients should paginate while fetching data from the server. Page size could be different for different clients, e.g., cell phones have smaller screens, so we need a fewer number of message/conversations in the viewport.

> 客户端应该如何高效地从服务器获取数据？客户端在从服务器获取数据时应该分页。对于不同的客户端，页面大小可能不同，例如，手机的屏幕较小，因此我们在视口中需要较少数量的消息/对话。

**c. Managing user’s status**

> **c.管理用户状态**

We need to keep track of user’s online/offline status and notify all the relevant users whenever a status change happens. Since we are maintaining a connection object on the server for all active users, we can easily figure out the user’s current status from this. With 500M active users at any time, if we have to

> 我们需要跟踪用户的在线/离线状态，并在状态发生变化时通知所有相关用户。由于我们在服务器上为所有活动用户维护一个连接对象，因此我们可以轻松地从中找出用户的当前状态。任何时候都有 5 亿活跃用户，如果我们必须的话

broadcast each status change to all the relevant active users, it will consume a lot of resources. We can do the following optimization around this:

> 将每个状态变化广播给所有相关的活跃用户，会消耗大量资源。围绕这一点我们可以做如下优化：

1. Whenever a client starts the app, it can pull the current status of all users in their friends’ list.

   > 每当客户端启动应用程序时，它都可以提取好友列表中所有用户的当前状态。

2. Whenever a user sends a message to another user that has gone offline, we can send a failure to the sender and update the status on the client.

   > 每当一个用户向另一个离线的用户发送消息时，我们可以向发送者并更新客户端上的状态。

3. Whenever a user comes online, the server can always broadcast that status with a delay of a few seconds to see if the user does not go offline immediately.

   > 每当用户上线时，服务器总是可以延迟几秒广播该状态秒查看用户是否没有立即离线。

4. Client’s can pull the status from the server about those users that are being shown on the user’s viewport. This should not be a frequent operation, as the server is broadcasting the online status of users and we can live with the stale offline status of users for a while.

   > 客户端可以从服务器获取有关用户的状态，这些状态显示在用户的视口。这不应该是一个频繁的操作，因为服务器正在广播在线状态用户的离线状态我们可以忍受一段时间。

5. Whenever the client starts a new chat with another user, we can pull the status at that time.

   > 每当客户端与另一个用户开始新的聊天时，我们就可以提取当时的状态。

Detailed component design for Facebook messenger

> Facebook Messenger 的详细组件设计

**Design Summary:** Clients will open a connection to the chat server to send a message; the server will then pass it to the requested user. All the active users will keep a connection open with the server to receive messages. Whenever a new message arrives, the chat server will push it to the receiving user on the long poll request. Messages can be stored in HBase, which supports quick small updates, and range

> 设计总结：客户端会打开一个到聊天服务器的连接来发送消息；然后服务器会将其传递给请求的用户。所有活动用户都将保持与服务器的连接以接收消息。每当有新消息到达时，聊天服务器都会通过长轮询请求将其推送给接收用户。消息可以存储在HBase中，支持快速小更新和范围

based searches. The servers can broadcast the online status of a user to other relevant users. Clients can pull status updates for users who are visible in the client’s viewport on a less frequent basis.

> 基于搜索。服务器可以向其他相关用户广播用户的在线状态。客户端可以不频繁地为在客户端视口中可见的用户拉取状态更新。

## 6. Data partitioning 

>6. 数据分区

Since we will be storing a lot of data (3.6PB for five years), we need to distribute it onto multiple database servers. What will be our partitioning scheme?

> 由于我们将存储大量数据（五年 3.6PB），因此我们需要将其分发到多个数据库服务器上。我们的分区方案是什么？

**Partitioning based on UserID:** Let’s assume we partition based on the hash of the UserID so that we can keep all messages of a user on the same database. If one DB shard is 4TB, we will have “3.6PB/4TB ~= 900” shards for five years. For simplicity, let’s assume we keep 1K shards. So we will find the shard number by “hash(UserID) % 1000” and then store/retrieve the data from there. This partitioning scheme will also be very quick to fetch chat history for any user.

> 基于 UserID 的分区：假设我们基于 UserID 的哈希进行分区，以便我们可以将用户的所有消息保存在同一个数据库中。如果一个数据库分片是 4TB，那么五年内我们将拥有“3.6PB/4TB ~= 900”个分片。为了简单起见，我们假设我们保留 1K 分片。因此，我们将通过“hash(UserID) % 1000”找到分片编号，然后从那里存储/检索数据。这种分区方案也可以非常快速地获取任何用户的聊天历史记录。

In the beginning, we can start with fewer database servers with multiple shards residing on one physical server. Since we can have multiple database instances on a server, we can easily store multiple partitions on a single server. Our hash function needs to understand this logical partitioning scheme so that it can map multiple logical partitions on one physical server.

> 一开始，我们可以从较少的数据库服务器开始，在一台物理服务器上驻留多个分片。由于我们可以在一台服务器上拥有多个数据库实例，因此我们可以轻松地在一台服务器上存储多个分区。我们的哈希函数需要理解这种逻辑分区方案，以便它可以在一台物理服务器上映射多个逻辑分区。

Since we will store an unlimited history of messages, we can start with a big number of logical partitions, which will be mapped to fewer physical servers, and as our storage demand increases, we can add more physical servers to distribute our logical partitions.

> 由于我们将存储无限的消息历史记录，因此我们可以从大量逻辑分区开始，这些逻辑分区将映射到更少的物理服务器，并且随着存储需求的增加，我们可以添加更多物理服务器来分布我们的逻辑分区。

**Partitioning based on MessageID:** If we store different messages of a user on separate database shards, fetching a range of messages of a chat would be very slow, so we should not adopt this scheme.

> 基于MessageID的分区：如果我们将一个用户的不同消息存储在不同的数据库分片上，那么获取一段聊天的一系列消息会非常慢，所以我们不应该采用这种方案。

## 7. Cache 

> 7. 缓存

We can cache a few recent messages (say last 15) in a few recent conversations that are visible in a user’s viewport (say last 5). Since we decided to store all of the user’s messages on one shard, cache for a user should entirely reside on one machine too.

> 我们可以在用户视口中可见的一些最近对话（例如最后 5 条）中缓存一些最近的消息（例如最后 15 条）。由于我们决定将所有用户的消息存储在一个分片上，因此用户的缓存也应该完全驻留在一台机器上。

## 8. Load balancing 

>8.负载均衡

We will need a load balancer in front of our chat servers; that can map each UserID to a server that holds the connection for the user and then direct the request to that server. Similarly, we would need a load balancer for our cache servers.

> 我们需要在聊天服务器前面有一个负载均衡器；它可以将每个 UserID 映射到保存用户连接的服务器，然后将请求定向到该服务器。同样，我们的缓存服务器需要一个负载平衡器。

## 9. Fault tolerance and Replication 

> 9. 容错和复制

**What will happen when a chat server fails?** Our chat servers are holding connections with the users. If a server goes down, should we devise a mechanism to transfer those connections to some other server? It’s extremely hard to failover TCP connections to other servers; an easier approach can be to have clients automatically reconnect if the connection is lost.

> 当聊天服务器出现故障时会发生什么？我们的聊天服务器与用户保持连接。如果服务器出现故障，我们是否应该设计一种机制将这些连接转移到其他服务器？将 TCP 连接故障转移到其他服务器非常困难；一种更简单的方法是让客户端在连接丢失时自动重新连接。

**Should we store multiple copies of user messages?** We cannot have only one copy of the user’s data, because if the server holding the data crashes or is down permanently, we don’t have any mechanism to

> 我们应该存储用户消息的多个副本吗？我们不能只有一份用户数据的副本，因为如果保存数据的服务器崩溃或永久关闭，我们没有任何机制可以

recover that data. For this, either we have to store multiple copies of the data on different servers or use techniques like Reed-Solomon encoding to distribute and replicate it.

> 恢复该数据。为此，我们要么必须在不同的服务器上存储数据的多个副本，要么使用 Reed-Solomon 编码等技术来分发和复制数据。

## 10. Extended Requirements 

> 10. 扩展要求

**a. Group chat**

> **a.群聊**

We can have separate group-chat objects in our system that can be stored on the chat servers. A group- chat object is identified by GroupChatID and will also maintain a list of people who are part of that chat. Our load balancer can direct each group chat message based on GroupChatID and the server handling that group chat can iterate through all the users of the chat to find the server handling the connection of each user to deliver the message.

> 我们可以在系统中拥有单独的群聊对象，这些对象可以存储在聊天服务器上。群聊对象由 GroupChatID 标识，并且还将维护属于该聊天的人员列表。我们的负载均衡器可以根据 GroupChatID 引导每个群聊消息，并且处理该群聊的服务器可以迭代所有聊天用户，找到处理每个用户连接的服务器来传递消息。

In databases, we can store all the group chats in a separate table partitioned based on GroupChatID.

> 在数据库中，我们可以将所有群聊存储在一个根据GroupChatID分区的单独表中。

**b. Push notifications**

> **b.推送通知**

In our current design user’s can only send messages to active users and if the receiving user is offline, we send a failure to the sending user. Push notifications will enable our system to send messages to offline users.

> 在我们当前的设计中，用户只能向活动用户发送消息，如果接收用户离线，我们会向发送用户发送失败消息。推送通知将使我们的系统能够向离线用户发送消息。

For Push notifications, each user can opt-in from their device (or a web browser) to get notifications whenever there is a new message or event. Each manufacturer maintains a set of servers that handles pushing these notifications to the user.

> 对于推送通知，每个用户都可以选择从他们的设备（或网络浏览器）接收通知，只要有新消息或事件。每个制造商都维护一组服务器来处理将这些通知推送给用户。

To have push notifications in our system, we would need to set up a Notification server, which will take the messages for offline users and send them to the manufacture’s push notification server, which will then send them to the user’s device.

> 要在我们的系统中添加推送通知，我们需要设置一个通知服务器，该服务器将获取离线用户的消息并将其发送到制造商的推送通知服务器，然后制造商的推送通知服务器将它们发送到用户的设备。
