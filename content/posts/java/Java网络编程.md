---
title: "Java网络编程"
date: 2024-08-14
slug: java-network-coding
categories: ["Java"]
tags: [ network]
draft: true
---



## TCP

服务端代码：Java标准库提供了`ServerSocket`来实现对指定IP和指定端口的监听。

```java
public class ServerExample {
	public static void main(String[] args) throws IOException {
		// 创建ServerSocket对象，指定监听的端口号
		ServerSocket serverSocket = new ServerSocket(8888);

		// 调用accept()方法监听客户端请求
		Socket socket = serverSocket.accept();
		System.out.println("connected from " + socket.getRemoteSocketAddress());

		// 获取输入流，读取客户端发送的数据
		InputStream inputStream = socket.getInputStream();
		BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
		String message = bufferedReader.readLine();
		System.out.println("Message from client: " + message);

		// 关闭输入流、Socket和ServerSocket
		bufferedReader.close();
		inputStream.close();
		socket.close();
		serverSocket.close();
	}
}
```

客户端代码：

```java
public class ClientExample {
	public static void main(String[] args) throws IOException {
		// 创建Socket对象，指定服务器地址和端口号
		Socket socket = new Socket("127.0.0.1", 8888);

		// 获取输出流，向服务器发送数据
		OutputStream outputStream = socket.getOutputStream();
		PrintWriter printWriter = new PrintWriter(outputStream);
		printWriter.write("Hello Server!");

		// 刷新输出流，确保数据发送成功
		printWriter.flush();

		// 关闭输出流和Socket
		printWriter.close();
		outputStream.close();
		socket.close();
	}
}
```



### 连接超时

当连接远程服务器时，可能会因为网络延迟等原因导致连接超时。为了解决这个问题，我们可以设置连接超时时间，如果在指定时间内无法连接成功，就会抛出异常。

```java
Socket socket = new Socket();
socket.connect(new InetSocketAddress("127.0.0.1", 8888), 5000);
```

### 数据丢失和粘包问题

```java
InputStreamReader inputStreamReader = new InputStreamReader(socket.getInputStream());
BufferedReader bufferedReader = new BufferedReader(inputStreamReader);

String line;
while ((line = bufferedReader.readLine()) != null) {
    // 处理接收到的数据
}
```



## 参考资料

- [Java网络编程核心技术详解（视频微课版）](https://weread.qq.com/web/bookDetail/1d032ec071d7c7861d0b111)

- [Java 网络编程](https://dunwu.github.io/javacore/pages/e4c818/)

- [网络编程](https://liaoxuefeng.com/books/java/network/index.html)

- [Java网络编程入门指南：从基础到实践](https://refblogs.com/article/512)

- [Java NIO系列教程（一） Java NIO 概述](https://ifeve.com/overview/)
