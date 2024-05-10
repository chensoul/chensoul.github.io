---
title: "RKE安装单节点kubernetes"
date: 2024-05-09T11:00:00+08:00
slug: install-k8s-using-rke
draft: true
tags: [k8s]
categories: ["k8s"]
---

Kubernetes 是Google的一种基于容器的开源服务编排解决方案。在我们进行Kubernetes的学习前，为了对Kubernetes的工作原理有一个大概的认识，我们需要先安装一个单节点的实例服务，用于平常的开发与测试。由于本地环境内存有限，所以只能在虚拟机里面使用单节点安装。 

# 环境准备



## 创建虚拟机

使用Vagrant创建一个虚拟机，关于Vagrant的使用，本文不做说明。


创建一个k8s-rke-single目录，编写Vagrantfile内容如下：

```ruby
# -*- mode: ruby -*-
# vi: set ft=ruby :
Vagrant.configure("2") do |config|
  config.vm.box = "centos7"
  config.vm.box_check_update = false
  (1..1).each do |i|
    config.vm.define vm_name="k8s-rke-node00#{i}" do |node|
      node.vm.provider "virtualbox" do |v|
        v.customize ["modifyvm", :id, "--name", vm_name, "--memory", "4096",'--cpus', 2]
        v.gui = false
      end
      ip = "192.168.56.11#{i}"
      node.vm.network "private_network", ip: ip
      node.vm.hostname = vm_name
      #node.vm.provision :shell, :path => "setup_system.sh", args: [ip,vm_name]
      #node.vm.provision :shell, :path => "setup_k8s.sh"
      #node.vm.provision :shell, :path => "setup_rancher.sh"
      #node.vm.provision :shell, :path => "setup_ceph.sh"
      #node.vm.provision "shell", privileged: false, path: "post_setup_k8s.sh"
    end
  end
end
```

注意：

- 我使用的是centos7操作系统，centos7是Vagrant的box名称，可以替换成其他的。
- 这里是创建一个虚拟机，虚拟机名称为k8s-rke-node001，内存分配4G，CPU安装k8s要求的至少为2。
- 使用私有网络，固定IP为192.168.56.111。注意：在虚拟机创建之后，该IP会绑定的eth1网卡，eth0网卡绑定是Vagrant创建NAT网络。 

## 设置虚拟机



### 设置root密码

```bash
echo 'root'|passwd root --stdin >/dev/null 2>&1
```



### 设置hosts

```bash
cat > /etc/hosts <<EOF
192.168.56.111 k8s-rke-node001
EOF
```



### 设置hostname

```bash
hostnamectl set-hostname k8s-rke-node001
cat > /etc/sysconfig/network<<EOF
HOSTNAME=$(hostname)
EOF
```



### 关闭selinux

```bash
setenforce 0  >/dev/null 2>&1
sed -i -e 's/^SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
sed -i -e 's/^SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
```



### 关闭防火墙

```bash
systemctl stop firewalld.service && systemctl disable firewalld.service
yum -y install iptables-services  && systemctl start iptables  \
	&&  systemctl enable iptables&& iptables -F && service iptables save
```



### 配置时区

```bash
ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
timedatectl set-timezone Asia/Shanghai
timedatectl set-local-rtc 0
systemctl restart crond
```



### 禁用邮件服务

```bash
systemctl stop postfix && systemctl disable postfix
```



### 优化设置 journal 日志相关

优化设置 journal 日志相关，避免日志重复搜集，浪费系统资源

```bash
sed -ri 's/^\$ModLoad imjournal/#&/' /etc/rsyslog.conf
sed -ri 's/^\$IMJournalStateFile/#&/' /etc/rsyslog.conf
sed -ri 's/^#(DefaultLimitCORE)=/\1=100000/' /etc/systemd/system.conf
sed -ri 's/^#(DefaultLimitNOFILE)=/\1=100000/' /etc/systemd/system.conf
systemctl restart systemd-journald
systemctl restart rsyslog
```



