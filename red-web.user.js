// ==UserScript==
// @name         Red Web - 小红书移动网页优化
// @namespace    https://github.com/jiojiojackson/red-web
// @version      0.4.2
// @description  小红书手机网页优化：双列笔记、官网登录、评论主页及隐私安全调试面板
// @author       jiojiojackson
// @match        https://www.xiaohongshu.com/*
// @match        https://xiaohongshu.com/*
// @match        https://www.rednote.com/*
// @match        https://rednote.com/*
// @run-at       document-idle
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @inject-into  content
// @connect      www.rednote.com
// @connect      rednote.com
// @connect      www.xiaohongshu.com
// @connect      xiaohongshu.com
// @noframes
// @license      MIT
// @downloadURL  https://raw.githubusercontent.com/jiojiojackson/red-web/main/red-web.user.js
// @updateURL    https://raw.githubusercontent.com/jiojiojackson/red-web/main/red-web.user.js
// ==/UserScript==

(function () {
  'use strict';

  // Only official HTML and native site interactions; no credential capture or private API.
  if (window.__RED_WEB_LOADED__) return;
  window.__RED_WEB_LOADED__ = true;

  const KEY = 'red-web-disabled';
  const VERSION = '0.4.2';
  const DESKTOP_KEY = 'red-web-desktop-mode';
  const DESKTOP_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const mobile = /iPhone|iPod|Android|Mobile/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && /Macintosh|MacIntel/i.test(navigator.userAgent))
    || window.matchMedia('(max-width: 820px)').matches;
  const query = new URLSearchParams(location.search);
  if (query.get('redweb') === 'reset') {
    try { localStorage.removeItem(KEY); } catch (_) {}
    try { sessionStorage.removeItem(DESKTOP_KEY); } catch (_) {}
    query.delete('redweb');
    history.replaceState(history.state, '', location.pathname +
      (query.size ? '?' + query.toString() : '') + location.hash);
  }
  let disabled = false;
  try { disabled = localStorage.getItem(KEY) === '1'; } catch (_) {}
  if (!mobile || disabled) return;

  // Keep navigation on the current official site; the two domains have separate sessions.
  function homeUrl() {
    const path = /^(www\.)?rednote\.com$/.test(location.hostname) ? '/' : '/explore';
    return new URL(path, location.origin).href;
  }

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
#red-web-top .red-web-tabs { display: flex; gap: 20px; height: 100%; align-items: center; }
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
#red-web-top .red-web-tools { display: flex; align-items: center; gap: 2px; }
#red-web-top .red-web-auth { min-width: 44px; min-height: 44px; font-size: 14px;
  color: var(--red-web-accent); font-weight: 600; }
#red-web-top button:disabled { opacity: .45; cursor: wait; }
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
body.red-web[data-red-login-open="true"] #red-web-top,
body.red-web[data-red-login-open="true"] #red-web-bottom,
body.red-web[data-red-login-open="true"] #red-web-debug-toggle { display: none !important; }
/* Keep the official login dialog above our chrome and inside a phone viewport. */
body.red-web .login-modal { z-index: 2147483500 !important; }
body.red-web .login-container {
  max-width: calc(100vw - 24px) !important; max-height: calc(100dvh - 24px) !important;
  overflow: auto !important; box-sizing: border-box !important;
}
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
  position: fixed; z-index: 2147482001; pointer-events: none; visibility: hidden;
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
body.red-web[data-red-view="feed"] .red-web-popular-heading { color: #2a2a2a !important; }
#red-web-top[hidden], #red-web-bottom[hidden] { display: none !important; }
#red-web-login-guide {
  position: fixed !important; inset: 0; background: #0008; z-index: 2147483800;
  display: flex; align-items: center; justify-content: center; box-sizing: border-box;
  padding: 18px;
}
#red-web-login-guide > .red-web-login-card {
  width: min(100%, 440px); max-height: 80dvh; overflow: auto; border-radius: 16px;
  background: white; color: #222; box-sizing: border-box; padding: 22px;
  box-shadow: 0 12px 36px #0003; font: 14px/1.7 -apple-system,BlinkMacSystemFont,sans-serif;
}
#red-web-login-guide h3 { font-size: 18px; margin: 0 0 9px; }
#red-web-login-guide p { margin: 8px 0; color: #555; }
#red-web-login-guide .red-web-login-buttons { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
#red-web-login-guide button { background: #f7f7f7; color: #222; padding: 10px 13px; border-radius: 9px;
  border: 1px solid #ddd; font: inherit; }
