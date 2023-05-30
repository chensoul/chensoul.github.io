import requests
import json
import time
import re
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

# 读取 .env 文件
# OPENID=XXXXX
load_dotenv()
MEMOS_TOKEN = os.getenv('MEMOS_TOKEN')

url = f'https://memos.chensoul.com/api/memo?openId={MEMOS_TOKEN}'

keyword='#memos'

# 计算上周一和上周日的日期
today = datetime.now().date()
last_monday = today - timedelta(days=today.weekday(), weeks=1)
last_sunday = last_monday + timedelta(days=6)

# 将日期转换为秒
start_time = int(time.mktime(last_monday.timetuple()))
end_time = int(time.mktime(last_sunday.timetuple()))

response = requests.get(url)

if response.status_code == 200:
    data = json.loads(response.text)['data']

    # 过滤出上周的记录
    recent_data = [d for d in data if start_time <= d['createdTs'] <= end_time]

    # 将数据转换为 Markdown 格式，并处理 URL
    for d in recent_data:
        content = d['content']
        if keyword in content:
            created_time = datetime.fromtimestamp(d['createdTs']).strftime('%Y-%m-%d')
            time_str = '{}'.format(created_time)
            # 使用正则表达式匹配 URL，并将其替换为 Markdown 链接格式
            content_with_links = re.sub(r'(https?://\S+)', r'[\1](\1)', content)
            # 去掉换行符
            content_with_links = content_with_links.replace('\n', ' ')
            # 将 # 开头的字符前后添加反引号
            content_with_links = re.sub(r'(#\S+)', r'`\1`', content_with_links)
            # 将输出内容转换为列表项的格式
            markdown = '- 📌`{}` {}'.format(time_str, content_with_links)
            print(markdown)
else:
    print('请求失败：', response.status_code)
