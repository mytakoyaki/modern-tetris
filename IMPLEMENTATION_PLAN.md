# ClaudeTetris 次世代実装計画

ロードマップとREADMEを分析し、現在の実装状況を踏まえて、統合的な実装計画を作成しました。

## 現在の実装状況分析

### ✅ 完了済み（React/Next.js版）
- **STEP 1**: Next.js + TypeScript基盤 ✅
- **STEP 2**: コア機能のSPA化
  - 基本ゲームロジック ✅
  - Redux状態管理 ✅  
  - 衝突判定システム ✅
  - 自動落下・レベルシステム ✅
  - ゲームオーバー判定 ✅

### 🚧 既存HTML版（85%完成）
- 高度なテトリス機能（ポイント、フィーバー、実績等）
- PC専用最適化・レイアウト切り替え
- T-Spin・スピン技システム
- 実績・段位システム

## 統合実装戦略

### TODO管理状況
- [x] Next.js基盤構築
- [x] 基本ゲームコンポーネント作成
- [x] Tetromino システム実装
- [x] 衝突判定システム実装
- [x] 自動落下タイマー実装
- [x] ゲームオーバー判定実装
- [x] レベル別速度進行実装
- [ ] ClaudeTetris独自機能移植（高優先度）
- [ ] T-Spin・スピン技システム実装
- [ ] ポイント&エクスチェンジシステム実装
- [ ] フィーバーモードシステム実装
- [ ] 実績・段位システム実装

## Phase 1: ClaudeTetris独自機能の移植 (高優先度)

### 1.1 T-Spin・スピン技システム実装
```typescript
// types/spin.ts
export interface SpinResult {
  type: 'T-Spin' | 'SZ-Spin' | 'I-Spin' | 'JL-Spin' | null
  variant: 'Single' | 'Double' | 'Triple' | 'Mini' | null
  bonus: number
}

// utils/spinDetection.ts
export function detectSpin(tetromino: Tetromino, lastAction: 'rotate' | 'move', field: number[][]): SpinResult
```

### 1.2 ポイント&エクスチェンジシステム
```typescript
// Redux slice拡張
interface GameState {
  points: number
  exchangeCount: number
  exchangeCost: number
  exchangeCosts: number[] // [45, 65, 90, 120, 160]
}

// 機能
- テトリミノ設置: 10P
- ソフト/ハードドロップ: 0.5P/1P per line
- NEXTピース交換: 累積コスト制
- ライン削除: 200P
```

### 1.3 フィーバーモードシステム
```typescript
interface FeverMode {
  isActive: boolean
  timeRemaining: number
  blocksUntilActivation: number // 20ブロック
  scoreMultiplier: 4
  freeExchanges: boolean
}

// 視覚効果
- パーティクルエフェクト（React実装）
- 背景アニメーション
- GPU加速最適化
```

### 1.4 段位システム実装
```typescript
interface RankSystem {
  currentRank: {
    name: string    // 無段〜永世名人
    threshold: number
    index: number
  }
  ranks: Array<{ name: string, threshold: number }>
}

// 14段階の段位
const RANKS = [
  { name: '無段', threshold: 0 },
  { name: '初段', threshold: 200 },
  { name: '二段', threshold: 800 },
  { name: '三段', threshold: 2000 },
  { name: '四段', threshold: 4000 },
  { name: '五段', threshold: 8000 },
  { name: '六段', threshold: 15000 },
  { name: '七段', threshold: 25000 },
  { name: '八段', threshold: 40000 },
  { name: '九段', threshold: 60000 },
  { name: '十段', threshold: 90000 },
  { name: '名人', threshold: 130000 },
  { name: '竜王', threshold: 200000 },
  { name: '永世名人', threshold: 300000 }
]
```

## Phase 2: UI/UX機能強化 (中優先度)

### 2.1 レイアウト切り替えシステム
```typescript
// Redux slice
interface GameState {
  layoutOrientation: 'horizontal' | 'vertical'
}

// Components
- OrientationToggle: 右上固定ボタン
- ResponsiveLayout: 動的レイアウト変更
- PCOptimized: 1200px+最適化
```

### 2.2 デュアルホールドシステム
```typescript
interface GameState {
  holdPieces: [TetrominoType | null, TetrominoType | null]
  holdCosts: [number, number] // [15P, 15P]
}

// キーバインド
- C: Hold Slot 1
- V: Hold Slot 2
```

### 2.3 実績システム移植
```typescript
interface AchievementSystem {
  achievements: Achievement[]
  categories: ['基本', 'スコア', '技術', 'チャレンジ', '特殊']
  progress: Record<string, number>
}

// 15種類の実績を段階的実装
```

## Phase 3: バックエンド・API実装 (中優先度)

### 3.1 Next.js API Routes
```typescript
// src/app/api/
├── users/route.ts        // ユーザー管理
├── scores/route.ts       // スコア・ランキング
├── achievements/route.ts // 実績管理
└── auth/route.ts         // JWT認証
```

