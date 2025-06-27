'use client'

import React, { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import type { SpinResult } from '@/types/spin'

interface LineClearEffectProps {
  type: 'single' | 'double' | 'triple' | 'tetris' | 'tspin' | 'perfect'
  lines: number
  score: number
  isVisible: boolean
  onComplete: () => void
  spinResult?: SpinResult | null
}

// 演出設定（軽量化版）
const EFFECT_CONFIG = {
  single: {
    duration: 600, // 短縮
    intensity: 'subtle',
    elements: ['lineGlow', 'particleBurst', 'scorePop'],
    colors: ['#00ff88'],
    shake: 0,
    scale: 1.0
  },
  double: {
    duration: 800, // 短縮
    intensity: 'subtle',
    elements: ['lineGlow', 'particleBurst', 'scorePop', 'colorWave'],
    colors: ['#00ff88', '#00cc6a'],
    shake: 1, // 軽減
    scale: 1.02
  },
  triple: {
    duration: 1000, // 短縮
    intensity: 'moderate',
    elements: ['lineExplosion', 'screenShake', 'colorWave', 'particleStorm'],
    colors: ['#00ff88', '#00cc6a', '#00994d'],
    shake: 2, // 軽減
    scale: 1.05
  },
  tetris: {
    duration: 1500, // 短縮
    intensity: 'spectacular',
    elements: ['rainbowEffect', 'tetrisLogo', 'screenShake', 'particleStorm'],
    colors: ['#ffd700', '#ff8c00', '#ff4500', '#ff1493'],
    shake: 3, // 軽減
    scale: 1.1
  },
  tspin: {
    duration: 1800, // 短縮
    intensity: 'legendary',
    elements: ['goldenVortex', 'rotationEffect', 'screenShake', 'particleStorm'],
    colors: ['#ffd700', '#ffa500', '#ff8c00'],
    shake: 4, // 軽減
    scale: 1.15
  },
  perfect: {
    duration: 2500, // 短縮
    intensity: 'mythical',
    elements: ['fullScreenExplosion', 'timeSlow', 'particleStorm'],
    colors: ['#ffd700', '#ff1493', '#00ffff', '#ff4500'],
    shake: 5, // 軽減
    scale: 1.2
  }
}

export default function LineClearEffect({ 
  type, 
  lines: _lines, 
  score, 
  isVisible, 
  onComplete,
  spinResult
}: LineClearEffectProps) {
  // 安定したeffectIDを使用（propsから受け取る想定）
  const [effectId] = useState(() => `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`)
  const config = EFFECT_CONFIG[type]

  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      onComplete()
    }, config.duration)

    return () => clearTimeout(timer)
  }, [isVisible, config.duration, onComplete])

  if (!isVisible) return null

  // T-Spinの詳細表示用テキスト
  const getTSpinDisplayText = () => {
    if (type !== 'tspin' || !spinResult) return 'Ｔ－ＳＰＩＮ！'
    
    if (spinResult.type === 'T-Spin') {
      if (spinResult.variant === 'Mini') {
        return `Ｔ－ＳＰＩＮ　ＭＩＮＩ！`
      }
      return `Ｔ－ＳＰＩＮ！`
    }
    
    if (spinResult.type === 'SZ-Spin') {
      return `ＳＺ－ＳＰＩＮ！`
    }
    
    if (spinResult.type === 'I-Spin') {
      return `Ｉ－ＳＰＩＮ！`
    }
    
    if (spinResult.type === 'JL-Spin') {
      return `ＪＬ－ＳＰＩＮ！`
    }
    
    return 'Ｔ－ＳＰＩＮ！'
  }

  const tspinText = getTSpinDisplayText()

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
      {/* サイバーライン光る演出 */}
      <motion.div
        key={`cyber-lines-${effectId}`}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        exit={{ opacity: 0, scaleX: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          pointerEvents: 'none',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* 水平ライン */}
        <Box
          sx={{
            width: '400px',
            height: '2px',
            background: `linear-gradient(90deg, transparent 0%, ${config.colors[0]} 50%, transparent 100%)`,
            boxShadow: `0 0 10px ${config.colors[0]}, 0 0 20px ${config.colors[0]}`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-1px',
              left: '0',
              width: '100%',
              height: '4px',
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)`,
              filter: 'blur(1px)'
            }
          }}
        />
      </motion.div>

      {/* サイバー文字演出 */}
      <motion.div
        key={`cyber-text-${effectId}`}
        initial={{ opacity: 0, scale: 0.3, rotateX: -90 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ opacity: 0, scale: 1.2, rotateX: 90 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          pointerEvents: 'none',
          willChange: 'transform, opacity, scale',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
      >
        <Typography
          variant="h1"
          sx={{
            color: config.colors[0],
            fontWeight: '900',
            fontFamily: 'Impact, "Arial Black", sans-serif',
            fontSize: '3rem',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            // サイバー文字エフェクト
            textShadow: `
              0 0 5px #fff,
              0 0 10px ${config.colors[0]},
              0 0 20px ${config.colors[0]},
              0 0 40px ${config.colors[0]},
              0 0 80px ${config.colors[0]}
            `,
            background: `linear-gradient(45deg, ${config.colors[0]}, #fff, ${config.colors[0]})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            // 次世代グロー効果
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))',
            // GPU最適化
            willChange: 'transform, opacity',
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden',
            textRendering: 'optimizeSpeed',
            // ホログラム効果
            '&::before': {
              content: `"${type === 'single' ? 'ＳＩＮＧＬＥ' : 
                             type === 'double' ? 'ＤＯＵＢＬＥ' : 
                             type === 'triple' ? 'ＴＲＩＰＬＥ' : 
                             type === 'tetris' ? 'ＴＥＴＲＩＳ！' : 
                             type === 'tspin' ? tspinText : 
                             type === 'perfect' ? 'ＰＥＲＦＥＣＴ！' : 'ＥＦＦＥＣＴ'}"`,
              position: 'absolute',
              top: '2px',
              left: '2px',
              color: 'rgba(0, 255, 255, 0.3)',
              zIndex: -1
            }
          }}
        >
          {type === 'single' ? 'ＳＩＮＧＬＥ' : 
           type === 'double' ? 'ＤＯＵＢＬＥ' : 
           type === 'triple' ? 'ＴＲＩＰＬＥ' : 
           type === 'tetris' ? 'ＴＥＴＲＩＳ！' : 
           type === 'tspin' ? tspinText : 
           type === 'perfect' ? 'ＰＥＲＦＥＣＴ！' : 'ＥＦＦＥＣＴ'}
        </Typography>
      </motion.div>

      {/* ヘキサゴン装飾 */}
      <motion.div
        key={`hexagon-${effectId}`}
        initial={{ opacity: 0, rotate: 0, scale: 0 }}
        animate={{ opacity: 0.6, rotate: 360, scale: 1 }}
        exit={{ opacity: 0, rotate: 720, scale: 2 }}
        transition={{ duration: config.duration / 1000, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          pointerEvents: 'none',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
      >
        <Box
          sx={{
            width: '150px',
            height: '150px',
            border: `2px solid ${config.colors[0]}`,
            borderRadius: '0',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            boxShadow: `
              0 0 20px ${config.colors[0]},
              inset 0 0 20px rgba(255,255,255,0.1)
            `,
            willChange: 'transform, opacity',
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden'
          }}
        />
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

// サイバーパーティクル効果コンポーネント
function ParticleEffect({ type, config, effectId }: { 
  type: string, 
  config: { colors: string[], duration: number } & Record<string, unknown>, 
  effectId: string 
}) {
  // パーティクル数を削減
  const particleCount = type === 'perfect' ? 8 : type === 'tetris' ? 6 : type === 'tspin' ? 5 : 4
  
  return (
    <div style={{ 
      position: 'absolute', 
      pointerEvents: 'none',
      top: '35%',
      left: '50%',
      transform: 'translate3d(-50%, -50%, 0)',
      width: '200px',
      height: '200px',
      willChange: 'transform, opacity',
      backfaceVisibility: 'hidden'
    }}>
      {Array.from({ length: particleCount }).map((_, i) => {
        const angle = (i / particleCount) * Math.PI * 2
        const distance = 80 + Math.random() * 60
        return (
          <motion.div
            key={`cyber-particle-${effectId}-${i}`}
            initial={{ 
              opacity: 0,
              scale: 0,
              x: 0,
              y: 0,
              rotate: 0
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              rotate: 360
            }}
            transition={{ 
              duration: config.duration / 1200,
              delay: i * 0.05,
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
            {/* サイバー風パーティクル（ひし形） */}
            <Box
              sx={{
                width: '4px',
                height: '4px',
                background: `linear-gradient(45deg, ${config.colors[0]}, #fff, ${config.colors[0]})`,
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                boxShadow: `
                  0 0 8px ${config.colors[0]},
                  0 0 16px ${config.colors[0]},
                  inset 0 0 4px rgba(255,255,255,0.8)
                `,
                transform: 'translate3d(-50%, -50%, 0)',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-1px',
                  left: '-1px',
                  right: '-1px',
                  bottom: '-1px',
                  background: `linear-gradient(45deg, transparent, ${config.colors[0]}, transparent)`,
                  clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                  zIndex: -1,
                  filter: 'blur(1px)'
                }
              }}
            />
          </motion.div>
        )
      })}
      
      {/* 中央発光コア */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
        transition={{ duration: config.duration / 1000, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
      >
        <Box
          sx={{
            width: '12px',
            height: '12px',
            background: `radial-gradient(circle, #fff 0%, ${config.colors[0]} 70%, transparent 100%)`,
            borderRadius: '50%',
            boxShadow: `
              0 0 20px ${config.colors[0]},
              0 0 40px ${config.colors[0]},
              0 0 60px rgba(255,255,255,0.5)
            `,
            willChange: 'transform, opacity',
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden'
          }}
        />
      </motion.div>
    </div>
  )
}

// サイバースコア表示コンポーネント
function ScoreDisplay({ score, type: _type, config, effectId }: { 
  score: number, 
  type: string, 
  config: { colors: string[], duration: number } & Record<string, unknown>, 
  effectId: string 
}) {
  return (
    <motion.div
      key={`cyber-score-${effectId}`}
      initial={{ opacity: 0, y: 50, scale: 0.5, rotateY: -180 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, y: -50, scale: 1.5, rotateY: 180 }}
      transition={{ duration: 0.8, delay: 0.4, ease: 'backOut' }}
      style={{
        position: 'absolute',
        top: '60%',
        left: '50%',
        transform: 'translate3d(-50%, -50%, 0)',
        pointerEvents: 'none',
        willChange: 'transform, opacity, scale',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* スコア背景パネル */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          width: 'auto',
          minWidth: '120px',
          height: '40px',
          background: `linear-gradient(45deg, 
            rgba(${config.colors[0] === '#00ff88' ? '0,255,136' : '255,215,0'}, 0.1) 0%, 
            rgba(${config.colors[0] === '#00ff88' ? '0,255,136' : '255,215,0'}, 0.2) 50%, 
            rgba(${config.colors[0] === '#00ff88' ? '0,255,136' : '255,215,0'}, 0.1) 100%)`,
          border: `1px solid ${config.colors[0]}`,
          borderRadius: '0',
          clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
          boxShadow: `
            0 0 20px ${config.colors[0]},
            inset 0 0 10px rgba(255,255,255,0.1)
          `,
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '2px',
            left: '2px',
            right: '2px',
            bottom: '2px',
            background: `linear-gradient(45deg, transparent, ${config.colors[0]}, transparent)`,
            clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
            opacity: 0.3,
            filter: 'blur(1px)'
          }
        }}
      />
      
      {/* スコアテキスト */}
      <Typography
        variant="h3"
        sx={{
          position: 'relative',
          color: '#fff',
          fontWeight: '900',
          fontFamily: 'Impact, "Arial Black", sans-serif',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          fontSize: '1.8rem',
          lineHeight: '40px',
          letterSpacing: '0.05em',
          // サイバースコアエフェクト
          textShadow: `
            0 0 5px #fff,
            0 0 10px ${config.colors[0]},
            0 0 20px ${config.colors[0]},
            0 0 30px ${config.colors[0]}
          `,
          background: `linear-gradient(90deg, ${config.colors[0]}, #fff, ${config.colors[0]})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.6))',
          // GPU最適化
          willChange: 'transform, opacity',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          textRendering: 'optimizeSpeed',
          // ホログラム効果
          '&::before': {
            content: `"+${score.toLocaleString()}"`,
            position: 'absolute',
            top: '1px',
            left: '1px',
            color: 'rgba(0, 255, 255, 0.2)',
            zIndex: -1
          }
        }}
      >
        +{score.toLocaleString()}
      </Typography>
      
      {/* 左右のエネルギーバー */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '-30px',
          transform: 'translate3d(0, -50%, 0)',
          width: '4px',
          height: '50px',
          background: `linear-gradient(180deg, transparent 0%, ${config.colors[0]} 50%, transparent 100%)`,
          boxShadow: `0 0 10px ${config.colors[0]}`,
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '-30px',
          transform: 'translate3d(0, -50%, 0)',
          width: '4px',
          height: '50px',
          background: `linear-gradient(180deg, transparent 0%, ${config.colors[0]} 50%, transparent 100%)`,
          boxShadow: `0 0 10px ${config.colors[0]}`,
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
      />
    </motion.div>
  )
}

// サイバーテトリス特殊効果
function TetrisSpecialEffect({ effectId }: { effectId: string }) {
  return (
    <motion.div
      key={`cyber-tetris-${effectId}`}
      initial={{ opacity: 0, scale: 0.3, rotateZ: -180, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateZ: 0, rotateY: 0 }}
      exit={{ opacity: 0, scale: 2, rotateZ: 180, rotateY: 90 }}
      transition={{ duration: 2, ease: 'backOut' }}
      style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate3d(-50%, -50%, 0)',
        pointerEvents: 'none',
        willChange: 'transform, opacity, scale',
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      {/* ホログラム背景 */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          width: '300px',
          height: '100px',
          background: `linear-gradient(45deg, 
            rgba(255, 215, 0, 0.1) 0%, 
            rgba(255, 215, 0, 0.3) 50%, 
            rgba(255, 215, 0, 0.1) 100%)`,
          clipPath: 'polygon(20px 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%)',
          border: '2px solid #ffd700',
          boxShadow: `
            0 0 30px #ffd700,
            inset 0 0 20px rgba(255, 255, 255, 0.1)
          `,
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '4px',
            left: '4px',
            right: '4px',
            bottom: '4px',
            background: `linear-gradient(45deg, transparent, #ffd700, transparent)`,
            clipPath: 'polygon(20px 0%, 100% 0%, calc(100% - 20px) 100%, 0% 100%)',
            opacity: 0.4,
            filter: 'blur(2px)'
          }
        }}
      />
      
      {/* TETRIS! テキスト */}
      <Typography
        variant="h1"
        sx={{
          position: 'relative',
          color: '#ffd700',
          fontWeight: '900',
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: '4rem',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          letterSpacing: '0.1em',
          lineHeight: '100px',
          // 次世代テトリスエフェクト
          textShadow: `
            0 0 10px #fff,
            0 0 20px #ffd700,
            0 0 40px #ffd700,
            0 0 80px #ffd700,
            0 0 160px #ff8c00
          `,
          background: `linear-gradient(45deg, #ffd700, #fff, #ffd700, #ff8c00)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.8))',
          // GPU最適化
          willChange: 'transform, opacity',
          transform: 'translate3d(0, 0, 0)',
          backfaceVisibility: 'hidden',
          textRendering: 'optimizeSpeed',
          // サイバーホログラム効果
          '&::before': {
            content: '"ＴＥＴＲＩＳ！"',
            position: 'absolute',
            top: '3px',
            left: '3px',
            color: 'rgba(0, 255, 255, 0.4)',
            zIndex: -1
          }
        }}
      >
        ＴＥＴＲＩＳ！
      </Typography>
      
      {/* エネルギーコア */}
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: [0, 1.2, 1], rotate: 360 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
      >
        <Box
          sx={{
            width: '20px',
            height: '20px',
            background: `radial-gradient(circle, #fff 0%, #ffd700 50%, #ff8c00 100%)`,
            borderRadius: '50%',
            boxShadow: `
              0 0 40px #ffd700,
              0 0 80px #ffd700,
              0 0 120px rgba(255, 215, 0, 0.5)
            `,
            willChange: 'transform, opacity',
            transform: 'translate3d(0, 0, 0)',
            backfaceVisibility: 'hidden'
          }}
        />
      </motion.div>
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

 