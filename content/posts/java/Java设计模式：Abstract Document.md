---
title: "Java设计模式：Abstract Document"
date: 2023-05-22
slug: java-design-patterns-abstract-document
categories: ["Java"]
tags: [java, spring]
---

本文主要介绍 Abstract Document 模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

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

使用动态属性，并在保持类型安全的同时实现非类型化语言的灵活性。

> 抽象文档模式中的属性对象可以动态添加和删除属性，并且属性类型是在运行时确定的，这使得抽象文档模式具有一定的灵活性和可扩展性。
>
> 在抽象文档模式中，属性对象通常使用 Map 或者 List 等数据结构来实现。动态属性的添加和删除可以通过 Map 的 put 和 remove 方法实现，而属性的类型可以通过泛型来确定。

## 解释

抽象文档模式使您能够处理其他非静态属性。 此模式使用特征的概念来实现类型安全，并将不同类的属性分离为一组接口。

真实世界例子

> 考虑由多个部分组成的汽车。 但是，我们不知道特定汽车是否真的拥有所有零件，或者仅仅是零件中的一部分。 我们的汽车是动态而且非常灵活的。

通俗的说

> 抽象文档模式允许在对象不知道的情况下将属性附加到对象。

维基百科说

> 面向对象的结构设计模式，用于组织松散类型的键值存储中的对象并使用类型化的视图公开数据。 该模式的目的是在强类型语言中实现组件之间的高度灵活性，在这种语言中，可以在不丢失类型安全支持的情况下，将新属性动态地添加到对象树中。 该模式利用特征将类的不同属性分成不同的接口。

**程序示例**

让我们首先定义基类`Document`和`AbstractDocument`。 它们基本上使对象拥有属性映射和任意数量的子对象。

> 以下代码在 java 8 中编译正常。

Document 接口：

```java
public interface Document {

  Void put(String key, Object value);

  Object get(String key);

  <T> Stream<T> children(String key, Function<Map<String, Object>, T> constructor);
}
```

> 以下接口不使用 Java 8 的 Stream API：
>
> ```java
> public interface Document {
>   Object get(String key);
>   void put(String key, Object value);
>   List<Document> children(String key);
> }
> ```

AbstractDocument 抽象类：

```java
public abstract class AbstractDocument implements Document {

	private final Map<String, Object> properties;

	protected AbstractDocument(Map<String, Object> properties) {
		Objects.requireNonNull(properties, "properties map is required");
		this.properties = properties;
	}

	@Override
	public Void put(String key, Object value) {
		properties.put(key, value);
		return null;
	}

	@Override
	public Object get(String key) {
		return properties.get(key);
	}

	@Override
	public <T> Stream<T> children(String key, Function<Map<String, Object>, T> constructor) {
		// java 9
//		return Stream.ofNullable(get(key))
//			.filter(Objects::nonNull)
//			.map(el -> (List<Map<String, Object>>) el)
//			.findAny()
//			.stream()
//			.flatMap(Collection::stream)
//			.map(constructor);

		// java 8
		return Optional.ofNullable(get(key))
			.filter(el -> el instanceof List<?>)
			.map(el -> (List<Map<String, Object>>) el)
			.map(List::stream)
			.orElseGet(Stream::empty)
			.map(constructor);
	}

	@Override
	public String toString() {
		return properties.toString();
	}
}
```

接下来，我们定义一个枚举“属性”和一组类型，价格，模型和零件的接口。 这使我们能够为 Car 类创建静态外观的界面。

```java
public enum Property {
  PARTS, TYPE, PRICE, MODEL
}

public interface HasType extends Document {
  default Optional<String> getType() {
    return Optional.ofNullable((String) get(Property.TYPE.toString()));
  }
}

public interface HasPrice extends Document {
  default Optional<Number> getPrice() {
    return Optional.ofNullable((Number) get(Property.PRICE.toString()));
  }
}
public interface HasModel extends Document {
  default Optional<String> getModel() {
    return Optional.ofNullable((String) get(Property.MODEL.toString()));
  }
}

public interface HasParts extends Document {
  default Stream<Part> getParts() {
    return children(Property.PARTS.toString(), Part::new);
  }
}

public class Part extends AbstractDocument implements HasType, HasModel, HasPrice {
  public Part(Map<String, Object> properties) {
    super(properties);
  }
}
```

现在我们准备介绍 `Car`。

