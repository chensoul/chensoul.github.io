---
title: "《Effective Java 3》笔记：使用构造器代替构造函数"
date: 2023-04-03T16:00:00+08:00
slug: builder-instead-of-constructors
categories: ["Notes"]
tags: ["java"]
authors:
  - chensoul
---

## 介绍

当一个类需要多个构造函数参数时，可以考虑使用**构建器模式**来创建对象。构建器模式是一种创建对象的设计模式，它可以通过链式调用方法的方式来设置对象的构造参数，并最终返回一个构造完整的对象。



## 优点

使用构建器模式的原因有以下几点：

1. 避免构造函数参数过多的问题：当一个类需要多个构造函数参数时，构造函数的参数列表可能会变得很长，这会导致代码难以理解和维护。使用构建器模式可以将构造函数参数拆分成多个方法，从而使代码更加清晰易懂。
2. 提高代码的可读性和可维护性：使用构建器模式可以使代码更加易懂和易维护，因为可以通过方法名来清晰地表达每个参数的含义。
3. 提供更多的灵活性和可定制性：构建器模式可以提供更多的灵活性和可定制性，因为可以在构造对象时进行更多的逻辑处理和判断。例如，可以在构建器中添加验证逻辑，以确保参数的有效性。
4. 支持多线程环境：构建器模式可以支持多线程环境，因为每个构建器都是独立的，不会受到其他线程的影响。



以下是一个例子：

```java
public class NutritionFacts {
    private final int servingSize;
    private final int servings;
    private final int calories;
    private final int fat;
    private final int sodium;
    private final int carbohydrate;

    private NutritionFacts(Builder builder) {
        this.servingSize = builder.servingSize;
        this.servings = builder.servings;
        this.calories = builder.calories;
        this.fat = builder.fat;
        this.sodium = builder.sodium;
        this.carbohydrate = builder.carbohydrate;
    }

    public int getServingSize() {
        return servingSize;
    }

    public int getServings() {
        return servings;
    }

    public int getCalories() {
        return calories;
    }

    public int getFat() {
        return fat;
    }

    public int getSodium() {
        return sodium;
    }

    public int getCarbohydrate() {
        return carbohydrate;
    }

    public static class Builder {
        // Required parameters
        private final int servingSize;
        private final int servings;

        // Optional parameters - initialized to default values
        private int calories = 0;
        private int fat = 0;
        private int sodium = 0;
        private int carbohydrate = 0;

        public Builder(int servingSize, int servings) {
            this.servingSize = servingSize;
            this.servings = servings;
        }

        public Builder calories(int calories) {
            this.calories = calories;
            return this;
        }

        public Builder fat(int fat) {
            this.fat = fat;
            return this;
        }

        public Builder sodium(int sodium) {
            this.sodium = sodium;
            return this;
        }

        public Builder carbohydrate(int carbohydrate) {
            this.carbohydrate = carbohydrate;
            return this;
        }

        public NutritionFacts build() {
            return new NutritionFacts(this);
        }
    }
}
```

在上述示例中，我们定义了一个名为 NutritionFacts 的类，它包含了一些营养成分的信息，例如每份的大小、总份数、卡路里、脂肪、钠和碳水化合物等成员变量。我们还定义了一个名为 Builder 的静态内部类，用于构建 NutritionFacts 对象。

在 Builder 类中，我们定义了一个带有两个参数的构造方法，并在其中初始化了必需的成员变量 servingSize 和 servings。我们还定义了一些可选的方法，用于设置 NutritionFacts 对象的卡路里、脂肪、钠和碳水化合物等成员变量。这些方法都支持链式调用，并返回 Builder 对象本身，以便进行多次方法调用。

在 Builder 类中，我们最终定义了一个 build() 方法，用于创建 NutritionFacts 对象并返回。在 build() 方法中，我们调用 NutritionFacts 的私有构造器并将 Builder 对象作为参数传递进去，从而创建 NutritionFacts 对象并初始化其成员变量。

