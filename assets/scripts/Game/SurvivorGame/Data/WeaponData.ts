/**
 * 武器类型
 */
export enum WeaponType {
    /** 环绕型（如圣经） */
    Orbit = "Orbit",
    /** 投射型（如飞刀） */
    Projectile = "Projectile",
    /** 范围型（如大蒜光环） */
    Area = "Area",
    /** 鞭打型（如鞭子，固定方向攻击） */
    Whip = "Whip",
}

/**
 * 单级武器属性
 */
export interface WeaponLevelStats {
    damage: number;
    /** 攻击间隔（秒） */
    cooldown: number;
    /** 投射物数量 */
    projectileCount: number;
    /** 攻击范围/半径 */
    range: number;
    /** 投射物速度 */
    speed: number;
    /** 持续时间（环绕/范围型） */
    duration: number;
    /** 穿透次数（0=不穿透） */
    pierce: number;
}

/**
 * 武器配置
 */
export interface WeaponConfig {
    id: string;
    name: string;
    description: string;
    type: WeaponType;
    /** 最大等级 */
    maxLevel: number;
    /** 每级属性 */
    levels: WeaponLevelStats[];
    /** 图标路径 */
    iconPath: string;
    /** 投射物 prefab 路径 */
    projectilePrefabPath: string;
}

/**
 * 被动道具配置
 */
export interface PassiveConfig {
    id: string;
    name: string;
    description: string;
    maxLevel: number;
    /** 每级效果（key 对应 CharacterStats 的字段名，value 为增量） */
    levels: Array<Record<string, number>>;
    iconPath: string;
}
