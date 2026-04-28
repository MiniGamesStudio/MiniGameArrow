/**
 * NPC 类型接口定义
 * 定义 NPC 的基础接口和相关数据结构
 */

import { PlayerRuntimeState } from './IItemType';

/**
 * NPC 显示信息
 * 用于 UI 面板展示 NPC 信息
 */
export interface NpcDisplayInfo {
    /** NPC 名称 */
    name: string;
    /** NPC 描述 */
    description: string;
    /** 头像图标资源路径 */
    icon: string;
    /** NPC 职能标签 */
    role: string;
}

/**
 * NPC 服务
 * 描述 NPC 提供的一项服务
 */
export interface NpcService {
    /** 服务唯一标识 */
    serviceId: string;
    /** 服务名称 */
    name: string;
    /** 服务描述 */
    description: string;
    /** 服务费用（金币） */
    cost: number;
    /** 是否可用 */
    available: boolean;
    /** 不可用原因（可选） */
    unavailableReason?: string;
}

/**
 * NPC 关系
 * 描述两个 NPC 之间的关系
 */
export interface NpcRelation {
    /** NPC A 的类型 ID */
    npcA: string;
    /** NPC B 的类型 ID */
    npcB: string;
    /** 关系类型：合作、竞争、师徒 */
    relationType: 'cooperation' | 'competition' | 'mentorship';
}

/**
 * NPC 关系网络状态
 * 描述所有 NPC 之间的关系和好感度
 */
export interface NpcNetworkState {
    /** NPC 之间的关系列表 */
    relations: NpcRelation[];
    /** NPC 好感度：npcTypeId → 好感度值 */
    affinities: Map<string, number>;
}

/**
 * NPC 交互上下文
 * 提供 NPC 交互逻辑执行所需的运行时信息
 */
export interface NpcContext {
    /** 玩家运行时状态 */
    player: PlayerRuntimeState;
    /** 当前 NPC 好感度 */
    affinity: number;
    /** NPC 关系网络状态 */
    npcNetwork: NpcNetworkState;
}

/**
 * 服务执行结果
 * 描述 NPC 服务执行后的结果
 */
export interface ServiceResult {
    /** 是否成功 */
    success: boolean;
    /** 结果描述信息 */
    message: string;
    /** 好感度变化量 */
    affinityChange: number;
    /** 金币变化量（负数表示消耗） */
    goldChange: number;
}

/**
 * NPC 类型接口
 * 所有 NPC 类型必须实现此接口
 */
export interface INpcType {
    /** 类型标识符 */
    typeId: string;
    /** 获取 NPC 显示信息 */
    getDisplayInfo(): NpcDisplayInfo;
    /** 获取可用服务列表 */
    getServices(context: NpcContext): NpcService[];
    /** 执行服务 */
    executeService(serviceId: string, context: NpcContext): ServiceResult;
    /** 获取对话内容（根据好感度等级返回不同对话） */
    getDialogue(affinityLevel: number): string[];
}
