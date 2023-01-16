---
title: "Doris安装和部署"
date: 2022-08-18T09:47:03+08:00
slug: doris-install-deploy
categories: [Notes]
tags: [doris]
authors:
- chensoul   
---

{{<audio src="audios/here_after_us.mp3" caption="《后来的我们 - 五月天》" >}}

## 一、环境准备

### 1、安装要求

- CPU：2C（最低）8C（推荐）
- 内存：4G（最低）48G（推荐）
- 硬盘：100G（最低）400G（推荐）
- 平台：MacOS（Intel）、LinuxOS、Windows 虚拟机
- 系统：CentOS（7.1及以上）、Ubuntu（16.04 及以上）
- 软件：JDK（1.8及以上）、GCC（4.8.2 及以上）

### 2、环境规划

开发测试环境

| 模块      | CPU    | 内存    | 磁盘                 | 网络     | 实例数量 |
| -----    | -----  | -----   | -----               | -----    | ----- |
| Frontend | 8核+   | 8GB+    | SSD 或 SATA，10GB+ * | 千兆网卡  | 1        |
| Backend  | 8核+   | 16GB+   | SSD 或 SATA，50GB+ * | 千兆网卡   | 1-3 *    |

生产环境

| 模块     | CPU   | 内存  | 磁盘                     | 网络     | 实例数量（最低要求） |
| -------- | ----- | ----- | ------------------------ | -------- | -------------------- |
| Frontend | 16核+ | 64GB+ | SSD 或 RAID 卡，100GB+ * | 万兆网卡 | 1-5 *                |
| Backend  | 16核+ | 64GB+ | SSD 或 SATA，100G+ *     | 万兆网卡 | 10-100 *             |

> 说明：
>
> - FE 的磁盘空间主要用于存储元数据，包括日志和 image。通常从几百 MB 到几个 GB 不等。
> - BE 的磁盘空间主要用于存放用户数据，总磁盘空间按用户总数据量 * 3（3副本）计算，然后再预留额外 40% 的空间用作后台压缩以及一些中间数据的存放。
> - 一台机器上可以部署多个 BE 实例，但是**只能部署一个 FE**。如果需要 3 副本数据，那么至少需要 3 台机器各部署一个 BE 实例（而不是1台机器部署3个BE实例）。**多个FE所在服务器的时钟必须保持一致（允许最多5**秒的时钟偏差）
> - 测试环境也可以仅适用一个 BE 进行测试。实际生产环境，BE 实例数量直接决定了整体查询延迟。
> - 所有部署节点关闭 Swap。
> - Follower 的数量**必须**为奇数，至少为1，Observer 数量随意。
> - **如果 FE 和 BE 混部，需注意资源竞争问题，并保证元数据目录和数据目录分属不同磁盘。**

### 3、网络规划

Doris 各个实例直接通过网络进行通讯。

| 实例   | 端口名称        | 端口 | 通讯方向                     | 说明                                                 |
| ------ | --------------- | ---- | ---------------------------- | ---------------------------------------------------- |
| BE     | be_port         | 9060 | FE --> BE                    | BE 上 thrift server 的端口，用于接收来自 FE 的请求   |
| BE     | webserver_port  | 8040 | BE <--> BE                   | BE 上的 http server 的端口                           |
| BE     | heartbeatport   | 9050 | FE --> BE                    | BE 上心跳服务端口（thrift），用于接收来自 FE 的心跳  |
| BE     | brpc_port       | 8060 | FE <--> BE, BE <--> BE       | BE 上的 brpc 端口，用于 BE 之间通讯                  |
| FE     | http_port       | 8030 | FE <--> FE，用户 <--> FE     | FE 上的 http server 端口                             |
| FE     | rpc_port        | 9020 | BE --> FE, FE <--> FE        | FE 上的 thrift server 端口，每个fe的配置需要保持一致 |
| FE     | query_port      | 9030 | 用户 <--> FE                 | FE 上的 mysql server 端口                            |
| FE     | edit_log_port   | 9010 | FE <--> FE                   | FE 上的 bdbje 之间通信用的端口                       |
| Broker | broker_ipc_port | 8000 | FE --> Broker, BE --> Broker | Broker 上的 thrift server，用于接收请求              |

