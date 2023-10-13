---
title: "Python学习2：数据类型"
date: 2023-06-10T15:00:00+08:00
slug: python-data-type
draft: false
categories: ["Python"]
tags: ["python"]
---

Python 中的数据类型包括：

1. 数字类型：包括整型、浮点型、复数型和布尔类型：只有两个取值，True 和 False，用于表示逻辑值。
2. 字符串类型：由一系列字符组成，可以是单引号、双引号或三引号括起来的文本。
3. 列表类型：由一系列有序的元素组成，可以包含任何类型的数据。
4. 元组类型：与列表类似，但是`元素不能被修改`。
5. 集合类型：由一组唯一的元素组成，支持集合的基本操作，如并集、交集和差集等。
6. 字典类型：由一组键值对组成，其中键是唯一的，用于查找和存储值。
7. None 类型：表示空值或缺失值。

## 数字

在 Python 中，数字类型包括整数（int）、浮点数（float）、复数（complex）和布尔值（bool）。

1. 整数（int）是不带小数的数字，可以使用十进制、二进制、八进制或十六进制表示。**在 Python 3 中，整数的长度不再受限于机器的位数，可以表示任意大的整数。** 例如：

   ```python
   a = 123       # 十进制整数
   b = 0b1010    # 二进制整数，等于十进制的 10
   c = 0o12      # 八进制整数，等于十进制的 10
   d = 0x0A      # 十六进制整数，等于十进制的 10
   ```

2. 浮点数（float）是带小数的数字，可以使用科学计数法表示。在 Python 中，浮点数采用 IEEE 754 标准表示，具有双精度（64 位）和单精度（32 位）两种形式。例如：

   ```python
   a = 3.14e-2   # 科学计数法表示的浮点数，等于 0.0314
   b = 1.23      # 普通的浮点数
   ```

3. 复数（complex）是具有实部和虚部的数字，可以使用 `a+bj` 或 `complex(a, b)` 的形式表示，其中 j 表示虚数单位。例如：

   ```python
   a = 1+2j      # 复数
   b = complex(3, 4)   # 复数，等于 3+4j
   ```

4. 布尔值（bool）只有两个取值，`True` 和 `False`，用于表示真和假。在 Python 中，布尔值可以和数值进行运算，True 转换为 1，False 转换为 0。例如：

   ```python
   a = True
   b = False
   c = 1 + True   # c 的值为 2
   d = 3 * False  # d 的值为 0
   ```

数字的操作和运算：

1. 整数除法、取模、幂运算

在 Python 中，使用 `/` 运算符进行除法运算得到的结果是浮点数，如果想要得到整数结果，可以使用 `//` 运算符进行整数除法运算。例如：

```python
a = 7 / 2   # a 的值为 3.5
b = 7 // 2  # b 的值为 3
```

同时，使用 `%` 运算符可以进行取模运算，即计算除法的余数。例如：

```python
c = 7 % 2   # c 的值为 1
```

`**`是一种运算符，称为“双星号运算符”或“幂运算符”。它可以用于计算一个数的幂。

```python
d = 2 ** 3  # 计算2的3次方，结果为8
```

2. 数字类型的转换

在 Python 中，可以使用` int()`、`float()` 和 `complex()` 函数将其他类型的数据转换为整数、浮点数和复数类型。例如：

```python
a = int("123")  # 将字符串 "123" 转换为整数类型
b = float("3.14")  # 将字符串 "3.14" 转换为浮点数类型
c = complex("1+2j")  # 将字符串 "1+2j" 转换为复数类型
print(a, b, c) # 123 3.14 (1+2j)
```

同时，可以使用 `str()`、`repr()` 和 `format()` 函数将数字转换为字符串类型。例如：

```python
a = str(123)                     # 将整数 123 转换为字符串类型
b = repr(3.1415926)              # 将浮点数 3.1415926 转换为字符串类型，使用 repr() 函数可以保留小数点后的精度
c = "{:.2f}".format(3.1415926)   # 将浮点数 3.1415926 转换为字符串类型，保留小数点后两位
print(a, b, c) # 123 3.1415926 3.14
```

3. 随机数生成

在 Python 中，可以使用 random 模块中的函数生成随机数。常用的函数包括：

- `random.random()`：生成一个 0 到 1 之间的随机浮点数。
- `random.randint(a, b)`：生成一个在 a 和 b 之间（包括 a 和 b）的随机整数。
- `random.choice(seq)`：从序列 seq 中随机选择一个元素并返回。
- `random.shuffle(seq)`：将序列 seq 中的元素随机排序。

例如，可以使用 random 模块中的 `randint()` 函数生成一个随机整数：

```python
import random

a = random.randint(1, 10)   # 生成一个在 1 和 10 之间的随机整数
print(a)
```

## 字符串

在 Python 中，**字符串是一种不可变序列类型** ，用于表示文本数据。字符串是由一系列 Unicode 字符组成的，可以包含任何字符，包括字母、数字、标点符号、空格等。

定义字符串可以使用 **单引号、双引号或三引号**。例如：

```python
str1 = 'Hello, world!'
str2 = "Hello, Python!"
str3 = """This is a long string that
spans multiple lines."""
```

字符串支持一些常用的操作，例如：

