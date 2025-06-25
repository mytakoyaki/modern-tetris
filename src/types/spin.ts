export type SpinType = 'T-Spin' | 'SZ-Spin' | 'I-Spin' | 'JL-Spin' | null
export type SpinVariant = 'Single' | 'Double' | 'Triple' | 'Mini' | null

export interface SpinResult {
  type: SpinType
  variant: SpinVariant
  bonus: number
  lines: number
}

export interface SpinDetectionContext {
  tetromino: import('@/features/game/utils/tetromino').Tetromino
  lastAction: 'rotate' | 'move'
  field: number[][]
  wasWallKick: boolean
  kickIndex?: number
}

// T-Spin検出用の角チェック結果
export interface CornerCheckResult {
  filledCorners: number
  totalCorners: number
  positions: Array<{ x: number, y: number, filled: boolean }>
}

// スコアボーナス定義
export const SPIN_BONUSES = {
  'T-Spin': {
    'Mini': { 'Single': 1000, 'Double': 2000, 'Triple': 3000 },
    'Single': 2000,
    'Double': 5000,
    'Triple': 10000
  },
  'SZ-Spin': {
    'Single': 800,
    'Double': 2000,
    'Triple': 4000
  },
  'I-Spin': {
    'Single': 600,
    'Double': 1500,
    'Triple': 3000
  },
  'JL-Spin': {
    'Single': 700,
    'Double': 1800,
    'Triple': 3500
  }
} as const

// Back-to-Back対応ライン数
export const BACK_TO_BACK_ELIGIBLE = ['4-line', 'T-Spin', 'SZ-Spin', 'I-Spin', 'JL-Spin'] as const
export type BackToBackType = typeof BACK_TO_BACK_ELIGIBLE[number]