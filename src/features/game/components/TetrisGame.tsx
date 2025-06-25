/**
 * TetrisGameコンポーネント
 * HTML版のゲームエンジンをReact版に統合
 */

'use client'

import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { useGameEngine } from '../hooks/useGameEngine'
import GameContainer from './GameContainer'
import FeverModeEffects from './FeverModeEffects'
import FeverScoreEffect from './FeverScoreEffect'
import DangerModeEffects from './DangerModeEffects'

export default function TetrisGame() {
  const { isGameRunning, isGameOver, score } = useSelector((state: RootState) => state.game)
  const { startGame } = useGameEngine()

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
        color: '#fff'
      }}
    >
      <Typography variant="h2" sx={{ mb: 4, color: '#00ff88' }}>
        ClaudeTetris
      </Typography>
      <Typography variant="h6" sx={{ mb: 4, color: '#666' }}>
        PCユーザー専用の革新的テトリスゲーム
      </Typography>
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
    </Box>
  )

  // ゲーム中画面
  const renderGameScreen = () => (
    <>
      <GameContainer />
      <DangerModeEffects />
      <FeverModeEffects />
      <FeverScoreEffect />
      {isGameOver && renderGameOverScreen()}
    </>
  )

  return (
    <Box sx={{ minHeight: '100vh', position: 'relative' }}>
      {!isGameRunning && !isGameOver ? renderStartScreen() : renderGameScreen()}
    </Box>
  )
}