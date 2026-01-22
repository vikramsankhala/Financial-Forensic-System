'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeIcon,
} from '@mui/icons-material';

interface DemoNarrationPlayerProps {
  useCaseId: 'real-time-alert-triage' | 'complex-case-investigation' | 'network-entity-analysis';
  title: string;
  description: string;
}

export function DemoNarrationPlayer({
  useCaseId,
  title,
  description,
}: DemoNarrationPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isEnabled = process.env.NEXT_PUBLIC_DEMO_AUDIO_ENABLED === 'true';

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    // Load audio on mount
    const loadAudio = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/demo-audio/${useCaseId}`);
        if (!response.ok) {
          throw new Error('Failed to load audio');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Create audio element
        const audio = new Audio(url);
        audioRef.current = audio;

        // Update progress
        audio.addEventListener('timeupdate', () => {
          if (audio.duration) {
            setProgress((audio.currentTime / audio.duration) * 100);
          }
        });

        // Handle end
        audio.addEventListener('ended', () => {
          setPlaying(false);
          setProgress(0);
        });

        // Handle errors
        audio.addEventListener('error', (e) => {
          setError('Audio playback error');
          setPlaying(false);
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load audio narration');
      } finally {
        setLoading(false);
      }
    };

    loadAudio();

    // Cleanup
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [useCaseId, isEnabled]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        setError('Failed to play audio');
        console.error('Audio play error:', err);
      });
      setPlaying(true);
    }
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * audioRef.current.duration;

    audioRef.current.currentTime = newTime;
    setProgress(percentage * 100);
  };

  // Don't render if audio demos are disabled
  if (!isEnabled) {
    return null;
  }

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <VolumeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Box flex={1}>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box display="flex" alignItems="center" justifyContent="center" py={2}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Loading audio narration...
            </Typography>
          </Box>
        )}

        {audioUrl && !loading && !error && (
          <Box>
            <Box display="flex" alignItems="center" gap={2}>
              <IconButton
                color="primary"
                onClick={handlePlayPause}
                disabled={loading}
                sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
              >
                {playing ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <Box flex={1} onClick={handleSeek} sx={{ cursor: 'pointer' }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              This audio demo explains how to use this scenario step-by-step.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

