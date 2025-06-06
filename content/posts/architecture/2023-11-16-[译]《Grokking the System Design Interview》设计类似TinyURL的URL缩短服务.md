---
title: "[译]《Grokking the System Design Interview》设计类似 TinyURL 的 URL 缩短服务"
date: 2023-11-16
type: post
slug: designing-a-url-shortening-service
categories: ["Architecture"]
tags: ["architecture"]

---

这是一篇双语翻译的文章，原文出自 [grok_system_design_interview.pdf](https:/github.com/sharanyaa/grok_sdi_educative/blob/master/grok_system_design_interview.pdf) 的一篇文章《Designing a URL Shortening service like TinyURL》设计类似 TinyURL 的 URL 缩短服务。

---



Let’s design a URL shortening service like TinyURL. This service will provide short aliases redirecting to long URLs. Similar services: bit.ly, goo.gl, qlink.me, etc. 

> 让我们设计一个像 TinyURL 这样的 URL 缩短服务。该服务将提供重定向到长 URL 的短别名。类似服务：bit.ly、goo.gl、qlink.me等。 

Difficulty Level: Easy

> 难度级别：简单 

## 1.Why do we need URL shortening? 

> 1.为什么需要URL缩短？

URL shortening is used to create shorter aliases for long URLs. We call these shortened aliases “short links.” Users are redirected to the original URL when they hit these short links. Short links save a lot of space when displayed, printed, messaged, or tweeted. Additionally, users are less likely to mistype shorter URLs.

> URL 缩短用于为长 URL 创建较短的别名。我们将这些缩短的别名称为“短链接”。当用户点击这些短链接时，他们会被重定向到原始 URL。短链接在显示、打印、消息或推文时可以节省大量空间。此外，用户不太可能错误输入较短的 URL。

For example, if we shorten this page through TinyURL:

> 例如，如果我们通过 TinyURL 缩短这个页面：

https:/www.educative.io/collection/page/5668639101419520/5649050225344512/5668600916475904/

We would get: 

> 我们会得到：

http:/tinyurl.com/jlg8zpc

The shortened URL is nearly one-third the size of the actual URL.

> 缩短的 URL 大小几乎是实际 URL 的三分之一。

URL shortening is used for optimizing links across devices, tracking individual links to analyze audience and campaign performance, and hiding affiliated original URLs.

> URL 缩短用于跨设备优化链接、跟踪单个链接以分析受众和营销活动绩效以及隐藏关联的原始 URL。

If you haven’t used tinyurl.com before, please try creating a new shortened URL and spend some time going through the various options their service offers. This will help you a lot in understanding this chapter.

> 如果您以前没有使用过 tinyurl.com，请尝试创建一个新的缩短的 URL，并花一些时间浏览他们的服务提供的各种选项。这将对你理解本章有很大帮助。

## 2.Requirements and Goals of the System 

> 2.系统的要求和目标

You should always clarify requirements at the beginning of the interview. Be sure to ask questions to find the exact scope of the system that the interviewer has in mind.

> 您应该始终在面试开始时澄清要求。一定要通过提问来找到面试官心目中系统的确切范围。

Our URL shortening system should meet the following requirements:

> 我们的URL缩短系统应满足以下要求：

**Functional Requirements:**

> **功能要求：**

1. Given a URL, our service should generate a shorter and unique alias of it. This is called a short link.

   > 给定一个 URL，我们的服务应该生成一个更短且唯一的别名。这称为短链接。

2. When users access a short link, our service should redirect them to the original link.

   > 当用户访问短链接时，我们的服务应该将他们重定向到原始链接。

3. Users should optionally be able to pick a custom short link for their URL.

   > 用户应该可以选择为其 URL 选择自定义短链接。

4. Links will expire after a standard default timespan. Users should be able to specify the expiration time.

   > 链接将在标准默认时间跨度后过期。用户应该能够指定过期时间。

**Non-Functional Requirements:**

> **非功能性要求：**

1. The system should be highly available. This is required because, if our service is down, all the URL redirections will start failing.

   > 系统应该是高可用的。这是必需的，因为如果我们的服务出现故障，所有 URL 重定向都将开始失败。

2. URL redirection should happen in real-time with minimal latency.

   > URL 重定向应该以最小的延迟实时发生。

3. Shortened links should not be guessable (not predictable).

   > 缩短的链接不应该是可猜测的（不可预测的）。

**Extended Requirements:**

