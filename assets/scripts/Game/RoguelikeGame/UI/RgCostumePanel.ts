import { _decorator, Button, Label, Node, Sprite } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
const { ccclass, property } = _decorator;

/** 装扮部位类型 */
type CostumeSlot = 'head' | 'body' | 'effect';

/** 装扮显示数据 */
interface CostumeDisplayItem {
    /** 装扮 ID */
    costumeId: string;
    /** 装扮名称 */
    name: string;
    /** 装扮描述 */
    description: string;
    /** 图标资源路径 */
    icon: string;
    /** 所属部位 */
    slot: CostumeSlot;
    /** 是否已解锁 */
    unlocked: boolean;
    /** 是否已装备 */
    equipped: boolean;
}

/**
 * 换装面板
 * 支持部位筛选、装扮预览、一键装备
 */
@ccclass('RgCostumePanel')
export class RgCostumePanel extends UIBase {
    /** 部位筛选按钮：头部 */
    @property(Button)
    m_HeadFilterBtn: Button = null;

    /** 部位筛选按钮：身体 */
    @property(Button)
    m_BodyFilterBtn: Button = null;

    /** 部位筛选按钮：特效 */
    @property(Button)
    m_EffectFilterBtn: Button = null;

    /** 全部筛选按钮 */
    @property(Button)
    m_AllFilterBtn: Button = null;

    /** 装扮列表容器节点 */
    @property(Node)
    m_CostumeListRoot: Node = null;

    /** 装扮按钮列表 */
    @property([Button])
    m_CostumeBtns: Button[] = [];

    /** 装扮名称标签列表 */
    @property([Label])
    m_CostumeNameLabels: Label[] = [];

    /** 预览区域 - 名称 */
    @property(Label)
    m_PreviewNameLabel: Label = null;

    /** 预览区域 - 描述 */
    @property(Label)
    m_PreviewDescLabel: Label = null;

    /** 预览区域 - 图标 */
    @property(Sprite)
    m_PreviewIcon: Sprite = null;

    /** 装备按钮 */
    @property(Button)
    m_EquipBtn: Button = null;

    /** 装备按钮文本 */
    @property(Label)
    m_EquipBtnLabel: Label = null;

    /** 关闭按钮 */
    @property(Button)
    m_CloseBtn: Button = null;

    /** 全部装扮数据 */
    private _allCostumes: CostumeDisplayItem[] = [];
    /** 当前筛选后的装扮列表 */
    private _filteredCostumes: CostumeDisplayItem[] = [];
    /** 当前筛选部位（null 表示全部） */
    private _currentFilter: CostumeSlot | null = null;
    /** 当前选中索引 */
    private _selectedIndex: number = -1;

    OnInit(): void {}

    /**
     * 打开面板时接收装扮列表
     * @param args[0] CostumeDisplayItem[] 装扮数据列表
     */
    OnOpen(...args: any[]): void {
        this._allCostumes = (args[0] as CostumeDisplayItem[]) ?? [];
        this._currentFilter = null;
        this._selectedIndex = -1;

        this._applyFilter();
        this._clearPreview();

        this.SetBtnEvent(this.m_AllFilterBtn, () => this._setFilter(null));
        this.SetBtnEvent(this.m_HeadFilterBtn, () => this._setFilter('head'));
        this.SetBtnEvent(this.m_BodyFilterBtn, () => this._setFilter('body'));
        this.SetBtnEvent(this.m_EffectFilterBtn, () => this._setFilter('effect'));
        this.SetBtnEvent(this.m_EquipBtn, this._onEquip);
        this.SetBtnEvent(this.m_CloseBtn, this._onClose);

        if (this.m_EquipBtn) {
            this.m_EquipBtn.interactable = false;
        }
    }

    OnClose(): void {
        super.OnClose();
        this._allCostumes = [];
        this._filteredCostumes = [];
    }

    /**
     * 设置部位筛选
     */
    private _setFilter(slot: CostumeSlot | null): void {
        this._currentFilter = slot;
        this._selectedIndex = -1;
        this._applyFilter();
        this._clearPreview();
        if (this.m_EquipBtn) {
            this.m_EquipBtn.interactable = false;
        }
    }

    /**
     * 应用筛选并刷新列表
     */
    private _applyFilter(): void {
        if (this._currentFilter) {
            this._filteredCostumes = this._allCostumes.filter(c => c.slot === this._currentFilter);
        } else {
            this._filteredCostumes = [...this._allCostumes];
        }
        this._refreshList();
    }

    /**
     * 刷新装扮列表
     */
    private _refreshList(): void {
        for (let i = 0; i < this.m_CostumeBtns.length; i++) {
            const btn = this.m_CostumeBtns[i];
            if (!btn || !btn.node) continue;

            if (i >= this._filteredCostumes.length) {
                btn.node.active = false;
                continue;
            }

            btn.node.active = true;
            const item = this._filteredCostumes[i];

            if (this.m_CostumeNameLabels[i]) {
                let label = item.name;
                if (item.equipped) label += ' [已装备]';
                if (!item.unlocked) label += ' [未解锁]';
                this.m_CostumeNameLabels[i].string = label;
            }

            btn.interactable = item.unlocked;

            const index = i;
            this.SetBtnEvent(btn, () => {
                this._onSelectCostume(index);
            });
        }
    }

    /**
     * 选中装扮，显示预览
     */
    private _onSelectCostume(index: number): void {
        if (index < 0 || index >= this._filteredCostumes.length) return;

        this._selectedIndex = index;
        const item = this._filteredCostumes[index];

        if (this.m_PreviewNameLabel) {
            this.m_PreviewNameLabel.string = item.name;
        }
        if (this.m_PreviewDescLabel) {
            this.m_PreviewDescLabel.string = item.description;
        }
        // TODO: 加载 item.icon 设置预览图标

        if (this.m_EquipBtn) {
            this.m_EquipBtn.interactable = item.unlocked && !item.equipped;
        }
        if (this.m_EquipBtnLabel) {
            this.m_EquipBtnLabel.string = item.equipped ? '已装备' : '装备';
        }
    }

    /**
     * 清空预览区域
     */
    private _clearPreview(): void {
        if (this.m_PreviewNameLabel) this.m_PreviewNameLabel.string = '';
        if (this.m_PreviewDescLabel) this.m_PreviewDescLabel.string = '请选择装扮';
    }

    /**
     * 装备选中的装扮
     */
    private _onEquip(): void {
        if (this._selectedIndex < 0 || this._selectedIndex >= this._filteredCostumes.length) return;

        const item = this._filteredCostumes[this._selectedIndex];
        if (!item.unlocked || item.equipped) return;

        // 取消同部位其他装扮的装备状态
        for (const costume of this._allCostumes) {
            if (costume.slot === item.slot) {
                costume.equipped = false;
            }
        }
        item.equipped = true;

        EventManager.getInstance().emit(RoguelikeEvent.CostumeEquipped, item.costumeId, item.slot);

        this._applyFilter();
        this._onSelectCostume(this._selectedIndex);
    }

    /**
     * 关闭面板
     */
    private _onClose(): void {
        this.CloseSelf();
    }
}