现在，我们可以使用 NutritionFacts.Builder 类来创建 NutritionFacts 对象，并使用链式调用来设置 NutritionFacts 对象的成员变量。例如，我们可以使用以下代码来创建一个每份大小为 240ml、总共有 8 份、卡路里为 100、脂肪为 2、钠为 35、碳水化合物为 27 的 NutritionFacts 对象：

```java
NutritionFacts cocaCola = new NutritionFacts.Builder(240, 8)
        .calories(100)
        .fat(2)
        .sodium(35)
        .carbohydrate(27)
        .build();
```

在上述代码中，我们首先创建了一个 NutritionFacts.Builder 对象，并在构造函数中传递了每份大小和总份数等参数。然后，我们使用链式调用来设置卡路里、脂肪、钠和碳水化合物等成员变量，并最终调用 build() 方法来创建 NutritionFacts 对象。

可以使用 lombok 注解来简化代码，但是，**无法在构造器的构造方法里设置必要参数。**

```java
import lombok.Builder;

@Builder
public class NutritionFacts {
    private final int servingSize;
    private final int servings;
    private final int calories;
    private final int fat;
    private final int sodium;
    private final int carbohydrate;
}
```



## 缺点

虽然构建器模式可以提高代码的可读性、可维护性以及提供更多的灵活性和可定制性，但它也有一些缺点，包括：

1. 增加代码复杂度：使用构建器模式会增加代码的复杂度，因为需要创建一个独立的构建器类，并且需要在构建器类中定义多个方法来设置对象的属性。这会增加代码量并且需要更多的时间来编写和维护代码。
2. 增加内存开销：使用构建器模式需要创建一个独立的构建器对象，并且需要在构建器对象中保存对象的属性。这会增加内存开销，并且在创建对象时需要更多的时间和资源。
3. 对于简单对象不适用：构建器模式更适用于构造复杂对象，对于简单对象来说，使用构建器模式可能会增加代码的复杂度和开销。
4. 需要额外的代码：使用构建器模式需要编写额外的代码来创建构建器类和定义方法。如果只需要构造一个简单的对象，使用构建器模式可能会浪费时间和资源。



## 层次构建器

层次构建器（Hierarchical Builder）是一种构建器模式的扩展，它允许创建层次结构的对象，并支持在父对象中嵌套子对象。它通常由一个抽象的构建器接口，多个具体的构建器实现和一个指导者（Director）组成。

在层次构建器中，每个构建器都负责创建特定类型的对象，并且可以在其构建方法中调用其他构建器的构建方法来创建嵌套的子对象。指导者负责协调构建器的顺序和调用构建器的方法来构建对象层次结构。

层次构建器模式的优点包括：

1. 支持创建复杂的对象层次结构，能够构建包含多个层次和嵌套子对象的对象。
2. 提供了更好的可读性和可维护性，因为每个构建器都只需要关注一个特定类型的对象，而且可以通过方法名来清晰地表达每个参数的含义。
3. 提供了更多的灵活性和可定制性，因为可以在构建器中添加验证逻辑，以确保参数的有效性，并且可以动态地组合构建器来创建不同类型的对象。

层次构建器模式的缺点包括：

1. 代码量：由于层次构建器模式需要定义多个构建器类，因此代码量会比较大，尤其是在构建复杂对象时。

2. 嵌套层次：层次构建器模式中的对象层次结构是通过嵌套多个构建器实现的，这会导致代码的嵌套层次较深，可能会影响代码的可读性和可维护性。

3. 可能会增加内存开销：因为每个构建器都需要创建一个独立的对象，并且需要在构建器对象中保存对象的属性。对于大型对象和多级嵌套结构，开销可能会很大。

4. 不适合简单对象的构建：层次构建器模式适用于构建复杂对象层次结构，但对于简单的对象构建，使用层次构建器模式可能会显得过于繁琐和不必要。

   

### 使用

#### 举例 1

1、定义抽象的构建器接口，用于创建不同类型的对象和添加子对象：

