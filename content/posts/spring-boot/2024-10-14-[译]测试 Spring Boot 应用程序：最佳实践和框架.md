---
title: "[译]测试 Spring Boot 应用程序：最佳实践和框架"
date: 2024-10-14
type: post
slug: testing-spring-boot-applications-best-practices-and-frameworks
categories: ["spring-boot"]
tags: [ spring-boot]
---

测试是软件开发不可或缺的一部分。它可确保您的 Spring Boot 应用程序按预期运行，并在不断发展的过程中继续保持这种状态。在本文中，我们将探讨如何使用最佳实践和工具测试 Spring Boot 应用程序。

# 为什么测试很重要

测试至关重要，原因如下：

1. 可靠性：它确保您的应用程序正确、可靠地运行。
2. 错误检测：它有助于在开发早期识别和修复问题。
3. 重构：它允许自信地重构代码，因此现有功能不会中断。
4. 文档：编写良好的测试可以作为代码的活文档。

# 测试类型

Spring Boot 应用程序可以在各个级别进行测试，包括：

1. 单元测试：单独测试各个组件，例如类或方法。
2. 集成测试：验证不同的组件或服务是否能正确地协同工作。
3. 功能测试：从用户的角度测试应用程序的功能。
4. 端到端测试：在类似生产的环境中测试整个应用程序，包括其外部依赖项。

# 测试 Spring Boot 应用程序的最佳实践

## 1.保持测试隔离

确保测试彼此独立。每个测试都应设置其所需的上下文、运行它并拆除它创建的任何资源。这可以防止一个测试影响另一个测试的结果。

## 2.使用 Spring Boot 的测试注解

Spring Boot 提供了诸如`@SpringBootTest`、`@DataJpaTest`和`@WebMvcTest`之类的测试注释，可简化应用程序特定部分的测试。使用它们可以仅加载应用程序上下文的必要部分，从而提高测试效率。以下是一些示例。

**a.使用 @SpringBootTest 加载整个Spring上下文。**

`@SpringBootTest`是用于为测试加载整个 Spring 上下文的注释。这在同时测试应用程序中的多个组件时非常有用。使用注释`@Test`来标记测试方法。

下面是一个解释如何使用 Mockito 和 JUnit 的示例。

```xml
<!-- Adding JUnit 5(jupiter) and mockito dependencies to our pom.xml -->
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-engine</artifactId>
    <version>5.9.2</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-core</artifactId>
    <version>5.3.1</version>
    <scope>test</scope>
</dependency>
```

```java
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import com.employee.service.EmployeeService;
import com.employee.dao.EmployeeRepository;
import com.employee.dto.Employee;
import java.util.Optional;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

@SpringBootTest
@ExtendWith(MockitoExtension.class)
public class EmployeeServiceTests {

 @InjectMocks
 private EmployeeService employeeService;

 @Mock
 private EmployeeRepository employeeRepository;

 @Test
 public void testGetEmployeeById() {
  // Arrange
  long employeeId = 1L;
  Employee mockEmployee = new Employee(employeeId, "John Doe", "john.doe@example.com");

  // Mock the behavior of the repository to return the mock employee
  Mockito.when(employeeRepository.findById(employeeId)).thenReturn(Optional.of(mockEmployee));

  // Act
  Employee result = employeeService.getEmployeeById(employeeId);

  // Assert
  assertNotNull(result);
  assertEquals(employeeId, result.getId());
  assertEquals("John Doe", result.getName());
  assertEquals("john.doe@example.com", result.getEmail());
 }
}
```



**b. 使用 MockMvc 模拟 HTTP 请求并测试控制器的响应。使用 @AutoConfigureMockMvc 自动配置 MockMvc。**

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

@SpringBootTest
@AutoConfigureMockMvc
public class GreetingControllerTest {
    
  @Autowired
  private MockMvc mockMvc;

  @Test
  public void testGreetEndpoint() throws Exception {
    mockMvc.perform(MockMvcRequestBuilders.get("/greet"))
       .andExpect(MockMvcResultMatchers.status().isOk());
  }
}
```

**c. 使用 @MockBean 模拟实现来替换真实 bean。**

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.user.service.UserService;
import com.user.dao.UserRepository;
import com.user.dto.User;
import static org.mockito.Mockito.when;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class UserServiceTest {

  @Autowired
  private UserService userService;

  @MockBean
  private UserRepository userRepository;

  @Test
  public void testFindUserByUsername() {
   // Define a sample user
   User sampleUser = new User();
   sampleUser.setId(1L);
   sampleUser.setUsername("john_doe");
   sampleUser.setEmail("john@example.com");
  
   // Mock the repository behavior
   when(userRepository.findByUsername("john_doe")).thenReturn(sampleUser);
  
   // Perform the test
   User foundUser = userService.findUserByUsername("john_doe");
  
   // Assertions
   assertThat(foundUser).isNotNull();
   assertThat(foundUser.getUsername()).isEqualTo("john_doe");
   assertThat(foundUser.getEmail()).isEqualTo("john@example.com");
  }
}
```

