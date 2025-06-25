import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './slices/gameSlice'
import userReducer from './slices/userSlice'
import scoreReducer from './slices/scoreSlice'
import achievementReducer from './slices/achievementSlice'

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

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch