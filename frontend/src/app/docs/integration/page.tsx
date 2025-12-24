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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import {
  Api as ApiIcon,
  CloudSync as CloudSyncIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
  AccountBalance as BankingIcon,
  Payment as PaymentIcon,
  Hub as HubIcon,
  Webhook as WebhookIcon,
  Storage as DatabaseIcon,
  Router as RouterIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';

export default function IntegrationPage() {

  const integrationPatterns = [
    {
      title: 'Real-Time API Integration',
      icon: <ApiIcon />,
      description: 'RESTful and GraphQL APIs for synchronous transaction scoring and alerting',
      protocols: ['REST API', 'GraphQL', 'gRPC'],
      useCases: [
        'Payment gateway integration',
        'Card network real-time scoring',
        'Mobile banking transaction checks',
        'E-commerce platform fraud screening',
      ],
    },
    {
      title: 'Message Queue Integration',
      icon: <CloudSyncIcon />,
      description: 'Asynchronous event-driven integration via message brokers',
      protocols: ['Kafka', 'RabbitMQ', 'Amazon SQS', 'Azure Service Bus'],
      useCases: [
        'High-volume transaction processing',
        'Batch transaction scoring',
        'Event-driven alerting',
        'Microservices architecture',
      ],
    },
    {
      title: 'File-Based Integration',
      icon: <StorageIcon />,
      description: 'Batch processing via file transfers for legacy systems',
      protocols: ['SFTP', 'FTP', 'S3', 'Azure Blob Storage'],
      useCases: [
        'Legacy core banking systems',
        'Daily batch reconciliation',
        'Historical data analysis',
        'Regulatory reporting',
      ],
    },
    {
      title: 'Database Integration',
      icon: <DatabaseIcon />,
      description: 'Direct database access for real-time and batch operations',
      protocols: ['PostgreSQL', 'Oracle', 'SQL Server', 'DB2'],
      useCases: [
        'Core banking database access',
        'Real-time transaction queries',
        'Account balance checks',
        'Customer data synchronization',
      ],
    },
    {
      title: 'Webhook Integration',
      icon: <WebhookIcon />,
      description: 'Push-based notifications for real-time alerts and updates',
      protocols: ['HTTP Webhooks', 'Server-Sent Events (SSE)'],
      useCases: [
        'Real-time fraud alerts',
        'Case status updates',
        'Investigation notifications',
        'System health monitoring',
      ],
    },
    {
      title: 'API Gateway Integration',
      icon: <RouterIcon />,
      description: 'Centralized API management and routing',
      protocols: ['Kong', 'AWS API Gateway', 'Azure API Management', 'MuleSoft'],
      useCases: [
        'Multi-system orchestration',
        'API versioning and routing',
        'Rate limiting and throttling',
        'Centralized authentication',
      ],
    },
  ];

  const legacySystemApproaches = [
    {
      system: 'Mainframe Systems (IBM z/OS)',
      approach: 'File-based integration via FTP/SFTP with COBOL data formats',
      challenges: ['Legacy data formats', 'Batch processing only', 'Limited real-time capability'],
      solution: 'Deploy file adapter service that converts between legacy formats and modern APIs',
    },
    {
      system: 'AS/400 (IBM iSeries)',
      approach: 'Database integration via JDBC/ODBC or message queue',
      challenges: ['Proprietary database', 'Limited API support', 'Custom protocols'],
      solution: 'Use IBM MQ or database replication for real-time data access',
    },
    {
      system: 'Core Banking Systems (FIS, Temenos, etc.)',
      approach: 'Vendor-specific APIs or database integration',
      challenges: ['Vendor lock-in', 'API versioning', 'Custom data models'],
      solution: 'Implement adapter pattern with vendor-specific connectors',
    },
    {
      system: 'Payment Processors (Visa, Mastercard, etc.)',
      approach: 'Network-specific APIs and protocols (ISO 8583)',
      challenges: ['Complex protocols', 'High transaction volumes', 'Strict SLAs'],
      solution: 'Deploy specialized payment gateway adapters with protocol translation',
    },
  ];

  const integrationArchitecture = [
    {
      layer: 'Presentation Layer',
      components: ['Web UI', 'Mobile Apps', 'Admin Console'],
      integration: 'REST API, GraphQL',
    },
    {
      layer: 'API Gateway',
      components: ['Kong/AWS API Gateway', 'Authentication', 'Rate Limiting'],
      integration: 'Routes to backend services',
    },
    {
      layer: 'Application Layer',
      components: ['Fraud Detection Engine', 'Case Management', 'Analytics'],
      integration: 'Internal APIs, Message Queues',
    },
    {
      layer: 'Integration Layer',
      components: ['Adapters', 'Protocol Translators', 'Data Transformers'],
      integration: 'External APIs, Databases, Message Brokers',
    },
    {
      layer: 'Data Layer',
      components: ['PostgreSQL', 'Redis Cache', 'Data Warehouse'],
      integration: 'Database connections, ETL pipelines',
    },
  ];

  return (
    <Layout breadcrumbs={[{ label: 'Documentation' }, { label: 'System Integration' }]}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Integration with Banking & Payment Systems
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This document outlines how the Fraud Detection Forensic System integrates with existing
          and legacy banking and payment systems, supporting multiple integration patterns and
          protocols.
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            The platform is designed with a flexible, adapter-based architecture that supports
            multiple integration patterns, enabling seamless connectivity with modern APIs and
            legacy systems alike.
          </Typography>
        </Alert>

        {/* Integration Patterns */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Integration Patterns
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The system supports multiple integration patterns to accommodate various system
            architectures and requirements.
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {integrationPatterns.map((pattern, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      {pattern.icon}
                      <Typography variant="h6">{pattern.title}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {pattern.description}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Supported Protocols:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {pattern.protocols.map((protocol, i) => (
                        <Chip key={i} label={protocol} size="small" variant="outlined" />
                      ))}
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Use Cases:
                    </Typography>
                    <List dense>
                      {pattern.useCases.map((useCase, i) => (
                        <ListItem key={i} disablePadding>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckIcon fontSize="small" color="success" />
                          </ListItemIcon>
                          <ListItemText primary={useCase} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Legacy System Integration */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Legacy System Integration
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Specialized approaches for integrating with legacy banking systems that may not
            support modern APIs or real-time integration patterns.
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Legacy System Integration Approaches</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>System Type</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Integration Approach</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Challenges</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Solution</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {legacySystemApproaches.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.system}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.approach}</Typography>
                        </TableCell>
                        <TableCell>
                          <List dense>
                            {item.challenges.map((challenge, i) => (
                              <ListItem key={i} disablePadding>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <WarningIcon fontSize="small" color="warning" />
                                </ListItemIcon>
                                <ListItemText primary={challenge} />
                              </ListItem>
                            ))}
                          </List>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{item.solution}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Integration Architecture */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Integration Architecture
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The system follows a layered architecture with dedicated integration components at each
            layer.
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {integrationArchitecture.map((layer, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <HubIcon color="primary" />
                      <Typography variant="h6">{layer.layer}</Typography>
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Components:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {layer.components.map((component, i) => (
                        <Chip key={i} label={component} size="small" />
                      ))}
                    </Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Integration Methods:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {layer.integration}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* API Endpoints */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Core Integration APIs
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Key API endpoints for integrating transaction data and receiving fraud alerts.
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Transaction Scoring API
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Real-time transaction scoring endpoint for payment processing systems.
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Endpoint:
                  </Typography>
                  <Chip label="POST /api/transactions/score" color="primary" />
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Request Format:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                    >
                      {JSON.stringify(
                        {
                          amount: 1000.0,
                          merchant_id: 'MERCHANT123',
                          card_number: '****1234',
                          timestamp: '2025-12-24T10:00:00Z',
                        },
                        null,
                        2
                      )}
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Webhook Configuration
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Configure webhooks to receive real-time fraud alerts and case updates.
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Webhook Events:
                  </Typography>
                  <List dense>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary="transaction.scored" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary="alert.created" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary="case.updated" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon fontSize="small" color="success" />
                      </ListItemIcon>
                      <ListItemText primary="case.resolved" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Security & Compliance */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Security & Compliance
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <SecurityIcon color="primary" />
                    <Typography variant="h6">Authentication</Typography>
                  </Box>
                  <List dense>
                    <ListItem disablePadding>
                      <ListItemText primary="OAuth 2.0 / JWT Bearer tokens" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemText primary="API key authentication" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemText primary="Mutual TLS (mTLS) for sensitive integrations" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemText primary="IP whitelisting support" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <SecurityIcon color="primary" />
                    <Typography variant="h6">Data Protection</Typography>
                  </Box>
                  <List dense>
                    <ListItem disablePadding>
                      <ListItemText primary="End-to-end encryption (TLS 1.3)" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemText primary="PCI DSS compliant data handling" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemText primary="PII masking and tokenization" />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemText primary="Audit logging for all API calls" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Implementation Guide */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Implementation Guide
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Step 1: System Assessment</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Assess your existing systems to determine the best integration approach:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Identify transaction sources and volumes" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Evaluate system capabilities (APIs, databases, message queues)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Assess network connectivity and security requirements" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Determine real-time vs. batch processing needs" />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Step 2: Integration Design</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Design the integration architecture:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Select appropriate integration pattern (API, message queue, file-based)" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Design data transformation and mapping" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Plan error handling and retry logic" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Define monitoring and alerting requirements" />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Step 3: Development & Testing</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Develop and test the integration:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Implement adapters and protocol translators" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Develop data transformation logic" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Create comprehensive test cases" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Perform load testing and performance validation" />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Step 4: Deployment & Monitoring</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" paragraph>
                Deploy and monitor the integration:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Deploy integration components in staging environment" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Conduct end-to-end integration testing" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Gradual rollout with monitoring" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Establish ongoing monitoring and alerting" />
                </ListItem>
              </List>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Support & Resources */}
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Support & Resources
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    API Documentation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Complete API reference with examples and code samples available at{' '}
                    <strong>/api/docs</strong>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    SDK & Libraries
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pre-built SDKs available for Python, Java, Node.js, and .NET to simplify
                    integration development.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Professional Services
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Our integration team can assist with custom adapter development, legacy system
                    integration, and implementation support.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
}

