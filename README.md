# Angular Shell + Federated Feature Providers — Proof of Concept

A working reference implementation of the incremental-migration architecture: a thin
Angular shell, loaded by an ordinary host page, dynamically loads a feature provider that
registers the page as a custom element. Feature versions are routed by a runtime manifest.

The question this exists to answer is **whether migrating 150 pages means building 150
applications.** It does not:

| | Role | Count here | Count for 150 pages |
|---|---|---|---|
| **Feature library** | implementation unit — one per page | 4 | ~150 |
| **Provider app** | deployment unit — produces `remoteEntry.json` | 3 | ~8–15 |
| **Shell** | runtime owner and composition layer | 1 | 1 |
| **Manifest entry** | rollout and rollback unit | 4 | ~150 |

Pages are libraries. Apps exist only where something must be deployed independently. The
`pricing-provider` demonstrates this directly: it serves **two** pages from one artifact,
and loading one never downloads the other.

## Prerequisites

Node 22+. Chrome for the E2E suite. Edge is configured but **not installed on this
machine** — `npx playwright install msedge` adds it, after which `npm run test:e2e:all`
covers both browsers. `npm run test:e2e` runs Chrome only, so the default suite is green
without that install rather than silently falling back to Chromium.

```bash
npm install
```

## Run it

```bash
ARTIFACT_VERSION=1.0.0 npm run release
```

```bash
node tools/promote-manifest.mjs pricing-search 1.0.0 && node tools/promote-manifest.mjs pricing-details 1.0.0 && node tools/promote-manifest.mjs feature-two 1.0.0 && node tools/promote-manifest.mjs feature-three 1.0.0
```

```bash
npm run start:host
```

Then open http://localhost:44300/ — the landing page. It loads the shell like every other
host page, but hosts no feature element, so the shell finds nothing to do and stops. A
panel at the bottom lists every JavaScript file the page actually downloaded, grouped by
which published artifact served it: three shell files, nothing else. Click any menu item
and the panel updates to show that page's provider files appear, and only that page's —
`pricing-search` never pulls in `pricing-details`, `feature-two`, or `feature-three`.

The same claim is enforced in `apps/host-e2e/src/deferred-loading.spec.ts`, checked against
the network rather than the panel's own report of itself.

## What happens when a page loads

1. The host returns static HTML naming a feature key (`data-angular-feature`) and a custom
   element tag. It names **no version and no provider URL**.
2. One stable script reference loads the shell from `/ui/shell/current/main.js`.
3. The shell fetches `/ui/manifest.json`, validates the entry, and rejects an incompatible
   contract version before contacting the provider.
4. It initialises Native Federation for that one provider and creates a single Angular
   environment — no root component.
5. It loads the provider's `./register` module and calls it with its own injector.
6. The provider looks the element name up in its page registry, **dynamically imports only
   that page**, creates a child `EnvironmentInjector`, and defines the custom element.
7. The browser upgrades the tag already in the document.

## Layout

```
apps/
  shell/                     dynamic host: manifest handling, compatibility gate,
                             telemetry, fallback UI
  providers/                 deployment units — federation config, page registry,
    pricing-provider/          register adapter, pages.json. No feature code.
    feature-two-provider/
    feature-three-provider/
  host-e2e/                  architecture tests against published artifacts
libs/
  features/                  one library per page
    pricing-search/            \ both deployed by pricing-provider
    pricing-details/           /
    feature-two/
    feature-three/
  data-access/pricing/       shared by both pricing pages
  shared/core/               the contract, the tokens, and createFederatedFeature
tools/
  federation-sharing.mjs     the single definition of what is shared
  publish-artifact.mjs       immutable publish + metadata + checksums
  promote-manifest.mjs       validated, atomic promotion
  verify-bundle.mjs          federation build gate
  host-simulator/            static host serving /ui and one page per feature
publish/ui/                  deployed asset tree; artifacts are build output
                             (git-ignored), manifest.json is tracked
```

## The mechanisms that matter

### Per-page exposed keys are the late-binding seam

Each page a provider hosts gets its own federation `exposes` entry, pointing at a thin
registration file:

