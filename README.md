# Red Web

**把小红书官方网页版整理成适合 iPhone Safari 的阅读界面**：参考移动 App 的两列卡片、顶部「关注 / 发现」切换、底部导航，并尽量保留官方站点原生的登录、笔记、评论及用户主页交互。

> ⚠️ **v0.3.2 调试版（暂不移除调试按钮）**。此仓库不提供自建小红书客户端、私有 API 或代理服务。网站结构随时可能变化；登录、推荐流、评论、视频、作者主页受小红书官网及账号权限限制。代码已提交，但并不等于在真实 iPhone 账号上端到端验证通过。

## 安装

- **安装指引（GitHub Pages）：** https://jiojiojackson.github.io/red-web/
- **直接安装 Userscript：** https://jiojiojackson.github.io/red-web/red-web.user.js
- **备用安装地址（Raw）：** https://raw.githubusercontent.com/jiojiojackson/red-web/main/red-web.user.js

### iPhone / iPad (Safari)

1. 从 [App Store 安装 Userscripts](https://apps.apple.com/jp/app/userscripts/id1463298887) 并打开一次。
2. 在 iPhone「设置 → App → Safari → 扩展」启用 Userscripts，并允许在小红书网站运行。
3. 使用 **Safari** 打开上述 `.user.js` 安装链接，再打开 Safari 扩展菜单中的 **Userscripts**，确认安装脚本。也可将 `.user.js` 文件保存到 Userscripts 所使用的脚本目录。
4. 打开 https://www.xiaohongshu.com/explore ，按官网提供的方式登录。若小红书对移动网页做限制，可在 Safari 菜单中尝试「请求桌面网站」。
5. 如需要主屏幕快捷方式，可用 Safari 的「添加到主屏幕」；注意独立主屏幕 Web App 是否运行扩展与 iOS 支持情况有关，**不能保证脚本在主屏幕模式运行**。

**如果脚本完全不出现：**请先验证 Userscripts 已启用、扩展已有站点权限、脚本处于开启状态。对 Safari 需要安装 `.user.js` 的 URL，`.user.js` 必须出现在 URL 路径末尾，不能仅是 URL 参数。

### Mac / PC

使用支持 Userscript 的扩展（Tampermonkey、Violentmonkey、Userscripts），打开安装 URL 进行安装。桌面宽屏默认不覆盖电脑端界面：Red Web 首要支持手机。

## v0.3.2 功能与状态

| 功能 | 实现方式 | 限制 |
| --- | --- | --- |
| 双列瀑布流 | 同时识别桌面版 `.note-item`、移动版原生链接与没有链接的图片卡片；对移动版保留网站现有双列排版与点击行为 | 依赖官网页面和 DOM，不保证所有卡片匹配 |
| 下拉刷新 | 顶部下拉或刷新按钮重新加载官网推荐页 | 无法保证推荐内容发生变化 |
| 帖子详情和评论 | 优先保留小红书网页原生交互 | 取决于登录及官方支持 |
| 作者主页 | 保留官网作者链接，必要时从页面现有初始状态中读取作者 ID 做点击兜底 | 某些卡片无法获取链接时可能不生效 |
| 登录 | 仅点击官网已有的登录按钮；未找到时临时展示原版网页供手动登录 | 手机网页可能没有登录入口，脚本不绕过风控，也不跳转固定的 `/login` 页面 |
| 搜索 | 跳转小红书官方搜索页 | 搜索页适配较基础 |
| 关注、消息、我 | 优先复用官网已有入口 | 无可用入口时不虚构功能 |
| 调试报告 | 浮动「调试」按钮，查看页面识别数量、媒体尺寸摘要和脚本/网页错误，复制脱敏报告，恢复界面 | 仅保存在浏览器会话内，不自动上传 |
| 市场、附近 | 不提供入口 | — |
| 恢复原版 | 顶部菜单 → 切换原版，或在 Userscripts 扩展中关闭脚本 | 从 `?redweb=reset` 入口可解除脚本本地关闭状态 |

## 本次修复与调试步骤

针对 2026-10-23 的实际 Safari 截图，旧版有两个确定的问题：
1. 页面已经存在「热门笔记」内容，但早期脚本只搜索 `.note-item`，因此误报没有推荐笔记。
2. 旧版把一个不受支持的 `/login?redirectPath=...` 地址当作登录页，导致官网「页面不见了」错误。

v0.3.2 使用移动网页的图片位置识别没有链接的热门笔记卡片，不再因为链接数量为零而误认为内容没有加载；保留官网本身的双列布局和原生点击事件。大幅宣传横幅仍会在满足安全条件时尝试折叠。手机页面没有登录按钮时，展示 Safari「请求桌面网站」指引，不再反复寻找不存在的入口；登录仍必须使用官网支持的方式。保留错误日志和恢复控件。

**请更新到 v0.3.2 后按此顺序测试：**

1. 在 Safari 的 Userscripts 扩展中删除/替换旧版脚本，确认脚本标头是 v0.3.2；重新打开 `https://www.xiaohongshu.com/explore`。
2. 点击屏幕右下角半透明「调试」按钮，确认页面、笔记链接、识别卡片数等信息。
3. 点击「尝试官网登录」；若当前手机页面没有原生登录按钮，脚本会显示指导面板。请在 Safari 中手动选择「请求桌面网站」，在官网出现登录入口时使用它（官网可能仍有登录限制）。需要时可点击「恢复脚本」。
4. 返回推荐页，测试下拉刷新、笔记详情和评论、作者头像和主页。
5. 若失败，点击「重新检测」再点击「复制报告」，将报告附到 [GitHub Issues](https://github.com/jiojiojackson/red-web/issues)。**复制前请自行核对、删去敏感内容**。

**注意：**这个调试版只记录脚本操作、页面错误摘要、当前页面类型和 DOM 检测数量等，默认只保留最近 90 条在当前会话的 `sessionStorage` 中，不拦截网络请求，也不自动上传至开发者。

## 项目结构

```text
red-web/
├── red-web.user.js           # 浏览器端 Userscript，零运行时第三方依赖
├── index.html                # GitHub Pages 安装向导
├── tests/smoke.mjs           # Node 内置测试：移动版卡片、官网入口、调试功能
├── .github/workflows/pages.yml
├── LICENSE
└── README.md
```

## 安全设计

- 只在 `https://www.xiaohongshu.com/*` 和 `https://xiaohongshu.com/*` 匹配运行。
- 不通过第三方服务器代理小红书流量，也没有额外的登录、凭证、Cookie 收集端点。
- 没有 `GM_xmlhttpRequest` 或远程 JavaScript 注入。脚本只使用页面中的 DOM、CSS 和官网现有的初始化数据。
- 作者页兜底仅读取已在浏览器页面可见的原始数据，不请求未经公开授权的服务端接口。
- 安装和后续更新来源是此公开的 GitHub 仓库。请检查脚本代码，尤其注意 Userscript 管理器对网站访问权限的提示。

## GitHub Pages 发布

仓库自带 GitHub Actions 工作流。若首次不能部署，请在仓库 **Settings → Pages → Build and deployment** 中选择 **GitHub Actions** 作为 Source，然后在 **Actions** 里重跑 `Deploy install guide`。

部署流程会执行 `node --check red-web.user.js` 和 `node --test tests/smoke.mjs`，再把 `index.html` 和 `red-web.user.js` 作为静态网站发布。每次推送到 `main` 都会自动触发。

## 贡献与反馈

在 [Issues](https://github.com/jiojiojackson/red-web/issues) 报告：iPhone/iOS 版本、Safari/Userscripts 版本、报错页面 URL（去掉敏感参数）、必要的脱敏截图、复现步骤。不要提交登录口令、Cookie、验证码或 session token。

本项目是非官方的独立开源实验项目，与小红书官方没有关联。

MIT License.
