---
title: "Java"
date: 2026-03-11 10:30:00+08:00
slug: "java"
tags: ['java']
draft: false
categories: [ "wiki" ]
description: "Java 开发环境与工具索引：SDKMAN 安装、IDE、常用库与参考资源链接。"
favicon: "java.svg"
---

## Installation

Easy way to install Java is using [SDKMAN](https://sdkman.io/)

```plain
$ curl -s "https://get.sdkman.io" | bash
$ source "$HOME/.sdkman/bin/sdkman-init.sh"
$ sdk version
$ sdk list java
$ sdk install java 21.0.5-tem
$ sdk install java 8.0.432-zulu
```

## Tools

### IDEs

- [Intellij IDEA](https://www.jetbrains.com/idea/)
- [Eclipse](https://www.eclipse.org/downloads/packages/)
- [Spring Tool Suite](https://spring.io/tools/sts/all)
- [NetBeans](https://netbeans.org/)

### Java Libraries and Tools

- [Lombok](https://projectlombok.org/)
- [AutoValue](https://github.com/google/auto/blob/master/value/userguide/index.md)
- [Immutable objects](https://immutables.github.io/immutable.html)
- [Jasypt](http://www.jasypt.org/)
- [JJwt](https://github.com/jwtk/jjwt)
- [Jackson JSON](https://github.com/FasterXML/jackson)
- [Vavr](http://www.vavr.io/)
- [FF4j](https://ff4j.github.io/)
- [Failsafe](https://github.com/jhalterman/failsafe)
- [Retry4j](https://github.com/elennick/retry4j)
- [Twitter4j](http://twitter4j.org/en/)
- [JooQ](https://www.jooq.org/)
- [FlexyPool](https://github.com/vladmihalcea/flexy-pool)
- [Hibernate-Types](https://github.com/vladmihalcea/hibernate-types)
- [Resilience4j](https://github.com/resilience4j/resilience4j)
- [Zalando/problem-spring-web](https://github.com/zalando/problem-spring-web)
- [SpringFox](http://springfox.github.io/springfox/)

### Code Generator

- Spring Initializr
- [JHipster](https://www.jhipster.tech/)
- [Bootify](https://bootify.io/)
- [generator-springboot](https://github.com/sivaprasadreddy/generator-springboot)
- [progen](https://github.com/sivaprasadreddy/progen)
- [ttcli](https://github.com/wimdeblauwe/ttcli/tree/main)：CLI to create a Spring Boot with Thymeleaf project

### Testing

#### Test Frameworks

- [JUnit 5](https://junit.org/junit5/docs/current/user-guide/)
- TestNG
- JGiven
- JUnit 4
- Spock
- Arquillian
- Jbehave

#### Assertion Libraries

- [Assertj](http://joel-costigliola.github.io/assertj/)
- Hamcrest
- JSONAssert
- JsonPath
- XMLUnit
- [REST Assured](https://github.com/rest-assured/rest-assured/wiki/Usage)

#### Mocking Frameworks

- [Mockito](https://site.mockito.org/)
- [Mock Server](http://www.mock-server.com/)
- WireMock
- EasyMock
- PowerMock

#### Test Infrastructure

- [TestContainers](https://www.testcontainers.org/)
- Microshed Testing
- GreenMail
- LocalStack
- Selenide
- Selenium
- Serenity

#### Utility

- Instancio
- ArchUnit
- PIT
- Pact
- Diffblue
- [Awaitility](https://github.com/awaitility/awaitility)
- Httpie
- Cucumber
- FitNesse
- DBUnit
- Gauge
- DataFaker
- PiTest

#### Performance Testing

- JMH
- [JMeter](https://jmeter.apache.org/)
- [Gatling](https://gatling.io/)
- ApacheBench
- JfrUnit

#### Plugin

- [Jacoco](https://www.eclemma.org/jacoco/)

### Database

#### Migration

- [Flyway](https://flywaydb.org/)
- [Liquibase](https://www.liquibase.org/)
- [Mongock](https://mongock.io/)

#### CDC

- [Debezium](https://debezium.io/)
- [Canal](https://github.com/alibaba/canal)

### Security

#### Authorization Server

- [Tanzu Local Authorization Server](https://blogs.vmware.com/tanzu/unlocking-security-a-deep-dive-into-the-local-authorization-server/)
- [Keycloak](https://www.keycloak.org/)
- [Auth.js](https://authjs.dev/)

### CI/CD

- [Jenkins](https://jenkins.io/)
- [TravisCI](https://travis-ci.org/)
- [CircleCI](https://circleci.com/)
- Argo CD
- GitHub Actions
- Bitbucket Pipelines

### Code Review

- Code Climate
- SonarQube
- Snyk

### Monitoring

- [Grafana](https://grafana.com/)
- [Prometheus](https://prometheus.io/)
- [ELK Stack](https://www.elastic.co/elk-stack)

## Source Codes

- 手写 redis：

- https://github.com/kachofugetsu09/redis-mini
- https://gitee.com/XhyQAQ/redis-java/

- 手写 spring：https://github.com/kachofugetsu09/BloomBoot
- 手写 Spring MVC：https://gitee.com/XhyQAQ/xhy-web
- 手写 RPC：https://gitee.com/XhyQAQ/rpc
- 手写熔断组件：https://gitee.com/XhyQAQ/circuit-breaker
- 手写重试组件：https://gitee.com/XhyQAQ/xhy-retyer
- 手写限流组件：https://gitee.com/XhyQAQ/limiter
- 手写规则引擎：https://gitee.com/XhyQAQ/rule-engine
- 手写 AOP：https://gitee.com/XhyQAQ/xhy-aop
- 手写动态加载 Bean 组件：https://gitee.com/XhyQAQ/bean-chameleon
- 手写 FRP：https://github.com/ximatai/MuYunFRP

## References

- https://www.oracle.com/technetwork/java/javase/downloads/index.html
- https://www.reddit.com/r/java
