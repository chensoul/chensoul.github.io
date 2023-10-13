---
title: "[译]使用Spring进行REST的错误处理"
date: 2023-08-25T08:05:00+08:00
slug: exception-handling-for-rest-with-spring
categories: ["Java"]
tags: [java, spring, async]
---

## 1. 概述

本教程将说明如何使用 Spring 为 REST API 实现异常处理。我们还将获得一些历史概述，并了解不同版本引入了哪些新选项。

在 Spring 3.2 之前，Spring MVC 应用程序中处理异常的两种主要方法是 `HandlerExceptionResolver` 或 `@ExceptionHandler` 注解。两者都有一些明显的缺点。

从 3.2 开始，我们使用了 `@ControllerAdvice` 注释来解决前两个解决方案的局限性，并促进整个应用程序的统一异常处理。

现在 Spring 5 引入了 `ResponseStatusException` 类，一种在 REST API 中进行基本错误处理的快速方法。

所有这些都有一个共同点：它们很好地处理了关注点分离。应用程序可以正常抛出异常来指示某种失败，然后将单独处理。

最后，我们将了解 Spring Boot 带来的功能以及如何配置它以满足我们的需求。

## 2.方案一：控制器级@ExceptionHandler

第一个解决方案在 `@Controller `级别工作。我们将定义一个处理异常的方法并使用`@ExceptionHandler` 进行注释：

```java
public class FooController{

    //...
    @ExceptionHandler({ CustomException1.class, CustomException2.class })
    public void handleException() {
        //
    }
}
```

这种方法有一个主要缺点：· 注解的方法仅对特定的控制器有效，而不是对整个应用程序全局有效。当然，将其添加到每个控制器使其不太适合通用异常处理机制。

我们可以通过让所有控制器扩展基本控制器类来解决此限制。

然而，对于无论出于何种原因这是不可能的应用程序来说，此解决方案可能是一个问题。例如，控制器可能已经从另一个基类扩展，该基类可能位于另一个 jar 中或不可直接修改，或者本身可能不可直接修改。

接下来，我们将研究另一种解决异常处理问题的方法 - 一种全局的方法，不包括对现有工件（例如控制器）的任何更改。

## 3.解决方案 2：HandlerExceptionResolver

第二种解决方案是定义一个 `HandlerExceptionResolver`。这将解决应用程序抛出的任何异常。它还允许我们在 REST API 中实现统一的异常处理机制。

在选择自定义解析器之前，让我们先回顾一下现有的实现。

### 3.1.异常处理器异常解析器

该解析器是在 Spring 3.1 中引入的，并且在 `DispatcherServlet` 中默认启用。这实际上是前面介绍的 `@ExceptionHandler` 机制如何工作的核心组件。

### 3.2.默认处理程序异常解析器

这个解析器是在 Spring 3.0 中引入的，并且在 `DispatcherServlet` 中默认启用。

它用于将标准 Spring 异常解析为其相应的 HTTP 状态代码，即客户端错误 4xx 和服务器错误 5xx 状态代码。以下是它处理的 Spring 异常的完整列表以及它们如何映射到状态代码。

虽然它确实正确设置了响应的状态代码，但一个限制是它不会对响应正文设置任何内容。对于 REST API（状态代码实际上不足以向客户端提供足够的信息），响应还必须有一个正文，以允许应用程序提供有关失败的附加信息。

这可以通过 · 配置视图分辨率并渲染错误内容来解决，但该解决方案显然不是最优的。这就是为什么 Spring 3.2 引入了一个更好的选项，我们将在后面的部分中讨论。

### 3.3.响应状态异常解析器

这个解析器也在 Spring 3.0 中引入，并且在 · 中默认启用。

它的主要职责是使用自定义异常上可用的 `@ResponseStatus` 注释并将这些异常映射到 HTTP 状态代码。

这样的自定义异常可能如下所示：

```java
@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class MyResourceNotFoundException extends RuntimeException {
    public MyResourceNotFoundException() {
        super();
    }
    public MyResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    public MyResourceNotFoundException(String message) {
        super(message);
    }
    public MyResourceNotFoundException(Throwable cause) {
        super(cause);
    }
}
```

与 `DefaultHandlerExceptionResolver` 相同，此解析器在处理响应正文的方式上受到限制 - 它确实将状态代码映射到响应上，但正文仍然为空。

### 3.4.自定义 HandlerExceptionResolver

`DefaultHandlerExceptionResolver` 和 `ResponseStatusExceptionResolver` 的组合大大有助于为 Spring RESTful 服务提供良好的错误处理机制。如前所述，缺点是无法控制响应的正文。

理想情况下，我们希望能够输出 JSON 或 XML，具体取决于客户端要求的格式（通过 Accept 标头）。

仅此一点就证明创建一个新的自定义异常解析器是合理的：

