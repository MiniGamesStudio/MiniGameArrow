/**
 * 武器管理器
 * 管理玩家已装备的武器列表，处理武器的添加、升级和每帧更新
 * 通过 TypeRegistry<IWeaponType> 创建武器实例
 */

import { TypeRegistry } from '../../../framework/TypeRegistry';
import { EventManager } from '../../../framework/EventManager';
import { IWeaponType } from '../Data/Interfaces/IWeaponType';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { RoguelikeConst } from '../RoguelikeConst';

/**
 * 武器管理器
 * 负责武器的装备、升级和每帧更新调度
 */
export class WeaponManager {
    /** 武器类型注册表 */
    private _weaponRegistry: TypeRegistry<IWeaponType>;
    /** 已装备武器列表 */
    private _equippedWeapons: IWeaponType[] = [];

    /**
     * @param weaponRegistry 武器类型注册表
     */
    constructor(weaponRegistry: TypeRegistry<IWeaponType>) {
        this._weaponRegistry = weaponRegistry;
    }

    /**
     * 添加并装备一把新武器
     * @param typeId 武器类型 ID
     * @returns 创建的武器实例，若武器槽已满或类型无效则返回 null
     */
    addWeapon(typeId: string): IWeaponType | null {
        if (this._equippedWeapons.length >= RoguelikeConst.MAX_WEAPON_SLOTS) {
            console.warn('WeaponManager: 武器槽已满，无法装备更多武器');
            return null;
        }

        const weapon = this._weaponRegistry.create(typeId);
        if (!weapon) {
            console.warn(`WeaponManager: 无法创建武器类型 [${typeId}]`);
            return null;
        }

        this._equippedWeapons.push(weapon);

        EventManager.getInstance().emit(
            RoguelikeEvent.WeaponAdded,
            weapon
        );

        return weapon;
    }

    /**
     * 升级已装备的指定类型武器
     * @param typeId 武器类型 ID
     * @returns 是否成功升级
     */
    upgradeWeapon(typeId: string): boolean {
        const weapon = this.getWeapon(typeId);
        if (!weapon) {
            console.warn(`WeaponManager: 未找到已装备的武器类型 [${typeId}]`);
            return false;
        }

        weapon.upgrade();

        EventManager.getInstance().emit(
            RoguelikeEvent.WeaponUpgraded,
            weapon
        );

        return true;
    }

    /**
     * 每帧更新所有已装备武器
     * @param dt 帧间隔时间（秒）
     */
    update(dt: number): void {
        for (const weapon of this._equippedWeapons) {
            weapon.update(dt);
        }
    }

    /**
     * 根据类型 ID 查找已装备的武器
     * @param typeId 武器类型 ID
     * @returns 武器实例，未找到则返回 null
     */
    getWeapon(typeId: string): IWeaponType | null {
        return this._equippedWeapons.find(w => w.typeId === typeId) ?? null;
    }

    /**
     * 获取所有已装备武器列表
     * @returns 已装备武器数组（只读）
     */
    getEquippedWeapons(): ReadonlyArray<IWeaponType> {
        return this._equippedWeapons;
    }

    /**
     * 获取当前已装备武器数量
     */
    get equippedCount(): number {
        return this._equippedWeapons.length;
    }

    /**
     * 检查武器槽是否已满
     */
    get isFull(): boolean {
        return this._equippedWeapons.length >= RoguelikeConst.MAX_WEAPON_SLOTS;
    }

    /**
     * 移除指定类型的武器
     * @param typeId 武器类型 ID
     * @returns 是否成功移除
     */
    removeWeapon(typeId: string): boolean {
        const index = this._equippedWeapons.findIndex(w => w.typeId === typeId);
        if (index === -1) {
            return false;
        }
        this._equippedWeapons.splice(index, 1);
        return true;
    }

    /**
     * 清空所有已装备武器
     */
    clear(): void {
        this._equippedWeapons.length = 0;
    }

    /**
     * 重置武器管理器
     */
    reset(): void {
        this.clear();
    }
}
