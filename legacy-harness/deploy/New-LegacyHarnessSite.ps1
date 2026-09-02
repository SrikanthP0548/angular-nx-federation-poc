[CmdletBinding()]
param(
    [string]$SiteName = 'LegacyHarness',
    [string]$AppPoolName = 'LegacyHarness',
    [string]$SiteRoot = 'C:\WebAssets\LegacyHarness\site',
    [string]$AngularRoot = 'C:\WebAssets\AngularShell\current',
    [string]$UiRoot = 'C:\WebAssets\ui',
    [ValidateRange(1, 65535)]
    [int]$Port = 8800
)

$ErrorActionPreference = 'Stop'

$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run this script from an elevated PowerShell session.'
}

Import-Module ServerManager
$requiredFeatures = @(
    'Web-Server',
    'Web-WebServer',
    'Web-Common-Http',
    'Web-Default-Doc',
    'Web-Static-Content',
    'Web-Http-Errors',
    'Web-Http-Logging',
    'Web-App-Dev',
    'Web-Asp',
    'Web-CGI',
    'Web-Asp-Net45',
    'Web-Net-Ext45',
    'Web-ISAPI-Ext',
    'Web-ISAPI-Filter',
    'Web-Security',
    'Web-Filtering',
    'Web-Mgmt-Tools',
    'Web-Mgmt-Console',
    'NET-Framework-45-ASPNET',
    'WAS',
    'WAS-Process-Model',
    'WAS-Config-APIs'
)

$missing = @(Get-WindowsFeature -Name $requiredFeatures | Where-Object InstallState -ne 'Installed' | Select-Object -ExpandProperty Name)
if ($missing.Count -gt 0) {
    $result = Install-WindowsFeature -Name $missing -IncludeManagementTools
    if (-not $result.Success) {
        throw "Windows feature installation failed: $($result.ExitCode)"
    }
    if ($result.RestartNeeded -eq 'Yes') {
        throw 'Windows features installed successfully, but Windows requires a restart before site creation.'
    }
}

Set-Service aspnet_state -StartupType Automatic
Start-Service aspnet_state

foreach ($directory in @($SiteRoot, $AngularRoot, $UiRoot)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
}

Import-Module WebAdministration

if (-not (Test-Path "IIS:\AppPools\$AppPoolName")) {
    New-WebAppPool -Name $AppPoolName | Out-Null
}
Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name managedRuntimeVersion -Value 'v4.0'
Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name managedPipelineMode -Value 'Integrated'
Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name enable32BitAppOnWin64 -Value $false
Set-ItemProperty "IIS:\AppPools\$AppPoolName" -Name processModel.identityType -Value 'ApplicationPoolIdentity'

if (-not (Test-Path "IIS:\Sites\$SiteName")) {
    New-Website -Name $SiteName -PhysicalPath $SiteRoot -Port $Port -ApplicationPool $AppPoolName | Out-Null
} else {
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name physicalPath -Value $SiteRoot
    Set-ItemProperty "IIS:\Sites\$SiteName" -Name applicationPool -Value $AppPoolName
    $binding = Get-WebBinding -Name $SiteName -Protocol http | Where-Object bindingInformation -eq "*:${Port}:"
    if ($null -eq $binding) {
        New-WebBinding -Name $SiteName -Protocol http -Port $Port | Out-Null
    }
}

foreach ($virtualDirectory in @(
    @{ Name = 'AngularShell'; PhysicalPath = $AngularRoot },
    @{ Name = 'ui'; PhysicalPath = $UiRoot }
)) {
    $existing = Get-WebVirtualDirectory -Site $SiteName -Name $virtualDirectory.Name -ErrorAction SilentlyContinue
    if ($null -ne $existing) {
        Remove-WebVirtualDirectory -Site $SiteName -Name $virtualDirectory.Name
    }
    New-WebVirtualDirectory -Site $SiteName -Name $virtualDirectory.Name -PhysicalPath $virtualDirectory.PhysicalPath | Out-Null
}

Set-WebConfigurationProperty -PSPath 'MACHINE/WEBROOT/APPHOST' -Location $SiteName -Filter 'system.webServer/asp' -Name scriptErrorSentToBrowser -Value $true
Set-WebConfigurationProperty -PSPath 'MACHINE/WEBROOT/APPHOST' -Location $SiteName -Filter 'system.webServer/asp' -Name enableParentPaths -Value $false

Start-WebAppPool -Name $AppPoolName -ErrorAction SilentlyContinue
Start-Website -Name $SiteName

[pscustomobject]@{
    SiteName = $SiteName
    AppPool = $AppPoolName
    Binding = "http://localhost:$Port"
    SiteRoot = $SiteRoot
    AngularRoot = $AngularRoot
    UiRoot = $UiRoot
    StateService = (Get-Service aspnet_state).Status
}
