import { UIDataRegistry, UILayer, UIShowMode } from '../../engine/ui/UIData';

/**
 * 肉鸽动作游戏 UI ID
 */
export enum RoguelikeUIID {
    None = 0,
    LoadingPanel = 201,
    MainPanel = 202,
    BattleHUD = 203,
    LevelUpPanel = 204,
    PausePanel = 205,
    DeathPanel = 206,
    VictoryPanel = 207,
    ShopPanel = 208,
    EventPanel = 209,
    NpcPanel = 210,
    ClassSelectPanel = 211,
    TalentTreePanel = 212,
    CostumePanel = 213,
    PetPanel = 214,
    MetaUpgradePanel = 215,
}

/**
 * 注册肉鸽动作游戏的所有 UI 面板
 */
export function registerRoguelikeGameUI(): void {
    UIDataRegistry.Register(RoguelikeUIID.LoadingPanel, UILayer.System, "RgLoadingPanel", "ui/roguelike/RgLoadingPanel");
    UIDataRegistry.Register(RoguelikeUIID.MainPanel, UILayer.Normal, "RgMainPanel", "ui/roguelike/RgMainPanel");
    UIDataRegistry.Register(RoguelikeUIID.BattleHUD, UILayer.Normal, "RgBattleHUD", "ui/roguelike/RgBattleHUD");
    UIDataRegistry.Register(RoguelikeUIID.LevelUpPanel, UILayer.PopUp, "RgLevelUpPanel", "ui/roguelike/RgLevelUpPanel", UIShowMode.Single);
    UIDataRegistry.Register(RoguelikeUIID.PausePanel, UILayer.PopUp, "RgPausePanel", "ui/roguelike/RgPausePanel", UIShowMode.Single);
    UIDataRegistry.Register(RoguelikeUIID.DeathPanel, UILayer.PopUp, "RgDeathPanel", "ui/roguelike/RgDeathPanel", UIShowMode.Single);
    UIDataRegistry.Register(RoguelikeUIID.VictoryPanel, UILayer.PopUp, "RgVictoryPanel", "ui/roguelike/RgVictoryPanel", UIShowMode.Single);
    UIDataRegistry.Register(RoguelikeUIID.ShopPanel, UILayer.PopUp, "RgShopPanel", "ui/roguelike/RgShopPanel", UIShowMode.Single);
    UIDataRegistry.Register(RoguelikeUIID.EventPanel, UILayer.PopUp, "RgEventPanel", "ui/roguelike/RgEventPanel", UIShowMode.Single);
    UIDataRegistry.Register(RoguelikeUIID.NpcPanel, UILayer.PopUp, "RgNpcPanel", "ui/roguelike/RgNpcPanel", UIShowMode.Single);
    UIDataRegistry.Register(RoguelikeUIID.ClassSelectPanel, UILayer.PopUp, "RgClassSelectPanel", "ui/roguelike/RgClassSelectPanel", UIShowMode.Single);
    UIDataRegistry.Register(RoguelikeUIID.TalentTreePanel, UILayer.PopUp, "RgTalentTreePanel", "ui/roguelike/RgTalentTreePanel", UIShowMode.Single);
    UIDataRegistry.Register(RoguelikeUIID.CostumePanel, UILayer.PopUp, "RgCostumePanel", "ui/roguelike/RgCostumePanel", UIShowMode.Single);
    UIDataRegistry.Register(RoguelikeUIID.PetPanel, UILayer.PopUp, "RgPetPanel", "ui/roguelike/RgPetPanel", UIShowMode.Single);
    UIDataRegistry.Register(RoguelikeUIID.MetaUpgradePanel, UILayer.PopUp, "RgMetaUpgradePanel", "ui/roguelike/RgMetaUpgradePanel", UIShowMode.Single);
}
