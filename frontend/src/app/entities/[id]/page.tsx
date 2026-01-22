'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import { entities } from '@/lib/api-client';
import { RiskChip } from '@/components/RiskChip';
import { Entity, Transaction, Case } from '@/types';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';

// Dynamically import force graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function EntityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();
  const entityId = parseInt(params.id as string);

  const { data: entity, isLoading } = useQuery({
    queryKey: ['entity', entityId],
    queryFn: () => entities.get(entityId),
    enabled: !!entityId,
  });

  const { data: networkData } = useQuery({
    queryKey: ['entity-network', entityId],
    queryFn: () => entities.getNetwork(entityId),
    enabled: !!entityId,
  });

  const handleBlock = async () => {
    try {
      await entities.block(entityId);
      enqueueSnackbar('Entity blocked successfully', { variant: 'success' });
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to block entity', {
        variant: 'error',
      });
    }
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

  if (!entity) {
    return (
      <Layout>
        <Container maxWidth="xl">
          <Typography>Entity not found</Typography>
        </Container>
      </Layout>
    );
  }

  // Prepare graph data
  const graphData = networkData
    ? {
        nodes: [
          {
            id: entity.entity_id,
            name: entity.name || entity.entity_id,
            type: entity.entity_type,
            group: 1,
          },
          ...networkData.links.map((link) => ({
            id: link.entity_id,
            name: link.entity_id,
            type: link.entity_type,
            group: 2,
          })),
        ],
        links: networkData.links.map((link) => ({
          source: entity.entity_id,
          target: link.entity_id,
          relationship: link.relationship_type,
        })),
      }
    : { nodes: [], links: [] };

  return (
    <Layout
      breadcrumbs={[
        { label: 'Entities', href: '/entities' },
        { label: entity.entity_id },
      ]}
    >
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button startIcon={<BackIcon />} onClick={() => router.back()}>
            Back
          </Button>
          <Typography variant="h4" component="h1">
            Entity Profile
          </Typography>
        </Box>

        {/* Entity Summary */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h5" gutterBottom>
                {entity.name || entity.entity_id}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {entity.entity_id}
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip label={entity.entity_type.toUpperCase()} color="primary" size="small" />
                <Chip label="Active" color="success" size="small" />
              </Box>
            </Box>
            <RoleGuard roles={['INVESTIGATOR', 'ADMIN']}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<BlockIcon />}
                onClick={handleBlock}
              >
                Block Entity
              </Button>
            </RoleGuard>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Transaction History */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Transaction History
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Recent transactions involving this entity
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Transaction ID</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Risk</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Transaction history would be displayed here
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Case Involvement */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Case Involvement
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Cases where this entity is involved
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Case involvement would be displayed here
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Network Graph */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Entity Network
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Visual representation of relationships with other entities
              </Typography>
              <Box
                sx={{
                  height: 400,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                {graphData.nodes.length > 0 ? (
                  <ForceGraph2D
                    graphData={graphData}
                    nodeLabel={(node: any) => `${node.name} (${node.type})`}
                    nodeColor={(node: any) => (node.group === 1 ? '#1976d2' : '#90caf9')}
                    linkLabel={(link: any) => link.relationship || 'related'}
                    onNodeClick={(node: any) => {
                      // Navigate to entity detail if clicked
                      if (node.id !== entity.entity_id) {
                        // Would need to find entity ID from entity_id
                        enqueueSnackbar('Entity navigation coming soon', { variant: 'info' });
                      }
                    }}
                  />
                ) : (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                  >
                    <Typography variant="body2" color="text.secondary">
                      No network data available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}

