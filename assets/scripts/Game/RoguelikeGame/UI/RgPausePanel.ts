import { _decorator, Button } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { RoguelikeUIID } from '../RoguelikeUIConfig';
const { ccclass, property } = _decorator;

/**
 * 暂停面板
 * 提供继续游戏和退出按钮
 */
@ccclass('RgPausePanel')
export class RgPausePanel extends UIBase {
    /** 继续游戏按钮 */
    @property(Button)
    m_ContinueBtn: Button = null;

    /** 退出按钮 */
    @property(Button)
    m_QuitBtn: Button = null;

    OnInit(): void {}

    OnOpen(...args: any[]): void {
        this.SetBtnEvent(this.m_ContinueBtn, this._onContinue);
        this.SetBtnEvent(this.m_QuitBtn, this._onQuit);
    }

    OnClose(): void {
        super.OnClose();
    }

    /**
     * 继续游戏：恢复战斗并关闭暂停面板
     */
    private _onContinue(): void {
        EventManager.getInstance().emit(RoguelikeEvent.BattleResume);
        this.CloseSelf();
    }

    /**
     * 退出游戏：发送 RunEnd 事件，关闭战斗 HUD，返回主界面
     */
    private _onQuit(): void {
        EventManager.getInstance().emit(RoguelikeEvent.RunEnd);
        UIManager.GetInstance().ClosePanel(RoguelikeUIID.BattleHUD);
        this.CloseSelf();
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.MainPanel);
    }
}
