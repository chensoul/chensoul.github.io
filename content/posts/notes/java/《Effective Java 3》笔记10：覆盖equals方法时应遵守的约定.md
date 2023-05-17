---
title: "《Effective Java 3》笔记10：覆盖equals方法时应遵守的约定"
date: 2023-05-17T10:00:00+08:00
slug: obey-the-general-contract-when-overriding-equals
categories: ["Notes"]
tags: [java]
---

本文是 《Effective Java 3》第三章《对象的通用方法》的学习笔记：覆盖 equals 方法时应遵守的约定。

## 介绍

覆盖 equals 方法似乎很简单，但是有很多覆盖的方式会导致出错，而且后果可能非常严重。避免问题的最简单方法是不覆盖 equals 方法，在这种情况下，类的每个实例都只等于它自己。如果符合下列任何条件，就是正确的做法：

- **类的每个实例本质上都是唯一的。** 对于像 Thread 这样表示活动实体类而不是值类来说也是如此。Object 提供的 equals 实现对于这些类具有完全正确的行为。

- **该类不需要提供「逻辑相等」测试。** 例如，`java.util.regex.Pattern` 可以覆盖 equals 来检查两个 Pattern 实例是否表示完全相同的正则表达式，但设计人员认为客户端不需要或不需要这个功能。在这种情况下，从 Object 继承的 equals 实现是理想的。

- **超类已经覆盖了 equals，超类行为适合于这个类。** 例如，大多数 Set 的实现从 AbstractSet 继承其对等实现，List 从 AbstractList 继承实现，Map 从 AbstractMap 继承实现。

- **类是私有的或包私有的，并且你确信它的 equals 方法永远不会被调用。** 如果你非常厌恶风险，你可以覆盖 equals 方法，以确保它不会意外调用：

  ```java
  @Override
  public boolean equals(Object o) {
      throw new AssertionError(); // Method is never called
  }
  ```

  

什么时候覆盖 equals 方法是合适的？当一个类有一个逻辑相等的概念，而这个概念不同于仅判断对象的同一性（相同对象的引用），并且超类还没有覆盖 equals。对于值类通常是这样。值类只是表示值的类，例如 Integer 或 String。使用 equals 方法比较引用和值对象的程序员希望发现它们在逻辑上是否等价，而不是它们是否引用相同的对象。覆盖 equals 方法不仅是为了满足程序员的期望，它还使实例能够作为 Map 的键或 Set 元素时，具有可预测的、理想的行为。



**有一个表示状态的内部类。没有覆盖 equals 方法时，equals 的结果与 s1==s2 相同，为 false，即两者并不是相同对象的引用。**

```java
public static void main(String[] args) {

    class Status {
        public String status;
    }

    Status s1 = new Status();
    Status s2 = new Status();

    System.out.println(s1==s2); // false
    System.out.println(s1.equals(s2)); // false
}
```

**覆盖 equals 方法后，以业务逻辑来判断是否相同，具备相同 status 字段即为相同。在使用去重功能时，也以此作为判断依据。**

```java
public static void main(String[] args) {

    class Status {
        public String status;

        @Override
        public boolean equals(Object o) {
            return Objects.equals(status, ((Status) o).status);
        }
    }

    Status s1 = new Status();
    Status s2 = new Status();

    System.out.println(s1==s2); // false
    System.out.println(s1.equals(s2)); // true
}
```

不需要覆盖 equals 方法的一种值类是使用实例控件来确保每个值最多只存在一个对象的类。枚举类型属于这一类。对于这些类，逻辑相等与对象标识相同，因此对象的 equals 方法函数与逻辑 equals 方法相同。



当你覆盖 equals 方法时，你必须遵守它的通用约定。以下是具体内容，来自 Object 规范：equals 方法实现了等价关系。它应有这些属性：

