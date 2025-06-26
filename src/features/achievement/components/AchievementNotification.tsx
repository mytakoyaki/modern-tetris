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
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <Slide direction="left" in={show} mountOnEnter unmountOnExit>
      <Card 
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          width: 400,
          maxWidth: '90vw',
          zIndex: 9999,
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.9) 0%, rgba(0, 191, 255, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '2px solid #00ff88',
          boxShadow: '0 8px 32px rgba(0, 255, 136, 0.3)',
          animation: 'glow 2s ease-in-out infinite alternate'
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography variant="h6" sx={{ color: '#000000', fontWeight: 'bold' }}>
              🏆 実績解除！
            </Typography>
            <IconButton size="small" onClick={() => setShow(false)} sx={{ color: '#000000' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h4" component="span">
              {achievement.icon}
            </Typography>
            <Box flex={1}>
              <Typography variant="h6" sx={{ color: '#000000', fontWeight: 'bold' }}>
                {achievement.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#333333' }}>
                {achievement.description}
              </Typography>
              <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 'bold', mt: 1 }}>
                +{achievement.pointReward} ポイント獲得！
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
    <>
      <AchievementNotificationCard 
        achievement={currentNotification} 
        onClose={handleNotificationClose}
      />
      <style jsx global>{`
        @keyframes glow {
          from {
            box-shadow: 0 8px 32px rgba(0, 255, 136, 0.3);
          }
          to {
            box-shadow: 0 8px 32px rgba(0, 255, 136, 0.6), 0 0 20px rgba(0, 255, 136, 0.4);
          }
        }
      `}</style>
    </>
  )
}

export default AchievementNotification