param(
  [string]$BaseUrl = 'https://serviceops-ai-site.vercel.app',
  [string]$WorkerSecret
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($WorkerSecret)) {
  throw 'WorkerSecret is required.'
}

$headers = @{ 'x-worker-secret' = $WorkerSecret }
$result = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/internal/process-jobs" -Method Post -Headers $headers

Write-Output ('claimed=' + $result.claimed)
Write-Output ('processed=' + $result.processed)
Write-Output ('failed=' + $result.failed)
