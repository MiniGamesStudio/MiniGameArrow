/**
 * 肉鸽动作游戏常量
 */
export const RoguelikeConst = {
    // 玩家
    PLAYER_BASE_HP: 100,
    PLAYER_BASE_SPEED: 200,
    PLAYER_BASE_ATTACK: 10,
    PLAYER_BASE_DEFENSE: 5,
    PLAYER_BASE_PICKUP_RANGE: 80,
    PLAYER_INVINCIBLE_DURATION: 0.5,

    // 经验与升级
    BASE_EXP_TO_LEVEL: 10,
    EXP_GROWTH_FACTOR: 1.2,
    LEVEL_UP_CHOICES_COUNT: 3,

    // 武器与道具槽
    MAX_WEAPON_SLOTS: 6,
    MAX_PASSIVE_SLOTS: 6,

    // 地牢
    BASE_ROOM_COUNT: 6,
    ROOM_GROWTH_PER_FLOOR: 1,

    // 金币
    ENEMY_GOLD_DROP_CHANCE: 0.3,

    // NPC
    COOPERATION_THRESHOLD: 50,
    COMPETITION_PRICE_MODIFIER: 1.2,
} as const;

/**
 * 配置表名 → 资源路径映射
 */
export const ROGUELIKE_CONFIG_MAP: Record<string, string> = {
    enemy: 'config/roguelike/enemy',
    weapon: 'config/roguelike/weapon',
    item: 'config/roguelike/item',
    pet: 'config/roguelike/pet',
    class: 'config/roguelike/class',
    npc: 'config/roguelike/npc',
    costume: 'config/roguelike/costume',
    event: 'config/roguelike/event',
    shop: 'config/roguelike/shop',
    dungeon: 'config/roguelike/dungeon',
} as const;
