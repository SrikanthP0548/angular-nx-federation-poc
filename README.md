# Nx + Angular Custom Elements — Lazy ASPX Integration POC

A clean reference implementation for incrementally placing Angular pages inside
an existing server-rendered application. It uses Nx for source architecture,
Angular Elements for the HTML boundary, and ordinary dynamic imports for
page-level lazy loading.

There is deliberately no Module Federation, remote provider, runtime manifest,
import map, or independent feature deployment in this version.

## Architecture

| Unit | Count here | Responsibility |
|---|---:|---|
| Loader application | 1 | Finds the requested feature and owns the Angular environment |
| Page library | 4 | Implements one migrated page |
| Platform library | 1 | Defines tokens, page contracts, and Custom Element lifecycle |
| Data-access library | 1 | Shares pricing models and data between two pages |
| E2E application | 1 | Verifies the built artifact from a browser |

The host document supplies a feature key and the corresponding custom-element
tag. The loader resolves that key through a compile-time registry. Every
registry entry is a dynamic import, so all pages are part of one coordinated
build while only the requested page is downloaded at runtime.

An unmigrated page may include the same loader. Because the stable entry has no
Angular imports, it exits before downloading Angular or page code when no
feature host exists.

## Runtime sequence

1. The host returns HTML containing one `data-angular-feature` region.
2. One stable module script loads `/ui/current/main.js`.
3. The framework-free entry validates the feature key against the lazy registry.
4. It dynamically loads the Angular bootstrap only when a feature is present.
5. The bootstrap creates one Angular application environment without a root component.
6. Runtime configuration and telemetry are provided through the parent injector.
7. The selected registry entry dynamically imports one page library.
8. A child environment injector is created for that page.
9. Angular Elements defines the tag and the browser upgrades the existing element.

## Workspace layout

```text
apps/
  elements-loader/          stable loader, lazy registry, bootstrap, telemetry, fallback
  host-e2e/                 browser architecture and behavior tests
libs/
  platform-core/            page contract, injection tokens, element registrar
  features/                 one Nx library per migrated page
  data-access/pricing/      shared pricing models and service
tools/
  host-simulator/           same-origin stand-in for the server-rendered host
```

## Nx boundaries

- The loader may compose page libraries through the designated lazy registry.
- A page library cannot import another page library.
- Pages may depend on data-access, platform, UI, and utility libraries.
- Data-access cannot depend on pages or the loader.
- Platform core is the bottom of the application dependency graph.

These are source-code rules. Runtime selectivity comes from the explicit dynamic
imports in the feature registry.

## Registration lifecycle

The platform registrar guarantees that concurrent requests for one tag share a
single registration, successful registration is idempotent, a rejected attempt
can be retried, and a tag defined by unrelated code is rejected as a collision.

A child injector is destroyed when registration fails before
`customElements.define()`. Once the tag is defined, registration is irreversible
and its injector intentionally lives for the document lifetime.

## Run and verify

```bash
npm install
npm test
npm run lint
npm run build
npm run test:e2e
```

To inspect the built integration manually:

```bash
npm run build
npm run start:host
```

Open `http://127.0.0.1:44300/`. The landing page loads only the small stable
loader. Opening a feature page downloads Angular, that page implementation, and
only the shared libraries it uses.

Each feature has a thin, explicitly named lazy-build boundary, so its owned
artifact starts with the registry key: `pricing-search-*`, `pricing-details-*`,
`feature-two-*`, or `feature-three-*`. Chunks used by multiple features retain a
neutral `chunk-*` name because no single feature owns them.

## What browser tests enforce

- The landing page downloads only `main.js` and no Angular/page implementation.
- Every migrated page renders from the single application artifact.
- Every page implementation is emitted with its feature key as the filename prefix.
- Pricing Search never downloads Pricing Details and vice versa.
- Both pricing pages reuse the same extracted data-access chunk.
- No manifest, `remoteEntry.json`, or federation import map is requested.
- Unknown features, host/tag mismatches, and foreign element collisions render a fallback.
- Host-provided values are HTML-encoded.
- Lazy pages resolve platform configuration from the loader-owned injector.

## Scaling the registry

For a production migration, an Nx generator should create a page library and
its validated registry entry together. Registry tests should reject duplicate
feature keys and element names. This keeps the explicit mapping auditable while
allowing hundreds of page libraries to remain independently lazy.

## Future SPA migration

The page components are ordinary Angular components; Custom Elements are only
the current host adapter. A future Angular SPA can route directly to the same
page libraries. Module Federation can be introduced later if runtime composition
or independent deployment becomes a real requirement.
