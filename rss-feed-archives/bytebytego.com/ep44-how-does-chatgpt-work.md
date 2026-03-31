This week’s system design refresher:

+   8 Key Data Structures That Power Modern Databases
    
+   How does ChatGPT work?
    
+   Does the cloud really save costs?
    
+   Amazon’s system architecture (1998 edition)
    
+   New Machine Learning System Design Interview Book by ByteByteGo
    

## Retool is the fast way to build internal tools (Sponsored)



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd7a82373-317c-49d6-aa00-b6367b25523f_1200x1200.png)



Building business software today is slow. You often spend more time on boilerplate code and redundant work than you do on actually solving the problem at hand.

Retool is a new approach. We move the starting line with a platform that makes it much faster to connect to any data source, design and develop at the same time, and deploy software securely. 

Companies like Amazon and Plaid use Retool to build apps and workflows that help teams work faster. Retool is free for teams of up to 5, and early-stage startups can get $25,000 in free credits for paid plans. 

[Learn more](http://bit.ly/3RwiFml)

## 8 Key Data Structures That Power Modern Databases

<iframe width="728" height="409" src="https://www.youtube.com/embed/W_v05d_2RTo" title="8 Key Data Structures That Power Modern Databases" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## How does ChatGPT work?

Since OpenAI hasn't provided all the details, some parts of the diagram may be inaccurate.

We attempted to explain how it works in the diagram below. The process can be broken down into two parts.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e6c2f94-a539-4851-be8c-5b525c1e227c_2568x3462.png)



1.  Training. To train a ChatGPT model, there are two stages:
    

\- Pre-training: In this stage, we train a GPT model (decoder-only transformer) on a large chunk of internet data. The objective is to train a model that can predict future words given a sentence in a way that is grammatically correct and semantically meaningful similar to the internet data. After the pre-training stage, the model can complete given sentences, but it is not capable of responding to questions.

\- Fine-tuning: This stage is a 3-step process that turns the pre-trained model into a question-answering ChatGPT model:

1). Collect training data (questions and answers), and fine-tune the pre-trained model on this data. The model takes a question as input and learns to generate an answer similar to the training data.  
2). Collect more data (question, several answers) and train a reward model to rank these answers from most relevant to least relevant.  
3). Use reinforcement learning (PPO optimization) to fine-tune the model so the model's answers are more accurate.

2.  Answer a prompt
    

+   Step 1: The user enters the full question, “Explain how a classification algorithm works”.
    
+   Step 2: The question is sent to a content moderation component. This component ensures that the question does not violate safety guidelines and filters inappropriate questions.
    
+   Steps 3-4: If the input passes content moderation, it is sent to the chatGPT model. If the input doesn’t pass content moderation, it goes straight to template response generation.
    
+   Step 5-6: Once the model generates the response, it is sent to a content moderation component again. This ensures the generated response is safe, harmless, unbiased, etc.
    
+   Step 7: If the input passes content moderation, it is shown to the user. If the input doesn’t pass content moderation, it goes to template response generation and shows a template answer to the user.
    

## Does the cloud really save costs?

Let’s look at this question **in a longer time range** to see what the cloud really brings us.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F712942ad-4165-4ee5-b58d-bc2fa6307087_1461x1536.jpeg "No alternative text description for this image")



When a company or a business line initially starts, product-market fit (PMF) is key. The cloud enables quick setup to run the system with minimal necessary hardware. The cost is also transparent.

For example, if we run the databases on-premise, we need to take care of hardware setup, operating system installation, DBMS maintenance, etc. But if we use Amazon RDS (Relational Database Service), we just need to take care of application optimization. This saves us the trouble of hiring Linux admins and DB admins.

Later, if the business model doesn’t work, we can just stop using the services to save costs without thinking about how to deal with the hardware.

In research conducted by Cameron Fisher, the cloud starts from **almost zero cost.** Over time, the cost starts to accumulate on subscriptions and deployment consulting. Ironically, because it is so easy to allocate services to the cloud for scalability or reliability reasons, an organization tends to **overuse** the cloud after adopting the cloud. It is essential to set up a monitoring framework for cost transparency.

👉 Over to you: Which notable companies use on-premise solutions and why?

Reference:  
1\. AWS guide: Choosing between Amazon EC2 and Amazon RDS  
2\. Cloud versus On-Premise Computing by Cameron Fisher, MIT

## Amazon’s system architecture

In 1998, Amazon's system architecture looked like this. The simplicity of the architecture is amazing.



![diagram](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F565bae3f-fc5f-4bff-9b33-528f9da5153b_800x599.jpeg "diagram")



You can read the 25-year-old internal document that changed Amazon's system design and development here: [https://lnkd.in/e5EGHFiU](https://lnkd.in/e5EGHFiU)

## New Machine Learning System Design Interview Book



![Image preview](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5aeec9e1-79a3-4eda-ac8b-abae57c9bd07_800x1067.jpeg "Image preview")

Some stats about the book:

+   10 real machine learning system design interview questions with detailed solutions.
    
+   211 diagrams to explain how different ML systems work.
    
+   300+ pages.
    

Feels so good to hold it in my hand. Thanks to everyone who helped us make this happen.

Paperback version of the book: [https://geni.us/tVsKGey](https://geni.us/tVsKGey)  
Digital version of the book: [https://bytebytego.com](https://bytebytego.com/)