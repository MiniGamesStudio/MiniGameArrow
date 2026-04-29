import { _decorator, Button } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeUIID } from '../RoguelikeUIConfig';
import { RoguelikeEvent } from '../RoguelikeEvent';
const { ccclass, property } = _decorator;

/**
 * 肉鸽游戏主界面
 * 提供开始游戏、永久升级、换装、职业选择等入口按钮
 */
@ccclass('RgMainPanel')
export class RgMainPanel extends UIBase {
    /** 开始游戏按钮 */
    @property(Button)
    m_StartGameBtn: Button = null;

    /** 永久升级按钮 */
    @property(Button)
    m_MetaUpgradeBtn: Button = null;

    /** 换装按钮 */
    @property(Button)
    m_CostumeBtn: Button = null;

    /** 职业选择按钮 */
    @property(Button)
    m_ClassSelectBtn: Button = null;

    /** 宠物按钮 */
    @property(Button)
    m_PetBtn: Button = null;

    OnInit(): void {}

    /**
     * 打开面板时绑定所有按钮事件
     */
    OnOpen(...args: any[]): void {
        this.SetBtnEvent(this.m_StartGameBtn, this._onStartGame);
        this.SetBtnEvent(this.m_MetaUpgradeBtn, this._onMetaUpgrade);
        this.SetBtnEvent(this.m_CostumeBtn, this._onCostume);
        this.SetBtnEvent(this.m_ClassSelectBtn, this._onClassSelect);
        this.SetBtnEvent(this.m_PetBtn, this._onPet);
    }

    OnClose(): void {
        super.OnClose();
    }

    /**
     * 开始游戏：发送 RunStart 事件，关闭主界面，打开战斗 HUD
     */
    private _onStartGame(): void {
        EventManager.getInstance().emit(RoguelikeEvent.RunStart);
        this.CloseSelf();
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.BattleHUD);
    }

    /**
     * 打开永久升级面板
     */
    private _onMetaUpgrade(): void {
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.MetaUpgradePanel);
    }

    /**
     * 打开换装面板
     */
    private _onCostume(): void {
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.CostumePanel);
    }

    /**
     * 打开职业选择面板
     */
    private _onClassSelect(): void {
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.ClassSelectPanel);
    }

    /**
     * 打开宠物面板
     */
    private _onPet(): void {
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.PetPanel);
    }
}
