/**
 * Boss 房间类型实现
 * 生成 Boss 敌人，击败后开放下一楼层入口
 */

import { IRoomType, RoomContext } from '../../Data/Interfaces/IRoomType';

/** Boss 房间默认配置 */
export interface BossRoomConfig {
    /** Boss 敌人类型 ID */
    bossTypeId: string;
    /** Boss 难度倍率 */
    difficultyMultiplier: number;
    /** 奖励金币基础值 */
    baseGoldReward: number;
    /** 奖励经验基础值 */
    baseExpReward: number;
    /** 是否开放下一楼层入口 */
    opensNextFloor: boolean;
    /** Boss 战前是否锁定房间出口 */
    lockExitsOnEnter: boolean;
}

/**
 * Boss 房间
 * 每层楼的终极挑战，击败 Boss 后开放下一楼层入口
 */
export class BossRoom implements IRoomType {
    readonly typeId: string = 'boss';

    /** 房间是否已完成初始化 */
    private _initialized: boolean = false;
    /** 下一楼层入口是否已开放 */
    private _nextFloorOpened: boolean = false;

    /**
     * 进入房间时的初始化逻辑
     * 生成 Boss 敌人并锁定房间出口
     * @param context 房间运行时上下文
     */
    onEnter(context: RoomContext): void {
        if (this._initialized) return;

        const config = context.currentRoom.config as BossRoomConfig;
        const floorIndex = context.floorIndex;

        this._initialized = true;

        if (config.lockExitsOnEnter) {
            console.log(`[BossRoom] 房间出口已锁定，击败 Boss 后解锁`);
        }

        console.log(
            `[BossRoom] 进入 Boss 房间，楼层 ${floorIndex}，` +
            `Boss 类型：${config.bossTypeId}，` +
            `难度倍率 ${config.difficultyMultiplier}x`
        );
    }

    /**
     * 检查房间清除条件
     * Boss 被击杀时（remainingEnemies === 0）视为清除
     * @param context 房间运行时上下文
     * @returns 是否满足清除条件
     */
    checkClearCondition(context: RoomContext): boolean {
        return context.remainingEnemies === 0 && this._initialized;
    }

    /**
     * 房间清除后的奖励逻辑
     * 给予丰厚奖励并开放下一楼层入口
     * @param context 房间运行时上下文
     */
    onClear(context: RoomContext): void {
        const config = context.currentRoom.config as BossRoomConfig;
        const floorMultiplier = 1 + context.floorIndex * 0.5;

        const goldReward = Math.floor(
            config.baseGoldReward * config.difficultyMultiplier * floorMultiplier
        );
        const expReward = Math.floor(
            config.baseExpReward * config.difficultyMultiplier * floorMultiplier
        );

        console.log(
            `[BossRoom] Boss 击败！奖励：${goldReward} 金币，${expReward} 经验`
        );

        // 开放下一楼层入口
        if (config.opensNextFloor) {
            this._nextFloorOpened = true;
            console.log(`[BossRoom] 下一楼层入口已开放！`);
        }

        context.currentRoom.cleared = true;
    }

    /**
     * 获取下一楼层入口是否已开放
     * @returns 是否已开放
     */
    isNextFloorOpened(): boolean {
        return this._nextFloorOpened;
    }

    /**
     * 获取 Boss 房间默认配置
     * @returns 默认的 Boss 房间配置
     */
    getDefaultConfig(): BossRoomConfig {
        return {
            bossTypeId: 'boss',
            difficultyMultiplier: 3.0,
            baseGoldReward: 100,
            baseExpReward: 200,
            opensNextFloor: true,
            lockExitsOnEnter: true,
        };
    }
}
