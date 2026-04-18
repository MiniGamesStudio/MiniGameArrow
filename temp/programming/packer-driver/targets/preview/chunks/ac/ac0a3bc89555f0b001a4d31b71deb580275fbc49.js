System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, instantiate, Node, Prefab, resources, UIDataRegistry, UIShowMode, UILayer, UIBase, _dec, _class, _class2, _crd, ccclass, UIManager;

  function _reportPossibleCrUseOfUIDataRegistry(extras) {
    _reporterNs.report("UIDataRegistry", "./UIData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIShowMode(extras) {
    _reporterNs.report("UIShowMode", "./UIData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUILayer(extras) {
    _reporterNs.report("UILayer", "./UIData", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIBase(extras) {
    _reporterNs.report("UIBase", "./UIBase", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      instantiate = _cc.instantiate;
      Node = _cc.Node;
      Prefab = _cc.Prefab;
      resources = _cc.resources;
    }, function (_unresolved_2) {
      UIDataRegistry = _unresolved_2.UIDataRegistry;
      UIShowMode = _unresolved_2.UIShowMode;
      UILayer = _unresolved_2.UILayer;
    }, function (_unresolved_3) {
      UIBase = _unresolved_3.UIBase;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "42236IlKF5GmKpcyoxvUKae", "UIManager", undefined);

      __checkObsolete__(['_decorator', 'instantiate', 'Node', 'Prefab', 'resources']);

      ({
        ccclass
      } = _decorator);
      /**
       * UI 管理器 — 管理面板的打开、关闭、缓存和分层
       * 纯框架级，不依赖任何业务代码
       */

      _export("UIManager", UIManager = (_dec = ccclass('UIManager'), _dec(_class = (_class2 = class UIManager {
        constructor() {
          this.m_PanelID = 1;
          this.m_UIRoot = null;

          /** uiID -> 面板唯一ID数组 */
          this.m_PanelDataMap = new Map();

          /** 面板唯一ID -> UI节点 */
          this.m_PanelNodeMap = new Map();

          /** 各层级根节点 */
          this.m_LayerRoots = new Map();
        }

        static GetInstance() {
          if (this.m_Instance == null) {
            this.m_Instance = new UIManager();
          }

          return this.m_Instance;
        }

        Init(uiRoot) {
          this.m_UIRoot = uiRoot;
          this.m_PanelDataMap.clear();
          this.m_PanelNodeMap.clear();
          var layers = [[(_crd && UILayer === void 0 ? (_reportPossibleCrUseOfUILayer({
            error: Error()
          }), UILayer) : UILayer).Background, "UI_Background"], [(_crd && UILayer === void 0 ? (_reportPossibleCrUseOfUILayer({
            error: Error()
          }), UILayer) : UILayer).Normal, "UI_Normal"], [(_crd && UILayer === void 0 ? (_reportPossibleCrUseOfUILayer({
            error: Error()
          }), UILayer) : UILayer).PopUp, "UI_Popup"], [(_crd && UILayer === void 0 ? (_reportPossibleCrUseOfUILayer({
            error: Error()
          }), UILayer) : UILayer).Tips, "UI_Tips"], [(_crd && UILayer === void 0 ? (_reportPossibleCrUseOfUILayer({
            error: Error()
          }), UILayer) : UILayer).System, "UI_System"], [(_crd && UILayer === void 0 ? (_reportPossibleCrUseOfUILayer({
            error: Error()
          }), UILayer) : UILayer).TopMost, "UI_Top"]];
          layers.forEach(_ref => {
            var [layer, name] = _ref;
            var node = new Node(name);
            node.parent = this.m_UIRoot;
            this.m_LayerRoots.set(layer, node);
          });
        }

        GetUIRootByUILayer(layer) {
          var _this$m_LayerRoots$ge;

          return (_this$m_LayerRoots$ge = this.m_LayerRoots.get(layer)) != null ? _this$m_LayerRoots$ge : null;
        }
        /** 通过面板唯一ID关闭并销毁界面 */


        ClosePanelByID(panelID) {
          var node = this.m_PanelNodeMap.get(panelID);
          if (!node) return false;
          var script = node.getComponent(_crd && UIBase === void 0 ? (_reportPossibleCrUseOfUIBase({
            error: Error()
          }), UIBase) : UIBase);
          if (script) script.OnClose();
          node.removeFromParent();
          node.destroy();
          this.m_PanelNodeMap.delete(panelID);
          return true;
        }
        /** 通过面板唯一ID隐藏界面 */


        HidePanelByID(panelID) {
          var node = this.m_PanelNodeMap.get(panelID);
          if (!node) return false;
          var script = node.getComponent(_crd && UIBase === void 0 ? (_reportPossibleCrUseOfUIBase({
            error: Error()
          }), UIBase) : UIBase);
          if (script) script.OnClose();
          node.active = false;
          return true;
        }
        /** 通过 uiID 关闭界面组 */


        ClosePanel(id) {
          var uidata = (_crd && UIDataRegistry === void 0 ? (_reportPossibleCrUseOfUIDataRegistry({
            error: Error()
          }), UIDataRegistry) : UIDataRegistry).FindUIData(id);
          var datas = this.m_PanelDataMap.get(id);
          if (!datas || !uidata) return false;
          var closeCount = datas.length - uidata.cacheCount;

          for (var i = 0; i < closeCount; i++) {
            var pID = datas.pop();

            if (pID !== undefined) {
              this.ClosePanelByID(pID);
            }
          }

          datas.forEach(pID => this.HidePanelByID(pID));
          this.m_PanelDataMap.set(id, datas);
          return true;
        }
        /** 通过 uiID 打开界面 */


        OpenPanel(id) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          var uidata = (_crd && UIDataRegistry === void 0 ? (_reportPossibleCrUseOfUIDataRegistry({
            error: Error()
          }), UIDataRegistry) : UIDataRegistry).FindUIData(id);
          if (!uidata) return 0;
          var existingID = this.CheckPanel(id, args);
          if (existingID > 0) return existingID;
          var pID = this.m_PanelID;
          resources.load(uidata.prefabPath, Prefab, (err, prefab) => {
            if (err) {
              console.warn("UIManager: \u52A0\u8F7D\u9762\u677F\u5931\u8D25 [" + uidata.name + "]", err);
              return;
            }

            var root = this.GetUIRootByUILayer(uidata.layer);
            if (!root) return;
            var uiNode = instantiate(prefab);
            uiNode.parent = root;
            uiNode.setPosition(0, 0);
            uiNode.active = true;
            var uiScript = uiNode.getComponent(_crd && UIBase === void 0 ? (_reportPossibleCrUseOfUIBase({
              error: Error()
            }), UIBase) : UIBase);

            if (uiScript) {
              uiScript.m_PanelID = this.m_PanelID;
              uiScript.m_UIID = id;
              uiScript.OnInit();
              uiScript.OnOpen(...args);
            }

            var uiDatas = this.m_PanelDataMap.get(id);

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

        CheckPanel(id, args) {
          var uiDatas = this.m_PanelDataMap.get(id);
          if (!uiDatas || uiDatas.length === 0) return 0;
          var rID = 0;
          var invalidIDs = [];

          for (var panelID of uiDatas) {
            var panelNode = this.m_PanelNodeMap.get(panelID);

            if (!panelNode) {
              invalidIDs.push(panelID);
              continue;
            }

            if (!panelNode.active) {
              panelNode.active = true;
              var uiScript = panelNode.getComponent(_crd && UIBase === void 0 ? (_reportPossibleCrUseOfUIBase({
                error: Error()
              }), UIBase) : UIBase);

              if (uiScript) {
                uiScript.OnOpen(...args);
              }

              rID = panelID;
              break;
            } else {
              var uidata = (_crd && UIDataRegistry === void 0 ? (_reportPossibleCrUseOfUIDataRegistry({
                error: Error()
              }), UIDataRegistry) : UIDataRegistry).FindUIData(id);

              if (uidata && uidata.showMode === (_crd && UIShowMode === void 0 ? (_reportPossibleCrUseOfUIShowMode({
                error: Error()
              }), UIShowMode) : UIShowMode).Single) {
                rID = panelID;
                break;
              }
            }
          }

          if (invalidIDs.length > 0) {
            var invalidSet = new Set(invalidIDs);
            var filtered = uiDatas.filter(v => !invalidSet.has(v));
            this.m_PanelDataMap.set(id, filtered);
          }

          return rID;
        }

      }, _class2.m_Instance = null, _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ac0a3bc89555f0b001a4d31b71deb580275fbc49.js.map