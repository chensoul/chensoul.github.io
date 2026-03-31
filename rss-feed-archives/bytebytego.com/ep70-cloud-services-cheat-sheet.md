This week’s system design refresher:

+   Top 7 ways to 10x your API performance (Youtube video)
    
+   Cloud services cheat sheet
    
+   Subjects that should be mandatory in schools
    
+   What is FedNow?
    
+   5 inter-process communications
    
+   Sponsor US
    

## [Generate SDKs and documentation for your API with Fern (Sponsored](https://bit.ly/Fern_072923))



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbf921d65-201d-46ba-be58-c21cbbf67b68_5334x2617.png)



Fern is an open-source CLI that creates SDKs and API docs for REST APIs. 

+   **SDKs**: generate idiomatic client libraries for interacting with APIs, eliminating manual SDK writing. Fern supports automatic publishing to registries like NPM and PyPI.
    
+   **Documentation:** get Stripe-like API docs that can be personalized to match your existing company website.
    
+   **Compatible with OpenAPI:** use your existing OpenAPI spec
    

[Get Started - Free](https://bit.ly/Fern_072923)

## **Top 7 Ways to 10x Your API Performance**

## A nice cheat sheet of different cloud services (2023 edition)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16fe4308-ed47-451f-a852-c476ecfb4167_1280x1977.jpeg)



Guest post by [Govardhana Miriyala Kannaiah](https://www.linkedin.com/in/govardhana-miriyala-kannaiah/).

## Latest articles

If you’re not a subscriber, here’s what you missed this month:

1.  ["I Was Under Leveled!" — Avoiding the Tragedy of Making Only $500k a Year](https://blog.bytebytego.com/p/i-was-under-leveled-avoiding-the)
    
2.  [The Foundation of REST API: HTTP](https://blog.bytebytego.com/p/the-foundation-of-rest-api-http)
    
3.  [Database Indexing Strategies](https://blog.bytebytego.com/p/database-indexing-strategies)
    
4.  [Network Protocols Run the Internet](https://blog.bytebytego.com/p/network-protocols-run-the-internet)
    
5.  [Everything You Always Wanted to Know About TCP But Too Afraid to Ask](https://blog.bytebytego.com/p/everything-you-always-wanted-to-know)
    

To receive all the full articles and support ByteByteGo, consider subscribing:

## An interesting list of subjects that should be mandatory in schools

While academics are essential, it's crucial to acknowledge that many elements in this diagram would have been beneficial to learn earlier.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb0693a88-0181-477f-9bdf-42f241e2a698_800x990.jpeg)



Over to you: What else should be on the list? What are the top 3 skills you wish schools would teach?

Credit: Instagram accounts on startup\_rules

## What is FedNow (instant payment)?

JPMorgan, Wells Fargo, and other major banks will use the new Federal Reserve's 'FedNow' instant payment system. Let's take a look at how it works.

Federal Reserve launched FedNow instant payment service on 20 Jul. It allows retail clients to send and receive money within seconds and it is available 24x7.

+   What does this mean?  
    1\. Peer-to-peer payment services in the private sector like Venmo or PayPal act as intermediaries between banks, so we need to leverage payment schemes for clearing and Fed systems for settlement. However, FedNow can directly settle the transactions in central bank accounts. \[1\]
    
    2\. Fedwire, another real-time payments system, will still function in large-value or low-value payments. FedNow is not designed to replace Fedwire.
    
+   The diagram below shows a comparison between FedNow and ACH (Automated Clearing House), which is used in domestic low-value payments.
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff6ee7441-c805-4dbf-94fa-e050f3c3d965_1335x1536.jpeg)



+   FedNow \[2\]  
    Step 0 - Bob wants to pay Alice $1000.  
    Step 1 - Bob initiates a payment transaction using FedNow.  
    Step 2 - The sender’s bank submits a payment message to FedNow.  
    Step 3 - The FedNow service validates the payment message.  
    Step 4 - The FedNow service sends the payment message to the receiver’s bank, where it is confirmed.  
    Step 5 - The receiver’s bank replies to FedNow, confirming that the payment is accepted.  
    Step 6 - The FedNow service debits and credits the designated accounts of the sender and receiver’s banks.  
    Step 7 - The FedNow service notifies the sender’s bank and receiver’s bank that the settlement is complete.  
    Step 8 - The banks debit and credit the bank accounts.
    
+   ACH  
    Step 1 - Bob receives authorization from Alice that he can deduct from Alice’s account.  
    Step 2 - The payment transaction is sent to the receiver’s bank.  
    Step 3 - The bank collects files in batches and sends them to the ACH operator.  
    Step 4 - The ACH operator sends the files to the sender’s bank.  
    Step 5 - The sender’s bank pulls funds from Alice’s account.  
    Step 6 - Withdrawn funds are sent to the ACH operator.  
    Step 7 - The ACH operator distributes funds to Bob’s bank.  
    Step 8 - Bob receives the fund.  
    Step 9 - The clearing instructions are sent to Fedwire.  
    Step 10 - Fedwire sends clearing broadcasts to banks for settlements.
    

Over to you: What types of instant payment systems does your country provide?

References:  
\[1\] [Federal Reserve launches FedNow instant payment service that could bypass Venmo and PayPal](http://www.nbcnews.com/business/consumer/federal-reserve-launches-fednow-instant-payment-service-bypass-venmo-p-rcna95380)  
\[2\] [Q&A on the Federal Reserve’s FedNow Service](http://www.klaros.com/post/q-a-on-the-federal-reserve-s-fednow-service)

## How do processes talk to each other on Linux?

The diagram below shows 5 ways of Inter-Process Communication.

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2048bcd8-4319-4bd4-bcce-f8ea2a3950b6_1283x1536.jpeg)



1.  Pipe  
    Pipes are unidirectional byte streams that connect the standard output from one process to the standard input of another process.
    
2.  Message Queue  
    Message queues allow one or more processes to write messages, which will be read by one or more reading processes.
    
3.  Signal  
    Signals are one of the oldest inter-process communication methods used by Unix systems. A signal could be generated by a keyboard interrupt or an error condition such as the process attempting to access a non-existent location in its virtual memory. There are a set of defined signals that the kernel can generate or that can be generated by other processes in the system. For example, Ctrl+C sends a SIGINT signal to process A.
    
4.  Semaphore  
    A semaphore is a location in memory whose value can be tested and set by more than one process. Depending on the result of the test and set operation one process may have to sleep until the semaphore's value is changed by another process.
    
5.  Shared Memory  
    Shared memory allows one or more processes to communicate via memory that appears in all of their virtual address spaces. When processes no longer wish to share the virtual memory, they detach from it.
    

Reference: [Interprocess Communication Mechanisms](http://tldp.org/LDP/tlk/ipc/ipc.html)

## **SPONSOR US**

📈Feature your product in the biggest technology newsletter on Substack.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F882cca8e-f7a3-4414-b947-cc1f0ee116c4_2012x922.jpeg)



ByteByteGo is the biggest technology newsletter on Substack with 500,000 readers working at companies like Apple, Meta, Amazon, Google, etc. They have the influence and autonomy to make large purchase decisions. If you are interested in sponsoring us, please send an email to **[hi@bytebytego.com](mailto:hi@bytebytego.com)**.