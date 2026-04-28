/**
 * 宠物类型接口定义
 * 定义宠物的基础接口和相关数据结构
 */

import { BattleContext } from './IEnemyType';
import { AttributeModifier } from './IItemType';

/**
 * 宠物配置
 * 从配置表加载的宠物初始化数据
 */
export interface PetConfig {
    /** 宠物 ID */
    id: number;
    /** 宠物名称 */
    name: string;
    /** 宠物类型标识 */
    typeId: string;
    /** 基础攻击力 */
    baseAttack: number;
    /** 跟随距离 */
    followDistance: number;
    /** 被动增益效果列表 */
    passiveEffects: AttributeModifier[];
    /** 每级属性成长系数 */
    growthRate: number;
}

/**
 * 宠物显示信息
 * 用于 UI 面板展示宠物信息
 */
export interface PetDisplayInfo {
    /** 宠物名称 */
    name: string;
    /** 宠物描述 */
    description: string;
    /** 图标资源路径 */
    icon: string;
    /** 当前等级 */
    level: number;
    /** 稀有度 */
    rarity: string;
}

/**
 * 宠物类型接口
 * 所有宠物类型必须实现此接口
 */
export interface IPetType {
    /** 类型标识符 */
    typeId: string;
    /** 当前等级 */
    level: number;
    /** 初始化宠物 */
    init(config: PetConfig): void;
    /** 每帧更新（AI 行为） */
    update(dt: number, context: BattleContext): void;
    /** 获取被动增益效果 */
    getPassiveEffects(): AttributeModifier[];
    /** 升级宠物 */
    upgrade(): void;
    /** 获取显示信息 */
    getDisplayInfo(): PetDisplayInfo;
}
