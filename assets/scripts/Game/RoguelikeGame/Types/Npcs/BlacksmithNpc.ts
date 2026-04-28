/**
 * 铁匠 NPC 类型实现
 * 提供武器强化和装备修理服务
 */

import {
    INpcType,
    NpcDisplayInfo,
    NpcService,
    NpcContext,
    ServiceResult,
} from '../../Data/Interfaces/INpcType';

/** 基础强化费用 */
const BASE_UPGRADE_COST = 30;
/** 每级强化费用增长 */
const UPGRADE_COST_GROWTH = 15;
/** 高好感度折扣阈值 */
const DISCOUNT_AFFINITY_THRESHOLD = 50;
/** 高好感度折扣比例 */
const DISCOUNT_RATE = 0.8;

/**
 * 铁匠 NPC
 * 提供武器强化服务，消耗金币提升武器伤害和附加属性
 */
export class BlacksmithNpc implements INpcType {
    readonly typeId: string = 'blacksmith';

    /**
     * 获取 NPC 显示信息
     * @returns NPC 显示信息
     */
    getDisplayInfo(): NpcDisplayInfo {
        return {
            name: '铁匠 格雷格',
            description: '一位经验丰富的铁匠，能够强化你的武器使其更加锋利。',
            icon: 'npc_blacksmith',
            role: '武器强化',
        };
    }

    /**
     * 获取可用服务列表
     * @param context NPC 交互上下文
     * @returns 服务列表
     */
    getServices(context: NpcContext): NpcService[] {
        const priceMultiplier = context.affinity >= DISCOUNT_AFFINITY_THRESHOLD
            ? DISCOUNT_RATE : 1.0;

        const upgradeCost = Math.floor(
            (BASE_UPGRADE_COST + UPGRADE_COST_GROWTH * context.player.level) * priceMultiplier
        );
        const repairCost = Math.floor(15 * priceMultiplier);

        const services: NpcService[] = [
            {
                serviceId: 'weapon_upgrade',
                name: '武器强化',
                description: `强化当前武器，提升伤害 +5`,
                cost: upgradeCost,
                available: context.player.gold >= upgradeCost,
                unavailableReason: context.player.gold < upgradeCost
                    ? `金币不足（需要 ${upgradeCost}）` : undefined,
            },
            {
                serviceId: 'weapon_repair',
                name: '装备修理',
                description: '修理所有装备，恢复耐久度',
                cost: repairCost,
                available: context.player.gold >= repairCost,
                unavailableReason: context.player.gold < repairCost
                    ? `金币不足（需要 ${repairCost}）` : undefined,
            },
        ];

        // 高好感度解锁特殊强化
        if (context.affinity >= 80) {
            const specialCost = Math.floor(upgradeCost * 2);
            services.push({
                serviceId: 'special_upgrade',
                name: '精英强化',
                description: '对武器进行精英级强化，伤害 +12，附加火焰效果',
                cost: specialCost,
                available: context.player.gold >= specialCost,
                unavailableReason: context.player.gold < specialCost
                    ? `金币不足（需要 ${specialCost}）` : undefined,
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
            case 'weapon_upgrade':
                return {
                    success: true,
                    message: '铁匠仔细地打磨了你的武器，它变得更加锋利了！',
                    affinityChange: 5,
                    goldChange: -service.cost,
                };
            case 'weapon_repair':
                return {
                    success: true,
                    message: '铁匠修复了你装备上的所有损伤。',
                    affinityChange: 3,
                    goldChange: -service.cost,
                };
            case 'special_upgrade':
                return {
                    success: true,
                    message: '铁匠使用了秘传技法，你的武器散发出炽热的光芒！',
                    affinityChange: 10,
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
        if (affinityLevel >= 80) {
            return [
                '老朋友，又来了？我这里有些特别的东西给你看看。',
                '你的武器我来照顾，放心吧。',
            ];
        } else if (affinityLevel >= 40) {
            return [
                '欢迎回来，冒险者。需要强化武器吗？',
                '你的武器看起来还不错，但我能让它更好。',
            ];
        } else {
            return [
                '嗯？需要什么？我这里提供武器强化服务。',
                '把你的武器拿来看看吧。',
            ];
        }
    }
}
