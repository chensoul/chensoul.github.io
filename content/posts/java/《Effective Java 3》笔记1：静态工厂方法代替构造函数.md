---
title: "《Effective Java 3》笔记1：静态工厂方法代替构造函数"
date: 2023-04-03T12:00:00+08:00
slug: static-factory-methods-instead-of-constructors
categories: ["Java"]
tags: ["java"]
---

本文是 《Effective Java 3》第二章的学习笔记，在整理笔记过程中，通过 chatgpt 的帮助做了一些扩展。

## 介绍

静态工厂方法是指在类中定义一个静态方法，用于创建该类的实例。示例：

```java
public static Boolean valueOf(boolean b) {
	return b ? Boolean.TRUE : Boolean.FALSE;
}
```

与构造函数不同的是，静态工厂方法可以有自己的名称，并且可以根据参数的不同返回不同的对象实例。

## 优点

这本书中提到了一些静态工厂方法的优点，包括：

1. 静态工厂方法可以有意义的名称：与构造函数不同，静态工厂方法可以有自己的名称，这使得代码更具有可读性和可维护性。

   > 例如，BigInteger 类提供了一个返回素数的静态工厂方法 `BigInteger.probablePrime` 。

2. 静态工厂方法可以隐藏实现细节：静态工厂方法可以隐藏对象的创建和初始化过程，使客户端代码更加简洁和易于维护。

   > 这是服务提供者框架的基础。
   >
   > 服务提供者框架中有三个基本组件：服务接口，代表要实现的服务；提供者注册 API，提供者使用它来注册实现，以及服务访问
   > API，客户端使用它来获取服务的实例。服务访问 API 允许客户端指定选择实现的标准。在没有这些条件的情况下，API
   > 返回一个默认实现的实例，或者允许客户端循环使用所有可用的实现。服务访问 API 是灵活的静态工厂，它构成了服务提供者框架的基础。
   >
   > 服务提供者框架的第四个可选组件是服务提供者接口，它描述了产生服务接口实例的工厂对象。在没有服务提供者接口的情况下，必须以反射的方式实例化实现。
   >
   > 在 JDBC 中，`Connection` 扮演服务接口的角色。`DriverManager.registerDriver` 是提供者注册的
   > API，`DriverManager.getConnection` 是服务访问 API，`Driver` 是服务提供者接口。
   >
   > 服务提供者框架模式有许多变体。例如，服务访问 API 可以向客户端返回比提供者提供的更丰富的服务接口，这是桥接模式。依赖注入框架可以看作是强大的服务提供者。由于是
   > Java 6，该平台包括一个通用服务提供者框架 `Java.util.ServiceLoader`，所以你不需要，通常也不应该自己写。JDBC 不使用
   > ServiceLoader，因为前者比后者要早。

3. 静态工厂方法可以返回缓存的对象：静态工厂方法可以返回缓存的对象，这避免了创建新对象的开销，提高了性能。

   > 这种技术类似于享元模式。如果经常请求相同的对象，特别是在创建对象的代价很高时，它可以极大地提高性能。

   **举例 1：使用 ConcurrentHashMap**

   ```java
   public class ThreadSafeCache {
       private static final Map<String, ThreadSafeCache> instances = new ConcurrentHashMap<>();

       private ThreadSafeCache() {}

       public static ThreadSafeCache getInstance(String key) {
           return instances.computeIfAbsent(key, k -> new ThreadSafeCache());
       }
   }
   ```

   在上面的示例中，`computeIfAbsent` 方法用于计算缓存对象。如果 `key` 在 `instances` 中不存在，则使用 lambda
   表达式 `k -> new ThreadSafeCache()` 创建一个新的 `ThreadSafeCache` 对象，并将该对象与 `key` 关联。如果 `key`
   已经存在，则直接返回与之关联的 `ThreadSafeCache` 对象。

   使用 `computeIfAbsent` 方法可以更简洁地实现线程安全的缓存类，并且可以确保在多线程环境下的线程安全性。

