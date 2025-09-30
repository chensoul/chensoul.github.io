# About页面自动更新脚本

这个脚本可以自动从GitHub API获取最新的用户数据，并更新About页面。

## 功能特性

- 🔄 自动获取GitHub关注者数量
- 📊 获取最新的仓库信息
- 💾 智能缓存机制（24小时有效期）
- 🤖 支持GitHub Actions自动运行
- 📝 自动更新About页面内容

## 使用方法

### 手动运行
```bash
# 使用npm脚本
npm run about:update

# 或直接运行
node scripts/update-about.js
```

### 自动运行
脚本已配置GitHub Actions工作流，每天凌晨2点自动运行：
- 工作流文件：`.github/workflows/update-about.yml`
- 自动提交更新到仓库

## 配置说明

### 脚本配置
```javascript
const CONFIG = {
  github: {
    username: 'chensoul',
    apiUrl: 'https://api.github.com/users/chensoul'
  },
  aboutFile: path.join(__dirname, '../content/about.md'),
  cacheFile: path.join(__dirname, '../.cache/about-data.json')
};
```

### 更新内容
- GitHub关注者数量
- 关注数量
- 开源项目列表
- 最后更新时间

## 缓存机制

- 缓存文件位置：`.cache/about-data.json`
- 缓存有效期：24小时
- 避免频繁API调用，提高性能

## 错误处理

- 网络错误时使用缓存数据
- 详细的错误日志输出
- 优雅降级机制

## 扩展功能

可以轻松扩展以支持其他平台：
- Twitter API
- LinkedIn API
- 其他社交媒体平台

## 注意事项

- 确保GitHub API有足够的请求限制
- 定期检查缓存文件大小
- 监控GitHub Actions运行状态
