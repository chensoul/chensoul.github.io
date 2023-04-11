---
title: "《Effective Java 3》笔记：使用私有构造函数或枚举类型创建单例"
date: 2023-04-11T08:00:00+08:00
slug: enforce-the-singleton-property-with-a-private-constructor-or-an-enum-type
categories: ["Notes"]
tags: ["java"]
authors:
  - chensoul
---

本文是 《Effective Java 3》第二章的学习笔记，在整理笔记过程中，通过 chatgpt 的帮助做了一些扩展。

## 介绍

单例是一个只实例化一次的类。单例通常表示无状态对象，比如函数或系统组件，它们在本质上是唯一的。**将一个类设计为单例会使它的客户端测试时变得困难，** 除非它实现了作为其类型的接口，否则无法用模拟实现来代替单例。



## 实现

实现单例有两种常见的方法。两者都基于保持构造函数私有和导出公共静态成员以提供对唯一实例的访问。

在第一种方法中，成员是一个 final 字段：

```java
// Singleton with public final field
public class Elvis {
    public static final Elvis INSTANCE = new Elvis();
    private Elvis() { ... }
    public void leaveTheBuilding() { ... }
}
```



私有构造函数只调用一次，用于初始化 `public static final `修饰的 Elvis 类型字段 `INSTANCE`。不使用 `public` 或 `protected` 的构造函数保证了「独一无二」的空间：一旦初始化了 Elvis 类，就只会存在一个 Elvis 实例，不多也不少。客户端所做的任何事情都不能改变这一点，但有一点需要注意：拥有特殊权限的客户端可以借助 `AccessibleObject.setAccessible` 方法利用反射调用私有构造函数。

```java
Constructor<?>[] constructors = Elvis.class.getDeclaredConstructors();
AccessibleObject.setAccessible(constructors, true);

Arrays.stream(constructors).forEach(name -> {
    if (name.toString().contains("Elvis")) {
        Elvis instance = (Elvis) name.newInstance();
        instance.leaveTheBuilding();
    }
});
```

如果需要防范这种攻击，请修改构造函数，使其在请求创建第二个实例时抛出异常。



在实现单例的第二种方法中，公共成员是一种静态工厂方法：

```java
// Singleton with static factory
public class Elvis {
    private static final Elvis INSTANCE = new Elvis();
    private Elvis() { ... }
    public static Elvis getInstance() { return INSTANCE; }
    public void leaveTheBuilding() { ... }
}
```

所有对 `getInstance()` 方法的调用都返回相同的对象引用，并且不会创建其他 Elvis 实例。



公共字段方法的主要优点是 API 明确了类是单例的：public static 修饰的字段是 final 的，因此它总是包含相同的对象引用。第二个优点是更简单。



静态工厂方法的一个优点是，它可以在不更改 API 的情况下决定类是否是单例。工厂方法返回唯一的实例，但是可以对其进行修改，为调用它的每个线程返回一个单独的实例。第二个优点是，如果应用程序需要的话，可以编写泛型的单例工厂。使用静态工厂的最后一个优点是方法引用能够作为一个提供者，例如 `Elvis::getInstance` 是 `Supplier<Elvis>` 的提供者。

```java
Supplier<Elvis> sup = Elvis::getInstance;
Elvis obj = sup.get();
obj.leaveTheBuilding();
```

除非能够与这些优点沾边，否则使用 public 字段的方式更可取。



要使单例类使用这两种方法中的任何一种实现可序列化，仅仅在其声明中添加实现 `serializable` 是不够的。要维护单例保证，应声明所有实例字段为 `transient`，并提供 `readResolve` 方法。否则，每次反序列化实例时，都会创建一个新实例，在我们的示例中，这会导致出现虚假的 Elvis。

```java
// readResolve method to preserve singleton property
private Object readResolve() {
    // Return the one true Elvis and let the garbage collector
    // take care of the Elvis impersonator.
    return INSTANCE;
}
```



实现单例的第三种方法是声明一个单元素枚举：

```java
// Enum singleton - the preferred approach
public enum Elvis {
    INSTANCE;
    public void leaveTheBuilding() { ... }
}
```

