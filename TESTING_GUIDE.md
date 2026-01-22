# Testing Guide

## Overview

This guide explains how to test the Fraud Detection Forensic Systems platform, including backend API tests, frontend build verification, and integration testing.

## Prerequisites

### Backend
- Python 3.11+
- PostgreSQL (or SQLite for testing)
- Environment variables configured

### Frontend
- Node.js 20+
- npm or yarn

## Backend Testing

### Setting Up Test Environment

1. **Create test environment file** (`.env.test`):
```bash
DATABASE_URL=sqlite:///./test.db
JWT_SECRET=test-secret-key-for-testing-only
SECRET_KEY=test-secret-key-for-testing-only
ENVIRONMENT=test
LOG_LEVEL=DEBUG
API_PREFIX=/api
```

2. **Set environment variables** (Windows PowerShell):
```powershell
$env:DATABASE_URL="sqlite:///./test.db"
$env:JWT_SECRET="test-secret"
$env:SECRET_KEY="test-secret"
```

### Running Tests

**Run all tests:**
```bash
cd backend
pytest tests/ -v
```

**Run specific test file:**
```bash
pytest tests/test_features.py -v
pytest tests/test_scoring.py -v
pytest tests/test_api_endpoints.py -v
```

**Run with coverage:**
```bash
pytest tests/ --cov=app --cov-report=html
```

### Test Files

1. **`test_features.py`**: Tests feature engineering
   - Feature vector building
   - Scaler fitting and transformation
   - Feature contribution calculations

2. **`test_scoring.py`**: Tests fraud scoring engine
   - Transaction scoring
   - Threshold computation
   - Risk level assignment

3. **`test_api_endpoints.py`**: Tests API endpoints
   - Health check endpoints
   - Metrics endpoint
   - API route structure
   - Authentication requirements

### Known Issues

**Issue**: Tests fail with "Field required" errors for `database_url` and `jwt_secret`

**Solution**: Set environment variables before running tests:
```powershell
$env:DATABASE_URL="sqlite:///./test.db"
$env:JWT_SECRET="test-secret"
pytest tests/ -v
```

## Frontend Testing

### Build Verification

**Check TypeScript compilation:**
```bash
cd frontend
npm run build
```

**Run linter:**
```bash
npm run lint
```

### Manual Testing

1. **Start development server:**
```bash
cd frontend
npm run dev
```

2. **Access application:**
   - Open http://localhost:3000
   - Test login flow
   - Navigate through pages
   - Test API integration

### Component Testing

**Test individual components:**
- Check component imports
- Verify Material UI integration
- Test API client methods
- Validate authentication flow

### Known Issues

**Issue**: Build fails with "Module not found" errors

**Solution**: Ensure `tsconfig.json` has correct path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Then rebuild:
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Integration Testing

### Full Stack Testing

1. **Start backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

2. **Start frontend:**
```bash
cd frontend
npm run dev
```

3. **Test end-to-end flows:**
   - User authentication
   - Transaction scoring
   - Case creation
   - Entity investigation
   - Network graph visualization

### API Testing

**Using curl:**
```bash
# Health check
curl http://localhost:8000/healthz

# Metrics
curl http://localhost:8000/metrics

# Transactions (requires auth)
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/transactions
```

**Using Postman or Insomnia:**
- Import API schema from `/docs` endpoint
- Test all endpoints
- Verify authentication flow
- Test error handling

## Performance Testing

### Backend Performance

**Test transaction scoring latency:**
```python
import time
from app.scoring import FraudScoringEngine

engine = FraudScoringEngine(...)
start = time.time()
result = engine.score_transaction(transaction)
latency = (time.time() - start) * 1000  # ms
assert latency < 100  # Sub-100ms target
```

### Frontend Performance

**Check bundle size:**
```bash
cd frontend
npm run build
# Check .next/analyze for bundle analysis
```

**Lighthouse audit:**
- Run Chrome DevTools Lighthouse
- Target: 90+ Performance score
- Check Core Web Vitals

## Test Coverage Goals

- **Backend**: 70%+ code coverage
- **Frontend**: 60%+ component coverage
- **Critical paths**: 90%+ coverage (auth, scoring, case management)

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: |
          cd backend
          pip install -r requirements.txt
          pytest tests/ -v

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: |
          cd frontend
          npm install
          npm run build
          npm run lint
```

## Troubleshooting

### Backend Tests Failing

1. Check environment variables are set
2. Verify database connection
3. Check Python version (3.11+)
4. Ensure all dependencies installed

### Frontend Build Failing

1. Clear cache: `rm -rf .next node_modules`
2. Reinstall: `npm install`
3. Check TypeScript config
4. Verify path aliases in `tsconfig.json`

### Integration Tests Failing

1. Ensure backend is running
2. Check CORS configuration
3. Verify API URL in frontend config
4. Check authentication tokens

## Next Steps

1. Add end-to-end tests with Playwright
2. Set up CI/CD pipeline
3. Add performance benchmarks
4. Implement visual regression testing
5. Add security testing (OWASP ZAP, etc.)

