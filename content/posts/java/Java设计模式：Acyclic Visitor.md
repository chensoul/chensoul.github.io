---
title: "Java设计模式：Acyclic Visitor"
date: 2023-06-01T09:30:00+08:00
slug: java-design-patterns-acyclic-visitor
categories: ["Java"]
tags: [java]
draft: false
---

本文主要介绍 Acyclic Visitor 模式，在 [Java Design Patterns](https://java-design-patterns.com/) 网站上有对该模式进行介绍。这里主要是做个笔记，并添加一些扩展，以加深对该设计模式的理解。

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

允许将新功能添加到现有的类层次结构中，而不会影响这些层次结构，也不会有四人帮访客模式中那样循环依赖的问题。

> 在 Acyclic Visitor 模式中，我们通过引入一个可选操作接口来实现这一点。当数据结构类需要访问访问者类的某些操作时，它可以通过调用 visit 方法来访问可选操作接口中定义的操作，而不需要直接依赖于访问者类中的成员变量。

## 解释

真实世界例子

> 我们有一个调制解调器类的层次结构。 需要使用基于过滤条件的外部算法（是 Unix 或 DOS 兼容的调制解调器）来访问此层次结构中的调制解调器。

**程序示例**

这是调制解调器的层次结构。

```java
public interface Modem {
  void accept(ModemVisitor modemVisitor);
}

public class Hayes implements Modem {
	@Override
	public void accept(ModemVisitor modemVisitor) {
		if (modemVisitor instanceof HayesVisitor) {
			((HayesVisitor) modemVisitor).visit(this);
		} else {
			System.out.println("Only HayesVisitor is allowed to visit Hayes modem");
		}

	}
}

public class Zoom implements Modem {
	@Override
	public void accept(ModemVisitor modemVisitor) {
		if (modemVisitor instanceof ZoomVisitor) {
			((ZoomVisitor) modemVisitor).visit(this);
		}
	}
}
```

下面我们介绍`调制解调器访问者`类结构。

```java
public interface ModemVisitor {
}

public interface HayesVisitor extends ModemVisitor {
  void visit(Hayes hayes);
}

public interface ZoomVisitor extends ModemVisitor {
  void visit(Zoom zoom);
}

public interface AllModemVisitor extends ZoomVisitor, HayesVisitor {

}

public class ConfigureForDosVisitor implements AllModemVisitor {
	@Override
	public void visit(Hayes hayes) {
		System.out.println(hayes + " used with Dos configurator.");
	}

	@Override
	public void visit(Zoom zoom) {
		System.out.println(zoom + " used with Dos configurator.");
	}
}

public class ConfigureForUnixVisitor implements ZoomVisitor {
	@Override
	public void visit(Zoom zoom) {
		System.out.println(zoom + " used with Unix configurator.");
	}
}
```

最后，这里是访问者的实践。

```java
public class Client {
    public static void main(String[] args) {
        Modem[] modems = { new Hayes(), new Zoom(), new Hayes() };
        ModemVisitor dosVisitor = new ConfigureForDosVisitor();
        ModemVisitor unixVisitor = new ConfigureForUnixVisitor();
        for (Modem modem : modems) {
            modem.accept(dosVisitor);
            modem.accept(unixVisitor);
        }
    }
}
```

## 类图

![alt text](https://java-design-patterns.com/assets/acyclic-visitor-74cfcfba.png)

以下是对 Acyclic Visitor 模式的解释：

1. Element（元素）：在上面的代码中，Modem 接口表示一个元素，定义了一个 accept 方法，用于接受访问者的访问。
2. ConcreteElement（具体元素）：在上面的代码中，Hayes 类和 Zoom 类表示具体的元素，实现了 Modem 接口中定义的 accept 方法。
3. Visitor（访问者）：在上面的代码中，ModemVisitor 接口表示一个访问者，定义了一个空的接口，用于扩展具体的访问者接口。
4. ConcreteVisitor（具体访问者）：在上面的代码中，ConfigureForDosVisitor 和 ConfigureForUnixVisitor 类表示具体的访问者，实现了 HayesVisitor 和 ZoomVisitor 接口中定义的 visit 方法，用于访问具体的元素。
5. OptionalOperations（可选操作）：在上面的代码中，AllModemVisitor 接口表示一个可选操作接口，它继承了所有具体访问者接口，用于扩展访问者类的操作。在 ConfigureForDosVisitor 类中，它实现了 AllModemVisitor 接口，同时实现了 visit 方法，用于访问所有具体的元素。在 ConfigureForUnixVisitor 类中，它实现了 ZoomVisitor 接口，同时实现了 visit 方法，用于访问 Zoom 元素。

在 Acyclic Visitor 模式中，元素和访问者之间是相互独立的，它们之间没有任何依赖关系。在访问元素时，访问者通过 accept 方法访问元素，并根据元素的类型自动调用对应的 visit 方法。由于访问者并没有直接依赖于元素，而是通过访问者接口和可选操作接口来访问元素，因此可以避免循环依赖的问题。同时，由于可选操作是一个接口，访问者可以根据需要实现其中的部分操作，从而动态地添加新的操作，而不会影响现有的类层次结构。这样，Acyclic Visitor 模式可以使代码更加灵活和可扩展，同时也提高了代码的可维护性和可扩展性。

## 适用性

以下情况可以使用此模式：

- 需要在现有层次结构中添加新功能而无需更改或影响该层次结构时。
- 当某些功能在层次结构上运行，但不属于层次结构本身时。 例如 ConfigureForDOS / ConfigureForUnix / ConfigureForX 问题。
- 当您需要根据对象的类型对对象执行非常不同的操作时。
- 当访问的类层次结构将经常使用元素类的新派生进行扩展时。在 Acyclic Visitor 模式中，新的元素类可以通过继承现有的 Element 类来实现，而不需要修改访问者类的代码。这样，可以避免因添加新元素而导致的访问者类的修改和重新编译。
- 当重新编译，重新链接，重新测试或重新分发派生元素非常昂贵时。

## 对比

Acyclic Visitor 模式是 Visitor 模式的一个变体，它解决了 Visitor 模式可能导致的循环依赖问题。下面是 Acyclic Visitor 模式和 Visitor 模式的一些对比：

1. 目的不同

Visitor 模式的主要目的是将数据结构和操作分离开来，并将操作封装在访问者类中。这使得我们可以在不修改数据结构代码的情况下添加新的操作。而 Acyclic Visitor 模式则更注重解决 Visitor 模式中可能出现的循环依赖问题。

2. 实现方式不同

在 Visitor 模式中，访问者类通常会维护一个数据结构类的引用，以便在 visit 方法中访问数据结构类的成员。这可能会导致循环依赖问题。而在 Acyclic Visitor 模式中，我们引入了一个额外的接口，即可选操作接口，它包含数据结构类可能需要调用的方法。这样，数据结构类就可以通过调用 visit 方法来访问访问者类中的部分操作，而不必直接依赖于访问者类中的成员，从而避免了循环依赖问题。

3. 可扩展性不同

由于 Visitor 模式中数据结构类和访问者类之间存在强耦合关系，因此添加新的数据结构类或访问者类可能会导致代码修改。而 Acyclic Visitor 模式通过引入可选操作接口，使得数据结构类和访问者类之间的耦合关系更加灵活，从而提高了代码的可扩展性。

4. 实现复杂度不同

Acyclic Visitor 模式相比 Visitor 模式，增加了一个可选操作接口，因此实现上可能会更加复杂。但是，这也使得 Acyclic Visitor 模式更加灵活和可扩展。

## 优缺点

下面是 Acyclic Visitor 模式的优点和缺点：

优点：

1. 解决了 Visitor 模式可能出现的循环依赖问题，使得代码更加健壮和可维护。
2. 可选操作接口使得访问者类的扩展更加灵活，可以根据具体需求选择实现不同的操作。
3. 将**数据结构和操作分离开来**，提高了代码的可扩展性和可维护性。
4. 在需要添加新的数据结构类或访问者类时，可以避免对现有代码进行修改，符合开闭原则。

缺点：

1. 相对于 Visitor 模式，Acyclic Visitor 模式的实现会更加复杂，因为需要引入一个可选操作接口。
2. 由于 Acyclic Visitor 模式在实现上更加复杂，可能会降低代码的可读性和可理解性。
3. 如果数据结构类需要访问访问者类的成员，Acyclic Visitor 模式并不能很好地解决这个问题，需要考虑其他设计模式的使用。

## 使用场景

Acyclic Visitor 模式通常用于以下场景：

1. 类层次结构中存在多种类型的对象，并且需要对它们进行不同的操作，但不想在类层次结构中添加新的方法或修改现有方法。
2. 不同的操作需要访问对象的不同部分，而不是整个对象本身。
3. 类层次结构之间存在依赖关系，但不希望引入循环依赖问题。
4. 需要在类层次结构中添加新的操作，而不影响现有的类。
5. 需要支持多个访问者，且访问者之间可能存在依赖关系。
6. 需要避免在访问者中使用 instanceof 运算符来检查元素的类型。

具体的使用场景如下：

1. 解析器（Parser）：在解析器中，可以使用 Acyclic Visitor 模式来实现不同类型的节点的访问。例如，可以使用 Acyclic Visitor 模式来实现语法树的遍历，以实现语法分析、类型检查等功能。
2. 编译器（Compiler）：在编译器中，可以使用 Acyclic Visitor 模式来实现不同阶段的分析。例如，可以使用 Acyclic Visitor 模式来实现词法分析器、语法分析器、类型检查器、代码生成器等。
3. 图形用户界面（GUI）：在图形用户界面中，可以使用 Acyclic Visitor 模式来实现不同类型的控件的访问。例如，可以使用 Acyclic Visitor 模式来实现窗口、按钮、菜单等控件的事件处理逻辑。
4. 数据库访问（Database Access）：在数据库访问中，可以使用 Acyclic Visitor 模式来实现不同类型的对象的访问。例如，可以使用 Acyclic Visitor 模式来实现对关系型数据库中的表、视图、存储过程、触发器等对象的访问。
5. 游戏开发（Game Development）：在游戏开发中，可以使用 Acyclic Visitor 模式来实现不同类型的游戏对象的访问。例如，可以使用 Acyclic Visitor 模式来实现对角色、道具、怪物等游戏对象的访问。
6. 打印机驱动程序（Printer Driver）：在打印机驱动程序中，可以使用 Acyclic Visitor 模式来实现不同类型的打印作业的访问。例如，可以使用 Acyclic Visitor 模式来实现对文本、图片、表格等打印作业的访问。
7. 音频处理（Audio Processing）：在音频处理中，可以使用 Acyclic Visitor 模式来实现不同类型的音频文件的访问。例如，可以使用 Acyclic Visitor 模式来实现对 MP3、WAV、FLAC 等音频文件的访问。
8. 网络协议（Network Protocol）：在网络协议中，可以使用 Acyclic Visitor 模式来实现不同类型的协议数据包的访问。例如，可以使用 Acyclic Visitor 模式来实现对 TCP、UDP、HTTP、SMTP 等协议数据包的访问。
9. 机器人控制（Robot Control）：在机器人控制中，可以使用 Acyclic Visitor 模式来实现不同类型的机器人动作的访问。例如，可以使用 Acyclic Visitor 模式来实现对移动、转向、抓取、放置等机器人动作的访问。
10. 系统监控（System Monitoring）：在系统监控中，可以使用 Acyclic Visitor 模式来实现不同类型的监测数据的访问。例如，可以使用 Acyclic Visitor 模式来实现对 CPU 占用率、内存使用量、网络流量等监测数据的访问。
11. 机器学习（Machine Learning）：在机器学习中，可以使用 Acyclic Visitor 模式来实现不同类型的训练数据的访问。例如，可以使用 Acyclic Visitor 模式来实现对图像、声音、文本等训练数据的访问。
12. 金融交易（Financial Trading）：在金融交易中，可以使用 Acyclic Visitor 模式来实现不同类型的交易数据的访问。例如，可以使用 Acyclic Visitor 模式来实现对股票、期货、外汇等交易数据的访问。
13. 电子商务（E-commerce）：在电子商务中，可以使用 Acyclic Visitor 模式来实现不同类型的商品数据的访问。例如，可以使用 Acyclic Visitor 模式来实现对产品、订单、客户等商品数据的访问。
14. 硬件控制（Hardware Control）：在硬件控制中，可以使用 Acyclic Visitor 模式来实现不同类型的硬件设备的访问。例如，可以使用 Acyclic Visitor 模式来实现对传感器、电机、执行器等硬件设备的访问。

一个更具体的例子是使用 Acyclic Visitor 模式来实现图像处理功能。假设我们有一个图像处理程序，它可以处理多种类型的图像，如 JPEG、PNG、BMP 等。我们需要为该程序添加一个新的功能，即将图像转换为黑白图像。

为实现这一功能，我们可以使用 Acyclic Visitor 模式来设计图像处理类层次结构。类层次结构包括多种类型的图像，如 JPEGImage、PNGImage、BMPImage 等。对于每种类型的图像，我们定义一个相应的图像处理器类，如 JPEGImageHandler、PNGImageHandler、BMPImageHandler 等。每个图像处理器类都实现一个 Visitor 接口的子接口，如 JPEGImageVisitor、PNGImageVisitor、BMPImageVisitor，该子接口定义了一些 visit 方法，用于处理图像中的像素数据。

定义 Visitor 接口及其子接口：

```java
public interface Visitor {
}

public interface JPEGImageVisitor extends Visitor {
    void visit(JPEGImage image);
}

public interface PNGImageVisitor extends Visitor {
    void visit(PNGImage image);
}

public interface BMPImageVisitor extends Visitor {
    void visit(BMPImage image);
}
```

定义图像类及其子类：

```java
public interface Image {
	void accept(Visitor visitor);
}

public class JPEGImage implements Image {
	private byte[] data;

  public JPEGImage(byte[] data) {
      this.data = data;
  }

  public byte[] getData() {
      return data;
  }

  @Override
  public void accept(Visitor visitor) {
      if (visitor instanceof JPEGImageVisitor) {
          ((JPEGImageVisitor) visitor).visit(this);
      }
  }
}

public class PNGImage implements Image {
  private byte[] data;
  public PNGImage(byte[] data) {
      this.data = data;
  }

  public byte[] getData() {
      return data;
  }

  @Override
  public void accept(Visitor visitor) {
      if (visitor instanceof PNGImageVisitor) {
          ((PNGImageVisitor) visitor).visit(this);
      }
  }
}

public class BMPImage implements Image {
  private byte[] data;
  public BMPImage(byte[] data) {
      this.data = data;
  }

  public byte[] getData() {
      return data;
  }

  @Override
  public void accept(Visitor visitor) {
      if (visitor instanceof BMPImageVisitor) {
          ((BMPImageVisitor) visitor).visit(this);
      }
  }
}
```

定义黑白图像处理器类：

```java
public class BlackWhiteImageProcessor implements JPEGImageVisitor, PNGImageVisitor,BMPImageVisitor {
  @Override
  public void visit(JPEGImage image) {
      // 将 JPEG 图像转换为黑白图像
      // 处理像素数据
      byte[] data = image.getData();
      // ...
  }

  @Override
  public void visit(PNGImage image) {
      // 将 PNG 图像转换为黑白图像
      // 处理像素数据
      byte[] data = image.getData();
      // ...
  }

  @Override
  public void visit(BMPImage image) {
      // 将 BMP 图像转换为黑白图像
      // 处理像素数据
      byte[] data = image.getData();
      // ...
  }
}
```

最后，我们可以通过以下方式使用 Acyclic Visitor 模式来实现图像处理功能：

```java
public class Client {
    public static void main(String[] args) {
        List<Image> images = new ArrayList<>();
        images.add(new JPEGImage(jpegData));
        images.add(new PNGImage(pngData));
        images.add(new BMPImage(bmpData));

        BlackWhiteImageProcessor processor = new BlackWhiteImageProcessor();

        for (Image image : images) {
            image.accept(processor);
        }
    }
}
```

在这个例子中，Acyclic Visitor 模式使我们能够实现对多种类型的图像进行不同的处理，同时保持代码的可扩展性和可维护性。我们可以轻松地添加新的图像处理器类，如 SepiaImageProcessor、BlurImageProcessor 、RotateImageProcessor 等，而无需修改图像类层次结构的代码。同时，我们可以避免在图像类层次结构中添加处理方法，而是将处理逻辑封装在访问者类中，从而提高代码的可扩展性和可维护性。

下面我给出一个简单的示例代码来演示如何使用 Acyclic Visitor 模式来实现对 CPU 占用率、内存使用量、网络流量等监测数据的访问。

首先，我们定义一个 Visitor 接口及其子接口：

```java
public interface Visitor {
}

public interface CPUUsageVisitor extends Visitor {
    void visit(CPUUsage cpuUsage);
}

public interface MemoryUsageVisitor extends Visitor {
    void visit(MemoryUsage memoryUsage);
}

public interface NetworkTrafficVisitor extends Visitor {
    void visit(NetworkTraffic networkTraffic);
}
```

然后，我们定义三个监测数据类：CPUUsage、MemoryUsage 和 NetworkTraffic。这些类实现了 Visitor 接口，并且定义了一个 accept 方法，该方法接受一个 Visitor 对象，并调用 Visitor 对象的 visit 方法：

```java
public interface Usages {
  void accept(Visitor visitor);
}

public class CPUUsage implements Usages {
    private double usage;

    public CPUUsage(double usage) {
        this.usage = usage;
    }

    public double getUsage() {
        return usage;
    }

    public void accept(Visitor visitor) {
        if (visitor instanceof CPUUsageVisitor) {
            ((CPUUsageVisitor) visitor).visit(this);
        }
    }
}

public class MemoryUsage implements Visitor {
    private long used;
    private long total;

    public MemoryUsage(long used, long total) {
        this.used = used;
        this.total = total;
    }

    public long getUsed() {
        return used;
    }

    public long getTotal() {
        return total;
    }

    public void accept(Visitor visitor) {
        if (visitor instanceof MemoryUsageVisitor) {
            ((MemoryUsageVisitor) visitor).visit(this);
        }
    }
}

public class NetworkTraffic implements Visitor {
    private long sent;
    private long received;

    public NetworkTraffic(long sent, long received) {
        this.sent = sent;
        this.received = received;
    }

    public long getSent() {
        return sent;
    }

    public long getReceived() {
        return received;
    }

    public void accept(Visitor visitor) {
        if (visitor instanceof NetworkTrafficVisitor) {
            ((NetworkTrafficVisitor) visitor).visit(this);
        }
    }
}
```

接下来，我们定义三个 Visitor 实现类：CPUUsageLoggerVistor、MemoryUsageLoggerVistor 和 NetworkTrafficLoggerVistor。这些类实现了 CPUUsageVisitor、MemoryUsageVisitor 和 NetworkTrafficVisitor 接口，并实现了 visit 方法，该方法用于记录监测数据：

```java
public class CPUUsageLoggerVistor implements CPUUsageVisitor {
    public void visit(CPUUsage cpuUsage) {
        double usage = cpuUsage.getUsage();
        System.out.println("CPU Usage: " + usage);
    }
}

public class MemoryUsageLoggerVistor implements MemoryUsageVisitor {
   public void visit(MemoryUsage memoryUsage) {
        long used = memoryUsage.getUsed();
        long total = memoryUsage.getTotal();
        double usage = (double) used / total * 100;
        System.out.println("Memory Usage: " + usage + "%");
    }
}

public class NetworkTrafficLoggerVistor implements NetworkTrafficVisitor {
    public void visit(NetworkTraffic networkTraffic) {
        long sent = networkTraffic.getSent();
        long received = networkTraffic.getReceived();
        System.out.println("Network Traffic: Sent=" + sent + " bytes, Received=" + received + " bytes");
    }
}
```

最后，我们定义一个监测数据源类：SystemMonitor。该类维护三个监测数据：CPUUsage、MemoryUsage 和 NetworkTraffic，并提供相应的方法用于更新监测数据。该类还提供一个 accept 方法，该方法接受一个 Visitor 对象，并将该 Visitor 对象传递给各个监测数据对象：

```java
public class SystemMonitor {
    private CPUUsage cpuUsage;
    private MemoryUsage memoryUsage;
    private NetworkTraffic networkTraffic;

    public void updateCPUUsage(double usage) {
        cpuUsage = new CPUUsage(usage);
    }

    public void updateMemoryUsage(long used, long total) {
        memoryUsage = new MemoryUsage(used, total);
    }

    public void updateNetworkTraffic(long sent,long received) {
        networkTraffic = new NetworkTraffic(sent, received);
    }

    public void accept(Visitor visitor) {
        if (cpuUsage != null) {
            cpuUsage.accept(visitor);
        }
        if (memoryUsage != null) {
            memoryUsage.accept(visitor);
        }
        if (networkTraffic != null) {
            networkTraffic.accept(visitor);
        }
    }
}
```

现在，我们可以使用上述类来实现对 CPU 占用率、内存使用量、网络流量等监测数据的访问。首先，我们创建一个 SystemMonitor 对象，并更新监测数据：

```java
SystemMonitor monitor = new SystemMonitor();
monitor.updateCPUUsage(0.75);
monitor.updateMemoryUsage(1024, 2048);
monitor.updateNetworkTraffic(1024, 2048);
```

然后，我们可以创建三个 Visitor 对象：CPUUsageLoggerVistor、MemoryUsageLoggerVistor 和 NetworkTrafficLoggerVistor，用于记录监测数据：

```java
CPUUsageLoggerVistor cpuUsageLogger = new CPUUsageLoggerVistor();
MemoryUsageLoggerVistor memoryUsageLogger = new MemoryUsageLoggerVistor();
NetworkTrafficLoggerVistor networkTrafficLogger = new NetworkTrafficLoggerVistor();
```

最后，我们可以将这些 Visitor 对象传递给 SystemMonitor 对象，并调用 accept 方法来访问监测数据：

```java
monitor.accept(cpuUsageLogger);
monitor.accept(memoryUsageLogger);
monitor.accept(networkTrafficLogger);
```

这样，我们就可以通过 Acyclic Visitor 模式来实现对 CPU 占用率、内存使用量、网络流量等监测数据的访问。

## 参考文章

- [Acyclic Visitor by Robert C. Martin](http://condor.depaul.edu/dmumaugh/OOT/Design-Principles/acv.pdf)

- [Acyclic Visitor in WikiWikiWeb](https://wiki.c2.com/?AcyclicVisitor)
