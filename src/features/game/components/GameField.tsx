'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Box, Paper } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { Tetromino } from '../utils/tetromino'
import { TETROMINO_TYPES } from '@/types/game'
import SpinDisplay from './SpinDisplay'

interface GameFieldProps {
  width?: number
  height?: number
}

const GRID_WIDTH = 10
const GRID_HEIGHT = 20
const CELL_SIZE = 32

export default function GameField({ width, height }: GameFieldProps) {
  const { field, isGameRunning, currentPiece } = useSelector((state: RootState) => state.game)
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
  

  // 現在のピースを含む表示フィールドを生成（最適化版）
  const displayField = useMemo(() => {
    // ベースフィールドをコピー（配置済みブロックのみ）
    const newField = field.map(row => [...row])
    
    // 現在のピースを追加（最適化：事前計算とキャッシュ）
    if (currentPiece.type) {
      const tetrominoType = TETROMINO_TYPES[currentPiece.type as keyof typeof TETROMINO_TYPES]
      if (tetrominoType?.rotations?.[currentPiece.rotation]) {
        const shape = tetrominoType.rotations[currentPiece.rotation]
        const pieceTypeNumber = Object.keys(TETROMINO_TYPES).indexOf(currentPiece.type) + 1
        
        // ループを最適化：直接アクセスで高速化
        for (let row = 0; row < shape.length; row++) {
          for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
              const x = currentPiece.x + col
              const y = currentPiece.y + row
              
              // 境界チェックを最小限に
              if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
                newField[y][x] = pieceTypeNumber
              }
            }
          }
        }
      }
    }
    
    return newField
  }, [field, currentPiece.type, currentPiece.x, currentPiece.y, currentPiece.rotation])

  // セルレンダリング（最適化版：メモ化とGPU加速）
  const renderCell = React.useCallback((row: number, col: number) => {
    const cellValue = displayField[row][col]
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
          // トランジションを無効化してパフォーマンス向上
          transition: 'none',
          // 個別セルのGPU加速
          willChange: isEmpty ? 'auto' : 'transform, background-color',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          // レンダリング最適化
          contain: 'layout style paint',
          // 空セルは装飾なしで軽量化
          '&::after': isEmpty ? {} : {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 100%)',
            pointerEvents: 'none',
            willChange: 'transform',
            transform: 'translate3d(0, 0, 0)'
          }
        }}
      />
    )
  }, [cellSize, displayField])

  // 色マッピングを事前定義（毎回の計算を回避）
  const cellColors = React.useMemo(() => ({
    1: '#00f5ff', // I piece - cyan
    2: '#ffd700', // O piece - yellow
    3: '#a020f0', // T piece - purple
    4: '#00ff00', // S piece - green
    5: '#ff0000', // Z piece - red
    6: '#0000ff', // J piece - blue
    7: '#ff8c00', // L piece - orange
  }), [])

  const getCellColor = React.useCallback((cellValue: number | null) => {
    if (cellValue === null || cellValue === 0) return 'transparent'
    return cellColors[cellValue as keyof typeof cellColors] || '#666'
  }, [cellColors])

  // currentPieceは表示フィールドに含まれるので別途描画不要

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
        // GPU加速でフィールド全体を最適化
        willChange: 'transform, opacity',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(0,255,136,0.1) 0%, transparent 50%, rgba(0,255,136,0.1) 100%)',
          pointerEvents: 'none',
          willChange: 'transform',
          transform: 'translate3d(0, 0, 0)'
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
          margin: '8px', // 枠との適切な間隔を確保
          // グリッド全体のGPU加速
          willChange: 'transform, contents',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          // グリッド描画の最適化
          contain: 'layout style paint'
        }}
      >
        {displayField.map((row, rowIndex) =>
          row.map((cell, colIndex) => renderCell(rowIndex, colIndex))
        )}
      </Box>
      {/* currentPieceは表示フィールドに含まれる */}
      
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