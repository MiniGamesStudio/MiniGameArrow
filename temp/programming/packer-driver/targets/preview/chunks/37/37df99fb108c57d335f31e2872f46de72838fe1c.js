System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Node, tween, UITransform, Vec3, _dec, _class, _crd, ccclass, property, Flower;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      tween = _cc.tween;
      UITransform = _cc.UITransform;
      Vec3 = _cc.Vec3;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c5053iqd3hKyZKZviDDVrit", "Flower", undefined);

      __checkObsolete__(['_decorator', 'Component', 'EventTouch', 'Node', 'tween', 'UITransform', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("Flower", Flower = (_dec = ccclass('Flower'), _dec(_class = class Flower extends Component {
        constructor() {
          super(...arguments);
          this.m_FlowerFlySpeed = 1000;
          this.m_FlowerStartPos = Vec3.ZERO;
          this.m_RotationLeft = Vec3.ZERO;
          this.m_RotationRight = Vec3.ZERO;
          this.m_FlowerRoot = null;
          this.m_FlowerMoveRoot = null;
          this.m_FlowerMoveRootUIT = null;
          this.m_FlowerMoveOffsetY = 0;
          this.m_IsDragingFlower = false;
          this.m_ImgPos = 0;
          this.m_IsFlowerDoAni = false;
        }

        //imgPos: 0-中间 1-右边 -1-左边
        init(flowerRoot, flowerMoveRoot, imgPos, rLeft, rRight) {
          this.m_IsDragingFlower = false;
          this.m_FlowerRoot = flowerRoot;
          this.m_FlowerMoveRoot = flowerMoveRoot;

          if (this.m_FlowerMoveRoot) {
            this.m_FlowerMoveRootUIT = this.m_FlowerMoveRoot.getComponent(UITransform);
          }

          this.m_ImgPos = imgPos;
          this.m_RotationLeft = rLeft;
          this.m_RotationRight = rRight;
        }

        start() {
          this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this, true);
          this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
          this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
          this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this, true);
        }

        onDestroy() {
          this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
          this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
          this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
          this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        }

        onTouchStart(event) {
          if (this.m_IsDragingFlower || this.m_IsFlowerDoAni) {
            return;
          }

          if (event.target) {
            /*
            this.m_IsDragingFlower = true;                    
            this.m_FlowerMoveOffsetY = event.target.getComponent(UITransform).contentSize.height * 0.6;
            event.target.parent = this.m_FlowerMoveRoot;     
            this.m_FlowerStartPos = this.m_FlowerRoot.getWorldPosition(); 
            var touchPos = event.touch.getUILocation();             
            var flowerStartPos = this.m_FlowerMoveRootUIT.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
            event.target.setPosition(flowerStartPos.x, flowerStartPos.y - this.m_FlowerMoveOffsetY);
            event.target.setRotationFromEuler(new Vec3(0, 0, 0));
            */
          }
        }

        onTouchMove(event) {
          if (this.m_IsDragingFlower == false && event.target) {
            this.m_IsDragingFlower = true;
            this.m_FlowerMoveOffsetY = event.target.getComponent(UITransform).contentSize.height * 0.6;
            event.target.parent = this.m_FlowerMoveRoot;
            this.m_FlowerStartPos = this.m_FlowerRoot.getWorldPosition();
            var touchPos = event.touch.getUILocation();
            var flowerStartPos = this.m_FlowerMoveRootUIT.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
            event.target.setPosition(flowerStartPos.x, flowerStartPos.y - this.m_FlowerMoveOffsetY);
            event.target.setRotationFromEuler(new Vec3(0, 0, 0));
          }

          if (!this.m_IsDragingFlower || this.m_IsFlowerDoAni) {
            return;
          }

          if (event.target) {
            var delta = event.getUIDelta(); // 移动花朵节点

            var pos = event.target.position;
            event.target.setPosition(pos.x + delta.x, pos.y + delta.y);
          }
        }

        onTouchEnd(event) {
          if (!this.m_IsDragingFlower || this.m_IsFlowerDoAni) {
            return;
          }

          if (event.target) {
            var flowerEndPos = event.target.getWorldPosition();
            this.m_IsFlowerDoAni = true;
            var temp = Math.abs(this.m_FlowerStartPos.x - flowerEndPos.x) + Math.abs(this.m_FlowerStartPos.y - flowerEndPos.y);
            this.m_FlowerStartPos.subtract(flowerEndPos);
            tween(event.target).by(temp / this.m_FlowerFlySpeed, {
              position: this.m_FlowerStartPos
            }).call(() => {
              this.m_IsFlowerDoAni = false;
              this.m_IsDragingFlower = false;
              this.node.setRotationFromEuler(Vec3.ZERO);

              if (this.m_ImgPos == -1) {
                this.node.setRotationFromEuler(this.m_RotationLeft);
              } else if (this.m_ImgPos == 1) {
                this.node.setRotationFromEuler(this.m_RotationRight);
              }

              this.node.parent = this.m_FlowerRoot;
              this.node.setPosition(Vec3.ZERO);
            }).start();
          } else {
            this.m_IsDragingFlower = false;
          }
        }

        onTouchCancel(event) {
          this.onTouchEnd(event);
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=37df99fb108c57d335f31e2872f46de72838fe1c.js.map