```java
public interface ComputerBuilder {
    void buildCPU(String model);
    void buildGPU(String model);
    void buildMemory(int size);
    void addStorage(String type, int size);
    void addPeripheral(String type);
    Computer getResult();
}
```

2、创建具体的构建器实现，用于构建不同类型的对象和添加子对象：

```java
public class DesktopBuilder implements ComputerBuilder {
    private Desktop computer = new Desktop();
    
    public void buildCPU(String model) {
        computer.setCPU(new CPU(model));
    }
    
    public void buildGPU(String model) {
        computer.setGPU(new GPU(model));
    }
    
    public void buildMemory(int size) {
        computer.setMemory(new Memory(size));
    }
    
    public void addStorage(String type, int size) {
        computer.addStorage(new Storage(type, size));
    }
    
    public void addPeripheral(String type) {
        computer.addPeripheral(new Peripheral(type));
    }
    
    public Computer getResult() {
        return computer;
    }
}

public class LaptopBuilder implements ComputerBuilder {
    private Laptop computer = new Laptop();
    
    public void buildCPU(String model) {
        computer.setCPU(new CPU(model));
    }
    
    public void buildGPU(String model) {
        computer.setGPU(new GPU(model));
    }
    
    public void buildMemory(int size) {
        computer.setMemory(new Memory(size));
    }
    
    public void addStorage(String type, int size) {
        computer.addStorage(new Storage(type, size));
    }
    
    public void addPeripheral(String type) {
        computer.addPeripheral(new Peripheral(type));
    }
    
    public Computer getResult() {
        return computer;
    }
}
```

3、创建指导者类，用于协调构建器的顺序和调用构建器的方法来构建对象层次结构：

```java
public class ComputerDirector {
    private ComputerBuilder builder;
    
    public ComputerDirector(ComputerBuilder builder) {
        this.builder = builder;
    }
    
    public void construct() {
        builder.buildCPU("Intel Core i7");
        builder.buildGPU("Nvidia GeForce RTX 3080");
        builder.buildMemory(16);
        builder.addStorage("SSD", 512);
        builder.addPeripheral("Keyboard");
        builder.addPeripheral("Mouse");
    }
}
```

4、使用层次构建器模式创建计算机系统对象：

```java
ComputerBuilder desktopBuilder = new DesktopBuilder();
ComputerBuilder laptopBuilder = new LaptopBuilder();

ComputerDirector director = new ComputerDirector(desktopBuilder);
director.construct();
Computer desktop = desktopBuilder.getResult();

director = new ComputerDirector(laptopBuilder);
director.construct();
Computer laptop = laptopBuilder.getResult();

// 将两个计算机系统对象组合成一个更大的计算机系统对象
ComputerSystem system = new ComputerSystem();
system.addComputer(desktop);
system.addComputer(laptop);
```

在上面的示例中，DesktopBuilder和LaptopBuilder分别是具体的构建器实现，用于创建桌面计算机和笔记本电脑对象。ComputerDirector是指导者类，用于协调构建器的顺序和调用构建器的方法来构建对象层次结构。使用ComputerDirector构建计算机系统对象时，可以先使用DesktopBuilder构建桌面计算机对象，再使用LaptopBuilder构建笔记本电脑对象，最后将两个计算机系统对象组合成一个更大的计算机系统对象。



下面是另一个使用层次构建器模式创建层次结构对象的例子，假设需要创建一个组织结构的层次结构对象，其中包含多个部门和嵌套子部门：

1、定义抽象的构建器接口，用于创建不同类型的对象和添加子对象：

```java
public interface DepartmentBuilder {
    void buildName(String name);
    void buildManager(String manager);
    void addSubDepartment(Department subDepartment);
    Department getResult();
}

public abstract class DepartmentImpl implements Department {
    protected String name;
    protected String manager;
    protected List<Department> subDepartments = new ArrayList<>();
    
    public void setName(String name) {
        this.name = name;
    }
    
    public void setManager(String manager) {
        this.manager = manager;
    }
    
    public void addSubDepartment(Department subDepartment) {
        subDepartments.add(subDepartment);
    }
    
    public void removeSubDepartment(Department subDepartment) {
        subDepartments.remove(subDepartment);
    }
    
    public List<Department> getSubDepartments() {
        return subDepartments;
    }
    
    public String getName() {
        return name;
    }
    
    public String getManager() {
        return manager;
    }
}

public class DevelopmentDepartment extends DepartmentImpl {
    // 添加特定于开发部门的属性和方法
}


public class SalesDepartment extends DepartmentImpl {
    // 添加特定于销售部门的属性和方法
}
```

