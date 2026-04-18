/**
 * 插花游戏关卡数据模型
 */

/** 单个花槽的花朵配置 */
export interface FlowerSlotData {
    left?: string;
    mid?: string;
    right?: string;
}

/** 关卡 JSON 数据结构 */
export interface FlowerLevelData {
    levelID: number;
    levelName: string;
    FlowerRow: number;
    FlowerPlatform: number[];
    FlowerPot: (number | number[])[];
    FlowerArr: FlowerSlotData[][][][];
}

/** 花朵位置枚举 */
export enum FlowerPosition {
    Left = -1,
    Mid = 0,
    Right = 1,
}

/** 花槽位置名称映射 */
export const SLOT_NAMES: Record<FlowerPosition, string> = {
    [FlowerPosition.Left]: 'Left',
    [FlowerPosition.Mid]: 'Mid',
    [FlowerPosition.Right]: 'Right',
};

/** 每个位置的优先查找顺序 */
export const SLOT_PRIORITY: Record<FlowerPosition, FlowerPosition[]> = {
    [FlowerPosition.Left]:  [FlowerPosition.Left, FlowerPosition.Right, FlowerPosition.Mid],
    [FlowerPosition.Mid]:   [FlowerPosition.Mid, FlowerPosition.Left, FlowerPosition.Right],
    [FlowerPosition.Right]: [FlowerPosition.Right, FlowerPosition.Mid, FlowerPosition.Left],
};
