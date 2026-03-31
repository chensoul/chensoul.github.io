This week’s system design refresher:

+   Is Docker Still Relevant? (Youtube video)
    
+   Explaining 8 Popular Network Protocols in 1 Diagram
    
+   IBM MQ -> RabbitMQ -> Kafka ->Pulsar: How do message queue architectures evolve?
    
+   What is a database? What are some common types of databases?
    

## [Study: Performance Metrics Of The Best Startups, Enterprises & Mid-Size Engineering Orgs (Sponsored)](https://bit.ly/LinearB10072023)

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1878ee67-6e61-4e9d-a097-9338eac08157_1600x840.png)



*"Essential insights into how engineering teams continue to evolve” — Nathen Harvey, Head of Google's DORA team*

LinearB’s new 2023 [Software Engineering Benchmarks Report](https://bit.ly/LinearB10072023) is out! This analysis of 3.6 million pull requests from 2,000+ development teams across 64 countries explores benchmarks for additional critical engineering metrics and presents key findings based on organization size and location!

Here are a few insights from the study:

+   Startups and scale-ups deploy code 18% faster than enterprises.
    
+   Enterprises have an average deploy time 2x higher than startups and scaleups.
    
+   Europe has a 28% shorter deploy time than the rest of the world.
    

Grab your free copy right here 👇

[2023 Software Engineering Benchmarks](https://bit.ly/LinearB10072023)

## How does Docker Work? Is Docker still relevant?

Docker's architecture comprises three main components:

+   Docker Client  
    This is the interface through which users interact. It communicates with the Docker daemon.
    
+   Docker Host  
    Here, the Docker daemon listens for Docker API requests and manages various Docker objects, including images, containers, networks, and volumes.
    
+   Docker Registry  
    This is where Docker images are stored. Docker Hub, for instance, is a widely-used public registry.
    

## Explaining 8 Popular Network Protocols in 1 Diagram

Network protocols are standard methods of transferring data between two computers in a network.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6f9e43fa-84d5-4875-817c-c2e1af75d16e_1280x1664.gif "No alternative text description for this image")



1.  HTTP (HyperText Transfer Protocol)  
    HTTP is a protocol for fetching resources such as HTML documents. It is the foundation of any data exchange on the Web and it is a client-server protocol.
    
2.  HTTP/3  
    HTTP/3 is the next major revision of the HTTP. It runs on QUIC, a new transport protocol designed for mobile-heavy internet usage. It relies on UDP instead of TCP, which enables faster web page responsiveness. VR applications demand more bandwidth to render intricate details of a virtual scene and will likely benefit from migrating to HTTP/3 powered by QUIC.
    
3.  HTTPS (HyperText Transfer Protocol Secure)  
    HTTPS extends HTTP and uses encryption for secure communications.
    
4.  WebSocket  
    WebSocket is a protocol that provides full-duplex communications over TCP. Clients establish WebSockets to receive real-time updates from the back-end services. Unlike REST, which always “pulls” data, WebSocket enables data to be “pushed”. Applications, like online gaming, stock trading, and messaging apps leverage WebSocket for real-time communication.
    
5.  TCP (Transmission Control Protocol)  
    TCP is is designed to send packets across the internet and ensure the successful delivery of data and messages over networks. Many application-layer protocols build on top of TCP.
    
6.  UDP (User Datagram Protocol)  
    UDP sends packets directly to a target computer, without establishing a connection first. UDP is commonly used in time-sensitive communications where occasionally dropping packets is better than waiting. Voice and video traffic are often sent using this protocol.
    
7.  SMTP (Simple Mail Transfer Protocol)  
    SMTP is a standard protocol to transfer electronic mail from one user to another.
    
8.  FTP (File Transfer Protocol)  
    FTP is used to transfer computer files between client and server. It has separate connections for the control channel and data channel.
    

## [😘Kiss bugs goodbye with fully automated end-to-end test coverage (Sponsored)](https://bit.ly/QAWolf100723CTA)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F04fdc8b6-9d94-4c2e-8b09-0c151a5894c2_2000x1500.png)



[QA Wolf](https://bit.ly/QAWolf100723CTA) gets web apps to 80% automated end-to-end test coverage in just 4 months. They are a tech-enabled service that creates and maintains your test suite in open-source Playwright (no vendor lock-in, you own the code) and provides unlimited parallel test runs on their infrastructure. 

What's better is QA Wolf offers test coverage at a significantly lower cost than trying to build, run, and maintain it in-house. They have multiple case studies of customers saving at least $200k/year in QA engineering and infrastructure costs. [Schedule a demo](https://bit.ly/QAWolf100723CTA) to learn more.

PS: QA Wolf has a 4.8/5 🌟rating on G2 

[Learn more](https://bit.ly/QAWolf100723CTA)

## IBM MQ -> RabbitMQ -> Kafka ->Pulsar: How do message queue architectures evolve?



![graphical user interface](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1475ba84-8106-4d61-924e-6403cfdc1074_1280x1664.gif "graphical user interface")



+   IBM MQ
    
    IBM MQ was launched in 1993. It was originally called MQSeries and was renamed WebSphere MQ in 2002. It was renamed to IBM MQ in 2014. IBM MQ is a very successful product widely used in the financial sector. Its revenue still reached 1 billion dollars in 2020.
    
+   RabbitMQ  
    RabbitMQ architecture differs from IBM MQ and is more similar to Kafka concepts. The producer publishes a message to an exchange with a specified exchange type. It can be direct, topic, or fanout. The exchange then routes the message into the queues based on different message attributes and the exchange type. The consumers pick up the message accordingly.
    
+   Kafka  
    In early 2011, LinkedIn open sourced Kafka, which is a distributed event streaming platform. It was named after Franz Kafka. As the name suggested, Kafka is optimized for writing. It offers a high-throughput, low-latency platform for handling real-time data feeds. It provides a unified event log to enable event streaming and is widely used in internet companies.
    
    Kafka defines producer, broker, topic, partition, and consumer. Its simplicity and fault tolerance allow it to replace previous products like AMQP-based message queues.
    
+   Pulsar  
    Pulsar, developed originally by Yahoo, is an all-in-one messaging and streaming platform. Compared with Kafka, Pulsar incorporates many useful features from other products and supports a wide range of capabilities. Also, Pulsar architecture is more cloud-native, providing better support for cluster scaling and partition migration, etc.
    
    There are two layers in Pulsar architecture: the serving layer and the persistent layer. Pulsar natively supports tiered storage, where we can leverage cheaper object storage like AWS S3 to persist messages for a longer term.
    

Over to you: which message queues have you used?

## What is a database? What are some common types of databases?

First off, what's a database? Think of it as a digital playground where we organize and store loads of information in a structured manner. Now, let's shake things up and look at the main types of databases.



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F88ce693e-15bf-47a6-9d0b-0a17efafbb34_1280x1670.jpeg "diagram")



Relational DB: Imagine it's like organizing data in neat tables. Think of it as the well-behaved sibling, keeping everything in order.

OLAP DB: Online Analytical Processing (OLAP) is a technology optimized for reporting and analysis purposes.

NoSQL DBs: These rebels have their own cool club, saying "No" to traditional SQL ways. NoSQL databases come in four exciting flavors:

+   Graph DB: Think of social networks, where relationships between people matter most. It's like mapping who's friends with whom.
    
+   Key-value Store DB: It's like a treasure chest, with each item having its unique key. Finding what you need is a piece of cake.
    
+   Document DB: A document database is a kind of database that stores information in a format similar to JSON. It's different from traditional databases and is made for working with documents instead of tables.
    
+   Column DB: Imagine slicing and dicing your data like a chef prepping ingredients. It's efficient and speedy.
    

Over to you: So, the next time you hear about databases, remember, it's a wild world out there - from orderly tables to rebellious NoSQL variants! Which one is your favorite? Share your thoughts!