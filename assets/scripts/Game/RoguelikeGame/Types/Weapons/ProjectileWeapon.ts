/**
 * 投射物武器类型实现
 * 向指定方向发射投射物
 */

import { IWeaponType, WeaponAttributes, Vec2 } from '../../Data/Interfaces/IWeaponType';
import { BattleContext } from '../../Data/Interfaces/IEnemyType';

/** 投射物默认速度 */
const DEFAULT_PROJECTILE_SPEED = 500;

/**
 * 投射物数据
 * 描述一个已发射的投射物
 */
export interface Projectile {
    /** 当前位置 */
    position: Vec2;
    /** 飞行方向（归一化） */
    direction: Vec2;
    /** 飞行速度 */
    speed: number;
    /** 已飞行距离 */
    traveledDistance: number;
    /** 最大飞行距离 */
    maxDistance: number;
    /** 伤害值 */
    damage: number;
}

/**
 * 投射物武器
 * 向指定方向发射弹道投射物，适合远距离攻击
 */
export class ProjectileWeapon implements IWeaponType {
    readonly typeId: string = 'projectile';
    level: number = 1;

    /** 武器属性 */
    private _attributes: WeaponAttributes = {
        baseDamage: 10,
        attackSpeed: 0.8,
        range: 400,
        cooldown: 1.2,
        projectileCount: 1,
    };
    /** 当前冷却计时器 */
    private _cooldownTimer: number = 0;
    /** 活跃的投射物列表 */
    private _projectiles: Projectile[] = [];
    /** 投射物速度 */
    private _projectileSpeed: number = DEFAULT_PROJECTILE_SPEED;

    /**
     * 执行攻击
     * 向指定方向发射投射物
     * @param origin 攻击起点（玩家位置）
     * @param direction 攻击方向（归一化向量）
     * @param context 战斗上下文
     */
    attack(origin: Vec2, direction: Vec2, context: BattleContext): void {
        if (this._cooldownTimer > 0) return;

        this._cooldownTimer = this._attributes.cooldown;

        const count = this._attributes.projectileCount ?? 1;

        if (count === 1) {
            // 单发投射物
            this._spawnProjectile(origin, direction);
        } else {
            // 多发投射物，均匀分布在一定角度范围内
            const spreadAngle = Math.PI / 6; // 30 度总扩散
            const baseAngle = Math.atan2(direction.y, direction.x);
            const step = spreadAngle / (count - 1);
            const startAngle = baseAngle - spreadAngle / 2;

            for (let i = 0; i < count; i++) {
                const angle = startAngle + step * i;
                const dir: Vec2 = {
                    x: Math.cos(angle),
                    y: Math.sin(angle),
                };
                this._spawnProjectile(origin, dir);
            }
        }
    }

    /**
     * 升级武器
     * 提升伤害和投射物数量
     */
    upgrade(): void {
        this.level++;
        this._attributes.baseDamage += 3;

        // 每 3 级增加一个投射物
        if (this.level % 3 === 0) {
            this._attributes.projectileCount =
                (this._attributes.projectileCount ?? 1) + 1;
        }

        // 每级略微减少冷却
        this._attributes.cooldown = Math.max(0.3, this._attributes.cooldown - 0.05);
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
     * 处理冷却计时和投射物飞行
     * @param dt 帧间隔时间（秒）
     */
    update(dt: number): void {
        if (this._cooldownTimer > 0) {
            this._cooldownTimer -= dt;
        }

        // 更新所有投射物位置
        for (let i = this._projectiles.length - 1; i >= 0; i--) {
            const proj = this._projectiles[i];
            const moveDistance = proj.speed * dt;

            proj.position.x += proj.direction.x * moveDistance;
            proj.position.y += proj.direction.y * moveDistance;
            proj.traveledDistance += moveDistance;

            // 超出最大飞行距离则移除
            if (proj.traveledDistance >= proj.maxDistance) {
                this._projectiles.splice(i, 1);
            }
        }
    }

    /**
     * 获取当前活跃的投射物列表
     * @returns 投射物列表副本
     */
    getActiveProjectiles(): Projectile[] {
        return [...this._projectiles];
    }

    /**
     * 生成一个投射物
     * @param origin 起始位置
     * @param direction 飞行方向
     */
    private _spawnProjectile(origin: Vec2, direction: Vec2): void {
        this._projectiles.push({
            position: { x: origin.x, y: origin.y },
            direction: { x: direction.x, y: direction.y },
            speed: this._projectileSpeed,
            traveledDistance: 0,
            maxDistance: this._attributes.range,
            damage: this._attributes.baseDamage,
        });
    }
}
