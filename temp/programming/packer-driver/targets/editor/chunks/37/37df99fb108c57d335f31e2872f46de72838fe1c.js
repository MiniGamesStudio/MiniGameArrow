System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, BoxCollider2D, Component, Contact2DType, Node, tween, UITransform, Vec2, Vec3, CustomClientEvent, EventManager, GameConst, FlowerPosition, SLOT_NAMES, SLOT_PRIORITY, _dec, _class, _crd, ccclass, property, Flower;

  function _reportPossibleCrUseOfCustomClientEvent(extras) {
    _reporterNs.report("CustomClientEvent", "../Config/Config", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEventManager(extras) {
    _reporterNs.report("EventManager", "../Core/EventManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfGameConst(extras) {
    _reporterNs.report("GameConst", "../Config/GameConst", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFlowerPosition(extras) {
    _reporterNs.report("FlowerPosition", "../Model/LevelModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSLOT_NAMES(extras) {
    _reporterNs.report("SLOT_NAMES", "../Model/LevelModel", _context.meta, extras);
  }

  function _reportPossibleCrUseOfSLOT_PRIORITY(extras) {
    _reporterNs.report("SLOT_PRIORITY", "../Model/LevelModel", _context.meta, extras);
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
      Component = _cc.Component;
      Contact2DType = _cc.Contact2DType;
      Node = _cc.Node;
      tween = _cc.tween;
      UITransform = _cc.UITransform;
      Vec2 = _cc.Vec2;
      Vec3 = _cc.Vec3;
    }, function (_unresolved_2) {
      CustomClientEvent = _unresolved_2.CustomClientEvent;
    }, function (_unresolved_3) {
      EventManager = _unresolved_3.EventManager;
    }, function (_unresolved_4) {
      GameConst = _unresolved_4.GameConst;
    }, function (_unresolved_5) {
      FlowerPosition = _unresolved_5.FlowerPosition;
      SLOT_NAMES = _unresolved_5.SLOT_NAMES;
      SLOT_PRIORITY = _unresolved_5.SLOT_PRIORITY;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "c5053iqd3hKyZKZviDDVrit", "Flower", undefined);

      __checkObsolete__(['_decorator', 'BoxCollider2D', 'Collider2D', 'Component', 'Contact2DType', 'EventTouch', 'Node', 'tween', 'UITransform', 'Vec2', 'Vec3']);

      ({
        ccclass,
        property
      } = _decorator);
      /**
       * 花朵组件 — 处理拖拽、碰撞检测和花盆匹配
       */

      _export("Flower", Flower = (_dec = ccclass('Flower'), _dec(_class = class Flower extends Component {
        constructor(...args) {
          super(...args);
          this.m_FlowerStartPos = Vec3.ZERO;
          this.m_FlowerUITransform = null;
          this.m_FlowerRoot = null;
          this.m_FlowerMoveRoot = null;
          this.m_FlowerMoveRootUIT = null;
          this.m_FlowerMoveOffsetY = 0;
          this.m_IsDragging = false;
          this.m_IsAnimating = false;
          this.m_ImgPos = (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Mid;
          this.m_BoxCollider2D = null;
          this.m_FlowerTag = 0;
          this.m_FlowerId = "";
          this.m_IsBlack = false;
          // 碰撞目标信息
          this.m_IsChangePot = false;
          this.m_TargetImgPos = (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Mid;
          this.m_TargetStartPos = Vec3.ZERO;
          this.m_TargetFlowerRoot = null;
          this.m_TargetFlowerTag = 0;
          this.m_SelfCollider = null;
          this.m_OtherCollider = null;
          this.m_ContactTags = [];
        }

        getFlowerID() {
          return this.m_FlowerId;
        }

        init(imgId, flowerRoot, flowerMoveRoot, imgPos, rLeft, rRight, tag, isBlack) {
          this.m_IsBlack = isBlack;
          this.m_FlowerId = imgId;
          this.m_FlowerTag = tag;
          this.m_IsDragging = false;
          this.m_FlowerRoot = flowerRoot;
          this.m_FlowerMoveRoot = flowerMoveRoot;
          this.m_FlowerMoveRootUIT = flowerMoveRoot == null ? void 0 : flowerMoveRoot.getComponent(UITransform);
          this.m_ImgPos = imgPos;
          this.m_ContactTags = [];
        }

        start() {
          this.m_FlowerUITransform = this.node.getComponent(UITransform);

          if (!this.m_IsBlack) {
            this.registerTouchEvents();
          }
        }

        onDestroy() {
          this.unregisterTouchEvents();
        }

        registerTouchEvents() {
          this.unregisterTouchEvents();
          this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this, true);
          this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
          this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
          this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this, true);
        }

        unregisterTouchEvents() {
          this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
          this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
          this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
          this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        } // ==================== 碰撞检测 ====================


        onBeginContact(selfCollider, otherCollider) {
          this.m_ContactTags.push(otherCollider.tag);
          this.m_SelfCollider = selfCollider;
          this.m_OtherCollider = otherCollider;
          this.tryFindEmptySlot(selfCollider, otherCollider);
        }

        onEndContact(selfCollider, otherCollider) {
          let allCleared = true;

          for (let i = 0; i < this.m_ContactTags.length; i++) {
            if (this.m_ContactTags[i] === otherCollider.tag) {
              this.m_ContactTags[i] = -1;
            } else if (this.m_ContactTags[i] > 0) {
              allCleared = false;
            }
          }

          if (allCleared) {
            this.m_ContactTags = [];
            this.m_SelfCollider = null;
            this.m_OtherCollider = null;
            this.m_IsChangePot = false;
          }
        }
        /**
         * 核心优化：用优先级表替代三段重复的 if-else
         * 根据花朵落点位置，按优先级查找空槽
         */


        tryFindEmptySlot(selfCollider, otherCollider) {
          if (!otherCollider) return;
          const light = otherCollider.node.getChildByName("FlowerRootLight");
          if (!light) return;
          const detectedPos = this.detectImgPosition(selfCollider, otherCollider);
          const priority = (_crd && SLOT_PRIORITY === void 0 ? (_reportPossibleCrUseOfSLOT_PRIORITY({
            error: Error()
          }), SLOT_PRIORITY) : SLOT_PRIORITY)[detectedPos];

          for (const pos of priority) {
            const slotName = (_crd && SLOT_NAMES === void 0 ? (_reportPossibleCrUseOfSLOT_NAMES({
              error: Error()
            }), SLOT_NAMES) : SLOT_NAMES)[pos];
            const slot = light.getChildByName(slotName);

            if (slot && slot.children.length <= 0) {
              this.m_IsChangePot = true;
              this.m_TargetImgPos = pos;
              this.m_TargetStartPos = slot.getWorldPosition();
              this.m_TargetFlowerRoot = slot;
              this.m_TargetFlowerTag = otherCollider.tag;
              return;
            }
          }
        }
        /** 根据碰撞体位置判断花朵在花盆的左/中/右 */


        detectImgPosition(selfCollider, otherCollider) {
          if (!selfCollider || !otherCollider) return (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Mid;
          const threshold = otherCollider.worldAABB.size.width / 6;
          const deltaX = selfCollider.node.getWorldPosition().x - otherCollider.node.getWorldPosition().x;
          if (deltaX > threshold) return (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Right;
          if (deltaX < -threshold) return (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Left;
          return (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Mid;
        } // ==================== 触摸事件 ====================


        onTouchStart(event) {// 预留，目前不需要额外处理
        }

        onTouchMove(event) {
          if (!event.target) return; // 首次移动时开始拖拽

          if (!this.m_IsDragging) {
            if (this.m_IsAnimating) return;
            this.startDrag(event);
          }

          if (!this.m_IsDragging || this.m_IsAnimating) return;
          const delta = event.getUIDelta();
          const pos = event.target.position;
          event.target.setPosition(pos.x + delta.x, pos.y + delta.y);

          if (this.m_SelfCollider && this.m_OtherCollider) {
            this.tryFindEmptySlot(this.m_SelfCollider, this.m_OtherCollider);
          }
        }

        startDrag(event) {
          this.m_IsDragging = true;
          this.m_FlowerMoveOffsetY = this.m_FlowerUITransform.contentSize.height * (_crd && GameConst === void 0 ? (_reportPossibleCrUseOfGameConst({
            error: Error()
          }), GameConst) : GameConst).FLOWER_DRAG_OFFSET_RATIO;
          event.target.parent = this.m_FlowerMoveRoot;
          this.m_FlowerStartPos = this.m_FlowerRoot.getWorldPosition();
          const touchPos = event.touch.getUILocation();
          const localPos = this.m_FlowerMoveRootUIT.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
          event.target.setPosition(localPos.x, localPos.y - this.m_FlowerMoveOffsetY);
          event.target.setRotationFromEuler(Vec3.ZERO);
          this.setupDragCollider();
        }

        setupDragCollider() {
          this.m_BoxCollider2D = this.node.getComponent(BoxCollider2D);

          if (!this.m_BoxCollider2D) {
            this.m_BoxCollider2D = this.node.addComponent(BoxCollider2D);
            this.m_BoxCollider2D.sensor = true;
            this.m_BoxCollider2D.size.x = this.m_FlowerUITransform.contentSize.x * 0.5;
            this.m_BoxCollider2D.size.y = this.m_FlowerUITransform.contentSize.y;
            this.m_BoxCollider2D.offset = new Vec2(0, this.m_FlowerUITransform.contentSize.y / 2);
            this.m_BoxCollider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            this.m_BoxCollider2D.on(Contact2DType.END_CONTACT, this.onEndContact, this);
          }
        }

        onTouchEnd(event) {
          if (!this.m_IsDragging || this.m_IsAnimating) return;

          if (event.target) {
            const prevTag = this.m_FlowerTag;

            if (this.m_IsChangePot) {
              this.m_IsChangePot = false;
              this.m_ImgPos = this.m_TargetImgPos;
              this.m_FlowerStartPos = this.m_TargetStartPos;
              this.m_FlowerRoot = this.m_TargetFlowerRoot;
              this.m_FlowerTag = this.m_TargetFlowerTag;
            }

            this.animateFlowerBack(event.target, prevTag);
          } else {
            this.m_IsDragging = false;
          }

          this.cleanupDragCollider();
        }

        animateFlowerBack(target, prevTag) {
          const endPos = target.getWorldPosition();
          const dist = Math.abs(this.m_FlowerStartPos.x - endPos.x) + Math.abs(this.m_FlowerStartPos.y - endPos.y);
          const delta = this.m_FlowerStartPos.subtract(endPos);
          this.m_IsAnimating = true;
          tween(target).by(dist / (_crd && GameConst === void 0 ? (_reportPossibleCrUseOfGameConst({
            error: Error()
          }), GameConst) : GameConst).FLOWER_FLY_SPEED, {
            position: delta
          }).call(() => {
            this.m_IsAnimating = false;
            this.m_IsDragging = false;
            this.applyRotation();
            this.node.parent = this.m_FlowerRoot;
            this.node.setPosition(Vec3.ZERO);
            this.m_FlowerRoot.active = true;
            (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
              error: Error()
            }), EventManager) : EventManager).getInstance().emit((_crd && CustomClientEvent === void 0 ? (_reportPossibleCrUseOfCustomClientEvent({
              error: Error()
            }), CustomClientEvent) : CustomClientEvent).FlowerDissolve, prevTag);
            (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
              error: Error()
            }), EventManager) : EventManager).getInstance().emit((_crd && CustomClientEvent === void 0 ? (_reportPossibleCrUseOfCustomClientEvent({
              error: Error()
            }), CustomClientEvent) : CustomClientEvent).FlowerDissolve, this.m_FlowerTag);
          }).start();
        }

        applyRotation() {
          if (this.m_ImgPos === (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Left) {
            this.node.setRotationFromEuler((_crd && GameConst === void 0 ? (_reportPossibleCrUseOfGameConst({
              error: Error()
            }), GameConst) : GameConst).FLOWER_ROTATION_LEFT);
          } else if (this.m_ImgPos === (_crd && FlowerPosition === void 0 ? (_reportPossibleCrUseOfFlowerPosition({
            error: Error()
          }), FlowerPosition) : FlowerPosition).Right) {
            this.node.setRotationFromEuler((_crd && GameConst === void 0 ? (_reportPossibleCrUseOfGameConst({
              error: Error()
            }), GameConst) : GameConst).FLOWER_ROTATION_RIGHT);
          } else {
            this.node.setRotationFromEuler(Vec3.ZERO);
          }
        }

        cleanupDragCollider() {
          if (this.m_BoxCollider2D) {
            this.m_BoxCollider2D.destroy();
            this.m_BoxCollider2D = null;
          }
        }

      }) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=37df99fb108c57d335f31e2872f46de72838fe1c.js.map