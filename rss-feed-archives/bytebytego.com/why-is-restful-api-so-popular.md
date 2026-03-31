If you prefer video, full video available here:

https://youtu.be/-mN3VyJuCjM


REST is the most common communication standard between computers over the internet. What is it? Why is it so popular? 


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F9b1170e1-d73f-45e7-a730-71d09e6cf746_1600x900.jpeg)


The common API standard used by most mobile and web applications to talk to the servers is called REST. It stands for REpresentational State Transfer.

REST is not a specification. It is a loose set of rules that has been the de facto standard for building web API since the early 2000s.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7dddcbec-355c-4697-9c52-b560eaa30fab_1600x900.png)


An API that follows the REST standard is called a RESTful API. Some real-life examples are Twilio, Stripe, and Google Maps.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F384c925d-540e-411f-9311-665e13b35e91_1600x900.png)


Let’s look at the basics of REST. A RESTful API organizes resources into a set of unique URIs or Uniform Resource Identifiers.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2b5f8a85-fd3d-4db7-a80c-ef886f98018a_1600x900.png)


The resources should be grouped by noun and not verb. An API to get all products should be


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fc8443dd6-34c0-40ce-9305-9d9809c7b1f3_1600x900.png)


A client interacts with a resource by making a request to the endpoint for the resource over HTTP. The request has a very specific format. 

POST /products HTTP/1.1

The line contains the URI for the resource we’d like to access. The URI is preceded by an HTTP verb which tells the server what we want to do with the resource.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fd8b33329-f8c4-472f-827b-589f082e9410_1600x900.png)


You might have heard of the acronym CRUD. This is what it stands for.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2c4c3eb6-d1c9-4a85-9074-41fb5142ee9e_1600x900.png)


In the body of these requests there could be an optional HTTP request body that contains a custom payload of data, usually encoded in JSON.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F32e85617-8f7e-48af-8f0a-2667ad4b2a93_1600x900.png)


The server receives the request, processes it, and formats the result into a response.

The first line of the response contains the HTTP status code to tell the client what happened to the request.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Ff85febb8-e729-4bfc-a22f-754821b9449a_1600x900.png)


A well-implemented RESTful API returns proper HTTP status codes.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F3a182bbc-2e87-4336-80b6-fdd4ceb14033_1600x900.png)


A well-behaved client could choose to retry a failed request with a 500-level status code.

We said “could choose to retry” because some actions are not idempotent and those require extra care when retrying. When an API is idempotent, making multiple identical requests has the same effect as making a single request. This is usually not the case for a POST request to create a new resource.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F057429f4-9af8-420c-83b4-5a1dbd96767d_1920x1080.png)


The response body is optional and could contain the data payload and is usually formatted in json.

There is a critical attribute of REST that is worth discussing more.

A REST implementation should be stateless. It means that the two parties don’t need to store any information about each other and every request and response is independent from all others.

This leads to web applications that are easy to scale and well-behaved.

There are two finer points to discuss to round out a well-behaved RESTful API.

If an API endpoint returns a huge amount of data, use pagination.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Facbb6866-fdee-45e8-b0fd-d96130acb243_1920x1080.png)


A common pagination scheme uses limit and offset. Here is an example:

If they are not specified, the server should assume sensible default values.

Lastly, versioning of an API is very important.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F73165094-4914-4b1c-84a1-6f15ea620d77_1920x1080.png)


Versioning allows an implementation to provide backward compatibility so that if we introduce breaking changes from one version to another, consumers get enough time to move to the next version.

There are many ways to version an API. The most straightforward is to prefix the version before the resource on the URI. For instance:

There are other popular API options like GraphQL and gRPC. We will discuss those and compare them separately.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F826abfb5-1dff-4071-a272-31fe2516fb74_1920x1080.png)

