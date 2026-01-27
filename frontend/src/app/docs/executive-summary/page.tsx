'use client';

import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
  Timeline as TimelineIcon,
  Hub as HubIcon,
  Visibility as VisibilityIcon,
  PlayCircle as PlayCircleIcon,
  Insights as InsightsIcon,
  Public as PublicIcon,
  Business as BusinessIcon,
  Gavel as GavelIcon,
  CompareArrows as CompareIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';

export default function ExecutiveSummaryPage() {

  const features = [
    {
      icon: <SpeedIcon />,
      title: 'Real-Time Fraud Detection',
      description:
        'Sub-100ms transaction scoring with PyTorch autoencoder. Hybrid ML engine combining unsupervised anomaly detection with supervised classification.',
    },
    {
      icon: <AnalyticsIcon />,
      title: 'Forensic Investigation Workbench',
      description:
        'Complete case management with full audit trails, entity relationship network visualization, timeline reconstruction, and evidence tracking.',
    },
    {
      icon: <SecurityIcon />,
      title: 'Role-Based Access Control',
      description:
        'Granular permissions for Investigators, Analysts, Admins, and Read-Only users. Full audit logging for compliance and regulatory requirements.',
    },
    {
      icon: <AssessmentIcon />,
      title: 'Compliance & Governance',
      description:
        'Built-in compliance checks, velocity monitoring, geographic inconsistency detection, and hooks for AML and sanctions screening.',
    },
  ];

  const techStack = [
    { category: 'Backend', items: ['FastAPI (Python 3.11+)', 'PostgreSQL', 'PyTorch', 'XGBoost'] },
    { category: 'Frontend', items: ['Next.js 14', 'React', 'TypeScript', 'Material UI'] },
    { category: 'Deployment', items: ['Docker', 'Fly.io'] },
    { category: 'ML/AI', items: ['Autoencoder Anomaly Detection', 'Feature Engineering Pipeline'] },
  ];

  const useCases = [
    'Real-time transaction monitoring and alerting',
    'Fraud investigation workflows and case management',
    'Regulatory compliance reporting and audit trails',
    'Entity risk assessment and network analysis',
    'Fraud ring detection through relationship mapping',
  ];

  const benefits = [
    'Production-ready architecture designed for enterprise scale',
    'Sub-100ms inference latency for real-time decision making',
    'Comprehensive audit trails for regulatory compliance',
    'Intuitive UI designed for forensic investigation teams',
    'Extensible architecture for custom integrations',
  ];

  const appIllustrations = [
    {
      icon: <TimelineIcon />,
      title: 'Real-time Monitoring',
      description: 'Streaming risk signals with sub-second alerting and prioritization.',
    },
    {
      icon: <HubIcon />,
      title: 'Entity Network Graphs',
      description: 'Relationship mapping across accounts, devices, and merchants.',
    },
    {
      icon: <VisibilityIcon />,
      title: 'Investigation Workbench',
      description: 'Case timelines, evidence trails, and analyst actions in one view.',
    },
  ];

  const appUseCases = [
    'Card-not-present velocity spikes and merchant abuse',
    'Account takeover signals and device anomalies',
    'RTP/ACH fraud monitoring and rapid response',
    'Fraud ring detection via entity relationship mapping',
  ];

  const demoIllustrations = [
    {
      icon: <PlayCircleIcon />,
      title: 'Live Demo Stream',
      description: 'Synthetic scenarios plus public exchange feeds with derived scores.',
    },
    {
      icon: <InsightsIcon />,
      title: 'Risk Scoring Overlay',
      description: 'Explainable risk levels and indicators for walkthroughs.',
    },
    {
      icon: <PublicIcon />,
      title: 'Public Data Feeds',
      description: 'Optional live price feeds from Binance and Kraken.',
    },
  ];

  const demoUseCases = [
    'Investor and customer walkthroughs without production data',
    'Pilot onboarding to validate workflows and integrations',
    'Training analysts on alert triage and case handling',
  ];

  const targetEntities = [
    { icon: <BusinessIcon />, title: 'Banks & Credit Unions', description: 'Retail, commercial, and regional institutions' },
    { icon: <AssessmentIcon />, title: 'Payment Processors', description: 'Card networks, PSPs, and acquirers' },
    { icon: <SecurityIcon />, title: 'Fintech & Wallets', description: 'Neobanks, wallets, and lending platforms' },
    { icon: <GavelIcon />, title: 'Compliance & Risk Teams', description: 'AML, fraud ops, and investigations' },
  ];

  const competitors = [
    'Rules-only fraud engines and legacy AML suites',
    'Standalone case management and investigation tools',
    'SIEM-style monitoring without financial context',
    'Data-warehouse + BI stacks with manual workflows',
  ];

  const differentiation = [
    'Unified real-time scoring, alerting, and case management',
    'Entity network analysis embedded into analyst workflow',
    'Hybrid ML + rules with explainable risk signals',
    'Deployment flexibility: API-first, modular components',
  ];

  return (
    <Layout
      breadcrumbs={[
        { label: 'Documentation', href: '/docs' },
        { label: 'Executive Summary' },
      ]}
    >
      <Container maxWidth="lg">
        <Box mb={4}>
          <Typography variant="h3" component="h1" gutterBottom>
            Executive Summary
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Production-Grade Real-Time Financial Fraud Detection & Forensics Platform
          </Typography>
          <Typography variant="body1" paragraph sx={{ mt: 2 }}>
            A comprehensive fraud detection and investigation system designed for financial crime
            analysis teams. This platform combines machine learning-based anomaly detection with
            rule-based compliance checks and full forensic case management workflows, enabling
            organizations to detect, investigate, and prevent financial fraud in real-time.
          </Typography>
        </Box>

        {/* What the Application Does */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            What the Application Does
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body2" color="text.secondary" paragraph>
            A real-time fraud detection and forensic investigation platform that turns streaming
            transactions into prioritized alerts and actionable cases, with built-in evidence
            trails and entity relationships.
          </Typography>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            {appIllustrations.map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box sx={{ color: 'primary.main', mr: 2 }}>{item.icon}</Box>
                      <Typography variant="h6">{item.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography variant="subtitle2" gutterBottom>
            Use Cases
          </Typography>
          <List>
            {appUseCases.map((useCase, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={useCase} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* What the Demo Version Does */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            What the Demo Version Does
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body2" color="text.secondary" paragraph>
            The demo experience showcases the full UI and workflow using synthetic data scenarios
            and optional public exchange feeds. It is designed for safe walkthroughs without
            production data exposure.
          </Typography>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            {demoIllustrations.map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box sx={{ color: 'primary.main', mr: 2 }}>{item.icon}</Box>
                      <Typography variant="h6">{item.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography variant="subtitle2" gutterBottom>
            Use Cases
          </Typography>
          <List>
            {demoUseCases.map((useCase, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={useCase} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Target Entities, Market Size, Competitors */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Target Entities, Market Size, and Competition
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="subtitle2" gutterBottom>
            Target Entities
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {targetEntities.map((entity, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ color: 'primary.main', mb: 1 }}>{entity.icon}</Box>
                    <Typography variant="h6">{entity.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {entity.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography variant="subtitle2" gutterBottom>
            Market Size (replace with sourced estimates)
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
            <Chip label="TAM: $XXB global fraud/AML software spend" color="primary" variant="outlined" />
            <Chip label="SAM: $XB mid-market financial institutions" variant="outlined" />
            <Chip label="SOM: $XB initial reachable segment" variant="outlined" />
          </Stack>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Competitive Set
              </Typography>
              <List>
                {competitors.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CompareIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Product Differentiation
              </Typography>
              <List>
                {differentiation.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Paper>

        {/* Key Features */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Key Features
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Box sx={{ color: 'primary.main', mr: 2 }}>{feature.icon}</Box>
                      <Typography variant="h6">{feature.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Technology Stack */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Technology Stack
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {techStack.map((stack, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {stack.category}
                    </Typography>
                    <List dense>
                      {stack.items.map((item, itemIndex) => (
                        <ListItem key={itemIndex} disablePadding>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Use Cases */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Target Use Cases
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body2" color="text.secondary" paragraph>
            Perfect for financial institutions, forensic audit teams, and compliance departments
            requiring:
          </Typography>
          <List>
            {useCases.map((useCase, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <CheckIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={useCase} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Key Benefits */}
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Key Benefits
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box display="flex" alignItems="flex-start">
                  <CheckIcon color="success" sx={{ mr: 2, mt: 0.5 }} />
                  <Typography variant="body1">{benefit}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Target Audience */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Target Audience
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Financial Institutions</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Banks, credit unions, and payment processors
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Forensic Audit Teams</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Deloitte-style forensic investigation teams
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <SecurityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Compliance Departments</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Regulatory compliance and risk management
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">Fraud Analysts</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Financial crime investigation specialists
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* Call to Action */}
        <Box mt={4} textAlign="center">
          <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <Typography variant="h6" gutterBottom>
              Ready to Get Started?
            </Typography>
            <Typography variant="body2">
              Explore the User Guide for detailed instructions, or dive into the Use Cases to see
              the platform in action.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
}

