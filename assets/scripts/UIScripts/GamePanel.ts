import { _decorator, Button, instantiate, JsonAsset, Node, Prefab, resources } from 'cc';
import { UIBase } from '../Core/UIBase';
import { UIManager } from '../Core/UIManager';
import { UIID } from './UIData';
import { FlowerPlatform } from './FlowerPlatform';
import { EventManager } from '../Core/EventManager';
import { CustomClientEvent } from '../Config/Config';
import { GameConst } from '../Config/GameConst';
import { GameState } from '../Model/GameState';
import { LevelData } from '../Model/LevelModel';
const { ccclass, property } = _decorator;

@ccclass('GamePanel')
export class GamePanel extends UIBase {
    @property(Button)
    m_CloseBtn: Button = null;
    @property(Node)
    m_LevelRoot: Node = null;
    @property(Node)
    m_FlowerImgMoveRoot: Node = null;

    private m_FlowerPlatformArr: FlowerPlatform[] = [];
    private m_CurLevelData: LevelData | null = null;

    OnInit(): void {}

    OnOpen(...args: any[]): void {
        const em = EventManager.getInstance();
        em.on(CustomClientEvent.FlowerDissolve, this.onCheckFlowerDissolve, this);
        em.on(CustomClientEvent.CheckVictory, this.onCheckVictory, this);
        em.on(CustomClientEvent.RetryLevel, this.onRetryLevel, this);
        em.on(CustomClientEvent.NextLevel, this.onNextLevel, this);
        this.initUI();
    }

    OnClose(): void {
        super.OnClose();
        EventManager.getInstance().offAllByTarget(this);
    }

    private onNextLevel(): void {
        const state = GameState.getInstance();
        this.initGameLevel(state.currentLevel + 1);
    }

    private onRetryLevel(): void {
        this.initGameLevel(GameState.getInstance().currentLevel);
    }

    private onCheckFlowerDissolve(flowerTag: number): void {
        this.m_FlowerPlatformArr.forEach(fp => fp.checkFlowerDissolve(flowerTag));
    }

    private onCheckVictory(): void {
        if (!this.m_CurLevelData) return;

        const allVictory = this.m_FlowerPlatformArr.every(fp => fp.checkVictory());
        if (allVictory) {
            GameState.getInstance().completeLevel();
            UIManager.GetInstance().OpenPanel(UIID.VictoryPanel, true);
        }
    }

    private initUI(): void {
        this.SetBtnEvent(this.m_CloseBtn, () => {
            UIManager.GetInstance().ClosePanel(UIID.VictoryPanel);
            UIManager.GetInstance().OpenPanel(UIID.VictoryPanel);
        });

        this.initGameLevel(GameState.getInstance().currentLevel);
    }

    private initGameLevel(level: number): void {
        const state = GameState.getInstance();
        state.currentLevel = level;
        state.resetRuntimeState();

        resources.load(GameConst.RES_PATH.LEVEL_DATA + level, JsonAsset, (err, jsonAsset) => {
            if (err) {
                console.warn(`GamePanel: 加载关卡 ${level} 失败`, err);
                return;
            }

            this.m_CurLevelData = jsonAsset.json as LevelData;
            this.m_LevelRoot.removeAllChildren();

            resources.load(GameConst.RES_PATH.FLOWER_PLATFORM, Prefab, (err, prefab) => {
                if (err || !prefab) return;

                FlowerPlatform.s_FlowerPotTag = 0;
                this.m_FlowerPlatformArr = [];

                for (let i = 0; i < this.m_CurLevelData!.FlowerRow; i++) {
                    const node = instantiate(prefab);
                    this.m_LevelRoot.addChild(node);

                    const script = node.getComponent(FlowerPlatform);
                    if (script) {
                        script.InitPlatForm(i, this.m_CurLevelData!.FlowerPlatform[i], this.m_CurLevelData, this.m_FlowerImgMoveRoot);
                        this.m_FlowerPlatformArr.push(script);
                    }
                }

                EventManager.getInstance().emit(CustomClientEvent.LevelLoaded, level);
            });
        });
    }
}
