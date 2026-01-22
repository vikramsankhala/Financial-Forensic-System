# Repository Description

**Production-Grade Real-Time Financial Fraud Detection & Forensics Platform**

A comprehensive fraud detection and investigation system designed for financial crime analysis teams. Combines machine learning-based anomaly detection with rule-based compliance checks and full forensic case management workflows.

## Key Features

🔍 **Real-Time Fraud Detection**
- Sub-100ms transaction scoring with PyTorch autoencoder
- Hybrid ML engine (unsupervised + supervised)
- Automatic case creation for high-risk transactions

📊 **Forensic Investigation Workbench**
- Case management with full audit trails
- Entity relationship network visualization
- Timeline reconstruction and evidence tracking
- Role-based access control (Investigator, Analyst, Admin)

🎯 **Use Case Demonstrations**
- Real-time alert triage workflows
- Complex multi-entity case investigation
- Network analysis for fraud ring detection

## Tech Stack

**Backend:** FastAPI (Python 3.11+), PostgreSQL, PyTorch, XGBoost  
**Frontend:** Next.js 14, React, TypeScript, Material UI  
**Deployment:** Docker, Fly.io  
**ML:** Autoencoder anomaly detection, feature engineering pipeline

## Quick Start

```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend  
cd frontend && npm install
npm run dev
```

## Use Cases

Perfect for financial institutions, forensic audit teams, and compliance departments requiring:
- Real-time transaction monitoring
- Fraud investigation workflows
- Regulatory compliance reporting
- Entity risk assessment

---

**Built for Deloitte-style forensic teams** | Production-ready architecture | Full audit logging | Enterprise-grade security

