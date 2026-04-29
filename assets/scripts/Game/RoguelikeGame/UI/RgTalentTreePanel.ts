import { _decorator, Button, Label, Node } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { IClassType, TalentTreeDef, TalentTierDef, TalentDef } from '../Data/Interfaces/IClassType';
const { ccclass, property } = _decorator;

/**
 * 天赋节点运行时状态
 */
interface TalentNodeState {
    /** 天赋定义 */
    def: TalentDef;
    /** 当前已分配等级 */
    currentLevel: number;
    /** 所属层级索引 */
    tierIndex: number;
    /** 是否可分配（层级已解锁且未满级） */
    canAllocate: boolean;
}

/**
 * 天赋树面板
 * 展示天赋树层级结构，支持天赋点分配
 */
@ccclass('RgTalentTreePanel')
export class RgTalentTreePanel extends UIBase {
    /** 天赋树容器节点 */
    @property(Node)
    m_TalentTreeRoot: Node = null;

    /** 可用天赋点文本 */
    @property(Label)
    m_TalentPointsLabel: Label = null;

    /** 天赋节点按钮列表 */
    @property([Button])
    m_TalentBtns: Button[] = [];

    /** 天赋名称标签列表 */
    @property([Label])
    m_TalentNameLabels: Label[] = [];

    /** 天赋等级标签列表 */
    @property([Label])
    m_TalentLevelLabels: Label[] = [];

    /** 天赋描述标签 */
    @property(Label)
    m_TalentDescLabel: Label = null;

    /** 天赋效果标签 */
    @property(Label)
    m_TalentEffectLabel: Label = null;

    /** 层级标题标签列表 */
    @property([Label])
    m_TierLabels: Label[] = [];

    /** 重置按钮 */
    @property(Button)
    m_ResetBtn: Button = null;

    /** 关闭按钮 */
    @property(Button)
    m_CloseBtn: Button = null;

    /** 天赋树定义 */
    private _talentTree: TalentTreeDef | null = null;
    /** 天赋节点状态列表（扁平化） */
    private _talentStates: TalentNodeState[] = [];
    /** 可用天赋点 */
    private _availablePoints: number = 0;
    /** 每层已分配天赋数 */
    private _allocatedPerTier: Map<number, number> = new Map();
    /** 当前选中的天赋索引 */
    private _selectedIndex: number = -1;

    OnInit(): void {}

    /**
     * 打开面板时接收职业类型和天赋点数
     * @param args[0] IClassType 职业类型实例
     * @param args[1] number 可用天赋点
     * @param args[2] Map<string, number> 已分配天赋（talentId → level）
     */
    OnOpen(...args: any[]): void {
        const classType = args[0] as IClassType | undefined;
        this._availablePoints = (args[1] as number) ?? 0;
        const allocated = (args[2] as Map<string, number>) ?? new Map();

        if (classType) {
            this._talentTree = classType.getTalentTree();
        }

        this._buildTalentStates(allocated);
        this._refreshDisplay();

        this.SetBtnEvent(this.m_ResetBtn, this._onReset);
        this.SetBtnEvent(this.m_CloseBtn, this._onClose);
    }

    OnClose(): void {
        super.OnClose();
        this._talentTree = null;
        this._talentStates = [];
    }

    /**
     * 构建天赋节点状态列表
     */
    private _buildTalentStates(allocated: Map<string, number>): void {
        this._talentStates = [];
        this._allocatedPerTier.clear();

        if (!this._talentTree) return;

        for (const tier of this._talentTree.tiers) {
            let tierAllocated = 0;
            for (const talent of tier.talents) {
                const currentLevel = allocated.get(talent.id) ?? 0;
                tierAllocated += currentLevel;
                this._talentStates.push({
                    def: talent,
                    currentLevel,
                    tierIndex: tier.tierIndex,
                    canAllocate: false,
                });
            }
            this._allocatedPerTier.set(tier.tierIndex, tierAllocated);
        }

        this._updateCanAllocate();
    }

