import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './slices/gameSlice'
import userReducer from './slices/userSlice'
import scoreReducer from './slices/scoreSlice'
import achievementReducer from './slices/achievementSlice'

// 演出コールバックの型定義
export type LineClearCallback = (
  linesCleared: number, 
  score: number, 
  isTSpin: boolean, 
  isPerfectClear: boolean
) => void

// ストア拡張用の型
export interface StoreWithEffects {
  lineClearCallback: LineClearCallback | null
}

export const store = configureStore({
  reducer: {
    game: gameReducer,
    user: userReducer,
    score: scoreReducer,
    achievement: achievementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

// 演出コールバックを設定する関数
export const setLineClearCallback = (callback: LineClearCallback) => {
  ;(store as any).lineClearCallback = callback
}

// 演出コールバックを取得する関数
export const getLineClearCallback = (): LineClearCallback | null => {
  return (store as any).lineClearCallback
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch