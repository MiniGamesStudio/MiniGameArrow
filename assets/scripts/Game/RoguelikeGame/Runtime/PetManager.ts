/**
 * 宠物管理器
 * 管理宠物的激活、替换、AI 更新和被动增益效果
 * 通过 TypeRegistry<IPetType> 创建宠物实例
 */

import { TypeRegistry } from '../../../framework/TypeRegistry';
import { EventManager } from '../../../framework/EventManager';
import { IPetType, PetConfig } from '../Data/Interfaces/IPetType';
import { BattleContext } from '../Data/Interfaces/IEnemyType';
import { AttributeModifier, PlayerRuntimeState } from '../Data/Interfaces/IItemType';
import { RoguelikeEvent } from '../RoguelikeEvent';

/**
 * 宠物管理器
 * 负责宠物的激活、替换、每帧更新和被动增益效果管理
 */
export class PetManager {
    /** 宠物类型注册表 */
    private _petRegistry: TypeRegistry<IPetType>;
    /** 当前激活的宠物 */
    private _currentPet: IPetType | null = null;

    /**
     * @param petRegistry 宠物类型注册表
     */
    constructor(petRegistry: TypeRegistry<IPetType>) {
        this._petRegistry = petRegistry;
    }

    /**
     * 激活宠物
     * 创建宠物实例并初始化
     * @param typeId 宠物类型 ID
     * @param config 宠物配置数据
     * @returns 激活的宠物实例，若类型无效则返回 null
     */
    activatePet(typeId: string, config: PetConfig): IPetType | null {
        const pet = this._petRegistry.create(typeId);
        if (!pet) {
            console.warn(`PetManager: 无法创建宠物类型 [${typeId}]`);
            return null;
        }

        pet.init(config);
        this._currentPet = pet;

        EventManager.getInstance().emit(
            RoguelikeEvent.PetObtained,
            pet
        );

        return pet;
    }

    /**
     * 替换当前宠物
     * 移除旧宠物并激活新宠物
     * @param newTypeId 新宠物类型 ID
     * @param config 新宠物配置数据
     * @returns 新激活的宠物实例，若类型无效则返回 null
     */
    replacePet(newTypeId: string, config: PetConfig): IPetType | null {
        const oldPet = this._currentPet;

        const newPet = this._petRegistry.create(newTypeId);
        if (!newPet) {
            console.warn(`PetManager: 无法创建宠物类型 [${newTypeId}]`);
            return null;
        }

        newPet.init(config);
        this._currentPet = newPet;

        EventManager.getInstance().emit(
            RoguelikeEvent.PetReplaced,
            newPet,
            oldPet
        );

        return newPet;
    }

    /**
     * 每帧更新
     * 更新宠物 AI 行为和被动增益效果
     * @param dt 帧间隔时间（秒）
     * @param context 战斗上下文
     */
    update(dt: number, context: BattleContext): void {
        if (!this._currentPet) return;
        this._currentPet.update(dt, context);
    }

    /**
     * 将当前宠物的被动增益效果应用到玩家
     * @param player 玩家运行时状态
     */
    applyPassiveEffects(player: PlayerRuntimeState): void {
        if (!this._currentPet) return;

        const effects = this._currentPet.getPassiveEffects();
        for (const effect of effects) {
            this._applyModifier(player, effect);
        }
    }

    /**
     * 移除当前宠物的被动增益效果
     * @param player 玩家运行时状态
     */
    removePassiveEffects(player: PlayerRuntimeState): void {
        if (!this._currentPet) return;

        const effects = this._currentPet.getPassiveEffects();
        for (const effect of effects) {
            this._removeModifier(player, effect);
        }
    }

    /**
     * 升级当前宠物
     * @returns 是否成功升级
     */
    upgradePet(): boolean {
        if (!this._currentPet) {
            console.warn('PetManager: 当前没有激活的宠物');
            return false;
        }

        const prevLevel = this._currentPet.level;
        this._currentPet.upgrade();

        if (this._currentPet.level > prevLevel) {
            EventManager.getInstance().emit(
                RoguelikeEvent.PetLevelUp,
                this._currentPet,
                this._currentPet.level
            );
        }

        return true;
    }

    /**
     * 获取当前激活的宠物
     * @returns 宠物实例，若无则返回 null
     */
    getCurrentPet(): IPetType | null {
        return this._currentPet;
    }

    /**
     * 检查是否有激活的宠物
     */
    hasPet(): boolean {
        return this._currentPet !== null;
    }

    /**
     * 应用属性修改器到玩家
     */
    private _applyModifier(player: PlayerRuntimeState, modifier: AttributeModifier): void {
        const attrKey = modifier.attribute as keyof typeof player.attributes;
        if (!(attrKey in player.attributes)) return;

        if (modifier.modType === 'flat') {
            (player.attributes as any)[attrKey] += modifier.value;
        } else if (modifier.modType === 'percent') {
            (player.attributes as any)[attrKey] *= (1 + modifier.value);
        }
    }

    /**
     * 移除属性修改器效果
     */
    private _removeModifier(player: PlayerRuntimeState, modifier: AttributeModifier): void {
        const attrKey = modifier.attribute as keyof typeof player.attributes;
        if (!(attrKey in player.attributes)) return;

        if (modifier.modType === 'flat') {
            (player.attributes as any)[attrKey] -= modifier.value;
        } else if (modifier.modType === 'percent') {
            (player.attributes as any)[attrKey] /= (1 + modifier.value);
        }
    }

    /**
     * 移除当前宠物
     */
    removePet(): void {
        this._currentPet = null;
    }

    /**
     * 清空宠物管理器
     */
    clear(): void {
        this._currentPet = null;
    }

    /**
     * 重置宠物管理器
     */
    reset(): void {
        this.clear();
    }
}