### 配置系统语言

```bash
sudo echo 'LANG="en_US.UTF-8"' >> /etc/profile && source /etc/profile
```



### 禁用fastestmirror插件

```bash
sed -i 's/^enabled.*/enabled=0/g' /etc/yum/pluginconf.d/fastestmirror.conf
sed -i 's/^plugins.*/plugins=0/g' /etc/yum.conf
```



### 安装常用软件

```bash
yum install -y curl
mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repo.backup
curl -s -o /etc/yum.repos.d/CentOS-Base.repo http://mirrors.aliyun.com/repo/Centos-7.repo
sed -i -e '/aliyuncs/d' /etc/yum.repos.d/CentOS-Base.repo
curl -k -s -o /etc/yum.repos.d/epel.repo http://mirrors.aliyun.com/repo/epel-7.repo
yum install -y wget vim ntp yum-utils git expect
```



### 设置时钟同步

```bash
sed -i "/^server/ d" /etc/ntp.conf
echo "
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
#允许指定的时间服务器查询本时间服务器的信息
restrict ntp1.aliyun.com nomodify notrap nopeer noquery
#其它认证信息
includefile /etc/ntp/crypto/pw
keys /etc/ntp/keys
" > /etc/ntp.conf
systemctl start ntpd
systemctl enable ntpd
echo '* */6 * * * /usr/sbin/ntpdate -u ntp1.aliyun.com&&/sbin/hwclock --systohc > /dev/null 2>&1' \
	>>/var/spool/cron/root
```



### 设置命名服务

```bash
echo "nameserver 114.114.114.114" | tee -a /etc/resolv.conf
```



### 加载内核模块

```bash
lsmod | grep br_netfilter
modprobe br_netfilter
```



### 关闭NOZEROCONF

```bash
sed -i 's/^NOZEROCONF.*/NOZEROCONF=yes/g' /etc/sysconfig/network
```

更改系统网络接口配置文件，设置该网络接口随系统启动而开启

```bash
sed -i -e '/^HWADDR=/d' -e '/^UUID=/d' /etc/sysconfig/network-scripts/ifcfg-eth0
sed -i -e 's/^ONBOOT.*$/ONBOOT=yes/' /etc/sysconfig/network-scripts/ifcfg-eth0
sed -i -e 's/^NM_CONTROLLED.*$/NM_CONTROLLED=no/' /etc/sysconfig/network-scripts/ifcfg-eth0
```



### 设置内核参数

```bash
cat > kubernetes.conf <<EOF
net.ipv6.conf.all.disable_ipv6=1
net.ipv6.conf.default.disable_ipv6=1
net.ipv6.conf.lo.disable_ipv6=1
#ip转发
net.ipv4.ip_nonlocal_bind = 1
net.ipv4.ip_forward = 1
# 开启重用。允许将TIME-WAIT sockets重新用于新的TCP连接，默认为0，表示关闭；
net.ipv4.tcp_tw_reuse = 1
#开启TCP连接中TIME-WAIT sockets的快速回收，默认为0，表示关闭
net.ipv4.tcp_tw_recycle=0
net.ipv4.neigh.default.gc_thresh1=4096
net.ipv4.neigh.default.gc_thresh2=6144
net.ipv4.neigh.default.gc_thresh3=8192
net.ipv4.neigh.default.gc_interval=60
net.ipv4.neigh.default.gc_stale_time=120
#配置网桥的流量
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.netfilter.nf_conntrack_max=2310720
vm.swappiness=0
vm.overcommit_memory=1
vm.panic_on_oom=0
fs.inotify.max_user_instances=8192
fs.inotify.max_user_watches=1048576
fs.file-max=52706963
fs.nr_open=52706963
EOF
cp kubernetes.conf /etc/sysctl.d/kubernetes.conf
sysctl -p /etc/sysctl.d/kubernetes.conf
```

