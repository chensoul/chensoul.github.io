---
title: "通过k3sup安装k3s"
date: 2024-05-09
slug: install-k3s-using-k3sup
tags: [k3s]
categories: ["devops"]
---

k3sup是一个支持在PC、虚拟机、ARM设备上安装k3s的工具，官方网站：<https://k3sup.dev/>

## 安装k3sup

在线安装：

```bash
curl -sLS https://get.k3sup.dev | sh
sudo install k3sup /usr/local/bin/
```

离线安装，下载地址：<https://github.com/alexellis/k3sup/releases>

```bash
wget https://github.com/alexellis/k3sup/releases/download/0.13.5/k3sup
mv k3sup /usr/local/bin/
chmod +x /usr/local/bin/k3sup
```

查看版本：

```bash
$ k3sup version
 _    _____
| | _|___ / ___ _   _ _ __
| |/ / |_ \/ __| | | | '_ \
|   < ___) \__ \ |_| | |_) |
|_|\_\____/|___/\__,_| .__/
                     |_|

bootstrap K3s over SSH in < 60s 🚀
🚀 Speed up GitHub Actions/GitLab CI + reduce costs: https://actuated.dev

Version: 0.13.5
Git Commit: d952d6df22b06147806ca1030b8ba3a4bb9e0c0c
```



## 创建k3s集群

### 创建一个本地集群

```bash
k3sup install \
  --local \
  --context localk3s \
  --k3s-channel stable \
  --k3s-extra-args '--docker'
```

查看集群状态：

```bash
$ k3sup ready --context localk3s --kubeconfig ./kubeconfig
Checking cluster status: 1/25
All node(s) are ready
```

查看集群节点：

```bash
$ kubectl get nodes -o wide
NAME       STATUS   ROLES                       AGE    VERSION        INTERNAL-IP     EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION                CONTAINER-RUNTIME
doris-01   Ready    control-plane,etcd,master   127m   v1.29.4+k3s1   192.168.1.107   <none>        CentOS Linux 7 (Core)   3.10.0-1160.71.1.el7.x86_64   docker://25.0.4
```



### 创建一个远程服务的集群

连接远程节点，需要先配置 ssh

>
> 修改sshd配置：
>
> ```bash
> sed -i '/PasswordAuthentication/s/^/#/'  /etc/ssh/sshd_config
> sed -i 's/^[ ]*StrictHostKeyChecking.*/StrictHostKeyChecking no/g' /etc/ssh/ssh_config
> #禁用sshd服务的UseDNS、GSSAPIAuthentication两项特性
> sed -i -e 's/^#UseDNS.*$/UseDNS no/' /etc/ssh/sshd_config
> sed -i -e 's/^GSSAPIAuthentication.*$/GSSAPIAuthentication no/' /etc/ssh/sshd_config
> systemctl restart sshd
> ```
>
> 生成ssh私钥：
>
> ```bash
> [ ! -d ~/.ssh ] && ( mkdir ~/.ssh )
> [ ! -f ~/.ssh/id_rsa.pub ] && (yes|ssh-keygen -f ~/.ssh/id_rsa -t rsa -N "")
> ( chmod 600 ~/.ssh/id_rsa.pub ) && cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys
> ```
>
> 配置无密码登陆：192.168.1.107 是当前服务器的 IP
>
> ```bash
> ssh-copy-id 192.168.1.107 
> ```
>
> 如果ssh-agent没启动，则启动：
>
> ```bash
> eval `ssh-agent`
> ssh-add ~/.ssh/id_rsa
> ```
>

在 192.168.1.107 节点上创建集群：

```bash
export USER=root
export SERVER_IP=192.168.1.107

k3sup install \
  --ip $SERVER_IP \
  --user $USER \
  --k3s-extra-args '--docker'
```

查看集群状态：

```bash
$ k3sup ready --context default --kubeconfig ./kubeconfig

$ kubectl get nodes --kubeconfig ./kubeconfig
```



或者指定一个 context 并合并到默认的 KUBECONFIG 文件：

```bash
k3sup install \
  --ip $SERVER_IP \
  --user $USER \
  --k3s-extra-args '--docker'
  --context pik3s \
  --merge \
  --local-path $HOME/.kube/config
```

查看集群状态：

```bash
# $HOME/.kube/config is a default for kubeconfig
k3sup ready --context pik3s
```

### 使用嵌入式 etcd 创建一个 HA 集群

添加 `--cluster` 创建一个集群：

```bash
export USER=root
export SERVER_IP=192.168.1.107

k3sup install \
  --cluster \
  --ip $SERVER_IP \
  --user $USER \
  --k3s-extra-args '--docker'
```

添加另一个server 节点（192.168.1.109），先配置无密码登录：

> ```bash
> ssh-copy-id 192.168.1.109
> ```

然后，添加 `--server`： 

```bash
export USER=root
export SERVER_IP=192.168.1.107
export NEXT_SERVER_IP=192.168.1.109

k3sup join \
	--ip $NEXT_SERVER_IP \
	--user $USER \
	--server-ip $SERVER_IP \
	--server-user $USER \
	--server \
  --k3s-extra-args '--docker'
```

再查看节点状态：

```bash
$ k3sup ready --context default --kubeconfig ./kubeconfig

$ kubectl get nodes --kubeconfig ./kubeconfig
NAME       STATUS   ROLES                       AGE     VERSION
doris-01   Ready    control-plane,etcd,master   166m    v1.29.4+k3s1
doris-03   Ready    <none>                      2m18s   v1.29.4+k3s1
```



### 添加一个 Agent 节点到集群

添加一个节点（192.168.1.109）到集群，先配置无密码登录：

```bash
ssh-copy-id 192.168.1.109
```

然后

```bash
export USER=root
export SERVER_IP=192.168.1.107
export AGENT_IP=192.168.1.109

k3sup join \
	--ip $AGENT_IP \
	--user $USER \
	--server-ip $SERVER_IP \
	--server-user $USER \
  --k3s-extra-args '--docker'
```

## 卸载

```bash
/usr/local/bin/k3s-uninstall.sh
```

