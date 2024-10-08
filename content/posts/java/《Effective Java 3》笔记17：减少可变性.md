---
title: "《Effective Java 3》笔记17：减少可变性"
date: 2023-08-14
slug: minimize-mutability
categories: ["Java"]
tags: [java]
---

本文是 《Effective Java 3》第四章《类和接口》的学习笔记：减少可变性。

## 原文

不可变类是实例不能被修改的类。每个实例中包含的所有信息在对象的生命周期内都是固定的，因此永远不会观察到任何更改。Java 库包含许多不可变的类，包括 String、基本类型的包装类、BigInteger 和 BigDecimal。这么做有很好的理由：不可变类比可变类更容易设计、实现和使用。它们不太容易出错，而且更安全。

要使类不可变，请遵循以下 5 条规则：

- 1、**不要提供修改对象状态的方法**（这类方法也被称为修改器）

- 2、**确保类不能被继承。** 这可以防止粗心或恶意的通过子类实例对象状态可改变的方式，损害父类的不可变行为。防止子类化通常用 final 修饰父类，但是还有一种替代方法，我们将在后面讨论。

- 3、**所有字段用 final 修饰。** 这清楚地表达了意图，并由系统强制执行。同样，如果在没有同步的情况下，引用新创建的实例并从一个线程传递到另一个线程，那么就有必要确保正确的行为，就像内存模型中描述的那样。

- 4、**所有字段设为私有。** 这将阻止客户端访问字段引用的可变对象并直接修改这些对象。虽然在技术上允许不可变类拥有包含基本类型或对不可变对象的引用的公共 final 字段，但不建议这样做，因为在以后的版本中无法更改内部表示。

- 5、**确保对任何可变组件的独占访问。** 如果你的类有任何引用可变对象的字段，请确保该类的客户端无法获得对这些对象的引用。永远不要向提供对象引用的客户端初始化这样的字段，也不要从访问器返回字段。在构造函数、访问器和 readObject 方法中创建防御性副本。

前面条目中的许多示例类都是不可变的。其中一个类是 PhoneNumber，它的每个属性都有访问器，但没有对应的修改器。下面是一个稍微复杂的例子：

```java
// Immutable complex number class
public final class Complex {
    private final double re;
    private final double im;

    public Complex(double re, double im) {
        this.re = re;
        this.im = im;
    }
    public double realPart() { return re; }
    public double imaginaryPart() { return im; }
    public Complex plus(Complex c) {
        return new Complex(re + c.re, im + c.im);
    }
    public Complex minus(Complex c) {
        return new Complex(re - c.re, im - c.im);
    }
    public Complex times(Complex c) {
        return new Complex(re * c.re - im * c.im, re * c.im + im * c.re);
    }
    public Complex dividedBy(Complex c) {
        double tmp = c.re * c.re + c.im * c.im;
        return new Complex((re * c.re + im * c.im) / tmp, (im * c.re - re * c.im) / tmp);
    }

    @Override public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof Complex))
            return false;
        Complex c = (Complex) o;

        // See page 47 to find out why we use compare instead of ==
        return Double.compare(c.re, re) == 0 && Double.compare(c.im, im) == 0;
    }

    @Override public int hashCode() {
        return 31 * Double.hashCode(re) + Double.hashCode(im);
    }

    @Override public String toString() {
        return "(" + re + " + " + im + "i)";
    }
}
```

这个类表示一个复数（包含实部和虚部的数）。除了标准的 Object 方法之外，它还为实部和虚部提供访问器，并提供四种基本的算术运算：加法、减法、乘法和除法。值得注意的是，算术操作创建和返回一个新的 Complex 实例，而不是修改这个实例。这种模式称为函数式方法，因为方法返回的结果是将函数应用到其操作数，而不是修改它。将其与过程式或命令式方法进行对比，在这种方法中，方法将一个计算过程应用于它们的操作数，从而导致其状态发生变化。注意，方法名是介词（如 plus)，而不是动词（如 add)。这强调了这样一个事实，即方法不会改变对象的值。BigInteger 和 BigDecimal 类不遵守这种命名约定，这导致了许多使用错误。

