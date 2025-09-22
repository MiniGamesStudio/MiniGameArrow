System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Button, instantiate, Node, Prefab, resources, tween, Vec3, view, UIBase, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, PageType, MainPanel;

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
      Node = _cc.Node;
      Prefab = _cc.Prefab;
      resources = _cc.resources;
      tween = _cc.tween;
      Vec3 = _cc.Vec3;
      view = _cc.view;
    }, function (_unresolved_2) {
      UIBase = _unresolved_2.UIBase;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "3fdc007f/1Pm7WvHL+IB1+z", "MainPanel", undefined);

      __checkObsolete__(['__private', '_decorator', 'Button', 'Component', 'instantiate', 'Layout', 'math', 'Node', 'PageView', 'Prefab', 'ProgressBar', 'resources', 'Slider', 'SpriteFrame', 'Tween', 'tween', 'UITransform', 'Vec3', 'view']);

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

      _export("MainPanel", MainPanel = (_dec = ccclass('MainPanel'), _dec2 = property([Button]), _dec3 = property(Node), _dec4 = property(Node), _dec(_class = (_class2 = class MainPanel extends (_crd && UIBase === void 0 ? (_reportPossibleCrUseOfUIBase({
        error: Error()
      }), UIBase) : UIBase) {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "m_FuncBtns", _descriptor, this);

          _initializerDefineProperty(this, "m_PageOne", _descriptor2, this);

          _initializerDefineProperty(this, "m_PageTwo", _descriptor3, this);

          this.m_CurPage = null;
          this.m_OtherPage = null;
          this.m_LastIndex = 2;
          this.m_IsScrollingPage = false;
          this.m_ScreenWidth = 0;
          this.m_CurTween = null;
          this.m_OtherTween = null;
          this.m_PageName = [];
        }

        onOpen() {
          this.m_PageName[0] = PageType.ShopPage;
          this.m_PageName[1] = PageType.AchievePage;
          this.m_PageName[2] = PageType.GamePage;
          this.m_PageName[3] = PageType.ChanllengePage;
          this.m_PageName[4] = PageType.RankingPage;
          this.initUI();
        }

        onClose() {}

        onDestroy() {
          if (this.m_CurTween) {
            this.m_CurTween.stop();
          }

          if (this.m_OtherTween) {
            this.m_OtherTween.stop();
          }
        }

        initUI() {
          var screenSize = view.getVisibleSize();
          this.m_ScreenWidth = screenSize.width;
          this.m_PageOne.setPosition(0, 0);
          var pageName = this.m_PageName[2];
          resources.load("ui/" + pageName, Prefab, (err, prefab) => {
            var tNode = instantiate(prefab);
            this.addPage(this.m_PageOne, tNode);
          });
          this.m_PageTwo.setPosition(this.m_ScreenWidth, 0);
          this.m_CurPage = this.m_PageOne;
          this.m_OtherPage = this.m_PageTwo;
          this.m_FuncBtns.forEach((button, index) => {
            button.node.on('click', () => {
              if (index == this.m_LastIndex || this.m_IsScrollingPage) {
                return;
              }

              this.m_IsScrollingPage = true;
              var screenSize = view.getVisibleSize();
              this.m_ScreenWidth = screenSize.width;
              var moveDis = 0;

              if (this.m_LastIndex < index) {
                this.m_OtherPage.setPosition(this.m_ScreenWidth, 0);
                moveDis = -this.m_ScreenWidth;
              } else if (this.m_LastIndex > index) {
                this.m_OtherPage.setPosition(-this.m_ScreenWidth, 0);
                moveDis = this.m_ScreenWidth;
              }

              this.m_LastIndex = index;
              var pageName = this.m_PageName[index];
              resources.load("ui/" + pageName, Prefab, (err, prefab) => {
                var tNode = instantiate(prefab);
                this.addPage(this.m_OtherPage, tNode);
                this.m_OtherTween = tween(this.m_OtherPage).by(0.5, {
                  position: new Vec3(moveDis, 0, 0)
                }).start();
                this.m_CurTween = tween(this.m_CurPage).by(0.5, {
                  position: new Vec3(moveDis, 0, 0)
                }).call(() => {
                  var temp = this.m_CurPage;
                  this.m_CurPage = this.m_OtherPage;
                  this.m_OtherPage = temp;
                  this.m_IsScrollingPage = false;
                }).start();
              });
            });
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

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "m_FuncBtns", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "m_PageOne", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "m_PageTwo", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=f04001876c2cf6efe0483ee782f1e8f0501b0a31.js.map