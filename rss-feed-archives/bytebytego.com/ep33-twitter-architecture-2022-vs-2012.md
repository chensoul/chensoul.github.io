This week’s system design refresher:

+   Twitter Architecture 2022
    
+   What is Single Sign-On? (Youtube video)
    
+   TCP/IP Encapsulation
    
+   Code First v.s. API First
    
+   The Ping command
    
+   API architectural styles
    
+   Join ByteByteGo Talent Collective
    

## Twitter Architecture 2022


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F29dc1402-909d-45dd-a65a-0049c8173ffc_3906x2214.jpeg)


[Read more here](https://twitter.com/alexxubyte/status/1594008281340530688)

## What is SSO, or Single Sign-On? 

## How is data sent over the network? Why do we need so many layers in the OSI model?

The diagram below shows how data is encapsulated and de-encapsulated when transmitting over the network.


![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fa08739cd-d73b-4dd9-85bb-41293c45696f_2048x1455.jpeg "No alternative text description for this image")


**Step 1:** When Device A sends data to Device B over the network via the HTTP protocol, it is first added an HTTP header at the application layer.

**Step 2:** Then a TCP or a UDP header is added to the data. It is encapsulated into TCP segments at the transport layer. The header contains the source port, destination port, and sequence number.

**Step 3:** The segments are then encapsulated with an IP header at the network layer. The IP header contains the source/destination IP addresses.

**Step 4:** The IP datagram is added a MAC header at the data link layer, with source/destination MAC addresses.

**Step 5:** The encapsulated frames are sent to the physical layer and sent over the network in binary bits.

**Steps 6-10:** When Device B receives the bits from the network, it performs the de-encapsulation process, which is a reverse processing of the encapsulation process. The headers are removed layer by layer, and eventually, Device B can read the data.

We need layers in the network model because each layer focuses on its own responsibilities. Each layer can rely on the headers for processing instructions and does not need to know the meaning of the data from the last layer.

## Code First v.s. API First - A change of software development philosophy

The diagram below shows the differences between code-first development and API-first development. Why do we want to consider API first design?


![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fa1d9ad71-024b-4f31-ad96-537e3be5f1b9_1527x1536.jpeg "No alternative text description for this image")


+   **Microservices increase system complexity.**
    
    We have separate services to serve different functions of the system. While this kind of architecture facilitates decoupling and segregation of duty, we need to handle the various communications among services. 
    
    It is better to think through the system's complexity before writing the code and carefully defining the boundaries of the services.
    
+   **Separate functional teams need to speak the same language.**
    
    The dedicated functional teams are only responsible for their own components and services. It is recommended that the organization speak the same language via API design. 
    
    We can mock requests and responses to validate the API design before writing code.
    
+   **Improve software quality and developer productivity**
    
    Since we have ironed out most of the uncertainties when the project starts, the overall development process is smoother, and the software quality is greatly improved.
    
    Developers are happy about the process as well because they can focus on functional development instead of negotiating sudden changes.
    
    The possibility of having surprises toward the end of the project lifecycle is reduced.
    

Because we have designed the API first, the tests can be designed while the code is being developed. In a way, we also have TDD (Test Driven Design) when using API first development.

## What happens when we “ping” a server?

The diagram below shows how the “ping” command works.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F8b42a771-5e92-4421-952e-d4556a8091bf_1460x1288.png)


The “ping” command runs on ICMP (Internet Control Message Protocol), which is a network layer protocol. 

There are 6 common types of messages in ICMP. For the ping command, we mainly use “echo request” and “echo reply”.

Host A sends an ICMP echo request (type = 8) with a sequence number 1. The request is encapsulated with an IP header to specify the source and destination IP addresses.

When host B receives the data, it sends back an ICMP echo reply (type = 0) with sequence number 1 to host A.

When host A receives the echo reply, it correlates the request and reply with the sequence number, and uses T1 and T2 to calculate the round trip time. That’s how we see the ping statistics.

## API architectural styles

Since RPC has become a hot topic, let's briefly review its history.

The diagram below illustrates the API timeline and API style comparison.


![Image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5904d59f-287c-41e1-958f-f79b46342abf_1200x1057.jpeg "Image")


Over time, different API styles are released. Each of them has its own patterns of standardizing data exchange.

## **Join ByteByteGo Talent Collective**

If you’re hiring, [join ByteByteGo Collective](https://substack.com/redirect/4027acc3-47ba-4091-a3cb-e9504a3ce866?r=1lr2rb) to start getting weekly drops of world-class hand-curated engineers who are open to new opportunities.


![Image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ff6ed1cfb-5a8e-4037-b7e6-62c65569e83e_1016x826.png "Image")


If you’re looking for a new job, join to get personalized opportunities from hand-selected companies. You can join publicly or anonymously, and leave anytime.

[Apply Now](https://substack.com/redirect/a47facdc-82f6-45c1-96a8-186606397c04?r=1lr2rb)

##  **Featured job openings**

**Openedges**: [Chief Architect](https://substack.com/redirect/4a0bab10-0d78-4505-b8d8-9285454bc3e0?r=1lr2rb) (San Jose, Austin, Remote)