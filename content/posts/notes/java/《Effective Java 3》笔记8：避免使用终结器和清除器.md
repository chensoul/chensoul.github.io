---
title: "《Effective Java 3》笔记8：避免使用终结器和清除器"
date: 2023-05-08T09:00:00+08:00
slug: avoid-finalizers-and-cleaners
categories: ["Notes"]
tags: [java]
---

本文是 《Effective Java 3》第二章的学习笔记：避免使用终结器和清除器。

## 介绍

**终结器是不可预测的、常常是危险的，通常也是不必要的。** 它们的使用可能导致不稳定的行为、低效率和可移植性问题。终结器有一些有效的用途，我们稍后会介绍，但通常情况下应该避免使用它们。从 Java 9 开始，终结器已经被弃用，但它们仍然被 Java 库使用。Java 9 中终结器的替代品是清除器。 **清除器的危险比终结器小，但仍然不可预测、缓慢，而且通常是不必要的。**

> 终结器是通过在对象上实现 `finalize()` 方法来实现的，而清除器是通过使用 `Cleaner` 类来实现的。它们的工作方式有所不同：
>
> - 终结器是由垃圾回收器自动执行的，无法预测何时执行，也无法保证一定会执行。当垃圾回收器决定将对象回收时，它会调用对象的 `finalize()` 方法，以便对象在被销毁之前执行一些清理操作。
>
> - 清除器是由 Java 9 虚拟机通过引用队列和 `Cleaner` 对象执行的，可以在对象被回收之前或之后执行。在对象被垃圾回收之前，Java 虚拟机会将该对象的引用添加到一个引用队列中，然后在某些时刻，Java 虚拟机会创建一个 `Cleaner` 对象，并将该引用队列与 `Cleaner` 对象关联起来。当该对象被垃圾回收时，它的引用将被添加到与 `Cleaner` 对象关联的引用队列中，`Cleaner` 对象会在某些时刻自动执行，以便对象在被销毁之前或之后执行一些清理操作。
>
> - 在 Java 9 中，引入了 `java.lang.ref.Cleaner` 类，作为终结器的替代品，用于执行对象清理操作。相比终结器，Cleaner 具有以下优点：
>
>   1. 显式管理：Cleaner 使用明确的代码路径来管理清理操作，而不是使用隐式的终结器机制。
>   2. 可控性：Cleaner 允许开发人员控制何时执行清理操作，而不是完全依赖于垃圾回收器的行为。
>   3. 安全性：Cleaner 执行清理操作时，会确保类加载器已准备好，因此可以安全地执行本地清理操作。
>
>   Cleaner 通过注册一个任务来执行清理操作。该任务可以是 Runnable 或者继承自 PhantomReference 类的子类对象。当对象被垃圾回收器回收时，Cleaner 将自动执行注册的任务。



终结器和清除器的使用场景非常有限，因为它们的执行时间不可预测，可能会导致一些问题，例如性能问题、不稳定的行为、低效率和可移植性问题。

终结器和清除器的主要问题是：

- 它们无法可靠地及时执行，甚至可能根本不会执行。当对象变得不可访问，终结器或清除器对它进行操作的时间是不确定的。这意味着永远不应该在终结器或清除器中执行任何对时间要求很严格的操作。例如，依赖终结器或清除器关闭文件就是一个严重错误，因为打开的文件描述符是有限的资源。如果由于系统在运行终结器或清除器的延迟导致许多文件处于打开状态，程序可能会运行失败，因为它不能再打开其他文件。

  终结器的另一个问题是，在终结期间抛出的未捕获异常被忽略，该对象的终结终止。未捕获的异常可能会使其他对象处于损坏状态。如果另一个线程试图使用这样一个损坏的对象，可能会导致任意的不确定性行为。正常情况下，未捕获的异常将终止线程并打印堆栈跟踪，但如果在终结器中出现，则不会打印警告。清除器没有这个问题，因为使用清除器的库可以控制它的线程。

- 它们可能会导致性能问题。终结器由垃圾回收器执行，这可能会导致垃圾回收过程中的延迟。另一方面，清除器使用单独的线程执行，这可能会导致额外的开销和同步问题。



《Effective Java》第三版建议使用显式终止方法，例如 `close()`，释放系统资源。当应用程序完成对资源的使用时，可以显式调用这些方法，而不依赖于垃圾回收器来执行它们。

如果必须使用终结器或清除器， 《Effective Java》第三版建议使用防御性编程实现它们，即使用 try-finally 块确保执行关键的清理操作，并避免引用其他可能已被垃圾回收的对象或资源。



## 扩展

### System.gc()

