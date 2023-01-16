---
title: "Linux设置时钟同步"
date: 2022-08-16T10:13:42+08:00
slug: config-ntp-on-linux
categories: ["Notes"]
tags: ["ntp","chrony"]
authors:
- chensoul
---

NTP 是 Network Time Protocol 的缩写，也即网络时间协议，一种在 Linux 上保持准确时间的协议，它和网络上可用的 NTP 服务器保持着时钟同步。

用于同步日期和时间的 ntpd 服务，在新的Linux发行版 ( centos8、Ubuntu 20.04、Fedora 30 ) 中已经废弃了，取而代之的是 chrony。

Chrony 和 NTP 的区别如下：

| `ntp name`       | `chrony name`       |
| ---------------- | ------------------- |
| /etc/ntp.conf    | /etc/chrony.conf    |
| /etc/ntp/keys    | /etc/chrony.keys    |
| ntpd             | chronyd             |
| ntpq             | chronyc             |
| ntpd.service     | chronyd.service     |
| ntp-wait.service | chrony-wait.service |

## NTP

### 1、安装 NTP 服务

```bash
yum install -y ntp
```

接下来可以使用 ntpdate 命令来更新时间，比如，在联网环境下，可以通过网络上的校时服务器来同步时间。

常见的校时服务器：

```bash
# 国家授时中心
210.72.145.44
# 阿里云
ntp.aliyun.com

s1a.time.edu.cn #北京邮电大学
s1b.time.edu.cn #清华大学
s1c.time.edu.cn #北京大学
s1d.time.edu.cn #东南大学
s1e.time.edu.cn #清华大学
s2a.time.edu.cn #清华大学
s2b.time.edu.cn #清华大学
s2c.time.edu.cn #北京邮电大学
s2d.time.edu.cn #西南地区网络中心
s2e.time.edu.cn #西北地区网络中心
s2f.time.edu.cn #东北地区网络中心
s2g.time.edu.cn #华东南地区网络中心
s2h.time.edu.cn #四川大学网络管理中心
s2j.time.edu.cn #大连理工大学网络中心
s2k.time.edu.cn #CERNET桂林主节点
s2m.time.edu.cn #北京大学
ntp.sjtu.edu.cn #上海交通大学
```

下面是采用微软的校时服务器调整系统时间

```bash
ntpdate time.windows.com 
```

### 2、内网搭建时钟服务器

如果是在内网不能连接外网，则可以在内网选择一台服务器作为时钟服务器，其他服务器都作为客户端同步这台时钟服务器的时间。

修改 `/etc/ntp.conf` 配置，注释或者删除 `server` 开头的配置：

```bash
sed -i "/^server/ d" /etc/ntp.conf
```

使用本地时钟作为ntp服务器时间，这里的 127.127.1.0 在 ntp 中代表本机 

```bash
cat << EOF | sudo tee -a /etc/ntp.conf
server 127.127.1.0
fudge 127.127.1.0 stratum 10
EOF
```

启动 ntp 服务，并设置开机启动：

```bash
systemctl start ntpd
systemctl enable ntpd
```

配置客户端。同样，需要先安装 ntp 服务，然后修改 `/etc/ntp.conf` 文件，注释或者删除 `server` 开头的配置，并添加一行：

```bash
sed -i "/^server/ d" /etc/ntp.conf
cat << EOF | sudo tee -a /etc/ntp.conf
server 192.168.1.107
EOF
sudo systemctl start ntpd
sudo systemctl enable ntpd
ntpdate -u ntp1.aliyun.com
hwclock --systohc
```

启动 ntp 服务，并设置开机启动：

```bash
systemctl start ntpd
systemctl enable ntpd
```

向时钟服务器发送请求，同步时间 

```bash
ntpdate 192.168.1.107
```

### 3、使用网络时钟服务器

如果内网服务器可以联网，则可以将所有服务器配置为客户端连接网络上的时钟服务器。

这里使用阿里云的时钟服务器，所有服务器作为客户端同步阿里云的时钟服务器的时间。

```bash
sed -i "/^server/ d" /etc/ntp.conf
cat << EOF | sudo tee -a /etc/ntp.conf
server ntp1.aliyun.com
server ntp2.aliyun.com
server ntp3.aliyun.com
server ntp4.aliyun.com
EOF
sudo systemctl start ntpd
sudo systemctl enable ntpd
ntpdate -u ntp1.aliyun.com
```



