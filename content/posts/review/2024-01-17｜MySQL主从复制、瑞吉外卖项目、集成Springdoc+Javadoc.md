---
title: "2024-01-17｜MySQL 主从复制、瑞吉外卖项目、集成Springdoc+Javadoc"
date: 2024-01-17T07:00:00+08:00
slug: til
categories: ["Review"]
tags: [springdoc,'spring-boot',mysql,docker]
---



今天做了什么：

1. 观看《2022年黑马程序员新版java课程》中 MySQL 主从复制和读写分离相关视频，使用 Docker 搭建 MySQL 主从复制环境。

2. [foodie-cloud](https://github.com/chensoul/foodie-cloud) 已归档，不再更新，改为更新瑞吉外卖项目 [reggie](https://github.com/chensoul/reggie) 。



## Docker 搭建 MySQL 主从复制环境

参考文章 ：[基于 Docker 的 MySQL 主从复制搭建及原理（真正弄懂）](https://learnku.com/articles/30439)

先创建两个容器：

```bash
MYSQL_ROOT_PASSWORD=123456

docker run \
  -d \
  --restart unless-stopped \
  --name mysql-master \
  -p 3307:3306 \
  -e MYSQL_ROOT_HOST="%" \
  -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
  -e TZ=Asia/Shanghai \
  mysql:8.1.0 \
  --log-bin=mysql-bin \
  --server-id=1 \
  --lower_case_table_names=1  \
  --skip-ssl \
  --explicit_defaults_for_timestamp \
  --default-authentication-plugin=mysql_native_password
  
docker run \
  -d \
  --restart unless-stopped \
  --name mysql-slave \
  -p 3308:3306 \
  -e MYSQL_ROOT_HOST="%" \
  -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
  -e TZ=Asia/Shanghai \
  mysql:8.1.0 \
  --log-bin=mysql-bin \
  --server-id=2 \
  --lower_case_table_names=1  \
  --skip-ssl \
  --explicit_defaults_for_timestamp \
  --default-authentication-plugin=mysql_native_password
```

进入主数据库，设置权限，并查询主库状态：

```bash
docker exec -it mysql-master /bin/bash

mysql -uroot -p123456
CREATE USER 'xiaoming'@'%' IDENTIFIED BY 'Root@123456';
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'xiaoming'@'%';

SHOW MASTER STATUS;
```



进入从数据库，连接主库并开启复制：

```bash
# 查询主库IP：192.168.215.4
docker inspect --format='{{.NetworkSettings.IPAddress}}' mysql-master

docker exec -it mysql-slave /bin/bash

mysql -uroot -p123456
> change master to master_host='192.168.215.4',master_user='xiaoming',master_password='Root@123456',master_log_file='mysql-bin.000003',master_log_pos=688;

>SHOW SLAVE STATUS \G;
```

正常情况下，SlaveIORunning 和 SlaveSQLRunning 都是 No，因为我们还没有开启主从复制过程。使用 start slave 开启主从复制过程，然后再次查询主从同步状态 show slave status \G;。

```bash
>start slave;
>SHOW SLAVE STATUS \G;
>SHOW BINARY LOGS;
```



## 瑞吉外卖项目

 [reggie](https://github.com/chensoul/reggie) 该项目是一个基于 Spring Boot2、Mybatis Plus、Docker 等前沿技术搭建的黑马程序员《瑞吉外卖》单体项目，包含了用户、员工、订单、菜品等模块。

项目介绍如下：

### 特性

- 主体框架：采用 Spring Boot2 版本进行系统设计。
- 在线文档：通过接入 OpenAPI，实现在线 API 文档的查看与调试。
- 业务分离：采用前后端分离的框架设计，提高开发效率、降低维护成本、增强系统稳定性和灵活性。
- 消息中间件：采用 ActiveMQ 实现服务之间消息转发。
- 分布式定时器：采用 XxlJob 实现多个微服务分布式任务调度。

### 开发环境

| 组件          | 用途  	  |              版本号              |
|:------------|:------:|:-----------------------------:|
| Maven       |  依赖管理  |            3.0.4以上            |
| Java        | 编译运行项目 | 1.8以上（推荐8u161以后的版本，否则要装JCE插件） |
| IDEA        |  开发环境  |             版本随意              |
| MySQL       |  数据库   |              5.7              |
| Redis     	 | 缓存组件 	 |             5.0.4             |
| RabbitMQ    | 消息中间件  |            3.7.15             |
| Kafka       | 消息中间件  |             2.2.0
| Lua         |  限流脚本  |             5.3.5             |

### 版本依赖

| 依赖                                                            | 本项目版本  | 新版                                                                                                                                                                                                                                 | 说明                                               |
|---------------------------------------------------------------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------|
| [spring-boot](https://github.com/spring-projects/spring-boot) | 2.7.18 | <img src="https://img.shields.io/maven-metadata/v?label=&color=blue&versionPrefix=2.&metadataUrl=https://s01.oss.sonatype.org/content/repositories/releases/org/springframework/boot/spring-boot-dependencies/maven-metadata.xml"> | 限制 Spring Boot 2.x                               |
| [mybatis](https://github.com/mybatis/spring-boot-starter)     | 2.1.3  | <img src="https://img.shields.io/maven-metadata/v?label=&color=blue&versionPrefix=2.&metadataUrl=https://oss.sonatype.org/content/repositories/releases/org/mybatis/spring/boot/mybatis-spring-boot-starter/maven-metadata.xml">   | 限制 Spring Boot 2.x，指 mybatis-spring-boot-starter |
| [mybatis-plus](https://github.com/baomidou/mybatis-plus)      | 3.5.5  | <img src="https://img.shields.io/maven-metadata/v?label=&color=blue&metadataUrl=https://oss.sonatype.org/content/repositories/releases/com/baomidou/mybatis-plus-boot-starter/maven-metadata.xml">                                 |                                                  |
| [springdoc](https://github.com/springdoc)                     | 1.7.0  | <img src="https://img.shields.io/maven-metadata/v?label=&color=blue&metadataUrl=https://oss.sonatype.org/content/repositories/releases/org/springdoc/springdoc-openapi-ui/maven-metadata.xml">                                     | 用于生成 API doc，支持从 javadoc 中获取字段注释                 |
| [shardingsphere-jdbc](https://github.com/springdoc)           | 4.1.1  | <img src="https://img.shields.io/maven-metadata/v?label=&color=blue&metadataUrl=https://oss.sonatype.org/content/repositories/releases/org/apache/shardingsphere/sharding-jdbc-spring-boot-starter/maven-metadata.xml">            | MySQL 主从复制、读写分离                                  |
| [xxl-job](https://github.com/xuxueli/xxl-job)                 | 2.4.0  | <img src="https://img.shields.io/maven-metadata/v?label=&color=blue&metadataUrl=https://oss.sonatype.org/content/repositories/releases/com/xuxueli/xxl-job/maven-metadata.xml">                                                    | 分布式任务调度平台XXL-JOB                                 |

### 开发计划

- [x] 集成 Springdoc，实现在线 API 文档的查看与调试
- [ ] LVS + Keepalive + Nginx 实现高可用集群
- [ ] Redis 主从复制高可用集群
- [ ] MySQL 主从复制和读写分离
- [ ] 分布式会话与单点登录SSO
- [ ] 分布式搜索引擎 Elasticsearch
- [ ] 分布式消息队列 RabbitMQ
- [ ] 分布式锁
- [ ] 分布式事务和数据一致性
- [ ] 分布式接口幂等性，分布式限流
- [ ] 容器化部署

## 集成 Springdoc + Javadoc
1. 添加依赖

spring-boot2 使用 springdoc-openapi 1.7.0 版本

```xml

<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
</dependency>
<dependency>
<groupId>org.springdoc</groupId>
<artifactId>springdoc-openapi-javadoc</artifactId>
</dependency>
```

2. 集成 springdoc 使用 javadoc 注释作为文档

参考 [https://springdoc.org/#javadoc-support](https://springdoc.org/#javadoc-support) ，修改 maven-compiler-plugin 插件：

```xml

<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>${maven-compiler-plugin.version}</version>
    <configuration>
        <parameters>true</parameters>
        <annotationProcessorPaths>
            <!-- https://springdoc.org/#javadoc-support -->
            <path>
                <groupId>com.github.therapi</groupId>
                <artifactId>therapi-runtime-javadoc-scribe</artifactId>
                <version>${therapi-runtime-javadoc.version}</version>
            </path>
            <!-- 修复 lombok、springdoc 冲突 -->
            <path>
                <groupId>org.projectlombok</groupId>
                <artifactId>lombok</artifactId>
                <version>${lombok.version}</version>
            </path>
        </annotationProcessorPaths>
    </configuration>
</plugin>
```

添加依赖：

```xml

<dependency>
    <groupId>com.github.therapi</groupId>
    <artifactId>therapi-runtime-javadoc</artifactId>
    <version>${therapi-runtime-javadoc.version}</version>
</dependency>
```

3. 启动应用

访问：

- [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

> 说明：
>
> - 访问 swagger-ui.html 会显示 petstore 的 api 接口信息。具体原因，可以参考 [https://stackoverflow.com/questions/71721477/springdoc-swagger-ui-not-using-swagger-config](https://stackoverflow.com/questions/71721477/springdoc-swagger-ui-not-using-swagger-config)
> - 目前，没有找到解决办法。曲线救国的方法是使用其他 Swagger UI，如 Knife4j。
