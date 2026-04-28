/**
 * 战利品系统
 * 根据敌人属性和楼层深度生成掉落物
 * 纯逻辑模块，不依赖 Cocos Creator
 */

import { EnemyAttributes, LootDrop } from '../Data/Interfaces/IEnemyType';
import { RoguelikeConst } from '../RoguelikeConst';

/**
 * 稀有度定义
 */
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * 稀有度权重配置
 */
interface RarityWeights {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
}

/** 基础稀有度权重 */
const BASE_RARITY_WEIGHTS: RarityWeights = {
    common: 60,
    rare: 25,
    epic: 12,
    legendary: 3,
};

/**
 * 战利品系统
 * 负责根据敌人属性和楼层深度计算掉落物列表
 */
export class LootSystem {
    /**
     * 根据敌人属性和楼层深度生成掉落物列表
     * @param enemyAttributes 被击杀敌人的属性
     * @param floorIndex 当前楼层索引（从 0 开始）
     * @returns 掉落物数组
     */
    static generateLoot(enemyAttributes: EnemyAttributes, floorIndex: number): LootDrop[] {
        const drops: LootDrop[] = [];

        // 1. 经验宝石（必定掉落）
        if (enemyAttributes.expDrop > 0) {
            drops.push({
                type: 'exp_gem',
                amount: enemyAttributes.expDrop,
            });
        }

        // 2. 金币掉落（按概率）
        if (Math.random() < RoguelikeConst.ENEMY_GOLD_DROP_CHANCE) {
            drops.push({
                type: 'gold',
                amount: Math.max(1, enemyAttributes.goldDrop),
            });
        }

        // 3. 武器掉落（低概率，楼层越深概率越高）
        const weaponDropChance = 0.02 + floorIndex * 0.005;
        if (Math.random() < weaponDropChance) {
            const rarity = LootSystem._rollRarity(floorIndex);
            drops.push({
                type: 'weapon',
                amount: 1,
                rarity,
            });
        }

        // 4. 道具掉落（低概率，楼层越深概率越高）
        const itemDropChance = 0.03 + floorIndex * 0.005;
        if (Math.random() < itemDropChance) {
            const rarity = LootSystem._rollRarity(floorIndex);
            drops.push({
                type: 'item',
                amount: 1,
                rarity,
            });
        }

        return drops;
    }

    /**
     * 根据楼层深度调整稀有度权重并随机选择稀有度
     * 楼层越深，高稀有度权重越高
     * @param floorIndex 当前楼层索引
     * @returns 随机选中的稀有度
     */
    private static _rollRarity(floorIndex: number): Rarity {
        const weights = LootSystem._getAdjustedRarityWeights(floorIndex);
        return LootSystem._weightedRandomRarity(weights);
    }

    /**
     * 根据楼层深度调整稀有度权重
     * 每层增加高稀有度权重，降低普通权重
     * @param floorIndex 当前楼层索引
     * @returns 调整后的稀有度权重
     */
    static _getAdjustedRarityWeights(floorIndex: number): RarityWeights {
        const depthBonus = floorIndex * 2;
        return {
            common: Math.max(10, BASE_RARITY_WEIGHTS.common - depthBonus * 2),
            rare: BASE_RARITY_WEIGHTS.rare + depthBonus,
            epic: BASE_RARITY_WEIGHTS.epic + Math.floor(depthBonus * 0.5),
            legendary: BASE_RARITY_WEIGHTS.legendary + Math.floor(depthBonus * 0.2),
        };
    }

    /**
     * 按权重随机选择稀有度
     * @param weights 稀有度权重
     * @returns 选中的稀有度
     */
    private static _weightedRandomRarity(weights: RarityWeights): Rarity {
        const total = weights.common + weights.rare + weights.epic + weights.legendary;
        let roll = Math.random() * total;

        if (roll < weights.common) return 'common';
        roll -= weights.common;

        if (roll < weights.rare) return 'rare';
        roll -= weights.rare;

        if (roll < weights.epic) return 'epic';

        return 'legendary';
    }
}
