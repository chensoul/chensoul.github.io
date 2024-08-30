---
title: "2023-12-20｜Maven配置继承和生命周期、源码运行Nacos 2.3.0控制台"
date: 2023-12-20
slug: til
categories: ["Review"]
tags: [maven,nacos]
---

Today I Learned. 今天分享内容：Maven配置继承和生命周期、源码运行Nacos 2.3.0控制台

## Maven 相关

### Maven配置继承

以下是一些常见的POM节点，在子项目中可以继承或覆盖父项目的配置：

- groupId（项目组ID）：如果在子项目中未定义groupId，则将继承父项目的groupId。

- version（项目版本）：如果在子项目中未定义version，则将继承父项目的version。

- properties（属性）：子项目可以继承父项目的属性定义，并在子项目中使用相同的属性。

- dependencies（依赖项）：子项目可以继承父项目的依赖项配置，包括依赖的groupId、artifactId和version等信息。

- dependencyManagement（依赖管理）：在父项目的dependencyManagement节点中定义的依赖版本可以被子项目继承和使用。

- build（构建配置）：子项目可以继承父项目的构建配置，包括插件配置、构建目录、资源目录等。子项目可以覆盖或添加额外的构建配置。

- reporting（报告配置）：子项目可以继承父项目的报告配置，包括报告插件的配置信息。

- repositories（仓库配置）：子项目可以继承父项目的仓库配置，用于从指定的仓库解析依赖。

- scm（版本控制配置）：子项目可以继承父项目的 scm 节点中的配置，包括版本控制系统的 URL、连接器、标签等信息。

- issueManagement（问题管理配置）：子项目可以继承父项目的 issueManagement 节点中的配置，包括问题跟踪系统的 URL、连接器等信息。

- organization（组织配置）：子项目可以继承父项目的 organization 节点中的配置，包括组织的名称、URL 等信息。

- developers（开发者配置）：子项目可以继承父项目的 developers 节点中的配置，包括开发者的姓名、邮箱等信息。

- licenses（许可证配置）：子项目可以继承父项目的 licenses 节点中的配置，包括许可证的名称、URL、分发方式等信息。

  

`inceptionYear`和`url`这两个节点在 Maven 的 POM 文件中无法被子项目继承。

- `inceptionYear`：这个节点用于指定项目的初始年份。它通常用于提供项目的创建或开始日期，但它不会被子项目继承。每个子项目需要在自己的 POM 文件中显式定义自己的`inceptionYear`。
- `url`：这个节点用于指定项目的URL地址，例如项目的主页或版本控制仓库的URL。与`inceptionYear`类似，`url`节点也不会被子项目继承。每个子项目需要在自己的 POM 文件中显式定义自己的`url`。

这些节点通常是项目特定的信息，不具备被继承的属性，因此每个子项目都需要自行定义这些节点，以提供自己独特的项目起始年份和URL地址。



### Maven的生命周期

Maven的标准生命周期包括三个主要的生命周期：
1. Clean生命周期：用于清理项目构建产生的输出，包括删除生成的目录和文件。
  - clean：清理项目，删除生成的目录和文件。
2. Default生命周期：用于构建项目的核心生命周期，涵盖了项目的编译、测试、打包、部署等主要阶段。
  - validate：验证项目是否正确且所有必要信息可用。
  - compile：编译项目的源代码。
  - test：运行项目的单元测试。
  - package：将编译后的代码打包成可分发的格式，例如JAR、WAR。
  - install：将打包的项目安装到本地仓库，供其他项目使用。
  - deploy：将最终的包复制到远程仓库，供其他开发人员和项目使用。
3. Site生命周期：用于生成项目的站点文档。
  - site：生成项目的站点文档。
  - site-deploy：将生成的站点文档部署到远程服务器。



完整的生命周期：

