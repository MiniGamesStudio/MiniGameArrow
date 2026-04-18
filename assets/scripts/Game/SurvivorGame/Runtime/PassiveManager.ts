import { PassiveConfig } from '../Data/WeaponData';
import { createDefaultStats } from '../Data/CharacterData';
import { BattleSession } from './BattleSession';

/**
 * 被动道具管理器 — 管理被动道具的装备和属性计算
 */
export class PassiveManager {
    private _passiveConfigs: Map<string, PassiveConfig> = new Map();
    private _activePassives: Map<string, number> = new Map(); // passiveId -> level

    /** 注册被动配置 */
    registerPassiveConfig(config: PassiveConfig): void {
        this._passiveConfigs.set(config.id, config);
    }

    /** 获取被动配置 */
    getPassiveConfig(id: string): PassiveConfig | null {
        return this._passiveConfigs.get(id) ?? null;
    }

    /** 获取所有已注册被动配置 */
    getAllPassiveConfigs(): PassiveConfig[] {
        return Array.from(this._passiveConfigs.values());
    }

    /** 装备新被动 */
    addPassive(passiveId: string, session: BattleSession): boolean {
        if (this._activePassives.has(passiveId)) return false;
        if (session.isPassiveSlotFull()) return false;

        const config = this._passiveConfigs.get(passiveId);
        if (!config) return false;

        this._activePassives.set(passiveId, 1);
        session.equippedPassives.set(passiveId, 1);
        this.recalcStats(session);
        return true;
    }

    /** 升级被动 */
    upgradePassive(passiveId: string, session: BattleSession): boolean {
        const level = this._activePassives.get(passiveId);
        if (level === undefined) return false;

        const config = this._passiveConfigs.get(passiveId);
        if (!config || level >= config.maxLevel) return false;

        const newLevel = level + 1;
        this._activePassives.set(passiveId, newLevel);
        session.equippedPassives.set(passiveId, newLevel);
        this.recalcStats(session);
        return true;
    }

    /** 获取被动当前等级 */
    getPassiveLevel(passiveId: string): number {
        return this._activePassives.get(passiveId) ?? 0;
    }

    /**
     * 重新计算玩家属性 = 基础属性 + 所有被动加成
     */
    recalcStats(session: BattleSession): void {
        const stats = createDefaultStats();

        this._activePassives.forEach((level, passiveId) => {
            const config = this._passiveConfigs.get(passiveId);
            if (!config) return;

            // 累加 1 到 level 的所有增量
            for (let i = 0; i < level && i < config.levels.length; i++) {
                const bonuses = config.levels[i];
                for (const key in bonuses) {
                    if (key in stats) {
                        (stats as any)[key] += bonuses[key];
                    }
                }
            }
        });

        session.playerStats = stats;
        session.playerHP = Math.min(session.playerHP, stats.maxHP);
    }

    reset(): void {
        this._activePassives.clear();
    }
}
