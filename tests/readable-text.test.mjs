import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { readableCreateElement as el } from '../src/readable-text.js';

const textContent = value => typeof value === 'string' || typeof value === 'number' ? String(value) :
  Array.isArray(value) ? value.map(textContent).join('') : value?.props ? textContent(value.props.children) : '';

test('responsive typography preserves punctuation, quotes, whitespace and mixed inline content', () => {
  for (const text of ['、まずは、お気軽にご相談ください。', '「大丈夫です。」とお伝えします。', '動画教材を 60本 お届けします。', '1,000円OFF\nオンライン（Zoom）', '相談できますか？ はい、大丈夫です！']) {
    assert.equal(textContent(el('p', null, text)), text);
  }
  const strong = el('strong', null, '大切に');
  const paragraph = el('p', null, '自分を、', strong, 'していきましょう。');
  assert.equal(textContent(paragraph), '自分を、大切にしていきましょう。');
  assert.match(renderToStaticMarkup(paragraph), /<strong>/);
  assert.match(renderToStaticMarkup(paragraph), /reading-clause/);
});

test('form controls, attributes, component inputs and explicit line breaks are preserved', () => {
  for (const tag of ['textarea', 'option', 'code']) {
    assert.equal(el(tag, null, '単語をそのまま残す').props.children, '単語をそのまま残す');
  }
  function Component() {}
  assert.equal(el(Component, null, '相談について').props.children, '相談について');
  const link = el('a', { href: '/相談/', 'aria-label': '相談はこちら' }, '相談はこちら');
  assert.equal(link.props.href, '/相談/');
  assert.equal(link.props['aria-label'], '相談はこちら');
  const html = renderToStaticMarkup(el('p', null, '心と身体をゆるめ、', el('br'), 'リラックスしましょう。'));
  assert.equal((html.match(/<br\/>/g) || []).length, 1);
});
