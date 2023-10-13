---
title: "《Effective Java 3》笔记9：使用 try-with-resources 优于 try-finally"
date: 2023-05-08T10:00:00+08:00
slug: prefer-try-with-resources-to-try-finally
categories: ["Java"]
tags: [java]
---

本文是 《Effective Java 3》第二章的学习笔记：使用 try-with-resources 优于 try-finally。

## 介绍

Java 库包含许多必须通过调用 close 方法手动关闭的资源。常见的有 InputStream、OutputStream 和 java.sql.Connection。关闭资源常常会被客户端忽略，这会导致可怕的性能后果。虽然这些资源中的许多都使用终结器作为安全网，但终结器并不能很好地工作。

从历史上看，try-finally 语句是确保正确关闭资源的最佳方法，即使在出现异常或返回时也是如此：

```java
// try-finally - No longer the best way to close resources!
static String firstLineOfFile(String path) throws IOException {
    BufferedReader br = new BufferedReader(new FileReader(path));
    try {
        return br.readLine();
    } finally {
        br.close();
    }
}
```

这可能看起来不坏，但添加第二个资源时，情况会变得更糟：

```java
// try-finally is ugly when used with more than one resource!
static void copy(String src, String dst) throws IOException {
    InputStream in = new FileInputStream(src);
    try {
        OutputStream out = new FileOutputStream(dst);
        try {
            byte[] buf = new byte[BUFFER_SIZE];
            int n;
            while ((n = in.read(buf)) >= 0)
                out.write(buf, 0, n);
        } finally {
            out.close();
            }
        }
    finally {
        in.close();
    }
}
```

使用 try-finally 语句关闭资源的正确代码（如前两个代码示例所示）也有一个细微的缺陷。try 块和 finally 块中的代码都能够抛出异常。例如，在 firstLineOfFile 方法中，由于底层物理设备发生故障，对 readLine 的调用可能会抛出异常，而关闭的调用也可能出于同样的原因而失败。`在这种情况下，第二个异常将完全覆盖第一个异常`。异常堆栈跟踪中没有第一个异常的记录，这可能会使实际系统中的调试变得非常复杂（而这可能是希望出现的第一个异常，以便诊断问题）。虽然可以通过编写代码来抑制第二个异常而支持第一个异常，但实际上没有人这样做，因为它太过冗长。

当 Java 7 引入 try-with-resources 语句时，所有这些问题都一次性解决了。要使用这个结构，资源必须实现 AutoCloseable 接口，它由一个单独的 void-return close 方法组成。Java 库和第三方库中的许多类和接口现在都实现或扩展了 AutoCloseable。如果你编写的类存在必须关闭的资源，那么也应该实现 AutoCloseable。

下面是使用 try-with-resources 的第一个示例：

```java
// try-with-resources - the the best way to close resources!
static String firstLineOfFile(String path) throws IOException {
    try (BufferedReader br = new BufferedReader(new FileReader(path))) {
        return br.readLine();
    }
}
```

下面是使用 try-with-resources 的第二个示例：

```java
// try-with-resources on multiple resources - short and sweet
static void copy(String src, String dst) throws IOException {
    try (InputStream in = new FileInputStream(src);OutputStream out = new FileOutputStream(dst)) {
        byte[] buf = new byte[BUFFER_SIZE];
        int n;
        while ((n = in.read(buf)) >= 0)
            out.write(buf, 0, n);
    }
}
```

和使用 try-finally 的原版代码相比，try-with-resources 为开发者提供了更好的诊断方式。考虑 firstLineOfFile 方法。如果异常是由 readLine 调用和不可见的 close 抛出的，则后一个异常将被抑制，以支持前一个异常。实际上，还可能会抑制多个异常，以保留实际希望看到的异常。这些被抑制的异常不会仅仅被抛弃；它们会被打印在堆栈跟踪中，并标记它们被抑制。可以通过编程方式使用 getSuppressed 方法访问到它们，该方法是在 Java 7 中添加到 Throwable 中的。

