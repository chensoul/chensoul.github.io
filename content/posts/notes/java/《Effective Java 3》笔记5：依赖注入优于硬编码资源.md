---
title: "《Effective Java 3》笔记5：依赖注入优于硬编码资源"
date: 2023-04-17T17:00:00+08:00
slug: prefer-dependency-injection-to-hardwiring-resources
categories: ["Notes"]
tags: [java,spring]
---

本文是 《Effective Java 3》第二章的学习笔记，在整理笔记过程中，通过 chatgpt 的帮助做了一些扩展。

## 介绍

依赖注入是软件工程中使用的一种设计模式，用于将组件和依赖项相互解耦。而不是在组件内部创建和管理依赖项，我们从外部传递它们。这种方法可以帮助创建更模块化和灵活的代码。

相比之下，硬编码资源涉及在组件内部直接创建和管理依赖项。这种方法可能会使代码不太灵活，难以维护。

## 举例

许多类依赖于一个或多个底层资源。例如，拼写检查程序依赖于字典。常见做法是，将这种类实现为静态实用工具类：

```java
// Inappropriate use of static utility - inflexible & untestable!
public class SpellChecker {
    private static final Lexicon dictionary = ...;
    private SpellChecker() {} // Noninstantiable
    public static boolean isValid(String word) { ... }
    public static List<String> suggestions(String typo) { ... }
}
```

类似地，我们也经常看到它们的单例实现：

```java
// Inappropriate use of singleton - inflexible & untestable!
public class SpellChecker {
    public static INSTANCE = new SpellChecker(...);

    private final Lexicon dictionary = ...;
    private SpellChecker(...) {}
    public boolean isValid(String word) { ... }
    public List<String> suggestions(String typo) { ... }
}
```

这两种方法都不令人满意，因为它们假设只使用一个字典。在实际应用中，每种语言都有自己的字典，特殊的字典用于特殊的词汇表。另外，最好使用一个特殊的字典进行测试。



你可以尝试让 SpellChecker 支持多个字典：首先取消 dictionary 字段的 final 修饰，并在现有的拼写检查器中添加更改 dictionary 的方法。但是在并发环境中这种做法是笨拙的、容易出错的和不可行的。**静态实用工具类和单例不适用于由底层资源参数化的类。**



所需要的是支持类的多个实例的能力（在我们的示例中是 SpellChecker），每个实例都使用客户端需要的资源（在我们的示例中是 dictionary）。满足此要求的一个简单模式是在**创建新实例时将资源传递给构造函数。** 这是依赖注入的一种形式：字典是拼写检查器的依赖项，在创建它时被注入到拼写检查器中。

```java
// Dependency injection provides flexibility and testability
public class SpellChecker {
    private final Lexicon dictionary;
    public SpellChecker(Lexicon dictionary) {
        this.dictionary = Objects.requireNonNull(dictionary);
    }

    public boolean isValid(String word) { ... }
    public List<String> suggestions(String typo) { ... }
}
```



依赖注入模式非常简单，许多程序员在不知道其名称的情况下使用了多年。虽然拼写检查器示例只有一个资源（字典），但是依赖注入可以处理任意数量的资源和任意依赖路径。它保持了不可变性，因此多个客户端可以共享依赖对象（假设客户端需要相同的底层资源）。**依赖注入同样适用于构造函数、静态工厂和构建器**。

以下是这些情况的示例：

### 构造函数

在构造函数中使用依赖注入是最常见的方式。例如，假设我们有一个名为`UserService`的类，它需要一个能够验证用户的`UserValidator`接口作为依赖项。我们可以像这样在构造函数中注入`UserValidator`：

```java
public class UserService {
    private UserValidator userValidator;

    public UserService(UserValidator userValidator) {
        this.userValidator = userValidator;
    }

    // ...
}
```

### 静态工厂

静态工厂是一种创建对象的方式，它将创建对象的逻辑封装在一个静态方法中。例如，假设我们有一个名为`UserServiceFactory`的类，它负责创建`UserService`实例。我们可以像这样在静态工厂方法中注入`UserValidator`：

```java
public class UserServiceFactory {
    public static UserService createUserService(UserValidator userValidator) {
        return new UserService(userValidator);
    }
}
```