如果不熟悉函数式方法，那么它可能看起来不自然，但它实现了不变性，这么做有很多优势。 **不可变对象很简单。** 不可变对象可以保持它被创建时的状态。如果能够确保所有构造函数都建立了类不变量，那么就可以保证这些不变量将一直保持，而无需你或使用类的程序员做进一步的工作。另一方面，可变对象可以具有任意复杂的状态空间。如果文档没有提供由修改器方法执行的状态转换的精确描述，那么就很难或不可能可靠地使用可变类。

**不可变对象本质上是线程安全的；它们不需要同步。** 它们不会因为多线程并发访问而损坏。这无疑是实现线程安全的最简单方法。由于任何线程都无法观察到另一个线程对不可变对象的任何影响，因此 **可以自由共享不可变对象。** 同时，不可变类应该鼓励客户端尽可能复用现有的实例。一种简单的方法是为常用值提供公共静态 final 常量。例如，Complex 类可能提供以下常量：

```java
public static final Complex ZERO = new Complex(0, 0);
public static final Complex ONE = new Complex(1, 0);
public static final Complex I = new Complex(0, 1);
```

这种方法可以更进一步。不可变类可以提供静态工厂，这些工厂缓存经常请求的实例，以避免在现有实例可用时创建新实例。所有包装类和 BigInteger 都是这样做的。使用这种静态工厂会导致客户端共享实例而不是创建新实例，从而减少内存占用和垃圾收集成本。在设计新类时，选择静态工厂而不是公共构造函数，这将使你能够灵活地在以后添加缓存，而无需修改客户端。

不可变对象可以自由共享这一事实的结果之一是，你永远不需要对它们进行防御性的复制。事实上，你根本不需要做任何拷贝，因为拷贝将永远等同于原件。因此，你不需要也不应该在不可变类上提供克隆方法或复制构造函数。这在 Java 平台的早期并没有得到很好的理解，因此 String 类确实有一个复制构造函数，但是，即使有，也应该少用。

**你不仅可以共享不可变对象，而且可以共享它们的内部实现。** 例如，BigInteger 类在内部使用符号大小来表示。符号由 int 表示，大小由 int 数组表示。negate 方法产生一个新的 BigInteger，大小相同，符号相反。即使数组是可变的，也不需要复制；新创建的 BigInteger 指向与原始数组相同的内部数组。

**不可变对象可以很好的作为其他对象的构建模块，** 无论是可变的还是不可变的。如果知道复杂对象的组件对象不会在其内部发生更改，那么维护复杂对象的不变性就会容易得多。这个原则的一个具体的例子是，不可变对象很合适作为 Map 的键和 Set 的元素：你不必担心它们的值在 Map 或 Set 中发生变化，从而破坏 Map 或 Set 的不变性。

**不可变对象自带提供故障原子性**。他们的状态从未改变，所以不可能出现暂时的不一致。

**不可变类的主要缺点是每个不同的值都需要一个单独的对象。** 创建这些对象的成本可能很高，尤其是对象很大的时候。例如，假设你有一个百万位的 BigInteger，你想改变它的低阶位：

```java
BigInteger moby = ...;
moby = moby.flipBit(0);
```

flipBit 方法创建了一个新的 BigInteger 实例，也有百万位长，只在一个比特上与原始的不同。该操作需要与 BigInteger 的大小成比例的时间和空间。与 `java.util.BitSet` 形成对比。与 BigInteger 一样，BitSet 表示任意长的位序列，但与 BigInteger 不同，BitSet 是可变的。BitSet 类提供了一种方法，可以让你在固定的时间内改变百万位实例的单个位的状态：

```java
BitSet moby = ...;
moby.flip(0);
```

如果执行多步操作，在每一步生成一个新对象，最终丢弃除最终结果之外的所有对象，那么性能问题就会被放大。有两种方法可以解决这个问题。第一种方法是猜测通常需要哪些多步操作，并将它们作为基本数据类型提供。如果将多步操作作为基本数据类型提供，则不可变类不必在每个步骤中创建单独的对象。在内部，不可变类可以任意聪明。例如，BigInteger 有一个包私有的可变「伴随类」，它使用这个类来加速多步操作，比如模块化求幂。由于前面列出的所有原因，使用可变伴随类要比使用 BigInteger 难得多。幸运的是，你不必使用它：BigInteger 的实现者为你做了艰苦的工作。

