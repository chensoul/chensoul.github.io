In today's world of complex, web-scale application backends made up of many microservices and components running across clusters of servers and containers, managing and coordinating all these pieces is incredibly challenging.

That's where Kubernetes comes in. Kubernetes (also known as "k8s") is an open-source container orchestration platform that automates deployment, scaling, and management of containerized applications.

With Kubernetes, you don't have to worry about manually placing containers or restarting failed ones. You simply describe your desired application architecture and Kubernetes makes it happen and keeps it running.

In this two-part series, we'll dive deep into Kubernetes and cover:

+   Key concepts like pods, controllers, and services
    
+   The components that make up a Kubernetes cluster
    
+   When and why Kubernetes is useful for your applications
    
+   Tradeoffs to consider before adopting Kubernetes
    

We'll demystify Kubernetes and equip you with everything you need to determine if and when Kubernetes could be the right solution for your applications. You'll walk away with a clear understanding of what Kubernetes is, how it works, and how to put it into practice.

Whether you're a developer, ops engineer, or technology leader, you'll find invaluable insights in this deep dive into Kubernetes. Let's get started!

## Brief History

Kubernetes can be traced back to Google's internal container orchestration system, Borg, which managed the deployment of thousands of applications within Google. Containers are a method of packaging and isolating applications into standardized units that can be easily moved between environments. Unlike traditional virtual machines (VMs) which virtualize an entire operating system, containers only virtualize the application layer, making them more lightweight, portable and efficient.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd5f41f2e-a45f-4c9b-aee9-abf3cf162f10_1600x1230.png)



In 2014, Google open-sourced a container orchestration system based on its learnings from Borg. This is Kubernetes. Kubernetes provides automated deployment, scaling and management of containerized applications. By leveraging containers rather than VMs, Kubernetes provides benefits like increased resource efficiency, faster deployment of applications, and portability across on-prem and cloud environments.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9a0c4372-c98d-4a30-ac1e-9501225a2743_1108x1048.png)



Source: Large-scale cluster management at Google with Borg

Why is it also called k8s? This is a somewhat nerdy way of abbreviating long words. The number 8 in k8s refers to the 8 letters between the first letter “k” and the last letter “s” in the word Kubernetes.

## Kubernetes Architecture and Key Components

At its core, Kubernetes follows a client-server architecture. There are two core pieces in a Kubernetes cluster - control plane and worker nodes.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba911771-fd74-4e91-9947-de943daa465f_1230x1600.png)



The control plane is responsible for managing the state of the cluster. In production environments, the control plane usually runs on multiple nodes that span across several data center zones.

In other words, the control plane manages worker nodes and the containers running on them.

The containerized applications run in a Pod. Pods are the smallest deployable units in Kubernetes. A pod hosts one or more containers and provides shared storage and networking for those containers. Pods are created and managed by the Kubernetes control plane. They are the basic building blocks of Kubernetes applications.

Let’s dive deeper into the main pieces.

### Kubernetes Control Plane

The control plane is the brain of Kubernetes. It consists of various components that, together, make global decisions about the cluster. The control plane components run on multiple servers across availability zones to provide high availability.

The key components are:

+   Kubernetes API Server
    
+   Etcd
    
+   Kubernetes Scheduler
    
+   Kubernetes Controller Manager
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F10366307-9adb-48db-a34d-01791e004c06_1600x1111.png)

