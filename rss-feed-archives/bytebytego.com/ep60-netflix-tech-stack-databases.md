This week’s system design refresher:

+   SQL Query Execution Order (Youtube video)
    
+   Netflix Tech Stack - Databases
    
+   The 10 Algorithms That Dominate Our World
    
+   “Pull” and “Push” Payments
    
+   ByteByteGo Talent Collective
    

## [Retool is the fast way to build internal tools (Sponsored)](https://bit.ly/Retool0520)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F38ce9cdb-94fc-4c4f-8154-018ad269bb07_1200x1200.png)



Building business software today is slow. You often spend more time on boilerplate code and redundant work than you do on actually solving the problem at hand.

Retool is a new approach. We move the starting line with a platform that makes it much faster to connect to any data source, design and develop at the same time, and deploy software securely.  
Companies like Amazon and Plaid use Retool to build apps and workflows that help teams work faster. Retool is free for teams of up to 5, and early-stage startups can get $25,000 in free credits for paid plans. 

[Try Retool for free](https://bit.ly/Retool0520)

## SQL Query Execution Order

Want to know the secret to optimizing your SQL queries? Understanding the execution order is key.

In this video, we will talk about:

+   Parsing the SQL statement and checking its validity
    
+   Transforming the SQL into an internal representation, such as relational algebra
    
+   Optimizing the internal representation and creating an execution plan that utilizes index information
    
+   Executing the plan and returning the results
    

## Netflix Tech Stack - Databases

The Netflix Engineering team selects a variety of databases to empower streaming at scale.



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F047fe27b-162e-4633-b1cc-44a46ec3074c_1945x1536.jpeg "diagram")



Relational databases: Netflix chooses MySql for billing transactions, subscriptions, taxes, and revenue. They also use CockroachDB to support a multi-region active-active architecture, global transactions, and data pipeline workflows.

Columnar databases: Netflix primarily uses them for analytics purposes. They utilize Redshift and Druid for structured data storage, Spark and data pipeline processing, and Tableau for data visualization.

Key-value databases: Netflix mainly uses EVCache built on top of Memcached. EVCache has been with Netflix for over 10 years and is used for most services, caching various data such as the Netflix Homepage and Personal Recommendations.

Wide-column databases: Cassandra is usually the default choice at Netflix. They use it for almost everything, including Video/Actor information, User Data, Device information, and Viewing History.

Time-series databases: Netflix built an open-source in-memory database called Atlas for metrics storage and aggregation.

Unstructured data: S3 is the default choice and stores almost everything related to Image/Video/Metrics/Log files. Apache Iceberg is also used with S3 for big data storage.

If you work for a large company and wish to discuss your company's technology stack, feel free to get in touch with me. By default, all communications will be treated as anonymous.

## The 10 Algorithms That Dominate Our World

The diagram below shows the most commonly used algorithms in our daily lives. They are used in internet search engines, social networks, WiFi, cell phones, and even satellites.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffa9108fb-074b-4b28-b9c3-407bc60736a7_1446x1536.jpeg "No alternative text description for this image")



1.  Sorting
    
2.  Fourier Transform and Fast Fourier Transform
    
3.  Dijkstra’s algorithm
    
4.  RSA algorithm
    
5.  Secure Hash Algorithm
    
6.  Integer factorization
    
7.  Link Analysis
    
8.  Proportional Integral Derivative Algorithm
    
9.  Data compression algorithms
    
10.  Random Number Generation


Over to you: Any other commonly used algorithms?

## What is the difference between “pull” and “push” payments?

The diagram below shows how the pull and push payments work.



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2c926917-d971-41ac-b5ee-2bafa910e8bc_1280x1727.jpeg "diagram")



+   When we swipe a credit/debit card at a merchant, it is a pull payment, where the money is sent from the cardholder to the merchant. The merchant pulls money from the cardholder’s account, and the cardholder approves the transaction.
    
+   With Visa Direct or Mastercard Send, the push payments enable merchant, corporate, and government disbursements.
    

Step 1: The merchant initiates the push payment through a digital channel. It can be a mobile phone or a bank branch etc.

Step 2: The acquiring bank creates and submits an OCT (Original Credit Transaction) to the card scheme.

Step 3: The transaction is routed to the receiving institution.

Step 4: The issuing bank credits the cardholder’s account and notifies the cardholder. The money is deposited into a Visa account that can be accessed at an ATM or PoS terminal or a digital wallet.

Note that the push payments work for cross-border transactions.

Push payments are indeed an interesting innovation, which complements the digital wallet strategy in Visa and Mastercard. The abstraction of “account” masks the complication of different funding or consuming channels.

Over to you: What is your most frequently used payment method? Is it pull-based or push-based?

## Join the ByteByteGo Talent Collective

If you’re looking for a new gig, [join the collective](https://substack.com/redirect/79188cab-63a0-488e-8fd1-f38f237dcea7?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) for customized job offerings from selected companies. Public or anonymous options are available. Leave anytime.

If you’re **hiring**, [join the ByteByteGo Talent](https://substack.com/redirect/00076ea6-f52f-413c-a1a4-b7e3626427e1?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) Collective to start getting bi-monthly drops of world-class hand-curated engineers who are open to new opportunities.