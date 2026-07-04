param(
  [string]$BaseUrl = 'https://serviceops-ai-site.vercel.app',
  [string]$WorkerSecret = '',
  [string]$OperatorEmail = '',
  [string]$OperatorPassword = 'Passw0rd!'
)

$ErrorActionPreference = 'Stop'

Write-Output ('base_url=' + $BaseUrl)

if ([string]::IsNullOrWhiteSpace($OperatorEmail)) {
  $OperatorEmail = ('ops+' + [guid]::NewGuid().ToString('N').Substring(0, 10) + '@northstarfreight.com')
}

$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$setupBody = @{
  companyName = 'North Star Freight'
  countryRegion = 'USA + Canada'
  tms = 'McLeod'
  eld = 'Samsara'
  loadBoard = 'DAT'
  billing = 'QuickBooks'
} | ConvertTo-Json

$setup = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/integrations/setup" -Method Post -ContentType 'application/json' -Body $setupBody
$companyId = $setup.onboarding.companyId
$apiKey = $setup.onboarding.apiKey

Write-Output ('setup_company=' + $companyId)

$registerBody = @{
  companyId = $companyId
  fullName = 'North Star Dispatcher'
  email = $OperatorEmail
  password = $OperatorPassword
} | ConvertTo-Json

$register = $null
try {
  $register = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/auth/register" -Method Post -ContentType 'application/json' -Body $registerBody -WebSession $session
} catch {
  $errorText = $_.Exception.Message
  if ($errorText -match '404') {
    throw "Auth routes are not deployed at $BaseUrl. Deploy latest serviceops-ai-site build, then re-run this script."
  }
  throw
}

Write-Output ('register_ok=' + $register.ok)

$me = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/auth/me" -Method Get -WebSession $session
Write-Output ('auth_company=' + $me.session.companyId)
Write-Output ('auth_role=' + $me.session.role)

$headers = @{ 'x-company-id' = $companyId; 'x-api-key' = $apiKey }
$opsHeaders = @{ 'x-company-id' = $companyId }

$driverBody = @{
  eventType = 'DRIVER_UPSERT'
  payload = @{
    id = 'drv-live-001'
    name = 'Aman Brar'
    phone = '+1-604-555-4401'
    equipment = 'DRY_VAN'
    city = 'Calgary, AB'
    status = 'AVAILABLE'
  }
} | ConvertTo-Json -Depth 5

$driverSync = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/integrations/tms" -Method Post -Headers $headers -ContentType 'application/json' -Body $driverBody
Write-Output ('driver_sync_ok=' + $driverSync.ok)

$loadBody = @{
  eventType = 'LOAD_UPSERT'
  payload = @{
    id = 'ld-live-test-001'
    customer = 'North Star Customer'
    origin = 'Calgary, AB'
    destination = 'Seattle, WA'
    pickupAt = (Get-Date).AddHours(1).ToString('o')
    deliveryAt = (Get-Date).AddHours(10).ToString('o')
    equipment = 'DRY_VAN'
    rateCad = 2600
    loadedMiles = 540
    deadheadMiles = 16
    status = 'OPEN'
  }
} | ConvertTo-Json -Depth 5

$loadSync = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/integrations/tms" -Method Post -Headers $headers -ContentType 'application/json' -Body $loadBody
Write-Output ('load_sync_ok=' + $loadSync.ok)

$statusBody = @{
  eventType = 'DRIVER_STATUS'
  payload = @{
    driverId = 'drv-live-001'
    status = 'AT_DROPOFF'
    city = 'Seattle, WA'
    lat = 47.6062
    lng = -122.3321
    note = 'Awaiting unload completion'
  }
} | ConvertTo-Json -Depth 5

$statusSync = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/integrations/tms" -Method Post -Headers $headers -ContentType 'application/json' -Body $statusBody
Write-Output ('status_sync_ok=' + $statusSync.ok)

$messageBody = @{
  driverId = 'drv-live-001'
  text = 'unloaded'
} | ConvertTo-Json

$opsMessage = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/ops/message" -Method Post -Headers $opsHeaders -ContentType 'application/json' -Body $messageBody -WebSession $session
Write-Output ('ops_message_ok=' + $opsMessage.ok)

$state = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/ops/state?companyId=$companyId" -Method Get -WebSession $session
Write-Output ('state_drivers=' + $state.state.drivers.Count)
Write-Output ('state_loads=' + $state.state.loads.Count)
Write-Output ('state_approvals=' + $state.state.approvals.Count)

$events = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/ops/events?companyId=$companyId&limit=10" -Method Get -WebSession $session
Write-Output ('events_count=' + $events.events.Count)

$jobsBefore = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/ops/jobs?companyId=$companyId&limit=10" -Method Get -WebSession $session
Write-Output ('jobs_before=' + $jobsBefore.jobs.Count)

if ($WorkerSecret -and $WorkerSecret.Trim().Length -gt 0) {
  $workerHeaders = @{ 'x-worker-secret' = $WorkerSecret }
  $worker = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/internal/process-jobs" -Method Post -Headers $workerHeaders
  Write-Output ('worker_processed=' + $worker.processed)
  Write-Output ('worker_failed=' + $worker.failed)
}

$jobsAfter = Invoke-RestMethod -UseBasicParsing -Uri "$BaseUrl/api/ops/jobs?companyId=$companyId&limit=10" -Method Get -WebSession $session
Write-Output ('jobs_after=' + $jobsAfter.jobs.Count)
