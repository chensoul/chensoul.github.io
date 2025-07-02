---
title: "[译]使用Spring Boot Actuator公开有用的信息端点"
date: 2023-07-26
slug: spring-boot-info-endpoint
categories: ["spring-boot"]
tags: [spring-boot]
---

在分布式、快节奏的环境中，开发团队通常希望了解他们部署应用程序的时间、部署的应用程序版本、部署的 Git 提交等等。

Spring Boot Actuator 帮助我们监控和管理应用程序。它公开了提供应用程序运行状况、指标和其他相关信息的各种端点。

在本文中，我们将了解如何使用 Spring Boot Actuator 和 Maven/Gradle 构建插件将此类信息添加到我们的项目中。

## 示例代码

本文附有 GitHub 上的工作[代码示例](https://github.com/thombergs/code-examples/tree/master/spring-boot/spring-boot-app-info)。

## 启用 Spring Boot 执行器

Spring Boot Actuator 是 Spring Boot 的一个子项目。在本节中，我们将快速了解如何引导示例项目并启用 `/info` 端点。如果您想了解更多有关 Spring Boot Actuator 的信息，已经有一个很棒的[教程](https://reflectoring.io/exploring-a-spring-boot-app-with-actuator-and-jq/)了。

让我们使用 [Spring Initializr](https://start.spring.io/) 快速创建一个 Spring Boot 项目。我们将需要以下依赖项：

| 依赖性               | 目的                                 |
| -------------------- | ------------------------------------ |
| Spring Boot Actuator | 公开应用程序管理端点，例如 `info` 。 |
| Spring Web           | 启用 Web 应用程序行为。              |

如果有帮助，这里是 [Maven](https://start.spring.io/#!type=maven-project&language=java&platformVersion=2.6.4&packaging=jar&jvmVersion=11&groupId=io.reflectoring&artifactId=demo&name=Demo%20Application&description=Demo%20project%20for%20Spring%20Boot%20Application%20Info&packageName=io.reflectoring.demo&dependencies=web,actuator) 和 [Gradle](https://start.spring.io/#!type=gradle-project&language=java&platformVersion=2.6.4&packaging=jar&jvmVersion=11&groupId=io.reflectoring&artifactId=demo&name=Demo%20Application&description=Demo%20project%20for%20Spring%20Boot%20Application%20Info&packageName=io.reflectoring.demo&dependencies=web,actuator) 中预填充项目的链接。

项目构建后，我们将通过 HTTP 公开内置的 `/info` 端点。默认情况下， `/info` Web 端点处于禁用状态。我们可以通过在 `application.properties` 配置中添加 `management.endpoints.web.exposure.include` 属性来简单地启用它：

```properties
management.endpoints.web.exposure.include=health,info
```

让我们运行 Spring Boot 应用程序并在浏览器中打开 URL `http://localhost:8080/actuator/info` 。目前还看不到任何有用的东西，因为我们仍然需要进行一些配置更改。在下一节中，我们将了解如何在此响应中添加信息丰富的构建信息。

> #### 保护端点
>
> 如果您公开公开端点，请确保适当[保护](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.endpoints.security)它们。我们不应在不知情的情况下泄露任何敏感信息。

## Spring Boot 应用程序信息

Spring 从应用程序上下文中定义的各种 [InfoContributor](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/actuate/info/InfoContributor.html) bean 收集有用的应用程序信息。下面是默认 `InfoContributor` beans 的摘要：

| ID      | Bean Name                    | 用法                                               |
| ------- | ---------------------------- | -------------------------------------------------- |
| `build` | `BuildInfoContributor`       | 公开构建信息。                                     |
| `env`   | `EnvironmentInfoContributor` | 公开 `Environment` 中名称以 `info.` 开头的任何属性 |
| `git`   | `GitInfoContributor`         | 公开 Git 相关信息。                                |
| `java`  | `JavaInfoContributor`        | 公开 Java 运行时信息。                             |

**默认情况下， `env` 和 `java` 贡献者被禁用。**

首先，我们将通过在 `application.properties` 中添加以下键值对来启用 `java` 贡献者：

```properties
management.info.java.enabled=true
```

让我们重新运行该应用程序。如果我们在浏览器中再次打开执行器 `/info` 端点，我们会得到如下输出：

```json
{
  "java": {
    "vendor": "Eclipse Adoptium",
    "version": "11.0.14",
    "runtime": {
      "name": "OpenJDK Runtime Environment",
      "version": "11.0.14+9"
    },
    "jvm": {
      "name": "OpenJDK 64-Bit Server VM",
      "vendor": "Eclipse Adoptium",
      "version": "11.0.14+9"
    }
  }
}
```

根据安装的 Java 版本，您可能会看到不同的值。

现在，是时候显示环境变量了。 Spring 会选取属性名称以 `info` 开头的任何环境变量。要查看实际效果，让我们在 `application.properties` 文件中添加以下属性：

```properties
management.info.env.enabled=true
info.app.website=reflectoring.io
```

重新启动应用程序后，我们将开始看到添加到执行器 `info` 端点的以下信息：

```json
{
  "app": {
    "website": "reflectoring.io"
  }
}
```

请随意添加您想要的任意数量的信息变量:)

在以下部分中，我们将了解如何添加 Git 和应用程序构建特定信息。

## 添加构建信息

添加有用的[构建信息](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.build.generate-info)有助于快速识别构建工件名称、版本、创建时间等。它可以方便地检查团队是否部署了应用程序的相关版本。 Spring Boot 允许使用 Maven 或 Gradle 构建插件轻松添加此内容。

### 使用 Maven 插件

Spring Boot Maven 插件捆绑了许多有用的功能，例如创建可执行 jar 或 war 存档、运行应用程序等。它还提供了一种添加应用程序构建信息的方法。

如果存在有效的 `META-INF/build-info.properties` 文件，Spring Boot Actuator 将显示构建详细信息。 Spring Boot Maven 插件的 `build-info` 目标是创建此文件。

如果您使用 Spring Initializr 引导项目，则默认情况下该插件将出现在 `pom.xml` 中。我们只需添加 `build-info` 执行目标，如下所示：

```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <version>2.6.4</version>
  <executions>
    <execution>
      <goals>
        <goal>build-info</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

如果我们现在运行命令 `./mvnw spring-boot:run` （对于 Linux/macOS）或 `mvnw.bat spring-boot:run` （对于 Windows），所需的文件将在 `target/classes/META-INF/build-info.properties` 中创建。

**文件内容将与此类似：**

```properties
build.artifact=spring-boot-build-info
build.group=io.reflectoring
build.name=spring-boot-build-info
build.time=2022-03-06T05\:53\:45.236Z
build.version=0.0.1-SNAPSHOT
```

我们还可以使用 `additionalProperties` 属性将自定义属性添加到此列表：

```xml
<execution>
  <goals>
    <goal>build-info</goal>
  </goals>
  <configuration>
    <additionalProperties>
      <custom.key1>value1</custom.key1>
      <custom.key2>value2</custom.key2>
    </additionalProperties>
  </configuration>
</execution>
```

如果我们现在运行应用程序并在浏览器中打开 `http://localhost:8080/actuator/info` 端点，我们将看到类似于以下内容的响应：

```json
{
  "build": {
    "custom": {
      "key2": "value2",
      "key1": "value1"
    },
    "version": "0.0.1-SNAPSHOT",
    "artifact": "spring-boot-build-info",
    "name": "spring-boot-build-info",
    "time": "2022-03-06T06:34:30.306Z",
    "group": "io.reflectoring"
  }
}
```

如果您想排除任何可以使用 `excludeInfoProperties` 配置的属性。让我们看看如何排除 `artifact` 属性：

```xml
<configuration>
  <excludeInfoProperties>
    <infoProperty>artifact</infoProperty>
  </excludeInfoProperties>
</configuration>
```

请参阅 Spring Boot [官方文档](https://docs.spring.io/spring-boot/docs/current/maven-plugin/reference/htmlsingle/#goals-build-info)了解更多信息。

现在，是时候看看我们如何使用 Spring Boot Gradle 插件实现相同的输出了。

### 使用 Gradle 插件

添加构建信息的最简单方法是使用插件 DSL。在 `build.gradle` 文件中，我们需要添加以下块：

```gradle
springBoot {
  buildInfo()
}
```

如果我们现在同步 Gradle 项目，我们可以看到一个新任务 `bootBuildInfo` 可供使用。运行该任务将生成带有构建信息的类似 `build/resources/main/META-INF/build-info.properties` 文件（源自项目）。使用 DSL，我们可以自定义现有值或添加新属性：

```gradle
springBoot {
  buildInfo {
    properties {
      name = 'Sample App'
      additional = [
        'customKey': 'customValue'
      ]
    }
  }
}
```

是时候使用 `./gradlew bootRun` （对于 macOS/Linux）或 `gradlew.bat bootRun` （对于 Windows）命令运行应用程序了。应用程序运行后，我们可以在浏览器中打开 `http://localhost:8080/actuator/info` 端点并找到响应：

```json
{
  "build": {
    "customKey": "customValue",
    "version": "0.0.1-SNAPSHOT",
    "artifact": "spring-boot-build-info",
    "name": "Sample App",
    "time": "2022-03-06T09:11:53.380Z",
    "group": "io.reflectoring"
  }
}
```

我们可以通过将其值设置为 `null` 来从生成的构建信息中排除任何默认属性。例如：

```gradle
properties {
  group = null
}
```

想了解更多关于该插件的信息，可以参考 Spring Boot [官方文档](https://docs.spring.io/spring-boot/docs/current/gradle-plugin/reference/htmlsingle/#integrating-with-actuator)。

## 添加 Git 信息

[Git 信息](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.build.generate-git-info)可以方便地快速识别生产中是否存在相关代码或者分布式部署是否与预期同步。 Spring Boot 可以使用 Maven 和 Gradle 插件轻松地将 Git 属性包含在 Actuator 端点中。

使用这个插件我们可以生成一个 `git.properties` 文件。此文件的存在将自动配置 [GitProperties](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/info/GitProperties.html) bean，供 [GitInfoContributor](https://docs.spring.io/spring-boot/docs/current/api/org/springframework/boot/actuate/info/GitInfoContributor.html) bean 使用来整理相关信息。

**默认情况下，将公开以下信息：**

- `git.branch`
- `git.commit.id`
- `git.commit.time`

以下管理应用程序属性控制 Git 相关信息：

| 应用属性                            | 目的                                   |
| ----------------------------------- | -------------------------------------- |
| `management.info.git.enabled=false` | 完全从 `info` 端点禁用 Git 信息        |
| `management.info.git.mode=full`     | 显示 `git.properties` 文件中的所有属性 |

### 使用 Maven 插件

[Maven Git Commit ID 插件](https://github.com/git-commit-id/git-commit-id-maven-plugin)通过 `spring-boot-starter-parent` pom.xml 进行管理。要使用它，我们必须编辑 `pom.xml` 如下：

```xml
<plugin>
  <groupId>pl.project13.maven</groupId>
  <artifactId>git-commit-id-plugin</artifactId>
</plugin>
```

如果我们运行该项目并在浏览器中打开 `/actuator/info` 端点，它将返回 Git 相关信息：

```json
{
  "git": {
    "branch": "main",
    "commit": {
      "id": "5404bdf",
      "time": "2022-03-06T10:34:16Z"
    }
  }
}
```

我们还可以检查 `target/classes/git.properties` 下生成的文件。这对我来说是这样的：

```text
#Generated by Git-Commit-Id-Plugin
git.branch=main
git.build.host=mylaptop
git.build.time=2022-03-06T23\:22\:16+0530
git.build.user.email=user@email.com
git.build.user.name=user
git.build.version=0.0.1-SNAPSHOT
git.closest.tag.commit.count=
git.closest.tag.name=
git.commit.author.time=2022-03-06T22\:46\:56+0530
git.commit.committer.time=2022-03-06T22\:46\:56+0530
git.commit.id=e9fa20d4914367c1632e3a0eb8ca4d2f32b31a89
git.commit.id.abbrev=e9fa20d
git.commit.id.describe=e9fa20d-dirty
git.commit.id.describe-short=e9fa20d-dirty
git.commit.message.full=Update config
git.commit.message.short=Update config
git.commit.time=2022-03-06T22\:46\:56+0530
git.commit.user.email=saikat@email.com
git.commit.user.name=Saikat
git.dirty=true
git.local.branch.ahead=NO_REMOTE
git.local.branch.behind=NO_REMOTE
git.remote.origin.url=Unknown
git.tags=
git.total.commit.count=2
```

这个插件带有很多[配置](https://github.com/git-commit-id/git-commit-id-maven-plugin/blob/master/docs/using-the-plugin.md)选项。例如，要包含/排除特定属性，我们可以添加 `configuration` 部分，如下所示：

```xml
<configuration>
  <excludeProperties>
    <excludeProperty>time</excludeProperty>
  </excludeProperties>
  <includeOnlyProperties>
    <property>git.commit.id</property>
  </includeOnlyProperties>
</configuration>
```

它将生成如下输出：

```json
{
  "git": {
    "commit": {
      "id": "5404bdf"
    }
  }
}
```

> 译者备注：
>
> 使用 4.9.10 版本时，如果想指定输出内容，需要这样设置：
>
> ```xml
> <plugin>
>    <groupId>pl.project13.maven</groupId>
>    <artifactId>git-commit-id-plugin</artifactId>
>    <version>4.9.10</version>
>    <executions>
>        <execution>
>            <goals>
>                <goal>revision</goal>
>            </goals>
>        </execution>
>    </executions>
>    <configuration>
>        <generateGitPropertiesFile>true</generateGitPropertiesFile>
>        <dateFormat>yyyy-MM-dd HH:mm:ss</dateFormat>
>        <dateFormatTimeZone>GMT+8</dateFormatTimeZone>           <includeOnlyProperties>git.branch,git.build.time,git.build.version,git.commit.id,git.commit.time,git.commit.message.full</includeOnlyProperties>
>    </configuration>
> </plugin>
> ```

现在让我们看看 Gradle 用户可以使用哪些选项。

### 使用 Gradle 插件

在 `build.gradle` 中，我们将添加 `gradle-git-properties` 插件：

```gradle
plugins {
  id 'com.gorylenko.gradle-git-properties' version '2.4.0'
}
```

现在让我们构建 Gradle 项目。我们可以看到 `build/resources/main/git.properties` 文件已创建。并且，执行器 `info` 端点将显示相同的数据：

```json
{
  "git": {
    "branch": "main",
    "commit": {
      "id": "5404bdf",
      "time": "2022-03-06T10:34:16Z"
    }
  }
}
```

该插件也提供了多种使用属性 `gitProperties` 配置输出的方法。例如，我们通过添加以下内容来限制要出现的键：

```gradle
gitProperties {
  keys = ['git.commit.id']
}
```

重新运行应用程序现在将显示有限的 Git 信息：

```json
{
  "git": {
    "commit": {
      "id": "5404bdf"
    }
  }
}
```

## 结论

在本文中，我们学习了如何使用 Spring Actuator 来公开有关我们应用程序的相关信息。我们了解了如何将有关构建、环境、Git 和 Java 环境的信息添加到 Actuator `/info` 端点。我们还研究了如何通过 Maven/Gradle 构建插件配置和控制所有这些信息。

您可以使用 GitHub 上的[代码](https://github.com/thombergs/code-examples/tree/master/spring-boot/spring-boot-app-info)来尝试一个完整的应用程序来说明这些想法。

原文链接：[https://reflectoring.io/spring-boot-info-endpoint/](https://reflectoring.io/spring-boot-info-endpoint/)