- 拼接字符串：使用加号（`+`）运算符

  ```python
  str4 = str1 + ' ' + str2
  # str4 = 'Hello, world! Hello, Python!'
  ```

- 访问字符串中的字符：使用 `下标（索引）`运算符或切片运算符

  ```python
  ch = str1[0]   # ch = 'H'
  substr = str2[7:13]  # substr = 'Python'
  ```

- 获取字符串的长度：使用` len()` 函数

  ```python
  length = len(str3)   # length = 45
  ```

- 查找子字符串：使用 `find()` 或 index() 函数

  ```python
  pos1 = str1.find('world')   # pos1 = 7
  pos2 = str2.index('Python') # pos2 = 7
  ```

- 替换子字符串：使用 `replace()` 函数

  ```python
  new_str = str1.replace('world', 'Python')   # new_str = 'Hello, Python!'
  ```

- 分割字符串：使用 `split()` 函数

  ```python
  words = str3.split()   # words = ['This', 'is', 'a', 'long', 'string', 'that', 'spans', 'multiple', 'lines.']
  ```

- 连接字符串列表：使用 `join()` 函数

  ```python
  new_str = '-'.join(words)   # new_str = 'This-is-a-long-string-that-spans-multiple-lines.'
  ```

- 判断字符串是否包含某个子字符串：使用 `in` 或 `not in` 运算符

  ```python
  flag1 = 'world' in str1   # flag1 = True
  flag2 = 'Python' not in str2   # flag2 = False
  ```

- 判断字符串是否以某个子字符串开头或结尾：使用 `startswith()` 和 `endswith()` 方法

  ```python
  flag3 = str1.startswith('Hello')   # flag3 = True
  flag4 = str2.endswith('!')   # flag4 = True
  ```

- 大小写转换：使用 `upper()` 和 `lower()` 方法

  ```python
  upper_str = str1.upper()   # upper_str = 'HELLO, WORLD!'
  lower_str = str2.lower()   # lower_str = 'hello, python!'
  ```

- 去除字符串两端的空白字符：使用 `strip()`、`lstrip()` 和 `rstrip()` 方法

  ```python
  str5 = '  Hello, Python!  '
  new_str1 = str5.strip()   # new_str1 = 'Hello, Python!'
  new_str2 = str5.lstrip()   # new_str2 = 'Hello, Python!  '
  new_str3 = str5.rstrip()   # new_str3 = '  Hello, Python!'
  ```

- 字符串转换为数字类型：使用 `int()`、`float()` 或 `complex()` 函数

  ```python
  num1 = int('123')   # num1 = 123
  num2 = float('3.14')   # num2 = 3.14
  num3 = complex('1+2j')   # num3 = (1+2j)
  ```

- 判断字符串是否全部由数字组成：使用 `isnumeric()` 方法

  ```python
  str6 = '123456'
  flag5 = str6.isnumeric()   # flag5 = True
  ```

- 判断字符串是否全部由字母组成：使用 `isalpha()` 方法

  ```python
  str7 = 'HelloWorld'
  flag6 = str7.isalpha()   # flag6 = True
  ```

- 判断字符串是否全部由字母和数字组成：使用 `isalnum()` 方法

  ```python
  str8 = 'Hello123'
  flag7 = str8.isalnum()   # flag7 = True
  ```

- 计算字符串中某个字符出现的次数：使用 `count()` 方法

  ```python
  str9 = 'Hello, Python!'
  count = str9.count('o')   # count = 2
  ```

- 将字符串按指定的宽度进行对齐：使用 `ljust()`、`rjust()` 和 `center()` 方

  ```python
  str10 = 'Hello'
  new_str4 = str10.ljust(10)   # new_str4 = 'Hello     '
  new_str5 = str10.rjust(10)   # new_str5 = '     Hello'
  new_str6 = str10.center(10)   # new_str6 = '  Hello   '
  ```

- 将字符串中的某个子字符串替换为另一个字符串：使用 `translate()` 方法

  ```python
  str11 = 'Hello, Python!'
  table = str.maketrans('lo', '12')
  new_str7 = str11.translate(table)   # new_str7 = 'He22, Pyth2n!'
  ```

  > 这段代码使用了字符串的 translate() 方法，用于将字符串中的某个子字符串替换为另一个字符串。具体来说，它的作用是将字符串 str11 中的所有字符 'l' 替换为 '1'，将所有字符 'o' 替换为 '2'，生成一个新的字符串 new_str7。
  >
  > 这里用到了 str.maketrans() 方法，它用于生成一个转换表，将字符串中的某些字符转换为其他字符。这个方法接受两个参数，两个参数都是字符串，第一个参数是需要被替换的字符，第二个参数是替换为的字符。生成的转换表可以用于字符串的 translate() 方法。
  >
  > 具体来说，这里的代码使用 str.maketrans('lo', '12') 生成了一个转换表，将字符 'l' 转换为 '1'，将字符 'o' 转换为 '2'。然后使用 translate() 方法将字符串 str11 中的字符按照转换表进行替换，生成了一个新的字符串 new_str7，它的值为 'He22, Pyth2n!'。
  >
  > 需要注意的是，**这种字符串的替换方式只是按照字符进行替换，不是按照子字符串进行替换**。如果需要按照子字符串进行替换，可以使用字符串的 replace() 方法。

