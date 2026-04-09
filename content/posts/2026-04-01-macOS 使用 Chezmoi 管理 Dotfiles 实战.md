---
title: "macOS 使用 Chezmoi 管理 Dotfiles 实战"
date: 2026-04-09 17:00:00+08:00
slug: chezmoi-dotfiles-macos
categories: [ "tech" ]
tags: [ "dotfiles", "macos", "zsh"]
draft: false
description: "在 macOS 上用 chezmoi 管理 dotfiles：Zsh Shell 配置、zinit 插件、GPG 加密、别名和函数抽离，以及新机器恢复完整流程。"
favicon: "chezmoi.svg"
---

> 基于 macOS 14+ (ARM64) 环境，chezmoi v2.70.0 + Zsh 5.9+

## 一、当前环境状态

```bash
# 已安装
chezmoi version v2.70.0
zsh version 5.9
git version 2.39.5
gpg version 2.5.18

# 配置文件位置
~/.zshrc
~/.zsh_aliases
~/.zsh_functions
~/.config/chezmoi/chezmoi.toml

# 源码目录
~/.local/share/chezmoi/
```

**重要说明**：本文配置基于 **Zsh**。使用 [zinit](https://github.com/zdharma-continuum/zinit) 作为插件管理器，实现快速加载和按需加载。

---

## 二、快速设置步骤

### 步骤 1：安装 Zsh 和必要工具

```bash
# 安装 Zsh（macOS 自带，但建议用 Homebrew 安装最新版）
brew install zsh

# 安装常用工具
brew install starship zoxide fzf eza yazi fd ripgrep

# 将 Zsh 设为默认 shell
echo "/opt/homebrew/bin/zsh" | sudo tee -a /etc/shells
chsh -s /opt/homebrew/bin/zsh
```

### 步骤 2：清理现有配置（如需要）

```bash
# 如果想重新开始，清理现有配置
chezmoi remove --force --recursive ~

# 或者保留现有文件，重新初始化
chezmoi cd
git status  # 查看当前状态
```

### 步骤 3：关联 Git 仓库

```bash
# 进入源码目录
chezmoi cd

# 如果已有远程仓库，拉取
chezmoi init https://github.com/chensoul/dotfiles.git

# 如果是新仓库，推送到 GitHub
git remote add origin git@github.com:chensoul/dotfiles.git
git push -u origin main
```

### 步骤 4：添加配置文件

```bash
# Zsh Shell 配置
chezmoi add ~/.zshrc
chezmoi add ~/.zsh_aliases
chezmoi add ~/.zsh_functions

# Git 配置
chezmoi add ~/.gitconfig
chezmoi add --encrypt ~/.gitconfig_work
chezmoi add ~/.gitignore_global

# Starship 配置
chezmoi add ~/.config/starship.toml

# Ghostty 终端配置（Ghostty 1.3+）
chezmoi add ~/.config/ghostty/config

# Yazi 文件管理器配置
chezmoi add ~/.config/yazi/yazi.toml
chezmoi add ~/.config/yazi/theme.toml
chezmoi add ~/.config/yazi/keymap.toml

# Git 全局忽略
chezmoi add ~/.config/git/ignore

# 敏感配置（加密存储）
chezmoi add --encrypt ~/.wakatime.cfg
chezmoi add --encrypt ~/.m2/settings.xml
chezmoi add --encrypt ~/.config/rclone/rclone.conf
```

### 步骤 5：应用配置

```bash
# 预览变更
chezmoi apply --dry-run --verbose

# 实际应用
chezmoi apply --verbose
```

---

## 三、Zsh Shell 配置核心要点

### 3.1 Homebrew 镜像源配置

```zsh
# Homebrew 镜像源（USTC）
export HOMEBREW_API_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-bottles/api"
export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-bottles"
export HOMEBREW_CDN_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-bottles"
export HOMEBREW_PIP_INDEX_URL="https://pypi.mirrors.ustc.edu.cn/simple"

# 添加到 PATH
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### 3.2 SDKMAN 环境变量

```zsh
export SDKMAN_DIR="/opt/homebrew/opt/sdkman-cli/libexec"
if [ -s "$SDKMAN_DIR/bin/sdkman-init.sh" ]; then
    source "$SDKMAN_DIR/bin/sdkman-init.sh"
fi

# Java 环境变量
export JAVA_HOME="$SDKMAN_DIR/candidates/java/current"
export PATH="$JAVA_HOME/bin:$PATH"

# JVM 参数优化
export JAVA_OPTS="-Xms1g -Xmx1g -XX:+UseG1GC -XX:+UseStringDeduplication"
export MAVEN_OPTS="-Xms1g -Xmx4g -XX:+TieredCompilation -XX:TieredStopAtLevel=1"
```

### 3.3 Node.js (fnm) 与 pnpm

```zsh
# fnm (Fast Node Manager)
export FNM_PATH="$HOME/.fnm"
if [ -d "$FNM_PATH" ]; then
    export PATH="$FNM_PATH:$PATH"
    eval "$(fnm env --use-on-cd)"
fi

# pnpm
export PNPM_HOME="$HOME/Library/pnpm"
export PATH="$PNPM_HOME:$PATH"
```

### 3.4 OrbStack（Docker Desktop 替代品）

```zsh
[ -f "$HOME/.orbstack/shell/init.zsh" ] && source "$HOME/.orbstack/shell/init.zsh"
```

### 3.5 Starship 提示符与 zoxide

```zsh
# Starship 跨 shell 提示符
eval "$(starship init zsh)"

# zoxide 智能目录跳转
eval "$(zoxide init zsh)"
```

### 3.6 历史记录优化

```zsh
setopt HIST_IGNORE_DUPS
setopt EXTENDED_HISTORY
HISTFILE=~/.zsh_history
HISTSIZE=50000
SAVEHIST=50000
```

---

## 四、Zsh 插件管理

### 4.1 安装 zinit 插件管理器

```bash
# 安装 zinit
git clone https://github.com/zdharma-continuum/zinit.git ~/.zinit/bin
```

### 4.2 配置插件

在 `~/.zshrc` 中添加：

```zsh
# 加载 zinit
source ~/.zinit/bin/zinit.zsh

# 加载常用插件
zinit light zsh-users/zsh-autosuggestions    # 命令自动建议
zinit light zsh-users/zsh-syntax-highlighting # 语法高亮
zinit light zsh-users/zsh-completions         # 额外补全

# 自动补全优化
zinit snippet OMZ::plugins/git/git.plugin.zsh
```

**插件效果：**

| 插件 | 说明 |
|-----|------|
| `zsh-autosuggestions` | 根据历史记录自动建议命令，按 `→` 快速补全 |
| `zsh-syntax-highlighting` | 命令输入时实时高亮，绿色表示有效，红色表示错误 |
| `zsh-completions` | 提供更多命令的自动补全 |

---

## 五、别名和函数管理

### 5.1 别名文件 `~/.zsh_aliases`

所有 Shell 别名已抽离到独立文件中：

```zsh
# 基础别名
alias ll="ls -lah"
alias la="ls -A"
alias l="ls -CF"
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."

# Git 别名
alias g="git"
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gco="git checkout"
alias gb="git branch"
alias gl="git log --oneline -20"
alias gp="git push"
alias gpull="git pull"

# pnpm 别名
alias p="pnpm"
alias pi="pnpm install"
alias pd="pnpm dev"
alias pb="pnpm build"
alias ps="pnpm start"
alias pt="pnpm test"
```

### 5.2 函数文件 `~/.zsh_functions`

所有自定义函数已抽离到独立文件中：

**Yazi 文件管理器（cd 到退出时的目录）：**

```zsh
function y() {
    local cwd
    cwd=$(mktemp -t "yazi-cwd.XXXXXX")
    yazi "$@" --cwd-file="$cwd"
    if cwd=$(cat -- "$cwd") && [ -n "$cwd" ] && [ "$cwd" != "$PWD" ]; then
        cd -- "$cwd"
    fi
    rm -f -- "$cwd"
}
```

**批量拉取代码：**

```zsh
function pullcode() {
    local root
    if [ "$1" = "." ] || [ "$1" = "--here" ]; then
        root="$(pwd -P)"
        (cd "$root" && for dir in */; do [ -d "$dir/.git" ] && (cd "$dir" && git pull); done)
    else
        for root in "$HOME/github" "$HOME/work"; do
            [ -d "$root" ] && (cd "$root" && for dir in */; do [ -d "$dir/.git" ] && (cd "$dir" && git pull); done)
        done
    fi
}
```

**批量提交并推送：**

```zsh
function pushcode() {
    local use_here=false msg="$1"
    if [ "$1" = "--here" ]; then
        use_here=true
        msg="$2"
    fi
    if [ -z "$msg" ]; then
        echo "pushcode: 需要提交说明" >&2
        return 1
    fi
    local roots
    if [ "$use_here" = true ]; then
        roots="$(pwd -P)"
    else
        roots="$HOME/github $HOME/work"
    fi
    for top in $roots; do
        [ -d "$top" ] || continue
        for dir in (find "$top" -maxdepth 1 -mindepth 1 -type d); do
            [ -d "$dir/.git" ] || continue
            (cd "$dir" && git add -A && git diff --cached --quiet && git diff --quiet && continue && git commit -m "$msg" && git push)
        done
    done
}
```

**清理构建产物：**

```zsh
function cleanup() {
    local dry_run=false
    if [ "$1" = "-n" ] || [ "$1" = "--dry-run" ]; then
        dry_run=true
    fi
    if [ "$(pwd -P)" = "/" ]; then
        echo "cleanup: 拒绝在文件系统根目录 / 下执行" >&2
        return 1
    fi
    local dirs_to_clean="node_modules target build dist out .next __pycache__ .pytest_cache .mypy_cache .gradle .turbo coverage .nuxt venv .venv Pods"
    if [ "$dry_run" = true ]; then
        echo "cleanup: dry-run（不会删除）:"
        for dir in $dirs_to_clean; do
            find . -type d -name "$dir" -maxdepth 10 2>/dev/null | while read -r d; do
                [[ "$d" != */.git/* ]] && echo "$d"
            done
        done
        return 0
    fi
    for dir in $dirs_to_clean; do
        find . -type d -name "$dir" -maxdepth 10 2>/dev/null | while read -r d; do
            [[ "$d" != */.git/* ]] && rm -rf "$d" 2>/dev/null
        done
    done
    find . -type f \( -name ".DS_Store" -o -name "*.log" \) -maxdepth 10 2>/dev/null | while read -r f; do
        [[ "$f" != */.git/* ]] && rm -f "$f" 2>/dev/null
    done
    echo "cleanup: 清理完成"
}
```

**杀死占用端口的进程：**

```zsh
function killport() {
    if [ -z "$1" ]; then
        echo "Usage: killport <port_number>"
        return 1
    fi
    local pid
    pid=$(lsof -ti tcp:"$1")
    if [ -n "$pid" ]; then
        echo "Killing process $pid on port $1"
        kill -9 "$pid"
    else
        echo "No process found on port $1"
    fi
}
```

**其他实用函数：**

| 函数 | 说明 |
|-----|------|
| `touchd` | 快速创建文件（自动创建父目录） |
| `proj` | 快速进入 `~/github/项目名` |
| `fd` | 查找并进入目录 |

---

## 六、Git 配置

### 6.1 个人 Git 配置 `~/.gitconfig`

```ini
[user]
    name = Chen Soul
    email = ichensoul@gmail.com

[init]
    defaultBranch = main

[core]
    editor = nvim
    autocrlf = input
    ignores = ~/.gitignore_global

[pull]
    rebase = false

[push]
    default = simple

[credential]
    helper = osxkeychain

[diff]
    tool = vimdiff

[url "git@github.com:"]
    insteadOf = https://github.com/

# 工作电脑特定配置（手动包含）
[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig_work
```

### 6.2 工作 Git 配置 `~/.gitconfig_work`

```ini
[user]
    name = Chen Soul
    email = zhijun.chen@dmall.com
```

**注意**：工作 Git 配置包含公司邮箱，已通过 GPG 加密存储在 dotfiles 仓库中（`encrypted_dot_gitconfig_work.asc`）。

---

## 七、加密敏感信息

### 7.1 使用 GPG 加密

```bash
# 生成 GPG 密钥（如果没有）
gpg --full-generate-key

# 查看密钥 ID
gpg --list-secret-keys

# 配置 chezmoi 使用 GPG
echo "encryption = \"gpg\"" > ~/.config/chezmoi/chezmoi.toml
echo "[gpg]" >> ~/.config/chezmoi/chezmoi.toml
echo "recipient = \"ichensoul@gmail.com\"" >> ~/.config/chezmoi/chezmoi.toml

# 添加加密文件
chezmoi add --encrypt ~/.wakatime.cfg

# 编辑加密文件（自动解密/加密）
chezmoi edit ~/.wakatime.cfg
```

### 7.2 GPG 密钥的备份与恢复

**导出密钥：**

```bash
mkdir -p ~/gpg-export
KEY_ID=$(gpg --list-secret-keys --with-colons 2>/dev/null | awk -F: "/^sec:/{print $5; exit}")
gpg --armor --export-secret-keys $KEY_ID > ~/gpg-export/gpg-secret-keys.asc
gpg --armor --export $KEY_ID > ~/gpg-export/gpg-public-keys.asc
chmod 600 ~/gpg-export/gpg-secret-keys.asc
```

**恢复密钥：**

```bash
gpg --import ~/gpg-export/gpg-public-keys.asc
gpg --import ~/gpg-export/gpg-secret-keys.asc
```

---

## 八、目录结构示例

```
~/.local/share/chezmoi/
├── .chezmoiignore                # Chezmoi 忽略文件
├── .editorconfig                 # EditorConfig 配置
├── .gitignore                    # Git 忽略文件
├── Brewfile                      # Homebrew 配方清单
├── install.sh                    # 安装脚本
├── README.md                     # 说明文档
├── dot_zsh_aliases               # Zsh 别名
├── dot_zsh_functions             # Zsh 函数
├── dot_config/
│   ├── ghostty/
│   │   └── config                # Ghostty 终端配置
│   ├── git/
│   │   └── ignore                # Git 全局忽略文件
│   ├── rclone/
│   │   └── encrypted_rclone.conf.asc  # Rclone 配置（加密）
│   ├── starship.toml             # Starship 提示符
│   └── yazi/                     # Yazi 文件管理器
│       ├── yazi.toml
│       ├── theme.toml
│       └── keymap.toml
├── dot_gitignore_global          # 全局 Git 忽略
├── dot_m2/
│   └── encrypted_settings.xml.asc # Maven 配置（加密）
├── encrypted_dot_gitconfig_work.asc  # 工作 Git 配置（加密）
└── executable_dot_gitconfig      # 个人 Git 配置
```

---

## 九、常用命令速查

```bash
# ===== 基础操作 =====
chezmoi status              # 查看状态
chezmoi diff                # 查看差异
chezmoi apply               # 应用所有配置
chezmoi apply -v            # 详细输出
chezmoi apply --dry-run     # 预览变更

# ===== 文件管理 =====
chezmoi add ~/.zshrc                    # 添加文件
chezmoi edit ~/.zshrc                   # 编辑文件
chezmoi remove ~/.zshrc                 # 移除管理
chezmoi forget ~/.zshrc                 # 忘记但保留文件

# ===== Git 操作 =====
chezmoi git status          # Git 状态
chezmoi git add .           # Git 添加
chezmoi git commit -m "msg" # Git 提交
chezmoi git push            # Git 推送
chezmoi git pull            # Git 拉取

# ===== 高级操作 =====
chezmoi data                # 查看模板数据
chezmoi doctor              # 诊断问题
chezmoi managed             # 列出管理的文件
chezmoi dump                # 导出配置
chezmoi archive             # 创建归档

# ===== 目录操作 =====
chezmoi cd                  # 进入源码目录
chezmoi source-path         # 打印源目录路径
```

---

## 十、在新机器上恢复配置

```bash
# 1. 安装 Homebrew（如果没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装 Zsh 和 chezmoi
brew install zsh chezmoi

# 3. 将 Zsh 设为默认 shell
echo "/opt/homebrew/bin/zsh" | sudo tee -a /etc/shells
chsh -s /opt/homebrew/bin/zsh

# 4. 安装 GPG（用于解密）
brew install gnupg

# 5. 导入 GPG 私钥（从备份）
gpg --import ~/gpg-export/gpg-secret-keys.asc

# 6. 克隆配置（自动应用）
chezmoi init --apply chensoul

# 7. 验证配置
chezmoi doctor
```

## 十一、参考资料

- [Chezmoi 官方文档](https://www.chezmoi.io/)
- [Chezmoi GitHub](https://github.com/twpayne/chezmoi)
- [Zsh 官方文档](https://zsh.sourceforge.net/)
- [zinit 插件管理器](https://github.com/zdharma-continuum/zinit)
- [Starship 提示符](https://starship.rs/)
- [我的 Dotfiles](https://github.com/chensoul/dotfiles)
- [Awesome Dotfiles](https://github.com/webpro/awesome-dotfiles)
