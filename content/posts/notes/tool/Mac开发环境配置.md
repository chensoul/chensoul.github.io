---
title: "Mac开发环境配置"
date: 2021-09-09T18:14:34+08:00
slug: "mac-development-environment-setup"
tags: ["macos"]
categories: ["Notes"]
authors:
  - chensoul
typora-root-url: ../../../../static
---

这是我的第一篇文章，作为程序员，首先要做得第一件事情，就是配置好开发环境，因为我使用的是Mac开发环境，所以，这篇文章主要是基于Mac操作系统，记录开发环境搭建过程。

## 偏好设置

- 系统所有偏好设置
  - 通用：关闭文稿时要求保存更改
  - Siri：关闭
  - 辅助功能 - 指针控制（或鼠标与触控板） - 触控板选项：启动拖移(三指拖移)
  - 触控板 > 光标与点击，轻拍来点按，辅助点按
  - Dock
    - 置于屏幕上的位置：右边
    - 设置 Dock 图标更小（大小随个人喜好）
- Finder
  - 显示各种栏
  - 显示所有文件扩展名
  - 标题栏显示完整路径：defaults write com.apple.finder _FXShowPosixPathInTitle -bool YES;killall Finder
- 禁用大部分 iCloud 同步
- 键盘 -> 快捷键
  - command + 空格：spotlight  
  - control + 空格：切换输入法

## 安装XCode

