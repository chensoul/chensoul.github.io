In this newsletter, we’ll cover the following topics:

+   Reliability of HTTPs
    
+   The CRON Cheatsheet
    
+   Understanding REST API
    
+   ISO standards applied to smart cards
    

## Is HTTPs safe?

If HTTPS is safe, how can tools like Fiddler capture network packets sent via HTTPS?

The diagram below shows a scenario where a malicious intermediate hijacks the packets.

Prerequisite: root certificate of the intermediate server is present in the trust-store.


![a close up of text and logo over a white background](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F77e1c6e7-eff9-4028-813f-7509d1f141d3_1835x1536.jpeg "a close up of text and logo over a white background")


**Step 1** - The client requests to establish a TCP connection with the server. The request is maliciously routed to an intermediate server, instead of the real backend server. Then, a TCP connection is established between the client and the intermediate server.

**Step 2** - The intermediate server establishes a TCP connection with the actual server.

**Step 3** - The intermediate server sends the SSL certificate to the client. The certificate contains the public key, hostname, expiry dates, etc. The client validates the certificate. 

**Step 4** - The legitimate server sends its certificate to the intermediate server. The intermediate server validates the certificate.

**Step 5** - The client generates a session key and encrypts it using the public key from the intermediate server. The intermediate server receives the encrypted session key and decrypts it with the private key. 

**Step 6** - The intermediate server encrypts the session key using the public key from the actual server and then sends it there. The legitimate server decrypts the session key with the private key.

**Steps 7 and 8** - Now, the client and the server can communicate using the session key (symmetric encryption.) The encrypted data is transmitted in a secure bi-directional channel. The intermediate server can always decrypt the data.

## CRON Cheatsheet

CRON cheatsheet by @[Handbook](https://twitter.com/LinuxHandbook) on Twitter.


![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fac51042f-da68-4fe9-afb3-faa9c9880708_2048x1100.jpeg "No alternative text description for this image")


## What Is REST API?

REST is the most common communication standard between computers over the internet. What is it? Why is it so popular?

## The ISO standards of smart cards

Do you know how to explain to a 10-year-old what all the symbols/numbers on the smart credit card mean?

Do you know that smart credit cards have ISO standards? Let’s take a look:


![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ff12e89b2-e878-4729-b120-f805c738a122_1978x1472.jpeg "No alternative text description for this image")


+   ISO 7813: defines the card size and shape
    
+   ISO 7816: defines smart card integrated chips, such as the EMV (Europay, Mastercard, and Visa) chip
    
+   ISO 7812: defines the PAN (permanent account number) structure
    
+   ISO 7811: defines the magnetic stripe details
    
+   ISO 14443: defines contactless card
    

**Thanks for making it this far!**

If you want to learn more about System Design, check out our books:

[

![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F63ffae61-116b-417e-bec7-73eb2c3b7d53_3933x2877.png)

](https://geni.us/XxCd)

[Paperback edition](https://geni.us/XxCd)

[Digital edition](https://bit.ly/3lg41jK)