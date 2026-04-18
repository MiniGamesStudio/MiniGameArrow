/**
 * 幸存者游戏事件
 */
export enum SurvivorEvent {
    // 战斗流程
    BattleStart = "Survivor.BattleStart",
    BattlePause = "Survivor.BattlePause",
    BattleResume = "Survivor.BattleResume",
    BattleEnd = "Survivor.BattleEnd",

    // 玩家
    PlayerHPChanged = "Survivor.PlayerHPChanged",
    PlayerDied = "Survivor.PlayerDied",
    PlayerExpChanged = "Survivor.PlayerExpChanged",
    PlayerLevelUp = "Survivor.PlayerLevelUp",

    // 升级选择
    LevelUpChoicesReady = "Survivor.LevelUpChoicesReady",
    LevelUpChoiceSelected = "Survivor.LevelUpChoiceSelected",

    // 敌人
    EnemyKilled = "Survivor.EnemyKilled",
    WaveStart = "Survivor.WaveStart",
    BossSpawn = "Survivor.BossSpawn",

    // 拾取
    GemPickedUp = "Survivor.GemPickedUp",

    // 武器
    WeaponAdded = "Survivor.WeaponAdded",
    WeaponUpgraded = "Survivor.WeaponUpgraded",
}
