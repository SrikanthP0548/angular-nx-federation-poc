# ASP.NET Web Forms + Angular Native Federation IIS Integration Plan

## 1. Purpose

This document defines how the Angular shell and Native Federation provider artifacts will be integrated with the existing ASP.NET Web Forms application without adding the generated Angular files to the .NET solution.

The selected approach is a separate static IIS virtual directory under the existing website. The .NET application continues to serve ASPX pages, while IIS serves the Angular artifacts from an external physical directory.

This phase covers static hosting and frontend integration only. It does not introduce a BFF, new .NET APIs, COM integration, XML mapping, authentication redesign, or ASPX replacement.

## 2. Selected IIS Topology

```text
Existing IIS website
├── /                     → existing ASP.NET Web Forms application
└── /spa                  → D:\WebAssets\AngularFederation\spa
```

`/spa` is an IIS virtual directory mapped to an external physical directory. It is not stored in the .NET solution and should not be included in the .NET web project's `.csproj`.

The public URLs will follow this structure:

```text
https://application.company.com/spa/manifest.json
https://application.company.com/spa/shell/current/main.js
https://application.company.com/spa/pricing/1.2.0/remoteEntry.json
https://application.company.com/spa/feature-two/1.2.0/remoteEntry.json
https://application.company.com/spa/feature-three/1.2.0/remoteEntry.json
```

Because the ASPX application and Angular assets use the same scheme, hostname, and port, the browser treats them as the same origin. No CORS configuration is required for this topology.

## 3. Why a Virtual Directory

The `/spa` content is static and does not require another ASP.NET application.

The virtual directory should not need:

- A separate application pool.
- ASP.NET execution.
- Session state.
- A `bin` directory.
- Forms Authentication processing.
- Managed application routing.

Keeping the artifacts outside the .NET solution provides the following benefits:

- The large .NET project does not contain generated JavaScript chunks.
- Angular artifacts can be deployed independently.
- Provider versions can be promoted or rolled back without recompiling ASPX pages.
- The same `/spa` URL contract can later be routed to CloudFront and S3.

## 4. Physical Deployment Structure

The `/spa` virtual directory maps directly to the following physical root:

```text
D:\WebAssets\AngularFederation\spa\
  manifest.json

  shell\
    1.2.0\
      main.js
      polyfills.js
      styles.css
      remoteEntry.json
      importmap.json
      framework bundles and supporting chunks

    current\
      main.js
      polyfills.js
      styles.css
      remoteEntry.json
      importmap.json
      framework bundles and supporting chunks

  pricing\
    1.2.0\
      remoteEntry.json
      pricing-search-<hash>.js
      pricing-details-<hash>.js
      lazy page chunks
      shared data-access chunks
      federation fallback bundles

  feature-two\
    1.2.0\
      complete provider artifact

  feature-three\
    1.2.0\
      complete provider artifact
```

The physical directory mapped to `/spa` must contain `manifest.json` directly. It must not introduce another nested `spa` directory.

Every generated artifact directory must be deployed in full. Individual files such as `main.js`, `remoteEntry.json`, or `pricing-search-<hash>.js` must not be copied in isolation because the federation metadata references other generated chunks and shared packages.

## 5. URL and Manifest Alignment

All Angular hosting paths must use `/spa` consistently.

The environment runtime manifest must point to provider URLs such as:

```text
/spa/pricing/1.2.0/remoteEntry.json
/spa/feature-two/1.2.0/remoteEntry.json
/spa/feature-three/1.2.0/remoteEntry.json
```

The ASPX integration must use:

```text
/spa/manifest.json
/spa/shell/current/styles.css
/spa/shell/current/polyfills.js
/spa/shell/current/main.js
```

The current Angular POC was originally hosted under a different base path. Before the IIS integration is considered complete, the following must all be verified or updated to use `/spa`:

- The shell's default manifest location.
- The runtime manifest provider URLs.
- The bootstrap context asset base path.
- The ASPX shell stylesheet and script references.
- The publishing and promotion destination paths.
- The host simulator or environment-specific test configuration used to validate the IIS layout.

No generated JavaScript chunk should be manually edited to change its path. Path changes must be handled through hosting configuration, environment manifests, or build/publish configuration.

## 6. IIS Virtual Directory Configuration

The IIS configuration should create a virtual directory named `spa` under the existing website and map it to:

```text
D:\WebAssets\AngularFederation\spa
```