这种方法类似于 `public` 字段方法，但是它更简洁，默认提供了序列化机制，提供了对多个实例化的严格保证，即使面对复杂的序列化或反射攻击也是如此。这种方法可能有点不自然，但是**单元素枚举类型通常是实现单例的最佳方法。** 注意，如果你的单例必须扩展一个超类而不是 `Enum`（尽管你可以声明一个 Enum 来实现接口），你就不能使用这种方法。



## 扩展

单例模式是一种创建型设计模式，它确保一个类只有一个实例，并提供一个全局访问点来访问该实例。在Java语言中，单例模式一般有以下几种实现方式：

### 饿汉式单例模式

在类加载时就创建单例实例，因此也称为静态初始化单例。

```java
public class EagerSingleton {
    private static final EagerSingleton instance = new EagerSingleton();

    private EagerSingleton() {}

    public static EagerSingleton getInstance() {
        return instance;
    }
}
```



### 懒汉式单例模式

在第一次调用`getInstance()`方法时才创建单例实例，也称为延迟初始化单例。

```java
public class LazySingleton {
    private static LazySingleton instance;

    private LazySingleton() {}

    public static synchronized LazySingleton getInstance() {
        if (instance == null) {
            instance = new LazySingleton();
        }
        return instance;
    }
}
```

在这个示例代码中，我们使用了`synchronized`关键字来保证线程安全。但是这种方式会影响性能，因为每次调用`getInstance()`方法都会进行同步。因此，我们可以使用双重检查锁定来提高性能。



### 双重检查锁定单例模式

在懒汉式单例模式的基础上，使用双重检查锁定来保证线程安全和性能。

```java
public class LazySingleton {
    private static volatile LazySingleton instance;

    private LazySingleton() {}

    public static LazySingleton getInstance() {
        if (instance == null) {
            synchronized (LazySingleton.class) {
                if (instance == null) {
                    instance = new LazySingleton();
                }
            }
        }
        return instance;
    }
}
```

在上述实现中，`instance` 字段使用 `volatile` 关键字修饰，可以确保多个线程都能够正确地处理该变量。

在 `getInstance()` 方法中，首先检查实例是否已经存在，如果存在则直接返回实例引用。否则，获取类对象的锁，再次检查实例是否存在。如果实例仍然不存在，则创建实例。由于 `synchronized` 关键字可以确保同一时刻只有一个线程可以进入临界区，因此可以避免多个线程同时创建实例的情况。

需要注意的是，在使用双重锁检测时，需要使用 `volatile` 关键字来保证多个线程都能够正确地处理共享变量。同时，为了保证所有线程都看到同一个实例，需要使用静态字段来存储单例实例。

>**关于  `volatile` 关键字修饰**
>
>在 Java 中，当一个变量被多个线程共享时，如果没有采取特殊的措施，可能会出现一个线程修改了变量值，但其他线程并没有看到该变量的变化的情况。这是因为每个线程都有自己的 CPU 缓存，该变量的值可能存在于某个线程的 CPU 缓存中，但其他线程并没有及时更新缓存中的值。
>
>`volatile` 是一种 Java 关键字，它可以确保多个线程都能够正确地处理该变量。当一个变量被声明为 `volatile` 时，它会具有以下特性：
>
>1. 可见性：当一个线程修改了 `volatile` 变量的值时，其他线程可以立即看到该变化。
>2. 禁止指令重排：编译器和 CPU 会对指令进行重排以提高执行效率，但有时这种重排可能会导致多线程程序出现问题。`volatile` 变量的写操作会在读操作之前，确保变量的修改对其他线程立即可见，从而禁止指令重排。
>
>在上述单例模式实现中，`instance` 字段被声明为 `volatile`，这是为了确保多个线程都能够正确地处理该变量。如果没有使用 `volatile`，可能会出现某个线程创建了实例，但其他线程并没有看到该变化的情况。使用 `volatile` 可以确保多个线程都能够正确地处理 `instance` 变量，从而避免出现多个实例的情况。



### 枚举单例模式

使用枚举类型来定义单例，它保证了线程安全和序列化安全。

```java
public enum EnumSingleton {
    INSTANCE;

    public void doSomething() {
        // do something
    }
}
```

