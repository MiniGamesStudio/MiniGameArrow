/**
 * 伤害系统
 * 纯逻辑模块，不依赖 Cocos Creator API
 * 负责伤害计算、伤害应用和击退效果
 */

import { Vec2 } from '../Data/Interfaces/IEnemyType';

/**
 * 伤害结果
 * 描述一次伤害应用后的完整结果信息
 */
export interface DamageResult {
    /** 最终造成的伤害值 */
    finalDamage: number;
    /** 目标是否死亡 */
    targetDead: boolean;
    /** 击退方向（归一化向量） */
    knockbackDirection: Vec2;
    /** 击退力度 */
    knockbackForce: number;
    /** 受击位置 */
    hitPosition: Vec2;
}

/**
 * 伤害目标接口
 * 描述可被伤害系统作用的目标所需的最小属性
 */
export interface DamageTarget {
    hp: number;
    position: Vec2;
}

/**
 * Vec2 工具方法（避免依赖引擎）
 */
function vec2Subtract(a: Vec2, b: Vec2): Vec2 {
    return { x: a.x - b.x, y: a.y - b.y };
}

function vec2Normalize(v: Vec2): Vec2 {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len === 0) {
        return { x: 0, y: 0 };
    }
    return { x: v.x / len, y: v.y / len };
}

function vec2Clone(v: Vec2): Vec2 {
    return { x: v.x, y: v.y };
}

/**
 * 伤害系统
 * 提供伤害计算和伤害应用的静态方法
 */
export class DamageSystem {
    /**
     * 计算最终伤害
     * 公式: max(1, floor(baseDamage * attackMultiplier - targetDefense))
     * @param baseDamage 基础伤害值
     * @param attackMultiplier 攻击倍率
     * @param targetDefense 目标防御力
     * @returns 最终伤害值，最小为 1
     */
    static calculateDamage(
        baseDamage: number,
        attackMultiplier: number,
        targetDefense: number
    ): number {
        return Math.max(1, Math.floor(baseDamage * attackMultiplier - targetDefense));
    }

    /**
     * 应用伤害到目标
     * 扣减目标 HP，计算击退方向和力度
     * @param target 伤害目标（需包含 hp 和 position）
     * @param damage 伤害值
     * @param sourcePosition 伤害来源位置
     * @param knockbackForce 击退力度
     * @returns 伤害结果
     */
    static applyDamage(
        target: DamageTarget,
        damage: number,
        sourcePosition: Vec2,
        knockbackForce: number
    ): DamageResult {
        target.hp -= damage;

        // 计算击退方向：从伤害源指向目标
        const diff = vec2Subtract(target.position, sourcePosition);
        const knockbackDirection = vec2Normalize(diff);

        return {
            finalDamage: damage,
            targetDead: target.hp <= 0,
            knockbackDirection,
            knockbackForce,
            hitPosition: vec2Clone(target.position),
        };
    }
}
