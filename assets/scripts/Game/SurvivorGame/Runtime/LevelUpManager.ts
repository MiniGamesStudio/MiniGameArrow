import { LevelUpChoice, LevelUpChoiceType } from '../Data/LevelUpData';
import { WeaponManager } from './WeaponManager';
import { PassiveManager } from './PassiveManager';
import { BattleSession } from './BattleSession';
import { SurvivorConst } from '../SurvivorConst';

/**
 * 升级选项管理器 — 生成随机升级选项
 */
export class LevelUpManager {

    /**
     * 生成升级选项列表
     * 规则：
     *   1. 已有武器未满级 → 升级武器
     *   2. 武器槽未满 → 新武器
     *   3. 已有被动未满级 → 升级被动
     *   4. 被动槽未满 → 新被动
     *   5. 兜底 → 回复生命
     */
    static generateChoices(
        session: BattleSession,
        weaponMgr: WeaponManager,
        passiveMgr: PassiveManager
    ): LevelUpChoice[] {
        const pool: LevelUpChoice[] = [];

        // 已有武器可升级
        session.equippedWeapons.forEach((level, weaponId) => {
            const config = weaponMgr.getWeaponConfig(weaponId);
            if (config && level < config.maxLevel) {
                pool.push({
                    type: LevelUpChoiceType.UpgradeWeapon,
                    itemId: weaponId,
                    targetLevel: level + 1,
                    displayName: `${config.name} Lv${level + 1}`,
                    displayDesc: `升级 ${config.name}`,
                    iconPath: config.iconPath,
                });
            }
        });

        // 新武器
        if (!session.isWeaponSlotFull()) {
            for (const config of weaponMgr.getAllWeaponConfigs()) {
                if (!session.equippedWeapons.has(config.id)) {
                    pool.push({
                        type: LevelUpChoiceType.NewWeapon,
                        itemId: config.id,
                        targetLevel: 1,
                        displayName: config.name,
                        displayDesc: config.description,
                        iconPath: config.iconPath,
                    });
                }
            }
        }

        // 已有被动可升级
        session.equippedPassives.forEach((level, passiveId) => {
            const config = passiveMgr.getPassiveConfig(passiveId);
            if (config && level < config.maxLevel) {
                pool.push({
                    type: LevelUpChoiceType.UpgradePassive,
                    itemId: passiveId,
                    targetLevel: level + 1,
                    displayName: `${config.name} Lv${level + 1}`,
                    displayDesc: `升级 ${config.name}`,
                    iconPath: config.iconPath,
                });
            }
        });

        // 新被动
        if (!session.isPassiveSlotFull()) {
            for (const config of passiveMgr.getAllPassiveConfigs()) {
                if (!session.equippedPassives.has(config.id)) {
                    pool.push({
                        type: LevelUpChoiceType.NewPassive,
                        itemId: config.id,
                        targetLevel: 1,
                        displayName: config.name,
                        displayDesc: config.description,
                        iconPath: config.iconPath,
                    });
                }
            }
        }

        // 兜底：回复生命
        pool.push({
            type: LevelUpChoiceType.Heal,
            itemId: 'heal',
            targetLevel: 0,
            displayName: '回复生命',
            displayDesc: '恢复 30% 最大生命值',
            iconPath: '',
        });

        // 随机选取
        return this.pickRandom(pool, SurvivorConst.LEVEL_UP_CHOICES_COUNT);
    }

    /** 从池中随机选取 count 个不重复的选项 */
    private static pickRandom(pool: LevelUpChoice[], count: number): LevelUpChoice[] {
        const result: LevelUpChoice[] = [];
        const copy = pool.slice();

        for (let i = 0; i < count && copy.length > 0; i++) {
            const idx = Math.floor(Math.random() * copy.length);
            result.push(copy[idx]);
            copy.splice(idx, 1);
        }

        return result;
    }
}
