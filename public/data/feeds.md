# Feeds 数据说明

从 OPML 提取 URL 并排序：

```bash
grep -oE 'xmlUrl="[^"]+"' follow.opml | sed 's/xmlUrl="//;s/"$//' | sort -u > rss.txt
```
