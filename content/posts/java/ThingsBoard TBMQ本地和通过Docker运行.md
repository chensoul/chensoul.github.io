---
title: "ThingsBoard TBMQ本地和通过Docker运行"
date: 2024-04-17T08:00:00+08:00
slug: thingsboard-tbmq-local-docker-run
draft: false
categories: ["Java"]
tags: [ thingsboard,java]
---

## docker-compose 运行

参考：[https://thingsboard.io/docs/mqtt-broker/install/cluster/docker-compose-setup/](https://thingsboard.io/docs/mqtt-broker/install/cluster/docker-compose-setup/)

1. 下载源代码

   ```bash
   git clone -b release-1.3.0 https://github.com/thingsboard/tbmq.git
   cd tbmq/docker
   ```

2. 创建逻辑卷并执行安装程序

   ```bash
   ./scripts/docker-create-volumes.sh
   ./scripts/docker-install-tbmq.sh
   ```

3. 运行服务

   ```bash
   ./scripts/docker-start-services.sh
   ```

   浏览器访问：[http://localhost:8083](http://localhost:8083)，用户名/密码：sysadmin@thingsboard.org / sysadmin

   

   查看 HaProxy 日志，发现出现异常：`Error: Specified qdisc kind is unknown.` 。

   目前，尚未找到解决办法，只能不使用 HaProxy 而是直接访问 tbmq1，修改 docker-compose.yml ，暴露容器端口 8083 到本地的 8083：
   
   ```yaml
     tbmq1:
       restart: always
       container_name: "${TBMQ_1_NAME}"
       image: "${DOCKER_REPO}/${DOCKER_NAME}:${TBMQ_VERSION}"
       ports:
         - "1883"
         - "8083:8083" #修改这里
         - "8084"
   ```
   
   然后，通过浏览器访问 浏览器访问：**http://localhost:8081**

## 源码编译并运行

1. 安装好 JDK 17+ 和 Maven3.6.3+

2. 下载源代码

   ```bash
   git clone -b release-1.3.0 https://github.com/thingsboard/tbmq.git
   cd tbmq
   ```

3. 编译代码

   ``` bash
   mvn clean install -DskipTests
   ```

4. 通过 docker-compose 本地安装 postgres、kafka、redis

   参考 docker 目录下的文件新建一个 docker-compose-test.yml 文件：

   ```yaml
   version: "3.0"
   
   services:
     postgres:
       restart: always
       image: "postgres:15"
       ports:
         - "5432:5432"
       environment:
         POSTGRES_DB: thingsboard_mqtt_broker
         POSTGRES_PASSWORD: postgres
   
     kafka:
       restart: always
       image: "bitnami/kafka:3.7.0"
       ports:
         - "9092:9092"
       env_file:
         - kafka.env
   
     redis:
       restart: always
       image: bitnami/redis:7
       environment:
         # ALLOW_EMPTY_PASSWORD is recommended only for development.
         ALLOW_EMPTY_PASSWORD: "yes"
       ports:
         - "6379:6379"
   ```

   然后，修改 kafka.env 文件中 `KAFKA_CFG_ADVERTISED_LISTENERS` 的地址为 docker 宿主机 IP 地址
   ```bash
   KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://198.19.249.3:9092
   ```

   maco上查看docker 宿主机 IP 地址方法：

   ```bash
   $ ifconfig | grep "inet " | grep -v 127.0.0.1
   	inet 192.168.3.230 netmask 0xfffffc00 broadcast 192.168.3.255
   	inet 198.19.249.3 netmask 0xffffff00 broadcast 198.19.249.255
   	inet 26.26.26.1 --> 26.26.26.53 netmask 0xfffffff8
   ```

   第一个192.168.3.230 为局域网 IP 地址，第二个即为  docker 宿主机 IP 地址

   

5. 导入 IDE 运行

   先运行 `ThingsboardMqttBrokerInstallApplication` 类执行安装程序。然后，运行 `ThingsboardMqttBrokerApplication` 类，启动应用。

   启动成功之后，浏览器访问：[http://localhost:8083](http://localhost:8083)，用户名/密码：sysadmin@thingsboard.org / sysadmin
