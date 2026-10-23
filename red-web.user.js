// ==UserScript==
// @name         Red Web - 小红书移动网页优化
// @namespace    https://github.com/jiojiojackson/red-web
// @version      0.2.2
// @description  小红书手机网页优化：双列笔记、官网登录、评论主页及隐私安全调试面板
// @author       jiojiojackson
// @match        https://www.xiaohongshu.com/*
// @match        https://xiaohongshu.com/*
// @run-at       document-idle
// @grant        none
// @noframes
// @license      MIT
// @downloadURL  https://raw.githubusercontent.com/jiojiojackson/red-web/main/red-web.user.js
// @updateURL    https://raw.githubusercontent.com/jiojiojackson/red-web/main/red-web.user.js
// ==/UserScript==

(function () {
  'use strict';

  // Red Web only changes presentation. No external API, credential capture or request interception.
  if (window.__RED_WEB_LOADED__) return;
  window.__RED_WEB_LOADED__ = true;

  const KEY = 'red-web-disabled';
  const VERSION = '0.2.2';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const mobile = /iPhone|iPod|Android|Mobile/i.test(navigator.userAgent)
    || window.matchMedia('(max-width: 820px)').matches;
  const query = new URLSearchParams(location.search);
  if (query.get('redweb') === 'reset') {
    try { localStorage.removeItem(KEY); } catch (_) {}
    query.delete('redweb');
    history.replaceState(history.state, '', location.pathname +
      (query.size ? '?' + query.toString() : '') + location.hash);
  }
  let disabled = false;
  try { disabled = localStorage.getItem(KEY) === '1'; } catch (_) {}
  if (!mobile || disabled) return;

  const css = `
:root { --red-web-accent: #ff2442; --red-web-top: 55px; --red-web-bottom: 65px; }
html { overflow-x: hidden !important; }
body.red-web {
  margin: 0 !important; min-width: 0 !important; max-width: 100vw !important;
  overflow-x: clip !important; background: #fff !important;
  -webkit-tap-highlight-color: transparent;
}
body.red-web #app, body.red-web #app > div, body.red-web main {
  min-width: 0 !important; max-width: 100vw !important;
}
body.red-web #header, body.red-web .header-container,
body.red-web .side-bar, body.red-web .side-bar-container,
body.red-web .sidebar, body.red-web #sidebar,
body.red-web .side-bar-wrapper, body.red-web .channel-container,
body.red-web .channel-scroll-container, body.red-web #channel-container,
body.red-web #link-guide {
  display: none !important;
}
body.red-web[data-red-view="feed"] #exploreFeeds,
body.red-web[data-red-view="feed"] #mfContainer,
body.red-web[data-red-view="feed"] .feeds-page,
body.red-web[data-red-view="feed"] .main-container {
  width: 100% !important; max-width: 100% !important; min-width: 0 !important;
  margin: 0 !important; padding-left: 0 !important; padding-right: 0 !important;
  box-sizing: border-box !important;
}
body.red-web[data-red-view="feed"] .feeds-page {
  padding-top: calc(var(--red-web-top) + 10px) !important;
  padding-bottom: calc(var(--red-web-bottom) + env(safe-area-inset-bottom) + 14px) !important;
  height: auto !important; min-height: 100dvh !important;
  overflow: visible !important;
}
body.red-web [data-red-feed-root="true"] {
  display: block !important;
  width: 100% !important; max-width: 100% !important; min-width: 0 !important;
  height: auto !important; min-height: 0 !important;
  padding: 0 8px 110px !important; margin: 0 auto !important;
  column-count: 2 !important; column-gap: 8px !important;
  box-sizing: border-box !important; overflow: visible !important;
  position: relative !important;
}
body.red-web [data-red-feed-root="true"] .note-item {
  display: inline-block !important;
  position: relative !important; top: auto !important; left: auto !important;
  right: auto !important; bottom: auto !important;
  transform: none !important; translate: none !important;
  width: 100% !important; max-width: 100% !important;
  min-width: 0 !important; height: auto !important;
  margin: 0 0 10px !important; padding: 0 !important;
  vertical-align: top !important; break-inside: avoid !important;
  overflow: hidden !important; border-radius: 9px !important;
  background: #fff !important;
  box-shadow: 0 1px 5px rgba(0,0,0,.055) !important;
}
body.red-web [data-red-feed-root="true"] .note-item .cover,
body.red-web [data-red-feed-root="true"] .note-item .cover a,
body.red-web [data-red-feed-root="true"] .note-item .cover img,
body.red-web [data-red-feed-root="true"] .note-item .cover video {
  max-width: 100% !important; width: 100% !important;
  height: auto !important; object-fit: cover !important;
}
body.red-web [data-red-feed-root="true"] .note-item .cover {
  display: block !important; position: relative !important;
  overflow: hidden !important; border-radius: 9px 9px 0 0 !important;
}
body.red-web [data-red-feed-root="true"] .note-item .footer,
body.red-web [data-red-feed-root="true"] .note-item .info-container {
  display: block !important; position: relative !important;
  width: 100% !important; min-width: 0 !important;
  padding: 8px 8px 9px !important; margin: 0 !important;
  box-sizing: border-box !important; background: #fff !important;
}
body.red-web [data-red-feed-root="true"] .note-item .title,
body.red-web [data-red-feed-root="true"] .note-item .title span {
  display: -webkit-box !important; -webkit-box-orient: vertical !important;
  -webkit-line-clamp: 2 !important; line-clamp: 2 !important;
  overflow: hidden !important; white-space: normal !important;
  font-size: 13px !important; font-weight: 600 !important;
  line-height: 1.45 !important; color: #222 !important;
  margin: 0 0 8px !important; padding: 0 !important;
}
body.red-web [data-red-feed-root="true"] .note-item .author-wrapper {
  display: flex !important; gap: 5px !important;
  min-width: 0 !important; width: 100% !important;
  align-items: center !important; padding: 0 !important;
}
body.red-web [data-red-feed-root="true"] .note-item .author-wrapper img,
body.red-web [data-red-feed-root="true"] .note-item .author-avatar {
  width: 22px !important; height: 22px !important; border-radius: 50% !important;
  object-fit: cover !important; flex: none !important;
}
body.red-web [data-red-feed-root="true"] .note-item .author-wrapper .name {
  display: block !important; flex: 1 1 auto !important;
  font-size: 11px !important; color: #666 !important;
  min-width: 0 !important; overflow: hidden !important;
  white-space: nowrap !important; text-overflow: ellipsis !important;
}
body.red-web [data-red-feed-root="true"] .note-item .like-wrapper {
  flex: 0 0 auto !important; font-size: 11px !important; color: #777 !important;
}
body.red-web [data-red-feed-root="true"] .note-item .like-wrapper .count {
  font-size: 11px !important;
}
body.red-web [data-red-feed-root="true"] .note-item .author-wrapper a {
  min-width: 0 !important;
}
#red-web-top, #red-web-bottom, #red-web-pull, #red-web-toast,
#red-web-search, #red-web-menu {
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;
  box-sizing: border-box !important;
}
#red-web-top {
  position: fixed !important; z-index: 2147482000 !important;
  left: 0; right: 0; top: 0; height: calc(var(--red-web-top) + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) 11px 0;
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(255,255,255,.97); backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px); border-bottom: 1px solid #f5f5f5;
}
#red-web-top .red-web-tabs { display: flex; gap: 28px; height: 100%; align-items: center; }
#red-web-top button, #red-web-bottom button {
  background: none; color: #252525; border: 0; padding: 0; margin: 0;
  display: inline-flex; align-items: center; justify-content: center;
  font: inherit; cursor: pointer; appearance: none;
}
#red-web-top .red-web-tab { position: relative; height: 100%; font-size: 16px; color: #929292; }
#red-web-top .red-web-tab.active { color: #202020; font-weight: 650; }
#red-web-top .red-web-tab.active::after {
  content: ""; position: absolute; width: 26px; height: 3px; border-radius: 3px;
  background: var(--red-web-accent); bottom: 8px; left: 50%; transform: translateX(-50%);
}
#red-web-top .red-web-icon { width: 38px; height: 44px; }
#red-web-top .red-web-back { gap: 9px; font-size: 16px; font-weight: 600; }
#red-web-bottom {
  position: fixed !important; z-index: 2147482000 !important;
  bottom: 0; left: 0; right: 0;
  height: calc(var(--red-web-bottom) + env(safe-area-inset-bottom));
  padding: 3px 5px env(safe-area-inset-bottom);
  display: flex; align-items: center; justify-content: space-around;
  background: rgba(255,255,255,.98); border-top: 1px solid #f0f0f0;
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
}
#red-web-bottom .red-web-nav {
  min-width: 54px; height: 58px; flex-direction: column; gap: 3px; font-size: 11px; color: #535353;
}
#red-web-bottom .red-web-nav.active { color: #111; font-weight: 650; }
#red-web-bottom .red-web-nav svg { width: 25px; height: 25px; }
#red-web-bottom .red-web-plus {
  width: 51px; height: 42px; border-radius: 11px;
  background: var(--red-web-accent); color: white; font-size: 34px; font-weight: 300;
}
body.red-web[data-red-view="detail"] #red-web-bottom,
body.red-web[data-red-view="login"] #red-web-bottom { display: none !important; }
body.red-web[data-red-view="detail"] #red-web-top .red-web-tabs,
body.red-web[data-red-view="login"] #red-web-top { display: none !important; }
body.red-web[data-red-view="detail"] .note-detail-mask {
  position: fixed !important; inset: 0 !important; z-index: 2147481000 !important;
  padding: 0 !important; background: #fff !important;
}
body.red-web[data-red-view="detail"] #noteContainer,
body.red-web[data-red-view="detail"] .note-detail-mask .note-container {
  width: 100vw !important; max-width: 100vw !important; min-width: 0 !important;
  height: 100dvh !important; max-height: 100dvh !important;
  margin: 0 !important; border-radius: 0 !important;
  overflow: auto !important; -webkit-overflow-scrolling: touch;
}
body.red-web[data-red-view="detail"] #noteContainer .media-container,
body.red-web[data-red-view="detail"] .note-detail-mask .media-container {
  width: 100% !important; max-width: 100% !important; min-width: 0 !important;
}
body.red-web[data-red-view="detail"] #noteContainer .interaction-container,
body.red-web[data-red-view="detail"] #noteContainer .note-content,
body.red-web[data-red-view="detail"] #noteContainer .comments-container {
  width: 100% !important; max-width: 100% !important; min-width: 0 !important;
}
body.red-web[data-red-view="detail"] .note-detail-mask .note-container {
  flex-direction: column !important; padding-top: calc(var(--red-web-top) + env(safe-area-inset-top)) !important;
  padding-bottom: env(safe-area-inset-bottom) !important; box-sizing: border-box !important;
}
body.red-web[data-red-view="detail"] .note-detail-mask .media-container {
  max-height: 62dvh !important; flex-shrink: 0 !important;
}
body.red-web[data-red-view="detail"] #noteContainer .author-wrapper,
body.red-web[data-red-view="detail"] #noteContainer .comments-container {
  min-width: 0 !important;
}
body.red-web[data-red-view="profile"] .user-page,
body.red-web[data-red-view="profile"] .user-container,
body.red-web[data-red-view="search"] .search-container {
  width: 100% !important; min-width: 0 !important; max-width: 100% !important;
  box-sizing: border-box !important; padding-left: 8px !important; padding-right: 8px !important;
}
body.red-web[data-red-view="profile"] main,
body.red-web[data-red-view="search"] main,
body.red-web[data-red-view="other"] main {
  padding-top: calc(var(--red-web-top) + env(safe-area-inset-top)) !important;
  padding-bottom: calc(var(--red-web-bottom) + env(safe-area-inset-bottom)) !important;
}
#red-web-pull {
  position: fixed; z-index: 2147482001; pointer-events: none;
  left: 50%; top: calc(var(--red-web-top) + env(safe-area-inset-top) + 7px);
  transform: translate(-50%,-60px); transition: transform .15s;
  padding: 8px 13px; border-radius: 22px; font-size: 12px;
  color: #555; background: white; box-shadow: 0 2px 14px #0002;
}
#red-web-toast {
  position: fixed; z-index: 2147483000; bottom: calc(var(--red-web-bottom) + 22px + env(safe-area-inset-bottom));
  left: 50%; transform: translateX(-50%); max-width: calc(100vw - 48px);
  background: #242424; color: white; border-radius: 9px; padding: 11px 14px;
  font-size: 12px; line-height: 1.5; text-align: center; pointer-events: none;
}
#red-web-search, #red-web-menu {
  position: fixed; inset: 0; z-index: 2147482900; background: rgba(0,0,0,.4);
  display: grid; place-items: start center; padding: 16dvh 16px 0;
}
#red-web-search .red-web-dialog, #red-web-menu .red-web-dialog {
  background: white; width: min(100%,420px); border-radius: 16px;
  padding: 20px; box-sizing: border-box; box-shadow: 0 10px 30px #0002;
}
.red-web-dialog h3 { font-size: 18px; margin: 0 0 16px; }
.red-web-dialog input { width: 100%; box-sizing: border-box; padding: 13px;
  font-size: 16px; border-radius: 9px; border: 1px solid #ddd; outline-color: #ff2442; }
.red-web-dialog .red-web-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 14px; }
.red-web-dialog button { border: 1px solid #eee; background: #f7f7f7; color: #222;
  border-radius: 8px; padding: 10px 14px; font-size: 14px; }
.red-web-dialog button.primary { background: #ff2442; color: white; border-color: #ff2442; }

/* v0.2: mobile-web fallback and on-device diagnostic panel */
body.red-web[data-red-view="feed"] [data-red-feed-root="true"].red-web-mobile-grid {
  display: grid !important; grid-template-columns: minmax(0,1fr) minmax(0,1fr) !important;
  column-gap: 8px !important; row-gap: 10px !important;
  padding: 0 8px calc(var(--red-web-bottom) + 20px) !important;
  column-count: auto !important; align-items: start !important;
}
body.red-web[data-red-view="feed"] [data-red-feed-root="true"].red-web-mobile-grid > .red-web-card {
  display: block !important; box-sizing: border-box !important;
  width: 100% !important; min-width: 0 !important; max-width: 100% !important;
  margin: 0 !important; height: auto !important; transform: none !important;
  position: relative !important; break-inside: avoid !important;
  border-radius: 10px !important; overflow: hidden !important; background: #fff !important;
}
body.red-web[data-red-view="feed"] [data-red-feed-root="true"].red-web-mobile-grid > .red-web-card img {
  max-width: 100% !important; height: auto !important;
}
body.red-web[data-red-view="feed"] .red-web-promo-hidden { display: none !important; }
body.red-web[data-red-view="feed"] .red-web-popular-heading { display: none !important; }
#red-web-debug-toggle {
  position: fixed !important; right: 10px; bottom: calc(76px + env(safe-area-inset-bottom));
  z-index: 2147483600; color: #fff; background: #2229; border: 1px solid #fff9;
  border-radius: 999px; padding: 8px 9px; min-height: 34px; font: 11px -apple-system,sans-serif;
  box-shadow: 0 2px 8px #0003; cursor: pointer;
}
#red-web-debug-panel {
  position: fixed !important; z-index: 2147483700 !important;
  left: 7px; right: 7px; bottom: calc(90px + env(safe-area-inset-bottom));
  max-height: 65dvh; overflow: hidden; display: flex; flex-direction: column;
  border: 1px solid #333; border-radius: 15px; background: #141b22;
  box-shadow: 0 8px 36px #0007; color: #eaf3fb;
  font: 12px/1.55 -apple-system,BlinkMacSystemFont,sans-serif;
}
#red-web-debug-panel header { padding: 12px 14px; display: flex; align-items: center;
  justify-content: space-between; border-bottom: 1px solid #ffffff25; }
#red-web-debug-panel header small { color: #acc0ce; font-size: 11px; }
#red-web-debug-panel button {
  color: #fff; background: #3c5063; border: 1px solid #617081;
  padding: 8px 10px; border-radius: 7px; font: inherit; cursor: pointer;
}
#red-web-debug-panel header button { font-size: 22px; line-height: 18px;
  background: transparent; border: 0; padding: 2px 6px; }
#red-web-debug-panel .rw-debug-actions { padding: 9px; display: flex; gap: 6px;
  overflow-x: auto; flex-shrink: 0; }
#red-web-debug-panel .rw-debug-actions button { white-space: nowrap; }
#red-web-debug-panel pre { flex: 1 1 auto; min-height: 90px; overflow: auto;
  padding: 12px; margin: 0; white-space: pre-wrap; overflow-wrap: anywhere;
  font: 11px/1.58 ui-monospace,SFMono-Regular,monospace; }
#red-web-debug-panel p { padding: 7px 12px 10px; margin: 0;
  font-size: 10px; color: #b9cbd7; border-top: 1px solid #ffffff20; }
@media (min-width: 821px) {
  #red-web-top, #red-web-bottom, #red-web-pull, #red-web-debug-toggle { display: none !important; }
}
`;

  function addCss() {
    let style = $('#red-web-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'red-web-style';
      style.textContent = css;
      (document.head || document.documentElement).appendChild(style);
    }
  }

  const icons = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    search: '<circle cx="10.8" cy="10.8" r="7.2"/><path d="m16.4 16.4 4.5 4.5"/>',
    home: '<path d="m3 11 9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
    chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.95L3 21l1.9-5.5A8.5 8.5 0 1 1 21 11.5Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.5 9A7 7 0 0 1 19 7l1 5M4 12l1 5a7 7 0 0 0 12.5-2"/>'
  };
  function svg(name) {
    return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      icons[name] + '</svg>';
  }
  let currentView = '';
  let lastPath = '';
  let timer;
  let toastTimeout;
  let pullStart = 0;
  let pullDistance = 0;
  const DEBUG_KEY = 'red-web-debug-v2';
  let debugLines = [];
  let debugVisible = false;
  let lastFeedSignature = '';
  let previousError = '';
  try {
    const cached = JSON.parse(sessionStorage.getItem(DEBUG_KEY) || '[]');
    if (Array.isArray(cached)) debugLines = cached.slice(-55);
  } catch (_) { /* private browsing can block storage */ }
  function clean(value) {
    return String(value == null ? '' : value)
      .replace(/https?:\/\/[^\s"'<>]+/g, '[URL]')
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]')
      .replace(/(?:token|cookie|session|password|passwd|authorization|xsec|secret|code)[^\s,;:]*/gi, '[REDACTED]')
      .replace(/\b[a-zA-Z0-9_=-]{30,}\b/g, '[ID]')
      .slice(0, 210);
  }
  function log(kind, message) {
    const time = new Date().toLocaleTimeString('zh-CN', {hour12: false});
    const item = time + ' [' + clean(kind) + '] ' + clean(message);
    if (item === previousError && kind === 'ERROR') return;
    previousError = item;
    debugLines.push(item);
    if (debugLines.length > 90) debugLines.splice(0, debugLines.length - 90);
    try { sessionStorage.setItem(DEBUG_KEY, JSON.stringify(debugLines)); } catch (_) {}
    if (debugVisible) renderDebug();
  }
  function safeViewPath() {
    const path = location.pathname;
    if (/^\/explore\/[^/]+/.test(path)) return '/explore/[note]';
    if (/^\/user\/profile\/[^/]+/.test(path)) return '/user/profile/[user]';
    return path.slice(0, 64);
  }
  function loginElements() {
    return $$('button,a,[role="button"],.login-btn,.login-button,.login-entry')
      .filter(el => !el.closest('#red-web-debug-panel,#red-web-top,#red-web-bottom,#red-web-menu,#red-web-search')
        && /^(登录|立即登录|注册\/登录|登录\/注册|登录账号|Log in|Sign in)$/.test((el.innerText || el.textContent || '').trim()));
  }
  function snapshot() {
    const cards = selectNoteCards();
    const heading = popularHeading();
    const anchors = noteLinks();
    const root = $('[data-red-feed-root="true"]');
    const lines = [
      'Red Web ' + VERSION,
      '页面: ' + safeViewPath() + ' | 视图: ' + pageView(),
      '屏幕: ' + window.innerWidth + 'x' + window.innerHeight,
      '加载: ' + document.readyState + ' | 触屏: ' + ('ontouchstart' in window),
      '笔记链接: ' + anchors.length + ' | note-item: ' + $$('.note-item').length,
      '识别卡片: ' + cards.length + ' | 热门笔记标题: ' + Boolean(heading),
      '布局容器: ' + (root ? root.tagName.toLowerCase() + '.' +
        Array.from(root.classList).slice(0,3).join('.') : '未识别'),
      '官方登录入口: ' + loginElements().length,
      '原生详情: ' + Boolean($('.note-detail-mask,#noteContainer')),
      '日志数量: ' + debugLines.length,
      '注意：不记录登录凭证、Cookie、正文或 URL 参数'
    ];
    return lines.join('\n');
  }
  function debugText() {
    return snapshot() + '\n\n---- LOG ----\n' + debugLines.join('\n');
  }
  function debugControl() {
    if (!$('#red-web-debug-toggle')) {
      const toggle = document.createElement('button');
      toggle.id = 'red-web-debug-toggle';
      toggle.textContent = '调试';
      toggle.setAttribute('type', 'button');
      toggle.setAttribute('aria-label', '打开 Red Web 调试面板');
      toggle.addEventListener('click', () => {
        debugVisible = !debugVisible;
        if (debugVisible) log('INFO', '打开调试面板');
        renderDebug();
      });
      document.body.appendChild(toggle);
    }
  }
  function renderDebug() {
    let panel = $('#red-web-debug-panel');
    if (!debugVisible) { if (panel) panel.remove(); return; }
    if (!panel) {
      panel = document.createElement('aside');
      panel.id = 'red-web-debug-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Red Web 调试');
      panel.innerHTML = '<header><b>Red Web 调试 <small>v' + VERSION + '</small></b>' +
        '<button type="button" data-rw-debug="close" aria-label="关闭调试">×</button></header>' +
        '<div class="rw-debug-actions">' +
        '<button type="button" data-rw-debug="scan">重新检测</button>' +
        '<button type="button" data-rw-debug="copy">复制报告</button>' +
        '<button type="button" data-rw-debug="login">尝试官网登录</button>' +
        '<button type="button" data-rw-debug="clear">清空日志</button></div>' +
        '<pre id="red-web-debug-data"></pre>' +
        '<p>报告不包含 Cookie、验证码、笔记内容或完整 URL；发送前仍请检查。</p>';
      panel.addEventListener('click', async event => {
        const btn = event.target.closest('[data-rw-debug]');
        if (!btn) return;
        const action = btn.dataset.rwDebug;
        if (action === 'close') { debugVisible = false; renderDebug(); }
        if (action === 'scan') { log('SCAN', '手动重新识别页面'); update(); renderDebug(); }
        if (action === 'login') officialLogin();
        if (action === 'clear') { debugLines = []; log('INFO', '日志已清空'); }
        if (action === 'copy') {
          const report = debugText();
          try {
            if (!navigator.clipboard || !navigator.clipboard.writeText) throw Error('clipboard unavailable');
            await navigator.clipboard.writeText(report);
            log('INFO', '已复制诊断报告');
            notify('已复制调试报告');
          } catch (_) {
            const pre = $('#red-web-debug-data');
            if (pre) {
              const selection = window.getSelection();
              const range = document.createRange();
              range.selectNodeContents(pre);
              selection.removeAllRanges();
              selection.addRange(range);
            }
            notify('请长按选中的报告文字复制');
          }
        }
      });
      document.body.appendChild(panel);
    }
    const output = $('#red-web-debug-data');
    if (output) output.textContent = debugText();
  }
  window.addEventListener('error', event => {
    log('ERROR', 'page error: ' + clean(event.message || (event.target && event.target.tagName) || 'unknown'));
  }, true);
  window.addEventListener('unhandledrejection', event => {
    const reason = event.reason;
    log('ERROR', 'promise: ' + clean(reason && reason.message || typeof reason));
  });

  function notify(message) {
    let el = $('#red-web-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'red-web-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.remove(), 3500);
  }

  function isVisible(el) {
    if (!el || !el.isConnected) return false;
    const s = getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden' &&
      el.getBoundingClientRect().width > 0;
  }
  function pageView() {
    const path = location.pathname;
    if (/^\/(login|website-login)(\/|$)/.test(path)) return 'login';
    if (/^\/explore\/[^/]+/.test(path)) return 'detail';
    if (isVisible($('.note-detail-mask #noteContainer')) ||
      isVisible($('.note-detail-mask .note-container'))) return 'detail';
    if (/^\/user\/profile\//.test(path)) return 'profile';
    if (/^\/search_result/.test(path)) return 'search';
    if (/^\/explore\/?$/.test(path) || path === '/') return 'feed';
    return 'other';
  }
  function button(action, label, icon, cls = '') {
    return '<button type="button" class="' + cls + '" data-red-action="' +
      action + '" aria-label="' + label + '">' + (icon ? svg(icon) : '') +
      (cls.includes('red-web-nav') ? '<span>' + label + '</span>' : '') + '</button>';
  }
  function drawBars(view) {
    const top = $('#red-web-top') || document.createElement('div');
    top.id = 'red-web-top';
    const bottom = $('#red-web-bottom') || document.createElement('div');
    bottom.id = 'red-web-bottom';

    if (view === 'detail') {
      top.innerHTML = '<button class="red-web-back" data-red-action="back" aria-label="返回">' +
        svg('back') + '<span>笔记</span></button>' +
        button('search', '搜索', 'search', 'red-web-icon');
    } else {
      const title = view === 'profile' ? '个人主页' : view === 'search' ? '搜索' : '发现';
      top.innerHTML = button('menu', '设置', 'menu', 'red-web-icon') +
        '<div class="red-web-tabs">' +
        '<button class="red-web-tab" data-red-action="following">关注</button>' +
        '<button class="red-web-tab active" data-red-action="home">' + title + '</button></div>' +
        button(view === 'feed' ? 'refresh' : 'search', view === 'feed' ? '刷新推荐' : '搜索',
          view === 'feed' ? 'refresh' : 'search', 'red-web-icon');
    }
    bottom.innerHTML =
      button('home', '首页', 'home', 'red-web-nav' + (view === 'feed' ? ' active' : '')) +
      button('search', '搜索', 'search', 'red-web-nav' + (view === 'search' ? ' active' : '')) +
      '<button type="button" class="red-web-plus" data-red-action="publish" aria-label="发布">+</button>' +
      button('messages', '消息', 'chat', 'red-web-nav') +
      button('profile', '我', 'user', 'red-web-nav' + (view === 'profile' ? ' active' : ''));
    if (!top.isConnected) document.body.appendChild(top);
    if (!bottom.isConnected) document.body.appendChild(bottom);
  }

  function findNative(label, scopes = []) {
    const targets = scopes.length ? scopes.flatMap(s => $$(s)) : [document.body];
    for (const root of targets) {
      const els = $$('a,button,[role="button"],.channel,.side-bar-item', root);
      const match = els.find(el => !el.closest('#red-web-top,#red-web-bottom,#red-web-menu') &&
        el.textContent.trim() === label);
      if (match) return match;
    }
    return null;
  }
  function nativeLink(fragment) {
    return $$('a[href]').find(a => a.href.includes(fragment) &&
      !a.closest('.note-item,.note-detail-mask,#red-web-top,#red-web-bottom'));
  }
  let nativeLoginMode = false;
  function restoreRedWeb() {
    nativeLoginMode = false;
    document.body.classList.add('red-web');
    document.body.dataset.redLoginOpen = 'false';
    const top = $('#red-web-top');
    const bottom = $('#red-web-bottom');
    if (top) top.hidden = false;
    if (bottom) bottom.hidden = false;
    log('AUTH', '恢复脚本界面');
    update();
  }
  function officialLogin() {
    const candidates = loginElements();
    const entry = candidates.find(isVisible) || candidates[0];
    log('AUTH', '请求官网登录，原生入口数=' + candidates.length);
    // The first-party website owns authentication. The script must not guess a /login URL:
    // its previously hardcoded URL is a Xiaohongshu 404.
    nativeLoginMode = true;
    document.body.classList.remove('red-web');
    document.body.dataset.redLoginOpen = 'true';
    const top = $('#red-web-top');
    const bottom = $('#red-web-bottom');
    if (top) top.hidden = true;
    if (bottom) bottom.hidden = true;
    $('#red-web-menu')?.remove();
    if (entry) {
      setTimeout(() => {
        try {
          entry.click();
          log('AUTH', '已点击官网原生登录入口；请检查是否出现官方弹窗');
        } catch (error) { log('ERROR', '官网登录入口点击失败: ' + (error && error.message)); }
      }, 80);
      notify('已切换官方界面，尝试打开官网登录');
    } else {
      log('WARN', '官网当前页面未找到登录按钮；不再跳转不存在的 /login 页面');
      notify('已切换官方原版，请使用官网登录按钮；没有按钮可尝试 Safari 请求桌面网站');
    }
  }
  function showDialog(kind) {
    const id = kind === 'search' ? 'red-web-search' : 'red-web-menu';
    if ($('#' + id)) return;
    const mask = document.createElement('div');
    mask.id = id;
    if (kind === 'search') {
      mask.innerHTML = '<div class="red-web-dialog" role="dialog" aria-label="搜索笔记">' +
        '<h3>搜索小红书</h3><form id="red-web-search-form">' +
        '<input type="search" name="keyword" placeholder="搜索笔记、用户" required autocomplete="off">' +
        '<div class="red-web-actions"><button type="button" data-red-close>取消</button>' +
        '<button type="submit" class="primary">搜索</button></div></form></div>';
    } else {
      mask.innerHTML = '<div class="red-web-dialog" role="dialog" aria-label="Red Web 设置">' +
        '<h3>Red Web</h3><p style="font-size:13px;line-height:1.65;color:#555">' +
        '脚本只修改界面；登录、帖子和评论仍由小红书官网提供。</p>' +
        '<div class="red-web-actions"><button type="button" data-red-close>返回</button>' +
        '<button type="button" data-red-action="login">官网登录</button>' +
        '<button type="button" class="primary" data-red-action="disable">切换原版</button></div></div>';
    }
    mask.addEventListener('click', event => {
      if (event.target === mask || event.target.closest('[data-red-close]')) mask.remove();
    });
    document.body.appendChild(mask);
    if (kind === 'search') {
      $('#red-web-search-form').addEventListener('submit', event => {
        event.preventDefault();
        const keyword = new FormData(event.currentTarget).get('keyword').trim();
        if (keyword) location.assign('https://www.xiaohongshu.com/search_result?keyword=' +
          encodeURIComponent(keyword) + '&source=web_explore_feed');
      });
      $('#red-web-search input').focus();
    }
  }

  function refresh() {
    if (pageView() !== 'feed') {
      location.assign('https://www.xiaohongshu.com/explore');
      return;
    }
    notify('正在刷新推荐…');
    // A full reload is the stable, first-party refresh path. No undocumented signed API calls.
    setTimeout(() => location.reload(), 180);
  }
  function back() {
    const close = $('.note-detail-mask .close-circle') ||
      $('.note-detail-mask .close-icon') || $('.note-detail-mask .close-btn');
    if (close) close.click();
    else if (history.length > 1) history.back();
    else location.assign('https://www.xiaohongshu.com/explore');
  }
  function follow() {
    // Restrict lookup to official navigation: a generic "关注" button may follow a stranger.
    const native = findNative('关注', [
      '.channel-container','.channel-scroll-container','.header-container','.side-bar'
    ]);
    if (native) native.click();
    else notify('当前官网没有可用的关注信息流入口');
  }
  function profile() {
    // Do not choose the first arbitrary /user/profile/ URL: it could be another author's page.
    const native = findNative('我', [
      '.side-bar','.side-bar-container','#sidebar','.header-container'
    ]);
    if (native) native.click();
    else officialLogin();
  }
  function messages() {
    const a = nativeLink('/notification') || nativeLink('/message');
    if (a) { a.click(); return; }
    const native = findNative('消息', ['.side-bar','.side-bar-container','body']);
    if (native) native.click();
    else notify('小红书网页版当前未提供可识别的消息入口');
  }

  function onAction(action) {
    switch (action) {
      case 'menu': showDialog('menu'); break;
      case 'search': showDialog('search'); break;
      case 'home': location.assign('https://www.xiaohongshu.com/explore'); break;
      case 'refresh': refresh(); break;
      case 'following': follow(); break;
      case 'back': back(); break;
      case 'profile': profile(); break;
      case 'login': officialLogin(); break;
      case 'resume': restoreRedWeb(); break;
      case 'messages': messages(); break;
      case 'publish':
        location.assign('https://creator.xiaohongshu.com/publish/publish?source=official');
        break;
      case 'disable':
        try { localStorage.setItem(KEY, '1'); } catch (_) {}
        location.reload();
        break;
      default: break;
    }
  }

  // Read only the data already present on the first-party web page to add a profile fallback.
  // Never call a private endpoint or transmit information to Red Web/GitHub Pages.
  function unwrap(v) { return v && (v._value || v.value || v); }
  function findFeedData(noteId) {
    const state = window.__INITIAL_STATE__ || {};
    const lists = [
      unwrap(state.homeFeed && state.homeFeed.feeds),
      unwrap(state.feed && state.feed.feeds)
    ];
    for (const list of lists) {
      if (!Array.isArray(list)) continue;
      const found = list.find(item => item &&
        String(item.id || (item.noteCard && item.noteCard.noteId)) === String(noteId));
      if (found) return found;
    }
    return null;
  }
  function authorFallback(event) {
    if (event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey) return;
    const author = event.target.closest('.note-item .author-wrapper, .red-web-card .author-wrapper');
    if (!author || event.target.closest('a[href],button')) return;
    const card = author.closest('.note-item,.red-web-card');
    const link = card && $('a[href*="/explore/"]', card);
    if (!link) return; // Keep native click behavior if the site changes.
    let noteId;
    try { noteId = new URL(link.href).pathname.split('/')[2]; } catch (_) { return; }
    const item = findFeedData(noteId);
    const person = item && item.noteCard && item.noteCard.user;
    const userId = person && (person.userId || person.userID);
    if (!userId || !/^[a-zA-Z0-9_-]+$/.test(String(userId))) return;
    const url = new URL('/user/profile/' + encodeURIComponent(userId), location.origin);
    if (item.xsecToken) url.searchParams.set('xsec_token', item.xsecToken);
    url.searchParams.set('xsec_source', 'pc_feed');
    event.preventDefault();
    event.stopPropagation();
    location.assign(url.href);
  }

  // Xiaohongshu uses different HTML for desktop explore and the mobile hot-notes page.
  // Use real native note links first, and never infer/forge signed note URLs.
  function noteLinks() {
    return $$('a[href*="/explore/"],a[href*="/discovery/item/"]')
      .filter(a => {
        if (a.closest('#red-web-top,#red-web-bottom,#red-web-debug-panel,#red-web-menu,#red-web-search')) return false;
        try {
          const url = new URL(a.href, location.href);
          return (url.hostname === 'www.xiaohongshu.com' ||
            url.hostname === 'xiaohongshu.com') &&
            /^\/(?:explore|discovery\/item)\/[^/]+/.test(url.pathname);
        } catch (_) { return false; }
      });
  }
  function popularHeading() {
    return $$('h1,h2,h3,h4,div,span,p')
      .find(el => el.childElementCount <= 2 &&
        (el.textContent || '').trim() === '热门笔记' &&
        !el.closest('#red-web-top,#red-web-debug-panel'));
  }
  function selectNoteCards() {
    const links = noteLinks();
    const native = $$('.note-item,[class*="note-card"],[class*="feed-card"]')
      .filter(el => !el.closest('#red-web-debug-panel,#red-web-top,#red-web-bottom') &&
        $('img,video,[style*="background-image"]', el) &&
        (links.some(a => el.contains(a)) || el.matches('.note-item')));
    if (native.length >= 2) return native.filter(el => !native.some(parent =>
      parent !== el && parent.contains(el)));
    const cards = [];
    for (const link of links) {
      let cursor = link, found = link;
      for (let depth = 0; cursor && depth < 6; depth++, cursor = cursor.parentElement) {
        if (!cursor || cursor === document.body) break;
        // Stop at grids and sections with multiple different notes.
        const matching = $$('a[href*="/explore/"],a[href*="/discovery/item/"]', cursor);
        if (matching.length > 2) break;
        if ($('img,video', cursor) && (cursor.textContent || '').trim().length >= 2) {
          found = cursor;
          if (cursor.matches('article,li,section,[class*="card"],[class*="item"]')) break;
        }
      }
      if (!cards.some(card => card === found || card.contains(found))) {
        cards.push(found);
      }
    }
    return cards;
  }
  function findFeedContainer(cards) {
    if (cards.length < 2) return null;
    const buckets = new Map();
    for (const card of cards) {
      const parent = card.parentElement;
      if (!parent) continue;
      if (!buckets.has(parent)) buckets.set(parent, []);
      buckets.get(parent).push(card);
    }
    const best = Array.from(buckets).sort((a,b) => b[1].length - a[1].length)[0];
    if (!best || best[1].length < 2) return null;
    const [parent, members] = best;
    // Don't change site-owned mixed-content sections, navigation, or two-column wrappers.
    const direct = Array.from(parent.children).filter(x => members.includes(x));
    if (direct.length < 2 || direct.length < parent.children.length - 2) return null;
    return parent;
  }
  function markMobilePromo() {
    const heading = popularHeading();
    if (!heading) return;
    if (!heading.classList.contains('red-web-popular-heading')) {
      heading.classList.add('red-web-popular-heading');
      log('DOM', '检测到移动版热门笔记');
    }
    if ($('.red-web-promo-hidden')) return;
    const headingTop = heading.getBoundingClientRect().top;
    if (headingTop < 180) return;
    // Only collapse a full-width hero clearly above "热门笔记", never note cards.
    const likelyBanner = $$('img,video').find(media => {
      if (media.closest('.note-item,.red-web-card,#red-web-debug-panel')) return false;
      const rect = media.getBoundingClientRect();
      return rect.width >= innerWidth * .72 && rect.height >= 145 &&
        rect.top >= 55 && rect.bottom <= headingTop - 8;
    });
    if (!likelyBanner) return;
    let candidate = likelyBanner;
    for (let parent = likelyBanner.parentElement, i = 0; parent && i < 4; i++, parent = parent.parentElement) {
      if (parent === document.body || parent === $('#app')) break;
      const rect = parent.getBoundingClientRect();
      if (rect.width < innerWidth * .7 || rect.height > 560 ||
        rect.bottom > headingTop - 4 || rect.top < 45) break;
      candidate = parent;
    }
    candidate.classList.add('red-web-promo-hidden');
    log('DOM', '已折叠热门笔记上方的大幅媒体横幅');
  }
  function decorateFeed() {
    markMobilePromo();
    const cards = selectNoteCards();
    const feed = findFeedContainer(cards);
    if (feed && feed.dataset.redFeedRoot !== 'true') {
      $$('[data-red-feed-root="true"]').forEach(other => {
        if (other !== feed) {
          delete other.dataset.redFeedRoot;
          other.classList.remove('red-web-mobile-grid');
        }
      });
      feed.dataset.redFeedRoot = 'true';
      if (!cards[0].matches('.note-item')) feed.classList.add('red-web-mobile-grid');
    }
    for (const card of cards) {
      if (card.dataset.redCard === '1') continue;
      card.dataset.redCard = '1';
      if (!card.classList.contains('note-item')) card.classList.add('red-web-card');
      const author = $('.author-wrapper', card);
      if (author) {
        author.style.cursor = 'pointer';
        author.setAttribute('aria-label', '查看作者主页');
      }
    }
    const signature = cards.length + ' card(s), ' + noteLinks().length +
      ' native link(s), heading=' + Boolean(popularHeading());
    if (signature !== lastFeedSignature) {
      lastFeedSignature = signature;
      log('DOM', signature + ', grid=' + Boolean(feed));
    }
  }

  function update() {
    if (!document.body) return;
    if (nativeLoginMode) return;
    const view = pageView();
    if (view !== currentView || location.pathname !== lastPath) {
      currentView = view;
      lastPath = location.pathname;
      document.body.dataset.redView = view;
      log('NAV', '页面类型变更为 ' + view + ', path=' + safeViewPath());
      drawBars(view);
    }
    if (view === 'feed') decorateFeed();
  }

  function scrollTop() {
    const page = $('.feeds-page');
    return Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0,
      page && page.scrollTop || 0);
  }
  function pullIndicator(text, offset) {
    let el = $('#red-web-pull');
    if (!el) {
      el = document.createElement('div');
      el.id = 'red-web-pull';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.transform = 'translate(-50%,' + Math.min(0, -60 + offset) + 'px)';
  }
  function pullReset() {
    pullStart = 0;
    pullDistance = 0;
    const el = $('#red-web-pull');
    if (el) el.style.transform = 'translate(-50%,-60px)';
  }

  function start() {
    if (!document.body) return;
    addCss();
    document.body.classList.add('red-web');
    log('BOOT', 'Red Web v' + VERSION + ' 已启动；路径 ' + safeViewPath());
    debugControl();
    const vp = $('meta[name="viewport"]');
    if (vp) vp.setAttribute('content', 'width=device-width,initial-scale=1,viewport-fit=cover');
    else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width,initial-scale=1,viewport-fit=cover';
      document.head.appendChild(meta);
    }

    document.addEventListener('click', event => {
      const control = event.target.closest('[data-red-action]');
      if (control) {
        event.preventDefault();
        event.stopPropagation();
        log('ACTION', control.dataset.redAction);
        try { onAction(control.dataset.redAction); }
        catch (error) { log('ERROR', '导航动作: ' + (error && error.message)); }
        return;
      }
      authorFallback(event);
    }, true);

    document.addEventListener('touchstart', event => {
      if (pageView() !== 'feed' || scrollTop() > 2 || event.touches.length !== 1 ||
        event.target.closest('#red-web-top,#red-web-bottom,input,textarea,[contenteditable]')) {
        pullStart = 0; return;
      }
      pullStart = event.touches[0].clientY;
      pullDistance = 0;
    }, { passive: true });

    document.addEventListener('touchmove', event => {
      if (!pullStart || pageView() !== 'feed' || scrollTop() > 2) return;
      const distance = event.touches[0].clientY - pullStart;
      if (distance < 0) { pullDistance = 0; return; }
      pullDistance = Math.min(120, distance);
      if (pullDistance > 14) {
        pullIndicator(pullDistance > 85 ? '松开刷新推荐' : '下拉刷新推荐',
          pullDistance * .72);
      }
    }, { passive: true });

    document.addEventListener('touchend', () => {
      const ready = pullStart && pullDistance >= 85;
      pullReset();
      if (ready) refresh();
    }, { passive: true });
    document.addEventListener('touchcancel', pullReset, { passive: true });

    let pending = false;
    const observer = new MutationObserver(() => {
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        try { update(); }
        catch (error) { log('ERROR', 'DOM 更新: ' + (error && error.message)); }
      });
    });
    observer.observe(document.body, { subtree: true, childList: true });
    window.addEventListener('popstate', update);
    timer = setInterval(() => {
      try { update(); }
      catch (error) { log('ERROR', '定时检测: ' + (error && error.message)); }
    }, 1700);
    try { update(); }
    catch (error) { log('ERROR', '首次检测: ' + (error && error.message)); }
    setTimeout(() => {
      if (pageView() !== 'feed') return;
      const count = selectNoteCards().length;
      log('CHECK', '延迟检测：笔记卡片=' + count + '，原生链接=' + noteLinks().length);
      if (!count) notify('未识别到笔记卡片，请点右下角「调试」复制报告');
    }, 9000);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
