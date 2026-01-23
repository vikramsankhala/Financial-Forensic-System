# GitHub Actions (Azure Container Apps + ACR + Key Vault)

This workflow deploys the app to Azure Container Apps using GitHub Actions. It builds backend/frontend Docker images, pushes to ACR, fetches secrets from Key Vault, and updates Container Apps.

## Files

- Workflow: `.github/workflows/azure-container-apps.yml`

## GitHub repository secrets

Create these **Repository secrets** in GitHub:

Required:
- `AZURE_CREDENTIALS` (service principal JSON)
- `ACR_NAME` (example: `ffsacrcentral01`)

## GitHub repository variables

Create these **Repository variables** (non-secret):

Required:
- `ACR_LOGIN_SERVER` (example: `ffsacrcentral01.azurecr.io`)
- `RESOURCE_GROUP` (example: `ffs-rg`)
- `CONTAINER_APP_ENV` (example: `ffs-env`)
- `BACKEND_CONTAINER_APP_NAME` (example: `ffs-backend`)
- `FRONTEND_CONTAINER_APP_NAME` (example: `ffs-frontend`)
- `KEYVAULT_NAME` (example: `ffskvcentral01`)
- `NEXT_PUBLIC_API_URL` (example: `https://<backend>.azurecontainerapps.io/api`)

Optional (set to empty if unused):
- `NEXT_PUBLIC_DEMO_AUDIO_ENABLED` (true/false)
- `REDIS_ENABLED` (true/false)
- `REDIS_CACHE_TTL`
- `NEO4J_ENABLED` (true/false)

## Key Vault secrets

Create the following secrets in Key Vault (hyphens required):

- `DATABASE-URL`
- `SECRET-KEY`
- `OPENAI-API-KEY`
- `REDIS-URL` (optional)
- `NEO4J-URI` (optional)
- `NEO4J-USER` (optional)
- `NEO4J-PASSWORD` (optional)

## Service principal (AZURE_CREDENTIALS)

Create a service principal with permissions on the resource group:

```
az ad sp create-for-rbac \
  --name "ffs-gha" \
  --role "Contributor" \
  --scopes /subscriptions/<SUB_ID>/resourceGroups/ffs-rg \
  --sdk-auth
```

Copy the JSON output into the `AZURE_CREDENTIALS` secret.

Also assign:
- `AcrPull` on the ACR
- `Key Vault Secrets User` on the Key Vault
- `AcrPush` on the ACR (for image builds in GitHub Actions)

## Managed identity for ACR pulls

The workflow assigns **system-assigned managed identity** to the container apps and sets the ACR registry to use that identity. Ensure the container app identities have `AcrPull` on the registry.

## Run the workflow

Push to `main` or run the workflow manually from the Actions tab.
