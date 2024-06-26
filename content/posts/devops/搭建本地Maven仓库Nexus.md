---
title: "搭建本地Maven仓库Nexus"
date: 2024-06-25T15:00:00+08:00
slug: install-nexus
draft: false
categories: ["Java"]
tags: [ maven,nexus ]
---

## 使用 Docker 安装

```bash
$ docker volume create --name nexus_data

$ docker run -d -p 8081:8081 -p 8082:8082 -p 8083:8083 --name nexus -v nexus_data:/nexus-data sonatype/nexus3
```

- 8081 是 Nexus UI 端口
- 8082 是自定义的 docker group 仓库的 http 端口
- 8083 是自定义的 docker host 仓库的 http 端口

## 使用 Docker Compose 安装

```yaml
services:
    nexus:
        image: sonatype/nexus3
        platform: linux/amd64
        ports:
            - "8081:8081"
            - "8082:8082"
            - "8083:8083"
        volumes:
            - nexus_data:/nexus-data
            - /etc/localtime:/etc/localtime:ro

volumes:
    nexus_data:
```

## 访问并配置 Nexus

访问 http://127.0.0.1:8081/  或者是 `http://<your IP>:8081`，用户名为 admin ，初始密码在容器里的 /nexus-data/admin.password 文件

```bash
docker ps

# docker-nexus-1 为容器名称
docker exec -it docker-nexus-1 cat /nexus-data/admin.password
```

登录之后，将密码修改为自己的密码，比如：admin。

### 开启匿名访问权限

依次点击【Security】--【Realms】,将【Docker Bearer Token Tealm】添加到右侧，然后保存。

### 创建 Maven 仓库

Nexus 提供三种类型的仓库：

- **hosted : 本地存储**

- **proxy : 提供代理其他仓库的类型，如阿里云镜像加速器**

- **groudp : 组类型，实质作用是组合多个仓库为一个地址**

创建一个 maven(proxy) 仓库，名称：aliyun，Version Policy 选择 Mixed，URL 地址：https://maven.aliyun.com/nexus/content/groups/public/，并修改 maven-public 仓库，将 aliyun 加入 maven-public 的 Group 中。

> 注意：保持 hosted 仓库在 proxy 仓库之前，这样方便下载依赖时先从本地查找。



### 创建 Docker 仓库

先创建一个 blob store 用于存储 docker 文件。

然后，创建三个仓库：

- 创建一个 **docker(hosted)**  仓库，名称为：docker-local，http 端口设置为 8082，Blob store 选择上面创建的 docker，选择 Allow anonymous docker pull 。

- 创建一个 **docker(proxy)** 仓库，名称为：docker-remote，地址 https://docker.1panel.live/，Docker Index 选择：User Docker Hub，Blob store 选择上面创建的 docker，选择 Allow anonymous docker pull。
- 创建一个  **docker(group)** 仓库，名称为：docker，http 端口设置为 8083

| 仓库类型       | 仓库名称      | HTTP端口号 | HTTPS端口号 | 支持docker操作 |
| :------------- | :------------ | :--------- | :---------- | :------------- |
| proxy代理仓库  | docker-proxy  | 8081       | 不设置      | pull           |
| hosted本地仓库 | docker-hosted | 8082       | 不设置      | pull、push     |
| group聚合仓库  | docker-group  | 8083       | 不设置      | pull           |

设置 docker 配置：

```bash
vim /etc/docker/daemon.json

{
  "registry-mirrors" : [
    "docker-registry.chensoul.com"
  ]
}
```

重启 docker。

### 配置反向代理

