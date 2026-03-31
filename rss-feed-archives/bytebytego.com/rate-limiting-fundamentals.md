Rate limiting is a popular distributed system pattern. It is an integral part of all modern large-scale applications. It controls the rate at which users or services can access a resource, like an API, a service, or a network. It plays a critical role in protecting system resources and ensuring fair use among all users.

In this series, we explore rate limiting in depth. We’ll discuss how rate limiting is used in modern applications and examine the popular rate limiting algorithms. We’ll dive into key design considerations and implementation strategies for production grade rate limiters. We’ll close with some real-world case studies and best practices.

Note: while we have discussed certain topics from the "Design a Rate Limiter" chapter in the System Design Interview Book - Volume 1, this newsletter series will primarily concentrate on the practical aspects of designing and implementing rate limiters in real-world scenarios.

## Rate Limiting Fundamentals

Rate limiting controls the rate at which users or services can access a resource. When the rate of requests exceeds the threshold defined by the rate limiter, the requests are throttled or blocked. Here are some examples:

+   A user can send a message no more than 2 per second
    
+   One can create a maximum of 10 accounts per day from the same IP address
    
+   One can claim rewards no more than 5 times per week from the same device
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1820f194-5338-426c-9fe1-374106b3a3f0_1536x1440.png)



## Benefits of Rate Limiting

Rate limiting is an integral part of modern large-scale applications. Let’s take a look at some of the benefits of a rate limiter. While we focus on API rate limiters here, the benefits are generally applicable to rate limiters deployed for other use cases.

### Prevent Resource Starvation

Rate limiting helps prevent resource starvation caused by Denial of Service (DoS) attacks. Almost all APIs published by large tech companies enforce some form of rate limiting. For example, Twitter limits the number of tweets to [300 per 3 hours](https://developer.twitter.com/en/docs/twitter-api/v1/rate-limits). Google docs APIs limit read requests to [300 per user per 60 seconds](https://developers.google.com/docs/api/limits). A rate limiter prevents DoS attacks, either intentional or unintentional, by rejecting the excess calls.

### Reduce cost

Rate limiting can help limit cost overruns by preventing the overuse of a resource. If a resource is overloaded by a high volume of requests, it may require additional resources or capacity to handle the load, which can incur additional costs.

Rate limiting is also critical for services that make outbound requests, especially those that use paid third party APIs. Many third-party services charge on a per-call basis for their external APIs. Some examples are services for checking credit, making a payment, retrieving health records, etc. Limiting the number of calls is essential to control costs.

### Prevent servers from being overloaded.

While rate limiting is vital in preventing DoS attacks, it also plays a pivotal role in general load balancing and service quality maintenance. High volumes of requests, not only from malicious sources but also from heavy usage, can overburden servers.

To reduce server load, a rate limiter is used to reject excess requests early in the request lifecycle made by malicious bots or users with heavy usage.

## Applications of Rate Limiting



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F61f39594-5594-484d-be9e-c2cb4d3973d9_1600x1050.png)



Rate limiting can be used in various situations to manage resources efficiently. When done right, it prevents abuse and ensures fair usage.

Rate limiting is commonly applied at the user level. Consider a popular social media platform where users frequently post content and comments. To prevent spam or malicious bot activity, the platform might enforce user-level rate limiting. It restricts the number of posts or comments that a user can make in a given hour.

Rate limiting can also be applied at the application level. One example is an online ticketing platform. On the day of a major concert sale, the platform can expect a significant surge in traffic. Application-level rate limit can be very useful in this case. It limits the total number of ticket purchases per minute. This practice protects the system from being overwhelmed and ensures a fair chance for everyone to try to secure a ticket.

API-level rate limiting is also common. Consider a cloud storage service that provides an API for uploading and downloading files. To ensure fair use and protect the system from misuse, the service might enforce limits on the number of API calls each user can make per minute.

Rate limiting can also be applied based on user account levels. A SaaS platform offering multiple tiers of service can have different usage limits for each tier.  Free tier users may have a lower rate limit compared to premium tier users. This effectively manages resource usage while encouraging users to upgrade to higher limits.

These are just a few examples. They demonstrate how rate limiting strategies can be deployed across different scenarios and services.

## Core Concepts of Rate Limiting

Most rate limiting implementations share three core concepts. They are the limit, the window, and the identifier.

The limit defines the ceiling for allowable requests or actions within a designated time span. For example, we might allow a user to send no more than 100 messages every hour.

The window is the time period where the limit comes into play. It could be any length of time, whether it be an hour, a day, or a week. Longer durations do have their own implementation challenges, like storage durability, that we’ll discuss later.

The identifier is a unique attribute that differentiates between individual callers. A user ID or IP address is a common example.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F93a29e07-da33-4e17-b506-daa2233ab573_1600x850.png)



Another core concept to understand is the different types of rate limiting responses. They generally fall into three categories: blocking, throttling, and shaping.

Blocking takes place when requests exceeding the limit are denied access to the resource. It is commonly expressed as an error message such as HTTP status code 429 (Too Many Requests).

Throttling, by comparison, involves slowinging down or delaying the requests that go beyond the limit. An example would be a video streaming service reducing the quality of the stream for users who have gone over their data cap.

Shaping, on the other hand, allows requests that surpass the limit. But those requests are assigned lower priority. This ensures that users who abide by the limits receive quality service. For example, in a content delivery network, requests from users who have crossed their limits may be processed last, while those from normal users are prioritized.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa4cfb699-19a0-43b7-9da0-02258b9010dd_1600x1342.png)



These basic core concepts lay the foundation for diving into the various common rate limiting algorithms.

## Common Rate Limiting Algorithms

Rate limiting can be implemented using different algorithms. Each of them has distinct pros and cons. We dive into some of the common rate limiting algorithms in this section. We’ll cover:

+   Fixed Window Counter
    
+   Sliding Window Log
    
+   Sliding Window Counter
    
+   Token Bucket
    
+   Leaky Bucket
    

## Fixed Window Counter

The Fixed Window Counter algorithm divides the timeline into fixed-size time windows and assigns a counter for each window. Each request increments the counter by some value based on the relative cost of the request. Once the counter reaches the threshold, subsequent requests are blocked until the new time window begins.

Let us use a concrete example to see how it works. In this example, the time unit is 1 second and the system allows a maximum of 3 requests per second. In each 1-second time window, if more than 3 requests are received, subsequent requests arriving within the same time window are dropped.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3dd68970-87d8-4136-a132-2575a5eb42f5_1600x798.png)