- 将字符串从左侧或右侧填充指定的字符：使用` lstrip()` 和 `rstrip() `方法

  ```python
  str12 = 'Hello'
  new_str8 = str12.lstrip('H')   # new_str8 = 'ello'
  new_str9 = str12.rstrip('o')   # new_str9 = 'Hell'
  ```

Python 中字符串的知识点还有很多，包括但不限于：

- 格式化字符串：Python 3.6 以后的版本支持 `f-string`，可以在字符串中直接使用表达式和变量，非常方便。例如：

  ```python
  name = 'John'
  age = 25
  greeting = f'My name is {name}, and I am {age} years old.'
  # greeting = 'My name is John, and I am 25 years old.'
  ```

- 字符串的格式化输出：Python 中的 `format()` 方法可以对字符串进行格式化输出，支持各种格式控制符和占位符。例如：

  ```python
  pi = 3.141592653589793
  print('pi = {:.2f}'.format(pi))   # 输出 'pi = 3.14'
  ```

- 正则表达式：Python 中内置了 `re` 模块，可以使用正则表达式进行字符串匹配和替换操作，非常强大。例如：

  ```python
  import re

  str13 = 'Hello, world!'
  pattern = r'w\w+'
  match = re.search(pattern, str13)
  if match:
      print(match.group())   # 输出 'world'
  ```

- 字符串的编码和解码：Python 中的字符串是 `Unicode` 字符串，可以使用 `encode()` 方法将字符串编码成字节串，使用 `decode()` 方法将字节串解码成字符串。例如：

  ```python
  str14 = '你好，世界！'
  utf8_bytes = str14.encode('utf-8')
  gb2312_bytes = str14.encode('gb2312')
  utf8_str = utf8_bytes.decode('utf-8')
  gb2312_str = gb2312_bytes.decode('gb2312')
  ```

- 字符串的比较和排序：Python 中的字符串可以进行比较和排序操作，使用的是按照 `Unicode` 码点进行比较和排序的规则。例如：

  ```python
  str_list = ['world', 'hello', 'Python', 'java']
  str_list.sort()
  print(str_list)   # 输出 ['Python', 'hello', 'java', 'world']

  # 对列表进行降序排序
  str_list.sort(reverse=True)
  print(str_list)   # 输出 ['world', 'java', 'hello', 'Python']
  ```

> 这段代码用于对一个字符串列表进行排序，它使用了列表的 `sort()` 方法，将列表中的元素按照一定的规则进行排序。具体来说，它的作用是将字符串列表 `str_list` 按照字典序进行升序排序，生成一个新的排序后的列表。
>
> 在 Python 中，字符串是可以进行比较操作的，比较的规则是按照 Unicode 码点进行比较。因此，对于字符串列表的排序，实际上就是按照字符串的字典序进行排序。具体来说，对于两个字符串 s1 和 s2，按照字典序进行比较的规则是：
>
> - 如果 s1 在 s2 的前面，则 s1 < s2；
> - 如果 s1 在 s2 的后面，则 s1 > s2；
> - 如果 s1 和 s2 相等，则 s1 == s2。
>
> 因此，对于这段代码中的字符串列表 str_list，它的排序结果为 ['Python', 'hello', 'java', 'world']，其中 'Python' 在字典序中排在最前面，'world' 在字典序中排在最后面。
>
> 需要注意的是，列表的 `sort()` 方法会直接修改原有的列表，如果不想修改原有列表，可以使用 `sorted() `函数。例如：
>
> ```python
> str_list = ['world', 'hello', 'Python', 'java']
> new_str_list = sorted(str_list)
> print(new_str_list)   # 输出 ['Python', 'hello', 'java', 'world']
>
> # 对列表生成器进行降序排序
> new_str_list = sorted(str_list, reverse=True)
> print(new_str_list)   # 输出 ['world', 'java', 'hello', 'Python']
> ```
>
> 这样做可以生成一个新的排序后的列表，不会修改原有的列表。

需要注意的是，**由于字符串是不可变的，因此对字符串进行修改会创建一个新的字符串对象。**

## 列表

在 Python 中，列表（list）是一种可变序列类型，用于存储一组有序的元素。列表中的元素可以是任意类型的数据，包括数字、字符串、布尔值、列表、元组、字典等。列表使用方括号 [] 表示，元素之间使用逗号分隔。例如：

```python
my_list = [1, 2, "hello", True, [3, 4, 5], {"name": "Alice", "age": 20}]
```

列表中的元素可以通过索引（下标）进行访问和修改。列表的索引从 0 开始，可以使用正整数和负整数来表示。正整数表示从左往右数的索引，负整数表示从右往左数的索引，例如：

```python
my_list = [1, 2, 3, 4, 5]
print(my_list[0])     # 输出 1，第一个元素的索引为 0
print(my_list[-1])    # 输出 5，最后一个元素的索引为 -1
```

可以使用切片运算符 `:` 来获取列表的子列表。切片运算符表示从起始索引到终止索引之间的所有元素，不包括终止索引对应的元素。例如：

