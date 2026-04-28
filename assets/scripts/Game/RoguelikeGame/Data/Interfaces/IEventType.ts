/**
 * 事件类型接口定义
 * 定义事件房间中随机事件的基础接口和相关数据结构
 */

import { LootDrop } from './IEnemyType';
import { AttributeModifier, PlayerRuntimeState } from './IItemType';

/**
 * 事件显示信息
 * 用于 UI 面板展示事件内容
 */
export interface EventDisplayInfo {
    /** 事件标题 */
    title: string;
    /** 事件描述文本 */
    description: string;
    /** 事件图标资源路径 */
    icon: string;
}

/**
 * 事件选项
 * 描述事件中玩家可选择的操作
 */
export interface EventOption {
    /** 选项标签 */
    label: string;
    /** 选项描述 */
    description: string;
    /** 选项消耗（可选） */
    cost?: {
        /** 消耗类型：金币或生命值 */
        type: 'gold' | 'hp';
        /** 消耗数量 */
        amount: number;
    };
    /** 效果预览文本（可选） */
    preview?: string;
}

/**
 * 事件执行结果
 * 描述选择事件选项后的结果
 */
export interface EventResult {
    /** 是否成功 */
    success: boolean;
    /** 奖励掉落物列表（可选） */
    rewards?: LootDrop[];
    /** 属性修改效果列表（可选） */
    effects?: AttributeModifier[];
    /** 结果描述信息 */
    message: string;
}

/**
 * 事件上下文
 * 提供事件逻辑执行所需的运行时信息
 */
export interface EventContext {
    /** 玩家运行时状态 */
    player: PlayerRuntimeState;
    /** 当前楼层索引 */
    floorIndex: number;
    /** 当前 Run 已触发的事件 ID 列表 */
    triggeredEventIds: string[];
}

/**
 * 事件类型接口
 * 所有事件类型必须实现此接口
 */
export interface IEventType {
    /** 类型标识符 */
    typeId: string;
    /** 获取事件显示信息 */
    getDisplayInfo(): EventDisplayInfo;
    /** 获取可选操作列表 */
    getOptions(context: EventContext): EventOption[];
    /** 执行选项效果 */
    executeOption(optionIndex: number, context: EventContext): EventResult;
    /** 检查事件是否已完成 */
    isCompleted(): boolean;
}
