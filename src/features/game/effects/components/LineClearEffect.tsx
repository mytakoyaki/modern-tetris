'use client'

import React, { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'

interface LineClearEffectProps {
  type: 'single' | 'double' | 'triple' | 'tetris' | 'tspin' | 'perfect'
  lines: number
  score: number
  isVisible: boolean
  onComplete: () => void
}

// 演出設定
const EFFECT_CONFIG = {
  single: {
    duration: 800,
    intensity: 'subtle',
    elements: ['lineGlow', 'particleBurst', 'scorePop'],
    colors: ['#00ff88'],
    shake: 0,
    scale: 1.0
  },
  double: {
    duration: 1000,
    intensity: 'subtle',
    elements: ['lineGlow', 'particleBurst', 'scorePop', 'colorWave'],
    colors: ['#00ff88', '#00cc6a'],
    shake: 2,
    scale: 1.05
  },
  triple: {
    duration: 1200,
    intensity: 'moderate',
    elements: ['lineExplosion', 'screenShake', 'colorWave', 'particleStorm'],
    colors: ['#00ff88', '#ffd700', '#ff8c00'],
    shake: 5,
    scale: 1.1
  },
  tetris: {
    duration: 2000,
    intensity: 'spectacular',
    elements: ['rainbowExplosion', 'screenFlash', 'tetrisLogo', 'soundWave', 'particleCascade'],
    colors: ['#00ff88', '#ffd700', '#ff8c00', '#ff6b6b', '#4ecdc4'],
    shake: 8,
    scale: 1.15
  },
  tspin: {
    duration: 2500,
    intensity: 'legendary',
    elements: ['spiralEffect', 'goldenAura', 'spinAnimation', 'technicalDisplay'],
    colors: ['#ffd700', '#ff8c00', '#ff4500'],
    shake: 6,
    scale: 1.12
  },
  perfect: {
    duration: 3500,
    intensity: 'mythical',
    elements: ['fullScreenExplosion', 'timeSlow', 'divineLight', 'achievementUnlock'],
    colors: ['#8a2be2', '#ffd700', '#00ff88', '#ff6b6b'],
    shake: 10,
    scale: 1.2
  }
}

export default function LineClearEffect({ 
  type, 
  lines, 
  score, 
  isVisible, 
  onComplete 
}: LineClearEffectProps) {
  const [stage, setStage] = useState(0)
  // 安定したeffectIDを使用（propsから受け取る想定）
  const [effectId] = useState(() => `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  const config = EFFECT_CONFIG[type]

  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      onComplete()
    }, config.duration)

    return () => clearTimeout(timer)
  }, [isVisible, config.duration, onComplete])

  if (!isVisible) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // GPU加速を有効化
        willChange: 'transform, opacity',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden'
      }}
    >
      {/* ライン消去種別表示 */}
      <motion.div
        key={`line-type-${effectId}`}
        initial={{ opacity: 0, scale: 0.5, y: -30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 30 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          pointerEvents: 'none',
          willChange: 'transform, opacity, scale',
          backfaceVisibility: 'hidden'
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: config.colors[0],
            fontWeight: 'bold',
            textShadow: `0 0 20px ${config.colors[0]}, 0 0 40px ${config.colors[0]}`,
            fontFamily: 'Consolas, monospace',
            fontSize: '2.5rem',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            // GPU加速のためのテキスト最適化
            willChange: 'transform, opacity',
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            textRendering: 'optimizeSpeed'
          }}
        >
          {type === 'single' ? 'SINGLE' : 
           type === 'double' ? 'DOUBLE' : 
           type === 'triple' ? 'TRIPLE' : 
           type === 'tetris' ? 'TETRIS!' : 
           type === 'tspin' ? 'T-SPIN!' : 
           type === 'perfect' ? 'PERFECT!' : type.toUpperCase()}
        </Typography>
      </motion.div>

      {/* パーティクル効果 */}
      <ParticleEffect type={type} config={config} effectId={effectId} />

      {/* スコア表示 */}
      <ScoreDisplay score={score} type={type} config={config} effectId={effectId} />

      {/* 特殊効果 */}
      {type === 'tetris' && <TetrisSpecialEffect effectId={effectId} />}
      {type === 'tspin' && <TSpinSpecialEffect effectId={effectId} />}
      {type === 'perfect' && <PerfectSpecialEffect effectId={effectId} />}

      {/* 画面振動効果は削除 - シンプルな演出に */}
    </Box>
  )
}

// パーティクル効果コンポーネント
function ParticleEffect({ type, config, effectId }: { type: string, config: any, effectId: string }) {
  // パーティクル数を大幅に削減
  const particleCount = type === 'perfect' ? 12 : type === 'tetris' ? 10 : type === 'tspin' ? 8 : 6
  
  return (
    <div style={{ 
      position: 'absolute', 
      pointerEvents: 'none',
      top: '40%',
      left: '50%',
      transform: 'translate3d(-50%, -50%, 0)',
      width: '200px',
      height: '200px',
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden'
    }}>
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={`particle-${effectId}-${i}`}
          initial={{ 
            opacity: 0.8, 
            scale: 0,
            x: 0,
            y: 0
          }}
          animate={{ 
            opacity: 0, 
            scale: 1.5,
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200
          }}
          transition={{ 
            duration: config.duration / 1200,
            delay: Math.random() * 0.2,
            ease: 'easeOut'
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden'
          }}
        >
          <Box
            sx={{
              width: '3px',
              height: '3px',
              background: config.colors[Math.floor(Math.random() * config.colors.length)],
              borderRadius: '50%',
              boxShadow: `0 0 6px ${config.colors[0]}`,
              transform: 'translate3d(-50%, -50%, 0)',
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden'
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

// スコア表示コンポーネント
function ScoreDisplay({ score, type, config, effectId }: { score: number, type: string, config: any, effectId: string }) {
  return (
    <motion.div
      key={`score-${effectId}`}
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 1.2 }}
      transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: '55%',
        left: '50%',
        transform: 'translate3d(-50%, -50%, 0)',
        pointerEvents: 'none',
        willChange: 'transform, opacity, scale',
        backfaceVisibility: 'hidden'
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: config.colors[1] || config.colors[0],
          fontWeight: 'bold',
          textShadow: `0 0 15px ${config.colors[1] || config.colors[0]}, 0 0 30px ${config.colors[0]}`,
          fontFamily: 'Consolas, monospace',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          fontSize: '2rem',
          // GPU加速のためのテキスト最適化
          willChange: 'transform, opacity',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          textRendering: 'optimizeSpeed'
        }}
      >
        +{score.toLocaleString()}
      </Typography>
    </motion.div>
  )
}

// テトリス特殊効果
function TetrisSpecialEffect({ effectId }: { effectId: string }) {
  return (
    <motion.div
      key={`tetris-${effectId}`}
      initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 1.5, rotate: 180 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate3d(-50%, -50%, 0)',
        pointerEvents: 'none',
        willChange: 'transform, opacity, scale',
        backfaceVisibility: 'hidden'
      }}
    >
      <Typography
        variant="h1"
        sx={{
          color: '#ffd700',
          fontWeight: 'bold',
          textShadow: '0 0 30px #ffd700, 0 0 60px #ff8c00',
          fontFamily: 'Consolas, monospace',
          fontSize: '4rem',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          willChange: 'transform, opacity',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          textRendering: 'optimizeSpeed'
        }}
      >
        TETRIS!
      </Typography>
    </motion.div>
  )
}

// T-Spin特殊効果
function TSpinSpecialEffect({ effectId }: { effectId: string }) {
  return (
    <motion.div
      key={`tspin-${effectId}`}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{ opacity: 1, scale: 1, rotate: 360 }}
      exit={{ opacity: 0, scale: 0, rotate: 720 }}
      transition={{ duration: 2, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate3d(-50%, -50%, 0)',
        pointerEvents: 'none',
        willChange: 'transform, opacity, scale',
        backfaceVisibility: 'hidden'
      }}
    >
      <Box
        sx={{
          width: '200px',
          height: '200px',
          border: '4px solid #ffd700',
          borderRadius: '50%',
          boxShadow: '0 0 50px #ffd700, inset 0 0 50px rgba(255, 215, 0, 0.3)',
          willChange: 'transform, opacity',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden'
        }}
      />
    </motion.div>
  )
}

// Perfect Clear特殊効果
function PerfectSpecialEffect({ effectId }: { effectId: string }) {
  return (
    <div style={{ 
      position: 'absolute', 
      pointerEvents: 'none',
      top: '50%',
      left: '50%',
      transform: 'translate3d(-50%, -50%, 0)',
      width: '300px',
      height: '300px',
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden'
    }}>
      <motion.div
        key={`perfect-bg-${effectId}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 2 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          willChange: 'transform, opacity, scale',
          backfaceVisibility: 'hidden'
        }}
      >
        <Box
          sx={{
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255, 215, 0, 0.8) 0%, rgba(255, 140, 0, 0.6) 50%, transparent 100%)',
            borderRadius: '50%',
            willChange: 'transform, opacity',
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden'
          }}
        />
      </motion.div>
      <motion.div
        key={`perfect-text-${effectId}`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: '#ffd700',
            fontWeight: 'bold',
            textShadow: '0 0 40px #ffd700, 0 0 80px #ff8c00',
            fontFamily: 'Consolas, monospace',
            fontSize: '3rem',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            willChange: 'transform, opacity',
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            textRendering: 'optimizeSpeed'
          }}
        >
          PERFECT CLEAR!
        </Typography>
      </motion.div>
    </div>
  )
}

// 画面振動効果
function ScreenShake({ intensity, duration, effectId }: { intensity: number, duration: number, effectId: string }) {
  if (intensity === 0) return null
  
  return (
    <motion.div
      key={`shake-${effectId}`}
      initial={{ x: 0, y: 0 }}
      animate={{ 
        x: [0, intensity, -intensity, intensity, -intensity, 0],
        y: [0, -intensity, intensity, -intensity, intensity, 0]
      }}
      transition={{ 
        duration: duration / 1000,
        ease: 'easeInOut',
        repeat: 2
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    />
  )
} 