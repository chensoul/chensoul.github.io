---
title: "Java设计模式：Visitor"
date: 2023-06-02T09:00:00+08:00
slug: java-design-patterns-visitor
categories: ["Notes"]
tags: [java]
draft: false
---



本文主要介绍 Visitor 模式，在 [Java Design Patterns](https://java-design-patterns.com/)  网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。



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

表示要在对象结构的元素上执行的操作。访问者可让你定义新操作，而无需更改其所操作元素的类。

> 访问者模式的主要目的是在不改变对象结构的前提下，对对象结构中的元素进行新的操作。它通过将操作从对象结构中分离出来，使得可以独立地添加、修改或删除对元素的操作，而不需要修改元素类或对象结构。
>
> 访问者模式的另一个目的是将对象结构与操作解耦。在访问者模式中，元素和操作分别由不同的类来实现，并且元素只暴露出接受访问者对象的接口，而不是暴露出具体的实现细节。这样可以避免在元素类中添加过多的行为，从而提高代码的可扩展性和可维护性。
>
> 最后，访问者模式还可以用于实现对复杂对象结构的遍历。通过访问者对象的递归调用，可以遍历整个对象结构，并对每个元素执行相应的操作。这种遍历方式可以方便地实现对复杂对象结构的分析和处理。



## 解释

真实世界例子

> 考虑有一个带有军队单位的树形结构。指挥官下有两名中士，每名中士下有三名士兵。基于这个层级结构实现访问者模式，我们可以轻松创建与指挥官，中士，士兵或所有人员互动的新对象

通俗的说

> 访问者模式定义可以在数据结构的节点上执行的操作。

维基百科说

> 在面向对象的程序设计和软件工程中，访问者设计模式是一种将算法与操作对象的结构分离的方法。这种分离的实际结果是能够在不修改结构的情况下向现有对象结构添加新操作。

访问者模式是一种行为型设计模式，它允许在不改变对象结构的情况下定义新的操作。该模式的核心思想是将操作从对象结构中分离出来，并在独立的访问者对象中进行实现。

访问者模式由以下几个关键元素组成：

1. 抽象访问者（Visitor）：定义可以访问不同类型元素的方法，该方法的参数类型为具体元素类型。
2. 具体访问者（ConcreteVisitor）：实现抽象访问者中定义的方法，以实现对元素的不同操作。
3. 抽象元素（Element）：定义接受访问者对象的方法。
4. 具体元素（ConcreteElement）：实现抽象元素中定义的方法，以便可以接受访问者对象的访问。
5. 对象结构（Object Structure）：包含一组具体元素，可以被访问者对象遍历。

**程序示例**

使用上面的军队单元的例子，我们首先由单位和单位访问器类型。

```java
public abstract class Unit {

  private final Unit[] children;

  public Unit(Unit... children) {
    this.children = children;
  }

  public void accept(UnitVisitor visitor) {
    Arrays.stream(children).forEach(child -> child.accept(visitor));
  }
}

public interface UnitVisitor {

  void visitSoldier(Soldier soldier);

  void visitSergeant(Sergeant sergeant);

  void visitCommander(Commander commander);
}
```

然后我们有具体的单元。

```java
public class Commander extends Unit {

  public Commander(Unit... children) {
    super(children);
  }

  @Override
  public void accept(UnitVisitor visitor) {
    visitor.visitCommander(this);
    super.accept(visitor);
  }

  @Override
  public String toString() {
    return "commander";
  }
}

public class Sergeant extends Unit {

  public Sergeant(Unit... children) {
    super(children);
  }

  @Override
  public void accept(UnitVisitor visitor) {
    visitor.visitSergeant(this);
    super.accept(visitor);
  }

  @Override
  public String toString() {
    return "sergeant";
  }
}

public class Soldier extends Unit {

  public Soldier(Unit... children) {
    super(children);
  }

  @Override
  public void accept(UnitVisitor visitor) {
    visitor.visitSoldier(this);
    super.accept(visitor);
  }

  @Override
  public String toString() {
    return "soldier";
  }
}
```

然后有一些具体的访问者。

```java
public class CommanderVisitor implements UnitVisitor {

  private static final Logger LOGGER = LoggerFactory.getLogger(CommanderVisitor.class);

  @Override
  public void visitSoldier(Soldier soldier) {
    // Do nothing
  }

  @Override
  public void visitSergeant(Sergeant sergeant) {
    // Do nothing
  }

  @Override
  public void visitCommander(Commander commander) {
    LOGGER.info("Good to see you {}", commander);
  }
}

public class SergeantVisitor implements UnitVisitor {

  private static final Logger LOGGER = LoggerFactory.getLogger(SergeantVisitor.class);

  @Override
  public void visitSoldier(Soldier soldier) {
    // Do nothing
  }

  @Override
  public void visitSergeant(Sergeant sergeant) {
    LOGGER.info("Hello {}", sergeant);
  }

  @Override
  public void visitCommander(Commander commander) {
    // Do nothing
  }
}

public class SoldierVisitor implements UnitVisitor {

  private static final Logger LOGGER = LoggerFactory.getLogger(SoldierVisitor.class);

  @Override
  public void visitSoldier(Soldier soldier) {
    LOGGER.info("Greetings {}", soldier);
  }

  @Override
  public void visitSergeant(Sergeant sergeant) {
    // Do nothing
  }

  @Override
  public void visitCommander(Commander commander) {
    // Do nothing
  }
}
```

最后，来看看实践中访问者模式的力量。

```java
commander.accept(new SoldierVisitor());
commander.accept(new SergeantVisitor());
commander.accept(new CommanderVisitor());
```

程序输出:

```bash
Greetings soldier
Greetings soldier
Greetings soldier
Greetings soldier
Greetings soldier
Greetings soldier
Hello sergeant
Hello sergeant
Good to see you commander
```

## 类图

![alt text](https://java-design-patterns.com/assets/visitor_1-c6c51c6b.png)

## 优缺点

访问者模式的优点：

1. 扩展性好：访问者模式可以通过增加新的访问者类来扩展对对象结构的操作，而无需修改对象结构或元素类。
2. 分离关注点：访问者模式将对象结构和对对象结构的操作分离开来，使得对象结构和访问者类可以独立发展。这样可以提高代码的复用性和可维护性。
3. 灵活性高：访问者模式可以支持不同的访问者对象对同一对象结构进行不同的遍历和操作，从而可以实现多种不同的处理方式。
4. 符合开闭原则：访问者模式可以通过增加新的元素类和访问者类来扩展系统的功能，而不需要修改现有的代码。

访问者模式的缺点：

1. 实现复杂：访问者模式的实现比较复杂，需要定义多个接口和类，并且需要对对象结构进行重构。
2. 违反封装原则：访问者模式需要将访问者对象暴露给元素类，从而破坏了元素类的封装性。
3. 可能会导致性能问题：访问者模式需要对整个对象结构进行遍历，可能会导致性能问题。
4. 不易理解：访问者模式的实现比较抽象，可能会导致代码的可读性和可维护性降低。

总之，访问者模式可以提高系统的扩展性和灵活性，但是需要注意实现的复杂性和性能问题，并且需要权衡封装性和可读性之间的关系。在实际开发中，应该根据具体的需求和场景来选择是否使用访问者模式。

## 对比

访问者模式和 Acyclic Visitor 设计模式都是用于处理对象结构中的元素，但它们的实现方式和应用场景有所不同。

访问者模式通过在元素类中定义一个 accept 方法，接受一个访问者对象作为参数，从而将元素的处理委托给访问者对象来完成。访问者对象通常定义了多个 visit 方法，分别对应不同类型的元素，从而可以根据元素的类型来执行不同的操作。

Acyclic Visitor 设计模式是访问者模式的一种变种，它通过在访问者类中定义抽象访问者类和具体访问者类来实现。抽象访问者类定义了 visit 方法，但不包含任何具体的 visit 方法实现，而具体访问者类则实现了具体的 visit 方法。这样可以避免访问者对象对元素类的依赖，从而实现松耦合。

Acyclic Visitor 设计模式通常用于处理多继承的对象结构，因为多继承可能会导致访问者对象对元素类的依赖。在多继承的情况下，元素类可能同时继承了多个接口或父类，这样访问者对象就需要对每个接口或父类都定义一个 visit 方法，从而导致访问者对象对元素类的依赖性增加。

总之，访问者模式和 Acyclic Visitor 设计模式都是用于处理对象结构中的元素，但它们的实现方式和应用场景有所不同。访问者模式适用于处理单继承的对象结构，而 Acyclic Visitor 设计模式适用于处理多继承的对象结构。在实际应用中，应该根据具体的需求和场景来选择使用哪种模式。

## 适用场景

访问者模式适用于以下情况：

1. 对象结构复杂，包含多种类型的元素，并且需要对这些元素进行不同的操作。
2. 需要在不改变对象结构的前提下，增加、修改或删除对元素的操作。
3. 对象结构中的元素类经常发生变化，而访问者类的变化较少。
4. 需要对对象结构进行多种不同的遍历方式，并且每种遍历方式需要执行不同的操作。
5. 对象结构中的元素类不希望暴露出太多的行为，而是希望将行为封装在访问者类中。

需要注意的是，访问者模式的实现比较复杂，因此只有在确实需要对对象结构进行复杂操作时才应该考虑使用该模式。如果仅需要对对象结构进行简单的遍历或操作，则可以考虑使用其他模式，如迭代器模式或组合模式。



以下是一些访问者模式在实际开发中的应用场景：

1. 编译器和解释器：访问者模式可以用于实现编译器和解释器。编译器和解释器都需要对抽象语法树（AST）进行遍历，并根据不同的节点类型执行不同的操作。访问者模式可以将这些操作封装在不同的访问者类中，从而实现对AST的遍历和处理。
2. 数据库查询：访问者模式可以用于实现数据库查询。数据库查询需要对查询语句进行解析，并将查询转换为对数据库中的表进行操作的语句。访问者模式可以将查询解析和转换操作封装在不同的访问者类中，从而实现对查询语句的处理。
3. GUI框架：访问者模式可以用于实现GUI框架。GUI框架需要对各种GUI组件进行遍历，并根据不同的组件类型执行不同的操作。访问者模式可以将这些操作封装在不同的访问者类中，从而实现对GUI组件的遍历和处理。
4. 订单处理系统：访问者模式可以用于实现订单处理系统。订单处理系统需要对订单中的各种项进行遍历，并根据不同的项类型执行不同的操作。访问者模式可以将这些操作封装在不同的访问者类中，从而实现对订单的遍历和处理。
5. 机器学习：访问者模式可以用于实现机器学习算法。机器学习算法需要对数据集进行遍历，并根据不同的数据类型执行不同的操作。访问者模式可以将这些操作封装在不同的访问者类中，从而实现对数据集的遍历和处理。
6. 虚拟机：访问者模式可以用于实现虚拟机。虚拟机需要对字节码或中间代码进行遍历，并根据不同的指令类型执行不同的操作。访问者模式可以将这些操作封装在不同的访问者类中，从而实现对字节码或中间代码的遍历和处理。
7. 多媒体编解码器：访问者模式可以用于实现多媒体编解码器。多媒体编解码器需要对音视频数据进行遍历，并根据不同的数据类型执行不同的编解码操作。访问者模式可以将这些操作封装在不同的访问者类中，从而实现对音视频数据的遍历和处理。
8. 图像处理软件：访问者模式可以用于实现图像处理软件。图像处理软件需要对图像进行遍历，并根据不同的像素类型执行不同的处理操作。访问者模式可以将这些操作封装在不同的访问者类中，从而实现对图像的遍历和处理。
9. 网络协议解析器：访问者模式可以用于实现网络协议解析器。网络协议解析器需要对网络数据包进行遍历，并根据不同的协议类型执行不同的解析操作。访问者模式可以将这些操作封装在不同的访问者类中，从而实现对网络数据包的遍历和处理。
10. CAD软件：访问者模式可以用于实现CAD软件。CAD软件需要对绘图元素进行遍历，并根据不同的元素类型执行不同的操作，比如绘制线条、填充颜色等。访问者模式可以将这些操作封装在不同的访问者类中，从而实现对绘图元素的遍历和处理。
11. 代码生成器：访问者模式可以用于实现代码生成器。代码生成器需要对抽象语法树（AST）进行遍历，并根据不同的节点类型生成不同的代码。访问者模式可以将代码生成操作封装在不同的访问者类中，从而实现对AST的遍历和代码生成。
12. 环境监测系统：访问者模式可以用于实现环境监测系统。环境监测系统需要对多个传感器采集的数据进行遍历，并根据不同的传感器类型执行不同的处理操作，比如温度校准、数据存储等。访问者模式可以将这些操作封装在不同的访问者类中，从而实现对传感器数据的遍历和处理。
13. 数字信号处理系统：访问者模式可以用于实现数字信号处理系统。数字信号处理系统需要对数字信号进行遍历，并根据不同的信号类型执行不同的处理操作，比如滤波、降噪等。访问者模式可以将这些操作封装在不同的访问者类中，从而实现对数字信号的遍历和处理。



访问者模式在 JDK 中有多个应用，以下是其中一些例子：

1. Java 中的 java.nio.file.FileVisitor 接口和 java.nio.file.Files#walkFileTree 方法，其中的 FileVisitor 接口定义了多个 visit 方法，用于访问文件树中的各个节点对象。Files#walkFileTree 方法可以通过访问者模式来实现遍历文件树并对每个文件进行处理。
2. javax.lang.model.element.AnnotationValueVisitor 接口，用于访问注解值的各种类型，例如基本类型、字符串、枚举类型、数组类型和嵌套注解类型等。该接口中定义了多个 visit 方法，用于处理不同类型的注解值。
3. javax.lang.model.element.ElementVisitor 接口，用于访问程序元素的各种类型，例如包、类、方法、字段、注解和注解值等。该接口中定义了多个 visit 方法，用于处理不同类型的程序元素。
4. javax.lang.model.type.TypeVisitor 接口，用于访问类型的各种类型，例如基本类型、对象类型、数组类型和泛型类型等。该接口中定义了多个 visit 方法，用于处理不同类型的类型。

总之，访问者模式可以适用于各种不同的领域和场景，只要需要对对象结构进行遍历和处理，都可以考虑使用该模式。



## 举例

### 计算图形面积和周长

假设我们有一个图形类 Shape，它有两个子类 Circle 和 Rectangle，我们需要对它们进行面积和周长的计算。我们可以使用访问者模式来实现这个功能。

我们首先定义一个抽象访问者类 ShapeVisitor，它包含了两个抽象方法 visitCircle 和 visitRectangle，分别用于访问 Circle 和 Rectangle 对象。

```java
// 抽象访问者类
interface ShapeVisitor {
    void visitCircle(Circle circle);
    void visitRectangle(Rectangle rectangle);
}
```

然后我们定义一个抽象的图形类 Shape，它包含一个 accept 方法，用于接受一个访问者对象作为参数。

```java
// 抽象图形类
abstract class Shape {
    abstract void accept(ShapeVisitor visitor);
}
```

接着我们定义两个具体的图形类 Circle 和 Rectangle，它们实现了 accept 方法，并在其中调用访问者对象的 visitCircle 和 visitRectangle 方法。

```java
// 具体图形类 Circle
class Circle extends Shape {
    private double radius;

    Circle(double radius) {
        this.radius = radius;
    }

    double getRadius() {
        return radius;
    }

    @Override
    void accept(ShapeVisitor visitor) {
        visitor.visitCircle(this);
    }
}

// 具体图形类 Rectangle
class Rectangle extends Shape {
    private double width;
    private double height;

    Rectangle(double width, double height) {
        this.width = width;
        this.height = height;
    }

    double getWidth() {
        return width;
    }

    double getHeight() {
        return height;
    }

    @Override
    void accept(ShapeVisitor visitor) {
        visitor.visitRectangle(this);
    }
}
```

最后我们定义一个具体的访问者类 ShapeCalculator，它实现了 ShapeVisitor 接口，并在其中实现了 visitCircle 和 visitRectangle 方法，用于计算图形的面积和周长。

```java
// 具体访问者类 ShapeCalculator
class ShapeCalculator implements ShapeVisitor {
    private double area;
    private double perimeter;

    @Override
    public void visitCircle(Circle circle) {
        double radius = circle.getRadius();
        area = Math.PI * radius * radius;
        perimeter = 2 * Math.PI * radius;
    }

    @Override
    public void visitRectangle(Rectangle rectangle) {
        double width = rectangle.getWidth();
        double height = rectangle.getHeight();
        area = width * height;
        perimeter = 2 * (width + height);
    }

    double getArea() {
        return area;
    }

    double getPerimeter() {
        return perimeter;
    }
}
```

现在我们可以使用访问者模式来计算图形的面积和周长了。我们先创建一个 ShapeCalculator 对象，然后分别创建一个 Circle 对象和一个 Rectangle 对象，并调用它们的 accept 方法，将 ShapeCalculator 作为参数传入。

```java
public class Main {
    public static void main(String[] args) {
        ShapeCalculator calculator = new ShapeCalculator();

        Circle circle = new Circle(5.0);
        circle.accept(calculator);
        System.out.println("Circle area: " + calculator.getArea());
        System.out.println("Circle perimeter: " + calculator.getPerimeter());

        Rectangle rectangle = new Rectangle(3.0, 4.0);
        rectangle.accept(calculator);
        System.out.println("Rectangle area: " + calculator.getArea());
        System.out.println("Rectangle perimeter: " + calculator.getPerimeter());
    }
}
```

输出结果如下：

```bash
Circle area: 78.53981633974483
Circle perimeter: 31.41592653589793
Rectangle area: 12.0
Rectangle perimeter: 14.0
```

这个例子展示了如何使用访问者模式来计算图形的面积和周长，我们将计算的逻辑封装在了 ShapeCalculator 类中，并通过访问者模式将它们应用于不同的图形对象。这样可以实现代码的重用和可维护性。

### 实现代码生成器

访问者模式可以用于实现代码生成器，下面是一个简单的例子：

假设我们需要根据一个语法树生成相应的代码，语法树中包含了不同类型的节点，每个节点代表一个语法结构。我们可以使用访问者模式来实现这个功能，将语法树中的每个节点都作为一个元素，访问者对象则负责生成相应的代码。

我们首先定义一个抽象访问者类 CodeGenerator，它包含了多个抽象方法，每个方法对应一个节点类型，用于生成相应的代码。

```java
// 抽象访问者类
interface CodeGenerator {
    void generate(ProgramNode node);
    void generate(StatementNode node);
    void generate(ExpressionNode node);
    // ...
}
```

然后我们定义一个抽象的节点类 Node，它包含一个 accept 方法，用于接受一个访问者对象作为参数。

```java
// 抽象节点类
abstract class Node {
    abstract void accept(CodeGenerator generator);
}
```

接着我们定义多个具体的节点类 ProgramNode、StatementNode 和 ExpressionNode，它们实现了 accept 方法，并在其中调用访问者对象的相应方法。

```java
// 具体节点类 ProgramNode
class ProgramNode extends Node {
    private List<Node> children = new ArrayList<>();

    void add(Node node) {
        children.add(node);
    }

    @Override
    void accept(CodeGenerator generator) {
        generator.generate(this);
        for (Node child : children) {
            child.accept(generator);
        }
    }
}

// 具体节点类 StatementNode
class StatementNode extends Node {
    private String statement;

    StatementNode(String statement) {
        this.statement = statement;
    }

    @Override
    void accept(CodeGenerator generator) {
        generator.generate(this);
    }

    String getStatement() {
        return statement;
    }
}

// 具体节点类 ExpressionNode
class ExpressionNode extends Node {
    private String expression;

    ExpressionNode(String expression) {
        this.expression = expression;
    }

    @Override
    void accept(CodeGenerator generator) {
        generator.generate(this);
    }

    String getExpression() {
        return expression;
    }
}
```

最后我们定义一个具体的访问者类 JavaCodeGenerator，它实现了 CodeGenerator 接口，并在其中实现了各个节点类型的生成方法，用于生成 Java 代码。

```java
// 具体访问者类 JavaCodeGenerator
class JavaCodeGenerator implements CodeGenerator {
    private StringBuilder codeBuilder = new StringBuilder();

    @Override
    public void generate(ProgramNode node) {
        codeBuilder.append("public class Main {\n");
    }

    @Override
    public void generate(StatementNode node) {
        codeBuilder.append("    ").append(node.getStatement()).append(";\n");
    }

    @Override
    public void generate(ExpressionNode node) {
        codeBuilder.append("    ").append(node.getExpression()).append(";\n");
    }

    String getCode() {
        codeBuilder.append("}\n");
        return codeBuilder.toString();
    }
}
```

现在我们可以使用访问者模式来生成 Java 代码了。我们先创建一个 ProgramNode 对象，并向其中添加多个 StatementNode 和 ExpressionNode 对象，然后创建一个 JavaCodeGenerator 对象，调用 ProgramNode 的 accept 方法，并将 JavaCodeGenerator 作为参数传入。

```java
public class Main {
    public static void main(String[] args) {
        ProgramNode programNode = new ProgramNode();
        programNode.add(new StatementNode("int a = 1"));
        programNode.add(new ExpressionNode("a++"));
        programNode.add(new StatementNode("System.out.println(a)"));

        JavaCodeGenerator codeGenerator = new JavaCodeGenerator();
        programNode.accept(codeGenerator);
        System.out.println(codeGenerator.getCode());
    }
}
```

输出结果如下：

```java
public class Main {
    int a = 1;
    a++;
    System.out.println(a);
}
```

这个例子展示了如何使用访问者模式来生成 Java 代码，我们将生成代码的逻辑封装在了 JavaCodeGenerator 类中，并通过访问者模式将它们应用于语法树中的每个节点。这样可以实现代码的快速生成和可维护性。
