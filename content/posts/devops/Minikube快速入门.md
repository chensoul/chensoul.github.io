---
title: "Minikube快速入门"
date: 2024-07-10T13:00:00+08:00
slug: minikube-quick-start
tags: ["minikube"]
categories: ["devops"]
---

## 安装

macos 系统使用 brew 安装

```bash
brew install minikube
```

## 启动集群

查看当前集群列表

```bash
$ minikube profile list
|----------|-----------|---------|--------------|------|---------|---------|-------|----------------|--------------------|
| Profile  | VM Driver | Runtime |      IP      | Port | Version | Status  | Nodes | Active Profile | Active Kubecontext |
|----------|-----------|---------|--------------|------|---------|---------|-------|----------------|--------------------|
| minikube | docker    | docker  | 192.168.49.2 | 8443 | v1.30.0 | Unknown |     1 | *              | *                  |
|----------|-----------|---------|--------------|------|---------|---------|-------|----------------|--------------------|
```

创建一个集群

```bash
# 启动一个名称为 minikube 集群，命名空间为 default
minikube start
```

>默认情况下，`minikube start `创建一个名为“minikube”的集群。如果您想创建不同的集群或更改其名称，可以使用`--profile`(或`-p`) 标志：
>
>```bash
>minikube start -p test
>```
>
>如果只想使用 docker 而不使用 k8s：
>
>```bash
>minikube start --container-runtime=docker --no-kubernetes
>```
>
>指定资源：
>
>```bash
>minikube start --cpus 4 --memory 8G
>```
>
>也可以调整资源：
>
>```bash
>minikube config set cpus 2
>minikube config set memory 2G
>```

k8s 集群创建成功之后，可以通过 kubectl 查看上下文：

```bash
$ kubectl config get-contexts
CURRENT   NAME       CLUSTER    AUTHINFO   NAMESPACE
*         minikube   minikube   minikube   default
```

> minikube 内置了 kubectl 工具，可以使用下面命令
>
> ```bash
> minikube kubectl --
> ```
>
> 也可以在 shell 中为上面命令设置一个别名：
> ```bash
> alias kubectl="minikube kubectl --"
> ```

查询 docker 容器：

```bash
$ docker ps
CONTAINER ID   IMAGE                                 COMMAND                  CREATED          STATUS                 PORTS         NAMES
f30717c5cfc7   gcr.io/k8s-minikube/kicbase:v0.0.44   "/usr/local/bin/entr…"   11 minutes ago   Up 11 minutes          127.0.0.1:32782->22/tcp, 127.0.0.1:32781->2376/tcp, 127.0.0.1:32780->5000/tcp, 127.0.0.1:32779->8443/tcp, 127.0.0.1:32778->32443/tcp   minikube
```

登录 minikube 容器：

```bash
$ minikube ssh

docker@minikube:~$
```

查询 pod

```bash
kubectl get po -A
```

启动 dashboard

```bash
$ minikube dashboard --url

# 或者
$ minikube dashboard
🔌  Enabling dashboard ...
    ▪ Using image docker.io/kubernetesui/dashboard:v2.7.0
    ▪ Using image docker.io/kubernetesui/metrics-scraper:v1.0.8
💡  Some dashboard features require the metrics-server addon. To enable all features please run:

	minikube addons enable metrics-server

🤔  Verifying dashboard health ...
🚀  Launching proxy ...
🤔  Verifying proxy health ...
🎉  Opening http://127.0.0.1:61663/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/ in your default browser...
```

稍等片刻，会打开浏览器访问 http://127.0.0.1:61663/api/v1/namespaces/kubernetes-dashboard/services/http:kubernetes-dashboard:/proxy/#/workloads?namespace=default

查询 IP：

```bash
$ minikube ip
192.168.49.2
```

在 macos 系统是无法 ping 该 IP 的：

```bash
$ ping 192.168.49.2
PING 192.168.49.2 (192.168.49.2): 56 data bytes
Request timeout for icmp_seq 0
Request timeout for icmp_seq 1
```

默认使用的是docker driver，但是Mac docker desktop不会创建docker0网桥，所以无法ping通minikube node ip。可以使用vm的方式启动minikube。更多说明，可以参考：

- https://github.com/kubernetes/minikube/issues/11193
- https://stackoverflow.com/questions/63600378/cant-access-minikube-service-using-nodeport-from-host-on-mac
- https://docs.docker.com/desktop/mac/networking/#known-limitations-use-cases-and-workarounds



查看集群状态

