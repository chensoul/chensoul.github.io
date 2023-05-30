---
title: "Java设计模式：Acyclic Visitor"
date: 2023-05-29T10:00:00+08:00
slug: java-design-patterns-acyclic-visitor
categories: ["Notes"]
tags: [java]
draft: true
---



本文主要介绍 Acyclic Visitor 模式，在 [Java Design Patterns](https://java-design-patterns.com/)  网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。



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



## 介绍

 Acyclic Visitor是一种设计模式，它用于在不破坏对象轻量级访问者的情况下，对复杂对象结构进行操作。这个模式是Visitor设计模式的变体，但与传统的Visitor设计模式不同，Acyclic Visitor设计模式不要求元素对象实现访问者接口，因此它是一种非循环访问者模式。

在Acyclic Visitor设计模式中，访问者分为两个类别：基础访问者和派生访问者。基础访问者包含所有可能的访问对象，它们不需要实现访问者接口。派生访问者实现了访问者接口，并根据需要添加了其他方法。当需要访问一个对象时，可以通过派生访问者的特定实现来实现。

Acyclic Visitor设计模式适用于需要对复杂的对象结构进行操作的情况，例如编译器、解释器和图形界面组件等。它提供了一种灵活的方法，可以在不破坏元素对象的情况下，对它们进行操作。这种设计模式也可以提高代码的可维护性和可扩展性，因为它允许在不修改元素对象的情况下，添加新的访问者。

在实现Acyclic Visitor设计模式时，需要考虑以下几个因素：

1. 定义访问者接口：派生访问者需要实现的接口，以及基础访问者需要包含的方法。
2. 定义元素对象：需要被访问的元素对象，可以是单个对象或对象集合。
3. 实现派生访问者：根据需要实现派生访问者的特定实现。
4. 实现基础访问者：包含所有可能的访问对象。

下面是一个使用Acyclic Visitor设计模式的简单例子：

```java
// Animal接口
public interface Animal {
    void accept(AnimalVisitor visitor);
}

// Dog类
public class Dog implements Animal {
    @Override
    public void accept(AnimalVisitor visitor) {
      	// 动态分发机制会根据实际类型找到AnimalVisitor中的visit(Dog dog)方法
        visitor.visit(this); 
    }
}

// Cat类
public class Cat implements Animal {
    @Override
    public void accept(AnimalVisitor visitor) {
        visitor.visit(this);
    }
}

// Bird类
public class Bird implements Animal {
    @Override
    public void accept(AnimalVisitor visitor) {
        visitor.visit(this);
    }
}

// AnimalVisitor接口
public interface AnimalVisitor {
    void visit(Dog dog);
    void visit(Cat cat);
    void visit(Bird bird);
}

// AnimalOperation接口
public interface AnimalOperation {
    void feed(Animal animal);
    void play(Animal animal);
    void groom(Animal animal);
}

// AnimalVisitorBase类
public class AnimalVisitorBase implements AnimalVisitor {
    @Override
    public void visit(Dog dog) {
        // 默认实现
    }

    @Override
    public void visit(Cat cat) {
        // 默认实现
    }

    @Override
    public void visit(Bird bird) {
        // 默认实现
    }
}

// AnimalOperationVisitor类
public class AnimalOperationVisitor extends AnimalVisitorBase implements AnimalOperation {
    @Override
public void feed(Animal animal) {
        animal.accept(this);
    }

    @Override
    public void play(Animal animal) {
        animal.accept(this);
    }

    @Override
    public void groom(Animal animal) {
        animal.accept(this);
    }

    @Override
    public void visit(Dog dog) {
        // 实现喂食、玩耍和梳理等操作
        System.out.println("Feeding a dog");
        System.out.println("Playing with a dog");
        System.out.println("Grooming a dog");
    }

    @Override
    public void visit(Cat cat) {
        // 实现喂食、玩耍和梳理等操作
        System.out.println("Feeding a cat");
        System.out.println("Playing with a cat");
        System.out.println("Grooming a cat");
    }

    @Override
    public void visit(Bird bird) {
        // 实现喂食、玩耍和梳理等操作
        System.out.println("Feeding a bird");
        System.out.println("Playing with a bird");
        System.out.println("Grooming a bird");
    }
}

// 测试代码
public class Test {
    public static void main(String[] args) {
        List<Animal> animals = new ArrayList<>();
        animals.add(new Dog());
        animals.add(new Cat());
        animals.add(new Bird());

        AnimalOperationVisitor visitor = new AnimalOperationVisitor();
        for (Animal animal : animals) {
            visitor.feed(animal);
            visitor.play(animal);
            visitor.groom(animal);
        }
    }
}
```

假设我们需要对不同类型的动物进行操作，例如狗、猫和鸟。我们可以定义一个Animal接口，以及三个实现类：Dog、Cat和Bird。然后，我们可以定义两个访问者接口：AnimalVisitor和AnimalOperation。AnimalVisitor包含accept方法，用于将访问者应用于元素对象。AnimalOperation包含不同的操作方法，例如feed、play和groom。

在Acyclic Visitor设计模式中，我们可以定义一个基础访问者AnimalVisitorBase，它包含所有可能的访问对象，但不需要实现访问者接口。然后，我们可以定义派生访问者AnimalOperationVisitor，它实现了AnimalVisitor接口，并包含feed、play和groom等操作方法的实现。

使用Acyclic Visitor设计模式，我们可以在不修改元素对象的情况下，对不同类型的动物进行操作。例如，我们可以定义一个Zoo类，其中包含多个Animal对象。然后，我们可以创建一个AnimalOperationVisitor对象，并将它应用于Zoo中的所有Animal对象，从而实现对动物的操作。



如果需要添加一个新的动物，只需要创建一个新的实现Animal接口的类，并在accept方法中调用visitor的visit方法，传递自己的实例即可。例如，假设我们需要添加一种名为Fish的新动物，我们可以创建一个新的Fish类，如下所示：

```java
// Fish类
public class Fish implements Animal {
    @Override
    public void accept(AnimalVisitor visitor) {
        visitor.visit(this);
    }
}
```

然后，在AnimalVisitor接口中添加一个新的visit方法，以及在AnimalOperationVisitor类中添加新的操作方法即可。例如，我们可以在AnimalOperationVisitor类中添加一个feedFish方法，如下所示：

```java
public class AnimalOperationVisitor extends AnimalVisitorBase implements AnimalOperation {
    // ...

    public void feedFish(Animal animal) {
        animal.accept(this);
    }

    @Override
    public void visit(Fish fish) {
        // 实现喂食、玩耍和梳理等操作
        System.out.println("Feeding a fish");
        System.out.println("Playing with a fish");
        System.out.println("Grooming a fish");
    }
}
```

现在，我们可以将新的Fish对象添加到动物列表中，并使用AnimalOperationVisitor对象对其进行操作，如下所示：

```java
public class Test {
    public static void main(String[] args) {
        List<Animal> animals = new ArrayList<>();
        animals.add(new Dog());
        animals.add(new Cat());
        animals.add(new Bird());
        animals.add(new Fish()); // 添加新的Fish对象

        AnimalOperationVisitor visitor = new AnimalOperationVisitor();
        for (Animal animal : animals) {
            visitor.feed(animal);
            visitor.play(animal);
            visitor.groom(animal);
        }
        visitor.feedFish(new Fish()); // 使用新的操作方法
    }
}
```

现在，我们可以对不同类型的动物进行操作，包括新添加的Fish对象。这就是Acyclic Visitor设计模式的灵活性，可以在不修改元素对象的情况下，轻松地添加新的访问者和操作。



总之，Acyclic Visitor设计模式提供了一种灵活的方法，可以在不破坏对象轻量级访问者的情况下，对复杂的对象结构进行操作。它适用于需要对多个不同类型的对象进行操作的情况，并可以提高代码的可维护性和可扩展性。



## 优缺点

Acyclic Visitor设计模式有以下优点和缺点：

优点：

1. 分离操作和元素对象：Acyclic Visitor设计模式通过分离操作和元素对象，可以使得操作更加灵活，元素对象可以不需要实现访问者接口，从而避免了对元素对象的修改。
2. 支持新的操作：Acyclic Visitor设计模式允许在不修改元素对象的情况下添加新的操作，只需要实现一个新的派生访问者即可。
3. 易于扩展：由于Acyclic Visitor设计模式支持添加新的操作，因此它可以轻松地扩展，适用于需要对多个不同类型的对象进行操作的情况。
4. 提高代码可维护性：Acyclic Visitor设计模式可以使得代码更加清晰和易于维护，因为它将操作和元素对象分离开来，同时也避免了对元素对象的修改。

缺点：

1. 增加了代码复杂性：Acyclic Visitor设计模式需要定义访问者接口、元素对象、基础访问者和派生访问者等多个类，因此会增加代码复杂性，特别是对于简单的应用场景而言可能过于繁琐。
2. 可能降低运行效率：Acyclic Visitor设计模式需要使用动态分发机制，这可能会导致运行时的性能损失。
3. 需要预先定义所有可能的操作：在Acyclic Visitor设计模式中，需要预先定义所有可能的操作，这可能会限制其灵活性和可扩展性。

综上所述，Acyclic Visitor设计模式适用于需要对复杂的对象结构进行操作的情况，它提供了一种灵活的方法，可以在不破坏对象轻量级访问者的情况下，对它们进行操作。但是，它的实现可能会增加代码复杂性，可能降低运行效率，并需要预先定义所有可能的操作。



## 区别

Acyclic Visitor设计模式与其他设计模式有以下几点区别：

1. 与访问者模式的区别：Acyclic Visitor设计模式是访问者模式的一种变体，与传统的访问者模式不同之处在于，它不需要在元素接口中定义接受访问者的方法。这样可以避免循环依赖问题，使得代码更加简洁。

2. 与双重分派技术的区别：Acyclic Visitor设计模式使用双重分派技术，通过在访问者接口中定义多个visit方法，根据元素对象的类型进行相应的操作。而双重分派技术是一种常用的技术，可以在运行时动态决定方法调用。

3. 与模板方法模式的区别：Acyclic Visitor设计模式与模板方法模式都是使用继承实现的设计模式，但是它们的目的不同。模板方法模式用于定义算法的骨架，可以让子类重写某些步骤，而Acyclic Visitor设计模式用于对复杂数据结构进行操作，可以根据元素对象的类型进行相应的操作。

4. 与策略模式的区别：Acyclic Visitor设计模式与策略模式都是使用组合实现的设计模式，但是它们的目的不同。策略模式用于定义一系列算法，并且可以动态地替换算法，而Acyclic Visitor设计模式用于对复杂数据结构进行操作，可以根据元素对象的类型进行相应的操作。

5. 与组合模式的区别：Acyclic Visitor设计模式与组合模式都是用于处理树状结构的设计模式，但是它们的目的不同。组合模式用于表示一种部分-整体的层次结构，可以将对象组合成树形结构，并且对整个树形结构进行操作。而Acyclic Visitor设计模式用于对树形结构中不同类型的元素对象进行操作，可以根据元素对象的类型进行相应的操作。

   

## 使用场景

Acyclic Visitor设计模式适用于需要对复杂的对象结构进行操作的情况，例如编译器、解释器和图形界面组件等。这种设计模式的主要应用场景包括以下几个方面：

1. 编译器和解释器：在编译器和解释器中，需要对源代码进行解析和分析，生成抽象语法树或解释器模型。Acyclic Visitor设计模式可以使得访问者和解释器分离，从而提高代码的可维护性和可扩展性。
2. 图形界面组件：在图形界面组件中，需要对不同类型的组件进行操作，例如按钮、文本框和标签等。Acyclic Visitor设计模式可以使得访问者和组件分离，从而使得代码更加清晰和易于维护。
3. 数据库操作：在数据库操作中，需要对不同的数据表和数据类型进行操作，例如查询、更新和删除等。Acyclic Visitor设计模式可以使得访问者和数据表分离，从而提高代码的可维护性和可扩展性。
4. 状态机：在状态机中，需要对不同的状态进行操作，例如转移、进入和退出等。Acyclic Visitor设计模式可以使得访问者和状态分离，从而提高代码的可维护性和可扩展性。
5. 复杂的数据结构：在复杂的数据结构中，需要对不同的元素进行操作，例如树、图和网络等。Acyclic Visitor设计模式可以使得访问者和元素分离，从而提高代码的可维护性和可扩展性。

### 数据库操作

以下是一个使用Acyclic Visitor设计模式的数据库操作示例：

```java
// 数据表接口
public interface Table {
    void accept(TableVisitor visitor);
}

// 数据表访问者接口
public interface TableVisitor {
    void visit(EmployeeTable table);
    void visit(DepartmentTable table);
}

// 员工数据表
public class EmployeeTable implements Table {
    @Override
    public void accept(TableVisitor visitor) {
        visitor.visit(this);
    }

    public void select() {
        System.out.println("Selecting from employee table");
    }

    public void update() {
        System.out.println("Updating employee table");
    }

    public void delete() {
        System.out.println("Deleting from employee table");
    }
}

// 部门数据表
public class DepartmentTable implements Table {
    @Override
    public void accept(TableVisitor visitor) {
        visitor.visit(this);
    }

    public void select() {
        System.out.println("Selecting from department table");
    }

    public void update() {
        System.out.println("Updating department table");
    }

    public void delete() {
        System.out.println("Deleting from department table");
    }
}

// 数据库操作
public class Database {
    private List<Table> tables;

    public Database() {
        tables = new ArrayList<>();
        tables.add(new EmployeeTable());
        tables.add(new DepartmentTable());
    }

    public void select() {
        TableVisitor visitor = new SelectVisitor();
        for (Table table : tables) {
            table.accept(visitor);
        }
    }

    public void update() {
        TableVisitor visitor = new UpdateVisitor();
        for (Table table : tables) {
            table.accept(visitor);
        }
    }

    public void delete() {
        TableVisitor visitor = new DeleteVisitor();
        for (Table table : tables) {
            table.accept(visitor);
        }
    }

    // 数据库操作访问者实现
    private class SelectVisitor implements TableVisitor {
        @Override
        public void visit(EmployeeTable table) {
            table.select();
        }

        @Override
        public void visit(DepartmentTable table) {
            table.select();
        }
    }

    private class UpdateVisitor implements TableVisitor {
        @Override
        public void visit(EmployeeTable table) {
            table.update();
        }

        @Override
        public void visit(DepartmentTable table) {
            table.update();
        }
    }

    private class DeleteVisitor implements TableVisitor {
        @Override
        public void visit(EmployeeTable table) {
            table.delete();
        }

        @Override
        public void visit(DepartmentTable table) {
            table.delete();
        }
}
```

在上面的代码中，Table接口定义了数据表的基本行为，并且实现了Acyclic Visitor设计模式的accept方法。TableVisitor接口定义了数据表访问者的行为，包括访问不同类型的数据表对象。EmployeeTable和DepartmentTable类分别表示员工数据表和部门数据表，实现了Table接口的accept方法，并且包含了查询、更新和删除等方法。Database类表示数据库对象，包含了多个数据表对象和查询、更新和删除等操作方法。SelectVisitor、UpdateVisitor和DeleteVisitor类分别是数据库操作访问者的具体实现，用于执行查询、更新和删除操作。

### 状态机

在状态机中，使用Acyclic Visitor设计模式可以将状态对象和状态转移操作分离开来，从而提高代码的可维护性和可扩展性。以下是一个使用Acyclic Visitor设计模式的状态机示例：

```java
// 状态机状态接口
public interface State {
    void enter();
    void execute();
    void exit();
    void accept(StateVisitor visitor);
}

// 状态机状态访问者接口
public interface StateVisitor {
    void visit(StateA state);
    void visit(StateB state);
}

// 状态机状态A
public class StateA implements State {
    @Override
    public void enter() {
        System.out.println("Entering State A");
    }

    @Override
    public void execute() {
        System.out.println("Executing State A");
    }

    @Override
    public void exit() {
        System.out.println("Exiting State A");
    }

    @Override
    public void accept(StateVisitor visitor) {
        visitor.visit(this);
    }
}

// 状态机状态B
public class StateB implements State {
    @Override
    public void enter() {
        System.out.println("Entering State B");
    }

    @Override
    public void execute() {
        System.out.println("Executing State B");
    }

    @Override
    public void exit() {
        System.out.println("Exiting State B");
    }

    @Override
    public void accept(StateVisitor visitor) {
        visitor.visit(this);
    }
}

// 状态机
public class StateMachine {
    private State currentState;

    public StateMachine(State initialState) {
        this.currentState = initialState;
    }

    public void setState(State state) {
        this.currentState = state;
    }

    public void execute() {
        currentState.execute();
    }

    public void accept(StateVisitor visitor) {
        currentState.accept(visitor);
    }
}

// 状态机状态访问者实现
public class StateVisitorImpl implements StateVisitor {
    @Override
    public void visit(StateA state) {
        state.enter();
        // 执行状态转移操作
        state.exit();
    }

    @Override
    public void visit(StateB state) {
        state.enter();
        // 执行状态转移操作
        state.exit();
    }
}
```

在上面的代码中，State接口定义了状态机状态的基本行为，包括进入、执行和退出等操作，并且实现了Acyclic Visitor设计模式的accept方法。StateVisitor接口定义了状态机状态访问者的行为，包括访问不同类型的状态对象。StateMachine类表示状态机对象，包含了当前状态和状态转移操作等方法。StateVisitorImpl类是状态机状态访问者的具体实现，用于执行状态转移操作。



### 复杂的数据结构

以下是一个使用Acyclic Visitor设计模式的树结构示例：

```java
// 树节点接口
public interface TreeNode {
    void accept(TreeVisitor visitor);
}

// 树节点访问者接口
public interface TreeVisitor {
    void visit(LeafNode node);
    void visit(InnerNode node);
}

// 叶子节点
public class LeafNode implements TreeNode {
    @Override
    public void accept(TreeVisitor visitor) {
        visitor.visit(this);
    }

    public void operation() {
        System.out.println("Performing operation on leaf node");
    }
}

// 内部节点
public class InnerNode implements TreeNode {
    private List<TreeNode> children;

    public InnerNode(List<TreeNode> children) {
        this.children = children;
    }

    @Override
    public void accept(TreeVisitor visitor) {
        visitor.visit(this);
        for (TreeNode child : children) {
            child.accept(visitor);
        }
    }

    public void operation() {
        System.out.println("Performing operation on inner node");
    }
}

// 树结构
public class Tree {
    private TreeNode root;

    public Tree(TreeNode root) {
        this.root = root    }

    public void accept(TreeVisitor visitor) {
        root.accept(visitor);
    }
}

// 树节点访问者实现
public class TreeVisitorImpl implements TreeVisitor {
    @Override
    public void visit(LeafNode node) {
        node.operation();
    }

    @Override
    public void visit(InnerNode node) {
        node.operation();
    }
}
```

在上面的代码中，TreeNode接口定义了树节点的基本行为，并且实现了Acyclic Visitor设计模式的accept方法。TreeVisitor接口定义了树节点访问者的行为，包括访问不同类型的树节点对象。LeafNode和InnerNode类分别表示叶子节点和内部节点，实现了TreeNode接口的accept方法，并且包含了操作方法。Tree类表示树结构对象，包含了根节点和访问方法。TreeVisitorImpl类是树节点访问者的具体实现，用于执行操作。



总之，Acyclic Visitor设计模式适用于需要对复杂的对象结构进行操作的情况。它提供了一种灵活的方法，可以在不破坏对象轻量级访问者的情况下，对它们进行操作。