- validate：验证项目是否正确且所有必要信息可用。
- initialize：初始化构建环境，例如设置构建属性和加载父POM。
- generate-sources：生成项目的源代码，例如通过处理注解或其他生成代码的工具。
- process-sources：处理项目的源代码，例如对源代码进行过滤或转换。
- generate-resources：生成项目的资源文件，例如拷贝资源文件到目标目录。
- process-resources：处理项目的资源文件，例如过滤资源文件的占位符。
- compile：编译项目的源代码，将源代码编译为字节码文件（.class文件）。
- process-classes：对编译后的类文件进行额外的处理，例如生成额外的资源文件。
- generate-test-sources：生成项目的测试源代码，例如通过处理注解或其他生成代码的工具。
- process-test-sources：处理项目的测试源代码，例如对测试源代码进行过滤或转换。
- generate-test-resources：生成项目的测试资源文件，例如拷贝测试资源文件到目标目录。
- process-test-resources：处理项目的测试资源文件，例如过滤测试资源文件的占位符。
- test-compile：编译项目的测试源代码，将测试源代码编译为字节码文件。
- process-test-classes：对编译后的测试类文件进行额外的处理。
- test：运行项目的单元测试。
- prepare-package：准备打包阶段的相关工作，例如生成额外的文件或资源。
- package：将项目打包成可分发的格式，例如JAR、WAR等。
- pre-integration-test：在集成测试之前执行的一些准备工作。
- integration-test：运行项目的集成测试。
- post-integration-test：在集成测试之后执行的一些清理工作。
- verify：验证项目的完整性，例如对生成的报告进行检查。
- install：将项目的构件安装到本地仓库，供本地其他项目使用。
- deploy：将项目的构件复制到远程仓库，供其他开发人员和项目使用。



### maven-compiler-plugin 问题

github action 的机器人将 maven-compiler-plugin 版本升级到 3.12.0 ，运行 test 时出现异常：

```bash
basedir /Users/chensoul/workspace/IdeaProjects/cocktail/cocktail-cloud/cocktail/cocktail-oauth2/target/generated-test-sources/test-annotations does not exist
```

将版本降到 3.12.0，就正常。

GitHub 上类似的问题：

- https://github.com/apache/maven-compiler-plugin/pull/191

  

## 源码运行 Nacos 2.3.0 

1、下载源代码

```bash
git clone git@github.com:alibaba/nacos.git
```



2、拷贝 console 模块里面的 java 和 resources 目录和 pom.xml 代码到自己的项目里面



3、console 模块 pom.xml 中有部分依赖最新版本没有发布到中央仓库，可以手动部署到自己的私有仓库里面

```bash 
git checkout master
mvn deploy -DskipTests=true
```



4、修改 pom.xml ，主要有以下几个改动：

- 修改 nacos.version 版本为 2.3.0
- 修改 nacos 相关依赖的 groupId 为 com.alibaba.nacos
- 修改 nacos-default-plugin-impl 为 nacos-default-plugin-all

```xml
<properties>
    <nacos.version>2.3.0</nacos.version>
</properties>

<dependencies>
    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-sys</artifactId>
        <version>${nacos.version}</version>
    </dependency>

    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-config</artifactId>
        <version>${nacos.version}</version>
    </dependency>
    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-naming</artifactId>
        <version>${nacos.version}</version>
    </dependency>
    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-client</artifactId>
        <version>${nacos.version}</version>
    </dependency>

    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-default-plugin-all</artifactId>
        <version>${nacos.version}</version>
    </dependency>

    <dependency>
        <groupId>com.alibaba.nacos</groupId>
        <artifactId>nacos-prometheus</artifactId>
        <version>${nacos.version}</version>
    </dependency>
</dependencies>
```



5、修改 application.properties 配置文件，配置数据库。取消以下几行的注释，并修改数据库配置

```properties
spring.sql.init.platform=mysql
db.num=1

db.url.0=jdbc:mysql://${MYSQL_HOST:localhost}:${MYSQL_PORT:3306}/nacos_2.2.4?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
db.user=${MYSQL_USER:root}
db.password=${MYSQL_PASS:123456}
```



6、修改启动类，设置单机模式启动

- 修改 @SpringBootApplication 注解为 @SpringBootConfiguration
- 在 main 方法里添加一行代码：`System.setProperty(Constants.STANDALONE_MODE_PROPERTY_NAME, "true");`
- 修改 derby.log 文件的路径

```java
@SpringBootConfiguration
@ComponentScan(basePackages = "com.alibaba.nacos", excludeFilters = {
    @Filter(type = FilterType.CUSTOM, classes = {NacosTypeExcludeFilter.class}),
    @Filter(type = FilterType.CUSTOM, classes = {TypeExcludeFilter.class}),
    @Filter(type = FilterType.CUSTOM, classes = {AutoConfigurationExcludeFilter.class})})
@ServletComponentScan
@EnableScheduling
public class Nacos {
    public static void main(String[] args) {
        // 通过环境变量的形式 设置 单机启动
        System.setProperty("nacos.standalone", "true");
        // 修改derby.log文件的路径
        System.setProperty("derby.stream.error.file", System.getProperty("java.io.tmpdir") + "/derby.log");

        SpringApplication.run(Nacos.class, args);
    }
}
```

