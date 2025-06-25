export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L'

export interface Position {
  x: number
  y: number
}

export interface Block {
  x: number
  y: number
}

export interface TetrominoData {
  type: TetrominoType
  x: number
  y: number
  rotation: number
}

export interface TetrominoShape {
  color: string
  className: string
  rotations: number[][][]
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

export const TETROMINO_TYPES: Record<TetrominoType, TetrominoShape> = {
  I: {
    color: '#00f5ff',
    className: 'tetromino-I',
    rotations: [
      [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
      [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
    ]
  },
  O: {
    color: '#ffd700',
    className: 'tetromino-O',
    rotations: [
      [[0,1,1,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]]
    ]
  },
  T: {
    color: '#a020f0',
    className: 'tetromino-T',
    rotations: [
      [[0,1,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
      [[0,1,0,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
      [[0,0,0,0], [1,1,1,0], [0,1,0,0], [0,0,0,0]],
      [[0,1,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]
    ]
  },
  S: {
    color: '#00ff00',
    className: 'tetromino-S',
    rotations: [
      [[0,1,1,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]],
      [[0,1,0,0], [0,1,1,0], [0,0,1,0], [0,0,0,0]],
      [[0,0,0,0], [0,1,1,0], [1,1,0,0], [0,0,0,0]],
      [[1,0,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]]
    ]
  },
  Z: {
    color: '#ff0000',
    className: 'tetromino-Z',
    rotations: [
      [[1,1,0,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]],
      [[0,0,1,0], [0,1,1,0], [0,1,0,0], [0,0,0,0]],
      [[0,0,0,0], [1,1,0,0], [0,1,1,0], [0,0,0,0]],
      [[0,1,0,0], [1,1,0,0], [1,0,0,0], [0,0,0,0]]
    ]
  },
  J: {
    color: '#0000ff',
    className: 'tetromino-J',
    rotations: [
      [[1,0,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
      [[0,1,1,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]],
      [[0,0,0,0], [1,1,1,0], [0,0,1,0], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [1,1,0,0], [0,0,0,0]]
    ]
  },
  L: {
    color: '#ff8c00',
    className: 'tetromino-L',
    rotations: [
      [[0,0,1,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]],
      [[0,1,0,0], [0,1,0,0], [0,1,1,0], [0,0,0,0]],
      [[0,0,0,0], [1,1,1,0], [1,0,0,0], [0,0,0,0]],
      [[1,1,0,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]]
    ]
  }
}

export const TETROMINO_NAMES: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']