```java
@Component
public class RestResponseStatusExceptionResolver extends AbstractHandlerExceptionResolver {

    @Override
    protected ModelAndView doResolveException(
      HttpServletRequest request,
      HttpServletResponse response,
      Object handler,
      Exception ex) {
        try {
            if (ex instanceof IllegalArgumentException) {
                return handleIllegalArgument(
                  (IllegalArgumentException) ex, response, handler);
            }
            ...
        } catch (Exception handlerException) {
            logger.warn("Handling of [" + ex.getClass().getName() + "]
              resulted in Exception", handlerException);
        }
        return null;
    }

    private ModelAndView
      handleIllegalArgument(IllegalArgumentException ex, HttpServletResponse response)
      throws IOException {
        response.sendError(HttpServletResponse.SC_CONFLICT);
        String accept = request.getHeader(HttpHeaders.ACCEPT);
        ...
        return new ModelAndView();
    }
}
```

这里需要注意的一个细节是我们可以访问请求本身，因此我们可以考虑客户端发送的 Accept 标头的值。

例如，如果客户端请求 `application/json`，那么在出现错误情况时，我们希望确保返回用 `application/json` 编码的响应正文。

另一个重要的实现细节是我们返回一个 `ModelAndView`——这是响应的主体，它将允许我们对其进行必要的设置。

这种方法是一种一致且易于配置的机制，用于 Spring REST 服务的错 ​​ 误处理。

然而，它确实有局限性：它与低级 `HtttpServletResponse` 交互，并且适合使用 ModelAndView 的旧 MVC `模型`，因此仍有改进的空间。

## 4.解决方案 3：@ControllerAdvice

Spring 3.2 通过 `@ControllerAdvice` 注释支持全局 `@ExceptionHandler`。

这实现了一种脱离旧 MVC 模型的机制，并利用 `ResponseEntity` 以及 `@ExceptionHandler` 的类型安全性和灵活性：

```java
@ControllerAdvice
public class RestResponseEntityExceptionHandler
  extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value
      = { IllegalArgumentException.class, IllegalStateException.class })
    protected ResponseEntity<Object> handleConflict(
      RuntimeException ex, WebRequest request) {
        String bodyOfResponse = "This should be application specific";
        return handleExceptionInternal(ex, bodyOfResponse,
          new HttpHeaders(), HttpStatus.CONFLICT, request);
    }
}
```

`@ControllerAdvice` 注释允许我们将之前的多个分散的 `@ExceptionHandler` 合并到一个全局错误处理组件中。

实际的机制非常简单但也非常灵活：

- 它使我们能够完全控制响应正文以及状态代码。
- 它提供了多个异常到同一方法的映射，以便一起处理。
- 它充分利用了较新的 RESTful `ResposeEntity` 响应。

这里要记住的一件事是将使用 `@ExceptionHandler` 声明的异常与用作方法参数的异常相匹配。

如果它们不匹配，编译器不会抱怨——没有理由应该抱怨——Spring 也不会抱怨。

然而，当异常在运行时实际抛出时，异常解决机制将失败，并显示：

```bash
java.lang.IllegalStateException: No suitable resolver for argument [0] [type=...]
HandlerMethod details: ...
```

## 5.解决方案 4：ResponseStatusException（Spring 5 及以上版本）

Spring 5 引入了 `ResponseStatusException` 类。

我们可以创建它的一个实例，提供 `HttpStatus` 和可选的原因：

```java
@GetMapping(value = "/{id}")
public Foo findById(@PathVariable("id") Long id, HttpServletResponse response) {
    try {
        Foo resourceById = RestPreconditions.checkFound(service.findOne(id));

        eventPublisher.publishEvent(new SingleResourceRetrievedEvent(this, response));
        return resourceById;
     }
    catch (MyResourceNotFoundException exc) {
         throw new ResponseStatusException(
           HttpStatus.NOT_FOUND, "Foo Not Found", exc);
    }
}
```

使用 `ResponseStatusException` 有什么好处？

- 非常适合原型设计：我们可以非常快速地实施基本解决方案。
- 一种类型，多个状态代码：一种异常类型可以导致多种不同的响应。与 @ExceptionHandler 相比，这减少了紧密耦合。
- 我们不必创建那么多自定义异常类。
- 由于可以通过编程方式创建异常，因此我们可以更好地控制异常处理。

那么权衡又如何呢？

- 没有统一的异常处理方式：与提供全局方法的 `@ControllerAdvice` 相比，强制执行一些应用程序范围的约定更加困难。
- 代码重复：我们可能会发现自己在多个控制器中复制代码。

我们还应该注意到，可以在一个应用程序中组合不同的方法。

例如，我们可以全局实现 `@ControllerAdvice`，也可以在本地实现 `ResponseStatusExceptions`。