`@Mock`用于在 Spring 上下文之外进行单元测试和模拟对象，而`@MockBean`用于 Spring Boot 集成测试，以在 Spring 应用程序上下文中用模拟或间谍版本替换真实 bean。

**d.使用 @DataJpaTest 测试具有嵌入式数据库的存储库。**

如果您在 Spring Boot 应用程序中使用 JPA，`@DataJpaTest`则仅加载与 JPA 测试相关的组件，例如实体类、存储库接口和必要的 Spring Data JPA 配置。

默认情况下，Spring Boot在使用时会为每一个测试方法创建一个事务`@DataJpaTest`，并在每个测试方法结束时回滚事务。

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import com.user.dao.UserRepository;
import com.user.dto.User;
import static org.junit.Assert.*;

@DataJpaTest
public class UserRepositoryTest {
    
  @Autowired
  private UserRepository userRepository;
  
  @Test
  public void testGetAllUsers() {
    User user = userRepository.updateUserById(1,"Tom");
    assertNotNull(user);
  }
}
```

**e.使用配置 @AutoConfigureTestDatabase 测试数据库。**

使用时`@DataJpaTest`，Spring Boot 将自动为您的测试配置内存中的 H2 数据库，让您无需单独的数据库实例即可轻松测试数据库查询。但是，如果您需要不同的数据库，则可以使用注释`@AutoConfigureTestDatabase`进行配置。

```java
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import com.user.dao.UserRepository;
import com.user.dto.User;
import static org.junit.Assert.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
public class UserRepositoryTest {
    
  @Autowired
  private UserRepository userRepository;
  
  @Test
  public void testGetUsersNotNull() {
    List<User> userList = userRepository.getUsers();
    
    assertNotNull(userList);
  }
}
```

`@AutoConfigureTestDatabase(replace = Replace.NONE)`配置测试数据库行为。在本例中，它不替换任何内容，而是使用 application.properties 或 application.yml 中指定的默认数据库配置。

**f.使用 @BeforeEach 和 @AfterEach 设置和拆除测试夹具。**

这些注释允许您定义在每个测试方法之前和之后运行的方法。

```java
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import com.employee.service.EmployeeService;
import static org.junit.Assert.*;

@SpringBootTest
public class EmployeeServiceTest {
    
  private EmployeeService employeeService;
  
  @BeforeEach
  public void setUp() {
    // Initialize the EmployeeService or set up resources if needed
    employeeService = new EmployeeService();    
  }
  
  @AfterEach
  public void tearDown() {
    // Clean up resources or perform other cleanup tasks
    employeeService = null;
  }
  
  @Test
  public void testGenerateWelcomeMessage() {
    String name = "John";
    String welcomeMessage = employeeService.generateWelcomeMessage(name);
  
    assertEquals("Welcome, John!", welcomeMessage);
  }
}
```

## 3. 测试配置

Spring Boot 允许您为不同的配置文件（例如`application.properties`，`application-test.properties`）配置不同的应用程序属性。它允许您创建自定义测试配置，而不会影响主应用程序上下文。

**a. 使用 @TestConfiguration 提供额外的 bean 以供测试。**

`@SpringBootTest`将引导整个应用程序上下文，这意味着您可以将组件扫描拾取的任何 bean 自动装配到我们的测试中。您可能希望避免引导实际的应用程序上下文，而是使用特殊的测试配置。您可以使用`@TestConfiguration`注释来实现这一点。有两种使用注释的方法。

*i. 在我们想要自动装配 bean 的同一个测试类中创建一个静态内部类。*

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.Assert.*;
import com.employee.service.EmployeeService;

@SpringBootTest
public class EmployeeServiceTest {
    
  @TestConfiguration
  public static class TestEmployeeServiceConfig {    
      @Bean
      public EmployeeService employeeService() {
         return new EmployeeService();
      }
  }
  
  @Autowired
  private EmployeeService employeeService;
  
  @Test
  public void testWelcomeMessage() {
    String message = employeeService.getWelcomeMessage();
    
    assertEquals("Welcome", message);
  }
}
```

*ii. 创建一个单独的测试配置类并使用*`@Import`*注释导入它。*

```java
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import com.employee.service.EmployeeService;

@TestConfiguration
public class TestEmployeeServiceConfig {
    
  @Bean
  public EmployeeService employeeService() {
    return new EmployeeService();
  }
}
```

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import com.employee.service.EmployeeService;
import static org.junit.Assert.*;