> **扩展要求：**

1. Analytics; e.g., how many times a redirection happened?

   > 分析；例如，重定向发生了多少次？

2. Our service should also be accessible through REST APIs by other services.

   > 我们的服务还应该可以由其他服务通过 REST API 访问。

## 3. Capacity Estimation and Constraints 

> 3. 容量估计和约束

Our system will be read-heavy. There will be lots of redirection requests compared to new URL shortenings. Let’s assume 100:1 ratio between read and write.

> 我们的系统读取量很大。与新的 URL 缩短相比，将会有大量的重定向请求。假设读写比率为 100:1。

**Traffic estimates:** Assuming, we will have 500M new URL shortenings per month, with 100:1 read/write ratio, we can expect 50B redirections during the same period:

> 流量估计：假设我们每月有 500M 新的 URL 缩短，读/写比为 100:1，我们可以预期同期有 50B 的重定向：

100 * 500M => 50B

What would be Queries Per Second (QPS) for our system? New URLs shortenings per second:

> 我们系统的每秒查询数 (QPS) 是多少？每秒新缩短的 URL：

500 million / (30 days * 24 hours * 3600 seconds) = ~200 URLs/s

Considering 100:1 read/write ratio, URLs redirections per second will be:

> 考虑到 100:1 的读/写比率，每秒 URL 重定向将为：

100 * 200 URLs/s = 20K/s

**Storage estimates:** Let’s assume we store every URL shortening request (and associated shortened link) for 5 years. Since we expect to have 500M new URLs every month, the total number of objects we expect to store will be 30 billion:

> 存储估计：假设我们将每个 URL 缩短请求（以及相关的缩短链接）存储 5 年。由于我们预计每月会有 5 亿个新 URL，因此我们预计存储的对象总数将为 300 亿个：

500 million * 5 years * 12 months = 30 billion

Let’s assume that each stored object will be approximately 500 bytes (just a ballpark estimate–we will dig into it later). We will need 15TB of total storage:

> 我们假设每个存储的对象大约有 500 字节（只是一个大概的估计——我们稍后会深入研究）。我们需要 15TB 的总存储空间：

30 billion * 500 bytes = 15 TB

**Bandwidth estimates:** For write requests, since we expect 200 new URLs every second, total incoming data for our service will be 100KB per second:

> 带宽估计：对于写入请求，由于我们预计每秒有 200 个新 URL，因此我们服务的总传入数据将为每秒 100KB：

200 * 500 bytes = 100 KB/s

For read requests, since every second we expect ~20K URLs redirections, total outgoing data for our service would be 10MB per second:

> 对于读取请求，由于我们预计每秒约有 20K 个 URL 重定向，因此我们服务的总传出数据将为每秒 10MB：

20K * 500 bytes = ~10 MB/s

**Memory estimates:** If we want to cache some of the hot URLs that are frequently accessed, how much memory will we need to store them? If we follow the 80-20 rule, meaning 20% of URLs generate 80% of traffic, we would like to cache these 20% hot URLs.

> 内存估算：如果我们要缓存一些经常访问的热门 URL，我们需要多少内存来存储它们？如果我们遵循 80-20 规则，即 20% 的 URL 产生 80% 的流量，我们希望缓存这 20% 的热门 URL。

Since we have 20K requests per second, we will be getting 1.7 billion requests per day:

> 由于我们每秒有 20K 个请求，因此我们每天将收到 17 亿个请求：

20K * 3600 seconds * 24 hours = ~1.7 billion

To cache 20% of these requests, we will need 170GB of memory.

> 要缓存其中 20% 的请求，我们需要 170GB 内存。

0.2 * 1.7 billion * 500 bytes = ~170GB


One thing to note here is that since there will be a lot of duplicate requests (of the same URL), therefore, our actual memory usage will be less than 170GB.

> 这里需要注意的一点是，由于会有很多重复请求（同一 URL），因此，我们的实际内存使用量将小于 170GB。

**High level estimates:** Assuming 500 million new URLs per month and 100:1 read:write ratio, following is the summary of the high level estimates for our service:

> 高水平估计：假设每月有 5 亿个新 URL 和 100:1 的读：写比率，以下是我们服务的高水平估计的摘要：

| **New URLs**            | **200/s**   |
| ----------------------- | ----------- |
| **URL redirections**    | **20K/s**   |
| **Incoming data**       | **100KB/s** |
| **Outgoing data**       | **10MB/s**  |
| **Storage for 5 years** | **15TB**    |
| **Memory for cache**    | **170GB**   |

