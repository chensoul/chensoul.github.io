This week’s system design refresher:

+   Top 5 Uses of Redis (Youtube video)
    
+   Common load-balancing algorithms
    
+   Types of VPNs
    
+   Possible experiment platform architecture
    

## Top 5 Uses of Redis

Most people think Redis is just for caching.

But Redis can do so much more than that. It is good for:

+   Session store
    
+   Distributed lock
    
+   Counter
    
+   Rate limiter
    
+   Ranking/leaderboard
    
+   etc.
    

In this video, we get insights into how Redis solves interesting scalability challenges and learn why it is a great tool to know well in our system design toolset.

## What are the common load-balancing algorithms?

The diagram below shows 6 common algorithms.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F12dffcce-f231-48cc-915f-d53c0f8bce0c_3735x3573.jpeg)



+   **Static Algorithms**
    
    1.  Round robin  
        The client requests are sent to different service instances in sequential order. The services are usually required to be stateless.
        
    2.  Sticky round-robin  
        This is an improvement of the round-robin algorithm. If Alice’s first request goes to service A, the following requests go to service A as well.
        
    3.  Weighted round-robin  
        The admin can specify the weight for each service. The ones with a higher weight handle more requests than others.
        
    4.  Hash  
        This algorithm applies a hash function on the incoming requests’ IP or URL. The requests are routed to relevant instances based on the hash function result.
        

+   **Dynamic Algorithms**
    
    5.  Least connections  
        A new request is sent to the service instance with the least concurrent connections.
        
    6.  Least response time  
        A new request is sent to the service instance with the fastest response time.
        

👉 Over to you:

1.  Which algorithm is most popular?
    
2.  We can use other attributes for hashing algorithms. For example, HTTP header, request type, client type, etc. What attributes have you used?
    

## Types of VPNs

Think you know how VPNs work? Think again! 😳 It's so complex.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F217cec26-1f94-4a62-9f2c-f90f0c7885bf_1744x1268.jpeg "No alternative text description for this image")

## Possible experiment platform architecture

The architecture of a potential experiment platform is depicted in the diagram below. This content of the visual is from the book: "Trustworthy Online Controlled Experiments" (redrawn by me). The platform contains 4 high-level components.



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd79ea50e-e386-41c9-9f66-e28006ed1115_1677x1536.jpeg "diagram")



+   Experiment definition, setup, and management via a UI. They are stored in the experiment system configuration.
    
+   Experiment deployment to both the server and client-side (covers variant assignment and parameterization as well).
    
+   Experiment instrumentation.
    
+   Experiment analysis.
    

The book's author [Ronny Kohavi](https://www.linkedin.com/in/ACoAAAABNUIB1C39xOocAMGFCDTznLomLSF4M-0) also teaches a live Zoom class on Accelerating Innovation with A/B Testing. The class focuses on concepts, culture, trust, limitations, and build vs. buy. You can learn more about it here: [https://lnkd.in/eFHVuAKq](https://lnkd.in/eFHVuAKq)