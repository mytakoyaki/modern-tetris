import { useState, useCallback } from 'react'
import type { SpinResult } from '@/types/spin'

export type EffectType = 'single' | 'double' | 'triple' | 'tetris' | 'tspin' | 'perfect'

interface EffectState {
  type: EffectType
  lines: number
  score: number
  isVisible: boolean
  id: string
  spinResult?: SpinResult | null
}

export function useEffectSystem() {
  const [currentEffect, setCurrentEffect] = useState<EffectState | null>(null)

  // ライン消去種類を判定
  const determineEffectType = useCallback((
    linesCleared: number, 
    isTSpin: boolean, 
    isPerfectClear: boolean
  ): EffectType => {
    if (isPerfectClear) return 'perfect'
    if (isTSpin) return 'tspin'
    if (linesCleared === 4) return 'tetris'
    if (linesCleared === 3) return 'triple'
    if (linesCleared === 2) return 'double'
    return 'single'
  }, [])

  // 演出をトリガー
  const triggerEffect = useCallback((
    linesCleared: number,
    score: number,
    isTSpin: boolean = false,
    isPerfectClear: boolean = false,
    spinResult?: SpinResult | null
  ) => {
    const effectType = determineEffectType(linesCleared, isTSpin, isPerfectClear)
    const effectId = `${effectType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    setCurrentEffect({
      type: effectType,
      lines: linesCleared,
      score,
      isVisible: true,
      id: effectId,
      spinResult
    })
  }, [determineEffectType])

  // 演出完了
  const completeEffect = useCallback(() => {
    setCurrentEffect(null)
  }, [])

  return {
    currentEffect,
    triggerEffect,
    completeEffect
  }
} 