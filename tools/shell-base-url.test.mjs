import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { resolveShellBaseUrl } from '../apps/shell/src/resolve-shell-base-url.ts';

/**
 * Regression coverage for the bug found while fixing manifest.dev.json: the
 * shell's own base-URL resolution broke under Angular's Vite dev server
 * because `import.meta.url` resolved to a malformed internal path there.
 * These tests exercise the DOM-based replacement directly, including the
 * production module-shim path and the dev-server path that actually broke.
 */

test('resolves the base URL from a plain production <script src="...main.js">', () => {
  const dom = new JSDOM('<script src="/ui/shell/current/main.js"></script>', {
    url: 'http://localhost:44300/pricing-search.html',
  });
  assert.equal(resolveShellBaseUrl(dom.window.document), 'http://localhost:44300/ui/shell/current/');
});

test('resolves the base URL for the module-shim production path', () => {
  // type="module-shim" is es-module-shims' custom mime type, not a native
  // ES module — the src attribute and DOM query behave the same either way.
  const dom = new JSDOM(
    '<script type="module-shim" src="/ui/shell/current/main.js"></script>',
    { url: 'http://localhost:44300/pricing-search.html' }
  );
  assert.equal(resolveShellBaseUrl(dom.window.document), 'http://localhost:44300/ui/shell/current/');
});

test('resolves the base URL when the dev server serves main.js from root', () => {
  // This is the exact shape that broke: `nx serve shell` serves a clean
  // /main.js script tag even though import.meta.url internally resolved to
  // a malformed @fs/.../vite-root/... path with no trailing slash.
  const dom = new JSDOM('<script type="module" src="main.js"></script>', {
    url: 'http://localhost:4200/',
  });
  assert.equal(resolveShellBaseUrl(dom.window.document), 'http://localhost:4200/');
});

test('throws a clear error when no matching script tag exists', () => {
  const dom = new JSDOM('<script src="/ui/shell/current/polyfills.js"></script>', {
    url: 'http://localhost:44300/pricing-search.html',
  });
  assert.throws(
    () => resolveShellBaseUrl(dom.window.document),
    /could not locate this script's own <script src="\.\.\.main\.js"> tag/
  );
});

test('is not fooled by an unrelated script that merely contains "main.js" mid-path', () => {
  const dom = new JSDOM(
    '<script src="/ui/main.js.backup/other.js"></script><script src="/ui/shell/current/main.js"></script>',
    { url: 'http://localhost:44300/pricing-search.html' }
  );
  // Selector is src$="main.js" (ends with), so the backup path must not match.
  assert.equal(resolveShellBaseUrl(dom.window.document), 'http://localhost:44300/ui/shell/current/');
});
