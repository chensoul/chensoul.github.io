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

### 部署一个服务

创建一个部署：

```bash
kubectl create deployment web --image=gcr.io/google-samples/hello-app:1.0
```

查询部署：

```bash
$ kubectl get deployment web
NAME   READY   UP-TO-DATE   AVAILABLE   AGE
web    1/1     1            1           14s
```

将部署公开为 NodePort，会创建一个服务 hello-minikube
```bash
$ kubectl expose deployment web --type=NodePort --port=8080
```

查询服务：

```bash
$ kubectl get service web
NAME   TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
web    NodePort   10.106.178.70   <none>        8080:30954/TCP   8s
```

如何访问该服务呢？通过 http://192.168.49.2:30954/ 是无法访问的。

```bash
$ curl http://192.168.49.2:30954/
curl: (56) Recv failure: Connection reset by peer
```

可以使用 `minikube service` 对该服务启动一个代理：

```bash
$ minikube service web
|-----------|------|-------------|---------------------------|
| NAMESPACE | NAME | TARGET PORT |            URL            |
|-----------|------|-------------|---------------------------|
| default   | web  |        8080 | http://192.168.49.2:30954 |
|-----------|------|-------------|---------------------------|
🏃  Starting tunnel for service web.
|-----------|------|-------------|------------------------|
| NAMESPACE | NAME | TARGET PORT |          URL           |
|-----------|------|-------------|------------------------|
| default   | web  |             | http://127.0.0.1:63788 |
|-----------|------|-------------|------------------------|
🎉  Opening service default/web in default browser...
❗  Because you are using a Docker driver on darwin, the terminal needs to be open to run it.
```

这时候通过浏览器访问 http://127.0.0.1:63788/ ，可以看到以下内容：

```bash
Hello, world!
Version: 1.0.0
Hostname: web-56bb54ff6d-wtcxn
```

### 部署一个负载均衡

创建三个 deployment：

```bash
kubectl create deployment web-balanced  -r 3 --image=gcr.io/google-samples/hello-app:1.0
kubectl expose deployment web-balanced --type=LoadBalancer --port=8080
```

查询 deployment：

```bash
$ kubectl get deployment web-balanced
NAME           READY   UP-TO-DATE   AVAILABLE   AGE
web-balanced   3/3     3            3           32s
```

查询 pods：

```bash
kubectl get pods
NAME                            READY   STATUS    RESTARTS   AGE
web-56bb54ff6d-wtcxn            1/1     Running   0          8m43s
web-balanced-7fdf78888c-8p9sf   1/1     Running   0          45s
web-balanced-7fdf78888c-9sx8g   1/1     Running   0          45s
web-balanced-7fdf78888c-nrbnx   1/1     Running   0          45s
```

查询该服务

```shell
$ kubectl get services web-balanced
NAME           TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)          AGE
web-balanced   LoadBalancer   10.97.14.48   127.0.0.1     8080:31553/TCP   8s
```

使用 `minikube service` 对该服务启动一个代理：

```bash
minikube service web-balanced
```



### 部署一个 ingress

查询插件：

```bash
minikube addons list
```

启用入口插件：

```shell
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

