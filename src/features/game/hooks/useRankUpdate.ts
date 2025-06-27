import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'

export function useRankUpdate() {
  const { currentRank, rankProgress, score } = useSelector((state: RootState) => state.game)
  const prevRankRef = useRef(currentRank)
  const prevProgressRef = useRef(rankProgress)
  const prevScoreRef = useRef(score)

  useEffect(() => {
    // 段位が変更された場合のログ
    if (prevRankRef.current?.name !== currentRank?.name) {
      console.log('Rank changed:', {
        from: prevRankRef.current?.name,
        to: currentRank?.name,
        score
      })
      prevRankRef.current = currentRank
    }

    // 進捗が変更された場合のログ
    if (prevProgressRef.current?.progressToNext !== rankProgress?.progressToNext) {
      console.log('Progress changed:', {
        from: prevProgressRef.current?.progressToNext,
        to: rankProgress?.progressToNext,
        score
      })
      prevProgressRef.current = rankProgress
    }

    // スコアが変更された場合のログ
    if (prevScoreRef.current !== score) {
      console.log('Score changed:', {
        from: prevScoreRef.current,
        to: score
      })
      prevScoreRef.current = score
    }
  }, [currentRank, rankProgress, score])

  return {
    currentRank,
    rankProgress,
    score
  }
} 