如果你能够准确地预测客户端希望在不可变类上执行哪些复杂操作，那么包私有可变伴随类方法就可以很好地工作。如果不是，那么你最好的选择就是提供一个公共可变伴随类。这种方法在 Java 库中的主要示例是 String 类，它的可变伴随类是 StringBuilder（及其过时的前身 StringBuffer)。

既然你已经知道了如何创建不可变类，并且了解了不可变性的优缺点，那么让我们来讨论一些设计方案。回想一下，为了保证不变性，类不允许自己被子类化。可以用 final 修饰以达到目的，但是还有另外一个更灵活的选择，你可以将其所有构造函数变为私有或包私有，并使用公共静态工厂方法来代替公共的构造函数。Complex 类采用这种方式修改后如下所示：

```java
// Immutable class with static factories instead of constructors
public class Complex {
    private final double re;
    private final double im;
    private Complex(double re, double im) {
        this.re = re;
        this.im = im;
    }
    public static Complex valueOf(double re, double im) {
        return new Complex(re, im);
    }
    ... // Remainder unchanged
}
```

这种方式通常是最好的选择。它是最灵活的，因为它允许使用多个包私有实现类。对于驻留在包之外的客户端而言，不可变类实际上是 final 类，因为不可能继承自另一个包的类，因为它缺少公共或受保护的构造函数。除了允许多实现类的灵活性之外，这种方法还通过改进静态工厂的对象缓存功能，使得后续版本中调优该类的性能成为可能。

当编写 BigInteger 和 BigDecimal 时，不可变类必须是有效的 final 这一点没有被广泛理解，因此它们的所有方法都可能被重写。遗憾的是，在保留向后兼容性的情况下，这个问题无法得到纠正。如果你编写的类的安全性依赖于来自不受信任客户端的 BigInteger 或 BigDecimal 参数的不可变性，那么你必须检查该参数是否是「真正的」BigInteger 或 BigDecimal，而不是不受信任的子类实例。如果是后者，你必须防御性的复制它，假设它可能是可变的:

```java
public static BigInteger safeInstance(BigInteger val) {
return val.getClass() == BigInteger.class ?
val : new BigInteger(val.toByteArray());
}
```

这个条目开头的不可变类的规则列表指出，没有方法可以修改对象，它的所有字段必须是 final 的。实际上，这些规则过于严格，可以适当放松来提高性能。实际上，任何方法都不能在对象的状态中产生外部可见的更改。然而，一些不可变类有一个或多个非 final 字段，它们在第一次需要这些字段时，就会在其中缓存昂贵计算的结果。如果再次请求相同的值，则返回缓存的值，从而节省了重新计算的成本。这个技巧之所以有效，是因为对象是不可变的，这就保证了重复计算会产生相同的结果。

例如，PhoneNumber 的 hashCode 方法在第一次调用时计算哈希代码，并缓存它，以备再次调用。这个技术是一个延迟初始化的例子，String 也使用这个技术。

关于可序列化性，应该提出一个警告。如果你选择让不可变类实现 Serializable，并且该类包含一个或多个引用可变对象的字段，那么你必须提供一个显式的 readObject 或 readResolve 方法，或者使用 ObjectOutputStream.writeUnshared 或 ObjectInputStream.readUnshared 方法，即使默认的序列化形式是可以接受的。否则攻击者可能创建类的可变实例。

总而言之，不要急于为每个 getter 都编写 setter。**类应该是不可变的，除非有很好的理由让它们可变。** 不可变类提供了许多优点，它们唯一的缺点是在某些情况下可能出现性能问题。你应该始终使小的值对象（如 PhoneNumber 和 Complex）成为不可变的。（Java 库中有几个类，比如 `java.util.Date` 和 `java.awt.Point`，应该是不可改变的，但事实并非如此。）也应该认真考虑将较大的值对象（如 String 和 BigInteger）设置为不可变的。只有确认了实现令人满意的性能是必要的，才应该为不可变类提供一个公共可变伴随类。

对于某些类来说，不变性是不切实际的。**如果一个类不能成为不可变的，那么就尽可能地限制它的可变性。** 减少对象可能存在的状态数可以更容易地 reason about the object 并减少出错的可能性。因此，除非有令人信服的理由，否则每个字段都应该用 final 修饰。将本条目的建议与 Item-15 的建议结合起来，你自然会倾向于 **声明每个字段为私有 final，除非有很好的理由不这样做。**

