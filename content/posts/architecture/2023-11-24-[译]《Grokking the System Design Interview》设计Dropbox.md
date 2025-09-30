---
title: "[译]《Grokking the System Design Interview》设计Dropbox"
date: 2023-11-24
slug: designing-dropbox
categories: ["architecture"]
tags: ['diary', 'learning']
---

这是一篇双语翻译的文章，原文出自 [grok_system_design_interview.pdf](https://github.com/sharanyaa/grok_sdi_educative/blob/master/grok_system_design_interview.pdf) 的一篇文章《Designing Dropbox》设计 Dropbox。

---

Let’s design a file hosting service like Dropbox or Google Drive. Cloud file storage enables users to store their data on remote servers. Usually, these servers are maintained by cloud storage providers and made available to users over a network (typically through the Internet). Users pay for their cloud data storage on a monthly basis. Similar Services: OneDrive, Google Drive Difficulty Level: Medium

> 让我们设计一个文件托管服务，例如 Dropbox 或 Google Drive。云文件存储使用户能够将数据存储在远程服务器上。通常，这些服务器由云存储提供商维护，并通过网络（通常通过互联网）提供给用户。用户按月支付云数据存储费用。类似服务：OneDrive、Google Drive 难度级别：中

## 1. Why Cloud Storage? 

>1. 为什么选择云存储？

Cloud file storage services have become very popular recently as they simplify the storage and exchange of digital resources among multiple devices. The shift from using single personal computers to using multiple devices with different platforms and operating systems such as smartphones and tablets each with portable access from various geographical locations at any time, is believed to be accountable for the huge popularity of cloud storage services. Following are some of the top benefits of such services:

> 云文件存储服务最近变得非常流行，因为它们简化了多个设备之间数字资源的存储和交换。从使用单一个人电脑到使用具有不同平台和操作系统的多个设备（例如智能手机和平板电脑）的转变，每个设备都可以随时从不同地理位置进行便携式访问，这被认为是云存储服务如此普及的原因。以下是此类服务的一些主要好处：

**Availability:** The motto of cloud storage services is to have data availability anywhere, anytime. Users can access their files/photos from any device whenever and wherever they like.

> 可用性：云存储服务的座右铭是随时随地提供数据可用性。用户可以随时随地从任何设备访问他们的文件/照片。

**Reliability and Durability:** Another benefit of cloud storage is that it offers 100% reliability and durability of data. Cloud storage ensures that users will never lose their data by keeping multiple copies of the data stored on different geographically located servers.

> 可靠性和持久性：云存储的另一个好处是它提供 100% 的数据可靠性和持久性。云存储通过将数据的多个副本存储在不同地理位置的服务器上，确保用户永远不会丢失数据。

**Scalability:** Users will never have to worry about getting out of storage space. With cloud storage you have unlimited storage as long as you are ready to pay for it.

> 可扩展性：用户永远不必担心存储空间不足。使用云存储，只要您准备好付费，您就可以拥有无​​限的存储空间。

If you haven’t used dropbox.com before, we would highly recommend creating an account there and uploading/editing a file and also going through the different options their service offers. This will help you a lot in understanding this chapter.

> 如果您以前没有使用过 dropbox.com，我们强烈建议您在那里创建一个帐户并上传/编辑文件，并查看他们的服务提供的不同选项。这将对你理解本章有很大帮助。

## 2. Requirements and Goals of the System 

>2. 系统的要求和目标

**You should always clarify requirements at the beginning of the interview. Be sure to ask questions to find the exact scope of the system that the interviewer has in mind.**

> **您应该始终在面试开始时澄清要求。一定要通过提问来找到面试官心目中系统的确切范围。**

What do we wish to achieve from a Cloud Storage system? Here are the top-level requirements for our system:

> 我们希望通过云存储系统实现什么目标？以下是我们系统的顶级要求：

1. Users should be able to upload and download their files/photos from any device.

   > 用户应该能够从任何设备上传和下载文件/照片。

2. Users should be able to share files or folders with other users.

   > 用户应该能够与其他用户共享文件或文件夹。

3. Our service should support automatic synchronization between devices, i.e., after updating a file on one device, it should get synchronized on all devices.

   > 我们的服务应该支持设备之间的自动同步，即更新文件后在一台设备上，它应该在所有设备上同步。

4. The system should support storing large files up to a GB.

   > 系统应支持存储高达 1 GB 的大文件。

5. ACID-ity is required. Atomicity, Consistency, Isolation and Durability of all file operations should be guaranteed. 
   需要ACID。所有文件操作的原子性、一致性、隔离性和持久性应该得到保证。

6. Our system should support offline editing. Users should be able to add/delete/modify files while offline, and as soon as they come online, all their changes should be synced to the remote servers and other online devices.

   > 我们的系统应该支持离线编辑。用户应该能够添加/删除/修改文件离线，一旦上线，所有更改都应同步到远程服务器和其他在线设备。

**Extended Requirements**

> **扩展要求**

- The system should support snapshotting of the data, so that users can go back to any version of the files.

> 系统应支持数据快照，以便用户可以返回到文件的任何版本。

## 3. Some Design Considerations 

> 3. 一些设计考虑

- We should expect huge read and write volumes.

  > 我们应该期待巨大的读写量。

- Read to write ratio is expected to be nearly the same.

  > 预计读写比率几乎相同。

- Internally, files can be stored in small parts or chunks (say 4MB); this can provide a lot of benefits i.e. all failed operations shall only be retried for smaller parts of a file. If a user fails to upload a file, then only the failing chunk will be retried.

  > 在内部，文件可以以小部分或块的形式存储（例如 4MB）；这可以提供很多好处是，所有失败的操作只能针对文件的较小部分重试。如果用户未能上传文件，则仅重试失败的块。

- We can reduce the amount of data exchange by transferring updated chunks only.

  > 我们可以通过仅传输更新的块来减少数据交换量。

- By removing duplicate chunks, we can save storage space and bandwidth usage.

  > 通过删除重复的块，我们可以节省存储空间和带宽使用。

- Keeping a local copy of the metadata (file name, size, etc.) with the client can save us a lot of round trips to the server.

  > 与客户端保存元数据（文件名、大小等）的本地副本可以为我们节省大量时间到服务器的往返。

- For small changes, clients can intelligently upload the diffs instead of the whole chunk.

  > 对于小的更改，客户端可以智能地上传差异而不是整个块。

## 4. Capacity Estimation and Constraints 

> 4. 容量估计和约束

- Let’s assume that we have 500M total users, and 100M daily active users (DAU).

  > 假设我们的总用户数为 5 亿，每日活跃用户 (DAU) 为 1 亿。

- Let’s assume that on average each user connects from three different devices.

  > 我们假设平均每个用户从三个不同的设备进行连接。

- On average if a user has 200 files/photos, we will have 100 billion total files.

  > 平均来说，如果一个用户有 200 个文件/照片，那么我们将拥有 1000 亿个文件总数。

- Let’s assume that average file size is 100KB, this would give us ten petabytes of total storage.

  > 假设平均文件大小为 100KB，这将为我们提供 10PB 的总存储空间。

  100B * 100KB => 10PB

- Let’s also assume that we will have one million active connections per minute.

  > 我们还假设每分钟有 100 万个活动连接。

## 5. High Level Design 

>5. 高层设计

The user will specify a folder as the workspace on their device. Any file/photo/folder placed in this folder will be uploaded to the cloud, and whenever a file is modified or deleted, it will be reflected in the same way in the cloud storage. The user can specify similar workspaces on all their devices and any modification done on one device will be propagated to all other devices to have the same view of the workspace everywhere.

> 用户将指定一个文件夹作为其设备上的工作区。放置在此文件夹中的任何文件/照片/文件夹都将上传到云端，并且每当修改或删除文件时，都会以相同的方式反映在云存储中。用户可以在其所有设备上指定类似的工作区，并且在一台设备上完成的任何修改都将传播到所有其他设备，以便在任何地方都具有相同的工作区视图。

At a high level, we need to store files and their metadata information like File Name, File Size, Directory, etc., and who this file is shared with. So, we need some servers that can help the clients to upload/download files to Cloud Storage and some servers that can facilitate updating metadata about files and users. We also need some mechanism to notify all clients whenever an update happens so they can synchronize their files.

> 在较高层面上，我们需要存储文件及其元数据信息，例如文件名、文件大小、目录等，以及与谁共享该文件。因此，我们需要一些可以帮助客户端上传/下载文件到云存储的服务器，以及一些可以帮助更新有关文件和用户的元数据的服务器。我们还需要某种机制来在发生更新时通知所有客户端，以便他们可以同步其文件。

As shown in the diagram below, Block servers will work with the clients to upload/download files from cloud storage and Metadata servers will keep metadata of files updated in a SQL or NoSQL database. Synchronization servers will handle the workflow of notifying all clients about different changes for synchronization.

> 如下图所示，块服务器将与客户端一起从云存储上传/下载文件，元数据服务器将在 SQL 或 NoSQL 数据库中更新文件的元数据。同步服务器将处理通知所有客户端有关同步的不同更改的工作流程。

![image-20231116095440771](../../../static/images/dropbox-01.webp)

High level design for Dropbox

> Dropbox 的高级设计

## 6. Component Design 

>6. 组件设计

Let’s go through the major components of our system one by one:

> 让我们一一浏览一下我们系统的主要组件：

**a. Client**

> **a. 客户端**

The Client Application monitors the workspace folder on the user’s machine and syncs all files/folders in it with the remote Cloud Storage. The client application will work with the storage servers to upload, download, and modify actual files to backend Cloud Storage. The client also interacts with the remote

> 客户端应用程序监视用户计算机上的工作区文件夹，并将其中的所有文件/文件夹与远程云存储同步。客户端应用程序将与存储服务器配合，将实际文件上传、下载和修改到后端云存储。客户端还与远程进行交互

Synchronization Service to handle any file metadata updates, e.g., change in the file name, size, modification date, etc.

> 同步服务处理任何文件元数据更新，例如文件名、大小、修改日期等的更改。

Here are some of the essential operations for the client:

> 以下是客户的一些基本操作：

1. Upload and download files.

   > 上传和下载文件。

2. Detect file changes in the workspace folder.

   > 检测工作区文件夹中的文件更改。

3. Handle conflict due to offline or concurrent updates.

   > 处理由于离线或并发更新而导致的冲突。

**How do we handle file transfer efficiently?** As mentioned above, we can break each file into smaller chunks so that we transfer only those chunks that are modified and not the whole file. Let’s say we divide each file into fixed sizes of 4MB chunks. We can statically calculate what could be an optimal chunk size based on 1) Storage devices we use in the cloud to optimize space utilization and input/output operations per second (IOPS) 2) Network bandwidth 3) Average file size in the storage etc. In our metadata, we should also keep a record of each file and the chunks that constitute it.

