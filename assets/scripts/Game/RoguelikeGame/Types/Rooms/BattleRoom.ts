/**
 * 战斗房间类型实现
 * 进入时生成敌人，清除条件为所有敌人被击杀，清除后给予奖励
 */

import { IRoomType, RoomContext } from '../../Data/Interfaces/IRoomType';

/** 战斗房间默认配置 */
export interface BattleRoomConfig {
    /** 敌人生成列表：typeId → 数量 */
    enemySpawns: Record<string, number>;
    /** 基础敌人数量 */
    baseEnemyCount: number;
    /** 每楼层增长的敌人数量 */
    enemyGrowthPerFloor: number;
    /** 奖励金币基础值 */
    baseGoldReward: number;
    /** 奖励经验基础值 */
    baseExpReward: number;
}

/**
 * 战斗房间
 * 标准战斗房间：进入时生成普通敌人，击杀所有敌人后清除并获得奖励
 */
export class BattleRoom implements IRoomType {
    readonly typeId: string = 'battle';

    /** 房间内已生成的敌人总数 */
    private _spawnedEnemyCount: number = 0;
    /** 房间是否已完成初始化 */
    private _initialized: boolean = false;

    /**
     * 进入房间时的初始化逻辑
     * 根据楼层索引计算敌人数量并生成敌人
     * @param context 房间运行时上下文
     */
    onEnter(context: RoomContext): void {
        if (this._initialized) return;

        const config = context.currentRoom.config as BattleRoomConfig;
        const floorIndex = context.floorIndex;

        // 根据楼层计算敌人总数
        this._spawnedEnemyCount = config.baseEnemyCount +
            Math.floor(floorIndex * config.enemyGrowthPerFloor);

        this._initialized = true;

        console.log(
            `[BattleRoom] 进入战斗房间，楼层 ${floorIndex}，` +
            `生成 ${this._spawnedEnemyCount} 个敌人`
        );
    }

    /**
     * 检查房间清除条件
     * 所有敌人被击杀时（remainingEnemies === 0）视为清除
     * @param context 房间运行时上下文
     * @returns 是否满足清除条件
     */
    checkClearCondition(context: RoomContext): boolean {
        return context.remainingEnemies === 0 && this._initialized;
    }

    /**
     * 房间清除后的奖励逻辑
     * 根据楼层深度给予金币和经验奖励
     * @param context 房间运行时上下文
     */
    onClear(context: RoomContext): void {
        const config = context.currentRoom.config as BattleRoomConfig;
        const floorMultiplier = 1 + context.floorIndex * 0.2;

        const goldReward = Math.floor(config.baseGoldReward * floorMultiplier);
        const expReward = Math.floor(config.baseExpReward * floorMultiplier);

        console.log(
            `[BattleRoom] 房间清除！奖励：${goldReward} 金币，${expReward} 经验`
        );

        context.currentRoom.cleared = true;
    }

    /**
     * 获取战斗房间默认配置
     * @returns 默认的战斗房间配置
     */
    getDefaultConfig(): BattleRoomConfig {
        return {
            enemySpawns: { melee: 3, ranged: 2 },
            baseEnemyCount: 5,
            enemyGrowthPerFloor: 2,
            baseGoldReward: 20,
            baseExpReward: 30,
        };
    }
}
