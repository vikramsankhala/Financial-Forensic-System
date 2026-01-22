'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Flag as FlagIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { transactions } from '@/lib/api-client';
import { RiskChip } from '@/components/RiskChip';
import { RiskLevel } from '@/types';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();
  const transactionId = parseInt(params.id as string);

  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => transactions.get(transactionId),
    enabled: !!transactionId,
  });

  // Mock score data - in production, this would come from the backend
  const scoreData = {
    anomaly_score: 0.85,
    reconstruction_error: 0.12,
    risk_level: RiskLevel.HIGH,
    decision: 'review',
    feature_contributions: {
      amount: 0.25,
      log_amount: 0.15,
      normalized_amount: 0.20,
      geo_country: 0.10,
      channel: 0.08,
      merchant_category: 0.12,
      device_id: 0.05,
      ip_address: 0.05,
    },
  };

  const topContributors = Object.entries(scoreData.feature_contributions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (isLoading) {
    return (
      <Layout>
        <Container maxWidth="xl">
          <Typography>Loading...</Typography>
        </Container>
      </Layout>
    );
  }

  if (!transaction) {
    return (
      <Layout>
        <Container maxWidth="xl">
          <Typography>Transaction not found</Typography>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout
      breadcrumbs={[
        { label: 'Transactions', href: '/transactions' },
        { label: transaction.transaction_id },
      ]}
    >
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button startIcon={<BackIcon />} onClick={() => router.back()}>
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Transaction Details
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Left Column - Core Details */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Transaction Information
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>Transaction ID</strong></TableCell>
                      <TableCell>{transaction.transaction_id}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Amount</strong></TableCell>
                      <TableCell>
                        {transaction.amount.toLocaleString('en-US', {
                          style: 'currency',
                          currency: transaction.currency,
                        })}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Merchant</strong></TableCell>
                      <TableCell>{transaction.merchant_name || transaction.merchant_id || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Category</strong></TableCell>
                      <TableCell>{transaction.merchant_category || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Channel</strong></TableCell>
                      <TableCell>{transaction.channel || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Customer ID</strong></TableCell>
                      <TableCell>{transaction.customer_id || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Account ID</strong></TableCell>
                      <TableCell>{transaction.account_id || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Device ID</strong></TableCell>
                      <TableCell>{transaction.device_id || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Location</strong></TableCell>
                      <TableCell>
                        {transaction.geo_city || transaction.geo_country || 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>IP Address</strong></TableCell>
                      <TableCell>{transaction.ip_address || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Timestamp</strong></TableCell>
                      <TableCell>{new Date(transaction.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Risk Level</strong></TableCell>
                      <TableCell>
                        <RiskChip riskLevel={(transaction as any).risk_level || RiskLevel.LOW} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                {hasRole(['INVESTIGATOR', 'ADMIN']) && (
                  <>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<FlagIcon />}
                      onClick={() => {
                        // Navigate to create case with this transaction
                        router.push(`/cases/new?transaction_id=${transaction.id}`);
                      }}
                    >
                      Flag / Escalate
                    </Button>
                    {transaction.customer_id && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<BlockIcon />}
                        onClick={() => {
                          enqueueSnackbar('Block entity functionality coming soon', {
                            variant: 'info',
                          });
                        }}
                      >
                        Block Entity
                      </Button>
                    )}
                  </>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Scoring & Context */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Scoring Details
              </Typography>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Anomaly Score
                </Typography>
                <Typography variant="h4">{scoreData.anomaly_score.toFixed(3)}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Reconstruction Error
                </Typography>
                <Typography variant="h6">{scoreData.reconstruction_error?.toFixed(4)}</Typography>
              </Box>
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Decision
                </Typography>
                <Chip label={scoreData.decision.toUpperCase()} color="warning" />
              </Box>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Contributing Factors
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {topContributors.map(([feature, contribution]) => (
                  <Chip
                    key={feature}
                    label={`${feature}: ${(contribution * 100).toFixed(1)}%`}
                    color="error"
                    size="small"
                  />
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary">
                These features contributed most to the anomaly score
              </Typography>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Feature Contributions
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Feature</TableCell>
                      <TableCell align="right">Contribution</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(scoreData.feature_contributions)
                      .sort(([, a], [, b]) => b - a)
                      .map(([feature, contribution]) => (
                        <TableRow key={feature}>
                          <TableCell>{feature}</TableCell>
                          <TableCell align="right">
                            {(contribution * 100).toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}

