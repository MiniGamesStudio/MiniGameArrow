System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, resources, Prefab, instantiate, UIManager, UIID, _dec, _class, _crd, ccclass, property, UIBase;

  function _reportPossibleCrUseOfUIManager(extras) {
    _reporterNs.report("UIManager", "./UIManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIID(extras) {
    _reporterNs.report("UIID", "../UIScripts/UIData", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      resources = _cc.resources;
      Prefab = _cc.Prefab;
      instantiate = _cc.instantiate;
    }, function (_unresolved_2) {
      UIManager = _unresolved_2.UIManager;
    }, function (_unresolved_3) {
      UIID = _unresolved_3.UIID;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f7720YoTB9DTZFTu7EsgTFf", "UIBase", undefined);

      __checkObsolete__(['_decorator', 'Button', 'Component', 'resources', 'Prefab', 'instantiate', 'Node']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * UI 基类 — 所有面板的父类，提供生命周期钩子和子页面管理
       */

      _export("UIBase", UIBase = (_dec = ccclass('UIBase'), _dec(_class = class UIBase extends Component {
        constructor() {
          super(...arguments);
          this.m_PanelID = 0;
          this.m_UIID = (_crd && UIID === void 0 ? (_reportPossibleCrUseOfUIID({
            error: Error()
          }), UIID) : UIID).None;
          this.m_SubPageMap = new Map();
        }

        /** 初始化（仅首次创建时调用） */
        OnInit() {}
        /** 打开面板（每次显示时调用） */


        OnOpen() {}
        /** 关闭面板 */


        OnClose() {
          this.m_SubPageMap.forEach((value, key) => {
            if (value) {
              this.DetachUIPage(key, value);
            }
          });
        }
        /** 关闭自身 */


        CloseSelf() {
          if (this.m_UIID) {
            (_crd && UIManager === void 0 ? (_reportPossibleCrUseOfUIManager({
              error: Error()
            }), UIManager) : UIManager).GetInstance().ClosePanel(this.m_UIID);
          }
        }
        /** 安全绑定按钮事件（自动移除旧监听） */


        SetBtnEvent(btn, callback, eventName) {
          if (eventName === void 0) {
            eventName = "click";
          }

          if (btn) {
            btn.node.off(eventName);
            btn.node.on(eventName, callback);
          }
        }
        /** 加载子页面（pageName 唯一标识） */


        AttachUIPage(root, pageName, prefabPath) {
          for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
            args[_key - 3] = arguments[_key];
          }

          if (!root) return;
          var subPageNode = this.m_SubPageMap.get(pageName);

          if (subPageNode) {
            subPageNode.active = true;
            var uiScript = subPageNode.getComponent(UIBase);

            if (uiScript) {
              uiScript.OnOpen(...args);
            }

            return;
          }

          resources.load(prefabPath, Prefab, (err, prefab) => {
            if (err || !root || !root.isValid) return;
            var pageNode = instantiate(prefab);
            pageNode.parent = root;
            pageNode.setPosition(0, 0);
            pageNode.active = true;
            var uiScript = pageNode.getComponent(UIBase);

            if (uiScript) {
              uiScript.OnInit();
              uiScript.OnOpen(...args);
            }

            this.m_SubPageMap.set(pageName, pageNode);
          });
        }
        /** 卸载子页面 */


        DetachUIPage(subPageName, subPageNode) {
          if (!subPageNode) return;
          var uiScript = subPageNode.getComponent(UIBase);

          if (uiScript) {
            uiScript.OnClose();
          }

          subPageNode.removeFromParent();
          subPageNode.destroy();
          this.m_SubPageMap.delete(subPageName);
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f4f4d932e16d653770d45c2ce4c4de4daaa34eac.js.map