import { _decorator, Label, ProgressBar } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
import { RoguelikeUIID } from '../RoguelikeUIConfig';
const { ccclass, property } = _decorator;

/**
 * 肉鸽游戏加载面板
 * 显示加载进度条，加载完成后自动跳转到主界面
 */
@ccclass('RgLoadingPanel')
export class RgLoadingPanel extends UIBase {
    /** 加载进度条 */
    @property(ProgressBar)
    m_ProgressBar: ProgressBar = null;

    /** 加载提示文本 */
    @property(Label)
    m_TipLabel: Label = null;

    /** 已经过的加载时间 */
    private _elapsedTime: number = 0;
    /** 模拟加载总时长（秒） */
    private _loadDuration: number = 2.0;
    /** 是否加载完成 */
    private _loadComplete: boolean = false;

    OnInit(): void {}

    /**
     * 打开面板时重置加载状态
     */
    OnOpen(...args: any[]): void {
        this._elapsedTime = 0;
        this._loadComplete = false;
        this._updateProgress(0);
    }

    OnClose(): void {
        super.OnClose();
    }

    /**
     * 每帧更新加载进度，完成后跳转主界面
     */
    protected update(dt: number): void {
        if (this._loadComplete) return;

        this._elapsedTime += dt;
        const progress = Math.min(this._elapsedTime / this._loadDuration, 1);
        this._updateProgress(progress);

        if (progress >= 1) {
            this._loadComplete = true;
            this._onLoadFinished();
        }
    }

    /**
     * 更新进度条和提示文本
     */
    private _updateProgress(progress: number): void {
        if (this.m_ProgressBar) {
            this.m_ProgressBar.progress = progress;
        }
        if (this.m_TipLabel) {
            this.m_TipLabel.string = `加载中... ${Math.floor(progress * 100)}%`;
        }
    }

    /**
     * 加载完成，关闭自身并打开主界面
     */
    private _onLoadFinished(): void {
        UIManager.GetInstance().ClosePanel(RoguelikeUIID.LoadingPanel);
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.MainPanel);
    }
}
