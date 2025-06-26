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
  moveTetromino,
  rotateTetromino,
  hardDropTetromino,
  placeTetromino,
  updateField,
  updateFeverTime,
  exchangePiece,
  holdPiece,
  updateNextPieces,
  resetGame,
  updateLevel,
  updateGameTime,
  updateLevelGaugeProgress
} from '@/store/slices/gameSlice'
import { 
  updateSessionStats, 
  startNewGame,
  loadAchievementsFromStorage 
} from '@/store/slices/achievementSlice'
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
    
    // アチーブメント初期化（localStorage から復元）
    const savedAchievements = localStorage.getItem('tetris-achievements')
    const savedGlobalStats = localStorage.getItem('tetris-global-stats')
    
    if (savedAchievements && savedGlobalStats) {
      try {
        const achievements = JSON.parse(savedAchievements)
        const globalStats = JSON.parse(savedGlobalStats)
        dispatchRef.current(loadAchievementsFromStorage({ achievements, globalStats }))
      } catch (error) {
        console.warn('Failed to load achievements from storage:', error)
      }
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
    
    // DEBUG: ゲームループの動作状態を表示（100フレームごと）
    if (Math.floor(currentTime / 1000) % 2 === 0 && currentTime % 100 < 16) {
      console.log('[DEBUG] Game Loop Status:', {
        running: currentGameState.isGameRunning,
        paused: currentGameState.isPaused,
        currentTetromino: gameFieldRef.current?.currentTetromino?.type || 'none',
        fieldHasContent: gameFieldRef.current?.field.some(row => row.some(cell => cell !== null)) || false
      })
    }
    
    if (!currentGameState.isGameRunning || currentGameState.isPaused || !gameFieldRef.current) {
      return
    }

    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime

    // ゲームフィールド更新
    const updateResult = gameFieldRef.current.update(deltaTime)
    
    if (updateResult) {
      if (updateResult.needsSpawn) {
        console.log('[DEBUG] Spawning new tetromino...')
        
        // 新しいテトリミノをスポーン
        if (!gameFieldRef.current.spawnTetromino()) {
          console.log('[DEBUG] Game Over - cannot spawn tetromino')
          dispatchRef.current(endGame())
          return
        }
        
        console.log('[DEBUG] New tetromino spawned:', gameFieldRef.current.currentTetromino?.type)
        
        // スポーン成功時はNEXTピースのみ更新（テトリミノは表示フィールドに含まれる）
        const nextPieces = gameFieldRef.current.getNextPieces(5)
        dispatchRef.current(updateNextPieces(nextPieces))
      }

      if (updateResult.tetrominoLocked) {
        console.log('[DEBUG] Tetromino locked - dispatching placeTetromino')
        console.log('[DEBUG] Current blocksPlaced before dispatch:', currentGameState.blocksPlaced)
        console.log('[DEBUG] Current feverMode state:', currentGameState.feverMode)
        
        // テトリミノが設置されたときは常にplaceTetromino()を呼び出し（フィーバーモード更新のため）
        dispatchRef.current(placeTetromino())
        
        // Dispatch後の状態をチェック（非同期なので次のフレームで確認）
        setTimeout(() => {
          const newGameState = store.getState().game
          console.log('[DEBUG] State after placeTetromino dispatch:')
          console.log('[DEBUG] - blocksPlaced:', newGameState.blocksPlaced)
          console.log('[DEBUG] - feverMode:', newGameState.feverMode)
        }, 0)
        
        // ライン消去がある場合の追加処理
        if (updateResult.clearedLines && updateResult.clearedLines.length > 0) {
          const clearedLinesCount = updateResult.clearedLines.length
          console.log('[DEBUG] Lines cleared:', clearedLinesCount)
          
          // スコア計算とRedux更新
          const baseScore = [0, 100, 400, 1000, 2000][clearedLinesCount] || 0
          const levelMultiplier = currentGameState.level
          const finalScore = baseScore * levelMultiplier
          
          console.log('[DEBUG] Score added:', finalScore)
          
          dispatchRef.current(updateScore(finalScore))
          
          // アチーブメント統計を更新
          dispatchRef.current(updateSessionStats({
            linesCleared: currentGameState.lines + clearedLinesCount,
            score: currentGameState.score + finalScore,
            blocksPlaced: currentGameState.blocksPlaced + 1,
            tetrisCount: clearedLinesCount === 4 ? currentGameState.tetrisCount + 1 : currentGameState.tetrisCount,
            level: currentGameState.level,
            playTime: localGameTimeRef.current
          }))
        } else {
          // ライン消去がない場合でもブロック設置統計は更新
          dispatchRef.current(updateSessionStats({
            blocksPlaced: currentGameState.blocksPlaced + 1
          }))
        }
      }
    }

    // フィールド状態をReduxに同期（現在のテトリミノを含む表示用フィールド）
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
      
      // アチーブメントの新しいゲーム開始を通知
      dispatchRef.current(startNewGame())
      
      // ゲームフィールドをリセット
      gameFieldRef.current.reset()
      
      // 空のフィールドをReduxに送信（初期化）
      const emptyField = gameFieldRef.current.getFieldWithCurrentTetromino()
      dispatchRef.current(updateField(emptyField as any))
      
      // 最初のテトリミノを生成
      console.log('[DEBUG] Starting new game...')
      
      const spawnSuccess = gameFieldRef.current.spawnTetromino()
      
      if (spawnSuccess) {
        console.log('[DEBUG] Initial tetromino spawned:', gameFieldRef.current.currentTetromino?.type)
        
        // 初期NEXTピースを設定
        const nextPieces = gameFieldRef.current.getNextPieces(5)
        dispatchRef.current(updateNextPieces(nextPieces))
        
        // テトリミノは表示フィールドに含まれるのでReduxに追加不要
      } else {
        console.log('[DEBUG] Failed to spawn initial tetromino')
      }
      
      // ゲームを開始状態に設定
      dispatchRef.current(startGame())
      
      // 初期落下速度を設定
      gameFieldRef.current.setDropSpeed(1)
      
      lastTimeRef.current = performance.now()
      localGameTimeRef.current = 0
      lastSyncTimeRef.current = 0
      animationFrameRef.current = requestAnimationFrame(gameLoop)
      
      // レベルゲージタイマーを開始
      startLevelGaugeTimer()
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
    
    // 最終スコアでアチーブメント統計を更新
    const currentGameState = store.getState().game
    dispatchRef.current(updateSessionStats({
      score: currentGameState.score,
      linesCleared: currentGameState.lines,
      level: currentGameState.level,
      playTime: localGameTimeRef.current
    }))
    
    dispatchRef.current(endGame())
    // ゲーム終了時にlocalStorageをクリア
    localStorage.removeItem('tetris-game-state')
  }, [])

  // 移動処理
  const handleMoveLeft = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      console.log('[DEBUG] Move left input')
      const result = gameFieldRef.current.moveTetromino(-1, 0)
      if (result) {
        dispatchRef.current(moveTetromino({ dx: -1, dy: 0 }))
      }
    }
  }, [gameState.isGameRunning])

  const handleMoveRight = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      console.log('[DEBUG] Move right input')
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
      }
    }
  }, [gameState.isGameRunning])

  const handleHardDrop = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      console.log('[DEBUG] Hard drop executed - dispatching placeTetromino')
      console.log('[DEBUG] Current blocksPlaced before hard drop:', gameState.blocksPlaced)
      console.log('[DEBUG] Current feverMode state before hard drop:', gameState.feverMode)
      
      gameFieldRef.current.hardDrop()
      dispatchRef.current(hardDropTetromino())
      
      // ハードドロップ時は常にplaceTetromino()を呼び出し（フィーバーモード更新のため）
      dispatchRef.current(placeTetromino())
      
      // Dispatch後の状態をチェック
      setTimeout(() => {
        const newGameState = store.getState().game
        console.log('[DEBUG] Hard drop - State after placeTetromino dispatch:')
        console.log('[DEBUG] - blocksPlaced:', newGameState.blocksPlaced)
        console.log('[DEBUG] - feverMode:', newGameState.feverMode)
      }, 0)
      
      // ブロック設置統計を更新
      dispatchRef.current(updateSessionStats({
        blocksPlaced: gameState.blocksPlaced + 1
      }))
      
      // ハードドロップ完了後のライン消去チェック
      const clearedLines = gameFieldRef.current.getCompletedLines()
      if (clearedLines.length > 0) {
        const baseScore = [0, 100, 400, 1000, 2000][clearedLines.length] || 0
        const finalScore = baseScore * gameState.level
        dispatchRef.current(updateScore(finalScore))
        
        // アチーブメント統計を更新
        dispatchRef.current(updateSessionStats({
          linesCleared: gameState.lines + clearedLines.length,
          score: gameState.score + finalScore,
          tetrisCount: clearedLines.length === 4 ? gameState.tetrisCount + 1 : gameState.tetrisCount
        }))
      }
      
      // ハードドロップ後のスポーンはゲームループに任せる
      // gameField.hardDrop()のlockTetromino()が呼ばれると、次のupdate()でneedsSpawnがtrueになる
    }
  }, [gameState.isGameRunning, gameState.level, gameState.blocksPlaced, gameState.lines, gameState.score, gameState.tetrisCount])

  // 回転処理
  const handleRotate = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      console.log('[DEBUG] Rotate input')
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
      
      // ホールド使用統計を更新
      dispatchRef.current(updateSessionStats({
        holdCount: gameState.holdCount + 1
      }))
    }
  }, [gameState.isGameRunning, gameState.holdCount])

  const handleHold2 = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatchRef.current(holdPiece({ slotIndex: 1 }))
      
      // ホールド使用統計を更新
      dispatchRef.current(updateSessionStats({
        holdCount: gameState.holdCount + 1
      }))
    }
  }, [gameState.isGameRunning, gameState.holdCount])

  // エクスチェンジ処理
  const handleExchange = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      dispatchRef.current(exchangePiece())
      
      // エクスチェンジ使用統計を更新
      dispatchRef.current(updateSessionStats({
        exchangeCount: gameState.exchangeCount + 1
      }))
    }
  }, [gameState.isGameRunning, gameState.exchangeCount])

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
    console.log('[DEBUG] Game state changed:', {
      isGameRunning: gameState.isGameRunning,
      isPaused: gameState.isPaused,
      isGameOver: gameState.isGameOver,
      hasAnimationFrame: !!animationFrameRef.current,
      score: gameState.score,
      level: gameState.level
    })
    
    if (gameState.isGameRunning && !gameState.isPaused && !animationFrameRef.current) {
      console.log('[DEBUG] Starting game loop...')
      lastTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    
    if (!gameState.isGameRunning && animationFrameRef.current) {
      console.log('[DEBUG] Stopping game loop...')
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [gameState.isGameRunning, gameState.isPaused, gameState.isGameOver, gameState.score, gameState.level])

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