---
title: "macOS 使用 Chezmoi 管理 Dotfiles 实战"
date: 2026-04-08 16:00:00+08:00
slug: chezmoi-dotfiles-macos
categories: [ "tech" ]
tags: [ "dotfiles", "macos"]
draft: false
description: "在 macOS 上用 chezmoi 管理 dotfiles：Fish Shell 配置、GPG 加密、SDKMAN 环境变量提取，以及新机器恢复完整流程。"
favicon: "chezmoi.svg"
---

> 基于 macOS 14+ (ARM64) 环境，chezmoi v2.70.0 + Fish Shell 3.7+

## 一、当前环境状态

```bash
# 已安装
chezmoi version v2.70.0
fish version 3.7.1
git version 2.39.5
gpg version 2.5.18

# 配置文件位置
~/.config/fish/config.fish
~/.config/chezmoi/chezmoi.toml

# 源码目录
~/.local/share/chezmoi/
```

**重要说明**：本文配置基于 **Fish Shell 3.7+**。如果你仍在使用 Zsh + Oh My Zsh，建议迁移到 Fish——更友好的交互体验、智能补全、语法高亮，无需额外插件。

---

## 二、快速设置步骤

### 步骤 1：安装 Fish Shell 和必要工具

```bash
# 安装 Fish Shell
brew install fish

# 安装常用工具
brew install starship zoxide fzf eza yazi fd ripgrep

# 将 Fish 设为默认 shell
echo "/opt/homebrew/bin/fish" | sudo tee -a /etc/shells
chsh -s /opt/homebrew/bin/fish
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
# Fish Shell 配置
chezmoi add ~/.config/fish/config.fish

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
chezmoi add --encrypt ~/.ssh/id_ed25519
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

## 三、Fish Shell 配置核心要点

### 3.1 Homebrew 镜像源配置

```fish
set -gx HOMEBREW_PIP_INDEX_URL "https://pypi.mirrors.ustc.edu.cn/simple"
set -gx HOMEBREW_API_DOMAIN "https://mirrors.ustc.edu.cn/homebrew-bottles/api"
set -gx HOMEBREW_BOTTLE_DOMAIN "https://mirrors.ustc.edu.cn/homebrew-bottles"

if test -x /opt/homebrew/bin/brew
    /opt/homebrew/bin/brew shellenv | source
else if test -x /usr/local/bin/brew
    /usr/local/bin/brew shellenv | source
end
```

### 3.2 SDKMAN 环境变量提取（关键！）

SDKMAN 的初始化脚本是 Bash 语法，不能直接在 Fish 中 `source`。正确做法是在 Bash 子 shell 中运行并提取导出的变量：

```fish
set _sdkman_prefix (brew --prefix sdkman-cli 2>/dev/null)
if test -n "$_sdkman_prefix"
    set -gx SDKMAN_DIR "$_sdkman_prefix/libexec"
    if test -s "$SDKMAN_DIR/bin/sdkman-init.sh"
        # Run sdkman-init.sh in bash and extract exported variables for fish
        for line in (bash -c "source \"$SDKMAN_DIR/bin/sdkman-init.sh\" && echo \"SDKMAN_VERSION=\$SDKMAN_VERSION\" && echo \"SDKMAN_CANDIDATES_CSV=\$SDKMAN_CANDIDATES_CSV\" && echo \"SDKMAN_PLATFORM=\$SDKMAN_PLATFORM\"")
            set -gx (string split "=" $line)[1] (string split "=" $line)[2]
        end
    end
end
set -e _sdkman_prefix

# Java 环境变量
if test -n "$SDKMAN_DIR" -a -d "$SDKMAN_DIR/candidates/java/current"
    set -gx JAVA_HOME "$SDKMAN_DIR/candidates/java/current"
    set -gx PATH "$JAVA_HOME/bin" $PATH
end

