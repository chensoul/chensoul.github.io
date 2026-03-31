This week’s system design refresher:

+   Top 6 most popular API architecture styles (Youtube video)
    
+   Monorepo vs. Microrepo
    
+   Inside the HTTP Header
    
+   Developer Roadmaps
    
+   Bytebytego Collective
    

## Top 6 most popular API architecture styles

## Do you believe that Google, Meta, Uber, and Airbnb put almost all of their code in one repository?

This practice is called a monorepo.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe36dc051-b050-4590-993e-be210298856b_1334x1886.png)



Guest post by [Xiong Wang](https://www.linkedin.com/in/wangxiong/).

Monorepo vs. Microrepo. Which is the best? Why do different companies choose different options?

Monorepo isn't new; Linux and Windows were both created using Monorepo. To improve scalability and build speed, Google developed its internal dedicated toolchain to scale it faster and strict coding quality standards to keep it consistent.

Amazon and Netflix are major ambassadors of the Microservice philosophy. This approach naturally separates the service code into separate repositories. It scales faster but can lead to governance pain points later on.

Within Monorepo, each service is a folder, and every folder has a BUILD config and OWNERS permission control. Every service member is responsible for their own folder.

On the other hand, in Microrepo, each service is responsible for its repository, with the build config and permissions typically set for the entire repository.

In Monorepo, dependencies are shared across the entire codebase regardless of your business, so when there's a version upgrade, every codebase upgrades their version.

In Microrepo, dependencies are controlled within each repository. Businesses choose when to upgrade their versions based on their own schedules.

Monorepo has a standard for check-ins. Google's code review process is famously known for setting a high bar, ensuring a coherent quality standard for Monorepo, regardless of the business.

Microrepo can either set their own standard or adopt a shared standard by incorporating best practices. It can scale faster for business, but the code quality might be a bit different.

Google engineers built Bazel, and Meta built Buck. There are other open-source tools available, including Nix, Lerna, and others.

Over the years, Microrepo has had more supported tools, including Maven and Gradle for Java, NPM for NodeJS, and CMake for C/C++, among others.

Over to you: Which option do you think is better? Which code repository strategy does your company use?

## Important Things About HTTP Headers You May Not Know!



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd1123263-0237-4037-ab04-a7cc6009181f_1710x1536.jpeg "diagram")



HTTP requests are like asking for something from a server, and HTTP responses are the server's replies. It's like sending a message and receiving a reply.

An HTTP request header is an extra piece of information you include when making a request, such as what kind of data you are sending or who you are. In response headers, the server provides information about the response it is sending you, such as what type of data you're receiving or if you have special instructions.

A header serves a vital role in enabling client-server communication when building RESTful applications. In order to send the right information with their requests and interpret the server's responses correctly, you need to understand these headers.

Over to you: the header “referer” is a typo. Do you know what the correct name is?

## Developer Roadmaps

I recently found out about this interesting GitHub repository. It contains roadmaps, guides, and educational content that are crafted to assist developers find their path in the tech world.

Check it out **[here](https://roadmap.sh/)**.



![Developer Roadmaps - roadmap.sh](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9dfdff6e-2b81-413f-9a42-b8a581628017_2072x1088.png "Developer Roadmaps - roadmap.sh")

## **Join the ByteByteGo Talent Collective**

If you’re looking for a new gig, [join the collective](https://substack.com/redirect/86275710-a7de-4dc4-b59d-1e41f9b902fa?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) for customized job offerings from selected companies. Public or anonymous options are available. Leave anytime.

If you’re **hiring**, [join the ByteByteGo Talent](https://substack.com/redirect/47d7eaf8-ca30-45ea-8e5a-91ffb3be0aa9?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) Collective to start getting bi-monthly drops of world-class hand-curated engineers who are open to new opportunities.