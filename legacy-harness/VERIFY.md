# Real IIS legacy harness verification

This fixture is deliberately isolated from production. It proves the real
IIS/WebForms/Classic ASP/StateServer/COM mechanics needed by
`legacy-container`; it is not a production deployment recipe.

## Deployment order

Run these in elevated Windows PowerShell after transferring the repository
bundle to the Windows host:

`New-LegacyHarnessSite.ps1` supports both Windows Server and Windows 10/11. It
installs any missing IIS, Classic ASP, ASP.NET 4.x, management-scripting, and
WAS components with the feature-management commands provided by that operating
system. If Windows reports that a restart is required, restart before running
the script again.

```powershell
Set-ExecutionPolicy -Scope Process Bypass

.\legacy-harness\deploy\New-LegacyHarnessSite.ps1

.\legacy-harness\deploy\Deploy-LegacyWeb.ps1 `
  -HarnessRoot .\legacy-harness

.\legacy-harness\deploy\Register-ComBridge.ps1 `
  -HarnessRoot .\legacy-harness

.\legacy-harness\deploy\Deploy-AngularShell.ps1 `
  -AngularSource .\publish\angular-shell\current `
  -UiSource .\publish\ui
```

The harness listens on port `8800`. Keep that port closed in the EC2 security
group and reach it through an AWS Systems Manager port-forwarding session.

## Required checks

1. Request `/default.asp`, `/legacy-page.aspx`, and `/AngularShell/`; confirm
   each sends one `X-Frame-Options: SAMEORIGIN` and one CSP containing
   `frame-ancestors 'self'`.
2. Search the deployed ASP/ASPX sources for `window.top`; only `Login.aspx`
   may contain the intentional frame escape.
3. Sign in through `/FakeIdp.aspx`; confirm both `.LEGACYAUTH` and
   `ASP.NET_SessionId` use cookie path `/`.
4. Open `/default.asp`; confirm it displays the StateServer identity obtained
   through `LegacyComBridge.SessionBridge`.
5. Navigate ASP to ASPX and back; confirm the displayed identity stays the
   same.
6. Increment the WebForms postback counter twice and confirm it reaches two.
7. Exercise both the static download and the WebForms download button.
8. Confirm the pricing-search federated feature renders inside
   `/legacy-page.aspx`.
9. Change only `LoginDestination` between `/default.asp` and `/AngularShell/`,
   then verify each redirect. Restore `/AngularShell/` afterward.
10. Logout and confirm protected ASPX and Classic ASP pages return to login.
11. Temporarily set the Forms Authentication timeout to one minute and verify
    an expired login inside the iframe promotes `Login.aspx` to the top-level
    window. Restore the 20-minute value afterward.

## Automated test from macOS

Create an SSM port-forwarding session from local port 8800 to instance port
8800, then run:

```bash
EXTERNAL_BASE_URL=http://localhost:8800 \
  npx playwright test \
  --config apps/host-e2e/playwright.container.config.mts \
  --project=chrome
```

`EXTERNAL_BASE_URL` is opt-in. Without it, the same Playwright configuration
starts the existing Node host simulator exactly as before.

## Rollback

The previous web root is retained at:

```text
C:\WebAssets\LegacyHarness\site.previous
```

Stop only the `LegacyHarness` site and app pool, swap `site` with
`site.previous`, then start that site and app pool. No production site or
login configuration is involved.
