/**
 * 角色属性数据
 */
export interface CharacterStats {
    maxHP: number;
    moveSpeed: number;
    /** 拾取范围 */
    pickupRange: number;
    /** 攻击力倍率 */
    attackMultiplier: number;
    /** 冷却缩减倍率（0~1，越小冷却越短） */
    cooldownReduction: number;
    /** 投射物数量加成 */
    projectileBonus: number;
}

/**
 * 角色配置
 */
export interface CharacterConfig {
    id: string;
    name: string;
    /** 初始自带武器 ID */
    startWeaponId: string;
    baseStats: CharacterStats;
    /** prefab 路径 */
    prefabPath: string;
}

/** 默认角色属性 */
export function createDefaultStats(): CharacterStats {
    return {
        maxHP: 100,
        moveSpeed: 200,
        pickupRange: 80,
        attackMultiplier: 1.0,
        cooldownReduction: 1.0,
        projectileBonus: 0,
    };
}