# JVM 参数优化
set -gx JAVA_OPTS "-Xms1g -Xmx1g -XX:+UseG1GC -XX:+UseStringDeduplication"
# Maven 性能优化
set -gx MAVEN_OPTS "-Xms1g -Xmx4g -XX:+TieredCompilation -XX:TieredStopAtLevel=1"
```

### 3.3 Node.js (fnm) 与 pnpm

```fish
# fnm (Fast Node Manager)
if command -v fnm >/dev/null ^&1
    fnm env --use-on-cd | source
end

# pnpm
set -gx PNPM_HOME "$HOME/Library/pnpm"
if not string match -q ":$PNPM_HOME:" ":$PATH:"
    set -gx PATH "$PNPM_HOME" $PATH
end
```

### 3.4 OrbStack（Docker Desktop 替代品）

```fish
if test -f "$HOME/.orbstack/shell/init.fish"
    source "$HOME/.orbstack/shell/init.fish"
end
```

### 3.5 Starship 提示符与 zoxide

```fish
# Starship 跨 shell 提示符
starship init fish | source

# zoxide 智能目录跳转
zoxide init fish | source
```

### 3.6 历史记录优化

```fish
set -g fish_history_size 50000
set -g -- fish_history_path "$HOME/.local/share/fish/fish_history"
```

---

## 四、别名与自定义函数

### 4.1 基础别名

```fish
# 文件列表
alias ll="ls -lah"
alias la="ls -A"
alias l="ls -CF"

# 目录跳转
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."

# Git
alias g="git"
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gco="git checkout"
alias gb="git branch"
alias gl="git log --oneline -20"
alias gp="git push"
alias gpull="git pull"

# pnpm
alias p="pnpm"
alias pi="pnpm install"
alias pd="pnpm dev"
alias pb="pnpm build"
alias ps="pnpm start"
alias pt="pnpm test"
```

### 4.2 Yazi 文件管理器（cd 到退出时的目录）

```fish
function y
    set cwd (mktemp -t "yazi-cwd.XXXXXX")
    yazi $argv --cwd-file="$cwd"
    if set cwd (cat -- "$cwd") && test -n "$cwd" -a "$cwd" != "$PWD"
        builtin cd -- "$cwd"
    end
    rm -f -- "$cwd"
end
```

### 4.3 批量拉取代码

```fish
# 用法：pullcode [.|--here]
function pullcode
    set -l roots
    if test "$argv[1]" = "." -o "$argv[1]" = "--here"
        set roots (pwd -P)
    else
        set roots "$HOME/github" "$HOME/work"
    end

    for root in $roots
        if not test -d "$root"
            echo "pullcode: 跳过（目录不存在）: $root" >&2
            continue
        end
        echo "━━ "(basename "$root")" ($root) ━━"
        for dir in (find "$root" -maxdepth 1 -mindepth 1 -type d 2>/dev/null)
            if not test -d "$dir/.git"
                continue
            end
            set -l name (basename "$dir")
            echo "📁 $name"
            pushd "$dir" >/dev/null
            git pull >/dev/null && echo "  pull 成功" || echo "  pull 失败：$name" >&2
            popd >/dev/null
        end
    end
end
```

### 4.4 批量提交并推送

```fish
# 用法：pushcode [--here] <提交说明>
function pushcode
    set -l use_here false
    set -l msg

    if test "$argv[1]" = "--here"
        set use_here true
        set argv $argv[2..]
    end
    set msg "$argv[1]"

    if test -z "$msg"
        echo "pushcode: 需要提交说明，例如：pushcode \"chore: sync\"" >&2
        return 1
    end

    set -l roots
    if test "$use_here" = true
        set roots (pwd -P)
    else
        set roots "$HOME/github" "$HOME/work"
    end

    for top in $roots
        if not test -d "$top"
            echo "pushcode: 跳过（目录不存在）: $top" >&2
            continue
        end
        echo "━━ "(basename "$top")" ($top) ━━"

        for dir in (find "$top" -maxdepth 1 -mindepth 1 -type d 2>/dev/null)
            if not test -d "$dir/.git"
                continue
            end
            set -l name (basename "$dir")
            echo "📁 $name"
            pushd "$dir" >/dev/null || continue

            git add -A
            if git diff --cached --quiet && git diff --quiet
                echo "  (无变更，跳过)"
                popd >/dev/null
                continue
            end

            if not git commit -m "$msg"
                echo "  commit 失败：$name" >&2
                popd >/dev/null
                continue
            end

            set -l branch (git symbolic-ref -q HEAD 2>/dev/null | sed -e "s|^refs/heads/||")
            if test -z "$branch"
                echo "  非分支 HEAD，跳过 push: $name" >&2
                popd >/dev/null
                continue
            end

            if not git push origin "$branch"
                echo "  push 失败：$name" >&2
            end
            popd >/dev/null
        end
    end
