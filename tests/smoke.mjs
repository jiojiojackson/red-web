import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../red-web.user.js', import.meta.url), 'utf8');

test('script syntax and version', () => {
  assert.doesNotThrow(() => new Function(source));
  assert.equal(source.match(/@version\s+(\S+)/)[1], '0.4.3');
});

test('login never uses obsolete fixed URL', () => {
  assert.doesNotMatch(source, /xiaohongshu\.com\/login\?redirectPath/);
  assert.match(source, /function officialLogin\(\)/);
  assert.match(source, /entry\.click\(\)/);
});

test('debugging and error collection are available', () => {
  for (const item of ['red-web-debug-toggle', 'red-web-debug-panel',
    'data-rw-debug="copy"', 'data-rw-debug="login"',
    'data-rw-debug="resume"', "'unhandledrejection'", "'error'"]) {
    assert.ok(source.includes(item), 'missing: ' + item);
  }
});

test('mobile note selectors accept official sites and reject lookalike domains', () => {
  const start = source.indexOf('  function noteLinks()');
  const end = source.indexOf('  function findFeedContainer(cards)', start);
  assert.ok(start > 0 && end > start);
  const methods = source.slice(start, end);
  const a = { href: 'https://www.xiaohongshu.com/explore/abc', closest: () => null };
  const b = { href: 'https://www.xiaohongshu.com/discovery/item/def', closest: () => null };
  const other = { href: 'https://other.example/explore/xyz', closest: () => null };
  const rednote = { href: 'https://www.rednote.com/discovery/item/ghi', closest: () => null };
  const spoof = { href: 'https://rednote.com.attacker.example/explore/xyz', closest: () => null };
  const heading = { childElementCount: 0, textContent: '热门笔记', closest: () => null };
  const card = link => ({
    closest: () => null,
    contains: candidate => candidate === link,
    matches: selector => selector === '.note-item'
  });
  const cards = [card(a), card(b)];
  const selectAll = selector => {
    if (selector.startsWith('a[href*=')) return [a, b, other, rednote, spoof];
    if (selector.startsWith('h1,h2')) return [heading];
    if (selector.startsWith('.note-item')) return cards;
    return [];
  };
  const selectOne = (selector, root) =>
    root && cards.includes(root) && selector.includes('img,video')
      ? { tagName: 'IMG' } : null;
  const create = new Function('$', '$$', 'document', 'location',
    methods + '\nreturn { noteLinks, popularHeading, selectNoteCards };');
  const fns = create(selectOne, selectAll, {}, {
    href: 'https://www.xiaohongshu.com/explore'
  });
  assert.equal(fns.noteLinks().length, 3);
  assert.equal(fns.popularHeading(), heading);
  assert.equal(fns.selectNoteCards().length, 2);
});

test('login button selector excludes unrelated controls', () => {
  const start = source.indexOf('  function loginElements()');
  const end = source.indexOf('  function snapshot()', start);
  assert.ok(start > 0 && end > start);
  const login = { textContent: '登录', closest: () => null };
  const other = { textContent: '关注', closest: () => null };
  const method = source.slice(start, end);
  const factory = new Function('$$', method + '\nreturn loginElements;');
  assert.deepEqual(factory(() => [login, other])(), [login]);
});

test('H5 home recognizes visual two-column cards without any note links', () => {
  const start = source.indexOf('  function noteLinks()');
  const end = source.indexOf('  function findFeedContainer(cards)', start);
  assert.ok(start > 0 && end > start);
  const methods = source.slice(start, end);
  const body = {};
  const heading = {
    isConnected: true, textContent: '热门笔记', childElementCount: 0,
    closest: () => null,
    getBoundingClientRect: () => ({ top: 160, bottom: 192 })
  };
  function makeCard(x, y) {
    const wrapper = {
      parentElement: body,
      getBoundingClientRect: () => ({ width: 191, height: 350, top: y - 8 }),
      matches: () => true,
      contains: node => node === wrapper || node === image,
      querySelector: () => image
    };
    const image = {
      parentElement: wrapper,
      closest: () => null,
      getBoundingClientRect: () => ({ left: x, top: y, width: 185, height: 270 })
    };
    return { image, wrapper };
  }
  const left = makeCard(8, 245), right = makeCard(208, 252);
  const media = [left.image, right.image];
  const all = selector => {
    if (selector.startsWith('h1,h2')) return [heading];
    if (selector.startsWith('img,video')) return media;
    return [];
  };
  const fns = new Function('$', '$$', 'document', 'location', 'window',
    methods + '\nreturn { noteLinks, selectNoteCards, visualNoteCandidates };'
  )(() => null, all, { body, documentElement: { clientWidth: 402 } },
    { href: 'https://www.xiaohongshu.com/' }, { innerWidth: 402 });
  assert.equal(fns.noteLinks().length, 0);
  assert.equal(fns.visualNoteCandidates().length, 2);
  assert.equal(fns.selectNoteCards().length, 2);
  assert.ok(source.includes('const desktopCards = cards.filter'));
});

