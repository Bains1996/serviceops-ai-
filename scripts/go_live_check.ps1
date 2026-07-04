param(
  [string]$BaseUrl = 'https://serviceops-ai-site.vercel.app',
  [string]$WorkerSecret = '',
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'

Write-Output '=== ServiceOps AI Go-Live Check ==='
Write-Output ('base_url=' + $BaseUrl)

if (-not $SkipBuild) {
  Write-Output 'step=build'
  npm.cmd --prefix c:\vouch_app\serviceops-ai-site run build | Out-Host
}

Write-Output 'step=smoke_integration'
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File c:\vouch_app\serviceops-ai-site\scripts\smoke_integration.ps1
if ($LASTEXITCODE -ne 0) {
  throw 'smoke_integration failed'
}

Write-Output 'step=smoke_carrier_flow'
if ([string]::IsNullOrWhiteSpace($WorkerSecret)) {
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File c:\vouch_app\serviceops-ai-site\scripts\smoke_carrier_flow.ps1 -BaseUrl $BaseUrl
} else {
  & powershell.exe -NoProfile -ExecutionPolicy Bypass -File c:\vouch_app\serviceops-ai-site\scripts\smoke_carrier_flow.ps1 -BaseUrl $BaseUrl -WorkerSecret $WorkerSecret
}
if ($LASTEXITCODE -ne 0) {
  throw 'smoke_carrier_flow failed'
}

Write-Output 'result=PASS'
