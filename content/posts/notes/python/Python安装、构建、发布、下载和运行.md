---
title: "Python安装、构建、发布、下载和运行"
date: 2023-05-09T09:00:00+08:00
slug: python-install-build-publish-run
categories: ["Notes"]
tags: ["python"]
---

最近开始学习 python，这篇文章记录如何安装 python、搭建 python 开发环境，以及如何构建、发布 python 包。我使用的是 macos 系统，所以本篇文章中的一些命令是基于 macos ，特此说明。

## 1、安装

MacOS 上通过 brew 安装 Python3：

```bash
brew install python3
```

查看 python3 安装路径：

```bash
$ which python3
/opt/homebrew/bin/python3

$ type python3
python3 is /opt/homebrew/bin/python3
```

查看版本：

```bash
python --version
```

设置环境变量，我使用的是 zsh，所以需要修改 ~/.zshrc，添加下面代码：

```bash
export PYTHON_HOME=/opt/homebrew/opt/python@3.11
export PATH=$PYTHON_HOME/bin:$PATH

alias python=python3
alias pip=pip3
```

使配置生效：

```bash
source ~/.zshrc
```



## 2、创建项目

创建一个目录 chensoul_hello：

```bash
mkdir chensoul_hello
cd chensoul_hello
```

创建一个 main.py ，打印 helloworld：

```python
print("hello world")
```

试试运行 main.py：

```bash
python main.py
```



## 3、创建虚拟环境

使用 python venv 模块创建虚拟环境 .venv：

```bash
python -m venv .venv
```

使用 . 开头的目录或者文件为隐藏文件。`如果使用 git 管理项目，则需要将 .venv 添加到 .gitignore`。

激活虚拟环境：

```bash
source .venv/bin/activate
```



## 4、使用 setuptools 管理项目

setuptools 是 Python 的一个包管理工具，它可以帮助开发人员更方便地打包和发布 Python 代码。setuptools 提供了一些命令行工具，例如 easy_install 和 setup.py。

`setup.py` 文件是 setuptools 用于构建、打包和发布 Python 包的核心文件之一。通过 `setup.py` 文件，开发人员可以指定包的元数据、依赖关系、安装脚本等信息，从而实现包的安装、升级和卸载等操作。

具体来说，`setup.py` 文件通常包含以下内容：

- 包的元数据，例如包的名称、版本号、作者、许可证等信息。
- 包的依赖关系，例如需要依赖哪些其他 Python 包。
- 包的安装脚本，例如需要安装哪些文件、脚本等。
- 其他自定义的构建和发布选项，例如文档生成、命令行工具的生成等。

通过运行 `python setup.py` 命令，可以执行一系列操作，例如将包构建为源代码或二进制分发包、将其上传到 PyPI 或其他包仓库、安装包到本地系统等。同时，setuptools 还提供了一些功能，例如自动化依赖关系管理、版本控制、命令行工具的生成和文档的生成等，可以帮助开发人员更加高效地进行 Python 开发。

1、安装 setuptools

```bash
pip install setuptools
```


2、创建 setup.py 文件

在使用 setuptools 时，通常需要创建一个 setup.py 文件，用来描述包的信息、依赖关系和安装方式等。setup.py 文件通常包含一个 setup() 函数，用来定义包的元数据和依赖关系等信息。例如：

```python
from setuptools import setup, find_packages

setup(
    name='chensoul_hello',
    version='1.0.0',
    author='chensoul',
    author_email='chensoul@chensoul.com',
    description='A simple Python package',
    packages=find_packages(),
    install_requires=[
        'numpy>=1.16.0',
        'pandas>=0.23.4',
    ],
    entry_points={
        'console_scripts': [
            'hello_command=chensoul_hello.cli:main',
        ],
    },
)
```

这个 `setup.py` 文件定义了一个名为 `chensoul_hello` 的 Python 包，指定了包的元数据、依赖关系等信息。

