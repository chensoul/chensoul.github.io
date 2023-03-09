---
title: "我的VPS服务部署记录"
date: 2023-01-25T10:38:34+08:00
draft: false
slug: "notes-about-deploy-services-in-vps"
categories: ["Notes"]
tags: ["hugo","docker","rsshub","kuma","umami","cusdis","memos","n8n"]
authors:

- chensoul

---

## 服务器设置

**[可选] 设置系统 Swap 交换分区**

因为 vps 服务器的运行内存很小，所以这里先设置下 Swap

```bash
# 1GB RAM with 2GB Swap
sudo fallocate -l 2G /swapfile && \
sudo dd if=/dev/zero of=/swapfile bs=1024 count=2097152 && \
sudo chmod 600 /swapfile && \
sudo mkswap /swapfile && \
sudo swapon /swapfile && \
echo "/swapfile swap swap defaults 0 0" | sudo tee -a /etc/fstab && \
sudo swapon --show && \
sudo free -h
```

## Docker 安装和配置

### Docker 安装

具体过程可以参考网上文章。

### 自定义网络

参考 [Best Practice: Use a Docker network ](https://nginxproxymanager.com/advanced-config/#best-practice-use-a-docker-network)
，创建一个自定义的网络：

```bash
docker network create custom
```

查看 docker 网络：

```bash
[root@vps ~]# docker network ls
NETWORK ID     NAME            DRIVER    SCOPE
68f4aeaa57bd   bridge          bridge    local
6a96b9d8617e   custom          bridge    local
4a8679e35f4d   host            host      local
ba21bef23b04   none            null      local
```

> 注意：bridge、host、none 是内部预先创建的网络。

然后，在其他服务的 docker-compose.yml 文件添加：

```yaml
networks:
  default:
    external: true
    name: custom
```

例如：

```yaml
version: "3"

services:
  pgsql:
    image: postgres:13
    restart: always
    ports:
      - 5433:5432
    environment:
      - POSTGRES_USER=chenzj
      - POSTGRES_PASSWORD=chenzj@vps2021
    volumes:
      - /data/postgres:/var/lib/postgresql/data

networks:
  default:
    external: true
    name: custom
```

## 服务部署

### Rsshub

直接通过 Docker 安装运行：

```bash
docker run -d --name rsshub -p 1200:1200 diygod/rsshub
```

配置 nginx ：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name rsshub.chensoul.com;

    return 301 https://$host$request_uri;
}

server {
    listen          443 ssl;
    server_name     rsshub.chensoul.com;

    ssl_certificate      /usr/local/nginx/ssl/fullchain.cer;
    ssl_certificate_key  /usr/local/nginx/ssl/chensoul.com.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        proxy_pass http://127.0.0.1:1200;
    }
}
```

### Kuma

参考 [kuma](https://uptime.kuma.pet/)，使用 docker compose 部署，创建 uptime.yaml：

```yaml
version: '3.3'

services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    volumes:
      - ~/.uptime-kuma:/app/data
    ports:
      - 3001:3001  # <Host Port>:<Container Port>
    restart: always
```

启动：

```bash
docker-compose -f uptime.yaml up -d
```

配置 nginx ：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name uptime.chensoul.com;

    return 301 https://$host$request_uri;
}

server {
    listen          443 ssl;
    server_name     uptime.chensoul.com;

    ssl_certificate      /usr/local/nginx/ssl/fullchain.cer;
    ssl_certificate_key  /usr/local/nginx/ssl/chensoul.com.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        proxy_pass http://127.0.0.1:3001;
	    proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   Host $host;
        
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
    }
}
```

### Postgresql

1、参考 [PostgreSql安装和部署](/posts/2022/08/19/postgresql-install-deploy/) ，通过 docker-compose 安装，创建
postgresql.yaml：

```yaml
version: "3"

services:
  pgsql:
    image: postgres:13-alpine
    container_name: pgsql
    restart: always
    ports:
      - 5432:5432
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=admin@pg!
    networks:
      - custom
    volumes:
      - /data/postgres:/var/lib/postgresql/data

networks:
  custom:
    external: true
```

2、启动

```bash
docker-compose -f postgresql.yaml up -d
```

### Umami

