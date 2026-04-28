/**
 * 职业管理器
 * 管理职业的解锁、选择、天赋分配和职业切换
 * 通过 TypeRegistry<IClassType> 创建职业实例
 */

import { TypeRegistry } from '../../../framework/TypeRegistry';
import { EventManager } from '../../../framework/EventManager';
import {
    IClassType,
    TalentDef,
    TalentTreeDef,
    UnlockCondition,
} from '../Data/Interfaces/IClassType';
import { PlayerRuntimeState } from '../Data/Interfaces/IItemType';
import { RoguelikeGameState } from '../RoguelikeGameState';
import { RoguelikeEvent } from '../RoguelikeEvent';

/**
 * 天赋分配记录
 * 记录已分配的天赋及其当前等级
 */
export interface TalentAllocation {
    /** 天赋 ID */
    talentId: string;
    /** 已分配等级 */
    level: number;
}

/**
 * 职业管理器
 * 负责职业解锁、选择、天赋分配和职业切换
 */
export class ClassManager {
    /** 职业类型注册表 */
    private _classRegistry: TypeRegistry<IClassType>;
    /** 当前选中的职业实例 */
    private _currentClass: IClassType | null = null;
    /** 当前天赋分配记录（talentId → level） */
    private _talentAllocations: Map<string, number> = new Map();

    /**
     * @param classRegistry 职业类型注册表
     */
    constructor(classRegistry: TypeRegistry<IClassType>) {
        this._classRegistry = classRegistry;
    }

    /**
     * 获取已解锁的职业列表
     * 从 RoguelikeGameState 读取已解锁职业 ID，创建对应实例
     * @returns 已解锁的职业实例列表
     */
    getUnlockedClasses(): IClassType[] {
        const state = RoguelikeGameState.getInstance();
        const classes: IClassType[] = [];

        for (const typeId of state.unlockedClasses) {
            const classType = this._classRegistry.create(typeId);
            if (classType) {
                classes.push(classType);
            }
        }

        return classes;
    }

    /**
     * 选择职业并应用到玩家
     * 应用职业基础属性加成和初始技能
     * @param classTypeId 职业类型 ID
     * @param player 玩家运行时状态
     * @returns 是否成功选择
     */
    selectClass(classTypeId: string, player: PlayerRuntimeState): boolean {
        const classType = this._classRegistry.create(classTypeId);
        if (!classType) {
            console.warn(`ClassManager: 无法创建职业类型 [${classTypeId}]`);
            return false;
        }

        this._currentClass = classType;
        this._talentAllocations.clear();

        // 应用职业基础属性加成
        const baseAttrs = classType.getBaseAttributes();
        for (const [key, value] of Object.entries(baseAttrs)) {
            if (value !== undefined && key in player.attributes) {
                (player.attributes as any)[key] += value;
            }
        }

        EventManager.getInstance().emit(
            RoguelikeEvent.ClassSelected,
            classType
        );

        return true;
    }

    /**
     * 分配天赋点
     * 检查天赋点数、层级解锁条件和最大等级后分配天赋
     * @param talentId 天赋 ID
     * @param player 玩家运行时状态
     * @returns 是否成功分配
     */
    allocateTalent(talentId: string, player: PlayerRuntimeState): boolean {
        if (!this._currentClass) {
            console.warn('ClassManager: 未选择职业');
            return false;
        }

        // 检查天赋点数
        if (player.talentPoints <= 0) {
            return false;
        }

        const talentTree = this._currentClass.getTalentTree();
        const talentInfo = this._findTalent(talentId, talentTree);
        if (!talentInfo) {
            console.warn(`ClassManager: 未找到天赋 [${talentId}]`);
            return false;
        }

        const { talent, tierIndex } = talentInfo;

        // 检查天赋是否已达最大等级
        const currentLevel = this._talentAllocations.get(talentId) ?? 0;
        if (currentLevel >= talent.maxLevel) {
            return false;
        }

        // 检查层级解锁条件：前一层需要分配足够数量的天赋
        if (tierIndex > 0) {
            const prevTierAllocated = this._getAllocatedCountInTier(tierIndex - 1, talentTree);
            if (prevTierAllocated < talentTree.requiredPerTier) {
                return false;
            }
        }

        // 分配天赋
        this._talentAllocations.set(talentId, currentLevel + 1);
        player.talentPoints--;

        // 应用天赋效果
        for (const effect of talent.effects) {
            const attrKey = effect.attribute as keyof typeof player.attributes;
            if (attrKey in player.attributes) {
                if (effect.modType === 'flat') {
                    (player.attributes as any)[attrKey] += effect.value;
                } else if (effect.modType === 'percent') {
                    (player.attributes as any)[attrKey] *= (1 + effect.value);
                }
            }
        }

        EventManager.getInstance().emit(
            RoguelikeEvent.TalentAllocated,
            talentId,
            currentLevel + 1
        );

        return true;
    }

