---
categories: [devops]
date: 2025-08-24 00:00:00 +0000 UTC
lastmod: 2025-08-24 00:00:00 +0000 UTC
publishdate: 2025-08-24 00:00:00 +0000 UTC
slug: my-development-setup-2025
tags: [macos]
title: 我的 2025 年开发设置
---

经过多年的调整和优化，我最终确定了一套既能最大程度提升效率又能提升乐趣的开发配置。以下是我在 2025 年会使用的配置，希望能为其他开发者提供一些参考。

## 硬件

### 主机

**MacBook Pro 13 英寸 (M1, 2020)**

- 16GB 统一内存
- 256GB SSD 存储
- 8 核 CPU，8 核 GPU
- **选择理由**：M1 芯片的能效比出色，续航时间长，对于日常开发工作完全够用，性价比很高

## 软件堆栈

### 终端与 Shell

**终端**：[Ghostty](https://ghostty.org/)
- 基于 GPU 加速的现代终端模拟器
- 启动速度极快，内存占用低
- 原生 macOS 集成，支持 Metal 渲染
- 配置简单，性能优异
- **选择理由**：相比 iTerm2 更快更轻量，相比 Alacritty 配置更简单

**Shell**：Zsh + Oh My Zsh

- 强大的自动补全功能
- 丰富的插件生态系统
- 主题定制化程度高
- 推荐插件：`git`, `zsh-autosuggestions`, `zsh-syntax-highlighting`

安装 Oh My Zsh 和 插件：

```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting
source ~/.zshrc
```

`.zshrc` 配置：

```bash
# Oh My Zsh 配置
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="muse" #random

# 插件
plugins=(
    git
    mvn
    zsh-autosuggestions
    zsh-syntax-highlighting
    docker
    kubectl
)

source $ZSH/oh-my-zsh.sh

# 加载 SDKMAN
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"

# 自定义环境变量
export EDITOR=vim
export LANG=en_US.UTF-8

# 开发工具路径
export JAVA_HOME="$HOME/.sdkman/candidates/java/current"
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

# 加载 fnm
eval "$(fnm env --use-on-cd)"
```

### 代码编辑器

**主要编辑器**：**IntelliJ IDEA Ultimate**

**必备插件**：
- **.ignore** - Git 忽略文件管理
- **GitToolBox** - Git 集成增强，显示 blame 信息
- **Rainbow Brackets** - 彩色括号匹配，提高代码可读性
- **String Manipulation** - 字符串处理工具集
- **Key Promoter X** - 快捷键学习助手
- **Lombok** - Java 代码简化
- **SonarLint** - 实时代码质量检查
- **Atom Material Icons** - 主题
- **Mermaid** - Mermaid 图
- **Switch2Cursor** 

**常用快捷键**：

- 格式化代码：`⌥ + ⌘ + L`
- 组织导入：`⌃ + ⌥ + O`
- 移动代码：`⌃ + ⌘ + ↑/↓`
- 展开/折叠方法：`⌘ + +/-`
- 扩展选择：`⌥ + ↑`
- 缩小选择：`⌥ + ↓`
- 提取到变量：`⌘ + ⌥ + V`
- 提取到方法：`⌘ + ⌥ + M`
- 文件结构：`⌘ + F12`
- 最近文件：`⌘ + E`
- 全局搜索：`⌘ + ⇧ + F`

**备用编辑器**：
- **Cursor** - AI 驱动的代码编辑器，适合快速原型开发
- **Trae**
- **Augment**
- **Qoder**

### 浏览器与扩展

**主浏览器**：Google Chrome

**必备扩展**：

- **1Password** - 密码管理，安全便捷
- **uBlock Origin** - 广告拦截，提升浏览体验
- **JSON Viewer** - JSON 格式化和高亮
- **Wappalyzer** - 技术栈识别
- **Postman Interceptor** - API 测试辅助

### 版本控制

**Git 配置**

我使用条件配置来区分个人和工作项目：

`.gitconfig`：
```toml
[core]
  editor = vim
  pager = cat
  autocrlf = true
  eol = lf
  safecrlf = false

[alias]
  st = status
  di = diff
  co = checkout
  ci = commit
  cl = clone
  cp = cherry-pick
  br = branch
  last = log -1 HEAD
  unstage = reset HEAD --
  # 美化日志显示
  lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

[rebase]
  autosquash = true
[init]
  defaultBranch = main
[pull]
  ff = only
[rerere]
  enabled = true
[http]
  postBuffer = 5242880000
[http "https://github.com"]
  proxy = socks5://127.0.0.1:7890
[https "https://github.com"]
  proxy = socks5://127.0.0.1:7890
[credential]
  helper = osxkeychain

# 条件配置：根据目录自动切换用户信息
[includeIf "gitdir:~/development/personal/"]
  path = .gitconfig-personal
[includeIf "gitdir:~/development/work/"]
  path = .gitconfig-work
```

`.gitconfig-personal`：
```toml
[user]
  name = chensoul
  email = ichensoul@gmail.com
```

`.gitconfig-work`：
```toml
[user]
  name = chensoul
  email = work@company.com
```

**常用 Git 技巧**：

```bash
# 清空提交历史（谨慎使用）
DEFAULT=main
git checkout --orphan latest_branch
git add -A
git commit -am "refactor: init"
git branch -D $DEFAULT
git branch -m $DEFAULT
git push -f origin $DEFAULT

# 批量修改提交历史的用户信息
brew install git-filter-repo
git-filter-repo --email-callback 'return email.replace(b"old@email.com", b"new@email.com")' --force

# 交互式 rebase 最近 3 次提交
git rebase -i HEAD~3

# 暂存部分文件内容
git add -p

# 查看文件修改历史
git log -p filename
```

### 云存储与同步

**主要云盘**：
- **阿里云盘** - 大文件存储，速度快
- **百度云盘** - 大文件存储，速度快
- **iCloud Drive** - 系统集成度高，文档同步
- **GitHub** - 代码和配置文件版本控制

## 开发工具

### 语言和运行时

**Java 开发环境**

使用 SDKMAN 管理 Java 版本和相关工具：

```bash
# 安装 SDKMAN
brew install sdkman/tap/sdkman-cli
source "$HOME/.sdkman/bin/sdkman-init.sh"

# 安装 Java 和构建工具
sdk install java 21.0.1-tem
sdk install maven
sdk install mvnd  # Maven Daemon，更快的构建
sdk install gradle
sdk install springboot
```

**Go 开发环境**

```bash
# 通过 Homebrew 安装
brew install go

# 设置 Go 环境变量
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin

# 安装常用工具
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
go install golang.org/x/tools/cmd/goimports@latest
go install github.com/air-verse/air@latest  # 热重载工具
```

**Node.js 开发环境**

使用 fnm (Fast Node Manager) 管理 Node.js 版本：

```bash
# 安装 fnm
brew install fnm

# 安装和使用 LTS 版本
fnm install --lts
fnm use lts-latest
fnm default lts-latest

# 全局包
npm install -g typescript
npm install -g @vercel/ncc
npm install -g prettier
npm install -g eslint
npm install -g pnpm  # 更快的包管理器
```

**Python 开发环境**

```bash
# 通过 Homebrew 安装 Python
brew install python@3.12

# 安装 pipx 用于全局工具
brew install pipx

# 安装常用工具
pipx install poetry  # 依赖管理
pipx install black   # 代码格式化
pipx install ruff    # 快速 linter
```

### 容器与编排

**OrbStack** - Docker Desktop 的现代替代品
- 更快的启动速度和更低的资源占用
- 原生 macOS 集成
- 支持 Linux 虚拟机
- **选择理由**：比 Docker Desktop 更轻量，性能更好

**Kubernetes 工具**

```bash
# 安装 kubectl 和相关工具
brew install kubectl
brew install kubectx  # 快速切换 context
brew install k9s     # 终端 UI 管理工具
brew install helm    # 包管理器

# 有用的别名
alias k="kubectl"
alias kgp="kubectl get pods"
alias kgs="kubectl get services"
alias kgd="kubectl get deployments"
alias kctx="kubectx"  # 切换集群
alias kns="kubens"    # 切换命名空间
```

### 数据库工具

**TablePlus** - 现代数据库客户端
- 支持多种数据库：MySQL, PostgreSQL, SQLite, Redis 等
- 美观的界面和优秀的用户体验
- 强大的查询编辑器和数据可视化
- 支持 SSH 隧道和 SSL 连接

**Redis 管理**：
- **RedisInsight** - Redis 官方 GUI 工具
- **Medis** - 轻量级 Redis 客户端

### API 开发与测试

**Insomnia** - REST/GraphQL 客户端
- 简洁的界面设计
- 强大的环境变量管理
- 支持 GraphQL 查询
- 团队协作功能

**HTTPie** - 命令行 HTTP 客户端
```bash
brew install httpie

# 使用示例
http GET https://api.github.com/user Authorization:"token YOUR_TOKEN"
http POST https://api.example.com/data name="John" age:=30
```

### 现代开发工具

**Raycast** - 启动器和生产力工具
- 替代 Spotlight 的强大启动器
- 丰富的插件生态系统
- 快速访问常用功能和信息
- **推荐插件**：GitHub、Jira、Brew、System Monitor

**Fig** - 终端自动补全
- 智能命令行补全
- 可视化参数提示
- 支持 500+ CLI 工具
- **注意**：已被 AWS 收购，功能整合中

### 安全与隐私工具

**1Password** - 密码管理器
- 强密码生成和存储
- 多设备同步
- 浏览器集成
- SSH 密钥管理

**SwitchHosts** - Hosts 文件管理
- 快速切换不同的 hosts 配置
- 支持远程 hosts 文件
- 适合开发环境切换

### 监控与调试工具

**Activity Monitor** - 系统监控
- 查看 CPU、内存、网络使用情况
- 进程管理

**Console** - 系统日志查看
- 实时查看系统和应用日志
- 调试应用问题

**Network Link Conditioner** - 网络模拟
- 模拟不同网络条件
- 测试应用在弱网环境下的表现

## 生产力工具

### 笔记记录与文档

**Typora** - Markdown 编辑器
- 所见即所得的 Markdown 编辑
- 支持数学公式、图表
- 主题丰富，导出格式多样
- **选择理由**：最优雅的 Markdown 编辑体验

**Apple Notes** - 快速记录
- 系统原生，同步快速
- 支持手写、绘图
- 适合临时想法记录

**GitHub/GitLab** - 代码文档
- README 文档
- Wiki 页面
- Issue 和 PR 讨论

### 常用 Alias 命令

```bash
alias c='clear'
alias h='history'
alias f='open -a Finder ./'                 
alias p='cd ~/chensoul/Projects/'
alias s='source'
alias my='sudo chown -R `id -u`'
alias path='echo -e ${PATH//:/\\n}'         
alias ll='ls -la'

alias .='pwd'
alias ..='cd ../..'
alias ...='cd ../../../'
alias ....='cd ../../../../'
alias ~="cd ~"                             
alias dl="cd ~/Downloads"
alias dt="cd ~/Desktop"

alias publicip="dig +short myip.opendns.com @resolver1.opendns.com" 
alias localip="ipconfig getifaddr en0"
alias ifactive="ifconfig | pcregrep -M -o '^[^\t:]+:([^\n]|\n\t)*status: active'" 
alias delTrash="find . \( -name target -o -name .DS_Store -o -name build  -o -name node_modules \) -type d  -ls -delete"
alias update='sudo softwareupdate -i -a; brew update; brew upgrade; brew cleanup;'
alias pullcode='for dir in */; do if [[ -d "$dir/.git" ]]; then echo "Entering directory: $dir"; cd "$dir"; git pull; cd ..; fi; done'
alias tree="find . -print | sed -e 's;[^/]*/;|____;g;s;____|; |;g'"
alias listnm="find . -name "node_modules" -type d -prune -print | xargs du -chs"

### Git
alias git_current_branch="git symbolic-ref -q HEAD | sed -e 's|^refs/heads/||'"
alias gaa='git add -A'
alias gs='git status'
alias gst='git status'
alias gcm='git commit -m'
alias gcl='git clone'
alias gp='git pull'
alias gg='git push origin "$(git_current_branch)"'
alias gfwork='for dir in */; do if [[ -d "$dir/.git" ]]; then cd "$dir" && git config user.name "$WORK_USER" && git config user.email "$WORK_EMAIL" && echo "✅ 配置成功: $dir" || echo "❌ 配置失败: $dir"; cd - >/dev/null; fi; done'

### DEVELOPMENT
alias mw='./mvnw'
alias mwcv='./mvnw clean verify'

alias yi='yarn install'
alias ys='yarn start'

alias d="docker"
alias dc="docker compose"
alias dclean="docker ps -aq --no-trunc -f status=exited | xargs docker rm"
alias dstop="docker ps -aq | xargs docker stop"
# delete docker images by created date
#docker image prune -a --force --filter "until=7h"

#search docker images by name
#docker images | awk '/^spring/ {print $0}'

#delete docker images by name
#docker images | awk '/^chensoul/ {print $3}' | xargs docker rmi

alias hg='hogo server && open http://localhost:1313/'

#k8s
alias k='kubectl'
alias kget='k get all'
alias klogs='k logs'

alias mk='minikube'
alias mkdb='mk dashboard'

### function
function mkd() { mkdir -p "$@" && cd "$_"; }     
function killport() { lsof -i tcp:"$*" | awk 'NR!=1 {print $2}' | xargs kill -9 ;}

# https://github.com/thanhdevapp/jetbrains-reset-trial-evaluation-mac/blob/master/runme.sh
function clean_idea(){
  rm -rf /Applications/IntelliJ\ IDEA.app
  rm -rf ~/Library/Application\ Support/JetBrains/
  rm -rf ~/Library/Preferences/com.apple.java.util.prefs.plist
  rm -rf ~/Library/Preferences/com.jetbrains*
  rm -rf ~/Library/Preferences/jetbrains*
  rm -rf ~/Library/Caches/JetBrains
  rm -rf ~/Library/Logs/JetBrains/
  rm -rf ~/Library/Saved\ Application\ State/com.jetbrains.intellij.savedState/
  rm -rf ~/.cache/JetBrains/
  rm -rf ~/.config
  # Flush preference cache
  killall cfprefsd
}

function maintenance(){
  echo "🧹 开始系统维护..."

  echo "📦 更新 Homebrew..."
  brew update && brew upgrade && brew cleanup
  
  echo "🗑️ 清理系统缓存..."
  sudo rm -rf /System/Library/Caches/* /Library/Caches/*  ~/Library/Caches/*
  sudo npm cache clean --force 2>/dev/null || true
  sudo yarn cache clean 2>/dev/null || true
  sudo go clean -cache 2>/dev/null || true
  
  echo "🔍 重建 Spotlight 索引..."
  sudo mdutil -E /
  
  echo "✅ 系统维护完成！"
}
```

### 软件管理

**Homebrew** - macOS 包管理器

安装 Homebrew：
```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 配置环境变量（Apple Silicon Mac）
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

使用 Brewfile 管理软件包：

```ruby
tap "homebrew/bundle"
tap "homebrew/services", "https://mirrors.ustc.edu.cn/homebrew-services.git"

# 开发工具
brew "git"
brew "vim"
brew "curl"
brew "wget"
brew "jq"
brew "gh"
brew "go-task"  #taskfile
brew "tree"
brew "htop"
brew "fastfetch"
brew "fnm"  # node 版本管理
brew "uv"
brew "ollama"
brew "pandoc"
brew "pipx"
brew "pnpm"
brew "pyenv"
brew "sdkman/tap/sdkman-cli"
brew "spring-io/tap/spring-boot"

# 语言和运行时
brew "go"
brew "python@3.12"
brew "rustup"
# Java 通过 SDKMAN 管理，不在这里安装

# 容器和云工具
brew "kubectl"
brew "kubectx"
brew "k9s"
brew "helm"
brew "docker"

# 网络工具
brew "httpie"
brew "nmap"

# 文件处理
brew "rename"
brew "findutils"
brew "coreutils"
brew "moreutils"

# GUI 应用
cask "1password"
cask "google-chrome"
cask "insomnia"
cask "intellij-idea"
cask "orbstack"
cask "switchhosts"
cask "typora"
cask "ghostty"
cask "tinypng4mac"
cask "picgo"

# 通讯和办公
cask "wechat"
cask "feishu"

# 云存储
brew "aliyunpan"
cask "baidunetdisk"
```

批量安装：
```bash
# 安装所有软件包
brew bundle

# 更新所有软件包
brew update && brew upgrade && brew cleanup
```

**SDKMAN** - Java 生态工具管理

- 管理多个 Java 版本
- 安装 Maven、Gradle、Spring Boot CLI 等工具
- 简单的版本切换

**App Store 应用管理**：

```bash
# 安装 mas (Mac App Store CLI)
brew install mas

# 列出已安装的应用
mas list

# 搜索应用
mas search "Xcode"

# 安装应用
mas install 497799835  # Xcode
```

### 代码组织

```bash
~/development/
├── personal/           # Personal projects
├── work/              # Work-related projects
├── learning/          # Tutorials and experiments
├── tools/             # Custom scripts and utilities
└── archived/          # Completed/deprecated projects
```

### 环境配置

**SSH 配置**

生成和配置 SSH 密钥：
```bash
# 生成 SSH 密钥（推荐使用 ed25519）
ssh-keygen -t ed25519 -C "ichensoul@gmail.com"

# 添加到 SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 复制公钥到剪贴板
pbcopy < ~/.ssh/id_ed25519.pub
```

SSH 配置文件 `~/.ssh/config`：

```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    UseKeychain yes
    AddKeysToAgent yes

Host gitlab.com
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    UseKeychain yes
    AddKeysToAgent yes
```

### 备份策略

**多层备份方案**：

1. **代码和配置**：
   - Git 仓库托管在 GitHub/GitLab
   - dotfiles 仓库管理配置文件
   - 定期推送到远程仓库

2. **文档和项目文件**：
   - iCloud Drive 实时同步
   - Time Machine 本地备份
   - 重要文件额外备份到外部存储

3. **系统备份**：
   - Time Machine 每小时自动备份
   - 每月创建系统快照
   - 重要软件列表（Brewfile）版本控制

4. **数据库和配置**：
   - 数据库定期导出
   - 应用配置文件备份
   - SSH 密钥和证书安全存储

## 性能优化

### macOS 系统优化

**基础性能调整**：
```bash
# 设置计算机名称
sudo scutil --set ComputerName "chensoul-mac"
sudo scutil --set HostName "chensoul-mac"
sudo scutil --set LocalHostName "chensoul-mac"

# 设置时区
sudo systemsetup -settimezone "Asia/Shanghai"

# 取消 4 位数密码限制
sudo pwpolicy -clearaccountpolicies

# 允许安装任意来源的应用
sudo spctl --master-disable

# 加快键盘重复速度
defaults write NSGlobalDomain KeyRepeat -int 1
defaults write NSGlobalDomain InitialKeyRepeat -int 10

# 显示滚动条
defaults write NSGlobalDomain AppleShowScrollBars -string "WhenScrolling"

# 禁用不必要的动画
defaults write com.apple.dock launchanim -bool false
defaults write NSGlobalDomain NSAutomaticWindowAnimationsEnabled -bool false
defaults write com.apple.dock expose-animation-duration -float 0.1

# 加快 Mission Control 动画
defaults write com.apple.dock expose-animation-duration -float 0.1

# 禁用窗口缩放动画
defaults write NSGlobalDomain NSAutomaticWindowAnimationsEnabled -bool false

# 加快对话框显示速度
defaults write NSGlobalDomain NSWindowResizeTime -float 0.001

# 重启相关服务
killall Dock
killall Finder
```

**Finder 优化**：
```bash
# 显示隐藏文件
defaults write com.apple.finder AppleShowAllFiles -bool true

# 显示文件扩展名
defaults write NSGlobalDomain AppleShowAllExtensions -bool true

# 显示路径栏
defaults write com.apple.finder ShowPathbar -bool true

# 显示状态栏
defaults write com.apple.finder ShowStatusBar -bool true

# 默认搜索当前文件夹
defaults write com.apple.finder FXDefaultSearchScope -string "SCcf"

# 禁用创建 .DS_Store 文件
defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool true
defaults write com.apple.desktopservices DSDontWriteUSBStores -bool true
```

### 开发环境优化

**Git 性能优化**：
```bash
# 启用文件系统缓存
git config --global core.fscache true

# 启用预加载索引
git config --global core.preloadindex true

# 设置自动垃圾回收
git config --global gc.auto 256

# 启用并行处理
git config --global core.parallel 8

# 优化网络传输
git config --global http.postBuffer 524288000
```

**Node.js 性能优化**：
```bash
# 增加内存限制
export NODE_OPTIONS="--max-old-space-size=8192"

# 启用 V8 优化
export NODE_OPTIONS="$NODE_OPTIONS --optimize-for-size"
```

**Java 性能优化**：
```bash
# JVM 参数优化
export JAVA_OPTS="-Xms1g -Xmx1g -XX:+UseG1GC -XX:+UseStringDeduplication"

# Maven 性能优化
export MAVEN_OPTS="-Xms1g -Xmx4g -XX:+TieredCompilation -XX:TieredStopAtLevel=1"
```

**文件监控限制调整**：
```bash
# 增加文件监控限制（适用于大型项目）
echo kern.maxfiles=65536 | sudo tee -a /etc/sysctl.conf
echo kern.maxfilesperproc=65536 | sudo tee -a /etc/sysctl.conf
```

## 工作流程

### 日常开发流程

1. **项目启动**：
   - 使用 `code .` 或 `idea .` 打开项目
   - 检查 Git 状态和分支
   - 启动必要的服务（数据库、Redis 等）

2. **开发过程**：
   - 使用 Git Flow 进行分支管理
   - 频繁提交，清晰的提交信息
   - 定期推送到远程仓库

3. **测试和部署**：
   - 本地测试通过后创建 PR
   - CI/CD 自动化测试和部署
   - 代码审查和合并

### 学习和实验

**学习新技术的流程**：
1. 在 `~/development/learning/` 创建实验项目
2. 使用 Docker 隔离环境
3. 记录学习笔记
4. 整理成博客文章发布

## 结论

这套开发设置是经过多年实践和不断优化的结果，重点关注以下几个方面：

### 核心原则

1. **效率优先**：选择能显著提升开发效率的工具
2. **稳定可靠**：优先选择成熟稳定的解决方案
3. **可维护性**：配置文件版本控制，便于迁移和恢复
4. **自动化**：尽可能自动化重复性任务
5. **持续改进**：定期评估和更新工具链

### 关键收获

- **工具选择**：不追求最新，而是选择最适合的
- **配置管理**：所有配置文件都应该版本控制
- **备份策略**：多层备份，确保数据安全
- **性能优化**：系统级和应用级的双重优化
- **工作流程**：标准化的开发流程提高团队协作效率

### 未来展望

随着技术的发展，这套配置也会持续演进：
- 关注 AI 辅助开发工具的集成
- 探索更高效的容器化开发环境
- 优化远程开发和协作工具
- 持续改进自动化脚本和工作流程

记住：**最好的开发设置是那些让你忘记工具存在，专注于创造价值的设置**。

---

> 📧 **反馈**：如果你有任何建议或问题，欢迎通过 [GitHub Issues](https://github.com/chensoul/dotfiles/issues) 或邮件 ichensoul@gmail.com 联系我。
