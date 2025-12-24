# Real-Time Fraud Detection Process Flow

## Overview

This document describes the end-to-end process flow from receiving real-time transaction feeds through fraud detection, alert generation, dashboard updates, and suggested actions.

---

## High-Level Process Flow

```
Real-Time Transaction Feed
    ↓
Transaction Ingestion & Validation
    ↓
Feature Engineering & Normalization
    ↓
ML-Based Anomaly Detection (Autoencoder)
    ↓
Risk Scoring & Threshold Evaluation
    ↓
Alert Generation (if threshold exceeded)
    ↓
Real-Time Dashboard Update
    ↓
Case Creation (automatic or manual)
    ↓
Investigator Review & Actions
    ↓
Suggested Actions Display
    ↓
Action Execution & Audit Logging
```

---

## Detailed Process Flow

### Phase 1: Transaction Ingestion

**Input**: Real-time transaction feed (REST API, message queue, webhook, etc.)

**Process**:
1. **Transaction Receipt**
   - Transaction arrives via API endpoint: `POST /api/transactions/score`
   - Payload includes: amount, currency, merchant info, customer ID, device ID, IP address, geo-location, timestamp, channel, etc.

2. **Validation**
   - Schema validation using Pydantic models
   - Required fields check
   - Data type validation
   - Business rule validation (e.g., amount > 0, valid currency codes)

3. **Transaction Storage**
   - Store raw transaction in `transactions` table
   - Generate unique transaction ID
   - Set initial status: `pending_scoring`

**Output**: Validated transaction record in database

---

### Phase 2: Feature Engineering

**Input**: Raw transaction data

**Process**:
1. **Feature Extraction** (18+ features)
   - **Amount Features**:
     - Normalized amount (log transform, z-score)
     - Amount deviation from customer average
     - Amount deviation from merchant average
   
   - **Temporal Features**:
     - Time of day (hour, day of week)
     - Time since last transaction (recency)
     - Transaction frequency (transactions per hour/day)
   
   - **Geographic Features**:
     - Distance from customer's usual location
     - Country/region encoding
     - IP geolocation consistency
   
   - **Device & Channel Features**:
     - Device fingerprint hash
     - Channel type (online, POS, ATM, mobile)
     - Device age (first seen timestamp)
   
   - **Behavioral Features**:
     - Customer transaction velocity
     - Merchant category encoding
     - Transaction pattern deviation
   
   - **Network Features**:
     - Entity relationship strength
     - Shared device/IP patterns
     - Account linkage indicators

2. **Feature Normalization**
   - Apply StandardScaler (fitted on historical data)
   - Handle missing values (imputation or default values)
   - Ensure feature vector is 18-dimensional

**Output**: Normalized feature vector (18 features, float32 array)

---

### Phase 3: ML-Based Anomaly Detection

**Input**: Normalized feature vector

**Process**:
1. **Autoencoder Inference**
   - Load pre-trained PyTorch autoencoder model
   - Encode: Feature vector → Latent representation (6 dimensions)
   - Decode: Latent representation → Reconstructed feature vector
   - Compute reconstruction error: `MSE(original, reconstructed)`

2. **Anomaly Score Calculation**
   - Anomaly score = reconstruction error
   - Higher error = more anomalous = higher fraud risk
   - Score range: 0.0 to 1.0+ (typically 0.0 to 0.5 for normal, 0.5+ for anomalies)

3. **Threshold Comparison**
   - Compare anomaly score against dynamic threshold
   - Threshold computed as 95th percentile of historical scores (configurable)
   - If score > threshold → Flag as anomaly

**Output**: Anomaly score, reconstruction error, threshold comparison result

---

### Phase 4: Risk Scoring & Classification

**Input**: Anomaly score, feature vector, transaction metadata

**Process**:
1. **Risk Level Assignment**
   - **CRITICAL** (score > 0.8): Immediate review required
   - **HIGH** (score > 0.6): High priority investigation
   - **MEDIUM** (score > 0.4): Standard review
   - **LOW** (score ≤ 0.4): Normal transaction

2. **Decision Logic**
   - **Approve**: LOW risk, score < threshold
   - **Monitor**: MEDIUM risk, score near threshold
   - **Review**: HIGH/CRITICAL risk, score > threshold

3. **Feature Contribution Analysis**
   - Calculate per-feature contribution to reconstruction error
   - Identify top contributing features (explainability)
   - Generate human-readable reasons (e.g., "Unusual amount", "New device", "Geographic anomaly")

4. **Optional Supervised Classifier** (if model available)
   - Apply XGBoost/LightGBM classifier
   - Generate probability score
   - Combine with autoencoder score (weighted average)

