[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$AngularSource,
    [Parameter(Mandatory = $true)]
    [string]$UiSource,
    [string]$AngularRoot = 'C:\WebAssets\AngularShell\current',
    [string]$UiRoot = 'C:\WebAssets\ui'
)

$ErrorActionPreference = 'Stop'
$AngularSource = (Resolve-Path $AngularSource).Path
$UiSource = (Resolve-Path $UiSource).Path

if (-not (Test-Path (Join-Path $AngularSource 'index.html') -PathType Leaf)) {
    throw "Angular container index.html is missing from $AngularSource"
}
if (-not (Test-Path (Join-Path $UiSource 'manifest.json') -PathType Leaf)) {
    throw "Federation manifest.json is missing from $UiSource"
}
if (-not (Test-Path (Join-Path $UiSource 'shell\current\main.js') -PathType Leaf)) {
    throw "Federation shell/current/main.js is missing from $UiSource"
}

function Mirror-Directory([string]$Source, [string]$Destination) {
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    & robocopy $Source $Destination /MIR | Out-Null
    if ($LASTEXITCODE -ge 8) {
        throw "robocopy failed for $Source with exit code $LASTEXITCODE"
    }
}

Mirror-Directory $AngularSource $AngularRoot
Mirror-Directory $UiSource $UiRoot

[pscustomobject]@{
    AngularRoot = $AngularRoot
    AngularIndex = (Join-Path $AngularRoot 'index.html')
    UiRoot = $UiRoot
    Manifest = (Join-Path $UiRoot 'manifest.json')
}
