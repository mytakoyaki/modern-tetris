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
import type { PointsState, PointsGained, ExchangeResult } from '@/types/points'
import { POINTS_CONFIG, EXCHANGE_COSTS, FEVER_CONFIG } from '@/types/points'
import type { Rank, RankProgress } from '@/types/rank'
import { RANKS } from '@/types/rank'
import { 
  calculatePointsGained, 
  getCurrentExchangeCost, 
  attemptExchange,
  resetExchangeCount,
  createInitialPointsState
} from '@/features/game/utils/pointsSystem'
import { 
  getCurrentRank, 
  calculateRankProgress, 
  checkPromotion,
  calculateRankBonus
} from '@/features/game/utils/rankSystem'

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
  level: number
  lines: number
  
  // Point and Exchange system
  pointSystem: PointsState
  recentPointsGained: PointsGained[]
  
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
  
  // Rank system
  currentRank: Rank
  rankProgress: RankProgress
  recentPromotions: Rank[]
  
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
  level: 1,
  lines: 0,
  pointSystem: createInitialPointsState(),
  recentPointsGained: [],
  gameTime: 0,
  blocksPlaced: 0,
  lastSpin: null,
  backToBackCount: 0,
  comboCount: 0,
  feverMode: {
    isActive: false,
    timeRemaining: 0,
    blocksUntilActivation: FEVER_CONFIG.BLOCKS_NEEDED
  },
  currentRank: RANKS[0],
  rankProgress: {
    currentRank: RANKS[0],
    nextRank: RANKS[1],
    progressToNext: 0,
    isPromoted: false
  },
  recentPromotions: [],
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
      const oldScore = state.score
      state.score += action.payload
      
      // 段位チェック
      const promotionCheck = checkPromotion(oldScore, state.score)
      
      if (promotionCheck.wasPromoted) {
        // 昇格処理
        state.currentRank = promotionCheck.newRank
        state.recentPromotions.push(promotionCheck.newRank)
        
        // 昇格ボーナス
        const rankBonus = calculateRankBonus(promotionCheck.rankUp)
        state.score += rankBonus.scoreBonus
        state.pointSystem.totalPoints += rankBonus.pointBonus
        
        // 昇格ボーナスの記録
        const promotionPoints = calculatePointsGained('rank-bonus', rankBonus.pointBonus)
        state.recentPointsGained.push(promotionPoints)
      }
      
      // 段位進捗更新
      state.rankProgress = calculateRankProgress(state.score)
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
          
          // ソフトドロップポイント（下方向の移動時）
          if (action.payload.dy > 0) {
            const pointsGained = calculatePointsGained('soft-drop', action.payload.dy)
            state.pointSystem.totalPoints += pointsGained.total
            state.pointSystem.lastDropBonus = pointsGained.total
            state.recentPointsGained.push(pointsGained)
          }
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
        const initialY = tetromino.y
        
        // 着地するまで下に移動
        while (canMoveTetromino(tetromino, 0, 1, state.field)) {
          tetromino.moveDown()
          state.currentPiece.y = tetromino.y
        }
        
        // ハードドロップポイント計算
        const dropDistance = state.currentPiece.y - initialY
        if (dropDistance > 0) {
          const pointsGained = calculatePointsGained('hard-drop', dropDistance)
          state.pointSystem.totalPoints += pointsGained.total
          state.pointSystem.lastDropBonus = pointsGained.total
          state.recentPointsGained.push(pointsGained)
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
          
          // フィーバーモード倍率適用
          if (state.feverMode.isActive) {
            totalScore = Math.floor(totalScore * FEVER_CONFIG.SCORE_MULTIPLIER)
          }
          
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
          
          // ライン消去ボーナスポイント（追加実装予定）
        } else {
          // ライン消去なしの場合、コンボリセット
          state.comboCount = 0
          state.lastSpin = null
        }
        
        // 基本設置ポイント
        const placementPoints = calculatePointsGained('placement', 1)
        state.pointSystem.totalPoints += placementPoints.total
        state.recentPointsGained.push(placementPoints)
        
        // エクスチェンジカウントリセット（テトリミノ設置時）
        state.pointSystem.exchangeCount = resetExchangeCount()
        
        // 統計更新
        state.blocksPlaced += 1
        
        // フィーバーモードチェック
        if (state.blocksPlaced % FEVER_CONFIG.BLOCKS_NEEDED === 0) {
          state.feverMode.isActive = true
          state.feverMode.timeRemaining = FEVER_CONFIG.DURATION
          state.feverMode.blocksUntilActivation = FEVER_CONFIG.BLOCKS_NEEDED
        } else {
          state.feverMode.blocksUntilActivation = FEVER_CONFIG.BLOCKS_NEEDED - (state.blocksPlaced % FEVER_CONFIG.BLOCKS_NEEDED)
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
      state.feverMode.timeRemaining = FEVER_CONFIG.DURATION
      state.feverMode.blocksUntilActivation = FEVER_CONFIG.BLOCKS_NEEDED
    },
    updateFeverTime: (state, action: PayloadAction<number>) => {
      state.feverMode.timeRemaining = Math.max(0, state.feverMode.timeRemaining - action.payload)
      if (state.feverMode.timeRemaining === 0) {
        state.feverMode.isActive = false
      }
    },
    exchangePiece: (state, action: PayloadAction<{newPieceType: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'}>) => {
      const exchangeResult = attemptExchange(
        state.pointSystem.totalPoints,
        state.pointSystem.exchangeCount,
        state.feverMode.isActive
      )
      
      if (!exchangeResult.success) {
        return // 交換失敗時はアクションなし
      }
      
      const currentPieceType = state.currentPiece.type
      const newPieceType = action.payload.newPieceType
      
      // ポイント・カウント更新
      state.pointSystem.totalPoints = exchangeResult.remainingPoints
      state.pointSystem.exchangeCount = exchangeResult.newExchangeCount
      
      // 現在のピースを新しいピースに交換
      state.currentPiece = {
        type: newPieceType,
        x: 4,
        y: 0,
        rotation: 0
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
  spawnTetromino,
  moveTetromino,
  rotateTetromino,
  hardDropTetromino,
  placeTetromino,
  updateField,
  toggleLayoutOrientation,
  activateFeverMode,
  updateFeverTime,
  exchangePiece,
  resetGame
} = gameSlice.actions

export default gameSlice.reducer