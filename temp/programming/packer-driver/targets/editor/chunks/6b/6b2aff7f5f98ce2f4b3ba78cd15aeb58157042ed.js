System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Button, instantiate, PageView, Prefab, resources, UITransform, UIBase, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _crd, ccclass, property, PageType, MainPanel;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfUIBase(extras) {
    _reporterNs.report("UIBase", "../Core/UIBase", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Button = _cc.Button;
      instantiate = _cc.instantiate;
      PageView = _cc.PageView;
      Prefab = _cc.Prefab;
      resources = _cc.resources;
      UITransform = _cc.UITransform;
    }, function (_unresolved_2) {
      UIBase = _unresolved_2.UIBase;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ea5e5mJV7VOVr7BGYii9KiJ", "MainPanel-001", undefined);

      __checkObsolete__(['__private', '_decorator', 'Button', 'Component', 'instantiate', 'Layout', 'Node', 'PageView', 'Prefab', 'ProgressBar', 'resources', 'Slider', 'SpriteFrame', 'UITransform']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("PageType", PageType = /*#__PURE__*/function (PageType) {
        PageType["ShopPage"] = "ShopPage";
        PageType["AchievePage"] = "AchievePage";
        PageType["GamePage"] = "GamePage";
        PageType["ChanllengePage"] = "ChallengePage";
        PageType["RankingPage"] = "RankingPage";
        return PageType;
      }({}));

      _export("MainPanel", MainPanel = (_dec = ccclass('MainPanel'), _dec2 = property(PageView), _dec3 = property([Button]), _dec(_class = (_class2 = class MainPanel extends (_crd && UIBase === void 0 ? (_reportPossibleCrUseOfUIBase({
        error: Error()
      }), UIBase) : UIBase) {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "m_PageView", _descriptor, this);

          _initializerDefineProperty(this, "m_FuncBtns", _descriptor2, this);

          this.m_PageNodeMap = new Map();
          this.m_CurPageIndex = 2;
          this.m_PageName = [];
          this.m_pageNodeArr = [];
          this.m_LastPageIndex = 2;
        }

        onOpen(...args) {
          this.m_PageName[0] = PageType.ShopPage;
          this.m_PageName[1] = PageType.AchievePage;
          this.m_PageName[2] = PageType.GamePage;
          this.m_PageName[3] = PageType.ChanllengePage;
          this.m_PageName[4] = PageType.RankingPage;
          this.initUI();
        }

        onClose() {}

        initUI() {
          this.m_PageNodeMap.clear();
          var rect = this.m_PageView.view.getBoundingBox();
          this.m_pageNodeArr = this.m_PageView.getPages();
          this.m_pageNodeArr.forEach((node, index, arr) => {
            var uit = node.getComponent(UITransform);

            if (uit) {
              uit.setContentSize(rect.size);
            }
          });
          var pageCount = this.m_pageNodeArr.length - 1;
          this.m_PageView.setCurrentPageIndex(this.m_CurPageIndex);
          this.m_PageView.scrollToPage(this.m_CurPageIndex);
          this.showPage(this.m_CurPageIndex, 2);
          this.m_LastPageIndex = 2;
          this.m_FuncBtns.forEach((button, index) => {
            button.node.on('click', () => {
              console.log("1:index = " + index + " m_LastPageIndex = " + this.m_LastPageIndex + " m_CurPageIndex = " + this.m_CurPageIndex);

              if (index == this.m_LastPageIndex) {
                return;
              }

              if (this.m_LastPageIndex < index) {
                this.m_CurPageIndex += 1;

                if (this.m_CurPageIndex > pageCount) {
                  this.m_CurPageIndex = pageCount;
                }
              } else if (this.m_LastPageIndex > index) {
                this.m_CurPageIndex -= 1;

                if (this.m_CurPageIndex < 0) {
                  this.m_CurPageIndex = 0;
                }
              }

              this.m_LastPageIndex = index;
              console.log("2:index = " + index + " m_LastPageIndex = " + this.m_LastPageIndex + " m_CurPageIndex = " + this.m_CurPageIndex);
              this.showPage(this.m_CurPageIndex, index);
            });
          });
        }

        showPage(rootIdx, nameIdx) {
          if (rootIdx >= this.m_pageNodeArr.length) {
            return;
          }

          var curRoot = this.m_pageNodeArr[rootIdx];
          var pageName = this.m_PageName[nameIdx];
          resources.load("ui/" + pageName, Prefab, (err, prefab) => {
            var tNode = instantiate(prefab);
            this.addPage(curRoot, tNode);
            this.m_PageView.scrollToPage(this.m_CurPageIndex);
          });
        }

        addPage(root, uiNode) {
          if (root && uiNode) {
            root.children.forEach((node, index, arr) => {
              if (node) {
                var pageScript = node.getComponent(_crd && UIBase === void 0 ? (_reportPossibleCrUseOfUIBase({
                  error: Error()
                }), UIBase) : UIBase);

                if (pageScript) {
                  pageScript.onClose();
                }

                node.removeFromParent();
                node.destroy();
              }
            });
            var pScript = uiNode.getComponent(_crd && UIBase === void 0 ? (_reportPossibleCrUseOfUIBase({
              error: Error()
            }), UIBase) : UIBase);

            if (pScript) {
              pScript.onOpen();
            }

            root.addChild(uiNode);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "m_PageView", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "m_FuncBtns", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return [];
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=6b2aff7f5f98ce2f4b3ba78cd15aeb58157042ed.js.map