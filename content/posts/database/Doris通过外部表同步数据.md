---
title: "Doris通过外部表同步数据"
date: 2022-08-18T10:27:21+08:00
slug: doris-external-table-load
categories: ["database"]
tags: ["doris","mysql","postgresql"]
authors:
- chenshu
---

Doris 可以创建通过 ODBC 协议访问的外部表。创建完成后，可以通过 SELECT 语句直接查询外部表的数据，也可以通过 `INSERT INTO SELECT` 的方式导入外部表的数据。



目前支持的数据源包括：

- MySQL
- Oracle
- PostgreSQL
- SQLServer
- Hive(1.0版本支持)



开始之前，**特别说明**，本文是在 centos7.8 操作系统和 doris 1.1 版本下进行测试。



## 安装 ODBC 驱动

### 安装 mysql odbc

[官方文档运维常见问题](https://doris.apache.org/zh-CN/docs/faq/install-faq)中有提到：Doris 升级到1.0 以后版本通过ODBC访问MySQL外表报错 Failed to set ciphers to use (2026)：

```bash
ERROR 1105 (HY000): errCode = 2, detailMessage = driver connect Error: HY000 [MySQL][ODBC 8.0(w) Driver]SSL connection error: Failed to set ciphers to use (2026)
```

解决方式是使用`Connector/ODBC 8.0.28` 版本的 ODBC Connector， 并且在操作系统处选择 `Linux - Generic`, 这个版本的 ODBC Driver 使用 openssl 1.1 版本。或者使用低版本的 ODBC Connector，比如[Connector/ODBC 5.3.14](https://dev.mysql.com/downloads/connector/odbc/5.3.html)。

可以通过如下方式验证 MySQL ODBC Driver 使用的 openssl 版本

```bash
ldd /path/to/libmyodbc8w.so |grep libssl.so
```

如果输出包含 `libssl.so.10` 则使用过程中可能出现问题， 如果包含`libssl.so.1.1` 则与doris 1.0 兼容。



在这里，参考 [解决报错libssl.so.1.1: cannot open shared object file: No such file or directory](https://qq52o.me/2732.html)，直接将 openssl 升级到1.1：

```Bash
wget https://www.openssl.org/source/openssl-1.1.1q.tar.gz

tar -xvf openssl-1.1.1q.tar.gz 
cd openssl-1.1.1q 
./config shared --openssldir=/usr/local/openssl --prefix=/usr/local/openssl 
make && make install

mv /usr/bin/openssl /usr/bin/openssl.old 
mv /usr/lib/openssl /usr/lib/openssl.old 
ln -s /usr/local/openssl/bin/openssl /usr/bin/openssl 
ln -s /usr/local/openssl/include/openssl /usr/include/openssl 
echo "/usr/local/openssl/lib" >> /etc/ld.so.conf 
ldconfig -v

openssl version 
```



接下来，下载 mysql-connector-odbc-8.0.28 版本的 odbc 驱动，并安装：

```Bash
wget https://dev.mysql.com/get/Downloads/Connector-ODBC/8.0/mysql-connector-odbc-8.0.28-1.el7.x86_64.rpm

rpm -ivh mysql-connector-odbc-8.0.28-1.el7.x86_64.rpm
```

创建测试文件:

```Bash
echo "
[mysql]
Driver = MySQL ODBC 8.0 Unicode Driver
Description = MyODBC 8.0 Driver
SERVER = 127.0.0.1
PORT = 3306
USER = root
Password = 123456
Database = test
OPTION = 3
charset=UTF8
" > /etc/odbc.ini
```

执行命令，看驱动是否安装成功：

```Bash
isql -v mysql
```

查看 doris 中 MySQL ODBC Driver 使用的 openssl 版本：

```Bash
cat /opt/doris/be/conf/odbcinst.ini
ldd /usr/lib64/libmyodbc8w.so|grep libssl
```

> **注意：**我是将 doris 安装在 /opt/doris 目录。

### 安装 postgresql odbc

安装驱动：

```Bash
yum install -y unixODBC.x86_64 postgresql-odbc.x86_64
```

查看odbc配置文件：

```bash
odbcinst -j
```

创建测试文件：

```bash
echo "
[postgresql]
Driver = PostgreSQL
Description = Test to gp
Servername = 127.0.0.1
Trace = Yes
TraceFile = /tmp/sql.log
Database = test
Username = pgadmin
Password = 123456
Port = 5432
ReadOnly = 0
" > /etc/odbc.ini
```

测试：

```bash
isql -v postgresql
```



## 创建 ODBC Resource

ODBC Resource 的目的是用于统一管理外部表的连接信息。

创建一个 mysql 的外部资源：

```bash
CREATE EXTERNAL RESOURCE `mysql_odbc_test`
PROPERTIES (
    "type" = "odbc_catalog",
    "host" = "127.0.0.1",
    "port" = "3306",
    "user" = "root",
    "password" = "123456",
    "database" = "test",
    "odbc_type" = "mysql",
    "driver" = "MySQL ODBC 8.0 Unicode Driver"
);
```

创建一个 postgresql 的外部资源：

```bash
CREATE EXTERNAL RESOURCE `postgresql_odbc_test`
 PROPERTIES (
 "host" = "127.0.0.1",
 "port" = "5432",
 "user" = "pgadmin",
 "password" = "123456",
 "database" = "test",
 "driver" = "PostgreSQL",  
 "odbc_type" = "postgresql",
 "type" = "odbc_catalog"
 );
```

##### ODBC 相关参数如下：

- `type`: 必填，且必须为`odbc_catalog`。作为resource的类型标识。
- `user`: 外部表的账号，必填。
- `password`: 外部表的密码，必填。
- `host`: 外部表的连接ip地址，必填。
- `port`: 外部表的连接端口，必填。
- `odbc_type`: 标示外部表的类型，当前doris支持`mysql`与`oracle`，未来可能支持更多的数据库。引用该resource的ODBC外表必填，旧的mysql外表选填。
- `driver`: 标示外部表使用的 driver 动态库，引用该resource的ODBC外表必填，旧的mysql外表选填。**必须与 `be/conf/odbcinst.ini` 中 odbc 的名称保持一致。**

资源管理主要有三个命令：

- CREATE RESOURCE
- DROP RESOURCE
- SHOW RESOURCES

例如：

```sql
drop resource postgresql_odbc_lps;

show RESOURCES;
```

## 创建外部表

doris 目前支持的外部表有 MYSQL、POSTGRESQL、BROKER、HIVE、ICEBERG 、HUDI 等。



创建 mysql 的外部表：

```bash
CREATE EXTERNAL TABLE `ext_sys_shop` (
  `id` bigint NOT NULL COMMENT "",
  `name` varchar(32) NOT NULL COMMENT "",
  `code` varchar(32) NOT NULL COMMENT "",
  `tenant_id` varchar(10) NOT NULL COMMENT ""
) ENGINE=ODBC
COMMENT "ODBC"
PROPERTIES (
    "odbc_catalog_resource" = "mysql_odbc_test",
    "database" = "test",
    "table" = "sys_shop"
);
```

## 创建 Doris 表

创建 doris 表：

```SQL
CREATE TABLE `doris_sys_shop` (
  `id` bigint NOT NULL COMMENT "",
  `name` varchar(32) NOT NULL COMMENT "",
  `code` varchar(32) NOT NULL COMMENT "",
  `tenant_id` varchar(10) NOT NULL COMMENT ""
)
COMMENT "Doris Table"
DISTRIBUTED BY HASH(id) BUCKETS 10
PROPERTIES (
    "replication_num" = "1"
);
```

从外部表导入数据到 doris 表：

```SQL
INSERT INTO doris_sys_shop SELECT id,name,code,tenant_id FROM ext_sys_shop;
```

INSERT 命令是同步命令，返回成功，即表示导入成功。



## 注意事项

1. 必须保证外部 ODBC 数据源与 Doris 集群是可以互通，包括BE节点和外部数据源的网络是互通的。
2. ODBC 外部表本质上是通过单一 ODBC 客户端访问数据源，因此并不合适一次性导入大量的数据，建议分批多次导入。