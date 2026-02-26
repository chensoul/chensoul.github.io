---
title: "[译]《Grokking the System Design Interview》设计Pastebin"
date: 2023-11-24 08:00:00+08:00
slug: designing-pastebin
categories: [ "translation" ]
tags: ['architecture']

---

这是一篇双语翻译的文章，原文出自 [grok_system_design_interview.pdf](https://github.com/sharanyaa/grok_sdi_educative/blob/master/grok_system_design_interview.pdf) 的一篇文章《Designing Pastebin》设计 Pastebin。

---

Let’s design a Pastebin like web service, where users can store plain text. Users of the service will enter a piece of text and get a randomly generated URL to access it. Similar Services: pastebin.com, pasted.co, chopapp.com Difficulty Level: Easy

> 让我们设计一个类似 Pastebin 的 Web 服务，用户可以在其中存储纯文本。该服务的用户将输入一段文本并获得一个随机生成的 URL 来访问它。类似服务：pastebin.com、pasted.co、hopapp.com 难度级别：简单

## 1. What is Pastebin? 

> 1.Pastebin是什么？

Pastebin like services enable users to store plain text or images over the network (typically the Internet) and generate unique URLs to access the uploaded data. Such services are also used to share data over the network quickly, as users would just need to pass the URL to let other users see it.

> Pastebin 之类的服务使用户能够通过网络（通常是互联网）存储纯文本或图像，并生成唯一的 URL 来访问上传的数据。此类服务还用于通过网络快速共享数据，因为用户只需传递 URL 即可让其他用户看到它。

If you haven’t used [pastebin.com](http://pastebin.com/) before, please try creating a new ‘Paste’ there and spend some time going through the different options their service offers. This will help you a lot in understanding this chapter.

> 如果您以前没有使用过 pastebin.com，请尝试在那里创建一个新的“粘贴”，并花一些时间浏览他们的服务提供的不同选项。这将对你理解本章有很大帮助。

## 2. Requirements and Goals of the System 

> 2. 系统的要求和目标

Our Pastebin service should meet the following requirements:

> 我们的 Pastebin 服务应满足以下要求：

**Functional Requirements:**

> **功能要求：**

1. Users should be able to upload or “paste” their data and get a unique URL to access it.

   > 用户应该能够上传或“粘贴”他们的数据并获得唯一的 URL 来访问它。

2. Users will only be able to upload text.

   > 用户只能上传文本。

3. Data and links will expire after a specific timespan automatically; users should also be able to specify expiration time.

   > 数据和链接将在特定时间段后自动过期；用户还应该能够指定过期时间。

4. Users should optionally be able to pick a custom alias for their paste.

   > 用户应该可以选择为其粘贴选择自定义别名。

**Non-Functional Requirements:**

> **非功能性要求：**

1. The system should be highly reliable, any data uploaded should not be lost.

   > 系统应高度可靠，上传的任何数据都不应丢失。

2. The system should be highly available. This is required because if our service is down, users will not be able to access their Pastes.

   > 系统应该是高可用的。这是必需的，因为如果我们的服务出现故障，用户将无法访问他们的粘贴。

3. Users should be able to access their Pastes in real-time with minimum latency.

   > 用户应该能够以最小的延迟实时访问他们的粘贴。

4. Paste links should not be guessable (not predictable).

   > 粘贴链接不应是可猜测的（不可预测的）。

**Extended Requirements:**

> **扩展要求：**

1. Analytics, e.g., how many times a paste was accessed?

   > 分析，例如粘贴被访问了多少次？

2. Our service should also be accessible through REST APIs by other services.

   > 我们的服务还应该可以由其他服务通过 REST API 访问。

## 3. Some Design Considerations 

> 3. 一些设计考虑

Pastebin shares some requirements with [URL Shortening service](https://www.educative.io/collection/page/5668639101419520/5649050225344512/5668600916475904), but there are some additional design considerations we should keep in mind.

> Pastebin 与 URL 缩短服务有一些共同的要求，但我们还应该牢记一些额外的设计注意事项。

**What should be the limit on the amount of text user can paste at a time?** We can limit users not to have Pastes bigger than 10MB to stop the abuse of the service.

> 用户一次可以粘贴的文本量的限制应该是多少？我们可以限制用户粘贴的大小不得超过 10MB，以阻止滥用服务。

**Should we impose size limits on custom URLs?** Since our service supports custom URLs, users can pick any URL that they like, but providing a custom URL is not mandatory. However, it is reasonable (and often desirable) to impose a size limit on custom URLs, so that we have a consistent URL database.

> 我们应该对自定义 URL 施加大小限制吗？由于我们的服务支持自定义 URL，因此用户可以选择他们喜欢的任何 URL，但提供自定义 URL 不是强制性的。然而，对自定义 URL 施加大小限制是合理的（而且通常是可取的），这样我们就有一个一致的 URL 数据库。

## 4. Capacity Estimation and Constraints 

> 4. 容量估计和约束

Our services will be read-heavy; there will be more read requests compared to new Pastes creation. We can assume a 5:1 ratio between read and write.

> 我们的服务将需要大量阅读；与创建新的粘贴相比，将会有更多的读取请求。我们可以假设读和写之间的比例为 5:1。

**Traffic estimates:** Pastebin services are not expected to have traffic similar to Twitter or Facebook, let’s assume here that we get one million new pastes added to our system every day. This leaves us with five million reads per day.

> 流量估计：Pastebin 服务预计不会有类似于 Twitter 或 Facebook 的流量，我们假设每天有 100 万个新粘贴添加到我们的系统中。这使得我们每天的阅读量达到 500 万次。

New Pastes per second:

> 每秒新粘贴数：

1M / (24 hours * 3600 seconds) ~= 12 pastes/sec 

Paste reads per second:

> 粘贴每秒读取次数：

5M / (24 hours * 3600 seconds) ~= 58 reads/sec

**Storage estimates:** Users can upload maximum 10MB of data; commonly Pastebin like services are

> 存储预估：用户最多可上传10MB数据；通常类似 Pastebin 的服务是

used to share source code, configs or logs. Such texts are not huge, so let’s assume that each paste on average contains 10KB.

> 用于共享源代码、配置或日志。这些文本并不大，所以我们假设每个粘贴平均包含 10KB。

At this rate, we will be storing 10GB of data per day.

> 按照这个速度，我们每天将存储 10GB 的数据。

1M * 10KB => 10 GB/day

If we want to store this data for ten years we would need the total storage capacity of 36TB.

> 如果我们想存储这些数据十年，我们需要 36TB 的总存储容量。

With 1M pastes every day we will have 3.6 billion Pastes in 10 years. We need to generate and store keys to uniquely identify these pastes. If we use base64 encoding ([A-Z, a-z, 0-9, ., -]) we would need six letters strings:

> 每天有 100 万个焊膏，10 年后我们将拥有 36 亿个焊膏。我们需要生成并存储密钥来唯一标识这些粘贴。如果我们使用 Base64 编码（[A-Z, a-z, 0-9, ., -]），我们将需要六个字母的字符串：

64^6 ~= 68.7 billion unique strings

> 64^6 ~= 687 亿个唯一字符串

If it takes one byte to store one character, total size required to store 3.6B keys would be:

> 如果需要 1 个字节存储 1 个字符，则存储 3.6B 个密钥所需的总大小为：

3.6B * 6 => 22 GB

22GB is negligible compared to 36TB. To keep some margin, we will assume a 70% capacity model (meaning we don’t want to use more than 70% of our total storage capacity at any point), which raises our storage needs to 51.4TB.

> 与 36TB 相比，22GB 可以忽略不计。为了保留一定的余量，我们将假设 70% 的容量模型（这意味着我们在任何时候都不想使用超过总存储容量的 70%），这会将我们的存储需求提高到 51.4TB。

**Bandwidth estimates:** For write requests, we expect 12 new pastes per second, resulting in 120KB of ingress per second.

> 带宽估计：对于写入请求，我们预计每秒 12 个新粘贴，导致每秒 120KB 的入口。

12 * 10KB => 120 KB/s

As for the read request, we expect 58 requests per second. Therefore, total data egress (sent to users) will be 0.6 MB/s.

> 至于读取请求，我们预计每秒有 58 个请求。因此，总数据输出（发送给用户）将为 0.6 MB/s。

58 * 10KB => 0.6 MB/s

Although total ingress and egress are not big, we should keep these numbers in mind while designing our service.

> 尽管入口和出口总量并不大，但我们在设计服务时应该牢记这些数字。

**Memory estimates:** We can cache some of the hot pastes that are frequently accessed. Following the 80-20 rule, meaning 20% of hot pastes generate 80% of traffic, we would like to cache these 20% pastes

> 内存估算：我们可以缓存一些经常访问的热贴。遵循 80-20 规则，即 20% 的热门粘贴产生 80% 的流量，我们希望缓存这 20% 的粘贴

Since we have 5M read requests per day, to cache 20% of these requests, we would need:

> 由于我们每天有 500 万个读取请求，为了缓存这些请求的 20%，我们需要：

0.2 * 5M * 10KB ~= 10 GB

## 5. System APIs 

> 5. 系统API

We can have SOAP or REST APIs to expose the functionality of our service. Following could be the definitions of the APIs to create/retrieve/delete Pastes:

> 我们可以使用 SOAP 或 REST API 来公开我们服务的功能。以下是创建/检索/删除粘贴的 API 的定义：

```
addPaste(api_dev_key, paste_data, custom_url=None user_name=None, paste_name=None,
expire_date=None)
```

**Parameters:**

> **参数：**

api_dev_key (string): The API developer key of a registered account. This will be used to, among other things, throttle users based on their allocated quota. paste_data (string): Textual data of the paste. custom_url (string): Optional custom URL.

> api_dev_key (string): 注册账户的API开发者密钥。除其他外，这将用于根据分配的配额限制用户。 Paste_data（字符串）：粘贴的文本数据。 custom_url（字符串）：可选的自定义 URL。

user_name (string): Optional user name to be used to generate URL. paste_name (string): Optional name of the paste expire_date (string): Optional expiration date for the paste.

> user_name（字符串）：用于生成 URL 的可选用户名。 Paste_name（字符串）：粘贴的可选名称 expire_date（字符串）：粘贴的可选到期日期。

**Returns:** (string) A successful insertion returns the URL through which the paste can be accessed, otherwise, it will return an error code.

> 返回：（字符串）成功插入将返回可访问粘贴的 URL，否则将返回错误代码。

Similarly, we can have retrieve and delete Paste APIs:

> 同样，我们可以检索和删除粘贴 API：

```
getPaste(api_dev_key, api_paste_key)
```

Where “api_paste_key” is a string representing the Paste Key of the paste to be retrieved. This API will return the textual data of the paste.

> 其中“api_paste_key”是一个字符串，表示要检索的粘贴的粘贴密钥。该 API 将返回粘贴的文本数据。

```
deletePaste(api_dev_key, api_paste_key)
```

A successful deletion returns ‘true’, otherwise returns ‘false’.

> 成功删除返回“true”，否则返回“false”。

## 6. Database Design 

> 6. 数据库设计

A few observations about the nature of the data we are storing:

> 关于我们存储的数据的性质的一些观察：

1. We need to store billions of records.

   > 我们需要存储数十亿条记录。

2. Each metadata object we are storing would be small (less than 100 bytes).

   > 我们存储的每个元数据对象都很小（小于 100 字节）。

3. Each paste object we are storing can be of medium size (it can be a few MB).

   > 我们存储的每个粘贴对象可以是中等大小（可以是几 MB）。

4. There are no relationships between records, except if we want to store which user created what Paste.

   > 记录之间没有关系，除非我们想要存储哪个用户创建了哪个粘贴。

5. Our service is read-heavy.

   > 我们的服务是重读的。

**Database Schema:**

> **数据库架构：**

We would need two tables, one for storing information about the Pastes and the other for users’ data.

> 我们需要两个表，一个用于存储有关粘贴的信息，另一个用于存储用户数据。

Here, ‘URlHash’ is the URL equivalent of the TinyURL and ‘ContentKey’ is the object key storing the contents of the paste.

> 这里，“URlHash”是相当于 TinyURL 的 URL，“ContentKey”是存储粘贴内容的对象键。

## 7. High Level Design 

> 7. 高层设计

At a high level, we need an application layer that will serve all the read and write requests. Application layer will talk to a storage layer to store and retrieve data. We can segregate our storage layer with one database storing metadata related to each paste, users, etc., while the other storing the paste contents in some object storage (like [Amazon S3](https://en.wikipedia.org/wiki/Amazon_S3)). This division of data will also allow us to scale them individually.

> 在较高的层面上，我们需要一个应用程序层来服务所有的读写请求。应用层将与存储层通信以存储和检索数据。我们可以将存储层隔离，一个数据库存储与每个粘贴、用户等相关的元数据，而另一个数据库将粘贴内容存储在某些对象存储（如 Amazon S3）中。这种数据划分还允许我们单独缩放它们。

![image-20231116090334771](pastebin-01.webp)

## 8. Component Design 

> 8. 组件设计

**a. Application layer**

> **a. 应用层**

Our application layer will process all incoming and outgoing requests. The application servers will be talking to the backend data store components to serve the requests.

> 我们的应用程序层将处理所有传入和传出的请求。应用程序服务器将与后端数据存储组件通信以服务请求。

**How to handle a write request?** Upon receiving a write request, our application server will generate a six-letter random string, which would serve as the key of the paste (if the user has not provided a custom key). The application server will then store the contents of the paste and the generated key in the database. After the successful insertion, the server can return the key to the user. One possible problem here could be that the insertion fails because of a duplicate key. Since we are generating a random key, there is a possibility that the newly generated key could match an existing one. In that case, we should regenerate a new key and try again. We should keep retrying until we don’t see failure due to the duplicate key. We should return an error to the user if the custom key they have provided is already present in our database.

> 如何处理写请求？收到写入请求后，我们的应用程序服务器将生成一个六字母的随机字符串，该字符串将用作粘贴的密钥（如果用户未提供自定义密钥）。然后应用程序服务器会将粘贴的内容和生成的密钥存储在数据库中。插入成功后，服务器可以将密钥返回给用户。这里一个可能的问题是插入由于重复的键而失败。由于我们生成随机密钥，因此新生成的密钥有可能与现有密钥匹配。在这种情况下，我们应该重新生成一个新密钥并重试。我们应该不断重试，直到看不到由于重复密钥而导致的失败。如果用户提供的自定义密钥已存在于我们的数据库中，我们应该向用户返回错误。

Another solution of the above problem could be to run a standalone **Key Generation Service** (KGS) that generates random six letters strings beforehand and stores them in a database (let’s call it key-DB). Whenever we want to store a new paste, we will just take one of the already generated keys and use it. This approach will make things quite simple and fast since we will not be worrying about duplications or collisions. KGS will make sure all the keys inserted in key-DB are unique. KGS can use two tables to store keys, one for keys that are not used yet and one for all the used keys. As soon as KGS gives some keys to an application server, it can move these to the used keys table. KGS can always keep some keys in memory so that whenever a server needs them, it can quickly provide them. As soon as KGS loads some keys in memory, it can move them to the used keys table, this way we can make sure each server gets unique keys. If KGS dies before using all the keys loaded in memory, we will be wasting those keys. We can ignore these keys given that we have a huge number of them.

> 上述问题的另一个解决方案是运行一个独立的密钥生成服务（KGS），该服务预先生成随机的六个字母字符串并将它们存储在数据库中（我们称之为密钥数据库）。每当我们想要存储新的粘贴时，我们只需获取已生成的密钥之一并使用它即可。这种方法将使事情变得非常简单和快速，因为我们不会担心重复或冲突。 KGS 将确保插入 key-DB 中的所有密钥都是唯一的。 KGS 可以使用两张表来存储密钥，一张用于尚未使用的密钥，一张用于所有已使用的密钥。一旦 KGS 向应用程序服务器提供一些密钥，它就可以将这些密钥移动到已使用的密钥表中。 KGS 可以始终将一些密钥保留在内存中，以便每当服务器需要它们时，它可以快速提供它们。一旦 KGS 在内存中加载一些密钥，它就可以将它们移动到已使用的密钥表中，这样我们就可以确保每个服务器都获得唯一的密钥。如果 KGS 在使用内存中加载的所有密钥之前就死掉了，我们将浪费这些密钥。鉴于我们有大量的密钥，我们可以忽略这些密钥。

**Isn’t KGS a single point of failure?** Yes, it is. To solve this, we can have a standby replica of KGS and whenever the primary server dies it can take over to generate and provide keys.

> KGS 不是单点故障吗？是的。为了解决这个问题，我们可以拥有一个 KGS 的备用副本，每当主服务器挂掉时，它就可以接管生成和提供密钥。

**Can each app server cache some keys from key-DB?** Yes, this can surely speed things up. Although in this case, if the application server dies before consuming all the keys, we will end up losing those keys. This could be acceptable since we have 68B unique six letters keys, which are a lot more than we require.

> 每个应用程序服务器可以缓存密钥数据库中的一些密钥吗？是的，这肯定可以加快速度。尽管在这种情况下，如果应用程序服务器在消耗所有密钥之前死亡，我们最终将丢失这些密钥。这是可以接受的，因为我们有 68B 个独特的六个字母键，这比我们需要的多得多。

**How does it handle a paste read request?** Upon receiving a read paste request, the application service layer contacts the datastore. The datastore searches for the key, and if it is found, returns the paste’s contents. Otherwise, an error code is returned.

> 它如何处理粘贴读取请求？在接收到读取粘贴请求后，应用程序服务层联系数据存储。数据存储区搜索密钥，如果找到，则返回粘贴的内容。否则，返回错误代码。

**b. Datastore layer b.数据存储层**

We can divide our datastore layer into two:

> 我们可以将数据存储层分为两层：

1. Metadata database: We can use a relational database like MySQL or a Distributed Key-Value store like Dynamo or Cassandra.

   > 元数据数据库：我们可以使用关系数据库（例如 MySQL）或分布式键值存储（例如 Dynamo 或 Cassandra）。

2. Object storage: We can store our contents in an Object Storage like Amazon’s S3. Whenever we feel like hitting our full capacity on content storage, we can easily increase it by adding more servers.

   > 对象存储：我们可以将内容存储在对象存储中，例如 Amazon 的 S3。每当我们想要充分利用内容存储容量时，我们都可以通过添加更多服务器来轻松增加容量。

![image-20231116090313481](pastebin-02.webp)

Detailed component design for Pastebin

> Pastebin 的详细组件设计

## 9. Purging or DB Cleanup 

> 9. 清除或数据库清理

Please see [Designing a URL Shortening service](https://www.educative.io/collection/page/5668639101419520/5649050225344512/5668600916475904).

> 请参阅设计 URL 缩短服务。

## 10. Data Partitioning and Replication 

> 10. 数据分区和复制

Please see [Designing a URL Shortening service](https://www.educative.io/collection/page/5668639101419520/5649050225344512/5668600916475904).

> 请参阅设计 URL 缩短服务。

## 11. Cache and Load Balancer 

> 11. 缓存和负载均衡器

Please see [Designing a URL Shortening service](https://www.educative.io/collection/page/5668639101419520/5649050225344512/5668600916475904).

> 请参阅设计 URL 缩短服务。

## 12. Security and Permissions 

> 12. 安全和权限

Please see [Designing a URL Shortening service](https://www.educative.io/collection/page/5668639101419520/5649050225344512/5668600916475904).

> 请参阅设计 URL 缩短服务。

