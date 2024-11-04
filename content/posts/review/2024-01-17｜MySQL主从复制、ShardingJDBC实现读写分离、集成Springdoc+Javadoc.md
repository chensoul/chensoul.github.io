---
title: "2024-01-17｜MySQL 主从复制、ShardingJDBC实现读写分离、集成Springdoc+Javadoc"
date: 2024-01-17
type: post
slug: til
categories: ["Review"]
tags: ['spring-boot',docker]
---



今天做了什么：

1. 观看《2022年黑马程序员新版java课程》中 MySQL 主从复制和读写分离相关视频，使用 Docker 搭建 MySQL 主从复制环境。
1.  [foodie-cloud](https://github.com/chensoul/foodie-cloud) 项目实现读写分离并集成 Springdoc



## Docker 搭建 MySQL 主从复制环境

参考文章 ：[基于 Docker 的 MySQL 主从复制搭建及原理（真正弄懂）](https://learnku.com/articles/30439)

先创建两个容器：

```bash
version: '3.8'

services: 
  mysql-master:
    image: mysql:8
    restart: always
    env_file:
      - .env
    ports:
      - "3307:3306"
    environment:
      - TZ=Asia/Shanghai
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    command: --default-authentication-plugin=mysql_native_password --explicit_defaults_for_timestamp=true --lower_case_table_names=1 --tls-version='' --log-bin=mysql-bin --server-id=1
    healthcheck:
      test: "/usr/bin/mysql --user=${MYSQL_USER} --password=${MYSQL_PASSWORD} -e 'SHOW DATABASES;'"
      interval: 5s
      timeout: 2s
      retries: 10

  mysql-slave:
    image: mysql:8
    restart: always
    env_file:
      - .env
    ports:
      - "3308:3306"
    environment:
      - TZ=Asia/Shanghai
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    command: --default-authentication-plugin=mysql_native_password --explicit_defaults_for_timestamp=true --lower_case_table_names=1 --tls-version='' --log-bin=mysql-bin --server-id=2
    healthcheck:
      test: "/usr/bin/mysql --user=${MYSQL_USER} --password=${MYSQL_PASSWORD} -e 'SHOW DATABASES;'"
      interval: 5s
      timeout: 2s
      retries: 10
```

.env 文件：

```
TZ=Asia/Shanghai

MYSQL_ROOT_PASSWORD=123456
MYSQL_DATABASE=foodie-cloud
MYSQL_USER=foodie
MYSQL_PASSWORD=foodie
```



主数据库：

```sql
docker exec -it mysql-master /bin/bash

mysql -uroot -p123456
CREATE USER 'test'@'%' IDENTIFIED BY '123456';
GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'test'@'%';

SHOW MASTER STATUS;
```



从数据库：

```sql
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mysql-master

docker exec -it mysql-slave /bin/bash

mysql -uroot -p123456
> change master to master_host='192.168.215.4',master_user='test',master_password='123456',master_log_file='mysql-bin.000003',master_log_pos=642;

>SHOW SLAVE STATUS \G;
```

正常情况下，SlaveIORunning 和 SlaveSQLRunning 都是 No，因为我们还没有开启主从复制过程。使用 start slave 开启主从复制过程，然后再次查询主从同步状态 show slave status \G;。

```sql
>start slave;
>SHOW SLAVE STATUS \G;
>SHOW BINARY LOGS;
```

## ShardingJDBC实现读写分离

### 介绍

Sharding-JDBC定位为轻量级Java框架，在Java的JDBC层提供的额外服务。 它使用客户端直连数据库，以jar包形式提供服务，无需额外部署和依赖，可理解为增强版的JDBC驱动，完全兼容JDBC和各种ORM框架。

使用Sharding-JDBC可以在程序中轻松的实现数据库读写分离。



Sharding-JDBC具有以下几个特点： 

1). 适用于任何基于JDBC的ORM框架，如：JPA, Hibernate, Mybatis, Spring JDBC Template或直接使用JDBC。

2). 支持任何第三方的数据库连接池，如：DBCP, C3P0, BoneCP, Druid, HikariCP等。

3). 支持任意实现JDBC规范的数据库。目前支持MySQL，Oracle，SQLServer，PostgreSQL以及任何遵循SQL92标准的数据库。



### 配置

1). 在pom.xml中增加shardingJdbc的maven坐标

```xml
<dependency>
    <groupId>org.apache.shardingsphere</groupId>
    <artifactId>sharding-jdbc-spring-boot-starter</artifactId>
    <version>4.1.1</version>
</dependency>
```



2). 在application.yml中增加数据源的配置

先注释原来的数据源配置：

```yml
#spring.datasource:
#  url: jdbc:mysql://${mysql:mysql}:3306/foodie-cloud?connectTimeout=2000&socketTimeout=150000&allowMultiQueries=true&useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
#  driver-class-name: com.mysql.cj.jdbc.Driver
#  username: foodie
#  password: foodie
```

然后，添加 shardingsphere 配置：

```yml
spring.shardingsphere:
  datasource:
    names:
      master,slave
    master:
      type: com.zaxxer.hikari.HikariDataSource
      driver-class-name: com.mysql.cj.jdbc.Driver
      jdbcUrl: jdbc:mysql://${mysql-master:mysql-master}:3307/foodie-cloud?connectTimeout=2000&socketTimeout=150000&allowMultiQueries=true&useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
      username: foodie
      password: foodie
    slave:
      type: com.zaxxer.hikari.HikariDataSource
      driver-class-name: com.mysql.cj.jdbc.Driver
      jdbcUrl: jdbc:mysql://${mysql-slave:mysql-slave}:3308/foodie-cloud?connectTimeout=2000&socketTimeout=150000&allowMultiQueries=true&useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
      username: foodie
      password: foodie
  master-slave:
    load-balance-algorithm-type: round_robin
    # 最终的数据源名称
    name: dataSource
    # 主库数据源名称
    master-data-source-name: master
    # 从库数据源名称列表，多个逗号分隔
    slave-data-source-names: slave
  props:
    sql:
      show: true
```

增加下面配置，允许 bean 覆盖：

```yml
spring:  
  main:
    allow-bean-definition-overriding: true
```

3). 在本地的 hosts 文件添加：

```bash
127.0.0.1 mysql-master
127.0.0.1 mysql-slave
```

4). 启动应用

在启动过程中出现异常：

```bash
Caused by: java.sql.SQLFeatureNotSupportedException: isValid
```

Sharding Sphere 不支持数据库健康检查，关闭数据库健康检查即可。

```yml
# Sharding Sphere 不支持数据库健康检查
management.health.db.enabled: false
```



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