**举例 2：使用 synchronized 关键字**

```java
public class ThreadSafeCache {
    private static final Map<String, ThreadSafeCache> instances = new HashMap<>();

    private ThreadSafeCache() {}

    public static synchronized ThreadSafeCache getInstance(String key) {
        if (!instances.containsKey(key)) {
            instances.put(key, new ThreadSafeCache());
        }
        return instances.get(key);
    }
}
```

4. 静态工厂方法可以返回子类对象：静态工厂方法可以返回实现了某个接口或继承了某个类的子类对象，这提高了代码的灵活性和可扩展性。

   > 例如，Java 的 Collections 框架有 45
   > 个接口实用工具实现，提供了不可修改的集合、同步集合等。几乎所有这些实现都是通过一个非实例化类（`java.util.Collections`
   > ）中的静态工厂方法导出的。返回对象的类都是私有的子类。

   **举例：**

   ```java
   public interface Shape {
       void draw();
   }

   public class Circle implements Shape {
       @Override
       public void draw() {
           System.out.println("Drawing Circle");
       }
   }

   public class Square implements Shape {
       @Override
       public void draw() {
           System.out.println("Drawing Square");
       }
   }

   public class ShapeFactory {
       public static Shape getShape(String shapeType) {
           if (shapeType == null) {
               return null;
           }
           if (shapeType.equalsIgnoreCase("CIRCLE")) {
               return new Circle();
           } else if (shapeType.equalsIgnoreCase("SQUARE")) {
               return new Square();
           }
           return null;
       }
   }
   ```

   在上面的示例中，`ShapeFactory` 类使用静态工厂方法 `getShape` 来创建 `Shape` 对象。如果 `shapeType` 参数为 `CIRCLE`
   ，则创建 `Circle` 对象并返回，如果参数为 `SQUARE`，则创建 `Square` 对象并返回。

5. 静态工厂方法可以返回不可变对象：静态工厂方法可以返回不可变对象，这确保了对象的安全性和线程安全性。

   **举例**：

   ```java
   public final class ThreadSafeImmutableClass {
       private final int id;
       private final String name;

       private ThreadSafeImmutableClass(int id, String name) {
           this.id = id;
           this.name = name;
       }

       public static ThreadSafeImmutableClass getInstance(int id, String name) {
           return new ThreadSafeImmutableClass(id, name);
       }

       public int getId() {
           return id;
       }

       public String getName() {
           return name;
       }
   }
   ```

   在上面的示例中，`ThreadSafeImmutableClass` 类使用静态工厂方法 `getInstance`
   来创建不可变对象。由于该类的属性都是 `final` 的，因此该对象是不可变的。由于没有任何状态可以修改，因此该对象是线程安全的。

## 缺点

使用静态工厂方法也有一些缺点，例如：

1. 静态工厂方法可能会导致代码的可测试性变差，因为它们往往是静态的，难以进行模拟和替换。
2. 静态工厂方法可能会使代码的扩展性变差，因为它们通常是静态的，难以扩展和修改。
3. 静态工厂方法可能会使代码的可读性变差，因为它们往往是自定义的，难以理解和维护。

仅提供静态工厂方法也存在一些局限：

1. 不可继承：静态工厂方法是通过类名直接调用的，因此无法通过继承来创建对象的变体或子类对象。
2. 可能难以扩展：如果在实现静态工厂方法时没有考虑到所有可能的用例，那么在需要添加新功能或对象类型时可能会很难扩展。
3. 可能难以测试：如果静态工厂方法中包含复杂的逻辑或依赖外部资源，那么在测试时可能会很难模拟或替换这些依赖项。
4. 可能会引起混淆：如果在同一个类中定义多个静态工厂方法，它们可能具有相似的名称或参数类型，从而可能会导致混淆或误用。
5. 对象创建可能较慢：如果创建对象需要进行复杂的计算或依赖大量的外部资源，那么静态工厂方法可能会导致对象创建的性能问题。

