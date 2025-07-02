---
title: "[译]《Grokking the System Design Interview》设计Instagram"
date: 2023-11-24
slug: designing-instagram
categories: ["architecture"]
tags: ["architecture"]

---

这是一篇双语翻译的文章，原文出自 [grok_system_design_interview.pdf](https://github.com/sharanyaa/grok_sdi_educative/blob/master/grok_system_design_interview.pdf) 的一篇文章《Designing Instagram》设计 Instagram。

---

Let’s design a photo-sharing service like Instagram, where users can upload photos to share them with other users. Similar Services: Flickr, Picasa Difficulty Level: Medium

> 让我们设计一个像 Instagram 这样的照片共享服务，用户可以上传照片与其他用户共享。类似服务：Flickr、Picasa 难度级别：中

## 1. What is Instagram? 

> 1.Instagram是什么？

Instagram is a social networking service which enables its users to upload and share their photos and videos with other users. Instagram users can choose to share information either publicly or privately. Anything shared publicly can be seen by any other user, whereas privately shared content can only be accessed by a specified set of people. Instagram also enables its users to share through many other social networking platforms, such as Facebook, Twitter, Flickr, and Tumblr.

> Instagram 是一项社交网络服务，用户可以通过它上传照片和视频并与其他用户分享。 Instagram 用户可以选择公开或私下分享信息。任何其他用户都可以看到公开共享的任何内容，而私人共享的内容只能由指定的一组人访问。 Instagram 还允许用户通过许多其他社交网络平台进行分享，例如 Facebook、Twitter、Flickr 和 Tumblr。

For the sake of this exercise, we plan to design a simpler version of Instagram, where a user can share photos and can also follow other users. The ‘News Feed’ for each user will consist of top photos of all the people the user follows.

> 为了这个练习，我们计划设计一个更简单的 Instagram 版本，用户可以在其中分享照片，也可以关注其他用户。每个用户的“新闻源”将包含该用户关注的所有人的热门照片。

## 2. Requirements and Goals of the System 

> 2. 系统的要求和目标

We’ll focus on the following set of requirements while designing the Instagram:

> 在设计 Instagram 时，我们将重点关注以下一组要求：

**Functional Requirements**

> **功能要求**

1. Users should be able to upload/download/view photos.

   > 用户应该能够上传/下载/查看照片。

2. Users can perform searches based on photo/video titles.

   > 用户可以根据照片/视频标题执行搜索。

3. Users can follow other users.

   > 用户可以关注其他用户。

4. The system should be able to generate and display a user’s News Feed consisting of top photos from all the people the user follows.

   > 系统应该能够生成并显示由热门照片组成的用户动态消息来自用户关注的所有人。

**Non-functional Requirements**

> **非功能性需求**

1. Our service needs to be highly available.

   > 我们的服务需要高度可用。

2. The acceptable latency of the system is 200ms for News Feed generation.

   > 对于 News Feed 生成，系统可接受的延迟为 200 毫秒。

3. Consistency can take a hit (in the interest of availability), if a user doesn’t see a photo for a while; it should be fine.

   > 如果用户没有看到某个时间的照片，一致性可能会受到影响（为了可用性）尽管;应该没问题。

4. The system should be highly reliable; any uploaded photo or video should never be lost.

   > 系统应具有高可靠性；任何上传的照片或视频都不应丢失。

**Not in scope:** Adding tags to photos, searching photos on tags, commenting on photos, tagging users to photos, who to follow, etc.

> 不在范围内：为照片添加标签、在标签上搜索照片、评论照片、为照片标记用户、关注谁等。

## 3. Some Design Considerations 

>3. 一些设计考虑

The system would be read-heavy, so we will focus on building a system that can retrieve photos quickly.

> 该系统的读取量很大，因此我们将专注于构建一个可以快速检索照片的系统。

1. Practically, users can upload as many photos as they like. Efficient management of storage should be a crucial factor while designing this system.

   > 实际上，用户可以上传任意数量的照片。设计该系统时，有效的存储管理应该是一个关键因素。

2. Low latency is expected while viewing photos.

   > 查看照片时预计延迟较低。

3. Data should be 100% reliable. If a user uploads a photo, the system will guarantee that it will never be lost. 

   > 数据应该100%可靠。如果用户上传照片，系统将保证它会永远不会迷失。

## 4. Capacity Estimation and Constraints 

> 4. 容量估计和约束

- Let’s assume we have 500M total users, with 1M daily active users.

  > 假设我们有 5 亿总用户，其中每日活跃用户为 100 万。

- 2M new photos every day, 23 new photos every second.

  > 每天 200 万张新照片，每秒 23 张新照片。

- Average photo file size => 200KB

  > 平均照片文件大小 => 200KB

- Total space required for 1 day of photos

  > 1 天照片所需的总空间

  2M * 200KB => 400 GB

- Total space required for 10 years: 400GB * 365 (days a year) * 10 (years) ~= 1425TB

  > 10年所需总空间：400GB * 365（一年天）* 10（年）~= 1425TB

## 5. High Level System Design 

>5. 高层系统设计

At a high-level, we need to support two scenarios, one to upload photos and the other to view/search photos. Our service would need some object storage servers to store photos and also some database servers to store metadata information about the photos.

> 在高层，我们需要支持两种场景，一种是上传照片，另一种是查看/搜索照片。我们的服务需要一些对象存储服务器来存储照片，还需要一些数据库服务器来存储有关照片的元数据信息。

![instagram-01](../../../static/images/instagram-01-0729143.webp)

## 6. Database Schema 

> 6. 数据库架构

**Defining the DB schema in the early stages of the interview would help to understand the data flow among various components and later would guide towards data partitioning.**

> **在面试的早期阶段定义数据库模式将有助于理解各个组件之间的数据流，并在以后指导数据分区。**

We need to store data about users, their uploaded photos, and people they follow. Photo table will store all data related to a photo; we need to have an index on (PhotoID, CreationDate) since we need to fetch recent photos first.

> 我们需要存储有关用户、他们上传的照片以及他们关注的人的数据。照片表将存储与照片相关的所有数据；我们需要在 (PhotoID, CreationDate) 上有一个索引，因为我们需要首先获取最近的照片。

![instagram-02](../../../static/images/instagram-02-0729143.webp)

A straightforward approach for storing the above schema would be to use an RDBMS like MySQL since we require joins. But relational databases come with their challenges, especially when we need to scale them. For details, please take a look at SQL vs. NoSQL.

> 存储上述模式的一个简单方法是使用像 MySQL 这样的 RDBMS，因为我们需要连接。但关系数据库也面临着挑战，尤其是当我们需要扩展它们时。有关详细信息，请查看 SQL 与 NoSQL。

We can store photos in a distributed file storage like HDFS or S3.

> 我们可以将照片存储在 HDFS 或 S3 等分布式文件存储中。

We can store the above schema in a distributed key-value store to enjoy the benefits offered by NoSQL. All the metadata related to photos can go to a table where the ‘key’ would be the ‘PhotoID’ and the ‘value’ would be an object containing PhotoLocation, UserLocation, CreationTimestamp, etc.

> 我们可以将上述模式存储在分布式键值存储中，以享受 NoSQL 提供的好处。所有与照片相关的元数据都可以进入一个表，其中“键”是“PhotoID”，“值”是包含 PhotoLocation、UserLocation、CreationTimestamp 等的对象。

We need to store relationships between users and photos, to know who owns which photo. We also need to store the list of people a user follows. For both of these tables, we can use a wide-column datastore like Cassandra. For the ‘UserPhoto’ table, the ‘key’ would be ‘UserID’ and the ‘value’ would be the list of ‘PhotoIDs’ the user owns, stored in different columns. We will have a similar scheme for the ‘UserFollow’ table.

> 我们需要存储用户和照片之间的关系，以了解谁拥有哪张照片。我们还需要存储用户关注的人员列表。对于这两个表，我们可以使用像 Cassandra 这样的宽列数据存储。对于“UserPhoto”表，“键”将是“UserID”，“值”将是用户拥有的“PhotoID”列表，存储在不同的列中。我们将为“UserFollow”表提供类似的方案。

Cassandra or key-value stores in general, always maintain a certain number of replicas to offer reliability. Also, in such data stores, deletes don’t get applied instantly, data is retained for certain days (to support undeleting) before getting removed from the system permanently.

> Cassandra 或键值存储通常始终维护一定数量的副本以提供可靠性。此外，在此类数据存储中，删除不会立即应用，数据会保留一定天数（以支持取消删除），然后从系统中永久删除。

## 7. Data Size Estimation 

>7. 数据大小估计

Let’s estimate how much data will be going into each table and how much total storage we will need for 10 years.

> 让我们估计一下每个表中将有多少数据以及 10 年需要多少总存储空间。

**User:** Assuming each “int” and “dateTime” is four bytes, each row in the User’s table will be of 68 bytes:

> User：假设每个“int”和“dateTime”都是4个字节，则User表中的每行将有68个字节：

UserID (4 bytes) + Name (20 bytes) + Email (32 bytes) + DateOfBirth (4 bytes) + CreationDate (4 bytes) + LastLogin (4 bytes) = 68 bytes

> 用户 ID（4 字节）+ 姓名（20 字节）+ 电子邮件（32 字节）+ 出生日期（4 字节）+ 创建日期（4 字节）+ 最后登录（4 字节）= 68 字节

If we have 500 million users, we will need 32GB of total storage.

> 如果我们有 5 亿用户，我们将需要 32GB 的总存储空间。

500 million * 68 ~= 32GB

**Photo:** Each row in Photo’s table will be of 284 bytes:

> Photo：Photo 表中的每一行都是 284 字节：

PhotoID (4 bytes) + UserID (4 bytes) + PhotoPath (256 bytes) + PhotoLatitude (4 bytes) + PhotLongitude(4 bytes) + UserLatitude (4 bytes) + UserLongitude (4 bytes) + CreationDate (4 bytes) = 284 bytes

> PhotoID（4 字节）+ UserID（4 字节）+ PhotoPath（256 字节）+ PhotoLatitude（4 字节）+ PhotoLongitude（4 字节）+ UserLatitude（4 字节）+ UserLongitude（4 字节）+ CreationDate（4 字节）= 284 字节

If 2M new photos get uploaded every day, we will need 0.5GB of storage for one day:

> 如果每天上传 200 万张新照片，我们一天需要 0.5GB 的存储空间：

2M * 284 bytes ~= 0.5GB per day

> 2M * 284 字节 ~= 0.5GB 每天

For 10 years we will need 1.88TB of storage.

> 10 年内我们将需要 1.88TB 的存储空间。

**UserFollow:** Each row in the UserFollow table will consist of 8 bytes. If we have 500 million users and on average each user follows 500 users. We would need 1.82TB of storage for the UserFollow table:

> UserFollow：UserFollow 表中的每一行由 8 个字节组成。如果我们有 5 亿用户，平均每个用户关注 500 个用户。我们需要 1.82TB 的存储空间用于 UserFollow 表：

500 million users * 500 followers * 8 bytes ~= 1.82TB

> 5 亿用户 * 500 个关注者 * 8 字节 ~= 1.82TB

Total space required for all tables for 10 years will be 3.7TB:

> 10 年所有表所需的总空间将为 3.7TB：

32GB + 1.88TB + 1.82TB ~= 3.7TB

## 8. Component Design 

> 8. 组件设计

Photo uploads (or writes) can be slow as they have to go to the disk, whereas reads will be faster, especially if they are being served from cache.

> 照片上传（或写入）可能会很慢，因为它们必须写入磁盘，而读取会更快，尤其是从缓存提供服务时。

Uploading users can consume all the available connections, as uploading is a slow process. This means that ‘reads’ cannot be served if the system gets busy with all the write requests. We should keep in mind that web servers have a connection limit before designing our system. If we assume that a web server can have a maximum of 500 connections at any time, then it can’t have more than 500 concurrent uploads or reads. To handle this bottleneck we can split reads and writes into separate services. We will have dedicated servers for reads and different servers for writes to ensure that uploads don’t hog the system.

> 上传用户可能会消耗所有可用连接，因为上传是一个缓慢的过程。这意味着如果系统忙于处理所有写入请求，则无法提供“读取”服务。在设计我们的系统之前，我们应该记住网络服务器有连接限制。如果我们假设一个 Web 服务器在任何时候最多可以有 500 个连接，那么它的并发上传或读取就不能超过 500 个。为了解决这个瓶颈，我们可以将读取和写入拆分为单独的服务。我们将拥有专门的读取服务器和不同的写入服务器，以确保上传不会占用系统。

Separating photos’ read and write requests will also allow us to scale and optimize each of these operations independently.

> 分离照片的读取和写入请求还将使我们能够独立扩展和优化每个操作。

![instagram-03](../../../static/images/instagram-03-0729143.webp)

## 9. Reliability and Redundancy 

>9. 可靠性和冗余性

Losing files is not an option for our service. Therefore, we will store multiple copies of each file so that if one storage server dies we can retrieve the photo from the other copy present on a different storage server.

> 我们的服务不允许丢失文件。因此，我们将存储每个文件的多个副本，以便如果一个存储服务器出现故障，我们可以从不同存储服务器上存在的另一个副本中检索照片。

This same principle also applies to other components of the system. If we want to have high availability of the system, we need to have multiple replicas of services running in the system, so that if a few services die down the system still remains available and running. Redundancy removes the single point of failure in the system.

> 同样的原理也适用于系统的其他组件。如果我们希望系统具有高可用性，我们需要在系统中运行多个服务副本，以便在少数服务停止运行时系统仍然保持可用并运行。冗余消除了系统中的单点故障。

If only one instance of a service is required to run at any point, we can run a redundant secondary copy of the service that is not serving any traffic, but it can take control after the failover when primary has a problem.

> 如果某个服务在任何时候只需要运行一个实例，我们可以运行该服务的冗余辅助副本，该副本不提供任何流量，但当主服务器出现问题时，它可以在故障转移后接管控制权。

Creating redundancy in a system can remove single points of failure and provide a backup or spare functionality if needed in a crisis. For example, if there are two instances of the same service running in production and one fails or degrades, the system can failover to the healthy copy. Failover can happen automatically or require manual intervention.

> 在系统中创建冗余可以消除单点故障，并在危机中需要时提供备份或备用功能。例如，如果同一服务有两个实例在生产中运行，其中一个实例出现故障或性能下降，系统可以故障转移到正常副本。故障转移可以自动发生或需要手动干预。

![instagram-04](../../../static/images/instagram-04-0729143.webp)

## 10. Data Sharding 

> 10. 数据分片

Let’s discuss different schemes for metadata sharding:

> 让我们讨论元数据分片的不同方案：

**a. Partitioning based on UserID** Let’s assume we shard based on the ‘UserID’ so that we can keep all photos of a user on the same shard. If one DB shard is 1TB, we will need four shards to store 3.7TB of data. Let’s assume for better performance and scalability we keep 10 shards.

> a. 基于 UserID 的分区 假设我们基于“UserID”进行分片，以便我们可以将用户的所有照片保留在同一个分片上。如果一个数据库分片为 1TB，我们将需要四个分片来存储 3.7TB 的数据。假设为了获得更好的性能和可扩展性，我们保留 10 个分片。

So we’ll find the shard number by UserID % 10 and then store the data there. To uniquely identify any photo in our system, we can append shard number with each PhotoID.

> 因此，我们将通过 UserID % 10 找到分片编号，然后将数据存储在那里。为了唯一地标识我们系统中的任何照片，我们可以为每个 PhotoID 附加分片编号。

**How can we generate PhotoIDs?** Each DB shard can have its own auto-increment sequence for PhotoIDs and since we will append ShardID with each PhotoID, it will make it unique throughout our system.

> 我们如何生成 PhotoID？每个数据库分片都可以有自己的 PhotoID 自动递增序列，并且由于我们将在每个 PhotoID 后附加 ShardID，这将使其在整个系统中是唯一的。

**What are the different issues with this partitioning scheme?**

> **这种分区方案有哪些不同的问题？**

1. How would we handle hot users? Several people follow such hot users and a lot of other people see any photo they upload.

   > 我们如何处理热门用户？有几个人关注这些热门用户，很多其他人都会看到他们上传的任何照片。

2. Some users will have a lot of photos compared to others, thus making a non-uniform distribution of storage.

   > 与其他用户相比，某些用户会拥有大量照片，从而导致存储分布不均匀。

3. What if we cannot store all pictures of a user on one shard? If we distribute photos of a user onto multiple shards will it cause higher latencies?

   > 如果我们无法将用户的所有图片存储在一个分片上怎么办？如果我们将用户的照片分发到多个分片上会导致更高的延迟吗？

4. Storing all photos of a user on one shard can cause issues like unavailability of all of the user’s data if that shard is down or higher latency if it is serving high load etc.

   > 将用户的所有照片存储在一个分片上可能会导致一些问题，例如，如果该分片已关闭，则所有用户的数据将不可用；如果该分片提供高负载服务，则延迟会更高等。

**b. Partitioning based on PhotoID** If we can generate unique PhotoIDs first and then find a shard number through “PhotoID % 10”, the above problems will have been solved. We would not need to append ShardID with PhotoID in this case as PhotoID will itself be unique throughout the system.

> b.基于PhotoID的分区如果我们能够先生成唯一的PhotoID，然后通过“PhotoID % 10”找到分片编号，那么上述问题就迎刃而解了。在这种情况下，我们不需要将 ShardID 与 PhotoID 一起附加，因为 PhotoID 本身在整个系统中是唯一的。

**How can we generate PhotoIDs?** Here we cannot have an auto-incrementing sequence in each shard to define PhotoID because we need to know PhotoID first to find the shard where it will be stored. One solution could be that we dedicate a separate database instance to generate auto-incrementing IDs. If our PhotoID can fit into 64 bits, we can define a table containing only a 64 bit ID field. So whenever we would like to add a photo in our system, we can insert a new row in this table and take that ID to be our PhotoID of the new photo.

> 我们如何生成 PhotoID？这里我们不能在每个分片中使用自动递增序列来定义 PhotoID，因为我们需要首先知道 PhotoID 才能找到存储它的分片。一种解决方案是我们专门使用一个单独的数据库实例来生成自动递增的 ID。如果我们的 PhotoID 可以容纳 64 位，我们就可以定义一个仅包含 64 位 ID 字段的表。因此，每当我们想在系统中添加照片时，我们都可以在此表中插入一个新行，并将该 ID 作为新照片的 PhotoID。

**Wouldn’t this key generating DB be a single point of failure?** Yes, it would be. A workaround for that could be defining two such databases with one generating even numbered IDs and the other odd numbered. For the MySQL, the following script can define such sequences:

> 这个密钥生成数据库不会出现单点故障吗？是的，会的。一种解决方法是定义两个这样的数据库，其中一个生成偶数编号的 ID，另一个生成奇数编号的 ID。对于MySQL，以下脚本可以定义这样的序列：

```
KeyGeneratingServer1:
auto-increment-increment = 2
auto-increment-offset = 1
KeyGeneratingServer2:
auto-increment-increment = 2
auto-increment-offset = 2
```

We can put a load balancer in front of both of these databases to round robin between them and to deal with downtime. Both these servers could be out of sync with one generating more keys than the other, but this will not cause any issue in our system. We can extend this design by defining separate ID tables for Users, Photo-Comments, or other objects present in our system.

> 我们可以在这两个数据库前面放置一个负载均衡器，以在它们之间进行循环并处理停机时间。这两台服务器可能会不同步，其中一台生成的密钥多于另一台，但这不会在我们的系统中造成任何问题。我们可以通过为用户、照片评论或系统中存在的其他对象定义单独的 ID 表来扩展此设计。

**Alternately,** we can implement a ‘key’ generation scheme similar to what we have discussed in Designing a URL Shortening service like TinyURL.

> 或者，我们可以实现一个“密钥”生成方案，类似于我们在设计类似 TinyURL 的 URL 缩短服务中讨论的方案。

**How can we plan for the future growth of our system?** We can have a large number of logical partitions to accommodate future data growth, such that in the beginning, multiple logical partitions reside on a single physical database server. Since each database server can have multiple database instances on it, we can have separate databases for each logical partition on any server. So whenever we feel that a particular database server has a lot of data, we can migrate some logical partitions from it to another server. We can maintain a config file (or a separate database) that can map our logical partitions to database servers; this will enable us to move partitions around easily. Whenever we want to move a partition, we only have to update the config file to announce the change.

> 我们如何规划系统的未来发展？我们可以拥有大量的逻辑分区来适应未来的数据增长，这样在开始时，多个逻辑分区驻留在单个物理数据库服务器上。由于每个数据库服务器上可以有多个数据库实例，因此我们可以为任何服务器上的每个逻辑分区拥有单独的数据库。因此，每当我们感觉某个特定的数据库服务器有大量数据时，我们就可以将其中的一些逻辑分区迁移到另一台服务器上。我们可以维护一个配置文件（或一个单独的数据库），它可以将我们的逻辑分区映射到数据库服务器；这将使我们能够轻松移动分区。每当我们想要移动分区时，我们只需更新配置文件即可宣布更改。

## 11. Ranking and News Feed Generation 

> 11. 排名和动态消息生成

To create the News Feed for any given user, we need to fetch the latest, most popular and relevant photos of the people the user follows.

> 要为任何给定用户创建新闻源，我们需要获取用户关注的人的最新、最受欢迎和相关的照片。

For simplicity, let’s assume we need to fetch top 100 photos for a user’s News Feed. Our application server will first get a list of people the user follows and then fetch metadata info of latest 100 photos from each user. In the final step, the server will submit all these photos to our ranking algorithm which will determine the top 100 photos (based on recency, likeness, etc.) and return them to the user. A possible problem with this approach would be higher latency as we have to query multiple tables and perform sorting/merging/ranking on the results. To improve the efficiency, we can pre-generate the News Feed and store it in a separate table.

> 为了简单起见，我们假设我们需要获取用户动态消息中的前 100 张照片。我们的应用程序服务器将首先获取用户关注的人员列表，然后从每个用户获取最新 100 张照片的元数据信息。在最后一步中，服务器会将所有这些照片提交给我们的排名算法，该算法将确定前 100 张照片（基于新近度、相似度等）并将其返回给用户。这种方法的一个可能的问题是更高的延迟，因为我们必须查询多个表并对结果执行排序/合并/排名。为了提高效率，我们可以预先生成News Feed，并将其存储在单独的表中。

**Pre-generating the News Feed:** We can have dedicated servers that are continuously generating users’ News Feeds and storing them in a ‘UserNewsFeed’ table. So whenever any user needs the latest photos for their News Feed, we will simply query this table and return the results to the user.

> 预生成新闻源：我们可以拥有专用服务器，不断生成用户的新闻源并将其存储在“UserNewsFeed”表中。因此，每当任何用户需要为其动态消息提供最新照片时，我们都会简单地查询此表并将结果返回给用户。

Whenever these servers need to generate the News Feed of a user, they will first query the UserNewsFeed table to find the last time the News Feed was generated for that user. Then, new News Feed data will be generated from that time onwards (following the steps mentioned above).

> 每当这些服务器需要生成用户的新闻源时，它们将首先查询 UserNewsFeed 表以查找上次为该用户生成新闻源的时间。然后，将从那时起生成新的新闻源数据（按照上述步骤）。

> **What are the different approaches for sending News Feed contents to the users?
> 向用户发送动态消息内容有哪些不同的方法？**

**1. Pull:** Clients can pull the News Feed contents from the server on a regular basis or manually whenever they need it. Possible problems with this approach are a) New data might not be shown to the users until clients issue a pull request b) Most of the time pull requests will result in an empty response if there is no new data.

