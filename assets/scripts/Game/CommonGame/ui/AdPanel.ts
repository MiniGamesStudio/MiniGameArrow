import { _decorator, Button, Node } from 'cc';
import { AdManager, AdPlayResult } from '../../../engine/AdManager';
import { PlatformManager, PlatformResult } from '../../../engine/PlatformManager';
import { UIBase } from '../../../engine/ui/UIBase';
const { ccclass } = _decorator;

export type AdSkillIndex = 1 | 2 | 3;

export enum SkillRewardMode {
    Share = 'share',
    Ad = 'ad',
}

/** 技能获取方式：当前暂用分享，改为 Ad 即可恢复激励广告。 */
export let SKILL_REWARD_MODE: SkillRewardMode = SkillRewardMode.Share;

export interface AdPanelOptions {
    skillIndex: AdSkillIndex;
    onUse?: () => void;
    shareQuery?: string;
}

@ccclass('AdPanel')
export class AdPanel extends UIBase {
    private m_OnUse: (() => void) | null = null;
    private m_ShareQuery: string = '';
    private m_UseButton: Button | null = null;
    private m_IsRequestingReward: boolean = false;
    private m_RequestSerial: number = 0;

    OnInit(): void {
        const background = this.findChildByName(this.node, 'Background');
        if (!background) return;

        this.m_UseButton = this.bindButton(background, 'UseBtn', () => {
            void this.requestRewardAndUseSkill();
        });
        this.bindButton(background, 'CloseBtn', () => this.CloseSelf());
    }

    OnOpen(options: AdPanelOptions): void {
        const skillIndex = options?.skillIndex;
        if (skillIndex !== 1 && skillIndex !== 2 && skillIndex !== 3) {
            console.warn('AdPanel: 无效的技能编号', skillIndex);
            this.CloseSelf();
            return;
        }

        this.m_OnUse = options.onUse || null;
        this.m_ShareQuery = options.shareQuery || '';
        this.m_IsRequestingReward = false;
        this.m_RequestSerial++;
        this.setUseButtonInteractable(true);
        this.updateSkillContent(skillIndex);
    }

    OnClose(): void {
        super.OnClose();
        this.m_OnUse = null;
        this.m_ShareQuery = '';
        this.m_IsRequestingReward = false;
        this.m_RequestSerial++;
        this.setUseButtonInteractable(true);
    }

    private updateSkillContent(skillIndex: AdSkillIndex): void {
        for (let index = 1; index <= 3; index++) {
            const isCurrent = index === skillIndex;
            const title = this.findChildByName(this.node, `AdTitle${index}`);
            const image = this.findChildByName(this.node, `sheepImg${index}`);
            if (title) title.active = isCurrent;
            if (image) image.active = isCurrent;
        }
    }

    private async requestRewardAndUseSkill(): Promise<void> {
        if (this.m_IsRequestingReward) return;

        this.m_IsRequestingReward = true;
        this.setUseButtonInteractable(false);
        const requestSerial = ++this.m_RequestSerial;
        const rewarded = SKILL_REWARD_MODE === SkillRewardMode.Ad
            ? await this.playRewardedAd()
            : await this.shareForReward();

        if (!this.isValid || requestSerial !== this.m_RequestSerial) return;

        this.m_IsRequestingReward = false;
        this.setUseButtonInteractable(true);
        if (!rewarded) return;

        const onUse = this.m_OnUse;
        this.CloseSelf();
        onUse?.();
    }

    private async playRewardedAd(): Promise<boolean> {
        const result = await AdManager.getInstance().playRewardedVideoAd();
        if (result.result === AdPlayResult.Completed) return true;

        console.warn('AdPanel: 广告未完整播放，技能未生效', result.message);
        return false;
    }

    private async shareForReward(): Promise<boolean> {
        const result = await PlatformManager.getInstance().shareAppMessage({
            title: '快来一起玩吧',
            query: this.m_ShareQuery,
        });
        if (result.result === PlatformResult.Success) return true;

        if (result.result === PlatformResult.Unsupported) {
            console.warn('AdPanel: 当前环境不支持分享，直接发放技能奖励用于调试', result.message);
            return true;
        }

        console.warn('AdPanel: 分享未完成，技能未生效', result.message);
        return false;
    }

    private bindButton(root: Node, name: string, callback: () => void): Button | null {
        const node = this.findChildByName(root, name);
        if (!node) return null;

        const button = node.getComponent(Button) || node.addComponent(Button);
        this.SetBtnEvent(button, callback);
        return button;
    }

    private setUseButtonInteractable(interactable: boolean): void {
        if (this.m_UseButton) {
            this.m_UseButton.interactable = interactable;
        }
    }

    private findChildByName(root: Node, name: string): Node | null {
        if (!root) return null;
        if (root.name === name) return root;

        for (const child of root.children) {
            const matched = this.findChildByName(child, name);
            if (matched) return matched;
        }

        return null;
    }
}
