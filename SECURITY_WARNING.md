# ⚠️ SECURITY WARNING

## Hardcoded API Key

**IMPORTANT**: This codebase contains a hardcoded OpenAI API key for demonstration purposes only.

**DO NOT USE THIS IN PRODUCTION!**

### Current Implementation

The API key is hardcoded in:
- `frontend/src/app/api/demo-audio/[useCase]/route.ts`
- `frontend/src/app/api/ai-assistant/route.ts`

### Security Risks

1. **API Key Exposure**: Hardcoded keys can be exposed in:
   - Version control (Git history)
   - Code repositories (GitHub, GitLab, etc.)
   - Build artifacts
   - Logs and error messages

2. **Unauthorized Usage**: Exposed keys can be used by anyone, leading to:
   - Unexpected API costs
   - Rate limit exhaustion
   - Potential data exposure

3. **Compliance Issues**: Hardcoded secrets violate:
   - PCI-DSS requirements
   - SOC 2 controls
   - GDPR best practices
   - Industry security standards

### Recommended Approach

**For Production:**

1. **Use Environment Variables:**
   ```bash
   # Set as Fly.io secret
   fly secrets set OPENAI_API_KEY=your-actual-key
   ```

2. **Remove Hardcoded Keys:**
   - Remove the fallback API key from code
   - Use only `process.env.OPENAI_API_KEY`
   - Add validation to fail if key is missing

3. **Use Secret Management:**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Fly.io Secrets (recommended for this project)

4. **Add to .gitignore:**
   - Ensure `.env` files are ignored
   - Never commit API keys

### For Demo/Development

If you must use hardcoded keys for demos:

1. **Use a Separate Demo Key:**
   - Create a dedicated OpenAI account for demos
   - Set usage limits on the key
   - Monitor usage regularly

2. **Rotate Regularly:**
   - Change the key periodically
   - Revoke old keys immediately

3. **Limit Access:**
   - Restrict repository access
   - Use private repositories only
   - Don't share the repository publicly

4. **Add Clear Warnings:**
   - Document the security risk
   - Add comments in code
   - Include in README

### Immediate Actions Required

Before deploying to production:

- [ ] Remove hardcoded API key
- [ ] Set up environment variable configuration
- [ ] Configure Fly.io secrets
- [ ] Update deployment documentation
- [ ] Add key rotation procedures
- [ ] Set up usage monitoring

---

**Remember**: Security is everyone's responsibility. Never commit API keys or secrets to version control!