## 4. System APIs 

> 4. 系统API

**Once we’ve finalized the requirements, it’s always a good idea to define the system APIs. This should explicitly state what is expected from the system.**

> **一旦我们最终确定了需求，定义系统 API 总是一个好主意。这应该明确说明系统的期望。**

We can have SOAP or REST APIs to expose the functionality of our service. Following could be the definitions of the APIs for creating and deleting URLs:

> 我们可以使用 SOAP 或 REST API 来公开我们服务的功能。以下是用于创建和删除 URL 的 API 的定义：

```python
createURL(api_dev_key, original_url, custom_alias=None, user_name=None, expire_date=None)
```

**Parameters:**

> **参数：**

api_dev_key (string): The API developer key of a registered account. This will be used to, among other things, throttle users based on their allocated quota. 

> api_dev_key (string): 注册账户的API开发者密钥。除其他外，这将用于根据分配的配额限制用户。 

original_url (string): Original URL to be shortened. 

> custom_alias（字符串）：URL 的可选自定义键。

custom_alias (string): Optional custom key for the URL.

> Original_url（字符串）：要缩短的原始 URL。 

user_name (string): Optional user name to be used in encoding. 

> user_name（字符串）：编码中使用的可选用户名。

expire_date (string): Optional expiration date for the shortened URL.

>  expire_date（字符串）：缩短的 URL 的可选到期日期。

**Returns:** (string) A successful insertion returns the shortened URL; otherwise, it returns an error code.

> 返回：（字符串）成功插入返回缩短的 URL；否则，它返回一个错误代码。

```python
deleteURL(api_dev_key, url_key)
```

Where “url_key” is a string representing the shortened URL to be retrieved. A successful deletion returns ‘URL Removed’.

> 其中“url_key”是表示要检索的缩短 URL 的字符串。成功删除将返回“URL 已删除”。

**How do we detect and prevent abuse?** A malicious user can put us out of business by consuming all URL keys in the current design. To prevent abuse, we can limit users via their api_dev_key. Each api_dev_key can be limited to a certain number of URL creations and redirections per some time period (which may be set to a different duration per developer key).

> **我们如何发现并防止滥用行为？** 恶意用户可以通过消耗当前设计中的所有 URL 密钥来使我们破产。为了防止滥用，我们可以通过 api_dev_key 限制用户。每个 api_dev_key 可以限制为在某个时间段内一定数量的 URL 创建和重定向（可以将每个开发人员密钥设置为不同的持续时间）。

## 5. Database Design 

> 5. 数据库设计

**Defining the DB schema in the early stages of the interview would help to understand the data flow among various components and later would guide towards data partitioning.**

> **在面试的早期阶段定义数据库模式将有助于理解各个组件之间的数据流，并在以后指导数据分区。**

A few observations about the nature of the data we will store:

> 关于我们将存储的数据的性质的一些观察：

1. We need to store billions of records.

   > 我们需要存储数十亿条记录。

2. Each object we store is small (less than 1K).

   > 我们存储的每个对象都很小（小于 1K）。

3. There are no relationships between records—other than storing which user created a URL.

   > 除了存储哪个用户创建了 URL 之外，记录之间没有任何关系。 

4. Our service is read-heavy.

   > 我们的服务是重读的。

**Database Schema:**

> **数据库架构：**

We would need two tables: one for storing information about the URL mappings, and one for the user’s data who created the short link.

> 我们需要两张表：一张用于存储有关 URL 映射的信息，一张用于创建短链接的用户数据。

![tinyurl-1](../../../static/images/tinyurl-1-0727878.webp)

**What kind of database should we use?** Since we anticipate storing billions of rows, and we don’t need to use relationships between objects – a NoSQL key-value store like DynamoDB, Cassandra or Riak is a better choice. A NoSQL choice would also be easier to scale. Please see SQL vs NoSQL for more details.

> 我们应该使用什么样的数据库？由于我们预计存储数十亿行，并且不需要使用对象之间的关系 - DynamoDB、Cassandra 或 Riak 等 NoSQL 键值存储是更好的选择。 NoSQL 选择也更容易扩展。请参阅 SQL 与 NoSQL 了解更多详细信息。

## 6. Basic System Design and Algorithm 

> 6. 基本系统设计和算法

The problem we are solving here is, how to generate a short and unique key for a given URL.