如果kube-proxy使用ipvs的话为了防止timeout需要设置下tcp参数：

```bash
# https://github.com/moby/moby/issues/31208 
# ipvsadm -l --timout
# 修复ipvs模式下长连接timeout问题 小于900即可
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 10
```

docker官方的内核检查脚本建议`(RHEL7/CentOS7: User namespaces disabled; add 'user_namespace.enable=1' to boot command line)`,使用下面命令开启

```bash
grubby --args="user_namespace.enable=1" --update-kernel="$(grubby --default-kernel)"
```



### 设置文件最大打开数

```bash
cat>/etc/security/limits.d/kubernetes.conf<<EOF
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



### 关闭交换空间

```bash
swapoff -a && sed -i '/swap/s/^/#/' /etc/fstab
sed -i '/ \/ .* defaults /s/defaults/defaults,noatime,nodiratime,nobarrier/g' /etc/fstab
sed -i 's/tmpfs.*/tmpfs\t\t\t\/dev\/shm\t\ttmpfs\tdefaults,nosuid,noexec,nodev 0 0/g' /etc/fstab
```



### 解决透明大页面问题

```bash
echo "echo never > /sys/kernel/mm/redhat_transparent_hugepage/defrag" >/etc/rc.local
echo "echo never > /sys/kernel/mm/redhat_transparent_hugepage/enabled" >/etc/rc.local
```



### 设置sudo

关闭远程sudo执行命令需要输入密码和没有终端不让执行命令问题

```bash
sed -i 's/Defaults *requiretty/#Defaults requiretty/g' /etc/sudoers
sed -i 's/Defaults *!visiblepw/Defaults   visiblepw/g' /etc/sudoers
```



### 设置ssh

```bash
sed -i '/PasswordAuthentication/s/^/#/'  /etc/ssh/sshd_config
sed -i 's/^[ ]*StrictHostKeyChecking.*/StrictHostKeyChecking no/g' /etc/ssh/ssh_config
#禁用sshd服务的UseDNS、GSSAPIAuthentication两项特性
sed -i -e 's/^#UseDNS.*$/UseDNS no/' /etc/ssh/sshd_config
sed -i -e 's/^GSSAPIAuthentication.*$/GSSAPIAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd
```



### 生成ssh私钥和公钥

```bash
[ ! -d ~/.ssh ] && ( mkdir ~/.ssh )
[ ! -f ~/.ssh/id_rsa.pub ] && (yes|ssh-keygen -f ~/.ssh/id_rsa -t rsa -N "")
( chmod 600 ~/.ssh/id_rsa.pub ) && cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
```



### 关闭NUMA

```bash
sed -i 's/rhgb quiet/rhgb quiet numa=off/g' /etc/default/grub
grub2-mkconfig -o /boot/grub2/grub
```



### 升级内核到4.44

```bash
sudo rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-4.el7.elrepo.noarch.rpm
sudo yum --enablerepo=elrepo-kernel install -y kernel-lt kernel-lt-devel 
sudo awk -F\' '$1=="menuentry " {print i++ " : " $2}' /etc/grub2.cfg
sudo grub2-set-default 0
sudo sed -i 's/GRUB_DEFAULT=saved/GRUB_DEFAULT=0/g' /etc/default/grub
sudo grub2-mkconfig -o /boot/grub2/grub.cfg
reboot
#重启后，删除3.10内核
#sudo rpm -qa | grep kernel
#sudo yum remove kernel*-3.10*
#sudo yum --enablerepo=elrepo-kernel install -y kernel-lt-headers
```



# 安装docker

请参考相关文章。 

# 安装k8s

## 下载RKE

rke当前发布列表 <https://github.com/rancher/rke/releases> ，这里下载最新的

```bash
curl -s -L -o /usr/local/bin/rke \
	https://github.com/rancher/rke/releases/latest/download/rke_linux-amd64
