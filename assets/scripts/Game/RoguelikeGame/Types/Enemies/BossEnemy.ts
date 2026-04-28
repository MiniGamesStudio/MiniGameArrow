/**
 * Boss 敌人类型实现
 * 多阶段攻击模式的 Boss 敌人
 */

import {
    IEnemyType,
    EnemyConfig,
    EnemyAttributes,
    BattleContext,
    LootDrop,
    Vec2,
} from '../../Data/Interfaces/IEnemyType';

/** Boss 属性倍率 */
const BOSS_STAT_MULTIPLIER = 5.0;

/**
 * Boss 攻击阶段定义
 */
export interface BossPhase {
    /** 阶段名称 */
    name: string;
    /** 攻击模式：近战、远程、范围 */
    attackPattern: 'melee' | 'ranged' | 'aoe';
    /** 攻击冷却时间（秒） */
    attackCooldown: number;
    /** 移动速度倍率 */
    speedMultiplier: number;
    /** 攻击力倍率 */
    attackMultiplier: number;
}

/**
 * Boss 敌人
 * 拥有多阶段攻击模式，根据生命值百分比切换阶段
 */
export class BossEnemy implements IEnemyType {
    readonly typeId: string = 'boss';

    /** 敌人当前属性 */
    private _attributes: EnemyAttributes = {
        hp: 0, maxHp: 0, attack: 0, defense: 0,
        moveSpeed: 0, expDrop: 0, goldDrop: 0,
    };
    /** 敌人位置 */
    private _position: Vec2 = { x: 0, y: 0 };
    /** 攻击范围 */
    private _attackRange: number = 100;
    /** 当前冷却计时器 */
    private _cooldownTimer: number = 0;

    /** Boss 阶段列表 */
    private _phases: BossPhase[] = [
        {
            name: '阶段一：近战猛攻',
            attackPattern: 'melee',
            attackCooldown: 1.2,
            speedMultiplier: 1.0,
            attackMultiplier: 1.0,
        },
        {
            name: '阶段二：远程弹幕',
            attackPattern: 'ranged',
            attackCooldown: 0.8,
            speedMultiplier: 0.8,
            attackMultiplier: 1.3,
        },
        {
            name: '阶段三：狂暴风暴',
            attackPattern: 'aoe',
            attackCooldown: 2.0,
            speedMultiplier: 1.5,
            attackMultiplier: 2.0,
        },
    ];

    /** 阶段切换的生命值百分比阈值（从高到低） */
    private _phaseThresholds: number[] = [1.0, 0.6, 0.3];

    /** 当前阶段索引 */
    private _currentPhase: number = 0;

    /**
     * 初始化敌人属性
     * Boss 属性在基础配置上乘以 Boss 倍率
     * @param config 敌人配置数据
     */
    init(config: EnemyConfig): void {
        this._attributes = {
            hp: Math.floor(config.attributes.hp * BOSS_STAT_MULTIPLIER),
            maxHp: Math.floor(config.attributes.maxHp * BOSS_STAT_MULTIPLIER),
            attack: Math.floor(config.attributes.attack * BOSS_STAT_MULTIPLIER),
            defense: Math.floor(config.attributes.defense * BOSS_STAT_MULTIPLIER),
            moveSpeed: config.attributes.moveSpeed,
            expDrop: Math.floor(config.attributes.expDrop * BOSS_STAT_MULTIPLIER),
            goldDrop: Math.floor(config.attributes.goldDrop * BOSS_STAT_MULTIPLIER),
        };
        this._attackRange = config.attackRange * 1.5;
        this._cooldownTimer = 0;
        this._currentPhase = 0;
    }

