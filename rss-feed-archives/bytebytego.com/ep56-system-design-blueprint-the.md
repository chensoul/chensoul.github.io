This week’s system design refresher:

+   API Architecture Styles
    
+   System Design Blueprint: The Ultimate Guide
    
+   What companies think A.I. looks like
    
+   Amazon's innovative build system
    
+   McDonald’s event-driven architecture
    
+   Job openings
    

## How many API architecture styles do you know?



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F71ac5067-71b7-40e6-a5e8-8afa2e561aa3_1242x996.jpeg)



Architecture styles define how different components of an application programming interface (API) interact with one another. As a result, they ensure efficiency, reliability, and ease of integration with other systems by providing a standard approach to designing and building APIs. Here are the most used styles:

+   SOAP:  
    Mature, comprehensive, XML-based  
    Best for enterprise applications
    
+   RESTful:  
    Popular, easy-to-implement, HTTP methods  
    Ideal for web services
    
+   GraphQL:  
    Query language, request specific data  
    Reduces network overhead, faster responses
    
+   gRPC:  
    Modern, high-performance, Protocol Buffers  
    Suitable for microservices architectures
    
+   WebSocket:  
    Real-time, bidirectional, persistent connections  
    Perfect for low-latency data exchange
    
+   Webhook:  
    Event-driven, HTTP callbacks, asynchronous  
    Notifies systems when events occur
    

Over to you: Are there any other famous styles we missed?

## System Design Blueprint: The Ultimate Guide

We've created a template to tackle various system design problems in interviews.



![Image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F25d7ba1c-b55d-4307-baee-03f05c376f4b_3888x4096.jpeg "Image")



Thanks, [Love Sharma](https://www.linkedin.com/in/zonito/), for putting it together.

Hope this checklist is useful to guide your discussions during the interview process.

This briefly touches on the following discussion points:

+   Load Balancing
    
+   API Gateway
    
+   Communication Protocols
    
+   Content Delivery Network (CDN)
    
+   Database
    
+   Cache
    
+   Message Queue
    
+   Unique ID Generation
    
+   Scalability
    
+   Availability
    
+   Performance
    
+   Security
    
+   Fault Tolerance and Resilience
    
+   And more
    

## What companies think A.I. looks like

True or false? And what is missing?



![Image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faa295b3d-997e-44b4-b03b-9cbb8e3f2222_952x874.jpeg "Image")



Image credit: Andy Scherpenberg

## Discover Amazon's innovative build system - Brazil.

Amazon's ownership model requires each team to manage its own repositories, which allows for more rapid innovation. Amazon has created a unique build system, known as Brazil, to enhance productivity and empower Amazon’s micro-repo driven collaboration. This system is certainly worth examining!



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9a85023b-cd94-4bc0-a107-e34382a6868b_3182x4631.jpeg)



With Brazil, developers can focus on developing the code and creating a simple-to-understand build configuration file. The build system will then process the output artifact repeatedly and consistently. The build config minimizes the build requirement, including language, versioning, dependencies, major versions, and lastly, how to resolve version conflicts.

For local builds, the Brazil build tool interprets the build configuration as a Directed Acyclic Graph (DAG), retrieves packages from the myservice’s private space (VersionSet) called myservice-cpp-version-set, generates the language-specific build configuration, and employs the specific build tool to produce the output artifact.

A version set is a collection of package versions that offers a private space for the package and its dependencies. When a new package dependency is introduced, it must also be merged into this private space. There is a default version set called "live," which serves as a public space where anyone can publish any version.

Remotely, the package builder service provides an intuitive experience by selecting a version set and building targets. This service supports Amazon Linux on x86, x64, and ARM. Builds can be initiated manually or automatically upon a new commit to the master branch. The package builder guarantees build consistency and reproducibility, with each build process being snapshotted and the output artifact versioned.

Over to you - which type of build system did you use?

## McDonald’s event-driven architecture

Think you know everything about McDonald's? What about its event-driven architecture?



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d67dc29-8e53-4a5f-b5ea-090f610db1f5_1400x1826.png)



McDonald's standardizes events using the following components:

+   An event registry to define a standardized schema.
    
+   Custom software development kits (SDKs) to process events and handle errors.
    
+   An event gateway that performs identity authentication and authorization.
    
+   Utilities and tools to fix events, keep the cluster healthy, and perform administrative tasks.
    

To scale event processing, McDonald uses a regional architecture that provides global availability based on AWS. Within a region, producers shard events by domains, and each domain is processed by an MSK cluster. The cluster auto-scales based on MSK metrics (e.g., CPU usage), and the auto-scale workflow is based on step-functions and re-assignment tasks.

Reference: Behind the scenes: [McDonald’s event-driven architecture](https://medium.com/mcdonalds-technical-blog/behind-the-scenes-mcdonalds-event-driven-architecture-51a6542c0d86)

## **Join the ByteByteGo Talent Collective**

If you’re looking for a new gig, [join the collective](https://substack.com/redirect/79188cab-63a0-488e-8fd1-f38f237dcea7?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) for customized job offerings from selected companies. Public or anonymous options are available. Leave anytime.

If you’re **hiring**, [join the ByteByteGo Talent](https://substack.com/redirect/00076ea6-f52f-413c-a1a4-b7e3626427e1?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) Collective to start getting bi-monthly drops of world-class hand-curated engineers who are open to new opportunities.

## **Featured job openings**

**X1 Card**: [Engineering Leader - Card Platform](https://substack.com/redirect/91bb2527-b512-464d-9b69-cd0860fbcaf0?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) (United States, remote)

**X1 Card**: [Software Engineer, Back End, All Levels](https://bytebytego.pallet.com/jobs/03635432-4f13-484f-98c6-d031f9d0eca1) (United States, remote)

**(catch) Health**: [Senior Frontend Engineer, React + Typescript](https://bytebytego.pallet.com/jobs/bbaf8e01-b47a-4766-a189-e10859634249) (United States, remote)