所以，在选择不同的静态工厂方法时，需要考虑以下几个因素：

1. 目的：考虑每个工厂方法的目的，以及它是否符合您的需求。不同的工厂方法可能有不同的目的，例如创建新对象、返回共享实例或从一种类型转换为另一种类型。
2. 灵活性：考虑每个工厂方法的灵活性。某些工厂方法可能比其他工厂方法更灵活，允许更多的自定义或配置选项。
3. 可读性：考虑工厂方法的可读性。好的工厂方法应该易于阅读和理解，具有清晰的名称和明确的参数。
4. 性能：考虑每个工厂方法的性能影响。根据具体的用例，某些工厂方法可能比其他工厂方法更高效或更快。
5. 兼容性：考虑工厂方法是否与您现有的代码库和第三方库兼容。根据具体的技术和框架，某些工厂方法可能比其他工厂方法更兼容。
6. 维护：考虑每个工厂方法的维护影响。根据实现的复杂性以及文档和支持的可用性，某些工厂方法可能比其他工厂方法更易于维护。

## 使用

以下是一些常见静态工厂方法的名称：

- `from`，用于从其他类型的对象或数据源中创建一个对象，例如 `Date.from` 和 `Duration.from`。

  ```java
  Date d = Date.from(instant);
  ```

- `of`，一个聚合方法，它接受多个参数并返回一个包含这些参数的实例，例如：

  ```java
  Set<Rank> faceCards = EnumSet.of(JACK, QUEEN, KING);
  ```

- `valueOf`，一种替代 `from` 和 `of` 但更冗长的方法，例如：

  ```java
  BigInteger prime = BigInteger.valueOf(Integer.MAX_VALUE);
  ```

- `instance` 或 `getInstance`，返回一个实例，该实例由其参数（如果有的话）描述，但不具有相同的值，例如：

  ```java
  StackWalker luke = StackWalker.getInstance(options);
  ```

- `create` 或 `newInstance`，与 `instance` 或 `getInstance` 类似，只是该方法保证每个调用都返回一个新实例，例如：

  ```java
  Object newArray = Array.newInstance(classObject, arrayLen);
  ```

- `getType`，类似于 `getInstance`，但如果工厂方法位于不同的类中，则使用此方法。其类型是工厂方法返回的对象类型，例如：

  ```java
  FileStore fs = Files.getFileStore(path);

  Runtime runtime = Runtime.getRuntime();
  ```

- `newType`，与 `newInstance` 类似，但是如果工厂方法在不同的类中使用。类型是工厂方法返回的对象类型，例如：

  ```java
  BufferedReader br = Files.newBufferedReader(path);
  ```

- `type`，一个用来替代 `getType` 和 `newType` 的比较简单的方式，例如：

  ```java
  List<Complaint> litany = Collections.list(legacyLitany);
  ```

- `parse`：用于从字符串或其他格式中解析出一个对象，例如 `LocalDate.parse` 和 `NumberFormat.parse`。
- `build`：用于构建一个对象，例如 `RequestBuilder.build` 和 `ResponseBuilder.build`。

还有一些常用的静态工厂方法名称：

1. `asXxx`：用于将该类的对象转换为其他类型的对象，例如 `ByteBuffer.asCharBuffer` 和 `FileChannel.asIntBuffer`。
2. `toXxx`：用于将该类的对象转换为其他类型的对象，例如 `BigInteger.toByteArray` 和 `String.toCharArray`。
3. `getXXX`：用于获取某个对象，例如 `TimeZone.getDefault`。
4. `newXxx`：用于创建一个新的对象，例如 `File.newFile` 和 `Thread.newThread`。
5. `withXxx`：用于创建一个修改了指定属性的对象的副本，例如 `LocalDate.withYear` 和 `HttpHeaders.withAccept`。
6. `forXxx`：用于创建一个与指定参数相关的对象，例如 `Charset.forName` 和 `ThreadLocalRandom.forWeb`。
