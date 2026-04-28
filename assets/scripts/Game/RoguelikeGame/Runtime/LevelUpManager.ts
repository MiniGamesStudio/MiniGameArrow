/**
 * 升级管理器
 * 管理升级选项的生成和应用，通过 TypeRegistry<ILevelUpOption> 创建选项实例
 * 使用 EventManager 发送升级相关事件
 */

import { TypeRegistry } from '../../../framework/TypeRegistry';
import { EventManager } from '../../../framework/EventManager';
import { ILevelUpOption } from '../Data/Interfaces/ILevelUpOption';
import { PlayerRuntimeState } from '../Data/Interfaces/IItemType';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { RoguelikeConst } from '../RoguelikeConst';

/**
 * 升级管理器
 * 负责升级选项的随机生成、经验公式计算和选项效果应用
 */
export class LevelUpManager {
    /** 升级选项类型注册表 */
    private _optionRegistry: TypeRegistry<ILevelUpOption>;

    /**
     * @param optionRegistry 升级选项类型注册表
     */
    constructor(optionRegistry: TypeRegistry<ILevelUpOption>) {
        this._optionRegistry = optionRegistry;
    }

    /**
     * 生成升级选项列表
     * 从注册表中按权重随机选择指定数量的可用选项
     * @param player 玩家运行时状态
     * @param count 需要生成的选项数量
     * @returns 随机选中的升级选项数组
     */
    generateChoices(player: PlayerRuntimeState, count: number): ILevelUpOption[] {
        // 获取所有已注册类型并创建实例
        const allTypeIds = this._optionRegistry.getRegisteredTypes();
        const availableOptions: ILevelUpOption[] = [];

        for (const typeId of allTypeIds) {
            const option = this._optionRegistry.create(typeId);
            if (option && option.isAvailable(player)) {
                availableOptions.push(option);
            }
        }

        if (availableOptions.length === 0) {
            return [];
        }

        // 按权重随机选择
        const selected = LevelUpManager._weightedRandomSelect(
            availableOptions,
            player,
            Math.min(count, availableOptions.length)
        );

        EventManager.getInstance().emit(
            RoguelikeEvent.LevelUpChoicesReady,
            selected
        );

        return selected;
    }

    /**
     * 计算指定等级升级所需经验值
     * 公式: BASE_EXP * (EXP_GROWTH_FACTOR ^ currentLevel)
     * @param currentLevel 当前等级
     * @returns 升级所需经验值
     */
    getExpToNextLevel(currentLevel: number): number {
        return Math.floor(
            RoguelikeConst.BASE_EXP_TO_LEVEL *
            Math.pow(RoguelikeConst.EXP_GROWTH_FACTOR, currentLevel)
        );
    }

    /**
     * 应用选中的升级选项效果到玩家
     * @param option 选中的升级选项
     * @param player 玩家运行时状态
     */
    applyChoice(option: ILevelUpOption, player: PlayerRuntimeState): void {
        option.apply(player);

        EventManager.getInstance().emit(
            RoguelikeEvent.LevelUpChoiceSelected,
            option
        );
    }

    /**
     * 按权重随机选择指定数量的选项（不重复）
     * @param options 可用选项列表
     * @param player 玩家运行时状态（用于获取权重）
     * @param count 需要选择的数量
     * @returns 选中的选项数组
     */
    private static _weightedRandomSelect(
        options: ILevelUpOption[],
        player: PlayerRuntimeState,
        count: number
    ): ILevelUpOption[] {
        const selected: ILevelUpOption[] = [];
        const remaining = [...options];

        for (let i = 0; i < count && remaining.length > 0; i++) {
            // 计算总权重
            const totalWeight = remaining.reduce(
                (sum, opt) => sum + Math.max(0, opt.getWeight(player)),
                0
            );

            if (totalWeight <= 0) {
                // 所有权重为 0，随机选择
                const idx = Math.floor(Math.random() * remaining.length);
                selected.push(remaining[idx]);
                remaining.splice(idx, 1);
                continue;
            }

            // 按权重随机选择
            let roll = Math.random() * totalWeight;
            let chosenIndex = 0;

            for (let j = 0; j < remaining.length; j++) {
                const weight = Math.max(0, remaining[j].getWeight(player));
                roll -= weight;
                if (roll <= 0) {
                    chosenIndex = j;
                    break;
                }
            }

            selected.push(remaining[chosenIndex]);
            remaining.splice(chosenIndex, 1);
        }

        return selected;
    }
}
