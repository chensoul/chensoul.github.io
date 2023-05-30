---
title: "Python学习2：Python数据类型"
date: 2023-05-12T09:00:00+08:00
slug: python-data-type
draft: true
categories: ["Notes"]
tags: ["python"]

---

Python 中的数据类型包括：

1. 数字类型：包括整型、浮点型和复数型。
2. 字符串类型：由一系列字符组成，可以是单引号、双引号或三引号括起来的文本。
3. 布尔类型：只有两个取值，True 和 False，用于表示逻辑值。
4. 列表类型：由一系列有序的元素组成，可以包含任何类型的数据。
5. 元组类型：与列表类似，但是`元素不能被修改`。
6. 集合类型：由一组唯一的元素组成，支持集合的基本操作，如并集、交集和差集等。
7. 字典类型：由一组键值对组成，其中键是唯一的，用于查找和存储值。
8. None 类型：表示空值或缺失值。



## 字符串

定义字符串变量：

```python
# 字符串类型
name = "John"
message = 'Hello, world!'
multiline = """This is a
multiline string"""
```

查看字符串类型：

```python
type(name) # <class 'str'>
```

字符串长度：

```python
len(name) # 4
```

字符串相加：

```python
string1 = "abra"
string2 = "cadabra"
magic_string = string1 + string2
magic_string # abracadabra
```



```python
flavor = "apple pie"
flavor[1] # p
```



示例：

```python
# 数字类型
x = 42
y = 3.14
z = 1 + 2j



# 布尔类型
is_true = True
is_false = False

# 列表类型
my_list = [1, 'two', 3.0, [4, 5]]

# 元组类型
my_tuple = (1, 'two', 3.0)

# 集合类型
my_set = {1, 2, 3}

# 字典类型
my_dict = {'name': 'John', 'age': 30}

# None 类型
my_var = None
```

在这个示例中，我们定义了各种不同类型的变量，包括数字、字符串、布尔、列表、元组、集合、字典和 None。

Python 还支持许多其他类型，如文件类型、字节类型和日期时间类型等。可以通过 Python 的内置函数 type() 来查看变量的类型。
