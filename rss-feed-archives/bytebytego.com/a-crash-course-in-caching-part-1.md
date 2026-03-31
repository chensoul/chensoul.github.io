## **Introduction**

Caching is a fundamental technique in computing that enables quick retrieval of frequently accessed data. A study conducted by Amazon found that increasing page load time by just 100 milliseconds costs 1% in sales. By storing frequently accessed data in faster storage, usually in memory, caching improves data retrieval speed and improves overall system performance. This highlights the significant impact caching can have on the user experience and ultimately on business success.

The following is a list of the topics we will cover in this series.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F75ac0f61-0c32-4c89-8613-84aad7096533_2104x1572.png)



## **What is a cache**

Definition: according to Wikipedia: “*In computing, a cache is a hardware or software component that stores data so that future requests for that data can be served faster; the data stored in a cache might be the result of an earlier computation or a copy of data stored elsewhere*”.

Let's look at a concrete example.

When a client/server request is made without caching, the client sends a request to the service, which then retrieves data from storage and sends it back to the client. However, retrieving data from storage can become slow and overloaded with high volumes of traffic.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F974509e4-4e28-4dcd-ba04-dc32641f0cce_1611x324.png)



Adding a cache to the system can help overcome these limitations. When data is requested, the service first checks the cache for the data. If the data is present in the cache, it is quickly returned to the service. If the data is not found in the cache, the service retrieves it from storage, stores it in the cache, and then responds to the client. This allows for faster retrieval of frequently accessed data since cache usually stores data in memory in a data structure optimized for fast access.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F53f09197-acce-443a-a0b7-8060720ae4db_1680x660.png)



Cache systems and storage systems differ in several ways. First, cache systems store frequently accessed data in memory. Storage systems store data on disks. Since memory is more expensive than disk, cache systems typically have much smaller data capacity than storage systems. This means that cache systems can store only a subset of the total data set.

Second, the data stored in cache systems are not designed for long-term data persistence and durability. Cache systems are used to improve performance. They do not provide durable data storage. In contrast, storage systems are designed to provide long-term data persistence and durability, ensuring that data is always available when needed.

Finally, cache systems are optimized for supporting heavy traffic and high concurrency. By storing data in memory, cache servers can respond quickly to incoming requests, which is crucial for high-traffic websites or applications. Storage systems, on the other hand, are better suited for durably storing and managing large amounts of data.

If the data that is requested is available in the cache, it is known as a **cache hit**, otherwise, it is known as a **cache miss**. Because accessing data from the cache is significantly faster than accessing it from storage, the system overall operates more efficiently when there are more cache hits. The effectiveness of a cache is measured by the **cache hit ratio**, which is the number of cache hits divided by the number of cache requests. Higher ratios indicate better overall performance.

## **Where is caching used**

While the previous example showcased caching in client/server computing, it is worth noting that caching is extensively used in modern computer and software systems.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F86351256-48c9-447d-8e10-814876662f66_3114x4059.png)



Modern computers utilize multiple levels of cache, including the L1, L2, and L3 caches, to provide fast access to frequently used data for the CPU.

The Memory Management Unit (MMU) is responsible for mapping virtual memory addresses to physical memory addresses. The MMU contains a specialized cache called the Translation Lookaside Buffer (TLB), which stores the most recently used address translations to speed up the address translation process.

The operating system employs a page cache in the main memory to enhance overall system performance. The page cache stores frequently accessed data pages and reduces the number of disk accesses, which can slow down the system.

By utilizing these different levels of cache, modern computers can improve their overall performance and efficiency.

In software systems, caching plays a crucial role in enhancing performance and reducing network latency.

Browsers use a cache to store frequently accessed website images, data, and documents, resulting in faster load times and a smoother browsing experience. This cache is commonly known as the browser cache.

Content Delivery Networks (CDNs) are another form of caching used to deliver static resources such as images, videos, CSS files, and other multimedia content. CDNs are a geographically distributed network of proxy servers that work together to deliver content from the nearest server to the user's location. This significantly reduces the time taken to access the content, resulting in a faster-loading website.

Caching in databases is essential for improving performance and reducing execution overhead. Some typical caches found in databases include the buffer cache, result cache, query cache, metadata cache, and session cache. These caches store frequently accessed data blocks, query results, metadata, and session-specific information in memory to reduce disk reads and query execution time, resulting in faster query response times and a better user experience.

Two widely used caching systems are Memcached and Redis. They are open-source, high-performance, distributed caching systems that can be used to store and retrieve data quickly.

Real-world use cases for caching include storing historical emails locally to avoid repeatedly pulling the same data from the server, caching popular tweets on social media websites like Twitter, and preloading and caching product information for flash sale systems to prevent excessive database pressure.

Caching is an effective solution for scenarios where data changes infrequently, the same data is accessed multiple times, the same output is produced repeatedly, or the results of time-consuming queries or calculations are worth caching.

While there are many different types of caches in hardware and software, this article will focus on the general caching use cases in system design, exploring its principles, strategies, and problems.