参考 [umami docker-compose.yml](https://github.com/umami-software/umami/blob/master/docker-compose.yml) ，使用 docker 镜像
umami:postgresql-latest 来安装 umami。

1、在 pqsql 容器创建 umami 数据库和用户：

```bash
docker exec -it pgsql psql -U postgres -c "CREATE USER umami WITH PASSWORD 'umami@pg';"
docker exec -it pgsql psql -U postgres -c "CREATE DATABASE umami owner=umami;"
docker exec -it pgsql psql -U postgres -c "GRANT ALL privileges ON DATABASE umami TO umami;"
```

然后，初始化数 umami 数据。先进入容器：

```
docker exec -it pgsql bash
```

进入 umami 数据库：

```bash
psql -U umami -d umami
umami=>
```

执行 [**schema.postgresql.sql**](https://github.com/umami-software/umami/blob/master/sql/schema.postgresql.sql) 文件内容。

2、通过 docker-compose 安装，创建 umami.yaml：

```yaml
version: '3'
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    container_name: umami
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://umami:umami@pg@pgsql:5432/umami
      DATABASE_TYPE: postgresql
      HASH_SALT: vps@2023
    networks:
      - custom
    restart: always

networks:
  custom:
    external: true
```

启动：

```bash
docker-compose -f umami.yaml up -d
```

3、设置自定义域名

umami.chensoul.com

4、配置 nginx

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name umami.chensoul.com;

    return 301 https://$host$request_uri;
}

server {
    listen          443 ssl;
    server_name     umami.chensoul.com;

    ssl_certificate      /usr/local/nginx/ssl/fullchain.cer;
    ssl_certificate_key  /usr/local/nginx/ssl/chensoul.com.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

5、添加网站

访问 https://umami.chensoul.com/，默认用户名和密码为 admin/umami。登陆之后，修改密码，并添加网站。

### Cusdis

1、在 pqsql 容器创建 cusdis 数据库和用户：

```bash
docker exec -it pgsql psql -U postgres -c "CREATE USER cusdis WITH PASSWORD 'cusdis@pg';"
docker exec -it pgsql psql -U postgres -c "CREATE DATABASE cusdis owner=cusdis;"
docker exec -it pgsql psql -U postgres -c "GRANT ALL privileges ON DATABASE cusdis TO cusdis;"
```

2、通过 docker-compose 安装，创建 cusdis.yaml：

```yaml
version: '3'
services:
  cusdis:
    image: djyde/cusdis:latest
    container_name: cusdis
    ports:
      - "3010:3000"
    environment:
      - USERNAME=admin
      - PASSWORD=cusdis
      - JWT_SECRET=vps@2023
      - NEXTAUTH_URL=https://cusdis.chensoul.com
      - DB_TYPE=pgsql
      - DB_URL=postgresql://cusdis:cusdis@pg@pgsql:5432/cusdis
    networks:
      - custom  
    restart: always
    
networks:
  custom:
    external: true    
```

以下配置为 EMAIL 配置可选，下面是使用 [Gmail](https://cusdis.com/doc#/features/notification?id=gmail)
进行配置，需要首先开启两阶段验证并创建一个应用密码：

```properties
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your gmail email
SMTP_PASSWORD=<app password>
SMTP_SENDER=your gmail email
```

3、启动

```bash
docker-compose -f cusdis.yaml up -d
```

4、配置 nginx

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name cusdis.chensoul.com;

    return 301 https://$host$request_uri;
}

server {
    listen          443 ssl;
    server_name     cusdis.chensoul.com;

    ssl_certificate      /usr/local/nginx/ssl/fullchain.cer;
    ssl_certificate_key  /usr/local/nginx/ssl/chensoul.com.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        proxy_pass http://127.0.0.1:3010;
	proxy_pass_header Authorization;
	proxy_pass_header WWW-Authenticate;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	if ($uri = '/js/iframe.umd.js') {
        	add_header 'Access-Control-Allow-Origin' '*';
        	#add_header 'Access-Control-Allow-Origin' 'http://localhost:1313';
    	}
    }
}
```

### memos

通过 docker-compose 安装，创建 memos.yaml：

```yaml
version: "3.0"
services:
  memos:
    image: neosmemo/memos:latest
    container_name: memos
    volumes:
      - ~/.memos/:/var/opt/memos
    ports:
      - 5230:5230
```

启动

```bash
docker-compose -f memos.yaml up -d
```

配置 nginx

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name memos.chensoul.com;

    return 301 https://$host$request_uri;
}

server {
    listen          443 ssl;
    server_name     memos.chensoul.com;

    ssl_certificate      /usr/local/nginx/ssl/fullchain.cer;
    ssl_certificate_key  /usr/local/nginx/ssl/chensoul.com.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        proxy_pass http://127.0.0.1:5230;
    }
}
```

### n8n

1、在 pqsql 容器创建 n8n 数据库和用户：

```bash
docker exec -it pgsql psql -U postgres -c "CREATE USER n8n WITH PASSWORD 'n8n@pg';" 

docker exec -it pgsql psql -U postgres -c "CREATE DATABASE n8n owner=n8n;" 

docker exec -it pgsql psql -U postgres -c "GRANT ALL privileges ON DATABASE n8n TO n8n;" ;
```

2、通过 docker-compose 安装，创建 n8n.yaml：

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: always
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=pgsql
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n@pg
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=chenzj
      - TZ="Asia/Shanghai"
      - WEBHOOK_URL=https://n8n.chensoul.com/
    ports:
      - 5678:5678
    volumes:
      - /data/n8n:/home/node/.n8n
    command: /bin/sh -c "n8n start --tunnel"
    networks:
      - custom  
    
networks:
  custom:
    external: true 
```

3、启动

```bash
docker-compose -f n8n.yaml up -d
```

4、设置 nginx 转发

```nginx
location / {
    proxy_pass http://127.0.0.1:5678/;
    proxy_set_header Connection '';
    proxy_http_version 1.1;
    chunked_transfer_encoding off;
    proxy_buffering off;
    proxy_cache off;
    access_log /var/log/nginx/forward.log combined buffer=128k flush=5s;
}
```

这里面的转发配置不对的话，会导致直接访问 5678 端口正常，但是访问 nginx 的话，workflow 会一直处于执行。

5、添加 workflow

参考这篇文章 http://stiles.cc/archives/237/ ，目前我配置了以下 workflows，实现了 github、douban、rss、memos 同步到 Telegram。

![my-n8n-workflows](http://chensoul.oss-cn-hangzhou.aliyuncs.com/images/my-n8n-workflows.png)