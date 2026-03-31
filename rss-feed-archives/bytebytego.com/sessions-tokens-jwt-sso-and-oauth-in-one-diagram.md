This week’s system design refresher:

+   Software Engineer Promo is SUPER easy - DO THIS (Youtube video)
    
+   Explaining Sessions, Tokens, JWT, SSO, and OAuth in One Diagram
    
+   Most Used Linux Commands Map
    
+   How do we transform a system to be Cloud Native?
    
+   CRUD System vs. Event Sourcing
    

## **[Free tickets to P99 CONF - 60+ low-latency engineering talks (Sponsored)](https://bit.ly/Scylladb_093023)**



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb7c851d0-ea83-465a-999e-ff13fb0e0e5b_1600x840.jpeg)



P99 CONF is the technical conference for anyone who obsesses over high-performance, low-latency applications. Engineers from Netflix, Google, Meta, Twitter, TikTok, Uber  + more will be sharing 60+ talks on topics like Rust, Go, Zig, distributed data systems, Kubernetes, edge, and AI/ML. 

Join 15K of your peers for an unprecedented opportunity to learn from experts like Gwen Shapira, Bryan Cantrill, Jens Axboe, Avi Kivity, Jon Haddad, Armin Ronacher, Liz Rice & more – for free, from anywhere. 

[GET YOUR FREE TICKET](https://bit.ly/Scylladb_093023)

Bonus: Registrants are eligible to win 500 free swag packs and get 30-day access to the complete O’Reilly library & learning platform, plus free digital books.

## Software Engineer Promo is SUPER easy - DO THIS

## Explaining Sessions, Tokens, JWT, SSO, and OAuth in One Diagram

Understanding these backstage maneuvers helps us build secure, seamless experiences.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F041727d8-aaba-4c1d-8b74-b2c26e2e05e2_1446x1890.png)



How do you see the evolution of web session management impacting the future of web applications and user experiences?

## Latest articles

If you’re not a subscriber, here’s what you missed this month.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F52409721-fccb-44d1-854c-5e7c552818d4_1395x1600.png)



1.  [A Crash Course in DNS](https://blog.bytebytego.com/p/a-crash-course-in-dns-domain-name)
    
2.  [A Crash Course in Redis](https://blog.bytebytego.com/p/a-crash-course-in-redis)
    
3.  [Why is Kafka so fast? How does it work?](https://blog.bytebytego.com/p/why-is-kafka-so-fast-how-does-it)
    
4.  [How to Choose a Message Queue? Kafka vs. RabbitMQ](https://blog.bytebytego.com/p/how-to-choose-a-message-queue-kafka)
    
5.  [Why Do We Need a Message Queue?](https://blog.bytebytego.com/p/why-do-we-need-a-message-queue)
    

To receive all the full articles and support ByteByteGo, consider subscribing:

## Most Used Linux Commands Map



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9c3295d4-0808-406d-9461-14a56bc908c5_1283x1536.jpeg "diagram")



1.  File and Directory Management
    
2.  File Viewing and Editing
    
3.  Process Management
    
4.  System Information
    
5.  User and Group Management
    
6.  Network Configuration and Monitoring
    
7.  Package Management
    

Over to you: Which command category did you use the most in your daily Linux tasks?

Guest post by [Govardhana Miriyala Kannaiah](https://www.linkedin.com/in/govardhana-miriyala-kannaiah/)

## How do we transform a system to be Cloud Native?

The diagram below shows the action spectrum and adoption roadmap. You can use it as a blueprint for adopting cloud-native in your organization.



![graphical user interface, application](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb1081581-5795-43f9-902b-d8b475dc44c1_1280x1664.gif "graphical user interface, application")



For a company to adopt cloud native architecture, there are 6 aspects in the spectrum:

1.  Application definition development
    
2.  Orchestration and management
    
3.  Runtime
    
4.  Provisioning
    
5.  Observability
    
6.  Serverless
    

Over to you: Where does your system stand in the adoption roadmap?

Reference: Cloud & DevOps: Continuous Transformation by MIT  
Redrawn by ByteByteGo

## What is Event Sourcing?

The diagram below shows a comparison of normal CRUD system design and event sourcing system design. We use an order service as an example.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0a124ddf-8104-48fc-8f61-e190a73579e9_1529x1536.jpeg "No alternative text description for this image")



The event sourcing paradigm is used to design a system with determinism. This changes the philosophy of normal system designs.

How does this work? Instead of recording the order states in the database, the event sourcing design persists the events that lead to the state changes in the event store. The event store is an append-only log. The events must be sequenced with incremental numbers to guarantee their ordering. The order states can be rebuilt from the events and maintained in OrderView. If the OrderView is down, we can always rely on the event store which is the source of truth to recover the order states.

Let's look at the detailed steps.

+   Non-Event Sourcing  
    Steps 1 and 2: Bob wants to buy a product. The order is created and inserted into the database.  
    Steps 3 and 4: Bob wants to change the quantity from 5 to 6. The order is modified with a new state.
    
+   Event Sourcing  
    Steps 1 and 2: Bob wants to buy a product. A NewOrderEvent is created, sequenced, and stored in the event store with eventID=321.  
    Steps 3 and 4: Bob wants to change the quantity from 5 to 6. A ModifyOrderEvent is created, sequenced, and persisted in the event store with eventID=322.  
    Step 5: The order view is rebuilt from the order events, showing the latest state of an order.
    

Over to you: Which type of system is suitable for event sourcing design? Have you used this paradigm in your work?