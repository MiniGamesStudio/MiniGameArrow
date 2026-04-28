/**
 * 攻击型宠物类型实现
 * 自动检测并攻击附近敌人
 */

import { IPetType, PetConfig, PetDisplayInfo } from '../../Data/Interfaces/IPetType';
import { BattleContext, Vec2 } from '../../Data/Interfaces/IEnemyType';
import { AttributeModifier } from '../../Data/Interfaces/IItemType';

/** 攻击型宠物默认攻击范围 */
const DEFAULT_ATTACK_RANGE = 150;
/** 攻击冷却时间（秒） */
const DEFAULT_ATTACK_COOLDOWN = 1.5;

/**
 * 攻击型宠物
 * 自动检测攻击范围内的敌人并发动攻击
 */
export class AttackPet implements IPetType {
    readonly typeId: string = 'attack';
    level: number = 1;

    /** 宠物名称 */
    private _name: string = '攻击宠物';
    /** 基础攻击力 */
    private _baseAttack: number = 10;
    /** 跟随距离 */
    private _followDistance: number = 60;
    /** 被动效果列表 */
    private _passiveEffects: AttributeModifier[] = [];
    /** 每级成长系数 */
    private _growthRate: number = 1.15;
    /** 宠物位置 */
    private _position: Vec2 = { x: 0, y: 0 };
    /** 攻击范围 */
    private _attackRange: number = DEFAULT_ATTACK_RANGE;
    /** 攻击冷却计时器 */
    private _cooldownTimer: number = 0;

    /**
     * 初始化宠物
     * @param config 宠物配置数据
     */
    init(config: PetConfig): void {
        this._name = config.name;
        this._baseAttack = config.baseAttack;
        this._followDistance = config.followDistance;
        this._passiveEffects = [...config.passiveEffects];
        this._growthRate = config.growthRate;
    }

    /**
     * 每帧更新
     * 跟随玩家移动，检测并攻击范围内的敌人
     * @param dt 帧间隔时间（秒）
     * @param context 战斗上下文
     */
    update(dt: number, context: BattleContext): void {
        // 更新冷却计时器
        if (this._cooldownTimer > 0) {
            this._cooldownTimer -= dt;
        }

        // 跟随玩家
        this._followPlayer(context.playerPosition, dt);

        // 寻找最近的敌人并攻击
        const nearestEnemy = this._findNearestEnemy(context);
        if (nearestEnemy && this._cooldownTimer <= 0) {
            this._attackEnemy(nearestEnemy);
        }
    }

    /**
     * 获取被动增益效果
     * 攻击型宠物提供小幅攻击力加成
     * @returns 属性修改器列表
     */
    getPassiveEffects(): AttributeModifier[] {
        const attackBonus = Math.floor(this._baseAttack * 0.1 * this.level);
        return [
            ...this._passiveEffects,
            { attribute: 'attack', modType: 'flat', value: attackBonus },
        ];
    }

    /**
     * 升级宠物
     * 提升攻击力和攻击范围
     */
    upgrade(): void {
        this.level++;
        this._baseAttack = Math.floor(this._baseAttack * this._growthRate);
        this._attackRange += 5;
    }

    /**
     * 获取显示信息
     * @returns 宠物显示信息
     */
    getDisplayInfo(): PetDisplayInfo {
        return {
            name: this._name,
            description: `自动攻击附近敌人，攻击力 ${this._getCurrentAttack()}`,
            icon: 'pet_attack',
            level: this.level,
            rarity: this.level >= 5 ? 'rare' : 'common',
        };
    }

    /**
     * 获取当前攻击力（含等级加成）
     * @returns 当前攻击力
     */
    private _getCurrentAttack(): number {
        return Math.floor(this._baseAttack * Math.pow(this._growthRate, this.level - 1));
    }

    /**
     * 跟随玩家移动
     * @param playerPosition 玩家位置
     * @param dt 帧间隔时间
     */
    private _followPlayer(playerPosition: Vec2, dt: number): void {
        const dx = playerPosition.x - this._position.x;
        const dy = playerPosition.y - this._position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this._followDistance) {
            const speed = 200 * dt;
            const ratio = Math.min(speed / distance, 1);
            this._position.x += dx * ratio;
            this._position.y += dy * ratio;
        }
    }

    /**
     * 寻找最近的敌人
     * @param context 战斗上下文
     * @returns 最近敌人的位置，无敌人时返回 null
     */
    private _findNearestEnemy(context: BattleContext): Vec2 | null {
        let nearest: Vec2 | null = null;
        let minDistSq = this._attackRange * this._attackRange;

        for (const enemyPos of context.enemyPositions) {
            const dx = enemyPos.x - this._position.x;
            const dy = enemyPos.y - this._position.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < minDistSq) {
                minDistSq = distSq;
                nearest = enemyPos;
            }
        }

        return nearest;
    }

    /**
     * 攻击敌人
     * @param targetPosition 目标位置
     */
    private _attackEnemy(targetPosition: Vec2): void {
        this._cooldownTimer = DEFAULT_ATTACK_COOLDOWN;
        // 实际伤害由 DamageSystem 统一处理
    }
}
