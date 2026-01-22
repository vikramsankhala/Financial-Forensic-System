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
  ListItemIcon,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Storage as DatabaseIcon,
  CloudQueue as RedisIcon,
  AccountTree as Neo4jIcon,
  Api as APIIcon,
  Settings as ServiceIcon,
  Architecture as ArchitectureIcon,
  Speed as PerformanceIcon,
  Security as SecurityIcon,
  DataObject as DataIcon,
  Router as RouterIcon,
  Psychology as AgentIcon,
  Assessment as ScoringIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { useRequireAuth } from '@/contexts/AuthContext';

export default function BackendArchitecturePage() {
  useRequireAuth();
  const [expandedSection, setExpandedSection] = useState<string | false>('overview');

  const handleChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : false);
  };

  const sections = [
    {
      id: 'overview',
      title: 'System Overview',
      icon: <ArchitectureIcon />,
      color: 'primary' as const,
    },
    {
      id: 'databases',
      title: 'Databases',
      icon: <DatabaseIcon />,
      color: 'primary' as const,
    },
    {
      id: 'services',
      title: 'Backend Services',
      icon: <ServiceIcon />,
      color: 'secondary' as const,
    },
    {
      id: 'routers',
      title: 'API Routers',
      icon: <RouterIcon />,
      color: 'info' as const,
    },
    {
      id: 'agents',
      title: 'Forensic Agents',
      icon: <AgentIcon />,
      color: 'success' as const,
    },
    {
      id: 'scoring',
      title: 'Scoring Engine',
      icon: <ScoringIcon />,
      color: 'warning' as const,
    },
    {
      id: 'architecture',
      title: 'Architecture Flow',
      icon: <ArchitectureIcon />,
      color: 'error' as const,
    },
  ];

  return (
    <Layout
      breadcrumbs={[
        { label: 'Documentation', href: '/docs' },
        { label: 'Backend Architecture' },
      ]}
    >
      <Container maxWidth="lg">
        <Box mb={4}>
          <Typography variant="h3" component="h1" gutterBottom>
            Backend Architecture & Databases
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Comprehensive documentation of the backend architecture, databases, services, and APIs
            powering the Fraud Detection Forensic Systems platform. This page covers all database
            systems, backend services, API endpoints, and the overall system architecture.
          </Typography>
        </Box>

        {/* System Overview */}
        <Accordion expanded={expandedSection === 'overview'} onChange={handleChange('overview')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Chip icon={<ArchitectureIcon />} label="System Overview" color="primary" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="h6" gutterBottom>
                Technology Stack
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Backend Framework
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Framework" secondary="FastAPI (Python 3.11+)" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Port" secondary="8000" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="API Style" secondary="RESTful API with OpenAPI docs" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Authentication" secondary="JWT Bearer Tokens" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Core Libraries
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="ORM" secondary="SQLAlchemy 2.0" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Migrations" secondary="Alembic" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="ML Framework" secondary="PyTorch, XGBoost" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Validation" secondary="Pydantic v2" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                High-Level Architecture
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.875rem', overflow: 'auto' }}>
{`┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                         │
│                    Port: 3000                                  │
└────────────────────────┬──────────────────────────────────────┘
                         │ HTTPS/REST API
                         │
┌────────────────────────▼──────────────────────────────────────┐
│              Backend API (FastAPI)                             │
│              Port: 8000                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Routers  │  │  Agents  │  │  Scoring  │                  │
│  │          │  │          │  │  Engine  │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       │             │             │                           │
└───────┼─────────────┼─────────────┼───────────────────────────┘
        │             │             │
   ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐
   │         │  │         │  │         │
┌──▼────┐ ┌──▼───┐ ┌──▼────┐ ┌──▼────┐
│PostgreSQL│ │Redis│ │ Neo4j │ │Models │
│+Timescale│ │Cache│ │ Graph │ │PyTorch│
│   DB     │ │     │ │   DB  │ │XGBoost│
└─────────┘ └─────┘ └───────┘ └───────┘`}
                </Typography>
              </Paper>

              <Alert severity="info" sx={{ mt: 2 }}>
                <strong>Key Design Principles:</strong> Modular architecture, graceful degradation
                (optional databases), caching for performance, and separation of concerns between
                scoring, compliance, and investigation workflows.
              </Alert>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Databases Section */}
        <Accordion expanded={expandedSection === 'databases'} onChange={handleChange('databases')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Chip icon={<DatabaseIcon />} label="Databases" color="primary" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="h6" gutterBottom>
                Database Systems
              </Typography>

              {/* PostgreSQL + TimescaleDB */}
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <DatabaseIcon color="primary" />
                    <Typography variant="h6">PostgreSQL + TimescaleDB</Typography>
                    <Chip label="Primary Database" color="primary" size="small" />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Purpose
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Primary relational database storing all transactional data, scores, cases,
                        entities, and audit logs. TimescaleDB extension provides time-series
                        optimization for efficient querying of time-based data.
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Key Features
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>✓</ListItemIcon>
                          <ListItemText primary="ACID compliance" secondary="Reliable transactions" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>✓</ListItemIcon>
                          <ListItemText primary="TimescaleDB hypertables" secondary="Time-series optimization" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>✓</ListItemIcon>
                          <ListItemText primary="Automatic compression" secondary="Data retention policies" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>✓</ListItemIcon>
                          <ListItemText primary="JSON support" secondary="Flexible metadata storage" />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Tables (11 Total)
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="transactions" secondary="Transaction records (hypertable)" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="scores" secondary="ML scoring results" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="cases" secondary="Investigation cases" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="case_events" secondary="Case activity log" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="entities" secondary="Customer, merchant, device entities" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="entity_links" secondary="Entity relationships" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="audit_log" secondary="System audit trail (hypertable)" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="users" secondary="User accounts and roles" />
                        </ListItem>
                      </List>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                        Connection
                      </Typography>
                      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        postgresql://postgres:***@localhost:5433/fraud_detection
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Redis */}
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <RedisIcon color="error" />
                    <Typography variant="h6">Redis</Typography>
                    <Chip label="Cache Layer" color="error" size="small" />
                    <Chip label="Optional" size="small" />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Purpose
                      </Typography>
                      <Typography variant="body2" paragraph>
                        In-memory caching layer for frequently accessed data, reducing database
                        load and improving response times. Used for dashboard metrics, entity data,
                        and case reports.
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Performance Impact
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>⚡</ListItemIcon>
                          <ListItemText primary="6-16x faster" secondary="Dashboard metrics queries" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>⚡</ListItemIcon>
                          <ListItemText primary="30-50% reduction" secondary="Database load" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>⚡</ListItemIcon>
                          <ListItemText primary="Sub-millisecond" secondary="Cache hit latency" />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Cached Data Types
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Dashboard metrics" secondary="TTL: 10 seconds" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Entity data" secondary="TTL: 1 hour (default)" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Case reports" secondary="TTL: 5 minutes" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Risk distribution" secondary="TTL: 30 seconds" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Time-series queries" secondary="TTL: 60 seconds" />
                        </ListItem>
                      </List>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                        Connection
                      </Typography>
                      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        redis://localhost:6379/0
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Neo4j */}
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Neo4jIcon color="success" />
                    <Typography variant="h6">Neo4j</Typography>
                    <Chip label="Graph Database" color="success" size="small" />
                    <Chip label="Optional" size="small" />
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Purpose
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Graph database for complex relationship analysis, fraud ring detection, and
                        network traversal queries. Optimized for finding connections between entities
                        that would be slow in relational databases.
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Use Cases
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>🔍</ListItemIcon>
                          <ListItemText primary="Fraud ring detection" secondary="Find connected suspicious entities" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>🔍</ListItemIcon>
                          <ListItemText primary="Entity network analysis" secondary="Multi-hop relationship queries" />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>🔍</ListItemIcon>
                          <ListItemText primary="Pattern detection" secondary="Identify suspicious clusters" />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Data Model
                      </Typography>
                      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', mb: 2 }}>
{`Nodes: Entity
  - entity_id (unique)
  - entity_type
  - name
  - metadata

Relationships: RELATES_TO
  - type (relationship_type)
  - metadata
  - created_at`}
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Connection
                      </Typography>
                      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        neo4j://localhost:7687
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Browser: http://localhost:7474
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>Database Strategy:</strong> PostgreSQL serves as the source of truth, Redis
                provides caching for performance, and Neo4j enables advanced graph analytics. All
                databases are optional except PostgreSQL, allowing graceful degradation.
              </Alert>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Backend Services */}
        <Accordion expanded={expandedSection === 'services'} onChange={handleChange('services')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Chip icon={<ServiceIcon />} label="Backend Services" color="secondary" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="h6" gutterBottom>
                Core Services
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Cache Service (Redis)
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Location:</strong> <code>backend/app/cache.py</code>
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Provides caching functionality with TTL support, pattern-based deletion,
                        and automatic JSON serialization.
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Key Functions:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="get_cache(key)" secondary="Retrieve cached value" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="set_cache(key, value, ttl)" secondary="Store with expiration" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="delete_cache_pattern(pattern)" secondary="Bulk deletion" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="@cached decorator" secondary="Function result caching" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Graph Service (Neo4j)
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Location:</strong> <code>backend/app/graph.py</code>
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Manages Neo4j graph database connections and provides graph query operations
                        for entity relationships.
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Key Methods:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="sync_entity()" secondary="Create/update entity node" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="sync_entity_link()" secondary="Create relationships" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="get_entity_network()" secondary="Multi-hop traversal" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="find_fraud_rings()" secondary="Pattern detection" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Entity Sync Service
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Location:</strong> <code>backend/app/services/entity_sync.py</code>
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Synchronizes entities and relationships from PostgreSQL to Neo4j for graph
                        analysis. Supports batch processing and incremental updates.
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Functions:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="sync_entity_to_graph()" secondary="Single entity sync" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="sync_all_entities_to_graph()" secondary="Full sync (batch)" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Database Service
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>Location:</strong> <code>backend/app/database.py</code>
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Manages SQLAlchemy database connections, session management, and connection
                        pooling. Provides dependency injection for FastAPI routes.
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Key Components:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="engine" secondary="SQLAlchemy engine" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="SessionLocal" secondary="Database session factory" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="get_db()" secondary="FastAPI dependency" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* API Routers */}
        <Accordion expanded={expandedSection === 'routers'} onChange={handleChange('routers')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Chip icon={<RouterIcon />} label="API Routers" color="info" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="h6" gutterBottom>
                API Endpoints
              </Typography>

              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Router</strong></TableCell>
                      <TableCell><strong>Prefix</strong></TableCell>
                      <TableCell><strong>Key Endpoints</strong></TableCell>
                      <TableCell><strong>Features</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>transactions</strong></TableCell>
                      <TableCell><code>/api/transactions</code></TableCell>
                      <TableCell>
                        POST /score<br />
                        GET /{id}<br />
                        GET / (list)
                      </TableCell>
                      <TableCell>
                        Transaction scoring<br />
                        ML inference<br />
                        Risk classification
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>cases</strong></TableCell>
                      <TableCell><code>/api/cases</code></TableCell>
                      <TableCell>
                        POST /<br />
                        GET /{id}<br />
                        GET /{id}/report<br />
                        PUT /{id}/status
                      </TableCell>
                      <TableCell>
                        Case management<br />
                        Investigation workflows<br />
                        Event tracking
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>entities</strong></TableCell>
                      <TableCell><code>/api/entities</code></TableCell>
                      <TableCell>
                        GET /{id}<br />
                        GET /{id}/network<br />
                        GET /fraud-rings
                      </TableCell>
                      <TableCell>
                        Entity exploration<br />
                        Graph queries (Neo4j)<br />
                        Network analysis
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>auth</strong></TableCell>
                      <TableCell><code>/api/auth</code></TableCell>
                      <TableCell>
                        POST /login<br />
                        GET /me
                      </TableCell>
                      <TableCell>
                        JWT authentication<br />
                        User management
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>metrics</strong></TableCell>
                      <TableCell><code>/metrics</code></TableCell>
                      <TableCell>
                        GET /dashboard<br />
                        GET /risk-distribution<br />
                        GET /transactions-over-time
                      </TableCell>
                      <TableCell>
                        Dashboard KPIs<br />
                        Time-series data<br />
                        Redis caching
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="info">
                <strong>API Documentation:</strong> Interactive API docs available at{' '}
                <code>http://localhost:8000/docs</code> (Swagger UI) and{' '}
                <code>http://localhost:8000/redoc</code> (ReDoc).
              </Alert>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Forensic Agents */}
        <Accordion expanded={expandedSection === 'agents'} onChange={handleChange('agents')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Chip icon={<AgentIcon />} label="Forensic Agents" color="success" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="h6" gutterBottom>
                Agent System
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Location:</strong> <code>backend/app/agents.py</code>
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        AnomalyAgent
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Wraps the fraud scoring engine and handles transaction scoring workflow.
                        Integrates ML models with database operations.
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Methods:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="score_transaction()" secondary="Score and store results" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        ComplianceAgent
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Rule-based compliance checks including velocity limits, geographic consistency,
                        and merchant restrictions.
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Methods:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="check_velocity()" secondary="Transaction frequency limits" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="check_geographic_consistency()" secondary="Impossible travel detection" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="check_merchant_restrictions()" secondary="Category filtering" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="check_sanctions()" secondary="Sanctions/PEP screening" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        InvestigationAgent
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Manages case lifecycle, auto-creates cases from high-risk transactions, and
                        handles entity linking and status transitions.
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Methods:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="create_case_from_transaction()" secondary="Auto-case creation" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="update_case_status()" secondary="Status transitions" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="_link_entities_from_transaction()" secondary="Entity extraction" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        MonitoringAgent
                      </Typography>
                      <Typography variant="body2" paragraph>
                        Tracks model performance, detects concept drift, and monitors score
                        distributions for model health.
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Methods:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="record_score()" secondary="Score tracking" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="compute_drift_metrics()" secondary="Drift detection" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Scoring Engine */}
        <Accordion expanded={expandedSection === 'scoring'} onChange={handleChange('scoring')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Chip icon={<ScoringIcon />} label="Scoring Engine" color="warning" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="h6" gutterBottom>
                Fraud Scoring System
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>Location:</strong> <code>backend/app/scoring.py</code>,{' '}
                <code>backend/app/autoencoder.py</code>, <code>backend/app/features.py</code>
              </Typography>

              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`Transaction Data
    ↓
Feature Engineering (18 features)
    ↓
StandardScaler (Z-score normalization)
    ↓
Autoencoder (Encode → Decode)
    ↓
MSE Reconstruction Error
    ↓
Percentile Threshold (95th)
    ↓
Risk Level Classification
    ↓
Decision (Approve/Monitor/Review)`}
                </Typography>
              </Paper>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        FeatureEngineer
                      </Typography>
                      <Typography variant="body2">
                        Extracts and normalizes 18 features from transaction data including amount,
                        temporal, geographic, device, and behavioral features.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Autoencoder
                      </Typography>
                      <Typography variant="body2">
                        PyTorch-based neural network for unsupervised anomaly detection. Encodes
                        features to latent space and reconstructs, measuring reconstruction error.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        FraudScoringEngine
                      </Typography>
                      <Typography variant="body2">
                        Orchestrates the scoring pipeline, applies thresholds, and classifies risk
                        levels (CRITICAL, HIGH, MEDIUM, LOW).
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Architecture Flow */}
        <Accordion expanded={expandedSection === 'architecture'} onChange={handleChange('architecture')} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Chip icon={<ArchitectureIcon />} label="Architecture Flow" color="error" />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="h6" gutterBottom>
                Request Flow
              </Typography>

              <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
{`1. Client Request → FastAPI Router
2. Authentication Middleware (JWT validation)
3. Route Handler (with dependencies)
4. Service Layer (Agents, Scoring, Cache)
   ├─ Check Redis Cache (if applicable)
   ├─ Query PostgreSQL (if cache miss)
   ├─ Execute ML Scoring (if needed)
   └─ Update Neo4j Graph (if enabled)
5. Response Serialization (Pydantic)
6. Return JSON Response`}
                </Typography>
              </Paper>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Data Flow
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Transaction Scoring Flow
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="1. Receive transaction" secondary="POST /api/transactions/score" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="2. Feature engineering" secondary="Extract 18 features" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="3. ML inference" secondary="Autoencoder scoring" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="4. Store results" secondary="PostgreSQL (transactions, scores)" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="5. Create case (if high risk)" secondary="InvestigationAgent" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="6. Sync entities" secondary="Neo4j (if enabled)" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Dashboard Metrics Flow
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="1. Request metrics" secondary="GET /api/metrics/dashboard" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="2. Check Redis cache" secondary="Cache key: dashboard_metrics" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="3. Query PostgreSQL" secondary="TimescaleDB time_bucket()" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="4. Aggregate results" secondary="Count, sum, group by" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="5. Cache response" secondary="TTL: 10 seconds" />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="6. Return JSON" secondary="Cached or fresh data" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Alert severity="success" sx={{ mt: 2 }}>
                <strong>Performance Optimizations:</strong> Redis caching reduces database load,
                TimescaleDB hypertables optimize time-series queries, and Neo4j enables fast graph
                traversals. All optional services degrade gracefully if unavailable.
              </Alert>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Summary */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Architecture Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Component</strong></TableCell>
                  <TableCell><strong>Technology</strong></TableCell>
                  <TableCell><strong>Purpose</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Backend Framework</TableCell>
                  <TableCell>FastAPI</TableCell>
                  <TableCell>REST API server</TableCell>
                  <TableCell><Chip label="Required" color="primary" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Primary Database</TableCell>
                  <TableCell>PostgreSQL + TimescaleDB</TableCell>
                  <TableCell>Data persistence</TableCell>
                  <TableCell><Chip label="Required" color="primary" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Cache Layer</TableCell>
                  <TableCell>Redis</TableCell>
                  <TableCell>Performance optimization</TableCell>
                  <TableCell><Chip label="Optional" color="info" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Graph Database</TableCell>
                  <TableCell>Neo4j</TableCell>
                  <TableCell>Relationship analysis</TableCell>
                  <TableCell><Chip label="Optional" color="info" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ML Framework</TableCell>
                  <TableCell>PyTorch, XGBoost</TableCell>
                  <TableCell>Fraud detection</TableCell>
                  <TableCell><Chip label="Required" color="primary" size="small" /></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>ORM</TableCell>
                  <TableCell>SQLAlchemy</TableCell>
                  <TableCell>Database abstraction</TableCell>
                  <TableCell><Chip label="Required" color="primary" size="small" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Layout>
  );
}

