import { _decorator, Button, Label } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
import { RoguelikeUIID } from '../RoguelikeUIConfig';
import { RunResult, RunSettlement } from '../RoguelikeGameState';
const { ccclass, property } = _decorator;

/**
 * 胜利结算面板
 * 显示通关统计和奖励
 */
@ccclass('RgVictoryPanel')
export class RgVictoryPanel extends UIBase {
    /** 通关楼层文本 */
    @property(Label)
    m_FloorClearedLabel: Label = null;

    /** 击杀数文本 */
    @property(Label)
    m_KillCountLabel: Label = null;

    /** 存活时间文本 */
    @property(Label)
    m_SurvivalTimeLabel: Label = null;

    /** 获得金币文本 */
    @property(Label)
    m_GoldEarnedLabel: Label = null;

    /** 通关奖励加成文本 */
    @property(Label)
    m_BonusLabel: Label = null;

    /** 新成就文本 */
    @property(Label)
    m_AchievementLabel: Label = null;

    /** 返回主界面按钮 */
    @property(Button)
    m_ReturnBtn: Button = null;

    /** 再来一局按钮 */
    @property(Button)
    m_RetryBtn: Button = null;

    OnInit(): void {}

    /**
     * 打开面板时接收 Run 结果和结算数据
     * @param args[0] RunResult 本次 Run 结果
     * @param args[1] RunSettlement 结算数据
     */
    OnOpen(...args: any[]): void {
        const result = args[0] as RunResult | undefined;
        const settlement = args[1] as RunSettlement | undefined;

        this._refreshStats(result, settlement);
        this.SetBtnEvent(this.m_ReturnBtn, this._onReturn);
        this.SetBtnEvent(this.m_RetryBtn, this._onRetry);
    }

    OnClose(): void {
        super.OnClose();
    }

    /**
     * 刷新通关统计显示
     */
    private _refreshStats(result?: RunResult, settlement?: RunSettlement): void {
        if (this.m_FloorClearedLabel) {
            this.m_FloorClearedLabel.string = `${result?.floorReached ?? 1}F`;
        }
        if (this.m_KillCountLabel) {
            this.m_KillCountLabel.string = `${result?.killCount ?? 0}`;
        }
        if (this.m_SurvivalTimeLabel) {
            const time = result?.survivalTime ?? 0;
            const min = Math.floor(time / 60);
            const sec = Math.floor(time % 60);
            this.m_SurvivalTimeLabel.string = `${min}分${sec}秒`;
        }
        if (this.m_GoldEarnedLabel) {
            this.m_GoldEarnedLabel.string = `+${settlement?.goldEarned ?? 0}`;
        }
        if (this.m_BonusLabel) {
            this.m_BonusLabel.string = result?.cleared ? '通关奖励 x1.5' : '';
        }
        if (this.m_AchievementLabel) {
            const achievements = settlement?.newAchievements ?? [];
            this.m_AchievementLabel.string = achievements.length > 0
                ? achievements.join(', ')
                : '无新成就';
        }
    }

    /**
     * 返回主界面
     */
    private _onReturn(): void {
        UIManager.GetInstance().ClosePanel(RoguelikeUIID.BattleHUD);
        this.CloseSelf();
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.MainPanel);
    }

    /**
     * 再来一局
     */
    private _onRetry(): void {
        this.CloseSelf();
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.MainPanel);
    }
}
