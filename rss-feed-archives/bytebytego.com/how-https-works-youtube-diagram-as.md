In this newsletter, we’ll cover the following topics:

🔹How HTTP works (**new Youtube video**)

🔹Diagram as a code

🔹Designing for high availability

🔹Git doodles

🔹How email is delivered

## How HTTPS works

**Subscribe to our YouTube Channel to watch it**: [https://bit.ly/ByteByteGoVideos](https://bit.ly/ByteByteGoVideos)

If you prefer reading, you can read it here:


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F0e18db0d-f511-4f85-bb58-388fce70d42e_2631x2103.png)


Hypertext Transfer Protocol Secure (HTTPS) is an extension of the Hypertext Transfer Protocol (HTTP.) HTTPS transmits encrypted data using Transport Layer Security (TLS.) If the data is hijacked online, all the hijacker gets is binary code. 

How is the data encrypted and decrypted?

Step 1 - The client (browser) and the server establish a TCP connection.

Step 2 - The client sends a “client hello” to the server. The message contains a set of necessary encryption algorithms (cipher suites) and the latest TLS version it can support. The server responds with a “server hello” so the browser knows whether it can support the algorithms and TLS version.

The server then sends the SSL certificate to the client. The certificate contains the public key, hostname, expiry dates, etc. The client validates the certificate. 

Step 3 - After validating the SSL certificate, the client generates a session key and encrypts it using the public key. The server receives the encrypted session key and decrypts it with the private key. 

Step 4 - Now that both the client and the server hold the same session key (symmetric encryption), the encrypted data is transmitted in a secure bi-directional channel.

Why does HTTPS switch to symmetric encryption during data transmission? There are two main reasons:

1\. Security: The asymmetric encryption goes only one way. This means that if the server tries to send the encrypted data back to the client, anyone can decrypt the data using the public key.

2\. Server resources: The asymmetric encryption adds quite a lot of mathematical overhead. It is not suitable for data transmissions in long sessions.

## Diagram as code

Would it be nice if the code we wrote automatically turned into architecture diagrams? 


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fcca58b18-5d1f-494e-b211-75d21b826e42_1280x2262.jpeg)


I recently discovered a Github repo that does exactly this: Diagram as Code for prototyping cloud system architectures.

𝐖𝐡𝐚𝐭 𝐝𝐨𝐞𝐬 𝐢𝐭 𝐝𝐨?  
\- Draw the cloud system architecture in Python code.  
\- Diagrams can also be rendered directly inside the Jupyter Notebooks.  
\- No design tools are needed.   
\- Supports the following providers: AWS, Azure, GCP, Kubernetes, Alibaba Cloud, Oracle Cloud, etc.   
   
Github repo: [https://lnkd.in/ergpnkVe](https://lnkd.in/ergpnkVe)

## How do we design for high availability?

What does Availability mean when you design a system?


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F1e1a0f55-b14d-466e-8d1d-3a904d4ae5e1_1578x1536.jpeg)


In the famous CAP theorem by computer scientist Eric Brewer, Availability means ​​all (non-failing) nodes are available for queries in a distributed system. When you send out requests to the nodes, a non-failing node will return a reasonable response within a reasonable amount of time (with no error or timeout). 

Usually, we design a system for high availability. For example, when we say the design target is 4-9’s, it means the services should be up 99.99% of the time. This also means the services can only be down for 52.5 minutes per year.

Note that availability only guarantees that we will receive a response; it doesn’t guarantee the data is the most up-to-date.

The diagram below shows how we can turn a single-node “Product Inventory” into a double-node architecture with high availability.

🔹Primary-Backup: the backup node is just a stand-by, and the data is replicated from primary to backup. When the primary fails, we need to manually switch to the backup node.   
The backup node might be a waste of hardware resources.  
   
🔹Primary-Secondary: this architecture looks similar to primary-backup architecture, but the secondary node can take read requests to balance the reading load. Due to latency when replicating data from primary to secondary, the data read from the secondary may be inconsistent with the primary.  
   
🔹Primary-Primary: both nodes act as primary nodes, both nodes can handle read/write operations, and the data is replicated between the two nodes. This type of architecture increases the throughput, but it has limited use cases. For example, if both nodes need to update the same product, the final state might be unpredictable. Use this architecture with caution!

If we deploy the node on Amazon EC2, which has 90% availability, the double-node architecture will increase availability from 90% to 99%.

Over to you: We’ve covered availability, but do these 3 architecture types also guarantee consistency, or not? Let us know your thoughts!

## Really cool and cute way to explain git commands.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdbf5dc47-8641-41e3-a770-70845b391605_1024x768.jpeg)


## How is email delivered?

Do you know how an email is delivered?

When I first learned how similar email is to traditional ‘snail’ mail, I was surprised. Maybe you will be, too. Allow me to explain.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F67074db5-b9fc-493f-84a8-312d5953b751_1975x1536.jpeg)


In the physical world, if I want to send a postcard to a friend, I would put it in a nearby mailbox. The postal office collects the mail regularly and relays it to the destination postal office. This postal office then puts the postcard in my friend’s mailbox. This process usually takes a few days and my friend receives my gratitude in paper form.

Email functions in a similar way. The terminology changes because it is an internet-based solution, but the fundamentals are the same:

1\. Instead of putting mail in a mailbox, the sender pushes an email to the Sender Mail Server using MUA (mail user agent,) such as Outlook or Gmail.

2\. Instead of using postal offices to relay mail, MTA (mail transmission agent) relays the email. It communicates via the SMTP protocol.

The email is received by the Receiver Mail Server. It stores the email to the Mailbox by using MDA (mail delivery agent.) The receiver uses MUA to retrieve the email using the POP3/IMAP protocol.

Over to you: if a recipient's email address is incorrect, the email will be returned to you. Do you know how does that work?

## Other things we made:

Our bestselling book “System Design Interview - An Insider’s Guide” is available in both paperback and digital format.

Paperback edition: [https://geni.us/XxCd](https://geni.us/XxCd)

Digital edition: [https://bit.ly/3lg41jK](https://bit.ly/3lg41jK)

**New System Design YouTube channel**: [https://bit.ly/ByteByteGoVideos](https://bit.ly/ByteByteGoVideos)