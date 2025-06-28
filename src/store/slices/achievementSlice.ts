import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { FULL_ACHIEVEMENTS } from './fullAchievements'

export interface Achievement {
  id: string
  name: string
  description: string
  category: 'basic' | 'score' | 'technical' | 'challenge' | 'special' | 'rank' | 'progress' | 'fun'
  icon: string
  pointReward: number
  unlocked: boolean
  unlockedAt?: string
  progress: number
  maxProgress: number
  condition: {
    type: string
    value: number | string
    score?: number
    time?: number
    max_blocks?: number
  }
  hidden?: boolean
}

export interface AchievementState {
  achievements: Achievement[]
  totalPoints: number
  unlockedCount: number
  recentUnlocks: Achievement[]
  sessionStats: {
    score: number
    linesCleared: number
    blocksPlaced: number
    tetrisCount: number
    tspinCount: number
    maxCombo: number
    perfectClearCount: number
    feverCount: number
    exchangeCount: number
    holdCount: number
    level: number
    danRank: number
    playTime: number
    gamesPlayed: number
  }
  globalStats: {
    totalScore: number
    totalLines: number
    totalBlocks: number
    totalTetris: number
    totalTspin: number
    bestCombo: number
    totalPerfectClear: number
    totalFever: number
    totalExchange: number
    totalHold: number
    maxLevel: number
    maxDanRank: number
    totalPlayTime: number
    totalGames: number
    consecutiveDays: number
    lastPlayDate: string
  }
}

// 完全な実績リストを使用（unlockedAtを削除して初期化）
const initialAchievements: Achievement[] = FULL_ACHIEVEMENTS.map(achievement => ({
  ...achievement,
  unlocked: false,
  unlockedAt: undefined,
  progress: 0
}))

// デバッグ用ログ
console.log('FULL_ACHIEVEMENTS length:', FULL_ACHIEVEMENTS.length)
console.log('initialAchievements length:', initialAchievements.length)

const initialState: AchievementState = {
  achievements: initialAchievements,
  totalPoints: 0,
  unlockedCount: 0,
  recentUnlocks: [],
  sessionStats: {
    score: 0,
    linesCleared: 0,
    blocksPlaced: 0,
    tetrisCount: 0,
    tspinCount: 0,
    maxCombo: 0,
    perfectClearCount: 0,
    feverCount: 0,
    exchangeCount: 0,
    holdCount: 0,
    level: 1,
    danRank: 0,
    playTime: 0,
    gamesPlayed: 0
  },
  globalStats: {
    totalScore: 0,
    totalLines: 0,
    totalBlocks: 0,
    totalTetris: 0,
    totalTspin: 0,
    bestCombo: 0,
    totalPerfectClear: 0,
    totalFever: 0,
    totalExchange: 0,
    totalHold: 0,
    maxLevel: 1,
    maxDanRank: 0,
    totalPlayTime: 0,
    totalGames: 0,
    consecutiveDays: 0,
    lastPlayDate: ''
  }
}