2、创建具体的构建器实现，用于构建不同类型的对象和添加子对象：

```java
public class SalesDepartmentBuilder implements DepartmentBuilder {
    private SalesDepartment department = new SalesDepartment();
    
    public void buildName(String name) {
        department.setName(name);
    }
    
    public void buildManager(String manager) {
        department.setManager(manager);
    }
    
    public void addSubDepartment(Department subDepartment) {
        department.addSubDepartment(subDepartment);
    }
    
    public Department getResult() {
        return department;
    }
}

public class DevelopmentDepartmentBuilder implements DepartmentBuilder {
    private DevelopmentDepartment department = new DevelopmentDepartment();
    
    public void buildName(String name) {
        department.setName(name);
    }
    
    public void buildManager(String manager) {
        department.setManager(manager);
    }
    
    public void addSubDepartment(Department subDepartment) {
        department.addSubDepartment(subDepartment);
    }
    
    public Department getResult() {
        return department;
    }
}
```

3、创建指导者类，用于协调构建器的顺序和调用构建器的方法来构建对象层次结构：

```java
public class OrganizationDirector {
    private DepartmentBuilder builder;
    
    public OrganizationDirector(DepartmentBuilder builder) {
        this.builder = builder;
    }
    
    public void construct() {
        builder.buildName("Organization");
        builder.buildManager("CEO");
        
        Department salesDept = new SalesDepartment();
        salesDept.setName("Sales Department");
        salesDept.setManager("Sales Manager");
        builder.addSubDepartment(salesDept);
        
        Department devDept = new DevelopmentDepartment();
        devDept.setName("Development Department");
        devDept.setManager("Development Manager");
        
        Department frontendDevDept = new DevelopmentDepartment();
        frontendDevDept.setName("Front-end Development Department");
        frontendDevDept.setManager("Front-end Development Manager");
        devDept.addSubDepartment(frontendDevDept);
        
        Department backendDevDept = new DevelopmentDepartment();
        backendDevDept.setName("Back-end Development Department");
        backendDevDept.setManager("Back-end Development Manager");
        devDept.addSubDepartment(backendDevDept);
        
        builder.addSubDepartment(devDept);
    }
}
```

4、使用层次构建器模式创建组织结构对象：

```java
DepartmentBuilder salesDeptBuilder = new SalesDepartmentBuilder();
DepartmentBuilder devDeptBuilder = new DevelopmentDepartmentBuilder();

OrganizationDirector director = new OrganizationDirector(salesDeptBuilder);
director.construct();
Department salesDept = salesDeptBuilder.getResult();

director = new OrganizationDirector(devDeptBuilder);
director.construct();
Department devDept = devDeptBuilder.getResult();

// 将两个部门对象组合成一个更大的组织结构对象
Organization organization = new Organization();
organization.addDepartment(salesDept);
organization.addDepartment(devDept);
```

在上面的示例中，SalesDepartmentBuilder和DevelopmentDepartmentBuilder分别是具体的构建器实现，用于创建销售部门和开发部门对象。OrganizationDirector是指导者类，用于协调构建器的顺序和调用构建器的方法来构建对象层次结构。使用OrganizationDirector构建组织结构对象时，可以先使用SalesDepartmentBuilder构建销售部门对象，再使用DevelopmentDepartmentBuilder构建开发部门对象，最后将两个部门对象组合成一个更大的组织结构对象。



#### 举例 2

