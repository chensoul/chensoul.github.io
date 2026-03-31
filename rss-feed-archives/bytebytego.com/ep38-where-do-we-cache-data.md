This week’s system design refresher:

+   ByteByteGo Facebook page
    
+   What is OSI Model? (Youtube video)
    
+   Where do we cache data?
    
+   CI/CD Pipeline
    
+   What tech stack is commonly used for microservices?
    

## ByteByteGo Facebook page

We’ve launched a Facebook page and want our content to be more accessible.

Follow us on FB: [https://lnkd.in/eKnvWMx2](https://lnkd.in/eKnvWMx2)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F8207719a-5d92-4b7f-81ab-56952f9ca994_1080x1518.jpeg)



## What is OSI Model?

## Where do we cache data?

Data is cached everywhere, from the front end to the back end!

This diagram illustrates where we cache data in a typical architecture.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F9d1ca70c-7df2-45e2-92e1-309ceb6e7bdb_1280x1867.jpeg)



There are **multiple layers** along the flow.

1.  **Client apps**: HTTP responses can be cached by the browser. We request data over HTTP for the first time, and it is returned with an expiry policy in the HTTP header; we request data again, and the client app tries to retrieve the data from the browser cache first.
    
2.  **CDN**: CDN caches static web resources. The clients can retrieve data from a CDN node nearby.
    
3.  **Load Balancer**: The load Balancer can cache resources as well.
    
4.  **Messaging infra**: Message brokers store messages on disk first, and then consumers retrieve them at their own pace. Depending on the retention policy, the data is cached in Kafka clusters for a period of time.
    
5.  **Services**: There are multiple layers of cache in a service. If the data is not cached in the CPU cache, the service will try to retrieve the data from memory. Sometimes the service has a second-level cache to store data on disk.
    
6.  **Distributed Cache**: Distributed cache like Redis hold key-value pairs for multiple services in memory. It provides much better read/write performance than the database.
    
7.  **Full-text Search**: we sometimes need to use full-text searches like Elastic Search for document search or log search. A copy of data is indexed in the search engine as well.
    
8.  **Database**: Even in the database, we have different levels of caches:
    

+   WAL(Write-ahead Log): data is written to WAL first before building the B tree index
    
+   Bufferpool: A memory area allocated to cache query results
    
+   Materialized View: Pre-compute query results and store them in the database tables for better query performance
    
+   Transaction log: record all the transactions and database updates
    
+   Replication Log: used to record the replication state in a database cluster
    

Over to you: With the data cached at so many levels, how can we guarantee the **sensitive user data** is completely erased from the systems?

## CI/CD Pipeline

A CI/CD pipeline is a tool that automates the process of building, testing, and deploying software. 

It integrates the different stages of the software development lifecycle, including code creation and revision, testing, and deployment, into a single, cohesive workflow. 

The diagram below illustrates some of the tools that are commonly used. 



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F05104299-813f-4df7-91d1-e143fd1ee6a6_1016x571.png)



## What tech stack is commonly used for microservices?

Below you will find a diagram showing the microservice tech stack, both for the development phase and for production.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fb1e0e31c-ad36-46b7-85a3-bd5b19dc4fab_2812x2622.jpeg)



**Pre-production**

+   Define API - This establishes a contract between frontend and backend. We can use Postman or OpenAPI for this.
    
+   Development - Node.js or react is popular for frontend development, and java/python/go for backend development. Also, we need to change the configurations in the API gateway according to API definitions.
    
+   Continuous Integration - JUnit and Jenkins for automated testing. The code is packaged into a Docker image and deployed as microservices.
    

**Production**

+   NGinx is a common choice for load balancers. Cloudflare provides CDN (Content Delivery Network). 
    
+   API Gateway - We can use spring boot for the gateway, and use Eureka/Zookeeper for service discovery.
    
+   The microservices are deployed on clouds. We have options among AWS, Microsoft Azure, and Google GCP.
    
+   Cache and Full-text Search - Redis is a common choice for caching key-value pairs. ElasticSearch is used for full-text search.
    
+   Communications - For services to talk to each other, we can use messaging infra Kafka or RPC.
    
+   Persistence - We can use MySQL or PostgreSQL for a relational database, and Amazon S3 for object store. We can also use Cassandra for the wide-column store if necessary.
    
+   Management & Monitoring - To manage so many microservices, the common Ops tools include Prometheus, Elastic Stack, and Kubernetes.
    

## **Featured job openings**

**HEIR**: [Senior Software Engineer, Full Stack](https://substack.com/redirect/6f0490ba-2166-45f3-a598-c4b068e9048e?j=eyJ1IjoiMWxyMnJiIn0.3gL4cFwDHqFL_VcXxR7HzMwPYkuu_RpwPuz8o-oe3gw) (United States)