end
```

### 4.5 清理构建产物

```fish
# 用法：cleanup [-n|--dry-run]
function cleanup
    set -l dry_run false
    if test "$argv[1]" = "-n"; or test "$argv[1]" = "--dry-run"
        set dry_run true
    end

    if test "(pwd -P)" = "/"
        echo "cleanup: 拒绝在文件系统根目录 / 下执行" >&2
        return 1
    end

    set -l dirs_to_clean "node_modules" "target" "build" "dist" "out" ".next" "__pycache__" ".pytest_cache" ".mypy_cache" ".gradle" ".turbo" "coverage" ".nuxt" "venv" ".venv" "Pods"

    if test "$dry_run" = true
        echo "cleanup: dry-run（不会删除）:"
        for dir in $dirs_to_clean
            fd -t d "$dir" --max-depth 10 2>/dev/null | while read -l d
                not string match -q "*/.git/*" "$d" && echo $d
            end
        end
        fd -t f ".DS_Store" "*.log" --max-depth 10 2>/dev/null | while read -l f
            not string match -q "*/.git/*" "$f" && echo $f
        end
        return 0
    end

    for dir in $dirs_to_clean
        fd -t d "$dir" --max-depth 10 2>/dev/null | while read -l d
            not string match -q "*/.git/*" "$d" && rm -rf "$d" 2>/dev/null
        end
    end

    fd -t f ".DS_Store" "*.log" --max-depth 10 2>/dev/null | while read -l f
        not string match -q "*/.git/*" "$f" && rm -f "$f" 2>/dev/null
    end

    echo "cleanup: 清理完成"
end
```

### 4.6 Yazi 配置示例

**yazi.toml（主配置）**

```toml
[mgr]
ratio = [3, 3, 10]

[preview]
max_width = 2000
max_height = 2400

[opener]
edit = [
  { run = "${EDITOR:-vim} %s", desc = "edit", for = "unix", block = true },
]
```

**theme.toml（主题配置）**

```toml
[flavor]
dark = "kaku-dark"
light = "kaku-dark"
```

**keymap.toml（键位绑定）**

```toml
[mgr]
prepend_keymap = [
  { on = "e", run = "open", desc = "Edit or open selected files" },
  { on = "o", run = "open", desc = "Edit or open selected files" },
  { on = "<Enter>", run = "enter", desc = "Enter the child directory" },
]
```

### 4.7 Git 全局忽略示例

```
# Claude Code local settings
**/.claude/settings.local.json

# IDE & Editor
.idea/
.vscode/
*.swp
*.swo
*~
.bak

# macOS
.DS_Store
.AppleDouble
.LSOverride
._*

# Logs
*.log
logs/

# Dependencies
node_modules/

# Build outputs
dist/
build/
out/
target/

# Cache
.cache/
__pycache__/
.pytest_cache/
.mypy_cache/
```

### 4.8 实用小函数

```fish
# 快速创建文件（自动创建父目录）
function touchd
    mkdir -p (dirname $argv)
    touch $argv
end

# 快速进入项目目录
function proj
    if set -q argv[1]
        cd ~/github/$argv[1]
    else
        ls ~/github/
    end
end

# 查找并进入目录
function fd
    cd (find . -type d -name "*$argv*" | head -1)
end

# 杀死占用端口的进程
function killport
    if test -z "$argv[1]"
        echo "Usage: killport <port_number>"
        return 1
    end
    set -l pid (lsof -ti tcp:"$argv[1]")
    if test -n "$pid"
        echo "Killing process $pid on port $argv[1]"
        kill -9 $pid
    else
        echo "No process found on port $argv[1]"
    end
