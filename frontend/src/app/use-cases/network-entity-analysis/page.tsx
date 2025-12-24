'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Block as BlockIcon,
  AccountTree as EntityIcon,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';
import Layout from '@/components/Layout';
import { entities } from '@/lib/api-client';
import { Entity, EntityNetworkResponse } from '@/types';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGuard } from '@/components/RoleGuard';
import { useRequireAuth } from '@/contexts/AuthContext';
import { DemoNarrationPlayer } from '@/components/DemoNarrationPlayer';

// Dynamically import force graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

export default function NetworkEntityAnalysisPage() {
  useRequireAuth();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);

  // Fetch entity by ID
  const { data: entity, isLoading: loadingEntity } = useQuery({
    queryKey: ['entity', selectedEntityId],
    queryFn: () => entities.get(selectedEntityId!),
    enabled: !!selectedEntityId,
  });

  // Fetch entity network
  const { data: networkData } = useQuery({
    queryKey: ['entity-network', selectedEntityId],
    queryFn: () => entities.getNetwork(selectedEntityId!),
    enabled: !!selectedEntityId,
  });

  const blockMutation = useMutation({
    mutationFn: (id: number) => entities.block(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entity', selectedEntityId] });
      enqueueSnackbar('Entity blocked successfully', { variant: 'success' });
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to block entity', {
        variant: 'error',
      });
    },
  });

  const handleSearch = () => {
    const id = parseInt(searchInput);
    if (!isNaN(id) && id > 0) {
      setSelectedEntityId(id);
    } else {
      enqueueSnackbar('Please enter a valid entity ID', { variant: 'warning' });
    }
  };

  // Prepare graph data
  const graphData =
    entity && networkData
      ? {
          nodes: [
            {
              id: entity.entity_id,
              name: entity.name || entity.entity_id,
              type: entity.entity_type,
              group: 1,
              risk: 'high', // Mock risk level
            },
            ...networkData.links.map((link) => ({
              id: link.entity_id,
              name: link.entity_id,
              type: link.entity_type,
              group: 2,
              risk: 'medium',
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
        { label: 'Use Cases', href: '/use-cases' },
        { label: 'Network & Entity Risk Analysis' },
      ]}
    >
      <Container maxWidth="xl">
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            Network & Entity Risk Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Learn how investigators use entity 360 view and network graphs to uncover fraud rings
            and assess entity risk
          </Typography>
        </Box>

        <DemoNarrationPlayer
          useCaseId="network-entity-analysis"
          title="Audio Demo: Network & Entity Analysis"
          description="Listen to a guided walkthrough of entity network analysis and fraud ring detection"
        />

        <Alert severity="info" sx={{ mb: 3 }}>
          The MonitoringAgent and InvestigationAgent leverage network analysis (entity clustering,
          shared devices, temporal patterns) to prioritize risky entities and identify fraud rings.
        </Alert>

        <Grid container spacing={3}>
          {/* Left Column: Narrative + Entity Selector */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Entity Model & Network Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                The system models entities (INDIVIDUAL, BUSINESS, MERCHANT) with aggregated risk
                scores and tags. EntityLink-based network analysis tracks multi-hop relationships,
                shared devices, and shared addresses to identify fraud rings.
              </Typography>

              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Search Entity
                </Typography>
                <Box display="flex" gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter Entity ID"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                  >
                    Search
                  </Button>
                </Box>
              </Box>

              {entity && (
                <Box mt={3}>
                  <Typography variant="subtitle2" gutterBottom>
                    Entity Profile
                  </Typography>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2">
                        <strong>ID:</strong> {entity.entity_id}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Type:</strong> {entity.entity_type.toUpperCase()}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Name:</strong> {entity.name || 'N/A'}
                      </Typography>
                      <Box mt={1}>
                        <Chip label="Active" color="success" size="small" />
                        <Chip label="High Risk" color="error" size="small" sx={{ ml: 1 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Column: Live 360 & Network View */}
          <Grid item xs={12} md={8}>
            {!selectedEntityId ? (
              <Paper sx={{ p: 3 }}>
                <Box textAlign="center" py={4}>
                  <EntityIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Select an Entity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter an entity ID in the search box to view its 360° profile and network
                    graph
                  </Typography>
                </Box>
              </Paper>
            ) : loadingEntity ? (
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              </Paper>
            ) : entity ? (
              <>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Entity 360° View
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entity.entity_id} - {entity.entity_type}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        onClick={() => router.push(`/entities/${entity.id}`)}
                      >
                        Full View
                      </Button>
                      <RoleGuard roles={['INVESTIGATOR', 'ADMIN']}>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<BlockIcon />}
                          onClick={() => blockMutation.mutate(entity.id)}
                          disabled={blockMutation.isPending}
                        >
                          Block Entity
                        </Button>
                      </RoleGuard>
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Transaction Count
                      </Typography>
                      <Typography variant="h6">N/A</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Linked Cases
                      </Typography>
                      <Typography variant="h6">N/A</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Entity Network Graph
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Visual representation of relationships with other entities. Nodes are colored
                    by risk level and sized by transaction count.
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
                        nodeColor={(node: any) =>
                          node.group === 1 ? '#c62828' : node.risk === 'high' ? '#ef5350' : '#90caf9'
                        }
                        nodeVal={(node: any) => (node.group === 1 ? 10 : 5)}
                        linkLabel={(link: any) => link.relationship || 'related'}
                        onNodeClick={(node: any) => {
                          if (node.id !== entity.entity_id) {
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

                {networkData && networkData.links.length > 0 && (
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Top Counterparties
                    </Typography>
                    <List>
                      {networkData.links.slice(0, 5).map((link, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={link.entity_id}
                            secondary={`${link.entity_type} • ${link.relationship_type || 'Related'}`}
                          />
                          <Chip label="Medium Risk" color="warning" size="small" />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </>
            ) : (
              <Paper sx={{ p: 3 }}>
                <Alert severity="warning">Entity not found. Please check the entity ID.</Alert>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Layout>
  );
}

