---
title: "《Effective Java 3》笔记7：排除过时的对象引用"
date: 2023-05-05
slug: eliminate-obsolete-object-references
categories: ["Java"]
tags: [java]
---

本文是 《Effective Java 3》第二章的学习笔记：排除过时的对象引用。

## 介绍

"Eliminate obsolete object references" 是一条 Java 编程最佳实践的原则，指的是在代码中及时清理不再使用的对象引用，以避免内存泄漏和性能问题。当一个对象不再需要时，应该尽快将其引用设置为 null，这样 JVM 可以及时回收它所占用的内存。

考虑以下简单的堆栈实现：

```java
import java.util.Arrays;
import java.util.EmptyStackException;

// Can you spot the "memory leak"?
public class Stack {
    private Object[] elements;
    private int size = 0;
    private static final int DEFAULT_INITIAL_CAPACITY = 16;

    public Stack() {
        elements = new Object[DEFAULT_INITIAL_CAPACITY];
    }

    public void push(Object e) {
        ensureCapacity();
        elements[size++] = e;
    }

    public Object pop() {
        if (size == 0)
            throw new EmptyStackException();
        return elements[--size];
    }

    /**
     * Ensure space for at least one more element, roughly
     * doubling the capacity each time the array needs to grow.
     */
    private void ensureCapacity() {
        if (elements.length == size)
            elements = Arrays.copyOf(elements, 2 * size + 1);
    }
}
```

这个程序没有明显的错误。你可以对它进行详尽的测试，它会以优异的成绩通过所有的测试，但是有一个潜在的问题。简单地说，该程序有一个「内存泄漏」问题，由于垃圾收集器活动的增加或内存占用的增加，它可以悄无声息地表现为性能的降低。在极端情况下，这种内存泄漏可能导致磁盘分页，甚至出现 OutOfMemoryError 程序故障，但这种故障相对少见。

那么内存泄漏在哪里呢？如果堆栈增长，然后收缩，那么从堆栈中弹出的对象将不会被垃圾收集，即使使用堆栈的程序不再引用它们。这是因为栈保留了这些对象的旧引用。一个过时的引用，是指永远不会被取消的引用。在本例中，元素数组的「活动部分」之外的任何引用都已过时。活动部分由索引小于大小的元素组成。

垃圾收集语言中的内存泄漏（更确切地说是无意的对象保留）是暗藏的风险。如果无意中保留了对象引用，那么对象不仅被排除在垃圾收集之外，该对象引用的任何对象也被排除在外，依此类推。即使只是无意中保留了一些对象引用，许多许多的对象也可能被阻止被垃圾收集，从而对性能产生潜在的巨大影响。

解决这类问题的方法很简单：一旦引用过时，就将置空。在我们的 Stack 类中，对某个项的引用一旦从堆栈中弹出就会过时。pop 方法的正确版本如下：

```java
public Object pop() {
    if (size == 0)
        throw new EmptyStackException();
    Object result = elements[--size];
    elements[size] = null; // Eliminate obsolete reference
    return result;
}
```

用 null 处理过时引用的另一个好处是，如果它们随后被错误地关联引用，程序将立即失败，出现 NullPointerException，而不是悄悄地做错误的事情。尽可能快地检测编程错误总是有益的。

那么，什么时候应该取消引用呢？Stack 类的哪些方面容易导致内存泄漏？简单地说，它管理自己的内存。存储池包含元素数组的元素（对象引用单元，而不是对象本身）数组的活动部分（如前面所定义的）中的元素被分配，而数组其余部分中的元素是空闲的。垃圾收集器没有办法知道这一点；对于垃圾收集器，元素数组中的所有对象引用都同样有效。只有程序员知道数组的非活动部分不重要。只要数组元素成为非活动部分的一部分，程序员就可以通过手动清空数组元素，有效地将这个事实传递给垃圾收集器。

一般来说，一个类管理它自己的内存时，程序员应该警惕内存泄漏。当释放一个元素时，该元素中包含的任何对象引用都应该被置为 null。

**另一个常见的内存泄漏源是缓存。** 一旦将对象引用放入缓存中，就很容易忘记它就在那里，并且在它变得无关紧要之后很久仍将它留在缓存中。有几个解决这个问题的办法。如果你非常幸运地实现了一个缓存，只要缓存外有对其键的引用，那么就将缓存表示为 WeakHashMap；当条目过时后，条目将被自动删除。记住，WeakHashMap 只有在缓存条目的预期生存期由键的外部引用（而不是值）决定时才有用。

