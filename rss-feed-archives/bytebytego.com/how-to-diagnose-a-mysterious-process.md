#### Discover more from ByteByteGo Newsletter

Explain complex systems with simple terms, from the authors of the best-selling system design book series. Join over 500,000 friendly readers.

## How to diagnose a mysterious process that’s taking too much CPU, memory, IO, etc

Popular interview question: how to diagnose a mysterious process that’s taking too much CPU, memory, IO, etc?

The diagram below illustrates helpful tools in a Linux system. 


![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F2bb831fc-9106-43d2-8ca8-ab5fe8c8704a_1999x1500.png)


🔹‘vmstat’ - reports information about processes, memory, paging, block IO, traps, and CPU activity.

🔹‘iostat’ - reports CPU and input/output statistics of the system.

🔹‘netstat’ - displays statistical data related to IP, TCP, UDP, and ICMP protocols.

🔹‘lsof’ - lists open files of the current system.

🔹‘pidstat’ - monitors the utilization of system resources by all or specified processes, including CPU, memory, device IO, task switching, threads, etc.

Credit: Diagram by [Brendan Gregg](https://www.linkedin.com/in/ACoAAAA8VAMBqJml4viT3EVYGfzv-hLOE0rjdIE)