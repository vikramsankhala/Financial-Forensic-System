# Architecture Documentation

## System Overview

The Fraud Detection Forensic Systems platform is a real-time financial fraud detection and investigation system designed for forensic audit teams. It combines machine learning-based anomaly detection with rule-based compliance checks and comprehensive case management capabilities.

## High-Level Architecture

```
┌─────────────────┐
│   Frontend      │  Next.js/React SPA
│   (Next.js)     │  Port: 3000
└────────┬────────┘
         │ HTTPS/REST API
         │
┌────────▼────────┐
│   Backend       │  FastAPI Application
│   (FastAPI)     │  Port: 8000
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│  DB   │ │ Models│  PostgreSQL + PyTorch/XGBoost
│(Postgres)│ │        │
└────────┘ └───────┘
```

## Component Architecture

### Backend Components

#### 1. API Gateway (FastAPI)

**Location**: `backend/app/main.py`, `backend/app/routers/`

**Responsibilities**:
- REST API endpoints
- Request routing and validation
- Authentication and authorization
- CORS handling
- OpenAPI documentation

**Key Endpoints**:
- `/api/transactions/*` - Transaction scoring and management
- `/api/cases/*` - Case management
- `/api/entities/*` - Entity exploration
- `/api/auth/*` - Authentication
- `/metrics` - Prometheus metrics

#### 2. Fraud Scoring Engine

**Location**: `backend/app/scoring.py`

**Components**:
- **Autoencoder Model** (`backend/app/autoencoder.py`): PyTorch-based unsupervised anomaly detection
- **Feature Engineering** (`backend/app/features.py`): Transaction feature extraction and normalization
- **Scoring Logic**: Threshold-based risk level assignment

**Flow**:
```
Transaction → Feature Engineering → Scaled Features → Autoencoder → 
Reconstruction Error → Threshold Check → Risk Level → Decision
```

**Model Architecture**:
- **Input Dimension**: 18 features
- **Encoder**: Input → Hidden1 → Hidden2 → Latent (≈6 dims)
- **Decoder**: Latent → Hidden2 → Hidden1 → Output
- **Loss Function**: MSE (Mean Squared Error)
- **Activation**: ReLU with Dropout (0.1)

#### 3. Forensic Agents

**Location**: `backend/app/agents.py`

**AnomalyAgent**:
- Wraps scoring engine
- Handles transaction scoring workflow
- Integrates with database

**ComplianceAgent**:
- Velocity checks (transaction frequency limits)
- Geographic consistency (impossible travel detection)
- Merchant category restrictions
- Sanctions/PEP screening (stub for external integration)

**InvestigationAgent**:
- Case lifecycle management
- Auto-case creation from high-risk transactions
- Entity linking and relationship tracking
- Status transitions

**MonitoringAgent**:
- Concept drift detection
- Score distribution tracking
- Performance metrics

#### 4. Data Layer

**Location**: `backend/app/models.py`, `backend/app/database.py`

**Database Schema**:

```
transactions
├── id (PK)
├── transaction_id (unique)
├── amount, currency, merchant_*
├── customer_id, account_id, device_id
├── geo_*, ip_address
└── timestamp, created_at

scores
├── id (PK)
├── transaction_id (FK → transactions)
├── anomaly_score, reconstruction_error
├── classifier_score (optional)
├── risk_level (enum)
├── decision (approve/review/block)
└── feature_contributions (JSON)

cases
├── id (PK)
├── case_id (unique)
├── title, description, status, priority
├── owner_id (FK → users)
├── tags (JSON)
└── created_at, updated_at, closed_at

case_events
├── id (PK)
├── case_id (FK → cases)
├── event_type, title, content
├── metadata (JSON)
└── created_by_id, created_at

entities
├── id (PK)
├── entity_id (unique)
├── entity_type (customer/merchant/device/ip/account)
├── name, metadata (JSON)
└── created_at, updated_at

entity_links
├── id (PK)
├── from_entity_id, to_entity_id (FK → entities)
├── relationship_type
└── metadata (JSON)

audit_log
├── id (PK)
├── actor_id, actor_username
├── action, resource_type, resource_id
├── before_state, after_state (JSON)
└── ip_address, user_agent, created_at

users
├── id (PK)
├── username, email (unique)
├── hashed_password
├── role (enum: investigator/analyst/admin/read_only)
└── is_active, created_at, updated_at
```

**Migrations**: Managed via Alembic (`backend/alembic/`)

#### 5. Authentication & Authorization

**Location**: `backend/app/auth.py`

**Authentication**:
- JWT-based token authentication
- Password hashing via bcrypt
- Token expiration configurable

**Authorization**:
- Role-based access control (RBAC)
- Roles: `INVESTIGATOR`, `ANALYST`, `ADMIN`, `READ_ONLY`
- Endpoint-level permission checks via FastAPI dependencies

**Permission Matrix**:
- **INVESTIGATOR**: Full case management, transaction scoring
- **ANALYST**: View transactions/scores, comment on cases
- **ADMIN**: User management, configuration
- **READ_ONLY**: View-only access

### Frontend Components

#### 1. Application Structure

**Framework**: Next.js 14 (App Router)

**Key Pages**:
- `/login` - Authentication
- `/dashboard` - Executive dashboard with KPIs
- `/transactions` - Transaction explorer and scoring
- `/cases` - Case management workspace
- `/entities` - Entity 360 view and network graph

