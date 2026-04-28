/**
 * 武器类型接口定义
 * 定义武器的基础接口和相关数据结构
 */

import { BattleContext } from './IEnemyType';

/** 二维向量 */
export interface Vec2 {
    x: number;
    y: number;
}

/**
 * 武器属性
 * 描述武器的数值属性
 */
export interface WeaponAttributes {
    /** 基础伤害 */
    baseDamage: number;
    /** 攻击速度 */
    attackSpeed: number;
    /** 攻击范围 */
    range: number;
    /** 冷却时间（秒） */
    cooldown: number;
    /** 投射物数量（仅投射类武器） */
    projectileCount?: number;
}

/**
 * 武器类型接口
 * 所有武器类型必须实现此接口
 */
export interface IWeaponType {
    /** 类型标识符 */
    typeId: string;
    /** 当前等级 */
    level: number;
    /** 执行攻击 */
    attack(origin: Vec2, direction: Vec2, context: BattleContext): void;
    /** 升级武器 */
    upgrade(): void;
    /** 获取武器属性 */
    getAttributes(): WeaponAttributes;
    /** 每帧更新（处理冷却、弹道等） */
    update(dt: number): void;
}
