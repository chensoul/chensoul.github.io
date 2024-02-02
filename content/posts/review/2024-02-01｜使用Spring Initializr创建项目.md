---
title: "2024-02-01｜使用 Spring Initializr 创建项目"
date: 2024-02-01T07:00:00+08:00
slug: til
categories: ["Review"]
tags: [redis]
---



今天做了什么：

1. 重构 [foodie-cloud](https://github.com/chensoul/foodie-cloud) 项目，部署到 docker 容器
1. 使用 Spring Initializr 创建项目



## 使用 Spring Initializr 创建项目

```bash
brew tap pivotal/tap
brew install springboot


spring init \
--boot-version=3.1.0 \
--type=maven-project \
--java-version=8 \
--packaging=jar \
--name=product-service \
--package-name=com.chensoul.product \
--groupId=com.chensoul.product \
--dependencies=actuator,webflux \
--version=1.0.0-SNAPSHOT \
product-service
```