@SpringBootTest
@Import(TestEmployeeServiceConfig.class)
public class EmployeeServiceTest {
    
  @Autowired
  private EmployeeService employeeService;
  
  @Test
  public void testWelcomeMessage() {
    String message = employeeService.getWelcomeMessage();
  
    assertEquals("Simform Welcomes You", message);
  }
}
```



**b.使用 @ConfigurationProperties 从配置文件注入属性。**

```java
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "app")
@ConfigurationPropertiesScan
public class AppProperties {
    
  private String appName;
  
  private String appVersion;
  
  // Getters and setters
}
```

```properties
#Add the configuration properties to your application's property file
app.appName=Keka
app.appVersion=5.0
```

Spring 将自动将我们属性文件中定义的任何属性与前缀*app*绑定，并与 AppProperties 类中的字段之一同名。然后，您可以通过自动装配`AppProperties`bean 在测试 bean 中使用这些属性。

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.app.service.ApplicationService;
import com.app.properties.AppProperties;
import com.app.dto.Application;
import static org.junit.Assert.*;

@SpringBootTest
public class ApplicationServiceTest {
    
  @Autowired
  private AppProperties properties;
  
  @Autowired
  private ApplicationService applicationService;
  
  @Test
  public void testMyMethod() {
    Application app = applicationService.getDetailsbyName(properties.getAppName());
    
    assertNotNull(app);
  }
}
```

**c.@ActiveProfiles当您有多个配置文件时，使用激活特定配置文件进行测试。**

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import com.employee.service.EmployeeService;
import static org.junit.Assert.*;

@SpringBootTest
@ActiveProfiles({"test","dev"})
public class EmployeeServiceTest {
    
  @Autowired
  private EmployeeService employeeService;
  
  @Test
  public void testGetEmployeeCount() {
    int empCount = employeeService.getEmployeeCount();
    
    assertTrue(empCount>0);
  }
}
```

**d .使用@DynamicPropertySource设置测试的动态配置属性。**

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import com.user.service.UserService;
import com.user.dto.User;
import static org.junit.Assert.*;

@SpringBootTest
public class DynamicPropertyTest {
    
  @Autowired
  private UserService userService;
  
  @DynamicPropertySource
  static void properties(DynamicPropertyRegistry registry) {
    registry.add("custom.name", () -> "Jack");
  }
  
  @Value("${custom.name}")
  private String customName;
  
  @Test
  public void testGetUserByName() {
    
    User user = userService.getUserByName(customName);
  
    assertNotNull(user);
  }
}
```

**e. 使用 @DirtiesContext 在测试后重置 Spring 上下文。**

如果您有修改 Spring 上下文的测试，例如添加或修改 Bean，则可能需要在每次测试之后重置上下文，以确保后续测试从干净的上下文开始。`@DirtiesContext`在需要确保每个测试方法都在全新且隔离的应用程序上下文中运行的场景中很有用。

1. 用法：

- 您可以使用 注释单个测试方法或整个测试类`@DirtiesContext`。
- 当应用于测试方法时，只有该特定的测试方法才会触发上下文重置。
- 当应用于测试类时，它会影响该类中的所有测试方法，导致每次测试方法之后重置上下文。

2.用例：

- `@DirtiesContext`通常在测试方法对 Spring 应用程序上下文有副作用并且无法通过常规事务或回滚机制撤消时使用。
- 例如，如果测试方法以影响后续测试的方式修改了单例 bean 的状态，则可以使用`@DirtiesContext`重置上下文。

3.影响：

- 重置应用程序上下文在性能方面可能会相对昂贵，因此请谨慎使用。
- 它不应被用作所有测试的默认方法。相反，应考虑仅在必要时使用它来解决特定的测试挑战。

**f.使用 RestTemplate 发出 HTTP 请求。**

`RestTemplate`用于发出 HTTP 请求以与 RESTful Web 服务或 API 进行交互。

- 通常用于生产代码。
- 支持向外部服务发出实际的 HTTP 请求。
- 通常用于与正在运行的应用程序中的实际服务交互。

```java
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpStatusCode;
import static org.junit.Assert.*;

@SpringBootTest
public class ExternalServiceTest {
    
  @Test
  public void testExampleApi() {
    RestTemplate restTemplate = new RestTemplate();
    String url = "http://api.example.com/data";
    ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
    
    assertFalse(response.getStatusCode() == HttpStatusCode.valueOf(404))
  }
}
```

**g. 使用@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)在随机端口上启动服务器。使用TestRestTemplate发出 HTTP 请求并断言响应。**

如果您需要测试应用程序与外部系统（例如数据库或其他微服务）的集成，则可能必须在随机端口上启动服务器。

