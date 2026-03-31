This week’s system design refresher:

+   System Design: Apache Kafka In 3 Minutes (Youtube video)
    
+   Netflix's Tech Stack
    
+   How Do C++, Java, Python Work?
    
+   Top 5 Kafka use cases
    
+   How is data transmitted between applications?
    
+   An Unusual Request: Combating International Book Piracy on Amazon
    

## [Engineering Metrics CEOs Love | A Free Presentation Deck](https://bit.ly/LinearB090923)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fee5b1e8f-5c36-4625-8c7f-6c0d4da8bacb_1600x840.jpeg)



For too many engineering leaders, the most stressful part of their job isn’t a bug or a system crash. The thing they worry about most is having to step into a boardroom and make the case that their engineering team is positively impacting the broader company.

In this CEO-approved slide deck, you’ll find simple ways to communicate how your team is increasing engineering efficiency, all while delivering business results consistently.

From crystal-clear ways to illustrate how engineering resources match company priorities to how developers reduce the turnaround time on essential features, the CTO Board Deck is your secret weapon for owning any boardroom you enter.

[Get The Deck](https://bit.ly/LinearB090923)

## **System Design: Apache Kafka In 3 Minutes**

## Netflix's Tech Stack

This post is based on research from many Netflix engineering blogs and open-source projects. If you come across any inaccuracies, please feel free to inform us.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa96d8b37-03f5-43b3-af22-bea2ee7a8ebb_1280x1810.jpeg)



Mobile and web: Netflix has adopted Swift and Kotlin to build native mobile apps. For its web application, it uses React.

Frontend/server communication: GraphQL.

Backend services: Netflix relies on ZUUL, Eureka, the Spring Boot framework, and other technologies.

Databases: Netflix utilizes EV cache, Cassandra, CockroachDB, and other databases.

Messaging/streaming: Netflix employs Apache Kafka and Fink for messaging and streaming purposes.

Video storage: Netflix uses S3 and Open Connect for video storage.

Data processing: Netflix utilizes Flink and Spark for data processing, which is then visualized using Tableau. Redshift is used for processing structured data warehouse information.

CI/CD: Netflix employs various tools such as JIRA, Confluence, PagerDuty, Jenkins, Gradle, Chaos Monkey, Spinnaker, Altas, and more for CI/CD processes.

## Latest articles

If you’re not a subscriber, here’s what you missed this month.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01cac04d-c110-4f6e-9fb6-00cfa5a2459b_1382x1662.png)