```python
my_list = [1, 2, 3, 4, 5]
print(my_list[1:3])   # 输出 [2, 3]
print(my_list[:3])    # 输出 [1, 2, 3]
print(my_list[3:])    # 输出 [4, 5]
```

列表是一种可变类型，可以通过索引和切片操作来修改列表中的元素。此外，还可以使用列表的方法来添加、删除和修改元素。常用的列表方法包括：

- `append(x)`：在列表末尾添加元素 x。
- `insert(i, x)`：在列表的第 i 个位置插入元素 x。
- `extend(iterable)`：在列表末尾添加可迭代对象 `iterable` 中的所有元素。
- `remove(x)`：删除列表中第一个值为 x 的元素。
- `pop([i])`：删除列表中索引为 i 的元素，并返回该元素的值。如果省略 i，则默认删除最后一个元素。
- `clear()`：删除列表中的所有元素。
- `index(x)`：返回列表中第一个值为 x 的元素的索引。如果列表中不存在值为 x 的元素，则抛出 `ValueError` 异常。
- `count(x)`：返回列表中值为 x 的元素的个数。
- `sort()`：对列表中的元素进行排序。默认按照升序排列，可以使用 `reverse=True` 参数进行降序排列。
- `reverse()`：将列表中的元素反转。

例如，可以使用 `append() `方法向列表中添加元素：

```python
my_list = [1, 2, 3]
my_list.append(4)
print(my_list)   # 输出 [1, 2, 3, 4]
```

需要注意的是，列表是一种可变类型，修改一个列表会影响到所有引用该列表的变量。如果需要复制一个列表并独立使用，可以使用 `copy() `方法或切片运算符进行复制。例如：

```python
my_list = [1, 2, 3]
new_list = my_list.copy()   # 复制一个新的列表
new_list.append(4)
print(my_list)   # 输出 [1, 2, 3]
print(new_list)  # 输出 [1, 2, 3, 4]
```

除了上面提到的基本操作和常用方法，Python 列表还有一些其他的特性和用法，如下：

1. 列表推导式

列表推导式（list comprehension）是一种快速创建列表的方式。列表推导式由一对方括号和一个表达式构成，表达式可以包含一个或多个循环和条件语句。例如，下面的列表推导式生成了一个包含 1 到 10 的平方值的列表：

```python
squares = [x ** 2 for x in range(1, 11)]
print(squares)   # 输出 [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
```

2. `zip()` 函数

`zip()` 函数用于将多个列表中对应位置的元素合并成元组。`zip()` 函数返回一个 zip 对象，可以使用 `tuple()` 函数将其转换为元组列表。例如：

```python
names = ["Alice", "Bob", "Charlie"]
ages = [20, 25, 30]
zipped = zip(names, ages)
print(list(zipped))   # 输出 [('Alice', 20), ('Bob', 25), ('Charlie', 30)]
```

3. 列表的复制和浅拷贝

当使用赋值语句将一个列表赋值给另一个变量时，实际上是将该列表的引用赋值给了新变量，两个变量指向同一个列表对象。如果修改其中一个变量对应的列表，另一个变量也会受到影响。例如：

```python
a = [1, 2, 3]
b = a
b.append(4)
print(a)   # 输出 [1, 2, 3, 4]
print(b)   # 输出 [1, 2, 3, 4]
```

为了避免这种情况，可以使用 `copy()` 方法或切片运算符进行复制。但是需要注意的是，这种复制方式只是进行了浅拷贝，即只复制了列表中的元素的引用，而不是元素本身。如果列表中的元素是可变对象（如列表、字典等），修改其中一个元素的值会影响到所有引用该元素的变量。例如：

```python
a = [[1, 2], [3, 4]]
b = a.copy()
b[0].append(3)
print(a)   # 输出 [[1, 2, 3], [3, 4]]
print(b)   # 输出 [[1, 2, 3], [3, 4]]
```

可以看到，修改 b 中的第一个元素也影响到了 a 中的元素。如果需要完全独立的复制一个列表，需要使用深拷贝（deep copy）方式，可以使用 copy 模块中的 `deepcopy()` 函数。例如：

```python
import copy

a = [[1, 2], [3, 4]]
b = copy.deepcopy(a)
b[0].append(3)
print(a)   # 输出 [[1, 2], [3, 4]]
print(b)   # 输出 [[1, 2, 3], [3, 4]]
```

4. 列表解包

列表解包（list unpacking）是一种快速将列表中的元素分别赋值给多个变量的方式。列表解包使用一对方括号和多个变量名构成，变量名之间使用逗号分隔。例如：

```python
my_list = [1, 2, 3]
a, b, c = my_list
print(a, b, c)   # 输出 1 2 3
```

5. 列表的判断和比较

可以使用 `in` 和 `not in` 运算符判断一个元素是否在列表中，可以使用 `==` 和 `!=` 运算符比较两个列表是否相等。例如：

```python
my_list = [1, 2, 3]
print(2 in my_list)    # 输出 True
print(4 not in my_list)   # 输出 True

other_list = [1, 2, 3]
print(my_list == other_list)   # 输出 True
print(my_list is other_list)   # 输出 False，两个列表不是同一个对象
```

需要注意的是，列表的比较是按照元素的顺序和值进行的，如果两个列表包含相同的元素但顺序不同，则它们不相等。例如：

