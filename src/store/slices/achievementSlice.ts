import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
    value: number
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

const initialAchievements: Achievement[] = [
  // Basic Achievements
  {
    id: 'first_line',
    name: '初回ライン消去',
    description: '初めてラインを消去しました',
    category: 'basic',
    icon: '🏁',
    pointReward: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'lines_cleared', value: 1 }
  },
  {
    id: 'first_game',
    name: 'はじめての一歩',
    description: '初回ゲームプレイ',
    category: 'basic',
    icon: '🎮',
    pointReward: 5,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'games_played', value: 1 }
  },
  {
    id: 'first_tetris',
    name: '初回テトリス',
    description: '初めて4ライン同時消去を達成しました',
    category: 'basic',
    icon: '🏆',
    pointReward: 30,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'tetris', value: 1 }
  },
  {
    id: 'first_tspin',
    name: 'T-Spinデビュー',
    description: '初めてT-Spinを決めました',
    category: 'basic',
    icon: '🔥',
    pointReward: 40,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'tspin', value: 1 }
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
    maxProgress: 1,
    condition: { type: 'fever_count', value: 1 }
  },
  
  // Score Achievements
  {
    id: 'score_100',
    name: '数字マニア',
    description: '100点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 5,
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    condition: { type: 'score', value: 100 }
  },
  {
    id: 'score_500',
    name: 'スコア初心者',
    description: '500点に到達しました',
    category: 'score',
    icon: '⭐',
    pointReward: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 500,
    condition: { type: 'score', value: 500 }
  },
  {
    id: 'score_1000',
    name: 'スコアハンター',
    description: '1000点に到達しました',
    category: 'score',
    icon: '💫',
    pointReward: 20,
    unlocked: false,
    progress: 0,
    maxProgress: 1000,
    condition: { type: 'score', value: 1000 }
  },
  {
    id: 'score_2000',
    name: 'スコアコレクター',
    description: '2000点に到達しました',
    category: 'score',
    icon: '🎊',
    pointReward: 25,
    unlocked: false,
    progress: 0,
    maxProgress: 2000,
    condition: { type: 'score', value: 2000 }
  },
  {
    id: 'score_5000',
    name: 'スコアウィザード',
    description: '5000点に到達しました',
    category: 'score',
    icon: '🌟',
    pointReward: 40,
    unlocked: false,
    progress: 0,
    maxProgress: 5000,
    condition: { type: 'score', value: 5000 }
  },
  {
    id: 'score_10000',
    name: 'スコアレジェンド',
    description: '10000点に到達しました',
    category: 'score',
    icon: '👑',
    pointReward: 80,
    unlocked: false,
    progress: 0,
    maxProgress: 10000,
    condition: { type: 'score', value: 10000 }
  },
  
  // Technical Achievements
  {
    id: 'combo_master',
    name: 'コンボマスター',
    description: '5コンボ以上を達成しました',
    category: 'technical',
    icon: '⚡',
    pointReward: 25,
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    condition: { type: 'max_combo', value: 5 }
  },
  {
    id: 'perfect_clear',
    name: 'パーフェクトクリア',
    description: '全消し達成',
    category: 'technical',
    icon: '✨',
    pointReward: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'perfect_clear', value: 1 }
  },
  {
    id: 'tspin_master',
    name: 'T-Spinマスター',
    description: 'T-Spinを10回達成',
    category: 'technical',
    icon: '🔄',
    pointReward: 60,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    condition: { type: 'tspin', value: 10 }
  },
  
  // Rank Achievements
  {
    id: 'dan_shodan',
    name: '初段昇格',
    description: '初段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 1 }
  },
  {
    id: 'dan_sandan',
    name: '三段昇格',
    description: '三段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 3 }
  },
  {
    id: 'dan_godan',
    name: '五段昇格',
    description: '五段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 5 }
  },
  {
    id: 'dan_meijin',
    name: '名人昇格',
    description: '名人に昇格しました',
    category: 'rank',
    icon: '👑',
    pointReward: 500,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 11 }
  },
  
  // Challenge Achievements
  {
    id: 'speed_demon',
    name: 'スピードデーモン',
    description: '1分で1000点達成',
    category: 'challenge',
    icon: '⚡',
    pointReward: 80,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'speed_score', value: 1000 }
  },
  {
    id: 'efficiency_expert',
    name: '効率エキスパート',
    description: '100ブロック未満で1000点達成',
    category: 'challenge',
    icon: '🎯',
    pointReward: 120,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'efficient_score', value: 1000 }
  },
  
  // Special Achievements
  {
    id: 'lucky_seven',
    name: 'ラッキーセブン',
    description: 'スコアが777で終了',
    category: 'special',
    icon: '🍀',
    pointReward: 77,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'exact_score', value: 777 }
  },
  {
    id: 'night_owl',
    name: '夜更かし',
    description: '深夜（0-6時）にプレイ',
    category: 'special',
    icon: '🦉',
    pointReward: 30,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'night_play', value: 1 }
  },
  
  // Progress Achievements
  {
    id: 'level_10',
    name: 'レベル10到達',
    description: 'レベル10に到達しました',
    category: 'progress',
    icon: '📈',
    pointReward: 30,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    condition: { type: 'level', value: 10 }
  },
  {
    id: 'level_20',
    name: 'レベル20到達',
    description: 'レベル20に到達しました',
    category: 'progress',
    icon: '📈',
    pointReward: 60,
    unlocked: false,
    progress: 0,
    maxProgress: 20,
    condition: { type: 'level', value: 20 }
  },
  
  // Fun Achievements
  {
    id: 'konami_code',
    name: 'コナミコマンド',
    description: '上上下下左右左右BA',
    category: 'fun',
    icon: '🎮',
    pointReward: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'konami_code', value: 1 },
    hidden: true
  },
  {
    id: 'palindrome_score',
    name: '回文スコア',
    description: '回文スコアで終了（例：1221）',
    category: 'fun',
    icon: '🔄',
    pointReward: 40,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    condition: { type: 'palindrome_score', value: 1 },
    hidden: true
  }
]

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