This week’s system design refresher:

+   ByteByteGo talent collective
    
+   Why PostgreSQL is the most loved database
    
+   What is a proxy?
    
+   What is time/clock?
    
+   Twitter architecture in 2012
    

## ByteByteGo talent collective

We are excited to announce the launch of the ByteByteGo talent collective! The collective's members will have exclusive access to opportunities at high-growth startups and world-class companies such as Meta, Stripe, Snowflake, etc.

The ByteByteGo collective has **100 candidates live at this moment, and over 300+ applications from Senior / Staff / Lead engineers** from the best companies out there. Take a look at some of the amazing, open-to-work, talents from my community:


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F59ba1b1a-8515-41b2-bc1e-174dbbfe1d56_1448x1150.png)


**Companies**: If accepted, you'll get access to the full pool of active candidates (growing fast), as well as all future candidates. Job posts are included in the package, and featured packages get a newsletter shoutout. No placement fees, ever.

+   Browse candidates.
    
+   When one interests you, you can reach out to them (no limit).
    
+   If they accept your request to chat, you're connected directly.
    
+   It's that easy!
    

You can apply to [be a hiring partner here](https://bytebytego.pallet.com/talent/welcome) (click “Meet Candidates”)

[Be a hiring partner](https://bytebytego.pallet.com/talent/welcome)

**Candidates**: Entirely free. Create a public or anonymous profile. For everyone who's looking for a job, or just curious to see what's out there. Apply using the link below!

[Apply Now](https://bytebytego.pallet.com/talent/welcome?referral=true)

## Why is PostgreSQL voted as the most loved database by Stackoverflow 2022 Developer Survey?

The diagram shows the many use cases by PostgreSQL - one database that includes almost **all the use cases** developers need. 


![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fc75c7361-96b2-49ab-b2c1-35470f9f3eb6_1615x1536.jpeg "diagram")


+   OLTP (Online Transaction Processing)  
    We can use PostgreSQL for CRUD (Create-Read-Update-Delete) operations.
    
+   OLAP (Online Analytical Processing)  
    We can use PostgreSQL for analytical processing. PostgreSQL is based on **HTAP** (Hybrid transactional/analytical processing) architecture, so it can handle both OLTP and OLAP well.
    
+   FDW (Foreign Data Wrapper)  
    A FDW is an extension available in PostgreSQL that allows us to access a table or schema in one database from another.
    
+   Streaming  
    PipelineDB is a PostgreSQL extension for high-performance time-series aggregation, designed to power real-time reporting and analytics applications.
    
+   Geospatial  
    PostGIS is a spatial database extender for PostgreSQL object-relational database. It adds support for geographic objects, allowing location queries to be run in SQL.
    
+   Time Series  
    Timescale extends PostgreSQL for time series and analytics. For example, developers can combine relentless streams of financial and tick data with other business data to build new apps and uncover unique insights.
    
+   Distributed Tables  
    CitusData scales Postgres by distributing data & queries. 
    

## What is a proxy? Why is Nginx called a reverse proxy? 

A **forward proxy** is a server that sits between a group of client machines and the internet.

A **reverse proxy** sits between the internet and the web servers. It intercepts the requests from clients and talks to the web server on behalf of the clients.

## Do you know why Meta, Google, and Amazon all stop using leap seconds?


![a close up of a graph](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F90265322-3389-4a5b-bc7e-76843bc58ee0_1317x1536.jpeg "a close up of a graph")


Every few years, there is a special phenomenon that the second after “23:59:59” is not “00:00:00” but “23:59:60”. It is called leap second, which could easily cause time-processing bugs if not handled carefully.

Do we always need to handle leap seconds? It depends on which time representation is used. Commonly used time representations include UTC, GMT, TAI, Unix Timestamp, Epoc time, TrueTime, and GPS time. 

## Twitter architecture

Since everyone is talking about Twitter. Let’s take a quick look at what Twitter architecture looked like in 2012. This article is based on the tech talk given by a Twitter engineer. I redrew the diagram as the original diagram is difficult to read.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd2de632f-334a-4276-a5e8-65bdce975444_1280x1737.jpeg)

