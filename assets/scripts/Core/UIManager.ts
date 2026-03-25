import { _decorator, instantiate, Node, Prefab, resources } from 'cc';
import { UIDataSet, UIID, UIShowMode, UILayer } from '../UIScripts/UIData';
import { UIBase } from './UIBase';

const { ccclass } = _decorator;

/**
 * UI 管理器 — 管理面板的打开、关闭、缓存和分层
 */
@ccclass('UIManager')
export class UIManager {
    private static m_Instance: UIManager = null;

    static GetInstance(): UIManager {
        if (this.m_Instance == null) {
            this.m_Instance = new UIManager();
        }
        return this.m_Instance;
    }

    private m_PanelID = 1;
    private m_UIRoot: Node = null;

    /** UIID -> 面板唯一ID数组 */
    private m_PanelDataMap: Map<UIID, number[]> = new Map();
    /** 面板唯一ID -> UI节点 */
    private m_PanelNodeMap: Map<number, Node> = new Map();

    /** 各层级根节点 */
    private m_LayerRoots: Map<UILayer, Node> = new Map();

    Init(uiRoot: Node): void {
        this.m_UIRoot = uiRoot;
        this.m_PanelDataMap.clear();
        this.m_PanelNodeMap.clear();
        UIDataSet.InitUIDatas();

        const layers: [UILayer, string][] = [
            [UILayer.Background, "UI_Background"],
            [UILayer.Normal, "UI_Normal"],
            [UILayer.PopUp, "UI_Popup"],
            [UILayer.Tips, "UI_Tips"],
            [UILayer.System, "UI_System"],
            [UILayer.TopMost, "UI_Top"],
        ];

        layers.forEach(([layer, name]) => {
            const node = new Node(name);
            node.parent = this.m_UIRoot;
            this.m_LayerRoots.set(layer, node);
        });
    }

    GetUIRootByUILayer(layer: UILayer): Node | null {
        return this.m_LayerRoots.get(layer) ?? null;
    }

    /** 通过面板唯一ID关闭并销毁界面 */
    ClosePanelByID(panelID: number): boolean {
        const node = this.m_PanelNodeMap.get(panelID);
        if (!node) return false;

        const script = node.getComponent(UIBase);
        if (script) script.OnClose();

        node.removeFromParent();
        node.destroy();
        this.m_PanelNodeMap.delete(panelID);
        return true;
    }

    /** 通过面板唯一ID隐藏界面 */
    HidePanelByID(panelID: number): boolean {
        const node = this.m_PanelNodeMap.get(panelID);
        if (!node) return false;

        const script = node.getComponent(UIBase);
        if (script) script.OnClose();

        node.active = false;
        return true;
    }

    /** 通过UIID关闭界面组 */
    ClosePanel(id: UIID): boolean {
        const uidata = UIDataSet.FindUIData(id);
        const datas = this.m_PanelDataMap.get(id);
        if (!datas || !uidata) return false;

        // 关闭超出缓存数量的面板
        const closeCount = datas.length - uidata.cacheCount;
        for (let i = 0; i < closeCount; i++) {
            const pID = datas.pop();
            if (pID !== undefined) {
                this.ClosePanelByID(pID);
            }
        }

        // 隐藏剩余面板
        datas.forEach(pID => this.HidePanelByID(pID));
        this.m_PanelDataMap.set(id, datas);
        return true;
    }

    /** 通过UIID打开界面 */
    OpenPanel(id: UIID, ...args: any[]): number {
        const uidata = UIDataSet.FindUIData(id);
        if (!uidata) return 0;

        // 检查是否已有可复用的面板
        const existingID = this.CheckPanel(id, args);
        if (existingID > 0) return existingID;

        const pID = this.m_PanelID;
        resources.load(uidata.prefabPath, Prefab, (err, prefab) => {
            if (err) {
                console.warn(`UIManager: 加载面板失败 [${uidata.name}]`, err);
                return;
            }

            const root = this.GetUIRootByUILayer(uidata.layer);
            if (!root) return;

            const uiNode = instantiate(prefab);
            uiNode.parent = root;
            uiNode.setPosition(0, 0);
            uiNode.active = true;

            const uiScript = uiNode.getComponent(UIBase);
            if (uiScript) {
                uiScript.m_PanelID = this.m_PanelID;
                uiScript.m_UIID = id;
                uiScript.OnInit();
                uiScript.OnOpen(...args);
            }

            // 记录面板数据
            let uiDatas = this.m_PanelDataMap.get(id);
            if (!uiDatas) {
                uiDatas = [];
                this.m_PanelDataMap.set(id, uiDatas);
            }
            uiDatas.push(this.m_PanelID);

            this.m_PanelNodeMap.set(this.m_PanelID, uiNode);
            this.m_PanelID++;
        });

        return pID;
    }

    /** 检查是否有可复用的面板 */
    private CheckPanel(id: UIID, args: any[]): number {
        const uiDatas = this.m_PanelDataMap.get(id);
        if (!uiDatas || uiDatas.length === 0) return 0;

        let rID = 0;
        const invalidIDs: number[] = [];

        for (const panelID of uiDatas) {
            const panelNode = this.m_PanelNodeMap.get(panelID);
            if (!panelNode) {
                invalidIDs.push(panelID);
                continue;
            }

            if (!panelNode.active) {
                panelNode.active = true;
                const uiScript = panelNode.getComponent(UIBase);
                if (uiScript) {
                    uiScript.OnOpen(...args);
                }
                rID = panelID;
                break;
            } else {
                const uidata = UIDataSet.FindUIData(id);
                if (uidata && uidata.showMode === UIShowMode.Single) {
                    rID = panelID;
                    break;
                }
            }
        }

        // 清理无效ID
        if (invalidIDs.length > 0) {
            const filtered = uiDatas.filter(id => !invalidIDs.includes(id));
            this.m_PanelDataMap.set(id, filtered);
        }

        return rID;
    }
}
