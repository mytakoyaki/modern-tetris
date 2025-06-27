export type EffectType = 'single' | 'double' | 'triple' | 'tetris' | 'tspin' | 'perfect'

export interface EffectConfig {
  duration: number
  intensity: 'subtle' | 'moderate' | 'spectacular' | 'legendary' | 'mythical'
  elements: string[]
  colors: string[]
  shake: number
  scale: number
}

export interface EffectState {
  type: EffectType
  lines: number
  score: number
  isVisible: boolean
}

export interface LineClearEffectProps {
  type: EffectType
  lines: number
  score: number
  isVisible: boolean
  onComplete: () => void
} 