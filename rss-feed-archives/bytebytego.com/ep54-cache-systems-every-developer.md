This week’s system design refresher:

+   Cache Systems Every Developer Should Know (Youtube video)
    
+   Serverless DB
    
+   TCP vs. UDP
    
+   Batch v.s. Stream Processing
    
+   Job openings
    

## Become a better tech leader in 10 mins a week (Sponsored)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0a1c7807-1823-4880-965a-1d19cb3a2839_1992x886.png)



Refactoring is a weekly newsletter about writing great software and working well together. Its articles are read every week by 30,000+ subscribers, including engineers and managers at companies like Google, Meta, and Amazon. 

Subscribe to:

+   Receive a **new essay** every Thursday with practical advice about your work.
    
+   Access a **curated library** of 130+ original essays and 250+ resources.
    
+   Join a **private community** of tech leaders, founders, and engineers.
    
+   Get **$50K+ discounts** on popular dev tools.
    

[Become a better tech leader today](https://bit.ly/Refactoring_408)

## Cache Systems Every Developer Should Know

## Top 10 Architecture Characteristics / Non-Functional Requirements with Cheatsheet



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa8cd0334-8287-4949-bf4a-187ae9b79a3a_4420x2692.png)



Did we miss anything? If yes, Please help to enrich this article by sharing your thoughts in the comments.

Written by [Love Sharma](https://www.linkedin.com/in/zonito/), our guest author. We're constantly seeking valuable content, so if you'd like to contribute to our platform or have any previously published content you'd like us to share, please feel free to drop us a message.

## What is Serverless DB

Are serverless databases the future? How do serverless databases differ from traditional cloud databases?

Amazon Aurora Serverless, depicted in the diagram below, is a configuration that is auto-scaling and available on-demand for Amazon Aurora.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F935c9849-d149-4aab-9f85-134b20558c1e_2742x2706.jpeg)



+   Aurora Serverless has the ability to scale capacity automatically up or down as per business requirements. For example, an eCommerce website preparing for a major promotion can scale the load to multiple databases within a few milliseconds. In comparison to regular cloud databases, which necessitate the provision and administration of database instances, Aurora Serverless can automatically start up and shut down.
    
+   By decoupling the compute layer from the data storage layer, Aurora Serverless is able to charge fees in a more precise manner. Additionally, Aurora Serverless can be a combination of provisioned and serverless instances, enabling existing provisioned databases to become a part of the serverless pool.
    

Over to you: Have you used a serverless DB? Does it save cost?

## TCP vs. UDP: 7 Differences You Should Know

1.  Connection-oriented vs. connectionless
    
    
    
    ![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F31bcd91d-d7a5-406d-b9f0-e79701b8c71e_1184x876.png)
    
    
    
2.  Three-way handshake vs. No handshake
    
    
    
    ![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd49cf186-9875-4a44-9432-1b284e5be594_1432x596.png)
    
    
    
3.  Header (20 bytes) vs. (8 bytes)
    
    
    
    ![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe2aacf4b-040e-4dd1-9001-b6c78fc6d4b2_1270x808.png)
    
    
    
4.  Point-to-point vs. Unicast & Multicast & Broadcast
    
    
    
    ![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7c4ec239-d6cb-4e6c-872b-3c33dafa50ec_1356x554.png)
    
    
    
5.  Congestion control vs. no congestion control
    
    
    
    ![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9ae5760e-6b98-4c54-8e97-fc97ba1735ee_1502x504.png)
    
    
    
6.  Reliable vs. lossy
    
    
    
    ![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbe874ea9-e0c0-4379-a881-9b23c823d048_1028x640.png)
    
    
    
7.  Flow control vs. no flow control 
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7865416c-ae8d-4e55-adef-5e682591ba63_1188x544.png)



## Batch v.s. Stream Processing

+   Batch Processing: We aggregate user click activities at end of the day.
    
+   Stream Processing: We detect potential frauds with the user click streams in real-time.
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fae36fe2f-493f-461b-96c7-daf0d79ca39f_2916x3366.jpeg)



Both processing models are used in big data processing. The major differences are:

1.  Input  
    Batch processing works on time-bounded data, which means there is an end to the input data.  
    Stream processing works on data streams, which doesn’t have a boundary.
    
2.  Timelineness  
    Batch processing is used in scenarios where the data doesn’t need to be processed in real-time.  
    Stream processing can produce processing results as the data is generated.
    
3.  Output  
    Batch processing usually generates one-off results, for example, reports.  
    Stream processing’s outputs can pipe into fraud decision-making engines, monitoring tools, analytics tools, or index/cache updaters.
    
4.  Fault tolerance  
    Batch processing tolerates faults better as the batch can be replayed on a fixed set of input data.  
    Stream processing is more challenging as the input data keeps flowing in. There are some approaches to solve this:
    
    a) Microbatching which splits the data stream into smaller blocks (used in Spark);  
    b) Checkpoint which generates a mark every few seconds to roll back to (used in Flink).
    

Over to you: Have you worked on stream processing systems?

## **Join the ByteByteGo Talent Collective**

If you’re looking for a new gig, [join the collective](https://substack.com/redirect/0dab990c-41ed-4eb4-8cfa-5685e2205287?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) for customized job offerings from selected companies. Public or anonymous options are available. Leave anytime.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc672b903-1a12-49fa-ba9d-5937833ace20_395x702.jpeg)



If you’re **hiring**, [join the ByteByteGo Talent](https://substack.com/redirect/caa61212-ac63-46c3-976e-756e90e0c2d8?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) Collective to start getting bi-monthly drops of world-class hand-curated engineers who are open to new opportunities.

## **Featured job openings**

**X1 Card**: [Engineering Leader - Card Platform](https://bytebytego.pallet.com/jobs/3d247fdf-26e8-4549-82e5-e3720ba7f79e) (United States, remote)