// ==UserScript==
// @name         Red Web - 小红书移动网页优化
// @namespace    https://github.com/jiojiojackson/red-web
// @version      0.1.2
// @description  为小红书官网提供接近 App 的手机布局：双列笔记、下拉刷新、作者主页及原生评论
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
@media (min-width: 821px) {
  #red-web-top, #red-web-bottom, #red-web-pull { display: none !important; }
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
  function officialLogin() {
    const btn = findNative('登录', ['.header-container','.side-bar','body']);
    if (btn) btn.click();
    else location.assign('https://www.xiaohongshu.com/login?redirectPath=%2Fexplore');
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
    const author = event.target.closest('.note-item .author-wrapper');
    if (!author || event.target.closest('a[href],button')) return;
    const card = author.closest('.note-item');
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

  function findFeedContainer(card) {
    let current = card && card.parentElement;
    for (let i = 0; current && i < 5; i++, current = current.parentElement) {
      if ($$('.note-item', current).length >= 3 &&
        Array.from(current.children).filter(c => c.matches && c.matches('.note-item')).length >= 2) {
        return current;
      }
    }
    return null;
  }
  function decorateFeed() {
    const cards = $$('.note-item');
    if (!cards.length) return;
    const feed = findFeedContainer(cards[0]);
    if (!feed) return;
    if (feed.dataset.redFeedRoot !== 'true') {
      $$('[data-red-feed-root="true"]').forEach(other => {
        if (other !== feed) delete other.dataset.redFeedRoot;
      });
      feed.dataset.redFeedRoot = 'true';
    }
    cards.forEach(card => {
      if (card.dataset.redCard === '1') return;
      card.dataset.redCard = '1';
      const author = $('.author-wrapper', card);
      if (author) {
        author.style.cursor = 'pointer';
        author.setAttribute('aria-label', '查看作者主页');
      }
    });
  }

  function update() {
    if (!document.body) return;
    const view = pageView();
    if (view !== currentView || location.pathname !== lastPath) {
      currentView = view;
      lastPath = location.pathname;
      document.body.dataset.redView = view;
      drawBars(view);
    }
    if (view === 'feed' || view === 'profile' || view === 'search') decorateFeed();
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
        onAction(control.dataset.redAction);
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
      requestAnimationFrame(() => { pending = false; update(); });
    });
    observer.observe(document.body, { subtree: true, childList: true });
    window.addEventListener('popstate', update);
    timer = setInterval(update, 1100);
    update();
    setTimeout(() => {
      if (pageView() === 'feed' && !$$('.note-item').length)
        notify('推荐内容未出现：请先在小红书官网登录，必要时在 Safari 请求桌面网站');
    }, 9000);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
