---
title: "《Effective Java 3》笔记14：考虑实现 Comparable 接口"
date: 2023-05-26T09:00:00+08:00
slug: consider-implementing-Comparable
categories: ["Notes"]
tags: [java]
---

本文是 《Effective Java 3》第三章《对象的通用方法》的学习笔记：考虑实现 Comparable 接口。

## 介绍

与本章讨论的其他方法不同，compareTo 方法不是在 Object 中声明的。相反，它是 Comparable 接口中的唯一方法。它在性质上类似于 Object 的 equals 方法，除了简单的相等比较之外，它还允许顺序比较，而且它是通用的。一个类实现 Comparable，表明实例具有自然顺序。对实现 Comparable 的对象数组进行排序非常简单：

```java
Arrays.sort(a);
```



类似地，搜索、计算极值和维护 Comparable 对象的自动排序集合也很容易。例如，下面的程序依赖于 String 实现 Comparable 这一事实，将命令行参数列表按字母顺序打印出来，并消除重复：

```java
public class WordList {
    public static void main(String[] args) {
        Set<String> s = new TreeSet<>();
        Collections.addAll(s, args);
        System.out.println(s);
    }
}
```



通过让类实现 Comparable，就可与依赖于此接口的所有通用算法和集合实现进行互操作。你只需付出一点点努力就能获得强大的功能。实际上，Java 库中的所有值类以及所有枚举类型都实现了 Comparable。如果编写的值类具有明显的自然顺序，如字母顺序、数字顺序或时间顺序，则应实现 Comparable 接口：

```java
public interface Comparable<T> {
    int compareTo(T t);
}
```

compareTo 方法的一般约定类似于 equals 方法：

将一个对象与指定的对象进行顺序比较。当该对象小于、等于或大于指定对象时，对应返回一个负整数、零或正整数。如果指定对象的类型阻止它与该对象进行比较，则抛出 ClassCastException。

在下面的描述中，`sgn(expression)` 表示数学中的符号函数，它被定义为：根据传入表达式的值是负数、零或正数，对应返回 -1、0 或 1。

- 实现者必须确保所有 x 和 y 满足 `sgn(x.compareTo(y)) == -sgn(y.compareTo(x))`（这意味着 `x.compareTo(y)` 当且仅当 `y.compareTo(x)` 抛出异常时才抛出异常）。
- 实现者还必须确保关系是可传递的：`(x.compareTo(y) > 0 && y.compareTo(z) > 0)` 意味着 `x.compareTo(z) > 0`。
- 最后，实现者必须确保 `x.compareTo(y) == 0` 时，所有的 z 满足 `sgn(x.compareTo(z)) == sgn(y.compareTo(z))`。
- 强烈建议 `(x.compareTo(y)== 0) == (x.equals(y))` 成立，但不是必需的。一般来说，任何实现 Comparable 接口并违反此条件的类都应该清楚地注明这一事实。推荐使用的表述是「注意：该类的自然顺序与 equals 不一致。」



不要被这些约定的数学性质所影响。就像 equals 约定一样，这个约定并不像看起来那么复杂。与 equals 方法不同，equals 方法对所有对象都施加了全局等价关系，compareTo 不需要跨越不同类型的对象工作：当遇到不同类型的对象时，compareTo 允许抛出 ClassCastException。通常，它就是这么做的。该约定确实允许类型间比较，这种比较通常在被比较对象实现的接口中定义。



就像违反 hashCode 约定的类可以破坏依赖 hash 的其他类一样，违反 compareTo 约定的类也可以破坏依赖 Comparable 的其他类。依赖 Comparable 的类包括排序集合 TreeSet 和 TreeMap，以及实用工具类 Collections 和 Arrays，它们都包含搜索和排序算法。



让我们看一下 compareTo 约定的细节。第一个规定指出，如果你颠倒两个对象引用之间的比较的方向，就应当发生这样的情况：如果第一个对象小于第二个对象，那么第二个对象必须大于第一个；如果第一个对象等于第二个对象，那么第二个对象一定等于第一个对象；如果第一个对象大于第二个对象，那么第二个对象一定小于第一个对象。第二个规定指出，如果一个对象大于第二个，第二个大于第三个，那么第一个对象一定大于第三个对象。最后一个规定指出，所有 compareTo 结果为相等的对象分别与任何其他对象相比，必须产生相同的结果。



