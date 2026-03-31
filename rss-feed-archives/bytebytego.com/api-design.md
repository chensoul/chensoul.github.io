In this three-part series, we talk about API design: 

1.  Why is the “API First” principle important for an organization?
    
2.  How do we design effective and safe APIs?
    
3.  What are the tools that can boost productivity?
    

APIs are a set of protocols that define how system components interact with each other. As architectural styles evolve, APIs have gained prominence in recent years. The diagram below shows how the rise of microservices and cloud-native applications brings further granularity to services. In-process calls in monolithic applications transition to inter-process calls in microservice and serverless applications. Additionally, each process might reside on a different physical server, and service calls can fail due to various network issues.

Increased service complexity emphasizes the need for more disciplined API designs.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5e7db07-a20d-4958-b8be-40748addc5e7_1600x936.png)



## API First

Over the past decade, “API First” has emerged as a popular software development model. It prioritizes API design before system design. Various functional teams and systems use APIs as a shared communication language. For example, frontend developers, backend developers, and QA teams work together to design APIs based on system requirements. These APIs serve as specifications for business requirements and system designs. Each team then works independently, and they reconvene during the dev testing phase. 

The diagram below compares the “Code First” and “API First” approaches. In the “Code First” model, APIs are byproducts of system designs, often referred to as “documentation”. The "API First" model begins with API specifications and concludes with API-driven tests, making APIs the driving force behind the entire software development cycle.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faad520f5-00d9-4606-af4b-fdb5d1ac63c4_1600x1483.png)



"API First" offers several advantages:

1.  Improved system integration. “API First” encourages developers to carefully consider system interactions from the project’s outset, reducing the need for ongoing modifications during development.
    
2.  Enhanced collaboration and quality. APIs serve as a shared specification within the organization, allowing developers, testers, and DevOps to work independently. Agreeing on APIs at the project’s beginning helps eliminate uncertainties and boost software quality. 
    
3.  Increased scalability. With defined interfaces for each service, scaling becomes more manageable by spinning up new instances and adjusting load balancer settings.
    

In addition to efficiency and transparency, the API-first design also fosters network effects. 

In 2002, Jeff Bezos issued the famous API mandate, an early version of “API First”. As a result, systems within the organization became Lego-like building blocks, creating an open ecosystem. The value of this ecosystem grows as more participants leverage APIs to develop new products or services, leading to network effects. Amazon Web Services (AWS), for example, has since become a significant revenue source for the company.

It is quite visionary to mandate that all systems be designed with scalability and flexibility in mind. As a result, the company can adapt swiftly to changing business conditions.

[

![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78049284-2278-4d4b-b0ec-2a7734e6124a_1600x714.png)



## API Architectural Styles

Different API architectural styles use different communication protocols and data formats.

An overview of common styles is shown in the diagram below.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd03a2351-962d-4199-a035-2c09c8ff12f4_1310x1600.png)

