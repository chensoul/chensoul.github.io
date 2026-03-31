This week’s system design refresher:

+   Process vs. Thread (Youtube video)
    
+   ChatGPT Timeline
    
+   DDoS Attack
    
+   Fallacies of distributed computing
    

## What is the difference between Process and Thread?

## ChatGPT history

ChatGPT and copy. ai brought attention to AIGC (AI-generated Content). Why is AIGC gaining explosive growth?  

The diagram below summarizes the development in this area.



![No alt text provided for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F0950f5de-d3d0-41b2-b791-18d77afade53_1280x1903.jpeg "No alt text provided for this image")



OpenAI has been developing GPT (Generative Pre-Train) since 2018.   

GPT 1 was trained with BooksCorpus dataset (5GB), whose main focus is language understanding.  

On Valentine’s Day 2019, GPT 2 was released with the slogan “too dangerous to release”. It was trained with Reddit articles with over 3 likes (40GB). The training cost is $43k.  

Later GPT 2 was used to generate music in MuseNet and JukeBox.  

In June 2020, GPT 3 was released, which was trained by a much more comprehensive dataset.   

More applications were developed based on GPT 3, including:

+   DALL-E: creating images from text
    
+   CLIP: connecting text and images
    
+   Whisper: multi-lingual voice to text
    
+   ChatGPT: chatbot, article writer, code writer 
    

With the development of AIGC algorithms, many companies have applications to generate text, images, code, voice, and video.  

I strongly recommend that you play with these applications. The results are astonishing!

👉 Over to you: Have you chatted with ChatGPT? What did you ask it?

## What is a DDoS (Distributed Denial-of-Service) Attack?

Why is it hazardous to the services? Here is an example of how DDoS works.



![No alternative text description for this image](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F687912f4-71ba-4119-8de3-58e52d0d6551_1420x1536.jpeg "No alternative text description for this image")



The purpose of a DDoS attack is to disrupt the normal traffic of the victim servers through malicious requests. As a result, the servers are swamped with malicious requests and have no buffer to handle normal requests.

+   Steps 1 and 2: An attacker remotely controls a network of zombies via the controller. These zombies are then instructed remotely by the attacker.
    
+   Step 3: The zombies can send requests to the victim servers, exhausting the servers' resources. Since zombies are legitimate internet devices, it is difficult to distinguish DDoS traffic from normal traffic.
    

An example of a common DDoS attack is an SYN flood.  

Normally the client and server establish a TCP connection via a 3-way handshake. As a result of an SYN flood attack, zombies send many SYN requests to the server, but they never return an ACK from the server.  

This results in an exhaustion of resources on the victim server due to the accumulation of many half-open TCP connections.

👉 Over to you: Have you encountered a DDoS attack in production? How did you solve it?

## Fallacies of distributed computing

About 30 years ago, Peter Deutsch drafted a list of eight fallacies in distributed computing environments, now known as "The 8 fallacies of distributed computing". Many years later, the fallacies remain.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F67754b1a-5dd5-42b0-8253-b604657ec7c5_3519x3120.jpeg)



## **Featured job openings**

**HEIR**: [Senior Software Engineer, Full Stack](https://substack.com/redirect/7e56fe24-7c7b-4686-91da-737a351ff3d5?j=eyJ1IjoiMWxyMnJiIn0.3gL4cFwDHqFL_VcXxR7HzMwPYkuu_RpwPuz8o-oe3gw) (United States)