> 我们这里要解决的问题是，如何为给定的 URL 生成一个简短且唯一的密钥。

In the TinyURL example in Section 1, the shortened URL is “http:/tinyurl.com/jlg8zpc”. The last six characters of this URL is the short key we want to generate. We’ll explore two solutions here:

> 在第 1 节的 TinyURL 示例中，缩短的 URL 是“http:/tinyurl.com/jlg8zpc”。该URL的最后六个字符是我们要生成的短密钥。我们将在这里探索两种解决方案：

**a. Encoding actual URL**

> **a. 对实际 URL 进行编码**

We can compute a unique hash (e.g., MD5 or SHA256, etc.) of the given URL. The hash can then be encoded for displaying. This encoding could be base36 ([a-z ,0-9]) or base62 ([A-Z, a-z, 0-9]) and if we add ‘-’ and ‘.’ we can use base64 encoding. A reasonable question would be, what should be the length of the short key? 6, 8 or 10 characters.

> 我们可以计算给定 URL 的唯一哈希值（例如 MD5 或 SHA256 等）。然后可以对散列进行编码以供显示。该编码可以是base36（[a-z，0-9]）或base62（[A-Z，a-z，0-9]），如果我们添加“-”和“.”，我们可以使用base64编码。一个合理的问题是，短密钥的长度应该是多少？ 6、8 或 10 个字符。

Using base64 encoding, a 6 letter long key would result in 64^6 = ~68.7 billion possible strings Using base64 encoding, an 8 letter long key would result in 64^8 = ~281 trillion possible strings

> 使用 Base64 编码，6 个字母长的密钥将产生 64^6 = ~687 亿个可能的字符串，使用 Base64 编码，8 个字母长的密钥将产生 64^8 = ~281 万亿个可能的字符串

With 68.7B unique strings, let’s assume six letter keys would suffice for our system.

> 对于 68.7B 的唯一字符串，我们假设六个字母键足以满足我们的系统。

If we use the MD5 algorithm as our hash function, it’ll produce a 128-bit hash value. After base64 encoding, we’ll get a string having more than 21 characters (since each base64 character encodes 6 bits of the hash value). Since we only have space for 8 characters per short key, how will we choose our key then? We can take the first 6 (or 8) letters for the key. This could result in key duplication though, upon which we can choose some other characters out of the encoding string or swap some characters.

> 如果我们使用 MD5 算法作为哈希函数，它将产生一个 128 位的哈希值。经过base64编码后，我们将得到一个超过21个字符的字符串（因为每个 base64 字符编码哈希值的6位）。由于每个短密钥只有 8 个字符的空间，那么我们将如何选择我们的密钥呢？我们可以取前 6 个（或 8 个）字母作为密钥。但这可能会导致密钥重复，因此我们可以从编码字符串中选择一些其他字符或交换一些字符。

**What are different issues with our solution?** We have the following couple of problems with our encoding scheme:

> 我们的解决方案有哪些不同的问题？我们的编码方案存在以下几个问题：

1. If multiple users enter the same URL, they can get the same shortened URL, which is not acceptable.

   > 如果多个用户输入相同的 URL，他们可以获得相同的缩短的 URL，这是不可接受的。

2. What if parts of the URL are URL-encoded? e.g., http:/www.educative.io/distributed.php?id=design, and http:/www.educative.io/distributed.php%3Fid%3Ddesign are identical except for the URL encoding.

   > 如果 URL 的一部分是 URL 编码的怎么办？例如，http:/www.eduative.io/distributed.php?id=design 和 http:/www.educative.io/distributed.php%3Fid%3Ddesign 除了 URL 编码之外，完全相同。

**Workaround for the issues:** We can append an increasing sequence number to each input URL to make it unique, and then generate a hash of it. We don’t need to store this sequence number in the databases, though. Possible problems with this approach could be an ever-increasing sequence number. Can it overflow? Appending an increasing sequence number will also impact the performance of the service.

> 问题的解决方法：我们可以将递增的序列号附加到每个输入 URL 以使其唯一，然后生成它的哈希值。不过，我们不需要将此序列号存储在数据库中。这种方法可能出现的问题是序列号不断增加。能溢出吗？附加递增的序列号也会影响服务的性能。

Another solution could be to append user id (which should be unique) to the input URL. However, if the user has not signed in, we would have to ask the user to choose a uniqueness key. Even after this, if we have a conflict, we have to keep generating a key until we get a unique one.

