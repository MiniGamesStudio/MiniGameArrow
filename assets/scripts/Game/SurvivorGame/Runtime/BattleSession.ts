import { CharacterStats, createDefaultStats } from '../Data/CharacterData';
import { SurvivorConst } from '../SurvivorConst';

/**
 * 战斗会话 — 一局游戏的运行时数据（非持久化）
 */
export class BattleSession {
    /** 存活时间（秒） */
    elapsedTime: number = 0;
    /** 当前波次 */
    currentWave: number = 0;
    /** 击杀数 */
    killCount: number = 0;
    /** 获得金币 */
    coinsCollected: number = 0;
    /** 是否暂停 */
    isPaused: boolean = false;
    /** 是否结束 */
    isOver: boolean = false;

    // ==================== 玩家状态 ====================

    /** 玩家当前 HP */
    playerHP: number = SurvivorConst.PLAYER_BASE_HP;
    /** 玩家等级 */
    playerLevel: number = 1;
    /** 当前经验 */
    playerExp: number = 0;
    /** 升级所需经验 */
    expToNextLevel: number = SurvivorConst.BASE_EXP_TO_LEVEL;

    /** 玩家最终属性（基础 + 被动加成） */
    playerStats: CharacterStats = createDefaultStats();

    // ==================== 装备槽 ====================

    /** 已装备武器 { weaponId: currentLevel } */
    equippedWeapons: Map<string, number> = new Map();
    /** 已装备被动 { passiveId: currentLevel } */
    equippedPassives: Map<string, number> = new Map();

    // ==================== 方法 ====================

    /** 增加经验，返回升级次数（0 = 未升级） */
    addExp(amount: number): number {
        this.playerExp += amount;
        let levelUps = 0;
        while (this.playerExp >= this.expToNextLevel) {
            this.playerExp -= this.expToNextLevel;
            this.playerLevel++;
            levelUps++;
            this.expToNextLevel = Math.floor(
                SurvivorConst.BASE_EXP_TO_LEVEL * Math.pow(SurvivorConst.EXP_GROWTH_FACTOR, this.playerLevel - 1)
            );
        }
        return levelUps;
    }

    /** 受到伤害，返回是否死亡 */
    takeDamage(damage: number): boolean {
        this.playerHP = Math.max(0, this.playerHP - damage);
        return this.playerHP <= 0;
    }

    /** 回复生命 */
    heal(amount: number): void {
        this.playerHP = Math.min(this.playerStats.maxHP, this.playerHP + amount);
    }

    /** 检查武器槽是否已满 */
    isWeaponSlotFull(): boolean {
        return this.equippedWeapons.size >= SurvivorConst.MAX_WEAPON_SLOTS;
    }

    /** 检查被动槽是否已满 */
    isPassiveSlotFull(): boolean {
        return this.equippedPassives.size >= SurvivorConst.MAX_PASSIVE_SLOTS;
    }

    /** 重置 */
    reset(): void {
        this.elapsedTime = 0;
        this.currentWave = 0;
        this.killCount = 0;
        this.coinsCollected = 0;
        this.isPaused = false;
        this.isOver = false;
        this.playerHP = SurvivorConst.PLAYER_BASE_HP;
        this.playerLevel = 1;
        this.playerExp = 0;
        this.expToNextLevel = SurvivorConst.BASE_EXP_TO_LEVEL;
        this.playerStats = createDefaultStats();
        this.equippedWeapons.clear();
        this.equippedPassives.clear();
    }
}
