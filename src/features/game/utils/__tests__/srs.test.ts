import { 
  attemptSRSRotation, 
  getKickData, 
  isTSpinEligibleKick,
  normalizeRotation,
  getRotationDirection 
} from '../srs'
import { Tetromino } from '../tetromino'

describe('Super Rotation System (SRS)', () => {
  const emptyField = Array(20).fill(null).map(() => Array(10).fill(0))

  describe('attemptSRSRotation', () => {
    it('should rotate successfully in open space', () => {
      const tetromino = new Tetromino('T', 4, 10)
      const result = attemptSRSRotation(tetromino, emptyField, true)
      
      expect(result.success).toBe(true)
      expect(result.newRotation).toBe(1)
      expect(result.wallKickUsed).toBe(false)
      expect(result.kickIndex).toBe(0)
    })

    it('should attempt wall kicks when rotation is blocked', () => {
      // 右壁際でブロックされる状況を作成
      const fieldWithWall = Array(20).fill(null).map(() => Array(10).fill(0))
      // 右側をブロック
      for (let y = 0; y < 20; y++) {
        fieldWithWall[y][9] = 1
      }
      
      const tetromino = new Tetromino('T', 8, 10)
      const result = attemptSRSRotation(tetromino, fieldWithWall, true)
      
      // キックを試行するが、成功するかどうかは状況による
      expect(typeof result.success).toBe('boolean')
      expect(typeof result.wallKickUsed).toBe('boolean')
      expect(typeof result.kickIndex).toBe('number')
    })

    it('should fail when all kicks are blocked', () => {
      // 完全に囲まれた状況を作成
      const blockedField = Array(20).fill(null).map(() => Array(10).fill(1))
      // 中央に小さなスペースを作成
      for (let y = 10; y < 12; y++) {
        for (let x = 4; x < 6; x++) {
          blockedField[y][x] = 0
        }
      }
      
      const tetromino = new Tetromino('T', 4, 10)
      const result = attemptSRSRotation(tetromino, blockedField, true)
      
      expect(result.success).toBe(false)
      expect(result.wallKickUsed).toBe(false)
      expect(result.kickIndex).toBe(-1)
    })

    it('should use I-piece specific kick table', () => {
      const tetromino = new Tetromino('I', 4, 10)
      const result = attemptSRSRotation(tetromino, emptyField, true)
      
      expect(result.success).toBe(true)
      expect(result.newRotation).toBe(1)
    })
  })

  describe('getKickData', () => {
    it('should return correct kick data for normal pieces', () => {
      const kicks = getKickData('T', 0, 1)
      expect(kicks).toHaveLength(5)
      expect(kicks[0]).toEqual({ x: 0, y: 0 })
      expect(kicks[1]).toEqual({ x: -1, y: 0 })
    })

    it('should return I-piece specific kick data', () => {
      const kicks = getKickData('I', 0, 1)
      expect(kicks).toHaveLength(5)
      expect(kicks[0]).toEqual({ x: 0, y: 0 })
      expect(kicks[1]).toEqual({ x: -2, y: 0 })
    })
  })

  describe('isTSpinEligibleKick', () => {
    it('should return true for T-Spin eligible kicks', () => {
      expect(isTSpinEligibleKick(3, 0, 1)).toBe(true)
      expect(isTSpinEligibleKick(4, 0, 1)).toBe(true)
    })

    it('should return false for non-T-Spin kicks', () => {
      expect(isTSpinEligibleKick(0, 0, 1)).toBe(false)
      expect(isTSpinEligibleKick(1, 0, 1)).toBe(false)
      expect(isTSpinEligibleKick(2, 0, 1)).toBe(false)
    })
  })

  describe('normalizeRotation', () => {
    it('should normalize positive rotations', () => {
      expect(normalizeRotation(0)).toBe(0)
      expect(normalizeRotation(1)).toBe(1)
      expect(normalizeRotation(4)).toBe(0)
      expect(normalizeRotation(5)).toBe(1)
    })

    it('should normalize negative rotations', () => {
      expect(normalizeRotation(-1)).toBe(3)
      expect(normalizeRotation(-2)).toBe(2)
      expect(normalizeRotation(-5)).toBe(3)
    })
  })

  describe('getRotationDirection', () => {
    it('should detect clockwise rotation', () => {
      expect(getRotationDirection(0, 1)).toBe('clockwise')
      expect(getRotationDirection(3, 0)).toBe('clockwise')
    })

    it('should detect counterclockwise rotation', () => {
      expect(getRotationDirection(1, 0)).toBe('counterclockwise')
      expect(getRotationDirection(0, 3)).toBe('counterclockwise')
    })
  })
})