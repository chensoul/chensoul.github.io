This week’s system design refresher:

+   CAP, BASE, SOLID, KISS, What do these acronyms mean?
    
+   Single Sign-On (SSO) explained in simple terms
    
+   Imperative Vs Functional Vs Object-oriented Programming
    
+   Data Pipelines Overview
    

## [2023 State of DevOps Report by Google Cloud and LinearB (Sponsored)](https://bit.ly/LinearB_111823)


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F91240b87-dd0f-45b0-a489-a2d897217e3b_960x540.png)


Are lofty DevOps ideals translating into better results for companies? Has AI begun to show an impact on software team productivity?

This 2023 [report](https://bit.ly/LinearB_111823) by the DevOps Research and Assessment (DORA) team at Google and LinearB collates [research from over 36,000 professionals worldwide](https://bit.ly/LinearB_111823), covering:

+   Key outcomes from DORA (including measures and benchmarks for high performers)
    
+   DORA metric performance across applications
    
+   Technical and cultural performance predictors
    
+   The impact of AI and cloud infrastructure
    

Now, you can get a [free copy of the full report](https://bit.ly/LinearB_111823). 

[Get Your Free Copy](https://bit.ly/LinearB_111823)

## CAP, BASE, SOLID, KISS, What do these acronyms mean?

The diagram below explains the common acronyms in system designs.


![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F691f370f-db47-4f18-a9ad-db3b8dacfe8e_1536x1536.gif "diagram")


+   CAP  
    CAP theorem states that any distributed data store can only provide two of the following three guarantees:  
    1\. Consistency - Every read receives the most recent write or an error.  
    2\. Availability - Every request receives a response.  
    3\. Partition tolerance - The system continues to operate in network faults.  
      
    However, this theorem was criticized for being too narrow for distributed systems, and we shouldn’t use it to categorize the databases. Network faults are guaranteed to happen in distributed systems, and we must deal with this in any distributed systems.  
      
    You can read more on this in “Please stop calling databases CP or AP” by Martin Kleppmann.
    
+   BASE  
    The ACID (Atomicity-Consistency-Isolation-Durability) model used in relational databases is too strict for NoSQL databases. The BASE principle offers more flexibility, choosing availability over consistency. It states that the states will eventually be consistent.
    
+   SOLID  
    SOLID principle is quite famous in OOP. There are 5 components to it.  
      
    1\. SRP (Single Responsibility Principle)  
    Each unit of code should have one responsibility.  
      
    2\. OCP (Open Close Principle)  
    Units of code should be open for extension but closed for modification.  
      
    3\. LSP (Liskov Substitution Principle)  
    A subclass should be able to be substituted by its base class.  
      
    4\. ISP (Interface Segregation Principle)  
    Expose multiple interfaces with specific responsibilities.  
      
    5\. DIP (Dependency Inversion Principle)  
    Use abstractions to decouple dependencies in the system.
    
+   KISS  
    "Keep it simple, stupid!" is a design principle first noted by the U.S. Navy in 1960. It states that most systems work best if they are kept simple.
    

Over to you: Have you invented any acronyms in your career?

## Latest articles

If you’re not a paid subscriber, here’s what you missed this month.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb1f932f9-0c1b-4bd5-8d50-dfafac1d5a45_3006x3453.jpeg)


1.  [Does Serverless Have Servers?](https://blog.bytebytego.com/p/serverless-has-servers)
    
2.  [A Crash Course in Docker](https://blog.bytebytego.com/p/a-crash-course-in-docker)
    
3.  [Shipping to Production](https://blog.bytebytego.com/p/shipping-to-production)
    
4.  [Kubernetes: When and How to Apply It](https://blog.bytebytego.com/p/kubernetes-when-and-how-to-apply)
    
5.  [A Crash Course in Kubernetes](https://blog.bytebytego.com/p/a-crash-course-in-kubernetes)
    

To receive all the full articles and support ByteByteGo, consider subscribing:

## Single Sign-On (SSO) explained in simple terms


![logo, company name](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff155cd04-94d2-45cd-9616-44be39c13f41_1280x1665.jpeg "logo, company name")


The concepts of SSO revolve around the three key players: the User, the Identity Provider (IDP), and the Application.

1.  The end-user or individual who seeks access to various applications.
    
2.  Identity Provider (IDP): An entity responsible for user authentication and verification. Common IDPs include Google, Facebook, and company-specific systems.
    
3.  Application: The software or service that the user wants to access. Applications rely on the IDP for user authentication. With SSO, users can seamlessly log in to various applications with a single set of credentials, enhancing convenience and security.
    

Single Sign-On (SSO) simplifies user access by enabling them to log in to multiple applications with a single set of credentials, enhancing the user experience and reducing password fatigue. It also centralizes security and access management, improving security, streamlining access control, and saving time and costs.  
  
Over to you: What's your perspective on the future of secure authentication in the digital realm?

## Imperative Vs Functional Vs Object-oriented Programming


![logo, company name](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fda60c496-7e6f-40bc-97fe-feff3a1a17a9_816x1054.gif "logo, company name")


In software development, different programming paradigms offer unique ways to structure code. Three main paradigms are Imperative, Functional, and Object-oriented programming, each with distinct approaches to problem-solving.

1.  Imperative Programming:  
    \- Works by changing program state through a sequence of commands.  
    \- Uses control structures like loops and conditional statements for execution flow.  
    \- Emphasizes on mutable data and explicit steps for task completion.  
    \- Examples: C, Python, and most procedural languages.
    
2.  Functional Programming:  
    \- Relies on pure functions, emphasizing computation without side effects.  
    \- Promotes immutability and the avoidance of mutable state.  
    \- Supports higher-order functions, recursion, and declarative programming.  
    \- Examples: Haskell, Lisp, Scala, and functional features in languages like JavaScript.
    
3.  Object-oriented Programming:  
    \- Focuses on modeling real-world entities as objects, containing data and methods.  
    \- Encourages concepts such as inheritance, encapsulation, and polymorphism.  
    \- Utilizes classes, objects, and interfaces to structure code.  
    \- Examples: Java, C++, Python, and Ruby.
    

Over to you: Which one resonates with your coding style? Ever had an 'aha' moment while using a particular paradigm? Share your perspective.

## Data Pipelines Overview


![No alt text provided for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3c37c6b0-0a34-4e4c-a125-1a3e5f763b65_755x982.gif "No alt text provided for this image")


Data pipelines are a fundamental component of managing and processing data efficiently within modern systems. These pipelines typically encompass 5 predominant phases: Collect, Ingest, Store, Compute, and Consume.

1.  Collect:  
    Data is acquired from data stores, data streams, and applications, sourced remotely from devices, applications, or business systems.
    
2.  Ingest:  
    During the ingestion process, data is loaded into systems and organized within event queues.
    
3.  Store:  
    Post ingestion, organized data is stored in data warehouses, data lakes, and data lakehouses, along with various systems like databases, ensuring post-ingestion storage.
    
4.  Compute:  
    Data undergoes aggregation, cleansing, and manipulation to conform to company standards, including tasks such as format conversion, data compression, and partitioning. This phase employs both batch and stream processing techniques.
    
5.  Consume:  
    Processed data is made available for consumption through analytics and visualization tools, operational data stores, decision engines, user-facing applications, dashboards, data science, machine learning services, business intelligence, and self-service analytics.
    

The efficiency and effectiveness of each phase contribute to the overall success of data-driven operations within an organization.

Over to you: What's your story with data-driven pipelines? How have they influenced your data management game?