> 我们如何有效地处理文件传输？如上所述，我们可以将每个文件分成更小的块，以便我们只传输那些被修改的块，而不是整个文件。假设我们将每个文件划分为固定大小的 4MB 块。我们可以根据 1) 我们在云中使用的存储设备来静态计算最佳块大小，以优化空间利用率和每秒输入/输出操作 (IOPS) 2) 网络带宽 3) 存储中的平均文件大小等。在我们的元数据中，我们还应该保留每个文件及其构成块的记录。

**Should we keep a copy of metadata with Client?** Keeping a local copy of metadata not only enable us to do offline updates but also saves a lot of round trips to update remote metadata.

> 我们应该与客户保留一份元数据副本吗？保留元数据的本地副本不仅使我们能够进行离线更新，而且还节省了更新远程元数据的大量往返次数。

**How can clients efficiently listen to changes happening with other clients?** One solution could be that the clients periodically check with the server if there are any changes. The problem with this approach is that we will have a delay in reflecting changes locally as clients will be checking for changes periodically compared to a server notifying whenever there is some change. If the client frequently checks the server for changes, it will not only be wasting bandwidth, as the server has to return an empty response most of the time, but will also be keeping the server busy. Pulling information in this manner is not scalable.

> 客户如何有效地倾听其他客户发生的变化？一种解决方案是客户端定期检查服务器是否有任何更改。这种方法的问题在于，我们在本地反映更改时会出现延迟，因为与服务器在发生更改时通知服务器相比，客户端将定期检查更改。如果客户端频繁检查服务器是否有更改，则不仅会浪费带宽（因为服务器大多数时候必须返回空响应），而且还会使服务器保持忙碌。以这种方式拉取信息是不可扩展的。

