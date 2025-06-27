/**
 * TetrisGameコンポーネント
 * HTML版のゲームエンジンをReact版に統合
 */

'use client'

import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import type { RootState } from '@/store/store'
import { setLineClearCallback } from '@/store/store'
import { useGameEngine } from '../hooks/useGameEngine'
import { AchievementNotification, useAchievementPersistence } from '@/features/achievement'
import GameContainer from './GameContainer'
import GameMenu from './GameMenu'
import FeverModeEffects from './FeverModeEffects'
import FeverScoreEffect from './FeverScoreEffect'
import DangerModeEffects from './DangerModeEffects'
import LineClearEffect from '../effects/components/LineClearEffect'
import { useEffectSystem } from '../effects/hooks/useEffectSystem'

export default function TetrisGame() {
  const router = useRouter()
  const gameState = useSelector((state: RootState) => state.game)
  const { isGameRunning, isGameOver, score } = gameState
  
  const gameEngine = useGameEngine()
  const { startGame } = gameEngine
  
  const { currentEffect, triggerEffect, completeEffect } = useEffectSystem()
  useAchievementPersistence()

  // 演出コールバックをReduxストアに設定
  React.useEffect(() => {
    setLineClearCallback((linesCleared: number, score: number, isTSpin: boolean, isPerfectClear: boolean, spinResult?: any) => {
      triggerEffect(linesCleared, score, isTSpin, isPerfectClear, spinResult)
    })
  }, [triggerEffect])

  // ゲーム開始画面
  const renderStartScreen = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.6,
          zIndex: 0
        }}
      >
        <source src="/assets/videos/gemini_generated_video_55DF7A7E.mp4" type="video/mp4" />
      </video>
      
      {/* Content overlay */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
      <Typography variant="h2" sx={{ mb: 4, color: '#00ff88' }}>
        ClaudeTetris
      </Typography>
      <Typography variant="h6" sx={{ mb: 4, color: '#666' }}>
        PCユーザー専用の革新的テトリスゲーム
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={startGame}
          sx={{
            backgroundColor: '#00ff88',
            color: '#000',
            fontSize: '1.2rem',
            px: 4,
            py: 2,
            '&:hover': {
              backgroundColor: '#00cc6a',
            }
          }}
        >
          ゲーム開始
        </Button>
        
        <Button
          variant="outlined"
          size="medium"
          onClick={() => router.push('/achievements')}
          sx={{
            borderColor: '#ffd700',
            color: '#ffd700',
            fontSize: '1rem',
            px: 3,
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              borderColor: '#ffd700'
            }
          }}
        >
          実績確認
        </Button>
      </Box>
      </Box>
    </Box>
  )

  // ゲームオーバー画面
  const renderGameOverScreen = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <Typography variant="h3" sx={{ mb: 2, color: '#ff0000' }}>
        GAME OVER
      </Typography>
      <Typography variant="h5" sx={{ mb: 4, color: '#fff' }}>
        Score: {score.toLocaleString()}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={startGame}
          sx={{
            backgroundColor: '#00ff88',
            color: '#000',
            fontSize: '1.2rem',
            px: 4,
            py: 2,
            '&:hover': {
              backgroundColor: '#00cc6a',
            }
          }}
        >
          もう一度プレイ
        </Button>
        
        <Button
          variant="outlined"
          size="medium"
          onClick={() => router.push('/achievements')}
          sx={{
            borderColor: '#ffd700',
            color: '#ffd700',
            fontSize: '1rem',
            px: 3,
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(255, 215, 0, 0.1)',
              borderColor: '#ffd700'
            }
          }}
        >
          実績確認
        </Button>
        
        <Button
          variant="text"
          size="small"
          onClick={() => router.push('/')}
          sx={{
            color: '#666',
            fontSize: '0.9rem',
            '&:hover': {
              color: '#888'
            }
          }}
        >
          ホームに戻る
        </Button>
      </Box>
    </Box>
  )

  // ゲーム中画面
  const renderGameScreen = () => (
    <Box sx={{
      // ゲーム画面コンテナのGPU加速
      willChange: 'transform, opacity',
      transform: 'translate3d(0, 0, 0)',
      backfaceVisibility: 'hidden',
      contain: 'layout style paint'
    }}>
      <GameMenu />
      <GameContainer />
      <DangerModeEffects />
      <FeverModeEffects />
      <FeverScoreEffect />
      <AchievementNotification />
      
      {/* ライン消去演出 */}
      {currentEffect && (
        <LineClearEffect
          key={currentEffect.id}
          type={currentEffect.type}
          lines={currentEffect.lines}
          score={currentEffect.score}
          isVisible={currentEffect.isVisible}
          onComplete={completeEffect}
          spinResult={currentEffect.spinResult}
        />
      )}
      
      {isGameOver && renderGameOverScreen()}
    </Box>
  )

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      position: 'relative',
      // ゲーム全体のGPU加速
      willChange: 'transform, opacity',
      transform: 'translate3d(0, 0, 0)',
      backfaceVisibility: 'hidden'
    }}>
      {!isGameRunning && !isGameOver ? renderStartScreen() : renderGameScreen()}
    </Box>
  )
}