这三种规定的一个结果是，由 compareTo 方法进行的相等性检验必须遵守由 equals 约定进行的相同的限制：反身性、对称性和传递性。因此，同样的警告也适用于此：除非你愿意放弃面向对象的抽象优点，否则无法在保留 compareTo 约定的同时使用新值组件扩展可实例化类。同样的解决方案也适用。如果要向实现 Comparable 的类中添加值组件，不要继承它；编写一个不相关的类，其中包含第一个类的实例。然后提供返回所包含实例的「视图」方法。这使你可以自由地在包含类上实现你喜欢的任何 compareTo 方法，同时允许它的客户端在需要时将包含类的实例视为包含类的实例。



compareTo 约定的最后一段是一个强烈的建议，而不是一个真正的要求，它只是简单地说明了 compareTo 方法所施加的同等性检验通常应该与 equals 方法返回相同的结果。如果遵守了这一规定，则 compareTo 方法所施加的排序与 equals 方法一致。如果违反这条建议，那么它的顺序就与 equals 不一致。如果一个类的 compareTo 方法强加了一个与 equals 不一致的顺序，那么这个类仍然可以工作，但是包含该类元素的有序集合可能无法遵守集合接口（Collection、Set 或 Map）的一般约定。这是因为这些接口的一般约定是根据 equals 方法定义的，但是有序集合使用 compareTo 代替了 equals 实施同等性检验。如果发生这种情况，这不是一场灾难，但这是需要注意的。



例如，考虑 BigDecimal 类，它的 compareTo 方法与 equals 不一致。如果你创建一个空的 HashSet 实例，然后添加 `new BigDecimal("1.0")` 和 `new BigDecimal("1.00")`，那么该 HashSet 将包含两个元素，因为添加到该集合的两个 BigDecimal 实例在使用 equals 方法进行比较时结果是不相等的。但是，如果你使用 TreeSet 而不是 HashSet 执行相同的过程，那么该集合将只包含一个元素，因为使用 compareTo 方法比较两个 BigDecimal 实例时结果是相等的。（有关详细信息，请参阅 BigDecimal 文档。）



编写 compareTo 方法类似于编写 equals 方法，但是有一些关键的区别。因为 Comparable 接口是参数化的，compareTo 方法是静态类型的，所以不需要进行类型检查或强制转换它的参数。如果参数类型错误，则该调用将不能编译。如果参数为 null，则调用应该抛出 NullPointerException，并且在方法尝试访问其成员时抛出该异常。



在 compareTo 方法中，字段是按顺序而不是按同等性来比较的。要比较对象引用字段，要递归调用 compareTo 方法。如果一个字段没有实现 Comparable，或者需要一个非标准的排序，那么应使用 Comparator。可以编写自定义的比较器，或使用现有的比较器，如 CaseInsensitiveString 的 compareTo 方法：

```java
// Single-field Comparable with object reference field
public final class CaseInsensitiveString implements Comparable<CaseInsensitiveString> {
    public int compareTo(CaseInsensitiveString cis) {
        return String.CASE_INSENSITIVE_ORDER.compare(s, cis.s);
    } ... // Remainder omitted
}
```

注意 CaseInsensitiveString 实现了 `Comparable<CaseInsensitiveString>`。这意味着 CaseInsensitiveString 引用只能与另一个 CaseInsensitiveString 引用进行比较。这是在声明实现 Comparable 的类时要遵循的常规模式。



本书的旧版本建议 compareTo 方法使用关系运算符 < 和 > 来比较整数基本类型字段，使用静态方法 `Double.compare` 和 `Float.compare` 来比较浮点基本类型字段。在 Java 7 中，静态比较方法被添加到所有 Java 的包装类中。**在 compareTo 方法中使用关系运算符 < 和 > 冗长且容易出错，因此不再推荐使用。**



