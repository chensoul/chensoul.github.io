---
title: "Mac开发环境配置"
date: 2021-09-09T18:14:34+08:00
slug: "mac-development-environment-setup"
tags: ["macos"]
categories: ["Notes"]
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
  - 标题栏显示完整路径：`defaults write com.apple.finder _FXShowPosixPathInTitle -bool YES; killall Finder`
- 禁用大部分 iCloud 同步
- 键盘 -> 快捷键
  - command + 空格：spotlight  
  - control + 空格：切换输入法

## 安装 XCode

从 App store 或苹果开发者网站安装 [Xcode](https://developer.apple.com/xcode/) ，然后安装 Xcode command line tools：

```bash
xcode-select --install
```

安装完成后，你将可以直接在 terminal 中使用主要的命令，比如：`make, GCC, clang, perl, svn, git, size, strip, strings, libtool, cpp`等等。

如果你想了解 Xcode command line tools 包含多少可用的命令，可以通过下面命令查看：

```bash
ls /Library/Developer/CommandLineTools/usr/bin/
```

## 安装 Homebrew

[Brew](http://brew.sh/) 是 Mac 下面的包管理工具，通过 Github 托管适合 Mac 的编译配置以及 Patch，可以方便的安装开发工具。

打开终端模拟器，开始安装

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

替换 brew.git 源

```bash
git -C "$(brew --repo)" remote set-url origin https://mirrors.cloud.tencent.com/homebrew/brew.git

git -C "$(brew --repo homebrew/core)" remote set-url origin https://mirrors.cloud.tencent.com//homebrew/homebrew-core.git

brew update
```

设置环境变量：

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.bash_profile
```

如果安装了zsh，则是：

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
```

## 通过 brew 安装软件

安装常用命令：

```bash
# hub: a github-specific version of git
# ripgrep: rg is faster than alternatives
# ffmpeg: eventually I'll need this for something
# tree: really handy for listing out directories in text
# bat: A cat(1) clone with syntax highlighting and Git integration.
# delta: A fantastic diff tool
brew install git hub ripgrep ffmpeg tree tmux bat wget vim hugo maven go python3 visual-studio-code	
```

安装常用软件：

```BASH
brew install --cask google-chrome tableplus \
1password telegram iterm2 typora postman switchhosts \
tinypng4mac picgo netnewswire xmind baidunetdisk feishu wechat
```



## 安装 oh-my-zsh

将 brew 安装的 zsh 路径添加到 /etc/shells

```bash
sudo sh -c "echo $(which zsh) >> /etc/shells"
```

更改当前使用的 Shell

```bash
chsh -s $(which zsh)

# 验证当前使用的 Shell
echo $SHELL
```



如果你的 macOS 系统语言是中文，终端里会使用系统语言作为 `locale` 设置，我想要终端里的 Shell 显示语言为英语，可以编辑 zsh 配置文件

```bash
# 编辑 zsh 配置用户
vim ~/.zshrc
# 在开头加入以下配置
export LANG=en_US.UTF-8
```

安装oh-my-zsh：

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

### zsh-z

[zsh-z](https://github.com/agkozak/zsh-z#known-bugs) 快速跳转到经常访问的目录，是 [rupa/z](https://github.com/rupa/z) 的原生 Zshell 端口，具有附加功能

```bash
# 源码安装
git clone https://github.com/agkozak/zsh-z ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-z
# 编辑配置文件
vim ~/.zshrc
# 找到 plugins 字段，加入 zsh-autosuggestions
plugins=(git zsh-z)
# 配置文件生效
source ~/.zshrc
```

### zsh-autosuggestions

[zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions) 可以根据历史记录对输入进行提示和建议

```bash
# 源码安装
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
# 编辑配置文件
vim ~/.zshrc
# 找到 plugins 字段，加入 zsh-autosuggestions
plugins=(git zsh-z zsh-autosuggestions)
# 配置文件生效
source ~/.zshrc
```

### zsh-syntax-highlighting

[zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting) 可以对 Shell 中的命令进行高亮显示

```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

修改 .zshrc ：

```bash
plugins=(git mvn zsh-z zsh-autosuggestions zsh-syntax-highlighting)
```



## 安装 nvs

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



## 安装 sdkman

安装：

```bash
curl -s "https://get.sdkman.io" | bash
```

安装 java8：

```BASH
sdk install java 8.0.382-zulu
```

安装 maven：

```bash
sdk install maven
```

安装 jmeter：

```bash
sdk install jmeter
```

安装 Spring Boot：

```bash
sdk install springboot
```

## dotfile配置

下载 dotfile 文件： 

```bash
git clone git@github.com:chensoul/dotfiles.git
```

拷贝到用户目录：

```bash
cd dotfiles
sh bootstrap.sh
```