1.  [Data Replication: A Key Component for Building Large-Scale Distributed Systems](https://blog.bytebytego.com/p/data-replication-a-key-component)
    
2.  [Common Failure Causes](https://blog.bytebytego.com/p/common-failure-causes)
    
3.  [How to Choose a Message Queue? Kafka vs. RabbitMQ](https://blog.bytebytego.com/p/how-to-choose-a-message-queue-kafka)
    
4.  [Why Do We Need a Message Queue?](https://blog.bytebytego.com/p/why-do-we-need-a-message-queue)
    
5.  [Database Indexing Strategies - Part 2](https://blog.bytebytego.com/p/database-indexing-strategies-part)
    

## How Do C++, Java, Python Work?

The diagram shows how the compilation and execution work.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2ab2055f-f604-4a80-84c9-4438d65a0146_1280x1664.gif)



Compiled languages are compiled into machine code by the compiler. The machine code can later be executed directly by the CPU. Examples: C, C++, Go.

A bytecode language like Java, compiles the source code into bytecode first, then the JVM executes the program. Sometimes JIT (Just-In-Time) compiler compiles the source code into machine code to speed up the execution. Examples: Java, C#

Interpreted languages are not compiled. They are interpreted by the interpreter during runtime.  Examples: Python, Javascript, Ruby

Compiled languages in general run faster than interpreted languages.

Over to you: which type of language do you prefer?

## Top 5 Kafka use cases

Kafka was originally built for massive log processing. It retains messages until expiration and lets consumers pull messages at their own pace.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3811df32-2eec-46a7-8745-24d7449d1803_2862x3980.png)



Unlike its predecessors, Kafka is more than a message queue, it is an open-source event streaming platform for various cases.

Let’s review the popular Kafka use cases.

1.  Log processing and analysis  
    The diagram below shows a typical ELK (Elastic-Logstash-Kibana) stack. Kafka efficiently collects log streams from each instance. ElasticSearch consumes the logs from Kafka and indexes them. Kibana provides a search and visualization UI on top of ElasticSearch.
    
2.  Data streaming in recommendations  
    E-commerce sites like Amazon use past behaviors and similar users to calculate product recommendations. The diagram below shows how the recommendation system works. Kafka streams the raw clickstream data, Flink processes it, and model training consumes the aggregated data from the data lake. This allows continuous improvement of the relevance of recommendations for each user.
    
3.  System monitoring and alerting  
    Similar to the log analysis system, we need to collect system metrics for monitoring and troubleshooting. The difference is that metrics are structured data while logs are unstructured text. Metrics data is sent to Kafka and aggregated in Flink. The aggregated data is consumed by a real-time monitoring dashboard and alerting system (for example, PagerDuty).
    
4.  CDC (Change data capture)  
    Change Data Capture (CDC) streams database changes to other systems for replication or cache/index updates. For example, in the diagram below, the transaction log is sent to Kafka and ingested by ElasticSearch, Redis, and secondary databases.
    
5.  System migration  
    Upgrading legacy services is challenging - old languages, complex logic, and lack of tests. We can mitigate the risk by leveraging a messaging middleware. In the diagram below, to upgrade the order service in the diagram below, we update the legacy order service to consume input from Kafka and write the result to ORDER topic. The new order service consumes the same input and writes the result to ORDERNEW topic. A reconciliation service compares ORDER and ORDERNEW. If they are identical, the new service passes testing.
    

Over to you: Do you have any other Kafka use cases to share?

## How is data transmitted between applications?

The diagram below shows how a server sends data to another server.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff0a95b3b-eeac-4f58-91e0-32f055f5f4fb_2480x2880.png)



Assume a chat application running in the user space sends out a chat message. The message is sent to the send buffer in the kernel space. The data then goes through the network stack and is wrapped with a TCP header, an IP header, and a MAC header. The data also goes through qdisc (Queueing Disciplines) for flow control. Then the data is sent to the NIC (Network Interface Card) via a ring buffer.

The data is sent to the internet via NIC. After many hops among routers and switches, the data arrives at the NIC of the receiving server.

The NIC of the receiving server puts the data in the ring buffer and sends a hard interrupt to the CPU. The CPU sends a soft interrupt so that ksoftirqd receives data from the ring buffer. Then the data is unwrapped through the data link layer, network layer and transport layer. Eventually, the data (chat message) is copied to the user space and reaches the chat application on the receiving side.

Over to you: What happens when the ring buffer is full? Will it lose packets?

## An Unusual Request: Combating International Book Piracy on Amazon

As many of you know, I publish my books on Amazon.

It is a great platform to do so. Amazon is where I direct people to find and buy my books. Unfortunately, there is an increasingly problematic piracy issue on the site for my books internationally, especially in India, which I am no longer able to solve by myself. The provided links direct to Amazon India, and ALL the books sold through those links are pirated.

1.  [System Design Interview Volume 1](https://www.amazon.in/System-Design-Interview-insiders-Second/dp/B08CMF2CQF/)
    
2.  [System Design Interview Volume 2](https://www.amazon.in/System-Design-Interview-Insiders-Guide/dp/1736049119/)
    
3.  [Machine Learning System Design Interview](https://www.amazon.in/Machine-Learning-System-Design-Interview/dp/1736049127/)
    

More and more customers are getting low-quality, pirated books shipped to them. The smaller problem is that pirates get paid, and not me. The larger problem is that people get books that are unusable and unacceptable in quality, and leave 1-start reviews.

If you work at Amazon, can you please reply to this email, and help escalate this issue? I would like to keep promoting Amazon as a trusted source to purchase my books. But this issue needs to be resolved, and I'd need help from within the company. Thanks a lot in advance!