# Angular + ASP.NET Legacy Integration POC

This repository demonstrates an incremental migration from Classic ASP and ASP.NET Web Forms to Angular. The legacy application remains responsible for authentication, session state, navigation, postbacks, and downloads. Angular features are introduced page by page without turning every migrated page into a separately deployed application.

## 1. Architecture

### Runtime topology

Everything is served from one IIS site and one browser origin:

| Public path | Physical location | Responsibility |
|---|---|---|
| `/` | `C:\WebAssets\LegacyHarness\site` | Classic ASP, Web Forms, login, session, downloads, and legacy navigation |
| `/AngularShell` | `C:\WebAssets\AngularShell\current` | Thin Angular container that hosts the legacy application in an iframe |
| `/ui` | `C:\WebAssets\ui` | Federation shell, runtime manifest, and versioned feature-provider artifacts |

`AngularShell` and `ui` are IIS virtual directories, not IIS applications. Their aliases are created as `AngularShell` and `ui` without a leading slash; IIS exposes them as `/AngularShell` and `/ui`.

### Components

| Component | Role |
|---|---|
| `legacy-container` | Full-viewport Angular iframe host. It has no federation responsibility. |
| Legacy web application | .NET Framework 4.8 Web Forms plus Classic ASP. It owns Forms Authentication and StateServer session state. |
| Federation shell | Reads the feature marker on an ASPX page, validates the manifest entry, creates the shared Angular runtime, and loads one provider. |
| Provider applications | Deployment units. A provider may package several independently addressable page features. |
| Feature libraries | Implementation units: normally one Angular library per migrated page. |
| Runtime manifest | Maps a logical feature key to its provider version, exposed module, and custom-element name. |
| COM bridge | Lets Classic ASP recover the authenticated ASP.NET StateServer identity. |

### End-to-end page flow

1. The browser opens `/AngularShell/`.
2. `legacy-container` loads `/default.asp`, or the validated URL from `?path=`, in a same-origin iframe.
3. Legacy links, forms, popups, downloads, ASP pages, and ASPX pages continue to operate inside that iframe.
4. A migrated ASPX page declares one feature key and its custom-element tag. It references only the stable federation shell under `/ui/shell/current`; it does not know a provider version.
5. The federation shell reads `/ui/manifest.json`, validates compatibility, and loads only the selected provider and page entry.
6. The provider registers the Angular page as a custom element using the shell-owned Angular runtime.
7. The existing element in the ASPX document upgrades and renders. The outer `legacy-container` never downloads federation code.

The current POC contains four feature libraries and three provider applications. `pricing-provider` proves that one provider can deploy both `pricing-search` and `pricing-details` while each page remains independently addressable and lazily loaded.

### Authentication and session flow

1. An unauthenticated protected request reaches `/Login.aspx`. If it was loaded in the iframe, the login page intentionally promotes itself to the top-level window.
2. `/FakeIdp.aspx` simulates the external identity provider. `/Landing.aspx` creates the `.LEGACYAUTH` and `ASP.NET_SessionId` cookies at path `/`, stores the user and roles in StateServer, and redirects to the configured `LoginDestination`.
3. Web Forms reads the authenticated principal and StateServer session directly. The principal module restores roles from the Forms Authentication ticket.
4. Classic ASP passes the two cookies to the registered `LegacyComBridge.SessionBridge`, which calls the local `SessionInfo.ashx` endpoint and restores the same identity.

`Web.config` currently sends successful login back to `/AngularShell/`. The fake identity provider is test infrastructure only; it is not a production identity solution.

### Navigation and refresh

After an iframe navigation, the container records the current root-relative legacy URL in the parent query string, for example `/AngularShell/?path=%2Flegacy-page.aspx`. It uses `history.replaceState`, so it does not create an extra parent history entry.

On refresh, the container validates `path` and restores that page in the iframe. It preserves the legacy page's query string and fragment. Missing paths open `/default.asp`; duplicate, cross-origin, malformed, or recursive `/AngularShell` paths fall back safely to `/default.asp`. A refresh can restore a URL but cannot replay a previous POST body.

Same-origin hosting is required for iframe URL synchronization and the current framing policy. Authentication and session cookies use path `/`, so both the legacy pages and `/AngularShell` receive them. IIS sends `X-Frame-Options: SAMEORIGIN` and a CSP containing `frame-ancestors 'self'`.

### Deployment boundaries

- `npm run release` builds and publishes the federation shell and providers. Provider versions are immutable; `publish/ui/manifest.json` controls per-feature promotion and rollback.
- `npm run release:container` independently builds and publishes `legacy-container` under `publish/angular-shell/current`.
- `Deploy-LegacyWeb.ps1` builds and replaces only the legacy web root, retaining `site.previous` for rollback.
- `Deploy-AngularShell.ps1` only mirrors the already-published Angular directories. It does not create, remove, or convert IIS applications or virtual directories.

