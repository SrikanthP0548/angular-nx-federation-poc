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
const containerPublishRoot = path.join(repoRoot, 'publish', 'angular-shell');
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

const CHROME_STYLES = `
      body { margin: 0; font-family: system-ui, sans-serif; background: #fafafa; }
      .chrome { background: #26374a; color: #fff; padding: 0.75rem 1.25rem; display: flex; gap: 1.5rem; align-items: baseline; flex-wrap: wrap; }
      .chrome a { color: #9fd3ff; font-size: 0.875rem; }
      .chrome strong { font-size: 0.875rem; }
      .note { margin: 1rem; padding: 0.75rem 1rem; border-left: 3px solid #26374a; background: #fff; color: #444; font-size: 0.875rem; max-width: 52rem; }
      .note code { background: #eef; padding: 0 0.2rem; border-radius: 3px; }
      #downloads { margin: 1rem; padding: 0.75rem 1rem; background: #fff; border: 1px solid #dde; border-radius: 8px; max-width: 60rem; font-size: 0.8rem; }
      #downloads h2 { font-size: 0.85rem; margin: 0 0 0.5rem; text-transform: uppercase; letter-spacing: 0.04em; color: #555; }
      #downloads .group { margin-bottom: 0.6rem; }
      #downloads .origin { font-weight: 600; }
      #downloads .origin.feature { color: #0a7; }
      #downloads .origin.none { color: #888; font-weight: 400; }
      #downloads ul { margin: 0.2rem 0 0 1rem; padding: 0; color: #555; }
`;

/**
 * A demo aid, not part of the architecture: lists the JavaScript this page
 * actually downloaded, grouped by which published artifact served it. It makes
 * the deferral visible without opening DevTools.
 */
const DOWNLOAD_READOUT = `<section id="downloads" aria-live="polite"></section>
    <script type="text/javascript">
      addEventListener('load', () => setTimeout(() => {
        const scripts = performance.getEntriesByType('resource')
          .filter((e) => e.name.endsWith('.js'));
        const groups = new Map();
        for (const entry of scripts) {
          const path = new URL(entry.name).pathname;
          const match = path.match(/^\\/ui\\/([^/]+)\\/([^/]+)\\//);
          const origin = match ? \`/ui/\${match[1]}/\${match[2]}/\` : 'other';
          if (!groups.has(origin)) groups.set(origin, []);
          groups.get(origin).push({ file: path.split('/').pop(), kb: Math.round((entry.transferSize || entry.encodedBodySize || 0) / 102.4) / 10 });
        }
        const providers = [...groups.keys()].filter((o) => o.startsWith('/ui/') && !o.startsWith('/ui/shell/'));
        const el = document.getElementById('downloads');
        el.innerHTML = '<h2>JavaScript downloaded by this page</h2>' +
          [...groups.entries()].map(([origin, files]) =>
            '<div class="group"><span class="origin ' + (origin.startsWith('/ui/shell/') ? '' : 'feature') + '">' + origin +
            '</span> — ' + files.length + ' file(s), ' +
            (Math.round(files.reduce((t, f) => t + f.kb, 0) * 10) / 10) + ' kB<ul>' +
            files.map((f) => '<li>' + f.file + ' (' + f.kb + ' kB)</li>').join('') + '</ul></div>'
          ).join('') +
          (providers.length === 0
            ? '<div class="group"><span class="origin none">No feature provider code downloaded on this page.</span></div>'
            : '');
      }, 400));
    </script>`;

/**
 * The three script tags in the returned markup are the integration contract,
 * and each has a failure mode if altered: Native Federation installs the
 * shared-dependency import map at runtime through es-module-shims, so the
 * shell entry must be loaded as "module-shim" — a plain type="module" bypasses
 * the shim and every bare Angular specifier fails to resolve.
 */
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

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${htmlEncode(page.title)} — HostApp</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/ui/shell/current/styles.css" />
    <style>${CHROME_STYLES}</style>
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
    ${DOWNLOAD_READOUT}
  </body>
