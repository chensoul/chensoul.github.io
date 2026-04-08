---

## title: "macOS 使用 Chezmoi 管理 Dotfiles 实战"
date: 2026-04-01 16:00:00+08:00
slug: chezmoi-dotfiles-macos
categories: [ "tech" ]
tags: [ 'chezmoi', 'dotfiles', 'macos', 'gpg' ]
draft: false
description: "在 macOS 上用 chezmoi 管理 dotfiles：GPG 公钥/私钥导出、用 chezmoi add 与 add --encrypt 进仓及新机器恢复，注意循环依赖。"
favicon: "chezmoi.svg"

> 基于 macOS 14+ (ARM64) 环境，chezmoi v2.70.0

---

## 一、当前环境状态

```bash
# 已安装
chezmoi version v2.70.0
git version 2.39.5
gpg version 2.5.18

# 配置文件位置
~/.config/chezmoi/chezmoi.toml

# 源码目录
~/.local/share/chezmoi/
```

---

## 二、快速设置步骤

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

---

## 三、目录结构示例

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

---

## 四、配置文件示例

### 4.1 Zsh 配置 `~/.zshrc`

```bash
# =============================================================================
# .zshrc - 由 chezmoi 管理，不要手动编辑
# =============================================================================

# 基础环境变量
export EMAIL="ichensoul@gmail.com"
export GITHUB_USERNAME="chensoul"
export EDITOR="nvim"
export BROWSER="arc"

# macOS 特定配置
export HOMEBREW_PREFIX="/opt/homebrew"
export PATH="/opt/homebrew/bin:$PATH"

# 修复 macOS 终端问题
export LC_ALL=en_US.UTF-2015
export LANG=en_US.UTF-2015

# 工作电脑特定配置（根据主机名判断）
if [[ $(hostname) == work-* ]]; then
    export WORK_ENVIRONMENT=true
    export GIT_AUTHOR_EMAIL="work@company.com"
    export GIT_COMMITTER_EMAIL="work@company.com"
    alias code="code-insiders"
else
    export WORK_ENVIRONMENT=false
    export GIT_AUTHOR_EMAIL="ichensoul@gmail.com"
    export GIT_COMMITTER_EMAIL="ichensoul@gmail.com"
fi

# 插件（不使用 Oh My Zsh，直接加载独立插件）
# zsh-autosuggestions
[ -f "/opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh" ] && source "/opt/homebrew/share/zsh-autosuggestions/zsh-autosuggestions.zsh"

# zsh-syntax-highlighting
[ -f "/opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" ] && source "/opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh"

# fzf
[ -f "/opt/homebrew/share/fzf/key-bindings.zsh" ] && source "/opt/homebrew/share/fzf/key-bindings.zsh"
[ -f "/opt/homebrew/share/fzf/completion.zsh" ] && source "/opt/homebrew/share/fzf/completion.zsh"

# 别名
alias gs="git status"
alias gl="git log --oneline --graph"
alias gc="git commit"
alias gp="git push"

# 常用工具
alias c="clear"
alias l="eza -lah --git"
alias ll="eza -lh --git"
alias lt="eza --tree"

# Node.js
export NVM_DIR="$HOME/.nvm"
[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"

# Rust
export PATH="$HOME/.cargo/bin:$PATH"

# Go
export GOPATH="$HOME/go"
export PATH="$GOPATH/bin:$PATH"
```

### 4.2 Git 配置 `~/.gitconfig`

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

### 4.3 工作 Git 配置 `~/.gitconfig_work`

```ini
[user]
    name = Chen Soul
    email = work@company.com
```

---

## 五、加密敏感信息

### 5.1 使用 GPG 加密

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
chezmoi add --encrypt ~/.netrc

# 编辑加密文件（自动解密/加密）
chezmoi edit ~/.netrc
```

### 5.2 GPG 密钥的备份与恢复

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

### 5.3 添加 SSH 密钥管理

```bash
# 不直接存储 SSH 私钥，而是使用 pass 或 1password
# 或者创建脚本自动加载

# 创建脚本 ~/.local/share/chezmoi/executable_bin/load-ssh-key.sh
#!/bin/bash
# 加载 SSH 密钥
ssh-add --apple-use-keychain ~/.ssh/id_ed25519 2>/dev/null
```

---

## 六、常用命令速查

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

---

## 七、在新机器上恢复配置

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

---

## 八、自动化脚本

### 8.1 备份脚本 `~/bin/backup-dotfiles.sh`

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

### 8.2 同步脚本 `~/bin/sync-dotfiles.sh`

```bash
#!/bin/bash
set -e

echo "Syncing dotfiles..."
chezmoi git pull --rebase
chezmoi apply --verbose
echo "✓ Sync completed"
```

---

## 九、故障排查

### 问题 1：Git 冲突

```bash
chezmoi cd
git status
# 解决冲突文件
git add <resolved-files>
git commit -m "Resolve merge conflict"
chezmoi apply
```

### 问题 2：解密失败

```bash
# 检查 GPG 密钥
gpg --list-secret-keys

# 重新导入私钥
gpg --import ~/gpg-export/gpg-secret-keys.asc

# 检查配置文件
cat ~/.config/chezmoi/chezmoi.toml
```

### 问题 3：权限问题

```bash
# 修复权限
chezmoi chattr +x ~/.local/bin/script.sh
chezmoi apply
```

### 问题 4：配置文件渲染问题

```bash
# 查看实际内容
chezmoi cat ~/.zshrc

# 检查差异
chezmoi diff ~/.zshrc
```

---

## 十、推荐插件和工具


| 工具                      | 用途          | 安装命令                                   |
| ----------------------- | ----------- | -------------------------------------- |
| zsh-autosuggestions     | Zsh 自动建议    | `brew install zsh-autosuggestions`     |
| zsh-syntax-highlighting | Zsh 语法高亮    | `brew install zsh-syntax-highlighting` |
| starship                | 跨 Shell 提示符 | `brew install starship`                |
| eza                     | ls 替代品      | `brew install eza`                     |
| fzf                     | 模糊搜索        | `brew install fzf`                     |
| delta                   | Git diff 美化 | `brew install git-delta`               |
| age                     | 现代加密工具      | `brew install age`                     |


---

## 参考资料

- [Chezmoi 官方文档](https://www.chezmoi.io/)
- [Chezmoi GitHub](https://github.com/twpayne/chezmoi)
- [我的 Dotfiles](https://github.com/chensoul/dotfiles)
- [Awesome Dotfiles](https://github.com/webpro/awesome-dotfiles)

