/**
 * ゲームフィールドシステム - HTML版から移植
 * ClaudeTetrisの完全なゲームフィールド管理
 */

import { Tetromino, TetrominoBag } from './tetromino'
import { TetrominoType } from '@/types/game'
import { attemptSRSRotation } from './srs'

export const FIELD_WIDTH = 10
export const FIELD_HEIGHT = 20

export interface LockResult {
  needsSpawn: boolean
  clearedLines?: number[]
  tetrominoLocked?: boolean
}

export interface DropResult {
  distance: number
  isSoftDrop: boolean
  tetrominoLocked?: boolean
}

export class GameField {
  public field: (number | null)[][]
  public currentTetromino: Tetromino | null
  public nextTetromino: Tetromino | null
  public holdSlots: [Tetromino | null, Tetromino | null]
  public usedHoldSlots: Set<number>
  public canHold: boolean
  
  // タイマーシステム
  private dropTimer: number
  private dropInterval: number
  private lockDelay: number
  private lockTimer: number
  private isLocking: boolean
  private lockResetCount: number
  private maxLockResets: number
  
  // ドロップ距離追跡
  public softDropDistance: number
  public hardDropDistance: number
  private justHardDropped: boolean
  
  // T-spin判定用
  public lastActionWasRotation: boolean
  public lastRotationWasKick: boolean
  public lastRotationDirection: 'cw' | 'ccw' | null
  
  // テトリミノ生成システム
  private tetrominoBag: TetrominoBag
  
  constructor() {
    this.field = this.createEmptyField()
    this.currentTetromino = null
    this.nextTetromino = null
    this.holdSlots = [null, null]
    this.usedHoldSlots = new Set()
    this.canHold = true
    
    // タイマー初期化
    this.dropTimer = 0
    this.dropInterval = 1000
    this.lockDelay = 500
    this.lockTimer = 0
    this.isLocking = false
    this.lockResetCount = 0
    this.maxLockResets = 15
    
    this.softDropDistance = 0
    this.hardDropDistance = 0
    this.justHardDropped = false
    
    // T-spin判定初期化
    this.lastActionWasRotation = false
    this.lastRotationWasKick = false
    this.lastRotationDirection = null
    
    // テトリミノ生成システム初期化
    this.tetrominoBag = new TetrominoBag()
  }

  createEmptyField(): (number | null)[][] {
    return Array(FIELD_HEIGHT).fill(null).map(() => Array(FIELD_WIDTH).fill(null))
  }

  /**
   * 新しいテトリミノをスポーン
   */
  spawnTetromino(): boolean {
    // 次のテトリミノを生成
    if (!this.nextTetromino) {
      const nextType = this.tetrominoBag.next()
      this.nextTetromino = new Tetromino(nextType)
    }
    
    const newTetromino = this.nextTetromino
    const nextType = this.tetrominoBag.next()
    this.nextTetromino = new Tetromino(nextType)
    
    // ゲームオーバー判定：デフォルトスポーン位置での衝突チェック
    if (this.isColliding(newTetromino)) {
      return false // ゲームオーバー
    }
    
    // 新しいテトリミノを設定
    this.currentTetromino = newTetromino
    
    // 状態リセット
    this.canHold = true
    this.resetUsedHoldSlots()
    this.isLocking = false
    this.lockTimer = 0
    this.lockResetCount = 0
    this.softDropDistance = 0
    this.hardDropDistance = 0
    this.justHardDropped = false
    this.lastActionWasRotation = false
    this.lastRotationWasKick = false
    this.lastRotationDirection = null
    
    return true
  }

  /**
   * 衝突判定
   */
  isColliding(tetromino: Tetromino): boolean {
    const blocks = tetromino.getBlocks()
    
    for (const block of blocks) {
      // 左右の境界チェック
      if (block.x < 0 || block.x >= FIELD_WIDTH) {
        return true
      }
      
      // 下の境界チェック
      if (block.y >= FIELD_HEIGHT) {
        return true
      }
      
      // フィールド内でのブロック衝突チェック（Y座標が0以上の場合のみ）
      if (block.y >= 0 && this.field[block.y][block.x] !== null) {
        return true
      }
    }
    
    return false
  }

