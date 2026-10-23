# Red Web

把小红书官方网页版整理成适合 iPhone Safari 的阅读界面：双列卡片、顶部「关注 / 发现」切换、底部导航，并保留官网的登录、笔记、评论及用户主页交互。

**v0.4.0：直接显示登录入口，使用官网原生推荐刷新，同时支持 xiaohongshu.com 和 rednote.com。**

## 安装

- [安装指引（GitHub Pages）](https://jiojiojackson.github.io/red-web/)
- [安装 Userscript](https://jiojiojackson.github.io/red-web/red-web.user.js)
- [备用安装地址（Raw）](https://raw.githubusercontent.com/jiojiojackson/red-web/main/red-web.user.js)

### iPhone / iPad（Safari）

1. 从 [App Store 安装 Userscripts](https://apps.apple.com/jp/app/userscripts/id1463298887)，并打开一次。
2. 在「设置 → App → Safari → 扩展」启用 Userscripts，允许它在你使用的官网域名运行：`www.xiaohongshu.com` 或 `www.rednote.com`。
3. 在 Safari 打开上面的 `.user.js` 安装链接，再从 Safari 扩展菜单打开 Userscripts 并确认安装。更新时替换旧脚本，检查版本为 **0.4.0**，避免同时运行多个版本。
4. 打开 [rednote 官网](https://www.rednote.com/) 或 [小红书发现页](https://www.xiaohongshu.com/explore)。点击顶部右侧或底部的 **「登录」**，使用官网弹窗完成登录；已识别到个人账号入口时显示 **「我」**。
5. 在推荐页点击顶部刷新图标、再次点击「发现 / 首页」，或回到顶部下拉，触发官网原生刷新。

**如果出现「热门笔记」展示页且没有原生登录或刷新控件：**在 Safari 地址栏菜单选择「请求桌面网站」，重新打开官网。脚本会给出指引，也可手动选择 rednote 官网；手机落地页本身可能只展示固定笔记，脚本无法为它添加服务端推荐能力。

**登录状态分别保存：**电脑 Chrome 的登录不会自动传到 iPhone Safari；xiaohongshu.com 与 rednote.com 的登录状态也应分别确认。脚本的首页、搜索和返回操作会留在当前官网域名。

**如果脚本完全不出现：**检查 Userscripts 已启用、脚本已激活、当前域名已获站点权限。安装链接的 URL 路径需要以 `.user.js` 结尾。已增加对 iPad 桌面用户代理的识别。

可通过 Safari「添加到主屏幕」创建快捷方式；独立主屏幕 Web App 能否运行扩展取决于 iOS 支持情况，不能保证。

### Mac / PC

使用 Tampermonkey、Violentmonkey 或 Userscripts 安装。桌面宽屏默认保持官网界面；Red Web 主要适配手机。

## v0.4.0 修复

| 问题 | 修复行为 |
| --- | --- |
| 手机上找不到登录入口 | 顶部右侧及底部直接显示「登录」，点击官网已有按钮，优先选实际按钮而非包裹容器 |
| 登录后导航没有更新 | 监听官网账号导航的变化，自动将「登录」切换为「我」；不会把帖子作者当成当前账号 |
| 登录弹窗被导航遮挡或超宽 | 弹窗打开时隐藏脚本导航，限制官方弹窗宽高；关闭后恢复导航 |
| 刷新后仍是旧帖子 | 优先点击官网 `.reload .btn-wrapper` 原生控件；在其他频道时先回到推荐。收到新笔记后才提示「推荐已更新」 |
| 连点、横向滑动或半页下拉误刷新 | 刷新期间锁定重复操作，检查实际内层滚动位置和滑动方向；登录弹窗内禁用下拉刷新 |
| 官网未返回新推荐 | 12 秒后恢复按钮并提示稍后重试，避免一直卡在刷新状态 |
| rednote 页面没有增强 | 增加 `rednote.com` 和 `www.rednote.com` 匹配、英文登录及账号导航、详情地址识别；保留当前域名 |

仍保留：移动版无链接图片卡片识别、原生笔记与评论、作者主页、搜索、设置中的「切换原版」、右下角调试面板。关注、消息、发布入口依赖官网实际提供的能力。没有虚构「附近 / 市场」或固定 `/login` 路由。

## 调试与恢复

点击右下角「调试」查看版本、页面类型、识别卡片数量、原生登录入口及错误摘要；「复制报告」不会自动上传。报告默认只在当前会话保留最近 90 条日志，发送至 [Issues](https://github.com/jiojiojackson/red-web/issues) 前请检查并删去敏感内容。

通过「设置 → 切换原版」或 Userscripts 扩展禁用脚本。重新开启后，可打开当前官网的 `?redweb=reset` 地址清除本地关闭状态，例如 [rednote 恢复链接](https://www.rednote.com/?redweb=reset) 或 [小红书恢复链接](https://www.xiaohongshu.com/explore?redweb=reset)。

## 开发与验证

零运行时第三方依赖。运行：

```sh
node --check red-web.user.js
node --test tests/smoke.mjs
node tests/serve.mjs
```

最后一条启动仅本机可访问的 [手机回归页](http://127.0.0.1:8766/)。把浏览器视口设为 390 × 844，点击「运行浏览器回归」，验证实际完整脚本的 11 项浏览器检查。也可使用 `/?mode=hot` 查看无原生入口的 H5 提示，或 `/?mode=logged-in` 查看已登录界面。测试服务器禁用缓存，修改后刷新即可。

Node 测试覆盖官网域名识别、原生登录入口、账号导航、刷新防重与超时、同站跳转和内层滚动位置。浏览器回归页使用模拟官网 DOM，不包含真实账号或接口；真实官网的原生刷新已在登录的 Chrome rednote 页面验证能换出新帖子。**真实 iPhone Safari 的扩展运行和账号登录仍需在设备上确认。**

## 安全设计

- 只匹配 `xiaohongshu.com` / `www.xiaohongshu.com` 和 `rednote.com` / `www.rednote.com` 的 HTTPS 页面。
- 不代理流量，不收集登录凭证、Cookie 或验证码，不向 GitHub Pages / 开发者上传账号数据。
- 没有私有 API、`GM_xmlhttpRequest`、远程 JavaScript 注入或网络拦截。
- 作者页兜底只使用官网页面已有初始化数据，不伪造笔记地址。
- 官网页面与账号权限决定登录、推荐、评论、视频等能力；本项目为非官方独立开源实验项目，与小红书官方没有关联。

## GitHub Pages 发布

合并到 `main` 后，仓库工作流执行语法检查和 Node 回归测试，再发布 `index.html` 与 `red-web.user.js`。首次配置需在仓库 Settings → Pages 中将 Source 设为 GitHub Actions。PR 中的检查工作流只运行测试。

MIT License.
