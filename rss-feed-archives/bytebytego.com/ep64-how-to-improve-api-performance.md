This week’s system design refresher:

+   How Discord Stores TRILLIONS of Messages (YouTube video)
    
+   Netflix's Overall Architecture
    
+   How to improve API performance
    
+   Branching strategies
    
+   Key data terms
    
+   ByteByteGo is looking for guest posts
    

## [2023 State of the Java Ecosystem Report by New Relic (Sponsored)](https://bit.ly/NewRelic_061723A)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98c7839b-2304-44c2-a6b8-d79c99e72984_1572x928.png)



Get an in-depth look at one of the most popular programming languages in New Relic's 2023 State of the Java Ecosystem report.

You’ll get insight into:

+   The most used Java versions in production
    
+   The most popular JDK vendors
    
+   The rise of containers
    
+   The most common heap size configurations
    
+   The most used garbage collection algorithms
    

Highlights from the report:

+   Java 17 user adoption grew 430% in one year
    
+   Java 14 is the most popular non-LTS version
    
+   Amazon is now the most popular JDK vendor
    
+   Containers rule everything around us
    

[New Relic's Quickstart](https://bit.ly/NewRelic_061723B)

[Read the full report](https://bit.ly/NewRelic_061723A)

## How Discord Stores TRILLIONS of Messages

## Netflix's Overall Architecture

This post is based on research from many Netflix engineering blogs and open-source projects. If you come across any inaccuracies, please feel free to inform us.



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c03dee3-21ad-4963-9b7c-44cf730ccebd_1280x1851.jpeg "diagram")



**Mobile and web:** Netflix has adopted Swift and Kotlin to build native mobile apps. For its web application, it uses React.

**Frontend/server communication:** Netflix uses GraphQL.

**Backend services:** Netflix relies on ZUUL, Eureka, the Spring Boot framework, and other technologies.

**Databases:** Netflix utilizes EV cache, Cassandra, CockroachDB, and other databases.

**Messaging/streaming:** Netflix employs Apache Kafka and Fink for messaging and streaming purposes.

**Video storage:** Netflix uses S3 and Open Connect for video storage.

**Data processing:** Netflix utilizes Flink and Spark for data processing, which is then visualized using Tableau. Redshift is used for processing structured data warehouse information.

**CI/CD:** Netflix employs various tools such as JIRA, Confluence, PagerDuty, Jenkins, Gradle, Chaos Monkey, Spinnaker, Altas, and more for CI/CD processes.

## How to improve API performance

The diagram below shows 5 common tricks to improve API performance.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccd8dede-de4d-4fab-bc5f-c2e64c2fbe90_1488x1536.jpeg "No alternative text description for this image")



1.  Pagination  
    This is a common optimization when the size of the result is large. The results are streaming back to the client to improve the service responsiveness.
    
2.  Asynchronous Logging  
    Synchronous logging deals with the disk for every call and can slow down the system. Asynchronous logging sends logs to a lock-free buffer first and immediately returns. The logs will be flushed to the disk periodically. This significantly reduces the I/O overhead.
    
3.  Caching  
    We can cache frequently accessed data into a cache. The client can query the cache first instead of visiting the database directly. If there is a cache miss, the client can query from the database. Caches like Redis store data in memory, so the data access is much faster than the database.
    
4.  Payload Compression  
    The requests and responses can be compressed using gzip etc so that the transmitted data size is much smaller. This speeds up the upload and download.
    
5.  Connection Pool  
    When accessing resources, we often need to load data from the database. Opening the closing db connections add significant overhead. So we should connect to the db via a pool of open connections. The connection pool is responsible for managing the connection lifecycle.
    

Over to you: What other tricks do you use to improve API performance?

## What branching strategies does your team use?

Teams often employ various branching strategies for managing their code, such as Git flow, feature branches, and trunk-based development.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9a738bd7-dd4c-4e5c-a6fb-3fbecc96b211_1410x1262.jpeg "No alternative text description for this image")



Out of these options, Git flow or its variations are the most widely favored methods. The illustration by Jetbrains explains how it works.

## Data is used everywhere, but do you know all the commonly used data terms?



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd647466d-68a4-4148-ad40-855459737271_1577x1536.jpeg "No alternative text description for this image")



+   Data Warehouse: A large, structured repository of integrated data from various sources, used for complex querying and historical analysis. \\
    
+   Data Mart: A more focused, department-specific subset of a data warehouse providing quick data retrieval and analysis.
    
+   Data Lake: A vast pool of raw, unstructured data stored in its native format until it's needed for use.
    
+   Delta Lake: An open-source storage layer that brings reliability and ACID transactions to data lakes, unifying batch, and streaming data processing.
    
+   Data Pipeline: A process that moves and transforms data from one system to another, often used to populate data warehouses and data lakes.
    
+   Data Mesh: An architectural and organizational approach where data ownership and delivery are decentralized across domain-specific, cross-functional teams.
    

Over to you: do you know the difference between a data engineer and a data scientist?

## ByteByteGo is looking for guest posts/authors

I’m looking for guest posts/authors for ByteByteGo's social media or newsletter (> 1.5 million audiences).

ByteByteGo's social media channels reach an extensive audience of over 1.5 million individuals worldwide.

Qualifications:

+   The ideal person will have read and heard enough of our content and can explain complex technical topics with simple illustrations.
    
+   Proficient research skills in a subject you are knowledgeable about.
    
+   Ability to cover topics that appeal to a wide audience. This is important.
    

Submit your pitch **[here](https://lnkd.in/eKnPzc24).**