# Fraud Detection & Forensic Investigation Platform
## Investor Overview

---

## Executive Summary

The platform is an AI-native, cloud-native fraud detection and forensic investigation system designed to address critical gaps in the enterprise fraud management (EFM) market. Unlike traditional black-box fraud detection suites, the platform combines transparent, explainable machine learning models with a purpose-built investigator console that enables deep forensic workflows.

The core differentiation rests on three pillars: full model and code transparency versus opaque EFM suites, a forensic-first investigator console with unmatched workflow depth, and sub-100ms transaction scoring at enterprise scale. The platform serves mid-tier banks, neo-banks, payment processors, and forensic consulting practices, with initial focus on India, Southeast Asia, and the Middle East.

The financial trajectory targets approximately USD 8M ARR by Year 3 with ~12 institutions, scaling to USD 50M+ ARR and USD 300M+ exit potential within 5-7 years. The investment thesis centers on a massive and growing fraud/RegTech total addressable market (TAM), the shift toward explainable AI and model governance, strong services-plus-SaaS unit economics, and clear strategic acquisition pathways.

The platform addresses a fundamental tension in fraud detection: enterprises need both sophisticated AI-driven anomaly detection and complete transparency for regulatory compliance and investigator trust. Legacy vendors offer powerful but opaque models; open-source solutions lack production-grade infrastructure and forensic tooling. This platform bridges that gap with an open, extensible architecture that customers can inspect, customize, and integrate.

---

## Market Opportunity & Why Now

The global fraud detection and RegTech market represents tens of billions in annual spend today, with projections approaching USD 200B by the early 2030s, driven by 15-20% annual growth rates. This expansion reflects both increasing fraud sophistication and intensifying regulatory requirements.

### Market Drivers

- **Rapid Digital Payments Growth**: The explosion of UPI in India, digital wallets, real-time payment networks (RTP), and mobile-first banking across emerging markets has created unprecedented transaction volumes and new attack surfaces.
- **Rising Fraud Sophistication**: Account takeover, synthetic identity fraud, and coordinated fraud rings require advanced detection capabilities that legacy rule-based systems cannot address.
- **Regulatory Intensification**: Regulators globally are mandating explainable AI, model governance frameworks, immutable audit trails, and demonstrable fraud prevention controls. Financial institutions face increasing scrutiny and penalties for inadequate systems.
- **False Positive Burden**: Legacy systems generate excessive false positives, overwhelming investigation teams and eroding trust in automated systems. Investigators need tools that reduce noise while maintaining detection coverage.

### Target Segments

**Primary ICP**: Mid-tier banks and neo-banks (USD 5-100B in assets) experiencing high false positive rates and under-served by legacy EFM vendors. These institutions lack the resources for custom builds but require more control and transparency than vendor suites provide.

**Secondary ICP**: Payment processors and card issuers requiring sub-100ms real-time scoring at high transaction volumes, with the ability to customize models and integrate with existing infrastructure.

**Tertiary ICP**: RegTech and forensic consulting firms needing a standardized investigative workbench that can be deployed across multiple client engagements, with white-label capabilities and revenue-sharing models.

### Geographic Strategy: Emerging Markets First

The platform prioritizes India, Southeast Asia, and the Middle East for several strategic reasons:

- **Less Entrenched Incumbents**: Legacy EFM vendors have weaker market penetration in these regions compared to North America and Europe, creating greenfield opportunities.
- **Faster Cloud Adoption**: Emerging market institutions are leapfrogging on-premises infrastructure, adopting cloud-native architectures from the start.
- **Acute Fraud Pain**: Rapid digitization has outpaced fraud prevention capabilities, creating urgent demand for modern solutions.
- **Willingness to Work with Specialists**: Mid-tier institutions in these markets are more open to partnering with specialized vendors rather than defaulting to large suite vendors.

---

## Product & Technical Architecture