sudo chmod 777 /usr/local/bin/rke
```



## 配置yum源

```bash
cat <<EOF > kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
  http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
sudo mv kubernetes.repo /etc/yum.repos.d/
sudo yum install kubectl -y
```



## 创建非root用户

实际生产环境不允许用root用户操作，故创建一个普通用户chenzj

```bash
USER=chenzj
useradd -G docker $USER
echo $USER|passwd $USER --stdin >/dev/null 2>&1
echo "$USER ALL=(ALL) ALL" >> /etc/sudoers
chown $USER:docker /var/run/docker.sock
```



## 配置无密码登陆

```bash
sudo -u $USER ssh-keygen -f /home/$USER/.ssh/id_rsa -t rsa -N ""
sudo -u $USER ./ssh_nopassword.expect $(hostname) $USER $USER
```

这里用到了一个脚本ssh\_nopassword.expect：

```bash
#! /usr/bin/expect -f
set host [lindex $argv 0]
set user [lindex $argv 1]
set password [lindex $argv 2]
spawn ssh-copy-id -i /home/$user/.ssh/id_rsa.pub $user@$host
expect {
yes/no  {send "yes\r";exp_continue}
-nocase "password:" {send "$password\r"}
}
expect eof
```



## k8s docker镜像



### GCR Proxy Cache

[Azure 中国]() 提供了 `gcr.io` 及`k8s.gcr.io`容器仓库的镜像代理服务。GCR Proxy Cache服务器相当于一台GCR镜像服务器，国内用户可以经由该服务器从[gcr.io](http://gcr.io/)下载镜像。

    docker pull gcr.azk8s.cn/google_containers/pause-amd64:3.0

另外，[Azure开源镜像站点](http://mirror.azure.cn/)提供了很多镜像服务，运营主体是Azure中国。 

### gcr.io/google-containers

使用[中科大的镜像](https://github.com/ustclug/mirrorrequest/issues/187)

    docker pull image gcr.io/google-containers/xxx:yyy
    或
    docker pull image gcr.io/google_containers/xxx:yyy
    =>
    docker pull image gcr.mirrors.ustc.edu.cn/google-containers/xxx:yyy

也可以使用[anjia0532的搬运仓库](https://github.com/anjia0532/gcr.io_mirror) 

### k8s.gcr.io

k8s.gcr.io等价于gcr.io/google-containers，因此同上可以使用中科大镜像或者anjia0532的搬运仓库。


使用[中科大的镜像](https://github.com/ustclug/mirrorrequest/issues/187)

    docker pull image k8s.gcr.io/xxx:yyy
    =>
    docker pull image gcr.mirrors.ustc.edu.cn/google-containers/xxx:yyy

使用[anjia0532的搬运仓库](https://github.com/anjia0532/gcr.io_mirror) 

### quay.io

使用[中科大的镜像](https://github.com/ustclug/mirrorrequest/issues/135)

    docker pull image quay.io/xxx/yyy:zzz
    =>
    docker pull image quay.mirrors.ustc.edu.cn/xxx/yyy:zzz



## 创建RKE配置文件

RKE使用群集配置文件，称为cluster.yml确定群集中的节点以及如何部署Kubernetes。有许多配置选项，可以在设置cluster.yml。


有两种简单的方法可以创建`cluster.yml`：

- 使用最小值[ cluster.yml](https://rancher.com/docs/rke/latest/en/example-yamls/#minimal-cluster-yml-example) 并根据实际情况进行编辑。
- 使用`rke config`来查询所需的所有信息。

查看RKE支持的K8S版本：

```bash
rke config --system-images --all |grep version
```

可以查看某一个k8s版本依赖的系统镜像，然后手动下载：

```bash
$ rke config --system-images --version v1.17.4-rancher1-2
rancher/coreos-etcd:v3.4.3-rancher1
rancher/rke-tools:v0.1.56
rancher/k8s-dns-kube-dns:1.15.0
rancher/k8s-dns-dnsmasq-nanny:1.15.0
rancher/k8s-dns-sidecar:1.15.0
rancher/cluster-proportional-autoscaler:1.7.1
rancher/coredns-coredns:1.6.5
rancher/hyperkube:v1.17.4-rancher1
rancher/coreos-flannel:v0.11.0-rancher1
rancher/flannel-cni:v0.3.0-rancher5
rancher/calico-node:v3.13.0
rancher/calico-cni:v3.13.0
rancher/calico-kube-controllers:v3.13.0
rancher/calico-ctl:v2.0.0
rancher/calico-pod2daemon-flexvol:v3.13.0
rancher/coreos-flannel:v0.11.0
weaveworks/weave-kube:2.5.2
weaveworks/weave-npc:2.5.2
rancher/pause:3.1
rancher/nginx-ingress-controller:nginx-0.25.1-rancher1
rancher/nginx-ingress-controller-defaultbackend:1.5-rancher1
rancher/metrics-server:v0.3.6
```

获取最新的支持的kubernetes版本：

```bash
kubernetes_version=`rke config --system-images --all|grep rancher/hyperkube|awk -F ':' '{print $2}'|sort -n|tail -n 1`
```

切换到普通用户chenzj，创建RKE配置文件cluster.yml

```bash
su - $USER
mkdir -p install/k8s && cd install/k8s
cat > cluster.yml <<EOF
nodes:
  - address: 192.168.56.111
    user: $USER
    role: [controlplane,etcd,worker]
