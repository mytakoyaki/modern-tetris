'use client'

import dynamic from 'next/dynamic'

const TetrisGame = dynamic(
  () => import('@/features/game/components/TetrisGame'),
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
        fontSize: '1.5rem'
      }}>
        Loading ClaudeTetris...
      </div>
    )
  }
)

export default function Home() {
  return <TetrisGame />
}