>**关于枚举**
>
>在 Java 中，枚举是一种特殊的类，它可以用于定义一组常量。枚举常量是在枚举类被加载时创建的，且只会被创建一次。因此，枚举天然具有单例模式的特性。
>
>在 Java 中，单例模式是一种常用的设计模式，它可以确保某个类只有一个实例，并提供全局访问点。单例模式的实现方式有多种，包括懒汉式、饿汉式、双重检查锁等。但是，这些实现方式都需要考虑线程安全和序列化等问题，而枚举天然具有线程安全和序列化的特性。
>
>枚举类是在 Java 1.5 版本中引入的，它是一个特殊的类，可以用于定义一组常量。枚举常量是在枚举类被加载时创建的，且只会被创建一次。因此，枚举天然具有单例模式的特性，而且枚举类的实现方式非常简单，无需考虑线程安全和序列化等问题。因此，使用枚举实现单例模式是一种简单、安全、高效的方式。



一个实际中使用的例子：

```java
@AllArgsConstructor
@Getter
public enum ChannelType implements CodeAware {
    VMS(2, "语音电话") {
        @Override
        public AbstractNotificationStrategy strategy(Properties properties, NotificationTemplate notificationTemplate, Collection<NotificationUser> users) {
            return new VmsNotificationStrategy(new VmsNotificationChannel(properties), notificationTemplate, users);
        }

        @Override
        public NotificationTemplate template(String title, String template, Set<String> imageUrls) {
            return new VmsNotificationTemplate(title, template, imageUrls);
        }
    },
    FEISHU(3, "飞书") {
        @Override
        public AbstractNotificationStrategy strategy(Properties properties, NotificationTemplate notificationTemplate, Collection<NotificationUser> users) {
            return new FeishuNotificationStrategy(new FeishuNotificationChannel(properties), notificationTemplate, users);
        }

        @Override
        public NotificationTemplate template(String title, String template, Set<String> imageUrls) {
            return new FeishuNotificationTemplate(title, template, imageUrls);
        }
    };

    private Integer code;
    private String name;

    public abstract AbstractNotificationStrategy strategy(Properties properties, NotificationTemplate notificationTemplate, Collection<NotificationUser> users);

    public abstract NotificationTemplate template(String title, String template, Set<String> imageUrls);
}
```



### 静态内部类单例模式

静态内部类单例模式是一种常用的实现单例模式的方式，它可以保证线程安全且实现简单。在该模式中，单例实例是通过静态内部类来实现的。

> 在 Java 中，静态内部类是一种特殊的类，它是在另一个类内部定义的静态类。静态内部类可以访问外部类的静态字段和方法，但不能访问外部类的非静态字段和方法。

使用静态内部类实现单例模式的方式如下：

```java
public class StaticInnerClassSingleton {
    private StaticInnerClassSingleton() {}

    private static class SingletonHolder {
        private static final StaticInnerClassSingleton INSTANCE = new StaticInnerClassSingleton();
    }

    public static StaticInnerClassSingleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

在上述代码中，`SingletonHolder` 是静态内部类，它包含一个静态常量 `INSTANCE`，该常量是在静态内部类被加载时创建的，且只会被创建一次。由于静态内部类的加载是在需要时才进行的，因此可以实现懒加载的效果。在 `getInstance` 方法中，直接返回 `SingletonHolder.INSTANCE` 即可获取单例实例。

在静态内部类单例模式中，由于静态内部类的加载是在需要时才进行的，且只会被加载一次，因此可以保证单例实例的线程安全。在多线程环境下，多个线程同时调用 `getInstance` 方法时，由于静态内部类的加载是线程安全的，因此可以保证只有一个单例实例被创建。

此外，静态内部类单例模式的实现方式简单且易于理解，而且不需要考虑线程安全和序列化等问题，因此是一种常用的实现单例模式的方式。



### 注册式单例模式

使用容器来存储单例实例，通过唯一的标识符来访问单例实例。

总的来说，每种实现方式都有其适用的场景和优缺点，开发者需要根据具体的需求来选择合适的实现方式。

```java
public class SingletonRegistry {
    private static Map<String, Object> registry = new HashMap<>();

