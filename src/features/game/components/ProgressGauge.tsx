import React from 'react'
import { Box, LinearProgress, Typography } from '@mui/material'

interface ProgressGaugeProps {
  label: string
  current: number
  max: number
  color: string
  showPercentage?: boolean
  showValues?: boolean
  height?: number
}

export default function ProgressGauge({
  label,
  current,
  max,
  color,
  showPercentage = true,
  showValues = false,
  height = 8
}: ProgressGaugeProps) {
  const progress = max > 0 ? (current / max) * 100 : 0

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>
          {label}
        </Typography>
        {showValues && (
          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
            {current}/{max}
          </Typography>
        )}
        {showPercentage && (
          <Typography variant="caption" sx={{ color: color, fontSize: '0.7rem', fontWeight: 'bold' }}>
            {Math.round(progress)}%
          </Typography>
        )}
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(progress, 100)}
        sx={{
          height,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: height / 2,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: height / 2,
            boxShadow: `0 0 8px ${color}40`
          }
        }}
      />
    </Box>
  )
} 