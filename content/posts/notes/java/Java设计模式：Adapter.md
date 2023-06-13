---
title: "Java设计模式：Adapter"
date: 2023-06-10T09:00:00+08:00
slug: java-design-patterns-adapter
categories: ["Notes"]
tags: [java]
draft: false
---



本文主要介绍 Adapter 模式，在 [Java Design Patterns](https://java-design-patterns.com/)  网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。



> [Java Design Patterns](https://java-design-patterns.com/) 提供了各种 Java 设计模式的介绍、示例代码和用例说明。该网站旨在帮助 Java 开发人员了解和应用各种常见的设计模式，以提高代码的可读性、可维护性和可扩展性。
>
> Java Design Patterns 网站提供了多种设计模式分类方式，包括创建型模式（Creational Patterns）、结构型模式（Structural Patterns）和行为型模式（Behavioral Patterns），以及其他一些常见的模式。
>
> 对于每个设计模式，该网站提供了详细的介绍、示例代码和用例说明，并且提供了一些常见的使用场景和注意事项。开发人员可以根据自己的需求选择适合自己的设计模式，并且可以参考示例代码和用例说明来理解和应用该模式。
>
> 此外，Java Design Patterns 网站还提供了一些其他资源，如设计模式的 UML 图、设计模式的优缺点、设计模式的比较等。这些资源可以帮助开发人员更好地理解和应用设计模式。
>
> 
>
> 中文网站：[https://java-design-patterns.com/zh/](https://java-design-patterns.com/zh/)
>
> Github 上源码仓库（非官方）：[https://github.com/iluwatar/java-design-patterns](https://github.com/iluwatar/java-design-patterns)



## 目的

将一个接口转换成另一个客户所期望的接口。适配器让那些本来因为接口不兼容的类可以合作无间。

> 适配器模式(Adapter Pattern)是一种结构型设计模式，它允许将一个类的接口转换成客户端所期望的另一种接口。适配器模式通常用于连接两个不兼容的接口或类，以便它们可以协同工作。



## 解释

现实世界例子

> 考虑有这么一种情况，在你的存储卡中有一些照片，你想将其传到你的电脑中。为了传送数据，你需要某种能够兼容你电脑接口的适配器以便你的储存卡能连上你的电脑。在这种情况下，读卡器就是一个适配器。 另一个例子就是注明的电源适配器；三脚插头不能插在两脚插座上，需要一个电源适配器来使其能够插在两脚插座上。 还有一个例子就是翻译官，他翻译一个人对另一个人说的话。

用直白的话来说

> 适配器模式让你可以把不兼容的对象包在适配器中，以让其兼容其他类。

维基百科中说

> 在软件工程中，适配器模式是一种可以让现有类的接口把其作为其他接口来使用的设计模式。它经常用来使现有的类和其他类能够工作并且不用修改其他类的源代码。



适配器模式由三个主要角色组成：

1. 目标接口(Target Interface)：客户端所期望的接口。适配器模式会创建一个实现目标接口的新类，以便客户端可以通过该接口调用它。

2. 适配器(Adapter)：该类实现了目标接口，并将客户端的请求转换为对适配者的调用。适配器通常会聚合一个适配者对象，以便将请求委托给它。

3. 适配者(Adapteree)：适配器模式的实际工作内容。适配者是客户端所期望的接口之外的类，它实现了客户端需要的功能，但其接口与客户端所期望的接口不兼容。

   

**编程样例(对象适配器)**

假如有一个船长他只会划船，但不会航行。

首先我们有接口`RowingBoat`和`FishingBoat`

```java
public interface RowingBoat {
  void row();
}

@Slf4j
public class FishingBoat {
  public void sail() {
    LOGGER.info("The fishing boat is sailing");
  }
}
```

船长希望有一个`RowingBoat`接口的实现，这样就可以移动

```java
public class Captain {

  private final RowingBoat rowingBoat;
  // default constructor and setter for rowingBoat
  public Captain(RowingBoat rowingBoat) {
    this.rowingBoat = rowingBoat;
  }

  public void row() {
    rowingBoat.row();
  }
}
```

现在海盗来了，我们的船长需要逃跑但是只有一个渔船可用。我们需要创建一个可以让船长使用其划船技能来操作渔船的适配器。

```java
@Slf4j
public class FishingBoatAdapter implements RowingBoat {

  private final FishingBoat boat;

  public FishingBoatAdapter() {
    boat = new FishingBoat();
  }

  @Override
  public void row() {
    boat.sail();
  }
}
```

现在 `船长` 可以使用`FishingBoat`接口来逃离海盗了。

```java
var captain = new Captain(new FishingBoatAdapter());
captain.row();
```

## 类图

![alt text](https://java-design-patterns.com/assets/adapter.urm-beb4eb0d.png)

## 优缺点

适配器模式的主要优点是，它可以将不兼容的类和接口连接起来，以便它们可以协同工作。适配器模式还可以减少代码重复，因为它可以将现有的类重用在新的上下文中。此外，适配器模式可以帮助应对不稳定的接口，因为它可以将接口变化隔离到适配器中。

适配器模式的主要缺点是，它可能会导致系统调用链的增加，因为它需要添加额外的对象来进行转换。此外，适配器模式可能会导致性能下降，因为它需要执行额外的处理来进行转换。



## 应用

适配器模式通常用于以下场景：

1. 将现有的类或接口与新的代码集成：适配器可以将现有的类或接口与新的代码集成，以便它们可以协同工作。
2. 与第三方库或组件集成：适配器可以将第三方库或组件的接口与应用程序的接口进行转换，以便它们可以协同工作。
3. 应对不稳定的接口：适配器可以将不稳定的接口封装在一个适配器中，以便将来接口变化时只需要更改适配器即可。
4. 实现多个接口：适配器可以实现多个接口，以便一个对象可以同时被多个类使用。
5. 在测试中使用：适配器可以在测试中模拟接口的行为，以便测试程序的各种用例。
6. 兼容不同版本：如果应用程序需要与多个版本的同一接口进行交互，可以使用适配器模式来处理不同版本之间的差异。
7. 重用现有代码：如果需要重用现有的代码，但其接口与所需接口不兼容，则可以使用适配器模式来重用代码。
8. 数据库驱动程序：数据库驱动程序通常使用适配器模式，以便将数据库的不同接口转换为Java JDBC接口。
9. 日志记录：日志记录库通常使用适配器模式，以便将不同的日志记录接口转换为通用的接口。
10. 扩展现有功能：如果需要扩展现有功能，但其接口与所需接口不兼容，则可以使用适配器模式来扩展现有功能。



以下是一个使用适配器模式的日志记录库的示例：

1. 目标接口：定义通用的日志记录器接口。

```java
public interface Logger {
    void log(String message);
}
```

2) 适配器：定义一个适配器类，实现目标接口，并聚合不同日志框架的对象。

```java
public class LogAdapter implements Logger {
    private Log4j log;

    public LogAdapter(Log4j log) {
        this.log = log;
    }

    @Override
    public void log(String message) {
        log.trace(message);
    }
}
```

3) 适配者：定义一个Log4j日志框架的类。

```java
public class Log4j {
    public void trace(String message) {
        // 使用Log4j进行日志记录
    }
}
```

现在，我们可以使用适配器来将不同的日志框架转换为通用的Logger接口：

```java
Log4j log4j = new Log4j();
Logger logger = new LogAdapter(log4j);
logger.log("This is a log message");
```

在上面的示例中，适配器模式允许我们将Log4j框架的接口转换为通用的Logger接口，以便我们可以使用Logger接口记录日志而不必关心具体使用的日志框架。如果我们需要切换到其他日志框架，只需要创建一个新的适配器即可。



除了适配器模式的应用场景和常见开源框架中的使用示例外，适配器还有其他一些相关的概念和技术：

1. 对象适配器和类适配器：适配器模式可以分为对象适配器和类适配器两种。对象适配器使用组合的方式来实现适配器模式，而类适配器使用继承的方式来实现适配器模式。
2. 双向适配器：在一些情况下，需要将两个不兼容的接口互相适配。这种情况下，可以使用双向适配器模式来实现双向的适配。
3. 接口适配器：当一个接口中有太多的方法，而实现该接口的类只需要其中的一部分方法时，可以使用接口适配器模式来解决这个问题。接口适配器模式将一个接口拆分成多个接口，并提供一个默认的空实现，使得实现该接口的类可以只实现自己需要的方法。



下面是一个双向适配器的示例：

假设有两个接口，分别是 `Shape` 和 `IRectangle`，其中 `Shape` 表示一个形状，`IRectangle` 表示一个矩形。`Shape` 接口有两个方法 `draw()` 和 `resize()`，而 `IRectangle` 接口有三个方法 `setOrigin()`, `setWidth()` 和 `setHeight()`。

现在，我们需要将这两个接口互相适配。我们可以定义一个双向适配器 `ShapeToRectangleAdapter`，它实现了这两个接口，并且可以将一个 `Shape` 对象适配到一个 `IRectangle` 对象中，也可以将一个 `IRectangle` 对象适配到一个 `Shape` 对象中。具体实现如下：

```java
public interface Shape {
    void draw();
    void resize(int width, int height);
  	void move(int x, int y);
}

public interface IRectangle {
    void setOrigin(int x, int y);
    void setWidth(int width);
    void setHeight(int height);
    void paint();
    void stretch();
}

public class ShapeToRectangleAdapter implements Shape, IRectangle {
    private Shape shape;
    private IRectangle rectangle;
    
    public ShapeToRectangleAdapter(Shape shape) {
        this.shape = shape;
    }
    
    public ShapeToRectangleAdapter(IRectangle rectangle) {
        this.rectangle = rectangle;
    }

    // 将 Shape 适配到 IRectangle 中
    public void setOrigin(int x, int y) {
        shape.move(x, y);
    }

    public void setWidth(int width) {
        shape.resize(width, shape.getHeight());
    }

    public void setHeight(int height) {
        shape.resize(shape.getWidth(), height);
    }

    // 将 IRectangle 适配到 Shape 中
    public void draw() {
        rectangle.paint();
    }

    public void resize(int width, int height) {
        rectangle.setWidth(width);
        rectangle.setHeight(height);
    }

    public void move(int x, int y) {
        rectangle.setOrigin(x, y);
    }

    public int getWidth() {
        return rectangle.getWidth();
    }

    public int getHeight() {
        return rectangle.getHeight();
    }
    
    public void paint() {
        shape.draw();
    }

    public void stretch() {
        shape.resize(shape.getWidth() * 2, shape.getHeight() * 2);
    }
}
```

在上面的代码中，`ShapeToRectangleAdapter` 适配器实现了 `Shape` 和 `IRectangle` 接口，并且在构造函数中接收一个 `Shape` 对象或 `IRectangle` 对象作为参数，以便将其适配到另一个接口中。

当需要将一个 `Shape` 对象适配到一个 `IRectangle` 对象中时，适配器实现了 `setOrigin()`、`setWidth()` 和 `setHeight()` 方法，将 `Shape` 对象的位置和大小适配到 `IRectangle` 对象中。

当需要将一个 `IRectangle` 对象适配到一个 `Shape` 对象中时，适配器实现了 `draw()` 和 `resize()` 方法，将 `IRectangle` 对象的绘制和大小调整适配到 `Shape` 对象中。

这样，通过双向适配器，我们可以将 `Shape` 和 `IRectangle` 接口互相适配，使得它们可以在需要的时候互相调用。

## 对比

适配器模式和装饰器模式都是常见的结构型设计模式，它们的作用都是为了增强类的功能。虽然这两种模式具有某些相似之处，但它们之间也存在一些重要的区别。下面是适配器模式和装饰器模式之间的区别：

1. 目的不同：适配器模式的目的是将一个类的接口转换为另一个类的接口，以便这两个类可以协同工作。而装饰器模式的目的是为一个对象添加新的功能，同时不改变其原有的接口和实现。
2. 适配方式不同：适配器模式通常使用对象适配器或类适配器来实现。对象适配器使用组合关系将适配器包装在另一个对象中，而类适配器使用多重继承来实现适配器。而装饰器模式始终使用对象组合来实现。
3. 使用场景不同：适配器模式通常用于集成第三方类或接口，或是将不兼容的接口转换为兼容的接口。而装饰器模式通常用于在运行时动态地为一个对象添加新的功能。
4. 对象的关系不同：适配器模式中，适配器与被适配者之间是一种静态关系，它们之间的关系在编译时就已经确定。而装饰器模式中，装饰器与被装饰者之间是一种动态关系，它们之间的关系在运行时才能确定。

适配器模式的应用场景：

1. 在集成第三方类或接口时，可以使用适配器模式将其接口转换为应用程序所需的接口。
2. 当需要使用某个类的方法，但该类的接口与应用程序的接口不兼容时，可以使用适配器模式将该类的接口转换为应用程序所需的接口。
3. 当需要将一种数据格式转换为另一种数据格式时，可以使用适配器模式将数据格式转换为应用程序所需的格式。

例如，将一个电器插头插入到墙上的插座中，这两个接口是不兼容的。我们可以使用一个插头适配器，将电器插头的接口转换为墙上插座的接口，以便电器可以与墙上的插座协同工作。

装饰器模式的应用场景：

1. 当需要为一个对象动态地添加新的功能时，可以使用装饰器模式。
2. 当需要为一个对象添加的多个功能具有不同的组合方式时，可以使用装饰器模式。

例如，在一个在线商店中，用户可以购买商品并进行支付。我们可以使用装饰器模式来为订单对象添加新的功能，例如添加优惠券、添加礼品包装、添加快递保险等。这些功能可以根据用户的需求进行组合，并且可以在运行时动态地添加或删除。



总之，适配器模式和装饰器模式都是为了增强类的功能，但它们的目的和实现方式不同。适配器模式是为了解决接口不兼容的问题，而装饰器模式是为了动态地为一个对象添加新的功能。



## 举例

以下是常见开源框架中使用适配器模式的一些示例：

1. Spring框架：Spring框架中的 `HandlerAdapter` 接口就是一个适配器模式的应用。不同的 `HandlerAdapter` 实现类可以将不同类型的控制器（如Servlet、Struts、JSF）适配到 Spring MVC 框架中。
2. Hibernate框架：Hibernate框架中的 `ConnectionProvider` 接口也是一个适配器模式的应用。不同的 `ConnectionProvider` 实现类可以将不同类型的数据源（如JDBC、JTA）适配到 Hibernate 框架中。
3. Log4j框架：Log4j框架中的 `Appender` 接口也是一个适配器模式的应用。不同的 `Appender` 实现类可以将不同类型的日志输出适配到 Log4j 框架中。
4. JUnit框架：JUnit框架中的 `Test` 接口也是一个适配器模式的应用。不同的 `Test` 实现类可以将不同类型的测试用例适配到 JUnit 框架中。
5. Java Swing框架：Java Swing框架中的 `JList` 组件也是一个适配器模式的应用。`JList` 组件可以使用适配器将不同类型的数据源（如数组、集合）适配到 `JList` 组件中。
6. Apache Commons框架：Apache Commons框架中的 `FileFilter` 接口也是一个适配器模式的应用。不同的 `FileFilter` 实现类可以将不同类型的文件过滤器适配到 Apache Commons 框架中。
7. Apache Shiro框架：Apache Shiro框架中的 `Realm` 接口也是一个适配器模式的应用。不同的 `Realm` 实现类可以将不同类型的身份验证和授权机制适配到 Apache Shiro 框架中。
8. Apache Struts框架：Apache Struts框架中的 `Action` 接口也是一个适配器模式的应用。不同的 `Action` 实现类可以将不同类型的请求处理适配到 Apache Struts 框架中。
9. Android框架：Android框架中的 `ArrayAdapter` 类也是一个适配器模式的应用。`ArrayAdapter` 类可以使用适配器将不同类型的数据源（如数组、集合）适配到 Android UI 组件中。
10. Spring Boot框架：Spring Boot框架中的 `CommandLineRunner` 接口也是一个适配器模式的应用。不同的 `CommandLineRunner` 实现类可以将不同类型的命令行参数适配到 Spring Boot 框架中。
11. Apache Camel框架：Apache Camel框架中的 `Component` 接口也是一个适配器模式的应用。不同的 `Component` 实现类可以将不同类型的消息传输协议（如HTTP、FTP等）适配到 Apache Camel 框架中。
12. Jersey框架：Jersey框架中的 `MessageBodyReader` 和 `MessageBodyWriter` 接口也是适配器模式的应用。这两个接口可以将不同类型的请求或响应消息适配到 Jersey 框架中。
13. Retrofit框架：Retrofit框架中的 `Converter` 接口也是一个适配器模式的应用。不同的 `Converter` 实现类可以将不同类型的响应消息转换为 Java 对象，并适配到 Retrofit 框架中。
14. Logback框架：Logback框架中的 `Appender` 接口也是适配器模式的应用。不同的 `Appender` 实现类可以将不同类型的日志输出适配到 Logback 框架中。
15. Apache Kafka框架：Apache Kafka框架中的 `Consumer` 和 `Producer` 接口也是适配器模式的应用。不同的 `Consumer` 和 `Producer` 实现类可以将不同类型的消息传输协议适配到 Apache Kafka 框架中。



以下是 jdk 中使用适配器模式的例子：

- [java.util.Arrays#asList()](http://docs.oracle.com/javase/8/docs/api/java/util/Arrays.html#asList(T...)) 该方法将数组转换为List集合。由于数组和List集合的接口不兼容，所以该方法使用了适配器模式将数组转换为List集合。
- [java.util.Collections#list()](https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#list-java.util.Enumeration-) 该方法接受一个 `Enumeration` 对象作为参数，并将该 `Enumeration` 对象转换为一个 `List`。
- [java.util.Collections#enumeration()](https://docs.oracle.com/javase/8/docs/api/java/util/Collections.html#enumeration-java.util.Collection-) 该方法接受一个 `Collection` 对象作为参数，并将该 `Collection` 对象转换为一个 `Enumeration` 对象。
- [javax.xml.bind.annotation.adapters.XMLAdapter](http://docs.oracle.com/javase/8/docs/api/javax/xml/bind/annotation/adapters/XmlAdapter.html#marshal-BoundType-) 该类是用于XML序列化和反序列化的适配器。它可以将Java对象转换为XML元素，并在反序列化时将XML元素转换回Java对象。
- java.io.InputStreamReader和java.io.OutputStreamWriter类：这两个类是用于读写字符流的包装器类。它们使用适配器模式将字节流转换为字符流，以便读写字符数据。
- javax.servlet.ServletRequestWrapper和javax.servlet.ServletResponseWrapper类：这两个类是用于HTTP请求和响应的包装器类。它们使用适配器模式将HTTP请求和响应转换为Servlet API中定义的接口，以便在Servlet中使用。

