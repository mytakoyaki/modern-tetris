'use client'

import React from 'react'
import { Box, Paper, Typography, LinearProgress, Chip, Tooltip } from '@mui/material'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store/store'
import { 
  formatRankDisplay, 
  formatRankProgress, 
  getRankColor, 
  getRankTitle,
  getRankStatistics,
  getSuggestedTargetRank
} from '../utils/rankSystem'

interface RankDisplayProps {
  variant?: 'compact' | 'detailed'
}

export default function RankDisplay({ variant = 'compact' }: RankDisplayProps) {
  const { currentRank, rankProgress, score, recentPromotions } = useSelector((state: RootState) => state.game)

  const rankColor = getRankColor(currentRank)
  const rankTitle = getRankTitle(currentRank)
  const rankStats = getRankStatistics(currentRank)
  const suggestedTarget = getSuggestedTargetRank(currentRank)

  // 最近の昇格通知
  const hasRecentPromotion = recentPromotions.length > 0
  const latestPromotion = hasRecentPromotion ? recentPromotions[recentPromotions.length - 1] : null

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: rankColor,
            fontWeight: 'bold'
          }}
        >
          {currentRank.name}
        </Typography>
        
        {hasRecentPromotion && (
          <Chip
            label="昇格!"
            size="small"
            sx={{
              backgroundColor: '#ffd700',
              color: '#000',
              fontSize: '0.7rem',
              height: 20,
              animation: 'glow 2s ease-in-out infinite alternate',
              '@keyframes glow': {
                from: { boxShadow: '0 0 5px #ffd700' },
                to: { boxShadow: '0 0 15px #ffd700' },
              },
            }}
          />
        )}
        
        {rankProgress.nextRank && (
          <Typography variant="caption" sx={{ color: '#666' }}>
            {Math.floor(rankProgress.progressToNext)}%
          </Typography>
        )}
      </Box>
    )
  }

  return (
    <Paper sx={{ p: 2, backgroundColor: 'rgba(26, 26, 26, 0.9)' }}>
      {/* 昇格通知 */}
      {hasRecentPromotion && latestPromotion && (
        <Box
          sx={{
            mb: 2,
            p: 1,
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            border: '2px solid #ffd700',
            borderRadius: 1,
            textAlign: 'center',
            animation: 'promotion 3s ease-in-out infinite',
            '@keyframes promotion': {
              '0%': { borderColor: '#ffd700', boxShadow: '0 0 5px #ffd700' },
              '50%': { borderColor: '#ffff00', boxShadow: '0 0 20px #ffd700' },
              '100%': { borderColor: '#ffd700', boxShadow: '0 0 5px #ffd700' },
            },
          }}
        >
          <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 'bold' }}>
            🎉 段位昇格！
          </Typography>
          <Typography variant="body2" sx={{ color: '#fff' }}>
            {formatRankDisplay(latestPromotion)} に昇格しました！
          </Typography>
        </Box>
      )}

      {/* 現在の段位 */}
      <Typography variant="h6" sx={{ color: '#ffd700', mb: 1 }}>
        RANK
      </Typography>
      
      <Typography 
        variant="h4" 
        sx={{ 
          color: rankColor, 
          mb: 1, 
          fontWeight: 'bold',
          textShadow: `0 0 10px ${rankColor}`
        }}
      >
        {currentRank.name}
      </Typography>
      
      {/* 称号 */}
      <Typography variant="body2" sx={{ color: '#00ff88', mb: 1 }}>
        {rankTitle}
      </Typography>
      
      {/* 進捗バー */}
      {rankProgress.nextRank ? (
        <>
          <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
            次の段位: {rankProgress.nextRank.name}
          </Typography>
          
          <LinearProgress
            variant="determinate"
            value={rankProgress.progressToNext}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              mb: 1,
              '& .MuiLinearProgress-bar': {
                backgroundColor: rankColor,
                borderRadius: 4,
                boxShadow: `0 0 10px ${rankColor}`,
              },
            }}
          />
          
          <Typography variant="caption" sx={{ color: '#666' }}>
            {formatRankProgress(rankProgress)}
          </Typography>
        </>
      ) : (
        <Typography variant="body2" sx={{ color: '#ffd700', textAlign: 'center' }}>
          ⭐ 最高段位達成 ⭐
        </Typography>
      )}
      
      {/* 統計情報 */}
      <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid #333' }}>
        <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
          難易度: {rankStats.difficulty}
        </Typography>
        <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
          推定上位: {rankStats.estimatedPlayersBelow}のプレイヤー
        </Typography>
        
        {suggestedTarget && (
          <Typography variant="caption" sx={{ color: '#00ff88', display: 'block', mt: 0.5 }}>
            推奨目標: {suggestedTarget.name}
          </Typography>
        )}
      </Box>
      
      {/* 段位説明 */}
      <Tooltip title={currentRank.description} placement="top">
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#666', 
            display: 'block', 
            mt: 1,
            cursor: 'help',
            '&:hover': {
              color: '#00ff88'
            }
          }}
        >
          ℹ️ 段位について
        </Typography>
      </Tooltip>
    </Paper>
  )
}