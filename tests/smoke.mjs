import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../red-web.user.js', import.meta.url), 'utf8');

test('script syntax and version', () => {
  assert.doesNotThrow(() => new Function(source));
  assert.match(source, /@version\s+0\.3\.2/);
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

test('mobile note selectors accept native Xiaohongshu links only', () => {
  const start = source.indexOf('  function noteLinks()');
  const end = source.indexOf('  function findFeedContainer(cards)', start);
  assert.ok(start > 0 && end > start);
  const methods = source.slice(start, end);
  const a = { href: 'https://www.xiaohongshu.com/explore/abc', closest: () => null };
  const b = { href: 'https://www.xiaohongshu.com/discovery/item/def', closest: () => null };
  const other = { href: 'https://other.example/explore/xyz', closest: () => null };
  const heading = { childElementCount: 0, textContent: '热门笔记', closest: () => null };
  const card = link => ({
    closest: () => null,
    contains: candidate => candidate === link,
    matches: selector => selector === '.note-item'
  });
  const cards = [card(a), card(b)];
  const selectAll = selector => {
    if (selector.startsWith('a[href*=')) return [a, b, other];
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
  assert.equal(fns.noteLinks().length, 2);
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
