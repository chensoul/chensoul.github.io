---
title: "使用 OpenClaw 调用 Claude Code 开发应用"
date: 2026-03-16 14:20:00+08:00
slug: create-app-with-claude-code-in-openclaw
categories: [ "tech" ]
tags: [ 'openclaw','claude']
draft: true
description: "本文介绍在 Codespaces 中从安装到正常使用的完整步骤。"
cover: /thumbs/openclaw.svg
---

## 使用内置的 coding-agent 技能

openclaw 内置 coding-agent 技能，启用该技能之后，使用 coding-agent 技能让 claude code 做一个 Todo List 的小 web 应用原型。在聊天窗口和机器人对话：

```bash
使用 coding-agent 技能让 claude code 做一个 Todo List 的小 web 应用原型
```

我的 openclaw 是在 root 用户下安装的，如何改为在其他用户，比如 chensoul 用户权限下运行 openclaw 呢？请参考附录。

## 自建一个带有 Spec 规范的技能

```bash
请深度阅读 Claude Code 官方文档，然后创建一个车 openclaw 可以调用的 skill，以便后续可以轻松调用。
https://code.claude.com/docs
```



```bash
让 Claude Code 开发一个登录页的 UI，用 html+css+js，并且运行给我看看效果。记住，用英文和 Claude Code
```



```bash
阅读 spec-kit 官方文档，并为 Claude Code 配置 spec-kit 工作流，然后让 Claude Code 使用 spec-kit 开发一个拟物风格的 Todo List 应用
```



```bash
你是否全程让 Claude Code 使用 spec-kit 实现的这个项目？
```



```bash
通过 Claude Code 使用 spec-kit，这个完整的步骤和技巧，是否可以存入你之前开发的 Claude Code 的 skill 中？如果可以，那么请实现，并且push 到对应的 github 仓库。
```



根据以上经验和技巧，下面我给你另一个 spec 项目 OpenSpec，你能否为 Claude Code 进行配置，不能成功让 Claude Code 使用 OpenSpec 进行项目开发？



做一个 Todo List 的小 web 应用原型





OpenSpec 的使用经验和技巧，你是否也同步更新到了调用 Claude Code 的 skiil 里面？



请记住，每当你调用 claude-code-openclaw 后，有了新的使用经验和技巧，请同步更新到 skill 并 push 到 github 仓库。同时，还要更新到你的记忆里。



你都学到了哪些经验和技巧。

### 附录

### OpenClaw 改为普通用户执行

以下是将 OpenClaw 从 root 用户迁移到 chensoul 用户的步骤：

1. 复制 OpenClaw 目录到 chensoul 用户

```bash
# 复制 workspace 目录
sudo cp -r /root/.openclaw/workspace /home/chensoul/.openclaw/

# 复制其他 OpenClaw 数据目录
sudo cp -r /root/.openclaw/credentials /home/chensoul/
sudo cp -r /root/.openclaw/skills /home/chensoul/
sudo cp -r /root/.openclaw/telegram /home/chensoul/
sudo cp -r /root/.openclaw/cron /home/chensoul/
sudo cp /root/.openclaw/openclaw.json /home/chensoul/.openclaw/

# 设置 ownership
sudo chown -R chensoul:chensoul /home/chensoul/.openclaw/
```



2. 更新技能目录权限

```bash
# 查看 node 版本
node -v

# 注意 node 安装版本 
sudo chown -R chensoul:chensoul /root/.nvm/versions/node/v25.8.0/lib/node_modules/openclaw/skills/
```



3. 切换到 chensoul 用户

```bash
sudo su - chensoul
```



4. 重新安装或链接 CLI

如果 openclaw 命令不可用，需要在 chensoul 用户下安装：

```bash
# 在当前用户安装 nvm
export NVM_DIR="$HOME/.nvm"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
source .bashrc

# 安装 Node.js (如果还没安装)
nvm install 25.8.0
nvm use 25.8.0

# 重新安装 openclaw
curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
```



5. 更新环境变量

在 /home/chensoul/.bashrc 中添加：

```bash
export OPENCLAW_WORKSPACE=/home/chensoul/.openclaw/workspace
```

并使配置生效：

```bash
source /home/chensoul/.bashrc
```

现在需要更新 openclaw.json 的配置，将 /root/.openclaw 改为 /home/chensoul/.openclaw

```bash
sed -i 's|/root/\.openclaw|/home/chensoul/.openclaw|g' /home/chensoul/.openclaw/openclaw.json
```



6. 复制并更新 crontab

```bash
# 在 root 下导出 crontab
sudo crontab -l > /tmp/root-crontab.txt

# 编辑 crontab 中的路径
# 将 /root/.openclaw 替换为 /home/chensoul/.openclaw

# 切换到 chensoul 用户后导入
crontab /tmp/root-crontab.txt
```



7. 停止 root 下的 OpenClaw
8. 卸载 root 下的 OpenClaw（可选）

如果你想完全移除 root 下的 OpenClaw：

```bash
# 卸载 npm 包
npm uninstall -g openclaw

rm -rf /etc/systemd/system/openclaw-gateway.service 
sudo systemctl daemon-reload
```

或者保留 CLI 但只保留公共文化资源。如果你以后需要在 root 下运行某些系统任务，可以只保留 CLI

















