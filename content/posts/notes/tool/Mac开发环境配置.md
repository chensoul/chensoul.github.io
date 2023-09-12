---
title: "Mac开发环境配置"
date: 2021-09-09T18:14:34+08:00
slug: "mac-development-environment-setup"
tags: ["macos"]
categories: ["Notes"]
---

这是我的第一篇文章，作为程序员，首先要做得第一件事情，就是配置好开发环境，因为我使用的是Mac开发环境，所以，这篇文章主要是基于Mac操作系统，记录开发环境搭建过程。

## 系统设置

### 实用命令

1. **取消 4 位数密码限制**

```bash
sudo pwpolicy -clearaccountpolicies
```

1. **允许安装任意来源的 App**

```bash
sudo spctl --master-disable
```

1. **xcode 命令行工具**

```bash
xcode-select --install
```

1. **程序坞自动隐藏加速**

```bash
# 设置启动坞动画时间设置为 0.5 秒 
defaults write com.apple.dock autohide-time-modifier -float 0.5 && killall Dock

# 设置启动坞响应时间最短
defaults write com.apple.dock autohide-delay -int 0 && killall Dock

# 恢复启动坞默认动画时间
defaults delete com.apple.dock autohide-time-modifier && killall Dock

# 恢复默认启动坞响应时间
defaults delete com.apple.Dock autohide-delay && killall Dock
```

1. **启动台自定义行和列**

```bash
# 设置列数
defaults write com.apple.dock springboard-columns -int 7

# 设置行数
defaults write com.apple.dock springboard-rows -int 6

# 重启 Dock 生效
killall Dock

# 恢复默认的列数和行数
defaults write com.apple.dock springboard-rows Default
defaults write com.apple.dock springboard-columns Default

# 重启 Dock 生效
killall Dock
```

### dotfile配置

下载 dotfile 文件： 

```bash
git clone git@github.com:chensoul/snippets.git
```

拷贝到用户目录：

```bash
cd dotfiles
sh bootstrap.sh
```



## 软件设置

### 安装 Homebrew

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

### 通过 brew 安装软件

安装常用命令：

```bash
# hub: a github-specific version of git
# ripgrep: rg is faster than alternatives
# ffmpeg: eventually I'll need this for something
# tree: really handy for listing out directories in text
# bat: A cat(1) clone with syntax highlighting and Git integration.
# delta: A fantastic diff tool
# neofetch、fastfetch: 查看系统配置
brew install git hub ripgrep ffmpeg tree tmux bat wget vim hugo maven go python3 visual-studio-code neofetch fastfetch	
```

安装常用软件：

```BASH
brew install --cask google-chrome tableplus \
1password telegram iterm2 typora postman switchhosts \
tinypng4mac picgo netnewswire xmind baidunetdisk feishu wechat
```



### Oh-my-zsh

安装oh-my-zsh：

```bash
# 通过 cURL 安装
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

oh-my-zsh 的默认主题是 `robbyrussell`，修改为 "pygmalion"

```bash
# 编辑配置文件
vim ~/.zshrc
ZSH_THEME="pygmalion"

# 使配置文件生效
source ~/.zshrc
```

接下来安装几个 插件：

```bash
# 目录切换神器
➜ brew install autojump

# 快速跳转到经常访问的目录
git clone https://github.com/agkozak/zsh-z ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-z

# 自动建议提示接下来可能要输入的命令
git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions

# 命令语法检测
git clone https://github.com/zsh-users/zsh-syntax-highlighting $ZSH_CUSTOM/plugins/zsh-syntax-highlighting
```

在 `~/.zshrc` 中配置启用这些插件：

```bash
plugins=(git mvn zsh-z zsh-autosuggestions zsh-syntax-highlighting)
```

其他功能配置：

```bash
# 关掉 URL 反斜杠转义
echo "DISABLE_MAGIC_FUNCTIONS=true" >> ~/.zshrc

# 禁用 on my zsh 自动更新
echo " zstyle ':omz:update' mode disabled" >> ~/.zshrc
```

### MySQL

安装 MySQL：

```BASH
# 搜索可以安装的版本
➜ brew search mysql

# 安装对应的版本
➜ brew install mysql@5.7

# 写入环境变量
echo 'export PATH="/opt/homebrew/opt/mysql@5.7/bin:$PATH"' >> ~/.zshrc

# 为了让编译器找到 mysql@5.7 还需要写入
echo 'export LDFLAGS="-L/opt/homebrew/opt/mysql@5.7/lib"' >> ~/.zshrc
echo 'export CPPFLAGS="-I/opt/homebrew/opt/mysql@5.7/include"' >> ~/.zshrc

# 为了让 pkg-config 找到 mysql@5.7 还需要写入
echo 'PKG_CONFIG_PATH="/opt/homebrew/opt/mysql@5.7/lib/pkgconfig"' >> ~/.zshrc
```

MySQL 服务相关：

```BASH
# 查看 MySQL 服务状态
➜ brew services info mysql@5.7
➜ mysql.server status

# 启动 MySQL 服务
➜ brew services start mysql@5.7
➜ mysql.server start

# 重启 MySQL 服务
➜ brew services restart mysql@5.7
➜ mysql.server restart

# 停止 MySQL 服务
➜ brew services stop mysql@5.7
➜ mysql.server stop
```

接着初始化 MySQL 设置，主要配置一下 root 密码已经是否远程登录登，根据提示来操作就行了：

```BASH
mysql_secure_installation
```

数据库外连，这是个可选操作 根据自己的实际情况自行决定是否开启（有被攻击的风险）：

```SQL
mysql > grant all on *.* to root@'%' identified by '你设置的密码' with grant option;
mysql > flush privileges;
```

### Redis

```BASH
# 安装 redis
➜ brew install redis

# 查看 redis 服务状态
➜ brew services info redis

# 启动 redis 服务端
➜ brew services start redis

# 启动 redis 客户端
➜ redis-cli

# 编辑默认配置文件
➜ sudo vim /opt/homebrew/etc/redis.conf
```

### NVS

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

### OrbStack

[OrbStack](https://orbstack.dev/) 是一种在 macOS 上运行 Docker 容器和 Linux 机器的快速、轻便且简单的方法。可以将其视为强大的 WSL 和 Docker Desktop 替代方案，全部集成在一个易于使用的应用程序中。

```BASH
# Homebrew Cask 安装更优雅一点
➜ brew install orbstack
```

Docker 的一些镜像国内拉取很慢，我们可以配置一下一些国内的加速源：

```json
{
    "ipv6": true,
  	"registry-mirrors": [
    	"http://hub-mirror.c.163.com",
    	"https://registry.docker-cn.com",
    	"https://mirror.baidubce.com",
    	"https://kn77wnbv.mirror.aliyuncs.com",
    	"https://y0qd3iq.mirror.aliyuncs.com",
    	"https://6kx4zyno.mirror.aliyuncs.com",
    	"https://0dj0t5fb.mirror.aliyuncs.com",
    	"https://docker.nju.edu.cn",
    	"https://kuamavit.mirror.aliyuncs.com",
    	"https://y0qd3iq.mirror.aliyuncs.com",
    	"https://docker.mirrors.ustc.edu.cn"
  ]
}
```

### sdkman

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

