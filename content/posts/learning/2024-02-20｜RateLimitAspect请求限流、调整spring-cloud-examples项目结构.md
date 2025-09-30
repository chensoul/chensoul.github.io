---
title: "2024-02-20｜RateLimitAspect请求限流、调整spring-cloud-examples项目结构"
date: 2024-02-20
slug: til
categories: ["learning"]
tags: ['java', 'redis', 'microservice', 'tutorial']
---

今天做了什么：

1. ChatGPT 编写一个 RateLimitAspect 类，实现基于用户的 get 查询请求的限流功能
<!--more-->

   ```java
   @Aspect
   @Component
   public class RateLimitAspect {
     private final RedisTemplate<String, Object> redisTemplate;
     private final Logger logger = LoggerFactory.getLogger(RateLimitAspect.class);
   
     private final int maxRequests; // Maximum number of requests
     private final int timeWindow; // Time window in seconds
   
     @Autowired
     public RateLimitAspect(RedisTemplate<String, Object> redisTemplate) {
         this.redisTemplate = redisTemplate;
         this.maxRequests = 100; // Default maximum number of requests is 100
         this.timeWindow = 60; // Default time window is 60 seconds
     }
   
     @Before("@annotation(getMapping)")
     public void applyRateLimit(JoinPoint joinPoint, GetMapping getMapping) {
         HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder
            .getRequestAttributes()).getRequest();
         if (request != null && HttpMethod.GET.matches(request.getMethod())) {
             String username = request.getUserPrincipal().getName(); // Get the username
             if (username != null && !username.isEmpty()) {
                 String rateLimitKey = "rate_limit:" + username;
                 incrementAndCheckRateLimit(rateLimitKey, request);
             }
         }
     }
   
     private void incrementAndCheckRateLimit(String rateLimitKey, HttpServletRequest request) {
         Long currentRequests = redisTemplate.execute((RedisCallback<Long>) connection -> {
             Object nativeConnection = connection.getNativeConnection();
             String script = "local current = redis.call('INCR', KEYS[1])\n"
                     + "if tonumber(current) == 1 then\n"
                     + "    redis.call('EXPIRE', KEYS[1], ARGV[1])\n"
                     + "end\n"
                     + "return current";
             return (Long) ((RedisOperations<?, ?>) nativeConnection).execute(
                     (RedisCallback<Object>) connection1 -> connection1.eval(
                             script.getBytes(),
                             redisTemplate.getKeySerializer(), // Use custom Key serializer
                             redisTemplate.getValueSerializer(), // Use custom Value serializer
                             Collections.singletonList(rateLimitKey.getBytes()),
                             Collections.singletonList(String.valueOf(timeWindow).getBytes())
                     )
             );
         });
   
         if (currentRequests > maxRequests) {
             String urlWithParams = getRequestUrlWithParams(request);
             logger.warn("Rate limit exceeded for key: {}. Request URL with Params: {}", 
                rateLimitKey, urlWithParams);
             throw new RateLimitException();
         }
     }
   
     private String getRequestUrlWithParams(HttpServletRequest request) {
         String url = request.getRequestURL().toString();
         String queryString = request.getQueryString();
         if (queryString != null && !queryString.isEmpty()) {
             url += "?" + queryString;
         }
         return url;
     }
   }
   ```

2. 调整 [spring-cloud-examples](https://github.com/chensoul/spring-cloud-examples) 目录，通过源码分析 [SpringBoot 2.7.18 启动过程](https://github.com/chensoul/spring-cloud-examples/blob/main/lesson-01-bootstrap/SpringBoot%E5%90%AF%E5%8A%A8%E8%BF%87%E7%A8%8B.md)

   
