# Azure DevOps Pipeline (Azure Container Apps + ACR + Key Vault)

This repo includes `azure-pipelines.yml` to build Docker images for `backend` and `frontend`, push them to Azure Container Registry (ACR), and deploy to Azure Container Apps. Secrets are pulled from Azure Key Vault during the pipeline run.

## What the pipeline does

- Builds `backend/Dockerfile` and `frontend/Dockerfile`
- Pushes images to ACR with tags `latest` and the build ID
- Deploys both images to separate App Services
- Sets app settings from Azure DevOps pipeline variables

## Azure resources you need

1. **Azure Container Registry (ACR)**
2. **Azure Container Apps Environment**
3. **Two Azure Container Apps**
   - Backend app (FastAPI)
   - Frontend app (Next.js)
4. **Azure Key Vault**
5. **Azure Database for PostgreSQL** (or any PostgreSQL provider)

## Azure DevOps setup

### 1. Create service connections

- **ACR service connection** (Docker registry):
  - Service type: Docker Registry
  - Registry type: Azure Container Registry
  - Name it and use in pipeline variable `acrServiceConnection`

- **Azure Resource Manager service connection**:
  - Used for Container Apps deployments and Key Vault
  - Name it and use in pipeline variable `azureServiceConnection`

Ensure the Azure DevOps service principal has:
- `AcrPull` on the ACR
- `Container Apps Contributor` on the resource group
- `Key Vault Secrets User` (or equivalent) on the Key Vault

### 2. Create pipeline variables

Create a variable group (recommended) such as `ffs-prod` and add:

Required:
- `acrLoginServer` (example: `myregistry.azurecr.io`)
- `acrName` (ACR resource name, used for credential lookup)
- `resourceGroup`
- `containerAppEnv` (Container Apps environment name)
- `backendContainerAppName`
- `frontendContainerAppName`
- `keyVaultName`
- `DATABASE_URL`
- `SECRET_KEY`
- `NEXT_PUBLIC_API_URL`

Optional (set to empty if unused):
- `OPENAI_API_KEY`
- `REDIS_URL`
- `REDIS_ENABLED` (true/false)
- `REDIS_CACHE_TTL`
- `NEO4J_URI`
- `NEO4J_USER`
- `NEO4J_PASSWORD`
- `NEO4J_ENABLED` (true/false)
- `NEXT_PUBLIC_DEMO_AUDIO_ENABLED` (true/false)

Also add:
- `acrServiceConnection`
- `azureServiceConnection`
- `keyVaultSecretsFilter` (comma-separated Key Vault secrets to pull)

Mark secrets as **secret** in Azure DevOps.

### 3. Create Key Vault secrets

Create Key Vault secrets with names that match the values in `keyVaultSecretsFilter` (defaults in the pipeline). Key Vault secret names cannot include underscores, so use hyphens. Azure DevOps will map hyphens to underscores when exposing variables (for example, `DATABASE-URL` becomes `DATABASE_URL`).

- `DATABASE-URL`
- `SECRET-KEY`
- `OPENAI-API-KEY`
- `REDIS-URL`
- `NEO4J-URI`
- `NEO4J-USER`
- `NEO4J-PASSWORD`

If you do not use some secrets, remove them from `keyVaultSecretsFilter` or create empty placeholders.

### 4. Enable ACR admin user (if not using managed identity)

The pipeline retrieves ACR credentials using `az acr credential show`. Ensure **Admin user** is enabled on the registry or switch the pipeline to use managed identity.

### 5. Create the pipeline

Create a new pipeline in Azure DevOps and point it to `azure-pipelines.yml` in the repo root.

## Post-deploy steps (one-time)

After first deployment, run database migrations and seed data:

1. Open the backend App Service and use **SSH** (or Azure CLI):
   ```bash
   alembic upgrade head
   python scripts/seed_data.py
   python scripts/train_model.py
   ```

2. Validate the API:
   - `/healthz`
   - `/readyz`
   - `/docs`

## Notes

- The pipeline uses `az containerapp` to create/update apps. Ensure the Azure CLI in the agent supports Container Apps.
- Secrets are pulled from Key Vault into the pipeline and then stored as Container App secrets.
- For production, prefer using a managed identity for ACR pull instead of admin credentials.
