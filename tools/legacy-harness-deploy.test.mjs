import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const setupScript = fs.readFileSync(
  path.join(repoRoot, 'legacy-harness/deploy/New-LegacyHarnessSite.ps1'),
  'utf8',
);

const expectedFeatureMappings = new Map([
  ['Web-Server', 'IIS-WebServerRole'],
  ['Web-WebServer', 'IIS-WebServer'],
  ['Web-Common-Http', 'IIS-CommonHttpFeatures'],
  ['Web-Default-Doc', 'IIS-DefaultDocument'],
  ['Web-Static-Content', 'IIS-StaticContent'],
  ['Web-Http-Errors', 'IIS-HttpErrors'],
  ['Web-Http-Logging', 'IIS-HttpLogging'],
  ['Web-App-Dev', 'IIS-ApplicationDevelopment'],
  ['Web-Asp', 'IIS-ASP'],
  ['Web-CGI', 'IIS-CGI'],
  ['Web-Asp-Net45', 'IIS-ASPNET45'],
  ['Web-Net-Ext45', 'IIS-NetFxExtensibility45'],
  ['Web-ISAPI-Ext', 'IIS-ISAPIExtensions'],
  ['Web-ISAPI-Filter', 'IIS-ISAPIFilter'],
  ['Web-Security', 'IIS-Security'],
  ['Web-Filtering', 'IIS-RequestFiltering'],
  ['Web-Mgmt-Tools', 'IIS-WebServerManagementTools'],
  ['Web-Mgmt-Console', 'IIS-ManagementConsole'],
  ['Web-Scripting-Tools', 'IIS-ManagementScriptingTools'],
  ['NET-Framework-45-ASPNET', 'NetFx4Extended-ASPNET45'],
  ['WAS', 'WAS-WindowsActivationService'],
  ['WAS-Process-Model', 'WAS-ProcessModel'],
  ['WAS-Config-APIs', 'WAS-ConfigurationAPI'],
]);

test('the IIS setup maps every Windows Server feature to a Windows client feature', () => {
  const mappings = new Map(
    [...setupScript.matchAll(/Server = '([^']+)'; Client = '([^']+)'/g)].map(
      ([, server, client]) => [server, client],
    ),
  );

  assert.deepEqual(mappings, expectedFeatureMappings);
});

test('the IIS setup uses the supported feature manager for each Windows family', () => {
  assert.match(setupScript, /Get-Command Get-WindowsFeature/);
  assert.match(
    setupScript,
    /Install-WindowsFeature -Name \$missing -IncludeManagementTools/,
  );
  assert.match(setupScript, /Get-Command Get-WindowsOptionalFeature/);
  assert.match(
    setupScript,
    /Enable-WindowsOptionalFeature -Online -FeatureName \$missing -All -NoRestart/,
  );
  assert.match(setupScript, /State -eq 'EnablePending'/);
  assert.match(setupScript, /Restart Windows, then run this script again/);
});
