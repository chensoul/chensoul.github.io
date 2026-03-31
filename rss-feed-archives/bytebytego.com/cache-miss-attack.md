#### Discover more from ByteByteGo Newsletter

Explain complex systems with simple terms, from the authors of the best-selling system design book series. Join over 500,000 friendly readers.

## Cache miss attack

Caching is awesome but it doesn’t come without a cost, just like many things in life.

One of the issues is 𝐂𝐚𝐜𝐡𝐞 𝐌𝐢𝐬𝐬 𝐀𝐭𝐭𝐚𝐜𝐤. Please correct me if this is not the right term. It refers to the scenario where data to fetch doesn't exist in the database and the data isn’t cached either. So every request hits the database eventually, defeating the purpose of using a cache. If a malicious user initiates lots of queries with such keys, the database can easily be overloaded.

The diagram below illustrates the process.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7a94e8d3-2ed7-4a26-941d-37864342d23f_2163x2463.jpeg)


Two approaches are commonly used to solve this problem:

🔹Cache keys with null value. Set a short TTL (Time to Live) for keys with null value.

🔹Using Bloom filter. A Bloom filter is a data structure that can rapidly tell us whether an element is present in a set or not. If the key exists, the request first goes to the cache and then queries the database if needed. If the key doesn't exist in the data set, it means the key doesn’t exist in the cache/database. In this case, the query will not hit the cache or database layer.

If you enjoyed this post, you might like our system design interview books as well.

SDI-vol1: [https://amzn.to/3tK0qQn](https://amzn.to/3tK0qQn)

SDI-vol2: [https://amzn.to/37ZisW9](https://amzn.to/37ZisW9)