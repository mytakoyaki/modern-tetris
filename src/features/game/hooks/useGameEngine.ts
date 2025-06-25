/**
 * ゲームエンジンフック
 * HTML版のゲームエンジンをReact+Reduxで再実装
 */

import { useEffect, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
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
  updateGameTime
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

  // ゲームフィールド初期化
  useEffect(() => {
    if (!gameFieldRef.current) {
      gameFieldRef.current = new GameField()
    }
  }, [])

  // ゲームループ
  const gameLoop = useCallback((currentTime: number) => {
    if (!gameState.isGameRunning || gameState.isPaused || !gameFieldRef.current) {
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
          dispatch(endGame())
          return
        } else {
          // スポーン成功、Reduxステートを更新
          const currentTetromino = gameFieldRef.current.currentTetromino
          if (currentTetromino) {
            dispatch(spawnTetromino({
              type: currentTetromino.type,
              x: currentTetromino.x,
              y: currentTetromino.y
            }))
          }
        }
      }

      if (updateResult.tetrominoLocked && updateResult.clearedLines) {
        // ライン消去処理
        const clearedLinesCount = updateResult.clearedLines.length
        if (clearedLinesCount > 0) {
          // スコア計算とRedux更新
          const baseScore = [0, 100, 400, 1000, 2000][clearedLinesCount] || 0
          const levelMultiplier = gameState.level
          const finalScore = baseScore * levelMultiplier
          
          dispatch(updateScore(finalScore))
          dispatch(placeTetromino())
        }
      }
    }

    // フィールド状態をReduxに同期
    const displayField = gameFieldRef.current.getFieldWithCurrentTetromino()
    dispatch(updateField(displayField))

    // フィーバーモードタイマー更新
    if (gameState.feverMode.isActive) {
      dispatch(updateFeverTime(deltaTime))
    }

    // ローカルゲーム時間更新
    localGameTimeRef.current += deltaTime

    // 100msごとにReduxに同期（より滑らかな更新のため）
    if (localGameTimeRef.current - lastSyncTimeRef.current >= 100) {
      dispatch(updateGameTime(localGameTimeRef.current - lastSyncTimeRef.current))
      lastSyncTimeRef.current = localGameTimeRef.current
    }

    // 時間ベースのレベルアップ（30秒ごと）
    const timeBasedLevel = Math.floor(localGameTimeRef.current / 30000) + 1
    if (timeBasedLevel > gameState.level) {
      dispatch(updateLevel(timeBasedLevel))
    }

    // 次のフレーム
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [gameState.isGameRunning, gameState.isPaused, gameState.level, gameState.feverMode.isActive, dispatch])

  // ゲーム開始
  const handleStartGame = useCallback(() => {
    if (gameFieldRef.current) {
      // Reduxの状態をリセット
      dispatch(resetGame())
      
      // ゲームフィールドをリセット
      gameFieldRef.current.reset()
      
      // ゲームを開始状態に設定
      dispatch(startGame())
      
      // 最初のテトリミノをスポーン
      const spawnResult = gameFieldRef.current.spawnTetromino()
      
      if (spawnResult) {
        // 初期NEXTピースを設定
        const nextPieces = gameFieldRef.current.getNextPieces(5)
        dispatch(updateNextPieces(nextPieces))
        
        // 現在のピースをReduxに設定
        const currentTetromino = gameFieldRef.current.currentTetromino
        if (currentTetromino) {
          dispatch(spawnTetromino({
            type: currentTetromino.type,
            x: currentTetromino.x,
            y: currentTetromino.y
          }))
        }
        
        // フィールド状態をReduxに同期（空のフィールドから開始）
        const displayField = gameFieldRef.current.getFieldWithCurrentTetromino()
        dispatch(updateField(displayField))
        
        lastTimeRef.current = performance.now()
        localGameTimeRef.current = 0
        lastSyncTimeRef.current = 0
        animationFrameRef.current = requestAnimationFrame(gameLoop)
      } else {
        // スポーンに失敗した場合
        dispatch(endGame())
      }
    }
  }, [dispatch, gameLoop])

  // ゲーム停止
  const handleStopGame = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    dispatch(endGame())
  }, [dispatch])

  // 移動処理
  const handleMoveLeft = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      const result = gameFieldRef.current.moveTetromino(-1, 0)
      if (result) {
        dispatch(moveTetromino({ dx: -1, dy: 0 }))
      }
    }
  }, [gameState.isGameRunning, dispatch])

  const handleMoveRight = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      const result = gameFieldRef.current.moveTetromino(1, 0)
      if (result) {
        dispatch(moveTetromino({ dx: 1, dy: 0 }))
      }
    }
  }, [gameState.isGameRunning, dispatch])

  const handleSoftDrop = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      const result = gameFieldRef.current.moveTetromino(0, 1)
      if (result) {
        dispatch(moveTetromino({ dx: 0, dy: 1 }))
        
        // ソフトドロップポイント（既存のポイントシステムと連携）
        if (result.isSoftDrop) {
          // ポイント計算は既存のmoveTetrominoアクションで処理
        }
      }
    }
  }, [gameState.isGameRunning, dispatch])

  const handleHardDrop = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      gameFieldRef.current.hardDrop()
      dispatch(hardDropTetromino())
      
      // ハードドロップ完了後のライン消去チェック
      const clearedLines = gameFieldRef.current.getCompletedLines()
      if (clearedLines.length > 0) {
        const baseScore = [0, 100, 400, 1000, 2000][clearedLines.length] || 0
        const finalScore = baseScore * gameState.level
        dispatch(updateScore(finalScore))
      }
    }
  }, [gameState.isGameRunning, gameState.level, dispatch])

  // 回転処理
  const handleRotate = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      const success = gameFieldRef.current.rotateTetromino(true)
      if (success) {
        dispatch(rotateTetromino())
      }
    }
  }, [gameState.isGameRunning, dispatch])

  const handleRotateCounterClockwise = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      const success = gameFieldRef.current.rotateTetromino(false)
      if (success) {
        dispatch(rotateTetromino())
      }
    }
  }, [gameState.isGameRunning, dispatch])

  // ホールド処理
  const handleHold1 = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatch(holdPiece({ slotIndex: 0 }))
    }
  }, [gameState.isGameRunning, dispatch])

  const handleHold2 = useCallback(() => {
    if (gameState.isGameRunning) {
      dispatch(holdPiece({ slotIndex: 1 }))
    }
  }, [gameState.isGameRunning, dispatch])

  // エクスチェンジ処理
  const handleExchange = useCallback(() => {
    if (gameFieldRef.current && gameState.isGameRunning) {
      dispatch(exchangePiece())
    }
  }, [gameState.isGameRunning, dispatch])

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
    if (gameState.isGameRunning && !gameState.isPaused && !animationFrameRef.current) {
      lastTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    
    if (!gameState.isGameRunning && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [gameState.isGameRunning, gameState.isPaused, gameLoop])

  return {
    gameField: gameFieldRef.current,
    startGame: handleStartGame,
    stopGame: handleStopGame,
    // 必要に応じて他の操作関数もエクスポート
  }
}