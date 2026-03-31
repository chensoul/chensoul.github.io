This week’s system design refresher:

+   Open-sourcing over 100 byte-sized system design concepts with high-resolution diagrams
    
+   Best ways to test system functionality
    
+   Cloud Network Components Cheat Sheet
    
+   Explaining 5 unique ID generators in distributed systems
    

## [Organize your API work and collaborate more (Sponsored)](https://bit.ly/Postman_102123)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6675f4d7-a14d-494d-9403-bdb2026c212c_1600x840.png)



Postman workspaces give teams shared access to the tools they need to solve problems together. They are the go-to place for development teams to collaborate and move quickly while staying on the same page.

With workspaces, teams can:

+   Automatically notify other team members about changes to APIs as updates sync in real time.
    
+   Set up manual or automated workflows to support different stages of API development.
    
+   Enable faster onboarding for both internal and external partner developers
    
+   Create collaborative hubs for troubleshooting API calls and maintaining a log of common steps to follow.
    

[Learn more about workspaces](https://bit.ly/Postman_102123)

## Open-sourcing over 100 byte-sized system design concepts with high-resolution diagrams



![text](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc0987325-9558-4d58-ba54-46b202dbd938_2048x1152.jpeg "text")



Start exploring the repository here: [https://bit.ly/bytebytegoGitRepo](https://bit.ly/bytebytegoGitRepo)

## Best ways to test system functionality

Testing system functionality is a crucial step in software development and engineering processes.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd18e5226-8335-4455-909d-5a6ef98747a6_1280x1664.gif "No alternative text description for this image")



It ensures that a system or software application performs as expected, meets user requirements, and operates reliably.

Here we delve into the best ways:

1.  Unit Testing: Ensures individual code components work correctly in isolation.
    
2.  Integration Testing: Verifies that different system parts function seamlessly together.
    
3.  System Testing: Assesses the entire system's compliance with user requirements and performance.
    
4.  Load Testing: Tests a system's ability to handle high workloads and identifies performance issues.
    
5.  Error Testing: Evaluate how the software handles invalid inputs and error conditions.
    
6.  Test Automation: Automates test case execution for efficiency, repeatability, and error reduction.
    

Over to you: How do you approach testing system functionality in your software development or engineering projects?

## Latest articles

If you’re not a subscriber, here’s what you missed this month.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2af73815-fbad-4f16-ab35-551ae7383bb5_2334x3255.jpeg)



1.  [The 6 Most Impactful Ways Redis is Used in Production Systems](https://blog.bytebytego.com/p/the-6-most-impactful-ways-redis-is)
    
2.  [The Tech Promotion Algorithm: A Structured Guide to Moving Up](https://blog.bytebytego.com/p/the-tech-promotion-algorithm-a-structured)
    
3.  [A Crash Course in DNS](https://blog.bytebytego.com/p/a-crash-course-in-dns-domain-name)
    
4.  [A Crash Course in Redis](https://blog.bytebytego.com/p/a-crash-course-in-redis)
    
5.  [Why is Kafka so fast? How does it work?](https://blog.bytebytego.com/p/why-is-kafka-so-fast-how-does-it)
    

To receive all the full articles and support ByteByteGo, consider subscribing:

## Cloud Network Components Cheat Sheet

Network components form the backbone of cloud infrastructure, enabling connectivity, scalability, and functionality in cloud services.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1f52648d-a8b5-4121-b803-11d062ed38fb_1280x1561.jpeg "No alternative text description for this image")



These components include routers, load balancers, and firewalls, which ensure data flows efficiently and securely between servers and clients.

Additionally, Content Delivery Networks (CDNs) optimize content delivery by caching data at edge locations, reducing latency and improving user experience.

In essence, these network elements work together to create a robust and responsive cloud ecosystem that underpins modern digital services and applications.

This cheat sheet offers a concise yet comprehensive comparison of key network elements across the four major cloud providers.

Over to you: How did you tackle the complexity of configuring and managing these network components?

## Explaining 5 unique ID generators in distributed systems

The diagram below shows how they work. Each generator has its pros and cons.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4aaaf99b-4208-4172-82e4-08c8996b1693_3000x3900.png)



1.  UUID  
    A UUID has 128 bits. It is simple to generate and no need to call another service. However, it is not sequential and inefficient for database indexing. Additionally, UUID doesn’t guarantee global uniqueness. We need to be careful with ID conflicts (although the chances are slim.)
    
2.  Snowflake  
    Snowflake’s ID generation process has multiple components: timestamp, machine ID, and serial number. The first bit is unused to ensure positive IDs. This generator doesn’t need to talk to an ID generator via the network, so is fast and scalable.  
    Snowflake implementations vary. For example, data center ID can be added to the “MachineID” component to guarantee global uniqueness.
    
3.  DB auto-increment  
    Most database products offer auto-increment identity columns. Since this is supported in the database, we can leverage its transaction management to handle concurrent visits to the ID generator. This guarantees uniqueness in one table. However, this involves network communications and may expose sensitive business data to the outside. For example, if we use this as a user ID, our business competitors will have a rough idea of the total number of users registered on our website.
    
4.  DB segment  
    An alternative approach is to retrieve IDs from the database in batches and cache them in the ID servers, each ID server handling a segment of IDs. This greatly saves the I/O pressure on the database.
    
5.  Redis  
    We can also use Redis key-value pair to generate unique IDs. Redis stores data in memory, so this approach offers better performance than the database.
    

Over to you - What ID generator have you used?