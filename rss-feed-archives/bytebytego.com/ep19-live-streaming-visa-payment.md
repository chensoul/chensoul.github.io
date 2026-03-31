In this newsletter, we’ll cover the following topics:

+   How live streaming works
    
+   Visa vs. American Express
    
+   Why is the credit card called **“the most profitable product in banks”**?
    
+   Why is single-threaded Redis fast (video)
    
+   Debugging Tactics
    

## Live streaming explained

How do video live streamings work on YouTube, TikTok live, or Twitch? The technique is called live streaming.  
   
Livestreaming differs from regular streaming because the video content is sent via the internet in real-time, usually with a latency of just a few seconds.  
   
The diagram below explains what happens behind the scenes to make this possible.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F5a3132b6-238f-4f59-9911-b15bd49aa8e7_1480x1820.png)


**Step 1**: The raw video data is captured by a microphone and camera. The data is sent to the server side.  
   
**Step 2**: The video data is compressed and encoded. For example, the compressing algorithm separates the background and other video elements. After compression, the video is encoded to standards such as H.264. The size of the video data is much smaller after this step.  
   
**Step 3**: The encoded data is divided into smaller segments, usually seconds in length, so it takes much less time to download or stream.  
   
**Step 4**: The segmented data is sent to the streaming server. The streaming server needs to support different devices and network conditions. This is called ‘Adaptive Bitrate Streaming.’ This means we need to produce multiple files at different bitrates in steps 2 and 3.  
   
**Step 5**: The live streaming data is pushed to edge servers supported by CDN (Content Delivery Network.) Millions of viewers can watch the video from an edge server nearby. CDN significantly lowers data transmission latency.   
   
**Step 6**: The viewers’ devices decode and decompress the video data and play the video in a video player.  
   
**Steps 7 and 8**: If the video needs to be stored for replay, the encoded data is sent to a storage server, and viewers can request a replay from it later.  
   
Standard protocols for live streaming include:

+   RTMP (Real-Time Messaging Protocol): This was originally developed by Macromedia to transmit data between a Flash player and a server. Now it is used for streaming video data over the internet. Note that video conferencing applications like Skype use RTC (Real-Time Communication) protocol for lower latency.
    
+   HLS (HTTP Live Streaming): It requires the H.264 or H.265 encoding. Apple devices accept only HLS format.
    
+   DASH (Dynamic Adaptive Streaming over HTTP): DASH does not support Apple devices.  
    Both HLS and DASH support adaptive bitrate streaming.
    

Over to you: What are some of the optimizations that can be done in this process? Which type of storage is suitable for video persistence in step 7

## Visa vs. American Express

What are the differences between VISA and American Express’s (AMEX) processing when you swipe credit cards?

The major difference is VISA uses a **4-party model** where the issuer and acquirer are different entities, while AMEX uses a **3-party model** where the issuer and acquirer are the same entity.

The diagram below uses the authorization flow to demonstrate the differences.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fc5ca0630-7a9a-4c3f-9587-41ec24055248_1742x2432.png)


🔹4-Party Model (Authorization Flow)

Step 0: The card-issuing bank issues a credit card to its customer. 

Step 1: The cardholder buys a product by swiping their credit card at the Point of Sale (POS) terminal in a merchant’s shop.

Step 2: The POS terminal sends the transaction to the acquiring bank, which provides the POS terminal.

Steps 3 and 4: The acquiring bank sends the transaction to the card network, also called the Card Scheme. This card network sends the transaction to the issuing bank for approval.

Steps 4.1, 4.2, and 4.3: The issuing bank freezes the money if the transaction is approved. The approval or rejection is sent back to the acquirer, and to the POS terminal. 

🔹3-Party Model (Authorization Flow)

Steps 0,1 and 2 are the same as in the 4-party model.

Step 3: Since one company performs issuing, acquiring, and card network functions, the transactions are processed internally within the franchisor. This is also called the closed loop card model. Closed loop networks are more efficient because all functions are processed in one franchisor. However, it doesn’t allow other entities to issue or acquire on its behalf, so it scales more slowly.

In recent years, the closed loop networks have partnered with other issuers and acquirers to scale their circulation.

Step 4: The approval or rejection is sent back to the acquirer, then to the POS terminal. 

## How does VISA profit from credit card use?

Why is the credit card called “**the most profitable product** in banks”? How does VISA/Mastercard make money?

The diagram below shows the economics of the credit card payment flow.


![No alt text provided for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F35d50d15-c7ce-4047-a009-1dcda36ae6a8_1486x1536.jpeg "No alt text provided for this image")


1\. The cardholder pays a merchant $100 to buy a product.

2\. The merchant benefits from the use of the credit card with higher sales volume, and needs to compensate the issuer and the card network for providing the payment service. The acquiring bank sets a fee with the merchant, called the “**merchant discount fee**”

3 - 4. The acquiring bank keeps $0.25 as the **acquiring markup**, and $1.75 is paid to the issuing bank as the **interchange fee**. The merchant discount fee should cover the interchange fee. 

The interchange fee is set by the card network because it is less efficient for each issuing bank to negotiate fees with each merchant.

5\. The card network sets up the **network assessments and fees** with each bank, which pays the card network for its services every month. For example, VISA charges a 0.11% assessment, plus a $0.0195 usage fee, for every swipe.

6\. The cardholder pays the issuing bank for its services.

Why should the issuing bank be compensated?

+   The issuer pays the merchant even if the cardholder fails to pay the issuer. 
    
+   The issuer pays the merchant before the cardholder pays the issuer.
    
+   The issuer has other operating costs, including managing customer accounts, providing statements, fraud detection, risk management, clearing & settlement, etc. 
    

Over to you: Does the card network charge the same interchange fee for big merchants as for small merchants?

## Why is Redis so fast?

## Debugging tactics

A picture is worth a thousand words.


![No alt text provided for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fa5439beb-908e-43ef-ac4e-87d7514ce8a7_1440x1440.jpeg "No alt text provided for this image")


What’s your favorite one? Anything missing?

**Thanks for making it this far!**

If you want to learn more about System Design, check out our books:

Paperback edition: [https://geni.us/XxCd](https://substack.com/redirect/4016f3e5-9e4b-42de-b705-10e4c79bf51c?r=1lr2rb)

Digital edition: [https://bit.ly/3lg41jK](https://substack.com/redirect/af1b901a-f683-4382-92a7-2cc925690707?r=1lr2rb)

Thank you for reading ByteByteGo Newsletter. This post is public so feel free to share it.

[Share](https://blog.bytebytego.com/p/ep19-live-streaming-visa-payment?utm_source=substack&utm_medium=email&utm_content=share&action=share)