### 构建器

构建器是一种创建对象的方式，它将创建对象的逻辑封装在一个构建器类中。例如，假设我们有一个名为`UserServiceBuilder`的类，它负责创建`UserService`实例。我们可以像这样在构建器类中注入`UserValidator`：

```java
public class UserServiceBuilder {
    private UserValidator userValidator;

    public UserServiceBuilder withUserValidator(UserValidator userValidator) {
        this.userValidator = userValidator;
        return this;
    }

    public UserService build() {
        return new UserService(userValidator);
    }
}
```

这样，我们可以使用构建器来创建`UserService`实例，并在构建器中注入`UserValidator`。例如：

```java
UserValidator userValidator = new CustomUserValidator();
UserService userService = new UserServiceBuilder().withUserValidator(userValidator).build();
```

这种模式的一个有用变体是将资源工厂传递给构造函数。资源工厂是一种创建和提供对象的方式，它可以在需要时动态地创建和返回资源。在将资源工厂传递给构造函数时，我们可以将对象的创建和配置逻辑从类中移除，从而实现更好的可测试性和可维护性。

以下是一个使用资源工厂传递给构造函数的示例：

```java
public class UserService {
    private UserValidator userValidator;
    private DataSource dataSource;

    public UserService(ResourceFactory resourceFactory) {
        this.userValidator = resourceFactory.createUserValidator();
        this.dataSource = resourceFactory.createDataSource();
    }

    public boolean authenticate(String username, String password) {
        // perform authentication using userValidator and dataSource
        ...
    }
}
```

在上面的示例中，`UserService`类需要一个能够验证用户的`UserValidator`实例和一个`DataSource`实例。这两个依赖项都是通过资源工厂来创建的。通过将资源工厂传递给构造函数，我们可以将对象的创建和配置逻辑从类中移除，并使其更加灵活和可维护。

例如，假设我们有一个名为`MySqlResourceFactory`的类，它实现了`ResourceFactory`接口，并用于创建`UserValidator`和`DataSource`实例。我们可以像这样使用它来创建`UserService`实例：

```java
ResourceFactory resourceFactory = new MySqlResourceFactory();
UserService userService = new UserService(resourceFactory);
```

使用这种方法，我们将`UserService`类与具体的资源实现解耦，并使其更加灵活和可维护。同时，我们可以轻松地模拟和测试`UserService`类，因为我们可以在测试中传递不同的资源工厂实现，而不需要依赖于外部资源。



### 函数式接口

在Java 8中，`Supplier<T>`是一个函数式接口，用于表示一个无参数函数，该函数返回类型为`T`。由于其函数式特性，`Supplier<T>`非常适合表示工厂，因为它可以提供一种通用的方式来创建对象。

以下是一个使用`Supplier<T>`表示工厂的示例：

```java
public class UserService {
    private UserValidator userValidator;

    public UserService(Supplier<UserValidator> userValidatorFactory) {
        this.userValidator = userValidatorFactory.get();
    }

    public boolean authenticate(String username, String password) {
        // perform authentication using userValidator
        ...
    }
}
```

在上面的示例中，`UserService`类的构造函数接受一个`Supplier<UserValidator>`作为参数。这个`Supplier`可以在需要时动态地创建`UserValidator`实例。在`UserService`类中，我们可以通过调用`userValidatorFactory.get()`来获取`UserValidator`实例。

例如，假设我们有一个名为`CustomUserValidator`的类，它实现了`UserValidator`接口，并用于验证用户。我们可以像这样使用`UserService`类和`Supplier<T>`来创建`UserService`实例：

```java
Supplier<UserValidator> userValidatorFactory = CustomUserValidator::new;
UserService userService = new UserService(userValidatorFactory);
```

在上面的示例中，`userValidatorFactory`是一个`Supplier<UserValidator>`实例，它使用`CustomUserValidator::new`构造函数引用来创建`UserValidator`实例。通过将这个`Supplier`传递给`UserService`类的构造函数，我们可以创建`UserService`实例，而无需显式地创建`UserValidator`实例。

