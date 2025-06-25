'use client'

import React, { useEffect, useState } from 'react'
import { Box, Typography, Fade } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { formatSpinResult } from '../utils/spinDetection'

export default function SpinDisplay() {
  const { lastSpin, backToBackCount } = useSelector((state: RootState) => state.game)
  const [showSpin, setShowSpin] = useState(false)
  const [displayText, setDisplayText] = useState('')

  useEffect(() => {
    if (lastSpin?.type) {
      const spinText = formatSpinResult(lastSpin)
      const backToBackText = backToBackCount > 1 ? ' B2B' : ''
      setDisplayText(`${spinText}${backToBackText}`)
      setShowSpin(true)
      
      // 3秒後に非表示
      const timer = setTimeout(() => setShowSpin(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [lastSpin, backToBackCount])

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        pointerEvents: 'none'
      }}
    >
      <Fade in={showSpin} timeout={500}>
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 2,
            px: 3,
            py: 1,
            border: '2px solid #00ff88'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#00ff88',
              fontWeight: 'bold',
              textAlign: 'center',
              textShadow: '0 0 10px #00ff88',
              animation: showSpin ? 'pulse 1s ease-in-out' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' }
              }
            }}
          >
            {displayText}
          </Typography>
          {lastSpin?.bonus && (
            <Typography
              variant="h6"
              sx={{
                color: '#ffd700',
                textAlign: 'center',
                mt: 1
              }}
            >
              +{lastSpin.bonus.toLocaleString()} pts
            </Typography>
          )}
        </Box>
      </Fade>
    </Box>
  )
}