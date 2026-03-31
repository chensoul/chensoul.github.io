In this issue, we’re diving into the foundation of data communication for the World Wide Web - HTTP.

## What is Hypertext?

HTTP, or **H**yper**T**ext **T**ransfer **P**rotocol, owes its name to ‘hypertext’.

So, what exactly is hypertext?

Imagine a blend of text, images, and videos that are stitched together by the magic of hyperlinks. These links serve as portals that allow us to jump from one set of hypertext to another. HTML, or HyperText Markup Language, is a prime example of hypertext.

HTML is a plain text file. It’s packed with many tags that define links to images, videos, and more. After the browser interprets these tags, it transforms the seemingly ordinary text file into a webpage filled with text and images.

## HTTP/1.1, HTTP/2, and HTTP/3

HTTP has undergone significant transformations since its inception in 1989 with version 0.9. Let’s take a walk down memory lane and see the problems each version of HTTP addresses. The diagram below shows the key improvements.

+   HTTP/1.0 was finalized and formally documented in 1996. This version had a key limitation: each request to the same server required a separate TCP connection.
    
+   HTTP/1.1 arrived next in 1997. It introduced the concept of a ‘persistent connection’, which means a TCP connection could be left open for reuse. Despite this enhancement, HTTP/1.1 couldn’t fix the issue of ‘Head-of-Line’ (HOL) blocking. In simple terms, HOL blocking happens when all parallel request slots in a browser are filled, forcing subsequent requests to wait until previous ones are complete.
    
+   HTTP/2.0, published in 2015, sought to tackle the HOL blocking issue. It implemented ‘request multiplexing’, a strategy to eliminate HOL blocking at the application layer. As illustrated in the diagram below, HTTP/2.0 introduced the concept of HTTP ‘streams’. This abstraction allows the multiplexing of different HTTP exchanges onto the same TCP connection, freeing us from the need to send each stream in order. However, HOL blocking could still occur at the transport (TCP) layer.
    
+   HTTP/3.0 made its debut with a draft published in 2020. Positioned as the successor to HTTP/2.0, it replaces TCP with [QUIC](https://en.wikipedia.org/wiki/QUIC) as the underlying transport protocol. This effectively eliminates HOL blocking at the transport layer. QUIC is based on UDP. It introduces streams as first-class citizens at the transport layer. QUIC streams share the same QUIC connection, requiring no additional handshakes or slow starts to create new ones. QUIC streams are delivered independently. It means that in most cases packet loss in one stream doesn't impact others.
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5003d37e-5ee1-4703-bf1b-337c0a628ea5_1600x1302.png)



## HTTP Headers

HTTP headers play a crucial role in how clients and servers send and receive data. They provide a structured way for these entities to communicate important metadata about the request or response. This metadata can contain various information like the type of data being sent, its length, how it's compressed, and more.

An HTTP header consists of several fields, each with a specific role and meaning. Now that we have an understanding of what HTTP headers are, let's dive deeper into some specific HTTP fields.

## HTTP Fields

When we send HTTP requests to a server, several common fields play a critical role. Let’s dissect some of them.

+   *Host*: This is the domain name of the server.
    
+   *Content-Length*: This field in the request or response header plays a crucial role in data transfer. It specifically indicates the size of the body of the request or response in bytes. This helps the receiver understand when the current message ends and potentially prepare for the next one, especially in cases where multiple HTTP messages are being sent over the same connection. 
    
+   *Connection*: This field is crucial in HTTP persistent connections, where a single TCP connection is used to send and receive multiple HTTP requests and responses. We will discuss this in more detail.
    
+   *Content-type*: This field tells the client the format of the data it’s receiving.
    
+   *Content-encoding*: This field indicates the compression format used for the data. For example, if the client sees ‘*gzip’* encoding, it knows it needs to decompress the data.
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F211989e2-748f-4e06-942e-b614ab94141c_1298x1600.png)



## HTTP GET vs HTTP POST

HTTP protocols define various methods or ‘verbs’ to perform different actions on web resources. The commonly used ones are GET, POST, PUT, and DELETE, which are often used to read, create, update, and delete resources. Less common methods include HEAD, CONNECT, OPTIONS, TRACE, and PATCH, which we covered in our previous “API Design” issues.

One common interview question is: “What is the difference between GET and POST?” Let’s dive into their definitions.

