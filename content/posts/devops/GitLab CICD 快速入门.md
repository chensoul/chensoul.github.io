---
title: "GitLab CICD 快速入门"
date: 2024-07-12T09:00:00+08:00
slug: gitlab-cicd-quick-start
draft: true
categories: ["devops"]
tags: [ gitlab]
---

前提条件：

- 注册一个 gitlab runner，并且该 runner 内部可以访问 giltab 服务进行下载代码。gitlab-runner 的 config.toml 参考如下：

  ```toml
  concurrent = 1
  check_interval = 0
  shutdown_timeout = 0
  
  [session_server]
    session_timeout = 1800
  
  [[runners]]
    name = "runner"
    url = "http://192.168.1.107:8000/"
    token = "glrt-6ByqoP5bmYyz4FyYwozc"
    executor = "docker"
    [runners.custom_build_dir]
    [runners.cache]
      MaxUploadedArchiveSize = 0
      [runners.cache.s3]
      [runners.cache.gcs]
      [runners.cache.azure]
    [runners.docker]
      tls_verify = false
      image = "docker:stable"
      privileged = false
      disable_entrypoint_overwrite = false
      oom_kill_disable = false
      disable_cache = false
      volumes = ["/etc/docker/daemon.json:/etc/docker/daemon.json:ro","/var/run/docker.sock:/var/run/docker.sock","/.m2", "/cache"]
      shm_size = 0
      network_mtu = 0
      extra_hosts = ["gitlab.example.com:192.168.1.107"]
      network_mode = "host"
  ```

- 项目中存在 .gitlab-ci.yml 文件

在 example 项目中创建一个 .gitlab-ci.yml 文件，一个简单的流水线内容如下：

```yaml
stages:
  - init
  - build

init:
  stage: init
  script:
  - echo "init"

build:
  stage: build
  script:
  - echo "build"
```

提交代码之后，在 https://gitlab.wesine.com.cn/root/example/-/jobs/ 可以看到运行的 job

复杂一点的：

```yaml
build-job:
  stage: build
  script:
    - echo "Hello, $GITLAB_USER_LOGIN!"

test-job1:
  stage: test
  script:
    - echo "This job tests something"

test-job2:
  stage: test
  script:
    - echo "This job tests something, but takes more time than test-job1."
    - echo "After the echo commands complete, it runs the sleep command for 20 seconds"
    - echo "which simulates a test that runs 20 seconds longer than test-job1"
    - sleep 20

deploy-prod:
  stage: deploy
  script:
    - echo "This job deploys something from the $CI_COMMIT_BRANCH branch."
  environment: production
```

`$GITLAB_USER_LOGIN` 和 `$CI_COMMIT_BRANCH` 是在[作业运行时](https://gitlab.wesine.com.cn/root/example/-/pipelines/new)填充的预定义变量。

