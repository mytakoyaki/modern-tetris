'use client'

import React, { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
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

const FeverModeEffects = React.memo(() => {
  const { feverMode } = useSelector((state: RootState) => state.game)
  const [particles, setParticles] = useState<Particle[]>([])
  const [activationStage, setActivationStage] = useState(0) // 0: inactive, 1-6: stages
  const [showFlash, setShowFlash] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [showEndDarkness, setShowEndDarkness] = useState(false)
  const [wasActive, setWasActive] = useState(false)
  const [showStartMessage, setShowStartMessage] = useState(false)

  // フィーバーモード状態管理
  useEffect(() => {
    if (feverMode.isActive && !wasActive) {
      // フィーバーモード開始
      setWasActive(true)
      setIsEnding(false)
      
      if (activationStage === 0) {
        // Stage 1: フィーバー開始メッセージ表示（短縮）
        setShowStartMessage(true)
        setActivationStage(1)
        
        // Stage 2: 瞬間的な画面フラッシュ（短縮）
        setTimeout(() => {
          setShowFlash(true)
          setShowStartMessage(false)
          setTimeout(() => setShowFlash(false), 200) // 200msに短縮
        }, 600) // 600msに短縮
        
        // Stage 3: フィールド境界線の脈動開始 (800ms後)
        setTimeout(() => setActivationStage(3), 800)
        
        // Stage 4: パーティクル放出 (1000ms後)
        setTimeout(() => setActivationStage(4), 1000)
        
        // Stage 5: スコア表示の光る演出 (1200ms後)
        setTimeout(() => setActivationStage(5), 1200)
        
        // Stage 6: 背景色の変化 (1400ms後)
        setTimeout(() => setActivationStage(6), 1400)
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
        setTimeout(() => setShowEndDarkness(false), 300) // 300msに短縮
        
        // TODO: フィーバー終了音の再生
        // playSound('fever_end')
      }, 800)
      
      // Step 3: 通常状態にスムーズに戻る (1200ms後)
      setTimeout(() => {
        setActivationStage(0)
        setIsEnding(false)
        setParticles([])
        setShowFlash(false)
        setShowStartMessage(false)
      }, 1200)
    }
  }, [feverMode.isActive, wasActive, activationStage])

  useEffect(() => {
    if ((!feverMode.isActive && !isEnding) || activationStage < 4) {
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

        // 新しいパーティクル追加（最大2個に削減）
        if (updatedParticles.length < 2) {
          const newParticles = [{
            id: Date.now(),
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 10,
            vx: (Math.random() - 0.5) * 0.6, // 速度を下げる
            vy: -(Math.random() * 0.3 + 0.3), // 速度を下げる
            life: 40 + Math.random() * 20, // 短縮（0.8-1秒）
            maxLife: 60,
            color: '#FFD700',
            size: 1.5, // サイズを小さく
            rotation: 0,
            rotationSpeed: 0,
          }]
          
          return [...updatedParticles, ...newParticles]
        }

        return updatedParticles
      })
    }, 300) // 300ms間隔に戻す

    return () => clearInterval(interval)
  }, [feverMode.isActive, isEnding, activationStage])

  if (!feverMode.isActive && !showFlash && !showStartMessage) {
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
      {/* フィーバー開始メッセージ（控えめに） */}
      {showStartMessage && (
        <Box
          sx={{
            position: 'absolute',
            top: '20%',
            right: '5%',
            width: 'auto',
            maxWidth: '300px',
            zIndex: 30,
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '8px',
            padding: '12px 16px',
            border: '1px solid rgba(255, 215, 0, 0.6)',
            animation: 'feverMessageIn 0.4s ease-out',
            '@keyframes feverMessageIn': {
              '0%': { 
                opacity: 0, 
                transform: 'translateX(50px)',
              },
              '100%': { 
                opacity: 1, 
                transform: 'translateX(0)',
              },
            },
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#FFD700',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                animation: 'feverTextGlow 1s ease-in-out infinite alternate',
                mb: 0.5,
                '@keyframes feverTextGlow': {
                  '0%': { 
                    textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                  },
                  '100%': { 
                    textShadow: '0 0 15px rgba(255, 215, 0, 0.8)',
                  },
                },
              }}
            >
              FEVER MODE!
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#FF8C00',
                fontWeight: 500,
                fontSize: '0.8rem',
                textShadow: '0 0 5px rgba(255, 140, 0, 0.5)',
              }}
            >
              4x Score • Free Exchanges
            </Typography>
          </Box>
        </Box>
      )}

      {/* Stage 2: 瞬間的な画面フラッシュ（控えめに） */}
      {showFlash && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 140, 0, 0.15) 70%, transparent 100%)',
            animation: 'feverFlash 200ms ease-out',
            zIndex: 25,
            '@keyframes feverFlash': {
              '0%': { opacity: 0.4 },
              '50%': { opacity: 0.2 },
              '100%': { opacity: 0 },
            },
          }}
        />
      )}

      {/* Stage 6: 背景色の変化（控えめに） */}
      {activationStage >= 6 && (
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
              '0%': { opacity: 0.4 },
              '100%': { opacity: 0.6 },
            },
          }}
        />
      )}

      {/* 金色のオーラエフェクト - 控えめに */}
      {activationStage >= 5 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.08,
            backgroundColor: 'rgba(255, 215, 0, 0.08)',
            transform: 'translate3d(0, 0, 0)', // GPU加速
            willChange: 'opacity', // 最適化
            animation: 'goldenAura 3s ease-in-out infinite alternate',
            pointerEvents: 'none',
            '@keyframes goldenAura': {
              '0%': { opacity: 0.05 },
              '100%': { opacity: 0.12 },
            },
          }}
        />
      )}

      {/* フィールド全体の微かな震え（控えめに） */}
      {activationStage >= 3 && (
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
              '25%': { transform: 'translate3d(0.1px, 0.05px, 0)' },
              '50%': { transform: 'translate3d(-0.05px, 0.1px, 0)' },
              '75%': { transform: 'translate3d(0.05px, -0.05px, 0)' },
              '100%': { transform: 'translate3d(0px, 0px, 0)' },
            },
          }}
        />
      )}
      
      {/* Stage 4: パーティクル放出（控えめに・GPU加速） */}
      {activationStage >= 4 && particles.map(particle => (
        <Box
          key={particle.id}
          sx={{
            position: 'absolute',
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: '#FFD700',
            borderRadius: '50%',
            opacity: particle.life / particle.maxLife * 0.6,
            transform: `translate3d(-50%, -50%, 0)`, // GPU加速
            willChange: 'transform, opacity', // 最適化
            boxShadow: '0 0 4px rgba(255, 215, 0, 0.4)',
          }}
        />
      ))}
      
      {/* フィーバー終了時の暗闇演出（控えめに） */}
      {showEndDarkness && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 35,
            animation: 'endDarkness 300ms ease-in-out',
            '@keyframes endDarkness': {
              '0%': { opacity: 0 },
              '50%': { opacity: 1 },
              '100%': { opacity: 0 },
            },
          }}
        />
      )}

      {/* Stage 3: フィールド境界線の脈動開始（控えめに） */}
      {activationStage >= 3 && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: '2px solid rgba(255, 215, 0, 0.6)',
            transform: 'translate3d(0, 0, 0)', // GPU加速
            willChange: 'opacity, box-shadow', // 最適化
            animation: 'feverBorder 2s ease-in-out infinite alternate',
            '@keyframes feverBorder': {
              '0%': { 
                opacity: 0.4,
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
              },
              '100%': { 
                opacity: 0.7,
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
              },
            },
          }}
        />
      )}

      {/* テトリス枠からの光差し込み演出（控えめに） */}
      {activationStage >= 4 && (
        <>
          {/* 上からの光 */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              left: '10%',
              width: '80%',
              height: '200px',
              background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.06) 30%, rgba(255, 215, 0, 0.02) 70%, transparent 100%)',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'opacity',
              animation: 'lightFromTop 3s ease-in-out infinite alternate',
              '@keyframes lightFromTop': {
                '0%': { opacity: 0.3 },
                '100%': { opacity: 0.6 },
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
              background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 215, 0, 0.05) 30%, rgba(255, 215, 0, 0.02) 70%, transparent 100%)',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'opacity',
              animation: 'lightFromLeft 3s ease-in-out infinite alternate',
              '@keyframes lightFromLeft': {
                '0%': { opacity: 0.2 },
                '100%': { opacity: 0.5 },
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
              background: 'linear-gradient(270deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 215, 0, 0.05) 30%, rgba(255, 215, 0, 0.02) 70%, transparent 100%)',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'opacity',
              animation: 'lightFromRight 3.5s ease-in-out infinite alternate',
              '@keyframes lightFromRight': {
                '0%': { opacity: 0.2 },
                '100%': { opacity: 0.5 },
              },
            }}
          />
          
          {/* 下からの光（控えめに） */}
          <Box
            sx={{
              position: 'absolute',
              bottom: -20,
              left: '20%',
              width: '60%',
              height: '120px',
              background: 'linear-gradient(0deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.04) 30%, rgba(255, 215, 0, 0.01) 70%, transparent 100%)',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'opacity',
              animation: 'lightFromBottom 4s ease-in-out infinite alternate',
              '@keyframes lightFromBottom': {
                '0%': { opacity: 0.15 },
                '100%': { opacity: 0.4 },
              },
            }}
          />
        </>
      )}

      {/* フィーバー中の継続的な視覚フィードバック（控えめに） */}
      {feverMode.isActive && activationStage >= 5 && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.05) 0%, transparent 70%)',
            animation: 'feverCenterGlow 4s ease-in-out infinite alternate',
            pointerEvents: 'none',
            '@keyframes feverCenterGlow': {
              '0%': { 
                opacity: 0.2,
                transform: 'translate(-50%, -50%) scale(1)',
              },
              '100%': { 
                opacity: 0.4,
                transform: 'translate(-50%, -50%) scale(1.1)',
              },
            },
          }}
        />
      )}
    </Box>
  )
})

FeverModeEffects.displayName = 'FeverModeEffects'

export default FeverModeEffects