- `name`：包的名称。
- `version`：包的版本号。
- `author`：包的作者。
- `author_email`：作者的电子邮件地址。
- `description`：包的简要描述。
- `packages`：包含需要打包的 Python 包的列表，使用 `find_packages()` 函数可以自动查找所有包。
- `install_requires`：包依赖的其他 Python 包。
- `console_scripts`： 是一个可选参数，用于定义包中的命令行工具。它是一个字典，键是命令的名称，值是命令对应的入口点（entry point）。入口点是一个字符串，通常是模块名和函数名的组合，例如 "chensoul_hello.cli:main"，表示调用 chensoul_hello 包中的 cli 模块的 main 函数。当使用 setuptools 安装包时，console_scripts 会自动创建一个可执行文件，并将入口点指向该文件。这个文件通常被放在 Python 的 bin 目录下，例如 /usr/local/bin。



对于上面的例子，如果想要在命令行中使用 hello_command 命令，需要创建名为 "chensoul_hello" 的 Python 包：

- 创建一个名为 "chensoul_hello" 的文件夹，并进入该文件夹。

- 在 "chensoul_hello" 文件夹中创建一个名为 `__init__.py` 的空文件。这个文件用于指示 Python 解释器该文件夹是一个 Python 包。

  ```bash
  mkdir chensoul_hello
  cd chensoul_hello
  touch __init__.py
  ```

- 在 "chensoul_hello" 文件夹中创建一个名为 `cli.py` 的文件。这个文件用于定义命令行脚本的入口函数。在 `cli.py` 文件中添加以下代码：

  ```python
  def main():
      print("Hello, world!")
  ```

  

## 5、使用 setuptools 构建包

在项目的根目录，使用以下命令来构建源码分发包：

```bash
python setup.py sdist
```

或者使用以下命令来构建二进制 wheel 包：

```bash
python setup.py bdist_wheel
```

在执行上面两个命令之前，需要确保已经安装了 setuptools 和 wheel。如果没有安装，可以使用以下命令安装：

```bash
pip install setuptools wheel
```

也可以一起执行：

```bash
python setup.py sdist bdist_wheel
```

执行完成后，会在当前目录下生成 dist 目录，并在其中生成两个包文件：一个源代码包和一个二进制包。这两个包文件可以通过 pip 安装，也可以直接将它们拷贝到其他机器上使用。



## 6、使用 twine 发布包

twine 是一个 Python 包，用于将 Python 包上传到 PyPI 或其他类似的包仓库。它可以帮助你将打包好的 Python 包上传到 PyPI 服务器或其他类似的服务器。

1) 安装 twine

在终端或命令行中运行以下命令安装 twine：

```bash
pip install twine
```

2) 打包 Python 包

如果你已经使用 setuptools 构建了源码分发包或二进制 wheel 包，可以使用 `wheel` 工具来将其转换为 wheel 包或上传到 PyPI 或其他支持的包仓库。例如，使用以下命令将源码分发包转换为 wheel 包：

```bash
pip wheel dist/chensoul_hello-1.0.0.tar.gz
```

3) 注册账号

在上传包之前，你需要注册一个 PyPI 账号。如果你还没有注册，请访问 PyPI 网站（https://pypi.org/account/register/）进行注册。

在使用 `twine` 工具上传包时，需要先在 PyPI 网站上注册账号并获取上传凭证（例如 API 密钥或用户名密码），然后将凭证保存在本地的 `$HOME/.pypirc` 文件中。

```toml
[pypi]
  username = __token__
  password = pypi-XXXXXX
```



4) 上传 Python 包

`twine` 工具支持上传到以下包仓库：

- PyPI（Python Package Index）：PyPI 是 Python 社区的官方包仓库，提供了大量的 Python 包供用户下载和使用。PyPI 使用 https://pypi.org/ 作为官方网站，可以使用 `twine` 工具将包上传到 PyPI。

- Test PyPI：Test PyPI 是 PyPI 的一个测试环境，用于测试和验证包的上传和分发过程。Test PyPI 使用 https://test.pypi.org/ 作为官方网站，可以使用 `twine` 工具将包上传到 Test PyPI。

