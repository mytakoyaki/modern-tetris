# 🎮 Modern Tetris - ゲーム仕様書

A modern implementation of Tetris built with Next.js, React, Redux, and Material-UI.

## 📋 基本情報

- **ゲーム名**: Modern Tetris
- **技術スタック**: Next.js 15.3.4, React 19, TypeScript, Redux Toolkit
- **UI フレームワーク**: Material-UI (MUI) 7.1.2
- **アニメーション**: Framer Motion 12.19.1
- **テスト**: Jest + Testing Library

## 🎮 ゲームシステム

### 基本ルール
- **フィールドサイズ**: 10×20 グリッド
- **テトリミノ**: 7種類 (I, O, T, S, Z, J, L)
- **回転システム**: SRS (Super Rotation System) 準拠
- **落下速度**: レベルに応じて増加

### 操作
- **← →**: テトリミノを左右に移動
- **↑**: テトリミノを回転 (時計回り)
- **↓**: ソフトドロップ
- **Space**: ハードドロップ
- **C**: ホールド (15ポイント)
- **X**: エクスチェンジ (累積コスト)
- **L**: ライン削除 (200ポイント、緊急機能)
- **P**: 一時停止

## 🎯 スコアリングシステム

### 基本スコア
- **ブロック配置**: 10点
- **ソフトドロップ**: 0.5点/ライン
- **ハードドロップ**: 1点/ライン

### ライン消去スコア
- **1ライン**: 100点
- **2ライン**: 300点
- **3ライン**: 500点
- **4ライン (テトリス)**: 800点

### スピン技ボーナス
- **T-Spin Single**: 2,000点
- **T-Spin Double**: 5,000点
- **T-Spin Triple**: 10,000点
- **T-Spin Mini**: 1,000-3,000点
- **SZ-Spin**: 800-4,000点
- **I-Spin**: 600-3,000点
- **JL-Spin**: 700-3,500点

### コンボシステム
- **コンボ**: 連続ライン消去でボーナス
- **Back-to-Back**: テトリスやスピン技の連続でボーナス

## 🏆 段位システム (14段階)

| 段位 | 必要スコア | 色 | 説明 |
|------|------------|-----|------|
| 無段 | 0 | #666666 | テトリスの基礎を学ぶ段階 |
| 初段 | 200 | #8B4513 | 基本操作をマスターした初心者 |
| 二段 | 800 | #A0522D | ライン消去の技術を習得 |
| 三段 | 2,000 | #CD853F | T-Spinの基礎を理解 |
| 四段 | 4,000 | #DEB887 | 多様なスピン技を習得 |
| 五段 | 8,000 | #F5DEB3 | コンボシステムをマスター |
| 六段 | 15,000 | #C0C0C0 | 高速プレイが可能 |
| 七段 | 25,000 | #D3D3D3 | 上級テクニックを習得 |
| 八段 | 40,000 | #E6E6FA | 極めて高い技術力 |
| 九段 | 60,000 | #FFD700 | 達人レベルの実力 |
| 十段 | 90,000 | #FFA500 | 最高峰の技術を持つ |
| 名人 | 130,000 | #FF4500 | 伝説的なプレイヤー |
| 竜王 | 200,000 | #DC143C | 圧倒的な実力の持ち主 |
| 永世名人 | 300,000 | #8A2BE2 | ClaudeTetrisの頂点に立つ者 |

## ⚡ フィーバーモード

### 発動条件
- **ブロック配置**: 20個配置で発動
- **持続時間**: 20秒
- **スコア倍率**: 4倍
- **無料エクスチェンジ**: フィーバー中は無料

## 💰 ポイントシステム

### ポイント獲得
- **ブロック配置**: 10ポイント
- **実績解除**: 5-2,000ポイント
- **段位昇格**: 50ポイントボーナス

### エクスチェンジ機能
- **累積コスト**: 45, 65, 90, 120, 160ポイント
- **フィーバー中**: 無料
- **ホールド機能**: 15ポイント

### 緊急機能
- **ライン削除**: 200ポイント (Lキー)
- **効果**: 最下段を即座に削除 + 重力適用

## 🏅 実績システム

### カテゴリ別実績

#### 基本実績
- 初回ライン消去、スコア到達、プレイ回数など

#### 技術実績
- T-Spin、コンボ、テトリス、パーフェクトクリアなど

#### 段位実績
- 各段位への昇格

