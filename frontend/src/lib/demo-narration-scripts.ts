export type UseCaseId =
  | 'real-time-alert-triage'
  | 'complex-case-investigation'
  | 'network-entity-analysis';

export const NARRATION_SCRIPTS: Record<UseCaseId, string> = {
  'real-time-alert-triage':
    'This walkthrough demonstrates real-time alert triage. We review a high-risk transaction, validate key risk signals, and decide whether to escalate. The system highlights velocity, amount anomalies, and geo mismatches to speed up triage decisions.',
  'complex-case-investigation':
    'This walkthrough demonstrates complex case investigation. We gather related transactions, add notes, and build a timeline of events. The evidence chain is preserved automatically for compliance and audit review.',
  'network-entity-analysis':
    'This walkthrough demonstrates entity network analysis. We explore connections between customers, merchants, and related accounts to identify fraud rings and suspicious clusters.',
};
