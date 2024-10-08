---
title: "《Effective Java 3》笔记6：避免创建不必要的对象"
date: 2023-04-24
slug: avoid-creating-unnecessary-objects
categories: ["Java"]
tags: [java]
---

本文是 《Effective Java 3》第二章的学习笔记：避免创建不必要的对象。

## 介绍

创建对象时，经常会复用对象。如果对象是不可变的，那么它总是可以被复用的。

下面一个例子：

```java
String s = new String("bikini"); // DON'T DO THIS!
```

该语句每次执行时都会创建一个新的 String 实例，而这些对象创建都不是必需的。String 构造函数的参数 `("bikini")` 本身就是一个 String 实例，在功能上与构造函数创建的所有对象相同。如果这种用法发生在循环或频繁调用的方法中，创建大量 String 实例是不必要的。

改进后的版本如下：

```java
String s = "bikini";
```

这个版本使用单个 String 实例，而不是每次执行时都创建一个新的实例。此外，可以保证在同一虚拟机中运行的其他代码都可以复用该对象，只要恰好包含相同的字符串字面量。

通常可以通过使用静态工厂方法来避免创建不必要的对象，而不是在提供这两种方法的不可变类上使用构造函数。例如，工厂方法 `Boolean.valueOf(String)` 比构造函数 ~~Boolean(String)~~ 更可取，后者在 Java 9 中被弃用了。构造函数每次调用时都必须创建一个新对象，而工厂方法从来不需要这样做，在实际应用中也不会这样做。除了复用不可变对象之外，如果知道可变对象不会被修改，也可以复用它们。

有些对象的创建的代价相比而言要昂贵得多。如果你需要重复地使用这样一个「昂贵的对象」，那么最好将其缓存以供复用。

下面是使用正则表达式最简单的方法：

```java
// Performance can be greatly improved!
static boolean isRomanNumeral(String s) {
    return s.matches("^(?=.)M*(C[MD]|D?C{0,3})" + "(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$");
}
```

这个实现的问题是它依赖于 `String.matches` 方法。**虽然 String.matches 是检查字符串是否与正则表达式匹配的最简单方法，但它不适合在性能关键的情况下重复使用。** 问题在于，它在内部为正则表达式创建了一个 Pattern 实例，并且只使用一次，之后就进行垃圾收集了。创建一个 Pattern 实例是很昂贵的，因为它需要将正则表达式编译成有限的状态机。

为了提高性能，将正则表达式显式编译为 Pattern 实例（它是不可变的），作为类初始化的一部分，缓存它，并在每次调用 isRomanNumeral 方法时复用同一个实例：

```java
// Reusing expensive object for improved performance
public class RomanNumerals {
    private static final Pattern ROMAN = Pattern.compile("^(?=.)M*(C[MD]|D?C{0,3})" + "(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})$");
    static boolean isRomanNumeral(String s) {
        return ROMAN.matcher(s).matches();
    }
}
```

如果频繁调用 isRomanNumeral，改进版本将提供显著的性能提升。不仅性能得到了改善，清晰度也得到了提高。为不可见的 Pattern 实例创建一个静态终态字段允许我们为它命名，这比正则表达式本身更容易阅读。

如果加载包含改进版 isRomanNumeral 方法的类时，该方法从未被调用过，那么初始化字段 ROMAN 是不必要的。因此，可以用延迟初始化字段的方式在第一次调用 isRomanNumeral 方法时才初始化字段，而不是在类加载时初始化，**但不建议这样做**。通常情况下，**延迟初始化会使实现复杂化，而没有明显的性能改善**。

当一个对象是不可变的，很明显，它可以安全地复用，但在其他情况下，它远不那么明显，甚至违反直觉。考虑适配器的情况，也称为视图。适配器是委托给支持对象的对象，提供了一个替代接口。因为适配器的状态不超过其支持对象的状态，所以不需要为给定对象创建一个给定适配器的多个实例。