> 另一种解决方案是将用户 ID（应该是唯一的）附加到输入 URL。但是，如果用户尚未登录，我们将不得不要求用户选择唯一性密钥。即使在此之后，如果出现冲突，我们也必须继续生成密钥，直到获得唯一的密钥。

![tinyurl-2](../../../static/images/tinyurl-2-0727878.webp)

**b. Generating keys offline**

> **b.离线生成密钥**

We can have a standalone Key Generation Service (KGS) that generates random six letter strings beforehand and stores them in a database (let’s call it key-DB). Whenever we want to shorten a URL, we will just take one of the already-generated keys and use it. This approach will make things quite simple and fast. Not only are we not encoding the URL, but we won’t have to worry about duplications or collisions. KGS will make sure all the keys inserted into key-DB are unique

> 我们可以拥有一个独立的密钥生成服务（KGS），它预先生成随机的六个字母字符串并将它们存储在数据库中（我们称之为密钥数据库）。每当我们想要缩短 URL 时，我们只需获取已生成的密钥之一并使用它即可。这种方法将使事情变得非常简单和快速。我们不仅不对 URL 进行编码，而且不必担心重复或冲突。 KGS 将确保插入 key-DB 的所有密钥都是唯一的

**Can concurrency cause problems?** As soon as a key is used, it should be marked in the database to ensure it doesn’t get used again. If there are multiple servers reading keys concurrently, we might get a scenario where two or more servers try to read the same key from the database. How can we solve this concurrency problem?

> 并发会导致问题吗？密钥一旦使用，就应该在数据库中进行标记，以确保它不会被再次使用。如果有多个服务器同时读取密钥，我们可能会遇到两个或多个服务器尝试从数据库读取相同密钥的情况。我们如何解决这个并发问题呢？

Servers can use KGS to read/mark keys in the database. KGS can use two tables to store keys: one for keys that are not used yet, and one for all the used keys. As soon as KGS gives keys to one of the servers, it can move them to the used keys table. KGS can always keep some keys in memory so that it can quickly provide them whenever a server needs them.

> 服务器可以使用 KGS 读取/标记数据库中的密钥。 KGS 可以使用两张表来存储密钥：一张用于尚未使用的密钥，一张用于所有已使用的密钥。一旦 KGS 向其中一台服务器提供密钥，它就可以将它们移动到已使用的密钥表中。 KGS 可以始终将一些密钥保留在内存中，以便在服务器需要时可以快速提供它们。

For simplicity, as soon as KGS loads some keys in memory, it can move them to the used keys table. This ensures each server gets unique keys. If KGS dies before assigning all the loaded keys to some server, we will be wasting those keys–which is acceptable, given the huge number of keys we have.

> 为简单起见，一旦 KGS 将某些密钥加载到内存中，它就可以将它们移动到已使用的密钥表中。这确保每个服务器获得唯一的密钥。如果 KGS 在将所有加载的密钥分配给某个服务器之前就死掉了，我们将浪费这些密钥——考虑到我们拥有大量的密钥，这是可以接受的。

KGS also has to make sure not to give the same key to multiple servers. For that, it must synchronize (or get a lock on) the data structure holding the keys before removing keys from it and giving them to a server

> KGS 还必须确保不要将相同的密钥提供给多个服务器。为此，它必须同步（或锁定）保存密钥的数据结构，然后再从中删除密钥并将其提供给服务器

**What would be the key-DB size?** With base64 encoding, we can generate 68.7B unique six letters keys. If we need one byte to store one alpha-numeric character, we can store all these keys in:

> 密钥数据库的大小是多少？通过 base64 编码，我们可以生成 68.7B 唯一的六个字母密钥。如果我们需要一个字节来存储一个字母数字字符，我们可以将所有这些键存储在：

6 (characters per key) * 68.7B (unique keys) = 412 GB.

**Isn’t KGS a single point of failure?** Yes, it is. To solve this, we can have a standby replica of KGS. Whenever the primary server dies, the standby server can take over to generate and provide keys.

> KGS 不是单点故障吗？是的。为了解决这个问题，我们可以拥有一个 KGS 的备用副本。每当主服务器挂掉时，备用服务器就可以接管并生成和提供密钥。

**Can each app server cache some keys from key-DB?** Yes, this can surely speed things up. Although in this case, if the application server dies before consuming all the keys, we will end up losing those keys. This can be acceptable since we have 68B unique six letter keys.

