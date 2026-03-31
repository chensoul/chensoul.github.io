This week’s system design refresher:

+   Top 5 Most Used Architecture Patterns (Youtube video)
    
+   OAuth 2.0 Flows
    
+   Understanding Database Types
    
+   Types of Software Engineers and Their Typically Required Skills
    
+   How does a Password Manager Work?
    

## [Implement passkey authentication in minutes (Sponsored)](https://bit.ly/1Password090223B)

[![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F01fa9e69-3f30-41df-93ce-090bb35976e7_2153x1425.png)



Join TikTok, Paypal, Google, and other leading tech companies by giving your users a faster and more secure sign-in experience with passkeys. Building an in-house auth solution takes months and requires ongoing maintenance from security engineers. But there’s a better way. Passage by 1Password is a cross-platform, ready-to-ship passkey solution. ByteByteGo readers get an exclusive six-month free trial – just use the code ‘BYTEBYTEGO6MO’ once you sign up in the console.

[Learn More](https://bit.ly/1Password090223B)

## **Top 5 Most Used Architecture Patterns**

## OAuth 2.0 Flows

Authorization Code Flow: The most common OAuth flow. After user authentication, the client receives an authorization code and exchanges it for an access token and refresh token.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3bb5a764-b23e-426b-83d2-8e87cc1d42e2_1280x1674.jpeg)



Client Credentials Flow: Designed for single-page applications. The access token is returned directly to the client without an intermediate authorization code.

Implicit Code Flow: Designed for single-page applications. The access token is returned directly to the client without an intermediate authorization code.

Resource Owner Password Grant Flow: Allows users to provide their username and password directly to the client, which then exchanges them for an access token.

Over to you - So which one do you think is something that you should use next in your application?

## [Scale automated QA without overspending (Sponsored)](https://bit.ly/QAWolf090223d)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F29ff9695-28cb-43d6-901b-62428b115f51_2000x1500.png)



Most QA teams are too resource-constrained to maintain an automated end-to-end test suite for their entire product. But costs to scale QA are hard to justify. The end result? Gaps in test coverage and bugs shipped to production. Here's a cost-effective solution to get 80% automated test coverage in just 4 months.

[QA Wolf](https://bit.ly/QAWolf090223a) is a new technology-enabled service that leverages Playwright to build end-to-end test suites. Plus, they include 24-hour maintenance (ask about their [zero flake guarantee)](https://bit.ly/QAWolf090223b) and unlimited parallel runs on their Kubernetes infrastructure.

Current customers include Cohere, Gumroad, and Napster (and they boast a 4.8/5 rating on G2).

[Find out how QA Wolf works](https://bit.ly/QAWolf090223c) 🐺

[Learn more](https://bit.ly/QAWolf090223d)

## Understanding Database Types

To make the best decision for our projects, it is essential to understand the various types of databases available in the market. We need to consider key characteristics of different database types, including popular options for each, and compare their use cases.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fe1156082-ac78-421d-a582-1c643bc90479_1536x1536.jpeg)



## Types of Software Engineers and Their Typically Required Skills

In this overview, we'll explore three key types of Software engineers:



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Faf766ec0-bbf2-4141-bbc3-44fd5cc3492c_1376x1536.jpeg)



1.  Front-End Engineer:  
    Specializes in creating user interfaces using HTML, CSS, and JavaScript. They focus on ensuring that apps are visually appealing and user-friendly.
    
2.  Back-End Engineer:  
    Works on the server-side of web applications, managing data, business logic, and server infrastructure to ensure functionality, performance, and security.
    
3.  Full-Stack Engineer:  
    A versatile expert who combines the roles of Front-End and Back-End engineers, handling UI design, server-side tasks, databases, APIs, and ensuring seamless application integration. They cover the entire development spectrum from start to finish.
    

Over to you: Which type of software engineer resonates most with your interests and career aspirations?

## How does a Password Manager such as 1Password or Lastpass work?

How does it keep our passwords safe?

The diagram below shows how a typical password manager works.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd0c050b2-4af9-4af5-8f17-44ee05ab3625_1292x1536.jpeg)



A password manager generates and stores passwords for us. We can use it via application, browser extension, or command line.

Not only does a password manager store passwords for individuals but also it supports password management for teams in small businesses and big enterprises.

Let’s go through the steps.

Step 1: When we sign up for a password manager, we enter our email address and set up an account password. The password manager generates a secret key for us. The 3 fields are used to generate MUK (Master Unlock Key) and SRP-X using the 2SKD algorithm. MUK is used to decrypt vaults that store our passwords. Note that the secret key is stored locally, and will not be sent to the password manager’s server side.

Step 2: The MUK generated in Step 1 is used to generate the encrypted MP key of the primary keyset.

Steps 3-5: The MP key is then used to generate a private key, which can be used to generate AES keys in other keysets. The private key is also used to generate the vault key. Vault stores a collection of items for us on the server side. The items can be passwords notes etc.

Step 6: The vault key is used to encrypt the items in the vault.

Because of the complex process, the password manager has no way to know the encrypted passwords. We only need to remember one account password, and the password manager will remember the rest.

Over to you: Which password manager have you used?