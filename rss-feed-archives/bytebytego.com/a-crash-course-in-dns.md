What if you woke up tomorrow and could no longer access websites by typing names like google.com or espn.com? Instead, you had to memorize and type a series of numbers just to get online - 172.217.16.206 to check Gmail or 199.181.132.250 to read sports news. Internet browsing would become extremely tedious overnight!

Luckily, this internet nightmare scenario will never happen as long as DNS keeps running smoothly in the background. DNS, short for Domain Name System, is the essential service that saves us from the huge hassle of memorizing numeric IP addresses. It efficiently matches easy-to-remember domain names with their corresponding IP addresses so we can browse seamlessly.

In this article, we explore the intricate workings of this crucial internet backbone.

## DNS: The Internet’s Address Book

DNS is a distributed and hierarchical system that acts as the internet's address book. It translates domain names into IP addresses to facilitate efficient communication between devices across the globe. The primary purpose of DNS is to provide a convenient way for users to access websites and resources using easily memorable domain names, while computers and servers use IP addresses for communication behind the scenes.

The DNS is implemented as an Application layer service. It is implemented by the servers that sit at the network edge rather than routers and switches inside the network. This reflects the internet design philosophy of keeping the network core simple and putting complexity at the network’s edge.

## Key Services Provided by DNS

DNS provides a number of different services to facilitate the functioning of the Internet. Here is a mind map of the services provided by DNS.

We are going to describe some of the most vital services of DNS below:

### Host-to-IP address mapping

DNS maintains a database of domain names and their corresponding IP addresses. This mapping is essential for devices to locate each other on the internet.

For instance, consider the domain name "www.bytebytego.com." Host-to-IP address mapping involves determining the IP address associated with this domain, such as "172.67.21.11".

### Host aliasing

DNS supports a feature commonly known as host aliasing, enabled through CNAME (Canonical Name) records. This allows a single IP address or primary domain name to be associated with multiple domain name aliases.

For example, let's consider the primary domain "bytebytego.com". You might want your website to be accessible not just via "bytebytego.com", but also through various aliases like "www.bytebytego.com", "web.bytebytego.com", and "blog.bytebytego.com". By setting up appropriate CNAME records in DNS, all these aliases can point to the primary domain "bytebytego.com". As a result, users can access your website using any of these domain names, all leading to the same destination IP address.

### Email Routing

DNS plays a crucial role in email routing through MX records. These records allow a domain to specify which mail servers are responsible for receiving email messages on its behalf. This mechanism enables flexibility in email configurations.

For example, let's say the primary mail server designated to receive emails for the "bytebytego.com" domain is "mail.bytebytego.com". You might want to have specific email addresses, such as those ending in "@sales.bytebytego.com" or "@support.bytebytego.com", yet still direct all incoming mail for these addresses to the "mail.bytebytego.com" server. By configuring MX records appropriately, emails sent to any of these addresses will route to the designated primary mail server.

### IP-to-host address mapping

While DNS is primarily used for translating domain names to IP addresses, it can also perform reverse lookups, translating IP addresses back to domain names. This is useful for security and logging purposes.

### Load balancing

DNS can distribute incoming network traffic across multiple servers by returning different IP addresses in response to the same domain name query. This helps balance the load and improve the performance and reliability of online services.

## DNS Hierarchy

DNS operates as a distributed hierarchical database. The following illustration shows a high-level view of the DNS hierarchy.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff0a1bb2c-a1bc-40ce-abde-6fb9d2a66ce8_1600x570.png)



### Root DNS Servers

At the top of the DNS hierarchy are the root servers. The root servers are contacted when a server is not actually able to resolve a name. You can think of it as a first point of contact to get the resolution started.

Root servers act like the central nervous system of the internet, and as such, security is going to be very important. Much of the infrastructure associated with the root servers is the responsibility of ICANN (Internet Corporation for Assigned Names and Numbers). There are 13 logical root servers around the world, but each of these logical root servers is actually replicated, so corresponding to these 13 logical servers are actually close to a thousand physical servers around the world.