参考 [搭建自己的nexus私有仓库6--使用nginx反向代理](https://hellogitlab.com/CI/docker/create_your_nexus_6_nginx_proxy#_4-%E6%B5%8B%E8%AF%95%E4%BB%A3%E7%90%86%E4%BB%93%E5%BA%93%E7%9A%84pull%E5%92%8Cpush)

1. 准备好 SSL 文件，放置 /etc/nginx/ssl 目录

2. 使用源码编译安装 nignx，安装目录  /usr/local/nginx

3. 修改 /usr/local/nginx/conf/nginx.conf 文件，添加 `include /etc/nginx/conf.d/*.conf`

   ```nginx
   #user  nobody;
   worker_processes  1;
   
   #error_log  logs/error.log;
   #error_log  logs/error.log  notice;
   #error_log  logs/error.log  info;
   
   #pid        logs/nginx.pid;
   
   events {
       worker_connections  1024;
   }
   
   http {
       include       mime.types;
       default_type  application/octet-stream;
   
       #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
       #                  '$status $body_bytes_sent "$http_referer" '
       #                  '"$http_user_agent" "$http_x_forwarded_for"';
   
       #access_log  logs/access.log  main;
   
       sendfile        on;
       #tcp_nopush     on;
   
       #keepalive_timeout  0;
       keepalive_timeout  65;
   
       #gzip  on;
   
       include /etc/nginx/conf.d/*.conf;
   }
   ```

4. 为 nexus 配置反向代理

   /etc/nginx/conf.d/ 目录下添加 nexus.conf 文件：

   ```nginx
   server {
       listen 80;
       server_name nexus.chensoul.com;
       rewrite ^ https://$http_host$request_uri? permanent;
   }
   
   server {
        listen 443 ssl;
        server_name nexus.chensoul.com;
        ssl_certificate /etc/nginx/ssl/all.crt;
        ssl_certificate_key /etc/nginx/ssl/all.key;
        ssl_session_timeout 5m;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
        ssl_prefer_server_ciphers on;
   
        client_max_body_size 1g;
        access_log /var/log/nginx/nexus.log;
   
        location / {
           proxy_pass     http://192.168.1.107:8081;
           proxy_http_version 1.1;
   				proxy_read_timeout  90;
           proxy_set_header X-Forwarded-Host $host:$server_port;
           proxy_set_header X-Forwarded-Server $host;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_set_header X-Forwarded-Host $host:$server_port;
           proxy_set_header X-Real-IP $remote_addr;
        }
   }
   ```

   - 192.168.1.107 为 nexus 所在服务器的 IP 地址

5. 为 docker 注册中心配置反向代理

   /etc/nginx/conf.d/ 目录下添加 docker-registry.conf 文件：

   ```nginx
   # docker-group聚合仓库
   upstream nexus_docker_get {
       server 192.168.1.107:8083;
   }
   
   # docker-hosted本地仓库
   upstream nexus_docker_put {
       server 192.168.1.107:8082;
   }
   
   server {
       listen 80;
       server_name docker-registry.chensoul.com;
       rewrite ^ https://$http_host$request_uri? permanent;
   }
   
   server {
        listen 443 ssl;
        server_name docker-registry.chensoul.com;
        ssl_certificate /etc/nginx/ssl/all.crt;
        ssl_certificate_key /etc/nginx/ssl/all.key;
        ssl_session_timeout 5m;
        ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
        ssl_prefer_server_ciphers on;
   
        access_log /var/log/nginx/docker-registry.log;
   
        # disable any limits to avoid HTTP 413 for large image uploads
        client_max_body_size 0;
        # required to avoid HTTP 411: see Issue #1486 (https://github.com/docker/docker/issues/1486)
        chunked_transfer_encoding on;
   
        # 请求逻辑调整
        # 设置默认使用docker-group聚合仓库，即拉取镜像的情况多些
        set $upstream "nexus_docker_get";
        # 当请求是 PUT，也就是推送镜像的时候，如此便解决了拉取和推送的端口统一
        if ( $request_method ~* 'PUT') {
           set $upstream "nexus_docker_put";
        }
        # 我测试的时候，docker-hosted本地仓库和docker-proxy代理仓库都支持搜索，所以将下面这段逻辑调整注释掉
        # 只有本地仓库才支持搜索，所以将搜索请求转发到本地仓库，否则出现 500 报错
        # if ($request_uri ~ '/search') {
        #    set $upstream "nexus_docker_put";
        # }
        location / {
   				proxy_pass http://$upstream;
           proxy_http_version 1.1;
   				proxy_read_timeout  90;
           proxy_set_header X-Forwarded-Host $host:$server_port;
           proxy_set_header X-Forwarded-Server $host;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Host $host:$server_port;
           proxy_set_header X-Real-IP $remote_addr;
   
           # 直接使用以下配置【proxy_set_header X-Forwarded-Proto http; 】时，
           # 在尝试向仓库中push推送镜像时，就是docker login登陆成功了也会报以下认证异常
           # unauthorized: access to the requested resource is not authorized
           # proxy_set_header X-Forwarded-Proto http;
           # 修复docker push认证异常问题，将http替换成https即可
           proxy_set_header X-Forwarded-Proto https;
       }
   }
   ```

   

## 测试

### Maven 测试

配置maven的配置文件settings.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0 http://maven.apache.org/xsd/settings-1.2.0.xsd" xmlns="http://maven.apache.org/SETTINGS/1.2.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <servers>
    <server>
      <username>nexus-release</username>
      <password>admin</password>
      <id>central</id>
    </server>
    <server>
      <username>nexus-snapshot</username>
      <password>admin</password>
      <id>snapshots</id>
    </server>
  </servers>
  
  <mirrors>     
    <mirror>  
        <id>nexus</id>  
        <name>nexus repository</name>  
        <url>https://nexus.chensoul.com/repository/maven-public/</url>  
        <mirrorOf>central</mirrorOf>  
    </mirror>     
  </mirrors>
  
  <profiles>
    <profile>
      <repositories>
        <repository>
          <snapshots>
            <enabled>false</enabled>
          </snapshots>
          <id>central</id>
          <name>nexus-release</name>
          <url>https://nexus.chensoul.com/repository/maven-release</url>
        </repository>
        <repository>
          <snapshots />
          <id>snapshots</id>
          <name>nexus-snapshot</name>
          <url>https://nexus.chensoul.com/repository/maven-snapshot</url>
        </repository>
      </repositories>
      <pluginRepositories>
        <pluginRepository>
          <snapshots>
            <enabled>false</enabled>
          </snapshots>
          <id>central</id>
          <name>nexus-release</name>
          <url>https://nexus.chensoul.com/repository/maven-release</url>
        </pluginRepository>
        <pluginRepository>
          <snapshots />
          <id>snapshots</id>
          <name>nexus-snapshot</name>
          <url>https://nexus.chensoul.com/repository/maven-snapshot</url>
        </pluginRepository>
      </pluginRepositories>
      <id>nexus</id>
    </profile>
  </profiles>
  
  <activeProfiles>
    <activeProfile>nexus</activeProfile>
  </activeProfiles>
</settings>
```

### docker 测试

docker登录私服：

```bash
docker login docker-registry.chensoul.com
```

拉取镜像：

```bash
docker pull alpine:3.14
docker pull docker-registry.chensoul.com/alpine:3.14
```

- https://nexus.chensoul.com/#browse/browse:docker 可以看到下载的镜像

推送镜像：

```bash
docker tag alpine:3.14 docker-registry.chensoul.com/alpine:3.14-custom
docker push docker-registry.chensoul.com/alpine:3.14-custom
```

提示 `blob unknown: blob unknown to registry`

## 参考文章

- [nexus搭建docker私服](https://blog.csdn.net/Wqr_18390921824/article/details/123160498)