```java
public abstract class ComputerComponent {
    private final String manufacturer;
    private final String model;
    // ...

    protected ComputerComponent(Builder<?> builder) {
        manufacturer = builder.manufacturer;
        model = builder.model;
        // ...
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public String getModel() {
        return model;
    }

    public static abstract class Builder<T extends Builder<T>> {
        private String manufacturer;
        private String model;
        // ...
        
        public T setManufacturer(String manufacturer) {
            this.manufacturer = manufacturer;
            return self();
        }
        
        public T setModel(String model) {
            this.model = model;
            return self();
        }

        protected abstract T self();
        
        public abstract ComputerComponent build();
    }
}

public class Motherboard extends ComputerComponent {
    private final String socketType;
    // ...

    protected Motherboard(Builder builder) {
        super(builder);
        socketType = builder.socketType;
        // ...
    }

    public String getSocketType() {
        return socketType;
    }

    public static class Builder extends ComputerComponent.Builder<Builder> {
        private String socketType;
        // ...
        
        public Builder setSocketType(String socketType) {
            this.socketType = socketType;
            return this;
        }
        
        @Override
        protected Builder self() {
            return this;
        }
        
        @Override
        public Motherboard build() {
            return new Motherboard(this);
        }
    }
}

public class CPU extends ComputerComponent {
    private final int coreCount;
    // ...

    protected CPU(Builder builder) {
        super(builder);
        coreCount = builder.coreCount;
        // ...
    }

    public int getCoreCount() {
        return coreCount;
    }

    public static class Builder extends ComputerComponent.Builder<Builder> {
        private int coreCount;
        // ...
        
        public Builder setCoreCount(int coreCount) {
            this.coreCount = coreCount;
            return this;
        }
        
        @Override
        protected Builder self() {
            return this;
        }
        
        @Override
        public CPU build() {
            return new CPU(this);
        }
    }
}

public class Computer {
    private final Motherboard motherboard;
    private final CPU cpu;
    // ...

    protected Computer(Builder builder) {
        motherboard = builder.motherboard;
        cpu = builder.cpu;
        // ...
    }

    public Motherboard getMotherboard() {
        return motherboard;
    }

    public CPU getCpu() {
        return cpu;
    }

    public static class Builder {
        private Motherboard motherboard;
        private CPU cpu;
        // ...

        public Builder setMotherboard(Motherboard motherboard) {
            this.motherboard = motherboard;
            return this;
        }

        public Builder setCpu(CPU cpu) {
            this.cpu = cpu;
            return this;
        }

        public Computer build() {
            return new Computer(this);
        }
    }
}
```

使用示例：

```java
Motherboard.Builder motherboardBuilder = new Motherboard.Builder()
        .setManufacturer("ASUS")
        .setModel("ROG Strix Z590-E Gaming")
        .setSocketType("LGA 1200")
        // ...

CPU.Builder cpuBuilder = new CPU.Builder()
        .setManufacturer("Intel")
        .setModel("Core i9-11900K")
        .setCoreCount(8)
        // ...

Computer.Builder computerBuilder = new Computer.Builder()
        .setMotherboard(motherboardBuilder.build())
        .setCpu(cpuBuilder.build())
        // ...

Computer computer = computerBuilder.build();
```

在这个示例中，`ComputerComponent` 类是一个抽象基类，定义了计算机组件的基本属性和方法。它还定义了一个抽象的构建器类，用于构建它的子类的实例。

每个 `ComputerComponent` 的具体子类都有自己的具体构建器类，该类扩展了抽象构建器类。具体构建器提供了设置相应组件属性的方法，例如主板的制造商、型号和插座类型，处理器的时钟速度和内存的容量。

`Computer` 类代表一个完整的计算机系统，并具有用于构建 `Computer` 类的实例的构建器类。`Computer.Builder` 类提供了设置每个组件属性的方法，使用 `Consumer` 函数接口来接受配置相应构建器的 lambda 表达式。



## 使用

以下是几个常见开源框架中使用建造者模式的例子：

### Retrofit

Retrofit是一个Android和Java平台上的RESTful API库，它使用建造者模式来创建RestAdapter对象。RestAdapter.Builder类是一个建造者类，它包含了一系列的方法，用于设置Retrofit的配置选项，如设置API的base URL、设置HTTP Client、设置Converter等。

