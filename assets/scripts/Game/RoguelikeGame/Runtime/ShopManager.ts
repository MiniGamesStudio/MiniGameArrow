/**
 * 商店管理器
 * 管理商店库存的随机生成和商品购买交易
 * 通过 TypeRegistry<IShopGoods> 创建商品实例
 */

import { TypeRegistry } from '../../../framework/TypeRegistry';
import { EventManager } from '../../../framework/EventManager';
import { IShopGoods, ShopItem, RandomGenerator } from '../Data/Interfaces/IShopGoods';
import { PlayerRuntimeState } from '../Data/Interfaces/IItemType';
import { RoguelikeEvent } from '../RoguelikeEvent';

/**
 * 默认随机数生成器
 * 基于 Math.random 的简单实现
 */
class DefaultRandomGenerator implements RandomGenerator {
    next(): number {
        return Math.random();
    }

    nextInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    pickRandom<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }
}

/**
 * 商店管理器
 * 负责商品库存生成和购买交易流程
 */
export class ShopManager {
    /** 商品类型注册表 */
    private _goodsRegistry: TypeRegistry<IShopGoods>;
    /** 当前商店库存 */
    private _currentInventory: ShopItem[] = [];
    /** 随机数生成器 */
    private _rng: RandomGenerator;

    /**
     * @param goodsRegistry 商品类型注册表
     * @param rng 可选的随机数生成器（用于测试注入）
     */
    constructor(goodsRegistry: TypeRegistry<IShopGoods>, rng?: RandomGenerator) {
        this._goodsRegistry = goodsRegistry;
        this._rng = rng ?? new DefaultRandomGenerator();
    }

    /**
     * 生成商店库存
     * 根据楼层深度随机生成指定数量的商品
     * @param floorIndex 当前楼层索引
     * @param itemCount 商品数量
     * @returns 生成的商品列表
     */
    generateInventory(floorIndex: number, itemCount: number): ShopItem[] {
        const allTypes = this._goodsRegistry.getRegisteredTypes();
        if (allTypes.length === 0) {
            console.warn('ShopManager: 无已注册的商品类型');
            return [];
        }

        const items: ShopItem[] = [];

        for (let i = 0; i < itemCount; i++) {
            const typeId = this._rng.pickRandom(allTypes);
            const goods = this._goodsRegistry.create(typeId);
            if (goods) {
                items.push(goods.generateItem(floorIndex, this._rng));
            }
        }

        this._currentInventory = items;
        return items;
    }

    /**
     * 购买商品
     * 检查金币 → 扣除金币 → 应用商品效果 → 标记已购买
     * @param item 要购买的商品
     * @param player 玩家运行时状态
     * @returns 是否购买成功
     */
    purchaseItem(item: ShopItem, player: PlayerRuntimeState): boolean {
        // 检查商品是否已被购买
        if (item.purchased) {
            console.warn('ShopManager: 该商品已被购买');
            return false;
        }

        // 检查金币是否充足
        if (player.gold < item.price) {
            return false;
        }

        // 通过注册表创建商品类型实例并执行购买逻辑
        const goods = this._goodsRegistry.create(item.goodsTypeId);
        if (!goods) {
            console.warn(`ShopManager: 无法创建商品类型 [${item.goodsTypeId}]`);
            return false;
        }

        const success = goods.purchase(item, player);
        if (success) {
            player.gold -= item.price;
            item.purchased = true;

            EventManager.getInstance().emit(
                RoguelikeEvent.ShopItemPurchased,
                item
            );
        }

        return success;
    }

    /**
     * 获取当前商店库存
     * @returns 商品列表（只读）
     */
    getCurrentInventory(): ReadonlyArray<ShopItem> {
        return this._currentInventory;
    }

    /**
     * 获取当前库存中未购买的商品列表
     * @returns 可购买的商品列表
     */
    getAvailableItems(): ShopItem[] {
        return this._currentInventory.filter(item => !item.purchased);
    }

    /**
     * 清空当前库存
     */
    clear(): void {
        this._currentInventory.length = 0;
    }

    /**
     * 重置商店管理器
     */
    reset(): void {
        this.clear();
    }
}
