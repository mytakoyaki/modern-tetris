'use client'

import React from 'react'
import { Box, Paper, Typography, Divider } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import PointsDisplay from './PointsDisplay'
import ExchangeControls from './ExchangeControls'
import ProgressGauge from './ProgressGauge'

interface SidebarProps {
  position: 'left' | 'right'
}

export default function Sidebar({ position }: SidebarProps) {
  const {
    score,
    level,
    lines,
    gameTime,
    feverMode,
    nextPieces,
    holdSlots,
    currentRank,
    rankProgress,
    lastSpin,
    backToBackCount,
    comboCount,
    pointSystem,
    levelGaugeProgress,
    blocksPlaced
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
      <Box sx={{ width: '100%', padding: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          {/* 左列 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Hold Slots */}
            <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
              <Typography variant="h6" sx={{ color: '#00ff88', mb: 1.5, fontSize: '1.1rem', textAlign: 'center' }}>
            HOLD
          </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          {[0, 1].map(renderHoldSlot)}
              </Box>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.8rem', textAlign: 'center', display: 'block', mt: 1 }}>
            Cost: 15P each
          </Typography>
        </Paper>

        {/* Level & Status */}
            <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
              <Typography variant="h6" sx={{ color: '#ffd700', mb: 1.5, fontSize: '1.1rem', textAlign: 'center' }}>
            LEVEL
          </Typography>
              <Typography variant="h4" sx={{ color: '#fff', mb: 1.5, fontSize: '1.8rem', textAlign: 'center' }}>
            {level}
          </Typography>
              
              {/* Level Progress Gauge */}
              <Box sx={{ mb: 1.5 }}>
                <ProgressGauge
                  label="Level Progress"
                  current={levelGaugeProgress}
                  max={30000}
                  color="#ffd700"
                  showPercentage={true}
                  height={6}
                />
              </Box>
              
              <Divider sx={{ my: 1.5, backgroundColor: '#333' }} />
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>
            Lines: {formatNumber(lines)}
          </Typography>
        </Paper>
          </Box>

          {/* 右列 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Fever Mode */}
            <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
              <Typography variant="h6" sx={{ color: '#ff69b4', mb: 1.5, fontSize: '1.1rem', textAlign: 'center' }}>
                FEVER
          </Typography>
          {feverMode.isActive ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#ff69b4', mb: 1.5, fontSize: '1.4rem' }}>
                ACTIVE
              </Typography>
                  <Typography variant="body2" sx={{ color: '#ff69b4', fontSize: '0.9rem', mb: 1.5 }}>
                Time: {Math.ceil(feverMode.timeRemaining / 1000)}s
              </Typography>
                  
                  {/* Fever Time Gauge */}
                  <Box sx={{ mb: 1 }}>
                    <ProgressGauge
                      label="Fever Time"
                      current={feverMode.timeRemaining}
                      max={30000} // 30 seconds
                      color="#ff69b4"
                      showPercentage={false}
                      height={6}
                    />
                  </Box>
            </Box>
          ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ color: '#666', mb: 1.5, fontSize: '1rem' }}>
                Inactive
              </Typography>
                  <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem', mb: 1.5 }}>
                Next: {feverMode.blocksUntilActivation} blocks
              </Typography>
                  
                  {/* Fever Activation Gauge */}
                  <Box sx={{ mb: 1 }}>
                    <ProgressGauge
                      label="Activation"
                      current={20 - feverMode.blocksUntilActivation}
                      max={20}
                      color="#ff69b4"
                      showValues={true}
                      height={6}
                    />
                  </Box>
            </Box>
          )}
        </Paper>

        {/* Spin Statistics */}
        <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
              <Typography variant="h6" sx={{ color: '#a020f0', mb: 1.5, fontSize: '1.1rem', textAlign: 'center' }}>
                SPIN
          </Typography>
          
              <Box sx={{ textAlign: 'center' }}>
          {lastSpin?.type && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ color: '#00ff88', fontSize: '0.9rem' }}>
                Last: {lastSpin.type} {lastSpin.variant}
              </Typography>
            </Box>
          )}
          
          {backToBackCount > 0 && (
                  <Box sx={{ mb: 1.5 }}>
                    <Typography variant="body2" sx={{ color: '#ff8c00', fontSize: '0.9rem' }}>
                      B2B: {backToBackCount}
              </Typography>
            </Box>
          )}
          
          {comboCount > 0 && (
            <Box>
                    <Typography variant="body2" sx={{ color: '#ffd700', fontSize: '0.9rem' }}>
                Combo: {comboCount}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* 段位表示（2列分使用） */}
        <Paper sx={{ p: 2, mt: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)', gridColumn: 'span 2' }}>
          <Typography variant="h6" sx={{ color: '#ffd700', mb: 1.5, fontSize: '1.1rem', textAlign: 'center' }}>
            RANK
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h5" sx={{ color: '#ffd700', mb: 1, fontSize: '1.6rem' }}>
                {currentRank.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                Current Rank
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography variant="h5" sx={{ color: '#00ff88', mb: 1, fontSize: '1.6rem' }}>
                {rankProgress.nextRank?.name || 'MAX'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                Next Rank
              </Typography>
            </Box>
          </Box>
          
          {/* Rank Progress Gauge */}
          <Box sx={{ mb: 1 }}>
            <ProgressGauge
              label="Rank Progress"
              current={Math.round(rankProgress.progressToNext * 100)}
              max={100}
              color="#00ff88"
              showPercentage={true}
              height={8}
            />
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#fff', fontSize: '0.9rem' }}>
              Progress: {Math.round(rankProgress.progressToNext * 100)}%
            </Typography>
          </Box>
        </Paper>
      </Box>
    )
  }

  // Right sidebar
  return (
    <Box sx={{ width: '100%', padding: 1.5 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {/* 左列 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Score */}
          <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
            <Typography variant="h6" sx={{ color: '#00ff88', mb: 1.5, fontSize: '1.1rem', textAlign: 'center' }}>
          SCORE
        </Typography>
            <Typography variant="h4" sx={{ color: '#fff', mb: 1.5, fontSize: '1.8rem', textAlign: 'center' }}>
          {formatNumber(score)}
        </Typography>
            <Divider sx={{ my: 1.5, backgroundColor: '#333' }} />
            <Typography variant="body2" sx={{ color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>
          Points: {formatNumber(pointSystem?.totalPoints)}
        </Typography>
      </Paper>

          {/* Next Pieces */}
          <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
            <Typography variant="h6" sx={{ color: '#ffd700', mb: 1.5, fontSize: '1.1rem', textAlign: 'center' }}>
              NEXT
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              {nextPieces?.[0] && renderNextPiece(nextPieces[0], 0)}
            </Box>
          </Paper>

          {/* ゲームコントロールはuseGameEngineで処理 */}
        </Box>

        {/* 右列 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Points System */}
          <Box>
        <PointsDisplay variant="detailed" />
      </Box>

      {/* Exchange Controls */}
          <Box>
        <ExchangeControls />
      </Box>

          {/* Game Stats */}
          <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
            <Typography variant="h6" sx={{ color: '#00ff88', mb: 1.5, fontSize: '1.1rem', textAlign: 'center' }}>
              STATS
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                Blocks: {blocksPlaced}
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff', fontSize: '0.9rem', mb: 1 }}>
                Time: {Math.floor(gameTime / 1000)}s
              </Typography>
              <Typography variant="body2" sx={{ color: '#fff', fontSize: '0.9rem' }}>
                Lines: {lines}
        </Typography>
            </Box>
      </Paper>
        </Box>
      </Box>
    </Box>
  )
}