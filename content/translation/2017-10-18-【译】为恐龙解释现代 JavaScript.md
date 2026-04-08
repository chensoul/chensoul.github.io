---
title: "【译】为恐龙解释现代 JavaScript"
date: 2017-10-18 00:00:00+08:00
draft: false
slug: modern-javascript-explained-for-dinosaurs
categories: [ "translation" ]
tags: [ "javascript", "tooling" ]
description: "从纯 HTML/JS 到 npm、Browserify/Webpack、Babel 与 npm scripts：按时间线理解现代前端工具链。"
canonicalURL: "https://peterxjang.com/blog/modern-javascript-explained-for-dinosaurs"
---

![Images from Dinosaur Comics by Ryan North](01.webp)

图片来自 [Dinosaur Comics](http://www.qwantz.com/) 作者 [Ryan North](https://twitter.com/ryanqnorth)。

如果你不是「从洪荒时代就一直在前端圈里」，学现代 JavaScript 会很难：生态涨得太快，工具层出不穷，你常常**搞不清它们各自在解决什么问题**。我 1998 年就开始写程序，但认真学 JS 要到 2014 年。那时我第一次看到 [Browserify](http://browserify.org/)，盯着它的 slogan：

> “Browserify lets you require('modules') in the browser by bundling up all of your dependencies.”

这句话里几乎每个词我都看不懂，也想象不出它对我写代码能有什么帮助。

本文想提供一条**时间线**：2017 年前后的 JavaScript 工具是怎么长成今天这样的。我们会像恐龙时代那样，从**零工具**——只有 HTML 和 JavaScript——搭一个示例站；再**一块一块**加上不同工具，看它们各自解决什么问题。有了这条脉络，以后生态再变，你也更容易跟上。

> **更新**：我把本文做成了**视频课**，按章节逐步演示，需要更清晰讲解可以看：  
> <https://firstclass.actualize.co/p/modern-javascript-explained-for-dinosaurs>

### 以「老派」方式写 JavaScript

先做一个最「老派」的站点：手动下载、用 `<script>` 串起来。下面是一个简单的 `index.html`，引用同目录下的 `index.js`：

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JavaScript Example</title>
  <script src="index.js"></script>
</head>
<body>
  <h1>Hello from HTML!</h1>
</body>
</html>
```

`<script src="index.js"></script>` 指向同目录的 `index.js`：

```js
// index.js
console.log("Hello from JavaScript!");
```

这就够搭一个网页了。假设你想用别人写的库，例如 **moment.js**（把日期格式化成人类可读字符串）。在 JS 里可以这么写：

```js
moment().startOf('day').fromNow();        // 20 hours ago
```

但前提是：**页面上真的加载了 moment.js**。打开 [moment.js 官网](http://momentjs.com/)，安装说明一长串——

![Install instructions for moment.js](02.webp)

右侧 Install 区信息很多，先不管。我们可以先下载 `moment.min.js` 放到同目录，再在 `index.html` 里引用：

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Example</title>
  <link rel="stylesheet" href="index.css">
  <script src="moment.min.js"></script>
  <script src="index.js"></script>
</head>
<body>
  <h1>Hello from HTML!</h1>
</body>
</html>
```

注意 **`moment.min.js` 要在 `index.js` 之前加载**，这样在 `index.js` 里才能用全局的 `moment`：

```js
// index.js
console.log("Hello from JavaScript!");
console.log(moment().startOf('day').fromNow());
```

这就是早年用第三方库做站的方式：**好懂**，但每次库升级都要自己找文件、下载，很烦。

### 使用包管理器（npm）

大约从 2010 年起，出现多个 **JavaScript 包管理器**，从中央仓库自动拉依赖、升级版本。2013 年 [Bower](https://bower.io/) 很火，到 2015 年前后逐渐被 [npm](https://www.npmjs.com/) 甩开。（另：2016 年末起 [yarn](https://yarnpkg.com/en/) 作为 CLI 替代品也很流行，底层仍是 npm 包。）

要注意：**npm 最初是给 Node.js 用的**——Node 是跑在**服务器**上的 JS 运行时；拿它来管「浏览器里跑的库」，听起来有点怪。

> **说明**：用包管理器通常离不开**命令行**，而早年做前端往往完全不用终端。若你从没用过，可以先看[这份入门](https://www.learnenough.com/command-line-tutorial)。不论喜不喜欢，**会终端**已经成了现代 JS 的标配（对其它开发方向也有帮助）。

看看如何用 npm 自动装 **moment**，而不用手动下载。若已安装 Node.js，就自带 npm；在放 `index.html` 的目录里执行：

```bash
npm init
```

会问你一堆问题（一路回车用默认即可），生成 **`package.json`**——npm 用来记录项目元数据。默认大致如下：

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```

按官网说明安装 moment：

```bash
npm install moment --save
```

这条命令做两件事：把 moment 的代码下到 **`node_modules`**；并自动改 **`package.json`**，把 moment 记成依赖：

```json
{
  "name": "modern-javascript-example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "moment": "^2.22.2"
  }
}
```

以后**协作**时不必传整个 `node_modules`（体积巨大），只传 **`package.json`**，别人执行 **`npm install`** 即可还原依赖。

现在我们不必再从官网手搓下载 moment 了。在 `node_modules/moment/min/` 里能找到 `moment.min.js`，在 HTML 里这样引用：

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JavaScript Example</title>
  <script src="node_modules/moment/min/moment.min.js"></script>
  <script src="index.js"></script>
</head>
<body>
  <h1>Hello from HTML!</h1>
</body>
</html>
```

好处是：**命令行就能装/升级包**。坏处是：你要自己翻 `node_modules` 找每个包的**真实路径**，再手写进 HTML——仍然很蠢。下一步就是把这个过程也自动化。

![Dinosaur comic panel 2](03.webp)

### 使用模块打包器（webpack）

多数语言都支持「这个文件 **import** 那个文件」。早期 JS 为浏览器设计，**不能读用户磁盘**（安全限制），长期只能靠**多个 `<script>` + 全局变量**来拼工程。

上面 moment 的例子就是这样：整份 `moment.min.js` 先加载，定义全局 `moment`，后面加载的文件都能用（不管是否真的需要）。

2009 年 **[CommonJS](http://wiki.commonjs.org/wiki/CommonJS)** 试图规范「浏览器之外的 JS 生态」，其中一大块就是 **模块规范**：终于能像多数语言一样在文件间导入导出，而不是污染全局。**Node.js** 是最知名的 CommonJS 实现。

![Node.js logo](04.webp)

前面说过，Node 跑在**服务器**上，能访问文件系统。同一个例子若写成 Node 模块，可以不在 HTML 里塞整份 min，而在 JS 里写：

```js
// index.js
var moment = require('moment');

console.log("Hello from JavaScript!");
console.log(moment().startOf('day').fromNow());
```

Node 知道每个 npm 包装在哪，所以不用写 `require('./node_modules/moment/min/moment.min.js')`，直接 **`require('moment')`** 即可。

这在 Node 里没问题；但若把这段原样丢进浏览器，会报 **`require` is not defined**。浏览器没有完整文件系统 API，动态加载脚本要么**同步阻塞**，要么**异步**带来时序问题——所以需要 **「模块打包器」**：在**有文件系统的构建阶段**，把所有 `require` 解析成真正的代码，输出**浏览器能跑的单文件**（没有 `require` 语法）。

早年最出名的是 **Browserify**（2011），把 Node 风格的 `require` 搬到前端，也让 npm 成了前端依赖的事实标准。约 2015 年起 **webpack** 更流行（React 等生态也重度依赖 webpack）。

下面用 webpack 让前面的 `require('moment')` 能在浏览器里跑。webpack 本身也是 npm 包：

```bash
npm install webpack webpack-cli --save-dev
```

装了两个包：**webpack** 与 **webpack-cli**（命令行入口）。**`--save-dev`** 表示开发依赖——构建时需要，线上服务器未必需要。`package.json` 会多一段 `devDependencies`：

```json
{
  "name": "modern-javascript-example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "moment": "^2.19.1"
  },
  "devDependencies": {
    "webpack": "^4.17.1",
    "webpack-cli": "^3.1.0"
  }
}
```

在项目里可以这样调用本地安装的 CLI：

```bash
./node_modules/.bin/webpack index.js --mode=development
```

它会从 `index.js` 入口递归解析 `require`，打成一个包，默认输出 **`dist/main.js`**。**`--mode=development`** 保留可读输出；生产可用 **`--mode=production`** 做压缩。

生成 `dist/main.js` 后，HTML 应改引用打包结果（因为浏览器不能直接执行带 `require` 的 `index.js`）：

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JavaScript Example</title>
  <script src="dist/main.js"></script>
</head>
<body>
  <h1>Hello from HTML!</h1>
</body>
</html>
```

刷新页面，行为应与之前一致。

每次改 `index.js` 都要手敲 webpack 很烦；以后还要 source map 等高级能力。可以在项目根目录加 **`webpack.config.js`**：

```js
// webpack.config.js
module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'main.js',
    publicPath: 'dist'
  }
};
```

之后只需：

```bash
./node_modules/.bin/webpack
```

不必再重复写入口和 `--mode`。

这套流程的意义不止「少打字」：**不再靠全局变量挂第三方库**；新库用 **`require`** 写在 JS 里，而不是往 HTML 堆 `<script>`；**单文件 bundle** 往往也更利于性能。有了构建步骤，才能继续叠 **Babel** 等能力。

![Dinosaur comic panels 3 and 4](05.webp)

### 用 Babel 转译新语法

**Transpile（转译）**：把一种语言（或语言的某一版）换成另一种相近、兼容性更好的形式。前端里很常见——**浏览器跟进新特性慢**，于是先在源码里写「明天的语法」，再转成「今天能跑的」。

CSS 里有 Sass、Less、Stylus 等。JS 这边，早年流行过 **CoffeeScript**（约 2010）；现在多是 **Babel** 或 **TypeScript**。CoffeeScript 是另一门语法糖很多的语言；**Babel** 不是新语言，而是把 **ES2015+** 转成更兼容的 **ES5**。**TypeScript** 在 ES 基础上加可选静态类型。很多人选 Babel，因为最接近「原生 JS」。

在现有 webpack 流程里接 Babel，先装：

```bash
npm install @babel/core @babel/preset-env babel-loader --save-dev
```

三个包：**@babel/core**、定义转译目标的 **@babel/preset-env**、以及让 Babel 接入 webpack 的 **babel-loader**。改 **`webpack.config.js`**：

```js
// webpack.config.js
module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'main.js',
    publicPath: 'dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};
```

这段配置乍看很绕（好在不常改）：大意是——对**非** `node_modules` 的 `.js` 走 **babel-loader**，用 **`@babel/preset-env`**。细节见 [webpack 配置文档](https://webpack.js.org/configuration/)。

配置好后，就可以在 `index.js` 里写 **ES2015 模板字符串** 等语法，例如：

```js
// index.js
var moment = require('moment');

console.log("Hello from JavaScript!");
console.log(moment().startOf('day').fromNow());

var name = "Bob", time = "today";
console.log(`Hello ${name}, how are you ${time}?`);
```

很多新项目更常用 **`import`** 代替 **`require`**：

```js
// index.js
import moment from 'moment';

console.log("Hello from JavaScript!");
console.log(moment().startOf('day').fromNow());

var name = "Bob", time = "today";
console.log(`Hello ${name}, how are you ${time}?`);
```

`import` 与 `require` 写法略不同，且 `import` 在拆分、tree-shaking 等场景更灵活。改完 `index.js` 后再执行：

```bash
./node_modules/.bin/webpack
```

在浏览器里刷新 `index.html`。若用很新的浏览器，可能看不出差别——可以换 **IE9** 测，或在输出的 **`main.js`** 里搜转译结果：

```js
// main.js
// ...
console.log('Hello ' + name + ', how are you ' + time + '?');
// ...
```

可见 Babel 把**模板字符串**转成了**字符串拼接**，以换兼容。单看这一句不惊艳，但**转译**这件事让你今天就能用 **async/await** 等明天才普及的语法。构建步骤有时显得啰嗦，却实实在在推动了语言进化。

还剩两件琐事：性能上应对 bundle **minify**（既然已有构建，很容易）；开发时每次改代码都要手跑 webpack 也很烦——下面用 **npm scripts** 等工具缓解。

### 使用任务运行器：npm scripts

既已接受「先构建再跑浏览器」，很自然会加 **task runner**：把 minify、跑测试、压图等步骤自动化。2013 年 **Grunt** 最火，随后 **Gulp**；二者都靠插件包一层 CLI。如今更常见的是直接用 **npm 自带的 `scripts`**：不强制插件模型，命令想拼什么拼什么。

在 **`package.json`** 里加脚本，简化 webpack：

```json
{
  "name": "modern-javascript-example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack --progress --mode=production",
    "watch": "webpack --progress --watch"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "moment": "^2.22.2"
  },
  "devDependencies": {
    "@babel/core": "^7.0.0",
    "@babel/preset-env": "^7.0.0",
    "babel-loader": "^8.0.2",
    "webpack": "^4.17.1",
    "webpack-cli": "^3.1.0"
  }
}
```

执行：

```bash
npm run build
```

会跑 webpack，并带 **`--progress`** 与生产 **`--mode=production`**。开发时可：

```bash
npm run watch
```

用 **`--watch`** 在文件变更时自动重编。

`package.json` 里的脚本会自动解析 **`node_modules/.bin`**，不必写长路径。再装 **webpack-dev-server** 做本地服务 + 自动刷新：

```bash
npm install webpack-dev-server --save-dev
```

再更新 `package.json`，加入 `serve` 脚本与 `webpack-dev-server` 依赖（与原文示例一致）：

```json
{
  "name": "modern-javascript-example",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "webpack --progress -p",
    "watch": "webpack --progress --watch",
    "serve": "webpack-dev-server --open"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "moment": "^2.19.1"
  },
  "devDependencies": {
    "@babel/core": "^7.0.0",
    "@babel/preset-env": "^7.0.0",
    "babel-loader": "^8.0.2",
    "webpack": "^3.7.1",
    "webpack-dev-server": "^3.1.6"
  }
}
```

然后：

```bash
npm run serve
```

默认会在浏览器打开 **`localhost:8080`**（以默认配置为准）。改 `index.js` 时，dev server 会重打 bundle 并刷新页面，省掉来回切窗口的成本。

webpack / webpack-dev-server 的选项很多，见[官方文档](https://webpack.js.org/guides/development/)。你也可以给 npm script 接上 **Sass→CSS、压图、跑测试**——凡是命令行工具都接得上。npm script 本身也有不少技巧，[Kate Hudson 的演讲](https://youtu.be/0RYETb9YVrk)是很好的起点：

<https://youtu.be/0RYETb9YVrk>

### 结语

以上就是「现代 JavaScript 工具链」的一条常见路径：从纯 HTML/JS，到 **npm** 管依赖，**webpack** 打模块包，**Babel** 转新语法，再用 **npm scripts / dev server** 把开发体验补圆。对新手来说，概念很多；早年 Web 入门门槛低，如今工具链一上来就容易劝退，而且工具还在变。

但局面在收敛：用 **npm** 装包、用 **`require`/`import`** 组织模块、用 **npm scripts** 跑命令，已经比一两年前清晰太多。

对新手和老手的好消息是：**框架**往往自带脚手架——**Ember** 有 [ember-cli](https://ember-cli.com/)，深刻影响了 **Angular** 的 [angular-cli](https://cli.angular.io/)、**React** 的 [`create-react-app`](https://github.com/facebookincubator/create-react-app)、**Vue** 的 [vue-cli](https://github.com/vuejs/vue-cli) 等。它们帮你把目录和配置搭好，你只管写业务。但它们不是魔法：复杂场景仍可能要自己调 webpack、Babel——所以搞清本文每一环在做什么，仍然关键。

现代 JS 生态变得快，有时像在重复造轮子；但也正因此才有热更新、实时代码检查、时间旅行调试这些体验。做前端仍然很有意思，希望这篇能当你的**路线图**。

![Dinosaur comic panel 5](06.webp)

特别感谢 [@ryanqnorth](https://twitter.com/ryanqnorth) 的 [Dinosaur Comics](http://www.qwantz.com/)：2003 年以来（恐龙统治网络的时代）就持续提供顶级荒诞幽默。

> 本文为学习目的的个人翻译，译文仅供参考。
>
> 原文链接：[Modern JavaScript Explained For Dinosaurs](https://peterxjang.com/blog/modern-javascript-explained-for-dinosaurs)。
>
> 版权归原作者或原刊登方所有。本文为非官方译本；如有不妥，请联系删除。
