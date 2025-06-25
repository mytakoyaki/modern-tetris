import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Tetromino } from '@/features/game/utils/tetromino'
import { 
  canMoveTetromino, 
  canRotateTetromino, 
  placeTetromino as placeTetrominoOnField, 
  getCompletedLines, 
  clearLines,
  canSpawnTetromino 
} from '@/features/game/utils/collision'
import { detectSpin, isBackToBackEligible } from '@/features/game/utils/spinDetection'
import { attemptSRSRotation } from '@/features/game/utils/srs'
import type { SpinResult } from '@/types/spin'

export interface GameState {
  // Game field (10x20 grid)
  field: number[][]
  
  // Current piece
  currentPiece: {
    type: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' | null
    x: number
    y: number
    rotation: number
  }
  
  // Last action for spin detection
  lastAction: 'move' | 'rotate' | 'drop' | null
  
  // SRS rotation info for spin detection
  lastRotationKick: {
    wasWallKick: boolean
    kickIndex: number
  } | null
  
  // Next pieces
  nextPieces: ('I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L')[]
  
  // Hold pieces (up to 2 slots)
  holdPieces: [string | null, string | null]
  
  // Game state
  isGameRunning: boolean
  isPaused: boolean
  isGameOver: boolean
  
  // Score and stats
  score: number
  points: number
  level: number
  lines: number
  
  // Time-based stats
  gameTime: number
  blocksPlaced: number
  
  // Spin system
  lastSpin: SpinResult | null
  backToBackCount: number
  comboCount: number
  
  // Fever mode
  feverMode: {
    isActive: boolean
    timeRemaining: number
    blocksUntilActivation: number
  }
  
  // Exchange system
  exchangeCount: number
  exchangeCost: number
  
  // Rank system
  currentRank: {
    name: string
    threshold: number
    index: number
  }
  
  // Layout preference
  layoutOrientation: 'horizontal' | 'vertical'
}