```python
a = [1, 2, 3]
b = [3, 2, 1]
print(a == b)   # 输出 False
```

6. 列表的迭代和生成器

可以使用 `for` 循环对列表进行迭代，也可以使用列表推导式或生成器表达式生成一个生成器（generator）。生成器是一种特殊的迭代器，可以逐个产生列表中的元素，避免一次性加载整个列表到内存中。例如：

```python
my_list = [1, 2, 3, 4, 5]
# 列表迭代
for x in my_list:
    print(x)

# 生成器表达式
gen = (x ** 2 for x in my_list)
for x in gen:
    print(x)
```

7. 列表的高级排序

除了 `sort() `方法之外，Python 还提供了一些高级的排序方法，如 `sorted()` 函数和 `sort() `方法的 key 参数和 cmp 参数。sorted() 函数可以对任意可迭代对象进行排序，返回一个新的有序列表。key 参数指定一个函数，用于对每个元素进行排序，cmp 参数可以指定一个比较函数，用于比较两个元素。例如：

```python
my_list = ["apple", "banana", "orange", "grape"]
# 按照字符串长度排序
sorted_list = sorted(my_list, key=len)
print(sorted_list)   # 输出 ['apple', 'grape', 'banana', 'orange']

# 按照字母顺序排序
my_list.sort(key=str.lower)
print(my_list)   # 输出 ['apple', 'banana', 'grape', 'orange']
```

## 元组

在 Python 中，元组（tuple）是一种不可变的序列类型，用于存储一组有序的对象。元组与列表类似，但元组一旦创建就不能被修改，也没有添加、删除、修改等操作的方法，因此元组更加轻量级，而且更加安全。元组使用一对圆括号和逗号分隔的对象列表构成，如下所示：

```python
my_tuple = (1, 2, 3)
```

可以使用索引和切片运算符对元组进行访问和切片。元组支持所有的序列操作，如 len()、in、+、\* 等。元组也可以包含任意类型的对象，包括其他元组。例如：

```python
t1 = ("apple", 1, True)
t2 = (t1, "banana", 2.5)
print(t2)   # 输出 (('apple', 1, True), 'banana', 2.5)
print(t2[0][1])   # 输出 1
```

元组的不可变性可以保证元组中的对象不会被修改，从而增强程序的安全性和稳定性。元组通常用于表示一些不可变的数据，如坐标、日期、时间等。元组也可以用于函数的返回值，将多个值打包成一个元组返回。例如：

```python
def get_rectangle_area_and_perimeter(length, width):
    area = length * width
    perimeter = 2 * (length + width)
    return area, perimeter

area, perimeter = get_rectangle_area_and_perimeter(10, 5)
print(area, perimeter)   # 输出 50 30
```

需要注意的是，如果元组中只有一个元素，需要在元素后面加上逗号，否则会被解释为其他类型。例如：

```python
my_tuple = (1,)   # 包含一个元素的元组
not_a_tuple = (1)   # 一个整数，而不是元组
```

下面是 Python 元组的一些其他特性和用法：

1. 元组解包

和列表解包类似，可以使用元组解包（tuple unpacking）将元组中的元素依次赋值给多个变量，变量名之间使用逗号分隔。例如：

```python
my_tuple = (1, 2, 3)
a, b, c = my_tuple
print(a, b, c)   # 输出 1 2 3
```

2. 元组的比较和排序

和列表一样，元组也支持比较运算符（==、!=、<、<=、>、>=）和排序方法（sorted()、sort()）。元组的比较是按照元素的顺序和值进行的，如果两个元组包含相同的元素但顺序不同，则它们不相等。例如：

```python
a = (1, 2, 3)
b = (3, 2, 1)
print(a == b)   # 输出 False
```

3. 元组作为不可变字典的键

由于元组是不可变的，可以用作字典的键。如果要使用列表作为字典的键，则需要先将列表转换为元组。例如：

```python
my_dict = {("apple", "banana"): 1, ("orange", "grape"): 2}
print(my_dict[("apple", "banana")])   # 输出 1
```

4. `*` 运算符

可以使用 `*` 运算符将多个元组合并成一个元组。例如：

```python
t1 = (1, 2, 3)
t2 = (4, 5, 6)
t3 = (*t1, *t2)
print(t3)   # 输出 (1, 2, 3, 4, 5, 6)
```

5. 元组的生成器

和列表一样，元组也可以使用生成器表达式生成一个生成器（generator）。生成器是一种特殊的迭代器，可以逐个产生元组中的元素，避免一次性加载整个元组到内存中。例如：

```python
my_tuple = (1, 2, 3, 4, 5)
# 生成器表达式
gen = (x ** 2 for x in my_tuple)
for x in gen:
    print(x)
```

## 集合

Python 中的集合类型是 set（集合）和 frozenset（不可变集合）。

set 是一种无序、可变的集合类型，其中不允许有重复元素。可以使用大括号`{}`或`set()`函数来创建一个集合。例如：

```python
my_set = {1, 2, 3}
print(my_set)   # 输出 {1, 2, 3}

my_set = set([1, 2, 3, 2])
print(my_set)   # 输出 {1, 2, 3}
```

可以使用 add()方法向集合中添加元素，使用`remove()`方法删除元素。可以使用`in`关键字来检查元素是否在集合中。例如：

