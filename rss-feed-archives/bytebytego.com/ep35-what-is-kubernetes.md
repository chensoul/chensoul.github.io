This week’s system design refresher:

+   RPC vs. gRPC (Youtube video)
    
+   Monolithic vs. Microservice Architecture
    
+   What is k8s
    
+   ChatGPT
    

## RPC vs. gRPC

A remote procedure call (RPC) enables one machine to invoke some code on another machine as if it is a local function call from a user’s perspective.

gRPC is an open-source remote procedure call framework created by Google in 2016. What makes gRPC so popular?

+   First, gRPC has a thriving developer ecosystem. The core of this ecosystem is the use of Protocol Buffers as its data interchange format.
    
+   The second reason why gRPC is so popular is that it is high-performance out of the box.
    

## What are the differences between monolithic and microservice architecture?

The diagram compares monolithic and microservice architecture in the ideal world.


![Image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F65f6ee2e-9538-478f-b08d-0c388c325d7a_3058x2002.jpeg "Image")


Suppose we have an eCommerce website that needs to handle the functions below:

+   User Management
    
+   Procurement Management
    
+   Order Management
    
+   Inventory Management
    
+   Payments
    
+   Logistics
    

In a monolithic architecture, all the components are deployed in one single instance. The service calls are within the same process, and no RPCs. The data tables relating to each component are usually deployed in the same database. 

In a microservice architecture, each component becomes a self-contained service, maintained by a specialized team. The boundaries between services are clearly defined. The user interface talks to multiple services to get a workflow done. This is suitable for scaling out the business when the business has substantial growth.

However, since there are many more instances to maintain, microservice architecture needs quite some investment in DevOps.

At one point, microservice architecture was the golden standard as almost every large tech company moved from monolithic to microservices. But now, companies started to rethink the pros and cons of microservices. Some of the most controversial definitions of microservices are the exclusive use of a database & making 1000+ RPCs within a single client request. 

## What is k8s (Kubernetes)

k8s is a container orchestration system. It is used for container deployment and management. Its design is greatly impacted by Google’s internal system Borg.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F879617e5-c870-4258-97b1-8dfac6e232e1_2796x3816.jpeg)


A k8s cluster consists of a set of worker machines, called nodes, that run containerized applications. Every cluster has at least one worker node. \[1\]

The worker node(s) host the Pods that are the components of the application workload. The control plane manages the worker nodes and the Pods in the cluster. In production environments, the control plane usually runs across multiple computers and a cluster usually runs multiple nodes, providing fault tolerance and high availability. \[1\]

+   **Control Plane Components**
    

1.  API ServerThe API server talks to all the components in the k8s cluster. All the operations on pods are executed by talking to the API server.
    
2.  SchedulerThe scheduler watches the workloads on pods and assigns loads on newly created pods.
    
3.  Controller ManagerThe controller manager runs the controllers, including Node Controller, Job Controller, EndpointSlice Controller, and ServiceAccount Controller.
    
4.  etcd etcd is a key-value store used as Kubernetes' backing store for all cluster data.
    

+   **Nodes**
    

1.  PodsA pod is a group of containers and is the smallest unit that k8s administers. Pods have a single IP address applied to every container within the pod.
    
2.  KubeletAn agent that runs on each node in the cluster. It ensures containers are running in a Pod. \[1\]
    
3.  Kube Proxykube-proxy is a network proxy that runs on each node in your cluster. It routes traffic coming into a node from the service. It forwards requests for work to the correct containers.
    

👉 Over to you: Do you know why Kubernetes is called “k8s”?

Reference \[1\]: kubernetes.io/docs/concepts/overview/components/

## ChatGPT

The ChatGPT is mind-blowing. It solves Leetcode hard in seconds. The code even contains nice comments.

Leetcode 10. Regular Expression Matching


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ff6c329bb-bf2d-4e1e-8e95-ac85b1988845_1030x1586.png)


## **Featured job openings**

**Openedges**: [Chief Architect](https://substack.com/redirect/3d86db30-072f-4850-9312-197a5be3569d?r=1lr2rb) (San Jose, Austin, Remote)