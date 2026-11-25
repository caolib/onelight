# Typora 主题开发工具

Typora 单文件主题产物改完后，不需要重启 Typora：通过 Chrome DevTools Protocol 给主题 `<link>` 加上时间戳参数强制重载，并截图。

## 前置条件（一次性）

`%APPDATA%\Typora\conf\conf.user.json` 里需要允许 Chromium 调试端口（Typora 官方支持的 `flags` 字段）：

```jsonc
"flags": [["remote-debugging-port","9222"],["remote-allow-origins","*"]]
```

改完重启一次 Typora。验证：

```bash
curl http://127.0.0.1:9222/json/version
```

不想再保留端口时，把 `flags` 改回 `[]` 即可。

## 用法

```bash
# 刷新当前主题样式（不重启）
node dev/cdp.mjs reload

# 刷新 + 截图
node dev/cdp.mjs shot                 # 输出到 dev/shot.png
node dev/cdp.mjs shot out.png

# 监听主题目录产物，构建变化时自动刷新并截图（配合 npm run watch）
node dev/cdp.mjs watch

# 在页面里执行 JS
node dev/cdp.mjs eval "getComputedStyle(document.querySelector('#write h4')).backgroundColor"

# 查看编辑器 DOM 结构（默认 #write，深度 3）
node dev/cdp.mjs dom
node dev/cdp.mjs dom "#write h2" 2
node dev/cdp.mjs html "#write h2"

# 真实鼠标操作（CDP Input，能触发 :hover、点击、光标定位）
node dev/cdp.mjs hover "#write h2"
node dev/cdp.mjs click "#write h2"
node dev/cdp.mjs unhover
```

## 推荐工作流

两个终端：

```bash
# 终端 1：编译
npm run watch
# 终端 2：预览
node dev/cdp.mjs watch
```

改 `src/**/*.scss` → sass 编译覆盖 Typora 主题目录的 CSS → cdp 工具刷新并截图到 `dev/shot.png`。

## 注意

- 只能操作当前打开窗口中的文档；示例请用 `docs/demo.md`。
- Typora 重启后需要重跑 `watch` / `shot`。
- 切换主题后也需重跑一次。
- 仅 Windows 已验证。