The platform is built on a six-layer blueprint encompassing technical architecture, financial model, marketing strategy, organization, operations, and implementation timeline. The architecture is deliberately open, inspectable, and extensible, enabling customer engineering and data science teams to understand, customize, and integrate the system—unlike black-box EFM solutions.

### Backend & Machine Learning

**Core ML Pipeline**: PyTorch-based autoencoder for unsupervised anomaly detection, processing 18+ engineered features including transaction velocity, geographic patterns, device fingerprints, merchant categories, time-of-day patterns, and historical behavior baselines. The system provides explainable feature contributions, allowing investigators to understand why a transaction was flagged.

**Agent Architecture**: Four specialized agents orchestrate fraud detection and investigation workflows:
- **AnomalyDetectionAgent**: Real-time transaction scoring, threshold calibration, and automatic case creation for high-risk events.
- **ComplianceAgent**: AML and sanctions screening hooks, regulatory rule enforcement, and compliance reporting.
- **InvestigationAgent**: Case management, timeline reconstruction, entity relationship mapping, and workflow automation.
- **MonitoringAgent**: System health, model performance tracking, drift detection, and alerting.

**Model Evolution Roadmap**: Initial autoencoder deployment provides immediate value with minimal labeled data. As production data accumulates, the roadmap includes supervised classifier layers (XGBoost/LightGBM), hybrid models combining unsupervised and supervised signals, and eventually deep learning architectures for complex fraud patterns.

### Data & Infrastructure

**Database Layer**: PostgreSQL with SQLAlchemy ORM and Alembic migrations. Immutable audit log ensures complete traceability of all system actions. Multi-tenant architecture supports isolated customer environments with shared infrastructure.

**Cloud-Native Deployment**: Stateless services designed for horizontal scaling, containerized with Docker, orchestrated via Kubernetes, and deployable on Fly.io or AWS/GCP/Azure. Prometheus metrics, Grafana dashboards, and ELK stack provide comprehensive observability.

**Performance**: Sub-100ms p95 latency design enables real-time transaction scoring at high throughput. Stateless architecture allows linear scaling with transaction volume.

### Frontend / Investigator Console

**Technology Stack**: Next.js 14 with TypeScript and Material UI, delivering a dense, context-preserving user experience optimized for investigator workflows.

**Core Modules**:
- **Transaction Explorer**: Filterable transaction lists, risk-level visualization, real-time alert feeds, and bulk actions.
- **Case Management**: Case creation, assignment, status tracking, priority management, and resolution workflows.
- **Entity 360**: Comprehensive entity profiles showing transaction history, risk scores, relationship networks, and case involvement.
- **Network Graph**: Interactive visualization of entity relationships, fraud ring detection, and counterparty analysis.
- **Investigation Timeline**: Chronological event reconstruction, note-taking, evidence attachment, and audit trail visualization.
- **Dashboards**: Executive KPIs, fraud trends, investigator productivity metrics, and system health monitoring.

**Design Philosophy**: Investigator-first UX prioritizes information density, keyboard shortcuts, bulk operations, and context preservation. The interface supports complex multi-entity investigations without losing context or requiring excessive navigation.

### Security & Compliance Foundations

**Authentication & Authorization**: JWT-based authentication with role-based access control (RBAC). Roles include Investigator, Analyst, Admin, and Read-Only, with fine-grained permissions for sensitive operations.

**Data Protection**: Encryption at rest and in transit, secrets management via environment variables and secret stores, and secure API design following OWASP guidelines.

**Compliance Roadmap**: SOC 2 Type II and ISO 27001 certification planned within 24 months, with staged implementation:
- **Months 0-6**: Foundation controls (MFA, RBAC, encryption, audit logs, vulnerability management).
- **Months 6-12**: Formalization (policies, procedures, training, DR/BCP).
- **Months 12-18**: Readiness assessment and gap remediation.
- **Months 18-24**: Certification audits and continuous monitoring.

### Product Roadmap

