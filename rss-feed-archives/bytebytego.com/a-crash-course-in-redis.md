Redis (Remote Dictionary Server) is an open-source (BSD licensed), in-memory database, often used as a cache, message broker, or streaming engine. It has rich support for data structures, including basic data structures like String, List, Set, Hash, SortedSet, and probabilistic data structures like Bloom Filter, and HyperLogLog. 

Redis is super fast. We can run [Redis benchmarks](https://redis.io/docs/management/optimization/benchmarks/) with its own tool. The throughput can reach nearly ***100k requests*** per second.

In this issue, we will discuss why Redis is fast in its architectural design.

## Redis Architecture

Redis is an in-memory key-value store. There are several important functions：

1.  The data structures used for the values
    
2.  The operations allowed on the data structures
    
3.  Data persistence
    
4.  High availability
    

Below is a high-level diagram of Redis' architecture. Let’s walk through them one by one.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c86063b-5ccf-44b3-b11c-d4dd52e10d7e_1438x1600.png)



### Client Libraries

There are two types of clients to access Redis: one supports connections to the Redis database, and the other builds on top of the former and supports object mappings.

Redis supports a wide range of languages, allowing it to be used in a variety of applications. In addition, the OM client libraries allow us to model, index, and query documents.

### Data Operations

Redis has rich support for value data types, including Strings, Lists, Sets, Hashes, etc. As a result, Redis is suitable for a wide range of business scenarios. Depending on the data types, Redis supports different operations. 

The basic operations are similar to a relational database, which supports CRUD (Create-Read-Update-Delete):

+   GET: Retrieve the value of a key
    
+   PUT: Create a new key-value pair or update an existing key
    
+   DELETE: Delete a key-value pair 
    

The data structures and operations are an important reason why Redis is so efficient. We will cover more in later sections.

### In-Memory v.s. On-Disk

Redis holds the data in memory. The data reads and writes in memory are generally 1,000X - 10,000X faster than disk reads/writes. See the below diagram for details. 



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff6747e9f-cdba-45d6-b600-6506fff648dc_1600x750.png)



However, if the server is down, all the data will be lost. So Redis designs on-disk persistence as well for fast recovery.

Redis has 4 options for persistence:

1.  AOF (Append Only File).
    

AOF works like a commit log, recording each write operation to Redis. So when the server is restarted, the write operations can be replayed and the dataset can be reconstructed.

2.  RDB (Redis Database).
    

RDB performs point-in-time snapshots at a predefined interval.

3.  AOF and RDB.
    

This persistence method combines the advantages of both AOF and RDB, which we will cover later.

4.  No persistence.
    

Persistence can be entirely disabled in Redis. This is sometimes used when Redis is a cache for smaller datasets, 

### Clustering

Redis uses a leader-follower replication to achieve high availability. We can configure multiple replicas for reads to handle concurrent read requests. These replicas automatically connect to the master after restarts and hold an exact copy of the leader instance.

When the Redis cluster is not used, Redis Sentinel provides high availability including failover, monitoring, and configuration management.

### Security and Administration

Redis is often used as a cache and can hold sensitive data, so it is designed to be accessed via trusted clients inside trusted environments. Redis security module is responsible for managing the access control layer and authorizing the valid operations to be performed on the data.

Redis also provides an admin interface for configuring and managing the cluster. Persistence, replication, and security configurations can all be done via the admin interface.

Now we have covered the basic components of Redis architecture, we will dive into the design details that make Redis fast.

## In-Memory Data Structures

Redis is not the only in-memory database product in the market. But how can it achieve microsecond-level data access latency and become a popular choice for many companies?

One important reason is that storing data in memory allows for more flexible data structures. **These data structures don’t need to go through the process of serialization and deserialization** like normal on-disk data structures do, so can be optimized for fast reads and writes.

### Key-Value Mappings

Redis uses a hash table to hold all key-value pairs. The elements in the hash table hold the pointers to a key-value pair entry. The diagram below illustrates how the global hash table is structured. 

With the hash table, we can look up key-value pairs with O(1) time complexity. 



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1656c024-421b-4e16-8050-aea8c550d5c8_1600x1566.png)



Like all hash tables, when the number of keys keeps growing, there can be hash conflicts, which means different keys fall into the same hash bucket. Redis solves this by chaining the elements in the same hash bucket. When the chains become too long, Redis will perform a rehash by leveraging two global hash tables.  

### Value Types

The diagram below shows how Redis implements the common data structures. String type has only one implementation, the SDS (Simple Dynamic Strings). List, Hash, Set, and SortedSet all have two types of implementations.

Note that Redis 7.0 changed List implementation to quicklist, and ZipList was replaced by listpack.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7596d941-05b6-4fba-9c57-f5c33e4971bf_1600x1110.png)



Besides these 5 basic data structures, Redis later added more data structures to support more scenarios. The diagram below lists the operations allowed on basic data structures and the usage scenarios.

These data types cover most of the usage of a website. For example, geospatial data stores coordinates that can be used by a ride-hailing application like Uber; HyperLogLog calculates cardinality for massive amounts of data, suitable for counting unique visitors for a large website; Stream is used for message queues and can compensate the problems with List.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F36232d4c-1720-4ca0-81db-bbb6df5f95a2_1600x687.png)



Now let’s look at why these underlying implementations are efficient.

#### SDS

Redis SDS stores sequences of bytes. It operates the data stored in *buf* array in a binary way, so SDS can store not only text but also binary data like audio, video, and images.

The string length operation on an SDS has a time complexity of O(1) because the length is recorded in *len* attribute. The space is pre-allocated for an SDS, with *free* attribute recording the free space for future usage. The SDS API is thus safe, and there is no risk of overflow.

The diagram below shows the attributes of an SDS.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6715ef76-4158-4340-ba7a-1ff363dbf076_1367x487.png)



#### Zip List

A zip list is similar to an array. Each element of the array holds one piece of data. However, unlike an array, a zip list has 3 fields in the header: 

+   *zlbytes* - the length of the list
    
+   *zltail* \- the offset at the end of the list
    
+   *zllen* - the number of entries in the list
    

The zip list also has a *zlend* at the end, which indicates the end of the list.

In a zip list, locating the first or the last element is O(1) time complexity because we can directly find them by the fields in the header. Locating other elements needs to go through the elements one by one, and the time complexity is O(N).



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd77fc384-7e09-4008-a625-8e367d852848_407x847.png)

