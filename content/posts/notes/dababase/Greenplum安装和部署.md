---
title: "Greenplum安装和部署"
date: 2022-08-19T17:14:18+08:00
slug: greenplum-install-deploy
categories: ["Notes"]
tags: ["greenplum"]
authors:
- chensoul
---

本文主要介绍如何快速安装部署单节点的 Greenplum过程，以及Greenplum的一些常用命令及工具。

## 环境准备

### 环境说明

操作系统：Centos7

节点环境：

| ip             | hostname        | 角色    |
| -------------- | --------------- | ------- |
| 192.168.56.141 | dw-test-node001 | master  |
| 192.168.56.142 | dw-test-node002 | segment |
| 192.168.56.143 | dw-test-node003 | segment |

安装用户：root

### 配置系统参数

在每台服务器上执行以下操作。

#### 配置hosts文件

```bash
cat > /etc/hosts <<EOF
192.168.56.141 dw-test-node001
192.168.56.142 dw-test-node002
192.168.56.143 dw-test-node003
EOF
```

#### 关闭selinux

```bash
setenforce 0  >/dev/null 2>&1
sed -i -e 's/^SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
sed -i -e 's/^SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
```

#### 关闭防火墙

```bash
systemctl stop firewalld.service && systemctl disable firewalld.service
```

#### 设置时钟同步

```bash
yum install ntp -y

cat > /etc/ntp.conf << EOF
#在与上级时间服务器联系时所花费的时间，记录在driftfile参数后面的文件
driftfile /var/lib/ntp/drift
#默认关闭所有的 NTP 联机服务
restrict default ignore
restrict -6 default ignore
#如从loopback网口请求，则允许NTP的所有操作
restrict 127.0.0.1
restrict -6 ::1
#使用指定的时间服务器
server ntp1.aliyun.com
server ntp2.aliyun.com
server ntp3.aliyun.com
#允许指定的时间服务器查询本时间服务器的信息
restrict ntp1.aliyun.com nomodify notrap nopeer noquery
#其它认证信息
includefile /etc/ntp/crypto/pw
keys /etc/ntp/keys
EOF

systemctl start ntpd && systemctl enable ntpd
echo '* */6 * * * /usr/sbin/ntpdate -u ntp1.aliyun.com && /sbin/hwclock --systohc > /dev/null 2>&1' >> /var/spool/cron/`whoami`
```

#### 配置内核参数

参考 https://segmentfault.com/a/1190000020654036?utm_source=tag-newest

```bash
#设置内核参数
cat > greenplum.conf <<EOF
kernel.shmall = 2033299
kernel.shmmax = 8328392704
kernel.shmmni = 4096
kernel.sem = 500 1024000 200 4096
kernel.sysrq = 1
kernel.core_uses_pid = 1
kernel.msgmnb = 65536
kernel.msgmax = 65536
kernel.msgmni = 31764
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.tcp_tw_recycle = 1
net.ipv4.tcp_max_syn_backlog = 4096
net.ipv4.conf.all.arp_filter = 1
net.ipv4.ip_local_port_range = 10000 65535
net.core.netdev_max_backlog = 10000
net.core.rmem_max = 2097152
net.core.wmem_max = 2097152
vm.overcommit_memory = 2
vm.overcommit_ratio = 95 
vm.swappiness = 0
vm.zone_reclaim_mode = 0
#这个时候，后台进行在脏数据达到3%时就开始异步清理，但在10%之前系统不会强制同步写磁盘。刷脏进程3秒起来一次，脏数据存活超过10秒就会开始刷。
vm.dirty_expire_centisecs = 500
vm.dirty_writeback_centisecs = 100
vm.dirty_background_ratio = 3
vm.dirty_ratio = 10
EOF

mv greenplum.conf /etc/sysctl.d/greenplum.conf
sysctl -p /etc/sysctl.d/greenplum.conf
```

生产环境的配置，需要详细参考官方文档的说明：https://gpdb.docs.pivotal.io/6-1/install_guide/prep_os.html#topic3__sysctl_file

