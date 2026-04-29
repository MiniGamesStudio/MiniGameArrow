import { _decorator, Button, Color, Label, Node } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { RoguelikeGameState } from '../RoguelikeGameState';
const { ccclass, property } = _decorator;

/** 永久升级项显示数据 */
interface MetaUpgradeDisplayItem {
    /** 升级项 ID */
    upgradeId: string;
    /** 升级项名称 */
    name: string;
    /** 升级项描述 */
    description: string;
    /** 当前等级 */
    currentLevel: number;
    /** 最大等级 */
    maxLevel: number;
    /** 升级费用 */
    cost: number;
    /** 每级效果值 */
    valuePerLevel: number;
    /** 影响的属性 */
    attributeType: string;
}

/**
 * 永久升级面板
 * 展示升级项目列表、当前等级、升级费用和购买按钮
 */
@ccclass('RgMetaUpgradePanel')
export class RgMetaUpgradePanel extends UIBase {
    /** 玩家金币文本 */
    @property(Label)
    m_GoldLabel: Label = null;

    /** 升级项列表容器节点 */
    @property(Node)
    m_UpgradeListRoot: Node = null;

    /** 升级项按钮列表 */
    @property([Button])
    m_UpgradeBtns: Button[] = [];

    /** 升级项名称标签列表 */
    @property([Label])
    m_UpgradeNameLabels: Label[] = [];

    /** 升级项等级标签列表 */
    @property([Label])
    m_UpgradeLevelLabels: Label[] = [];

    /** 升级项费用标签列表 */
    @property([Label])
    m_UpgradeCostLabels: Label[] = [];

    /** 选中升级项的描述 */
    @property(Label)
    m_DescLabel: Label = null;

    /** 选中升级项的效果预览 */
    @property(Label)
    m_EffectLabel: Label = null;

    /** 购买按钮 */
    @property(Button)
    m_BuyBtn: Button = null;

    /** 购买按钮文本 */
    @property(Label)
    m_BuyBtnLabel: Label = null;

    /** 提示文本 */
    @property(Label)
    m_TipLabel: Label = null;

    /** 关闭按钮 */
    @property(Button)
    m_CloseBtn: Button = null;

    /** 升级项列表 */
    private _upgrades: MetaUpgradeDisplayItem[] = [];
    /** 当前选中索引 */
    private _selectedIndex: number = -1;
    /** 当前玩家金币 */
    private _playerGold: number = 0;
    /** 提示文本消失计时器 */
    private _tipTimer: number = 0;

    OnInit(): void {}

    /**
     * 打开面板时接收升级项列表
     * @param args[0] MetaUpgradeDisplayItem[] 升级项数据列表
     */
    OnOpen(...args: any[]): void {
        this._upgrades = (args[0] as MetaUpgradeDisplayItem[]) ?? [];
        this._selectedIndex = -1;
        this._playerGold = RoguelikeGameState.getInstance().totalGold;

        const em = EventManager.getInstance();
        em.on(RoguelikeEvent.MetaUpgradePurchased, this._onUpgradePurchased, this);

        this._refreshList();
        this._clearDetail();
        this._updateGoldLabel();
        this._hideTip();

        this.SetBtnEvent(this.m_BuyBtn, this._onBuy);
        this.SetBtnEvent(this.m_CloseBtn, this._onClose);

        if (this.m_BuyBtn) {
            this.m_BuyBtn.interactable = false;
        }
    }

    OnClose(): void {
        super.OnClose();
        EventManager.getInstance().offAllByTarget(this);
        this._upgrades = [];
    }

    /**
     * 每帧更新提示文本消失计时
     */
    protected update(dt: number): void {
        if (this._tipTimer > 0) {
            this._tipTimer -= dt;
            if (this._tipTimer <= 0) {
                this._hideTip();
            }
        }
    }

    /**
     * 升级购买成功回调
     */
    private _onUpgradePurchased(upgradeId: string): void {
        // 刷新金币和列表
        this._playerGold = RoguelikeGameState.getInstance().totalGold;
        this._updateGoldLabel();

        // 更新对应升级项的等级和费用
        for (const item of this._upgrades) {
            if (item.upgradeId === upgradeId) {
                item.currentLevel++;
                // 重新计算费用（简单线性增长）
                item.cost = Math.floor(item.cost * 1.2);
                break;
            }
        }

        this._refreshList();
        if (this._selectedIndex >= 0) {
            this._showDetail(this._selectedIndex);
        }
    }

