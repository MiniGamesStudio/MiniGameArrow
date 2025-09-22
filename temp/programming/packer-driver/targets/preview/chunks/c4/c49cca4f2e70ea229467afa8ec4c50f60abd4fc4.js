System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, instantiate, Node, resources, Sprite, SpriteFrame, UITransform, Vec3, Flower, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, FlowerName, FlowerPlatform;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfFlower(extras) {
    _reporterNs.report("Flower", "./Flower", _context.meta, extras);
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
      instantiate = _cc.instantiate;
      Node = _cc.Node;
      resources = _cc.resources;
      Sprite = _cc.Sprite;
      SpriteFrame = _cc.SpriteFrame;
      UITransform = _cc.UITransform;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      Flower = _unresolved_2.Flower;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "1d91754ySdJrYQYeh4eXucR", "FlowerPlatform", undefined);

      __checkObsolete__(['_decorator', 'Camera', 'Component', 'director', 'EventTouch', 'Input', 'input', 'instantiate', 'Node', 'resources', 'Scene', 'Sprite', 'SpriteFrame', 'sys', 'tween', 'UIOpacity', 'UITransform', 'Vec2', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("FlowerName", FlowerName = /*#__PURE__*/function (FlowerName) {
        FlowerName["FlowerLeft"] = "FlowerLeft";
        FlowerName["FlowerRight"] = "FlowerRight";
        FlowerName["FlowerMid"] = "FlowerMid";
        return FlowerName;
      }({}));

      _export("FlowerPlatform", FlowerPlatform = (_dec = ccclass('FlowerPlatform'), _dec2 = property(Node), _dec(_class = (_class2 = class FlowerPlatform extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "m_PlatFormRoot", _descriptor, this);

          this.m_RotationLeft = new Vec3(0, 0, 25);
          this.m_RotationRight = new Vec3(0, 0, -25);
          this.m_FlowerMoveRoot = null;
        }

        start() {}

        onDestroy() {}

        InitPlatForm(raw, platFormNum, data, flowerMoveRoot) {
          this.m_FlowerMoveRoot = flowerMoveRoot;

          if (data) {
            this.m_PlatFormRoot.active = false;

            for (var i = 0; i < platFormNum; ++i) {
              var platFormRootClone = instantiate(this.m_PlatFormRoot);

              if (platFormRootClone) {
                var fpNum = data.FlowerPot[raw];

                if (platFormNum > 1) {
                  fpNum = data.FlowerPot[raw][i];
                }

                this.InitFlowerPot(fpNum, data.FlowerArr[raw][i], platFormRootClone);
                platFormRootClone.active = true;
                this.node.addChild(platFormRootClone);
              }
            }
          }
        }

        InitFlowerPot(flowerPotNum, data, platFormRootClone) {
          if (data) {
            var flowerPotRoot = platFormRootClone.getChildByName("FlowerPotRoot");
            var flowerPotLayout = flowerPotRoot.getChildByName("FlowerPotLayout");

            if (flowerPotLayout) {
              flowerPotLayout.active = false;

              for (var i = 0; i < flowerPotNum; ++i) {
                var flowerPotLayoutClone = instantiate(flowerPotLayout);

                if (flowerPotLayoutClone) {
                  this.InitFlowers(data[i], flowerPotLayoutClone);
                  flowerPotLayoutClone.active = true;
                  flowerPotRoot.addChild(flowerPotLayoutClone);
                }
              }
            }

            var platFormUITrans = platFormRootClone.getChildByName("Platform").getComponent(UITransform);

            if (platFormUITrans) {
              var cSize = platFormUITrans.contentSize;
              platFormUITrans.setContentSize(cSize.width * flowerPotNum, cSize.height);
            }
          }
        }

        InitFlowers(data, flowerPotLayoutClone) {
          if (flowerPotLayoutClone) {
            var flowerRootBlack = flowerPotLayoutClone.getChildByName("FlowerRootBlack");

            if (data.length >= 1) {
              this.setFlowerData(flowerRootBlack, data[1]);
            }

            flowerRootBlack.active = false;
            var flowerRootLight = flowerPotLayoutClone.getChildByName("FlowerRootLight");
            this.setFlowerData(flowerRootLight, data[0]);
          }
        }

        setFlowerData(flowerRoot, data) {
          if (data === void 0) {
            data = null;
          }

          if (flowerRoot == null) {
            return;
          }

          flowerRoot.active = false;
          var left = flowerRoot.getChildByName("Left");

          if (data && data.left) {
            left.active = true;
            this.setImg(left, data.left, -1);
          } else {
            left.active = false;
          }

          var mid = flowerRoot.getChildByName("Mid");

          if (data && data.mid) {
            mid.active = true;
            this.setImg(mid, data.mid, 0);
          } else {
            mid.active = false;
          }

          var right = flowerRoot.getChildByName("Right");

          if (data && data.right) {
            right.active = true;
            this.setImg(right, data.right, 1);
          } else {
            right.active = false;
          }

          flowerRoot.active = true;
        } //imgPos: 0-中间 1-右边 -1-左边


        setImg(root, imgId, imgPos) {
          var img = null;

          if (root == null || root == undefined) {
            return;
          }

          if (imgId == null || imgId == undefined) {
            root.active = false;
            return;
          }

          root.removeAllChildren();
          var imgNode = new Node();

          if (imgNode) {
            imgNode.name = "FlowerImgMid";

            if (imgPos == -1) {
              imgNode.name = "FlowerImgLeft";
              imgNode.setRotationFromEuler(this.m_RotationLeft);
            } else if (imgPos == 1) {
              imgNode.name = "FlowerImgRight";
              imgNode.setRotationFromEuler(this.m_RotationRight);
            }

            var flowerScript = imgNode.getComponent(_crd && Flower === void 0 ? (_reportPossibleCrUseOfFlower({
              error: Error()
            }), Flower) : Flower);

            if (flowerScript == null || flowerScript == undefined) {
              flowerScript = imgNode.addComponent(_crd && Flower === void 0 ? (_reportPossibleCrUseOfFlower({
                error: Error()
              }), Flower) : Flower);
            }

            flowerScript.init(root, this.m_FlowerMoveRoot, imgPos, this.m_RotationLeft, this.m_RotationRight);
            imgNode.active = false;
            var uiTrans = imgNode.getComponent(UITransform);

            if (uiTrans == null || uiTrans == undefined) {
              uiTrans = imgNode.addComponent(UITransform);
            }

            if (uiTrans) {
              uiTrans.setAnchorPoint(0.5, 0);
            }

            img = imgNode.addComponent(Sprite);

            if (img) {
              if (imgId != "") {
                resources.load("flowers/" + imgId + "/spriteFrame", SpriteFrame, (err, sp) => {
                  if (sp) {
                    img.spriteFrame = sp;
                  }

                  imgNode.active = true;
                });
              }
            }

            root.addChild(imgNode);
          }
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "m_PlatFormRoot", [_dec2], {
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