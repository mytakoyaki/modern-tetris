'use client'

import React, { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'

interface DangerParticle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
}

export default function DangerModeEffects() {
  const { field, isGameRunning, isGameOver, currentPiece } = useSelector((state: RootState) => state.game)
  const [particles, setParticles] = useState<DangerParticle[]>([])
  const [gameStarted, setGameStarted] = useState(false)
  
  // ゲーム開始の検出
  useEffect(() => {
    if (isGameRunning && !isGameOver) {
      // ゲーム開始から十分に待ってからピンチ判定を有効にする
      const timer = setTimeout(() => {
        setGameStarted(true)
      }, 1000) // 1秒待機（より安全に）
      
      return () => clearTimeout(timer)
    } else {
      setGameStarted(false)
    }
  }, [isGameRunning, isGameOver])
  
  // ピンチ状態の判定（ゲーム開始後かつ上部5行にブロックがある場合）
  const hasBlocksInDangerZone = field && 
    field.length === 20 && 
    field.slice(0, 5).some(row => 
      row && row.some(cell => cell !== null && cell !== 0)
    )
    
  const isDangerMode = gameStarted && 
    isGameRunning && 
    !isGameOver && 
    currentPiece.type !== null && // 現在のピースが存在する
    hasBlocksInDangerZone

  useEffect(() => {
    if (!isDangerMode) {
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
            vy: particle.vy + 0.02, // 微細な重力効果（湧き上がりを維持）
          }))
          .filter(particle => particle.life > 0 && particle.y > -50 && particle.y < window.innerHeight + 50)

        // 新しいパーティクル追加（最大8個に制限）
        if (updatedParticles.length < 8) {
          const newParticles = Array.from({ length: 2 }, (_, i) => ({
            id: Date.now() + i,
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 10, // 下から湧き上がる
            vx: (Math.random() - 0.5) * 2, // 水平移動を控えめに
            vy: -(Math.random() * 1.5 + 0.5), // 上向きに湧き上がる
            life: 80 + Math.random() * 80, // 1.3-2.7秒のライフタイム
            maxLife: 160,
          }))
          
          return [...updatedParticles, ...newParticles]
        }

        return updatedParticles
      })
    }, 40) // 40ms間隔で更新（より活発に）

    return () => clearInterval(interval)
  }, [isDangerMode])

  if (!isDangerMode || particles.length === 0) {
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
        zIndex: 5, // フィーバーより低い
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
            width: 5,
            height: 5,
            backgroundColor: '#ff2222',
            borderRadius: '50%',
            opacity: Math.pow(particle.life / particle.maxLife, 0.8), // 徐々に消える感じを強化
            boxShadow: `0 0 ${8 + (particle.life / particle.maxLife) * 8}px #ff2222, 0 0 ${16 + (particle.life / particle.maxLife) * 16}px rgba(255, 34, 34, 0.5)`, // ライフに応じて光も変化
            transform: 'translate(-50%, -50%)',
            animation: `dangerSparkle ${1 + (particle.life / particle.maxLife)}s infinite`, // ライフに応じてアニメーション速度変化
            '@keyframes dangerSparkle': {
              '0%': { 
                transform: 'translate(-50%, -50%) scale(0.8)',
                filter: 'brightness(0.8)',
              },
              '50%': { 
                transform: 'translate(-50%, -50%) scale(1.2)',
                filter: 'brightness(1.2)',
              },
              '100%': { 
                transform: 'translate(-50%, -50%) scale(0.8)',
                filter: 'brightness(0.8)',
              },
            },
          }}
        />
      ))}
      
      {/* ピンチ時背景オーバーレイ */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(255, 34, 34, 0.2) 0%, rgba(255, 68, 68, 0.1) 50%, transparent 80%)',
          animation: 'dangerPulse 1s ease-in-out infinite alternate',
          '@keyframes dangerPulse': {
            '0%': { 
              opacity: 0.4,
              transform: 'scale(1)',
            },
            '100%': { 
              opacity: 0.8,
              transform: 'scale(1.02)',
            },
          },
        }}
      />
      
      {/* 緊急感を表す境界線エフェクト */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: '2px solid rgba(255, 34, 34, 0.6)',
          animation: 'dangerBorder 0.8s ease-in-out infinite alternate',
          '@keyframes dangerBorder': {
            '0%': { 
              borderColor: 'rgba(255, 34, 34, 0.6)',
              boxShadow: 'inset 0 0 0 0 rgba(255, 34, 34, 0.1)',
            },
            '100%': { 
              borderColor: 'rgba(255, 102, 102, 0.9)',
              boxShadow: 'inset 0 0 20px 5px rgba(255, 34, 34, 0.2)',
            },
          },
        }}
      />
    </Box>
  )
}