HTTP GET: This method retrieves resources from the server via URLs without producing any other effect. As GET requests usually lack a payload body, they enable bookmarking, sharing, and caching of web pages.

HTTP POST: This method interacts with resources based on the payload body. The interaction varies depending on the resource type. For example, if we’re leaving a comment after purchasing an iPhone 14, clicking “submit” sends a POST request to the server with the comment in the message body. While there's no defined limit to the size of the message body in a POST request by the HTTP protocol itself, in practice, browsers and servers often impose their own limits.

### Understanding the Characteristics of GET and POST

HTTP methods have certain properties that define how they interact with server resources. Two such properties are whether they're 'non-mutating' and 'idempotent.'

A non-mutating method doesn't alter any server resources. On the other hand, an idempotent method produces the same result, regardless of how many times it's repeated.

HTTP GET:  The GET method retrieves data without causing changes, making it non-mutating. Additionally, repeating a GET request won't change the outcome, making it idempotent. 

HTTP POST: Unlike GET, the POST method sends data that can modify server resources, making it potentially mutating. Furthermore, if we repeat a POST request, it can create additional resources, making it non-idempotent.

However, it's important to note that actual behavior can depend on how the server implements these methods. While the standards suggest certain behaviors, developers sometimes use these methods in non-standard ways. For instance, a GET method might be used to delete data (making it both mutating and non-idempotent), or a POST method may be used to retrieve data (making it non-mutating and potentially idempotent).

One infamous example of non-standard usage involved a blogger who implemented post deletion operations with HTTP GET, assuming no one would visit the blog. But when Google crawled the blog, all posts were deleted!

It's also essential to remember that when it comes to security and preventing information leaks, neither GET nor POST is inherently secure. GET parameters are visible in the URL, while POST bodies, though not visible in the URL, can still be intercepted if not encrypted. To ensure secure data transmission, the use of HTTPS is advised, a topic we will discuss in more detail later.

## HTTP Keep-Alive vs TCP keepalive

We’ve discussed how HTTP can initiate a persistent connection using “Connection: Keep-Alive”. Recall that in the issue about TCP, we’ve also mentioned TCP’s keepalive mechanism. Are they the same? No, they’re quite different:

+   HTTP Keep-Alive, linked to HTTP persistent connections, operates at the application layer.
    
+   TCP keepalive, working at the transport layer, keeps a TCP connection alive during periods of data exchange inactivity.
    

Let’s dive deeper.

### HTTP Keep-Alive

HTTP, except for HTTP/3, is built on TCP. Establishing an HTTP connection requires a 3-way TCP handshake. After sending an HTTP request and receiving a response, the TCP connection disconnects. 

Sending multiple requests to the same server this way is quite inefficient. Wouldn’t it be better to reuse the same TCP connection? That’s the purpose of HTTP Keep-Alive. It maintains the TCP connection until either party requests disconnection.

HTTP/1.1 enables HTTP Keep-Alive by default. 

HTTP Keep-Alive reduces the overhead of opening and closing TCP connections. It's even more powerful when combined with HTTP/2, which introduces the concept of “streams”.

Streams allow us to send multiple requests simultaneously without waiting for server responses. More importantly, these requests and responses can be handled out of order, which is not possible with only HTTP Keep-Alive.

The comparison diagram below shows the difference between HTTP Keep-Alive and HTTP/2 streams. Normally, we wait for the first response before sending a second request. With HTTP/2 streams, we can send multiple requests simultaneously without waiting for the first response, and the server can respond out of order.  

Why is this important? This feature is crucial to avoid head-of-line (HOL) blocking. In earlier versions of HTTP, if the server takes a long time to process one request, subsequent requests have to wait, leading to delays. But with HTTP/2 streams, each request is independent. Even if a server takes longer to process one request, it can still respond to other requests. Responses can come back as soon as they're ready, even if that means they're not in the original request order.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd9d498fd-b0ce-49af-91a5-3fcae4680514_1600x1046.png)



### TCP keepalive

TCP keepalive is unrelated to HTTP Keep-Alive. In a TCP connection, both parties remain in the ESTABLISHED state until one ends it. If one party disconnects without notifying the other, the remaining party wouldn’t know about it. TCP keepalive addresses this by periodically sending probes when there’s no data exchange. We discussed this in our previous TCP issue. The following diagram should serve as a refresher.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F339a0b68-b25f-49a2-a810-35297d4e5bc7_1344x1600.png)

