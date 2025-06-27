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
      {/* スコア表示エリアの光る演出 - 強化 */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '250px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0.15) 50%, transparent 100%)',
          animation: 'scoreGlow 2s ease-in-out infinite alternate',
          '@keyframes scoreGlow': {
            '0%': { 
              opacity: 0.2,
              transform: 'scale(1)',
              filter: 'brightness(1)',
            },
            '100%': { 
              opacity: 0.4,
              transform: 'scale(1.1)',
              filter: 'brightness(1.3)',
            },
          },
        }}
      />

      {/* タイマーエリアの光る演出 */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          right: '5%',
          width: '100px',
          height: '60px',
          background: 'radial-gradient(circle, rgba(255, 140, 0, 0.3) 0%, rgba(255, 140, 0, 0.15) 50%, transparent 100%)',
          animation: 'timerGlow 1.5s ease-in-out infinite alternate',
          '@keyframes timerGlow': {
            '0%': { 
              opacity: 0.25,
              transform: 'scale(1)',
            },
            '100%': { 
              opacity: 0.5,
              transform: 'scale(1.05)',
            },
          },
        }}
      />

      {/* フィーバーゲージエリアの光る演出 */}
      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          right: '5%',
          width: '200px',
          height: '80px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.1) 50%, transparent 100%)',
          animation: 'gaugeGlow 2.5s ease-in-out infinite alternate',
          '@keyframes gaugeGlow': {
            '0%': { 
              opacity: 0.15,
              transform: 'scale(1)',
            },
            '100%': { 
              opacity: 0.35,
              transform: 'scale(1.08)',
            },
          },
        }}
      />

      {/* 全体的な金色の光のオーラ */}
      <Box
        sx={{
          position: 'absolute',
          top: '5%',
          right: '2%',
          width: '300px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(255, 215, 0, 0.08) 0%, rgba(255, 140, 0, 0.04) 50%, transparent 100%)',
          animation: 'overallGlow 3s ease-in-out infinite alternate',
          '@keyframes overallGlow': {
            '0%': { 
              opacity: 0.6,
              transform: 'scale(1)',
            },
            '100%': { 
              opacity: 1,
              transform: 'scale(1.05)',
            },
          },
        }}
      />

      {/* スコア獲得時の特別なエフェクト */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
          animation: 'scorePulse 1s ease-in-out infinite alternate',
          '@keyframes scorePulse': {
            '0%': { 
              opacity: 0.3,
              transform: 'translate(-50%, -50%) scale(1)',
            },
            '100%': { 
              opacity: 0.6,
              transform: 'translate(-50%, -50%) scale(1.2)',
            },
          },
        }}
      />

      {/* フィーバー中の継続的な視覚フィードバック - 強化 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.02) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 140, 0, 0.02) 0%, transparent 50%)',
          animation: 'backgroundShift 4s ease-in-out infinite alternate',
          '@keyframes backgroundShift': {
            '0%': { 
              opacity: 0.5,
              transform: 'scale(1)',
            },
            '100%': { 
              opacity: 1,
              transform: 'scale(1.02)',
            },
          },
        }}
      />
    </Box>
  )
}