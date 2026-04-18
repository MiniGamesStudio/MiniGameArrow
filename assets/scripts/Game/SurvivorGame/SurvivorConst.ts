/**
 * 幸存者游戏常量
 */
export const SurvivorConst = {
    // 玩家
    PLAYER_BASE_HP: 100,
    PLAYER_BASE_SPEED: 200,
    PLAYER_BASE_PICKUP_RANGE: 80,
    PLAYER_INVINCIBLE_DURATION: 0.5,

    // 经验与升级
    BASE_EXP_TO_LEVEL: 10,
    EXP_GROWTH_FACTOR: 1.2,
    LEVEL_UP_CHOICES_COUNT: 3,

    // 敌人
    ENEMY_SPAWN_INTERVAL: 1.0,
    ENEMY_SPAWN_MIN_DIST: 400,
    ENEMY_SPAWN_MAX_DIST: 600,
    ENEMY_MAX_COUNT: 200,

    // 波次
    WAVE_DURATION: 30,
    BOSS_WAVE_INTERVAL: 5,
    DIFFICULTY_SCALE_PER_WAVE: 0.15,

    // 经验宝石
    GEM_BASE_EXP: 1,
    GEM_MAGNET_SPEED: 600,

    // 战斗
    BATTLE_DURATION: 600,

    // 武器槽
    MAX_WEAPON_SLOTS: 6,
    MAX_PASSIVE_SLOTS: 6,

    // 资源路径
    RES_PATH: {
        PLAYER: 'survivor/player/',
        ENEMIES: 'survivor/enemies/',
        WEAPONS: 'survivor/weapons/',
        GEMS: 'survivor/gems/',
    },
} as const;
