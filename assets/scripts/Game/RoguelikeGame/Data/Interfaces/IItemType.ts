/**
 * 道具类型接口定义
 * 定义被动道具的基础接口和相关数据结构
 */

/**
 * 属性修改器
 * 描述对玩家属性的增益或减益效果
 */
export interface AttributeModifier {
    /** 目标属性名称 */
    attribute: string;
    /** 修改类型：固定值增减 或 百分比增减 */
    modType: 'flat' | 'percent';
    /** 修改数值 */
    value: number;
}

/**
 * 玩家运行时状态（简化引用，避免循环依赖）
 * 完整定义在 Runtime/PlayerController 中
 */
export interface PlayerRuntimeState {
    attributes: {
        hp: number;
        maxHp: number;
        attack: number;
        defense: number;
        moveSpeed: number;
        pickupRange: number;
    };
    gold: number;
    exp: number;
    level: number;
    talentPoints: number;
}

/**
 * 道具类型接口
 * 所有被动道具类型必须实现此接口
 */
export interface IItemType {
    /** 类型标识符 */
    typeId: string;
    /** 当前等级 */
    level: number;
    /** 应用道具效果到玩家 */
    applyEffect(player: PlayerRuntimeState): void;
    /** 移除道具效果 */
    removeEffect(player: PlayerRuntimeState): void;
    /** 升级道具 */
    upgrade(): void;
    /** 获取道具描述 */
    getDescription(): string;
}
