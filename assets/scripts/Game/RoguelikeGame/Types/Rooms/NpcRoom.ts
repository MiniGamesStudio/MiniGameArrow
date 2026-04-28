/**
 * NPC 房间类型实现
 * 进入时生成 NPC，供玩家与 NPC 交互获取服务
 */

import { IRoomType, RoomContext } from '../../Data/Interfaces/IRoomType';

/** NPC 房间默认配置 */
export interface NpcRoomConfig {
    /** 可出现的 NPC 类型 ID 列表 */
    npcTypeIds: string[];
    /** NPC 类型权重映射：npcTypeId → 权重 */
    npcWeights: Record<string, number>;
    /** 是否允许多次交互 */
    allowMultipleInteractions: boolean;
}

/**
 * NPC 房间
 * 非战斗房间，进入后生成 NPC 供玩家交互
 */
export class NpcRoom implements IRoomType {
    readonly typeId: string = 'npc';

    /** 房间是否已完成初始化 */
    private _initialized: boolean = false;
    /** 当前生成的 NPC 类型 ID */
    private _currentNpcTypeId: string | null = null;
    /** 玩家是否已与 NPC 交互 */
    private _interacted: boolean = false;

    /**
     * 进入房间时的初始化逻辑
     * 按权重随机选择一个 NPC 类型并生成
     * @param context 房间运行时上下文
     */
    onEnter(context: RoomContext): void {
        if (this._initialized) {
            console.log(
                `[NpcRoom] 再次进入 NPC 房间，NPC：${this._currentNpcTypeId}`
            );
            return;
        }

        const config = context.currentRoom.config as NpcRoomConfig;

        // 按权重随机选择 NPC 类型
        this._currentNpcTypeId = this._selectNpcByWeight(
            config.npcTypeIds,
            config.npcWeights
        );

        this._initialized = true;

        console.log(
            `[NpcRoom] 进入 NPC 房间，楼层 ${context.floorIndex}，` +
            `NPC 类型：${this._currentNpcTypeId}`
        );
    }

    /**
     * 检查房间清除条件
     * 玩家与 NPC 交互后视为清除
     * @param context 房间运行时上下文
     * @returns 是否满足清除条件
     */
    checkClearCondition(context: RoomContext): boolean {
        return this._interacted;
    }

    /**
     * 房间清除后的奖励逻辑
     * NPC 房间的奖励由 NPC 服务本身决定，此处仅标记清除
     * @param context 房间运行时上下文
     */
    onClear(context: RoomContext): void {
        console.log(`[NpcRoom] NPC 房间已完成`);
        context.currentRoom.cleared = true;
    }

    /**
     * 标记玩家已与 NPC 交互
     */
    markInteracted(): void {
        this._interacted = true;
    }

    /**
     * 获取当前 NPC 类型 ID
     * @returns NPC 类型 ID，未初始化时返回 null
     */
    getCurrentNpcTypeId(): string | null {
        return this._currentNpcTypeId;
    }

    /**
     * 获取 NPC 房间默认配置
     * @returns 默认的 NPC 房间配置
     */
    getDefaultConfig(): NpcRoomConfig {
        return {
            npcTypeIds: ['blacksmith', 'skill_master', 'class_master', 'merchant'],
            npcWeights: {
                blacksmith: 30,
                skill_master: 25,
                class_master: 15,
                merchant: 30,
            },
            allowMultipleInteractions: true,
        };
    }

    /**
     * 按权重随机选择 NPC
     * @param typeIds NPC 类型 ID 列表
     * @param weights 权重映射
     * @returns 选中的 NPC 类型 ID
     */
    private _selectNpcByWeight(
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
