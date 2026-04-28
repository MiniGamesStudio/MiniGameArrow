/**
 * 环绕型武器类型实现
 * 围绕玩家旋转，接触敌人时造成伤害
 */

import { IWeaponType, WeaponAttributes, Vec2 } from '../../Data/Interfaces/IWeaponType';
import { BattleContext } from '../../Data/Interfaces/IEnemyType';

/** 环绕体碰撞半径 */
const ORBIT_HIT_RADIUS = 20;

/**
 * 环绕型武器
 * 围绕玩家旋转的武器，接触敌人时自动造成伤害
 */
export class OrbitWeapon implements IWeaponType {
    readonly typeId: string = 'orbit';
    level: number = 1;

    /** 武器属性 */
    private _attributes: WeaponAttributes = {
        baseDamage: 6,
        attackSpeed: 1.0,
        range: 100,
        cooldown: 0.5,
        projectileCount: 2,
    };
    /** 当前旋转角度（弧度） */
    private _currentAngle: number = 0;
    /** 旋转速度（弧度/秒） */
    private _rotationSpeed: number = Math.PI * 2; // 每秒一圈
    /** 伤害冷却计时器（防止同一敌人被连续命中） */
    private _hitCooldownTimer: number = 0;

    /**
     * 执行攻击
     * 环绕武器为被动攻击，此方法用于手动触发额外效果
     * @param origin 攻击起点（玩家位置）
     * @param direction 攻击方向（环绕武器忽略方向）
     * @param context 战斗上下文
     */
    attack(origin: Vec2, direction: Vec2, context: BattleContext): void {
        // 环绕武器的伤害在 update 中自动处理
        // 此方法可用于触发特殊效果（如加速旋转）
        this._rotationSpeed = Math.PI * 4; // 临时加速旋转
        setTimeout(() => {
            this._rotationSpeed = Math.PI * 2;
        }, 1000);
    }

    /**
     * 升级武器
     * 增加环绕体数量和伤害
     */
    upgrade(): void {
        this.level++;
        this._attributes.baseDamage += 2;

        // 每 2 级增加一个环绕体
        if (this.level % 2 === 0) {
            this._attributes.projectileCount =
                (this._attributes.projectileCount ?? 2) + 1;
        }

        // 每级略微增加环绕半径
        this._attributes.range += 8;
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
     * 更新旋转角度并检测与敌人的碰撞
     * @param dt 帧间隔时间（秒）
     */
    update(dt: number): void {
        // 更新旋转角度
        this._currentAngle += this._rotationSpeed * dt;
        if (this._currentAngle > Math.PI * 2) {
            this._currentAngle -= Math.PI * 2;
        }

        // 更新伤害冷却
        if (this._hitCooldownTimer > 0) {
            this._hitCooldownTimer -= dt;
        }
    }

    /**
     * 获取所有环绕体的当前位置
     * @param playerPosition 玩家位置
     * @returns 环绕体位置列表
     */
    getOrbitPositions(playerPosition: Vec2): Vec2[] {
        const positions: Vec2[] = [];
        const count = this._attributes.projectileCount ?? 2;
        const angleStep = (Math.PI * 2) / count;

        for (let i = 0; i < count; i++) {
            const angle = this._currentAngle + angleStep * i;
            positions.push({
                x: playerPosition.x + Math.cos(angle) * this._attributes.range,
                y: playerPosition.y + Math.sin(angle) * this._attributes.range,
            });
        }

        return positions;
    }

    /**
     * 检测环绕体与敌人的碰撞
     * @param playerPosition 玩家位置
     * @param context 战斗上下文
     * @returns 被命中的敌人索引列表
     */
    checkCollisions(playerPosition: Vec2, context: BattleContext): number[] {
        if (this._hitCooldownTimer > 0) return [];

        const hitIndices: number[] = [];
        const orbitPositions = this.getOrbitPositions(playerPosition);
        const hitRadiusSq = ORBIT_HIT_RADIUS * ORBIT_HIT_RADIUS;

        for (let ei = 0; ei < context.enemyPositions.length; ei++) {
            const enemyPos = context.enemyPositions[ei];

            for (const orbitPos of orbitPositions) {
                const dx = enemyPos.x - orbitPos.x;
                const dy = enemyPos.y - orbitPos.y;
                const distSq = dx * dx + dy * dy;

                if (distSq <= hitRadiusSq) {
                    hitIndices.push(ei);
                    break; // 同一敌人只计一次
                }
            }
        }

        if (hitIndices.length > 0) {
            this._hitCooldownTimer = this._attributes.cooldown;
        }

        return hitIndices;
    }
}
