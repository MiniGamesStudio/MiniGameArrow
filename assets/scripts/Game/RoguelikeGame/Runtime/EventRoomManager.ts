/**
 * 事件房间管理器
 * 管理事件池、事件触发和事件选项执行
 * 通过 TypeRegistry<IEventType> 创建事件实例
 */

import { TypeRegistry } from '../../../framework/TypeRegistry';
import { EventManager } from '../../../framework/EventManager';
import {
    IEventType,
    EventContext,
    EventResult,
} from '../Data/Interfaces/IEventType';
import { RoguelikeEvent } from '../RoguelikeEvent';

/**
 * 事件权重配置
 * 描述事件类型的出现权重
 */
export interface EventWeightEntry {
    /** 事件类型 ID */
    typeId: string;
    /** 权重值 */
    weight: number;
}

/**
 * 事件房间管理器
 * 负责事件的随机抽取、选项执行和状态保留
 */
export class EventRoomManager {
    /** 事件类型注册表 */
    private _eventRegistry: TypeRegistry<IEventType>;
    /** 事件权重表（typeId → weight） */
    private _eventWeights: Map<string, number> = new Map();
    /** 当前待处理的事件（支持状态保留） */
    private _pendingEvent: IEventType | null = null;

    /**
     * @param eventRegistry 事件类型注册表
     */
    constructor(eventRegistry: TypeRegistry<IEventType>) {
        this._eventRegistry = eventRegistry;
        this._initDefaultWeights();
    }

    /**
     * 初始化默认权重
     * 为所有已注册事件类型设置默认权重 1
     */
    private _initDefaultWeights(): void {
        for (const typeId of this._eventRegistry.getRegisteredTypes()) {
            this._eventWeights.set(typeId, 1);
        }
    }

    /**
     * 设置事件权重
     * @param typeId 事件类型 ID
     * @param weight 权重值
     */
    setEventWeight(typeId: string, weight: number): void {
        this._eventWeights.set(typeId, Math.max(0, weight));
    }

    /**
     * 批量设置事件权重
     * @param entries 权重配置列表
     */
    setEventWeights(entries: EventWeightEntry[]): void {
        for (const entry of entries) {
            this._eventWeights.set(entry.typeId, Math.max(0, entry.weight));
        }
    }

    /**
     * 触发事件
     * 从已注册事件中按权重随机抽取一个事件
     * @param context 事件上下文
     * @returns 触发的事件实例，若无可用事件则返回 null
     */
    triggerEvent(context: EventContext): IEventType | null {
        // 如果有未完成的待处理事件，直接返回
        if (this._pendingEvent && !this._pendingEvent.isCompleted()) {
            return this._pendingEvent;
        }

        // 收集可用事件（排除本次 Run 已触发的事件）
        const availableTypes: { typeId: string; weight: number }[] = [];

        for (const typeId of this._eventRegistry.getRegisteredTypes()) {
            if (context.triggeredEventIds.includes(typeId)) continue;

            const weight = this._eventWeights.get(typeId) ?? 1;
            if (weight > 0) {
                availableTypes.push({ typeId, weight });
            }
        }

        if (availableTypes.length === 0) {
            // 所有事件已触发过，允许重复触发
            for (const typeId of this._eventRegistry.getRegisteredTypes()) {
                const weight = this._eventWeights.get(typeId) ?? 1;
                if (weight > 0) {
                    availableTypes.push({ typeId, weight });
                }
            }
        }

        if (availableTypes.length === 0) {
            return null;
        }

        // 按权重随机选择
        const selectedTypeId = this._weightedRandomSelect(availableTypes);
        const event = this._eventRegistry.create(selectedTypeId);
        if (!event) {
            return null;
        }

        this._pendingEvent = event;

        EventManager.getInstance().emit(
            RoguelikeEvent.EventTriggered,
            event
        );

        return event;
    }

    /**
     * 执行事件选项
     * @param optionIndex 选项索引
     * @param context 事件上下文
     * @returns 事件执行结果，若无待处理事件则返回 null
     */
    executeOption(optionIndex: number, context: EventContext): EventResult | null {
        if (!this._pendingEvent) {
            console.warn('EventRoomManager: 无待处理的事件');
            return null;
        }

        const options = this._pendingEvent.getOptions(context);
        if (optionIndex < 0 || optionIndex >= options.length) {
            console.warn(`EventRoomManager: 无效的选项索引 [${optionIndex}]`);
            return null;
        }

        const result = this._pendingEvent.executeOption(optionIndex, context);

        EventManager.getInstance().emit(
            RoguelikeEvent.EventOptionSelected,
            optionIndex,
            result
        );

        // 如果事件已完成，清除待处理事件
        if (this._pendingEvent.isCompleted()) {
            this._pendingEvent = null;
        }

        return result;
    }

    /**
     * 获取当前待处理的事件
     * @returns 待处理事件实例，若无则返回 null
     */
    getPendingEvent(): IEventType | null {
        return this._pendingEvent;
    }

    /**
     * 检查是否有未完成的待处理事件
     */
    hasPendingEvent(): boolean {
        return this._pendingEvent !== null && !this._pendingEvent.isCompleted();
    }

    /**
     * 按权重随机选择一个事件类型
     * @param entries 可用事件及权重列表
     * @returns 选中的事件类型 ID
     */
    private _weightedRandomSelect(entries: { typeId: string; weight: number }[]): string {
        const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);

        if (totalWeight <= 0) {
            // 所有权重为 0，随机选择
            return entries[Math.floor(Math.random() * entries.length)].typeId;
        }

        let roll = Math.random() * totalWeight;
        for (const entry of entries) {
            roll -= entry.weight;
            if (roll <= 0) {
                return entry.typeId;
            }
        }

        // 兜底返回最后一个
        return entries[entries.length - 1].typeId;
    }

    /**
     * 清空待处理事件
     */
    clearPendingEvent(): void {
        this._pendingEvent = null;
    }

    /**
     * 重置事件房间管理器
     */
    reset(): void {
        this._pendingEvent = null;
        this._initDefaultWeights();
    }
}
