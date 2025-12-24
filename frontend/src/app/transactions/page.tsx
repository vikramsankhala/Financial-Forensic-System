'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Flag as FlagIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import Layout from '@/components/Layout';
import { transactions } from '@/lib/api-client';
import { RiskChip } from '@/components/RiskChip';
import { RiskLevel, Transaction } from '@/types';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';

export default function TransactionsPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState({
    risk_level: '',
    customer_id: '',
    merchant_id: '',
    flagged: '',
  });
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const { data: transactionsData, isLoading, refetch } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactions.list(filters as any),
  });

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleView = (id: number) => {
    router.push(`/transactions/${id}`);
  };

  const handleFlag = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setFlagDialogOpen(true);
  };

  const confirmFlag = async () => {
    if (!selectedTransaction) return;
    try {
      const result = await transactions.flag(selectedTransaction.id);
      enqueueSnackbar(`Transaction flagged. Case ${result.case_id} created.`, {
        variant: 'success',
      });
      setFlagDialogOpen(false);
      refetch();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to flag transaction', {
        variant: 'error',
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'transaction_id',
      headerName: 'Transaction ID',
      width: 150,
      flex: 1,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 120,
      renderCell: (params) =>
        params.row.amount.toLocaleString('en-US', {
          style: 'currency',
          currency: params.row.currency || 'USD',
        }),
    },
    {
      field: 'merchant_name',
      headerName: 'Merchant',
      width: 150,
      flex: 1,
      valueGetter: (params) => params.row.merchant_name || params.row.merchant_id || 'N/A',
    },
    {
      field: 'customer_id',
      headerName: 'Customer',
      width: 120,
      valueGetter: (params) => params.row.customer_id || 'N/A',
    },
    {
      field: 'channel',
      headerName: 'Channel',
      width: 100,
    },
    {
      field: 'risk_level',
      headerName: 'Risk Level',
      width: 130,
      renderCell: (params) => (
        <RiskChip riskLevel={(params.row as any).risk_level || RiskLevel.LOW} />
      ),
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      width: 180,
      valueGetter: (params) => new Date(params.row.timestamp).toLocaleString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleView(params.row.id);
            }}
          >
            <ViewIcon />
          </IconButton>
          {hasRole(['INVESTIGATOR', 'ADMIN']) && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleFlag(params.row);
              }}
            >
              <FlagIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Layout
      breadcrumbs={[
        { label: 'Transactions', href: '/transactions' },
      ]}
    >
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Transactions
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Risk Level</InputLabel>
              <Select
                value={filters.risk_level}
                label="Risk Level"
                onChange={(e) => handleFilterChange('risk_level', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value={RiskLevel.LOW}>Low</MenuItem>
                <MenuItem value={RiskLevel.MEDIUM}>Medium</MenuItem>
                <MenuItem value={RiskLevel.HIGH}>High</MenuItem>
                <MenuItem value={RiskLevel.CRITICAL}>Critical</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Customer ID"
              size="small"
              value={filters.customer_id}
              onChange={(e) => handleFilterChange('customer_id', e.target.value)}
            />
            <TextField
              label="Merchant ID"
              size="small"
              value={filters.merchant_id}
              onChange={(e) => handleFilterChange('merchant_id', e.target.value)}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Flagged</InputLabel>
              <Select
                value={filters.flagged}
                label="Flagged"
                onChange={(e) => handleFilterChange('flagged', e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Flagged</MenuItem>
                <MenuItem value="false">Not Flagged</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={transactionsData || []}
            columns={columns}
            loading={isLoading}
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
              sorting: {
                sortModel: [{ field: 'timestamp', sort: 'desc' }],
              },
            }}
            onRowClick={(params) => handleView(params.row.id)}
            sx={{ cursor: 'pointer' }}
          />
        </Paper>

        <Dialog open={flagDialogOpen} onClose={() => setFlagDialogOpen(false)}>
          <DialogTitle>Flag Transaction</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to flag transaction {selectedTransaction?.transaction_id}?
              This will create a case for investigation.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFlagDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmFlag} variant="contained" color="error">
              Flag
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}
