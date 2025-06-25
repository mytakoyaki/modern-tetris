import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UserState {
  id: string | null
  isAuthenticated: boolean
  username: string | null
  email: string | null
  preferences: {
    keyBindings: {
      moveLeft: string
      moveRight: string
      softDrop: string
      hardDrop: string
      rotate: string
      hold1: string
      hold2: string
      exchange: string
      deleteLine: string
    }
    volume: {
      master: number
      bgm: number
      sfx: number
    }
    theme: 'default' | 'dark' | 'neon'
  }
}

const initialState: UserState = {
  id: null,
  isAuthenticated: false,
  username: null,
  email: null,
  preferences: {
    keyBindings: {
      moveLeft: 'ArrowLeft',
      moveRight: 'ArrowRight',
      softDrop: 'ArrowDown',
      hardDrop: 'Space',
      rotate: 'ArrowUp',
      hold1: 'KeyC',
      hold2: 'KeyV',
      exchange: 'KeyE',
      deleteLine: 'KeyL'
    },
    volume: {
      master: 0.8,
      bgm: 0.6,
      sfx: 0.8
    },
    theme: 'default'
  }
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action: PayloadAction<{id: string, username: string, email: string}>) => {
      state.id = action.payload.id
      state.username = action.payload.username
      state.email = action.payload.email
      state.isAuthenticated = true
    },
    logoutUser: (state) => {
      state.id = null
      state.username = null
      state.email = null
      state.isAuthenticated = false
    },
    updateKeyBinding: (state, action: PayloadAction<{key: keyof UserState['preferences']['keyBindings'], value: string}>) => {
      state.preferences.keyBindings[action.payload.key] = action.payload.value
    },
    updateVolume: (state, action: PayloadAction<{type: keyof UserState['preferences']['volume'], value: number}>) => {
      state.preferences.volume[action.payload.type] = action.payload.value
    },
    updateTheme: (state, action: PayloadAction<UserState['preferences']['theme']>) => {
      state.preferences.theme = action.payload
    }
  }
})

export const {
  loginUser,
  logoutUser,
  updateKeyBinding,
  updateVolume,
  updateTheme
} = userSlice.actions

export default userSlice.reducer