/**
 * 商店房间类型实现
 * 进入时打开商店界面，供玩家用金币购买武器和道具
 */

import { IRoomType, RoomContext } from '../../Data/Interfaces/IRoomType';

/** 商店房间默认配置 */
export interface ShopRoomConfig {
    /** 商品数量 */
    itemCount: number;
    /** 价格折扣系数（1.0 = 原价） */
    priceMultiplier: number;
    /** 每楼层价格增长系数 */
    priceGrowthPerFloor: number;
    /** 稀有商品出现概率（0-1） */
    rareItemChance: number;
    /** 是否提供生命恢复药剂 */
    hasHealingPotion: boolean;
}

/**
 * 商店房间
 * 非战斗房间，进入后打开商店界面供玩家购买商品
 */
export class ShopRoom implements IRoomType {
    readonly typeId: string = 'shop';

    /** 房间是否已完成初始化 */
    private _initialized: boolean = false;
    /** 商店是否已被访问过 */
    private _shopVisited: boolean = false;

    /**
     * 进入房间时的初始化逻辑
     * 生成商店库存并打开商店界面
     * @param context 房间运行时上下文
     */
    onEnter(context: RoomContext): void {
        const config = context.currentRoom.config as ShopRoomConfig;
        const floorIndex = context.floorIndex;

        if (!this._initialized) {
            // 根据楼层调整价格
            const adjustedPriceMultiplier =
                config.priceMultiplier + floorIndex * config.priceGrowthPerFloor;

            console.log(
                `[ShopRoom] 进入商店房间，楼层 ${floorIndex}，` +
                `商品数量 ${config.itemCount}，` +
                `价格倍率 ${adjustedPriceMultiplier.toFixed(2)}x`
            );

            this._initialized = true;
        } else {
            console.log(`[ShopRoom] 再次进入商店房间`);
        }

        this._shopVisited = true;
    }

    /**
     * 检查房间清除条件
     * 商店房间在玩家访问后即视为清除（无需战斗）
     * @param context 房间运行时上下文
     * @returns 是否满足清除条件
     */
    checkClearCondition(context: RoomContext): boolean {
        return this._shopVisited;
    }

    /**
     * 房间清除后的奖励逻辑
     * 商店房间无额外奖励，仅标记清除
     * @param context 房间运行时上下文
     */
    onClear(context: RoomContext): void {
        console.log(`[ShopRoom] 商店房间已完成`);
        context.currentRoom.cleared = true;
    }

    /**
     * 获取商店房间默认配置
     * @returns 默认的商店房间配置
     */
    getDefaultConfig(): ShopRoomConfig {
        return {
            itemCount: 4,
            priceMultiplier: 1.0,
            priceGrowthPerFloor: 0.15,
            rareItemChance: 0.2,
            hasHealingPotion: true,
        };
    }
}