- 任何支持 twine 格式的包仓库：`twine` 工具支持将包上传到任何支持 twine 格式的包仓库，只需要指定包仓库的 URL 和凭证即可。例如，可以使用 `twine` 工具将包上传到自己的私有包仓库或第三方包仓库。

例如，使用以下命令将一个 wheel 包上传到 PyPI：

```bash
$ twine upload dist/chensoul_hello-1.0.0-py3-none-any.whl
Enter your username: __token__
Enter your password:
```

或者使用以下命令将一个源码分发包上传到 PyPI：

```bash
twine upload dist/chensoul_hello-1.0.0.tar.gz
```

同时上传wheel 包和源码：

```bash
twine upload dist/*
```



这个命令将会上传 `dist` 目录下的所有包到 Test PyPI。需要注意的是，上传到不同的包仓库可能需要不同的命令和参数，具体可以参考包仓库的文档或帮助信息。

```bash
twine upload --repository-url https://test.pypi.org/legacy/ dist/*
```



如果上传时提示错误：

 ```bash
Uploading distributions to https://upload.pypi.org/legacy/
Uploading chensoul_hello-1.0.0-py3-none-any.whl
100% ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 4.5/4.5 kB • 00:00 • ?
WARNING  Error during upload. Retry with the --verbose option for more details.
ERROR    HTTPError: 403 Forbidden from https://upload.pypi.org/legacy/
         The user 'chensoul' isn't allowed to upload to project 'my-package'. See https://pypi.org/help/#project-name for more information.
 ```

原因是项目名称 my-package 不合法或者已存在，需要修改包名称。



如果项目已经存在，则可以添加参数覆盖已经存在的项目：

```bash
twine upload dist/* --skip-existing
```



## 7、使用 pip 安装包

如果你想安装、升级或删除 Python 包，可以使用 `pip` 工具来进行操作。

使用以下命令来安装本地的包：

```bash
pip install dist/chensoul_hello-1.0.0.tar.gz
```

或者安装本地的 wheel 包：

```bash
pip install dist/chensoul_hello-1.0.0-py3-none-any.whl
```

也可以使用以下命令来从仓库中安装一个包及其依赖项：

```
pip install chensoul_hello
```

查看本地下载的安装包：

```bash
$ pip list|grep chensoul-hello
chensoul-hello     1.0.0
```

> 在使用 setuptools 构建 Python 包时，包名应该符合 Python 包命名规范。具体来说，包名应该只包含小写字母、数字和短横线 `-`，不能包含其他字符，包名应该以字母开头，并且不能超过 32 个字符。
>
> 另外，如果你在包名中使用了短横线 `-`，在引用包时需要将其替换成下划线 `_`。例如，如果你的包名为 `chensoul-hello`，在引用包时应该使用 `import chensoul_hello`。
>
> 总之，在使用 setuptools 构建 Python 包时，包名应该符合 Python 包命名规范，并且如果包名中包含短横线 `-`，在引用包时应该使用下划线 `_`。



可以使用以下命令导出当前环境中的所有依赖项列表到 requirements.txt 文件中：

```bash
pip freeze > requirements.txt
```



可以使用以下命令根据 requirements.txt 文件中的依赖项列表安装包：

```bash
pip install -r requirements.txt
```



## 8、运行命令

```bash
$ hello_command
Hello, world!
```



## 9、使用 pypa/build 构建包

执行下面命令时：

```bash
python setup.py bdist_wheel
```

出现一个警告：

```bash
        ********************************************************************************
        Please avoid running ``setup.py`` directly.
        Instead, use pypa/build, pypa/installer, pypa/build or
        other standards-based tools.

        See https://blog.ganssle.io/articles/2021/10/setup-py-deprecated.html for details.
        ********************************************************************************
```

pypa/build 和 pypa/installer 是 Python Packaging Authority（PyPA）维护的两个工具，分别用于构建和安装 Python 包。pypa/build 就是 build 模块，而 pypa/installer 就是pip。

下面是它们的使用方法：

