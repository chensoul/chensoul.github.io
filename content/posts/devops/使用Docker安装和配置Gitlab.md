---
title: "使用Docker安装和配置Gitlab"
date: 2024-06-26T16:00:00+08:00
slug: install-jenkins
draft: false
categories: ["devops"]
tags: [ jenkins ]
---

## 使用 Docker 安装 Gitlab

如果要使用 gitlab 自带的 nginx，compose 文件参考 https://github.com/hutchgrant/gitlab-docker-local/blob/master/docker-compose.yml。



使用官方镜像安装：

```bash
services:
    gitlab:
        image: gitlab/gitlab-ce
        container_name: gitlab
        environment:
            GITLAB_OMNIBUS_CONFIG: |
                external_url 'http://192.168.1.107'
                
                gitlab_rails['time_zone'] = 'Asia/Shanghai'
                gitlab_rails['gitlab_default_theme'] = 2
                gitlab_rails['gitlab_shell_ssh_port'] = 24
                gitlab_rails['backup_keep_time'] = 172800
                
                gitlab_workhorse['listen_network'] = "tcp"
                gitlab_workhorse['listen_addr'] = "0.0.0.0:8000"
                
                nginx['enable'] = false
								unicorn['enable'] = false
        ports:
            - '8000:8000'
            - '24:22'
        volumes:
            - gitlab_data:/var/opt/gitlab
            - /etc/localtime:/etc/localtime:ro

volumes:
    gitlab_data:
```

配置说明：

- 当前 docker 所在宿主机 IP 为：192.168.1.107
- 配置 gitlab 以 8000 启动，并暴露到宿主机
- ssh 端口使用 24
- 时区设置为 Asia/Shanghai
- 禁用 nginx 和 unicorn
- 备份保留时间：172800 秒

查看日志：

```bash
sudo docker logs gitlab
```

进入容器：

```bash
docker ps

sudo docker exec -it gitlab bash
```

查看各个服务状态：

```bash
gitlab-ctl status

# 若有down，那么就尝试启动一下
gitlab-ctl start xxxx

# 如果起不来，建议查下日志
gitlab-ctl tail -f xxxx

# 如果都是run，那么直接查询日志，
gitlab-ctl tail -f 
```



## 配置 Gitlab

### 修改初始密码

查看容器：

```bash
$ docker ps
CONTAINER ID   IMAGE                   COMMAND                   CREATED          STATUS                    PORTS                                                                                               NAMES
13b7247c40b2   gitlab/gitlab-ce        "/assets/wrapper"         21 minutes ago   Up 17 minutes (healthy)   80/tcp, 443/tcp, 0.0.0.0:8000->8000/tcp, :::8000->8000/tcp, 0.0.0.0:24->22/tcp, :::24->22/tcp   gitlab
```

可以看到 gitlab 容器名称为 gitlab。

进入容器：

```bash
docker exec -it gitlab bash
```

运行下面命令修改root默认密码为 `abcd1234!`：

```bash
$ gitlab-rails console
u=User.where(id:1).first
new_password='abcd1234!'
u.password=new_password
u.password_confirmation=new_password
u.save!
exit
```

访问 http://192.168.1.107:8000/ ，输入用户名 root 和修改后的密码登录。

### 配置反向代理

1. 准备好 SSL 文件（all.crt 和 all.key），放置 /etc/nginx/ssl 目录
2. 安装 nginx。

3. 创建一个 nginx conf 文件 gitlab.conf 放到 nginx 的相应目录下。

```nginx
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    server_name gitlab.chensoul.cc;
    rewrite ^ https://$http_host$request_uri? permanent;
}

server {
     listen 443 ssl;
     server_name gitlab.chensoul.cc;
     ssl_certificate /etc/nginx/ssl/all.crt;
     ssl_certificate_key /etc/nginx/ssl/all.key;
     ssl_session_timeout 5m;
     ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
     ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
     ssl_prefer_server_ciphers on;

     client_max_body_size 1g;
     access_log /var/log/nginx/gitlab.log;

     location / {
        proxy_pass     http://192.168.1.107:8000;
				proxy_read_timeout  90;
    		proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    		proxy_set_header X-Forwarded-Proto $scheme;
    
    		# Websocket connection
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
     }
}
```

修改 docker-compose 文件：

- `external_url` 使用域名

```bash
services:
    gitlab:
        image: gitlab/gitlab-ce
        platform: linux/amd64
        environment:
            GITLAB_OMNIBUS_CONFIG: |
                external_url 'https://gitlab.chensoul.cc'
                
                gitlab_rails['time_zone'] = 'Asia/Shanghai'
                gitlab_rails['gitlab_default_theme'] = 2
                gitlab_rails['gitlab_shell_ssh_port'] = 24
                gitlab_rails['backup_keep_time'] = 172800
                
                gitlab_workhorse['listen_network'] = "tcp"
                gitlab_workhorse['listen_addr'] = "0.0.0.0:8000"
                
                nginx['enable'] = false
								unicorn['enable'] = false
        ports:
            - '8000:8000'
            - '24:22'
        volumes:
            - gitlab_data:/var/opt/gitlab
            - /etc/localtime:/etc/localtime:ro

volumes:
    gitlab_data:
```

