'use client'

import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

export default function FeverModeEffects() {
  const { feverMode } = useSelector((state: RootState) => state.game)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    if (!feverMode.isActive) {
      setParticles([])
      return
    }

    // パーティクル生成・更新ループ
    const interval = setInterval(() => {
      setParticles(prev => {
        // 既存パーティクルの更新
        const updatedParticles = prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
            vy: particle.vy + 0.1, // 重力効果
          }))
          .filter(particle => particle.life > 0 && particle.y < window.innerHeight)

        // 新しいパーティクル追加（最大8個に制限）
        if (updatedParticles.length < 8) {
          const newParticles = Array.from({ length: 2 }, (_, i) => ({
            id: Date.now() + i,
            x: Math.random() * window.innerWidth,
            y: -10,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 2 + 1,
            life: 60 + Math.random() * 60, // 1-2秒のライフタイム
            maxLife: 120,
          }))
          
          return [...updatedParticles, ...newParticles]
        }

        return updatedParticles
      })
    }, 50) // 50ms間隔で更新（軽量化）

    return () => clearInterval(interval)
  }, [feverMode.isActive])

  if (!feverMode.isActive || particles.length === 0) {
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
        zIndex: 10,
        overflow: 'hidden',
      }}
    >
      {particles.map(particle => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: 4,
            height: 4,
            backgroundColor: '#ff0000',
            borderRadius: '50%',
            opacity: particle.life / particle.maxLife,
            boxShadow: '0 0 6px #ff0000',
            transform: 'translate(-50%, -50%)',
            animation: 'sparkle 1s infinite',
            '@keyframes sparkle': {
              '0%': { transform: 'translate(-50%, -50%) scale(1)' },
              '50%': { transform: 'translate(-50%, -50%) scale(1.5)' },
              '100%': { transform: 'translate(-50%, -50%) scale(1)' },
            },
          }}
        />
      ))}
      
      {/* フィーバーモード背景オーバーレイ */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(255, 0, 0, 0.1) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite alternate',
          '@keyframes pulse': {
            '0%': { opacity: 0.3 },
            '100%': { opacity: 0.1 },
          },
        }}
      />
    </Box>
  )
}