### 4、服务器配置

作为测试，服务器相关配置如下：

- 服务器：4C/8G
- IP地址：192.168.1.107
- 操作系统：Centos 7.9
- JDK版本：OpenJDK 1.8
- 操作用户：root

## 二、单机部署

### 1、系统设置

- 设置系统最大打开文件句柄数

```Bash
cat >> /etc/security/limits.conf<<EOF
*       soft    nproc   131072
*       hard    nproc   131072
*       soft    nofile  131072
*       hard    nofile  131072
root    soft    nproc   131072
root    hard    nproc   131072
root    soft    nofile  131072
root    hard    nofile  131072
EOF
```

- 设置时钟同步

```Bash
# 设置时钟同步

yum erase -y ntp
yum install -y chrony
sed -i -e '/^server/d' /etc/chrony.conf
echo "server ntp1.aliyun.com iburst" >> /etc/chrony.conf
egrep -v "^#|^$" /etc/chrony.conf 
systemctl start chronyd && systemctl enable chronyd
ss -tulp | grep chronyd
chronyc tracking
chronyc sources
chronyc sourcestats
```

- 关闭交换分区

```Bash
sysctl -w vm.swappiness=0 >/dev/null
echo vm.swappiness = 0 >> /etc/sysctl.conf
swapoff -a && sed -i '/swap/s/^/#/' /etc/fstab
```

- Liunx文件系统。在安装操作系统的时候，请选择ext4文件系统

### 2、安装jdk

```Bash
yum install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel

cat << EOF | sudo tee -a /etc/profile
export JAVA_HOME=/usr/lib/jvm/java
export CLASSPATH=.:\$JAVA_HOME/lib:\$JAVA_HOME/jre/lib:\$CLASSPATH
export PATH=\$JAVA_HOME/bin:\$JAVA_HOME/jre/bin:\$PATH
EOF

source /etc/profile
```

### 3、下载安装包

```Bash
wget https://mirrors.aliyun.com/apache/doris/1.1/1.1.1-rc03/apache-doris-1.1.1-bin-x86.tar.gz

tar zxvf apache-doris-1.1.1-bin-x86.tar.gz
mv apache-doris-1.1.1-bin-x86 /opt/doris
cd /opt/doris
```

### 4、配置 FE 和 BE

> 注意：
>
> FE 和 BE 是混合部署在一台服务器上时，数据目录需要使用不同的磁盘。

修改 FE，做出以下配置：

- 设置网络
- 设置元数据目录`meta_dir`。默认值为 `${DORIS_HOME}/doris-meta`，需**手动创建**该目录。**注意：生产环境强烈建议单独指定目录不要放在Doris安装目录下，最好是**单独的磁盘（如果有SSD最好），测试**开发**环境可以使用默认**配置**。
- 数据库表名支持小写
- 支持导出数据到本地目录
- fe.conf 中 JAVA_OPTS 默认 java 最大堆内存为 4GB，**建议生产环境调整至 8G 以上**

```Bash
sed -i -e '/^priority_networks/d' fe/conf/fe.conf

mkdir /meta

cat >> fe/conf/fe.conf <<EOF
priority_networks=192.168.1.0/24
meta_dir=/meta
lower_case_table_names=1
enable_outfile_to_local=true
EOF
```



修改 BE，做出以下配置：

- 设置网络。
- 设置数据存储根目录`storage_root_path`。默认在be/storage下，需要**手动创建**该目录。多个路径之间使用英文状态的分号分隔。

```Bash
sed -i -e '/^priority_networks/d' be/conf/be.conf

mkdir /data/doris

cat >> be/conf/be.conf <<EOF
priority_networks=192.168.1.0/24
storage_root_path=/data/doris
EOF
```

### 5、启动 FE 和 BE

