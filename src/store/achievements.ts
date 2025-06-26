// Generated from HTML version - 255 achievements
export const FULL_ACHIEVEMENTS = [
  {
    "id": "tetris_master",
    "name": "テトリスマスター",
    "description": "テトリス（4ライン同時消去）を10回達成",
    "category": "fun",
    "icon": "🏆",
    "pointReward": 100,
    "unlocked": false,
    "progress": 0,
    "maxProgress": 1,
    "condition": {
      "type": "perfect_clear",
      "value": 1
    },
    "hidden": false
  },
  {
    "id": "first_game",
    "name": "はじめの一歩",
    "description": "初回プレイ完了",
    "category": "basic",
    "icon": "👶",
    "pointReward": 35,
    "unlocked": false,
    "progress": 0,
    "maxProgress": 5,
    "condition": {
      "type": "max_combo",
      "value": 5
    },
    "hidden": false
  },
  {
    "id": "block_waster",
    "name": "ブロック無駄遣い",
    "description": "1000個ブロックを置いても100点以下",
    "category": "special",
    "icon": "🗑️",
    "pointReward": 70,
    "unlocked": false,
    "progress": 0,
    "maxProgress": 7,
    "condition": {
      "type": "consecutive_days",
      "value": 7
    },
    "hidden": false
  },
  {
    "id": "back_to_back_master",
    "name": "Back-to-Backマスター",
    "description": "Back-to-Backを50回連続で維持",
    "category": "technical",
    "icon": "🔗",
    "pointReward": 150,
    "unlocked": false,
    "progress": 0,
    "maxProgress": 3,
    "condition": {
      "type": "perfect_clear",
      "value": 3
    },
    "hidden": false
  },
  {
    "id": "secret_zen_master",
    "name": "???",
    "description": "???",
    "category": "challenge",
    "icon": "🧘",
    "pointReward": 250,
    "unlocked": false,
    "progress": 0,
    "maxProgress": 12,
    "condition": {
      "type": "max_combo",
      "value": 12
    },
    "hidden": false
  }
] as const;
