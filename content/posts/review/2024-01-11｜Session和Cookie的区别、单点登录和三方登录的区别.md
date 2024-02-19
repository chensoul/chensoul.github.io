---
title: "2024-01-11｜Session和Cookie的区别、单点登录和三方登录的区别"
date: 2024-01-11T07:00:00+08:00
slug: til
categories: ["Review"]
tags: [nginx,sso]
---

今天做了什么：

- [x] 1、观看 B 站 《[SSO单点登录](https://www.bilibili.com/video/BV1ht4y1E7EL?p=1)》视频

- [x] 2、参考  https://github.com/jOOQ/jOOL 和 https://github.com/vavr-io/vavr ，将 CheckedXXX 的类加入公司项目中。

  涉及的类有：Async.java、Blocking.java、CheckedBiConsumer.java、CheckedBiFunction.java、CheckedBiPredicate.java、CheckedComparator.java、CheckedConsumer.java、CheckedFunction.java、CheckedPredicate.java、CheckedRunnable.java、CheckedSupplier.java、FunctionUtils.java、OnceConsumer.java、SameExecutorCompletionStage.java、UncheckedException.java，并添加单元测试类。

  示例代码：

  ```java
  @FunctionalInterface
  public interface CheckedConsumer<T> {
      void accept(T t) throws Throwable;
  
      default CheckedConsumer<T> andThen(CheckedConsumer<? super T> after) {
          Objects.requireNonNull(after, "after is null");
          return (T t) -> {
              accept(t);
              after.accept(t);
          };
      }
  
      static <T> Consumer<T> sneaky(CheckedConsumer<T> consumer) {
          return unchecked(consumer, RETHROW_ALL);
      }
  
      static <T> Consumer<T> unchecked(CheckedConsumer<T> consumer) {
          return unchecked(consumer, THROWABLE_TO_RUNTIME_EXCEPTION);
      }
  
      static <T> Consumer<T> unchecked(CheckedConsumer<T> consumer, Consumer<Throwable> handler) {
          return t -> {
              try {
                  consumer.accept(t);
              } catch (Throwable e) {
                  handler.accept(e);
                  throw new IllegalStateException("Exception handler must throw a RuntimeException", e);
              }
          };
      }
  }
  ```

- [x] 3、重构公司微服务框架

- [ ] 4、明天待办事项：

  - 重写微服务日志记录模块
  - 继续重构 [foodie-cloud](https://github.com/chensoul/foodie-cloud)
    - 支持单点登录
    - 支持全文检索
    - 集成 Spring Security OAuth2



## Session和Cookie的区别
Session和Cookie是Web开发中常用的两种技术，用于在客户端和服务器之间存储和传递数据。它们在一些方面有相似之处，但也有一些重要的区别。

1. 数据存储位置：
   - Cookie：Cookie是一小段文本信息，存储在用户的浏览器中。每当用户访问相应的网站时，浏览器会将Cookie发送给服务器。
   - Session：Session是服务器上的一段存储用户数据的空间，数据存储在服务器上，而不是在用户的浏览器中。

2. 数据安全性：
   - Cookie：Cookie的数据存储在用户的浏览器中，因此可以被用户篡改或者被其他恶意用户窃取。为了增加安全性，可以使用加密和签名等技术对Cookie进行保护。
   - Session：Session的数据存储在服务器上，相对来说更安全，用户无法直接篡改或者窃取Session数据。但是，服务器需要采取措施来保护Session数据的安全性，例如使用合适的存储方式和安全传输协议。

3. 存储容量：
   - Cookie：Cookie的存储容量有限，通常为几KB。不同浏览器对Cookie的容量限制可能不同。
   - Session：Session的存储容量相对较大，通常没有明确的限制。服务器的硬盘空间和内存大小会影响Session的容量限制。

4. 生命周期：
   - Cookie：Cookie可以设置过期时间，可以是会话级别的（当浏览器关闭时失效）或者持久性的（在一段时间后失效）。
   - Session：Session通常在用户首次访问网站时创建，并在用户关闭浏览器或者一段时间不活动后过期。Session的生命周期由服务器管理。

5. 访问方式：
   - Cookie：Cookie存储在浏览器中，可以通过JavaScript或服务器端代码直接读取和写入。
   - Session：Session存储在服务器上，通过服务器端代码访问和操作。

总结：
Cookie适合存储少量的简单数据，且需要在客户端保持状态。Session适合存储较大的用户数据或敏感数据，且需要在服务器端保持状态。在实际应用中，Cookie和Session通常会结合使用，Session ID会存储在Cookie中，用于标识和关联客户端和服务器上的Session数据。



## 单点登录和三方登录的区别

单点登录（Single Sign-On，SSO）和三方登录（Third-party Login）是两种不同的身份认证机制。

1. 单点登录（SSO）：
   - 定义：单点登录是一种身份验证机制，允许用户只需登录一次，即可访问多个关联的应用程序或系统。
   - 流程：用户在通过身份验证后，会获得一个令牌，用于表示他们已经通过认证。这个令牌可以在多个应用程序之间共享，使用户可以无需重复登录即可访问这些应用程序。
   - 优点：提供了便利性，用户只需登录一次即可访问多个应用程序，无需为每个应用程序单独进行身份验证。同时，SSO还可以提高安全性，因为用户只需在一个受信任的身份提供者进行身份验证。
   - 示例：CAS（Central Authentication Service）是一个常见的SSO协议和技术，用于实现单点登录。

2. 三方登录：
   - 定义：三方登录是一种身份验证机制，允许用户使用其在第三方身份提供者（如社交媒体平台）上已有的身份认证来登录应用程序或网站。
   - 流程：用户选择使用三方登录，并提供其在第三方身份提供者上的凭据。应用程序将向第三方身份提供者发送请求，以验证用户的身份，并获得一些基本信息。应用程序可以选择使用这些信息来创建一个本地账户，也可以仅依赖第三方身份提供者进行身份验证和授权。
   - 优点：提供了便利性，用户可以使用其在第三方平台上已有的身份进行登录，无需创建新的账户和密码。同时，三方登录还可以提供额外的用户信息，以便应用程序个性化用户体验。
   - 示例：使用Facebook、Google或Twitter账户登录某个应用程序或网站，就是一种常见的三方登录。

总结：
单点登录（SSO）是一种身份认证机制，允许用户只需登录一次，即可访问多个关联的应用程序或系统。三方登录是一种身份认证机制，允许用户使用其在第三方身份提供者上已有的身份认证来登录应用程序或网站。两者的主要区别在于单点登录关注的是用户在多个应用程序之间的身份验证和授权，而三方登录关注的是用户使用第三方身份提供者的凭据进行身份验证。



## Session跨域如何实现

在Web开发中，由于浏览器的同源策略（Same-Origin Policy），默认情况下，跨域访问Session是不被允许的。然而，可以通过一些技术手段来实现跨域访问Session。以下是几种常见的实现方法：

1. JSONP（JSON with Padding）：JSONP是一种利用动态创建`<script>`标签来实现跨域请求的技术。通过在跨域请求中包含一个回调函数的名称，服务器会将数据包装在该函数中作为响应返回。客户端可以定义一个全局的回调函数来接收响应，并在回调函数中处理数据和设置Session。

2. CORS（Cross-Origin Resource Sharing）：CORS是一种基于HTTP头部的跨域解决方案。服务器端可以通过设置特定的响应头部，允许指定的域名或一组域名跨域访问资源。对于跨域访问Session，服务器端需要在响应中包含`Access-Control-Allow-Credentials: true`头部，并在请求中设置`withCredentials: true`以允许携带Cookie信息。

3. 代理服务器：可以设置一个代理服务器，将跨域请求转发到目标服务器。客户端通过访问代理服务器，代理服务器在内部转发请求并携带Session信息。由于代理服务器与目标服务器在同一域名下，因此可以实现跨域访问Session。

需要注意的是，这些方法都需要服务器端的支持和相应的配置。另外，跨域访问Session涉及安全问题，需要谨慎处理，确保只有受信任的域名可以访问Session，并采取适当的安全措施保护用户的数据。



## Nginx实现共享 Session 优缺点

使用 Nginx 的 `ip_hash` 指令实现会话共享具有以下优点和缺点：

优点：

1. 会话一致性：`ip_hash` 指令基于客户端的 IP 地址将请求路由到后端服务器。这意味着相同 IP 的客户端将始终被路由到同一台后端服务器，从而实现了会话一致性。这对于某些应用程序来说非常重要，因为它们需要确保会话中的数据始终存储在同一服务器上。
2. 无需共享会话存储：由于相同 IP 的客户端被路由到同一台后端服务器，因此不需要在不同服务器之间共享会话数据。每个服务器都可以独立地管理和存储会话数据，简化了架构和部署。
3. 易于扩展：通过使用 `ip_hash`，可以在增加服务器时轻松扩展应用程序的容量。每当引入新的服务器时，部分客户端会话将自动路由到新服务器，从而实现负载均衡和扩展性。

缺点：

1. 不适用于动态 IP 地址：`ip_hash` 指令是基于客户端的 IP 地址进行路由的，因此对于使用动态 IP 地址的客户端，会话一致性可能无法实现。当客户端的 IP 地址发生变化时，会导致会话被重新分配到不同的服务器上，可能导致会话状态丢失。
2. 不适用于共享负载均衡：使用 `ip_hash` 时，每个客户端被路由到特定的服务器，这可能导致服务器之间的负载不均衡。如果某些客户端的 IP 地址集中在某几个服务器上，而其他服务器的负载较轻，则会导致资源利用不均衡。
3. 单点故障：如果某个服务器出现故障，所有与该服务器关联的客户端会话将受到影响，因为它们无法被正确路由到其他服务器。这可能导致服务中断和数据丢失。

总结起来，`ip_hash` 提供了简单且有效的会话共享方法，适用于某些特定场景。然而，它也存在一些限制，特别是对于动态 IP 地址和负载均衡的需求。在决定是否使用 `ip_hash` 时，需要仔细考虑应用程序的需求和架构，并权衡其中的优缺点。