更常见的情况是，缓存条目的有效生存期定义不太好，随着时间的推移，条目的价值会越来越低。在这种情况下，缓存偶尔应该清理那些已经停用的条目。这可以通过后台线程（可能是 `ScheduledThreadPoolExecutor`）或向缓存添加新条目时顺便完成。LinkedHashMap 类通过其 `removeEldestEntry` 方法简化了后一种方法。对于更复杂的缓存，你可能需要直接使用 `java.lang.ref`。

**内存泄漏的第三个常见来源是侦听器和其他回调。** 如果你实现了一个 API，其中客户端注册回调，但不显式取消它们，除非你采取一些行动，否则它们将累积。确保回调被及时地垃圾收集的一种方法是仅存储对它们的弱引用，例如，将它们作为键存储在 WeakHashMap 中。

### 如何排除过时对象引用

以下是一些示例，展示了如何使用 Java 语言中的一些技术来排除过时的对象引用。

1. 在循环中使用局部变量

```java
List<String> list = new ArrayList<>();

for (int i = 0; i < list.size(); i++) {
    String str = list.get(i);
    // do something with str
}
```

在这个示例中，我们使用局部变量`str`来引用列表中的元素，而不是重复地使用`list.get(i)`。这样，当循环结束时，`str`的引用将被自动清除，避免了过时的对象引用。

2. 在使用完对象后及时清除引用

```java
SomeObject obj = new SomeObject();
// do something with obj

obj = null; // clear the reference to obj
```

在这个示例中，我们在使用完对象后立即将其引用设置为 null，以便 JVM 可以及时回收它所占用的内存。如果不清除引用，对象将一直存在于内存中，直到 JVM 进行垃圾回收。

3. 使用弱引用

```java
WeakReference<SomeObject> ref = new WeakReference<>(new SomeObject());
SomeObject obj = ref.get();

// do something with obj

obj = null; // clear the reference to obj
```

在这个示例中，我们使用了一个弱引用来引用对象，以便在对象不再被强引用时可以被及时回收。当我们需要使用对象时，可以通过弱引用获取对象的引用，使用完后及时将其引用设置为 null。

4. 使用 try-with-resources 语句

```java
try (InputStream in = new FileInputStream("file.txt")) {
    // do something with in
}
```

在这个示例中，我们使用了 try-with-resources 语句来打开一个文件流，并在使用完后自动关闭它。这样可以确保在不再需要文件流时，它的引用将被清除，避免了过时的对象引用。

5. 使用软引用

```java
SoftReference<SomeObject> ref = new SoftReference<>(new SomeObject());
SomeObject obj = ref.get();

// do something with obj

obj = null; // clear the reference to obj
```

在这个示例中，我们使用了一个软引用来引用对象，以便在 JVM 需要回收内存时可以回收对象。软引用在内存不足时通常会被回收，但在内存充足时可以保留对象，避免了过时的对象引用。

6. 使用虚引用

```java
ReferenceQueue<SomeObject> queue = new ReferenceQueue<>();
PhantomReference<SomeObject> ref = new PhantomReference<>(new SomeObject(), queue);

// do something

ref.clear(); // clear the reference to obj
```

在这个示例中，我们使用了一个虚引用来引用对象，以便在 JVM 回收对象之前可以进行一些必要的清理工作。虚引用在 JVM 回收对象时会被添加到一个引用队列中，因此我们可以在对象被回收之前执行必要的清理工作。

7. 使用对象池

```java
class ObjectPool<T> {
    private final Set<T> objects = new HashSet<>();

    public synchronized T getObject() {
        T obj;
        if (objects.isEmpty()) {
            obj = createObject();
        } else {
            obj = objects.iterator().next();
            objects.remove(obj);
        }
        return obj;
    }

    public synchronized void returnObject(T obj) {
        objects.add(obj);
    }

    private T createObject() {
        // create a new object
    }
}
```

在这个示例中，我们使用了一个对象池来管理对象的生命周期。当需要一个对象时，我们从对象池中获取一个对象，而不是每次都创建一个新的对象。当不再需要对象时，我们将其返回到对象池中，以便其他对象可以重复使用。对象池可以避免过时的对象引用，并提高代码的性能和可伸缩性。

8. 使用弱散列映射

```java
Map<SomeObject, Object> map = new WeakHashMap<>();

SomeObject key = new SomeObject();
Object value = new Object();

map.put(key, value);

// do something

key = null; // clear the reference to key

// do something

// the entry in the map may be removed if key is not strongly referenced elsewhere
```

在这个示例中，我们使用了一个弱散列映射来存储对象引用和相应的值。当对象不再被强引用时，它的引用可能被从映射中删除，从而避免了过时的对象引用。弱散列映射通常用于缓存和事件处理等场景。

