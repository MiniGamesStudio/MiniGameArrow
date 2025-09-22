import { _decorator, Node } from "cc";
import { UIManager } from "./UIManager"
import { UIID } from "../UIScripts/UIData";
const { ccclass } = _decorator;

@ccclass('GameManager')
export class GameManager {
    private static m_Instance:GameManager = null;

    public static GetInstance(): GameManager {
        if(this.m_Instance == null){
            this.m_Instance = new GameManager();
        }

        return this.m_Instance;
    }

    private m_GamewWorldRoot = null;

    public Init(gameWorldRoot : Node, uiRoot : Node): void {
        this.m_GamewWorldRoot = gameWorldRoot;
        UIManager.GetInstance().Init(uiRoot);

        UIManager.GetInstance().OpenPanel(UIID.LoadingPanel);
    }

    public Update(dt: number): void {

    }
    
    public LateUpdate(dt: number): void {

    }
    
    public Destory(): void {

    }

    public PauseGame(): void {
        
    }

    public ResumeGame(): void {
        
    }
}