services:
  etcd:
    extra_args:
      auto-compaction-retention: 240 #(单位小时)
      # 修改空间配额为$((6*1024*1024*1024))，默认2G,最大8G
      quota-backend-bytes: "6442450944"
    backup_config:
      enabled: true
      interval_hours: 12
      retention: 6
  kube-api:
    service_cluster_ip_range: 10.43.0.0/16
    service_node_port_range: 30000-32767
    pod_security_policy: false
    always_pull_images: false
  kube-controller:
    extra_args:
      ## 当节点通信失败后，再等一段时间kubernetes判定节点为notready状态。
      ## 这个时间段必须是kubelet的nodeStatusUpdateFrequency(默认10s)的整数倍，
      ## 其中N表示允许kubelet同步节点状态的重试次数，默认40s。
      node-monitor-grace-period: "20s"
      ## 再持续通信失败一段时间后，kubernetes判定节点为unhealthy状态，默认1m0s。
      node-startup-grace-period: "30s"
      ## 再持续失联一段时间，kubernetes开始迁移失联节点的Pod，默认5m0s。
      pod-eviction-timeout: "1m"
    cluster_cidr: 10.42.0.0/16
    service_cluster_ip_range: 10.43.0.0/16
  kubelet:
    extra_args:
      serialize-image-pulls: "false"
      registry-burst: "10"
      registry-qps: "0"
      # # 节点资源预留
      # enforce-node-allocatable: 'pods'
      # system-reserved: 'cpu=0.5,memory=500Mi'
      # kube-reserved: 'cpu=0.5,memory=1500Mi'
      # # POD驱逐，这个参数只支持内存和磁盘。
      # ## 硬驱逐伐值
      # ### 当节点上的可用资源降至保留值以下时，就会触发强制驱逐。强制驱逐会强制kill掉POD，不会等POD自动退出。
      # eviction-hard: 'memory.available<300Mi,nodefs.available<10%,imagefs.available<15%,nodefs.inodesFree<5%'
      # ## 软驱逐伐值
      # ### 以下四个参数配套使用，当节点上的可用资源少于这个值时但大于硬驱逐伐值时候，会等待eviction-soft-grace-period设置的时长；
      # ### 等待中每10s检查一次，当最后一次检查还触发了软驱逐伐值就会开始驱逐，驱逐不会直接Kill POD，先发送停止信号给POD，然后等待eviction-max-pod-grace-period设置的时长；
      # ### 在eviction-max-pod-grace-period时长之后，如果POD还未退出则发送强制kill POD"
      # eviction-soft: 'memory.available<500Mi,nodefs.available<50%,imagefs.available<50%,nodefs.inodesFree<10%'
      # eviction-soft-grace-period: 'memory.available=1m30s'
      # eviction-max-pod-grace-period: '30'
      # eviction-pressure-transition-period: '30s'
    cluster_domain: cluster.local
    infra_container_image: ""
    cluster_dns_server: 10.43.0.10
    fail_swap_on: false
  kubeproxy:
    extra_args:
      # 默认使用iptables进行数据转发
      proxy-mode: "ipvs"
