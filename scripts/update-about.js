#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// 配置
const CONFIG = {
  github: {
    username: 'chensoul',
    apiUrl: 'https://api.github.com/users/chensoul'
  },
  aboutFile: path.join(__dirname, '../content/about.md'),
  cacheFile: path.join(__dirname, '../.cache/about-data.json')
};


// 缓存数据
let cacheData = {};

// 加载缓存
function loadCache() {
  try {
    if (fs.existsSync(CONFIG.cacheFile)) {
      cacheData = JSON.parse(fs.readFileSync(CONFIG.cacheFile, 'utf8'));
    }
  } catch (error) {
    console.log('缓存加载失败:', error.message);
  }
}

// 保存缓存
function saveCache() {
  try {
    const cacheDir = path.dirname(CONFIG.cacheFile);
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    fs.writeFileSync(CONFIG.cacheFile, JSON.stringify(cacheData, null, 5));
  } catch (error) {
    console.log('缓存保存失败:', error.message);
  }
}

// 获取GitHub数据
function fetchGitHubData() {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'chensoul-about-updater',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const apiUrl = 'https://api.github.com/users/chensoul';
    https.get(apiUrl, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const userData = JSON.parse(data);
          resolve({
            followers: userData.followers,
            following: userData.following,
            publicRepos: userData.public_repos,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// 获取仓库数据
function fetchReposData() {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'chensoul-about-updater',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const reposUrl = 'https://api.github.com/users/chensoul/repos?sort=updated&per_page=10';
    https.get(reposUrl, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const repos = JSON.parse(data);
          resolve(repos.map(repo => ({
            name: repo.name,
            description: repo.description,
            htmlUrl: repo.html_url,
            stargazersCount: repo.stargazers_count,
            language: repo.language,
            updatedAt: repo.updated_at
          })));
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// 更新about.md文件
function updateAboutFile(githubData, reposData) {
  try {
    let content = fs.readFileSync(CONFIG.aboutFile, 'utf8');
    
    // 更新GitHub数据
    content = content.replace(
      /- \*\*(\d+)\*\* 关注者 \| \*\*(\d+)\*\* 关注中/g,
      `- **${githubData.followers}** 关注者 | **${githubData.following}** 关注中`
    );
    
    // 更新最后更新时间
    const updateDate = new Date().toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long'
    });
    content = content.replace(
      /\*最后更新: .*\*/,
      `*最后更新: ${updateDate}*`
    );
    
    // 更新开源项目部分（如果有新项目）
    if (reposData && reposData.length > 0) {
      const featuredRepos = reposData.slice(0, 5).filter(repo =>
        !repo.name.includes('chensoul.github.io') && 
        repo.stargazersCount >= 0
      );
      
      if (featuredRepos.length > 0) {
        let reposSection = '\n### 📚 开源项目\n';
        featuredRepos.forEach(repo => {
          reposSection += `- **[${repo.name}](${repo.htmlUrl})** - ${repo.description || '开源项目'}\n`;
        });
        
        // 替换开源项目部分
        content = content.replace(
          /### 📚 开源项目[\s\S]*?(?=###|$)/,
          reposSection
        );
      }
    }
    
    fs.writeFileSync(CONFIG.aboutFile, content);
    console.log('✅ About页面更新成功');
    
  } catch (error) {
    console.error('❌ 更新About页面失败:', error.message);
  }
}

// 主函数
async function main() {
  console.log('🚀 开始更新About页面...');
  
  loadCache();
  
  try {
    // 检查缓存是否过期（24小时）
    const now = new Date();
    const lastUpdate = cacheData.lastUpdate ? new Date(cacheData.lastUpdate) : new Date(0);
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate < 24 && cacheData.github) {
      console.log('📦 使用缓存数据');
      updateAboutFile(cacheData.github, cacheData.repos);
      return;
    }
    
    console.log('🌐 获取GitHub数据...');
    const [githubData, reposData] = await Promise.all([
      fetchGitHubData(),
      fetchReposData()
    ]);
    
    // 更新缓存
    cacheData = {
      github: githubData,
      repos: reposData,
      lastUpdate: now.toISOString()
    };
    saveCache();
    
    // 更新文件
    updateAboutFile(githubData, reposData);
    
  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    
    // 如果有缓存数据，使用缓存
    if (cacheData.github) {
      console.log('📦 使用缓存数据作为备选');
      updateAboutFile(cacheData.github, cacheData.repos);
    }
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { main, fetchGitHubData, fetchReposData };
