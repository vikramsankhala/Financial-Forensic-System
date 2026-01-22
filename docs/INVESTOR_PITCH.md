# About the Prototype

Designer and Developer: Vikram Singh Sankhala / Atanu Talukdar

## Executive Summary (Bank-Focused)
Fraud Detection Forensic Systems is a production-grade platform for banks to detect, investigate, and document financial crime. It unifies real-time transaction scoring, case management, audit trails, and entity network analysis into a single investigator workflow. The system is built on FastAPI + Next.js with ML-based anomaly detection and optional supervised models, designed for compliance-heavy banking environments.

## Technical Overview

### Architecture
- **Backend**: FastAPI (Python 3.11+), modular routers and services.
- **Frontend**: Next.js 14 (App Router) + TypeScript + MUI.
- **Database**: PostgreSQL, with optional TimescaleDB and Redis.
- **ML**: PyTorch autoencoder (anomaly detection), optional XGBoost/LightGBM.
- **Deploy**: Containerized, supports Render/Fly/Netlify/other cloud hosts.

### Key Technical Capabilities
- **Real-time scoring**: Designed for sub-100ms p95 inference with caching.
- **Hybrid detection**: Unsupervised anomaly detection + optional supervised classification.
- **Forensics-ready data model**: Audit logs, case timelines, immutable event trails.
- **Entity graph**: Relationship graphs for fraud ring and exposure analysis.
- **Role-based access**: Admin/Investigator/Analyst/Read-only roles.

### Security & Governance
- JWT authentication with role-based authorization.
- Auditable event trails for evidentiary integrity.
- Configurable CORS, rate limiting, and secret management.
- Optional PII encryption-at-rest (design placeholder).

## Functional Overview (Bank Use Cases)

### Detection & Scoring
- Transaction risk scoring with explainability and feature contributions.
- Threshold-based flagging and risk tiering (low/medium/high).
- Supports batch and real-time scoring endpoints for card, ACH, wire, and RTP.

### Investigation Workbench
- Case creation, status workflow, and investigative notes.
- Timeline reconstruction of events per entity/case.
- Alerts and high-risk transaction triage with SAR-ready documentation.

### Entity Network Analysis
- Entity profiles with relationship graphs.
- Graph traversal to identify suspicious clusters and rings.
- Optional Neo4j integration for advanced graph queries.

### Reporting & Monitoring
- Built-in dashboard metrics for volume, risk distribution, and cases.
- API endpoints for Prometheus-style metrics and health checks.

## User Overview (Bank Personas)

### Primary Personas
- **Fraud Operations Investigator**: triage alerts, open cases, document evidence.
- **AML Analyst**: analyze anomalies, validate scores, enrich case narratives.
- **Compliance Officer**: review cases, enforce policies, audit outcomes.
- **Admin**: manage users/roles, governance, and configuration.
- **Read-only**: internal audit and oversight.

### Typical User Journey
1. **Alert triggered** by anomaly detection.
2. **Investigator reviews** risk score and features.
3. **Case opened** with notes and related entities.
4. **Network analysis** to assess linked behavior.
5. **Outcome recorded** with audit trail for compliance.

## Banking Applications

### Retail & Digital Banking
- Card-present and card-not-present fraud detection.
- Account takeover and mule account identification.
- Customer risk scoring and transaction anomaly detection.

### Corporate & Treasury
- Wire and ACH fraud screening.
- Beneficiary and counterparty risk analysis.
- High-value transaction escalation workflows.

### Compliance & AML
- Case management aligned to AML workflows.
- Sanctions screening hooks and risk-based investigation.
- Audit-ready evidence chain for regulatory examinations.

## Bank Use Cases (Detailed Illustrations)

### 1) Card‑Not‑Present Fraud Triage
**Scenario:** A spike in small, rapid online card transactions across multiple merchants.  
**How the platform responds:**
- **Real‑time scoring** flags a burst pattern and velocity anomalies.
- **Explainability** shows top features (velocity, merchant category, geo mismatch).
- **Case creation** groups related transactions into a single investigation.
- **Outcome:** Investigator validates fraud, blocks compromised cards, and documents evidence.

### 2) Wire Fraud / Business Email Compromise (BEC)
**Scenario:** A corporate client initiates an unusually high wire to a new beneficiary.  
**How the platform responds:**
- **Risk scoring** elevates the transaction due to new beneficiary + high amount.
- **Entity network analysis** highlights links between beneficiary and prior risky entities.
- **Workflow** routes case to fraud ops with escalation notes.
- **Outcome:** Wire is paused, beneficiary re‑verified, case closed with audit trail.

### 3) Mule Account Detection
**Scenario:** Multiple customer accounts show fast in‑out transfers and cash‑outs.  
**How the platform responds:**
- **Behavioral anomaly** flags unusual pass‑through activity.
- **Graph view** reveals a hub‑and‑spoke pattern across related accounts.
- **Case** aggregates impacted accounts and time‑series evidence.
- **Outcome:** Accounts are restricted, SAR documentation is prepared.

### 4) ACH Fraud / Payroll Diversion
**Scenario:** Payroll ACH files show a new destination account and altered amounts.  
**How the platform responds:**
- **Scoring** detects deviation from historical payroll batch patterns.
- **Explainability** highlights amount distribution and beneficiary changes.
- **Investigation workflow** links the case to affected employer and transactions.
- **Outcome:** ACH batch is held, affected parties notified, recovery steps logged.

### 5) Sanctions & AML Watchlist Escalation
**Scenario:** A high‑risk customer attempts international transfers involving a flagged jurisdiction.  
**How the platform responds:**
- **AML rules + ML** raise the risk score above threshold.
- **Case timeline** logs alerts, analyst notes, and decision rationale.
- **Compliance review** uses audit‑ready evidence for regulator questions.
- **Outcome:** Transaction rejected, account reviewed, full audit chain preserved.

## Competitive Positioning for Banks (High-Level)

### Differentiators
- **Unified platform**: detection + case management + audit trail + graph analysis.
- **Forensic-grade evidence chain**: clear, immutable investigative history for audits.
- **Extensible ML**: baseline unsupervised anomaly detection with optional supervised models.
- **Deployment flexibility**: cloud or private environments, supports bank security controls.

### Compared to Typical Market Solutions
- Many platforms focus on **either** detection **or** case management, not both.
- Rule-only systems are brittle; this system supports **adaptive ML** and hybrid models.
- Black-box scoring limits governance; this emphasizes **explainability** and auditability.

### Fit in the Market
Best suited for banks that need:
- Rapid deployment with enterprise-grade workflows.
- Forensic rigor and compliance reporting.
- Graph-based entity investigation without building custom tooling.

## Investor Highlights (Banking)

### Why Now
- Fraud costs and regulatory scrutiny continue to rise.
- Financial institutions seek **lower latency** and **higher explainability**.
- Investigative teams need unified tooling for detection-to-case workflows.

### Business Value
- Reduced manual investigation time with centralized workflows.
- Faster alert resolution and improved case throughput.
- Improved compliance posture through audit trails and role controls.

### Go-to-Market Entry Points
- Mid-market banks and credit unions lacking full-stack tooling.
- Tier-1/2 banks modernizing legacy rule engines.
- Regional banks with high card, wire, or RTP fraud exposure.

## Roadmap Themes (Illustrative)
- Advanced feature engineering and model drift detection.
- Automated evidence collection and reporting templates.
- Additional integrations (KYC/AML vendors, SIEM, data warehouses).
- Enhanced graph analytics and alert prioritization.

---

If you'd like this tailored to a specific industry or investor profile, I can adapt the positioning and use-case narrative.
