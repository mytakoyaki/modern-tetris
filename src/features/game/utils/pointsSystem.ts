/**
 * ポイント&エクスチェンジシステム実装
 * ClaudeTetris独自のポイント獲得・消費システム
 */

import {
  PointsState,
  ExchangeResult,
  PointsGained,
  POINTS_CONFIG,
  EXCHANGE_COSTS,
  ExchangeCostIndex,
} from '../../../types/points'

/**
 * ポイント獲得計算
 */
export function calculatePointsGained(
  type: PointsGained['type'],
  baseAmount: number,
  multiplier: number = 1
): PointsGained {
  let amount = 0

  switch (type) {
    case 'placement':
      amount = POINTS_CONFIG.TETROMINO_PLACEMENT
      break
    case 'soft-drop':
      amount = baseAmount * POINTS_CONFIG.SOFT_DROP_PER_LINE
      break
    case 'hard-drop':
      amount = baseAmount * POINTS_CONFIG.HARD_DROP_PER_LINE
      break
    case 'achievement':
      amount = Math.min(
        Math.max(baseAmount, POINTS_CONFIG.ACHIEVEMENT_BONUS_MIN),
        POINTS_CONFIG.ACHIEVEMENT_BONUS_MAX
      )
      break
    case 'rank-bonus':
      amount = baseAmount
      break
    case 'hold-cost':
      amount = -baseAmount // 負の値でコスト表現
      break
    case 'clear-row-cost':
      amount = -baseAmount // 負の値でコスト表現
      break
  }

  const total = Math.floor(amount * multiplier)

  return {
    type,
    amount,
    multiplier,
    total,
    timestamp: Date.now()
  }
}

/**
 * 現在の交換コスト取得
 */
export function getCurrentExchangeCost(exchangeCount: number): number {
  const index = Math.min(exchangeCount, EXCHANGE_COSTS.length - 1) as ExchangeCostIndex
  return EXCHANGE_COSTS[index]
}

/**
 * 次の交換コスト取得
 */
export function getNextExchangeCost(exchangeCount: number): number | null {
  const nextIndex = exchangeCount + 1
  if (nextIndex >= EXCHANGE_COSTS.length) {
    return EXCHANGE_COSTS[EXCHANGE_COSTS.length - 1] // 最大コスト維持
  }
  return EXCHANGE_COSTS[nextIndex as ExchangeCostIndex]
}

/**
 * エクスチェンジ試行（フィーバーモード考慮）
 */
export function attemptExchange(
  currentPoints: number,
  exchangeCount: number,
  isFeverMode: boolean = false
): ExchangeResult {
  // フィーバーモード中は無料
  if (isFeverMode) {
    return {
      success: true,
      cost: 0,
      newExchangeCount: exchangeCount,
      remainingPoints: currentPoints,
    }
  }

  const cost = getCurrentExchangeCost(exchangeCount)

  // ポイント不足チェック
  if (currentPoints < cost) {
    return {
      success: false,
      cost,
      newExchangeCount: exchangeCount,
      remainingPoints: currentPoints,
      errorMessage: `交換に${cost}ポイント必要です（現在: ${currentPoints}ポイント）`,
    }
  }

  return {
    success: true,
    cost,
    newExchangeCount: exchangeCount + 1,
    remainingPoints: currentPoints - cost,
  }
}

/**
 * ホールド機能コスト計算
 */
export function getHoldCost(isFeverMode: boolean = false): number {
  return isFeverMode ? 0 : POINTS_CONFIG.HOLD_COST
}

/**
 * ライン削除機能コスト計算
 */
export function getLineDeleteCost(isFeverMode: boolean = false): number {
  return isFeverMode ? 0 : POINTS_CONFIG.LINE_DELETE_COST
}

/**
 * エクスチェンジカウントリセット（テトリミノ設置時）
 */
export function resetExchangeCount(): number {
  return 0
}

/**
 * ポイント履歴用のフォーマット関数
 */
export function formatPointsGained(pointsGained: PointsGained): string {
  const { type, total, multiplier } = pointsGained

  const typeNames = {
    placement: 'ブロック設置',
    'soft-drop': 'ソフトドロップ',
    'hard-drop': 'ハードドロップ',
    achievement: '実績達成',
    'rank-bonus': '段位ボーナス',
    'hold-cost': 'ホールドコスト',
    'block-completion': 'ブロック完了',
    'clear-row-cost': '一列消去コスト',
  } as const

  const typeName = typeNames[type]
  const multiplierText = multiplier && multiplier !== 1 ? ` (x${multiplier})` : ''

  // ブロック完了の場合もシンプルに総合ポイントのみ表示
  if (type === 'block-completion') {
    return `${typeName}: +${total}P${multiplierText}`
  }

  return `${typeName}: +${total}P${multiplierText}`
}

/**
 * 累積コスト表示用のフォーマット関数
 */
export function formatExchangeCosts(currentCount: number): string {
  const costs = EXCHANGE_COSTS.slice(currentCount, currentCount + 3)
    .map(cost => `${cost}P`)
    .join(' → ')
  
  return costs || `${EXCHANGE_COSTS[EXCHANGE_COSTS.length - 1]}P（最大）`
}

/**
 * ポイント不足チェック
 */
export function canAfford(currentPoints: number, cost: number): boolean {
  return currentPoints >= cost
}

/**
 * 初期ポイント状態生成
 */
export function createInitialPointsState(): PointsState {
  return {
    totalPoints: 0,
    exchangeCount: 0,
    nextExchangeCost: EXCHANGE_COSTS[0],
    exchangeCosts: [...EXCHANGE_COSTS],
    blocksPlaced: 0,
    lastDropBonus: 0,
  }
}