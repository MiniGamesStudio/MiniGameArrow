/**
 * 升级选项接口定义
 * 定义升级时可选择的选项接口和相关数据结构
 */

import { PlayerRuntimeState } from './IItemType';

/**
 * 升级选项显示信息
 * 用于 UI 面板展示升级选项
 */
export interface LevelUpDisplayInfo {
    /** 图标资源路径 */
    icon: string;
    /** 选项名称 */
    name: string;
    /** 选项描述 */
    description: string;
    /** 稀有度 */
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * 升级选项接口
 * 所有升级选项类型必须实现此接口
 */
export interface ILevelUpOption {
    /** 类型标识符 */
    typeId: string;
    /** 获取选项显示信息 */
    getDisplayInfo(): LevelUpDisplayInfo;
    /** 应用选项效果到玩家 */
    apply(player: PlayerRuntimeState): void;
    /** 检查是否可用（避免重复选择已满级的选项） */
    isAvailable(player: PlayerRuntimeState): boolean;
    /** 获取权重（影响出现概率） */
    getWeight(player: PlayerRuntimeState): number;
}
