[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$HarnessRoot,
    [string]$AppPoolName = 'LegacyHarness',
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Release',
    [string]$ComRoot = 'C:\WebAssets\LegacyHarness\com'
)

$ErrorActionPreference = 'Stop'
$HarnessRoot = (Resolve-Path $HarnessRoot).Path
$sourceAssembly = Join-Path $HarnessRoot "src\LegacyComBridge\bin\$Configuration\LegacyComBridge.dll"
$regasm = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\RegAsm.exe'

if (-not (Test-Path $sourceAssembly -PathType Leaf)) {
    throw "COM bridge build output not found: $sourceAssembly"
}
if (-not (Test-Path $regasm -PathType Leaf)) {
    throw "64-bit RegAsm was not found: $regasm"
}

New-Item -ItemType Directory -Path $ComRoot -Force | Out-Null
$deployedAssembly = Join-Path $ComRoot 'LegacyComBridge.dll'
$typeLibrary = Join-Path $ComRoot 'LegacyComBridge.tlb'
Copy-Item $sourceAssembly $deployedAssembly -Force
Copy-Item ([IO.Path]::ChangeExtension($sourceAssembly, '.pdb')) $ComRoot -Force -ErrorAction SilentlyContinue

& $regasm $deployedAssembly /nologo /codebase "/tlb:$typeLibrary"
if ($LASTEXITCODE -ne 0) {
    throw "64-bit RegAsm failed with exit code $LASTEXITCODE"
}

Import-Module WebAdministration
if (Test-Path "IIS:\AppPools\$AppPoolName") {
    Restart-WebAppPool -Name $AppPoolName
}

[pscustomobject]@{
    ProgId = 'LegacyComBridge.SessionBridge'
    Assembly = $deployedAssembly
    TypeLibrary = $typeLibrary
    RegistrationBitness = 'x64'
}
