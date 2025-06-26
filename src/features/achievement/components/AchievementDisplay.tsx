'use client'

import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { Achievement } from '@/store/slices/achievementSlice'
import { Box, Typography, LinearProgress, Chip, Card, CardContent, Grid, Tabs, Tab } from '@mui/material'

interface AchievementCardProps {
  achievement: Achievement
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const isLocked = !achievement.unlocked
  const progressPercent = (achievement.progress / achievement.maxProgress) * 100

  return (
    <Card 
      sx={{ 
        opacity: isLocked ? 0.6 : 1,
        background: achievement.unlocked 
          ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 191, 255, 0.1) 100%)'
          : 'rgba(45, 45, 45, 0.8)',
        border: achievement.unlocked ? '1px solid #00ff88' : '1px solid #404040',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Typography variant="h4" component="span">
            {achievement.hidden && !achievement.unlocked ? '❓' : achievement.icon}
          </Typography>
          <Box flex={1}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: achievement.unlocked ? '#00ff88' : '#ffffff',
                filter: achievement.hidden && !achievement.unlocked ? 'blur(4px)' : 'none'
              }}
            >
              {achievement.hidden && !achievement.unlocked ? '????' : achievement.name}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                filter: achievement.hidden && !achievement.unlocked ? 'blur(4px)' : 'none'
              }}
            >
              {achievement.hidden && !achievement.unlocked ? '隠されたアチーブメント' : achievement.description}
            </Typography>
          </Box>
          <Chip 
            label={`${achievement.pointReward}P`}
            size="small"
            sx={{ 
              backgroundColor: achievement.unlocked ? '#ffd700' : '#666666',
              color: achievement.unlocked ? '#000000' : '#ffffff'
            }}
          />
        </Box>
        
        {!achievement.unlocked && achievement.maxProgress > 1 && (
          <Box mt={1}>
            <LinearProgress 
              variant="determinate" 
              value={progressPercent}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#00ff88'
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" mt={0.5}>
              {achievement.progress} / {achievement.maxProgress}
            </Typography>
          </Box>
        )}
        
        {achievement.unlocked && achievement.unlockedAt && (
          <Typography variant="caption" color="text.secondary" mt={1}>
            解除日時: {new Date(achievement.unlockedAt).toLocaleString('ja-JP')}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

const AchievementDisplay: React.FC = () => {
  const { achievements, totalPoints, unlockedCount } = useSelector((state: RootState) => state.achievement)
  const [selectedCategory, setSelectedCategory] = React.useState('all')

  const categories = [
    { id: 'all', name: 'すべて' },
    { id: 'basic', name: '基本' },
    { id: 'score', name: 'スコア' },
    { id: 'technical', name: 'テクニカル' },
    { id: 'challenge', name: 'チャレンジ' },
    { id: 'special', name: '特殊' },
    { id: 'rank', name: '段位' },
    { id: 'progress', name: '進歩' },
    { id: 'fun', name: '楽しい' }
  ]

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue)
  }

  return (
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h4" gutterBottom sx={{ color: '#00ff88' }}>
          実績システム
        </Typography>
        <Box display="flex" gap={3} mb={2}>
          <Typography variant="h6">
            解除済み: {unlockedCount} / {achievements.length}
          </Typography>
          <Typography variant="h6" sx={{ color: '#ffd700' }}>
            獲得ポイント: {totalPoints}P
          </Typography>
          <Typography variant="h6">
            達成率: {((unlockedCount / achievements.length) * 100).toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={(unlockedCount / achievements.length) * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#00ff88',
              borderRadius: 4
            }
          }}
        />
      </Box>

      <Tabs 
        value={selectedCategory} 
        onChange={handleCategoryChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        {categories.map(category => (
          <Tab 
            key={category.id} 
            label={category.name} 
            value={category.id}
            sx={{ color: '#ffffff' }}
          />
        ))}
      </Tabs>

      <Grid container spacing={2}>
        {filteredAchievements.map(achievement => (
          <Grid item xs={12} sm={6} md={4} key={achievement.id}>
            <AchievementCard achievement={achievement} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default AchievementDisplay