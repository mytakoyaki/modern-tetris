'use client'

import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'

export const useAchievementPersistence = () => {
  const { achievements, globalStats } = useSelector((state: RootState) => state.achievement)

  // アチーブメント状態をlocalStorageに保存（デバウンス付き）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('tetris-achievements', JSON.stringify(achievements))
      } catch (error) {
        console.warn('Failed to save achievements to localStorage:', error)
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [achievements])

  // グローバル統計をlocalStorageに保存（デバウンス付き）
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('tetris-global-stats', JSON.stringify(globalStats))
      } catch (error) {
        console.warn('Failed to save global stats to localStorage:', error)
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [globalStats])

  return {
    saveAchievements: () => {
      try {
        localStorage.setItem('tetris-achievements', JSON.stringify(achievements))
        localStorage.setItem('tetris-global-stats', JSON.stringify(globalStats))
        return true
      } catch (error) {
        console.warn('Failed to save achievements manually:', error)
        return false
      }
    },
    clearAchievements: () => {
      try {
        localStorage.removeItem('tetris-achievements')
        localStorage.removeItem('tetris-global-stats')
        return true
      } catch (error) {
        console.warn('Failed to clear achievements:', error)
        return false
      }
    }
  }
}