# Angular Shell + Federated Feature Builds — Proof of Concept

A working reference implementation of the "Angular Shell + Federated Feature Builds"
plan: incrementally migrating classic ASP pages to Angular, where each migrated page
gets a thin ASPX host that loads one shared Angular shell, and the shell dynamically
loads a domain feature build that registers the page as a custom element.

This POC covers the plan's **foundation release** (section 16.1) and **pilot page**
(section 16.2). It exists to prove the four claims the architecture stands or falls on:

| Claim | How this POC proves it |
|---|---|
| A remote loads without bundling its own Angular runtime | Network trace shows Angular fetched once, from the shell |
| A feature deploys without rebuilding the shell or ASPX | `publish` + `promote` scripts; host page never changes |
| Rollback is a manifest pointer change | `promote-manifest.mjs <feature> <previous-version>` |
| Incompatible remotes are rejected before rendering | Shell refuses a `2.x` contract with no request to the remote |

Federation uses **Native Federation** (esbuild-based) rather than the webpack-based Nx
Module Federation named in the source document — see [Deviations](#deviations-from-the-document).

## Prerequisites

Node 22+. No .NET or IIS required (see [Deviations](#deviations-from-the-document)).

```bash
npm install
```

## Run it

Build and publish the artifacts, then start the servers:

```bash
npm run build:all && node tools/publish-artifact.mjs shell 0.1.0 && node tools/publish-artifact.mjs pricing 1.0.0
```

```bash
node apps/bff/main.js
```

```bash
node legacy-host/server.js
```

Then open the migrated page:

```bash
open http://localhost:44300/Pricing.aspx?customerId=1001
```

You should see a pricing table rendered inside legacy page chrome. Open the console to
watch the startup telemetry: `shell.start` → `shell.manifest.loaded` →
`shell.remote.load.success` → `shell.feature.registered` → `feature.page.ready`.

For iterative development with live reload, `npm start` runs the shell (4200), the
pricing remote (4201) and the BFF (7040) together.

## What happens when that page loads

1. The browser requests `/Pricing.aspx`, which returns static HTML — the legacy app
   renders the `<ca-pricing-page>` tag, a `data-angular-feature="pricing"` marker and a
   non-sensitive bootstrap JSON block. It names no version and no remote URL.
2. `AngularHost.Master`'s single script reference loads the shell from
   `/ui/shell/current/main.js`.
3. The shell reads the feature key, fetches `/ui/manifest.json`, and validates the entry
   — including rejecting an incompatible contract version before any remote is contacted.
4. The shell initializes Native Federation for the one selected remote, then creates a
   single Angular application environment (no root component).
5. The shell loads the remote's `./register` module and calls `register()`, passing its
   own injector.
6. The remote creates a child `EnvironmentInjector` and defines `<ca-pricing-page>`. The
   browser upgrades the tag already in the document.
7. The page calls the BFF, which calls the (mocked) COM Bridge, maps XML to JSON, and
   returns the page contract.

## Layout

```
apps/
  shell/                 Dynamic federation host. Loader, manifest handling,
                         compatibility gate, telemetry, fallback UI.
  pricing-remote/        Pilot domain remote. Exposes only ./register.
  bff/                   Mock BFF: COM Bridge simulation, XML→JSON mapping,
                         stable error contract.
libs/platform/contract/  The only compile-time contract shared between
                         shell and remotes.
legacy-host/
  server.js              Stands in for IIS: same-origin /ui, /api, page routes.
  pages/Pricing.html     The rendered output of Pricing.aspx.
  reference/             The real ASPX artifacts (.Master, .aspx, .aspx.cs).
tools/
  publish-artifact.mjs   Publish to an immutable versioned path + metadata.
  promote-manifest.mjs   Validate and atomically promote a feature version.
  verify-bundle.mjs      Build gate: no duplicated Angular runtime.
publish/ui/              The deployed asset tree. Artifacts are build output
                         (git-ignored); manifest.json is tracked.
```

## The two mechanisms worth understanding

### The runtime manifest is the deployment control plane

`publish/ui/manifest.json` maps a logical feature key to a specific published version:

```json
"pricing": {
  "remoteEntry": "/ui/pricing/1.0.0/remoteEntry.json",
  "elementName": "ca-pricing-page",
  "contractVersion": "1.x",
  "enabled": true
}
```

Nothing else in the system names a feature version — not the shell build, not the ASPX
page. Releasing and rolling back are the same operation against this file:

```bash
node tools/promote-manifest.mjs pricing 1.1.0
```

Promotion is refused unless the artifact exists at its immutable path, its checksums
still match, its contract major matches the shell's, and its Angular version matches the
deployed shell's. The write itself is a temp-file rename, so no request ever reads a
partial manifest.

### One Angular runtime, enforced by a build gate

A remote that ships its own Angular still *works* in isolation, so this failure is
invisible until two runtimes are live in one page and DI or change detection breaks in
ways that are painful to diagnose. `tools/verify-bundle.mjs` is the gate:

```bash
node tools/verify-bundle.mjs dist/apps/pricing-remote/browser
```

It checks that Angular and RxJS are declared shared/singleton/strictVersion, that no
chunk imports a shared package by relative path (bypassing the import map), and that
every Angular package the remote imports is actually declared shared.

Verified at runtime: loading the page fetches `@angular/core`, `@angular/common`,
`@angular/common/http` and `@angular/platform-browser` exactly once each, all from
`/ui/shell/current/`. The remote contributes only `@angular/elements`, which the shell
does not use.

## Two integration details that are easy to get wrong

**The host page must use `type="module-shim"`.** Native Federation installs the
shared-dependency import map at runtime through es-module-shims. A plain
`<script type="module">` bypasses the shim and every bare Angular specifier fails to
resolve. `AngularHost.Master` emits the `esms-options` block, the polyfill, and the
shim-typed shell reference.

**The shell resolves its own federation metadata from its asset URL, not the document.**
The shell lives at `/ui/shell/current/` but is hosted by pages at arbitrary paths, so it
derives its base from `import.meta.url`. Resolving against the host document looks for
`remoteEntry.json` next to `/Pricing.aspx` and fails.

Relatedly, `apps/shell/src/main.ts` must not import the contract package as a *value* —
it runs before the import map exists. It re-declares the contract major locally, and
`tools/contract-consistency.test.mjs` enforces that the duplicate stays in sync.

## Tests

```bash
npm test
```

Covers XML→JSON mapping including single-item, empty and malformed responses
(the logic migrated out of XSL), and the contract-consistency checks described above.

Fault injection for resilience paths, via reserved customer ids:

| Request | Result |
|---|---|
| `/api/pricing/5555` | 404 `PRICING_CUSTOMER_NOT_FOUND`, not retryable |
| `/api/pricing/9998` | 504 `PRICING_NOT_AVAILABLE`, retryable — bridge timeout |
| `/api/pricing/9999` | 502 `PRICING_NOT_AVAILABLE`, retryable — malformed XML |
| `/api/pricing/abc` | 400 `PRICING_INVALID_REQUEST` with validation errors |

Every response carries a `traceId`, echoed in the `x-correlation-id` header.

## Deviations from the document

**Native Federation instead of Nx webpack Module Federation.** The document references
webpack Module Federation and `remoteEntry.js`. This POC uses
`@angular-architects/native-federation`, which is esbuild-based and matches where the
Angular CLI has moved. The architecture is unchanged — the manifest maps a feature key to
a remote entry URL, dependencies are shared singletons, and the remote exposes one
registration module. The differences are that metadata is `remoteEntry.json` rather than
`remoteEntry.js`, sharing is configured in `federation.config.mjs` via `shareAll`, and
the host page needs the es-module-shims setup described above. The document's
`import: false` guidance has no direct equivalent; singleton negotiation plus the bundle
gate serve the same purpose.

**The BFF is Node/Express, not .NET.** The .NET SDK is not available on this machine. The
structure mirrors the document's design — COM Bridge client, XML deserialization and
mapping, orchestration, endpoint, normalized errors — so it ports to ASP.NET Core
directly. The COM Bridge itself is mocked; it returns realistic legacy-shaped XML so the
mapping layer is genuinely exercised.

**The ASPX host is simulated.** Classic ASPX needs IIS. `legacy-host/reference/` holds
the real `.Master`, `.aspx` and `.aspx.cs` files; `legacy-host/pages/Pricing.html` is
what that page renders to, and `legacy-host/server.js` reproduces the same-origin
topology (`/ui`, `/api`, cache headers) that IIS or the reverse proxy would provide.

## Not yet covered

Scoped to the foundation and pilot page, this POC does not implement: a second domain
remote, CI/CD pipeline definitions (sections 13.1–13.3), automated accessibility and
performance budget gates, manifest signing, authentication/authorization (the BFF
documents where it belongs but does not enforce it), or E2E browser tests. The
per-page migration checklist in section 16.4 is also not yet mechanized.
