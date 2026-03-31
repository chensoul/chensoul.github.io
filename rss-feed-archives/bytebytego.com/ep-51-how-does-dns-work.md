This week’s system design briefer:

+   How does DNS work?
    
+   How Discord Stores Trillions Of Messages
    
+   Silicon Valley Bank (SVB) collapse
    
+   What’s new in GPT-4
    
+   Job openings
    

## Easy SOC 2 compliance + AI-based RFP automation (Sponsored)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa661b719-a0ff-437a-983a-8a39e09bae3d_1600x840.png)



With a streamlined workflow and expert guidance, [Secureframe](https://bit.ly/SecureFrame031823) automates the entire compliance process, end-to-end.  
What makes Secureframe different?

+   Get audit-ready and achieve compliance in weeks, not months with built-in remediation guidance and 100+ integrations.
    
+   Stay compliant with the latest regulations and requirements including ISO 27001, GDPR, HIPAA, PCI, and other standards.
    
+   [Automate responses to RFPs](https://bit.ly/SecureFrame031823) and security questionnaires with AI.
    
+   Trusted by hyper-growth organizations: AngelList, Ramp, Lob, Remote, and thousands of other businesses.
    

[Request a demo](https://bit.ly/SecureFrame031823)

## How does DNS work?

## How Discord Stores Trillions Of Messages

The diagram below shows the evolution of message storage at Discord:



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F67b3962d-becb-4fba-a9ae-115692dfa6e1_3576x3033.png)



MongoDB ➡️ Cassandra ➡️ ScyllaDB

In 2015, the first version of Discord was built on top of a single MongoDB replica. Around Nov 2015, MongoDB stored 100 million messages and the RAM couldn’t hold the data and index any longer. The latency became unpredictable. Message storage needs to be moved to another database. Cassandra was chosen.

In 2017, Discord had 12 Cassandra nodes and stored billions of messages.

At the beginning of 2022, it had 177 nodes with trillions of messages. At this point, latency was unpredictable, and maintenance operations became too expensive to run.

There are several reasons for the issue:

+   Cassandra uses the LSM tree for the internal data structure. The reads are more expensive than the writes. There can be many concurrent reads on a server with hundreds of users, resulting in hotspots.
    
+   Maintaining clusters, such as compacting SSTables, impacts performance.
    
+   Garbage collection pauses would cause significant latency spikes
    

## Breaking down what's going on with the Silicon Valley Bank (SVB) collapse



![chart](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe259078f-f247-4faf-bea3-14269480f1b8_2048x1156.jpeg "chart")



## What’s new in GPT-4

AI is evolving at a scary pace. I dove deep into the GPT-4 Technical Report and some videos, and here's what's fresh.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1589f8b3-443a-4f2a-9f3d-ce1f73117375_4558x5340.png)



+   Multimodal: support both image and text
    
+   Increased word limit to 25,000
    
+   Human-level performance on academic benchmarks
    
+   More creative & collaborative
    
+   Better safety
    
+   Not so open: no further details about the architecture, hardware, training compute, etc.
    

## **Join the ByteByteGo Talent Collective**

If you’re looking for a new gig, [join the collective](https://substack.com/redirect/59ebfc88-595a-4a5c-9eaf-bdef0cbac642?j=eyJ1IjoiMWxyMnJiIn0.3gL4cFwDHqFL_VcXxR7HzMwPYkuu_RpwPuz8o-oe3gw) for customized job offerings from selected companies. Public or anonymous options are available. Leave anytime.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F82750580-63ef-467f-89ae-c5cf6d2c3c41_395x702.jpeg)



If you’re **hiring**, [join the ByteByteGo Talent](https://substack.com/redirect/94fd1964-9469-4e0c-b744-5613b9677fd6?j=eyJ1IjoiMWxyMnJiIn0.3gL4cFwDHqFL_VcXxR7HzMwPYkuu_RpwPuz8o-oe3gw) Collective to start getting bi-monthly drops of world-class hand-curated engineers who are open to new opportunities.

## **Featured job openings**

**X1 Card**: [Software Engineer, Back End](https://substack.com/redirect/6a0569ac-6b7b-495c-9c2e-b8e036c2dd84?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) (United States)  
**X1 Card**: [Head of Infrastructure and Risk](https://substack.com/redirect/99961ddb-87b8-4f79-8655-bf748f731a78?j=eyJ1IjoiMXJkcHl1In0.oD6dBS6c2Usdj808VQ_yBxMolbETJ0S1a0mTf9eVsmA) (United States)