---
title: "2023-12-18｜使用Spring Security实现OAuth2授权和认证"
date: 2023-12-18T18:50:00+08:00
slug: til
categories: ["Review"]
tags: [java,"spring-security",oauth2]
---

Today I Learned. 今天分享内容：使用Spring Security实现OAuth2授权和认证。



最近在开发 Spring Cloud 微服务时，需要对 OAuth2 的异常处理进行定制，从网上搜到一个 github 仓库：[oauth2](https://github.com/selfancy/oauth2)。这篇仓库的代码实现了 OAuth2 的四种授权模式、I18N 国际化、异常处理、JWT Token，我 fork 了一份代码，做了一些改动，去掉了 webflux、eureka 相关代码。



代码仓库地址：https://github.com/chensoul/spring-security-oauth2-legacy，相关依赖的版本：

- spring-boot: 2.7.18
- org.springframework.security.oauth:spring-security-oauth2-autoconfigure: 2.6.8
- org.springframework.security.oauth:spring-security-oauth2: 2.5.2.RELEASE
- org.springframework.security:spring-security-jwt 1.1.1.RELEASE

## 特性

## 统一异常处理

> 参考spring security的 **ExceptionTranslationFilter** 类

## 异常处理类

- AccessDeniedHandler
- AuthenticationEntryPoint

## jwt key生成

- 生成 JKS 文件
```bash
keytool -genkeypair -alias myalias -storetype PKCS12 -keyalg RSA -keypass mypass -keystore mykeystore.jks -storepass mypass -validity 3650
```
- 导出公钥
```bash
# 保存为 public.cer 文件：
keytool -exportcert -alias myalias -storepass mypass -keystore mykeystore.jks -file public.cer

# 保存为 public.key 文件
keytool -list -rfc --keystore mykeystore.jks -storepass mypass | openssl x509 -inform pem -pubkey > public.key
```
- 导出私钥，将其保存为 private.key 文件：
```bash
keytool -importkeystore -srckeystore mykeystore.jks -srcstorepass mypass -destkeystore private.p12 -deststoretype PKCS12 -deststorepass mypass -destkeypass mypass
openssl pkcs12 -in private.p12 -nodes -nocerts -out private.key
```

## I18N国际化
- 参考 **LocaleConfiguration** 类

## 支持 @Inner 注解实现内部接口不用认证

参考以下类：
- Inner
- InnerAspect
- FeignOAuth2RequestInterceptor
- ResourceServerConfig
- PermitUrlProperties

## OAuth 2.0授权模式

- 密码模式（resource owner password credentials）
- 授权码模式（authorization code）
- 简化模式（implicit）
- 客户端模式（client credentials）

> ### 密码模式（resource owner password credentials）
> - 这种模式是最不推荐的，因为client可能存了用户密码
> - 这种模式主要用来做遗留项目升级为oauth2的适配方案
> - 当然如果client是自家的应用，也是可以
> - 支持refresh token

> ### 授权码模式（authorization code）
> - 这种模式算是正宗的oauth2的授权模式
> - 设计了auth code，通过这个code再获取token
> - 支持refresh token

> ### 简化模式（implicit）
> - 这种模式比授权码模式少了code环节，回调url直接携带token
> - 这种模式的使用场景是基于浏览器的应用
> - 这种模式基于安全性考虑，建议把token时效设置短一些
> - 不支持refresh token

> ### 客户端模式（client credentials）
> - 这种模式直接根据client的id和密钥即可获取token，无需用户参与
> - 这种模式比较合适消费api的后端服务，比如拉取一组用户信息等
> - 不支持refresh token，主要是没有必要

> ### 关于refresh token
> - refresh token的初衷主要是为了用户体验不想用户重复输入账号密码来换取新token，因而设计了refresh token用于换取新token
> - 这种模式由于没有用户参与，而且也不需要用户账号密码，仅仅根据自己的id和密钥就可以换取新token，因而没必要refresh token

### 授权接口及相关参数

| 授权模式                         | 请求路径         | 请求方法 | 请求头                                         | 请求参数                                                     |
| -------------------------------- | ---------------- | -------- | ---------------------------------------------- | ------------------------------------------------------------ |
| 用户名密码(password)             | /oauth/token     | post     | Content-Type:application/x-www-form-urlencoded | grant_type:password<br/>username:user<br/>password:123456<br/>scope:server<br/>client_id:client<br/>client_secret:secret |
| 客户端凭证(client_credentials)   | /oauth/token     | post     | Content-Type:application/x-www-form-urlencoded | grant_type:client_credentials<br/>scope:userinfo resource<br/>client_id:client<br/>client_secret:secret |
| 客户端授权码(authorization_code) | /oauth/authorize | get      | Content-Type:application/x-www-form-urlencoded | response_type=code&scope=server&client_id=client&redirect_uri=https://www.taobao.com |
| 客户端授权码(authorization_code) | /oauth/authorize | get      | Content-Type:application/x-www-form-urlencoded | response_type:authorization_code<br/>code:gE3Eka<br/>redirect_uri:https://www.jd.com<br/>scope:server |
| 简化模式(implicit)               | /oauth/authorize | get      | Content-Type:application/x-www-form-urlencoded | response_type:token<br/>client_id:client<br/>redirect_uri:https://www.jd.com<br/>scope:server <br/>state:123456 |

### 小结

- 密码模式（resource owner password credentials）(为遗留系统设计)(支持refresh token)
- 授权码模式（authorization code）(正宗方式)(支持refresh token)
- 简化模式（implicit）(为web浏览器应用设计)(不支持refresh token)
- 客户端模式（client credentials）(为后台api服务消费者设计)(不支持refresh token)

## 参考资料

- [spring-security-oauth-samples](https://github.com/spring-projects/spring-security-oauth/tree/master/samples)
- [官方schema.sql](https://github.com/spring-projects/spring-security-oauth/blob/master/spring-security-oauth2/src/test/resources/schema.sql)