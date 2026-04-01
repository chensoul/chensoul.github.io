---
title: "使用 chezmoi 在 macOS 上管理 dotfiles"
date: 2026-04-01 16:00:00+08:00
slug: chezmoi-dotfiles-macos
categories: [ "tech" ]
tags: [ 'chezmoi', 'dotfiles', 'macos', 'gpg' ]
draft: false
description: "在 macOS 上用 chezmoi 管理 dotfiles：GPG 公钥/私钥导出、用 chezmoi add 与 add --encrypt 进仓及新机器恢复，注意循环依赖。"
favicon: "chezmoi.svg"
---

换电脑或重装系统时，最烦的是把 `.zshrc`、SSH 配置、编辑器设置等一点点拷回去。用 [chezmoi](https://www.chezmoi.io/) 可以把「真实家目录里的文件」和「仓库里的源状态」对齐，改一处、处处同步，且对 macOS 很友好。

<!--more-->

## 为什么选择 chezmoi

- **单一工具**：用 `chezmoi` 命令管理添加、编辑、应用，不强行绑定某种 shell 插件体系。
- **模板**：同一套配置里可按主机名、操作系统、是否在 CI 等条件生成不同内容（Go 的 `text/template`）。
- **密钥**：敏感信息可用 **GPG**（或 age 等）加密后再进仓库，避免明文提交。
- **与 Git 自然配合**：源状态就是一个目录，常见做法是 `chezmoi init --apply` 从远程拉下来再 `chezmoi git` 日常提交。

## 能「备份」哪些文件

先把说法说清楚：**chezmoi 不是 Time Machine、不是整机云备份**，而是把你**主动纳入管理**的路径，做成可版本控制的「源状态」，再 `apply` 到各台机器的家目录。因此「能备份哪些」= **你愿意 `chezmoi add`（或模板生成）并提交到仓库的任意文件**，没有固定白名单。

常见会放进 dotfiles 仓库的包括：

| 类型 | 示例路径（均在 `~` 下） |
|------|-------------------------|
| Shell / 工具链 | `.zshrc`、`.zprofile`、`.bashrc`、`~/.config/starship.toml` |
| Git | `.gitconfig`、`.gitignore_global` |
| SSH | `.ssh/config`；私钥需 **`chezmoi add --encrypt`** 或勿入库 |
| 编辑器 / IDE | `.vimrc`、`~/.config/nvim/` 下部分文件、VS Code `settings.json`（若你希望同步） |
| 终端 / 窗口管理 | `~/.config/alacritty`、`~/.config/karabiner` 等 |
| 脚本与杂项 | `~/bin/` 下自用脚本、`~/.hushlogin` 等 |

在 **macOS** 上也可以纳入 `Library` 下**明确、体积可控**的配置（例如个别 `Preferences` plist），但要自己判断：是否含隐私、是否随系统升级易碎、是否体积过大。**不要**把整个 `~/Library`、照片库、虚拟机磁盘等塞进 chezmoi——那是备份软件的事。

若路径不在默认映射规则内，可通过 [`.chezmoi.toml.tmpl` / `sourceDir`](https://www.chezmoi.io/reference/configuration-file/) 等调整；更偏门的目录也可用符号链接，让真实文件仍在 `~`、chezmoi 只管链接目标。

**小结**：能进仓库的 = 你显式添加、且适合 Git 管理（多为文本或小文件）的配置；敏感内容用 **GPG 加密**；大块数据、密钥明文、缓存目录不要当 dotfiles 备份。

## 在 macOS 上安装

用 Homebrew 最省事：

```bash
brew install chezmoi
```

验证：

```bash
chezmoi --version
```

## 快速上手

请使用以下命令初始化 chezmoi：

```bash
chezmoi init
```

这将创建一个新的本地 Git 仓库`~/.local/share/chezmoi`，chezmoi 将在其中存储其源代码状态。默认情况下，chezmoi 只会修改工作副本中的文件。

使用 chezmoi 管理您的第一个文件：

```bash
chezmoi add ~/.zshrc
```

这将复制`~/.zshrc`到`~/.local/share/chezmoi/private_dot_zshrc`。

编辑源状态：

```bash
chezmoi edit ~/.zshrc
```

看看 chezmoi 会做出哪些改变：

```bash
chezmoi diff
```

应用更改，将源代码目录文件变更更新到 `~/.zshrc`：

```bash
chezmoi -v apply
```

查看由 chezmoi 管理的文件：

```bash
chezmoi managed --include=files
```

接下来，进入源代码目录 `~/.local/share/chezmoi`：

```bash
chezmoi cd
```

以提交您的更改：

```bash
git add .
git commit -m "Initial commit"
```

在 [GitHub ](https://github.com/new) 上创建一个名为 `dotfiles` 的新仓库，然后将你的仓库推送上去：

```bash
git remote add origin git@github.com:chensoul/dotfiles.git
git branch -M main
git push -u origin main
```

## 在多台机器上使用

在另一台机器上，使用您的 dotfiles 仓库初始化 chezmoi：

```bash
chezmoi init git@github.com:chensoul/dotfiles.git
```

这将检查仓库及其所有子模块，并可选择为您创建一个 chezmoi 配置文件。

运行以下命令，查看 chezmoi 将对您的主目录进行哪些更改：

```bash
chezmoi diff
```

如果您对 chezmoi 将进行的更改感到满意，请运行：

```bash
chezmoi apply -v
```

如果您对文件的更改不满意，请使用以下命令编辑该文件：

```bash
chezmoi edit $FILE
```

或者，调用合并工具（默认情况下`vimdiff`）来合并文件的当前内容、工作副本中的文件以及计算出的文件内容之间的更改：

```bash
chezmoi merge $FILE
```

在任何机器上，您都可以使用以下命令从 git 远程仓库拉取并应用最新更改：

```bash
chezmoi update -v
```

## 使用一条命令设置一台新机器

您只需一条命令即可在新机器上安装您的配置文件：

```bash
chezmoi init --apply https://github.com/chensoul/dotfiles.git
```

如果你使用 GitHub，并且你的 dotfiles 仓库名为 ，`dotfiles`那么可以将其简化为：

```bash
chezmoi init --apply chensoul
```

## 加密与解密

chezmoi 支持 [GPG](https://www.gnupg.org/)、[age](https://age-encryption.org/)、[git-crypt](https://github.com/AGWA/git-crypt) 等；本节按 **GPG 非对称加密**（公钥加密、私钥解密）来写，与官方 [gpg 指南](https://www.chezmoi.io/user-guide/encryption/gpg/) 一致。加密后的文件以 ASCII armor 等形式存在**源目录**；生成目标或 `chezmoi edit` 时由 chezmoi **自动解密**。

### 1. 安装 GnuPG

```bash
brew install gnupg
gpg --version
```

查看可用于接收密文的身份（邮箱或密钥 ID 均可作为 `recipient`）：

```bash
gpg --list-secret-keys --keyid-format=long
```

若本机还没有密钥对，先生成（交互式）：

```bash
gpg --full-generate-key
```

### 2. 在 chezmoi 里启用 GPG

在 **`~/.config/chezmoi/chezmoi.toml`** 中声明 `encryption`（须放在文件**最前面**，再写其他段落，见[官方说明](https://www.chezmoi.io/user-guide/encryption/gpg/)）：

```toml
encryption = "gpg"
[gpg]
recipient = "ichensoul@gmail.com"
```

`recipient` 填你的 **GPG 公钥标识**：常用邮箱，或 `gpg --list-keys` 里看到的长密钥 ID。chezmoi 会用等价于下面的命令加密后再写入源状态：

```bash
gpg --armor --recipient <recipient> --encrypt
```

**私钥**只留在本机 `~/.gnupg/`（或你配置的目录），用于解密；**不要**把私钥提交进 Git。仓库里只有密文。

若 GPG 向 stderr 打日志、干扰输出，可在配置里增加：

```toml
[gpg]
args = ["--quiet"]
```

### 3. 对称加密（可选）

若希望用**口令对称加密**而不是密钥对，可设 `symmetric = true`（细节与 `gpg.args` 见[官方 gpg 页](https://www.chezmoi.io/user-guide/encryption/gpg/)）。一般更推荐非对称 + 私钥在本机。

### 4. 纳入敏感文件与何时解密

```bash
chezmoi add --encrypt ~/.ssh/id_ed25519
```

- **加密**：发生在 `add --encrypt` 以及 `chezmoi edit` 保存时。
- **解密**：发生在 **`chezmoi apply`**（写入家目录前）和 **`chezmoi edit`**（打开编辑器前）；平时不必手敲 `gpg --decrypt`。

新机器上需先导入同一身份可用的私钥（或从备份恢复 `~/.gnupg`），再 `apply`，否则解密会失败。

### 5. 手动用 GPG 调试

需要脱离 chezmoi 检查密文时，可直接使用 GPG 命令（与 chezmoi 内部调用一致的是「armor + recipient + encrypt」这一类管线），例如：

```bash
gpg --decrypt path/to/encrypted.asc
# 或从标准输入：gpg -d < encrypted.asc
```

### 6. 更换收件人或从其他算法迁到 GPG

对已纳管的加密文件：先在本机 **`chezmoi apply`** 确保明文已落盘 → 把 `chezmoi.toml` 里的 `encryption` / `[gpg]` 改好 → 对有关目标 **`chezmoi forget`** 后，再 **`chezmoi add --encrypt`** 重新纳入。批量轮换可参考[官方 FAQ · Encryption](https://www.chezmoi.io/user-guide/frequently-asked-questions/encryption/)。

### 7. GPG 密钥的备份与恢复

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

## 我的实践

备份文件到 dotfiles

```bash
chezmoi init
chezmoi cd

# 添加文件
chezmoi add ~/.zshrc
chezmoi add ~/.aliases
chezmoi add ~/.gitignore_global
chezmoi add ~/.gitconfig
chezmoi add ~/.gitconfig_work

chezmoi add --encrypt ~/.ssh/id_ed25519
chezmoi add ~/.ssh/id_ed25519.pub

chezmoi add --encrypt ~/.myrc
chezmoi add --encrypt ~/.wakatime.cfg

chezmoi add --encrypt ~/.m2/settings.xml
chezmoi add --encrypt ~/.config/rclone/rclone.conf

# 提交代码
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:chensoul/dotfiles.git
git branch -M main
git push -u origin main
```

重装系统后一键恢复：

```bash
chezmoi init --apply https://github.com/chensoul/dotfiles.git
```

## macOS 上常见注意点

- **Apple Silicon vs Intel**：Homebrew 前缀不同（`/opt/homebrew` 与 `/usr/local`），适合用模板或 `{{ if eq .chezmoi.arch "arm64" }}` 分支。
- **系统更新后**：偶尔检查 `chezmoi doctor`，确认权限与路径正常。
- **与 iCloud / 同步盘**：尽量不要把 `~/.local/share/chezmoi` 整个放进会双向同步的目录，以 Git 为唯一真相更稳。

## 命令一览（速查）

| 命令 | 作用 |
|------|------|
| `chezmoi init` | 初始化本地源；可配合远程与 `--apply` |
| `chezmoi add <path>` | 将家目录已有文件纳入管理 |
| `chezmoi status` | 列出目标与源是否一致 |
| `chezmoi diff` | 查看将要应用的具体差异 |
| `chezmoi apply` | 用源状态覆盖家目录目标文件 |
| `chezmoi edit <path>` | 编辑源中的对应条目 |
| `chezmoi source-path` | 打印源目录绝对路径 |
| `chezmoi cd` | 在源工作区里启动子 shell（不改动当前终端目录） |
| `cd "$(chezmoi source-path)"` | 当前 shell 直接进入源目录 |
| `chezmoi git -- …` | 在源目录里执行 git 子命令 |
| `chezmoi forget <path>` | 取消对某目标的管理（不删文件） |
| `chezmoi doctor` | 环境与健康检查 |
| `chezmoi add --encrypt <path>` | 将文件以 GPG（或当前配置的加密后端）加密后纳入源状态 |
| `gpg --encrypt` / `gpg --decrypt` | 在 chezmoi 外手动加解密、排查 GPG 环境 |

在 zsh 里可启用补全：

```bash
eval "$(chezmoi completion zsh)"
```

## 小结

在 macOS 上用 chezmoi 管理 dotfiles，核心是：**源状态在本地 `chezmoi` 目录、与 [chensoul/dotfiles](https://github.com/chensoul/dotfiles) 用 Git 同步、用模板处理多机差异、`apply` 同步到真实家目录**；敏感文件可用 **GPG** + `chezmoi add --encrypt` 再推送。新机器用 `chezmoi init --apply chensoul` 一条即可对齐；日常则 `git pull` + `apply`、或 `edit` + `apply` + `git push`。

官方文档：[chezmoi.io](https://www.chezmoi.io/)
