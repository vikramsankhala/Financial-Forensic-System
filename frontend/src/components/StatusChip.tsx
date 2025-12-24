'use client';

import { Chip, ChipProps } from '@mui/material';
import { CaseStatus } from '@/types';
import {
  FolderOpen as OpenIcon,
  Assignment as TriageIcon,
  Search as InvestigationIcon,
  Build as RemediationIcon,
  CheckCircle as ClosedIcon,
} from '@mui/icons-material';

interface StatusChipProps extends Omit<ChipProps, 'label' | 'color'> {
  status: CaseStatus;
  showIcon?: boolean;
}

export function StatusChip({ status, showIcon = true, ...props }: StatusChipProps) {
  const getConfig = () => {
    switch (status) {
      case CaseStatus.OPEN:
        return {
          label: 'OPEN',
          color: 'primary' as const,
          icon: showIcon ? <OpenIcon /> : undefined,
        };
      case CaseStatus.TRIAGE:
        return {
          label: 'TRIAGE',
          color: 'warning' as const,
          icon: showIcon ? <TriageIcon /> : undefined,
        };
      case CaseStatus.INVESTIGATION:
        return {
          label: 'INVESTIGATION',
          color: 'error' as const,
          icon: showIcon ? <InvestigationIcon /> : undefined,
        };
      case CaseStatus.REMEDIATION:
        return {
          label: 'REMEDIATION',
          color: 'warning' as const,
          icon: showIcon ? <RemediationIcon /> : undefined,
        };
      case CaseStatus.CLOSED:
        return {
          label: 'CLOSED',
          color: 'success' as const,
          icon: showIcon ? <ClosedIcon /> : undefined,
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