kernel.shmall（共享内存页总数）
kernel.shmmax (共享内存段的最大值)
一般来讲，这两个参数的值应该是物理内存的一半，可以通过操作系统的值_PHYS_PAGES和PAGE_SIZE计算得出。

```bash
kernel.shmall = ( _PHYS_PAGES / 2)
kernel.shmmax = ( _PHYS_PAGES / 2) * PAGE_SIZE
```

也可以通过以下两个命令得出这两个参数的值：

```bash
echo $(expr $(getconf _PHYS_PAGES) / 2) 
echo $(expr $(getconf _PHYS_PAGES) / 2 \* $(getconf PAGE_SIZE))
```

如果得出的kernel.shmmax值小于系统的默认值，则引用系统默认值即可



对于64G内存的操作系统，建议配置如下值：

```bash
vm.dirty_background_ratio = 0
vm.dirty_ratio = 0
vm.dirty_background_bytes = 1610612736 # 1.5GB
vm.dirty_bytes = 4294967296 # 4GB
```

对于小于64G内存的操作系统，建议配置如下值：

```bash
vm.dirty_background_ratio = 3
vm.dirty_ratio = 10
```

#### 设置文件句柄数

```bash
cat >/etc/security/limits.d/file.conf<<EOF
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

#### 设置SSH连接

```bash
sed -i 's/#MaxStartups 10:30:100/MaxStartups 10:30:200/g' /etc/ssh/sshd_config
service sshd restart
```

### 配置 Greenplum 要求的参数

#### 磁盘IO设置

设置磁盘预读

```bash
fdisk -l

