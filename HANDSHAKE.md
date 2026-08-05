# Handshake — Angular Shell + Native Federation POC

Briefing for picking up this project cold in a new chat. Written at commit `0a82619`
on branch `feature/angular-shell-federation-poc`, tree clean, all tests green.

## What this is

A proof-of-concept answering one question: **migrating ~150 legacy ASP pages to Angular
does not require 150 Angular apps.** Apps are deployment units; pages are libraries; one
provider app can serve several pages. The architecture is one shell + a handful of thin
"provider" apps (Native Federation remotes) + one library per page, wired together by a
runtime manifest.

No backend, BFF, ASPX, or authentication in this branch — frontend architecture only, with
in-memory fixture data. An earlier iteration with a mock BFF (XML→JSON mapping) and an ASPX
host simulation is preserved at git tag `poc-with-bff-and-aspx-host` if that context is ever
needed again; it is not part of this branch's history.

**Start here for the full picture:** `README.md` in the repo root. It documents the
architecture, every verified guarantee (with how it was verified), the deviations from the
original planning document, and a troubleshooting section. This handshake doc is a
narrower "what just happened and what to know before touching it" briefing — README is the
source of truth for how the system works.

## Current structure

```
apps/
  shell/                        the one shell app, Native Federation dynamic host
  providers/
    pricing-provider/           hosts 2 pages: pricing-search, pricing-details
    feature-two-provider/       hosts 1 page
    feature-three-provider/     hosts 1 page
  host-e2e/                     Playwright specs against published artifacts (not the dev server)
libs/
  features/
    pricing-search/, pricing-details/, feature-two/, feature-three/   one lib per page
  data-access/pricing/          shared by the two pricing pages
  shared/core/                  @company/shared-core — the ONE workspace federation singleton
tools/
  host-simulator/                static server: /ui tree + one host page per feature
  publish-artifact.mjs, promote-manifest.mjs, provider-descriptors.mjs, verify-bundle.mjs,
  federation-sharing.mjs, build-marker.mjs, release-helpers.mjs   — the whole release pipeline
```

Each provider's `pages.json` is the machine-readable descriptor of what it serves
(`schemaVersion: "1.1"` — per-page `exposedModule`, not provider-level). Each provider's
`federation.config.mjs` `exposes` map has one key per page it hosts, and that key — not the
source filename — is what determines the published filename
(`pricing-search-<hash>.js`, not a generic `register-<hash>.js`).

## How to run things

```bash
npm start                                  # dev: shell:4200, pricing:4201, feature-two:4202, feature-three:4203
npm run build:all                          # production build, all 4 artifacts
ARTIFACT_VERSION=x.y.z npm run release      # build + stamp + publish all 4 (needs a clean git tree)
node tools/promote-manifest.mjs <featureKey> <version>   # point a feature at a published version
node tools/verify-bundle.mjs               # sharing-allowlist gate (fails if a feature lib leaks into `shared`)
npm test                                   # 36 unit tests (tools/*.test.mjs + shared-core)
npx nx e2e host-e2e                        # 27 Playwright specs, Chrome + Edge, against published artifacts
node tools/host-simulator/server.js        # serves the published /ui tree + host pages on :44300
```

`npm run release` **requires a clean git working tree** (publish-artifact.mjs checks
`git status --porcelain`, excluding `publish/ui/manifest.json` itself since that file is
release *output*, not a build input). Use `ALLOW_DIRTY_PUBLISH=1` for local iteration before
committing — it publishes but honestly records `dirty: true` in `build-metadata.json` rather
than silently attributing the artifact to a stale clean commit.

**Current published state:** all four features (`pricing-search`, `pricing-details`,
`feature-two`, `feature-three`) promoted to `1.3.0`, shell `1.3.0`, commit `0a82619`,
`dirty: false`. Host simulator is running at `http://localhost:44300/`.

## Key design decisions worth knowing before changing anything

- **`libs/shared/core`** is the *only* workspace library allowed in the federation
  `sharedMappings` allowlist (`tools/federation-sharing.mjs`). Native Federation shares
  *every* `tsconfig.base.json` path entry as a singleton unless `sharedMappings` is
  explicitly set — this allowlist exists to prevent a new feature lib from silently becoming
  a strict-version singleton. If you add a library, don't add it here unless it truly needs
  cross-artifact identity (e.g. holds `InjectionToken`s).
