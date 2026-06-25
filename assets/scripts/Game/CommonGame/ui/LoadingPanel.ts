import { _decorator, Prefab, ProgressBar } from 'cc';
import { ResManager } from '../../../engine/ResManager';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
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

    OnInit(): void {}

    OnOpen(nextPanelID: number = CommonUIID.LoginPanel, _duration: number = 0, ...nextPanelArgs: any[]): void {
        this.m_NextPanelID = nextPanelID;
        this.m_NextPanelArgs = nextPanelArgs;
        if (this.m_Progress) {
            this.m_Progress.progress = 0;
        }
        this.startPreloadBundles();
    }

    OnClose(): void {
        super.OnClose();
        this.m_LoadingSerial++;
        this.m_IsLoading = false;
        this.m_NextPanelArgs = [];
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
                if (this.m_Progress) {
                    this.m_Progress.progress = progress;
                }
            },
            err => {
                if (serial !== this.m_LoadingSerial || !this.isValid) return;
                this.m_IsLoading = false;
                if (err) {
                    console.warn('LoadingPanel: 加载分包失败', err);
                    return;
                }

                this.openNextPanel();
            },
        );
    }

    private openNextPanel(): void {
        const nextPanelID = this.m_NextPanelID;
        const nextPanelArgs = this.m_NextPanelArgs;
        if (this.m_Progress) {
            this.m_Progress.progress = 1;
        }
        UIManager.GetInstance().ClosePanel(this.m_UIID || CommonUIID.LoadingPanel);
        UIManager.GetInstance().OpenPanel(nextPanelID, ...nextPanelArgs);
    }
}