A solution to the above problem could be to use HTTP long polling. With long polling the client requests information from the server with the expectation that the server may not respond immediately. If the server has no new data for the client when the poll is received, instead of sending an empty response, the server holds the request open and waits for response information to become available. Once it does have new information, the server immediately sends an HTTP/S response to the client, completing the open HTTP/S Request. Upon receipt of the server response, the client can immediately issue another server request for future updates.

> 解决上述问题的方法可能是使用 HTTP 长轮询。通过长轮询，客户端向服务器请求信息，并期望服务器可能不会立即响应。如果服务器在收到轮询时没有为客户端提供新数据，则服务器不会发送空响应，而是保持请求打开并等待响应信息可用。一旦有新信息，服务器立即向客户端发送 HTTP/S 响应，完成打开的 HTTP/S 请求。收到服务器响应后，客户端可以立即发出另一个服务器请求以进行将来的更新。

Based on the above considerations, we can divide our client into following four parts:

> 基于以上考虑，我们可以将客户分为以下四个部分：

I. **Internal Metadata Database** will keep track of all the files, chunks, their versions, and their location in the file system.

> 1. 内部元数据数据库将跟踪所有文件、块、它们的版本以及它们在文件系统中的位置。

II. **Chunker** will split the files into smaller pieces called chunks. It will also be responsible for reconstructing a file from its chunks. Our chunking algorithm will detect the parts of the files that have been modified by the user and only transfer those parts to the Cloud Storage; this will save us bandwidth and synchronization time.

