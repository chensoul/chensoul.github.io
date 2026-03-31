In this newsletter, we will talk about the following:

🔹 What do WhatsApp, Discord, and Facebook Messenger have in common?

🔹 ELK Stack

🔹 How do companies typically ship code to production

🔹 Linux file permission illustrated

## What do WhatsApp, Discord, and Facebook Messenger have in common?

What do WhatsApp, Discord, and Facebook Messenger have in common?  Authored by [Sahn Lam](https://twitter.com/sahnlam).

They are all powered by Erlang. What is so special about Erlang that makes it the technology choice behind these popular chat services?


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Faa400dc0-1f9c-4969-9852-d46ff76f127e_2493x792.jpeg)


Erlang was developed in the 80’s by Ericsson for telecom switches that demanded extreme reliability. It is upon this rock-solid foundation that these modern chat services were built.

When people talk about Erlang, they are usually referring to the entire ecosystem called Erlang/OTP. It consists of the VM (BEAM), runtime environment (Erlang/OTP), and the language itself. They work together to provide this highly fault-tolerant programming environment.

There are several secret ingredients that make Erlang special.

Erlang processes are extremely lightweight. It is fast and cheap to create an Erlang process. A big machine could have millions of these processes. 

Erlang processes are isolated. They communicate with each other only through messages. It is easy to send a message to another process, whether it is on the same machine or a different machine. This makes it easy to scale an Erlang application either horizontally by adding more machines, or vertically by adding more cores.

Erlang’s “let it crash” design principle provides a unique solution to fault tolerance. Erlang implementers viewed software and hardware faults as inevitable. Erlang implements a concept called supervisor tree to allow Erlang applications to recover from these faults quickly and reliably. A supervisor monitors its child processes and decides how to recover when a fault occurs. This is central to any well-designed Erlang application.

There are now new languages built on top of the Erlang/OTP foundation. These languages improve the developer experience while relying on the rock-solid fault-tolerant foundation that is Erlang/OTP.

Besides chat apps, Erlang is used in many other mission-critical applications. Can you name any other well-known Erlang applications?

## ELK Stack

What is ELK Stack and why is it so popular for log management?

The ELK Stack is composed of three open-source products. ELK stands for Elasticsearch, Logstash, and Kibana. 


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fe7c33992-a137-4632-94c7-0f960e94e4fb_1600x909.png)


🔹 Elasticsearch is a full-text search and analysis engine, leveraging Apache Lucene search engine as its core component.

🔹 Logstash collects data from all kinds of edge collectors, then transforms that data and sends it to various destinations for further processing or visualization.

In order to scale the edge data ingestion, a new product Beats is later developed as lightweight agents installed on edge hosts to collect and ship logs to Logstash.

🔹 Kibana is a visualization layer with which users analyze and visualize the data.

The diagram below shows how ELK Stack works:

Step 1 - Beats collects data from various data sources. For example, Filebeat and Winlogbeat work with logs, and Packetbeat works with network traffic.

Step 2 - Beats sends data to Logstash for aggregation and transformation. If we work with massive data, we can add a message queue (Kafka) to decouple the data producers and consumers.

Step 3 - Logstash writes data into Elasticsearch for data indexing and storage.

Step 4 - Kibana builds on top of Elasticsearch and provides users with various search tools and dashboards with which to visualize the data.

ELK Stack is pretty convenient for troubleshooting and monitoring. It became popular by providing a simple and robust suite in the log analytics space, for a reasonable price.

Over to you: which other log management products have you used in production? How do they compare with ELK Stack?

Image source: [https://www.elastic.co/guide/en/logstash/current/deploying-and-scaling.html](https://www.elastic.co/guide/en/logstash/current/deploying-and-scaling.html)

## How do companies typically ship code to production?

[Gergely Orosz](https://twitter.com/GergelyOrosz) wrote an excellent article about this topic and he has kindly agreed to share excerpts with newsletter readers.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F0cebc582-2499-4b85-ba2b-21ce8d91b8eb_1431x1600.png)


**1\. Startups:** Typically do fewer quality checks than other companies. 

Startups tend to prioritize moving fast and iterating quickly, and often do so without much of a safety net. This makes perfect sense if they don't – yet – have customers. As the company attracts users, these teams need to start to find ways to not cause regressions or ship bugs. They then have the choice of going down one of two paths: hire QAs or invest in automation.

**2\. Traditional companies**: Tend to rely more heavily on QAs teams.

While automation is sometimes present in more traditional companies, it's very typical that they rely on large QA teams to verify what they build. Working on branches is also common; it's rare to have trunk-based development in these environments.

**3\. Large tech companies**: Typically invest heavily in infrastructure and automation related to shipping with confidence.

These investments often include automated tests running quickly and delivering rapid feedback, canarying, feature flags and staged rollouts.

**4\. Facebook core**: Has a sophisticated and effective approach few other companies possess.

Facebook's core product is an interesting one. It has fewer automated tests than many would assume, but, on the other hand, it has an exceptional automated canarying functionality, where the code is rolled out through 4 environments: from a testing environment with automation, through one that all employees use, through a test market of a smaller region, to all users. In every stage, if the metrics are off, the rollout automatically halts.

Over to you: how does your company ship code to production? Does well does it work?

If you want to read the full article, you can find it here:

## **Linux file permission illustrated.**

To understand Linux file permissions, we need to understand Ownership and Permission.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F45018f37-fd51-4b51-9662-28daed77f012_1598x1390.png)


**Ownership**

Every file or directory is assigned 3 types of owner:

🔹Owner: the owner is the user who created the file or directory.

🔹Group: a group can have multiple users. All users in the group have the same permissions to access the file or directory.

🔹Other: other means those users who are not owners or members of the group.

**Permission**

There are only three types of permissions for a file or directory.

🔹Read (r): the read permission allows the user to read a file.

🔹Write (w): the write permission allows the user to change the content of the file.

🔹Execute (x): the execute permission allows a file to be executed. 

Over to you: what are some of the commonly used Linux commands to change file permissions?

## Our Books:

Our bestselling book “System Design Interview - An Insider’s Guide” is available in both paperback and digital format.

Paperback edition: [https://geni.us/XxCd](https://geni.us/XxCd)

Digital edition: [https://bit.ly/3lg41jK](https://bit.ly/3lg41jK)