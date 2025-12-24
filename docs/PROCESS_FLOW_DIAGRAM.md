# Process Flow Diagram

## Mermaid Diagram: Real-Time Fraud Detection Flow

```mermaid
graph TB
    Start([Transaction Feed]) --> Ingest[Transaction Ingestion API]
    Ingest --> Validate{Validation}
    Validate -->|Valid| Store[Store Transaction]
    Validate -->|Invalid| Reject[Reject & Log Error]
    
    Store --> Features[Feature Engineering]
    Features --> Normalize[Normalize Features]
    
    Normalize --> Autoencoder[Autoencoder Inference]
    Autoencoder --> Score[Calculate Anomaly Score]
    
    Score --> Threshold{Score > Threshold?}
    Threshold -->|No| Approve[Approve Transaction]
    Threshold -->|Yes| RiskLevel{Determine Risk Level}
    
    RiskLevel -->|CRITICAL| Critical[CRITICAL Risk]
    RiskLevel -->|HIGH| High[HIGH Risk]
    RiskLevel -->|MEDIUM| Medium[MEDIUM Risk]
    RiskLevel -->|LOW| Low[LOW Risk]
    
    Critical --> AlertGen[Generate Alert]
    High --> AlertGen
    Medium --> Monitor[Monitor]
    Low --> Approve
    
    AlertGen --> StoreScore[Store Score & Alert]
    StoreScore --> PushAlert[Push to Dashboard]
    PushAlert --> Dashboard[Real-Time Dashboard]
    
    Dashboard --> AutoCase{Auto-Create Case?}
    AutoCase -->|Yes| CreateCase[Create Case]
    AutoCase -->|No| ManualCase[Manual Case Creation]
    
    CreateCase --> Assign[Assign Investigator]
    ManualCase --> Assign
    
    Assign --> Review[Investigator Review]
    Review --> Suggestions[Generate Suggested Actions]
    
    Suggestions --> Action1[Block Transaction]
    Suggestions --> Action2[Create Case]
    Suggestions --> Action3[Freeze Account]
    Suggestions --> Action4[Contact Customer]
    Suggestions --> Action5[Approve]
    
    Action1 --> Execute[Execute Action]
    Action2 --> Execute
    Action3 --> Execute
    Action4 --> Execute
    Action5 --> Execute
    
    Execute --> Audit[Audit Logging]
    Audit --> Notify[Send Notifications]
    Notify --> Update[Update Dashboard]
    
    Update --> CaseWorkflow[Case Investigation]
    CaseWorkflow --> Resolve[Resolve Case]
    Resolve --> End([End])
    
    Approve --> End
    Monitor --> End
    Reject --> End
    
    style Start fill:#e1f5ff
    style Dashboard fill:#fff4e1
    style AlertGen fill:#ffebee
    style Critical fill:#ff5252
    style High fill:#ff9800
    style Medium fill:#ffc107
    style Low fill:#4caf50
    style End fill:#e8f5e9
```

## Sequence Diagram: Real-Time Transaction Processing

```mermaid
sequenceDiagram
    participant Feed as Transaction Feed
    participant API as Ingestion API
    participant DB as Database
    participant FE as Feature Engine
    participant ML as ML Model
    participant Alert as Alert Service
    participant WS as WebSocket Server
    participant UI as Dashboard UI
    participant Inv as Investigator
    
    Feed->>API: POST /api/transactions/score
    API->>DB: Store Transaction
    API->>FE: Extract Features
    FE->>FE: Normalize Features
    FE->>ML: Score Transaction
    ML->>ML: Autoencoder Inference
    ML-->>FE: Anomaly Score
    
    alt Score > Threshold
        FE->>DB: Store Score (HIGH/CRITICAL)
        FE->>Alert: Generate Alert
        Alert->>DB: Store Alert
        Alert->>WS: Push Alert
        WS->>UI: Real-Time Update
        
        alt Auto-Create Case
            Alert->>DB: Create Case
            DB-->>Alert: Case Created
            Alert->>WS: Push Case Event
            WS->>UI: Update Case List
        end
        
        UI->>Inv: Show Alert
        Inv->>UI: View Transaction Details
        UI->>Inv: Show Suggested Actions
        Inv->>UI: Select Action
        UI->>API: Execute Action
        API->>DB: Update Transaction
        API->>DB: Audit Log
        API->>WS: Push Update
        WS->>UI: Update Dashboard
    else Score <= Threshold
        FE->>DB: Store Score (LOW/MEDIUM)
        FE->>WS: Push Transaction
        WS->>UI: Update Dashboard (Approve)
    end
```

## Component Interaction Diagram

```mermaid
graph LR
    subgraph "Ingestion Layer"
        API[REST API]
        Queue[Message Queue]
        Webhook[Webhook Receiver]
    end
    
    subgraph "Processing Layer"
        Validator[Transaction Validator]
        FeatureEng[Feature Engineer]
        Scorer[Scoring Engine]
        ThresholdMgr[Threshold Manager]
    end
    
    subgraph "ML Layer"
        Autoencoder[Autoencoder Model]
        Classifier[Supervised Classifier]
        Explain[Explainability Engine]
    end
    
    subgraph "Alert Layer"
        AlertGen[Alert Generator]
        AlertStore[Alert Storage]
        Notifier[Notification Service]
    end
    
    subgraph "Dashboard Layer"
        WS[WebSocket Server]
        Aggregator[Data Aggregator]
        API2[Dashboard API]
    end
    
    subgraph "Case Management"
        CaseMgr[Case Manager]
        Workflow[Workflow Engine]
        Assigner[Assignment Service]
    end
    
    subgraph "Action Layer"
        ActionExec[Action Executor]
        Integrations[External Integrations]
        Audit[Audit Logger]
    end
    
    API --> Validator
    Queue --> Validator
    Webhook --> Validator
    
    Validator --> FeatureEng
    FeatureEng --> Scorer
    Scorer --> Autoencoder
    Scorer --> Classifier
    Scorer --> Explain
    
    Autoencoder --> ThresholdMgr
    ThresholdMgr --> AlertGen
    
    AlertGen --> AlertStore
    AlertGen --> Notifier
    AlertGen --> CaseMgr
    
    AlertStore --> WS
    WS --> Aggregator
    Aggregator --> API2
    
    CaseMgr --> Workflow
    Workflow --> Assigner
    
    Assigner --> ActionExec
    ActionExec --> Integrations
    ActionExec --> Audit
    
    style API fill:#e3f2fd
    style Scorer fill:#fff3e0
    style AlertGen fill:#ffebee
    style WS fill:#f3e5f5
    style ActionExec fill:#e8f5e9
```