```js
// apps/providers/pricing-provider/federation.config.mjs
exposes: {
  './pricing-search':  './apps/providers/pricing-provider/src/pricing-search.register.ts',
  './pricing-details': './apps/providers/pricing-provider/src/pricing-details.register.ts',
},
```

```ts
// pricing-search.register.ts
export default createFederatedFeature({
  'ca-pricing-search': async () => (await import('@company/features/pricing-search')).PRICING_SEARCH_PAGE,
});
```

The `exposes` **key** — not the source file's name — drives the published filename, so the
artifact carries self-descriptive files rather than a generic one: measured on the built
1.1.0 artifact, `pricing-search-YHCQTVME.js` and `pricing-details-JBXPLBMM.js` are ~300-byte
wrappers; the actual page code sits in its own lazy chunk (4.5 KB for search, 4.1 KB for
details), and the shared data-access code (1.4 KB) is fetched once, from a chunk both pages'
wrappers reference — esbuild builds every `exposes` entry for a provider in one invocation,
so a dynamic import shared across two exposed entries is still deduplicated, not inlined
twice. Loading one page never fetches the other's chunk.

A feature library knows nothing about which provider ships it or which key exposes it, so
regrouping which pages live in which provider doesn't touch the library — which is why page
libraries are forbidden from importing each other (below): a page with no sibling coupling
can be regrouped freely. Moving a page to a different provider is a contained, mechanical
change, but no longer a one-liner: a new `exposes` entry (and provider, if a new one) at the
destination, the `*.register.ts` file moved there, the `pages.json` entry moved from the old
provider's descriptor to the new one, and the manifest's `remoteEntry`/`artifact`/
`exposedModule` repointed.

### The manifest is the deployment control plane

Nothing else names a feature version — not the shell build, not the host page. Releasing
and rolling back are the same operation:

```bash
node tools/promote-manifest.mjs pricing-search 1.1.0
```

Promotion is refused unless the artifact exists at its immutable path, its checksums still
match, it actually serves that feature key and element name, its contract major matches the
shell's, and its Angular version matches the deployed shell's. The write is a temp-file
rename, so no request ever reads a partial manifest.

Because `artifact` decouples the feature key from the published directory, two feature keys
can point at **different versions of the same provider artifact** — demonstrated below.

### One Angular runtime, enforced

Sharing is one list in `tools/federation-sharing.mjs`, consumed by the shell config, all
three provider configs and the verify gate — five consumers, one definition, so a one-sided
allowlist is impossible.

Two failure directions, both invisible at build time:

- **A workspace library silently shared.** Native Federation shares *every*
  `tsconfig.base.json` path entry unless `sharedMappings` is set. Without the allowlist all
  four workspace libraries become strict-version singletons pinned to `0.0.0`.
- **`shared-core` *not* shared.** Its `InjectionToken`s are compared by identity, so a
  second copy makes every `inject(RUNTIME_CONFIG)` in a provider throw `NullInjectorError`
  at first render — from a completely clean build.

`node tools/verify-bundle.mjs` fails on both, plus any bare specifier the import map cannot
resolve, across all four artifacts.

## Verified

Run `npm test` (23 unit tests), `npm run lint:all`, and `npm run test:e2e` (27 specs).

- **Nothing loads until a feature is requested.** The landing page downloads the shell and
  nothing else — no manifest fetch even, since the shell returns as soon as it finds no
  `data-angular-feature` element. Navigating to a feature page downloads that provider's
  files and no other provider's; navigating between the two pricing pages swaps one page
  chunk for the other without ever fetching both.
- **One runtime, cold cache.** Every framework file is fetched from `/ui/shell/current/`,
  never a provider path, on all four pages — asserted per file, since Angular legitimately
  ships several secondary entry points.
- **Lazy per-page loading, by response body.** Federation chunks are content-hashed
  anonymous names, so filenames prove nothing; each page's unique tracer string must be
  absent from every chunk the sibling page downloads.
- **Failure paths** produce the fallback with a trace ID, never a blank page: unknown
  feature key, disabled feature, incompatible contract (asserted to make *no* provider
  request), unreachable provider, unsupported schema, and a foreign custom-element
  collision.
