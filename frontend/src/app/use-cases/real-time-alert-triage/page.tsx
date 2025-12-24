'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Flag as FlagIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { transactions, cases } from '@/lib/api-client';
import { RiskChip } from '@/components/RiskChip';
import { RiskLevel, Transaction, Case } from '@/types';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import { DemoNarrationPlayer } from '@/components/DemoNarrationPlayer';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RealTimeAlertTriagePage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch HIGH and MEDIUM risk transactions
  const { data: highRiskTransactions, isLoading: loadingHigh } = useQuery({
    queryKey: ['transactions', 'high-risk'],
    queryFn: () => transactions.list({ risk_level: RiskLevel.HIGH, limit: 20 }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: mediumRiskTransactions, isLoading: loadingMedium } = useQuery({
    queryKey: ['transactions', 'medium-risk'],
    queryFn: () => transactions.list({ risk_level: RiskLevel.MEDIUM, limit: 20 }),
    refetchInterval: 30000,
  });

  // Combine and filter unflagged
  const alertTransactions = [
    ...(highRiskTransactions || []),
    ...(mediumRiskTransactions || []),
  ]
    .filter((tx: any) => !(tx as any).flagged)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  // Fetch recent auto-created cases
  const { data: recentCases } = useQuery({
    queryKey: ['cases', 'auto-created'],
    queryFn: () => cases.list({ limit: 10 }),
    refetchInterval: 60000, // Refresh every minute
  });

  const flagMutation = useMutation({
    mutationFn: (id: number) => transactions.flag(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      enqueueSnackbar(`Transaction flagged. Case ${data.case_id} created.`, {
        variant: 'success',
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to flag transaction', {
        variant: 'error',
      });
    },
  });

  const handleRefresh = () => {
    setRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['cases'] });
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <Layout
      breadcrumbs={[
        { label: 'Use Cases', href: '/use-cases' },
        { label: 'Real-Time Alert Triage' },
      ]}
    >
      <Container maxWidth="xl">
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Real-Time Alert Triage
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Learn how investigators triage real-time fraud alerts from detection to case creation
              </Typography>
            </Box>
            <Button
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outlined"
            >
              Refresh
            </Button>
          </Box>

          <DemoNarrationPlayer
            useCaseId="real-time-alert-triage"
            title="Audio Demo: Real-Time Alert Triage"
            description="Listen to a guided walkthrough of the real-time alert triage workflow"
          />
        </Box>

        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
          <Tab label="Incoming Alerts" />
          <Tab label="Triage Actions" />
          <Tab label="Automatic Case Creation" />
        </Tabs>

        {/* Section 1: Incoming Alerts */}
        <TabPanel value={tabValue} index={0}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Incoming Alerts
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The system continuously scores incoming transactions using the FraudScoringEngine
              and auto-flags HIGH risk transactions via the AnomalyDetectionAgent. The table below
              shows the latest HIGH and MEDIUM risk transactions that require triage.
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Merchant</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Flagged</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingHigh || loadingMedium ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Loading alerts...
                      </TableCell>
                    </TableRow>
                  ) : alertTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No active alerts. All transactions have been triaged.
                      </TableCell>
                    </TableRow>
                  ) : (
                    alertTransactions.map((tx: any) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>
                          {new Date(tx.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{tx.transaction_id}</TableCell>
                        <TableCell>
                          {tx.amount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: tx.currency,
                          })}
                        </TableCell>
                        <TableCell>{tx.merchant_name || tx.merchant_id || 'N/A'}</TableCell>
                        <TableCell>
                          <RiskChip riskLevel={(tx as any).risk_level || RiskLevel.MEDIUM} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={(tx as any).flagged ? 'Yes' : 'No'}
                            color={(tx as any).flagged ? 'error' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/transactions/${tx.id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Section 2: Triage Actions */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Triage Actions
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              During triage, investigators use risk level, velocity/geography hints, and compliance
              checks to decide whether to escalate. For each alert, you can view transaction details
              or flag it for investigation, which automatically creates a case.
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Transaction ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alertTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No alerts to triage
                      </TableCell>
                    </TableRow>
                  ) : (
                    alertTransactions.map((tx: any) => (
                      <TableRow key={tx.id} hover>
                        <TableCell>
                          {new Date(tx.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{tx.transaction_id}</TableCell>
                        <TableCell>
                          {tx.amount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: tx.currency,
                          })}
                        </TableCell>
                        <TableCell>
                          <RiskChip riskLevel={(tx as any).risk_level || RiskLevel.MEDIUM} />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              onClick={() => router.push(`/transactions/${tx.id}`)}
                            >
                              View
                            </Button>
                            <RoleGuard roles={['INVESTIGATOR', 'ADMIN']}>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                startIcon={<FlagIcon />}
                                onClick={() => flagMutation.mutate(tx.id)}
                                disabled={flagMutation.isPending}
                              >
                                Flag
                              </Button>
                            </RoleGuard>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Section 3: Automatic Case Creation */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Automatic Case Creation
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              HIGH risk transactions automatically generate a Case and CaseEvent through the
              AnomalyDetectionAgent. The system creates cases with status TRIAGE and links the
              transaction and related entities. Below are recent cases that originated from
              auto-created HIGH risk alerts.
            </Typography>

            <Box display="flex" flexDirection="column" gap={2} mt={3}>
              {recentCases && recentCases.length > 0 ? (
                recentCases.slice(0, 10).map((caseItem: Case) => (
                  <Card key={caseItem.id}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="subtitle1" gutterBottom>
                            {caseItem.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {caseItem.case_id}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                          <Chip
                            label={caseItem.status.toUpperCase()}
                            color={
                              caseItem.status === 'closed'
                                ? 'success'
                                : caseItem.status === 'investigation'
                                ? 'error'
                                : 'primary'
                            }
                            size="small"
                          />
                          {caseItem.priority && (
                            <Chip
                              label={caseItem.priority.toUpperCase()}
                              color="warning"
                              size="small"
                            />
                          )}
                        </Box>
                      </Box>
                      <Box mt={2}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => router.push(`/cases/${caseItem.id}`)}
                        >
                          View Case Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Alert severity="info">No recent auto-created cases found.</Alert>
              )}
            </Box>
          </Paper>
        </TabPanel>
      </Container>
    </Layout>
  );
}