1. 安装 pypa/build 工具：

   ```bash
   pip install build
   ```

2. 运行以下命令构建包：

   ```
   python -m build
   ```

   `python -m build` 是一个用于构建 Python 包的命令行工具，它是 Python 3.10 中新增的标准库模块 `build` 的入口点。使用 `python -m build` 可以方便地构建源代码发行包和二进制发行包，支持多种格式，包括 `sdist`、`wheel`、`zip`、`tar` 等。

   在使用 `python -m build` 构建 Python 包之前，需要确保你的项目符合 Python 包的标准。具体来说，你需要在项目根目录下创建一个 `setup.cfg` 文件和一个 `setup.py` 文件，其中 `setup.cfg` 文件包含项目元数据和构建选项，`setup.py` 文件包含构建和打包的具体实现。



3. 如果需要发布包到 PyPI 或其他包仓库，可以使用以下命令：

   ```
   twine upload dist/*
   ```

## 10、附录

### pypa/build 和 setuptools 对比

`python -m build` 和 `python setup.py sdist bdist_wheel` 都是用于构建 Python 包的命令行工具，但它们有一些区别。

- `python -m build` 是 Python 3.10 中新增的标准库模块 `build` 的入口点，支持多种构建格式，包括 `sdist`、`wheel`、`zip`、`tar` 等。它可以自动构建源代码发行包和二进制发行包，并支持多种平台和 Python 版本。`python -m build` 的使用方式比较简单，需要在项目根目录下创建一个 `setup.py` 文件或者 `pyproject.toml` 文件，然后在项目根目录下执行 `python -m build` 命令即可。
- `python setup.py sdist bdist_wheel` 是传统的 Python 包构建方式，需要在项目根目录下创建一个 `setup.py` 文件，其中包含构建和打包的具体实现。它支持的构建格式比较有限，只包括 `sdist` 和 `bdist_wheel` 两种格式。`python setup.py sdist bdist_wheel` 的使用方式相对较为繁琐，需要执行多个命令，并指定相应的参数和选项。

总之，`python -m build` 是 Python 3.10 中新增的标准库模块 `build` 的入口点，支持多种构建格式，使用起来比较简单。而 `python setup.py sdist bdist_wheel` 是传统的 Python 包构建方式，使用起来相对较为繁琐，但仍然是一种常见的构建方式。需要根据自己的实际情况选择适合的构建工具。



相对于使用 `python setup.py sdist bdist_wheel` 命令，使用 `python -m build` 命令有以下几个优点：

1. 更简单的命令：`python -m build` 命令比 `python setup.py sdist bdist_wheel` 命令更加简单易用，因为它不需要你编写 `setup.py` 文件。你可以使用 `pyproject.toml` 文件来代替，这样会更简单和现代化。
2. 更好的配置：`build` 模块使用 `pyproject.toml` 文件来配置包的构建，这是一种更现代和标准化的配置方式。该文件可以指定构建依赖项、包含在软件包中的其他文件以及其他元数据。
3. 更多的输出格式：`python -m build` 支持比 `python setup.py sdist bdist_wheel` 更多的输出格式，包括 `wheel`、`sdist`、`zip`、`tar` 等等。
4. 更好的性能：相对于 `python setup.py sdist bdist_wheel` 命令，`python -m build` 命令通常更快，特别是对于具有许多依赖项的大型项目而言。这是因为 `build` 可以并行处理某些任务，例如构建二进制软件包。
5. 更好的兼容性：`python -m build` 设计为与多个 Python 版本和平台兼容，而 `python setup.py sdist bdist_wheel` 命令通常特定于特定版本或平台。

综上所述，相对于 `python setup.py sdist bdist_wheel` 命令，`python -m build` 提供了一种更简单、更现代、更灵活的构建 Python 包的方式，具有更好的性能和兼容性。不过，`python setup.py sdist bdist_wheel` 命令仍然是构建软件包的常用和得到广泛支持的方法，特别是对于较老的项目或具有更复杂要求的项目而言。

