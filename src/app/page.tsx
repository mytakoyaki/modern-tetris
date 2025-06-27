'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// GitHub Pagesでの動的インポート問題を回避するため、より確実な方法を使用
const TetrisGame = dynamic(
  () => import('@/features/game/components/TetrisGame').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        background: '#1a1a1a', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#00ff88',
        fontSize: '1.5rem',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Loading ClaudeTetris...</div>
        <div style={{ fontSize: '1rem', color: '#888' }}>Please wait while the game initializes</div>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>This may take a moment on first load</div>
      </div>
    )
  }
)

export default function Home() {
  const [isClient, setIsClient] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    
    // デバッグ情報をコンソールに出力
    console.log('Home component mounted')
    console.log('Environment:', process.env.NODE_ENV)
    console.log('User agent:', navigator.userAgent)
    
    // エラーハンドリング
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      setError(event.error?.message || 'Unknown error occurred')
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      setError(event.reason?.message || 'Promise rejection occurred')
    })
  }, [])

  if (error) {
    return (
      <div style={{ 
        background: '#1a1a1a', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#ff4444',
        fontSize: '1.5rem',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <div>Error loading game:</div>
        <div style={{ fontSize: '1rem', color: '#888', textAlign: 'center' }}>{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '0.5rem 1rem', 
            background: '#00ff88', 
            color: '#000', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    )
  }

  if (!isClient) {
    return (
      <div style={{ 
        background: '#1a1a1a', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#00ff88',
        fontSize: '1.5rem'
      }}>
        Initializing...
      </div>
    )
  }

  return <TetrisGame />
}
