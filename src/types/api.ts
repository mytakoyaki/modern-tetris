// API request/response types

export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// User API types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface UserProfile {
  id: string
  username: string
  email: string
  createdAt: string
  updatedAt: string
}

// Score API types
export interface ScoreSubmission {
  score: number
  level: number
  lines: number
  rank: string
  gameTime: number
  achievements?: string[]
}

export interface ScoreResponse {
  id: string
  userId: string
  score: number
  level: number
  lines: number
  rank: string
  gameTime: number
  createdAt: string
  isPersonalBest: boolean
  globalRank?: number
}

// Ranking API types
export interface RankingQuery {
  period: 'daily' | 'weekly' | 'monthly' | 'all-time'
  limit?: number
  offset?: number
}

export interface RankingEntry {
  rank: number
  userId: string
  username: string
  score: number
  level: number
  lines: number
  gameTime: number
  createdAt: string
}

// Achievement API types
export interface AchievementProgress {
  achievementId: string
  progress: number
  unlocked: boolean
  unlockedAt?: string
}

export interface AchievementUpdate {
  achievementId: string
  progress: number
}

// Statistics API types
export interface UserStatistics {
  totalGames: number
  totalScore: number
  totalLines: number
  totalTime: number
  averageScore: number
  bestScore: number
  bestRank: string
  achievementsUnlocked: number
  feverModesActivated: number
  tSpinsPerformed: number
}