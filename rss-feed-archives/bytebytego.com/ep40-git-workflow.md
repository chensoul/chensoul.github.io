This week’s system design refresher:

+   CAP Theorem (Youtube video)
    
+   How Git works
    
+   Redis use cases
    
+   Linux commands
    

## What 50,000 incidents reveal about the state of incident management (Sponsored)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F433157ed-d8a7-403f-b8ce-94c764b14353_2392x1262.png)



Jump into the industry’s first Incident Benchmark Report and uncover the patterns and trends that can help you level up how you manage and learn from incidents at your organization.

Discover insights that will give you a blueprint for evaluating your incident management program, like:

\- What behaviors make a notable difference in MTTR,

\- What days and times incidents most often occur,

\- How long the average response effort takes by severity level,

\- The best responder team size, and more.

[Explore the report](http://bit.ly/3IvOER7)

## What is the CAP theorem? How useful is it to system design?

## How does Git Work?

The diagram below shows the Git workflow.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd47de46b-2c7b-43d2-8a9a-a2ebb7600347_1324x2004.jpeg)



Git is a distributed version control system. Every developer maintains a local copy of the main repository and edits and commits to the local copy. The commit is very fast because the operation doesn’t interact with the remote repository. If the remote repository crashes, the files can be recovered from the local repositories.

## How can Redis be used?

There is more to Redis than just caching.  
.  
Redis can be used in a variety of scenarios as shown in the diagram.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F0205d074-5f42-402b-b150-99027cb4fc38_800x1114.jpeg "No alternative text description for this image")



+   **Session**  
    We can use Redis to share user session data among different services.
    
+   **Cache**  
    We can use Redis to cache objects or pages, especially for hotspot data.
    
+   **Distributed lock**  
    We can use a Redis string to acquire locks among distributed services.
    
+   **Counter**  
    We can count how many likes or how many reads for articles.
    
+   **Rate limiter**  
    We can apply a rate limiter for certain user IPs.
    
+   **Global ID generator**  
    We can use Redis Int for global ID.
    
+   **Shopping cart**  
    We can use Redis Hash to represent key-value pairs in a shopping cart.
    
+   **Calculate user retention**  
    We can use Bitmap to represent the user login daily and calculate user retention.
    
+   **Message queue**  
    We can use List for a message queue.
    
+   **Ranking**  
    We can use ZSet to sort the articles.
    

## Linux commands illustrated on one page!

Take a look at how many you know [here](https://xmind.app/m/WwtB/) :)



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fafc1347c-86f9-431a-9c95-4d91be2dab89_1929x1536.jpeg "No alternative text description for this image")



+   Controlling processes: kill, killall, nice
    
+   Scheduling jobs: sleep, watch, crontab
    
+   Host location: host, whois, ping, traceroute
    
+   Network connections: ssh, telnet, scp, ftp
    
+   Screen output: echo, printf, seq, clear
    
+   Viewing Processes: ps, uptime, top, free
    
+   And many more
    

## **Featured job openings**

**HEIR**: [Senior Software Engineer, Full Stack](https://substack.com/redirect/f11d4bfb-728f-48e4-ac77-0bc4c4686c14?j=eyJ1IjoiMWxyMnJiIn0.3gL4cFwDHqFL_VcXxR7HzMwPYkuu_RpwPuz8o-oe3gw) (United States)