- 反射性：对于任何非空的参考值 x，`x.equals(x)` 必须返回 true。
- 对称性：对于任何非空参考值 x 和 y，`x.equals(y)` 必须在且仅当 `y.equals(x)` 返回 true 时返回 true。
- 传递性：对于任何非空的引用值 x, y, z，如果 `x.equals(y)` 返回 true，`y.equals(z)` 返回 true，那么 `x.equals(z)` 必须返回 true。
- 一致性：对于任何非空的引用值 x 和 y, `x.equals(y)` 的多次调用必须一致地返回 true 或一致地返回 false，前提是不修改 equals 中使用的信息。
- 对于任何非空引用值 x，`x.equals(null)` 必须返回 false。



除非你有数学方面的倾向，否则这些起来有点可怕，但不要忽略它！如果你违反了它，你的程序很可能会出现行为异常或崩溃，并且很难确定失败的根源。用 John Donne 的话来说，没有一个类是孤立的。一个类的实例经常被传递给另一个类。许多类（包括所有集合类）依赖于传递给它们的对象遵守 equals 约定。

既然你已经意识到了违反 equals 约定的危险，让我们详细讨论一下。好消息是，尽管表面上看起来很复杂，但其实并不复杂。一旦你明白了，就不难坚持下去了。



什么是等价关系？简单地说，它是一个操作符，它将一组元素划分为子集，子集的元素被认为是彼此相等的。这些子集被称为等价类。为了使 equals 方法有用，从用户的角度来看，每个等价类中的所有元素都必须是可互换的。现在让我们依次检查以下五个需求：

- **反射性** ，第一个要求仅仅是说一个对象必须等于它自己。很难想象会无意中违反了这条规则。如果你违反了它，然后将类的一个实例添加到集合中，contains 方法很可能会说该集合不包含你刚才添加的实例。

- **对称性** ，第二个要求是任何两个对象必须在是否相等的问题上达成一致。与第一个要求不同，无意中违反了这个要求的情况不难想象。例如，考虑下面的类，它实现了不区分大小写的字符串。字符串的情况是保留的 toString，但忽略在 equals 的比较：

  ```java
  // Broken - violates symmetry!
  public final class CaseInsensitiveString {
      private final String s;
  
      public CaseInsensitiveString(String s) {
          this.s = Objects.requireNonNull(s);
  }
  
  // Broken - violates symmetry!
  @Override
  public boolean equals(Object o) {
      if (o instanceof CaseInsensitiveString)
      return s.equalsIgnoreCase(((CaseInsensitiveString) o).s);
  
      if (o instanceof String) // One-way interoperability!
          return s.equalsIgnoreCase((String) o);
  
      return false;
      } ... // Remainder omitted
  }
  ```

  这个类中的 equals 方法天真地尝试与普通字符串进行互操作。假设我们有一个不区分大小写的字符串和一个普通字符串：

  ```java
  CaseInsensitiveString cis = new CaseInsensitiveString("Polish");
  String s = "polish";
  ```

  正如预期的那样，`cis.equals(s)` 返回 true。问题是，虽然 CaseInsensitiveString 中的 equals 方法知道普通字符串，但是 String 中的 equals 方法对不区分大小写的字符串不知情。因此，`s.equals(cis)` 返回 false，这明显违反了对称性。假设你将不区分大小写的字符串放入集合中：

  ```java
  List<CaseInsensitiveString> list = new ArrayList<>();
  list.add(cis);
  ```

  此时 `list.contains(s)` 返回什么？谁知道呢？在当前的 OpenJDK 实现中，它碰巧返回 false，但这只是一个实现案例。在另一个实现中，它可以很容易地返回 true 或抛出运行时异常。一旦你违反了 equals 约定，就不知道当其他对象面对你的对象时，会如何表现。

  > **contains 方法在 ArrayList 中的实现源码如下**
  >
  > ```java
  > // ArrayList 的大小
  > private int size;
  > 
  > // 保存 ArrayList 元素的容器，一个 Object 数组
  > transient Object[] elementData; // non-private to simplify nested class access
  > 
  > public boolean contains(Object o) {
  >     return indexOf(o) >= 0;
  > }
  > 
  > public int indexOf(Object o) {
  >     return indexOfRange(o, 0, size);
  > }
  > 
  > int indexOfRange(Object o, int start, int end) {
  >     Object[] es = elementData;
  >     if (o == null) {
  >         for (int i = start; i < end; i++) {
  >             if (es[i] == null) {
  >                 return i;
  >             }
  >         }
  >     } else {
  >         for (int i = start; i < end; i++) {
  >             if (o.equals(es[i])) {
  >                 return i;
  >             }
  >         }
  >     }
  >     return -1;
  > }
  > ```

