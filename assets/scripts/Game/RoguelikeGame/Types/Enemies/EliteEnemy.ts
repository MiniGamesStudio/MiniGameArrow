/**
 * 精英敌人类型实现
 * 增强属性和特殊技能的强力敌人
 */

import {
    IEnemyType,
    EnemyConfig,
    EnemyAttributes,
    BattleContext,
    LootDrop,
    Vec2,
} from '../../Data/Interfaces/IEnemyType';

/** 精英敌人属性倍率 */
const ELITE_STAT_MULTIPLIER = 2.0;
/** 精英敌人攻击速度倍率 */
const ELITE_ATTACK_SPEED_MULTIPLIER = 0.75;

/**
 * 精英敌人
 * 拥有增强属性的强力敌人，结合近战追踪和范围攻击
 */
export class EliteEnemy implements IEnemyType {
    readonly typeId: string = 'elite';

    /** 敌人当前属性 */
    private _attributes: EnemyAttributes = {
        hp: 0, maxHp: 0, attack: 0, defense: 0,
        moveSpeed: 0, expDrop: 0, goldDrop: 0,
    };
    /** 敌人位置 */
    private _position: Vec2 = { x: 0, y: 0 };
    /** 攻击范围 */
    private _attackRange: number = 80;
    /** 攻击冷却时间（秒） */
    private _attackCooldown: number = 1.5;
    /** 当前冷却计时器 */
    private _cooldownTimer: number = 0;
    /** 特殊技能冷却时间（秒） */
    private _specialCooldown: number = 8.0;
    /** 特殊技能当前冷却计时器 */
    private _specialCooldownTimer: number = 0;
    /** 是否处于狂暴状态（生命值低于 30% 时触发） */
    private _isEnraged: boolean = false;

    /**
     * 初始化敌人属性
     * 精英敌人的属性在基础配置上乘以精英倍率
     * @param config 敌人配置数据
     */
    init(config: EnemyConfig): void {
        // 应用精英属性倍率
        this._attributes = {
            hp: Math.floor(config.attributes.hp * ELITE_STAT_MULTIPLIER),
            maxHp: Math.floor(config.attributes.maxHp * ELITE_STAT_MULTIPLIER),
            attack: Math.floor(config.attributes.attack * ELITE_STAT_MULTIPLIER),
            defense: Math.floor(config.attributes.defense * ELITE_STAT_MULTIPLIER),
            moveSpeed: config.attributes.moveSpeed,
            expDrop: Math.floor(config.attributes.expDrop * ELITE_STAT_MULTIPLIER),
            goldDrop: Math.floor(config.attributes.goldDrop * ELITE_STAT_MULTIPLIER),
        };
        this._attackRange = config.attackRange * 1.2;
        this._attackCooldown = config.attackCooldown * ELITE_ATTACK_SPEED_MULTIPLIER;
        this._cooldownTimer = 0;
        this._specialCooldownTimer = this._specialCooldown;
        this._isEnraged = false;
    }

    /**
     * AI 行为更新
     * 精英型 AI：追踪玩家，近距离攻击，低血量时进入狂暴状态
     * @param dt 帧间隔时间（秒）
     * @param context 战斗上下文
     */
    updateAI(dt: number, context: BattleContext): void {
        // 更新冷却计时器
        if (this._cooldownTimer > 0) this._cooldownTimer -= dt;
        if (this._specialCooldownTimer > 0) this._specialCooldownTimer -= dt;

        // 检查狂暴状态
        if (!this._isEnraged && this._attributes.hp <= this._attributes.maxHp * 0.3) {
            this._enterEnragedState();
        }

        const dx = context.playerPosition.x - this._position.x;
        const dy = context.playerPosition.y - this._position.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        // 尝试使用特殊技能
        if (this._specialCooldownTimer <= 0 && distanceToPlayer <= this._attackRange * 2) {
            this._useSpecialAttack();
        }

        if (distanceToPlayer <= this._attackRange) {
            this._tryAttack();
        } else {
            // 狂暴状态下移动速度提升
            const speedMultiplier = this._isEnraged ? 1.5 : 1.0;
            this._moveTowards(context.playerPosition, dt, speedMultiplier);
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
     * 精英敌人掉落更多奖励，保证掉落稀有物品
     * @returns 掉落物列表
     */
    onDeath(): LootDrop[] {
        const drops: LootDrop[] = [];

        if (this._attributes.expDrop > 0) {
            drops.push({ type: 'exp_gem', amount: this._attributes.expDrop });
        }

        if (this._attributes.goldDrop > 0) {
            drops.push({ type: 'gold', amount: this._attributes.goldDrop });
        }

        // 精英敌人保证掉落一件稀有道具
        drops.push({
            type: 'item',
            id: 'elite_drop',
            amount: 1,
            rarity: 'rare',
        });

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
     * 进入狂暴状态
     * 攻击力和攻击速度提升
     */
    private _enterEnragedState(): void {
        this._isEnraged = true;
        this._attributes.attack = Math.floor(this._attributes.attack * 1.5);
        this._attackCooldown *= 0.6;
        console.log(`[EliteEnemy] 进入狂暴状态！`);
    }

    /**
     * 使用特殊攻击
     * 范围冲击波攻击
     */
    private _useSpecialAttack(): void {
        this._specialCooldownTimer = this._specialCooldown;
        // 特殊攻击逻辑由 BattleController 统一处理
    }

    /**
     * 尝试执行近战攻击
     */
    private _tryAttack(): void {
        if (this._cooldownTimer > 0) return;
        this._cooldownTimer = this._attackCooldown;
    }

    /**
     * 向目标位置移动
     * @param target 目标位置
     * @param dt 帧间隔时间
     * @param speedMultiplier 速度倍率
     */
    private _moveTowards(target: Vec2, dt: number, speedMultiplier: number = 1.0): void {
        const dx = target.x - this._position.x;
        const dy = target.y - this._position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const speed = this._attributes.moveSpeed * speedMultiplier * dt;
            const ratio = Math.min(speed / distance, 1);
            this._position.x += dx * ratio;
            this._position.y += dy * ratio;
        }
    }
}
