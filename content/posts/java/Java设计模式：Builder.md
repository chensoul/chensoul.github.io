---
title: "Java设计模式：Builder"
date: 2023-09-05
type: post
slug: java-design-patterns-builder
categories: ["Java"]
tags: [java]
---

本文主要介绍 [Builder](https://java-design-patterns.com/zh/patterns/builder/) 构造器模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

## 介绍

构造器模式（Builder Pattern）是一种创建型设计模式，用于将复杂对象的构建过程与其表示分离，从而可以使用相同的构建过程创建不同的表示。

在构造器模式中，通常有两个主要角色：产品（Product）和建造者（Builder）。产品是最终构建的对象，而建造者负责构建产品。

以下是构造器模式的类图示例：

```
+-------------------+        +----------------------+
|    Director       |        |       Builder        |
+-------------------+        +----------------------+
|  construct()      |        |  buildPartA()        |
|                   |        |  buildPartB()        |
+-------------------+        |  getResult()         |
                             +----------+-----------+
                                        |
                                        v
                             +----------+-----------+
                             |       Product         |
                             +----------------------+
                             |  partA               |
                             |  partB               |
                             +----------------------+
```

在上述类图中，`Director`（指导者）负责定义构建产品的顺序和方式，而`Builder`（建造者）负责实际构建产品的具体步骤。`Product`（产品）是最终构建的对象。

以下是一个简单的示例，演示如何使用构造器模式创建一个角色生成器的例子：

```java
// 产品类
public class Character {
    private String profession;
    private String name;
    private String hairColor;
    private String weapon;

    // 构造器私有化，只能通过建造者创建对象
    private Character() {}

    // Getters

    public String getProfession() {
        return profession;
    }

    public String getName() {
        return name;
    }

    public String getHairColor() {
        return hairColor;
    }

    public String getWeapon() {
        return weapon;
    }

    // 建造者类
    public static class CharacterBuilder {
        private Character character;

        public CharacterBuilder() {
            character = new Character();
        }

        public CharacterBuilder withProfession(String profession) {
            character.profession = profession;
            return this;
        }

        public CharacterBuilder withName(String name) {
            character.name = name;
            return this;
        }

        public CharacterBuilder withHairColor(String hairColor) {
            character.hairColor = hairColor;
            return this;
        }

        public CharacterBuilder withWeapon(String weapon) {
            character.weapon = weapon;
            return this;
        }

        public Character build() {
            return character;
        }
    }
}

// 使用示例
public class BuilderExample {
    public static void main(String[] args) {
        Character character = new Character.CharacterBuilder()
                .withProfession("Warrior")
                .withName("Conan")
                .withHairColor("Black")
                .withWeapon("Sword")
                .build();

        System.out.println(character.getProfession());  // 输出：Warrior
        System.out.println(character.getName());        // 输出：Conan
        System.out.println(character.getHairColor());   // 输出：Black
        System.out.println(character.getWeapon());      // 输出：Sword
    }
}
```

在上述示例中，`Character`（产品）是要构建的复杂对象，`CharacterBuilder`（建造者）负责构建这个对象的具体步骤。通过链式调用建造者的方法，可以设置产品的各个属性。最后，调用`build()`方法返回最终构建的对象。

## 优缺点

1. 构造器模式的优点：
   - 简化对象的创建过程，提供一种清晰和可读的创建对象的方式。
   - 允许通过构造器参数来定制对象的属性和行为。
   - 支持链式调用，使得对象的创建和配置更加灵活和可配置。
   - 提供了一种标准化的对象创建方式，符合面向对象设计的原则。
2. 构造器模式的缺点：
   - 当有很多属性需要设置时，构造器参数列表可能变得很长，不易维护。
   - 对于属性可选的情况，需要创建多个构造器或使用可选参数的方式，增加了代码复杂性。

## 与其他模式区别

1. 构造器模式和其他创建型模式的区别：构造器模式是创建型设计模式之一，专注于通过构造器来创建对象。与其他创建型模式（如工厂模式、抽象工厂模式、建造者模式）相比，构造器模式更加注重对象的初始化过程，并通过构造器参数来设置对象的属性和状态。
2. 构造器模式与 JavaBean 模式的比较：构造器模式和 JavaBean 模式是两种不同的对象创建方式。
   - 构造器模式通过在构造器中传递参数来创建对象，强调对象的不变性和一次性初始化。
   - JavaBean 模式使用默认构造器和 setter 方法来设置对象的属性，强调可变性和逐步初始化。

构造器模式的变体：

- 静态内部类构造器模式：通过静态内部类的方式来构建对象，实现了懒加载和线程安全。传统的建造者模式相比，静态 Builder 模式将 Builder 类定义为静态内部类，以简化对象创建过程，同时保持可读性和可配置性。

  ```java
  public class Product {
      private String name;
      private String description;
      private int price;

      private Product(Builder builder) {
          this.name = builder.name;
          this.description = builder.description;
          this.price = builder.price;
      }

      public String getName() {
          return name;
      }

      public String getDescription() {
          return description;
      }

      public int getPrice() {
          return price;
      }

      public static class Builder {
          private String name;
          private String description;
          private int price;

          public Builder() {
          }

          public Builder name(String name) {
              this.name = name;
              return this;
          }

          public Builder description(String description) {
              this.description = description;
              return this;
          }

          public Builder price(int price) {
              this.price = price;
              return this;
          }

          public Product build() {
              return new Product(this);
          }
      }
  }
  ```

  在上述代码中，`Product` 类是要构建的产品类，其中包含了一些属性。`Product` 类的构造函数被定义为私有，只能通过内部的 `Builder` 类来构建对象。

  `Builder` 类是一个静态内部类，它拥有与 `Product` 类相同的属性，并提供了链式调用的方法来配置这些属性。最后，通过 `build()` 方法来创建 `Product` 对象，并将 `Builder` 对象作为参数传递给 `Product` 类的私有构造函数来进行对象的构建。

  使用静态 Builder 模式，可以以链式调用的方式来构建对象，使代码更加简洁和可读。同时，由于 Builder 类是静态内部类，可以直接通过类名进行访问，无需先创建外部类的实例。这种模式也提供了一种可配置的对象创建方式，允许根据需要选择性地设置对象的属性值。

- 构造器参数过多时，使用构造器模式的变种可以改善代码可读性，如使用构建器模式（Builder Pattern）或流式接口模式（Fluent Interface Pattern）

## 适用场景

构造器模式适用于以下场景：

1. 当需要创建复杂对象时，对象的构建过程需要多个步骤，并且这些步骤可以灵活组合，产生不同的对象表示。
2. 当一个对象的构建过程独立于组成对象的部件及其组装方式，并且希望通过改变构建过程来构建不同的表示。
3. 当构建过程必须允许构建的对象具有不同的表示形式，而不需要暴露其内部结构。
4. 当创建过程中存在共享的部件，并且希望避免重复创建相同的部件。

下面是一些常见的适用场景示例：

1. 创建复杂的配置对象：例如，一个配置对象有多个可选项和参数，使用构造器模式可以通过设置不同的选项和参数来构建不同的配置对象。
2. 创建具有不同选项的菜单项：例如，一个菜单项可以有不同的名称、图标、快捷键等选项，使用构造器模式可以根据需要组合这些选项来构建菜单项。
3. 创建具有多个步骤的表单：例如，一个表单需要用户填写多个字段，使用构造器模式可以定义不同的步骤来构建表单，并在每个步骤中设置相应的字段。
4. 创建复杂的对象图：例如，创建一个包含多个对象和关联关系的对象图，使用构造器模式可以通过逐步构建对象并建立它们之间的关联关系来创建整个对象图。

在许多开源框架和库中，构造器模式经常被使用。下面是一些常见的开源框架中使用构造器模式的例子：

1. Apache HttpClient：Apache HttpClient 是一个流行的开源框架，用于进行 HTTP 通信。它使用了构造器模式来构建`HttpClient`和`HttpRequest`对象。例如，通过使用`HttpClientBuilder`类的构造器模式，可以创建自定义的`HttpClient`实例。

```java
CloseableHttpClient httpClient = HttpClientBuilder.create()
        .setConnectionTimeout(5000)
        .setRetryHandler(new DefaultHttpRequestRetryHandler(3, true))
        .build();
```

2. Gson：Gson 是 Google 提供的用于在 Java 对象和 JSON 数据之间进行转换的库。在 Gson 中，可以使用构造器模式来构建`Gson`对象，并设置不同的配置选项。

```java
Gson gson = new GsonBuilder()
        .setDateFormat("yyyy-MM-dd")
        .disableHtmlEscaping()
        .create();
```

3. Retrofit：Retrofit 是一个用于进行 RESTful API 通信的库。它使用构造器模式来构建`Retrofit`实例，并设置不同的配置选项，例如设置基本 URL、添加拦截器等。

```java
Retrofit retrofit = new Retrofit.Builder()
        .baseUrl("https://api.example.com")
        .addConverterFactory(GsonConverterFactory.create())
        .build();
```

4. JUnit：JUnit 是一个用于编写单元测试的 Java 框架。在 JUnit 中，可以使用构造器模式来构建不同类型的测试对象，例如使用`@RunWith`注解配置不同的测试运行器。

```java
@RunWith(Parameterized.class)
public class MyParameterizedTest {
    // constructor with parameters
    public MyParameterizedTest(String input, int expected) {
        // ...
    }
}
```

5. Spring Framework：Spring Framework 是一个广泛应用于 Java 企业应用开发的开源框架。在 Spring 中，可以使用构造器模式来构建不同的对象，例如使用`RestTemplateBuilder`构建`RestTemplate`对象。

```java
RestTemplate restTemplate = new RestTemplateBuilder()
        .setConnectTimeout(5000)
        .setReadTimeout(5000)
        .build();
```

6. Hibernate ORM：Hibernate 是一个流行的 Java 对象关系映射（ORM）框架，用于将 Java 对象映射到数据库表。在 Hibernate 中，可以使用构造器模式来构建`SessionFactory`和`Session`对象。

```java
Configuration configuration = new Configuration()
        .configure("hibernate.cfg.xml")
        .addAnnotatedClass(User.class);

SessionFactory sessionFactory = configuration.buildSessionFactory();
```

以下是一些 Java 中使用构造器模式的例子：

1. StringBuilder 类：Java 中的 StringBuilder 类使用构造器模式来构建可变的字符串对象。它允许通过构造器链式调用来追加、插入和修改字符串内容。

```java
StringBuilder sb = new StringBuilder("Hello");
sb.append(" World")
  .insert(5, ",")
  .replace(6, 11, "Java")
  .deleteCharAt(11);
String result = sb.toString(); // "Hello, Java"
```

2. StringBuffer

## 总结

构造器模式是一种创建型设计模式，旨在通过使用构造器来创建对象。它提供了一种清晰、可读和可配置的对象创建方式，允许通过构造器参数来设置对象的属性和状态。下面是对构造器模式的总结：

1. 目的：构造器模式旨在提供一种标准化的对象创建方式，将对象的构建和初始化过程封装在构造器中，以便于使用者创建对象。
2. 主要组件：
   - 构造器（Constructor）：构造器负责创建对象并设置其属性和状态。它可以接收一组参数来初始化对象。
   - 对象（Object）：构造器模式创建的目标对象，具有一组属性和状态。
3. 优点：
   - 简化对象的创建过程，提供一种清晰和可读的创建对象的方式。
   - 允许通过构造器参数来定制对象的属性和行为。
   - 支持链式调用，使得对象的创建和配置更加灵活和可配置。
   - 提供了一种标准化的对象创建方式，符合面向对象设计的原则。
4. 缺点：
   - 当有很多属性需要设置时，构造器参数列表可能变得很长，不易维护。
   - 对于属性可选的情况，需要创建多个构造器或使用可选参数的方式，增加了代码复杂性。
5. 与其他模式的关系：
   - 构造器模式与其他创建型模式（如工厂模式、抽象工厂模式、建造者模式）相比，更加注重对象的初始化过程。
   - 静态内部类构造器模式是构造器模式的一种变体，通过静态内部类实现了懒加载和线程安全。
   - 构造器模式可以与其他设计模式结合使用，如单例模式、适配器模式等，以满足更复杂的需求。

构造器模式提供了一种简单而强大的对象创建方式，使得创建对象变得直观、可配置和可读。它是面向对象设计中常用的模式之一，可以帮助程序员编写可维护、可扩展的代码。