#### 2. Component Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Home (redirects to dashboard)
│   ├── login/page.tsx      # Login page
│   ├── dashboard/page.tsx  # Dashboard with KPIs
│   ├── transactions/page.tsx
│   ├── cases/page.tsx
│   └── entities/page.tsx
├── components/
│   ├── Layout.tsx          # Main app layout with sidebar
│   └── ThemeProvider.tsx   # MUI theme provider (light/dark)
├── lib/
│   └── api.ts              # Axios client with auth interceptors
└── types/
    └── index.ts            # TypeScript type definitions
```

#### 3. State Management

- **API State**: React hooks (`useState`, `useEffect`)
- **Auth State**: localStorage for JWT tokens
- **Theme State**: localStorage for dark/light mode preference

## Data Flow

### Transaction Scoring Flow

```
1. Client sends transaction → POST /api/transactions/score
2. Backend validates input (Pydantic)
3. Store transaction in DB
4. FeatureEngineer builds feature vector
5. FeatureEngineer transforms (scales) features
6. Autoencoder computes reconstruction error
7. ScoringEngine applies threshold → risk level
8. ComplianceAgent runs rule checks
9. If high risk → InvestigationAgent creates case
10. Store score in DB
11. Log audit event
12. Return score + risk level + reasons
```

### Case Investigation Flow

```
1. High-risk transaction triggers auto-case creation
2. Case created with status=TRIAGE
3. Entities extracted and linked from transaction
4. Investigator views case in UI
5. Investigator adds notes/events
6. Investigator changes status → INVESTIGATION
7. Investigator links additional transactions/entities
8. Investigator documents findings
9. Status → REMEDIATION (actions taken)
10. Status → CLOSED (case resolved)
11. All actions logged to audit_log
```

## Model Training Pipeline

**Location**: `backend/scripts/train_model.py`

**Steps**:
1. Generate synthetic transaction data (10,000 samples)
2. Build feature vectors for all transactions
3. Fit StandardScaler on feature matrix
4. Transform features with scaler
5. Train autoencoder (50 epochs, batch_size=32)
6. Compute reconstruction errors for all samples
7. Calculate threshold (95th percentile)
8. Save models:
   - `models/autoencoder.pth` - PyTorch model
   - `models/feature_scaler.pkl` - Scikit-learn scaler

**Model Performance**:
- Training loss typically converges to < 0.01
- Threshold calibrated to flag ~3-5% of transactions

## Deployment Architecture

### Fly.io Deployment

**Backend**:
- Docker container with Python 3.11
- Uvicorn ASGI server
- PostgreSQL connection via Fly private network
- Environment variables via Fly secrets

**Frontend**:
- Docker container with Node.js 20
- Next.js standalone build
- Static assets served by Next.js
- API URL configured via environment variable

**Database**:
- Fly.io Managed Postgres
- Private network connection
- Automated backups

### Scaling Considerations

- **Horizontal Scaling**: Stateless backend, can run multiple instances
- **Database**: Connection pooling (SQLAlchemy pool_size=10)
- **Model Serving**: Models loaded per instance (consider model server for production)
- **Caching**: Not implemented (consider Redis for production)

## Security Architecture

### Authentication Flow

```
1. User submits credentials → POST /api/auth/login
2. Backend validates credentials (bcrypt)
3. Backend generates JWT token
4. Token includes: username, expiration, role
5. Client stores token in localStorage
6. Client includes token in Authorization header
7. Backend validates token on each request
8. Backend extracts user/role from token
```

### Audit Trail

- **Immutable Logging**: All sensitive actions logged to `audit_log`
- **Before/After States**: State snapshots for updates
- **Actor Tracking**: User ID, username, IP, user agent
- **Timestamp**: UTC timestamps for all events

### Data Protection (Design Hooks)

**Encryption at Rest**:
- Database: Fly.io Postgres TLS
- Model Files: Consider encryption for sensitive models
- PII Fields: Stub for field-level encryption

**Encryption in Transit**:
- HTTPS/TLS enforced by Fly.io
- Database connections via private network

## Monitoring & Observability

### Metrics

**Prometheus Metrics** (`/metrics`):
- `http_requests_total` - Request counts by endpoint/status
- `http_request_duration_seconds` - Request latency
- `model_inference_duration_seconds` - Model inference time
- `model_inference_errors_total` - Model errors

### Health Checks

- `/healthz` - Liveness probe (always returns 200)
- `/readyz` - Readiness probe (checks DB connectivity)

### Logging

- Structured logging (JSON format recommended)
- Correlation IDs for request tracing
- Log levels: DEBUG, INFO, WARNING, ERROR

## Performance Targets

- **Transaction Scoring**: < 100ms p95 latency
- **API Response Time**: < 200ms p95
- **Database Queries**: < 50ms p95
- **Model Inference**: < 50ms p95

## Extensibility Points

### External Integrations (Stubs)

1. **AML/Sanctions Screening**: `ComplianceAgent.check_sanctions()` - Replace with external API call
2. **PEP Screening**: Similar stub in ComplianceAgent
3. **Document Storage**: Case attachments - Stub interface for S3/Blob storage
4. **Notification Service**: Case status changes - Stub for email/SMS/Webhook

### Model Enhancements

1. **ONNX Export**: Stub in `autoencoder.py` for ONNX conversion
2. **Second-Stage Classifier**: Optional XGBoost integration point
3. **Feature Store**: Consider external feature store for production
4. **Model Versioning**: Add model version tracking

## Future Enhancements

1. **Real-time Streaming**: Kafka/RabbitMQ integration for high-throughput
2. **Graph Database**: Neo4j for complex relationship queries
3. **Advanced ML**: Ensemble models, deep learning classifiers
4. **Explainability**: SHAP/LIME integration for feature attribution
5. **A/B Testing**: Model version comparison framework
6. **Automated Remediation**: Auto-blocking, card freezing workflows

