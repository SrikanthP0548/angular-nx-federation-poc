/**
 * Static host simulator.
 *
 * Stands in for the server-rendered application that hosts migrated pages. It
 * reproduces the part that matters architecturally: one host page per feature
 * entry, and a same-origin asset tree.
 *
 *   http://localhost:44300/
 *   ├── pricing-search.html      one host page per feature entry
 *   ├── pricing-details.html
 *   ├── feature-two.html
 *   ├── feature-three.html
 *   └── ui/
 *       ├── shell/current/       published shell artifact
 *       ├── pricing/<version>/   immutable published provider versions
 *       └── manifest.json        the environment manifest
 *
 * Same-origin hosting is what removes CORS, cookie and CSP complexity.
 *
 * No framework: this is a host simulator, and pulling a web framework into an
 * Angular-only POC would add a dependency nothing else needs.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const publishRoot = path.join(repoRoot, 'publish', 'ui');
const PORT = Number(process.env.HOST_PORT ?? 44300);

/** Every migrated page gets its own host page; unmigrated pages are untouched. */
const PAGES = {
  'pricing-search': {
    title: 'Customer pricing search',
    elementName: 'ca-pricing-search',
    attributes: (query) => ({ 'customer-id': query.get('customerId') ?? '1001' }),
  },
  'pricing-details': {
    title: 'Product pricing detail',
    elementName: 'ca-pricing-details',
    attributes: (query) => ({
      'customer-id': query.get('customerId') ?? '1001',
      'product-code': query.get('productCode') ?? 'IRS-10Y',
    }),
  },
  'feature-two': {
    title: 'Settlement instructions',
    elementName: 'ca-feature-two',
    attributes: (query) => ({ reference: query.get('reference') ?? 'SSI-4471' }),
  },
  'feature-three': {
    title: 'Counterparty limits',
    elementName: 'ca-feature-three',
    attributes: (query) => ({ desk: query.get('desk') ?? 'Rates' }),
  },
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
};

/**
 * Values interpolated into markup must be encoded. An unencoded query
 * parameter reflected into an attribute is a cross-site scripting hole.
 */
function htmlEncode(value) {
  return String(value).replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;' })[c]
  );
}

function renderHostPage(featureKey, query) {
  const page = PAGES[featureKey];
  const attributes = Object.entries(page.attributes(query))
    .map(([name, value]) => `${name}="${htmlEncode(value)}"`)
    .join('\n        ');

  const nav = Object.entries(PAGES)
    .map(([key, p]) =>
      key === featureKey
        ? `<strong aria-current="page">${p.title}</strong>`
        : `<a href="/${key}.html">${p.title}</a>`
    )
    .join('\n      ');

  // The three script tags below are the integration contract, and each has a
  // failure mode if altered. Native Federation installs the shared-dependency
  // import map at runtime through es-module-shims, so the shell entry must be
  // loaded as "module-shim": a plain type="module" bypasses the shim and every
  // bare Angular specifier fails to resolve.
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${htmlEncode(page.title)} — HostApp</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/ui/shell/current/styles.css" />
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; background: #fafafa; }
      .chrome { background: #26374a; color: #fff; padding: 0.75rem 1.25rem; display: flex; gap: 1.5rem; align-items: baseline; flex-wrap: wrap; }
      .chrome a { color: #9fd3ff; font-size: 0.875rem; }
      .chrome strong { font-size: 0.875rem; }
      .note { margin: 1rem; padding: 0.75rem 1rem; border-left: 3px solid #26374a; background: #fff; color: #444; font-size: 0.875rem; max-width: 52rem; }
    </style>
  </head>
  <body>
    <div class="chrome">
      ${nav}
    </div>

    <p class="note">
      Served by the host application. Everything below is rendered by a
      federated Angular feature resolved at runtime through the manifest.
    </p>

    <main id="angular-page-host" data-angular-feature="${htmlEncode(featureKey)}">
      <${page.elementName}
        ${attributes}></${page.elementName}>
    </main>

    <script type="application/json" id="angular-bootstrap-context">
      { "assetBasePath": "/ui" }
    </script>

    <script type="esms-options">{ "shimMode": true }</script>
    <script type="module" src="/ui/shell/current/polyfills.js"></script>
    <script type="module-shim" src="/ui/shell/current/main.js"></script>
  </body>
</html>
`;
}

function serveStatic(res, filePath, relative) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    return res.end('not found');
  }
  // Immutable versioned assets cache for a year; the manifest and the mutable
  // `current` pointer must revalidate so promotions take effect immediately.
  const mutable = relative === 'manifest.json' || relative.includes(`shell${path.sep}current`);
  res.writeHead(200, {
    'content-type': MIME[path.extname(filePath)] ?? 'application/octet-stream',
    'cache-control': mutable ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith('/ui/')) {
    const relative = pathname.slice('/ui/'.length);
    const resolved = path.join(publishRoot, relative);
    // Contain traversal: a crafted path must not escape the published tree.
    if (!resolved.startsWith(publishRoot)) {
      res.writeHead(403, { 'content-type': 'text/plain' });
      return res.end('forbidden');
    }
    return serveStatic(res, resolved, relative);
  }

  const featureKey = pathname === '/' ? 'pricing-search' : pathname.replace(/^\/|\.html$/g, '');
  if (PAGES[featureKey]) {
    res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
    return res.end(renderHostPage(featureKey, url.searchParams));
  }

  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found');
});

server.listen(PORT, () => {
  console.info(`[host] listening on http://localhost:${PORT}`);
  for (const key of Object.keys(PAGES)) {
    console.info(`[host]   http://localhost:${PORT}/${key}.html`);
  }
});
