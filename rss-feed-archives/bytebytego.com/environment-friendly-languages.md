In this newsletter, we’ll cover the following topics:

+   Resiliency patterns
    
+   Environment-friendly languages
    
+   Designing a permission system
    
+   Back-of-the-envelope estimation
    
+   Ways to generate distributed unique ID
    

## The AI event of the year is quickly approaching (sponsored)


![Image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F0b398aa5-0469-4b79-a5af-1b522a4efde7_800x360.png "Image")


We’re talking about TransfromX, a free virtual conference where you’ll hear from 120+ technology leaders from companies like Google, Meta, OpenAI, DeepMind, Amazon, and many more 

The best part, it’s ***FREE***. 

On Oct. 19 - 21st, TransformX by Scale AI will explore how AI will power eCommerce, AI applications for healthcare, NFT marketplaces, and more. Explore 80 sessions including fireside chats, hands-on workshops, and keynotes.

We even have a special offer for ByteByteGo subscribers. Be one of the first 50 to register and get a FREE TransformX tee! We’ll send you an email once you do.  

[Save your seat and get your tee!](https://bit.ly/3RU2C14)

## Resiliency Patterns

Have you noticed that the largest incidents are usually caused by something very small?


![a close up of text and logo over a white background](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdf8cb20b-4670-4972-9d0e-bb28d166d796_1950x1322.jpeg "a close up of text and logo over a white background")


A minor error starts the snowball effect that keeps building up. Suddenly, everything is down.

Here are 8 cloud design patterns to reduce the damage done by failures.

+   Timeout
    
+   Retry
    
+   Circuit breaker
    
+   Rate limiting
    
+   Load shedding
    
+   Bulkhead
    
+   Back pressure
    
+   Let it crash
    

These patterns are usually not used alone. To apply them effectively, we need to understand why we need them, how they work, and their limitations.

## 𝐖𝐡𝐚𝐭 𝐀𝐫𝐞 𝐭𝐡𝐞 𝐆𝐫𝐞𝐞𝐧𝐞𝐬𝐭 𝐏𝐫𝐨𝐠𝐫𝐚𝐦𝐦𝐢𝐧𝐠 𝐋𝐚𝐧𝐠𝐮𝐚𝐠𝐞𝐬?

The study below runs 10 benchmark problems in 28 languages \[1\]. It measures the runtime, memory usage, and energy consumption of each language. This take might be controversial.


![a close up of a text](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fbf797b78-dd49-440b-a493-38688e6dbb9f_448x1226.jpeg "a close up of a text")


“This paper presents a study of the runtime, memory usage, and energy consumption of twenty-seven well-known software languages. We monitor the performance of such languages using ten different programming problems, expressed in each of the languages. Our results show interesting findings, such as slower/faster languages consuming less/more energy, and how memory usage influences energy consumption. We show how to use our results to provide software engineers support to decide which language to use when energy efficiency is a concern”. \[2\]

\[1\] [https://lnkd.in/eYpvP3Dt](https://lnkd.in/eYpvP3Dt)  
\[2\] [https://lnkd.in/eczQYnHD](https://lnkd.in/eczQYnHD)

## How do we design a permission system?

The diagram below lists 5 common ways. 👇


![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F6f8d76a1-634e-4dc0-ad4f-74bf83354769_1280x2139.jpeg "diagram")


1.  ACL (Access Control List)  
    ACL is a list of rules that specifies which users are granted or denied access to a particular resource.
    
    Pros - Easy to understand.  
    Cons - error-prone, maintenance cost is high
    
2.  DAC (Discretionary Access Control)  
    This is based on ACL. It grants or restricts object access via an access policy determined by an object's owner group.
    
    Pros - Easy and flexible. Linux file system supports DAC.  
    Cons - Scattered permission control, too much power for the object’s owner group.
    
3.  MAC (Mandatory Access Control)  
    Both resource owners and resources have classification labels. Different labels are granted with different permissions.  
    Pros - strict and straightforward.  
    Cons - not flexible.
    
4.  ABAC (Attribute-based access control)  
    Evaluate permissions based on attributes of the Resource owner, Action, Resource, and Environment.  
    Pros - flexible   
    Cons - the rules can be complicated, and the implementation is hard. It is not commonly used.
    
5.  RBAC (Role-based Access Control)  
    Evaluate permissions based on roles  
    Pros - flexible in assigning roles.
    

## Back-Of-The-Envelope Estimation / Capacity Planning

## Org charts comic

by Manu Cornet


![No alt text provided for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F14595968-8118-40ea-9512-7aa718592c56_980x955.jpeg "No alt text provided for this image")


According to Wikipedia, the drawing appeared in The New York Times, and Microsoft CEO Satya Nadella cited that it was what persuaded him to change Microsoft's culture.

Link to the drawing: [https://lnkd.in/eh7RiMKa](https://lnkd.in/eh7RiMKa)

The drawing was published in 2011. More than 10 years have passed. How relevant is this now?

## Five ways to generate distributed unique ID

How do we generate unique IDs in distributed systems? How do we avoid ID conflicts?

The diagram below shows 5 ways. 👇


![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F28b8e562-3edf-462e-a830-4edb1337e0e0_1280x1637.jpeg "diagram")


Assume the design requirements of distributed unique ID are:

1.  Globally unique.
    
2.  Availability. The ID generator must be available under high concurrency.
    
3.  Ordered. The IDs are sorted by certain rules. For example, sorted by time.
    
4.  Distributed. The ID generator doesn’t rely on a centralized service.
    
5.  Security. Depending on the use case, some IDs cannot be just incremental integers, which might expose sensitive information. For example, people might guess the total user number correctly by looking at the sequence IDs. 
    

**Thanks for making it this far!**

If you want to learn more about System Design, check out our books:


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F33dfebd6-c958-4576-beb8-3a064a2611ad_352x257.png)


[Paperback edition](https://substack.com/redirect/899de8ae-7b2d-4dda-aac9-519f02353405?r=1lr2rb)

[Digital editio](https://substack.com/redirect/52740a33-7232-4191-93cf-dd0d01644609?r=1lr2rb)n