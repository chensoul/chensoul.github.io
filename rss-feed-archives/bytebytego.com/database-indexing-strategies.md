In this article, we are going to explore effective database indexing strategies. Database performance is critical to any large-scale, data-driven application. Poorly designed indexes and a lack of indexes are primary sources of database application bottlenecks. Designing efficient indexes is critical to achieving good database and application performance. As databases grow in size, finding efficient ways to retrieve and manipulate data becomes increasingly important. A well-designed indexing strategy is key to achieving this efficiency. This article provides an in-depth look at index architecture and discusses best practices to help us design effective indexes to meet the needs of our application.

## Basics of Indexing

Let's start with the basics of indexing in databases. An index, much like the index at the end of a book, is a data structure that speeds up data retrieval operations. Just as a book index lists keywords alongside page numbers to help locate information quickly, a database index serves a similar purpose, speeding up data retrieval without needing to scan every row in a database table.

![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F900c9743-370c-4dd8-ad5a-80a145347acd_1106x1488.png)



The structure of a database index includes an ordered list of values, with each value connected to pointers leading to data pages where these values reside. Index pages hold this organized structure which provides a more efficient way to locate specific information.

Indexes are typically stored on disk. They are associated with a table to speed up data retrieval. Keys made from one or more columns in the table make up the index, which, for most relational databases, are stored in a B+ tree structure. This structure allows the database to locate associated rows efficiently.

Finding the right indexes for a database is a balancing act between quick query responses and update costs. Narrow indexes, or those with fewer columns, save on disk space and maintenance, while wide indexes cater to a broader range of queries. Often, it requires several iterations of designs to find the most efficient index.

In its simplest form, an index is a sorted table that allows for searches to be conducted in O(Log N) time complexity using binary search on a sorted data structure.

Various data structures, such as B-Trees, Bitmaps, or Hash Maps, can be used to implement indexes. Though all these structures offer efficient data access, their implementation details differ.

For relational databases, indexes are often implemented using a B+ Tree, which is a variant of B-Tree.

### Primer on B+ Tree

The B+ Tree is a specific type of tree data structure, and understanding it requires some background on its predecessor, the B-Tree.

The B-Tree, or Balanced Tree, is a self-balancing tree data structure that maintains sorted data and allows for efficient insertion, deletion, and search operations. All these operations can be performed in O(Log N) time.

Here’s what distinguishes the structure of a B-Tree:

+   All leaves are at the same level - this is what makes the tree 'balanced'.
    
+   All internal nodes (except for the root) have a number of children ranging from d (the minimum degree of the tree) to 2d. The root, however, has at least two children.
    
+   A non-leaf node with ‘k' children contains k-1 keys. This means if a node has three children (k=3), it will hold two keys (k-1) that segment the data into three parts corresponding to each child node.
    

The B-Tree is an excellent data structure for storing data that doesn't fit into the main memory because its design minimizes the number of disk accesses. And because the tree is balanced, with all leaf nodes at the same depth, lookup times remain consistent and predictable.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80327ae8-389b-4fa7-81ad-47d7db9afad5_1350x428.png)



The B+ Tree is a variant of the B-Tree and is widely used in disk-based storage systems, especially for database indexes. The B+ Tree has certain unique characteristics that improve on the B-Tree.

1.  In a B+ Tree, the data pointers (the pointers to the actual records) are stored only at the leaf nodes. The internal nodes only contain keys and pointers to other nodes. This means that many more keys can be stored in internal nodes, reducing the overall height of the tree. This decreases the number of disk accesses required for many operations.
    
2.  All leaf nodes are linked together in a linked list. This makes range queries efficient. We can access the first node of the range and then simply follow the linked list to retrieve the rest.
    
3.  In a B+ Tree, every key appears twice, once in the internal nodes and once in the leaf nodes. The key in the internal nodes acts as a division point for deciding which subtree the desired value could be in.
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcde45cda-7d59-4e99-88e8-a3e06dc3ceb0_1532x508.png)



These features make B+ Trees particularly well-suited for systems with large amounts of data that won't fit into main memory. Since data can only be accessed from the leaf nodes, every lookup requires a path traversal from the root to a leaf. All data access operations take a consistent amount of time. This predictability makes B+ Trees an attractive choice for database indexing.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2c63f52e-5d22-430e-aadd-6cd68bbc0901_1032x748.png)



A comparison between B-Tree vs B+ Tree

Now we understand how B+ Tree is used for indexing, let’s see how a typical database engine uses it to maintain indexes.

### Clustered Index

A clustered index reorders the way records in the table are physically stored. It does not store rows randomly or even in the order they were inserted. Instead, it organizes them to align with the order of the index, hence the term “clustered”. The specific column or columns used to arrange this order is referred to as the clustered key.

The arrangement determines the physical order of data on disk. Think of it as a phonebook, which is sorted by last name, then first name. The data which is phone number and address is stored along with the sorted index.

However, because the physical data rows can be sorted in only one order, a table can have only one clustered index. Adding or altering the clustered index can be time-consuming, as it requires physically reordering the rows of data.

It's also important to select the clustered key carefully. Typically, it's beneficial to choose a unique, sequential key to avoid duplicate entries and minimize page splits when inserting new data. This is why, in many databases, the primary key constraint automatically creates a clustered index on that column if no other clustered index is explicitly defined.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F51860e7c-81ce-4522-a3f5-4b3e427b8a70_1600x550.png)



However, an exception to this general guidance is PostgreSQL. In PostgreSQL, data is stored in the order it was inserted, not based on the clustered index or any other index. However, PostgreSQL provides the CLUSTER command, which can be used to reorder the physical data in the table to match a specific index. It's important to note that this physical ordering is not automatically maintained when data is inserted or updated - to maintain the order, the CLUSTER command needs to be rerun.

### Non-clustered Index

Non-clustered indexes are a bit like the index found at the back of a book. They maintain a distinct list of key values, with each key having a pointer indicating the location of the row that contains that value. The pointers tie the index entries back to the data pages.

Since non-clustered indexes are stored separately from the data rows, the physical order of the data isn't the same as the logical order established by the index. This separation means that accessing data using a non-clustered index involves at least two disk reads, one to access the index and another to access the data. This is in contrast to a clustered index, where the index and data are one and the same.

A major advantage of non-clustered indexes is that we can have multiple non-clustered indexes on a table, each being useful for different types of queries. They are especially beneficial for queries involving columns not included in the clustered index. They enhance the performance of queries that don't involve the clustered key or don't require scanning a range of data.

It's important to consider the trade-off. While non-clustered indexes can speed up read operations, they can slow down write operations, as each index must be updated whenever data is modified in the table. It's crucial to strike a balance when deciding the number and type of non-clustered indexes for a given table.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F13a4ea50-761a-49f9-8a3d-2cda08333d6f_1806x1142.png)



## Understanding Index Types

Indexes speed up data retrieval by providing a more efficient path to the data without scanning every row. There are different types of indexes. We’ll take a look at the common ones.

### Primary Index

The primary index of a database is typically the main means of accessing data. When creating a table, the primary key often doubles as a clustered index, which means that the data in the table is physically sorted on disk based on this key. This ensures quick data retrieval when searching by the primary key.

The efficiency of this setup largely depends on the nature of the primary key. If the key is sequential, writing to the table is generally efficient. But if the key isn't sequential, reshuffling of data might be needed to maintain the order. This can make the write process less efficient.

Note that while the primary key often serves as the clustered index, this is not a hard and fast rule. The clustered index could be based on any column or set of columns, not necessarily the primary key.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5258e960-5a7a-4608-9ea7-76328e6beedd_1600x1340.png)