从 App store 或苹果开发者网站安装 [Xcode](https://developer.apple.com/xcode/) ，然后安装 Xcode command line tools：

```bash
xcode-select --install
```

安装完成后，你将可以直接在 terminal 中使用主要的命令，比如：`make, GCC, clang, perl, svn, git, size, strip, strings, libtool, cpp`等等。

如果你想了解 Xcode command line tools 包含多少可用的命令，可以通过下面命令查看：

```bash
ls /Library/Developer/CommandLineTools/usr/bin/
```

## 安装Homebrew

[Brew](http://brew.sh/) 是 Mac 下面的包管理工具，通过 Github 托管适合 Mac 的编译配置以及 Patch，可以方便的安装开发工具。

打开终端模拟器，开始安装

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

##### 替换 brew.git 源 

```bash
git -C "$(brew --repo)" remote set-url origin https://mirrors.cloud.tencent.com/homebrew/brew.git 
git -C "$(brew --repo homebrew/core)" remote set-url origin https://mirrors.cloud.tencent.com//homebrew/homebrew-core.git brew update
```

设置环境变量：
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.bash_profile
```

如果安装了zsh，则是：
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
```

## 安装软件包

### 基本软件包

这些是基本软件包，建议安装

```bash
brew install zsh \
   wget \
   curl \
   git \
   openssh \
   gnupg \
   cmake \
   vim \
   tree \
   nvm \
   aria2 \
   ffmpeg \
   htop \
   neofetch \
   go
```

### 常用软件

常用软件，可以选择安装

```bash
brew install --cask clash-for-windows \
    iterm2 \
    telegram-desktop \
    typora \
    google-chrome \
    visual-studio-code \
    coteeditor \
    golang \
    mos \
    pycharm \
    obsidian \
    notion \
    lark \
    keka \
    shottr
```



## 打造个性化终端

### iTerm2

iTerm2 是 macOS 系统终端的开源替代品，它是高度可定制化的，并且功能十分强大，应该是 macOS 最好用的终端模拟器之一。

#### 安装

```bash
brew install --cask iterm2
```

设置：
- Preferences --> Profiles--> Default --> Terminal：设置 cursor 颜色为黄色
- Preferences --> Profiles --> Window --> Transparency：设置透明度 10%~20% 即可，太高会和桌面背景冲突。如果需要临时禁用透明度可以使用快捷键 ⌘+u。



#### 字体

在 iTerm2 中，终端的字体可以对正常字体和非 ASCII 字体进行单独的设置，[Nerd-Fonts](https://github.com/ryanoasis/nerd-fonts) 是一个使用大量字形（图标）修补开发人员目标字体的项目

分别安装  [font-fantasque-sans-mono-nerd-font](https://github.com/ryanoasis/nerd-fonts) + [霞鹜文楷](https://github.com/lxgw/LxgwWenKai)  这两种字体

```
# brew 添加字体库
brew tap homebrew/cask-fonts
# 搜索可用 Nerd Font 字体
brew search nerd-font
# 以 font-fantasque-sans-mono-nerd-font 为例（我比较喜欢这个字体🥰）
# 安装喜欢的 nerd-font 字体
brew install font-fantasque-sans-mono-nerd-font
# 安装「霞鹜文楷」字体
brew install font-lxgw-wenkai
```

重新启动 iTerm2，按 `⌘` + `,` 打开 iTerm2 的偏好设置，修改字体

#### **安装主题**

[Dracula](https://draculatheme.com/iterm) 主题很好看，下面给 iTerm2 装上

```
git clone https://github.com/dracula/iterm.git
```

点击 `import` 导入 `Dracula.itermcolors` 文件，然后选择 `Dracula` 主题即可

### Zsh

macOS 现在默认 Shell 是 Zsh 了（以前是 Bash），下面我们可以一边验证一边修改

```bash
# macOS 预设的 Shell
cat /etc/shells

# List of acceptable shells for chpass(1).
# Ftpd will not allow users to connect who are not using
# one of these shells.

/bin/bash
/bin/csh
/bin/dash
/bin/ksh
/bin/sh
/bin/tcsh
/bin/zsh

# 查看当前正在使用的 Shell
echo $SHELL
/bin/zsh

# 查看 zsh 版本
zsh --version
zsh 5.9 (arm-apple-darwin21.3.0)

# 将 brew 安装的 zsh 路径添加到 /etc/shells
sudo sh -c "echo $(which zsh) >> /etc/shells" 
# 更改当前使用的 Shell
chsh -s $(which zsh)
Changing shell for dejavu.
Password for dejavu: # 输入密码即可

# 验证当前使用的 Shell
echo $SHELL
/opt/homebrew/bin/zsh
```

如果你的 macOS 系统语言是中文，终端里会使用系统语言作为 `locale` 设置，我想要终端里的 Shell 显示语言为英语，可以编辑 zsh 配置文件

```bash
# 编辑 zsh 配置用户
vim ~/.zshrc
# 在开头加入以下配置
# You may need to manually set your language environment
export LANG=en_US.UTF-8
```

### oh-my-zsh

```bash
# 通过 cURL 安装
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 或是通过 Wget 安装
sh -c "$(wget https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O -)"
```

oh-my-zsh 的默认主题是 `robbyrussell`，修改为 "pygmalion"

```bash
# 编辑配置文件
vim ~/.zshrc
# 找到 ZSH_THEME 字段
ZSH_THEME="robbyrussell"
# 将 robbyrussell 改为 ys 即可
ZSH_THEME="pygmalion"
# 使配置文件生效
source ~/.zshrc
```



接下来安装几个 Zshell + oh-my-zsh 的增强插件

#### zsh-z

[zsh-z](https://github.com/agkozak/zsh-z#known-bugs) 快速跳转到经常访问的目录，是 [rupa/z](https://github.com/rupa/z) 的原生 Zshell 端口，具有附加功能

```
# 源码安装
git clone https://github.com/agkozak/zsh-z ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-z
# 编辑配置文件
vim ~/.zshrc
# 找到 plugins 字段，加入 zsh-autosuggestions
plugins=(git zsh-z)
# 配置文件生效
source ~/.zshrc
```

#### zsh-autosuggestions

[zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions) 可以根据历史记录对输入进行提示和建议

```
# 源码安装
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
# 编辑配置文件
vim ~/.zshrc
# 找到 plugins 字段，加入 zsh-autosuggestions
plugins=(git zsh-z zsh-autosuggestions)
# 配置文件生效
source ~/.zshrc
```

#### zsh-syntax-highlighting

[zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting) 可以对 Shell 中的命令进行高亮显示

```
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git
echo "source ${(q-)PWD}/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >> ${ZDOTDIR:-$HOME}/.zshrc

source ./zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
```

> 可以 👉 [在这里查看](https://github.com/ohmyzsh/ohmyzsh/wiki/Plugins) 可用的 Zshell 插件



修改 .zshrc ：

```bash
plugins=(git mvn zsh-z zsh-autosuggestions zsh-syntax-highlighting)
```

## Git

安装：
```bash
brew install git
```

查看git命令位置：
```bash
which git
```

配置用户名和邮箱：
```bash
git config --global user.name "Your Name Here"
git config --global user.email "your_email@youremail.com"
```

- 这些配置会加到 ~/.gitconfig

为了将代码推送到 GitHub 仓库，建议使用HTTPS方法。如果你不想每次都输入用户名和密码的话，可以按照此 [描述](https://help.github.com/articles/set-up-git) 说的那样，运行：

```bash
git config --global credential.helper osxkeychain
```

设置默认分支名称为main：
```bash
git config --global init.defaultBranch main
```

配置ssh秘钥：
```bash
ssh-keygen -t rsa -C "your_email@example.com"
```

添加 SSH 公钥到 ssh-agent ：
```bash
eval "$(ssh-agent -s)"
ssh-add -K ~/.ssh/id_rsa
```

添加SSH 公钥到 GitHub 账户：
```bash
pbcopy < ~/.ssh/id_rsa.pub
```

打开 https://github.com/settings/ssh/new，然后添加。



macOS 的 Finder 会在目录下生成一些隐藏文件（如 `.DS_Store`），我们可以使用 GitHub 维护的 macOS `.gitignore` 模板，并让它对当前用户所有的 Git 存储库都生效

```bash
curl https://raw.githubusercontent.com/github/gitignore/master/Global/macOS.gitignore -o ~/.gitignore
# 附加到全局 .gitignore 文件
git config --global core.excludesfile ~/.gitignore
```

## MySQL

安装mysql：

```bash
brew install mysql
```

如果想安装mysql5.7：

```bash
brew install mysql@5.7
```

使用：

```bash
#设置开机启动
brew services start mysql

#启动
mysql.server start

#停止
mysql.server stop
```

使用：

```bash
#登录mysql
mysql -hlocalhost -p3306 -uroot -p123456

#添加远程登录用户
CREATE USER 'test'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'test'@'%';

#查看编码
showvariables like "%char%";

flush privileges;
```

安装 sequel-pro：

```bash
brew install --cask sequel-pro
```

## PostgreSQL

安装：

```bash
brew install postgres
```

查看版本：

```bash
postgres -V
```

使用：

```bash
#启动
pg_ctl -D /usr/local/var/postgres start

#开启启动
brew services start postgresql

#停止
pg_ctl -D /usr/local/var/postgres stop

#重启
pg_ctl -D /usr/local/var/postgres restart
brew services restart postgresql


#启动 PostgreSQL console
psql
```

安装客户端：

```bash
brew install psequel
```

## Java

下载 Oracle JDK：

- [jdk6](http://support.apple.com/downloads/DL1572/en_US/JavaForOSX2013-05.dmg)
- [jdk7](http://download.oracle.com/otn-pub/java/jdk/7u60-b19/jdk-7u60-macosx-x64.dmg)

设置 java_home 为 1.8:

```bash
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 1.8) ' >> ~/.zshrc
```

安装OpenJDK：

```bash
brew install openjdk
```

### SDKMAN

安装：

```bash
 curl -s "https://get.sdkman.io" | bash
```

安装complete：

```bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
```

查看版本：

```bash
sdk version
```

使用：

```bash
#安装jdk
sdk install java

#安装scala
sdk install scala 2.12.1

#卸载
sdk uninstall scala 2.11.6

#查看
sdk list
```

## Maven

安装：

```bash
brew install maven
```

## Node.js

安装node：

```bash
brew install node
```

### nvm

安装nvm：

```bash
brew install nvm
```

使用：

```bash
source ~/.bashrc        # source your bashrc/zshrc to add nvm to PATH
command -v nvm          # check the nvm use message
nvm install node        # install most recent Node stable version
nvm ls                  # list installed Node version
nvm use node            # use stable as current version
nvm ls-remote           # list all the Node versions you can install
nvm alias default node  # set the installed stable version as the default Node
```

### nvs

Linux / macOS 环境通过 Git Clone 对应的项目即可。

```bash
$ export NVS_HOME="$HOME/.nvs"
$ git clone https://github.com/jasongin/nvs --depth=1 "$NVS_HOME"
$ . "$NVS_HOME/nvs.sh" install
```

在国内由于大家都懂的原因，需要把对应的镜像地址修改下：

```bash
$ nvs remote node https://npm.taobao.org/mirrors/node/
$ nvs remote
```

通过以下命令，即可非常简单的安装 Node.js 最新的 LTS 版本。

```bash
# 安装最新的 LTS 版本
$ nvs add lts

# 配置为默认版本
$ nvs link lts
```

安装其他版本：

```bash
# 安装其他版本尝尝鲜
$ nvs add 12

# 查看已安装的版本
$ nvs ls

# 在当前 Shell 切换版本
$ nvs use 12
```

更多指令参见 `nvs --help` 。

## Go

安装：

```bash
brew install go
```

设置环境变量：

```bash
echo "export GOPATH=/something-else" >> ~/.zshrc

echo "export PATH=$PATH:$(go env GOPATH)/bin" >> ~/.zshrc

source ~/.zshrc
```

## Python

安装python3：

```bash
brew install python
```

安装python2.7：

```bash
brew install python@2
```

升级 setuptools：

```bash
pip install --upgrade setuptools
pip install --upgrade pip
```

### pyenv

安装[`pyenv`](https://github.com/yyuu/pyenv)：

```bash
brew install pyenv
```

设置环境变量：

```bash
echo 'eval "$(pyenv init -)"' >> ~/.zshrc
exec $SHELL
```

查看python版本：

```bash
pyenv install --list
```

安装指定版本：

```bash
pyenv install 2.7.12
pyenv install 3.5.2
```

设置全局版本，例如，设置2.7.12 优先级高于3.5.2 ：

```bash
pyenv global 2.7.12 3.5.2
pyenv rehash
```

查看版本优先级：

```bash
pyenv versions
```

### pip

安装：

```bash
curl https://bootstrap.pypa.io/get-pip.py > get-pip.py
sudo python get-pip.py
```

### virtualenv

安装：

```bash
pip install virtualenv
```

使用：

```bash
cd my-project/
virtualenv venv
```

如果想virtualenv继承全局安装的包，可以执行：

```BASH
virtualenv venv --system-site-packages
```

上面命令会创建一个 venv/ 目录，激活配置：

```bash
source venv/bin/activate
```

离开虚拟环境：

```bash
deactivate
```

安装Virtualenvwrapper：

```bash
pip install virtualenvwrapper
```

### Numpy-Scipy

安装[Numpy-Scipy](https://sourabhbajaj.com/mac-setup/Python/numpy.html)：

```bash
python -m pip install --user numpy scipy matplotlib ipython jupyter pandas sympy nose
```

使用 MacPort 安装python3.5：

```bash
sudo port install py35-numpy py35-scipy py35-matplotlib py35-ipython +notebook py35-pandas py35-sympy py35-nose
```

### IPython

安装：

```bash
pip install ipython

pip install 'ipython[zmq,qtconsole,notebook,test]'
```

## 参考文章

- https://sourabhbajaj.com/mac-setup/
