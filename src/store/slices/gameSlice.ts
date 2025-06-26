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
  getNextExchangeCost, 
  attemptExchange,
  resetExchangeCount,
  createInitialPointsState,
  getHoldCost
} from '@/features/game/utils/pointsSystem'
import { 
  getCurrentRank, 
  calculateRankProgress, 
  checkPromotion,
  calculateRankBonus
} from '@/features/game/utils/rankSystem'

export interface GameState {
  // Game field (10x20 grid)
  field: (number | null)[][]
  
  // Current piece
  currentPiece: {
    type: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' | null
    x: number
    y: number
    rotation: number
  }
  
  // Hold pieces (up to 2 slots)
  holdSlots: [string | null, string | null]
  canHold: boolean
  usedHoldSlots: number[]
  
  // Last action for spin detection
  lastAction: 'move' | 'rotate' | 'drop' | null
  
  // SRS rotation info for spin detection
  lastRotationKick: {
    wasWallKick: boolean
    kickIndex: number
  } | null
  
  // Next pieces
  nextPieces: ('I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L')[]
  
  
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
  tetrisCount: number
  holdCount: number
  exchangeCount: number
  
  // Level gauge progress (独立したタイマー用)
  levelGaugeProgress: number
  
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
  field: Array(20).fill(null).map(() => Array(10).fill(null)),
  currentPiece: {
    type: null,
    x: 3,
    y: 0,
    rotation: 0
  },
  holdSlots: [null, null],
  canHold: true,
  usedHoldSlots: [],
  lastAction: null,
  lastRotationKick: null,
  nextPieces: [],
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
  tetrisCount: 0,
  holdCount: 0,
  exchangeCount: 0,
  levelGaugeProgress: 0,
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
      // ゲームが実行中でない場合は何もしない
      if (!state.isGameRunning) return
      
      // ゲームオーバー判定
      if (!canSpawnTetromino(action.payload.type, state.field)) {
        state.isGameRunning = false
        state.isGameOver = true
        state.currentPiece = {
          type: null,
          x: 3,
          y: 0,
          rotation: 0
        }
        return
      }
      
