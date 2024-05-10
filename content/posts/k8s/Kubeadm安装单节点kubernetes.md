---
title: "Kubeadm安装单节点kubernetes"
date: 2024-05-09T11:00:00+08:00
slug: install-k8s-using-kubeadmin
draft: true
tags: [k8s]
categories: ["k8s"]
---

本文使用Kubeadm来安装一个单节点的Kubernetes环境，以加深对Kubernetes各个组件和安装过程的理解。 

# 环境准备

请参考 [使用RKE安装单节点kubernetes](/2019/10/31/install-single-k8s-with-rke/) 一文中的环境准备章节。 

# 配置yum源

```bash
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
gpgkey=http://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg
  http://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
EOF
```



# 安装并配置IPVS

由于ipvs已经加入到了内核的主干，所以为kube-proxy开启ipvs的前提需要加载以下的内核模块：

```bash
cat > /etc/sysconfig/modules/ipvs.modules <<EOF
#!/bin/bash
modprobe -- ip_vs
modprobe -- ip_vs_rr
modprobe -- ip_vs_wrr
modprobe -- ip_vs_sh
modprobe -- nf_conntrack_ipv4
EOF
chmod 755 /etc/sysconfig/modules/ipvs.modules && bash \
 /etc/sysconfig/modules/ipvs.modules && lsmod | grep -e ip_vs -e nf_conntrack_ipv4
```

上面脚本创建了的/etc/sysconfig/modules/ipvs.modules文件，保证在节点重启后能自动加载所需模块。 使用lsmod | grep -e ip\_vs -e nf\_conntrack\_ipv4命令查看是否已经正确加载所需的内核模块。

```bash
# 检查加载的模块
lsmod | grep -e ipvs -e nf_conntrack_ipv4
# 或者
cut -f1 -d " "  /proc/modules | grep -e ip_vs -e nf_conntrack_ipv4
```

接下来还需要确保各个节点上已经安装了ipset软件包。 为了便于查看ipvs的代理规则，最好安装一下管理工具ipvsadm。

```bash
yum install ipset ipvsadm -y
```

如果以上前提条件如果不满足，则即使kube-proxy的配置开启了ipvs模式，也会退回到iptables模式。 

# 安装组件

```bash
yum -y install kubelet kubeadm kubectl kubernetes-cni
```

组件说明：

- kubeadm：用于初始化 Kubernetes 集群
- kubectl：Kubernetes 的命令行工具，主要作用是部署和管理应用，查看各种资源，创建，删除和更新组件
- kubelet：主要负责启动 Pod 和容器 

# 启动kubelet服务

    systemctl enable kubelet && systemctl start kubelet



# 生成配置文件

```bash
kubeadm config print init-defaults --kubeconfig ClusterConfiguration > kubeadm.yml
#修改镜像和kubernetes版本
sed -i 's/^imageRepository: k8s.gcr.io/imageRepository: registry.aliyuncs.com\/google_containers/g'\
	kubeadm.yml
sed -i -e "s|^kubernetesVersion.*|kubernetesVersion: v1.16.2}|g" kubeadm.yml
```

修改配置文件：

```yaml
apiVersion: kubeadm.k8s.io/v1beta2
bootstrapTokens:
- groups:
  - system:bootstrappers:kubeadm:default-node-token
  token: abcdef.0123456789abcdef
  ttl: 24h0m0s
  usages:
  - signing
  - authentication
kind: InitConfiguration
localAPIEndpoint:
  # 修改为主节点 IP
  advertiseAddress: 192.168.56.120
  bindPort: 6443
nodeRegistration:
  criSocket: /var/run/dockershim.sock
  name: k8s-node0
  taints:
  - effect: NoSchedule
    key: node-role.kubernetes.io/master
---
apiServer:
  timeoutForControlPlane: 4m0s
apiVersion: kubeadm.k8s.io/v1beta2
certificatesDir: /etc/kubernetes/pki
clusterName: kubernetes
controllerManager: {}
dns:
  type: CoreDNS
etcd:
  local:
    dataDir: /var/lib/etcd
# 国内不能访问 Google，修改为阿里云
imageRepository: registry.aliyuncs.com/google_containers
kind: ClusterConfiguration
kubernetesVersion: v1.16.2
networking:
  dnsDomain: cluster.local
  # 替换 Calico 网段为我们虚拟机不重叠的网段（这里用的是 Flannel 默认网段）
  podSubnet: "10.244.0.0/16"
  serviceSubnet: 10.96.0.0/12
scheduler: {}
---   #下面有增加的三行配置，用于设置Kubeproxy使用LVS
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: ipvs
```

