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

1. 安装  spring cli

   使用 brew 安装的 spring cli 版本是 3.x 版本

   ```bash
   brew tap pivotal/tap
   brew install springboot
   ```

   使用 sdkman 安装：

   ```bash
   sdk install springboot 3.2.2
   ```

   查看版本：

   ```bash
   $ spring version
   Spring CLI v3.2.2
   ```

   

2. 查看 spring cli 支持的命令

```bash
spring help
```

查看 init 命令说明：

```bash
spring help init
```

参考 spring init 命令：

```bash
spring init --list
```

可以看到支持的依赖

```bash
activemq
actuator
amqp
artemis
azure-active-directory
azure-cosmos-db
azure-keyvault
azure-storage
azure-support
batch
cache
camel
cloud-bus
cloud-config-client
cloud-config-server
cloud-contract-stub-runner
cloud-contract-verifier
cloud-eureka
cloud-eureka-server
cloud-feign
cloud-function
cloud-gateway
cloud-gateway-reactive
cloud-gcp
cloud-gcp-pubsub
cloud-gcp-storage
cloud-loadbalancer
cloud-resilience4j
cloud-starter
cloud-starter-consul-config
cloud-starter-consul-discovery
cloud-starter-vault-config
cloud-starter-zookeeper-config
cloud-starter-zookeeper-discovery
cloud-stream
cloud-task
codecentric-spring-boot-admin-client
codecentric-spring-boot-admin-server
configuration-processor
data-cassandra
data-cassandra-reactive
data-couchbase
data-couchbase-reactive
data-elasticsearch
data-jdbc
data-jpa
data-ldap
data-mongodb
data-mongodb-reactive
data-neo4j
data-r2dbc
data-redis
data-redis-reactive
data-rest
data-rest-explorer
datadog
db2
derby
devtools
dgs-codegen
distributed-tracing
docker-compose
dynatrace
flyway
freemarker
graphite
graphql
groovy-templates
h2
hateoas
hilla
hsql
influx
integration
jdbc
jersey
jooq
kafka
kafka-streams
liquibase
lombok
mail
mariadb
modulith
mustache
mybatis
mysql
native
new-relic
oauth2-authorization-server
oauth2-client
oauth2-resource-server
okta
oracle
picocli
postgresql
prometheus
pulsar
pulsar-reactive
quartz
restdocs
rsocket
scs-config-client
scs-service-registry
security
sentry
session
solace
spring-shell
sqlserver
testcontainers
thymeleaf
timefold-solver
unboundid-ldap
vaadin
validation
wavefront
web
web-services
webflux
websocket
zipkin
```

支持的构建系统有：

```bash
gradle-build
gradle-project
gradle-project-kotlin
maven-build
maven-project
```

支持的参数有：

- artifactId
- bootVersion
- description
- groupId
- javaVersion
- language
- name
- packageName
- packaging
- type
- version

3. 创建项目

spring init 使用的是  [start.spring.io](https://start.spring.io/) 创建项目，而目前  [start.spring.io](https://start.spring.io/) 支持的 spring boot 版本最低为 3.1.0。如果想创建 spring boot2 的项目，需要创建项目之后手动修改版本号。

```bash
spring init \
--boot-version=3.2.2 \
--type=maven-project \
--java-version=8 \
--name=config-file \
--package-name=com.chensoul.springcloud \
--groupId=com.chensoul.springcloud \
--dependencies=cloud-config-server \
config-file
```