#red-web-login-guide button.red-web-login-primary { background: #ff2442; color: #fff; border-color: #ff2442; }
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
  let bodyObserver;
  let runtimeController;
  let bootBody;
  let runtimeGeneration = 0;
  let feedCheckTimeout;
  let desktopLoading = false;
  let desktopInstalled = false;
  let pendingDesktopLogin = false;
  let loginOpening = false;
  let loginWaitTimeout;
  let toastTimeout;
  let pullStart = null;
  let pullX = 0;
  let pullTarget = null;
  let pullDistance = 0;
  let authState = '';
  let refreshInProgress = false;
  let refreshBefore = '';
  let refreshTimeout;
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
    if (/^\/discovery\/item\/[^/]+/.test(path)) return '/discovery/item/[note]';
    if (/^\/user\/profile\/[^/]+/.test(path)) return '/user/profile/[user]';
    return path.slice(0, 64);
  }
  function loginElements() {
    return $$('button,a,[role="button"],.login-btn,.login-button,.login-entry')
      .filter(el => !el.closest('[id^="red-web-"],.login-modal,.login-container')
        && (el.id === 'login-btn' || el.classList?.contains('login-btn') ||
          /^(登录|立即登录|注册\s*\/\s*登录|登录\s*\/\s*注册|登录账号|Log in|Sign in|ログイン|サインイン|ログイン[\/・／]新規登録|新規登録[\/・／]ログイン)$/i
            .test((el.innerText || el.textContent || el.getAttribute?.('aria-label') || '').trim())));
  }
  function snapshot() {
    const cards = selectNoteCards();
    const heading = popularHeading();
    const anchors = noteLinks();
    const root = $('[data-red-feed-root="true"]');
    const visual = visualNoteCandidates();
    const allMedia = $$('img,video,[style*="background-image"]');
    const images = allMedia.length;
    const width = window.innerWidth || 402;
    const geometry = allMedia.map(el => {
      const rect = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), width: Math.round(rect.width),
        height: Math.round(rect.height), y: Math.round(rect.top) };
    }).filter(m => m.width >= width * .18 && m.height >= 65).slice(0, 8)
      .map(m => m.tag + ':' + m.width + 'x' + m.height + '@' + m.y).join(' / ');
    const lines = [
      'Red Web ' + VERSION,
      '页面: ' + safeViewPath() + ' | 视图: ' + pageView(),
      '屏幕: ' + window.innerWidth + 'x' + window.innerHeight,
      '加载: ' + document.readyState + ' | 触屏: ' + ('ontouchstart' in window),
      '笔记链接: ' + anchors.length + ' | note-item: ' + $$('.note-item').length,
      '识别卡片: ' + cards.length + ' | 视觉候选: ' + visual.length +
        ' | 媒体元素: ' + images,
      '热门笔记标题: ' + Boolean(heading) + ' | 图片/无链接也可识别',
      '媒体尺寸样本(不含图片URL): ' + (geometry || '无'),
      '布局: ' + (root ? root.tagName.toLowerCase() + '.' +
        Array.from(root.classList).slice(0,3).join('.') :
        (heading && cards.length ? '移动版原生布局（保留）' : '未识别')),
      '官方登录入口: ' + loginElements().length,
      '电脑版: ' + desktopDocument() + ' | 页面载入中: ' + desktopLoading +
        ' | 登录准备中: ' + (pendingDesktopLogin || loginOpening),
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
        '<button type="button" data-rw-debug="resume">恢复脚本</button>' +
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
        if (action === 'resume') restoreRedWeb();
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
    if (/^\/(?:explore|discovery\/item)\/[^/]+/.test(path)) return 'detail';
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
        '<div class="red-web-tools">' +
        '<button type="button" class="red-web-auth" data-red-action="' +
          (authState === 'profile' ? 'profile' : 'login') + '">' +
          (authState === 'profile' ? '我' : '登录') + '</button>' +
        button(view === 'feed' ? 'refresh' : 'search', view === 'feed' ? '刷新推荐' : '搜索',
          view === 'feed' ? 'refresh' : 'search', 'red-web-icon') + '</div>';
    }
    bottom.innerHTML =
      button('home', '首页', 'home', 'red-web-nav' + (view === 'feed' ? ' active' : '')) +
      button('search', '搜索', 'search', 'red-web-nav' + (view === 'search' ? ' active' : '')) +
      '<button type="button" class="red-web-plus" data-red-action="publish" aria-label="发布">+</button>' +
      button('messages', '消息', 'chat', 'red-web-nav') +
      button(authState === 'profile' ? 'profile' : 'login', authState === 'profile' ? '我' : '登录',
        'user', 'red-web-nav' + (view === 'profile' ? ' active' : ''));
    if (!top.isConnected) document.body.appendChild(top);
    if (!bottom.isConnected) document.body.appendChild(bottom);
    setRefreshing(refreshInProgress);
    setLoginBusy();
  }

  function findNative(label, scopes = []) {
    const targets = scopes.length ? scopes.flatMap(s => $$(s)) : [document.body];
    for (const root of targets) {
      const els = $$('a,button,[role="button"],.channel,.side-bar-item,.bottom-channel', root);
      const match = els.find(el => !el.closest('[id^="red-web-"]') &&
        el.textContent.trim() === label);
      if (match) return match;
    }
    return null;
  }
  function nativeLink(fragment) {
    return $$('a[href]').find(a => a.href.includes(fragment) &&
      !a.closest('.note-item,.note-detail-mask,#red-web-top,#red-web-bottom'));
  }
  function nativeProfileEntry() {
    // Only account navigation can identify "Me"; card authors are not the current user.
    return $$('.side-bar a[href],.side-bar-container a[href],#sidebar a[href],.sidebar a[href],.header-container a[href]')
      .find(a => {
        try {
          const url = new URL(a.href, location.href);
          return url.origin === location.origin && /^\/user\/profile\/[^/]+/.test(url.pathname)
            && !a.closest('.note-item,.red-web-card');
        } catch (_) { return false; }
      });
  }
  function loginDialog() {
    return $$('.login-modal,.login-container').find(isVisible);
  }
  function loggedIn() {
    return Boolean($('#global[data-logged="1"]') || nativeProfileEntry());
  }
  function nativeLoginEntry() {
    const candidates = loginElements();
    const actionable = candidates.filter(el => el.matches('button,a,[role="button"]'));
    return actionable.find(isVisible) || actionable[0] || candidates.find(isVisible) || candidates[0];
  }
  function setLoginBusy() {
    $$('[data-red-action="login"]').forEach(el => {
      el.disabled = desktopLoading || pendingDesktopLogin || loginOpening;
      el.setAttribute('aria-busy', String(el.disabled));
    });
  }
  function finishLoginWait() {
    clearTimeout(loginWaitTimeout);
    pendingDesktopLogin = false;
    loginOpening = false;
    setLoginBusy();
  }
  function syncPendingLogin() {
    if (!pendingDesktopLogin && !loginOpening) return;
    if (loginDialog() || loggedIn()) { finishLoginWait(); return; }
    if (!pendingDesktopLogin) return;
    const entry = nativeLoginEntry();
    if (!entry) return; // Wait for the official app to finish rendering, without replacing it.
    pendingDesktopLogin = false;
    loginOpening = true;
    try {
      entry.click();
      log('AUTH', '已触发官网原生登录弹窗');
      if (loginDialog() || loggedIn()) finishLoginWait();
    } catch (error) {
      finishLoginWait();
      log('ERROR', '原生登录: ' + (error && error.message));
      notify('官网登录入口暂不可用，请稍后重试');
    }
  }
  function waitForNativeLogin() {
    if (pendingDesktopLogin || loginOpening) return;
    pendingDesktopLogin = true;
    setLoginBusy();
    clearTimeout(loginWaitTimeout);
    loginWaitTimeout = setTimeout(() => {
      const ready = Boolean(loginDialog() || loggedIn());
      finishLoginWait();
      if (!ready) {
        log('AUTH', '官网登录入口尚未就绪，保留当前电脑版页面');
        notify('官网登录入口尚未准备好，请稍后点击登录重试');
      }
    }, 15000);
    syncPendingLogin();
  }
  function desktopDocument() {
    return desktopInstalled || Boolean($('script[src*="/xhs-pc-web/"]'));
  }
  function desktopHtml(response, url) {
    const final = new URL(response.finalUrl || response.responseURL || url, url);
    if (final.origin !== new URL(url).origin || final.protocol !== 'https:') {
      throw Error('电脑版页面跳转到了不同站点，已停止加载');
    }
    if (response.status !== 200) throw Error('官网返回状态 ' + response.status);
    const html = response.responseText;
    if (typeof html !== 'string' || !new DOMParser().parseFromString(html, 'text/html')
      .querySelector('script[src*="/xhs-pc-web/"]')) {
      throw Error('扩展未获取到电脑版页面；请更新 Userscripts 或使用浏览器桌面网站模式');
    }
    return html;
  }
  function requestDesktopPage(url) {
    return new Promise((resolve, reject) => {
      const details = {
        method: 'GET', url, responseType: 'text', timeout: 15000,
        headers: { 'User-Agent': DESKTOP_UA, Accept: 'text/html' },
        onload: resolve,
        onerror: () => reject(Error('电脑版页面请求失败')),
        ontimeout: () => reject(Error('电脑版页面请求超时')),
        onabort: () => reject(Error('电脑版页面请求已取消'))
      };
      try {
        if (typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function') {
          const task = GM.xmlHttpRequest(details);
          if (task && typeof task.then === 'function') task.then(resolve, reject);
        } else if (typeof GM_xmlhttpRequest === 'function') GM_xmlhttpRequest(details);
        else reject(Error('请重新安装 v0.4.2 并加载脚本，以启用官网页面读取接口'));
      } catch (error) { reject(error); }
    });
  }
  async function loadDesktopLogin(openLogin = true) {
    if (desktopLoading) return;
    if (desktopDocument()) {
      if (openLogin) waitForNativeLogin();
      return;
    }
    desktopLoading = true;
    setLoginBusy();
    notify(openLogin ? '正在打开官网电脑版登录…' : '正在恢复电脑版页面…');
    log('AUTH', '读取当前官网电脑版页面');
    try {
      const url = openLogin ? homeUrl() : location.href;
      const html = desktopHtml(await requestDesktopPage(url), url);
      // Keep the same origin and URL. Official scripts own all credentials and requests.
      // Do not move a login form or cookies from the desktop browser to this device.
      try { sessionStorage.setItem(DESKTOP_KEY, '1'); } catch (_) {}
      stopRuntime();
      clearTimeout(toastTimeout);
      clearTimeout(refreshTimeout);
      refreshInProgress = false;
      currentView = ''; lastPath = ''; authState = '';
      nativeLoginMode = false;
      finishLoginWait();
      window.stop();
      document.open();
      document.write(html);
      document.close();
      desktopInstalled = true;
      desktopLoading = false;
      const resume = () => {
        start();
        if (openLogin) waitForNativeLogin();
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resume, { once: true });
      } else resume();
    } catch (error) {
      desktopLoading = false;
      finishLoginWait();
      try { sessionStorage.removeItem(DESKTOP_KEY); } catch (_) {}
      if (!$('#red-web-top')) { bootBody = null; start(); }
      log('ERROR', '电脑版登录: ' + (error && error.message));
      notify(error && error.message || '电脑版登录暂不可用');
    }
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
  function showLoginGuide() {
    if ($('#red-web-login-guide')) return;
    const overlay = document.createElement('div');
    overlay.id = 'red-web-login-guide';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', '小红书官网登录说明');
    overlay.innerHTML = '<div class="red-web-login-card">' +
      '<h3>当前手机页面没有登录入口</h3>' +
      '<p>Red Web 已检查该页面，未找到小红书官方登录按钮。无法由脚本自行创建账号登录或绕过官网限制。</p>' +
      '<p><b>建议：</b>在 Safari 地址栏菜单选择「请求桌面网站」，然后访问官方「发现」页面。如果出现官网登录按钮，请使用官方短信验证或扫码。</p>' +
      '<p>「热门笔记」手机落地页可能只提供固定内容，没有账号推荐流。也可使用 rednote 官方站；两个域名和不同设备的登录状态需要分别确认。</p>' +
      '<p>请注意：切换网站显示方式需要您在 Safari 中手动操作，脚本不能直接修改 Safari 的用户代理设置。</p>' +
      '<div class="red-web-login-buttons">' +
      '<button type="button" data-rw-login="close">返回</button>' +
      '<button type="button" data-rw-login="original">查看官网原版</button>' +
      '<button type="button" data-rw-login="rednote">打开 rednote 官网</button>' +
      '<button type="button" class="red-web-login-primary" data-rw-login="explore">打开官方发现页</button>' +
      '</div></div>';
    overlay.addEventListener('click', event => {
      if (event.target === overlay) { overlay.remove(); return; }
      const button = event.target.closest('[data-rw-login]');
      if (!button) return;
      const action = button.dataset.rwLogin;
      overlay.remove();
      if (action === 'original') switchToOriginal();
      if (action === 'explore') location.assign(homeUrl());
      if (action === 'rednote') location.assign('https://www.rednote.com/');
    });
    document.body.appendChild(overlay);
  }

  function switchToOriginal() {
    nativeLoginMode = true;
    document.body.classList.remove('red-web');
    document.body.dataset.redLoginOpen = 'true';
    const top = $('#red-web-top');
    const bottom = $('#red-web-bottom');
    if (top) top.hidden = true;
    if (bottom) bottom.hidden = true;
    $('#red-web-menu')?.remove();
    log('AUTH', '进入官网原版模式，需用户手动完成登录');
    notify('已切换原版；登录后点调试窗口的「恢复脚本」');
  }

  function officialLogin() {
    $('#red-web-menu')?.remove();
    $('#red-web-login-guide')?.remove();
    debugVisible = false;
    renderDebug();
    if (nativeLoginMode) restoreRedWeb();
    if (desktopLoading || pendingDesktopLogin || loginOpening) return;
    if (loginDialog()) { update(); return; }
    const account = nativeProfileEntry();
    if (account) { account.click(); return; }
    if (loggedIn()) { notify('已登录，正在同步官网账号入口'); update(); return; }
    log('AUTH', '官网登录检测：原生入口数=' + loginElements().length);
    if (desktopDocument() || nativeLoginEntry()) {
      waitForNativeLogin();
    } else {
      log('AUTH', '当前手机页无原生入口，直接加载官网电脑版登录');
      loadDesktopLogin();
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
        if (keyword) location.assign(location.origin + '/search_result?keyword=' +
          encodeURIComponent(keyword) + '&source=web_explore_feed');
      });
      $('#red-web-search input').focus();
    }
  }

  function feedFingerprint() {
    return Array.from(new Set(noteLinks().map(a => new URL(a.href, location.href).pathname)))
      .sort().join('|');
  }
  function setRefreshing(active) {
    $$('[data-red-action="refresh"]').forEach(el => {
      el.disabled = active;
      el.setAttribute('aria-busy', String(active));
    });
  }
  function finishRefresh(message) {
    refreshInProgress = false;
    clearTimeout(refreshTimeout);
    setRefreshing(false);
    if (message) notify(message);
  }
  function nativeRefreshControl() {
    // The official floating refresh control triggers a new feed request, unlike reload().
    return [...$$('.reload .btn-wrapper'), ...$$('.reload')].find(el =>
      !el.closest('[id^="red-web-"],.note-item,.red-web-card,.note-detail-mask'));
  }
  function refresh() {
    if (refreshInProgress || nativeLoginMode || loginDialog()) return;
    if (pageView() !== 'feed') {
      location.assign(homeUrl());
      return;
    }
    const recommend = $('#homefeed_recommend');
    const control = recommend && !recommend.classList.contains('active')
      ? recommend : nativeRefreshControl();
    if (!control) {
      if (popularHeading() && !noteLinks().length) {
        notify('当前是热门笔记展示页，请切换官网桌面网站使用推荐刷新');
        showLoginGuide();
      } else {
        notify('未找到官网刷新控件，正在打开官方推荐页');
        const url = new URL(homeUrl());
        url.searchParams.set('channel_id', 'homefeed_recommend');
        location.assign(url.href);
      }
      return;
    }
    refreshBefore = feedFingerprint();
    refreshInProgress = true;
    setRefreshing(true);
    notify('正在刷新推荐…');
    refreshTimeout = setTimeout(() => finishRefresh('官网暂未返回新的推荐，请稍后重试或确认已登录'), 12000);
    try {
      window.scrollTo(0, 0);
      $$('.feeds-page').forEach(el => { el.scrollTop = 0; });
      control.click();
      log('FEED', '已触发官网原生推荐刷新');
    } catch (error) {
      finishRefresh('官网刷新控件暂不可用，请稍后重试');
      log('ERROR', '原生刷新: ' + (error && error.message));
    }
  }
  function back() {
    const close = $('.note-detail-mask .close-circle') ||
      $('.note-detail-mask .close-icon') || $('.note-detail-mask .close-btn');
    if (close) close.click();
    else if (history.length > 1) history.back();
    else location.assign(homeUrl());
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
    const native = nativeProfileEntry() || findNative('我', [
      '.side-bar','.side-bar-container','#sidebar','.header-container'
    ]);
    if (native) native.click();
    else officialLogin();
  }
  function messages() {
    const a = nativeLink('/notification') || nativeLink('/message');
    if (a) { a.click(); return; }
    const scopes = ['.side-bar','.side-bar-container','#sidebar'];
    const native = findNative('消息', scopes) || findNative('通知', scopes) ||
      findNative('Notifications', scopes);
    if (native) native.click();
    else notify('小红书网页版当前未提供可识别的消息入口');
  }
  function goHome() {
    if (pageView() === 'feed') { refresh(); return; }
    const home = new URL(homeUrl());
    const entry = $$('.side-bar a[href],.side-bar-container a[href],#sidebar a[href],.header-container a[href]')
      .find(a => {
        try {
          const url = new URL(a.href, location.href);
          return url.origin === home.origin && url.pathname === home.pathname &&
            !a.closest('[id^="red-web-"]');
        } catch (_) { return false; }
      });
    if (entry) { entry.click(); return; }
    location.assign(home.href);
  }

  function onAction(action) {
    switch (action) {
      case 'menu': showDialog('menu'); break;
      case 'search': showDialog('search'); break;
      case 'home': goHome(); break;
      case 'refresh': refresh(); break;
      case 'following': follow(); break;
      case 'back': back(); break;
      case 'profile': profile(); break;
      case 'login': officialLogin(); break;
      case 'resume': restoreRedWeb(); break;
      case 'messages': messages(); break;
      case 'publish':
        {
          const native = $$('.side-bar a[href]').find(a =>
            /^https:\/\/creator\.(xiaohongshu|rednote)\.com\//.test(a.href));
          if (native) native.click();
          else notify('当前官网没有可用的发布入口');
        }
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
          return url.protocol === 'https:' && /^(www\.)?(xiaohongshu|rednote)\.com$/.test(url.hostname) &&
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
  // H5 mobile pages may render cards as clickable divs without any <a> href.
  // Detect visually plausible note media without taking over the site's click handlers.
  function visualNoteCandidates() {
    const heading = popularHeading();
    if (!heading || !heading.isConnected) return [];
    const headingBox = heading.getBoundingClientRect();
    const screenWidth = window.innerWidth || document.documentElement.clientWidth || 402;
    const media = $$('img,video,[style*="background-image"]');
    const found = [];
    for (const element of media) {
      if (element.closest('#red-web-top,#red-web-bottom,#red-web-debug-panel,#red-web-login-guide,#red-web-menu,.red-web-promo-hidden')) continue;
      const r = element.getBoundingClientRect();
      if (r.width < screenWidth * .22 || r.width > screenWidth * .70 ||
          r.height < 75 || r.height > 1100 ||
          r.top < headingBox.bottom - 8) continue;
      let candidate = element;
      let ancestor = element.parentElement;
      for (let i = 0; ancestor && i < 6; i++, ancestor = ancestor.parentElement) {
        if (ancestor === document.body || ancestor === $('#app')) break;
        const box = ancestor.getBoundingClientRect();
        if (box.width > screenWidth * .72 ||
            box.width < r.width - 12 || box.height > 1250) break;
        candidate = ancestor;
        if (ancestor.matches('article,li,[class*="note"],[class*="card"],[class*="item"]') &&
            ancestor.querySelector('img,video')) break;
      }
      // Parent may be a two-column grid; never select the full-width section.
      const box = candidate.getBoundingClientRect();
      if (box.width > screenWidth * .72) continue;
      if (found.some(other => other === candidate || other.contains(candidate))) continue;
      for (let i = found.length - 1; i >= 0; i--) {
        if (candidate.contains(found[i])) found.splice(i, 1);
      }
      found.push(candidate);
      if (found.length >= 80) break;
    }
    return found;
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
    // Fall back to geometry for the H5 mobile "热门笔记" cards with no anchors.
    if (cards.length < 2) return visualNoteCandidates();
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
    const likelyBanner = $$('img,video,[style*="background-image"]').find(media => {
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
    // The H5 home is already a two-column grid. Reflow ONLY desktop note-item
    // containers; forcing a second grid onto mobile cards breaks their layout.
    const desktopCards = cards.filter(card => card.matches('.note-item'));
    const feed = desktopCards.length >= 2 ? findFeedContainer(desktopCards) : null;
    if (feed && feed.dataset.redFeedRoot !== 'true') {
      $$('[data-red-feed-root="true"]').forEach(other => {
        if (other !== feed) {
          delete other.dataset.redFeedRoot;
          other.classList.remove('red-web-mobile-grid');
        }
      });
      feed.dataset.redFeedRoot = 'true';
      feed.classList.remove('red-web-mobile-grid');
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
      ' native link(s), heading=' + Boolean(popularHeading()) +
      ', mobile-visual=' + visualNoteCandidates().length;
    if (signature !== lastFeedSignature) {
      lastFeedSignature = signature;
      log('DOM', signature + ', grid=' + Boolean(feed));
    }
  }

  function update() {
    if (!document.body) return;
    if (nativeLoginMode) return;
    const loginOpen = Boolean(loginDialog());
    const nextAuth = loggedIn() ? 'profile' : 'login';
    document.body.dataset.redLoginOpen = String(loginOpen);
    syncPendingLogin();
    if (refreshInProgress) {
      const fingerprint = feedFingerprint();
      if (loginOpen) finishRefresh('请先完成官网登录，再刷新推荐');
      else if (fingerprint && fingerprint.split('|').some(id => !refreshBefore.split('|').includes(id))) {
        finishRefresh('推荐已更新');
      }
    }
    const view = pageView();
    if (view !== currentView || location.pathname !== lastPath || nextAuth !== authState) {
      authState = nextAuth;
      currentView = view;
      lastPath = location.pathname;
      document.body.dataset.redView = view;
      log('NAV', '页面类型变更为 ' + view + ', path=' + safeViewPath());
      drawBars(view);
    }
    if (view === 'feed') decorateFeed();
  }

  function scrollTop(target) {
    let top = Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0,
      document.scrollingElement && document.scrollingElement.scrollTop || 0);
    for (let el = target; el && el !== document; el = el.parentElement) {
      if (el.scrollHeight > el.clientHeight && /auto|scroll/.test(getComputedStyle(el).overflowY)) {
        top = Math.max(top, el.scrollTop || 0);
      }
    }
    return top;
  }
  function pullIndicator(text, offset) {
    let el = $('#red-web-pull');
    if (!el) {
      el = document.createElement('div');
      el.id = 'red-web-pull';
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.style.visibility = 'visible';
    el.style.transform = 'translate(-50%,' + Math.min(0, -60 + offset) + 'px)';
  }
  function pullReset() {
    pullStart = null;
    pullTarget = null;
    pullDistance = 0;
    const el = $('#red-web-pull');
    if (el) {
      el.style.transform = 'translate(-50%,-60px)';
      el.style.visibility = 'hidden';
    }
  }

  function stopRuntime() {
    if (runtimeController) runtimeController.abort();
    if (bodyObserver) bodyObserver.disconnect();
    clearInterval(timer);
    clearTimeout(feedCheckTimeout);
    bootBody = null;
    runtimeGeneration++;
  }
  function start() {
    if (!document.body || bootBody === document.body) return;
    stopRuntime();
    bootBody = document.body;
    runtimeController = new AbortController();
    const signal = runtimeController.signal;
    const generation = runtimeGeneration;
    let preferDesktop = false;
    try { preferDesktop = sessionStorage.getItem(DESKTOP_KEY) === '1'; } catch (_) {}
    if (preferDesktop && !desktopDocument()) { addCss(); loadDesktopLogin(false); return; }
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
    }, { capture: true, signal });

    document.addEventListener('touchstart', event => {
      if (nativeLoginMode || refreshInProgress || loginDialog() || pageView() !== 'feed' ||
        scrollTop(event.target) > 2 || event.touches.length !== 1 ||
        event.target.closest('[id^="red-web-"],.note-detail-mask,input,textarea,[contenteditable]')) {
        pullReset(); return;
      }
      pullStart = event.touches[0].clientY;
      pullX = event.touches[0].clientX;
      pullTarget = event.target;
      pullDistance = 0;
    }, { passive: true, signal });

    document.addEventListener('touchmove', event => {
      if (pullStart === null) return;
      if (event.touches.length !== 1 || pageView() !== 'feed' || scrollTop(pullTarget) > 2) {
        pullReset(); return;
      }
      const distance = event.touches[0].clientY - pullStart;
      if (Math.abs(event.touches[0].clientX - pullX) > Math.abs(distance)) {
        pullReset(); return;
      }
      if (distance < 0) { pullDistance = 0; return; }
      pullDistance = Math.min(120, distance);
      if (pullDistance > 14) {
        if (event.cancelable) event.preventDefault();
        pullIndicator(pullDistance >= 85 ? '松开刷新推荐' : '下拉刷新推荐',
          pullDistance * .72);
      }
    }, { passive: false, signal });

    document.addEventListener('touchend', () => {
      const ready = pullStart !== null && pullDistance >= 85;
      pullReset();
      if (ready) refresh();
    }, { passive: true, signal });
    document.addEventListener('touchcancel', pullReset, { passive: true, signal });

    let pending = false;
    bodyObserver = new MutationObserver(() => {
      if (pending || generation !== runtimeGeneration) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        if (generation !== runtimeGeneration) return;
        try { update(); }
        catch (error) { log('ERROR', 'DOM 更新: ' + (error && error.message)); }
      });
    });
    bodyObserver.observe(document.body, {
      subtree: true, childList: true, attributes: true,
      attributeFilter: ['class', 'style', 'data-logged']
    });
    window.addEventListener('popstate', update, { signal });
    timer = setInterval(() => {
      try { update(); }
      catch (error) { log('ERROR', '定时检测: ' + (error && error.message)); }
    }, 1700);
    try { update(); }
    catch (error) { log('ERROR', '首次检测: ' + (error && error.message)); }
    feedCheckTimeout = setTimeout(() => {
      if (generation !== runtimeGeneration || pageView() !== 'feed') return;
      const count = selectNoteCards().length;
      log('CHECK', '延迟检测：笔记卡片=' + count + '，原生链接=' + noteLinks().length);
      if (!count) notify('未识别到笔记卡片，请点右下角「调试」复制报告');
    }, 9000);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