使用`Supplier<T>`表示工厂可以使我们的代码更加简洁和灵活。它可以使对象的创建更加通用，并允许我们在需要时动态地创建对象。同时，由于`Supplier<T>`是一个函数式接口，我们可以使用lambda表达式和方法引用来创建工厂，使代码更加简洁和易于理解。



## 优点

以下是使用依赖注入比硬编码资源的优点：

1. 可测试性：使用依赖注入，很容易创建和注入模拟对象进行测试。这样，我们可以将正在测试的组件隔离开来，并专注于测试其行为，而不必担心其依赖项的行为。
2. 灵活性：使用依赖注入，我们可以轻松地用不同实现替换依赖项。这在需要更改组件的行为而不更改其代码时非常有用。
3. 解耦：依赖注入有助于将组件与其依赖项解耦，使代码更加模块化并易于维护。
4. 关注点分离：依赖注入将依赖项的创建和管理与组件本身分离，允许更清晰地分离关注点。



## 运用

依赖注入是一种常见的设计模式，被广泛应用于许多开源框架中。以下是一些常见的开源框架和库，它们使用依赖注入来管理对象之间的依赖关系：

1. Spring Framework：Spring是一个非常流行的Java框架，它使用依赖注入来管理应用程序中的对象之间的依赖关系。Spring通过`@Autowired`注解和XML配置文件来实现依赖注入。
2. Google Guice：Guice是一个轻量级的依赖注入框架，它使用Java注解来实现依赖注入。Guice提供了一个`Binder`接口，使用户可以配置注入规则。
3. Dagger：Dagger是一个基于Java和Android平台的依赖注入框架，它使用Java注解和代码生成技术来实现依赖注入。Dagger提供了一个`Component`接口，用于表示应用程序对象之间的依赖关系。
4. CDI：CDI是Java EE 6中引入的一种依赖注入框架，它使用Java注解和XML配置文件来实现依赖注入。CDI提供了一个`BeanManager`接口，使用户可以配置和管理应用程序对象之间的依赖关系。
5. Micronaut：Micronaut是一个轻量级的依赖注入框架，它使用Java注解和字节码生成技术来实现依赖注入。Micronaut提供了一个`@Inject`注解，用于标记需要注入的依赖项。
6. Weld：Weld是一个Java SE和Java EE的依赖注入框架，它使用Java注解和XML配置文件来实现依赖注入。Weld提供了一个`BeanManager`接口，用于配置和管理应用程序对象之间的依赖关系。
7. PicoContainer：PicoContainer是一个轻量级的依赖注入框架，它使用Java注解和代码生成技术来实现依赖注入。PicoContainer提供了一个`Container`接口，用于表示应用程序对象之间的依赖关系。
8. HK2：HK2是Java EE 8和Jakarta EE 9的依赖注入框架，它使用Java注解和XML配置文件来实现依赖注入。HK2提供了一个`ServiceLocator`接口，用于配置和管理应用程序对象之间的依赖关系。
9. Micrometer：Micrometer是一个用于度量应用程序性能的库，它使用依赖注入来管理度量记录器之间的依赖关系。Micrometer支持多种依赖注入框架，包括Spring和Guice。
10. Google Dagger Hilt：Dagger Hilt是一个基于Dagger 2的依赖注入库，它使用注解来管理对象之间的依赖关系。它提供了一些附加功能，例如使用`@ViewModelInject`注解来注入ViewModel依赖项。
11. Quarkus：Quarkus是一个用于构建可扩展的Java应用程序的框架，它使用依赖注入来管理应用程序对象之间的依赖关系。它支持多种依赖注入框架，包括CDI、Spring和Guice。
12. Micronaut Data：Micronaut Data是一个用于管理数据库访问的库，它使用依赖注入来管理数据访问对象之间的依赖关系。它支持多种ORM框架，包括Hibernate和JDBC。
13. Akka：Akka是一个用于构建事件驱动应用程序的库，它使用依赖注入来管理Actor之间的依赖关系。它提供了一个`@Inject`注解，用于标记需要注入的依赖项。
14. JHipster：JHipster是一个用于生成现代Web应用程序的框架，它使用依赖注入来管理应用程序对象之间的依赖关系。它支持多种依赖注入框架，包括Spring和Guice。
15. Vert.x：Vert.x是一个基于事件驱动的应用程序框架，它使用依赖注入来管理应用程序对象之间的依赖关系。它支持多种依赖注入框架，包括CDI和Guice。
16. Quarkus Reactive：Quarkus Reactive是一个用于构建反应式应用程序的框架，它使用依赖注入来管理应用程序对象之间的依赖关系。它支持多种依赖注入框架，包括CDI和Spring。
17. Micronaut Security：Micronaut Security是一个用于管理Web应用程序安全的库，它使用依赖注入来管理安全服务之间的依赖关系。它支持多种安全框架，包括Spring Security和Apache Shiro。
18. Eclipse MicroProfile：Eclipse MicroProfile是一个用于构建微服务的框架，它使用依赖注入来管理微服务之间的依赖关系。它支持多种依赖注入框架，包括CDI和Guice。
19. Kotlin Koin：Koin是一个用于Kotlin应用程序的依赖注入库，它使用DSL语法来管理应用程序对象之间的依赖关系。它支持单例、工厂和懒加载等不同的注入模式。
20. Spring Cloud：Spring Cloud是一个用于构建分布式系统的框架，它使用依赖注入来管理分布式系统之间的依赖关系。它支持多种依赖注入框架，包括Spring和Guice。
21. Micronaut HTTP Client：Micronaut HTTP Client是一个用于管理HTTP客户端的库，它使用依赖注入来管理HTTP客户端之间的依赖关系。它支持多种HTTP客户端实现，包括Apache HttpClient和Netty。
22. Quarkus Security：Quarkus Security是一个用于管理Web应用程序安全的库，它使用依赖注入来管理安全服务之间的依赖关系。它支持多种安全框架，包括Spring Security和Apache Shiro。

