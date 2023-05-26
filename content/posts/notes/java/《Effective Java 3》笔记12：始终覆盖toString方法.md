---
title: "《Effective Java 3》笔记12：当覆盖 equals 方法时，总要覆盖 hashCode 方法"
date: 2023-05-26T07:00:00+08:00
slug: always-override-toString
categories: ["Notes"]
tags: [java]
---

本文是 《Effective Java 3》第三章《对象的通用方法》的学习笔记：始终覆盖 toString 方法。

## 介绍

虽然 Object 提供 toString 方法的实现，但它返回的字符串通常不是类的用户希望看到的。它由后跟「at」符号（@）的类名和 hash 代码的无符号十六进制表示（例如 `PhoneNumber@163b91`）组成。toString 的通用约定是这么描述的，返回的字符串应该是「简洁但信息丰富的表示，易于阅读」。虽然有人认为 `PhoneNumber@163b91` 简洁易懂，但与 `707-867-5309` 相比，它的信息量并不大。toString 约定接着描述，「建议所有子类覆盖此方法。」好建议，确实！



虽然它不如遵守 equals 和 hashCode 约定那么重要，但是 **提供一个好的 toString 实现（能）使类更易于使用，使用该类的系统（也）更易于调试。** 当对象被传递给 println、printf、字符串连接操作符或断言或由调试器打印时，将自动调用 toString 方法。即使你从来没有调用 toString 对象，其他人也可能（使用）。例如，有对象引用的组件可以在日志错误消息中包含对象的字符串表示。如果你未能覆盖 toString，则该消息可能完全无用。



如果你已经为 PhoneNumber 提供了一个好的 toString 方法，那么生成一个有用的诊断消息就像这样简单：

```java
System.out.println("Failed to connect to " + phoneNumber);
```



无论你是否覆盖 toString，程序员都会以这种方式生成诊断消息，但是除非你（覆盖 toString），否则这些消息不会有用。提供好的 toString 方法的好处不仅仅是将类的实例扩展到包含对这些实例的引用的对象，特别是集合。在打印 map 时，你更愿意看到哪个，`{Jenny=PhoneNumber@163b91}` 还是 `{Jenny=707-867-5309}`？



**当实际使用时，toString 方法应该返回对象中包含的所有有趣信息，** 如电话号码示例所示。如果对象很大，或者包含不利于字符串表示的状态，那么这种方法是不切实际的。在这种情况下，toString 应该返回一个摘要，例如曼哈顿住宅电话目录（1487536 号清单）或 `Thread[main,5,main]`。理想情况下，字符串应该是不言自明的。（线程示例未能通过此测试。）如果没有在字符串表示中包含所有对象的有趣信息，那么一个特别恼人的惩罚就是测试失败报告，如下所示：

```java
Assertion failure: expected {abc, 123}, but was {abc, 123}.
```



在实现 toString 方法时，你必须做的一个重要决定是是否在文档中指定返回值的格式。建议你针对值类（如电话号码或矩阵）这样做。指定格式的优点是，它可以作为对象的标准的、明确的、人类可读的表示。这种表示可以用于输入和输出，也可以用于持久的人类可读数据对象，比如 CSV 文件。如果指定了格式，提供一个匹配的静态工厂或构造函数通常是一个好主意，这样程序员就可以轻松地在对象及其字符串表示之间来回转换。Java 库中的许多值类都采用这种方法，包括 BigInteger、BigDecimal 和大多数包装类。



指定 toString 返回值的格式的缺点是，一旦指定了它，就会终生使用它，假设你的类被广泛使用。程序员将编写代码来解析表示、生成表示并将其嵌入持久数据中。如果你在将来的版本中更改了表示形式，你将破坏它们的代码和数据，它们将发出大量的消息。通过选择不指定格式，你可以保留在后续版本中添加信息或改进格式的灵活性。



**无论你是否决定指定格式，你都应该清楚地记录你的意图。** 如果指定了格式，则应该精确地指定格式。例如，这里有一个 toString 方法用于PhoneNumber 类：

```java
/**
* Returns the string representation of this phone number.
* The string consists of twelve characters whose format is
* "XXX-YYY-ZZZZ", where XXX is the area code, YYY is the
* prefix, and ZZZZ is the line number. Each of the capital
* letters represents a single decimal digit.
**
If any of the three parts of this phone number is too small
* to fill up its field, the field is padded with leading zeros.
* For example, if the value of the line number is 123, the last
* four characters of the string representation will be "0123".
*/
@Override
public String toString() {
    return String.format("%03d-%03d-%04d", areaCode, prefix, lineNum);
}
```

如果你决定不指定一种格式，文档注释应该如下所示：

```java
/**
* Returns a brief description of this potion. The exact details
* of the representation are unspecified and subject to change,
* but the following may be regarded as typical:
**
"[Potion #9: type=love, smell=turpentine, look=india ink]"
*/
@Override
public String toString() { ... }
```

在阅读了这篇文档注释之后，当格式被更改时，生成依赖于格式细节的代码或持久数据的程序员将只能怪他们自己。



