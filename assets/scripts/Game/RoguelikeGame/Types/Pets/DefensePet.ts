/**
 * 防御型宠物类型实现
 * 周期性为玩家生成护盾
 */

import { IPetType, PetConfig, PetDisplayInfo } from '../../Data/Interfaces/IPetType';
import { BattleContext, Vec2 } from '../../Data/Interfaces/IEnemyType';
import { AttributeModifier } from '../../Data/Interfaces/IItemType';

/** 护盾生成间隔（秒） */
const SHIELD_INTERVAL = 5.0;
/** 基础护盾值 */
const BASE_SHIELD_VALUE = 20;

/**
 * 防御型宠物
 * 周期性为玩家生成护盾，提供防御增益
 */
export class DefensePet implements IPetType {
    readonly typeId: string = 'defense';
    level: number = 1;

    /** 宠物名称 */
    private _name: string = '防御宠物';
    /** 基础攻击力（防御宠物攻击力较低） */
    private _baseAttack: number = 3;
    /** 跟随距离 */
    private _followDistance: number = 40;
    /** 被动效果列表 */
    private _passiveEffects: AttributeModifier[] = [];
    /** 每级成长系数 */
    private _growthRate: number = 1.2;
    /** 宠物位置 */
    private _position: Vec2 = { x: 0, y: 0 };
    /** 护盾生成计时器 */
    private _shieldTimer: number = SHIELD_INTERVAL;
    /** 当前护盾值 */
    private _currentShield: number = 0;

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
        this._shieldTimer = SHIELD_INTERVAL;
    }

    /**
     * 每帧更新
     * 跟随玩家移动，周期性生成护盾
     * @param dt 帧间隔时间（秒）
     * @param context 战斗上下文
     */
    update(dt: number, context: BattleContext): void {
        // 跟随玩家
        this._followPlayer(context.playerPosition, dt);

        // 护盾生成计时
        this._shieldTimer -= dt;
        if (this._shieldTimer <= 0) {
            this._generateShield();
            this._shieldTimer = SHIELD_INTERVAL;
        }
    }

    /**
     * 获取被动增益效果
     * 防御型宠物提供防御力和最大生命值加成
     * @returns 属性修改器列表
     */
    getPassiveEffects(): AttributeModifier[] {
        const defenseBonus = 2 * this.level;
        const hpBonus = 5 * this.level;
        return [
            ...this._passiveEffects,
            { attribute: 'defense', modType: 'flat', value: defenseBonus },
            { attribute: 'maxHp', modType: 'flat', value: hpBonus },
        ];
    }

    /**
     * 升级宠物
     * 提升护盾值和被动防御加成
     */
    upgrade(): void {
        this.level++;
    }

    /**
     * 获取显示信息
     * @returns 宠物显示信息
     */
    getDisplayInfo(): PetDisplayInfo {
        return {
            name: this._name,
            description: `每 ${SHIELD_INTERVAL} 秒生成 ${this._getShieldValue()} 点护盾`,
            icon: 'pet_defense',
            level: this.level,
            rarity: this.level >= 5 ? 'rare' : 'common',
        };
    }

    /**
     * 获取当前护盾值
     * @returns 当前护盾值
     */
    getCurrentShield(): number {
        return this._currentShield;
    }

    /**
     * 消耗护盾抵挡伤害
     * @param damage 受到的伤害值
     * @returns 护盾抵挡后剩余的伤害值
     */
    absorbDamage(damage: number): number {
        if (this._currentShield <= 0) return damage;

        if (damage <= this._currentShield) {
            this._currentShield -= damage;
            return 0;
        } else {
            const remaining = damage - this._currentShield;
            this._currentShield = 0;
            return remaining;
        }
    }

    /**
     * 获取当前等级的护盾值
     * @returns 护盾值
     */
    private _getShieldValue(): number {
        return Math.floor(BASE_SHIELD_VALUE * Math.pow(this._growthRate, this.level - 1));
    }

    /**
     * 生成护盾
     */
    private _generateShield(): void {
        const shieldValue = this._getShieldValue();
        this._currentShield += shieldValue;

        // 护盾上限为最大护盾值的 2 倍
        const maxShield = shieldValue * 2;
        if (this._currentShield > maxShield) {
            this._currentShield = maxShield;
        }
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
}
