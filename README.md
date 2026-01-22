# Fraud Detection Forensic Systems

A production-grade, real-time financial fraud detection and forensics platform designed for financial crime investigation teams (Deloitte-style forensics workflows).

## Features

- **Real-time Transaction Scoring**: Sub-100ms p95 inference latency for fraud detection
- **Hybrid Detection Engine**: 
  - Unsupervised autoencoder-based anomaly detection (PyTorch)
  - Optional supervised classifier layer (XGBoost/LightGBM)
- **Financial Forensics Workbench**:
  - Case management and investigation workflows
  - Forensic audit trails with full evidentiary chain
  - Timeline reconstruction of entity behavior
  - Network graph visualization of relationships
- **Compliance & Governance**:
  - Role-based access control (Investigator, Analyst, Admin, Read-only)
  - Immutable audit logging
  - Hooks for AML and sanctions screening
- **Modern UI**: Professional React/Next.js frontend with light/dark theme support

## Architecture

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: Next.js 14 with React and TypeScript
- **Database**: PostgreSQL (Fly.io Postgres)
- **ML Framework**: PyTorch (autoencoder), XGBoost (optional classifier)
- **Deployment**: Docker containers on Fly.io

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL (local or Fly.io)
- Docker (for containerized deployment)
- Fly.io CLI (`flyctl`)

### Environment Templates

Template files are included to help you create local env files (non-secret):
- Root template: `env.template` → copy to `.env` (for backend defaults)
- Backend template: `backend/env.template` → copy to `backend/.env`
- Frontend template: `frontend/env.local.template` → copy to `frontend/.env.local`

### Local Development

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.template .env
# Edit .env with your database URL and secrets

# Run database migrations
alembic upgrade head

# Seed initial data
python scripts/seed_data.py

# Train the autoencoder model
python scripts/train_model.py

# Run the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp env.local.template .env.local
# Edit .env.local with your API URL

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Default Credentials

After seeding the database, you can log in with:

- **Admin**: `admin` / `admin123`
- **Investigator**: `investigator` / `investigator123`
- **Analyst**: `analyst` / `analyst123`

⚠️ **Change these passwords in production!**

## Deployment to Fly.io

### 1. Install Fly.io CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Create PostgreSQL Database

```bash
# Create a Postgres cluster
fly pg create fraud-detection-db

# Attach to your backend app (after creating it)
fly pg attach fraud-detection-db --app fraud-detection-backend
```

### 3. Deploy Backend

```bash
cd backend

# Login to Fly.io
fly auth login

# Launch the app (first time)
fly launch

# Set secrets
fly secrets set JWT_SECRET="your-secret-key-here"
fly secrets set DATABASE_URL="$(fly pg connect -a fraud-detection-db | grep postgresql)"

# Deploy
fly deploy
```

### 4. Deploy Frontend

```bash
cd frontend

# Launch the app
fly launch

# Set API URL
fly secrets set NEXT_PUBLIC_API_URL="https://fraud-detection-backend.fly.dev/api"

# Deploy
fly deploy
```

### 5. Initialize Database

After deployment, SSH into the backend container and run migrations:

```bash
fly ssh console -a fraud-detection-backend

# Inside the container
alembic upgrade head
python scripts/seed_data.py
python scripts/train_model.py
```

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py             # Configuration
│   │   ├── database.py           # Database connection
│   │   ├── models.py             # SQLAlchemy models
│   │   ├── schemas.py            # Pydantic schemas
│   │   ├── auth.py               # Authentication & authorization
│   │   ├── features.py           # Feature engineering
│   │   ├── autoencoder.py        # PyTorch autoencoder model
│   │   ├── scoring.py            # Fraud scoring engine
│   │   ├── agents.py             # Forensic agents
│   │   ├── audit.py              # Audit logging
│   │   └── routers/              # API routes
│   │       ├── transactions.py
│   │       ├── cases.py
│   │       ├── entities.py
│   │       ├── auth.py
│   │       └── metrics.py
│   ├── alembic/                  # Database migrations
│   ├── scripts/
│   │   ├── train_model.py        # Model training script
│   │   └── seed_data.py          # Database seeding
│   ├── tests/                     # Unit tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── fly.toml
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js app directory
│   │   ├── components/           # React components
│   │   ├── lib/                  # Utilities
│   │   └── types/                # TypeScript types
│   ├── package.json
│   ├── Dockerfile
│   └── fly.toml
├── docs/
│   ├── architecture.md           # Architecture documentation
│   └── forensics-playbook.md     # Investigator playbook
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Transactions
- `POST /api/transactions/score` - Score a transaction for fraud
- `GET /api/transactions` - List transactions (with filters)
- `GET /api/transactions/{id}` - Get transaction details

### Cases
- `GET /api/cases` - List cases
- `POST /api/cases` - Create a new case
- `GET /api/cases/{id}` - Get case details
- `PATCH /api/cases/{id}` - Update case
- `POST /api/cases/{id}/notes` - Add note/event to case
- `GET /api/cases/{id}/report` - Get case report

### Entities
- `GET /api/entities/{id}` - Get entity details
- `GET /api/entities/{id}/network` - Get entity network graph

### Monitoring
- `GET /metrics` - Prometheus metrics endpoint
- `GET /healthz` - Health check
- `GET /readyz` - Readiness check

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests (when implemented)
cd frontend
npm test
```

## Security Considerations

This is a demonstration system. For production deployment:

1. **Change all default passwords**
2. **Use strong JWT secrets** (generate with `openssl rand -hex 32`)
3. **Enable TLS/HTTPS** (handled by Fly.io)
4. **Configure CORS** properly (currently allows all origins)
5. **Implement rate limiting**
6. **Add input validation** and sanitization
7. **Encrypt sensitive data at rest** (PII fields)
8. **Implement proper secret management** (use Fly.io secrets or external vault)
9. **Regular security audits** and dependency updates
10. **PCI-DSS compliance** considerations if processing card data

## Model Training

The autoencoder model is trained on synthetic data. To retrain:

```bash
cd backend
python scripts/train_model.py
```

The script will:
1. Generate synthetic transaction data
2. Build feature vectors
3. Train the autoencoder
4. Compute anomaly thresholds
5. Save models to `backend/models/`

## Monitoring

- **Metrics**: Prometheus-style metrics at `/metrics`
- **Health Checks**: `/healthz` and `/readyz` endpoints
- **Audit Logs**: All sensitive actions logged to `audit_log` table
- **Model Drift**: Basic drift detection via `MonitoringAgent`

## Contributing

This is a demonstration project. For production use:

1. Add comprehensive test coverage
2. Implement proper error handling
3. Add API rate limiting
4. Enhance security controls
5. Optimize model inference latency
6. Add more sophisticated feature engineering
7. Implement proper logging and observability
8. Add CI/CD pipelines

## License

This project is provided as-is for demonstration purposes.

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Fly.io Documentation](https://fly.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PyTorch Documentation](https://pytorch.org/docs/)

