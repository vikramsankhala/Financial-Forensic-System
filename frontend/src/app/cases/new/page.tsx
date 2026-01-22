'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
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
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { cases } from '@/lib/api-client';
import { useSnackbar } from 'notistack';
import { RoleGuard } from '@/components/RoleGuard';

export default function NewCasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const transactionId = searchParams.get('transaction_id');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');

  const createCaseMutation = useMutation({
    mutationFn: (payload: any) => cases.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      enqueueSnackbar('Case created successfully', { variant: 'success' });
      router.push(`/cases/${data.id}`);
    },
    onError: (error: any) => {
      enqueueSnackbar(error.response?.data?.detail || 'Failed to create case', {
        variant: 'error',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      enqueueSnackbar('Title is required', { variant: 'warning' });
      return;
    }

    const payload: any = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      tags: formData.tags,
    };

    if (transactionId) {
      payload.transaction_ids = [parseInt(transactionId)];
    }

    createCaseMutation.mutate(payload);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  return (
    <RoleGuard roles={['INVESTIGATOR', 'ADMIN']}>
      <Layout
        breadcrumbs={[
          { label: 'Cases', href: '/cases' },
          { label: 'New Case' },
        ]}
      >
        <Container maxWidth="md">
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Button startIcon={<BackIcon />} onClick={() => router.back()}>
              Back
            </Button>
            <Typography variant="h4" component="h1">
              Create New Case
            </Typography>
          </Box>

          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Case Title"
                required
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                sx={{ mb: 2 }}
              />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, priority: e.target.value }))
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Tags
                </Typography>
                <Box display="flex" gap={1} mb={1} flexWrap="wrap">
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                    />
                  ))}
                </Box>
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    placeholder="Add tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <Button onClick={handleAddTag} variant="outlined" size="small">
                    Add
                  </Button>
                </Box>
              </Box>

              {transactionId && (
                <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="body2">
                    This case will be linked to transaction ID: {transactionId}
                  </Typography>
                </Box>
              )}

              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button onClick={() => router.back()}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={createCaseMutation.isPending}
                >
                  {createCaseMutation.isPending ? 'Creating...' : 'Create Case'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Container>
      </Layout>
    </RoleGuard>
  );
}

