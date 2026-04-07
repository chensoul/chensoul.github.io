---
title: "macOS 使用 Chezmoi 管理 Dotfiles 实战"
date: 2026-04-01 16:00:00+08:00
slug: chezmoi-dotfiles-macos
categories: [ "tech" ]
tags: [ 'chezmoi', 'dotfiles', 'macos']
draft: false
description: "在 macOS 上用 chezmoi 管理 dotfiles：GPG 公钥/私钥导出、用 chezmoi add 与 add --encrypt 进仓及新机器恢复，注意循环依赖。"
favicon: "chezmoi.svg"
---


换电脑或重装系统时，最烦的是把 .zshrc、SSH 配置、编辑器设置等一点点拷回去。用 chezmoi 可以把「真实家目录里的文件」和「仓库里的源状态」对齐，改一处、处处同步，且对 macOS 很友好。

## 简介

### 什么是 Chezmoi？

Chezmoi 是一个用 Go 编写的 dotfiles 管理工具，主要特点：

- ✅ **安全**：支持加密敏感信息（使用 age 或 GPG）
- ✅ **跨平台**：支持 macOS、Linux、Windows
- ✅ **灵活**：支持模板、条件配置
- ✅ **简单**：命令直观，易于上手
- ✅ **VCS 友好**：与 Git 无缝集成

### 为什么要用 Chezmoi？

| 场景 | 解决方案 |
|------|----------|
| 多台电脑同步配置 | 一次修改，多端同步 |
| 敏感信息管理 | 加密存储 API Key、密码 |
| 不同系统差异配置 | 模板条件判断 |
| 配置版本控制 | Git 历史记录 |

## 安装

macOS

```bash
# Homebrew（推荐）
brew install chezmoi

# 或者使用 MacPorts
sudo port install chezmoi
```

Linux

```bash
# Debian/Ubuntu
wget https://github.com/twpayne/chezmoi/releases/latest/download/chezmoi-linux-amd64.deb
sudo dpkg -i chezmoi-linux-amd64.deb

# RHEL/CentOS
wget https://github.com/twpayne/chezmoi/releases/latest/download/chezmoi-linux-amd64.rpm
sudo rpm -i chezmoi-linux-amd64.rpm

# Arch Linux
yay -S chezmoi
```

Windows

```powershell
# Scoop
scoop install chezmoi

# Chocolatey
choco install chezmoi
```

验证安装

```bash
chezmoi --version
```

## 当前环境状态

```bash
# 系统信息
uname -m
# arm64

sw_vers
# ProductName:		macOS
# ProductVersion:		15.6.1
# BuildVersion:		24G90

# 已安装工具
chezmoi --version   # v2.70.0
git --version         # 2.39.5
gpg --version         # 2.5.18
zsh --version         # 5.9
brew --version        # Homebrew 5.1.4

# 配置文件位置
~/.config/chezmoi/chezmoi.toml

# 源码目录
~/.local/share/chezmoi/
```

### 已安装的辅助工具

```bash
# 通过 Homebrew 安装
brew install eza starship fzf zsh-autosuggestions zsh-syntax-highlighting

# 验证安装
eza --version
starship --version
fzf --version
```

## 快速设置步骤

### 步骤 1：清理现有配置（如需要）

```bash
# 如果想重新开始，清理现有配置
chezmoi remove --force --recursive ~

# 或者保留现有文件，重新初始化
chezmoi cd
git status  # 查看当前状态
```

### 步骤 2：创建/关联 Git 仓库

```bash
# 进入源码目录
chezmoi cd

# 如果已有远程仓库，拉取
chezmoi init https://github.com/chensoul/dotfiles.git

# 如果是新仓库，推送到 GitHub
git remote add origin git@github.com:chensoul/dotfiles.git
git push -u origin main
```

### 步骤 3：添加常用配置文件

