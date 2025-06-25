'use client'

import React from 'react'
import { Box, IconButton, Tooltip } from '@mui/material'
import { RotateRight as RotateRightIcon } from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'
import { toggleLayoutOrientation } from '@/store/slices/gameSlice'
import GameField from './GameField'
import Sidebar from './Sidebar'
import GameControls from './GameControls'

export default function GameContainer() {
  const dispatch = useDispatch()
  const { layoutOrientation } = useSelector((state: RootState) => state.game)

  const handleToggleLayout = () => {
    dispatch(toggleLayoutOrientation())
  }

  const renderHorizontalLayout = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 3,
        maxWidth: 1200,
        margin: '0 auto',
        padding: 2
      }}
    >
      <Sidebar position="left" />
      <GameField />
      <Sidebar position="right" />
    </Box>
  )

  const renderVerticalLayout = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        margin: '0 auto',
        padding: 2
      }}
    >
      <GameField width={320} height={480} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          width: '100%',
          mt: 2
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Sidebar position="left" />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Sidebar position="right" />
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <GameControls />
        </Box>
      </Box>
    </Box>
  )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        position: 'relative'
      }}
    >
      {/* Layout Toggle Button */}
      <Tooltip title="Toggle Layout">
        <IconButton
          onClick={handleToggleLayout}
          sx={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            border: '1px solid #00ff88',
            color: '#00ff88',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 136, 0.2)',
              transform: 'rotate(90deg)',
              transition: 'transform 0.3s ease'
            }
          }}
        >
          <RotateRightIcon />
        </IconButton>
      </Tooltip>

      {/* Game Layout */}
      {layoutOrientation === 'horizontal' ? renderHorizontalLayout() : renderVerticalLayout()}

      {/* Background Pattern */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.03,
          backgroundImage: `
            linear-gradient(90deg, #00ff88 1px, transparent 1px),
            linear-gradient(180deg, #00ff88 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
    </Box>
  )
}