例如，Map 接口的 keySet 方法返回 Map 对象的 Set 视图，其中包含 Map 中的所有键。事实上，返回的 Set 实例通常是可变的，但所有返回的对象在功能上都是相同的，因为它们都由相同的 Map 实例支持。因此，对给定 Map 对象上的 keySet 的每次调用都可能返回相同的 Set 实例。

由于返回的 Set 实例在功能上是相同的，因此创建 keySet 视图对象的多个实例是不必要的，也没有好处。因此，在使用 keySet 视图的时候，我们应该尽可能地重用同一个 Set 实例，而不是每次调用 keySet 方法都创建一个新的 Set 实例。

以下是一个示例，展示了如何重用 keySet 视图的 Set 实例：

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class TestKeySetReuse {
    private static final Map<Integer, String> map = new HashMap<>();

    public static void main(String[] args) {
        map.put(1, "one");
        map.put(2, "two");
        map.put(3, "three");

        Set<Integer> keySet1 = map.keySet();
        Set<Integer> keySet2 = map.keySet();

        System.out.println(keySet1 == keySet2); // true，说明是同一个实例

        keySet1.remove(1);
        System.out.println(map); // {2=two, 3=three}
        System.out.println(keySet2); // [2, 3]
    }
}
```

在这个示例中，我们首先创建了一个 HashMap 对象，并向其中添加了一些键值对。然后，我们两次调用 keySet 方法，分别将返回的 Set 实例保存到 keySet1 和 keySet2 变量中。

由于 keySet1 和 keySet2 是由相同的 Map 实例支持的，因此它们是相等的，即 `keySet1 == keySet2` 返回 true。我们可以看到，实际上它们是同一个 Set 实例。

然后，我们从 keySet1 中删除一个键，并打印出 Map 和 keySet2 的内容。我们可以看到，当我们修改了 keySet1 中的内容时，keySet2 也被修改了，因为它们是同一个 Set 实例。

因此，在使用 Map 的 keySet 方法时，应该尽可能地重用同一个 Set 实例，以避免不必要的对象创建和不必要的行为。

另一种创建不必要对象的方法是自动装箱，它允许程序员混合基本类型和包装类型，根据需要自动装箱和拆箱。**自动装箱模糊了基本类型和包装类型之间的区别，** 两者有细微的语义差别和不明显的性能差别。

```java
// Hideously slow! Can you spot the object creation?
private static long sum() {
    Long sum = 0L;
    for (long i = 0; i <= Integer.MAX_VALUE; i++)
        sum += i;
    return sum;
}
```

这个程序得到了正确的答案，但是由于一个字符的印刷错误，它的速度比实际要慢得多。变量 sum 被声明为 Long 而不是 long，这意味着程序将构造大约 231 个不必要的 Long 实例（大约每次将 Long i 添加到 Long sum 时都有一个实例）。将 sum 的声明从 Long 更改为 long，机器上的运行时间将从 6.3 秒减少到 0.59 秒。教训很清楚：**基本类型优于包装类，还应提防意外的自动装箱。**

本条目不应该被曲解为是在暗示创建对象是成本昂贵的，应该避免。相反，创建和回收这些小对象的构造函数成本是很低廉的，尤其是在现代 JVM 实现上。**创建额外的对象来增强程序的清晰性、简单性或功能通常是件好事。**

相反，通过维护自己的对象池来避免创建对象不是一个好主意，除非池中的对象非常重量级。证明对象池是合理的对象的典型例子是数据库连接。建立连接的成本非常高，因此复用这些对象是有意义的。然而，一般来说，维护自己的对象池会使代码混乱，增加内存占用，并损害性能。现代 JVM 实现具有高度优化的垃圾收集器，在轻量级对象上很容易胜过这样的对象池。

## 总结

1. 避免创建不必要的对象可以提高性能和减少内存占用。

   ```java
   // 不推荐的写法，会创建不必要的对象
   Integer sum = 0;
   for (int i = 0; i < 1000000; i++) {
       sum += i;
   }

   // 推荐的写法，使用基本类型
   int sum = 0;
   for (int i = 0; i < 1000000; i++) {
       sum += i;
   }
   ```

2. 如果一个对象是不可变的，可以将其缓存起来并重复使用，而不是每次需要时都创建一个新对象。

   以下是一些常见的不可变对象和它们的缓存实现：

   - **字符串常量池**

   Java 语言中的字符串是不可变的，因此字符串常量可以被缓存起来并重复使用。Java 虚拟机维护了一个字符串常量池，它缓存了所有的字符串常量，并确保相同的字符串只被创建一次。

   ```java
   String s1 = "Hello"; // 从字符串常量池中获取
   String s2 = "Hello"; // 从字符串常量池中获取
   String s3 = new String("Hello"); // 创建新的字符串对象
   System.out.println(s1 == s2); // true
   System.out.println(s1 == s3); // false
   ```

   - **数字常量池**

   Java 语言中的整数、浮点数和字符等基本数据类型的值也可以被缓存起来并重复使用。Java 虚拟机维护了一个数字常量池，它缓存了一定范围内的整数、浮点数和字符等基本数据类型的值，并确保相同的值只被创建一次。

   ```java
   Integer i1 = 100; // 从数字常量池中获取
   Integer i2 = 100; // 从数字常量池中获取
   Integer i3 = new Integer(100); // 创建新的 Integer 对象
   System.out.println(i1 == i2); // true
   System.out.println(i1 == i3); // false
   ```

   注意：数字常量池的范围可以通过 JVM 参数 `-XX:AutoBoxCacheMax=<size>` 来调整，其中 `<size>` 是常量池的大小。

   - **枚举常量**

   Java 语言中的枚举常量是不可变的，它们在枚举类型被加载时就被创建并缓存起来，而不是每次需要时都创建一个新对象。

   ```java
   enum Color { RED, GREEN, BLUE };
   Color c1 = Color.RED; // 获取枚举常量 RED
   Color c2 = Color.GREEN; // 获取枚举常量 GREEN
   Color c3 = new Color("YELLOW"); // 创建新的枚举常量
   System.out.println(c1 == c2); // false
   System.out.println(c1 == Color.RED); // true
   ```

   - **LocalDate、LocalTime、LocalDateTime**

   Java 8 引入的日期时间 API 中的 LocalDate、LocalTime、LocalDateTime 类型都是不可变的。这些类型的对象可以被缓存起来并重复使用，以提高程序的性能。

   ```java
   LocalDate today = LocalDate.now(); // 获取当前日期
   LocalDate tomorrow = today.plusDays(1); // 计算明天的日期
   LocalDate yesterday = today.minusDays(1); // 计算昨天的日期
   ```

   可以使用线程安全的 ConcurrentHashMap 来实现 LocalDate 的缓存：

   ```java
   ConcurrentHashMap<String, LocalDate> cache = new ConcurrentHashMap<>();
   LocalDate date = cache.computeIfAbsent("2023-04-24", LocalDate::parse);
   ```

   - **BigDecimal**

   Java 中的 BigDecimal 类型也是不可变的，它们的值在创建后不会改变。因此，可以将 BigDecimal 对象缓存起来并重复使用，以避免不必要的对象创建。

   ```java
   BigDecimal zero = BigDecimal.ZERO; // 缓存 0
   BigDecimal one = BigDecimal.ONE; // 缓存 1
   BigDecimal ten = BigDecimal.TEN; // 缓存 10
   ```

   可以使用静态 final 常量来实现 BigDecimal 的缓存：

   ```java
   public class Constants {
       public static final BigDecimal ZERO = BigDecimal.ZERO;
       public static final BigDecimal ONE = BigDecimal.ONE;
       public static final BigDecimal TEN = BigDecimal.TEN;
   }
   ```

   - **Immutable Collections**

   Guava 和 Java 9+ 中都提供了不可变集合类，如 ImmutableList、ImmutableSet、ImmutableMap 等。这些不可变集合类的对象是不可变的，因此可以被缓存起来并重复使用。

   ```java
   ImmutableList<String> list = ImmutableList.of("a", "b", "c"); // 创建不可变列表
   ImmutableSet<Integer> set = ImmutableSet.of(1, 2, 3); // 创建不可变集合
   ImmutableMap<String, Integer> map = ImmutableMap.of("a", 1, "b", 2, "c", 3); // 创建不可变映射
   ```

   可以使用静态 final 常量来实现不可变集合的缓存：

   ```java
   public class Constants {
       public static final ImmutableList<String> LIST = ImmutableList.of("a", "b", "c");
       public static final ImmutableSet<Integer> SET = ImmutableSet.of(1, 2, 3);
       public static final ImmutableMap<String, Integer> MAP = ImmutableMap.of("a", 1, "b", 2, "c", 3);
   }
   ```

3. 避免使用装箱类型，如 Integer、Boolean 等，因为它们在自动装箱和拆箱时会创建不必要的对象。可以使用基本类型和对象包装类型之间的相互转换方法来避免这种情况。

4. 对于大量的短字符串，可以考虑使用字符串池或者使用 String.intern() 方法，以避免创建大量的 String 对象。

   ```java
   // 不推荐的写法，会创建大量的 String 对象
   String str = "";
   for (int i = 0; i < 1000000; i++) {
       str += "a";
   }

   // 推荐的写法，使用 StringBuilder 和字符串池
   StringBuilder sb = new StringBuilder();
   for (int i = 0; i < 1000000; i++) {
       sb.append("a");
   }
   String str = sb.toString().intern();
   ```

   > **String.intern() 方法**
   >
   > String.intern() 方法是一个 native 方法，它的作用是返回字符串对象的规范化表示形式，即返回字符串常量池中与该字符串相等的对象的引用（如果常量池中已经存在该字符串，则直接返回常量池中的对象；否则，将该字符串添加到常量池中，并返回该字符串的引用）。
   >
   > 例如，假设我们有如下代码：
   >
   > ```java
   > String s1 = "hello";
   > String s2 = new String("hello");
   > String s3 = s2.intern();
   > ```
   >
   > 在这个代码中，我们首先创建了一个字符串对象 s1，它是字符串常量池中的一个对象。然后，我们通过 new 关键字创建了一个新的字符串对象 s2，它与 s1 的内容相同，但是它在堆内存中创建。接下来，我们调用 s2 的 intern() 方法，将 s2 放入字符串常量池中，并返回常量池中的对象引用。因此，s3 指向的是字符串常量池中的对象。
   >
   > 需要注意的是，由于字符串常量池中的字符串对象是唯一的，因此使用 intern() 方法可以节省内存空间。但是，由于字符串常量池的空间是有限的，如果程序中大量使用 intern() 方法，可能会导致常量池溢出的问题。因此，如果不是必须使用 intern() 方法，最好不要使用它。
   >
   > 另外，**由于 intern() 方法是一个 native 方法，它的性能可能会比较低。在实际开发中，应该根据具体情况进行选择，避免滥用 intern() 方法**。

5. 尽量使用静态工厂方法而不是构造方法创建对象，因为静态工厂方法可以重复使用已经创建的对象，从而避免创建不必要的对象。

   ```java
   // 不推荐的写法，每次都创建一个新的对象
   Date now = new Date();

   // 推荐的写法，使用静态工厂方法
   Date now = Date.from(Instant.now());
   ```

6. 避免创建不必要的数组，可以使用 List、Set、Map 等集合类型来代替数组。

   ```java
   // 不推荐的写法，会创建不必要的数组对象
   String[] arr = new String[]{"a", "b", "c"};

   // 推荐的写法，使用 List
   List<String> list = Arrays.asList("a", "b", "c");
   ```

7. 如果必须创建不可变的数组，可以使用静态工厂方法 Arrays.asList() 来创建 List，从而避免创建额外的数组对象。

   ```java
   // 不推荐的写法，会创建不必要的数组对象
   String[] arr = new String[]{"a", "b", "c"};
   List<String> list = new ArrayList<>(Arrays.asList(arr));

   // 推荐的写法，使用 Arrays.asList()
   List<String> list = Arrays.asList("a", "b", "c");
   ```

8. 避免创建过多的临时对象，如在循环中创建的对象。可以重复使用已经创建的对象，或者使用可重用的对象池来减少对象的创建和垃圾回收。

   ```java
   // 不推荐的写法，会创建不必要的对象
   List<String> list = new ArrayList<>();
   for (int i = 0; i < 10000; i++) {
       list.add(String.valueOf(i));
   }

   // 推荐的写法，使用可重用的对象池
   List<String> list = new ArrayList<>();
   StringBuffer sb = new StringBuffer();
   for (int i = 0; i < 10000; i++) {
       sb.setLength(0);
       sb.append(i);
       list.add(sb.toString());
   }
   ```

9. 避免在类的构造方法中创建大量的对象。如果在构造方法中创建大量的对象，会导致内存占用过大，从而影响程序的性能。可以将对象的创建放在需要使用的方法中，或者使用懒加载的方式来延迟对象的创建。

   ```java
   // 不推荐的写法，会在构造方法中创建大量的对象
   public class MyClass {
       private List<String> list = new ArrayList<>();

       public MyClass() {
           for (int i = 0; i < 10000; i++) {
               list.add(String.valueOf(i));
           }
       }
   }

   // 推荐的写法，将对象的创建放在需要使用的方法中
   public class MyClass {
       private List<String> list;

       public MyClass() {}

       public List<String> getList() {
           if (list == null) {
               list = new ArrayList<>();
               for (int i = 0; i < 10000; i++) {
                   list.add(String.valueOf(i));
               }
           }
           return list;
       }
   }
   ```

10. 避免在递归方法中创建不必要的对象。如果在递归方法中创建不必要的对象，会导致内存占用过大，从而导致栈溢出等问题。可以使用可重用的对象池来减少对象的创建和垃圾回收。

    ```java
    // 不推荐的写法，会在递归方法中创建不必要的对象
    public static int fibonacci(int n) {
        if (n <= 1) {
            return n;
        }
        return fibonacci(n - 1) + fibonacci(n - 2);
    }

    // 推荐的写法，使用可重用的对象池
    public static int fibonacci(int n, Map<Integer, Integer> cache) {
        if (n <= 1) {
            return n;
        }
        if (cache.containsKey(n)) {
            return cache.get(n);
        }
        int result = fibonacci(n - 1, cache) + fibonacci(n - 2, cache);
        cache.put(n, result);
        return result;
    }
    ```

## 适配器模式

适配器模式是一种常见的设计模式，它可以帮助我们将一个对象的接口适配成另一个对象的接口。适配器模式通常用于以下情况：

1. 当我们需要使用一个已有的类，但是它的接口与我们期望的不兼容时，我们可以使用适配器模式来将其接口适配成我们需要的接口。
2. 当我们需要使用多个不兼容的类时，我们可以使用适配器模式来将它们的接口适配成一个统一的接口。

在适配器模式中，适配器对象通常是不可变的，因为它们的状态不超过支持对象的状态。因此，可以安全地复用适配器对象。

例如，考虑一个支持英国插头的设备，但我们需要将其插入到一个美国插座上。我们可以使用一个适配器来适配英国插头到美国插座。适配器的状态不超过英国插头的状态，因此可以安全地复用适配器对象，而不必为每个设备创建一个新的适配器对象。

以下是一个简单的适配器示例：

```java
// 支持英国插头的设备
public class BritishDevice {
    public void plugIn() {
        System.out.println("Plugged in British device");
    }
}

