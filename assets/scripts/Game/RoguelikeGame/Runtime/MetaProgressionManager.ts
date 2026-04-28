/**
 * 永久成长管理器
 * 管理跨 Run 的永久升级购买和效果应用
 * 通过 ConfigManager 读取升级配置，通过 RoguelikeGameState 持久化数据
 */

import { ConfigManager } from '../../../engine/ConfigManager';
import { EventManager } from '../../../framework/EventManager';
import { PlayerRuntimeState } from '../Data/Interfaces/IItemType';
import { RoguelikeGameState } from '../RoguelikeGameState';
import { RoguelikeEvent } from '../RoguelikeEvent';

/**
 * 永久升级配置
 * 描述一个永久升级项目的配置数据
 */
export interface MetaUpgradeConfig {
    /** 升级项 ID */
    id: string;
    /** 升级名称 */
    name: string;
    /** 升级描述 */
    description: string;
    /** 目标属性名称 */
    attributeType: string;
    /** 每级提供的属性增量 */
    valuePerLevel: number;
    /** 基础费用 */
    baseCost: number;
    /** 每级费用增长 */
    costGrowth: number;
    /** 最大等级 */
    maxLevel: number;
}

/**
 * 永久成长管理器
 * 负责永久升级的购买、费用计算和效果应用
 */
export class MetaProgressionManager {
    /** 配置表名 */
    private static readonly CONFIG_TABLE = 'meta_upgrade';

    /**
     * 购买永久升级
     * 检查金币是否充足，扣除金币，提升升级等级，持久化保存
     * @param upgradeId 升级项 ID
     * @returns 是否购买成功
     */
    purchaseUpgrade(upgradeId: string): boolean {
        const state = RoguelikeGameState.getInstance();
        const config = ConfigManager.getInstance().getById<MetaUpgradeConfig>(
            MetaProgressionManager.CONFIG_TABLE,
            upgradeId
        );
        if (!config) {
            console.warn(`MetaProgressionManager: 未找到升级配置 [${upgradeId}]`);
            return false;
        }

        const currentLevel = state.metaUpgrades.get(upgradeId) ?? 0;

        // 检查是否已达最大等级
        if (currentLevel >= config.maxLevel) {
            console.warn(`MetaProgressionManager: 升级项 [${upgradeId}] 已达最大等级`);
            return false;
        }

        // 计算当前等级的升级费用
        const cost = config.baseCost + config.costGrowth * currentLevel;

        // 检查金币是否充足
        if (state.totalGold < cost) {
            return false;
        }

        // 扣除金币并提升等级
        state.totalGold -= cost;
        state.metaUpgrades.set(upgradeId, currentLevel + 1);
        state.save();

        EventManager.getInstance().emit(
            RoguelikeEvent.MetaUpgradePurchased,
            upgradeId,
            currentLevel + 1
        );

        return true;
    }

    /**
     * 获取指定升级项的当前等级
     * @param upgradeId 升级项 ID
     * @returns 当前等级
     */
    getUpgradeLevel(upgradeId: string): number {
        return RoguelikeGameState.getInstance().metaUpgrades.get(upgradeId) ?? 0;
    }

    /**
     * 获取指定升级项的下一级费用
     * @param upgradeId 升级项 ID
     * @returns 费用，若配置不存在或已满级则返回 -1
     */
    getUpgradeCost(upgradeId: string): number {
        const config = ConfigManager.getInstance().getById<MetaUpgradeConfig>(
            MetaProgressionManager.CONFIG_TABLE,
            upgradeId
        );
        if (!config) return -1;

        const currentLevel = this.getUpgradeLevel(upgradeId);
        if (currentLevel >= config.maxLevel) return -1;

        return config.baseCost + config.costGrowth * currentLevel;
    }

    /**
     * 将所有已购买的永久升级效果应用到玩家初始属性
     * 在每次 Run 开始时调用
     * @param player 玩家运行时状态
     */
    applyToPlayer(player: PlayerRuntimeState): void {
        const state = RoguelikeGameState.getInstance();

        for (const [upgradeId, level] of state.metaUpgrades) {
            if (level <= 0) continue;

            const config = ConfigManager.getInstance().getById<MetaUpgradeConfig>(
                MetaProgressionManager.CONFIG_TABLE,
                upgradeId
            );
            if (!config) continue;

            const attrKey = config.attributeType as keyof typeof player.attributes;
            if (attrKey in player.attributes) {
                (player.attributes as any)[attrKey] += config.valuePerLevel * level;
            }
        }
    }

    /**
     * 重置管理器状态
     */
    reset(): void {
        // MetaProgressionManager 本身无运行时状态，数据由 RoguelikeGameState 管理
    }
}
