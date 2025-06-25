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

const PIECE_SHAPES = {
  'I': '█████',
  'O': '██\n██',
  'T': ' █ \n███',
  'S': ' ██\n██ ',
  'Z': '██ \n ██',
  'J': '█  \n███',
  'L': '  █\n███'
}

export default function ExchangeControls() {
  const dispatch = useDispatch()
  const { pointSystem, feverMode, currentPiece, isGameRunning } = useSelector((state: RootState) => state.game)
  
  const canExchange = isGameRunning && 
                     (feverMode.isActive || 
                      (pointSystem.totalPoints >= pointSystem.nextExchangeCost && 
                       pointSystem.exchangesThisGame < 5))

  const handleExchange = (pieceType: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L') => {
    if (canExchange && pieceType !== currentPiece.type) {
      dispatch(exchangePiece({ newPieceType: pieceType }))
    }
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        border: '1px solid #00ff88',
        borderRadius: 2
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          color: '#00ff88', 
          mb: 2, 
          textAlign: 'center',
          textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
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
            fontStyle: 'italic'
          }}
        >
          Start game to use exchange
        </Typography>
      )}

      {isGameRunning && (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
              Current: 
              <span style={{ 
                color: currentPiece.type ? PIECE_COLORS[currentPiece.type] : '#666',
                fontWeight: 'bold',
                marginLeft: '8px'
              }}>
                {currentPiece.type || 'None'}
              </span>
            </Typography>
            
            <Typography variant="caption" sx={{ color: '#ccc' }}>
              Cost: {feverMode.isActive ? 'FREE (Fever Mode)' : `${pointSystem.nextExchangeCost}P`}
            </Typography>
          </Box>

          <Grid container spacing={1}>
            {PIECE_TYPES.map((pieceType) => (
              <Grid item xs={12} key={pieceType}>
                <Button
                  fullWidth
                  variant="outlined"
                  disabled={!canExchange || pieceType === currentPiece.type}
                  onClick={() => handleExchange(pieceType)}
                  sx={{
                    minHeight: '48px',
                    borderColor: PIECE_COLORS[pieceType],
                    color: pieceType === currentPiece.type ? '#666' : PIECE_COLORS[pieceType],
                    backgroundColor: pieceType === currentPiece.type ? 'rgba(102, 102, 102, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: `${PIECE_COLORS[pieceType]}20`,
                      borderColor: PIECE_COLORS[pieceType]
                    },
                    '&:disabled': {
                      borderColor: '#333',
                      color: '#666'
                    },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontFamily: 'monospace'
                      }}
                    >
                      {pieceType}
                    </Typography>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                      lineHeight: 1,
                      whiteSpace: 'pre-line',
                      textAlign: 'right'
                    }}
                  >
                    {PIECE_SHAPES[pieceType]}
                  </Box>
                </Button>
              </Grid>
            ))}
          </Grid>

          {!canExchange && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#ff6b6b', 
                textAlign: 'center',
                display: 'block',
                mt: 2,
                fontStyle: 'italic'
              }}
            >
              {pointSystem.totalPoints < pointSystem.nextExchangeCost 
                ? `Need ${pointSystem.nextExchangeCost - pointSystem.totalPoints}P more`
                : 'Max exchanges reached (5/5)'
              }
            </Typography>
          )}
        </>
      )}
    </Paper>
  )
}