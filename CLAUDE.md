# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目性质

Typora 主题（OneLight）。源码是 SCSS，编译产物是**单文件 CSS**，直接写入 Typora 的主题加载目录（默认 `%APPDATA%\Typora\themes`）。Typora 只读该目录下的 `onelight.css` / `onelight-dark.css`，因此本仓库目录与 Typora 主题目录是分离的。

没有测试和 lint；验证方式是构建后在 Typora 里截图核对。

## 构建

```bash
pnpm install
pnpm build     # 一次性构建
pnpm watch     # 监听 src/**/*.scss，自动重新编译
```

`scripts/build.mjs` 用 dart-sass 编译两个入口，输出路径由环境变量 `TYPORA_THEMES` 决定（默认 `%APPDATA%\Typora\themes`）。产物不提交到本仓库。

## 架构

- 两个入口：`src/onelight.scss`（浅色）、`src/onelight-dark.scss`（深色）。
- **深色入口 `@use 'onelight'` 后再覆盖**。Sass 的 `@use` 有模块缓存，同一模块的 CSS 只输出一次，所以深色入口只需额外 `@use` 深色专属模块（`kbd/kbd-dark`）和 `abstracts/variables-dark`。
- `@use` 的书写顺序就是 CSS 输出顺序。`abstracts/variables` 必须放在浅色入口的**最后**，因为多个 style 模块（code、font、mermaid、sidebar、table、blockquote2）自己也定义了 `:root`，入口变量需要覆盖它们。同理 `variables-dark` 放在深色入口最后。
- `abstracts/_variables.scss` / `_variables-dark.scss` 是全部 CSS 变量的集中地。颜色等运行期主题切换必须继续使用 CSS 自定义属性，不要改成 SCSS 变量；SCSS 变量只用于编译期常量。
- 具体规则按类别在 `src/style/<类别>/`：title、code、table、list、blockquote、kbd、sidebar、editor、icon、mermaid、font。
- 主题色 `--theme-color` 的发布默认值是 `#d97757`（橙色），定义在两个 variables 文件中；不要改回蓝色。

## 资源路径

产物是单文件，CSS 中的相对 `url()` 相对**主题目录根**解析，而不是 `src/style/`。当前唯一资源是 `onelight/fonts/codicon.ttf`，引用写作 `url('./onelight/fonts/codicon.ttf')`。新增资源时沿用这个规则，并把文件放进仓库的 `onelight/` 目录。

## 预览调试（不重启 Typora）

```bash
node dev/cdp.mjs watch     # 主题产物变化时刷新 Typora 并截图到 dev/shot.png
node dev/cdp.mjs shot      # 刷新 + 截图
node dev/cdp.mjs reload    # 只刷新主题 <link>
node dev/cdp.mjs eval "<js>"
node dev/cdp.mjs dom ["#write"] [depth]
node dev/cdp.mjs hover "#write h2"    # 真实鼠标事件，可触发 :hover
node dev/cdp.mjs click "#write h2"
```

前置条件与坑见 `dev/README.md`：需要 `conf.user.json` 的 `flags` 开启 9222 端口；Typora 重启或切换主题后要重跑；预览文档用 `docs/demo.md`。

## 约定

- 颜色一律走 CSS 变量，改配色优先改变量而非逐个选择器。
- 尽量不用 `!important`。
- 用最少的代码达到效果。

## 发布

手动打包（无 CI）：构建后把 `onelight.css`、`onelight-dark.css`、`onelight/`（资源）压缩发布。