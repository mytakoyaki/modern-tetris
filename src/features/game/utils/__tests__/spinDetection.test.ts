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
        wasWallKick: true
      }
      
      const result = detectSpin(context, 0)
      expect(result.type).toBe(null)
    })

    it('should not detect T-Spin without wall kick', () => {
      const tetromino = new Tetromino('T', 4, 0)
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: emptyField,
        wasWallKick: false
      }
      
      const result = detectSpin(context, 1)
      expect(result.type).toBe(null)
    })

    it('should detect T-Spin with wall kick and proper corner conditions', () => {
      // T-Spin状況をシミュレート
      const fieldWithTSpinSetup = Array(20).fill(null).map(() => Array(10).fill(0))
      // Tミノの位置(3,18)を基準とした角の埋まり（デバッグ出力から正確な座標に修正）
      fieldWithTSpinSetup[17][3] = 1 // 左上 (x:3, y:17)
      fieldWithTSpinSetup[17][5] = 1 // 右上 (x:5, y:17)
      fieldWithTSpinSetup[19][3] = 1 // 左下 (x:3, y:19)
      fieldWithTSpinSetup[19][5] = 1 // 右下 (x:5, y:19)
      
      const tetromino = new Tetromino('T', 3, 18) // T-Spinポジション
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: fieldWithTSpinSetup,
        wasWallKick: true, // ウォールキックあり
        kickIndex: 3
      }
      
      const result = detectSpin(context, 1)
      expect(result.type).toBe('T-Spin')
      expect(result.variant).toBe('Single')
      expect(result.bonus).toBe(2000)
      expect(result.lines).toBe(1)
    })

    it('should detect T-Spin Mini with specific conditions', () => {
      const fieldWithTSpinMiniSetup = Array(20).fill(null).map(() => Array(10).fill(0))
      // T-Spin Mini: 3つの角のみ埋まっている（正確な座標に修正）
      fieldWithTSpinMiniSetup[17][3] = 1 // 左上 (x:3, y:17)
      fieldWithTSpinMiniSetup[17][5] = 1 // 右上 (x:5, y:17)
      fieldWithTSpinMiniSetup[19][3] = 1 // 左下 (x:3, y:19)
      // 右下は埋まっていない
      
      const tetromino = new Tetromino('T', 3, 18)
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: fieldWithTSpinMiniSetup,
        wasWallKick: true,
        kickIndex: 3 // T-Spin Mini適格なキック
      }
      
      const result = detectSpin(context, 1)
      expect(result.type).toBe('T-Spin')
      expect(result.variant).toBe('Mini')
      expect(result.bonus).toBe(1000)
      expect(result.lines).toBe(1)
    })

    it('should detect S-Spin with wall kick', () => {
      const fieldWithSSpinSetup = Array(20).fill(null).map(() => Array(10).fill(0))
      // S-Spinの角を埋める（デバッグ出力に基づいて修正）
      fieldWithSSpinSetup[17][3] = 1 // 左上 (x:3, y:17)
      fieldWithSSpinSetup[17][5] = 1 // 右上 (x:5, y:17)
      
      const tetromino = new Tetromino('S', 3, 18)
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: fieldWithSSpinSetup,
        wasWallKick: true
      }
      
      const result = detectSpin(context, 1)
      expect(result.type).toBe('SZ-Spin')
      expect(result.variant).toBe('Single')
      expect(result.bonus).toBe(800)
      expect(result.lines).toBe(1)
    })

    it('should detect Z-Spin with wall kick', () => {
      const fieldWithZSpinSetup = Array(20).fill(null).map(() => Array(10).fill(0))
      // Z-Spinの角を埋める（デバッグ出力に基づいて修正）
      fieldWithZSpinSetup[17][2] = 1 // 左上 (x:2, y:17)
      fieldWithZSpinSetup[17][4] = 1 // 右上 (x:4, y:17)
      
      const tetromino = new Tetromino('Z', 3, 18)
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: fieldWithZSpinSetup,
        wasWallKick: true
      }
      
      const result = detectSpin(context, 1)
      expect(result.type).toBe('SZ-Spin')
      expect(result.variant).toBe('Single')
      expect(result.bonus).toBe(800)
      expect(result.lines).toBe(1)
    })

    it('should detect I-Spin with wall kick', () => {
      const fieldWithISpinSetup = Array(20).fill(null).map(() => Array(10).fill(0))
      // I-Spinの角を埋める（長い形状を考慮）
      fieldWithISpinSetup[16][1] = 1 // 左上
      fieldWithISpinSetup[16][5] = 1 // 右上
      
      const tetromino = new Tetromino('I', 2, 18)
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: fieldWithISpinSetup,
        wasWallKick: true
      }
      
      const result = detectSpin(context, 1)
      expect(result.type).toBe('I-Spin')
      expect(result.variant).toBe('Single')
      expect(result.bonus).toBe(600)
      expect(result.lines).toBe(1)
    })

    it('should detect J-Spin with wall kick', () => {
      const fieldWithJSpinSetup = Array(20).fill(null).map(() => Array(10).fill(0))
      // J-Spinの角を埋める
      fieldWithJSpinSetup[17][2] = 1 // 左上
      fieldWithJSpinSetup[17][4] = 1 // 右上
      
      const tetromino = new Tetromino('J', 3, 18)
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: fieldWithJSpinSetup,
        wasWallKick: true
      }
      
      const result = detectSpin(context, 1)
      expect(result.type).toBe('JL-Spin')
      expect(result.variant).toBe('Single')
      expect(result.bonus).toBe(700)
      expect(result.lines).toBe(1)
    })

    it('should detect L-Spin with wall kick', () => {
      const fieldWithLSpinSetup = Array(20).fill(null).map(() => Array(10).fill(0))
      // L-Spinの角を埋める（デバッグ出力に基づいて修正）
      fieldWithLSpinSetup[17][4] = 1 // 左上 (x:4, y:17)
      fieldWithLSpinSetup[17][6] = 1 // 右上 (x:6, y:17)
      
      const tetromino = new Tetromino('L', 3, 18)
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: fieldWithLSpinSetup,
        wasWallKick: true
      }
      
      const result = detectSpin(context, 1)
      expect(result.type).toBe('JL-Spin')
      expect(result.variant).toBe('Single')
      expect(result.bonus).toBe(700)
      expect(result.lines).toBe(1)
    })

    it('should handle multiple line clears correctly', () => {
      const fieldWithTSpinSetup = Array(20).fill(null).map(() => Array(10).fill(0))
      // T-Spinの角を埋める（正確な座標に修正）
      fieldWithTSpinSetup[17][3] = 1 // 左上 (x:3, y:17)
      fieldWithTSpinSetup[17][5] = 1 // 右上 (x:5, y:17)
      fieldWithTSpinSetup[19][3] = 1 // 左下 (x:3, y:19)
      fieldWithTSpinSetup[19][5] = 1 // 右下 (x:5, y:19)
      
      const tetromino = new Tetromino('T', 3, 18)
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: fieldWithTSpinSetup,
        wasWallKick: true
      }
      
      const result = detectSpin(context, 3)
      expect(result.type).toBe('T-Spin')
      expect(result.variant).toBe('Triple')
      expect(result.bonus).toBe(10000)
      expect(result.lines).toBe(3)
    })

    it('should not detect spin for O tetromino', () => {
      const tetromino = new Tetromino('O', 4, 0)
      const context: SpinDetectionContext = {
        tetromino,
        lastAction: 'rotate',
        field: emptyField,
        wasWallKick: true
      }
      
      const result = detectSpin(context, 1)
      expect(result.type).toBe(null)
    })
  })

  describe('isBackToBackEligible', () => {
    it('should return true for 4-line clear', () => {
      const result = { type: null, variant: null, bonus: 0, lines: 4 } as const
      expect(isBackToBackEligible(result)).toBe(true)
    })

    it('should return true for any spin', () => {
      const result = { type: 'T-Spin', variant: 'Single', bonus: 2000, lines: 1 } as const
      expect(isBackToBackEligible(result)).toBe(true)
    })

    it('should return false for regular line clear', () => {
      const result = { type: null, variant: null, bonus: 0, lines: 1 } as const
      expect(isBackToBackEligible(result)).toBe(false)
    })
  })

  describe('formatSpinResult', () => {
    it('should format T-Spin Mini correctly', () => {
      const result = { type: 'T-Spin', variant: 'Mini', bonus: 1000, lines: 1 } as const
      expect(formatSpinResult(result)).toBe('T-Spin Mini Single')
    })

    it('should format regular T-Spin correctly', () => {
      const result = { type: 'T-Spin', variant: 'Single', bonus: 2000, lines: 1 } as const
      expect(formatSpinResult(result)).toBe('T-Spin Single')
    })

    it('should format SZ-Spin correctly', () => {
      const result = { type: 'SZ-Spin', variant: 'Double', bonus: 2000, lines: 2 } as const
      expect(formatSpinResult(result)).toBe('SZ-Spin Double')
    })

    it('should return null for no spin', () => {
      const result = { type: null, variant: null, bonus: 0, lines: 1 } as const
      expect(formatSpinResult(result)).toBe(null)
    })
  })
})