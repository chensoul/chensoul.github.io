---
title: "macOS 使用 Chezmoi 管理 Dotfiles 实战"
date: 2026-04-09 17:00:00+08:00
slug: chezmoi-dotfiles-macos
categories: [ "tech" ]
tags: [ "dotfiles", "macos" ]
draft: false
description: "在 macOS 上用 chezmoi 管理 dotfiles：Git 版本控制、GPG 加密、多机器同步，以及新机器恢复完整流程。"
favicon: "chezmoi.svg"
---

> 基于 macOS 14+ (ARM64) 环境，chezmoi v2.70.0+

## 一、为什么选择 Chezmoi

之前尝试过直接 symlink 和 GNU Stow，但都有痛点：

| 方案          | 问题                       |
|-------------|--------------------------|
| 手动 symlink  | 难以追踪变更，多机器同步靠 `rsync`    |
| GNU Stow    | 不支持加密，目录结构受限             |
| **Chezmoi** | Git 版本控制 + GPG 加密 + 原子操作 |

Chezmoi 的核心优势：

1. **源码与目标分离**：源码在 `~/.local/share/chezmoi/`，目标在 `~/`
2. **支持加密**：敏感文件用 GPG/age 加密后提交
3. **原子操作**：`chezmoi apply` 一次性应用所有配置
4. **跨机器同步**：配合 Git 仓库，新机器一条命令恢复

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

## 三、工作流程

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

### 4.2 忽略文件

```bash
# .chezmoiignore
.local/
.cache/
*.log
```

### 4.3 多机器同步

```bash
# 新机器初始化
chezmoi init --apply chensoul

# 查看状态
chezmoi status

# 拉取最新配置
chezmoi cd && git pull && chezmoi apply
```

### 4.4 在新机器上恢复

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

## 七、参考资料

- [Chezmoi 官方文档](https://www.chezmoi.io/)
- [Chezmoi GitHub](https://github.com/twpayne/chezmoi)
- [我的 Dotfiles 仓库](https://github.com/chensoul/dotfiles)
- [Awesome Dotfiles](https://github.com/webpro/awesome-dotfiles)
