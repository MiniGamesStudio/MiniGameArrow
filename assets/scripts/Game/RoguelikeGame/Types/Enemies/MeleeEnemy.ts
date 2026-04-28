/**
 * 近战敌人类型实现
 * AI 行为：追踪玩家并在近距离发动攻击
 */

import {
    IEnemyType,
    EnemyConfig,
    EnemyAttributes,
    BattleContext,
    LootDrop,
    Vec2,
} from '../../Data/Interfaces/IEnemyType';

/**
 * 近战敌人
 * 追踪玩家位置，进入攻击范围后执行近战攻击
 */
export class MeleeEnemy implements IEnemyType {
    readonly typeId: string = 'melee';

    /** 敌人当前属性 */
    private _attributes: EnemyAttributes = {
        hp: 0, maxHp: 0, attack: 0, defense: 0,
        moveSpeed: 0, expDrop: 0, goldDrop: 0,
    };
    /** 敌人位置 */
    private _position: Vec2 = { x: 0, y: 0 };
    /** 攻击范围 */
    private _attackRange: number = 50;
    /** 攻击冷却时间（秒） */
    private _attackCooldown: number = 1.0;
    /** 当前冷却计时器 */
    private _cooldownTimer: number = 0;
    /** 是否正在攻击 */
    private _isAttacking: boolean = false;

    /**
     * 初始化敌人属性
     * @param config 敌人配置数据
     */
    init(config: EnemyConfig): void {
        this._attributes = { ...config.attributes };
        this._attackRange = config.attackRange;
        this._attackCooldown = config.attackCooldown;
        this._cooldownTimer = 0;
        this._isAttacking = false;
    }

    /**
     * AI 行为更新
     * 近战型 AI：计算与玩家的距离，在范围外追踪，在范围内攻击
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

        if (distanceToPlayer <= this._attackRange) {
            // 在攻击范围内，尝试攻击
            this._tryAttack();
        } else {
            // 在攻击范围外，向玩家移动
            this._moveTowards(context.playerPosition, dt);
        }
    }

    /**
     * 受击回调
     * @param damage 受到的伤害值
     * @param source 伤害来源位置
     */
    onHit(damage: number, source: Vec2): void {
        this._attributes.hp -= damage;

        // 受击后短暂中断攻击
        this._isAttacking = false;

        if (this._attributes.hp < 0) {
            this._attributes.hp = 0;
        }
    }

    /**
     * 死亡回调
     * 生成经验宝石和金币掉落
     * @returns 掉落物列表
     */
    onDeath(): LootDrop[] {
        const drops: LootDrop[] = [];

        // 掉落经验宝石
        if (this._attributes.expDrop > 0) {
            drops.push({
                type: 'exp_gem',
                amount: this._attributes.expDrop,
            });
        }

        // 掉落金币
        if (this._attributes.goldDrop > 0) {
            drops.push({
                type: 'gold',
                amount: this._attributes.goldDrop,
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
     * 尝试执行近战攻击
     */
    private _tryAttack(): void {
        if (this._cooldownTimer > 0) return;

        this._isAttacking = true;
        this._cooldownTimer = this._attackCooldown;

        // 攻击逻辑由 DamageSystem 统一处理
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
}
