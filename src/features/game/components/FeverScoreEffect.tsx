'use client'

import React from 'react'
import { Box } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'

export default function FeverScoreEffect() {
  const { feverMode } = useSelector((state: RootState) => state.game)

  if (!feverMode.isActive) {
    return null
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 15, // フィーバーエフェクトより上
        overflow: 'hidden',
      }}
    >
      {/* Stage 4: スコア表示の光る演出 - 全体的な金色の光 */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '200px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 50%, transparent 100%)',
          animation: 'scoreGlow 2.5s ease-in-out infinite alternate', // よりゆっくりと
          '@keyframes scoreGlow': {
            '0%': { 
              opacity: 0.15, // より控えめな透明度
              transform: 'scale(1)',
              filter: 'brightness(1)',
            },
            '100%': { 
              opacity: 0.35, // より控えめな透明度
              transform: 'scale(1.05)', // より控えめなスケール
              filter: 'brightness(1.2)', // より控えめな明度
            },
          },
        }}
      />

      {/* タイマーの赤色脈動エフェクト */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '150px',
          height: '60px',
          background: 'radial-gradient(circle, rgba(255, 68, 68, 0.2) 0%, rgba(255, 34, 34, 0.1) 50%, transparent 100%)',
          animation: 'timerPulse 1.5s ease-in-out infinite alternate', // よりゆっくりと
          '@keyframes timerPulse': {
            '0%': { 
              opacity: 0.2, // より控えめな透明度
              transform: 'translateX(-50%) scale(1)',
            },
            '100%': { 
              opacity: 0.4, // より控えめな透明度
              transform: 'translateX(-50%) scale(1.02)', // より控えめなスケール
            },
          },
        }}
      />
    </Box>
  )
}