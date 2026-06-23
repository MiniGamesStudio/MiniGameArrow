import { _decorator, ProgressBar } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
import { FrameworkConst } from '../../../framework/FrameworkConst';
import { CommonUIID } from '../CommonUIConfig';
const { ccclass, property } = _decorator;

@ccclass('LoadingPanel')
export class LoadingPanel extends UIBase {
    @property(ProgressBar)
    m_Progress: ProgressBar = null;

    private m_TimeDelta: number = 0;
    private m_Duration: number = FrameworkConst.LOADING_DURATION;
    private m_NextPanelID: number = CommonUIID.LoginPanel;
    private m_NextPanelArgs: any[] = [];

    OnInit(): void {}

    OnOpen(nextPanelID: number = CommonUIID.LoginPanel, duration: number = FrameworkConst.LOADING_DURATION, ...nextPanelArgs: any[]): void {
        this.m_TimeDelta = 0;
        this.m_Duration = duration > 0 ? duration : FrameworkConst.LOADING_DURATION;
        this.m_NextPanelID = nextPanelID;
        this.m_NextPanelArgs = nextPanelArgs;
        if (this.m_Progress) {
            this.m_Progress.progress = 0;
        }
    }

    OnClose(): void {
        super.OnClose();
        this.m_NextPanelArgs = [];
    }

    protected update(dt: number): void {
        if (!this.m_Progress) return;

        this.m_TimeDelta += dt;
        this.m_Progress.progress = Math.min(this.m_TimeDelta / this.m_Duration, 1);
        if (this.m_Progress.progress >= 1) {
            const nextPanelID = this.m_NextPanelID;
            const nextPanelArgs = this.m_NextPanelArgs;
            this.m_TimeDelta = 0;
            UIManager.GetInstance().ClosePanel(this.m_UIID || CommonUIID.LoadingPanel);
            UIManager.GetInstance().OpenPanel(nextPanelID, ...nextPanelArgs);
        }
    }
}