      state.currentPiece = {
        type: action.payload.type,
        x: action.payload.x ?? 3,
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
            console.log('[DEBUG] Soft drop points awarded:', pointsGained.total, 'for distance:', action.payload.dy)
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
    hardDropTetromino: (state, action: PayloadAction<{distance?: number}>) => {
      // GameFieldからの距離が提供された場合はそれを使用、そうでなければ計算
      let dropDistance = action.payload?.distance || 0
      
      if (dropDistance === 0 && state.currentPiece.type) {
        // Fallback: Redux側で計算（GameFieldと同期しない場合の対応）
        const tetromino = Tetromino.fromData(state.currentPiece)
        const initialY = tetromino.y
        
        // 着地するまで下に移動
        while (canMoveTetromino(tetromino, 0, 1, state.field)) {
          tetromino.moveDown()
          state.currentPiece.y = tetromino.y
        }
        
        dropDistance = state.currentPiece.y - initialY
      }
      
      console.log('[DEBUG] Hard drop distance calculation:', {
        providedDistance: action.payload?.distance,
        calculatedDistance: dropDistance,
        finalDistance: dropDistance
      })
      
      // ハードドロップポイント計算
      if (dropDistance > 0) {
        const pointsGained = calculatePointsGained('hard-drop', dropDistance)
        state.pointSystem.totalPoints += pointsGained.total
        state.pointSystem.lastDropBonus = pointsGained.total
        state.recentPointsGained.push(pointsGained)
        console.log('[DEBUG] Hard drop points awarded:', pointsGained.total, 'for distance:', dropDistance)
      }
    },
    placeTetromino: (state) => {
      console.log('[DEBUG] placeTetromino reducer called, blocksPlaced BEFORE:', state.blocksPlaced)
      console.log('[DEBUG] placeTetromino reducer - currentPiece:', state.currentPiece)
      
      // currentPiece.typeのチェックを削除し、常にブロック設置処理を実行
      console.log('[DEBUG] placeTetromino - proceeding without currentPiece.type check...')
      
      // フィールド操作は既にGameFieldで処理済みなのでスキップ
      // ライン消去処理もGameEngineで処理済みなのでスキップして、直接統計更新に進む
      
      // 基本設置ポイント
      const placementPoints = calculatePointsGained('placement', 1)
      state.pointSystem.totalPoints += placementPoints.total
      state.recentPointsGained.push(placementPoints)
      
      // エクスチェンジカウントリセット（テトリミノ設置時）
      state.pointSystem.exchangeCount = resetExchangeCount()
      
      // 統計更新
      state.blocksPlaced += 1
      
      // フィーバーモードチェック
      console.log('[DEBUG] Fever mode check - blocksPlaced AFTER increment:', state.blocksPlaced, 'BLOCKS_NEEDED:', FEVER_CONFIG.BLOCKS_NEEDED)
      if (state.blocksPlaced % FEVER_CONFIG.BLOCKS_NEEDED === 0) {
        console.log('[DEBUG] Fever mode ACTIVATED!')
        state.feverMode.isActive = true
        state.feverMode.timeRemaining = FEVER_CONFIG.DURATION
        state.feverMode.blocksUntilActivation = FEVER_CONFIG.BLOCKS_NEEDED
      } else {
        const newBlocksUntilActivation = FEVER_CONFIG.BLOCKS_NEEDED - (state.blocksPlaced % FEVER_CONFIG.BLOCKS_NEEDED)
        console.log('[DEBUG] Fever mode update - blocksUntilActivation:', newBlocksUntilActivation)
        state.feverMode.blocksUntilActivation = newBlocksUntilActivation
      }
      
      console.log('[DEBUG] placeTetromino - after fever mode update, blocksPlaced:', state.blocksPlaced, 'blocksUntilActivation:', state.feverMode.blocksUntilActivation)
      
      // ホールドを再度可能にする
      state.canHold = true
      state.usedHoldSlots = []
    },
    updateField: (state, action: PayloadAction<(number | null)[][]>) => {
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
    updateLevel: (state, action: PayloadAction<number>) => {
      state.level = action.payload
    },
    updateGameTime: (state, action: PayloadAction<number>) => {
      state.gameTime += action.payload
    },
    updateLevelGaugeProgress: (state, action: PayloadAction<number>) => {
      state.levelGaugeProgress = action.payload
    },
    exchangePiece: (state) => {
      const exchangeResult = attemptExchange(
        state.pointSystem.totalPoints,
        state.pointSystem.exchangeCount,
        state.feverMode.isActive
      );

      if (!exchangeResult.success) {
        return; // 交換失敗時はアクションなし
      }

      // ポイント・カウント更新
      state.pointSystem.totalPoints = exchangeResult.remainingPoints;
      state.pointSystem.exchangeCount = exchangeResult.newExchangeCount;
      state.pointSystem.nextExchangeCost = getNextExchangeCost(exchangeResult.newExchangeCount);

      // 交換可能なピースのリストを作成
      const availablePieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      const currentPieceType = state.currentPiece.type;
      const filteredPieces = availablePieces.filter(p => p !== currentPieceType);

      // 新しいピースをランダムに選択
      const newPieceType = filteredPieces[Math.floor(Math.random() * filteredPieces.length)];
      
      // 現在のピースの位置を保持
      const { x, y } = state.currentPiece;

      // 現在のピースを新しいピースに交換
      state.currentPiece = {
        type: newPieceType,
        x: x, // 元の位置を維持
        y: y, // 元の位置を維持
        rotation: 0
      };
    },
    holdPiece: (state, action: PayloadAction<{slotIndex: 0 | 1}>) => {
      if (!state.canHold || state.usedHoldSlots.includes(action.payload.slotIndex)) {
        return
      }
      
      // ホールドコストチェック
      const holdCost = getHoldCost(state.feverMode.isActive)
      if (state.pointSystem.totalPoints < holdCost) {
        return // ポイント不足の場合はホールド不可
      }
      
      const slotIndex = action.payload.slotIndex
      const currentPieceType = state.currentPiece.type
      const heldPieceType = state.holdSlots[slotIndex]
      
      if (currentPieceType) {
        // ホールドコストを消費
        state.pointSystem.totalPoints -= holdCost
        
        // ホールドコストの記録
        const holdCostPoints = calculatePointsGained('hold-cost', holdCost)
        state.recentPointsGained.push(holdCostPoints)
        
        state.holdSlots[slotIndex] = currentPieceType
        state.usedHoldSlots.push(slotIndex)
        state.canHold = false // 1ターンに1度だけホールド可能

        if (heldPieceType) {
          // ホールドされていたピースを現在のピースに設定
          state.currentPiece = {
            type: heldPieceType as 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L',
            x: 4, // 初期位置
            y: 0, // 初期位置
            rotation: 0
          }
        } else {
          // ホールドが空の場合、次のピースを現在のピースに設定
          const nextPiece = state.nextPieces.shift()
          if (nextPiece) {
            state.currentPiece = {
              type: nextPiece,
              x: 4,
              y: 0,
              rotation: 0
            }
          } else {
            // ゲームオーバーなどのハンドリングが必要な場合
            state.isGameOver = true
          }
        }
      }
    },
    
    updateNextPieces: (state, action: PayloadAction<('I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L')[]>) => {
      state.nextPieces = action.payload
    },
    
    resetHoldSlots: (state) => {
      state.usedHoldSlots = []
      state.canHold = true
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
  updateLevel,
  updateGameTime,
  updateLevelGaugeProgress,
  exchangePiece,
  holdPiece,
  updateNextPieces,
  resetHoldSlots,
  resetGame
} = gameSlice.actions

export default gameSlice.reducer