export const achievementSlice = createSlice({
  name: 'achievement',
  initialState,
  reducers: {
    updateSessionStats: (state, action: PayloadAction<Partial<typeof initialState.sessionStats>>) => {
      Object.assign(state.sessionStats, action.payload)
      
      // Check all achievements after stats update
      state.achievements.forEach(achievement => {
        if (!achievement.unlocked) {
          const condition = achievement.condition
          let currentValue = 0
          
          switch (condition.type) {
            case 'score':
              currentValue = state.sessionStats.score
              break
            case 'lines_cleared':
              currentValue = state.sessionStats.linesCleared
              break
            case 'blocks_placed':
              currentValue = state.sessionStats.blocksPlaced
              break
            case 'tetris':
              currentValue = state.sessionStats.tetrisCount
              break
            case 'tspin':
              currentValue = state.sessionStats.tspinCount
              break
            case 'max_combo':
              currentValue = state.sessionStats.maxCombo
              break
            case 'perfect_clear':
              currentValue = state.sessionStats.perfectClearCount
              break
            case 'fever_count':
              currentValue = state.sessionStats.feverCount
              break
            case 'exchange_count':
              currentValue = state.sessionStats.exchangeCount
              break
            case 'hold_count':
              currentValue = state.sessionStats.holdCount
              break
            case 'level':
              currentValue = state.sessionStats.level
              break
            case 'dan_rank':
              currentValue = state.sessionStats.danRank
              break
            case 'games_played':
              currentValue = state.sessionStats.gamesPlayed
              break
            case 'speed_score':
              currentValue = state.sessionStats.playTime > 0 ? (state.sessionStats.score / (state.sessionStats.playTime / 60000)) : 0
              break
            case 'efficient_score':
              currentValue = state.sessionStats.blocksPlaced < 100 ? state.sessionStats.score : 0
              break
            case 'exact_score':
              currentValue = state.sessionStats.score === condition.value ? 1 : 0
              break
            case 'night_play':
              const hour = new Date().getHours()
              currentValue = (hour >= 0 && hour < 6) ? 1 : 0
              break
            case 'palindrome_score':
              const scoreStr = state.sessionStats.score.toString()
              currentValue = scoreStr === scoreStr.split('').reverse().join('') ? 1 : 0
              break
            default:
              currentValue = 0
          }
          
          achievement.progress = Math.min(currentValue, achievement.maxProgress)
          
          // Check if achievement is completed
          if (achievement.progress >= achievement.maxProgress) {
            achievement.unlocked = true
            achievement.unlockedAt = new Date().toISOString()
            state.totalPoints += achievement.pointReward
            state.unlockedCount += 1
            state.recentUnlocks.unshift(achievement)
            state.recentUnlocks = state.recentUnlocks.slice(0, 5)
          }
        }
      })
    },
    updateGlobalStats: (state, action: PayloadAction<Partial<typeof initialState.globalStats>>) => {
      Object.assign(state.globalStats, action.payload)
    },
    startNewGame: (state) => {
      state.sessionStats = {
        score: 0,
        linesCleared: 0,
        blocksPlaced: 0,
        tetrisCount: 0,
        tspinCount: 0,
        maxCombo: 0,
        perfectClearCount: 0,
        feverCount: 0,
        exchangeCount: 0,
        holdCount: 0,
        level: 1,
        danRank: 0,
        playTime: 0,
        gamesPlayed: state.sessionStats.gamesPlayed + 1
      }
    },
    updateProgress: (state, action: PayloadAction<{id: string, progress: number}>) => {
      const achievement = state.achievements.find(a => a.id === action.payload.id)
      if (achievement && !achievement.unlocked) {
        achievement.progress = Math.min(action.payload.progress, achievement.maxProgress)
        
        if (achievement.progress >= achievement.maxProgress) {
          achievement.unlocked = true
          achievement.unlockedAt = new Date().toISOString()
          state.totalPoints += achievement.pointReward
          state.unlockedCount += 1
          state.recentUnlocks.unshift(achievement)
          state.recentUnlocks = state.recentUnlocks.slice(0, 5)
        }
      }
    },
    unlockAchievement: (state, action: PayloadAction<string>) => {
      const achievement = state.achievements.find(a => a.id === action.payload)
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true
        achievement.unlockedAt = new Date().toISOString()
        achievement.progress = achievement.maxProgress
        state.totalPoints += achievement.pointReward
        state.unlockedCount += 1
        state.recentUnlocks.unshift(achievement)
        state.recentUnlocks = state.recentUnlocks.slice(0, 5)
      }
    },
    checkKonamiCode: (state, action: PayloadAction<string[]>) => {
      const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']
      if (JSON.stringify(action.payload) === JSON.stringify(konamiSequence)) {
        const achievement = state.achievements.find(a => a.id === 'konami_code')
        if (achievement && !achievement.unlocked) {
          achievement.unlocked = true
          achievement.unlockedAt = new Date().toISOString()
          achievement.progress = achievement.maxProgress
          state.totalPoints += achievement.pointReward
          state.unlockedCount += 1
          state.recentUnlocks.unshift(achievement)
          state.recentUnlocks = state.recentUnlocks.slice(0, 5)
        }
      }
    },
    clearRecentUnlocks: (state) => {
      state.recentUnlocks = []
    },
    resetAchievements: (state) => {
      state.achievements = state.achievements.map(achievement => ({
        ...achievement,
        unlocked: false,
        progress: 0,
        unlockedAt: undefined
      }))
      state.totalPoints = 0
      state.unlockedCount = 0
      state.recentUnlocks = []
      state.sessionStats = initialState.sessionStats
      state.globalStats = initialState.globalStats
    },
    loadAchievementsFromStorage: (state, action: PayloadAction<{achievements: Achievement[], globalStats: typeof initialState.globalStats}>) => {
      state.achievements = action.payload.achievements
      state.globalStats = action.payload.globalStats
      state.unlockedCount = action.payload.achievements.filter(a => a.unlocked).length
      state.totalPoints = action.payload.achievements.reduce((total, a) => total + (a.unlocked ? a.pointReward : 0), 0)
    }
  }
})

export const {
  updateSessionStats,
  updateGlobalStats,
  startNewGame,
  updateProgress,
  unlockAchievement,
  checkKonamiCode,
  clearRecentUnlocks,
  resetAchievements,
  loadAchievementsFromStorage
} = achievementSlice.actions

export default achievementSlice.reducer