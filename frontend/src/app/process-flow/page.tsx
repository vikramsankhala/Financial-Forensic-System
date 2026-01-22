'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';

const steps = [
  {
    label: 'Transaction Ingestion',
    icon: <TrendingUpIcon />,
    description: 'Real-time transaction feed received via API',
    details: [
      'Transaction arrives via POST /api/transactions/score',
      'Schema validation using Pydantic models',
      'Required fields and data type validation',
      'Business rule validation (amount > 0, valid currency)',
      'Store raw transaction in database',
    ],
    output: 'Validated transaction record',
  },
  {
    label: 'Feature Engineering',
    icon: <BuildIcon />,
    description: 'Extract and normalize 18+ features',
    details: [
      'Amount features: Normalized amount, deviation from averages',
      'Temporal features: Time of day, recency, frequency',
      'Geographic features: Distance, country encoding, IP geolocation',
      'Device & channel features: Device fingerprint, channel type',
      'Behavioral features: Transaction velocity, merchant category',
      'Network features: Entity relationships, shared patterns',
      'Apply StandardScaler normalization',
    ],
    output: 'Normalized 18-dimensional feature vector',
  },
  {
    label: 'ML-Based Anomaly Detection',
    icon: <AssessmentIcon />,
    description: 'Autoencoder inference and anomaly scoring',
    details: [
      'Load pre-trained PyTorch autoencoder model',
      'Encode: Feature vector → Latent representation (6D)',
      'Decode: Latent representation → Reconstructed vector',
      'Compute reconstruction error: MSE(original, reconstructed)',
      'Anomaly score = reconstruction error',
      'Compare against dynamic threshold (95th percentile)',
    ],
    output: 'Anomaly score, reconstruction error, threshold comparison',
  },
  {
    label: 'Risk Scoring & Classification',
    icon: <SecurityIcon />,
    description: 'Assign risk level and decision',
    details: [
      'CRITICAL (score > 0.8): Immediate review required',
      'HIGH (score > 0.6): High priority investigation',
      'MEDIUM (score > 0.4): Standard review',
      'LOW (score ≤ 0.4): Normal transaction',
      'Decision: Approve, Monitor, or Review',
      'Calculate feature contributions for explainability',
      'Generate human-readable reasons',
    ],
    output: 'Risk level, decision, feature contributions, reasons',
  },
  {
    label: 'Alert Generation',
    icon: <NotificationsIcon />,
    description: 'Generate alerts for high-risk transactions',
    details: [
      'Condition: Risk level HIGH/CRITICAL AND decision = "review"',
      'Store score in database',
      'Create alert record',
      'Push real-time alert to dashboard (WebSocket)',
      'Send email/SMS for CRITICAL risk (configurable)',
      'Alert includes: transaction details, risk level, reasons',
    ],
    output: 'Alert record, real-time notification',
  },
  {
    label: 'Real-Time Dashboard Update',
    icon: <InfoIcon />,
    description: 'Update dashboard with live data',
    details: [
      'WebSocket push to connected clients',
      'Update incoming alerts panel',
      'Update real-time transaction feed',
      'Update KPI cards (total transactions, alerts, cases)',
      'Update charts (risk distribution, transactions over time)',
      'Color-code by risk level',
    ],
    output: 'Updated dashboard UI, real-time notifications',
  },
  {
    label: 'Case Creation',
    icon: <AssignmentIcon />,
    description: 'Automatic or manual case creation',
    details: [
      'Auto-create if: CRITICAL OR (HIGH AND score > 0.7)',
      'Generate unique case ID',
      'Set status: OPEN, priority based on risk level',
      'Assign to investigator (round-robin or unassigned)',
      'Link transaction to case',
      'Create initial case event',
      'Log audit entry',
    ],
    output: 'Case record, case event, audit log',
  },
  {
    label: 'Suggested Actions',
    icon: <CheckCircleIcon />,
    description: 'Generate context-aware action suggestions',
    details: [
      'CRITICAL: Block transaction, Freeze account, Escalate',
      'HIGH: Flag transaction, Create case, Add to watchlist',
      'MEDIUM: Monitor, Review later, Approve with note',
      'LOW: Approve, No action',
      'Pattern-based: Device verification, Geographic check, Amount review',
      'Display in UI with action buttons',
    ],
    output: 'Displayed suggested actions',
  },
  {
    label: 'Action Execution',
    icon: <CheckCircleOutlineIcon />,
    description: 'Execute selected action',
    details: [
      'User selects action (e.g., Block, Create Case, Approve)',
      'Confirmation dialog for destructive actions',
      'Execute action (API call, external service integration)',
      'Update transaction/case status',
      'Create audit log entry',
      'Send notifications',
      'Update dashboard',
    ],
    output: 'Action executed, audit log, notifications',
  },
  {
    label: 'Case Resolution',
    icon: <CheckCircleIcon />,
    description: 'Investigate and resolve case',
    details: [
      'Investigator reviews case',
      'Explores entity network',
      'Adds related transactions/entities',
      'Adds case events (notes, actions)',
      'Resolves: False Positive, Confirmed Fraud, Under Investigation',
      'Closes case with final note',
      'Generates case report',
    ],
    output: 'Resolved case, case report, updated audit log',
  },
];

