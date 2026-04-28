/**
 * 事件房间类型实现
 * 进入时触发事件系统，从事件池中随机抽取事件
 */

import { IRoomType, RoomContext } from '../../Data/Interfaces/IRoomType';

/** 事件房间默认配置 */
export interface EventRoomConfig {
    /** 可触发的事件类型 ID 列表 */
    eventTypeIds: string[];
    /** 事件权重映射：eventTypeId → 权重 */
    eventWeights: Record<string, number>;
    /** 是否允许玩家离开后返回继续交互 */
    allowRevisit: boolean;
}

/**
 * 事件房间
 * 非战斗房间，进入后触发随机事件供玩家选择
 */
export class EventRoom implements IRoomType {
    readonly typeId: string = 'event';

    /** 房间是否已完成初始化 */
    private _initialized: boolean = false;
    /** 当前触发的事件类型 ID */
    private _currentEventTypeId: string | null = null;
    /** 事件是否已完成 */
    private _eventCompleted: boolean = false;

    /**
     * 进入房间时的初始化逻辑
     * 从事件池中按权重随机抽取一个事件
     * @param context 房间运行时上下文
     */
    onEnter(context: RoomContext): void {
        // 允许重新进入未完成的事件房间
        if (this._initialized && !this._eventCompleted) {
            console.log(`[EventRoom] 返回未完成的事件房间，事件：${this._currentEventTypeId}`);
            return;
        }
        if (this._initialized) return;

        const config = context.currentRoom.config as EventRoomConfig;

        // 按权重随机选择事件
        this._currentEventTypeId = this._selectEventByWeight(
            config.eventTypeIds,
            config.eventWeights
        );

        this._initialized = true;

        console.log(
            `[EventRoom] 进入事件房间，触发事件：${this._currentEventTypeId}`
        );
    }

    /**
     * 检查房间清除条件
     * 事件完成后视为清除（无需击杀敌人）
     * @param context 房间运行时上下文
     * @returns 是否满足清除条件
     */
    checkClearCondition(context: RoomContext): boolean {
        return this._eventCompleted;
    }

    /**
     * 房间清除后的奖励逻辑
     * 事件房间的奖励由事件本身决定，此处仅标记清除
     * @param context 房间运行时上下文
     */
    onClear(context: RoomContext): void {
        console.log(`[EventRoom] 事件房间已完成`);
        context.currentRoom.cleared = true;
    }

    /**
     * 标记当前事件为已完成
     */
    completeEvent(): void {
        this._eventCompleted = true;
    }

    /**
     * 获取当前触发的事件类型 ID
     * @returns 事件类型 ID，未初始化时返回 null
     */
    getCurrentEventTypeId(): string | null {
        return this._currentEventTypeId;
    }

    /**
     * 获取事件房间默认配置
     * @returns 默认的事件房间配置
     */
    getDefaultConfig(): EventRoomConfig {
        return {
            eventTypeIds: ['reward', 'trap', 'npc_interact', 'altar'],
            eventWeights: {
                reward: 40,
                trap: 25,
                npc_interact: 20,
                altar: 15,
            },
            allowRevisit: true,
        };
    }

    /**
     * 按权重随机选择事件
     * @param typeIds 事件类型 ID 列表
     * @param weights 权重映射
     * @returns 选中的事件类型 ID
     */
    private _selectEventByWeight(
        typeIds: string[],
        weights: Record<string, number>
    ): string {
        const totalWeight = typeIds.reduce(
            (sum, id) => sum + (weights[id] ?? 1),
            0
        );
        let roll = Math.random() * totalWeight;

        for (const id of typeIds) {
            roll -= weights[id] ?? 1;
            if (roll <= 0) return id;
        }

        return typeIds[typeIds.length - 1];
    }
}
