'use client';

import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Login as LoginIcon,
  Dashboard as DashboardIcon,
  Receipt as TransactionIcon,
  Folder as CaseIcon,
  AccountTree as EntityIcon,
  Warning as AlertIcon,
  Search as InvestigationIcon,
  Share as NetworkIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { useRequireAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function UserGuidePage() {
  useRequireAuth();
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | false>('getting-started');

  const handleChange = (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSection(isExpanded ? section : false);
  };

  const quickLinks = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Transactions', icon: <TransactionIcon />, path: '/transactions' },
    { text: 'Cases', icon: <CaseIcon />, path: '/cases' },
    { text: 'Entities', icon: <EntityIcon />, path: '/entities' },
    { text: 'Real-Time Alert Triage', icon: <AlertIcon />, path: '/use-cases/real-time-alert-triage' },
    { text: 'Complex Case Investigation', icon: <InvestigationIcon />, path: '/use-cases/complex-case-investigation' },
    { text: 'Network Analysis', icon: <NetworkIcon />, path: '/use-cases/network-entity-analysis' },
  ];

  const roles = [
    {
      role: 'INVESTIGATOR',
      description: 'Full case management, transaction flagging, status changes, entity blocking',
      color: 'error' as const,
    },
    {
      role: 'ANALYST',
      description: 'View transactions and scores, comment on cases, view entity networks',
      color: 'warning' as const,
    },
    {
      role: 'ADMIN',
      description: 'All permissions including user management and system configuration',
      color: 'primary' as const,
    },
    {
      role: 'READ_ONLY',
      description: 'View-only access for audit and compliance review',
      color: 'default' as const,
    },
  ];

  return (
    <Layout
      breadcrumbs={[
        { label: 'Documentation', href: '/docs' },
        { label: 'User Guide' },
      ]}
    >
      <Container maxWidth="lg">
        <Box mb={4}>
          <Typography variant="h3" component="h1" gutterBottom>
            User Guide
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Comprehensive guide to using the Fraud Detection Forensic Systems platform. Learn how
            to navigate the interface, perform investigations, and leverage the platform's features
            for effective fraud detection and case management.
          </Typography>
        </Box>

        {/* Quick Links */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Navigation
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {quickLinks.map((link) => (
              <ListItem key={link.text} disablePadding>
                <ListItemButton onClick={() => router.push(link.path)}>
                  <ListItemIcon>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Getting Started */}
        <Accordion expanded={expandedSection === 'getting-started'} onChange={handleChange('getting-started')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Getting Started</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Login and Authentication
              </Typography>
              <Typography variant="body2" paragraph>
                Access the platform using your assigned credentials. The system uses JWT-based
                authentication with role-based access control.
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Default credentials are provided for demonstration. Change these in production!
              </Alert>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LoginIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Navigate to Login"
                    secondary="Enter your username and password to access the platform"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Dashboard Overview"
                    secondary="After login, you'll see the dashboard with KPIs and recent alerts"
                  />
                </ListItem>
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* User Roles */}
        <Accordion expanded={expandedSection === 'roles'} onChange={handleChange('roles')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">User Roles and Permissions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="body2" paragraph>
                The platform supports four role types, each with specific permissions:
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Role</TableCell>
                      <TableCell>Permissions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.role}>
                        <TableCell>
                          <Chip label={role.role} color={role.color} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{role.description}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Dashboard */}
        <Accordion expanded={expandedSection === 'dashboard'} onChange={handleChange('dashboard')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Dashboard</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Overview
              </Typography>
              <Typography variant="body2" paragraph>
                The dashboard provides a high-level view of system activity and key metrics:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="KPI Cards"
                    secondary="Transactions today, flagged transactions, open cases, and potential loss prevented"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Transaction Volume Chart"
                    secondary="Time-series visualization of transactions by risk level"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Risk Distribution"
                    secondary="Pie chart showing distribution of risk levels"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Recent High-Risk Transactions"
                    secondary="Table of most recent HIGH and CRITICAL risk transactions requiring attention"
                  />
                </ListItem>
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Transactions */}
        <Accordion expanded={expandedSection === 'transactions'} onChange={handleChange('transactions')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Transaction Management</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Transaction Explorer
              </Typography>
              <Typography variant="body2" paragraph>
                View and filter transactions, examine scoring details, and flag suspicious activity:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Filtering"
                    secondary="Filter by risk level, customer ID, merchant, date range, and flagged status"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Transaction Details"
                    secondary="View full transaction metadata, scoring details, feature contributions, and related cases"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Flagging Transactions"
                    secondary="Flag suspicious transactions to automatically create investigation cases (INVESTIGATOR/ADMIN only)"
                  />
                </ListItem>
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Cases */}
        <Accordion expanded={expandedSection === 'cases'} onChange={handleChange('cases')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Case Management</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Investigation Workflows
              </Typography>
              <Typography variant="body2" paragraph>
                Manage fraud investigation cases from creation to resolution:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Case Creation"
                    secondary="Cases can be auto-created from high-risk transactions or manually created by investigators"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Case Timeline"
                    secondary="View and add events, notes, and status changes. All actions are logged in the audit trail"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Related Items"
                    secondary="View related transactions and entities linked to the case"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status Management"
                    secondary="Update case status: OPEN → TRIAGE → INVESTIGATION → REMEDIATION → CLOSED"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Case Reports"
                    secondary="Generate comprehensive case reports for regulatory and litigation purposes"
                  />
                </ListItem>
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Entities */}
        <Accordion expanded={expandedSection === 'entities'} onChange={handleChange('entities')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Entity Analysis</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Entity 360° View
              </Typography>
              <Typography variant="body2" paragraph>
                Analyze entities (customers, merchants, devices, IPs) and their relationships:
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Entity Profile"
                    secondary="View entity details, risk scores, transaction history, and case involvement"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Network Graph"
                    secondary="Visualize entity relationships to identify fraud rings and suspicious connections"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Entity Blocking"
                    secondary="Block high-risk entities to prevent further fraudulent activity (INVESTIGATOR/ADMIN only)"
                  />
                </ListItem>
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Use Cases */}
        <Accordion expanded={expandedSection === 'use-cases'} onChange={handleChange('use-cases')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Use Case Demonstrations</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="body2" paragraph>
                Interactive demonstrations of key workflows:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AlertIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Real-Time Alert Triage"
                    secondary="Learn how to triage incoming fraud alerts from detection to case creation"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <InvestigationIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Complex Case Investigation"
                    secondary="Work through multi-transaction, multi-entity fraud cases end-to-end"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NetworkIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Network & Entity Analysis"
                    secondary="Use network graphs to uncover fraud rings and assess entity risk"
                  />
                </ListItem>
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Security & Compliance */}
        <Accordion expanded={expandedSection === 'security'} onChange={handleChange('security')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Security & Compliance</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Audit Trails
              </Typography>
              <Typography variant="body2" paragraph>
                All sensitive actions are logged in an immutable audit trail:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Action Logging"
                    secondary="Every case status change, transaction flag, and entity block is logged with actor, timestamp, and before/after states"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Compliance Features"
                    secondary="Built-in velocity checks, geographic inconsistency detection, and merchant category restrictions"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Role-Based Access"
                    secondary="Granular permissions ensure users only access features appropriate for their role"
                  />
                </ListItem>
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Best Practices */}
        <Accordion expanded={expandedSection === 'best-practices'} onChange={handleChange('best-practices')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Best Practices</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Investigation Workflow
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Triage Quickly"
                    secondary="Review alerts within SLA (e.g., 4 hours for HIGH, 1 hour for CRITICAL)"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Document Early"
                    secondary="Start documenting findings from the first review"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Link Related Items"
                    secondary="Connect transactions and entities early in the investigation"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Use Network View"
                    secondary="Visualize relationships to identify patterns and fraud rings"
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Follow Up"
                    secondary="Track actions and outcomes, ensure proper case closure"
                  />
                </ListItem>
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Troubleshooting */}
        <Accordion expanded={expandedSection === 'troubleshooting'} onChange={handleChange('troubleshooting')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Troubleshooting</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Common Issues
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Cannot Flag Transaction"
                    secondary="Ensure you have INVESTIGATOR or ADMIN role. Check that the transaction isn't already flagged."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Cannot Change Case Status"
                    secondary="Only INVESTIGATOR and ADMIN roles can update case status. Check your role permissions."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Entity Network Not Loading"
                    secondary="Verify entity links exist in the database. Check entity ID is correct."
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Transaction Not Scoring"
                    secondary="Check transaction data completeness. Verify feature engineering pipeline is working."
                  />
                </ListItem>
              </List>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Support */}
        <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.light' }}>
          <Typography variant="h6" gutterBottom>
            Need Help?
          </Typography>
          <Typography variant="body2" paragraph>
            For technical issues, contact your system administrator. For investigation questions,
            consult your team lead. For compliance questions, contact your compliance officer.
          </Typography>
          <Typography variant="body2">
            Refer to the{' '}
            <strong
              onClick={() => router.push('/docs/executive-summary')}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              Executive Summary
            </strong>{' '}
            for an overview of platform capabilities.
          </Typography>
        </Paper>
      </Container>
    </Layout>
  );
}