如果一个类有多个重要字段，那么比较它们的顺序非常关键。从最重要的字段开始，一步步往下。如果比较的结果不是 0（用 0 表示相等），那么就完成了；直接返回结果。如果最重要的字段是相等的，就比较下一个最重要的字段，以此类推，直到找到一个不相等的字段或比较到最不重要的字段为止。下面是 PhoneNumber 类的 compareTo 方法，演示了这种技术：

```java
// Multiple-field Comparable with primitive fields
public int compareTo(PhoneNumber pn) {
    int result = Short.compare(areaCode, pn.areaCode);
    if (result == 0) {
        result = Short.compare(prefix, pn.prefix);
        if (result == 0)
            result = Short.compare(lineNum, pn.lineNum);
    }
    return result;
}
```

在 Java 8 中，Comparator 接口配备了一组比较器构造方法，可以流畅地构造比较器。然后可以使用这些比较器来实现 Comparator 接口所要求的 compareTo 方法。许多程序员更喜欢这种方法的简明，尽管它存在一些性能成本：在我的机器上，PhoneNumber 实例的数组排序要慢 10% 左右。在使用这种方法时，请考虑使用 Java 的静态导入功能，这样你就可以通过静态比较器构造方法的简单名称来引用它们，以获得清晰和简洁。下面是 PhoneNumber 类的 compareTo 方法改进后的样子：

```java
// Comparable with comparator construction methods
private static final Comparator<PhoneNumber> COMPARATOR = comparingInt((PhoneNumber pn) -> pn.areaCode)
    .thenComparingInt(pn -> pn.prefix)
    .thenComparingInt(pn -> pn.lineNum);

public int compareTo(PhoneNumber pn) {
    return COMPARATOR.compare(this, pn);
}
```

这个实现在类初始化时使用两个比较器构造方法构建一个比较器。第一个是 comparingInt。它是一个静态方法，接受一个 key 提取器函数，该函数将对象引用映射到 int 类型的 key ，并返回一个比较器，比较器根据该 key 对实例进行排序。在上述的示例中，comparingInt 使用 lambda 表达式从 PhoneNumber 中提取 areaCode，并返回 `Comparator<PhoneNumber>`，按区号来排序电话号码。注意，lambda 表达式显式地指定其输入参数的类型为 PhoneNumber。事实证明，在这种情况下，Java 的类型推断并没有强大到足以自己判断类型，因此我们不得不帮助它来编译程序。



如果两个电话号码有相同的区号，我们需要进一步改进比较，这正是第二个 comparator 构造方法 thenComparingInt 所做的。它是 Comparator 上的一个实例方法，它接受一个 int 类型的 key 提取函数，并返回一个比较器，该比较器首先应用原始比较器，然后使用提取的 key 来断开连接。你可以任意堆叠对 thenComparingInt 的调用，从而形成字典顺序。在上面的例子中，我们将两个对 thenComparingInt 的调用叠加起来，得到一个排序，它的第二个 key 是 prefix，而第三个 key 是 lineNum。注意，我们不必指定传递给两个调用 thenComparingInt 的 key 提取器函数的参数类型：Java 的类型推断足够智能，可以自行解决这个问题。



Comparator 类具有完整的构造方法。对于 long 和 double 的基本类型，有类似 comparingInt 和 thenComparingInt 的方法。int 版本还可以用于范围更小的整数类型，如 PhoneNumber 示例中的 short。double 版本也可以用于 float。Comparator 类提供的构造方法覆盖了所有 Java 数值基本类型。



也有对象引用类型的比较器构造方法。静态方法名为 compare，它有两个重载。一个是使用 key 提取器并使用 key 的自然顺序。第二种方法同时使用 key 提取器和比较器对提取的 key 进行比较。实例方法有三种重载，称为 thenComparing。一个重载只需要一个比较器并使用它来提供一个二级顺序。第二个重载只接受一个 key 提取器，并将 key 的自然顺序用作二级顺序。最后的重载需要一个 key 提取器和一个比较器来对提取的 key 进行比较。



有时候，你可能会看到 compareTo 或 compare 方法，它们依赖于以下事实：如果第一个值小于第二个值，则两个值之间的差为负；如果两个值相等，则为零；如果第一个值大于零，则为正。下面是一个例子：