```Bash
fe/bin/start_fe.sh --daemon
be/bin/start_be.sh --daemon
```

> 注意：
>
> **在生产环境中，所有实例都应使用守护进程启动，以保证进程退出后，会被自动拉起。**
>
> 参考文章：[Apache Doris通过supervisor进行进程管理 - 老董 - 博客园](https://www.cnblogs.com/lenmom/p/9973401.html)



可以通过如下链接查看 FE 是否启动成功：http://192.168.1.107:8030/api/bootstrap

通过如下链接查看 BE 是否启动成功：http://192.168.1.107:8040/api/health

### 6、安装 MySql 客户端

选择一台服务器，安装 mysql 8 客户端，这里我是在 192.168.1.107 上安装：

```Bash
wget https://dev.mysql.com/get/mysql80-community-release-el7-1.noarch.rpm
yum localinstall mysql80-community-release-el7-1.noarch.rpm

yum repolist all | grep mysql
yum repolist enabled | grep mysql
yum install yum-utils -y

yum-config-manager --enable mysql80-community
yum-config-manager --disable mysql57-community

rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
yum install mysql-community-client -y
```

### 7、在 FE 上添加 BE 节点

在 192.168.1.107 节点连接 FE，并且注册 BE 节点

```Bash
mysql -h 192.168.1.107 -P 9030 -uroot

ALTER SYSTEM ADD BACKEND "192.168.1.107:9050";
```

### 8、访问 Web UI

FE 节点Web UI：http://192.168.1.107:8030

BE 节点Web UI：http://192.168.1.107:8040



### 9、MySQL 客户端访问

```SQL
mysql -h 192.168.1.107 -P 9030 -uroot

> SHOW DATABASES;
> CREATE DATABASE example_db;
> USE example_db;

# 查看BE状态
> SHOW PROC '/backends'
```



## 三、集群部署

FE 角色：

- Follower：所有 Follower 角色的 FE 节点会组成一个可选择组，组内选择出一个 master 或者叫做 leader。当 Master 挂了，会自动选择新的 Follower 作为 Master。
- Observer：Observer仅仅作为观察者来同步已经成功写入的元数据日志，并且提供元数据读服务。他不会参与多数写的逻辑。Observer 也不会参与选举。

通常情况下，可以部署 1 Follower + 2 Observer 或者 3 Follower + N Observer。前者运维简单，几乎不会出现 Follower 之间的一致性协议导致这种复杂错误情况（企业大多使用这种方式）。后者可以保证元数据写的高可用，如果是高并发查询场景，可以适当增加 Observer。

### 1、在其他服务器上安装 doris

集群三个节点：

- 192.168.1.107 FE（master follower）、BE
- 192.168.1.108 FE（follower）、BE
- 192.168.1.109 FE（follower）、BE

在集群每个节点配置 hosts：

```bash
192.168.1.107 doris-01
192.168.1.108 doris-02
192.168.1.109 doris-03
```

参考单机部署步骤，在其他服务器上安装 doris 。

### 2、启动 BE

```Bash
be/bin/start_be.sh --daemon
```

### 3、FE 扩容

通过 mysql 客户端登陆 Master FE 也就是 192.168.1.107 

```Bash
mysql -h 192.168.1.107 -P 9030 -uroot
```

查看 FE 节点情况：

```Bash
mysql> SHOW PROC '/frontends';
```

也可以通过 http://192.168.1.107:8030/System?path=//frontends 查看

![img](https://chensoul.oss-cn-hangzhou.aliyuncs.com/images/doris-fe-web.jpg)

在 192.168.1.108 和  192.168.1.109 节点上启动 FE ：

```Bash
fe/bin/start_fe.sh --helper 192.168.1.107:9010 --daemon
```

> 注意：
>
> 第一次启动需要指定 `--helper`，之后不需要。

然后，登陆 Master FE，添加 FE 到集群：

```Bash
mysql -h 192.168.1.107 -P 9030 -uroot

ALTER SYSTEM ADD FOLLOWER  "192.168.1.108:9010";
ALTER SYSTEM ADD FOLLOWER  "192.168.1.109:9010";
```

查看 FE 状态

```Bash
SHOW PROC '/frontends';
```

### 4、在 FE 中添加 BE 节点

登陆 Master FE，注册 BE 节点

```Bash
mysql -h 192.168.1.107 -P 9030 -uroot

ALTER SYSTEM ADD BACKEND "192.168.1.107:9050";
ALTER SYSTEM ADD BACKEND "192.168.1.108:9050";
ALTER SYSTEM ADD BACKEND "192.168.1.109:9050";
```

查看BE状态

```Bash
SHOW PROC '/backends';
```

### 5、停止 FE 和 BE

```Bash
fe/bin/stop_fe.sh

be/bin/stop_be.sh
```

### 6、重新初始化集群

```Bash
cd /opt/doris

fe/bin/stop_fe.sh
be/bin/stop_be.sh

rm -rf /meta/* /data/doris/*
mkdir -p /meta /data/doris

# FE master
fe/bin/start_fe.sh --daemon
be/bin/start_be.sh --daemon

# FE follwer
fe/bin/start_fe.sh --helper 192.168.1.107:9010 --daemon
be/bin/start_be.sh --daemon


mysql -h 192.168.1.107 -P 9030 -uroot
ALTER SYSTEM ADD BACKEND "192.168.1.107:9050";
ALTER SYSTEM ADD BACKEND "192.168.1.108:9050";
ALTER SYSTEM ADD BACKEND "192.168.1.109:9050";

ALTER SYSTEM ADD FOLLOWER  "192.168.1.108:9010";
ALTER SYSTEM ADD FOLLOWER  "192.168.1.109:9010";
```

## 四、总结

安装 doris 完整安装脚本如下，你可以按照你的需求进行修改：

```Bash
cat >> /etc/security/limits.conf<<EOF
*       soft    nproc   131072
*       hard    nproc   131072
*       soft    nofile  131072
*       hard    nofile  131072
root    soft    nproc   131072
root    hard    nproc   131072
root    soft    nofile  131072
root    hard    nofile  131072
EOF

# 设置时钟同步
yum erase -y ntp
yum install -y chrony
sed -i -e '/^server/d' /etc/chrony.conf
echo "server ntp1.aliyun.com iburst" >> /etc/chrony.conf
egrep -v "^#|^$" /etc/chrony.conf 
systemctl start chronyd && systemctl enable chronyd
ss -tulp | grep chronyd
chronyc tracking
chronyc sources
chronyc sourcestats

# 安装 JDK 
yum install -y java-1.8.0-openjdk java-1.8.0-openjdk-devel
cat << EOF | sudo tee -a /etc/profile
export JAVA_HOME=/usr/lib/jvm/java
export CLASSPATH=.:\$JAVA_HOME/lib:\$JAVA_HOME/jre/lib:\$CLASSPATH
export PATH=\$JAVA_HOME/bin:\$JAVA_HOME/jre/bin:\$PATH
EOF
source /etc/profile

wget https://mirrors.aliyun.com/apache/doris/1.1/1.1.1-rc03/apache-doris-1.1.1-bin-x86.tar.gz
tar zxvf apache-doris-1.1.1-bin-x86.tar.gz
mv apache-doris-1.1.1-bin-x86 /opt/doris
cd /opt/doris

sed -i -e '/^priority_networks/d' fe/conf/fe.conf
mkdir /meta
cat >> fe/conf/fe.conf <<EOF
priority_networks=192.168.1.0/24
meta_dir=/meta
lower_case_table_names=1
enable_outfile_to_local=true
EOF

sed -i -e '/^priority_networks/d' be/conf/be.conf
mkdir /data/doris
cat >> be/conf/be.conf <<EOF
priority_networks=192.168.1.0/24
storage_root_path=/data/doris
EOF

fe/bin/start_fe.sh --daemon
be/bin/start_be.sh --daemon
```
