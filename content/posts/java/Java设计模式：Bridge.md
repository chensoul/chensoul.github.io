---
title: "Java设计模式：Bridge"
date: 2023-08-28
slug: java-design-patterns-bridge
categories: ["Java"]
tags: [java]
---

本文主要介绍 [Bridge](https://java-design-patterns.com/zh/patterns/bridge/) 桥接模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

## 介绍

桥接模式（Bridge Pattern）是一种结构型设计模式，用于将抽象与其实现分离，使它们可以独立地变化。桥接模式通过创建两个独立的层次结构，一个是抽象部分，一个是实现部分，来实现这种分离。

在桥接模式中，抽象部分包含抽象类或接口，定义了高层逻辑和功能。实现部分包含具体实现类，负责实现抽象部分定义的接口或方法。通过桥接模式，可以在两个层次结构中独立地扩展和变化类，而不会相互影响。同时，抽象部分和实现部分之间的耦合度降低，使系统更加灵活和可维护。

## 举例

考虑一下你拥有一种具有不同附魔的武器，并且应该允许将具有不同附魔的不同武器混合使用。 你会怎么做？ 为每个附魔创建每种武器的多个副本，还是只是创建单独的附魔并根据需要为武器设置它？ 桥接模式使您可以进行第二次操作。

翻译一下上面的武器示例。下面我们有武器的类层级：

```java
public interface Weapon {
  void wield();
  void swing();
  void unwield();
  Enchantment getEnchantment();
}

public class Sword implements Weapon {

  private final Enchantment enchantment;

  public Sword(Enchantment enchantment) {
    this.enchantment = enchantment;
  }

  @Override
  public void wield() {
    LOGGER.info("The sword is wielded.");
    enchantment.onActivate();
  }

  @Override
  public void swing() {
    LOGGER.info("The sword is swinged.");
    enchantment.apply();
  }

  @Override
  public void unwield() {
    LOGGER.info("The sword is unwielded.");
    enchantment.onDeactivate();
  }

  @Override
  public Enchantment getEnchantment() {
    return enchantment;
  }
}

public class Hammer implements Weapon {

  private final Enchantment enchantment;

  public Hammer(Enchantment enchantment) {
    this.enchantment = enchantment;
  }

  @Override
  public void wield() {
    LOGGER.info("The hammer is wielded.");
    enchantment.onActivate();
  }

  @Override
  public void swing() {
    LOGGER.info("The hammer is swinged.");
    enchantment.apply();
  }

  @Override
  public void unwield() {
    LOGGER.info("The hammer is unwielded.");
    enchantment.onDeactivate();
  }

  @Override
  public Enchantment getEnchantment() {
    return enchantment;
  }
}
```

这里是单独的附魔类结构：

```java
public interface Enchantment {
  void onActivate();
  void apply();
  void onDeactivate();
}

public class FlyingEnchantment implements Enchantment {

  @Override
  public void onActivate() {
    LOGGER.info("The item begins to glow faintly.");
  }

  @Override
  public void apply() {
    LOGGER.info("The item flies and strikes the enemies finally returning to owner's hand.");
  }

  @Override
  public void onDeactivate() {
    LOGGER.info("The item's glow fades.");
  }
}

public class SoulEatingEnchantment implements Enchantment {

  @Override
  public void onActivate() {
    LOGGER.info("The item spreads bloodlust.");
  }

  @Override
  public void apply() {
    LOGGER.info("The item eats the soul of enemies.");
  }

  @Override
  public void onDeactivate() {
    LOGGER.info("Bloodlust slowly disappears.");
  }
}
```

这里是两种层次结构的实践：

```java
var enchantedSword = new Sword(new SoulEatingEnchantment());
enchantedSword.wield();
enchantedSword.swing();
enchantedSword.unwield();
// The sword is wielded.
// The item spreads bloodlust.
// The sword is swinged.
// The item eats the soul of enemies.
// The sword is unwielded.
// Bloodlust slowly disappears.

var hammer = new Hammer(new FlyingEnchantment());
hammer.wield();
hammer.swing();
hammer.unwield();
// The hammer is wielded.
// The item begins to glow faintly.
// The hammer is swinged.
// The item flies and strikes the enemies finally returning to owner's hand.
// The hammer is unwielded.
// The item's glow fades.
```

## 类图

![alt text](https://java-design-patterns.com/assets/bridge.urm-1e709c16.png)

## 适用场景

桥接模式适用于以下情况：

1. 当你希望在**抽象部分**和**实现部分**之间存在独立的扩展和变化时，可以使用桥接模式。这样可以避免在两个层次结构之间的紧耦合关系，使它们可以相互独立地进行修改和扩展。
2. 当你想要避免在编译时将抽象部分与实现部分绑定在一起时，桥接模式是一个很好的选择。通过桥接模式，可以在**运行时动态地将抽象部分和实现部分进行组合**，而不需要修改客户端的代码。
3. 当你有**多个独立变化的维度**时，可以使用桥接模式。例如，在给定的示例中，武器和附魔是两个独立变化的维度，通过桥接模式可以灵活地组合它们，而不需要为每种武器和每种附魔创建大量的子类。

总的来说，桥接模式适用于需要在抽象与实现之间存在独立变化和组合的情况，以及需要动态地进行选择和共享实现的情况。它能够提高系统的灵活性、可扩展性和可维护性。

### 举例

以下是一个实际的例子，以帮助说明桥接模式的应用。

假设你正在开发一个绘图应用程序，其中包含不同类型的形状（如圆形、矩形）和不同的颜色（如红色、蓝色）。你希望能够在任意形状上应用不同的颜色，而不是为每种形状和颜色的组合创建大量的子类。

在这种情况下，可以使用桥接模式来实现形状和颜色之间的组合。首先，定义一个抽象的形状类 `Shape`，其中包含一个颜色对象的引用。然后，定义一个抽象的颜色类 `Color`，其中包含一个绘制方法。通过桥接模式，将形状和颜色进行分离，使它们可以独立地进行扩展和变化。

下面是示例代码：

```java
// 形状抽象类
abstract class Shape {
    protected Color color;

    public Shape(Color color) {
        this.color = color;
    }

    public abstract void draw();
}

// 颜色抽象类
interface Color {
    void applyColor();
}

// 具体形状类：圆形
class Circle extends Shape {
    public Circle(Color color) {
        super(color);
    }

    @Override
    public void draw() {
        System.out.print("绘制圆形，");
        color.applyColor();
    }
}

// 具体形状类：矩形
class Rectangle extends Shape {
    public Rectangle(Color color) {
        super(color);
    }

    @Override
    public void draw() {
        System.out.print("绘制矩形，");
        color.applyColor();
    }
}

// 具体颜色类：红色
class RedColor implements Color {
    @Override
    public void applyColor() {
        System.out.println("使用红色");
    }
}

// 具体颜色类：蓝色
class BlueColor implements Color {
    @Override
    public void applyColor() {
        System.out.println("使用蓝色");
    }
}
```

现在，你可以创建不同的形状对象，并将不同的颜色对象与之组合，而无需创建大量的子类。例如：

```java
Shape redCircle = new Circle(new RedColor());
Shape blueRectangle = new Rectangle(new BlueColor());

redCircle.draw(); // 输出：绘制圆形，使用红色
blueRectangle.draw(); // 输出：绘制矩形，使用蓝色
```

通过桥接模式，你可以轻松地扩展形状和颜色的种类，而不需要修改现有的代码。你可以添加新的形状或颜色类，并将它们组合在一起，以满足不同的需求，同时保持了形状和颜色之间的独立性。

### 开源框架中的应用

在开源框架中，有一些使用桥接模式的例子。以下是其中一些常见的开源框架和其使用桥接模式的示例：

1. JDBC（Java 数据库连接）框架：JDBC 框架是 Java 中用于与数据库进行交互的标准 API。在 JDBC 中，使用了桥接模式来连接不同的数据库驱动程序和应用程序。桥接模式将 JDBC API 与特定的数据库驱动程序实现分离，使得应用程序可以独立于不同的数据库实现进行开发。
2. AWT（Abstract Window Toolkit）：AWT 是 Java 中用于创建图形用户界面（GUI）的原始工具包。在 AWT 中，使用了桥接模式来分离抽象的 GUI 组件（例如按钮、文本框）和具体的平台实现。这样可以使得 AWT 可以在不同的操作系统上运行，并且可以根据不同的平台提供不同的外观和行为。
3. Spring 框架：Spring 是一个开源的 Java 企业应用程序开发框架。在 Spring 中，使用了桥接模式来实现不同层之间的解耦。例如，Spring 的数据访问模块（Spring Data）使用了桥接模式来连接不同的数据访问技术，如 JPA、Hibernate、MyBatis 等。这样，开发人员可以选择适合其需求的数据访问技术，而不需要修改其他部分的代码。
4. Apache Log4j：Log4j 框架使用了桥接模式将日志记录器（Logger）与具体的日志输出（Appender）分离。通过`Logger`接口和`Appender`接口的组合使用，可以在运行时动态地将日志记录器与不同的日志输出实现进行桥接。例如，可以将`Logger`桥接到`FileAppender`、`ConsoleAppender`或`DatabaseAppender`等不同的具体实现上。
5. Apache Commons IO：Commons IO 是 Apache Commons 项目的一部分，提供了一组用于处理 I/O 操作的实用工具。在 Commons IO 中，使用了桥接模式来分离抽象的 I/O 操作（如文件读写、流处理）和具体的实现。这使得开发人员可以在不同的环境中使用相同的 API 进行 I/O 操作。
6. Hibernate ORM：Hibernate 使用了桥接模式将不同数据库厂商的驱动程序与核心功能分离。它通过`DriverManager`接口和具体的数据库驱动程序实现的桥接，能够在运行时动态地选择和切换数据库驱动程序。这样，开发人员可以使用相同的 Hibernate API 与不同的数据库进行交互，而不需要修改核心代码。
7. Retrofit：Retrofit 库使用了桥接模式来将网络请求的抽象表示与具体的 HTTP 客户端实现分离。它通过`Call`接口和`HttpClient`接口的组合使用，可以将不同的 HTTP 客户端库（如 OkHttp、Apache HttpClient）桥接到统一的网络请求抽象上。这使得开发人员可以根据需要选择不同的 HTTP 客户端实现，而不需要修改使用 Retrofit 的代码。
8. Apache HttpClient：HttpClient 是 Apache 软件基金会提供的一个用于发送 HTTP 请求的 Java 库。它使用了桥接模式来将抽象的 HTTP 请求和具体的 HTTP 协议实现（如 HTTP/1.1 或 HTTP/2）分离。这使得开发人员可以根据需要选择不同的 HTTP 协议版本，而不需要修改代码。
9. Apache Commons Logging：Commons Logging 是 Apache Commons 项目中的一个通用日志记录接口。它使用了桥接模式来将应用程序代码与底层的具体日志实现（如 Log4j、java.util.logging 等）分离。这使得开发人员可以在不同的环境中切换和配置不同的日志实现。

以下是一个简单的示例代码，演示了桥接模式在 JDBC 框架中的应用：

首先，定义桥接接口 `DatabaseDriver`，它包含了数据库操作的方法声明：

```java
public interface DatabaseDriver {
    void connect(String url, String username, String password);
    void executeQuery(String query);
    void disconnect();
}
```

然后，实现具体的数据库驱动程序，例如 `MySQLDriver` 和 `OracleDriver`，它们实现了 `DatabaseDriver` 接口：

```java
public class MySQLDriver implements DatabaseDriver {
    // MySQL数据库特定的实现代码

    @Override
    public void connect(String url, String username, String password) {
        // 连接MySQL数据库的代码
    }

    @Override
    public void executeQuery(String query) {
        // 执行MySQL查询的代码
    }

    @Override
    public void disconnect() {
        // 断开MySQL数据库连接的代码
    }
}

public class OracleDriver implements DatabaseDriver {
    // Oracle数据库特定的实现代码

    @Override
    public void connect(String url, String username, String password) {
        // 连接Oracle数据库的代码
    }

    @Override
    public void executeQuery(String query) {
        // 执行Oracle查询的代码
    }

    @Override
    public void disconnect() {
        // 断开Oracle数据库连接的代码
    }
}
```

接下来，定义使用桥接模式的应用程序代码，其中包含了一个 `Database` 类作为抽象化角色，它使用桥接接口 `DatabaseDriver` 进行数据库操作：

```java
public class Database {
    private DatabaseDriver driver;

    public Database(DatabaseDriver driver) {
        this.driver = driver;
    }

    public void connectToDatabase(String url, String username, String password) {
        driver.connect(url, username, password);
    }

    public void executeQuery(String query) {
        driver.executeQuery(query);
    }

    public void disconnectFromDatabase() {
        driver.disconnect();
    }
}
```

最后，可以在应用程序中使用这些类进行数据库操作：

```java
public class Main {
    public static void main(String[] args) {
        // 创建MySQLDriver实例
        DatabaseDriver mysqlDriver = new MySQLDriver();

        // 创建Database实例，并使用MySQLDriver进行操作
        Database mysqlDatabase = new Database(mysqlDriver);

        // 连接到MySQL数据库
        mysqlDatabase.connectToDatabase("jdbc:mysql://localhost:3306/mydb", "username", "password");

        // 执行MySQL查询
        mysqlDatabase.executeQuery("SELECT * FROM mytable");

        // 断开MySQL数据库连接
        mysqlDatabase.disconnectFromDatabase();

        // 创建OracleDriver实例
        DatabaseDriver oracleDriver = new OracleDriver();

        // 创建Database实例，并使用OracleDriver进行操作
        Database oracleDatabase = new Database(oracleDriver);

        // 连接到Oracle数据库
        oracleDatabase.connectToDatabase("jdbc:oracle:thin:@localhost:1521:xe", "username", "password");

        // 执行Oracle查询
        oracleDatabase.executeQuery("SELECT * FROM mytable");

        // 断开Oracle数据库连接
        oracleDatabase.disconnectFromDatabase();
    }
}
```

这个例子展示了如何使用桥接模式将 JDBC API 与特定的数据库驱动程序实现分离。通过创建不同的数据库驱动程序实例，并将其传递给 `Database` 类，应用程序可以独立于不同的数据库实现进行开发和操作。

## 参考文章

- https://www.digitalocean.com/community/tutorials/bridge-design-pattern-java
