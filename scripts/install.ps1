# Install dsh-balance-viewer into the DeepSeek Harness desktop profile.
#
# The desktop profile is reserved for the Electron app: the `dsh plugin` CLI
# refuses to manage it, so this script does the three steps by hand:
#   1. copy the package into the profile's hoisted node_modules
#   2. declare the local package in the profile dependencies
#   3. append "dsh-balance-viewer" to dsh.profile.bundles
#
# Usage (from anywhere):  powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
# Then restart DeepSeek Harness.
param(
  [string]$DshHome = "$env:USERPROFILE\.dsh"
)

$ErrorActionPreference = "Stop"

$src = Split-Path -Parent $PSScriptRoot
$target = Join-Path $DshHome "profiles\node_modules\dsh-balance-viewer"
$dependencySpec = "file:" + ($src -replace "\\", "/")
$legacyTargets = @(
  (Join-Path $DshHome "profiles\node_modules\dsh-deepseek-balance"),
  (Join-Path $DshHome "profiles\desktop\node_modules\dsh-deepseek-balance")
)
$profilePkg = Join-Path $DshHome "profiles\desktop\package.json"

if (-not (Test-Path (Join-Path $src "package.json"))) {
  throw "package.json not found at repo root ($src) - run this script from the repository."
}
if (-not (Test-Path $profilePkg)) {
  throw "DSH desktop profile not found: $profilePkg - is DeepSeek Harness installed?"
}

# 1) Mirror the package (docs excluded) into the hoisted node_modules.
robocopy $src $target /MIR /XD .git node_modules /XF README.md LICENSE .gitignore DOCUMENT_MAITRE.md ROADMAP.md VALIDATION_LOG.md FICHE_PROJET.md /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }

foreach ($legacyTarget in $legacyTargets) {
  if (Test-Path $legacyTarget) {
    Remove-Item $legacyTarget -Recurse -Force
    Write-Host "Removed legacy package: $legacyTarget"
  }
}

# 2) Declare the local dependency and activate its bundle (backup first).
$manifest = Get-Content $profilePkg -Raw | ConvertFrom-Json
if ($null -eq $manifest.dsh -or $null -eq $manifest.dsh.profile -or $null -eq $manifest.dsh.profile.bundles) {
  throw "Unexpected profile manifest shape in $profilePkg (dsh.profile.bundles missing)"
}
$bundles = @($manifest.dsh.profile.bundles)
$next = @($bundles | Where-Object { $_ -ne "dsh-deepseek-balance" })
if ("dsh-balance-viewer" -notin $next) {
  $next += "dsh-balance-viewer"
}
$changes = @(Compare-Object $bundles $next -SyncWindow 0)
$manifestChanged = $changes.Count -gt 0
$manifest.dsh.profile.bundles = $next

if ($null -eq $manifest.dependencies) {
  $manifest | Add-Member -NotePropertyName "dependencies" -NotePropertyValue ([pscustomobject]@{}) -Force
  $manifestChanged = $true
}
$legacyDependency = $manifest.dependencies.PSObject.Properties["dsh-deepseek-balance"]
if ($null -ne $legacyDependency) {
  $manifest.dependencies.PSObject.Properties.Remove("dsh-deepseek-balance")
  $manifestChanged = $true
}
$currentDependency = $manifest.dependencies.PSObject.Properties["dsh-balance-viewer"]
if ($null -eq $currentDependency -or $currentDependency.Value -ne $dependencySpec) {
  $manifest.dependencies | Add-Member -NotePropertyName "dsh-balance-viewer" -NotePropertyValue $dependencySpec -Force
  $manifestChanged = $true
}

if ($manifestChanged) {
  $backup = "$profilePkg.dshbak"
  Copy-Item $profilePkg $backup -Force
  $json = $manifest | ConvertTo-Json -Depth 10
  [System.IO.File]::WriteAllText($profilePkg, $json + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "profile dependency and bundle updated (backup: $backup)"
} else {
  Write-Host "profile dependency and bundle already declared"
}

Write-Host ""
Write-Host "Installed: $target"
Write-Host "Next: restart DeepSeek Harness, then check Plugins > Installed and the sidebar footer badge."