这些框架和库都使用依赖注入来管理对象之间的依赖关系，使代码更加灵活、可维护和可测试。它们提供了一些不同的注入技术和API，以适应不同的应用场景和需求。



### Spring依赖注入

在Spring框架中，依赖注入是核心特性之一。Spring使用依赖注入来管理应用程序对象之间的依赖关系，以实现松耦合、可测试和可扩展的代码。以下是Spring中使用依赖注入的方法：

1. 注解：Spring使用注解将依赖项注入到对象中。常用的注解包括`@Autowired`、`@Qualifier`和`@Value`。其中，`@Autowired`注解用于自动装配依赖项，`@Qualifier`注解用于指定依赖项的名称或限定符，`@Value`注解用于从属性文件或环境变量中注入值。
2. XML配置文件：Spring也支持使用XML配置文件来定义对象之间的依赖关系。在XML配置文件中，可以使用`<bean>`元素定义对象，并使用`<property>`元素设置对象的属性和依赖项。
3. Java配置类：Spring还支持使用Java配置类来定义对象之间的依赖关系。在Java配置类中，可以使用`@Configuration`注解定义配置类，并使用`@Bean`注解定义对象，并使用`@Autowired`注解注入依赖项。

以下是一些在Spring中使用依赖注入的例子：

**1、自动装配示例：**

```java
@Component
public class MyService {
   private final MyRepository myRepository;

   @Autowired
   public MyService(MyRepository myRepository) {
       this.myRepository = myRepository;
   }

   // ...
}
```

在这个例子中，`MyService`类通过构造函数注入了`MyRepository`依赖。在`MyService`对象创建时，Spring框架自动装配并注入了`MyRepository`对象。

**2、XML配置示例：**

```xml
<bean id="myService" class="com.example.MyService">
   <constructor-arg ref="myRepository"/>
</bean>

<bean id="myRepository" class="com.example.MyRepository"/>
```

在这个例子中，`MyService`类和`MyRepository`类被定义为Spring的bean，并在XML配置文件中指定它们之间的依赖关系。在`MyService`对象创建时，Spring框架自动创建并注入了`MyRepository`对象。

**3、Java配置示例：**

```java
@Configuration
public class AppConfig {
   @Bean
   public MyService myService(MyRepository myRepository) {
       return new MyService(myRepository);
   }

   @Bean
   public MyRepository myRepository() {
       return new MyRepository();
   }
}
```