test('login without a native entry loads the official desktop page', () => {
  assert.match(source, /function showLoginGuide\(\)/);
  const method = source.slice(source.indexOf('  function officialLogin()'), source.indexOf('  function showDialog(kind)'));
  assert.match(method, /loadDesktopLogin\(\);/);
  assert.doesNotMatch(source, /xiaohongshu\.com\/login\?redirectPath/);
});

test('desktop loader requests only official HTML with a desktop User-Agent', async () => {
  let captured;
  const request = new Function('GM', 'GM_xmlhttpRequest', 'DESKTOP_UA',
    section('requestDesktopPage(url)', 'loadDesktopLogin(') +
    '\nreturn requestDesktopPage;'
  )({ xmlHttpRequest(details) {
    captured = details;
    return Promise.resolve({ status: 200, responseText: 'official html' });
  } }, undefined, 'Desktop Safari');
  const response = await request('https://www.rednote.com/');
  assert.equal(response.status, 200);
  assert.equal(captured.url, 'https://www.rednote.com/');
  assert.equal(captured.method, 'GET');
  assert.equal(captured.headers['User-Agent'], 'Desktop Safari');
  assert.equal(captured.headers.Cookie, undefined);
  assert.equal(captured.data, undefined);
  assert.equal(captured.timeout, 15000);
});

test('desktop HTML validation rejects redirects to other sites and mobile HTML', () => {
  let hasDesktopEntry = true;
  class Parser { parseFromString() { return { querySelector: () => hasDesktopEntry ? {} : null }; } }
  const validate = new Function('DOMParser', section('desktopHtml(response, url)', 'requestDesktopPage(url)') +
    '\nreturn desktopHtml;')(Parser);
  const response = { status: 200, responseText: '<html>official desktop</html>', responseURL: 'https://www.rednote.com/' };
  assert.equal(validate(response, response.responseURL), response.responseText);
  assert.throws(() => validate({ ...response, responseURL: 'https://other.example/' }, response.responseURL), /不同站点/);
  assert.throws(() => validate({ ...response, status: 403 }, response.responseURL), /403/);
  hasDesktopEntry = false;
  assert.throws(() => validate(response, response.responseURL), /未获取到电脑版/);
});

test('missing extension request API fails with an actionable update message', async () => {
  const request = new Function('GM', 'GM_xmlhttpRequest', 'DESKTOP_UA',
    section('requestDesktopPage(url)', 'loadDesktopLogin(') +
    '\nreturn requestDesktopPage;'
  )(undefined, undefined, 'Desktop Safari');
  await assert.rejects(request('https://www.rednote.com/'), /重新安装 v0.4.3/);
});

test('diagnostics expose no media URLs and preserve H5 native grid', () => {
  assert.match(source, /媒体尺寸样本\(不含图片URL\)/);
  assert.match(source, /移动版原生布局（保留）/);
  assert.match(source, /const desktopCards = cards\.filter/);
});

function section(from, to) {
  const position = name => {
    const plain = source.indexOf('  function ' + name);
    return plain >= 0 ? plain : source.indexOf('  async function ' + name);
  };
  const start = position(from), end = position(to);
  assert.ok(start >= 0 && end > start, 'missing function section: ' + from + ' / ' + to);
  return source.slice(start, end);
}

