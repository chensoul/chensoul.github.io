This week’s system design refresher:

+   How ChatGPT works technically (Youtube video)
    
+   18 Key Design Patterns Every Developer Should Know
    
+   Netflix Tech Stack - Part 1 (CI/CD Pipeline)
    
+   How does Docker work?
    
+   Job openings
    

## [Postman’s 2023 State of the API survey is open (Sponsored)](https://bit.ly/Postman_API)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F17ea6a5e-2266-4359-8007-fa46df1db920_2333x1750.jpeg)

The biggest, most comprehensive survey on APIs is open for a fourth year, with new questions on monetization, generative AI, and more. Take the survey and share how you work with APIs, the challenges you’re overcoming, and what you see for the future of APIs (plus there are prizes, including a PS5, Steam Deck, and Amazon gift cards).

[Take the survey](https://bit.ly/Postman_API)

## How ChatGPT works technically

We attempted to explain how it works in this video. We will cover:

+   Large Language Model
    
+   GPT-3.5
    
+   Fine-tuning
    
+   Prompt engineering
    
+   How to answer a prompt
    

## 18 Key Design Patterns Every Developer Should Know



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F63fceee3-327d-4db5-a8ba-c2362a42971b_1421x1536.jpeg "No alternative text description for this image")



Patterns are reusable solutions to common design problems, resulting in a smoother, more efficient development process. They serve as blueprints for building better software structures. These are some of the most popular patterns:

+   Abstract Factory: Family Creator - Makes groups of related items.
    
+   Builder: Lego Master - Builds objects step by step, keeping creation and appearance
    
+   Prototype: Clone Maker - Creates copies of fully prepared examples.
    
+   Singleton: One and Only - A special class with just one instance.
    
+   Adapter: Universal Plug - Connects things with different interfaces.
    
+   Bridge: Function Connector - Links how an object works to what it does.
    
+   Composite: Tree Builder - Forms tree-like structures of simple and complex parts.
    
+   Decorator: Customizer - Adds features to objects without changing their core.
    
+   Facade: One-Stop-Shop - Represents a whole system with a single, simplified interface.
    
+   Flyweight: Space Saver - Shares small, reusable items efficiently.
    
+   Proxy: Stand-In Actor - Represents another object, controlling access or actions.
    
+   Chain of Responsibility: Request Relay - Passes a request through a chain of objects until handled.
    
+   Command: Task Wrapper - Turns a request into an object, ready for action.
    
+   Iterator: Collection Explorer - Accesses elements in a collection one by one.
    
+   Mediator: Communication Hub - Simplifies interactions between different classes.
    
+   Memento: Time Capsule - Captures and restores an object's state.
    
+   Observer: News Broadcaster - Notifies classes about changes in other objects.
    
+   Visitor: Skillful Guest - Adds new operations to a class without altering it.
    

## Netflix Tech Stack - Part 1 (CI/CD Pipeline)



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa94d9082-c787-42e4-a104-6545ea99c415_1608x1378.jpeg "diagram")



+   Planing: Netflix Engineering uses JIRA for planning and Confluence for documentation.
    
+   Coding: Java is the primary programming language for the backend service, while other languages are used for different use cases.
    
+   Build: Gradle is mainly used for building, and Gradle plugins are built to support various use cases.
    
+   Packaging: Package and dependencies are packed into an Amazon Machine Image (AMI) for release.
    
+   Testing: Testing emphasizes the production culture's focus on building chaos tools.
    
+   Deployment: Netflix uses its self-built Spinnaker for canary rollout deployment.
    
+   Monitoring: The monitoring metrics are centralized in Atlas, and Kayenta is used to detect anomalies.
    
+   Incident report: Incidents are dispatched according to priority, and PagerDuty is used for incident handling.
    

Thanks, [Xiong Wang](https://www.linkedin.com/in/ACoAAAR8PBgBOc7nqKTb3yXgebTvmffpuaDAL6U), for putting it together!

—  
We plan to develop detailed illustrations of tech stacks used by various companies for educational purposes. If you would like to contribute to this project, kindly complete the short survey. All responses will be kept anonymous. Thank you for your help.

Share the tech stack you know here: [https://lnkd.in/eiEbH7tX](https://lnkd.in/eiEbH7tX)

## How does Docker work?

A comparison of Docker-based and non-Docker-based development is shown below.



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe6d6cfde-1ff5-4f51-ae35-a56040befa57_1280x1617.jpeg "diagram")

With Docker, we can develop, package, and run applications quickly:

🔹 The developers can write code locally and then build a Docker image and push it to a dev environment. In this way, the development work is shared within the team. The tests are run automatically in the dev environment.

An image is a read-only template with instructions for creating a Docker container. We use a Dockerfile to define the steps to create the image and run it.

🔹 The above process can run incrementally when bugs are found or improvements are needed.

🔹 When dev testing is complete, the Docker image is pushed to the production environment (often on the cloud).

Compared with traditional development without Docker, Docker is quite lightweight and fast, because only the changed part of Dockerfile is rebuilt every time we make a change.

Over to you: Where are Docker images stored?

## **Join the ByteByteGo Talent Collective**

If you’re looking for a new gig, [join the collective](https://substack.com/redirect/cb4e0ec6-0c70-4789-babd-8bf0311fdb99?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) for customized job offerings from selected companies. Public or anonymous options are available. Leave anytime.

If you’re **hiring**, [join the ByteByteGo Talent](https://substack.com/redirect/50aacc11-fd43-4ba7-a1ca-3f60151cdc8d?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) Collective to start getting bi-monthly drops of world-class hand-curated engineers who are open to new opportunities.

## **Featured job openings**

**X1 Card**: [Engineering Leader - Card Platform](https://substack.com/redirect/2d5ecbe3-723d-4437-866f-f2cfe4759b35?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) (United States, remote)

**X1 Card**: [Software Engineer, Infrastructure](https://bytebytego.pallet.com/jobs/0666e2c2-27af-402e-8acd-750c362271e5) (United States, remote)

**(catch) Health**: [Senior Frontend Engineer, React + Typescript](https://substack.com/redirect/2883956f-c187-4d68-8c7d-53ed5bfe2c5f?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) (United States, remote)