> 2. Chunker 会将文件分割成更小的块，称为块。它还将负责从文件块中重建文件。我们的分块算法将检测文件中已被用户修改的部分，并仅将这些部分传输到云存储；这将为我们节省带宽和同步时间。

III. **Watcher** will monitor the local workspace folders and notify the Indexer (discussed below) of any action performed by the users, e.g. when users create, delete, or update files or folders. Watcher also listens to any changes happening on other clients that are broadcasted by Synchronization service.

> 3. 观察者将监视本地工作区文件夹并通知索引器（如下所述）用户执行的任何操作，例如当用户创建、删除或更新文件或文件夹时。观察者还侦听同步服务广播的其他客户端上发生的任何更改。

IV. **Indexer** will process the events received from the Watcher and update the internal metadata database with information about the chunks of the modified files. Once the chunks are successfully submitted/downloaded to the Cloud Storage, the Indexer will communicate with the remote Synchronization Service to broadcast changes to other clients and update remote metadata database.

> 4. 索引器将处理从观察器接收到的事件，并使用有关已修改文件块的信息更新内部元数据数据库。一旦块成功提交/下载到云存储，索引器将与远程同步服务通信，以将更改广播到其他客户端并更新远程元数据数据库。

![image-20231116095419475](../../../static/images/dropbox-02.webp)

**How should clients handle slow servers?** Clients should exponentially back-off if the server is busy/not-responding. Meaning, if a server is too slow to respond, clients should delay their retries and this delay should increase exponentially.

> 客户端应该如何处理缓慢的服务器？如果服务器繁忙/无响应，客户端应呈指数级后退。这意味着，如果服务器响应速度太慢，客户端应该延迟重试，并且这种延迟应该呈指数级增长。

**Should mobile clients sync remote changes immediately?** Unlike desktop or web clients, mobile clients usually sync on demand to save user’s bandwidth and space.

> 移动客户端是否应该立即同步远程更改？与桌面或 Web 客户端不同，移动客户端通常按需同步以节省用户的带宽和空间。

**b. Metadata Database**

> **b.元数据数据库**

The Metadata Database is responsible for maintaining the versioning and metadata information about files/chunks, users, and workspaces. The Metadata Database can be a relational database such as MySQL, or a NoSQL database service such as DynamoDB. Regardless of the type of the database, the Synchronization Service should be able to provide a consistent view of the files using a database, especially if more than one user is working with the same file simultaneously. Since NoSQL data stores do not support ACID properties in favor of scalability and performance, we need to incorporate the support for ACID properties programmatically in the logic of our Synchronization Service in case we

> 元数据数据库负责维护有关文件/块、用户和工作区的版本控制和元数据信息。元数据数据库可以是关系数据库（例如 MySQL），也可以是 NoSQL 数据库服务（例如 DynamoDB）。无论数据库的类型如何，同步服务都应该能够使用数据库提供一致的文件视图，特别是当多个用户同时使用同一文件时。由于 NoSQL 数据存储不支持 ACID 属性以支持可扩展性和性能，因此我们需要以编程方式将对 ACID 属性的支持合并到同步服务的逻辑中，以防万一

