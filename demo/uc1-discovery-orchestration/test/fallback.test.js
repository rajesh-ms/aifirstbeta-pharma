import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decideFallback } from '../public/js/azure.js';

test('use live response only on ok + json', () => {
  assert.equal(decideFallback({ ok: true, contentType: 'application/json; charset=utf-8' }), false);
});

test('fall back on non-ok (e.g. 501/502 from server)', () => {
  assert.equal(decideFallback({ ok: false, contentType: 'application/json' }), true);
});

test('fall back on ok-but-not-json (GitHub Pages 404 HTML, status coerced ok by host)', () => {
  assert.equal(decideFallback({ ok: true, contentType: 'text/html' }), true);
});

test('fall back when content-type is missing', () => {
  assert.equal(decideFallback({ ok: true, contentType: null }), true);
});
