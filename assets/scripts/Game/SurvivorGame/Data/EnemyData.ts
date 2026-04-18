/**
 * 敌人类型
 */
export enum EnemyType {
    /** 普通小怪 — 直线追踪 */
    Normal = "Normal",
    /** 快速小怪 — 速度快血量低 */
    Fast = "Fast",
    /** 坦克怪 — 速度慢血量高 */
    Tank = "Tank",
    /** Boss */
    Boss = "Boss",
}

/**
 * 敌人配置
 */
export interface EnemyConfig {
    id: string;
    name: string;
    type: EnemyType;
    hp: number;
    damage: number;
    moveSpeed: number;
    /** 碰撞伤害间隔（秒） */
    attackInterval: number;
    /** 掉落经验值 */
    expDrop: number;
    /** prefab 路径 */
    prefabPath: string;
}

/**
 * 波次配置
 */
export interface WaveConfig {
    /** 波次编号（从 1 开始） */
    waveIndex: number;
    /** 本波持续时间（秒） */
    duration: number;
    /** 生成间隔（秒） */
    spawnInterval: number;
    /** 每次生成数量 */
    spawnCount: number;
    /** 可生成的敌人 ID 列表及权重 */
    enemyPool: Array<{ enemyId: string; weight: number }>;
    /** 是否有 Boss */
    hasBoss: boolean;
    /** Boss 敌人 ID */
    bossId?: string;
}
