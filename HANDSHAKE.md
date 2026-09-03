# Continuation Handshake — Angular + Legacy .NET/IIS POC

Use this document to continue the current work in a new chat. Read `README.md` first; it is the concise source of truth for the implemented architecture and machine setup.

## Current repository state

- Repository: `/Users/srimac/Downloads/angular-nx-federation-poc`
- Branch: `feature/angular-shell-federation-poc`
- HEAD and remote: `a7947f7` (`pushing the url fixes`)
- `README.md` has a new, uncommitted rewrite covering the complete Angular/.NET flow and setup.
- This `HANDSHAKE.md` is being recreated as the continuation note requested by the user.
- Commit `a7947f7` contains the URL-persistence implementation and deleted the previous `HANDSHAKE.md` and `IIS-SPA-INTEGRATION-PLAN.md`. Do not restore the old plan unless the user asks; its frontend-only description is obsolete.

Always inspect `git status` before editing and preserve unrelated user changes.

## What the POC now proves

The browser opens `/AngularShell/`, which is a thin Angular application containing a full-viewport, same-origin iframe. The iframe hosts the existing Classic ASP and ASP.NET Web Forms application from the IIS site root.

A migrated ASPX page can host a federated Angular feature:

1. The ASPX page declares a logical feature key and custom-element tag.
2. It loads the stable federation shell from `/ui/shell/current`.
3. The shell reads `/ui/manifest.json` and loads only the selected provider/page entry.
4. The provider registers the Angular page as a custom element using the shell-owned Angular runtime.
5. The outer `legacy-container` does not load federation code; federation runs inside the legacy iframe document.

Pages are feature libraries; provider applications are deployment units. `pricing-provider` hosts both `pricing-search` and `pricing-details`, demonstrating that many legacy pages do not require the same number of Angular applications.

## Authentication and legacy mechanics

- The harness uses .NET Framework 4.8 Web Forms, Classic ASP, Forms Authentication, ASP.NET StateServer, and an x64 COM bridge.
- `/Login.aspx` intentionally escapes the iframe when authentication is required.
- `/FakeIdp.aspx` is a local identity-provider stub.
- `/Landing.aspx` creates root-path `.LEGACYAUTH` and `ASP.NET_SessionId` cookies and redirects to the configured `LoginDestination`.
- `Web.config` currently sets `LoginDestination` to `/AngularShell/`.
- Web Forms reads StateServer directly. Classic ASP calls `LegacyComBridge.SessionBridge`, which forwards the cookies to local `SessionInfo.ashx` to recover the same identity.
- The harness also exercises Web Forms ViewState/postbacks, Classic ASP form posts, popups, static and Web Forms downloads, logout, and expired-session behavior.

## URL persistence implemented at `a7947f7`

The previous container always reopened `/default.asp` after refresh. That is now fixed without adding a separate URL-sync source file.

- After iframe navigation, the parent becomes `/AngularShell/?path=<encoded legacy URL>`.
- `history.replaceState` updates the current parent entry without adding an extra navigation entry.
- Refresh validates `path` and restores the legacy iframe page, including its query string and fragment.
- No `path` means `/default.asp`.
- Duplicate, malformed, cross-origin, dot-segment, or recursive `/AngularShell` values fall back to `/default.asp`.
- Other parent query parameters are preserved.
- Same-document `hashchange` and `popstate` events are synchronized.
- A previous POST body cannot be replayed after refresh; only the resulting URL can be restored with a GET.
- Invalid user-controlled paths are not included raw in telemetry.

Relevant existing files:

- `apps/legacy-container/src/app/legacy-entry-url.ts`
- `apps/legacy-container/src/app/legacy-application-host.component.ts`
- `apps/legacy-container/src/app/legacy-application-host.component.html`
- Existing unit specs beside those files
- `apps/host-e2e/src/container-e2e/container.spec.ts`

## Verification already completed locally

