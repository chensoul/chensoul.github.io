---
title: "Java设计模式：Balking"
date: 2023-08-25
slug: java-design-patterns-balking
categories: ["Java"]
tags: [java]
---

本文主要介绍 [Balking](https://java-design-patterns.com/zh/patterns/balking/) 模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

## 介绍

止步模式（Balking）是一种在对象处于特定状态时才执行操作的设计模式。它用于防止对象在不完整或不合适的状态下执行某些代码，从而确保代码的正确性和一致性。

该模式的核心思想是，在执行操作之前，检查对象的状态，并只在特定的状态下才执行操作。如果对象不处于预期状态，操作将被忽略或推迟执行，从而避免了不必要的操作或不一致的状态转换。

以下是止步模式的要点和示例：

1. 对象状态检查：在执行操作之前，对象会检查自身的状态。这可以通过使用条件语句或状态标志来实现。
2. 特定状态执行：只有当对象处于特定状态时，操作才会被执行。如果对象不满足执行条件，操作将被忽略或推迟执行。
3. 线程安全考虑：由于止步模式通常涉及多线程环境，需要确保对共享资源的访问是线程安全的。可以使用同步机制（如 synchronized 关键字）来保护共享资源。

## 解释

真实世界例子

> 洗衣机中有一个开始按钮，用于启动衣物洗涤。当洗衣机处于非活动状态时，按钮将按预期工作，但是如果已经在洗涤，则按钮将不起任何作用。

通俗地说

> 使用止步模式，仅当对象处于特定状态时才执行特定代码。

维基百科说

> 禁止模式是一种软件设计模式，仅当对象处于特定状态时才对对象执行操作。例如，一个对象读取 zip 压缩文件并在压缩文件没打开的时候调用 get 方法，对象将在请求的时候”止步“。

**程序示例**

在此示例中，` WashingMachine`是一个具有两个状态的对象，可以处于两种状态：`ENABLED` 和`WASHING`。 如果机器已启用，则使用线程安全方法将状态更改为 `WASHING`。 另一方面，如果已经进行了清洗并且任何其他线程执行 `wash（）`，则它将不执行该操作，而是不执行任何操作而返回。

这里是 `WashingMachine` 类相关的部分。

```java
@Slf4j
public class WashingMachine {

  private final DelayProvider delayProvider;
  private WashingMachineState washingMachineState;

  public WashingMachine(DelayProvider delayProvider) {
    this.delayProvider = delayProvider;
    this.washingMachineState = WashingMachineState.ENABLED;
  }

  public WashingMachineState getWashingMachineState() {
    return washingMachineState;
  }

  public void wash() {
    synchronized (this) {
      var machineState = getWashingMachineState();
      LOGGER.info("{}: Actual machine state: {}", Thread.currentThread().getName(), machineState);
      if (this.washingMachineState == WashingMachineState.WASHING) {
        LOGGER.error("Cannot wash if the machine has been already washing!");
        return;
      }
      this.washingMachineState = WashingMachineState.WASHING;
    }
    LOGGER.info("{}: Doing the washing", Thread.currentThread().getName());
    this.delayProvider.executeAfterDelay(50, TimeUnit.MILLISECONDS, this::endOfWashing);
  }

  public synchronized void endOfWashing() {
    washingMachineState = WashingMachineState.ENABLED;
    LOGGER.info("{}: Washing completed.", Thread.currentThread().getId());
  }
}
```

这里是一个 `WashingMachine` 所使用的 `DelayProvider` 简单接口。

```java
public interface DelayProvider {
  void executeAfterDelay(long interval, TimeUnit timeUnit, Runnable task);
}
```

现在，我们使用`WashingMachine`介绍该应用程序。

```java
  public static void main(String... args) {
    final var washingMachine = new WashingMachine();
    var executorService = Executors.newFixedThreadPool(3);
    for (int i = 0; i < 3; i++) {
      executorService.execute(washingMachine::wash);
    }
    executorService.shutdown();
    try {
      executorService.awaitTermination(10, TimeUnit.SECONDS);
    } catch (InterruptedException ie) {
      LOGGER.error("ERROR: Waiting on executor service shutdown!");
      Thread.currentThread().interrupt();
    }
  }
```

下面是程序的输出。

```text
14:02:52.268 [pool-1-thread-2] INFO com.iluwatar.balking.WashingMachine - pool-1-thread-2: Actual machine state: ENABLED
14:02:52.272 [pool-1-thread-2] INFO com.iluwatar.balking.WashingMachine - pool-1-thread-2: Doing the washing
14:02:52.272 [pool-1-thread-3] INFO com.iluwatar.balking.WashingMachine - pool-1-thread-3: Actual machine state: WASHING
14:02:52.273 [pool-1-thread-3] ERROR com.iluwatar.balking.WashingMachine - Cannot wash if the machine has been already washing!
14:02:52.273 [pool-1-thread-1] INFO com.iluwatar.balking.WashingMachine - pool-1-thread-1: Actual machine state: WASHING
14:02:52.273 [pool-1-thread-1] ERROR com.iluwatar.balking.WashingMachine - Cannot wash if the machine has been already washing!
14:02:52.324 [pool-1-thread-2] INFO com.iluwatar.balking.WashingMachine - 14: Washing completed.
```

在示例中，洗衣机（WashingMachine）是一个具有两个状态的对象：ENABLED（已启用）和 WASHING（正在洗涤）。通过使用同步方法和状态检查，洗衣机可以确保在正确的状态下执行特定的代码。如果洗衣机已经在洗涤过程中，再次调用洗涤方法时将不执行任何操作。

使用止步模式可以确保洗衣机在适当的状态下执行洗涤操作，避免了重复洗涤或并发冲突。

## 类图

![alt text](https://java-design-patterns.com/assets/balking-ffc04f30.png)

## 适用场景

止步模式适用于以下场景：

1. 对象状态依赖：当对象的操作依赖于其当前状态时，可以使用止步模式来确保操作只在特定状态下执行。这可以避免在对象状态不符合要求时执行无效或有害的操作。
2. 状态转换控制：当对象需要在特定状态之间进行转换时，可以使用止步模式来控制状态转换的发生。它可以防止不正确的状态转换和不一致的对象状态。
   - 网络连接管理：在一个网络应用程序中，当需要与远程服务器建立连接时，可以使用止步模式来确保只在未建立连接或已断开连接的状态下执行连接操作。这样可以避免重复连接、并发连接或在无效连接上执行操作。
   - 系统启动和关闭控制：在系统的启动和关闭过程中，可能需要限制某些操作只在特定阶段执行。使用止步模式，可以检查系统的状态，并只允许在特定阶段执行相应的操作，以确保系统的正确启动和安全关闭。
3. 并发环境下的状态同步：在多线程环境中，止步模式可以用于同步对象的状态，以确保在并发访问时只有一个线程可以执行特定操作。它可以避免并发冲突和数据损坏。
   - 并发任务调度：考虑一个任务调度器，允许添加和执行任务。如果在任务执行期间尝试添加新任务，可能会导致并发冲突或执行不一致的结果。通过使用止步模式，在任务执行开始时检查任务调度器的状态，并只允许在特定状态下添加新任务，可以避免并发冲突和不一致的任务执行。
4. 资源访问控制：当多个对象需要访问共享资源时，止步模式可以用于控制对资源的访问。它可以防止多个对象同时访问或修改资源，从而确保资源的一致性和完整性。
   - 文件读写操作：假设有一个文件处理类，其中某个方法负责读取文件的内容并返回。如果文件正在被写入或修改，那么读取操作可能会导致不一致的结果。使用止步模式，可以在读取操作开始时检查文件的状态，如果文件正在被写入，则推迟读取操作或直接忽略。
   - 缓存更新控制：在缓存系统中，当某个缓存项过期时需要更新，但同时可能有多个请求同时到达。使用止步模式，可以在更新操作开始时检查缓存项的状态，并只允许一个线程执行更新操作，其他线程等待或忽略更新请求，从而确保缓存的一致性和避免并发冲突。
5. 错误处理和异常避免：止步模式可以用于检测和处理潜在的错误情况，避免在不适当的状态下引发异常或导致错误的操作。

总的来说，止步模式适用于需要在特定状态下执行操作并确保状态一致性、避免并发冲突、控制资源访问以及处理错误的场景。它提供了一种简洁而有效的方式来管理对象的状态和操作。

## 举例

### 文件读写操作

当涉及到文件读写操作时，下面是一个简单的 Java 示例代码，演示了如何使用止步模式来控制文件读取操作：

```java
import java.io.File;
import java.io.IOException;

public class FileProcessor {
    private File file;
    private boolean isWriting;

    public FileProcessor(String filePath) {
        this.file = new File(filePath);
        this.isWriting = false;
    }

    public synchronized void processFile() {
        if (isWriting) {
            System.out.println("File is being written. Cannot process at the moment.");
            return;
        }

        isWriting = true;

        try {
            // Perform file processing operations
            System.out.println("Processing file: " + file.getName());
            // ...
            // File processing code goes here
            // ...

            System.out.println("File processing completed.");
        } catch (IOException e) {
            // Handle exception
            e.printStackTrace();
        } finally {
            isWriting = false;
        }
    }
}
```

在上述示例中，`FileProcessor`类代表了一个文件处理器，其中的`processFile`方法用于处理文件。在方法中，我们使用`synchronized`关键字来保证方法的同步执行，以防止并发访问。

在方法的开头，我们检查`isWriting`标志，如果文件正在被写入，则输出一条消息并直接返回。否则，我们将`isWriting`标志设置为`true`，表示文件正在被写入。

然后，我们可以在`// File processing code goes here`的注释处编写特定的文件处理逻辑，例如读取文件内容、修改文件等。

最后，在`finally`块中，我们将`isWriting`标志设置为`false`，表示文件写入操作已完成。

通过使用止步模式，我们确保了在文件正在被写入时不执行处理文件的操作，从而避免了不一致的结果和并发冲突。

请注意，上述代码是一个简化的示例，实际应用中可能需要考虑更多的细节和异常处理。此外，具体的文件处理逻辑需要根据实际需求进行编写。

### 并发任务调度

当涉及到并发任务调度时，下面是一个简单的 Java 示例代码，演示了如何使用止步模式来控制任务调度器的操作：

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TaskScheduler {
    private ExecutorService executorService;
    private boolean isRunning;

    public TaskScheduler() {
        this.executorService = Executors.newFixedThreadPool(1);
        this.isRunning = false;
    }

    public synchronized void addTask(Runnable task) {
        if (isRunning) {
            System.out.println("Task scheduler is already running. Cannot add new task at the moment.");
            return;
        }

        executorService.execute(task);
    }

    public synchronized void start() {
        if (isRunning) {
            System.out.println("Task scheduler is already running.");
            return;
        }

        isRunning = true;
        System.out.println("Task scheduler started.");
    }

    public synchronized void stop() {
        if (!isRunning) {
            System.out.println("Task scheduler is not running.");
            return;
        }

        executorService.shutdown();
        isRunning = false;
        System.out.println("Task scheduler stopped.");
    }
}
```

在上述示例中，`TaskScheduler`类代表了一个任务调度器，其中的`addTask`方法用于添加任务，`start`方法用于启动任务调度器，`stop`方法用于停止任务调度器。

在`addTask`方法中，我们首先检查`isRunning`标志，如果任务调度器正在运行，则输出一条消息并直接返回。否则，我们将任务提交到线程池中进行执行。

在`start`方法中，我们检查`isRunning`标志，如果任务调度器已经在运行，则输出一条消息并直接返回。否则，我们将`isRunning`标志设置为`true`，表示任务调度器已经启动。

在`stop`方法中，我们检查`isRunning`标志，如果任务调度器没有在运行，则输出一条消息并直接返回。否则，我们调用线程池的`shutdown`方法来停止任务的执行，然后将`isRunning`标志设置为`false`，表示任务调度器已经停止。

通过使用止步模式，我们确保了在任务调度器正在运行时不添加新任务，以及在任务调度器未运行时不停止任务调度器，从而避免了并发冲突和不一致的任务调度。

请注意，上述代码是一个简化的示例，实际应用中可能需要考虑更多的细节、并发安全性和异常处理。此外，具体的任务逻辑需要根据实际需求进行编写。

### 网络连接管理

当涉及到网络连接管理时，下面是一个简单的 Java 示例代码，演示了如何使用止步模式来控制网络连接的操作：

```java
import java.util.concurrent.locks.ReentrantLock;

public class NetworkConnectionManager {
    private ReentrantLock lock;
    private boolean isConnected;

    public NetworkConnectionManager() {
        this.lock = new ReentrantLock();
        this.isConnected = false;
    }

    public void connect() {
        lock.lock();

        try {
            if (isConnected) {
                System.out.println("Already connected to the network.");
                return;
            }

            // Perform network connection operation
            System.out.println("Connecting to the network...");
            // ...
            // Network connection code goes here
            // ...

            isConnected = true;
            System.out.println("Successfully connected to the network.");
        } finally {
            lock.unlock();
        }
    }

    public void disconnect() {
        lock.lock();

        try {
            if (!isConnected) {
                System.out.println("Not currently connected to the network.");
                return;
            }

            // Perform disconnection operation
            System.out.println("Disconnecting from the network...");
            // ...
            // Network disconnection code goes here
            // ...

            isConnected = false;
            System.out.println("Successfully disconnected from the network.");
        } finally {
            lock.unlock();
        }
    }
}
```

在上述示例中，`NetworkConnectionManager`类代表了一个网络连接管理器，其中的`connect`方法用于连接到网络，`disconnect`方法用于断开网络连接。

在`connect`方法中，我们首先获取锁，然后检查`isConnected`标志，如果已经连接到网络，则输出一条消息并直接返回。否则，我们执行网络连接操作，然后将`isConnected`标志设置为`true`，表示成功连接到网络。

在`disconnect`方法中，我们同样获取锁，然后检查`isConnected`标志，如果未连接到网络，则输出一条消息并直接返回。否则，我们执行网络断开操作，然后将`isConnected`标志设置为`false`，表示成功断开网络连接。

通过使用止步模式和可重入锁，我们确保了在网络连接期间不执行重复的连接操作或在未连接时执行断开操作，从而避免了并发冲突和不一致的网络状态。

请注意，上述代码是一个简化的示例，实际应用中可能需要考虑更多的细节、并发安全性和异常处理。此外，具体的网络连接和断开逻辑需要根据实际需求进行编写。

### 缓存更新控制

当涉及到缓存更新控制时，下面是一个简单的 Java 示例代码，演示了如何使用止步模式来控制缓存的更新操作：

```java
import java.util.concurrent.locks.ReentrantLock;

public class CacheManager {
    private ReentrantLock lock;
    private boolean isUpdating;

    public CacheManager() {
        this.lock = new ReentrantLock();
        this.isUpdating = false;
    }

    public void updateCache() {
        lock.lock();

        try {
            if (isUpdating) {
                System.out.println("Cache is already being updated. Cannot perform update at the moment.");
                return;
            }

            isUpdating = true;

            // Perform cache update operation
            System.out.println("Updating cache...");
            // ...
            // Cache update code goes here
            // ...

            System.out.println("Cache update completed.");
        } finally {
            isUpdating = false;
            lock.unlock();
        }
    }
}
```

在上述示例中，`CacheManager`类代表了一个缓存管理器，其中的`updateCache`方法用于更新缓存。

在`updateCache`方法中，我们首先获取锁，然后检查`isUpdating`标志，如果缓存正在被更新，则输出一条消息并直接返回。否则，我们将`isUpdating`标志设置为`true`，表示缓存正在被更新。

然后，我们可以在`// Cache update code goes here`的注释处编写特定的缓存更新逻辑，例如从数据库中获取最新数据、更新缓存项等。

最后，在`finally`块中，我们将`isUpdating`标志设置为`false`，表示缓存更新操作已完成，并释放锁。

通过使用止步模式和可重入锁，我们确保了在缓存正在被更新时不执行重复的更新操作，从而避免了并发冲突和不一致的缓存状态。

请注意，上述代码是一个简化的示例，实际应用中可能需要考虑更多的细节、并发安全性和异常处理。此外，具体的缓存更新逻辑需要根据实际需求进行编写。

### 资源分配和释放

当涉及到资源分配和释放时，下面是一个简单的 Java 示例代码，演示了如何使用止步模式来控制资源的获取和释放操作：

```java
import java.util.concurrent.Semaphore;

public class ResourceManager {
    private Semaphore semaphore;

    public ResourceManager(int resourceCount) {
        this.semaphore = new Semaphore(resourceCount);
    }

    public void acquireResource() {
        try {
            semaphore.acquire();
            System.out.println("Resource acquired.");

            // Perform resource allocation and usage here
            // ...

            // Simulating resource usage
            Thread.sleep(2000);

            System.out.println("Resource released.");
            semaphore.release();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

在上述示例中，`ResourceManager`类代表了一个资源管理器，其中的`acquireResource`方法用于获取和释放资源。

在`acquireResource`方法中，我们首先调用`semaphore.acquire()`来获取一个可用资源。如果没有可用资源，当前线程会阻塞，直到有资源可用。

一旦成功获取资源，我们可以在获取资源后的代码块中执行资源的分配和使用逻辑。这里只是一个简单的示例，你可以根据实际需求编写你自己的资源分配和使用逻辑。

在模拟资源使用的部分，我们使用`Thread.sleep(2000)`来模拟资源的实际使用，这里暂停 2 秒钟。然后，我们释放资源，调用`semaphore.release()`来通知信号量，表示资源已经释放。

通过使用止步模式和信号量（Semaphore），我们可以控制资源的获取和释放操作，确保资源在被使用时不会被多个线程同时访问，从而避免了资源冲突和不一致的结果。

请注意，上述代码是一个简化的示例，实际应用中可能需要考虑更多的细节、并发安全性和异常处理。此外，具体的资源分配和释放逻辑需要根据实际需求进行编写。

### 数据库事务管理

当涉及到数据库事务管理时，下面是一个简单的 Java 示例代码，演示了如何使用止步模式来控制数据库事务的操作：

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseManager {
    private Connection connection;
    private boolean inTransaction;

    public DatabaseManager() {
        this.connection = null;
        this.inTransaction = false;
    }

    public void startTransaction() throws SQLException {
        if (inTransaction) {
            System.out.println("Transaction is already in progress.");
            return;
        }

        connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/mydb", "username", "password");
        connection.setAutoCommit(false);
        inTransaction = true;

        System.out.println("Transaction started.");
    }

    public void commitTransaction() throws SQLException {
        if (!inTransaction) {
            System.out.println("No transaction in progress.");
            return;
        }

        connection.commit();
        connection.setAutoCommit(true);
        connection.close();
        connection = null;
        inTransaction = false;

        System.out.println("Transaction committed and connection closed.");
    }

    public void rollbackTransaction() throws SQLException {
        if (!inTransaction) {
            System.out.println("No transaction in progress.");
            return;
        }

        connection.rollback();
        connection.setAutoCommit(true);
        connection.close();
        connection = null;
        inTransaction = false;

        System.out.println("Transaction rolled back and connection closed.");
    }
}
```

在上述示例中，`DatabaseManager`类代表了一个数据库管理器，其中的`startTransaction`方法用于开始事务，`commitTransaction`方法用于提交事务，`rollbackTransaction`方法用于回滚事务。

在`startTransaction`方法中，我们首先检查`inTransaction`标志，如果已经存在一个事务正在进行，则输出一条消息并直接返回。否则，我们通过`DriverManager`获取数据库连接，并将自动提交设置为`false`，表示手动管理事务。然后，我们将`inTransaction`标志设置为`true`，表示事务已开始。

在`commitTransaction`方法中，我们检查`inTransaction`标志，如果没有进行中的事务，则输出一条消息并直接返回。否则，我们调用`connection.commit()`提交事务，然后将自动提交设置为`true`，关闭数据库连接，并将相关变量重置为初始状态。

在`rollbackTransaction`方法中，我们同样检查`inTransaction`标志，如果没有进行中的事务，则输出一条消息并直接返回。否则，我们调用`connection.rollback()`回滚事务，然后将自动提交设置为`true`，关闭数据库连接，并将相关变量重置为初始状态。

通过使用止步模式和数据库事务，我们可以确保在同一时间只有一个事务在进行，避免了并发冲突和不一致的数据库状态。

请注意，上述代码是一个简化的示例，实际应用中可能需要考虑更多的细节、异常处理和连接池管理。此外，具体的数据库操作和事务逻辑需要根据实际需求进行编写。

### 线程间的协调和同步

当涉及到线程间的协调和同步时，下面是一个简单的 Java 示例代码，演示了如何使用止步模式和条件变量来实现生产者-消费者模式：

```java
import java.util.LinkedList;
import java.util.Queue;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class ProducerConsumer {
    private Queue<Integer> buffer;
    private int maxSize;
    private ReentrantLock lock;
    private Condition notFull;
    private Condition notEmpty;

    public ProducerConsumer(int maxSize) {
        this.buffer = new LinkedList<>();
        this.maxSize = maxSize;
        this.lock = new ReentrantLock();
        this.notFull = lock.newCondition();
        this.notEmpty = lock.newCondition();
    }

    public void produce() throws InterruptedException {
        lock.lock();

        try {
            while (buffer.size() == maxSize) {
                System.out.println("Buffer is full. Producer is waiting.");
                notFull.await();
            }

            int item = generateItem();
            buffer.offer(item);
            System.out.println("Produced item: " + item);
            notEmpty.signalAll();
        } finally {
            lock.unlock();
        }
    }

    public void consume() throws InterruptedException {
        lock.lock();

        try {
            while (buffer.isEmpty()) {
                System.out.println("Buffer is empty. Consumer is waiting.");
                notEmpty.await();
            }

            int item = buffer.poll();
            System.out.println("Consumed item: " + item);
            notFull.signalAll();
        } finally {
            lock.unlock();
        }
    }

    private int generateItem() {
        // Generate a random item
        return (int) (Math.random() * 100);
    }
}
```

在上述示例中，`ProducerConsumer`类代表了一个生产者消费者模型的实现，其中的`produce`方法用于生产项目，`consume`方法用于消费项目。

在构造函数中，我们初始化了一个队列`buffer`作为缓冲区，以及一个`maxSize`变量表示缓冲区的最大容量。我们还创建了一个可重入锁`lock`，以及两个条件变量`notFull`和`notEmpty`，用于协调生产者和消费者之间的操作。

在`produce`方法中，我们首先获取锁，并使用`while`循环来检查缓冲区是否已满。如果已满，表示无法继续生产，生产者线程会等待在`notFull`条件变量上。一旦有空闲空间，生产者会生成一个项目，并将其添加到缓冲区中。然后，我们唤醒所有等待在`notEmpty`条件变量上的消费者线程。

在`consume`方法中，我们同样获取锁，并使用`while`循环来检查缓冲区是否为空。如果为空，表示无法继续消费，消费者线程会等待在`notEmpty`条件变量上。一旦有项目可供消费，消费者会从缓冲区中取出一个项目。然后，我们唤醒所有等待在`notFull`条件变量上的生产者线程。

通过使用止步模式、可重入锁和条件变量，我们实现了生产者消费者模式的线程协调和同步，确保了生产者在缓冲区已满时等待，消费者在缓冲区为空时等待，从而避免了并发冲突和不一致的结果。

请注意，上述代码是一个简化的示例，实际应用中可能需要考虑更多的细节、异常处理和线程安全性。此外，具体的生产者和消费者逻辑需要根据实际需求进行编写。

### 错误处理和异常避免

当涉及到错误处理和异常避免时，下面是一个简单的 Java 示例代码，演示了如何使用异常处理和防御性编程来处理潜在的错误情况：

```java
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class ErrorHandling {
    public static void main(String[] args) {
        try {
            readFile("myfile.txt");
        } catch (FileNotFoundException e) {
            System.out.println("File not found: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
        }
    }

    public static void readFile(String filename) throws IOException {
        File file = new File(filename);

        if (!file.exists()) {
            throw new FileNotFoundException("File not found: " + filename);
        }

        FileReader reader = null;

        try {
            reader = new FileReader(file);
            // 读取文件内容
        } finally {
            if (reader != null) {
                try {
                    reader.close();
                } catch (IOException e) {
                    System.out.println("Error closing file: " + e.getMessage());
                }
            }
        }
    }
}
```

在上述示例中，我们尝试读取名为`myfile.txt`的文件。首先，我们调用`readFile`方法，并在方法签名中声明可能抛出的异常类型`IOException`。

在`readFile`方法中，我们首先创建一个`File`对象，表示要读取的文件。然后，我们检查文件是否存在，如果不存在，抛出`FileNotFoundException`异常。

接下来，我们创建一个`FileReader`对象来读取文件内容。在`finally`块中，我们使用防御性编程的方式关闭文件读取器。首先，我们检查读取器是否为`null`，如果不为`null`，则调用`close`方法关闭读取器。在关闭过程中，如果发生异常，我们捕获并处理它，并输出相应的错误消息。

在`main`方法中，我们使用`try-catch`块来捕获可能抛出的异常。如果文件不存在，我们捕获并处理`FileNotFoundException`，如果在读取文件时发生错误，我们捕获并处理`IOException`。在异常处理块中，我们输出相应的错误消息。

通过使用异常处理和防御性编程，我们可以捕获和处理潜在的错误情况，从而避免程序因错误而崩溃，并提供有用的错误信息。

请注意，上述代码是一个简化的示例，实际应用中可能需要考虑更多的细节和特定的错误处理方式。此外，具体的错误处理和异常避免策略需要根据实际需求进行编写。

## 相关模式

- [保护性暂挂模式](https://java-design-patterns.com/patterns/guarded-suspension/)
- [双重检查锁模式](https://java-design-patterns.com/patterns/double-checked-locking/)

## 鸣谢

- [Patterns in Java: A Catalog of Reusable Design Patterns Illustrated with UML, 2nd Edition, Volume 1](https://www.amazon.com/gp/product/0471227293/ref=as_li_qf_asin_il_tl?ie=UTF8&tag=javadesignpat-20&creative=9325&linkCode=as2&creativeASIN=0471227293&linkId=0e39a59ffaab93fb476036fecb637b99)

原文链接：[https://java-design-patterns.com/zh/patterns/balking/](https://java-design-patterns.com/zh/patterns/balking/)