​		为了消除这个问题，只需从 equals 方法中删除与 String 互操作的错误尝试。一旦你这样做了，你可以重构方法为一个单一的返回语句：

```java
@Override
public boolean equals(Object o) {
    return o instanceof CaseInsensitiveString && ((CaseInsensitiveString) o).s.equalsIgnoreCase(s);
}
```

- **传递性** ，equals 约定的第三个要求是，如果一个对象等于第二个对象，而第二个对象等于第三个对象，那么第一个对象必须等于第三个对象。同样，无意中违反了这个要求的情况不难想象。考虑向超类添加新的值组件时，子类的情况。换句话说，子类添加了一条影响 equals 比较的信息。让我们从一个简单的不可变二维整数点类开始：

  ```java
  public class Point {
      private final int x;
      private final int y;
  
      public Point(int x, int y) {
          this.x = x;
          this.y = y;
      }
  
      @Override
      public boolean equals(Object o) {
          if (!(o instanceof Point))
              return false;
          Point p = (Point)o;
          return p.x == x && p.y == y;
      }
      ... // Remainder omitted
  }
  ```

  假设你想继承这个类，对一个点添加颜色的概念：

  ```java
  public class ColorPoint extends Point {
      private final Color color;
  
      public ColorPoint(int x, int y, Color color) {
          super(x, y);
          this.color = color;
      }
      ... // Remainder omitted
  }
  ```

  equals 方法应该是什么样子？如果你完全忽略它，则实现将从 Point 类继承而来，在 equals 比较中颜色信息将被忽略。虽然这并不违反 equals 约定，但显然是不可接受的。假设你写了一个 equals 方法，该方法只有当它的参数是另一个颜色点，且位置和颜色相同时才返回 true：

  ```java
  // Broken - violates symmetry!
  @Override
  public boolean equals(Object o) {
      if (!(o instanceof ColorPoint))
          return false;
      return super.equals(o) && ((ColorPoint) o).color == color;
  }
  ```

  这种方法的问题是，当你比较一个点和一个颜色点时，你可能会得到不同的结果，反之亦然。前者比较忽略颜色，而后者比较总是返回 false，因为参数的类型是不正确的。为了使问题更具体，让我们创建一个点和一个颜色点：

  ```java
  Point p = new Point(1, 2);
  ColorPoint cp = new ColorPoint(1, 2, Color.RED);
  ```

  然后，`p.equals(cp)` 返回 true，而 `cp.equals(p)` 返回 false。当你做「混合比较」的时候，你可以通过让 `ColorPoint.equals` 忽略颜色来解决这个问题：

  ```java
  // Broken - violates transitivity!
  @Override
  public boolean equals(Object o) {
      if (!(o instanceof Point))
          return false;
  
      // If o is a normal Point, do a color-blind comparison
      if (!(o instanceof ColorPoint))
          return o.equals(this);
  
      // o is a ColorPoint; do a full comparison
      return super.equals(o) && ((ColorPoint) o).color == color;
  }
  ```

  这种方法确实提供了对称性，但牺牲了传递性：

  ```java
  ColorPoint p1 = new ColorPoint(1, 2, Color.RED);
  Point p2 = new Point(1, 2);
  ColorPoint p3 = new ColorPoint(1, 2, Color.BLUE);
  ```

  现在，`p1.equals(p2)` 和 `p2.equals(p3)` 返回 true，而 `p1.equals(p3)` 返回 false，这明显违反了传递性。前两个比较是「色盲」，而第三个比较考虑了颜色。

  

  同样，这种方法会导致无限的递归：假设有两个点的子类，比如 ColorPoint 和 SmellPoint，每个都使用这种 equals 方法。然后调用 `myColorPoint.equals(mySmellPoint)` 会抛出 StackOverflowError。

  那么解决方案是什么？这是面向对象语言中等价关系的一个基本问题。**除非你愿意放弃面向对象的抽象优点，否则无法继承一个可实例化的类并添加一个值组件，同时保留 equals 约定。**

  你可能会听到它说你可以继承一个实例化的类并添加一个值组件，同时通过在 equals 方法中使用 getClass 测试来代替 instanceof 测试来保持 equals 约定：

  ```java
  // Broken - violates Liskov substitution principle (page 43)
  @Override
  public boolean equals(Object o) {
  
      if (o == null || o.getClass() != getClass())
          return false;
  
      Point p = (Point) o;
      return p.x == x && p.y == y;
  }
  ```

  只有当对象具有相同的实现类时，才会产生相等的效果。这可能看起来不是很糟糕，但其后果是不可接受的：Point 的子类的实例仍然是一个 Point，并且它仍然需要作为一个函数来工作，但是如果采用这种方法，它就不会这样做！假设我们要写一个方法来判断一个点是否在单位圆上。我们可以这样做：

  ```java
  // Initialize unitCircle to contain all Points on the unit circle
  private static final Set<Point> unitCircle = Set.of(
          new Point( 1, 0), new Point( 0, 1),
          new Point(-1, 0), new Point( 0, -1)
      );
  
      public static boolean onUnitCircle(Point p) {
          return unitCircle.contains(p);
  }
  ```

  

  虽然这可能不是实现功能的最快方法，但它工作得很好。假设你以一种不添加值组件的简单方式继承 Point，例如，让它的构造函数跟踪创建了多少实例：

  ```java
  public class CounterPoint extends Point {
      private static final AtomicInteger counter = new AtomicInteger();
  
      public CounterPoint(int x, int y) {
          super(x, y);
          counter.incrementAndGet();
      }
  
      public static int numberCreated() {
          return counter.get();
      }
  }
  ```

  Liskov 替换原则指出，类型的任何重要属性都应该适用于所有子类型，因此为类型编写的任何方法都应该在其子类型上同样有效。这是我们先前做的正式声明，即点的子类（如 CounterPoint）仍然是一个 Point，并且必须作为一个 Point。但假设我们传递了一个 CounterPoint 给 onUnitCircle 方法。如果 Point 类使用基于 getclass 的 equals 方法，那么不管 CounterPoint 实例的 x 和 y 坐标如何，onUnitCircle 方法都会返回 false。这是因为大多数集合，包括 onUnitCircle 方法使用的 HashSet，都使用 equals 方法来测试包含性，没有一个 CounterPoint 实例等于任何一个点。但是，如果你在 Point 上使用了正确的基于实例的 equals 方法，那么在提供对位实例时，相同的 onUnitCircle 方法就可以很好地工作。

  > **里氏替换原则（Liskov Substitution Principle，LSP）面向对象设计的基本原则之一。里氏替换原则指出：任何父类可以出现的地方，子类一定可以出现。LSP 是继承复用的基石，只有当衍生类可以替换掉父类，软件单位的功能不受到影响时，父类才能真正被复用，而衍生类也能够在父类的基础上增加新的行为。**