### 3.2 データベース設計
```sql
-- Prisma Schema
model User {
  id String @id @default(cuid())
  scores Score[]
  achievements UserAchievement[]
}

model Score {
  id Int @id @default(autoincrement())
  userId String
  score Int
  level Int
  rank String
  playTime Int
}
```

### 3.3 認証システム
```typescript
// JWT + HttpOnly Cookies
- ユーザー登録・ログイン
- セッション管理
- データ同期（localStorage → RDBMS）
```

## Phase 4: テスト・品質保証 (低優先度)

### 4.1 テストシステム構築
```typescript
// tests/
├── unit/          // Jest + React Testing Library
├── integration/   // API統合テスト
└── e2e/          // Playwright
```

### 4.2 CI/CD構築
```yaml
# GitHub Actions
- 自動テスト実行
- 型チェック・Lint
- 本番デプロイ
```

## Phase 5: 拡張機能・運用 (将来実装)

### 5.1 サウンド・設定システム
```typescript
// 既存HTML版から移植
- BGM・効果音システム
- キーボードカスタマイズ
- ゲーム設定画面
```

### 5.2 高度な機能
```typescript
// 長期実装
- チュートリアルシステム
- リプレイ機能
- PWA対応
- i18n対応
```

## 実装優先順位

### 🔥 **超高優先度（即座に実装）**
1. **T-Spin・スピン技システム** - ClaudeTetrisの核心機能
2. **ポイント&エクスチェンジシステム** - 独自ゲームプレイ
3. **フィーバーモード** - 戦略的要素の要

### ⚡ **高優先度（2週間以内）**
4. **段位システム** - プレイヤー成長指標
5. **レイアウト切り替え** - PC最適化
6. **デュアルホールド** - 戦略性向上

### 📈 **中優先度（1-2ヶ月）**
7. **実績システム** - 長期モチベーション
8. **API・DB実装** - スケーラビリティ
9. **認証システム** - ユーザー体験

### 🔧 **低優先度（3ヶ月+）**
10. **テストシステム** - 品質保証
11. **サウンド・設定** - UX向上
12. **拡張機能** - 差別化要素

## 技術アーキテクチャ

### フロントエンド
```typescript
// 現在の構成を拡張
modern-tetris/src/
├── features/
│   ├── game/           // 基本ゲーム（完成）
│   ├── spin/           // スピン技システム
│   ├── point/          // ポイントシステム
│   ├── fever/          // フィーバーモード
│   ├── achievement/    // 実績システム
│   └── layout/         // レイアウト管理
├── store/slices/       // Redux状態管理拡張
└── components/shared/  // 共通コンポーネント
```

### バックエンド
```typescript
// Next.js App Router
src/app/
├── api/               // RESTful API
├── (auth)/           // 認証ページ群  
├── game/             // ゲームメインページ
└── dashboard/        // ユーザーダッシュボード
```

## マイグレーション戦略

### 段階的移植
1. **機能単位での移植**: HTML版から1つずつ機能を移植
2. **型安全性の確保**: TypeScript型定義を先行実装
3. **テスト駆動**: 移植と同時にテストケース作成
4. **パフォーマンス維持**: 既存最適化を保持

### 品質保証
- **機能比較テスト**: HTML版との動作比較
- **パフォーマンステスト**: 60fps保証の維持
- **ユーザビリティテスト**: PC最適化の検証

## 成功指標

### 技術指標
- ✅ 全ての ClaudeTetris 独自機能が動作
- ✅ 60fps安定動作
- ✅ 型安全性100%
- ✅ テストカバレッジ80%+

### ユーザー体験指標
- ✅ HTML版と同等以上のゲーム体験
- ✅ レスポンシブ・快適な操作感
- ✅ 長期プレイモチベーション維持

## 開発フロー

### 開発手順
1. **型定義作成**: TypeScript型を先行実装
2. **Redux状態拡張**: gameSliceに新しい状態を追加
3. **ユーティリティ実装**: 各システムのロジックを実装
4. **コンポーネント作成**: UI コンポーネントを実装
5. **統合テスト**: 既存機能との統合を確認
6. **パフォーマンス最適化**: 60fps保証を維持

### 品質管理
- **コードレビュー**: 型安全性・パフォーマンスチェック
- **動作確認**: HTML版との比較テスト
- **ログ記録**: 各実装フェーズでログを作成

## 次のアクション

**推奨開始点**: T-Spin・スピン技システムの実装
- ClaudeTetrisの最重要差別化要素
- 既存衝突判定システムとの統合が必要
- ゲームプレイに直接影響する核心機能

この計画に従って、段階的にClaudeTetrisの全機能をReact/Next.js版に移植し、最終的には既存HTML版を上回る完成度を目指します。

---

**作成日**: 2025-06-25  
**最終更新**: 2025-06-25  
**ステータス**: 実装準備完了