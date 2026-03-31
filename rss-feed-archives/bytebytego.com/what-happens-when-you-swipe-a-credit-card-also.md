For this week’s newsletter, we will cover:

+   How does VISA work when we swipe a credit card at a merchant’s shop?
    
+   What are the differences between bare metal, virtual machines, and containers? (YouTube Video)
    
+   How do you pay from your digital wallets, such as Paytm, Paypal, and Venmo, by scanning the QR code?
    
+   Flash sale system
    
+   System design exercise
    

## How does VISA work when we swipe a credit card at a merchant’s shop?

VISA, Mastercard, and American Express act as card networks for clearing and settling funds. The card acquiring bank and the card issuing bank can be – and often are – different. If banks were to settle transactions one by one without an intermediary, each bank would have to settle the transactions with all the other banks. This is quite inefficient.   


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fff8ca955-df14-40bb-a5fa-0dfb2dc6b292_2613x3768.jpeg)


The diagram shows VISA’s role in the credit card payment process. There are two flows involved. Authorization flow happens when the customer swipes the credit card. Capture and settlement flow occurs when the merchant wants to get the money at the end of the day.

  
**🔹Authorization Flow**  
Step 0: The card issuing bank issues credit cards to its customers.   
   
Step 1: The cardholder wants to buy a product and swipes the credit card at the Point of Sale (POS) terminal in the merchant’s shop.  
   
Step 2: The POS terminal sends the transaction to the acquiring bank, which has provided the POS terminal.  
   
Steps 3 and 4: The acquiring bank sends the transaction to the card network, also called the card scheme. The card network sends the transaction to the issuing bank for approval.  
   
Steps 4.1, 4.2, and 4.3: The issuing bank freezes the money if the transaction is approved. The approval or rejection is sent back to the acquirer, as well as the POS terminal.   
   
**🔹Capture and Settlement Flow**  
Steps 1 and 2: The merchant wants to collect the money at the end of the day, so they hit ”capture” on the POS terminal. The transactions are sent to the acquirer in batches. The acquirer sends the batch file with transactions to the card network.  
   
Step 3: The card network performs clearing for the transactions collected from different acquirers, and sends the clearing files to different issuing banks.  
   
Step 4: The issuing banks confirm the correctness of the clearing files, and transfer money to the relevant acquiring banks.  
   
Step 5: The acquiring bank then transfers money to the merchant’s bank.   
   
Step 4: The card network clears the transactions from different acquiring banks. Clearing is a process in which mutual offset transactions are netted, so the number of total transactions is reduced.  
   
In the process, the card network takes on the burden of talking to each bank and receives service fees in return.  
   
Over to you: Do you think this flow is way too complicated? What will be the future of payments in your opinion?

## What are the differences between bare metal, virtual machines, and containers?

When deploying a modern application stack, how do we decide which one to use?

## How do you pay from your digital wallets, such as Paytm, Paypal, and Venmo, by scanning the QR code?

To understand the process involved, we need to divide the “scan to pay” process into two sub-processes:

1.  Merchant generates a QR code and displays it on the screen
    
2.  Consumer scans the QR code and pays
    
    
    ![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd9917c14-c50f-434a-9c79-5b04586cf2c2_1437x1999.png)
    
    

Here are the steps for generating the QR code:

1.  When you want to pay for your shopping, the cashier tallies up all the goods and calculates the total amount due, for example, $123.45. The checkout has an order ID of SN129803. The cashier clicks the “checkout” button.
    
2.  The cashier’s computer sends the order ID and the amount to PSP.
    
3.  The PSP saves this information to the database and generates a QR code URL.
    
4.  PSP’s Payment Gateway service reads the QR code URL.
    
5.  The payment gateway returns the QR code URL to the merchant’s computer.
    
6.  The merchant’s computer sends the QR code URL (or image) to the checkout counter.
    
7.  The checkout counter displays the QR code.
    

These 7 steps are completed in less than a second. Now it’s the consumer’s turn to pay from their digital wallet by scanning the QR code:

1.  The consumer opens their digital wallet app to scan the QR code.
    
2.  After confirming the amount is correct, the client clicks the “pay” button.
    
3.  The digital wallet App notifies the PSP that the consumer has paid the given QR code.
    
4.  The PSP payment gateway marks this QR code as paid and returns a success message to the consumer’s digital wallet App.
    
5.  The PSP payment gateway notifies the merchant that the consumer has paid the given QR code. 
    

Over to you: I have detailed how to pay using a dynamic QR code. It is dynamic because the QR code is dynamically generated each time. But sometimes, you could pay by scanning a printed QR code in a merchant’s shop, which is called the static QR code. Do you know how a static QR code works?

## Flash sale system

Designing a system with extremely high concurrency, high availability, and quick responsiveness needs to consider many aspects 𝐚𝐥𝐥 𝐭𝐡𝐞 𝐰𝐚𝐲 𝐟𝐫𝐨𝐦 𝐟𝐫𝐨𝐧𝐭𝐞𝐧𝐝 𝐭𝐨 𝐛𝐚𝐜𝐤𝐞𝐧𝐝. 

See the diagram below for details:


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fde93cbf9-b092-4ac4-a594-07d89b6f0411_2496x2316.jpeg)


𝐃𝐞𝐬𝐢𝐠𝐧 𝐩𝐫𝐢𝐧𝐜𝐢𝐩𝐥𝐞𝐬:

1.  Less is more. Fewer elements on the web page, fewer data queries to the database, fewer web requests, fewer system dependencies
    
2.  Short critical path. Fewer hops among services or merge into one service
    
3.  Async. Use message queues to handle high TPS
    
4.  Isolation.  Isolate static and dynamic contents, isolate processes and databases for rare items
    
5.  Overselling is bad. When and how to manage the inventory is important
    
6.  User experience is important. We don’t want to inform users that they have successfully placed orders but later tell them no items are available
    

## System design exercise

Let’s try something different today. 

Assuming in a system design interview, you are asked to design a distributed message queue. The following requirements are given:

1.  Producers send messages to a message queue. 
    
2.  Consumers consume messages from a message queue. 
    
3.  Messages can be consumed repeatedly or only once.
    

The diagram below shows the naive design. 


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F34e78566-89de-41c3-84ea-1c1b4f52ccf2_2048x1365.jpeg)


🔹Is the design correct?  
🔹Do you think the design satisfies all the requirements?  
🔹If not, what else should be added?

Feel free to make your assumptions, comment with anything you think might be helpful, or post your design.

## **Other things we made:**

Our bestselling book “System Design Interview - An Insider’s Guide” is available in paperback and digital format.

Paperback edition: [https://geni.us/XxCd](https://substack.com/redirect/3380c501-36fc-4719-a02d-a805cb0f5ef2?u=97001399)

Digital edition: [https://bit.ly/3lg41jK](https://substack.com/redirect/9b730e6f-9b87-4f96-b437-a9faaeae9a6f?u=97001399)

**New System Design YouTube channel**: [https://bit.ly/ByteByteGoVideos](https://substack.com/redirect/2e344e73-b4fb-466e-8430-603823be648c?u=97001399)