---
title: "MySql安装和部署"
date: 2022-08-19T17:03:40+08:00
slug: mysql-install-deploy
categories: ["Notes"]
tags: ["mysql","docker"]
authors:
  - chensoul
---

## yum安装

### 1、安装

```bash
wget https://dev.mysql.com/get/mysql80-community-release-el7-1.noarch.rpm
yum localinstall mysql80-community-release-el7-1.noarch.rpm
```

查看仓库中 mysql 版本：
```bash
yum repolist all | grep mysql
yum repolist enabled | grep mysql
```

禁用 mysql8 仓库，启用 mysql5 仓库：

```bash
yum install yum-utils -y

yum-config-manager --disable mysql80-community
yum-config-manager --enable mysql57-community
```

安装 mysql 数据库和客户端：

```bash
yum install mysql-community-server -y  
```

启动数据库并设置开机启动：

```bash
systemctl start mysqld
systemctl enable mysqld
```



### 2、查看密码

在 MySQL 服务器初始启动时，如果服务器的数据目录为空，则会发生以下情况：

- MySQL 服务器已初始化。
- 在数据目录中生成SSL证书和密钥文件。

- 该[validate_password插件](https://dev.mysql.com/doc/refman/8.0/en/validate-password.html)安装并启用。
- 将创建一个超级用户 帐户`'root'@'localhost'`。并会设置超级用户的密码，将其存储在错误日志文件中。要显示它，请使用以下命令

```bash
$ grep 'temporary password' /var/log/mysqld.log 
2019-11-21T06:26:36.414908Z 1 [Note] A temporary password is generated for root@localhost: -*mN,epg4N)F
```



### 3、取消密码复杂度

编辑 /etc/my.cnf配置文件, 在 [mysqld]配置块儿中添加如下内容

```bash
plugin-load=validate_password.so  
validate-password=OFF
```

保存退出后，重启服务。


### 4、修改密码

通过上面日志中的临时密码登录并为超级用户帐户设置自定义密码：

```bash
mysqladmin -u root -p'-*mN,epg4N)F' password '1q2w3e4r'
```

注意: MySQL的 validate_password 插件默认安装。这将要求密码包含至少一个大写字母，一个小写字母，一个数字和一个特殊字符，并且密码总长度至少为8个字符。

如果不行的话，则先修改配置文件设置不使用密码，登陆进去之后再修改密码。

```bash
mysql -u root -p 
mysql> update mysql.user set authentication_string=PASSWORD('123456') where user='root';
```

退出mysql，注释掉/etc/my.cnf中的 skip-grant-tables=true 这一行后，保存并重启mysql，使用新密码登录即可



### 5、不使用密码

修改 /etc/my.cnf 文件，添加如下内容，之后重启服务

```bash
skip-grant-tables=true
```



### 6、配置默认编码为 utf8

MySQL 默认为 latin1, 一般修改为 UTF-8

```bash
shell> vi /etc/my.cnf 
[mysqld] 
# 在myslqd下添加如下键值对 
character_set_server=utf8 
init_connect='SET NAMES utf8'
```

重启 MySQL 服务，使配置生效

```bash
systemctl restart mysqld
```



### 7、查看字符集

```sql
mysql> SHOW VARIABLES LIKE 'character%';
+--------------------------+----------------------------+
| Variable_name            | Value                      |
+--------------------------+----------------------------+
| character_set_client     | utf8                       |
| character_set_connection | utf8                       |
| character_set_database   | utf8                       |
| character_set_filesystem | binary                     |
| character_set_results    | utf8                       |
| character_set_server     | utf8                       |
| character_set_system     | utf8                       |
| character_sets_dir       | /usr/share/mysql/charsets/ |
+--------------------------+----------------------------+
8 rows in set (0.00 sec
```



## docker安装

### 1、下载镜像

```bash
docker pull mysql
```

### 2、运行容器

```bash
docker run -d -p 3306:3306  \
  -v /data/docker/mysql/conf:/etc/mysql \
  -v /data/docker/mysql/logs:/var/log/mysql \
  -v /data/docker/mysql/data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  --name mysql mysql
```

命令参数：

- `-p 3306:3306`：将容器的3306端口映射到主机的3306端口
- `-v /data/docker/mysql/conf:/etc/mysql`：将主机当前目录下的 conf 挂载到容器的 /etc/mysql
- `-v /data/docker/mysql/logs:/var/log/mysql`：将主机当前目录下的 logs 目录挂载到容器的 /var/log/mysql
- `-v /data/docker/mysql/data:/var/lib/mysql`：将主机当前目录下的 data 目录挂载到容器的 /var/lib/mysql
- `-e MYSQL_ROOT_PASSWORD=123456`：初始化root用户的密码

### 3、查看容器启动情况

```bash
docker ps
```

### 4、配置防火墙

防火墙开启3306端口

```bash
firewall-cmd --add-port=3306/tcp

firewall-cmd --zone=public --add-port=3306/tcp --permanent
```

### 5、修改字符集

/data/docker/mysql/conf下创建my.cnf

```bash
[client]
default-character-set=utf8mb4

[mysqld]
character-set-client-handshake = FALSE
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci


[mysql]
default-character-set=utf8mb4
```

重新启动容器

```bash
docker restart mysql
```

### 6、访问数据库

进入容器：

```bash
docker exec -it mysql bash
```

在宿主机上登陆mysql：

```bash
#登录mysql
mysql -h192.168.56.100 -p3306 -uroot -p123456

#添加远程登录用户
CREATE USER 'test'@'%' IDENTIFIED WITH mysql_native_password BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'test'@'%';

#查看编码
showvariables like "%char%";

flush privileges;
```

## docker-compose安装

docker-compose.yml配置文件如下

```yml
version: '3.1'
services:
  db:
    image: mysql
    container_name: mysql 
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: 123456
    command:
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_general_ci
      --explicit_defaults_for_timestamp=true
      --lower_case_table_names=1
    ports:
      - 3306:3306
    volumes:
      - /data/docker/mysql/conf:/etc/mysql
      - /data/docker/mysql/logs:/var/log/mysql 
      - /data/docker/mysql/data:/var/lib/mysql
```