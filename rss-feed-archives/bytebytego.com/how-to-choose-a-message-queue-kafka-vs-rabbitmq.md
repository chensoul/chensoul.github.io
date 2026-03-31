In the last issue, we discussed the benefits of using a message queue. Then we went through the history of message queue products. It seems that nowadays Kafka is the go-to product when we need to use a message queue in a project. However, it's not always the best choice when we consider specific requirements.

## Database-Backed Queue

Let’s use our Starbucks example again. The two most important requirements are:

+   Asynchronous processing so the cashier can take the next order without waiting.
    
+   Persistence so customers’ orders are not missed if there is a problem.
    

Message ordering doesn’t matter much here because the coffee makers often make batches of the same drink. Scalability is not as important either since queues are restricted to each Starbucks location.

The Starbucks queues can be implemented in a database table. The diagram below shows how it works:



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9ec6440f-9fd5-40c2-b32f-36b3caaac3e7_1262x770.jpeg)



When the cashier takes an order, a new order is created in the database-backed queue. The cashier can then take another order while the coffee maker picks up new orders in batches. Once an order is complete, the coffee maker marks it done in the database. The customer then picks up their coffee at the counter.

A housekeeping job can run at the end of each day to delete complete orders (that is, those with the “DONE status).

For Starbucks’ use case, a simple database queue meets the requirements without needing Kafka. An order table with CRUD (Create-Read-Update-Delete) operations works fine.  

## Redis-Backed Queue

A database-backed message queue still requires development work to create the queue table and read/write from it. For a small startup on a budget that already uses Redis for caching, Redis can also serve as the message queue.

There are 3 ways to use Redis as a message queue:

1.  Pub/Sub
    
2.  List
    
3.  Stream
    

The diagram below shows how they work.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff9651c4f-a045-4dcd-aa95-f25d819e75eb_1514x1202.jpeg)



Pub/Sub is convenient but has some delivery restrictions. The consumer subscribes to a key and receives the data when a producer publishes data to the same key. The restriction is that the data is delivered at most once. If a consumer was down and didn’t receive the published data, that data is lost. Also, the data is not persisted on disk. If Redis goes down, all Pub/Sub data is lost. Pub/Sub is suitable for metrics monitoring where some data loss is acceptable.

The List data structure in Redis can construct a FIFO (First-In-First-Out) queue. The consumer uses BLPOP to wait for messages in blocking mode, so a timeout should be applied. Consumers waiting on the same List form a consumer group where each message is consumed by only one consumer. As a Redis data structure, List can be persisted to disk.

Stream solves the restrictions of the above two methods. Consumers choose where to read messages from - “$” for new messages, “<id>” for a specific message id, or “0-0” for reading from the start.

In summary, database-backed and Redis-backed message queues are easy to maintain. If they can't satisfy our needs, dedicated message queue products are better. We'll compare two popular options next. 

## RabbitMQ vs. Kafka

For large companies that need reliable, scalable, and maintainable systems, evaluate message queue products on the following:

+   Functionality
    
+   Performance
    
+   Scalability
    
+   Ecosystem
    

The diagram below compares two typical message queue products: RabbitMQ and Kafka.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d19e154-30ae-4d9d-87fb-c9a94d708f45_842x1762.jpeg)



### How They Work

RabbitMQ works like a messaging middleware - it pushes messages to consumers then deletes them upon acknowledgment. This avoids message pileups which RabbitMQ sees as problematic.

Kafka was originally built for massive log processing. It retains messages until expiration and lets consumers pull messages at their own pace.

### Languages and APIs

RabbitMQ is written in Erlang which makes modifying the core code challenging. However, it offers very rich client API and library support.

Kafka uses Scala and Java but also has client libraries and APIs for popular languages like Python, Ruby, and Node.js.

### Performance and Scalability

RabbitMQ handles tens of thousands of messages per second. Even on better hardware, throughput doesn’t go much higher.

Kafka can handle millions of messages per second with high scalability. 

### Ecosystem

Many modern big data and streaming applications integrate Kafka by default. This makes it a natural fit for these use cases.

## Message Queue Use Cases

Now that we’ve covered the features of different message queues, let’s look at some examples of how to choose the right product.

### Log Processing and Analysis

For an eCommerce site with services like shopping cart, orders, and payments, we need to analyze logs to investigate customer orders. 

The diagram below shows a typical architecture uses the “ELK” stack:

+   ElasticSearch - indexes logs for full-text search
    
+   LogStash - log collection agent
    
+   Kibana - UI for search and visualizing logs
    
+   Kafka - distributed message queue
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fce542372-221a-41fa-997e-0ecaa3bb800a_1488x764.jpeg)