```python
my_set = {1, 2, 3}
my_set.add(4)
print(my_set)   # 输出 {1, 2, 3, 4}

my_set.remove(2)
print(my_set)   # 输出 {1, 3, 4}

print(2 in my_set)   # 输出 False
```

集合支持各种集合运算，如并集、交集、差集等。例如：

```python
set1 = {1, 2, 3}
set2 = {3, 4, 5}

# 并集
print(set1 | set2)   # 输出 {1, 2, 3, 4, 5}

# 交集
print(set1 & set2)   # 输出 {3}

# 差集
print(set1 - set2)   # 输出 {1, 2}

# 对称差集
print(set1 ^ set2)   # 输出 {1, 2, 4, 5}
```

frozenset 是一种不可变的集合类型，可以使用`frozenset()`函数来创建。frozenset 和 set 具有相似的操作，但是不支持添加、删除元素等操作。例如：

```python
my_fset = frozenset([1, 2, 3])
print(my_fset)   # 输出 frozenset({1, 2, 3})
```

下面是 Python 中集合类型的一些其他特性和用法：

1. 列表、元组转换为集合

可以使用`set()`函数将列表或元组转换为集合。集合会自动去除重复元素。例如：

```python
my_list = [1, 2, 2, 3, 3, 3]
my_set = set(my_list)
print(my_set)   # 输出 {1, 2, 3}

my_tuple = (4, 5, 5, 6, 6, 6)
my_set = set(my_tuple)
print(my_set)   # 输出 {4, 5, 6}
```

2. 集合的长度

可以使用`len()`函数获取集合的长度（即集合中元素的个数）。例如：

```python
my_set = {1, 2, 3}
print(len(my_set))   # 输出 3
```

3. 集合的迭代

可以使用`for`循环迭代集合中的元素。由于集合是无序的，每次迭代的顺序可能不同。例如：

```python
my_set = {1, 2, 3}
for x in my_set:
    print(x)
```

4. 集合解析

和列表解析类似，可以使用集合解析（set comprehension）快速生成一个集合。例如：

```python
my_set = {x for x in range(1, 6)}
print(my_set)   # 输出 {1, 2, 3, 4, 5}
```

5. frozenset 作为字典键

由于`frozenset`是不可变的，可以作为字典的键。例如：

```python
my_dict = {frozenset({1, 2}): "A", frozenset({3, 4}): "B"}
print(my_dict[frozenset({1, 2})])   # 输出 "A"
```

6. 集合的类型

可以使用`type()`函数查看集合的类型，也可以使用`isinstance()`函数判断集合是否属于某种类型。例如：

```python
my_set = {1, 2, 3}
print(type(my_set))   # 输出 <class 'set'>
print(isinstance(my_set, set))   # 输出 True
```

7. 集合的复制

集合可以使用`copy()`方法进行复制。复制后的集合和原集合具有不同的内存地址，互不影响。例如：

```python
my_set = {1, 2, 3}
new_set = my_set.copy()
print(new_set)   # 输出 {1, 2, 3}

new_set.add(4)
print(new_set)   # 输出 {1, 2, 3, 4}
print(my_set)    # 输出 {1, 2, 3}
```

8. 集合的更新

可以使用`update()`方法将一个集合的元素添加到另一个集合中。例如：

```python
set1 = {1, 2, 3}
set2 = {3, 4, 5}
set1.update(set2)
print(set1)   # 输出 {1, 2, 3, 4, 5}
```

9. 集合的删除

可以使用`discard()`方法或`remove()`方法来删除集合中的元素。如果要删除的元素不存在，`discard()`方法不会报错，而`remove()`方法会抛出 KeyError 异常。例如：

```python
my_set = {1, 2, 3}
my_set.discard(2)
print(my_set)   # 输出 {1, 3}

my_set.remove(3)
print(my_set)   # 输出 {1}

my_set.discard(3)   # 不会报错
my_set.remove(3)    # 抛出KeyError异常
```

10. 集合的清空

可以使用`clear()`方法清空集合中的所有元素。例如：

```python
my_set = {1, 2, 3}
my_set.clear()
print(my_set)   # 输出 set()
```

## 字典

在 Python 中，字典是一种可变的数据类型，用于存储键-值对。字典用大括号{}表示，每个键值对之间用逗号分隔。字典中的键必须是不可变的，如整数、字符串或元组，而值可以是任意的 Python 对象。

下面是一个简单的字典示例：

```python
my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}
```

在上面的例子中，键'name'、'age'和'city'分别与值'John'、30 和'New York'相关联。可以使用键来访问字典中的值，例如：

```python
print(my_dict['name'])  # 输出：John
print(my_dict['age'])  # 输出：30
```

您还可以使用`dict()`函数从其他序列或映射创建字典，如下所示：

```python
my_dict2 = dict([('name', 'Mary'), ('age', 25), ('city', 'Los Angeles')])
print(my_dict2)  # 输出：{'name': 'Mary', 'age': 25, 'city': 'Los Angeles'}
```

字典支持许多有用的方法，如`keys()`、`values()`和`items()`，这些方法返回字典的键、值和键-值对的视图。字典的视图可用于按照特定的顺序访问字典中的元素，或对字典进行迭代操作。例如：

