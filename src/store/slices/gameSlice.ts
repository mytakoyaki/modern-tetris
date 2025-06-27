import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TETROMINO_TYPES } from '@/types/game'
import { getLineClearCallback } from '../store'
import { detectSpin } from '@/features/game/utils/spinDetection'
import type { SpinResult, SpinDetectionContext } from '@/types/spin'
import { Tetromino } from '@/features/game/utils/tetromino'
import type { PointsState, PointsGained } from '@/types/points'
import { FEVER_CONFIG } from '@/types/points'
import type { Rank, RankProgress } from '@/types/rank'
import { 
  calculatePointsGained, 
  getNextExchangeCost, 
  attemptExchange,
  resetExchangeCount,
  createInitialPointsState,
  getHoldCost
} from '@/features/game/utils/pointsSystem'
import { 
  calculateRankProgress, 
  checkPromotion,
  calculateRankBonus,
  getCurrentRank
} from '@/features/game/utils/rankSystem'

// Redux専用のゲームロジックユーティリティ
function getTetrominoBlocks(piece: {type: string | null, x: number, y: number, rotation: number}): {x: number, y: number}[] {
  if (!piece.type || !TETROMINO_TYPES[piece.type as keyof typeof TETROMINO_TYPES]) {
    return []
  }
  
  const tetrominoType = TETROMINO_TYPES[piece.type as keyof typeof TETROMINO_TYPES]
  if (!tetrominoType || !tetrominoType.rotations || !tetrominoType.rotations[piece.rotation]) {
    return []
  }
  
  const shape = tetrominoType.rotations[piece.rotation]
  const blocks: {x: number, y: number}[] = []
  
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col]) {
        blocks.push({
          x: piece.x + col,
          y: piece.y + row
        })
      }
    }
  }
  
  return blocks
}

function canPlacePiece(field: (number | null)[][], piece: {type: string | null, x: number, y: number, rotation: number}): boolean {
  const blocks = getTetrominoBlocks(piece)
  
  for (const block of blocks) {
    // 境界チェック
    if (block.x < 0 || block.x >= 10 || block.y >= 20) {
      return false
    }
    
    // フィールドとの衝突チェック（y < 0は上部なので許可）
    if (block.y >= 0 && field[block.y] && field[block.y][block.x] !== null) {
      return false
    }
  }
  
  return true
}


function placePieceOnField(field: (number | null)[][], piece: {type: string | null, x: number, y: number, rotation: number}): (number | null)[][] {
  if (!piece.type) return field
  
  const newField = field.map(row => [...row])
  const blocks = getTetrominoBlocks(piece)
  const pieceTypeNumber = Object.keys(TETROMINO_TYPES).indexOf(piece.type) + 1
  
  for (const block of blocks) {
    if (block.y >= 0 && block.y < 20 && block.x >= 0 && block.x < 10) {
      newField[block.y][block.x] = pieceTypeNumber
    }
  }
  
  return newField
}

function findCompletedLines(field: (number | null)[][]): number[] {
  const completedLines: number[] = []
  
  for (let y = 0; y < field.length; y++) {
    if (field[y].every(cell => cell !== null)) {
      completedLines.push(y)
    }
  }
  
  return completedLines
}

function clearCompletedLines(field: (number | null)[][], linesToClear: number[]): (number | null)[][] {
  if (linesToClear.length === 0) return field
  
  // ラインを削除
  const newField = field.filter((_, index) => !linesToClear.includes(index))
  
  // 上部に空行を追加
  while (newField.length < 20) {
    newField.unshift(Array(10).fill(null))
  }
  
  return newField
}

function generateRandomPiece(): 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' {
  const pieces: ('I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L')[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
  return pieces[Math.floor(Math.random() * pieces.length)]
}

export interface GameState {
  // Game field (10x20 grid) - 配置済みブロックのみ
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
  wasWallKick: boolean
  kickIndex: number
  
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
  
