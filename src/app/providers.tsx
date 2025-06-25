'use client'

import { Provider } from 'react-redux'
import { store } from '@/store/store'
import ThemeRegistry from './theme-registry'
import NoSSR from '@/components/no-ssr'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <NoSSR fallback={<div style={{ background: '#1a1a1a', minHeight: '100vh' }}>Loading...</div>}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </NoSSR>
    </Provider>
  )
}