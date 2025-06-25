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
    return shape.rotations[this.rotation]
  }

  public getNextRotation(): number[][] {
    const shape = TETROMINO_TYPES[this.type]
    const nextRotation = (this.rotation + 1) % shape.rotations.length
    return shape.rotations[nextRotation]
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
}