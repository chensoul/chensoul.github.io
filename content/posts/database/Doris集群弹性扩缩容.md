---
title: "Doris集群弹性扩缩容"
date: 2022-08-18T11:26:27+08:00
slug: doris-cluster-elastic-expansion
categories: ["database"]
tags: ["doris"]
authors:
- chenshu
---

Doris 可以很方便的扩容和缩容 FE、BE、Broker 实例，本文主要是对此做一些测试，记录笔记。


## 集群说明

在测试环境安装和部署了三个节点的集群，每个节点混合部署了 FE 和 BE：

- 192.168.1.107：部署了 FE、BE
- 192.168.1.108：部署了 FE、BE
- 192.168.1.109：部署了 FE、BE

在操作集群之前，有必要了解 doris 的架构：

![doris架构](/img/doris-overview.png)

Doris 有两种进程：

- FE：主要负责用户请求的接入、查询解析规划、元数据的管理、节点管理相关工作。FE 节点个数至少为为1，最好必须为奇数，因为多个 FE 需要进行选举。根据选举出来的结果，分为两种角色：
  - Follower：可以为一个或者多个。如果只有一个，则当前 Follower 默认为 Master。如果存在多个 FE，则进行选举之后，会选出一个 FE 作为 Master。同一个时间，有且只有一个 Master。当 Master FE 宕掉之后，会重新选举出下一个 Master。所以，为了保证 FE 的高可用，一般建议 FE 部署多个节点（大于等于3）。
  - Observer：可以为0个或者多个。Observer 的存在是为了保证读高可用。
- BE：主要负责数据存储、查询计划的执行。

## 集群状态

通过 mysql 客户端连接 FE master，查询当前集群状态：

```bash
mysql -h 192.168.1.107 -P 9030 -uroot
```

查询 BE 状态：

```sql
mysql> SHOW PROC '/backends';
```

结果如下：

![doris-be-status](/img/doris-be-status.png.png)



查询 FE 状态：

```sql
mysql> SHOW PROC '/frontends';
```

结果如下：

![doris-fe-status](/img/doris-fe-status.png)

从上面可以看到：

- IP
- HostName：主机名称
- Role：角色，所有节点都是 Follower 角色
- IsMaster：192.168.1.107 节点为 Master Follower
- Join：三个 FE 是否加入了集群



也可以通过 http://192.168.1.107:8030/System?path=//frontends 和 http://192.168.1.107:8030/System?path=//backends 来查看 FE 和 BE 状态。



## FE 扩容和缩容

FE 节点的扩容和缩容过程，不影响当前系统运行。



FE 分为 Follower 和 Observer 两种角色。 默认一个集群，可以有多个 Follower 和 Observer。其中多个 Follower 组成一个 Paxos 选择组，集群启动时，Follower 会选举出一个 Master。如果 Master 宕机，则剩下的 Follower 会自动选出新的 Master，保证写入高可用。Observer 同步 Master 的数据，但是不参加选举。如果只部署一个 FE，则 FE 默认就是 Master。

第一个启动的 FE 自动成为 Master。在此基础上，可以添加若干 Follower 和 Observer。



#### 增加 FE 节点

**1、配置及启动 Follower 或 Observer**

Follower 和 Observer 的配置是相同的，都是通过  fe/conf/fe.conf 进行配置。



在新添加的节点上启动 FE，使用下面的命令：

```bash
fe/bin/start_fe.sh --helper leader_fe_host:edit_log_port --daemon
```

> 说明：
>
> 其中 leader_fe_host 为 Leader 所在节点 ip，edit_log_port 在 Leader 的配置文件 fe.conf 中。`--helper` 参数仅在 follower 和 observer 第一次启动时才需要。

测试过程中，我是选择 192.168.1.107 作为 FE Master，新添加的节点为 192.168.1.110，所以，在 192.168.1.110 节点第一次启动 FE 命令如下：

```bash
fe/bin/start_fe.sh --daemon --helper 192.168.1.107:9010 
```



**2、将 Follower 或 Observer 加入到集群**

使用 mysql 客户端连接 FE Master：

```bash
mysql -h 192.168.1.107 -P 9030 -uroot
```

然后，执行下面命令：

```bash
ALTER SYSTEM ADD FOLLOWER "192.168.1.110:9010";
# 或者
ALTER SYSTEM ADD OBSERVER "192.168.1.110:9010";
```

使用上面哪个命令，取决于你想让新节点以 FOLLOWER 角色还是 OBSERVER 角色加入集群。

