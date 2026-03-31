#### Discover more from ByteByteGo Newsletter

Explain complex systems with simple terms, from the authors of the best-selling system design book series. Join over 500,000 friendly readers.

## Why is Kafka fast?

Why is Kafka fast?

Kafka achieves low latency message delivery through Sequential I/O and Zero Copy Principle. The same techniques are commonly used in many other messaging/streaming platforms. 

The diagram below illustrates how the data is transmitted between producer and consumer, and what zero-copy means.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fff3743a9-915c-44c8-9bc3-562a754035f8_2469x2973.jpeg)


🔹Step 1.1 - 1.3: Producer writes data to the disk 

🔹Step 2: Consumer reads data without zero-copy  
2.1: The data is loaded from disk to OS cache  
2.2 The data is copied from OS cache to Kafka application  
2.3 Kafka application copies the data into the socket buffer   
2.4 The data is copied from socket buffer to network card  
2.5 The network card sends data out to the consumer

🔹Step 3: Consumer reads data with zero-copy  
3.1: The data is loaded from disk to OS cache  
3.2 OS cache directly copies the data to the network card via sendfile() command  
3.3 The network card sends data out to the consumer

Zero copy is a shortcut to save the multiple data copies between application context and kernel context. This approach brings down the time by ​​approximately 65%.

If you enjoyed this post, you might like our system design interview books as well.

SDI-vol1: [https://amzn.to/3tK0qQn](https://amzn.to/3tK0qQn)

SDI-vol2: [https://amzn.to/37ZisW9](https://amzn.to/37ZisW9)