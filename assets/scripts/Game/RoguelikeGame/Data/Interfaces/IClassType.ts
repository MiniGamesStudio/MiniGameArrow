/**
 * 职业类型接口定义
 * 定义职业的基础接口和相关数据结构
 */

import { AttributeModifier } from './IItemType';
import { IClassSkill } from './IClassSkill';

/**
 * 职业稀有度枚举
 */
export enum ClassRarity {
    /** 普通职业 */
    Common = 'common',
    /** 精英职业 */
    Elite = 'elite',
    /** 传说职业 */
    Legendary = 'legendary',
    /** 隐藏职业 */
    Hidden = 'hidden',
}

/**
 * 玩家属性（职业加成用）
 * 描述职业提供的基础属性加成
 */
export interface PlayerAttributes {
    /** 最大生命值 */
    maxHp: number;
    /** 攻击力 */
    attack: number;
    /** 防御力 */
    defense: number;
    /** 移动速度 */
    moveSpeed: number;
    /** 拾取范围 */
    pickupRange: number;
}

/**
 * 解锁条件
 * 描述职业的解锁要求
 */
export interface UnlockCondition {
    /** 条件类型 */
    type: 'clear_count' | 'kill_count' | 'floor_reached' | 'class_mastery' | 'achievement' | 'default';
    /** 条件目标值 */
    targetValue: number;
    /** 条件描述文本 */
    description: string;
    /** 关联的职业 ID（仅 class_mastery 类型使用） */
    relatedClassId?: string;
    /** 关联的成就 ID（仅 achievement 类型使用） */
    relatedAchievementId?: string;
}

/**
 * 天赋定义
 * 描述天赋树中的单个天赋节点
 */
export interface TalentDef {
    /** 天赋唯一标识 */
    id: string;
    /** 天赋名称 */
    name: string;
    /** 天赋描述 */
    description: string;
    /** 最大等级 */
    maxLevel: number;
    /** 每级提供的属性修改效果 */
    effects: AttributeModifier[];
}

/**
 * 天赋层级定义
 * 描述天赋树中的一个层级
 */
export interface TalentTierDef {
    /** 层级索引（从 0 开始） */
    tierIndex: number;
    /** 该层级包含的天赋列表 */
    talents: TalentDef[];
}

/**
 * 天赋树定义
 * 描述完整的天赋树结构
 */
export interface TalentTreeDef {
    /** 天赋层级列表 */
    tiers: TalentTierDef[];
    /** 解锁下一层需要的当前层已分配天赋数 */
    requiredPerTier: number;
}

/**
 * 职业类型接口
 * 所有职业类型必须实现此接口
 */
export interface IClassType {
    /** 类型标识符 */
    typeId: string;
    /** 职业稀有度 */
    rarity: ClassRarity;
    /** 获取基础属性加成 */
    getBaseAttributes(): Partial<PlayerAttributes>;
    /** 获取天赋树定义 */
    getTalentTree(): TalentTreeDef;
    /** 获取职业技能列表 */
    getSkills(): IClassSkill[];
    /** 获取解锁条件 */
    getUnlockCondition(): UnlockCondition;
}