### 4、查看状态

检测ntpd服务的端口情况，默认端口是123：

```bash
ss -tunlp|grep ntp
```

查看 ntp 服务器有无和上层 ntp 连通，使用 `ntpstat` 行查询

```bash
ntpstat
```

`ntpq -p`可以查看本地NTP需进行同步的公网 NTP 服务器状态。

```bash
ntpq -p 
```

>###### tpq -p 参数详解
>
>- remote ：本地主机所连接的上层NTP服务器，最左边的符号如下：
>   如果有[*] 代表目前正在使用当中的上层NTP服务器。
>   如果有[+] 代表也有连上上层NTP服务器，可以作为提高时间更新的候选NTP服务器
>   如果有[-] 代表同步的该NTP服务器被认为是不合格的NTP Server
>   如果有[x] 代表同步的外网NTP服务器不可用
>- refid  ：指的是给上层NTP服务器提供时间校对的服务器。
>- St:上层NTP服务器的级别 
>- When: 上一次与上层NTP服务器进行时间校对的时间（单位：s)
>- Poll :本地主机与上层NTP服务器进行时间校对的周期（单位：s）
>- reach：八进制数，表示最近8次时钟同步包接收情况（1表示接收成功，0表示接收失败。每接收一个包左移一位。对于一个运行较长时间的NTP client而言，这个值应该是377->11,111,111，即最近8次包接收均成功；否则表示有丢包情况发生）
>- delay：网络传输过程当中延迟的时间，单位为 10^(-6) 秒
>- offset：时间补偿的结果，单位为10^(-6) 秒
>- jitter：Linux 系统时间与 BIOS 硬件时间的差异时间， 单位为 10^(-6) 秒。

检查同步是否成功。查看与时间同步服务器的时间偏差，offset 偏差小，同步成功。

```bash
ntpdc -c loopinfo
```

### 5、配置自动同步

设置自动同步，同步频率：每十分钟同步一次。编辑 crontab：

```bash
# crontab -e 
*/10 * * * * /usr/sbin/ntpdate ntp1.aliyun.com && hwclock -w >> /tmp/crontab.log
```

### 6、系统时钟与硬件时钟之间同步

设置硬件时钟

```bash
# -w,--systohc
hwclock -w
```

设置系统时钟：

```bash
# -s, --hctosys
hwclock -s
```

## chrony

### 1、安装服务

```bash
yum erase -y ntp
yum install -y chrony
```

### 2、使用网络时钟服务器

这里使用网络时钟服务器，在每台服务器上修改配置：

```bash
sed -i -e '/^server/d' /etc/chrony.conf
echo "server ntp1.aliyun.com iburst" >> /etc/chrony.conf
egrep -v "^#|^$" /etc/chrony.conf 

```

启动服务，并设置开机启动：

```bash
systemctl start chronyd && systemctl enable chronyd
```

### 3、查看状态

查看端口：

```bash
ss -tulp | grep chronyd
```

查看同步状态，显示刚刚配置的ip 并且ip前面有，*星号即为成功 ，这个符号 ^ 为失败

```bash
chronyc sources
chronyc sources -v

chronyc sourcestats
```

跟踪时间同步过程：

```bash
chronyc tracking
```

## 其他

配置时区

```bash
# 配置时区
timedatectl set-timezone Asia/Shanghai
```

将硬件时钟调整为UTC时间，1为本地时钟：

```bash
# 将硬件时钟调整为UTC时间，1为本地时钟
timedatectl set-local-rtc 0
```

## 总结

### ntp 安装和设置完整脚本

```bash
#设置时钟同步
yum install -y ntp

sed -i "/^server/ d" /etc/ntp.conf

cat << EOF | sudo tee -a /etc/ntp.conf
server ntp1.aliyun.com
server ntp2.aliyun.com
server ntp3.aliyun.com
server ntp4.aliyun.com
EOF

systemctl start ntpd
systemctl enable ntpd

ntpdate -u ntp1.aliyun.com

hwclock --systohc
```

### chrony 安装和设置完整脚本

```bash
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
