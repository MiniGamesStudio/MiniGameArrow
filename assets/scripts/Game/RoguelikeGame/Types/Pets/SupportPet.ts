/**
 * 辅助型宠物类型实现
 * 提供持续的被动增益效果
 */

import { IPetType, PetConfig, PetDisplayInfo } from '../../Data/Interfaces/IPetType';
import { BattleContext, Vec2 } from '../../Data/Interfaces/IEnemyType';
import { AttributeModifier } from '../../Data/Interfaces/IItemType';

/**
 * 辅助型宠物
 * 不主动攻击，为玩家提供持续的被动属性增益和拾取范围扩大
 */
export class SupportPet implements IPetType {
    readonly typeId: string = 'support';
    level: number = 1;

    /** 宠物名称 */
    private _name: string = '辅助宠物';
    /** 基础攻击力（辅助宠物无攻击行为） */
    private _baseAttack: number = 0;
    /** 跟随距离 */
    private _followDistance: number = 50;
    /** 配置中的被动效果列表 */
    private _passiveEffects: AttributeModifier[] = [];
    /** 每级成长系数 */
    private _growthRate: number = 1.1;
    /** 宠物位置 */
    private _position: Vec2 = { x: 0, y: 0 };
    /** 增益刷新计时器 */
    private _buffRefreshTimer: number = 0;
    /** 增益刷新间隔（秒） */
    private _buffRefreshInterval: number = 10.0;

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
     * 跟随玩家移动，周期性刷新增益效果
     * @param dt 帧间隔时间（秒）
     * @param context 战斗上下文
     */
    update(dt: number, context: BattleContext): void {
        // 跟随玩家
        this._followPlayer(context.playerPosition, dt);

        // 增益刷新计时
        this._buffRefreshTimer -= dt;
        if (this._buffRefreshTimer <= 0) {
            this._buffRefreshTimer = this._buffRefreshInterval;
            // 增益效果通过 getPassiveEffects 持续生效
        }
    }

    /**
     * 获取被动增益效果
     * 辅助型宠物提供全面的属性增益：移动速度、拾取范围、经验加成
     * @returns 属性修改器列表
     */
    getPassiveEffects(): AttributeModifier[] {
        const speedBonus = 5 * this.level;
        const pickupBonus = 10 * this.level;
        const expBonusPercent = 0.05 * this.level; // 每级 5% 经验加成

        return [
            ...this._passiveEffects,
            { attribute: 'moveSpeed', modType: 'flat', value: speedBonus },
            { attribute: 'pickupRange', modType: 'flat', value: pickupBonus },
            { attribute: 'exp', modType: 'percent', value: expBonusPercent },
        ];
    }

    /**
     * 升级宠物
     * 提升被动增益效果数值
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
            description:
                `被动增益：移动速度 +${5 * this.level}，` +
                `拾取范围 +${10 * this.level}，` +
                `经验 +${5 * this.level}%`,
            icon: 'pet_support',
            level: this.level,
            rarity: this.level >= 5 ? 'rare' : 'common',
        };
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
