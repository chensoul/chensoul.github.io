In this newsletter, we will talk about the following:

+   Database isolation levels
    
+   Log parsing commands
    
+   How does Change data capture (CDC) work?
    
+   ByteByteGo system design Big Archive
    

## What are database isolation levels? What are they used for?

Database isolation allows a transaction to execute as if there are no other concurrently running transactions.

The diagram below illustrates four isolation levels.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F76f9340d-f580-40ec-b5bb-b7cb98437e61_1600x1243.png)


🔹Serializalble: This is the highest isolation level. Concurrent transactions are guaranteed to be executed in sequence.

🔹Repeatable Read: Data read during the transaction stays the same as the transaction starts.

🔹Read Committed: Data modification can only be read after the transaction is committed.

🔹Read Uncommitted: The data modification can be read by other transactions before a transaction is committed.

The isolation is guaranteed by MVCC (Multi-Version Consistency Control) and locks.

The diagram below takes Repeatable Read as an example to demonstrate how MVCC works:

There are two hidden columns for each row: transaction\_id and roll\_pointer. When transaction A starts, a new Read View with transaction\_id=201 is created. Shortly afterward, transaction B starts, and a new Read View with transaction\_id=202 is created. 

Now transaction A modifies the balance to 200, a new row of the log is created, and the roll\_pointer points to the old row. Before transaction A commits, transaction B reads the balance data. Transaction B finds that transaction\_id 201 is not committed, it reads the next committed record(transaction\_id=200).

Even when transaction A commits, transaction B still reads data based on the Read View created when transaction B starts. So transaction B always reads the data with balance=100. 

Over to you: have you seen isolation levels used in the wrong way? Did it cause serious outages?

## Log parsing cheat sheet

I was doing some log parsing today and totally forgot what commands to use. After some Googling, I found this awesome cheat sheet by Thomas Roccia.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F16ff70a0-9509-4a67-af6b-06578870cff5_1131x1600.jpeg)


Log parsing commands are useful for:

🔹Searching patterns in text files

🔹Analyzing network packets

🔹Parsing fields from delimited logs

🔹Replacing strings in a file

🔹Sorting a file

🔹Displaying differences in files by comparing line by line

Over to you: have you used any command in this list?

## Change data capture (CDC)

Data stored in the database could be interesting to many other data systems, such as analytics, AI, etc. If we have thousands of data systems, do we have to write thousands of converters?

The answer is NO. Change data capture (CDC) is a process that can solve the problem. This is how CDC works:


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fff39f1da-bb05-436f-885e-c80cb37b0203_1600x838.png)


1\. Data is written to the database normally.

2\. Database uses the transaction log to record the modifications. 

3\. CDC software uses the source connector to connect to the database and reads the transaction log.

4\. The source connector publishes the log to the message queue.

5\. CDC software uses its sink connector to consume the log.

6\. The sink connector writes the log content to the destination.

All these operations except step 1 are transparent to the user. Popular CDC solutions, such as  Debezium, have connectors for most databases, such as MySQL, PostgreSQL, DB2, Oracle, etc. We only need to set up the CDC link between two databases and the data will automatically flow to the destination. 

Over to you: can we use CDC for NoSQL/NewSQL data systems, such as Redis, Cassandra, MongoDB, ElasticSearch, etc?

## ByteByteGo System Design Archive

I just put all my technical threads in one big PDF. It has 75 topics and 158 pages!


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd3c84e5a-28cb-4137-99c0-6b25b18dfcd0_2175x3150.jpeg)


A little background: I’ve been consistently posting for 7 months now. With so many people on Twitter reading my posts, I’m extremely grateful.

Here are some sample topics:

🔹 Why is Redis fast?

🔹 How to scale a website to support millions of users?

🔹 How does HTTPs work?

🔹 What happens when you type a URL into your browser?

🔹 How to avoid double charge?

🔹 Why is Kafka fast?

I hope this PDF can be helpful.

**Download link**:

https://bytebyte-go.s3.amazonaws.com/ByteByteGo\_LinkedIn\_PDF.pdf

## Our Books:

Our bestselling book “System Design Interview - An Insider’s Guide” is available in both paperback and digital format.

Paperback edition: [https://geni.us/XxCd](https://geni.us/XxCd)

Digital edition: [https://bit.ly/3lg41jK](https://bit.ly/3lg41jK)