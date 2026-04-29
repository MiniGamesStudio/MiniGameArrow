import { _decorator, Button, Color, Label, Node } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { ShopItem } from '../Data/Interfaces/IShopGoods';
const { ccclass, property } = _decorator;

/**
 * 商店面板
 * 展示商品列表、价格、购买按钮，金币不足时显示提示
 */
@ccclass('RgShopPanel')
export class RgShopPanel extends UIBase {
    /** 商品列表容器节点 */
    @property(Node)
    m_ItemListRoot: Node = null;

    /** 玩家金币文本 */
    @property(Label)
    m_GoldLabel: Label = null;

    /** 提示文本（金币不足等） */
    @property(Label)
    m_TipLabel: Label = null;

    /** 关闭按钮 */
    @property(Button)
    m_CloseBtn: Button = null;

    /** 当前商品列表 */
    private _shopItems: ShopItem[] = [];
    /** 当前玩家金币 */
    private _playerGold: number = 0;
    /** 提示文本消失计时器 */
    private _tipTimer: number = 0;

    OnInit(): void {}

    /**
     * 打开面板时接收商品列表和玩家金币
     * @param args[0] ShopItem[] 商品列表
     * @param args[1] number 玩家当前金币
     */
    OnOpen(...args: any[]): void {
        this._shopItems = (args[0] as ShopItem[]) ?? [];
        this._playerGold = (args[1] as number) ?? 0;

        const em = EventManager.getInstance();
        em.on(RoguelikeEvent.PlayerGoldChanged, this._onGoldChanged, this);
        em.on(RoguelikeEvent.ShopItemPurchased, this._onItemPurchased, this);

        this.SetBtnEvent(this.m_CloseBtn, this._onClose);
        this._hideTip();
        this._refreshShop();
    }

    OnClose(): void {
        super.OnClose();
        EventManager.getInstance().offAllByTarget(this);
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
     * 金币变化回调
     */
    private _onGoldChanged(gold: number): void {
        this._playerGold = gold;
        this._updateGoldLabel();
    }

    /**
     * 商品购买成功回调
     */
    private _onItemPurchased(item: ShopItem): void {
        this._refreshShop();
    }

    /**
     * 刷新商店列表显示
     */
    private _refreshShop(): void {
        this._updateGoldLabel();
        // TODO: 遍历 _shopItems，为每个商品创建/更新列表项节点
        // 每个列表项包含：名称、描述、价格、稀有度标签、购买按钮
        // 已购买的商品显示"已售出"并禁用按钮
    }

    /**
     * 尝试购买商品
     * @param index 商品索引
     */
    private _tryPurchase(index: number): void {
        if (index < 0 || index >= this._shopItems.length) return;

        const item = this._shopItems[index];
        if (item.purchased) return;

        if (this._playerGold < item.price) {
            this._showTip('金币不足！');
            return;
        }

        // 发送购买事件，由 ShopManager 处理实际购买逻辑
        EventManager.getInstance().emit(RoguelikeEvent.ShopItemPurchased, item);
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
     * 更新金币显示
     */
    private _updateGoldLabel(): void {
        if (this.m_GoldLabel) {
            this.m_GoldLabel.string = `${this._playerGold}`;
        }
    }

    /**
     * 关闭商店面板
     */
    private _onClose(): void {
        this.CloseSelf();
    }
}