    /**
     * 刷新升级项列表
     */
    private _refreshList(): void {
        for (let i = 0; i < this.m_UpgradeBtns.length; i++) {
            const btn = this.m_UpgradeBtns[i];
            if (!btn || !btn.node) continue;

            if (i >= this._upgrades.length) {
                btn.node.active = false;
                continue;
            }

            btn.node.active = true;
            const item = this._upgrades[i];
            const isMaxed = item.currentLevel >= item.maxLevel;

            if (this.m_UpgradeNameLabels[i]) {
                this.m_UpgradeNameLabels[i].string = item.name;
            }
            if (this.m_UpgradeLevelLabels[i]) {
                this.m_UpgradeLevelLabels[i].string = `Lv.${item.currentLevel}/${item.maxLevel}`;
            }
            if (this.m_UpgradeCostLabels[i]) {
                this.m_UpgradeCostLabels[i].string = isMaxed ? 'MAX' : `${item.cost}`;
            }

            const index = i;
            this.SetBtnEvent(btn, () => {
                this._onSelectUpgrade(index);
            });
        }
    }

    /**
     * 选中升级项
     */
    private _onSelectUpgrade(index: number): void {
        if (index < 0 || index >= this._upgrades.length) return;

        this._selectedIndex = index;
        this._showDetail(index);
    }

    /**
     * 显示升级项详情
     */
    private _showDetail(index: number): void {
        const item = this._upgrades[index];
        const isMaxed = item.currentLevel >= item.maxLevel;

        if (this.m_DescLabel) {
            this.m_DescLabel.string = item.description;
        }
        if (this.m_EffectLabel) {
            const currentValue = item.valuePerLevel * item.currentLevel;
            const nextValue = item.valuePerLevel * (item.currentLevel + 1);
            if (isMaxed) {
                this.m_EffectLabel.string = `${item.attributeType}: +${currentValue} (已满级)`;
            } else {
                this.m_EffectLabel.string = `${item.attributeType}: +${currentValue} → +${nextValue}`;
            }
        }

        if (this.m_BuyBtn) {
            this.m_BuyBtn.interactable = !isMaxed && this._playerGold >= item.cost;
        }
        if (this.m_BuyBtnLabel) {
            this.m_BuyBtnLabel.string = isMaxed ? '已满级' : `升级 (${item.cost})`;
        }
    }

    /**
     * 清空详情区域
     */
    private _clearDetail(): void {
        if (this.m_DescLabel) this.m_DescLabel.string = '';
        if (this.m_EffectLabel) this.m_EffectLabel.string = '请选择升级项';
    }

    /**
     * 购买升级
     */
    private _onBuy(): void {
        if (this._selectedIndex < 0 || this._selectedIndex >= this._upgrades.length) return;

        const item = this._upgrades[this._selectedIndex];
        if (item.currentLevel >= item.maxLevel) return;

        if (this._playerGold < item.cost) {
            this._showTip('金币不足！');
            return;
        }

        EventManager.getInstance().emit(RoguelikeEvent.MetaUpgradePurchased, item.upgradeId);
    }

    /**
     * 更新金币显示
     */
    private _updateGoldLabel(): void {
        if (this.m_GoldLabel) {
            this.m_GoldLabel.string = `${this._playerGold}`;
        }
    }

    /**
     * 显示提示文本
     */
    private _showTip(text: string): void {
        if (this.m_TipLabel) {
            this.m_TipLabel.string = text;
            this.m_TipLabel.node.active = true;
            this.m_TipLabel.color = new Color(255, 80, 80);
        }
        this._tipTimer = 2.0;
    }

    /**
     * 隐藏提示文本
     */
    private _hideTip(): void {
        if (this.m_TipLabel) {
            this.m_TipLabel.node.active = false;
        }
        this._tipTimer = 0;
    }

    /**
     * 关闭面板
     */
    private _onClose(): void {
        this.CloseSelf();
    }
}
