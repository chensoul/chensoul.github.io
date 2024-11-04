---
title: "我的VPS服务部署记录"
date: 2023-01-25
type: post
slug: "notes-about-deploy-services-in-vps"
categories: ["devops"]
tags: [vps]
---

我的 VPS 使用的是 centos 服务器，所以以下操作都是基于 centos 系统。

## 服务器设置

更新 yum 源：

```bash
yum update
```

安装常用软件：

```bash
yum install wget curl git vim -y
```

设置时区为

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

## 安装 Nginx

参考 [CentOS 7 下 yum 安装和配置 Nginx](https://qizhanming.com/blog/2018/08/06/how-to-install-nginx-on-centos-7) ，使用 yum 安装：

```bash
rpm -ivh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm

yum install nginx -y

systemctl enable nginx
```

打开防火墙端口

```bash
yum install firewalld -y

firewall-cmd --zone=public --permanent --add-service=http
firewall-cmd --reload
```

使用反向代理需要打开网络访问权限

```bash
setsebool -P httpd_can_network_connect on
```

## 安装并生成证书

域名托管在 CloudFlare，可以参考 [文章](https://github.com/acmesh-official/acme.sh/wiki/dnsapi#dns_cf)

```bash
curl https://get.acme.sh | sh -s email=ichensoul@gmail.com

export CF_Key="XXXXXXXXXXXXXXXXXX"
export CF_Email="ichensoul@gmail.com"

.acme.sh/acme.sh --issue --server letsencrypt --dns dns_cf -d chensoul.cc -d '*.chensoul.cc'

cp .acme.sh/chensoul.cc_ecc/{chensoul.cc.cer,chensoul.cc.key,fullchain.cer,ca.cer} /etc/nginx/ssl/

.acme.sh/acme.sh --installcert -d chensoul.cc -d *.chensoul.cc --cert-file /etc/nginx/ssl/chensoul.cc.cer --key-file /etc/nginx/ssl/chensoul.cc.key --fullchain-file /etc/nginx/ssl/fullchain.cer --ca-file /etc/nginx/ssl/ca.cer --reloadcmd "sudo nginx -s reload"
```

## Docker 安装和配置

Docker 安装

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

启动 docker：

```bash
systemctl enable docker
systemctl start docker
```

设置 iptables 允许流量转发：

```bash
iptables -P FORWARD ACCEPT
```



安装 Compose

```bash
curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

设置执行权限：

```bash
chmod +x /usr/local/bin/docker-compose
```



参考 [Best Practice: Use a Docker network ](https://nginxproxymanager.com/advanced-config/#best-practice-use-a-docker-network) ，创建一个自定义的网络：

```bash
docker network create custom
```

查看 docker 网络：

```bash
docker network ls
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
  - custom

networks:
  custom:
    external: true
```

## 服务部署

### MySQL

1、使用 docker-compose 安装

mysql.yaml

```yaml
version: "3"
services:
  mysql:
    image: mysql:8
    container_name: mysql
    platform: linux/amd64
    restart: unless-stopped
    volumes:
      - /data/volumes/mysql/:/var/lib/mysql/
    environment:
      - MYSQL_ROOT_HOST=%
      - MYSQL_ROOT_PASSWORD=admin@mysql!
      - TZ=Asia/Shanghai
    ports:
      - "3306:3306"
    command: --default-authentication-plugin=mysql_native_password --explicit_defaults_for_timestamp=true --lower_case_table_names=1 --tls-version=''
    healthcheck:
      test: "/usr/bin/mysql -e 'SHOW DATABASES;'"
      interval: 5s
      timeout: 2s
      retries: 10
    networks:
      - custom

networks:
  custom:
    external: true
```

> 注意：[修改 Docker-MySQL 容器的 默认用户加密规则](https://www.cnblogs.com/atuotuo/p/9402132.html)

2、启动

```bash
docker-compose -f mysql.yaml up -d
```

3、进入容器：

```bahs
docker exec -it mysql bash
```



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
    server_name rsshub.chensoul.cc;

    return 301 https://$host$request_uri;
}

server {
    listen          443 ssl;
    server_name     rsshub.chensoul.cc;

    ssl_certificate      /etc/nginx/ssl/fullchain.cer;
    ssl_certificate_key  /etc/nginx/ssl/chensoul.cc.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        proxy_pass http://127.0.0.1:1200;
    }
}
```

### Uptime Kuma

参考 [kuma](https://uptime.kuma.pet/)，使用 docker compose 部署，创建 uptime.yaml：

```yaml
version: "3.3"

services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    container_name: uptime-kuma
    volumes:
      - ~/.uptime-kuma:/app/data
    ports:
      - 3001:3001 # <Host Port>:<Container Port>
    restart: always
```

启动：

```bash
docker-compose -f uptime.yaml up -d
```

配置 nginx  配置文件 /etc/nginx/conf.d/uptime.conf ：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name uptime.chensoul.cc;

    return 301 https://$host$request_uri;
}

server {
    listen          443 ssl;
    server_name     uptime.chensoul.cc;

    ssl_certificate      /etc/nginx/ssl/fullchain.cer;
    ssl_certificate_key  /etc/nginx/ssl/chensoul.cc.key;

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

升级

```bash
docker compose -f uptime.yaml down
docker pull louislam/uptime-kuma:1
docker-compose -f uptime.yaml up -d
```

### Umami

1、在 mysql 容器创建 umami 数据库和用户：

```bash
docker exec -it mysql bash
mysql -uroot -padmin@mysql!

CREATE USER 'umami'@'%' IDENTIFIED BY 'umami@mysql!';
CREATE DATABASE umami;
GRANT ALL ON umami.* TO 'umami'@'%';

ALTER USER 'umami' IDENTIFIED WITH caching_sha2_password BY 'umami@mysql!';
```

> 参考：[HCL SafeLinx Server with MySQL 8.0 causes "Authentication plugin 'caching_sha2_password' reported error: Authentication requires secure connection."](https://support.hcltechsw.com/csm?id=kb_article&sysparm_article=KB0102948)

2、通过 docker-compose 安装，创建 umami.yaml：

```yaml
version: "3"
services:
  umami:
    image: ghcr.io/umami-software/umami:mysql-latest
    container_name: umami
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://umami:umami@mysql!@mysql:3306/umami
      DATABASE_TYPE: mysql
      HASH_SALT: vps@2023
      TRACKER_SCRIPT_NAME: random-string.js
    networks:
      - custom
    restart: always

networks:
  custom:
    external: true
```

参考 [https://eallion.com/umami/](https://eallion.com/umami/)，Umami 的默认跟踪代码是被大多数的广告插件屏蔽的，被屏蔽了你就统计不到访客信息了。如果需要反屏蔽，需要在 docker-compose.yml 文件中添加环境变量：TRACKER_SCRIPT_NAME，如：

```bash
    environment:
      TRACKER_SCRIPT_NAME: random-string.js
```

然后获取到的跟踪代码的 src 会变成：

```
srcipt.js => random-string.js
```

启动：

```bash
docker-compose -f umami.yaml up -d
```

3、设置自定义域名

umami.chensoul.cc

4、配置 nginx 配置文件 /etc/nginx/conf.d/umami.conf

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name umami.chensoul.cc;

    return 301 https://$host$request_uri;
}

server {
    listen          443 ssl;
    server_name     umami.chensoul.cc;

    ssl_certificate      /etc/nginx/ssl/fullchain.cer;
    ssl_certificate_key  /etc/nginx/ssl/chensoul.cc.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header REMOTE-HOST $remote_addr;
        add_header X-Cache $upstream_cache_status;
        # 缓存
        add_header Cache-Control no-cache;
        expires 12h;
    }
}
```

5、添加网站

访问 https://umami.chensoul.cc/，默认用户名和密码为 admin/umami。登陆之后，修改密码，并添加网站。

6、升级

```bash
docker compose -f umami.yaml down
docker pull ghcr.io/umami-software/umami:mysql-latest
docker-compose -f umami.yaml up -d
```

### Cusdis

> VPS IP 可能被墙，所以可以使用三方云服务部署，具体参考[轻量级开源免费博客评论系统解决方案 （Cusdis + Railway）](https://www.pseudoyu.com/zh/2022/05/24/free_and_lightweight_blog_comment_system_using_cusdis_and_railway/)

1、在 mysql 容器创建 cusdis 数据库和用户：

```bash
docker exec -it mysql bash
mysql -uroot -p

CREATE USER 'cusdis'@'%' IDENTIFIED BY 'cusdis@mysql!';
CREATE DATABASE cusdis;
GRANT ALL ON cusdis.* TO 'cusdis'@'%';

ALTER USER 'cusdis' IDENTIFIED WITH caching_sha2_password BY 'cusdis@mysql!';
```

2、通过 docker-compose 安装，创建 cusdis.yaml：

```yaml
version: "3"
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
      - NEXTAUTH_URL=https://cusdis.chensoul.cc
      - HOST=https://cusdis.chensoul.cc
      - DB_TYPE=mysql
      - DB_URL=mysql://cusdis:cusdis@mysql!@mysql:3306/cusdis
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
    server_name cusdis.chensoul.cc;

    return 301 https://$host$request_uri;
}

server {
    listen          443 ssl;
    server_name     cusdis.chensoul.cc;

    ssl_certificate      /etc/nginx/ssl/fullchain.cer;
    ssl_certificate_key  /etc/nginx/ssl/chensoul.cc.key;

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

5、部署一个 Telegram 机器人，参考 [Official Telegram bot](https://cusdis.chensoul.cc/doc#/advanced/webhook?id=official-telegram-bot)。

6、升级

```bash
docker compose -f cusdis.yaml down
docker pull djyde/cusdis:latest
docker-compose -f cusdis.yaml up -d
```

### memos

1、在 mysql 容器创建 n8n 数据库和用户：

```bash
docker exec -it mysql bash
mysql -uroot -p

CREATE USER 'memos'@'%' IDENTIFIED BY 'memos@mysql!';
CREATE DATABASE memos;
GRANT ALL ON memos.* TO 'memos'@'%';

ALTER USER 'memos' IDENTIFIED WITH caching_sha2_password BY 'memos@mysql!';
```

2、通过 docker-compose 安装，创建 memos.yaml：

```yaml
version: "3.0"
services:
  memos:
    image: neosmemo/memos:latest
    container_name: memos
    environment:
      - MEMOS_DRIVER=mysql
      - MEMOS_DSN=memos:memos@mysql!@tcp(mysql)/memos
    volumes:
      - ~/.memos/:/var/opt/memos
    ports:
      - 5230:5230
    networks:
      - custom

networks:
  custom:
    external: true
```

启动

```bash
docker-compose -f memos.yaml up -d
```

配置 nginx 配置文件 /etc/nginx/conf.d/memos.conf

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name memos.chensoul.cc;

    return 301 https://$host$request_uri;
}

server {
    listen          443 ssl;
    server_name     memos.chensoul.cc;

    ssl_certificate      /etc/nginx/ssl/fullchain.cer;
    ssl_certificate_key  /etc/nginx/ssl/chensoul.cc.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        proxy_pass http://127.0.0.1:5230;
    }
}
```

升级

```bash
docker compose -f memos.yaml down
docker pull neosmemo/memos:latest
docker-compose -f memos.yaml up -d
```

### n8n

1、在 mysql 容器创建 n8n 数据库和用户：

```bash
docker exec -it mysql bash
mysql -uroot -p

CREATE USER 'n8n'@'%' IDENTIFIED BY 'n8n@mysql!';
CREATE DATABASE n8n;
GRANT ALL ON n8n.* TO 'n8n'@'%';

ALTER USER 'n8n' IDENTIFIED WITH caching_sha2_password BY 'n8n@mysql!';
```

2、通过 docker-compose 安装，创建 n8n.yaml：

```yaml
version: "3.8"

services:
  n8n:
    image: n8nio/n8n
    container_name: n8n
    restart: always
    environment:
      - DB_TYPE=mysqldb
      - DB_MYSQLDB_HOST=mysql
      - DB_MYSQLDB_PORT=3306
      - DB_MYSQLDB_DATABASE=n8n
      - DB_MYSQLDB_USER=n8n
      - DB_MYSQLDB_PASSWORD=n8n@mysql!
      - TZ="Asia/Shanghai"
      - GENERIC_TIMEZONE="Asia/Shanghai"
      - WEBHOOK_URL=https://n8n.chensoul.cc/
    ports:
      - 5678:5678
    volumes:
      - ~/.n8n:/home/node/.n8n
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

4、配置 nginx 配置文件 /etc/nginx/conf.d/n8n.conf

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name n8n.chensoul.cc;

    return 301 https://$host$request_uri;
}

server {
    listen          443 ssl;
    server_name     n8n.chensoul.cc;

    ssl_certificate      /etc/nginx/ssl/fullchain.cer;
    ssl_certificate_key  /etc/nginx/ssl/chensoul.cc.key;

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        proxy_pass http://127.0.0.1:5678;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;
				access_log /var/log/nginx/n8n.log combined buffer=128k flush=5s;

				proxy_http_version 1.1;
    		proxy_set_header Upgrade $http_upgrade;
    		proxy_set_header Connection "Upgrade";
    }
}
```

这里面的转发配置不对的话，会导致直接访问 5678 端口正常，但是访问 nginx 的话，workflow 会一直处于执行。

5、添加 workflow

参考这篇文章 http://stiles.cc/archives/237/ ，目前我配置了以下 workflows，实现了 github、douban、rss、memos 同步到 Telegram。

![my-n8n-workflows](/images/my-n8n-workflows.webp)

workflows 参考：

- [Reorx](https://reorx.com/blog/sharing-my-footprints-automation/)
- [Pseudoyu](https://www.pseudoyu.com/zh/2022/09/19/weekly_review_20220919/)
- [raye](https://raye.xlog.app/gou-jian-ge-xing-hua-de-shu-zi-ri-ji--zi-dong-hua-gong-zuo-liu-shi-xian-xin-xi-ju-he)
- [Zeabur](https://zeabur.com/docs/marketplace/n8n)

6、升级

```bash
docker compose -f n8n.yaml down
docker pull n8nio/n8n
docker-compose -f n8n.yaml up -d
```

7、备份

安装 jq
```bash
yum install epel-release -y
yum install jq -y
```



```bash
#!/bin/bash