**Near-Term (0-12 months)**:
- Multi-tenant architecture hardening
- Advanced network analytics and fraud ring detection
- AML adapter framework for integration with external screening services
- Enhanced model explainability and feature importance visualization

**Medium-Term (12-24 months)**:
- GenAI-powered investigative assistant for case summarization and narrative generation
- Automated SAR (Suspicious Activity Report) generation with regulatory compliance
- Regulatory reporting suite for common frameworks (FATF, local banking regulations)
- Supervised model training pipeline and model versioning

**Long-Term (24-36 months)**:
- Graph neural networks for advanced relationship analysis
- Federated learning capabilities for consortium intelligence without data sharing
- Industry-specific modules (e-commerce fraud, insurance fraud, etc.)
- API marketplace for third-party integrations and extensions

---

## Competitive Positioning

The fraud detection market is dominated by legacy EFM suites (FICO Falcon, SAS Fraud Management, NICE Actimize, Feedzai) that offer broad functionality, consortium intelligence, and turnkey managed services. However, these solutions suffer from opaque models, slow change cycles, and limited customization capabilities.

### Differentiation Pillars

**Transparency & Model Control**: Unlike black-box vendor models, the platform provides full access to model code, feature engineering logic, and scoring algorithms. Customers can inspect, modify, and extend models to fit their specific risk profiles and regulatory requirements.

**Investigator-Centric Console**: While vendor suites prioritize automated decisioning, this platform prioritizes investigator workflows. The console enables deep forensic analysis, relationship mapping, timeline reconstruction, and evidence management—capabilities that vendor dashboards typically lack.

**Customization Speed**: Vendor suites require months to implement rule changes or model updates. This platform enables same-day customization through its open architecture and API-first design. Customer data science teams can integrate custom models, features, and business rules without vendor dependencies.

**Flexible Deployment & Data Sovereignty**: Unlike vendor-managed cloud offerings, the platform supports on-premises, private cloud, and hybrid deployments. This flexibility is critical for institutions with data residency requirements or security policies that prohibit third-party data hosting.

### Competitive Comparison

| Dimension | This Platform | Legacy EFM Suites | Self-Built / Open Source |
|-----------|--------------|-------------------|-------------------------|
| **Model Transparency** | Full code access, explainable features | Black-box models, limited explainability | Full control, but requires ML expertise |
| **Consortium Intelligence** | Roadmap: federated learning | Strong network effects, shared signals | None without custom build |
| **Forensic UX Depth** | Purpose-built investigator console | Generic dashboards, limited workflows | Requires custom UI development |
| **Channel Coverage** | Payment cards, ACH, wire (roadmap) | Comprehensive multi-channel | Depends on implementation |
| **Deployment / Data Residency** | Flexible: cloud, on-prem, hybrid | Primarily vendor-managed cloud | Full control, but operational burden |
| **Time-to-Change** | Same-day customization | Months for vendor changes | Immediate, but requires engineering |
| **TCO at Scale** | Moderate SaaS pricing, low services overhead | High licensing + managed services | High engineering + ops costs |
| **Ideal Customer Profile** | Mid-tier banks, neo-banks, processors needing transparency | Large enterprises wanting turnkey solutions | Tech-forward institutions with ML teams |

### When to Choose This Platform

Choose this platform when:
- Model transparency and explainability are regulatory or operational requirements
- Investigators need deep forensic tooling beyond automated alerts
- Customization speed and control are priorities
- Data residency or security policies require flexible deployment
- Mid-tier institutions want enterprise-grade capabilities without vendor lock-in

### When to Choose Vendor Suites

Choose vendor suites when:
- Consortium intelligence and network effects are critical
- Fully managed operations are required
- Broad channel coverage (beyond payments) is needed immediately
- Large enterprise scale justifies vendor relationship management overhead

### Hybrid Patterns

Many institutions adopt hybrid architectures: vendor suites provide baseline detection and consortium intelligence, while this platform serves as an innovation layer for high-value use cases requiring transparency, customization, or specialized investigator workflows. The platform's API-first design enables seamless integration with existing vendor infrastructure.