可以在带有资源的 try-with-resources 语句中放置 catch 子句，就像在常规的 try-finally 语句上一样。这允许处理异常时不必用另一层嵌套来影响代码。作为一个特指的示例，下面是我们的 firstLineOfFile 方法的一个版本，它不抛出异常，但如果无法打开文件或从中读取文件，则返回一个默认值：

```java
// try-with-resources with a catch clause
static String firstLineOfFile(String path, String defaultVal) {
    try (BufferedReader br = new BufferedReader(new FileReader(path))) {
        return br.readLine();
    } catch (IOException e) {
        return defaultVal;
    }
}
```

## 扩展

`try-with-resources` 语句是 Java 7 中引入的一种新语法，主要目的是为了简化资源管理的代码，并确保资源被正确地关闭，避免了资源泄漏和异常处理的问题。

在 Java 中，当使用一些需要手动释放资源的类时，例如 I/O 流、数据库连接等，我们需要在代码中显式地调用 `close()` 方法来释放资源。这种方式可能会出现一些问题，例如：

1. 忘记关闭资源：如果开发人员忘记关闭资源，可能会导致资源泄漏，占用系统资源，降低系统性能。
2. 异常处理问题：如果在关闭资源之前发生异常，可能会导致资源未能正确关闭，进一步导致资源泄漏和其他问题。

为了解决这些问题，Java 7 引入了 `try-with-resources` 语句。它提供了一种更简洁、更安全、更易读的方式来管理资源的关闭，避免了开发人员手动释放资源的问题，并且可以确保资源被正确地关闭。

使用 `try-with-resources` 语句，我们可以将资源的创建和初始化放在 `try` 语句的括号内，它们在 `try` 块执行结束后，会自动关闭资源。如果在关闭资源时发生异常，`try-with-resources` 语句会自动处理异常，确保所有资源都被正确地关闭。

`try-with-resources` 语句使用以下语法：

```java
try (Resource1 r1 = new Resource1(); Resource2 r2 = new Resource2()) {
    // use r1 and r2
} catch (Exception e) {
    // handle the exception
}
```

在这个例子中，`Resource1` 和 `Resource2` 是需要在使用后关闭的资源，它们将在 `try` 块结束后自动关闭。如果发生异常，`catch` 块将处理它。

`Resource1` 和 `Resource2` 必须实现 `AutoCloseable` 接口，该接口定义了 `close()` 方法，用于关闭资源。当 `try` 块结束时，`close()` 方法将自动被调用，以便关闭资源。

需要注意的是，`try-with-resources` 语句可以同时管理多个资源，资源的创建和初始化应该在 `try` 语句的括号内完成。

`try-with-resources` 语句有以下优点：

1. 简洁性：`try-with-resources` 语句可以让代码更简洁，不需要显式地调用 `close()` 方法。
2. 安全性：`try-with-resources` 语句可以确保资源被正确地关闭，避免了资源泄漏和异常处理的问题。
3. 可读性：`try-with-resources` 语句可以让代码更易读，更容易理解资源的使用和管理。

需要注意的是，`try-with-resources` 语句只能用于管理实现了 `AutoCloseable` 接口的资源，并且只有在 Java 7 及以上版本才支持该语法。

除了 I/O 流和数据库连接之外，还有一些类需要手动释放资源，例如：

1. 图形界面组件：在使用图形界面组件时，例如窗口、对话框、面板等，需要手动释放资源，例如关闭窗口、释放图形资源等。
2. 线程：在使用线程时，需要手动停止线程，释放线程占用的系统资源。
3. Socket 和 ServerSocket：在使用 Socket 和 ServerSocket 时，需要手动关闭它们，以便释放网络资源。
4. 文件句柄：在使用文件系统时，需要手动关闭文件句柄，以便释放系统资源。
5. JDBC Statement 和 ResultSet：在使用 JDBC 时，需要手动关闭 Statement 和 ResultSet 对象，以便释放数据库资源。
6. JNI 资源：在使用 JNI 调用本地方法时，需要手动释放 JNI 资源，例如 C/C++ 中的内存和文件句柄等。
