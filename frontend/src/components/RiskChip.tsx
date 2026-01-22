'use client';

import { Chip, ChipProps } from '@mui/material';
import { RiskLevel } from '@/types';
import {
  CheckCircle as LowIcon,
  Warning as MediumIcon,
  Error as HighIcon,
  Dangerous as CriticalIcon,
} from '@mui/icons-material';

interface RiskChipProps extends Omit<ChipProps, 'label' | 'color'> {
  riskLevel: RiskLevel;
  showIcon?: boolean;
}

export function RiskChip({ riskLevel, showIcon = true, ...props }: RiskChipProps) {
  const getConfig = () => {
    switch (riskLevel) {
      case RiskLevel.LOW:
        return {
          label: 'LOW',
          color: 'success' as const,
          icon: showIcon ? <LowIcon /> : undefined,
        };
      case RiskLevel.MEDIUM:
        return {
          label: 'MEDIUM',
          color: 'warning' as const,
          icon: showIcon ? <MediumIcon /> : undefined,
        };
      case RiskLevel.HIGH:
        return {
          label: 'HIGH',
          color: 'error' as const,
          icon: showIcon ? <HighIcon /> : undefined,
        };
      case RiskLevel.CRITICAL:
        return {
          label: 'CRITICAL',
          color: 'error' as const,
          icon: showIcon ? <CriticalIcon /> : undefined,
        };
      default:
        return {
          label: 'UNKNOWN',
          color: 'default' as const,
          icon: undefined,
        };
    }
  };

  const config = getConfig();

  return <Chip label={config.label} color={config.color} icon={config.icon} size="small" {...props} />;
}

