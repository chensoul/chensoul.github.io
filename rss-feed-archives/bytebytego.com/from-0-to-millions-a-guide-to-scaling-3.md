In the first two parts of this series, we explored the traditional approach to building and scaling an application. It started with a single server that ran everything, and gradually evolved to a microservice architecture that could support millions of daily active users.

In the final two parts of this series, we examine the impact of recent trends like cloud and serverless computing, along with the proliferation of client application frameworks and the associated developer ecosystem. We explore how these trends alter the way we build applications, especially for early-stage startups where time-to-market is critical, and provide valuable insights on how to incorporate these modern approaches when creating your next big hit.

## **Recent Trends**

Let’s start by briefly explaining these computing trends we mentioned.

The first trend is **cloud computing**. Cloud computing, in its most basic form, is running applications on computing resources managed by cloud providers. When using cloud computing, we do not have to purchase or manage hardware ourselves.

The second trend is **serverless computing**. Serverless computing builds on the convenience of cloud computing with even more automation. It enables developers to build and run applications without having to provision cloud servers. The serverless provider handles the infrastructure and automatically scales the computing resources up or down as needed. This provides a great developer experience since developers can focus on the application code itself, without having to worry about scaling.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F612e00aa-6ce3-46bc-8383-563bc53a750e_1600x691.png)



The third trend rides on the waves of the first two. It is the proliferation of the **client application frameworks and the frontend hosting platforms** that make deploying these frontend applications effortless.

## **Modern Frontend Frameworks and Hosting Platforms**

Let’s investigate the third trend a bit more.

In recent years, there has been a significant shift in the way web applications are built. Many of today’s popular applications are what is called a Single Page Application (SPA).

A SPA provides a more seamless user experience by dynamically updating the current page instead of loading a new one each time the user interacts with the application. In a SPA, the initial HTML and its resources are loaded once, and subsequent interactions with the application are handled using JavaScript to manipulate the existing page content.

The traditional way of building web applications, like the one we discussed previously for our e-commerce company Llama, involved serving up new HTML pages from the server every time the user clicked on a link or submitted a form. This conventional model is referred to as a Multi-Page Application (MPA). Each page request typically involves a full page refresh, which could be slow and sometimes disruptive to the user experience.

In contrast, a SPA loads the application's initial HTML frame and then makes requests to the server for data as needed. This approach allows for more efficient use of server resources. The server is not constantly sending full HTML pages and can focus on serving data via a well-defined API instead.

Another benefit of the API-centric approach of a SPA is that the same API is often shared with mobile applications, making the backend easier to maintain.

SPAs are often built using JavaScript frameworks like React. These tools provide a set of abstractions and tools for building complex applications that are optimized for performance and maintainability. In contrast, building an MPA requires a more server-centric approach, which can be more challenging to scale and maintain as the application grows in complexity.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F938d190b-9029-40c5-b9cf-2e7af989c379_1600x709.png)



The rise in popularity of these client frameworks brought a wide array of production-grade frontend hosting platforms to the market. Some popular examples include Netify and Vercel. Major cloud providers have similar offerings.

These hosting platforms handle the complexity of building and deploying modern frontend applications at scale. Developers check their code into a repo, and the hosting platforms take over from there. They automatically build the web application bundle and its associated resources and distribute them to the CDN.

Since these hosting platforms are built on the cloud and serverless computing foundation, using best practices like serving data at the edge close to the user, they offer practically infinite scale, and there is no infrastructure to manage.

This is what the modern frontend landscape looks like. The frontend application is built with a modern framework like React. The client application is served by a production-grade hosting platform for scale, and it dynamically fetches data from the backend via a well-defined API.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbd388e37-2941-480f-b31c-6233218911fa_1600x588.png)



## **Modern Backend Options**

As mentioned in the previous section, the role of a modern backend is to serve a set of well-defined APIs to support the frontend web and mobile applications.

What are the modern options for building a backend? The shift is similarly dramatic.

Let’s see what a small, resource-constrained startup should use to build its backend, and see how far such a backend could scale.

When time-to-market is critical and resources are limited, a startup should offload as much non-core work as possible. Serverless computing options are attractive, for the following reasons:

+   Serverless computing manages the operational aspects of the backend, such as scaling, redundancy, and failover, freeing the startup team from managing infrastructure.
    
+   Serverless computing follows a cost-effective pay-per-use pricing model. There is no up-front commitment.
    
+   Serverless computing allows developers to focus on writing code and testing the backend without worrying about managing servers, leading to shorter time to market.