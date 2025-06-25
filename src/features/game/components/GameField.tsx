'use client'

import React from 'react'
import { Box, Paper } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { Tetromino } from '../utils/tetromino'

interface GameFieldProps {
  width?: number
  height?: number
}

const GRID_WIDTH = 10
const GRID_HEIGHT = 20
const CELL_SIZE = 32

export default function GameField({ width = 320, height = 640 }: GameFieldProps) {
  const { field, currentPiece, isGameRunning } = useSelector((state: RootState) => state.game)

  const renderCell = (row: number, col: number) => {
    const cellValue = field[row][col]
    const isEmpty = cellValue === 0
    
    return (
      <Box
        key={`${row}-${col}`}
        sx={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: isEmpty ? 'transparent' : getCellColor(cellValue),
          position: 'relative',
          transition: 'all 0.1s ease',
          '&::after': isEmpty ? {} : {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.3) 100%)',
            pointerEvents: 'none'
          }
        }}
      />
    )
  }

  const getCellColor = (cellValue: number) => {
    const colors = {
      1: '#00f5ff', // I piece - cyan
      2: '#ffd700', // O piece - yellow
      3: '#a020f0', // T piece - purple
      4: '#00ff00', // S piece - green
      5: '#ff0000', // Z piece - red
      6: '#0000ff', // J piece - blue
      7: '#ff8c00', // L piece - orange
    }
    return colors[cellValue as keyof typeof colors] || '#666'
  }

  const renderCurrentPiece = () => {
    if (!currentPiece.type || !isGameRunning) return null

    const tetromino = new Tetromino(
      currentPiece.type,
      currentPiece.x,
      currentPiece.y
    )
    tetromino.rotation = currentPiece.rotation
    const blocks = tetromino.getBlocks()

    return (
      <>
        {blocks.map((block, index) => (
          <Box
            key={`current-${index}`}
            sx={{
              position: 'absolute',
              left: block.x * CELL_SIZE + 8, // +8 for padding
              top: block.y * CELL_SIZE + 8,
              width: CELL_SIZE,
              height: CELL_SIZE,
              backgroundColor: tetromino.getColor(),
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 0.5,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              zIndex: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.3) 100%)',
                pointerEvents: 'none'
              }
            }}
          />
        ))}
      </>
    )
  }

  return (
    <Paper
      elevation={3}
      sx={{
        width,
        height,
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        border: '2px solid #00ff88',
        borderRadius: 2,
        padding: 1,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(0,255,136,0.1) 0%, transparent 50%, rgba(0,255,136,0.1) 100%)',
          pointerEvents: 'none'
        }
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_HEIGHT}, ${CELL_SIZE}px)`,
          gap: 0,
          position: 'relative',
          zIndex: 1
        }}
      >
        {field.map((row, rowIndex) =>
          row.map((cell, colIndex) => renderCell(rowIndex, colIndex))
        )}
      </Box>
      {renderCurrentPiece()}
      
      {!isGameRunning && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          <Box
            sx={{
              color: '#00ff88',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
            }}
          >
            PRESS START
          </Box>
        </Box>
      )}
    </Paper>
  )
}