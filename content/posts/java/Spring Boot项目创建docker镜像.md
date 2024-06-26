---
title: "Spring Boot项目创建docker镜像"
date: 2024-06-06T12:00:00+08:00
slug: spring-boot-docker-image
draft: false
categories: ["Java"]
tags: [ spring-boot,docker]
---



## 手动创建 Dockerfile

1. **添加 Dockerfile**

   在您的 Spring Boot 项目根目录下创建一个名为 `Dockerfile` 的文件，并添加以下内容:

   ```docker
   # 使用 OpenJDK 11 作为基础镜像
   FROM openjdk:11
   
   # 设置工作目录
   WORKDIR /app
   
   # 将 JAR 文件复制到容器中
   COPY target/*.jar app.jar
   
   # 暴露 8080 端口
   EXPOSE 8080
   
   # 设置容器启动时执行的命令
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

   这个 Dockerfile 将使用 OpenJDK 11 作为基础镜像，将编译后的 JAR 文件复制到容器中，并在容器启动时执行 `java -jar app.jar` 命令。

   >**使用 Google Distroless 基础镜像**:
   >
   >- Distroless 基础镜像是一种精简的 Linux 发行版,只包含应用程序运行所需的最小依赖项。
   >- 在 `Dockerfile` 中使用 `gcr.io/distroless/java:11` 作为基础镜像可以大幅减小最终镜像的体积。

   如果 target 目录下存在多个 jar 文件，则可以在 dockerfile 同级添加一个 .dockerignore 文件忽略掉：

   ```bash
   target/*-sources.jar
   ```

   

2. **构建 Docker 镜像**
   在项目根目录下运行以下命令，构建 Docker 镜像:

   ```bash
   mvn clean package
   docker build -t my-spring-boot-app .
   ```

   这将先使用 Maven 编译项目，然后使用 Dockerfile 构建名为 `my-spring-boot-app` 的 Docker 镜像。

3. **运行 Docker 容器**
   使用以下命令启动 Docker 容器:

   ```
   docker run -p 8080:8080 my-spring-boot-app
   ```

   这将使用刚刚构建的 `my-spring-boot-app` 镜像启动一个容器，并将容器的 8080 端口映射到宿主机的 8080 端口。

4. 其他镜像

   jhipster提供的 dockerfile：

   ```dockerfile
   FROM openjdk:21-slim
   COPY . /code/jhipster-app/
   RUN \
       cd /code/jhipster-app/ && \
       rm -Rf target node_modules && \
       chmod +x mvnw && \
       sleep 1 && \
       ./mvnw package -DskipTests && \
       mv /code/jhipster-app/target/*.jar /code/ && \
       rm -Rf /code/jhipster-app/ /root/.m2 /root/.cache /tmp/* /var/tmp/*
   
   ENV SPRING_OUTPUT_ANSI_ENABLED=ALWAYS \
       JHIPSTER_SLEEP=0 \
       JAVA_OPTS=""
   CMD echo "The application will start in ${JHIPSTER_SLEEP}s..." && \
       sleep ${JHIPSTER_SLEEP} && \
       java ${JAVA_OPTS} -Djava.security.egd=file:/dev/./urandom -jar /code/*.jar
   EXPOSE 8080

## 使用 Maven 镜像从源码运行

1. 在项目根目录创建一个 docker-compose.yml文件：

```yml
services:
  app:
    image: maven:3.9.6-eclipse-temurin-21
    volumes:
      - .:/usr/src/workdir
      - ~/.m2:/root/.m2
    working_dir: /usr/src/workdir
    command: "mvn clean -DskipTests spring-boot:run"
    healthcheck:
      test: [ 'CMD-SHELL','curl --fail --silent localhost:8080/actuator/health | grep UP || exit 1' ]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 30s
```

2. 启动容器

```bash
docker-compose app -f docker-compose.yml up -d
```



## 使用 Maven 插件

### Jib

Jib 是 Google 开发的一款容器镜像构建工具，可以与 Maven 或 Gradle 集成使用。

1. 在项目的 `pom.xml` 文件中添加 Jib Maven 插件:

```xml
<build>
  <plugins>
    <plugin>
      <groupId>com.google.cloud.tools</groupId>
      <artifactId>jib-maven-plugin</artifactId>
      <version>3.2.1</version>
      <configuration>
        <from>
            <image>openjdk:11-jdk-slim</image>
        </from>
        <to>
            <image>my-spring-boot-app</image>
            <tags>
                <tag>latest</tag>
                <tag>${project.version}</tag>
            </tags>
        </to>
        <container>
            <mainClass>com.example.MySpringBootApp</mainClass>
            <ports>
                <port>8080</port>
            </ports>
        </container>
      </configuration>
    </plugin>
  </plugins>
</build>
```

2. 如果使用 Gradle，在 `build.gradle` 文件中添加 Jib Gradle 插件:

```groovy
plugins {
    id 'com.google.cloud.tools.jib' version '3.2.1'
}

jib {
    from {
        image = 'openjdk:11-jdk-slim'
    }
    to {
        image = 'my-spring-boot-app'
        tags = ['latest', project.version]
    }
    container {
        mainClass = 'com.example.MySpringBootApp'
        ports = ['8080']
    }
}
```

3. 在上述配置中，您需要修改以下内容:

- `from.image`：指定用于构建镜像的基础镜像。
- `to.image`：指定要构建的镜像名称。
- `to.tags`：指定要添加到镜像的标签，比如 `latest` 和项目版本号。
- `container.mainClass`：指定应用程序的主类。
- `container.ports`：指定容器需要暴露的端口。

4. 运行构建命令:

- 对于 Maven 项目：`mvn compile jib:build`
- 对于 Gradle 项目：`./gradlew jibBuild`

### docker-maven-plugin

1. 在 pom.xml 中添加如下配置:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>io.fabric8</groupId>
            <artifactId>docker-maven-plugin</artifactId>
            <version>0.40.2</version>
            <configuration>
                <images>
                    <image>
                        <name>my-spring-boot-app</name>
                        <build>
                            <from>openjdk:11-jdk-slim</from>
                            <assembly>
                                <descriptorRef>artifact</descriptorRef>
                            </assembly>
                            <entryPoint>
                                <exec>
                                    <arg>java</arg>
                                    <arg>-jar</arg>
                                    <arg>/maven/${project.build.finalName}.jar</arg>
                                </exec>
                            </entryPoint>
                        </build>
                    </image>
                </images>
            </configuration>
        </plugin>
    </plugins>
</build>
```

2. 运行 `mvn docker:build` 命令构建镜像。

### Spotify Docker Maven Plugin

1. 在 pom.xml 中添加如下配置:

```xml
<build>
    <plugins>
        <plugin>
            <groupId>com.spotify</groupId>
            <artifactId>dockerfile-maven-plugin</artifactId>
            <version>1.4.13</version>
            <configuration>
                <repository>my-spring-boot-app</repository>
                <tag>${project.version}</tag>
                <buildArgs>
                    <JAR_FILE>${project.build.finalName}.jar</JAR_FILE>
                </buildArgs>
            </configuration>
        </plugin>
    </plugins>
</build>
```

2. 运行 `mvn dockerfile:build` 命令构建镜像。

## 使用 Spring Boot Maven 插件

### 使用 Buildpacks

Spring Boot在2.3.0之后，引入了Cloud Native 的buildpacks，通过这个工具，我们可以非常非常方便的创建docker image。

在Maven和Gradle中，Spring Boot引入了新的phase： `spring-boot:build-image`

>**使用 Buildpacks 构建镜像**:
>
>- Buildpacks 是一种自动化的构建过程,可以根据应用程序源码生成 Docker 镜像。
>- 可以使用 Cloud Native Buildpacks 或 Heroku Buildpacks 来构建 Spring Boot 应用的 Docker 镜像。
>- 运行 `pack build my-spring-boot-app --builder gcr.io/buildpacks/builder:v1` 即可构建镜像。

1. 在项目的 `pom.xml` 文件中添加 `spring-boot-maven-plugin` 插件配置。

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <configuration>
        <image>
            <name>my-spring-boot-app</name>
            <createdDate>${maven.build.timestamp}</createdDate>
        </image>
    </configuration>
</plugin>
```

2. 构建镜像

```bash
mvn spring-boot:build-image
```



### 使用 Layered Jar

如果你不想使用Cloud Native Buildpacks，还是想使用传统的Dockerfile。 没关系，SpringBoot为我们提供了独特的分层jar包系统。

怎么开启呢？ 我们需要在POM文件中加上下面的配置：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <configuration>
                <layers>
                    <enabled>true</enabled>
                </layers>
            </configuration>
        </plugin>
    </plugins>
</build>
```

使用 layer 之后，dockerfile如下：

```dockerfile
FROM openjdk:21-ea-21-oraclelinux8 AS builder
WORKDIR extracted
COPY target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract && rm app.jar

FROM openjdk:21-ea-21-oraclelinux8
WORKDIR app
COPY --from=builder extracted/dependencies/ ./
COPY --from=builder extracted/spring-boot-loader/ ./
COPY --from=builder extracted/snapshot-dependencies/ ./
COPY --from=builder extracted/application/ ./

EXPOSE 8080

# spring boot 2 -> org.springframework.boot.loader.JarLauncher
# spring boot 3 -> org.springframework.boot.loader.launch.JarLauncher
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```



## 使用 Spring Boot Gradle 插件

- 在项目的 `build.gradle` 文件中添加 `spring-boot-gradle-plugin` 插件配置。
- 插件会自动生成 Dockerfile 并构建 Docker 镜像。
- 使用 `./gradlew bootBuildImage` 命令即可构建并推送镜像。

## 参考文章

- [使用Spring Boot创建docker image](https://www.cnblogs.com/flydean/p/13824496.html)
