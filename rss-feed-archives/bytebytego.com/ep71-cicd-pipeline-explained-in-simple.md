This week’s system design refresher:

+   Why Google and Meta Put Billion Lines of Code In 1 Repository? (Youtube video)
    
+   CI/CD Pipeline Explained in Simple Terms
    
+   What does API gateway do?
    
+   Docker vs. Kubernetes. Which one should we use?
    
+   Cloud Native Anti Patterns
    

## [QA Wolf gets you to 80% automated test coverage in 4 months (Sponsored)](https://bit.ly/QAWolf_070823)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb35a7507-f4ea-4788-be8a-f9a066ee4173_1000x750.png)

](https://bit.ly/QAWolf_070823)

Manually end-to-end testing? Here's why you should switch to automation:

1.  Test all your user flows in 3 minutes
    
2.  Freedom to run your test suite whenever you want
    
3.  Increased confidence in releases
    
4.  Time to focus on other priorities
    

The list goes on...

So why wouldn't you? Time and resources. In-house teams typically take 2 years to reach high coverage. And you need at least a few automation engineers to build, run, and maintain a test suite.

Not anymore.

[QA Wolf](https://bit.ly/QAWolf_070823) offers a cost-effective approach to getting 80% test coverage in just 4 months — even for the most complex web apps.

And, they include unlimited parallel runs on their testing infrastructure + 24-hour maintenance and triage. [Schedule a demo](https://bit.ly/QAWolf_070823) to learn more.

PS: QA Wolf has a 4.8/5 ⭐️ rating on G2 - reviewed by companies with 51-1000+ employees.

[Learn more](https://bit.ly/QAWolf_070823)

## **Why Google and Meta Put Billion Lines of Code In 1 Repository?**

## CI/CD Pipeline Explained in Simple Terms



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa0392cd2-a9b4-4c12-8c12-5250127d7df2_1280x1679.jpeg "diagram")



Section 1 - SDLC with CI/CD  
The software development life cycle (SDLC) consists of several key stages: development, testing, deployment, and maintenance. CI/CD automates and integrates these stages to enable faster, more reliable releases.  
When code is pushed to a git repository, it triggers an automated build and test process. End-to-end (e2e) test cases are run to validate the code. If tests pass, the code can be automatically deployed to staging/production. If issues are found, the code is sent back to development for bug fixing. This automation provides fast feedback to developers and reduces risk of bugs in production.

Section 2 - Difference between CI and CD  
Continuous Integration (CI) automates the build, test, and merge process. It runs tests whenever code is committed to detect integration issues early. This encourages frequent code commits and rapid feedback.

Continuous Delivery (CD) automates release processes like infrastructure changes and deployment. It ensures software can be released reliably at any time through automated workflows. CD may also automate the manual testing and approval steps required before production deployment.

Section 3 - CI/CD Pipeline  
A typical CI/CD pipeline has several connected stages:  
\- Developer commits code changes to source control  
\- CI server detects changes and triggers build  
\- Code is compiled, tested (unit, integration tests)  
\- Test results reported to developer  
\- On success, artifacts are deployed to staging environments  
\- Further testing may be done on staging before release  
\- CD system deploys approved changes to production

## Latest articles

If you’re not a subscriber, here’s what you missed this month.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa14c5eaf-ee53-4c8c-8356-9b76b1160732_1484x1142.png)



1.  ["I Was Under Leveled!" — Avoiding the Tragedy of Making Only $500k a Year](https://blog.bytebytego.com/p/i-was-under-leveled-avoiding-the)
    
2.  [Network Protocols behind Server Push, Online Gaming, and Emails](https://blog.bytebytego.com/p/network-protocols-behind-server-push)
    
3.  [The Foundation of REST API: HTTP](https://blog.bytebytego.com/p/the-foundation-of-rest-api-http)
    
4.  [Database Indexing Strategies](https://blog.bytebytego.com/p/database-indexing-strategies)
    
5.  [Network Protocols Run the Internet](https://blog.bytebytego.com/p/network-protocols-run-the-internet)
    

To receive all the full articles and support ByteByteGo, consider subscribing:

## What does API gateway do?

The diagram below shows the detail.



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8a050042-0e44-4962-b3f2-20c45a2bb227_1280x1893.jpeg "diagram")



Step 1 - The client sends an HTTP request to the API gateway.

Step 2 - The API gateway parses and validates the attributes in the HTTP request.

Step 3 - The API gateway performs allow-list/deny-list checks.

Step 4 - The API gateway talks to an identity provider for authentication and authorization.

Step 5 - The rate limiting rules are applied to the request. If it is over the limit, the request is rejected.

Steps 6 and 7 - Now that the request has passed basic checks, the API gateway finds the relevant service to route to by path matching.

Step 8 - The API gateway transforms the request into the appropriate protocol and sends it to backend microservices.

Steps 9-12: The API gateway can handle errors properly, and deals with faults if the error takes a longer time to recover (circuit break). It can also leverage ELK (Elastic-Logstash-Kibana) stack for logging and monitoring. We sometimes cache data in the API gateway.

Over to you:

1.  What’s the difference between a load balancer and an API gateway?
    
2.  Do we need to use different API gateways for PC, mobile and browser separately?
    

## Docker vs. Kubernetes. Which one should we use?



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F66c0c531-87a0-4314-bf69-9ce7e5f659b5_1449x1074.png)



What is Docker ?  
Docker is an open-source platform that allows you to package, distribute, and run applications in isolated containers. It focuses on containerization, providing lightweight environments that encapsulate applications and their dependencies.

What is Kubernetes ?  
Kubernetes, often referred to as K8s, is an open-source container orchestration platform. It provides a framework for automating the deployment, scaling, and management of containerized applications across a cluster of nodes.

How are both different from each other ?  
Docker: Docker operates at the individual container level on a single operating system host.

You must manually manage each host and setting up networks, security policies, and storage for multiple related containers can be complex.

Kubernetes: Kubernetes operates at the cluster level. It manages multiple containerized applications across multiple hosts, providing automation for tasks like load balancing, scaling, and ensuring the desired state of applications.

In short, Docker focuses on containerization and running containers on individual hosts, while Kubernetes specializes in managing and orchestrating containers at scale across a cluster of hosts.

Over to you: What challenges prompted you to switch from Docker to Kubernetes for managing containerized applications?

Guest post by [Govardhana Miriyala Kannaiah](https://www.linkedin.com/in/govardhana-miriyala-kannaiah/).

## Cloud Native Anti Patterns

By being aware of these anti-patterns and following cloud-native best practices, you can design, build, and operate more robust, scalable, and cost-efficient cloud-native applications.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F83f73cd4-5abb-481c-866e-e02c544acf75_1280x1756.jpeg "No alternative text description for this image")



1.  Monolithic Architecture:  
    One large, tightly coupled application running on the cloud, hindering scalability and agility
    
2.  Ignoring Cost Optimization:  
    Cloud services can be expensive, and not optimizing costs can result in budget overruns
    
3.  Mutable Infrastructure:  
    \- Infrastructure components are to be treated as disposable and are never modified in place  
    \- Failing to embrace this approach can lead to configuration drift, increased maintenance, and decreased reliability
    
4.  Inefficient DB Access Patterns:  
    Use of overly complex queries or lacking database indexing, can lead to performance degradation and database bottlenecks
    
5.  Large Containers or Bloated Images:  
    Creating large containers or using bloated images can increase deployment times, consume more resources, and slow down application scaling
    
6.  Ignoring CI/CD Pipelines:  
    Deployments become manual and error-prone, impeding the speed and frequency of software releases
    
7.  Shared Resources Dependency:  
    Applications relying on shared resources like databases can create contention and bottlenecks, affecting overall performance
    
8.  Using Too Many Cloud Services Without a Strategy:  
    While cloud providers offer a vast array of services, using too many of them without a clear strategy can create complexity and make it harder to manage the application.
    
9.  Stateful Components:  
    Relying on persistent state in applications can introduce complexity, hinder scalability, and limit fault tolerance
    

Over to you:  
What anti-patterns have you faced in your cloud-native journey? How did you conquer them?