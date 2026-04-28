/**
 * 远程敌人类型实现
 * AI 行为：与玩家保持距离，发射投射物攻击
 */

import {
    IEnemyType,
    EnemyConfig,
    EnemyAttributes,
    BattleContext,
    LootDrop,
    Vec2,
} from '../../Data/Interfaces/IEnemyType';

/** 远程敌人期望保持的距离 */
const PREFERRED_DISTANCE = 200;
/** 距离容差范围 */
const DISTANCE_TOLERANCE = 30;

/**
 * 远程敌人
 * 与玩家保持安全距离，周期性发射投射物进行攻击
 */
export class RangedEnemy implements IEnemyType {
    readonly typeId: string = 'ranged';

    /** 敌人当前属性 */
    private _attributes: EnemyAttributes = {
        hp: 0, maxHp: 0, attack: 0, defense: 0,
        moveSpeed: 0, expDrop: 0, goldDrop: 0,
    };
    /** 敌人位置 */
    private _position: Vec2 = { x: 0, y: 0 };
    /** 攻击范围（投射物射程） */
    private _attackRange: number = 300;
    /** 攻击冷却时间（秒） */
    private _attackCooldown: number = 2.0;
    /** 当前冷却计时器 */
    private _cooldownTimer: number = 0;
    /** 投射物速度 */
    private _projectileSpeed: number = 400;

    /**
     * 初始化敌人属性
     * @param config 敌人配置数据
     */
    init(config: EnemyConfig): void {
        this._attributes = { ...config.attributes };
        this._attackRange = config.attackRange;
        this._attackCooldown = config.attackCooldown;
        this._cooldownTimer = 0;
    }

    /**
     * AI 行为更新
     * 远程型 AI：保持与玩家的安全距离，在射程内发射投射物
     * @param dt 帧间隔时间（秒）
     * @param context 战斗上下文
     */
    updateAI(dt: number, context: BattleContext): void {
        // 更新冷却计时器
        if (this._cooldownTimer > 0) {
            this._cooldownTimer -= dt;
        }

        const dx = context.playerPosition.x - this._position.x;
        const dy = context.playerPosition.y - this._position.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        if (distanceToPlayer < PREFERRED_DISTANCE - DISTANCE_TOLERANCE) {
            // 太近了，远离玩家
            this._moveAwayFrom(context.playerPosition, dt);
        } else if (distanceToPlayer > PREFERRED_DISTANCE + DISTANCE_TOLERANCE) {
            // 太远了，靠近玩家
            this._moveTowards(context.playerPosition, dt);
        }

        // 在射程内尝试发射投射物
        if (distanceToPlayer <= this._attackRange) {
            this._tryFireProjectile(context.playerPosition);
        }
    }

    /**
     * 受击回调
     * @param damage 受到的伤害值
     * @param source 伤害来源位置
     */
    onHit(damage: number, source: Vec2): void {
        this._attributes.hp -= damage;
        if (this._attributes.hp < 0) {
            this._attributes.hp = 0;
        }
    }

    /**
     * 死亡回调
     * 远程敌人掉落经验和金币，有小概率掉落道具
     * @returns 掉落物列表
     */
    onDeath(): LootDrop[] {
        const drops: LootDrop[] = [];

        if (this._attributes.expDrop > 0) {
            drops.push({
                type: 'exp_gem',
                amount: this._attributes.expDrop,
            });
        }

        if (this._attributes.goldDrop > 0) {
            drops.push({
                type: 'gold',
                amount: this._attributes.goldDrop,
            });
        }

        // 远程敌人有 10% 概率额外掉落道具
        if (Math.random() < 0.1) {
            drops.push({
                type: 'item',
                id: 'random_item',
                amount: 1,
                rarity: 'common',
            });
        }

        return drops;
    }

    /**
     * 获取当前属性
     * @returns 敌人属性副本
     */
    getAttributes(): EnemyAttributes {
        return { ...this._attributes };
    }

    /**
     * 尝试发射投射物
     * @param targetPosition 目标位置
     */
    private _tryFireProjectile(targetPosition: Vec2): void {
        if (this._cooldownTimer > 0) return;

        this._cooldownTimer = this._attackCooldown;

        // 计算投射物方向
        const dx = targetPosition.x - this._position.x;
        const dy = targetPosition.y - this._position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const _direction: Vec2 = {
                x: dx / distance,
                y: dy / distance,
            };
            // 投射物生成由 BattleController 统一处理
        }
    }

    /**
     * 向目标位置移动
     * @param target 目标位置
     * @param dt 帧间隔时间
     */
    private _moveTowards(target: Vec2, dt: number): void {
        const dx = target.x - this._position.x;
        const dy = target.y - this._position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const speed = this._attributes.moveSpeed * dt;
            const ratio = Math.min(speed / distance, 1);
            this._position.x += dx * ratio;
            this._position.y += dy * ratio;
        }
    }

    /**
     * 远离目标位置移动
     * @param target 要远离的位置
     * @param dt 帧间隔时间
     */
    private _moveAwayFrom(target: Vec2, dt: number): void {
        const dx = this._position.x - target.x;
        const dy = this._position.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const speed = this._attributes.moveSpeed * dt;
            const ratio = Math.min(speed / distance, 1);
            this._position.x += dx * ratio;
            this._position.y += dy * ratio;
        }
    }
}
