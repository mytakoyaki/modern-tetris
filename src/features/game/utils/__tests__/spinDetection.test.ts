import { 
  detectSpin, 
  isBackToBackEligible, 
  formatSpinResult 
} from '../spinDetection'
import { Tetromino } from '../tetromino'
import type { SpinDetectionContext } from '@/types/spin'

describe('Spin Detection System', () => {
  const emptyField = Array(20).fill(null).map(() => Array(10).fill(0))

  describe('detectSpin', () => {
    it('should not detect spin without rotation action', () => {
      const tetromino = new Tetromino('T', 4, 0)
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'move',
        field: emptyField,
        wasWallKick: false
      }
      
      const result = detectSpin(context, 1)
      expect(result.type).toBe(null)
    })

    it('should not detect spin without line clears', () => {
      const tetromino = new Tetromino('T', 4, 0)
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: emptyField,
        wasWallKick: false
      }
      
      const result = detectSpin(context, 0)
      expect(result.type).toBe(null)
    })

    it('should detect T-Spin with proper corner conditions', () => {
      // T-Spin状況をシミュレート（簡易版）
      const fieldWithTSpinSetup = Array(20).fill(null).map(() => Array(10).fill(0))
      // T-Spinの角を埋める
      fieldWithTSpinSetup[18][3] = 1 // 左上
      fieldWithTSpinSetup[18][5] = 1 // 右上  
      fieldWithTSpinSetup[19][3] = 1 // 左下
      fieldWithTSpinSetup[19][5] = 1 // 右下
      
      const tetromino = new Tetromino('T', 3, 18) // T-Spinポジション
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: fieldWithTSpinSetup,
        wasWallKick: false
      }
      
      const result = detectSpin(context, 1)
      expect(result.type).toBe('T-Spin')
      expect(result.variant).toBe('Single')
      expect(result.bonus).toBe(2000)
    })
  })

  describe('isBackToBackEligible', () => {
    it('should return true for T-Spin', () => {
      const spinResult = {
        type: 'T-Spin' as const,
        variant: 'Single' as const,
        bonus: 2000,
        lines: 1
      }
      expect(isBackToBackEligible(spinResult)).toBe(true)
    })

    it('should return true for 4-line clear', () => {
      const spinResult = {
        type: null,
        variant: null,
        bonus: 0,
        lines: 4
      }
      expect(isBackToBackEligible(spinResult)).toBe(true)
    })

    it('should return false for regular line clears', () => {
      const spinResult = {
        type: null,
        variant: null,
        bonus: 0,
        lines: 2
      }
      expect(isBackToBackEligible(spinResult)).toBe(false)
    })
  })

  describe('formatSpinResult', () => {
    it('should format T-Spin correctly', () => {
      const spinResult = {
        type: 'T-Spin' as const,
        variant: 'Double' as const,
        bonus: 5000,
        lines: 2
      }
      expect(formatSpinResult(spinResult)).toBe('T-Spin Double')
    })

    it('should format T-Spin Mini correctly', () => {
      const spinResult = {
        type: 'T-Spin' as const,
        variant: 'Mini' as const,
        bonus: 1000,
        lines: 1
      }
      expect(formatSpinResult(spinResult)).toBe('T-Spin Mini Single')
    })

    it('should return null for no spin', () => {
      const spinResult = {
        type: null,
        variant: null,
        bonus: 0,
        lines: 2
      }
      expect(formatSpinResult(spinResult)).toBe(null)
    })
  })
})