**Output**: Risk level, decision, feature contributions, explainability reasons

---

### Phase 5: Score Storage & Alert Generation

**Input**: Scoring results

**Process**:
1. **Score Storage**
   - Store score in `scores` table
   - Link to transaction via foreign key
   - Store: anomaly_score, reconstruction_error, risk_level, decision, feature_contributions, timestamp

2. **Alert Generation Logic**
   - **Condition**: Risk level is HIGH or CRITICAL AND decision is "review"
   - **Alert Types**:
     - **Real-Time Alert**: Immediate notification (WebSocket push, webhook)
     - **Dashboard Alert**: Appears in real-time alerts feed
     - **Email/SMS Alert**: For CRITICAL risk (configurable)

3. **Alert Payload**
   ```json
   {
     "alert_id": "ALERT-2025-12-24-001",
     "transaction_id": "TXN-12345",
     "risk_level": "HIGH",
     "anomaly_score": 0.72,
     "amount": 5000.00,
     "currency": "USD",
     "merchant": "Merchant ABC",
     "customer_id": "CUST-789",
     "timestamp": "2025-12-24T10:30:00Z",
     "reasons": [
       "Unusual transaction amount",
       "New device detected",
       "Geographic anomaly"
     ],
     "feature_contributions": {
       "amount_deviation": 0.35,
       "device_novelty": 0.28,
       "geo_distance": 0.22
     }
   }
   ```

**Output**: Alert record, real-time notification

---

### Phase 6: Real-Time Dashboard Update

**Input**: Alert, transaction, score data

**Process**:
1. **WebSocket/SSE Push** (if enabled)
   - Push alert to connected clients
   - Update dashboard in real-time without refresh
   - Event: `new_alert`, `transaction_scored`, `case_created`

2. **Dashboard Components Update**
   - **Incoming Alerts Panel**:
     - Add new alert to top of list
     - Highlight HIGH/CRITICAL alerts
     - Show alert count badge
   
   - **Real-Time Transaction Feed**:
     - Add transaction to feed
     - Color-code by risk level
     - Show anomaly score
   
   - **KPI Cards**:
     - Update total transactions count
     - Update high-risk transactions count
     - Update alerts today count
     - Update false positive rate (if available)
   
   - **Charts**:
     - Update risk distribution pie chart
     - Update transactions over time line chart
     - Update top merchants/geographies bar charts

3. **Dashboard API Endpoints**
   - `GET /api/metrics` - Prometheus metrics
   - `GET /api/transactions?risk_level=HIGH&limit=50` - Recent high-risk transactions
   - `GET /api/cases?status=OPEN&priority=high` - Open high-priority cases
   - `GET /api/alerts/recent` - Recent alerts (last 100)

**Output**: Updated dashboard UI, real-time notifications

---

### Phase 7: Automatic Case Creation (Optional)

**Input**: Alert with HIGH/CRITICAL risk

**Process**:
1. **Case Creation Logic** (configurable)
   - **Auto-create case**: If risk_level = CRITICAL OR (risk_level = HIGH AND score > 0.7)
   - **Manual case creation**: User clicks "Create Case" button

2. **Case Initialization**
   - Generate unique case ID: `CASE-YYYYMMDD-XXX`
   - Set status: `OPEN`
   - Set priority: Based on risk level (CRITICAL → critical, HIGH → high)
   - Assign owner: Auto-assign to available investigator (round-robin) or leave unassigned
   - Link transaction: Create `CaseTransaction` relationship

3. **Initial Case Event**
   - Create `CaseEvent` with type: `case_created`
   - Title: "Case created automatically from transaction {transaction_id}"
   - Content: Include anomaly score, risk level, reasons
   - Metadata: Store feature contributions, scoring details

4. **Audit Logging**
   - Log case creation event
   - Log transaction flagging
   - Store before/after states

**Output**: Case record, case event, audit log entry

---

### Phase 8: Investigator Review & Suggested Actions

**Input**: Alert or case in dashboard

**Process**:
1. **Investigator Views Alert**
   - Click on alert in "Incoming Alerts" panel
   - Navigate to transaction detail page
   - View: Transaction metadata, scoring details, feature contributions, explainability reasons

2. **Suggested Actions Generation**
   - **Context-Aware Action Suggestions**:
     - Based on risk level
     - Based on transaction patterns
     - Based on entity history
     - Based on similar past cases