const initialState: GameState = {
  field: Array(20).fill(null).map(() => Array(10).fill(0)),
  currentPiece: {
    type: null,
    x: 4,
    y: 0,
    rotation: 0
  },
  lastAction: null,
  lastRotationKick: null,
  nextPieces: [],
  holdPieces: [null, null],
  isGameRunning: false,
  isPaused: false,
  isGameOver: false,
  score: 0,
  points: 0,
  level: 1,
  lines: 0,
  gameTime: 0,
  blocksPlaced: 0,
  lastSpin: null,
  backToBackCount: 0,
  comboCount: 0,
  feverMode: {
    isActive: false,
    timeRemaining: 0,
    blocksUntilActivation: 20
  },
  exchangeCount: 0,
  exchangeCost: 45,
  currentRank: {
    name: '無段',
    threshold: 0,
    index: 0
  },
  layoutOrientation: 'horizontal'
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.isGameRunning = true
      state.isGameOver = false
      state.isPaused = false
    },
    pauseGame: (state) => {
      state.isPaused = !state.isPaused
    },
    endGame: (state) => {
      state.isGameRunning = false
      state.isGameOver = true
    },
    updateScore: (state, action: PayloadAction<number>) => {
      state.score += action.payload
    },
    updatePoints: (state, action: PayloadAction<number>) => {
      state.points += action.payload
    },
    spawnTetromino: (state, action: PayloadAction<{type: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L', x?: number, y?: number}>) => {
      // ゲームオーバー判定
      if (!canSpawnTetromino(action.payload.type, state.field)) {
        state.isGameRunning = false
        state.isGameOver = true
        state.currentPiece = {
          type: null,
          x: 4,
          y: 0,
          rotation: 0
        }
        return
      }
      
      state.currentPiece = {
        type: action.payload.type,
        x: action.payload.x ?? 4,
        y: action.payload.y ?? 0,
        rotation: 0
      }
    },
    moveTetromino: (state, action: PayloadAction<{dx: number, dy: number}>) => {
      if (state.currentPiece.type) {
        const tetromino = Tetromino.fromData(state.currentPiece)
        
        if (canMoveTetromino(tetromino, action.payload.dx, action.payload.dy, state.field)) {
          state.currentPiece.x += action.payload.dx
          state.currentPiece.y += action.payload.dy
          state.lastAction = action.payload.dy > 0 ? 'drop' : 'move'
        }
      }
    },
    rotateTetromino: (state) => {
      if (state.currentPiece.type) {
        const tetromino = Tetromino.fromData(state.currentPiece)
        
        // SRS回転試行
        const rotationResult = attemptSRSRotation(tetromino, state.field, true)
        
        if (rotationResult.success) {
          state.currentPiece.x = rotationResult.newX
          state.currentPiece.y = rotationResult.newY
          state.currentPiece.rotation = rotationResult.newRotation
          state.lastAction = 'rotate'
          
          // SRS情報を記録（スピン検出用）
          state.lastRotationKick = {
            wasWallKick: rotationResult.wallKickUsed,
            kickIndex: rotationResult.kickIndex
          }
        }
      }
    },
    hardDropTetromino: (state) => {
      if (state.currentPiece.type) {
        const tetromino = Tetromino.fromData(state.currentPiece)
        
        // 着地するまで下に移動
        while (canMoveTetromino(tetromino, 0, 1, state.field)) {
          tetromino.moveDown()
          state.currentPiece.y = tetromino.y
        }
      }
    },
    placeTetromino: (state) => {
      if (state.currentPiece.type) {
        const tetromino = Tetromino.fromData(state.currentPiece)
        
        // フィールドにテトリミノを設置
        state.field = placeTetrominoOnField(tetromino, state.field)
        
        // 完成したラインをチェック
        const completedLines = getCompletedLines(state.field)
        
        if (completedLines.length > 0) {
          // スピン検出
          const spinResult = detectSpin({
            tetromino,
            lastAction: state.lastAction || 'move',
            field: state.field,
            wasWallKick: state.lastRotationKick?.wasWallKick || false,
            kickIndex: state.lastRotationKick?.kickIndex || 0
          }, completedLines.length)
          
          // ラインを削除
          state.field = clearLines(state.field, completedLines)
          
          // 基本スコア計算
          const lineScore = [0, 100, 400, 1000, 2000][completedLines.length] || 0
          let totalScore = lineScore * state.level
          
          // スピンボーナス適用
          if (spinResult.type) {
            totalScore += spinResult.bonus
            state.lastSpin = spinResult
            
            // Back-to-Back判定
            if (isBackToBackEligible(spinResult)) {
              if (state.backToBackCount > 0) {
                totalScore = Math.floor(totalScore * 1.5) // 1.5倍ボーナス
              }
              state.backToBackCount++
            } else {
              state.backToBackCount = 0
            }
          } else {
            // 4ライン消去の場合もBack-to-Back対象
            if (completedLines.length === 4) {
              if (state.backToBackCount > 0) {
                totalScore = Math.floor(totalScore * 1.5)
              }
              state.backToBackCount++
            } else {
              state.backToBackCount = 0
            }
            state.lastSpin = null
          }
          
          // コンボ計算
          state.comboCount++
          if (state.comboCount > 1) {
            const comboBonus = Math.min(state.comboCount - 1, 10) * 50 * state.level
            totalScore += comboBonus
          }
          
          state.score += totalScore
          state.lines += completedLines.length
          
          // レベルアップ判定（10ライン毎にレベルアップ）
          const newLevel = Math.floor(state.lines / 10) + 1
          if (newLevel > state.level) {
            state.level = newLevel
          }
          
          // ポイント計算
          state.points += 10 * completedLines.length
        } else {
          // ライン消去なしの場合、コンボリセット
          state.comboCount = 0
          state.lastSpin = null
        }
        
        // 統計更新
        state.blocksPlaced += 1
        
        // フィーバーモードチェック
        if (state.blocksPlaced % 20 === 0) {
          state.feverMode.isActive = true
          state.feverMode.timeRemaining = 30000
          state.feverMode.blocksUntilActivation = 20
        }
        
        // 現在のピースをクリア
        state.currentPiece = {
          type: null,
          x: 4,
          y: 0,
          rotation: 0
        }
      }
    },
    updateField: (state, action: PayloadAction<number[][]>) => {
      state.field = action.payload
    },
    toggleLayoutOrientation: (state) => {
      state.layoutOrientation = state.layoutOrientation === 'horizontal' ? 'vertical' : 'horizontal'
    },
    activateFeverMode: (state) => {
      state.feverMode.isActive = true
      state.feverMode.timeRemaining = 30000 // 30 seconds
      state.feverMode.blocksUntilActivation = 20
    },
    updateFeverTime: (state, action: PayloadAction<number>) => {
      state.feverMode.timeRemaining = Math.max(0, state.feverMode.timeRemaining - action.payload)
      if (state.feverMode.timeRemaining === 0) {
        state.feverMode.isActive = false
      }
    },
    resetGame: () => {
      return initialState
    }
  }
})

export const {
  startGame,
  pauseGame,
  endGame,
  updateScore,
  updatePoints,
  spawnTetromino,
  moveTetromino,
  rotateTetromino,
  hardDropTetromino,
  placeTetromino,
  updateField,
  toggleLayoutOrientation,
  activateFeverMode,
  updateFeverTime,
  resetGame
} = gameSlice.actions

export default gameSlice.reducer