> 1.拉取：客户端可以定期或在需要时手动从服务器拉取News Feed内容。这种方法可能存在的问题是：a）在客户端发出拉取请求之前，新数据可能不会显示给用户。b）大多数情况下，如果没有新数据，拉取请求将导致空响应。

**2. Push:** Servers can push new data to the users as soon as it is available. To efficiently manage this, users have to maintain a Long Poll request with the server for receiving the updates. A possible problem with this approach is, a user who follows a lot of people or a celebrity user who has millions of followers; in this case, the server has to push updates quite frequently.

> 2.推送：服务器可以将新数据推送给用户。为了有效地管理这一点，用户必须与服务器保持长轮询请求以接收更新。这种方法可能存在的问题是，关注很多人的用户或拥有数百万关注者的名人用户；在这种情况下，服务器必须非常频繁地推送更新。

**3. Hybrid:** We can adopt a hybrid approach. We can move all the users who have a high number of follows to a pull-based model and only push data to those users who have a few hundred (or thousand) follows. Another approach could be that the server pushes updates to all the users not more than a certain frequency, letting users with a lot of follows/updates to regularly pull data.

> 3.混合：我们可以采用混合的方法。我们可以将所有拥有大量关注的用户转移到基于拉动的模型，并且只将数据推送给那些拥有数百（或数千）关注的用户。另一种方法可能是服务器向所有用户推送更新的频率不超过一定频率，让关注/更新较多的用户定期拉取数据。