> 每个应用程序服务器可以缓存密钥数据库中的一些密钥吗？是的，这肯定可以加快速度。尽管在这种情况下，如果应用程序服务器在消耗所有密钥之前死亡，我们最终将丢失这些密钥。这是可以接受的，因为我们有 68B 独特的六字母键。

**How would we perform a key lookup?** We can look up the key in our database or key-value store to get the full URL. If it’s present, issue an “HTTP 302 Redirect” status back to the browser, passing the stored URL in the “Location” field of the request. If that key is not present in our system, issue an “HTTP 404 Not Found” status or redirect the user back to the homepage.

> 我们如何执行键查找？我们可以在数据库或键值存储中查找键来获取完整的 URL。如果存在，则向浏览器发出“HTTP 302 重定向”状态，并在请求的“位置”字段中传递存储的 URL。如果我们的系统中不存在该密钥，请发出“HTTP 404 Not Found”状态或将用户重定向回主页。

**Should we impose size limits on custom aliases?** Our service supports custom aliases. Users can pick any ‘key’ they like, but providing a custom alias is not mandatory. However, it is reasonable (and often desirable) to impose a size limit on a custom alias to ensure we have a consistent URL database. Let’s assume users can specify a maximum of 16 characters per customer key (as reflected in the above database schema).

> 我们应该对自定义别名施加大小限制吗？我们的服务支持自定义别名。用户可以选择他们喜欢的任何“键”，但提供自定义别名不是强制性的。然而，对自定义别名施加大小限制以确保我们拥有一致的 URL 数据库是合理的（并且通常是可取的）。假设用户可以为每个客户密钥指定最多 16 个字符（如上面的数据库架构所示）。

![tinyurl-3](../../../static/images/tinyurl-3-0727878.webp)

High level system design for URL shortening

> URL 缩短的高级系统设计

## 7. Data Partitioning and Replication 

> 7. 数据分区和复制

To scale out our DB, we need to partition it so that it can store information about billions of URLs. We need to come up with a partitioning scheme that would divide and store our data to different DB servers.

> 为了扩展我们的数据库，我们需要对其进行分区，以便它可以存储有关数十亿个 URL 的信息。我们需要提出一个分区方案，将数据划分并存储到不同的数据库服务器。

**a. Range Based Partitioning:** We can store URLs in separate partitions based on the first letter of the URL or the hash key. Hence we save all the URLs starting with letter ‘A’ in one partition, save those that start with letter ‘B’ in another partition and so on. This approach is called range-based partitioning. We can even combine certain less frequently occurring letters into one database partition. We should come up with a static partitioning scheme so that we can always store/find a file in a predictable manner.

> **a.基于范围的分区：** 我们可以根据 URL 的首字母或哈希键将 URL 存储在单独的分区中。因此，我们将所有以字母“A”开头的 URL 保存在一个分区中，将那些以字母“B”开头的 URL 保存在另一个分区中，依此类推。这种方法称为基于范围的分区。我们甚至可以将某些不常出现的字母合并到一个数据库分区中。我们应该提出一个静态分区方案，以便我们始终可以以可预测的方式存储/查找文件。

The main problem with this approach is that it can lead to unbalanced servers. For example: we decide to put all URLs starting with letter ‘E’ into a DB partition, but later we realize that we have too many URLs that start with letter ‘E’.

> 这种方法的主要问题是它可能导致服务器不平衡。例如：我们决定将所有以字母“E”开头的 URL 放入数据库分区，但后来我们意识到以字母“E”开头的 URL 太多了。

**b. Hash-Based Partitioning:** In this scheme, we take a hash of the object we are storing. We then calculate which partition to use based upon the hash. In our case, we can take the hash of the ‘key’ or the actual URL to determine the partition in which we store the data object.

> **b.基于哈希的分区：** 在此方案中，我们采用所存储对象的哈希值。然后我们根据哈希计算要使用哪个分区。在我们的例子中，我们可以采用“键”的哈希值或实际 URL 来确定存储数据对象的分区。

Our hashing function will randomly distribute URLs into different partitions (e.g., our hashing function can always map any key to a number between [1…256]), and this number would represent the partition in which we store our object.

> 我们的哈希函数会将 URL 随机分布到不同的分区中（例如，我们的哈希函数始终可以将任何键映射到 [1…256] 之间的数字），并且该数字将代表我们存储对象的分区。