opt for this kind of database. However, using a relational database can simplify the implementation of the Synchronization Service as they natively support ACID properties.

> 选择这种数据库。但是，使用关系数据库可以简化同步服务的实现，因为它们本身支持 ACID 属性。

The metadata Database should be storing information about following objects:

> 元数据数据库应存储有关以下对象的信息：

1. Chunks 

   > 块

2. Files 

   > 文件

3. User 

   > 用户

4. Devices 

   > 设备

5. Workspace (sync folders)

   > 工作区（同步文件夹）

**c. Synchronization Service**

> **c. 同步服务**

The Synchronization Service is the component that processes file updates made by a client and applies these changes to other subscribed clients. It also synchronizes clients’ local databases with the information stored in the remote Metadata DB. The Synchronization Service is the most important part of the system architecture due to its critical role in managing the metadata and synchronizing users’ files. Desktop clients communicate with the Synchronization Service to either obtain updates from the Cloud Storage or send files and updates to the Cloud Storage and, potentially, other users. If a client was offline for a period, it polls the system for new updates as soon as they come online. When the Synchronization Service receives an update request, it checks with the Metadata Database for consistency and then proceeds with the update. Subsequently, a notification is sent to all subscribed users or devices to report the file update.

> 同步服务是处理客户端进行的文件更新并将这些更改应用到其他订阅客户端的组件。它还将客户端的本地数据库与远程元数据数据库中存储的信息同步。同步服务是系统架构中最重要的部分，因为它在管理元数据和同步用户文件方面发挥着关键作用。桌面客户端与同步服务进行通信，以从云存储获取更新，或将文件和更新发送到云存储以及可能的其他用户。如果客户端离线一段时间，它会在新更新上线后立即轮询系统以获取新更新。当同步服务收到更新请求时，它会检查元数据数据库的一致性，然后继续更新。随后，向所有订阅的用户或设备发送通知以报告文件更新。

The Synchronization Service should be designed in such a way that it transmits less data between clients and the Cloud Storage to achieve a better response time. To meet this design goal, the Synchronization Service can employ a differencing algorithm to reduce the amount of the data that needs to be synchronized. Instead of transmitting entire files from clients to the server or vice versa, we can just transmit the difference between two versions of a file. Therefore, only the part of the file that has been changed is transmitted. This also decreases bandwidth consumption and cloud data storage for the end user. As described above, we will be dividing our files into 4MB chunks and will be transferring modified chunks only. Server and clients can calculate a hash (e.g., SHA-256) to see whether to update the local copy of a chunk or not. On the server, if we already have a chunk with a similar hash (even from another user), we don’t need to create another copy, we can use the same chunk. This is discussed in detail later under Data Deduplication.

> 同步服务的设计方式应使其在客户端和云存储之间传输更少的数据，以实现更好的响应时间。为了实现这一设计目标，同步服务可以采用差分算法来减少需要同步的数据量。我们可以只传输文件的两个版本之间的差异，而不是将整个文件从客户端传输到服务器，反之亦然。因此，仅传输文件中已更改的部分。这也减少了最终用户的带宽消耗和云数据存储。如上所述，我们将把文件分成 4MB 的块，并且仅传输修改后的块。服务器和客户端可以计算哈希值（例如 SHA-256）来查看是否更新块的本地副本。在服务器上，如果我们已经有一个具有相似哈希值的块（甚至来自另一个用户），我们不需要创建另一个副本，我们可以使用相同的块。稍后将在重复数据删除中详细讨论这一点。

To be able to provide an efficient and scalable synchronization protocol we can consider using a communication middleware between clients and the Synchronization Service. The messaging middleware should provide scalable message queuing and change notifications to support a high number of clients using pull or push strategies. This way, multiple Synchronization Service instances can receive requests from a global request Queue, and the communication middleware will be able to balance its load.

> 为了能够提供高效且可扩展的同步协议，我们可以考虑在客户端和同步服务之间使用通信中间件。消息中间件应提供可扩展的消息队列和更改通知，以支持使用拉或推策略的大量客户端。这样，多个同步服务实例就可以从全局请求队列接收请求，并且通信中间件将能够平衡其负载。

**d. Message Queuing Service**

> **d.消息队列服务**

