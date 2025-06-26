/**
 * ポイント&エクスチェンジシステム型定義
 * ClaudeTetris独自のポイントシステム実装
 */

export interface PointsState {
  totalPoints: number
  exchangeCount: number
  nextExchangeCost: number | null
  exchangeCosts: number[]
  blocksPlaced: number
  lastDropBonus: number
}

export interface ExchangeResult {
  success: boolean
  cost: number
  newExchangeCount: number
  remainingPoints: number
  errorMessage?: string
}

export interface PointsGained {
  source: 'placement' | 'soft-drop' | 'hard-drop' | 'achievement' | 'rank-bonus' | 'hold-cost'
  amount: number
  multiplier?: number
  total: number
}

// ポイント獲得設定
export const POINTS_CONFIG = {
  TETROMINO_PLACEMENT: 10,
  SOFT_DROP_PER_LINE: 0.5,
  HARD_DROP_PER_LINE: 1,
  HOLD_COST: 15, // ホールド機能のコスト
  LINE_DELETE_COST: 200, // ライン削除機能のコスト
  ACHIEVEMENT_BONUS_MIN: 5,
  ACHIEVEMENT_BONUS_MAX: 200,
} as const

// エクスチェンジコスト（累積制）
export const EXCHANGE_COSTS = [45, 65, 90, 120, 160] as const

// フィーバーモード設定
export const FEVER_CONFIG = {
  BLOCKS_NEEDED: 20,
  DURATION: 20000, // 20秒
  SCORE_MULTIPLIER: 4,
  FREE_EXCHANGE: true,
} as const

export type ExchangeCostIndex = 0 | 1 | 2 | 3 | 4