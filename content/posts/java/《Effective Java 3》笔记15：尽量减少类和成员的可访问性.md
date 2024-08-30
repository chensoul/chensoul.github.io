---
title: "《Effective Java 3》笔记15：尽量减少类和成员的可访问性"
date: 2023-06-15
slug: minimize-the-accessibility-of-classes-and-members
categories: ["Java"]
tags: [java]
---

本文是 《Effective Java 3》第四章《类和接口》的学习笔记：尽量减少类和成员的可访问性。

类和接口是 Java 编程语言的核心。它们是抽象的基本单位。该语言提供了许多强大的元素，你可以使用它们来设计类和接口。

## 介绍

《Effective Java, Third Edition》这本书中的第四章主要讲述了如何尽量减少类和成员的可访问性，以提高代码的封装性、安全性和可维护性。

尽量减少类和成员的可访问性是面向对象编程中的一个基本原则，也被称为 "最小化可访问性原则"。这个原则的核心思想是，将类和成员的访问级别限制在最小范围内，从而提高代码的安全性、可维护性和可复用性。

在 Java 中，类和成员的访问级别有四种：public、protected、default 和 private。其中，public 级别是最高的，可以被任何类访问；private 级别是最低的，只能被同一个类内部的成员访问。在应用最小化可访问性原则时，应该尽可能地将类和成员的访问级别设置为最低的级别，即 private 或 default 级别。

尽量减少类和成员的可访问性是一种良好的编程实践，可以提高代码的安全性和可维护性。以下是一些建议：

1. 将类和成员的可见性设置为最小化的级别，即只有必要的代码可以访问它们。这将减少不必要的依赖关系，并使代码更加模块化和可重用。

2. 使用访问修饰符以限制类和成员的可见性。例如，如果一个成员只能在类内部使用，可以考虑将其转换为私有静态嵌套类。如果一个成员需要在类的子类中使用，可以使用 protected 修饰符。

   > 下面是一个示例，演示如何将包级私有顶级类转换为私有静态嵌套类：
   >
   > ```java
   > // 包级私有顶级类
   > class MyTopLevelClass {
   >     // ...
   > }
   >
   > public class MyClass {
   >     private static class MyPrivateNestedClass {
   >         // 使用 MyTopLevelClass 的代码
   >     }
   >
   >     // 使用 MyPrivateNestedClass 的代码
   > }
   > ```
   >
   > 在上面的示例中，MyTopLevelClass 被转换为了 MyPrivateNestedClass，它被声明为 MyClass 的私有静态嵌套类。这样，MyTopLevelClass 就只能被 MyPrivateNestedClass 使用，而 MyPrivateNestedClass 只能被 MyClass 使用，达到了安全和清晰的目标。

3. 避免使用公共成员或公共方法。公共成员和方法可以被任何代码访问，这可能会导致安全问题和不必要的代码耦合。相反，应该使用封装的方式来隐藏类的实现细节，并在需要时提供公共接口。

4. 在需要使用公共接口时，使用接口或抽象类来定义公共契约。这样可以使代码更加灵活，并使实现细节能够独立于公共契约进行修改。

5. 使用 final 关键字来限制类和成员的可变性。这可以提高代码的安全性和可维护性，并避免在不必要的情况下修改代码。

## 扩展

设计公共接口需要考虑接口的简洁性、易用性和一致性，同时避免暴露过多的底层实现细节。下面是一个简单的示例，展示了如何设计一个公共接口。

```java
/**
 * This interface provides a simple way to perform arithmetic operations.
 * @author chensoul
 * @since 1.0.0
 */
public interface Arithmetic {

    /**
     * Adds two integers and returns the result.
     *
     * @param a the first integer
     * @param b the second integer
     * @return the sum of a and b
     */
    int add(int a, int b);

    /**
     * Subtracts two integers and returns the result.
     *
     * @param a the first integer
     * @param b the second integer
     * @return the difference of a and b
     */
    int subtract(int a, int b);

    /**
     * Multiplies two integers and returns the result.
     *
     * @param a the first integer
     * @param b the second integer
     * @return the product of a and b
     */
    int multiply(int a, int b);

    /**
     * Divides two integers and returns the result.
     *
     * @param a the numerator
     * @param b the denominator
     * @return the quotient of a and b
     * @throws ArithmeticException if b is zero
     */
    int divide(int a, int b) throws ArithmeticException;
}
```

在上面的示例中，我们设计了一个名为 Arithmetic 的接口，它提供了四个基本的算术操作：加法、减法、乘法和除法。每个方法都有清晰的文档注释，描述了方法的用途、参数和返回值。此外，除法方法还声明了一个异常，以防止除以零的情况。

以下是一些关于如何设计公共 API 的最佳实践：

