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
  color: string
  size: number
  rotation: number
  rotationSpeed: number
}

export default function FeverModeEffects() {
  const { feverMode } = useSelector((state: RootState) => state.game)
  const [particles, setParticles] = useState<Particle[]>([])
  const [activationStage, setActivationStage] = useState(0) // 0: inactive, 1-5: stages
  const [showFlash, setShowFlash] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [showEndDarkness, setShowEndDarkness] = useState(false)
  const [wasActive, setWasActive] = useState(false)

  // フィーバーモード状態管理
  useEffect(() => {
    if (feverMode.isActive && !wasActive) {
      // フィーバーモード開始
      setWasActive(true)
      setIsEnding(false)
      
      if (activationStage === 0) {
        // Stage 1: 瞬間的な画面フラッシュ（白→赤）
        setShowFlash(true)
        setActivationStage(1)
        
        setTimeout(() => setShowFlash(false), 200) // 200ms後にフラッシュ終了
        
        // Stage 2: フィールド境界線の脈動開始 (300ms後)
        setTimeout(() => setActivationStage(2), 300)
        
        // Stage 3: パーティクル放出 (500ms後)
        setTimeout(() => setActivationStage(3), 500)
        
        // Stage 4: スコア表示の光る演出 (700ms後)
        setTimeout(() => setActivationStage(4), 700)
        
        // Stage 5: 背景色の変化 (900ms後)
        setTimeout(() => setActivationStage(5), 900)
      }
    } else if (!feverMode.isActive && wasActive) {
      // フィーバーモード終了開始
      setIsEnding(true)
      setWasActive(false)
      
      // 終了演出のシーケンス
      // Step 1: パーティクルが中心に集まる
      setParticles(prev => prev.map(particle => ({
        ...particle,
        vx: (window.innerWidth / 2 - particle.x) * 0.05, // 中心に向かう速度
        vy: (window.innerHeight / 2 - particle.y) * 0.05,
        life: Math.max(particle.life, 30), // 終了演出のため延命
      })))
      
      // Step 2: 画面が一瞬暗くなる (800ms後)
      setTimeout(() => {
        setShowEndDarkness(true)
        setTimeout(() => setShowEndDarkness(false), 300) // 300ms間暗闇
        
        // TODO: フィーバー終了音の再生
        // playSound('fever_end')
      }, 800)
      
      // Step 3: 通常状態にスムーズに戻る (1200ms後)
      setTimeout(() => {
        setActivationStage(0)
        setIsEnding(false)
        setParticles([])
        setShowFlash(false)
      }, 1200)
    }
  }, [feverMode.isActive, wasActive])

  useEffect(() => {
    if ((!feverMode.isActive && !isEnding) || activationStage < 3) {
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
          }))
          .filter(particle => particle.life > 0 && particle.y > -50 && particle.y < window.innerHeight + 50)

        // 終了中は新しいパーティクルを生成しない
        if (isEnding || !feverMode.isActive) {
          return updatedParticles
        }

        // 新しいパーティクル追加（最大3個に制限・軽量化）
        if (updatedParticles.length < 3) {
          const newParticles = [{
            id: Date.now(),
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 10,
            vx: (Math.random() - 0.5) * 1,
            vy: -(Math.random() * 0.5 + 0.5),
            life: 60 + Math.random() * 40, // 短縮（1-1.7秒）
            maxLife: 100,
            color: '#FFD700', // 単一色で軽量化
            size: 1,
            rotation: 0,
          }]
          
          return [...updatedParticles, ...newParticles]
        }

        return updatedParticles
      })
    }, 200) // 200ms間隔で軽量化

    return () => clearInterval(interval)
  }, [feverMode.isActive, isEnding, activationStage])

  if (!feverMode.isActive && !showFlash) {
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
      {/* Stage 1: 瞬間的な画面フラッシュ（控えめ） */}
      {showFlash && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(255, 170, 0, 0.2) 70%, transparent 100%)',
            animation: 'feverFlash 200ms ease-out',
            zIndex: 20,
            '@keyframes feverFlash': {
              '0%': { opacity: 0.5 },
              '30%': { opacity: 0.3 },
              '100%': { opacity: 0 },
            },
          }}
        />
      )}

      {/* Stage 5: 背景色の変化（軽量化） */}
      {activationStage >= 5 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 215, 0, 0.02)',
            transform: 'translate3d(0, 0, 0)', // GPU加速
            willChange: 'opacity', // 最適化
            animation: 'feverPulse 3s ease-in-out infinite alternate',
            '@keyframes feverPulse': {
              '0%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        />
      )}

      {/* 金色のオーラエフェクト - 軽量化 */}
      {activationStage >= 4 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            transform: 'translate3d(0, 0, 0)', // GPU加速
            willChange: 'opacity', // 最適化
            animation: 'goldenAura 3s ease-in-out infinite alternate',
            pointerEvents: 'none',
            '@keyframes goldenAura': {
              '0%': { opacity: 0.05 },
              '100%': { opacity: 0.15 },
            },
          }}
        />
      )}

      {/* フィールド全体の非常に微かな震え（軽量化） */}
      {activationStage >= 2 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'translate3d(0, 0, 0)', // GPU加速
            willChange: 'transform', // 最適化
            animation: 'feverShake 0.5s infinite',
            '@keyframes feverShake': {
              '0%': { transform: 'translate3d(0px, 0px, 0)' },
              '50%': { transform: 'translate3d(0.1px, 0.1px, 0)' },
              '100%': { transform: 'translate3d(0px, 0px, 0)' },
            },
          }}
        />
      )}
      
      {/* Stage 3: パーティクル放出（軽量化・GPU加速） */}
      {activationStage >= 3 && particles.map(particle => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: 2, // 固定サイズで軽量化
            height: 2,
            backgroundColor: '#FFD700', // 固定色で軽量化
            borderRadius: '50%',
            opacity: particle.life / particle.maxLife * 0.6,
            transform: `translate3d(-50%, -50%, 0)`, // GPU加速
            willChange: 'transform, opacity', // 最適化
          }}
        />
      ))}
      
      {/* フィーバー終了時の暗闇演出 */}
      {showEndDarkness && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 25,
            animation: 'endDarkness 300ms ease-in-out',
            '@keyframes endDarkness': {
              '0%': { opacity: 0 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0 },
            },
          }}
        />
      )}

      {/* Stage 2: フィールド境界線の脈動開始（軽量化） */}
      {activationStage >= 2 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: '2px solid rgba(255, 215, 0, 0.6)',
            transform: 'translate3d(0, 0, 0)', // GPU加速
            willChange: 'opacity', // 最適化
            animation: 'feverBorder 2s ease-in-out infinite alternate',
            '@keyframes feverBorder': {
              '0%': { opacity: 0.6 },
              '100%': { opacity: 1 },
            },
          }}
        />
      )}

      {/* テトリス枠からの光差し込み演出 */}
      {activationStage >= 3 && (
        <>
          {/* 上からの光 */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              left: '10%',
              width: '80%',
              height: '200px',
              background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 215, 0, 0.08) 30%, rgba(255, 215, 0, 0.02) 70%, transparent 100%)',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'opacity',
              animation: 'lightFromTop 3s ease-in-out infinite alternate',
              '@keyframes lightFromTop': {
                '0%': { opacity: 0.4 },
                '100%': { opacity: 0.8 },
              },
            }}
          />
          
          {/* 左からの光 */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: -20,
              width: '150px',
              height: '80%',
              background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.06) 30%, rgba(255, 215, 0, 0.02) 70%, transparent 100%)',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'opacity',
              animation: 'lightFromLeft 2.5s ease-in-out infinite alternate',
              '@keyframes lightFromLeft': {
                '0%': { opacity: 0.3 },
                '100%': { opacity: 0.6 },
              },
            }}
          />
          
          {/* 右からの光 */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              right: -20,
              width: '150px',
              height: '80%',
              background: 'linear-gradient(270deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.06) 30%, rgba(255, 215, 0, 0.02) 70%, transparent 100%)',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'opacity',
              animation: 'lightFromRight 2.8s ease-in-out infinite alternate',
              '@keyframes lightFromRight': {
                '0%': { opacity: 0.3 },
                '100%': { opacity: 0.7 },
              },
            }}
          />
          
          {/* 下からの光（控えめ） */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -20,
              left: '20%',
              width: '60%',
              height: '120px',
              background: 'linear-gradient(0deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 215, 0, 0.04) 30%, rgba(255, 215, 0, 0.01) 70%, transparent 100%)',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'opacity',
              animation: 'lightFromBottom 3.5s ease-in-out infinite alternate',
              '@keyframes lightFromBottom': {
                '0%': { opacity: 0.2 },
                '100%': { opacity: 0.5 },
              },
            }}
          />
        </>
      )}
    </Box>
  )
}