---

## Business Model & Unit Economics

The platform employs a multi-revenue-stream model combining SaaS licensing, professional services, managed services, and add-on modules. This approach balances predictable recurring revenue with high-margin services that accelerate customer success and expansion.

### Revenue Streams

**Core SaaS Licensing**: Tiered pricing based on transaction volume and investigator seats:
- **Starter Tier**: Up to 1M transactions/month, 5 investigator seats, core detection and case management. Typical ACV: USD 50-150K.
- **Growth Tier**: Up to 10M transactions/month, 15 investigator seats, advanced analytics, network graph, API access. Typical ACV: USD 300-500K.
- **Enterprise Tier**: Unlimited transactions, unlimited seats, custom models, dedicated support, SLA guarantees, on-premises deployment options. Typical ACV: USD 1M+.

**Implementation & Professional Services**: Integration, customization, model training, and training services. Typical project duration: 8-12 weeks. Typical ticket size: USD 100-300K depending on complexity.

**Managed Models / MLOps as a Service**: Ongoing model retraining, performance monitoring, drift detection, and optimization. Recurring revenue stream, typically 20-30% of SaaS ACV.

**Add-On Modules**: AML adapters, advanced network analytics, GenAI case documentation, regulatory reporting suite. Typically priced at 15-25% of base SaaS ACV per module.

**Training & Premium Support**: Advanced training programs, dedicated support channels, and custom development. Typically 10-15% of SaaS ACV.

### Year 3 Target Composition

Targeting USD 8.3M total revenue by Year 3 with 12 customers:
- **3 Enterprise customers**: USD 1M ACV each = USD 3M ARR
- **6 Growth customers**: USD 400K ACV each = USD 2.4M ARR
- **3 Starter customers**: USD 150K ACV each = USD 450K ARR
- **SaaS Subtotal**: USD 5.85M ARR (~70% of total)
- **Services & Other**: USD 2.45M (~30% of total)

### Gross Margin Logic

- **SaaS Revenue**: 70-80% gross margins (infrastructure, support, and platform costs)
- **Services Revenue**: 30-50% gross margins (consultant time, project management overhead)
- **Blended Margin**: Improving from ~60% in Year 1 to ~70%+ by Year 3 as services percentage declines

### Key Unit Economics Metrics

- **Target ACV**: USD 300-500K for mid-tier deals, USD 1M+ for enterprise
- **Sales Cycle**: 6 months average from initial contact to contract signature
- **CAC Payback**: 3-4 quarters (customer acquisition cost recovered within first year)
- **LTV/CAC Ratio**: >5x target (lifetime value significantly exceeds acquisition cost)
- **Net Revenue Retention (NRR)**: 110-120% once expansion modules and seat growth kick in (Year 2+)
- **Churn**: <10% annual churn target for production customers

---

## Go-To-Market Strategy

The GTM strategy combines founder-led sales, proof-of-value (PoV) motions, consulting partnerships, and thought leadership to establish market presence and drive early customer acquisition.

### Initial Focus & ICP

Primary focus on mid-tier banks, neo-banks, payment processors, and consulting firms in India, Southeast Asia, and the Middle East. These segments share characteristics: high fraud pain, limited vendor options, cloud-native infrastructure, and willingness to evaluate specialized solutions.

### Founder-Led Sales & PoV Motion (Year 1-2)

**8-12 Week Paid PoVs**: Structured proof-of-value engagements with hard success metrics:
- **Fraud Detection Uplift**: Measurable improvement in detection rates versus existing systems
- **False Positive Reduction**: Target 30-50% reduction in false positives while maintaining or improving true positive rates
- **Mean Time to Resolution (MTTR)**: Reduction in investigation time through improved workflows and automation
- **Investigator Satisfaction**: User experience metrics and qualitative feedback

