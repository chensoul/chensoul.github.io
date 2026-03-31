This week’s system design refresher:

+   Git Merge vs. Rebase vs. Squash Commit (Youtube video)
    
+   OAuth 2.0 Explained With Simple Terms
    
+   Top 4 Forms of Authentication Mechanisms
    
+   Uber Tech Stack - CI/CD
    
+   Leadership Styles Around The World
    

## [Introducing New Relic Interactive Application Security Testing (IAST)(Sponsored)](https://bit.ly/NewRelic08122023)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccab241a-fcdf-49a6-b6fc-0e5db169aa0e_1208x738.png)



New Relic Interactive Application Security Testing (IAST) is now in public preview! Engineers, DevOps, and security teams can now find, fix, and verify high-risk vulnerabilities early and accurately to build more secure applications—and ship code faster.

[Get started for free](https://bit.ly/NewRelic08122023)

## Git Merge vs. Rebase vs. Squash Commit

## Oauth 2.0 Explained With Simple Terms

OAuth 2.0 is a powerful and secure framework that allows different applications to securely interact with each other on behalf of users without sharing sensitive credentials.



![No alt text provided for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fbb375f63-bf06-4956-b3a3-914fd6aa2d91_1280x1664.jpeg "No alt text provided for this image")



The entities involved in OAuth are the User, the Server, and the Identity Provider (IDP).

What Can an OAuth Token Do?

When you use OAuth, you get an OAuth token that represents your identity and permissions. This token can do a few important things:

Single Sign-On (SSO): With an OAuth token, you can log into multiple services or apps using just one login, making life easier and safer.

Authorization Across Systems: The OAuth token allows you to share your authorization or access rights across various systems, so you don't have to log in separately everywhere.

Accessing User Profile: Apps with an OAuth token can access certain parts of your user profile that you allow, but they won't see everything.

Remember, OAuth 2.0 is all about keeping you and your data safe while making your online experiences seamless and hassle-free across different applications and services.

Over to you: Imagine you have a magical power to grant one wish to OAuth 2.0. What would that be? Maybe your suggestions actually lead to OAuth 3.

## Latest articles

If you’re not a paid subscriber, here’s what you missed this month.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fca7183b3-95c7-4c19-b49e-c6830b5357ef_1424x1514.png)



1.  [Database Indexing Strategies - Part 2](https://blog.bytebytego.com/p/database-indexing-strategies-part)
    
2.  ["I Was Under Leveled!" — Avoiding the Tragedy of Making Only $500k a Year](https://blog.bytebytego.com/p/i-was-under-leveled-avoiding-the)
    
3.  [Network Protocols behind Server Push, Online Gaming, and Emails](https://blog.bytebytego.com/p/network-protocols-behind-server-push)
    
4.  [The Foundation of REST API: HTTP](https://blog.bytebytego.com/p/the-foundation-of-rest-api-http)
    
5.  [Database Indexing Strategies](https://blog.bytebytego.com/p/database-indexing-strategies)
    

To receive all the full articles and support ByteByteGo, consider subscribing:

## Top 4 Forms of Authentication Mechanisms



![diagram, map](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff0838daf-4a54-428c-a527-551f6a11c16b_1280x1700.jpeg "diagram, map")



1.  SSH Keys:  
    Cryptographic keys are used to access remote systems and servers securely
    
2.  OAuth Tokens:  
    Tokens that provide limited access to user data on third-party applications
    
3.  SSL Certificates:  
    Digital certificates ensure secure and encrypted communication between servers and clients
    
4.  Credentials:  
    User authentication information is used to verify and grant access to various systems and services
    

Over to you: How do you manage those security keys? Is it a good idea to put them in a GitHub repository?

Guest post by [Govardhana Miriyala Kannaiah](https://www.linkedin.com/in/govardhana-miriyala-kannaiah/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_recent_activity_content_view%3B453ttTK1RbaZ6dUsydRz9Q%3D%3D).

## Uber Tech Stack - CI/CD

Uber is one of the most innovative companies in the engineering field. Let’s take a look at their CI/CD tech stacks.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7e3961a1-73b5-48a7-be54-e983ad5570e2_1280x1129.png)



Note: This post is based on research on Uber engineering blogs. If you spot any inaccuracies, please let us know.

Project planning: JIRA

Backend services: Spring Boot to develop their backend services. And to make things even faster, they've created a nifty configuration system called Flipr that allows for speedy configuration releases.

Code issues: They developed NullAway to tackle NullPointer problems and NEAL to lint the code. Plus, they built Piranha to clean out-dated feature flags.

Repository: They believe in Monorepo. It uses Bazel on a large scale.

Testing: They use SLATE to manage short-lived testing environments and rely on Shadower for load testing by replaying production traffic. They even developed Ballast to ensure a smooth user experience.

Experiment platform: it is based on deep learning and they've generously open-sourced parts of it, like Pyro.

Build: Uber packages their services into containers using uBuild. It's their go-to tool, powered by Buildkite, for all the packaging tasks.

Deploying applications: Netflix Spinnaker. It's their trusted tool for getting things into production smoothly and efficiently.

Monitoring: Uber built their own monitoring systems. They use the uMetric platform, built on Cassandra, to keep things consistent.

Special tooling: Uber relies on Peloton for capacity planning, scheduling, and operations. Crane builds a multi-cloud infrastructure to optimize costs. And with uAct and the OnCall dashboard, they've got event tracing and on-call duty management covered.

Have you ever used any of Uber's tech stack for CI/CD? What are your thoughts on their CI/CD setup?

## Leadership Styles Around The World

Different leadership styles can be profoundly influenced by cultural differences. Do you agree with the diagram?



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F61d101ce-a83a-4c48-97f7-9b80a2508053_1314x1516.jpeg)



Credit: ‘When cultures collide’ book by Richard D. Lewis