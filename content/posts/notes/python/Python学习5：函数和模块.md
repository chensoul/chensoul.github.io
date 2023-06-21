---
title: "Python学习5：函数和模块"
date: 2023-06-14T09:00:00+08:00
slug: python-comment-and-variable
draft: true
categories: ["Notes"]
tags: ["python"]
---

## 函数

### 函数的定义

在 Python 中，函数是一段可重复使用的代码块，它接受一些输入（也称为参数）并产生一些输出。函数可以通过 `def` 关键字来定义，语法如下：

```python
def function_name(parameters):
  	"""This is a function"""
    # function body
    return value
```

其中，`function_name` 是函数的名称，`parameters` 是函数的参数列表，`function body` 是函数的主体部分，包括需要执行的代码和可能的返回语句，`return value` 是函数的返回值（如果有的话）。



下列代码创建一个可以输出限定数值内的斐波那契数列函数：

````python
def fib(n):    # write Fibonacci series up to n
    """Print a Fibonacci series up to n."""
    a, b = 0, 1
    while a < n:
        print(a, end=' ')
        a, b = b, a+b
    print()


fib(2000) # 0 1 1 2 3 5 8 13 21 34 55 89 144 233 377 610 987 159
````

*定义* 函数使用关键字 `def`，后跟函数名与括号内的形参列表。函数语句从下一行开始，并且必须缩进。

函数内的第一条语句是字符串时，该字符串就是文档字符串，也称为 *docstring*。利用文档字符串可以自动生成在线文档或打印版文档，还可以让开发者在浏览代码时直接查阅文档；Python 开发者最好养成在代码中加入文档字符串的好习惯。

函数在 *执行* 时使用函数局部变量符号表，所有函数变量赋值都存在局部符号表中；引用变量时，首先，在局部符号表里查找变量，然后，是外层函数局部符号表，再是全局符号表，最后是内置名称符号表。因此，尽管可以引用全局变量和外层函数的变量，但最好不要在函数内直接赋值（除非是 `global` 语句定义的全局变量，或 `nonlocal` 语句定义的外层函数变量）。