    /**
     * 更新每个天赋节点的可分配状态
     */
    private _updateCanAllocate(): void {
        if (!this._talentTree) return;

        for (const state of this._talentStates) {
            // 第一层始终可分配
            if (state.tierIndex === 0) {
                state.canAllocate = state.currentLevel < state.def.maxLevel && this._availablePoints > 0;
                continue;
            }

            // 检查前一层是否已分配足够天赋
            const prevTierAllocated = this._allocatedPerTier.get(state.tierIndex - 1) ?? 0;
            const required = this._talentTree.requiredPerTier;
            const tierUnlocked = prevTierAllocated >= required;

            state.canAllocate = tierUnlocked
                && state.currentLevel < state.def.maxLevel
                && this._availablePoints > 0;
        }
    }

    /**
     * 刷新整个天赋树显示
     */
    private _refreshDisplay(): void {
        if (this.m_TalentPointsLabel) {
            this.m_TalentPointsLabel.string = `天赋点: ${this._availablePoints}`;
        }

        // 刷新层级标题
        if (this._talentTree) {
            for (let i = 0; i < this.m_TierLabels.length; i++) {
                if (this.m_TierLabels[i]) {
                    if (i < this._talentTree.tiers.length) {
                        this.m_TierLabels[i].string = `第 ${i + 1} 层`;
                        this.m_TierLabels[i].node.active = true;
                    } else {
                        this.m_TierLabels[i].node.active = false;
                    }
                }
            }
        }

        // 刷新天赋节点
        for (let i = 0; i < this.m_TalentBtns.length; i++) {
            const btn = this.m_TalentBtns[i];
            if (!btn || !btn.node) continue;

            if (i >= this._talentStates.length) {
                btn.node.active = false;
                continue;
            }

            btn.node.active = true;
            const state = this._talentStates[i];

            if (this.m_TalentNameLabels[i]) {
                this.m_TalentNameLabels[i].string = state.def.name;
            }
            if (this.m_TalentLevelLabels[i]) {
                this.m_TalentLevelLabels[i].string = `${state.currentLevel}/${state.def.maxLevel}`;
            }

            btn.interactable = state.canAllocate;

            const index = i;
            this.SetBtnEvent(btn, () => {
                this._onAllocateTalent(index);
            });
        }

        this._clearDetail();
    }

    /**
     * 分配天赋点
     */
    private _onAllocateTalent(index: number): void {
        if (index < 0 || index >= this._talentStates.length) return;

        const state = this._talentStates[index];
        if (!state.canAllocate) return;

        state.currentLevel++;
        this._availablePoints--;

        // 更新层级已分配数
        const tierAllocated = (this._allocatedPerTier.get(state.tierIndex) ?? 0) + 1;
        this._allocatedPerTier.set(state.tierIndex, tierAllocated);

        this._updateCanAllocate();
        this._refreshDisplay();
        this._showDetail(index);

        EventManager.getInstance().emit(RoguelikeEvent.TalentAllocated, state.def.id, state.currentLevel);
    }

    /**
     * 显示天赋详情
     */
    private _showDetail(index: number): void {
        if (index < 0 || index >= this._talentStates.length) return;

        this._selectedIndex = index;
        const state = this._talentStates[index];

        if (this.m_TalentDescLabel) {
            this.m_TalentDescLabel.string = state.def.description;
        }
        if (this.m_TalentEffectLabel) {
            const effects = state.def.effects.map(e => {
                const sign = e.value >= 0 ? '+' : '';
                const suffix = e.modType === 'percent' ? '%' : '';
                return `${e.attribute} ${sign}${e.value}${suffix}`;
            });
            this.m_TalentEffectLabel.string = effects.join('\n') || '无效果';
        }
    }

    /**
     * 清空详情区域
     */
    private _clearDetail(): void {
        if (this.m_TalentDescLabel) this.m_TalentDescLabel.string = '';
        if (this.m_TalentEffectLabel) this.m_TalentEffectLabel.string = '';
    }

    /**
     * 重置天赋树（退还所有天赋点）
     */
    private _onReset(): void {
        let refunded = 0;
        for (const state of this._talentStates) {
            refunded += state.currentLevel;
            state.currentLevel = 0;
        }
        this._availablePoints += refunded;
        this._allocatedPerTier.clear();

        this._updateCanAllocate();
        this._refreshDisplay();
    }

    /**
     * 关闭面板
     */
    private _onClose(): void {
        this.CloseSelf();
    }
}