### Top-Level Domain (TLD) DNS servers

Moving down a level from the root servers, we find the TLD (Top-Level Domain) servers and each of the servers in the TLD layer is responsible for resolving one of the addresses that have an ending like **.com**, **.edu**, **.net**, and **.org**.

The Internet Corporation for Assigned Names and Numbers (ICANN) has authority over all TLDs used on the Internet, and it delegates the responsibility of these TLDs to various organizations. For individuals or entities looking to register a new domain under these TLDs, they typically approach Domain Name Registrars, which are accredited entities interfacing with the registries to handle the registration process.

### Authoritative DNS servers

Authoritative servers are the definitive source for domain name resolutions within their specific domain. They store the actual name-to-IP address mappings for a given domain. While various caching mechanisms exist across the internet to speed up domain name resolutions, it's the authoritative servers that provide the correct and final answer when queried. Domain owners or administrators configure their domain's records, but the actual infrastructure—the DNS servers—is often maintained and operated by DNS hosting providers or registrars like Cloudflare, Namecheap, GoDaddy, and others.

### Recursive DNS Servers (Resolver)

Recursive servers handle DNS queries from client devices like computers and smartphones. When a device wants to resolve a domain name, it contacts these servers. Acting on behalf of the client, recursive servers traverse the DNS hierarchy, consulting various DNS servers to determine the IP address associated with a domain name. Once they obtain the answer, they return it to the client. For efficiency, recursive servers often cache responses to avoid repeatedly querying the same information.

Check out the illustration below, it shows the placement of some of the main DNS servers inside the pipeline of a DNS query.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F99472ff8-82a1-4365-bb03-c9a00b39e412_1419x336.png)



## How DNS Resolution Works

There are two main methods of query resolution in DNS:

+   Iterative query resolution
    
+   Recursive query resolution
    

These methods define how DNS servers interact with each other to find the IP address associated with a given domain name. Here’s a brief overview of each method.

**Iterative Query Resolution**

In iterative query resolution, the DNS server receiving the query provides referrals to the querying server, guiding it through the DNS hierarchy. The querying server actively participates in the process by sending subsequent queries based on the referrals received.

Let's try to understand the workings of iterative query resolution with the help of an example shown in the illustration below.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F96fbf5fc-bf5d-4047-b058-f48f6f3b3a30_1600x1432.png)



Suppose the requesting host is making a request to resolve the name **bytebytego.com**. Here’s how this is going to unfold:

1.  The host first sends a query message to the local DNS resolver. The query message contains the hostname to be translated **bytebytego.com**
    
2.  If the resolver doesn't have the IP address in its cache, it sends a query to a root DNS server.
    
3.  The root DNS server, recognizing the **.com** suffix, provides a referral to TLD servers responsible for **.com**
    
4.  The resolver then sends a new query to one of these TLD servers.
    
5.  The TLD server provides a referral to the authoritative DNS server responsible for **bytebytego.com**.
    
6.  The resolver sends another query to the authoritative DNS server.
    
7.  The authoritative DNS server responds with the IP address of **bytebytego.com**
    
8.  The DNS resolver caches this IP address and then returns it to the requesting host.
    
9.  Now, the requesting host makes an HTTP request to the IP address of the http://www.bytebytego.com web server.
    
10.  The web server returns the webpage for www.bytebytego.com


### Recursive Query Resolution

In recursive query resolution, the DNS server receiving the query takes on the responsibility of finding the IP address on behalf of the client. It may itself use iterative queries to navigate through the DNS hierarchy until it reaches the authoritative DNS server for the requested domain.

Let’s use the previous example and try to resolve the IP address of bytebytego.com using the recursive query resolution as shown in the illustration below:



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F23550856-e23b-4372-8422-20630dfea888_1600x1432.png)

