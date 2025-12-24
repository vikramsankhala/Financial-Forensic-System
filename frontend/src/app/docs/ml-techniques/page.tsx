'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Psychology as MLIcon,
  AutoAwesome as AIIcon,
  Functions as StatsIcon,
  Build as FeatureIcon,
  Security as SecurityIcon,
  TrendingUp as MonitoringIcon,
  Assessment as ScoringIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { useRequireAuth } from '@/contexts/AuthContext';

export default function MLTechniquesPage() {
  useRequireAuth();
  const [expandedSection, setExpandedSection] = useState<string | false>('autoencoder');

  const handleChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : false);
  };

  const techniques = [
    {
      id: 'autoencoder',
      title: 'Autoencoder (Unsupervised Anomaly Detection)',
      icon: <MLIcon />,
      color: 'primary' as const,
    },
    {
      id: 'statistical',
      title: 'Statistical Methods',
      icon: <StatsIcon />,
      color: 'secondary' as const,
    },
    {
      id: 'features',
      title: 'Feature Engineering',
      icon: <FeatureIcon />,
      color: 'success' as const,
    },
    {
      id: 'xgboost',
      title: 'Supervised Classifier (XGBoost)',
      icon: <AIIcon />,
      color: 'info' as const,
    },
    {
      id: 'rules',
      title: 'Rule-Based Compliance Checks',
      icon: <SecurityIcon />,
      color: 'warning' as const,
    },
    {
      id: 'explainability',
      title: 'Explainability & Feature Attribution',
      icon: <CodeIcon />,
      color: 'primary' as const,
    },
    {
      id: 'monitoring',
      title: 'Model Monitoring & Drift Detection',
      icon: <MonitoringIcon />,
      color: 'error' as const,
    },
    {
      id: 'scoring',
      title: 'Risk Scoring & Classification',
      icon: <ScoringIcon />,
      color: 'success' as const,
    },
  ];

  return (
    <Layout
      breadcrumbs={[
        { label: 'Documentation', href: '/docs' },
        { label: 'ML/AI Techniques' },
      ]}
    >
      <Container maxWidth="lg">
        <Box mb={4}>
          <Typography variant="h3" component="h1" gutterBottom>
            ML/AI Techniques
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Comprehensive overview of the machine learning and artificial intelligence techniques
            used in the fraud detection system. This hybrid approach combines unsupervised
            learning, statistical methods, supervised classification, and rule-based systems
            for robust fraud detection.
          </Typography>
        </Box>

        {/* Architecture Flow Diagram */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
          <Typography variant="h5" gutterBottom>
            Architecture Flow
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              alignItems: 'center',
              py: 2,
            }}
          >
            {[
              'Transaction',
              'Feature Engineering (18 features)',
              'StandardScaler (Z-score normalization)',
              'Autoencoder (Encode → Decode)',
              'MSE Reconstruction Error',
              'Percentile Threshold (95th)',
              'Risk Classification (CRITICAL/HIGH/MEDIUM/LOW)',
              'Optional XGBoost (if anomaly detected)',
              'Feature Attribution (Explainability)',
              'Decision (Approve/Monitor/Review)',
            ].map((step, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box
                  sx={{
                    flex: 1,
                    textAlign: 'center',
                    p: 1.5,
                    bgcolor: index === 0 || index === 9 ? 'primary.light' : 'grey.100',
                    borderRadius: 1,
                    fontWeight: index === 0 || index === 9 ? 'bold' : 'normal',
                  }}
                >
                  {step}
                </Box>
                {index < 9 && (
                  <Box sx={{ mx: 1, color: 'text.secondary' }}>↓</Box>
                )}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Techniques Accordion */}
        {techniques.map((technique) => (
          <Accordion
            key={technique.id}
            expanded={expandedSection === technique.id}
            onChange={handleChange(technique.id)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                <Chip icon={technique.icon} label={technique.title} color={technique.color} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {technique.id === 'autoencoder' && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Implementation:</strong> PyTorch-based neural autoencoder
                  </Alert>
                  <Typography variant="h6" gutterBottom>
                    Architecture
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Encoder
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Type"
                                secondary="Multi-layer feedforward network with ReLU activations"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Input" secondary="18-dimensional feature vector" />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Hidden Layers"
                                secondary="Configurable (default: [18, 12])"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Latent Space" secondary="6 dimensions (input_dim // 3)" />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Dropout" secondary="0.1 for regularization" />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Decoder
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Type"
                                secondary="Symmetric decoder reconstructing original features"
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Output" secondary="18-dimensional feature vector" />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Loss Function" secondary="Mean Squared Error (MSE)" />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  <Typography variant="h6" gutterBottom>
                    How It Works
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                    <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`1. Encode: Feature vector → Latent representation (6D)
2. Decode: Latent representation → Reconstructed feature vector (18D)
3. Compute: MSE(original, reconstructed) = Anomaly Score`}
                    </Typography>
                  </Paper>
                  <Alert severity="success">
                    <strong>Why Autoencoders:</strong> Learn normal patterns; anomalies have high reconstruction
                    error.
                  </Alert>
                </Box>
              )}

              {technique.id === 'statistical' && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            A. Percentile-Based Thresholding
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Method:</strong> 95th percentile of historical reconstruction errors
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Implementation:</strong> <code>np.percentile(scores, 95.0)</code>
                          </Typography>
                          <Typography variant="body2">
                            <strong>Purpose:</strong> Dynamic threshold adaptation
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            B. Z-Score Normalization
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Method:</strong> StandardScaler (mean=0, std=1)
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Formula:</strong> <code>(x - μ) / σ</code>
                          </Typography>
                          <Typography variant="body2">
                            <strong>Usage:</strong> Feature normalization before ML inference
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            C. Log Transformation
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Method:</strong> <code>np.log1p(amount)</code> for amount features
                          </Typography>
                          <Typography variant="body2">
                            <strong>Purpose:</strong> Handle skewed distributions
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            D. Cyclic Encoding (Temporal Features)
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Method:</strong> Sinusoidal encoding for periodic features
                          </Typography>
                          <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                            <strong>Formulas:</strong>
                            <Box component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mt: 1 }}>
{`Hour: sin(2π * hour / 24), cos(2π * hour / 24)
Day of week: sin(2π * dow / 7), cos(2π * dow / 7)
Day of month: sin(2π * dom / 31), cos(2π * dom / 31)`}
                            </Box>
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Purpose:</strong> Capture cyclical patterns
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {technique.id === 'features' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    18+ Engineered Features
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      {
                        title: 'Amount Features',
                        items: [
                          'Raw amount',
                          'Log-transformed amount (log1p)',
                          'Z-score normalized amount (deviation from customer average)',
                        ],
                      },
                      {
                        title: 'Temporal Features',
                        items: [
                          'Hour of day (cyclic encoding)',
                          'Day of week (cyclic encoding)',
                          'Day of month (cyclic encoding)',
                          'Recency: Time since last transaction (log1p(hours))',
                          'Transaction velocity: Count in 24h and 7d windows',
                        ],
                      },
                      {
                        title: 'Geographic Features',
                        items: [
                          'Country encoding (hash-based)',
                          'IP address encoding (hash-based)',
                          'Geographic consistency checks',
                        ],
                      },
                      {
                        title: 'Device & Channel Features',
                        items: [
                          'Device fingerprint hash',
                          'Channel type encoding (online, POS, ATM, mobile)',
                          'Device novelty detection',
                        ],
                      },
                      {
                        title: 'Behavioral Features',
                        items: [
                          'Merchant category encoding',
                          'Customer transaction patterns',
                          'Historical deviation metrics',
                        ],
                      },
                      {
                        title: 'Network Features',
                        items: [
                          'Entity relationship strength',
                          'Shared device/IP patterns',
                          'Account linkage indicators',
                        ],
                      },
                    ].map((category, idx) => (
                      <Grid item xs={12} md={6} key={idx}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              {category.title}
                            </Typography>
                            <List dense>
                              {category.items.map((item, itemIdx) => (
                                <ListItem key={itemIdx}>
                                  <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                                </ListItem>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {technique.id === 'xgboost' && (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>Implementation:</strong> XGBoost (available but optional)
                  </Alert>
                  <Typography variant="h6" gutterBottom>
                    Usage
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Purpose"
                        secondary="Second-stage classifier for flagged anomalies"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Input" secondary="Scaled feature vector (18D)" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Output" secondary="Fraud probability score" />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Method"
                        secondary="classifier.predict_proba()[0][1]"
                      />
                    </ListItem>
                  </List>
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <strong>Hybrid Approach:</strong> Combines unsupervised (autoencoder) + supervised (XGBoost)
                    scores
                  </Alert>
                </Box>
              )}

              {technique.id === 'rules' && (
                <Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            A. Velocity Checking
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Method:</strong> Transaction count thresholds
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Rules:</strong>
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText primary="Max 50 transactions in 24h" />
                            </ListItem>
                            <ListItem>
                              <ListItemText primary="Max 10 transactions in 1h" />
                            </ListItem>
                          </List>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Implementation:</strong> <code>ComplianceAgent.check_velocity()</code>
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            B. Geographic Consistency
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Method:</strong> Impossible travel detection
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Rule:</strong> Flag if transactions in different countries &lt; 2 hours apart
                          </Typography>
                          <Typography variant="body2">
                            <strong>Implementation:</strong>{' '}
                            <code>ComplianceAgent.check_geographic_consistency()</code>
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            C. Merchant Restrictions
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Method:</strong> Category-based filtering
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>Restricted categories:</strong> gambling, adult, crypto
                          </Typography>
                          <Typography variant="body2">
                            <strong>Implementation:</strong>{' '}
                            <code>ComplianceAgent.check_merchant_restrictions()</code>
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {technique.id === 'explainability' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Feature Contribution Analysis
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                    <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`# From features.py
feature_contributions = (abs_features / abs_features.sum()) * reconstruction_error`}
                    </Typography>
                  </Paper>
                  <Alert severity="info">
                    <strong>Purpose:</strong> Identify which features drive the anomaly score for
                    interpretability
                  </Alert>
                </Box>
              )}

              {technique.id === 'monitoring' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Statistical Drift Monitoring
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Implementation:</strong> <code>MonitoringAgent.compute_drift_metrics()</code>
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Metrics
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Recent mean score vs. older mean score"
                        secondary="Compares recent 1000 scores vs. older 4000 scores"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Drift ratio"
                        secondary="recent_mean / older_mean"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Drift threshold"
                        secondary="20% change triggers alert"
                      />
                    </ListItem>
                  </List>
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <strong>Purpose:</strong> Detect concept drift in transaction patterns
                  </Alert>
                </Box>
              )}

              {technique.id === 'scoring' && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Multi-Tier Risk Classification
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <strong>Risk Level</strong>
                          </TableCell>
                          <TableCell>
                            <strong>Score Threshold</strong>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Chip label="CRITICAL" color="error" size="small" />
                          </TableCell>
                          <TableCell>Score &gt; 0.8 or &gt; 2.0 × threshold</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip label="HIGH" color="warning" size="small" />
                          </TableCell>
                          <TableCell>Score &gt; 0.6 or &gt; 1.5 × threshold</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip label="MEDIUM" color="info" size="small" />
                          </TableCell>
                          <TableCell>Score &gt; 0.4 or &gt; threshold</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Chip label="LOW" color="success" size="small" />
                          </TableCell>
                          <TableCell>Score ≤ threshold</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="h6" gutterBottom>
                    Decision Logic
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary={<Chip label="Approve" color="success" size="small" />}
                        secondary="LOW risk"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={<Chip label="Monitor" color="info" size="small" />}
                        secondary="MEDIUM risk"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary={<Chip label="Review" color="error" size="small" />}
                        secondary="HIGH/CRITICAL risk"
                      />
                    </ListItem>
                  </List>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Summary Table */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Summary of Techniques
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Technique</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Type</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Purpose</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Implementation</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  {
                    technique: 'Autoencoder',
                    type: 'Deep Learning (Unsupervised)',
                    purpose: 'Anomaly detection via reconstruction error',
                    implementation: 'PyTorch neural network',
                  },
                  {
                    technique: 'Percentile Thresholding',
                    type: 'Statistics',
                    purpose: 'Dynamic anomaly threshold',
                    implementation: '95th percentile',
                  },
                  {
                    technique: 'Z-score Normalization',
                    type: 'Statistics',
                    purpose: 'Feature standardization',
                    implementation: 'StandardScaler',
                  },
                  {
                    technique: 'Log Transformation',
                    type: 'Statistics',
                    purpose: 'Handle skewed distributions',
                    implementation: 'log1p()',
                  },
                  {
                    technique: 'Cyclic Encoding',
                    type: 'Feature Engineering',
                    purpose: 'Capture temporal patterns',
                    implementation: 'Sin/Cos transforms',
                  },
                  {
                    technique: 'XGBoost',
                    type: 'Supervised ML',
                    purpose: 'Optional fraud classification',
                    implementation: 'Gradient boosting',
                  },
                  {
                    technique: 'Velocity Rules',
                    type: 'Rule-based',
                    purpose: 'Transaction frequency limits',
                    implementation: 'Threshold-based',
                  },
                  {
                    technique: 'Geographic Rules',
                    type: 'Rule-based',
                    purpose: 'Impossible travel detection',
                    implementation: 'Time-distance checks',
                  },
                  {
                    technique: 'Feature Attribution',
                    type: 'Explainability',
                    purpose: 'Model interpretability',
                    implementation: 'Contribution analysis',
                  },
                  {
                    technique: 'Drift Detection',
                    type: 'Monitoring',
                    purpose: 'Concept drift detection',
                    implementation: 'Statistical comparison',
                  },
                ].map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <strong>{row.technique}</strong>
                    </TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.purpose}</TableCell>
                    <TableCell>
                      <code>{row.implementation}</code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* System Overview */}
        <Alert severity="success" sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            System Overview
          </Typography>
          <Typography variant="body2">
            The system uses a <strong>hybrid approach</strong>: unsupervised autoencoder for anomaly detection,
            statistical methods for normalization and thresholding, optional supervised learning for refinement,
            and rule-based checks for compliance. This multi-layered strategy ensures robust fraud detection
            with explainable results.
          </Typography>
        </Alert>
      </Container>
    </Layout>
  );
}

