---
title: "Wiki 笔记｜Github"
date: 2026-03-11 10:30:00+08:00
slug: "github"
tags: ['github']
draft: false
categories: [ "wiki" ]
description: "GitHub Actions 实践索引：Maven 发布、多版本构建、集成测试与 release 工作流示例链接。"
---

## Github Action

Maven 构建：

- 常规的推送到 maven 中央仓库：

- https://github.com/modelcontextprotocol/java-sdk/blob/main/.github/workflows/maven-central-release.yml
- https://github.com/langchain4j/langchain4j-embeddings/blob/main/.github/workflows/release.yaml

- 使用共享的脚本：https://github.com/mojohaus/versions/blob/master/.github/workflows/maven.yml
- 使用 sdkman 和 toolchains.xml 测试多 java 版本构建：https://github.com/OpenFeign/feign/blob/master/.github/workflows/build.yml
- 多 java 版本构建，使用了 jbang 工具，并上传了构建 https://github.com/dekorateio/dekorate/blob/main/.github/workflows/build.yml
- 集成 k8s 测试：https://github.com/dekorateio/dekorate/blob/main/.github/workflows/integration-tests-with-dockerio.yml
- 使用自定义的 release.sh 脚本发布到 maven 仓库：https://github.com/dekorateio/dekorate/blob/main/.github/workflows/release.yml
- 基于 project.yml 使用 `mvnw versions:set` 命令文件推送到 maven 仓库：https://github.com/sundrio/sundrio/blob/main/.github/workflows/release.yml
- 基于 project.yml 使用 `mvnw release:prepare` 命令文件推送到 maven 仓库 https://github.com/smallrye/smallrye-parent/blob/main/.github/workflows/release.yml
- 基于 spring boot 3 使用 jreleaser 发布不同操作系统的安装包https://github.com/wimdeblauwe/ttcli/blob/main/.github/workflows/release.yml

PR：

- 关闭之后自动打上标签：https://github.com/mojohaus/versions/blob/master/.github/workflows/pr-automation.yml
- 关闭长期未处理的 PR 和 Issure：https://github.com/mojohaus/versions/blob/master/.github/workflows/stale.yml
- 自动合并 Dependabot 的 PR：https://github.com/OpenFeign/feign/blob/master/.github/workflows/auto-merge-dependabot.yml
- 添加 PR 到 Project：https://github.com/langchain4j/langchain4j-embeddings/blob/main/.github/workflows/add_new_pr_to_project.yaml
- PR 机器人：https://github.com/langchain4j/langchain4j-embeddings/blob/main/.github/workflows/pr-bot.yaml
- PR 关联 milestone：https://github.com/smallrye/smallrye-config/blob/main/.github/workflows/update-milestone.yml
- 创建 PR：https://github.com/jhipster/jdl-studio/blob/src/.github/workflows/update-jhipster-online.yml

发布标签：

- 使用共享的脚本：https://github.com/mojohaus/versions/blob/master/.github/workflows/release-drafter.yml

视频：

- https://www.youtube.com/watch?v=oQwaH_hlBzk