  /**
   * テトリミノの移動
   */
  moveTetromino(dx: number, dy: number): DropResult | null {
    if (!this.currentTetromino) return null
    
    const tetromino = this.currentTetromino.clone()
    tetromino.x += dx
    tetromino.y += dy
    
    if (!this.isColliding(tetromino)) {
      this.currentTetromino.x = tetromino.x
      this.currentTetromino.y = tetromino.y
      
      // 下方向移動の場合、ドロップ距離を追跡
      if (dy > 0) {
        this.softDropDistance += dy
        this.resetLockTimer() // ロックタイマーリセット
        this.lastActionWasRotation = false
        
        return {
          distance: dy,
          isSoftDrop: true
        }
      }
      
      this.lastActionWasRotation = false
      return {
        distance: 0,
        isSoftDrop: false
      }
    }
    
    return null
  }

  /**
   * テトリミノの回転（SRS対応）
   */
  rotateTetromino(clockwise: boolean = true): boolean {
    if (!this.currentTetromino) return false
    
    const tetromino = this.currentTetromino.clone()
    
    // フィールドの型を変換（SRS関数用）
    const fieldForSRS = this.field.map(row => 
      row.map(cell => cell !== null ? cell : 0)
    )
    
    // SRS回転試行
    const rotationResult = attemptSRSRotation(tetromino, fieldForSRS, clockwise)
    
    if (rotationResult.success) {
      this.currentTetromino.x = rotationResult.newX
      this.currentTetromino.y = rotationResult.newY
      this.currentTetromino.rotation = rotationResult.newRotation
      
      // T-spin判定用の情報を記録
      this.lastActionWasRotation = true
      this.lastRotationWasKick = rotationResult.wallKickUsed
      this.lastRotationDirection = clockwise ? 'cw' : 'ccw'
      
      this.resetLockTimer()
      return true
    }
    
    return false
  }

  /**
   * ハードドロップ
   */
  hardDrop(): number {
    if (!this.currentTetromino) return 0
    
    let distance = 0
    
    while (this.moveTetromino(0, 1)) {
      distance++
    }
    
    this.hardDropDistance = distance
    this.justHardDropped = true
    this.lockTetromino() // 即座にロック
    
    return distance
  }

  /**
   * ホールド機能
   */
  holdTetromino(slotIndex: 0 | 1): boolean {
    if (!this.canHold || !this.currentTetromino || this.usedHoldSlots.has(slotIndex)) {
      return false
    }
    
    const heldTetromino = this.holdSlots[slotIndex]
    
    // 現在のテトリミノをリセット位置に配置
    const currentType = this.currentTetromino.type
    const newTetromino = new Tetromino(currentType)
    
    if (heldTetromino) {
      // ホールドスロットにテトリミノがある場合、交換
      this.currentTetromino = new Tetromino(heldTetromino.type)
    } else {
      // ホールドスロットが空の場合、新しいテトリミノをスポーン
      this.currentTetromino = this.nextTetromino
      const nextType = this.tetrominoBag.next()
      this.nextTetromino = new Tetromino(nextType)
    }
    
    // ホールドスロットに保存
    this.holdSlots[slotIndex] = newTetromino
    this.usedHoldSlots.add(slotIndex)
    
    // ロック状態リセット
    this.isLocking = false
    this.lockTimer = 0
    this.lockResetCount = 0
    this.lastActionWasRotation = false
    
    return true
  }

  /**
   * 使用済みホールドスロットをリセット
   */
  resetUsedHoldSlots(): void {
    this.usedHoldSlots.clear()
  }

  /**
   * エクスチェンジ機能
   */
  exchangeTetromino(): TetrominoType | null {
    if (!this.currentTetromino) {
      return null
    }

    // 交換可能なピースのリストを作成
    const availablePieces: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
    const currentPieceType = this.currentTetromino.type
    const filteredPieces = availablePieces.filter(p => p !== currentPieceType)

    // 新しいピースをランダムに選択
    const newPieceType = filteredPieces[Math.floor(Math.random() * filteredPieces.length)]
    
    // 新しいテトリミノを生成（初期位置）
    this.currentTetromino = new Tetromino(newPieceType)
    
    // ロック状態リセット
    this.isLocking = false
    this.lockTimer = 0
    this.lockResetCount = 0
    this.lastActionWasRotation = false

    return newPieceType
  }

