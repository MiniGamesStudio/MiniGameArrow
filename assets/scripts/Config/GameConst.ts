import { Vec3 } from 'cc';

/** 游戏常量配置，集中管理所有魔法数字 */
export const GameConst = {
    // 花朵相关
    FLOWER_FLY_SPEED: 1000,
    FLOWER_DISSOLVE_DURATION: 0.5,
    FLOWER_MATCH_COUNT: 3,
    FLOWER_ROTATION_LEFT: new Vec3(0, 0, 30),
    FLOWER_ROTATION_RIGHT: new Vec3(0, 0, -30),
    FLOWER_DRAG_OFFSET_RATIO: 0.6,

    // 加载相关
    LOADING_DURATION: 1,

    // 页面滑动
    PAGE_SCROLL_DURATION: 0.5,

    // 资源路径
    RES_PATH: {
        FLOWERS: 'flowers/',
        LEVEL_DATA: 'levelData/level_',
        UI_PREFIX: 'ui/',
        FLOWER_PLATFORM: 'ui/FlowerPlatform',
    },

    // 关卡
    MAX_LEVEL: 3,
} as const;
