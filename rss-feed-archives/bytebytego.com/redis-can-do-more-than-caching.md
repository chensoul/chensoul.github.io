In the last issue, we explored common use cases with Redis. In this issue, we will go deeper and demonstrate how Redis’ versatile data structures can power more complex applications like social networks, location-based services, and more.

We will walk through practical examples of building key features like user profiles, relationship graphs, home timelines, and nearby searches using Redis’ native data types - Hashes, Sets, Sorted Sets, Streams, and Bitmaps.

Understanding these advanced use cases will provide you with a solid foundation to leverage Redis for your own systems and products. You will gain insight into how Redis enables real-time experiences beyond simple caching.

## Social Media

Redis’ flexible data structures are well-suited for building social graph databases, which power the core functions of Twitter-like social media applications. Relational databases can struggle with the complex relationships and unstructured data of user-generated content.

Redis provides high performance reads and writes to support features expected of social apps, allowing a small team to launch and iterate quickly. While Redis may not scale to the volumes of major social networks, it can power the first versions of an app through significant user growth.

Redis enables implementing common social media features like:

+   User Profiles
    
+   User Relationships (friends, followers)
    
+   Posts
    
+   User Interactions (likes, dislikes, comments, etc)
    
+   Home Timeline
    

Let's explore how Redis supports these capabilities.

### User Profiles

In social applications, a user profile stores identity attributes like name, location, interests, as well as preferences. We can represent each user profile as a Redis Hash, where the key is the user ID and the hash fields contain the profile properties.

For example, we can store user Bob’s profile in a hash like:

```auto
HMSET user:bob name Bob location "New York" interests "photography, hiking"
```

Compared to a relational model, Redis Hash provides flexibility to easily add new profile properties later without modifying the database schema. We just need to define how to retrieve and  when adding more attributes to the user profile, because we don’t need to go through database schema change.

In our application code, we would define how to retrieve and display the profile objects from these hashes. For example, we may only show name and location, or optionally include interests if present.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3d423c72-b6ba-4344-8b45-db2fd1e628ca_1203x1600.png)



### User Relationships

One of the major functions of a social application is establishing connections between users, like friend relationships or following others to receive their updates. Modeling these connections efficiently in a relational database can be challenging due to the complex graph-like structure of social networks.

Redis provides a more natural way to represent user relationships using its built-in Set data structure. The diagram below shows a comparison of modeling user relationships in a relational database versus using Redis Sets.

In the relational model, we use join tables to represent connections between users. Answering questions about relationships can involve complex SQL queries:

1.  Retrieve all the people that Bob follows or all of Bob’s friends
    
2.  Retrieve Alice’s friends of friends
    

For example, to retrieve all of Bob's friends, we would need to query the join table like:

```auto
SELECT friend_id
FROM relationship_table
WHERE user_id = 12345
```

In Redis, we can store Bob's friend ids directly in a Set with his user id as the key. Retrieving Bob's friends is as simple as returning the members of the ZSet.

```auto
SMEMBERS {Bob's key}
```

Checking if Alice is in Bob's extended network of friends is also easier with Redis Sets. We can take the intersection of their Sets:

```auto
SINTER {Bob's key} {Alice's key}
```



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F47582a02-bf63-4096-8d22-21f2a1a27f14_1600x850.png)



By avoiding complex join queries, Redis Sets provide faster reads and writes for managing unordered social connections. The Set data structure maps naturally to representing simple relationships in a social graph.

### Posts

In social apps, users create posts to share ideas, feelings, and status updates. Modeling this user-generated content can also be challenging in relational databases.

We can leverage Redis more efficiently here as well. For each user, we can store post\_ids in a Sorted Set ordered by timestamp. The key can be the user id, and each new post\_id is added as a member to the Set.

The post content itself is stored separately in Hashes, with the post\_id as the hash key. Each Hash contains attributes like:

+   user\_id
    
+   timestamp
    
+   message
    
+   etc
    

The diagram below shows how they work together. When a user creates a new post, we generate a new post\_id, create a Hash to represent the post content, and add the post\_id to the user's Sorted Set of posts.

This provides a natural way to model posting timelines - new post\_ids are added to the tail of the Set, and we can page through posts ordered chronologically using ZRANGE on post\_ids.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F42f1bfa8-da81-4f0d-9100-c540e5955acd_1600x816.png)