`TestRestTemplate`是 的一个子类`RestTemplate`，专门用于 Springboot 应用程序的集成测试。它允许您像外部客户端一样向应用程序的 RESTful 端点发出 HTTP 请求。

- 通常用于集成测试。
- 允许您测试应用程序的端点，而无需发出实际的外部请求。

```java
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.client.TestRestTemplate.HttpClientOption;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class LocalEndpointTest {
      
  @LocalServerPort
  private int port;
  
  @Autowired
  private TestRestTemplate restTemplate;
  
  @Test
  public void testGetBusinesses(){
    String url = "http://localhost:" + port + "/getBusinesses";
    ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
    
    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isEqualTo("Expected response body");
  }
}
```

**h. 使用@Sql在测试之前和之后执行 SQL 脚本。**

```java
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.junit.jupiter.api.Test;

@SpringBootTest
public class IntegrationTest {

  @Test
  @Sql(scripts = { "/init-database.sql", "/populate-data.sql" }, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
  public void testWithSqlScripts() {
    // Sql scripts get executed before the execution of this block
  }

  @Test
  @Sql(scripts = "/cleanup.sql", executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
  public void testWithCleanupSql() {
    // Sql scripts get executed after the execution of this block
  }
}

```

**i. 使用 @Disabled 暂时禁用测试。**

```java
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import com.employee.service.EmployeeService;
import com.employee.dto.Employee;
import static org.junit.Assert.*;

@SpringBootTest
public class EmployeeServiceTest {
  
  @Autowired
  private EmployeeService employeeService;
  
  @Disabled("Temporarily disabled until bug XYZ is fixed")
  @Test
  public void testGetEmployees() {
    // Test will be skipped
    Employee employee = employeeService.getEmployeeByName("Harry");
    assertNotNull(employee);
  }
  
  @Test
  public void testGetEmployeeCount() {
    // Test will be executed
    int empCount = employeeService.getEmployeeCount();
    assertTrue(empCount>0);
  }
}
```

整个类也可以注释为`@Disabled`*。*

**j. 使用@RepeatedTest重复测试指定的次数。**

```java
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.RepetitionInfo;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import com.user.service.UserService;
import static org.junit.Assert.*;

@SpringBootTest
public class UserServiceTest {
  
  @Autowired
  private UserService userService;

  @RepeatedTest(5) /This test will run 5 times
  public void testGetUserCount() {
    int count = userService.getUserCount();
    assertTrue(count>0);
  }

  @RepeatedTest(3) /This test will run 3 times
  public void testGetLoggedInUsers(RepetitionInfo repetitionInfo) {
    int currentRepetition = repetitionInfo.getCurrentRepetition();
    int totalRepetitions = repetitionInfo.getTotalRepetitions();
  
    // Test logic, using currentRepetition and totalRepetitions
    RestTemplate restTemplate = new RestTemplate();
    String url = "http://api.example.com/getLoggedInUsers";
    ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
    if(response.getBody() != null) {   
      System.out.println("CurrentRepetition: " + currentRepetition);
    }
  }
}
```

## 4.测试覆盖率

使用 SonarQube 或 Jacoco 等代码覆盖率工具来测量测试的覆盖率。以高代码覆盖率为目标，确保大多数代码都经过测试。

# 测试框架

Spring Boot 应用程序中常用有几种测试工具，包括：

1. JUnit：一种广泛使用的 Java 测试框架。
2. Mockito：用于在测试中创建模拟对象的模拟框架。
3. Testcontainers：提供用于测试的轻量级、一次性的常用数据库或服务实例。
4. Spring Boot 测试：提供用于测试 Spring Boot 应用程序的注释和实用程序。
5. RestAssured：一种用于简化 REST 服务测试的 Java DSL。
6. Selenium：用于Web应用程序测试，尤其是端到端测试。
7. Jacoco：一种代码覆盖率分析工具，可帮助您识别代码库中需要更多测试的区域。
8. WireMock：一种模拟 HTTP 服务的工具，可用于测试外部服务交互。

# 结论

通过遵循最佳实践并利用正确的测试工具，您可以确保测试可靠、可维护且能够有效地发现应用程序中的错误。持续的测试将提高代码质量、减少错误并提高用户满意度。

*快乐学习！*

> **请继续关注**[**Simform Engineering**](https://medium.com/simform-engineering)**博客，了解有关最新工具和技术的更多更新。**
>
> **关注我们：**[**Twitter**](https://twitter.com/simform) **|** [**LinkedIn**](https://www.linkedin.com/company/simform/)



原文链接：[https://medium.com/simform-engineering/testing-spring-boot-applications-best-practices-and-frameworks-6294e1068516](https://medium.com/simform-engineering/testing-spring-boot-applications-best-practices-and-frameworks-6294e1068516)
