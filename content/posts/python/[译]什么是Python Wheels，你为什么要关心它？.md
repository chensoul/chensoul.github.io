---
title: "[译]什么是 Python Wheels，你为什么要关心它？"
date: 2023-06-01T09:00:00+08:00
slug: python-wheels
draft: false
categories: ["Python"]
tags: ["python"]
---

![What Are Python Wheels and Why Should You Care?](https://files.realpython.com/media/What-are-Python-Wheels-and-Why-Should-You-Care_Watermarked.22246cad13be.jpg)

Python `.whl` 文件或 [wheels](https://packaging.python.org/glossary/#term-wheel) 是 Python 中很少被讨论的部分，但它们对 [Python 包](https://realpython.com/python-modules-packages/)的安装过程大有裨益。如果您使用 [pip](https://realpython.com/what-is-pip/) 安装了 Python 包，那么 Wheels 很可能使安装更快、更高效。

Wheels 是 Python 生态系统的一个组件，有助于使包安装正常工作。它们允许更快的安装和更稳定的包分发过程。在本教程中，您将深入了解 Wheels 是什么，它们有什么好处，以及它们如何获得牵引力并使 Python 使用起来更加愉快。

**在本教程中，您将学习：**

- 什么是 Wheels 以及它们与源代码分发的比较
- 如何使用 Wheels 来控制包安装过程
- 如何为您自己的 Python 包创建和分发 Wheels

您将从用户和开发人员的角度看到使用流行的开源 Python 包的示例。

> 免费赠品：单击[此处](https://realpython.com/python-wheels/)获取 Python 备忘单并学习 Python 3 的基础知识，例如使用数据类型、字典、列表和 Python 函数。

## 安装

接下来，激活虚拟环境并确保安装了最新版本的 `pip` 、 `wheel` 和 `setuptools` ：

```bash
$ python -m venv env && source ./env/bin/activate
$ python -m pip install -U pip wheel setuptools
Successfully installed pip 20.1 setuptools-46.1.3 wheel-0.34.2
```

这就是您尝试安装和构建 Wheels 所需的全部内容！

## Python 打包变得更好：Python Wheels 简介

在学习如何将项目打包到 wheel 之前，从用户的角度了解使用 wheel 的样子会很有帮助。这听起来可能有点落后，但了解 Wheels 如何工作的一个好方法是从安装一个不是 Wheels 的东西开始。

您可以像往常一样，通过将 Python 包安装到您的环境中来开始这个实验。在这种情况下，安装 [uWSGI](https://github.com/unbit/uwsgi) 版本 2.0.x：

```bash
$ python -m pip install 'uwsgi==2.0.*'
Collecting uwsgi==2.0.*
  Downloading uwsgi-2.0.18.tar.gz (801 kB)
     |████████████████████████████████| 801 kB 1.1 MB/s
Building wheels for collected packages: uwsgi
  Building wheel for uwsgi (setup.py) ... done
  Created wheel for uwsgi ... uWSGI-2.0.18-cp38-cp38-macosx_10_15_x86_64.whl
  Stored in directory: /private/var/folders/jc/8_hqsz0x1tdbp05 ...
Successfully built uwsgi
Installing collected packages: uwsgi
Successfully installed uwsgi-2.0.18
```

为了完全安装 uWSGI， `pip` 通过几个不同的步骤进行：

- 在第 3 行，它下载了一个名为 `uwsgi-2.0.18.tar.gz` 的 TAR 文件 (tarball)，该文件已使用 [gzip](https://www.gnu.org/software/gzip/manual/gzip.html) 压缩。

- 在第 6 行，它获取 tarball 并通过调用 `setup.py` 构建一个 `.whl` 文件。
- 在第 7 行，它将 wheel 标记为 `uWSGI-2.0.18-cp38-cp38-macosx_10_15_x86_64.whl` 。
- 在第 10 行，它在构建 wheel 后安装实际的包。

`pip` 检索到的 `tar.gz` tarball 是源代码分发版或 `sdist` ，而不是 wheel。在某些方面， `sdist` 与 wheel 相反。

> 注意：如果您看到 uWSGI 安装错误，您可能需要[安装 Python 开发头文件](https://uwsgi-docs.readthedocs.io/en/latest/Install.html#installing-from-source)。

[源代码分发](https://packaging.python.org/glossary/#term-source-distribution-or-sdist)包含源代码。这不仅包括 Python 代码，还包括与包捆绑在一起的任何扩展模块（通常是 C 或 C++）的源代码。对于源代码分发，扩展模块是在用户端而不是开发人员端编译的。

源分发版还包含一组元数据，位于名为 `<package-name>.egg-info` 的目录中。此元数据有助于构建和安装包，但用户实际上不需要对其执行任何操作。

从开发人员的角度来看，源代码分发是在您运行以下命令时创建的：

```bash
$ python setup.py sdist
```

现在尝试安装不同的包 [chardet](https://github.com/chardet/chardet/blob/master/docs/index.rst)：

```bash
$ python -m pip install 'chardet==3.*'
Collecting chardet
  Downloading chardet-3.0.4-py2.py3-none-any.whl (133 kB)
     |████████████████████████████████| 133 kB 1.5 MB/s
Installing collected packages: chardet
Successfully installed chardet-3.0.4
```

您可以看到与 uWSGI 安装明显不同的输出。

安装 chardet 会直接从 PyPI 下载一个 `.whl` 文件。 Wheels 名称 `chardet-3.0.4-py2.py3-none-any.whl` 遵循您稍后将看到的特定命名约定。从用户的角度来看，更重要的是当 `pip` 在 PyPI 上找到兼容的 wheel 时，没有构建阶段。

从开发人员的角度来看，wheel 是运行以下命令的结果：

```bash
$ python setup.py bdist_wheel
```

为什么 uWSGI 给你一个源代码分发而 chardet 提供一个 wheel？您可以通过查看 PyPI 上每个项目的页面并导航到下载文件区域来了解其原因。本节将向您展示 `pip` 在 PyPI 索引服务器上实际看到的内容：

- 出于与项目复杂性相关的原因，uWSGI 仅提供了一个[源代码分发](https://pypi.org/project/uWSGI/2.0.18/#files)（ `uwsgi-2.0.18.tar.gz` ）。

- chardet 提供了 [wheel 和源代码分发](https://pypi.org/project/chardet/3.0.4/#files)，但如果它与您的系统兼容， `pip` 会更喜欢 wheel。稍后您将看到如何确定兼容性。

用于 wheel 安装的兼容性检查的另一个示例是 `psycopg2` ，它为 Windows 提供了广泛的 wheels，但不为 Linux 或 macOS 客户端提供任何 wheels。这意味着 `pip install psycopg2` 可以根据您的特定设置获取 Wheels 或源代码分发。

为了避免这些类型的兼容性问题，一些包提供了多个 wheels，每个 wheels 都针对特定的 Python 实现和底层操作系统。

到目前为止，您已经看到了 wheel 和 `sdist` 之间的一些明显区别，但更重要的是这些差异对安装过程的影响。

### Wheels 让事情变得快速

在上面，您看到了获取预制 wheels 的安装与下载 `sdist` 的安装的比较。 Wheels 使 Python 包的端到端安装更快，原因有二：

- 在其他条件相同的情况下，wheels 的尺寸通常比源分发小，这意味着它们可以在网络中更快地移动。
- 直接从 wheels 安装避免了从源分发构建包的中间步骤。

几乎可以保证 chardet 安装只用了 uWSGI 所需时间的一小部分。然而，这可以说是一个不公平的苹果与橘子的比较，因为 chardet 是一个小得多且不那么复杂的包。

使用不同的命令，您可以创建更直接的比较，以证明 wheels 的差异有多大。

您可以通过传递 `--no-binary` 选项让 `pip` 忽略它对 wheels 的倾斜：

```bash
$ time python -m pip install \
      --no-cache-dir \
      --force-reinstall \
      --no-binary=:all: \
      cryptography
```

此命令计时 [cryptography](https://pypi.org/project/cryptography/) 包的安装，告诉 `pip` 使用源代码分发，即使有合适的 Wheels 可用。包含 `:all:` 会使规则适用于 `cryptography` 及其所有[依赖项](https://realpython.com/courses/managing-python-dependencies/)。

在我的机器上，这从开始到结束大约需要 32 秒。不仅安装需要很长时间，而且构建 `cryptography` 还需要您拥有 OpenSSL 开发标头并可供 Python 使用。

注意：对于 `--no-binary` ，您很可能会看到有关缺少 `cryptography` 安装所需的头文件的错误，这是使用源代码分发令人沮丧的部分原因。如果是这样， `cryptography` 文档的[安装部分](https://cryptography.io/en/latest/installation/#building-cryptography-on-linux)会就特定操作系统需要哪些库和头文件提供建议。

现在您可以重新安装 `cryptography` ，但这次要确保 `pip` 使用 PyPI 的 Wheels 。因为 `pip` 更喜欢 Wheels ，这类似于不带任何参数调用 `pip install` 。但在这种情况下，您可以通过要求带有 `--only-binary` 的 Wheels 来明确意图：

```bash
$ time python -m pip install \
      --no-cache-dir \
      --force-reinstall \
      --only-binary=cryptography \
      cryptography
```

此选项只需要四秒多一点，或者是仅使用 `cryptography` 及其依赖项的源代码分发时所用时间的八分之一。

### 什么是 Python Wheel？

Python `.whl` 文件本质上是一个 ZIP ( `.zip` ) 存档，带有特制的文件名，告诉安装者 Wheels 将支持哪些 Python 版本和平台。

Wheels 是一种[内置分发](https://packaging.python.org/glossary/#term-built-distribution)。在这种情况下，built 意味着 wheel 以可立即安装的格式出现，并允许您跳过源代码分发所需的构建阶段。

> 注意：值得一提的是，尽管使用了术语构建，但 Wheels 不包含 `.pyc` 文件或编译的 Python 字节码。

wheel 文件名被分成由连字符分隔的部分：

```bash
{dist}-{version}(-{build})?-{python}-{abi}-{platform}.whl
```

`{brackets}` 中的每个部分都是一个标签，或者是 wheel 名称的一个组成部分，它带有一些关于 wheel 包含的内容以及 wheel 将在何处工作或不工作的含义。

这是一个使用 `cryptography` Wheels 的说明性示例：

```bash
cryptography-2.9.2-cp35-abi3-macosx_10_9_x86_64.whl
```

`cryptography` 分配多个 Wheels 。每个 Wheels 都是一个平台 Wheels ，这意味着它仅支持 Python 版本、Python ABI、操作系统和机器架构的特定组合。您可以将命名约定分解为多个部分：

- `cryptography` 是包名。
- `2.9.2` 是 `cryptography` 的包版本。版本是符合 PEP 440 的字符串，例如 `2.9.2` 、 `3.4` 或 `3.9.0.a3` 。
- `cp35` 是 [Python 标签](https://www.python.org/dev/peps/pep-0425/#python-tag)，表示 Wheels 需要的 Python 实现和版本。 `cp` 代表 [CPython](https://realpython.com/cpython-source-code-guide/)，Python 的参考实现，而 `35` 代表 Python [3.5](https://docs.python.org/3/whatsnew/3.5.html)。例如，这个 Wheels 与 [Jython](https://www.jython.org/) 不兼容。
- `abi3` 是 ABI 标签。 ABI 代表[应用程序二进制接口](https://docs.python.org/3/c-api/stable.html)。你真的不需要担心它需要什么，但是 `abi3` 是一个单独的版本，用于 Python C API 的二进制兼容性。
- `macosx_10_9_x86_64` 是平台标签，正好比较啰嗦。在这种情况下，它可以进一步细分为子部分：
  - `macosx` 是 macOS 操作系统。
  - `10_9` 是用于编译 Python 的 macOS 开发人员工具 SDK 版本，而 Python 又构建了这个 Wheels 。
  - `x86_64` 是对 x86-64 指令集架构的引用。

最后一个组件在技术上不是标签，而是标准的 `.whl` 文件扩展名。组合起来，上述组件表明此 `cryptography` Wheels 设计的目标机器。

现在让我们转向另一个例子。以下是您在上述 chardet 案例中看到的内容：

```bash
chardet-3.0.4-py2.py3-none-any.whl
```

您可以将其分解为标签：

- `chardet` 是包名。
- `3.0.4` 是 chardet 的包版本。
- `py2.py3` 是 Python 标签，这意味着 Wheels 支持 Python 2 和 3 以及任何 Python 实现。
- `none` 是 ABI 标签，意味着 ABI 不是一个因素。
- `any` 是平台。这个 Wheels 几乎可以在任何平台上运行。

Wheels 名称的 `py2.py3-none-any.whl` 段很常见。这是一个万能 Wheels ，可以在具有任何 [ABI](https://stackoverflow.com/a/2456882/7954504) 的任何平台上与 Python 2 或 3 一起安装。如果 Wheels 以 `none-any.whl` 结尾，那么它很可能是一个不关心特定 Python ABI 或 CPU 架构的纯 Python 包。

另一个例子是 `jinja2` 模板引擎。如果您导航到 Jinja 3.x alpha 版本的[下载页面](https://pypi.org/project/Jinja2/3.0.0a1/#files)，您将看到以下 Wheels ：

```bash
Jinja2-3.0.0a1-py3-none-any.whl
```

注意这里缺少 `py2` 。这是一个纯 Python 项目，可以在任何 Python 3.x 版本上运行，但它不是万能 Wheels ，因为它不支持 Python 2。相反，它被称为纯 Python Wheels 。

> 注意：在 2020 年，许多项目也放弃了对 Python 2 的支持，Python 2 于 2020 年 1 月 1 日达到生命周期结束 (EOL)。Jinja 版本 3.x 于 2020 年 2 月放弃了对 Python 2 的支持。

以下是为一些流行的开源包分发的 `.whl` 名称的更多示例：

| Wheel                                          | What It Is 这是什么                                                                                                                |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `PyYAML-5.3.1-cp38-cp38-win_amd64.whl`         | [PyYAML](https://pypi.org/project/PyYAML/5.3.1/#files) for CPython 3.8 on Windows with AMD64 (x86-64) architecture                 |
| `numpy-1.18.4-cp38-cp38-win32.whl`             | [NumPy](https://pypi.org/project/numpy/1.18.4/#files) for CPython 3.8 on Windows 32-bit                                            |
| `scipy-1.4.1-cp36-cp36m-macosx_10_6_intel.whl` | [SciPy](https://pypi.org/project/scipy/1.4.1/#files) for CPython 3.6 on macOS 10.6 SDK with fat binary (multiple instruction sets) |

现在您已经彻底了解什么是 Wheels ，是时候谈谈它们有什么好处了。

### Wheels 的优势

这是来自 [Python Packaging Authority](https://www.pypa.io/en/latest/) (PyPA) 的 wheels 证明：

> 并非所有开发人员都有正确的工具或经验来构建这些用这些编译语言编写的组件，因此 Python 创造了 wheel，这是一种旨在运送带有编译工件的库的包格式。事实上，Python 的包安装程序 `pip` 总是更喜欢 wheel，因为安装总是更快，所以即使是纯 Python 包也能更好地使用 wheel。 （ [来源](https://packaging.python.org/overview/#python-binary-distributions)）

更完整的描述是，wheels 在以下几个方面使 [Python 包的用户和维护者](https://pythonwheels.com/#advantages)都受益：

- 对于纯 Python 包和[扩展模块](https://realpython.com/build-python-c-extension-module/)，Wheels 的安装速度比源代码分发快。
- Wheels 比源分布小。例如， [six](https://pypi.org/project/six/#files) Wheels 大约是相应源分布[大小的三分之一](https://pypi.org/project/six/#files)。当您考虑到单个包的 `pip install` 实际上可能会开始下载依赖项链时，这种差异变得更加重要。
- Wheels 将 `setup.py` 执行排除在外。从源分发版安装会运行该项目的 `setup.py` 中包含的任何内容。正如 [PEP 427](https://www.python.org/dev/peps/pep-0427/#rationale) 所指出的，这相当于任意代码执行。 Wheels 完全避免了这种情况。
- 编译器不需要安装包含已编译扩展模块的 Wheels 。扩展模块包含在针对特定平台和 Python 版本的 wheel 中。
- `pip` 自动在 wheel 中生成与正确的 Python 解释器匹配的 `.pyc` 文件。
- Wheels 通过减少安装软件包时涉及的许多变量来提供一致性。

您可以使用 PyPI 上项目的下载文件选项卡来查看可用的不同发行版。例如，[pandas](https://pypi.org/project/pandas/#files) 分发了各种各样的 Wheels 。

### 告诉 `pip` 要下载什么

可以对 `pip` 进行细粒度控制并告诉它首选或避免哪种格式。您可以使用 `--only-binary` 和 `--no-binary` 选项来执行此操作。您在前面有关安装 `cryptography` 包的部分中看到了它们的使用，但值得仔细研究一下它们的作用：

```bash
$ pushd "$(mktemp -d)"
$ python -m pip download --only-binary :all: --dest . --no-cache six
Collecting six
  Downloading six-1.14.0-py2.py3-none-any.whl (10 kB)
  Saved ./six-1.14.0-py2.py3-none-any.whl
Successfully downloaded six
```

在此示例中，您更改为一个临时目录以存储带有 `pushd "$(mktemp -d)"` 的下载。您使用 `pip download` 而不是 `pip install` 以便您可以检查生成的 Wheels ，但您可以将 `download` 替换为 `install` 同时保持相同的选项集。

您下载带有几个标志的 `six` 模块：

- `--only-binary :all:` 告诉 `pip` 限制自己使用 Wheels 并忽略源代码分发。如果没有这个选项， `pip` 只会更喜欢 Wheels ，但在某些情况下会退回到源代码分发。
- `--dest .` 告诉 `pip` 将 `six` 下载到当前目录。
- `--no-cache` 告诉 `pip` 不要查看其本地下载缓存。你使用这个选项只是为了说明从 PyPI 的实时下载，因为你可能在某处有一个 `six` 缓存。

我之前提到过，wheel 文件本质上是一个 `.zip` 存档。你可以从字面上理解这个陈述，并这样对待 Wheels 。例如，如果你想查看一个 Wheels 的内容，你可以使用 `unzip` ：

```bash
$ unzip -l six*.whl
Archive:  six-1.14.0-py2.py3-none-any.whl
  Length      Date    Time    Name
---------  ---------- -----   ----
    34074  01-15-2020 18:10   six.py
     1066  01-15-2020 18:10   six-1.14.0.dist-info/LICENSE
     1795  01-15-2020 18:10   six-1.14.0.dist-info/METADATA
      110  01-15-2020 18:10   six-1.14.0.dist-info/WHEEL
        4  01-15-2020 18:10   six-1.14.0.dist-info/top_level.txt
      435  01-15-2020 18:10   six-1.14.0.dist-info/RECORD
---------                     -------
    37484                     6 files
```

`six` 是一个特例：它实际上是一个单独的 Python 模块，而不是一个完整的包。 Wheel 文件也可以复杂得多，稍后您将看到。

与 `--only-binary` 相反，你可以使用 `--no-binary` 来做相反的事情：

```bash
$ python -m pip download --no-binary :all: --dest . --no-cache six
Collecting six
  Downloading six-1.14.0.tar.gz (33 kB)
  Saved ./six-1.14.0.tar.gz
Successfully downloaded six
$ popd
```

此示例中的唯一更改是切换到 `--no-binary :all:` 。这告诉 `pip` 忽略 Wheels ，即使它们可用，而是下载源分发。

`--no-binary` 什么时候有用？以下是几个案例：

- 对应的 Wheels 坏了。这是对 Wheels 的讽刺。它们旨在减少故障的发生，但在某些情况下， Wheels 可能会配置错误。在这种情况下，为自己下载和构建源代码分发可能是一个可行的选择。
- 您想要对项目应用一个小的更改或[补丁文件](https://en.wikipedia.org/wiki/Patch_%28Unix%29)，然后安装它。这是从[版本控制系统](https://realpython.com/python-git-github-intro/#version-control) URL 克隆项目的替代方法。

您还可以将上述标志与 `pip install` 一起使用。此外，与 `:all:` 不同， `--only-binary` 规则不仅适用于您正在安装的包，还适用于它的所有依赖项，您可以传递特定包的列表 `--only-binary` 和 `--no-binary` 来应用该规则规则到。

下面是几个安装 URL 库 [yarl](https://github.com/aio-libs/yarl/) 的例子。它包含 Cython 代码并依赖于 [multidict](https://github.com/aio-libs/multidict) ，其中包含纯 C 代码。有几个选项可以严格使用或严格忽略 `yarl` 及其依赖项的 Wheels ：

```bash
$ # Install `yarl` and use only wheels for yarl and all dependencies
$ python -m pip install --only-binary :all: yarl

$ # Install `yarl` and use wheels only for the `multidict` dependency
$ python -m pip install --only-binary multidict yarl

$ # Install `yarl` and don't use wheels for yarl or any dependencies
$ python -m pip install --no-binary :all: yarl

$ # Install `yarl` and don't use wheels for the `multidict` dependency
$ python -m pip install --no-binary multidict yarl
```

在本节中，您大致了解了如何微调 `pip install` 将使用的分发类型。虽然常规的 `pip install` 应该没有任何选项，但了解这些用于特殊情况的选项会很有帮助。

### Wheel manylinux 标签

Linux 有许多变体和风格，例如 Debian、CentOS、Fedora 和 Pacman。其中每一个都可能在共享库（例如 `libncurses` ）和核心 C 库（例如 `glibc` ）中使用细微的变化。

如果您正在编写 C/C++ 扩展，那么这可能会产生问题。用 C 编写并在 Ubuntu Linux 上编译的源文件不能保证在 CentOS 机器或 Arch Linux 发行版上可执行。

您是否需要为每个 Linux 变体构建一个单独的 Wheels ？

幸运的是，答案是否定的，这要归功于一组专门设计的标签，称为 `manylinux` 平台标签系列。目前有以下三种变体：

1. `manylinux1` 是 [PEP 513](https://www.python.org/dev/peps/pep-0513/) 中指定的原始格式。
2. `manylinux2010` 是 [PEP 571](https://www.python.org/dev/peps/pep-0571/) 中指定的更新，它升级到 CentOS 6 作为 Docker 镜像所基于的底层操作系统。理由是 CentOS 5.11，即 `manylinux1` 中允许的库列表的来源，于 2017 年 3 月达到 EOL 并停止接收安全补丁和错误修复。
3. `manylinux2014` 是 [PEP 599](https://www.python.org/dev/peps/pep-0599/) 中指定的升级到 CentOS 7 的更新，因为 CentOS 6 计划于 2020 年 11 月达到 EOL。

您可以在 pandas 项目中找到 `manylinux` 分布的示例。以下是 PyPI 的可用 pandas 下载列表中的两个（最多的）：

```bash
pandas-1.0.3-cp37-cp37m-manylinux1_x86_64.whl
pandas-1.0.3-cp37-cp37m-manylinux1_i686.whl
```

在这种情况下，pandas 为支持 x86-64 和 [i686](<https://en.wikipedia.org/wiki/P6_(microarchitecture)>) 架构的 CPython 3.7 构建了 `manylinux1` wheels。

`manylinux` 的核心是基于特定版本的 CentOS 操作系统构建的 Docker 镜像。它捆绑了一个编译器套件、多个版本的 Python 和 `pip` ，以及一组允许的共享库。

> 注意：术语 allowed 表示[默认情况下假定存在](https://www.python.org/dev/peps/pep-0513/#rationale)于几乎所有 Linux 系统上的低级库。这个想法是，依赖项应该存在于基本操作系统上，而不需要额外安装。

截至 2020 年年中， `manylinux1` 仍然是主要的 `manylinux` 标签。原因之一可能只是习惯。另一个可能是客户端（用户）端对 `manylinux2010` 及更高版本的支持仅限于更新版本的 `pip` ：

| Tag             | Requirement            |
| --------------- | ---------------------- |
| `manylinux1`    | `pip` 8.1.0 或更高版本 |
| `manylinux2010` | `pip` 19.0 或更高版本  |
| `manylinux2014` | `pip` 19.3 或更高版本  |

换句话说，如果您是构建 `manylinux2010` wheels 的包开发人员，那么使用您的包的人将需要 `pip` 19.0（2019 年 1 月发布）或更高版本才能让 `pip` 从 PyPI 找到并安装 `manylinux2010` wheels .

幸运的是，虚拟环境变得越来越普遍，这意味着开发人员可以在不接触系统 `pip` 的情况下更新虚拟环境的 `pip` 。然而，情况并非总是如此，一些 Linux 发行版仍然附带 `pip` 的过时版本。

这就是说，如果您要在 Linux 主机上安装 Python 包，那么如果包维护者不遗余力地创建 `manylinux` Wheels ，您就认为自己很幸运。这几乎可以保证无论您的特定 Linux 变体或版本如何，都可以轻松安装软件包。

> 警告：请注意 [PyPI wheels 不能在 Alpine Linux](https://pythonspeed.com/articles/alpine-docker-python/)（或 [BusyBox](https://hub.docker.com/_/busybox/)）上运行。这是因为 Alpine 使用 [musl](https://wiki.musl-libc.org/) 代替标准的 [glibc](https://www.gnu.org/software/libc/libc.html) 。 `musl libc` 库自称是“一个新的 `libc` ，力求快速、简单、轻量级、免费和正确”。不幸的是，说到 Wheels ， `glibc` 不是。

### 平台 Wheels 的安全注意事项

从用户安全的角度来看，wheels 的一个值得考虑的特性是 wheels [可能会受到版本腐烂](https://github.com/asottile/no-manylinux#what-why)的影响，因为它们捆绑了二进制依赖项，而不是允许系统包管理器更新该依赖项。

例如，如果一个 wheel 合并了 `libfortran` 共享库，那么即使您使用包管理器（如 @ 3#、 `yum` 或 `brew` 。

如果您在安全防范措施得到加强的环境中进行开发，则需要注意某些平台 Wheels 的这一特性。

## 召集所有开发人员：构建您的 Wheels

本教程的标题是“你为什么要关心？”作为一名开发人员，如果您打算向社区分发 Python 包，那么您应该非常关心为您的项目分发 Wheels ，因为它们使最终用户的安装过程更简洁、更简单。

您可以使用兼容的 Wheels 支持的目标平台越多，您看到的标题为“安装在 XYZ 平台上损坏”之类的 GitHub 问题就越少。为您的 Python 包分发 wheel 客观上降低了包的用户在安装过程中遇到问题的可能性。

要在本地构建 Wheels ，您需要做的第一件事是安装 `wheel` 。确保 `setuptools` 也是最新的也没什么坏处：

```bash
$ python -m pip install -U wheel setuptools
```

接下来的几节将引导您完成为各种不同场景构建 Wheels 的过程。

### 不同类型的 Wheels

正如本教程中提到的， Wheels 有几种不同的变体， Wheels 的类型反映在它的文件名中：

- 万向 Wheels 包含 `py2.py3-none-any.whl` 。它在任何操作系统和平台上都支持 Python 2 和 Python 3。 Python Wheels 网站上列出的大多数 Wheels 都是通用 Wheels 。
- 纯 Python Wheels 包含 `py3-none-any.whl` 或 `py2.none-any.whl` 。它支持 Python 3 或 Python 2，但不支持两者。它在其他方面与万向 Wheels 相同，但它会标有 `py2` 或 `py3` 而不是 `py2.py3` 标签。
- 平台 Wheels 支持特定的 Python 版本和平台。它包含指示特定 Python 版本、ABI、操作系统或体系结构的段。

wheel 类型之间的差异取决于它们支持的 Python 版本以及它们是否针对特定平台。以下是 Wheels 变体之间差异的简要总结：

| Wheel Type  | 支持 Python 2 和 3 | 支持每个 ABI、操作系统和平台 |
| ----------- | ------------------ | ---------------------------- |
| Universal   | ✓                  | ✓                            |
| Pure-Python |                    | ✓                            |
| Platform    |                    |                              |

正如您接下来将看到的，您可以通过相对较少的设置构建通用 Wheels 和纯 Python Wheels ，但平台 Wheels 可能需要一些额外的步骤。

### 构建一个纯 Python Wheels

您可以使用 `setuptools` 为任何项目构建纯 Python Wheels 或通用 Wheels ，只需一个命令：

```bash
$ python setup.py sdist bdist_wheel
```

这将创建一个源代码分发 ( `sdist` ) 和一个 Wheels ( `bdist_wheel` )。默认情况下，两者都会放在当前目录下的 `dist/` 中。要亲眼看看，您可以为 [HTTPie](https://github.com/jakubroztocil/httpie) 构建一个 Wheels ，一个用 Python 编写的命令行 HTTP 客户端，以及一个 `sdist` 。

下面是为 HTTPie 包构建两种类型的发行版的结果：

```bash
$ git clone -q git@github.com:jakubroztocil/httpie.git
$ cd httpie
$ python setup.py -q sdist bdist_wheel
$ ls -1 dist/
httpie-2.2.0.dev0-py3-none-any.whl
httpie-2.2.0.dev0.tar.gz
```

仅此而已。您克隆该项目，移至其根目录，然后调用 `python setup.py sdist bdist_wheel` 。您可以看到 `dist/` 包含一个 Wheels 和一个源代码分发。

默认情况下，生成的分布放在 `dist/` 中，但您可以使用 `-d` / `--dist-dir` 选项更改它。您可以将它们放在一个临时目录中，而不是用于构建隔离：

```bash
$ tempdir="$(mktemp -d)"  # Create a temporary directory
$ file "$tempdir"
/var/folders/jc/8_kd8uusys7ak09_lpmn30rw0000gk/T/tmp.GIXy7XKV: directory

$ python setup.py sdist -d "$tempdir"
$ python setup.py bdist_wheel --dist-dir "$tempdir"
$ ls -1 "$tempdir"
httpie-2.2.0.dev0-py3-none-any.whl
httpie-2.2.0.dev0.tar.gz
```

您可以将 `sdist` 和 `bdist_wheel` 步骤合二为一，因为 `setup.py` 可以采用多个子命令：

```bash
$ python setup.py sdist -d "$tempdir" bdist_wheel -d "$tempdir"
```

如此处所示，您需要将 `-d` 等选项传递给每个子命令。

### 指定通用 Wheel

通用 Wheels 是用于同时支持 Python 2 和 3 的纯 Python 项目的 Wheels 。有多种方法可以告诉 `setuptools` 和 `distutils` Wheels 应该是通用的。

选项 1 是在项目的 [setup.cfg](https://docs.python.org/3/distutils/configfile.html) 文件中指定选项：

```toml
[bdist_wheel]
universal = 1
```

选项 2 是在命令行传递恰当命名的 `--universal` 标志：

```bash
$ python setup.py bdist_wheel --universal
```

选项 3 是使用其 `options` 参数告诉 `setup()` 本身有关该标志的信息：

```python
# setup.py
from setuptools import setup

setup(
    # ....
    options={"bdist_wheel": {"universal": True}}
    # ....
)
```

虽然这三个选项中的任何一个都应该有效，但前两个选项最常用。您可以在 [chardet 设置配置](https://github.com/chardet/chardet/blob/master/setup.cfg)中看到这样的示例。之后，您可以使用 `bdist_wheel` 命令，如前所示：

```bash
$ python setup.py sdist bdist_wheel
```

无论您选择哪个选项，生成的 Wheels 都是等效的。选择在很大程度上取决于开发人员的偏好以及最适合您的工作流程。

### 构建平台 Wheels （macOS 和 Windows）

二进制发行版是包含已编译扩展的构建发行版的子集。扩展是非 Python 依赖项或 Python 包的组件。

通常，这意味着您的包包含扩展模块或依赖于用静态类型语言（例如 C、C++、Fortran，甚至 Rust 或 Go）编写的库。平台 Wheels 的存在主要是因为它们包含或依赖于扩展模块。

综上所述，是时候构建平台 Wheels 了！

根据您现有的开发环境，您可能需要完成一个或两个额外的先决条件步骤来构建平台 Wheels 。下面的步骤将帮助您设置构建 C 和 C++ 扩展模块，这是迄今为止最常见的类型。

在 macOS 上，您需要通过 [xcode](https://www.unix.com/man-page/OSX/1/xcode-select/) 获得的命令行开发人员工具：

```bash
$ xcode-select --install
```

在 Windows 上，您需要安装 [Microsoft Visual C++](https://docs.microsoft.com/en-us/cpp/?view=vs-2019)：

- 在浏览器中打开 Visual Studio 下载页面。
- 选择 Visual Studio 工具 → Visual Studio 构建工具 → 下载。
- 运行生成的 `.exe` 安装程序。
- 在安装程序中，选择 C++ Build Tools → Install。
- 重新启动机器。

在 Linux 上，您需要一个编译器，例如 `gcc` 或 `g++` / `c++` 。

有了这些，您就可以为 UltraJSON ( `ujson` ) 构建一个平台 Wheels ，UltraJSON 是一个用纯 C 语言编写并带有 Python 3 绑定的 [JSON](https://realpython.com/python-json/) 编码器和解码器。使用 `ujson` 是一个很好的玩具示例，因为它涵盖了几个基础：

- 它包含一个扩展模块， [ujson](https://github.com/ultrajson/ultrajson/blob/master/python/ujson.c) 。
- 它依赖于 Python 开发标头进行编译 ( `#include <Python.h>` )，但并不过分复杂。 `ujson` 旨在做一件事并且做好，就是读写 JSON！

您可以从 GitHub 克隆该项目，导航到其目录并构建它：

```bash
$ git clone -q --branch 2.0.3 git@github.com:ultrajson/ultrajson.git
$ cd ultrajson
$ python setup.py bdist_wheel
```

您应该会看到大量输出。这是 macOS 上的精简版，其中使用了 Clang 编译器驱动程序：

```bash
clang -Wno-unused-result -Wsign-compare -Wunreachable-code -DNDEBUG -g ...
...
creating 'dist/ujson-2.0.3-cp38-cp38-macosx_10_15_x86_64.whl'
adding 'ujson.cpython-38-darwin.so'
```

以 `clang` 开头的行显示了对编译器的实际调用，其中包含大量编译标志。您可能还会看到诸如 `MSVC` (Windows) 或 `gcc` (Linux) 之类的工具，具体取决于操作系统。

如果在执行上述代码后遇到 `fatal error` ，请不要担心。您可以展开下面的框以了解如何处理此问题。

> `setup.py bdist_wheel` 对 `ujson` 的调用需要 Python 开发头文件，因为 `ujson.c` 引入了 `<Python.h>` 。如果您没有将它们放在可搜索的位置，那么您可能会看到如下错误：
>
> ```bash
> fatal error: 'Python.h' file not found
> #include <Python.h>
> ```
>
> 要编译扩展模块，您需要将开发标头保存在编译器可以找到的地方。
>
> 如果您使用的是最新版本的 Python 3 和虚拟环境工具（如 `venv` ），则 Python 开发标头可能会默认包含在编译和链接中。
>
> 如果没有，那么您可能会看到一个错误，表明找不到头文件：
>
> ```bash
> fatal error: 'Python.h' file not found
> #include <Python.h>
> ```
>
> 在这种情况下，您可以通过设置 `CFLAGS` 来告诉 `setup.py` 还可以在哪里查找头文件。要查找头文件本身，可以使用 `python3-config` ：
>
> ```bash
> $ python3-config --include
> -I/Users/<username>/.pyenv/versions/3.8.2/include/python3.8
> ```
>
> 这告诉您 Python 开发标头位于显示的目录中，您现在可以将其与 `python setup.py bdist_wheel` 一起使用：
>
> ```bash
> $ CFLAGS="$(python3-config --include)" python setup.py bdist_wheel
> ```
>
> 更一般地说，您可以传递您需要的任何路径：
>
> ```bash
> $ CFLAGS='-I/path/to/include' python setup.py bdist_wheel
> ```
>
> 在 Linux 上，您可能还需要单独安装头文件：
>
> ```bash
> $ apt-get install -y python3-dev  # Debian, Ubuntu
> $ yum install -y python3-devel  # CentOS, Fedora, RHEL
> ```

如果你检查 UltraJSON 的 [setup.py](https://github.com/ultrajson/ultrajson/blob/master/setup.py) ，你会看到它自定义了一些编译器标志，例如 `-D_GNU_SOURCE` 。通过 `setup.py` 控制编译过程的复杂性超出了本教程的范围，但您应该知道可以[对编译和链接的发生方式进行细粒度控制](https://pythonextensionpatterns.readthedocs.io/en/latest/compiler_flags.html#setting-flags-automatically-in-setup-py)。

如果您查看 `dist` ，那么您应该会看到创建的 Wheels ：

```bash
$ ls dist/
ujson-2.0.3-cp38-cp38-macosx_10_15_x86_64.whl
```

请注意，名称可能因您的平台而异。例如，您会在 64 位 Windows 上看到 `win_amd64.whl` 。

您可以查看 wheel 文件并看到它包含已编译的扩展名：

```bash
$ unzip -l dist/ujson-*.whl
...
  Length      Date    Time    Name
---------  ---------- -----   ----
   105812  05-10-2020 19:47   ujson.cpython-38-darwin.so
   ...
```

此示例显示 macOS 的输出， `ujson.cpython-38-darwin.so` ，这是一个共享对象 ( `.so` ) 文件，也称为动态库。

### 构建 `manylinux` Wheels

作为软件包开发人员，您很少会希望为单个 Linux 变体构建 Wheels 。 Linux wheels 需要一套专门的约定和工具，以便它们可以跨不同的 Linux 环境工作。

与 macOS 和 Windows 的 wheel 不同，构建在一个 Linux 变体上的 wheel 不能保证在另一个 Linux 变体上工作，即使是具有相同机器架构的 Linux 变体。

事实上，如果您在开箱即用的 Linux 容器上构建一个 Wheels ，那么如果您尝试上传它，PyPI 甚至不会接受该 Wheels ！

如果您希望您的包在一系列 Linux 客户端上可用，那么您需要一个 `manylinux` Wheels 。 `manylinux` wheel 是一种特殊类型的平台 wheel，被大多数 Linux 变体接受。它必须在特定环境中构建，并且需要一个名为 `auditwheel` 的工具来重命名 wheel 文件以表明它是一个 `manylinux` wheel。

> 注意：即使您是从开发人员而不是用户的角度来学习本教程，请确保您在继续本节之前已阅读有关 `manylinux` wheel 标签的部分。

构建一个 `manylinux` Wheels 可以让你瞄准更广泛的用户平台。 PEP 513 指定了一个特定的（和古老的）CentOS 版本，其中包含一系列可用的 Python 版本。 CentOS 和 Ubuntu 或任何其他发行版之间的选择没有任何特殊区别。

重点是构建环境由一个普通的 Linux 操作系统和一组有限的外部共享库组成，这些共享库对于不同的 Linux 变体是通用的。

值得庆幸的是，您不必自己执行此操作。 PyPA 提供了一组 [Docker 镜像](https://github.com/pypa/manylinux)，只需单击几下鼠标即可为您提供此环境：

- 选项 1 是从您的开发机器运行 `docker` 并使用 Docker 卷挂载您的项目，以便它可以在容器文件系统中访问。
- 选项 2 是使用 CI/CD 解决方案，例如 CircleCI、GitHub Actions、Azure DevOps 或 Travis-CI，这将拉取您的项目并在推送或标记等操作上运行构建。

为不同的 `manylinux` 风格提供了 Docker 镜像：

| `manylinux` Tag | Architecture | Docker Image                                                                     |
| --------------- | ------------ | -------------------------------------------------------------------------------- |
| `manylinux1`    | x86-64       | [quay.io/pypa/manylinux1_x86_64](https://quay.io/pypa/manylinux1_x86_64)         |
| `manylinux1`    | i686         | [quay.io/pypa/manylinux1_i686](https://quay.io/pypa/manylinux1_i686)             |
| `manylinux2010` | x86-64       | [quay.io/pypa/manylinux2010_x86_64](https://quay.io/pypa/manylinux2010_x86_64)   |
| `manylinux2010` | i686         | [quay.io/pypa/manylinux2010_i686](https://quay.io/pypa/manylinux2010_i686)       |
| `manylinux2014` | x86-64       | [quay.io/pypa/manylinux2014_x86_64](https://quay.io/pypa/manylinux2014_x86_64)   |
| `manylinux2014` | i686         | [quay.io/pypa/manylinux2014_i686](https://quay.io/pypa/manylinux2014_i686)       |
| `manylinux2014` | aarch64      | [quay.io/pypa/manylinux2014_aarch64](https://quay.io/pypa/manylinux2014_aarch64) |
| `manylinux2014` | ppc64le      | [quay.io/pypa/manylinux2014_ppc64le](https://quay.io/pypa/manylinux2014_ppc64le) |
| `manylinux2014` | s390x        | [quay.io/pypa/manylinux2014_s390x](https://quay.io/pypa/manylinux2014_s390x)     |

首先，PyPA 还提供了一个示例存储库 [python-manylinux-demo](https://github.com/pypa/python-manylinux-demo)，这是一个用于与 Travis-CI 一起构建 `manylinux` wheels 的演示项目。

虽然构建 wheels 作为远程托管 CI 解决方案的一部分很常见，但您也可以在本地构建 `manylinux` wheels。为此，您需要安装 Docker。 Docker Desktop 适用于 macOS、Windows 和 Linux。

首先，克隆演示项目：

```bash
$ git clone -q git@github.com:pypa/python-manylinux-demo.git
$ cd python-manylinux-demo
```

接下来，分别为 `manylinux1` Docker 镜像和平台定义几个 shell 变量：

```bash
$ DOCKER_IMAGE='quay.io/pypa/manylinux1_x86_64'
$ PLAT='manylinux1_x86_64'
```

`DOCKER_IMAGE` 变量是由 PyPA 维护的用于构建 `manylinux` Wheels 的图像，托管在 [Quay.io](https://quay.io/)。平台 ( `PLAT` ) 是提供给 `auditwheel` 的必要信息，让它知道要应用哪个平台标签。

现在您可以拉取 Docker 镜像并在容器中运行 wheel-builder 脚本：

```bash
$ docker pull "$DOCKER_IMAGE"
$ docker container run -t --rm \
      -e PLAT=$PLAT \
      -v "$(pwd)":/io \
      "$DOCKER_IMAGE" /io/travis/build-wheels.sh
```

这告诉 Docker 在 `manylinux1_x86_64` Docker 容器内运行 `build-wheels.sh` shell 脚本，将 `PLAT` 作为容器中可用的环境变量传递。由于您使用 `-v` （或 `--volume` ）绑定挂载卷，因此容器中生成的 Wheels 现在可以在主机上的 `wheelhouse` 目录中访问：

```bash
$ ls -1 wheelhouse
python_manylinux_demo-1.0-cp27-cp27m-manylinux1_x86_64.whl
python_manylinux_demo-1.0-cp27-cp27mu-manylinux1_x86_64.whl
python_manylinux_demo-1.0-cp35-cp35m-manylinux1_x86_64.whl
python_manylinux_demo-1.0-cp36-cp36m-manylinux1_x86_64.whl
python_manylinux_demo-1.0-cp37-cp37m-manylinux1_x86_64.whl
python_manylinux_demo-1.0-cp38-cp38-manylinux1_x86_64.whl
```

在几个简短的命令中，您拥有一组适用于 CPython 2.7 到 3.8 的 `manylinux1` Wheels 。一种常见的做法是迭代不同的架构。例如，您可以对 `quay.io/pypa/manylinux1_i686` Docker 映像重复此过程。这将构建针对 32 位 (i686) 架构的 `manylinux1` Wheels 。

如果您想更深入地研究造 Wheels ，那么下一步就是向最好的人学习。从 Python Wheels 页面开始，选择一个项目，导航到它的源代码（在 GitHub、GitLab 或 Bitbucket 等地方），然后亲眼看看它是如何构建 Wheels 的。

Python Wheels 页面上的许多项目都是纯 Python 项目并分发通用 Wheels 。如果您正在寻找更复杂的案例，请留意使用扩展模块的包。这里有两个例子可以激发你的胃口：

- `lxml` 使用从 `manylinux1` Docker 容器中调用的单独构建脚本。
- `ultrajson` 做同样的事情并使用 GitHub Actions 调用构建脚本。

如果您有兴趣构建 `manylinux` Wheels ，这两个都是著名的项目，它们提供了很好的示例供您学习。

### 捆绑共享库

另一个挑战是为依赖于外部共享库的包构建 Wheels 。 `manylinux` 图像包含一组预筛选的库，例如 `libpthread.so.0` 和 `libc.so.6` 。但是，如果您依赖该列表之外的东西怎么办，例如 ATLAS 或 GFortran？

在这种情况下，有几种解决方案可以解决问题：

- `auditwheel` 会将外部库捆绑到一个已经构建好的 Wheels 中。
- `delocate` 在 macOS 上做同样的事情。

方便的是， `auditwheel` 出现在 `manylinux` Docker 镜像上。使用 `auditwheel` 和 `delocate` 只需一个命令。只需告诉他们有关 wheel 文件的信息，他们就会完成剩下的工作：

```bash
$ auditwheel repair <path-to-wheel.whl>  # For manylinux
$ delocate-wheel <path-to-wheel.whl>  # For macOS
```

这将通过项目的 `setup.py` 检测所需的外部库，并将它们捆绑到 wheel 中，就好像它们是项目的一部分一样。

利用 `auditwheel` 和 `delocate` 的项目示例是 `pycld3` ，它为 Compact Language Detector v3 (CLD3) 提供 Python 绑定。

`pycld3` 包依赖于 `libprotobuf` ，它不是一个通常安装的库。如果你查看 `pycld3` macOS Wheels 内部，你会看到 `libprotobuf.22.dylib` 包含在那里。这是一个捆绑到 Wheels 中的动态链接共享库：

```bash
$ unzip -l pycld3-0.20-cp38-cp38-macosx_10_15_x86_64.whl
...
       51  04-10-2020 11:46   cld3/__init__.py
   939984  04-10-2020 07:50   cld3/_cld3.cpython-38-darwin.so
  2375836  04-10-2020 07:50   cld3/.dylibs/libprotobuf.22.dylib
---------                     -------
  3339279                     8 files
```

Wheels 预包装有 `libprotobuf` 。 `.dylib` 类似于 Unix `.so` 文件或 Windows `.dll` 文件，但我承认我不知道除此之外的具体区别。

`auditwheel` 和 `delocate` 知道包含 `libprotobuf` 因为 `setup.py` 通过 `libraries` 参数告诉他们：

```python
setup(
    # ...
    libraries=["protobuf"],
    # ...
)
```

这意味着 `auditwheel` 和 `delocate` 为用户省去了安装 `protobuf` 的麻烦，只要他们从具有匹配 Wheels 的平台和 Python 组合进行安装即可。

如果您要分发的包具有这样的外部依赖项，那么您可以通过使用 `auditwheel` 或 `delocate` 来帮您的用户一个忙，让他们省去自己安装依赖项的额外步骤。

### 在持续集成中构建 Wheels

在本地机器上构建 Wheels 的替代方法是在项目的 [CI 管道](https://realpython.com/python-continuous-integration/)中自动构建它们。

有无数与主要代码托管服务集成的 CI 解决方案。其中包括 [Appveyor](https://www.appveyor.com/)、[Azure DevOps](https://azure.microsoft.com/en-us/services/devops/)、[BitBucket Pipelines](https://bitbucket.org/product/features/pipelines)、[Circle CI](https://circleci.com/)、[GitLab](https://about.gitlab.com/stages-devops-lifecycle/continuous-integration/)、[GitHub Actions](https://github.com/features/actions)、[Jenkins](https://www.jenkins.io/) 和 [Travis CI](https://travis-ci.org/)，仅举几例。

本教程的目的不是要判断哪种 CI 服务最适合构建 Wheels ，以及考虑到 CI 支持的发展速度，任何支持哪些容器的 CI 服务列表很快就会过时。

但是，本节可以帮助您入门。

如果你正在开发一个纯 Python 包， `bdist_wheel` 一步是一个幸福的单行：它在很大程度上与你在哪个容器操作系统和平台上构建 Wheels 无关。几乎所有主要的 CI 服务都应该使您能够通过在项目内的特殊 YAML 文件中定义步骤来以简洁的方式执行此操作。

例如，这是您可以用于 GitHub Actions 的语法：

```yaml
name: Python wheels
on:
  release:
    types:
      - created
jobs:
  wheels:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python 3.x
        uses: actions/setup-python@v2
        with:
          python-version: "3.x"
      - name: Install dependencies
        run: python -m pip install --upgrade setuptools wheel
      - name: Build wheels
        run: python setup.py bdist_wheel
      - uses: actions/upload-artifact@v2
        with:
          name: dist
          path: dist
```

在此配置文件中，您使用以下步骤构建一个 Wheels ：

- 在第 8 行，您指定该作业应在 Ubuntu 机器上运行。
- 在第 10 行中，您使用 `checkout` 操作来设置您的项目存储库。
- 在第 14 行，您告诉 CI 运行器使用最新稳定版本的 Python 3。
- 在第 21 行中，您请求将生成的 Wheels 作为工件提供，您可以在作业完成后从 UI 下载该工件。

但是，如果您有一个复杂的项目（可能是一个带有 C 扩展或 Cython 代码的项目）并且您正在努力构建一个 CI/CD 管道以自动构建 Wheels ，那么可能会涉及额外的步骤。以下是一些您可以通过示例学习的项目：

- [`yarl`](https://github.com/aio-libs/yarl)
- [`msgpack`](https://github.com/msgpack/msgpack-python)
- [`markupsafe`](https://github.com/pallets/markupsafe)
- [`cryptography`](https://github.com/pyca/cryptography)

许多项目推出了自己的 CI 配置。然而，一些解决方案已经出现，用于减少配置文件中指定的代码量来构建 Wheels 。您可以直接在 CI 服务器上使用 [cibuildwheel](https://github.com/joerick/cibuildwheel) 工具来减少构建多个平台 Wheels 所需的代码行和配置。还有 [multibuild](https://github.com/matthew-brett/multibuild)，它提供了一组 shell 脚本，用于协助在 Travis CI 和 AppVeyor 上构建 Wheels 。

### 确保你的 Wheels 旋转正确

构建结构正确的 Wheels 可能是一项精细的操作。例如，如果您的 Python 包使用 `src` 布局而您忘记在 `setup.py` 中正确指定它，那么生成的 Wheels 可能包含错误位置的目录。

您可以在 `bdist_wheel` 之后使用的一项检查是 `check-wheel-contents` 工具。它查找常见问题，例如包目录结构异常或存在重复文件：

```bash
$ check-wheel-contents dist/*.whl
dist/ujson-2.0.3-cp38-cp38-macosx_10_15_x86_64.whl: OK
```

在本例中， `check-wheel-contents` 表示带 `ujson` Wheels 的所有内容都已检出。如果不是， `stdout` 将显示可能问题的摘要，就像 `flake8` 之类的 linter。

另一种确认您构建的 Wheels 是否正确的方法是使用 TestPyPI。首先，您可以在那里上传包：

```bash
$ python -m twine upload \
      --repository-url https://test.pypi.org/legacy/ \
      dist/*
```

然后，您可以下载相同的包进行测试，就好像它是真实的一样：

```bash
$ python -m pip install \
      --index-url https://test.pypi.org/simple/ \
      <pkg-name>
```

这允许您通过上传然后下载您自己的项目来测试您的 Wheels 。

### 将 Python Wheels 上传到 PyPI

现在是时候上传你的 Python 包了。由于 `sdist` 和 wheel 默认情况下都放在 `dist/` 目录中，您可以使用 `twine` 工具上传它们，这是一个用于将包发布到 PyPI 的实用程序：

```bash
$ python -m pip install -U twine
$ python -m twine upload dist/*
```

由于默认情况下 `sdist` 和 `bdist_wheel` 都输出到 `dist/` ，您可以安全地告诉 `twine` 使用 shell 通配符( `dist/*` ) 上传 `dist/` 下的所有内容。

## 结论

了解 Wheels 在 Python 生态系统中扮演的关键角色可以让您作为 Python 包的用户和开发人员的生活更轻松。

此外，在 Wheels 方面提高你的 Python 素养将帮助你更好地理解安装包时发生了什么，以及在越来越罕见的情况下，该操作何时出错。

**在本教程中，您学习了：**

- 什么是 Wheels 以及它们与源代码分布的比较
- 如何使用 Wheels 来控制包安装过程
- 通用 Wheels 、纯 Python Wheels 和平台 Wheels 之间有什么区别
- 如何为您自己的 Python 包创建和分发 Wheels

您现在已经从用户和开发人员的角度对 Wheels 有了深入的了解。您完全有能力构建自己的 Wheels ，并使项目的安装过程快速、方便和稳定。

请参阅下面的部分以获取一些额外的阅读材料，以更深入地了解快速扩展的 wheel 生态系统。

## 资源

[Python Wheels](https://pythonwheels.com/)页面专门跟踪 PyPI 上下载次数最多的 360 个包中对 wheels 的支持。在编写本教程时，采用率非常可观，为 360 分之 331，即 91% 左右。

已经有许多 Python 增强提案 (PEP) 帮助了 wheel 格式的规范和发展：

- [PEP 425 - Compatibility Tags for Built Distributions](https://www.python.org/dev/peps/pep-0425/)
- [PEP 427 - The Wheel Binary Package Format 1.0](https://www.python.org/dev/peps/pep-0427/)
- [PEP 491 - The Wheel Binary Package Format 1.9](https://www.python.org/dev/peps/pep-0491/)
- [PEP 513 - A Platform Tag for Portable Linux Built Distributions](https://www.python.org/dev/peps/pep-0513/)
- [PEP 571 - The manylinux2010 Platform Tag](https://www.python.org/dev/peps/pep-0571/)
- [PEP 599 - The manylinux2014 Platform Tag](https://www.python.org/dev/peps/pep-0599/)

以下是本教程中提到的各种 wheel 打包工具的候选清单：

- [pypa/wheel](https://github.com/pypa/wheel)
- [pypa/auditwheel](https://github.com/pypa/auditwheel)
- [pypa/manylinux](https://github.com/pypa/manylinux)
- [pypa/python-manylinux-demo](https://github.com/pypa/python-manylinux-demo)
- [jwodder/check-wheel-contents](https://github.com/jwodder/check-wheel-contents)
- [matthew-brett/delocate](https://github.com/matthew-brett/delocate)
- [matthew-brett/multibuild](https://github.com/matthew-brett/multibuild)
- [joerick/cibuildwheel](https://github.com/joerick/cibuildwheel)

Python 文档有几篇文章涵盖了 Wheels 和源代码分发：

- [Generating Distribution Archives](https://packaging.python.org/tutorials/packaging-projects/#generating-distribution-archives)
- [Creating a Source Distribution](https://docs.python.org/3/distutils/sourcedist.html)

最后，这里有一些来自 PyPA 的更有用的链接：

- [Packaging your Project](https://packaging.python.org/guides/distributing-packages-using-setuptools/#packaging-your-project)
- [An Overview of Packaging for Python](https://packaging.python.org/overview/)

原文地址：[https://realpython.com/python-wheels/](https://realpython.com/python-wheels/)