- **Registration lifecycle** (10 tests): concurrent calls share one promise, a rejection is
  evicted so retry works, a foreign tag is a collision, the injector is destroyed only on
  the pre-commit path, and a logger that throws *after* `define()` cannot undo a committed
  registration. Each was confirmed to fail when its rule is removed.
- **Dependency boundaries** fire — verified by temporarily importing a page from another
  page, and a page from the shell.
- **Independent provider deployment**: publishing and promoting one provider leaves the
  others on their previous artifacts.
- **Independent per-page promotion**: `pricing-search` and `pricing-details` were promoted to
  different versions of the `pricing` artifact — each page fetched only from its own version
  path and rendered correctly, and rolling one back left the other untouched. Works because
  the manifest tracks `featureVersion` per feature key, not per artifact.
- **Per-page addressability at the network level**: the two pricing pages fetch different,
  self-descriptively-named exposed entry files (`pricing-search-*.js` / `pricing-details-*.js`)
  rather than funneling through one generic entry — and still share the same data-access
  chunk, fetched once, proven by URL equality rather than tracer-string inference.

## Guarantees and their limits

**Rollout and rollback are independent per page; builds are not.** The two pricing pages
share one artifact, so changing the search page rebuilds the artifact containing the details
page — the details page simply is not promoted. Splitting a page into its own provider later
is a contained, mechanical move — not a one-liner — covered above under "Per-page exposed
keys are the late-binding seam."

**The shell loads exactly one feature provider per document.** Two feature keys may point at
different versions of the same remote across separate documents; they cannot coexist in one.

**Provider artifacts do contain Native Federation fallback bundles of Angular.** That is by
design and cannot be suppressed — there is no `import: false` equivalent, and using `skip`
is worse because the package stops being shared and gets inlined. The enforceable guarantee
is the runtime one: negotiation resolves every framework and shared-core package to the
shell-owned copy, asserted by cold-browser tests.

**Publishing requires a build in the same execution.** `BUILD_RUN_ID` is required rather
than defaulted, because a per-process fallback would match only itself. Verified to fail
closed on a missing marker, a marker from another run, and no id at all. This matters: while
verifying the bundle gate, a broken config made a build fail, the old `dist/` survived, and
the gate passed against the stale artifact.

## Two integration details that are easy to get wrong

**The host page must load the shell as `type="module-shim"`.** Native Federation installs
the shared-dependency import map through es-module-shims; a plain `type="module"` bypasses
the shim and every bare Angular specifier fails to resolve. The host pages emit the
`esms-options` block, the polyfill, and the shim-typed reference.

**The shell resolves its own federation metadata from `import.meta.url`,** not the document.
It lives at `/ui/shell/current/` but is hosted by pages at arbitrary paths, so resolving
against the document looks for `remoteEntry.json` next to the host page and fails.

Related: `apps/shell/src/main.ts` must not import `shared-core` as a *value* — it runs before
the import map exists. It re-declares the contract major locally, and
`tools/contract-consistency.test.mjs` enforces that the duplicate stays in sync.

## Deviations and scope

**Native Federation instead of webpack Module Federation.** esbuild-based, matching where the
Angular CLI has moved. Metadata is `remoteEntry.json`; sharing is configured in
`federation.config.mjs`; the host page needs the es-module-shims setup above.

**Replacing `shareAll()` with an explicit allowlist has a cost worth knowing.** A shared
bundle's own static imports must resolve through the import map, and pruning is by usage in
*application* code — the wrong question. `@angular/platform-browser` imports
`@angular/common/http`, and `@angular/core` imports `rxjs/operators`, in paths this app never
executes. Both surfaced only at runtime, which is why `verify-bundle.mjs` now checks every
bare specifier against the import map.

**Frontend only.** No BFF, COM Bridge, XML, .NET, IIS, authentication or ASPX. Feature data
is in-memory. A previous iteration with a mock BFF (XML→JSON mapping, 7 tests) and an ASPX
host simulation is preserved at tag `poc-with-bff-and-aspx-host`.

**Not covered:** CI/CD pipeline definitions, accessibility and performance budget gates,
manifest signing, and authorization.
