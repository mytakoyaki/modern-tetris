/**
 * 段位システム型定義
 * ClaudeTetris独自の14段階段位システム
 */

export interface Rank {
  index: number
  name: string
  threshold: number
  nameEn: string
  description: string
  color: string
}

export interface RankProgress {
  currentRank: Rank
  nextRank: Rank | null
  progressToNext: number // 0-100の進捗率
  isPromoted: boolean
}

// ClaudeTetris段位システム（14段階）
export const RANKS: Rank[] = [
  {
    index: 0,
    name: '無段',
    nameEn: 'Unranked',
    threshold: 0,
    description: 'テトリスの基礎を学ぶ段階',
    color: '#666666'
  },
  {
    index: 1,
    name: '初段',
    nameEn: '1st Dan',
    threshold: 200,
    description: '基本操作をマスターした初心者',
    color: '#8B4513'
  },
  {
    index: 2,
    name: '二段',
    nameEn: '2nd Dan',
    threshold: 800,
    description: 'ライン消去の技術を習得',
    color: '#A0522D'
  },
  {
    index: 3,
    name: '三段',
    nameEn: '3rd Dan',
    threshold: 2000,
    description: 'T-Spinの基礎を理解',
    color: '#CD853F'
  },
  {
    index: 4,
    name: '四段',
    nameEn: '4th Dan',
    threshold: 4000,
    description: '多様なスピン技を習得',
    color: '#DEB887'
  },
  {
    index: 5,
    name: '五段',
    nameEn: '5th Dan',
    threshold: 8000,
    description: 'コンボシステムをマスター',
    color: '#F5DEB3'
  },
  {
    index: 6,
    name: '六段',
    nameEn: '6th Dan',
    threshold: 15000,
    description: '高速プレイが可能',
    color: '#C0C0C0'
  },
  {
    index: 7,
    name: '七段',
    nameEn: '7th Dan',
    threshold: 25000,
    description: '上級テクニックを習得',
    color: '#D3D3D3'
  },
  {
    index: 8,
    name: '八段',
    nameEn: '8th Dan',
    threshold: 40000,
    description: '極めて高い技術力',
    color: '#E6E6FA'
  },
  {
    index: 9,
    name: '九段',
    nameEn: '9th Dan',
    threshold: 60000,
    description: '達人レベルの実力',
    color: '#FFD700'
  },
  {
    index: 10,
    name: '十段',
    nameEn: '10th Dan',
    threshold: 90000,
    description: '最高峰の技術を持つ',
    color: '#FFA500'
  },
  {
    index: 11,
    name: '名人',
    nameEn: 'Meijin',
    threshold: 130000,
    description: '伝説的なプレイヤー',
    color: '#FF4500'
  },
  {
    index: 12,
    name: '竜王',
    nameEn: 'Dragon King',
    threshold: 200000,
    description: '圧倒的な実力の持ち主',
    color: '#DC143C'
  },
  {
    index: 13,
    name: '永世名人',
    nameEn: 'Eternal Meijin',
    threshold: 300000,
    description: 'ClaudeTetrisの頂点に立つ者',
    color: '#8A2BE2'
  }
]

// 段位昇格ボーナス設定
export const RANK_PROMOTION_BONUS = {
  SCORE_BONUS: 1000, // 昇格時のスコアボーナス
  POINT_BONUS: 50,   // 昇格時のポイントボーナス
} as const

export type RankIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13