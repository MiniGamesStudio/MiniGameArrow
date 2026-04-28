/**
 * 玩家控制器
 * 管理玩家运行时状态、移动逻辑、攻击状态、无敌帧、经验和金币
 * 纯逻辑模块，通过 InputHandler 获取输入，通过 EventManager 发送事件
 */

import { Vec2 } from '../Data/Interfaces/IEnemyType';
import { IWeaponType } from '../Data/Interfaces/IWeaponType';
import { IItemType, PlayerRuntimeState } from '../Data/Interfaces/IItemType';
import { IClassType } from '../Data/Interfaces/IClassType';
import { IPetType } from '../Data/Interfaces/IPetType';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { RoguelikeConst } from '../RoguelikeConst';
import { InputHandler } from './InputHandler';

/**
 * 完整的玩家运行时状态
 * 扩展 IItemType 中的 PlayerRuntimeState，添加完整的运行时字段
 */
export interface FullPlayerRuntimeState extends PlayerRuntimeState {
    /** 玩家位置 */
    position: Vec2;
    /** 朝向 */
    facing: Vec2;
    /** 是否正在移动 */
    isMoving: boolean;
    /** 是否正在攻击 */
    isAttacking: boolean;
    /** 是否处于无敌状态 */
    isInvincible: boolean;
    /** 无敌帧剩余时间（秒） */
    invincibleTimer: number;
    /** 已装备武器列表 */
    equippedWeapons: IWeaponType[];
    /** 已装备道具列表 */
    equippedItems: IItemType[];
    /** 当前职业 */
    currentClass: IClassType | null;
    /** 当前宠物 */
    currentPet: IPetType | null;
}

/**
 * 玩家控制器
 * 管理玩家的完整运行时状态和每帧更新逻辑
 */
export class PlayerController {
    /** 玩家运行时状态 */
    private _state: FullPlayerRuntimeState;
    /** 输入处理器 */
    private _inputHandler: InputHandler;
    /** 攻击冷却计时器（秒） */
    private _attackCooldownTimer: number = 0;
    /** 攻击冷却时间（秒），由武器决定 */
    private _attackCooldown: number = 0.5;

    constructor(inputHandler: InputHandler) {
        this._inputHandler = inputHandler;
        this._state = this._createDefaultState();
    }

    /**
     * 创建默认玩家状态
     */
    private _createDefaultState(): FullPlayerRuntimeState {
        return {
            attributes: {
                hp: RoguelikeConst.PLAYER_BASE_HP,
                maxHp: RoguelikeConst.PLAYER_BASE_HP,
                attack: RoguelikeConst.PLAYER_BASE_ATTACK,
                defense: RoguelikeConst.PLAYER_BASE_DEFENSE,
                moveSpeed: RoguelikeConst.PLAYER_BASE_SPEED,
                pickupRange: RoguelikeConst.PLAYER_BASE_PICKUP_RANGE,
            },
            position: { x: 0, y: 0 },
            facing: { x: 1, y: 0 },
            isMoving: false,
            isAttacking: false,
            isInvincible: false,
            invincibleTimer: 0,
            equippedWeapons: [],
            equippedItems: [],
            currentClass: null,
            currentPet: null,
            gold: 0,
            exp: 0,
            level: 1,
            talentPoints: 0,
        };
    }

    /**
     * 获取玩家运行时状态（只读引用）
     */
    getState(): Readonly<FullPlayerRuntimeState> {
        return this._state;
    }

    /**
     * 获取可变状态引用（供外部系统修改属性）
     */
    getMutableState(): FullPlayerRuntimeState {
        return this._state;
    }

    /**
     * 获取兼容 PlayerRuntimeState 的引用（供 IItemType 等接口使用）
     */
    getPlayerRuntimeState(): PlayerRuntimeState {
        return this._state;
    }

    // ─── 每帧更新 ───────────────────────────────────────────

    /**
     * 每帧更新
     * 处理移动、攻击冷却和无敌帧倒计时
     * @param dt 帧间隔时间（秒）
     */
    update(dt: number): void {
        this._updateMovement(dt);
        this._updateAttack(dt);
        this._updateInvincibility(dt);
    }

    /**
     * 更新移动逻辑
     * 根据 InputHandler 的方向和 moveSpeed 计算位移
     */
    private _updateMovement(dt: number): void {
        const dir = this._inputHandler.getMoveDirection();
        const isMoving = dir.x !== 0 || dir.y !== 0;

        this._state.isMoving = isMoving;

        if (isMoving) {
            // 更新朝向
            this._state.facing = { x: dir.x, y: dir.y };

            // 计算位移
            const speed = this._state.attributes.moveSpeed;
            this._state.position.x += dir.x * speed * dt;
            this._state.position.y += dir.y * speed * dt;
        }
    }

    /**
     * 更新攻击状态
     * 管理攻击冷却计时器和攻击触发
     */
    private _updateAttack(dt: number): void {
        // 冷却倒计时
        if (this._attackCooldownTimer > 0) {
            this._attackCooldownTimer -= dt;
            if (this._attackCooldownTimer <= 0) {
                this._attackCooldownTimer = 0;
                this._state.isAttacking = false;
            }
        }

        // 检查攻击输入
        if (this._inputHandler.isAttackPressed() && this._attackCooldownTimer <= 0) {
            this._state.isAttacking = true;
            this._attackCooldownTimer = this._attackCooldown;
        }
    }

    /**
     * 更新无敌帧逻辑
     * 倒计时结束后取消无敌状态
     */
    private _updateInvincibility(dt: number): void {
        if (this._state.isInvincible) {
            this._state.invincibleTimer -= dt;
            if (this._state.invincibleTimer <= 0) {
                this._state.isInvincible = false;
                this._state.invincibleTimer = 0;
            }
        }
    }