> 注意：
> podSubnet 在集群模式下，不能和虚拟机网络重叠，所以这里使用Flannel默认的网段。单机模式，重叠没影响。
> ![](../assets/82e1005e7c02043cc10abeb13bd23e3c/006y8mN6gy1g8hqkzfo8aj30x30i776q.jpg)

修改配置文件，在文件末尾增加IPVS配置：

```yaml
---
# 开启 IPVS 模式
apiVersion: kubeadm.k8s.io/v1beta2
kind: KubeProxyConfiguration
featureGates:
  SupportIPVSProxyMode: true
mode: ipvs
```



# 查看和拉取镜像

通过生成的配置文件，提前下载镜像：

```bash
# 查看所需镜像列表
kubeadm config images list --config kubeadm.yml
# 拉取镜像
kubeadm config images pull --config kubeadm.yml
```



# 初始化master节点

你可以使用上面的配置文件初始化：

    kubeadm init --config kubeadm.yml

也可以通过命令行方式出似乎还，并指定镜像仓库，则可以不用提前拉取镜像了，也可以不使用kubeadm.yml配置文件（除非，需要定制化yml文件）

```bash
IPADDR=$(ifconfig eth1|grep inet|grep -v inet6|awk '{print $2}')
kubeadm init --apiserver-advertise-address $IPADDR \
	--apiserver-cert-extra-sans $IPADDR \
  --service-cidr 10.96.0.0/12 \
  --pod-network-cidr 10.244.0.0/16 \
  --kubernetes-version v1.16.2 \
  --image-repository registry.aliyuncs.com/google_containers --token-ttl 0
```

查看节点状态：

    kubectl get nodes
    NAME        STATUS     ROLES    AGE   VERSION
    k8s-kube-node1  NotReady   master   53s   v1.16.2

可以看到节点还没有Ready，dns的两个pod也没不正常，还需要安装网络配置。 

# 配置 kubectl

kubectl默认会在执行的用户家目录下面的.kube目录下寻找config文件。这里是将在初始化时\[kubeconfig]步骤生成的admin.conf拷贝到.kube/config。

```bash
mkdir -p $HOME/.kube
sudo cp -f /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```



# 使master node参与工作负载

使用kubeadm初始化的集群，出于安全考虑master node不参与工作负载，也就是说我们无法在master node上运行服务。 这里搭建的环境目前只有一个master node，可以使用下面的命令使master node参与工作负载。

```bash
kubectl taint nodes --all node-role.kubernetes.io/master-
```

这会从配置了 `node-role.kubernetes.io/master` 污染标志的节点，移除污染标志。 包括主节点，这表示scheduler可以在任何节点上安排运行pod。 

# 安装网络插件

安装calico插件

```bash
wget https://docs.projectcalico.org/v3.9/manifests/calico.yaml
sed -i '/CALICO_IPV4POOL_IPIP/{n;s/Always/off/g}' calico.yaml
#多网卡问题 interface=eth0 interface=eth.* first-found
sed -i '/name: IP/{s/name: IP/name: IP_AUTODETECTION_METHOD/}' calico.yaml
sed -i '/\"autodetect\"/{s/\"autodetect\"/\"interface=eth1\"/}' calico.yaml
kubectl apply -f calico.yaml
```

