import { _decorator, Button, Label, Node, ProgressBar, Sprite } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { UIManager } from '../../../engine/ui/UIManager';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { RoguelikeUIID } from '../RoguelikeUIConfig';
const { ccclass, property } = _decorator;

/**
 * 战斗 HUD 面板
 * 显示玩家血量条、经验条、当前楼层、已装备武器图标、金币数量、职业图标、技能冷却状态
 * 监听游戏事件实时更新显示
 */
@ccclass('RgBattleHUD')
export class RgBattleHUD extends UIBase {
    /** 血量进度条 */
    @property(ProgressBar)
    m_HpBar: ProgressBar = null;

    /** 血量数值文本 */
    @property(Label)
    m_HpLabel: Label = null;

    /** 经验进度条 */
    @property(ProgressBar)
    m_ExpBar: ProgressBar = null;

    /** 等级文本 */
    @property(Label)
    m_LevelLabel: Label = null;

    /** 楼层文本 */
    @property(Label)
    m_FloorLabel: Label = null;

    /** 金币数量文本 */
    @property(Label)
    m_GoldLabel: Label = null;

    /** 职业图标 */
    @property(Sprite)
    m_ClassIcon: Sprite = null;

    /** 武器图标容器节点 */
    @property(Node)
    m_WeaponIconRoot: Node = null;

    /** 技能冷却容器节点 */
    @property(Node)
    m_SkillCooldownRoot: Node = null;

    /** 暂停按钮 */
    @property(Button)
    m_PauseBtn: Button = null;

    /** 当前血量 */
    private _currentHp: number = 0;
    /** 最大血量 */
    private _maxHp: number = 0;
    /** 当前经验 */
    private _currentExp: number = 0;
    /** 升级所需经验 */
    private _expToNext: number = 0;
    /** 当前等级 */
    private _level: number = 1;
    /** 当前楼层 */
    private _floor: number = 1;
    /** 当前金币 */
    private _gold: number = 0;

    OnInit(): void {}

    /**
     * 打开面板时注册所有事件监听
     */
    OnOpen(...args: any[]): void {
        const em = EventManager.getInstance();
        em.on(RoguelikeEvent.PlayerHPChanged, this._onHpChanged, this);
        em.on(RoguelikeEvent.PlayerExpChanged, this._onExpChanged, this);
        em.on(RoguelikeEvent.PlayerGoldChanged, this._onGoldChanged, this);
        em.on(RoguelikeEvent.FloorEnter, this._onFloorEnter, this);
        em.on(RoguelikeEvent.PlayerLevelUp, this._onLevelUp, this);
        em.on(RoguelikeEvent.WeaponAdded, this._onWeaponChanged, this);
        em.on(RoguelikeEvent.WeaponUpgraded, this._onWeaponChanged, this);
        em.on(RoguelikeEvent.ClassSelected, this._onClassChanged, this);
        em.on(RoguelikeEvent.ClassSwitched, this._onClassChanged, this);
        em.on(RoguelikeEvent.SkillUsed, this._onSkillUsed, this);

        this.SetBtnEvent(this.m_PauseBtn, this._onPause);

        // 初始化显示
        this._refreshAll();
    }

    OnClose(): void {
        super.OnClose();
        EventManager.getInstance().offAllByTarget(this);
    }

    /**
     * 血量变化回调
     * @param currentHp 当前血量
     * @param maxHp 最大血量
     */
    private _onHpChanged(currentHp: number, maxHp: number): void {
        this._currentHp = currentHp;
        this._maxHp = maxHp;
        this._updateHpBar();
    }

    /**
     * 经验变化回调
     * @param currentExp 当前经验
     * @param expToNext 升级所需经验
     * @param level 当前等级
     */
    private _onExpChanged(currentExp: number, expToNext: number, level: number): void {
        this._currentExp = currentExp;
        this._expToNext = expToNext;
        this._level = level;
        this._updateExpBar();
    }

    /**
     * 金币变化回调
     * @param gold 当前金币数
     */
    private _onGoldChanged(gold: number): void {
        this._gold = gold;
        this._updateGoldLabel();
    }

    /**
     * 进入新楼层回调
     * @param floorIndex 楼层索引
     */
    private _onFloorEnter(floorIndex: number): void {
        this._floor = floorIndex;
        this._updateFloorLabel();
    }

    /**
     * 升级回调
     * @param newLevel 新等级
     */
    private _onLevelUp(newLevel: number): void {
        this._level = newLevel;
        this._updateExpBar();
    }

    /**
     * 武器变化回调（添加或升级）
     */
    private _onWeaponChanged(): void {
        // 占位：后续绑定 prefab 后刷新武器图标列表
        this._updateWeaponIcons();
    }

    /**
     * 职业变化回调
     */
    private _onClassChanged(): void {
        // 占位：后续绑定 prefab 后刷新职业图标
        this._updateClassIcon();
    }

    /**
     * 技能使用回调（用于更新冷却显示）
     */
    private _onSkillUsed(): void {
        // 占位：后续绑定 prefab 后刷新技能冷却 UI
        this._updateSkillCooldowns();
    }

    /**
     * 暂停按钮点击
     */
    private _onPause(): void {
        EventManager.getInstance().emit(RoguelikeEvent.BattlePause);
        UIManager.GetInstance().OpenPanel(RoguelikeUIID.PausePanel);
    }

    /**
     * 刷新所有 HUD 显示
     */
    private _refreshAll(): void {
        this._updateHpBar();
        this._updateExpBar();
        this._updateGoldLabel();
        this._updateFloorLabel();
        this._updateWeaponIcons();
        this._updateClassIcon();
        this._updateSkillCooldowns();
    }

    /** 更新血量条 */
    private _updateHpBar(): void {
        if (this.m_HpBar) {
            this.m_HpBar.progress = this._maxHp > 0 ? this._currentHp / this._maxHp : 0;
        }
        if (this.m_HpLabel) {
            this.m_HpLabel.string = `${Math.ceil(this._currentHp)}/${Math.ceil(this._maxHp)}`;
        }
    }

    /** 更新经验条 */
    private _updateExpBar(): void {
        if (this.m_ExpBar) {
            this.m_ExpBar.progress = this._expToNext > 0 ? this._currentExp / this._expToNext : 0;
        }
        if (this.m_LevelLabel) {
            this.m_LevelLabel.string = `Lv.${this._level}`;
        }
    }

    /** 更新金币文本 */
    private _updateGoldLabel(): void {
        if (this.m_GoldLabel) {
            this.m_GoldLabel.string = `${this._gold}`;
        }
    }

    /** 更新楼层文本 */
    private _updateFloorLabel(): void {
        if (this.m_FloorLabel) {
            this.m_FloorLabel.string = `${this._floor}F`;
        }
    }

    /** 更新武器图标（占位，需要 prefab 支持） */
    private _updateWeaponIcons(): void {
        // TODO: 遍历已装备武器列表，刷新图标节点
    }

    /** 更新职业图标（占位，需要 prefab 支持） */
    private _updateClassIcon(): void {
        // TODO: 根据当前职业设置图标 SpriteFrame
    }

    /** 更新技能冷却显示（占位，需要 prefab 支持） */
    private _updateSkillCooldowns(): void {
        // TODO: 遍历技能列表，更新冷却遮罩和倒计时
    }
}
