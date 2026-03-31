This week’s system design refresher:

+   Stack overflow architecture
    
+   iQIYI database selection trees
    
+   Latency Numbers Every Programmer Should Know for the 2020s
    
+   Row-based DB vs. Column-based DB
    

## HTAP Summit 2022 is coming soon! (Sponsored)


![电子设备的屏幕
描述已自动生成](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd7ca9185-c892-4768-ab8c-56ee709a6027_1600x890.png "电子设备的屏幕
描述已自动生成")


We’re talking about **HTAP Summit 2022**, the very first in-person conference on Hybrid Transactional / Analytical Processing. This promises to be a disruptive technology in the database world. So, dive in and discover more about this emerging tech! 

Hear from 30+ database industry leaders and developers from companies and universities, such as Amazon, Databricks, Forrester, Block, Pinterest, PingCAP, Vercel, UW-Madison, UC-Berkeley, and many more.

The Best part? It’s ***FREE***.

Date: **November 1** at the Computer History Museum, Mountain View, Bay Area, CA. 

HTAP Summit 2022 organized by PingCAP features 30+ content-rich sessions on HTAP databases, including core infrastructure technologies, use cases, best practices, ecosystem, hands-on workshops, and keynotes.

[Register Now!](https://bit.ly/3eh2EBO)

## How will you design the Stack Overflow website?

If your answer is on-premise servers and monolith, you would likely fail the interview, but that's how it is built in reality!


![Image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F55838439-08de-4554-87d9-0fb14551aac1_1024x1087.jpeg "Image")


**What people think it should look like**  
The interviewer is probably expecting something on the left side.

1.  Microservice is used to decompose the system into small components.
    
2.  Each service has its own database. Use cache heavily.
    
3.  The service is sharded.
    
4.  The services talk to each other asynchronously through message queues.
    
5.  The service is implemented using Event Sourcing with CQRS.
    
6.  Showing off knowledge in distributed systems such as eventual consistency, CAP theorem, etc.
    

**What it actually is**  
Stack Overflow serves all the traffic with only 9 on-premise web servers, and it’s on monolith! It has its own servers and does not run on the cloud.

This is contrary to all our popular beliefs these days. 

## iQIYI database selection trees

One picture is worth a thousand words.  
   
iQIYI is one of the largest online video sites in the world, with over 500 million monthly active users. Let's look at how they choose relational and NoSQL databases.


![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdac954dd-0e93-4b4d-ad1c-8eeef290a7be_1280x1653.jpeg "diagram")


The following databases are used at iQIYI:

+   MySQL
    
+   Redis
    
+   TiDB: a hybrid transactional/analytical processing (HTAP) distributed database
    
+   Couchbase: distributed multi-model NoSQL document-oriented database
    
+   TokuDB: open-source storage engine for MySQL and MariaDB.
    
+   Big data analytical systems, like Hive and Impala
    
+   Other databases, like MongoDB, HiGraph, and TiKV
    

The database selection trees below explain how they choose a database.

## Latency Numbers Every Programmer Should Know for the 2020s

This concept was originally presented by Jeff Dean. We updated some of these numbers to more closely reflect reality in the 2020s. Absolute accuracy is not the goal. Developing an intuition of the relative differences is.

## Why do we use column-based DB? Does column-based DB provide better performance?

The diagram below shows how data is stored in column-based DB.


![a close up of a chart](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F42756bde-3a8a-46ec-9263-825b0e5f6aa0_2048x1400.jpeg "a close up of a chart")


**When to use**

1.  The table is a wide table with many columns.
    
2.  The queries and calculations are on a small number of columns.
    
3.  A lot of the columns contain a few distinct values.
    

**Benefits of column-based DB**

1.  Higher data compression rates.  
    
2.  Higher performance on OLAP functions.
    
3.  No need for additional indexes
    

## Got behavioral interviews? (Sponsored)


![Image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F3a802402-2717-4c30-9543-1824561065ad_1584x396.png "Image")


"Tell me about a time when..." Sometimes, the toughest interview questions aren't the technical ones. For behavioral interviews, RocketBlocks is here to help. Trusted by leading institutions like Stanford GSB and MIT Sloan.

[Sign up today](https://www.rocketblocks.me/behavioral.php?utm_source=partner&utm_medium=email&utm_campaign=bytebytego)