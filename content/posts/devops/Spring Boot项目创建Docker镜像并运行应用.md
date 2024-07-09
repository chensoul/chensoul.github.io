---
title: "Spring Boot项目创建Docker镜像并运行应用"
date: 2024-06-06T12:00:00+08:00
slug: spring-boot-docker-image
draft: false
categories: ["devops"]
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

   如果 target 目录下存在多个 jar 文件，则可以在 dockerfile 同级添加一个 .dockerignore 文件忽略掉 `*-sources.jar` ：

   ```bash
   # Include any files or directories that you don't want to be copied to your
   # container here (e.g., local build artifacts, temporary files, etc.).
   #
   # For more help, visit the .dockerignore file reference guide at
   # https://docs.docker.com/go/build-context-dockerignore/
   
   **/.classpath
   **/.dockerignore
   **/.env
   **/.git
   **/.gitignore
   **/.project
   **/.settings
   **/.toolstarget
   **/.vs
   **/.vscode
   **/.next
   **/.cache
   **/*.*proj.user
   **/*.dbmdl
   **/*.jfm
   **/charts
   **/docker-compose*
   **/compose.y*ml
   **/target/*-sources.jar
   **/Dockerfile*
   **/node_modules
   **/npm-debug.log
   **/obj
   **/secrets.dev.yaml
   **/values.dev.yaml
   **/vendor
   LICENSE
   README.md
   ```


1. **构建 Docker 镜像**
   在项目根目录下运行以下命令，构建 Docker 镜像:

   ```bash
   mvn clean package
   docker build -t my-spring-boot-app .
   ```

   这将先使用 Maven 编译项目，然后使用 Dockerfile 构建名为 `my-spring-boot-app` 的 Docker 镜像。

2. **运行 Docker 容器**
   使用以下命令启动 Docker 容器:

   ```
   docker run -p 8080:8080 my-spring-boot-app
   ```

   这将使用刚刚构建的 `my-spring-boot-app` 镜像启动一个容器，并将容器的 8080 端口映射到宿主机的 8080 端口。

