/**
 * Stand-in for the legacy IIS / ASP.NET application (doc section 11.1).
 *
 * Classic ASPX cannot run on this machine, so this server reproduces the
 * part that actually matters to the architecture: the same-origin topology.
 *
 *   https://application.company.com/
 *   ├── Pricing.aspx            -> legacy-host/pages/Pricing.html
 *   ├── api/                    -> proxied to the BFF
 *   └── ui/
 *       ├── shell/current/      -> published shell artifact
 *       ├── pricing/<version>/  -> immutable published remote versions
 *       └── manifest.json       -> the environment manifest
 *
 * Serving everything from one origin is what removes CORS, cookie and CSP
 * complexity in production (doc section 11.2).
 */
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const PORT = Number(process.env.HOST_PORT ?? 44300);
const BFF_ORIGIN = process.env.BFF_ORIGIN ?? 'http://localhost:7040';

const app = express();

// --- /api -> BFF -------------------------------------------------------
// In production IIS or the reverse proxy does this; the browser only ever
// sees same-origin /api requests.
app.use('/api', async (req, res) => {
  const target = `${BFF_ORIGIN}/api${req.url}`;
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: { 'x-correlation-id': req.header('x-correlation-id') ?? '' },
    });
    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader('content-type', upstream.headers.get('content-type') ?? 'application/json');
    const correlationId = upstream.headers.get('x-correlation-id');
    if (correlationId) res.setHeader('x-correlation-id', correlationId);
    res.send(body);
  } catch (err) {
    console.error('[legacy-host] BFF unreachable', err.message);
    res.status(502).json({
      traceId: 'host-proxy',
      code: 'BFF_UNAVAILABLE',
      message: 'The service is currently unavailable.',
      retryable: true,
      validationErrors: [],
    });
  }
});

// --- /ui -> published static assets ------------------------------------
// Cache policy per doc section 11.3: the manifest and the mutable `current`
// pointer must revalidate; immutable versioned assets are cached for a year.
app.use(
  '/ui',
  express.static(path.join(repoRoot, 'publish', 'ui'), {
    etag: true,
    setHeaders(res, filePath) {
      const relative = path.relative(path.join(repoRoot, 'publish', 'ui'), filePath);
      const isMutablePointer = relative === 'manifest.json' || relative.includes(`shell${path.sep}current`);
      res.setHeader(
        'Cache-Control',
        isMutablePointer ? 'no-cache' : 'public, max-age=31536000, immutable'
      );
    },
  })
);

/**
 * ASPX attribute encoding (doc section 8.3). Values interpolated into markup
 * must be encoded — an unencoded customer id from the query string is a
 * reflected-XSS hole straight into the page.
 */
function htmlEncode(value) {
  return String(value).replace(
    /[<>&'"]/g,
    (c) => `&${{ '<': 'lt', '>': 'gt', '&': 'amp', "'": '#39', '"': 'quot' }[c]};`
  );
}

// --- Migrated page entry points ---------------------------------------
// Each migrated ASP page gets one of these; unmigrated pages are untouched.
// This stands in for Pricing.aspx.cs Page_Load: it resolves host context and
// substitutes it into the page template the way <%= %> expressions would.
app.get(['/Pricing.aspx', '/pricing', '/'], (req, res) => {
  const customerId = req.query.customerId ?? '1001';

  // Non-sensitive bootstrap context only — no tokens, no user profile.
  const bootstrapContext = {
    apiBaseUrl: '/api',
    assetBasePath: '/ui',
    permissions: ['pricing.view'],
  };

  const template = fs.readFileSync(path.join(__dirname, 'pages', 'Pricing.html'), 'utf8');
  const html = template
    .replaceAll('{{CustomerId}}', htmlEncode(customerId))
    .replaceAll('{{BootstrapContextJson}}', JSON.stringify(bootstrapContext));

  res.setHeader('Cache-Control', 'no-store');
  res.type('html').send(html);
});

app.listen(PORT, () => {
  console.info(`[legacy-host] listening on http://localhost:${PORT}`);
  console.info(`[legacy-host]   migrated page  http://localhost:${PORT}/Pricing.aspx?customerId=1001`);
  console.info(`[legacy-host]   manifest       http://localhost:${PORT}/ui/manifest.json`);
});
