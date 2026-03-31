Serverless computing refers to the paradigm of building and running applications without managing the underlying servers. With serverless, the cloud provider abstracts away the servers, runtimes, scaling, and capacity planning from the developer. The developer focuses on the application code and business logic, while the cloud provider handles provisioning servers, auto-scaling, monitoring, etc., under the hood. Over the past decade, this “no-ops” approach has greatly simplified deploying cloud-native applications.

The term “serverless” is misleading since servers are still involved. But from the developer’s perspective, there are no visible servers to manage. The cloud provider handles the servers, operating systems, and runtimes. This model allows developers to deploy event-driven, auto-scaling functions and APIs without worrying about the infrastructure.

Some key enablers of serverless computing include FaaS (Functions-as-a-Service), BaaS (Backend-as-a-Service), containers, microservices, and auto-scaling. This newsletter will dive deeper into serverless concepts, architecture, user cases, limitations, and more.

## The Evolution of Serverless

Serverless computing gained prominence around 2014 with the release of AWS Lambda. It allowed developers to run event-driven applications without having to provision backend servers. Functions would auto-scale based on load while AWS handled the infrastructure.

The release of Azure Functions and Google Cloud Functions further popularized this FaaS model.

With the rise of Docker and Kubernetes between 2013 and 2014, containerization and microservices made it easy to deploy serverless applications and accelerated the adoption of serverless computing.

In 2018, the Cloud Native Computing Foundation (CNCF) published the *Serverless Whitepaper 1.0.* The whitepaper positioned serverless as a new cloud-native approach compared to Containers-as-a-Service (CaaS) and Platform-as-a-Service (PaaS).

The table below lists some key benefits and drawbacks of each model. CaaS has full control over the infrastructure but requires more effort in monitoring, logging, and capacity management. PaaS facilitates easier application deployment and auto-scaling but doesn’t have container portability. Serverless has the lowest requirement for infrastructure management, with autoscaling, reduced ops, and pay-per-use billing as crucial benefits.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ffa22356d-00bf-4414-a377-7dc309742615_1600x801.png)



Today, serverless has become a popular option for startups to quickly build and iterate on applications for product-market fit. The benefits of adopting serverless computing include:

1.  Cost savings: With serverless computing, providers adopt a pay-as-you-go billing model based on usage. Developers only pay for the specific compute resources utilized when the functions run. There is no need to over-provision capacity upfront and pay for idle resources. This billing model enables efficient resource utilization and significant cost savings compared to provisioning servers or virtual machines with fixed capacity.
    
2.  Faster time-to-market: With serverless computing, developers don’t need to spend time on infrastructure management tasks like capacity planning. Developers can focus on writing code and business logic, allowing them to deploy applications quickly.
    
3.  Auto-scaling: Serverless applications can automatically scale up and down based on traffic patterns. Developers can initially provision minimal compute resources. As incoming requests increase, the platform automatically allocates more resources to handle the load. When traffic decreases, excess capacity is released.
    
4.  Expanding developer skills: Serverless computing abstracts away infrastructure and operational concerns by modularizing computation and storage into functions and services. It enables front-end developers to work on simple backend services as well.
    

Next, let’s look at the key concepts in serverless computing.

## FaaS and Event-Driven Architecture

The term “serverless” has two related but distinct meanings:

In a narrow sense, serverless refers specifically to FaaS. With FaaS, developers deploy auto-scaling function code without provisioning servers. The functions are executed on-demand based on event triggers.

FaaS functions are stateless and ephemeral. BaaS is combined with FaaS to provide API-based services maintained by the cloud provider and offer stateful capabilities like storage, databases, etc.

More broadly, serverless implies a “NoOps” approach where developers don’t manage any backend servers or infrastructure. This concept includes FaaS, BaaS, and other managed cloud services like databases, storage, etc.

In this sense, serverless means the servers are abstracted from the developer. The cloud provider handles all server provisioning, scaling, availability, etc. Developers just use the services through APIs and don’t operate the backend.

The diagram below explains the scope of the two types of serverless. 



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff01115ec-e7d8-48c3-ba00-24833eb63e97_1600x1053.png)



Functions and event triggers are two key components of cloud-native architecture. The diagram below shows their evolution.

The evolution of containers, PaaS, and microservices paved the way for the development of FaaS. The event-driven workflow defines the system as a predefined set of steps where we can embed business logic. The two architectural developments make serverless computing a popular choice.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9d3a4021-c46b-4076-81bd-cee2cc6adeb4_1600x937.png)



In the next section, we will review how FaaS works.

## FaaS

Unlike CaaS, FaaS handles the runtime environment so developers can focus solely on the function-based application logic. The diagram below illustrates how FaaS works differently from regular service processes.

With CaaS, we bundle dependencies into containers like Docker. We must manage the entire application context and runtime environment.

With FaaS, the cloud provider defines the runtime environment. We just code the function logic without worrying about dependencies or runtime management. When a function finishes executing, the runtime is destroyed along with the function. Functions interact via event triggers and scale automatically based on demand - new instances spin up to handle more requests and scale down when traffic decreases.

The key difference is that FaaS abstracts away runtime management and scaling, allowing developers to focus on writing code. We only pay for resources once a request triggers function execution. CaaS gives more control over dependencies and runtime but requires configuring and managing the environment



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0bd20d7b-c900-4115-866d-82d696deeba3_1600x886.png)



One of the main benefits of FaaS is enabling rapid scaling through fast cold starts compared to traditional servers. But how fast are FaaS cold starts in reality?