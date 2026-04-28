/**
 * 肉鸽动作游戏事件
 */
export enum RoguelikeEvent {
    // 模块生命周期
    ModuleInitialized = "Roguelike.ModuleInitialized",

    // 战斗流程
    RunStart = "Roguelike.RunStart",
    RunEnd = "Roguelike.RunEnd",
    BattlePause = "Roguelike.BattlePause",
    BattleResume = "Roguelike.BattleResume",
    FloorEnter = "Roguelike.FloorEnter",
    RoomEnter = "Roguelike.RoomEnter",
    RoomClear = "Roguelike.RoomClear",

    // 玩家
    PlayerHPChanged = "Roguelike.PlayerHPChanged",
    PlayerDied = "Roguelike.PlayerDied",
    PlayerExpChanged = "Roguelike.PlayerExpChanged",
    PlayerLevelUp = "Roguelike.PlayerLevelUp",
    PlayerGoldChanged = "Roguelike.PlayerGoldChanged",

    // 升级
    LevelUpChoicesReady = "Roguelike.LevelUpChoicesReady",
    LevelUpChoiceSelected = "Roguelike.LevelUpChoiceSelected",

    // 敌人
    EnemyKilled = "Roguelike.EnemyKilled",
    BossDefeated = "Roguelike.BossDefeated",

    // 武器与道具
    WeaponAdded = "Roguelike.WeaponAdded",
    WeaponUpgraded = "Roguelike.WeaponUpgraded",
    ItemPickedUp = "Roguelike.ItemPickedUp",

    // 职业
    ClassSelected = "Roguelike.ClassSelected",
    ClassSwitched = "Roguelike.ClassSwitched",
    ClassUnlocked = "Roguelike.ClassUnlocked",
    TalentAllocated = "Roguelike.TalentAllocated",
    SkillUsed = "Roguelike.SkillUsed",

    // 宠物
    PetObtained = "Roguelike.PetObtained",
    PetReplaced = "Roguelike.PetReplaced",
    PetLevelUp = "Roguelike.PetLevelUp",

    // NPC
    NpcInteract = "Roguelike.NpcInteract",
    NpcAffinityChanged = "Roguelike.NpcAffinityChanged",
    NpcCooperationReward = "Roguelike.NpcCooperationReward",
    NpcServiceUsed = "Roguelike.NpcServiceUsed",

    // 商店
    ShopItemPurchased = "Roguelike.ShopItemPurchased",

    // 事件
    EventTriggered = "Roguelike.EventTriggered",
    EventOptionSelected = "Roguelike.EventOptionSelected",

    // 换装
    CostumeEquipped = "Roguelike.CostumeEquipped",
    CostumeUnlocked = "Roguelike.CostumeUnlocked",

    // 永久成长
    MetaUpgradePurchased = "Roguelike.MetaUpgradePurchased",
}