For a detailed discussion about News Feed generation, take a look at Designing Facebook’s Newsfeed.

> 有关 News Feed 生成的详细讨论，请查看设计 Facebook 的 Newsfeed。

## 12. News Feed Creation with Sharded Data 

>12. 使用分片数据创建新闻源

One of the most important requirement to create the News Feed for any given user is to fetch the latest photos from all people the user follows. For this, we need to have a mechanism to sort photos on their time of creation. To efficiently do this, we can make photo creation time part of the PhotoID. As we will have a primary index on PhotoID, it will be quite quick to find the latest PhotoIDs.

> 为任何给定用户创建新闻源的最重要要求之一是获取该用户关注的所有人的最新照片。为此，我们需要有一种机制来按照片的创建时间对其进行排序。为了有效地做到这一点，我们可以将照片创建时间作为 PhotoID 的一部分。由于我们将在 PhotoID 上建立主索引，因此可以很快找到最新的 PhotoID。

We can use epoch time for this. Let’s say our PhotoID will have two parts; the first part will be representing epoch time and the second part will be an auto-incrementing sequence. So to make a new PhotoID, we can take the current epoch time and append an auto-incrementing ID from our key- generating DB. We can figure out shard number from this PhotoID ( PhotoID % 10) and store the photo there.

> 我们可以为此使用纪元时间。假设我们的 PhotoID 将由两部分组成：第一部分将表示纪元时间，第二部分将是自动递增序列。因此，为了创建一个新的 PhotoID，我们可以获取当前纪元时间并从我们的密钥生成数据库中附加一个自动递增的 ID。我们可以从这个 PhotoID ( PhotoID % 10) 中找出分片编号并将照片存储在那里。

