---
title: "2024-01-03｜今天做了什么"
date: 2024-01-03
slug: til
categories: ["review"]
tags: ["spring-cloud"]
---

今天做了什么：

- [idworker-client](https://github.com/bingoohuang/idworker-client) ，一个开源的 ID 生成器，适合在单机使用
- github 上创建了一个使用 spring cloud netflix 相关组件的微服务项目
- 重构了狂野架构师课程中的微服务版本的源码

# foodie-cloud

重构慕课网 [Java架构师-技术专家](https://class.imooc.com/sale/javaarchitect) 课程中的 [源码](https://github.com/liuhouer/np-architect/)，我做了一些改动：
- 升级 Spring Boot 和 Spring Cloud 版本
- 去掉 tk-mybatis 改为使用 mybatis-plus
- 重构模块和部分代码

后续计划：

- docker 容器编排
- k8s 容器编排
- 集成 Spring Security OAuth2
- 集成 Spring Cloud alibaba

### 开发环境和开源项目版本

软件版本：

| 组件          | 用途  	  |              版本号              | 
|:------------|:------:|:-----------------------------:| 
| Redis     	 | 缓存组件 	 |             5.0.4             | 
| RabbitMQ    | 消息中间件  |            3.7.15             | 
| Kafka       | 消息中间件  |             2.2.0             
| Lua         |  限流脚本  |             5.3.5             | 
| MySQL       |  数据库   |              5.7              | 
| IDEA        |  开发环境  |             版本随意              |
| Java        | 编译运行项目 | 1.8以上（推荐8u161以后的版本，否则要装JCE插件） |
| Maven       |  依赖管理  |            3.0.4以上            |

Maven 依赖版本：

| 组件               |     版本号      | 
|:-----------------|:------------:| 
| **Spring Cloud** | **2021.0.9** |
| Spring Boot      |    2.7.18    |
| Mybatis Plus     |    3.5.5     |

### 技术选型

Spring Cloud每个业务领域都有多个可供选择的组件，这里也列出了微服务章节中将要用到的组件+中间件的技术选型，这也是当前主流的选型。

| 内容                        |            技术选型  	            | 
|:--------------------------|:-----------------------------:| 
| 服务治理  	                   |           Eureka 	            |
| 负载均衡     	                |           Ribbon 	            |
| 服务间调用     	               |            Feign 	            |
| 服务容错     	                | Hystrix + Turbine + Dashboard |
| 配置管理     	                |        Config + Github        |
| 消息总线     	                |        Bus + RabbitMQ	        |
| 服务网关     	                |            Gateway            |
| 调用链追踪     	               |     Sleuth + Zipkin + ELK     |
| 消息驱动     	                |      Stream + RabbitMQ	       |
| 流控     	                  |          Sentinel 	           |
| 基于RPC的服务治理</br>（不集成到电商项目） |     Dubbo + Admin Portal      |

### 默认端口

| 内容                        |     端口  	      | 
|:--------------------------|:--------------:| 
| Eureka  	                 |    20000 	     |
| Turbine     	             |    20001 	     |
| Hystrix-Dashboard     	   |    20002 	     |
| Config-Server     	       |     20003      |
| Gateway     	             |     20004      |
| Zipkin     	              |     9411	      |
| ELK镜像-ES     	            |     9200 	     |
| ELK镜像-Logstash     	      |     5044 	     |
| ELK镜像-Kibana     	        |     5601 	     |
| redis（单机模式）     	         |     6379 	     |
| rabbitmq（单机模式）     	      |     5672 	     |
| mariadb/mysql（单机模式）     	 |     3306 	     |
| 商品微服务     	               |     10001      |
| 用户微服务     	               |     10002      |
| 订单微服务     	               |     10003      |
| 购物车微服务     	              |     10004      |
| 权限微服务     	               |     10006      |
| 主搜微服务     	               |    同学们自己实现	    |
| 支付服务     	                | 没变，但回调地址要改一下 	 |

### 启动方式

可以在IDEA里启动，也可以使用Maven编译后在命令行窗口启动，命令行启动方式需要在maven编译好项目之后，cd到对应项目下的target目录，然后使用命令"java -jar xxx.jar"执行编译好的jar包即可。

启动顺序：

- 先确保RabbitMQ，Redis和Mariadb/MySQL处于启动状态
- 启动Eureka - 所有微服务和SC平台组件都依赖Eureka做服务注册
- 启动Config-Server - 部分微服务依赖配置中心拉取配置项
- 启动Hystrix监控模块 - Turbine和Hystrix-Dashboard，等到后续微服务注册到注册中心后，Turbine下次做服务发现之后就可以正常收集数据了
- 启动链路追踪组件 - Zipkin和ELK容器
- 依次启动Auth微服务 -> User微服务 -> Item微服务 -> Cart微服务 -> Order微服务，以及留给同学们完成的主搜服务，支付中心
- 最后启动Gateway网关 -
  在微服务都启动好之后再启动网关，可以保证网关启动后立即生效。反过来先启动网关再注册微服务也行，但是Gateway会处于短暂的不可用状态，因为Gateway启动的时候微服务还没注册，需要等Gateway做服务发现后才能生效