network:
  plugin: calico
    
cluster_name: k8s-test
kubernetes_version: "${kubernetes_version}"
# 国内使用阿里云的镜像
private_registries:
  - url: registry.cn-shanghai.aliyuncs.com
    user:
    password:
    is_default: true
    
EOF
```

大部分的配置都注释说明了，基本上需要用到的配置就这些了，更详细的配置需要查阅官方文档。文档链接：


[https://docs.rancher.cn/rke/example-yamls.html]() 

## 创建集群

在创建集群

```bash
rke up --config cluster.yml
```

在安装过程中，RKE会自动生成一个kube\_config\_cluster.yml与RKE二进制文件位于同一目录中的配置文件。此文件很重要，它可以在Rancher Server故障时，利用kubectl通过此配置文件管理Kubernetes集群。复制此文件将其备份到安全位置。 

## 安装证书

使用自动生成的证书：

    rke cert rotate



## 与Kubernetes集群的交互

为了开始与Kubernetes集群进行交互，需要在本地计算机上安装kubectl。

```bash
# sudo 没权限，手动创建
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg 
  http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
yum install kubectl -y
```

RKE会在配置文件所在的目录下部署一个本地文件，该文件中包含kube配置信息以连接到新生成的群集。默认情况下，kube配置文件被称为kube\_config\_cluster.yml。将这个文件复制到你的本地~/.kube/config，就可以在本地使用kubectl了。

```bash
mkdir ~/.kube/
cp kube_config_cluster.yml ~/.kube/config
```

需要注意的是，部署的本地kube配置名称是和集群配置文件相关的。例如，如果您使用名为mycluster.yml的配置文件，则本地kube配置将被命名为.kube\_config\_mycluster.yml。 

## 查看集群状态

查看集群上下文：

```bash
$ kubectl config get-contexts
CURRENT   NAME               CLUSTER         AUTHINFO            NAMESPACE
*         k8s-test  			 k8s-test  		 kube-admin-k8s-test
```

查看集群配置视图：

```bash
$ kubectl config view
apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: DATA+OMITTED
    server: https://192.168.56.111:6443
  name: k8s-test
contexts:
- context:
    cluster: k8s-test
    user: kube-admin-k8s-test
  name: k8s-test
current-context: k8s-test
kind: Config
preferences: {}
users:
- name: kube-admin-k8s-test
  user:
    client-certificate-data: REDACTED
    client-key-data: REDACTED
```

查看集群信息：

```bash
$ kubectl cluster-info
Kubernetes master is running at https://192.168.56.111:6443
CoreDNS is running at https://192.168.56.111:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

查看节点信息：

```bash
kubectl get nodes
kubectl get all  -A
kubectl get pods -A
```

测试集群DNS是否可用：

```bash
kubectl run curl --image=radial/busyboxplus:curl -it
```

进入后执行`nslookup kubernetes.default`确认解析正常:

```bash
nslookup kubernetes.default
```



## 设置Bash自动完成

```bash
sudo yum install -y bash-completion 
echo "Configure Kubectl to autocomplete"
source /usr/share/bash-completion/bash_completion
source <(kubectl completion bash) #
echo 'source <(kubectl completion bash)' >> ~/.bashrc
```



