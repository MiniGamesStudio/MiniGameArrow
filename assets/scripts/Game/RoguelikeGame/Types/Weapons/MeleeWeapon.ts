/**
 * 近战武器类型实现
 * 扇形范围伤害攻击
 */

import { IWeaponType, WeaponAttributes, Vec2 } from '../../Data/Interfaces/IWeaponType';
import { BattleContext } from '../../Data/Interfaces/IEnemyType';

/** 扇形攻击默认角度（弧度） */
const DEFAULT_SWEEP_ANGLE = Math.PI / 3; // 60 度

/**
 * 近战武器
 * 在玩家面前产生扇形范围伤害，适合近距离战斗
 */
export class MeleeWeapon implements IWeaponType {
    readonly typeId: string = 'melee';
    level: number = 1;

    /** 武器属性 */
    private _attributes: WeaponAttributes = {
        baseDamage: 15,
        attackSpeed: 1.2,
        range: 80,
        cooldown: 0.8,
    };
    /** 当前冷却计时器 */
    private _cooldownTimer: number = 0;
    /** 扇形攻击角度（弧度） */
    private _sweepAngle: number = DEFAULT_SWEEP_ANGLE;

    /**
     * 执行攻击
     * 在指定方向产生扇形范围伤害
     * @param origin 攻击起点（玩家位置）
     * @param direction 攻击方向（归一化向量）
     * @param context 战斗上下文
     */
    attack(origin: Vec2, direction: Vec2, context: BattleContext): void {
        if (this._cooldownTimer > 0) return;

        this._cooldownTimer = this._attributes.cooldown;

        // 计算扇形范围内的敌人
        const attackAngle = Math.atan2(direction.y, direction.x);
        const halfSweep = this._sweepAngle / 2;

        for (const enemyPos of context.enemyPositions) {
            const dx = enemyPos.x - origin.x;
            const dy = enemyPos.y - origin.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 检查是否在攻击范围内
            if (distance > this._attributes.range) continue;

            // 检查是否在扇形角度内
            const angleToEnemy = Math.atan2(dy, dx);
            let angleDiff = angleToEnemy - attackAngle;

            // 归一化角度差到 [-PI, PI]
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            if (Math.abs(angleDiff) <= halfSweep) {
                // 命中敌人，伤害由 DamageSystem 统一计算
            }
        }
    }

    /**
     * 升级武器
     * 提升伤害、范围和扇形角度
     */
    upgrade(): void {
        this.level++;
        this._attributes.baseDamage += 5;
        this._attributes.range += 10;
        this._sweepAngle = Math.min(
            this._sweepAngle + Math.PI / 18, // 每级增加 10 度
            Math.PI // 最大 180 度
        );
    }

    /**
     * 获取武器属性
     * @returns 武器属性副本
     */
    getAttributes(): WeaponAttributes {
        return { ...this._attributes };
    }

    /**
     * 每帧更新
     * 处理冷却计时
     * @param dt 帧间隔时间（秒）
     */
    update(dt: number): void {
        if (this._cooldownTimer > 0) {
            this._cooldownTimer -= dt;
        }
    }
}