```bash
$ minikube status
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

升级集群

```bash
minikube start --kubernetes-version=latest
```

停止本地集群：

```shell
minikube stop
```

暂停集群

```bash
minikube unpause
```

删除本地集群：

```shell
minikube delete
```

删除所有本地集群和配置文件

```shell
minikube delete --all
```

## 部署应用

### 创建 Deployment

使用 `kubectl create` 命令创建管理 Pod 的 Deployment。该 Pod 根据提供的 Docker 镜像运行容器。

```bash
kubectl create deployment web --image=gcr.io/google-samples/hello-app:1.0
```

查看 Deployment：

```bash
$ kubectl get deployment web
NAME   READY   UP-TO-DATE   AVAILABLE   AGE
web    1/1     1            1           14s
```

该 Pod 可能需要一些时间才能变得可用。如果你在输出结果中看到 “0/1”，请在几秒钟后重试。

在 Kubernetes 内运行的 [Pod](https://kubernetes.io/docs/concepts/workloads/pods/) 运行在一个私有的、隔离的网络上。 默认这些 Pod 可以从同一 Kubernetes 集群内的其他 Pod 和服务看到，但超出这个网络后则看不到。 当我们使用 `kubectl` 时，我们通过 API 端点交互与应用进行通信。

`kubectl proxy` 命令可以创建一个代理，将通信转发到集群范围的私有网络。 

```bash
kubectl proxy
```

你可以看到通过代理端点托管的所有 API。 例如，我们可以使用以下 `curl` 命令直接通过 API 查询版本：

```
curl http://localhost:8001/version
```

API 服务器将基于也能通过代理访问的 Pod 名称为每个 Pod 自动创建端点。

获取 Pod 名称：

```bash
kubectl get pods -o go-template --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}'
```

输出结果如下：

```bash
web-56bb54ff6d-stk75
```

你可以运行以下命令通过代理的 API 访问 Pod：

```bash
curl http://localhost:8001/api/v1/namespaces/default/pods/web-56bb54ff6d-stk75/
```



### 创建 Service

默认情况下，Pod 只能通过 Kubernetes 集群中的内部 IP 地址访问。 为了不使用代理也能访问新的 Deployment，你必须将 Pod 通过 Kubernetes [**Service**](https://kubernetes.io/zh-cn/docs/concepts/services-networking/service/) 公开出来。

使用 `kubectl expose` 命令将 Pod 暴露给公网：

```bash
$ kubectl expose deployment web --type=LoadBalancer --port=8080
```

这里的 `--type=LoadBalancer` 参数表明你希望将你的 Service 暴露到集群外部。

测试镜像中的应用程序代码仅监听 TCP 8080 端口。 如果你用 `kubectl expose` 暴露了其它的端口，客户端将不能访问其它端口。

查看你创建的 Service：

```bash
$ kubectl get service web
NAME   TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
web    NodePort   10.106.178.70   <none>        8080:30954/TCP   8s
```

对于支持负载均衡器的云服务平台而言，平台将提供一个外部 IP 来访问该服务。 在 Minikube 上，`LoadBalancer` 使得服务可以通过命令 `minikube service` 访问。

运行下面的命令：

```bash
minikube service hello-node
```

这将打开一个浏览器窗口，为你的应用程序提供服务并显示应用的响应。

```bash
Hello, world!
Version: 1.0.0
Hostname: web-56bb54ff6d-wtcxn
```

### 创建 Ingress

Minikube 有一组内置的[插件](https://kubernetes.io/zh-cn/docs/concepts/cluster-administration/addons/)， 可以在本地 Kubernetes 环境中启用、禁用和打开。

查询插件：

```bash
minikube addons list
```

启用入口插件：

```bash
minikube addons enable ingress
```

如果要禁用插件：

```bash
minikube addons disable ingress
```

对上面的 web 服务创建一个 ingress：

```bash
kubectl apply -f https://k8s.io/examples/service/networking/example-ingress.yaml
```

https://k8s.io/examples/service/networking/example-ingress.yaml 内容如下：

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: hello-world.example
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 8080
```

等待入口地址

```shell
$ kubectl get ingress
NAME              CLASS   HOSTS                 ADDRESS        PORTS   AGE
example-ingress   nginx   hello-world.example             80      36s
```

在本地 hosts 文件添加：

```bash
127.0.0.1 hello-world.example
```

现在验证入口是否正常工作：

```shell
$ curl hello-world.example
curl: (7) Failed to connect to hello-world.example port 80 after 2 ms: Couldn't connect to server
```

在一个终端运行下面命令，开启代理，对 example-ingress 暴露 80 和 443 端口：

```bash
$ sudo minikube tunnel
✅  Tunnel successfully started

📌  NOTE: Please do not close this terminal as this process must stay alive for the tunnel to be accessible ...

❗  The service/ingress example-ingress requires privileged ports to be exposed: [80 443]
🔑  sudo permission will be asked for it.
🏃  Starting tunnel for service example-ingress.
```

再次运行，可以看到返回：

```bash
$ curl hello-world.example
Hello, world!
Version: 1.0.0
Hostname: web-56bb54ff6d-stk75
```

### 清理

现在可以清理你在集群中创建的资源：

```bash
kubectl delete service web
kubectl delete deployment web
kubectl delete ingress example-ingress
```

停止 Minikube 集群：

```shell
minikube stop
```
