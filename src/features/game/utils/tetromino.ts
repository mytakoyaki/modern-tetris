import { TetrominoType, TetrominoData, Block, TETROMINO_TYPES, TETROMINO_NAMES } from '@/types/game'

export class Tetromino {
  public type: TetrominoType
  public x: number
  public y: number
  public rotation: number

  constructor(type: TetrominoType, x: number = 3, y: number = 0) {
    this.type = type
    this.x = x
    this.y = y
    this.rotation = 0
  }

  public getCurrentRotation(): number[][] {
    const shape = TETROMINO_TYPES[this.type]
    if (!shape || !shape.rotations || !shape.rotations[this.rotation]) {
      console.error('[DEBUG] Invalid tetromino shape or rotation:', { type: this.type, rotation: this.rotation, shape })
      return []
    }
    return shape.rotations[this.rotation]
  }

  public getNextRotation(): number[][] {
    const shape = TETROMINO_TYPES[this.type]
    const nextRotation = (this.rotation + 1) % shape.rotations.length
    return shape.rotations[nextRotation]
  }

  public getRotation(rotation: number): number[][] {
    const shape = TETROMINO_TYPES[this.type]
    const normalizedRotation = ((rotation % shape.rotations.length) + shape.rotations.length) % shape.rotations.length
    return shape.rotations[normalizedRotation]
  }

  public rotateCounterClockwise(): void {
    const shape = TETROMINO_TYPES[this.type]
    this.rotation = (this.rotation - 1 + shape.rotations.length) % shape.rotations.length
  }

  public setPosition(x: number, y: number): void {
    this.x = x
    this.y = y
  }

  public setRotation(rotation: number): void {
    const shape = TETROMINO_TYPES[this.type]
    this.rotation = ((rotation % shape.rotations.length) + shape.rotations.length) % shape.rotations.length
  }

  public rotate(): void {
    const shape = TETROMINO_TYPES[this.type]
    this.rotation = (this.rotation + 1) % shape.rotations.length
  }

  public moveDown(): void {
    this.y++
  }

  public moveLeft(): void {
    this.x--
  }

  public moveRight(): void {
    this.x++
  }

  public moveUp(): void {
    this.y--
  }

  public getBlocks(): Block[] {
    return this.getBlocksForRotation(this.getCurrentRotation())
  }

  public getBlocksForRotation(rotation: number[][]): Block[] {
    const blocks: Block[] = []
    
    if (!rotation || !Array.isArray(rotation)) {
      console.error('[DEBUG] Invalid rotation array:', rotation)
      return blocks
    }
    
    for (let row = 0; row < rotation.length; row++) {
      for (let col = 0; col < rotation[row].length; col++) {
        if (rotation[row][col]) {
          blocks.push({
            x: this.x + col,
            y: this.y + row
          })
        }
      }
    }
    
    return blocks
  }

  public clone(): Tetromino {
    const cloned = new Tetromino(this.type, this.x, this.y)
    cloned.rotation = this.rotation
    return cloned
  }

  public getColor(): string {
    return TETROMINO_TYPES[this.type].color
  }

  public getClassName(): string {
    return TETROMINO_TYPES[this.type].className
  }

  public static getRandomType(): TetrominoType {
    return TETROMINO_NAMES[Math.floor(Math.random() * TETROMINO_NAMES.length)]
  }

  public static createRandom(): Tetromino {
    return new Tetromino(Tetromino.getRandomType())
  }

  public static fromData(data: TetrominoData): Tetromino {
    const tetromino = new Tetromino(data.type, data.x, data.y)
    tetromino.rotation = data.rotation
    return tetromino
  }

  public toData(): TetrominoData {
    return {
      type: this.type,
      x: this.x,
      y: this.y,
      rotation: this.rotation
    }
  }

  public getBlockPositions(): Array<{x: number, y: number}> {
    const positions: Array<{x: number, y: number}> = []
    const matrix = this.getCurrentRotation()
    
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] === 1) {
          positions.push({
            x: this.x + col,
            y: this.y + row
          })
        }
      }
    }
    
    return positions
  }
}

/**
 * テトリミノの7-bagシステム
 * HTML版の機能を移植
 */
export class TetrominoBag {
  private bag: TetrominoType[]
  private currentIndex: number

  constructor() {
    this.bag = []
    this.currentIndex = 0
    this.refillBag()
  }

  /**
   * バッグを再充填（7種類をシャッフル）
   */
  private refillBag(): void {
    this.bag = [...TETROMINO_NAMES]
    
    // Fisher-Yatesシャッフル
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]]
    }
    
    this.currentIndex = 0
  }

  /**
   * 次のテトリミノタイプを取得
   */
  next(): TetrominoType {
    if (this.currentIndex >= this.bag.length) {
      this.refillBag()
    }
    
    return this.bag[this.currentIndex++]
  }

  /**
   * 先読み用：次のN個のテトリミノタイプを取得
   */
  peek(count: number): TetrominoType[] {
    const result: TetrominoType[] = []
    let tempIndex = this.currentIndex
    let tempBag = [...this.bag]
    
    for (let i = 0; i < count; i++) {
      if (tempIndex >= tempBag.length) {
        // 新しいバッグを作成
        tempBag = [...TETROMINO_NAMES]
        for (let j = tempBag.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1))
          ;[tempBag[j], tempBag[k]] = [tempBag[k], tempBag[j]]
        }
        tempIndex = 0
      }
      
      result.push(tempBag[tempIndex++])
    }
    
    return result
  }

  /**
   * バッグの状態をリセット
   */
  reset(): void {
    this.refillBag()
  }
}