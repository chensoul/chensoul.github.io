# 跑步数据同步（Keep → `public/data/running.json`）

## 依赖

```bash
pip install -r scripts/requirements-running.txt
```

## 本地执行

在仓库根目录：

```bash
export KEEP_MOBILE="手机号"
export KEEP_PASSWORD="密码"
python scripts/fetch-keep-run.py
```

默认写入 `public/data/running.json`（路径相对 `scripts/`）。自定义输出：

```bash
python scripts/fetch-keep-run.py --output ../public/data/running.json --limit 3
```

## GitHub Actions

工作流：`.github/workflows/running-sync.yml`（定时 + `workflow_dispatch`）。

在 **Settings → Secrets and variables → Actions** 中配置：

| Secret           | 说明        |
| ---------------- | ----------- |
| `KEEP_MOBILE`    | Keep 登录手机号 |
| `KEEP_PASSWORD`  | Keep 登录密码   |

未配置上述 Secret 时，工作流会失败并提示，避免静默跳过。