9. 使用缓存

```java
class SomeObjectCache {
    private static final int MAX_SIZE = 100;
    private static final Map<String, SomeObject> cache = new LinkedHashMap<String, SomeObject>(MAX_SIZE, 0.75f, true) {
        protected boolean removeEldestEntry(Map.Entry<String, SomeObject> eldest) {
            return size() > MAX_SIZE;
        }
    };

    public synchronized static SomeObject get(String key) {
        return cache.get(key);
    }

    public synchronized static void put(String key, SomeObject value) {
        cache.put(key, value);
    }
}
```

在这个示例中，我们使用了一个缓存来存储对象引用和相应的值。当缓存达到最大大小时，最旧的条目将被自动删除，从而避免了过时的对象引用。缓存通常用于频繁访问的数据和计算结果，可以提高代码的性能和可伸缩性。

10. 使用对象池框架

对象池框架是一种用于管理对象生命周期的通用框架，可以避免过时的对象引用和提高代码的性能和可伸缩性。一些流行的对象池框架包括 Apache Commons Pool 和 Google Guava Cache。

## 扩展

### 弱引用、软引用和虚引用区别

弱引用、软引用和虚引用是 Java 中三种不同类型的引用，它们之间的区别如下：

#### 弱引用（WeakReference）

弱引用是一种较弱的引用类型，当一个对象只被弱引用所引用时，它在下一次垃圾回收时会被回收。

弱引用通常用于需要缓存大量对象的应用场景，例如缓存和高速缓存等。在这些场景中，使用弱引用可以避免占用过多的内存，同时又可以快速访问缓存中的对象。

应该使用弱引用的情况包括：

1. 需要缓存大量对象：使用弱引用可以避免占用过多的内存空间，从而可以缓存更多的对象。

2. 不需要快速访问缓存中的对象：由于弱引用只有在下一次垃圾回收时才会被回收，因此可能会导致较长的访问延迟。如果应用程序可以容忍这种情况，可以考虑使用弱引用。

3. 需要频繁的垃圾回收：由于弱引用只有在下一次垃圾回收时才会被回收，因此可能会导致频繁的垃圾回收。如果应用程序可以容忍这种情况，可以考虑使用弱引用。

例如，我们可以使用弱引用来实现一个缓存，当内存不足时，JVM 会自动回收弱引用所引用的对象，从而避免内存泄漏和 OOM 错误。

```java
Map<String, WeakReference<SomeObject>> cache = new HashMap<>();

public SomeObject getObject(String key) {
    SomeObject obj = null;

    WeakReference<SomeObject> reference = cache.get(key);
    if (reference != null) {
        obj = reference.get();
    }

    if (obj == null) {
        obj = createObject();
        if (obj != null) {
            cache.put(key, new WeakReference<>(obj));
        }
    }

    return obj;
}
```

在这个示例中，我们使用弱引用来缓存对象，当内存不足时，JVM 会自动回收弱引用所引用的对象。这样可以避免占用过多的内存，同时又可以快速访问缓存中的对象。

#### 软引用（SoftReference）

软引用是一种较强的引用类型，当一个对象只被软引用所引用时，只有在内存不足时才会被回收。

软引用通常用于需要缓存大量对象的应用场景，例如图片缓存、数据缓存等。在这些场景中，使用软引用可以避免占用过多的内存，同时又可以快速访问缓存中的对象。

应该使用软引用的情况包括：

1. 需要缓存大量对象：使用软引用可以避免占用过多的内存空间，从而可以缓存更多的对象。

2. 需要快速访问缓存中的对象：使用软引用可以快速访问缓存中的对象，避免频繁地加载和计算。

3. 可以容忍偶尔的垃圾回收：由于软引用只有在内存不足时才会被回收，因此可能会导致偶尔的垃圾回收。如果应用程序可以容忍这种情况，可以考虑使用软引用。

例如，我们可以使用软引用来实现一个图片缓存，当内存不足时，JVM 会自动回收软引用所引用的对象，从而避免内存泄漏和 OOM 错误。

```java
Map<String, SoftReference<Bitmap>> imageCache = new HashMap<>();

public Bitmap loadImage(String url) {
    Bitmap bitmap = null;

    SoftReference<Bitmap> reference = imageCache.get(url);
    if (reference != null) {
        bitmap = reference.get();
    }

    if (bitmap == null) {
        bitmap = downloadImage(url);
        if (bitmap != null) {
            imageCache.put(url, new SoftReference<>(bitmap));
        }
    }

    return bitmap;
}
```