- Production `legacy-container` build passed.
- `npm test` passed: 56 tool tests, 10 shared-core tests, and 35 legacy-container tests.
- `npm run lint:all` passed; one pre-existing warning remains in `apps/host-e2e/src/support.ts`.
- Chrome container E2E passed all 16 scenarios, including direct `?path=` startup, unsafe-path fallback, navigation synchronization, refresh restoration, and Back/Forward.
- A live browser spike confirmed that parent `replaceState` did not break Chrome's joint iframe Back/Forward history.
- Edge was unavailable on the Mac and still needs verification on Windows.

## Current Windows 11/IIS state

The user has a working `LegacyHarness` IIS site on port `1219`.

- `/AngularShell` is a virtual directory mapped to `C:\WebAssets\AngularShell\current`.
- `/ui` is a virtual directory mapped to `C:\WebAssets\ui`.
- The site root is `C:\WebAssets\LegacyHarness\site`.
- The aliases must be named `AngularShell` and `ui` in commands/API calls, without a leading slash. IIS Manager displays them as `/AngularShell` and `/ui`.
- Earlier leading-slash aliases produced malformed `LegacyHarness//AngularShell` and `LegacyHarness//ui` identities. The user removed those virtual directories with IIS commands and recreated the correct mappings.
- `/AngularShell/` loads successfully.
- The login page escapes the iframe, continues to `FakeIdp.aspx`, and redirects to `/AngularShell/` after sign-in.
- The latest Angular container was rebuilt with `npm run release:container:local` and deployed with `Deploy-AngularShell.ps1`.
- The user was about to verify refresh on the real Windows/IIS site; the result was not explicitly reported before the documentation request.

Do not rerun `New-LegacyHarnessSite.ps1` merely to update Angular. Do not remove or convert any existing IIS application or virtual directory unless the user explicitly approves the exact target.

## Important unresolved port mismatch

`New-LegacyHarnessSite.ps1` defaults to port `8800`, and `LegacyComBridge/SessionBridge.cs` currently hardcodes `http://127.0.0.1:8800/SessionInfo.ashx`. The user's IIS site is on port `1219`.

The Angular container and login redirect can work on `1219`, but the complete Classic ASP → COM → StateServer identity flow is not proven on that port until the bridge endpoint is aligned, the .NET solution is rebuilt, and the COM assembly is registered again. Do not claim the full real-IIS E2E flow passes on `1219` without checking this.

A sensible next implementation would make the bridge endpoint configurable instead of replacing one hardcoded port with another, but discuss the smallest approach with the user before changing code.

## Repeat Angular-container deployment

For a container-only change, the required Windows flow is:

```powershell
npm run release:container:local

.\legacy-harness\deploy\Deploy-AngularShell.ps1 `
  -AngularSource .\publish\angular-shell\current `
  -UiSource .\publish\ui
```

This deployment script mirrors files only. It does not create, delete, or modify IIS applications or virtual-directory definitions.

Do not rerun these for an Angular-container-only update:

- `New-LegacyHarnessSite.ps1`
- `Deploy-LegacyWeb.ps1`
- `Register-ComBridge.ps1`

## Real-IIS verification command

After resolving or consciously excluding the COM port mismatch, run from the repository root on Windows:

```powershell
$env:EXTERNAL_BASE_URL = 'http://localhost:1219'
npx playwright test --config apps/host-e2e/playwright.container.config.mts --project=chrome
```

Then run the `edge` project. The external configuration seeds an authenticated session and runs both the container scenarios and the real-IIS legacy-mechanics scenarios.

## How to collaborate with this user

- Keep instructions simple and give one purposeful step at a time during interactive troubleshooting.
- State what a command is intended to prove or change before asking the user to run it.
- Do not ask the user to transcribe large command output; ask for the specific field or result needed.
- Do not create helper scripts, verification documents, or temporary source files unless requested or clearly approved.
- Prefer direct IIS Manager observations when the user can confirm them faster than another diagnostic script.
- Never remove or alter existing IIS applications as a troubleshooting shortcut.
- Push back on review suggestions that do not fit the architecture; verify them rather than accepting them blindly.
- Preserve the separation between the outer Angular container, the legacy application, and the inner federation shell.