// 美国插座接口
public interface USPlug {
    void plug();
}

// 英国到美国的适配器
public class BritishToUSAdapter implements USPlug {
    private final BritishDevice device;

    public BritishToUSAdapter(BritishDevice device) {
        this.device = device;
    }

    @Override
    public void plug() {
        device.plugIn();
    }
}

// 美国插座
public class USOutlet {
    public void plugIn(USPlug plug) {
        plug.plug();
    }
}

// 测试适配器
public class TestAdapter {
    public static void main(String[] args) {
        BritishDevice device = new BritishDevice();
        BritishToUSAdapter adapter = new BritishToUSAdapter(device);
        USOutlet outlet = new USOutlet();
        outlet.plugIn(adapter);
    }
}
```

在这个示例中，我们定义了一个 BritishDevice 类来模拟一个支持英国插头的设备。我们还定义了一个 USPlug 接口来表示一个美国插头，以及一个 USOutlet 类来表示一个美国插座。

我们使用一个适配器类 BritishToUSAdapter 来适配 BritishDevice 到 USPlug 接口。适配器类的构造函数接收一个 BritishDevice 对象，并将其保存在一个成员变量中。适配器实现了 USPlug 接口，并将 plug 方法委托给 BritishDevice 对象的 plugIn 方法。

在测试适配器时，我们创建了一个 BritishDevice 对象和一个适配器对象，并将适配器对象传递给 USOutlet 的 plugIn 方法。USOutlet 对象使用适配器对象来将 BritishDevice 对象适配到 USPlug 接口，从而将其插入到美国插座中。

在这个示例中，**适配器对象是不可变的，因为它的状态不超过支持对象的状态。因此，我们可以安全地复用适配器对象，而不必为每个设备创建一个新的适配器对象。**

## 扩展

### Java 8 的 Stream API 避免创建不必要对象

下面这段代码：

```java
long sum = categoryStatistics.getData().stream().mapToLong(t -> t.getValue()).sum();
```

在使用 `list.stream().mapToLong(t -> t.getValue()).sum()` 对集合中的元素进行求和时，确实可以通过这种方式来避免创建不必要的对象。

具体来说，`mapToLong()` 方法会将集合中的元素映射为一个 LongStream 对象，而 LongStream 对象是一个`原始类型流`，它在内存中的占用空间比较小。因此，使用 `mapToLong() `方法可以避免创建不必要的对象，从而提高程序的性能。

另外，sum() 方法是一个终端操作，它会对流中的所有元素进行求和，并返回最终的结果。由于 sum() 方法是一个终端操作，它会直接对流中的元素进行求和，而不会创建新的对象。因此，使用 sum() 方法可以进一步避免创建不必要的对象，从而提高程序的性能。

> 在大多数情况下，`list.stream().mapToLong(t -> t.getValue()).sum()` 的性能会比 `list.stream().mapToLong(t -> t.getValue()).reduce(0L, (a, b) -> a + b)` 更好。
>
> 原因是，`sum()` 方法是一个终端操作，它会对流中的所有元素进行求和，并返回最终的结果。**`sum()` 方法底层使用了一些优化技术，例如使用循环展开、使用 SIMD 指令等，从而充分利用 CPU 的性能优势，提高计算速度**。
>
> 相比之下，`reduce()` 方法是一个归约操作，它将对流中的元素进行累计计算，并返回最终的结果。由于 `reduce() `方法需要对元素进行二元操作，因此它比 `sum()` 方法更加复杂，可能会带来一些额外的开销。此外，`reduce()` 方法还需要指定一个初始值，如果初始值不当，可能会导致结果错误或者性能下降。
>
> 不过，对于某些特殊情况，`reduce()` 方法可能会比 `sum()` 方法更加适用。例如，如果我们需要对流中的元素进行自定义的累计计算，就需要使用 `reduce() `方法。此外，`reduce()`方法还支持并行计算，可以充分利用多核处理器的性能优势，提高计算速度。
>
> 综上所述，我们应该根据具体情况选择使用 `sum()` 方法还是 `reduce()` 方法。**对于大多数情况下的求和操作，`sum()` 方法是一个更好的选择，因为它比` reduce()` 方法更加高效。但是，在某些特殊情况下，`reduce()` 方法可能会更加适用**。

以上。
