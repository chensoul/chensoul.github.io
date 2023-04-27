---
title: "周报-17｜"
date: 2023-xx-xx 09:00:00+08:00
draft: true
slug: weekly_review_17
categories: [Ideas]
tags: [review]
authors:
- chensoul
---

## 前言

本篇是对 `2023-xx-xx` 到 `2023-xx-xx` 这周生活的记录与思考。首发在我的个人 [博客](https://blog.chensoul.com/)，你可以移步了解更多或者给我留言。



https://sspai.com/post/42135



## 工作

### FlexyPool

FlexyPool 是一个用于监控数据库连接池的开源工具。它支持监控和报告连接池的使用情况、性能和瓶颈，以及自动调整连接池的大小和行为。FlexyPool 支持多种流行的 Java 数据库连接池，例如 HikariCP、Tomcat JDBC Pool、C3P0、BoneCP 等等。

FlexyPool 主要提供以下功能：

1. 监控连接池的使用情况，包括连接数、请求数、等待时间、执行时间等等。
2. 报告连接池的性能和瓶颈，例如最慢的查询、最频繁的错误、最短的连接时间等等。
3. 自动调整连接池的大小和行为，以提高性能和减少资源消耗。
4. 集成到常见的监控工具中，例如 Prometheus、Grafana、InfluxDB 等等。

FlexyPool 的使用相对简单，只需要将其添加到应用程序的依赖中，然后配置连接池和 FlexyPool 的参数即可。例如，如果你正在使用 HikariCP 连接池，可以按照以下步骤配置 FlexyPool：

1、添加 FlexyPool 的依赖到应用程序的 pom.xml 文件中：

```xml
<dependency>
  <groupId>com.vladmihalcea.flexypool</groupId>
  <artifactId>flexy-pool-core</artifactId>
  <version>2.0.2</version>
</dependency>
```

2、在应用程序的配置文件中，配置连接池和 FlexyPool 的参数：

```properties
# HikariCP 数据库连接池配置
hikari.dataSourceClassName=com.mysql.jdbc.jdbc2.optional.MysqlDataSource
hikari.dataSource.url=jdbc:mysql://localhost:3306/mydb
hikari.dataSource.user=root
hikari.dataSource.password=secret
hikari.minimumIdle=10
hikari.maximumPoolSize=20
hikari.idleTimeout=30000
hikari.poolName=hikariPool

# FlexyPool 配置
flexyPool.metricsFactory=histogram
flexyPool.metric.log.enabled=true
flexyPool.metric.log.level=info
flexyPool.metric.log.interval=10
flexyPool.metric.prometheus.enabled=true
flexyPool.metric.prometheus.port=9090
```

在这个配置中，我们首先配置了 HikariCP 连接池的参数，然后配置了 FlexyPool 的参数。这些参数包括度量工厂、日志和度量记录的级别、度量记录的间隔、是否启用 Prometheus 集成等等。

3、在应用程序启动时，将 FlexyPool 的代理对象添加到连接池中：

```java
DataSource dataSource = ...; // 获取连接池对象
FlexyPoolDataSource flexyPoolDataSource = new FlexyPoolDataSource<>(dataSource);
```

在这个代码中，我们首先获取 HikariCP 连接池对象，然后将其包装成 FlexyPool 的代理对象。这样，所有的数据库操作都将通过 FlexyPool 进行代理和监控。



Baeldung 网站上有一篇介绍 Spring Boot 中如何使用 FlexyPool 连接池监控工具的教程，名为 [A Guide to FlexyPool in Spring Boot](https://www.baeldung.com/spring-flexypool-guide)。

这篇文章首先介绍了 FlexyPool 工具的作用，以及如何将其集成到 Spring Boot 应用程序中。FlexyPool 可以监控和报告连接池的使用情况、性能和瓶颈，以及自动调整连接池的大小和行为，以提高性能和减少资源消耗。

然后，文章介绍了如何在 Spring Boot 应用程序中使用 FlexyPool。具体步骤包括：

1. 添加 FlexyPool 的依赖到应用程序的 pom.xml 文件中。
2. 配置连接池和 FlexyPool 的参数，例如 HikariCP 连接池的参数、FlexyPool 的度量工厂、日志和度量记录的级别、度量记录的间隔、是否启用 Prometheus 集成等等。
3. 创建 FlexyPoolDataSource 对象，作为连接池的代理对象。该对象将自动创建和管理连接池，并使用 FlexyPool 工具进行监控和调整。
4. 在应用程序中使用连接池，例如获取连接、执行 SQL 语句、关闭连接等等。

最后，文章总结了一些连接池监控和优化的最佳实践，例如：

1. 使用 FlexyPool 工具监控连接池的使用情况和性能瓶颈，以及调整连接池的大小和行为，以提高性能和减少资源消耗。
2. 配置连接池和 FlexyPool 的参数，以适应应用程序的负载和性能要求。
3. 避免连接池泄漏和死锁等问题，例如及时关闭连接、设置合理的超时时间等等。