执行成功后，节点并不能马上变成Ready状态，稍等几分钟，就可以看到所有状态都正常了。

    watch kubectl get pods --all-namespaces
    Every 2.0s: kubectl get pods --all-namespaces      Wed Sep 11 19:52:24 2019
    NAMESPACE     NAME                                       READY   STATUS    RESTARTS   AGE
    kube-system   calico-kube-controllers-65b8787765-krgls   1/1     Running   0          5m7s
    kube-system   calico-node-7pf6h                          1/1     Running   0          5m7s
    kube-system   coredns-bccdc95cf-4gsw6                    1/1     Running   0          5m43s
    kube-system   coredns-bccdc95cf-9q6qv                    1/1     Running   0          5m43s
    kube-system   etcd-node1                                 1/1     Running   0          4m57s
    kube-system   kube-apiserver-node1                       1/1     Running   0          4m44s
    kube-system   kube-controller-manager-node1              1/1     Running   0          4m42s
    kube-system   kube-proxy-5fnkj                           1/1     Running   0          5m42s
    kube-system   kube-scheduler-node1                       1/1     Running   0          5m2s



# 验证是否成功



## 检查组件运行状态

```bash
[root@k8s-kube-node1 ~]# kubectl get cs
NAME                 STATUS    MESSAGE             ERROR
# 调度服务，主要作用是将 POD 调度到 Node
scheduler            Healthy   ok                  
# 自动化修复服务，主要作用是 Node 宕机后自动修复 Node 回到正常的工作状态
controller-manager   Healthy   ok                  
# 服务注册与发现
etcd-0               Healthy   {"health":"true"}
```



## 检查 Master 状态

    [root@k8s-kube-node1 ~]# kubectl cluster-info
    Kubernetes master is running at https://192.168.56.120:6443
    KubeDNS is running at https://192.168.56.120:6443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy
    To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.



## 检查 Nodes 状态

```bash
[root@k8s-kube-node1 ~]# kubectl get nodes
NAME    STATUS   ROLES    AGE   VERSION
k8s-kube-node1   Ready    master   13h   v1.16.2
```

查看节点详细信息：

```bash
[root@k8s-kube-node1 ~]# kubectl get nodes -o wide
NAME    STATUS   ROLES    AGE     VERSION   INTERNAL-IP      EXTERNAL-IP   OS-IMAGE                KERNEL-VERSION              CONTAINER-RUNTIME
k8s-kube-node1   Ready    master   3m23s   v1.16.2   192.168.56.120   <none>        CentOS Linux 7 (Core)   3.10.0-957.5.1.el7.x86_64   docker://1.13.1
```



## 测试DNS

```bash
kubectl run curl --image=radial/busyboxplus:curl -i --tty
```

进入后执行nslookup kubernetes.default确认解析正常。

```bash
[ root@curl-2421989462-vldmp:/ ]$ nslookup kubernetes.default
```

测试OK后，删除掉curl这个Pod。

```bash
kubectl delete deploy curl
```



# kube-proxy 开启 ipvs

如果在初始化时kubeadm.yml中没有配置ipvs，则可以修改ConfigMap的kube-system/kube-proxy中的config.conf，mode: “ipvs”

```bash
kubectl edit cm kube-proxy -n kube-system
```

查看kube-proxy pod：

```bash
[root@k8s-kube-node1 ~]#  kubectl get pods -n kube-system|grep proxy
kube-proxy-5fnkj                           1/1     Running   1          14h
```

对于Kubernetes来说，可以直接将这上面这些Pod删除之后，会自动重建。


批量删除 kube-proxy：

```bash
kubectl get pod -n kube-system | grep kube-proxy | awk\
	'{system("kubectl delete pod "$1" -n kube-system")}'
```

由于你已经通过ConfigMap修改了kube-proxy的配置，所以后期增加的Node节点，会直接使用ipvs模式。


再次查看：

```bash
[root@k8s-kube-node1 ~]#  kubectl get pods -n kube-system|grep proxy
kube-proxy-z7k4f                           1/1     Running   0          16s
```

查看日志：

```bash
kubectl logs kube-proxy-z7k4f -n kube-system
```

日志中打印出了Using ipvs Proxier，说明ipvs模式已经开启。


使用ipvsadm测试，可以查看之前创建的Service已经使用LVS创建了集群。

```bash
[root@k8s-kube-node1 ~]# ipvsadm -Ln
```



# 配置 Node 节点

将 node 节点加入到集群中很简单，只需要在 node 服务器上安装 kubeadm，kubectl，kubelet 三个工具，然后使用 `kubeadm join` 命令加入即可。


在master节点上配置从节点：