```java
public class Car extends AbstractDocument implements HasModel, HasPrice, HasParts {

  public Car(Map<String, Object> properties) {
    super(properties);
  }
}
```

最后是完整示例中的`Car`构造和使用方式。

```java
@Slf4j
public class App {
	/**
	 * Program entry point.
	 *
	 * @param args command line args
	 */
	public static void main(String[] args) {
		log.info("Constructing parts and car");

		Map<String, Object> wheelProperties = ImmutableMap.of(
			Property.TYPE.toString(), "wheel",
			Property.MODEL.toString(), "15C",
			Property.PRICE.toString(), 100L);

		Map<String, Object> doorProperties = ImmutableMap.of(
			Property.TYPE.toString(), "door",
			Property.MODEL.toString(), "Lambo",
			Property.PRICE.toString(), 300L);

		Map<String, Object> carProperties = ImmutableMap.of(
			Property.MODEL.toString(), "300SL",
			Property.PRICE.toString(), 10000L,
			Property.PARTS.toString(), ImmutableList.of(wheelProperties, doorProperties));

		Car car = new Car(carProperties);

		log.info("Here is our car:");
		log.info("-> model: {}", car.getModel().orElse(null));
		log.info("-> price: {}", car.getPrice().orElse(null));
		log.info("-> parts: ");
		car.getParts().forEach(p -> log.info("\t{}/{}/{}",
			p.getType().orElse(null),
			p.getModel().orElse(null),
			p.getPrice().orElse(null))
		);
	}
}
```

再来一个示例代码：

```java
public class Person extends AbstractDocument{
  public Person() {
    super(Map.of(
      "name", "John Doe",
      "age", 30,
      "hobbies", List.of("Sports", "Music"));
  }
}


@Slf4j
public class PersonApp {
	public static void main(String[] args) {
		Person person = new Person();
		log.info("name: {}", person.get("name"));
		log.info("age: {}", person.get("age"));
		log.info("hobbies: {}", person.get("hobbies"));
	}
}
```

## 类图

