/**
 * 段位システム実装
 * ClaudeTetris独自の14段階段位システム
 */

import { Rank, RankProgress, RANKS, RANK_PROMOTION_BONUS, RankIndex } from '../../../types/rank'

/**
 * スコアから現在の段位を取得
 */
export function getCurrentRank(score: number): Rank {
  // スコアが閾値を満たす最高段位を逆順で検索
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].threshold) {
      return RANKS[i]
    }
  }
  
  return RANKS[0] // 無段
}

/**
 * 次の段位を取得
 */
export function getNextRank(currentRankIndex: number): Rank | null {
  if (currentRankIndex >= RANKS.length - 1) {
    return null // 最高段位の場合
  }
  
  return RANKS[currentRankIndex + 1]
}

/**
 * 段位進捗情報を計算
 */
export function calculateRankProgress(score: number): RankProgress {
  const currentRank = getCurrentRank(score)
  const nextRank = getNextRank(currentRank.index)
  
  let progressToNext = 0
  
  if (nextRank) {
    const currentThreshold = currentRank.threshold
    const nextThreshold = nextRank.threshold
    const scoreAboveCurrent = score - currentThreshold
    const scoreDifference = nextThreshold - currentThreshold
    
    progressToNext = Math.min(100, (scoreAboveCurrent / scoreDifference) * 100)
  } else {
    progressToNext = 100 // 最高段位の場合
  }
  
  return {
    currentRank,
    nextRank,
    progressToNext,
    isPromoted: false
  }
}

/**
 * 昇格チェック
 */
export function checkPromotion(oldScore: number, newScore: number): {
  wasPromoted: boolean
  oldRank: Rank
  newRank: Rank
  rankUp: number
} {
  const oldRank = getCurrentRank(oldScore)
  const newRank = getCurrentRank(newScore)
  
  const wasPromoted = newRank.index > oldRank.index
  const rankUp = newRank.index - oldRank.index
  
  return {
    wasPromoted,
    oldRank,
    newRank,
    rankUp
  }
}

/**
 * 段位表示用フォーマット
 */
export function formatRankDisplay(rank: Rank, includeEnglish: boolean = false): string {
  if (includeEnglish) {
    return `${rank.name} (${rank.nameEn})`
  }
  return rank.name
}

/**
 * 段位進捗表示用フォーマット
 */
export function formatRankProgress(progress: RankProgress): string {
  if (!progress.nextRank) {
    return '最高段位達成'
  }
  
  const remaining = progress.nextRank.threshold - progress.currentRank.threshold
  const needed = Math.ceil(remaining * (100 - progress.progressToNext) / 100)
  
  return `次段位まで ${needed.toLocaleString()} 点`
}

/**
 * 段位色取得
 */
export function getRankColor(rank: Rank): string {
  return rank.color
}

/**
 * 段位に基づく称号取得
 */
export function getRankTitle(rank: Rank): string {
  const titles = {
    0: 'ルーキー',
    1: '初心者',
    2: 'アマチュア',
    3: '熟練者',
    4: 'エキスパート',
    5: 'プロフェッショナル',
    6: 'マスター',
    7: 'グランドマスター',
    8: 'レジェンド',
    9: 'エリート',
    10: 'チャンピオン',
    11: '名人',
    12: '竜王',
    13: '永世名人'
  } as const
  
  return titles[rank.index as RankIndex] || 'プレイヤー'
}

/**
 * 段位ボーナス計算
 */
export function calculateRankBonus(promotionCount: number): {
  scoreBonus: number
  pointBonus: number
  totalBonus: number
} {
  const scoreBonus = RANK_PROMOTION_BONUS.SCORE_BONUS * promotionCount
  const pointBonus = RANK_PROMOTION_BONUS.POINT_BONUS * promotionCount
  const totalBonus = scoreBonus
  
  return {
    scoreBonus,
    pointBonus,
    totalBonus
  }
}

/**
 * 段位統計情報
 */
export function getRankStatistics(rank: Rank): {
  percentage: number
  estimatedPlayersBelow: string
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert' | 'Master' | 'Legendary'
} {
  const percentage = (rank.index / (RANKS.length - 1)) * 100
  
  const estimatedPlayersBelow = 
    rank.index <= 3 ? '多数' :
    rank.index <= 6 ? '約70%' :
    rank.index <= 9 ? '約90%' :
    rank.index <= 11 ? '約95%' :
    rank.index <= 12 ? '約98%' : '約99%'
  
  const difficulty = 
    rank.index <= 2 ? 'Easy' :
    rank.index <= 4 ? 'Normal' :
    rank.index <= 7 ? 'Hard' :
    rank.index <= 10 ? 'Expert' :
    rank.index <= 12 ? 'Master' : 'Legendary'
  
  return {
    percentage,
    estimatedPlayersBelow,
    difficulty
  }
}

/**
 * 最適な目標段位提案
 */
export function getSuggestedTargetRank(currentRank: Rank): Rank | null {
  // 現在の段位から1-2段階上を推奨
  const targetIndex = Math.min(currentRank.index + 2, RANKS.length - 1)
  
  if (targetIndex === currentRank.index) {
    return null // 既に最高段位
  }
  
  return RANKS[targetIndex]
}