/**
 * 祭坛事件类型实现
 * 以牺牲部分资源换取强力增益
 */

import {
    IEventType,
    EventDisplayInfo,
    EventOption,
    EventResult,
    EventContext,
} from '../../Data/Interfaces/IEventType';

/**
 * 祭坛事件
 * 玩家可以牺牲生命值或金币来换取强力的永久增益
 */
export class AltarEvent implements IEventType {
    readonly typeId: string = 'altar';

    /** 事件是否已完成 */
    private _completed: boolean = false;

    /**
     * 获取事件显示信息
     * @returns 事件显示信息
     */
    getDisplayInfo(): EventDisplayInfo {
        return {
            title: '神秘祭坛',
            description: '一座散发着幽光的古老祭坛矗立在房间中央。它似乎在索取献祭，以换取强大的力量...',
            icon: 'event_altar',
        };
    }

    /**
     * 获取可选操作列表
     * @param context 事件上下文
     * @returns 事件选项列表
     */
    getOptions(context: EventContext): EventOption[] {
        const hpSacrifice = Math.floor(context.player.attributes.maxHp * 0.25);
        const goldSacrifice = 60 + context.floorIndex * 20;

        const options: EventOption[] = [
            {
                label: '献祭生命',
                description: `牺牲 ${hpSacrifice} 点最大生命值，永久获得 15 点攻击力`,
                cost: { type: 'hp', amount: hpSacrifice },
                preview: `-${hpSacrifice} 最大HP → +15 攻击力`,
            },
            {
                label: '献祭金币',
                description: `牺牲 ${goldSacrifice} 金币，永久获得 10 点防御力`,
                cost: { type: 'gold', amount: goldSacrifice },
                preview: `-${goldSacrifice} 金币 → +10 防御力`,
            },
            {
                label: '全力献祭',
                description: `牺牲 ${hpSacrifice} 最大生命值和 ${goldSacrifice} 金币，获得全属性大幅提升`,
                cost: { type: 'hp', amount: hpSacrifice },
                preview: '全属性大幅提升',
            },
            {
                label: '离开祭坛',
                description: '不进行任何献祭，安全离开',
                preview: '无效果',
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
        const hpSacrifice = Math.floor(context.player.attributes.maxHp * 0.25);
        const goldSacrifice = 60 + context.floorIndex * 20;

        this._completed = true;

        switch (optionIndex) {
            case 0: {
                // 献祭生命 → 攻击力
                if (context.player.attributes.hp <= hpSacrifice) {
                    this._completed = false;
                    return {
                        success: false,
                        message: '生命值不足以进行献祭！',
                    };
                }
                return {
                    success: true,
                    effects: [
                        { attribute: 'maxHp', modType: 'flat', value: -hpSacrifice },
                        { attribute: 'hp', modType: 'flat', value: -hpSacrifice },
                        { attribute: 'attack', modType: 'flat', value: 15 },
                    ],
                    message: `祭坛吞噬了你的生命力，你感到力量涌入体内！攻击力 +15`,
                };
            }
            case 1: {
                // 献祭金币 → 防御力
                if (context.player.gold < goldSacrifice) {
                    this._completed = false;
                    return {
                        success: false,
                        message: `金币不足！需要 ${goldSacrifice} 金币`,
                    };
                }
                return {
                    success: true,
                    rewards: [{ type: 'gold', amount: -goldSacrifice }],
                    effects: [
                        { attribute: 'defense', modType: 'flat', value: 10 },
                    ],
                    message: `金币化为光芒融入你的身体，防御力 +10`,
                };
            }
            case 2: {
                // 全力献祭 → 全属性提升
                if (context.player.attributes.hp <= hpSacrifice) {
                    this._completed = false;
                    return { success: false, message: '生命值不足以进行献祭！' };
                }
                if (context.player.gold < goldSacrifice) {
                    this._completed = false;
                    return { success: false, message: `金币不足！需要 ${goldSacrifice} 金币` };
                }
                return {
                    success: true,
                    rewards: [{ type: 'gold', amount: -goldSacrifice }],
                    effects: [
                        { attribute: 'maxHp', modType: 'flat', value: -hpSacrifice },
                        { attribute: 'hp', modType: 'flat', value: -hpSacrifice },
                        { attribute: 'attack', modType: 'flat', value: 10 },
                        { attribute: 'defense', modType: 'flat', value: 8 },
                        { attribute: 'moveSpeed', modType: 'flat', value: 15 },
                    ],
                    message: '祭坛爆发出耀眼的光芒！全属性大幅提升！',
                };
            }
            case 3: {
                // 离开祭坛
                return {
                    success: true,
                    message: '你谨慎地离开了祭坛。',
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
