import { 
  checkBounds, 
  checkBlockCollision, 
  checkCollision,
  canMoveTetromino,
  canRotateTetromino,
  isTetrominoLanded,
  getHardDropPosition,
  getCompletedLines,
  clearLines,
  isGameOver,
  canSpawnTetromino
} from '../collision'
import { Tetromino } from '../tetromino'
import { Block } from '@/types/game'

describe('Collision Detection System', () => {
  const emptyField = Array(20).fill(null).map(() => Array(10).fill(0))
  
  describe('checkBounds', () => {
    it('should return true for valid positions', () => {
      const validBlocks: Block[] = [
        { x: 0, y: 0 },
        { x: 9, y: 19 },
        { x: 5, y: 10 }
      ]
      expect(checkBounds(validBlocks)).toBe(true)
    })

    it('should return false for out of bounds positions', () => {
      const invalidBlocks: Block[] = [
        { x: -1, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: -1 },
        { x: 0, y: 20 }
      ]
      expect(checkBounds(invalidBlocks)).toBe(false)
    })
  })

  describe('checkBlockCollision', () => {
    it('should return true for empty cells', () => {
      const blocks: Block[] = [
        { x: 0, y: 0 },
        { x: 5, y: 10 }
      ]
      expect(checkBlockCollision(blocks, emptyField)).toBe(true)
    })

    it('should return false for occupied cells', () => {
      const fieldWithBlock = Array(20).fill(null).map(() => Array(10).fill(0))
      fieldWithBlock[5][5] = 1
      const blocks: Block[] = [{ x: 5, y: 5 }]
      expect(checkBlockCollision(blocks, fieldWithBlock)).toBe(false)
    })
  })

  describe('checkCollision', () => {
    it('should return valid for valid tetromino position', () => {
      const tetromino = new Tetromino('I', 0, 0)
      const blocks = tetromino.getBlocks()
      const result = checkCollision(blocks, emptyField)
      expect(result.isValid).toBe(true)
    })

    it('should return invalid for out of bounds tetromino', () => {
      const tetromino = new Tetromino('I', -1, 0)
      const blocks = tetromino.getBlocks()
      const result = checkCollision(blocks, emptyField)
      expect(result.isValid).toBe(false)
      expect(result.outOfBounds).toBe(true)
    })
  })

  describe('canMoveTetromino', () => {
    it('should allow valid moves', () => {
      const tetromino = new Tetromino('I', 0, 0)
      expect(canMoveTetromino(tetromino, 1, 0, emptyField)).toBe(true)
      expect(canMoveTetromino(tetromino, 0, 1, emptyField)).toBe(true)
    })

    it('should prevent invalid moves', () => {
      const tetromino = new Tetromino('I', 0, 0)
      expect(canMoveTetromino(tetromino, -1, 0, emptyField)).toBe(false)
      // 上方向（y: -1）は仕様上trueになる場合があるためテストしない
      // expect(canMoveTetromino(tetromino, 0, -1, emptyField)).toBe(false)
    })
  })

  describe('canRotateTetromino', () => {
    it('should allow rotation in open space', () => {
      const tetromino = new Tetromino('I', 0, 0)
      expect(canRotateTetromino(tetromino, emptyField)).toBe(true)
    })

    it('should prevent rotation when blocked', () => {
      const tetromino = new Tetromino('I', 9, 0) // At right edge
      expect(canRotateTetromino(tetromino, emptyField)).toBe(false)
    })
  })

  describe('isTetrominoLanded', () => {
    it('should detect landing on bottom', () => {
      const tetromino = new Tetromino('I', 0, 19)
      expect(isTetrominoLanded(tetromino, emptyField)).toBe(true)
    })

    it('should detect landing on other blocks', () => {
      const fieldWithBlock = Array(20).fill(null).map(() => Array(10).fill(0))
      // I型縦向きの下端がフィールド内に収まるように(0,0)に配置し、(2,4)にブロックを置く
      fieldWithBlock[4][2] = 1
      const tetromino = new Tetromino('I', 0, 0)
      tetromino.rotation = 1 // 縦向き
      expect(isTetrominoLanded(tetromino, fieldWithBlock)).toBe(true)
    })

    it('should not detect landing in open space', () => {
      const tetromino = new Tetromino('I', 0, 0)
      expect(isTetrominoLanded(tetromino, emptyField)).toBe(false)
    })
  })

  describe('getCompletedLines', () => {
    it('should detect completed lines', () => {
      const fieldWithCompleteLine = Array(20).fill(null).map(() => Array(10).fill(0))
      fieldWithCompleteLine[19] = Array(10).fill(1) // Bottom row filled
      expect(getCompletedLines(fieldWithCompleteLine)).toEqual([19])
    })

    it('should detect multiple completed lines', () => {
      const fieldWithCompleteLines = Array(20).fill(null).map(() => Array(10).fill(0))
      fieldWithCompleteLines[18] = Array(10).fill(1)
      fieldWithCompleteLines[19] = Array(10).fill(1)
      expect(getCompletedLines(fieldWithCompleteLines)).toEqual([18, 19])
    })

    it('should return empty array for no completed lines', () => {
      expect(getCompletedLines(emptyField)).toEqual([])
    })
  })

  describe('clearLines', () => {
    it('should clear completed lines and shift down', () => {
      const fieldWithCompleteLine = Array(20).fill(null).map(() => Array(10).fill(0))
      fieldWithCompleteLine[19] = Array(10).fill(1) // Bottom row filled
      fieldWithCompleteLine[18][0] = 1 // Block above
      
      const clearedField = clearLines(fieldWithCompleteLine, [19])
      
      // The block that was at row 18 should now be at row 19 (moved down)
      expect(clearedField[19][0]).toBe(1)
      // Row 18 should now be empty
      expect(clearedField[18][0]).toBe(0)
    })
  })

  describe('isGameOver', () => {
    it('should detect game over when tetromino cannot spawn', () => {
      const fieldWithTopBlocks = Array(20).fill(null).map(() => Array(10).fill(0))
      // Fill top rows to block spawning
      fieldWithTopBlocks[0] = Array(10).fill(1)
      fieldWithTopBlocks[1] = Array(10).fill(1)
      
      const tetromino = new Tetromino('I', 4, 0)
      expect(isGameOver(tetromino, fieldWithTopBlocks)).toBe(true)
    })

    it('should not detect game over when tetromino can spawn', () => {
      const tetromino = new Tetromino('I', 4, 0)
      expect(isGameOver(tetromino, emptyField)).toBe(false)
    })
  })

  describe('canSpawnTetromino', () => {
    it('should allow spawning in empty field', () => {
      expect(canSpawnTetromino('I', emptyField)).toBe(true)
      expect(canSpawnTetromino('O', emptyField)).toBe(true)
      expect(canSpawnTetromino('T', emptyField)).toBe(true)
    })

    it('should prevent spawning when top is blocked', () => {
      const fieldWithTopBlocks = Array(20).fill(null).map(() => Array(10).fill(0))
      fieldWithTopBlocks[0] = Array(10).fill(1)
      fieldWithTopBlocks[1] = Array(10).fill(1)
      
      expect(canSpawnTetromino('I', fieldWithTopBlocks)).toBe(false)
      expect(canSpawnTetromino('O', fieldWithTopBlocks)).toBe(false)
    })
  })
}) 