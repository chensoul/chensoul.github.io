This week’s system design refresher:

+   Amazon Prime Video Ditches AWS Serverless (Youtube video)
    
+   The journey of a Slack Message
    
+   How GraphQL works in the real world
    
+   Different cloud services
    
+   Bytebytego Collective
    

## [Thrive in any job market with Interview Kickstart (Sponsored)](https://bit.ly/InterviewKickstart0527)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e1e08db-1e12-407a-8fbe-dcb93a69d16f_1200x628.jpeg)



Check your favorite jobs board today - top tech companies are ALWAYs making critical hires.

Layoffs or not, interview preparedness will help you thrive. Get ahead of the curve with **Interview Kickstart:**

+   They've trained **15000+ SDEs, EMs, TPMs, and Analysts** to ace tech interviews
    
+   IK Alumni consistently land jobs at Amazon, Google, and top-tier companies (**avg. salary hike: 66.5%**)
    
+   What sets them apart? Courses are **taught by real Hiring managers** from top-tier companies like Google, Microsoft & Amazon
    

Join their next interview prep webinar (FREE) and get a complimentary course on **Sorting Algorithms (15 hrs)** by **Omkar Deshpande** \- Head of Curriculum @IK (**Stanford Ph.D.**)

[<<Register For Free Webinar>>](https://bit.ly/InterviewKickstart0527)

## Amazon Prime Video ditches AWS Serverless, saves 90%

Why did Amazon Prime Video monitoring move from serverless to monolithic? How can it save 90% cost?

In this video, we will talk about:

+   What is Amazon Prime Video Monitoring Service
    
+   What is the problem with the old serverless architecture
    
+   How the monolithic architecture saves 90% cost
    
+   What did Amazon leaders say about this
    

## What is the journey of a Slack message?

In a recent technical article, Slack explains how its real-time messaging framework works. Here is my short summary:



![graphical user interface, diagram, application, Teams](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F37b0c5a4-8d3a-4cac-8c39-6a5407d51952_1528x1536.jpeg "graphical user interface, diagram, application, Teams")



+   Because there are too many channels, the Channel Server (CS) uses consistent hashing to allocate millions of channels to many channel servers.
    
+   Slack messages are delivered through WebApp and Admin Server to the correct Channel Server.
    
+   Through Gate Server and Envoy (a proxy), the Channel Server will push messages to message receivers.
    
+   Message receivers use WebSocket, which is a bi-directional messaging mechanism, so they are able to receive updates in real-time.
    

A Slack message travels through five important servers:

+   WebApp: define the API that a Slack client could use
    
+   Admin Server (AS): find the correct Channel Server using channel ID
    
+   Channel Server (CS): maintain the history of message channel
    
+   Gateway Server (GS): deployed in each geographic region. Maintain WebSocket channel subscription
    
+   Envoy: service proxy for cloud-native applications
    

Over to you: The Channel Servers could go down. Since they use consistent hashing, how might they recover?

## How does GraphQL work in the real world?

The diagram below shows how LinkedIn adopts GraphQL.



![diagram, schematic](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F38e73433-407b-4028-9c72-43beba5d7122_1280x1550.jpeg "diagram, schematic")



The overall workflow after adopting GraphQL has 3 parts:

+   Part 1 - Edit and Test a Query  
    Steps 1-2: The client-side developer develops a query and tests with backend services.
    
+   Part 2 - Register a Query  
    Steps 3-4: The client-side developer commits the query and publishes the query to the query registry.
    
+   Part 3 - Use in Production  
    Step 5: The query is released together with the client code.
    
    Steps 6-7: The routing metadata is included with each registered query. The metadata is used at the traffic routing tier to route the incoming requests to the correct service cluster.
    
    Step 8: The registered queries are cached at service runtime.
    
    Step 9: The sample query goes to the identity service first to retrieve members and then goes to the organization service to retrieve company information.
    
+   LinkedIn doesn’t deploy a GraphQL gateway for two reasons:  
    1\. Prevent an additional network hop  
    2\. Avoid single point of failure
    

Over to you: How are GraphQL queries managed in your project?

## A nice cheat sheet of different cloud services



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fab6e398b-2c0a-40d3-bfeb-a3a3f851d4db_800x1064.jpeg "No alternative text description for this image")



## **Join the ByteByteGo Talent Collective**

If you’re looking for a new gig, [join the collective](https://substack.com/redirect/b52c65ce-8fa0-4196-a150-42c2dfb80310?j=eyJ1IjoiMWxyMnJiIn0.3gL4cFwDHqFL_VcXxR7HzMwPYkuu_RpwPuz8o-oe3gw) for customized job offerings from selected companies. Public or anonymous options are available. Leave anytime.

If you’re **hiring**, [join the ByteByteGo Talent](https://substack.com/redirect/92de99d5-faba-4946-9785-4055ab70fc91?j=eyJ1IjoiMWxyMnJiIn0.3gL4cFwDHqFL_VcXxR7HzMwPYkuu_RpwPuz8o-oe3gw) Collective to start getting bi-monthly drops of world-class hand-curated engineers who are open to new opportunities.