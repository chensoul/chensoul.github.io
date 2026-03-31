This week’s system design refresher:

+   System design interview course (Black Friday Sale)
    
+   Token, Cookie, Session
    
+   What is CDN? (Youtube video)
    
+   Learning Payment System
    
+   Online ticketing platform
    
+   Centralized vs. Decentralized Social Network
    

## 📚 BLACK FRIDAY SALE 📚

The Black Friday sale is now up! Use code **BF2022** at checkout for 30% off my system design interview online course.


![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd15b794c-4e19-4eeb-9463-cc8ef0e72e60_2048x1149.jpeg "No alternative text description for this image")


Our online course features content from two System Design interview books. And in 2023, we hope to add the new System Design Interview Volume 3.

To take advantage of the **limited-time offers**, subscribe before 11:59 pm PST on Monday, November 28.

[Get it here](https://bytebytego.com/)

## Token, Cookie, Session

Session, cookie, JWT, token, SSO, and OAuth 2.0 - what are they?


![No alt text provided for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ff455a257-db74-4120-a736-b62d3c374422_1318x1536.jpeg "No alt text provided for this image")


These terms are all related to user identity management. When you log into a website, you declare who you are (identification). Your identity is verified (authentication), and you are granted the necessary permissions (authorization). Many solutions have been proposed in the past, and the list keeps growing.

From simple to complex, here is my understanding of user identity management:

+   WWW-Authenticate is the most basic method. You are asked for the username and password by the browser. As a result of the inability to control the login life cycle, it is seldom used today.
    
+   A finer control over the login life cycle is session-cookie. The server maintains session storage, and the browser keeps the ID of the session. A cookie usually only works with browsers and is not mobile app friendly.
    
+   To address the compatibility issue, the token can be used. The client sends the token to the server, and the server validates the token. The downside is that the token needs to be encrypted and decrypted, which may be time-consuming.
    
+   JWT is a standard way of representing tokens. This information can be verified and trusted because it is digitally signed. Since JWT contains the signature, there is no need to save session information on the server side.
    
+   By using SSO (single sign-on), you can sign on only once and log in to multiple websites. It uses CAS (central authentication service) to maintain cross-site information
    
+   By using OAuth 2.0, you can authorize one website to access your information on another website
    

## **What Is A CDN? How Does It Work?**

## How to learn payment systems?


![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F1f8f2f27-1cac-4e19-a190-cec41a7e9d71_1351x1536.jpeg "No alternative text description for this image")


## Online Ticketing Platform

Last week, Ticketmaster halted public ticket sales of Taylor Swift’s tour due to extraordinarily high demands on ticketing systems.

It’s an interesting problem, so we did some research on this topic. The diagram below shows the evolution of the online China Train ticket booking system.


![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F8456d0b2-5db7-4bb4-99b3-a7474a6d945f_1280x1616.jpeg "No alternative text description for this image")


The China Train tickets booking system has **similar challenges** as the Ticketmaster system:

1.  Very high concurrent visits during peak hours.
    
2.  The QPS for checking remaining tickets and orders is very high
    
3.  A lot of bots
    

**The solutions**

1.  **Separate read and write requests.** Because anxious users kept refreshing the web page to check if there were tickets available, the system could under huge pressure.
    
    To handle the calculation and query in memory, the remaining ticket components were moved entirely to GemFire. It is possible to fit the entire country's train tickets into several Gigabytes of memory.  
    In addition, the order query component was moved to GemFire to reduce the load on the order database. Hadoop was used to store historical orders.
    
2.  **Leverage public cloud for elastic capacity.**
    
3.  **Ban bots.** It reduced the traffic by 95%.
    
4.  **Increase the bandwidth** of the system.
    
5.  **Increase system availability** by setting up more data centers in different cities.
    
6.  **Design multiple emergency plans.**
    

Note: the numbers are based on the back-of-the-envelope estimation (not official data). 

## Do we have an alternative for Twitter services?

What is a **decentralized social network** service?

The diagram below shows a comparison between Twitter and Mastodon.


![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fa4a87ec5-ed9d-4132-a0e0-29c91e272e50_1280x2145.jpeg "No alternative text description for this image")


It is said that Trump's new social media platform Truth Social was using the Mastodon.

Mastodon runs **self-hosted** social network services. It is free and **has no ads**. Its MAU (Monthly Active Users) increased from 500k in Oct to 1 million in Nov, after Elon Musk’s takeover of Twitter.

Unlike Twitter, whose servers belong to the Twitter company, Mastodon’s servers do not belong to any company. Its network is composed of servers (instances) from different organizations.

When users register, they must choose a server to start with. Since the servers sync up with each other, users can still receive updates from other servers.

Because the network is run by volunteers, the company has **only one employee** - its founder Eugen Rochko. It is run by **crowdfunding** and is now supported by 3500 people.

##  **Featured job openings**

**Openedges**: [Chief Architect](https://substack.com/redirect/7385740a-a5c0-4c9b-aca5-fc13bbf3bb51?r=1lr2rb) (San Jose, Austin, Remote)