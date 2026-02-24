---
title: "Spring Boot集成SpringDoc生成Api文档"
date: 2024-07-10
slug: springdoc-with-spring-boot
categories: ["spring-boot"]
tags: ['spring-boot','springdoc']
---

以下以 Maven 为例介绍 Spring Boot集成SpringDoc生成Api文档。



1. 添加依赖

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
</dependency>
```

2. 配置 annotationProcessor，实现通过 javadoc 生成文档。

每个 maven 模块都需要配置：

```xml
<properties>
    <therapi-runtime-javadoc.version>0.15.0</therapi-runtime-javadoc.version>
    
    <maven-compiler-plugin.version>3.13.0</maven-compiler-plugin.version>
</properties>

<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-compiler-plugin</artifactId>
  <version>${maven-compiler-plugin.version}</version>
  <configuration>
    <annotationProcessorPaths>
      <!-- https://springdoc.org/#javadoc-support -->
      <path>
        <groupId>com.github.therapi</groupId>
        <artifactId>therapi-runtime-javadoc-scribe</artifactId>
        <version>${therapi-runtime-javadoc.version}</version>
      </path>
    </annotationProcessorPaths>
  </configuration>
</plugin>
```

3. 配置 spring boot 插件，生成 build.properties

```xml
<plugin>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-maven-plugin</artifactId>
  <executions>
    <execution>
      <goals>
        <goal>repackage</goal>
        <goal>build-info</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

4. 自动装配

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(name = SPRINGDOC_ENABLED, matchIfMissing = true)
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
public class SpringdocConfig {

	@Value("${server.port}")
	private String port;

	@Value("${openapi.prod-url:https://localhost}")
	private String prodUrl;

	@Bean
	public OpenAPI openAPI() {
		Server devServer = new Server();
		devServer.setUrl("http://localhost:" + port);
		devServer.setDescription("Server URL in Development environment");

		Server prodServer = new Server();
		prodServer.setUrl(prodUrl);
		prodServer.setDescription("Server URL in Production environment");

		Contact contact = new Contact();
		contact.setEmail("ichensoul@gmail.com");
		contact.setName("ChenSoul");
		contact.setUrl("https://blog.chensoul.cc");

		License mitLicense = new License().name("Apache License").url("https://www.apache.org/licenses/LICENSE-2.0.txt");

		Info info = new Info()
			.title("Spring Boot3 Monolith API")
			.version("1.0")
			.contact(contact)
			.description("This API exposes endpoints to manage charging sessions.").termsOfService("https://blog.chensoul.cc/terms")
			.license(mitLicense);

		return new OpenAPI().info(info).servers(List.of(devServer, prodServer));
	}
} 
```