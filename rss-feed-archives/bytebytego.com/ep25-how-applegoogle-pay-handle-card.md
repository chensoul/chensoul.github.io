In this newsletter, we’ll cover the following topics:

+   How Apple Pay and Google Pay handle card info
    
+   JSON visualization tool
    
+   Unified Payments Interface (UPI) in India
    
+   How to pick the right database
    
+   How Google/Apple maps blur license plates and human faces on Street View
    

## Postman the API platform for building and using APIs (sponsored)


![Postman | Nordic APIs](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F29f886be-a94b-4d17-9ae8-8229f381442a_634x570.png "Postman | Nordic APIs")


Postman simplifies each step of the API lifecycle and streamlines collaboration so you can create better APIs—faster. The platform is cloud-native and includes the comprehensive suite of features enterprises are looking for, including SSO, audit, platform security, and much more.

**API repository**

Postman can store and manage API specifications, documentation, workflow recipes, test cases and results, metrics, and everything else related to APIs.

**Workspaces**

Postman workspaces are collaborative places where teams gather and solve problems. Every person in a workspace sees the same API tools, collections, and environments, which are updated in real-time.

**API lifecycle**

The Postman platform includes a comprehensive set of tools that help accelerate the API lifecycle—from design, testing, documentation, and mocking to the sharing and discoverability of your APIs.

**Governance**

Postman's full-lifecycle approach to governance lets adopters shift left in their development practices, producing better-quality APIs and fostering collaboration between developer and API design teams.

[Learn More about Postman](https://bit.ly/3xMFBFe)

## How do Apple Pay and Google Pay handle sensitive card info?

The diagram below shows the differences. Both approaches are very secure, but the implementations are different. To understand the difference, we break down the process into two flows.

1 Registering your credit card flow

2 Basic payment flow


![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fb32cb5f4-92c6-4859-b825-92b04b6daf1e_1357x1536.jpeg "No alternative text description for this image")


1\. The registration flow is represented by steps 1~3 for both cases. The difference is:  
**Apple Pay**: Apple doesn’t store any card info. It passes the card info to the bank. Bank returns a token called DAN (device account number) to the iPhone. iPhone then stores DAN into a special hardware chip.  
**Google Pay**: When you register the credit card with Google Pay, the card info is stored in the Google server. Google returns a payment token to the phone.

2\. When you click the “Pay” button on your phone, the basic payment flow starts. Here are the differences:  
**Apple Pay**: For iPhone, the e-commerce server passes the DAN to the bank.  
**Google Pay**: In the Google Pay case, the e-commerce server passes the payment token to the Google server. Google server looks up the credit card info and passes it to the bank.

In the diagram, the red arrow means the credit card info is available on the public network, although it is encrypted. 

References:

\[1\] [Apple Pay security and privacy overview](https://support.apple.com/en-us/HT203027)

\[2\] [Google Pay for Payments](https://developers.google.com/pay/api/android/overview)

\[3\] [Apple Pay vs. Google Pay: How They Work](https://www.investopedia.com/articles/personal-finance/010215/apple-pay-vs-google-wallet-how-they-work.asp)

## JSON visualization tool

If you use JSON files, you'll probably like this tool.

Nested JSON files are hard to read.

**[JsonCrack](https://github.com/AykutSarac/jsoncrack.com)** generates graph diagrams from JSON files and makes them easy to read.

Additionally, the generated diagrams can be downloaded as images.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fdd91bd92-ce51-43fc-8ab5-039646d57387_3264x1472.png)


## Unified Payments Interface (UPI) in India

What’s UPI? UPI is an instant real-time payment system developed by the National Payments Corporation of India.

It accounts for 60% of digital retail transactions in India today.

UPI = payment markup language + standard for interoperable payments

**Registration & Link to Bank Account**


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fb585d36d-081b-4bc6-bca2-68268faf5bd9_1044x1280.png)


**Direct payment**


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F60eedf58-289e-4409-a414-c65fb10beece_1006x1280.png)


## How to pick the right database?

## How do Google/Apple maps blur license plates and human faces on Street View

The diagram below presents a possible solution that might work in an interview setting.



![No alt text provided for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F3c7b1f91-e590-4a93-b9d3-f5f8d49ef035_1280x1800.jpeg "No alt text provided for this image")


The high-level architecture is broken down into three stages:

1.  Data pipeline - prepare the training data set 
    
2.  Blurring pipeline - extract and classify objects and blur relevant objects, for example, license plates and faces.
    
3.  Serving pipeline - serve blurred street view images to users.
    

**Data pipeline**  
Step 1: We get the annotated dataset for training. The objects are marked in bounding boxes.

Steps 2-4: The dataset goes through preprocessing and augmentation to be normalized and scaled.

Steps 5-6: The annotated dataset is then used to train the machine learning model, which is a 2-stage network.  

**Blurring pipeline**  
Steps 7-10: The street view images go through preprocessing, and object boundaries are detected in the images. Then sensitive objects are blurred, and the images are stored in an object store.

**Serving pipeline**  
Step 11: The blurred images can now be retrieved by users.

**Thanks for making it this far!**

If you want to learn more about System Design, check out our books:


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd646f4c4-2d40-4424-b0be-8544b127229c_352x257.png)


[Paperback edition](https://substack.com/redirect/1f4b30c8-c4cc-46d7-ad0c-5a06f37e9ad3?r=1lr2rb)

[Digital editio](https://substack.com/redirect/4fd9f253-9166-4dca-8e3d-8e24e2607e81?r=1lr2rb)n