import { _decorator, Button, Prefab, ProgressBar } from 'cc';
import { PlatformManager, PlatformResult } from '../../../engine/PlatformManager';
import { ResManager } from '../../../engine/ResManager';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
import { FrameworkConst } from '../../../framework/FrameworkConst';
import { CommonBundleName, CommonUIID } from '../CommonUIConfig';
const { ccclass, property } = _decorator;

@ccclass('LoginPanel')
export class LoginPanel extends UIBase {
    @property(ProgressBar)
    m_Progress: ProgressBar = null;

    private m_EnterButton: Button = null;
    private m_PrivacyButton: Button = null;
    private m_IsLoggingIn: boolean = false;
    private m_LoginSerial: number = 0;
    private m_LoadingSerial: number = 0;
    private m_IsLoadingBundles: boolean = false;
    private m_BundlesLoaded: boolean = false;
    private m_MinDuration: number = FrameworkConst.LOADING_DURATION;
    private m_ElapsedTime: number = 0;
    private m_TargetProgress: number = 0;
    private m_DisplayProgress: number = 0;
    private m_LoadComplete: boolean = false;

    OnInit(): void {}

    OnOpen(): void {
        this.ensureEnterButton();
        this.ensurePrivacyButton();
        this.setEnterButtonVisible(false);
        this.setPrivacyButtonVisible(false);
        this.setProgressVisible(true);
        this.startPreloadBundles();
    }

    OnClose(): void {
        super.OnClose();
        this.m_LoginSerial++;
        this.m_LoadingSerial++;
        this.m_IsLoggingIn = false;
        this.m_IsLoadingBundles = false;
        this.m_LoadComplete = false;
    }

    protected update(dt: number): void {
        if (!this.m_IsLoadingBundles && !this.m_LoadComplete) return;

        this.m_ElapsedTime += dt;
        const timeProgress = Math.min(this.m_ElapsedTime / this.m_MinDuration, 1);
        const cappedTargetProgress = this.m_LoadComplete
            ? timeProgress
            : Math.min(this.m_TargetProgress, timeProgress);
        this.m_DisplayProgress = Math.max(this.m_DisplayProgress, cappedTargetProgress);
        this.setProgress(this.m_DisplayProgress);

        if (this.m_LoadComplete && this.m_DisplayProgress >= 1) {
            this.finishPreloadAndLogin();
        }
    }

    private startPreloadBundles(): void {
        if (this.m_BundlesLoaded) {
            this.finishPreloadAndLogin();
            return;
        }
        if (this.m_IsLoadingBundles) return;

        this.m_IsLoadingBundles = true;
        this.m_LoadComplete = false;
        this.m_ElapsedTime = 0;
        this.m_TargetProgress = 0;
        this.m_DisplayProgress = 0;
        this.setProgressVisible(true);
        this.setProgress(0);

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
                this.m_IsLoadingBundles = false;
                if (err) {
                    console.warn('LoginPanel: 加载分包失败', err);
                    this.setEnterButtonVisible(true);
                    return;
                }

                this.m_TargetProgress = 1;
                this.m_LoadComplete = true;
            },
        );
    }

    private finishPreloadAndLogin(): void {
        this.m_LoadComplete = false;
        this.m_BundlesLoaded = true;
        this.setProgress(1);
        this.setProgressVisible(false);
        this.login();
    }

    private async login(): Promise<void> {
        if (this.m_IsLoggingIn) return;

        this.m_IsLoggingIn = true;
        const serial = ++this.m_LoginSerial;
        this.setEnterButtonVisible(false);

        const privacyResult = await PlatformManager.getInstance().ensurePrivacyAuthorize();
        if (serial !== this.m_LoginSerial || !this.isValid) return;
        if (privacyResult.result !== PlatformResult.Success) {
            this.m_IsLoggingIn = false;
            console.warn('LoginPanel: 隐私授权失败', privacyResult);
            this.setEnterButtonVisible(true);
            return;
        }

        const result = await PlatformManager.getInstance().login();
        if (serial !== this.m_LoginSerial || !this.isValid) return;

        this.m_IsLoggingIn = false;
        if (result.result === PlatformResult.Success || result.result === PlatformResult.Unsupported) {
            console.log('LoginPanel: 进入主界面', result);
            UIManager.GetInstance().ClosePanel(CommonUIID.LoginPanel);
            UIManager.GetInstance().OpenPanel(CommonUIID.MainPanel);
            return;
        }

        console.warn('LoginPanel: 登录失败', result);
        this.setEnterButtonVisible(true);
    }

    private ensureEnterButton(): void {
        if (this.m_EnterButton && this.m_EnterButton.isValid) return;

        this.m_EnterButton = this.CreateUIButton(
            this.node,
            'EnterGame',
            '进入游戏',
            'buttons/Button01_145_Orange',
            () => {
                if (this.m_BundlesLoaded) {
                    this.login();
                    return;
                }
                this.startPreloadBundles();
            },
        );
        if (this.m_EnterButton) {
            this.m_EnterButton.node.setPosition(0, -300, 0);
        }
    }

    private ensurePrivacyButton(): void {
        if (this.m_PrivacyButton && this.m_PrivacyButton.isValid) return;

        this.m_PrivacyButton = this.CreateUIButton(
            this.node,
            'PrivacyContract',
            '隐私协议',
            'buttons/Button01_145_Orange',
            () => this.openPrivacyContract(),
        );
        if (this.m_PrivacyButton) {
            this.m_PrivacyButton.node.setPosition(0, -420, 0);
            this.setPrivacyButtonVisible(false);
        }
    }

    private async openPrivacyContract(): Promise<void> {
        const result = await PlatformManager.getInstance().openPrivacyContract();
        if (result.result !== PlatformResult.Success) {
            console.warn('LoginPanel: 展示隐私协议失败', result);
        }
    }

    private setEnterButtonVisible(visible: boolean): void {
        if (this.m_EnterButton && this.m_EnterButton.isValid) {
            this.m_EnterButton.node.active = visible;
        }
    }

    private setPrivacyButtonVisible(visible: boolean): void {
        if (this.m_PrivacyButton && this.m_PrivacyButton.isValid) {
            this.m_PrivacyButton.node.active = visible;
        }
    }

    private setProgressVisible(visible: boolean): void {
        if (this.m_Progress?.node) {
            this.m_Progress.node.active = visible;
        }
    }

    private setProgress(progress: number): void {
        const clampedProgress = Math.max(0, Math.min(progress, 1));
        if (this.m_Progress) {
            this.m_Progress.progress = clampedProgress;
        }
    }
}