- **Per-page exposed keys, not a shared registry.** `pricing-provider` exposes
  `./pricing-search` and `./pricing-details` as two federation entries, each a thin file
  calling `createFederatedFeature()` with a single-entry map. `feature-two`/`feature-three`
  providers still use the older registry-indirection pattern internally (`register.ts` +
  `page-registry.ts`) since they only host one page each — both shapes are handled by
  `tools/provider-descriptors.mjs`'s validation.
- **`createFederatedFeature()`** in `libs/shared/core/src/lib/create-federated-feature.ts` is
  the shared registration lifecycle used by every provider. It's the most carefully-built
  part of this codebase — handles concurrent registration (in-flight promise map), retry
  after failure (evicts on rejection), foreign custom-element collisions, a hard commit point
  at `customElements.define()` after which nothing may fail, and injector cleanup that's
  scoped correctly (destroyed on pre-commit failure only, alive for the document lifetime
  after a successful commit — there's no `dispose()`, deliberately, since custom elements
  can't be unregistered). Read the comment block at the top of that file before modifying it.
- **The shell loads exactly one feature provider per document.** Two feature keys can point
  at different versions of the same remote across separate documents; they cannot coexist in
  one. This is a real, documented architectural limit, not an oversight — see "Important
  architectural limitation" in the README if multi-widget-per-page ever becomes a
  requirement.

## Recent history (four phases, in order)

1. **Restructure** (`0d019d2`..`849a3f3`): went from one app per page
   (`apps/pricing-remote`) to thin provider apps + one library per page. This is the change
   that actually answers the "150 pages ≠ 150 apps" question.
2. **Per-page exposed keys** (`e74e5e0`): `./register` (one key, internal dispatch) →
   `./pricing-search` + `./pricing-details` (one key per page). Motivated by wanting
   readable, addressable build output filenames. Verified from Native Federation's own
   source (not assumed) that this doesn't duplicate the shared data-access chunk, since all
   of a provider's `exposes` entries build in one esbuild invocation with splitting enabled.
3. **Release-integrity fixes** (`73b526e`, `24c6f00`, `cbba35b`): a review surfaced four real
   bugs, all fixed and verified:
   - `build-metadata.json`'s checksum was computed but never checked during promotion —
     reproduced the exact attack (redirecting a feature's `exposedModule`) and confirmed it's
     now rejected.
   - No source-provenance gate: an artifact could be published from an uncommitted tree while
     its metadata recorded a stale `HEAD`. Added a clean-tree gate — which then surfaced **a
     second bug**, where publishing the shell (which writes `manifest.json`) made the *next*
     artifact's publish in the same release run see a dirty tree. Fixed by excluding that one
     release-output path from the check.
   - `apps/shell/public/manifest.dev.json` was stale (pre-refactor feature keys). Fixing it
     surfaced **a third, unrelated bug**: `main.ts` computed its own base URL from
     `import.meta.url`, which Angular's Vite-based dev server virtualizes to a malformed
     internal path, breaking `nx serve shell` before Angular ever loaded. Fixed by reading the
     resolved `<script src>` from the DOM instead — verified this works in both `nx serve`
     and the production module-shim path.
   - `shell/current` activation was delete-then-recursive-copy (a real window with missing/
     partial files); now build-in-a-temp-dir plus two atomic renames. `shell.version` in
     `manifest.json` now syncs on shell publish instead of staying static. Global provider
     uniqueness (featureKey/elementName/artifact/remoteName) is now enforced directly in
     `publish-artifact.mjs`, not only via `npm test`.
   - One finding — an esbuild "goroutines are asleep" deadlock reported by the reviewer —
     did **not** reproduce in this environment across many clean rebuilds (esbuild
     wrapper/binary versions and architecture both checked and matched). Documented honestly
     in the README's Troubleshooting section rather than claiming a fix that couldn't be
     verified.
4. **Regression tests for phase 3** (`03a5321`, `0a82619`): none of phase 3's fixes had
   dedicated automated coverage — all had been verified manually. `publish-artifact.mjs` and
   `promote-manifest.mjs` were CLI scripts with the relevant logic inline and no test seam, so
   five functions were extracted into `tools/release-helpers.mjs`
   (`filterReleaseOutputPaths`/`checkWorkingTree`, `verifyChecksums`, `syncShellVersion`,
   `activateShellCurrent`) — behavior-preserving; re-verified with a full clean-tree release +
   promote + E2E cycle after the refactor, not just the new unit tests in isolation.
   `resolveShellBaseUrl` was likewise extracted out of `main.ts` into its own file so it's
   testable with jsdom (already a devDependency) rather than only reachable via a real browser.
   36 unit tests total now (was 24). One test-writing mistake worth knowing about: the first
   version of the `checkWorkingTree` exclusion test asserted the overall `dirty` flag went
   `false`, which implicitly assumed the outer repo had no *other* uncommitted changes at
   test-run time — false while this very work was in progress. Fixed to assert the exclusion
   mechanism directly (the excluded path's status line disappears) plus a separate test against
   a scratch git repo for the end-to-end "excluding everything makes it clean" property.

## Non-obvious lessons worth not re-learning

- `git status --porcelain`'s status-prefix width is **not fixed** — a staged-only change
  reports narrower than a staged-and-modified one. Match paths by suffix (`line.endsWith(path)`),
  not by a fixed column slice.
- A tracked file that tooling legitimately writes as *output* (here, `publish/ui/manifest.json`)
  needs to be excluded from any "is the tree clean" check, or two pieces of otherwise-correct
  tooling will fight each other the moment they run in the same invocation. This only shows up
  when you test the real multi-step workflow, not each piece in isolation.
- `import.meta.url` is not reliable inside Angular's Vite-based dev server for computing a
  script's own base URL — it can resolve to an internal virtual path that looks nothing like
  the browser-visible script URL. Read `document.querySelector('script[src$="..."]')` instead
  when you need the actual resolved URL.
- Native Federation's exposed-entry **filename** is controlled by the `exposes` **key**, not
  the source file's name (confirmed from `bundle-exposed-and-mappings.js` /
  `angular-bundler.js` source). If a filename needs to be readable, rename the key, not the file.
- A test that shells out to check real repo state (`git status --porcelain` against `repoRoot`)
  must not assume the ambient working tree is otherwise clean — it usually isn't, especially
  mid-session. Assert the specific mechanism being tested (does path X's status line disappear
  when excluded) rather than a downstream aggregate (is the tree clean overall), or spin up an
  isolated scratch git repo when the aggregate behavior itself is what needs proving.

## Known, deliberate limitations (not bugs)

- Rollout/rollback are independent per page within a provider; *builds* are not — changing
  one page in `pricing-provider` rebuilds the artifact containing the other page too.
- Moving a page to a different provider is a contained but multi-file change (new `exposes`
  entry, entry file moved, descriptor entry moved, manifest repointed) — not a one-liner.
  An earlier version of the README overclaimed this; it's now corrected.
- Shell publishing activates `shell/current` immediately — there's no separate staged
  "promote the shell" step the way providers have. A reviewer suggested decoupling this to
  match provider deployment; explicitly deferred as out of scope for this POC (flagged as
  desirable, not blocking, by the reviewer's own stated bar).
- `tools/provider-descriptors.mjs` validates `federation.config.mjs` and entry files via
  regex over source text, not an AST or a dynamic import. Works for the two patterns
  currently in use (inline object literal, and registry-indirection) and is covered by
  tests, but would need generalizing if a third registration shape is introduced.
- `tsconfig.base.json` has `strict: false`; new libraries default to `unitTestRunner: none`
  in the Nx generator. Both flagged as things to tighten if this scales beyond a POC.

## Possible next steps

- Actually scale out: add more provider/page pairs toward the ~150-page target, to keep
  proving the pattern holds as it grows rather than just asserting it does.
- Decouple shell publish from shell activation (staged promotion, matching providers).
- Replace descriptor validation's regex approach with AST parsing or a fully declarative
  page descriptor consumed by both runtime and tooling, if a third registration shape shows up.
- The plan file at `/Users/srimac/.claude/plans/i-have-one-quick-snoopy-blanket.md` covers the
  restructure and per-page-exposes phases in detail if you need the reasoning trail; both are
  fully implemented, so it's historical rather than a to-do list at this point.