**What could be the size of our PhotoID**? Let’s say our epoch time starts today, how many bits we would need to store the number of seconds for next 50 years?

> 我们的 PhotoID 的大小是多少？假设我们的纪元时间从今天开始，我们需要多少位来存储未来 50 年的秒数？

86400 sec/day * 365 (days a year) * 50 (years) => 1.6 billion seconds

> 86400 秒/天 * 365（一年天）* 50（年）=> 16 亿秒

We would need 31 bits to store this number. Since on the average, we are expecting 23 new photos per second; we can allocate 9 bits to store auto incremented sequence. So every second we can store (2^9 => 512) new photos. We can reset our auto incrementing sequence every second.

> 我们需要 31 位来存储这个数字。因为平均而言，我们预计每秒 23 张新照片；我们可以分配9位来存储自动递增序列。所以每一秒我们都可以存储 (2^9 => 512) 张新照片。我们可以每秒重置自动递增序列。

We will discuss more details about this technique under ‘Data Sharding’ in Designing Twitter.

> 我们将在设计 Twitter 中的“数据分片”部分讨论有关此技术的更多细节。

## 13. Cache and Load balancing 

>13. 缓存和负载平衡

Our service would need a massive-scale photo delivery system to serve the globally distributed users. Our service should push its content closer to the user using a large number of geographically distributed photo cache servers and use CDNs (for details see Caching).

