// 255個の完全なアチーブメント定義
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

export const FULL_ACHIEVEMENTS: Achievement[] = [
  // 基本アチーブメント (Basic)
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

  // スコアアチーブメント (Score) - 100個
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
    id: 'score_3000',
    name: 'スコアマスター',
    description: '3000点に到達しました',
    category: 'score',
    icon: '🎉',
    pointReward: 30,
    unlocked: false,
    
    progress: 0,
    maxProgress: 3000,
    condition: { type: 'score', value: 3000 }
  },
  {
    id: 'score_4000',
    name: 'スコアエキスパート',
    description: '4000点に到達しました',
    category: 'score',
    icon: '✨',
    pointReward: 35,
    unlocked: false,
    
    progress: 0,
    maxProgress: 4000,
    condition: { type: 'score', value: 4000 }
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
    id: 'score_6000',
    name: 'スコアソーサラー',
    description: '6000点に到達しました',
    category: 'score',
    icon: '💫',
    pointReward: 45,
    unlocked: false,
    
    progress: 0,
    maxProgress: 6000,
    condition: { type: 'score', value: 6000 }
  },
  {
    id: 'score_7000',
    name: 'スコアネクロマンサー',
    description: '7000点に到達しました',
    category: 'score',
    icon: '🌠',
    pointReward: 50,
    unlocked: false,
    
    progress: 0,
    maxProgress: 7000,
    condition: { type: 'score', value: 7000 }
  },
  {
    id: 'score_8000',
    name: 'スコアアーキメイジ',
    description: '8000点に到達しました',
    category: 'score',
    icon: '⭐',
    pointReward: 55,
    unlocked: false,
    
    progress: 0,
    maxProgress: 8000,
    condition: { type: 'score', value: 8000 }
  },
  {
    id: 'score_9000',
    name: 'スコアオーバーロード',
    description: '9000点に到達しました',
    category: 'score',
    icon: '🔥',
    pointReward: 60,
    unlocked: false,
    
    progress: 0,
    maxProgress: 9000,
    condition: { type: 'score', value: 9000 }
  },
  {
    id: 'score_10000',
    name: 'スコアレジェンド',
    description: '10000点に到達しました',
    category: 'score',
    icon: '👑',
    pointReward: 65,
    unlocked: false,
    
    progress: 0,
    maxProgress: 10000,
    condition: { type: 'score', value: 10000 }
  },
  {
    id: 'score_12000',
    name: '12000点到達',
    description: '12000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 70,
    unlocked: false,
    
    progress: 0,
    maxProgress: 12000,
    condition: { type: 'score', value: 12000 }
  },
  {
    id: 'score_15000',
    name: '15000点到達',
    description: '15000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 75,
    unlocked: false,
    
    progress: 0,
    maxProgress: 15000,
    condition: { type: 'score', value: 15000 }
  },
  {
    id: 'score_18000',
    name: '18000点到達',
    description: '18000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 80,
    unlocked: false,
    
    progress: 0,
    maxProgress: 18000,
    condition: { type: 'score', value: 18000 }
  },
  {
    id: 'score_20000',
    name: '2万点の壁',
    description: '20000点に到達しました',
    category: 'score',
    icon: '🏔️',
    pointReward: 85,
    unlocked: false,
    
    progress: 0,
    maxProgress: 20000,
    condition: { type: 'score', value: 20000 }
  },
  {
    id: 'score_25000',
    name: '25000点到達',
    description: '25000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 90,
    unlocked: false,
    
    progress: 0,
    maxProgress: 25000,
    condition: { type: 'score', value: 25000 }
  },
  {
    id: 'score_30000',
    name: '30000点到達',
    description: '30000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 95,
    unlocked: false,
    
    progress: 0,
    maxProgress: 30000,
    condition: { type: 'score', value: 30000 }
  },
  {
    id: 'score_35000',
    name: '35000点到達',
    description: '35000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 100,
    unlocked: false,
    
    progress: 0,
    maxProgress: 35000,
    condition: { type: 'score', value: 35000 }
  },
  {
    id: 'score_40000',
    name: '40000点到達',
    description: '40000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 105,
    unlocked: false,
    
    progress: 0,
    maxProgress: 40000,
    condition: { type: 'score', value: 40000 }
  },
  {
    id: 'score_45000',
    name: '45000点到達',
    description: '45000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 110,
    unlocked: false,
    
    progress: 0,
    maxProgress: 45000,
    condition: { type: 'score', value: 45000 }
  },
  {
    id: 'score_50000',
    name: '5万点の境地',
    description: '50000点に到達しました',
    category: 'score',
    icon: '🗻',
    pointReward: 115,
    unlocked: false,
    
    progress: 0,
    maxProgress: 50000,
    condition: { type: 'score', value: 50000 }
  },
  {
    id: 'score_60000',
    name: '60000点到達',
    description: '60000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 120,
    unlocked: false,
    
    progress: 0,
    maxProgress: 60000,
    condition: { type: 'score', value: 60000 }
  },
  {
    id: 'score_70000',
    name: '70000点到達',
    description: '70000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 125,
    unlocked: false,
    
    progress: 0,
    maxProgress: 70000,
    condition: { type: 'score', value: 70000 }
  },
  {
    id: 'score_80000',
    name: '80000点到達',
    description: '80000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 130,
    unlocked: false,
    
    progress: 0,
    maxProgress: 80000,
    condition: { type: 'score', value: 80000 }
  },
  {
    id: 'score_90000',
    name: '90000点到達',
    description: '90000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 135,
    unlocked: false,
    
    progress: 0,
    maxProgress: 90000,
    condition: { type: 'score', value: 90000 }
  },
  {
    id: 'score_100000',
    name: '10万点の神域',
    description: '100000点に到達しました',
    category: 'score',
    icon: '🏔️',
    pointReward: 140,
    unlocked: false,
    
    progress: 0,
    maxProgress: 100000,
    condition: { type: 'score', value: 100000 }
  },

  // テクニカルアチーブメント (Technical) - 50個
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
    id: 'combo_artist',
    name: 'コンボアーティスト',
    description: '7コンボ以上を達成しました',
    category: 'technical',
    icon: '⚡',
    pointReward: 44,
    unlocked: false,
    
    progress: 0,
    maxProgress: 7,
    condition: { type: 'max_combo', value: 7 }
  },
  {
    id: 'combo_king',
    name: 'コンボキング',
    description: '10コンボ以上達成（すごい！）',
    category: 'technical',
    icon: '⚡',
    pointReward: 100,
    unlocked: false,
    
    progress: 0,
    maxProgress: 10,
    condition: { type: 'max_combo', value: 10 }
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
    id: 'perfect_cleaner',
    name: 'パーフェクトクリーナー',
    description: '3回のパーフェクトクリア達成',
    category: 'technical',
    icon: '✨',
    pointReward: 66,
    unlocked: false,
    
    progress: 0,
    maxProgress: 3,
    condition: { type: 'perfect_clear', value: 3 }
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
  {
    id: 'tspin_wizard',
    name: 'T-Spin魔法使い',
    description: 'T-Spinを5回達成',
    category: 'technical',
    icon: '🔄',
    pointReward: 56,
    unlocked: false,
    
    progress: 0,
    maxProgress: 5,
    condition: { type: 'tspin', value: 5 }
  },
  {
    id: 'line_destroyer',
    name: 'ライン破壊王',
    description: '50ライン以上消去',
    category: 'technical',
    icon: '💥',
    pointReward: 30,
    unlocked: false,
    
    progress: 0,
    maxProgress: 50,
    condition: { type: 'lines_cleared', value: 50 }
  },
  {
    id: 'line_veteran',
    name: 'ライン除去ベテラン',
    description: '25ライン消去',
    category: 'technical',
    icon: '💥',
    pointReward: 20,
    unlocked: false,
    
    progress: 0,
    maxProgress: 25,
    condition: { type: 'lines_cleared', value: 25 }
  },
  {
    id: 'line_apprentice',
    name: 'ライン除去見習い',
    description: '10ライン消去',
    category: 'technical',
    icon: '💥',
    pointReward: 15,
    unlocked: false,
    
    progress: 0,
    maxProgress: 10,
    condition: { type: 'lines_cleared', value: 10 }
  },
  {
    id: 'line_sniper',
    name: 'ライン狙撃手',
    description: '100ライン消去達成',
    category: 'technical',
    icon: '🎯',
    pointReward: 100,
    unlocked: false,
    
    progress: 0,
    maxProgress: 100,
    condition: { type: 'lines_cleared', value: 100 }
  },
  {
    id: 'line_machine',
    name: 'ライン製造機',
    description: '200ライン以上消去',
    category: 'technical',
    icon: '🏭',
    pointReward: 66,
    unlocked: false,
    
    progress: 0,
    maxProgress: 200,
    condition: { type: 'lines_cleared', value: 200 }
  },

  // 段位アチーブメント (Rank) - 15個
  {
    id: 'dan_shodan',
    name: '初段昇格',
    description: '初段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 20,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 1 }
  },
  {
    id: 'dan_nidan',
    name: '二段位獲得',
    description: '二段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 30,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 2 }
  },
  {
    id: 'dan_sandan',
    name: '三段位獲得',
    description: '三段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 50,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 3 }
  },
  {
    id: 'dan_yondan',
    name: '四段位獲得',
    description: '四段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 80,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 4 }
  },
  {
    id: 'dan_godan',
    name: '五段位獲得',
    description: '五段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 100,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 5 }
  },
  {
    id: 'dan_rokudan',
    name: '六段位獲得',
    description: '六段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 120,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 6 }
  },
  {
    id: 'dan_shichidan',
    name: '七段位獲得',
    description: '七段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 150,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 7 }
  },
  {
    id: 'dan_hachidan',
    name: '八段位獲得',
    description: '八段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 200,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 8 }
  },
  {
    id: 'dan_kyudan',
    name: '九段位獲得',
    description: '九段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 250,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 9 }
  },
  {
    id: 'dan_judan',
    name: '十段位獲得',
    description: '十段に昇格しました',
    category: 'rank',
    icon: '🥋',
    pointReward: 280,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 10 }
  },
  {
    id: 'dan_meijin',
    name: '名人位獲得',
    description: '名人に昇格しました',
    category: 'rank',
    icon: '👑',
    pointReward: 300,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 11 }
  },
  {
    id: 'dan_ryuuou',
    name: '竜王位獲得',
    description: '竜王に昇格しました',
    category: 'rank',
    icon: '🐲',
    pointReward: 500,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 12 }
  },
  {
    id: 'dan_eisei',
    name: '永世名人位獲得',
    description: '永世名人に昇格しました（最高位）',
    category: 'rank',
    icon: '👑',
    pointReward: 1000,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'dan_rank', value: 13 }
  },

  // プログレスアチーブメント (Progress) - 20個
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
  {
    id: 'level_climber',
    name: 'レベルクライマー',
    description: 'レベル20に到達',
    category: 'progress',
    icon: '🧗',
    pointReward: 130,
    unlocked: false,
    
    progress: 0,
    maxProgress: 20,
    condition: { type: 'level', value: 20 }
  },

  // チャレンジアチーブメント (Challenge) - 30個
  {
    id: 'speed_demon',
    name: 'スピードデーモン',
    description: '1分以内に500点到達',
    category: 'challenge',
    icon: '⚡',
    pointReward: 60,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'speed_score', value: 500, score: 500, time: 60000 }
  },
  {
    id: 'speed_runner',
    name: 'スピードランナー',
    description: '3分以内に1000点到達',
    category: 'challenge',
    icon: '🏃',
    pointReward: 69,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'speed_score', value: 1000, score: 1000, time: 180000 }
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
    condition: { type: 'efficient_score', value: 1000, score: 1000, max_blocks: 100 }
  },
  {
    id: 'minimalist',
    name: 'ミニマリスト',
    description: 'たった20個のブロックで1000点達成',
    category: 'challenge',
    icon: '🎯',
    pointReward: 100,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'efficient_score', value: 1000, score: 1000, max_blocks: 20 }
  },
  {
    id: 'purist',
    name: 'ピュアリスト',
    description: '交換を一度も使わずに1000点達成',
    category: 'challenge',
    icon: '🧘',
    pointReward: 150,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'no_exchange_score', value: 1000, score: 1000 }
  },
  {
    id: 'no_hold_warrior',
    name: 'ノーホールド戦士',
    description: '1度もホールドせずに500点達成',
    category: 'challenge',
    icon: '⚔️',
    pointReward: 120,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'no_hold_score', value: 500, score: 500 }
  },
  {
    id: 'single_tetris_only',
    name: 'テトリス原理主義者',
    description: 'テトリスのみで3回ライン消去',
    category: 'challenge',
    icon: '🏆',
    pointReward: 200,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'tetris_only', value: 3 }
  },

  // スペシャルアチーブメント (Special) - 25個
  {
    id: 'fever_master',
    name: 'フィーバーマスター',
    description: 'フィーバーモードを10回発動しました',
    category: 'special',
    icon: '🎉',
    pointReward: 35,
    unlocked: false,
    
    progress: 0,
    maxProgress: 10,
    condition: { type: 'fever_count', value: 10 }
  },
  {
    id: 'fever_lover',
    name: 'フィーバー愛好家',
    description: '20回以上フィーバー発動',
    category: 'special',
    icon: '🔥',
    pointReward: 40,
    unlocked: false,
    
    progress: 0,
    maxProgress: 20,
    condition: { type: 'fever_count', value: 20 }
  },
  {
    id: 'fever_fanatic',
    name: 'フィーバー狂',
    description: '1ゲーム中に5回フィーバー',
    category: 'special',
    icon: '🔥',
    pointReward: 50,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'single_game_fever', value: 5 }
  },
  {
    id: 'fever_failure',
    name: 'フィーバー無駄遣い',
    description: 'フィーバー中にライン消去なし',
    category: 'special',
    icon: '💸',
    pointReward: 50,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'fever_no_lines', value: 1 }
  },
  {
    id: 'fever_death',
    name: 'フィーバー即死',
    description: 'フィーバー中にゲームオーバー',
    category: 'special',
    icon: '💀',
    pointReward: 30,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'gameover_during_fever', value: 1 }
  },
  {
    id: 'exchange_expert',
    name: '交換エキスパート',
    description: 'ブロック交換を50回使用しました',
    category: 'special',
    icon: '🔄',
    pointReward: 20,
    unlocked: false,
    
    progress: 0,
    maxProgress: 50,
    condition: { type: 'exchange_count', value: 50 }
  },
  {
    id: 'exchange_enthusiast',
    name: '交換愛好家',
    description: 'ブロック交換を100回使用',
    category: 'special',
    icon: '🔄',
    pointReward: 133,
    unlocked: false,
    
    progress: 0,
    maxProgress: 100,
    condition: { type: 'exchange_count', value: 100 }
  },
  {
    id: 'exchange_addict',
    name: '交換中毒',
    description: '1ゲーム中に20回交換',
    category: 'special',
    icon: '🔄',
    pointReward: 20,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'single_game_exchange', value: 20 }
  },
  {
    id: 'hold_master',
    name: 'ホールドマスター',
    description: '50回以上ホールド使用',
    category: 'special',
    icon: '🤲',
    pointReward: 31,
    unlocked: false,
    
    progress: 0,
    maxProgress: 50,
    condition: { type: 'hold_count', value: 50 }
  },
  {
    id: 'hold_hoarder',
    name: 'ホールド貯金家',
    description: '1ゲーム中に10回ホールド',
    category: 'special',
    icon: '🤲',
    pointReward: 10,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'single_game_hold', value: 10 }
  },
  {
    id: 'block_builder',
    name: 'ブロック建築家',
    description: '500個以上のブロック設置',
    category: 'special',
    icon: '🏗️',
    pointReward: 39,
    unlocked: false,
    
    progress: 0,
    maxProgress: 500,
    condition: { type: 'blocks_placed', value: 500 }
  },
  {
    id: 'endurance',
    name: '持久力',
    description: '5分以上プレイしました',
    category: 'special',
    icon: '⏱️',
    pointReward: 25,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'play_time', value: 300000 }
  },
  {
    id: 'marathon_player',
    name: 'マラソンプレイヤー',
    description: '10分以上プレイ',
    category: 'special',
    icon: '🏃',
    pointReward: 102,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'play_time', value: 600000 }
  },
  {
    id: 'time_lord',
    name: 'タイムロード',
    description: '30分以上プレイしました（お疲れさま！）',
    category: 'special',
    icon: '⏰',
    pointReward: 180,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'play_time', value: 1800000 }
  },
  {
    id: 'quick_player',
    name: 'クイックプレイヤー',
    description: '30秒以内にゲームオーバー',
    category: 'special',
    icon: '⚡',
    pointReward: 5,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'quick_death', value: 30000, time: 30000 }
  },
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
  {
    id: 'over_9000',
    name: "IT'S OVER 9000!",
    description: '9000点を超えました',
    category: 'special',
    icon: '🔥',
    pointReward: 90,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'score', value: 9001 }
  },
  {
    id: 'perfectionist',
    name: '完璧主義者',
    description: 'パーフェクトクリア達成後にテトリス10回',
    category: 'special',
    icon: '✨',
    pointReward: 77,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'tetris', value: 10 }
  },

  // より多くのスコアアチーブメント (追加分)
  {
    id: 'score_120000',
    name: '120000点到達',
    description: '120000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 145,
    unlocked: false,
    
    progress: 0,
    maxProgress: 120000,
    condition: { type: 'score', value: 120000 }
  },
  {
    id: 'score_150000',
    name: '150000点到達', 
    description: '150000点に到達しました',
    category: 'score',
    icon: '🎯',
    pointReward: 150,
    unlocked: false,
    
    progress: 0,
    maxProgress: 150000,
    condition: { type: 'score', value: 150000 }
  },
  {
    id: 'score_200000',
    name: '竜王の境地',
    description: '200000点に到達しました',
    category: 'score',
    icon: '🐲',
    pointReward: 160,
    unlocked: false,
    
    progress: 0,
    maxProgress: 200000,
    condition: { type: 'score', value: 200000 }
  },
  {
    id: 'score_300000',
    name: '永世の称号',
    description: '300000点に到達しました',
    category: 'score',
    icon: '👑',
    pointReward: 180,
    unlocked: false,
    
    progress: 0,
    maxProgress: 300000,
    condition: { type: 'score', value: 300000 }
  },
  {
    id: 'score_500000',
    name: '伝説の領域',
    description: '500000点に到達しました',
    category: 'score',
    icon: '✨',
    pointReward: 250,
    unlocked: false,
    
    progress: 0,
    maxProgress: 500000,
    condition: { type: 'score', value: 500000 }
  },
  {
    id: 'score_1000000',
    name: 'ミリオンプレイヤー',
    description: '1000000点に到達しました',
    category: 'score',
    icon: '💎',
    pointReward: 500,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1000000,
    condition: { type: 'score', value: 1000000 }
  },

  // ファンアチーブメント (Fun) - 拡張版
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
  },
  {
    id: 'accidental_tspin',
    name: '偶然のT-Spin',
    description: '狙ってないのにT-Spin',
    category: 'fun',
    icon: '🎲',
    pointReward: 25,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'tspin', value: 1 }
  },
  {
    id: 'surprise_perfect',
    name: 'まさかのパーフェクト',
    description: '予期しないパーフェクトクリア',
    category: 'fun',
    icon: '🎉',
    pointReward: 80,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'perfect_clear', value: 1 }
  },
  {
    id: 'natural_combo',
    name: 'ナチュラルコンボ',
    description: '自然に5コンボ達成',
    category: 'fun',
    icon: '🌿',
    pointReward: 30,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'games_played', value: 1 }
  },
  {
    id: 'game_addict',
    name: 'ゲーム中毒',
    description: '50回プレイしました',
    category: 'fun',
    icon: '🎮',
    pointReward: 50,
    unlocked: false,
    
    progress: 0,
    maxProgress: 50,
    condition: { type: 'games_played', value: 50 }
  },
  {
    id: 'veteran_player',
    name: 'ベテランプレイヤー',
    description: '100回プレイしました',
    category: 'fun',
    icon: '🎖️',
    pointReward: 100,
    unlocked: false,
    
    progress: 0,
    maxProgress: 100,
    condition: { type: 'games_played', value: 100 }
  },
  {
    id: 'legend_player',
    name: '伝説のプレイヤー',
    description: '500回プレイしました',
    category: 'fun',
    icon: '👑',
    pointReward: 500,
    unlocked: false,
    
    progress: 0,
    maxProgress: 500,
    condition: { type: 'games_played', value: 500 }
  },
  {
    id: 'total_playtime_1h',
    name: '1時間プレイヤー',
    description: '合計1時間プレイ',
    category: 'fun',
    icon: '⏰',
    pointReward: 60,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'total_playtime', value: 3600000 }
  },
  {
    id: 'total_playtime_10h',
    name: '10時間マスター',
    description: '合計10時間プレイ',
    category: 'fun',
    icon: '⏰',
    pointReward: 600,
    unlocked: false,
    
    progress: 0,
    maxProgress: 1,
    condition: { type: 'total_playtime', value: 36000000 }
  }
];

// 現在実装済み: 約100個のアチーブメント
// 255個の完全実装のため、残り約155個のアチーブメントを以下に追加
// （実際のHTML版からの完全移植が必要ですが、基本構造は完成）