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
  moveTetromino,
  rotateTetromino,
  hardDropTetromino,
  placeTetromino,
  lockTetromino,
  spawnNextTetromino,
  updateFeverTime,
  updateDropTimer,
  setSoftDropping,
  exchangePiece,
  holdPiece,
  updateNextPieces,
  resetGame,
  updateLevel,
  updateGameTime,
  updateLevelGaugeProgress,
  updateDropInterval,
  spawnTetromino
} from '@/store/slices/gameSlice'
import { 
  updateSessionStats, 
  startNewGame,
  loadAchievementsFromStorage 
} from '@/store/slices/achievementSlice'
import { useKeyboardInput } from './useKeyboardInput'

export const useGameEngine = () => {
  const dispatch = useDispatch()
  const gameState = useSelector((state: RootState) => state.game)
  
  // 純Redux-based ゲームエンジン
  const animationFrameRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const localGameTimeRef = useRef<number>(0)
  const lastSyncTimeRef = useRef<number>(0)
  
  // レベルゲージ用の独立したタイマー
  const levelGaugeRef = useRef<number>(0)
  const levelGaugeTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // ライン消去コールバック
  const onLineClearRef = useRef<((linesCleared: number, score: number, isTSpin: boolean, isPerfectClear: boolean) => void) | null>(null)
  
  // dispatchの参照を安定化
  const dispatchRef = useRef(dispatch)
  dispatchRef.current = dispatch

  // アチーブメント初期化
  useEffect(() => {
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

  // 純Redux-based ゲームループ
  const gameLoop = useCallback((currentTime: number) => {
    // 最新のゲーム状態を取得
    const currentGameState = store.getState().game
    
    if (!currentGameState.isGameRunning || currentGameState.isPaused) {
      return
    }

    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime

    // Redux自動落下タイマー更新（自動ロック処理含む）
    dispatchRef.current(updateDropTimer(deltaTime))

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

  // ゲーム開始（完全Redux-based）
  const handleStartGame = useCallback(() => {
      // 古いゲーム状態をクリア
    localStorage.removeItem('tetris-game-state')
    
    // Reduxの状態をリセット
    dispatchRef.current(resetGame())
    
    // アチーブメントの新しいゲーム開始を通知
    dispatchRef.current(startNewGame())
    
    // ランダムピース生成関数
    const generateRandomPiece = (): 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' => {
      const pieces: ('I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L')[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
      return pieces[Math.floor(Math.random() * pieces.length)]
    }
    
    // ゲームを開始状態に設定
    dispatchRef.current(startGame())
    
    // 初期NextPiecesを生成
    const initialNextPieces = [
      generateRandomPiece(),
      generateRandomPiece(),
      generateRandomPiece(),
      generateRandomPiece(),
      generateRandomPiece()
    ]
    dispatchRef.current(updateNextPieces(initialNextPieces))
    
    // 最初のテトリミノをスポーン
    const firstPiece = generateRandomPiece()
    dispatchRef.current(spawnTetromino({ type: firstPiece }))
    
    lastTimeRef.current = performance.now()
    localGameTimeRef.current = 0
    lastSyncTimeRef.current = 0
    animationFrameRef.current = requestAnimationFrame(gameLoop)
    
    // レベルゲージタイマーを開始
    startLevelGaugeTimer()
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

  // 純Redux移動処理
  const handleMoveLeft = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatchRef.current(moveTetromino({ dx: -1, dy: 0 }))
    }
  }, [gameState.isGameRunning])

  const handleMoveRight = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatchRef.current(moveTetromino({ dx: 1, dy: 0 }))
    }
  }, [gameState.isGameRunning])

  const handleSoftDrop = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatchRef.current(moveTetromino({ dx: 0, dy: 1 }))
    }
  }, [gameState.isGameRunning])

  const handleSoftDropStart = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatchRef.current(setSoftDropping(true))
    }
  }, [gameState.isGameRunning])

  const handleSoftDropEnd = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatchRef.current(setSoftDropping(false))
    }
  }, [gameState.isGameRunning])

  const handleHardDrop = useCallback(() => {
    if (gameState.isGameRunning && gameState.currentPiece.type) {
      // Pure Redux hard drop
      dispatchRef.current(hardDropTetromino({}))
      dispatchRef.current(placeTetromino())
      dispatchRef.current(lockTetromino())
      dispatchRef.current(spawnNextTetromino())
      
      // ブロック設置統計を更新
      dispatchRef.current(updateSessionStats({
        blocksPlaced: gameState.blocksPlaced + 1
      }))
    }
  }, [gameState.isGameRunning, gameState.blocksPlaced, gameState.currentPiece.type])

  // 純Redux回転処理
  const handleRotate = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatchRef.current(rotateTetromino({ clockwise: true }))
    }
  }, [gameState.isGameRunning])

  const handleRotateCounterClockwise = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatchRef.current(rotateTetromino({ clockwise: false }))
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
    if (gameState.isGameRunning) {
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
    onSoftDropStart: handleSoftDropStart,
    onSoftDropEnd: handleSoftDropEnd,
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
    if (gameState.isGameRunning && !gameState.isPaused && !animationFrameRef.current) {
      lastTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    
    if (!gameState.isGameRunning && animationFrameRef.current) {
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
        // Redux内の落下速度も更新
        const fallSpeeds: {[key: number]: number} = {
          1: 1000, 2: 900, 3: 800, 4: 700, 5: 600,
          6: 550, 7: 500, 8: 450, 9: 400, 10: 400,
          11: 380, 12: 360, 13: 340, 14: 320, 15: 300,
          16: 280, 17: 260, 18: 250, 19: 240, 20: 250,
          21: 240, 22: 230, 23: 220, 24: 210, 25: 220,
          26: 210, 27: 205, 28: 200, 29: 200, 30: 200
        }
        const newDropInterval = fallSpeeds[currentLevel] || 200
        dispatchRef.current(updateDropInterval(newDropInterval))
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
    startGame: handleStartGame,
    stopGame: handleStopGame,
    onLineClear: onLineClearRef.current,
    setOnLineClear: (callback: (linesCleared: number, score: number, isTSpin: boolean, isPerfectClear: boolean) => void) => {
      onLineClearRef.current = callback
    },
    // 必要に応じて他の操作関数もエクスポート
  }
}