无论你是否指定了格式，都要 **提供对 toString 返回值中包含的信息的程序性访问。** 例如，PhoneNumber 类应该包含区域代码、前缀和行号的访问器。如果做不到这一点，就会迫使需要这些信息的程序员解析字符串。除了降低性能和使程序员不必要的工作之外，这个过程很容易出错，并且会导致脆弱的系统在你更改格式时崩溃。由于没有提供访问器，你可以将字符串格式转换为事实上的 API，即使你已经指定了它可能会发生更改。



在静态实用程序类中编写 toString 方法是没有意义的，在大多数 enum 类型中也不应该编写 toString 方法，因为 Java 为你提供了一个非常好的方法。但是，你应该在任何抽象类中编写 toString 方法，该类的子类共享公共的字符串表示形式。例如，大多数集合实现上的 toString 方法都继承自抽象集合类。



谷歌的开放源码自动值工具将为你生成 toString 方法，大多数 IDE 也是如此。这些方法可以很好地告诉你每个字段的内容，但并不专门针对类的含义。因此，例如，对于 PhoneNumber 类使用自动生成的 toString 方法是不合适的（因为电话号码具有标准的字符串表示形式），但是对于 Potion 类来说它是完全可以接受的。也就是说，一个自动生成的 toString 方法要比从对象继承的方法好得多，对象继承的方法不会告诉你对象的值。



回顾一下，在你编写的每个实例化类中覆盖对象的 toString 实现，除非超类已经这样做了。它使类更易于使用，并有助于调试。toString 方法应该以美观的格式返回对象的简明、有用的描述。



## 总结

建议始终覆盖 `toString()` 方法。这是因为 `toString()` 方法是 Java 中最常用的方法之一，它可以将一个对象转换成一个字符串，方便输出和日志记录等操作。

默认情况下，如果一个类没有覆盖 `toString()` 方法，那么它将继承自 `Object` 类的实现，该实现返回一个包含对象类名和散列码的字符串。这个默认的实现可能对于调试和开发过程中的一些操作是有用的，但通常不会提供有关对象的有用信息。

因此，建议在每个类中都覆盖 `toString()` 方法，以便在需要时提供有用的信息。在实现 `toString()` 方法时，可以返回一个包含有关对象状态的字符串，这样就可以在调试和其他操作中使用该字符串。例如，如果一个类表示一个人，那么它的 `toString()` 方法可以返回该人的姓名和年龄，以便在需要时更好地理解该对象。

另外，在重写 `toString()` 方法时，也应该遵循一些约定，以确保该方法的实现正确、高效和易于使用。其中一些约定包括：

1. 返回的字符串应该以对象的类名作为开头，后面跟着对象的状态信息。例如：`Person{name='John', age=30}`。
2. 返回的字符串应该是可读的，并且应该包含有关对象状态的所有信息，以便在需要时更好地理解该对象。
3. 返回的字符串应该是不可变的，即不能在返回字符串后更改对象状态以更改返回值。
4. 返回的字符串应该是符合语言习惯的，并且应该适合于国际化和本地化。

总之，覆盖 `toString()` 方法可以提高代码的可读性和可维护性，因为它提供了有关对象状态的有用信息，同时也符合 Java 语言的习惯和规范。



Java 中有很多可以自动生成 `toString()` 方法的开源框架。以下是一些常用的框架：

1. Apache Commons Lang - `ToStringBuilder`: Apache Commons Lang 是一个常用的开源 Java 工具库，其中的 `ToStringBuilder` 类可以帮助开发者自动生成 `toString()` 方法。使用该类需要在需要自动生成 `toString()` 方法的类中添加对应的成员变量，并调用 `ToStringBuilder` 的 `reflectionToString()` 方法。
2. Guava - `MoreObjects.toStringHelper()`: Guava 是 Google 开源的一个 Java 工具库，其中的 `MoreObjects` 类可以帮助开发者自动生成 `toString()` 方法。使用该类需要在需要自动生成 `toString()` 方法的类中添加对应的成员变量，并调用 `MoreObjects` 的 `toStringHelper()` 方法。
3. Lombok - `@ToString`: Lombok 是一个 Java 库，它可以通过注解来简化 Java 代码。其中的 `@ToString` 注解可以帮助开发者自动生成 `toString()` 方法。使用该注解只需要在需要自动生成 `toString()` 方法的类上添加 `@ToString` 注解即可，Lombok 会自动为该类生成对应的 `toString()` 方法4. Eclipse Collections - `ToString`: Eclipse Collections 是一个基于 Java 的集合框架，其中的 `ToString` 类可以帮助开发者自动生成 `toString()` 方法。使用该类需要在需要自动生成 `toString()` 方法的类中添加对应的成员变量，并调用 `ToString` 的 `includeFields()` 方法。
4. Apache Commons BeanUtils - `ReflectionToStringBuilder`: Apache Commons BeanUtils 是一个常用的 Java Bean 操作工具库，其中的 `ReflectionToStringBuilder` 类可以帮助开发者自动生成 `toString()` 方法。使用该类需要在需要自动生成 `toString()` 方法的类中添加对应的成员变量，并调用 `ReflectionToStringBuilder` 的 `toString()` 方法。
