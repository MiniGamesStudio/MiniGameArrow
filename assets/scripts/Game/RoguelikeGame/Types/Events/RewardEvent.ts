/**
 * 奖励选择事件类型实现
 * 提供多个奖励选项供玩家选择
 */

import {
    IEventType,
    EventDisplayInfo,
    EventOption,
    EventResult,
    EventContext,
} from '../../Data/Interfaces/IEventType';

/**
 * 奖励选择事件
 * 玩家从多个奖励中选择一个，包括金币、道具或属性加成
 */
export class RewardEvent implements IEventType {
    readonly typeId: string = 'reward';

    /** 事件是否已完成 */
    private _completed: boolean = false;

    /**
     * 获取事件显示信息
     * @returns 事件显示信息
     */
    getDisplayInfo(): EventDisplayInfo {
        return {
            title: '宝箱房间',
            description: '你发现了一个神秘的宝箱，里面似乎有不错的东西。选择你想要的奖励吧！',
            icon: 'event_reward',
        };
    }

    /**
     * 获取可选操作列表
     * 根据玩家状态和楼层生成不同的奖励选项
     * @param context 事件上下文
     * @returns 事件选项列表
     */
    getOptions(context: EventContext): EventOption[] {
        const floorBonus = 1 + context.floorIndex * 0.2;
        const goldAmount = Math.floor(50 * floorBonus);
        const healAmount = Math.floor(context.player.attributes.maxHp * 0.3);

        const options: EventOption[] = [
            {
                label: '金币奖励',
                description: `获得 ${goldAmount} 金币`,
                preview: `+${goldAmount} 金币`,
            },
            {
                label: '生命恢复',
                description: `恢复 ${healAmount} 点生命值`,
                preview: `+${healAmount} HP`,
            },
            {
                label: '攻击力提升',
                description: '永久提升 5 点攻击力',
                preview: '+5 攻击力',
            },
        ];

        // 高楼层额外提供稀有选项
        if (context.floorIndex >= 3) {
            options.push({
                label: '神秘宝物',
                description: '获得一件随机稀有道具',
                preview: '随机稀有道具',
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
        const options = this.getOptions(context);
        if (optionIndex < 0 || optionIndex >= options.length) {
            return { success: false, message: '无效的选项' };
        }

        this._completed = true;
        const floorBonus = 1 + context.floorIndex * 0.2;

        switch (optionIndex) {
            case 0: {
                // 金币奖励
                const goldAmount = Math.floor(50 * floorBonus);
                return {
                    success: true,
                    rewards: [{ type: 'gold', amount: goldAmount }],
                    message: `获得了 ${goldAmount} 金币！`,
                };
            }
            case 1: {
                // 生命恢复
                const healAmount = Math.floor(context.player.attributes.maxHp * 0.3);
                return {
                    success: true,
                    effects: [{ attribute: 'hp', modType: 'flat', value: healAmount }],
                    message: `恢复了 ${healAmount} 点生命值！`,
                };
            }
            case 2: {
                // 攻击力提升
                return {
                    success: true,
                    effects: [{ attribute: 'attack', modType: 'flat', value: 5 }],
                    message: '攻击力永久提升了 5 点！',
                };
            }
            case 3: {
                // 神秘宝物
                return {
                    success: true,
                    rewards: [{ type: 'item', id: 'random_rare', amount: 1, rarity: 'rare' }],
                    message: '获得了一件稀有道具！',
                };
            }
            default:
                return { success: false, message: '未知选项' };
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
