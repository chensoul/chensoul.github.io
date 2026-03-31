This week's system design refresher:

+   Top 7 Most-Used Distributed System Patterns (Youtube video)
    
+   Amazon Prime Video Monitoring Service
    
+   RPC vs. RESTful
    
+   The cost of storage systems
    

## [Meet New Relic Grok, the World’s First Generative AI Observability Assistant](http://bit.ly/NewRelicGrokEarlyAccess) (Sponsored)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F199a4598-968c-40ca-839b-b7beb944268c_1200x630.png)



New Relic Grok makes it easy for you to get the insights you need without having to make sense of tons of telemetry data. Cut through the noise to get the right answers quickly and easily. New Relic Grok leverages OpenAI’s large language models (LLMs) so that any engineer can use plain language and a familiar chat interface to ask questions and get insights, without any prior observability experience. Observability is now as simple as asking New Relic Grok, “Why is my cart not working?” or “Instrument AWS.”

[Ready to grok? Request early access](https://bit.ly/NewRelicGrokEarlyAccess)

## Top 7 Most-Used Distributed System Patterns

+   Ambassador
    
+   Circuit Breaker
    
+   CQRS
    
+   Event Sourcing
    
+   Leader Election
    
+   Publisher/Subscriber
    
+   Sharding
    

Which additional patterns have we overlooked?

## Amazon Prime Video Monitoring Service

Why did Amazon Prime Video monitoring move **from serverless to monolithic**? How can it save 90% cost? 

The diagram below shows the architecture comparison before and after the migration. 



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0bb81839-6937-4969-922d-9a2328ad05fe_1404x1536.jpeg "diagram")



What is Amazon Prime Video Monitoring Service? 

Prime Video service needs to monitor the quality of thousands of live streams. The monitoring tool automatically analyzes the streams in real time and identifies quality issues like block corruption, video freeze, and sync problems. This is an important process for customer satisfaction. 

There are 3 steps: media converter, defect detector, and real-time notification. 

+   What is the problem with the old architecture? 
    
    The old architecture was based on Amazon Lambda, which was good for building services quickly. However, it was not cost-effective when running the architecture at a high scale. The two most expensive operations are: 
    
    1\. The orchestration workflow - AWS step functions charge users by state transitions and the orchestration performs multiple state transitions every second. 
    
    2\. Data passing between distributed components - the intermediate data is stored in Amazon S3 so that the next stage can download. The download can be costly when the volume is high. 
    
+   Monolithic architecture saves 90% cost 
    
    A monolithic architecture is designed to address the cost issues. There are still 3 components, but the media converter and defect detector are deployed in the same process, saving the cost of passing data over the network. Surprisingly, this approach to deployment architecture change led to 90% cost savings! 
    
    This is an interesting and unique case study because microservices have become a go-to and fashionable choice in the tech industry. It's good to see that we are having more discussions about evolving the architecture and having more honest discussions about its pros and cons. Decomposing components into distributed microservices comes with a cost. 
    
+   What did Amazon leaders say about this?   
    Amazon CTO Werner Vogels: “Building **evolvable software systems** is a strategy, not a religion. And revisiting your architectures with an open mind is a must.” 
    
    Ex Amazon VP Sustainability Adrian Cockcroft: “The Prime Video team had followed a path I call **Serverless First**…I don’t advocate **Serverless Only**”.
    

Over to you: Does microservice architecture solve an architecture problem or an organizational problem?

## How to choose between RPC and RESTful?



![table](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3e37b2de-4a82-45de-b0be-4893ed6a4f8f_1997x1536.jpeg "table")



Communication between different software systems can be established using either RPC (Remote Procedure Call) or RESTful (Representational State Transfer) protocols, which allow multiple systems to work together in distributed computing.

The two protocols differ mainly in their design philosophy. RPC enables calling remote procedures on a server as if they were local procedures, while RESTful applications are resource-based and interact with these resources via HTTP methods.

When choosing between RPC and RESTful, consider your application's needs. RPC might be a better fit if you require a more action-oriented approach with custom operations, while RESTful would be a better choice if you prefer a standardized, resource-based approach that utilizes HTTP methods.

Over to you: What are the best practices for versioning and ensuring backward compatibility of RPC and RESTful APIs?

## How much storage could one purchase with the price of a Tesla Model S?

There's a trade-off between the price of a storage system and its access latency. Naturally, one might wonder how much storage could be obtained if one is willing to sacrifice latency.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa57bbc73-8984-4aa3-af52-231eb2d75774_2048x1024.jpeg "No alternative text description for this image")



To make this calculation more intriguing, let's use the price of a Tesla Model S as a benchmark. Here are the relevant prices:

+   Tesla Model S: $87,490 per car
    
+   L1 cache: $7 per megabyte
    
+   L2 cache: $7 per megabyte
    
+   RAM: $70 for 32G
    
+   SSD: $35 for 128G
    
+   HDD: $350 for 12T
    

## **Join the ByteByteGo Talent Collective**

If you’re looking for a new gig, [join the collective](https://substack.com/redirect/cb4e0ec6-0c70-4789-babd-8bf0311fdb99?j=eyJ1IjoiMWxyMnJiIn0.3gL4cFwDHqFL_VcXxR7HzMwPYkuu_RpwPuz8o-oe3gw) for customized job offerings from selected companies. Public or anonymous options are available. Leave anytime.

If you’re **hiring**, [join the ByteByteGo Talent](https://substack.com/redirect/50aacc11-fd43-4ba7-a1ca-3f60151cdc8d?j=eyJ1IjoiMWxyMnJiIn0.3gL4cFwDHqFL_VcXxR7HzMwPYkuu_RpwPuz8o-oe3gw) Collective to start getting bi-monthly drops of world-class hand-curated engineers who are open to new opportunities.