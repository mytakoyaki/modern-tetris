'use client'

import React, { useEffect, useState } from 'react'
import { Box, Paper } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { Tetromino } from '../utils/tetromino'
import SpinDisplay from './SpinDisplay'

interface GameFieldProps {
  width?: number
  height?: number
}

const GRID_WIDTH = 10
const GRID_HEIGHT = 20
const CELL_SIZE = 32

export default function GameField({ width, height }: GameFieldProps) {
  const { field, currentPiece, isGameRunning } = useSelector((state: RootState) => state.game)
  const [fieldSize, setFieldSize] = useState({ width: 336, height: 656 })
  
  useEffect(() => {
    const calculateFieldSize = () => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      // 横向きレイアウトの場合
      if (window.innerWidth > window.innerHeight) {
        const availableWidth = viewportWidth - 400 - 32 // サイドバー分とパディング
        const availableHeight = viewportHeight - 32 // パディング
        
        const maxWidth = availableWidth * 0.8
        const maxHeight = availableHeight * 0.9
        
        // アスペクト比を維持しながらサイズを決定
        const aspectRatio = (GRID_WIDTH * CELL_SIZE) / (GRID_HEIGHT * CELL_SIZE)
        
        let newWidth, newHeight
        if (maxWidth / aspectRatio <= maxHeight) {
          newWidth = maxWidth
          newHeight = maxWidth / aspectRatio
        } else {
          newHeight = maxHeight
          newWidth = maxHeight * aspectRatio
        }
        
        setFieldSize({ width: newWidth, height: newHeight })
      } else {
        // 縦向きレイアウトの場合
        const availableWidth = viewportWidth - 32
        const availableHeight = viewportHeight - 200 - 32 // 下部コントロール分
        
        const maxWidth = availableWidth * 0.9
        const maxHeight = availableHeight * 0.8
        
        const aspectRatio = (GRID_WIDTH * CELL_SIZE) / (GRID_HEIGHT * CELL_SIZE)
        
        let newWidth, newHeight
        if (maxWidth / aspectRatio <= maxHeight) {
          newWidth = maxWidth
          newHeight = maxWidth / aspectRatio
        } else {
          newHeight = maxHeight
          newWidth = maxHeight * aspectRatio
        }
        
        setFieldSize({ width: newWidth, height: newHeight })
      }
    }
    
    calculateFieldSize()
    window.addEventListener('resize', calculateFieldSize)
    
    return () => window.removeEventListener('resize', calculateFieldSize)
  }, [])
  
  // プロパティで指定されたサイズがある場合はそれを使用
  const finalWidth = width || fieldSize.width
  const finalHeight = height || fieldSize.height
  
  // セルサイズを動的に計算
  const cellSize = Math.min(
    (finalWidth - 16) / GRID_WIDTH,  // パディングを考慮
    (finalHeight - 16) / GRID_HEIGHT
  )

  const renderCell = (row: number, col: number) => {
    const cellValue = field[row][col]
    const isEmpty = cellValue === null || cellValue === 0
    
    return (
      <Box
        key={`${row}-${col}`}
        sx={{
          width: cellSize,
          height: cellSize,
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

  const getCellColor = (cellValue: number | null) => {
    if (cellValue === null || cellValue === 0) return 'transparent'
    
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
              left: block.x * cellSize + 8, // +8 for margin
              top: block.y * cellSize + 8,
              width: cellSize,
              height: cellSize,
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
        width: finalWidth,
        height: finalHeight,
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        border: '2px solid #00ff88',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          gridTemplateColumns: `repeat(${GRID_WIDTH}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${GRID_HEIGHT}, ${cellSize}px)`,
          gap: 0,
          position: 'relative',
          zIndex: 1,
          margin: '8px' // 枠との適切な間隔を確保
        }}
      >
        {field.map((row, rowIndex) =>
          row.map((cell, colIndex) => renderCell(rowIndex, colIndex))
        )}
      </Box>
      {renderCurrentPiece()}
      
      {/* Spin display overlay */}
      <SpinDisplay />
      
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