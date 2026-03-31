In this newsletter, we’ll cover the following topics:

+   Algorithms you should know before taking System Design Interviews
    
+   How to store passwords safely in the database? (YouTube video)
    
+   How do push notifications work?
    
+   Topics for next week
    

## Algorithms you should know before taking System Design Interviews

What are some of the algorithms you should know before taking system design interviews?

I put together a list and explained why they are important. Those algorithms are not only useful for interviews but good to understand for any software engineer. 


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2b755d45-8a5d-45c7-8169-74b7394e32ad_3986x7990.jpeg)


One thing to keep in mind is that understanding “how those algorithms are used in real-world systems” is generally more important than the implementation details in a system design interview.

What do the stars mean in the diagram?  
It’s very difficult to rank algorithms by importance objectively. I’m open to suggestions and making adjustments. 

Five-star: Very important. Try to understand how it works and why.

Three-star: Important to some extent. You may not need to know the implementation details.

One-star: Advanced. Good to know for senior candidates.

Over to you: did I miss anything important on the list? Which ones do you know and which you don’t?

## How to store passwords safely in the database? (YouTube video)

Our YouTube video:

## How are notifications pushed to our phones or PCs?

A messaging solution (Firebase) can be used to support the notification push.  
   
The diagram below shows how Firebase Cloud Messaging (FCM) works.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F913af14e-139e-499e-9754-c4bca74a8eb6_3663x2883.jpeg)


  
FCM is a cross-platform messaging solution that can compose, send, queue, and route notifications reliably. It provides a unified API between message senders (app servers) and receivers (client apps). The app developer can use this solution to drive user retention.   
   
Steps 1 - 2: When the client app starts for the first time, the client app sends credentials to FCM, including Sender ID, API Key, and App ID. FCM generates Registration Token for the client app instance (so the Registration Token is also called Instance ID). This token must be included in the notifications.  
   
Step 3: The client app sends the Registration Token to the app server. The app server caches the token for subsequent communications. Over time, the app server has too many tokens to maintain, so the recommended practice is to store the token with timestamps and to remove stale tokens from time to time.   
   
Step 4: There are two ways to send messages. One is to compose messages directly in the console GUI (Step 4.1,) and the other is to send the messages from the app server (Step 4.2.) We can use the Firebase Admin SDK or HTTP for the latter.  
   
Step 5: FCM receives the messages, and queues the messages in the storage if the devices are not online.   
   
Step 6: FCM forwards the messages to platform-level transport. This transport layer handles platform-specific configurations.  
   
Step 7: The messages are routed to the targeted devices. The notifications can be displayed according to the configurations sent from the app server \[1\].  
   
Over to you: We can also send messages to a “topic” (just like Kafka) in Step 4. When should the client app subscribe to the topic?  
   
Reference Material: Google firebase documentation

Next week, we will cover:

+   What happens when you swipe your Visa/Master card?
    
+   How does 2-factor authentication work?
    
+   Design a proximity service. Very important for interviews. Subscribe to our YouTube channel so you won’t miss it. 
    
+   SEO
    
+   How does QR code payment work?
    

## Other things we made:

Our bestselling book “System Design Interview - An Insider’s Guide” is available in both paperback and digital format.

Paperback edition: [https://geni.us/XxCd](https://geni.us/XxCd)

Digital edition: [https://bit.ly/3lg41jK](https://bit.ly/3lg41jK)

**New System Design YouTube channel**: [https://bit.ly/ByteByteGoVideos](https://bit.ly/ByteByteGoVideos)