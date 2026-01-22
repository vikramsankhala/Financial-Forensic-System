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
} from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Group as GroupIcon,
  CheckCircle as CheckIcon,
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