**构造函数应该创建完全初始化的对象，并建立所有的不变量。** 除非有充分的理由，否则不要提供与构造函数或静态工厂分离的公共初始化方法。类似地，不要提供「重新初始化」的方法，该方法允许复用对象，就好像它是用不同的初始状态构造的一样。这些方法通常只提供很少的性能收益，而代价是增加了复杂性。

CountDownLatch 类体现了这些原则。它是可变的，但是它的状态空间故意保持很小。创建一个实例，使用它一次，它就完成了使命：一旦倒计时锁存器的计数达到零，你可能不会复用它。

关于本条目中 Complex 类的最后一点需要补充的说明。这个例子只是为了说明不变性。它不是一个工业级强度的复数实现。它使用了复杂乘法和除法的标准公式，这些公式没有被正确地四舍五入，并且为复杂的 NaNs 和 infinities 提供了糟糕的语义。

## 扩展

### 常见的方法来减少可变性

减少可变性是一种重要的编程原则，它旨在减少代码中可变状态的数量，以提高代码的可维护性、可测试性和并发安全性。以下是一些常见的方法来减少可变性：

1. 使用不可变类：不可变类是指其实例在创建后不能被修改的类。不可变类的字段都是 final 的，并且类中没有提供修改字段的方法（setter）。通过使用不可变类，可以确保对象的状态不会被意外地修改，从而减少潜在的错误和并发问题。
2. 封装可变状态：如果某个类必须具有可变状态，建议将可变状态封装在类内部，并通过访问器方法（getter 和 setter）来控制对状态的访问和修改。这样可以限制对状态的直接访问，提供更好的封装和控制机制。
3. 避免共享可变对象：在多线程环境下，共享可变对象可能导致并发问题。为了减少可变性，可以避免共享可变对象，或者确保在共享时进行适当的同步。如果可能，使用不可变对象或线程安全的对象来代替可变对象。
4. 使用不可变集合：Java 提供了许多不可变集合类，如 Collections.unmodifiableList 和 Collections.unmodifiableMap 等。通过使用这些不可变集合类，可以确保集合内容不会被修改，从而减少可变性。
5. 使用函数式编程风格：函数式编程鼓励使用不可变数据和无副作用的函数。通过使用纯函数（没有副作用，并且对相同的输入始终产生相同的输出），可以减少可变性，并提高代码的可读性和可维护性。

下面是一些常见的不可变数据结构的例子：

1. 不可变列表（Immutable List）：不可变列表是指一旦创建就不能修改的列表。在 Java 中，可以使用`java.util.Collections.unmodifiableList()`方法来创建不可变列表。

   ```java
   List<String> immutableList = Collections.unmodifiableList(Arrays.asList("apple", "banana", "cherry"));
   ```

   上述代码创建了一个不可变列表，无法对其进行添加、删除或修改操作。

2. 不可变映射（Immutable Map）：不可变映射是指一旦创建就不能修改的映射关系。在 Java 中，可以使用`java.util.Collections.unmodifiableMap()`方法来创建不可变映射。

   ```java
   Map<String, Integer> immutableMap = Collections.unmodifiableMap(Map.of("apple", 1, "banana", 2, "cherry", 3));
   ```

   上述代码创建了一个不可变映射，无法对其进行添加、删除或修改操作。

3. 不可变集合（Immutable Set）：不可变集合是指一旦创建就不能修改的集合。在 Java 中，可以使用`java.util.Collections.unmodifiableSet()`方法来创建不可变集合。

   ```java
   Set<String> immutableSet = Collections.unmodifiableSet(Set.of("apple", "banana", "cherry"));
   ```

​ 上述代码创建了一个不可变集合，无法对其进行添加、删除或修改操作。

不可变数据结构的特点是它们在创建后不能被修改，这意味着它们具有固定的状态。如果需要修改数据结构，必须创建一个新的不可变实例。这种不可变性使得数据结构更安全、线程安全，并且可以有效地用于并发环境。

需要注意的是，虽然不可变数据结构本身是不可变的，但其中的元素对象可能是可变的。如果需要确保元素对象也是不可变的，则需要采取相应的措施来保证元素对象的不可变性。

