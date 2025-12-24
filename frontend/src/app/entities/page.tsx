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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { Entity } from '@/types';

// Mock data - in production, this would come from an API endpoint
const mockEntities: Entity[] = [];

export default function EntitiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // In production, use:
  // const { data: entitiesData } = useQuery({
  //   queryKey: ['entities', { search: searchTerm }],
  //   queryFn: () => entities.list({ search: searchTerm }),
  // });

  const filteredEntities = mockEntities.filter(
    (entity) =>
      entity.entity_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout breadcrumbs={[{ label: 'Entities', href: '/entities' }]}>
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Entities
          </Typography>
          <TextField
            label="Search Entities"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Entity Search
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Search for entities by ID or name. Click on an entity to view its 360° profile,
            transaction history, case involvement, and network graph.
          </Typography>
          {filteredEntities.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary">
                No entities found. Entities will appear here as they are discovered through
                transaction analysis and case investigations.
              </Typography>
            </Box>
          )}
          {filteredEntities.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Entity ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntities.map((entity) => (
                    <TableRow key={entity.id} hover>
                      <TableCell>{entity.entity_id}</TableCell>
                      <TableCell>
                        <Chip label={entity.entity_type.toUpperCase()} size="small" />
                      </TableCell>
                      <TableCell>{entity.name || 'N/A'}</TableCell>
                      <TableCell>
                        {new Date(entity.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/entities/${entity.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Layout>
  );
}