示例代码：

```java
RestAdapter restAdapter = new RestAdapter.Builder()
    .setEndpoint("https://api.github.com")
    .setClient(new OkClient())
    .setLogLevel(RestAdapter.LogLevel.FULL)
    .build();
```

### Gson

Gson是一个用于在Java对象和JSON数据之间进行序列化和反序列化的库。它使用建造者模式来创建Gson对象。GsonBuilder类是一个建造者类，它包含了一系列的方法，用于配置Gson的行为，如设置日期格式、设置字段的命名策略等。

示例代码：

```java
Gson gson = new GsonBuilder()
    .setDateFormat("yyyy-MM-dd'T'HH:mm:ssZ")
    .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
    .create();
```

### Apache HttpClient

Apache HttpClient是一个用于创建HTTP客户端的库，它使用建造者模式来创建HttpClient对象。HttpClientBuilder类是一个建造者类，它包含了一系列的方法，用于配置HttpClient的行为，如设置连接池、设置代理、设置Cookie管理器等。

示例代码：

```java
HttpClient httpClient = HttpClientBuilder.create()
    .setMaxConnTotal(100)
    .setMaxConnPerRoute(10)
    .setProxy(new HttpHost("localhost", 8080))
    .setDefaultCookieStore(new BasicCookieStore())
    .build();
```

### Apache Kafka

Apache Kafka是一个分布式消息队列系统，它使用建造者模式来创建Producer和Consumer对象。ProducerConfig和ConsumerConfig类是建造者类，它们包含了一系列的方法，用于配置Producer和Consumer的行为，如设置broker地址、设置序列化器等。

示例代码：

```java
Properties producerProps = new Properties();
producerProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
producerProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
producerProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());

Producer<String, String> producer = new KafkaProducer<>(producerProps);

Properties consumerProps = new Properties();
consumerProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
consumerProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
consumerProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
consumerProps.put(ConsumerConfig.GROUP_ID_CONFIG, "my-group");

Consumer<String, String> consumer = new KafkaConsumer<>(consumerProps);
```

### Apache Commons Configuration

Apache Commons Configuration是一个用于读取和写入各种配置文件的库，它使用建造者模式来创建Configuration对象。ConfigurationBuilder类是一个建造者类，它包含了一系列的方法，用于配置Configuration的行为，如设置配置文件类型、设置属性的分隔符等。

示例代码：

```java
Configuration config = new ConfigurationBuilder()
    .setDelimiterParsingDisabled(true)
    .setFile(new File("config.properties"))
    .setListDelimiterHandler(new DefaultListDelimiterHandler(','))
    .build();
```

### Guava

Guava是一个Google开发的Java库，它包含了许多实用的工具类和数据结构，其中包括使用建造者模式来创建的ImmutableList、ImmutableMap和ImmutableSet等不可变集合类。

示例代码：

```java
ImmutableList<String> list = ImmutableList.<String>builder()
    .add("foo")
    .add("bar")
    .add("baz")
    .build();
    
ImmutableMap<String, Integer> map = ImmutableMap.<String, Integer>builder()
    .put("foo", 1)
    .put("bar", 2)
    .put("baz", 3)
    .build();

ImmutableSet<String> set = ImmutableSet.<String>builder()
    .add("foo")
    .add("bar")
    .add("baz")
    .build();
```

### JPA

Java Persistence API（JPA）是Java EE平台的一个ORM框架，它使用建造者模式来创建EntityManagerFactory对象。EntityManagerFactoryBuilder类是一个建造者类，它包含了一系列的方法，用于配置EntityManagerFactory的行为，如设置数据源、设置JPA的属性等。

示例代码：

```java
EntityManagerFactory entityManagerFactory = new EntityManagerFactoryBuilder()
    .dataSource(myDataSource)
    .persistenceUnit("myPersistenceUnit")
    .properties(myProperties)
    .build();
```

### Spring Framework

