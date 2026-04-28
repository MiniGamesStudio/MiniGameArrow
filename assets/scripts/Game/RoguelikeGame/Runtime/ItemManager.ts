/**
 * 道具管理器
 * 管理玩家已装备的被动道具列表，处理道具的添加、升级和效果应用
 * 通过 TypeRegistry<IItemType> 创建道具实例
 */

import { TypeRegistry } from '../../../framework/TypeRegistry';
import { EventManager } from '../../../framework/EventManager';
import { IItemType, PlayerRuntimeState } from '../Data/Interfaces/IItemType';
import { RoguelikeEvent } from '../RoguelikeEvent';

/**
 * 道具管理器
 * 负责道具的拾取、效果应用和升级
 */
export class ItemManager {
    /** 道具类型注册表 */
    private _itemRegistry: TypeRegistry<IItemType>;
    /** 已装备道具列表 */
    private _equippedItems: IItemType[] = [];

    /**
     * @param itemRegistry 道具类型注册表
     */
    constructor(itemRegistry: TypeRegistry<IItemType>) {
        this._itemRegistry = itemRegistry;
    }

    /**
     * 添加道具并立即应用效果
     * @param typeId 道具类型 ID
     * @param player 玩家运行时状态（用于应用效果）
     * @returns 创建的道具实例，若类型无效则返回 null
     */
    addItem(typeId: string, player: PlayerRuntimeState): IItemType | null {
        // 检查是否已拥有同类型道具，若有则升级
        const existing = this.getItem(typeId);
        if (existing) {
            existing.upgrade();
            // 移除旧效果，重新应用升级后的效果
            existing.removeEffect(player);
            existing.applyEffect(player);

            EventManager.getInstance().emit(
                RoguelikeEvent.ItemPickedUp,
                existing
            );

            return existing;
        }

        // 创建新道具
        const item = this._itemRegistry.create(typeId);
        if (!item) {
            console.warn(`ItemManager: 无法创建道具类型 [${typeId}]`);
            return null;
        }

        this._equippedItems.push(item);
        item.applyEffect(player);

        EventManager.getInstance().emit(
            RoguelikeEvent.ItemPickedUp,
            item
        );

        return item;
    }

    /**
     * 升级已装备的指定类型道具
     * @param typeId 道具类型 ID
     * @returns 是否成功升级
     */
    upgradeItem(typeId: string): boolean {
        const item = this.getItem(typeId);
        if (!item) {
            console.warn(`ItemManager: 未找到已装备的道具类型 [${typeId}]`);
            return false;
        }

        item.upgrade();
        return true;
    }

    /**
     * 根据类型 ID 查找已装备的道具
     * @param typeId 道具类型 ID
     * @returns 道具实例，未找到则返回 null
     */
    getItem(typeId: string): IItemType | null {
        return this._equippedItems.find(i => i.typeId === typeId) ?? null;
    }

    /**
     * 获取所有已装备道具列表
     * @returns 已装备道具数组（只读）
     */
    getEquippedItems(): ReadonlyArray<IItemType> {
        return this._equippedItems;
    }

    /**
     * 获取当前已装备道具数量
     */
    get equippedCount(): number {
        return this._equippedItems.length;
    }

    /**
     * 移除指定类型的道具并取消效果
     * @param typeId 道具类型 ID
     * @param player 玩家运行时状态（用于移除效果）
     * @returns 是否成功移除
     */
    removeItem(typeId: string, player: PlayerRuntimeState): boolean {
        const index = this._equippedItems.findIndex(i => i.typeId === typeId);
        if (index === -1) {
            return false;
        }

        const item = this._equippedItems[index];
        item.removeEffect(player);
        this._equippedItems.splice(index, 1);
        return true;
    }

    /**
     * 清空所有已装备道具
     */
    clear(): void {
        this._equippedItems.length = 0;
    }

    /**
     * 重置道具管理器
     */
    reset(): void {
        this.clear();
    }
}