```bash
# Shell 配置
chezmoi add ~/.zshrc
chezmoi add ~/.bashrc

# Git 配置
chezmoi add ~/.gitconfig
chezmoi add ~/.gitconfig_work
chezmoi add ~/.gitignore_global

# 编辑器配置
chezmoi add -r ~/.config/starship.toml

# 其他工具
chezmoi add ~/.aliases
chezmoi add ~/.ssh/id_ed25519.pub
chezmoi add --encrypt ~/.ssh/id_ed25519
chezmoi add --encrypt ~/.myrc
chezmoi add --encrypt ~/.wakatime.cfg
chezmoi add --encrypt ~/.m2/settings.xml
chezmoi add --encrypt ~/.config/rclone/rclone.conf
```

### 步骤 4：应用配置

```bash
# 预览变更
chezmoi apply --dry-run --verbose

# 实际应用
chezmoi apply --verbose

# 应用到特定文件
chezmoi apply ~/.zshrc ~/.gitconfig
```

## 目录结构示例

```
~/.local/share/chezmoi/
├── .bashrc                         # Bash 配置
├── .zshrc                          # Zsh 配置
├── .gitconfig                      # Git 配置
├── .gitconfig_work                 # 工作 Git 配置
├── .gitignore_global               # 全局 Git 忽略
├── .aliases                        # 别名
├── dot_config/
│   ├── starship.toml
│   └── rclone/
│       └── rclone.conf
├── dot_ssh/
│   └── id_ed25519.pub              # SSH 公钥
├── private_dot_ssh/
│   └── id_ed25519                  # SSH 私钥（加密）
├── private_dot_myrc                # 加密的 myrc 配置
├── private_dot_wakatime.cfg        # 加密的 WakaTime 配置
├── private_dot_m2/
│   └── settings.xml                # 加密的 Maven 配置
└── executable_bin/                 # 可执行脚本
    └── sync-dotfiles.sh
```

## 配置文件示例

### Zsh 配置 `~/.zshrc`

