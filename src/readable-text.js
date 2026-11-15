import { createElement } from 'react';
import { Parser, jaModel } from 'budoux';

const parser = new Parser(jaModel);
const japanese = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;
const untouchedTags = new Set(['script', 'style', 'textarea', 'input', 'select', 'option', 'pre', 'code', 'svg', 'title']);
const cache = new Map();

function phrasesFor(clause) {
  const boundaries = new Set(parser.parseBoundaries(clause));
  // Keep compound words and names intact even if the statistical model proposes
  // an internal boundary (for example, 代々木 or 笑顔).
  for (const match of clause.matchAll(/[\p{Script=Han}々]+|[\p{Script=Katakana}ー]+|[A-Za-z0-9]+|すみいみゆき/gu)) {
    for (let i = match.index + 1; i < match.index + match[0].length; i++) boundaries.delete(i);
  }
  // A katakana word can wrap as a whole before its following Japanese suffix.
  for (const match of clause.matchAll(/[\p{Script=Katakana}ー]+/gu)) {
    if (match.index) boundaries.add(match.index);
    if (match.index + match[0].length < clause.length) boundaries.add(match.index + match[0].length);
  }
  for (const match of clause.matchAll(/プライベート|コーチング|セラピー|メンテナンス|セッション|ハンドマッサージ|オンライン|お問い合わせ|問い合わせ|プライバシー|ポリシー|すみいみゆき|公式LINE|代々木|笑顔|ゆるめる|ホッとひと息|ご相談|相談|お話し|いただける|だからこそ|ことがある|みませんか|ように|かもしれません|できる|[・｜　 ]/gu)) {
    for (let i = match.index + 1; i < match.index + match[0].length; i++) boundaries.delete(i);
    if (match.index) boundaries.add(match.index);
    if (match.index + match[0].length < clause.length) boundaries.add(match.index + match[0].length);
  }
  // Separators and closing punctuation belong to the preceding phrase.
  for (const i of boundaries) if (/^[・｜　 、。！？!?」』）】]/u.test(clause.slice(i))) boundaries.delete(i);
  const points = [0, ...[...boundaries].sort((a, b) => a - b), clause.length];
  return points.slice(1).map((end, i) => clause.slice(points[i], end));
}

// Punctuation is the first choice; inside a long clause, use Japanese phrase boundaries.
// The same deterministic parser runs during prerendering and browser hydration.
export function readableText(text, key) {
  if (typeof text !== 'string' || !japanese.test(text)) return text;
  let clauses = cache.get(text);
  if (!clauses) {
    clauses = text.split(/(?<=[、。！？!?])(?![」』）】”’、。！？!?])/u).filter(Boolean).map(phrasesFor);
    if (cache.size >= 2048) cache.clear();
    cache.set(text, clauses);
  }
  return createElement('span', { className: 'reading-text', key }, clauses.map((phrases, index) =>
    createElement('span', { className: 'reading-clause', key: index }, phrases.map((phrase, part) =>
      createElement('span', { className: 'reading-phrase', key: part }, phrase)))));
}

function formatChild(child, index) {
  return Array.isArray(child) ? child.map(formatChild) : readableText(child, index);
}

function flowingChildren(children) {
  const result = [];
  let afterBreak = false;
  for (const child of children) {
    // Keep React's array key scopes intact for mapped lists and interactive UI.
    if (Array.isArray(child)) { result.push(flowingChildren(child)); afterBreak = false; continue; }
    if (child?.type === 'br') { afterBreak = true; continue; }
    if (child == null || typeof child === 'boolean') continue;
    const previous = result.at(-1);
    if (typeof child === 'string' && typeof previous === 'string') {
      const space = afterBreak && /[A-Za-z0-9]$/.test(previous) && /^[A-Za-z0-9]/.test(child) ? ' ' : '';
      result[result.length - 1] = previous + space + child;
    } else result.push(child);
    afterBreak = false;
  }
  return result;
}

// Shared classic JSX factory: only visible text changes. Props, controls, refs and
// component children retain their original values. Legacy inline breaks become
// flowing text before phrase detection, so words split by old markup rejoin.
export function readableCreateElement(type, props, ...children) {
  const format = typeof type === 'string' && !untouchedTags.has(type) &&
    !props?.['aria-hidden'] && !props?.contentEditable &&
    !/(?:^|\s)(?:heading-phrase|session-phrase|screen-reader-text)(?:\s|$)/.test(props?.className || '');
  return createElement(type, props, ...(format ? flowingChildren(children).map(formatChild) : children));
}
