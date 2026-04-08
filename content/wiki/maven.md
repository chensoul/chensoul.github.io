---
title: "Maven"
date: 2026-03-11 10:30:00+08:00
slug: "maven"
tags: [ "maven" ]
draft: false
categories: [ "wiki" ]
description: "Maven 插件与仓库实践笔记：常用插件、格式化与 BOM、参考 pom 与父 POM 链接。"
favicon: "maven.svg"
---

## Maven 插件使用

https://github.com/OpenFeign/feign/blob/master/pom.xml：

- openrewrite：
- easy-jacoco-maven-plugin：合并 jacoco 报告，需要 java 17
- maven-enforcer-plugin：限制不能使用快照版本
- sundr-maven-plugin：使用 maven 插件创建 bom 模块
- sortpom-maven-plugin：对 pom 排序
- git-code-format-maven-plugin：使用 https://github.com/google/google-java-format 代码格式化
- com.mycila:license-maven-plugin：添加 license
- site:

- https://github.com/s4u/parent

## Maven 仓库

- https://github.com/smallrye/smallrye-parent 支持不同 Java 版本
