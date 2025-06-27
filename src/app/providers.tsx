'use client'

import { Provider } from 'react-redux'
import { store } from '@/store/store'
import ThemeRegistry from './theme-registry'
import NoSSR from '@/components/no-ssr'
import { useEffect, useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      console.log('Providers: Initializing...')
      
      // Reduxストアの状態を確認
      const initialState = store.getState()
      console.log('Redux store initial state:', initialState)
      
      // 少し遅延を入れて初期化を確実にする
      const timer = setTimeout(() => {
        setIsReady(true)
        console.log('Providers: Ready')
      }, 100)

      return () => clearTimeout(timer)
    } catch (err) {
      console.error('Providers initialization error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
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
        <div>Initialization Error:</div>
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

  if (!isReady) {
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
        Initializing Redux Store...
      </div>
    )
  }

  return (
    <Provider store={store}>
      <NoSSR fallback={
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
      }>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </NoSSR>
    </Provider>
  )
}