```bash
kubeadm join 192.168.56.120:6443 --token abcdef.0123456789abcdef \
    --discovery-token-ca-cert-hash \
    sha256:40405f03230b7c9b872110aaa28e222bed3dca3663c4e3b9dcdad572fbbf5be2
```

说明：

- token



  - 可以通过安装 master 时的日志查看 token 信息
  - 可以通过 `kubeadm token list`命令打印出 token 信息
  - 如果 token 过期，可以使用 `kubeadm token create --print-join-command` 命令**创建新的 token**
- discovery-token-ca-cert-hash



  - 可以通过安装 master 时的日志查看 sha256 信息
  - 可以通过 `openssl x509 -pubkey -in /etc/kubernetes/pki/ca.crt | openssl rsa -pubin -outform der 2>/dev/null | openssl dgst -sha256 -hex | sed 's/^.* //'` 命令查看 sha256 信息

添加参数忽略错误：

```bash
kubeadm join 192.168.56.120:6443 --token abcdef.0123456789abcdef \
    --discovery-token-ca-cert-hash \
    sha256:40405f03230b7c9b872110aaa28e222bed3dca3663c4e3b9dcdad572fbbf5be2\
    --ignore-preflight-errors=all
```



## 验证是否成功

回到 master 服务器，查看节点状态：

```bash
[root@k8s-kube-node1 ~]# kubectl get nodes
NAME    STATUS     ROLES    AGE   VERSION
k8s-kube-node1   NotReady   master   12m   v1.16.2
k8s-kube-node2   NotReady   <none>   12m   v1.16.2
```

> 如果 node 节点加入 master 时配置有问题可以在 node 节点上使用 kubeadm reset 重置配置再使用 kubeadm join 命令重新加入即可。希望在 master 节点删除 node ，可以使用 kubeadm delete nodes  删除。



## 查看 pod 状态

```bash
kubectl get pod -n kube-system
kubectl get pod -n kube-system -o wide
```



# 可选操作



## 从非主节点上管理集群

将主节点中的 /etc/kubernetes/admin.conf 文件拷贝到从节点相同目录下：

```bash
scp /etc/kubernetes/admin.conf k8s-kube-node1:/etc/kubernetes/
```

运行下面命令：

```bash
kubectl --kubeconfig /etc/kubernetes/admin.conf get nodes
```

或者，配置环境变量：

```bash
echo "export KUBECONFIG=/etc/kubernetes/admin.conf" >> ~/.bash_profile
source ~/.bash_profile
```

然后，可以执行下面命令：

```bash
[root@k8s-kube-node1 ~]# kubectl get nodes
NAME    STATUS     ROLES    AGE   VERSION
k8s-kube-node1   NotReady   master   12m   v1.16.2
k8s-kube-node2   NotReady   <none>   12m   v1.16.2
```



## 映射API服务到本地

如果你想从集群外部连接到API服务，可以使用工具`kubectl proxy。`


参考上面，先拷贝文件，配置环境变量，然后执行：

```bash
[root@k8s-kube-node1 ~]# kubectl proxy --address=192.168.56.120
Starting to serve on 192.168.56.120:8001
```

你现在就可以在本地这样 <http://192.168.56.120:8001/api/v1> 访问到API服务了。 

# 重置集群

```bash
kubeadm reset -y
rm -rf /var/lib/etcd
kubectl drain k8s-kube-node1 --delete-local-data --force --ignore-daemonsets
kubectl delete node k8s-kube-node2 k8s-kube-node1
ifconfig tunl0 down
ip link delete tunl0
```



# 总结

以上是使用RKE安装单节点k8s的记录，其实稍加修改配置文件，就可以安装集群。


这里，我把上面的所有命令整理了一下，提交到了 [github](https://github.com/javachen/vagrant/tree/master/k8s-kube-single)，供大家参考。 

# 参考文章

- [Install Docker on CentOS](https://docs.docker.com/engine/installation/linux/centos/)
- [Installing Kubernetes on Linux with kubeadm](https://kubernetes.io/docs/getting-started-guides/kubeadm/)
- [kubeadm reference](https://kubernetes.io/docs/admin/kubeadm/)
- [Installing Addons](https://kubernetes.io/docs/admin/addons/)
