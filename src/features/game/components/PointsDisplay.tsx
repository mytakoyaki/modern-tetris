'use client'

import React from 'react'
import { Box, Paper, Typography, Chip } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { 
  formatPointsGained, 
  formatExchangeCosts, 
  getCurrentExchangeCost 
} from '../utils/pointsSystem'

interface PointsDisplayProps {
  variant?: 'compact' | 'detailed'
}

export default function PointsDisplay({ variant = 'compact' }: PointsDisplayProps) {
  const { pointSystem, feverMode, recentPointsGained } = useSelector((state: RootState) => state.game)

  const currentExchangeCost = getCurrentExchangeCost(pointSystem.exchangeCount)
  const exchangeCostDisplay = formatExchangeCosts(pointSystem.exchangeCount)

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" sx={{ color: '#00ff88' }}>
          {pointSystem.totalPoints}P
        </Typography>
        
        {feverMode.isActive && (
          <Chip
            label="FREE"
            size="small"
            sx={{
              backgroundColor: '#ff0000',
              color: '#fff',
              fontSize: '0.7rem',
              height: 20
            }}
          />
        )}
        
        {!feverMode.isActive && (
          <Typography variant="caption" sx={{ color: '#666' }}>
            Next: {currentExchangeCost}P
          </Typography>
        )}
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
      <Typography variant="h6" sx={{ color: '#00ff88', mb: 1 }}>
        POINTS
      </Typography>
      
      <Typography variant="h4" sx={{ color: '#fff', mb: 1 }}>
        {pointSystem.totalPoints.toLocaleString()}
      </Typography>
      
      {/* Exchange Cost Display */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#ff8c00', mb: 0.5 }}>
          Exchange Cost:
        </Typography>
        
        {feverMode.isActive ? (
          <Chip
            label="FREE EXCHANGES"
            sx={{
              backgroundColor: '#ff0000',
              color: '#fff',
              fontWeight: 'bold'
            }}
          />
        ) : (
          <Typography variant="body1" sx={{ color: '#fff' }}>
            {currentExchangeCost}P
          </Typography>
        )}
        
        <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
          Next costs: {exchangeCostDisplay}
        </Typography>
      </Box>
      
      {/* Recent Points */}
      {recentPointsGained.length > 0 && (
        <Box>
          <Typography variant="body2" sx={{ color: '#ffd700', mb: 0.5 }}>
            Recent:
          </Typography>
          
          {recentPointsGained.slice(-3).map((points, index) => (
            <Typography
              key={index}
              variant="caption"
              sx={{ 
                color: '#00ff88',
                display: 'block',
                opacity: 0.8 - (index * 0.2)
              }}
            >
              {formatPointsGained(points)}
            </Typography>
          ))}
        </Box>
      )}
      
      {/* Exchange History */}
      <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 1 }}>
        Exchanges this round: {pointSystem.exchangeCount}
      </Typography>
    </Paper>
  )
}