import { _decorator, Component, instantiate, Node, Prefab, resources } from 'cc';
import { UIDataSet, UIID, UIData, UIShowMode, UILayer } from '../UIScripts/UIData';
import { UIBase } from './UIBase';

const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager {
    private static m_Instance:UIManager = null;

    public static GetInstance(): UIManager {
        if(this.m_Instance == null){
            this.m_Instance = new UIManager();
        }

        return this.m_Instance;
    }
    
    //面板唯一ID
    private m_PanelID = 1;
    //UI面板根节点
    private m_UIRoot : Node = null
    //UIID为key 面板唯一ID数组为值的Map
    private m_PanelDataMap:Map<UIID, Array<number>> = new Map();
    //面板唯一ID为key UI节点为值的Map
    private m_PanelNodeMap:Map<number, Node> = new Map();

    //背景层UI根节点
    private m_UIBackgroundRoot : Node = null
    //普通层UI根节点
    private m_UINormalRoot : Node = null
    //弹出层UI根节点
    private m_UIPopupRoot : Node = null
    //提示层UI根节点
    private m_UITipsRoot : Node = null
    //系统层UI根节点
    private m_UISystemRoot : Node = null
    //最高层UI根节点
    private m_UITopRoot : Node = null

    public Init(uiRoot : Node): void {
        this.m_UIRoot = uiRoot;
        this.m_PanelDataMap.clear();
        this.m_PanelNodeMap.clear();
        UIDataSet.InitUIDatas();

        this.m_UIBackgroundRoot = new Node("UI_Background");     // 背景层（如登录背景）
        this.m_UIBackgroundRoot.parent = this.m_UIRoot;
        
        this.m_UINormalRoot = new Node("UI_Normal");     // 普通层（主界面、主菜单）
        this.m_UINormalRoot.parent = this.m_UIRoot;
        
        this.m_UIPopupRoot = new Node("UI_Popup");       // 弹出层（设置、商城）
        this.m_UIPopupRoot.parent = this.m_UIRoot;
        
        this.m_UITipsRoot = new Node("UI_Tips");         // 提示层（飘字提示）
        this.m_UITipsRoot.parent = this.m_UIRoot;
        
        this.m_UISystemRoot = new Node("UI_System");        // 系统层（加载、断线重连）
        this.m_UISystemRoot.parent = this.m_UIRoot;
        
        this.m_UITopRoot = new Node("UI_Top");           // 最高层（GM命令、截屏提示）
        this.m_UITopRoot.parent = this.m_UIRoot;
    }

    public GetUIRootByUILayer(layer:UILayer):Node {
        var uiRoot:Node = null
        switch(layer){
            case UILayer.Background:
                uiRoot = this.m_UIBackgroundRoot
                break
            case UILayer.Normal:
                uiRoot = this.m_UINormalRoot
                break
            case UILayer.PopUp:
                uiRoot = this.m_UIPopupRoot
                break
            case UILayer.Tips:
                uiRoot = this.m_UITipsRoot
                break
            case UILayer.System:
                uiRoot = this.m_UISystemRoot
                break
            case UILayer.TopMost:
                uiRoot = this.m_UITopRoot
                break
        }

        return uiRoot
    }

    //通过面板唯一ID关闭界面
    public ClosePanelByID(panelID: number):Boolean {
        var node = this.m_PanelNodeMap.get(panelID);
        if(node){
            var nodeScript = node.getComponent(UIBase);
            if(nodeScript){
                nodeScript.OnClose();
            }
            node.removeFromParent();
            node.destroy();
            this.m_PanelNodeMap.delete(panelID);
            return true;
        }

        return false;
    }

    //通过面板唯一ID隐藏界面
    public HidePanelByID(panelID: number):Boolean {
        var node = this.m_PanelNodeMap.get(panelID);
        if(node){
            var nodeScript = node.getComponent(UIBase);
            if(nodeScript){
                nodeScript.OnClose();
            }
            node.active = false
            return true;
        }

        return false;
    }

    //通过UIID关闭界面组
    //根据界面缓存个数关闭多余的界面
    public ClosePanel(id: UIID): Boolean {
        var uidata = UIDataSet.FindUIData(id);
        var datas = this.m_PanelDataMap.get(id);
        if(datas && uidata){
            var closeCount = datas.length - uidata.cacheCount
            if(closeCount > 0){
                //关闭多于缓存数量设置的界面
                for(var i:number = 0; i < closeCount; ++i){
                    var pID = datas.pop()
                    this.ClosePanelByID(pID);
                }

                this.m_PanelDataMap.set(id, datas);
            }
            
            datas.forEach(pID =>{
                //隐藏界面
                this.HidePanelByID(pID);
            });
            return true;
        }

        return false;
    }

    //通过UIID打开界面，可传参数
    public OpenPanel(id: UIID, ...args: any[]):number {
        var uidata = UIDataSet.FindUIData(id);
        if(uidata == null || uidata == undefined){
            return 0;
        }

        var temp = this.CheckPanel(id);
        if(temp > 0){
            return temp;
        }

            
        var pID = this.m_PanelID
        resources.load(uidata.prefabPath, Prefab, (err, prefab)=>{
            var root = this.GetUIRootByUILayer(uidata.layer)
            if(root == null){
                return 0;
            }

            var uiNode = instantiate(prefab);
            uiNode.parent = root;
            uiNode.setPosition(0, 0);
            uiNode.active = true
            var uiScript = uiNode.getComponent(UIBase);
            if(uiScript){
                uiScript.m_PanelID = this.m_PanelID;
                uiScript.m_UIID = id;
                uiScript.OnInit();
                uiScript.OnOpen(...args);
            }

            var uiDatas = this.m_PanelDataMap.get(id);
            if(uiDatas){
                uiDatas.push(this.m_PanelID);
                this.m_PanelDataMap.set(id, uiDatas);
            }
            else{
                var arr = new Array();
                arr.push(this.m_PanelID);
                this.m_PanelDataMap.set(id, arr);
            }

            this.m_PanelNodeMap.set(this.m_PanelID, uiNode);
            ++this.m_PanelID;
        });
            
        return pID;
    }

    //检查UIID面板是否已打开
    private CheckPanel(id: UIID):number{
        var uiDatas = this.m_PanelDataMap.get(id);
        if(uiDatas == null || uiDatas == undefined){
            return 0;
        }

        var rID = 0;
        var temp = new Array<number>();
        uiDatas.forEach(panelID => {
            var panelNode = this.m_PanelNodeMap.get(panelID);
            if(panelNode){
                if(panelNode.active == false){
                    panelNode.active = true;
                    var uiScript = panelNode.getComponent(UIBase);
                    if(uiScript){
                        uiScript.m_PanelID = panelID;
                        uiScript.m_UIID = id;
                        uiScript.OnOpen();
                    }
                    rID = panelID;
                }
                else{
                    var uidata = UIDataSet.FindUIData(id);
                    if(uidata && uidata.showMode == UIShowMode.Single){
                        rID = panelID;
                    }
                }
            }
            else{
                temp.push(panelID);
            }
        });

        temp.forEach(pID => {
            uiDatas.filter(v => v !== pID);
        });

        return rID;
    }
}


