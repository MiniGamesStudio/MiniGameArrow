/**
 * 职业师 NPC 类型实现
 * 提供职业转换和高级职业解锁服务
 */

import {
    INpcType,
    NpcDisplayInfo,
    NpcService,
    NpcContext,
    ServiceResult,
} from '../../Data/Interfaces/INpcType';

/** 职业转换基础费用 */
const BASE_SWITCH_COST = 80;
/** 高级职业解锁费用 */
const ADVANCED_UNLOCK_COST = 200;

/**
 * 职业师 NPC
 * 提供职业转换、天赋重置和高级职业解锁服务
 */
export class ClassMasterNpc implements INpcType {
    readonly typeId: string = 'class_master';

    /**
     * 获取 NPC 显示信息
     * @returns NPC 显示信息
     */
    getDisplayInfo(): NpcDisplayInfo {
        return {
            name: '职业师 莫里斯',
            description: '一位见多识广的老者，精通各种职业的奥秘，能够帮助你转换职业。',
            icon: 'npc_class_master',
            role: '职业转换',
        };
    }

    /**
     * 获取可用服务列表
     * @param context NPC 交互上下文
     * @returns 服务列表
     */
    getServices(context: NpcContext): NpcService[] {
        const priceMultiplier = context.affinity >= 70 ? 0.8 : 1.0;

        const switchCost = Math.floor(BASE_SWITCH_COST * priceMultiplier);
        const resetCost = Math.floor(40 * priceMultiplier);

        const services: NpcService[] = [
            {
                serviceId: 'class_switch',
                name: '职业转换',
                description: '切换到另一个已解锁的职业，重置天赋树并退还天赋点',
                cost: switchCost,
                available: context.player.gold >= switchCost,
                unavailableReason: context.player.gold < switchCost
                    ? `金币不足（需要 ${switchCost}）` : undefined,
            },
            {
                serviceId: 'talent_reset',
                name: '天赋重置',
                description: '重置当前职业的天赋树，退还所有已分配的天赋点',
                cost: resetCost,
                available: context.player.gold >= resetCost,
                unavailableReason: context.player.gold < resetCost
                    ? `金币不足（需要 ${resetCost}）` : undefined,
            },
            {
                serviceId: 'class_info',
                name: '职业咨询',
                description: '了解各职业的特点和优劣（免费）',
                cost: 0,
                available: true,
            },
        ];

        // 高好感度解锁高级职业解锁服务
        if (context.affinity >= 90) {
            const unlockCost = Math.floor(ADVANCED_UNLOCK_COST * priceMultiplier);
            services.push({
                serviceId: 'advanced_unlock',
                name: '高级职业解锁',
                description: '解锁一个精英级别的职业',
                cost: unlockCost,
                available: context.player.gold >= unlockCost,
                unavailableReason: context.player.gold < unlockCost
                    ? `金币不足（需要 ${unlockCost}）` : undefined,
            });
        }

        return services;
    }

    /**
     * 执行服务
     * @param serviceId 服务 ID
     * @param context NPC 交互上下文
     * @returns 服务执行结果
     */
    executeService(serviceId: string, context: NpcContext): ServiceResult {
        const services = this.getServices(context);
        const service = services.find(s => s.serviceId === serviceId);

        if (!service) {
            return {
                success: false,
                message: '未知的服务',
                affinityChange: 0,
                goldChange: 0,
            };
        }

        if (!service.available) {
            return {
                success: false,
                message: service.unavailableReason ?? '服务不可用',
                affinityChange: 0,
                goldChange: 0,
            };
        }

        switch (serviceId) {
            case 'class_switch':
                return {
                    success: true,
                    message: '职业师引导你完成了职业转换仪式，你感受到了全新的力量！',
                    affinityChange: 10,
                    goldChange: -service.cost,
                };
            case 'talent_reset':
                return {
                    success: true,
                    message: '职业师帮你重置了天赋树，所有天赋点已退还。',
                    affinityChange: 3,
                    goldChange: -service.cost,
                };
            case 'class_info':
                return {
                    success: true,
                    message: '职业师详细地为你介绍了各个职业的特点和成长方向。',
                    affinityChange: 2,
                    goldChange: 0,
                };
            case 'advanced_unlock':
                return {
                    success: true,
                    message: '职业师传授了你高级职业的秘密，一个新的职业已解锁！',
                    affinityChange: 20,
                    goldChange: -service.cost,
                };
            default:
                return {
                    success: false,
                    message: '未知的服务',
                    affinityChange: 0,
                    goldChange: 0,
                };
        }
    }

    /**
     * 获取对话内容
     * @param affinityLevel 好感度等级
     * @returns 对话文本列表
     */
    getDialogue(affinityLevel: number): string[] {
        if (affinityLevel >= 90) {
            return [
                '你已经准备好了。我可以为你开启通往更高境界的道路。',
                '很少有人能走到这一步，你值得学习更强大的职业。',
            ];
        } else if (affinityLevel >= 40) {
            return [
                '你对当前的职业满意吗？如果想要改变，我可以帮你。',
                '每个职业都有其独特之处，关键是找到适合你的。',
            ];
        } else {
            return [
                '年轻的冒险者，你知道职业的力量吗？',
                '选择正确的职业，能让你的冒险事半功倍。',
            ];
        }
    }
}
