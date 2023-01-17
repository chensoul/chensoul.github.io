---
title: "我的 VPS 服务部署记录"
date: 2023-01-16T10:38:34+08:00
draft: true
slug: "note-of-deploy-services-in-my-vps"
categories: ["Notes"]
tags: ["hugo"]
authors:
  - chensoul
---



## Docker 安装和配置

### Docker 安装

具体过程可以参考网上文章。

### 自定义网络

参考 [Best Practice: Use a Docker network ](https://nginxproxymanager.com/advanced-config/#best-practice-use-a-docker-network) ，创建一个自定义的网络：

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

直接通过安装运行：

```bash
docker run -d --name rsshub -p 1200:1200 diygod/rsshub
```

### Kuma

参考 [kuma](https://uptime.kuma.pet/)，使用 Docker 部署：

```bash
docker run -d --restart=always -p 3001:3001 -v uptime-kuma:/app/data --name uptime-kuma louislam/uptime-kuma:1
```



### Nginx Proxy Manager

### Postgresql

1、参考 [PostgreSql安装和部署](/posts/2022/08/19/postgresql-install-deploy/) ，通过 docker-compose 安装，创建 postgresql.yaml：

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
docker-compose -f postgresql.yaml up 
```



### Umami

参考 [umami docker-compose.yml](https://github.com/umami-software/umami/blob/master/docker-compose.yml) ，使用 docker 镜像 umami:postgresql-latest 来安装 umami。



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
docker-compose -f umami.yaml up 
```



3、设置自定义域名

umami.chensoul.com



4、添加网站

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

3、启动

```bash
docker-compose -f cusdis.yaml up -d
```

### memos

docker 部署：

```bash
docker run -d --name memos -p 5230:5230 -v ~/.memos/:/var/opt/memos neosmemo/memos:latest
```

