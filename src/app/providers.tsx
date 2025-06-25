'use client'

import { Provider } from 'react-redux'
import { store } from '@/store/store'
import ThemeRegistry from './theme-registry'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeRegistry>
        {children}
      </ThemeRegistry>
    </Provider>
  )
}