**Engagement Model**: 
- Live demos with customer transaction data (anonymized or synthetic)
- Design-partner framing: early customers influence product roadmap and receive favorable pricing
- Success-based pricing: PoV fees credited toward first-year SaaS contracts upon conversion

### Consulting / Forensic Partner Channel

**Big Four & Regional Boutiques**: Partner with consulting firms that use the platform as a standardized investigative toolkit:
- **White-Label Options**: Partners can brand the platform for client engagements
- **Co-Delivery Model**: Platform team provides technical support while partners deliver domain expertise
- **Revenue Sharing**: Partners receive referral fees or margin on platform licenses sold through their engagements

This channel accelerates market penetration, provides credibility through association with established firms, and creates a scalable sales motion beyond direct founder-led efforts.

### Land-and-Expand Playbook

**Phase 1 - Land**: Start with 1-2 high-pain channels (e.g., card transactions, ACH fraud) to prove value and establish trust.

**Phase 2 - Expand Channels**: Add additional transaction types (wire transfers, mobile payments, etc.) as platform capabilities mature.

**Phase 3 - Expand Modules**: Introduce network analytics, AML adapters, GenAI features, and regulatory reporting to increase ACV and reduce churn.

**Phase 4 - Adjacent Functions**: Extend into related use cases (KYC, transaction monitoring, sanctions screening) to become a broader RegTech platform.

### Thought Leadership & RegTech Positioning

**Technical Content**: Whitepapers on explainable AI in fraud detection, model governance frameworks, and forensic investigation best practices.

**Conference Presence**: Speaking engagements at RegTech conferences, banking technology forums, and fraud prevention events in target geographies.

**Joint Case Studies**: Co-authored success stories with early customers and consulting partners, highlighting measurable outcomes and ROI.

**Data-Driven Content**: Regular blog posts, research reports, and industry analyses that position the platform as a thought leader in transparent fraud detection and forensic investigation.

### 3-Year GTM Milestones

**Year 1**:
- 3-5 design partners and PoV engagements
- 1-2 production customers
- USD 0.5-1M ARR equivalent (PoV + early SaaS)
- India and 1 SE Asian market presence
- 8-10 person team

**Year 2**:
- 6-8 production customers
- USD 2-3M ARR
- 2-3 geographic markets (India, SEA, Middle East)
- Consulting partner channel active
- 20-25 person team

**Year 3**:
- 12-15 institutions
- USD 8-10M ARR run-rate
- Multi-region expansion with regional sales pods
- Established thought leadership presence
- 40-50 person team

---

## Organisation, Operations & Compliance

The organization is structured to de-risk execution through phased hiring, robust operational processes, and a clear compliance roadmap that enables enterprise sales.

### Org Phasing

**Phase 1 (0-12 months)**: Lean founding team focused on product-market fit:
- Backend/ML engineering (2-3 engineers)
- Frontend engineering (1-2 engineers)
- DevOps/Infrastructure (1 engineer)
- Solutions architect (1 person)
- Founder-led sales and customer success

**Phase 2 (12-24 months)**: Scaling operations and customer success:
- Implementation consultants (2-3 people)
- Customer success managers (2 people)
- Sales/marketing (2-3 people)
- QA/testing (1-2 people)
- ML specialists for model optimization (1-2 people)

**Phase 3 (24-36 months)**: Regional expansion and specialization:
- Regional sales pods (India, SEA, Middle East)
- Specialized engineering squads:
  - Backend/API team
  - ML/Platform team
  - Console/Frontend team
- Chief Customer Officer function
- Dedicated security/compliance team (2-3 people)

### Operational Processes

**CI/CD Pipeline**: Automated testing, code review, and deployment processes enable rapid iteration while maintaining quality. Blue-green and canary deployment strategies minimize risk during releases.

**Test Strategy**: Unit tests for core ML models and business logic, integration tests for API endpoints, end-to-end tests for critical investigator workflows, and performance tests for latency and throughput requirements.

**Runbooks & On-Call**: Comprehensive documentation for common operational scenarios, 24/7 on-call rotation for production incidents, and escalation procedures for critical issues.

