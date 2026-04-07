#!/bin/bash

# 为所有已恢复的文章添加 canonicalURL

cd /tmp/chensoul-blog

# 定义文章和对应的 canonicalURL
declare -A ARTICLES=(
  ["content/translation/2023-08-16-【译】Spring Security - JWT.md"]="https://www.tutorialspoint.com/spring_security/spring_security_with_jwt.htm"
  ["content/translation/2023-08-16-【译】Spring Security - OAuth2.md"]="https://www.tutorialspoint.com/spring_security/spring_security_with_oauth2.htm"
  ["content/translation/2023-08-16-【译】Spring Security - 使用数据库表单登录.md"]="https://www.tutorialspoint.com/spring_security/spring_security_form_login_with_database.htm"
  ["content/translation/2023-08-16-【译】Spring Security - 表单登录、记住我和注销.md"]="https://www.tutorialspoint.com/spring_security/spring_security_form_login_remember_me_and_logout.htm"
  ["content/translation/2023-11-16-【译】《Grokking the System Design Interview》系统设计思维模式.md"]="https://www.designgurus.io/course-think-like-a-system-design-interviewer/article/system-design-mindset"
  ["content/translation/2023-11-16-【译】《Grokking the System Design Interview》系统设计指难南.md"]="https://www.designgurus.io/course-think-like-a-system-design-interviewer/article/system-design-framework"
  ["content/translation/2023-11-17-【译】《Grokking the System Design Interview》命名系统.md"]="https://www.designgurus.io/course-think-like-a-system-design-interviewer/article/naming-systems"
  ["content/translation/2023-11-24-【译】《Grokking the System Design Interview》设计Dropbox.md"]="https://www.designgurus.io/course-think-like-a-system-design-interviewer/article/design-dropbox"
  ["content/translation/2023-11-24-【译】《Grokking the System Design Interview》设计Facebook Messenger.md"]="https://www.designgurus.io/course-think-like-a-system-design-interviewer/article/design-facebook-messenger"
  ["content/translation/2023-11-24-【译】《Grokking the System Design Interview》设计Pastebin.md"]="https://www.designgurus.io/course-think-like-a-system-design-interviewer/article/design-pastebin"
  ["content/translation/2023-12-14-【译】《Grokking the System Design Interview》设计Twitter.md"]="https://www.designgurus.io/course-think-like-a-system-design-interviewer/article/design-twitter"
  ["content/translation/2023-09-04-【译】什么是 WebSocket？.md"]="https://www.pubnub.com/guides/websockets/"
  ["content/translation/2023-09-12-【译】什么是 HTTP3？.md"]="https://www.pubnub.com/guides/http-3/"
  ["content/translation/2023-09-15-【译】什么是 OAuth？.md"]="https://www.pubnub.com/guides/oauth/"
  ["content/translation/2023-09-18-【译】什么是 HTTP 流式传输？.md"]="https://www.pubnub.com/guides/http-streaming/"
  ["content/translation/2023-09-19-【译】Spring Security 与 JWT for REST API.md"]="https://www.toptal.com/spring/spring-security-tutorial"
  ["content/translation/2023-09-21-【译】什么是Socket.IO？.md"]="https://www.pubnub.com/guides/socket-io/"
  ["content/translation/2023-09-27-【译】什么是长轮询？.md"]="https://www.pubnub.com/guides/long-polling/"
  ["content/translation/2023-10-10-【译】什么是 HTTP？.md"]="https://www.pubnub.com/guides/http/"
  ["content/translation/2024-01-29-【译】WebSocket与REST.md"]="https://ably.com/topic/websocket-vs-rest"
  ["content/translation/2024-03-16-【译】Spring Boot项目如何实现JWT认证？.md"]="https://javatechonline.com/how-to-implement-jwt-authentication-in-spring-boot-project/"
  ["content/translation/2024-03-17-【译】如何在Spring Boot2中使用UserDetailsService实现安全性？.md"]="https://javatechonline.com/how-to-implement-security-in-spring-boot-using-userdetailsservice/"
  ["content/translation/2024-05-07-【译】Java和WebSockets：构建立即响应的实时应用程序.md"]="https://ably.com/topic/websockets-java"
  ["content/translation/2024-05-07-【译】WebSocket API和并发说明.md"]="https://ably.com/topic/websockets-api"
  ["content/translation/2024-05-08-【译】比较 Socket.IO 和 HTTP：主要区别和用例.md"]="https://ably.com/topic/socketio-vs-http"
  ["content/translation/2024-06-05-【译】OAuth2 with Spring 第1部分：访问令牌.md"]="https://www.javatechonline.com/oauth2-with-spring-boot-part-1-access-token/"
  ["content/translation/2024-06-05-【译】OAuth2 with Spring 第2部分：授权服务器入门.md"]="https://www.javatechonline.com/oauth2-with-spring-boot-part-2-auth-server-getting-started/"
  ["content/translation/2024-06-05-【译】OAuth2 with Spring 第3部分：使用 Spring Authorization Server 展示authorization_code OIDC 客户端.md"]="https://www.javatechonline.com/oauth2-with-spring-boot-part-3-authorization-code-oidc-client/"
  ["content/translation/2024-06-05-【译】OAuth2 with Spring 第4部分：Spring Authorization 客户端与 Google Authorization 服务器的交互登录流程.md"]="https://www.javatechonline.com/oauth2-with-spring-boot-part-4-client-credentials/"
  ["content/translation/2024-06-05-【译】OAuth2 with Spring 第5部分：使用 PKCE 保护的 Spring Boot 客户端程序实现安全.md"]="https://www.javatechonline.com/oauth2-with-spring-boot-part-5-pkce-spring-boot-client-app/"
  ["content/translation/2024-06-05-【译】OAuth2.0授权服务器.md"]="https://www.javatechonline.com/oauth2-0-authorization-server/"
  ["content/translation/2024-06-05-【译】OAuth2简化版.md"]="https://www.javatechonline.com/oauth2-simplified/"
  ["content/translation/2024-06-27-【译】数据库分片速成课程.md"]="https://blog.bytebytego.com/p/a-crash-course-in-database-sharding"
  ["content/translation/2024-07-04-【译】数据库扩展策略速成课程.md"]="https://blog.algomaster.io/p/system-design-how-to-scale-a-database"
  ["content/translation/2024-07-08-【译】面向 Java 开发人员的 Kubernetes.md"]="https://dzone.com/articles/kubernetes-for-java-developers"
  ["content/translation/2024-07-18-【译】关系数据库设计速成课程.md"]="https://blog.bytebytego.com/p/a-crash-course-on-relational-database"
  ["content/translation/2024-07-23-【译】JMS介绍 – Java消息服务.md"]="https://jstobigdata.com/jms/jms-introduction-java-messaging-service/"
  ["content/translation/2024-07-23-【译】JMS 点对点消息传递的实际应用.md"]="https://jstobigdata.com/jms/jms-point-to-point-messaging-in-action/"
  ["content/translation/2020-10-20-【译】Minikube 中的 Minions - 面向 Java 开发人员的 Kubernetes 简介.md"]="https://dzone.com/articles/minions-in-minikube-a-kubernetes-intro-for-java-de"
  ["content/translation/2021-02-16-【译】关于 HTTP 您需要了解的一切.md"]="https://cs.fyi/guide/http-in-depth"
  ["content/translation/2022-03-04-【译】顶级缓存策略.md"]="https://blog.bytebytego.com/p/top-caching-strategies"
  ["content/translation/2023-02-19-【译】Spring Boot项目如何实现Security？.md"]="https://javatechonline.com/how-to-implement-security-in-spring-boot-project/"
  ["content/translation/2023-06-28-【译】Apache Kafka、RabbitMQ 与 AWS SNSSQS：哪个消息代理最好？.md"]="https://ably.com/topic/apache-kafka-vs-rabbitmq-vs-aws-sns-sqs"
  ["content/translation/2023-07-14-【译】使用Spring Boot2和Spring Security 5演示JDBC存储Oauth2集中式服务.md"]="https://blog.devgenius.io/spring-boot-authorization-server-825230ae0ed2"
  ["content/translation/2023-07-26-【译】Spring Boot授权服务器 - 使用 Java 的资源服务器和客户端凭证示例.md"]="https://blog.devgenius.io/spring-boot-authorization-server-825230ae0ed2"
)

# 为每篇文章添加 canonicalURL
for file in "${!ARTICLES[@]}"; do
  if [ -f "$file" ]; then
    url="${ARTICLES[$file]}"
    echo "处理: $file -> $url"

    # 检查是否已经有 canonicalURL
    if grep -q "canonicalURL:" "$file"; then
      echo "  已存在 canonicalURL，跳过"
      continue
    fi

    # 在 categories 字段后添加 canonicalURL
    # 使用 sed 在 categories 行后添加 canonicalURL
    sed -i "/^categories:/{n; a\canonicalURL: \"$url\";}" "$file"
    echo "  已添加 canonicalURL"
  else
    echo "文件不存在: $file"
  fi
done

echo ""
echo "完成！现在检查 git status..."
git status --short | grep "content/translation" | head -50