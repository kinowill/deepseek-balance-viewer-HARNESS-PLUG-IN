# Install dsh-deepseek-balance into the DeepSeek Harness desktop profile.
#
# The desktop profile is reserved for the Electron app: the `dsh plugin` CLI
# refuses to manage it, so this script does the two steps by hand:
#   1. copy the package into the profile's hoisted node_modules
#   2. append "dsh-deepseek-balance" to dsh.profile.bundles in the profile manifest
#
# Usage (from anywhere):  powershell -ExecutionPolicy Bypass -File .\scripts\install.ps1
# Then restart DeepSeek Harness.
param(
  [string]$DshHome = "$env:USERPROFILE\.dsh"
)

$ErrorActionPreference = "Stop"

$src = Split-Path -Parent $PSScriptRoot
$target = Join-Path $DshHome "profiles\node_modules\dsh-deepseek-balance"
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

# 2) Add the bundle to the desktop profile manifest (backup first).
$manifest = Get-Content $profilePkg -Raw | ConvertFrom-Json
if ($null -eq $manifest.dsh -or $null -eq $manifest.dsh.profile -or $null -eq $manifest.dsh.profile.bundles) {
  throw "Unexpected profile manifest shape in $profilePkg (dsh.profile.bundles missing)"
}
$bundles = @($manifest.dsh.profile.bundles)
if ("dsh-deepseek-balance" -notin $bundles) {
  $backup = "$profilePkg.dshbak"
  Copy-Item $profilePkg $backup -Force
  $manifest.dsh.profile.bundles = @($bundles) + "dsh-deepseek-balance"
  $json = $manifest | ConvertTo-Json -Depth 10
  [System.IO.File]::WriteAllText($profilePkg, $json + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
  Write-Host "bundles updated (backup: $backup)"
} else {
  Write-Host "bundle already declared in the profile manifest"
}

Write-Host ""
Write-Host "Installed: $target"
Write-Host "Next: restart DeepSeek Harness, then check Settings > Plugins and the sidebar footer badge."
