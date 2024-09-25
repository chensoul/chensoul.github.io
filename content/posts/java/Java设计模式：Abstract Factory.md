---
title: "Java设计模式：Abstract Factory"
date: 2023-05-22
slug: java-design-patterns-abstract-factory
categories: ["Java"]
tags: [java]
---

本文主要介绍 Abstract Factory 模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

> [Java Design Patterns](https://java-design-patterns.com/) 提供了各种 Java 设计模式的介绍、示例代码和用例说明。该网站旨在帮助 Java 开发人员了解和应用各种常见的设计模式，以提高代码的可读性、可维护性和可扩展性。
>
> Java Design Patterns 网站提供了多种设计模式分类方式，包括创建型模式（Creational Patterns）、结构型模式（Structural Patterns）和行为型模式（Behavioral Patterns），以及其他一些常见的模式。
>
> 对于每个设计模式，该网站提供了详细的介绍、示例代码和用例说明，并且提供了一些常见的使用场景和注意事项。开发人员可以根据自己的需求选择适合自己的设计模式，并且可以参考示例代码和用例说明来理解和应用该模式。
>
> 此外，Java Design Patterns 网站还提供了一些其他资源，如设计模式的 UML 图、设计模式的优缺点、设计模式的比较等。这些资源可以帮助开发人员更好地理解和应用设计模式。
>
> 中文网站：[https://java-design-patterns.com/zh/](https://java-design-patterns.com/zh/)
>
> Github 上源码仓库（非官方）：[https://github.com/iluwatar/java-design-patterns](https://github.com/iluwatar/java-design-patterns)

## 目的

抽象工厂（Abstract Factory）是一种创建型设计模式，它提供了一种方式来创建一系列相关或依赖对象的家族，而无需指定它们具体的类。

抽象工厂模式使用一个抽象工厂接口来定义一组相关的工厂方法，每个工厂方法都能够创建一组相关的产品。具体的工厂实现了这个接口，并能够创建具体的产品。客户端代码只需要使用抽象工厂接口来创建产品，而不需要关心具体的产品实现。

## 解释

真实世界例子

> 要创建一个王国，我们需要具有共同主题的对象。精灵王国需要精灵国王、精灵城堡和精灵军队，而兽人王国需要兽人国王、兽人城堡和兽人军队。王国中的对象之间存在依赖关系。

通俗的说

> 工厂的工厂； 一个将单个但相关/从属的工厂分组在一起而没有指定其具体类别的工厂。

维基百科上说

> 抽象工厂模式提供了一种封装一组具有共同主题的单个工厂而无需指定其具体类的方法

**程序示例**

翻译上面的王国示例。 首先，我们为王国中的对象提供了一些接口和实现。

```java
public interface Castle {
  String getDescription();
}

public interface King {
  String getDescription();
}

public interface Army {
  String getDescription();
}

// Elven implementations ->
public class ElfCastle implements Castle {
  static final String DESCRIPTION = "This is the Elven castle!";
  @Override
  public String getDescription() {
    return DESCRIPTION;
  }
}
public class ElfKing implements King {
  static final String DESCRIPTION = "This is the Elven king!";
  @Override
  public String getDescription() {
    return DESCRIPTION;
  }
}
public class ElfArmy implements Army {
  static final String DESCRIPTION = "This is the Elven Army!";
  @Override
  public String getDescription() {
    return DESCRIPTION;
  }
}

// Orcish implementations similarly -> ...
```

然后我们有了王国工厂的抽象和实现

```java
public interface KingdomFactory {
  Castle createCastle();
  King createKing();
  Army createArmy();
}

public class ElfKingdomFactory implements KingdomFactory {
  public Castle createCastle() {
    return new ElfCastle();
  }
  public King createKing() {
    return new ElfKing();
  }
  public Army createArmy() {
    return new ElfArmy();
  }
}

public class OrcKingdomFactory implements KingdomFactory {
  public Castle createCastle() {
    return new OrcCastle();
  }
  public King createKing() {
    return new OrcKing();
  }
  public Army createArmy() {
    return new OrcArmy();
  }
}
```

现在我们有了抽象工厂，使我们可以制作相关对象的系列，即精灵王国工厂创建了精灵城堡，国王和军队等。

```java
KingdomFactory factory = new ElfKingdomFactory();
Castle castle = factory.createCastle();
King king = factory.createKing();
Army army = factory.createArmy();

castle.getDescription();
king.getDescription();
army.getDescription();
```

程序输出:

```java
This is the Elven castle!
This is the Elven king!
This is the Elven Army!
```

现在，我们可以为不同的王国工厂设计工厂。 在此示例中，我们创建了 FactoryMaker，负责返回 ElfKingdomFactory 或 OrcKingdomFactory 的实例。 客户可以使用 FactoryMaker 来创建所需的具体工厂，该工厂随后将生产不同的具体对象（军队，国王，城堡）。 在此示例中，我们还使用了一个枚举来参数化客户要求的王国工厂类型。

```java
public static class FactoryMaker {

    public enum KingdomType {
        ELF, ORC
    }

    public static KingdomFactory makeFactory(KingdomType type) {
        return switch (type) {
            case ELF -> new ElfKingdomFactory();
            case ORC -> new OrcKingdomFactory();
            default -> throw new IllegalArgumentException("KingdomType not supported.");
        };
    }
}

@Slf4j
public class App{
  private final Kingdom kingdom = new Kingdom();

  public Kingdom getKingdom() {
    return kingdom;
  }

  public static void main(String[] args) {
    App app = new App();
    LOGGER.info("elf kingdom");
    createKingdom(KingdomType.ELF);
    LOGGER.info(kingdom.getArmy().getDescription());
    LOGGER.info(kingdom.getCastle().getDescription());
    LOGGER.info(kingdom.getKing().getDescription());

    LOGGER.info("orc kingdom");
    createKingdom(KingdomType.ORC);
    LOGGER.info(kingdom.getArmy().getDescription());
    LOGGER.info(kingdom.getCastle().getDescription());
    LOGGER.info(kingdom.getKing().getDescription());
  }
}
```

## 类图

![alt text](https://java-design-patterns.com/assets/abstract-factory.urm-fe0340de.png)

## 优缺点

优点包括：

1. 抽象工厂模式能够帮助我们创建具有高内聚性的对象家族，这些对象家族之间相互协作，从而构成一个完整的系统。
2. 抽象工厂模式能够保证客户端代码与具体产品实现之间的解耦，从而让系统更加灵活和可扩展。
3. 抽象工厂模式能够隐藏产品的具体实现细节，从而提高系统的安全性和稳定性。

而缺点则包括：

1. 抽象工厂模式比较复杂，需要定义许多接口和抽象类，这会增加系统的复杂性和开发成本。
2. 如果需要添加新的产品族，那么就需要修改抽象工厂接口以及所有的具体工厂实现，这会带来一定的风险和不便。
3. 抽象工厂模式可能会导致系统的扩展性受限，因为一旦定义了抽象工厂接口，就不能够轻易地修改它。

在《Effective Java》中，作者还提到了一个关于抽象工厂模式的建议：在设计抽象工厂接口时，要考虑到未来可能的变化。例如，如果我们预计将来可能会添加新的产品族，那么就应该尽量设计一个灵活的抽象工厂接口，以便在不修改现有代码的情况下添加新的产品族。

举例：[Abstract Factory Design Pattern in Java](https://www.digitalocean.com/community/tutorials/abstract-factory-design-pattern-in-java)

Computer.java：

```java
 public abstract class Computer {
    public abstract String getRAM();
    public abstract String getHDD();
    public abstract String getCPU();

    @Override
    public String toString(){
        return "RAM= "+this.getRAM()+", HDD="+this.getHDD()+", CPU="+this.getCPU();
    }
}
```

PC.java：

```java
public class PC extends Computer {
    private String ram;
    private String hdd;
    private String cpu;

    public PC(String ram, String hdd, String cpu){
        this.ram=ram;
        this.hdd=hdd;
        this.cpu=cpu;
    }
    @Override
    public String getRAM() {
        return this.ram;
    }

    @Override
    public String getHDD() {
        return this.hdd;
    }

    @Override
    public String getCPU() {
        return this.cpu;
    }

}
```

Server.java：

```java
public class Server extends Computer {
    private String ram;
    private String hdd;
    private String cpu;

    public Server(String ram, String hdd, String cpu){
        this.ram=ram;
        this.hdd=hdd;
        this.cpu=cpu;
    }
    @Override
    public String getRAM() {
        return this.ram;
    }

    @Override
    public String getHDD() {
        return this.hdd;
    }

    @Override
    public String getCPU() {
        return this.cpu;
    }
}
```

抽象工厂方法：

```java
public interface ComputerAbstractFactory {
	public Computer createComputer();
}

public class PCFactory implements ComputerAbstractFactory {
	private String ram;
	private String hdd;
	private String cpu;

	public PCFactory(String ram, String hdd, String cpu){
		this.ram=ram;
		this.hdd=hdd;
		this.cpu=cpu;
	}
	@Override
	public Computer createComputer() {
		return new PC(ram,hdd,cpu);
	}
}

public class ServerFactory implements ComputerAbstractFactory {
	private String ram;
	private String hdd;
	private String cpu;

	public ServerFactory(String ram, String hdd, String cpu){
		this.ram=ram;
		this.hdd=hdd;
		this.cpu=cpu;
	}

	@Override
	public Computer createComputer() {
		return new Server(ram,hdd,cpu);
	}
}
```

工厂类：

```java
public class ComputerFactory {
	public static Computer getComputer(ComputerAbstractFactory factory){
		return factory.createComputer();
	}
}
```

测试：

```java
public class TestDesignPatterns {
	public static void main(String[] args) {
		testAbstractFactory();
	}

	private static void testAbstractFactory() {
		Computer pc = ComputerFactory.getComputer(new PCFactory("2 GB","500 GB","2.4 GHz"));
		Computer server = ComputerFactory.getComputer(new ServerFactory("16 GB","1 TB","2.9 GHz"));
		System.out.println("AbstractFactory PC Config::"+pc);
		System.out.println("AbstractFactory Server Config::"+server);
	}
}
```

输出结果：

```bash
AbstractFactory PC Config::RAM= 2 GB, HDD=500 GB, CPU=2.4 GHz
AbstractFactory Server Config::RAM= 16 GB, HDD=1 TB, CPU=2.9 GHz
```

## 适用性

在以下情况下使用抽象工厂模式

- 该系统应独立于其产品的创建，组成和表示方式
- 系统应配置有多个产品系列之一
- 相关产品对象系列旨在一起使用，你需要强制执行此约束
- 你想提供产品的类库，并且只想暴露它们的接口，而不是它们的实现。
- 从概念上讲，依赖项的生存期比使用者的生存期短。
- 你需要一个运行时值来构建特定的依赖关系
- 你想决定在运行时从系列中调用哪种产品。
- 你需要提供一个或更多仅在运行时才知道的参数，然后才能解决依赖关系。
- 当你需要产品之间的一致性时
- 在向程序添加新产品或产品系列时，您不想更改现有代码。

## 相关模式

- [Factory Method](https://java-design-patterns.com/patterns/factory-method/)
- [Factory Kit](https://java-design-patterns.com/patterns/factory-kit/)

## 使用

jdk 中以下类使用了抽象工厂模式：

- [javax.xml.parsers.DocumentBuilderFactoryopen](http://docs.oracle.com/javase/8/docs/api/javax/xml/parsers/DocumentBuilderFactory.html)
- [javax.xml.transform.TransformerFactoryopen](http://docs.oracle.com/javase/8/docs/api/javax/xml/transform/TransformerFactory.html#newInstance--)
- [javax.xml.xpath.XPathFactoryopen](http://docs.oracle.com/javase/8/docs/api/javax/xml/xpath/XPathFactory.html#newInstance--)

以下是一些常见的开源框架和库：

1. Spring Framework：Spring Framework 是一个流行的 Java 应用程序框架，它使用了抽象工厂模式来创建不同类型的对象，例如数据源、事务管理器和消息队列等。
2. Hibernate ORM：Hibernate ORM 是一个用于管理对象关系映射（ORM）的框架，它使用了抽象工厂模式来创建数据库连接、事务管理器和查询语句等对象。
3. Apache Commons：Apache Commons 是一个开源的 Java 工具库，它包含了许多常用的工具类和函数。其中，一些模块（例如 Commons Codec 和 Commons Pool）使用了抽象工厂模式来创建不同类型的对象。
4. Apache Struts：Apache Struts 是一个基于 MVC（模型-视图-控制器）模式的 Web 应用程序框架，它使用了抽象工厂模式来创建不同类型的 Action 类和结果类型。
5. Apache CXF：Apache CXF 是一个用于构建 Web 服务的框架，它使用了抽象工厂模式来创建不同类型的 Web 服务端点和客户端。
6. Apache Axis：Apache Axis 是一个用于构建 Web 服务的框架，它使用了抽象工厂模式来创建不同类型的 Web 服务端点和客户端。
7. Apache Log4j：Apache Log4j 是一个流行的 Java 日志框架，它使用了抽象工厂模式来创建不同类型的日志记录器和 Appender（日志输出器）。
8. Apache Commons Configuration：Apache Commons Configuration 是一个用于读取和写入配置文件的库，它使用了抽象工厂模式来创建不同类型的配置对象，例如 XMLConfiguration 和 PropertiesConfiguration 等。

除此之外，许多其他的开源框架和库也使用了抽象工厂模式，例如 Hibernate、MyBatis、JDBC、JPA、JUnit 等。这些框架和库使用抽象工厂模式的原因是它能够帮助创建具有高内聚性的对象家族，并且能够保证客户端代码与具体产品实现之间的解耦。同时，抽象工厂模式也能够隐藏产品的具体实现细节，从而提高系统的安全性和稳定性。这些优点让抽象工厂模式成为了这些框架和库中常用的设计模式之一。
