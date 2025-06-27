import { Tetromino } from './tetromino'
import { 
  SpinResult, 
  SpinDetectionContext, 
  CornerCheckResult, 
  SPIN_BONUSES 
} from '@/types/spin'
import { Block } from '@/types/game'
import { isTSpinEligibleKick } from './srs'

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
 * T-Spin検出（標準ルール準拠版）
 * 標準的なT-Spin判定：
 * - T-Spin: 3つ以上の角が埋まっている + ウォールキック使用
 * - T-Spin Mini: 特定の回転状態で3つの角が埋まっている + 特定のキックパターン
 */
function detectTSpin(tetromino: Tetromino, field: number[][], clearedLines: number, wasWallKick: boolean = false, kickIndex: number = 0): SpinResult {
  // T-Spinはウォールキックが必須条件
  if (!wasWallKick) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  const cornerCheck = checkTSpinCornersAccurate(tetromino, field)
  
  // 最低3つの角が埋まっている必要がある
  if (cornerCheck.filledCorners < 3) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  // T-Spin Mini判定: 特定のキックパターンでのみ発生
  const isMini = cornerCheck.filledCorners === 3 && isTSpinEligibleKick(kickIndex, 0, 1)
  
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
    // 通常のT-Spin (3つ以上の角が埋まっている場合)
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
 * 正確なT-Spin角チェック（Tミノの形状に基づく）
 */
function checkTSpinCornersAccurate(tetromino: Tetromino, field: number[][]): CornerCheckResult {
  const blocks = tetromino.getBlocks()
  
  // Tミノの中心ブロックを特定
  const centerBlock = findTCenterBlock(blocks, tetromino.rotation)
  if (!centerBlock) {
    return { filledCorners: 0, totalCorners: 4, positions: [] }
  }
  
  // 回転状態に応じた角位置を計算
  const cornerPositions = getTCornerPositions(centerBlock, tetromino.rotation)
  
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
 * Tミノの中心ブロックを特定（形状に基づく正確な計算）
 */
function findTCenterBlock(blocks: Block[], rotation: number): Block | null {
  // Tミノの形状定義に基づく中心位置
  // TETROMINO_TYPES['T'].rotations[rotation]の中心を特定
  const tShape = [
    [[0,1,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]], // 0度: ┳
    [[0,1,0,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]], // 90度: ┣
    [[0,0,0,0], [1,1,1,0], [0,1,0,0], [0,0,0,0]], // 180度: ┻
    [[0,1,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]  // 270度: ┫
  ]
  
  const shape = tShape[rotation]
  if (!shape) {
    return null
  }
  
  // 形状の中心位置を計算
  let centerX = 0, centerY = 0, count = 0
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        centerX += x
        centerY += y
        count++
      }
    }
  }
  
  if (count === 0) {
    return null
  }
  
  centerX = Math.floor(centerX / count)
  centerY = Math.floor(centerY / count)
  
  // 実際の座標に変換（テトリミノの基準位置を取得）
  const baseBlock = blocks[0]
  if (!baseBlock) {
    return null
  }
  
  // テトリミノの基準位置を計算（最初のブロックの位置から形状のオフセットを引く）
  const baseX = baseBlock.x - centerX
  const baseY = baseBlock.y - centerY
  
  // 中心位置の実際の座標
  const actualCenterX = baseX + centerX
  const actualCenterY = baseY + centerY
  
  // 中心位置に最も近いブロックを返す
  const centerBlock = blocks.find(block => 
    block.x === actualCenterX && block.y === actualCenterY
  ) || blocks[1] || blocks[0]
  
  return centerBlock
}

/**
 * Tミノの回転状態に応じた角位置を取得
 */
