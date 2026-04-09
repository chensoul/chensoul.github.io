---
title: "macOS 使用 Chezmoi 管理 Dotfiles 实战"
date: 2026-04-09 17:00:00+08:00
slug: chezmoi-dotfiles-macos
categories: [ "tech" ]
tags: [ "dotfiles", "macos"]
draft: false
description: "在 macOS 上用 chezmoi 管理 dotfiles：Git 版本控制、GPG 加密、多机器同步，以及新机器恢复完整流程。"
favicon: "chezmoi.svg"
---

> 基于 macOS 14+ (ARM64) 环境，chezmoi v2.70.0+

## 一、为什么选择 Chezmoi

之前尝试过直接 symlink 和 GNU Stow，但都有痛点：

| 方案 | 问题 |
|-----|------|
| 手动 symlink | 难以追踪变更，多机器同步靠 `rsync` |
| GNU Stow | 不支持加密，目录结构受限 |
| **Chezmoi** | Git 版本控制 + GPG 加密 + 原子操作 |

Chezmoi 的核心优势：

1. **源码与目标分离**：源码在 `~/.local/share/chezmoi/`，目标在 `~/`
2. **支持加密**：敏感文件用 GPG/age 加密后提交
3. **原子操作**：`chezmoi apply` 一次性应用所有配置
4. **跨机器同步**：配合 Git 仓库，新机器一条命令恢复

---

## 二、快速开始

### 2.1 安装

```bash
# Homebrew 安装
brew install chezmoi

# 或手动安装
curl -sSfL https://get.chezmoi.io | sh
```

### 2.2 初始化

```bash
# 初始化新仓库（自动打开编辑器创建 Git 仓库）
chezmoi init
```

### 2.3 添加文件

```bash
# 添加普通文件
chezmoi add ~/.zshrc
chezmoi add ~/.gitconfig

# 添加可执行文件（自动设置 executable 前缀）
chezmoi add ~/.zshrc

# 添加加密文件（自动用 GPG/age 加密）
chezmoi add --encrypt ~/.wakatime.cfg

# 添加目录
chezmoi add --recursive ~/.config/starship
```

### 2.4 编辑文件

```bash
# 编辑后自动应用到目标位置
chezmoi edit ~/.zshrc

# 编辑加密文件（自动解密/加密）
chezmoi edit ~/.wakatime.cfg
```

### 2.5 应用配置

```bash
# 预览变更
chezmoi apply --dry-run --verbose

# 实际应用
chezmoi apply
```

---

## 三、核心概念

### 3.1 目录结构

```
~/.local/share/chezmoi/          # 源码目录（Git 仓库）
├── .chezmoiignore               # 忽略文件
├── .git/
├── dot_zshrc                    # ~/.zshrc
├── dot_gitconfig                # ~/.gitconfig
├── executable_dot_gitconfig     # 可执行文件
├── private_dot_wakatime_cfg     # 敏感文件（加密）
├── dot_config/
│   └── starship.toml            # ~/.config/starship.toml
└── ...
```

### 3.2 命名约定

| 前缀 | 说明 | 示例 |
|-----|------|-----|
| `dot_` | 普通文件 | `dot_zshrc` → `~/.zshrc` |
| `executable_dot_` | 可执行文件 | `executable_dot_gitconfig` |
| `private_dot_` | 敏感文件（加密） | `private_dot_wakatime_cfg` |
| `symlink_dot_` | 符号链接 | `symlink_dot_config` |

### 3.3 工作流程

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ 编辑源码文件 │ →   │ chezmoi add  │ →   │ Git 提交推送 │
│  ~/.zshrc   │     │ ~/.zshrc     │     │              │
└─────────────┘     └──────────────┘     └─────────────┘
                                               ↓
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ 应用到目标   │ ←   │ 新机器拉取    │ ←   │  Git 仓库    │
│ chezmoi apply│     │ chezmoi init │     │              │
└─────────────┘     └──────────────┘     └─────────────┘
```

---

## 四、进阶用法

### 4.1 加密敏感信息

**使用 GPG 加密：**

```bash
# 生成 GPG 密钥
gpg --full-generate-key

# 配置 chezmoi
echo 'encryption = "gpg"' > ~/.config/chezmoi/chezmoi.toml
echo '[gpg]' >> ~/.config/chezmoi/chezmoi.toml
echo 'recipient = "your@email.com"' >> ~/.config/chezmoi/chezmoi.toml