This approach can still lead to overloaded partitions, which can be solved by using Consistent Hashing.

> 这种方法仍然会导致分区过载，这可以通过使用一致性哈希来解决。

## 8. Cache 

> 8. 缓存

We can cache URLs that are frequently accessed. We can use some off-the-shelf solution like Memcache, which can store full URLs with their respective hashes. The application servers, before hitting backend storage, can quickly check if the cache has the desired URL.

> 我们可以缓存经常访问的URL。我们可以使用一些现成的解决方案，例如 Memcache，它可以存储完整的 URL 及其各自的哈希值。应用程序服务器在访问后端存储之前，可以快速检查缓存中是否有所需的 URL。

**How much cache should we have?** We can start with 20% of daily traffic and, based on clients’ usage pattern, we can adjust how many cache servers we need. As estimated above, we need 170GB memory to cache 20% of daily traffic. Since a modern-day server can have 256GB memory, we can easily fit all the cache into one machine. Alternatively, we can use a couple of smaller servers to store all these hot URLs.

> 我们应该有多少缓存？我们可以从每日流量的 20% 开始，根据客户的使用模式，我们可以调整我们需要的缓存服务器数量。根据上面的估计，我们需要 170GB 内存来缓存 20% 的日常流量。由于现代服务器可以拥有 256GB 内存，因此我们可以轻松地将所有缓存安装到一台机器中。或者，我们可以使用几个较小的服务器来存储所有这些热门 URL。

**Which cache eviction policy would best fit our needs?** When the cache is full, and we want to replace a link with a newer/hotter URL, how would we choose? Least Recently Used (LRU) can be a reasonable policy for our system. Under this policy, we discard the least recently used URL first. We can use a Linked Hash Map or a similar data structure to store our URLs and Hashes, which will also keep track of the URLs that have been accessed recently.

> 哪种缓存驱逐策略最适合我们的需求？当缓存已满，并且我们想用更新/更热门的 URL 替换链接时，我们会如何选择？最近最少使用（LRU）对于我们的系统来说是一个合理的策略。根据此策略，我们首先丢弃最近最少使用的 URL。我们可以使用链接哈希映射或类似的数据结构来存储我们的 URL 和哈希，它还将跟踪最近访问过的 URL。

To further increase the efficiency, we can replicate our caching servers to distribute load between them.

> 为了进一步提高效率，我们可以复制缓存服务器以在它们之间分配负载。

**How can each cache replica be updated?** Whenever there is a cache miss, our servers would be hitting a backend database. Whenever this happens, we can update the cache and pass the new entry to all the cache replicas. Each replica can update their cache by adding the new entry. If a replica already has that entry, it can simply ignore it.

> 如何更新每个缓存副本？每当出现缓存未命中时，我们的服务器就会访问后端数据库。每当发生这种情况时，我们都可以更新缓存并将新条目传递给所有缓存副本。每个副本都可以通过添加新条目来更新其缓存。如果副本已经具有该条目，则可以简单地忽略它。

![tinyurl-4](../../../static/images/tinyurl-4-0727878.webp)

## 9. Load Balancer (LB) 

> 9.负载均衡器（LB）

Request flow for accessing a shortened URL

> 访问缩短的 URL 的请求流程

We can add a Load balancing layer at three places in our system:

> 我们可以在系统中的三个位置添加负载均衡层：

1. Between Clients and Application servers

   > 客户端和应用服务器之间

2. Between Application Servers and database servers 

   > 应用服务器和数据库服务器之间 

3. Between Application Servers and Cache servers

   > 应用服务器和缓存服务器之间

Initially, we could use a simple Round Robin approach that distributes incoming requests equally among backend servers. This LB is simple to implement and does not introduce any overhead. Another benefit of this approach is that if a server is dead, LB will take it out of the rotation and will stop sending any traffic to it.

> 最初，我们可以使用简单的循环方法，在后端服务器之间平均分配传入请求。该LB实现简单，不会引入任何开销。这种方法的另一个好处是，如果服务器死机，LB 会将其从轮换中删除，并停止向其发送任何流量。

A problem with Round Robin LB is that server load is not taken into consideration. If a server is overloaded or slow, the LB will not stop sending new requests to that server. To handle this, a more intelligent LB solution can be placed that periodically queries the backend server about its load and adjusts traffic based on that.