    // ─── 伤害与无敌帧 ──────────────────────────────────────

    /**
     * 玩家受到伤害
     * 如果处于无敌状态则忽略伤害，否则扣减 HP 并触发无敌帧
     * @param damage 伤害值
     * @returns 是否实际受到伤害
     */
    takeDamage(damage: number): boolean {
        if (this._state.isInvincible) {
            return false;
        }

        const prevHp = this._state.attributes.hp;
        this._state.attributes.hp = Math.max(0, prevHp - damage);

        // 触发无敌帧
        this._state.isInvincible = true;
        this._state.invincibleTimer = RoguelikeConst.PLAYER_INVINCIBLE_DURATION;

        // 发送 HP 变化事件
        EventManager.getInstance().emit(
            RoguelikeEvent.PlayerHPChanged,
            this._state.attributes.hp,
            this._state.attributes.maxHp
        );

        // 检查死亡
        if (this._state.attributes.hp <= 0) {
            EventManager.getInstance().emit(RoguelikeEvent.PlayerDied);
        }

        return true;
    }

    /**
     * 恢复生命值
     * @param amount 恢复量
     */
    heal(amount: number): void {
        const prev = this._state.attributes.hp;
        this._state.attributes.hp = Math.min(
            this._state.attributes.maxHp,
            prev + amount
        );

        if (this._state.attributes.hp !== prev) {
            EventManager.getInstance().emit(
                RoguelikeEvent.PlayerHPChanged,
                this._state.attributes.hp,
                this._state.attributes.maxHp
            );
        }
    }

    // ─── 经验与升级 ─────────────────────────────────────────

    /**
     * 获取经验值
     * 累加经验并检测是否达到升级阈值
     * @param amount 经验值
     * @returns 是否触发升级
     */
    gainExp(amount: number): boolean {
        this._state.exp += amount;

        EventManager.getInstance().emit(
            RoguelikeEvent.PlayerExpChanged,
            this._state.exp,
            this.getExpToNextLevel()
        );

        // 检测升级
        if (this._state.exp >= this.getExpToNextLevel()) {
            return this._levelUp();
        }

        return false;
    }

    /**
     * 计算当前等级升级所需经验
     * 公式: BASE_EXP * (EXP_GROWTH_FACTOR ^ currentLevel)
     */
    getExpToNextLevel(): number {
        return Math.floor(
            RoguelikeConst.BASE_EXP_TO_LEVEL *
            Math.pow(RoguelikeConst.EXP_GROWTH_FACTOR, this._state.level)
        );
    }

    /**
     * 执行升级
     * 扣除所需经验，提升等级，授予天赋点
     */
    private _levelUp(): boolean {
        const required = this.getExpToNextLevel();
        this._state.exp -= required;
        this._state.level++;
        this._state.talentPoints++;

        EventManager.getInstance().emit(
            RoguelikeEvent.PlayerLevelUp,
            this._state.level
        );

        return true;
    }

    // ─── 金币管理 ───────────────────────────────────────────

    /**
     * 获取金币
     * @param amount 金币数量
     */
    gainGold(amount: number): void {
        this._state.gold += amount;

        EventManager.getInstance().emit(
            RoguelikeEvent.PlayerGoldChanged,
            this._state.gold
        );
    }

    /**
     * 消耗金币
     * @param amount 消耗数量
     * @returns 是否成功消耗（金币不足时返回 false）
     */
    spendGold(amount: number): boolean {
        if (this._state.gold < amount) {
            return false;
        }
        this._state.gold -= amount;

        EventManager.getInstance().emit(
            RoguelikeEvent.PlayerGoldChanged,
            this._state.gold
        );

        return true;
    }

    // ─── 装备管理 ───────────────────────────────────────────

    /**
     * 装备武器
     * @param weapon 武器实例
     * @returns 是否成功装备
     */
    equipWeapon(weapon: IWeaponType): boolean {
        if (this._state.equippedWeapons.length >= RoguelikeConst.MAX_WEAPON_SLOTS) {
            return false;
        }
        this._state.equippedWeapons.push(weapon);

        EventManager.getInstance().emit(
            RoguelikeEvent.WeaponAdded,
            weapon
        );

        return true;
    }

    /**
     * 装备道具（应用被动效果）
     * @param item 道具实例
     */
    equipItem(item: IItemType): void {
        this._state.equippedItems.push(item);
        item.applyEffect(this._state);

        EventManager.getInstance().emit(
            RoguelikeEvent.ItemPickedUp,
            item
        );
    }

    // ─── 职业与宠物 ─────────────────────────────────────────

    /**
     * 设置当前职业
     * @param classType 职业实例
     */
    setClass(classType: IClassType | null): void {
        this._state.currentClass = classType;
    }

    /**
     * 设置当前宠物
     * @param pet 宠物实例
     */
    setPet(pet: IPetType | null): void {
        this._state.currentPet = pet;
    }

    // ─── 攻击冷却配置 ──────────────────────────────────────

    /**
     * 设置攻击冷却时间
     * @param cooldown 冷却时间（秒）
     */
    setAttackCooldown(cooldown: number): void {
        this._attackCooldown = cooldown;
    }

    // ─── 状态重置 ───────────────────────────────────────────

    /**
     * 重置玩家状态为默认值
     * 用于开始新的 Run
     */
    reset(): void {
        this._state = this._createDefaultState();
        this._attackCooldownTimer = 0;
        this._attackCooldown = 0.5;
    }
}