```python
# 获取字典的键列表
print(list(my_dict.keys()))  # 输出：['name', 'age', 'city']

# 获取字典的值列表
print(list(my_dict.values()))  # 输出：['John', 30, 'New York']

# 获取字典的键-值对列表
print(list(my_dict.items()))  # 输出：[('name', 'John'), ('age', 30), ('city', 'New York')]

# 使用for循环迭代字典的键和值
for key, value in my_dict.items():
    print(key, value)
```

以下是一些进阶的字典操作：

1. 向字典中添加或更新键值对

可以使用`[key]`索引或`update()`方法向字典中添加或更新键值对。例如：

```python
# 添加新的键值对
my_dict['gender'] = 'male'
print(my_dict)  # 输出：{'name': 'John', 'age': 30, 'city': 'New York', 'gender': 'male'}

# 更新现有的键值对
my_dict['age'] = 40
print(my_dict)  # 输出：{'name': 'John', 'age': 40, 'city': 'New York', 'gender': 'male'}
```

可以使用`update()`方法将一个字典合并到另一个字典中。如果键相同，则后一个字典的值将覆盖前一个字典的值。例如：

```python
my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}
my_dict2 = {'gender': 'male', 'country': 'USA'}
my_dict.update(my_dict2)
print(my_dict)  # 输出：{'name': 'John', 'age': 30, 'city': 'New York', 'gender': 'male', 'country': 'USA'}
```

2. 删除字典中的键值对

可以使用`del`语句或`pop()`方法从字典中删除键值对。例如：

```python
# 使用del删除键值对
del my_dict['gender']
print(my_dict)  # 输出：{'name': 'John', 'age': 40, 'city': 'New York'}

# 使用pop删除键值对
my_dict.pop('age')
print(my_dict)  # 输出：{'name': 'John', 'city': 'New York'}
```

3. 使用`items()`方法遍历字典的键值对

可以使用`items()`方法遍历字典的键值对。例如：

```python
my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}
for key, value in my_dict.items():
    print(f"{key}: {value}")
```

在这个例子中，`items()`方法返回一个由键值对组成的元组，然后使用`for`循环遍历这个元组并打印出每个键值对。

3. 使用字典推导式创建字典

可以使用字典推导式从其他序列或字典创建新的字典。例如：

```python
# 从列表创建字典
my_list = [('name', 'John'), ('age', 30), ('city', 'New York')]
my_dict = {key: value for key, value in my_list}
print(my_dict)  # 输出：{'name': 'John', 'age': 30, 'city': 'New York'}

# 从另一个字典创建字典
my_dict2 = {'gender': 'male', 'country': 'USA'}
my_dict3 = {**my_dict, **my_dict2}
print(my_dict3)  # 输出：{'name': 'John', 'age': 30, 'city': 'New York', 'gender': 'male', 'country': 'USA'}
```

4. 使用`defaultdict`创建默认值字典

`defaultdict`是一个字典子类，它允许您指定一个默认值，以便在访问不存在的键时返回该值。例如：

```python
from collections import defaultdict

my_dict = defaultdict(int)  # 默认值为0
my_dict['age'] += 1
print(my_dict)  # 输出：{'age': 1}

my_dict2 = defaultdict(list)  # 默认值为[]
my_dict2['names'].append('John')
print(my_dict2)  # 输出：{'names': ['John']}
```

5. 使用`sorted()`函数按照键或值排序字典

可以使用`sorted()`函数按照字典的键或值对字典进行排序。例如：

```python
# 按照键排序字典
my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}
sorted_dict = dict(sorted(my_dict.items(), key=lambda x: x[0]))
print(sorted_dict)  # 输出：{'age': 30, 'city': 'New York', 'name': 'John'}

# 按照值排序字典
my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}
sorted_dict = dict(sorted(my_dict.items(), key=lambda x: x[1]))
print(sorted_dict)  # 输出：{'age': 30, 'name': 'John', 'city': 'New York'}
```

6. 使用`zip()`函数将两个序列合并为字典

可以使用`zip()`函数将两个序列合并为一个字典。例如：

```python
keys = ['name', 'age', 'city']
values = ['John', 30, 'New York']
my_dict = dict(zip(keys, values))
print(my_dict)  # 输出：{'name': 'John', 'age': 30, 'city': 'New York'}
```

7. 使用`json`模块将字典转换为 JSON 格式

可以使用`json`模块将 Python 字典转换为 JSON 格式的字符串。例如：

```python
import json

my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}
json_str = json.dumps(my_dict)
print(json_str)  # 输出：{"name": "John", "age": 30, "city": "New York"}
```

8. 使用`pprint`模块打印出漂亮的字典输出

可以使用`pprint`模块打印出漂亮的、易于阅读的字典输出。例如：

```python
from pprint import pprint

my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}
pprint(my_dict)
```

9. 使用`copy()`方法或`dict()`构造函数创建字典副本

可以使用`copy()`方法或`dict()`构造函数创建字典的副本。例如：

