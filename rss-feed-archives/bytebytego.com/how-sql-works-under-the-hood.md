In this newsletter, we’ll cover the following topics:

+   How is a SQL statement executed in the database?
    
+   How does Netflix scale push messaging for millions of devices?
    
+   Amazon DynamoDB
    
+   HTTP/1 → HTTP/2 → HTTP/3 (YouTube video)
    
+   What is API?
    

## How is a SQL statement executed in the database?

The diagram below shows the process. Note that the architectures for different databases are different, the diagram demonstrates some common designs.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7f5d2eb-2252-45e8-8005-b6d1281e69d0_1360x1722.jpeg)


Step 1 - A SQL statement is sent to the database via a transport layer protocol (e.g.TCP).

Step 2 - The SQL statement is sent to the command parser, where it goes through syntactic and semantic analysis, and a query tree is generated afterward.

Step 3 - The query tree is sent to the optimizer. The optimizer creates an execution plan. 

Step 4 - The execution plan is sent to the executor. The executor retrieves data from the execution.

Step 5 - Access methods provide the data fetching logic required for execution, retrieving data from the storage engine. 

Step 6 - Access methods decide whether the SQL statement is read-only. If the query is read-only (SELECT statement), it is passed to the buffer manager for further processing. The buffer manager looks for the data in the cache or data files.

Step 7 - If the statement is an UPDATE or INSERT, it is passed to the transaction manager for further processing.

Step 8 - During a transaction, the data is in lock mode. This is guaranteed by the lock manager. It also ensures the transaction’s ACID properties. 

## How does Netflix scale push messaging for millions of devices?

This post draws from an article published on Netflix’s engineering blog. Here’s my understanding of how the online streaming giant’s system works.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Faae105a9-aa3f-47bc-9b27-70c4729a1032_1622x2188.png)


**Requirements & scale**

\- 220 million users

\- Near real-time

\-  Backend systems need to send notifications to various clients

\- Supported clients: iOS, Android, smart TVs, Roku, Amazon FireStick, web browser

**The life of a push notification**

1\. Push notification events are triggered by the clock, user actions, or by systems.

2\. Events are sent to the event management engine.

3\. The event management engine listens to specific events and forward events to different queues. The queues are populated by priority-based event forwarding rules.

4\. The “event priority-based processing cluster” processes events and generates push notifications data for devices.

5\. A Cassandra database is used to store the notification data.

6\. A push notification is sent to outbound messaging systems.

7\. For Android, FCM is used to send push notifications. For Apple devices, APNs are used. For web, TV, and other streaming devices, Netflix’s homegrown solution called ‘Zuul Push’ is used.

## **Amazon DynamoDB**

Amazon DynamoDB powered 89 million requests per second during prime days. How does it do that?

  
The diagram below is my attempt to draw the latest architecture of DynamoDB based on the 2022 paper. I also try to explain why certain choices were made. Please leave a comment if you spot any mistakes.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F4b87557e-8153-4d91-b60a-b6eb40994b19_1326x1710.png)


## HTTP/1 → HTTP/2 → HTTP/3

YouTube Video:

## **What is an API**


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F9ad7b230-9204-4c1f-a05f-9386486ecb78_2160x1620.jpeg)


**Thanks for making it this far!**

If you want to learn more about System Design, check out our books:

Paperback edition: [https://geni.us/XxCd](https://substack.com/redirect/4016f3e5-9e4b-42de-b705-10e4c79bf51c?r=1lr2rb)

Digital edition: [https://bit.ly/3lg41jK](https://substack.com/redirect/af1b901a-f683-4382-92a7-2cc925690707?r=1lr2rb)