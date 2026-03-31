This week’s system design refresher:

+   1 year of Youtube
    
+   Top Architectural Styles
    
+   Firewall explained
    
+   Two-tier infrastructure on AWS
    
+   How Developer to Tester Ratio Changed From 1:1 to 100:1
    

## [New Relic APM 360: The industry’s next evolution of APM (Sponsored)](https://bit.ly/NewRelic_071523)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fa25ca133-b561-4fb4-9134-92a000c3fe5a_2868x1606.png)

Prevent issues before they occur. New Relic APM 360 goes beyond incident response and unlocks daily performance, security, and development insights for all engineers in one unified view.

[Get started for free](https://bit.ly/NewRelic_071523)

## 1 year of Youtube

[Click Here to Subscribe](https://www.youtube.com/@ByteByteGo?sub_confirmation=1)

## Top architectural styles

In software development, architecture plays a crucial role in shaping the structure and behavior of software systems. It provides a blueprint for system design, detailing how components interact with each other to deliver specific functionality. They also offer solutions to common problems, saving time and effort and leading to more robust and maintainable systems.



![chart](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F658ccb8c-bd4f-4803-b5f0-05920d1554a0_1280x1810.jpeg "chart")



However, with the vast array of architectural styles and patterns available, it can take time to discern which approach best suits a particular project or system. Aims to shed light on these concepts, helping you make informed decisions in your architectural endeavors.

To help you navigate the vast landscape of architectural styles and patterns, there is a cheat sheet that encapsulates all. This cheat sheet is a handy reference guide that you can use to quickly recall the main characteristics of each architectural style and pattern.

## Firewall explained to Kids… and Adults

A firewall is a network security system that controls and filters network traffic, acting as a watchman between a private network and the public Internet.

![graphical user interface](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F89c38b43-ca19-49ea-a91b-e7de8636707d_1992x1536.jpeg "graphical user interface")



They come in two broad categories:  
Software-based: installed on individual devices for protection  
Hardware-based: stand-alone devices that safeguard an entire network.

Firewalls have several types, each designed for specific security needs:  
1\. Packet Filtering Firewalls: Examines packets of data, accepting or rejecting based on source, destination, or protocols.

2\. Circuit-level Gateways: Monitors TCP handshake between packets to determine session legitimacy.

3\. Application-level Gateways (Proxy Firewalls): Filters incoming traffic between your network and traffic source, offering a protective shield against untrusted networks.

4\. Stateful Inspection Firewalls: Tracks active connections to determine which packets to allow, analyzing in the context of their place in a data stream.

5\. Next-Generation Firewalls (NGFWs): Advanced firewalls that integrate traditional methods with functionalities like intrusion prevention systems, deep packet analysis, and application awareness.

Over to you: Do you know what firewalls your company uses?

## Two-tier infrastructure on AWS

An amazing illustration of how to use Terraform to create a robust Two-tier infrastructure on AWS.

Image Credit: [Ankit Jodhani](https://www.linkedin.com/in/ACoAADNAntABPlI73jmRzBk6eikEcrfw04kqocI)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb040dad4-e44f-42fa-9a88-f6d214f06bc4_907x1080.gif)



## Paradigm Shift: How Developer to Tester Ratio Changed From 1:1 to 100:1

This post is inspired by the article "The Paradigm Shifts with Different Dev:Test Ratios" by [Carlos Arguelles](https://www.linkedin.com/in/ACoAAABj60kByWwNDRyWLdeCCmaKZYUHd4LynqQ). I highly recommend that you read the original article [here](https://lnkd.in/ehbZzZck).



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9e311239-a9fb-45b5-b553-a9845f5c7f62_1280x1628.jpeg)



1:1 **ratio** (~1997)  
Software used to be burned onto physical CDs and delivered to customers. The development process was waterfall-style, builds were certified, and versions were released roughly every three years.

If you had a bug, that bug would live forever. It wasn’t until years later that companies added the ability for software to ping the internet for updates and automatically install them.

10:1 **ratio** (~2009)  
Around 2009, the release-to-production speed increased significantly. Patches could be installed within weeks, and the agile movement, along with iteration-driven development, changed the development process.

For example, at Amazon, the web services are mainly developed and tested by the developers. They are also responsible for dealing with production issues, and testing resources are stretched thin (10:1 ratio).

100:1 **ratio** (~2020)  
Around 2015, big tech companies like Google and Microsoft removed SDET or SETI titles, and Amazon slowed down the hiring of SDETs.

But how is this going to work for big tech in terms of testing?

Firstly, the testing aspect of the software has shifted towards highly scalable, standardized testing tools. These tools have been widely adopted by developers for building their own automated tests.

Secondly, testing knowledge is disseminated through education and consulting.

Together, these factors have facilitated a smooth transition to the 100:1 testing ratio we see today.

Over to you: What does the future hold for testing, and how is it currently working for you?