因为宿主机 SSH 协议占用了 22 端口，故 Gitlab 容器暴露到宿主机的端口不能使用 22 端口。如果还是想使用 22 端口，一个解决办法是，将宿主机的 SSH 服务的 22 端口改为其他端口。



### 测试

创建一个项目 ：http://gitlab.chensoul.cc/chenzj/test.git ，然后下载项目

```bash
git clone https://gitlab.chensoul.cc/chenzj/test.git
```

在 gitlab 上传本地 ssh 秘钥，然后通过 ssh 协议（指定端口为 24）下载项目。

```bash
git clone ssh://git@gitlab.chensoul.cc:24/chenzj/test.git
```

### 配置邮箱

参考 [SMTP settings](https://github.com/shamithmc/gitlab-docker/blob/master/doc/settings/smtp.md)

在安装文件中添加相关配置：

```bash
gitlab_rails['smtp_enable'] = true
gitlab_rails['smtp_address'] = "smtp.gmail.com"
gitlab_rails['smtp_port'] = 465
gitlab_rails['smtp_user_name'] = "yourmail@gmail.com"
gitlab_rails['smtp_password'] = "yoursecretapppass"
gitlab_rails['smtp_domain'] = "smtp.gmail.com"
gitlab_rails['smtp_authentication'] = "login"
gitlab_rails['smtp_enable_starttls_auto'] = true
gitlab_rails['smtp_tls'] = true
gitlab_rails['smtp_openssl_verify_mode'] = 'peer'
gitlab_rails['gitlab_email_from'] = 'yourmail@gmail.com'
gitlab_rails['gitlab_email_display_name'] = 'GitLab TutorLokal'
gitlab_rails['gitlab_email_reply_to'] = 'reply@yourdomain.com'
```

### 使用外部 Postgres

参考 [Using a non-packaged PostgreSQL database management server](https://github.com/shamithmc/gitlab-docker/blob/master/doc/settings/database.md#using-a-non-packaged-postgresql-database-management-server)

在 Postgres 修改 `/var/lib/pgsql/data/pg_hba.conf` 令其支持密码登录

```diff
 # "local" is for Unix domain socket connections only
 local   all             all                                     peer
 # IPv4 local connections:
-host    all             all             127.0.0.1/32            ident
+host    all             all             127.0.0.1/32            md5
 # IPv6 local connections:
-host    all             all             ::1/128                 ident
+host    all             all             ::1/128                 md5
 # Allow replication connections from localhost, by a user with the
 # replication privilege.
 local   replication     all                                     peer
```

数据库执行以下 sql 命令：

```sql
-- 重新加载 pg_hba.conf
SELECT pg_reload_conf();

-- 创建 gitlab 角色
CREATE ROLE gitlab WITH LOGIN SUPERUSER;
ALTER ROLE gitlab PASSWORD 'your-db-passwd';

-- 创建 gitlabhq_production 数据库
CREATE DATABASE gitlabhq_production OWNER gitlab;
```

其中，在 gitlab 安装阶段需要赋予其 `SUPERUSER` 权限，安装完成后可以将该权限去除:

```sql
ALTER ROLE gitlab WITH NOSUPERUSER;
```

进入容器，修改 /etc/gitlab/gitlab.rb

```bash
postgresql['enable'] = false

gitlab_rails['db_adapter'] = 'postgresql'
gitlab_rails['db_database'] = "gitlabhq_production"
gitlab_rails['db_encoding'] = 'utf8'
gitlab_rails['db_host'] = 'x.x.x.x'
gitlab_rails['db_port'] = '5432'
gitlab_rails['db_username'] = 'USERNAME'
gitlab_rails['db_password'] = 'PASSWORD'
```

> 数据库名称：gitlabhq_production

使配置生效：

```bash
gitlab-ctl reconfigure
```

设置数据库：

```bash
# Remove 'sudo' if you are the 'git' user
sudo gitlab-rake gitlab:setup
```

### 使用外部 Redis

参考 [Using a non-packaged Redis instance](https://github.com/shamithmc/gitlab-docker/blob/master/doc/settings/redis.md#using-a-non-packaged-redis-instance)，进入容器，修改 /etc/gitlab/gitlab.rb

```bash
redis['enable'] = false
gitlab_rails['redis_host'] = 'x.x.x.x'
gitlab_rails['redis_port'] = 6379
```



### 开启导入项目

登录管理员账户，进入 管理中心 -> 设置 -> 通用 -> 导入源 中开启对应的导入方式。如果没有则尝试以下操作

编辑 **/etc/gitlab/gitlab.rb** 文件，并添加或更新以下配置：

```sh
gitlab_rails['import_sources'] = ['github', 'bitbucket', 'gitlab', 'google_code', 'fogbugz', 'git']
```

使配置生效：

```bash
gitlab-ctl reconfigure
```

或者重启：

```sh
gitlab-ctl restart
```

## 安装 gitlab-runner

参考 [部署gitlab-runner](https://xubiaosunny.top/post/gitlab_container_registry_and_auto_build_images_pfkb.html#%E9%83%A8%E7%BD%B2gitlab-runner)，使用docker启动

```yaml
services:
	gitlab-runner:
    image: gitlab/gitlab-runner
    container_name: gitlab-runner
    volumes:
      - gitlab_runner_data:/etc/gitlab-runner
      - /var/run/docker.sock:/var/run/docker.sock
      - /etc/localtime:/etc/localtime:ro
  
volumes:
  gitlab_runner_data:
```

执行安装命令：

```bash
docker-compose -f gitlab-runner.yaml up -d
```

输入 gitlab 实例地址：

注册 gitlab-runner，根据提示输入要注册的GitLab的URL和注册Token等完成注册。

```
docker volume create gitlab_runner_data 
docker run --rm -it -v gitlab_runner_data:/etc/gitlab-runner gitlab/gitlab-runner register
```

使用管理员登陆，在 `管理中心` -> `概览` -> `Runners`找到用于注册 Shared Runner 的`Registration token`

配置文件 `config.toml`完整示例

```toml
concurrent = 1
check_interval = 0

[session_server]
  session_timeout = 1800

[[runners]]
  name = "xxxxxxxxxxxx"
  url = "https://gitlab.chensoul.cc"
  token = "xxxxxxxxxxxxxxxxxxxxxxxx"
  executor = "docker"
  [runners.custom_build_dir]
  [runners.cache]
    [runners.cache.s3]
    [runners.cache.gcs]
    [runners.cache.azure]
  [runners.docker]
    tls_verify = false
    image = "docker:stable"
    privileged = true
    disable_entrypoint_overwrite = false
    oom_kill_disable = false
    disable_cache = false
    volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
    shm_size = 0
```



## 备份和还原

参考 [gitlab_backup.sh](https://github.com/hutchgrant/gitlab-docker-local/blob/master/gitlab_backup.sh)，备份脚本：

```bash
CONTAINER="gitlab"
BACKUP_DIR="/data/backup/gitlab"
GITLAB_DIR=`docker inspect gitlab --format='{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}'|grep /var/opt/gitlab |awk '{print $1}'`
RUNNER_DIR=`docker inspect gitlab-runner --format='{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}'|grep /var/opt/gitlab |awk '{print $1}'`

REMOVE_DAYS=1

mkdir -p $BACKUP_DIR

# Backup Application DATA
echo "Backing up GitLab application data"
docker exec -t $CONTAINER gitlab-rake gitlab:backup:create
cp -u $GITLAB_DIR/backups/. $BACKUP_DIR/ -a

# Backup configurations, SSH keys, and SSL certs
echo "Backing up GitLab configurations, ssh keys, and ssl certs"
# todo
sh -c "umask 0077; tar cf $BACKUP_DIR/$(date "+%s-gitlab-runner.tar") -C $RUNNER_DIR ."

# Remove files older than x days 
echo "Removing files older than $REMOVE_DAYS days"
find $BACKUP_DIR/*.tar -mtime $REMOVE_DAYS -exec rm {} \;
```



恢复脚本：

```bash
CONTAINER="gitlab"
BACKUP_DIR="/data/backup/gitlab"
GITLAB_DIR=`docker inspect gitlab --format='{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}'|grep /var/opt/gitlab |awk '{print $1}'`

# Restore application data
cp $BACKUP_DIR/*_gitlab_backup.tar $BACKUP_DIR/data/backups/
docker exec -it $CONTAINER sh -c 'chown git.git /var/opt/gitlab/backups/*.tar'
docker exec -it $CONTAINER gitlab-rake gitlab:backup:restore

# Restore configurations, ssh keys, SSL
tar -xvf $BACKUP_DIR/*-gitlab-config.tar -C $BACKUP_DIR
docker exec -it $CONTAINER gitlab-ctl reconfigure

# Fix permissions with container registry
docker exec -it $CONTAINER sh -c 'chown -R registry:registry /var/opt/gitlab/gitlab-rails/shared/registry'

# Restart all containers
docker-compose restart
```



## 参考文章

- [Running Gitlab CE Via Docker Behind A Reverse Proxy On Ubuntu](https://techoverflow.net/2018/12/17/running-gitlab-ce-via-docker-behind-a-reverse-proxy-on-ubuntu/)
