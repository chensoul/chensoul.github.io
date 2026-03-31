This week’s system design refresher:

+   Stack Overflow's Architecture: A Very Interesting Case Study (Youtube video)
    
+   What is a webhook
    
+   8 Key OOP Concepts Every Developer Should Know
    
+   Shipping code to production and ensuring code quality
    
+   Developer Roadmaps
    
+   ByteByteGo is looking for guest posts
    

## Stack Overflow's Architecture: A Very Interesting Case Study

## What is a webhook?

The diagram below shows a comparison between polling and webhook.



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F70011917-41b3-470f-b888-96e8dda5bb1a_1441x1536.jpeg "diagram")



Assume we run an eCommerce website. The clients send orders to the order service via the API gateway, which goes to the payment service for payment transactions. The payment service then talks to an external payment service provider (PSP) to complete the transactions.

There are two ways to handle communications with the external PSP.

+   1\. Short polling  
    After sending the payment request to the PSP, the payment service keeps asking the PSP about the payment status. After several rounds, the PSP finally returns with the status.
    
    Short polling has two drawbacks:  
    1) Constant polling of the status requires resources from the payment service.  
    2) The External service communicates directly with the payment service, creating security vulnerabilities.
    
+   2\. Webhook  
    We can register a webhook with the external service. It means: call me back at a certain URL when you have updates on the request. When the PSP has completed the processing, it will invoke the HTTP request to update the payment status.
    
    In this way, the programming paradigm is changed, and the payment service doesn’t need to waste resources to poll the payment status anymore.
    

What if the PSP never calls back? We can set up a housekeeping job to check payment status every hour.

Webhooks are often referred to as reverse APIs or push APIs because the server sends HTTP requests to the client. We need to pay attention to 3 things when using a webhook:

1.  We need to design a proper API for the external service to call.
    
2.  We need to set up proper rules in the API gateway for security reasons.
    
3.  We need to register the correct URL at the external service.
    

## 8 Key OOP Concepts Every Developer Should Know

Object-Oriented Programming (OOP) has been around since the 1960s, but it really took off in the 1990s with languages like Java and C++.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F626c1cf7-9bc4-44d1-a839-365ccab6a40f_1280x1685.jpeg "No alternative text description for this image")



Why is OOP Important? OOP allows you to create blueprints (called classes) for digital objects, and these objects know how to communicate with one another to make amazing things happen in your software. Having a well-organized toolbox rather than a jumbled drawer of tools makes your code tidier and easier to change.

In order to get to grips with OOP, think of it as creating digital Lego blocks that can be combined in countless ways. Take a book or watch some tutorials, and then practice writing code - there's no better way to learn than to practice!

Don't be afraid of OOP - it's a powerful tool in your coder's toolbox, and with some practice, you'll be able to develop everything from nifty apps to digital skyscrapers!

## What tools does your team use to ship code to production and ensure code quality?

The approach generally depends on the size of the company. There is no one-size-fits-all solution, but we try to provide a general overview.



![table](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F79b7490e-9f4a-4312-af89-eb0bed83ac6e_1280x1789.jpeg "table")



1-10 employees: In the early stages of a company, the focus is on finding a product-market fit. The emphasis is primarily on delivery and experimentation. Utilizing existing free or low-cost tools, developers handle testing and deployment. They also pay close attention to customer feedback and reports.

10-100 employees: Once the product-market fit is found, companies strive to scale. They are able to invest more in quality for critical functionalities and can create rapid evolution processes, such as scheduled deployments and testing procedures. Companies also proactively establish customer support processes to handle customer issues and provide proactive alerts.

100-1,000 employees: When a company's go-to-market strategy proves successful, and the product scales and grows rapidly, it starts to optimize its engineering efficiency. More commercial tools can be purchased, such as Atlassian products. A certain level of standardization across tools is introduced, and automation comes into play.

1,000-10,000+ employees: Large tech companies build experimental tooling and automation to ensure quality and gather customer feedback at scale. Netflix, for example, is well known for its "Test in Production" strategy, which conducts everything through experiments.

Over to you: Every company is unique. What stage is your company currently at, and what tools do you use?

## Developer Roadmaps

I came across this website recently and thought it could be helpful.



![graphical user interface, text, application](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fad310090-dbf0-4aef-ae71-c76470913a9e_800x420.jpeg "graphical user interface, text, application")



Link: [roadmap.sh](http://roadmap.sh/)

It is a community effort to create roadmaps, guides, and other educational content to help guide developers in picking up a path and guide their learnings.

## ByteByteGo is looking for guest posts/authors

I’m looking for guest posts/authors for ByteByteGo's social media or newsletter (> 1.5 million audiences).

ByteByteGo's social media channels reach an extensive audience of over 1.5 million individuals worldwide.

Qualifications:

+   The ideal person will have read and heard enough of our content and can explain complex technical topics with simple illustrations.
    
+   Proficient research skills in a subject you are knowledgeable about.
    
+   Ability to cover topics that appeal to a wide audience. This is important.
    

Submit your pitch **[here](https://lnkd.in/eKnPzc24).**