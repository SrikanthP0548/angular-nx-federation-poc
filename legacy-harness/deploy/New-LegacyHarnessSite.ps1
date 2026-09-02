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

$requiredFeatures = @(
    [pscustomobject]@{ Server = 'Web-Server'; Client = 'IIS-WebServerRole' }
    [pscustomobject]@{ Server = 'Web-WebServer'; Client = 'IIS-WebServer' }
    [pscustomobject]@{ Server = 'Web-Common-Http'; Client = 'IIS-CommonHttpFeatures' }
    [pscustomobject]@{ Server = 'Web-Default-Doc'; Client = 'IIS-DefaultDocument' }
    [pscustomobject]@{ Server = 'Web-Static-Content'; Client = 'IIS-StaticContent' }
    [pscustomobject]@{ Server = 'Web-Http-Errors'; Client = 'IIS-HttpErrors' }
    [pscustomobject]@{ Server = 'Web-Http-Logging'; Client = 'IIS-HttpLogging' }
    [pscustomobject]@{ Server = 'Web-App-Dev'; Client = 'IIS-ApplicationDevelopment' }
    [pscustomobject]@{ Server = 'Web-Asp'; Client = 'IIS-ASP' }
    [pscustomobject]@{ Server = 'Web-CGI'; Client = 'IIS-CGI' }
    [pscustomobject]@{ Server = 'Web-Asp-Net45'; Client = 'IIS-ASPNET45' }
    [pscustomobject]@{ Server = 'Web-Net-Ext45'; Client = 'IIS-NetFxExtensibility45' }
    [pscustomobject]@{ Server = 'Web-ISAPI-Ext'; Client = 'IIS-ISAPIExtensions' }
    [pscustomobject]@{ Server = 'Web-ISAPI-Filter'; Client = 'IIS-ISAPIFilter' }
    [pscustomobject]@{ Server = 'Web-Security'; Client = 'IIS-Security' }
    [pscustomobject]@{ Server = 'Web-Filtering'; Client = 'IIS-RequestFiltering' }
    [pscustomobject]@{ Server = 'Web-Mgmt-Tools'; Client = 'IIS-WebServerManagementTools' }
    [pscustomobject]@{ Server = 'Web-Mgmt-Console'; Client = 'IIS-ManagementConsole' }
    [pscustomobject]@{ Server = 'Web-Scripting-Tools'; Client = 'IIS-ManagementScriptingTools' }
    [pscustomobject]@{ Server = 'NET-Framework-45-ASPNET'; Client = 'NetFx4Extended-ASPNET45' }
    [pscustomobject]@{ Server = 'WAS'; Client = 'WAS-WindowsActivationService' }
    [pscustomobject]@{ Server = 'WAS-Process-Model'; Client = 'WAS-ProcessModel' }
    [pscustomobject]@{ Server = 'WAS-Config-APIs'; Client = 'WAS-ConfigurationAPI' }
)

if ($null -ne (Get-Command Get-WindowsFeature -ErrorAction SilentlyContinue)) {
    Import-Module ServerManager

    $serverFeatures = @($requiredFeatures | Select-Object -ExpandProperty Server)
    $missing = @(Get-WindowsFeature -Name $serverFeatures | Where-Object InstallState -ne 'Installed' | Select-Object -ExpandProperty Name)
    if ($missing.Count -gt 0) {
        $result = Install-WindowsFeature -Name $missing -IncludeManagementTools
        if (-not $result.Success) {
            throw "Windows feature installation failed: $($result.ExitCode)"
        }
        if ($result.RestartNeeded -eq 'Yes') {
            throw 'Windows features installed successfully, but Windows requires a restart before site creation.'
        }
    }
} elseif (
    $null -ne (Get-Command Get-WindowsOptionalFeature -ErrorAction SilentlyContinue) -and
    $null -ne (Get-Command Enable-WindowsOptionalFeature -ErrorAction SilentlyContinue)
) {
    $clientFeatures = @($requiredFeatures | Select-Object -ExpandProperty Client)
    $featureStates = @(
        foreach ($featureName in $clientFeatures) {
            try {
                Get-WindowsOptionalFeature -Online -FeatureName $featureName -ErrorAction Stop
            } catch {
                throw "Required Windows optional feature '$featureName' is unavailable: $($_.Exception.Message)"
            }
        }
    )

    $pending = @($featureStates | Where-Object State -eq 'EnablePending' | Select-Object -ExpandProperty FeatureName)
    if ($pending.Count -gt 0) {
        throw "Windows features are pending enablement ($($pending -join ', ')). Restart Windows, then run this script again."
    }

    $missing = @($featureStates | Where-Object State -ne 'Enabled' | Select-Object -ExpandProperty FeatureName)
    if ($missing.Count -gt 0) {
        $result = Enable-WindowsOptionalFeature -Online -FeatureName $missing -All -NoRestart
        if ($result.RestartNeeded) {
            throw 'Windows features installed successfully, but Windows requires a restart before site creation.'
        }
    }
} else {
    throw 'No supported Windows feature-management commands were found. Run this script in elevated Windows PowerShell on Windows Server or Windows 10/11.'
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