**Incident Management**: Structured incident response process with post-mortems, root cause analysis, and preventive action tracking. Public status page for transparency.

**Customer Lifecycle Operations**: Standardized onboarding, health monitoring, expansion opportunity identification, and renewal processes. Customer success metrics tracked and reviewed regularly.

**Model Governance Framework**: Version control for models, A/B testing infrastructure, performance monitoring and alerting, drift detection, and rollback procedures. Compliance with model risk management (MRM) standards.

### Security & Compliance Roadmap

**Core Controls (Months 0-6)**:
- Multi-factor authentication (MFA) for all user accounts
- Role-based access control (RBAC) with audit logging
- Encryption at rest and in transit (TLS 1.3, AES-256)
- Immutable audit logs for all sensitive operations
- Disaster recovery and business continuity planning (DR/BCP)
- Vulnerability management and patch processes

**Formalization (Months 6-12)**:
- Security policies and procedures documentation
- Employee security training programs
- Third-party security assessments
- Penetration testing and remediation
- Incident response plan documentation

**Readiness Assessment (Months 12-18)**:
- SOC 2 Type II readiness assessment
- ISO 27001 gap analysis
- Remediation of identified gaps
- Internal audit processes
- Vendor risk management program

**Certification (Months 18-24)**:
- SOC 2 Type II audit and certification
- ISO 27001 certification
- Continuous monitoring and annual recertification
- Customer-facing compliance documentation

**Why This Matters**: Enterprise sales cycles require security and compliance certifications. SOC 2 and ISO 27001 are table stakes for financial services customers. The staged approach ensures foundational controls are in place early while building toward formal certifications that unlock larger deals.

---

## Three-Round Fundraising Plan

The company plans three rounds of equity financing over 36 months, structured to achieve specific milestones that de-risk the business and position for scale.

### Round Structure

| Round | Timing (Months) | Raise (USD) | Pre-Money (USD) | Key Milestones | New Investor Ownership (approx.) |
|-------|----------------|------------|----------------|----------------|----------------------------------|
| **Pre-Seed** | 0-12 | 1.5-2.0M | 8-10M | Hardened v1, 1+ pilots, PoV traction, ~0.5M ARR equivalent | 15-20% |
| **Seed** | 12-24 | 4-6M | 18-24M | 3-5 production customers, USD 1-2M ARR, repeatable sales motion | 20-25% |
| **Series A** | 24-36 | 12-18M | 60-80M | 10-15 institutions, USD 8-10M ARR, multi-region expansion, SOC2/ISO | 18-25% |

**Total Investor Ownership Post-Series A**: ~55-60%

### Pre-Seed (Months 0-12)

**Raise**: USD 1.5-2.0M via SAFE or priced equity at sub-USD 10M valuation cap.

**Use of Funds**:
- Product development and hardening (40%)
- Initial customer acquisition and PoVs (30%)
- Team building (20%)
- Infrastructure and operations (10%)

**Milestones**:
- Hardened v1 platform ready for production pilots
- 1+ paid pilot customers with positive feedback
- Design-partner PoV with measurable success metrics
- Early GTM collateral (case studies, demos, marketing materials)
- USD 0.5M ARR equivalent or strong PoV traction indicating product-market fit

**Investor Profile**: Pre-seed funds, angel investors, and early-stage VCs focused on B2B SaaS and fintech. Investors should bring domain expertise in financial services, fraud detection, or RegTech.

### Seed (Months 12-24)

**Raise**: USD 4-6M priced equity at USD 18-24M pre-money valuation.

**Use of Funds**:
- Sales and marketing expansion (35%)
- Customer success and implementation (25%)
- Product development and roadmap (25%)
- Team scaling (15%)

**Milestones**:
- Convert pilots to 3-5 production customers with multi-year contracts
- Reach USD 1-2M ARR with clear path to USD 8M+ ARR
- Prove repeatable sales motion in 1-2 geographic regions
- Establish consulting partner channel with active referrals
- Demonstrate strong unit economics (LTV/CAC >5x, NRR >110%)

