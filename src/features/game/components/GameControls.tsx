'use client'

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Box, Button, Paper, Typography } from '@mui/material'
import type { RootState } from '@/store/store'
import { 
  startGame, 
  pauseGame, 
  spawnTetromino, 
  moveTetromino, 
  rotateTetromino,
  resetGame
} from '@/store/slices/gameSlice'
import { Tetromino } from '../utils/tetromino'

export default function GameControls() {
  const dispatch = useDispatch()
  const { isGameRunning, isPaused, currentPiece } = useSelector((state: RootState) => state.game)

  const handleStartGame = () => {
    dispatch(startGame())
    // Spawn first tetromino
    const randomType = Tetromino.getRandomType()
    dispatch(spawnTetromino({ type: randomType }))
  }

  const handlePauseGame = () => {
    dispatch(pauseGame())
  }

  const handleResetGame = () => {
    dispatch(resetGame())
  }

  const handleSpawnRandomTetromino = () => {
    const randomType = Tetromino.getRandomType()
    dispatch(spawnTetromino({ type: randomType }))
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isGameRunning || isPaused) return

      switch (event.code) {
        case 'ArrowLeft':
          event.preventDefault()
          dispatch(moveTetromino({ dx: -1, dy: 0 }))
          break
        case 'ArrowRight':
          event.preventDefault()
          dispatch(moveTetromino({ dx: 1, dy: 0 }))
          break
        case 'ArrowDown':
          event.preventDefault()
          dispatch(moveTetromino({ dx: 0, dy: 1 }))
          break
        case 'ArrowUp':
          event.preventDefault()
          dispatch(rotateTetromino())
          break
        case 'Space':
          event.preventDefault()
          // Hard drop (will be implemented later)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [dispatch, isGameRunning, isPaused])

  return (
    <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
      <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
        GAME CONTROLS
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        {!isGameRunning ? (
          <Button 
            variant="contained" 
            onClick={handleStartGame}
            sx={{ backgroundColor: '#00ff88', color: '#000' }}
          >
            START GAME
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handlePauseGame}
            sx={{ backgroundColor: isPaused ? '#00ff88' : '#ffd700', color: '#000' }}
          >
            {isPaused ? 'RESUME' : 'PAUSE'}
          </Button>
        )}
        
        <Button 
          variant="outlined" 
          onClick={handleResetGame}
          sx={{ borderColor: '#ff0000', color: '#ff0000' }}
        >
          RESET
        </Button>

        {isGameRunning && !isPaused && (
          <Button 
            variant="outlined" 
            onClick={handleSpawnRandomTetromino}
            sx={{ borderColor: '#ffd700', color: '#ffd700' }}
          >
            SPAWN PIECE
          </Button>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
          Keyboard Controls:
        </Typography>
        <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
          ← → : Move left/right
        </Typography>
        <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
          ↓ : Soft drop
        </Typography>
        <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
          ↑ : Rotate
        </Typography>
        <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
          Space : Hard drop (TODO)
        </Typography>
      </Box>

      {currentPiece.type && (
        <Box>
          <Typography variant="body2" sx={{ color: '#00ff88' }}>
            Current: {currentPiece.type} ({currentPiece.x}, {currentPiece.y}) R{currentPiece.rotation}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}