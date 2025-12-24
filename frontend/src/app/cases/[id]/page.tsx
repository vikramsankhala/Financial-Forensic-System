'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { cases } from '@/lib/api-client';
import { StatusChip } from '@/components/StatusChip';
import { RiskChip } from '@/components/RiskChip';
import { CaseStatus, CaseEvent, Transaction, Entity } from '@/types';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import { useState } from 'react';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const caseId = parseInt(params.id as string);
  const [tabValue, setTabValue] = useState(0);
  const [newEventType, setNewEventType] = useState('note');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventContent, setNewEventContent] = useState('');

  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => cases.get(caseId),
    enabled: !!caseId,
  });

  const { data: reportData } = useQuery({
    queryKey: ['case-report', caseId],
    queryFn: () => cases.getReport(caseId),
    enabled: !!caseId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: CaseStatus) => cases.updateStatus(caseId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case', caseId] });
      enqueueSnackbar('Case status updated', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to update status', {
        variant: 'error',
      });
    },
  });

  const addEventMutation = useMutation({
    mutationFn: (payload: any) => cases.addEvent(caseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-report', caseId] });
      setNewEventTitle('');
      setNewEventContent('');
      enqueueSnackbar('Event added', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to add event', {
        variant: 'error',
      });
    },
  });

  const handleAddEvent = () => {
    if (!newEventTitle.trim()) {
      enqueueSnackbar('Title is required', { variant: 'warning' });
      return;
    }
    addEventMutation.mutate({
      event_type: newEventType,
      title: newEventTitle,
      content: newEventContent,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <Container maxWidth="xl">
          <Typography>Loading...</Typography>
        </Container>
      </Layout>
    );
  }

  if (!caseData) {
    return (
      <Layout>
        <Container maxWidth="xl">
          <Typography>Case not found</Typography>
        </Container>
      </Layout>
    );
  }

  const events = reportData?.events || [];
  const relatedTransactions = reportData?.transactions || [];
  const relatedEntities = reportData?.entities || [];

  return (
    <Layout
      breadcrumbs={[
        { label: 'Cases', href: '/cases' },
        { label: caseData.case_id },
      ]}
    >
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button startIcon={<BackIcon />} onClick={() => router.back()}>
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Case Details
          </Typography>
        </Box>

        {/* Summary Card */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {caseData.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {caseData.case_id}
              </Typography>
            </Box>
            <Box display="flex" gap={1}>
              <StatusChip status={caseData.status} />
              {caseData.priority && (
                <Chip label={caseData.priority.toUpperCase()} color="warning" size="small" />
              )}
            </Box>
          </Box>
          {caseData.description && (
            <Typography variant="body1" paragraph>
              {caseData.description}
            </Typography>
          )}
          <Box display="flex" gap={2} mt={2}>
            <RoleGuard roles={['INVESTIGATOR', 'ADMIN']}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Change Status</InputLabel>
                <Select
                  value={caseData.status}
                  label="Change Status"
                  onChange={(e) => updateStatusMutation.mutate(e.target.value as CaseStatus)}
                >
                  <MenuItem value={CaseStatus.OPEN}>Open</MenuItem>
                  <MenuItem value={CaseStatus.TRIAGE}>Triage</MenuItem>
                  <MenuItem value={CaseStatus.INVESTIGATION}>Investigation</MenuItem>
                  <MenuItem value={CaseStatus.REMEDIATION}>Remediation</MenuItem>
                  <MenuItem value={CaseStatus.CLOSED}>Closed</MenuItem>
                </Select>
              </FormControl>
            </RoleGuard>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Timeline */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Timeline
              </Typography>
              <List>
                {events.map((event: CaseEvent, index: number) => (
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
                    {index < events.length - 1 && <Divider component="li" sx={{ my: 1 }} />}
                  </ListItem>
                ))}
              </List>

              <RoleGuard roles={['INVESTIGATOR', 'ANALYST', 'ADMIN']}>
                <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Add Event
                  </Typography>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Event Type</InputLabel>
                    <Select
                      value={newEventType}
                      label="Event Type"
                      onChange={(e) => setNewEventType(e.target.value)}
                    >
                      <MenuItem value="note">Note</MenuItem>
                      <MenuItem value="action">Action</MenuItem>
                      <MenuItem value="status_change">Status Change</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    size="small"
                    label="Title"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    label="Content"
                    value={newEventContent}
                    onChange={(e) => setNewEventContent(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddEvent}
                    disabled={addEventMutation.isPending}
                  >
                    Add Event
                  </Button>
                </Box>
              </RoleGuard>
            </Paper>
          </Grid>

          {/* Related Items */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                <Tab label={`Transactions (${relatedTransactions.length})`} />
                <Tab label={`Entities (${relatedEntities.length})`} />
              </Tabs>

              {tabValue === 0 && (
                <Box sx={{ mt: 2 }}>
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
                        {relatedTransactions.map((tx: Transaction) => (
                          <TableRow key={tx.id}>
                            <TableCell>{tx.transaction_id}</TableCell>
                            <TableCell>
                              {tx.amount.toLocaleString('en-US', {
                                style: 'currency',
                                currency: tx.currency,
                              })}
                            </TableCell>
                            <TableCell>
                              <RiskChip riskLevel={(tx as any).risk_level || 'low'} />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => router.push(`/transactions/${tx.id}`)}
                              >
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {tabValue === 1 && (
                <Box sx={{ mt: 2 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Entity ID</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {relatedEntities.map((entity: Entity) => (
                          <TableRow key={entity.id}>
                            <TableCell>{entity.entity_id}</TableCell>
                            <TableCell>{entity.entity_type}</TableCell>
                            <TableCell>{entity.name || 'N/A'}</TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => router.push(`/entities/${entity.id}`)}
                              >
                                <EditIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}