`System.gc()` 方法是 Java 中的一种垃圾回收机制，它可以在请求垃圾回收器运行时强制进行一次垃圾回收。

`System.gc()` 方法不是强制垃圾回收的方法，因为 Java 虚拟机可以忽略它。Java 编程语言规范要求 `System.gc()` 方法只是一个建议，不能保证它一定会导致垃圾回收器运行。因此，它不应该被频繁地调用，因为这可能会导致性能问题。

`System.gc()` 方法的使用场景非常有限。通常情况下，应该让垃圾回收器自行管理内存，而不是使用 `System.gc()` 方法来强制进行垃圾回收。如果需要确保某些对象在垃圾回收之前被释放，可以使用弱引用或软引用来管理这些对象，或使用显式终止方法来释放系统资源。

需要注意的是，`System.gc()` 方法可能会耗费较长时间，因为它可能会强制回收所有未使用的对象。因此，在实际使用中，应该谨慎使用 `System.gc()` 方法，并仅在必要时使用它。

### System.runFinalization() 

`System.runFinalization()` 方法是在 Java 1.2 版本中引入的。在 Java 1.2 中，引入了垃圾回收器的改进，包括使用引用类型、终结器和垃圾回收器性能的提升。`System.runFinalization()` 方法作为终结器机制的一部分，用于确保所有对象的`finalize()` 方法被执行。在垃圾回收器将对象从内存中释放之前，如果该对象具有终结器，则垃圾回收器会调用对象的 `finalize()` 方法，以便在对象被销毁之前执行一些清理操作。`System.runFinalization()` 方法可以确保所有对象的 `finalize()` 方法被执行。

`System.runFinalization()` 方法不是强制终结器执行的方法，因为 Java 虚拟机可以忽略它。Java 编程语言规范要求 `System.runFinalization()` 方法只是一个建议，不能保证它一定会导致终结器执行。因此，它不应该被频繁地调用，因为这可能会导致性能问题。

`System.runFinalization()` 方法的使用场景非常有限。通常情况下，应该避免使用终结器来执行清理操作，因为终结器的执行时间不可预测，可能会导致一些问题，例如性能问题、不稳定的行为、低效率和可移植性问题。相反，应该使用显式终止方法来释放系统资源。

需要注意的是，`System.runFinalization()` 方法可能会耗费较长时间，因为它可能会执行所有对象的终结器。因此，在实际使用中，应该谨慎使用 `System.runFinalization()` 方法，并仅在必要时使用它



### 清除器和终结器使用场景

使用清除器和终结器的例子并不常见，因为它们的使用场景非常有限。以下是一些可能需要使用清除器和终结器的场景：

- 在 Java 8 及之前的版本中，`java.sql.Connection` 类中的 `finalize()` 方法被用于关闭数据库连接。在 Java 9 中，这个方法被弃用，因为终结器的使用不可靠和危险。相反，`Connection` 接口中添加了一个 `close()` 方法，应该使用这个方法来释放数据库连接。
- 在 Java 9 中，`java.lang.ref.Cleaner` 类被引入作为终结器的替代品，可以用于执行对象清理操作。例如，如果需要在对象被垃圾回收之前执行一些清理操作（例如释放本地内存或关闭文件句柄），可以使用 `Cleaner` 类来实现。以下是一个使用 `Cleaner` 类的简单示例：

```java
public class Resource implements AutoCloseable {
    private final Cleaner cleaner = Cleaner.create();

    private final File file;

    public Resource(File file) {
        this.file = file;

        cleaner.register(this, new CleanupTask(file));
    }

    @Override
    public void close() throws Exception {
        // release any resources held by this object
    }

    private static class CleanupTask implements Runnable {
        private final File file;

        public CleanupTask(File file) {
            this.file = file;
        }

        @Override
        public void run() {
            // clean up the resource associated with the given file
        }
    }
}
```

在这个例子中，`Resource` 类持有一个 `File` 对象，并在创建对象时使用 `Cleaner` 类注册了一个 `CleanupTask` 对象。当 `Resource` 对象被垃圾回收时，`Cleaner` 对象将自动调用 `CleanupTask` 对象的 `run()` 方法，以便执行 `File` 对象的清理操作（例如关闭文件句柄）。

需要注意的是，这仅是一个简单的示例，实际使用中需要谨慎使用和考虑清除器和终结器的局限性。通常情况下，我们应该避免使用它们，使用显式终止方法来释放系统资源。



以下是一些使用显式终止方法的例子：

1. Java I/O 类。Java I/O 类通常需要使用显式终止方法来释放系统资源，例如关闭文件句柄或网络连接。例如，`java.io.FileInputStream` 类中的 `close()` 方法用于关闭打开的文件。

