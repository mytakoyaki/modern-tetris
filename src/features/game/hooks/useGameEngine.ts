/**
 * ゲームエンジンフック
 * HTML版のゲームエンジンをReact+Reduxで再実装
 */

import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { store } from '@/store/store'
import { 
  startGame, 
  endGame, 
  updateScore,
  spawnTetromino,
  moveTetromino,
  rotateTetromino,
  hardDropTetromino,
  placeTetromino,
  updateField,
  updateFeverTime,
  exchangePiece,
  holdPiece,
  updateNextPieces,
  resetHoldSlots,
  resetGame,
  updateLevel,
  updateGameTime,
  updateLevelGaugeProgress
} from '@/store/slices/gameSlice'
import { GameField } from '../utils/gameField'
import { useKeyboardInput } from './useKeyboardInput'

export const useGameEngine = () => {
  const dispatch = useDispatch()
  const gameState = useSelector((state: RootState) => state.game)
  
  // ゲームフィールドインスタンス
  const gameFieldRef = useRef<GameField | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const localGameTimeRef = useRef<number>(0)
  const lastSyncTimeRef = useRef<number>(0)
  
  // レベルゲージ用の独立したタイマー
  const levelGaugeRef = useRef<number>(0)
  const levelGaugeTimerRef = useRef<any>(null)
  
  // dispatchの参照を安定化
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch

  // ゲームフィールド初期化
  useEffect(() => {
    if (!gameFieldRef.current) {
      gameFieldRef.current = new GameField()
    }
  }, [])

  // ゲーム状態の永続化
  useEffect(() => {
    // ゲーム状態をlocalStorageに保存
    if (gameState.isGameRunning) {
      const gameStateToSave = {
        isGameRunning: gameState.isGameRunning,
        isPaused: gameState.isPaused,
        gameTime: gameState.gameTime,
        level: gameState.level,
        score: gameState.score,
        lines: gameState.lines,
        timestamp: Date.now()
      }
      localStorage.setItem('tetris-game-state', JSON.stringify(gameStateToSave))
    }
  }, [gameState.isGameRunning, gameState.isPaused, gameState.gameTime, gameState.level, gameState.score, gameState.lines])

  // ゲーム状態の復元
  useEffect(() => {
    const savedState = localStorage.getItem('tetris-game-state')
    if (savedState && process.env.NODE_ENV === 'development') {
      try {
        const parsedState = JSON.parse(savedState)
        const timeDiff = Date.now() - parsedState.timestamp
        
        // 5分以内の保存データのみ復元
        if (timeDiff < 5 * 60 * 1000 && parsedState.isGameRunning && !parsedState.isPaused) {
          // ゲーム状態を復元（ただし、ゲームループは手動で再開）
          if (!animationFrameRef.current) {
            lastTimeRef.current = performance.now()
            localGameTimeRef.current = parsedState.gameTime || 0
            lastSyncTimeRef.current = parsedState.gameTime || 0
            animationFrameRef.current = requestAnimationFrame(gameLoop)
          }
        }
      } catch (error) {
        console.warn('Failed to restore game state:', error)
      }
    }
  }, []) // 初回マウント時のみ実行

  // ゲームループ
  const gameLoop = useCallback((currentTime: number) => {
    // 最新のゲーム状態を取得
    const currentGameState = store.getState().game
    
    console.log('Game loop executed:', {
      isGameRunning: currentGameState.isGameRunning,
      isPaused: currentGameState.isPaused,
      hasGameField: !!gameFieldRef.current,
      currentTime
    })
    
    if (!currentGameState.isGameRunning || currentGameState.isPaused || !gameFieldRef.current) {
      console.log('Game loop early return:', {
        isGameRunning: currentGameState.isGameRunning,
        isPaused: currentGameState.isPaused,
        hasGameField: !!gameFieldRef.current
      })
      return
    }

    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime

    // ゲームフィールド更新
    const updateResult = gameFieldRef.current.update(deltaTime)
    
    if (updateResult) {
      if (updateResult.needsSpawn) {
        // 新しいテトリミノをスポーン
        if (!gameFieldRef.current.spawnTetromino()) {
          // ゲームオーバー
          dispatchRef.current(endGame())
          return
        }
        // スポーン成功時はReduxアクションを呼び出さない（GameFieldの状態を優先）
      }

      if (updateResult.tetrominoLocked && updateResult.clearedLines) {
        // ライン消去処理
        const clearedLinesCount = updateResult.clearedLines.length
        if (clearedLinesCount > 0) {
          // スコア計算とRedux更新
          const baseScore = [0, 100, 400, 1000, 2000][clearedLinesCount] || 0
          const levelMultiplier = currentGameState.level
          const finalScore = baseScore * levelMultiplier
          
          dispatchRef.current(updateScore(finalScore))
          dispatchRef.current(placeTetromino())
        }
      }
    }

    // フィールド状態をReduxに同期
    const displayField = gameFieldRef.current.getFieldWithCurrentTetromino()
    dispatchRef.current(updateField(displayField as any))

    // フィーバーモードタイマー更新
    if (currentGameState.feverMode.isActive) {
      dispatchRef.current(updateFeverTime(deltaTime))
    }

    // ローカルゲーム時間更新
    localGameTimeRef.current += deltaTime

    // 100msごとにReduxに同期（より滑らかな更新のため）
    if (localGameTimeRef.current - lastSyncTimeRef.current >= 100) {
      dispatchRef.current(updateGameTime(localGameTimeRef.current - lastSyncTimeRef.current))
      lastSyncTimeRef.current = localGameTimeRef.current
    }

    // 次のフレーム
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, []) // 依存関係を空にする

  // ゲーム開始
  const handleStartGame = useCallback(() => {
    console.log('handleStartGame called')
    
    if (gameFieldRef.current) {
      console.log('Game field exists, starting game...')
      
      // 古いゲーム状態をクリア
      localStorage.removeItem('tetris-game-state')
      
      // Reduxの状態をリセット
      dispatchRef.current(resetGame())
      
      // ゲームフィールドをリセット
      gameFieldRef.current.reset()
      
      // 空のフィールドをReduxに送信（初期化）
      const emptyField = gameFieldRef.current.getFieldWithCurrentTetromino()
      dispatchRef.current(updateField(emptyField as any))
      
      // 最初のテトリミノを生成
      const spawnSuccess = gameFieldRef.current.spawnTetromino()
      console.log('Spawn success:', spawnSuccess)
      
      if (spawnSuccess) {
        // 初期NEXTピースを設定
        const nextPieces = gameFieldRef.current.getNextPieces(5)
        dispatchRef.current(updateNextPieces(nextPieces))
        
        // 現在のテトリミノをReduxに設定
        const currentTetromino = gameFieldRef.current.currentTetromino
        if (currentTetromino) {
          console.log('Setting current tetromino:', currentTetromino)
          dispatchRef.current(spawnTetromino({
            type: currentTetromino.type,
            x: currentTetromino.x,
            y: currentTetromino.y
          }))
        }
      }
      
      // ゲームを開始状態に設定
      console.log('Dispatching startGame...')
      dispatchRef.current(startGame())
      
      // 初期落下速度を設定
      gameFieldRef.current.setDropSpeed(1)
      
      lastTimeRef.current = performance.now()
      localGameTimeRef.current = 0
      lastSyncTimeRef.current = 0
      console.log('Requesting animation frame...')
      animationFrameRef.current = requestAnimationFrame(gameLoop)
      
      // レベルゲージタイマーを開始
      startLevelGaugeTimer()

      // 最初のピースが即座に落下し始めるように1フレーム進める
      if (gameFieldRef.current) {
        // レベル1の落下速度（1000ms）で1フレーム進める
        console.log('Forcing first update...')
        gameFieldRef.current.update(1000)
      }
    } else {
      console.log('Game field is null!')
    }
  }, [gameLoop])

  // ゲーム停止
  const handleStopGame = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    // レベルゲージタイマーを停止
    stopLevelGaugeTimer()
    dispatchRef.current(endGame())
    // ゲーム終了時にlocalStorageをクリア
    localStorage.removeItem('tetris-game-state')
  }, [])

  // 移動処理
  const handleMoveLeft = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      const result = gameFieldRef.current.moveTetromino(-1, 0)
      if (result) {
        dispatchRef.current(moveTetromino({ dx: -1, dy: 0 }))
      }
    }
  }, [gameState.isGameRunning])

  const handleMoveRight = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      const result = gameFieldRef.current.moveTetromino(1, 0)
      if (result) {
        dispatchRef.current(moveTetromino({ dx: 1, dy: 0 }))
      }
    }
  }, [gameState.isGameRunning])

  const handleSoftDrop = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      const result = gameFieldRef.current.moveTetromino(0, 1)
      if (result) {
        dispatchRef.current(moveTetromino({ dx: 0, dy: 1 }))
        
        // ソフトドロップポイント（既存のポイントシステムと連携）
        if (result.isSoftDrop) {
          // ポイント計算は既存のmoveTetrominoアクションで処理
        }
      }
    }
  }, [gameState.isGameRunning])

  const handleHardDrop = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      gameFieldRef.current.hardDrop()
      dispatchRef.current(hardDropTetromino())
      
      // ハードドロップ完了後のライン消去チェック
      const clearedLines = gameFieldRef.current.getCompletedLines()
      if (clearedLines.length > 0) {
        const baseScore = [0, 100, 400, 1000, 2000][clearedLines.length] || 0
        const finalScore = baseScore * gameState.level
        dispatchRef.current(updateScore(finalScore))
      }
    }
  }, [gameState.isGameRunning, gameState.level])

  // 回転処理
  const handleRotate = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      const success = gameFieldRef.current.rotateTetromino(true)
      if (success) {
        dispatchRef.current(rotateTetromino())
      }
    }
  }, [gameState.isGameRunning])

  const handleRotateCounterClockwise = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      const success = gameFieldRef.current.rotateTetromino(false)
      if (success) {
        dispatchRef.current(rotateTetromino())
      }
    }
  }, [gameState.isGameRunning])

  // ホールド処理
  const handleHold1 = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatchRef.current(holdPiece({ slotIndex: 0 }))
    }
  }, [gameState.isGameRunning])

  const handleHold2 = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatchRef.current(holdPiece({ slotIndex: 1 }))
    }
  }, [gameState.isGameRunning])

  // エクスチェンジ処理
  const handleExchange = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      dispatchRef.current(exchangePiece())
    }
  }, [gameState.isGameRunning])

  // キーボード入力設定
  useKeyboardInput({
    onMoveLeft: handleMoveLeft,
    onMoveRight: handleMoveRight,
    onSoftDrop: handleSoftDrop,
    onHardDrop: handleHardDrop,
    onRotate: handleRotate,
    onRotateCounterClockwise: handleRotateCounterClockwise,
    onHold1: handleHold1,
    onHold2: handleHold2,
    onExchange: handleExchange,
  }, gameState.isGameRunning)

  // ゲームループのクリーンアップ
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // ゲーム開始時のループ開始
  useEffect(() => {
    console.log('Game loop useEffect triggered:', {
      isGameRunning: gameState.isGameRunning,
      isPaused: gameState.isPaused,
      hasAnimationFrame: !!animationFrameRef.current
    })
    
    if (gameState.isGameRunning && !gameState.isPaused && !animationFrameRef.current) {
      console.log('Starting game loop...')
      lastTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    
    if (!gameState.isGameRunning && animationFrameRef.current) {
      console.log('Stopping game loop...')
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [gameState.isGameRunning, gameState.isPaused])

  // HMRによる再マウント時のゲーム状態復元
  useEffect(() => {
    // 開発環境でのみ実行
    if (process.env.NODE_ENV === 'development') {
      // ゲームが実行中だった場合、ループを再開
      if (gameState.isGameRunning && !gameState.isPaused && !animationFrameRef.current) {
        lastTimeRef.current = performance.now()
        animationFrameRef.current = requestAnimationFrame(gameLoop)
      }
    }
  }, [gameState.isGameRunning, gameState.isPaused, gameLoop]) // 依存関係を追加

  // レベルゲージ用の独立したタイマー関数
  const startLevelGaugeTimer = useCallback(() => {
    if (levelGaugeTimerRef.current) {
      clearInterval(levelGaugeTimerRef.current)
    }
    
    levelGaugeRef.current = 0
    levelGaugeTimerRef.current = setInterval(() => {
      levelGaugeRef.current += 100 // 100msごとに増加
      
      // 30秒（30000ms）で1レベル
      const currentLevel = Math.floor(levelGaugeRef.current / 30000) + 1
      const currentLevelProgress = levelGaugeRef.current % 30000
      
      // レベルが変わった場合のみReduxを更新
      if (currentLevel > gameState.level) {
        dispatchRef.current(updateLevel(currentLevel))
        // 落下速度を更新
        if (gameFieldRef.current) {
          gameFieldRef.current.setDropSpeed(currentLevel)
        }
      }
      
      // レベルゲージの進捗をReduxに保存（新しいstateとして）
      dispatchRef.current(updateLevelGaugeProgress(currentLevelProgress))
    }, 100)
  }, [gameState.level])

  const stopLevelGaugeTimer = useCallback(() => {
    if (levelGaugeTimerRef.current) {
      clearInterval(levelGaugeTimerRef.current)
      levelGaugeTimerRef.current = null
    }
  }, [])

  return {
    gameField: gameFieldRef.current,
    startGame: handleStartGame,
    stopGame: handleStopGame,
    // 必要に応じて他の操作関数もエクスポート
  }
}