下面是一些使用函数式编程风格减少可变性的示例：

1. 使用不可变数据结构：函数式编程鼓励使用不可变的数据结构，如不可变列表、不可变映射等。这些数据结构在创建后不能被修改，而是通过创建新的不可变实例来表示修改后的状态。例如，Java 8 引入的`java.util.stream.Stream`中的操作返回的是不可变流，它们无法修改原始流，而是生成一个新的流。

   ```java
   List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

   List<Integer> doubledNumbers = numbers.stream()
                                         .map(n -> n * 2)
                                         .collect(Collectors.toList());

   System.out.println(doubledNumbers); // 输出: [2, 4, 6, 8, 10]
   ```

   在上面的示例中，通过使用`map`操作创建了一个新的流来表示每个元素翻倍后的状态，而原始的`numbers`列表保持不变。

2. 避免副作用：函数式编程鼓励使用无副作用的函数，即函数的执行不会对外部状态产生影响。这意味着函数不应该修改传入的参数或任何外部状态。相反，函数应该返回计算结果，并且对于相同的输入应该始终返回相同的输出。

   ```java
   // 有副作用的示例
   int counter = 0;

   void incrementCounter() {
       counter++;
   }

   // 无副作用的示例
   int increment(int value) {
       return value + 1;
   }
   ```

​ 在上面的示例中，`incrementCounter`函数对外部状态进行了修改（副作用），而`increment`函数则返回了新的计算结果，而不改变传入的参数或任何外部状态。

通过使用不可变数据结构和避免副作用，函数式编程风格可以减少可变性，提高代码的可读性、可测试性和并发安全性。同时，这种风格还可以使代码更易于推理和调试，并减少潜在的错误和 bug。

### 如何确保不可变数据结构中的元素对象也是不可变的？

确保不可变数据结构中的元素对象也是不可变的，可以遵循以下几个步骤：

1. 使用不可变对象：尽可能使用不可变对象作为元素对象。不可变对象是指其状态在创建后不能被修改的对象。如果使用现有的不可变类（如`String`和`Integer`），则无需额外的步骤，因为它们本身就是不可变的。

2. 使用深度不可变性：如果元素对象是可变的，并且需要确保它们不会被修改，可以采用深度不可变性的方法。这意味着在创建不可变数据结构时，对于每个可变元素对象，都要进行克隆或创建新的不可变实例，而不是直接引用可变对象。

   ````java
   // 以不可变对象作为元素
   List<String> immutableList = List.of("apple", "banana", "cherry");

   // 使用深度不可变性
   List<Person> immutablePersonList = List.of(
       new Person("John", 25),
       new Person("Alice", 30),
       new Person("Bob", 35)
   );

   // Person类需要是不可变的
   class Person {
       private final String name;
       private final int age;

       public Person(String name, int age) {
           this.name = name;
           this.age = age;
       }

       // 只提供getter方法，没有setter方法
       public String getName() {
           return name;
       }

       public int getAge() {
           return age;
       }
   }
   ```

   在上述示例中，`Person`类是不可变的，它没有提供修改属性的方法（setter）。通过创建新的`Person`实例，并将其作为不可变列表的元素，确保了元素对象的不可变性。
   ````

3. 防御性复制：如果不可变数据结构中的元素对象是可变的，并且不希望它们被外部修改，可以在访问器方法中返回元素对象的防御性复制。这样可以确保返回的是一个新的副本，而不是直接返回原始对象的引用。

   ```java
   class ImmutableDataStructure {
       private final List<Person> persons;

       public ImmutableDataStructure(List<Person> persons) {
           this.persons = new ArrayList<>(persons); // 防御性复制
       }

       public List<Person> getPersons() {
           return new ArrayList<>(persons); // 防御性复制
       }
   }
   ```

​ 在上述示例中，`ImmutableDataStructure`类包含一个`persons`列表，通过在构造函数和访问器方法中进行防御性复制，返回了一个新的列表副本，从而保护了元素对象的不可变性。

通过遵循这些步骤，可以确保不可变数据结构中的元素对象也是不可变的。这有助于保持数据的一致性、线程安全性，并提供更好的封装性和可维护性。