Spring Framework是一个Java平台上的开源应用程序框架，它使用建造者模式来创建RestTemplate和HttpHeaders对象。RestTemplateBuilder和HttpHeadersBuilder类是建造者类，它们包含了一系列的方法，用于配置RestTemplate和HttpHeaders的行为，如设置连接超时、设置请求头等。

示例代码：

```java
RestTemplate restTemplate = new RestTemplateBuilder()
    .setConnectTimeout(Duration.ofSeconds(10))
    .setReadTimeout(Duration.ofSeconds(10))
    .build();

HttpHeaders headers = new HttpHeadersBuilder()
    .setContentType(MediaType.APPLICATION_JSON)
    .build();
```



## 优化

建造者模式的优化主要包括以下几个方面：

### 使用静态内部类优化建造者模式

建造者模式通常使用一个Builder类来构建复杂对象，为了避免Builder类变得过于臃肿，可以将其设计为静态内部类，这样可以使代码更加清晰，同时也能够保证线程安全。



### 使用流式接口优化建造者模式

流式接口是一种链式调用的方式，它可以将多个方法调用连接起来，形成一个链式结构，使得代码更加简洁易读。在建造者模式中，可以使用流式接口来优化Builder类，使得客户端可以通过链式调用的方式来创建复杂对象，从而简化代码。



### 使用默认值优化建造者模式

在建造者模式中，有些属性是必须的，而有些属性是可选的，可以使用默认值来为可选属性设置默认值，从而避免客户端必须为每个可选属性都提供值的情况，同时也能够简化客户端代码。



### 使用Java 8中的Optional类优化建造者模式

Java 8中引入了Optional类，该类可以用于处理可能为null的值，可以进一步优化建造者模式中的代码。

在建造者模式中，我们通常需要设置多个属性，其中有些属性可能是可选的，如果直接使用null来表示可选属性的值，可能会导致代码出现空指针异常，而使用Optional类可以避免这个问题。

下面是一个使用Optional类优化建造者模式的示例代码：

```java
import java.util.Optional;

public class Computer {
    private String cpu;
    private String memory;
    private String hardDisk;
    private Optional<String> graphicsCard;
    
    private Computer(ComputerBuilder builder) {
        this.cpu = builder.cpu;
        this.memory = builder.memory;
        this.hardDisk = builder.hardDisk;
        this.graphicsCard = builder.graphicsCard;
    }
    
    // 省略getter方法
    
    public static class ComputerBuilder {
        private String cpu;
        private String memory;
        private String hardDisk;
        private Optional<String> graphicsCard = Optional.empty();
        
        public ComputerBuilder setCpu(String cpu) {
            this.cpu = cpu;
            return this;
        }
        
        public ComputerBuilder setMemory(String memory) {
            this.memory = memory;
            return this;
        }
        
        public ComputerBuilder setHardDisk(String hardDisk) {
            this.hardDisk = hardDisk;
            return this;
        }
        
        public ComputerBuilder setGraphicsCard(String graphicsCard) {
            this.graphicsCard = Optional.ofNullable(graphicsCard);
            return this;
        }
        
        public Computer build() {
            return new Computer(this);
        }
    }
}
```

在这个示例代码中，我们使用 `Optional` 类来表示可选属性的值，将graphicsCard属性的类型改为`Optional<String>`。在 ComputerBuilder 类中，我们使用 `Optional.ofNullable `方法来将可选属性的值转换为 Optional 对象，并在调用 build 方法时，将 Optional 对象转换为普通的字符串类型。



### 使用 Lambda表达式优化建造者模式

Lambda表达式是Java 8中引入的一种新的语言特性，可以进一步优化建造者模式中的代码，使得代码更加简洁易读。

在建造者模式中，我们通常需要定义多个属性，并在构造方法中进行初始化。使用Lambda表达式可以避免定义多个属性的问题，将属性的赋值操作通过Lambda表达式传递给构造方法。

下面是一个使用Lambda表达式优化建造者模式的示例代码：