test('home navigation preserves the current official domain and route', () => {
  for (const [origin, path] of [
    ['https://www.rednote.com', '/'], ['https://rednote.com', '/'],
    ['https://www.xiaohongshu.com', '/explore']
  ]) {
    const location = new URL(origin);
    const home = new Function('location', section('homeUrl()', 'addCss()').split('  const css =')[0] +
      '\nreturn homeUrl;')(location);
    assert.equal(home(), origin + path);
  }
  assert.ok(source.includes('// @match        https://www.rednote.com/*'));
  assert.ok(source.includes('// @match        https://rednote.com/*'));
});

test('English and Chinese login entries exclude script UI and login form submits', () => {
  const make = (text, excluded = false) => ({ textContent: text, closest: () => excluded ? {} : null });
  const native = [make('登录'), make('Log In'), make('Sign in'), make('ログイン'),
    { ...make(''), id: 'login-btn' }];
  const all = [...native, make('关注'), make('登录', true)];
  const select = new Function('$$', section('loginElements()', 'snapshot()') +
    '\nreturn loginElements;')(() => all);
  assert.deepEqual(select(), native);
});

test('account navigation never selects a card author or a different origin', () => {
  const entry = (href, card = false) => ({ href, closest: () => card ? {} : null });
  const me = entry('https://www.rednote.com/user/profile/me');
  const author = entry('https://www.rednote.com/user/profile/author', true);
  const other = entry('https://other.example/user/profile/me');
  const get = new Function('$$', 'location', section('nativeProfileEntry()', 'loginDialog()') +
    '\nreturn nativeProfileEntry;')(() => [author, other, me], new URL('https://www.rednote.com/'));
  assert.equal(get(), me);
});

function loginHarness({ desktop = false, ready = false } = {}) {
  const state = { desktop, ready, modal: false, logged: false, clicks: 0, downloads: 0 };
  const timers = new Map(), messages = [];
  const control = { disabled: false, setAttribute() {} };
  const native = { matches: () => true, click() { state.clicks++; state.modal = true; } };
  const context = {
    state, $: () => null, $$: () => [control], isVisible: () => false,
    loginElements: () => state.ready ? [native] : [],
    loginDialog: () => state.modal, loggedIn: () => state.logged,
    nativeProfileEntry: () => null, desktopDocument: () => state.desktop,
    notify: message => messages.push(message), log() {}, update() {}, renderDebug() {},
    setTimeout: callback => { timers.set(1, callback); return 1; }, clearTimeout: id => timers.delete(id)
  };
  const api = runInNewContext(`
    let desktopLoading = false, pendingDesktopLogin = false, loginOpening = false, loginWaitTimeout;
    let nativeLoginMode = false, debugVisible = false;
    function loadDesktopLogin() { state.downloads++; desktopLoading = true; }
    ${section('nativeLoginEntry()', 'desktopDocument()')}
    ${section('officialLogin()', 'showDialog(kind)')}
    ({ officialLogin, syncPendingLogin, waitForNativeLogin,
      installed() { desktopLoading = false; state.desktop = true; waitForNativeLogin(); } });
  `, context);
  return { ...api, state, control, timers, messages };
}

test('hidden native login button opens once without replacing the document', () => {
  const h = loginHarness({ desktop: true, ready: true });
  h.officialLogin(); h.officialLogin();
  assert.equal(h.state.clicks, 1);
  assert.equal(h.state.downloads, 0);
  assert.equal(h.control.disabled, false);
});

test('delayed desktop initialization never triggers another HTML replacement', () => {
  const h = loginHarness();
  h.officialLogin(); h.officialLogin();
  assert.equal(h.state.downloads, 1);
  h.installed();
  h.officialLogin(); h.officialLogin();
  assert.equal(h.state.downloads, 1);
  assert.equal(h.control.disabled, true);
  h.state.ready = true;
  h.syncPendingLogin(); h.syncPendingLogin();
  assert.equal(h.state.clicks, 1);
  assert.equal(h.state.downloads, 1);
  assert.equal(h.control.disabled, false);
});

test('login preparation timeout allows retry on the current desktop page', () => {
  const h = loginHarness({ desktop: true });
  h.officialLogin();
  h.timers.get(1)();
  assert.equal(h.control.disabled, false);
  h.state.ready = true;
  h.officialLogin();
  assert.equal(h.state.clicks, 1);
  assert.equal(h.state.downloads, 0);
});

