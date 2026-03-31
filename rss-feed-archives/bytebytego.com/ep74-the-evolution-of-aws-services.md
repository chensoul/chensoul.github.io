This week’s system design refresher:

+   Algorithms You Should Know Before You Take System Design Interviews (Youtube video)
    
+   AWS Services Evolution
    
+   How does Git Work?
    
+   IaaS, PaaS, Cloud Native. How do we get here?
    
+   Is the cloud really free or inexpensive?
    

## [Inside The Top 10% Of Engineering Organizations (Sponsored)](https://bit.ly/LinearB-082623)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F63b3ded0-c971-4e23-9535-ac6c9bc8cd65_1200x1200.png)



Fact: You can’t become better at anything unless you understand what getting better would actually look like. This is especially true in the case of engineering teams.

Following an analysis of 2,000 dev teams and over 4.5 million code branches, we finally know what performance metrics look like in the world’s best engineering orgs.

In this exclusive report, engineers will finally get visibility into what the top 10% of dev teams are hitting in terms of crucial metrics – like cycle time, deployment frequency, rework rate, and more!

[Read the Report](https://bit.ly/LinearB-082623)

## Algorithms You Should Know Before You Take System Design Interviews

## AWS Services Evolution

How did AWS grow from just a few services in 2006 to over 200 fully-featured services? Let's take a look.

Since 2006, it has become a cloud computing leader, offering foundational infrastructure, platforms, and advanced capabilities like serverless computing and AI.

This expansion empowered innovation, allowing complex applications without extensive hardware management. AWS also explored edge and quantum computing, staying at tech's forefront.

This evolution mirrors cloud computing's shift from niche to essential, benefiting global businesses with efficiency and scalability.

Happy to present the curated list of AWS services introduced over the years below.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb384f75-2fbb-4c5b-9d5e-b97557d02f33_1572x1894.png)

Note:

+   The announcement or preview year differs from the public release year for certain services. In these cases, we've noted the service under the release year
    
+   Unreleased services noted in announcement years
    

Over to you: Are you excited about all the new services, or do you find it overwhelming?

## Latest articles

If you’re not a subscriber, here’s what you missed this month.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faefd8279-2ad6-4357-be3a-b59c27242c27_1503x1600.png)



1.  [How to Choose a Message Queue? Kafka vs. RabbitMQ](https://blog.bytebytego.com/p/how-to-choose-a-message-queue-kafka)
    
2.  [Why Do We Need a Message Queue?](https://blog.bytebytego.com/p/why-do-we-need-a-message-queue)
    
3.  [Database Indexing Strategies - Part 2](https://blog.bytebytego.com/p/database-indexing-strategies-part)
    
4.  ["I Was Under Leveled!" — Avoiding the Tragedy of Making Only $500k a Year](https://blog.bytebytego.com/p/i-was-under-leveled-avoiding-the)
    
5.  [Network Protocols behind Server Push, Online Gaming, and Emails](https://blog.bytebytego.com/p/network-protocols-behind-server-push)
    

To receive all the full articles and support ByteByteGo, consider subscribing:

## How does Git Work?

The diagram below shows the Git workflow.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F91e6866a-0838-4df0-9005-af6caaed68d2_1280x1939.jpeg)



Git is a distributed version control system.

Every developer maintains a local copy of the main repository and edits and commits to the local copy.

The commit is very fast because the operation doesn’t interact with the remote repository.

If the remote repository crashes, the files can be recovered from the local repositories.

Over to you: Which Git command do you use to resolve conflicting changes?

## IaaS, PaaS, Cloud Native… How do we get here?

The diagram below shows two decades of cloud evolution.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcf026701-b753-46ec-bbc6-6d74eff5ac10_1587x1536.jpeg)



2001 - VMWare - Virtualization via hypervisor  
2006 - AWS - IaaS (Infrastructure as a Service)  
2009 - Heroku - PaaS (Platform as a Service)  
2010 - OpenStack - Open-source IaaS  
2011 - CloudFoundry - Open-source PaaS  
2013 - Docker - Containers  
2015 - CNCF (Cloud Native Computing Foundation) - Cloud Native

+   Over to you: Which ones have you used?
    

## Is the cloud really free or inexpensive?

While it may be inexpensive or even free to get started, the complexity often leads to hidden costs, resulting in large cloud bills.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5dede035-2946-4da2-9860-db24a662512c_1353x1536.jpeg)



The purpose of this post is not to discourage using the cloud. I’m a big fan of the cloud. I simply want to raise awareness about this issue, as it's one of the critical topics that isn't often discussed.

While AWS is used as an example, similar cost structures apply to other cloud providers.

1.  Free Tier Ambiguity: AWS offers three different types of free offerings for common services. However, services not included in the free tier can charge you. Even for services that do provide free resources, there's often a limit. Exceeding that limit can result in higher costs than anticipated.
    
2.  Elastic IP Addresses: AWS allows up to five Elastic IP addresses. Exceeding this limit incurs a small hourly rate, which varies depending on the region. This is a recurring charge.
    
3.  Load Balancers: They are billed hourly, even if not actively used. Furthermore, you'll face additional charges if data is transferred in and out of the load balancer.
    
4.  Elastic Block Storage (EBS) Charges: EBS is billed on a GB-per-month basis. You will be charged for attached and unattached EBS volumes, even if they're not actively used.
    
5.  EBS Snapshots: Deleting an EBS volume does not automatically remove the associated snapshots. Orphaned EBS snapshots will still appear on your bill.
    
6.  S3 Access Charges: While the pricing for S3 storage is generally reasonable, the costs associated with accessing stored objects, such as GET and LIST requests, can sometimes exceed the storage costs.
    
7.  S3 Partial Uploads: If you have an unsuccessful multipart upload in S3, you will still be billed for the successfully uploaded parts. It's essential to clean these up to avoid unnecessary costs.
    
8.  Data Transfer Costs: Transferring data to AWS, for instance, from a data center, is free. However, transferring data out of AWS can be significantly more expensive.
    

Over to you: Have you ever been surprised by an unexpected cloud bill? Share your experiences with us!