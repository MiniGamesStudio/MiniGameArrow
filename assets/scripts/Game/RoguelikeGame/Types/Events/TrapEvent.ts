/**
 * 陷阱事件类型实现
 * 对玩家施加负面效果
 */

import {
    IEventType,
    EventDisplayInfo,
    EventOption,
    EventResult,
    EventContext,
} from '../../Data/Interfaces/IEventType';

/**
 * 陷阱事件
 * 玩家触发陷阱，可以选择承受伤害或付出金币来规避
 */
export class TrapEvent implements IEventType {
    readonly typeId: string = 'trap';

    /** 事件是否已完成 */
    private _completed: boolean = false;

    /**
     * 获取事件显示信息
     * @returns 事件显示信息
     */
    getDisplayInfo(): EventDisplayInfo {
        return {
            title: '陷阱房间',
            description: '你不小心触发了一个陷阱！地面开始震动，毒雾弥漫...',
            icon: 'event_trap',
        };
    }

    /**
     * 获取可选操作列表
     * @param context 事件上下文
     * @returns 事件选项列表
     */
    getOptions(context: EventContext): EventOption[] {
        const trapDamage = Math.floor(context.player.attributes.maxHp * 0.2);
        const escapeCost = 30 + context.floorIndex * 10;

        const options: EventOption[] = [
            {
                label: '硬扛过去',
                description: `承受 ${trapDamage} 点伤害`,
                preview: `-${trapDamage} HP`,
            },
            {
                label: '花钱解除',
                description: `支付 ${escapeCost} 金币解除陷阱`,
                cost: { type: 'gold', amount: escapeCost },
                preview: `-${escapeCost} 金币`,
            },
            {
                label: '冒险闪避',
                description: '50% 概率完全闪避，50% 概率受到双倍伤害',
                preview: '50/50 赌博',
            },
        ];

        return options;
    }

    /**
     * 执行选项效果
     * @param optionIndex 选择的选项索引
     * @param context 事件上下文
     * @returns 事件执行结果
     */
    executeOption(optionIndex: number, context: EventContext): EventResult {
        const trapDamage = Math.floor(context.player.attributes.maxHp * 0.2);
        const escapeCost = 30 + context.floorIndex * 10;

        this._completed = true;

        switch (optionIndex) {
            case 0: {
                // 硬扛伤害
                return {
                    success: true,
                    effects: [{ attribute: 'hp', modType: 'flat', value: -trapDamage }],
                    message: `你承受了 ${trapDamage} 点陷阱伤害！`,
                };
            }
            case 1: {
                // 花钱解除
                if (context.player.gold < escapeCost) {
                    this._completed = false;
                    return {
                        success: false,
                        message: `金币不足！需要 ${escapeCost} 金币`,
                    };
                }
                return {
                    success: true,
                    rewards: [{ type: 'gold', amount: -escapeCost }],
                    message: `支付了 ${escapeCost} 金币，安全解除了陷阱`,
                };
            }
            case 2: {
                // 冒险闪避
                const dodgeSuccess = Math.random() < 0.5;
                if (dodgeSuccess) {
                    return {
                        success: true,
                        message: '你灵巧地闪避了陷阱！',
                    };
                } else {
                    const doubleDamage = trapDamage * 2;
                    return {
                        success: true,
                        effects: [{ attribute: 'hp', modType: 'flat', value: -doubleDamage }],
                        message: `闪避失败！受到了 ${doubleDamage} 点双倍伤害！`,
                    };
                }
            }
            default:
                return { success: false, message: '无效的选项' };
        }
    }

    /**
     * 检查事件是否已完成
     * @returns 是否已完成
     */
    isCompleted(): boolean {
        return this._completed;
    }
}