```java
try (FileInputStream fis = new FileInputStream("example.txt")) {
    // read from the file
} catch (IOException e) {
    // handle the exception
}
```

在这个例子中，使用 `try-with-resources` 语句来创建 `FileInputStream` 对象，这将自动调用 `close()` 方法，以便释放文件句柄。

2) 数据库连接。数据库连接通常需要使用显式终止方法来释放连接。例如，`java.sql.Connection` 接口中的 `close()` 方法用于关闭数据库连接。

```java
try (Connection conn = DriverManager.getConnection(url, user, password)) {
    // use the database connection
} catch (SQLException e) {
    // handle the exception
}
```

在这个例子中，使用 `try-with-resources` 语句来创建 `Connection` 对象，这将自动调用 `close()` 方法，以便释放数据库连接。

3) 线程池。线程池通常需要使用显式终止方法来关闭线程池，以便释放线程资源。例如，`java.util.concurrent.ExecutorService` 接口中的 `shutdown()` 方法用于关闭线程池。

```java
ExecutorService executor = Executors.newFixedThreadPool(10);

try {
    // submit tasks to the executor
} finally {
    executor.shutdown();
}
```

在这个例子中，使用 `finally` 块来确保在执行完任务后关闭线程池，以便释放线程资源。

### 如何避免资源泄漏？

资源泄漏是指在使用资源（如文件句柄、网络连接、数据库连接、线程等）时，没有正确地释放或关闭它们，导致资源长时间占用，最终可能导致程序崩溃或系统性能下降。

以下是一些避免资源泄漏的方法：

1. 使用 `try-with-resources` 语句。`try-with-resources` 语句是一种自动关闭资源的机制，可以确保在使用完资源后自动关闭它们。例如：

```java
try (FileInputStream fis = new FileInputStream("example.txt")) {
    // read from the file
} catch (IOException e) {
    // handle the exception
}
```

在这个例子中，`FileInputStream` 对象将在 `try` 块结束后自动关闭。



2) 显式关闭资源。如果不能使用 `try-with-resources` 语句，应该使用显式关闭资源的方法来释放资源。例如，在使用完数据库连接后，应该调用 `Connection` 接口中的 `close()` 方法来释放连接。

   

3) 使用防御性编程。在使用资源时，应该使用防御性编程，确保在任何情况下都能正确地释放资源。例如，在使用文件句柄时，应该确保在读取或写入文件时，使用 `try-finally` 块来确保在发生异常时关闭文件句柄。

```kava
FileInputStream fis = null;

try {
    fis = new FileInputStream("example.txt");
    // read from the file
} catch (IOException e) {
    // handle the exception
} finally {
    if (fis != null) {
        try {
            fis.close();
        } catch (IOException e) {
            // handle the exception
        }
    }
}
```

在这个例子中，使用 `try-finally` 块来确保在发生异常时关闭文件句柄。

4) 使用资源管理框架。一些资源管理框架，例如 Apache Commons IO 和 Google Guava，提供了一些实用工具类和方法，可以帮助避免资源泄漏。

## 总结

终结器和清除器都是 Java 中用于对象清理的机制，它们各有优缺点。

终结器的优点：

1. 无需显式调用：终结器是一种自动的机制，无需显式调用，可以在对象被垃圾回收时自动执行。
2. 灵活性：终结器允许开发人员编写任意的清理代码，无需考虑清理操作的执行时间或顺序。

终结器的缺点：

1. 不可控性：终结器的执行时间和顺序是不可预测的，可能会导致一些问题，例如性能问题、不稳定的行为、低效率和可移植性问题。
2. 安全性问题：终结器可能会引起一些安全性问题，例如在 `finalize()` 方法中重新启动线程或打开文件等。

清除器的优点：

1. 明确的代码路径：清除器使用明确的代码路径来执行清理操作，相比终结器，它更加可控和安全。
2. 可控性：清除器允许开发人员控制何时执行清理操作，而不是完全依赖于垃圾回收器的行为。
3. 安全性：清除器执行清理操作时，会确保类加载器已准备好，因此可以安全地执行本地清理操作。

清除器的缺点：

1. 显式调用：清除器需要显式调用，开发人员需要为每个需要清理的对象注册一个清理器，这可能会增加代码的复杂性。
2. 限制性：清除器只能用于执行一些清理操作，不能用于执行其他类型的操作。

综上所述，终结器和清除器各有优缺点，应该根据实际需求和场景选择适当的机制来管理对象清理。`一般来说，应该优先使用显式终止方法来释放系统资源，只有在必要时才考虑使用终结器或清除器。`
