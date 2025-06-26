'use client'

import React from 'react'
import { Container, Button, Box } from '@mui/material'
import { useRouter } from 'next/navigation'
import { ArrowBack } from '@mui/icons-material'
import { AchievementDisplay } from '@/features/achievement'

export default function AchievementsPage() {
  const router = useRouter()

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#1a1a1a',
      color: '#ffffff'
    }}>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Box mb={2}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{ 
              color: '#00ff88',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 136, 0.1)'
              }
            }}
          >
            戻る
          </Button>
        </Box>
        
        <AchievementDisplay />
      </Container>
    </Box>
  )
}