# Remove dsh-balance-viewer from the DeepSeek Harness desktop profile.
#
# Usage (from anywhere):  powershell -ExecutionPolicy Bypass -File .\scripts\uninstall.ps1
# Then restart DeepSeek Harness.
param(
  [string]$DshHome = "$env:USERPROFILE\.dsh"
)

$ErrorActionPreference = "Stop"

$targets = @(
  (Join-Path $DshHome "profiles\node_modules\dsh-balance-viewer"),
  (Join-Path $DshHome "profiles\node_modules\dsh-deepseek-balance"),
  (Join-Path $DshHome "profiles\desktop\node_modules\dsh-balance-viewer"),
  (Join-Path $DshHome "profiles\desktop\node_modules\dsh-deepseek-balance")
)
$profilePkg = Join-Path $DshHome "profiles\desktop\package.json"

foreach ($target in $targets) {
  if (Test-Path $target) {
    Remove-Item $target -Recurse -Force
    Write-Host "Removed: $target"
  } else {
    Write-Host "Package not present: $target"
  }
}

if (Test-Path $profilePkg) {
  $manifest = Get-Content $profilePkg -Raw | ConvertFrom-Json
  if ($null -ne $manifest.dsh -and $null -ne $manifest.dsh.profile -and $null -ne $manifest.dsh.profile.bundles) {
    $bundles = @($manifest.dsh.profile.bundles)
    $next = @($bundles | Where-Object { $_ -notin @("dsh-balance-viewer", "dsh-deepseek-balance") })
    if ($next.Count -ne $bundles.Count) {
      $backup = "$profilePkg.dshbak"
      Copy-Item $profilePkg $backup -Force
      $manifest.dsh.profile.bundles = $next
      $json = $manifest | ConvertTo-Json -Depth 10
      [System.IO.File]::WriteAllText($profilePkg, $json + "`r`n", (New-Object System.Text.UTF8Encoding($false)))
      Write-Host "Bundle removed from the profile manifest (backup: $backup)"
    }
  }
}

Write-Host "Next: restart DeepSeek Harness."
