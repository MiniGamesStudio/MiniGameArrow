/**
 * NPC 管理器
 * 管理 NPC 的生成、交互、好感度和关系网络
 * 通过 TypeRegistry<INpcType> 创建 NPC 实例
 */

import { TypeRegistry } from '../../../framework/TypeRegistry';
import { EventManager } from '../../../framework/EventManager';
import {
    INpcType,
    NpcContext,
    NpcNetworkState,
    NpcRelation,
    ServiceResult,
} from '../Data/Interfaces/INpcType';
import { PlayerRuntimeState } from '../Data/Interfaces/IItemType';
import { RoguelikeGameState } from '../RoguelikeGameState';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { RoguelikeConst } from '../RoguelikeConst';

/**
 * NPC 管理器
 * 负责 NPC 好感度管理、关系网络维护和服务交互
 */
export class NpcManager {
    /** NPC 类型注册表 */
    private _npcRegistry: TypeRegistry<INpcType>;
    /** NPC 关系网络状态 */
    private _network: NpcNetworkState;
    /** 本次 Run 中已遇到的 NPC 类型 ID */
    private _encounteredNpcs: Set<string> = new Set();
    /** 已触发的合作联动奖励（避免重复触发） */
    private _triggeredCooperations: Set<string> = new Set();

    /**
     * @param npcRegistry NPC 类型注册表
     * @param relations NPC 关系定义列表
     */
    constructor(npcRegistry: TypeRegistry<INpcType>, relations: NpcRelation[] = []) {
        this._npcRegistry = npcRegistry;
        this._network = {
            relations,
            affinities: RoguelikeGameState.getInstance().npcAffinities,
        };
    }

    /**
     * 增加 NPC 好感度
     * 增加好感度后检查合作联动奖励
     * @param npcTypeId NPC 类型 ID
     * @param amount 好感度增加量
     */
    addAffinity(npcTypeId: string, amount: number): void {
        const state = RoguelikeGameState.getInstance();
        const current = state.npcAffinities.get(npcTypeId) ?? 0;
        const newValue = Math.max(0, current + amount);
        state.npcAffinities.set(npcTypeId, newValue);
        state.save();

        // 同步到网络状态
        this._network.affinities = state.npcAffinities;

        EventManager.getInstance().emit(
            RoguelikeEvent.NpcAffinityChanged,
            npcTypeId,
            newValue
        );

        // 检查合作联动奖励
        this.checkCooperationRewards(npcTypeId);
    }

    /**
     * 检查合作联动奖励
     * 当合作关系中双方好感度都达到阈值时触发联动奖励
     * @param npcTypeId 触发检查的 NPC 类型 ID
     */
    checkCooperationRewards(npcTypeId: string): void {
        const state = RoguelikeGameState.getInstance();

        for (const relation of this._network.relations) {
            if (relation.relationType !== 'cooperation') continue;
            if (relation.npcA !== npcTypeId && relation.npcB !== npcTypeId) continue;

            // 生成合作关系唯一标识（避免重复触发）
            const cooperationKey = `${relation.npcA}_${relation.npcB}`;
            if (this._triggeredCooperations.has(cooperationKey)) continue;

            const affinityA = state.npcAffinities.get(relation.npcA) ?? 0;
            const affinityB = state.npcAffinities.get(relation.npcB) ?? 0;

            // 双方好感度都达到阈值时触发联动
            if (affinityA >= RoguelikeConst.COOPERATION_THRESHOLD &&
                affinityB >= RoguelikeConst.COOPERATION_THRESHOLD) {
                this._triggeredCooperations.add(cooperationKey);

                EventManager.getInstance().emit(
                    RoguelikeEvent.NpcCooperationReward,
                    relation
                );
            }
        }
    }

    /**
     * 获取竞争关系价格调整系数
     * 与竞争对手交互后，该 NPC 的价格可能上调
     * @param npcTypeId NPC 类型 ID
     * @returns 价格调整系数（1.0 表示无调整）
     */
    getCompetitionPriceModifier(npcTypeId: string): number {
        const state = RoguelikeGameState.getInstance();

        for (const relation of this._network.relations) {
            if (relation.relationType !== 'competition') continue;

            let competitorId: string | null = null;
            if (relation.npcA === npcTypeId) {
                competitorId = relation.npcB;
            } else if (relation.npcB === npcTypeId) {
                competitorId = relation.npcA;
            }

            if (competitorId) {
                const competitorAffinity = state.npcAffinities.get(competitorId) ?? 0;
                // 竞争对手好感度越高，该 NPC 价格越高
                if (competitorAffinity > 0) {
                    return RoguelikeConst.COMPETITION_PRICE_MODIFIER;
                }
            }
        }

        return 1.0;
    }

    /**
     * 与 NPC 交互执行服务
     * @param npcTypeId NPC 类型 ID
     * @param serviceId 服务 ID
     * @param player 玩家运行时状态
     * @returns 服务执行结果，若 NPC 类型无效则返回 null
     */
    interactWithNpc(npcTypeId: string, serviceId: string, player: PlayerRuntimeState): ServiceResult | null {
        const npc = this._npcRegistry.create(npcTypeId);
        if (!npc) {
            console.warn(`NpcManager: 无法创建 NPC 类型 [${npcTypeId}]`);
            return null;
        }

        // 记录已遇到的 NPC
        this._encounteredNpcs.add(npcTypeId);

        // 构建 NPC 交互上下文
        const state = RoguelikeGameState.getInstance();
        const context: NpcContext = {
            player,
            affinity: state.npcAffinities.get(npcTypeId) ?? 0,
            npcNetwork: this._network,
        };

        // 执行服务
        const result = npc.executeService(serviceId, context);

        // 应用好感度变化
        if (result.affinityChange !== 0) {
            this.addAffinity(npcTypeId, result.affinityChange);
        }

        // 应用金币变化
        if (result.goldChange !== 0) {
            player.gold += result.goldChange;
        }

        EventManager.getInstance().emit(
            RoguelikeEvent.NpcServiceUsed,
            npcTypeId,
            serviceId,
            result
        );

        return result;
    }

    /**
     * 获取 NPC 好感度
     * @param npcTypeId NPC 类型 ID
     * @returns 好感度值
     */
    getAffinity(npcTypeId: string): number {
        return RoguelikeGameState.getInstance().npcAffinities.get(npcTypeId) ?? 0;
    }

    /**
     * 获取未遇到的 NPC 类型列表
     * 用于在后续楼层提高这些 NPC 的出现概率
     * @returns 未遇到的 NPC 类型 ID 列表
     */
    getUnencounteredNpcs(): string[] {
        const allTypes = this._npcRegistry.getRegisteredTypes();
        return allTypes.filter(typeId => !this._encounteredNpcs.has(typeId));
    }

    /**
     * 标记已遇到的 NPC
     * @param npcTypeId NPC 类型 ID
     */
    markEncountered(npcTypeId: string): void {
        this._encounteredNpcs.add(npcTypeId);
    }

    /**
     * 获取 NPC 关系网络状态
     */
    getNetworkState(): Readonly<NpcNetworkState> {
        return this._network;
    }

    /**
     * 清空运行时状态（不清除持久化好感度）
     */
    clear(): void {
        this._encounteredNpcs.clear();
        this._triggeredCooperations.clear();
    }

    /**
     * 重置 NPC 管理器
     */
    reset(): void {
        this.clear();
    }
}
