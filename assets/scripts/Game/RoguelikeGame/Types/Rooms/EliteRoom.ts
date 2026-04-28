/**
 * 精英房间类型实现
 * 类似战斗房间但生成精英敌人，更高难度和更丰厚的奖励
 */

import { IRoomType, RoomContext } from '../../Data/Interfaces/IRoomType';

/** 精英房间默认配置 */
export interface EliteRoomConfig {
    /** 精英敌人生成列表：typeId → 数量 */
    eliteSpawns: Record<string, number>;
    /** 精英敌人数量 */
    eliteCount: number;
    /** 普通护卫敌人数量 */
    guardCount: number;
    /** 难度倍率（相对于普通战斗房间） */
    difficultyMultiplier: number;
    /** 奖励金币基础值 */
    baseGoldReward: number;
    /** 奖励经验基础值 */
    baseExpReward: number;
    /** 稀有掉落概率（0-1） */
    rareLootChance: number;
}

/**
 * 精英房间
 * 生成精英敌人和护卫，击杀后获得更高奖励和稀有掉落
 */
export class EliteRoom implements IRoomType {
    readonly typeId: string = 'elite';

    /** 房间是否已完成初始化 */
    private _initialized: boolean = false;
    /** 总敌人数量 */
    private _totalEnemyCount: number = 0;

    /**
     * 进入房间时的初始化逻辑
     * 生成精英敌人和护卫敌人
     * @param context 房间运行时上下文
     */
    onEnter(context: RoomContext): void {
        if (this._initialized) return;

        const config = context.currentRoom.config as EliteRoomConfig;
        const floorIndex = context.floorIndex;

        // 精英房间的敌人数量随楼层小幅增长
        const eliteCount = config.eliteCount + Math.floor(floorIndex / 3);
        const guardCount = config.guardCount + Math.floor(floorIndex / 2);
        this._totalEnemyCount = eliteCount + guardCount;

        this._initialized = true;

        console.log(
            `[EliteRoom] 进入精英房间，楼层 ${floorIndex}，` +
            `精英 ${eliteCount} 个，护卫 ${guardCount} 个，` +
            `难度倍率 ${config.difficultyMultiplier}x`
        );
    }

    /**
     * 检查房间清除条件
     * 所有敌人（包括精英和护卫）被击杀时视为清除
     * @param context 房间运行时上下文
     * @returns 是否满足清除条件
     */
    checkClearCondition(context: RoomContext): boolean {
        return context.remainingEnemies === 0 && this._initialized;
    }

    /**
     * 房间清除后的奖励逻辑
     * 精英房间给予更高的金币、经验奖励，并有概率掉落稀有物品
     * @param context 房间运行时上下文
     */
    onClear(context: RoomContext): void {
        const config = context.currentRoom.config as EliteRoomConfig;
        const floorMultiplier = 1 + context.floorIndex * 0.3;

        const goldReward = Math.floor(
            config.baseGoldReward * config.difficultyMultiplier * floorMultiplier
        );
        const expReward = Math.floor(
            config.baseExpReward * config.difficultyMultiplier * floorMultiplier
        );

        // 判定稀有掉落
        const hasRareLoot = Math.random() < config.rareLootChance;

        console.log(
            `[EliteRoom] 精英房间清除！奖励：${goldReward} 金币，${expReward} 经验` +
            (hasRareLoot ? '，获得稀有掉落！' : '')
        );

        context.currentRoom.cleared = true;
    }

    /**
     * 获取精英房间默认配置
     * @returns 默认的精英房间配置
     */
    getDefaultConfig(): EliteRoomConfig {
        return {
            eliteSpawns: { elite: 1 },
            eliteCount: 1,
            guardCount: 3,
            difficultyMultiplier: 2.0,
            baseGoldReward: 50,
            baseExpReward: 80,
            rareLootChance: 0.4,
        };
    }
}
