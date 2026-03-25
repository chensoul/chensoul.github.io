---
title: "Claude Code 搭建写作工作流"
date: 2026-03-24 14:20:00+08:00
slug: claude-code-write-flow
categories: [ "tech" ]
tags: [ 'openclaw','claude']
draft: true
description: ""
favicon: "claude.svg"
---



最近看到一篇文章《[Claude Code是最好的自动化写作Agent，附完整教程！](https://mp.weixin.qq.com/s/XvFZtoybx_u_W8Os4eQdlQ)》，对于其中搭建自动化写作 Agent 的想法感兴趣。于是，想参考里面的思路使用 Claude Code 来搭建一套自动化写作流程。



首先，从作者公众号文章中找到了作者的 github 仓库[地址](https://github.com/alchaincyf)，接着找到了作者创作的 [Skills 合集](https://github.com/alchaincyf/huashu-skills) ，包括AI审校、选题生成、视频大纲、素材搜索等 11 个实用技能。

另外，有一个仓库是[公众号排版器](https://github.com/alchaincyf/huasheng_editor)。



接下来，将 skill 合集地址发给  Claude Code，让  Claude Code 分析该仓库。





xbstream -x --parallel=4 -C /data/mysql < /data/test.xbstream





chown -R mysql:mysql /data/mysql



docker run --name mysql -e MYSQL_ROOT_PASSWORD=123456 -d -p 3306:3306 -v /data/mysql:/var/lib/mysql docker.1ms.run/library/mysql:5.7



```json
mysqld --defaults-file=/data/mysql/my.cnf --user=mysql --datadir=/data/mysql &
```



```
docker exec -it mysql bash
```



```sql
mysqldump -h 127.0.01 -uluwu -p luwu alarm \
  --where="id<=1884474670802182145 AND create_time>'2024-05-01 00:00:00'" \
  --no-create-info \
  --single-transaction \
  --set-gtid-purged=OFF \
  --complete-insert \
  > alarm_filter.sql
  
  sed 's/alarm/alarm_filter/g' alarm_filter.sql > alarm_filter_renamed.sql
  
sed 's/alarm_filter_data/alarm_data/g' alarm_filter_renamed.sql > alarm_filter_2.sql
sed 's/alarm_filter_position/alarm_position/g' alarm_filter_2.sql > alarm_filter_3.sql
sed 's/alarm_filter_time/alarm_time/g' alarm_filter_3.sql > alarm_filter_4.sql
```



mysql -r -q --default-character-set=utf8 -N -hmysqlb643b25ca336.rds.ivolces.com -uluwu_read -pzM7SsBmJQiH5oU -P3306 -Dluwu





mysql -hmysqlb643b25ca336.rds.ivolces.com -uroot -p luwu_prod < alarm_filter.sql





select * FROM `alarm_filter` where create_time>'2024-09-01' and tenant_id in ('SKYL','WHZB','WM001','WM002')

select count(1) FROM `alarm_filter` where create_time>'2024-09-01' and tenant_id = 'METRO' and shop_id in (2,474)