> 我们的服务需要一个大规模的照片传输系统来为全球分布的用户提供服务。我们的服务应该使用大量地理分布的照片缓存服务器并使用 CDN（有关详细信息，请参阅缓存）将其内容推送到更接近用户的位置。

We can introduce a cache for metadata servers to cache hot database rows. We can use Memcache to cache the data and Application servers before hitting database can quickly check if the cache has desired rows. Least Recently Used (LRU) can be a reasonable cache eviction policy for our system. Under this policy, we discard the least recently viewed row first.

> 我们可以为元数据服务器引入缓存来缓存热数据库行。我们可以使用 Memcache 来缓存数据，应用程序服务器在访问数据库之前可以快速检查缓存中是否有所需的行。最近最少使用（LRU）对于我们的系统来说是一个合理的缓存驱逐策略。根据此策略，我们首先丢弃最近最少查看的行。

**How can we build more intelligent cache?** If we go with 80-20 rule, i.e., 20% of daily read volume for photos is generating 80% of traffic which means that certain photos are so popular that the majority of people read them. This dictates that we can try caching 20% of daily read volume of photos and metadata.

> 如何构建更加智能的缓存？如果我们遵循 80-20 规则，即每日照片阅读量的 20% 会产生 80% 的流量，这意味着某些照片非常受欢迎，以至于大多数人都会阅读它们。这表明我们可以尝试缓存每日读取量的 20% 的照片和元数据。