const riskLevels = [
  { level: 'CRITICAL', color: '#ff5252', score: '> 0.8', actions: ['Block Transaction', 'Freeze Account', 'Escalate', 'Contact Customer'] },
  { level: 'HIGH', color: '#ff9800', score: '> 0.6', actions: ['Flag Transaction', 'Create Case', 'Add to Watchlist', 'Request Verification'] },
  { level: 'MEDIUM', color: '#ffc107', score: '> 0.4', actions: ['Monitor', 'Review Later', 'Approve with Note'] },
  { level: 'LOW', color: '#4caf50', score: '≤ 0.4', actions: ['Approve', 'No Action'] },
];

export default function ProcessFlowPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Real-Time Fraud Detection Process Flow
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          End-to-end process from transaction ingestion through fraud detection, alert generation, dashboard updates, and case resolution.
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            <strong>Performance Targets:</strong> Transaction scoring latency &lt; 100ms (p95), Alert generation &lt; 200ms, Dashboard updates &lt; 500ms, Throughput: 10,000+ transactions/second
          </Typography>
        </Alert>

        {/* Process Flow Stepper */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Process Flow Steps
          </Typography>
          <Stepper orientation="vertical">
            {steps.map((step, index) => (
              <Step key={index} active={activeStep === index} completed={activeStep !== null && activeStep > index}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: activeStep === index ? 'primary.main' : 'grey.300',
                        color: activeStep === index ? 'white' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      onClick={() => setActiveStep(activeStep === index ? null : index)}
                    >
                      {step.icon}
                    </Box>
                  )}
                >
                  <Typography variant="h6">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {step.description}
                  </Typography>
                  <List dense>
                    {step.details.map((detail, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={detail} />
                      </ListItem>
                    ))}
                  </List>
                  <Box mt={2}>
                    <Chip label={`Output: ${step.output}`} color="primary" variant="outlined" size="small" />
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Risk Levels and Actions */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Risk Levels & Suggested Actions
            </Typography>
          </Grid>
          {riskLevels.map((risk) => (
            <Grid item xs={12} md={6} key={risk.level}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: risk.color,
                        mr: 1,
                      }}
                    />
                    <Typography variant="h6">{risk.level}</Typography>
                    <Chip label={`Score ${risk.score}`} size="small" sx={{ ml: 2 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Suggested Actions:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {risk.actions.map((action, idx) => (
                      <Chip key={idx} label={action} size="small" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Key Components */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            System Components
          </Typography>
          <Grid container spacing={2}>
            {[
              { name: 'Transaction Ingestion', desc: 'REST API, Message Queue, Webhook' },
              { name: 'Scoring Engine', desc: 'Feature Engineering, ML Inference, Risk Scoring' },
              { name: 'Alert Service', desc: 'Alert Generator, Dispatcher, Storage' },
              { name: 'Dashboard Service', desc: 'Real-time Aggregator, WebSocket Server' },
              { name: 'Case Management', desc: 'Case Creation, Assignment, Workflow' },
              { name: 'Action Service', desc: 'Action Executor, Integrations, Audit Logger' },
            ].map((component, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {component.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {component.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Performance Metrics */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Performance Metrics & Monitoring</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Metrics (Prometheus)
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Transaction throughput" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Scoring latency" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Alert generation rate" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Case creation rate" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Action execution rate" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Error rates" />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Logging & Tracing
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Transaction logs (ELK Stack)" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Scoring logs" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Alert logs" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Action logs" />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="End-to-end tracing (OpenTelemetry)" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Example Flow */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Example Flow: High-Risk Transaction
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Transaction Arrives: $5,000 purchase at electronics store" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Feature Engineering: Detects unusual amount, new device, geographic anomaly" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Scoring: Anomaly score = 0.72 (HIGH risk)" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Alert Generated: Real-time alert pushed to dashboard" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Dashboard Updates: Alert appears in 'Incoming Alerts' panel, KPI cards update" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Auto-Case Created: Case CASE-2025-12-24-001 created, assigned to Investigator A" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Investigator Reviews: Opens case, views transaction details, sees suggested actions" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Action Suggested: 'Contact Customer', 'Review Entity Network', 'Freeze Account'" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Investigator Takes Action: Contacts customer, verifies transaction is legitimate" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Case Resolved: Marks as FALSE_POSITIVE, closes case, adds note" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Audit Logged: All actions logged for compliance" />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Layout>
  );
}