3. **Action Suggestions by Risk Level**

   **CRITICAL Risk Actions**:
   - 🔴 **Block Transaction** (if not yet processed)
   - 🔴 **Freeze Account** (temporary account freeze)
   - 🔴 **Create Case** (if not auto-created)
   - 🔴 **Escalate to Manager** (notify supervisor)
   - 🔴 **Contact Customer** (verify transaction)
   - 🔴 **Block Device/IP** (if device/IP is suspicious)

   **HIGH Risk Actions**:
   - 🟠 **Flag Transaction** (mark for review)
   - 🟠 **Create Case** (start investigation)
   - 🟠 **Add to Watchlist** (monitor customer/merchant)
   - 🟠 **Request Additional Verification** (2FA, OTP)
   - 🟠 **Review Entity Network** (check relationships)

   **MEDIUM Risk Actions**:
   - 🟡 **Monitor** (add to monitoring list)
   - 🟡 **Review Later** (schedule review)
   - 🟡 **Approve with Note** (approve but document)

   **LOW Risk Actions**:
   - 🟢 **Approve** (normal transaction)
   - 🟢 **No Action** (auto-approve)

4. **Action Suggestions by Pattern**

   **New Device Pattern**:
   - Verify device ownership
   - Check device history
   - Review customer's device list
   - Add device to trusted list (if verified)

   **Geographic Anomaly**:
   - Verify travel status
   - Check recent transactions in location
   - Review IP geolocation
   - Contact customer for verification

   **Unusual Amount**:
   - Compare with customer's spending patterns
   - Check merchant category
   - Review recent large transactions
   - Verify merchant legitimacy

   **Velocity Anomaly**:
   - Check transaction frequency
   - Review recent transaction history
   - Compare with historical patterns
   - Investigate potential account takeover

   **Entity Network Anomaly**:
   - Explore entity relationships
   - Check for fraud rings
   - Review shared devices/IPs
   - Investigate network connections

5. **Action Display in UI**
   - **Quick Actions Panel** (on transaction detail page):
     - Buttons for common actions
     - Color-coded by urgency
     - Role-based visibility (INVESTIGATOR, ADMIN only)
   
   - **Suggested Actions List**:
     - Ordered by relevance score
     - Show action description
     - Show expected impact
     - Show similar past cases

**Output**: Displayed suggested actions in UI

---

### Phase 9: Action Execution

**Input**: User selects an action

**Process**:
1. **Action Selection**
   - User clicks action button (e.g., "Create Case", "Block Transaction")
   - Confirmation dialog (for destructive actions)
   - User confirms action

2. **Action Execution**
   - **Create Case**:
     - Create case record
     - Link transaction(s)
     - Create initial case event
     - Notify assigned investigator
   
   - **Flag Transaction**:
     - Update transaction status: `flagged`
     - Create case event (if case exists)
     - Add to flagged transactions list
   
   - **Block Transaction**:
     - Call payment processor API (if integrated)
     - Update transaction status: `blocked`
     - Create audit log entry
     - Notify customer (if configured)
   
   - **Freeze Account**:
     - Call account management API
     - Update account status: `frozen`
     - Create audit log entry
     - Notify customer
   
   - **Approve Transaction**:
     - Update transaction status: `approved`
     - Update score decision: `approve`
     - Create audit log entry
     - Remove from alerts (if applicable)

3. **Audit Logging**
   - Log all actions in `audit_log` table
   - Store: action, resource_type, resource_id, actor_id, before_state, after_state, timestamp, IP address, user agent

4. **Notifications**
   - Send notification to relevant parties (investigators, managers, customers)
   - Update dashboard in real-time
   - Update case timeline (if case exists)

**Output**: Action executed, audit log entry, notifications sent

---

### Phase 10: Case Investigation & Resolution

**Input**: Case created from alert

**Process**:
1. **Case Assignment**
   - Auto-assign to available investigator (round-robin)
   - Or manual assignment by manager
   - Notify investigator

2. **Investigation Workflow**
   - Investigator opens case
   - Reviews transaction details
   - Explores entity network
   - Adds related transactions/entities
   - Adds case events (notes, actions)
   - Updates case status

3. **Case Resolution**
   - **False Positive**: Mark as FALSE_POSITIVE, close case
   - **Confirmed Fraud**: Mark as CONFIRMED_FRAUD, escalate, freeze accounts
   - **Under Investigation**: Continue investigation, add notes
   - **Remediation**: Take corrective actions, document

4. **Case Closure**
   - Update case status: `CLOSED`
   - Add final note
   - Link to resolved transactions
   - Generate case report
   - Update model feedback (if supervised learning enabled)

**Output**: Resolved case, updated audit log, case report

---

## Real-Time Data Flow Architecture

### Components

1. **Transaction Ingestion Service**
   - REST API endpoint: `/api/transactions/score`
   - Message queue consumer (Kafka, RabbitMQ, etc.)
   - Webhook receiver
   - Batch processor (for historical data)