# 添加加密文件
chezmoi add --encrypt ~/.wakatime.cfg
```

**使用 age 加密（推荐）：**

```bash
# 安装 age
brew install age

# 生成密钥
age-keygen -o ~/.age-key.txt

# 配置 chezmoi
echo 'encryption = "age"' > ~/.config/chezmoi/chezmoi.toml
echo '[age]' >> ~/.config/chezmoi/chezmoi.toml
echo 'identity = "~/.age-key.txt"' >> ~/.config/chezmoi/chezmoi.toml

# 添加加密文件
chezmoi add --encrypt ~/.netrc
```

### 4.2 模板变量

Chezmoi 支持 Go 模板语法，可以使用系统信息作为变量：

```bash
# 查看可用变量
chezmoi data
```

**示例：根据操作系统选择不同配置**

```toml
# {{ .chezmoi.hostname }}/.config/starship.toml
{{ if eq .chezmoi.os "darwin" }}
[aws]
disabled = true
{{ end }}
```

### 4.3 外部资源

对于不想直接管理的文件，可以引用外部资源：

```yaml
# .chezmoiexternal.yaml
.zshrc:
  type: file
  url: "https://raw.githubusercontent.com/user/dotfiles/main/zshrc"
  refreshPeriod: 24h
```

---

## 五、Git 工作流

### 5.1 关联远程仓库

```bash
# 进入源码目录
chezmoi cd

# 添加远程仓库
git remote add origin git@github.com:username/dotfiles.git

# 推送
git push -u origin main
```

### 5.2 多机器同步

```bash
# 新机器初始化
chezmoi init --apply username

# 查看状态
chezmoi status

# 拉取最新配置
chezmoi cd && git pull && chezmoi apply
```

### 5.3 忽略文件

```bash
# .chezmoiignore
.local/
.cache/
*.log
```

---

## 六、常用命令速查

```bash
# ===== 基础操作 =====
chezmoi status              # 查看状态
chezmoi diff                # 查看差异
chezmoi apply               # 应用所有配置
chezmoi apply --dry-run     # 预览变更

# ===== 文件管理 =====
chezmoi add ~/.zshrc        # 添加文件
chezmoi edit ~/.zshrc       # 编辑文件
chezmoi remove ~/.zshrc     # 移除管理

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
chezmoi cd                  # 进入源码目录
```

---

## 七、在新机器上恢复

```bash
# 1. 安装 chezmoi
brew install chezmoi

# 2. 初始化并应用（自动克隆仓库）
chezmoi init --apply username

# 3. 验证
chezmoi doctor
```

如果有加密文件，需要先导入 GPG/age 密钥：

```bash
# GPG
gpg --import ~/backup/gpg-secret-keys.asc

# age
cat ~/backup/age-key.txt >> ~/.age-key.txt
```

---

## 八、故障排查

### 8.1 文件权限问题

```bash
# 问题：chezmoi apply 提示权限错误
# 解决：检查文件前缀
chezmoi add --executable ~/.zshrc  # 添加可执行权限
```

### 8.2 Git 冲突

```bash
# 进入源码目录
chezmoi cd

# 解决冲突
git status
git add <resolved-files>
git commit -m "Resolve conflict"

# 重新应用
chezmoi apply
```

### 8.3 解密失败

```bash
# 检查密钥
gpg --list-secret-keys

# 重新导入
gpg --import ~/backup/gpg-secret-keys.asc
```

---

## 九、我的 Dotfiles 清单

```
dotfiles/
├── Brewfile                      # Homebrew 软件清单
├── install.sh                    # 一键安装脚本
├── README.md
├── .chezmoiignore
├── dot_zshrc                     # Zsh 配置
├── dot_zsh_aliases               # 别名
├── dot_zsh_functions             # 函数
├── dot_gitconfig                 # Git 配置
├── dot_config/
│   ├── starship.toml            # 提示符
│   └── ghostty/config           # 终端配置
└── encrypted_dot_wakatime_cfg   # WakaTime（加密）
```

---

## 十、参考资料

- [Chezmoi 官方文档](https://www.chezmoi.io/)
- [Chezmoi GitHub](https://github.com/twpayne/chezmoi)
- [我的 Dotfiles 仓库](https://github.com/chensoul/dotfiles)
- [Awesome Dotfiles](https://github.com/webpro/awesome-dotfiles)