The virtual directory should use IIS static-content handling. It should not be converted into an IIS application unless a future requirement introduces server-side behavior under `/spa`.

The IIS identity serving the existing website requires only:

- Read.
- Read and execute.
- List folder contents.

The IIS runtime identity should not have write or modify permission. A separate deployment identity or pipeline should own write access to the Angular deployment directory.

## 7. MIME Types and Static Content

IIS must return the correct content type for every generated asset:

| Extension | Expected content type |
|---|---|
| `.js` | JavaScript |
| `.mjs` | JavaScript |
| `.json` | JSON |
| `.css` | CSS |
| `.map` | JSON |
| `.ico` | Icon |

The IIS Static Content feature must be installed and enabled.

A missing Angular file must return an actual HTTP 404. IIS must not replace missing `/spa` files with:

- `Default.aspx`.
- A Forms Authentication login page.
- A custom application error page with HTTP 200.
- A URL Rewrite fallback.

## 8. Authentication and Authorization

Anonymous read access is recommended for `/spa`.

Angular bundles and manifests must not contain secrets, credentials, access tokens, or confidential customer data. Protecting static JavaScript through Forms Authentication adds failure modes without protecting backend data.

The existing ASPX pages and backend APIs remain protected by the application's current authentication and authorization rules.

If organizational policy requires `/spa` to inherit authentication, the following must be verified explicitly:

- Same-origin authentication cookies are sent on asset requests.
- An expired session does not return login-page HTML for JSON or JavaScript requests.
- Unauthorized asset requests return an appropriate status rather than HTTP 200 with HTML.

## 9. URL Rewrite and Routing Exclusions

Existing IIS and application rewrite rules must exclude `/spa/*`.

Requests below `/spa` must be handled as exact static-file requests and must not be routed through:

- ASP.NET page routing.
- MVC routes, if present elsewhere in the solution.
- Legacy extensionless URL rules.
- Login redirects.
- SPA fallback rules.
- Custom 404 rewrite rules.

Native Federation depends on exact generated filenames. Rewriting a missing JavaScript chunk to an ASPX response will cause misleading browser parsing or module-loading errors.

## 10. Caching Policy

Two cache policies are required.

### 10.1 Mutable files

The following locations must be revalidated or served with `no-cache`:

```text
/spa/manifest.json
/spa/shell/current/*
```

These URLs are stable while their content can change during promotion.

### 10.2 Immutable versioned files

The following locations should use long-lived immutable caching:

```text
/spa/shell/1.2.0/*
/spa/pricing/1.2.0/*
/spa/feature-two/1.2.0/*
/spa/feature-three/1.2.0/*
```

A published version directory must never be overwritten. Every new release receives a new version directory.

Separate IIS configuration may be required at the mutable and versioned directory levels to produce the correct cache headers.

## 11. ASPX Integration Contract

Each migrated ASPX page identifies one logical Angular feature. The ASPX page must not know the provider artifact version or generated chunk filenames.

The page supplies:

1. A feature key, such as `pricing-search`.
2. The corresponding custom-element tag, such as `ca-pricing-search`.
3. HTML-encoded input attributes, such as customer ID.
4. Non-sensitive bootstrap configuration with `/spa` as the asset base path.
5. Stable shell asset references under `/spa/shell/current`.
6. The runtime manifest location `/spa/manifest.json`.

Common shell references should be produced by the ASP.NET Master Page or a reusable Web Forms control so they are not duplicated manually across migrated pages.

The custom-element tag must remain normal client-side HTML and should not use `runat="server"`.

## 12. ASPX Input Safety

Simple string inputs may be passed as custom-element attributes.

All server-generated values must be HTML-encoded before being written into attributes. This includes values originating from:

- Query strings.
- Form values.
- Database records.
- Session state.
- External systems.

Secrets, tokens, large objects, and confidential data must not be embedded in HTML attributes or frontend configuration. Those values should remain behind authenticated backend APIs in a later integration phase.

## 13. One-Feature-Per-Document Limitation

The current Angular shell selects and loads one feature provider entry per HTML document.

The supported model is:

- One ASPX page hosts one federated page custom element.
- Different ASPX pages can host different custom elements.
- Multiple feature libraries can be packaged in the same provider artifact.

Hosting several independently federated Angular features simultaneously on one ASPX document requires a future shell enhancement and is outside this integration phase.

## 14. Deployment Process

The Angular deployment is independent of the .NET application deployment.

The recommended sequence is:

