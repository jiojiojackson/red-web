import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../red-web.user.js', import.meta.url), 'utf8');

test('script syntax and version', () => {
  assert.doesNotThrow(() => new Function(source));
  assert.equal(source.match(/@version\s+(\S+)/)[1], '0.4.0');
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

test('login when native entry is absent shows guide rather than a fake URL', () => {
  assert.match(source, /function showLoginGuide\(\)/);
  assert.match(source, /showLoginGuide\(\);/);
  assert.doesNotMatch(source, /xiaohongshu\.com\/login\?redirectPath/);
});

test('diagnostics expose no media URLs and preserve H5 native grid', () => {
  assert.match(source, /媒体尺寸样本\(不含图片URL\)/);
  assert.match(source, /移动版原生布局（保留）/);
  assert.match(source, /const desktopCards = cards\.filter/);
});

function section(from, to) {
  return source.slice(source.indexOf('  function ' + from), source.indexOf('  function ' + to));
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
  const native = [make('登录'), make('Log In'), make('Sign in')];
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

test('login uses the hidden native button without dismantling the mobile interface', () => {
  let clicks = 0, guides = 0, updates = 0;
  const hiddenButton = { matches: () => true, click: () => { clicks++; } };
  const login = new Function('$', 'renderDebug', 'nativeProfileEntry', 'loginElements',
    'loginDialog', 'isVisible', 'log', 'showLoginGuide', 'update',
    'let debugVisible = false, nativeLoginMode = false;\n' +
    section('officialLogin()', 'showDialog(kind)') + '\nreturn officialLogin;'
  )(() => null, () => {}, () => null, () => [hiddenButton], () => null,
    () => false, () => {}, () => { guides++; }, () => { updates++; });
  login();
  assert.equal(clicks, 1);
  assert.equal(guides, 0);
  assert.equal(updates, 1);
});

function refreshHarness({ native = true, hot = false, dialog = false, inactiveChannel = false } = {}) {
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
    section('feedFingerprint()', 'back()') +
    '\nreturn { refresh, finishRefresh, feedFingerprint };'
  )(() => inactiveChannel ? recommend : null,
    selector => selector.startsWith('.reload') ? (native ? [nativeControl] : []) :
      selector.startsWith('[data-red-action') ? [ui] : [],
    () => hot ? [] : [{ href: location.origin + '/discovery/item/old?xsec_token=do-not-record' }],
    location, { scrollTo() {} }, () => 'feed', () => dialog,
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

test('static H5 hot notes show help, while missing desktop controls use same-site navigation', () => {
  const hot = refreshHarness({ native: false, hot: true });
  hot.refresh();
  assert.equal(hot.counts().guides, 1);
  assert.equal(hot.navigations.length, 0);
  const desktop = refreshHarness({ native: false });
  desktop.refresh();
  assert.deepEqual(desktop.navigations, ['https://www.rednote.com/?channel_id=homefeed_recommend']);
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

test('mobile bars expose login immediately, then update when account navigation appears', () => {
  for (const authState of ['login', 'profile']) {
    const nodes = {};
    const document = { createElement: () => ({ isConnected: false }), body: { appendChild(node) { nodes[node.id] = node; } } };
    const draw = new Function('$', 'document', 'authState', 'svg', 'button', 'setRefreshing',
      'const refreshInProgress = false;\n' + section('drawBars(view)', 'findNative(label, scopes = [])') +
      '\nreturn drawBars;'
    )(() => null, document, authState, () => '',
      new Function('svg', section('button(action, label, icon, cls =', 'drawBars(view)') + '\nreturn button;')(() => ''),
      () => {});
    draw('feed');
    const label = authState === 'login' ? '登录' : '我';
    assert.ok(nodes['red-web-top'].innerHTML.includes('>' + label + '</button>'));
    assert.ok(nodes['red-web-bottom'].innerHTML.includes('<span>' + label + '</span>'));
  }
});