An important part of our architecture is a messaging middleware that should be able to handle a substantial number of requests. A scalable Message Queuing Service that supports asynchronous message-based communication between clients and the Synchronization Service best fits the requirements of our application. The Message Queuing Service supports asynchronous and loosely coupled message-based communication between distributed components of the system. The Message Queuing Service should be able to efficiently store any number of messages in a highly available, reliable and scalable queue.

> 我们架构的一个重要部分是消息传递中间件，它应该能够处理大量请求。支持客户端和同步服务之间基于异步消息的通信的可扩展消息队列服务最适合我们的应用程序的要求。消息队列服务支持系统的分布式组件之间的异步且松散耦合的基于消息的通信。消息队列服务应该能够在高度可用、可靠和可扩展的队列中有效地存储任意数量的消息。

The Message Queuing Service will implement two types of queues in our system. The Request Queue is a global queue and all clients will share it. Clients’ requests to update the Metadata Database will be sent to the Request Queue first, from there the Synchronization Service will take it to update metadata. The Response Queues that correspond to individual subscribed clients are responsible for delivering the update messages to each client. Since a message will be deleted from the queue once received by a client, we need to create separate Response Queues for each subscribed client to share update messages.

> 消息队列服务将在我们的系统中实现两种类型的队列。请求队列是一个全局队列，所有客户端都会共享它。客户端更新元数据数据库的请求将首先发送到请求队列，同步服务将从那里接收它来更新元数据。与各个订阅客户端相对应的响应队列负责将更新消息传递给每个客户端。由于消息一旦被客户端接收到就会从队列中删除，因此我们需要为每个订阅的客户端创建单独的响应队列以共享更新消息。

![image-20231116095353863](../../../static/images/dropbox-03.webp)

**e. Cloud/Block Storage**

> **e.云/块存储**

Cloud/Block Storage stores chunks of files uploaded by the users. Clients directly interact with the storage to send and receive objects from it. Separation of the metadata from storage enables us to use any storage either in the cloud or in-house.

> 云/块存储存储用户上传的文件块。客户端直接与存储交互以发送和接收对象。将元数据与存储分离使我们能够使用云中或内部的任何存储。

![image-20231116095337924](../../../static/images/dropbox-04.webp)

Detailed component design for Dropbox

> Dropbox 的详细组件设计

## 7. File Processing Workflow 

>7. 文件处理工作流程

The sequence below shows the interaction between the components of the application in a scenario when Client A updates a file that is shared with Client B and C, so they should receive the update too. If the other clients are not online at the time of the update, the Message Queuing Service keeps the update notifications in separate response queues for them until they come online later.

> 下面的序列显示了当客户端 A 更新与客户端 B 和 C 共享的文件时应用程序组件之间的交互，因此它们也应该收到更新。如果其他客户端在更新时未联机，则消息队列服务会将更新通知保留在单独的响应队列中，直到它们稍后联机。

1. Client A uploads chunks to cloud storage.

   > 客户端A将块上传到云存储。

2. Client A updates metadata and commits changes.

   > 客户端 A 更新元数据并提交更改。

3. Client A gets confirmation and notifications are sent to Clients B and C about the changes. 4. Client B and C receive metadata changes and download updated chunks.

   > 客户 A 获得确认，并向客户 B 和 C 发送有关更改的通知。 4. 客户端 B 和 C 接收元数据更改并下载更新的块。

## 8. Data Deduplication 

> 8. 重复数据删除

Data deduplication is a technique used for eliminating duplicate copies of data to improve storage utilization. It can also be applied to network data transfers to reduce the number of bytes that must be sent. For each new incoming chunk, we can calculate a hash of it and compare that hash with all the hashes of the existing chunks to see if we already have the same chunk present in our storage.

> 重复数据删除是一种用于消除数据重复副本以提高存储利用率的技术。它还可以应用于网络数据传输，以减少必须发送的字节数。对于每个新传入的块，我们可以计算它的哈希值，并将该哈希值与现有块的所有哈希值进行比较，以查看存储中是否已经存在相同的块。

We can implement deduplication in two ways in our system:

> 我们可以在系统中通过两种方式实现重复数据删除：

**a. Post-process deduplication**

> **a.后处理重复数据删除**

