System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2", "__unresolved_3", "__unresolved_4", "__unresolved_5", "__unresolved_6", "__unresolved_7", "__unresolved_8"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Button, instantiate, JsonAsset, Node, Prefab, resources, UIBase, UIManager, EventManager, FlowerPlatform, FlowerUIID, FlowerEvent, FlowerConst, FlowerGameState, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, GamePanel;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'transform-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfUIBase(extras) {
    _reporterNs.report("UIBase", "../Core/UIBase", _context.meta, extras);
  }

  function _reportPossibleCrUseOfUIManager(extras) {
    _reporterNs.report("UIManager", "../Core/UIManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfEventManager(extras) {
    _reporterNs.report("EventManager", "../Core/EventManager", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFlowerPlatform(extras) {
    _reporterNs.report("FlowerPlatform", "./FlowerPlatform", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFlowerUIID(extras) {
    _reporterNs.report("FlowerUIID", "../Game/FlowerGame/FlowerUIConfig", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFlowerEvent(extras) {
    _reporterNs.report("FlowerEvent", "../Game/FlowerGame/FlowerEvent", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFlowerConst(extras) {
    _reporterNs.report("FlowerConst", "../Game/FlowerGame/FlowerConst", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFlowerGameState(extras) {
    _reporterNs.report("FlowerGameState", "../Game/FlowerGame/FlowerGameState", _context.meta, extras);
  }

  function _reportPossibleCrUseOfFlowerLevelData(extras) {
    _reporterNs.report("FlowerLevelData", "../Game/FlowerGame/FlowerLevelModel", _context.meta, extras);
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
      JsonAsset = _cc.JsonAsset;
      Node = _cc.Node;
      Prefab = _cc.Prefab;
      resources = _cc.resources;
    }, function (_unresolved_2) {
      UIBase = _unresolved_2.UIBase;
    }, function (_unresolved_3) {
      UIManager = _unresolved_3.UIManager;
    }, function (_unresolved_4) {
      EventManager = _unresolved_4.EventManager;
    }, function (_unresolved_5) {
      FlowerPlatform = _unresolved_5.FlowerPlatform;
    }, function (_unresolved_6) {
      FlowerUIID = _unresolved_6.FlowerUIID;
    }, function (_unresolved_7) {
      FlowerEvent = _unresolved_7.FlowerEvent;
    }, function (_unresolved_8) {
      FlowerConst = _unresolved_8.FlowerConst;
    }, function (_unresolved_9) {
      FlowerGameState = _unresolved_9.FlowerGameState;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ea5e5mJV7VOVr7BGYii9KiJ", "GamePanel", undefined);

      __checkObsolete__(['_decorator', 'Button', 'instantiate', 'JsonAsset', 'Node', 'Prefab', 'resources']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("GamePanel", GamePanel = (_dec = ccclass('GamePanel'), _dec2 = property(Button), _dec3 = property(Node), _dec4 = property(Node), _dec(_class = (_class2 = class GamePanel extends (_crd && UIBase === void 0 ? (_reportPossibleCrUseOfUIBase({
        error: Error()
      }), UIBase) : UIBase) {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "m_CloseBtn", _descriptor, this);

          _initializerDefineProperty(this, "m_LevelRoot", _descriptor2, this);

          _initializerDefineProperty(this, "m_FlowerImgMoveRoot", _descriptor3, this);

          this.m_FlowerPlatformArr = [];
          this.m_CurLevelData = null;
        }

        OnInit() {}

        OnOpen() {
          var em = (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
            error: Error()
          }), EventManager) : EventManager).getInstance();
          em.on((_crd && FlowerEvent === void 0 ? (_reportPossibleCrUseOfFlowerEvent({
            error: Error()
          }), FlowerEvent) : FlowerEvent).FlowerDissolve, this.onCheckFlowerDissolve, this);
          em.on((_crd && FlowerEvent === void 0 ? (_reportPossibleCrUseOfFlowerEvent({
            error: Error()
          }), FlowerEvent) : FlowerEvent).CheckVictory, this.onCheckVictory, this);
          em.on((_crd && FlowerEvent === void 0 ? (_reportPossibleCrUseOfFlowerEvent({
            error: Error()
          }), FlowerEvent) : FlowerEvent).RetryLevel, this.onRetryLevel, this);
          em.on((_crd && FlowerEvent === void 0 ? (_reportPossibleCrUseOfFlowerEvent({
            error: Error()
          }), FlowerEvent) : FlowerEvent).NextLevel, this.onNextLevel, this);
          this.initUI();
        }

        OnClose() {
          super.OnClose();
          (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
            error: Error()
          }), EventManager) : EventManager).getInstance().offAllByTarget(this);
        }

        onNextLevel() {
          this.initGameLevel((_crd && FlowerGameState === void 0 ? (_reportPossibleCrUseOfFlowerGameState({
            error: Error()
          }), FlowerGameState) : FlowerGameState).getInstance().currentLevel + 1);
        }

        onRetryLevel() {
          this.initGameLevel((_crd && FlowerGameState === void 0 ? (_reportPossibleCrUseOfFlowerGameState({
            error: Error()
          }), FlowerGameState) : FlowerGameState).getInstance().currentLevel);
        }

        onCheckFlowerDissolve(flowerTag) {
          this.m_FlowerPlatformArr.forEach(fp => fp.checkFlowerDissolve(flowerTag));
        }

        onCheckVictory() {
          if (!this.m_CurLevelData) return;
          var allVictory = this.m_FlowerPlatformArr.every(fp => fp.checkVictory());

          if (allVictory) {
            (_crd && FlowerGameState === void 0 ? (_reportPossibleCrUseOfFlowerGameState({
              error: Error()
            }), FlowerGameState) : FlowerGameState).getInstance().completeLevel();
            (_crd && UIManager === void 0 ? (_reportPossibleCrUseOfUIManager({
              error: Error()
            }), UIManager) : UIManager).GetInstance().OpenPanel((_crd && FlowerUIID === void 0 ? (_reportPossibleCrUseOfFlowerUIID({
              error: Error()
            }), FlowerUIID) : FlowerUIID).VictoryPanel, true);
          }
        }

        initUI() {
          this.SetBtnEvent(this.m_CloseBtn, () => {
            (_crd && UIManager === void 0 ? (_reportPossibleCrUseOfUIManager({
              error: Error()
            }), UIManager) : UIManager).GetInstance().ClosePanel((_crd && FlowerUIID === void 0 ? (_reportPossibleCrUseOfFlowerUIID({
              error: Error()
            }), FlowerUIID) : FlowerUIID).VictoryPanel);
            (_crd && UIManager === void 0 ? (_reportPossibleCrUseOfUIManager({
              error: Error()
            }), UIManager) : UIManager).GetInstance().OpenPanel((_crd && FlowerUIID === void 0 ? (_reportPossibleCrUseOfFlowerUIID({
              error: Error()
            }), FlowerUIID) : FlowerUIID).VictoryPanel);
          });
          this.initGameLevel((_crd && FlowerGameState === void 0 ? (_reportPossibleCrUseOfFlowerGameState({
            error: Error()
          }), FlowerGameState) : FlowerGameState).getInstance().currentLevel);
        }

        initGameLevel(level) {
          var state = (_crd && FlowerGameState === void 0 ? (_reportPossibleCrUseOfFlowerGameState({
            error: Error()
          }), FlowerGameState) : FlowerGameState).getInstance();
          state.currentLevel = level;
          state.resetRuntimeState();
          resources.load((_crd && FlowerConst === void 0 ? (_reportPossibleCrUseOfFlowerConst({
            error: Error()
          }), FlowerConst) : FlowerConst).RES_PATH.LEVEL_DATA + level, JsonAsset, (err, jsonAsset) => {
            if (err) {
              console.warn("GamePanel: \u52A0\u8F7D\u5173\u5361 " + level + " \u5931\u8D25", err);
              return;
            }

            this.m_CurLevelData = jsonAsset.json;
            this.m_LevelRoot.removeAllChildren();
            resources.load((_crd && FlowerConst === void 0 ? (_reportPossibleCrUseOfFlowerConst({
              error: Error()
            }), FlowerConst) : FlowerConst).RES_PATH.FLOWER_PLATFORM, Prefab, (err, prefab) => {
              if (err || !prefab) return;
              (_crd && FlowerPlatform === void 0 ? (_reportPossibleCrUseOfFlowerPlatform({
                error: Error()
              }), FlowerPlatform) : FlowerPlatform).s_FlowerPotTag = 0;
              this.m_FlowerPlatformArr = [];

              for (var i = 0; i < this.m_CurLevelData.FlowerRow; i++) {
                var node = instantiate(prefab);
                this.m_LevelRoot.addChild(node);
                var script = node.getComponent(_crd && FlowerPlatform === void 0 ? (_reportPossibleCrUseOfFlowerPlatform({
                  error: Error()
                }), FlowerPlatform) : FlowerPlatform);

                if (script) {
                  script.InitPlatForm(i, this.m_CurLevelData.FlowerPlatform[i], this.m_CurLevelData, this.m_FlowerImgMoveRoot);
                  this.m_FlowerPlatformArr.push(script);
                }
              }

              (_crd && EventManager === void 0 ? (_reportPossibleCrUseOfEventManager({
                error: Error()
              }), EventManager) : EventManager).getInstance().emit((_crd && FlowerEvent === void 0 ? (_reportPossibleCrUseOfFlowerEvent({
                error: Error()
              }), FlowerEvent) : FlowerEvent).LevelLoaded, level);
            });
          });
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "m_CloseBtn", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "m_LevelRoot", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "m_FlowerImgMoveRoot", [_dec4], {
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
//# sourceMappingURL=7c3afa6f72cc51142efdd7377aaf9dd6b0d4b395.js.map