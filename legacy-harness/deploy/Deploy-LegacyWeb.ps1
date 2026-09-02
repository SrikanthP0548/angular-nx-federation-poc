[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$HarnessRoot,
    [string]$SiteName = 'LegacyHarness',
    [string]$AppPoolName = 'LegacyHarness',
    [string]$SiteRoot = 'C:\WebAssets\LegacyHarness\site',
    [ValidateSet('Debug', 'Release')]
    [string]$Configuration = 'Release',
    [string]$MSBuildPath
)

$ErrorActionPreference = 'Stop'
$HarnessRoot = (Resolve-Path $HarnessRoot).Path
$solution = Join-Path $HarnessRoot 'LegacyHarness.sln'
$webSource = Join-Path $HarnessRoot 'src\LegacyWeb'

if (-not (Test-Path $solution -PathType Leaf)) {
    throw "Solution not found: $solution"
}

if ([string]::IsNullOrWhiteSpace($MSBuildPath)) {
    $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio\Installer\vswhere.exe'
    if (Test-Path $vswhere) {
        $MSBuildPath = & $vswhere -latest -products * -requires Microsoft.Component.MSBuild -find 'MSBuild\**\Bin\MSBuild.exe' | Select-Object -First 1
    }
}
if ([string]::IsNullOrWhiteSpace($MSBuildPath)) {
    $frameworkMSBuild = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\MSBuild.exe'
    if (Test-Path $frameworkMSBuild) {
        $MSBuildPath = $frameworkMSBuild
    }
}
if (-not (Test-Path $MSBuildPath -PathType Leaf)) {
    throw 'MSBuild was not found. Install Visual Studio Build Tools with the Web Build Tools workload.'
}

& $MSBuildPath $solution /m /t:Rebuild "/p:Configuration=$Configuration" /p:Platform='Any CPU' /v:minimal
if ($LASTEXITCODE -ne 0) {
    throw "MSBuild failed with exit code $LASTEXITCODE"
}

$compiledWeb = Join-Path $webSource 'bin'
if (-not (Test-Path (Join-Path $compiledWeb 'LegacyWeb.dll'))) {
    throw 'LegacyWeb.dll was not produced by the build.'
}
if (-not (Test-Path (Join-Path $compiledWeb 'LegacyWeb.Core.dll'))) {
    throw 'LegacyWeb.Core.dll was not copied to the web output.'
}

$stagingRoot = "C:\WebAssets\LegacyHarness\.site-staging-$PID"
$previousRoot = 'C:\WebAssets\LegacyHarness\site.previous'

if (Test-Path $stagingRoot) {
    Remove-Item $stagingRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $stagingRoot -Force | Out-Null

& robocopy $webSource $stagingRoot /MIR /XD bin obj /XF *.cs *.csproj | Out-Null
if ($LASTEXITCODE -ge 8) {
    throw "Content staging failed with robocopy exit code $LASTEXITCODE"
}

New-Item -ItemType Directory -Path (Join-Path $stagingRoot 'bin') -Force | Out-Null
Copy-Item (Join-Path $compiledWeb '*.dll') (Join-Path $stagingRoot 'bin') -Force
Copy-Item (Join-Path $compiledWeb '*.pdb') (Join-Path $stagingRoot 'bin') -Force -ErrorAction SilentlyContinue

Import-Module WebAdministration
Stop-Website -Name $SiteName -ErrorAction SilentlyContinue
Stop-WebAppPool -Name $AppPoolName -ErrorAction SilentlyContinue

try {
    if (Test-Path $previousRoot) {
        Remove-Item $previousRoot -Recurse -Force
    }
    if (Test-Path $SiteRoot) {
        Move-Item $SiteRoot $previousRoot
    }
    Move-Item $stagingRoot $SiteRoot
} catch {
    if (-not (Test-Path $SiteRoot) -and (Test-Path $previousRoot)) {
        Move-Item $previousRoot $SiteRoot
    }
    throw
} finally {
    Start-WebAppPool -Name $AppPoolName
    Start-Website -Name $SiteName
}

[pscustomobject]@{
    SiteRoot = $SiteRoot
    PreviousRoot = $previousRoot
    Configuration = $Configuration
    MSBuild = $MSBuildPath
}