function getTCornerPositions(centerBlock: Block, rotation: number): Array<{x: number, y: number}> {
  // Tミノの形状に基づく角位置（中心ブロックからの相対位置）
  const cornerOffsets = {
    0: [ // 0度: ┳
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ],
    1: [ // 90度: ┣
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ],
    2: [ // 180度: ┻
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ],
    3: [ // 270度: ┫
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ]
  }
  
  const offsets = cornerOffsets[rotation as keyof typeof cornerOffsets]
  return offsets.map(offset => ({
    x: centerBlock.x + offset.x,
    y: centerBlock.y + offset.y
  }))
}

/**
 * SZ-Spin検出（形状に基づく正確な判定）
 */
function detectSZSpin(tetromino: Tetromino, field: number[][], clearedLines: number, wasWallKick: boolean = false): SpinResult {
  // SZ-Spinはウォールキックが必須
  if (!wasWallKick) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  const cornerCheck = checkSZSpinCorners(tetromino, field)
  
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
 * SZ-Spin専用の角チェック
 */
function checkSZSpinCorners(tetromino: Tetromino, field: number[][]): CornerCheckResult {
  const blocks = tetromino.getBlocks()
  
  // S/Zミノの中心位置を特定
  const centerBlock = findSZCenterBlock(blocks, tetromino.rotation, tetromino.type)
  if (!centerBlock) {
    return { filledCorners: 0, totalCorners: 4, positions: [] }
  }
  
  // S/Zミノの角位置を計算（対角線形状を考慮）
  const cornerPositions = getSZCornerPositions(centerBlock, tetromino.type, tetromino.rotation)
  
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
 * S/Zミノの中心ブロックを特定
 */
function findSZCenterBlock(blocks: Block[], rotation: number, type: string): Block | null {
  // S/Zミノの形状定義
  const sShape = [
    [[0,1,1,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]], // 0度
    [[0,1,0,0], [0,1,1,0], [0,0,1,0], [0,0,0,0]], // 90度
    [[0,0,0,0], [0,1,1,0], [1,1,0,0], [0,0,0,0]], // 180度
    [[1,0,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]  // 270度
  ]
  
  const zShape = [
    [[1,1,0,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]], // 0度
    [[0,0,1,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]], // 90度
    [[0,0,0,0], [1,1,0,0], [0,1,1,0], [0,0,0,0]], // 180度
    [[0,1,0,0], [1,1,0,0], [1,0,0,0], [0,0,0,0]]  // 270度
  ]
  
  const shape = type === 'S' ? sShape[rotation] : zShape[rotation]
  if (!shape) return null
  
  // 形状の中心位置を計算
  let centerX = 0, centerY = 0, count = 0
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        centerX += x
        centerY += y
        count++
      }
    }
  }
  
  if (count === 0) return null
  
  centerX = Math.floor(centerX / count)
  centerY = Math.floor(centerY / count)
  
  // 実際の座標に変換
  const baseBlock = blocks[0]
  if (!baseBlock) return null
  
  const baseX = baseBlock.x - centerX
  const baseY = baseBlock.y - centerY
  
  const actualCenterX = baseX + centerX
  const actualCenterY = baseY + centerY
  
  return blocks.find(block => 
    block.x === actualCenterX && block.y === actualCenterY
  ) || blocks[1] || blocks[0]
}

/**
 * S/Zミノの角位置を取得（形状に基づく）
 */
function getSZCornerPositions(centerBlock: Block, _type: string, rotation: number): Array<{x: number, y: number}> {
  // S/Zミノの対角線形状を考慮した角位置
  const cornerOffsets = {
    0: [ // 0度
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ],
    1: [ // 90度
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ],
    2: [ // 180度
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ],
    3: [ // 270度
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ]
  }
  
  const offsets = cornerOffsets[rotation as keyof typeof cornerOffsets]
  return offsets.map(offset => ({
    x: centerBlock.x + offset.x,
    y: centerBlock.y + offset.y
  }))
}

/**
 * I-Spin検出（Iミノ専用の長い形状を考慮）
 */
