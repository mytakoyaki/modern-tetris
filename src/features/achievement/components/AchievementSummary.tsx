'use client'

import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { Box, Typography, LinearProgress, Card, CardContent } from '@mui/material'

const AchievementSummary: React.FC = () => {
  const { achievements, totalPoints, unlockedCount } = useSelector((state: RootState) => state.achievement)
  
  const achievementsByCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = { total: 0, unlocked: 0 }
    }
    acc[achievement.category].total += 1
    if (achievement.unlocked) {
      acc[achievement.category].unlocked += 1
    }
    return acc
  }, {} as Record<string, { total: number, unlocked: number }>)

  const categoryNames = {
    basic: '基本',
    score: 'スコア', 
    technical: 'テクニカル',
    challenge: 'チャレンジ',
    special: '特殊',
    rank: '段位',
    progress: '進歩',
    fun: '楽しい'
  }

  return (
    <Card sx={{ 
      background: 'rgba(45, 45, 45, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid #404040'
    }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#00ff88' }}>
          実績サマリー
        </Typography>
        
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">総合進捗</Typography>
            <Typography variant="body2" sx={{ color: '#00ff88' }}>
              {unlockedCount}/{achievements.length}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={(unlockedCount / achievements.length) * 100}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#00ff88',
                borderRadius: 3
              }
            }}
          />
        </Box>

        <Box mb={2}>
          <Typography variant="body2" sx={{ color: '#ffd700' }}>
            獲得ポイント: {totalPoints}P
          </Typography>
          <Typography variant="body2">
            達成率: {((unlockedCount / achievements.length) * 100).toFixed(1)}%
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" gutterBottom sx={{ color: '#cccccc' }}>
            カテゴリ別進捗
          </Typography>
          {Object.entries(achievementsByCategory).map(([category, stats]) => (
            <Box key={category} display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption">
                {categoryNames[category as keyof typeof categoryNames] || category}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: stats.unlocked === stats.total ? '#00ff88' : '#cccccc' 
              }}>
                {stats.unlocked}/{stats.total}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default AchievementSummary