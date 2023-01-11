---
title: "Mac开发环境配置"
date: 2021-09-09T18:14:34+08:00
slug: "mac-development-environment-setup"
tags: ["macos"]
categories: ["tool"]
authors:
  - chenshu
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

## XCode

从 App store 或苹果开发者网站安装 [Xcode](https://developer.apple.com/xcode/) ，然后安装 Xcode command line tools：

```bash
xcode-select --install
```

安装完成后，你将可以直接在 terminal 中使用主要的命令，比如：`make, GCC, clang, perl, svn, git, size, strip, strings, libtool, cpp`等等。

如果你想了解 Xcode command line tools 包含多少可用的命令，可以通过下面命令查看：

```bash
ls /Library/Developer/CommandLineTools/usr/bin/
```

## Homebrew

[Brew](http://brew.sh/) 是 Mac 下面的包管理工具，通过 Github 托管适合 Mac 的编译配置以及 Patch，可以方便的安装开发工具。

Linux也支持Homebrew了，请参考 https://docs.brew.sh/Homebrew-on-Linux。

### 安装

```bash
/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

替换brew.git
```bash
git -C "$(brew --repo)" remote set-url origin https://mirrors.cloud.tencent.com/homebrew/brew.git 
git -C "$(brew --repo homebrew/core)" remote set-url origin https://mirrors.cloud.tencent.com//homebrew/homebrew-core.git brew update
```

设置环境变量：
```bash
echo 'PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
```

如果安装了zsh，则是：
```bash
echo 'PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
```

### Cask

[Brew cask](https://github.com/phinze/homebrew-cask) 是类似 Brew 的管理工具， 直接提供 dmg 级别的二进制包，（Brew 是不带源码，只有对应项目所在的 URL）。我们可以通过 Homebrew Cask 优雅、简单、快速的安装和管理 OS X 图形界面程序，比如 Google Chrome 和 Dropbox。

Brew cask 安装：
```bash
brew tap phinze/homebrew-cask
```

可以通过 Brew cask 安装的软件有：

- QQ
- qqmusic
- google-chrome 
- virtualbox 
- vagrant 
- iterm2 
- the-unarchiver  
- switchhosts 
- aerial 
- fliqlo

## iTerm2

安装：
```bash
brew install --cask iterm2
```

设置：
- Preferences --> Profiles--> Default --> Terminal：设置 cursor 颜色为黄色
- Preferences --> Profiles --> Window --> Transparency：设置透明度 10%~20% 即可，太高会和桌面背景冲突。如果需要临时禁用透明度可以使用快捷键 ⌘+u。

### Zsh

安装：
```bash
brew install zsh
```

**安装Oh My Zsh：**

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

设置zsh为默认：

```bash
sudo sh -c "echo $(which zsh) >> /etc/shells"  
chsh -s $(which zsh)
```

bash切换到zsh

```bash
chsh -s /bin/zsh
```

使设置生效：

```bash
source ~/.zshrc
```

**安装[Oh My Zsh 插件](https://github.com/robbyrussell/oh-my-zsh/wiki/Plugins)**，修改 .zshrc ：

```bash
plugins=(git mvn colorize encode64 urltools wd last-working-dir sublime vagrant Z zsh-syntax-highlighting brew osx)
```

安装 zsh-syntax-highlighting：
```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

安装 zsh-autosuggestions：
```bash
git clone https://github.com/zsh-users/zsh-autosuggestions $ZSH_CUSTOM/plugins/zsh-autosuggestions
```

安装git-open
```bash
git clone https://github.com/paulirish/git-open.git $ZSH_CUSTOM/plugins/git-open
```

修改主题，更多主题参考 [Oh My Zsh Wiki](https://github.com/robbyrussell/oh-my-zsh/wiki/themes)：

```bash
ZSH_THEME=pygmalion
```

### tree

安装：
```bash
brew install tree
```

### fzf

安装 fzf：
```bash
brew install fzf
```

fzf用法：
- 1、切换到指定目录

```bash
# fd - cd to selected directory
fd() {
  local dir
  dir=$(find ${1:-.} -path '*/\.*' -prune \
                  -o -type d -print 2> /dev/null | fzf +m) &&
  cd "$dir"
}
```

- 2、查看历史命令，并且执行选中的命令

```bash
# fh - search in your command history and execute selected command
fh() {
  eval $( ([ -n "$ZSH_NAME" ] && fc -l 1 || history) | fzf +s --tac | sed 's/ *[0-9]* *//')
}
```

- 3、查看Chrome历史

> 提示：查看 [blog post](https://junegunn.kr/2015/04/browsing-chrome-history-with-fzf/)。

```bash
# ch - browse chrome history
ch() {
  local cols sep
  cols=$(( COLUMNS / 3 ))
  sep='{::}'

  cp -f ~/Library/Application\ Support/Google/Chrome/Default/History /tmp/h

  sqlite3 -separator $sep /tmp/h \
    "select substr(title, 1, $cols), url
     from urls order by last_visit_time desc" |
  awk -F $sep '{printf "%-'$cols's  \x1b[36m%s\x1b[m\n", $1, $2}' |
  fzf --ansi --multi | sed 's#.*\(https*://\)#\1#' | xargs open
}
```

注意：
- 请确认Chrome的历史记录的地址是正确的。
- 更多说明，参考 [StackOverflow](https://stackoverflow.com/a/16742333/1564365)。

fzf更多用法，参考  **[official repo](https://github.com/junegunn/fzf#fuzzy-completion-for-bash-and-zsh)**。

### ack

安装：
```bash
brew install ack
```

搜索 js 文件：
```bash
ack --js pancakes
```

搜索不包含 brew 的文件：
```bash
ack -L brew
```

排序：
```bash
--sort-files
```

结果高亮显示：
```bash
--sort-files
```

自定义类型：
```bash
--type-set=markdown=.md,.mkd,.markdown
```

查看ack配置：
```bash
ack --dump
```

## Git

### 安装和配置

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

## Bash Completion

安装：
```bash
brew install bash-completion
```

查看更多 completion ：
```bash
$ brew search completion
```

然后，安装，例如：
```bash
brew install docker-completion
```

## Vim

安装：
```bash
brew install vim
```

### vimrc

下载 [The Ultimate vimrc](https://github.com/amix/vimrc)：
```bash
git clone https://github.com/amix/vimrc.git ~/.vim_runtime
```

安装 complete 版本：
```bash
sh ~/.vim_runtime/install_awesome_vimrc.sh
```

安装 bash 版本：
```bash
sh ~/.vim_runtime/install_basic_vimrc.sh
```

更新 vimrc ：
```bash
cd ~/.vim_runtime && git pull --rebase && cd -
```

### Maximum Awesome

安装[Maximum Awesome](https://github.com/square/maximum-awesome)：

```bash
git clone https://github.com/square/maximum-awesome.git

cd maximum-awesome
rake
```

## Visual Studio Code

安装：
```bash
brew install --cask visual-studio-code
```

从命令行启动vscode：
- 启动vscode，输入 **Command Palette** (Cmd+Shift+P)，查找 **Shell Command: Install 'code' command in PATH**
- 重启 vscode 使环境变量生效
- 在命令行输入 `code .`，在当前目录启动 vscode，也可以这样打开文件 `code myfile.txt`

安装扩展：
- JavaScript
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- SQL
  - [PostgreSQL formatter](https://marketplace.visualstudio.com/items?itemName=bradymholt.pgformatter)
- Markdown
  - [Markdown Preview](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced)
- GitLens
  - [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- Docker
  - [Docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)
- JSON
  - [Paste JSON as Code](https://marketplace.visualstudio.com/items?itemName=quicktype.quicktype)
- Live Server
  - [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
- VS Code Icons
  - [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons)

## JetBrains IDEs

下载地址：https://www.jetbrains.com/products.html?fromMenu#type=ide

破解插件：https://github.com/osvax/ide-eval-resetter

## Vagrant

安装：
```bash
brew install --cask virtualbox
brew install --cask vagrant
brew install --cask vagrant-manager
```

使用：
```bash
vagrant box add precise64 https://vagrantcloud.com/hashicorp/boxes/precise64/versions/1.1.0/providers/virtualbox.box
vagrant init precise64
vagrant up
vagrant ssh
vagrant halt
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

## Heroku

安装：

```bash
brew install heroku/brew/heroku
```

配置：

```bash
heroku login

mkdir ~/.ssh
ssh-keygen -t rsa

heroku keys:add

```

使用：

```bash
$ cd myapp/

# Create the app on Heroku
$ heroku create myapp

# Deploy it
$ git push heroku master

# Check its status
$ heroku ps

# Check the logs
$ heroku logs -t
```

## 其他应用

### 开发工具

- [Google Chrome](https://www.google.com/intl/en/chrome/browser/)
- [1Password](https://agilebits.com/onepassword)：密码
- [Unarchiver](http://wakaba.c3.cx/s/apps/unarchiver.html)：解压缩软件
- 百度云网盘
- 搜狗输入法
- Typora
- 飞书
- xmind
- PostMan
- 语雀
- TablePlus
- V2rayU
- Staruml
- PicGo
- Sublime Text

## 参考文章

- https://sourabhbajaj.com/mac-setup/