end
```

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
echo "encryption = "gpg"" > ~/.config/chezmoi/chezmoi.toml
echo "[gpg]" >> ~/.config/chezmoi/chezmoi.toml
echo "recipient = "ichensoul@gmail.com"" >> ~/.config/chezmoi/chezmoi.toml

# 添加加密文件
chezmoi add --encrypt ~/.netrc

# 编辑加密文件（自动解密/加密）
chezmoi edit ~/.netrc
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

## 七、目录结构示例

```
~/.local/share/chezmoi/
├── .chezmoiignore                # Chezmoi 忽略文件
├── .editorconfig                 # EditorConfig 配置
├── .gitignore                    # Git 忽略文件
├── Brewfile                      # Homebrew 配方清单
├── install.sh                    # 安装脚本
├── README.md                     # 说明文档
├── dot_cc-switch/                # CC Switch 配置
│   └── encrypted_cc-switch.db.asc
├── dot_config/
│   ├── fish/
│   │   └── config.fish           # Fish Shell 配置
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
├── dot_ssh/
│   ├── id_ed25519.pub            # SSH 公钥
│   └── encrypted_private_id_ed25519.asc  # SSH 私钥（加密）
├── dot_SwitchHosts/              # SwitchHosts 数据
│   └── data/collection/hosts/...
├── encrypted_dot_gitconfig_work.asc  # 工作 Git 配置（加密）
├── encrypted_dot_myrc.asc        # 个人环境变量（加密）
├── encrypted_dot_wakatime.cfg.asc # WakaTime 配置（加密）
└── executable_dot_gitconfig      # 个人 Git 配置
```

---

## 八、常用命令速查

```bash
# ===== 基础操作 =====
chezmoi status              # 查看状态
chezmoi diff                # 查看差异
chezmoi apply               # 应用所有配置
chezmoi apply -v            # 详细输出
chezmoi apply --dry-run     # 预览变更

# ===== 文件管理 =====
chezmoi add ~/.config/fish/config.fish   # 添加文件
chezmoi edit ~/.config/fish/config.fish  # 编辑文件
chezmoi remove ~/.config/fish/config.fish # 移除管理
chezmoi forget ~/.config/fish/config.fish # 忘记但保留文件

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

## 九、在新机器上恢复配置

```bash
# 1. 安装 Homebrew（如果没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装 Fish Shell 和 chezmoi
brew install fish chezmoi

# 3. 将 Fish 设为默认 shell
echo "/opt/homebrew/bin/fish" | sudo tee -a /etc/shells
chsh -s /opt/homebrew/bin/fish

# 4. 安装 GPG（用于解密）
brew install gnupg

# 5. 导入 GPG 私钥（从备份）
gpg --import ~/gpg-export/gpg-secret-keys.asc

# 6. 克隆配置（自动应用）
chezmoi init --apply chensoul

# 7. 验证配置
chezmoi doctor
```

---

## 十、故障排查

### 问题 1：SDKMAN 环境变量未生效

**症状**：`echo $SDKMAN_DIR` 为空，`sdk` 命令不可用。

**原因**：SDKMAN 初始化脚本是 Bash 语法，不能直接 `source`。

**解决**：使用文中 3.2 节的方法，在 Bash 子 shell 中运行并提取变量。

### 问题 2：Git 冲突

```bash
chezmoi cd
git status
# 解决冲突文件
git add <resolved-files>
git commit -m "Resolve merge conflict"
chezmoi apply
```

### 问题 3：解密失败

```bash
# 检查 GPG 密钥
gpg --list-secret-keys

# 重新导入私钥
gpg --import ~/gpg-export/gpg-secret-keys.asc

# 检查配置文件
cat ~/.config/chezmoi/chezmoi.toml
```

### 问题 4：Fish 配置语法错误

**症状**：启动时报错 `Missing end to balance this if statement`

**原因**：Fish 的 `if` 语句必须用 `end` 闭合，且逻辑或要用 `; or` 连接两个 `test`。

**解决**：

