import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/** 客户端事件枚举 */
export enum CustomClientEvent {
    FlowerDissolve = "FlowerDissolve",
    CheckVictory = "CheckVictory",
    RetryLevel = "RetryLevel",
    NextLevel = "NextLevel",
    LevelLoaded = "LevelLoaded",
    GamePaused = "GamePaused",
    GameResumed = "GameResumed",
    ScoreChanged = "ScoreChanged",
}