## 2. Machine setup

### Prerequisites

- Node.js 22 and npm.
- Chrome; Edge is required for the Edge test projects.
- For the real harness: Windows 10/11 or Windows Server, Administrator access, IIS, .NET Framework 4.8, and Visual Studio Build Tools with Web Build Tools/MSBuild.
- A clean Git working tree for normal publishing. Published versions are immutable, so use a new SemVer for each release.

### Install dependencies

From the repository root:

```powershell
npm ci
```

### Build and publish the Angular artifacts

Publish the container first:

```powershell
npm run release:container:local
```

For the federation shell and providers on PowerShell, choose a new version:

```powershell
$env:ARTIFACT_VERSION = '1.4.0'
$env:BUILD_RUN_ID = "run-$([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())"
npx nx run-many -t publish -p shell pricing-provider feature-two-provider feature-three-provider

npm run promote -- pricing-search $env:ARTIFACT_VERSION
npm run promote -- pricing-details $env:ARTIFACT_VERSION
npm run promote -- feature-two $env:ARTIFACT_VERSION
npm run promote -- feature-three $env:ARTIFACT_VERSION
```

On macOS or Linux, the equivalent federation release is `ARTIFACT_VERSION=1.4.0 npm run release`, followed by the same four promotion commands with `1.4.0` as the version.

### Run without IIS

For live Angular development, start the federation shell and all three providers
with one command:

```powershell
npm start
```

Open `http://localhost:4200/`. The development-only shell header opens Pricing
by default and switches between Pricing, Feature Two, and Feature Three. The
provider applications run on ports `4201` through `4203` behind the shell and
do not need to be opened directly. This standalone navigation is not included
in the ASPX integration; each migrated ASPX page continues to select exactly
one custom element.

For the published-asset simulation, the Node host serves the Angular container
and lightweight legacy-page stand-ins:

```powershell
npm run start:host
```

Open `http://localhost:44300/AngularShell/`. This mode verifies the container, iframe navigation and refresh, federation loading, lazy providers, popups, downloads, and Back/Forward behavior. It does not replace the real IIS/.NET verification.

### Create the Windows IIS harness once

The checked-in COM bridge calls `SessionInfo.ashx` on port `8800`, so use port `8800` for the complete unmodified harness. If another port is required, update the endpoint in `SessionBridge.cs`, rebuild the solution, and register the rebuilt COM assembly.

Run elevated Windows PowerShell from the repository root:

```powershell
Set-ExecutionPolicy -Scope Process Bypass

.\legacy-harness\deploy\New-LegacyHarnessSite.ps1 -Port 8800

.\legacy-harness\deploy\Deploy-LegacyWeb.ps1 `
  -HarnessRoot .\legacy-harness

.\legacy-harness\deploy\Register-ComBridge.ps1 `
  -HarnessRoot .\legacy-harness

.\legacy-harness\deploy\Deploy-AngularShell.ps1 `
  -AngularSource .\publish\angular-shell\current `
  -UiSource .\publish\ui
```

The setup creates the `LegacyHarness` site and app pool, enables the required IIS features, starts ASP.NET State Service, and creates the `/AngularShell` and `/ui` virtual directories. It refuses to modify or remove an existing IIS application with either name.

Open `http://localhost:8800/AngularShell/`, continue through the fake identity provider, navigate to `/legacy-page.aspx`, and confirm the Angular pricing feature renders inside the legacy page. Navigate again and refresh to confirm the `?path=` URL restores the same iframe page.

### Rebuild and redeploy after changes

For an Angular-container-only change, do not rerun IIS setup, legacy deployment, or COM registration:

```powershell
npm run release:container:local

.\legacy-harness\deploy\Deploy-AngularShell.ps1 `
  -AngularSource .\publish\angular-shell\current `
  -UiSource .\publish\ui
```

For a legacy .NET/ASP change, rerun `Deploy-LegacyWeb.ps1`. Rerun `Register-ComBridge.ps1` only when the COM bridge changes. Rerun `New-LegacyHarnessSite.ps1` only for initial IIS setup or an intentional site/binding change.

### Verification

Run the repository checks:

```powershell
npm test
npm run lint:all
node tools/verify-bundle.mjs
npx nx run host-e2e:e2e
npx nx run host-e2e:e2e-container
```

Run the complete real-IIS suite against the configured site:

```powershell
$env:EXTERNAL_BASE_URL = 'http://localhost:8800'
npx playwright test --config apps/host-e2e/playwright.container.config.mts --project=chrome
```

The real-IIS suite seeds an authenticated session and verifies framing headers, Forms Authentication, StateServer identity through COM, Classic ASP/ASPX navigation, Web Forms ViewState and postbacks, downloads, iframe login escape, federated Angular rendering, URL synchronization, refresh restoration, and Back/Forward behavior. Use the `edge` project for the target Windows browser pass.