> 循环负载均衡的一个问题是没有考虑服务器负载。如果服务器过载或速度缓慢，负载均衡器不会停止向该服务器发送新请求。为了解决这个问题，可以采用更智能的负载均衡解决方案，定期查询后端服务器的负载情况，并据此调整流量。

## 10. Purging or DB cleanup 

> 10. 清除或数据库清理

Should entries stick around forever or should they be purged? If a user-specified expiration time is reached, what should happen to the link?

> 条目应该永远保留还是应该被清除？如果达到了用户指定的过期时间，链接会发生什么情况？

If we chose to actively search for expired links to remove them, it would put a lot of pressure on our database. Instead, we can slowly remove expired links and do a lazy cleanup. Our service will make sure that only expired links will be deleted, although some expired links can live longer but will never be returned to users.

> 如果我们选择主动搜索过期链接来删除它们，这会给我们的数据库带来很大的压力。相反，我们可以慢慢删除过期链接并进行惰性清理。我们的服务将确保只删除过期的链接，尽管有些过期的链接可以存在更长的时间，但永远不会返回给用户。

- Whenever a user tries to access an expired link, we can delete the link and return an error to the user.

  > 每当用户尝试访问过期链接时，我们可以删除该链接并向用户返回错误。

- A separate Cleanup service can run periodically to remove expired links from our storage and cache. This service should be very lightweight and can be scheduled to run only when the user traffic is expected to be low.

  > 可以定期运行单独的清理服务，以从我们的存储和缓存中删除过期的链接。该服务应该非常轻量级，并且可以安排仅在预计用户流量较低时运行。

- We can have a default expiration time for each link (e.g., two years).

  > 我们可以为每个链接设置一个默认的过期时间（例如两年）。

- After removing an expired link, we can put the key back in the key-DB to be reused.

  > 删除过期链接后，我们可以将密钥放回到密钥数据库中以供重复使用。

- Should we remove links that haven’t been visited in some length of time, say six months? This could be tricky. Since storage is getting cheap, we can decide to keep links forever.

  > 我们是否应该删除一段时间内（例如六个月）未访问过的链接？这可能会很棘手。由于存储变得越来越便宜，我们可以决定永远保留链接。


![tinyurl-5](../../../static/images/tinyurl-5-0727878.webp)

Detailed component design for URL shortening

> URL缩短的详细组件设计

## 11. Telemetry 

> 11. 遥测

How many times a short URL has been used, what were user locations, etc.? How would we store these statistics? If it is part of a DB row that gets updated on each view, what will happen when a popular URL is slammed with a large number of concurrent requests?

> 短 URL 使用了多少次，用户位置是什么，等等？我们如何存储这些统计数据？如果它是在每个视图上更新的数据库行的一部分，那么当流行的 URL 受到大量并发请求的冲击时会发生什么？

Some statistics worth tracking: country of the visitor, date and time of access, web page that refers the click, browser, or platform from where the page was accessed.

> 一些值得跟踪的统计数据：访问者所在的国家/地区、访问日期和时间、引用点击的网页、浏览器或访问页面的平台。

## 12. Security and Permissions 

> 12. 安全和权限

Can users create private URLs or allow a particular set of users to access a URL?

> 用户能否创建私有 URL 或允许特定用户组访问 URL？

We can store permission level (public/private) with each URL in the database. We can also create a separate table to store UserIDs that have permission to see a specific URL. If a user does not have permission and tries to access a URL, we can send an error (HTTP 401) back. Given that we are storing our data in a NoSQL wide-column database like Cassandra, the key for the table storing permissions would be the ‘Hash’ (or the KGS generated ‘key’). The columns will store the UserIDs of those users that have permissions to see the URL.

> 我们可以在数据库中存储每个 URL 的权限级别（公共/私有）。我们还可以创建一个单独的表来存储有权查看特定 URL 的 UserID。如果用户没有权限并尝试访问 URL，我们可以发回错误 (HTTP 401)。鉴于我们将数据存储在像 Cassandra 这样的 NoSQL 宽列数据库中，表存储权限的密钥将是“哈希”（或 KGS 生成的“密钥”）。这些列将存储有权查看 URL 的用户的 UserID。



---

参考文章

- [Designing a URL Shortening service like TinyURL](https:/www.designgurus.io/course-play/grokking-the-system-design-interview/doc/638c0b5dac93e7ae59a1af6b)
- [Design a URL Shortening Service / TinyURL](https:/www.educative.io/courses/grokking-modern-system-design-interview-for-engineers-managers/system-design-tinyurl)