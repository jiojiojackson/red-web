import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../red-web.user.js', import.meta.url), 'utf8');

test('script syntax and version', () => {
  assert.doesNotThrow(() => new Function(source));
  assert.match(source, /@version\s+0\.2\./);
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
