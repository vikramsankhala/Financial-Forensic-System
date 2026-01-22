# Forensics Playbook: Investigator Guide

This playbook describes how forensic investigators and financial crime analysts use the Fraud Detection Forensic Systems platform to investigate suspicious transactions and manage cases.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Reviewing Alerts](#reviewing-alerts)
3. [Opening and Managing Cases](#opening-and-managing-cases)
4. [Entity Investigation](#entity-investigation)
5. [Documenting Evidence](#documenting-evidence)
6. [Case Resolution](#case-resolution)
7. [Reporting](#reporting)

## Getting Started

### Login

1. Navigate to the application URL
2. Enter your credentials:
   - **Username**: Your assigned username
   - **Password**: Your password
3. Upon successful login, you'll be redirected to the Dashboard

### Dashboard Overview

The dashboard provides:
- **Alerts Today**: Number of high-risk transactions flagged today
- **Open Cases**: Active cases requiring attention
- **Average Risk Score**: Overall risk level indicator
- **Risky Entities**: Entities with elevated risk profiles
- **Alerts Chart**: Time-series visualization of alerts

## Reviewing Alerts

### Transaction Explorer

1. Navigate to **Transactions** from the sidebar
2. View the transaction list:
   - Transactions are sorted by timestamp (newest first)
   - Risk levels are color-coded:
     - 🟢 **LOW**: Normal transactions
     - 🔵 **MEDIUM**: Requires monitoring
     - 🟠 **HIGH**: Requires investigation
     - 🔴 **CRITICAL**: Immediate action required

### Understanding Transaction Scores

Click on any transaction to view details:

**Key Information**:
- **Transaction ID**: Unique identifier
- **Amount & Currency**: Transaction value
- **Merchant**: Merchant name and category
- **Customer**: Customer identifier
- **Channel**: Transaction channel (online, POS, ATM, mobile)
- **Location**: Geographic location (city, country)
- **Timestamp**: When the transaction occurred

**Risk Indicators**:
- **Anomaly Score**: ML model's anomaly score (0-1)
- **Risk Level**: Categorized risk (LOW/MEDIUM/HIGH/CRITICAL)
- **Decision**: System recommendation (approve/monitor/review)
- **Reasons**: List of compliance violations or anomalies detected

**Feature Contributions**: Shows which features contributed most to the anomaly score:
- Amount patterns
- Geographic inconsistencies
- Behavioral anomalies
- Merchant category risks

### Filtering Transactions

Use the search bar to filter by:
- Transaction ID
- Customer ID
- Merchant name

## Opening and Managing Cases

### Auto-Created Cases

High-risk transactions (HIGH or CRITICAL) automatically create cases with:
- Status: **TRIAGE**
- Priority: Based on risk level
- Linked transaction and entities
- Initial description

### Manual Case Creation

1. Navigate to **Cases**
2. Click **New Case**
3. Fill in case details:
   - **Title**: Descriptive case title
   - **Description**: Initial observations
   - **Priority**: low/medium/high/critical
   - **Tags**: Optional tags for categorization
4. Click **Create**

### Case Workflow

**Status Progression**:
1. **OPEN** → Initial case creation
2. **TRIAGE** → Initial review and prioritization
3. **INVESTIGATION** → Active investigation phase
4. **REMEDIATION** → Actions taken (card blocked, customer contacted, etc.)
5. **CLOSED** → Case resolved

**Changing Case Status**:
1. Open the case detail view
2. Click **Update Status**
3. Select new status
4. Add a note explaining the status change
5. Save

### Case Detail View

**Case Header**:
- Case ID
- Title and description
- Current status and priority
- Owner (assigned investigator)
- Tags
- Created/updated timestamps

**Timeline**:
- Chronological list of all events:
  - Status changes
  - Notes added
  - Actions taken
  - Evidence attached
- Each event shows:
  - Timestamp
  - Actor (who made the change)
  - Description

**Related Transactions**:
- Table of all transactions linked to the case
- Click to view transaction details
- Add more transactions via "Link Transaction"

**Related Entities**:
- List of entities involved:
  - Customers
  - Merchants
  - Devices
  - IP addresses
  - Accounts
- Click entity to view entity 360 view

**Entity Network**:
- Visual graph showing relationships between entities
- Helps identify:
  - Connected accounts
  - Shared devices
  - Common merchants
  - Geographic patterns

## Entity Investigation

### Entity 360 View

Navigate to **Entities** and search for an entity ID, or click an entity from a case.

**Entity Profile**:
- Entity ID and type
- Name and metadata
- Creation and update timestamps

**Transaction History**:
- All transactions involving this entity
- Risk score trends over time
- Amount patterns
- Geographic distribution

**Risk Metrics**:
- Average risk score
- Number of high-risk transactions
- Case involvement count
- Velocity metrics

**Network Graph**:
- Visual representation of relationships
- Shows connections to:
  - Other customers
  - Merchants
  - Devices
  - IP addresses
- Helps identify:
  - Fraud rings
  - Account takeovers
  - Device sharing patterns

### Network Analysis

1. Start from a suspicious entity
2. Explore connected entities
3. Identify patterns:
   - Multiple accounts using same device
   - Rapid geographic movement
   - Unusual merchant relationships
4. Document findings in case notes

## Documenting Evidence

### Adding Notes

1. Open a case
2. Click **Add Note**
3. Enter:
   - **Title**: Brief summary
   - **Content**: Detailed notes
   - **Event Type**: note/action/finding
4. Save

**Best Practices**:
- Be specific and factual
- Include timestamps
- Reference transaction IDs
- Note any external communications
- Document decision rationale

### Recording Actions

When taking action, record it:

**Common Actions**:
- "Card blocked - customer contacted"
- "SAR filed with FinCEN"
- "Account frozen pending investigation"
- "Customer verified - false positive"
- "Escalated to law enforcement"

**Action Format**:
- **Title**: Action taken
- **Content**: Details and outcome
- **Event Type**: action
- **Metadata**: Reference numbers, dates, contacts

### Evidence Chain

The system maintains an **immutable audit trail**:
- Every action is logged
- Before/after states captured
- Actor and timestamp recorded
- Cannot be modified or deleted

This ensures:
- Regulatory compliance
- Litigation readiness
- Internal audit requirements

## Case Resolution

### Investigation Checklist

Before closing a case, ensure:

- [ ] All related transactions reviewed
- [ ] All entities investigated
- [ ] Network analysis completed
- [ ] Evidence documented
- [ ] Actions taken recorded
- [ ] Regulatory requirements met (if applicable)
- [ ] Customer communication documented
- [ ] Case notes complete

### Closing a Case

1. Review all case information
2. Ensure all actions completed
3. Add final summary note
4. Change status to **CLOSED**
5. Case is archived but remains accessible

### Case Reopening

If new information emerges:
1. Open closed case
2. Add note explaining new information
3. Change status back to **INVESTIGATION**
4. Continue investigation

## Reporting

### Case Report Generation

1. Open a case
2. Click **Generate Report**
3. Report includes:
   - Case summary
   - Key entities
   - Transaction table
   - Timeline of events
   - Risk metrics
   - Investigator notes

### Report Contents

**Executive Summary**:
- Case overview
- Key findings
- Resolution status

**Transaction Details**:
- Table of all transactions
- Risk scores
- Anomaly indicators

**Entity Analysis**:
- Entities involved
- Relationship graph
- Risk profiles

**Investigation Timeline**:
- Chronological events
- Actions taken
- Evidence collected

**Compliance Notes**:
- Regulatory actions (SAR filings, etc.)
- Customer communications
- Internal escalations

### Export Options

Reports can be:
- Viewed in browser
- Printed to PDF (browser print)
- Exported as JSON (API endpoint)
- Used for regulatory submissions

## Best Practices

### Investigation Workflow

1. **Triage Quickly**: Review alerts within SLA (e.g., 4 hours for HIGH, 1 hour for CRITICAL)
2. **Document Early**: Start documenting from first review
3. **Link Related Items**: Connect transactions and entities early
4. **Use Network View**: Visualize relationships to identify patterns
5. **Follow Up**: Track actions and outcomes
6. **Close Properly**: Complete documentation before closing

### Risk Assessment

**Low Risk**:
- Single anomaly
- Explainable pattern
- No compliance violations
- **Action**: Monitor or approve

**Medium Risk**:
- Multiple anomalies
- Unusual but explainable
- Minor compliance issues
- **Action**: Review, may require customer contact

**High Risk**:
- Significant anomalies
- Compliance violations
- Pattern of suspicious activity
- **Action**: Full investigation, consider blocking

**Critical Risk**:
- Severe anomalies
- Multiple violations
- Potential fraud ring
- **Action**: Immediate blocking, escalate to law enforcement

### Compliance Considerations

**SAR Filing**:
- Document all SAR filings in case notes
- Include SAR reference numbers
- Note filing dates and agencies

**Customer Communication**:
- Document all customer contacts
- Record responses
- Note any disputes or explanations

**Regulatory Reporting**:
- Ensure case reports meet regulatory requirements
- Include all required fields
- Maintain audit trail completeness

## Troubleshooting

### Common Issues

**Transaction Not Scoring**:
- Check transaction data completeness
- Verify feature engineering pipeline
- Review model loading

**Case Not Auto-Creating**:
- Verify risk level threshold
- Check InvestigationAgent configuration
- Review transaction score

**Entity Network Not Loading**:
- Verify entity links exist
- Check database relationships
- Review entity extraction logic

### Getting Help

- **Technical Issues**: Contact system administrator
- **Investigation Questions**: Consult team lead
- **Compliance Questions**: Contact compliance officer

## Glossary

- **Anomaly Score**: ML model's measure of transaction abnormality (0-1)
- **Reconstruction Error**: Autoencoder's error in reconstructing transaction features
- **Risk Level**: Categorized risk assessment (LOW/MEDIUM/HIGH/CRITICAL)
- **Entity**: Any identifiable entity (customer, merchant, device, IP, account)
- **Case**: Investigation container for related transactions and entities
- **SAR**: Suspicious Activity Report (filed with FinCEN)
- **PEP**: Politically Exposed Person
- **AML**: Anti-Money Laundering

