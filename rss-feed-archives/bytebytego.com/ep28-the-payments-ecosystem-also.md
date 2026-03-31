This week’s system design refresher:

+   The Payments Ecosystem
    
+   Microservice architecture
    
+   Web 3.0
    
+   Flowchart of how slack decides to send a notification
    
+   Advertise with ByteByteGo newsletter
    

## Join 2,000+ engineering leaders at Interact | The No.1 free, virtual dev conference (Sponsored)


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F6da0d64f-e014-428a-9bbf-9083603b07b9_1628x1514.png)


If you’re an engineering leader (or planning to become one), you should [save your seat](https://bit.ly/3T3rsMx) at Interact on October 25th. Interact is a free, virtual conference that brings together thousands of dev leads from over 95 countries. This year’s line-up includes speakers from Shopify, Slack, Atlassian, and Stripe. The event is presented by LinearB and the Dev Interrupted community.

Explore engineering challenges. Build your professional network. Become an elite engineering leader.

It’s virtual. It's free. It's the best ROI for your time. 

[Grab your free ticket now.](https://bit.ly/3T3rsMx)

## The Payments Ecosystem

How do fintech startups find new opportunities among so many payment companies? What do PayPal, Stripe, and Square do exactly?


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5946aa7f-93de-4f21-990c-f7c04807ac6d_2439x3213.png)


**Steps 0-1**: The cardholder opens an account in the issuing bank and gets the debit/credit card. The merchant registers with ISO (Independent Sales Organization) or MSP (Member Service Provider) for in-store sales. ISO/MSP partners with payment processors to open merchant accounts. 

**Steps 2-5**: The acquiring process.  
The payment gateway accepts the purchase transaction and collects payment information. It is then sent to a payment processor, which uses customer information to collect payments. The acquiring processor sends the transaction to the card network. It also owns and operates the merchant’s account during settlement, which doesn’t happen in real-time.

**Steps 6-8**: The issuing process.  
The issuing processor talks to the card network on the issuing bank’s behalf. It validates and operates the customer’s account.

I’ve listed some companies in different verticals in the diagram. Notice payment companies usually start from one vertical, but later expand to multiple verticals.

## Microservice Architecture

What does a typical microservices architecture look like? And when should we use it? Let’s take a look.

## What is Web 3.0?

The diagram below shows Web 1.0/Web 2.0/Web 3.0 from a bird's-eye view.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fa0b2b50f-9a3e-4050-8608-c6bd54a64c9b_1946x2384.png)


+   Web 1.0 - Read Only  
    Between 1991 and 2004, the internet is like a **catalog of static pages**. We can browse the content by jumping from one hyperlink to another. It doesn’t provide any interactions with the content.
    
+   Web 2.0 - Read Write  
    From 2004 to now, the internet has evolved to have search engines, social media apps, and recommendation algorithms backed apps. 
    

Because the apps digitalize human behaviors and persist user data when users interact with these apps, big companies leverage user data for advertisements, which becomes **one of the main business models** in Web 2.0. 

That’s why people say the apps know you better than your friends, family, or even yourself.

+   Web 3.0 - Read Write Own  
    The idea has been discussed a lot recently due to the development of blockchain and decentralized apps. The creators’ content is stored on IPFS (InterPlanetary File System) and **owned by the users**. If apps want to access the data, they need to get **authorization** from the users and **pay** for it.
    

In Web 3.0, the ownership change may lead to some major innovations.

## Flowchart of how slack decides to send a notification

It is a great example of why a simple feature may take much longer to develop than many people think.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F816d8d88-ce48-49cb-9ac9-bf9e0a6dc973_1491x1421.png)


When we have a great design, users may not notice the complexity because it feels like the feature just working as intended.

Image source: slack eng blog

## Advertise with ByteByteGo newsletter?

Advertising with ByteByteGo newsletter gets your dev tools, SaaS product, FinTech product, conference, etc., in front of an incredibly influential technical audience. To reach 150,000+ engineering leaders and a highly technical audience, please send an email to hi@bytebytego.com