**Investor Profile**: Seed-stage VCs with fintech or RegTech focus, strategic investors from financial services or payment processing, and follow-on participation from pre-seed investors.

### Series A (Months 24-36)

**Raise**: USD 12-18M at USD 60-80M pre-money valuation.

**Use of Funds**:
- Multi-region sales expansion (40%)
- Product development and platform expansion (30%)
- Team scaling across functions (20%)
- Marketing and thought leadership (10%)

**Milestones**:
- 10-15 production institutions with diverse use cases
- USD 8-10M ARR run-rate with strong growth trajectory
- Multi-region presence (India, SEA, Middle East) with regional sales pods
- Robust unit economics validated at scale
- SOC 2 Type II and ISO 27001 certifications in place
- Clear path to USD 30M+ ARR within 24 months

**Investor Profile**: Series A VCs with enterprise SaaS and fintech expertise, strategic investors from banking or payment processing, and potential participation from international VCs with regional presence.

### Key Term Sheet Principles

**Liquidation Preference**: 1x non-participating liquidation preference standard across all rounds. Founders and employees participate in upside beyond preference return.

**Anti-Dilution**: Broad-based weighted average anti-dilution protection. No full-ratchet provisions.

**Protective Provisions**: Standard protective provisions limited to structural changes (sale of company, dissolution, amendment to charter affecting investor rights). Day-to-day operations remain under founder/management control.

**ESOP Sizing**: 
- 10% option pool at Seed round
- 12-15% total option pool post-Series A (including Seed pool)
- 4-year vesting with 1-year cliff standard

**Founder Vesting & IP**: Standard 4-year vesting with 1-year cliff for founders. IP assignment agreements ensure all company-related intellectual property is properly assigned.

**Board Composition**: 
- Pre-Seed: 1 investor seat, 2 founder seats
- Seed: 2 investor seats, 2 founder seats, 1 independent seat
- Series A: 2 investor seats, 2 founder seats, 1 independent seat (or 2-2-1 structure)

---

## Exit Pathways & Investor Returns

The platform is positioned for multiple exit pathways over a 5-7 year horizon, with strategic acquisition representing the most likely base case and potential for significant returns across early investment rounds.

### Strategic Acquisition Base Case (5-7 Years)

**Scenario**: USD 30M ARR, strong unit economics, established market presence in 2-3 regions, proven customer base including mid-tier banks and payment processors.

**Valuation**: 4-7x ARR multiple → USD 150-300M exit valuation

**Investor Returns**:
- **Pre-Seed Investors** (USD 2M at USD 10M cap, ~20% ownership diluted to ~12%): USD 18-36M return → **9-18x cash multiple**
- **Seed Investors** (USD 5M at USD 20M pre, ~25% ownership diluted to ~18%): USD 27-54M return → **5.4-10.8x cash multiple**
- **Series A Investors** (USD 15M at USD 70M pre, ~22% ownership): USD 33-66M return → **2.2-4.4x cash multiple**

**IRR Examples**:
- Seed investor at USD 20M pre, 20% ownership diluted to ~15%, exiting at USD 300M → ~3x cash return, **mid-20s IRR** over 4-5 year hold period

### Upside / Strategic or PE Case (5-7 Years)

**Scenario**: USD 50-80M ARR, Rule-of-40+ metrics (revenue growth + profitability), category leadership in explainable fraud detection, strong IP portfolio, strategic partnerships.

**Valuation**: 6-10x ARR multiple → USD 400-480M exit valuation

**Value Drivers**:
- **Fraud + RegTech Scarcity**: Limited number of independent platforms with both fraud detection and forensic investigation capabilities creates acquisition premium
- **Explainable AI IP**: Patents or proprietary techniques in model explainability and investigator workflows differentiate from commodity solutions
- **Strategic Value**: Acquiring company gains access to customer relationships, technology platform, and domain expertise that would take years to build organically