```java
import java.util.Optional;
import java.util.function.Consumer;

public class Computer {
    private String cpu;
    private String memory;
    private String hardDisk;
    private Optional<String> graphicsCard;
    
    private Computer(Consumer<ComputerBuilder> builder) {
        ComputerBuilder computerBuilder = new ComputerBuilder();
        builder.accept(computerBuilder);
        this.cpu = computerBuilder.cpu;
        this.memory = computerBuilder.memory;
        this.hardDisk = computerBuilder.hardDisk;
        this.graphicsCard = computerBuilder.graphicsCard;
    }
    
    // 省略getter方法
    
    public static class ComputerBuilder {
        private String cpu;
        private String memory;
        private String hardDisk;
        private Optional<String> graphicsCard = Optional.empty();
        
        public ComputerBuilder setCpu(String cpu) {
            this.cpu = cpu;
            return this;
        }
        
        public ComputerBuilder setMemory(String memory) {
            this.memory = memory;
            return this;
        }
        
        public ComputerBuilder setHardDisk(String hardDisk) {
            this.hardDisk = hardDisk;
            return this;
        }
        
        public ComputerBuilder setGraphicsCard(String graphicsCard) {
            this.graphicsCard = Optional.ofNullable(graphicsCard);
            return this;
        }
    }
    
    public static void main(String[] args) {
        Computer computer = new Computer(builder -> builder
                .setCpu("Intel i7")
                .setMemory("16GB")
                .setHardDisk("512GB SSD")
                .setGraphicsCard("NVIDIA GTX 1660"));
    }
}
```

在这个示例代码中，我们将 Computer 类的构造方法改为接收一个 `Consumer<ComputerBuilder> `类型的参数，这个参数表示一个包含属性赋值操作的 Lambda 表达式。在构造方法中，我们先创建一个ComputerBuilder 对象，然后通过 Lambda 表达式调用 ComputerBuilder 对象的方法来设置属性值，并最终通过 ComputerBuilder 对象创建 Computer 对象。



### 使用泛型和反射优化

```java
class EntityCreator<T> {

    private Class<T> classInstance;
    private T entityObj;

    public EntityCreator(Class<T> classInstance, Object... initParams) throws Exception {
        this.classInstance = classInstance;
        Class<?>[] paramTypes = new Class<?>[initParams.length];
        for (int index = 0, length = initParams.length; index < length; index++) {
            String checkStr = initParams[index].getClass().getSimpleName();
            if (checkStr.contains("Integer")) {
                paramTypes[index] = int.class;
            }
            if (checkStr.contains("Double")) {
                paramTypes[index] = double.class;
            }
            if (checkStr.contains("Boolean")) {
                paramTypes[index] = boolean.class;
            }
            if (checkStr.contains("String")) {
                paramTypes[index] = initParams[index].getClass();
            }
        }
        Constructor<T> constructor = classInstance.getDeclaredConstructor(paramTypes);
        constructor.setAccessible(true);
        this.entityObj = constructor.newInstance(initParams);
    }

    public EntityCreator<T> setValue(String paramName, Object paramValue) throws Exception {
        Field field = classInstance.getDeclaredField(paramName);
        field.setAccessible(true);
        field.set(entityObj, paramValue);
        return this;
    }

    public T build() {
        return entityObj;
    }
}
```

​		如此，可移除整个内部 Builder 类，NutritionFacts 类私有构造的参数仅包括两个必填的 servingSize、servings 字段：

```java
public class NutritionFacts {
    // Required parameters
    private final int servingSize;
    private final int servings;
    // Optional parameters - initialized to default values
    private int calories = 0;
    private int fat = 0;
    private int sodium = 0;
    private int carbohydrate = 0;

    private NutritionFacts(int servingSize, int servings) {
        this.servingSize = servingSize;
        this.servings = servings;
    }
}
```

该案例的客户端代码改为：

```java
NutritionFacts cocaCola = new EntityCreator<>(NutritionFacts.class, 240, 8)
        .setValue("calories", 100)
        .setValue("sodium", 35)
        .setValue("carbohydrate", 27).build();
```
