/**
 * キーボード入力管理フック
 * HTML版のキーボード入力システムをReact用に移植
 */

import { useEffect, useCallback, useRef } from 'react'

export interface KeyBinding {
  key: string
  action: string
  repeat?: boolean
}

interface KeyRepeatState {
  isPressed: boolean
  timer: NodeJS.Timeout | null
  repeatTimer: NodeJS.Timeout | null
}

// デフォルトキーバインド（HTML版準拠）
export const DEFAULT_KEY_BINDINGS: KeyBinding[] = [
  { key: 'ArrowLeft', action: 'moveLeft', repeat: true },
  { key: 'ArrowRight', action: 'moveRight', repeat: true },
  { key: 'ArrowDown', action: 'softDrop', repeat: true },
  { key: 'ArrowUp', action: 'rotate' },
  { key: ' ', action: 'hardDrop' }, // スペースキー
  { key: 'c', action: 'hold1' },
  { key: 'C', action: 'hold1' },
  { key: 'v', action: 'hold2' },
  { key: 'V', action: 'hold2' },
  { key: 'e', action: 'exchange' },
  { key: 'E', action: 'exchange' },
  { key: 'l', action: 'lineDelete' },
  { key: 'L', action: 'lineDelete' },
  { key: 'z', action: 'rotateCounterClockwise' },
  { key: 'Z', action: 'rotateCounterClockwise' },
]

export interface InputCallbacks {
  onMoveLeft?: () => void
  onMoveRight?: () => void
  onSoftDrop?: () => void
  onSoftDropStart?: () => void
  onSoftDropEnd?: () => void
  onHardDrop?: () => void
  onRotate?: () => void
  onRotateCounterClockwise?: () => void
  onHold1?: () => void
  onHold2?: () => void
  onExchange?: () => void
  onLineDelete?: () => void
}

export const useKeyboardInput = (
  callbacks: InputCallbacks,
  isEnabled: boolean = true,
  customKeyBindings?: KeyBinding[]
) => {
  const keyRepeatState = useRef<Map<string, KeyRepeatState>>(new Map())
  const keyBindings = customKeyBindings || DEFAULT_KEY_BINDINGS
  
  // キーリピート設定
  const KEY_REPEAT_DELAY = 200 // 初回リピートまでの遅延（ms）
  const KEY_REPEAT_INTERVAL = 50 // リピート間隔（ms）

  // キーアクションマッピング
  const actionMap = useCallback((action: string) => {
    switch (action) {
      case 'moveLeft':
        return callbacks.onMoveLeft
      case 'moveRight':
        return callbacks.onMoveRight
      case 'softDrop':
        return callbacks.onSoftDrop
      case 'hardDrop':
        return callbacks.onHardDrop
      case 'rotate':
        return callbacks.onRotate
      case 'rotateCounterClockwise':
        return callbacks.onRotateCounterClockwise
      case 'hold1':
        return callbacks.onHold1
      case 'hold2':
        return callbacks.onHold2
      case 'exchange':
        return callbacks.onExchange
      case 'lineDelete':
        return callbacks.onLineDelete
      default:
        return undefined
    }
  }, [callbacks])

  // キーリピートのクリーンアップ
  const cleanupKeyRepeat = useCallback((key: string) => {
    const state = keyRepeatState.current.get(key)
    if (state) {
      if (state.timer) {
        clearTimeout(state.timer)
      }
      if (state.repeatTimer) {
        clearInterval(state.repeatTimer)
      }
      keyRepeatState.current.delete(key)
    }
  }, [])

  // すべてのキーリピートをクリーンアップ
  const cleanupAllKeyRepeats = useCallback(() => {
    keyRepeatState.current.forEach((state, key) => {
      cleanupKeyRepeat(key)
    })
    keyRepeatState.current.clear()
  }, [cleanupKeyRepeat])

  // キーアクション実行
  const executeAction = useCallback((action: string) => {
    const callback = actionMap(action)
    if (callback) {
      callback()
    }
  }, [actionMap])

  // キーダウンハンドラー
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return

    // フィールド外の要素（入力フィールドなど）では無効化
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return
    }

    const key = event.key
    const binding = keyBindings.find(b => b.key === key)
    
    if (!binding) return

    // デフォルト動作を防ぐ（スペースキーのスクロールなど）
    event.preventDefault()

    const currentState = keyRepeatState.current.get(key)
    
    // 既に押されている場合は無視
    if (currentState?.isPressed) return

    // 即座にアクション実行
    executeAction(binding.action)
    
    // ソフトドロップ開始処理
    if (binding.action === 'softDrop' && callbacks.onSoftDropStart) {
      callbacks.onSoftDropStart()
    }

    // リピート可能なキーの場合、リピート設定
    if (binding.repeat) {
      const newState: KeyRepeatState = {
        isPressed: true,
        timer: null,
        repeatTimer: null
      }

      // 初回リピート遅延タイマー
      newState.timer = setTimeout(() => {
        // リピート間隔タイマー
        newState.repeatTimer = setInterval(() => {
          executeAction(binding.action)
        }, KEY_REPEAT_INTERVAL)
      }, KEY_REPEAT_DELAY)

      keyRepeatState.current.set(key, newState)
    } else {
      // リピートしないキーも状態を記録（重複実行防止）
      keyRepeatState.current.set(key, {
        isPressed: true,
        timer: null,
        repeatTimer: null
      })
    }
  }, [isEnabled, keyBindings, executeAction])

  // キーアップハンドラー
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return

    const key = event.key
    const binding = keyBindings.find(b => b.key === key)
    
    if (!binding) return

    // ソフトドロップ終了処理
    if (binding.action === 'softDrop' && callbacks.onSoftDropEnd) {
      callbacks.onSoftDropEnd()
    }

    cleanupKeyRepeat(key)
  }, [isEnabled, keyBindings, cleanupKeyRepeat, callbacks])

  // フォーカス喪失時のクリーンアップ
  const handleBlur = useCallback(() => {
    cleanupAllKeyRepeats()
  }, [cleanupAllKeyRepeats])

  // ページ非表示時のクリーンアップ
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      cleanupAllKeyRepeats()
    }
  }, [cleanupAllKeyRepeats])

  useEffect(() => {
    if (!isEnabled) {
      cleanupAllKeyRepeats()
      return
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      cleanupAllKeyRepeats()
    }
  }, [isEnabled, handleKeyDown, handleKeyUp, handleBlur, handleVisibilityChange, cleanupAllKeyRepeats])

  // 強制的にすべてのキー状態をリセット
  const resetAllKeys = useCallback(() => {
    cleanupAllKeyRepeats()
  }, [cleanupAllKeyRepeats])

  // 特定のキーの状態をリセット
  const resetKey = useCallback((key: string) => {
    cleanupKeyRepeat(key)
  }, [cleanupKeyRepeat])

  // 現在押されているキーの状態を取得
  const getKeyState = useCallback((key: string): boolean => {
    return keyRepeatState.current.get(key)?.isPressed || false
  }, [])

  return {
    resetAllKeys,
    resetKey,
    getKeyState,
    isEnabled
  }
}