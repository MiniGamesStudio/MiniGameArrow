/**
 * 换装管理器
 * 管理装扮的解锁状态和装备状态
 * 装扮为纯装饰性物品，不影响战斗属性
 * 通过 RoguelikeGameState（StorageManager）持久化保存
 */

import { EventManager } from '../../../framework/EventManager';
import { RoguelikeGameState } from '../RoguelikeGameState';
import { RoguelikeEvent } from '../RoguelikeEvent';

/**
 * 装扮部位类型
 */
export type CostumeSlot = 'head' | 'body' | 'effect';

/**
 * 装扮信息
 * 描述一个装扮的基本信息
 */
export interface CostumeInfo {
    /** 装扮 ID */
    id: string;
    /** 装扮名称 */
    name: string;
    /** 装扮描述 */
    description: string;
    /** 装扮部位 */
    slot: CostumeSlot;
    /** 图标资源路径 */
    icon: string;
    /** 是否已解锁 */
    unlocked: boolean;
}

/**
 * 已装备装扮状态
 * 记录每个部位当前装备的装扮 ID
 */
export interface EquippedCostumes {
    /** 头部装扮 ID */
    head: string | null;
    /** 身体装扮 ID */
    body: string | null;
    /** 特效装扮 ID */
    effect: string | null;
}

/**
 * 换装管理器
 * 负责装扮的解锁、装备和持久化管理
 */
export class CostumeManager {
    /** 存储键：已装备装扮 */
    private static readonly EQUIPPED_KEY = 'roguelike_equipped_costumes';

    /** 当前已装备的装扮 */
    private _equipped: EquippedCostumes = {
        head: null,
        body: null,
        effect: null,
    };

    constructor() {
        this._loadEquipped();
    }

    /**
     * 获取已解锁的装扮列表
     * 从 RoguelikeGameState 读取已解锁装扮 ID
     * @returns 已解锁的装扮 ID 列表
     */
    getUnlockedCostumes(): string[] {
        return [...RoguelikeGameState.getInstance().unlockedCostumes];
    }

    /**
     * 装备装扮到指定部位
     * @param costumeId 装扮 ID
     * @param slot 装备部位（head/body/effect）
     * @returns 是否成功装备
     */
    equipCostume(costumeId: string, slot: CostumeSlot): boolean {
        const state = RoguelikeGameState.getInstance();

        // 检查装扮是否已解锁
        if (!state.unlockedCostumes.includes(costumeId)) {
            console.warn(`CostumeManager: 装扮 [${costumeId}] 未解锁`);
            return false;
        }

        this._equipped[slot] = costumeId;
        this._saveEquipped();

        EventManager.getInstance().emit(
            RoguelikeEvent.CostumeEquipped,
            costumeId,
            slot
        );

        return true;
    }

    /**
     * 卸下指定部位的装扮
     * @param slot 装备部位
     */
    unequipCostume(slot: CostumeSlot): void {
        this._equipped[slot] = null;
        this._saveEquipped();
    }

    /**
     * 解锁装扮
     * 将装扮添加到已解锁列表并持久化保存
     * @param costumeId 装扮 ID
     */
    unlockCostume(costumeId: string): void {
        const state = RoguelikeGameState.getInstance();

        if (state.unlockedCostumes.includes(costumeId)) {
            return; // 已解锁，无需重复操作
        }

        state.unlockedCostumes.push(costumeId);
        state.save();

        EventManager.getInstance().emit(
            RoguelikeEvent.CostumeUnlocked,
            costumeId
        );
    }

    /**
     * 获取当前已装备的装扮
     * @returns 各部位已装备的装扮 ID
     */
    getEquippedCostumes(): Readonly<EquippedCostumes> {
        return this._equipped;
    }

    /**
     * 获取指定部位已装备的装扮 ID
     * @param slot 装备部位
     * @returns 装扮 ID，若未装备则返回 null
     */
    getEquippedInSlot(slot: CostumeSlot): string | null {
        return this._equipped[slot];
    }

    /**
     * 检查装扮是否已解锁
     * @param costumeId 装扮 ID
     * @returns 是否已解锁
     */
    isCostumeUnlocked(costumeId: string): boolean {
        return RoguelikeGameState.getInstance().unlockedCostumes.includes(costumeId);
    }

    /**
     * 从持久化存储加载已装备装扮
     */
    private _loadEquipped(): void {
        try {
            const raw = localStorage.getItem(CostumeManager.EQUIPPED_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                this._equipped = {
                    head: data.head ?? null,
                    body: data.body ?? null,
                    effect: data.effect ?? null,
                };
            }
        } catch {
            // 加载失败时使用默认值
        }
    }

    /**
     * 持久化保存已装备装扮
     */
    private _saveEquipped(): void {
        try {
            localStorage.setItem(
                CostumeManager.EQUIPPED_KEY,
                JSON.stringify(this._equipped)
            );
        } catch {
            console.warn('CostumeManager: 保存装备状态失败');
        }
    }

    /**
     * 重置换装管理器
     */
    reset(): void {
        this._equipped = {
            head: null,
            body: null,
            effect: null,
        };
        this._saveEquipped();
    }
}