    private SingletonRegistry() {}

    public static synchronized void register(String name, Object obj) {
        registry.put(name, obj);
    }

    public static synchronized Object getSingleton(String name) {
        return registry.get(name);
    }
}
```

在这个示例代码中，我们在`register()`方法和`getSingleton()`方法上都加了`synchronized`关键字，确保了多线程情况下的线程安全。但是这种方式会影响性能，因为每次调用`getSingleton()`方法都会进行同步。

以下是使用并发容器实现线程安全的示例代码：

```java
public class SingletonRegistry {
    private static ConcurrentMap<String, Object> registry = new ConcurrentHashMap<>();

    private SingletonRegistry() {}

    public static void register(String name, Object obj) {
        registry.put(name, obj);
    }

    public static Object getSingleton(String name) {
        return registry.get(name);
    }
}
```



使用`ConcurrentMap`的`computeIfAbsent`方法可以更加简洁地实现线程安全的注册式单例模式，它可以确保多线程情况下的线程安全，并且避免了使用`synchronized`关键字带来的性能问题。

以下是使用`ConcurrentMap`的`computeIfAbsent`方法实现线程安全的示例代码：

```java
public class SingletonRegistry {
    private static ConcurrentMap<String, Object> registry = new ConcurrentHashMap<>();

    private SingletonRegistry() {}

    public static void register(String name, Object obj) {
        registry.putIfAbsent(name, obj);
    }

    public static Object getSingleton(String name) {
        return registry.computeIfAbsent(name, key -> createSingleton(key));
    }

    private static Object createSingleton(String name) {
        // create singleton object
        return new Object();
    }
}
```

在这个示例代码中，我们使用`ConcurrentHashMap`来存储注册信息，并且使用了`putIfAbsent`方法来避免重复添加元素。在`getSingleton`方法中，我们使用了`computeIfAbsent`方法来获取单例实例，如果实例不存在，则调用`createSingleton`方法创建实例。由于`ConcurrentHashMap`的并发操作是线程安全的，因此使用`computeIfAbsent`方法可以确保多线程情况下的线程安全。



## 运用

以下，整理了常见的开源框架中单例模式运用。

### Log4j

Log4j 是一个用于记录日志的开源框架，它使用单例模式来管理 Logger 的实例。Logger 是一个线程安全的类，用于记录应用程序的日志信息。

以下是 Log4j 的单例模式实现代码：

```java
public class Logger {
    private static final Map<String, Logger> instances = new ConcurrentHashMap<>();

    private Logger() {
        // private constructor
    }

    public static Logger getLogger(String name) {
        Logger instance = instances.get(name);
        if (instance == null) {
            synchronized (instances) {
                instance = instances.get(name);
                if (instance == null) {
                    instance = new Logger();
                    instances.put(name, instance);
                }
            }
        }
        return instance;
    }

    // other methods
}
```

在这个示例中，Logger 使用一个 Map 来缓存所有的 Logger 实例，并在需要获取 Logger 实例时使用双重检查锁定机制来确保只有一个线程可以创建实例。



### Jedis

Jedis 是一个用于连接 Redis 数据库的开源框架，它使用单例模式来管理 JedisPool 的实例。JedisPool 是一个线程安全的类，用于管理可重用的 Jedis 实例。

以下是 Jedis 的单例模式实现代码：

```java
public class JedisPool {
    private static final Map<String, JedisPool> INSTANCES = new ConcurrentHashMap<>();

    private JedisPool() {
        // private constructor
    }

    public static synchronized JedisPool getInstance(String host, int port) {
        String key = host + ":" + port;
        JedisPool instance = INSTANCES.get(key);
        if (instance == null) {
            instance = new JedisPool(host, port);
            INSTANCES.put(key, instance);
        }
        return instance;
    }

    // other methods
}
```

在这个示例中，Jedis 使用一个 ConcurrentHashMap 来缓存所有的 JedisPool 实例，并在需要获取 JedisPool 实例时使用 synchronized 方法来确保只有一个线程可以创建实例。

### Retrofit

Retrofit 是一个用于简化 HTTP 请求的开源框架，它使用单例模式来管理 Retrofit 的实例。Retrofit 是一个线程安全的类，用于创建 HTTP 请求。

以下是 Retrofit 的单例模式实现代码：

```java
public class Retrofit {
    private static final Retrofit INSTANCE = new Retrofit();

