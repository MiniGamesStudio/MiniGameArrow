import { _decorator, Prefab, ProgressBar } from 'cc';
import { ResManager } from '../../../engine/ResManager';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
import { FrameworkConst } from '../../../framework/FrameworkConst';
import { CommonBundleName, CommonUIID } from '../CommonUIConfig';
const { ccclass, property } = _decorator;

@ccclass('LoadingPanel')
export class LoadingPanel extends UIBase {
    @property(ProgressBar)
    m_Progress: ProgressBar = null;

    private m_NextPanelID: number = CommonUIID.LoginPanel;
    private m_NextPanelArgs: any[] = [];
    private m_LoadingSerial: number = 0;
    private m_IsLoading: boolean = false;
    private m_MinDuration: number = FrameworkConst.LOADING_DURATION;
    private m_ElapsedTime: number = 0;
    private m_TargetProgress: number = 0;
    private m_DisplayProgress: number = 0;
    private m_LoadComplete: boolean = false;

    OnInit(): void {}

    OnOpen(nextPanelID: number = CommonUIID.LoginPanel, duration: number = FrameworkConst.LOADING_DURATION, ...nextPanelArgs: any[]): void {
        this.m_NextPanelID = nextPanelID;
        this.m_NextPanelArgs = nextPanelArgs;
        this.m_MinDuration = duration > 0 ? duration : FrameworkConst.LOADING_DURATION;
        this.m_ElapsedTime = 0;
        this.m_TargetProgress = 0;
        this.m_DisplayProgress = 0;
        this.m_LoadComplete = false;
        if (this.m_Progress) {
            this.m_Progress.progress = 0;
        }
        this.startPreloadBundles();
    }

    OnClose(): void {
        super.OnClose();
        this.m_LoadingSerial++;
        this.m_IsLoading = false;
        this.m_LoadComplete = false;
        this.m_NextPanelArgs = [];
    }

    protected update(dt: number): void {
        if (!this.m_IsLoading && !this.m_LoadComplete) return;

        this.m_ElapsedTime += dt;
        const timeProgress = Math.min(this.m_ElapsedTime / this.m_MinDuration, 1);
        const cappedTargetProgress = this.m_LoadComplete
            ? timeProgress
            : Math.min(this.m_TargetProgress, timeProgress);
        this.m_DisplayProgress = Math.max(this.m_DisplayProgress, cappedTargetProgress);

        if (this.m_Progress) {
            this.m_Progress.progress = this.m_DisplayProgress;
        }

        if (this.m_LoadComplete && this.m_DisplayProgress >= 1) {
            this.openNextPanel();
        }
    }

    private startPreloadBundles(): void {
        if (this.m_IsLoading) return;

        this.m_IsLoading = true;
        const serial = ++this.m_LoadingSerial;
        const bundles = [CommonBundleName.Game, CommonBundleName.Rank];
        const entries = [
            { bundleName: CommonBundleName.Game, path: 'ui/GamePanel', type: Prefab },
            { bundleName: CommonBundleName.Game, path: 'ui/PausePanel', type: Prefab },
            { bundleName: CommonBundleName.Game, path: 'ui/TransitionPanel', type: Prefab },
            { bundleName: CommonBundleName.Rank, path: 'ui/RankPanel', type: Prefab },
        ];

        ResManager.getInstance().preloadBundles(
            bundles,
            entries,
            (_finished, _total, progress) => {
                if (serial !== this.m_LoadingSerial || !this.isValid) return;
                this.m_TargetProgress = Math.max(this.m_TargetProgress, progress);
            },
            err => {
                if (serial !== this.m_LoadingSerial || !this.isValid) return;
                this.m_IsLoading = false;
                if (err) {
                    console.warn('LoadingPanel: 加载分包失败', err);
                    return;
                }

                this.m_TargetProgress = 1;
                this.m_LoadComplete = true;
            },
        );
    }

    private openNextPanel(): void {
        this.m_LoadComplete = false;
        const nextPanelID = this.m_NextPanelID;
        const nextPanelArgs = this.m_NextPanelArgs;
        if (this.m_Progress) {
            this.m_Progress.progress = 1;
        }
        UIManager.GetInstance().ClosePanel(this.m_UIID || CommonUIID.LoadingPanel);
        UIManager.GetInstance().OpenPanel(nextPanelID, ...nextPanelArgs);
    }
}
