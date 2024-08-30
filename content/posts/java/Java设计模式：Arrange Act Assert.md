---
title: "Java设计模式：Arrange/Act/Assert"
date: 2023-08-13
slug: java-design-patterns-arrange-act-assert
categories: ["Java"]
tags: [java]
---

本文主要介绍 Arrange/Act/Assert 模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

## 介绍

Arrange/Act/Assert（安排/执行/断言）又称 Given/When/Then，是一种测试设计模式，用于组织和编写单元测试的结构。它提供了一种清晰的测试布局，使得测试代码易于理解和维护。

该模式的三个阶段如下：

1. Arrange（安排）：在这个阶段，你准备测试环境和设置测试数据。这包括创建对象、设置输入参数、模拟依赖项等。你的目标是为将要进行的测试创建一个合适的环境。
2. Act（执行）：在这个阶段，你执行要测试的操作或调用要测试的方法。这是你对被测试代码进行实际调用的地方。
3. Assert（断言）：在这个阶段，你验证测试的结果是否符合预期。你会检查实际的输出、状态变化或异常情况，并使用断言语句来断言测试的期望结果。

这种测试结构的优势在于它提供了清晰的分离和组织测试代码的方式，并使得测试的目的和预期结果更容易理解。它也有助于减少测试代码中的重复和冗余。

以下是一个使用 Arrange/Act/Assert 模式编写的示例测试方法的伪代码：

```java
public void testCalculateTotalPrice() {
    // Arrange
    ShoppingCart cart = new ShoppingCart();
    cart.addItem(new Item("Item 1", 10.0));
    cart.addItem(new Item("Item 2", 15.0));

    // Act
    double totalPrice = cart.calculateTotalPrice();

    // Assert
    assertEquals(25.0, totalPrice, 0.01);
}
```

在上述示例中，首先在 Arrange 阶段创建了一个购物车对象，并添加了两个商品。然后，在 Act 阶段调用了`calculateTotalPrice()`方法来计算总价格。最后，在 Assert 阶段使用断言语句来验证计算的结果是否等于预期的总价格。

## 适用性

Arrange/Act/Assert（安排/执行/断言）设计模式适用于编写单元测试，特别是针对函数、方法或类的单元测试。它在以下情况下特别有用：

1. 单元测试：Arrange/Act/Assert 模式适用于对单个函数或方法进行测试。它帮助你组织测试代码，使其结构清晰，并确保每个测试只关注一个特定的功能或行为。
2. 易于理解和维护：这种模式提供了一种一致的测试结构，使得测试代码易于理解和维护。通过明确的安排、执行和断言阶段，你可以更清楚地了解测试的目的和预期结果。
3. 测试代码可读性：Arrange/Act/Assert 模式可以使测试代码更具可读性。通过按照统一的结构组织测试代码，使得测试逻辑更加清晰可见，易于他人理解和参与。
4. 提高可维护性：使用这种模式可以减少测试代码中的重复和冗余，使得测试代码更易于维护。在 Arrange 阶段设置测试环境和准备数据，可以减少在每个测试中重复的代码。
5. 测试结果验证：Arrange/Act/Assert 模式明确了测试结果的验证过程。在 Assert 阶段使用断言语句来验证实际结果与预期结果的一致性，帮助你确保被测试代码的正确性。

需要注意的是，Arrange/Act/Assert 模式主要适用于单元测试，而对于集成测试或端到端测试等更大范围的测试，可能需要使用其他测试设计模式或框架来进行组织和管理测试代码。

> 除了 Arrange/Act/Assert 模式，以下是一些适用于集成测试或端到端测试的设计模式或框架：
>
> 1. Page Object 模式：Page Object 模式是一种用于管理用户界面元素和操作的设计模式。它将页面的元素和操作封装到可重用的对象中，使得测试代码更具可读性和可维护性。Page Object 模式特别适用于 Web 应用程序的端到端测试。
> 2. 数据构建器模式：数据构建器模式用于生成测试数据，以便在集成测试或端到端测试中使用。它提供了一种灵活的方式来创建测试数据，包括复杂的数据结构和关联关系。
> 3. 数据准备和清理模式：在集成测试或端到端测试中，通常需要准备测试数据和环境，并在测试完成后进行清理。数据准备和清理模式提供了一种结构化的方法来管理这些操作，确保测试的一致性和可重复性。
> 4. Mock 对象模式：Mock 对象模式用于模拟或替代外部依赖项，以便进行集成测试或端到端测试。通过使用 Mock 对象，你可以隔离被测试代码与外部系统的交互，使得测试更加可控和独立。
> 5. BDD（行为驱动开发）框架：BDD 框架（如 Cucumber、SpecFlow 等）提供了一种以自然语言编写测试用例和规范的方式。它将测试用例描述为可读性强的场景和步骤，帮助开发人员、测试人员和业务利益相关者之间的沟通和理解。

## 参考

- [Arrange, Act, Assert: What is AAA Testing?](https://blog.ncrunch.net/post/arrange-act-assert-aaa-testing.aspx)
- [Bill Wake: 3A – Arrange, Act, Assert](https://xp123.com/articles/3a-arrange-act-assert/)
- [Martin Fowler: GivenWhenThen](https://martinfowler.com/bliki/GivenWhenThen.html)
- [xUnit Test Patterns: Refactoring Test Code](https://www.amazon.com/gp/product/0131495054/ref=as_li_qf_asin_il_tl?ie=UTF8&tag=javadesignpat-20&creative=9325&linkCode=as2&creativeASIN=0131495054&linkId=99701e8f4af2f7e8dd50d720c9b63dbf)
- [Unit Testing Principles, Practices, and Patterns](https://www.amazon.com/gp/product/1617296279/ref=as_li_qf_asin_il_tl?ie=UTF8&tag=javadesignpat-20&creative=9325&linkCode=as2&creativeASIN=1617296279&linkId=74c75cf22a63c3e4758ae08aa0a0cc35)
- [Test Driven Development: By Example](https://www.amazon.com/gp/product/0321146530/ref=as_li_qf_asin_il_tl?ie=UTF8&tag=javadesignpat-20&creative=9325&linkCode=as2&creativeASIN=0321146530&linkId=5c63a93d8c1175b84ca5087472ef0e05)
