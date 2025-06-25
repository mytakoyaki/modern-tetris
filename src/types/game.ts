export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export interface Position {
  x: number
  y: number
}

export interface Tetromino {
  type: TetrominoType
  shape: number[][]
  position: Position
  rotation: number
}

export interface GameConfig {
  GRID_WIDTH: 10
  GRID_HEIGHT: 20
  FEVER_BLOCKS_NEEDED: 20
  FEVER_DURATION: 30000
  FEVER_SCORE_MULTIPLIER: 4
  EXCHANGE_COSTS: number[]
  RANKS: Array<{
    name: string
    threshold: number
  }>
}

export interface SpinResult {
  type: 'T-Spin' | 'SZ-Spin' | 'I-Spin' | 'JL-Spin' | null
  variant: 'Single' | 'Double' | 'Triple' | 'Mini' | null
  bonus: number
}

export const TETROMINO_SHAPES: Record<TetrominoType, number[][][]> = {
  I: [
    [[1,1,1,1]],
    [[1],[1],[1],[1]]
  ],
  O: [
    [[1,1],[1,1]]
  ],
  T: [
    [[0,1,0],[1,1,1]],
    [[1,0],[1,1],[1,0]],
    [[1,1,1],[0,1,0]],
    [[0,1],[1,1],[0,1]]
  ],
  S: [
    [[0,1,1],[1,1,0]],
    [[1,0],[1,1],[0,1]]
  ],
  Z: [
    [[1,1,0],[0,1,1]],
    [[0,1],[1,1],[1,0]]
  ],
  J: [
    [[1,0,0],[1,1,1]],
    [[1,1],[1,0],[1,0]],
    [[1,1,1],[0,0,1]],
    [[0,1],[0,1],[1,1]]
  ],
  L: [
    [[0,0,1],[1,1,1]],
    [[1,0],[1,0],[1,1]],
    [[1,1,1],[1,0,0]],
    [[1,1],[0,1],[0,1]]
  ]
}