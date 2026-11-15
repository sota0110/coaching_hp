import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { readableCreateElement as el } from '../src/readable-text.js';

const textContent = value => typeof value === 'string' || typeof value === 'number' ? String(value) :
  Array.isArray(value) ? value.map(textContent).join('') : value?.props ? textContent(value.props.children) : '';
const phrases = node => Array.isArray(node) ? node.flatMap(phrases) :
  node?.props?.className === 'reading-phrase' ? [textContent(node)] : node?.props ? phrases(node.props.children) : [];

test('service terms, names and verb endings remain together', () => {
  const chunks = phrases(el('p', null, '代々木のサロンで、ホッとひと息。プライベートコーチング相談のお問い合わせ。始めてみませんか？'));
  for (const word of ['代々木', 'ホッとひと息', 'プライベート', 'コーチング', '相談', 'お問い合わせ', 'みませんか']) {
    assert(chunks.some(chunk => chunk.includes(word)), word);
  }
});

test('long testimonials and profile credentials expose natural wrapping points', () => {
  for (const text of ['立命館大学 産業社会学部 発達福祉コース卒業', 'ベストタイミングなのかもしれません。', '受け止められるようになりましたし、', 'ポジティブ変換できるようになった。', 'ホームページ完成しました！', '安心してお話しいただけるよう、']) {
    const node = el('p', null, text);
    assert.equal(textContent(node), text);
    assert(phrases(node).length > 1, text);
    assert(phrases(node).every(phrase => phrase.length < 16), text);
  }
});

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

test('form controls, attributes and component inputs are preserved', () => {
  for (const tag of ['textarea', 'option', 'code']) {
    assert.equal(el(tag, null, '単語をそのまま残す').props.children, '単語をそのまま残す');
  }
  function Component() {}
  assert.equal(el(Component, null, '相談について').props.children, '相談について');
  const link = el('a', { href: '/相談/', 'aria-label': '相談はこちら' }, '相談はこちら');
  assert.equal(link.props.href, '/相談/');
  assert.equal(link.props['aria-label'], '相談はこちら');
});

test('legacy inline breaks rejoin words and allow prose and headings to flow', () => {
  for (const tag of ['p', 'h2', 'strong', 'span']) {
    const node = el(tag, null, ['心と身体をゆるめ、', el('br'), 'ハンド', el('br'), 'マッサージを行います。']);
    assert.equal(textContent(node), '心と身体をゆるめ、ハンドマッサージを行います。');
    assert(phrases(node).some(phrase => phrase.includes('ハンドマッサージ')));
    assert(!renderToStaticMarkup(node).includes('<br'));
  }
  assert.equal(textContent(el('p', null, 'Hello', el('br'), 'world')), 'Hello world');
  const paragraphs = el('div', null, el('p', null, '一つ目。'), el('p', null, '二つ目。'));
  assert.equal((renderToStaticMarkup(paragraphs).match(/<p>/g) || []).length, 2);
});
