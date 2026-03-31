This week’s system design refresher:

+   API architectural styles
    
+   How Git commands work
    
+   How Levels.fyi scaled to millions of users
    
+   MVC, MVP, MVVM, MVVM-C, and VIPER architecture patterns
    
+   Backend burger
    

## How to use New Relic to achieve Kubernetes observability (Sponsored)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe276a63d-8059-48ec-a253-7a215a702838_1920x1080.jpeg)



You no longer need to manually instrument your applications, update your code, redeploy your apps, or navigate long organizational standardization processes. Monitor your Kubernetes clusters and workloads in minutes and debug your applications faster than ever.

Almost every software engineer has used Git before, but only a handful know how it works :)

[Learn more](https://bit.ly/CTA_NewRelic)

## What are the API architectural styles?

The diagram below shows the common API architectural styles in one picture.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faa5a976f-6264-4731-b214-210d5a8bd43b_2628x3513.png)



1.  **REST**  
    Proposed in 2000, REST is the most used style. It is often used between front-end clients and back-end services. It is compliant with 6 architectural constraints. The payload format can be JSON, XML, HTML, or plain text.
    
2.  **GraphQL**  
    GraphQL was proposed in 2015 by Meta. It provides a schema and type system, suitable for complex systems where the relationships between entities are graph-like. For example, in the diagram below, GraphQL can retrieve user and order information in one call, while in REST this needs multiple calls.
    
    GraphQL is not a replacement for REST. It can be built upon existing REST services.
    
3.  **Web socket**  
    Web socket is a protocol that provides full-duplex communications over TCP. The clients establish web sockets to receive real-time updates from the back-end services. Unlike REST, which always “pulls” data, web socket enables data to be “pushed”.
    
4.  **Webhook**  
    Webhooks are usually used by third-party asynchronous API calls. In the diagram below, for example, we use Stripe or Paypal for payment channels and register a webhook for payment results. When a third-party payment service is done, it notifies the payment service if the payment is successful or failed. Webhook calls are usually part of the system’s state machine.
    
5.  **gRPC**  
    Released in 2016, gRPC is used for communications among microservices. gRPC library handles encoding/decoding and data transmission.
    
6.  **SOAP**  
    SOAP stands for Simple Object Access Protocol. Its payload is XML only, suitable for communications between internal systems.
    

Over to you: What API architectural styles have you used?

## Latest articles

Here are the latest articles you may have missed:

+   [From 0 to Millions: A Guide to Scaling Your App - Part 1](https://blog.bytebytego.com/p/from-0-to-millions-a-guide-to-scaling)
    
+   [From 0 to Millions: A Guide to Scaling Your App - Part 2](https://blog.bytebytego.com/p/from-0-to-millions-a-guide-to-scaling-7b4)
    
+   [From 0 to Millions: A Guide to Scaling Your App - Part 3](https://blog.bytebytego.com/p/from-0-to-millions-a-guide-to-scaling-b53)
    

To receive all the full articles and support ByteByteGo, consider subscribing if you haven’t already:

## How Git commands work

Almost every software engineer has used Git before, but only a handful know how it works.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb2b99e6e-194e-4f24-9457-0aa0daf0bd28_1999x1977.png)



To begin with, it's essential to identify where our code is stored. The common assumption is that there are only two locations - one on a remote server like Github and the other on our local machine. However, this isn't entirely accurate. Git maintains three local storages on our machine, which means that our code can be found in four places:

+   Working directory: where we edit files
    
+   Staging area: a temporary location where files are kept for the next commit
    
+   Local repository: contains the code that has been committed
    
+   Remote repository: the remote server that stores the code
    

Most Git commands primarily move files between these four locations.

Over to you: Do you know which storage location the "git tag" command operates on? This command can add annotations to a commit.

## How Levels.fyi scaled to millions of users

I read something unbelievable today: Levels.fyi scaled to millions of users using **Google Sheets as a backend!**



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd783bc0e-b6ac-4b2d-967c-b746c2a32009_3135x2955.jpeg)



They started off on Google Forms and Sheets, which helped them reach millions of monthly active users before switching to a proper backend.

To be fair, they do use serverless computing, but using Google Sheets as the database is an interesting choice.

Why do they use Google Sheets as a backend? Using their own words: "It seems like a pretty counterintuitive idea for a site with our traffic volume to not have a backend or any fancy infrastructure, but our philosophy to building products has always been, start simple and iterate. This allows us to move fast and focus on what’s important".

What are your thoughts? If you are interested in learning more, read the original article by [clicking here](https://www.levels.fyi/blog/scaling-to-millions-with-google-sheets.html).

## What distinguishes MVC, MVP, MVVM, MVVM-C, and VIPER architecture patterns from each other?

These architecture patterns are among the most commonly used in app development, whether on iOS or Android platforms. Developers have introduced them to overcome the limitations of earlier patterns. So, how do they differ?



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F61af5cdf-2a56-4ae8-ad09-eb703c26989d_1280x1755.jpeg "No alternative text description for this image")



+   MVC, the oldest pattern, dates back almost 50 years
    
+   Every pattern has a "view" (V) responsible for displaying content and receiving user input
    
+   Most patterns include a "model" (M) to manage business data
    
+   "Controller," "presenter," and "view-model" are translators that mediate between the view and the model ("entity" in the VIPER pattern)
    
+   These translators can be quite complex to write, so various patterns have been proposed to make them more maintainable
    

Over to you: keep in mind that this is not an exhaustive list of architecture patterns. Other notable patterns include Flux and Redux. How do they compare to the ones mentioned here?

## Backend burger :)

Great diagram by [Brij Kishore Pandey](https://www.linkedin.com/in/ACoAAAKDuMsBugjGZwz0pJy43LJ-6bVwc0gm9xQ)



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8713114e-765b-4d8c-bd16-edd5e9465380_800x1000.jpeg "diagram")



## **Featured job openings**

**X1 Card**: [Software Engineer, Back End](https://bytebytego.pallet.com/list/bytebytego/jobs/03635432-4f13-484f-98c6-d031f9d0eca1) (United States)  
**X1 Card**: [Head of Infrastructure and Risk](https://bytebytego.pallet.com/jobs/62661d14-94da-4ed7-94cf-193396203c81) (United States)