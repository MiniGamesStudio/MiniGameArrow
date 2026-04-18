/**
 * 升级选项类型
 */
export enum LevelUpChoiceType {
    /** 获得新武器 */
    NewWeapon = "NewWeapon",
    /** 升级已有武器 */
    UpgradeWeapon = "UpgradeWeapon",
    /** 获得新被动 */
    NewPassive = "NewPassive",
    /** 升级已有被动 */
    UpgradePassive = "UpgradePassive",
    /** 回复生命 */
    Heal = "Heal",
}

/**
 * 升级选项
 */
export interface LevelUpChoice {
    type: LevelUpChoiceType;
    /** 武器或被动的 ID */
    itemId: string;
    /** 升级后的等级 */
    targetLevel: number;
    /** 显示名称 */
    displayName: string;
    /** 显示描述 */
    displayDesc: string;
    /** 图标路径 */
    iconPath: string;
}