但是，我们需要小心：如果可以通过多种方式处理相同的异常，我们可能会注意到一些令人惊讶的行为。一种可能的约定是始终以一种方式处理一种特定类型的异常。

有关更多详细信息和更多示例，请参阅有关 [ResponseStatusException 的教程](https://www.baeldung.com/spring-response-status-exception)。

## 6.处理 Spring Security 中拒绝访问的情况

当经过身份验证的用户尝试访问他没有足够权限访问的资源时，就会发生访问被拒绝的情况。

### 6.1. REST 和方法级安全性

最后，让我们看看如何处理方法级安全注解 `@PreAuthorize`、`@PostAuthorize` 和 `@Secure` 抛出的 `Access Denied` 异常。

当然，我们也将使用前面讨论的全局异常处理机制来处理 `AccessDeniedException`：

```java
@ControllerAdvice
public class RestResponseEntityExceptionHandler
  extends ResponseEntityExceptionHandler {

    @ExceptionHandler({ AccessDeniedException.class })
    public ResponseEntity<Object> handleAccessDeniedException(
      Exception ex, WebRequest request) {
        return new ResponseEntity<Object>(
          "Access denied message here", new HttpHeaders(), HttpStatus.FORBIDDEN);
    }

    ...
}
```

## 7. Spring Boot 支持

Spring Boot 提供了 `ErrorController` 实现来以合理的方式处理错误。

简而言之，它为浏览器提供后备错误页面（也称为 Whitelabel 错误页面），并为 RESTful、非 HTML 请求提供 JSON 响应：

```json
{
  "timestamp": "2019-01-17T16:12:45.977+0000",
  "status": 500,
  "error": "Internal Server Error",
  "message": "Error processing the request!",
  "path": "/my-endpoint-with-exceptions"
}
```

与往常一样，Spring Boot 允许使用属性配置这些功能：

- `server.error.whitelabel.enabled`: 可用于禁用 Whitelabel 错误页面并依赖 servlet 容器提供 HTML 错误消息
- `server.error.include-stacktrace`: 具有始终值；在 HTML 和 JSON 默认响应中包含堆栈跟踪
- `server.error.include-message`: 从 2.3 版本开始，Spring Boot 隐藏了响应中的 `message` 字段，以避免泄露敏感信息；我们可以使用带有 `always` 值的这个属性来启用它

除了这些属性之外，我们还可以为` /error` 提供我们自己的视图解析器映射，覆盖白标签页面。

我们还可以通过在上下文中包含 `ErrorAttributes` bean 来自定义要在响应中显示的属性。我们可以扩展 Spring Boot 提供的 `DefaultErrorAttributes` 类来使事情变得更简单：

```java
@Component
public class MyCustomErrorAttributes extends DefaultErrorAttributes {

    @Override
    public Map<String, Object> getErrorAttributes(
      WebRequest webRequest, ErrorAttributeOptions options) {
        Map<String, Object> errorAttributes =
          super.getErrorAttributes(webRequest, options);
        errorAttributes.put("locale", webRequest.getLocale()
            .toString());
        errorAttributes.remove("error");

        //...

        return errorAttributes;
    }
}
```

如果我们想进一步定义（或覆盖）应用程序如何处理特定内容类型的错误，我们可以注册一个 `ErrorController` bean。

同样，我们可以利用 Spring Boot 提供的默认 `BasicErrorController` 来帮助我们。

例如，假设我们想要自定义应用程序如何处理 XML 端点中触发的错误。我们所要做的就是使用 `@RequestMapping` 定义一个公共方法，并声明它生成 `application/xm`l 媒体类型：

```java
@Component
public class MyErrorController extends BasicErrorController {

    public MyErrorController(
      ErrorAttributes errorAttributes, ServerProperties serverProperties) {
        super(errorAttributes, serverProperties.getError());
    }

    @RequestMapping(produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<Map<String, Object>> xmlError(HttpServletRequest request) {

    // ...

    }
}
```

注意：这里我们仍然依赖于我们项目中可能定义的 `server.error.*` 引导属性，这些属性绑定到 `ServerProperties` bean。

## 8. 结论

本文讨论了在 Spring 中实现 REST API 异常处理机制的几种方法，从旧的机制开始，继续提供 Spring 3.2 支持，一直到 4.x 和 5.x。

与往常一样，本文中提供的代码可以在 [GitHub](https://github.com/eugenp/tutorials/tree/master/spring-boot-rest) 上获取。

Spring Security 相关的代码可以查看 [spring-security-rest](https://github.com/eugenp/tutorials/tree/master/spring-security-modules/spring-security-web-rest) 模块。

原文链接：[https://www.baeldung.com/exception-handling-for-rest-with-spring](https://www.baeldung.com/exception-handling-for-rest-with-spring)