  /**
   * ロックタイマーリセット
   */
  resetLockTimer(): void {
    if (this.lockResetCount < this.maxLockResets) {
      this.lockTimer = 0
      this.lockResetCount++
    }
  }

  /**
   * テトリミノのロック
   */
  lockTetromino(): number[] {
    if (!this.currentTetromino) return []
    
    // テトリミノタイプをナンバーIDに変換
    const typeToNumber = {
      'I': 1,
      'O': 2,
      'T': 3,
      'S': 4,
      'Z': 5,
      'J': 6,
      'L': 7
    }
    
    // フィールドにテトリミノを配置
    const blocks = this.currentTetromino.getBlocks()
    const typeNumber = typeToNumber[this.currentTetromino.type as keyof typeof typeToNumber]
    
    for (const block of blocks) {
      if (block.y >= 0 && block.y < FIELD_HEIGHT && 
          block.x >= 0 && block.x < FIELD_WIDTH) {
        this.field[block.y][block.x] = typeNumber
      }
    }
    
    // 完成したラインをチェック
    const completedLines = this.getCompletedLines()
    if (completedLines.length > 0) {
      this.clearLines(completedLines)
    }
    
    // 次のテトリミノ準備
    this.currentTetromino = null
    this.isLocking = false
    this.lockTimer = 0
    this.lockResetCount = 0
    
    return completedLines
  }

  /**
   * 完成したラインを取得
   */
  getCompletedLines(): number[] {
    const completedLines: number[] = []
    
    for (let y = 0; y < FIELD_HEIGHT; y++) {
      if (this.field[y].every(cell => cell !== null)) {
        completedLines.push(y)
      }
    }
    
    return completedLines
  }

