import { _decorator, Button, Color, Label, Node, Sprite } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { ILevelUpOption, LevelUpDisplayInfo } from '../Data/Interfaces/ILevelUpOption';
const { ccclass, property } = _decorator;

/** 稀有度对应颜色 */
const RARITY_COLORS: Record<string, Color> = {
    common: new Color(200, 200, 200),
    rare: new Color(60, 120, 255),
    epic: new Color(180, 60, 255),
    legendary: new Color(255, 180, 0),
};

/**
 * 升级选择面板
 * 展示 3 个随机升级选项，显示图标、名称、描述和稀有度
 * 玩家选择后发送 LevelUpChoiceSelected 事件
 */
@ccclass('RgLevelUpPanel')
export class RgLevelUpPanel extends UIBase {
    /** 选项按钮列表（对应 3 个选项卡） */
    @property([Button])
    m_OptionBtns: Button[] = [];

    /** 选项名称标签列表 */
    @property([Label])
    m_NameLabels: Label[] = [];

    /** 选项描述标签列表 */
    @property([Label])
    m_DescLabels: Label[] = [];

    /** 选项稀有度标签列表 */
    @property([Label])
    m_RarityLabels: Label[] = [];

    /** 选项图标列表 */
    @property([Sprite])
    m_IconSprites: Sprite[] = [];

    /** 选项背景（用于稀有度染色） */
    @property([Sprite])
    m_BgSprites: Sprite[] = [];

    /** 当前展示的升级选项 */
    private _options: ILevelUpOption[] = [];

    OnInit(): void {}

    /**
     * 打开面板时接收升级选项列表并刷新显示
     * @param args[0] ILevelUpOption[] 升级选项数组
     */
    OnOpen(...args: any[]): void {
        const options = args[0] as ILevelUpOption[] | undefined;
        if (options && options.length > 0) {
            this._options = options;
        }

        this._refreshOptions();
        this._bindButtons();
    }

    OnClose(): void {
        super.OnClose();
        this._options = [];
    }

    /**
     * 绑定选项按钮点击事件
     */
    private _bindButtons(): void {
        for (let i = 0; i < this.m_OptionBtns.length; i++) {
            const btn = this.m_OptionBtns[i];
            if (!btn) continue;

            const index = i;
            this.SetBtnEvent(btn, () => {
                this._onSelectOption(index);
            });

            // 超出选项数量的按钮隐藏
            if (btn.node) {
                btn.node.active = i < this._options.length;
            }
        }
    }

    /**
     * 刷新所有选项卡的显示内容
     */
    private _refreshOptions(): void {
        for (let i = 0; i < this.m_OptionBtns.length; i++) {
            if (i >= this._options.length) {
                this._setOptionVisible(i, false);
                continue;
            }

            this._setOptionVisible(i, true);
            const info: LevelUpDisplayInfo = this._options[i].getDisplayInfo();
            this._updateOptionDisplay(i, info);
        }
    }

    /**
     * 更新单个选项卡的显示
     */
    private _updateOptionDisplay(index: number, info: LevelUpDisplayInfo): void {
        if (this.m_NameLabels[index]) {
            this.m_NameLabels[index].string = info.name;
        }
        if (this.m_DescLabels[index]) {
            this.m_DescLabels[index].string = info.description;
        }
        if (this.m_RarityLabels[index]) {
            this.m_RarityLabels[index].string = info.rarity.toUpperCase();
            this.m_RarityLabels[index].color = RARITY_COLORS[info.rarity] ?? RARITY_COLORS.common;
        }
        if (this.m_BgSprites[index]) {
            this.m_BgSprites[index].color = RARITY_COLORS[info.rarity] ?? RARITY_COLORS.common;
        }
        // TODO: 加载 info.icon 设置 m_IconSprites[index] 的 SpriteFrame
    }

    /**
     * 设置选项卡可见性
     */
    private _setOptionVisible(index: number, visible: boolean): void {
        const btn = this.m_OptionBtns[index];
        if (btn && btn.node) {
            btn.node.active = visible;
        }
    }

    /**
     * 选择升级选项
     * 发送 LevelUpChoiceSelected 事件并关闭面板
     */
    private _onSelectOption(index: number): void {
        if (index < 0 || index >= this._options.length) return;

        const selected = this._options[index];
        EventManager.getInstance().emit(RoguelikeEvent.LevelUpChoiceSelected, selected);
        this.CloseSelf();
    }
}
