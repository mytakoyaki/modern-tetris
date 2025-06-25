import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface ScoreEntry {
  id: string
  score: number
  level: number
  lines: number
  rank: string
  date: string
  gameTime: number
  userId?: string
}

export interface ScoreState {
  highScores: ScoreEntry[]
  personalBest: ScoreEntry | null
  dailyRanking: ScoreEntry[]
  globalRanking: ScoreEntry[]
  statistics: {
    totalGames: number
    totalScore: number
    totalLines: number
    totalTime: number
    averageScore: number
    bestRank: string
  }
}

const initialState: ScoreState = {
  highScores: [],
  personalBest: null,
  dailyRanking: [],
  globalRanking: [],
  statistics: {
    totalGames: 0,
    totalScore: 0,
    totalLines: 0,
    totalTime: 0,
    averageScore: 0,
    bestRank: '無段'
  }
}

export const scoreSlice = createSlice({
  name: 'score',
  initialState,
  reducers: {
    addScore: (state, action: PayloadAction<Omit<ScoreEntry, 'id'>>) => {
      const newScore: ScoreEntry = {
        ...action.payload,
        id: Date.now().toString()
      }
      
      state.highScores.push(newScore)
      state.highScores.sort((a, b) => b.score - a.score)
      state.highScores = state.highScores.slice(0, 10) // Keep top 10
      
      // Update personal best
      if (!state.personalBest || newScore.score > state.personalBest.score) {
        state.personalBest = newScore
      }
      
      // Update statistics
      state.statistics.totalGames += 1
      state.statistics.totalScore += newScore.score
      state.statistics.totalLines += newScore.lines
      state.statistics.totalTime += newScore.gameTime
      state.statistics.averageScore = state.statistics.totalScore / state.statistics.totalGames
    },
    updateDailyRanking: (state, action: PayloadAction<ScoreEntry[]>) => {
      state.dailyRanking = action.payload
    },
    updateGlobalRanking: (state, action: PayloadAction<ScoreEntry[]>) => {
      state.globalRanking = action.payload
    },
    clearScores: (state) => {
      state.highScores = []
      state.personalBest = null
      state.statistics = initialState.statistics
    }
  }
})

export const {
  addScore,
  updateDailyRanking,
  updateGlobalRanking,
  clearScores
} = scoreSlice.actions

export default scoreSlice.reducer