# 集群调优

参考 <https://www.rancher.cn/docs/rancher/v2.x/cn/install-prepare/best-practices/> 

# 删除集群

```bash
rke remove
# 删除每个节点所有容器
docker rm -f `docker ps -qa`
# 删除每个节点所有容器卷
docker volume rm `docker volume ls -q`
#cmd.sh 'docker volume rm `docker volume ls -q`'
# 卸载每个节点mount目录
for mount in $(sudo mount | grep tmpfs | grep '/var/lib/kubelet' | awk '{ print $3 }') ; do 
sudo umount $mount; 
done
 
# 删除残留路径
sudo rm -rf ~/.kube/ /etc/cni \
  /opt/cni \
  /run/secrets/kubernetes.io \
  /run/calico \
  /run/flannel \
  /var/lib/calico \
  /var/lib/cni \
  /var/lib/kubelet \
  /var/log/containers \
  /var/log/pods \
  /var/run/calico
# 清理网络接口
network_interface=`ls /sys/class/net`
for net_inter in $network_interface;
do
	if ! echo $net_inter | grep -qiE 'lo|docker0|eth*|ens*';then
		sudo ip link delete $net_inter
	fi
done
# 清理残留进程
port_list='80 443 6443 2376 2379 2380 8472 9099 10250 10254'
for port in $port_list
do
pid=`netstat -atlnup|grep $port|awk '{print $7}'|awk -F '/' '{print $1}'|grep -v -|sort -rnk2|uniq`
	if [[ -n $pid ]];then
		sudo kill -9 $pid
	fi
done
pro_pid=`ps -ef |grep -v grep |grep kube|awk '{print $2}'`
if [[ -n $pro_pid ]];then
	sudo kill -9 $pro_pid
fi
# 清理Iptables表
## 注意：如果节点Iptables有特殊配置，以下命令请谨慎操作
sudo iptables --flush
sudo iptables --flush --table nat
sudo iptables --flush --table filter
sudo iptables --table nat --delete-chain
sudo iptables --table filter --delete-chain
systemctl restart docker
```

另外，清理docker镜像：

```bash
#删除虚悬镜像
docker image prune --force
#删除Rancher中指定版本的镜像
docker rmi $(docker images |grep -E 'hello-world|minio|wordpress|postgresq|tomcat|maven' | awk '{ print $3}')
```

删除自动创建的pvc的rbd块：

```bash
rbd list k8s
#rbd rm k8s/kubernetes-dynamic-pvc-2bca2c25-549d-4512-846d-167052bfed75
```



# 升级K8S

升级RKE：

```bash
curl -s -L -o /usr/local/bin/rke \
	https://github.com/rancher/rke/releases/latest/download/rke_linux-amd64
sudo chmod 777 /usr/local/bin/rke
```

查看RKE支持的K8S版本：

```bash
rke config --system-images --all |grep version
```

获取最新的支持的kubernetes版本：

```bash
kubernetes_version=`rke config --system-images --all|grep rancher/hyperkube|awk -F ':' '{print $2}'|sort -n|tail -n 1`
```

然后修改 cluster.yml 中 kubernetes版本

```yaml
cluster_name: k8s-test
kubernetes_version: "v1.17.5-rancher1-1"
network:
    plugin: calico
```

执行下面命令：

```bash
rke up --config cluster.yml
```



# 总结

以上是使用RKE安装单节点k8s的记录，其实稍加修改配置文件，就可以安装集群。


这里，我把上面的所有命令整理了一下，提交到了 [github](https://github.com/javachen/vagrantfiles/tree/master/k8s-rke-single)，供大家参考。 

# 参考文章

- [应大多数人要求写下kubeadm的基础使用](https://zhangguanzhang.github.io/2019/11/24/kubeadm-base-use/)
