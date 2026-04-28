/**
 * 技能师 NPC 类型实现
 * 提供职业技能学习和升级服务
 */

import {
    INpcType,
    NpcDisplayInfo,
    NpcService,
    NpcContext,
    ServiceResult,
} from '../../Data/Interfaces/INpcType';

/** 基础技能学习费用 */
const BASE_LEARN_COST = 50;
/** 技能升级费用倍率 */
const UPGRADE_COST_MULTIPLIER = 1.5;
/** 高好感度折扣阈值 */
const DISCOUNT_AFFINITY_THRESHOLD = 60;

/**
 * 技能师 NPC
 * 提供职业技能的学习和升级服务
 */
export class SkillMasterNpc implements INpcType {
    readonly typeId: string = 'skill_master';

    /**
     * 获取 NPC 显示信息
     * @returns NPC 显示信息
     */
    getDisplayInfo(): NpcDisplayInfo {
        return {
            name: '技能师 艾琳',
            description: '一位精通各种战斗技巧的导师，能够教授和强化职业技能。',
            icon: 'npc_skill_master',
            role: '技能学习',
        };
    }

    /**
     * 获取可用服务列表
     * @param context NPC 交互上下文
     * @returns 服务列表
     */
    getServices(context: NpcContext): NpcService[] {
        const priceMultiplier = context.affinity >= DISCOUNT_AFFINITY_THRESHOLD
            ? 0.85 : 1.0;

        const learnCost = Math.floor(BASE_LEARN_COST * priceMultiplier);
        const upgradeCost = Math.floor(
            BASE_LEARN_COST * UPGRADE_COST_MULTIPLIER * priceMultiplier
        );

        const services: NpcService[] = [
            {
                serviceId: 'learn_skill',
                name: '学习新技能',
                description: '学习一个当前职业的新技能',
                cost: learnCost,
                available: context.player.gold >= learnCost && context.player.level >= 3,
                unavailableReason: context.player.level < 3
                    ? '需要达到 3 级才能学习新技能'
                    : context.player.gold < learnCost
                        ? `金币不足（需要 ${learnCost}）` : undefined,
            },
            {
                serviceId: 'upgrade_skill',
                name: '升级技能',
                description: '强化已有技能，提升伤害和效果',
                cost: upgradeCost,
                available: context.player.gold >= upgradeCost,
                unavailableReason: context.player.gold < upgradeCost
                    ? `金币不足（需要 ${upgradeCost}）` : undefined,
            },
            {
                serviceId: 'skill_advice',
                name: '技能指导',
                description: '获取技能搭配建议（免费）',
                cost: 0,
                available: true,
            },
        ];

        // 高好感度解锁秘传技能
        if (context.affinity >= 100) {
            const secretCost = Math.floor(learnCost * 3);
            services.push({
                serviceId: 'secret_skill',
                name: '秘传技能',
                description: '学习一个强力的隐藏技能',
                cost: secretCost,
                available: context.player.gold >= secretCost,
                unavailableReason: context.player.gold < secretCost
                    ? `金币不足（需要 ${secretCost}）` : undefined,
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
            case 'learn_skill':
                return {
                    success: true,
                    message: '技能师传授了你一个新的战斗技巧！',
                    affinityChange: 8,
                    goldChange: -service.cost,
                };
            case 'upgrade_skill':
                return {
                    success: true,
                    message: '在技能师的指导下，你的技能变得更加精湛了！',
                    affinityChange: 5,
                    goldChange: -service.cost,
                };
            case 'skill_advice':
                return {
                    success: true,
                    message: '技能师分享了一些实用的战斗技巧和技能搭配建议。',
                    affinityChange: 2,
                    goldChange: 0,
                };
            case 'secret_skill':
                return {
                    success: true,
                    message: '技能师传授了你一个秘传绝技！这是只有最亲密的弟子才能学到的！',
                    affinityChange: 15,
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
        if (affinityLevel >= 100) {
            return [
                '我最优秀的弟子，我有一些秘传技能想要传授给你。',
                '你的天赋令我惊叹，来吧，让我们开始特训。',
            ];
        } else if (affinityLevel >= 50) {
            return [
                '你的进步很快，继续努力。需要学习新技能吗？',
                '我看到了你的潜力，让我来帮你提升。',
            ];
        } else {
            return [
                '想要变强吗？我可以教你一些战斗技巧。',
                '每个冒险者都需要掌握技能，来看看我能教你什么。',
            ];
        }
    }
}
