## Llama 5.0 - Add Cache

After implementing the primary-replica architecture, most applications should be able to scale to several hundred thousand users, and some simple applications might be able to reach a million users.

However, for some read-heavy applications, primary-replica architecture might not be able to handle traffic spikes well. For our e-commerce example, flash sale events like Black Friday sales in the United States could easily overload the databases. If the load is sufficiently heavy, some users might not even be able to load the sales page.

The next logical step to handle such situations is to add a cache layer to optimize the read operations.

Redis is a popular in-memory cache for this purpose. Redis reduces the read load for a database by caching frequently accessed data in memory. This allows for faster access to the data since it is retrieved from the cache instead of the slower database. By reducing the number of read operations performed on the database, Redis helps to reduce the load on the database cluster and improve its overall scalability. As summarized below by Jeff Dean et al, in-memory access is 1000X faster than disk access.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0c487af8-7fba-4c04-8c5f-171988e6f95a_1356x694.png)



For our example application, we deploy the cache using the read-through caching strategy. With this strategy, data is first checked in the cache before being read from the database. If the data is found in the cache, it is returned immediately, otherwise, it is loaded from the database and stored in the cache for future use.

There are other cache strategies and operational considerations when deploying a caching layer at scale. For example, with another copy of data stored in the cache, we have to maintain data consistency. We will have a deep dive series on caching soon to explore this topic in much greater detail.

There is another class of application data that is highly cacheable: the static contents for the application, such as images, videos, style sheets, and application bundles, which are infrequently updated. They should be served by a Content Delivery Network (CDN).

A CDN serves the static content from a network of servers located closer to the end user, reducing latency, and improving the loading speed of the web pages. This results in a better user experience, especially for users located far away from the application server.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1d995b0c-21d1-4272-a8d6-03b72423672e_1600x1527.png)



## Llama 6.0 - DB Sharding

A cache layer can provide some relief for read-heavy applications. However, as we continue to scale, the amount of write requests will start to overload the single primary database. This is when it might make sense to shard the primary database.

There are two ways to shard a database: horizontally or vertically.

Horizontal sharding is more common. It is a database partitioning technique that divides data across multiple database servers based on the values in one or more columns of a table. For example, a large user table can be partitioned based on user ID. It results in multiple smaller tables stored on separate database servers, with each handling a small subset of the rows that were previously handled by the single primary database.

Vertical sharding is less common. It separates tables or parts of a table into different database servers based on the specific needs of the application. This optimizes the application based on specific access patterns of each column.

Database sharding has some significant drawbacks.

First, sharding adds complexity to the application and database layers. Data must be partitioned and distributed across multiple databases, making it difficult to ensure data consistency and integrity.

Second, sharding introduces performance overhead, increasing application latency, especially for operations that require data from multiple shards.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fea2a52b2-ad5e-4709-9860-366c0f1f79bb_1600x904.png)

