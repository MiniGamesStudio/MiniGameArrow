import { _decorator, Button, Component, resources, Prefab, instantiate, Node } from 'cc';
import { UIManager } from './UIManager';
const { ccclass } = _decorator;

/**
 * UI 基类 — 所有面板的父类，提供生命周期钩子和子页面管理
 * 引擎层：依赖 Cocos Creator Component 系统
 */
@ccclass('UIBase')
export abstract class UIBase extends Component {
    /** 面板运行时唯一 ID */
    public m_PanelID: number = 0;
    /** 面板注册 ID（对应 UIDataRegistry 中的 id） */
    public m_UIID: number = 0;

    protected m_SubPageMap: Map<string, Node> = new Map();
    protected m_PendingSubPageSet: Set<string> = new Set();

    /** 初始化（仅首次创建时调用） */
    OnInit(): void {}

    /** 打开面板（每次显示时调用） */
    OnOpen(...args: any[]): void {}

    /** 关闭面板 */
    OnClose(): void {
        this.m_PendingSubPageSet.clear();
        Array.from(this.m_SubPageMap.entries()).forEach(([key, value]) => {
            if (value) {
                this.DetachUIPage(key, value);
            }
        });
    }

    /** 关闭自身 */
    CloseSelf(): void {
        if (this.m_UIID) {
            UIManager.GetInstance().ClosePanel(this.m_UIID);
        }
    }

    /** 安全绑定按钮事件（自动移除旧监听，防止重复绑定） */
    SetBtnEvent(btn: Button, callback: () => void, eventName: string = "click"): void {
        if (btn && btn.node) {
            btn.node.off(eventName);
            btn.node.on(eventName, callback, this);
        }
    }

    /** 加载子页面（pageName 唯一标识） */
    AttachUIPage(root: Node, pageName: string, prefabPath: string, ...args: any[]): void {
        if (!root) return;

        const subPageNode = this.m_SubPageMap.get(pageName);
        if (subPageNode && subPageNode.isValid) {
            subPageNode.active = true;
            const uiScript = subPageNode.getComponent(UIBase);
            if (uiScript) {
                uiScript.OnOpen(...args);
            }
            return;
        }
        if (subPageNode && !subPageNode.isValid) {
            this.m_SubPageMap.delete(pageName);
        }
        if (this.m_PendingSubPageSet.has(pageName)) return;

        this.m_PendingSubPageSet.add(pageName);
        resources.load(prefabPath, Prefab, (err, prefab) => {
            if (err || !this.isValid || !root || !root.isValid || !this.m_PendingSubPageSet.has(pageName)) {
                this.m_PendingSubPageSet.delete(pageName);
                return;
            }
            this.m_PendingSubPageSet.delete(pageName);

            const pageNode = instantiate(prefab);
            pageNode.parent = root;
            pageNode.setPosition(0, 0);
            pageNode.active = true;

            const uiScript = pageNode.getComponent(UIBase);
            if (uiScript) {
                uiScript.OnInit();
                uiScript.OnOpen(...args);
            }

            this.m_SubPageMap.set(pageName, pageNode);
        });
    }

    /** 卸载子页面 */
    DetachUIPage(subPageName: string, subPageNode: Node): void {
        this.m_PendingSubPageSet.delete(subPageName);
        if (!subPageNode || !subPageNode.isValid) {
            this.m_SubPageMap.delete(subPageName);
            return;
        }

        const uiScript = subPageNode.getComponent(UIBase);
        if (uiScript) {
            uiScript.OnClose();
        }
        subPageNode.removeFromParent();
        subPageNode.destroy();
        this.m_SubPageMap.delete(subPageName);
    }
}