```bash
# -----------------------------------------------------------------------------
# 用户配置
# -----------------------------------------------------------------------------
[[ -f ~/.aliases ]] && source ~/.aliases
[[ -f ~/.myrc ]] && source ~/.myrc

# -----------------------------------------------------------------------------
# Homebrew
# -----------------------------------------------------------------------------
export HOMEBREW_PIP_INDEX_URL="https://pypi.mirrors.ustc.edu.cn/simple"
export HOMEBREW_API_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-bottles/api"
export HOMEBREW_BOTTLE_DOMAIN="https://mirrors.ustc.edu.cn/homebrew-bottles"

if [[ -x /opt/homebrew/bin/brew ]]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [[ -x /usr/local/bin/brew ]]; then
  eval "$(/usr/local/bin/brew shellenv)"
fi

# -----------------------------------------------------------------------------
# SDKMAN
# -----------------------------------------------------------------------------
_sdkman_prefix="$(brew --prefix sdkman-cli 2>/dev/null)" || true
if [[ -n "${_sdkman_prefix}" ]]; then
  export SDKMAN_DIR="${_sdkman_prefix}/libexec"
  [[ -s "${SDKMAN_DIR}/bin/sdkman-init.sh" ]] && source "${SDKMAN_DIR}/bin/sdkman-init.sh"
fi
unset _sdkman_prefix

# Java
if [[ -n "${SDKMAN_DIR:-}" && -d "${SDKMAN_DIR}/candidates/java/current" ]]; then
  export JAVA_HOME="${SDKMAN_DIR}/candidates/java/current"
  export PATH="${JAVA_HOME}/bin:${PATH}"
fi

export JAVA_OPTS="-Xms1g -Xmx1g -XX:+UseG1GC -XX:+UseStringDeduplication"
export MAVEN_OPTS="-Xms1g -Xmx4g -XX:+TieredCompilation -XX:TieredStopAtLevel=1"

# -----------------------------------------------------------------------------
# Node（fnm）与 pnpm
# -----------------------------------------------------------------------------
if command -v fnm >/dev/null 2>&1; then
  eval "$(fnm env --use-on-cd)"
fi

export PNPM_HOME="${HOME}/Library/pnpm"
case ":${PATH}:" in
  *":${PNPM_HOME}:"*) ;;
  *) export PATH="${PNPM_HOME}:${PATH}" ;;
esac

# -----------------------------------------------------------------------------
# OrbStack
# -----------------------------------------------------------------------------
[[ -f "${HOME}/.orbstack/shell/init.zsh" ]] && source "${HOME}/.orbstack/shell/init.zsh"

# zoxide 智能目录跳转
eval "$(zoxide init zsh)"

# zsh 插件
source /opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

# Starship 提示符
eval "$(starship init zsh)"

# -----------------------------------------------------------------------------
# Zsh 选项优化
# -----------------------------------------------------------------------------
setopt auto_cd             # 直接 cd 到目录名
setopt auto_pushd          # 自动 pushd
setopt pushd_ignore_dups   # 忽略重复目录
setopt pushdminus          # 支持 cd -2 等语法

# 历史记录优化
HISTSIZE=50000
SAVEHIST=50000
setopt HIST_IGNORE_ALL_DUPS    # 删除重复历史
setopt HIST_FIND_NO_DUPS       # 搜索不显示重复
setopt HIST_REDUCE_BLANKS      # 删除空白行
setopt HIST_IGNORE_SPACE       # 忽略空格开头的命令
setopt SHARE_HISTORY           # 多会话共享历史
setopt APPEND_HISTORY          # 追加模式
setopt INC_APPEND_HISTORY      # 立即写入
setopt EXTENDED_HISTORY        # 保存时间戳

# -----------------------------------------------------------------------------
# Yazi 文件管理器
# -----------------------------------------------------------------------------
y() {
	local cwd
	cwd="$(mktemp -t "yazi-cwd.XXXXXX")"
	yazi "$@" --cwd-file="$cwd"
	if cwd="$(cat -- "$cwd")" && [[ -n "$cwd" && "$cwd" != "$PWD" ]]; then
		builtin cd -- "$cwd"
	fi
	rm -f -- "$cwd"
}
```

### Git 配置 `~/.gitconfig`

```ini
[core]
  editor = vim
  pager = cat
  autocrlf = true
  eol = lf
  safecrlf = false
  untrackedCache = true
  excludesfile = ~/.gitignore_global

[alias]
  st = status
  a = add
  di = diff
  co = checkout
  ci = commit
  cp = cherry-pick
  br = branch
  pl = pull
  last = log -1 HEAD
  unstage = reset HEAD --
  lo = log --oneline
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
[user]
  name = chensoul
  email = ichensoul@gmail.com

[includeIf "gitdir:~/work/"]
  path = ~/.gitconfig_work

[safe]
  directory = *
```

### 工作 Git 配置 `~/.gitconfig_work`

```ini
[user]
  name = yourname
  email = yourname@company.com
```

## 加密敏感信息

### 使用 GPG 加密

```bash
# 生成 GPG 密钥（如果没有）
gpg --full-generate-key

# 查看密钥 ID
gpg --list-secret-keys

# 配置 chezmoi 使用 GPG
echo 'encryption = "gpg"' > ~/.config/chezmoi/chezmoi.toml
echo '[gpg]' >> ~/.config/chezmoi/chezmoi.toml
echo 'recipient = "ichensoul@gmail.com"' >> ~/.config/chezmoi/chezmoi.toml

# 添加加密文件
chezmoi add --encrypt ~/.myrc

# 编辑加密文件（自动解密/加密）
chezmoi edit ~/.myrc
```

### GPG 密钥的备份与恢复

**先导出到固定路径（家目录下）：**

