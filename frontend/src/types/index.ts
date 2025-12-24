/** TypeScript type definitions */

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum CaseStatus {
  OPEN = 'open',
  TRIAGE = 'triage',
  INVESTIGATION = 'investigation',
  REMEDIATION = 'remediation',
  CLOSED = 'closed',
}

export interface Transaction {
  id: number;
  transaction_id: string;
  amount: number;
  currency: string;
  merchant_id?: string;
  merchant_name?: string;
  merchant_category?: string;
  channel?: string;
  customer_id?: string;
  account_id?: string;
  device_id?: string;
  ip_address?: string;
  geo_country?: string;
  geo_city?: string;
  timestamp: string;
  created_at: string;
}

export interface Score {
  transaction_id: number;
  anomaly_score: number;
  reconstruction_error?: number;
  classifier_score?: number;
  risk_level: RiskLevel;
  decision: string;
  feature_contributions: Record<string, number>;
  created_at: string;
}

export interface TransactionScoreResponse {
  transaction_id: string;
  score: number;
  risk_level: RiskLevel;
  decision: string;
  reasons: string[];
  feature_contributions: Record<string, number>;
}

export interface Case {
  id: number;
  case_id: string;
  title: string;
  description?: string;
  status: CaseStatus;
  priority?: string;
  owner_id?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface CaseEvent {
  id: number;
  case_id: number;
  event_type: string;
  title: string;
  content?: string;
  metadata?: Record<string, any>;
  created_by_id?: number;
  created_at: string;
}

export interface Entity {
  id: number;
  entity_id: string;
  entity_type: string;
  name?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EntityNetworkResponse {
  entity: Entity;
  links: Array<{
    from_entity_id: string;
    to_entity_id: string;
    entity_type: string;
    relationship_type: string;
    metadata?: Record<string, any>;
  }>;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

