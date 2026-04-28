/**
 * 范围伤害武器类型实现
 * 以玩家为中心产生圆形范围伤害
 */

import { IWeaponType, WeaponAttributes, Vec2 } from '../../Data/Interfaces/IWeaponType';
import { BattleContext } from '../../Data/Interfaces/IEnemyType';

/**
 * 范围伤害武器（AoE）
 * 周期性在玩家周围产生圆形范围伤害，适合应对大量敌人
 */
export class AoeWeapon implements IWeaponType {
    readonly typeId: string = 'aoe';
    level: number = 1;

    /** 武器属性 */
    private _attributes: WeaponAttributes = {
        baseDamage: 8,
        attackSpeed: 0.5,
        range: 120,
        cooldown: 2.5,
    };
    /** 当前冷却计时器 */
    private _cooldownTimer: number = 0;
    /** 伤害持续时间（秒） */
    private _damageDuration: number = 0.5;
    /** 当前伤害持续计时器 */
    private _damageTimer: number = 0;
    /** 是否正在释放伤害 */
    private _isActive: boolean = false;

    /**
     * 执行攻击
     * 以玩家位置为中心释放圆形范围伤害
     * @param origin 攻击起点（玩家位置）
     * @param direction 攻击方向（AoE 武器忽略方向）
     * @param context 战斗上下文
     */
    attack(origin: Vec2, direction: Vec2, context: BattleContext): void {
        if (this._cooldownTimer > 0) return;

        this._cooldownTimer = this._attributes.cooldown;
        this._isActive = true;
        this._damageTimer = this._damageDuration;

        // 检测范围内的所有敌人
        const hitCount = this._detectEnemiesInRange(origin, context);

        if (hitCount > 0) {
            console.log(
                `[AoeWeapon] 范围攻击命中 ${hitCount} 个敌人，` +
                `范围 ${this._attributes.range}`
            );
        }
    }

    /**
     * 升级武器
     * 提升伤害和范围
     */
    upgrade(): void {
        this.level++;
        this._attributes.baseDamage += 3;
        this._attributes.range += 15;

        // 每 2 级减少冷却时间
        if (this.level % 2 === 0) {
            this._attributes.cooldown = Math.max(1.0, this._attributes.cooldown - 0.3);
        }
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
     * 处理冷却计时和伤害持续效果
     * @param dt 帧间隔时间（秒）
     */
    update(dt: number): void {
        if (this._cooldownTimer > 0) {
            this._cooldownTimer -= dt;
        }

        if (this._isActive) {
            this._damageTimer -= dt;
            if (this._damageTimer <= 0) {
                this._isActive = false;
            }
        }
    }

    /**
     * 获取当前是否正在释放伤害
     * @returns 是否处于活跃状态
     */
    isActive(): boolean {
        return this._isActive;
    }

    /**
     * 检测范围内的敌人数量
     * @param origin 中心位置
     * @param context 战斗上下文
     * @returns 命中的敌人数量
     */
    private _detectEnemiesInRange(origin: Vec2, context: BattleContext): number {
        let hitCount = 0;
        const rangeSq = this._attributes.range * this._attributes.range;

        for (const enemyPos of context.enemyPositions) {
            const dx = enemyPos.x - origin.x;
            const dy = enemyPos.y - origin.y;
            const distSq = dx * dx + dy * dy;

            if (distSq <= rangeSq) {
                hitCount++;
                // 伤害应用由 DamageSystem 统一处理
            }
        }

        return hitCount;
    }
}
