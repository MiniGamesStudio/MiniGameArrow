System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, BoxCollider2D, color, Component, instantiate, Node, resources, Sprite, SpriteFrame, tween, UITransform, Flower, EventManager, FlowerEvent, FlowerConst, FlowerPosition, _dec, _dec2, _class, _class2, _descriptor, _class3, _crd, ccclass, property, FlowerPlatform;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfFlower(extras) {
    _reporterNs.report("Flower", "./Flower", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEventManager(extras) {
    _reporterNs.report("EventManager", "../Core/EventManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFlowerEvent(extras) {
    _reporterNs.report("FlowerEvent", "../Game/FlowerGame/FlowerEvent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFlowerConst(extras) {
    _reporterNs.report("FlowerConst", "../Game/FlowerGame/FlowerConst", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFlowerPosition(extras) {
    _reporterNs.report("FlowerPosition", "../Game/FlowerGame/FlowerLevelModel", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      BoxCollider2D = _cc.BoxCollider2D;
      color = _cc.color;
      Component = _cc.Component;
      instantiate = _cc.instantiate;
      Node = _cc.Node;
      resources = _cc.resources;
      Sprite = _cc.Sprite;
      SpriteFrame = _cc.SpriteFrame;
      tween = _cc.tween;
      UITransform = _cc.UITransform;
    }, function (_unresolved_2) {
      Flower = _unresolved_2.Flower;
    }, function (_unresolved_3) {
      EventManager = _unresolved_3.EventManager;
    }, function (_unresolved_4) {
      FlowerEvent = _unresolved_4.FlowerEvent;
    }, function (_unresolved_5) {
      FlowerConst = _unresolved_5.FlowerConst;
    }, function (_unresolved_6) {
      FlowerPosition = _unresolved_6.FlowerPosition;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1d91754ySdJrYQYeh4eXucR", "FlowerPlatform", undefined);

      __checkObsolete__(['_decorator', 'BoxCollider2D', 'color', 'Component', 'instantiate', 'Node', 'resources', 'Sprite', 'SpriteFrame', 'tween', 'UITransform']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 花盆平台组件 — 管理花盆布局、花朵初始化和消除判定
       */

      _export("FlowerPlatform", FlowerPlatform = (_dec = ccclass('FlowerPlatform'), _dec2 = property(Node), _dec(_class = (_class2 = (_class3 = class FlowerPlatform extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "m_PlatFormRoot", _descriptor, this);

          this.m_FlowerMoveRoot = null;
          this.m_FlowerPotMap = new Map();
          this.m_FlowerPotTagIndexMap = new Map();
          this.m_FlowerPotTagDataMap = new Map();
        }

        // ==================== 消除逻辑 ====================
        checkFlowerDissolve(flowerTag) {
          if (!flowerTag) return;
          var flowerpot = this.m_FlowerPotMap.get(flowerTag);
          if (!flowerpot) return;
          var flowerRoot = flowerpot.getChildByName("FlowerRootLight");

          if (!flowerRoot) {
            this.onLayerCleared(flowerpot, flowerTag);
            return;
          }

          var flowers = flowerRoot.getComponentsInChildren(_crd && Flower === void 0 ? (_reportPossibleCrUseOfFlower({
            error: Error()
          }), Flower) : Flower);

          if (!flowers || flowers.length <= 0) {
            this.onLayerCleared(flowerpot, flowerTag);
            return;
          }

          if (flowers.length < (_crd && FlowerConst === void 0 ? (_reportPossibleCrUseOfFlowerConst({
            error: Error()
          }), FlowerConst) : FlowerConst).FLOWER_MATCH_COUNT) return;
          var firstID = flowers[0].getFlowerID();
          var allSame = flowers.every(f => f.getFlowerID() === firstID);

          if (allSame) {
            this.dissolveFlowers(flowers, flowerpot, flowerTag);
          }
        }

        dissolveFlowers(flowers, flowerpot, flowerTag) {
          var completed = 0;
          var total = flowers.length;
          flowers.forEach(flower => {
            var flowerNode = flower.node;
            if (!flowerNode) return;
            tween(flowerNode).to((_crd && FlowerConst === void 0 ? (_reportPossibleCrUseOfFlowerConst({
              error: Error()
            }), FlowerConst) : FlowerConst).FLOWER_DISSOLVE_DURATION, {
              angle: 0
            }, {
              onComplete: target => {
                if (target) {
                  target.removeFromParent();
                  target.destroy();
                }
              }
            }).call(() => {
              completed++;

              if (completed >= total) {
                this.onLayerCleared(flowerpot, flowerTag);
              }
            }).start();
          });
        }

        onLayerCleared(flowerpot, flowerTag) {
          var flowerRootBlack = flowerpot.getChildByName("FlowerRootBlack");

          if (flowerRootBlack) {
            var blackFlowers = flowerRootBlack.getComponentsInChildren(_crd && Flower === void 0 ? (_reportPossibleCrUseOfFlower({
              error: Error()
            }), Flower) : Flower);

            if (blackFlowers && blackFlowers.length > 0) {
              var _this$m_FlowerPotTagI;

              var idx = ((_this$m_FlowerPotTagI = this.m_FlowerPotTagIndexMap.get(flowerTag)) != null ? _this$m_FlowerPotTagI : 0) + 1;
              this.m_FlowerPotTagIndexMap.set(flowerTag, idx);
              var flowerData = this.m_FlowerPotTagDataMap.get(flowerTag);

              if (flowerData && idx < flowerData.length) {
                this.initFlowers(flowerTag, flowerData, idx, flowerpot);
              }
            }
          }

          if (this.checkVictory()) {
            (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
              error: Error()
            }), EventManager) : EventManager).getInstance().emit((_crd && FlowerEvent === void 0 ? (_reportPossibleCrUseOfFlowerEvent({
              error: Error()
            }), FlowerEvent) : FlowerEvent).CheckVictory);
          }
        }

        checkVictory() {
          for (var [, pot] of this.m_FlowerPotMap) {
            if (!pot) continue;
            var flowerRoot = pot.getChildByName("FlowerRootLight");
            if (!flowerRoot) continue;
            var flowers = flowerRoot.getComponentsInChildren(_crd && Flower === void 0 ? (_reportPossibleCrUseOfFlower({
              error: Error()
            }), Flower) : Flower);
            if (flowers && flowers.length > 0) return false;
          }

          return true;
        } // ==================== 初始化 ====================


        InitPlatForm(raw, platFormNum, data, flowerMoveRoot) {
          this.m_FlowerPotMap.clear();
          this.m_FlowerPotTagIndexMap.clear();
          this.m_FlowerPotTagDataMap.clear();
          this.m_FlowerMoveRoot = flowerMoveRoot;
          if (!data) return;
          this.m_PlatFormRoot.active = false;

          for (var i = 0; i < platFormNum; i++) {
            var clone = instantiate(this.m_PlatFormRoot);
            if (!clone) continue;
            var fpNum = platFormNum > 1 ? data.FlowerPot[raw][i] : data.FlowerPot[raw];
            this.initFlowerPot(fpNum, data.FlowerArr[raw][i], clone);
            clone.active = true;
            this.node.addChild(clone);
          }
        }

        initFlowerPot(flowerPotNum, data, platFormClone) {
          var _platFormClone$getChi;

          if (!data) return;
          var flowerPotRoot = platFormClone.getChildByName("FlowerPotRoot");
          var flowerPotLayout = flowerPotRoot == null ? void 0 : flowerPotRoot.getChildByName("FlowerPotLayout");
          if (!flowerPotLayout) return;
          flowerPotLayout.active = false;

          for (var i = 0; i < flowerPotNum; i++) {
            var _collider$tag;

            var layoutClone = instantiate(flowerPotLayout);
            if (!layoutClone) continue;
            var collider = layoutClone.getComponent(BoxCollider2D);

            if (collider) {
              FlowerPlatform.s_FlowerPotTag++;
              collider.tag = FlowerPlatform.s_FlowerPotTag;
            }

            var tag = (_collider$tag = collider == null ? void 0 : collider.tag) != null ? _collider$tag : 0;
            this.m_FlowerPotMap.set(tag, layoutClone);
            this.m_FlowerPotTagIndexMap.set(tag, 0);
            this.m_FlowerPotTagDataMap.set(tag, data[i]);
            this.initFlowers(tag, data[i], 0, layoutClone);
            layoutClone.active = true;
            flowerPotRoot.addChild(layoutClone);
          }

          var platUITrans = (_platFormClone$getChi = platFormClone.getChildByName("Platform")) == null ? void 0 : _platFormClone$getChi.getComponent(UITransform);

          if (platUITrans) {
            var size = platUITrans.contentSize;
            platUITrans.setContentSize(size.width * flowerPotNum, size.height);
          }
        }

        initFlowers(tag, data, idx, potLayout) {
          if (!potLayout) return;
          var blackRoot = potLayout.getChildByName("FlowerRootBlack");

          if (data.length >= idx + 1) {
            this.setFlowerData(blackRoot, tag, data[idx + 1], true);
            if (blackRoot) blackRoot.active = true;
          } else if (blackRoot) {
            blackRoot.active = false;
          }

          var lightRoot = potLayout.getChildByName("FlowerRootLight");

          if (data.length >= idx) {
            this.setFlowerData(lightRoot, tag, data[idx], false);
            if (lightRoot) lightRoot.active = true;
          } else if (lightRoot) {
            lightRoot.active = false;
          }
        }

        setFlowerData(flowerRoot, tag, data, isBlack) {
          if (!flowerRoot) return;
          flowerRoot.active = false;
          var slots = [["Left", data == null ? void 0 : data.left, (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Left], ["Mid", data == null ? void 0 : data.mid, (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Mid], ["Right", data == null ? void 0 : data.right, (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Right]];

          for (var [name, imgId, pos] of slots) {
            var slot = flowerRoot.getChildByName(name);
            if (!slot) continue;

            if (imgId) {
              slot.active = true;
              this.createFlowerNode(slot, imgId, pos, tag, isBlack);
            } else {
              slot.active = false;
            }
          }

          flowerRoot.active = true;
        }

        createFlowerNode(root, imgId, imgPos, tag, isBlack) {
          if (!root || !imgId) return;
          root.removeAllChildren();
          var imgNode = new Node();

          if (imgPos === (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Left) {
            imgNode.name = "FlowerImgLeft";
            imgNode.setRotationFromEuler((_crd && FlowerConst === void 0 ? (_reportPossibleCrUseOfFlowerConst({
              error: Error()
            }), FlowerConst) : FlowerConst).FLOWER_ROTATION_LEFT);
          } else if (imgPos === (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Right) {
            imgNode.name = "FlowerImgRight";
            imgNode.setRotationFromEuler((_crd && FlowerConst === void 0 ? (_reportPossibleCrUseOfFlowerConst({
              error: Error()
            }), FlowerConst) : FlowerConst).FLOWER_ROTATION_RIGHT);
          } else {
            imgNode.name = "FlowerImgMid";
          }

          imgNode.active = false;
          var uiTrans = imgNode.getComponent(UITransform);
          if (!uiTrans) uiTrans = imgNode.addComponent(UITransform);
          uiTrans.setAnchorPoint(0.5, 0);
          var sprite = imgNode.addComponent(Sprite);
          resources.load((_crd && FlowerConst === void 0 ? (_reportPossibleCrUseOfFlowerConst({
            error: Error()
          }), FlowerConst) : FlowerConst).RES_PATH.FLOWERS + imgId + "/spriteFrame", SpriteFrame, (err, sp) => {
            if (sp) sprite.spriteFrame = sp;
            var flowerScript = imgNode.getComponent(_crd && Flower === void 0 ? (_reportPossibleCrUseOfFlower({
              error: Error()
            }), Flower) : Flower);
            if (!flowerScript) flowerScript = imgNode.addComponent(_crd && Flower === void 0 ? (_reportPossibleCrUseOfFlower({
              error: Error()
            }), Flower) : Flower);
            flowerScript.init(imgId, root, this.m_FlowerMoveRoot, imgPos, (_crd && FlowerConst === void 0 ? (_reportPossibleCrUseOfFlowerConst({
              error: Error()
            }), FlowerConst) : FlowerConst).FLOWER_ROTATION_LEFT, (_crd && FlowerConst === void 0 ? (_reportPossibleCrUseOfFlowerConst({
              error: Error()
            }), FlowerConst) : FlowerConst).FLOWER_ROTATION_RIGHT, tag, isBlack);
            sprite.color = isBlack ? color(60, 60, 60, 255) : color(255, 255, 255, 255);
            imgNode.active = true;
          });
          root.addChild(imgNode);
        }

      }, _class3.s_FlowerPotTag = 0, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "m_PlatFormRoot", [_dec2], {
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
//# sourceMappingURL=c49cca4f2e70ea229467afa8ec4c50f60abd4fc4.js.map