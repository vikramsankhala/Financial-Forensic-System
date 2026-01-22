# Real-Time Dashboard Specification

## Overview

The real-time dashboard provides live updates of transaction scoring, alerts, and case management activities. It uses WebSocket connections for instant updates without page refresh.

---

## Dashboard Components

### 1. Incoming Alerts Panel

**Location**: Top of dashboard, left sidebar, or dedicated alerts page

**Features**:
- Real-time alert feed (newest first)
- Color-coded by risk level (CRITICAL=red, HIGH=orange, MEDIUM=yellow)
- Alert count badge
- Auto-refresh every 5 seconds (or WebSocket push)
- Click to view transaction details

**Alert Card Display**:
```
┌─────────────────────────────────────┐
│ 🔴 CRITICAL                          │
│ Transaction: TXN-12345              │
│ Amount: $5,000.00                    │
│ Merchant: Electronics Store         │
│ Score: 0.85                          │
│ 2 minutes ago                        │
│ [View] [Create Case] [Approve]      │
└─────────────────────────────────────┘
```

**Data Source**: `GET /api/alerts/recent?limit=50&risk_level=HIGH,CRITICAL`

**WebSocket Event**: `new_alert`

---

### 2. Real-Time Transaction Feed

**Location**: Main dashboard area

**Features**:
- Live transaction stream
- Filterable by risk level, merchant, customer
- Searchable
- Pagination or infinite scroll
- Export to CSV

**Transaction Row Display**:
```
┌────────────────────────────────────────────────────────────┐
│ TXN-12345 | $5,000.00 | Electronics Store | HIGH | 0.72   │
│ Customer: CUST-789 | Device: NEW | IP: 192.168.1.1        │
│ [View] [Flag] [Create Case]                                │
└────────────────────────────────────────────────────────────┘
```

**Data Source**: `GET /api/transactions?limit=100&order_by=timestamp&order=desc`

**WebSocket Event**: `transaction_scored`

---

### 3. KPI Cards

**Location**: Top of dashboard

**Metrics**:
- **Total Transactions Today**: Count of transactions processed today
- **High-Risk Transactions**: Count of HIGH/CRITICAL risk transactions
- **Alerts Generated**: Count of alerts generated today
- **Open Cases**: Count of open cases
- **False Positive Rate**: Percentage of cases marked as false positive (if available)
- **Average Response Time**: Average time to first action on alert

**Update Frequency**: Every 10 seconds

**Data Source**: `GET /api/metrics/dashboard`

**WebSocket Event**: `metrics_updated`

---

### 4. Risk Distribution Chart

**Location**: Dashboard center

**Chart Type**: Pie chart or donut chart

**Data**:
- CRITICAL: Count and percentage
- HIGH: Count and percentage
- MEDIUM: Count and percentage
- LOW: Count and percentage

**Update Frequency**: Every 30 seconds

**Data Source**: `GET /api/metrics/risk-distribution`

---

### 5. Transactions Over Time

**Location**: Dashboard center

**Chart Type**: Line chart

**Data**:
- X-axis: Time (hourly or 15-minute intervals)
- Y-axis: Transaction count
- Multiple lines: Total transactions, High-risk transactions, Alerts

**Update Frequency**: Every 1 minute

**Data Source**: `GET /api/metrics/transactions-over-time?interval=15m&hours=24`

---

### 6. Top Merchants/Geographies

**Location**: Dashboard sidebar

**Chart Type**: Bar chart or table

**Data**:
- Top 10 merchants by transaction volume
- Top 10 merchants by risk score
- Top 10 countries/regions by transaction volume
- Top 10 countries/regions by risk score

**Update Frequency**: Every 5 minutes

**Data Source**: `GET /api/metrics/top-merchants?limit=10`

---

### 7. Recent Cases

**Location**: Dashboard sidebar

**Features**:
- List of recently created/updated cases
- Case status, priority, owner
- Click to open case detail page

**Data Source**: `GET /api/cases?limit=10&order_by=updated_at&order=desc`

**WebSocket Event**: `case_updated`

---

## WebSocket Events

### Client → Server

```javascript
// Subscribe to alerts
{
  "type": "subscribe",
  "channel": "alerts"
}

// Subscribe to transactions
{
  "type": "subscribe",
  "channel": "transactions"
}

// Subscribe to cases
{
  "type": "subscribe",
  "channel": "cases"
}

// Subscribe to metrics
{
  "type": "subscribe",
  "channel": "metrics"
}
```

### Server → Client

```javascript
// New alert
{
  "type": "new_alert",
  "data": {
    "alert_id": "ALERT-2025-12-24-001",
    "transaction_id": "TXN-12345",
    "risk_level": "HIGH",
    "anomaly_score": 0.72,
    "amount": 5000.00,
    "currency": "USD",
    "merchant": "Electronics Store",
    "customer_id": "CUST-789",
    "timestamp": "2025-12-24T10:30:00Z",
    "reasons": ["Unusual amount", "New device"]
  }
}

// Transaction scored
{
  "type": "transaction_scored",
  "data": {
    "transaction_id": "TXN-12345",
    "risk_level": "HIGH",
    "anomaly_score": 0.72,
    "decision": "review"
  }
}

// Case created/updated
{
  "type": "case_updated",
  "data": {
    "case_id": "CASE-2025-12-24-001",
    "status": "OPEN",
    "priority": "high",
    "updated_at": "2025-12-24T10:35:00Z"
  }
}

// Metrics updated
{
  "type": "metrics_updated",
  "data": {
    "total_transactions_today": 1250,
    "high_risk_transactions": 45,
    "alerts_generated": 38,
    "open_cases": 12
  }
}
```

