---
title: "2024-02-05｜Spring Cloud Config快速入门"
date: 2024-02-05T07:00:00+08:00
slug: til
categories: ["Review"]
tags: [spring-cloud]
---



今天做了什么：

1. 创建项目 [spring-cloud-examples](https://github.com/chensoul/spring-cloud-examples)，测试 *Spring Cloud* Config 使用本地文件和 git 仓库作为配置中心
   



---

*Spring Cloud* Config 是一个基于http协议的远程配置实现方式。通过统一的配置管理服务器进行配置管理，客户端通过http协议主动的拉取服务的的配置信息，完成配置获取。

*Spring Cloud* Config 支持以下几种存储方式：

- Git 仓库
- 本地文件
- Vault
- JDBC 数据库



本文主要分享 Spring Cloud Config 使用本地文件和Git 仓库存储配置文件、配置文件加解密、集成 Spring Cloud Bus 等内容，源码在 github：[spring-cloud-examples](https://github.com/chensoul/spring-cloud-examples)。

## 本地文件

### 服务端应用

#### 1. 创建项目

首先，创建一个目录 

```bash
mkdir spring-cloud-examples
cd spring-cloud-examples
```

然后，创建 config 目录，并使用 spring cli 创建一个 maven 项目，项目名称 config-server-file

```bash
mkdir config
cd config

spring init \
--boot-version=3.2.2 \
--type=maven-project \
--java-version=8 \
--name=config-server-file \
--package-name=com.chensoul.springcloud \
--groupId=com.chensoul.springcloud \
--dependencies=cloud-config-server,actuator \
config-server-file
```

​	项目创建成功之后，将 spring-boot-starter-parent 版本改为 2.7.18，对应的将 spring-cloud.version 改为 2021.0.9。

#### 2. 添加 @EnableConfigServer 注解

```java
@EnableConfigServer
@SpringBootApplication
public class ConfigServerFileApplication {

	public static void main(final String[] args) {
		SpringApplication.run(ConfigServerFileApplication.class, args);
	}

}
```

#### 3. 修改配置文件

将 application.properties 重命名为 application.yml，并添加如下配置

```yaml
server:
  port: 8888

spring.application.name: config-server-file
spring.profiles.active: native

management.endpoint.health.show-details: ALWAYS
management.endpoints.web.exposure.include: "*"

# default value: classpath:/, classpath:/config, file:./, file:./config
spring.cloud.config.server.native.search-locations: file:${PWD}/config-repo
```

> 说明：
>
> - 使用本地配置文件，要求 `spring.profiles.active` 必须为 native
> - `${PWD}` 指向的是当前项目的路径

创建 config-repo 目录，用于保存配置文件：

```bash
mkdir config-repo
```

在 config-repo 目录创建一个测试文件 foo.yml：

```bash
foo: hello world
```



#### 4. 启动应用

启动应用之后，可以访问 /actuator 。

```bash
$ curl http://localhost:8888/actuator/ -s | jq
{
  "_links": {
    "self": {
      "href": "http://localhost:8888/actuator",
      "templated": false
    },
    ...
    "refresh": {
      "href": "http://localhost:8888/actuator/refresh",
      "templated": false
    },
    "features": {
      "href": "http://localhost:8888/actuator/features",
      "templated": false
    }
  }
}
```

此外，配置服务器还暴露以下几个端点：

- `/encrypt` 和 `/decrypt`
- `/{application}/{profile}[/{label}]`
- `/{application}-{profile}.yml`
- `/{label}/{application}-{profile}.yml`
- `/{application}-{profile}.properties`
- `/{label}/{application}-{profile}.properties`

说明：

- `application`：应用名称
- `profile`：spring 的 profile
- `label`：git 仓库的分支名称

针对当前项目的 foo.yml 配置文件，可以访问的路径有：

```bash
http://localhost:8888/foo/native
http://localhost:8888/foo-native.yml
http://localhost:8888/foo-native.yaml
http://localhost:8888/foo-native.properties
http://localhost:8888/foo-native.json

http://localhost:8888/foo/native/master
http://localhost:8888/foo/native,default/master
http://localhost:8888/master/foo-native.properties
http://localhost:8888/master/foo-native.yml
http://localhost:8888/master/foo-native.yaml
http://localhost:8888/master/foo-native.json
```

例如，访问 localhost:8888/foo/native :

```bash
$ curl -s localhost:8888/foo/native | jq
{
  "name": "foo",
  "profiles": [
    "native"
  ],
  "label": null,
  "version": null,
  "state": null,
  "propertySources": [
    {
      "name": "file:/Users/chensoul/workspace/IdeaProjects/spring-cloud-examples/config-repo/foo.yml",
      "source": {
        "foo": "hello world"
      }
    }
  ]
}
```

访问 http://localhost:8888/actuator/env 可以查看所有 propertySources 配置：

```bash
$ curl -s localhost:8080/actuator/env | jq
{
  "activeProfiles": [
    "native"
  ],
  "propertySources": [
    {
      "name": "server.ports",
      "properties": {
        "local.server.port": {
          "value": 8888
        }
      }
    },
    {
      "name": "servletContextInitParams",
      "properties": {}
    },
    {
      "name": "systemProperties",
      "properties": {
        
      }
    },
    {
      "name": "systemEnvironment",
      "properties": {
        
      }
    },
    {
      "name": "configServerClient",
      "properties": {
        "spring.cloud.config.enabled": {
          "value": "false"
        }
      }
    },
    {
      "name": "springCloudClientHostInfo",
      "properties": {
        "spring.cloud.client.hostname": {
          "value": "192.168.3.214"
        },
        "spring.cloud.client.ip-address": {
          "value": "192.168.3.214"
        }
      }
    },
    {
      "name": "Config resource 'class path resource [application.yml]' via location 'optional:classpath:/'",
      "properties": {
        "server.port": {
          "value": 8888,
          "origin": "class path resource [application.yml] - 2:9"
        },
        "spring.profiles.active": {
          "value": "native",
          "origin": "class path resource [application.yml] - 6:13"
        },
        "spring.cloud.config.server.native.search-locations": {
          "value": "file:/Users/chensoul/workspace/IdeaProjects/spring-cloud-examples/config-repo",
          "origin": "class path resource [application.yml] - 9:53"
        },
        "management.endpoints.web.exposure.include": {
          "value": "*",
          "origin": "class path resource [application.yml] - 15:18"
        },
        "management.endpoint.env.post.enabled": {
          "value": true,
          "origin": "class path resource [application.yml] - 19:18"
        }
      }
    }
  ]
}
```

propertySources 包括：

- `server.ports`
- `servletContextInitParams`
- `systemProperties`
- `systemEnvironment`
- `configServerClient`
- `springCloudClientHostInfo`
- `optional:classpath:/` 中的 `application.yml`

查看 foo.yml 配置文件内容：

```bash
$ curl http://localhost:8888/foo-native.yml
foo: hello world
```



#### 5. 开启 Security

添加 security 依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

修改配置文件，设置用户名和密码：

```yaml
spring.security.user.name: ${SPRING_SECURITY_USER_NAME:root}
spring.security.user.password: ${SPRING_SECURITY_USER_PASSWORD:123456}
```

或者通过环境变量 `SPRING_SECURITY_USER_NAME`、`SPRING_SECURITY_USER_PASSWORD` 进行设置。



重启应用，再次访问配置服务器时需要指定用户名和密码，例如，查看 foo.yml 配置文件内容：

```bash
$ curl http://root:123456@localhost:8888/foo/native -s | jq 
test: hello world
```



#### 6. 加解密信息

支持两种配置方式：

- 第一种，对称加密。配置加密 key 和 salt

  ```yml
  encrypt.key: ${ENCRYPT_KEY:123456}
  encrypt.salt: deadbeef # 可选，默认值为 deadbeef
  ```

  或者通过环境变量 `ENCRYPT_KEY` 进行设置。

- 第二种，分对称加密。

  首先，需要生成 keystore 文件：

  ```bash
  cd config-server-file/src/main/resources
  
  keytool -genkeypair -alias mytestkey -storetype PKCS12 -keyalg RSA -dname "CN=Web Server,OU=Unit,O=Organization,L=City,S=State,C=US" -keypass changeme -keystore server.jks -storepass changeme
  ```

  然后，在配置文件中添加：

  ```yml
  encrypt:
    key-store:
      location: classpath:server.jks
      password: changeme
      alias: mytestkey
      secret: changeme
  ```



接下来，使用第一种配置方式进行测试。

重启应用，加密 "hello world"：

```bash
$ curl -s http://root:123456@localhost:8888/encrypt --data-urlencode "hello world"
1245fd945d0a14e529a0cafe0b6367206d69cad381d4d733ba21d348a303865e                    
```

解密：

```bash
$ curl -s http://root:123456@localhost:8888/decrypt -d 1245fd945d0a14e529a0cafe0b6367206d69cad381d4d733ba21d348a303865e
hello world
```

在配置文件使用加密字符串。修改 foo.yml 中 test 的值为上面生成的加密字符串：

```yaml
foo: '{cipher}1245fd945d0a14e529a0cafe0b6367206d69cad381d4d733ba21d348a303865e'
```

重启应用，查看 foo.yml 文件内容：

```bash
$ curl http://root:123456@localhost:8888/foo/native -s | jq 
foo: hello world
```

#### 7. 集成 Eureka 注册中心

添加 eureka 客户端依赖：

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

添加 eureka 配置：

```yml
eureka:
  instance:
    prefer-ip-address: true
    instance-id: ${spring.cloud.client.ip-address}:${server.port}
    # 客户端向注册中心发送心跳的时间间隔，默认30秒
    leaseRenewalIntervalInSeconds: 5
    #注册中心在收到客户端心跳之后，等待下一次心跳的超时时间，如果在这个时间内没有收到下次心跳，则移除该客户端。默认90秒
    leaseExpirationDurationInSeconds: 30
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    initialInstanceInfoReplicationIntervalSeconds: 5
    registryFetchIntervalSeconds: 5
```





#### 8. 配置高可用

有两种方式：

- 部署多实例，然后使用负载均衡进行代理
- 注册到注册中心，部署多实例

### 客户端应用

#### 1. 创建项目

使用 spring cli 创建一个 maven 项目 config-client

```bash
spring init \
--boot-version=3.2.2 \
--type=maven-project \
--java-version=8 \
--name=config-server-file-client \
--package-name=com.chensoul.springcloud \
--groupId=com.chensoul.springcloud \
--dependencies=cloud-config-client,web,actuator \
config-client
```

将 spring-boot-starter-parent 版本改为 2.7.18，对应的将 spring-cloud.version 改为 2021.0.9

#### 2. 修改配置文件

将 application.properties 重命名为 application.yml，并添加如下配置

```yaml
spring.application.name: config-client

management.endpoint.health.show-details: ALWAYS
management.endpoints.web.exposure.include: "*"

# 1. 默认从 http://localhost:8888 获取配置
# 2. 如果没有配置 optional: 则 Config Client 连接不到 Config Server 时就会失败
# 3. import 配置优先于 uri 配置
# 4. 配置了后就不需要 bootstrap 引导文件
spring.config.import: "optional:configserver:"

spring:
  cloud:
  	config:
    	uri: http://localhost:8888
```

在 config-repo 目录添加客户端配置文件 config-client.yml

```yml
test: hello world
```

#### 3. 创建一个 controller

```java
@RefreshScope
@RestController
@SpringBootApplication
public class ConfigClientApplication {
    @Value("${test}")
    private String test;

    @GetMapping("/test")
    public String test() {
        return this.test;
    }

    public static void main(final String[] args) {
        SpringApplication.run(ConfigFileClientApplication.class, args);
    }

}
```

#### 4. 启动应用

查看 test 的值

```bash
$ curl http://localhost:8080/test
test: hello world
```

查看 config-client 应用的配置：

```bash
$ curl http://root:123456@localhost:8888/config-client.yml
test: hello world
```



#### 5. 配置重试

添加 spring-retry 依赖：

```xml
<dependency>
    <groupId>org.springframework.retry</groupId>
    <artifactId>spring-retry</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
```

修改配置添加重试参数：

```yaml
spring:
  cloud:
    config:
      uri: http://localhost:8888
      # 客户端配置快速失败
      fail-fast: true
      # 配置重试，需要引入 spring-retry
      retry:
        initialInterval: 1000
        multiplier: 1.1
        maxInterval: 10000
        maxAttempts: 6
```

注意：重试参数也可以添加到 url 后面：

```yml
spring.config.import: configserver:http://configserver.example.com?fail-fast=true&max-attempts=10&max-interval=1500&multiplier=1.2&initial-interval=1100"
```



#### 6. 配置其他参数

配置客户端快速失败和连接超时：

```yml
spring:
  cloud:
  	config:
  		uri: http://localhost:8888
      # 客户端配置快速失败
      fail-fast: true
      # 配置重试，需要引入 spring-retry
      retry:
        initialInterval: 1000
        multiplier: 1.1
        maxInterval: 10000
        maxAttempts: 6
      request-connect-timeout: 3000
      request-read-timeout: 3000
```



#### 7. 开启 Security

服务端开启了 security 之后，客户端启动时会报错：

```bash
org.springframework.cloud.config.client.ConfigClientFailFastException: Could not locate PropertySource and the fail fast property is set, failing

Caused by: org.springframework.web.client.UnknownContentTypeException: Could not extract response: no suitable HttpMessageConverter found for response type [class org.springframework.cloud.config.environment.Environment] and content type [text/html;charset=UTF-8]
```

这时候，客户端需要设置用户名和密码。修改配置文件：

```yml
spring:
  cloud:
    config:
      uri: http://localhost:8888
      username: ${SPRING_SECURITY_USER_NAME:root}
      password: ${SPRING_SECURITY_USER_PASSWORD:123456}
```

重启之后，再次查看 test 的值：

```bash
$ curl http://localhost:8080/test
hello world
```

#### 8. 集成 Eureka 注册中心

添加 eureka 客户端依赖：

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

修改配置文件：

```yml
spring:
  cloud:
    config:
      # uri: http://localhost:8888
      discovery:
        enabled: true
        service-id: config-server-file
```



## Git 仓库

### 服务端应用

#### 1. 创建项目

使用 spring cli 创建一个 maven 项目 config-server-git

```bash
cd config

spring init \
--boot-version=3.2.2 \
--type=maven-project \
--java-version=8 \
--name=config-server-git \
--package-name=com.chensoul.springcloud \
--groupId=com.chensoul.springcloud \
--dependencies=cloud-config-server,actuator \
config-server-git
```

将 spring-boot-starter-parent 版本改为 2.7.18，对应的将 spring-cloud.version 改为 2021.0.9

#### 2. 添加 @EnableConfigServer 注解

```java
@EnableConfigServer
@SpringBootApplication
public class ConfigServerGitApplication {

	public static void main(final String[] args) {
		SpringApplication.run(ConfigServerGitApplication.class, args);
	}

}
```

#### 3. 修改配置文件

将 application.properties 重命名为 application.yml，并添加如下配置

```yaml
server:
  port: 8888

spring.application.name: config-server-git

management.endpoint.health.show-details: ALWAYS
management.endpoints.web.exposure.include: "*"

spring.cloud.config.server.git.uri: https://github.com/chensoul/spring-cloud-examples
spring.cloud.config.server.git.search-paths: config-repo 
spring.cloud.config.server.git.default-label: cloud-config # 使用 cloud-config 分支
```

> 说明：
>
> - search-paths：搜索路径，可以是多个，使用逗号连接，支持 * 匹配
> - default-label：指定默认分支

#### 4. 配置参数

```yaml
spring:
  cloud:
    config:
      server:
        git:
          uri: file:${PWD}/config-repo
          username: username
          password: password
          skipSslValidation: true
          timeout: 4
          force-pull: true
          deleteUntrackedBranches: true
          refreshRate: 0
          defaultLabel: main
          tryMasterBranch: false
```

如果是私有仓库，则需要配置认证，或者使用 ssh 私钥，配置方式，请参考 [Git SSH configuration using properties](https://docs.spring.io/spring-cloud-config/docs/3.1.9/reference/html/#_git_ssh_configuration_using_properties)。

#### 5. 启动应用

查看 test 的值

```bash
$ curl http://localhost:8080/test
hello world
```

#### 6. 开启 Security

添加 security 依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

修改配置文件，设置用户名和密码：

```yaml
spring.security.user.name: ${SPRING_SECURITY_USER_NAME:root}
spring.security.user.password: ${SPRING_SECURITY_USER_PASSWORD:123456}
```

或者通过环境变量 `SPRING_SECURITY_USER_NAME`、`SPRING_SECURITY_USER_PASSWORD` 进行设置。



重启应用，再次访问配置服务器时需要指定用户名和密码，例如，查看 foo.yml 配置文件内容：

```bash
$ curl http://root:123456@localhost:8888/foo-native.yml
foo: hello world
```

查看 config-client 应用的配置：

```bash
$ curl http://root:123456@localhost:8888/config-client.yml
test: hello world
```



### 客户端应用

#### 1. 创建应用

在 config-client 项目基础上，修改配置文件

因为服务端配置文件是在 cloud-config 分支（`spring.cloud.config.server.git.default-label: cloud-config`），故客户端也应该设置分支 `spring.cloud.config.label: cloud-config`：

```yml

spring.application.name: config-client

management.endpoint.health.show-details: ALWAYS
management.endpoints.web.exposure.include: "*"

# 1. 默认从 http://localhost:8888 获取配置
# 2. 如果没有配置 optional: 则 Config Client 连接不到 Config Server 时就会失败
# 3. import 配置优先于 uri 配置
# 4. 配置了后就不需要 bootstrap 引导文件
spring.config.import: "optional:configserver:"

spring:
  cloud:
    config:
    	uri: http://localhost:8888
    	label: cloud-config
      # 客户端配置快速失败
      fail-fast: true
      # 配置重试，需要引入 spring-retry
      retry:
        initialInterval: 1000
        multiplier: 1.1
        maxInterval: 10000
        maxAttempts: 6
```

#### 2. 启动应用

重启应用，查看 test 的值

```bash
$ curl http://root:123456@localhost:8080/test
hello world
```

#### 3. 开启 security

服务端开启 security 之后，客户端需要设置用户名和密码。修改配置文件：

```yml
spring:
  cloud:
    config:
      uri: http://localhost:8888
      label: cloud-config
      username: ${SPRING_SECURITY_USER_NAME:root}
      password: ${SPRING_SECURITY_USER_PASSWORD:123456}
```

重启之后，再次查看 test 的值：

```bash
$ curl http://localhost:8080/test
hello world
```

#### 

#### 4. 测试手动更新配置

修改 config-client.yml 文件中 test 的值为 "hello world 1111"，并提交到 git 仓库。

通过配置服务，查看 config-client 应用的配置，发现 test 的值已经更新。

```bash
$ curl http://root:123456@localhost:8888/config-client.yml
test: hello world
```

然后，再次查看客户端的 test 的值：

```bash
$ curl http://localhost:8080/test
hello world
```

发现 test 值并没有更新，这时候需要调用客户端的 /actuator/refresh 手动更新。

```bash
$ curl -X POST http://localhost:8080/actuator/refresh
["config.client.version","test"]%  
```

返回内容，说明 config.client.version 和 test 的值有更新。如果没有返回，说明执行异常。

再次查看客户端的 test 的值，发现 test 值已修改为 "hello world 1111"：

```bash
$ curl http://localhost:8080/test
hello world 1111
```

说明：

- /actuator/refresh 只能更新单个客户端的配置，如果有多个客户端需要一个个执行刷新接口。

## 集成 Spring Cloud Bus

### 服务端应用

#### 1. 创建应用

在 config-server-git 项目基础上，添加依赖：

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

#### 2. 修改配置文件

添加 rabbitmq 配置

```yml
spring.rabbitmq:
  host: 127.0.0.1
  port: 5672
  username: guest
  password: 123456
```

#### 3. 重启应用



### 客户端应用

#### 1. 创建应用

在 config-client 项目基础上，添加依赖：

```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

#### 2. 修改配置文件

添加 rabbitmq 配置

```yml
spring.rabbitmq:
  host: 127.0.0.1
  port: 5672
  username: guest
  password: 123456
```

#### 3. 重启应用

查看 test 的值

```bash
$ curl http://root:123456@localhost:8888/config-client-default.yml
test: hello world 1111

$ curl http://localhost:8080/test
hello world 1111
```

#### 4. 自动刷新配置

spring cloud bus 提供了两个端点：

- /actuator/busrefresh：通过该接口刷新配置，spring cloud bus 会广播给所有客户端从而刷新配置
- /actuator/busenv

使用 POST 请求访问 /actuator/busenv，修改 config-client.yml 文件中 test 的值为 "hello world 2222"：

```bash
curl -X POST -H 'Content-Type: application/json' -d '{"name":"test","value":"hello world 2222"}' http://localhost:8080/actuator/busenv
```

查看客户端日志：

```bash
2024-02-06 11:33:06.003  INFO 11387 --- [nio-8080-exec-7] o.s.c.b.event.EnvironmentChangeListener  : Received remote environment change request. Keys/values to update {test=hello world 2222}
```



这时候查看，返回内容为：

```bash
$ curl http://root:123456@localhost:8888/config-client-default.yml
test: hello world 1111

$ curl http://localhost:8080/test
hello world 1111
```

可以看到 test 属性的值还没有刷新。通过 /actuator/busrefresh 刷新配置：

```bash
curl -X POST http://localhost:8080/actuator/busrefresh
```

再次查看，可以看到 test 属性的值已经刷新。

```bash
$ curl http://localhost:8080/test
hello world 2222
```

#### 5. 通过 git 刷新配置

在 git 仓库中修改 test 的值为 "hello world 3333"，然后执行刷新操作：

```
curl -X POST http://localhost:8080/actuator/busrefresh
```

查看客户端日志：

```bash
Received remote refresh request.

Fetching config from server at : http://localhost:8888

Located environment: name=config-client, profiles=[default], label=cloud-config, version=cfcb38e6d396ce6b85e0aa0e8839f38538b7f221, state=null
Keys refreshed [config.client.version, test]
```

再次查看，可以看到 test 属性的值已经刷新。

```bash
$ curl http://localhost:8080/test
hello world 3333% 
```



另外，如果想实现 git 上修改之后立即推送，则需要配置 git 的 webhook 功能。
