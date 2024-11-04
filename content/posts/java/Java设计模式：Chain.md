---
title: "Java设计模式：Chain"
date: 2023-10-16
type: post
slug: java-design-patterns-chain
categories: ["Java"]
tags: [java]
---

本文主要介绍 [Chain](https://java-design-patterns.com/zh/patterns/chain/) 模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

## 目的

通过给多个对象一个处理请求的机会，避免请求的发送者和它的接收者耦合。串联接收对象并在链条中传递请求直到一个对象处理它。

## 介绍

责任链模式（Chain of Responsibility Pattern）是一种行为型设计模式，它允许多个对象按照顺序处理请求，直到其中一个对象能够处理该请求为止。该模式将请求发送者和接收者解耦，使多个对象都有机会处理请求，同时避免请求发送者与接收者之间的直接耦合。

在责任链模式中，通常会构建一个处理请求的链条，链条上的每个对象都有一个指向下一个对象的引用。当请求到达链条的起点时，它会依次经过链条上的每个对象，直到找到能够处理请求的对象为止。每个对象都可以决定是否处理请求，或者将请求传递给下一个对象。

以下是责任链模式的几个关键角色：

1. 抽象处理器（Handler）：定义处理请求的接口，并包含一个指向下一个处理器的引用。通常会提供一个处理请求的方法。
2. 具体处理器（ConcreteHandler）：实现抽象处理器的接口，具体处理请求的逻辑。如果自己无法处理请求，则将请求传递给下一个处理器。
3. 客户端（Client）：创建责任链，并将请求发送给链条的起点。

下面是一个示例，说明如何使用责任链模式处理请求：

```java
// 抽象处理器
public abstract class Handler {
    protected Handler nextHandler;

    public void setNextHandler(Handler nextHandler) {
        this.nextHandler = nextHandler;
    }

    public abstract void handleRequest(Request request);
}

// 具体处理器
public class ConcreteHandler1 extends Handler {
    @Override
    public void handleRequest(Request request) {
        if (满足处理条件) {
            // 处理请求的逻辑
        } else if (nextHandler != null) {
            // 将请求传递给下一个处理器
            nextHandler.handleRequest(request);
        }
    }
}

// 具体处理器2和具体处理器3的定义与具体处理器1类似

// 客户端
public class Client {
    public static void main(String[] args) {
        Handler handler1 = new ConcreteHandler1();
        Handler handler2 = new ConcreteHandler2();
        Handler handler3 = new ConcreteHandler3();

        // 构建责任链
        handler1.setNextHandler(handler2);
        handler2.setNextHandler(handler3);

        // 创建请求
        Request request = new Request();

        // 发送请求给责任链的起点
        handler1.handleRequest(request);
    }
}
```

在上述示例中，抽象处理器（Handler）定义了处理请求的接口，并包含一个指向下一个处理器的引用。具体处理器（ConcreteHandler）继承自抽象处理器，实现了处理请求的逻辑，如果自己无法处理请求，则将请求传递给下一个处理器。客户端（Client）创建了具体处理器的实例，并构建了责任链，然后将请求发送给责任链的起点。

责任链模式的优点包括：

- 解耦请求发送者和接收者，让多个对象都有机会处理请求。
- 灵活性高，可以动态地改变责任链的结构和顺序。
- 可以简化对象之间的交互，每个对象只需要关注自己的处理逻辑。

然而，责任链模式也有一些注意事项：

- 需要注意链条的构建顺序，确保请求可以被正确地处理。
- 如果责任链过长或处理逻辑复杂，可能会影响性能。
- 请求可能无法被处理，需要在设计中考虑默认处理或异常处理机制。

## 适用场景

责任链模式在以下几种应用场景中经常被使用：

1. 请求处理链：当一个请求需要经过多个处理器进行处理，并且每个处理器都有可能处理该请求或将其传递给下一个处理器时，可以使用责任链模式。例如，Web开发中的请求处理、日志记录系统中的日志处理等。
2. 异常处理：在处理异常时，可以使用责任链模式来处理不同类型的异常。每个处理器负责处理一种类型的异常，如果无法处理，则将异常传递给下一个处理器。这样可以实现异常处理的灵活性和可扩展性。
3. 权限验证：在一个系统中，可以使用责任链模式来进行权限验证。每个处理器可以验证某个特定权限，如果无法验证，则将验证请求传递给下一个处理器。这样可以实现权限验证的灵活组合和动态调整。
4. 日志记录：在日志记录系统中，可以使用责任链模式来处理不同级别的日志信息。每个处理器负责记录特定级别的日志，如果无法处理，则将日志传递给下一个处理器。这样可以实现日志记录的分级和灵活配置。
5. 缓存处理：在缓存系统中，可以使用责任链模式来处理缓存读取请求。每个处理器可以根据一定的策略判断是否命中缓存，如果未命中则将请求传递给下一个处理器。这样可以实现缓存的层级和灵活的缓存策略。
6. 数据验证器（Data Validator）：在数据验证过程中，可以使用责任链模式来对数据进行不同类型的验证。每个验证器负责验证特定的数据规则，如果无法验证，则将验证请求传递给下一个验证器。这样可以实现数据验证的分步处理和灵活的验证规则组合。

需要注意的是，责任链模式适用于处理请求的场景，其中每个处理器都有可能处理请求或将其传递给下一个处理器。在选择使用责任链模式时，需确保请求能够被正确处理，并且链条的构建顺序是合理的，避免出现死循环或请求无法被处理的情况。

## 举例

这段代码展示了一个简单的泛型责任链模式实现，其中包括`Handler`接口和`Pipeline`类。

```java
public interface Handler<I, O> {
    O process(I input);
}

public class Pipeline<I, O> {
    private final Handler<I, O> currentHandler;

    public Pipeline(Handler<I, O> currentHandler) {
        this.currentHandler = currentHandler;
    }

    public <K> Pipeline<I, K> addHandler(Handler<O, K> newHandler) {
        return new Pipeline<>(input -> newHandler.process(currentHandler.process(input)));
    }

    public O execute(I input) {
        return currentHandler.process(input);
    }
}
```

在上述代码中，`Handler`接口定义了一个处理输入类型为`I`，输出类型为`O`的操作。它包含一个`process`方法，用于执行处理逻辑。

`Pipeline`类是一个泛型类，它接受输入类型`I`和输出类型`O`。在构造函数中，通过传入一个初始的`currentHandler`，创建一个责任链的起点。

`Pipeline`类提供了`addHandler`方法，用于添加新的处理器到责任链中。该方法接受一个实现了`Handler`接口的`newHandler`，并返回一个新的`Pipeline`对象，新的责任链包括之前的处理器和新的处理器。

`execute`方法用于执行整个责任链。它接受输入参数`input`，并通过调用当前处理器的`process`方法，依次执行责任链中的每个处理器，并返回最终的输出结果。

使用这个简单的泛型责任链模式，你可以根据具体的业务需求创建不同类型的处理器，并通过`addHandler`方法将它们连接在一起，形成一个处理流程。然后，你可以使用`execute`方法将输入数据传入责任链中，依次经过每个处理器进行处理，最终得到输出结果。

假设我们有一个处理器链，用于处理字符串的转换操作：

```java
public class StringToUpperHandler implements Handler<String, String> {
    @Override
    public String process(String input) {
        return input.toUpperCase();
    }
}

public class StringTrimHandler implements Handler<String, String> {
    @Override
    public String process(String input) {
        return input.trim();
    }
}

public class StringReverseHandler implements Handler<String, String> {
    @Override
    public String process(String input) {
        return new StringBuilder(input).reverse().toString();
    }
}
```

现在，我们可以使用这些处理器来创建一个处理流程，并执行输入字符串的转换操作：

```java
public class Main {
    public static void main(String[] args) {
        // 创建处理器和处理流程
        Handler<String, String> toUpperHandler = new StringToUpperHandler();
        Handler<String, String> trimHandler = new StringTrimHandler();
        Handler<String, String> reverseHandler = new StringReverseHandler();

        Pipeline<String, String> pipeline = new Pipeline<>(toUpperHandler)
                .addHandler(trimHandler)
                .addHandler(reverseHandler);

        // 执行处理流程
        String input = "  Hello, World!  ";
        String output = pipeline.execute(input);

        System.out.println("Output: " + output);
    }
}
```

在上述示例中，我们创建了三个处理器：`StringToUpperHandler`、`StringTrimHandler`和`StringReverseHandler`，它们分别用于将字符串转换为大写、去除空格和反转字符串。

然后，我们使用这些处理器创建了一个处理流程，通过调用`addHandler`方法将它们逐步链接在一起，形成一个处理器链。

最后，我们执行处理流程，将输入字符串`"  Hello, World!  "`传入`execute`方法中。该输入字符串首先经过`toUpperHandler`处理器处理，然后传递给`trimHandler`进行处理，最后传递给`reverseHandler`进行处理。处理完成后，得到最终的输出结果。

在本例中，输出结果为`"!DLROW ,OLLEH"`，这是通过依次应用处理器链中的每个处理器对输入字符串进行转换而得到的。

## Java中的例子

- [java.util.logging.Logger#log()](http://docs.oracle.com/javase/8/docs/api/java/util/logging/Logger.html#log)
- [Apache Commons Chain](https://commons.apache.org/proper/commons-chain/index.html)
- [javax.servlet.Filter#doFilter()](http://docs.oracle.com/javaee/7/api/javax/servlet/Filter.html#doFilter-javax.servlet.ServletRequest-javax.servlet.ServletResponse-javax.servlet.FilterChain-)
