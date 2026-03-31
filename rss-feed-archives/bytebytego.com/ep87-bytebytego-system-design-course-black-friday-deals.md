This week’s system design refresher:

+   ByteByteGo System Design Interview Course Black Friday Deal
    
+   Top 8 Most Popular Network Protocols Explained (Youtube video)
    
+   System design cheat sheet
    

##  [🆕 🆓 Free DORA metrics dashboard from LinearB (Sponsored)](https://bit.ly/LinearB_112523)


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7a3628be-e10e-4c1f-92be-1a45acfb6179_1088x853.png)


High-performing engineering teams love DORA metrics. But it’s not always simple to access up-to-date data—and it’s often expensive. 

Not anymore. LinearB is giving ByteByteGo subscribers early access to [free DORA metrics with no limitations on contributors, repos, or team size](https://bit.ly/LinearB_112523). Out of the box you’ll get a dashboard that includes:

✔️ All four DORA metrics — [Cycle Time, Deploy Frequency, CFR, MTTR](https://bit.ly/LinearB_112523) — based on your team’s data

✔️ Industry standard Benchmarks to help define team performance and set data-backed goals

✔️ [Additional leading metrics](https://bit.ly/LinearB_112523) including Merge Frequency and Pull Request Size (a great indicator of quality and efficiency)

[Get Your Free Metrics](https://bit.ly/LinearB_112523)

## 📚ByteByteGo System Design Course Black Friday Promo 📚


![Image preview](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdb1de033-e4b7-47c3-b4c2-f92b7dcfefc0_800x800.gif "Image preview")


The Black Friday sale is now up! Use code BF2023 at checkout for 30% off the system design interview online course. Ends Nov 26.  

It features content from two system design books.

We have already finished the first draft of Volume 3, and the content will be added early next year.

[Get it here](https://bit.ly/bytebytegoBF2023)

## **Top 8 Most Popular Network Protocols Explained**

## System design cheat sheet

We are often asked to design for high availability, high scalability, and high throughput. What do they mean exactly?  

The diagram below is a system design cheat sheet with common solutions.


![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_lossy/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc101ac74-8273-4550-8d40-7bb88d17a26b_1280x1664.gif "No alternative text description for this image")


1.  High Availability  
    This means we need to ensure a high agreed level of uptime. We often describe the design target as “3 nines” or “4 nines”. “4 nines”, 99.99% uptime, means the service can only be down 8.64 seconds per day.  
    
    To achieve high availability, we need to design redundancy in the system. There are several ways to do this:  
    
    \- Hot-hot: two instances receive the same input and send the output to the downstream service. In case one side is down, the other side can immediately take over. Since both sides send output to the downstream, the downstream system needs to dedupe.  
    
    \- Hot-warm: two instances receive the same input and only the hot side sends the output to the downstream service. In case the hot side is down, the warm side takes over and starts to send output to the downstream service.  
    
    \- Single-leader cluster: one leader instance receives data from the upstream system and replicates to other replicas.  
    
    \- Leaderless cluster: there is no leader in this type of cluster. Any write will get replicated to other instances. As long as the number of write instances plus the number of read instances are larger than the total number of instances, we should get valid data.
    
2.  High Throughput  
    This means the service needs to handle a high number of requests given a period of time. Commonly used metrics are QPS (query per second) or TPS (transaction per second).  
    
    To achieve high throughput, we often add caches to the architecture so that the request can return without hitting slower I/O devices like databases or disks. We can also increase the number of threads for computation-intensive tasks. However, adding too many threads can deteriorate the performance. We then need to identify the bottlenecks in the system and increase its throughput. Using asynchronous processing can often effectively isolate heavy-lifting components.
    
3.  High Scalability  
    This means a system can quickly and easily extend to accommodate more volume (horizontal scalability) or more functionalities (vertical scalability). Normally we watch the response time to decide if we need to scale the system.
    

Over to you: Do you have other things to share in your design toolbox?