>**FE 扩容注意事项：**
>
>1. Follower FE（包括 Master）的数量必须为奇数，建议最多部署 3 个组成高可用（HA）模式即可。
>2. 当 FE 处于高可用部署时（1个 Master，2个 Follower），我们建议通过增加 Observer FE 来扩展 FE 的读服务能力。当然也可以继续增加 Follower FE，但几乎是不必要的。
>3. 通常一个 FE 节点可以应对 10-20 台 BE 节点。建议总的 FE 节点数量在 10 个以下。而通常 3 个即可满足绝大部分需求。
>4. helper 不能指向 FE 自身，必须指向一个或多个已存在并且正常运行中的 Master/Follower FE。



#### 删除 FE 节点

使用以下命令删除对应的 FE 节点：

```sql
ALTER SYSTEM DROP FOLLOWER[OBSERVER] "fe_host:edit_log_port";
```

> **FE 缩容注意事项：**
>
> 1. 删除 Follower FE 时，确保最终剩余的 Follower（包括 Master）节点为奇数。



#### 测试增加和删除 FE 节点

**1、测试 3 个 FE 节点情况下，删除1个FE**

```sql
mysql -h 192.168.1.107 -P 9030 -uroot
mysql> ALTER SYSTEM drop FOLLOWER "192.168.1.109:9010";
```

查看 FE 状态，可以看到还有两个 FE，192.168.1.107 还是为 Master。

![doris-fe-status-01](/img/doris-fe-status-01.png)

根据上面的 **FE 缩容注意事项**，如果删除 FE 节点，需要保证最终剩余的 FE 的总数为奇数。在删除一个节点之后，FE 个数为 2，FE 状态均为正常。

这时候，如果 Master 宕机了，剩下一个 FE 会成为 Master 吗？我们来停止 192.168.1.107 的 FE。

```bash
fe/bin/stop_fe.sh
```

然后，再来连接 FE Master，猜测这时候的 Master 应该为 192.168.1.108

```bash
mysql -h 192.168.1.108 -P 9030 -uroot
```

查看 FE 状态，却提示异常，说明剩下的2个节点（其中一个节点为宕机状态）无法选举出 Master。

```sql
mysql> SHOW PROC '/frontends';
ERROR 1105 (HY000): Exception, msg: Failed to get master client.
```

这时候再将 192.168.1.107 的 FE 启动起来：

```bash
fe/bin/start_fe.sh --daemon
```

再通过客户端连接 FE，查看 FE 状态：

```bash
mysql -h 192.168.1.108 -P 9030 -uroot
```

 可以看到 变成了 Master：

![doris-fe-status-02](/img/doris-fe-status-02.png)

这说明，**剩余偶数个 FE 时，还是能选举出 Master？**



这时候，如果把不是 Master 的 FE 停止，会出现什么情况呢？

```bash
mysql -h 192.168.1.108 -P 9030 -uroot
mysql> SHOW PROC '/frontends';
```

可以看到如下结果：

![doris-fe-status-03](/img/doris-fe-status-03.png)

说明：非 Master 节点宕机，不影响 Master FE 节点的运行，宕机的 FE 的 Alive 状态为 false，异常信息不为空，这里为：`socket is closed by peer.`

稍等一会，会提示无法连接到服务：

```bash
RROR 2013 (HY000): Lost connection to MySQL server during query
No connection. Trying to reconnect...
ERROR 2003 (HY000): Can't connect to MySQL server on '192.168.1.108:9030' (111)
ERROR:
Can't connect to the server
```

原因是 Master FE 也就是 192.168.1.108 节点上的 FE 宕机了，查看日志：

```bash
com.sleepycat.je.rep.InsufficientReplicasException: (JE 18.3.12) Commit policy: SIMPLE_MAJORITY required 1 replica. But none were active with this master.
at com.sleepycat.je.rep.impl.node.DurabilityQuorum.ensureReplicasForCommit(DurabilityQuorum.java:116) ~[je-18.3.12.jar:18.3.12]
	at com.sleepycat.je.rep.impl.RepImpl.txnBeginHook(RepImpl.java:1171) ~[je-18.3.12.jar:18.3.12]
	at com.sleepycat.je.rep.txn.MasterTxn.txnBeginHook(MasterTxn.java:195) ~[je-18.3.12.jar:18.3.12]
	at com.sleepycat.je.txn.Txn.initTxn(Txn.java:384) ~[je-18.3.12.jar:18.3.12]
```