1. Build all Angular artifacts.
2. Run unit, lint, bundle-sharing, and relevant browser checks.
3. Publish the artifacts into a staging directory outside the live IIS path.
4. Verify build metadata, checksums, file counts, and provider descriptors.
5. Move completed version directories into `D:\WebAssets\AngularFederation\spa`.
6. Activate the selected shell version under `shell\current`.
7. Update `manifest.json` last.
8. Verify the pilot ASPX page through IIS.
9. Retain previous versions for rollback.

Files must not be copied one by one directly into a live version directory. The browser may request the provider while the deployment is incomplete.

## 15. Rollback

Provider rollback changes the affected feature entry in `/spa/manifest.json` to reference the previous immutable provider directory.

ASPX pages do not change during provider rollout or rollback.

Shell rollback switches `/spa/shell/current` back to a previously validated shell version. The shell activation mechanism must be failure-safe and must avoid leaving `current` missing or partially populated.

## 16. Multiple IIS Servers

If the application is deployed to more than one IIS server, the Angular artifact state must be consistent across every node.

Acceptable strategies include:

- Deploying the same immutable version directories to every server before changing the manifest.
- Using a shared read-only content location with appropriate availability controls.
- Moving `/spa` delivery to CloudFront and S3 in a later phase.

The manifest must not reference a version until that version is available from every server that can handle a request.

## 17. Future S3 and CloudFront Migration

The `/spa` URL contract should be retained during a future S3 migration.

The preferred future routing is:

```text
https://application.company.com/spa/*
                    ↓
              CloudFront
                    ↓
             private S3 bucket
```

If `/spa` remains on the application hostname, the ASPX integration and runtime manifest paths can remain unchanged and no browser CORS configuration is required.

If a separate asset hostname is introduced, the ASPX asset-base configuration and environment manifest must use the full asset hostname, and CloudFront, S3, CSP, and CORS settings must be updated accordingly.

## 18. Pilot Feature

`pricing-search` should be the first ASPX integration because it verifies:

- IIS static delivery through `/spa`.
- Shell loading.
- Runtime manifest loading.
- Native Federation provider loading.
- Custom-element registration.
- ASPX-to-Angular attribute passing.
- Shared Angular runtime ownership.
- Per-page lazy loading.
- Legacy CSS and JavaScript coexistence.

After pricing search succeeds, `pricing-details` should be integrated to prove that two ASPX pages can load different page libraries from the same pricing provider without downloading each other's page implementation.

## 19. Acceptance Criteria

The IIS and ASPX integration is accepted when:

- `/spa/manifest.json` returns valid JSON.
- `/spa/shell/current/main.js` returns JavaScript.
- The selected provider's `remoteEntry.json` is reachable.
- The existing ASPX page loads normally.
- The Angular custom element renders inside the ASPX page.
- ASPX-generated inputs reach the Angular component.
- Dynamic values are HTML-encoded.
- Only the selected provider is requested.
- Pricing search does not download pricing-details page code.
- Feature-two and feature-three are not requested from a pricing page.
- Angular and shared-core runtime files resolve from the shell.
- Unknown, disabled, or unavailable features show the shell fallback rather than a blank page.
- Authentication and rewrite rules do not return HTML for static asset requests.
- Mutable and immutable paths return the intended cache headers.
- Chrome and Edge both pass.
- Rollback can restore the previous provider version without changing the ASPX page.

## 20. Information Required Before Implementation

Before writing IIS or ASPX changes, confirm:

- Existing IIS website name.
- Whether the ASP.NET application is hosted at `/` or below an IIS application path.
- Current .NET application physical directory.
- Final Angular deployment directory; this plan assumes `D:\WebAssets\AngularFederation\spa`.
- Whether production uses one IIS server or multiple nodes.
- Current Forms Authentication and authorization configuration.
- Existing URL Rewrite rules.
- Existing Content Security Policy headers.
- The ASPX Master Page used by the pricing pages.
- The first pricing-search ASPX page and its code-behind.
- The deployment identity that will write Angular artifacts to the external directory.

## 21. Reference Documentation

- [Microsoft: IIS virtual directories](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/application/virtualdirectory)
- [Microsoft: IIS sites, applications, and virtual directories](https://learn.microsoft.com/en-us/iis/get-started/planning-your-iis-architecture/understanding-sites-applications-and-virtual-directories-on-iis)
- [Microsoft: IIS static-content client caching](https://learn.microsoft.com/en-us/iis/configuration/system.webserver/staticcontent/clientcache)

