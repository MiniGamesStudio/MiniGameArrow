import { _decorator, Node } from "cc";
import { UIManager } from "./UIManager";
import { UIID } from "../UIScripts/UIData";
import { GameState } from "../Model/GameState";
import { EventManager } from "./EventManager";
import { CustomClientEvent } from "../Config/Config";
const { ccclass } = _decorator;

/**
 * 游戏管理器 — 全局生命周期管理
 */
@ccclass('GameManager')
export class GameManager {
    private static m_Instance: GameManager = null;

    static GetInstance(): GameManager {
        if (this.m_Instance == null) {
            this.m_Instance = new GameManager();
        }
        return this.m_Instance;
    }

    private m_GameWorldRoot: Node = null;
    private m_GameState: GameState = null;

    Init(gameWorldRoot: Node, uiRoot: Node): void {
        this.m_GameWorldRoot = gameWorldRoot;
        this.m_GameState = GameState.getInstance();
        UIManager.GetInstance().Init(uiRoot);
        UIManager.GetInstance().OpenPanel(UIID.LoadingPanel);
    }

    Update(dt: number): void {
        // 预留全局 update
    }

    LateUpdate(dt: number): void {
        // 预留全局 lateUpdate
    }

    Destory(): void {
        EventManager.getInstance().clear();
        this.m_GameState = null;
    }

    PauseGame(): void {
        if (this.m_GameState) {
            this.m_GameState.isPaused = true;
            EventManager.getInstance().emit(CustomClientEvent.GamePaused);
        }
    }

    ResumeGame(): void {
        if (this.m_GameState) {
            this.m_GameState.isPaused = false;
            EventManager.getInstance().emit(CustomClientEvent.GameResumed);
        }
    }
}