```python
my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}
my_dict_copy = my_dict.copy()  # 使用copy()方法创建副本
my_dict_copy['age'] = 40
print(my_dict)  # 输出：{'name': 'John', 'age': 30, 'city': 'New York'}
print(my_dict_copy)  # 输出：{'name': 'John', 'age': 40, 'city': 'New York'}

my_dict2 = dict(my_dict)  # 使用dict()构造函数创建副本
my_dict2['name'] = 'Mary'
print(my_dict)  # 输出：{'name': 'John', 'age': 30, 'city': 'New York'}
print(my_dict2)  # 输出：{'name': 'Mary', 'age': 30, 'city': 'New York'}
```

10. 使用`setdefault()`方法获取字典的值

可以使用`setdefault()`方法获取字典的值。如果键存在，则返回键的值。如果键不存在，则返回默认值并将其添加到字典中。例如：

```python
my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}
name = my_dict.setdefault('name', 'Unknown')
gender = my_dict.setdefault('gender', 'male')
print(name)  # 输出：John
print(gender)  # 输出：male
print(my_dict)  # 输出：{'name': 'John', 'age': 30, 'city': 'New York', 'gender': 'male'}
```

11. 字典解包

字典解包是一种将字典转换为关键字参数的技术。字典解包使用一个或两个星号运算符（`*`或`**`）来实现。

具体来说，当使用单个星号运算符`*`将一个字典解包时，它会将字典的键解包为一个可迭代对象，可以在函数调用中作为位置参数传递。例如：

```python
def print_info(name, age, city):
    print(f"Name: {name}")
    print(f"Age: {age}")
    print(f"City: {city}")

my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}
print_info(*my_dict)  # 输出：TypeError: print_info() takes 3 positional arguments but 6 were given
```

在这个例子中，由于`print_info()`函数需要 3 个关键字参数`name`、`age`和`city`，而字典`my_dict`中有 3 个键`name`、`age`和`city`，因此它们被解包为一个可迭代对象`('name', 'age', 'city')`，然后作为位置参数传递给`print_info()`函数。但是，由于`print_info()`函数需要的是关键字参数而不是位置参数，因此出现了`TypeError`异常。

为了解决这个问题，可以使用双星号运算符`**`将字典解包为关键字参数。例如：

```python
def print_info(name, age, city):
    print(f"Name: {name}")
    print(f"Age: {age}")
    print(f"City: {city}")

my_dict = {'name': 'John', 'age': 30, 'city': 'New York'}
print_info(**my_dict)  # 输出：Name: John Age: 30 City: New York
```

在这个例子中，双星号运算符`**`将字典`my_dict`解包为关键字参数`name='John'`、`age=30`和`city='New York'`，然后将它们作为关键字参数传递给`print_info()`函数，这样就能够成功地打印出字典中的值了。

需要注意的是，只有在函数定义中明确指定了这些关键字参数时，才能使用字典解包。否则，将会引发`TypeError`异常。

## None

在 Python 中，`None`是一个特殊的对象，表示一个空值或缺失值。`None`是 Python 中唯一的空值对象，用于表示没有值的情况。它是一个单例对象，也就是说，Python 中的所有`None`引用都指向同一个对象。

`None`类型可以用于多种情况，例如：

- 表示函数没有返回值
- 表示变量尚未被赋值
- 表示一个字典中没有指定的键
- 表示一个类的属性尚未被赋值

以下是一些使用`None`的例子：

```python
def print_hello():
    print("Hello, world!")
    # 函数没有返回值，所以可以不写return语句

x = None
if x is None:
    print("x is not defined")

my_dict = {'name': 'John', 'age': 30}
city = my_dict.get('city')
if city is None:
    print("No city found in my_dict")

class Person:
    def __init__(self, name=None, age=None):
        self.name = name
        self.age = age

p = Person("John")
if p.age is None:
    print("Age not specified")
```

在这些例子中，我们可以看到`None`被用于表示函数没有返回值、变量尚未被赋值、一个字典中没有指定的键以及一个类的属性尚未被赋值等情况。

Python 中`None`类型的一些补充说明：

1. NoneType 类型

在 Python 中，`None`是一个特殊的对象，其类型为`NoneType`。可以使用`type()`函数来检查一个对象的类型。例如：

```python
x = None
print(type(x))  # 输出：<class 'NoneType'>
```

在这个例子中，`type()`函数返回变量`x`的类型，即`NoneType`。

2. 避免与其他类型混淆

在 Python 中，`None`类型只能与自身进行比较，不能与其他类型进行比较。如果不小心将`None`与其他类型混淆，可能会导致一些奇怪的行为。例如：

```python
x = None
if x == '':
    print("x is an empty string")
```

在这个例子中，由于`==`操作符将`None`与空字符串进行比较，所以程序不会打印任何内容。如果想检查一个变量是否为字符串，应该使用`isinstance()`函数。例如：

```python
x = None
if isinstance(x, str):
    print("x is a string")
```

在这个例子中，`isinstance()`函数检查变量`x`是否为字符串类型。

3. 使用`is not None`检查变量是否存在

在 Python 中，如果想检查一个变量是否存在，应该使用`is not None`表达式。例如：

```python
x = None
if x is not None:
    print("x is defined")
```

在这个例子中，`is not None`表达式检查变量`x`是否存在。如果存在，则打印出`x is defined`。这种写法比使用`if x:`更明确，可以避免一些潜在的问题。
