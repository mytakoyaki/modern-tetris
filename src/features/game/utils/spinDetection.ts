import { Tetromino } from './tetromino'
import { 
  SpinResult, 
  SpinDetectionContext, 
  CornerCheckResult, 
  SPIN_BONUSES 
} from '@/types/spin'

const GRID_WIDTH = 10
const GRID_HEIGHT = 20

/**
 * スピン技の検出メイン関数
 */
export function detectSpin(context: SpinDetectionContext, clearedLines: number): SpinResult {
  const { tetromino, lastAction, field } = context
  
  // 回転動作でない場合はスピンなし
  if (lastAction !== 'rotate') {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  // ライン消去がない場合はスピンなし
  if (clearedLines === 0) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  switch (tetromino.type) {
    case 'T':
      return detectTSpin(tetromino, field, clearedLines, context.wasWallKick, context.kickIndex)
    case 'S':
    case 'Z':
      return detectSZSpin(tetromino, field, clearedLines, context.wasWallKick)
    case 'I':
      return detectISpin(tetromino, field, clearedLines, context.wasWallKick)
    case 'J':
    case 'L':
      return detectJLSpin(tetromino, field, clearedLines, context.wasWallKick)
    default:
      return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
}

/**
 * T-Spin検出
 * READMEの条件に基づく実装：
 * - T-Spin Mini: 3つの角が埋まっている状態
 * - T-Spin: 4つの角のうち3つ以上が埋まっている状態
 * SRS対応: 特定のキックパターンでより正確な判定
 */
function detectTSpin(tetromino: Tetromino, field: number[][], clearedLines: number, wasWallKick: boolean = false, kickIndex: number = 0): SpinResult {
  const cornerCheck = checkTSpinCorners(tetromino, field)
  
  // 最低3つの角が埋まっている必要がある
  if (cornerCheck.filledCorners < 3) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  // T-Spin Mini判定: 正確に3つの角が埋まっている場合
  const isMini = cornerCheck.filledCorners === 3
  
  if (isMini) {
    // T-Spin Mini
    let variant: 'Single' | 'Double' | 'Triple'
    switch (clearedLines) {
      case 1: variant = 'Single'; break
      case 2: variant = 'Double'; break
      case 3: variant = 'Triple'; break
      default: return { type: null, variant: null, bonus: 0, lines: clearedLines }
    }
    
    const bonus = SPIN_BONUSES['T-Spin']['Mini'][variant]
    return {
      type: 'T-Spin',
      variant: 'Mini',
      bonus,
      lines: clearedLines
    }
  } else {
    // 通常のT-Spin (4つ以上の角が埋まっている場合)
    let variant: 'Single' | 'Double' | 'Triple'
    switch (clearedLines) {
      case 1: variant = 'Single'; break
      case 2: variant = 'Double'; break
      case 3: variant = 'Triple'; break
      default: return { type: null, variant: null, bonus: 0, lines: clearedLines }
    }
    
    const bonus = SPIN_BONUSES['T-Spin'][variant]
    return {
      type: 'T-Spin',
      variant,
      bonus,
      lines: clearedLines
    }
  }
}

/**
 * SZ-Spin検出
 * SRS対応: ウォールキックが必須条件
 */
function detectSZSpin(tetromino: Tetromino, field: number[][], clearedLines: number, wasWallKick: boolean = false): SpinResult {
  // SZ-Spinはウォールキックが必須
  if (!wasWallKick) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  const cornerCheck = checkSpinCorners(tetromino, field, 2) // SZ-Spinは2つ以上の角が必要
  
  if (cornerCheck.filledCorners < 2) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  let variant: 'Single' | 'Double' | 'Triple'
  switch (clearedLines) {
    case 1: variant = 'Single'; break
    case 2: variant = 'Double'; break
    case 3: variant = 'Triple'; break
    default: return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  return {
    type: 'SZ-Spin',
    variant,
    bonus: SPIN_BONUSES['SZ-Spin'][variant],
    lines: clearedLines
  }
}

/**
 * I-Spin検出
 * SRS対応: ウォールキックが必須条件
 */
function detectISpin(tetromino: Tetromino, field: number[][], clearedLines: number, wasWallKick: boolean = false): SpinResult {
  // I-Spinはウォールキックが必須
  if (!wasWallKick) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  const cornerCheck = checkSpinCorners(tetromino, field, 2) // I-Spinは2つ以上の角が必要
  
  if (cornerCheck.filledCorners < 2) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  let variant: 'Single' | 'Double' | 'Triple'
  switch (clearedLines) {
    case 1: variant = 'Single'; break
    case 2: variant = 'Double'; break
    case 3: variant = 'Triple'; break
    default: return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  return {
    type: 'I-Spin',
    variant,
    bonus: SPIN_BONUSES['I-Spin'][variant],
    lines: clearedLines
  }
}

/**
 * JL-Spin検出
 * SRS対応: ウォールキックが必須条件
 */
function detectJLSpin(tetromino: Tetromino, field: number[][], clearedLines: number, wasWallKick: boolean = false): SpinResult {
  // JL-Spinはウォールキックが必須
  if (!wasWallKick) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  const cornerCheck = checkSpinCorners(tetromino, field, 2) // JL-Spinは2つ以上の角が必要
  
  if (cornerCheck.filledCorners < 2) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  let variant: 'Single' | 'Double' | 'Triple'
  switch (clearedLines) {
    case 1: variant = 'Single'; break
    case 2: variant = 'Double'; break
    case 3: variant = 'Triple'; break
    default: return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  return {
    type: 'JL-Spin',
    variant,
    bonus: SPIN_BONUSES['JL-Spin'][variant],
    lines: clearedLines
  }
}

/**
 * T-Spin専用の角チェック
 */
function checkTSpinCorners(tetromino: Tetromino, field: number[][]): CornerCheckResult {
  const centerX = tetromino.x + 1 // Tミノの中心は通常(1,1)
  const centerY = tetromino.y + 1
  
  const cornerPositions = [
    { x: centerX - 1, y: centerY - 1 }, // 左上
    { x: centerX + 1, y: centerY - 1 }, // 右上
    { x: centerX - 1, y: centerY + 1 }, // 左下
    { x: centerX + 1, y: centerY + 1 }  // 右下
  ]
  
  let filledCorners = 0
  const positions = cornerPositions.map(pos => {
    const filled = isPositionFilled(pos.x, pos.y, field)
    if (filled) filledCorners++
    return { ...pos, filled }
  })
  
  return {
    filledCorners,
    totalCorners: 4,
    positions
  }
}

/**
 * 汎用スピン角チェック
 */
function checkSpinCorners(tetromino: Tetromino, field: number[][], minRequired: number): CornerCheckResult {
  // テトリミノの中心位置を推定
  const centerX = tetromino.x + 1
  const centerY = tetromino.y + 1
  
  const cornerPositions = [
    { x: centerX - 1, y: centerY - 1 }, // 左上
    { x: centerX + 1, y: centerY - 1 }, // 右上
    { x: centerX - 1, y: centerY + 1 }, // 左下
    { x: centerX + 1, y: centerY + 1 }  // 右下
  ]
  
  let filledCorners = 0
  const positions = cornerPositions.map(pos => {
    const filled = isPositionFilled(pos.x, pos.y, field)
    if (filled) filledCorners++
    return { ...pos, filled }
  })
  
  return {
    filledCorners,
    totalCorners: 4,
    positions
  }
}

/**
 * 指定位置が埋まっているかチェック
 */
function isPositionFilled(x: number, y: number, field: number[][]): boolean {
  // フィールド外は埋まっているとみなす
  if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) {
    return true
  }
  
  return field[y][x] !== 0
}

/**
 * Back-to-Back判定用のヘルパー
 */
export function isBackToBackEligible(spinResult: SpinResult): boolean {
  // 4ライン消去、または任意のスピン技
  return spinResult.lines === 4 || spinResult.type !== null
}

/**
 * スピン結果の表示用文字列生成
 */
export function formatSpinResult(spinResult: SpinResult): string | null {
  if (!spinResult.type || !spinResult.variant) return null
  
  if (spinResult.type === 'T-Spin' && spinResult.variant === 'Mini') {
    return `T-Spin Mini ${spinResult.lines === 1 ? 'Single' : spinResult.lines === 2 ? 'Double' : 'Triple'}`
  }
  
  return `${spinResult.type} ${spinResult.variant}`
}