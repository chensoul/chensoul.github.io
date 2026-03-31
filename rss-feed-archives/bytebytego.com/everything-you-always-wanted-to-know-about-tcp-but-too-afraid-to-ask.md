In this issue, we dive into one of the most important protocols - Transmission Control Protocol (TCP).

Recalling our previous issue, client-server communications rely on HTTP and WebSocket. While HTTP is used for stateless, request/response communication, WebSocket is used for persistent, bi-directional communication. Crucially, both rely on TCP. 

## Connection-oriented, reliable, and bitstream-oriented

The IP protocol at the network layer is inherently unreliable. It is responsible for delivering packets from one IP address to another without any guarantees for delivery, order, or even the completeness of the data in the packet. This is where TCP steps in to ensure reliable data transmission.

There are 3 important features of TCP:

1.  TCP is connection-oriented. Unlike UDP which sends data from one server to multiple servers, TCP establishes a connection between two specific servers.
    
2.  TCP is reliable. TCP guarantees the delivery of the segments, no matter what the network condition is.
    
3.  TCP is bitstream-oriented. With TCP, application layer data is segmented. The transport layer remains oblivious to the boundary of a message. In addition, the segments must be processed sequentially, and duplicated segments are discarded.
    

To identify a unique TCP connection, we use the following fields, often referred to as a 4-tuple.

+   Source and destination IP addresses. Located in the IP header, these direct the IP protocol on data routing.
    
+   Source and destination ports. Found in the TCP header, these instruct the TCP protocol on which process should receive the segments.
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F30a07a70-c0dd-4e5e-b949-042c7368cc39_1600x934.png)



## More on TCP header

We have already touched on the source and destination ports in the TCP header. Let’s further investigate other fields in the TCP header, especially those essential for TCP connection establishment. The diagram below highlights these significant fields.

+   Sequence number
    

When we establish a new TCP connection, a random 32-bit value is assigned as the initial sequence number. The receiving end uses this sequence number to send back an acknowledgment. The sequence number serves as a mechanism to ensure sequential processing of the segments at the receiving end.

+   Acknowledgment number
    

This 32-bit number is used by the receiver to request the next TCP segment. This value is the sequence number incremented by one. When the sender receives this acknowledgment, it can assume that all preceding data has been received successfully. This mechanism works to prevent any data losses.

+   Flags
    

Also known as control bits, flags indicate the purpose of a TCP message. As we will explore in the next section, there are different types of TCP messages. The control bits indicate whether the message is for establishing a connection, transmitting data, or terminating a connection. 

+   ACK - Used for acknowledgments.
    
+   RST - Used to reset the connection when there are irrecoverable errors.
    
+   SYN - Used for the initial 3-way handshake. The sequence number field must be set.
    
+   FIN - Used to terminate the connection.
    

In the next section, we’ll see how these fields are used during TCP connection establishment.

## Establishing a TCP connection: The 3-way handshake

Let's explore how TCP establishes a connection, a process known as a 3-way handshake, illustrated in the diagram below.

Step 0: Initially, both client and server are in a CLOSE state. The server starts by listening on a specific port for incoming connections.

Step 1: The client initiates a connection by sending a SYN segment to the server. It assigns a random number to the sequence number, known as the Initial Sequence Number (ISN). The SYN control bit is set to 1, transitioning the client into the SYN-SENT state.

Step 2: Upon receiving the SYN segment, the server assigns a random number to the sequence number and sets the acknowledgment number to *client\_isn+1*. Then, it sets both the SYN and ACK control bits to 1 and sends this segment back to the client. At this point, the server enters the SYN-RECEIVED state.

Step 3: The client, after receiving the SYN+ACK segment, sends back an ACK segment, setting the acknowledgment number to *server\_isn+1*. This segment can now carry application-layer data, and the client enters the ESTABLISHED state. Once the server receives the ACK segment, it too enters the ESTABLISHED state.

It’s worth noting that the first two handshakes cannot carry data, but the third one can. Following the 3-way handshake, the client and server can start exchanging data.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F781159a5-f60e-4c94-b815-c8abd8d73b12_1600x1442.png)



TCP is reliable, so what happens when a segment is lost?

+   If the SYN is lost
    

If the client doesn’t receive SYN+ACK within a set timeframe, it resends the SYN segment several times (the default is 5). If the SYN+ACK segment still doesn’t arrive, the client terminates the connection, transitioning from SYN\_SENT to CLOSED state.

+   If the SYN+ACK is lost
    

The client cannot distinguish between the loss of a SYN segment or SYN+ACK segment, so it resends the SYN segment and closes the connection after several attempts.

If the server doesn’t receive the ACK within a certain time, it resends the SYN+ACK segment and closes the connection after several attempts. 

+   If the ACK is lost
    

If the server doesn’t receive the ACK segment, it initiates a resend. Note that the client does not resend the ACK segment. If the server fails to receive the ACK segment even after resending, it closes the connection.

## Closing a TCP connection: The 4-way handshake

Let’s now move on to how a TCP connection is terminated. Both client and server can initiate the termination. In the diagram below, the client initiates the termination.

Step 1: The client initiates by sending a FIN segment to the server, transitioning into the FIN\_WAIT\_1 state.

Step 2: After receiving the FIN segment, the server responds with an ACK segment and enters the CLOSE\_WAIT state. After receiving the ACK segment, the client enters the FIN\_WAIT\_2 state.

Step 3: Once the server finishes processing, it sends a FIN segment to the client and enters the LAST\_ACK state.

Step 4: After receiving the FIN segment, the client sends an ACK segment and enters the TIME\_WAIT state. The server, after receiving the ACK segment, moves to the CLOSED state. After waiting for a 2MSL (Maximum Segment Lifetime) duration, the client also transitions to the CLOSED state. The MSL is the longest period a TCP segment can exist in network, arbitrarily defined as 2 minutes.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1e386fb3-7fc6-477a-aa50-c314a462a349_1600x1591.png)



To dive deeper into TCP handshake, let’s consider three edge cases:

1.  The client is down
    
2.  The server is down
    
3.  The network cable gets damaged
    

## What happens if the client goes down after establishing a TCP connection?

Let’s consider a scenario where a TCP connection has been established between client and server, and then the client suddenly goes offline. What would happen?

If the server doesn’t attempt to send data to the client, there is no way for the server to know about the client’s status. The server would remain in the ESTABLISHED state. A solution to this issue is the implementation of TCP keepalive.

With TCP keepalive, a set of timers are associated with the established TCP connection. When the keepalive timer expires, the server sends a keepalive probe to the client. This probe is an ACK segment with no data. If several consecutive probe segments are sent without any response from the client, the server presumes the TCP connection is dead.

Now let’s dive deeper into TCP keepalive across four scenarios:

1.  The client is functioning normally. The server sends a keepalive probe and receives a reply. The keepalive timer resets, and the server will send the next probe when the timer expires again.
    
2.  The client process is down. The operating system on the client side sends a FIN segment to the server when it reclaims process resources. 
    
3.  The client machine goes offline and restarts. As the diagram below shows, when the client comes back online, it has no knowledge of the previous connection. When the server attempts to send data to the client over this dead connection, the client replies with an RST segment, which forces the server to close the connection.
    
4.  The client's machine goes offline and doesn’t recover. We’ve talked about this scenario - after several unanswered probes, the server considers the connection as dead.
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5d679ed7-acee-4b70-8536-867bf71a50bc_1486x1600.png)



Similar mechanisms apply when the server goes down after a TCP connection is established, as TCP is a duplex protocol.