# Red Web

把小红书官方网页版整理成适合 iPhone Safari 的阅读界面：双列卡片、顶部「关注 / 发现」切换、底部导航，并保留官网的登录、笔记、评论及用户主页交互。

**v0.4.3：修复登录后下拉触发浏览器整页刷新：从首次下移就接管手势，加载期间重复下拉也保留当前页面；使用官网原生推荐刷新，同时支持 xiaohongshu.com 和 rednote.com。**

下拉刷新在当前电脑版页面内完成，刷新控件未就绪时保留页面并提示重试。继续保留登录防重、中文 / 英文 / 日文按钮识别、个人页返回首页的内部导航，以及页面替换时的监听器和计时器清理。

## 安装

- [安装指引（GitHub Pages）](https://jiojiojackson.github.io/red-web/)
- [安装 Userscript](https://jiojiojackson.github.io/red-web/red-web.user.js)
- [备用安装地址（Raw）](https://raw.githubusercontent.com/jiojiojackson/red-web/main/red-web.user.js)

### iPhone / iPad（Safari）

1. 从 [App Store 安装 Userscripts](https://apps.apple.com/jp/app/userscripts/id1463298887)，并打开一次。
2. 在「设置 → App → Safari → 扩展」启用 Userscripts，允许它在你使用的官网域名运行：`www.xiaohongshu.com` 或 `www.rednote.com`。
3. 在 Safari 打开上面的 `.user.js` 安装链接，再从 Safari 扩展菜单打开 Userscripts 并确认安装。更新时替换旧脚本，检查版本为 **0.4.3**，避免同时运行多个版本。
4. 打开 [rednote 官网](https://www.rednote.com/) 或 [小红书发现页](https://www.xiaohongshu.com/explore)。点击顶部右侧或底部的 **「登录」**，使用官网弹窗完成登录；已识别到个人账号入口时显示 **「我」**。
5. 在推荐页点击顶部刷新图标、再次点击「发现 / 首页」，或回到顶部下拉，触发官网原生刷新。

**如果出现「热门笔记」展示页且没有原生登录或刷新控件：**在 Safari 地址栏菜单选择「请求桌面网站」，重新打开官网。点击「登录」会通过 Userscripts 的页面请求接口读取同一官网的电脑版 HTML，并使用官网的登录弹窗；准备期间请等待，按钮会暂时禁用。只有扩展未能返回电脑版页面时，才需要使用浏览器桌面网站模式。

**登录状态分别保存：**电脑 Chrome 的登录不会自动传到 iPhone Safari；xiaohongshu.com 与 rednote.com 的登录状态也应分别确认。脚本的首页、搜索和返回操作会留在当前官网域名。

**如果脚本完全不出现：**检查 Userscripts 已启用、脚本已激活、当前域名已获站点权限。安装链接的 URL 路径需要以 `.user.js` 结尾。已增加对 iPad 桌面用户代理的识别。

可通过 Safari「添加到主屏幕」创建快捷方式；独立主屏幕 Web App 能否运行扩展取决于 iOS 支持情况，不能保证。

### Mac / PC

使用 Tampermonkey、Violentmonkey 或 Userscripts 安装。桌面宽屏默认保持官网界面；Red Web 主要适配手机。

## v0.4.3 修复

| 问题 | 修复行为 |
| --- | --- |
| 手机上找不到登录入口 | 顶部右侧及底部直接显示「登录」，优先点击官网已有按钮；手机没有入口时直接加载同站电脑版，准备期间阻止重复请求 |
| 登录后导航没有更新 | 监听官网账号导航的变化，自动将「登录」切换为「我」；不会把帖子作者当成当前账号 |
| 登录弹窗被导航遮挡或超宽 | 弹窗打开时隐藏脚本导航，限制官方弹窗宽高；关闭后恢复导航 |
| 刷新后仍是旧帖子 | 优先点击官网 `.reload .btn-wrapper` 原生控件；在其他频道时先回到推荐。收到新笔记后才提示「推荐已更新」 |
| 登录后下拉跳回手机站，再恢复电脑版 | 从首个向下移动事件就阻止浏览器整页刷新；导航栏下拉、推荐加载期间再次下拉也会拦截。刷新控件未就绪时保留当前页 |
| 连点、横向滑动或半页下拉误刷新 | 刷新期间锁定重复操作，检查实际内层滚动位置和滑动方向；登录弹窗内禁用下拉刷新 |
| 官网未返回新推荐 | 12 秒后恢复按钮并提示稍后重试，避免一直卡在刷新状态 |
| rednote 页面没有增强 | 增加 `rednote.com` 和 `www.rednote.com` 匹配、多语言登录及账号导航、详情地址识别；保留当前域名 |

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

最后一条启动仅本机可访问的 [手机回归页](http://127.0.0.1:8766/)。把浏览器视口设为 402 × 714，点击「运行浏览器回归」，验证实际完整脚本的 18 项浏览器检查。也可使用 `/?mode=hot` 查看无原生入口的 H5 提示，或 `/?mode=logged-in` 查看已登录界面。测试服务器禁用缓存，修改后刷新即可。

32 项 Node 测试和 402 × 714 的 18 项 Chrome 本地浏览器回归通过，覆盖首个微小下移、加载期间再次下拉、导航栏下拉、手势取消及浏览器接管等情况。浏览器回归页使用模拟官网 DOM，不包含真实账号或接口；真实官网的原生刷新此前已在登录的 Chrome rednote 页面验证能换出新帖子。用户已在真实 iPhone Safari 确认可成功登录；v0.4.3 的实际手势效果仍由用户复测。

## 安全设计

- 只匹配 `xiaohongshu.com` / `www.xiaohongshu.com` 和 `rednote.com` / `www.rednote.com` 的 HTTPS 页面。
- 不代理流量，不收集登录凭证、Cookie 或验证码，不向 GitHub Pages / 开发者上传账号数据。
- 仅用 `GM.xmlHttpRequest` / `GM_xmlhttpRequest` 以电脑浏览器标识读取当前官网的公开 HTML，核对来源与电脑版资源后由官方页面处理登录。没有私有 API、凭证复制或网络拦截；不读取或迁移电脑浏览器的会话。
- 作者页兜底只使用官网页面已有初始化数据，不伪造笔记地址。
- 官网页面与账号权限决定登录、推荐、评论、视频等能力；本项目为非官方独立开源实验项目，与小红书官方没有关联。

## GitHub Pages 发布

合并到 `main` 后，仓库工作流执行语法检查和 Node 回归测试，再发布 `index.html` 与 `red-web.user.js`。首次配置需在仓库 Settings → Pages 中将 Source 设为 GitHub Actions。PR 中的检查工作流只运行测试。

MIT License.
