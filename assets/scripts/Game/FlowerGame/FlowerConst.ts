import { Vec3 } from 'cc';

/**
 * 插花游戏常量
 */
export const FlowerConst = {
    FLOWER_FLY_SPEED: 1000,
    FLOWER_DISSOLVE_DURATION: 0.5,
    FLOWER_MATCH_COUNT: 3,
    FLOWER_ROTATION_LEFT: new Vec3(0, 0, 30),
    FLOWER_ROTATION_RIGHT: new Vec3(0, 0, -30),
    FLOWER_DRAG_OFFSET_RATIO: 0.6,

    RES_PATH: {
        FLOWERS: 'flowers/',
        LEVEL_DATA: 'levelData/level_',
        FLOWER_PLATFORM: 'ui/FlowerPlatform',
    },

    MAX_LEVEL: 3,
} as const;
