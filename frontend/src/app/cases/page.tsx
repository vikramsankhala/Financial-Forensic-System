'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Layout from '@/components/Layout';
import { cases } from '@/lib/api-client';
import { StatusChip } from '@/components/StatusChip';
import { CaseStatus, Case } from '@/types';
import { RoleGuard } from '@/components/RoleGuard';

export default function CasesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');

  const { data: casesData, isLoading } = useQuery({
    queryKey: ['cases', { status: statusFilter || undefined }],
    queryFn: () => cases.list(statusFilter ? { status: statusFilter } : {}),
  });

  const columns: GridColDef[] = [
    {
      field: 'case_id',
      headerName: 'Case ID',
      width: 200,
      flex: 1,
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 300,
      flex: 2,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      valueGetter: (params) => params.row.priority || 'N/A',
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      valueGetter: (params) => new Date(params.row.created_at).toLocaleDateString(),
    },
    {
      field: 'updated_at',
      headerName: 'Updated',
      width: 150,
      valueGetter: (params) => new Date(params.row.updated_at).toLocaleDateString(),
    },
  ];

  return (
    <Layout breadcrumbs={[{ label: 'Cases', href: '/cases' }]}>
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Cases
          </Typography>
          <Box display="flex" gap={2}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as CaseStatus | '')}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value={CaseStatus.OPEN}>Open</MenuItem>
                <MenuItem value={CaseStatus.TRIAGE}>Triage</MenuItem>
                <MenuItem value={CaseStatus.INVESTIGATION}>Investigation</MenuItem>
                <MenuItem value={CaseStatus.REMEDIATION}>Remediation</MenuItem>
                <MenuItem value={CaseStatus.CLOSED}>Closed</MenuItem>
              </Select>
            </FormControl>
            <RoleGuard roles={['INVESTIGATOR', 'ADMIN']}>
              <Button variant="contained" onClick={() => router.push('/cases/new')}>
                New Case
              </Button>
            </RoleGuard>
          </Box>
        </Box>

        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={casesData || []}
            columns={columns}
            loading={isLoading}
            pageSizeOptions={[25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
              sorting: {
                sortModel: [{ field: 'updated_at', sort: 'desc' }],
              },
            }}
            onRowClick={(params) => router.push(`/cases/${params.row.id}`)}
            sx={{ cursor: 'pointer' }}
          />
        </Paper>
      </Container>
    </Layout>
  );
}