**Investor Returns**:
- **Pre-Seed**: USD 48-58M return → **24-29x cash multiple**
- **Seed**: USD 72-86M return → **14.4-17.2x cash multiple**
- **Series A**: USD 88-106M return → **5.9-7.1x cash multiple**

### Billion-Dollar Scenario (Low Probability but Credible)

**Scenario**: USD 100M+ ARR, Rule-of-40+ metrics, category-defining platform, IPO-ready financials, or acquisition by hyperscaler or major payment network.

**Valuation**: 5-15x ARR multiple → USD 500M-1.5B exit valuation

**Pathways**:
- **IPO**: Public markets value RegTech platforms at premium multiples, especially with strong growth and profitability
- **Hyperscaler Acquisition**: Cloud providers (AWS, GCP, Azure) acquire to embed fraud detection into their financial services offerings
- **Payment Network Acquisition**: Visa, Mastercard, or regional networks acquire to enhance their fraud prevention capabilities
- **Strategic Consolidation**: Large RegTech or fraud vendor acquires to expand capabilities and customer base

**Investor Returns**:
- **Pre-Seed**: USD 60-180M return → **30-90x cash multiple**
- **Seed**: USD 90-270M return → **18-54x cash multiple**
- **Series A**: USD 110-330M return → **7.3-22x cash multiple**

### Potential Acquirers

**Fraud Detection Vendors**: FICO, SAS, NICE Actimize, Feedzai seeking to add transparency and investigator tooling to their portfolios.

**Core Banking Vendants**: Temenos, Finastra, FIS, Fiserv looking to expand into fraud prevention and RegTech capabilities.

**Payment Networks**: Visa, Mastercard, regional networks (NPCI, Ripple) seeking to enhance fraud prevention offerings for their merchant and issuer customers.

**Cloud Hyperscalers**: AWS, Google Cloud, Microsoft Azure acquiring to embed fraud detection into their financial services cloud offerings.

**RegTech Consolidators**: Private equity firms or larger RegTech platforms acquiring to build comprehensive compliance and fraud prevention suites.

**Regional Financial Services Giants**: Large banks or financial services groups in target markets (India, SEA, Middle East) acquiring to enhance internal capabilities and create new revenue streams.

### Return Summary

The fundraising plan and exit scenarios are designed to deliver strong returns across all investor cohorts:

- **Pre-Seed Investors**: Highest risk, highest potential return (9-90x multiples possible)
- **Seed Investors**: Balanced risk-return profile (5-54x multiples possible)
- **Series A Investors**: Lower risk, solid returns (2-22x multiples possible)

The base case (USD 150-300M exit) provides attractive returns for all investors while the upside scenarios offer exceptional outcomes for early backers. The 5-7 year timeline aligns with typical VC fund lifecycles and provides sufficient time to build a substantial, defensible business.

---

## Conclusion

The Fraud Detection & Forensic Investigation Platform addresses a critical gap in the enterprise fraud management market: the need for transparent, explainable AI combined with deep investigator tooling. The platform's open architecture, forensic-first design, and cloud-native infrastructure position it to capture market share from both legacy vendors and custom-built solutions.

With a clear path to USD 8M ARR by Year 3 and USD 50M+ ARR potential, strong unit economics, and multiple strategic exit pathways, the platform represents an attractive investment opportunity in the rapidly growing fraud detection and RegTech markets.

The three-round fundraising plan de-risks execution through staged milestones, while the exit scenarios provide multiple pathways to significant investor returns. The focus on emerging markets, mid-tier institutions, and consulting partnerships creates a differentiated go-to-market strategy that avoids direct competition with legacy vendors while building a defensible, scalable business.

---

*This document is confidential and intended solely for the use of potential investors. All financial projections, market estimates, and strategic plans are forward-looking statements subject to risks and uncertainties. Actual results may differ materially from those projected.*

