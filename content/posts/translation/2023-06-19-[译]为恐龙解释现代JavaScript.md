---
title: "[译]为恐龙解释现代JavaScript"
date: 2023-06-19
slug: modern-javascript-explained-for-dinosaurs
categories: ["frontend"]
tags: ['javascript']
---

![Images from Dinosaur Comics by Ryan North](/images/modern-javascript-explained-for-dinosaurs-01.webp)

<center>图片来自Ryan North的Dinosaur Comics。</center>

如果你从一开始就没有去过那里，那么学习现代 JavaScript 是很困难的。生态系统的发展和变化如此之快，以至于很难理解不同工具试图解决的问题。我从 1998 年开始编程，但直到 2014 年才开始认真学习 JavaScript。当时我记得遇到 [Browserify](http://browserify.org/) 并盯着它的标语：

> Browserify 通过捆绑所有依赖项，让你在浏览器中导入（'模块'）。

我几乎听不懂这句话中的任何单词，并且努力理解这对我作为开发人员有什么帮助。

本文的目的是提供一个历史背景，说明 JavaScript 工具如何在 2017 年发展到今天的样子。我们将从头开始，像恐龙一样构建一个示例网站 - 没有工具，只有普通的 HTML 和 JavaScript。然后，我们将逐步介绍不同的工具，以查看它们一次解决一个问题。有了这个历史背景，你将能够更好地学习和适应未来不断变化的 JavaScript 环境。让我们开始吧！

> 更新：我制作了本文的视频课程版本，为了更清晰，我逐步浏览了每个部分，请在此处查看：
> https://firstclass.actualize.co/p/modern-javascript-explained-for-dinosaurs

### 以"老派"的方式使用 JavaScript

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>JavaScript Example</title>
    **
    <script src="index.js"></script>
    **
  </head>
  <body>
    <h1>Hello from HTML!</h1>
  </body>
</html>
```

第 `<script src="index.js"></script>` 行引用同一目录中名为 `index.js` 的单独 JavaScript 文件：

```js
// index.js
console.log("Hello from JavaScript!");
```

这就是制作网站所需的全部内容！现在，假设您想添加一个其他人编写的库，例如 moment.js（一个可以帮助以人类可读的方式格式化日期的库）。例如，您可以在 JavaScript 中使用 `moment` 函数，如下所示：

```js
moment().startOf("day").fromNow(); // 20 hours ago
```

但这只是假设您在网站上包含 moment.js！在 [moment.js 主页](http://momentjs.com/) 上您会看到以下说明：

![Install instructions for moment.js](/images/modern-javascript-explained-for-dinosaurs-02.webp)

嗯，右侧的"安装"部分有很多内容。但是现在让我们忽略它 - 我们可以通过在同一目录中下载 `moment.min.js` 文件并将其包含在我们的 `index.html` 文件中来为我们的网站添加 moment.js。

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Example</title>
    <link rel="stylesheet" href="index.css" />
    <script src="moment.min.js"></script>
    <script src="index.js"></script>
  </head>
  <body>
    <h1>Hello from HTML!</h1>
  </body>
</html>
```

请注意， `moment.min.js` 在 `index.js` 之前加载，这意味着您可以在 `index.js` 中使用 `moment` 函数，如下所示：

```js
// index.js
console.log("Hello from JavaScript!");
console.log(moment().startOf("day").fromNow());
```

这就是我们过去使用 JavaScript 库制作网站的方式！好消息是它很容易理解。不好的是，每次更新时查找和下载新版本的库都很烦人。

### 使用 JavaScript 包管理器 （npm）

从 2010 年左右开始，出现了几个相互竞争的 JavaScript 包管理器，以帮助自动化从中央存储库下载和升级库的过程。[Bower](https://bower.io/) 可以说是 2013 年最受欢迎的，但最终在 2015 年左右被 [npm](https://www.npmjs.com/) 超越。（值得注意的是，从 2016 年末开始，[yarn](https://yarnpkg.com/en/) 作为 npm 接口的替代品获得了很大的关注，但它仍然在引擎盖下使用 npm 包。

请注意，npm 最初是专门为 node.js 制作的包管理器，这是一个旨在在服务器上运行的 JavaScript 运行时，而不是前端。因此，对于打算在浏览器中运行的库的前端 JavaScript 包管理器来说，这是一个非常奇怪的选择。

> 注意：使用包管理器通常涉及使用命令行，过去前端开发从不需要命令行。如果您从未使用过，可以阅读[本教程](https://www.learnenough.com/command-line-tutorial)以获取入门的良好概述。无论好坏，知道如何使用命令行是现代 JavaScript 的重要组成部分（它也为其他开发领域打开了大门）。

让我们看看如何使用 npm 自动安装 moment.js 包，而不是手动下载它。如果您安装了 node.js，则您已经安装了 npm，这意味着您可以将命令行导航到包含 `index.html` 文件的文件夹并输入：

```bash
$ npm init
```

这将提示您几个问题（默认值很好，您可以为每个问题点击“Enter”）并生成一个名为 `package.json` 的新文件。这是 npm 用来保存所有项目信息的配置文件。使用默认值时， `package.json` 的内容应如下所示：

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

要安装 moment.js JavaScript 包，我们现在可以通过在命令行中输入以下命令来按照其主页上的 npm 说明进行操作：

```bash
$ npm install moment --save
```

此命令执行两件事 — 首先，它从 [moment.js 包](https://unpkg.com/moment/) 下载所有代码名为 `node_modules` 的文件夹中。其次，它会自动修改 `package.json` 文件以跟踪 moment.js 作为项目依赖项。

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

这在以后与他人共享项目时很有用 - 而不是共享 `node_modules` 文件夹（可能会变得非常大），您只需要共享 `package.json` 文件，其他开发人员可以使用命令 `npm install` 自动安装所需的包。

所以现在我们不再需要从网站上手动下载 momentjs，我们可以使用 npm 自动下载和更新它。查看 `node_modules` 文件夹内部，我们可以看到 `moment.min.js` 目录中的 `node_modules/moment/min` 文件。这意味着我们可以链接到 `index.html` 文件中的 npm 下载版本，如下所示：

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>JavaScript Example</title>
    <script src="node_modules/moment/min/moment.min.js"></script>
    <script src="index.js"></script>
  </head>
  <body>
    <h1>Hello from HTML!</h1>
  </body>
</html>
```

所以好消息是我们现在可以使用 npm 通过命令行下载和更新我们的包。不好的是，现在我们正在挖掘 `node_modules` 文件夹以查找每个包的位置，并手动将其包含在我们的 HTML 中。这很不方便，所以接下来我们将看看如何自动化该过程。

![Dinosaur comic panel 2](/images/modern-javascript-explained-for-dinosaurs-03.webp)

### 使用 JavaScript 模块捆绑器（webpack)　

大多数编程语言都提供了一种将代码从一个文件导入另一个文件的方法。JavaScript 最初并不是使用此功能设计的，因为 JavaScript 被设计为仅在浏览器中运行，无法访问客户端计算机的文件系统（出于安全原因）。因此，在很长一段时间内，在多个文件中组织 JavaScript 代码需要您使用全局共享的变量加载每个文件。

这实际上是我们在上面所做的 moment.js 示例 — 整个 `moment.min.js` 文件加载到 HTML 中，HTML 定义了一个全局变量 `moment` ，然后可用于在 `moment.min.js` 之后加载的任何文件（无论它是否需要访问它）。

2009 年，一个名为 CommonJS 的项目启动，目标是在浏览器之外为 JavaScript 指定一个生态系统。CommonJS 的很大一部分是它的模块规范，它最终允许 JavaScript 像大多数编程语言一样跨文件导入和导出代码，而无需诉诸全局变量。最著名的 CommonJS 模块实现是 node.js。

![Node.js logo](/images/modern-javascript-explained-for-dinosaurs-04.webp)

如前所述，node.js 是一个设计用于在服务器上运行的 JavaScript 运行时。下面是前面的示例使用 node.js 模块的样子。与其使用 HTML 脚本标记加载所有 `moment.min.js` ，不如直接将其加载到 JavaScript 文件中，如下所示：

```js
// index.js
var moment = require("moment");
console.log("Hello from JavaScript!");
console.log(moment().startOf("day").fromNow());
```

同样，这就是模块加载在 node.js 中的工作方式，由于 node.js 是一种可以访问计算机文件系统的服务器端语言，因此效果很好。Node.js 也知道每个 npm 模块路径的位置，所以你不必写 `require('./node_modules/moment/min/moment.min.js)` ，你可以简单地写 `require('moment')` — 非常甜蜜。

这对于 node.js 来说都很棒，但是如果您尝试在浏览器中使用上述代码，则会收到一条错误消息，指出未定义浏览器无法访问文件系统，这意味着以这种方式加载模块非常棘手 - 加载文件必须动态完成，同步（这会减慢执行速度）或异步（可能存在计时问题）。

这就是模块捆绑器的用武之地。JavaScript 模块捆绑器是一种工具，它通过构建步骤（可以访问文件系统）来解决问题，以创建与浏览器兼容的最终输出（不需要访问文件系统）。在这种情况下，我们需要一个模块捆绑器来查找所有 `require` 语句（这是无效的浏览器 JavaScript 语法），并将它们替换为每个所需文件的实际内容。最终结果是一个捆绑的 JavaScript 文件（没有 require 语句）！

最流行的模块捆绑器是 Browserify，它于 2011 年发布，率先在前端使用 node.js 样式的需求语句（这本质上是使 npm 成为首选前端包管理器的原因）。大约在 2015 年，webpack 最终成为使用更广泛的模块捆绑器（受到 React 前端框架的普及的推动，它充分利用了 webpack 的各种功能）。

让我们来看看如何使用 webpack 让上面的 `require('moment')` 示例在浏览器中工作。首先，我们需要将 webpack 安装到项目中。Webpack 本身是一个 npm 包，所以我们可以从命令行安装它：

```bash
$ npm install webpack webpack-cli --save-dev
```

请注意，我们正在安装两个软件包 — webpack 和 webpack-cli（它使您能够从命令行使用 webpack）。另请注意 `--save-dev` 参数 — 这会将其保存为开发依赖项，这意味着它是开发环境中需要的包，而不是生产服务器上需要的包。您可以在自动更新的 `package.json` 文件中看到这反映在：

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

现在我们已经将 webpack 和 webpack-cli 作为包安装在 `node_modules` 文件夹中。您可以从命令行使用 webpack-cli，如下所示：

```bash
$ ./node_modules/.bin/webpack index.js --mode=development
```

此命令将运行安装在 `node_modules` 文件夹中的 webpack 工具，从 `index.js` 文件开始，找到任意 `require` 语句，并将它们替换为适当的代码以创建单个输出文件（默认为 `dist/main.js` ）。 `--mode=development` 参数是为了让开发人员保持 JavaScript 的可读性，而不是参数 `--mode=production` 的缩小输出。

现在我们有了 webpack 的 `dist/main.js` 输出，我们将在浏览器中使用它而不是 `index.js` ，因为它包含无效的 require 语句。这将反映在 `index.html` 文件中，如下所示：

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>JavaScript Example</title>
    <script src="dist/main.js"></script>
  </head>
  <body>
    <h1>Hello from HTML!</h1>
  </body>
</html>
```

如果您刷新浏览器，您应该会看到一切都像以前一样工作！

请注意，每次更改 `index.js` 时，我们都需要运行 webpack 命令。这很乏味，当我们使用 webpack 更高级的功能（例如生成源映射以帮助从转译的代码调试原始代码）时，这将变得更加乏味。Webpack 可以从名为 `webpack.config.js` 的项目根目录中的配置文件中读取选项，在我们的例子中，它看起来像：

```js
// webpack.config.js
module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    filename: "main.js",
    publicPath: "dist",
  },
};
```

现在每次我们更改 `index.js` 时，我们都可以使用以下命令运行 webpack：

```bash
$ ./node_modules/.bin/webpack
```

我们不再需要指定 `index.js` 和 `--mode=development` 选项，因为 webpack 正在从 `webpack.config.js` 文件中加载这些选项。这更好，但为每个代码更改输入此命令仍然很乏味 - 我们将使此过程更顺畅。

总的来说，这可能看起来不多，但这个工作流程有一些巨大的优势。我们不再通过全局变量加载外部脚本。任何新的 JavaScript 库都将在 JavaScript 中使用 `require` 语句添加，而不是在 HTML 中添加新的 `<script>` 标签。拥有单个 JavaScript 捆绑包文件通常对性能更好。现在我们添加了构建步骤，我们可以将其他一些强大的功能添加到我们的开发工作流程中！

![Dinosaur comic panels 3 and 4](/images/modern-javascript-explained-for-dinosaurs-05.webp)

### 为新的语言功能转译代码 （babel）

转译代码意味着将一种语言的代码转换为另一种类似语言的代码。这是前端开发的一个重要部分——由于浏览器添加新功能的速度很慢，因此使用实验性功能创建了新语言，这些功能可以转换为浏览器兼容语言。

对于 CSS，有 [Sass](http://sass-lang.com/)，[Less ](http://lesscss.org/)和 [Stylus](http://stylus-lang.com/)，仅举几例。对于 JavaScript，一段时间内最流行的转译器是 [CoffeeScript](http://coffeescript.org/)（2010 年左右发布），而现在大多数人使用 [babel ](https://babeljs.io/)或 [TypeScript](http://www.typescriptlang.org/)。CoffeeScript 是一种专注于通过显著改变语言来改进 JavaScript 的语言——可选的括号、重要的空格等。Babel 不是一门新语言，而是一种转译器，它将尚未适用于所有浏览器（[ES2015](https://babeljs.io/learn-es2015/) 及更高版本）的下一代 JavaScript 转译为更兼容的旧 JavaScript （ES5）。Typescript 是一种与下一代 JavaScript 基本相同的语言，但也添加了可选的静态类型。许多人选择使用 babel，因为它最接近原版 JavaScript。

让我们看一个如何在我们现有的 webpack 构建步骤中使用 babel 的示例。首先，我们将从命令行将 babel（这是一个 npm 包）安装到项目中：

```bash
$ npm install @babel/core @babel/preset-env babel-loader --save-dev
```

请注意，我们正在安装 3 个单独的包作为开发依赖项 — `@babel/core` 是 babel 的主要部分， `@babel/preset-env` 是定义要转译的新 JavaScript 功能的预设， `babel-loader` 是使 babel 能够使用 webpack 的包。我们可以通过编辑 `webpack.config.js` 文件将 webpack 配置为使用 `babel-loader` ，如下所示：

```js
// webpack.config.js
module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    filename: "main.js",
    publicPath: "dist",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
```

这种语法可能会令人困惑（幸运的是，这不是我们经常编辑的东西）。基本上，我们告诉 webpack 查找任何 .js 文件（不包括 `node_modules` 文件夹中的文件），并使用 `babel-loader` 和 `@babel/preset-env` 预设应用 babel 转译。您可以在[此处](http://webpack.github.io/docs/configuration.html)阅读有关 webpack 配置语法的更多信息。

现在一切都设置好了，我们可以开始用我们的 JavaScript 编写 ES2015 功能了！下面是 `index.js` 文件中的 [ES2015 模板字符串](https://babeljs.io/learn-es2015/#ecmascript-2015-features-template-strings)示例：

```js
// index.js
var moment = require("moment");
console.log("Hello from JavaScript!");
console.log(moment().startOf("day").fromNow());
var name = "Bob",
  time = "today";
console.log(`Hello ${name}, how are you ${time}?`);
```

我们还可以使用 [ES2015 import 语句 ](https://babeljs.io/learn-es2015/#ecmascript-2015-features-modules)代替 `require` 来加载模块，这就是您今天在很多代码库中看到的内容：

```js
// index.js
import moment from "moment";
console.log("Hello from JavaScript!");
console.log(moment().startOf("day").fromNow());
var name = "Bob",
  time = "today";
console.log(`Hello ${name}, how are you ${time}?`);
```

在此示例中， `import` 语法与 `require` 语法没有太大区别，但 `import` 对于更高级的情况具有额外的灵活性。由于我们更改了 `index.js` ，我们需要在命令行中再次运行 webpack：

```bash
$ ./node_modules/.bin/webpack
```

现在您可以在浏览器中刷新 `index.html` 。在撰写本文时，大多数现代浏览器都支持所有 ES2015 功能，因此很难判断 babel 是否完成了它的工作。您可以在 IE9 等较旧的浏览器中对其进行测试，也可以在 `main.js` 中搜索以查找转译的代码行：

```js
// main.js
/ ...
console.log("Hello " + name + ", how are you " + time + "?");
// ...
```

在这里你可以看到 babel 将 ES2015 模板字符串转换为常规的 JavaScript 字符串连接，以保持浏览器兼容性。虽然这个特殊的例子可能不太令人兴奋，但转译代码的能力是非常强大的。JavaScript 中有一些令人兴奋的语言功能，如 [async/await](async/await)，你可以立即开始使用它们来编写更好的代码。虽然音译有时可能看起来乏味和痛苦，但它在过去几年中导致了语言的巨大改进，因为人们今天正在测试明天的功能。

我们几乎完成了，但我们的工作流程中仍有一些未打磨的边缘。如果我们担心性能，我们应该[缩小](https://en.wikipedia.org/wiki/Minification_%28programming%29)捆绑文件，这应该很容易，因为我们已经合并了一个构建步骤。每次更改 JavaScript 时，我们还需要重新运行 webpack 命令，这会很快变旧。因此，接下来我们要看的是解决这些问题的一些便捷工具。

### 使用任务运行程序（npm 脚本）

现在我们已经投资使用构建步骤来处理 JavaScript 模块，使用任务运行器是有意义的，这是一个自动执行构建过程不同部分的工具。对于前端开发，任务包括缩小代码、优化图像、运行测试等。

2013 年，Grunt 是最受欢迎的前端任务运行者，Gulp 紧随其后。两者都依赖于包装其他命令行工具的插件。如今，最流行的选择似乎是使用 npm 包管理器本身内置的脚本功能，它不使用插件，而是直接与其他命令行工具一起使用。

让我们编写一些 npm 脚本，以便更轻松地使用 webpack。这涉及简单地更改 `package.json` 文件，如下所示：

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

在这里，我们添加了两个新脚本， `build` 和 `watch` 。要运行构建脚本，您可以在命令行中输入：

```bash
$ npm run build
```

这将运行 webpack（使用我们之前所做的 `webpack.config.js` 中的配置），其中 `--progress` 选项显示进度百分比， `--mode=production` 选项最小化生产代码。要运行 `watch` 脚本，请执行以下操作：

```bash
$ npm run watch
```

它使用 `--watch` 选项代替，以便在每次任何 JavaScript 文件更改时自动重新运行 webpack，这对于开发非常有用。

请注意， `package.json` 中的脚本可以在不必指定完整路径 `./node_modules/.bin/webpack` 的情况下运行 webpack，因为 node.js 知道每个 npm 模块路径的位置。这很甜！我们可以通过安装 webpack-dev-server 来让事情变得更加甜蜜，这是一个单独的工具，它提供了一个简单的 Web 服务器和实时重新加载。要将其安装为开发依赖项，请输入以下命令：

```bash
$ npm install webpack-dev-server --save-dev
```

然后将一个 npm 脚本添加到 `package.json` ：

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

现在，您可以通过运行以下命令来启动开发服务器：

```bash
$ npm run serve
```

这将在您的浏览器中自动打开地址为 `localhost:8080` 的 `index.html` 网站（默认情况下）。每当你在 `index.js` 中更改 JavaScript 时，webpack-dev-server 都会重建它自己的捆绑 JavaScript 并自动刷新浏览器。这是一个非常有用的时间节省，因为它允许您将注意力集中在代码上，而不必在代码和浏览器之间不断切换上下文以查看新的更改。

这只是表面，webpack 和 webpack-dev-server 还有更多选项（你可以在[这里](https://webpack.js.org/guides/development/)阅读）。当然，你也可以制作 npm 脚本来运行其他任务，例如将 Sass 转换为 CSS、压缩图像、运行测试 — 任何具有命令行工具的东西都是公平的游戏。npm 脚本本身也有一些很棒的高级选项和技巧——[Kate Hudson](https://twitter.com/k88hudson) 的这个演讲是一个很好的起点：

https://youtu.be/0RYETb9YVrk

### 结论

简而言之，这就是现代 JavaScript。我们从纯 HTML 和 JS 转向使用包管理器自动下载第三方包，使用模块捆绑器创建单个脚本文件，使用转译器使用未来的 JavaScript 功能，以及任务运行器来自动化构建过程的不同部分。这里肯定有很多移动的部分，特别是对于初学者。对于刚接触编程的人来说，Web 开发曾经是一个很好的切入点，正是因为它很容易启动和运行;如今，这可能非常令人生畏，特别是因为各种工具往往会迅速变化。

不过，它并不像看起来那么糟糕。事情正在安定下来，特别是随着节点生态系统作为与前端合作的可行方式的采用。使用 npm 作为包管理器，将节点 `require` 或 `import` 语句用于模块，使用 npm 脚本来运行任务，这很好且一致。与一两年前相比，这是一个大大简化的工作流程！

对于初学者和有经验的开发人员来说，更好的是，如今的框架通常带有使该过程更容易上手的工具。Ember 有 [ember-cli](https://ember-cli.com/) ，这对 Angular 的 [angular-cli](https://cli.angular.io/) 、React 的 [`create-react-app`](https://github.com/facebookincubator/create-react-app)、Vue 的 [vue-cli](https://github.com/vuejs/vue-cli) 等产生了巨大的影响。所有这些工具都将设置一个包含您需要的所有项目——您需要做的就是开始编写代码。然而，这些工具并不神奇，它们只是以一种一致和工作的方式设置了所有内容——你可能经常需要对 webpack、babel 等进行一些额外的配置。因此，了解我们在本文中介绍的每个部分的作用仍然非常关键。

现代 JavaScript 在使用时肯定会令人沮丧，因为它继续快速变化和发展。但是，尽管有时看起来像是重新发明轮子，但 JavaScript 的快速发展有助于推动诸如热重载，实时 linting 和时间旅行调试等创新。作为一名开发人员，这是一个激动人心的时刻，我希望这些信息可以作为路线图，在您的旅程中为您提供帮助！

![Dinosaur comic panel 5](/images/modern-javascript-explained-for-dinosaurs-06.webp)

特别感谢[@ryanqnorth](https://twitter.com/ryanqnorth)的[恐龙漫画](http://www.qwantz.com/)，自 2003 年以来（恐龙统治网络）以来，它提供了一些最好的荒诞幽默。

原文链接：[https://peterxjang.com/blog/modern-javascript-explained-for-dinosaurs.html](https://peterxjang.com/blog/modern-javascript-explained-for-dinosaurs.html)

> 译者备注：
>
> Github 上有一个关于这篇文章源代码的仓库：[https://github.com/scherler/Modern-JavaScript-Explained-For-Dinosaurs](https://github.com/scherler/Modern-JavaScript-Explained-For-Dinosaurs)
