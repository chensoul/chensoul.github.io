This week’s system design refresher:

+   How does HTTPS work? (Youtube video)
    
+   Types of databases and use cases
    
+   ElasticSearch
    
+   REST API Design
    

## Ilum the Spark cluster manager and monitoring tool (Sponsored)



![Image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F0eb21d74-ebb8-49ba-9109-74eee44ba604_1062x1058.png "Image")



With Ilum's solution, everyone can now quickly and easily deploy Apache Spark on any Kubernetes cluster. Our software eliminates the need for tedious configuration and reduces the time needed for deployment from days to minutes.

By leveraging the power of container orchestration and Apache Spark's scalability and reliability, we are making it easier than ever to stay ahead of the curve and explore the future of Big Data.

Ilum provides an all-in-one solution for:

+   Apache Spark Cluster management and monitoring
    
+   Managed Spark service
    
+   Hadoop replacement
    
+   Apache Livy alternative
    
+   Spark Session control over REST API
    
+   Real-time interaction with Spark jobs
    

And the best part? It's free! Unlock the power of Big Data today with Ilum.

[Learn More about Ilum!](https://bit.ly/3FH7ymn)

## How does HTTPS work?

## How do you decide which type of database to use?

There are hundreds or even thousands of databases available today, such as Oracle, MySQL, MariaDB, SQLite, PostgreSQL, Redis, ClickHouse, MongoDB, S3, Ceph, etc. How do you select the architecture for your system? My short summary is as follows:



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F31662535-c0e6-43ee-adcb-c0349a431368_3141x2685.jpeg)



+   Relational database. Almost anything could be solved by them. 
    
+   In-memory store. Their speed and limited data size make them ideal for fast operations.
    
+   Time-series database. Store and manage time-stamped data.
    
+   Graph database. It is suitable for complex relationships between unstructured objects.
    
+   Document store. They are good for large immutable data.
    
+   Wide column store. They are usually used for big data, analytics, reporting, etc., which needs denormalized data.
    

## How do we learn ElasticSearch?

Based on the Lucene library, Elasticsearch provides search capabilities. It provides a distributed, multitenant-capable full-text search engine with an HTTP web interface and schema-free JSON documents. The diagram below shows the outline.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fac3c8a9f-2148-4a29-bc72-6898445d1b85_1357x1536.jpeg "No alternative text description for this image")



**Features of ElasticSearch:**

+   Real-time full-text search
    
+   Analytics engine
    
+   Distributed Lucene
    

ElasticSearch use cases:

+   Product search on an eCommerce website
    
+   Log analysis
    
+   Auto completer, spell checker
    
+   Business intelligence analysis
    
+   Full-text search on Wikipedia
    
+   Full-text search on StackOverflow
    

The core of ElasticSearch lies in the data structure and indexing. It is important to understand how ES builds the **term dictionary** using **LSM Tree** (Log-Strucutured Merge Tree).

👉 Over to you: Have you used ElasticSearch in your project, and what is it for?

## **How does REST API work?**

What are its principles, methods, constraints, and best practices? I hope the diagram below gives you a quick overview.

[Blog post](https://blog.devgenius.io/best-practice-and-cheat-sheet-for-rest-api-design-6a6e12dfa89f) by Love Sharma.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F1f91d31b-6f09-45c5-822d-5208b13a5391_1400x1120.jpeg "No alternative text description for this image")



## **Featured job openings**

**Openedges**: [Chief Architect](https://substack.com/redirect/1d3228cc-d1a9-4597-9755-a37dfaca279e?j=eyJ1IjoiMWxyMnJiIn0.3gL4cFwDHqFL_VcXxR7HzMwPYkuu_RpwPuz8o-oe3gw) (San Jose, Austin, Remote)

**Heir**: [Senior Software Engineer, Full Stack](https://bytebytego.pallet.com/jobs/a71a18b2-df0a-471c-a96f-fdfab2ee747d) (United States)