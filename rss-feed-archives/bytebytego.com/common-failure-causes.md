Designing distributed systems is hard. Without careful planning, numerous issues can arise quickly. It's vital to understand potential pitfalls to be resilient against unforeseen failures.

One of the most exciting books I've come across on this subject is "Understanding Distributed Systems." The author, [Roberto Vitillo](https://www.linkedin.com/in/ravitillo/), held positions as a Principal Engineer/Engineering Manager at Microsoft and later as a Principal Engineer at Amazon. The book is organized into five parts:

Part I: Communication

Part II: Coordination

Part III: Scalability

Part IV: Resiliency

Part V: Maintainability

I approached Roberto to see if he'd be willing to share a chapter with our newsletter subscribers, and he graciously agreed. I selected the "Common Failure Causes" chapter. In this excerpt, we discuss 8 common causes of failure and briefly overview how to address them.

For those interested in a deeper dive into other subjects, the e-book is available on [Roberto's website](https://understandingdistributed.systems/), and the printed version can be found on [Amazon](https://www.amazon.com/Understanding-Distributed-Systems-Second-applications/dp/1838430210/).

## Common failure causes 

We say that a system has a [failure](https://resources.sei.cmu.edu/asset_files/TechnicalReport/1992_005_001_16112.pdf) when it no longer provides a service to its users that meets its specification. A failure is caused by a fault: a failure of an internal component or an external dependency the system depends on. Some faults can be tolerated and have no user-visible impact at all, while others lead to failures.

To build fault-tolerant applications, we first need to have an idea of what can go wrong. In the next few sections, we will explore some of the most common root causes of failures. By the end of it, you will likely wonder how to tolerate all these different types of faults.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F318fa29d-c341-4329-b834-a11c3f98e50b_1600x444.png)



### Hardware faults

Any physical part of a machine can fail. HDDs, memory modules, power supplies, motherboards, SSDs, NICs, or CPUs, can all stop working for various reasons. In some cases, hardware faults can cause data corruption as well. If that wasn't enough, entire data centers can go down because of power cuts or natural disasters.

As we will discuss later, we can address many of these infrastructure faults with redundancy. You would think that these faults are the main cause for distributed applications failing, but in reality, they often fail for very mundane reasons.

### Incorrect error handling

A [study from 2014](https://www.usenix.org/system/files/conference/osdi14/osdi14-paper-yuan.pdf) of user-reported failures from five popular distributed data stores found that the majority of catastrophic failures were the result of incorrect handling of non-fatal errors.

In most cases, the bugs in the error handling could have been detected with simple tests. For example, some handlers completely ignored errors. Others caught an overly generic exception, like Exception in Java, and aborted the entire process for no good reason. And some other handlers were only partially implemented and even contained "FIXME" and "TODO" comments.

In hindsight, this is perhaps not too surprising, given that error handling tends to be an afterthought. This is the reason the Go language puts so much emphasis on error handling. We will take a closer look at best practices for testing large distributed applications.

### Configuration changes

Configuration changes are one of the leading root causes for [catastrophic failures](https://github.com/danluu/post-mortems#config-errors). It's not just misconfigurations that cause problems, but also valid configuration changes to enable rarely-used features that no longer work as expected (or never did).

What makes [configuration changes](https://www.usenix.org/system/files/conference/osdi16/osdi16-xu.pdf) particularly dangerous is that their effects can be delayed. If an application reads a configuration value only when it's actually needed, an invalid value might take effect only hours or days after it has changed and thus escape early detection.

This is why configuration changes should be version-controlled, tested, and released just like code changes, and their validation should happen preventively when the change happens. We will discuss safe release practices for code and configuration changes in the context of continuous deployments.

### Single points of failure

A single point of failure (SPOF) is a component whose failure brings the entire system down with it. In practice, systems can have multiple SPOFs.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6d4ed45f-cda9-4474-8caa-09c8c5a52ad2_1600x1416.png)



Humans make for great SPOFs, and if you put them in a position where they can cause a catastrophic failure on their own, you can bet they eventually will. For example, human failures often happen when someone needs to manually execute a series of operational steps in a specific order without making any mistakes. On the other hand, computers are great at executing instructions, which is why automation should be leveraged whenever possible.

Another common SPOF is [DNS](https://twitter.com/ahidalgosre/status/1315345619926609920?lang=en-GB). If clients can't resolve the domain name for an application, they won't be able to connect to it. There are many reasons why that can happen, ranging from [domain names expiring](https://techcrunch.com/2010/03/27/foursquare-offline), to entire root level domains [going down](https://hackernoon.com/stop-using-io-domain-names-for-production-traffic-b6aa17eeac20).

Similarly, the TLS certificate used by an application for its HTTP endpoints is also a [SPOF](https://www.theverge.com/2020/2/3/21120248/microsoft-teams-down-outage-certificate-issue-status). If the certificate expires, clients won't be able to open a secure connection with the application.

Ideally, SPOFs should be identified when the system is designed. The best way to detect them is to examine every system component and ask what would happen if it were to fail. Some SPOFs can be architected away, e.g., by introducing redundancy, while others can't. In that case, the only option left is to reduce the SPOF's blast radius, i.e., the damage the SPOF inflicts on the system when it fails. Many of the resiliency patterns we will discuss later reduce the blast radius of failures.

### Network faults

When a client sends a request to a server, it expects to receive a response from it a while later. In the best case, it receives the response shortly after sending the request. If that doesn't happen, the client has two options: continue to wait or fail the request with a time-out exception or error.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa975894e-db47-4760-8295-00bb2f6a4c0a_1600x1267.jpeg)



8 Fallacies of distributed computing