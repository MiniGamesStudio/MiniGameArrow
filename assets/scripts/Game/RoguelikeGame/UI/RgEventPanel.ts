import { _decorator, Button, Label, Node } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { EventDisplayInfo, EventOption } from '../Data/Interfaces/IEventType';
const { ccclass, property } = _decorator;

/**
 * 事件面板
 * 展示事件描述和可选操作列表
 */
@ccclass('RgEventPanel')
export class RgEventPanel extends UIBase {
    /** 事件标题文本 */
    @property(Label)
    m_TitleLabel: Label = null;

    /** 事件描述文本 */
    @property(Label)
    m_DescLabel: Label = null;

    /** 选项按钮列表 */
    @property([Button])
    m_OptionBtns: Button[] = [];

    /** 选项标签文本列表 */
    @property([Label])
    m_OptionLabels: Label[] = [];

    /** 选项描述文本列表 */
    @property([Label])
    m_OptionDescLabels: Label[] = [];

    /** 选项消耗文本列表 */
    @property([Label])
    m_OptionCostLabels: Label[] = [];

    /** 结果提示文本 */
    @property(Label)
    m_ResultLabel: Label = null;

    /** 关闭按钮（事件完成后显示） */
    @property(Button)
    m_CloseBtn: Button = null;

    /** 当前事件显示信息 */
    private _displayInfo: EventDisplayInfo | null = null;
    /** 当前事件选项列表 */
    private _options: EventOption[] = [];
    /** 事件是否已完成 */
    private _completed: boolean = false;

    OnInit(): void {}

    /**
     * 打开面板时接收事件信息
     * @param args[0] EventDisplayInfo 事件显示信息
     * @param args[1] EventOption[] 事件选项列表
     */
    OnOpen(...args: any[]): void {
        this._displayInfo = (args[0] as EventDisplayInfo) ?? null;
        this._options = (args[1] as EventOption[]) ?? [];
        this._completed = false;

        this._refreshDisplay();
        this._bindButtons();
        this._hideResult();

        if (this.m_CloseBtn && this.m_CloseBtn.node) {
            this.m_CloseBtn.node.active = false;
        }
    }

    OnClose(): void {
        super.OnClose();
        this._displayInfo = null;
        this._options = [];
    }

    /**
     * 刷新事件信息显示
     */
    private _refreshDisplay(): void {
        if (this.m_TitleLabel) {
            this.m_TitleLabel.string = this._displayInfo?.title ?? '未知事件';
        }
        if (this.m_DescLabel) {
            this.m_DescLabel.string = this._displayInfo?.description ?? '';
        }

        // 刷新选项列表
        for (let i = 0; i < this.m_OptionBtns.length; i++) {
            const btn = this.m_OptionBtns[i];
            if (!btn || !btn.node) continue;

            if (i >= this._options.length) {
                btn.node.active = false;
                continue;
            }

            btn.node.active = true;
            const option = this._options[i];

            if (this.m_OptionLabels[i]) {
                this.m_OptionLabels[i].string = option.label;
            }
            if (this.m_OptionDescLabels[i]) {
                this.m_OptionDescLabels[i].string = option.description;
            }
            if (this.m_OptionCostLabels[i]) {
                if (option.cost) {
                    const costType = option.cost.type === 'gold' ? '金币' : '生命';
                    this.m_OptionCostLabels[i].string = `消耗 ${option.cost.amount} ${costType}`;
                    this.m_OptionCostLabels[i].node.active = true;
                } else {
                    this.m_OptionCostLabels[i].node.active = false;
                }
            }
        }
    }

    /**
     * 绑定选项按钮事件
     */
    private _bindButtons(): void {
        for (let i = 0; i < this.m_OptionBtns.length; i++) {
            const btn = this.m_OptionBtns[i];
            if (!btn) continue;

            const index = i;
            this.SetBtnEvent(btn, () => {
                this._onSelectOption(index);
            });
        }

        this.SetBtnEvent(this.m_CloseBtn, this._onClose);
    }

    /**
     * 选择事件选项
     */
    private _onSelectOption(index: number): void {
        if (this._completed) return;
        if (index < 0 || index >= this._options.length) return;

        this._completed = true;
        EventManager.getInstance().emit(RoguelikeEvent.EventOptionSelected, index);

        // 禁用所有选项按钮
        for (const btn of this.m_OptionBtns) {
            if (btn && btn.node) {
                btn.interactable = false;
            }
        }

        // 显示关闭按钮
        if (this.m_CloseBtn && this.m_CloseBtn.node) {
            this.m_CloseBtn.node.active = true;
        }
    }

    /**
     * 显示事件结果文本（由外部调用）
     */
    public showResult(message: string): void {
        if (this.m_ResultLabel) {
            this.m_ResultLabel.string = message;
            this.m_ResultLabel.node.active = true;
        }
    }

    /**
     * 隐藏结果文本
     */
    private _hideResult(): void {
        if (this.m_ResultLabel) {
            this.m_ResultLabel.node.active = false;
        }
    }

    /**
     * 关闭事件面板
     */
    private _onClose(): void {
        this.CloseSelf();
    }
}
