---
title: "使用Docker安装和配置Gitlab"
date: 2024-06-26T16:00:00+08:00
slug: install-jenkins
draft: false
categories: ["devops"]
tags: [ jenkins ]
---

## 使用 Docker Compose 安装

如果要使用 gitlab 自带的 nginx，compose 文件参考 https://github.com/hutchgrant/gitlab-docker-local/blob/master/docker-compose.yml。



在 192.168.1.107 服务器上安装 gitlab，并配置不使用 Gitlab 内置的 Nginx.

```bash
services:
    gitlab:
        image: gitlab/gitlab-ce
        platform: linux/amd64
        environment:
            GITLAB_OMNIBUS_CONFIG: |
                external_url 'http://192.168.1.107'
                gitlab_rails['gitlab_shell_ssh_port'] = 2222
                gitlab_rails['time_zone'] = 'Asia/Shanghai'
                gitlab_workhorse['listen_network'] = "tcp"
                gitlab_workhorse['listen_addr'] = "0.0.0.0:8880"
                nginx['enable'] = false
        ports:
            - '8880:8880'
            - '2222:22'
        volumes:
            - gitlab_data:/var/opt/gitlab
            - /etc/localtime:/etc/localtime:ro

volumes:
    gitlab_data:
```

## 配置

### 修改初始密码

查看容器：

```bash
$ docker ps
CONTAINER ID   IMAGE                   COMMAND                   CREATED          STATUS                    PORTS                                                                                               NAMES
13b7247c40b2   gitlab/gitlab-ce        "/assets/wrapper"         21 minutes ago   Up 17 minutes (healthy)   80/tcp, 443/tcp, 0.0.0.0:8880->8880/tcp, :::8880->8880/tcp, 0.0.0.0:2222->22/tcp, :::2222->22/tcp   docker-gitlab-1
```

可以看到 gitlab 容器名称为 docker-gitlab-1。

进入容器：

```bash
docker exec -it docker-gitlab-1 bash
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

访问 http://192.168.1.107:8880/ ，输入用户名 root 和修改后的密码登录。

### 配置反向代理

1. 准备好 SSL 文件，放置 /etc/nginx/ssl 目录
2. 安装 nginx。

3. 创建一个 nginx conf 文件 gitlab.conf 放到 nginx 的相应目录下。

```nginx
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
        proxy_pass     http://192.168.1.107:8880;
				proxy_read_timeout  90;
    		proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    		proxy_set_header X-Forwarded-Proto $scheme;
     }
}
```

修改 docker-compose 文件，external_url 改为域名

```bash
services:
    gitlab:
        image: gitlab/gitlab-ce
        platform: linux/amd64
        environment:
            GITLAB_OMNIBUS_CONFIG: |
                external_url 'https://gitlab.chensoul.cc'
                gitlab_rails['gitlab_shell_ssh_port'] = 2222
                gitlab_rails['time_zone'] = 'Asia/Shanghai'
                gitlab_workhorse['listen_network'] = "tcp"
                gitlab_workhorse['listen_addr'] = "0.0.0.0:8880"
                nginx['enable'] = false
        ports:
            - '8880:8880'
            - '2222:22'
        volumes:
            - gitlab_data:/var/opt/gitlab
            - /etc/localtime:/etc/localtime:ro

volumes:
    gitlab_data:
```



### 测试下载项目

创建一个项目 ：http://gitlab.chensoul.cc/chenzj/test.git ，让后下载项目

```bash
git clone https://gitlab.chensoul.cc/chenzj/test.git
```

在 gitlab 配置 ssh 秘钥，然后通过 ssh 下载项目。

```bash
git clone ssh://git@gitlab.chensoul.cc:2222/chenzj/test.git
```

### 配置邮箱

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