With post-process deduplication, new chunks are first stored on the storage device and later some process analyzes the data looking for duplication. The benefit is that clients will not need to wait for the hash calculation or lookup to complete before storing the data, thereby ensuring that there is no degradation in storage performance. Drawbacks of this approach are 1) We will unnecessarily be storing duplicate data, though for a short time, 2) Duplicate data will be transferred consuming bandwidth.

> 通过后处理重复数据删除，新的块首先存储在存储设备上，然后一些进程分析数据以查找重复项。这样做的好处是，客户端在存储数据之前不需要等待哈希计算或查找完成，从而确保存储性能不会下降。这种方法的缺点是 1) 我们将不必要地存储重复数据，尽管时间很短，2) 传输重复数据会消耗带宽。

**b. In-line deduplication**

> **b.在线重复数据删除**

Alternatively, deduplication hash calculations can be done in real-time as the clients are entering data on their device. If our system identifies a chunk that it has already stored, only a reference to the existing chunk will be added in the metadata, rather than a full copy of the chunk. This approach will give us optimal network and storage usage.

> 或者，当客户端在其设备上输入数据时，可以实时完成重复数据删除哈希计算。如果我们的系统识别出它已经存储的块，则只会在元数据中添加对现有块的引用，而不是块的完整副本。这种方法将为我们提供最佳的网络和存储利用率。

## 9. Metadata Partitioning 

> 9. 元数据分区

To scale out metadata DB, we need to partition it so that it can store information about millions of users and billions of files/chunks. We need to come up with a partitioning scheme that would divide and store our data in different DB servers.

> 为了横向扩展元数据数据库，我们需要对其进行分区，以便它可以存储有关数百万用户和数十亿文件/块的信息。我们需要提出一个分区方案，将数据划分并存储在不同的数据库服务器中。

**1. Vertical Partitioning:** We can partition our database in such a way that we store tables related to one particular feature on one server. For example, we can store all the user related tables in one database and all files/chunks related tables in another database. Although this approach is straightforward to implement it has some issues:

> 垂直分区：我们可以对数据库进行分区，以便在一台服务器上存储与某一特定功能相关的表。例如，我们可以将所有与用户相关的表存储在一个数据库中，并将所有文件/块相关的表存储在另一个数据库中。尽管这种方法实施起来很简单，但也存在一些问题：

1. Will we still have scale issues? What if we have trillions of chunks to be stored and our database cannot support storing such a huge number of records? How would we further partition such tables?

   > 我们还会遇到规模问题吗？如果我们有数万亿个块要存储，而我们的数据库无法支持存储如此大量的记录怎么办？我们如何进一步对这些表进行分区？

2. Joining two tables in two separate databases can cause performance and consistency issues. How frequently do we have to join user and file tables?

   > 连接两个独立数据库中的两个表可能会导致性能和一致性问题。我们需要多久连接一次用户表和文件表？

**2. Range Based Partitioning:** What if we store files/chunks in separate partitions based on the first letter of the File Path? In that case, we save all the files starting with the letter ‘A’ in one partition and those that start with the letter ‘B’ into another partition and so on. This approach is called range based partitioning. We can even combine certain less frequently occurring letters into one database partition. We should come up with this partitioning scheme statically so that we can always store/find a file in a predictable manner.

> 基于范围的分区：如果我们根据文件路径的第一个字母将文件/块存储在单独的分区中会怎样？在这种情况下，我们将以字母“A”开头的所有文件保存在一个分区中，将所有以字母“B”开头的文件保存到另一个分区中，依此类推。这种方法称为基于范围的分区。我们甚至可以将某些不常出现的字母合并到一个数据库分区中。我们应该静态地提出这个分区方案，以便我们始终可以以可预测的方式存储/查找文件。

The main problem with this approach is that it can lead to unbalanced servers. For example, if we decide to put all files starting with the letter ‘E’ into a DB partition, and later we realize that we have too many files that start with the letter ‘E’, to such an extent that we cannot fit them into one DB partition.

> 这种方法的主要问题是它可能导致服务器不平衡。例如，如果我们决定将所有以字母“E”开头的文件放入数据库分区，后来我们发现以字母“E”开头的文件太多了，以至于我们无法容纳它们到一个数据库分区。

**3. Hash-Based Partitioning:** In this scheme we take a hash of the object we are storing and based on this hash we figure out the DB partition to which this object should go. In our case, we can take the

> 3.基于散列的分区：在这个方案中，我们对我们存储的对象进行散列，并根据这个散列，我们计算出该对象应该进入的数据库分区。在我们的例子中，我们可以采取