  // Automatic falling system
  dropTimer: number
  dropInterval: number
  lockTimer: number
  lockDelay: number
  isLocking: boolean
  isSoftDropping: boolean
  softDropInterval: number
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
  wasWallKick: false,
  kickIndex: 0,
  feverMode: {
    isActive: false,
    timeRemaining: 0,
    blocksUntilActivation: FEVER_CONFIG.BLOCKS_NEEDED
  },
  currentRank: (() => {
    const rank = getCurrentRank(0)
    console.log('Initial rank setup:', rank)
    return rank
  })(),
  rankProgress: (() => {
    const progress = calculateRankProgress(0)
    console.log('Initial rank progress setup:', progress)
    return progress
  })(),
  recentPromotions: [],
  layoutOrientation: 'horizontal',
  
  // Automatic falling system
  dropTimer: 0,
  dropInterval: 1000, // 1秒間隔（レベル1）
  lockTimer: 0,
  lockDelay: 500, // 0.5秒のロック遅延
  isLocking: false,
  isSoftDropping: false,
  softDropInterval: 50 // 50ms間隔（ソフトドロップ時）
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.isGameRunning = true
      state.isGameOver = false
      state.isPaused = false
      
      // 段位をリセット（毎回新しいゲームで段位は0から開始）
      state.currentRank = getCurrentRank(0)
      state.rankProgress = calculateRankProgress(0)
      state.recentPromotions = []
    },
    pauseGame: (state) => {
      state.isPaused = !state.isPaused
    },
    endGame: (state) => {
      state.isGameRunning = false
      state.isGameOver = true
      
      // ゲーム終了時に現在のスコアに基づいて段位を更新
      state.currentRank = getCurrentRank(state.score)
      state.rankProgress = calculateRankProgress(state.score)
    },
    updateScore: (state, action: PayloadAction<number>) => {
      const oldScore = state.score
      state.score += action.payload
      
      console.log('updateScore called:', {
        oldScore,
        scoreAdded: action.payload,
        newScore: state.score
      })
      
      // 現在のスコアに基づいて段位を常に更新
      const currentRankBasedOnScore = getCurrentRank(state.score)
      
      // 段位昇格チェック
      const promotionCheck = checkPromotion(oldScore, state.score)
      
      console.log('Rank update:', {
        oldRank: getCurrentRank(oldScore).name,
        newRank: currentRankBasedOnScore.name,
        wasPromoted: promotionCheck.wasPromoted
      })
      
      if (promotionCheck.wasPromoted) {
        // 昇格処理
        state.recentPromotions.push(promotionCheck.newRank)
        
        // 昇格ボーナス
        const rankBonus = calculateRankBonus(promotionCheck.rankUp)
        state.score += rankBonus.scoreBonus
        state.pointSystem.totalPoints += rankBonus.pointBonus
        
        // 昇格ボーナスの記録
        const promotionPoints = calculatePointsGained('rank-bonus', rankBonus.pointBonus)
        state.recentPointsGained.push(promotionPoints)
      }
      
      // 現在の段位を常に現在のスコアに基づいて更新
      state.currentRank = currentRankBasedOnScore
      
      // 段位進捗更新
      state.rankProgress = calculateRankProgress(state.score)
      
      console.log('Final rank state:', {
        currentRank: state.currentRank.name,
        progressToNext: state.rankProgress.progressToNext
      })
    },
    spawnTetromino: (state, action: PayloadAction<{type: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L', x?: number, y?: number}>) => {
      // ゲームが実行中でない場合は何もしない
      if (!state.isGameRunning) return
      
      // ゲームオーバー判定
      const testPiece = {
        type: action.payload.type,
        x: action.payload.x ?? 3,
        y: action.payload.y ?? 0,
        rotation: 0
      }
      
      if (!canPlacePiece(state.field, testPiece)) {
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
      // currentPiece.typeがnullの場合は何もしない
      if (state.currentPiece.type) {
        const testPiece = {
          ...state.currentPiece,
          x: state.currentPiece.x + action.payload.dx,
          y: state.currentPiece.y + action.payload.dy
        }
        
        if (canPlacePiece(state.field, testPiece)) {
          state.currentPiece.x = testPiece.x
          state.currentPiece.y = testPiece.y
          state.lastAction = action.payload.dy > 0 ? 'drop' : 'move'
          
          // 水平移動時のみロック状態をリセット（垂直移動は自動落下と並列処理）
          if (action.payload.dx !== 0 && action.payload.dy === 0) {
            state.isLocking = false
            state.lockTimer = 0
          }
          
          // ソフトドロップポイント（下方向の移動時）- 累積のみ、recentには追加しない
          if (action.payload.dy > 0) {
            const pointsGained = calculatePointsGained('soft-drop', action.payload.dy)
            state.pointSystem.totalPoints += pointsGained.total
            state.pointSystem.lastDropBonus += pointsGained.total
          }
        }
      }
    },
    rotateTetromino: (state, action: PayloadAction<{clockwise?: boolean}> = {type: 'rotateTetromino', payload: {}}) => {
      // currentPiece.typeがnullの場合は何もしない
      if (state.currentPiece.type) {
        const clockwise = action.payload.clockwise ?? true
        const newRotation = clockwise 
          ? (state.currentPiece.rotation + 1) % 4
          : (state.currentPiece.rotation + 3) % 4
        
        const testPiece = {
          ...state.currentPiece,
          rotation: newRotation
        }
        
        // 基本回転チェック
        if (canPlacePiece(state.field, testPiece)) {
          state.currentPiece.rotation = newRotation
          state.lastAction = 'rotate'
          // 回転時はロック状態を部分的にリセット（自動落下と並列処理を維持）
          if (state.isLocking) {
            state.lockTimer = Math.max(0, state.lockTimer - 100) // 100ms減らすのみ
          }
          
          // 基本回転成功
          state.lastRotationKick = {
            wasWallKick: false,
            kickIndex: 0
          }
          state.wasWallKick = false
          state.kickIndex = 0
        } else {
          // SRS Wall Kick試行（簡略版）
          const wallKickOffsets = [
            [{x: -1, y: 0}, {x: -1, y: -1}, {x: 0, y: 2}, {x: -1, y: 2}],
            [{x: 1, y: 0}, {x: 1, y: -1}, {x: 0, y: 2}, {x: 1, y: 2}],
            [{x: 1, y: 0}, {x: 1, y: 1}, {x: 0, y: -2}, {x: 1, y: -2}],
            [{x: -1, y: 0}, {x: -1, y: 1}, {x: 0, y: -2}, {x: -1, y: -2}]
          ]
          
          const kickTable = wallKickOffsets[state.currentPiece.rotation]
          let rotationSuccess = false
          
          for (let i = 0; i < kickTable.length; i++) {
            const offset = kickTable[i]
            const kickTestPiece = {
              ...testPiece,
              x: testPiece.x + offset.x,
              y: testPiece.y + offset.y
            }
            
            if (canPlacePiece(state.field, kickTestPiece)) {
              state.currentPiece.x = kickTestPiece.x
              state.currentPiece.y = kickTestPiece.y
              state.currentPiece.rotation = newRotation
              state.lastAction = 'rotate'
              // Wall kick時もロック状態を部分的にリセット
              if (state.isLocking) {
                state.lockTimer = Math.max(0, state.lockTimer - 100)
              }
              
              // Wall kick成功
              state.lastRotationKick = {
                wasWallKick: true,
                kickIndex: i + 1
              }
              state.wasWallKick = true
              state.kickIndex = i + 1
              rotationSuccess = true
              break
            }
          }
          
          if (!rotationSuccess) {
            // 回転失敗
            state.lastRotationKick = null
            state.wasWallKick = false
            state.kickIndex = 0
          }
        }
      }
    },
    hardDropTetromino: (state, action: PayloadAction<{distance?: number}>) => {
      // currentPiece.typeがnullの場合は何もしない（ポイント稼ぎ防止）
      if (!state.currentPiece.type) return
      
      let dropDistance = action.payload?.distance || 0
      
      if (dropDistance === 0) {
        // Redux側でハードドロップ距離を計算
        const initialY = state.currentPiece.y
        let testY = initialY
        
        // 着地位置まで下に移動
        while (true) {
          const testPiece = {
            ...state.currentPiece,
            y: testY + 1
          }
          
          if (!canPlacePiece(state.field, testPiece)) {
            break
          }
          testY++
        }
        
        dropDistance = testY - initialY
        state.currentPiece.y = testY
      }
      
      // ハードドロップポイント計算 - 累積のみ、recentには追加しない
      if (dropDistance > 0) {
        const pointsGained = calculatePointsGained('hard-drop', dropDistance)
        state.pointSystem.totalPoints += pointsGained.total
        state.pointSystem.lastDropBonus = pointsGained.total
      }
      
      // ハードドロップ後は即座にロック
      state.isLocking = false
      state.lockTimer = state.lockDelay // 即座にロック
    },
    placeTetromino: (state) => {
      // 基本設置ポイント
      const placementPoints = calculatePointsGained('placement', 1)
      let totalBlockPoints = placementPoints.total
      
      // 累積された落下ポイントがある場合は追加
      if (state.pointSystem.lastDropBonus > 0) {
        totalBlockPoints += state.pointSystem.lastDropBonus
      }
      
      // 総ポイントを更新
      state.pointSystem.totalPoints += placementPoints.total
      
      // ブロック設置による総獲得ポイントをrecentに追加
      const blockCompletionPoints = {
        type: 'block-completion' as const,
        basePoints: placementPoints.total,
        dropBonus: state.pointSystem.lastDropBonus,
        total: totalBlockPoints,
        timestamp: Date.now()
      }
      state.recentPointsGained.push(blockCompletionPoints)
      
      // 落下ボーナスをリセット
      state.pointSystem.lastDropBonus = 0
      
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
        const newBlocksUntilActivation = FEVER_CONFIG.BLOCKS_NEEDED - (state.blocksPlaced % FEVER_CONFIG.BLOCKS_NEEDED)
        state.feverMode.blocksUntilActivation = newBlocksUntilActivation
      }
      
      // ホールドを再度可能にする
      state.canHold = true
      state.usedHoldSlots = []
    },
    updateField: (state, action: PayloadAction<(number | null)[][]>) => {
      state.field = action.payload
    },
    updateCurrentPiece: (state, action: PayloadAction<{type: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' | null, x: number, y: number, rotation: number}>) => {
      state.currentPiece = action.payload
    },
    lockTetromino: (state) => {
      if (!state.currentPiece.type) return
      
      // フィールドにテトリミノを配置
      const newField = placePieceOnField(state.field, state.currentPiece)
      state.field = newField
      
      // 完成ラインをチェック
      const completedLines = findCompletedLines(newField)
      if (completedLines.length > 0) {
        // ラインクリア
        state.field = clearCompletedLines(newField, completedLines)
        state.lines += completedLines.length
        
        // スピン検出を実行
        const tetromino = new Tetromino(state.currentPiece.type!, state.currentPiece.x, state.currentPiece.y)
        tetromino.setRotation(state.currentPiece.rotation)
        
        const spinContext: SpinDetectionContext = {
          tetromino,
          lastAction: state.lastAction === 'rotate' ? 'rotate' : 'move',
          field: newField.map(row => row.map(cell => cell || 0)), // number[][]に変換
          wasWallKick: state.wasWallKick,
          kickIndex: state.kickIndex
        }
        
        const spinResult = detectSpin(spinContext, completedLines.length)
        state.lastSpin = spinResult
        
        // スコア計算（スピンボーナス込み）
        const baseScore = [0, 100, 400, 1000, 2000][completedLines.length] || 0
        let totalScore = baseScore
        
        // スピンボーナスを追加
        if (spinResult.type && spinResult.bonus > 0) {
          totalScore += spinResult.bonus
          console.log(`[SPIN DETECTED] ${spinResult.type} ${spinResult.variant} - Bonus: ${spinResult.bonus} points`)
        }
        
        // フィーバーモード倍率適用
        const multiplier = state.feverMode.isActive ? 4 : 1
        
        // レベルボーナス計算（最大6倍程度に軽減）
        const levelMultiplier = Math.min(1 + (state.level - 1) * 0.2, 6.0)
        
        const finalScore = totalScore * levelMultiplier * multiplier
        state.score += finalScore
        
        // 演出コールバックを呼び出し
        const lineClearCallback = getLineClearCallback()
        if (lineClearCallback) {
          // Perfect Clear判定
          const isPerfectClear = state.field.every(row => row.every(cell => cell === null))
          const isTSpin = spinResult.type === 'T-Spin'
          
          lineClearCallback(completedLines.length, finalScore, isTSpin, isPerfectClear, spinResult)
        }
      }
      
      // ロック状態リセット
      state.isLocking = false
      state.lockTimer = 0
      
      // spawnNextTetromino アクションを呼び出す準備
      // このアクションは別途呼び出される必要がある
    },
    spawnNextTetromino: (state) => {
      // 次のピースから新しいテトリミノをスポーン
      if (state.nextPieces.length === 0) {
        // 次のピースがない場合、ランダム生成
        const newPiece = generateRandomPiece()
        state.currentPiece = {
          type: newPiece,
          x: 3,
          y: 0,
          rotation: 0
        }
      } else {
        // 次のピースを使用
        const nextPiece = state.nextPieces.shift()!
        state.currentPiece = {
          type: nextPiece,
          x: 3,
          y: 0,
          rotation: 0
        }
        
        // 新しいピースをnextPiecesに追加
        state.nextPieces.push(generateRandomPiece())
      }
      
      // スポーン位置でゲームオーバーチェック
      if (!canPlacePiece(state.field, state.currentPiece)) {
        state.isGameOver = true
        state.isGameRunning = false
        state.currentPiece = {
          type: null,
          x: 3,
          y: 0,
          rotation: 0
        }
      }
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
    updateDropInterval: (state, action: PayloadAction<number>) => {
      state.dropInterval = action.payload
    },
    setSoftDropping: (state, action: PayloadAction<boolean>) => {
      state.isSoftDropping = action.payload
    },
    updateDropTimer: (state, action: PayloadAction<number>) => {
      state.dropTimer += action.payload
      
      // 現在の落下間隔を決定（ソフトドロップ中か通常落下か）
      const currentDropInterval = state.isSoftDropping ? state.softDropInterval : state.dropInterval
      
      // 自動落下チェック
      if (state.dropTimer >= currentDropInterval) {
        state.dropTimer = 0
        
        // テトリミノを1行下に移動を試行
        if (state.currentPiece.type) {
          const testPiece = {
            ...state.currentPiece,
            y: state.currentPiece.y + 1
          }
          
          const canMoveDown = canPlacePiece(state.field, testPiece)
          
          if (canMoveDown) {
            state.currentPiece.y += 1
            state.isLocking = false
            state.lockTimer = 0
            
            // ソフトドロップポイント - 累積のみ
            const pointsGained = calculatePointsGained('soft-drop', 1)
            state.pointSystem.totalPoints += pointsGained.total
            state.pointSystem.lastDropBonus += pointsGained.total
          } else {
            // 下に移動できない場合、ロック処理開始
            if (!state.isLocking) {
              state.isLocking = true
              state.lockTimer = 0
            }
          }
        }
      }
      
      // ロックタイマー更新
      if (state.isLocking) {
        state.lockTimer += action.payload
        if (state.lockTimer >= state.lockDelay) {
          // テトリミノを自動ロック
          if (state.currentPiece.type) {
            // placeTetromino ロジックを実行（ブロック設置による総獲得ポイント記録）
            const placementPoints = calculatePointsGained('placement', 1)
            let totalBlockPoints = placementPoints.total
            
            // 累積された落下ポイントがある場合は追加
            if (state.pointSystem.lastDropBonus > 0) {
              totalBlockPoints += state.pointSystem.lastDropBonus
            }
            
            // 総ポイントを更新
            state.pointSystem.totalPoints += placementPoints.total
            
            // ブロック設置による総獲得ポイントをrecentに追加
            const blockCompletionPoints = {
              type: 'block-completion' as const,
              basePoints: placementPoints.total,
              dropBonus: state.pointSystem.lastDropBonus,
              total: totalBlockPoints,
              timestamp: Date.now()
            }
            state.recentPointsGained.push(blockCompletionPoints)
            
            // 落下ボーナスをリセット
            state.pointSystem.lastDropBonus = 0
            
            // エクスチェンジカウントリセット
            state.pointSystem.exchangeCount = resetExchangeCount()
            
            // 統計更新
            state.blocksPlaced += 1
            
            // フィーバーモードチェック
            if (state.blocksPlaced % FEVER_CONFIG.BLOCKS_NEEDED === 0) {
              state.feverMode.isActive = true
              state.feverMode.timeRemaining = FEVER_CONFIG.DURATION
              state.feverMode.blocksUntilActivation = FEVER_CONFIG.BLOCKS_NEEDED
            } else {
              const newBlocksUntilActivation = FEVER_CONFIG.BLOCKS_NEEDED - (state.blocksPlaced % FEVER_CONFIG.BLOCKS_NEEDED)
              state.feverMode.blocksUntilActivation = newBlocksUntilActivation
            }
            
            // ホールドを再度可能にする
            state.canHold = true
            state.usedHoldSlots = []
            
            // フィールドにテトリミノを配置
            const newField = placePieceOnField(state.field, state.currentPiece)
            state.field = newField
            
            // 完成ラインをチェック
            const completedLines = findCompletedLines(newField)
            if (completedLines.length > 0) {
              // ラインクリア
              state.field = clearCompletedLines(newField, completedLines)
              state.lines += completedLines.length
              
              // スピン検出を実行
              const tetromino = new Tetromino(state.currentPiece.type!, state.currentPiece.x, state.currentPiece.y)
              tetromino.setRotation(state.currentPiece.rotation)
              
              const spinContext: SpinDetectionContext = {
                tetromino,
                lastAction: state.lastAction === 'rotate' ? 'rotate' : 'move',
                field: newField.map(row => row.map(cell => cell || 0)), // number[][]に変換
                wasWallKick: state.wasWallKick,
                kickIndex: state.kickIndex
              }
              
              const spinResult = detectSpin(spinContext, completedLines.length)
              state.lastSpin = spinResult
              
              // スコア計算（スピンボーナス込み）
              const baseScore = [0, 100, 400, 1000, 2000][completedLines.length] || 0
              let totalScore = baseScore
              
              // スピンボーナスを追加
              if (spinResult.type && spinResult.bonus > 0) {
                totalScore += spinResult.bonus
                console.log(`[SPIN DETECTED] ${spinResult.type} ${spinResult.variant} - Bonus: ${spinResult.bonus} points`)
              }
              
              // フィーバーモード倍率適用
              const multiplier = state.feverMode.isActive ? 4 : 1
              
              // レベルボーナス計算（最大6倍程度に軽減）
              const levelMultiplier = Math.min(1 + (state.level - 1) * 0.2, 6.0)
              
              const finalScore = totalScore * levelMultiplier * multiplier
              state.score += finalScore
              
              // 演出コールバックを呼び出し
              const lineClearCallback = getLineClearCallback()
              if (lineClearCallback) {
                // Perfect Clear判定
                const isPerfectClear = state.field.every(row => row.every(cell => cell === null))
                const isTSpin = spinResult.type === 'T-Spin'
                
                lineClearCallback(completedLines.length, finalScore, isTSpin, isPerfectClear, spinResult)
              }
            }
            
            // ロック状態リセット
            state.isLocking = false
            state.lockTimer = 0
            
            // 新しいテトリミノを即座にスポーン（nullタイミングを排除）
            if (state.nextPieces.length === 0) {
              // 次のピースがない場合、ランダム生成
              state.nextPieces.push(generateRandomPiece())
            }
            
            const nextPiece = state.nextPieces.shift()!
            state.currentPiece = {
              type: nextPiece,
              x: 3,
              y: 0,
              rotation: 0
            }
            
            // 新しいピースをnextPiecesに追加
            state.nextPieces.push(generateRandomPiece())
            
            // スポーン位置でゲームオーバーチェック
            if (!canPlacePiece(state.field, state.currentPiece)) {
              state.isGameOver = true
              state.isGameRunning = false
              state.currentPiece = {
                type: null,
                x: 3,
                y: 0,
                rotation: 0
              }
            }
          }
        }
      }
    },
    exchangePiece: (state) => {
      const exchangeResult = attemptExchange(
        state.pointSystem.totalPoints,
        state.pointSystem.exchangeCount,
        state.feverMode.isActive
      )

      if (!exchangeResult.success) {
        return
      }

      // ポイント・カウント更新
      state.pointSystem.totalPoints = exchangeResult.remainingPoints
      state.pointSystem.exchangeCount = exchangeResult.newExchangeCount
      state.pointSystem.nextExchangeCost = getNextExchangeCost(exchangeResult.newExchangeCount)

      // 交換可能なピースのリストを作成
      const availablePieces = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const
      const currentPieceType = state.currentPiece.type
      const filteredPieces = availablePieces.filter(p => p !== currentPieceType)

      // 新しいピースをランダムに選択
      const newPieceType = filteredPieces[Math.floor(Math.random() * filteredPieces.length)]

      // 新しいピースに交換（初期位置で）
      state.currentPiece = {
        type: newPieceType,
        x: 3, // 初期位置
        y: 0, // 初期位置
        rotation: 0
      }
      
      // 統計更新
      state.exchangeCount += 1
    },
    holdPiece: (state, action: PayloadAction<{slotIndex: 0 | 1}>) => {
      const slotIndex = action.payload.slotIndex
      
      // ホールド制限チェック
      if (!state.canHold) {
        return
      }
      
      // ホールドコストチェック
      const holdCost = getHoldCost(state.feverMode.isActive)
      
      if (state.pointSystem.totalPoints < holdCost) {
        return
      }
      
      // 現在のピースタイプ
      const currentPieceType = state.currentPiece.type
      if (!currentPieceType) {
        return
      }
      
      // ホールドコストを消費
      state.pointSystem.totalPoints -= holdCost
      
      // ホールドコストの記録
      const holdCostPoints = calculatePointsGained('hold-cost', -holdCost)
      state.recentPointsGained.push(holdCostPoints)
      
      // ホールドされていたピース
      const heldPieceType = state.holdSlots[slotIndex]
      
      // 現在のピースをホールドスロットに格納
      state.holdSlots[slotIndex] = currentPieceType
      state.usedHoldSlots.push(slotIndex)
      state.canHold = false // 1ターンに1度だけホールド可能

      if (heldPieceType) {
        // ホールドされていたピースを現在のピースに設定
        state.currentPiece = {
          type: heldPieceType as 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L',
          x: 3, // 初期位置
          y: 0, // 初期位置
          rotation: 0
        }
      } else {
        // ホールドが空の場合、次のピースを現在のピースに設定
        const nextPiece = state.nextPieces.shift()
        if (nextPiece) {
          state.currentPiece = {
            type: nextPiece,
            x: 3,
            y: 0,
            rotation: 0
          }
        } else {
          // ゲームオーバーなどのハンドリングが必要な場合
          state.isGameOver = true
        }
      }
      
      // 統計更新
      state.holdCount += 1
    },
    
    updateNextPieces: (state, action: PayloadAction<('I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L')[]>) => {
      state.nextPieces = action.payload
    },
    
    resetHoldSlots: (state) => {
      state.usedHoldSlots = []
      state.canHold = true
    },
    
    resetGame: (state) => {
      // ゲーム状態を完全にリセット
      state.field = Array(20).fill(null).map(() => Array(10).fill(null))
      state.currentPiece = {
        type: null,
        x: 3,
        y: 0,
        rotation: 0
      }
      state.holdSlots = [null, null]
      state.canHold = true
      state.usedHoldSlots = []
      state.lastAction = null
      state.lastRotationKick = null
      state.nextPieces = []
      state.isGameRunning = false
      state.isPaused = false
      state.isGameOver = false
      state.score = 0
      state.level = 1
      state.lines = 0
      state.pointSystem = createInitialPointsState()
      state.recentPointsGained = []
      state.gameTime = 0
      state.blocksPlaced = 0
      state.tetrisCount = 0
      state.holdCount = 0
      state.exchangeCount = 0
      state.levelGaugeProgress = 0
      state.lastSpin = null
      state.backToBackCount = 0
      state.comboCount = 0
      state.wasWallKick = false
      state.kickIndex = 0
      state.feverMode = {
        isActive: false,
        timeRemaining: 0,
        blocksUntilActivation: FEVER_CONFIG.BLOCKS_NEEDED
      }
      state.recentPromotions = []
      state.dropTimer = 0
      state.lockTimer = 0
      state.isLocking = false
      state.isSoftDropping = false
      
      // 段位を現在のスコア（0）に基づいてリセット
      state.currentRank = getCurrentRank(0)
      state.rankProgress = calculateRankProgress(0)
    },
    
    // 一列消去アクション
    clearBottomRow: (state) => {
      // ゲームが実行中でない場合は何もしない
      if (!state.isGameRunning) return
      
      // 一列消去コスト
      const clearRowCost = 200
      
      // ポイントが不足している場合は何もしない
      if (state.pointSystem.totalPoints < clearRowCost) return
      
      // 一番下の行（19行目）にブロックがあるかチェック
      const bottomRowHasBlocks = state.field[19]?.some(cell => cell !== null)
      if (!bottomRowHasBlocks) return
      
      // コストを消費
      state.pointSystem.totalPoints -= clearRowCost
      
      // コスト消費の記録
      const clearRowCostPoints = calculatePointsGained('clear-row-cost', -clearRowCost)
      state.recentPointsGained.push(clearRowCostPoints)
      
      // 一番下の行を消去して重力を適用
      let newField = state.field.map((row, index) => {
        if (index === 19) {
          return Array(10).fill(null)
        }
        return [...row]
      })
      
      // 重力による落下処理
      const FIELD_HEIGHT = newField.length
      const FIELD_WIDTH = newField[0].length
      
      let hasChanges = true
      let iterations = 0
      const maxIterations = FIELD_HEIGHT // 無限ループ防止
      
      // 変化がなくなるまで繰り返し
      while (hasChanges && iterations < maxIterations) {
        hasChanges = false
        iterations++
        
        // 下から上に向かって処理（重力のため）
        for (let y = FIELD_HEIGHT - 1; y >= 0; y--) {
          // 現在の行が空かチェック
          const isCurrentRowEmpty = newField[y].every(cell => cell === null)
          
          if (isCurrentRowEmpty) {
            // 空の行の上にあるブロックを探して下に落とす
            for (let aboveY = y - 1; aboveY >= 0; aboveY--) {
              const hasBlocksAbove = newField[aboveY].some(cell => cell !== null)
              
              if (hasBlocksAbove) {
                // 上の行のブロックを現在の行に移動
                for (let x = 0; x < FIELD_WIDTH; x++) {
                  newField[y][x] = newField[aboveY][x]
                  newField[aboveY][x] = null
                }
                hasChanges = true
                break // 一つの行を落としたら次の空の行を処理
              }
            }
          }
        }
      }
      
      state.field = newField
      
      // 統計更新
      state.lines += 1
      
      console.log('Bottom row cleared with gravity, cost:', clearRowCost, 'remaining points:', state.pointSystem.totalPoints)
    },
    
    // デバッグ用アクション: スコアを直接設定
    setScore: (state, action: PayloadAction<number>) => {
      const oldScore = state.score
      state.score = action.payload
      
      // 現在のスコアに基づいて段位を常に更新
      const currentRankBasedOnScore = getCurrentRank(state.score)
      
      // 段位昇格チェック
      const promotionCheck = checkPromotion(oldScore, state.score)
      
      if (promotionCheck.wasPromoted) {
        state.recentPromotions.push(promotionCheck.newRank)
      }
      
      // 現在の段位を常に現在のスコアに基づいて更新
      state.currentRank = currentRankBasedOnScore
      
      state.rankProgress = calculateRankProgress(state.score)
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
  updateCurrentPiece,
  lockTetromino,
  spawnNextTetromino,
  toggleLayoutOrientation,
  activateFeverMode,
  updateFeverTime,
  updateLevel,
  updateGameTime,
  updateLevelGaugeProgress,
  updateDropInterval,
  updateDropTimer,
  setSoftDropping,
  exchangePiece,
  holdPiece,
  updateNextPieces,
  resetHoldSlots,
  resetGame,
  setScore,
  clearBottomRow
} = gameSlice.actions

export default gameSlice.reducer