虽然没有令人满意的方法来继承一个可实例化的类并添加一个值组件，但是有一个很好的解决方案：遵循的建议，「Favor composition over inheritance.」。给 ColorPoint 一个私有的 Point 字段和一个 public 视图方法，而不是让 ColorPoint 继承 Point，该方法返回与这个颜色点相同位置的点：

```java
// Adds a value component without violating the equals contract
public class ColorPoint {
    private final Point point;
    private final Color color;

    public ColorPoint(int x, int y, Color color) {
        point = new Point(x, y);
        this.color = Objects.requireNonNull(color);
    }

    /**
    * Returns the point-view of this color point.
    */
    public Point asPoint() {
        return point;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof ColorPoint))
            return false;

        ColorPoint cp = (ColorPoint) o;
        return cp.point.equals(point) && cp.color.equals(color);
    }
    ... // Remainder omitted
}
```

Java 库中有一些类确实继承了一个可实例化的类并添加了一个值组件。例如，`java.sql.Timestamp` 继承 `java.util.Date` 并添加了纳秒字段。如果在同一个集合中使用时间戳和日期对象，或者以其他方式混合使用时间戳和日期对象，那么时间戳的 equals 实现确实违反了对称性，并且可能导致不稳定的行为。Timestamp 类有一个免责声明，警告程序员不要混合使用日期和时间戳。虽然只要将它们分开，就不会遇到麻烦，但是没有什么可以阻止你将它们混合在一起，因此产生的错误可能很难调试。时间戳类的这种行为是错误的，不应该效仿。

