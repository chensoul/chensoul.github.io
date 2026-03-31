In distributed systems, data is sent over the network using various network protocols. As an application developer, this often seems like a block box until an issue arises.

In this issue, we’ll explain how common network protocols work, where they are used in distributed systems, and how we troubleshoot common problems. We’ll cover some popular interview questions as well. For example:

+   What happens when we type a URL in a web browser?
    
+   What is the TCP 3-way handshake?
    
+   What is TCP time\_wait?
    
+   What are HTTP 1/2/3? 
    
+   Why does HTTP 3 use UDP?
    
+   How does HTTPS work?
    
+   Why is UDP considered “unreliable”?
    

Let’s first look at where the network protocols are used.

## Internet and the OSI Model

The Internet links a wide range of computing devices around the world. We can get a rough idea from the diagram below. Suppose we access a website from a smartphone or laptop, which connects to a cellular tower. The tower connects to a router, which then accesses the internet via Internet Service Providers (ISPs). Packets are forwarded to a local ISP, then to the network hosting the website. Once the packets reach the company network, they go through a link-layer switch and reach the appropriate server.

Both routers and link-layer switches are packet switches, and their job is to forward packets. The difference is that routers are usually used in the network core to connect multiple networks, while link-layer switches are used in access networks (the network that physically connects an end system to an edge router), connecting several devices in a single network.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F83a3c8d3-7fc7-4d71-91f7-64adfe65a65e_1169x1600.png)



Why do we need network protocols? Internet-connected devices need to communicate in a language that they can understand. Various computer systems communicate with each other using a standard specified by the OSI (Open Systems Interconnection) model. The OSI model has seven abstract layers, each with distinct responsibilities and protocols.

The diagram below shows what each layer does in the OSI model. Each intermediate layer serves a class of functionality to the layer above it and is served by the layer below it. Let’s review them.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8c53f73a-c6ec-45cc-afb5-4018ac97a488_1600x1085.png)



1.  Application Layer
    

The application layer is the closest to the end users. Most applications reside in this layer. We request data from a backend server without needing to understand data transmission specifics. Protocols in this layer include HTTP, SMTP, FTP, DNS, etc. We will cover them later.

2.  Presentation Layer
    

This layer handles data encoding, encryption, and compression, preparing data for the application layer. For example, HTTPS leverages TLS (Transport Layer Security) for secure communications between clients and servers. 

3.  Session Layer
    

This layer opens and closes the communications between two devices. If the data size is large, the session layer sets a checkpoint to avoid resending from the beginning.

4.  Transport Layer
    

This layer handles end-to-end communication between the two devices. It breaks data into segments at the sender’s side and reassembles them at the receiver’s. There is flow control in this layer to prevent congestion. Key protocols in this layer are TCP and UDP, which we’ll discuss later.

5.  Network Layer
    

This layer enables data transfer between different networks. It further breaks down segments or datagrams into smaller packets and finds the optimal route to the final destination using IP addresses. This process is known as routing.

6.  Data Link Layer
    

This layer allows data transfer between devices on the same network. Packets are broken down into frames, which are confined to a local area network. 

7.  Physical Layer
    

This layer sends bitstreams over cables and switches, making it closely associated with the physical connection between devices.

Compared to the OSI model, the TCP/IP model only has 4 layers. When discussing layers, it’s important to specify the context.

Now that we understand the responsibilities of each layer, let’s summarize the data transfer process using the following diagram. This is called encapsulation and decapsulation. Encapsulation involves adding headers to the data as it travels towards its destination. Decapsulation removes these headers to retrieve the original data.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F98d7dda0-c161-4568-80f2-6f06d25eb804_1600x1147.png)



Step 1: When Device A sends data to Device B over the network using HTTP, an HTTP header is initially added at the application layer.

Step 2: A TCP or a UDP header is added to the data. It is encapsulated into TCP segments at the transport layer. The header contains the source port, destination port, and sequence number.

Step 3: The segments are then encapsulated with an IP header at the network layer. The IP header contains the source and destination IP addresses.

Step 4: An MAC header is added to the IP datagram at the data link layer, containing the source and destination MAC addresses.

Step 5: The encapsulated frames are sent to the physical layer and sent over the network as bitstreams.

Steps 6-10: When Device B receives the bits from the network, it initiates the de-encapsulation process, which is the reverse of the encapsulation process. Headers are removed layer by layer, until Device B can access the original data.

Note that each layer uses the headers for processing instructions and does not need to unpack the data from the previous layer.

How do the OSI model layers map to a Linux server implementation? The diagram below provides more detail. The Linux network protocol stack aligns closely with the 4-layer TCP/IP model. The application sends data to the socket via system calls. The socket serves an abstraction for the communication endpoint. The socket layer accepts the data and passes it to the transport and network layer. The data eventually reaches the Network Interface Card (NIC) and is sent over the network. 



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F549ab694-47bf-4551-a392-8d74a1dc0b8b_854x1600.png)



In the next section, we will explore the common network protocols used when visiting an eCommerce website.