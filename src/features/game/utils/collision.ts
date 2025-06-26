import { Block } from '@/types/game'
import { Tetromino } from './tetromino'

const GRID_WIDTH = 10
const GRID_HEIGHT = 20

export interface CollisionCheck {
  isValid: boolean
  outOfBounds?: boolean
  blockCollision?: boolean
}

/**
 * フィールド境界チェック
 */
export function checkBounds(blocks: Block[]): boolean {
  return blocks.every(block => 
    block.x >= 0 && 
    block.x < GRID_WIDTH && 
    block.y >= 0 && 
    block.y < GRID_HEIGHT
  )
}

/**
 * ブロック衝突チェック
 */
export function checkBlockCollision(blocks: Block[], field: number[][]): boolean {
  return blocks.every(block => {
    // 境界外は既にcheckBoundsでチェック済み
    if (block.x < 0 || block.x >= GRID_WIDTH || block.y < 0 || block.y >= GRID_HEIGHT) {
      return true
    }
    // フィールド上のブロックと衝突していないかチェック（nullまたは0は空きセル）
    const cellValue = field[block.y][block.x]
    return cellValue === null || cellValue === 0
  })
}

/**
 * 包括的な衝突判定
 */
export function checkCollision(blocks: Block[], field: number[][]): CollisionCheck {
  const outOfBounds = !checkBounds(blocks)
  const blockCollision = !checkBlockCollision(blocks, field)
  
  return {
    isValid: !outOfBounds && !blockCollision,
    outOfBounds,
    blockCollision
  }
}

/**
 * テトリミノの移動可能性チェック
 */
export function canMoveTetromino(
  tetromino: Tetromino, 
  dx: number, 
  dy: number, 
  field: number[][]
): boolean {
  const cloned = tetromino.clone()
  cloned.x += dx
  cloned.y += dy
  const blocks = cloned.getBlocks()
  
  return checkCollision(blocks, field).isValid
}

/**
 * テトリミノの回転可能性チェック（SRS対応）
 * 注意: この関数は後方互換性のため残していますが、
 * 新しいコードではattemptSRSRotationを使用してください
 */
export function canRotateTetromino(
  tetromino: Tetromino, 
  field: number[][]
): boolean {
  const cloned = tetromino.clone()
  cloned.rotate()
  const blocks = cloned.getBlocks()
  
  return checkCollision(blocks, field).isValid
}

/**
 * テトリミノが着地しているかチェック
 */
export function isTetrominoLanded(
  tetromino: Tetromino, 
  field: number[][]
): boolean {
  return !canMoveTetromino(tetromino, 0, 1, field)
}

/**
 * ハードドロップ時の着地位置計算
 */
export function getHardDropPosition(
  tetromino: Tetromino, 
  field: number[][]
): number {
  const cloned = tetromino.clone()
  let dropDistance = 0
  
  while (canMoveTetromino(cloned, 0, 1, field)) {
    cloned.moveDown()
    dropDistance++
  }
  
  return cloned.y
}

/**
 * ゴーストピース用の位置計算
 */
export function getGhostPiecePosition(
  tetromino: Tetromino, 
  field: number[][]
): Block[] {
  const cloned = tetromino.clone()
  cloned.y = getHardDropPosition(tetromino, field)
  return cloned.getBlocks()
}

/**
 * 完成したラインの検出
 */
export function getCompletedLines(field: number[][]): number[] {
  const completedLines: number[] = []
  
  for (let y = 0; y < GRID_HEIGHT; y++) {
    const isComplete = field[y].every(cell => cell !== null && cell !== 0)
    if (isComplete) {
      completedLines.push(y)
    }
  }
  
  return completedLines
}

/**
 * フィールドにテトリミノを設置
 */
export function placeTetromino(
  tetromino: Tetromino, 
  field: number[][]
): number[][] {
  const newField = field.map(row => [...row])
  const blocks = tetromino.getBlocks()
  
  // テトリミノタイプに応じた数値を設定
  const typeToNumber = {
    'I': 1, 'O': 2, 'T': 3, 'S': 4, 'Z': 5, 'J': 6, 'L': 7
  }
  
  blocks.forEach(block => {
    if (block.y >= 0 && block.y < GRID_HEIGHT && 
        block.x >= 0 && block.x < GRID_WIDTH) {
      newField[block.y][block.x] = typeToNumber[tetromino.type]
    }
  })
  
  return newField
}

/**
 * 完成ラインを削除してフィールドを更新
 */
export function clearLines(field: number[][], completedLines: number[]): number[][] {
  if (completedLines.length === 0) return field
  
  const newField = field.filter((_, y) => !completedLines.includes(y))
  
  // 削除した分だけ上に空のラインを追加
  for (let i = 0; i < completedLines.length; i++) {
    newField.unshift(Array(GRID_WIDTH).fill(null))
  }
  
  return newField
}

/**
 * ゲームオーバー判定：新しいピースが生成位置に配置できるかチェック
 */
export function isGameOver(tetromino: Tetromino, field: number[][]): boolean {
  const blocks = tetromino.getBlocks()
  return !checkCollision(blocks, field).isValid
}

/**
 * スポーン位置での衝突チェック（ゲームオーバー用）
 */
export function canSpawnTetromino(type: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L', field: number[][]): boolean {
  const tetromino = new Tetromino(type, 3, 0) // 標準スポーン位置（Tetrominoコンストラクタのデフォルトと同じ）
  return !isGameOver(tetromino, field)
}