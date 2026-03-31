This week’s system design refresher:

+   Ace System Design Interviews
    
+   Online Gaming Protocol
    
+   Apple Pay vs. Google Pay
    
+   Telegram End-to-End Encryption
    
+   B-Tree vs. LSM-Tree
    
+   Markdown + Mindmap
    

## [Ace System Design Interviews (Taught by ByteByteGo)](https://bytebytego.com/)

Scale from zero to millions of users, design a news feed system, design YouTube, and many more. The **text-based** course is designed to make you a better software engineer and ace the system design interview.

Note: This course contains the same content as my best-selling system design interview books (volume 1 and volume 2). If you already own those two books, there is no need to buy the course.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F342a9366-e5d8-4b20-9702-4f761309d89e_1636x1344.png)


[Check it out now!](https://bytebytego.com/)

## What protocol does online gaming use to transmit data? TCP or UDP?

A common practice is to use RUDP (Reliable UDP). It adds a **reliable** mechanism on top of UDP to provide **much lower latency** than TCP and guarantee accuracy.

The diagram below shows how reliable data delivery is implemented in online gaming to get eventually-synchronized states.


![a close up of text and logo over a white background](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fc228016b-e81e-41e4-95ed-c0e434e2cde8_1500x1536.jpeg "a close up of text and logo over a white background")


Suppose there is a big fight in a simulation shooter game. Characters A, B, and C open fires in sequence. How does the game server transmit the states from the game server to the game client?

+   Steps 1 and 2 - Character A opens fires. The packet (packet 0) is sent to the client. The client acknowledges the server.
    
+   Step 3 - Character B opens fire. The packet is lost during transmission.
    
+   Steps 4 and 5 - Character C opens fire. The packet (packet 2) is sent to the client. Since the last successfully delivered packet is packet 0, the client knows that packet 1 is lost, so packet 2 is **buffered** on the client side. The client acknowledges the server for the reception of packet 2.
    
+   Steps 6 and 7 - The server doesn’t receive the ack for packet 1 for a while, so it resends packet 1. When the client receives packet 1, all the subsequent packets become effective, so packets 1 and 2 become “**delivered**”. The client then acknowledges the server for the reception of packet 1. No packets are buffered at this point.
    

## Apple Pay vs. Google Pay: Which is more secure?

## Is Telegram secure?

Let’s first define what “secure” means. A “secure” chat in a messaging App generally means the message is encrypted at the sender side and is only decryptable at the receiver side. It is also called “E2EE” (end-to-end encryption).

In this sense, is Telegram secure? It depends.


![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5f4a5e1b-6d93-4fdb-b49c-96c267ddbd74_1678x1536.jpeg "diagram")


**Telegram’s usual private and group chats aren’t end-to-end encrypted**  
It generally means third parties can intercept and read your messages. Telegram uses the following approach for security:

+   The encrypted message is stored in Telegram servers, but split into several pieces and stored in different countries.
    
+   The decryption keys are also split and saved in different countries.
    

This means the hacker needs to get message chunks and keys from all places. It is possible but extremely difficult.

**Secret chats are end-to-end encrypted**  
 If you choose the “secret chat” option, it is end-to-end encrypted. It has several limitations:

+   It doesn’t support group chat or normal one-to-one chat.
    
+   It is only enabled for mobile devices. It doesn’t support laptops. 
    

## B-Tree vs. LSM-Tree


![a close up of a chart](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F8ca0c770-fe3a-40cd-b4f4-7b719c650fdd_1981x1536.jpeg "a close up of a chart")


+   **B-Tree**  
    B-Tree is the most widely used indexing data structure in almost all relational databases.
    
    The basic unit of information storage in B-Tree is usually called a “page”. Looking up a key traces down the range of keys until the actual value is found.
    
    **LSM-Tree**  
    LSM-Tree (Log-Structured Merge Tree) is widely used by many NoSQL databases, such as Cassandra, LevelDB, and RocksDB. 
    
    LSM-trees maintain key-value pairs and are persisted to disk using a Sorted Strings Table (SSTable), in which the keys are sorted.
    
    Level 0 segments are periodically merged into Level 1 segments. This process is called **compaction.**
    
    The biggest difference is probably this:
    
+   B-Tree enables faster reads
    
+   LSM-Tree enables fast writes
    

If you use markdown and mindmap, you'll probably like this tool.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fa81346ac-aec7-4a67-aa7d-2aef0b1500ec_1456x1078.png)

