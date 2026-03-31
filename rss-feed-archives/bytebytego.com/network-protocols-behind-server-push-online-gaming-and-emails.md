Welcome to this new issue where we expand our exploration into essential network protocols and their various applications. The focus here is on understanding how different protocols shape the way we communicate and interact over the Internet. We will dive into the following areas:

+   The process through which servers can proactively send updates to clients using WebSockets.
    
+   The reason behind the choice of UDP protocol in gaming applications, and how its reliability can be enhanced.
    
+   The mechanisms involved in delivering emails via SMTP.
    

Each of these protocols serves unique purposes and empowers various functionalities in the digital world. Let's dive in to understand how these protocols bring life to our everyday online interactions.

## WebSocket

In our previous discussions, we examined HTTP and its role in typical request-response interactions between a client and a server. HTTP serves most scenarios well, especially when responses are immediate. However, in situations where the server needs to push updates to the client, especially when those updates depend on events not predictable by the client (such as another user's actions), HTTP may not be the most efficient approach. This is because HTTP is fundamentally a pull-based protocol where the client has to initiate all requests. So, how do we manage to push data from the server to the client without the client having to predict and request each update? There are typically four methods to handle this kind of push-based communication, as shown in the diagram below.

1.  Short polling
    

This is the most basic method. In this approach, the client, which could be a web app running in our browser, repeatedly sends HTTP requests to the server. Imagine this scenario: We log in to a web app and are presented with a QR code to scan with our smartphone. This QR code is usually for a specific action, like authentication or to initiate a certain process. The web app doesn't know the exact moment we scan the QR code. So, it keeps sending requests to the server every 1-2 seconds to check the status of the QR code. Once we scan the QR code with the smartphone, the server identifies the scan, and in response to the next check from the web app, sends back the updated status. This way, we’ll get a response within the next 1-2 seconds after scanning the QR code. This frequent checking is why we refer to this method as "short polling".

There are two problems with this: 

1.  It sends an excessive number of HTTP requests. This takes up bandwidth and increases the server load.
    
2.  In the worst scenario, we might wait up to 2 seconds for a response, causing noticeable delay.
    
2.  Long polling
    

Long polling tackles short polling issues by setting a longer timeout for HTTP requests. Think of it this way: we adjust the timeout to 30 seconds. If we scan the QR code within this timeframe, the server immediately sends a response. This approach significantly decreases the number of HTTP requests.

However, long polling isn’t without its challenge. Even though long polling cuts down the number of requests, each open request still maintains a connection to the server. If there are many clients, this can put strain on the server resources.

3.  WebSocket
    

Short and long polling work well for simpler tasks like QR code scanning. But for complex, data-heavy, and real-time tasks like online gaming, a more efficient solution is needed - enter WebSocket.

TCP, by nature, allows bidirectional data flow, enabling the client and server to send data to each other simultaneously. However, HTTP/1.1, built on TCP, doesn't fully utilize this capability. In HTTP/1.1, data transmission is generally sequential - one party sends data, then the other. This design, while sufficient for web page interactions, falls short for applications like online gaming that demand simultaneous, real-time communication. WebSocket, another protocol based on TCP, fills this gap by allowing full-duplex communication between client and server over a single connection. More on this later.

4.  SSE (Server-Sent Events)
    

SSE, or Server-Sent Events, stands out for a specific use case. When a client establishes an SSE connection, the server keeps this connection open to continuously send updates. This setup is perfect for situations where the server needs to regularly push data to the client, while the client just receives the data without needing to send information back to the server. A typical example is live stock market data updates. With SSE, servers can push real-time data to the client without needing a request every time an update is available. It's worth noting that, unlike WebSockets, SSE doesn't support bidirectional communication, making it less suitable for use cases that require back-and-forth communication.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F24a4e345-a575-43ce-9c26-075209d33283_1162x1600.png)



### How to Establish a WebSocket Connection

To set up a WebSocket connection, we need to include certain fields in the HTTP header. These headers tell the browser to switch to the WebSocket protocol. A randomly generated base64-encoded key (*Sec-WebSocket-Key*) is sent to the server.

```auto
Connection: Upgrade 
Upgrade: WebSocket
Sec-WebSocket-Key: T2a6wZlAwhgQNqruZ2YUyg==\r\n
```

The server responds with these fields in the HTTP header.

```auto
HTTP/1.1 101 Switching Protocols\r\n
Sec-WebSocket-Accept: iBJKv/ALIW2DobfoA4dmr3JHBCY=\r\n
Upgrade: WebSocket\r\n
Connection: Upgrade\r\n
```

The status code 101 means the protocol is switching. After this extra handshake, a WebSocket connection is established, as illustrated in the diagram below.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F9f2ff945-1c60-4e43-9252-474e74dc4fe7_1600x1303.png)



### WebSocket Message

Once HTTP upgrades to WebSocket, the client and server exchange data in frames. Let’s see what the data looks like.

[

![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F29d614b0-eed4-4286-a418-9cfea2f4a6ef_1600x576.png)



The Opcode, a 4-bit field, shows the type of frame data. 

+   “1” indicates a text frame.
    
+   “2” indicates a binary frame.
    
+   “8” is a signal to close the connection.
    

Payload length could be a 7-bit field or extended to include the extended payload length. If both length fields are fully utilized, the payload length could represent several terabytes of data.

WebSocket is suitable for online gaming, chat rooms, and collaborative editing applications. These require frequent interactions between client and server.

In the next part, we’ll discuss another important application-layer protocol - RPC (Remote Procedure Call).

## RPC

RPC allows the execution of a function on a different service. From the calling program’s perspective, it appears as if the function is being executed locally. The diagram below illustrates the difference between local and remote procedure calls. We could deploy modules like order management and payment either in the same process or on different servers. When deployed in the same process, it is a local function call. When deployed on different servers, it is a remote procedure call. 



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F15266000-1db4-4c06-991b-4297e2d061b5_1600x713.png)



Why do we need RPC? Can’t we use HTTP for communication between services? Let’s compare RPC and HTTP in the table below.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe781c1cc-d757-416f-8bad-816c5221aff0_1600x564.png)



The main advantage of RPC over HTTP is its lightweight message format and improved performance. An example is gRPC, which operates on HTTP/2 and delivers better performance due to this.

Let's examine how gRPC works from start to end:

Step 1: A REST call is made from the client. The request body is usually in JSON format.

Steps 2 - 4: The order service (acting as a gRPC client) receives the REST call, transforms it into a suitable format, and then initiates an RPC call to the payment service. gPRC encodes the client stub into binary format and sends it to the low-level transport layer.

Step 5: gRPC sends the packets over the network via HTTP2. Binary encoding and network optimizations make gRPC reportedly up to five times faster than JSON.

Steps 6 - 8: The payment service (acting as a gRPC server) receives the packets, decodes them, and invokes the server application.

Steps 9 - 11: The result from the server application gets encoded and sent to the transport layer.

Steps 12 - 14: The order service receives the packets, decodes them, and sends the result to the client application.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fb6bbeac1-5f1a-4ae6-8ede-3a29b81713eb_1600x1285.png)

