/**
 * 商人 NPC 类型实现
 * 提供稀有道具交易服务
 */

import {
    INpcType,
    NpcDisplayInfo,
    NpcService,
    NpcContext,
    ServiceResult,
} from '../../Data/Interfaces/INpcType';

/** 稀有道具基础价格 */
const BASE_RARE_ITEM_PRICE = 60;
/** 史诗道具基础价格 */
const BASE_EPIC_ITEM_PRICE = 120;

/**
 * 商人 NPC
 * 提供比商店更稀有的道具交易，价格较高但品质更好
 */
export class MerchantNpc implements INpcType {
    readonly typeId: string = 'merchant';

    /**
     * 获取 NPC 显示信息
     * @returns NPC 显示信息
     */
    getDisplayInfo(): NpcDisplayInfo {
        return {
            name: '商人 哈桑',
            description: '一位走南闯北的商人，总能搞到一些稀有的好东西。',
            icon: 'npc_merchant',
            role: '稀有交易',
        };
    }

    /**
     * 获取可用服务列表
     * @param context NPC 交互上下文
     * @returns 服务列表
     */
    getServices(context: NpcContext): NpcService[] {
        const priceMultiplier = context.affinity >= 50 ? 0.85 : 1.0;

        const rarePrice = Math.floor(BASE_RARE_ITEM_PRICE * priceMultiplier);
        const epicPrice = Math.floor(BASE_EPIC_ITEM_PRICE * priceMultiplier);
        const healPrice = Math.floor(40 * priceMultiplier);

        const services: NpcService[] = [
            {
                serviceId: 'buy_rare_item',
                name: '购买稀有道具',
                description: '购买一件随机稀有品质的道具',
                cost: rarePrice,
                available: context.player.gold >= rarePrice,
                unavailableReason: context.player.gold < rarePrice
                    ? `金币不足（需要 ${rarePrice}）` : undefined,
            },
            {
                serviceId: 'buy_epic_item',
                name: '购买史诗道具',
                description: '购买一件随机史诗品质的道具',
                cost: epicPrice,
                available: context.player.gold >= epicPrice,
                unavailableReason: context.player.gold < epicPrice
                    ? `金币不足（需要 ${epicPrice}）` : undefined,
            },
            {
                serviceId: 'buy_potion',
                name: '购买高级药水',
                description: '恢复 50% 最大生命值',
                cost: healPrice,
                available: context.player.gold >= healPrice,
                unavailableReason: context.player.gold < healPrice
                    ? `金币不足（需要 ${healPrice}）` : undefined,
            },
            {
                serviceId: 'sell_items',
                name: '出售道具',
                description: '将不需要的道具卖给商人换取金币',
                cost: 0,
                available: true,
            },
        ];

        // 高好感度解锁传说级道具
        if (context.affinity >= 100) {
            const legendaryPrice = Math.floor(epicPrice * 2.5);
            services.push({
                serviceId: 'buy_legendary',
                name: '购买传说道具',
                description: '购买一件传说品质的珍稀道具',
                cost: legendaryPrice,
                available: context.player.gold >= legendaryPrice,
                unavailableReason: context.player.gold < legendaryPrice
                    ? `金币不足（需要 ${legendaryPrice}）` : undefined,
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
            case 'buy_rare_item':
                return {
                    success: true,
                    message: '商人从包裹中取出一件闪闪发光的稀有道具递给你。',
                    affinityChange: 5,
                    goldChange: -service.cost,
                };
            case 'buy_epic_item':
                return {
                    success: true,
                    message: '商人小心翼翼地取出一件散发紫色光芒的史诗道具。',
                    affinityChange: 8,
                    goldChange: -service.cost,
                };
            case 'buy_potion':
                return {
                    success: true,
                    message: '你喝下了高级药水，感觉精力充沛！',
                    affinityChange: 3,
                    goldChange: -service.cost,
                };
            case 'sell_items':
                return {
                    success: true,
                    message: '商人仔细检查了你的道具，给出了合理的价格。',
                    affinityChange: 2,
                    goldChange: 0, // 实际金币变化由具体出售逻辑决定
                };
            case 'buy_legendary':
                return {
                    success: true,
                    message: '商人从一个上锁的箱子中取出一件金色光芒的传说道具！',
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
                '我最好的客户！我特意为你留了一些传说级的好东西。',
                '来来来，看看这些，市面上可找不到的。',
            ];
        } else if (affinityLevel >= 50) {
            return [
                '老朋友，今天有什么需要的？我给你打个折。',
                '你的眼光不错，这些都是精挑细选的好货。',
            ];
        } else {
            return [
                '欢迎光临！看看有没有你需要的东西。',
                '我这里的货品可比外面的商店好多了，当然价格也...',
            ];
        }
    }
}