注意，你可以向抽象类的子类添加一个值组件，而不违反 equals 约定。这对于遵循中的建议而得到的类层次结构很重要，「Prefer class hierarchies to tagged classes.」。例如，可以有一个没有值组件的抽象类形状、一个添加半径字段的子类圆和一个添加长度和宽度字段的子类矩形。只要不可能直接创建超类实例，前面显示的那种问题就不会发生。

- **非无效性** ，最后的要求没有一个正式的名称，所以我冒昧地称之为「非无效性」。它说所有对象都不等于 null。虽然很难想象在响应调用 `o.equals(null)` 时意外地返回 true，但不难想象意外地抛出 NullPointerException。一般约定中禁止这样做。许多类都有相等的方法，通过显式的 null 测试来防止它：

  ```java
  @Override
  public boolean equals(Object o) {
      if (o == null)
          return false;
      ...
  }
  ```

  这个测试是不必要的。要测试其参数是否相等，equals 方法必须首先将其参数转换为适当的类型，以便能够调用其访问器或访问其字段。在执行转换之前，方法必须使用 instanceof 运算符来检查其参数的类型是否正确：

  如果缺少这个类型检查，并且 equals 方法传递了一个错误类型的参数，equals 方法将抛出 ClassCastException，这违反了 equals 约定。但是，如果 instanceof 操作符的第一个操作数为空，则指定该操作符返回 false，而不管第二个操作数中出现的是什么类型。因此，如果传入 null，类型检查将返回 false，因此不需要显式的 null 检查。

  

  

综上所述，这里有一个高质量构建 equals 方法的秘诀：

1、**使用 == 运算符检查参数是否是对该对象的引用。** 如果是，返回 true。这只是一种性能优化，但如果比较的代价可能很高，那么这种优化是值得的。

2、**使用 instanceof 运算符检查参数是否具有正确的类型。** 如果不是，返回 false。通常，正确的类型是方法发生的类。有时候，它是由这个类实现的某个接口。如果类实现了一个接口，该接口对 equals 约定进行了改进，以允许跨实现该接口的类进行比较，则使用该接口。集合接口，如 Set、List、Map 和 Map.Entry 具有此属性。

3、**将参数转换为正确的类型。** 因为在这个强制类型转换之前有一个实例测试，所以它肯定会成功。

4、**对于类中的每个「重要」字段，检查参数的字段是否与该对象的相应字段匹配。** 如果所有这些测试都成功，返回 true；否则返回 false。如果第 2 步中的类型是接口，则必须通过接口方法访问参数的字段；如果是类，你可以根据字段的可访问性直接访问它们。