在这个例子中，`AppConfig`类通过`@Bean`注解定义了`MyService`对象和`MyRepository`对象，并通过方法参数的方式注入了`MyRepository`依赖。在应用程序启动时，Spring框架会自动创建并注入这些对象。

#### Spring依赖注入意事项

在使用Spring中的依赖注入时，有一些注意事项需要注意，以确保代码的正确性和可维护性。

1. 依赖项注入的顺序：如果一个类依赖于多个其他类，那么这些依赖项的注入顺序可能会影响到代码的正确性。为了避免这种情况，可以使用`@DependsOn`注解指定依赖项之间的顺序。
2. 循环依赖：如果两个或多个类之间出现循环依赖，那么会导致对象无法正确创建。为了避免这种情况，可以使用构造函数注入或setter注入来解决循环依赖问题。
3. 作用域：Spring提供了多种作用域，包括单例、原型和请求作用域等。在使用依赖注入时，需要了解每种作用域的区别和适用场景，并选择合适的作用域。
4. 配置文件管理：在使用XML配置文件或Java配置类时，需要注意配置文件或类的管理和维护。可以使用Spring的Profile功能来管理不同的配置文件或类，并根据不同的环境或需求来选择合适的配置。
5. 依赖注入类型选择：Spring支持多种依赖注入类型，包括构造函数注入、setter注入和字段注入等。需要根据情况选择合适的依赖注入类型，并考虑到代码的可测试性和可维护性。

#### 如何避免循环依赖问题

循环依赖是指两个或多个类之间相互依赖而导致无法正确创建对象的情况。在Spring中，可以通过以下几种方式来避免循环依赖问题：

1. 使用构造函数注入：构造函数注入是指依赖项通过构造函数的方式进行注入。这种方式可以避免循环依赖问题，因为对象的创建顺序是确定的，每个对象都必须先创建其依赖项，然后才能创建自身。
2. 使用setter注入：setter注入是指依赖项通过setter方法进行注入。这种方式可以避免循环依赖问题，因为对象的创建顺序是不确定的，每个对象都可以先创建自身，然后再通过setter方法注入其依赖项。
3. 使用`@Lazy`注解：`@Lazy`注解可以延迟依赖项的注入，直到对象第一次使用该依赖项时才进行注入。这种方式可以避免循环依赖问题，因为对象的创建顺序是不确定的，每个对象都可以先创建自身，然后再等待其依赖项被注入。
4. 优化依赖关系：如果出现循环依赖问题，可以通过优化依赖关系来解决。例如，将依赖项抽象成接口或抽象类，然后通过不同的实现类来解决循环依赖问题。



#### Spring多种依赖注入类的优缺点

Spring支持多种依赖注入类型，包括构造函数注入、setter注入和字段注入等。各种依赖注入类型的优缺点如下：

**1、构造函数注入**

优点：

- 对象创建时依赖项已经确定，可以保证依赖项的完整性和正确性。
- 依赖项是只读的，可以保证对象的不变性。

缺点：

- 构造函数注入比较繁琐，需要在每个类中添加构造函数和依赖项参数。



**2、setter注入**

优点：

- setter注入比较灵活，可以随时注入或更改依赖项。
- 可以使用默认构造函数创建对象，简化代码。

缺点：

- 对象创建时依赖项可能还未注入，需要进行null检查。
- setter方法是公共的，可能会影响对象的不变性。



**3、字段注入**

优点：

- 简单方便，不需要手动编写构造函数或setter方法。
- 可以使用默认构造函数创建对象，简化代码。

缺点：

- 依赖项是公共的，可能会影响对象的不变性。
- 对象创建时依赖项可能还未注入，需要进行null检查。

总的来说，**构造函数注入是最推荐的依赖注入方式，因为它可以保证对象的完整性和正确性。**setter注入和字段注入则比较灵活，但需要注意依赖项的注入时机和可能对对象不变性的影响。根据具体的情况和需求，可以选择合适的依赖注入方式。



## 总结

总之，不要使用单例或静态实用工具类来实现依赖于一个或多个底层资源的类，这些资源的行为会影响类的行为，也不要让类直接创建这些资源。相反，将创建它们的资源或工厂传递给构造函数（或静态工厂或构建器）。这种操作称为依赖注入，它将大大增强类的灵活性、可复用性和可测试性。
