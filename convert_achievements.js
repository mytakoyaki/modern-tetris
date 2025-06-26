const fs = require('fs');
const path = require('path');

// HTML版のアチーブメント定義を読み込み
const tetrisJsPath = path.join(__dirname, '..', 'tetris', 'js', 'achievementSystem.js');
const jsContent = fs.readFileSync(tetrisJsPath, 'utf8');

// ACHIEVEMENTS オブジェクトを抽出
const achievementsMatch = jsContent.match(/const ACHIEVEMENTS = \{([\s\S]*?)\n\};/);
if (!achievementsMatch) {
  console.error('ACHIEVEMENTS not found');
  process.exit(1);
}

// 各アチーブメントブロックを抽出（より包括的な正規表現）
const achievementBlocks = achievementsMatch[1].split(/,\s*(?=\w+:\s*\{)/);
const achievements = [];

achievementBlocks.forEach(block => {
  // 空白行を除去
  block = block.trim();
  if (!block) return;
  
  // 各プロパティを抽出
  const getId = block.match(/id:\s*['"]([^'"]+)['"]/);
  const getName = block.match(/name:\s*['"]([^'"]*)['"]/);
  const getDescription = block.match(/description:\s*['"]([^'"]*)['"]/);
  const getIcon = block.match(/icon:\s*['"]([^'"]+)['"]/);
  const getCategory = block.match(/category:\s*['"]([^'"]+)['"]/);
  const getPoints = block.match(/points:\s*(\d+)/);
  const getCondition = block.match(/condition:\s*\{\s*type:\s*['"]([^'"]+)['"],\s*value:\s*(\d+)\s*\}/);
  const getHidden = block.match(/hidden:\s*(true|false)/);
  
  if (getId && getName && getDescription && getIcon && getCategory && getPoints && getCondition) {
    achievements.push({
      id: getId[1],
      name: getName[1],
      description: getDescription[1],
      icon: getIcon[1],
      category: getCategory[1],
      points: parseInt(getPoints[1]),
      condition: {
        type: getCondition[1],
        value: parseInt(getCondition[2])
      },
      hidden: getHidden ? getHidden[1] === 'true' : false
    });
  } else {
    console.log('Failed to parse achievement block:', block.substring(0, 100));
  }
});

console.log(`Parsed ${achievements.length} achievements`);

// React版の形式に変換
const convertedAchievements = achievements.map(achievement => ({
  id: achievement.id,
  name: achievement.name,
  description: achievement.description,
  category: achievement.category,
  icon: achievement.icon,
  pointReward: achievement.points,
  unlocked: false,
  progress: 0,
  maxProgress: achievement.condition.value,
  condition: achievement.condition,
  hidden: achievement.hidden || false,
  unlockedAt: undefined
}));

console.log(`Total achievements converted: ${convertedAchievements.length}`);

// TypeScript配列として出力
const tsOutput = `// Generated from HTML version - 255 achievements
export const FULL_ACHIEVEMENTS = ${JSON.stringify(convertedAchievements, null, 2)} as const;
`;

// ファイルに書き出し
const outputPath = path.join(__dirname, 'src', 'store', 'achievements.ts');
fs.writeFileSync(outputPath, tsOutput);

console.log(`Achievements exported to ${outputPath}`);