在这个示例中，我们使用软引用来缓存图片，当内存不足时，JVM 会自动回收软引用所引用的对象。这样可以避免占用过多的内存，同时又可以快速访问缓存中的图片。

#### 虚引用（PhantomReference）

虚引用是 Java 中四种引用类型中最弱的一种，它主要用于跟踪对象被垃圾回收的状态。虚引用本身并不会对对象的生命周期产生影响，但可以在对象被垃圾回收时收到一个通知，从而进行一些清理或其他操作。

虚引用的使用场景比较少，一般用于以下几个方面：

1. **对象的 finalize()方法：** 虚引用可以用于实现对象的 finalize()方法，当对象被垃圾回收时，虚引用会收到一个通知，从而触发对象的 finalize()方法。
2. **NIO DirectByteBuffer 对象的释放：** 在使用 NIO 编程时，可能会创建大量的 DirectByteBuffer 对象，这些对象可能会占用大量的内存空间。当这些对象不再使用时，需要手动调用 System.gc()方法触发一次垃圾回收，才能释放这些对象的内存。使用虚引用可以避免手动调用 System.gc()方法，当这些对象被垃圾回收时，虚引用会收到一个通知，从而释放这些对象的内存。
3. **对象池的管理：** 在一些需要频繁创建和销毁对象的应用场景中，可以使用对象池来提高性能。当对象不再使用时，可以将对象放入虚引用中，当对象被垃圾回收时，虚引用会收到一个通知，从而将对象从对象池中移除。

需要注意的是，虚引用不适用于缓存或其他需要快速访问对象的应用场景，因为虚引用本身并不保证对象的可用性和可访问性。

> 因此，软引用和弱引用的主要区别在于它们的强度和垃圾回收的时机。软引用比弱引用更强，只有在内存不足时才会被回收，而弱引用则更弱，只有在下一次垃圾回收时才会被回收。同时，使用软引用可能会导致更少的垃圾回收，但可能会占用更多的内存空间，而使用弱引用可能会导致更频繁的垃圾回收，但可以更快地释放内存空间。

### 弱引用是否会影响程序的性能？

`弱引用可能会影响程序的性能，因为它们可能会导致频繁的垃圾回收。`由于弱引用`只有在下一次垃圾回收时才会被回收`，因此当使用大量的弱引用时，可能会导致更频繁的垃圾回收，从而降低程序的性能。

当一个对象只被弱引用所引用时，在下一次垃圾回收时它会被回收。如果应用程序中存在大量的弱引用对象，每次垃圾回收都需要扫描这些对象，从而增加了垃圾回收的时间和开销。

因此，在使用弱引用时需要注意以下几点：

1. 不要过度使用弱引用：如果应用程序中存在大量的弱引用对象，可能会导致频繁的垃圾回收，从而影响程序的性能。因此，应该避免过度使用弱引用，尽可能减少弱引用对象的数量。
2. 注意垃圾回收的时机：弱引用只在下一次垃圾回收时才会被回收，因此可能会导致较长的访问延迟。在使用弱引用时需要注意垃圾回收的时机，如果应用程序需要快速访问缓存中的对象，可能需要使用其他类型的引用。
3. 检查弱引用是否被回收：当一个对象只被弱引用所引用时，它在下一次垃圾回收时会被回收。在使用弱引用时需要注意检查弱引用对象是否被回收，避免引用无效的对象。

### 如何检查弱引用对象是否被回收？

在 Java 中，可以通过获取弱引用对象的 get()方法返回的对象来检查引用对象是否被回收。当一个弱引用所引用的对象被回收后，get()方法返回的对象将为 null。

例如，以下示例代码演示了如何使用弱引用检查对象是否被回收：

```java
Object obj = new Object();
WeakReference<Object> weakRef = new WeakReference<>(obj);

// 检查对象是否被回收
if (weakRef.get() != null) {
    // 对象未被回收
    System.out.println("Object is alive");
} else {
    // 对象已被回收
    System.out.println("Object has been collected");
}
```

在这个示例中，我们创建了一个对象，并使用弱引用来引用它。然后，我们通过检查弱引用对象的 get()方法返回的对象来判断对象是否被回收。

当对象未被回收时，get()方法返回的对象不为 null，表示对象仍然存活。当对象被回收时，get()方法返回的对象为 null，表示对象已经被回收。

需要注意的是，由于弱引用只在下一次垃圾回收时才会被回收，因此在使用弱引用检查对象是否被回收时，需要注意垃圾回收的时机。如果应用程序需要立即检查对象是否被回收，可以手动触发一次垃圾回收，例如通过`System.gc()`方法来触发。
