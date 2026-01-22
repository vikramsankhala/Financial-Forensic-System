Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Note([string]$Message) {
  Write-Host "[render-env] $Message"
}

if (-not $env:RENDER_API_TOKEN) {
  throw "Missing RENDER_API_TOKEN. Create one in Render -> Account Settings -> API Keys."
}

$backendServiceName = if ($env:RENDER_BACKEND_SERVICE_NAME) { $env:RENDER_BACKEND_SERVICE_NAME } else { "fraud-detection-backend" }
$frontendServiceName = if ($env:RENDER_FRONTEND_SERVICE_NAME) { $env:RENDER_FRONTEND_SERVICE_NAME } else { "fraud-detection-frontend" }

$renderApiBase = "https://api.render.com/v1"
$renderHeaders = @{
  "Authorization" = "Bearer $env:RENDER_API_TOKEN"
  "Content-Type"  = "application/json"
}

Write-Note "Fetching Render services..."
$servicesResponse = Invoke-RestMethod -Method GET -Uri "$renderApiBase/services" -Headers $renderHeaders
$serviceList = if ($servicesResponse.services) { $servicesResponse.services } else { $servicesResponse }

function Get-ServiceId([string]$Name, $Services) {
  $svc = $Services | Where-Object { $_.name -eq $Name } | Select-Object -First 1
  if (-not $svc) {
    throw "Render service '$Name' not found. Create it first via render.yaml or the Render UI."
  }
  return $svc.id
}

function Set-RenderEnvVars([string]$ServiceId, [hashtable]$Vars) {
  if ($Vars.Count -eq 0) {
    throw "No env vars provided for service $ServiceId."
  }

  $envList = @()
  foreach ($key in $Vars.Keys) {
    $envList += @{ key = $key; value = $Vars[$key] }
  }

  try {
    $bulkBody = @{ envVars = $envList } | ConvertTo-Json
    Invoke-RestMethod -Method PUT -Uri "$renderApiBase/services/$ServiceId/env-vars" -Headers $renderHeaders -Body $bulkBody | Out-Null
  } catch {
    Write-Note "Bulk update failed for service $ServiceId, falling back to per-variable updates..."
    foreach ($item in $envList) {
      $body = $item | ConvertTo-Json
      Invoke-RestMethod -Method POST -Uri "$renderApiBase/services/$ServiceId/env-vars" -Headers $renderHeaders -Body $body | Out-Null
    }
  }
}

Write-Note "Resolving service IDs..."
$backendServiceId = Get-ServiceId -Name $backendServiceName -Services $serviceList
$frontendServiceId = Get-ServiceId -Name $frontendServiceName -Services $serviceList

# Backend env vars
$backendVars = @{}
if ($env:DATABASE_URL) { $backendVars["DATABASE_URL"] = $env:DATABASE_URL }
if ($env:NEON_CONNECTION_STRING -and -not $backendVars["DATABASE_URL"]) { $backendVars["DATABASE_URL"] = $env:NEON_CONNECTION_STRING }
if ($env:JWT_SECRET) { $backendVars["JWT_SECRET"] = $env:JWT_SECRET }
if ($env:OPENAI_API_KEY) { $backendVars["OPENAI_API_KEY"] = $env:OPENAI_API_KEY }
if ($env:REDIS_URL) { $backendVars["REDIS_URL"] = $env:REDIS_URL }
if ($env:REDIS_ENABLED) { $backendVars["REDIS_ENABLED"] = $env:REDIS_ENABLED }
if ($env:NEO4J_URI) { $backendVars["NEO4J_URI"] = $env:NEO4J_URI }
if ($env:NEO4J_USER) { $backendVars["NEO4J_USER"] = $env:NEO4J_USER }
if ($env:NEO4J_PASSWORD) { $backendVars["NEO4J_PASSWORD"] = $env:NEO4J_PASSWORD }
if ($env:NEO4J_ENABLED) { $backendVars["NEO4J_ENABLED"] = $env:NEO4J_ENABLED }

if (-not $backendVars["DATABASE_URL"] -or -not $backendVars["JWT_SECRET"]) {
  throw "Missing required backend env vars. Set DATABASE_URL (or NEON_CONNECTION_STRING) and JWT_SECRET."
}

# Frontend env vars
$frontendVars = @{}
if ($env:NEXT_PUBLIC_API_URL) { $frontendVars["NEXT_PUBLIC_API_URL"] = $env:NEXT_PUBLIC_API_URL }
if ($env:NEXT_PUBLIC_DEMO_AUDIO_ENABLED) { $frontendVars["NEXT_PUBLIC_DEMO_AUDIO_ENABLED"] = $env:NEXT_PUBLIC_DEMO_AUDIO_ENABLED }
if ($env:OPENAI_API_KEY) { $frontendVars["OPENAI_API_KEY"] = $env:OPENAI_API_KEY }

if (-not $frontendVars["NEXT_PUBLIC_API_URL"]) {
  throw "Missing required frontend env vars. Set NEXT_PUBLIC_API_URL."
}

Write-Note "Setting backend env vars..."
Set-RenderEnvVars -ServiceId $backendServiceId -Vars $backendVars

Write-Note "Setting frontend env vars..."
Set-RenderEnvVars -ServiceId $frontendServiceId -Vars $frontendVars

Write-Note "Env vars updated for both services."