```bash
mkdir -p ~/gpg-export
KEY_ID=$(gpg --list-secret-keys --with-colons 2>/dev/null | awk -F: '/^sec:/{print $5; exit}')
gpg --armor --export-secret-keys $KEY_ID > ~/gpg-export/gpg-secret-keys.asc
gpg --armor --export $KEY_ID > ~/gpg-export/gpg-public-keys.asc
chmod 600 ~/gpg-export/gpg-secret-keys.asc
```

**恢复：**

```bash
gpg --import ~/gpg-export/gpg-public-keys.asc
gpg --import ~/gpg-export/gpg-secret-keys.asc
```

### 添加 SSH 密钥管理

```bash
# 不直接存储 SSH 私钥，而是使用 pass 或 1password
# 或者创建脚本自动加载

# 创建脚本 ~/.local/share/chezmoi/executable_bin/load-ssh-key.sh
#!/bin/bash
# 加载 SSH 密钥
ssh-add --apple-use-keychain ~/.ssh/id_ed25519 2>/dev/null
```

## 常用命令速查

```bash
# ===== 基础操作 =====
chezmoi status              # 查看状态
chezmoi diff                # 查看差异
chezmoi apply               # 应用所有配置
chezmoi apply -v            # 详细输出
chezmoi apply --dry-run     # 预览变更

# ===== 文件管理 =====
chezmoi add ~/.zshrc        # 添加文件
chezmoi edit ~/.zshrc       # 编辑文件
chezmoi remove ~/.zshrc     # 移除管理
chezmoi forget ~/.zshrc     # 忘记但保留文件

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

## 在新机器上恢复配置

```bash
# 1. 安装 chezmoi
brew install chezmoi

# 2. 安装 GPG（用于解密）
brew install gnupg

# 3. 导入 GPG 私钥（从备份）
gpg --import ~/gpg-export/gpg-secret-keys.asc

# 4. 克隆配置（自动应用）
chezmoi init --apply chensoul

# 或者手动分步
chezmoi init chensoul
chezmoi apply --verbose

# 5. 验证配置
chezmoi doctor
```

## 自动化脚本

### 备份脚本 `~/bin/backup-dotfiles.sh`

```bash
#!/bin/bash
set -e

echo "Backing up dotfiles..."
chezmoi cd
git add .
if ! git diff --cached --quiet; then
    git commit -m "Backup: $(date '+%Y-%m-%d %H:%M')"
    git push
    echo "✓ Backup completed"
else
    echo "✓ No changes to backup"
fi
```

### 同步脚本 `~/bin/sync-dotfiles.sh`

```bash
#!/bin/bash
set -e

echo "Syncing dotfiles..."
chezmoi git pull --rebase
chezmoi apply --verbose
echo "✓ Sync completed"
```

## 故障排查

问题 1：Git 冲突

```bash
chezmoi cd
git status
# 解决冲突文件
git add <resolved-files>
git commit -m "Resolve merge conflict"
chezmoi apply
```

问题 2：解密失败

```bash
# 检查 GPG 密钥
gpg --list-secret-keys

# 重新导入私钥
gpg --import ~/gpg-export/gpg-secret-keys.asc

# 检查配置文件
cat ~/.config/chezmoi/chezmoi.toml
```

问题 3：权限问题

```bash
# 修复权限
chezmoi chattr +x ~/.local/bin/script.sh
chezmoi apply
```

问题 4：配置文件渲染问题

```bash
# 查看实际内容
chezmoi cat ~/.zshrc

# 检查差异
chezmoi diff ~/.zshrc
```

## 参考资料

- [Chezmoi 官方文档](https://www.chezmoi.io/)
- [Chezmoi GitHub](https://github.com/twpayne/chezmoi)
- [我的 Dotfiles](https://github.com/chensoul/dotfiles)
- [Awesome Dotfiles](https://github.com/webpro/awesome-dotfiles)
