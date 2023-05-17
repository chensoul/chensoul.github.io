---
title: "Python学习4：流程控制"
date: 2023-05-12T09:00:00+08:00
slug: python-flow-control
draft: true
categories: ["Notes"]
tags: ["python"]

---



在 Python 中，流程控制语句包括条件语句（if-elif-else）、循环语句（for 和 while）、和跳转语句（break、continue 和 return）。

## 条件语句

条件语句用于在不同的条件下执行不同的代码块。Python 中的条件语句是 if-elif-else 结构。

```python
# 条件语句示例
x = 10
if x < 0:
    print("x is negative")
elif x == 0:
    print("x is zero")
else:
    print("x is positive")
```



## 循环语句

循环语句用于重复执行一段代码，直到满足某个条件或达到某个条件次数为止。Python 中的循环语句包括 for 和 while 两种结构。

```python
# for 循环示例
my_list = [1, 2, 3, 4, 5]
for item in my_list:
    print(item)

# while 循环示例
x = 10
while x > 0:
    print(x)
    x -= 1
```



## 跳转语句

跳转语句用于在循环或函数中跳过一些代码或终止循环。Python 中的跳转语句包括 break、continue 和 return。

```python
# break 示例
my_list = [1, 2, 3, 4, 5]
for item in my_list:
    if item == 3:
        break
    print(item)

# continue 示例
my_list = [1, 2, 3, 4, 5]
for item in my_list:
    if item == 3:
        continue
    print(item)

# return 示例
def my_function(x):
    if x < 0:
        return None
    return x * 2
```

在这个示例中，我们使用 break 关键字来终止一个 for 循环，使用 continue 关键字来跳过一个循环迭代，使用 return 关键字来从函数中返回一个值。
