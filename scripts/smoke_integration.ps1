$ErrorActionPreference = 'Stop'
$base = 'https://serviceops-ai-site.vercel.app'

$setupBody = @{
  companyName = 'North Star Freight'
  countryRegion = 'USA + Canada'
  tms = 'McLeod'
  eld = 'Samsara'
  loadBoard = 'DAT'
  billing = 'QuickBooks'
} | ConvertTo-Json

$setup = Invoke-RestMethod -UseBasicParsing -Uri "$base/api/integrations/setup" -Method Post -ContentType 'application/json' -Body $setupBody
Write-Output ("setup_company=" + $setup.onboarding.companyId)

$syncBody = @{
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
} | ConvertTo-Json -Depth 4

$sync = Invoke-RestMethod -UseBasicParsing -Uri "$base/api/integrations/tms" -Method Post -Headers @{ 'x-company-id' = $setup.onboarding.companyId; 'x-api-key' = $setup.onboarding.apiKey } -ContentType 'application/json' -Body $syncBody
Write-Output ("sync_ok=" + $sync.ok)
Write-Output ("loads=" + $sync.state.loads.Count)
Write-Output ("timeline=" + $sync.state.timeline.Count)
