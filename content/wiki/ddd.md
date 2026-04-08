---
title: "DDD"
date: 2026-03-11 10:30:00+08:00
slug: "ddd"
tags: [ "ddd" ]
draft: false
categories: [ "wiki" ]
description: "领域驱动设计（DDD）笔记：核心概念、实践要点与书单/文章/视频资源索引。"
favicon: "ddd.svg"
---

## 介绍

https://en.wikipedia.org/wiki/Domain-driven_design

领域驱动设计 (DDD) 是一种通过将实现与不断发展的模型联系起来满足复杂需求的软件开发方法。领域驱动设计的前提如下

- 将项目的主要重点放在核心领域和领域逻辑上；
- 根据领域模型进行复杂的设计；
- 发起技术专家和领域专家之间的创造性合作，以迭代方式完善解决特定领域问题的概念模型。

## 好处

[DDD 的价值和好处](http://www.informit.com/articles/article.aspx?p=1944876&seqNum=4)（又名如何向管理层、领域专家和技术团队成员推销 DDD）

- 组织获得其领域的有用模型
- 对您的业务进行精细、准确的定义和理解
- 领域专家为软件设计做出贡献
- 获得更好的用户体验
- 在纯模型周围设置清晰的界限
- 更好地组织企业架构的元素
- 使用敏捷、迭代、持续建模
- 在你的代码中使用新的战略和战术工具

以下是领域驱动设计风格的主要优点：

- **沟通**。开发团队中的所有各方都可以使用领域模型及其定义的实体，使用通用的业务领域语言来传达业务知识和需求，而无需使用技术术语。
- **可扩展**。领域模型通常是模块化和灵活的，因此可以根据条件和需求的变化轻松更新和扩展。
- **可测试**。领域模型对象是松散耦合且具有内聚力的，因此更容易进行测试。

如果您有一个复杂的领域，并且希望提高开发团队内的沟通和理解，或者必须以所有利益相关者都能理解的通用语言表达应用程序的设计，请考虑 DDD。

如果您拥有大型且复杂的企业数据场景，并且难以使用其他技术进行管理，DDD 也可能是一种理想的方法。

https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ee658117(v=pandp.10)

**在微服务**中，我们构建每个服务以只提供一件事并做好一件事。每个服务也与其他服务隔离。在这方面，DDD 原则可以帮助我们通过所谓的“有界上下文”将服务范围保持在较小范围内**。**

随后，DDD 将通过您与领域专家建立的沟通帮助您**调查和了解您的领域和所有子域**。通过了解您的域和子域，您将了解地图上下文以及所有子域如何相互作用，这将有助于您设计和选择微服务架构的类型以及您使用哪种方法来实现它们，无论是被动方法、编排方法还是混合方法……这将取决于您对所从事领域的了解。每种方法都有优缺点，需要根据项目和您的领域知识进行评估。DDD 将帮助您就此事做出决定。

https://dzone.com/articles/ddd-part-iv-ddd-amp-microservices

## 资源

### 词汇表

- http://uniknow.github.io/AgileDev/site/0.1.8-SNAPSHOT/parent/ddd/core/glossary.html
- https://gist.github.com/bobthemighty/b241a4fccadbd7591024
- http://dddcommunity.org/resources/ddd_terms
- https://en.wikipedia.org/wiki/Domain-driven_design#Building_blocks

### 图书

- https://amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215
- https://amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577
- http://dddcommunity.org/books
- http://domainlanguage.com/ddd/
- https://amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164
- http://carfield.com.hk/document/software%2Bdesign/dddquickly.pdf
- [http://eventstorming.com](http://eventstorming.com/)
- https://www.amazon.com/Patterns-Principles-Practices-Domain-Driven-Design/dp/1118714709

### 演示文稿

- Greg Young — DDD、CQRS、事件源的十年https://youtube.com/watch?v=LDW0QWie21s
- Eric Evans — 解决软件核心的复杂性https://youtube.com/watch?v=dnUFEg68ESM
- GOTO 2014 • 事件采购 • Greg Young https://youtube.com/watch?v=8JKjvY4etTY
- Eric Evans - DDD 和微服务：终于有一些界限了！https://youtu.be/sFCgXH7DwxM
- JDD 2017：保持 IT 清洁：中型构建块和六边形架构（Jakub Nabrdalik）https://youtu.be/KrLFs6f2bOA
- Mariusz Gil：通过事件风暴发现未知事物https://youtube.com/watch?v=Pl5HD8Ae3PU
- Boiling Frogs 2018 - Mariusz Gil - 使用事件风暴发现未知域https://youtu.be/dhoXYRqghws?t=15s(polish )
- WJUG #204 - Marcin Haręza：事件溯源 - co to、po co to、jak to？https://youtube.com/watch?v=dEA6uv0FPpE
- 领域驱动设计——万物各得其所https://youtube.com/watch?v=jraV7xSTYVs
- 温水青蛙 2018 - Jarosław Pałka - Sagi、strumienie、reaktywność i inne 流行语https://youtu.be/27S0G9bE3Bg?t=0s(polish )
- Sławomir Sobótka - DDD：问答 - czyli co gryzie świadomego programistę/programistkę https://youtu.be/FkylT96at4g
- Sławomir Sobótka - DDD 问答 - wersja rozszerzona https://youtu.be/do-xqIbKZ_8
- https://devstyle.pl/2014/12/01/devtalk04-o-domain-driven-design-ze-slawomirem-sobotka/
- 从头开始的事件驱动 Rails https://youtube.com/watch?v=C3P3yGQyDQ4
- DDD 欧洲https://www.youtube.com/channel/UC3PGn-hQdbtRiqxZK9XBGqQ/playlists

### 参考

- https://github.com/heynickc/awesome-ddd
- http://alistair.cockburn.us/Hexagonal+architecture/v/slim
- http://mkuthan.github.io/blog/2014/09/22/ddd-how-to-learn/
- [http://dddweekly.com](http://dddweekly.com/)
- [https://docs.microsoft.com/en-gb/dotnet/standard/microservices-architecture/microservice-ddd-cqrs-patterns/ddd-orient-microservice](https://docs.microsoft.com/en-gb/dotnet/standard/microservices-architecture/microservice-ddd-cqrs-patterns/ddd-oriented-microservice)
- https://martinfowler.com/bliki/AnemicDomainModel.html
- [https://martinfowler.com/tags/域名驱动设计.html](https://martinfowler.com/tags/domain driven design.html)
- [https://github.com/dzfweb/microsoft-microservices-book/blob/master/microservice-ddd-cqrs-patterns/ddd-orient-microservice.md](https://github.com/dzfweb/microsoft-microservices-book/blob/master/microservice-ddd-cqrs-patterns/ddd-oriented-microservice.md)
- [https://www.ibm.com/developerworks/cloud/library/cl-domain-driven-design-event-commerce/index.html](https://www.ibm.com/developerworks/cloud/library/cl-domain-driven-design-event-sourcing/index.html)
- https://content.pivotal.io/blog/getting-started-with-domain-driven-design-top-3-concepts
- https://www.linkedin.com/pulse/code-better-ddd-what-why-balazs-hideghety/
- https://gist.github.com/somebox/21c7c9ca3a62de9ac65a366fbb8c3250
- http://mkuthan.github.io/presentations/micro-services.html#/
- https://github.com/mariuszgil/awesome-eventstorming

#### Java

- https://bottega.com.pl/materialy.xhtm?cat=DDD
- https://bottega.com.pl/pdf/materialy/sdj-ddd.pdf
- https://bottega.com.pl/pdf/materialy/ddd/ddd1.pdf
- https://bottega.com.pl/pdf/materialy/ddd/ddd2.pdf
- http://jakubn.gitlab.io/keepitclean/#1
- http://tswiackiewicz.github.io/inside-the-source-code/architecture/ddd-layered-architecture
- https://devstyle.pl/2016/11/23/esencja-cqrs-to-bardzo-proste/
- http://piotrgankiewicz.com/2016/08/01/handling-domain-events
- http://tidyjava.com/hexagonal-architecture-powerful
- https://geek.justjoin.it/architektura-kodu-mikrouslugi-oparta-o-domain-driven-design/

#### Go

- https://gist.github.com/eduncan911/c1614e684e4802d626ae
- [https://twodots.tech/post/microservices-or-monolith-its-detail](https://threedots.tech/post/microservices-or-monolith-its-detail)
- https://hackernoon.com/golang-clean-archithecture-efd6d7c43047
- https://medium.com/@eminetto/clean-architecture-using-golang-b63587aa5e3f
- https://juicemia.com/post/go-ddd/
- https://www.citerus.se/go-ddd/
- https://outcrawl.com/go-microservices-cqrs-docker/

### 示例

#### Java

- https://github.com/ddd-by-examples/factory
- https://github.com/BottegaIT/ddd-leaven-v2
- https://github.com/eventuate-examples/eventuate-examples-java-spring-todo-list
- https://github.com/avthart/spring-boot-axon-sample
- https://github.com/jakubnabrdalik/hentai-cloudy-rental
- https://github.com/jakubnabrdalik/hentai
- https://ordina-jworks.github.io/conference/2016/07/10/SpringIO16-DDD-Rest.html
- https://github.com/olivergierke/spring-restbucks

#### Go

- https://github.com/bxcodec/go-clean-arch
- https://github.com/marcusolsson/goddd

### 框架

#### Java

- https://github.com/RBMHTechnology/eventuate
- https://github.com/eventuate-local/eventuate-local
- [https://github.com/RBMHTechnology/eventuate/wiki/Thoughts-on-Eventuate's-future](https://github.com/RBMHTechnology/eventuate/wiki/Thoughts-on-Eventuate’s-future)
- https://github.com/AxonFramework
- [https://blog.eventuate.io/2016/04/05/the-eventuate-todo-list-application-microservices-springboot-eventsource-cqrs/](https://blog.eventuate.io/2016/04/05/the-eventuate-todo-list-application-microservices-springboot-eventsourcing-cqrs/)
- https://github.com/binkley/axon-spring-boot-starter