    private Retrofit() {
        // private constructor
    }

    public static Retrofit getInstance() {
        return INSTANCE;
    }

    public <T> T create(Class<T> service) {
        // create HTTP request using service interface
    }

    // other methods
}
```

在这个示例中，Retrofit 使用静态变量和静态方法来获取单例实例，并在整个应用程序中共享使用。

### Gson

Gson 是一个用于将 JSON 字符串转换为 Java 对象的开源框架，它使用单例模式来管理 Gson 的实例。Gson 是一个线程安全的类，用于处理 JSON 数据。

以下是 Gson 的单例模式实现代码：

```java
public class Gson {
    private static final Gson INSTANCE = new Gson();

    private Gson() {
        // private constructor
    }

    public static Gson getInstance() {
        return INSTANCE;
    }

    public <T> T fromJson(String json, Class<T> classOfT) {
        // convert JSON string to Java object
    }

    // other methods
}
```

在这个示例中，Gson 使用静态变量和静态方法来获取单例实例，并在整个应用程序中共享使用。

### Spring Framework

Spring Framework 是一个用于构建企业级 Java 应用程序的开源框架，它使用单例模式来管理 Bean 的实例。Bean 是一个线程安全的类，用于实现应用程序的业务逻辑。

以下是 Spring Framework 的单例模式实现代码：

```java
public class DefaultListableBeanFactory implements BeanFactory {
    private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);

    public Object getBean(String name) throws BeansException {
        Object bean = this.singletonObjects.get(name);
        if (bean == null) {
            synchronized (this.singletonObjects) {
                bean = this.singletonObjects.get(name);
                if (bean == null) {
                    bean = createBean(name);
                    this.singletonObjects.put(name, bean);
                }
            }
        }
        return bean;
    }

    private Object createBean(String name) {
        // create Bean instance
    }

    // other methods
}
```

在这个示例中，Spring Framework 使用一个 ConcurrentHashMap 来缓存所有的 Bean 实例，并在需要获取 Bean 实例时使用双重检查锁定机制来确保只有一个线程可以创建实例。

### Hibernate

Hibernate 是一个用于处理关系数据库的开源框架，它使用单例模式来管理 SessionFactory 的实例。SessionFactory 是一个线程安全的类，用于创建和管理 Session 对象。

以下是 Hibernate 的单例模式实现代码：

```java
public class SessionFactory {
    private static final SessionFactory INSTANCE = new SessionFactory();

    private SessionFactory() {
        // private constructor
    }

    public static SessionFactory getInstance() {
        return INSTANCE;
    }

    public Session openSession() {
        // create and return new Session object
    }

    // other methods
}
```

在这个示例中，Hibernate 使用静态变量和静态方法来获取单例实例，并在整个应用程序中共享使用。

### JUnit

JUnit 是一个用于编写单元测试的开源框架，它使用单例模式来管理 TestSuite 的实例。TestSuite 是一个线程安全的类，用于管理测试用例的集合。

以下是 JUnit 的单例模式实现代码：

```java
public class TestSuite {
    private static final TestSuite INSTANCE = new TestSuite();
    private final List<TestCase> testCases = new ArrayList<>();

    private TestSuite() {
        // private constructor
    }

    public static TestSuite getInstance() {
        return INSTANCE;
    }

    public void addTestCase(TestCase testCase) {
        testCases.add(testCase);
    }

    public void run(TestResult result) {
        for (TestCase testCase : testCases) {
            testCase.run(result);
        }
    }

    // other methods
}
```

在这个示例中，JUnit 使用静态变量和静态方法来获取 TestSuite 的单例实例，并在整个测试应用程序中共享使用。



### Apache Commons Lang

Apache Commons Lang 是一个用于提供常用 Java 工具类的开源库，它使用单例模式来管理 CharSet 的实例。CharSet 是一个线程安全的类，用于管理字符集编码。

以下是 Apache Commons Lang 的单例模式实现代码：

```java
public class CharSet {
    private static final Map<String, CharSet> INSTANCES = new ConcurrentHashMap<>();

