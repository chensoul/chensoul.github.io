---
title: "[译]使用 Python 的 pip 管理项目的依赖关系"
date: 2023-06-01
slug: what-is-pip
categories: ["Python"]
tags: ["python"]
---

![Using Python's pip to Manage Your Projects' Dependencies](https://files.realpython.com/media/What-is-PIP_Watermarked.4944e95d83ad.jpg)

[Python](https://www.python.org/) 的标准包管理器是 [pip](https://pip.pypa.io/en/stable/) 。它允许您安装和管理不属于 Python [标准库](https://docs.python.org/3/py-modindex.html)的包。如果您正在寻找 `pip` 的介绍，那么您来对地方了！

**在本教程中，您将学习如何：**

- 在您的工作环境中设置 `pip`
- 修复与使用 `pip` 相关的常见错误
- 使用 `pip` 安装和卸载包
- 使用需求文件管理项目的依赖关系

`pip` 可以做很多事情，但是 Python 社区非常活跃，已经创建了一些 `pip` 的巧妙替代品。您将在本教程的后面部分了解这些内容。

## 从 `pip` 开始

那么，`pip` 具体是做什么的呢？ [pip](https://pip.pypa.io/en/stable/) 是 Python 的包管理器。这意味着它是一个允许您安装和管理未作为标准库的一部分分发的库和依赖项的工具。 pip 这个名字是由 Ian Bicking 在 2008 年引入的：

> 我已经将 pyinstall 重命名为新名称：pip。pip 是 pip install package 首字母缩写。 （ [来源](https://www.ianbicking.org/blog/2008/10/pyinstall-is-dead-long-live-pip.html)）

包管理非常重要，Python 的安装程序从 3.4 版和 2.7.9 版开始分别为 Python 3 和 Python 2 包含了 `pip` 。许多 Python 项目都使用 `pip` ，这使它成为每个 Pythonista 的必备工具。

如果您来自另一种编程语言，您可能会熟悉包管理器的概念。 [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) 使用 [npm](https://www.npmjs.com/) 进行包管理，[Ruby](https://www.ruby-lang.org/en/) 使用 [gem](https://rubygems.org/)，[.NET 平台](https://dotnet.microsoft.com/languages)使用 [NuGet](https://www.nuget.org/)。在 Python 中， `pip` 已成为标准包管理器。

### 在您的系统上查找 pip

Python 3 安装程序为您提供了在系统上安装 Python 时安装 `pip` 的选项。事实上， `pip` 与 Python 一起安装的选项默认是勾选的，所以 `pip` 应该在安装完 Python 之后就可以使用了。

> 注意：在某些 Linux (Unix) 系统（如 Ubuntu）上， `pip` 位于一个名为 `python3-pip` 的单独包中，您需要使用 `sudo apt install python3-pip` 安装它。默认情况下，它不会随解释器一起安装。

您可以通过在您的系统上查找 `pip3` 可执行文件来验证 `pip` 是否可用。在下面选择您的操作系统并相应地使用您的平台特定命令：

Windows：

```bash
C:\> where pip3
```

Linux + macOS：

```bash
$ which pip3
```

Linux 系统和 macOS 上的 `which` 命令显示 `pip3` 二进制文件所在的位置。

在 Windows 和 Unix 系统上， `pip3` 可能位于多个位置。当您安装了多个 Python 版本时，可能会发生这种情况。如果您在系统的任何位置都找不到 `pip` ，那么您可以考虑重新安装 pip。

除了直接运行您的系统 `pip` ，您还可以将其作为 Python 模块运行。在下一节中，您将了解如何操作。

### 作为模块运行 pip

当您直接运行系统 `pip` 时，命令本身不会显示 `pip` 属于哪个 Python 版本。不幸的是，这意味着您可以在不注意的情况下使用 `pip` 将包安装到旧 Python 版本的站点包中。为防止这种情况发生，您可以将 `pip` 作为 Python 模块运行：

```bash
$ python3 -m pip
```

请注意，您使用 `python3 -m` 来运行 `pip` 。 `-m` 开关告诉 Python 将模块作为 `python3` 解释器的可执行文件运行。这样，您可以确保系统默认的 Python 3 版本运行 `pip` 命令。如果您想了解更多关于这种运行 `pip` 的方式，那么您可以阅读 Brett Cannon 关于[使用 python3 -m pip 的优势](https://snarky.ca/why-you-should-use-python-m-pip/)的有见地的文章。

有时您可能希望更加明确并将包限制到特定项目。在这种情况下，您应该在虚拟环境中运行 `pip` 。

### 在 Python 虚拟环境中使用 pip

为避免将包直接安装到系统 Python 安装中，您可以使用[虚拟环境](https://realpython.com/python-virtual-environments-a-primer/)。虚拟环境为您的项目提供独立的 Python 解释器。您在此环境中使用的任何包都将独立于您的系统解释器。

这意味着您可以将项目的依赖项与其他项目和整个系统分开。

在虚拟环境中使用 `pip` 具有三个主要优点。你可以：

- 确保您为手头的项目使用正确的 Python 版本
- 确保在运行 `pip` 或 `pip3` 时引用的是正确的 `pip` 实例
- 在不影响其他项目的情况下为您的项目使用特定的包版本

Python 3 具有用于创建虚拟环境的内置 `venv` 模块。此模块可帮助您使用独立的 Python 安装创建虚拟环境。一旦你激活了虚拟环境，你就可以将包安装到这个环境中。

您安装到一个虚拟环境中的软件包与系统上的所有其他环境隔离开来。

您可以按照以下步骤创建虚拟环境并验证您是否在新创建的环境中使用 `pip` 模块：

Windows：

```bash
C:\> python -m venv venv
C:\> venv\Scripts\activate.bat
(venv) C:\>  pip3 --version
pip 21.2.3 from ...\lib\site-packages\pip (python 3.10)
(venv) C:\>  pip --version
pip 21.2.3 from ...\lib\site-packages\pip (python 3.10)
```

Linux + macOS：

```bash
$ python3 -m venv venv
$ source venv/bin/activate
(venv) $ pip3 --version
pip 21.2.3 from .../python3.10/site-packages/pip (python 3.10)
(venv) $ pip --version
pip 21.2.3 from .../python3.10/site-packages/pip (python 3.10)
```

在这里，您使用 Python 的内置 `venv` 模块创建了一个名为 `venv` 的虚拟环境。然后使用 `source` 命令激活它。 `venv` 名称周围的括号 ( `()` ) 表示您已成功激活虚拟环境。

最后，您检查激活的虚拟环境中 `pip3` 和 `pip` 可执行文件的版本。两者都指向相同的 `pip` 模块，因此一旦您的虚拟环境被激活，您就可以使用 `pip` 或 `pip3` 。

### 出现错误时重新安装 pip

当您运行 `pip` 命令时，在某些情况下您可能会遇到错误。您的特定错误消息将取决于您的操作系统：

| Operating System | Error Message                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Windows          | `'pip' is not recognized as an internal or external command,` `operable program or batch file.` |
| Linux            | `bash: pip: command not found`                                                                  |
| macOS            | `zsh: command not found: pip`                                                                   |

> 注意：在 `pip` 命令不起作用时开始任何故障排除之前，您可以尝试使用最后带有 3 的 `pip3` 命令。

出现如上所示的错误可能会令人沮丧，因为 `pip` 对于安装和管理外部包至关重要。 `pip` 的一些常见问题与此工具在您的系统上的安装方式有关。

尽管各种系统的错误消息不同，但它们都指向同一个问题：您的系统无法在您的 `PATH` 变量中列出的位置找到 `pip` 。在 Windows 上， `PATH` 是系统变量的一部分。在 macOS 和 Linux 上， `PATH` 是环境变量的一部分。您可以使用以下命令检查 `PATH` 变量的内容：

Windows：

```bash
C:\> echo %PATH%
```

Linux + macOS：

```bash
$ echo $PATH
```

此命令的输出将显示磁盘上操作系统查找可执行程序的位置（目录）列表。根据您的系统，位置可以用冒号 ( `:` ) 或分号 ( `;` ) 分隔。

默认情况下，在安装 Python 或创建虚拟环境后，包含 `pip` 可执行文件的目录应该出现在 `PATH` 中。但是，缺少 `pip` 是一个常见问题。两种支持的方法可以帮助您再次安装 `pip` 并将其添加到您的 `PATH` ：

- [ensurepip](https://docs.python.org/3/library/ensurepip.html#module-ensurepip) 模块
- [get-pip.py](https://github.com/pypa/get-pip) 脚本

`ensurepip` 模块从 Python 3.4 开始就是标准库的一部分。添加它是为了提供一种直接的方式让您重新安装 `pip` ，例如，如果您在安装 Python 时跳过它或在某个时候卸载了 `pip` 。在下面选择您的操作系统并相应地运行 `ensurepip` ：

Windows：

```bash
C:\> python -m ensurepip --upgrade
```

Linux + macOS：

```bash
$ python3 -m ensurepip --upgrade
```

如果尚未安装 `pip` ，则此命令会将其安装在您当前的 Python 环境中。如果您处于活动的虚拟环境中，则该命令会将 `pip` 安装到该环境中。否则，它会在您的系统上全局安装 `pip` 。 `--upgrade` 选项确保 `pip` 版本与 `ensurepip` 中声明的版本相同。

> 注意： `ensurepip` 模块不访问互联网。 `ensurepip` 可以安装的最新版本的 `pip` 是捆绑在您环境的 Python 安装中的版本。例如，使用 Python 3.10.0 运行 `ensurepip` 将安装 `pip` 21.2.3。如果你想要更新的 `pip` 版本，那么你需要先运行 `ensurepip` 。之后，您可以手动将 `pip` 更新到其最新版本。

修复 `pip` 安装的另一种方法是使用 `get-pip.py` 脚本。 `get-pip.py` 文件包含作为编码 [ZIP 文件](https://realpython.com/python-zip-import/)的 `pip` 的完整副本。您可以直接从 PyPA 引导页面下载 `get-pip.py` 。一旦你的机器上有了脚本，你就可以像这样[运行 Python 脚本](https://realpython.com/run-python-scripts/)：

Windows：

```bash
C:\> python get-pip.py
```

Linux + macOS：

```bash
$ python3 get-pip.py
```

此脚本将在您当前的 Python 环境中安装最新版本的 `pip` 、 `setuptools` 和 `wheel` 。如果只想安装 `pip` ，则可以将 `--no-setuptools` 和 `--no-wheel` 选项添加到命令中。

如果上述方法都不起作用，那么可能值得尝试为您当前的平台下载最新的 Python 版本。您可以按照 [Python 3 安装和设置指南](https://realpython.com/installing-python/)来确保 `pip` 已正确安装并且可以正常工作。

## 使用 pip 安装包

Python 被认为是一种[包含电池](https://www.python.org/dev/peps/pep-0206/#id3)的语言。这意味着 Python 标准库包含一组广泛的包和模块来帮助开发人员完成他们的编码项目。

同时，Python 有一个活跃的社区，它贡献了更广泛的包集，可以帮助您满足您的开发需求。这些包发布到 Python 包索引，也称为 PyPI（发音为 Pie Pea Eye）。

> 注意：当你安装第三方包时，你必须小心。查看如何评估 Python 包的质量以获得确保您的包值得信赖的完整指南。

PyPI 拥有广泛的包集合，包括开发框架、工具和库。其中许多包都为 Python 标准库的功能提供了友好的接口。

### 使用 Python 包索引 (PyPI)

PyPI 托管的众多包之一称为 `requests` 。 `requests` 库通过抽象化 HTTP 请求的复杂性来帮助您与 Web 服务交互。您可以在其官方文档站点上了解有关 `requests` 的所有信息。

当你想在你的项目中使用 `requests` 包时，你必须先将它安装到你的环境中。如果你不想把它安装在你的系统 Python site-packages 中，那么你可以先创建一个虚拟环境，如上所示。

创建虚拟环境并激活它后，命令行提示符会在括号内显示虚拟环境的名称。您从现在开始执行的任何 `pip` 命令都将在您的虚拟环境中执行。

要安装包， `pip` 提供了一个 `install` 命令。您可以运行它来安装 `requests` 包：

Windows：

```bash
(venv) C:\> python -m pip install requests
```

Linux + macOS：

```bash
(venv) $ python3 -m pip install requests
```

在此示例中，您运行 `pip` 和 `install` 命令，后跟要安装的包的名称。 `pip` 命令在 PyPI 中查找包，解析其依赖关系，并在当前 Python 环境中安装所有内容，以确保 `requests` 能够正常工作。

`pip install <package>` 命令总是寻找最新版本的包并安装它。它还搜索包元数据中列出的依赖项并安装它们以确保包具有所需的所有要求。

也可以在一个命令中安装多个包：

Windows：

```bash
(venv) C:\> python -m pip install rptree codetiming
```

Linux + macOS：

```bash
(venv) $ python3 -m pip install rptree codetiming
```

通过在 `pip install` 命令中链接包 `rptree` 和 `codetiming` ，您可以同时安装这两个包。您可以向 `pip install` 命令添加任意数量的包。在这种情况下， `requirements.txt` 文件可以派上用场。在本教程的后面，您将学习如何使用 `requirements.txt` 文件一次安装多个包。

> 注意：除非包的特定版本号与本教程相关，否则您会注意到版本字符串采用通用形式 `x.y.z` 。这是一种占位符格式，可以代表 `3.1.4` 、 `2.9` 或任何其他版本号。当您继续操作时，终端中的输出将显示您的实际包版本号。

您可以使用 `list` 命令显示环境中安装的包及其版本号：

Windows：

```bash
(venv) C:\> python -m pip list
Package            Version
------------------ ---------
certifi            x.y.z
charset-normalizer x.y.z
codetiming         x.y.z
idna               x.y.z
pip                x.y.z
requests           x.y.z
rptree             x.y.z
setuptools         x.y.z
urllib3            x.y.z
```

Linux + macOS：

```bash
(venv) $ python3 -m pip list
Package            Version
------------------ ---------
certifi            x.y.z
charset-normalizer x.y.z
idna               x.y.z
pip                x.y.z
requests           x.y.z
setuptools         x.y.z
urllib3            x.y.z
```

`pip list` 命令呈现一个表格，显示当前环境中所有已安装的包。上面的输出显示了使用 `x.y.z` 占位符格式的包的版本。当您在您的环境中运行 `pip list` 命令时， `pip` 会显示您为每个包安装的特定版本号。

现在您已经安装了 `requests` 及其依赖项，您可以像导入 Python 代码中的任何其他常规包一样导入它。启动交互式 Python 解释器并导入 `requests` 包：

```python
>>> import requests
>>> requests.__version__
"x.y.z"
```

启动交互式 Python 解释器后，您导入了 `requests` 模块。通过调用 `requests.__version__` ，您验证了您在虚拟环境中使用了 `requests` 模块。

### 使用自定义包索引

默认情况下， `pip` 使用 PyPI 来查找包。但 `pip` 还为您提供了定义自定义包索引的选项。

当 PyPI 域在您的网络上被阻止或者如果您想要使用非公开可用的包时，将 `pip` 与自定义索引一起使用会很有帮助。

有时系统管理员还创建自己的内部包索引，以更好地控制哪些包版本可供公司网络上的 `pip` 用户使用。

自定义包索引必须符合 [PEP 503 – 简单存储库 API](https://www.python.org/dev/peps/pep-0503/) 才能与 `pip` 一起使用。您可以通过访问 [PyPI 简单索引](https://pypi.org/simple/)了解这样一个 [API（应用程序编程接口）](https://en.wikipedia.org/wiki/API)的外观——但请注意，这是一个包含大量难以解析内容的大页面。任何遵循相同 API 的自定义索引都可以使用 `--index-url` 选项作为目标。除了输入 `--index-url` ，您还可以使用 `-i` 速记。

例如，要从 TestPyPI 包索引安装 `rptree` 工具，您可以运行以下命令：

Windows：

```bash
(venv) C:\> python -m pip install -i https://test.pypi.org/simple/ rptree
```

Linux + macOS：

```bash
(venv) $ python3 -m pip install -i https://test.pypi.org/simple/ rptree
```

使用 `-i` 选项，您告诉 `pip` 查看不同的包索引而不是默认的 PyPI。在这里，您从 TestPyPI 而不是 PyPI 安装 `rptree` 。您可以使用 TestPyPI 微调 Python 包的发布过程，而不会弄乱 PyPI 上的生产包索引。

如果需要永久使用替代索引，则可以在 `pip` [配置文件](https://pip.pypa.io/en/stable/topics/configuration/)中设置 `index-url` 选项。该文件名为 `pip.conf` ，您可以通过运行以下命令找到它的位置：

Windows：

```bash
(venv) C:\> python -m pip config list -vv
```

Linux + macOS：

```bash
(venv) $ python3 -m pip config list -vv
```

使用 `pip config list` 命令，您可以列出活动配置。当您设置了自定义配置时，此命令仅输出一些内容。否则，输出为空。这就是加法 `--verbose` 或 `-vv` 选项会有所帮助的时候。添加 `-vv` 时， `pip` 会向您显示它在何处查找不同的配置级别。

如果要添加 `pip.conf` 文件，则可以选择 `pip config list -vv` 列出的位置之一。带有自定义包索引的 `pip.conf` 文件如下所示：

```toml
# pip.conf

[global]
index-url = https://test.pypi.org/simple/
```

当你有一个这样的 `pip.conf` 文件时， `pip` 将使用定义的 `index-url` 来查找包。使用此配置，您无需在 `pip install` 命令中使用 `--index-url` 选项来指定您只需要可以在 TestPyPI 的[简单 API](https://test.pypi.org/simple/) 中找到的包。

### 从 GitHub 存储库安装包

您不限于托管在 PyPI 或其他包索引上的包。 `pip` 还提供了从 [GitHub 存储库](https://realpython.com/python-git-github-intro/)安装包的选项。但即使包托管在 PyPI 上，如 [Real Python 目录树生成器](https://pypi.org/project/rptree/)，您也可以选择从其 Git 存储库安装它：

Windows：

```bash
(venv) C:\> python -m pip install git+https://github.com/realpython/rptree
```

Linux + macOS：

```bash
(venv) $ python3 -m pip install git+https://github.com/realpython/rptree
```

使用 `git+https` 方案，您可以指向包含可安装包的 Git 存储库。您可以通过运行交互式 Python 解释器并导入 `rptree` 来验证您是否正确安装了包：

```python
>>> import rptree
>>> rptree.__version__
"x.y.z"
```

启动交互式 Python 解释器后，导入 `rptree` 模块。通过调用 `rptree.__version__` ，您可以验证您正在使用基于虚拟环境的 `rptree` 模块。

> 注意：如果您使用的是 Git 以外的版本控制系统 (VCS)， `pip` 可以满足您的要求。要了解如何将 `pip` 与 Mercurial、Subversion 或 Bazaar 一起使用，请查看 `pip` 文档的 VCS 支持章节。

如果包未托管在 PyPI 上但具有远程 Git 存储库，则从 Git 存储库安装包会很有帮助。您指向 `pip` 的远程存储库甚至可以托管在您公司内部网上的内部 Git 服务器上。当您位于防火墙后面或对您的 Python 项目有其他限制时，这会很有用。

### 以可编辑模式安装包以简化开发

在您自己的包上工作时，以可编辑模式安装它是有意义的。通过这样做，您可以像在任何其他包中一样使用命令行来处理源代码。典型的工作流程是首先克隆存储库，然后使用 `pip` 将其作为可编辑包安装在您的环境中：

Windows：

```bash
C:\> git clone https://github.com/realpython/rptree
C:\> cd rptree
C:\rptree> python3 -m venv venv
C:\rptree> venv\Scripts\activate.bat
(venv) C:\rptree> python -m pip install -e .
```

Linux + macOS：

```bash
$ git clone https://github.com/realpython/rptree
$ cd rptree
$ python3 -m venv venv
$ source venv/bin/activate
(venv) $ python3 -m pip install -e .
```

使用上面的命令，您将 `rptree` 包安装为可编辑模块。以下是您刚刚执行的操作的逐步细分：

- 第 1 行克隆了 `rptree` 包的 Git 存储库。

- 第 2 行将工作目录更改为 `rptree/` 。
- 第 3 行和第 4 行创建并激活了一个虚拟环境。
- 第 5 行将当前目录的内容安装为一个可编辑的包。

`-e` 选项是 `--editable` 选项的简写。当您将 `-e` 选项与 `pip install` 一起使用时，您告诉 `pip` 您想要以可编辑模式安装包。您不使用包名称，而是使用点 ( `.` ) 将 `pip` 指向当前目录。

如果您没有使用 `-e` 标志， `pip` 会正常将包安装到您环境的 `site-packages/` 文件夹中。当您以可编辑模式安装包时，您将在站点包中创建一个指向本地项目路径的链接：

```bash
 ~/rptree/venv/lib/python3.10/site-packages/rptree.egg-link
```

使用带有 `-e` 标志的 `pip install` 命令只是 `pip install` 提供的众多选项之一。您可以查看 `pip` 文档中的 [pip install 示例](https://pip.pypa.io/en/stable/cli/pip_install/#examples)。在那里，您将学习如何安装包的特定版本或将 `pip` 指向非 PyPI 的不同索引。

在下一节中，您将了解需求文件如何帮助您完成 `pip` 工作流。

## 使用需求文件

`pip install` 命令始终安装包的最新发布版本，但有时您的代码需要特定的包版本才能正常工作。

您想要创建用于开发和测试应用程序的依赖项和版本的规范，以便在生产中使用该应用程序时不会出现意外。

### 固定需求

当您与其他开发人员共享您的 Python 项目时，您可能希望他们使用您正在使用的相同版本的外部包。

也许某个特定版本的软件包包含您所依赖的新功能，或者您正在使用的软件包版本与以前的版本不兼容。

这些外部依赖项也称为需求。您经常会发现 Python 项目将其需求固定在名为 `requirements.txt` 或类似文件的文件中。[需求文件格式](https://pip.pypa.io/en/stable/reference/requirements-file-format/)允许您精确指定应安装哪些包和版本。

运行 `pip help` 显示有一个 `freeze` 命令以需求格式输出已安装的包。您可以使用此命令，将输出重定向到文件以生成需求文件：

Windows：

```bash
(venv) C:\> python -m pip freeze > requirements.txt
```

Linux + macOS：

```bash
(venv) $ python3 -m pip freeze > requirements.txt
```

此命令在您的工作目录中创建一个 `requirements.txt` 文件，其中包含以下内容：

```bash
certifi==x.y.z
charset-normalizer==x.y.z
idna==x.y.z
requests==x.y.z
urllib3==x.y.z
```

请记住，上面显示的 `x.y.z` 是包版本的占位符格式。您的 `requirements.txt` 文件将包含真实的版本号。

`freeze` 命令将当前安装的包的名称和版本转储到标准输出。您可以将输出重定向到一个文件，稍后您可以使用该文件将您的确切要求安装到另一个系统中。您可以随意命名需求文件。

但是，广泛采用的约定是将其命名为 `requirements.txt` 。

当你想在另一个系统中复制环境时，你可以运行 `pip install` ，使用 `-r` 开关来指定需求文件：

Windows：

```bash
(venv) C:\> python -m pip install -r requirements.txt
```

Linux + macOS：

```
(venv) $ python3 -m pip install -r requirements.txt
```

在上面的命令中，您告诉 `pip` 将 `requirements.txt` 中列出的包安装到您当前的环境中。包版本将匹配 `requirements.txt` 文件包含的版本约束。您可以运行 `pip list` 来显示您刚刚安装的包及其版本号：

Windows：

```bash
(venv) C:\> python -m pip list

Package            Version
------------------ ---------
certifi            x.y.z
charset-normalizer x.y.z
idna               x.y.z
pip                x.y.z
requests           x.y.z
setuptools         x.y.z
urllib3            x.y.z
```

Linux + macOS：

```bash
(venv) $ python3 -m pip list

Package            Version
------------------ ---------
certifi            x.y.z
charset-normalizer x.y.z
idna               x.y.z
pip                x.y.z
requests           x.y.z
setuptools         x.y.z
urllib3            x.y.z
```

现在您可以分享您的项目了！您可以将 `requirements.txt` 提交到像 Git 这样的版本控制系统中，并使用它在其他机器上复制相同的环境。但是等等，如果为这些软件包发布新的更新会怎样？

### 微调需求

对包的版本和依赖项进行硬编码的问题在于，包会经常更新错误和安全修复程序。您可能希望在更新发布后立即利用这些更新。

需求文件格式允许您使用比较运算符指定依赖项版本，这为您提供了一些灵活性，以确保更新包，同时仍然定义包的基本版本。

在您喜欢的编辑器中打开 `requirements.txt` ，并将相等运算符 ( `==` ) 转换为大于或等于运算符 ( `>=` )，如下例所示：

```bash
# requirements.txt

certifi>=x.y.z
charset-normalizer>=x.y.z
idna>=x.y.z
requests>=x.y.z
urllib3>=x.y.z
```

您可以将比较运算符更改为 `>=` 以告知 `pip` 安装已发布的精确或更高版本。当您使用 `requirements.txt` 文件设置新环境时， `pip` 会查找满足要求的最新版本并进行安装。

接下来，您可以通过运行带有 `--upgrade` 开关或 `-U` 简写的 `install` 命令来升级需求文件中的包：

Windows：

```bash
(venv) C:\> python -m pip install -U -r requirements.txt
```

Linux + macOS：

```bash
(venv) $ python3 -m pip install -U -r requirements.txt
```

如果列出的软件包有新版本可用，则该软件包将被升级。

在理想的世界中，新版本的包将向后兼容并且永远不会引入新的错误。不幸的是，新版本可能会引入会破坏您的应用程序的更改。为了微调您的需求，需求文件语法支持额外的[版本说明符](https://www.python.org/dev/peps/pep-0440/#version-specifiers)。

想象一下， `requests` 的新版本 `3.0` 已发布，但引入了破坏应用程序的不兼容更改。您可以修改需求文件以防止安装 `3.0` 或更高版本：

```bash
# requirements.txt

certifi==x.y.z
charset-normalizer==x.y.z
idna==x.y.z
requests>=x.y.z, <3.0
urllib3==x.y.z
```

更改 `requests` 包的版本说明符可确保不会安装任何大于或等于 `3.0` 的版本。 `pip` 文档提供了有关[需求文件格式](https://pip.pypa.io/en/stable/reference/requirements-file-format/)的大量信息，您可以查阅它以了解更多信息。

### 分离生产和开发依赖

并非您在应用程序开发期间安装的所有包都是生产依赖项。例如，您可能想要测试您的应用程序，因此您需要一个测试框架。一个流行的测试框架是 `pytest` 。你想在开发环境中安装它，但不想在生产环境中安装它，因为它不是生产依赖项。

您创建第二个需求文件 `requirements_dev.txt` ，以列出用于设置开发环境的其他工具：

```bash
# requirements_dev.txt

pytest>=x.y.z
```

拥有两个需求文件将要求您使用 `pip` 来安装它们， `requirements.txt` 和 `requirements_dev.txt` 。幸运的是， `pip` 允许您在需求文件中指定其他参数，因此您可以修改 `requirements_dev.txt` 以同时安装来自生产环境的 `requirements.txt` 文件中的需求：

```bash
# requirements_dev.txt

-r requirements.txt
pytest>=x.y.z
```

请注意，您使用相同的 `-r` 开关来安装生产 `requirements.txt` 文件。现在，在您的开发环境中，您只需运行这条命令即可安装所有要求：

Windows：

```bash
(venv) C:\> python -m pip install -r requirements_dev.txt
```

Linux + macOS：

```bash
(venv) $ python3 -m pip install -r requirements_dev.txt
```

因为 `requirements_dev.txt` 包含 `-r requirements.txt` 行，所以您不仅要安装 `pytest` ，还要安装 `requirements.txt` 的固定要求。在生产环境中，仅安装生产要求就足够了：

Windows：

```bash
(venv) C:\> python -m pip install -r requirements.txt
```

Linux + macOS：

```bash
(venv) $ python3 -m pip install -r requirements.txt
```

使用此命令，您可以安装 `requirements.txt` 中列出的要求。与您的开发环境相比，您的生产环境不会安装 `pytest` 。

### 为生产环境冷冻需求

您创建了生产和开发需求文件并将它们添加到源代码管理中。这些文件使用灵活的版本说明符来确保您利用依赖项发布的错误修复。

您还测试了您的应用程序，现在可以将其部署到生产环境中了。

您知道所有测试都通过了并且应用程序可以使用您在开发过程中使用的依赖项，因此您可能希望确保将相同版本的依赖项部署到生产环境中。

当前的版本说明符不能保证将相同的版本部署到生产环境中，因此您希望在发布项目之前冻结生产需求。

根据当前需求完成开发后，创建当前项目新版本的工作流程如下所示：

| Step | Command                              | Explanation                                                      |
| ---- | ------------------------------------ | ---------------------------------------------------------------- |
| 1    | `pytest`                             | 运行您的测试并验证您的代码是否正常工作。                         |
| 2    | `pip install -U -r requirements.txt` | 将您的要求升级到与 `requirements.txt` 文件中的约束相匹配的版本。 |
| 3    | `pytest`                             | 运行您的测试并考虑降级任何向您的代码引入错误的依赖项。           |
| 4    | `pip freeze > requirements_lock.txt` | 项目正常运行后，将依赖项冻结到 `requirements_lock.txt` 文件中。  |

使用这样的工作流程， `requirements_lock.txt` 文件将包含准确的版本说明符，可用于复制您的环境。您已确保当您的用户将 `requirements_lock.txt` 中列出的软件包安装到他们自己的环境中时，他们将使用您希望他们使用的版本。

冻结您的需求是确保您的 Python 项目在您的用户环境中以与在您的环境中相同的方式工作的重要步骤。

## 使用 pip 卸载软件包

有时，您必须卸载一个包。要么你找到了一个更好的库来替换它，要么它是你不需要的东西。卸载软件包可能有点棘手。

请注意，当您安装 `requests` 时，您也获得了 `pip` 来安装其他依赖项。安装的包越多，多个包依赖相同依赖项的可能性就越大。这就是 `pip` 中的 `show` 命令派上用场的地方。

在卸载包之前，请确保为该包运行 `show` 命令：

Windows：

```bash
(venv) C:\> python -m pip show requests

Name: requests
Version: 2.26.0
Summary: Python HTTP for Humans.
Home-page: https://requests.readthedocs.io
Author: Kenneth Reitz
Author-email: me@kennethreitz.org
License: Apache 2.0
Location: .../python3.9/site-packages
Requires: certifi, idna, charset-normalizer, urllib3
Required-by:
```

Linux + macOS：

```bash
(venv) $ python3 -m pip show requests

Name: requests
Version: 2.26.0
Summary: Python HTTP for Humans.
Home-page: https://requests.readthedocs.io
Author: Kenneth Reitz
Author-email: me@kennethreitz.org
License: Apache 2.0
Location: .../python3.9/site-packages
Requires: certifi, idna, charset-normalizer, urllib3
Required-by:
```

注意最后两个字段， `Requires` 和 `Required-by` 。 `show` 命令告诉您 `requests` 需要 `certifi` 、 `idna` 、 `charset-normalizer` 和 `urllib3` 。您可能也想卸载它们。请注意， `requests` 不是任何其他包所必需的。所以卸载它是安全的。

您应该针对所有 `requests` 依赖项运行 `show` 命令，以确保没有其他库也依赖于它们。一旦了解了要卸载的包的依赖顺序，就可以使用 `uninstall` 命令删除它们：

Windows：

```bash
(venv) C:\> python -m pip uninstall certifi
```

Linux + macOS：

```bash
(venv) $ python3 -m pip uninstall certifi
```

`uninstall` 命令显示将要删除的文件并要求确认。如果您确定要删除该包，因为您已经检查了它的依赖关系并且知道没有其他东西在使用它，那么您可以传递一个 `-y` 开关来抑制文件列表和确认对话框：

Windows：

```bash
(venv) C:\> python -m pip uninstall certifi -y
```

Linux + macOS：

```bash
(venv) $ python3 -m pip uninstall certifi -y
```

这里卸载 `urllib3` 。使用 `-y` 开关，您可以取消询问您是否要卸载此包的确认对话框。

在一次调用中，您可以指定要卸载的所有包：

Windows：

```bash
(venv) C:\> python -m pip uninstall -y charset-normalizer idna requests
```

Linux + macOS：

```bash
(venv) $ python3 -m pip uninstall -y charset-normalizer idna requests
```

您可以将多个包传递给 `pip uninstall` 命令。如果您没有添加任何额外的开关，那么您需要确认卸载每个包。通过 `-y` 开关，您可以在没有任何确认对话框的情况下将它们全部卸载。

您还可以通过提供 `-r <requirements file>` 选项来卸载需求文件中列出的所有包。此命令将提示对每个包的确认请求，但您可以使用 `-y` 开关抑制它：

Windows：

```bash
(venv) C:\> python -m pip uninstall -r requirements.txt -y
```

Linux + macOS：

```bash
(venv) $ python3 -m pip uninstall -r requirements.txt -y
```

请记住始终检查要卸载的软件包的依赖项。您可能想卸载所有依赖项，但卸载其他人使用的包会破坏您的工作环境。因此，您的项目可能无法再正常工作。

如果您在虚拟环境中工作，那么创建一个新的虚拟环境可能会更省力。然后你可以安装你需要的包而不是尝试卸载你不需要的包。但是，当您需要从系统 Python 安装中卸载包时， `pip uninstall` 会非常有用。如果您不小心在系统范围内安装了软件包，使用 `pip uninstall` 是整理系统的好方法。

## 探索 pip 的替代品

Python 社区提供了出色的工具和库，供您在 `pip` 之外使用。这些包括尝试简化和改进包管理的 `pip` 的替代方案。

以下是一些可用于 Python 的其他包管理工具：

| Tool                                     | Description                                                                                                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Conda](https://conda.io/en/latest/)     | Conda 是许多语言（包括 Python）的包、依赖项和环境管理器。它来自 Anaconda，Anaconda 最初是 Python 的数据科学包。因此，它被广泛用于数据科学和机器学习应用程序。 Conda 运行自己的索引来托管兼容包。 |
| [Poetry](https://python-poetry.org/)     | 如果您来自 JavaScript 和 npm，Poetry 对您来说会非常熟悉。 Poetry 超越了包管理，帮助您为您的应用程序和库构建分发并将它们部署到 PyPI。                                                             |
| [Pipenv](https://github.com/pypa/pipenv) | Pipenv 是另一个包管理工具，它将虚拟环境和包管理合并到一个工具中。 [Pipenv：新 Python 打包工具指南](https://realpython.com/pipenv-guide/)是开始学习 Pipenv 及其包管理方法的好地方。               |

只有 `pip` 捆绑在标准 Python 安装中。如果您想使用上面列出的任何替代方案，则必须按照其文档中的安装指南进行操作。有这么多选项，您一定会找到适合您的编程之旅的工具！

## 结论

许多 Python 项目使用 `pip` 包管理器来管理它们的依赖项。它包含在 Python 安装程序中，是 Python 中依赖管理的重要工具。

**在本教程中，您学习了如何：**

- 在您的工作环境中设置并运行 `pip`
- 修复与使用 `pip` 相关的常见错误
- 使用 `pip` 安装和卸载包
- 定义项目和应用程序的要求
- 在需求文件中固定依赖项

此外，您还了解了使依赖项保持最新的重要性以及可以帮助您管理这些依赖项的 `pip` 的替代方法。

通过仔细查看 `pip` ，您已经探索了 Python 开发工作流中的一个基本工具。使用 `pip` ，您可以安装和管理您在 [PyPI](https://pypi.org/) 上找到的任何其他包。您可以使用来自其他开发人员的外部包作为需求，并专注于使您的项目独一无二的代码。

原文链接：[https://realpython.com/what-is-pip](https://realpython.com/what-is-pip)