#### チャレンジ実績
- 時間制限、効率性、特殊条件など

#### 隠し実績
- 特殊な条件やパターンでのみ解除

### 実績例
- **初回テトリス**: 4ライン同時消去
- **T-Spinデビュー**: 初回T-Spin
- **フィーバーマスター**: フィーバー10回発動
- **コンボマスター**: 5コンボ以上
- **夜更かしプレイヤー**: 深夜2-5時にプレイ

## 🔧 技術仕様

### 回転システム (SRS)
- **標準テトリミノ**: 5段階キックテーブル
- **Iミノ**: 専用キックテーブル
- **ウォールキック**: 壁際での回転補助

### スピン検出
- **T-Spin**: 3つ以上の角が埋まっている + ウォールキック
- **T-Spin Mini**: 特定キックパターン + 3つの角
- **SZ-Spin**: S/Zミノ専用スピン検出
- **I-Spin**: Iミノ専用スピン検出
- **JL-Spin**: J/Lミノ専用スピン検出

### データ永続化
- **ローカルストレージ**: スコア、実績、統計データ
- **セッション管理**: プレイ履歴、連続日数

## 🎨 UI/UX 機能

### 視覚効果
- **ライン消去エフェクト**: 画面シェイク
- **フィーバーエフェクト**: 特殊アニメーション
- **スコアポップアップ**: リアルタイム表示
- **プログレスバー**: 段位進捗表示

### 情報表示
- **サイドバー**: スコア、レベル、段位、フィーバーゲージ
- **ネクスト表示**: 次のテトリミノ
- **ホールド表示**: 保持中のテトリミノ
- **統計情報**: ライン数、テトリス数、T-Spin数

## 🚀 Live Demo

Play the game: [Modern Tetris on GitHub Pages](https://mytakoyaki.github.io/modern-tetris/)

## 📦 Deployment

### GitHub Pages Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

1. **Repository Setup**:
   - Ensure your repository is public
   - Go to Settings > Pages
   - Set source to "GitHub Actions"

2. **Automatic Deployment**:
   - Push to `main` branch triggers automatic build and deployment
   - GitHub Actions will build the project and deploy to GitHub Pages
   - The site will be available at: `https://mytakoyaki.github.io/modern-tetris/`

3. **Manual Deployment**:
   ```bash
   npm run build
   # The built files will be in the 'out' directory
   ```

### Local Development

```bash
npm run dev
# Open http://localhost:3000
```

## 🛠️ Development

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/modern-tetris.git
cd modern-tetris
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## 🏗️ Architecture

### Tech Stack

- **Frontend Framework**: Next.js 15 with React 19
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI (MUI)
- **Styling**: Tailwind CSS
- **Testing**: Jest with React Testing Library
- **Type Safety**: TypeScript

### Project Structure

```
modern-tetris/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # Shared components
│   ├── features/           # Feature-based modules
│   │   ├── game/           # Game logic and components
│   │   ├── achievement/    # Achievement system
│   │   └── ...
│   ├── store/              # Redux store and slices
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles
├── public/                 # Static assets
└── tests/                  # Test files
```

## 🚀 Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages:

1. Push to the `main` branch
2. GitHub Actions will automatically build and deploy
3. The game will be available at: `https://mytakoyaki.github.io/modern-tetris/`

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. The static files will be generated in the `out/` directory
3. Deploy the contents of the `out/` directory to your web server

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## 📊 統計・分析

### プレイ統計
- **総プレイ回数**: 累計ゲーム数
- **総プレイ時間**: 累計プレイ時間
- **最高スコア**: 過去最高記録
- **平均スコア**: 統計データ

### 進捗追跡
- **段位進捗**: 現在段位と次の段位への進捗
- **実績進捗**: 各実績の解除状況
- **連続記録**: 連続プレイ日数

## 📝 Recent Updates

### Latest Features
- ✅ Gravity system for block falling
- ✅ Soft drop scoring fixes
- ✅ Key operation guide UI
- ✅ Clear bottom row feature
- ✅ Comprehensive achievement system
- ✅ 14-level Dan ranking system
- ✅ Fever mode with 4x multiplier
- ✅ SRS rotation system
- ✅ Advanced spin detection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Classic Tetris for the original game mechanics
- Next.js team for the amazing framework
- Material-UI team for the beautiful components
- Redux team for state management

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**Enjoy playing Modern Tetris! 🎮**