    /**
     * 切换职业
     * 移除旧职业效果、重置天赋树、退还天赋点、应用新职业
     * @param newClassId 新职业类型 ID
     * @param player 玩家运行时状态
     * @returns 是否成功切换
     */
    switchClass(newClassId: string, player: PlayerRuntimeState): boolean {
        if (!this._currentClass) {
            // 没有旧职业，直接选择新职业
            return this.selectClass(newClassId, player);
        }

        // 移除旧职业基础属性加成
        const oldAttrs = this._currentClass.getBaseAttributes();
        for (const [key, value] of Object.entries(oldAttrs)) {
            if (value !== undefined && key in player.attributes) {
                (player.attributes as any)[key] -= value;
            }
        }

        // 移除已分配天赋的效果并退还天赋点
        const oldTalentTree = this._currentClass.getTalentTree();
        let refundedPoints = 0;

        for (const [talentId, level] of this._talentAllocations) {
            const talentInfo = this._findTalent(talentId, oldTalentTree);
            if (talentInfo) {
                // 移除天赋效果（每级效果 × 已分配等级）
                for (let i = 0; i < level; i++) {
                    for (const effect of talentInfo.talent.effects) {
                        const attrKey = effect.attribute as keyof typeof player.attributes;
                        if (attrKey in player.attributes) {
                            if (effect.modType === 'flat') {
                                (player.attributes as any)[attrKey] -= effect.value;
                            } else if (effect.modType === 'percent') {
                                (player.attributes as any)[attrKey] /= (1 + effect.value);
                            }
                        }
                    }
                }
                refundedPoints += level;
            }
        }

        // 退还天赋点
        player.talentPoints += refundedPoints;

        const oldClass = this._currentClass;

        // 应用新职业
        const success = this.selectClass(newClassId, player);
        if (success) {
            EventManager.getInstance().emit(
                RoguelikeEvent.ClassSwitched,
                this._currentClass,
                oldClass
            );
        }

        return success;
    }

    /**
     * 检查并解锁新职业
     * 根据 RoguelikeGameState 中的统计数据检查解锁条件
     * @returns 新解锁的职业 ID 列表
     */
    checkUnlockConditions(): string[] {
        const state = RoguelikeGameState.getInstance();
        const newlyUnlocked: string[] = [];

        for (const typeId of this._classRegistry.getRegisteredTypes()) {
            // 跳过已解锁的职业
            if (state.unlockedClasses.includes(typeId)) continue;

            const classType = this._classRegistry.create(typeId);
            if (!classType) continue;

            const condition = classType.getUnlockCondition();
            if (this._meetsCondition(condition, state)) {
                state.unlockedClasses.push(typeId);
                newlyUnlocked.push(typeId);

                EventManager.getInstance().emit(
                    RoguelikeEvent.ClassUnlocked,
                    typeId
                );
            }
        }

        if (newlyUnlocked.length > 0) {
            state.save();
        }

        return newlyUnlocked;
    }

    /**
     * 获取当前选中的职业
     */
    getCurrentClass(): IClassType | null {
        return this._currentClass;
    }

    /**
     * 获取当前天赋分配记录
     */
    getTalentAllocations(): ReadonlyMap<string, number> {
        return this._talentAllocations;
    }

    /**
     * 在天赋树中查找指定天赋
     * @param talentId 天赋 ID
     * @param tree 天赋树定义
     * @returns 天赋定义和所在层级索引，未找到则返回 null
     */
    private _findTalent(talentId: string, tree: TalentTreeDef): { talent: TalentDef; tierIndex: number } | null {
        for (const tier of tree.tiers) {
            for (const talent of tier.talents) {
                if (talent.id === talentId) {
                    return { talent, tierIndex: tier.tierIndex };
                }
            }
        }
        return null;
    }

    /**
     * 获取指定层级中已分配的天赋总点数
     * @param tierIndex 层级索引
     * @param tree 天赋树定义
     * @returns 已分配的天赋总点数
     */
    private _getAllocatedCountInTier(tierIndex: number, tree: TalentTreeDef): number {
        const tier = tree.tiers.find(t => t.tierIndex === tierIndex);
        if (!tier) return 0;

        let count = 0;
        for (const talent of tier.talents) {
            count += this._talentAllocations.get(talent.id) ?? 0;
        }
        return count;
    }

    /**
     * 检查解锁条件是否满足
     * @param condition 解锁条件
     * @param state 游戏持久化状态
     * @returns 是否满足条件
     */
    private _meetsCondition(condition: UnlockCondition, state: RoguelikeGameState): boolean {
        switch (condition.type) {
            case 'default':
                return true;
            case 'clear_count':
                return state.totalClears >= condition.targetValue;
            case 'kill_count':
                return state.bestKillCount >= condition.targetValue;
            case 'floor_reached':
                return state.bestFloor >= condition.targetValue;
            case 'achievement':
                return condition.relatedAchievementId
                    ? state.achievements.includes(condition.relatedAchievementId)
                    : false;
            case 'class_mastery':
                // 职业精通条件：相关职业已解锁
                return condition.relatedClassId
                    ? state.unlockedClasses.includes(condition.relatedClassId)
                    : false;
            default:
                return false;
        }
    }

    /**
     * 清空职业管理器
     */
    clear(): void {
        this._currentClass = null;
        this._talentAllocations.clear();
    }

    /**
     * 重置职业管理器
     */
    reset(): void {
        this.clear();
    }
}
