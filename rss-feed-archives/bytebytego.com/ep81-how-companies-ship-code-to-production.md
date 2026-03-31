This week’s system design refresher:

+   HTTP Status Codes Explained In 5 Minutes (Youtube video)
    
+   How do companies ship code to production?
    
+   What happens when you type a URL into a browser?
    
+   Top 3 API Gateway Use Cases
    
+   Writing Code that Runs on All Platforms
    
+   Docker 101: Streamlining App Deployment
    

## [Why You Need a Single Tool for Infrastructure Monitoring and APM (Sponsored)](https://bit.ly/NewRelic101423)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc34b6a8c-47c2-44ff-8c2b-ed44a32bbc23_1200x630.png)



If you want to build, deploy, and operate high-performing services, while reducing high tooling and engineering costs, this ebook is for you. Discover how to achieve application performance monitoring (APM) and infrastructure monitoring from a single observability platform that enables you to lessen revenue loss as a result of downtime, reduce tool sprawl, and remediate performance issues quickly to minimize customer impact.

[Read the ebook](https://bit.ly/NewRelic101423)

## **HTTP Status Codes Explained In 5 Minutes**

## How do companies ship code to production?

The diagram below illustrates the typical workflow.



![map](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbd63be9d-8457-4e1c-9aca-d185dba88732_1280x1664.gif "map")



Step 1: The process starts with a product owner creating user stories based on requirements.

Step 2: The dev team picks up the user stories from the backlog and puts them into a sprint for a two-week dev cycle.

Step 3: The developers commit source code into the code repository Git.

Step 4: A build is triggered in Jenkins. The source code must pass unit tests, code coverage threshold, and gates in SonarQube.

Step 5: Once the build is successful, the build is stored in artifactory. Then the build is deployed into the dev environment.

Step 6: There might be multiple dev teams working on different features. The features need to be tested independently, so they are deployed to QA1 and QA2.

Step 7: The QA team picks up the new QA environments and performs QA testing, regression testing, and performance testing.

Steps 8: Once the QA builds pass the QA team’s verification, they are deployed to the UAT environment.

Step 9: If the UAT testing is successful, the builds become release candidates and will be deployed to the production environment on schedule.

Step 10: SRE (Site Reliability Engineering) team is responsible for prod monitoring.

## Latest articles

If you’re not a subscriber, here’s what you missed this month.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc36c798c-e830-442b-8036-36280992428c_3000x3900.gif)



1.  [The Tech Promotion Algorithm: A Structured Guide to Moving Up](https://blog.bytebytego.com/p/the-tech-promotion-algorithm-a-structured)
    
2.  [A Crash Course in DNS](https://blog.bytebytego.com/p/a-crash-course-in-dns-domain-name)
    
3.  [A Crash Course in Redis](https://blog.bytebytego.com/p/a-crash-course-in-redis)
    
4.  [Why is Kafka so fast? How does it work?](https://blog.bytebytego.com/p/why-is-kafka-so-fast-how-does-it)
    
5.  [How to Choose a Message Queue? Kafka vs. RabbitMQ](https://blog.bytebytego.com/p/how-to-choose-a-message-queue-kafka)
    

To receive all the full articles and support ByteByteGo, consider subscribing:

## What happens when you type a URL into a browser?



![graphical user interface](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd10513d0-7467-4fc8-91f5-9ae5ff7ef342_1280x1664.gif "graphical user interface")



Let’s look at the process step by step.

Step 1: The user enters a URL (www. bytebytego. com) into the browser and hits Enter. The first thing we need to do is to translate the URL to an IP address. The mapping is usually stored in a cache, so the browser looks for the IP address in multiple layers of cache: the browser cache, OS cache, local cache, and ISP cache. If the browser couldn’t find the mapping in the cache, it will ask the DNS (Domain Name System) resolver to resolve it.

Step 2: If the IP address cannot be found at any of the caches, the browser goes to DNS servers to do a recursive DNS lookup until the IP address is found.

Step 3: Now that we have the IP address of the server, the browser sends an HTTP request to the server. For secure access of server resources, we should always use HTTPS. It first establishes a TCP connection with the server via TCP 3-way handshake. Then it sends the public key to the client. The client uses the public key to encrypt the session key and sends to the server. The server uses the private key to decrypt the session key. The client and server can now exchange encrypted data using the session key.

Step 4: The server processes the request and sends back the response. For a successful response, the status code is 200. There are 3 parts in the response: HTML, CSS and Javascript. The browser parses HTML and generates DOM tree. It also parses CSS and generates CSSOM tree. It then combines DOM tree and CSSOM tree to render tree. The browser renders the content and display to the user.

## Top 3 API Gateway Use Cases



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7069024b-80a7-4b00-89f2-3af05eaca270_1536x1536.gif "No alternative text description for this image")



API gateway sits between the clients and services, providing API communications between them.

1\. API gateway helps build an ecosystem.  
The users can leverage an API gateway to access a wider set of tools. The partners in the ecosystem collaborate with each other to provide better integrations for the users.

2\. API gateway builds API marketplace  
The API marketplace hosts fundamental functionalities for everyone. The developers and businesses can easily develop or innovate in this ecosystem and sell APIs on the marketplace.

3\. API gateway provides compatibility with multiple platforms  
When dealing with multiple platforms, an API gateway can help work across multiple complex architectures.

## Writing Code that Runs on All Platforms

Developing code that functions seamlessly across different platforms is a crucial skill for modern programmers.



![No alt text provided for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4f72252d-13d1-43eb-9813-def59a58a417_1280x1724.jpeg "No alt text provided for this image")



The need arises from the fact that users access software on a wide range of devices and operating systems. Achieving this universal compatibility can be complex due to differences in hardware, software environments, and user expectations.

Creating code that works on all platforms requires careful planning and understanding of the unique challenges presented by each platform.

Better planning and comprehension of cross-platform development not only streamline the process but also contribute to the long-term success of a software project.

It reduces redundancy, simplifies maintenance, ensures consistency, boosting satisfaction and market reach.

Here are key factors for cross-platform compatibility

Over to you: How have you tackled cross-platform compatibility challenges in your projects? Share your insights and experiences!

## Docker 101: Streamlining App Deployment

Fed up with the "it works on my machine" dilemma? Docker could be your salvation!



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0f9bb371-9922-4bdf-896a-ff4c3d26455e_1280x1664.jpeg "No alternative text description for this image")



Docker revolutionizes software development and deployment. Explore the essentials:

1\. Bundle Everything: Docker packs your app and its dependencies into a portable container – code, runtime, tools, libraries, and settings – a tidy, self-contained package.

2\. Virtual Isolation: Containers offer packaging and isolation. Run diverse apps with different settings on a single host without conflicts, thanks to Linux namespaces and cgroups.

3\. Not VMs: Unlike resource-heavy VMs, Docker containers share the host OS kernel, delivering speed and efficiency. No VM overhead, just rapid starts and easy management. ⚡

4\. Windows Compatibility: Docker, rooted in Linux, works on Windows too. Docker Desktop for Windows uses a Linux-based VM, enabling containerization for Windows apps.