  /**
   * ラインクリア
   */
  clearLines(lines: number[]): void {
    // 上から順にラインを削除
    lines.sort((a, b) => a - b)
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineIndex = lines[i]
      this.field.splice(lineIndex, 1)
      this.field.unshift(Array(FIELD_WIDTH).fill(null))
    }
  }

  /**
   * ゲームフィールドのアップデート（タイマー処理）
   */
  update(deltaTime: number): LockResult | null {
    if (!this.currentTetromino) {
      if (this.justHardDropped) {
        this.justHardDropped = false
        return { needsSpawn: true }
      }
      return { needsSpawn: true }
    }
    
    // 落下タイマー更新
    this.dropTimer += deltaTime
    if (this.dropTimer >= this.dropInterval) {
      this.dropTimer = 0
      
      // 自動落下
      if (!this.moveTetromino(0, 1)) {
        // 下に移動できない場合、ロック処理開始
        if (!this.isLocking) {
          this.isLocking = true
          this.lockTimer = 0
        }
      }
    }
    
    // ロックタイマー更新
    if (this.isLocking) {
      this.lockTimer += deltaTime
      if (this.lockTimer >= this.lockDelay) {
        // テトリミノをロック
        const clearedLines = this.lockTetromino()
        return {
          needsSpawn: true,
          clearedLines,
          tetrominoLocked: true
        }
      }
    }
    
    return null
  }

  /**
   * 落下速度設定（レベルベース）
   */
  setDropSpeed(level: number): void {
    // CLAUDE.mdの詳細な落下速度テーブル（秒/行 → ミリ秒変換）
    const fallSpeeds = {
      1: 1000,  2: 900,   3: 800,   4: 700,   5: 600,
      6: 550,   7: 500,   8: 450,   9: 400,   10: 400,
      11: 380,  12: 360,  13: 340,  14: 320,  15: 300,
      16: 280,  17: 260,  18: 250,  19: 240,  20: 250,
      21: 240,  22: 230,  23: 220,  24: 210,  25: 220,
      26: 210,  27: 205,  28: 200,  29: 200,  30: 200
    }
    
    this.dropInterval = fallSpeeds[level as keyof typeof fallSpeeds] || 200
  }

  /**
   * フィールドとテトリミノを合成した表示用配列を取得
   */
  getFieldWithCurrentTetromino(): (number | null)[][] {
    const displayField = this.field.map(row => [...row])
    
    if (this.currentTetromino) {
      // テトリミノタイプをナンバーIDに変換
      const typeToNumber = {
        'I': 1,
        'O': 2,
        'T': 3,
        'S': 4,
        'Z': 5,
        'J': 6,
        'L': 7
      }
      
      const blocks = this.currentTetromino.getBlocks()
      const typeNumber = typeToNumber[this.currentTetromino.type as keyof typeof typeToNumber]
      
      for (const block of blocks) {
        if (block.y >= 0 && block.y < FIELD_HEIGHT && 
            block.x >= 0 && block.x < FIELD_WIDTH) {
          displayField[block.y][block.x] = typeNumber
        }
      }
    }
    
    return displayField
  }

  /**
   * ゲームフィールドをリセット
   */
  reset(): void {
    this.field = this.createEmptyField()
    this.currentTetromino = null
    this.nextTetromino = null
    this.holdSlots = [null, null]
    this.usedHoldSlots.clear()
    this.canHold = true
    
    this.dropTimer = 0
    this.lockTimer = 0
    this.isLocking = false
    this.lockResetCount = 0
    this.softDropDistance = 0
    this.hardDropDistance = 0
    this.justHardDropped = false
    
    this.lastActionWasRotation = false
    this.lastRotationWasKick = false
    this.lastRotationDirection = null
    
    this.tetrominoBag.reset()
  }

  /**
   * ホールドスロット情報を取得
   */
  getHoldSlots(): [TetrominoType | null, TetrominoType | null] {
    return [
      this.holdSlots[0]?.type || null,
      this.holdSlots[1]?.type || null
    ]
  }

  /**
   * NEXTピースを取得
   */
  getNextPieces(count: number = 5): TetrominoType[] {
    const nextPieces: TetrominoType[] = []
    // 次のテトリミノが設定されている場合、それを最初に追加
    if (this.nextTetromino) {
      nextPieces.push(this.nextTetromino.type)
      count--
    }
    // 足りない分をバッグから予測取得
    if (count > 0) {
      const peekedPieces = this.tetrominoBag.peek(count)
      nextPieces.push(...peekedPieces)
    }
    return nextPieces
  }

  /**
   * 次のテトリミノのタイプを取得
   */
  getNextPieceType(): TetrominoType | null {
    return this.nextTetromino?.type || null
  }

  /**
   * 現在の落下インターバル（ms）を取得
   */
  public getDropInterval(): number {
    return this.dropInterval
  }

  /**
   * 現在のテトリミノを設定（ホールド・エクスチェンジ用）
   */
  public setCurrentTetromino(type: TetrominoType, x: number, y: number, rotation: number): void {
    this.currentTetromino = new Tetromino(type, x, y)
    this.currentTetromino.setRotation(rotation)
    
    // ロック状態をリセット
    this.isLocking = false
    this.lockTimer = 0
    
    console.log('[DEBUG] GameField.setCurrentTetromino called:', { type, x, y, rotation })
  }

  /**
   * 重力による落下処理
   * 空の行の上にあるブロックを下に落とす
   */
  applyGravity(field: (number | null)[][]): (number | null)[][] {
    const newField = field.map(row => [...row])
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
    
    if (iterations >= maxIterations) {
      console.warn('[WARNING] Gravity iteration limit reached')
    }
    
    return newField
  }

  /**
   * 一列消去（一番下の列を消去）
   */
  clearBottomRow(field: (number | null)[][]): (number | null)[][] {
    // 一番下の行を空にする
    let newField = field.map((row, index) => {
      if (index === 19) { // 一番下の行（19行目）
        return Array(10).fill(null) // 空の行に置き換え
      }
      return [...row]
    })
    
    // 重力を適用してブロックを落下させる
    newField = this.applyGravity(newField)
    
    console.log('[DEBUG] Bottom row cleared and gravity applied')
    
    return newField
  }

  /**
   * 一列消去が可能かチェック
   */
  canClearBottomRow(field: (number | null)[][]): boolean {
    // 一番下の行（19行目）にブロックがあるかチェック
    return field[19]?.some(cell => cell !== null) || false
  }
}