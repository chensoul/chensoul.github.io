This week’s system design refresher:

+   Top 7 ChatGPT Developer Hacks
    
+   Data structures used in daily life
    
+   Why do we need a message broker?
    
+   Twitter’s “For You” timeline
    
+   What happens when you type “ssh hostname”?
    
+   Job openings
    

## Top 7 ChatGPT Developer Hacks

## What are the data structures used in daily life?



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa8a5a4fc-5cc9-44db-b8ca-08dd83c34737_1160x1384.png)



A good engineer needs to recognize how data structures are used in our daily lives.

+   list: keep your Twitter feeds
    
+   stack: support undo/redo of the word editor
    
+   queue: keep printer jobs, or send user actions in-game
    
+   heap: task scheduling
    
+   tree: keep the HTML document, or for AI decision
    
+   suffix tree: for searching string in a document
    
+   graph: for tracking friendship, or path finding
    
+   r-tree: for finding the nearest neighbor
    
+   vertex buffer: for sending data to GPU for rendering
    

To conclude, data structures play an important role in our daily lives, both in our technology and in our experiences. Engineers should be aware of these data structures and their use cases to create effective and efficient solutions.

Over to you: Which additional data structures have we overlooked?

## Why do we need message brokers?

Message brokers play a crucial role when building distributed systems or microservices to improve their performance, scalability, and maintainability.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0087a234-8fe4-40a2-b32f-572488e31b91_4232x3224.png)



+   Decoupling: Message brokers promote independent development, deployment, and scaling by creating a separation between software components. The result is easier maintenance and troubleshooting.
    
+   Asynchronous communication: A message broker allows components to communicate without waiting for responses, making the system more efficient and enabling effective load balancing.
    
+   Message brokers ensure that messages are not lost during component failures by providing buffering and message persistence.
    
+   Scalability: Message brokers can manage a high volume of messages, allowing your system to scale horizontally by adding more instances of the message broker as needed.
    

To summarize, a message broker can improve efficiency, scalability, and reliability in your architecture. Considering the use of a message broker can greatly benefit the long-term success of your application. Always think about the bigger picture, and how your design choices will affect the overall project.

Over to you: there is a term called pub/sub. Are you familiar with their meanings?

## How does Twitter recommend “For You” Timeline in 1.5 seconds?

We spent a few days analyzing it.

The diagram below shows the detailed pipeline based on the open-sourced algorithm.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fccaba9d0-ac22-4c2c-a65a-19d3f2fca045_3071x4096.jpeg)



The process involves 5 stages:

+   Candidate Sourcing ~ start with 500 million Tweets
    
+   Global Filtering ~ down to 1500 candidates
    
+   Scoring & Ranking ~ 48M parameter neural network, Twitter Blue boost
    
+   Filtering ~ to achieve author and content diversity
    
+   Mixing ~ with Ads recommendation and Who to Follow
    

The post was jointly created by ByteByteGo and [Mem](https://www.linkedin.com/company/memdotai/)  
Special thanks [Scott Mackie](https://www.linkedin.com/in/ACoAABLDe9kBSK7DsORQHK2G1srZCmM1isaUun8) , founding engineer at Mem, for putting this together.

Mem is building the world’s first knowledge assistant. In next week’s ByteByteGo guest newsletter, Mem will be sharing lessons they’ve learned from their extensive work with large language models and building AI-native infrastructure.

If you want to be part of building the future of personal AI, Mem is currently hiring a staff backend software engineer: [https://lnkd.in/erF2s3xx](https://lnkd.in/erF2s3xx)

## Popular interview question: what happens when you type “ssh hostname”?

In the 1990s, Secure Shell was developed to provide a secure alternative to Telnet for remote system access and management. Using SSH is a great way to set up secure communication between client and server because it uses a secure protocol.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0d7404e2-ee29-457d-a5c4-da96c76f0e8f_1302x1362.png)



The following happens when you type "ssh hostname":

+   Hostname resolution: Convert the hostname to an IP address using DNS or the local hosts file.
    
+   SSH client initialization: Connect to the remote SSH server.
    
+   TCP handshake: Establish a reliable connection.
    
+   Protocol negotiation: Agree on the SSH protocol version and encryption algorithms.
    
+   Key exchange: Generate a shared secret key securely.
    
+   Server authentication: Verify the server's public key.
    
+   User authentication: Authenticate using a password, public key, or another method.
    
+   Session establishment: Create an encrypted SSH session and access the remote system.
    

Make sure you always use key-based authentication with SSH for better security, and learn SSH configuration files and options to customize your experience. Keep up with best practices and security recommendations to ensure a secure and efficient remote access experience.

Over to you: can you tell the difference between SSH, SSL, and TLS?

## **Join the ByteByteGo Talent Collective**

If you’re looking for a new gig, [join the collective](https://substack.com/redirect/79188cab-63a0-488e-8fd1-f38f237dcea7?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) for customized job offerings from selected companies. Public or anonymous options are available. Leave anytime.

If you’re **hiring**, [join the ByteByteGo Talent](https://substack.com/redirect/00076ea6-f52f-413c-a1a4-b7e3626427e1?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) Collective to start getting bi-monthly drops of world-class hand-curated engineers who are open to new opportunities.

## **Featured job openings**

**X1 Card**: [Engineering Leader - Card Platform](https://substack.com/redirect/91bb2527-b512-464d-9b69-cd0860fbcaf0?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) (United States, remote)

**X1 Card**: [Software Engineer, Back End, All Levels](https://bytebytego.pallet.com/jobs/03635432-4f13-484f-98c6-d031f9d0eca1) (United States, remote)

**(catch) Health**: [Senior Frontend Engineer, React + Typescript](https://bytebytego.pallet.com/jobs/bbaf8e01-b47a-4766-a189-e10859634249) (United States, remote)