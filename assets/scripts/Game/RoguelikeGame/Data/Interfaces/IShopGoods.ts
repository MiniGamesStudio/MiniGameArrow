/**
 * 商店商品接口定义
 * 定义商店商品的基础接口和相关数据结构
 */

import { PlayerRuntimeState } from './IItemType';

/**
 * 商店商品实例
 * 描述商店中一个具体的商品
 */
export interface ShopItem {
    /** 商品实例唯一 ID */
    id: string;
    /** 商品类型 ID（对应 IShopGoods.typeId） */
    goodsTypeId: string;
    /** 商品名称 */
    name: string;
    /** 商品描述 */
    description: string;
    /** 价格（金币） */
    price: number;
    /** 稀有度 */
    rarity: string;
    /** 图标资源路径 */
    icon: string;
    /** 是否已被购买 */
    purchased: boolean;
}

/**
 * 随机数生成器接口
 * 用于商品生成时的随机逻辑
 */
export interface RandomGenerator {
    /** 生成 [0, 1) 范围的随机浮点数 */
    next(): number;
    /** 生成 [min, max] 范围的随机整数 */
    nextInt(min: number, max: number): number;
    /** 从数组中随机选取一个元素 */
    pickRandom<T>(array: T[]): T;
}

/**
 * 商店商品类型接口
 * 所有商店商品类型必须实现此接口
 */
export interface IShopGoods {
    /** 类型标识符 */
    typeId: string;
    /** 生成商品实例 */
    generateItem(floorIndex: number, rng: RandomGenerator): ShopItem;
    /** 购买商品，返回是否成功 */
    purchase(item: ShopItem, player: PlayerRuntimeState): boolean;
}