    /**
     * AI 行为更新
     * Boss AI：根据当前阶段执行不同的攻击模式
     * @param dt 帧间隔时间（秒）
     * @param context 战斗上下文
     */
    updateAI(dt: number, context: BattleContext): void {
        if (this._cooldownTimer > 0) {
            this._cooldownTimer -= dt;
        }

        // 检查阶段切换
        this._checkPhaseTransition();

        const phase = this._phases[this._currentPhase];
        const dx = context.playerPosition.x - this._position.x;
        const dy = context.playerPosition.y - this._position.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        switch (phase.attackPattern) {
            case 'melee':
                this._executeMeleePhase(context, distanceToPlayer, dt);
                break;
            case 'ranged':
                this._executeRangedPhase(context, distanceToPlayer, dt);
                break;
            case 'aoe':
                this._executeAoePhase(context, distanceToPlayer, dt);
                break;
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
     * Boss 掉落大量奖励，保证掉落史诗级物品
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

        // Boss 保证掉落一件史诗武器
        drops.push({
            type: 'weapon',
            id: 'boss_weapon',
            amount: 1,
            rarity: 'epic',
        });

        // Boss 保证掉落一件稀有道具
        drops.push({
            type: 'item',
            id: 'boss_item',
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
     * 获取当前阶段索引
     * @returns 当前阶段索引
     */
    getCurrentPhase(): number {
        return this._currentPhase;
    }

    /**
     * 检查并执行阶段切换
     */
    private _checkPhaseTransition(): void {
        const hpPercent = this._attributes.hp / this._attributes.maxHp;

        for (let i = this._phases.length - 1; i > this._currentPhase; i--) {
            if (hpPercent <= this._phaseThresholds[i]) {
                this._currentPhase = i;
                console.log(
                    `[BossEnemy] 切换到 ${this._phases[i].name}，` +
                    `剩余生命 ${(hpPercent * 100).toFixed(1)}%`
                );
                break;
            }
        }
    }

    /**
     * 执行近战阶段行为
     */
    private _executeMeleePhase(
        context: BattleContext,
        distance: number,
        dt: number
    ): void {
        const phase = this._phases[this._currentPhase];

        if (distance <= this._attackRange) {
            if (this._cooldownTimer <= 0) {
                this._cooldownTimer = phase.attackCooldown;
                // 近战攻击由 BattleController 处理
            }
        } else {
            this._moveTowards(context.playerPosition, dt, phase.speedMultiplier);
        }
    }

    /**
     * 执行远程阶段行为
     */
    private _executeRangedPhase(
        context: BattleContext,
        distance: number,
        dt: number
    ): void {
        const phase = this._phases[this._currentPhase];
        const preferredDistance = 250;

        if (distance < preferredDistance - 50) {
            this._moveAwayFrom(context.playerPosition, dt, phase.speedMultiplier);
        } else if (distance > preferredDistance + 50) {
            this._moveTowards(context.playerPosition, dt, phase.speedMultiplier);
        }

        if (this._cooldownTimer <= 0) {
            this._cooldownTimer = phase.attackCooldown;
            // 远程弹幕攻击由 BattleController 处理
        }
    }

    /**
     * 执行范围攻击阶段行为
     */
    private _executeAoePhase(
        context: BattleContext,
        distance: number,
        dt: number
    ): void {
        const phase = this._phases[this._currentPhase];

        // 狂暴阶段主动追踪玩家
        this._moveTowards(context.playerPosition, dt, phase.speedMultiplier);

        if (this._cooldownTimer <= 0) {
            this._cooldownTimer = phase.attackCooldown;
            // 范围攻击由 BattleController 处理
        }
    }

    /**
     * 向目标位置移动
     */
    private _moveTowards(target: Vec2, dt: number, speedMultiplier: number): void {
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

    /**
     * 远离目标位置移动
     */
    private _moveAwayFrom(target: Vec2, dt: number, speedMultiplier: number): void {
        const dx = this._position.x - target.x;
        const dy = this._position.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            const speed = this._attributes.moveSpeed * speedMultiplier * dt;
            const ratio = Math.min(speed / distance, 1);
            this._position.x += dx * ratio;
            this._position.y += dy * ratio;
        }
    }
}
