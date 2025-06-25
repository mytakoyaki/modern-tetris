'use client'

import React from 'react'
import { Box, Paper, Typography, Divider } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import PointsDisplay from './PointsDisplay'
import ExchangeControls from './ExchangeControls'

interface SidebarProps {
  position: 'left' | 'right'
}

export default function Sidebar({ position }: SidebarProps) {
  const { 
    score, 
    pointSystem, 
    level, 
    lines, 
    holdSlots, 
    nextPieces,
    lastSpin,
    backToBackCount,
    comboCount,
    feverMode
  } = useSelector((state: RootState) => state.game)

  const formatNumber = (num: number | undefined) => {
    return (num ?? 0).toLocaleString()
  }


  const renderHoldSlot = (index: number) => {
    const piece = holdSlots?.[index]
    return (
      <Paper
        key={`hold-${index}`}
        sx={{
          width: 80,
          height: 80,
          backgroundColor: 'rgba(45, 45, 45, 0.8)',
          border: '1px solid #00ff88',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
          position: 'relative'
        }}
      >
        {piece ? (
          <Box
            sx={{
              width: 60,
              height: 60,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(4, 1fr)',
              gap: 0.5
            }}
          >
            {getTetrominoShape(piece).map((row, y) =>
              row.map((cell, x) => (
                <Box
                  key={`${x}-${y}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: cell ? getTetrominoColor(piece) : 'transparent',
                    border: cell ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
                    borderRadius: 0.5
                  }}
                />
              ))
            )}
          </Box>
        ) : (
          <Typography
            variant="h6"
            sx={{
              color: '#666',
              fontWeight: 'bold'
            }}
          >
            —
          </Typography>
        )}
        {/* コスト表示 */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            top: 2,
            right: 4,
            color: '#ff6b6b',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '1px 4px',
            borderRadius: 0.5,
            fontSize: '0.7rem',
            fontWeight: 'bold'
          }}
        >
          15P
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
          height: 60,
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
        <Box
          sx={{
            width: 50,
            height: 50,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)',
            gap: 0.3
          }}
        >
          {getTetrominoShape(piece).map((row, y) =>
            row.map((cell, x) => (
              <Box
                key={`${x}-${y}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: cell ? getTetrominoColor(piece) : 'transparent',
                  border: cell ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
                  borderRadius: 0.3
                }}
              />
            ))
          )}
        </Box>
      </Paper>
    )
  }

  // テトリミノの形状データ
  const getTetrominoShape = (type: string): boolean[][] => {
    const shapes = {
      'I': [
        [false, false, false, false],
        [true, true, true, true],
        [false, false, false, false],
        [false, false, false, false]
      ],
      'O': [
        [false, false, false, false],
        [false, true, true, false],
        [false, true, true, false],
        [false, false, false, false]
      ],
      'T': [
        [false, false, false, false],
        [false, true, false, false],
        [true, true, true, false],
        [false, false, false, false]
      ],
      'S': [
        [false, false, false, false],
        [false, true, true, false],
        [true, true, false, false],
        [false, false, false, false]
      ],
      'Z': [
        [false, false, false, false],
        [true, true, false, false],
        [false, true, true, false],
        [false, false, false, false]
      ],
      'J': [
        [false, false, false, false],
        [true, false, false, false],
        [true, true, true, false],
        [false, false, false, false]
      ],
      'L': [
        [false, false, false, false],
        [false, false, true, false],
        [true, true, true, false],
        [false, false, false, false]
      ]
    }
    return shapes[type as keyof typeof shapes] || shapes['I']
  }

  // テトリミノの色
  const getTetrominoColor = (type: string): string => {
    const colors = {
      'I': '#00f5ff', // cyan
      'O': '#ffd700', // yellow
      'T': '#a020f0', // purple
      'S': '#00ff00', // green
      'Z': '#ff0000', // red
      'J': '#0000ff', // blue
      'L': '#ff8c00'  // orange
    }
    return colors[type as keyof typeof colors] || '#666'
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
        <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
          <Typography variant="h6" sx={{ color: '#ff69b4', mb: 1 }}>
            FEVER MODE
          </Typography>
          {feverMode.isActive ? (
            <Box>
              <Typography variant="h5" sx={{ color: '#ff69b4', mb: 1 }}>
                ACTIVE
              </Typography>
              <Typography variant="body2" sx={{ color: '#ff69b4' }}>
                Time: {Math.ceil(feverMode.timeRemaining / 1000)}s
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
                Inactive
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Next: {20 - (feverMode.blocksUntilActivation % 20)} blocks
              </Typography>
            </Box>
          )}
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
          Points: {formatNumber(pointSystem?.totalPoints)}
        </Typography>
      </Paper>

      {/* Points System */}
      <Box sx={{ mb: 2 }}>
        <PointsDisplay variant="detailed" />
      </Box>

      {/* Exchange Controls */}
      <Box sx={{ mb: 2 }}>
        <ExchangeControls />
      </Box>

      {/* Next Pieces */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
        <Typography variant="h6" sx={{ color: '#ffd700', mb: 1 }}>
          NEXT
        </Typography>
        {nextPieces?.slice(0, 5).map(renderNextPiece) || []}
      </Paper>

    </Box>
  )
}