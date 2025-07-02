---
title: "2024-01-30｜Mybatis plus和Jackson配置"
date: 2024-01-30
slug: til
categories: ["review"]
tags: [mybatis]
---



今天做了什么：

1. 重构 foodie-cloud 项目
   - 参考 DDD 组织包结构
   - Mybatis plus 配置主键生成策略和数据审计功能
   -  Jackson 配置日期序列化

## 重构 foodie-cloud 项目

### Mybatis plus 配置主键生成策略

实体类中可以不用添加@TableId，减少实体类对 mybatis-plus-annotation的依赖

```java
public class BaseEntity implements Serializable {
	private Long id;

	private LocalDateTime createTime;

	private LocalDateTime updateTime;
}
```

改为使用配置：

```yml
mybatis-plus:
  global-config:
    db-config:
      id-type: ASSIGN_ID
```



### Mybatis plus 配置数据审计功能

添加下面的类

```java
@Component
@Slf4j
public class CustomMetaObjecthandler implements MetaObjectHandler {
  protected static void fillValIfNullByName(
    final String fieldName,final Object fieldVal,
    final MetaObject metaObject,final boolean isCover) {
    // 1. 没有 set 方法
    if (!metaObject.hasSetter(fieldName)) {
      return;
    }
    // 2. 如果用户有手动设置的值
    if (metaObject.getValue(fieldName) != null && !isCover) {
      return;
    }
    // 3. field 类型相同时设置
    final Class<?> getterType = metaObject.getGetterType(fieldName);
    if (ClassUtils.isAssignableValue(getterType, fieldVal)) {
      metaObject.setValue(fieldName, fieldVal);
    }
  }

  @Override
  public void insertFill(final MetaObject metaObject) {
    final LocalDateTime now = LocalDateTime.now();
    final String username = SecurityContextHolder.getContext().getAuthentication().getName();

    log.info("公共字段自动填充[insert]: {},{}", now, username);

    fillValIfNullByName("createTime", now, metaObject, false);
    fillValIfNullByName("createUser", username, metaObject, false);
  }

  @Override
  public void updateFill(final MetaObject metaObject) {
    final LocalDateTime now = LocalDateTime.now();
    final String username = SecurityContextHolder.getContext().getAuthentication().getName();

    log.info("公共字段自动填充[update]: {},{}", now, username);

    fillValIfNullByName("updateTime", now, metaObject, true);
    fillValIfNullByName("updateUser", username, metaObject, true);
  }
}
```

并在实体类上的对应属性添加注解：

```java
@Getter
@Setter
public class BaseEntity implements Serializable {
  private static final long serialVersionUID = 6595513467381653081L;

  private Long id;

  @TableField(fill = FieldFill.INSERT)
  private LocalDateTime createTime;

  @TableField(fill = FieldFill.INSERT_UPDATE)
  private LocalDateTime updateTime;
}
```

###  Jackson 配置日期序列化

自定义一个 ObjectMapper：

```java
public class CustomObjectMapper extends ObjectMapper {
  public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
  public static final String DEFAULT_DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
  public static final String DEFAULT_TIME_FORMAT = "HH:mm:ss";

  public CustomObjectMapper() {
    //收到未知属性时不报异常
    this.configure(FAIL_ON_UNKNOWN_PROPERTIES, false);

    //反序列化时，属性不存在的兼容处理
    this.getDeserializationConfig().withoutFeatures(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

  final SimpleModule simpleModule = new SimpleModule()
    .addSerializer(BigInteger.class, ToStringSerializer.instance)
    .addSerializer(Long.class, ToStringSerializer.instance)
    .addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_FORMAT)))
    .addDeserializer(LocalDate.class, new LocalDateDeserializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_FORMAT)))
    .addDeserializer(LocalTime.class, new LocalTimeDeserializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_FORMAT)))
    .addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_TIME_FORMAT)))
    .addSerializer(LocalDate.class, new LocalDateSerializer(DateTimeFormatter.ofPattern(DEFAULT_DATE_FORMAT)))
    .addSerializer(LocalTime.class, new LocalTimeSerializer(DateTimeFormatter.ofPattern(DEFAULT_TIME_FORMAT)));

    //注册功能模块 例如，可以添加自定义序列化器和反序列化器
    this.registerModule(simpleModule);
  }
}
```

然后，注入的 spring 容器：

```java
@Configuration
public class JacksonConfig {
  @Bean
  @Primary
  public ObjectMapper objectMapper() {
    return new CustomObjectMapper();
  }
}
```

这样，就可以不用在 LocalDateTime 类型的属性上添加 @JsonFormat 注解。
