'use client'

import React from 'react'
import { Box, Paper, Typography, Divider } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'

interface SidebarProps {
  position: 'left' | 'right'
}

export default function Sidebar({ position }: SidebarProps) {
  const { 
    score, 
    points, 
    level, 
    lines, 
    currentRank, 
    holdPieces, 
    nextPieces,
    feverMode,
    exchangeCost,
    lastSpin,
    backToBackCount,
    comboCount
  } = useSelector((state: RootState) => state.game)

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderHoldSlot = (index: number) => {
    const piece = holdPieces[index]
    return (
      <Paper
        key={`hold-${index}`}
        sx={{
          width: 80,
          height: 60,
          backgroundColor: 'rgba(45, 45, 45, 0.8)',
          border: '1px solid #00ff88',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: piece ? '#00ff88' : '#666',
            fontWeight: 'bold'
          }}
        >
          {piece || '—'}
        </Typography>
      </Paper>
    )
  }

  const renderNextPiece = (piece: string, index: number) => {
    return (
      <Paper
        key={`next-${index}`}
        sx={{
          width: 60,
          height: 40,
          backgroundColor: 'rgba(45, 45, 45, 0.8)',
          border: '1px solid #ffd700',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 0.5,
          opacity: index === 0 ? 1 : 0.7 - (index * 0.1)
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#ffd700',
            fontWeight: 'bold'
          }}
        >
          {piece}
        </Typography>
      </Paper>
    )
  }

  if (position === 'left') {
    return (
      <Box sx={{ width: 160, padding: 2 }}>
        {/* Hold Slots */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
          <Typography variant="h6" sx={{ color: '#00ff88', mb: 1 }}>
            HOLD
          </Typography>
          {[0, 1].map(renderHoldSlot)}
          <Typography variant="caption" sx={{ color: '#666' }}>
            Cost: 15P each
          </Typography>
        </Paper>

        {/* Level & Status */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
          <Typography variant="h6" sx={{ color: '#ffd700', mb: 1 }}>
            LEVEL
          </Typography>
          <Typography variant="h4" sx={{ color: '#fff', mb: 1 }}>
            {level}
          </Typography>
          <Divider sx={{ my: 1, backgroundColor: '#333' }} />
          <Typography variant="body2" sx={{ color: '#666' }}>
            Lines: {formatNumber(lines)}
          </Typography>
        </Paper>

        {/* Fever Mode */}
        <Paper sx={{ 
          p: 2, 
          mb: 2, 
          backgroundColor: feverMode.isActive ? 'rgba(255, 0, 0, 0.2)' : 'rgba(26, 26, 26, 0.9)',
          border: feverMode.isActive ? '2px solid #ff0000' : 'none'
        }}>
          <Typography variant="h6" sx={{ color: feverMode.isActive ? '#ff0000' : '#ff8c00', mb: 1 }}>
            FEVER
          </Typography>
          {feverMode.isActive ? (
            <Typography variant="h6" sx={{ color: '#ff0000' }}>
              {formatTime(Math.ceil(feverMode.timeRemaining / 1000))}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: '#666' }}>
              Blocks: {feverMode.blocksUntilActivation}/20
            </Typography>
          )}
        </Paper>

        {/* Rank */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
          <Typography variant="h6" sx={{ color: '#ffd700', mb: 1 }}>
            RANK
          </Typography>
          <Typography variant="h5" sx={{ color: '#fff' }}>
            {currentRank.name}
          </Typography>
        </Paper>

        {/* Spin Statistics */}
        <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
          <Typography variant="h6" sx={{ color: '#a020f0', mb: 1 }}>
            SPIN STATS
          </Typography>
          
          {lastSpin?.type && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#00ff88' }}>
                Last: {lastSpin.type} {lastSpin.variant}
              </Typography>
            </Box>
          )}
          
          {backToBackCount > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#ff8c00' }}>
                Back-to-Back: {backToBackCount}
              </Typography>
            </Box>
          )}
          
          {comboCount > 0 && (
            <Box>
              <Typography variant="body2" sx={{ color: '#ffd700' }}>
                Combo: {comboCount}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    )
  }

  // Right sidebar
  return (
    <Box sx={{ width: 160, padding: 2 }}>
      {/* Score */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
        <Typography variant="h6" sx={{ color: '#00ff88', mb: 1 }}>
          SCORE
        </Typography>
        <Typography variant="h4" sx={{ color: '#fff', mb: 1 }}>
          {formatNumber(score)}
        </Typography>
        <Divider sx={{ my: 1, backgroundColor: '#333' }} />
        <Typography variant="body2" sx={{ color: '#666' }}>
          Points: {formatNumber(points)}
        </Typography>
      </Paper>

      {/* Next Pieces */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
        <Typography variant="h6" sx={{ color: '#ffd700', mb: 1 }}>
          NEXT
        </Typography>
        {nextPieces.slice(0, 5).map(renderNextPiece)}
      </Paper>

      {/* Exchange System */}
      <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
        <Typography variant="h6" sx={{ color: '#ff8c00', mb: 1 }}>
          EXCHANGE
        </Typography>
        <Typography variant="h6" sx={{ color: feverMode.isActive ? '#00ff88' : '#fff' }}>
          {feverMode.isActive ? 'FREE' : `${exchangeCost}P`}
        </Typography>
        <Typography variant="caption" sx={{ color: '#666' }}>
          Press E to exchange
        </Typography>
      </Paper>
    </Box>
  )
}