---

## Suggested Actions Display

### Location
- Transaction detail page
- Alert detail modal
- Case detail page

### Action Button Styles

```css
/* CRITICAL Actions - Red */
.critical-action {
  background-color: #ff5252;
  color: white;
}

/* HIGH Actions - Orange */
.high-action {
  background-color: #ff9800;
  color: white;
}

/* MEDIUM Actions - Yellow */
.medium-action {
  background-color: #ffc107;
  color: black;
}

/* LOW Actions - Green */
.low-action {
  background-color: #4caf50;
  color: white;
}
```

### Action Display Format

```
┌─────────────────────────────────────┐
│ Suggested Actions                   │
├─────────────────────────────────────┤
│ 🔴 Block Transaction                │
│    Prevent transaction from          │
│    processing                        │
│    [Execute]                         │
├─────────────────────────────────────┤
│ 🟠 Create Case                      │
│    Start investigation               │
│    [Execute]                         │
├─────────────────────────────────────┤
│ 🟠 Contact Customer                  │
│    Verify transaction                │
│    [Execute]                         │
├─────────────────────────────────────┤
│ 🟡 Monitor                          │
│    Add to monitoring list            │
│    [Execute]                         │
└─────────────────────────────────────┘
```

### Action Execution Flow

1. User clicks action button
2. Confirmation dialog (for destructive actions)
3. User confirms
4. API call to execute action
5. Loading state
6. Success/error notification
7. Dashboard update
8. Audit log entry

---

## API Endpoints for Dashboard

### Alerts

```
GET /api/alerts/recent
Query Parameters:
  - limit: number (default: 50)
  - risk_level: string (HIGH,CRITICAL)
  - status: string (new,acknowledged,resolved)
Response: Array of Alert objects
```

### Transactions

```
GET /api/transactions
Query Parameters:
  - limit: number (default: 100)
  - offset: number (default: 0)
  - risk_level: string (LOW,MEDIUM,HIGH,CRITICAL)
  - merchant_id: string
  - customer_id: string
  - flagged: boolean
  - order_by: string (timestamp,score)
  - order: string (asc,desc)
Response: Paginated Transaction objects
```

### Metrics

```
GET /api/metrics/dashboard
Response: {
  total_transactions_today: number,
  high_risk_transactions: number,
  alerts_generated: number,
  open_cases: number,
  false_positive_rate: number,
  average_response_time: number
}

GET /api/metrics/risk-distribution
Response: {
  critical: { count: number, percentage: number },
  high: { count: number, percentage: number },
  medium: { count: number, percentage: number },
  low: { count: number, percentage: number }
}

GET /api/metrics/transactions-over-time
Query Parameters:
  - interval: string (15m,1h,1d)
  - hours: number (default: 24)
Response: Array of { timestamp: string, total: number, high_risk: number, alerts: number }
```

### Cases

```
GET /api/cases
Query Parameters:
  - limit: number (default: 10)
  - status: string (OPEN,CLOSED,INVESTIGATION)
  - priority: string (low,medium,high,critical)
  - owner_id: number
Response: Array of Case objects
```

---

## Performance Requirements

- **Dashboard Load Time**: < 2 seconds
- **WebSocket Latency**: < 100ms
- **Update Frequency**: Real-time (sub-second)
- **Concurrent Users**: Support 100+ concurrent WebSocket connections
- **Data Refresh**: Incremental updates (not full reload)

---

## Implementation Notes

1. **WebSocket Connection Management**
   - Auto-reconnect on disconnect
   - Heartbeat/ping every 30 seconds
   - Connection state indicator in UI

2. **Data Caching**
   - Cache recent transactions in browser
   - Cache metrics for 10 seconds
   - Use React Query for data management

3. **Error Handling**
   - Graceful degradation if WebSocket fails
   - Fallback to polling every 5 seconds
   - Error notifications for failed actions

4. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - High contrast mode
   - Focus indicators

5. **Mobile Responsiveness**
   - Responsive layout
   - Touch-friendly buttons
   - Swipe gestures for alerts
   - Mobile-optimized charts

---

## Security Considerations

1. **Authentication**: JWT token required for WebSocket connection
2. **Authorization**: Role-based access to actions
3. **Rate Limiting**: Limit API calls per user
4. **Data Masking**: Mask sensitive data (PII) in logs
5. **Audit Logging**: Log all dashboard actions

---

## Future Enhancements

1. **Customizable Dashboard**: User-configurable widgets
2. **Alert Rules**: User-defined alert rules
3. **Notification Preferences**: User-configurable notification channels
4. **Advanced Filtering**: Complex filter combinations
5. **Export Functionality**: Export alerts, transactions, cases to CSV/PDF
6. **Dashboard Sharing**: Share dashboard views with team members

