This week’s system design refresher:

+   My recommended materials for cracking your next technical interview
    
+   Cheat Sheet for Monitoring Infrastructure in Cloud Services
    
+   Top 5 Caching Strategies
    
+   Uber Tech Stack
    
+   How many message queues do you know?
    

## [The 2023 Observability Forecast report is here! (Sponsored)](https://bit.ly/NewRelic091623)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F302be241-9dc4-44bc-9513-3957b34eef8d_3840x2160.png)



The third annual Observability Forecast by New Relic is out now! We surveyed 1,700 technology professionals—making it the largest, most comprehensive study of its kind in the observability industry. The survey results show that observability continues to deliver a clear, positive business impact and a 2x median annual return on investment (ROI). Organizations continue to see the business value of observability—and expect to invest more in it.

[Read the free report](https://bit.ly/NewRelic091623)

## My recommended materials for cracking your next technical interview



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff1e626dc-019b-4015-a45c-75facbc14d82_1280x1664.gif)



Coding

+   Leetcode
    
+   Cracking the coding interview book
    
+   Neetcode
    

System Design Interview 

+   System Design Interview Book 1, 2 by Alex Xu, Sahn Lam
    
+   Grokking the system design by Design Guru
    
+   Design Data-intensive Application book
    

Behavioral interview

+   Tech Interview Handbook (Github repo)
    
+   A Life Engineered (YT)
    
+   STAR method (general method)
    

OOD Interview

+   Interviewready
    
+   OOD by educative
    
+   Head First Design Patterns Book
    

Mock interviews

+   Interviewingio
    
+   Pramp
    
+   Meetapro
    

Apply for Jobs

+   Linkedin
    
+   Monster
    
+   Indeed
    

Over to you: What is your favorite interview prep material?

## Latest articles

If you’re not a subscriber, here’s what you missed this month.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F421a2ee4-88a3-40d4-8a5f-3a78b369d337_1600x1600.png)



1.  [How to Choose a Message Queue? Kafka vs. RabbitMQ](https://blog.bytebytego.com/p/how-to-choose-a-message-queue-kafka)
    
2.  [Why Do We Need a Message Queue?](https://blog.bytebytego.com/p/why-do-we-need-a-message-queue)
    
3.  [Database Indexing Strategies - Part 2](https://blog.bytebytego.com/p/database-indexing-strategies-part)
    
4.  [Data Replication: A Key Component for Building Large-Scale Distributed Systems](https://blog.bytebytego.com/p/data-replication-a-key-component)
    
5.  [Common Failure Causes](https://blog.bytebytego.com/p/common-failure-causes)
    

To receive all the full articles and support ByteByteGo, consider subscribing:

## A nice cheat sheet of different monitoring infrastructure in cloud services

This cheat sheet offers a concise yet comprehensive comparison of key monitoring elements across the three major cloud providers and open-source / 3rd party tools.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F548288a8-0b55-4653-8378-6682ab9d90c5_4487x5982.png)



Let's delve into the essential monitoring aspects covered:

+   Data Collection: Gather information from diverse sources to enhance decision-making.
    
+   Data Storage: Safely store and manage data for future analysis and reference.
    
+   Data Analysis: Extract valuable insights from data to drive informed actions.
    
+   Alerting: Receive real-time notifications about critical events or anomalies.
    
+   Visualization: Present data in a visually comprehensible format for better understanding.
    
+   Reporting and Compliance: Generate reports and ensure adherence to regulatory standards.
    
+   Automation: Streamline processes and tasks through automated workflows.
    
+   Integration: Seamlessly connect and exchange data between different systems or tools.
    
+   Feedback Loops: Continuously refine strategies based on feedback and performance analysis.
    

Over to you: How do you prioritize and leverage these essential monitoring aspects in your domain to achieve better outcomes and efficiency?

## One picture is worth a thousand words - Top 5 Caching Strategies

When we introduce a cache into the architecture, synchronization between the cache and the database becomes inevitable.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff8210268-53f6-4d7f-a822-863c293505f5_2880x3340.png)



Let’s look at 5 common strategies how we keep the data in sync.

+   Read Strategies:  
    Cache aside  
    Read through
    
+   Write Strategies:  
    Write around  
    Write back  
    Write Through
    

The caching strategies are often used in combination. For example, write-around is often used together with cache-aside to make sure the cache is up-to-date.

Over to you: What strategies have you used?

## Uber Tech Stack

This post is based on research from many Uber engineering blogs and open-source projects. If you come across any inaccuracies, please feel free to inform us. The corresponding links are added in the comment section.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8924a02e-13a5-4850-b7e9-4cdea41bd4f9_1700x2300.png)



Web frontend: Uber builds Fusion.js as a modern React framework to create robust web applications. They also develop visualization.js for geospatial visualization scenarios.

Mobile side: Uber builds the RIB cross-platform with the VIPER architecture instead of MVC. This architecture can work with different languages: Swift for iOS, and Java for Android.

Service mesh: Uber built Uber Gateway as a dynamic configuration on top of NGINX. The service uses gRPC and QUIC for client-server communication and Apache Thrift for API definition.

Service side: Uber built a unified configuration store named Flipr (later changed to UCDP), H3 as a location-index store library. They use Spring Boot for Java-based services, uAct for event-driven architecture, and Cadence for async workflow orchestration.

Database end: the OLTP mainly uses the strongly-consistent DocStore, which employs MySQL and PostgreSQL, along with the RocksDB database engine.

Big data: managed through the Hadoop family. Hudi and Parquet are used as file formats, and Alluxio serves as cache. Time-series data is stored in Pinot and AresDB.

Data processing: Hive, Spark, and the open-source data ingestion framework Marmaray. Messaging and streaming middleware include Apache Kafka and Apache Flink.

DevOps side: Uber utilizes a Monorepo, with a simplified development environment called devpod. Continuous delivery is managed through Netflix Spinnaker, metrics are emitted to uMetric, alarms on uMonitor, and a consistent observability database M3.

## How many message queues do you know?



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F386ab49a-115b-415b-9101-feb4c2bd9cfd_2048x1487.jpeg)



Like a post office, a message queue helps computer programs communicate in an organized manner. Imagine little digital envelopes being passed around to keep everything on track. There are a few key features to consider when selecting message queues:

+   Speed: How fast messages are sent and received
    
+   Scalability: Can it grow with more messages
    
+   Reliability: Will it make sure messages don’t get lost
    
+   Durability: Can it keep messages safe over time
    
+   Ease of Use: Is it simple to set up and manage
    
+   Ecosystem: Are there helpful tools available
    
+   Integration: Can it play nice with other software
    
+   Protocol Support: What languages can it speak
    

Try out a message queue and practice sending and receiving messages until you're comfortable. Choose an easy one like Kafka and experiment with sending and receiving messages. Read books or take online courses as you get more comfortable. Build little projects and learn from those who have already been there. Soon, you'll know everything about message queues.