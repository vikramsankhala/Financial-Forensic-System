'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Tooltip,
  Grid,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { cases } from '@/lib/api-client';
import { StatusChip } from '@/components/StatusChip';
import { RiskChip } from '@/components/RiskChip';
import { CaseStatus, Case, CaseEvent, Transaction } from '@/types';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import { RiskLevel } from '@/types';
import { DemoNarrationPlayer } from '@/components/DemoNarrationPlayer';

export default function ComplexCaseInvestigationPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<CaseStatus | ''>('');
  const [finalNote, setFinalNote] = useState('');

  // Fetch high-priority open cases
  const { data: highPriorityCases } = useQuery({
    queryKey: ['cases', 'high-priority'],
    queryFn: () =>
      cases.list({
        status: CaseStatus.OPEN,
        priority: 'high',
        owner_id: user?.id,
      }),
  });

  // Fetch selected case details
  const { data: selectedCase } = useQuery({
    queryKey: ['case', selectedCaseId],
    queryFn: () => cases.get(selectedCaseId!),
    enabled: !!selectedCaseId,
  });

  // Fetch case report
  const { data: caseReport } = useQuery({
    queryKey: ['case-report', selectedCaseId],
    queryFn: () => cases.getReport(selectedCaseId!),
    enabled: !!selectedCaseId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: CaseStatus) => cases.updateStatus(selectedCaseId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', selectedCaseId] });
      queryClient.invalidateQueries({ queryKey: ['case-report', selectedCaseId] });
      enqueueSnackbar('Case status updated', { variant: 'success' });
      setNewStatus('');
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to update status', {
        variant: 'error',
      });
    },
  });

  const addEventMutation = useMutation({
    mutationFn: (payload: any) => cases.addEvent(selectedCaseId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-report', selectedCaseId] });
      setFinalNote('');
      enqueueSnackbar('Event added', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to add event', {
        variant: 'error',
      });
    },
  });

  const handleStatusChange = () => {
    if (newStatus && selectedCaseId) {
      updateStatusMutation.mutate(newStatus as CaseStatus);
    }
  };

  const handleFinalNote = () => {
    if (!finalNote.trim()) {
      enqueueSnackbar('Please enter a note', { variant: 'warning' });
      return;
    }
    addEventMutation.mutate({
      event_type: 'note',
      title: 'Case Resolution Note',
      content: finalNote,
    });
  };

  const events = caseReport?.events || [];
  const relatedTransactions = caseReport?.transactions || [];
  const highRiskTransactions = relatedTransactions
    .filter(
      (tx: any) =>
        (tx as any).risk_level === RiskLevel.HIGH ||
        (tx as any).risk_level === RiskLevel.MEDIUM
    )
    .slice(0, 5);

  return (
    <Layout
      breadcrumbs={[
        { label: 'Use Cases', href: '/use-cases' },
        { label: 'Complex Case Investigation' },
      ]}
    >
      <Container maxWidth="xl">
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Complex Case Investigation
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Learn how investigators work through multi-transaction, multi-entity fraud cases
            end-to-end
          </Typography>
        </Box>

        <DemoNarrationPlayer
          useCaseId="complex-case-investigation"
          title="Audio Demo: Complex Case Investigation"
          description="Listen to a guided walkthrough of the case investigation workflow"
        />

        {/* Panel A: Finding and Opening a High-Priority Case */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Finding and Opening a High-Priority Case
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Investigators filter for OPEN, high-priority cases assigned to them using the case
            list API. Select a case below to begin investigation.
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Case ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {highPriorityCases && highPriorityCases.length > 0 ? (
                  highPriorityCases.map((caseItem: Case) => (
                    <TableRow
                      key={caseItem.id}
                      hover
                      selected={selectedCaseId === caseItem.id}
                      onClick={() => setSelectedCaseId(caseItem.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{caseItem.case_id}</TableCell>
                      <TableCell>{caseItem.title}</TableCell>
                      <TableCell>
                        <StatusChip status={caseItem.status} />
                      </TableCell>
                      <TableCell>
                        <Chip label={caseItem.priority?.toUpperCase() || 'N/A'} size="small" />
                      </TableCell>
                      <TableCell>
                        {new Date(caseItem.updated_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/cases/${caseItem.id}`);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No high-priority open cases found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Panel B: Investigating Transactions and Events */}
        {selectedCase && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Investigating Transactions and Events
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Within a case, investigators use the case timeline (CaseEvent) and related
              transactions to reconstruct the fraud narrative.
            </Typography>

            <Grid container spacing={3} mt={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Case Summary
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2">
                      <strong>Status:</strong> {selectedCase.status}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Priority:</strong> {selectedCase.priority || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Owner:</strong> {user?.username || 'N/A'}
                    </Typography>
                  </CardContent>
                </Card>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
                  Recent Timeline Events
                </Typography>
                <List>
                  {events.slice(-5).map((event: CaseEvent, idx: number) => (
                    <ListItem key={event.id} alignItems="flex-start">
                      <ListItemText
                        primary={event.title || event.event_type}
                        secondary={
                          <>
                            {event.content && (
                              <Typography variant="body2" component="span" display="block">
                                {event.content}
                              </Typography>
                            )}
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                              {new Date(event.created_at).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                      {idx < events.slice(-5).length - 1 && <Divider component="li" sx={{ my: 1 }} />}
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  High-Risk Transactions
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Risk</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {highRiskTransactions.length > 0 ? (
                        highRiskTransactions.map((tx: Transaction) => (
                          <TableRow key={tx.id}>
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
                              <Button
                                size="small"
                                onClick={() => router.push(`/transactions/${tx.id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            No high-risk transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Panel C: Closing or Marking False Positive */}
        {selectedCase && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Closing or Marking False Positive
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              After investigation, an investigator either closes the case or marks it as
              FALSE_POSITIVE, generating a CaseEvent and immutable audit log entry.
            </Typography>

            <Box mt={3}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Update Case Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Update Case Status"
                  onChange={(e) => setNewStatus(e.target.value as CaseStatus)}
                  disabled={!hasRole(['INVESTIGATOR', 'ADMIN'])}
                >
                  <MenuItem value={CaseStatus.INVESTIGATION}>Investigation</MenuItem>
                  <MenuItem value={CaseStatus.REMEDIATION}>Remediation</MenuItem>
                  <MenuItem value={CaseStatus.CLOSED}>Closed</MenuItem>
                </Select>
              </FormControl>
              {!hasRole(['INVESTIGATOR', 'ADMIN']) && (
                <Tooltip title="Only INVESTIGATOR and ADMIN roles can change case status">
                  <Alert severity="info" sx={{ mb: 2 }}>
                    You do not have permission to change case status
                  </Alert>
                </Tooltip>
              )}

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Final Note"
                value={finalNote}
                onChange={(e) => setFinalNote(e.target.value)}
                placeholder="Add a note describing the resolution..."
                sx={{ mb: 2 }}
              />

              <Box display="flex" gap={2}>
                <RoleGuard roles={['INVESTIGATOR', 'ADMIN']}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleStatusChange}
                    disabled={!newStatus || updateStatusMutation.isPending}
                  >
                    Update Status
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleFinalNote}
                    disabled={!finalNote.trim() || addEventMutation.isPending}
                  >
                    Add Note
                  </Button>
                </RoleGuard>
              </Box>
            </Box>
          </Paper>
        )}

        {!selectedCase && (
          <Alert severity="info">
            Select a case from Panel A to view investigation details and resolution options.
          </Alert>
        )}
      </Container>
    </Layout>
  );
}