3. 其他镜像

   jhipster-lite 提供的 [dockerfile](https://github.com/jhipster/jhipster-lite/blob/main/Dockerfile)：

   ```dockerfile
   FROM openjdk:21-slim AS build
   COPY . /code/jhipster-app/
   WORKDIR /code/jhipster-app/
   RUN chmod +x mvnw && ./mvnw package -B -DskipTests -Dmaven.javadoc.skip=true -Dmaven.source.skip -Ddevelocity.cache.remote.enabled=false
   RUN mv /code/jhipster-app/target/*-exec.jar /code/
   
   FROM openjdk:21-slim
   COPY --from=build /code/*.jar /code/
   RUN \
       # configure the "jhipster" user
       groupadd jhipster && \
       useradd jhipster -s /bin/bash -m -g jhipster -G sudo && \
       echo 'jhipster:jhipster'|chpasswd
   ENV SPRING_OUTPUT_ANSI_ENABLED=ALWAYS \
       JAVA_OPTS=""
   USER jhipster
   CMD java ${JAVA_OPTS} -Djava.security.egd=file:/dev/./urandom -jar /code/*.jar
   EXPOSE 7471

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

## 使用 Docker init 创建 Dockerfile

参考 [Containerize a Java application](https://docs.docker.com/language/java/containerize/)，首先需要安装 docker desktop，这样才能使用 docker init 命令。

```bash
$ git clone https://github.com/spring-projects/spring-petclinic.git

$ cd spring-petclinic

$ docker init
Welcome to the Docker Init CLI!

This utility will walk you through creating the following files with sensible defaults for your project:
  - .dockerignore
  - Dockerfile
  - compose.yaml
  - README.Docker.md

Let's get started!

WARNING: The following Docker files already exist in this directory:
  - docker-compose.yml
? Do you want to overwrite them? Yes
? What application platform does your project use? Java
? What's the relative directory (with a leading .) for your app? ./src
? What version of Java do you want to use? 17
? What port does your server listen on? 8080
```

生成的 Dockerfile 文件如下：

```dockerfile
# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

################################################################################

# Create a stage for resolving and downloading dependencies.
FROM eclipse-temurin:17-jdk-jammy as deps

WORKDIR /build

# Copy the mvnw wrapper with executable permissions.
COPY --chmod=0755 mvnw mvnw
COPY .mvn/ .mvn/

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.m2 so that subsequent builds don't have to
# re-download packages.
RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    --mount=type=cache,target=/root/.m2 ./mvnw dependency:go-offline -DskipTests

################################################################################

# Create a stage for building the application based on the stage with downloaded dependencies.
# This Dockerfile is optimized for Java applications that output an uber jar, which includes
# all the dependencies needed to run your app inside a JVM. If your app doesn't output an uber
# jar and instead relies on an application server like Apache Tomcat, you'll need to update this
# stage with the correct filename of your package and update the base image of the "final" stage
# use the relevant app server, e.g., using tomcat (https://hub.docker.com/_/tomcat/) as a base image.
FROM deps as package

WORKDIR /build

COPY ./src src/
RUN --mount=type=bind,source=pom.xml,target=pom.xml \
    --mount=type=cache,target=/root/.m2 \
    ./mvnw package -DskipTests && \
    mv target/$(./mvnw help:evaluate -Dexpression=project.artifactId -q -DforceStdout)-$(./mvnw help:evaluate -Dexpression=project.version -q -DforceStdout).jar target/app.jar

################################################################################

# Create a stage for extracting the application into separate layers.
# Take advantage of Spring Boot's layer tools and Docker's caching by extracting
# the packaged application into separate layers that can be copied into the final stage.
# See Spring's docs for reference:
# https://docs.spring.io/spring-boot/docs/current/reference/html/container-images.html
FROM package as extract

WORKDIR /build

RUN java -Djarmode=layertools -jar target/app.jar extract --destination target/extracted

################################################################################

# Create a new stage for running the application that contains the minimal
# runtime dependencies for the application. This often uses a different base
# image from the install or build stage where the necessary files are copied
# from the install stage.
#
# The example below uses eclipse-turmin's JRE image as the foundation for running the app.
# By specifying the "17-jre-jammy" tag, it will also use whatever happens to be the
# most recent version of that tag when you build your Dockerfile.
# If reproducability is important, consider using a specific digest SHA, like
# eclipse-temurin@sha256:99cede493dfd88720b610eb8077c8688d3cca50003d76d1d539b0efc8cca72b4.
FROM eclipse-temurin:17-jre-jammy AS final

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/go/dockerfile-user-best-practices/
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
USER appuser

# Copy the executable from the "package" stage.
COPY --from=extract build/target/extracted/dependencies/ ./
COPY --from=extract build/target/extracted/spring-boot-loader/ ./
COPY --from=extract build/target/extracted/snapshot-dependencies/ ./
COPY --from=extract build/target/extracted/application/ ./

EXPOSE 8080

ENTRYPOINT [ "java", "org.springframework.boot.loader.launch.JarLauncher" ]
```

这个Dockerfile文件是用于构建和运行Java应用程序的Docker镜像。它使用多个阶段（stages）来完成不同的任务。

首先，使用`eclipse-temurin:17-jdk-jammy`作为基础镜像创建一个名为`deps`的阶段。在这个阶段，工作目录被设置为`/build`，然后复制了一个可执行的`mvnw`包装器和`.mvn/`目录。接下来，通过执行`./mvnw dependency:go-offline -DskipTests`命令下载项目的依赖项，并利用Docker的缓存机制将它们挂载到`/root/.m2`目录中。

接下来，使用`deps`阶段作为基础创建一个名为`package`的阶段。在这个阶段中，将项目的源代码（`./src`目录）复制到工作目录，并执行`./mvnw package -DskipTests`命令来构建应用程序的可执行JAR文件。最后，将构建生成的JAR文件重命名为`app.jar`并放置在`target/`目录下。

然后，使用`package`阶段作为基础创建一个名为`extract`的阶段。在这个阶段中，使用Spring Boot的层工具和Docker的缓存机制，将打包的应用程序提取到一个单独的层中。这样可以实现在最终阶段中复制这个层，并利用Docker的缓存机制避免重复构建。

最后，使用`eclipse-temurin:17-jre-jammy`作为基础镜像创建一个名为`final`的阶段。在这个阶段中，首先通过`adduser`命令创建一个非特权用户，用于运行应用程序。然后，可以将之前阶段中提取的应用程序层复制到最终阶段中，并设置用户和工作目录。

通过使用多个阶段，可以充分利用Docker的缓存机制，减少重复构建的时间，并生成一个最终的镜像，其中只包含运行应用程序所需的最小依赖项和文件。

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

使用 layer 之后，[Spring 官方文档](https://docs.spring.io/spring-boot/reference/packaging/container-images/dockerfiles.html)中提供dockerfile如下：

```dockerfile
FROM bellsoft/liberica-runtime-container:jre-17-cds-slim-glibc as builder
WORKDIR /builder
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --destination extracted

FROM bellsoft/liberica-runtime-container:jre-17-cds-slim-glibc
WORKDIR /application
COPY --from=builder /builder/extracted/dependencies/ ./
COPY --from=builder /builder/extracted/spring-boot-loader/ ./
COPY --from=builder /builder/extracted/snapshot-dependencies/ ./
COPY --from=builder /builder/extracted/application/ ./
ENTRYPOINT ["java", "-jar", "application.jar"]
```

参考 Docker init 创建的 Dockerfile 文件如下：

```dockerfile
# syntax=docker/dockerfile:1

################################################################################
# Create a stage for extracting the application into separate layers.
# Take advantage of Spring Boot's layer tools and Docker's caching by extracting
# the packaged application into separate layers that can be copied into the final stage.
# See Spring's docs for reference:
# https://docs.spring.io/spring-boot/docs/current/reference/html/container-images.html
FROM eclipse-temurin:21-jre-jammy as extract
WORKDIR /build
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
RUN java -Djarmode=layertools -jar app.jar extract --layers --destination extracted

################################################################################
FROM eclipse-temurin:21-jre-jammy as final
WORKDIR /app

# Create a non-privileged user that the app will run under.
# See https://docs.docker.com/go/dockerfile-user-best-practices/
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

COPY --from=extract build/extracted/dependencies/ ./
COPY --from=extract build/extracted/spring-boot-loader/ ./
COPY --from=extract build/extracted/snapshot-dependencies/ ./
COPY --from=extract build/extracted/application/ ./

EXPOSE 8080

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```



## 使用 Spring Boot Gradle 插件

- 在项目的 `build.gradle` 文件中添加 `spring-boot-gradle-plugin` 插件配置。
- 插件会自动生成 Dockerfile 并构建 Docker 镜像。
- 使用 `./gradlew bootBuildImage` 命令即可构建并推送镜像。

## 参考文章

- [使用Spring Boot创建docker image](https://www.cnblogs.com/flydean/p/13824496.html)
