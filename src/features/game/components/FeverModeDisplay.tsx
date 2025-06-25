'use client'

import React, { useEffect } from 'react'
import { Box, Paper, Typography, LinearProgress, Chip } from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'
import { updateFeverTime } from '@/store/slices/gameSlice'
import { FEVER_CONFIG } from '@/types/points'

interface FeverModeDisplayProps {
  variant?: 'compact' | 'detailed'
}

export default function FeverModeDisplay({ variant = 'compact' }: FeverModeDisplayProps) {
  const dispatch = useDispatch()
  const { feverMode, blocksPlaced } = useSelector((state: RootState) => state.game)

  // フィーバーモードタイマー更新
  useEffect(() => {
    if (!feverMode.isActive) return

    const interval = setInterval(() => {
      dispatch(updateFeverTime(100)) // 100ms間隔で更新
    }, 100)

    return () => clearInterval(interval)
  }, [feverMode.isActive, dispatch])

  const formatTime = (milliseconds: number) => {
    const seconds = Math.ceil(milliseconds / 1000)
    return `${seconds}s`
  }

  const getProgressValue = () => {
    if (feverMode.isActive) {
      return (feverMode.timeRemaining / FEVER_CONFIG.DURATION) * 100
    }
    return (feverMode.blocksUntilActivation / FEVER_CONFIG.BLOCKS_NEEDED) * 100
  }

  const getProgressColor = () => {
    if (feverMode.isActive) {
      const ratio = feverMode.timeRemaining / FEVER_CONFIG.DURATION
      if (ratio > 0.5) return '#ff8c00'
      if (ratio > 0.2) return '#ff8c00'
      return '#ffff00'
    }
    return '#00ff88'
  }

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {feverMode.isActive ? (
          <>
            <Chip
              label="FEVER"
              sx={{
                backgroundColor: '#ff8c00',
                color: '#fff',
                fontWeight: 'bold',
                animation: 'pulse 1s infinite'
              }}
            />
            <Typography variant="body2" sx={{ color: '#ff8c00', fontWeight: 'bold' }}>
              {formatTime(feverMode.timeRemaining)}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Fever:
            </Typography>
            <Typography variant="body2" sx={{ color: '#00ff88' }}>
              {feverMode.blocksUntilActivation}/{FEVER_CONFIG.BLOCKS_NEEDED}
            </Typography>
          </>
        )}
      </Box>
    )
  }

  return (
    <Paper sx={{ 
      p: 2, 
      backgroundColor: feverMode.isActive ? 'rgba(255, 140, 0, 0.1)' : 'rgba(26, 26, 26, 0.9)',
      border: feverMode.isActive ? '2px solid #ff8c00' : '1px solid transparent',
      borderRadius: 2,
      animation: feverMode.isActive ? 'glow 2s ease-in-out infinite alternate' : 'none',
      '@keyframes glow': {
        from: {
          boxShadow: '0 0 5px #ff8c00',
        },
        to: {
          boxShadow: '0 0 20px #ff8c00, 0 0 30px #ff8c00',
        },
      },
      '@keyframes pulse': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.7 },
        '100%': { opacity: 1 },
      }
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          color: feverMode.isActive ? '#ff8c00' : '#ff8c00', 
          mb: 1,
          fontWeight: 'bold'
        }}
      >
        FEVER MODE
      </Typography>
      
      {feverMode.isActive ? (
        <>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#ff8c00', 
              mb: 1, 
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            {formatTime(feverMode.timeRemaining)}
          </Typography>
          
          <LinearProgress
            variant="determinate"
            value={getProgressValue()}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getProgressColor(),
                borderRadius: 4,
              },
              mb: 1
            }}
          />
          
          <Typography variant="body2" sx={{ color: '#ff8c00', textAlign: 'center' }}>
            <strong>4x SCORE • FREE EXCHANGES</strong>
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="body1" sx={{ color: '#fff', mb: 1 }}>
            Progress: {FEVER_CONFIG.BLOCKS_NEEDED - feverMode.blocksUntilActivation}/{FEVER_CONFIG.BLOCKS_NEEDED}
          </Typography>
          
          <LinearProgress
            variant="determinate"
            value={((FEVER_CONFIG.BLOCKS_NEEDED - feverMode.blocksUntilActivation) / FEVER_CONFIG.BLOCKS_NEEDED) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#00ff88',
                borderRadius: 3,
              },
              mb: 1
            }}
          />
          
          <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
            {feverMode.blocksUntilActivation} blocks until fever
          </Typography>
        </>
      )}
    </Paper>
  )
}