```java
// BROKEN difference-based comparator - violates transitivity!
static Comparator<Object> hashCodeOrder = new Comparator<>() {
    public int compare(Object o1, Object o2) {
        return o1.hashCode() - o2.hashCode();
    }
};
```



不要使用这种技术。它充满了来自整数溢出和 IEEE 754 浮点运算构件的危险 [JLS 15.20.1, 15.21.1]。此外，生成的方法不太可能比使用本项目中描述的技术编写的方法快得多。应使用静态比较方法：

```java
// Comparator based on static compare method
static Comparator<Object> hashCodeOrder = new Comparator<>() {
    public int compare(Object o1, Object o2) {
        return Integer.compare(o1.hashCode(), o2.hashCode());
    }
};
```

或比较器构造方法：

```java
// Comparator based on Comparator construction method
static Comparator<Object> hashCodeOrder = Comparator
    .comparingInt(o -> o.hashCode());
```



总之，无论何时实现具有排序性质的值类，都应该让类实现 Comparable 接口，这样就可以轻松地对实例进行排序、搜索，并与依赖于此接口的集合实现进行互操作。在 compareTo 方法的实现中比较字段值时，避免使用 < 和 > 操作符，应使用包装类中的静态比较方法或 Comparator 接口中的 comparator 构造方法。



## 总结

建议在实现比较功能时，应该考虑实现 `Comparable` 接口。`Comparable` 接口是一个泛型接口，其中只包含一个方法 `compareTo(T o)`，用于比较当前对象和另一个对象的大小关系。实现 `Comparable` 接口可以使得一个类具有可比性，从而可以进行排序等操作。

以下是在实现 `Comparable` 接口时需要注意的一些问题：

1. 首先，需要确保类实现了 `Comparable` 接口，并实现了 `compareTo` 方法。在实现 `compareTo` 方法时，需要考虑到对象的比较顺序，并返回一个整数值表示两个对象之间的大小关系。
2. 在实现 `compareTo` 方法时，需要确保比较结果的一致性、对称性和传递性。具体来说，如果 `a.compareTo(b)` 返回正整数，那么 `b.compareTo(a)` 应该返回负整数；如果 `a.compareTo(b)` 和 `b.compareTo(c)` 的返回值都是正整数，那么 `a.compareTo(c)` 的返回值也应该是正整数。
3. 如果一个类有多个可以比较的属性，那么在实现 `compareTo` 方法时需要按照比较的优先级进行比较。通常，可以先比较第一个属性，如果相等再比较第二个属性，以此类推。
4. 如果一个类实现了 `Comparable` 接口，那么通常也应该同时实现 `equals` 和 `hashCode` 方法。在实现 `equals` 方法时，需要考虑到比较的对象是否为 null、对象类型是否相同等因素。在实现 `hashCode` 方法时，通常需要使用类中可比较属性的哈希值，以确保哈希表等数据结构能够正确地处理该类的对象。
5. 如果一个类需要支持多种比较方式，那么可以考虑使用策略模式或者比较器（Comparator）接口来实现。使用比较器接口可以在运行时动态地指定比较方式，从而更加灵活。

实现 `Comparable` 接口的示例代码：

```java
public class Person implements Comparable<Person> {
    private String name;
    private int age;

    public Person(String name,int age) {
        this.name = name;
        this.age = age;
    }

    // 实现 compareTo 方法，按照年龄升序排序
    @Override
    public int compareTo(Person o) {
        return Integer.compare(this.age, o.age);
    }

    // 实现 equals 方法和 hashCode 方法
    @Override
    public boolean equals(Object obj) {
        if (obj == this) {
            return true;
        }
        if (!(obj instanceof Person)) {
            return false;
        }
        Person other = (Person) obj;
        return Objects.equals(this.name, other.name) &&
                this.age == other.age;
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.name, this.age);
    }
}
```

在上面的示例代码中，`Person` 类实现了 `Comparable` 接口，并实现了 `compareTo` 方法。在该方法中，我们按照对象的年龄升序排序。为了确保 `equals` 方法和 `hashCode` 方法的正确性，我们也实现了这两个方法，以确保 `Person` 对象在使用哈希表等数据结构时能够正常工作。
