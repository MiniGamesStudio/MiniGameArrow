import { WeaponConfig, WeaponLevelStats } from '../Data/WeaponData';
import { BattleSession } from './BattleSession';

/**
 * 武器运行时实例
 */
export interface WeaponInstance {
    config: WeaponConfig;
    level: number;
    /** 当前冷却计时 */
    cooldownTimer: number;
    /** 是否可以攻击 */
    ready: boolean;
}

/**
 * 武器管理器 — 管理玩家所有武器的冷却和触发
 */
export class WeaponManager {
    private _weaponConfigs: Map<string, WeaponConfig> = new Map();
    private _activeWeapons: Map<string, WeaponInstance> = new Map();

    /** 注册武器配置 */
    registerWeaponConfig(config: WeaponConfig): void {
        this._weaponConfigs.set(config.id, config);
    }

    /** 获取武器配置 */
    getWeaponConfig(id: string): WeaponConfig | null {
        return this._weaponConfigs.get(id) ?? null;
    }

    /** 获取所有已注册武器配置 */
    getAllWeaponConfigs(): WeaponConfig[] {
        return Array.from(this._weaponConfigs.values());
    }

    /** 装备新武器 */
    addWeapon(weaponId: string, session: BattleSession): boolean {
        if (this._activeWeapons.has(weaponId)) return false;
        if (session.isWeaponSlotFull()) return false;

        const config = this._weaponConfigs.get(weaponId);
        if (!config) return false;

        const instance: WeaponInstance = {
            config,
            level: 1,
            cooldownTimer: 0,
            ready: true,
        };

        this._activeWeapons.set(weaponId, instance);
        session.equippedWeapons.set(weaponId, 1);
        return true;
    }

    /** 升级武器 */
    upgradeWeapon(weaponId: string, session: BattleSession): boolean {
        const instance = this._activeWeapons.get(weaponId);
        if (!instance) return false;
        if (instance.level >= instance.config.maxLevel) return false;

        instance.level++;
        session.equippedWeapons.set(weaponId, instance.level);
        return true;
    }

    /** 获取武器当前等级属性 */
    getWeaponStats(weaponId: string): WeaponLevelStats | null {
        const instance = this._activeWeapons.get(weaponId);
        if (!instance) return null;
        const levelIndex = instance.level - 1;
        if (levelIndex < 0 || levelIndex >= instance.config.levels.length) return null;
        return instance.config.levels[levelIndex];
    }

    /**
     * 每帧更新所有武器冷却，返回本帧需要触发攻击的武器列表
     */
    update(dt: number, session: BattleSession): AttackRequest[] {
        if (session.isPaused || session.isOver) return [];

        const attacks: AttackRequest[] = [];

        this._activeWeapons.forEach((weapon, id) => {
            const stats = this.getWeaponStats(id);
            if (!stats) return;

            if (!weapon.ready) {
                weapon.cooldownTimer += dt;
                const actualCooldown = stats.cooldown * session.playerStats.cooldownReduction;
                if (weapon.cooldownTimer >= actualCooldown) {
                    weapon.cooldownTimer = 0;
                    weapon.ready = true;
                }
            }

            if (weapon.ready) {
                weapon.ready = false;
                const totalProjectiles = stats.projectileCount + session.playerStats.projectileBonus;
                attacks.push({
                    weaponId: id,
                    config: weapon.config,
                    stats,
                    level: weapon.level,
                    projectileCount: totalProjectiles,
                    damage: Math.floor(stats.damage * session.playerStats.attackMultiplier),
                });
            }
        });

        return attacks;
    }

    /** 获取活跃武器实例 */
    getActiveWeapon(weaponId: string): WeaponInstance | null {
        return this._activeWeapons.get(weaponId) ?? null;
    }

    /** 获取所有活跃武器 */
    getAllActiveWeapons(): Map<string, WeaponInstance> {
        return this._activeWeapons;
    }

    reset(): void {
        this._activeWeapons.clear();
    }
}

/**
 * 攻击请求 — 由 BattleController 消费，创建实际的投射物/伤害区域
 */
export interface AttackRequest {
    weaponId: string;
    config: WeaponConfig;
    stats: WeaponLevelStats;
    level: number;
    projectileCount: number;
    damage: number;
}
