/**
 * 职业技能接口定义
 * 定义职业技能的基础接口
 */

import { BattleContext } from './IEnemyType';

/**
 * 职业技能接口
 * 所有职业技能必须实现此接口
 */
export interface IClassSkill {
    /** 技能唯一标识 */
    skillId: string;
    /** 技能等级 */
    level: number;
    /** 技能冷却时间（秒） */
    cooldown: number;
    /** 当前剩余冷却时间（秒） */
    currentCooldown: number;
    /** 资源消耗 */
    resourceCost: number;
    /** 执行技能 */
    execute(context: BattleContext): void;
    /** 更新冷却计时 */
    updateCooldown(dt: number): void;
    /** 技能是否可用（冷却完毕且资源充足） */
    isReady(): boolean;
    /** 升级技能 */
    upgrade(): void;
}
