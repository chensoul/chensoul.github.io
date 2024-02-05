---
title: "2024-02-05｜Spring Cloud Config使用本地文件和Git仓库作为配置中心"
date: 2024-02-05T07:00:00+08:00
slug: til
categories: ["Review"]
tags: [spring-cloud]
---



今天做了什么：

1. 创建项目 [spring-cloud-examples](https://github.com/chensoul/spring-cloud-examples)，测试 spring cloud config 使用本地文件和 git 仓库作为配置中心
   



## Spring Cloud Config使用本地文件和Git仓库作为配置中心

spring cloud config是一个基于http协议的远程配置实现方式。通过统一的配置管理服务器进行配置管理，客户端通过http协议主动的拉取服务的的配置信息，完成配置获取。

*Spring Cloud* Config 支持以下几种存储方式：

- Git 仓库
- 本地文件
- Vault
- JDBC 数据库



### 本地文件

#### 服务端应用

1. 使用 spring cli 创建一个 maven 项目

   ```bash
   mkdir spring-cloud-examples
   cd spring-cloud-examples
   
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

​	将 spring-boot-starter-parent 版本改为 2.7.18，对应的将 spring-cloud.version 改为 2021.0.9

2. 添加 @EnableConfigServer 注解

   ```java
   @EnableConfigServer
   @SpringBootApplication
   public class ConfigServerFileApplication {
   
   	public static void main(final String[] args) {
   		SpringApplication.run(ConfigServerFileApplication.class, args);
   	}
   
   }
   ```

3. 修改配置文件

   ```yaml
   server:
     port: 8888
   
   spring.application.name: config-server-file
   spring.profiles.active: native
   
   # default value: classpath:/, classpath:/config, file:./, file:./config
   spring.cloud.config.server.native.search-locations: file://${PWD}/config-repo
   ```

   创建 config-repo 目录：

   ```bash
   mkdir config-repo
   ```

   创建一个测试文件 foo.yml：

   ```bash
   foo: hello world
   ```

   


4. 启动应用

   spring cloud config server 暴露以下几个端点：

   - `/actuator`
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

   针对当前项目，可以访问的路径有：

   ```bash
   curl localhost:8888/foo/native
   curl localhost:8888/foo-native.yml
   curl localhost:8888/foo-native.yaml
   curl localhost:8888/foo-native.properties
   
   #如果是git仓库保存配置文件，则可以访问以下路径
   #curl localhost:8888/foo/native/master
   #curl localhost:8888/foo/native,default/master
   #curl localhost:8888/master/foo-native.properties
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

   - server.ports
   - servletContextInitParams
   - systemProperties
   - systemEnvironment
   - configServerClient
   - springCloudClientHostInfo
   - 'optional:classpath:/' 中的 application.yml

5. 开启 Security

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

   或者通过环境变量 `SPRING_SECURITY_USER_NAME`、`SPRING_SECURITY_USER_PASSWORD` 进行设置

   重启应用，查看 foo.yml 文件内容：

   ```bash
   $ curl http://root:123456@localhost:8888/foo/native -s | jq 
   test: hello world
   ```

6. 加密解密敏感信息

   支持两种配置方式：

   - 第一种，对称加密。配置加密 key 和 salt

     ```yml
     encrypt:
       key: 123456
       salt: deadbeef
     ```

     或者通过环境变量 `ENCRYPT_KEY` 进行设置

   - 第二种，分对称加密。

     生成 keystore 文件：

     ```bash
     cd config-server-file/src/main/resources
     
     keytool -genkeypair -alias mytestkey -storetype PKCS12 -keyalg RSA -dname "CN=Web Server,OU=Unit,O=Organization,L=City,S=State,C=US" -keypass changeme -keystore server.jks -storepass changeme
     ```

     添加配置：

     ```yml
     encrypt:
       key-store:
         location: classpath:server.jks
         password: changeme
         alias: mytestkey
         secret: changeme
     ```

   使用第一种配置方式，重启应用，然后测试。加密 "hello world"：

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

7. 配置高可用

   有两种方式：

   - `spring.cloud.config.uri` 配置多个地址，使用逗号分隔
   - 注册到注册中心，部署多实例

#### 客户端应用

1. 使用 spring cli 创建一个 maven 项目

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

2. 修改配置文件

   ```yaml
   # 1. 默认从 http://localhost:8888 获取配置
   # 2. 如果没有配置 optional: 则 Config Client 连接不到 Config Server 时就会失败
   # 3. import 配置优先于 uri 配置
   # 4. 配置了后就不需要 bootstrap 引导文件
   spring.config.import: "optional:configserver:"
   
   spring.application.name: config-client
   
   spring:
     cloud:
     	config:
       	uri: http://localhost:8888
       
   # WARNING: Exposing all management endpoints over http should only be used during development, must be locked down in production!
   management.endpoint.health.show-details: "ALWAYS"
   management.endpoints.web.exposure.include: "*"
   ```

3. 在 config-repo 目录添加客户端配置文件 config-client.yml

   ```yml
   test: hello world
   ```

4. 添加一个 controller：

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

5. 启动应用，查看 test 的值

   ```bash
   $ curl http://localhost:8080/test
   hello world
   ```

6. 配置重试

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
   # 1. 默认从 http://localhost:8888 获取配置
   # 2. 如果没有配置 optional: 则 Config Client 连接不到 Config Server 时就会失败
   # 3. import 配置优先于 uri 配置
   # 4. 配置了后就不需要 bootstrap 引导文件
   spring.config.import: "optional:configserver:"
   
   spring.application.name: config-client
   
   spring:
     cloud:
     	config:
         # 配置重试，需要引入 spring-retry
         retry:
           initialInterval: 1000
           multiplier: 1.1
           maxInterval: 10000
           maxAttempts: 6
         uri: http://localhost:8888
   ```

   注意：重试参数也可以添加到 url 后面：

   ```yml
   spring.config.import: configserver:http://configserver.example.com?fail-fast=true&max-attempts=10&max-interval=1500&multiplier=1.2&initial-interval=1100"
   ```

   

7. 配置其他参数

   配置客户端快速失败和连接超时：

   ```yml
   # 1. 默认从 http://localhost:8888 获取配置
   # 2. 如果没有配置 optional: 则 Config Client 连接不到 Config Server 时就会失败
   # 3. import 配置优先于 uri 配置
   # 4. 配置了后就不需要 bootstrap 引导文件
   spring.config.import: "optional:configserver:"
   
   spring.application.name: config-client
   
   spring:
     cloud:
     	config:
         # 客户端配置快速失败
         fail-fast: true
         # 配置重试，需要引入 spring-retry
         retry:
           initialInterval: 1000
           multiplier: 1.1
           maxInterval: 10000
           maxAttempts: 6
         uri: http://localhost:8888
         request-connect-timeout: 3000
         request-read-timeout: 3000
   ```

   

8. 开启 Security

   添加 security 依赖：

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-security</artifactId>
   </dependency>
   ```

   修改配置文件，添加 用户名和密码：

   ```yml
   spring.security.user.name: ${SPRING_SECURITY_USER_NAME:root}
   spring.security.user.password: ${SPRING_SECURITY_USER_PASSWORD:123456}
   ```

   再次查看 test 的值，需要设置用户名和密码：

   ```bash
   $ curl http://root:123456@localhost:8080/test
   hello world
   ```

   

### Git 仓库

#### 服务端应用

1. 使用 spring cli 创建一个 maven 项目

   ```bash
   cd config
   
   spring init \
   --boot-version=3.2.2 \
   --type=maven-project \
   --java-version=8 \
   --name=config-server-git \
   --package-name=com.chensoul.springcloud \
   --groupId=com.chensoul.springcloud \
   --dependencies=cloud-config-server,actuator,security \
   config-server-git
   ```

​	将 spring-boot-starter-parent 版本改为 2.7.18，对应的将 spring-cloud.version 改为 2021.0.9

2. 添加 @EnableConfigServer 注解

   ```java
   @EnableConfigServer
   @SpringBootApplication
   public class ConfigServerGitApplication {
   
   	public static void main(final String[] args) {
   		SpringApplication.run(ConfigServerGitApplication.class, args);
   	}
   
   }
   ```

3. 修改配置文件

   将 application.properties 重命名为 application.yml，并添加如下配置

   ```yaml
   server:
     port: 8888
   
   spring.application.name: config-server-git
   
   spring.cloud.config.server.git.uri: https://github.com/chensoul/spring-cloud-examples
   spring.cloud.config.server.git.search-paths: config-repo
   spring.cloud.config.server.git.default-label: cloud-config
   
   spring.security.user.name: ${SPRING_SECURITY_USER_NAME:root}
   spring.security.user.password: ${SPRING_SECURITY_USER_PASSWORD:123456}
   
   encrypt:
     key: 123456
     
   # WARNING: Exposing all management endpoints over http should only be used during development, must be locked down in production!
   management.endpoint.health.show-details: "ALWAYS"
   management.endpoints.web.exposure.include: "*"
   ```

   


4. 配置认证

   如果是私有仓库，则需要配置认证。

   可以使用用户名密码的方式：

   ```yml
   spring.cloud.config.server.git.username: username
   spring.cloud.config.server.git.password: password
   ```

   或者使用 ssh 私钥，配置方式，请参考 [Git SSH configuration using properties](https://docs.spring.io/spring-cloud-config/docs/3.1.9/reference/html/#_git_ssh_configuration_using_properties)。

   

5. 其他配置参数

   ```yaml
   spring:
     cloud:
       config:
         server:
           git:
             uri: file:${PWD}/config-repo
             skipSslValidation: true
             timeout: 4
             force-pull: true
             deleteUntrackedBranches: true
             refreshRate: 0
             defaultLabel: main
             tryMasterBranch: false
   ```

   

6. 启动应用

#### 客户端应用

1. 在 config-client 项目基础上，修改配置文件

   因为服务端配置文件是在 cloud-config 分区（`spring.cloud.config.server.git.default-label: cloud-config`），故客户端也应该设置分区 `spring.cloud.config.label: cloud-config`：

   ```yml
   # 1. 默认从 http://localhost:8888 获取配置
   # 2. 如果没有配置 optional: 则 Config Client 连接不到 Config Server 时就会失败
   # 3. import 配置优先于 uri 配置
   # 4. 配置了后就不需要 bootstrap 引导文件
   spring.config.import: "optional:configserver:"
   
   spring.application.name: config-client
   
   spring:
     cloud:
       config:
         # 客户端配置快速失败
         fail-fast: true
         # 配置重试，需要引入 spring-retry
         retry:
           initialInterval: 1000
           multiplier: 1.1
           maxInterval: 10000
           maxAttempts: 6
         uri: http://localhost:8888
         label: cloud-config
   
   spring.security.user.name: ${SPRING_SECURITY_USER_NAME:root}
   spring.security.user.password: ${SPRING_SECURITY_USER_PASSWORD:123456}
   
   
   # WARNING: Exposing all management endpoints over http should only be used during development, must be locked down in production!
   management.endpoint.health.show-details: "ALWAYS"
   management.endpoints.web.exposure.include: "*"
   ```

   

2. 重启应用，查看 test 的值

   ```bash
   $ curl http://root:123456@localhost:8080/test
   hello world
   ```

3. 修改 config-client.yml 文件中 test 的值为 "hello world 1111"，并提交到 git 仓库。然后，再次查看 test 的值：

   ```bash
   $ curl http://root:123456@localhost:8080/test
   hello world
   ```

   发现 test 值并没有更新，这时候需要手动更新

4. 手动更新配置

   ```bash
   curl -X POST http://localhost:8080/actuator/refresh
   ```

   再次访问，发现 test 值已修改为 "hello world 1111"：

   ```bash
   $ curl http://root:123456@localhost:8080/test
   hello world 1111
   ```

   