2. **Scoring Engine**
   - Feature engineering service
   - ML model inference service
   - Risk scoring service
   - Threshold management service

3. **Alert Service**
   - Alert generator
   - Alert dispatcher (WebSocket, SSE, webhook)
   - Alert storage

4. **Dashboard Service**
   - Real-time data aggregator
   - WebSocket server
   - API endpoints for dashboard data

5. **Case Management Service**
   - Case creation service
   - Case assignment service
   - Case workflow engine

6. **Action Service**
   - Action executor
   - Integration adapters (payment processor, account management, etc.)
   - Audit logger

---

## Performance Targets

- **Transaction Scoring Latency**: < 100ms (p95)
- **Alert Generation Latency**: < 200ms (end-to-end)
- **Dashboard Update Latency**: < 500ms (real-time)
- **Throughput**: 10,000+ transactions/second (horizontal scaling)

---

## Error Handling & Resilience

1. **Transaction Ingestion Failures**
   - Retry with exponential backoff
   - Dead letter queue for failed transactions
   - Alert on persistent failures

2. **Scoring Engine Failures**
   - Fallback to rule-based scoring
   - Queue transactions for later processing
   - Alert on model failures

3. **Database Failures**
   - Retry with connection pooling
   - Use read replicas for queries
   - Cache frequently accessed data

4. **Real-Time Update Failures**
   - Queue updates for later delivery
   - Fallback to polling
   - Graceful degradation

---

## Monitoring & Observability

1. **Metrics** (Prometheus)
   - Transaction throughput
   - Scoring latency
   - Alert generation rate
   - Case creation rate
   - Action execution rate
   - Error rates

2. **Logging** (ELK Stack)
   - Transaction logs
   - Scoring logs
   - Alert logs
   - Action logs
   - Error logs

3. **Tracing** (OpenTelemetry)
   - End-to-end transaction tracing
   - Service dependency mapping
   - Performance bottleneck identification

---

## Configuration

### Threshold Configuration
- Anomaly threshold percentile: 95% (configurable)
- Risk level thresholds: Configurable per customer/merchant
- Auto-case creation rules: Configurable

### Alert Configuration
- Alert channels: WebSocket, Email, SMS, Webhook
- Alert rules: Risk level, score threshold, pattern matching
- Alert throttling: Rate limiting, deduplication

### Action Configuration
- Action availability: Role-based
- Action confirmation: Required for destructive actions
- Action integrations: Payment processor, account management, etc.

---

## Example Flow: High-Risk Transaction

1. **Transaction Arrives**: $5,000 purchase at electronics store
2. **Feature Engineering**: Detects unusual amount, new device, geographic anomaly
3. **Scoring**: Anomaly score = 0.72 (HIGH risk)
4. **Alert Generated**: Real-time alert pushed to dashboard
5. **Dashboard Updates**: Alert appears in "Incoming Alerts" panel, KPI cards update
6. **Auto-Case Created**: Case CASE-2025-12-24-001 created, assigned to Investigator A
7. **Investigator Reviews**: Opens case, views transaction details, sees suggested actions
8. **Action Suggested**: "Contact Customer", "Review Entity Network", "Freeze Account"
9. **Investigator Takes Action**: Contacts customer, verifies transaction is legitimate
10. **Case Resolved**: Marks as FALSE_POSITIVE, closes case, adds note
11. **Audit Logged**: All actions logged for compliance

---

## Integration Points

1. **Transaction Sources**
   - Payment processors (Stripe, PayPal, etc.)
   - Core banking systems
   - Card networks (Visa, Mastercard)
   - Mobile payment apps

2. **External Services**
   - Payment processor APIs (block transactions)
   - Account management APIs (freeze accounts)
   - Customer communication APIs (send notifications)
   - Identity verification services

3. **Data Sources**
   - Customer databases
   - Merchant databases
   - Device fingerprinting services
   - IP geolocation services
   - Credit bureaus (optional)

---

## Future Enhancements

1. **Real-Time Learning**
   - Online model updates
   - Feedback loop integration
   - Continuous model retraining

2. **Advanced Analytics**
   - Graph neural networks for network analysis
   - Time series forecasting
   - Fraud ring detection

3. **Automated Actions**
   - Auto-approve low-risk transactions
   - Auto-block confirmed fraud patterns
   - Auto-escalate based on rules

4. **Enhanced Explainability**
   - Natural language explanations
   - Visual feature importance
   - Counterfactual explanations

---

## Conclusion

This process flow ensures that every transaction is scored in real-time, high-risk transactions generate alerts immediately, investigators receive actionable suggestions, and all actions are logged for audit and compliance purposes. The system is designed for scalability, reliability, and transparency.

