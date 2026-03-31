This week’s system design refresher:

+   Cloud Native
    
+   Accounting 101 in Payments
    
+   Evolution of Uber’s API Layer
    
+   Short/Long Polling, SSE, Websocket
    
+   17 Equations That Changed the World
    

## What is cloud native?

Below is a diagram showing the evolution of architecture and processes since the 1980s.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ff9c4fafd-4096-42ab-86a1-d60c8e895c29_2763x3543.jpeg)



Organizations can build and run scalable applications on public, private, and hybrid clouds using cloud native technologies.

This means the applications are designed to leverage cloud features, so they are resilient to load and easy to scale.

Cloud native includes 4 aspects:

1.  **Development process**  
    This has progressed from waterfall to agile to DevOps.
    
2.  **Application Architecture**  
    The architecture has gone from monolithic to microservices. Each service is designed to be small, and adaptive to the limited resources in cloud containers.
    
3.  **Deployment & packaging**  
    The applications used to be deployed on physical servers. Then around 2000, the applications that were not sensitive to latency were usually deployed on virtual servers. With cloud native applications, they are packaged into docker images and deployed in containers.
    
4.  **Application infrastructure**  
    The applications are massively deployed on cloud infrastructure instead of self-hosted servers.
    

👉 Over to you: what comes into your mind when people talk about “cloud native”?

## Accounting 101 in Payments

Why is a credit card called a **“credit”** card?  
Why is a debit card called a **“debit”** card?  

An example of a debit card payment is shown in the diagram below.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F8f13af7f-ffaa-4c41-bcfc-2ce405ea0424_800x786.jpeg "No alternative text description for this image")



+   Each transaction in the business system is transformed into at least two journal lines in the ledger system. This is called **double-entry** accounting, where every transaction must have a **source** account and a **target** account.
    
+   Each journal line is booked to an account. 
    
+   Each account belongs to one of the three components in the balance sheet:  
    
            💡Asset = Liability + Equity
    

Let’s look at the issuing bank’s ledger as an example:  

Bob pays $100 to the merchant with a debit card. We have two accounts involved in this transaction:

1.  Journal line 1 - From the issuing bank’s point of view, Bob’s bank account is a **liability** (because the bank owes Bob money). Bob’s bank account is deducted $100.   
    This is a **debit** record.
    
2.  Journal line 2 - Bank’s cash is an **asset** and the bank’s cash is deducted by $100.  
    This is a **credit** record.
    

The balance sheet equation still balances with the two journal lines recorded in the ledger.  

Bob’s card is called a “debit” card because it is a **debit record** when paying with a debit card.   

👉 Why is this important?   
This is how a ledger system is designed, only a real ledger is more complicated.   
Applying these strict accounting rules makes reconciliation much easier!

## Evolution of Uber’s API layer

Uber’s API gateway went through 3 main stages.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fc2e1e02d-5680-4f83-ac28-bb441b485851_3564x6206.png)



First gen: the organic evolution. Uber's architecture in 2014 would have two key services: dispatch and API. A dispatch service connects a rider with a driver, while an API service stores the long-term data of users and trips.

Second gen: the all-encompassing gateway. Uber adopted a microservice architecture very early on. By 2019, Uber's products were powered by 2,200+ microservices as a result of this architectural decision.

Third gen: self-service, decentralized, and layered. As of early 2018, Uber had completely new business lines and numerous new applications. Freight, ATG, Elevate, groceries, and more are among the growing business lines. With a new set of goals comes the third generation.

## Short/long polling, SSE, WebSocket

An HTTP server cannot automatically initiate a connection to a browser. As a result, the web browser is the initiator. What should we do next to get real-time updates from the HTTP server?



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F4969af3d-893f-4cde-bf9b-ba65187c3af0_2235x3192.jpeg)



Both the web browser and the HTTP server could be responsible for this task.

+   Web browsers do the heavy lifting: short polling or long polling. With short polling, the browser will retry until it gets the latest data. With long polling, the HTTP server doesn’t return results until new data has arrived.
    
+   HTTP server and web browser cooperate: WebSocket or SSE (server-sent event). In both cases, the HTTP server could directly send the latest data to the browser after the connection is established. The difference is that SSE is uni-directional, so the browser cannot send a new request to the server, while WebSocket is fully-duplex, so the browser can keep sending new requests.
    

👉 Over to you: of the four solutions (long polling, short polling, SSE, WebSocket), which ones are commonly used, and for what use cases?

## 17 Equations That Changed the World

What else should be included?



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fe86fc49c-d67d-4fb1-ac84-26578450e543_1024x1339.jpeg)



## **Featured job openings**

**HEIR**: [Senior Software Engineer, Full Stack](https://substack.com/redirect/6f0490ba-2166-45f3-a598-c4b068e9048e?j=eyJ1IjoiMWxyMnJiIn0.3gL4cFwDHqFL_VcXxR7HzMwPYkuu_RpwPuz8o-oe3gw) (United States)