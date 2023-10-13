---
title: "《Effective Java 3》笔记4：用私有构造函数使类不可实例化"
date: 2023-05-05T08:00:00+08:00
slug: enforce-noninstantiability-with-a-private-constructor
categories: ["Java"]
tags: [java]
---

本文是 《Effective Java 3》第二章的学习笔记：用私有构造函数使类不可实例化。

## 介绍

使用私有构造函数强制实现不可实例化的主要原因是防止类被意外地实例化，以使代码更加健壮和可靠。在某些情况下，我们只需要使用类中的静态方法和静态字段，而不需要创建该类的实例。如果类中没有显式地定义私有构造函数，Java 编译器将会自动为该类生成一个默认的公共构造函数，这意味着该类可以在其他类中被实例化。如果这不是我们想要的，为了防止其他人意外地实例化我们的类，我们可以将构造函数设置为私有。

此外，使用私有构造函数强制实现不可实例化还有以下优点：

1. 明确表明该类不可被实例化，提高了代码的可读性和可维护性。
2. 防止类被子类化，从而避免了继承所带来的副作用和不必要的复杂性。
3. 提高了代码的安全性，防止其他类在不合适的情况下实例化该类。

这是一个实现了私有构造函数强制实现不可实例化的类的示例：

```java
public class UtilityClass {
    // 禁止默认构造函数防止实例化
    private UtilityClass() {
        throw new AssertionError();
    }

    // 其他静态方法和字段
    // ...
}
```

这个类中的私有构造函数会在被调用时抛出`AssertionError`。这样做可以确保构造函数永远不会从类内部或外部调用。

通过将构造函数设置为私有，这个类就不能从外部被实例化。这个习惯用法也防止了类被子类化。如果一个类的构造函数是私有的，那么它不能被子类调用，因为子类必须调用父类的构造函数来完成初始化。因此，如果一个类的构造函数是私有的，它就不能被子类化，因为子类不能调用父类的构造函数来完成初始化。

以下是一个示例，展示了如何使用私有构造函数防止类被子类化：

```java
public final class FinalClass {
    private FinalClass() {
        // private constructor
    }

    public static void doSomething() {
        // do something
    }
}
```

在这个示例中，`FinalClass`被声明为`final`，因此不能被子类化。此外，它的构造函数是私有的，因此不能从子类中被调用。由于该类不能被子类化，因此它的行为不会受到子类的影响，从而避免了继承所带来的副作用和不必要的复杂性。

在某些情况下，将类设置为不能被实例化，但可以被子类化是有用的。这通常是因为我们希望子类化的类能够继承父类的行为和属性，同时又不希望外部能够实例化该类。以下是一个例子：

```java
public abstract class Animal {
    private String name;

    protected Animal(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public abstract void makeSound();
}

public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }

    @Override
    public void makeSound() {
        System.out.println("Woof!");
    }
}
```

在这个例子中，`Animal`类被设置为抽象类，它的构造函数被设置为`protected`，这意味着该类不能被实例化，但可以被子类化。`Dog`类继承了`Animal`类，并实现了`makeSound()`方法。由于`Animal`类的构造函数被设置为`protected`，所以`Dog`类可以调用父类的构造函数来进行初始化。

在这个例子中，我们希望`Animal`类能够提供一些通用的行为和属性，同时又不希望外部能够实例化该类，因为`Animal`类本身并不是一种具体的动物。而`Dog`类作为`Animal`类的子类，可以继承`Animal`类的行为和属性，并实现自己的特定行为，以实现具体的功能。

## 用途

私有构造函数还有其他一些用途，以下是一些常见的用途：

1. 防止实例化：私有构造函数可以防止类被实例化，这对于只包含静态方法和静态字段的实用工具类非常有用。这些类可以通过将构造函数设置为私有来防止它们被实例化，从而避免不必要的对象创建和资源浪费。

2. 强制实现单例：单例模式是一种常见的设计模式，它要求一个类有且仅有一个实例，并提供一个全局访问点。私有构造函数可以强制实现单例模式，因为它可以防止类被实例化，除非类的内部定义了一个静态实例并提供了一个公共的静态访问方法。

   ```java
   public class Singleton {
       private static Singleton instance;

       private Singleton() {
           // private constructor
       }

       public static Singleton getInstance() {
           if (instance == null) {
               instance = new Singleton();
           }
           return instance;
       }
   }
   ```

   在这个示例中，`Singleton`类的构造函数是私有的，因此它不能被其他类实例化。`getInstance()`方法提供了一个全局访问点，并在需要时创建了一个静态实例。由于构造函数是私有的，因此只有`Singleton`类的内部才能创建实例，从而实现了单例模式。

3. 防止子类化：私有构造函数可以防止类被子类化，从而避免了继承所带来的副作用和不必要的复杂性。

   ```java
   public final class FinalClass {
       private FinalClass() {
           // private constructor
       }

       public static void doSomething() {
           // do something
       }
   }
   ```

   在这个示例中，`FinalClass`类被声明为`final`，它的构造函数是私有的，因此它不能被子类化。该类提供了一些静态方法，可以在其他类中调用，但是不能被子类化。

4. 限制继承：如果一个类的构造函数是私有的，那么它不能被继承，这可以用来限制类的继承。

5. 实现工厂方法：工厂方法是一种常见的设计模式，它提供了一个创建对象的接口，但是将具体的对象创建过程留给了子类或具体的实现类。私有构造函数可以与工厂方法一起使用，以确保只有工厂方法能够创建对象，从而使对象创建过程更加可控和安全。

   ```java
   public class Shape {
       private Shape() {
           // private constructor
       }

       public static Shape createRectangle() {
           return new Rectangle();
       }

       public static Shape createCircle() {
           return new Circle();
       }
   }

   class Rectangle extends Shape {
       public Rectangle() {
           // constructor
       }
   }

   class Circle extends Shape {
       public Circle() {
           // constructor
       }
   }
   ```

   在这个示例中，`Shape`类的构造函数是私有的，因此它不能被实例化。`Shape`类提供了两个静态工厂方法，`createRectangle()`和`createCircle()`，用于创建不同的形状。`Rectangle`和`Circle`类继承自`Shape`类，并实现了自己的构造函数。