    private CharSet() {
        // private constructor
    }

    public static CharSet getInstance(String name) {
        CharSet instance = INSTANCES.get(name);
        if (instance == null) {
            synchronized (CharSet.class) {
                instance = INSTANCES.get(name);
                if (instance == null) {
                    instance = new CharSet();
                    INSTANCES.put(name, instance);
                }
            }
        }
        return instance;
    }

    // other methods
}
```

在这个示例中，Apache Commons Lang 使用一个 ConcurrentHashMap 来缓存所有的 CharSet 实例，并在需要获取 CharSet 实例时使用双重检查锁定机制来确保只有一个线程可以创建实例。



### Apache Commons Pool

Apache Commons Pool 是一个用于管理对象池的开源库，它使用单例模式来管理 ObjectPool 的实例。ObjectPool 是一个线程安全的类，用于管理可重用对象的池。

以下是 Apache Commons Pool 的单例模式实现代码：

```java
public class GenericObjectPool<T> implements ObjectPool<T> {
    private static final Map<String, ObjectPool<?>> INSTANCES = new ConcurrentHashMap<>();

    private GenericObjectPool() {
        // private constructor
    }

    public static synchronized <T> ObjectPool<T> getInstance(String name, PooledObjectFactory<T> factory) {
        ObjectPool<?> instance = INSTANCES.get(name);
        if (instance == null) {
            instance = new GenericObjectPool<>(factory);
            INSTANCES.put(name, instance);
        }
        return (ObjectPool<T>) instance;
    }

    // other methods
}
```

在这个示例中，Apache Commons Pool 使用一个 ConcurrentHashMap 来缓存所有的 ObjectPool 实例，并在需要获取 ObjectPool 实例时使用 synchronized 方法来确保只有一个线程可以创建实例。



### Tomcat

Tomcat 是一个用于运行 Java Web 应用程序的开源服务器，它使用单例模式来管理 ServletContext 的实例。ServletContext 是一个线程安全的类，用于管理 Web 应用程序的上下文信息。

以下是 Tomcat 的单例模式实现代码：

```java
public class ApplicationContext extends StandardContext {
    private static final Map<String, ApplicationContext> INSTANCES = new ConcurrentHashMap<>();

    private ApplicationContext() {
        // private constructor
    }

    public static ApplicationContext getInstance(String contextPath) {
        ApplicationContext instance = INSTANCES.get(contextPath);
        if (instance == null) {
            synchronized (ApplicationContext.class) {
                instance = INSTANCES.get(contextPath);
                if (instance == null) {
                    instance = new ApplicationContext();
                    instance.setPath(contextPath);
                    INSTANCES.put(contextPath, instance);
                }
            }
        }
        return instance;
    }

    // other methods
}
```

在这个示例中，Tomcat 使用一个 ConcurrentHashMap 来缓存所有的 ServletContext 实例，并在需要获取 ServletContext 实例时使用双重检查锁定机制来确保只有一个线程可以创建实例。

### OkHttp

OkHttp 是一个用于进行网络请求的开源框架，它使用单例模式来管理 OkHttpClient 的实例。OkHttpClient 是一个线程安全的类，用于管理网络请求的配置和执行。

以下是 OkHttp 的单例模式实现代码：

```java
public class OkHttpClient {
    private static final Map<String, OkHttpClient> INSTANCES = new ConcurrentHashMap<>();

    private OkHttpClient() {
        // private constructor
    }

    public static synchronized OkHttpClient getInstance() {
        String key = "default";
        OkHttpClient instance = INSTANCES.get(key);
        if (instance == null) {
            instance = new OkHttpClient.Builder()
                    .build();
            INSTANCES.put(key, instance);
        }
        return instance;
    }

    // other methods
}
```

在这个示例中，OkHttp 使用一个 ConcurrentHashMap 来缓存所有的 OkHttpClient 实例，并在需要获取 OkHttpClient 实例时使用 synchronized 方法来确保只有一个线程可以创建实例。