function detectISpin(tetromino: Tetromino, field: number[][], clearedLines: number, wasWallKick: boolean = false): SpinResult {
  // I-Spinはウォールキックが必須
  if (!wasWallKick) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  const cornerCheck = checkISpinCorners(tetromino, field)
  
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
 * I-Spin専用の角チェック（長い形状を考慮）
 */
function checkISpinCorners(tetromino: Tetromino, field: number[][]): CornerCheckResult {
  const blocks = tetromino.getBlocks()
  
  // Iミノの中心位置を特定（長い形状を考慮）
  const centerBlock = findICenterBlock(blocks, tetromino.rotation)
  if (!centerBlock) {
    return { filledCorners: 0, totalCorners: 4, positions: [] }
  }
  
  // Iミノの角位置を計算（長い形状を考慮）
  const cornerPositions = getICornerPositions(centerBlock, tetromino.rotation)
  
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
 * Iミノの中心ブロックを特定
 */
function findICenterBlock(blocks: Block[], rotation: number): Block | null {
  // Iミノの形状定義
  const iShape = [
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // 0度: 横長
    [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]], // 90度: 縦長
    [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]], // 180度: 横長
    [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]  // 270度: 縦長
  ]
  
  const shape = iShape[rotation]
  if (!shape) return null
  
  // 形状の中心位置を計算
  let centerX = 0, centerY = 0, count = 0
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        centerX += x
        centerY += y
        count++
      }
    }
  }
  
  if (count === 0) return null
  
  centerX = Math.floor(centerX / count)
  centerY = Math.floor(centerY / count)
  
  // 実際の座標に変換
  const baseBlock = blocks[0]
  if (!baseBlock) return null
  
  const baseX = baseBlock.x - centerX
  const baseY = baseBlock.y - centerY
  
  const actualCenterX = baseX + centerX
  const actualCenterY = baseY + centerY
  
  return blocks.find(block => 
    block.x === actualCenterX && block.y === actualCenterY
  ) || blocks[2] || blocks[0] // Iミノは4ブロックなので2番目をフォールバック
}

/**
 * Iミノの角位置を取得（長い形状を考慮）
 */
function getICornerPositions(centerBlock: Block, rotation: number): Array<{x: number, y: number}> {
  // Iミノの長い形状を考慮した角位置
  const cornerOffsets = {
    0: [ // 0度: 横長
      { x: -2, y: -1 }, // 左上
      { x: 2, y: -1 },  // 右上
      { x: -2, y: 1 },  // 左下
      { x: 2, y: 1 }    // 右下
    ],
    1: [ // 90度: 縦長
      { x: -1, y: -2 }, // 左上
      { x: 1, y: -2 },  // 右上
      { x: -1, y: 2 },  // 左下
      { x: 1, y: 2 }    // 右下
    ],
    2: [ // 180度: 横長
      { x: -2, y: -1 }, // 左上
      { x: 2, y: -1 },  // 右上
      { x: -2, y: 1 },  // 左下
      { x: 2, y: 1 }    // 右下
    ],
    3: [ // 270度: 縦長
      { x: -1, y: -2 }, // 左上
      { x: 1, y: -2 },  // 右上
      { x: -1, y: 2 },  // 左下
      { x: 1, y: 2 }    // 右下
    ]
  }
  
  const offsets = cornerOffsets[rotation as keyof typeof cornerOffsets]
  return offsets.map(offset => ({
    x: centerBlock.x + offset.x,
    y: centerBlock.y + offset.y
  }))
}

/**
 * JL-Spin検出（L字形状を考慮）
 */
