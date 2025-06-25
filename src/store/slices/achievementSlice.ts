import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Achievement {
  id: string
  name: string
  description: string
  category: 'basic' | 'score' | 'technical' | 'challenge' | 'special'
  icon: string
  pointReward: number
  unlocked: boolean
  unlockedAt?: string
  progress: number
  maxProgress: number
}

export interface AchievementState {
  achievements: Achievement[]
  totalPoints: number
  unlockedCount: number
  recentUnlocks: Achievement[]
}

const initialAchievements: Achievement[] = [
  {
    id: 'first_game',
    name: 'はじめての一歩',
    description: '初回ゲームプレイ',
    category: 'basic',
    icon: '🎮',
    pointReward: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'score_1000',
    name: '千点突破',
    description: '1,000点達成',
    category: 'score',
    icon: '🏆',
    pointReward: 20,
    unlocked: false,
    progress: 0,
    maxProgress: 1000
  },
  {
    id: 'tspin_first',
    name: 'T-Spin マスター',
    description: '初回T-Spin成功',
    category: 'technical',
    icon: '🔄',
    pointReward: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'fever_mode',
    name: 'フィーバー初体験',
    description: 'フィーバーモード初回発動',
    category: 'basic',
    icon: '🔥',
    pointReward: 30,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'perfect_clear',
    name: 'パーフェクトクリア',
    description: '全消し達成',
    category: 'special',
    icon: '✨',
    pointReward: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  }
]

const initialState: AchievementState = {
  achievements: initialAchievements,
  totalPoints: 0,
  unlockedCount: 0,
  recentUnlocks: []
}

export const achievementSlice = createSlice({
  name: 'achievement',
  initialState,
  reducers: {
    updateProgress: (state, action: PayloadAction<{id: string, progress: number}>) => {
      const achievement = state.achievements.find(a => a.id === action.payload.id)
      if (achievement && !achievement.unlocked) {
        achievement.progress = Math.min(action.payload.progress, achievement.maxProgress)
        
        // Check if achievement is completed
        if (achievement.progress >= achievement.maxProgress) {
          achievement.unlocked = true
          achievement.unlockedAt = new Date().toISOString()
          state.totalPoints += achievement.pointReward
          state.unlockedCount += 1
          state.recentUnlocks.unshift(achievement)
          state.recentUnlocks = state.recentUnlocks.slice(0, 5) // Keep last 5 unlocks
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
    }
  }
})

export const {
  updateProgress,
  unlockAchievement,
  clearRecentUnlocks,
  resetAchievements
} = achievementSlice.actions

export default achievementSlice.reducer