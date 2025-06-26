'use client'

import React from 'react'
import { Box, Typography, Paper, Button, Grid } from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'
import { exchangePiece } from '@/store/slices/gameSlice'

const PIECE_TYPES: ('I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L')[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']

const PIECE_COLORS = {
  'I': '#00ffff',
  'O': '#ffff00', 
  'T': '#800080',
  'S': '#00ff00',
  'Z': '#ff0000',
  'J': '#0000ff',
  'L': '#ffa500'
}

export default function ExchangeControls() {
  const dispatch = useDispatch()
  const { pointSystem, feverMode, currentPiece, isGameRunning } = useSelector((state: RootState) => state.game)
  
  const canExchange = isGameRunning && 
                     (feverMode.isActive || 
                      (pointSystem.totalPoints >= (pointSystem.nextExchangeCost || 0)))

  const handleExchange = () => {
    if (canExchange) {
      dispatch(exchangePiece())
    }
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 1.5, 
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        border: '1px solid #00ff88',
        borderRadius: 2
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#00ff88', 
          mb: 1.5, 
          textAlign: 'center',
          fontSize: '1rem'
        }}
      >
        EXCHANGE
      </Typography>
      
      {!isGameRunning && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666', 
            textAlign: 'center',
            fontStyle: 'italic',
            fontSize: '0.8rem'
          }}
        >
          Start game to use exchange
        </Typography>
      )}

      {isGameRunning && (
        <>
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" sx={{ color: '#fff', mb: 1, fontSize: '0.8rem' }}>
              Current: 
              <span style={{ 
                color: currentPiece.type ? PIECE_COLORS[currentPiece.type] : '#666',
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                {currentPiece.type || 'None'}
              </span>
            </Typography>
            
            <Typography variant="caption" sx={{ color: '#ccc', fontSize: '0.7rem' }}>
              Cost: {feverMode.isActive ? 'FREE (Fever Mode)' : `${pointSystem.nextExchangeCost || 0}P`}
            </Typography>
          </Box>

                <Button
                  fullWidth
                  variant="outlined"
            disabled={!canExchange}
            onClick={handleExchange}
                  sx={{
              minHeight: '40px',
              borderColor: '#00ff88',
              color: '#00ff88',
              backgroundColor: 'transparent',
                    '&:hover': {
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderColor: '#00ff88'
                    },
                    '&:disabled': {
                      borderColor: '#333',
                      color: '#666'
                    },
              fontSize: '0.9rem',
              fontWeight: 'bold'
                      }}
                    >
            EXCHANGE PIECE
                </Button>

          {!canExchange && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#ff6b6b', 
                textAlign: 'center',
                display: 'block',
                mt: 1.5,
                fontStyle: 'italic',
                fontSize: '0.7rem'
              }}
            >
              {pointSystem.totalPoints < (pointSystem.nextExchangeCost || 0)
                ? `Need ${(pointSystem.nextExchangeCost || 0) - pointSystem.totalPoints}P more`
                : 'Cannot exchange current piece'
              }
            </Typography>
          )}
        </>
      )}
    </Paper>
  )
}