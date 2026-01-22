# Deployment Checklist

Use this checklist when deploying the Fraud Detection Forensic Systems platform to production.

## Pre-Deployment

### Backend

- [ ] Review and update `.env` configuration
- [ ] Generate strong JWT secret: `openssl rand -hex 32`
- [ ] Configure database connection string
- [ ] Set appropriate log levels
- [ ] Review CORS settings (restrict origins)
- [ ] Train and save models (`python scripts/train_model.py`)
- [ ] Run database migrations (`alembic upgrade head`)
- [ ] Seed initial users (`python scripts/seed_data.py`)
- [ ] Change default passwords
- [ ] Review security settings

### Frontend

- [ ] Set `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Review environment variables
- [ ] Build and test locally (`npm run build`)
- [ ] Verify API connectivity

### Infrastructure

- [ ] Set up Fly.io Postgres database
- [ ] Configure database backups
- [ ] Set up monitoring and alerts
- [ ] Configure SSL/TLS certificates
- [ ] Set up domain names (if custom)
- [ ] Review resource limits (CPU, memory)

## Deployment Steps

### 1. Database Setup

```bash
# Create Postgres cluster
fly pg create fraud-detection-db

# Note the connection string for later use
```

### 2. Backend Deployment

```bash
cd backend

# Login to Fly.io
fly auth login

# Launch app (first time only)
fly launch

# Set secrets
fly secrets set JWT_SECRET="your-generated-secret"
fly secrets set DATABASE_URL="postgresql://..."

# Deploy
fly deploy

# SSH into container and initialize
fly ssh console -a fraud-detection-backend
# Inside container:
alembic upgrade head
python scripts/seed_data.py
python scripts/train_model.py
```

### 3. Frontend Deployment

```bash
cd frontend

# Launch app
fly launch

# Set API URL
fly secrets set NEXT_PUBLIC_API_URL="https://fraud-detection-backend.fly.dev/api"

# Deploy
fly deploy
```

## Post-Deployment

### Verification

- [ ] Backend health check: `curl https://your-backend.fly.dev/healthz`
- [ ] Frontend loads correctly
- [ ] Login works with seeded users
- [ ] Transaction scoring endpoint responds
- [ ] Database queries work
- [ ] Metrics endpoint accessible

### Security Hardening

- [ ] Change all default passwords
- [ ] Review and restrict CORS origins
- [ ] Enable rate limiting (if not already)
- [ ] Configure firewall rules
- [ ] Set up intrusion detection
- [ ] Enable audit logging
- [ ] Review access logs

### Monitoring

- [ ] Set up Prometheus/Grafana (if using)
- [ ] Configure alerting for:
  - High error rates
  - Slow response times
  - Database connection issues
  - Model inference failures
- [ ] Set up log aggregation
- [ ] Monitor disk space
- [ ] Monitor database performance

### Backup & Recovery

- [ ] Verify database backups are running
- [ ] Test backup restoration
- [ ] Document recovery procedures
- [ ] Set up automated backups

### Documentation

- [ ] Update deployment documentation
- [ ] Document environment variables
- [ ] Create runbook for common issues
- [ ] Document rollback procedures

## Production Considerations

### Performance

- [ ] Load test API endpoints
- [ ] Optimize database queries
- [ ] Consider caching layer (Redis)
- [ ] Monitor model inference latency
- [ ] Set up auto-scaling if needed

### Compliance

- [ ] Review data retention policies
- [ ] Ensure audit logs are immutable
- [ ] Configure data encryption at rest
- [ ] Review PII handling procedures
- [ ] Document compliance measures

### Disaster Recovery

- [ ] Document disaster recovery plan
- [ ] Test failover procedures
- [ ] Set up multi-region deployment (if needed)
- [ ] Document incident response procedures

## Maintenance

### Regular Tasks

- [ ] Weekly: Review error logs
- [ ] Weekly: Check database performance
- [ ] Monthly: Review security logs
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Retrain models
- [ ] Quarterly: Review and update thresholds

### Updates

- [ ] Keep dependencies updated
- [ ] Monitor security advisories
- [ ] Apply security patches promptly
- [ ] Test updates in staging first

## Rollback Plan

If deployment fails:

1. **Backend Rollback**:
   ```bash
   fly releases
   fly releases rollback <previous-release-id>
   ```

2. **Frontend Rollback**:
   ```bash
   fly releases
   fly releases rollback <previous-release-id>
   ```

3. **Database Rollback**:
   ```bash
   fly pg connect -a fraud-detection-db
   # Run reverse migrations if needed
   ```

## Support Contacts

- **Technical Issues**: [Your DevOps Team]
- **Security Issues**: [Your Security Team]
- **Database Issues**: [Your DBA Team]

## Notes

- Keep deployment logs for audit purposes
- Document any deviations from standard procedures
- Update this checklist based on lessons learned

