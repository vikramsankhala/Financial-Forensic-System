'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  FolderOpen as CaseIcon,
  TrendingUp as TrendingIcon,
  AccountBalance as AmountIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Layout from '@/components/Layout';
import { transactions, cases } from '@/lib/api-client';
import { RiskChip } from '@/components/RiskChip';
import { RiskLevel, Transaction } from '@/types';
import { useRouter } from 'next/navigation';

const COLORS = {
  [RiskLevel.LOW]: '#2e7d32',
  [RiskLevel.MEDIUM]: '#f57c00',
  [RiskLevel.HIGH]: '#c62828',
  [RiskLevel.CRITICAL]: '#b71c1c',
};

export default function DashboardPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Fetch transactions
  const { data: transactionsData } = useQuery({
    queryKey: ['transactions', { limit: 100 }],
    queryFn: () => transactions.list({ limit: 100 }),
  });

  // Fetch cases
  const { data: casesData } = useQuery({
    queryKey: ['cases'],
    queryFn: () => cases.list(),
  });

  const transactionsList = (transactionsData || []) as Transaction[];

  // Calculate KPIs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const transactionsToday = transactionsList.filter(
    (tx: Transaction) => new Date(tx.timestamp) >= today
  );

  const flaggedCount = transactionsList.filter(
    (tx: Transaction) =>
      (tx as Transaction & { risk_level?: RiskLevel }).risk_level === RiskLevel.HIGH ||
      (tx as Transaction & { risk_level?: RiskLevel }).risk_level === RiskLevel.CRITICAL
  ).length;

  const openCases = casesData?.filter((c) => c.status !== 'closed').length || 0;

  const totalAmount = transactionsToday.reduce((sum, tx) => sum + tx.amount, 0);
  const highRiskAmount = transactionsList
    .filter(
      (tx: Transaction) =>
        (tx as Transaction & { risk_level?: RiskLevel }).risk_level === RiskLevel.HIGH ||
        (tx as Transaction & { risk_level?: RiskLevel }).risk_level === RiskLevel.CRITICAL
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Prepare chart data
  const riskDistribution = [
    {
      name: 'LOW',
      value: transactionsList.filter(
        (tx: Transaction) =>
          (tx as Transaction & { risk_level?: RiskLevel }).risk_level === RiskLevel.LOW
      ).length,
    },
    {
      name: 'MEDIUM',
      value: transactionsList.filter(
        (tx: Transaction) =>
          (tx as Transaction & { risk_level?: RiskLevel }).risk_level === RiskLevel.MEDIUM
      ).length,
    },
    {
      name: 'HIGH',
      value: transactionsList.filter(
        (tx: Transaction) =>
          (tx as Transaction & { risk_level?: RiskLevel }).risk_level === RiskLevel.HIGH
      ).length,
    },
    {
      name: 'CRITICAL',
      value: transactionsList.filter(
        (tx: Transaction) =>
          (tx as Transaction & { risk_level?: RiskLevel }).risk_level === RiskLevel.CRITICAL
      ).length,
    },
  ];

  // Time series data (mock for now - would come from backend metrics)
  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    low: Math.floor(Math.random() * 50),
    medium: Math.floor(Math.random() * 20),
    high: Math.floor(Math.random() * 10),
  }));

  // Recent high-risk transactions
  const recentHighRisk = transactionsList
    .filter(
      (tx: Transaction) =>
        (tx as Transaction & { risk_level?: RiskLevel }).risk_level === RiskLevel.HIGH ||
        (tx as Transaction & { risk_level?: RiskLevel }).risk_level === RiskLevel.CRITICAL
    )
    .slice(0, 10)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const statCards = [
    {
      title: 'Transactions Today',
      value: transactionsToday.length.toLocaleString(),
      icon: <TrendingIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Flagged Transactions',
      value: flaggedCount.toLocaleString(),
      icon: <WarningIcon sx={{ fontSize: 40 }} />,
      color: '#c62828',
    },
    {
      title: 'Open Cases',
      value: openCases.toLocaleString(),
      icon: <CaseIcon sx={{ fontSize: 40 }} />,
      color: '#1565c0',
    },
    {
      title: 'Potential Loss Prevented',
      value: `$${highRiskAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: <AmountIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
  ];

  return (
    <Layout>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom variant="body2">
                        {card.title}
                      </Typography>
                      <Typography variant="h4">{card.value}</Typography>
                    </Box>
                    <Box sx={{ color: card.color }}>{card.icon}</Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Transaction Volume by Risk Level (Last 24 Hours)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="low" stroke="#2e7d32" name="Low Risk" />
                  <Line type="monotone" dataKey="medium" stroke="#f57c00" name="Medium Risk" />
                  <Line type="monotone" dataKey="high" stroke="#c62828" name="High Risk" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Risk Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as RiskLevel] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent High-Risk Transactions
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction ID</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Merchant</TableCell>
                      <TableCell>Risk Level</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentHighRisk.map((tx: any) => (
                      <TableRow
                        key={tx.id}
                        hover
                        onClick={() => router.push(`/transactions/${tx.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>{tx.transaction_id}</TableCell>
                        <TableCell>
                          {tx.amount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: tx.currency,
                          })}
                        </TableCell>
                        <TableCell>{tx.merchant_name || tx.merchant_id}</TableCell>
                        <TableCell>
                          <RiskChip riskLevel={(tx as any).risk_level || RiskLevel.LOW} />
                        </TableCell>
                        <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
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
