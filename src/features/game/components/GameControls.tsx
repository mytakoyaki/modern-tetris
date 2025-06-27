'use client'

import React from 'react'

export default function GameControls() {
  // このコンポーネントはuseGameEngineと競合するため一時的に無効化
  return (
    <div style={{ color: '#666', fontSize: '12px', textAlign: 'center' }}>
      ゲームコントロールはuseGameEngineで処理されます
    </div>
  )
  
  /*
  const dispatch = useDispatch()
  const { isGameRunning, isPaused, isGameOver, currentPiece, field, level } = useSelector((state: RootState) => state.game)
  

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

  // Auto drop timer
  useEffect(() => {
    if (!isGameRunning || isPaused || isGameOver || !currentPiece.type) return

    // レベルに応じた落下速度計算 (フレーム数ベース、60FPS想定)
    const getDropInterval = (level: number) => {
      const frameTable = [
        48, 43, 38, 33, 28, 23, 18, 13, 8, 6, // Level 1-10
        5, 5, 5, 4, 4, 4, 3, 3, 3, 2, // Level 11-20
        2, 2, 2, 2, 2, 2, 2, 2, 2, 1 // Level 21-30
      ]
      const frames = frameTable[Math.min(level - 1, frameTable.length - 1)] || 1
      return Math.max(frames * (1000 / 60), 50) // 最低50ms
    }
    
    const dropInterval = getDropInterval(level)
    
    const timer = setInterval(() => {
      const tetromino = Tetromino.fromData(currentPiece)
      if (isTetrominoLanded(tetromino, field)) {
        // 着地した場合、ピースを設置して新しいピースを生成
        dispatch(placeTetromino())
        const nextType = Tetromino.getRandomType()
        dispatch(spawnTetromino({ type: nextType }))
      } else {
        // まだ落下できる場合、1マス下に移動
        dispatch(moveTetromino({ dx: 0, dy: 1 }))
      }
    }, dropInterval)

    return () => clearInterval(timer)
  }, [dispatch, isGameRunning, isPaused, isGameOver, currentPiece, field, level])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isGameRunning || isPaused || isGameOver) return

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
          // Check if piece can move down, if not, place it
          if (currentPiece.type) {
            const tetromino = Tetromino.fromData(currentPiece)
            if (isTetrominoLanded(tetromino, field)) {
              dispatch(placeTetromino())
              // Spawn next piece
              const nextType = Tetromino.getRandomType()
              dispatch(spawnTetromino({ type: nextType }))
            } else {
              dispatch(moveTetromino({ dx: 0, dy: 1 }))
            }
          }
          break
        case 'ArrowUp':
          event.preventDefault()
          dispatch(rotateTetromino())
          break
        case 'KeyZ':
          event.preventDefault()
          // 反時計回り回転（将来実装予定）
          // dispatch(rotateTetrominoCounterClockwise())
          break
        case 'Space':
          event.preventDefault()
          dispatch(hardDropTetromino())
          dispatch(placeTetromino())
          // Spawn next piece
          const nextType = Tetromino.getRandomType()
          dispatch(spawnTetromino({ type: nextType }))
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [dispatch, isGameRunning, isPaused, isGameOver, currentPiece, field])

  return (
    <div>コントロール無効化中</div>
  )
  */
}

/*
function DisabledGameControls() {
  return (
    <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
      <Typography variant="h6" sx={{ color: '#00ff88', mb: 2 }}>
        GAME CONTROLS
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
        {isGameOver ? (
          <>
            <Typography variant="h5" sx={{ color: '#ff0000', textAlign: 'center', mb: 1 }}>
              GAME OVER
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleStartGame}
              sx={{ backgroundColor: '#00ff88', color: '#000' }}
            >
              RESTART
            </Button>
          </>
        ) : !isGameRunning ? (
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
          ↑ : Rotate (CW)
        </Typography>
        <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
          Z : Rotate (CCW)
        </Typography>
        <Typography variant="caption" sx={{ color: '#888', display: 'block' }}>
          Space : Hard drop
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
*/