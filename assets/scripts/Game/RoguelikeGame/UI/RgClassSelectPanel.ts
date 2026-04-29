import { _decorator, Button, Label, Node } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { RoguelikeUIID } from '../RoguelikeUIConfig';
import { IClassType, PlayerAttributes, ClassRarity } from '../Data/Interfaces/IClassType';
const { ccclass, property } = _decorator;

/**
 * 职业选项显示数据
 */
interface ClassDisplayItem {
    /** 职业类型 ID */
    typeId: string;
    /** 职业实例 */
    classType: IClassType;
    /** 是否已解锁 */
    unlocked: boolean;
}

/**
 * 职业选择面板
 * 展示已解锁职业列表，显示属性加成和技能预览
 */
@ccclass('RgClassSelectPanel')
export class RgClassSelectPanel extends UIBase {
    /** 职业列表容器节点 */
    @property(Node)
    m_ClassListRoot: Node = null;

    /** 职业按钮列表 */
    @property([Button])
    m_ClassBtns: Button[] = [];

    /** 职业名称标签列表 */
    @property([Label])
    m_ClassNameLabels: Label[] = [];

    /** 职业稀有度标签列表 */
    @property([Label])
    m_ClassRarityLabels: Label[] = [];

    /** 选中职业的属性预览区域 */
    @property(Label)
    m_AttrPreviewLabel: Label = null;

    /** 选中职业的技能预览区域 */
    @property(Label)
    m_SkillPreviewLabel: Label = null;

    /** 选中职业的描述文本 */
    @property(Label)
    m_DescLabel: Label = null;

    /** 确认选择按钮 */
    @property(Button)
    m_ConfirmBtn: Button = null;

    /** 天赋树按钮 */
    @property(Button)
    m_TalentTreeBtn: Button = null;

    /** 关闭按钮 */
    @property(Button)
    m_CloseBtn: Button = null;

    /** 职业列表数据 */
    private _classList: ClassDisplayItem[] = [];
    /** 当前选中索引 */
    private _selectedIndex: number = -1;

    OnInit(): void {}

    /**
     * 打开面板时接收职业列表
     * @param args[0] ClassDisplayItem[] 职业显示数据列表
     */
    OnOpen(...args: any[]): void {
        this._classList = (args[0] as ClassDisplayItem[]) ?? [];
        this._selectedIndex = -1;

        this._refreshClassList();
        this._clearPreview();

        this.SetBtnEvent(this.m_ConfirmBtn, this._onConfirm);
        this.SetBtnEvent(this.m_TalentTreeBtn, this._onOpenTalentTree);
        this.SetBtnEvent(this.m_CloseBtn, this._onClose);

        if (this.m_ConfirmBtn) {
            this.m_ConfirmBtn.interactable = false;
        }
    }

    OnClose(): void {
        super.OnClose();
        this._classList = [];
    }

    /**
     * 刷新职业列表
     */
    private _refreshClassList(): void {
        for (let i = 0; i < this.m_ClassBtns.length; i++) {
            const btn = this.m_ClassBtns[i];
            if (!btn || !btn.node) continue;

            if (i >= this._classList.length) {
                btn.node.active = false;
                continue;
            }

            btn.node.active = true;
            const item = this._classList[i];

            if (this.m_ClassNameLabels[i]) {
                this.m_ClassNameLabels[i].string = item.typeId;
            }
            if (this.m_ClassRarityLabels[i]) {
                this.m_ClassRarityLabels[i].string = item.classType.rarity;
            }

            btn.interactable = item.unlocked;

            const index = i;
            this.SetBtnEvent(btn, () => {
                this._onSelectClass(index);
            });
        }
    }

    /**
     * 选中职业，显示属性和技能预览
     */
    private _onSelectClass(index: number): void {
        if (index < 0 || index >= this._classList.length) return;

        const item = this._classList[index];
        if (!item.unlocked) return;

        this._selectedIndex = index;
        this._refreshPreview(item);

        if (this.m_ConfirmBtn) {
            this.m_ConfirmBtn.interactable = true;
        }
    }

    /**
     * 刷新属性和技能预览
     */
    private _refreshPreview(item: ClassDisplayItem): void {
        const attrs = item.classType.getBaseAttributes();
        if (this.m_AttrPreviewLabel) {
            const lines: string[] = [];
            if (attrs.maxHp) lines.push(`生命: +${attrs.maxHp}`);
            if (attrs.attack) lines.push(`攻击: +${attrs.attack}`);
            if (attrs.defense) lines.push(`防御: +${attrs.defense}`);
            if (attrs.moveSpeed) lines.push(`速度: +${attrs.moveSpeed}`);
            if (attrs.pickupRange) lines.push(`拾取: +${attrs.pickupRange}`);
            this.m_AttrPreviewLabel.string = lines.join('\n') || '无额外属性加成';
        }

        const skills = item.classType.getSkills();
        if (this.m_SkillPreviewLabel) {
            if (skills.length > 0) {
                const skillNames = skills.map(s => s.skillId).join(', ');
                this.m_SkillPreviewLabel.string = `技能: ${skillNames}`;
            } else {
                this.m_SkillPreviewLabel.string = '无初始技能';
            }
        }

        if (this.m_DescLabel) {
            this.m_DescLabel.string = `稀有度: ${item.classType.rarity}`;
        }
    }

    /**
     * 清空预览区域
     */
    private _clearPreview(): void {
        if (this.m_AttrPreviewLabel) this.m_AttrPreviewLabel.string = '';
        if (this.m_SkillPreviewLabel) this.m_SkillPreviewLabel.string = '';
        if (this.m_DescLabel) this.m_DescLabel.string = '请选择一个职业';
    }

    /**
     * 确认选择职业
     */
    private _onConfirm(): void {
        if (this._selectedIndex < 0 || this._selectedIndex >= this._classList.length) return;

        const item = this._classList[this._selectedIndex];
        EventManager.getInstance().emit(RoguelikeEvent.ClassSelected, item.typeId);
        this.CloseSelf();
    }

    /**
     * 打开天赋树面板
     */
    private _onOpenTalentTree(): void {
        if (this._selectedIndex < 0 || this._selectedIndex >= this._classList.length) return;

        const item = this._classList[this._selectedIndex];
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.TalentTreePanel, item.classType);
    }

    /**
     * 关闭面板
     */
    private _onClose(): void {
        this.CloseSelf();
    }
}