对于类型不是 float 或 double 的基本类型字段，使用 == 运算符进行比较；对于对象引用字段，递归调用 equals 方法；对于 float 字段，使用 `static Float.compare(float,float)` 方法；对于 double 字段，使用 `Double.compare(double, double)`。float 和 double 字段的特殊处理是由于 `Float.NaN`、-0.0f 和类似的双重值的存在而必须的；请参阅 Float.equals` 文档。虽然你可以将 float 和 double 字段与静态方法 Float.equals 和 Double.equals 进行比较，这将需要在每个比较上进行自动装箱，这将有较差的性能。对于数组字段，将这些指导原则应用于每个元素。如果数组字段中的每个元素都很重要，那么使用 `Arrays.equals` 方法之一。

一些对象引用字段可能合法地包含 null。为了避免可能出现 NullPointerException，请使用静态方法 `Objects.equals(Object, Object)` 检查这些字段是否相等。



对于某些类，例如上面的 CaseInsensitiveString，字段比较比简单的 equal 测试更复杂。如果是这样，你可能希望存储字段的规范形式，以便 equals 方法可以对规范形式进行廉价的精确比较，而不是更昂贵的非标准比较。这种技术最适合于不可变类；如果对象可以更改，则必须使规范形式保持最新。

equals 方法的性能可能会受到字段比较顺序的影响。为了获得最佳性能，你应该首先比较那些更可能不同、比较成本更低的字段，或者理想情况下两者都比较。不能比较不属于对象逻辑状态的字段，例如用于同步操作的锁字段。你不需要比较派生字段（可以从「重要字段」计算），但是这样做可能会提高 equals 方法的性能。如果派生字段相当于整个对象的摘要描述，那么如果比较失败，比较该字段将节省比较实际数据的开销。例如，假设你有一个多边形类，你缓存这个区域。如果两个多边形的面积不相等，你不需要比较它们的边和顶点。



**写完 equals 方法后，问自己三个问题：它具备对称性吗？具备传递性吗？具备一致性吗？** 不要只问自己，要编写单元测试来检查，除非使用 AutoValue（第 49 页）来生成 equals 方法，在这种情况下，你可以安全地省略测试。如果属性不能保持，请找出原因，并相应地修改 equals 方法。当然，equals 方法还必须满足其他两个属性（反射性和非无效性），但这两个通常会自己处理。

在这个简单的 PhoneNumber 类中，根据前面的方法构造了一个 equals 方法：

```java
// Class with a typical equals method
public final class PhoneNumber {
    private final short areaCode, prefix, lineNum;

    public PhoneNumber(int areaCode, int prefix, int lineNum) {
        this.areaCode = rangeCheck(areaCode, 999, "area code");
        this.prefix = rangeCheck(prefix, 999, "prefix");
        this.lineNum = rangeCheck(lineNum, 9999, "line num");
    }

    private static short rangeCheck(int val, int max, String arg) {
        if (val < 0 || val > max)
            throw new IllegalArgumentException(arg + ": " + val);
        return (short) val;
    }