test('a logged-in page never downloads HTML or opens another login dialog', () => {
  const h = loginHarness({ desktop: true });
  h.state.logged = true;
  h.officialLogin();
  assert.equal(h.state.downloads, 0);
  assert.equal(h.state.clicks, 0);
  assert.match(h.messages[0], /已登录/);
});

test('returning from profile uses official SPA navigation without a full reload', () => {
  let clicks = 0;
  const home = { href: 'https://www.rednote.com/?channel_id=homefeed_recommend',
    closest: () => null, click: () => { clicks++; } };
  const go = new Function('$$', 'location', 'homeUrl', 'pageView', 'refresh',
    section('goHome()', 'onAction(action)') + '\nreturn goHome;'
  )(() => [home], { href: 'https://www.rednote.com/user/profile/me', assign() { assert.fail('must not reload'); } },
    () => 'https://www.rednote.com/', () => 'profile', () => assert.fail('must not refresh before navigation'));
  go();
  assert.equal(clicks, 1);
});

test('runtime starts once per document body and disposes old listeners and timers', () => {
  const intervals = new Set(), timeouts = new Set(), signals = [], listeners = [];
  let nextId = 0, boots = 0, disconnects = 0;
  const document = { body: { classList: { add() {} } }, addEventListener(type, callback, options) {
    if (type === 'click') signals.push(options.signal);
    listeners.push({ type, options });
  } };
  const context = {
    document, window: { addEventListener() {} }, AbortController,
    sessionStorage: { getItem: () => null }, DESKTOP_KEY: 'test', VERSION: 'test',
    $: () => ({ setAttribute() {} }), addCss() {}, debugControl() {}, safeViewPath: () => '/',
    log(kind) { if (kind === 'BOOT') boots++; }, update() {}, pullReset() {},
    onPullStart() {}, onPullMove() {}, onPullEnd() {},
    MutationObserver: class { observe() {} disconnect() { disconnects++; } },
    setInterval() { const id = ++nextId; intervals.add(id); return id; },
    clearInterval: id => intervals.delete(id),
    setTimeout() { const id = ++nextId; timeouts.add(id); return id; },
    clearTimeout: id => timeouts.delete(id)
  };
  const end = source.lastIndexOf("\n  if (document.readyState === 'loading')");
  const api = runInNewContext(`
    let runtimeController, bodyObserver, bootBody, timer, feedCheckTimeout, runtimeGeneration = 0;
    ${source.slice(source.indexOf('  function stopRuntime()'), end)}
    ({ start });
  `, context);
  api.start(); api.start();
  assert.equal(boots, 1);
  assert.equal(signals.length, 1);
  document.body = { classList: { add() {} } };
  api.start();
  assert.equal(boots, 2);
  assert.equal(signals[0].aborted, true);
  assert.equal(signals[1].aborted, false);
  assert.equal(intervals.size, 1);
  assert.equal(timeouts.size, 1);
  assert.equal(disconnects, 1);
  const move = listeners.find(listener => listener.type === 'touchmove');
  assert.equal(move.options.capture, true);
  assert.equal(move.options.passive, false);
});

function refreshHarness({ native = true, hot = false, dialog = false, inactiveChannel = false, view = 'feed' } = {}) {
  let clicks = 0, channelClicks = 0, guides = 0;
  const messages = [], navigations = [], timers = new Map();
  const ui = { disabled: false, setAttribute() {} };
  const nativeControl = { closest: () => null, click: () => { clicks++; } };
  const recommend = { classList: { contains: () => !inactiveChannel }, click: () => { channelClicks++; } };
  const location = Object.assign(new URL('https://www.rednote.com/'), {
    assign: url => navigations.push(url), reload: () => assert.fail('must not reload stale HTML')
  });
  const api = new Function('$', '$$', 'noteLinks', 'location', 'window', 'pageView', 'loginDialog',
    'homeUrl', 'popularHeading', 'showLoginGuide', 'notify', 'log', 'setTimeout', 'clearTimeout',
    'let refreshInProgress = false, nativeLoginMode = false, refreshBefore = "", refreshTimeout;\n' +
    'const desktopLoading = false, pendingDesktopLogin = false, loginOpening = false;\n' +
    section('feedFingerprint()', 'back()') +
    '\nreturn { refresh, finishRefresh, feedFingerprint };'
  )(() => inactiveChannel ? recommend : null,
    selector => selector.startsWith('.reload') ? (native ? [nativeControl] : []) :
      selector.startsWith('[data-red-action') ? [ui] : [],
    () => hot ? [] : [{ href: location.origin + '/discovery/item/old?xsec_token=do-not-record' }],
    location, { scrollTo() {} }, () => view, () => dialog,
    () => location.origin + '/', () => hot, () => { guides++; },
    text => messages.push(text), () => {}, callback => { timers.set(1, callback); return 1; },
    id => timers.delete(id));
  return { ...api, ui, messages, navigations, timers,
    counts: () => ({ clicks, channelClicks, guides }) };
}