手动启动 192.168.1.108 的FE 之后，查看日志：

```bash
2022-08-18 18:22:54,958 INFO (UNKNOWN 192.168.1.108_9010_1660793829444(-1)|1) [Catalog.waitForReady():876] wait catalog to be ready. FE type: UNKNOWN. is ready: false
```

说明：192.168.1.108 的 FE 还没有获得正确的 FE 类型。原因应该是，目前集群只注册了两个 FE，却只有一个 FE 是存活状态，无法选举出 Master FE。

在 192.168.1.107 节点查看 FE 状态，发现 FE 也挂了，这时候手动启动 FE。发现，可以再次连接  FE。

```bash
mysql -h 192.168.1.108 -P 9030 -uroot
```

**总结：**

- 1、删除 Follower FE 时，需要确保最终剩余的 Follower（包括 Master）节点为奇数。
- 2、删除 Follower FE 时，如果剩余的 Follower 不为奇数（目前测试的是剩余 2 个情况下），如果有一个 FE 宕掉，则另一个 FE 也会宕掉。所以，**需要在 FE 宕掉之后，能够自动启动**。也就是，在集群里，为了保证高可用，需要**所有实例都应使用守护进程启动，以保证进程退出后，会被自动拉起**。



**2、测试 1 个 FE 节点情况下，添加 FE 节点**



## BE 扩容和缩容

BE 节点的扩容和缩容过程，不影响当前系统运行以及正在执行的任务，并且不会影响当前系统的性能。数据均衡会自动进行。根据集群现有数据量的大小，集群会在几个小时到1天不等的时间内，恢复到负载均衡的状态。

#### 增加 BE 节点

BE 节点的增加方式同 **BE 部署** 一节中的方式，通过 `ALTER SYSTEM ADD BACKEND` 命令增加 BE 节点。

> BE 扩容注意事项：
>
> 1. BE 扩容后，Doris 会自动根据负载情况，进行数据均衡，期间不影响使用。

#### 删除 BE 节点

删除 BE 节点有两种方式：DROP 和 DECOMMISSION

DROP 语句如下：

```sql
ALTER SYSTEM DROP BACKEND "be_host:be_heartbeat_service_port";
```

**注意：DROP BACKEND 会直接删除该 BE，并且其上的数据将不能再恢复！！！所以我们强烈不推荐使用 DROP BACKEND 这种方式删除 BE 节点。当你使用这个语句时，会有对应的防误操作提示。**

DECOMMISSION 语句如下：

```sql
ALTER SYSTEM DECOMMISSION BACKEND "be_host:be_heartbeat_service_port";
```

> DECOMMISSION 命令说明：
>
> 1. 该命令用于安全删除 BE 节点。命令下发后，Doris 会尝试将该 BE 上的数据向其他 BE 节点迁移，当所有数据都迁移完成后，Doris 会自动删除该节点。
> 2. 该命令是一个异步操作。执行后，可以通过 `SHOW PROC '/backends';` 看到该 BE 节点的 `SystemDecommissioned` 状态为 true。表示该节点正在进行下线。
> 3. 该命令**不一定执行成功**。比如剩余 BE 存储空间不足以容纳下线 BE 上的数据，或者剩余机器数量不满足最小副本数时，该命令都无法完成，并且 BE 会一直处于 `SystemDecommissioned` 为 true 的状态。
> 4. DECOMMISSION 的进度，可以通过 `SHOW PROC '/backends';` 中的 TabletNum 查看，如果正在进行，TabletNum 将不断减少。
> 5. 该操作可以通过:
>    `CANCEL DECOMMISSION BACKEND "be_host:be_heartbeat_service_port";`
>    命令取消。取消后，该 BE 上的数据将维持当前剩余的数据量。后续 Doris 重新进行负载均衡

**对于多租户部署环境下，BE 节点的扩容和缩容，请参阅 [多租户设计文档](https://doris.apache.org/zh-CN/docs/admin-manual/multi-tenant)。**

## Broker 扩容缩容

Broker 实例的数量没有硬性要求。通常每台物理机部署一个即可。Broker 的添加和删除可以通过以下命令完成：

```sql
ALTER SYSTEM ADD BROKER broker_name "broker_host:broker_ipc_port";

ALTER SYSTEM DROP BROKER broker_name "broker_host:broker_ipc_port";

ALTER SYSTEM DROP ALL BROKER broker_name;
```

Broker 是无状态的进程，可以随意启停。当然，停止后，正在其上运行的作业会失败，重试即可。
