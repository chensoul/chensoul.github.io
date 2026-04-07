# 辅助：命令备忘

通用译稿流程（**不限定**某一博客或平台）。路径、slug、**文件名 `{YYYY-MM-DD}-【译】…`**、**`date`（原文时间优先，否则当前时间，上海时区）**、**不写 `originalPublishedAt`**、**用 `canonicalURL` 识别是否按本技能落盘**、配图规则见 [`../SKILL.md`](../SKILL.md)。存量无 `canonicalURL` 的译文对齐方式见 SKILL 中「存量译文」；可用 `scripts/normalize-legacy-translation-frontmatter.py`。

文末**翻译声明**三行模版见 SKILL「步骤 3」；批量统一存量可运行仓库根目录 `python3 scripts/normalize-translation-footer.py`。

## 配图

```bash
mkdir -p public/images/{slug}
# 仅下载/保存译文正文会引用的图；广告、赞助、推广等已剔除区块内的图不保存
# 按正文顺序保存 01.webp、02.webp…；须为真实 WebP（见下「cwebp」）
```

### 无 `cwebp` 时先安装

仓库约定扩展名为 `.webp`，应用 **libwebp** 提供的 `cwebp` 将 PNG/JPEG 转为 WebP，勿直接改扩展名冒充。

- **macOS（Homebrew）**：`brew install webp`（提供 `cwebp`、`dwebp` 等）
- **Debian/Ubuntu**：`sudo apt install webp` 或 `libwebp-tools`（发行版包名以仓库为准）
- **Fedora**：`sudo dnf install libwebp-tools`

安装后示例：`cwebp -q 85 input.png -o public/images/{slug}/01.webp`

**典型流程**：从原文 HTML 得到正文图片 URL（按阅读顺序、已去掉赞助等）→ `curl -fsSL <url> -o /tmp/img` → `cwebp -q 85 /tmp/img -o public/images/{slug}/01.webp`（多张则 `02.webp`…）。

单张下载并转码：[`../scripts/fetch-image.example.sh`](../scripts/fetch-image.example.sh)

## Git（先同步再提交）

```bash
git pull   # 或 git pull --rebase
# 冲突则停，勿强推
git add content/translation/ public/images/{slug}/
git commit -m "translate: {slug}"
git push
```

无 `.git` 则只写文件。