function detectJLSpin(tetromino: Tetromino, field: number[][], clearedLines: number, wasWallKick: boolean = false): SpinResult {
  // JL-Spinはウォールキックが必須
  if (!wasWallKick) {
    return { type: null, variant: null, bonus: 0, lines: clearedLines }
  }
  
  const cornerCheck = checkJLSpinCorners(tetromino, field)
  
  
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
 * JL-Spin専用の角チェック（L字形状を考慮）
 */
function checkJLSpinCorners(tetromino: Tetromino, field: number[][]): CornerCheckResult {
  const blocks = tetromino.getBlocks()
  
  // J/Lミノの中心位置を特定
  const centerBlock = findJLCenterBlock(blocks, tetromino.rotation, tetromino.type)
  if (!centerBlock) {
    return { filledCorners: 0, totalCorners: 4, positions: [] }
  }
  
  // J/Lミノの角位置を計算（L字形状を考慮）
  const cornerPositions = getJLCornerPositions(centerBlock, tetromino.rotation)
  
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
 * J/Lミノの中心ブロックを特定
 */
function findJLCenterBlock(blocks: Block[], rotation: number, type: string): Block | null {
  // J/Lミノの形状定義
  const jShape = [
    [[1,0,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]], // 0度
    [[0,1,1,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]], // 90度
    [[0,0,0,0], [1,1,1,0], [0,0,1,0], [0,0,0,0]], // 180度
    [[0,1,0,0], [0,1,0,0], [1,1,0,0], [0,0,0,0]]  // 270度
  ]
  
  const lShape = [
    [[0,0,1,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]], // 0度
    [[0,1,0,0], [0,1,0,0], [0,1,1,0], [0,0,0,0]], // 90度
    [[0,0,0,0], [1,1,1,0], [1,0,0,0], [0,0,0,0]], // 180度
    [[1,1,0,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]]  // 270度
  ]
  
  const shape = type === 'J' ? jShape[rotation] : lShape[rotation]
  if (!shape) return null
  
  // 形状の中心位置を計算
  let centerX = 0, centerY = 0, count = 0
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        centerX += x
        centerY += y
        count++
      }
    }
  }
  
  if (count === 0) return null
  
  centerX = Math.floor(centerX / count)
  centerY = Math.floor(centerY / count)
  
  // 実際の座標に変換
  const baseBlock = blocks[0]
  if (!baseBlock) return null
  
  const baseX = baseBlock.x - centerX
  const baseY = baseBlock.y - centerY
  
  const actualCenterX = baseX + centerX
  const actualCenterY = baseY + centerY
  
  return blocks.find(block => 
    block.x === actualCenterX && block.y === actualCenterY
  ) || blocks[1] || blocks[0]
}

/**
 * J/Lミノの角位置を取得（L字形状を考慮）
 */
function getJLCornerPositions(centerBlock: Block, rotation: number): Array<{x: number, y: number}> {
  // J/LミノのL字形状を考慮した角位置
  const cornerOffsets = {
    0: [ // 0度
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ],
    1: [ // 90度
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ],
    2: [ // 180度
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ],
    3: [ // 270度
      { x: -1, y: -1 }, // 左上
      { x: 1, y: -1 },  // 右上
      { x: -1, y: 1 },  // 左下
      { x: 1, y: 1 }    // 右下
    ]
  }
  
  const offsets = cornerOffsets[rotation as keyof typeof cornerOffsets]
  return offsets.map(offset => ({
    x: centerBlock.x + offset.x,
    y: centerBlock.y + offset.y
  }))
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

/**
 * 演出用のスピン結果文字列生成（全角日本語）
 */
export function formatSpinResultForEffect(spinResult: SpinResult): string | null {
  if (!spinResult.type || !spinResult.variant) return null
  
  if (spinResult.type === 'T-Spin') {
    if (spinResult.variant === 'Mini') {
      return `Ｔ－ＳＰＩＮ　ＭＩＮＩ！`
    }
    return `Ｔ－ＳＰＩＮ！`
  }
  
  if (spinResult.type === 'SZ-Spin') {
    return `ＳＺ－ＳＰＩＮ！`
  }
  
  if (spinResult.type === 'I-Spin') {
    return `Ｉ－ＳＰＩＮ！`
  }
  
  if (spinResult.type === 'JL-Spin') {
    return `ＪＬ－ＳＰＩＮ！`
  }
  
  return `${spinResult.type} ${spinResult.variant}`
}