test('refresh triggers the official control once, locks duplicates and recovers on timeout', () => {
  const h = refreshHarness();
  h.refresh(); h.refresh();
  assert.equal(h.counts().clicks, 1);
  assert.equal(h.ui.disabled, true);
  assert.equal(h.navigations.length, 0);
  assert.equal(h.feedFingerprint(), '/discovery/item/old');
  h.timers.get(1)();
  assert.equal(h.ui.disabled, false);
  assert.match(h.messages.at(-1), /暂未返回/);
  h.refresh();
  assert.equal(h.counts().clicks, 2);
});

test('refresh returns to recommended channel before refreshing a category', () => {
  const h = refreshHarness({ inactiveChannel: true });
  h.refresh();
  assert.equal(h.counts().channelClicks, 1);
  assert.equal(h.counts().clicks, 0);
});

test('missing refresh controls preserve the current desktop document instead of navigating', () => {
  const hot = refreshHarness({ native: false, hot: true });
  hot.refresh();
  assert.equal(hot.counts().guides, 1);
  assert.equal(hot.navigations.length, 0);
  const desktop = refreshHarness({ native: false });
  desktop.refresh();
  assert.deepEqual(desktop.navigations, []);
  assert.match(desktop.messages.at(-1), /稍后重试/);
  assert.equal(desktop.timers.size, 0);
  const profile = refreshHarness({ view: 'profile' });
  profile.refresh();
  assert.deepEqual(profile.navigations, []);
  assert.equal(profile.counts().clicks, 0);
});

test('refresh never interferes with an open official login dialog', () => {
  const h = refreshHarness({ dialog: true });
  h.refresh();
  assert.equal(h.counts().clicks, 0);
  assert.equal(h.timers.size, 0);
});

test('pull-to-refresh respects a nested scroller position', () => {
  const getTop = new Function('$', 'window', 'document', 'getComputedStyle',
    section('scrollTop(target)', 'pullIndicator(text, offset)') + '\nreturn scrollTop;'
  )(() => null, { scrollY: 0 }, { documentElement: { scrollTop: 0 } },
    () => ({ overflowY: 'auto' }));
  const scroller = { scrollTop: 150, scrollHeight: 1800, clientHeight: 600, parentElement: null };
  assert.equal(getTop({ parentElement: scroller }), 150);
  scroller.scrollTop = 0;
  assert.equal(getTop({ parentElement: scroller }), 0);
});

