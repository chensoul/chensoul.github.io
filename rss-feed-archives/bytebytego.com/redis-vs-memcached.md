#### Discover more from ByteByteGo Newsletter

Explain complex systems with simple terms, from the authors of the best-selling system design book series. Join over 500,000 friendly readers.

## Redis vs Memcached

Popular interview question - what are the differences between Redis and Memcached?

The diagram below illustrates the key differences.


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F7591f8fc-5855-4821-90dc-ede7deb7339a_3342x2310.jpeg)


The advantages of data structures make Redis a good choice for:

🔹 Recording the number of clicks and comments for each post (hash)

🔹 Sorting the commented user list and deduping the users (zset)

🔹 Caching user behavior history and filtering malicious behaviors (zset, hash)

🔹 Storing boolean information of extremely large data into small space. For example, login status, membership status. (bitmap)

If you enjoyed this post, you might like our system design interview books as well.

SDI-vol1: [https://amzn.to/3tK0qQn](https://amzn.to/3tK0qQn)

SDI-vol2: [https://amzn.to/37ZisW9](https://amzn.to/37ZisW9)