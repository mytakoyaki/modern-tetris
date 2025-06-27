'use client'

import React, { useEffect } from 'react'
import { Box, Paper, Typography, LinearProgress, Chip } from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'
import { updateFeverTime } from '@/store/slices/gameSlice'
import { FEVER_CONFIG } from '@/types/points'

interface FeverModeDisplayProps {
  variant?: 'compact' | 'full'
}

function formatTime(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function getProgressValue(): number {
  return 100 // フィーバー中は常に100%
}

function getProgressColor(): string {
  return '#ff8c00'
}

export default function FeverModeDisplay({ variant = 'compact' }: FeverModeDisplayProps) {
  const dispatch = useDispatch()
  const { feverMode, blocksPlaced } = useSelector((state: RootState) => state.game)
  
  // DEBUG: フィーバーモード状態をログ出力
  useEffect(() => {
    console.log('[DEBUG] FeverModeDisplay - State changed:', {
      isActive: feverMode.isActive,
      timeRemaining: feverMode.timeRemaining,
      blocksUntilActivation: feverMode.blocksUntilActivation,
      blocksPlaced: blocksPlaced
    })
  }, [feverMode.isActive, feverMode.timeRemaining, feverMode.blocksUntilActivation, blocksPlaced])

  // フィーバーモードタイマー更新
  useEffect(() => {
    if (!feverMode.isActive) return

    const interval = setInterval(() => {
      dispatch(updateFeverTime(100)) // 100ms間隔で更新
    }, 100)

    return () => clearInterval(interval)
  }, [feverMode.isActive, dispatch])

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
                fontSize: '0.9rem',
                animation: 'feverPulse 1s infinite',
                boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)',
                '@keyframes feverPulse': {
                  '0%': { 
                    transform: 'scale(1)',
                    boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)',
                  },
                  '50%': { 
                    transform: 'scale(1.05)',
                    boxShadow: '0 0 15px rgba(255, 140, 0, 0.8)',
                  },
                  '100%': { 
                    transform: 'scale(1)',
                    boxShadow: '0 0 10px rgba(255, 140, 0, 0.5)',
                  },
                },
              }}
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#ff8c00', 
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textShadow: '0 0 5px rgba(255, 140, 0, 0.5)',
                animation: 'feverTextGlow 1.5s ease-in-out infinite alternate',
                '@keyframes feverTextGlow': {
                  '0%': { 
                    textShadow: '0 0 5px rgba(255, 140, 0, 0.5)',
                  },
                  '100%': { 
                    textShadow: '0 0 10px rgba(255, 140, 0, 0.8), 0 0 15px rgba(255, 140, 0, 0.6)',
                  },
                },
              }}
            >
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
      backgroundColor: feverMode.isActive ? 'rgba(255, 140, 0, 0.15)' : 'rgba(26, 26, 26, 0.9)',
      border: feverMode.isActive ? '3px solid #ff8c00' : '1px solid transparent',
      borderRadius: 2,
      animation: feverMode.isActive ? 'feverGlow 2s ease-in-out infinite alternate' : 'none',
      boxShadow: feverMode.isActive ? '0 0 20px rgba(255, 140, 0, 0.3)' : 'none',
      '@keyframes feverGlow': {
        from: {
          boxShadow: '0 0 20px rgba(255, 140, 0, 0.3)',
          borderColor: '#ff8c00',
        },
        to: {
          boxShadow: '0 0 30px rgba(255, 140, 0, 0.6), 0 0 40px rgba(255, 140, 0, 0.3)',
          borderColor: '#ffd700',
        },
      },
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          color: feverMode.isActive ? '#ffd700' : '#ff8c00', 
          mb: 1,
          fontWeight: 'bold',
          textAlign: 'center',
          textShadow: feverMode.isActive ? '0 0 10px rgba(255, 215, 0, 0.5)' : 'none',
          animation: feverMode.isActive ? 'feverTitleGlow 2s ease-in-out infinite alternate' : 'none',
          '@keyframes feverTitleGlow': {
            '0%': { 
              textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
              transform: 'scale(1)',
            },
            '100%': { 
              textShadow: '0 0 15px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.6)',
              transform: 'scale(1.02)',
            },
          },
        }}
      >
        {feverMode.isActive ? '🔥 FEVER MODE 🔥' : 'FEVER MODE'}
      </Typography>
      
      {feverMode.isActive ? (
        <>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#ff8c00', 
              mb: 1, 
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: '0 0 15px rgba(255, 140, 0, 0.6)',
              animation: 'feverTimerPulse 1s ease-in-out infinite alternate',
              '@keyframes feverTimerPulse': {
                '0%': { 
                  textShadow: '0 0 15px rgba(255, 140, 0, 0.6)',
                  transform: 'scale(1)',
                },
                '100%': { 
                  textShadow: '0 0 25px rgba(255, 140, 0, 0.8), 0 0 35px rgba(255, 140, 0, 0.6)',
                  transform: 'scale(1.05)',
                },
              },
            }}
          >
            {formatTime(feverMode.timeRemaining)}
          </Typography>
          
          <LinearProgress
            variant="determinate"
            value={getProgressValue()}
            sx={{
              height: 10,
              borderRadius: 5,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              mb: 1,
              '& .MuiLinearProgress-bar': {
                backgroundColor: getProgressColor(),
                borderRadius: 5,
                animation: 'feverProgressGlow 2s ease-in-out infinite alternate',
                '@keyframes feverProgressGlow': {
                  '0%': { 
                    boxShadow: '0 0 5px rgba(255, 140, 0, 0.5)',
                  },
                  '100%': { 
                    boxShadow: '0 0 10px rgba(255, 140, 0, 0.8), 0 0 15px rgba(255, 140, 0, 0.6)',
                  },
                },
              },
            }}
          />
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#ffd700', 
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '1rem',
              textShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
              animation: 'feverBonusText 2s ease-in-out infinite alternate',
              '@keyframes feverBonusText': {
                '0%': { 
                  textShadow: '0 0 5px rgba(255, 215, 0, 0.5)',
                },
                '100%': { 
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.8), 0 0 15px rgba(255, 215, 0, 0.6)',
                },
              },
            }}
          >
            ⚡ 4x SCORE • FREE EXCHANGES ⚡
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="body1" sx={{ color: '#fff', mb: 1, textAlign: 'center' }}>
            Progress: {FEVER_CONFIG.BLOCKS_NEEDED - feverMode.blocksUntilActivation}/{FEVER_CONFIG.BLOCKS_NEEDED}
          </Typography>
          
          <LinearProgress
            variant="determinate"
            value={((FEVER_CONFIG.BLOCKS_NEEDED - feverMode.blocksUntilActivation) / FEVER_CONFIG.BLOCKS_NEEDED) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              mb: 1,
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#00ff88',
                borderRadius: 4,
                boxShadow: '0 0 5px rgba(0, 255, 136, 0.5)',
              },
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