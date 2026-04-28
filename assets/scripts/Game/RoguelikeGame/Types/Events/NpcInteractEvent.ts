/**
 * NPC 互动事件类型实现
 * 在事件房间中触发 NPC 对话和交互
 */

import {
    IEventType,
    EventDisplayInfo,
    EventOption,
    EventResult,
    EventContext,
} from '../../Data/Interfaces/IEventType';

/**
 * NPC 互动事件
 * 遇到旅行者 NPC，可以进行交易、获取信息或接受委托
 */
export class NpcInteractEvent implements IEventType {
    readonly typeId: string = 'npc_interact';

    /** 事件是否已完成 */
    private _completed: boolean = false;

    /**
     * 获取事件显示信息
     * @returns 事件显示信息
     */
    getDisplayInfo(): EventDisplayInfo {
        return {
            title: '旅行者',
            description: '你遇到了一位神秘的旅行者，他似乎有一些有趣的东西要分享。',
            icon: 'event_npc',
        };
    }

    /**
     * 获取可选操作列表
     * @param context 事件上下文
     * @returns 事件选项列表
     */
    getOptions(context: EventContext): EventOption[] {
        const tradeCost = 20 + context.floorIndex * 5;

        const options: EventOption[] = [
            {
                label: '交易',
                description: `支付 ${tradeCost} 金币，获得一件随机道具`,
                cost: { type: 'gold', amount: tradeCost },
                preview: '随机道具',
            },
            {
                label: '请求情报',
                description: '获取当前楼层的地图信息',
                preview: '揭示地图',
            },
            {
                label: '友好交谈',
                description: '与旅行者聊天，获得少量经验',
                preview: '+20 经验',
            },
        ];

        // 低血量时提供治疗选项
        if (context.player.attributes.hp < context.player.attributes.maxHp * 0.5) {
            options.push({
                label: '请求治疗',
                description: '旅行者为你治疗，恢复 25% 最大生命值',
                cost: { type: 'gold', amount: Math.floor(tradeCost * 1.5) },
                preview: '+25% HP',
            });
        }

        return options;
    }

    /**
     * 执行选项效果
     * @param optionIndex 选择的选项索引
     * @param context 事件上下文
     * @returns 事件执行结果
     */
    executeOption(optionIndex: number, context: EventContext): EventResult {
        const tradeCost = 20 + context.floorIndex * 5;

        this._completed = true;

        switch (optionIndex) {
            case 0: {
                // 交易
                if (context.player.gold < tradeCost) {
                    this._completed = false;
                    return {
                        success: false,
                        message: `金币不足！需要 ${tradeCost} 金币`,
                    };
                }
                return {
                    success: true,
                    rewards: [
                        { type: 'gold', amount: -tradeCost },
                        { type: 'item', id: 'traveler_item', amount: 1, rarity: 'common' },
                    ],
                    message: '旅行者递给你一件道具，祝你好运！',
                };
            }
            case 1: {
                // 请求情报
                return {
                    success: true,
                    message: '旅行者向你展示了这一层的地图布局。',
                };
            }
            case 2: {
                // 友好交谈
                return {
                    success: true,
                    rewards: [{ type: 'exp_gem', amount: 20 }],
                    message: '愉快的交谈让你获得了一些经验。',
                };
            }
            case 3: {
                // 请求治疗
                const healCost = Math.floor(tradeCost * 1.5);
                if (context.player.gold < healCost) {
                    this._completed = false;
                    return {
                        success: false,
                        message: `金币不足！需要 ${healCost} 金币`,
                    };
                }
                const healAmount = Math.floor(context.player.attributes.maxHp * 0.25);
                return {
                    success: true,
                    rewards: [{ type: 'gold', amount: -healCost }],
                    effects: [{ attribute: 'hp', modType: 'flat', value: healAmount }],
                    message: `旅行者为你治疗了 ${healAmount} 点生命值。`,
                };
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