</html>
`;
}

/**
 * The landing page.
 *
 * It loads the shell exactly as every other host page does — same three script
 * tags — but hosts no feature element. The shell finds nothing to do and stops,
 * so this page fetches the shell and the Angular runtime and **no provider or
 * feature code at all**. Navigating to a feature page is what pulls a provider
 * down, and only that provider.
 *
 * This is the ordinary state of an unmigrated page in the real application,
 * which is why the shell must treat "no feature here" as normal rather than as
 * an error.
 */
function renderLandingPage() {
  const cards = Object.entries(PAGES)
    .map(
      ([key, p]) => `      <a class="card" href="/${key}.html">
        <strong>${p.title}</strong>
        <code>&lt;${p.elementName}&gt;</code>
      </a>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>HostApp — home</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/ui/shell/current/styles.css" />
    <style>
      ${CHROME_STYLES}
      .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 1rem; margin: 1rem; max-width: 60rem; }
      .card { display: grid; gap: 0.35rem; padding: 1rem; background: #fff; border: 1px solid #dde; border-radius: 8px; text-decoration: none; color: #26374a; }
      .card:hover { border-color: #26374a; }
      .card code { color: #666; font-size: 0.8rem; }
    </style>
  </head>
  <body>
    <div class="chrome">
      <strong aria-current="page">Home</strong>
      ${Object.entries(PAGES)
        .map(([key, p]) => `<a href="/${key}.html">${p.title}</a>`)
        .join('\n      ')}
    </div>

    <p class="note">
      This page loads the shell but hosts no feature: there is no
      <code>data-angular-feature</code> element, so the shell stops after
      startup. The panel at the bottom lists what the browser actually
      downloaded — no <code>/ui/pricing/</code>, <code>/ui/feature-two/</code>
      or <code>/ui/feature-three/</code> entries appear until you open a page.
    </p>

    <div class="cards">
${cards}
    </div>

    <script type="application/json" id="angular-bootstrap-context">
      { "assetBasePath": "/ui" }
    </script>

    <script type="esms-options">{ "shimMode": true }</script>
    <script type="module" src="/ui/shell/current/polyfills.js"></script>
    <script type="module-shim" src="/ui/shell/current/main.js"></script>
    ${DOWNLOAD_READOUT}
  </body>
</html>
`;
}

/**
 * Stand-ins for the real ASP Classic / ASP.NET WebForms application that
 * `/AngularShell/`'s iframe hosts. Additive to the existing PAGES simulator:
 * these routes exist to exercise the legacy-container container (§2 of
 * ANGULAR_SHELL_COEXISTENCE_PLAN.md), not to replace or resemble the
 * federation demo pages above.
 *
 * `/legacy-page.aspx` deliberately embeds the same `data-angular-feature`
 * contract the real host pages use, to prove the combined flow: AngularShell
 * -> iframe -> legacy page -> the existing federation shell -> a provider.
 */
const LEGACY_NAV = `
      <a href="/default.asp">/default.asp</a>
      <a href="/legacy-page.asp">/legacy-page.asp</a>
      <a href="/legacy-page.aspx">/legacy-page.aspx</a>`;

const LEGACY_STYLES = `
      body { margin: 0; font-family: system-ui, sans-serif; background: #fffbea; }
      .chrome { background: #7a4b00; color: #fff; padding: 0.75rem 1.25rem; display: flex; gap: 1.25rem; align-items: baseline; flex-wrap: wrap; }
      .chrome a { color: #ffe2ad; font-size: 0.875rem; }
      main { margin: 1rem; max-width: 44rem; }
      form { margin: 1rem 0; }
      #angular-page-host { margin-top: 1.5rem; border-top: 1px dashed #cbb; padding-top: 1rem; }
`;

function renderLegacyChrome(title, bodyHtml) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${htmlEncode(title)} — legacy simulator</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>${LEGACY_STYLES}</style>
  </head>
  <body>
    <div class="chrome">
      <strong>${htmlEncode(title)}</strong>
      ${LEGACY_NAV}
    </div>
    <main>
${bodyHtml}
    </main>
  </body>
</html>
`;
}

/**
 * A same-origin popup opened from a direct click, and a same-origin download
 * link — both exist to be exercised by an automated test, not by a human
 * reading this simulator.
 */
function renderDefaultAsp() {
  return renderLegacyChrome(
    'Legacy application home (/default.asp)',
    `      <p>Stands in for the real ASP Classic entry page loaded into legacy-container's iframe.</p>
      <form method="post" action="/default.asp">
        <label>Postback-style form <input name="q" autocomplete="off" /></label>
        <button type="submit">Submit</button>
      </form>
      <p>
        <a href="#" id="popup-link" onclick="window.open('/legacy-page.asp?popup=1','_blank','width=420,height=320'); return false;">Open popup</a>
        &nbsp;|&nbsp;
        <a href="/downloads/sample.txt" id="download-link" download>Download sample file</a>
      </p>`
  );
}

function renderLegacyAsp(query) {
  const isPopup = query.get('popup') === '1';
  return renderLegacyChrome(
    isPopup ? 'Popup (/legacy-page.asp)' : 'Classic ASP page (/legacy-page.asp)',
    isPopup
      ? `      <p>Opened as a popup from a direct click on /default.asp.</p>`
      : `      <p>Stands in for an ordinary Classic ASP page reached by ASP-to-ASP navigation.</p>`
  );
}

function renderLegacyAspx() {
  return renderLegacyChrome(
    'ASPX page (/legacy-page.aspx)',
    `      <p>Stands in for an ASPX page reached by ASP-to-ASPX navigation. It also hosts a
      federated Angular feature through the existing, unmodified shell contract:</p>

      <main id="angular-page-host" data-angular-feature="pricing-search">
        <ca-pricing-search customer-id="1001"></ca-pricing-search>
      </main>

      <script type="application/json" id="angular-bootstrap-context">
        { "assetBasePath": "/ui" }
      </script>
      <script type="esms-options">{ "shimMode": true }</script>
      <script type="module" src="/ui/shell/current/polyfills.js"></script>
      <script type="module-shim" src="/ui/shell/current/main.js"></script>`
  );
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

/**
 * Serves legacy-container's published `current` pointer at `/AngularShell/*`
 * — unversioned in the URL, matching the IIS layout in
 * ANGULAR_APP_SHELL_ARCHITECTURE.md §11-12 (`/AngularShell/index.html`, not
 * `/AngularShell/current/index.html`).
 *
 * Unlike the shell (unhashed filenames by design — see the `serveStatic`
 * mutability comment above), legacy-container is built with content-hashed
 * JS/CSS, so only `index.html` and the unhashed `favicon.ico` need to
 * revalidate; the hashed chunks are genuinely immutable even though the
 * `current` pointer they live under can be replaced by a promotion.
 */
function serveContainerStatic(res, filePath, relative) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    return res.end('not found');
  }
  const mutable = relative === 'index.html' || relative === 'favicon.ico';
  res.writeHead(200, {
    'content-type': MIME[path.extname(filePath)] ?? 'application/octet-stream',
    'cache-control': mutable ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  fs.createReadStream(filePath).pipe(res);
}

/**
 * Whether `resolved` is contained within `base`. Prefix-string comparison
 * (`resolved.startsWith(base)`) is unsound: a sibling directory whose name
 * merely starts with the same characters — base `publish/ui` and a crafted
 * path resolving to `publish/ui-evil/secret` — passes a naive startsWith
 * check without being inside `base` at all. `path.relative` is exact.
 *
 * Escaping is specifically "the relative path IS `..`, or starts with a
 * `..` SEGMENT" (`'..' + path.sep`) — not "the string starts with the two
 * characters `..`". The latter would also reject a real, legitimate file
 * inside `base` whose name happens to start with dots, e.g. `..hidden` or
 * `...archive` — those produce a relative path like `'..hidden'`, which
 * starts with the characters `..` but is not a `..` segment at all.
 */
function isContainedPath(base, resolved) {
  const rel = path.relative(base, resolved);
  const escapes = rel === '..' || rel.startsWith('..' + path.sep);
  return !escapes && !path.isAbsolute(rel);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname.startsWith('/ui/')) {
    const relative = pathname.slice('/ui/'.length);
    const resolved = path.join(publishRoot, relative);
    // Contain traversal: a crafted path must not escape the published tree.
    if (!isContainedPath(publishRoot, resolved)) {
      res.writeHead(403, { 'content-type': 'text/plain' });
      return res.end('forbidden');
    }
    return serveStatic(res, resolved, relative);
  }

  if (pathname === '/AngularShell' || pathname === '/AngularShell/') {
    return serveContainerStatic(res, path.join(containerPublishRoot, 'current', 'index.html'), 'index.html');
  }
  if (pathname.startsWith('/AngularShell/')) {
    const relative = pathname.slice('/AngularShell/'.length);
    const currentDir = path.join(containerPublishRoot, 'current');
    const resolved = path.join(currentDir, relative);
    if (!isContainedPath(currentDir, resolved)) {
      res.writeHead(403, { 'content-type': 'text/plain' });
      return res.end('forbidden');
    }
    return serveContainerStatic(res, resolved, relative);
  }

  // Legacy application stand-ins hosted by legacy-container's iframe. See the
  // LEGACY_* helpers above for what each one proves.
  if (pathname === '/default.asp') {
    res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
    return res.end(renderDefaultAsp());
  }
  if (pathname === '/legacy-page.asp') {
    res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
    return res.end(renderLegacyAsp(url.searchParams));
  }
  if (pathname === '/legacy-page.aspx') {
    res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
    return res.end(renderLegacyAspx());
  }
  if (pathname === '/downloads/sample.txt') {
    res.writeHead(200, {
      'content-type': 'text/plain; charset=utf-8',
      'content-disposition': 'attachment; filename="sample.txt"',
      'cache-control': 'no-store',
    });
    return res.end('Stand-in download from the legacy application simulator.\n');
  }

  // The landing page hosts no feature, so it exercises the shell's idle path.
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
    return res.end(renderLandingPage());
  }

  const featureKey = pathname.replace(/^\/|\.html$/g, '');
  if (PAGES[featureKey]) {
    res.writeHead(200, { 'content-type': MIME['.html'], 'cache-control': 'no-store' });
    return res.end(renderHostPage(featureKey, url.searchParams));
  }

  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('not found');
});

server.listen(PORT, () => {
  console.info(`[host] listening on http://localhost:${PORT}`);
  console.info(`[host]   http://localhost:${PORT}/                 (shell only, no feature)`);
  for (const key of Object.keys(PAGES)) {
    console.info(`[host]   http://localhost:${PORT}/${key}.html`);
  }
  console.info(`[host]   http://localhost:${PORT}/AngularShell/     (legacy-container, requires 'npm run release:container' first)`);
  console.info(`[host]   http://localhost:${PORT}/default.asp       (legacy simulator, hosted by the AngularShell iframe)`);
});
