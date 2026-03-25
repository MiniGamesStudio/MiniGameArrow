import { _decorator, Button, Component, resources, Prefab, instantiate, Node } from 'cc';
import { UIManager } from './UIManager';
import { UIID } from '../UIScripts/UIData';
const { ccclass, property } = _decorator;

/**
 * UI 基类 — 所有面板的父类，提供生命周期钩子和子页面管理
 */
@ccclass('UIBase')
export abstract class UIBase extends Component {
    public m_PanelID: number = 0;
    public m_UIID: UIID = UIID.None;

    protected m_SubPageMap: Map<string, Node> = new Map();

    /** 初始化（仅首次创建时调用） */
    OnInit(): void {}

    /** 打开面板（每次显示时调用） */
    OnOpen(...args: any[]): void {}

    /** 关闭面板 */
    OnClose(): void {
        this.m_SubPageMap.forEach((value, key) => {
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

    /** 安全绑定按钮事件（自动移除旧监听） */
    SetBtnEvent(btn: Button, callback: Function, eventName: string = "click"): void {
        if (btn) {
            btn.node.off(eventName);
            btn.node.on(eventName, callback);
        }
    }

    /** 加载子页面（pageName 唯一标识） */
    AttachUIPage(root: Node, pageName: string, prefabPath: string, ...args: any[]): void {
        if (!root) return;

        const subPageNode = this.m_SubPageMap.get(pageName);
        if (subPageNode) {
            subPageNode.active = true;
            const uiScript = subPageNode.getComponent(UIBase);
            if (uiScript) {
                uiScript.OnOpen(...args);
            }
            return;
        }

        resources.load(prefabPath, Prefab, (err, prefab) => {
            if (err || !root || !root.isValid) return;

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
        if (!subPageNode) return;

        const uiScript = subPageNode.getComponent(UIBase);
        if (uiScript) {
            uiScript.OnClose();
        }
        subPageNode.removeFromParent();
        subPageNode.destroy();
        this.m_SubPageMap.delete(subPageName);
    }
}
