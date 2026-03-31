This week’s system design refresher:

+   Evolution of the Netflix API Architecture (YouTube video)
    
+   Microservice Best Practices
    
+   Code Review Pyramid
    
+   Kubernetes Periodic Table
    
+   10 Principles for Building Resilient Payment Systems by Shopify
    

## [👋 Goodbye low test coverage and slow QA cycles (Sponsored)](https://bit.ly/QAWolf_070823)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F712fae87-a3c6-407e-89b0-feb6b50ce674_2000x1500.png)



Whether you need 200 test cases or 2000, [QA Wolf](https://bit.ly/QAWolf_070823) will get your web app to 80% automated end-to-end test coverage in just 4 months. All they need is a product tour and access to an environment to get started.

QA Wolf will:

+   Build your tests in open-source Microsoft Playwright — you own the tests
    
+   [Run your entire test suite in 3 minutes](https://bit.ly/QAWolf_070823) as many times as you want, on their parallel testing infrastructure, at no additional cost
    
+   Maintain the tests for you 24 hours a day
    
+   Investigate all test failures and report only human-verified bugs
    
+   Integrate into your CI pipeline
    

Skeptical? Think your web app is too complex? QA Wolf offers a 90-day pilot so you can try them out. [Schedule a demo](https://bit.ly/QAWolf_070823) to get started.

[Learn more](https://bit.ly/QAWolf_070823)

## Evolution of the Netflix API Architecture

The Netflix API architecture went through 4 main stages.

+   Monolith
    
+   Direct access
    
+   Gateway aggregation layer
    
+   Federated gateway
    

We explain the evolution in a 4-minute video.

## 9 best practices for developing microservices



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd70accc4-62eb-4053-8e58-0f41b80d872d_1142x1280.jpeg)



When we develop microservices, we need to follow the following best practices:

1.  Use separate data storage for each microservice
    
2.  Keep code at a similar level of maturity
    
3.  Separate build for each microservice
    
4.  Assign each microservice with a single responsibility
    
5.  Deploy into containers
    
6.  Design stateless services
    
7.  Adopt domain-driven design
    
8.  Design micro frontend
    
9.  Orchestrating microservices
    

Over to you - what else should be included?

## The Code Review Pyramid

By [Gunnar Morling](https://www.linkedin.com/in/ACoAADk0a-gBumlYou5VPjjZZrbz5W644EI7wQI)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb2d048b6-b306-44a9-82e6-d43813e60e85_1280x1022.jpeg)



Over to you - Any other tips for effective code review?

## Kubernetes Periodic Table

A comprehensive visual guide that demystifies the key building blocks of this powerful container orchestration platform.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb4634e1b-09f0-4e8f-a8bb-7be58d2b1e8e_1280x875.jpeg)



This Kubernetes Periodic Table sheds light on the 120 crucial components that make up the Kubernetes ecosystem.

Whether you're a developer, system administrator, or cloud enthusiast, this handy resource will help you navigate the complex Kubernetes landscape.

Guest post by [Govardhana Miriyala Kannaiah](https://www.linkedin.com/in/govardhana-miriyala-kannaiah/)

## 10 principles for building resilient payment systems (by Shopify)

Shopify has some precious tips for building resilient payment systems.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F685c9f68-b1b9-46e1-8299-b0d409567342_1280x885.jpeg)



1.  Lower the timeouts, and let the service fail early  
    The default timeout is 60 seconds. Based on Shopify’s experiences, read timeout of 5 seconds and write timeout of 1 second are decent setups.
    
2.  Install circuit breaks  
    Shopify developed Semian to protect Net::HTTP, MySQL, Redis, and gRPC services with a circuit breaker in Ruby.
    
3.  Capacity management  
    If we have 50 requests arrive in our queue and it takes an average of 100 milliseconds to process a request, our throughput is 500 requests per second.
    
4.  Add monitoring and alerting  
    Google’s site reliability engineering (SRE) book lists four golden signals a user-facing system should be monitored for: latency, traffic, errors, and saturation.
    
5.  Implement structured logging  
    We store logs in a centralized place and make them easily searchable.
    
6.  Use idempotency keys  
    Use the Universally Unique Lexicographically Sortable Identifier (ULID) for these idempotency keys instead of a random version 4 UUID.
    
7.  Be consistent with reconciliation  
    Store the reconciliation breaks with Shopify’s financial partners in the database.
    
8.  Incorporate load testing  
    Shopify regularly simulates the large volume flash sales to get the benchmark results.
    
9.  Get on top of incident management  
    Each incident channel has 3 roles: Incident Manager on Call (IMOC), Support Response Manager (SRM), and service owners.
    
10.  Organize incident retrospectives  
    For each incident, 3 questions are asked at Shopify: What exactly happened? What incorrect assumptions did we hold about our systems? What we can do to prevent this from happening?
    

Reference:  
shopify.engineering/building-resilient-payment-systems