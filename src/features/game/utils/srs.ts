/**
 * Super Rotation System (SRS) Implementation
 * 標準的なSRSウォールキックテーブルとキック検証システム
 */

import { Tetromino } from './tetromino'
import { checkCollision } from './collision'

// SRSキックテーブル - 通常のテトリミノ用（I以外）
const SRS_KICK_TABLE = {
  // 0→1 (0° → 90°)
  '0->1': [
    { x: 0, y: 0 },   // キックなし
    { x: -1, y: 0 },  // 左に1
    { x: -1, y: 1 },  // 左に1、上に1
    { x: 0, y: -2 },  // 下に2
    { x: -1, y: -2 }  // 左に1、下に2
  ],
  // 1→0 (90° → 0°)
  '1->0': [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 }
  ],
  // 1→2 (90° → 180°)
  '1->2': [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: -1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 }
  ],
  // 2→1 (180° → 90°)
  '2->1': [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -2 },
    { x: -1, y: -2 }
  ],
  // 2→3 (180° → 270°)
  '2->3': [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: -2 },
    { x: 1, y: -2 }
  ],
  // 3→2 (270° → 180°)
  '3->2': [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: 2 },
    { x: -1, y: 2 }
  ],
  // 3→0 (270° → 0°)
  '3->0': [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
    { x: 0, y: 2 },
    { x: -1, y: 2 }
  ],
  // 0→3 (0° → 270°)
  '0->3': [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: -2 },
    { x: 1, y: -2 }
  ]
} as const

// SRSキックテーブル - Iミノ専用
const SRS_I_KICK_TABLE = {
  '0->1': [
    { x: 0, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: -1 },
    { x: 1, y: 2 }
  ],
  '1->0': [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 1 },
    { x: -1, y: -2 }
  ],
  '1->2': [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 2 },
    { x: 2, y: -1 }
  ],
  '2->1': [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: -2 },
    { x: -2, y: 1 }
  ],
  '2->3': [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 1 },
    { x: -1, y: -2 }
  ],
  '3->2': [
    { x: 0, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: -1 },
    { x: 1, y: 2 }
  ],
  '3->0': [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 1, y: -2 },
    { x: -2, y: 1 }
  ],
  '0->3': [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 2, y: 0 },
    { x: -1, y: 2 },
    { x: 2, y: -1 }
  ]
} as const

export interface RotationResult {
  success: boolean
  newX: number
  newY: number
  newRotation: number
  wallKickUsed: boolean
  kickIndex: number
}

/**
 * SRSに従った回転試行
 */
export function attemptSRSRotation(
  tetromino: Tetromino, 
  field: number[][], 
  clockwise: boolean = true
): RotationResult {
  const currentRotation = tetromino.rotation
  const targetRotation = clockwise 
    ? (currentRotation + 1) % 4 
    : (currentRotation + 3) % 4

  // キック方向の文字列を生成
  const kickKey = `${currentRotation}->${targetRotation}` as keyof typeof SRS_KICK_TABLE

  // テトリミノタイプに応じたキックテーブルを選択
  const kickTable = tetromino.type === 'I' ? SRS_I_KICK_TABLE : SRS_KICK_TABLE
  const kicks = kickTable[kickKey] || [{ x: 0, y: 0 }]

  // 各キックを順番に試行
  for (let i = 0; i < kicks.length; i++) {
    const kick = kicks[i]
    const testTetromino = tetromino.clone()
    testTetromino.x += kick.x
    testTetromino.y += kick.y
    testTetromino.rotation = targetRotation

    const blocks = testTetromino.getBlocks()
    const collision = checkCollision(blocks, field)

    if (collision.isValid) {
      return {
        success: true,
        newX: testTetromino.x,
        newY: testTetromino.y,
        newRotation: targetRotation,
        wallKickUsed: i > 0, // 最初のキック（キックなし）以外はウォールキック
        kickIndex: i
      }
    }
  }

  // 全てのキックが失敗
  return {
    success: false,
    newX: tetromino.x,
    newY: tetromino.y,
    newRotation: currentRotation,
    wallKickUsed: false,
    kickIndex: -1
  }
}

/**
 * 特定のキックデータを取得
 */
export function getKickData(
  tetrominoType: string,
  fromRotation: number,
  toRotation: number
): Array<{ x: number, y: number }> {
  const kickKey = `${fromRotation}->${toRotation}` as keyof typeof SRS_KICK_TABLE
  const kickTable = tetrominoType === 'I' ? SRS_I_KICK_TABLE : SRS_KICK_TABLE
  return kickTable[kickKey] || [{ x: 0, y: 0 }]
}

/**
 * T-Spin検出用のSRS拡張ウォールキック判定
 * T-Spinは特定のキックパターンでのみ発生する
 */
export function isTSpinEligibleKick(kickIndex: number, _fromRotation: number, _toRotation: number): boolean {
  // T-Spinが発生するキックパターンの定義
  // 通常、キックインデックス3または4（最後の2つのキック）でT-Spinが発生
  return kickIndex >= 3
}

/**
 * SRS回転状態の正規化
 */
export function normalizeRotation(rotation: number): number {
  return ((rotation % 4) + 4) % 4
}

/**
 * 回転方向の判定
 */
export function getRotationDirection(from: number, to: number): 'clockwise' | 'counterclockwise' {
  const normalizedFrom = normalizeRotation(from)
  const normalizedTo = normalizeRotation(to)
  
  const diff = normalizeRotation(normalizedTo - normalizedFrom)
  return diff === 1 ? 'clockwise' : 'counterclockwise'
}

/**
 * デバッグ用：キック情報の文字列化
 */
export function formatKickInfo(result: RotationResult): string {
  if (!result.success) return 'Rotation failed'
  if (!result.wallKickUsed) return 'No wall kick'
  return `Wall kick #${result.kickIndex + 1}`
}