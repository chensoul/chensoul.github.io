---
title: "Python安装、构建、发布"
date: 2023-05-08T19:00:00+08:00
slug: python-install-build-and-publish
draft: true
categories: ["Notes"]
tags: ["python"]

---



## Pip

### 安装

pip 是 Python 的包管理器，可以用于安装、升级和卸载 Python 包和依赖项。

安装 python3 时，会自动安装 pip3，查看 pip3 版本：

```bash
pip3 --version
```



### 使用方法

下面是 pip 的使用方法：

1、安装包

可以使用以下命令安装一个名为 packagename 的包：

```bash
pip install packagename
```

pip 会自动下载并安装 packagename 包及其依赖项。

2、升级包

可以使用以下命令升级一个名为 packagename 的包：

```bash
pip install --upgrade packagename
```

pip 会自动下载并升级 packagename 包及其依赖项。

3、卸载包

可以使用以下命令卸载一个名为 packagename 的包：

```bash
pip uninstall packagename
```

pip 会自动卸载 packagename 包及其依赖项。

4、查看已安装的包

可以使用以下命令查看已安装的所有包：

```bash
pip list
```

这将列出所有已安装的包及其版本号。

5、安装特定版本的包

可以使用以下命令安装一个名为 packagename 的特定版本的包：

```bash
pip install packagename==version
```

其中 version 是要安装的版本号。

6、安装开发版包

可以使用以下命令安装一个名为 packagename 的开发版包：

```bash
pip install git+https://github.com/username/packagename.git@branchname
```

其中 username 是包的作者，packagename 是包的名称，branchname 是分支名称。

7、安装包到指定目录

可以使用以下命令将一个名为 packagename 的包安装到指定目录：

```bash
pip install packagename -t /path/to/dir
```

这将把 packagename 包及其依赖项安装到指定目录。

8、导出依赖项列表

可以使用以下命令导出当前环境中的所有依赖项列表：

```bash
pip freeze > requirements.txt
```

这将把所有依赖项及其版本号写入 requirements.txt 文件中。

9、根据依赖项列表安装包

可以使用以下命令根据 requirements.txt 文件中的依赖项列表安装包：

```bash
pip install -r requirements.txt
```

这将自动安装 requirements.txt 中列出的所有依赖项及其版本号。

10、搜索包

可以使用以下命令搜索包：

```bash
pip search packagename
```

这将返回所有包名称包含 packagename 的包列表。

11、显示包信息

可以使用以下命令显示一个名为 packagename 的包的信息：

```bash
pip show packagename
```

这将返回 packagename 包的详细信息，包括版本号、作者、描述等。



### 优缺点

pip 作为 Python 的包管理工具，有以下优点和缺点：

优点：

1. 方便易用：pip 提供了简单易用的命令行界面，可以轻松地安装、升级和卸载 Python 包和依赖项。
2. 大量的包：pip 有着非常丰富的包库，可以满足大部分 Python 开发的需求。
3. 自动解决依赖关系：pip 能够自动解决包之间的依赖关系，避免了手动安装依赖项的繁琐过程。
4. 版本管理：pip 能够方便地安装和管理特定版本的包，这对于需要使用特定版本的包的项目来说非常有用。

缺点：

1. 安全性问题：pip 安装的包可能存在安全性问题，因为任何人都可以提交包到 pip 库。建议使用已经得到广泛使用和认可的包，或者自己构建和管理包。
2. 包的质量不一：pip 库中有许多包的质量参差不齐，有些包可能存在问题或者不再维护。因此需要开发者自己进行评估和筛选。
3. 版本管理：虽然 pip 能够方便地安装和管理特定版本的包，但是如果项目中使用的多个包版本之间存在冲突，可能会导致不兼容或者无法正常工作的问题。



### 如何避免pip安装的包存在安全性问题？

以下是一些其他的措施，可以帮助确保安装的包的安全性：

1. 使用已经得到广泛使用和认可的包：在选择安装包时，应该尽可能使用已经得到广泛使用和认可的包。这些包通常有一个良好的安全记录，并且由可靠的作者和维护者维护。
2. 仔细检查包的源代码：在安装包之前，应该仔细检查包的源代码。应该确保源代码是可读的、易于理解的，并且不包含任何可疑的代码。
3. 使用最新版本的包：使用最新版本的包可以确保包中存在的已知漏洞和安全问题得到修复。
4. 定期更新包：应该定期更新已安装的包，以确保包中存在的已知漏洞和安全问题得到修复。
5. 使用虚拟环境：使用虚拟环境可以帮助隔离不同项目之间的依赖关系，并且可以在不影响系统 Python 环境的情况下进行包安装和管理。
6. 使用包管理工具：使用包管理工具（如 Pipenv、Anaconda、Conda 等）可以更好地管理包的版本和依赖关系，并且可以提供更好的安全性保障。

### 如何检查包的源代码？

检查包的源代码可以帮助确保安装的包的安全性。以下是一些检查包源代码的方法：

1、查看包的官方网站：可以查看包的官方网站，了解包的说明、文档和源代码等信息。

2、查看包的版本控制库：可以查看包的版本控制库，例如 GitHub、GitLab 等，了解包的源代码。

3、通过 pip 源代码查看器查看源代码：pip 源代码查看器可以帮助查看已经安装的包的源代码。可以使用以下命令安装 pip 源代码查看器：

```bash
pip install pipdeptree
```

安装完成后，可以使用以下命令查看已安装的所有包的依赖关系：

```bash
pipdeptree
```

可以使用以下命令查看指定包的依赖关系和源代码：

```bash
pipdeptree -p packagename
```

其中 packagename 是要查看的包的名称。

4、手动查看源代码：可以手动下载包的源代码，然后查看代码是否可读、易于理解，并且不包含任何可疑的代码。