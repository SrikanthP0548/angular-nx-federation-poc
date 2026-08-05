/**
 * Resolves this script's own base URL from its `<script src>` tag in the DOM.
 *
 * Deliberately not `import.meta.url`: under Angular's Vite-based dev server
 * (`nx serve shell`), `import.meta.url` resolves to an internal
 * `@fs/.../vite-root/...` virtual path with no trailing slash after
 * `new URL('.', ...)`, which silently produces a malformed
 * `remoteEntry.json` URL and breaks federation before Angular ever loads.
 * `HTMLScriptElement.src` always reflects the browser-resolved absolute URL,
 * in both dev and the production module-shim path — verified against both.
 *
 * Takes `doc` as a parameter (defaulting to the global `document`) so this
 * is testable with a jsdom document without needing a real browser.
 */
export function resolveShellBaseUrl(doc: Document = document): string {
  const script = doc.querySelector<HTMLScriptElement>('script[src$="main.js"]');
  if (!script) {
    throw new Error('shell.start.failed: could not locate this script\'s own <script src="...main.js"> tag');
  }
  return new URL('.', script.src).href;
}