```fish
# 错误写法（bash 风格）
if test "$argv[1]" = "-n"; -o "$argv[1]" = "--dry-run"

# 正确写法
if test "$argv[1]" = "-n"; or test "$argv[1]" = "--dry-run"
```

---

## 十、故障排查

### 问题 1：SDKMAN 环境变量未生效

**症状**：`echo $SDKMAN_DIR` 为空，`sdk` 命令不可用。

**原因**：SDKMAN 初始化脚本是 Bash 语法，不能直接 `source`。

**解决**：使用文中 3.2 节的方法，在 Bash 子 shell 中运行并提取变量。

### 问题 2：Git 冲突

```bash
chezmoi cd
git status
# 解决冲突文件
git add <resolved-files>
git commit -m "Resolve merge conflict"
chezmoi apply
```

### 问题 3：解密失败

```bash
# 检查 GPG 密钥
gpg --list-secret-keys

# 重新导入私钥
gpg --import ~/gpg-export/gpg-secret-keys.asc

# 检查配置文件
cat ~/.config/chezmoi/chezmoi.toml
```

### 问题 4：Fish 配置语法错误

**症状**：启动时报错 `Missing end to balance this if statement`

**原因**：Fish 的 `if` 语句必须用 `end` 闭合，且逻辑或要用 `; or` 连接两个 `test`。

**解决**：

```fish
# 错误写法（bash 风格）
if test "$argv[1]" = "-n"; -o "$argv[1]" = "--dry-run"

# 正确写法
if test "$argv[1]" = "-n"; or test "$argv[1]" = "--dry-run"
```

---

## 十一、推荐工具清单


| 工具       | 用途          | 安装命令                                              |
| -------- | ----------- | ------------------------------------------------- |
| fish     | Shell       | `brew install fish`                               |
| starship | 跨 Shell 提示符 | `brew install starship`                           |
| zoxide   | 智能目录跳转      | `brew install zoxide`                             |
| fzf      | 模糊搜索        | `brew install fzf`                                |
| eza      | ls 替代品      | `brew install eza`                                |
| yazi     | 终端文件管理器     | `brew install yazi`                               |
| fd       | find 替代品    | `brew install fd`                                 |
| ripgrep  | grep 替代品    | `brew install ripgrep`                            |
| delta    | Git diff 美化 | `brew install git-delta`                          |
| age      | 现代加密工具      | `brew install age`                                |
| OrbStack | Docker 替代品  | 从 [https://orbstack.dev](https://orbstack.dev) 下载 |
| Ghostty  | 现代化终端       | `brew install --cask ghostty`                     |


---

## 十二、Dotfiles 仓库文件清单

截至本文更新，仓库包含以下配置文件：

```
dotfiles/
├── .chezmoiignore
├── .editorconfig
├── .gitignore
├── Brewfile                      # Homebrew 配置
├── install.sh                    # 安装脚本
├── README.md
├── dot_cc-switch/
│   └── encrypted_cc-switch.db.asc
├── dot_config/
│   ├── fish/config.fish
│   ├── ghostty/config
│   ├── git/ignore
│   ├── rclone/encrypted_rclone.conf.asc
│   ├── starship.toml
│   └── yazi/
│       ├── yazi.toml
│       ├── theme.toml
│       └── keymap.toml
├── dot_gitignore_global
├── dot_m2/encrypted_settings.xml.asc
├── dot_ssh/
│   ├── id_ed25519.pub
│   └── encrypted_private_id_ed25519.asc
├── dot_SwitchHosts/data/...
├── encrypted_dot_gitconfig_work.asc
├── encrypted_dot_myrc.asc
└── encrypted_dot_wakatime.cfg.asc
```

---

## 十三、参考资料

- [Chezmoi 官方文档](https://www.chezmoi.io/)
- [Chezmoi GitHub](https://github.com/twpayne/chezmoi)
- [Fish Shell 官方文档](https://fishshell.com/docs/current/)
- [Starship 提示符](https://starship.rs/)
- [我的 Dotfiles](https://github.com/chensoul/dotfiles)
- [Awesome Dotfiles](https://github.com/webpro/awesome-dotfiles)