DATE=$(date +%Y%m%d_%H%M%S)

BACKUP_DIR="/opt/backup/n8n"
mkdir -p $BACKUP_DIR

EXPORT_DIR="workflow-${DATE}"

docker exec -u node -it n8n n8n export:workflow --backup --output=./$EXPORT_DIR/
docker cp n8n:/home/node/$EXPORT_DIR ${BACKUP_DIR}/$EXPORT_DIR

#docker exec -u node -it n8n n8n export:credentials --all --output=./credentials.json
#docker cp n8n:/home/node/credentials.json .

cd $BACKUP_DIR/$EXPORT_DIR
for file in *; do
    filename=$(cat "$file" | jq -r '.name')  # 使用-r选项以纯文本形式输出字段值
    echo "$filename"
    mv "$file" "$filename".json
done
```

## 数据库备份



```bash
#!/bin/bash

# 容器名称
CONTAINER_NAME="mysql"

# 备份目录
BACKUP_DIR="/opt/backup/mysql"

# 日期时间
DATE=$(date +%Y%m%d_%H%M%S)

# 备份文件名后缀
BACKUP_POSTFIX="backup_${DATE}"

# MySQL连接参数
DB_USER="root"
DB_PASSWORD="admin@mysql!"

# 要备份的数据库列表
DATABASES=("memos" "n8n" "umami")

# 创建备份目录
mkdir -p $BACKUP_DIR

# 遍历数据库列表进行备份
for DB_NAME in "${DATABASES[@]}"
do
  # 备份文件名
  BACKUP_FILE="${DB_NAME}_${BACKUP_POSTFIX}.sql"

  # 执行备份
  docker exec $CONTAINER_NAME mysqldump -u $DB_USER --password=$DB_PASSWORD $DB_NAME > $BACKUP_DIR/$BACKUP_FILE

  # 检查备份是否成功
  if [ $? -eq 0 ]; then
    echo "数据库 $DB_NAME 备份成功: $BACKUP_FILE"
  else
    echo "数据库 $DB_NAME 备份失败"
  fi
done
```
