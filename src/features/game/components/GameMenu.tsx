'use client'

import React, { useState } from 'react'
import { IconButton, Menu, MenuItem, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { Menu as MenuIcon, EmojiEvents, Settings, Home } from '@mui/icons-material'

export default function GameMenu() {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleAchievements = () => {
    router.push('/achievements')
    handleClose()
  }

  const handleHome = () => {
    router.push('/')
    handleClose()
  }

  const handleSettings = () => {
    // 将来的に設定ページを実装
    console.log('Settings not implemented yet')
    handleClose()
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 1100,
          backgroundColor: 'rgba(26, 26, 26, 0.9)',
          color: '#00ff88',
          border: '1px solid #00ff88',
          '&:hover': {
            backgroundColor: 'rgba(0, 255, 136, 0.1)',
            borderColor: '#00ff88'
          }
        }}
      >
        <MenuIcon />
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(26, 26, 26, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #00ff88',
            borderRadius: 2,
            minWidth: 200
          }
        }}
      >
        <MenuItem onClick={handleAchievements} sx={{ color: '#ffffff', py: 1.5 }}>
          <EmojiEvents sx={{ mr: 2, color: '#ffd700' }} />
          <Typography>実績確認</Typography>
        </MenuItem>
        
        <MenuItem onClick={handleSettings} sx={{ color: '#ffffff', py: 1.5 }}>
          <Settings sx={{ mr: 2, color: '#666666' }} />
          <Typography>設定</Typography>
        </MenuItem>
        
        <MenuItem onClick={handleHome} sx={{ color: '#ffffff', py: 1.5 }}>
          <Home sx={{ mr: 2, color: '#00ff88' }} />
          <Typography>ホーム</Typography>
        </MenuItem>
      </Menu>
    </>
  )
}