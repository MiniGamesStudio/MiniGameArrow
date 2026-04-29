import { _decorator, Button, Label, Node, ProgressBar, Sprite } from 'cc';
import { UIBase } from '../../../engine/ui/UIBase';
import { EventManager } from '../../../framework/EventManager';
import { RoguelikeEvent } from '../RoguelikeEvent';
import { NpcDisplayInfo, NpcService } from '../Data/Interfaces/INpcType';
const { ccclass, property } = _decorator;

/**
 * NPC 交互面板
 * 显示 NPC 对话、可用服务列表和好感度信息
 */
@ccclass('RgNpcPanel')
export class RgNpcPanel extends UIBase {
    /** NPC 名称文本 */
    @property(Label)
    m_NameLabel: Label = null;

    /** NPC 职能标签 */
    @property(Label)
    m_RoleLabel: Label = null;

    /** NPC 头像图标 */
    @property(Sprite)
    m_IconSprite: Sprite = null;

    /** 对话文本 */
    @property(Label)
    m_DialogueLabel: Label = null;

    /** 好感度进度条 */
    @property(ProgressBar)
    m_AffinityBar: ProgressBar = null;

    /** 好感度数值文本 */
    @property(Label)
    m_AffinityLabel: Label = null;

    /** 服务列表容器节点 */
    @property(Node)
    m_ServiceListRoot: Node = null;

    /** 服务按钮列表 */
    @property([Button])
    m_ServiceBtns: Button[] = [];

    /** 服务名称标签列表 */
    @property([Label])
    m_ServiceNameLabels: Label[] = [];

    /** 服务描述标签列表 */
    @property([Label])
    m_ServiceDescLabels: Label[] = [];

    /** 服务费用标签列表 */
    @property([Label])
    m_ServiceCostLabels: Label[] = [];

    /** 结果提示文本 */
    @property(Label)
    m_ResultLabel: Label = null;

    /** 关闭按钮 */
    @property(Button)
    m_CloseBtn: Button = null;

    /** NPC 显示信息 */
    private _npcInfo: NpcDisplayInfo | null = null;
    /** 服务列表 */
    private _services: NpcService[] = [];
    /** 对话内容列表 */
    private _dialogues: string[] = [];
    /** 当前对话索引 */
    private _dialogueIndex: number = 0;
    /** 当前好感度 */
    private _affinity: number = 0;
    /** NPC 类型 ID */
    private _npcTypeId: string = '';

    OnInit(): void {}

    /**
     * 打开面板时接收 NPC 数据
     * @param args[0] NpcDisplayInfo NPC 显示信息
     * @param args[1] NpcService[] 服务列表
     * @param args[2] string[] 对话内容
     * @param args[3] number 当前好感度
     * @param args[4] string NPC 类型 ID
     */
    OnOpen(...args: any[]): void {
        this._npcInfo = (args[0] as NpcDisplayInfo) ?? null;
        this._services = (args[1] as NpcService[]) ?? [];
        this._dialogues = (args[2] as string[]) ?? [];
        this._affinity = (args[3] as number) ?? 0;
        this._npcTypeId = (args[4] as string) ?? '';
        this._dialogueIndex = 0;

        const em = EventManager.getInstance();
        em.on(RoguelikeEvent.NpcAffinityChanged, this._onAffinityChanged, this);

        this._refreshNpcInfo();
        this._refreshDialogue();
        this._refreshAffinity();
        this._refreshServices();
        this._hideResult();

        this.SetBtnEvent(this.m_CloseBtn, this._onClose);
    }

    OnClose(): void {
        super.OnClose();
        EventManager.getInstance().offAllByTarget(this);
    }

    /**
     * 好感度变化回调
     */
    private _onAffinityChanged(npcTypeId: string, newAffinity: number): void {
        if (npcTypeId === this._npcTypeId) {
            this._affinity = newAffinity;
            this._refreshAffinity();
        }
    }

    /**
     * 刷新 NPC 基本信息
     */
    private _refreshNpcInfo(): void {
        if (this.m_NameLabel) {
            this.m_NameLabel.string = this._npcInfo?.name ?? '未知 NPC';
        }
        if (this.m_RoleLabel) {
            this.m_RoleLabel.string = this._npcInfo?.role ?? '';
        }
        // TODO: 加载 _npcInfo.icon 设置头像 SpriteFrame
    }

    /**
     * 刷新对话文本
     */
    private _refreshDialogue(): void {
        if (this.m_DialogueLabel) {
            if (this._dialogues.length > 0) {
                this.m_DialogueLabel.string = this._dialogues[this._dialogueIndex];
            } else {
                this.m_DialogueLabel.string = '......';
            }
        }
    }

    /**
     * 刷新好感度显示
     */
    private _refreshAffinity(): void {
        const maxAffinity = 100;
        if (this.m_AffinityBar) {
            this.m_AffinityBar.progress = Math.min(this._affinity / maxAffinity, 1);
        }
        if (this.m_AffinityLabel) {
            this.m_AffinityLabel.string = `好感度: ${this._affinity}`;
        }
    }

    /**
     * 刷新服务列表
     */
    private _refreshServices(): void {
        for (let i = 0; i < this.m_ServiceBtns.length; i++) {
            const btn = this.m_ServiceBtns[i];
            if (!btn || !btn.node) continue;

            if (i >= this._services.length) {
                btn.node.active = false;
                continue;
            }

            btn.node.active = true;
            const service = this._services[i];

            if (this.m_ServiceNameLabels[i]) {
                this.m_ServiceNameLabels[i].string = service.name;
            }
            if (this.m_ServiceDescLabels[i]) {
                this.m_ServiceDescLabels[i].string = service.description;
            }
            if (this.m_ServiceCostLabels[i]) {
                this.m_ServiceCostLabels[i].string = service.cost > 0 ? `${service.cost} 金币` : '免费';
            }

            btn.interactable = service.available;

            const index = i;
            this.SetBtnEvent(btn, () => {
                this._onUseService(index);
            });
        }
    }

    /**
     * 使用 NPC 服务
     */
    private _onUseService(index: number): void {
        if (index < 0 || index >= this._services.length) return;

        const service = this._services[index];
        if (!service.available) return;

        EventManager.getInstance().emit(RoguelikeEvent.NpcServiceUsed, this._npcTypeId, service.serviceId);
    }

    /**
     * 显示服务结果
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
     * 推进对话到下一句
     */
    public advanceDialogue(): void {
        if (this._dialogueIndex < this._dialogues.length - 1) {
            this._dialogueIndex++;
            this._refreshDialogue();
        }
    }

    /**
     * 关闭 NPC 面板
     */
    private _onClose(): void {
        this.CloseSelf();
    }
}