在调用函数时会将实际参数（实参）引入到被调用函数的局部符号表中；因此，实参是使用 *按值调用* 来传递的（其中的 *值* 始终是对象的 *引用* 而不是对象的值）。 [1](https://docs.python.org/zh-cn/3/tutorial/controlflow.html#id2) 当一个函数调用另外一个函数时，会为该调用创建一个新的局部符号表。

函数定义在当前符号表中把函数名与函数对象关联在一起。解释器把函数名指向的对象作为用户自定义函数。还可以使用其他名称指向同一个函数对象，并访问访该函数：

```python
fib
f = fib
f(100) # 0 1 1 2 3 5 8 13 21 34 55 89
```

`fib` 不返回值，因此，其他语言不把它当作函数，而是当作过程。事实上，没有 `return` 语句的函数也返回值，只不过这个值比较是 `None` （是一个内置名称）。一般来说，解释器不会输出单独的返回值 `None` ，如需查看该值，可以使用 `print()`：

```python
fib(0)
print(fib(0))
```

### 函数参数

#### 默认值参数

在 Python 中，函数参数可以具有默认值，这意味着如果在函数调用期间未提供该参数的值，则使用默认值。定义具有默认值的函数参数的语法如下：

```python
def function_name(param1, param2=default_value):
    # function body
    return value
```

其中，param1 是必需的参数，它没有默认值；param2 是可选参数，如果未提供，则使用默认值 default_value。如果调用函数时提供了 param2 的值，则使用提供的值覆盖默认值。



以下是一个使用默认参数值的 Python 函数示例：

````python
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice")  # output: Hello, Alice!
greet("Bob", "Hi")  # output: Hi, Bob!
````

需要注意的是，当函数参数具有默认值时，应该将具有默认值的参数放在参数列表的末尾。这样可以使函数更加易于使用，并避免在调用函数时出现混淆。



以下是一个具有多个默认参数值的 Python 函数的示例：

````python
def create_user(name, age=18, gender="male", email=None):
    user = {"name": name, "age": age, "gender": gender}
    if email:
        user["email"] = email
    return user

user1 = create_user("Alice")
user2 = create_user("Bob", 20)
user3 = create_user("Charlie", gender="female", email="charlie@example.com")

print(user1)  # output: {'name': 'Alice', 'age': 18, 'gender': 'male'}
print(user2)  # output: {'name': 'Bob', 'age': 20, 'gender': 'male'}
print(user3)  # output: {'name': 'Charlie', 'age': 18, 'gender': 'female', 'email': 'charlie@example.com'}
````

#### 关键字参数

`kwarg=value` 形式的关键字参数也可以用于调用函数。函数示例如下：

```python
def parrot(voltage, state='a stiff', action='voom', type='Norwegian Blue'):
    print("-- This parrot wouldn't", action, end=' ')
    print("if you put", voltage, "volts through it.")
    print("-- Lovely plumage, the", type)
    print("-- It's", state, "!")
```

该函数接受一个必选参数（`voltage`）和三个可选参数（`state`, `action` 和 `type`）。该函数可用下列方式调用：

```python
parrot(1000)                                          # 1 positional argument
parrot(voltage=1000)                                  # 1 keyword argument
parrot(voltage=1000000, action='VOOOOOM')             # 2 keyword arguments
parrot(action='VOOOOOM', voltage=1000000)             # 2 keyword arguments
parrot('a million', 'bereft of life', 'jump')         # 3 positional arguments
parrot('a thousand', state='pushing up the daisies')  # 1 positional, 1 keyword
```

以下调用函数的方式都无效：

```python
parrot()                     # required argument missing
parrot(voltage=5.0, 'dead')  # non-keyword argument after a keyword argument
parrot(110, voltage=220)     # duplicate value for the same argument
parrot(actor='John Cleese')  # unknown keyword argument
```

函数调用时，关键字参数必须跟在位置参数后面。所有传递的关键字参数都必须匹配一个函数接受的参数（比如，`actor` 不是函数 `parrot` 的有效参数），关键字参数的顺序并不重要。这也包括必选参数，（比如，`parrot(voltage=1000)` 也有效）。不能对同一个参数多次赋值，下面就是一个因此限制而失败的例子：

```python
def function(a):
     pass
  
function(0, a=0)
#Traceback (most recent call last):
#  File "<stdin>", line 1, in <module>
#TypeError: function() got multiple values for argument 'a'
```

最后一个形参为 `**name` 形式时，接收一个字典，该字典包含与函数中已定义形参对应之外的所有关键字参数。`**name` 形参可以与 `*name` 形参（下一小节介绍）组合使用（`*name` 必须在 `**name` 前面）， `*name` 形参接收一个元组，该元组包含形参列表之外的位置参数。例如，可以定义下面这样的函数：

```python
def cheeseshop(kind, *arguments, **keywords):
    print("-- Do you have any", kind, "?")
    print("-- I'm sorry, we're all out of", kind)
    for arg in arguments:
        print(arg)
    print("-" * 40)
    for kw in keywords:
        print(kw, ":", keywords[kw])
```

该函数可以用如下方式调用：

```python
cheeseshop("Limburger", "It's very runny, sir.",
           "It's really very, VERY runny, sir.",
           shopkeeper="Michael Palin",
           client="John Cleese",
           sketch="Cheese Shop Sketch")
```

输出结果如下：

```bash
-- Do you have any Limburger ?
-- I'm sorry, we're all out of Limburger
It's very runny, sir.
It's really very, VERY runny, sir.
----------------------------------------
shopkeeper : Michael Palin
client : John Cleese
sketch : Cheese Shop Sketch
```

注意，关键字参数在输出结果中的顺序与调用函数时的顺序一致。

#### 特殊参数

默认情况下，参数可以按位置或显式关键字传递给 Python 函数。为了让代码易读、高效，最好限制参数的传递方式，这样，开发者只需查看函数定义，即可确定参数项是仅按位置、按位置或关键字，还是仅按关键字传递。

函数定义如下：

```
def f(pos1, pos2, /, pos_or_kwd, *, kwd1, kwd2):
      -----------    ----------     ----------
        |             |                  |
        |        Positional or keyword   |
        |                                - Keyword only
         -- Positional only
```

`/` 和 `*` 是可选的。这些符号表明形参如何把参数值传递给函数：位置、位置或关键字、关键字。关键字形参也叫作命名形参。

- 位置或关键字参数。函数定义中未使用 `/` 和 `*` 时，参数可以按位置或关键字传递给函数。

- 仅位置参数。特定形参可以标记为 *仅限位置*。*仅限位置* 时，形参的顺序很重要，且这些形参不能用关键字传递。仅限位置形参应放在 `/` （正斜杠）前。`/` 用于在逻辑上分割仅限位置形参与其它形参。如果函数定义中没有 `/`，则表示没有仅限位置形参。`/` 后可以是 *位置或关键字* 或 *仅限关键字* 形参。

- 仅限关键字参数。把形参标记为 *仅限关键字*，表明必须以关键字参数形式传递该形参，应在参数列表中第一个 *仅限关键字* 形参前添加 `*`。

请看下面的函数定义示例，注意 `/` 和 `*` 标记：

```python
def standard_arg(arg):
     print(arg)

def pos_only_arg(arg, /):
     print(arg)

def kwd_only_arg(*, arg):
     print(arg)

def combined_example(pos_only, /, standard, *, kwd_only):
     print(pos_only, standard, kwd_only)
```

第一个函数定义 `standard_arg` 是最常见的形式，对调用方式没有任何限制，可以按位置也可以按关键字传递参数：

```python
standard_arg(2) # 2

standard_arg(arg=2) # 2
```

第二个函数 `pos_only_arg` 的函数定义中有 `/`，仅限使用位置形参：

```python
pos_only_arg(1) # 1
```

第三个函数 `kwd_only_args` 的函数定义通过 `*` 表明仅限关键字参数：

```python
kwd_only_arg(arg=3) # 3
```

最后一个函数在同一个函数定义中，使用了全部三种调用惯例：

```python
combined_example(1, 2, kwd_only=3) # 1 2 3

combined_example(1, standard=2, kwd_only=3) #1 2 3
```

下面的函数定义中，`kwds` 把 `name` 当作键，因此，可能与位置参数 `name` 产生潜在冲突：

```python
def foo(name, **kwds):
    return 'name' in kwds
```

调用该函数不可能返回 `True`，因为关键字 `'name'` 总与第一个形参绑定。例如：

```python
foo(1, **{'name': 2})
#Traceback (most recent call last):
#  File "<stdin>", line 1, in <module>
#TypeError: foo() got multiple values for argument 'name'
```

加上 `/` （仅限位置参数）后，就可以了。此时，函数定义把 `name` 当作位置参数，`'name'` 也可以作为关键字参数的键：

```python
def foo(name, /, **kwds):
     return 'name' in kwds

foo(1, **{'name': 2}) # True
```

换句话说，仅限位置形参的名称可以在 `**kwds` 中使用，而不产生歧义。

### 任意实参列表

调用函数时，使用任意数量的实参是最少见的选项。这些实参包含在元组中。在可变数量的实参之前，可能有若干个普通参数：

```python
def write_multiple_items(file, separator, *args):
    file.write(separator.join(args))
```

*variadic* 参数用于采集传递给函数的所有剩余参数，因此，它们通常在形参列表的末尾。`*args` 形参后的任何形式参数只能是仅限关键字参数，即只能用作关键字参数，不能用作位置参数：

```python
def concat(*args, sep="/"):
    return sep.join(args)

concat("earth", "mars", "venus")
concat("earth", "mars", "venus", sep=".")
```

### 解包实参列表

函数调用要求独立的位置参数，但实参在列表或元组里时，要执行相反的操作。例如，内置的 `range()` 函数要求独立的 *start* 和 *stop* 实参。如果这些参数不是独立的，则要在调用函数时，用 `*` 操作符把实参从列表或元组解包出来：

```python
list(range(3, 6))            # normal call with separate arguments

args = [3, 6]
list(range(*args))            # call with arguments unpacked from a list
```

同样，字典可以用 `**` 操作符传递关键字参数：

```python
def parrot(voltage, state='a stiff', action='voom'):
    print("-- This parrot wouldn't", action, end=' ')
    print("if you put", voltage, "volts through it.", end=' ')
    print("E's", state, "!")

d = {"voltage": "four million", "state": "bleedin' demised", "action": "VOOM"}
parrot(**d)
```

### Lambda 表达式

`lambda` 关键字用于创建小巧的匿名函数。`lambda a, b: a+b` 函数返回两个参数的和。Lambda 函数可用于任何需要函数对象的地方。在语法上，匿名函数只能是单个表达式。在语义上，它只是常规函数定义的语法糖。与嵌套函数定义一样，lambda 函数可以引用包含作用域中的变量：

```python
def make_incrementor(n):
    return lambda x: x + n

f = make_incrementor(42)
f(0)

f(1)
```

上例用 lambda 表达式返回函数。还可以把匿名函数用作传递的实参：

```python
pairs = [(1, 'one'), (2, 'two'), (3, 'three'), (4, 'four')]
pairs.sort(key=lambda pair: pair[1])
pairs
```

### 函数注解

函数注解 是可选的用户自定义函数类型的元数据完整信息。

[标注](https://docs.python.org/zh-cn/3/glossary.html#term-function-annotation) 以字典的形式存放在函数的 `__annotations__` 属性中，并且不会影响函数的任何其他部分。 形参标注的定义方式是在形参名后加冒号，后面跟一个表达式，该表达式会被求值为标注的值。 返回值标注的定义方式是加组合符号 `->`，后面跟一个表达式，该标注位于形参列表和表示 `def` 语句结束的冒号之间。 下面的示例有一个必须的参数，一个可选的关键字参数以及返回值都带有相应的标注:

```python
def f(ham: str, eggs: str = 'eggs') -> str:
    print("Annotations:", f.__annotations__)
    print("Arguments:", ham, eggs)
    return ham + ' and ' + eggs

f('spam')
```
