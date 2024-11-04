---
title: "[译]OAuth2 with Spring 第4部分：Spring授权客户端与Google授权服务器的社交登录演示"
date: 2024-06-05
type: post
slug: oauth2-with-spring-part-4-spring-authorization-client-social-login-demo-with-google
categories: ["spring-boot"]
tags: [ oauth2,java]
---

原文地址：<https://mainul35.medium.com/oauth2-with-spring-part-4-spring-authorization-client-social-login-demo-with-google-be6097ec18a5>



在[之前的文章](/posts/2024/06/05/oauth2-with-spring-part-3-authorizing-oidc-client-with-via-authorization-code-grant-from-spring/)中，我们学习了如何使用 OIDC 连接到我们自己的授权服务器。我们在自托管授权服务器中定义了我们自己的客户端应用程序。在今天的文章中，我们将使用 Google 和 GitHub 作为我们的授权服务器，并将我们的授权客户端应用程序连接到这些授权服务器并从它们接收令牌。应用程序登录屏幕将如下所示。

![img](https://miro.medium.com/v2/resize:fit:1400/1*cFT5m5Kcfv2siHRYeUZAtg.png)

为了实现这一点，我们需要将我们的授权客户端应用程序注册为 Google 授权服务器中的客户端，并使用客户端应用程序中的客户端凭据以及可用范围。

## Google 授权服务器中的客户端注册

我们需要在 Google 开发者控制台中创建一个应用程序并配置必要的内容。

打开浏览器并转到[https://console.developers.google.com/](https://console.developers.google.com/)。您将看到如图 1 所示的屏幕。

![img](https://miro.medium.com/v2/resize:fit:1400/1*H4Q4NcQ6dmHu61QgHSt4Cg.png)

图。1

从这里，选择下拉菜单以选择一个项目（1.1）。它将显示一个像上面一样的弹出窗口。从弹出窗口中，单击**“新建项目”**按钮（1.2）。由于我已经创建了我的应用程序并将我的应用程序命名为google-auth-server-demo（1.3），所以我不会再创建新的应用程序了*。*

创建应用程序后，从上面的屏幕中选择您的应用程序，您将看到仪表板。从左侧导航中，单击**API 和服务**和页面。由于我们目前对列表中的任何 Google 服务都不感兴趣，我们可以单击左侧导航中的**凭据 (2.1) 。但如果您有兴趣从客户端应用程序中使用任何 Google 服务，您可能会发现**[这篇文章](https://medium.com/@mainul35/access-google-drive-data-with-spring-boot-58caeb2885e0)很有趣，[我在其中演示了如何访问 Google Drive 数据](https://medium.com/@mainul35/access-google-drive-data-with-spring-boot-58caeb2885e0)。

![img](https://miro.medium.com/v2/resize:fit:1400/1*8zpYVwqrYtC75zfwf1RlLg.png)

图 2

它将带我们进入以下页面。

![img](https://miro.medium.com/v2/resize:fit:1400/1*NVyr2Ohds_lOZ0oF6D9PJQ.png)

图 3

从这里，我们可以创建新的凭证 (3.1)。由于我们已经创建了凭证 (3.2)，我们可以编辑它 (3.3) 以查看我们如何配置它。

![img](https://miro.medium.com/v2/resize:fit:1400/1*5kC-tmi_WcMEcCsdg8Zk7w.png)

图 4

在客户端注册页面，我们配置了客户端名称（4.1）、授权 JS 来源（4.2）以注册以应对 CORS 安全问题，授权重定向 URI（4.3）。当我们第一次点击**保存**按钮（4.4）时，它会为我们生成客户端 ID（4.5）和客户端密钥（4.6）。

我们需要在客户端应用程序的配置文件即application.yml中使用这些客户端ID、客户端密钥和重定向URI。

**在授权客户端 application.yml 文件中使用上述信息：**

[该配置与我们第 3 部分](https://medium.com/@mainul35/oauth2-with-spring-part-3-authorizing-oidc-client-with-via-authorization-code-grant-from-spring-67769f9dd68a)的客户端配置部分非常相似。

```yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: "615531537634-806j95c1s18uundif9nl4oggcag7lcm6.apps.googleusercontent.com"
            client-secret: "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"
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
```

现在，我们需要在 Google 授权服务器中设置同意屏幕，以允许客户端应用程序请求所需的范围。

要进入同意屏幕，我们需要单击左侧导航栏中的**Oauth 同意屏幕（5.1）。**

![img](https://miro.medium.com/v2/resize:fit:1400/1*hEVXtIk2fd5AsH9fi-4KpA.png)

图 5

我已经创建了同意屏幕，所以让我们通过编辑应用程序看看我做了什么（5.2）

![img](https://miro.medium.com/v2/resize:fit:1400/1*j38r89aeWfbtOceFVM8Opw.png)

图 6

此屏幕已在屏幕右侧详细记录（6.1）。遵循这些准则并保存以继续执行步骤 2：范围（6.2）

![img](https://miro.medium.com/v2/resize:fit:1400/1*ja6jTqqQ7TRjhsRFFHcguQ.png)

图 7

在上面的屏幕上，单击**“添加或删除范围”**按钮 (7.1)，右侧会打开一个弹出窗口。从这个弹出窗口中，我们为我们的演示 (7.2) 选择了几个最低要求的范围，然后单击**“更新”**按钮 (7.3)。更新后，这些范围将显示在图 7 的 (7.4) 部分中。

当我们从此范围步骤单击**“保存并继续”**按钮时，我们可以从客户端应用程序添加一些测试用户来测试。

![img](https://miro.medium.com/v2/resize:fit:1400/1*U2GKSFgAWDFHLUdV2KqfrA.png)

图 8

为了测试目的，我们只允许 2 个用户（8.1）。

现在，一旦我们保存了步骤 3 和步骤 4，我们就可以准备在客户端应用程序中使用这些范围了。

让我们使用这些范围来更新前面提到的 application.yml 文件。

**更新 application.yml**

```yml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: "615531537634-806j95c1s18uundif9nl4oggcag7lcm6.apps.googleusercontent.com"
            client-secret: "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"
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
            scope:
              - https://www.googleapis.com/auth/userinfo.email
              - https://www.googleapis.com/auth/userinfo.profile
              - openid
```

我们还需要更新我们的服务代码以适应 Google 授权服务器 (9.1) 的范围。

![img](https://miro.medium.com/v2/resize:fit:1400/1*VFa-F8GFwHNq7ZfYncEOAw.png)

图 9

现在让我们测试一下我们的应用程序。让我们访问http://localhost:8081/private-data，它将带我们进入登录页面 (10.1)。从这里选择 Google 作为授权服务器 (10.2)。

![img](https://miro.medium.com/v2/resize:fit:1400/1*ePkYimzmdLdR-4jNRnfD3g.png)

图 10

我们将被重定向到 Google 帐户选择页面。由于我们仅允许 2 个帐户用于测试目的，因此我们将选择其中一个帐户 (11.1)。

![img](https://miro.medium.com/v2/resize:fit:1400/1*AvzoZBWa6qIj6bOY_Imh0A.png)

图 11

现在，一旦我们选择了正确的帐户，谷歌就会将我们重定向到我们的授权客户端应用程序的重定向 URI，并且我们将能够看到我们的私人数据（图 12），因为这是对我们服务器的已保存请求。

![img](https://miro.medium.com/v2/resize:fit:1400/1*Podr7TdG7EFRhuIzN5uj8w.png)

图 12

感谢您的耐心阅读。源代码可以[在这里](https://github.com/mainul35/authorization-server-demo/tree/authorization-server-demo/social-login-with-third-party-auth-server/social-login-client)找到。

在[下一篇文章](/posts/2024/06/05/oauth2-with-spring-part-5-securing-your-spring-boot-application-with-pkce-for-enhanced-security/)中，我们将讨论用于增强安全性的 PKCE。