![alt text](https://java-design-patterns.com/assets/abstract-document-9f6a2e8d.png)

## 适用性

使用抽象文档模式，当

- 需要即时添加新属性
- 你想要一种灵活的方式来以树状结构组织域
- 你想要更宽松的耦合系统

下面是抽象文档模式的一些实际应用：

### 1、XML 和 JSON 解析

抽象文档模式可以用于解析 XML 和 JSON 数据。由于 XML 和 JSON 数据通常包含动态属性，因此抽象文档模式可以提供一种灵活的方式来处理这些数据。通过将 XML 或 JSON 数据映射到文档和属性对象，可以轻松地访问和修改这些数据。

#### XML 解析

假设我们有一个简单的 XML 文件，内容如下：

```xml
<bookstore>
  <book category="cooking">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="children">
    <title lang="en">Harry Potter</title>
    <author>J.K. Rowling</author>
    <year>2003</year>
    <price>29.99</price>
  </book>
</bookstore>
```

我们可以使用抽象文档模式来解析这个 XML 文件，首先定义一个`Document`接口，如下所示：

```java
public interface Document {
  Object get(String key);
  void put(String key, Object value);
  List<Document> children(String key);
}
```

然后定义一个具体的 XML 文档类，如下所示：

```java
public class XmlDocument implements Document {
  private final Element element;

  public XmlDocument(Element element) {
    this.element = element}

  @Override
  public Object get(String key) {
    return element.getAttribute(key);
  }

  @Override
  public void put(String key, Object value) {
    element.setAttribute(key, value.toString());
  }

  @Override
  public List<Document> children(String key) {
    NodeList nodes = element.getElementsByTagName(key);
    List<Document> children = new ArrayList<>();
    for (int i = 0; i < nodes.getLength(); i++) {
      children.add(new XmlDocument((Element) nodes.item(i)));
    }
    return children;
  }
}
```

在这个具体的 XML 文档类中，我们实现了`Document`接口的三个方法，其中`children`方法使用了 DOM API 来获取子元素列表，并将每个子元素包装成一个新的`XmlDocument`对象。

现在，我们可以使用这个具体的 XML 文档类来解析 XML 文件，如下所示：

```java
DocumentBuilderFactory dbFactory = DocumentBuilderFactory.newInstance();
DocumentBuilder dBuilder = dbFactory.newDocumentBuilder();
Document doc = new XmlDocument(dBuilder.parse(new File("books.xml")).getDocumentElement());

// 获取根元素的属性值
String bookstoreCategory = (String) doc.get("category");

// 获取所有书的信息
List<Document> books = doc.children("book");
for (Document book : books) {
  String category = (String)doc.get("category");
  String title = (String) book.children("title").get(0).get("");
  String author = (String) book.children("author").get(0).get("");
  int year = (int) book.children("year").get(0).get("");
  double price = (double) book.children("price").get(0).get("");
  System.out.println("Category: " + category + ", Title: " + title + ", Author: " + author + ", Year: " + year + ", Price: " + price);
}
```

#### JSON 解析

假设我们有一个简单的 JSON 文件，以下是`example.json`文件的内容：：

```json
{
  "name": "John Smith",
  "age": 35,
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345"
  },
  "phone": [
    {
      "type": "home",
      "number": "555-1234"
    },
    {
      "type": "work",
      "number": "555-5678"
    }
  ]
}
```

我们可以使用抽象文档模式来解析这个 JSON 文件，首先定义一个`Document`接口，如下所示：

```java
public interface Document {
  Object get(String key);
  void put(String key, Object value);
  List<Document> children(String key);
}
```

然后定义一个具体的 JSON 文档类，如下所示：

```java
import com.google.gson.*;

import java.util.ArrayList;
import java.util.List;

public class JsonDocument implements Document {
    private final JsonObject object;

    public JsonDocument(JsonObject object) {
        this.object = object;
    }

    @Override
    public Object get(String key) {
        JsonElement element = object.get(key);
        if (element == null) {
            return null;
        }
        if (element.isJsonPrimitive()) {
            JsonPrimitive primitive = element.getAsJsonPrimitive();
            if (primitive.isNumber()) {
                return primitive.getAsNumber();
            } else if (primitive.isBoolean()) {
                return primitive.getAsBoolean();
            } else {
                return primitive.getAsString();
            }
        } else if (element.isJsonObject()) {
            return new JsonDocument(element.getAsJsonObject());
        } else if (element.isJsonArray()) {
            JsonArray array = element.getAsJsonArray();
            List<Document> children = new ArrayList<>();
            for (JsonElement child : array) {
                children.add(new JsonDocument(child.getAsJsonObject()));
            }
            return children;
        } else {
            return null;
        }
    }

    @Override
    public void put(String key, Object value) {
        if (value instanceof String) {
            object.addProperty(key, (String) value);
        } else if (value instanceof Number) {
            object.addProperty(key, (Number) value);
        } else if (value instanceof Boolean) {
            object.addProperty(key, (Boolean) value);
        } else if (value instanceof Document) {
            JsonDocument jsonDocument = (JsonDocument) value;
            object.add(key, jsonDocument.object);
        } else if (value instanceof List) {
            List<Document> children = (List<Document>) value;
            JsonArray array = new JsonArray();
            for (Document child : children) {
                JsonDocument jsonChild = (JsonDocument) child;
                array.add(jsonChild.object);
            }
            object.add(key, array);
        }
    }

    @Override
    public List<Document> children(String key) {
        JsonElement element = object.get(key);
        List<Document> children = new ArrayList<>();
        if (element != null && element.isJsonArray()) {
            JsonArray array = element.getAsJsonArray();
            for (JsonElement child : array) {
                children.add(new JsonDocument(child.getAsJsonObject()));
            }
        }
        return children;
    }
}
```

现在，我们可以使用这个具体的 JSON 文档类来解析 JSON 文件，如下所示：

```java
public class JsonParsingExample {
    public static void main(String[] args) {
        try {
            // 读取JSON文件并解析
            Gson gson = new Gson();
            JsonElement jsonElement = gson.fromJson(new FileReader("example.json"), JsonElement.class);
            JsonDocument doc = new JsonDocument(jsonElement.getAsJsonObject());

            // 获取根元素的属性值
            String name = (String) doc.get("name");
            int age = (int) doc.get("age");

            // 获取地址
            JsonDocument address = (JsonDocument) doc.get("address");
            String street = (String) address.get("street");
            String city = (String) address.get("city");
            String state = (String) address.get("state");
            String zip = (String) address.get("zip");

            // 获取电话号码
            List<Document> phoneList = doc.children("phone");
            for (Document phone : phoneList) {
                String type = (String) phone.get("type");
                String number = (String) phone.get("number");
                System.out.println(type + ": " + number);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### 2、动态配置

抽象文档模式可以用于动态配置。通过将配置数据映射到文档和属性对象，可以轻松地访问和修改配置数据。此外，由于抽象文档模式支持动态属性，因此可以在运行时添加或删除属性，从而使配置更加灵活。

假设有一个学生信息管理系统，需要存储和检索学生信息。学生信息包括学生姓名、学生年龄、学生性别、学生家庭地址等属性。由于学生属性可能会随时变化，因此需要使用一种灵活的方式来处理这些属性，并且需要轻松地访问和修改这些属性。

为了实现这个功能，可以使用抽象文档模式。定义一个学生文档类（StudentDocument），该类包含学生属性的访问器和修改器方法，并且支持动态属性。然后，定义一个学生属性类（Property），该类包含属性名称、属性类型和属性值等属性，并且支持动态属性。最后，使用一个构建器（Builder）类来创建具体的学生文档对象，并将学生属性添加到文档中。

示例代码如下：

```java
import java.util.ArrayList;
import java.util.List;

public class Property {
    private String name;
    private Object value;

    public Property(String name, Object value) {
        this.name = name;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }
}

public abstract class Document {
    private List<Property> properties = new ArrayList<>();

    public Object getProperty(String name) {
        for (Property property : properties) {
            if (property.getName().equals(name)) {
                return property.getValue();
            }
        }
        return null;
    }

    public void setProperty(String name, Object value) {
        for (Property property : properties) {
            if (property.getName().equals(name)) {
                property.setValue(value);
                return;
            }
        }
        properties.add(new Property(name, value));
    }
}

public class StudentDocument extends Document {
    public String getName() {
        return (String) getProperty("name");
    }

    public void setName(String name) {
        setProperty("name", name);
    }

    public int getAge() {
        return (int) getProperty("age");
    }

    public void setAge(int age) {
        setProperty("age", age);
    }

    public String getGender() {
        return (String) getProperty("gender");
    }

    public void setGender(String gender) {
        setProperty("gender", gender);
    }

    public String getAddress() {
        return (String) getProperty("address");
    }

    public void setAddress(Stringaddress) {
        setProperty("address", address);
    }
}

public class StudentBuilder {
    private StudentDocument student = new StudentDocument();

    public void setName(String name) {
        student.setName(name);
    }

    public void setAge(int age) {
        student.setAge(age);
    }

    public void setGender(String gender) {
        student.setGender(gender);
    }

    public void setAddress(String address) {
        student.setAddress(address);
    }

    public StudentDocument build() {
        return student;
    }
}
```

使用抽象文档模式，可以轻松地访问和修改学生属性，如下所示：

```java
StudentBuilder builder = new StudentBuilder();
builder.setName("Tom");
builder.setAge(18);
builder.setGender("Male");
builder.setAddress("Beijing");

StudentDocument student = builder.build();

System.out.println(student.getName()); // 输出：Tom
student.setAddress("Shanghai");
System.out.println(student.getAddress()); // 输出：Shanghai
student.setProperty("phoneNumber", "1234567890");
System.out.println(student.getProperty("phoneNumber")); // 输出：1234567890
```

### 3、业务规则引擎

抽象文档模式可以用于实现业务规则引擎。通过将规则数据映射到文档和属性对象，可以轻松地访问和修改规则数据。此外，由于抽象文档模式支持动态属性，因此可以在运行时添加或删除规则，从而使规则引擎更加灵活。

假设我们有一个简单的业务规则，用于确定用户是否有资格获得某项奖励。这个规则可能涉及到多个条件，例如用户的年龄、所在地区以及购物金额等。

我们可以将这个规则表示为一个文档，例如一个 JSON 文档，其中每个属性对应一个规则条件。例如：

```json
{
  "age": {
    "operator": ">=",
    "value": 18
  },
  "region": {
    "operator": "in",
    "value": ["east", "south"]
  },
  "amount": {
    "operator": ">=",
    "value": 1000
  }
}
```

然后，我们可以使用抽象文档模式来解析这个文档，并将其转换为一个规则对象。例如，我们可以创建一个名为`Rule`的类，它包含三个属性：

```java
public class Rule {
    private final String key;
    private final String operator;
    private final Object value;
    private final Object secondValue;

    public Rule(String key, String operator, Object value) {
        this(key, operator, value, null);
    }

    public Rule(String key, String operator, Object value, Object secondValue) {
        this.key = key;
        this.operator = operator;
        this.value = value;
        this.secondValue = secondValue;
    }

    public boolean evaluate(Document document) {
        Object documentValue = document.get(key);
        if (documentValue == null) {
            return false;
        }
        switch (operator) {
            case ">=":
                return compare(documentValue, value) >= 0;
            case "<=":
                return compare(documentValue, value) <= 0;
            case ">":
                return compare(documentValue, value) > 0;
            case "<":
                return compare(documentValue, value) < 0;
            case "==":
                return compare(documentValue,value) == 0;
            case "!=":
                return compare(documentValue, value) != 0;
          	case "in":
                if (value instanceof List) {
                    List<?> listValue = (List<?>) value;
                    for (Object item : listValue) {
                        if (compare(documentValue, item) == 0) {
                            return true;
                        }
                    }
                }
                return false;
            case "not in":
            		boolean found=false;
                if (value instanceof List) {
                    List<?> listValue = (List<?>) value;
                    for (Object item : listValue) {
                        if (compare(documentValue, item) == 0) {
                            found=true;
                          	break;
                        }
                    }
                }
                return !found;
          	case "between":
                if (secondValue == null) {
                    return false;
                }
                int cmp1 = compare(documentValue, value);
                int cmp2 = compare(documentValue, secondValue);
                return cmp1 >= 0 && cmp2 <= 0;
            case "not between":
                if (secondValue == null) {
                    return false;
                }
                int cmp1 = compare(documentValue, value);
                int cmp2 = compare(documentValue, secondValue);
                return cmp1 < 0 || cmp2 > 0;
          	case "regex":
                if (documentValue instanceof String && value instanceof String) {
                    String strValue = (String) value;
                    String strDocumentValue = (String) documentValue;
                    return strDocumentValue.matches(strValue);
                }
                return false;
            case "startswith":
                if(documentValue instanceof String && value instanceof String) {
                    String strValue = (String) value;
                    String strDocumentValue = (String) documentValue;
                    return strDocumentValue.startsWith(strValue);
                }
                return false;
            case "endswith":
                if (documentValue instanceof String && value instanceof String) {
                    String strValue = (String) value;
                    String strDocumentValue = (String) documentValue;
                    return strDocumentValue.endsWith(strValue);
                }
                return false;
            case "like":
                if (documentValue instanceof String && value instanceof String) {
                    String strValue = (String) value;
                    String strDocumentValue = (String) documentValue;
                    return strDocumentValue.contains(strValue);
                }
                return false;
          	case "not like":
                if (documentValue instanceof String && value instanceof String) {
                    String strValue = (String) value;
                    String strDocumentValue = (String) documentValue;
                    return !strDocumentValue.contains(strValue);
                }
                return false;
           	default:
                return false;
        }
    }

    private int compare(Object a, Object b) {
        if (a instanceof Number && b instanceof Number) {
            return Double.compare(((Number) a).doubleValue(), ((Number) b).doubleValue());
        } else if (a instanceof String && b instanceof String) {
            return ((String) a).compareTo((String) b);
        } else {
            return a.toString().compareTo(b.toString());
        }
    }
}
```

`Rule`类有一个`evaluate`方法，它接受一个`Document`对象，并根据规则条件对文档进行评估。例如，对于上面的规则文档，我们可以创建三个`Rule`对象：

```java
Rule ageRule = new Rule("age", "between", 18, 30);
Rule regionRule = new Rule("region", "in", Arrays.asList("east", "south"));
Rule amountRule = new Rule("amount", ">=", 1000);
```

然后，我们可以将这些规则应用于用户数据，例如一个存储在数据库中的用户记录。我们可以将用户数据表示为一个文档，例如一个 XML 文档：

```xml
<user>
  <name>John Doe</name>
  <age>25</age>
  <region>east</region>
  <amount>1200</amount>
</user>
```

我们可以使用抽象文档模式解析该文档并将其转换为`Document`对象。然后，我们可以使用`Rule`对象和`Document`对象来评估用户是否有资格获得奖励。例如：

```java
Document userDocument = ... // 解析用户数据为一个Document对象
boolean isEligible = ageRule.evaluate(userDocument) && regionRule.evaluate(userDocument) && amountRule.evaluate(userDocument);
```

### 4、数据库映射

抽象文档模式可以用于将数据库数据映射到文档和属性对象上。通过将数据库表映射到文档对象，将表的列映射到属性对象，可以轻松地访问和修改数据库数据。
