---
title: "Greenplum CC Web安装和部署"
date: 2022-08-19T17:16:56+08:00
slug: greenplum-cc-web-install-deploy
categories: ["Notes"]
tags: ["greenplum"]
authors:
- chensoul
---

## 安装

1、下载安装文件

从 https://network.pivotal.io/products/pivotal-gpdb 下载，当前最新版本为 6.3.0。

2、解压安装文件

```bash
unzip greenplum-cc-web-6.3.0-gp6-rhel7-x86_64.zip
```

3、进入安装目录

```bash
cd greenplum-cc-web-6.3.0-gp6-rhel7-x86_64
```

4、创建配置文件 install.conf，用于设置安装参数

```bash
cat >> install.conf << EOF 
path = /usr/local
# Set the display_name param to the string to display in the GPCC UI.
# The default is "gpcc"
# display_name = gpcc

master_port = 5432
web_port = 28080
rpc_port = 8899
enable_ssl = false
# Uncomment and set the ssl_cert_file if you set enable_ssl to true.
# ssl_cert_file = /etc/certs/mycert
enable_kerberos = false
# Uncomment and set the following parameters if you set enable_kerberos to true.
# webserver_url = <webserver_service_url>
# krb_mode = 1
# keytab = <path_to_keytab>
# krb_service_name = postgres
# User interface language: 1=English, 2=Chinese, 3=Korean, 4=Russian, 5=Japanese
language = 1
EOF
```

6、执行安装命令

通过配置文件安装：

```bash
# -W 设置密码，输入gpmon
./gpccinstall-6.3.0 -auto -W
```

执行完之后，会发现创建了gpperfmon数据库：

```bash
CREATING SUPERUSER 'gpmon'...
CREATING COMMAND CENTER DATABASE 'gpperfmon'...
RELOADING pg_hba.conf. PLEASE WAIT ...
```

7、设置环境变量

```bash
echo "source /usr/local/greenplum-cc/gpcc_path.sh" >> ~/.bashrc

source  ~/.bashrc
```

8、同步配置文件

查看生成的文件 .pgpass

```bash
cat ~/.pgpass
*:5432:gpperfmon:gpmon:gpmon
```

> 可以看到创建了gpmon用户，密码为changeme。

可以修改该文件中密码为gpmon，或者通过环境变量设置：

```bash
PGPASSWORD=gpmon
```

也可以修改数据库中密码和~/.pgpass一致：

```bash
alter user gpmon encrypted password 'gpmon'
```



将该文件同步到Standby Master节点：

```bash
scp ~/.pgpass gpadmin@dw-test-node002:~
ssh dw-prod-node001 "chmod 600 ~/.pgpass"
```

9、查看配置文件

- `$MASTER_DATA_DIRECTORY/gpperfmon/conf/gpperfmon.conf`
- `$GPCC_HOME/conf/app.conf`
- `$MASTER_DATA_DIRECTORY/gpmetrics/gpcc.conf`
- `$MASTER_DATA_DIRECTORY/postgresql.conf`

查看$GPCC_HOME/conf/app.conf

```bash
$ cat $GPCC_HOME/conf/app.conf
appname         = gpccws
listentcp4      = true
runmode         = prod
session         = true
enablexsrf      = true
xsrfexpire      = 2592000
xsrfkey         = 61oETzKXQAGaYdkL5gEmGeJJFuYh7EQnp2XdTP1o
rendertype      = json
printallsqls    = false
master_port     = 5432
master_host     = dw-test-node001
path            = /usr/local
display_name    = gpcc
enable_kerberos = false
EnableHTTPS     = false
EnableHTTP      = true
httpport        = 28080
rpc_port        = 8899
language        = English
log_level       = INFO
ws_perf_port    = 6162
agent_perf_port = 616
```

修改 $MASTER_DATA_DIRECTORY/pg_hba.conf：

```bash
local   gpperfmon       gpmon   md5
host    gpperfmon       gpmon   0.0.0.0/0     md5
host    gpperfmon       gpmon   ::1/128       md5
```

> 需要重启gp数据库：gpstop -r

登陆测试：

```bash
psql -d gpperfmon -U gpmon -h -W
```

10、启动

```bash
$ PGPASSWORD=gpmon gpcc start

# 也可以输入密码登陆
$ gpcc start -W
```

查看状态：

```bash
$ gpcc status
2019-12-16 18:37:19 GPCC webserver: running
2019-12-16 18:37:19 GPCC agents: 3/3 agents running
```

查看日志：

```bash
tailf $GPCC_HOME/logs/gpccws.log
```

11、访问浏览器 http://192.168.56.141:28080 ，用户名和密码为 gpmon


12、查看配置参数

```bash
$ gpcc --settings
Install path:   /usr/local
Display Name:   gpcc
GPCC port:      28080
Kerberos:       disabled
SSL:            disabled
```

## 禁用gpperfmon

1、安装

使用gpperfmon_install命令可以创建名称为gpperfmon的数据库，默认使用gpmon用户。

```bash
gpperfmon_install --enable --password gpmon --port 5432
```

当然，在前面运行gpccinstall-6.1.0的时候，已经创建了该数据库。

2、查看gpperfmon是否开启

```bash
gpconfig -s gp_enable_gpperfmon
```

3、 Greenplum Command Center不再需要gpperfmon agent搜集的历史数据，所以需要禁用gp_enable_gpperfmon

```bash
gpconfig -c gp_enable_perform -v off
```

4、然后重启数据库

```bash
gpstop -ar 

#强制重启
gpstop -Ma immediate
```

## 设置gpmon角色日志参数

连接gpperfmon数据库：

```bash
psql -d gpperfmon -p 5432 -U gpadmin
```

修改角色：

```bash
psql -d gpperfmon -U gpmon
psql (9.4.24)
Type "help" for help.

gpperfmon=# ALTER ROLE gpmon SET log_statement TO DDL;
ALTER ROLE
gpperfmon=# ALTER ROLE gpmon SET log_min_messages to FATAL;
ALTER ROLE
```

## 卸载

1、停止

```bash
gpcc stop
```

2、删除安装目录

```bash
rm -rf /usr/local/greenplum-cc-web-6.1.0
```

3、禁用采集数据agent

```bash
su - gpadmin
gpconfig -c gp_enable_gpperfmon -v off
```

4、删除pg_hba.conf中gpmon条目

```bash
#local     gpperfmon     gpmon     md5  
#host      gpperfmon     gpmon    0.0.0.0/0    md5
```

5、删除角色

```bash
psql template1 -c 'DROP ROLE gpmon;'
```

6、重启数据库

```bash
gpstop -r
```

7、删除未提交的的数据和日志

```bash
rm -rf $MASTER_DATA_DIRECTORY/gpperfmon/data/* 
rm -rf $MASTER_DATA_DIRECTORY/gpperfmon/logs/*
```

8、删除数据库

```bash
dropdb gpperfmon
```

