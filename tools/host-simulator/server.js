/**
 * Minimal same-origin stand-in for the server-rendered host application.
 * It serves the standard Angular build under /ui/current and emits one host
 * page per feature. There is no runtime manifest or federation metadata.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const assetRoot = path.join(repoRoot, 'dist', 'apps', 'elements-loader', 'browser');
const PORT = Number(process.env.HOST_PORT ?? 44300);

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
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
};

function htmlEncode(value) {
  return String(value).replace(
    /[<>&'"]/g,
    (character) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&#39;', '"': '&quot;' })[character]
  );
}

const STYLES = `
  body { margin: 0; font-family: system-ui, sans-serif; background: #fafafa; }
  .chrome { background: #26374a; color: #fff; padding: .75rem 1.25rem; display: flex; gap: 1.5rem; flex-wrap: wrap; }
  .chrome a { color: #9fd3ff; font-size: .875rem; }
  .note { margin: 1rem; padding: .75rem 1rem; border-left: 3px solid #26374a; background: #fff; max-width: 52rem; }
  #downloads { margin: 1rem; padding: .75rem 1rem; background: #fff; border: 1px solid #dde; border-radius: 8px; max-width: 60rem; font-size: .8rem; }
  #downloads h2 { font-size: .85rem; margin: 0 0 .5rem; text-transform: uppercase; color: #555; }
  #downloads ul { margin: .2rem 0 0 1rem; padding: 0; color: #555; }
`;

const DOWNLOAD_READOUT = `<section id="downloads" aria-live="polite"></section>
<script type="text/javascript">
  addEventListener('load', () => setTimeout(() => {
    const scripts = performance.getEntriesByType('resource')
      .filter((entry) => entry.name.endsWith('.js'))
      .map((entry) => ({
        file: new URL(entry.name).pathname.split('/').pop(),
        kb: Math.round((entry.transferSize || entry.encodedBodySize || 0) / 102.4) / 10
      }));
    const total = Math.round(scripts.reduce((sum, file) => sum + file.kb, 0) * 10) / 10;
    document.getElementById('downloads').innerHTML =
      '<h2>JavaScript downloaded by this page</h2>' +
      '<p>' + scripts.length + ' file(s), ' + total + ' kB</p><ul>' +
      scripts.map((file) => '<li>' + file.file + ' (' + file.kb + ' kB)</li>').join('') +
      '</ul>';
  }, 400));
</script>`;

function navigation(current) {
  return Object.entries(PAGES)
    .map(([key, page]) =>
      key === current
        ? `<strong aria-current="page">${page.title}</strong>`
        : `<a href="/${key}.html">${page.title}</a>`
    )
    .join('\n');
}

function hostScripts() {
  return `<script type="application/json" id="angular-bootstrap-context">
    { "environment": "local-integration", "assetBasePath": "/ui" }
  </script>
  <script type="module" src="/ui/current/main.js"></script>`;
}

function renderHostPage(featureKey, query) {
  const page = PAGES[featureKey];
  const attributes = Object.entries(page.attributes(query))
    .map(([name, value]) => `${name}="${htmlEncode(value)}"`)
    .join(' ');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${page.title} — HostApp</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/ui/current/styles.css" />
  <style>${STYLES}</style>
</head>
<body>
  <nav class="chrome">${navigation(featureKey)}</nav>
  <p class="note">The host owns this document. Only the requested Angular page is loaded below.</p>
  <main id="angular-page-host" data-angular-feature="${featureKey}">
    <${page.elementName} ${attributes}></${page.elementName}>
  </main>
  ${hostScripts()}
  ${DOWNLOAD_READOUT}
</body>
</html>`;
}

function renderLandingPage() {
  const cards = Object.entries(PAGES)
    .map(([key, page]) => `<li><a href="/${key}.html">${page.title}</a></li>`)
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>HostApp — home</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="/ui/current/styles.css" />
  <style>${STYLES}</style>
</head>
<body>
  <nav class="chrome"><strong aria-current="page">Home</strong>${navigation()}</nav>
  <p class="note">No Angular feature is hosted here, so no Angular runtime or page implementation is requested.</p>
  <ul>${cards}</ul>
  ${hostScripts()}
  ${DOWNLOAD_READOUT}
</body>
</html>`;
}

function serveAsset(response, relativePath) {
  const resolved = path.resolve(assetRoot, relativePath);
  const contained = resolved === assetRoot || resolved.startsWith(`${assetRoot}${path.sep}`);
  if (!contained) {
    response.writeHead(403, { 'content-type': 'text/plain' });
    return response.end('forbidden');
  }
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    response.writeHead(404, { 'content-type': 'text/plain' });
    return response.end('not found');
  }

  response.writeHead(200, {
    'content-type': MIME[path.extname(resolved)] ?? 'application/octet-stream',
    'cache-control': 'no-cache',
  });
  fs.createReadStream(resolved).pipe(response);
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith('/ui/current/')) {
    return serveAsset(response, pathname.slice('/ui/current/'.length));
  }

  if (pathname === '/' || pathname === '/index.html') {
    response.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
    return response.end(renderLandingPage());
  }

  const featureKey = pathname.replace(/^\/|\.html$/g, '');
  if (PAGES[featureKey]) {
    response.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
    return response.end(renderHostPage(featureKey, url.searchParams));
  }

  response.writeHead(404, { 'content-type': 'text/plain' });
  response.end('not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.info(`[host] listening on http://127.0.0.1:${PORT}`);
});
