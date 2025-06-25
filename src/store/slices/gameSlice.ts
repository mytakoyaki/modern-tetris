import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface GameState {
  // Game field (10x20 grid)
  field: number[][]
  
  // Current piece
  currentPiece: {
    type: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L' | null
    position: { x: number; y: number }
    rotation: number
  }
  
  // Next pieces
  nextPieces: ('I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L')[]
  
  // Hold pieces (up to 2 slots)
  holdPieces: [string | null, string | null]
  
  // Game state
  isGameRunning: boolean
  isPaused: boolean
  isGameOver: boolean
  
  // Score and stats
  score: number
  points: number
  level: number
  lines: number
  
  // Time-based stats
  gameTime: number
  blocksPlaced: number
  
  // Fever mode
  feverMode: {
    isActive: boolean
    timeRemaining: number
    blocksUntilActivation: number
  }
  
  // Exchange system
  exchangeCount: number
  exchangeCost: number
  
  // Rank system
  currentRank: {
    name: string
    threshold: number
    index: number
  }
  
  // Layout preference
  layoutOrientation: 'horizontal' | 'vertical'
}

const initialState: GameState = {
  field: Array(20).fill(null).map(() => Array(10).fill(0)),
  currentPiece: {
    type: null,
    position: { x: 4, y: 0 },
    rotation: 0
  },
  nextPieces: [],
  holdPieces: [null, null],
  isGameRunning: false,
  isPaused: false,
  isGameOver: false,
  score: 0,
  points: 0,
  level: 1,
  lines: 0,
  gameTime: 0,
  blocksPlaced: 0,
  feverMode: {
    isActive: false,
    timeRemaining: 0,
    blocksUntilActivation: 20
  },
  exchangeCount: 0,
  exchangeCost: 45,
  currentRank: {
    name: '無段',
    threshold: 0,
    index: 0
  },
  layoutOrientation: 'horizontal'
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state) => {
      state.isGameRunning = true
      state.isGameOver = false
      state.isPaused = false
    },
    pauseGame: (state) => {
      state.isPaused = !state.isPaused
    },
    endGame: (state) => {
      state.isGameRunning = false
      state.isGameOver = true
    },
    updateScore: (state, action: PayloadAction<number>) => {
      state.score += action.payload
    },
    updatePoints: (state, action: PayloadAction<number>) => {
      state.points += action.payload
    },
    toggleLayoutOrientation: (state) => {
      state.layoutOrientation = state.layoutOrientation === 'horizontal' ? 'vertical' : 'horizontal'
    },
    activateFeverMode: (state) => {
      state.feverMode.isActive = true
      state.feverMode.timeRemaining = 30000 // 30 seconds
      state.feverMode.blocksUntilActivation = 20
    },
    updateFeverTime: (state, action: PayloadAction<number>) => {
      state.feverMode.timeRemaining = Math.max(0, state.feverMode.timeRemaining - action.payload)
      if (state.feverMode.timeRemaining === 0) {
        state.feverMode.isActive = false
      }
    },
    resetGame: () => {
      return initialState
    }
  }
})

export const {
  startGame,
  pauseGame,
  endGame,
  updateScore,
  updatePoints,
  toggleLayoutOrientation,
  activateFeverMode,
  updateFeverTime,
  resetGame
} = gameSlice.actions

export default gameSlice.reducer