function pullHarness() {
  let refreshes = 0;
  const indicator = { style: {} }, messages = [];
  const state = { top: 0, dialog: false, view: 'feed' };
  const api = runInNewContext(`
    let pullStart = null, pullTarget = null, pullDistance = 0, pullX = 0;
    let pullClaimed = false, pullBlocked = false, refreshInProgress = false, nativeLoginMode = false;
    ${section('pullReset()', 'stopRuntime()')}
    ({ start: onPullStart, move: onPullMove, end: onPullEnd, cancel: pullReset,
       busy(value) { refreshInProgress = value; } });
  `, {
    $: () => indicator, loginDialog: () => state.dialog, pageView: () => state.view,
    scrollTop: () => state.top, refresh: () => refreshes++,
    pullIndicator: text => messages.push(text), log() {}
  });
  function target(kind = 'feed') {
    const own = { closest: () => kind === 'bar' ? own : null };
    return { closest(selector) {
      if (selector === '[id^="red-web-"]') return ['bar', 'debug'].includes(kind) ? own : null;
      return kind === 'input' ? {} : null;
    } };
  }
  function event(y, { x = 100, cancelable = true, kind = 'feed', fingers = 1 } = {}) {
    return { target: target(kind), touches: Array.from({ length: fingers }, () => ({ clientX: x, clientY: y })),
      cancelable, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
  }
  return { ...api, event, state, indicator, messages, refreshes: () => refreshes };
}

test('the first tiny downward move is canceled before Safari can commit to page reload', () => {
  const h = pullHarness();
  h.start(h.event(0));
  // Safari may make subsequent moves noncancelable if the first one was allowed.
  const first = h.event(3);
  h.move(first);
  assert.equal(first.defaultPrevented, true);
  assert.equal(h.messages.length, 0, 'visual threshold must not delay cancellation');
  const next = h.event(100, { cancelable: first.defaultPrevented });
  h.move(next); h.end();
  assert.equal(next.defaultPrevented, true);
  assert.equal(h.refreshes(), 1);
  assert.equal(h.indicator.style.visibility, 'hidden');
});

test('pulling while recommendations load blocks browser reload without a second refresh', () => {
  const h = pullHarness();
  h.busy(true); h.start(h.event(100));
  const first = h.event(104); h.move(first);
  h.busy(false); // A pending request can finish while the finger is still down.
  const next = h.event(210); h.move(next); h.end();
  assert.equal(first.defaultPrevented && next.defaultPrevented, true);
  assert.equal(h.refreshes(), 0);
  h.start(h.event(100)); h.move(h.event(200)); h.end();
  assert.equal(h.refreshes(), 1);
});

test('pulls from navigation bars are handled, while debug and form controls stay interactive', () => {
  for (const kind of ['bar', 'debug', 'input']) {
    const h = pullHarness();
    h.start(h.event(100, { kind }));
    const move = h.event(200, { kind }); h.move(move); h.end();
    assert.equal(move.defaultPrevented, kind === 'bar', kind);
    assert.equal(h.refreshes(), kind === 'bar' ? 1 : 0, kind);
  }
});

test('horizontal and upward gestures cannot later turn into an accidental refresh', () => {
  for (const first of [{ y: 110, x: 160 }, { y: 90, x: 100 }]) {
    const h = pullHarness();
    h.start(h.event(100));
    const move = h.event(first.y, { x: first.x }); h.move(move);
    const reversed = h.event(250); h.move(reversed); h.end();
    assert.equal(move.defaultPrevented || reversed.defaultPrevented, false);
    assert.equal(h.refreshes(), 0);
  }
});

test('browser-owned, short, canceled and multi-touch pulls never request recommendations', () => {
  for (const kind of ['browser', 'short', 'cancel', 'multi']) {
    const h = pullHarness();
    h.start(h.event(0));
    h.move(h.event(kind === 'short' ? 30 : 100, { cancelable: kind !== 'browser', fingers: kind === 'multi' ? 2 : 1 }));
    if (kind === 'cancel') h.cancel();
    h.end();
    assert.equal(h.refreshes(), 0, kind);
  }
});

test('scrolled feeds, login dialogs and other views retain their normal touch behavior', () => {
  for (const state of [{ top: 100 }, { dialog: true }, { view: 'profile' }]) {
    const h = pullHarness(); Object.assign(h.state, state);
    h.start(h.event(100));
    const move = h.event(220); h.move(move); h.end();
    assert.equal(move.defaultPrevented, false);
    assert.equal(h.refreshes(), 0);
  }
});

test('mobile bars expose login immediately, then update when account navigation appears', () => {
  for (const authState of ['login', 'profile']) {
    const nodes = {};
    const document = { createElement: () => ({ isConnected: false }), body: { appendChild(node) { nodes[node.id] = node; } } };
    const draw = new Function('$', 'document', 'authState', 'svg', 'button', 'setRefreshing', 'setLoginBusy',
      'const refreshInProgress = false;\n' + section('drawBars(view)', 'findNative(label, scopes = [])') +
      '\nreturn drawBars;'
    )(() => null, document, authState, () => '',
      new Function('svg', section('button(action, label, icon, cls =', 'drawBars(view)') + '\nreturn button;')(() => ''),
      () => {}, () => {});
    draw('feed');
    const label = authState === 'login' ? '登录' : '我';
    assert.ok(nodes['red-web-top'].innerHTML.includes('>' + label + '</button>'));
    assert.ok(nodes['red-web-bottom'].innerHTML.includes('<span>' + label + '</span>'));
  }
});
