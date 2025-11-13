# ChenSoul Blog

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://blog.chensoul.cc)
[![Hugo](https://img.shields.io/badge/Hugo-0.149.0-blue)](https://gohugo.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> 一个专注于 Java、Spring Boot、微服务、云架构和 DevOps 的技术博客网站

## 🌟 特性

- 📱 **响应式设计** - 基于 rose-hugo 主题，完美适配各种设备
- 🚀 **高性能** - 使用 Hugo 静态站点生成器，加载速度极快
- 🎨 **图片优化** - 自动压缩和 WebP 格式转换
- 📝 **多分类支持** - 架构、DevOps、前端、Java、K8s、微服务等
- 🔍 **SEO 友好** - 完整的 sitemap 和 RSS 支持
- 💬 **评论系统** - 集成 Remark42 评论系统
- 🌐 **国际化** - 支持中文内容展示
- ⚡ **CI/CD** - 自动化部署到 Cloudflare Pages

## 🛠 技术栈

- **静态站点生成器**: [Hugo](https://gohugo.io/) v0.149.0
- **主题**: [rose-hugo](https://github.com/your-theme-repo)
- **包管理器**: npm
- **图片处理**: imagemin, imagemin-webp, imagemin-pngquant
- **部署平台**: Cloudflare Pages
- **CI/CD**: GitHub Actions

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- Hugo >= 0.100.0 (通过 hugo-bin 自动安装)

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/chensoul/chensoul.github.io.git
cd chensoul.github.io

# 安装依赖
npm install
```

### 本地开发

```bash
# 启动开发服务器（包含图片优化）
npm run dev

# 或者直接启动 Hugo 服务器
npm run serve
```

访问 http://localhost:1313 查看网站

### 构建部署

```bash
# 清理旧文件
npm run clean

# 构建生产版本
npm run build

# 优化图片
npm run images:optimize
```

## 📁 项目结构

```
├── content/                 # 内容目录
│   ├── posts/              # 博客文章
│   │   ├── architecture/   # 架构相关文章
│   │   ├── devops/         # DevOps 相关文章
│   │   ├── java/           # Java 相关文章
│   │   ├── k8s/            # Kubernetes 相关文章
│   │   ├── spring-boot/    # Spring Boot 相关文章
│   │   └── ...
│   ├── about.md            # 关于页面
│   └── tools.md            # 工具页面
├── static/                 # 静态资源
│   ├── images/             # 图片资源
│   └── favicon.ico         # 网站图标
├── themes/                 # 主题目录
│   └── rose-hugo/          # 当前使用的主题
├── scripts/                # 脚本目录
│   └── optimize-images.mjs # 图片优化脚本
├── config.toml             # Hugo 配置文件
├── package.json            # npm 配置文件
└── README.md               # 项目说明文档
```

## ✍️ 内容管理

### 添加新文章

1. 在 `content/posts/` 对应分类目录下创建新的 Markdown 文件
2. 文件命名格式：`YYYY-MM-DD-文章标题.md`
3. 添加 Front Matter：

```yaml
---
title: "文章标题"
date: 2024-01-01T00:00:00+08:00
categories: ["分类名称"]
tags: ["标签1", "标签2"]
description: "文章描述"
---

文章内容...
```

### 分类说明

- **architecture**: 系统架构、设计模式、分布式系统
- **devops**: 运维、CI/CD、容器化、监控
- **java**: Java 语言、JVM、并发编程
- **spring-boot**: Spring Boot 框架相关
- **k8s**: Kubernetes、容器编排
- **microservice**: 微服务架构
- **frontend**: 前端技术
- **python**: Python 编程
- **note**: 学习笔记、周报

## 🔧 配置说明

### 主要配置项 (config.toml)

```toml
baseURL = "https://blog.chensoul.cc/"     # 网站 URL
title = "ChenSoul Blog"                   # 网站标题
theme = "rose-hugo"                       # 使用的主题
defaultContentLanguage = 'zh-cn'         # 默认语言

[params]
  author = "ChenSoul"                     # 作者名称
  description = "技术博客描述"            # 网站描述

[params.social]                           # 社交媒体链接
  github = "chensoul"
  twitter = "ichensoul"
  mastodon = "ichensoul"
```

### npm 脚本说明

```json
{
  "scripts": {
    "dev": "图片优化 + 启动开发服务器",
    "serve": "启动 Hugo 开发服务器",
    "build": "构建生产版本到 build 目录",
    "clean": "清理构建文件和缓存",
    "images:optimize": "优化图片并转换为 WebP 格式"
  }
}
```

## 🚀 部署流程

### 自动部署 (推荐)

项目配置了 GitHub Actions 自动部署：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动触发构建
3. 构建完成后自动部署到 Cloudflare Pages

### 手动部署

```bash
# 1. 构建项目
npm run build

# 2. 将 build 目录内容上传到服务器
# 或者使用 deploy.sh 脚本
./deploy.sh
```

## 🎨 主题定制

当前使用的是 `rose-hugo` 主题，如需定制：

1. 修改 `themes/rose-hugo/` 目录下的文件
2. 或者在项目根目录创建对应的覆盖文件
3. 重新构建项目

## 📊 性能优化

### 图片优化

项目集成了自动图片优化功能：

- 自动压缩 PNG 图片
- 转换为 WebP 格式以减小文件大小
- 保持原始图片质量的同时优化加载速度

```bash
# 手动运行图片优化
npm run images:optimize
```

### SEO 优化

- 自动生成 sitemap.xml
- RSS 订阅支持
- 语义化 HTML 结构
- Meta 标签优化

## 🤝 贡献指南

欢迎贡献代码和内容！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 内容贡献

- 欢迎提交高质量的技术文章
- 支持原创内容和优质翻译
- 请确保内容准确性和实用性

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- **作者**: ChenSoul
- **博客**: https://blog.chensoul.cc
- **GitHub**: [@chensoul](https://github.com/chensoul)
- **Twitter**: [@ichensoul](https://twitter.com/ichensoul)

## 🙏 致谢

- [Hugo](https://gohugo.io/) - 优秀的静态站点生成器
- [rose-hugo](https://github.com/rose-hugo) - 美观的 Hugo 主题
- [Cloudflare Pages](https://pages.cloudflare.com/) - 可靠的托管服务

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！
