'use client'

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store/store'
import { clearRecentUnlocks } from '@/store/slices/achievementSlice'
import { Box, Typography, Card, CardContent, Slide, IconButton } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'

interface NotificationProps {
  achievement: {
    id: string
    name: string
    description: string
    icon: string
    pointReward: number
  }
  onClose: () => void
}

const AchievementNotificationCard: React.FC<NotificationProps> = ({ achievement, onClose }) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, 2500) // 4秒から2.5秒に短縮

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <Slide direction="left" in={show} mountOnEnter unmountOnExit>
      <Card 
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          width: 280, // 400から280に縮小
          maxWidth: '90vw',
          zIndex: 1500, // 9999から1500に下げてゲーム要素の邪魔にならないように
          background: 'rgba(0, 255, 136, 0.85)', // グラデーションを削除してシンプルに
          backdropFilter: 'blur(10px)', // ブラー効果を軽減
          border: '1px solid #00ff88', // ボーダーを細く
          boxShadow: '0 4px 16px rgba(0, 255, 136, 0.2)', // シャドウを控えめに
          // グローアニメーション削除
        }}
      >
        <CardContent sx={{ padding: '12px !important' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="body1" sx={{ color: '#000000', fontWeight: 'bold', fontSize: '0.9rem' }}>
              🏆 実績解除
            </Typography>
            <IconButton size="small" onClick={() => setShow(false)} sx={{ color: '#000000', padding: '2px' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" component="span" sx={{ fontSize: '1.2rem' }}>
              {achievement.icon}
            </Typography>
            <Box flex={1}>
              <Typography variant="body1" sx={{ color: '#000000', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {achievement.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ffd700', fontWeight: 'bold', fontSize: '0.75rem' }}>
                +{achievement.pointReward}P
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Slide>
  )
}

const AchievementNotification: React.FC = () => {
  const dispatch = useDispatch()
  const { recentUnlocks } = useSelector((state: RootState) => state.achievement)
  const [currentNotification, setCurrentNotification] = useState<typeof recentUnlocks[0] | null>(null)
  const [notificationQueue, setNotificationQueue] = useState<typeof recentUnlocks>([])

  useEffect(() => {
    if (recentUnlocks.length > 0) {
      setNotificationQueue(prev => [...prev, ...recentUnlocks])
      dispatch(clearRecentUnlocks())
    }
  }, [recentUnlocks, dispatch])

  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      setCurrentNotification(notificationQueue[0])
      setNotificationQueue(prev => prev.slice(1))
    }
  }, [currentNotification, notificationQueue])

  const handleNotificationClose = () => {
    setCurrentNotification(null)
  }

  if (!currentNotification) return null

  return (
    <AchievementNotificationCard 
      achievement={currentNotification} 
      onClose={handleNotificationClose}
    />
  )
}

export default AchievementNotification