hash of the ‘FileID’ of the File object we are storing to determine the partition the file will be stored. Our hashing function will randomly distribute objects into different partitions, e.g., our hashing function can always map any ID to a number between [1…256], and this number would be the partition we will store our object.

> 我们要存储的 File 对象的“FileID”的哈希值，以确定文件将存储的分区。我们的哈希函数会将对象随机分配到不同的分区中，例如，我们的哈希函数总是可以将任何 ID 映射到 [1…256] 之间的数字，而这个数字将是我们将存储对象的分区。

This approach can still lead to overloaded partitions, which can be solved by using Consistent Hashing.

> 这种方法仍然会导致分区过载，这可以通过使用一致性哈希来解决。

## 10. Caching 

>10. 缓存

We can have two kinds of caches in our system. To deal with hot files/chunks we can introduce a cache for Block storage. We can use an off-the-shelf solution like Memcached that can store whole chunks with its respective IDs/Hashes and Block servers before hitting Block storage can quickly check if the cache has desired chunk. Based on clients’ usage pattern we can determine how many cache servers we need. A high-end commercial server can have 144GB of memory; one such server can cache 36K chunks.

> 我们的系统中可以有两种缓存。为了处理热文件/块，我们可以引入块存储的缓存。我们可以使用像 Memcached 这样的现成解决方案，它可以存储整个块及其各自的 ID/哈希值，并且块服务器在访问块存储之前可以快速检查缓存是否有所需的块。根据客户的使用模式，我们可以确定需要多少个缓存服务器。高端商用服务器可以有144GB内存；一台这样的服务器可以缓存 36K 块。

**Which cache replacement policy would best fit our needs?** When the cache is full, and we want to replace a chunk with a newer/hotter chunk, how would we choose? Least Recently Used (LRU) can be a reasonable policy for our system. Under this policy, we discard the least recently used chunk first. Load Similarly, we can have a cache for Metadata DB.

> 哪种缓存替换策略最适合我们的需求？当缓存已满时，我们想用更新/更热的块替换一个块，我们会如何选择？最近最少使用（LRU）对于我们的系统来说是一个合理的策略。根据这个策略，我们首先丢弃最近最少使用的块。加载 类似地，我们可以为元数据数据库提供缓存。

## 11. Load Balancer (LB) 

>11.负载均衡器（LB）

We can add the Load balancing layer at two places in our system: 1) Between Clients and Block servers and 2) Between Clients and Metadata servers. Initially, a simple Round Robin approach can be adopted that distributes incoming requests equally among backend servers. This LB is simple to implement and does not introduce any overhead. Another benefit of this approach is if a server is dead, LB will take it out of the rotation and will stop sending any traffic to it. A problem with Round Robin LB is, it won’t take server load into consideration. If a server is overloaded or slow, the LB will not stop sending new requests to that server. To handle this, a more intelligent LB solution can be placed that periodically queries backend server about their load and adjusts traffic based on that.

> 我们可以在系统中的两个位置添加负载平衡层：1）客户端和块服务器之间以及2）客户端和元数据服务器之间。最初，可以采用简单的循环方法，在后端服务器之间平均分配传入请求。该LB实现简单，不会引入任何开销。这种方法的另一个好处是，如果服务器死机，LB 会将其从轮换中删除，并停止向其发送任何流量。循环负载均衡的一个问题是，它不会考虑服务器负载。如果服务器过载或速度缓慢，负载均衡器不会停止向该服务器发送新请求。为了解决这个问题，可以放置更智能的 LB 解决方案，定期查询后端服务器的负载并据此调整流量。

## 12. Security, Permissions and File Sharing 

>12. 安全、权限和文件共享

One of the primary concerns users will have while storing their files in the cloud is the privacy and security of their data, especially since in our system users can share their files with other users or even make them public to share it with everyone. To handle this, we will be storing the permissions of each file in our metadata DB to reflect what files are visible or modifiable by any user.

> 用户在云中存储文件时最关心的问题之一是数据的隐私和安全，特别是因为在我们的系统中，用户可以与其他用户共享他们的文件，甚至将它们公开以与所有人共享。为了解决这个问题，我们将在元数据数据库中存储每个文件的权限，以反映哪些文件对任何用户可见或可修改。
