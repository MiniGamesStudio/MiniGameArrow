import { EventManager } from '../../../Core/EventManager';
import { SurvivorEvent } from '../SurvivorEvent';
import { SurvivorConst } from '../SurvivorConst';
import { SurvivorGameState } from '../SurvivorGameState';
import { BattleSession } from './BattleSession';
import { EnemySpawner, SpawnRequest } from './EnemySpawner';
import { WeaponManager, AttackRequest } from './WeaponManager';
import { PassiveManager } from './PassiveManager';
import { LevelUpManager } from './LevelUpManager';
import { LevelUpChoice, LevelUpChoiceType } from '../Data/LevelUpData';

/**
 * 战斗控制器 — 一局游戏的中枢，协调所有子系统
 *
 * 职责：
 *   - 驱动 EnemySpawner / WeaponManager 的 update
 *   - 处理经验获取和升级流程（支持连续多次升级）
 *   - 处理升级选项的应用
 *   - 判定游戏结束
 *   - 发出事件通知 UI 层
 *
 * 使用方式：
 *   由挂载在场景上的 Component（如 SvBattleScene）在 update 中调用 controller.update(dt)
 */
export class BattleController {
    readonly session: BattleSession = new BattleSession();
    readonly enemySpawner: EnemySpawner = new EnemySpawner();
    readonly weaponMgr: WeaponManager = new WeaponManager();
    readonly passiveMgr: PassiveManager = new PassiveManager();

    private _em: EventManager = EventManager.getInstance();

    /** 待处理的升级次数（支持一次获得大量经验连升多级） */
    private _pendingLevelUps: number = 0;

    private _pendingSpawns: SpawnRequest[] = [];
    private _pendingAttacks: AttackRequest[] = [];

    // ==================== 生命周期 ====================

    /** 开始战斗 */
    startBattle(startWeaponId?: string): void {
        this.session.reset();
        this.enemySpawner.reset();
        this.weaponMgr.reset();
        this.passiveMgr.reset();
        this._pendingLevelUps = 0;
        this._pendingSpawns = [];
        this._pendingAttacks = [];

        if (startWeaponId) {
            this.weaponMgr.addWeapon(startWeaponId, this.session);
        }

        this._em.emit(SurvivorEvent.BattleStart);
    }

    /** 每帧更新（由场景 Component 调用） */
    update(dt: number): void {
        if (this.session.isPaused || this.session.isOver) return;

        this.session.elapsedTime += dt;

        if (this.session.elapsedTime >= SurvivorConst.BATTLE_DURATION) {
            this.endBattle(true);
            return;
        }

        // 敌人生成
        const spawnRequests = this.enemySpawner.update(dt, this.session);
        if (spawnRequests.length > 0) {
            this._pendingSpawns.push(...spawnRequests);
        }

        // 武器冷却与攻击
        const attackRequests = this.weaponMgr.update(dt, this.session);
        if (attackRequests.length > 0) {
            this._pendingAttacks.push(...attackRequests);
        }
    }

    /** 暂停 */
    pause(): void {
        this.session.isPaused = true;
        this._em.emit(SurvivorEvent.BattlePause);
    }

    /** 恢复 */
    resume(): void {
        this.session.isPaused = false;
        this._em.emit(SurvivorEvent.BattleResume);
    }

    /** 结束战斗 */
    endBattle(survived: boolean): void {
        if (this.session.isOver) return;
        this.session.isOver = true;

        SurvivorGameState.getInstance().updateBattleResult(
            this.session.elapsedTime,
            this.session.killCount,
            this.session.coinsCollected
        );

        this._em.emit(SurvivorEvent.BattleEnd, {
            survived,
            time: this.session.elapsedTime,
            kills: this.session.killCount,
            coins: this.session.coinsCollected,
            level: this.session.playerLevel,
        });
    }

    // ==================== 游戏事件处理 ====================

    /** 敌人被击杀（由场景层调用） */
    onEnemyKilled(expDrop: number): void {
        this.session.killCount++;
        this.enemySpawner.decrementActiveCount();
        this._em.emit(SurvivorEvent.EnemyKilled, this.session.killCount);

        this.addExp(expDrop);
    }

    /** 拾取经验宝石（由场景层调用） */
    onGemPickedUp(expAmount: number): void {
        this.addExp(expAmount);
        this._em.emit(SurvivorEvent.GemPickedUp, expAmount);
    }

    /** 玩家受到伤害（由场景层调用） */
    onPlayerHit(damage: number): void {
        const died = this.session.takeDamage(damage);
        this._em.emit(SurvivorEvent.PlayerHPChanged, this.session.playerHP, this.session.playerStats.maxHP);

        if (died) {
            this._em.emit(SurvivorEvent.PlayerDied);
            this.endBattle(false);
        }
    }

    /** 增加经验（支持连续多次升级） */
    private addExp(amount: number): void {
        const levelUps = this.session.addExp(amount);
        this._em.emit(SurvivorEvent.PlayerExpChanged, this.session.playerExp, this.session.expToNextLevel);

        if (levelUps > 0) {
            this._pendingLevelUps += levelUps;
            this.triggerNextLevelUp();
        }
    }

    // ==================== 升级流程 ====================

    /** 触发下一次升级选择 */
    private triggerNextLevelUp(): void {
        if (this._pendingLevelUps <= 0) return;

        this.pause();
        const choices = LevelUpManager.generateChoices(this.session, this.weaponMgr, this.passiveMgr);
        this._em.emit(SurvivorEvent.PlayerLevelUp, this.session.playerLevel);
        this._em.emit(SurvivorEvent.LevelUpChoicesReady, choices);
    }

    /** 应用升级选择（由 UI 层调用） */
    applyLevelUpChoice(choice: LevelUpChoice): void {
        switch (choice.type) {
            case LevelUpChoiceType.NewWeapon:
                this.weaponMgr.addWeapon(choice.itemId, this.session);
                this._em.emit(SurvivorEvent.WeaponAdded, choice.itemId);
                break;

            case LevelUpChoiceType.UpgradeWeapon:
                this.weaponMgr.upgradeWeapon(choice.itemId, this.session);
                this._em.emit(SurvivorEvent.WeaponUpgraded, choice.itemId, choice.targetLevel);
                break;

            case LevelUpChoiceType.NewPassive:
                this.passiveMgr.addPassive(choice.itemId, this.session);
                break;

            case LevelUpChoiceType.UpgradePassive:
                this.passiveMgr.upgradePassive(choice.itemId, this.session);
                break;

            case LevelUpChoiceType.Heal:
                this.session.heal(Math.floor(this.session.playerStats.maxHP * 0.3));
                this._em.emit(SurvivorEvent.PlayerHPChanged, this.session.playerHP, this.session.playerStats.maxHP);
                break;
        }

        this._em.emit(SurvivorEvent.LevelUpChoiceSelected, choice);
        this._pendingLevelUps--;

        // 还有待处理的升级，继续弹选择面板
        if (this._pendingLevelUps > 0) {
            this.triggerNextLevelUp();
        } else {
            this.resume();
        }
    }

    // ==================== 场景层读取 ====================

    /** 获取并清空待生成敌人列表 */
    consumeSpawnRequests(): SpawnRequest[] {
        const result = this._pendingSpawns;
        this._pendingSpawns = [];
        return result;
    }

    /** 获取并清空待执行攻击列表 */
    consumeAttackRequests(): AttackRequest[] {
        const result = this._pendingAttacks;
        this._pendingAttacks = [];
        return result;
    }
}
