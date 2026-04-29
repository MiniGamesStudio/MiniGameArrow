import { _decorator, Button, Label, Node, Sprite } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { PetDisplayInfo } from '../Data/Interfaces/IPetType';
const { ccclass, property } = _decorator;

/**
 * 宠物面板
 * 展示宠物信息和替换确认
 */
@ccclass('RgPetPanel')
export class RgPetPanel extends UIBase {
    /** 当前宠物名称 */
    @property(Label)
    m_CurrentPetNameLabel: Label = null;

    /** 当前宠物描述 */
    @property(Label)
    m_CurrentPetDescLabel: Label = null;

    /** 当前宠物等级 */
    @property(Label)
    m_CurrentPetLevelLabel: Label = null;

    /** 当前宠物稀有度 */
    @property(Label)
    m_CurrentPetRarityLabel: Label = null;

    /** 当前宠物图标 */
    @property(Sprite)
    m_CurrentPetIcon: Sprite = null;

    /** 新宠物信息区域（替换时显示） */
    @property(Node)
    m_NewPetRoot: Node = null;

    /** 新宠物名称 */
    @property(Label)
    m_NewPetNameLabel: Label = null;

    /** 新宠物描述 */
    @property(Label)
    m_NewPetDescLabel: Label = null;

    /** 新宠物等级 */
    @property(Label)
    m_NewPetLevelLabel: Label = null;

    /** 新宠物稀有度 */
    @property(Label)
    m_NewPetRarityLabel: Label = null;

    /** 确认替换按钮 */
    @property(Button)
    m_ReplaceBtn: Button = null;

    /** 取消替换按钮 */
    @property(Button)
    m_CancelBtn: Button = null;

    /** 关闭按钮 */
    @property(Button)
    m_CloseBtn: Button = null;

    /** 提示文本 */
    @property(Label)
    m_TipLabel: Label = null;

    /** 当前宠物信息 */
    private _currentPet: PetDisplayInfo | null = null;
    /** 新宠物信息（替换候选） */
    private _newPet: PetDisplayInfo | null = null;
    /** 新宠物类型 ID */
    private _newPetTypeId: string = '';

    OnInit(): void {}

    /**
     * 打开面板时接收宠物数据
     * @param args[0] PetDisplayInfo 当前宠物信息（null 表示无宠物）
     * @param args[1] PetDisplayInfo 新宠物信息（null 表示仅查看）
     * @param args[2] string 新宠物类型 ID
     */
    OnOpen(...args: any[]): void {
        this._currentPet = (args[0] as PetDisplayInfo) ?? null;
        this._newPet = (args[1] as PetDisplayInfo) ?? null;
        this._newPetTypeId = (args[2] as string) ?? '';

        this._refreshCurrentPet();
        this._refreshNewPet();

        this.SetBtnEvent(this.m_ReplaceBtn, this._onReplace);
        this.SetBtnEvent(this.m_CancelBtn, this._onCancel);
        this.SetBtnEvent(this.m_CloseBtn, this._onClose);
    }

    OnClose(): void {
        super.OnClose();
        this._currentPet = null;
        this._newPet = null;
    }

    /**
     * 刷新当前宠物信息
     */
    private _refreshCurrentPet(): void {
        if (!this._currentPet) {
            if (this.m_CurrentPetNameLabel) this.m_CurrentPetNameLabel.string = '无宠物';
            if (this.m_CurrentPetDescLabel) this.m_CurrentPetDescLabel.string = '';
            if (this.m_CurrentPetLevelLabel) this.m_CurrentPetLevelLabel.string = '';
            if (this.m_CurrentPetRarityLabel) this.m_CurrentPetRarityLabel.string = '';
            return;
        }

        if (this.m_CurrentPetNameLabel) {
            this.m_CurrentPetNameLabel.string = this._currentPet.name;
        }
        if (this.m_CurrentPetDescLabel) {
            this.m_CurrentPetDescLabel.string = this._currentPet.description;
        }
        if (this.m_CurrentPetLevelLabel) {
            this.m_CurrentPetLevelLabel.string = `Lv.${this._currentPet.level}`;
        }
        if (this.m_CurrentPetRarityLabel) {
            this.m_CurrentPetRarityLabel.string = this._currentPet.rarity;
        }
        // TODO: 加载图标
    }

    /**
     * 刷新新宠物信息（替换候选）
     */
    private _refreshNewPet(): void {
        const hasNewPet = this._newPet !== null;

        if (this.m_NewPetRoot) {
            this.m_NewPetRoot.active = hasNewPet;
        }
        if (this.m_ReplaceBtn && this.m_ReplaceBtn.node) {
            this.m_ReplaceBtn.node.active = hasNewPet;
        }
        if (this.m_CancelBtn && this.m_CancelBtn.node) {
            this.m_CancelBtn.node.active = hasNewPet;
        }

        if (!hasNewPet) {
            if (this.m_TipLabel) {
                this.m_TipLabel.string = this._currentPet ? '' : '尚未获得宠物';
            }
            return;
        }

        if (this.m_NewPetNameLabel) {
            this.m_NewPetNameLabel.string = this._newPet!.name;
        }
        if (this.m_NewPetDescLabel) {
            this.m_NewPetDescLabel.string = this._newPet!.description;
        }
        if (this.m_NewPetLevelLabel) {
            this.m_NewPetLevelLabel.string = `Lv.${this._newPet!.level}`;
        }
        if (this.m_NewPetRarityLabel) {
            this.m_NewPetRarityLabel.string = this._newPet!.rarity;
        }

        if (this.m_TipLabel) {
            this.m_TipLabel.string = '是否替换当前宠物？';
        }
    }

    /**
     * 确认替换宠物
     */
    private _onReplace(): void {
        if (!this._newPet) return;

        EventManager.getInstance().emit(RoguelikeEvent.PetReplaced, this._newPetTypeId);
        this.CloseSelf();
    }

    /**
     * 取消替换
     */
    private _onCancel(): void {
        this.CloseSelf();
    }

    /**
     * 关闭面板
     */
    private _onClose(): void {
        this.CloseSelf();
    }
}