/sbin/blockdev --setra 16384 /dev/sdb
```

调整IO调度算法

```bash
echo deadline > /sys/block/sdb/queue/scheduler
grubby --update-kernel=ALL --args="elevator=deadline"
```

#### 设置Transparent Huge Pages

禁止透明大页，Redhat 6以及更高版本默认激活THP，THP会降低GP database性能，通过修改文件/boot/grub/grub.conf添加参数transparent_hugepage=never禁止THP的应用，但需要重新启动系统

```bash
echo "echo never > /sys/kernel/mm/*transparent_hugepage/defrag" >/etc/rc.local
echo "echo never > /sys/kernel/mm/*transparent_hugepage/enabled" >/etc/rc.local
grubby --update-kernel=ALL --args="transparent_hugepage=never"
```

> 需要重启系统

查看是否禁用：

```bash
$ cat /sys/kernel/mm/*transparent_hugepage/enabled
always madvise [never]
```

检查内核参数：

```bash
$ grubby --info=ALL
index=0
kernel=/boot/vmlinuz-4.4.202-1.el7.elrepo.x86_64
args="ro elevator=deadline no_timer_check crashkernel=auto rd.lvm.lv=centos_centos7/root rd.lvm.lv=centos_centos7/swap biosdevname=0 net.ifnames=0 rhgb quiet numa=off transparent_hugepage=never"
root=/dev/mapper/centos_centos7-root
initrd=/boot/initramfs-4.4.202-1.el7.elrepo.x86_64.img
title=CentOS Linux (4.4.202-1.el7.elrepo.x86_64) 7 (Core)
```

#### 关闭RemoveIPC

```bash
sed -i 's/#RemoveIPC=no/RemoveIPC=no/g' /etc/systemd/logind.conf
service systemd-logind restart
```

#### 挂载磁盘

先查看磁盘挂载：

```bash
fdisk -l
```

如果没有磁盘，则需要挂载磁盘。官方建议使用XFS磁盘类型，当然其他磁盘类型也是可以。

配置/etc/fstab文件以使Linux系统启动默认挂载磁盘，如下配置添加到文件/etc/fstab：

```bash
mkfs.xfs -f /dev/sdb

mkdir /data

echo "/dev/sdb /data xfs  nodev,noatime,nobarrier,inode64 0 0" >> /etc/fstab

mount -a
```

### 创建Greenplum管理员用户

使用root用户创建用户 gpadmin，这里密码也设置为 gpadmin

```bash
USER=gpadmin

groupadd $USER
useradd $USER -r -m -g $USER
echo $USER|passwd $USER --stdin >/dev/null 2>&1
```

添加sudo权限：

```bash
echo "$USER ALL = (root) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/$USER
```

切换到 gpadmin 用户，生成ssh密钥：

```bash
su gpadmin

[ ! -f ~/.ssh/id_rsa.pub ] && (yes|ssh-keygen -f ~/.ssh/id_rsa -t rsa -N "")
( chmod 600 ~/.ssh/id_rsa.pub ) && cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```



## 安装数据库

### 安装

1、下载页面：https://network.pivotal.io/products/pivotal-gpdb/ ，当前最新版本为6.21.2，对应的rpm文件 greenplum-db-6.21.2-rhel7-x86_64.rpm。

拷贝到每个节点：

```bash
scp greenplum-db-6.21.2-rhel7-x86_64.rpm gpadmin@dw-test-node001:~
scp greenplum-db-6.21.2-rhel7-x86_64.rpm gpadmin@dw-test-node002:~
scp greenplum-db-6.21.2-rhel7-x86_64.rpm gpadmin@dw-test-node003:~
```

2、每个节点安装RPM

```bash
ssh dw-test-node001 "sudo yum install greenplum-db-6.21.2-rhel7-x86_64.rpm -y"
ssh dw-test-node002 "sudo yum install greenplum-db-6.21.2-rhel7-x86_64.rpm -y"
ssh dw-test-node003 "sudo yum install greenplum-db-6.21.2-rhel7-x86_64.rpm -y"
```

3、修改安装目录权限

```bash
ssh dw-test-node001 "sudo chown -R gpadmin:gpadmin /usr/local/greenplum*"
ssh dw-test-node002 "sudo chown -R gpadmin:gpadmin /usr/local/greenplum*"
ssh dw-test-node003 "sudo chown -R gpadmin:gpadmin /usr/local/greenplum*"
```

### 确保无密码登陆

1、dw-test-node001节点上配置gpadmin用户无密码登陆到其他节点：

```bash
su gpadmin
ssh-copy-id dw-test-node001
ssh-copy-id dw-test-node002
ssh-copy-id dw-test-node003
```

2、设置greenplum环境变量使其生效

```bash
source /usr/local/greenplum-db/greenplum_path.sh
```

3、配置hostfile_all文件，将所有的服务器名记录在里面。

```bash
cat > hostfile_all << EOF
dw-test-node001
dw-test-node002
dw-test-node003
EOF
```

hostfile_segment只保存segment节点的hostname

```bash
cat > hostfile_segment << EOF
dw-test-node002
dw-test-node003
EOF
```

4、使用gpssh-exkeys打通所有服务器，配置所有GP节点之间ssh互信：

```bash
$ gpssh-exkeys -f hostfile_all 
[STEP 1 of 5] create local ID and authorize on local host
  ... /home/gpadmin/.ssh/id_rsa file exists ... key generation skipped

[STEP 2 of 5] keyscan all hosts and update known_hosts file

[STEP 3 of 5] retrieving credentials from remote hosts
  ... send to dw-test-node001
  ... send to dw-test-node002

[STEP 4 of 5] determine common authentication file content

[STEP 5 of 5] copy authentication files to all remote hosts
  ... finished key exchange with dw-test-node001
  ... finished key exchange with dw-test-node002

[INFO] completed successfully
```

在打通所有机器通道之后，我们就可以使用gpssh命令对所有机器进行批量操作了。

```bash
gpssh -f hostfile_all "ls -l /usr/local/greenplum-db"
```

### 创建存储

master上创建目录：

```bash
gpssh -h dw-test-node001 -e 'sudo mkdir -p /gpdata/master && sudo chown gpadmin:gpadmin /gpdata/master' 
```

数据节点创建目录：

```bash
gpssh -f hostfile_segment -e 'sudo mkdir -p /gpdata/primary{0,1} /gpdata/mirror{0,1} && sudo chown -R gpadmin:gpadmin /gpdata/*'
```

### 初始化数据库

#### 创建模板

配置文件的模板可以在 $GPHOME/docs/cli_help/gpconfigs/ 目录下找到。gpinitsystem_config文件是初始化Greenplum的模板，在这个模板中，Mirror Segment的配置都被注释掉了，模板中基本初始化数据库的参数都是有的。

```bash
cat > gpinitsystem_config <<EOF
#数据库的代号
ARRAY_NAME="Greenplum Data Platform"
#Segment的名称前缀
SEG_PREFIX=gpseg
#Primary Segment起始的端口号
PORT_BASE=40000
#指定Primary Segment的数据目录，配置几次资源目录就是每个子节点有几个实例（推荐4-8个，这里配置了4个，primary与mirror文件夹个数对应）
declare -a DATA_DIRECTORY=(/gpdata/primary0 /gpdata/primary1)
#Master所在机器的Hostname
MASTER_HOSTNAME=dw-test-node001
#指定Master的数据目录
MASTER_DIRECTORY=/gpdata/master
#Master的端口
MASTER_PORT=5432
#指定Bash的版本
TRUSTED_SHELL=ssh
#设置的是检查点段的大小，较大的检查点段可以改善大数据量装载的性能，同时会加长灾难事务恢复的时间。
CHECK_POINT_SEGMENTS=8
#字符集
ENCODING=utf-8

#Mirror Segment起始的端口号
MIRROR_PORT_BASE=41000
#Primary Segment主备同步的起始端口号
REPLICATION_PORT_BASE=42000
#Mirror Segment主备同步的起始端口号
MIRROR_REPLICATION_PORT_BASE=43000
#Mirror Segment的数据目录,配置几次资源目录就是每个子节点有几个实例（推荐4-8个，这里配置了4个，primary与mirror文件夹个数对应）
declare -a MIRROR_DATA_DIRECTORY=(/gpdata/mirror0 /gpdata/mirror1)

MASTER_MAX_CONNECT=250
EOF
```

> 如果是挂载了多个磁盘，则数据路径需要使用独立的路径。

#### 初始化数据库

使用gpinitsystem脚本来初始化数据库，命令如下：

```bash
gpinitsystem -c gpinitsystem_config -h hostfile_segment
```

也可以指定standby master ：

```BASH
gpinitsystem -c gpinitsystem_config -h hostfile_segment -s dw-test-node002
```

> 如果不想手动确认，可以添加 `-a` 参数。

后期添加standby master：

```bash
#在不同机器增加standby master节点
gpinitstandby -S /gdata/master/gpseg1 -s dw-test-node001

#在同一机器增加standby master节点
gpinitstandby -S /gdata/master/gpseg1 -P 5433 -s dw-test-node001
```

#### 设置环境变量

切换到gpadmin用户：

```bash
su - gpadmin 

cat >>  ~/.bashrc <<EOF
source /usr/local/greenplum-db/greenplum_path.sh
export GPHOME=/usr/local/greenplum-db
export MASTER_DATA_DIRECTORY=/gpdata/master/gpseg1
export PGPORT=5432
export PGUSER=gpadmin
export PGDATABASE=postgres
export LD_PRELOAD=/lib64/libz.so.1
EOF

source ~/.bashrc
```

如果配置了 standby master节点，则拷贝到standby master节点：

```bash
scp ~/.bashrc dw-test-node002:~
ssh dw-test-node002 "source ~/.bashrc"
```

#### 设置数据库时区

```bash
gpconfig -s TimeZone
gpconfig -c TimeZone -v 'Asia/Shanghai'
```

### 修改配置

#### 设置远程用户访问

查看/gpdata/master/gpseg1/pg_hba.conf：

```bash
local    all         gpadmin         ident
host     all         gpadmin         127.0.0.1/28    trust
host     all         gpadmin         192.168.56.141/32       trust
local    replication gpadmin         ident
host     replication gpadmin         samehost       trust
host     replication gpadmin         192.168.56.141/32       trust
```

修改为：

```bash
local    all         gpadmin         ident
host     all         gpadmin         127.0.0.1/28    trust
host     all         gpadmin         192.168.56.141/32       trust
local    replication gpadmin         ident
host     replication gpadmin         samehost       trust
host     replication gpadmin         192.168.56.141/32       trust

host     all         all		         192.168.56.141/32       trust  #add this
```

> 添加一行，设置192.168.56.141/32可以访问所有数据库

#### 设置监听IP和Port

```bash
vi /gpdata/master/gpseg1/postgresql.conf

# 设置监听IP (* 生产环境慎用)
listen_addresses = '${ host ip address } '
port = 5432
```

### 启动与关闭

启动数据库：

```bash
gpstart -a
```

关闭数据库：

```bash
gpstop -a

gpstop -M fast
```

重启数据库：

```bash
gpstop -ar
```

重新加载配置文件：

```bash
 gpstop -u
```

设置开机启动：

```bash
cat > greenplum.service <<EOF 
[Unit]
Description=greenplum server daemon

[Service]
Restart=on-failure
ExecStart=/usr/local/greenplum-db/bin/gpstart -a
 
[Install]
WantedBy=multi-user.target
EOF

sudo mv greenplum.service /usr/lib/systemd/system/
```

### 测试

#### 客户端访问

在本地访问：

```bash
psql -p 5432 -U gpadmin -d postgres
```

在其他机器访问：

```bash
psql -p 5432 -h 192.168.56.141 -U gpadmin -d postgres
```



### 清空数据

```bash
#如有报错需重新初始化，清理以下内容：
kill -9 $(ps -ef |grep greenplum|awk '{print $2}')
gpssh -f hostfile_all -e "rm -rf /gpdata/master/*"
gpssh -f hostfile_segment -e "rm -rf /gpdata/{mirror*,primary*}/*"
rm  -f /tmp/.s.PGSQL*.lock
```

### 升级

1、登陆：

```bash
su - gpadmin
```

2、停止数据库

master节点执行：

```bash
gpstop -a
```

3、安装新版本

从https://github.com/greenplum-db/gpdb/releases 下载最新版本，并拷贝到每个阶段。在每个节点运行下面命令：

```bash
sudo yum install greenplum-db-6.21.2-rhel7-x86_64.rpm -y
```

4、设置目录权限

每个节点执行：

```bash
sudo chown -R gpadmin:gpadmin /usr/local/greenplum*
```

5、设置环境变量

重新设置软连接：

```bash
rm /usr/local/greenplum-db
ln -s /usr/local/greenplum-db-6.21.2 /usr/local/greenplum-db
source ~/.bashrc
```

6、启动数据库

master节点执行：

```bash
gpstart -a
```

### 常用命令

#### 查看数据库状态

1、查看segment

列出当前状态为down的Segment：

```sql
SELECT * FROM gp_segment_configuration WHERE status <> 'u';
```

检查当前处于改变跟踪模式的Segment。

```sql
SELECT * FROM gp_segment_configuration WHERE mode = 'c';
```

检查当前在重新同步的Segment。

```sql
SELECT * FROM gp_segment_configuration WHERE mode = 'r';
```

检查没有以其最优角色运转的Segment。

```sql
SELECT * FROM gp_segment_configuration WHERE preferred_role <> role;
```

运行一个分布式查询来测试它运行在所有Segment上。对每个主Segment都应返回一行。

```sql
SELECT gp_segment_id, count(*) FROM gp_dist_random('pg_class') GROUP BY 1;
```



2、查看数据库连接

查看到当前数据库连接的IP 地址，用户名，提交的查询等。

```sql
select * from pg_stat_activity 
```



3、查看表存储结构

查看表的存储结构:

```sql
select distinct relstorage from pg_class;
```

查询当前数据库有哪些AO表：

```sql
select t2.nspname, t1.relname from pg_class t1, pg_namespace t2 where t1.relnamespace=t2.oid and relstorage in ('c', 'a');
```

查询当前数据库有哪些堆表：

```sql
select t2.nspname, t1.relname from pg_class t1, pg_namespace t2 where t1.relnamespace=t2.oid and relstorage in ('h')  and relkind='r'; 
```



#### 维护数据库

检查表上缺失的统计信息。

```sql
SELECT * FROM gp_toolkit.gp_stats_missing;
```

检查数据文件中出现膨胀（死亡空间）且无法用常规VACUUM命令恢复的表。

```sql
SELECT * FROM gp_toolkit.gp_bloat_diag;
```

清理用户表

```sql
VACUUM <table>;
```

分析用户表。

```sql
analyzedb -d <database> -a

analyzedb -s pg_catalog -d <database>
```

推荐周期性地在系统目录上运行VACUUM和REINDEX来清理系统表和索引中已删除对象所占用的空间：

下面的示例脚本在一个Greenplum数据库系统目录上执行一次VACUUM、REINDEX以及ANALYZE：

```bash
#!/bin/bash
DBNAME="<database-name>"
SYSTABLES="' pg_catalog.' || relname || ';' from pg_class a, pg_namespace b 
where a.relnamespace=b.oid and b.nspname='pg_catalog' and a.relkind='r'"
psql -tc "SELECT 'VACUUM' || $SYSTABLES" $DBNAME | psql -a $DBNAME
reindexdb --system -d $DBNAME
analyzedb -s pg_catalog -d $DBNAME
```

#### 查看磁盘空间

1、检查磁盘空间使用

以使用gp_toolkit管理方案中的gp_disk_free外部表来检查Segment主机文件系统中的剩余空闲空间（以千字节计）。

```sql
dw_lps=# SELECT * FROM gp_toolkit.gp_disk_free ORDER BY dfsegment;
 dfsegment |    dfhostname    | dfdevice  |  dfspace
-----------+------------------+-----------+-----------
         0 |  dw-test-node001 |  /dev/sdb | 472594712
         1 |  dw-test-node001 |  /dev/sdb | 472594712
(2 rows)
```

2、查看数据库的磁盘空间使用

要查看一个数据库的总尺寸（以字节计），使用*gp_toolkit*管理方案中的*gp_size_of_database*视图。

```sql
dw_lps=# SELECT * FROM gp_toolkit.gp_size_of_database ORDER BY sodddatname;
 sodddatname | sodddatsize
-------------+-------------
 dw_lps      |  3833874988
 gpperfmon   |    63310532
(2 rows)
```

查看某个数据库占用空间：

```sql
dw_lps=# select pg_size_pretty(pg_database_size('dw_lps'));
 pg_size_pretty
----------------
 3656 MB
(1 row)
```



3、查看一个表的磁盘空间使用

```sql
SELECT relname AS name, sotdsize AS size, sotdtoastsize 
   AS toast, sotdadditionalsize AS other 
   FROM gp_toolkit.gp_size_of_table_disk as sotd, pg_class 
   WHERE sotd.sotdoid=pg_class.oid ORDER BY relname;
```



4、查看索引的磁盘空间使用

```sql
SELECT soisize, relname as indexname
   FROM pg_class, gp_toolkit.gp_size_of_index
   WHERE pg_class.oid=gp_size_of_index.soioid 
   AND pg_class.relkind='i';
```



#### 查看数据分布

1、查看某个表的数据分布：

```sql
dw_lps=# select gp_segment_id,count(*) from ods_lps_bill group by gp_segment_id;

 gp_segment_id |  count
---------------+---------
             0 | 1440129
             1 | 1439143
(2 rows)
```

2、查询压缩率：

```sql
select get_ao_compression_ratio('ods_lps_bill');
```

3、查看AO表的膨胀率

```sql
select * from gp_toolkit.__gp_aovisimap_compaction_info('ods_lps_bill'::regclass);
```

膨胀率超过千分之2的AO表：

```sql
select * from (  
  select t2.nspname, t1.relname, (gp_toolkit.__gp_aovisimap_compaction_info(t1.oid)).*   
  from pg_class t1, pg_namespace t2 where t1.relnamespace=t2.oid and relstorage in ('c', 'a')   
) t   
where t.percent_hidden > 0.2;
```

#### 查看元数据

1、查看表元数据

```sql
\d+ ods_lps_bill
```

2、查看某一个表上执行的操作

```sql
SELECT schemaname as schema, objname as table, 
   usename as role, actionname as action, 
   subtype as type, statime as time 
   FROM pg_stat_operations 
   WHERE objname='ods_lps_bill';
```



### 参考文章

- [greenplum集群的rpm（生产环境）部署及参数优化](https://blog.csdn.net/q936889811/article/details/85603814)
- [Installing the Greenplum Database Software](https://gpdb.docs.pivotal.io/6-1/install_guide/install_gpdb.html)