1. 最小化公共 API：尽可能地减少公共 API 的规模和复杂度，只暴露必要的接口和行为。这样可以保持 API 的简单性和稳定性，避免意外的依赖和耦合。
2. 保护不可变性：对于公共静态 final 字段引用的对象，应该确保它们是不可变的，以避免意外修改公共状态。
3. 使用接口和抽象类：使用接口和抽象类来定义公共 API，从而使得实现类可以灵活地选择自己的实现方式。同时，接口和抽象类可以隐藏实现细节，保持 API 的简单性和稳定性。
4. 使用枚举类型：枚举类型可以在定义一组常量时提供类型安全性，并且可以避免意外的实例化和修改。
5. 文档化 API：提供详细的文档和示例代码，以便开发人员能够正确地使用公共 API。

当设计一个公共 API 时，文档化是非常重要的。以下是一些关于如何文档化 API 的最佳实践：

1. 提供 API 文档：为 API 提供详细的文档，包括 API 的使用方法、接口、参数、返回值、异常和示例代码等。API 文档应该清晰、简单、易于理解，并且应该提供足够的上下文和解释。
2. 为 API 提供示例代码：为 API 提供详细的示例代码，以便开发人员能够快速地理解和使用 API。示例代码应该清晰、简单、易于理解，并且应该提供足够的注释和解释。
3. 使用标准注释：使用标准注释格式，例如 Javadoc 或者 Doxygen，以便生成 API 文档。标准注释格式可以提高文档的一致性和可读性，并且可以使用自动化工具来生成 API 文档。
4. 为 API 提供版本号：为 API 提供版本号，以便开发人员可以跟踪 API 的演变和变化。版本号应该清晰、简单、易于理解，并且应该遵循一定的命名规则。
5. 提供 API 更新日志：为 API 提供更新日志，以便开发人员可以了解 API 的变化和演变。更新日志应该清晰、简单、易于理解，并且应该提供足够的上下文和解释。
6. 避免使用过时的 API：避免使用过时的 API，以避免出现不必要的问题和错误。如果必须使用过时的 API，应该提供警告和替代方案，以便开发人员能够了解风险和替代方案。

以下是一个使用 Javadoc 注释格式为 Java 类和方法文档化的示例代码：

```java
/**
 * The BasicArithmetic class provides a basic implementation of the Arithmetic interface.
 * This implementation is not recommended for use in production code, and will be removed in a future release.
 *
 * @deprecated This class is for demonstration purposes only.
 *             Use {@link AdvancedArithmetic} for more advanced arithmetic operations.
 *             For basic arithmetic operations, use the {@link java.lang.Math} class instead.
 * @see Arithmetic
 * @see AdvancedArithmetic
 * @see java.lang.Math
 * @since 1.0.0
 */
@Deprecated
public class BasicArithmetic implements Arithmetic {

    /**
     * {@inheritDoc}
     *
     * @param a the first integer to be added
     * @param b the second integer to be added
     * @return the sum of a and b
     */
    @Override
    public int add(int a, int b) {
        return a + b;
    }

    /**
     * {@inheritDoc}
     *
     * @param a the integer to be subtracted from
     * @param b the integer to subtract
     * @return the difference of a and b
     */
    @Override
    public int subtract(int a, int b) {
        return a - b;
    }

    /**
     * {@inheritDoc}
     *
     * @param a the first integer to be multiplied
     * @param b the second integer to be multiplied
     * @return the product of a and b
     */
    @Override
    public int multiply(int a, int b) {
        return a * b;
    }

    /**
     * {@inheritDoc}
     *
     * @param a the numerator to be divided
     * @param b the denominator to divide by
     * @return the quotient of a and b
     * @throws ArithmeticException if b is zero
     */
    @Override
    public int divide(int a, int b) throws ArithmeticException {
        if (b == 0) {
            throw new ArithmeticException("Cannot divide by zero.");
        }
        return a / b;
    }
}
```

> 在上面的示例中，我们添加了@autho、@since、@see、@link 、@deprecated 和 @inheritDoc 标记。
>
> - @author 标记指定了类的作者，可以是单个人或组织。
> - @since 标记指定了类最初被引入的版本。
>
> - @see 标记提供了一个链接到其他相关的类或接口。
> - @link 标记提供了一个链接到其他相关的类、方法、字段或包。
> - @deprecated 标记指示该类或方法已过时，不推荐使用，并会在将来的版本中被删除。
>
> - @inheritDoc 继承父类的 Javadoc 注释。但是需要注意的是，@inheritDoc 标记不能继承任何其他的注释信息，如参数、返回值或异常。如果子类方法有自己的参数、返回值或异常，则需要在子类方法中添加对应的 Javadoc 注释。