## Data Flow Diagram

```mermaid
flowchart TD
    subgraph "Input"
        T1[Transaction Data]
    end
    
    subgraph "Processing"
        F1[Raw Features]
        F2[Normalized Features]
        F3[Feature Vector]
    end
    
    subgraph "ML Pipeline"
        M1[Encoder]
        M2[Latent Space]
        M3[Decoder]
        M4[Reconstruction Error]
    end
    
    subgraph "Scoring"
        S1[Anomaly Score]
        S2[Risk Level]
        S3[Decision]
        S4[Feature Contributions]
    end
    
    subgraph "Output"
        O1[Alert]
        O2[Dashboard Update]
        O3[Case]
        O4[Suggested Actions]
    end
    
    T1 --> F1
    F1 --> F2
    F2 --> F3
    
    F3 --> M1
    M1 --> M2
    M2 --> M3
    M3 --> M4
    
    M4 --> S1
    S1 --> S2
    S2 --> S3
    F3 --> S4
    
    S2 --> O1
    S3 --> O2
    O1 --> O3
    O3 --> O4
    
    style T1 fill:#e1f5ff
    style M2 fill:#fff4e1
    style S1 fill:#ffebee
    style O1 fill:#ff5252
    style O4 fill:#4caf50
```

## Alert Lifecycle

```mermaid
stateDiagram-v2
    [*] --> TransactionReceived: Transaction Arrives
    TransactionReceived --> FeatureExtracted: Extract Features
    FeatureExtracted --> Scored: ML Scoring
    Scored --> ThresholdCheck: Check Threshold
    
    ThresholdCheck --> Approved: Score <= Threshold
    ThresholdCheck --> AlertGenerated: Score > Threshold
    
    Approved --> [*]
    
    AlertGenerated --> DashboardDisplayed: Push to Dashboard
    DashboardDisplayed --> CaseCreated: Auto-Create Case
    DashboardDisplayed --> ManualReview: Manual Review
    
    CaseCreated --> Assigned: Assign Investigator
    ManualReview --> CaseCreated: Create Case
    
    Assigned --> Reviewed: Investigator Reviews
    Reviewed --> ActionsSuggested: Generate Actions
    
    ActionsSuggested --> ActionExecuted: Execute Action
    ActionExecuted --> CaseResolved: Resolve Case
    
    CaseResolved --> [*]
    
    note right of AlertGenerated
        Alert Types:
        - Real-Time Alert
        - Dashboard Alert
        - Email/SMS Alert
    end note
    
    note right of ActionsSuggested
        Suggested Actions:
        - Block Transaction
        - Freeze Account
        - Create Case
        - Contact Customer
        - Approve
    end note
```

## Suggested Actions Decision Tree

```mermaid
graph TD
    Start([Transaction Scored]) --> Risk{Risk Level?}
    
    Risk -->|CRITICAL| CriticalActions[CRITICAL Actions]
    Risk -->|HIGH| HighActions[HIGH Actions]
    Risk -->|MEDIUM| MediumActions[MEDIUM Actions]
    Risk -->|LOW| LowActions[LOW Actions]
    
    CriticalActions --> C1[Block Transaction]
    CriticalActions --> C2[Freeze Account]
    CriticalActions --> C3[Create Case]
    CriticalActions --> C4[Escalate to Manager]
    CriticalActions --> C5[Contact Customer]
    CriticalActions --> C6[Block Device/IP]
    
    HighActions --> H1[Flag Transaction]
    HighActions --> H2[Create Case]
    HighActions --> H3[Add to Watchlist]
    HighActions --> H4[Request Verification]
    HighActions --> H5[Review Entity Network]
    
    MediumActions --> M1[Monitor]
    MediumActions --> M2[Review Later]
    MediumActions --> M3[Approve with Note]
    
    LowActions --> L1[Approve]
    LowActions --> L2[No Action]
    
    C1 --> Pattern{Pattern Type?}
    C2 --> Pattern
    C3 --> Pattern
    H1 --> Pattern
    H2 --> Pattern
    
    Pattern -->|New Device| P1[Verify Device Ownership]
    Pattern -->|Geographic Anomaly| P2[Verify Travel Status]
    Pattern -->|Unusual Amount| P3[Compare Spending Patterns]
    Pattern -->|Velocity Anomaly| P4[Check Transaction Frequency]
    Pattern -->|Network Anomaly| P5[Explore Entity Relationships]
    
    P1 --> Execute[Execute Action]
    P2 --> Execute
    P3 --> Execute
    P4 --> Execute
    P5 --> Execute
    
    Execute --> Audit[Audit Log]
    Audit --> Notify[Send Notifications]
    Notify --> Update[Update Dashboard]
    
    style CriticalActions fill:#ff5252
    style HighActions fill:#ff9800
    style MediumActions fill:#ffc107
    style LowActions fill:#4caf50
```