    @Override
    public boolean equals(Object o) {
        if (o == this)
            return true;
        if (!(o instanceof PhoneNumber))
            return false;

        PhoneNumber pn = (PhoneNumber)o;
        return pn.lineNum == lineNum && pn.prefix == prefix && pn.areaCode == areaCode;
    } ... // Remainder omitted
}
```



以下是一些最后的警告：

- **当你覆盖 equals 时，也覆盖 hashCode。**

- **不要自作聪明。** 如果你只是为了判断相等性而测试字段，那么遵循 equals 约定并不困难。如果你在寻求对等方面过于激进，很容易陷入麻烦。一般来说，考虑到任何形式的混叠都不是一个好主意。例如，File 类不应该尝试将引用同一文件的符号链接等同起来。值得庆幸的是，它不是。

- **不要用另一种类型替换 equals 声明中的对象。** 对于程序员来说，编写一个类似于这样的 equals 方法，然后花上几个小时思考为什么它不能正常工作是很常见的：

  ```java
  // Broken - parameter type must be Object!
  public boolean equals(MyClass o) {
      ...
  }
  ```

  这里的问题是，这个方法没有覆盖其参数类型为 Object 的 Object.equals，而是重载了它。即使是普通的方法，提供这样一个「强类型的」equals 方法是不可接受的，因为它会导致子类中的重写注释产生误报并提供错误的安全性。

   如本条目所示，一致使用 Override 注释将防止你犯此错误。这个 equals 方法不会编译，错误消息会告诉你什么是错误的： 

  ```java
  // Still broken, but won’t compile
  @Override
  public boolean equals(MyClass o) {
      ...
  }
  ```

  编写和测试 equals （和 hashCode）方法很乏味，生成的代码也很单调。手动编写和测试这些方法的一个很好的替代方法是使用谷歌的开源 AutoValue 框架，它会自动为你生成这些方法，由类上的一个注释触发。在大多数情况下，AutoValue 生成的方法与你自己编写的方法基本相同。

  IDE 也有生成 equals 和 hashCode 方法的功能，但是生成的源代码比使用 AutoValue 的代码更冗长，可读性更差，不会自动跟踪类中的变化，因此需要进行测试。也就是说，让 IDE 生成 equals（和 hashCode）方法通常比手动实现更可取，因为 IDE 不会出现粗心的错误，而人会。

  总之，除非必须，否则不要覆盖 equals 方法：在许多情况下，从 Object 继承而来的实现正是你想要的。如果你确实覆盖了 equals，那么一定要比较类的所有重要字段，并以保留 equals 约定的所有 5 项规定的方式进行比较。

## 总结

《Effective Java》第三版的第10条内容讲解了在重写Java中的`equals`方法时，遵循通用协定的重要性。`equals`方法用于确定两个对象是否相等。

通用协定定义了`equals`方法必须具有以下特性：

1. 反射性：对于任何非空的`x`，`x.equals(x)`必须返回`true`。
2. 对称性：对于任何非空引用`x`和`y`，如果`x.equals(y)`返回`true`，则`y.equals(x)`必须返回`true`。
3. 传递性：对于任何非空引用`x`、`y`和`z`，如果`x.equals(y)`返回`true`并且`y.equals(z)`返回`true`，则`x.equals(z)`必须返回`true`。
4. 一致性：对于任何非空引用`x`和`y`，多次调用`x.equals(y)`必须始终返回`true`或始终返回`false`，前提是在equals比较中使用的信息未被修改。
5. 可空性：对于任何非空引用`x`，`x.equals(null)`必须返回`false`。



在重写`equals`方法时，重要的是要确保满足这些特性。此外，建议遵循一些最佳实践，例如：

1. 比较前检查引用是否相同：如果两个对象引用相同，即它们指向同一个对象，那么它们一定相等。在比较两个对象之前，首先使用`==`运算符检查它们的引用是否相同，以提高效率。

   

2. 比较对象类型：在比较两个对象之前，首先使用`instanceof`运算符检查它们是否属于同一个类。如果不是，那么它们不可能相等。这样可以避免在继承层次结构中出现问题。

   

3. 比较每个重要字段：在比较两个对象时，需要比较它们的每个重要字段。对于基本类型字段，使用`==`运算符进行比较；对于对象引用字段，递归调用`Objects.equals()`方法比较；对于`float`和`double`类型的字段，使用`Float.compare`和`Double.compare`方法进行比较；对于数组字段，使用`Arrays.equals`方法进行比较。

   

4. 覆盖`hashCode`方法：根据通用协定，如果两个对象相等，它们的`hashCode`值也必须相等。因此，在重写`equals`方法时，通常也需要重写`hashCode`方法，以确保对象的相等性被正确地判断，并且避免散列表中出现哈希冲突。

   

5. 考虑使用`@Override`注释指示您正在覆盖`equals`方法。

   

6. 不将`equals`方法定义为只接受特定类型的参数：`equals`方法的参数类型应该是`Object`类型，而不是具体的类或接口类型。这样可以确保`equals`方法可以比较任何类型的对象，而不仅仅是特定类型的对象。

   

7. 不使用`getClass`方法比较对象类型：在比较两个对象的类型时，不应该使用`getClass`方法，而应该使用`instanceof`运算符。这是因为`getClass`方法可能会被子类重写，并返回不同的结果，从而导致比较结果出现问题。

   

8. 不将`equals`方法与`==`运算符混淆：`equals`方法用于比较对象的内容，而`==`运算符用于比较对象的引用。在比较两个对象时，应该使用`equals`方法而不是`==`运算符。

   

9. 不将`equals`方法与`compareTo`方法混淆：`equals`方法用于比较对象的内容，而`compareTo`方法用于比较对象的顺序。在比较两个对象时，应该使用适当的方法，避免混淆它们的作用。
