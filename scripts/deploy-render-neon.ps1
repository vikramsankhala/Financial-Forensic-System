Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Note([string]$Message) {
  Write-Host "[deploy] $Message"
}

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Missing required command: $Name"
  }
}

Write-Note "Starting Render + Neon deployment helper..."

# ---------- Neon ----------
# If you already have a Neon connection string, set it and skip creation:
#   $env:NEON_CONNECTION_STRING="postgresql://..."
if (-not $env:NEON_CONNECTION_STRING) {
  Write-Note "NEON_CONNECTION_STRING not set."
  Write-Note "If you want the script to create a Neon database, set:"
  Write-Note "  NEON_PROJECT_NAME (e.g. fraud-detection)"
  Write-Note "  NEON_DATABASE_NAME (e.g. fraud_detection)"
  Write-Note "Otherwise, set NEON_CONNECTION_STRING and re-run."

  if ($env:NEON_PROJECT_NAME -and $env:NEON_DATABASE_NAME) {
    Require-Command "node"
    Require-Command "npm"

    if (-not (Get-Command neonctl -ErrorAction SilentlyContinue)) {
      Write-Note "Installing neonctl..."
      npm i -g neonctl | Out-Null
    }

    Write-Note "Authenticating with Neon (will open browser if needed)..."
    neonctl auth

    Write-Note "Creating Neon project: $env:NEON_PROJECT_NAME"
    $project = neonctl projects create --name $env:NEON_PROJECT_NAME | ConvertFrom-Json
    $projectId = $project.id

    Write-Note "Creating Neon database: $env:NEON_DATABASE_NAME"
    neonctl databases create --project-id $projectId --name $env:NEON_DATABASE_NAME | Out-Null

    Write-Note "Fetching Neon connection string..."
    $conn = neonctl connection-string --project-id $projectId --database-name $env:NEON_DATABASE_NAME
    $env:NEON_CONNECTION_STRING = $conn.Trim()
  } else {
    throw "Missing NEON_CONNECTION_STRING or NEON_* create settings. Aborting."
  }
}

Write-Note "Neon connection string ready."

# ---------- Render ----------
# Requires the Render deploy hook URL to be set.
# Find it in Render -> Service -> Settings -> Deploy Hook
if (-not $env:RENDER_API_TOKEN) {
  throw "Missing RENDER_API_TOKEN. Create one in Render -> Account Settings -> API Keys."
}

if (-not $env:RENDER_SERVICE_NAME) {
  $env:RENDER_SERVICE_NAME = "fraud-detection-backend"
}

Write-Note "Looking up Render service ID for: $env:RENDER_SERVICE_NAME"
$renderApiBase = "https://api.render.com/v1"
$renderHeaders = @{
  "Authorization" = "Bearer $env:RENDER_API_TOKEN"
  "Content-Type"  = "application/json"
}

$services = Invoke-RestMethod -Method GET -Uri "$renderApiBase/services" -Headers $renderHeaders
$service = $services | Where-Object { $_.name -eq $env:RENDER_SERVICE_NAME } | Select-Object -First 1
if (-not $service) {
  throw "Render service '$env:RENDER_SERVICE_NAME' not found. Create it first in Render UI."
}

$serviceId = $service.id
Write-Note "Render service ID: $serviceId"

# Prepare env vars payload
$envVars = @{}
$dbUrl = $env:DATABASE_URL
if (-not $dbUrl) {
  $dbUrl = $env:NEON_CONNECTION_STRING
}
if ($dbUrl) { $envVars["DATABASE_URL"] = $dbUrl }
if ($env:JWT_SECRET) { $envVars["JWT_SECRET"] = $env:JWT_SECRET }
if ($env:OPENAI_API_KEY) { $envVars["OPENAI_API_KEY"] = $env:OPENAI_API_KEY }
if ($env:REDIS_URL) { $envVars["REDIS_URL"] = $env:REDIS_URL }
if ($env:REDIS_ENABLED) { $envVars["REDIS_ENABLED"] = $env:REDIS_ENABLED }
if ($env:NEO4J_URI) { $envVars["NEO4J_URI"] = $env:NEO4J_URI }
if ($env:NEO4J_USER) { $envVars["NEO4J_USER"] = $env:NEO4J_USER }
if ($env:NEO4J_PASSWORD) { $envVars["NEO4J_PASSWORD"] = $env:NEO4J_PASSWORD }
if ($env:NEO4J_ENABLED) { $envVars["NEO4J_ENABLED"] = $env:NEO4J_ENABLED }

if ($envVars.Count -eq 0) {
  throw "No Render env vars provided. Set DATABASE_URL or NEON_CONNECTION_STRING and JWT_SECRET."
}

Write-Note "Setting Render environment variables via API..."
$envList = @()
foreach ($key in $envVars.Keys) {
  $envList += @{ key = $key; value = $envVars[$key] }
}

try {
  $bulkBody = @{ envVars = $envList } | ConvertTo-Json
  Invoke-RestMethod -Method PUT -Uri "$renderApiBase/services/$serviceId/env-vars" -Headers $renderHeaders -Body $bulkBody | Out-Null
} catch {
  Write-Note "Bulk env var update failed, falling back to per-variable updates..."
  foreach ($item in $envList) {
    $body = $item | ConvertTo-Json
    Invoke-RestMethod -Method POST -Uri "$renderApiBase/services/$serviceId/env-vars" -Headers $renderHeaders -Body $body | Out-Null
  }
}

if (-not $env:RENDER_DEPLOY_HOOK_URL) {
  throw "Missing RENDER_DEPLOY_HOOK_URL. Set it and re-run."
}

Write-Note "Triggering Render deploy hook..."
Invoke-WebRequest -Method POST -Uri $env:RENDER_DEPLOY_HOOK_URL | Out-Null
Write-Note "Deploy triggered. Check Render build logs."

Write-Note "Next steps (run in Render shell after deploy):"
Write-Host "  alembic upgrade head"
Write-Host "  python scripts/seed_data.py"
Write-Host "  python scripts/train_model.py"

Write-Note "Done."
